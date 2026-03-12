// REQ-P0-2: Error Telemetry and Monitoring Tests
// REQ-414: Navigation Reader Function with retry logic
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock the keystatic-reader module
const mockRead = vi.fn();
vi.mock('../keystatic-reader', () => ({
  reader: () => ({
    singletons: {
      siteNavigation: {
        read: mockRead,
      },
    },
  }),
}));

// Mock the telemetry module
const mockLogRetry = vi.fn();
const mockShouldRetryError = vi.fn();
const mockCalculateBackoffDelay = vi.fn();
vi.mock('../telemetry/error-reporter', () => ({
  shouldRetryError: (...args: unknown[]) => mockShouldRetryError(...args),
  calculateBackoffDelay: (...args: unknown[]) => mockCalculateBackoffDelay(...args),
  logRetry: (...args: unknown[]) => mockLogRetry(...args),
}));

// Mock fs and path for initializeNavigation
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
  },
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

vi.mock('path', () => ({
  default: {
    join: (...args: string[]) => args.join('/'),
    dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
  },
  join: (...args: string[]) => args.join('/'),
  dirname: (p: string) => p.split('/').slice(0, -1).join('/'),
}));

import { getNavigation, defaultNavigation } from './navigation';

describe('REQ-P0-2 — Error Telemetry and Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRead.mockReset();
    // Default: don't retry (fatal errors)
    mockShouldRetryError.mockReturnValue(false);
    mockCalculateBackoffDelay.mockImplementation((attempt: number) => 0); // No delay in tests
  });

  test('returns defaultNavigation when reader returns null', async () => {
    mockRead.mockResolvedValue(null);

    const result = await getNavigation();
    expect(result).toEqual(defaultNavigation);
  });

  test('returns transformed navigation data on success', async () => {
    mockRead.mockResolvedValue({
      menuItems: [{ label: 'Test', href: '/test', children: [] }],
      primaryCTA: { label: 'CTA', href: '/cta', external: false },
    });

    const result = await getNavigation();
    expect(result.menuItems[0].label).toBe('Test');
    expect(result.primaryCTA.label).toBe('CTA');
    expect(result.logo).toEqual(defaultNavigation.logo);
  });

  test('returns defaultNavigation on fatal error (no retry)', async () => {
    const fatalError = new Error('Invalid YAML syntax');
    fatalError.name = 'YAMLSyntaxError';
    mockRead.mockRejectedValue(fatalError);
    mockShouldRetryError.mockReturnValue(false);

    const result = await getNavigation();

    expect(result).toEqual(defaultNavigation);
    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(mockLogRetry).not.toHaveBeenCalled();
  });

  test('retries transient errors with backoff', async () => {
    const networkError = new Error('Network timeout');
    networkError.name = 'NetworkError';
    mockRead.mockRejectedValue(networkError);

    // Allow retries for first 3 attempts, then stop
    mockShouldRetryError.mockImplementation((_err: Error, attempt: number) => attempt < 3);
    mockCalculateBackoffDelay.mockReturnValue(0);

    const result = await getNavigation();

    // 1 initial + 3 retries = 4 total
    expect(mockRead).toHaveBeenCalledTimes(4);
    expect(result).toEqual(defaultNavigation);

    // Should have logged 3 retries
    expect(mockLogRetry).toHaveBeenCalledTimes(3);
    expect(mockLogRetry).toHaveBeenNthCalledWith(1, {
      attempt: 1,
      maxAttempts: 3,
      delay: 0,
      error: { message: 'Network timeout' },
    });
  });

  test('succeeds on retry if transient error resolves', async () => {
    const networkError = new Error('Temporary network issue');
    networkError.name = 'NetworkError';

    let callCount = 0;
    mockRead.mockImplementation(async () => {
      callCount++;
      if (callCount < 3) {
        throw networkError;
      }
      return {
        menuItems: [{ label: 'Recovered', href: '/recovered', children: [] }],
        primaryCTA: { label: 'CTA', href: '/cta', external: false },
      };
    });

    mockShouldRetryError.mockReturnValue(true);
    mockCalculateBackoffDelay.mockReturnValue(0);

    const result = await getNavigation();

    expect(callCount).toBe(3);
    expect(result.menuItems[0].label).toBe('Recovered');
    expect(mockLogRetry).toHaveBeenCalledTimes(2);
  });

  test('logRetry receives correct backoff delay', async () => {
    const networkError = new Error('ECONNREFUSED');
    networkError.name = 'NetworkError';
    mockRead.mockRejectedValue(networkError);

    mockShouldRetryError.mockImplementation((_err: Error, attempt: number) => attempt < 3);
    mockCalculateBackoffDelay.mockImplementation((attempt: number) => 100 * Math.pow(2, attempt));

    await getNavigation();

    expect(mockCalculateBackoffDelay).toHaveBeenCalledWith(0);
    expect(mockCalculateBackoffDelay).toHaveBeenCalledWith(1);
    expect(mockCalculateBackoffDelay).toHaveBeenCalledWith(2);

    expect(mockLogRetry).toHaveBeenNthCalledWith(1, expect.objectContaining({ delay: 100 }));
    expect(mockLogRetry).toHaveBeenNthCalledWith(2, expect.objectContaining({ delay: 200 }));
    expect(mockLogRetry).toHaveBeenNthCalledWith(3, expect.objectContaining({ delay: 400 }));
  });

  test('does not retry file not found errors', async () => {
    const notFoundError = new Error('ENOENT: no such file');
    notFoundError.name = 'FileNotFoundError';
    mockRead.mockRejectedValue(notFoundError);
    mockShouldRetryError.mockReturnValue(false);

    const result = await getNavigation();

    expect(mockRead).toHaveBeenCalledTimes(1);
    expect(result).toEqual(defaultNavigation);
    expect(mockLogRetry).not.toHaveBeenCalled();
  });

  test('preserves logo from defaultNavigation', async () => {
    mockRead.mockResolvedValue({
      menuItems: [{ label: 'Page', href: '/page', children: [] }],
      primaryCTA: { label: 'Go', href: '/go', external: false },
    });

    const result = await getNavigation();
    expect(result.logo).toEqual(defaultNavigation.logo);
  });

  test('transforms children correctly', async () => {
    mockRead.mockResolvedValue({
      menuItems: [{
        label: 'Parent',
        href: '/parent',
        children: [
          { label: 'Child 1', href: '/child-1', external: false },
          { label: 'Child 2', href: '/child-2', external: true },
        ],
      }],
      primaryCTA: { label: 'CTA', href: '/cta', external: false },
    });

    const result = await getNavigation();
    expect(result.menuItems[0].children).toHaveLength(2);
    expect(result.menuItems[0].children?.[0].label).toBe('Child 1');
    expect(result.menuItems[0].children?.[1].external).toBe(true);
  });
});
