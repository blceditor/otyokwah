import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from '@/keystatic.config';
import { ErrorTracker } from '@/lib/telemetry/error-reporter';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';

const errorTracker = new ErrorTracker({ windowMs: 60000 });
const lastErrorTimestamp: string | null = null;

type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

type HealthResponse = {
  status: HealthStatus;
  timestamp: string;
  navigation: {
    fileExists: boolean;
    filePath: string;
    readable: boolean;
    valid: boolean;
    error?: string;
    validationErrors?: string;
  };
  keystatic: {
    readerInitialized: boolean;
    configValid: boolean;
    version: string;
    error?: string;
  };
  errors: {
    recentCount: number;
    ratePerMinute: number;
    topErrors: Array<{ code: string; count: number }>;
    lastErrorAt: string | null;
  };
  performance: {
    navigationReadMs: number;
  };
  checkDuration: number;
  reason?: string;
  warnings?: string[];
};

/**
 * Validate navigation data structure
 */
function validateNavigationData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Navigation data is null or undefined');
    return { valid: false, errors };
  }

  const navData = data as Record<string, unknown>;

  if (!navData.menuItems) {
    errors.push('menuItems is required');
  }

  if (!navData.primaryCTA) {
    errors.push('primaryCTA is required');
  } else {
    const cta = navData.primaryCTA as Record<string, unknown>;
    if (!cta.label) {
      errors.push('primaryCTA.label is required');
    }
    if (!cta.href) {
      errors.push('primaryCTA.href is required');
    }
    if (typeof cta.external !== 'boolean') {
      errors.push('primaryCTA.external must be boolean');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Get Keystatic version from package.json
 */
function getKeystaticVersion(): string {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson.dependencies['@keystatic/core'] || 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Check navigation file status
 */
async function checkNavigation() {
  const navigationFile = path.join(process.cwd(), 'content', 'navigation.yaml');
  const startTime = Date.now();

  const result = {
    fileExists: false,
    filePath: 'content/navigation.yaml',
    readable: false,
    valid: false,
    error: undefined as string | undefined,
    validationErrors: undefined as string | undefined,
    readMs: 0,
  };

  try {
    // Check file exists
    result.fileExists = fs.existsSync(navigationFile);

    if (!result.fileExists) {
      result.error = 'File not found';
      result.readMs = Date.now() - startTime;
      return result;
    }

    // Try to read navigation data
    const reader = createReader(process.cwd(), keystaticConfig);
    const navigationData = await reader.singletons.siteNavigation.read();

    result.readable = navigationData !== null;

    if (navigationData) {
      const validation = validateNavigationData(navigationData);
      result.valid = validation.valid;
      if (!validation.valid) {
        result.validationErrors = validation.errors.join(', ');
      }
    }

    result.readMs = Date.now() - startTime;
    return result;
  } catch {
    result.error = 'Navigation data unavailable';
    result.readMs = Date.now() - startTime;
    return result;
  }
}

/**
 * Check Keystatic reader status
 */
function checkKeystatic() {
  const result = {
    readerInitialized: false,
    configValid: false,
    version: 'unknown',
    error: undefined as string | undefined,
  };

  try {
    const reader = createReader(process.cwd(), keystaticConfig);
    result.readerInitialized = !!reader;
    result.configValid = !!keystaticConfig.singletons?.siteNavigation;
    result.version = getKeystaticVersion();
  } catch {
    result.error = 'Reader initialization failed';
  }

  return result;
}

/**
 * Determine overall health status
 */
function determineHealthStatus(
  navigationCheck: Awaited<ReturnType<typeof checkNavigation>>,
  errorRate: number
): { status: HealthStatus; reason?: string; warnings: string[] } {
  const warnings: string[] = [];

  // Check performance
  if (navigationCheck.readMs > 500) {
    warnings.push('Navigation read latency high');
  }

  // Critical: High error rate
  if (errorRate > 1) {
    // > 1 error per second
    return {
      status: 'unhealthy',
      reason: 'High error rate detected',
      warnings,
    };
  }

  // Degraded: Using fallback navigation
  if (!navigationCheck.valid || !navigationCheck.readable) {
    return {
      status: 'degraded',
      reason: 'Navigation using fallback data',
      warnings,
    };
  }

  // Healthy: All checks pass
  return {
    status: 'healthy',
    warnings,
  };
}

/**
 * GET /api/health/keystatic
 * Health check endpoint for Keystatic integration
 */
export async function GET(): Promise<NextResponse<HealthResponse | { status: string }>> {
  const cookieStore = await cookies();
  const isAuthed = await isKeystatiAuthenticated(cookieStore);

  if (!isAuthed) {
    return NextResponse.json(
      { status: 'ok' },
      { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
    );
  }

  const checkStart = Date.now();

  const navigationCheck = await checkNavigation();

  // Check Keystatic
  const keystaticCheck = checkKeystatic();

  // Get error metrics
  const errorStats = errorTracker.getStats();
  const topErrors = Object.entries(errorStats)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalErrors = Object.values(errorStats).reduce((sum, count) => sum + count, 0);
  const errorRate = totalErrors / 60; // Errors per second (60-second window)

  // Determine overall status
  const { status, reason, warnings } = determineHealthStatus(navigationCheck, errorRate);

  const checkDuration = Date.now() - checkStart;

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    navigation: {
      fileExists: navigationCheck.fileExists,
      filePath: navigationCheck.filePath,
      readable: navigationCheck.readable,
      valid: navigationCheck.valid,
      error: navigationCheck.error,
      validationErrors: navigationCheck.validationErrors,
    },
    keystatic: {
      readerInitialized: keystaticCheck.readerInitialized,
      configValid: keystaticCheck.configValid,
      version: keystaticCheck.version,
      error: keystaticCheck.error,
    },
    errors: {
      recentCount: totalErrors,
      ratePerMinute: errorRate * 60,
      topErrors,
      lastErrorAt: lastErrorTimestamp,
    },
    performance: {
      navigationReadMs: navigationCheck.readMs,
    },
    checkDuration,
  };

  if (reason) {
    response.reason = reason;
  }

  if (warnings.length > 0) {
    response.warnings = warnings;
  }

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-cache, no-store, must-revalidate',
    },
  });
}
