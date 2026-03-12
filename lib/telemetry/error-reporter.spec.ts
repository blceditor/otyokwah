// REQ-P0-2: Error Telemetry and Monitoring - Error Reporter Tests
import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  classifyError,
  createErrorLog,
  logError,
  logRetry,
  calculateBackoffDelay,
  shouldRetryError,
  ErrorTracker,
  ErrorReporter,
  enrichErrorContext,
} from './error-reporter';

describe('REQ-P0-2 — Error Reporter Infrastructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Error Classification', () => {
    test('classifies network errors as transient', () => {
      const networkError = new Error('ECONNREFUSED: Connection refused');
      networkError.name = 'NetworkError';

      const classification = classifyError(networkError);

      expect(classification).toEqual({
        errorType: 'transient',
        retryable: true,
        category: 'network',
      });
    });

    test('classifies timeout errors as transient', () => {
      const timeoutError = new Error('Request timeout after 5000ms');
      timeoutError.name = 'TimeoutError';

      const classification = classifyError(timeoutError);

      expect(classification).toEqual({
        errorType: 'transient',
        retryable: true,
        category: 'timeout',
      });
    });

    test('classifies file not found errors as fatal', () => {
      const notFoundError = new Error('ENOENT: no such file or directory');
      notFoundError.name = 'FileNotFoundError';

      const classification = classifyError(notFoundError);

      expect(classification).toEqual({
        errorType: 'fatal',
        retryable: false,
        category: 'file-system',
      });
    });

    test('classifies YAML syntax errors as fatal', () => {
      const syntaxError = new Error('Invalid YAML: unexpected token at line 5');
      syntaxError.name = 'YAMLSyntaxError';

      const classification = classifyError(syntaxError);

      expect(classification).toEqual({
        errorType: 'fatal',
        retryable: false,
        category: 'syntax',
      });
    });

    test('classifies permission errors as fatal', () => {
      const permissionError = new Error('EACCES: permission denied');
      permissionError.name = 'PermissionError';

      const classification = classifyError(permissionError);

      expect(classification).toEqual({
        errorType: 'fatal',
        retryable: false,
        category: 'permission',
      });
    });

    test('classifies unknown errors as fatal by default', () => {
      const unknownError = new Error('Something went wrong');

      const classification = classifyError(unknownError);

      expect(classification).toEqual({
        errorType: 'fatal',
        retryable: false,
        category: 'unknown',
      });
    });
  });

  describe('Structured Error Logging', () => {
    test('creates structured error log with all required fields', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n  at test.ts:10:5';

      const log = createErrorLog(error, {
        source: 'keystatic-navigation',
        operation: 'read',
        function: 'getNavigation',
      });

      expect(log).toMatchObject({
        errorCode: expect.any(String),
        message: 'Test error',
        stack: expect.stringContaining('test.ts:10:5'),
        timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
        context: {
          source: 'keystatic-navigation',
          operation: 'read',
          function: 'getNavigation',
        },
        errorType: expect.any(String),
        retryable: expect.any(Boolean),
      });
    });

    test('generates unique error codes based on context', () => {
      const error1 = new Error('Read failed');
      const error2 = new Error('Write failed');

      const log1 = createErrorLog(error1, {
        source: 'keystatic-navigation',
        operation: 'read',
      });

      const log2 = createErrorLog(error2, {
        source: 'keystatic-navigation',
        operation: 'write',
      });

      expect(log1.errorCode).toBe('KEYSTATIC_READ_ERROR');
      expect(log2.errorCode).toBe('KEYSTATIC_WRITE_ERROR');
      expect(log1.errorCode).not.toBe(log2.errorCode);
    });

    test('includes error classification in log', () => {
      const networkError = new Error('ECONNREFUSED');
      networkError.name = 'NetworkError';

      const log = createErrorLog(networkError, {
        source: 'test',
        operation: 'fetch',
      });

      expect(log).toMatchObject({
        errorType: 'transient',
        retryable: true,
        category: 'network',
      });
    });

    test('handles errors without stack traces', () => {
      const error = new Error('No stack');
      delete error.stack;

      const log = createErrorLog(error, {
        source: 'test',
        operation: 'test',
      });

      expect(log.stack).toBe('No stack trace available');
    });

    test('includes timestamp in ISO 8601 format', () => {
      const error = new Error('Test');
      const log = createErrorLog(error, {
        source: 'test',
        operation: 'test',
      });

      expect(log.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      const logTime = new Date(log.timestamp).getTime();
      const now = Date.now();
      expect(now - logTime).toBeLessThan(1000);
    });

    test('includes additional context fields when provided', () => {
      const error = new Error('Test');
      const log = createErrorLog(error, {
        source: 'keystatic',
        operation: 'read',
        filePath: '/content/navigation.yaml',
        attemptNumber: 2,
        userId: 'user-123',
      });

      expect(log.context).toMatchObject({
        source: 'keystatic',
        operation: 'read',
        filePath: '/content/navigation.yaml',
        attemptNumber: 2,
        userId: 'user-123',
      });
    });
  });

  describe('Error Reporter API', () => {
    test('exports logError function', () => {
      expect(logError).toBeDefined();
      expect(typeof logError).toBe('function');
    });

    test('exports logRetry function', () => {
      expect(logRetry).toBeDefined();
      expect(typeof logRetry).toBe('function');
    });

    test('logError writes to console with structured format', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const error = new Error('Test error');
      const context = {
        source: 'test',
        operation: 'test-operation',
      };

      logError(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        expect.objectContaining({
          errorCode: expect.any(String),
          message: 'Test error',
          timestamp: expect.any(String),
          context: expect.objectContaining({
            source: 'test',
            operation: 'test-operation',
          }),
        })
      );

      consoleErrorSpy.mockRestore();
    });

    test('logRetry writes to console with retry information', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const retryInfo = {
        attempt: 2,
        maxAttempts: 3,
        delay: 200,
        error: { message: 'Network timeout' },
      };

      logRetry(retryInfo);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[RETRY]',
        expect.objectContaining({
          attempt: 2,
          maxAttempts: 3,
          delay: 200,
          nextRetryIn: '200ms',
          error: expect.objectContaining({
            message: 'Network timeout',
          }),
        })
      );

      consoleWarnSpy.mockRestore();
    });

    test('logError supports different log levels', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const error = new Error('Warning level error');

      logError(error, { source: 'test' }, { level: 'warn' });

      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });
  });

  describe('Retry Logic', () => {
    test('calculates exponential backoff delays correctly', () => {
      expect(calculateBackoffDelay(0)).toBe(100);
      expect(calculateBackoffDelay(1)).toBe(200);
      expect(calculateBackoffDelay(2)).toBe(400);
      expect(calculateBackoffDelay(3)).toBe(800);
    });

    test('caps backoff delay at maximum value', () => {
      const MAX_DELAY = 5000;

      expect(calculateBackoffDelay(10)).toBeLessThanOrEqual(MAX_DELAY);
      expect(calculateBackoffDelay(20)).toBeLessThanOrEqual(MAX_DELAY);
    });

    test('determines if error should be retried', () => {
      const transientError = new Error('Network timeout');
      transientError.name = 'NetworkError';

      const fatalError = new Error('Invalid syntax');
      fatalError.name = 'SyntaxError';

      expect(shouldRetryError(transientError, 0)).toBe(true);
      expect(shouldRetryError(transientError, 3)).toBe(false);
      expect(shouldRetryError(fatalError, 0)).toBe(false);
    });

    test('respects max retry attempts', () => {
      const networkError = new Error('Timeout');
      networkError.name = 'NetworkError';

      expect(shouldRetryError(networkError, 0)).toBe(true);
      expect(shouldRetryError(networkError, 1)).toBe(true);
      expect(shouldRetryError(networkError, 2)).toBe(true);
      expect(shouldRetryError(networkError, 3)).toBe(false);
    });
  });

  describe('Error Aggregation', () => {
    test('tracks error frequency for monitoring', () => {
      const tracker = new ErrorTracker();

      tracker.recordError('KEYSTATIC_READ_ERROR');
      tracker.recordError('KEYSTATIC_READ_ERROR');
      tracker.recordError('KEYSTATIC_WRITE_ERROR');

      const stats = tracker.getStats();

      expect(stats).toEqual({
        KEYSTATIC_READ_ERROR: 2,
        KEYSTATIC_WRITE_ERROR: 1,
      });
    });

    test('resets error counts after time window', () => {
      const tracker = new ErrorTracker({ windowMs: 100 });

      tracker.recordError('TEST_ERROR');
      expect(tracker.getCount('TEST_ERROR')).toBe(1);

      return new Promise((resolve) => {
        setTimeout(() => {
          expect(tracker.getCount('TEST_ERROR')).toBe(0);
          resolve(undefined);
        }, 150);
      });
    });

    test('provides error rate calculations', () => {
      const tracker = new ErrorTracker({ windowMs: 60000 });

      for (let i = 0; i < 10; i++) {
        tracker.recordError('TEST_ERROR');
      }

      const rate = tracker.getErrorRate('TEST_ERROR');

      expect(rate).toBeCloseTo(0.167, 2);
    });
  });

  describe('Integration with External Services', () => {
    test('supports pluggable error handlers', () => {
      const mockHandler = vi.fn();
      const reporter = new ErrorReporter({
        handlers: [mockHandler],
      });

      const error = new Error('Test');
      const context = { source: 'test' };

      reporter.logError(error, context);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test',
          context: { source: 'test' },
        })
      );
    });

    test('handles multiple error handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      const reporter = new ErrorReporter({
        handlers: [handler1, handler2],
      });

      const error = new Error('Test');
      reporter.logError(error, { source: 'test' });

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    test('continues logging even if one handler fails', () => {
      const failingHandler = vi.fn(() => {
        throw new Error('Handler failed');
      });
      const successHandler = vi.fn();

      const reporter = new ErrorReporter({
        handlers: [failingHandler, successHandler],
      });

      const error = new Error('Test');

      expect(() => reporter.logError(error, { source: 'test' })).not.toThrow();

      expect(failingHandler).toHaveBeenCalled();
      expect(successHandler).toHaveBeenCalled();
    });
  });

  describe('Error Context Enrichment', () => {
    test('enriches errors with environment information', () => {
      const context = enrichErrorContext({
        source: 'test',
        operation: 'read',
      });

      expect(context).toMatchObject({
        source: 'test',
        operation: 'read',
        environment: expect.any(String),
        nodeVersion: expect.stringMatching(/^v?\d+\.\d+\.\d+/),
        platform: expect.any(String),
      });
    });

    test('includes request context when available', () => {
      const mockRequest = {
        url: 'https://example.com/api/navigation',
        method: 'GET',
        headers: {
          'user-agent': 'Mozilla/5.0',
        },
      };

      const context = enrichErrorContext(
        {
          source: 'api',
          operation: 'fetch',
        },
        { request: mockRequest }
      );

      expect(context).toMatchObject({
        source: 'api',
        operation: 'fetch',
        request: {
          url: 'https://example.com/api/navigation',
          method: 'GET',
          userAgent: 'Mozilla/5.0',
        },
      });
    });

    test('sanitizes sensitive data from context', () => {
      const contextWithSecrets = {
        source: 'auth',
        operation: 'login',
        password: 'secret123',
        apiKey: 'sk-1234567890',
        token: 'bearer-token-xyz',
      };

      const sanitized = enrichErrorContext(contextWithSecrets);

      expect(sanitized).toMatchObject({
        source: 'auth',
        operation: 'login',
        password: '[REDACTED]',
        apiKey: '[REDACTED]',
        token: '[REDACTED]',
      });
    });
  });
});
