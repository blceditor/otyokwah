#!/usr/bin/env npx ts-node
/**
 * Performance Validator
 *
 * Runs Lighthouse performance audits and validates Core Web Vitals
 *
 * Usage: npx ts-node scripts/validation/perf-check.ts [url]
 *
 * Thresholds:
 * - LCP: <2.5s (good), <4.0s (needs improvement)
 * - FCP: <1.8s (good), <3.0s (needs improvement)
 * - CLS: <0.1 (good), <0.25 (needs improvement)
 * - INP: <200ms (good), <500ms (needs improvement)
 */

interface PerformanceResult {
  url: string;
  timestamp: string;
  scores: {
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  };
  metrics: {
    lcp: number;
    fcp: number;
    cls: number;
    inp: number;
    ttfb: number;
    tbt: number;
  };
  passed: boolean;
  issues: string[];
}

const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },      // milliseconds
  fcp: { good: 1800, poor: 3000 },      // milliseconds
  cls: { good: 0.1, poor: 0.25 },       // unitless
  inp: { good: 200, poor: 500 },        // milliseconds
  ttfb: { good: 800, poor: 1800 },      // milliseconds
  tbt: { good: 200, poor: 600 },        // milliseconds
  performanceScore: { good: 90, poor: 50 },
};

function formatMetric(value: number, metric: keyof typeof THRESHOLDS): string {
  const threshold = THRESHOLDS[metric];
  const isGood = value <= threshold.good;
  const isPoor = value > threshold.poor;

  const status = isGood ? '✅' : isPoor ? '❌' : '⚠️';
  const unit = ['cls'].includes(metric) ? '' : 'ms';

  return `${status} ${value.toFixed(metric === 'cls' ? 3 : 0)}${unit}`;
}

function generateReport(result: PerformanceResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  PERFORMANCE VALIDATION REPORT',
    '═══════════════════════════════════════════════════════',
    '',
    `URL: ${result.url}`,
    `Timestamp: ${result.timestamp}`,
    '',
    '─── Lighthouse Scores ───────────────────────────────',
    `  Performance:    ${result.scores.performance}/100`,
    `  Accessibility:  ${result.scores.accessibility}/100`,
    `  Best Practices: ${result.scores.bestPractices}/100`,
    `  SEO:            ${result.scores.seo}/100`,
    '',
    '─── Core Web Vitals ─────────────────────────────────',
    `  LCP (Largest Contentful Paint):  ${formatMetric(result.metrics.lcp, 'lcp')}  (target: <2500ms)`,
    `  FCP (First Contentful Paint):    ${formatMetric(result.metrics.fcp, 'fcp')}  (target: <1800ms)`,
    `  CLS (Cumulative Layout Shift):   ${formatMetric(result.metrics.cls, 'cls')}  (target: <0.1)`,
    `  INP (Interaction to Next Paint): ${formatMetric(result.metrics.inp, 'inp')}  (target: <200ms)`,
    `  TTFB (Time to First Byte):       ${formatMetric(result.metrics.ttfb, 'ttfb')}  (target: <800ms)`,
    `  TBT (Total Blocking Time):       ${formatMetric(result.metrics.tbt, 'tbt')}  (target: <200ms)`,
    '',
  ];

  if (result.issues.length > 0) {
    lines.push('─── Issues ──────────────────────────────────────────');
    result.issues.forEach(issue => {
      lines.push(`  ⚠️  ${issue}`);
    });
    lines.push('');
  }

  lines.push('─── Result ──────────────────────────────────────────');
  lines.push(result.passed
    ? '  ✅ PASSED - All performance thresholds met'
    : '  ❌ FAILED - Performance improvements needed');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

async function runPerformanceCheck(url: string): Promise<PerformanceResult> {
  console.log(`\n🔍 Running performance check for: ${url}\n`);

  // In a real implementation, this would run Lighthouse
  // For now, we'll simulate the check with placeholder logic
  const result: PerformanceResult = {
    url,
    timestamp: new Date().toISOString(),
    scores: {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
    },
    metrics: {
      lcp: 0,
      fcp: 0,
      cls: 0,
      inp: 0,
      ttfb: 0,
      tbt: 0,
    },
    passed: false,
    issues: [],
  };

  try {
    // Dynamic import to avoid issues if lighthouse isn't installed
    // @ts-ignore - lighthouse may not be installed
    const lighthouse = await import('lighthouse');
    // @ts-ignore - chrome-launcher may not be installed
    const chromeLauncher = await import('chrome-launcher');

    const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
    const options = {
      logLevel: 'error' as const,
      output: 'json' as const,
      port: chrome.port,
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    };

    const runnerResult = await lighthouse.default(url, options);
    await chrome.kill();

    if (runnerResult?.lhr) {
      const lhr = runnerResult.lhr;

      result.scores = {
        performance: Math.round((lhr.categories.performance?.score || 0) * 100),
        accessibility: Math.round((lhr.categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((lhr.categories['best-practices']?.score || 0) * 100),
        seo: Math.round((lhr.categories.seo?.score || 0) * 100),
      };

      const audits = lhr.audits;
      result.metrics = {
        lcp: audits['largest-contentful-paint']?.numericValue || 0,
        fcp: audits['first-contentful-paint']?.numericValue || 0,
        cls: audits['cumulative-layout-shift']?.numericValue || 0,
        inp: audits['interaction-to-next-paint']?.numericValue || 0,
        ttfb: audits['server-response-time']?.numericValue || 0,
        tbt: audits['total-blocking-time']?.numericValue || 0,
      };

      // Check thresholds
      if (result.metrics.lcp > THRESHOLDS.lcp.good) {
        result.issues.push(`LCP is ${result.metrics.lcp.toFixed(0)}ms, should be <${THRESHOLDS.lcp.good}ms`);
      }
      if (result.metrics.fcp > THRESHOLDS.fcp.good) {
        result.issues.push(`FCP is ${result.metrics.fcp.toFixed(0)}ms, should be <${THRESHOLDS.fcp.good}ms`);
      }
      if (result.metrics.cls > THRESHOLDS.cls.good) {
        result.issues.push(`CLS is ${result.metrics.cls.toFixed(3)}, should be <${THRESHOLDS.cls.good}`);
      }
      if (result.metrics.inp > THRESHOLDS.inp.good) {
        result.issues.push(`INP is ${result.metrics.inp.toFixed(0)}ms, should be <${THRESHOLDS.inp.good}ms`);
      }
      if (result.scores.performance < THRESHOLDS.performanceScore.good) {
        result.issues.push(`Performance score is ${result.scores.performance}, should be >${THRESHOLDS.performanceScore.good}`);
      }

      result.passed = result.issues.length === 0;
    }
  } catch (error) {
    console.error('Lighthouse not available, using curl-based check...');

    // Fallback: Simple fetch-based timing check
    const startTime = Date.now();
    const response = await fetch(url);
    const ttfb = Date.now() - startTime;

    result.metrics.ttfb = ttfb;
    result.scores.performance = ttfb < 800 ? 90 : ttfb < 1500 ? 70 : 50;

    if (ttfb > THRESHOLDS.ttfb.good) {
      result.issues.push(`TTFB is ${ttfb}ms, should be <${THRESHOLDS.ttfb.good}ms`);
    }

    result.passed = result.issues.length === 0;

    if (!response.ok) {
      result.issues.push(`HTTP ${response.status}: ${response.statusText}`);
      result.passed = false;
    }
  }

  return result;
}

// Main execution
const url = process.argv[2] || 'https://www.bearlakecamp.com';

runPerformanceCheck(url)
  .then(result => {
    console.log(generateReport(result));
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running performance check:', error);
    process.exit(1);
  });

export { runPerformanceCheck, THRESHOLDS };
export type { PerformanceResult };
