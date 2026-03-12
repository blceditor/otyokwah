// REQ-P0-2: Error Telemetry and Monitoring - Error Reporter Infrastructure

type ErrorClassification = {
  errorType: 'transient' | 'fatal';
  retryable: boolean;
  category: string;
};

type ErrorContext = {
  source: string;
  operation?: string;
  function?: string;
  filePath?: string;
  attemptNumber?: number;
  userId?: string;
  environment?: string;
  nodeVersion?: string;
  platform?: string;
  request?: {
    url: string;
    method: string;
    userAgent: string;
  };
  [key: string]: unknown;
};

type ErrorLog = {
  errorCode: string;
  message: string;
  stack: string;
  timestamp: string;
  context: ErrorContext;
  errorType: string;
  retryable: boolean;
  category: string;
};

type RetryInfo = {
  attempt: number;
  maxAttempts: number;
  delay: number;
  error: { message: string };
};

type LogOptions = {
  level?: 'error' | 'warn';
};

const MAX_BACKOFF_DELAY = 5000;
const MAX_RETRY_ATTEMPTS = 3;

const SENSITIVE_KEYS = ['password', 'apiKey', 'token', 'secret', 'authorization'];

/**
 * Classify an error as transient or fatal based on its type and message
 */
export function classifyError(error: Error): ErrorClassification {
  const errorName = error.name || '';
  const errorMessage = error.message || '';

  // Network errors are transient
  if (errorName === 'NetworkError' || errorMessage.includes('ECONNREFUSED')) {
    return {
      errorType: 'transient',
      retryable: true,
      category: 'network',
    };
  }

  // Timeout errors are transient
  if (errorName === 'TimeoutError' || errorMessage.includes('timeout')) {
    return {
      errorType: 'transient',
      retryable: true,
      category: 'timeout',
    };
  }

  // File not found errors are fatal
  if (errorName === 'FileNotFoundError' || errorMessage.includes('ENOENT')) {
    return {
      errorType: 'fatal',
      retryable: false,
      category: 'file-system',
    };
  }

  // YAML syntax errors are fatal
  if (errorName === 'YAMLSyntaxError' || errorMessage.includes('Invalid YAML')) {
    return {
      errorType: 'fatal',
      retryable: false,
      category: 'syntax',
    };
  }

  // Permission errors are fatal
  if (errorName === 'PermissionError' || errorMessage.includes('EACCES')) {
    return {
      errorType: 'fatal',
      retryable: false,
      category: 'permission',
    };
  }

  // Syntax errors are fatal
  if (errorName === 'SyntaxError') {
    return {
      errorType: 'fatal',
      retryable: false,
      category: 'syntax',
    };
  }

  // Unknown errors are fatal by default
  return {
    errorType: 'fatal',
    retryable: false,
    category: 'unknown',
  };
}

/**
 * Generate error code based on context
 */
function generateErrorCode(context: ErrorContext): string {
  // Extract first part of hyphenated source (e.g., 'keystatic-navigation' -> 'KEYSTATIC')
  const sourcePart = context.source.split('-')[0];
  const source = sourcePart.toUpperCase();
  const operation = context.operation?.toUpperCase() || 'UNKNOWN';
  return `${source}_${operation}_ERROR`;
}

/**
 * Sanitize sensitive data from context
 */
function sanitizeContext(context: ErrorContext): ErrorContext {
  const sanitized = { ...context };

  SENSITIVE_KEYS.forEach((key) => {
    if (key in sanitized) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Enrich error context with environment information
 */
export function enrichErrorContext(
  context: ErrorContext,
  options?: { request?: unknown }
): ErrorContext {
  const enriched = sanitizeContext(context);

  // Add environment info
  enriched.environment = process.env.NODE_ENV || 'development';
  enriched.nodeVersion = process.version;
  enriched.platform = process.platform;

  // Add request context if available
  if (options?.request) {
    const req = options.request as { url?: string; method?: string; headers?: Record<string, string> };
    enriched.request = {
      url: req.url || '',
      method: req.method || '',
      userAgent: req.headers?.['user-agent'] || '',
    };
  }

  return enriched;
}

/**
 * Create a structured error log
 */
export function createErrorLog(error: Error, context: ErrorContext): ErrorLog {
  const classification = classifyError(error);
  const errorCode = generateErrorCode(context);

  return {
    errorCode,
    message: error.message,
    stack: error.stack || 'No stack trace available',
    timestamp: new Date().toISOString(),
    context,
    errorType: classification.errorType,
    retryable: classification.retryable,
    category: classification.category,
  };
}

/**
 * Log an error to console
 */
export function logError(
  error: Error,
  context: ErrorContext,
  options?: LogOptions
): void {
  const errorLog = createErrorLog(error, context);
  const level = options?.level || 'error';

  if (level === 'warn') {
    console.warn('[ERROR]', errorLog);
  } else {
    console.error('[ERROR]', errorLog);
  }
}

/**
 * Log retry attempt information
 */
export function logRetry(retryInfo: RetryInfo): void {
  console.warn('[RETRY]', {
    ...retryInfo,
    nextRetryIn: `${retryInfo.delay}ms`,
  });
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(attempt: number): number {
  const baseDelay = 100;
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, MAX_BACKOFF_DELAY);
}

/**
 * Determine if an error should be retried
 */
export function shouldRetryError(error: Error, attemptNumber: number): boolean {
  // Don't retry if we've exhausted max attempts
  if (attemptNumber >= MAX_RETRY_ATTEMPTS) {
    return false;
  }

  // Check if error is retryable
  const classification = classifyError(error);
  return classification.retryable;
}

/**
 * Error tracker for aggregating and monitoring errors
 */
export class ErrorTracker {
  private errors: Map<string, { count: number; lastSeen: number }> = new Map();
  private windowMs: number;

  constructor(options: { windowMs?: number } = {}) {
    this.windowMs = options.windowMs || 60000; // Default 1 minute
  }

  recordError(errorCode: string): void {
    const now = Date.now();
    const existing = this.errors.get(errorCode);

    if (existing) {
      existing.count++;
      existing.lastSeen = now;
    } else {
      this.errors.set(errorCode, { count: 1, lastSeen: now });
    }
  }

  getStats(): Record<string, number> {
    this.cleanupExpired();
    const stats: Record<string, number> = {};

    for (const [code, data] of this.errors.entries()) {
      stats[code] = data.count;
    }

    return stats;
  }

  getCount(errorCode: string): number {
    this.cleanupExpired();
    return this.errors.get(errorCode)?.count || 0;
  }

  getErrorRate(errorCode: string): number {
    const count = this.getCount(errorCode);
    // Convert to errors per second
    return count / (this.windowMs / 1000);
  }

  private cleanupExpired(): void {
    const now = Date.now();
    const expiredCodes: string[] = [];

    for (const [code, data] of this.errors.entries()) {
      if (now - data.lastSeen > this.windowMs) {
        expiredCodes.push(code);
      }
    }

    expiredCodes.forEach((code) => this.errors.delete(code));
  }
}

/**
 * Error reporter with pluggable handlers
 */
export class ErrorReporter {
  private handlers: Array<(errorLog: ErrorLog) => void>;

  constructor(options: { handlers?: Array<(errorLog: ErrorLog) => void> } = {}) {
    this.handlers = options.handlers || [];
  }

  logError(error: Error, context: ErrorContext): void {
    const errorLog = createErrorLog(error, context);

    // Call all handlers, continue even if one fails
    for (const handler of this.handlers) {
      try {
        handler(errorLog);
      } catch (handlerError) {
        // Silently continue - don't let handler errors break error reporting
        console.error('[ErrorReporter] Handler failed:', handlerError);
      }
    }
  }
}
