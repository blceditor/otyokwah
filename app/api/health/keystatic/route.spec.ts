// REQ-P0-2: Error Telemetry and Monitoring - Health Check Endpoint Tests
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Helper: set up mocks and return a fresh GET handler
async function getHandlerWithMocks(overrides: {
  fsExistsSync?: (...args: unknown[]) => boolean;
  fsReadFileSync?: (...args: unknown[]) => string;
  createReader?: () => unknown;
  ErrorTrackerGetStats?: () => Record<string, number>;
} = {}) {
  vi.resetModules();

  const fsMock = {
    existsSync: overrides.fsExistsSync ?? vi.fn(() => true),
    readFileSync: overrides.fsReadFileSync ?? vi.fn(() =>
      JSON.stringify({ dependencies: { '@keystatic/core': '^0.5.0' } })
    ),
    statSync: vi.fn(() => ({ mode: 0o755 })),
  };

  vi.doMock('fs', () => ({ default: fsMock, ...fsMock }));

  vi.doMock('path', async () => {
    const actual = await vi.importActual<typeof import('path')>('path');
    return { default: actual, ...actual };
  });

  const defaultReader = () => ({
    singletons: {
      siteNavigation: {
        read: vi.fn(async () => ({
          menuItems: [{ label: 'Home', href: '/' }],
          primaryCTA: { label: 'Register', href: '/register', external: false },
        })),
      },
    },
  });

  vi.doMock('@keystatic/core/reader', () => ({
    createReader: overrides.createReader ?? vi.fn(defaultReader),
  }));

  vi.doMock('@/keystatic.config', () => ({
    default: {
      singletons: {
        siteNavigation: {},
      },
    },
  }));

  const getStats = overrides.ErrorTrackerGetStats ?? (() => ({}));
  vi.doMock('@/lib/telemetry/error-reporter', () => ({
    ErrorTracker: class {
      getStats() { return getStats(); }
      getErrorRate() { return 0; }
      getCount() { return 0; }
      recordError() {}
    },
  }));

  vi.doMock('next/headers', () => ({
    cookies: vi.fn(async () => ({ get: vi.fn(() => null) })),
  }));

  vi.doMock('@/lib/keystatic/auth', () => ({
    isKeystatiAuthenticated: vi.fn(async () => true),
  }));

  const mod = await import('./route');
  return mod.GET;
}

describe('REQ-P0-2 — Keystatic Health Check Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Health Check', () => {
    test('GET /api/health/keystatic returns 200 status', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    test('response includes status field', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(typeof data.status).toBe('string');
    });

    test('response includes timestamp', async () => {
      const GET = await getHandlerWithMocks();

      const beforeTime = new Date().toISOString();
      const response = await GET();
      const afterTime = new Date().toISOString();
      const data = await response.json();

      expect(data).toHaveProperty('timestamp');
      expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(data.timestamp >= beforeTime).toBe(true);
      expect(data.timestamp <= afterTime).toBe(true);
    });
  });

  describe('Navigation Data Status', () => {
    test('checks if navigation.yaml exists', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('navigation');
      expect(data.navigation).toHaveProperty('fileExists');
      expect(typeof data.navigation.fileExists).toBe('boolean');
    });

    test('reports navigation file path', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.navigation).toHaveProperty('filePath');
      expect(data.navigation.filePath).toContain('content/navigation');
    });

    test('attempts to read navigation data', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.navigation).toHaveProperty('readable');
      expect(typeof data.navigation.readable).toBe('boolean');
    });

    test('includes validation status of navigation data', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.navigation).toHaveProperty('valid');
      expect(typeof data.navigation.valid).toBe('boolean');
    });

    test('reports error when navigation file missing', async () => {
      const GET = await getHandlerWithMocks({
        fsExistsSync: () => false,
        fsReadFileSync: vi.fn(() =>
          JSON.stringify({ dependencies: { '@keystatic/core': '^0.5.0' } })
        ),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.navigation.fileExists).toBe(false);
      expect(data.navigation).toHaveProperty('error');
      expect(data.navigation.error).toContain('File not found');
    });

    test('reports error when navigation data is invalid', async () => {
      const GET = await getHandlerWithMocks({
        createReader: () => ({
          singletons: {
            siteNavigation: {
              read: async () => ({
                menuItems: [],
              }),
            },
          },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.navigation.valid).toBe(false);
      expect(data.navigation).toHaveProperty('validationErrors');
      expect(data.navigation.validationErrors).toContain('primaryCTA is required');
    });
  });

  describe('Keystatic Reader Status', () => {
    test('checks if Keystatic reader is functional', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('keystatic');
      expect(data.keystatic).toHaveProperty('readerInitialized');
      expect(typeof data.keystatic.readerInitialized).toBe('boolean');
    });

    test('reports Keystatic configuration status', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.keystatic).toHaveProperty('configValid');
      expect(typeof data.keystatic.configValid).toBe('boolean');
    });

    test('includes Keystatic version information', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.keystatic).toHaveProperty('version');
      expect(typeof data.keystatic.version).toBe('string');
    });
  });

  describe('Error Metrics', () => {
    test('includes recent error count', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('errors');
      expect(data.errors).toHaveProperty('recentCount');
      expect(typeof data.errors.recentCount).toBe('number');
    });

    test('includes error rate (errors per minute)', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.errors).toHaveProperty('ratePerMinute');
      expect(typeof data.errors.ratePerMinute).toBe('number');
      expect(data.errors.ratePerMinute).toBeGreaterThanOrEqual(0);
    });

    test('lists most common error codes', async () => {
      const GET = await getHandlerWithMocks({
        ErrorTrackerGetStats: () => ({
          KEYSTATIC_READ_ERROR: 5,
          NETWORK_TIMEOUT: 2,
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.errors).toHaveProperty('topErrors');
      expect(Array.isArray(data.errors.topErrors)).toBe(true);
      expect(data.errors.topErrors[0]).toMatchObject({
        code: 'KEYSTATIC_READ_ERROR',
        count: 5,
      });
    });

    test('includes last error timestamp', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.errors).toHaveProperty('lastErrorAt');

      if (data.errors.lastErrorAt) {
        expect(data.errors.lastErrorAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      }
    });
  });

  describe('Overall Health Status', () => {
    test('returns "healthy" when all checks pass', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('healthy');
    });

    test('returns "degraded" when navigation fallback is active', async () => {
      const GET = await getHandlerWithMocks({
        createReader: () => ({
          singletons: {
            siteNavigation: {
              read: async () => {
                throw new Error('Read failed');
              },
            },
          },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('degraded');
      expect(data).toHaveProperty('reason');
      expect(data.reason).toContain('fallback');
    });

    test('returns "unhealthy" when error rate exceeds threshold', async () => {
      // Route computes: totalErrors / 60 (errors per second over 60s window)
      // Threshold is > 1 error per second, so totalErrors > 60
      const GET = await getHandlerWithMocks({
        ErrorTrackerGetStats: () => ({
          CRITICAL_ERROR: 100,
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.status).toBe('unhealthy');
      expect(data.reason).toContain('error rate');
    });

    test('includes health check duration', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('checkDuration');
      expect(typeof data.checkDuration).toBe('number');
      expect(data.checkDuration).toBeGreaterThanOrEqual(0);
      expect(data.checkDuration).toBeLessThan(1000);
    });
  });

  describe('Response Format', () => {
    test('returns JSON content type', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();

      expect(response.headers.get('content-type')).toContain('application/json');
    });

    test('response is valid JSON', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();

      expect(async () => await response.json()).not.toThrow();
    });

    test('follows consistent structure schema', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('navigation');
      expect(data).toHaveProperty('keystatic');
      expect(data).toHaveProperty('errors');
      expect(data).toHaveProperty('checkDuration');
    });
  });

  describe('Error Handling', () => {
    test('handles file system errors gracefully', async () => {
      const GET = await getHandlerWithMocks({
        fsExistsSync: () => { throw new Error('File system error'); },
        fsReadFileSync: vi.fn(() =>
          JSON.stringify({ dependencies: { '@keystatic/core': '^0.5.0' } })
        ),
      });

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.navigation).toHaveProperty('error');
    });

    test('handles Keystatic reader errors gracefully', async () => {
      const GET = await getHandlerWithMocks({
        createReader: () => { throw new Error('Reader initialization failed'); },
      });

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.keystatic.readerInitialized).toBe(false);
      expect(data.keystatic).toHaveProperty('error');
    });

    test('does not expose sensitive error details', async () => {
      const GET = await getHandlerWithMocks({
        createReader: () => ({
          singletons: {
            siteNavigation: {
              read: async () => {
                const error = new Error('Database connection failed at localhost:5432');
                error.stack = 'Error: Database connection failed\n  at /secret/path/file.ts:42';
                throw error;
              },
            },
          },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(JSON.stringify(data)).not.toContain('/secret/path');
      expect(JSON.stringify(data)).not.toContain('localhost:5432');
      expect(data.navigation.error).toBe('Navigation data unavailable');
    });
  });

  describe('Performance Monitoring', () => {
    test('includes navigation read latency', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();
      const data = await response.json();

      expect(data.performance).toHaveProperty('navigationReadMs');
      expect(typeof data.performance.navigationReadMs).toBe('number');
    });

    test('warns when read latency exceeds threshold', async () => {
      const GET = await getHandlerWithMocks({
        createReader: () => ({
          singletons: {
            siteNavigation: {
              read: async () => {
                await new Promise((resolve) => setTimeout(resolve, 600));
                return {
                  menuItems: [],
                  primaryCTA: { label: 'Test', href: '/test', external: false },
                };
              },
            },
          },
        }),
      });

      const response = await GET();
      const data = await response.json();

      expect(data.performance.navigationReadMs).toBeGreaterThan(500);
      expect(data.warnings).toContain('Navigation read latency high');
    });
  });

  describe('Caching Headers', () => {
    test('sets appropriate cache headers for health checks', async () => {
      const GET = await getHandlerWithMocks();
      const response = await GET();

      expect(response.headers.get('cache-control')).toContain('no-cache');
    });
  });

  describe('Authentication', () => {
    test('returns only status for unauthenticated requests', async () => {
      vi.resetModules();

      vi.doMock('next/headers', () => ({
        cookies: vi.fn(async () => ({ get: vi.fn(() => null) })),
      }));

      vi.doMock('@/lib/keystatic/auth', () => ({
        isKeystatiAuthenticated: vi.fn(async () => false),
      }));

      vi.doMock('fs', () => ({ default: { existsSync: vi.fn(() => true), readFileSync: vi.fn(() => '{}'), statSync: vi.fn(() => ({ mode: 0o755 })) } }));
      vi.doMock('path', async () => {
        const actual = await vi.importActual<typeof import('path')>('path');
        return { default: actual, ...actual };
      });
      vi.doMock('@keystatic/core/reader', () => ({ createReader: vi.fn() }));
      vi.doMock('@/keystatic.config', () => ({ default: { singletons: {} } }));
      vi.doMock('@/lib/telemetry/error-reporter', () => ({
        ErrorTracker: class { getStats() { return {}; } recordError() {} },
      }));

      const mod = await import('./route');
      const response = await mod.GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Object.keys(data)).toEqual(['status']);
      expect(data.status).toBe('ok');
    });
  });
});
