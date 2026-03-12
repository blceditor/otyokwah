#!/usr/bin/env npx ts-node
/**
 * Accessibility Validator
 *
 * Checks WCAG 2.2 AA compliance using axe-core
 *
 * Usage: npx ts-node scripts/validation/a11y-check.ts [url]
 *
 * Checks:
 * - Color contrast (4.5:1 for normal text, 3:1 for large text)
 * - Keyboard navigation
 * - ARIA labels
 * - Heading hierarchy
 * - Image alt text
 * - Form labels
 * - Focus indicators
 * - Touch target sizes (44x44px)
 */

interface A11yViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

interface A11yResult {
  url: string;
  timestamp: string;
  passed: boolean;
  violations: A11yViolation[];
  passes: number;
  incomplete: number;
  summary: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
}

const WCAG_RULES = [
  'color-contrast',
  'heading-order',
  'image-alt',
  'label',
  'link-name',
  'button-name',
  'aria-roles',
  'aria-required-attr',
  'aria-valid-attr',
  'aria-valid-attr-value',
  'document-title',
  'html-has-lang',
  'html-lang-valid',
  'meta-viewport',
  'tabindex',
  'focus-order-semantics',
  'landmark-one-main',
  'region',
  'skip-link',
];

function impactIcon(impact: string): string {
  switch (impact) {
    case 'critical': return '🔴';
    case 'serious': return '🟠';
    case 'moderate': return '🟡';
    case 'minor': return '🔵';
    default: return '⚪';
  }
}

function generateReport(result: A11yResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  ACCESSIBILITY VALIDATION REPORT (WCAG 2.2 AA)',
    '═══════════════════════════════════════════════════════',
    '',
    `URL: ${result.url}`,
    `Timestamp: ${result.timestamp}`,
    '',
    '─── Summary ─────────────────────────────────────────',
    `  Passes:     ${result.passes}`,
    `  Violations: ${result.violations.length}`,
    `  Incomplete: ${result.incomplete}`,
    '',
    '─── Violations by Severity ──────────────────────────',
    `  🔴 Critical: ${result.summary.critical}`,
    `  🟠 Serious:  ${result.summary.serious}`,
    `  🟡 Moderate: ${result.summary.moderate}`,
    `  🔵 Minor:    ${result.summary.minor}`,
    '',
  ];

  if (result.violations.length > 0) {
    lines.push('─── Violation Details ───────────────────────────────');
    result.violations.forEach((violation, index) => {
      lines.push('');
      lines.push(`${impactIcon(violation.impact)} [${index + 1}] ${violation.id}`);
      lines.push(`   Impact: ${violation.impact.toUpperCase()}`);
      lines.push(`   Description: ${violation.description}`);
      lines.push(`   Help: ${violation.helpUrl}`);
      lines.push(`   Affected elements: ${violation.nodes.length}`);
      violation.nodes.slice(0, 3).forEach(node => {
        lines.push(`     - ${node.target.join(' > ')}`);
      });
      if (violation.nodes.length > 3) {
        lines.push(`     ... and ${violation.nodes.length - 3} more`);
      }
    });
    lines.push('');
  }

  lines.push('─── Result ──────────────────────────────────────────');
  if (result.passed) {
    lines.push('  ✅ PASSED - No critical or serious accessibility issues');
  } else {
    lines.push('  ❌ FAILED - Accessibility improvements required');
    if (result.summary.critical > 0) {
      lines.push(`     ${result.summary.critical} critical issue(s) must be fixed`);
    }
    if (result.summary.serious > 0) {
      lines.push(`     ${result.summary.serious} serious issue(s) should be fixed`);
    }
  }
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

async function runA11yCheck(url: string): Promise<A11yResult> {
  console.log(`\n🔍 Running accessibility check for: ${url}\n`);

  const result: A11yResult = {
    url,
    timestamp: new Date().toISOString(),
    passed: false,
    violations: [],
    passes: 0,
    incomplete: 0,
    summary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
  };

  try {
    // Try to use Playwright with axe-core
    const { chromium } = await import('playwright');
    // @ts-ignore - axe-core/playwright may not be installed
    const AxeBuilder = (await import('@axe-core/playwright')).default;

    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });

    // Run axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    await browser.close();

    result.passes = accessibilityScanResults.passes.length;
    result.incomplete = accessibilityScanResults.incomplete.length;

    // @ts-ignore - dynamic import types
    accessibilityScanResults.violations.forEach((violation: any) => {
      const v: A11yViolation = {
        id: violation.id,
        impact: violation.impact as A11yViolation['impact'],
        description: violation.description,
        helpUrl: violation.helpUrl,
        // @ts-ignore - dynamic import types
        nodes: violation.nodes.map((node: any) => ({
          html: node.html,
          target: node.target as string[],
        })),
      };

      result.violations.push(v);
      result.summary[v.impact]++;
    });

    // Pass if no critical or serious issues
    result.passed = result.summary.critical === 0 && result.summary.serious === 0;

  } catch (error) {
    console.error('Playwright/axe-core not available, using basic HTML check...');

    // Fallback: Basic HTML structure checks
    const response = await fetch(url);
    const html = await response.text();

    // Check for common a11y issues
    const checks = [
      { test: /<html[^>]*lang=/i.test(html), id: 'html-has-lang', desc: 'HTML should have lang attribute' },
      { test: /<title>[^<]+<\/title>/i.test(html), id: 'document-title', desc: 'Document should have a title' },
      { test: /<main/i.test(html), id: 'landmark-one-main', desc: 'Page should have a main landmark' },
      { test: /<h1[^>]*>/i.test(html), id: 'page-has-heading-one', desc: 'Page should have an h1' },
      { test: !/<img(?![^>]*alt=)[^>]*>/i.test(html), id: 'image-alt', desc: 'Images should have alt text' },
      { test: /<a[^>]*class="[^"]*skip/i.test(html), id: 'skip-link', desc: 'Page should have a skip link' },
    ];

    checks.forEach(check => {
      if (!check.test) {
        result.violations.push({
          id: check.id,
          impact: 'serious',
          description: check.desc,
          helpUrl: `https://dequeuniversity.com/rules/axe/4.7/${check.id}`,
          nodes: [],
        });
        result.summary.serious++;
      } else {
        result.passes++;
      }
    });

    result.passed = result.summary.critical === 0 && result.summary.serious === 0;
  }

  return result;
}

// Main execution
const url = process.argv[2] || 'https://www.bearlakecamp.com';

runA11yCheck(url)
  .then(result => {
    console.log(generateReport(result));
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running accessibility check:', error);
    process.exit(1);
  });

export { runA11yCheck };
export type { A11yResult, A11yViolation };
