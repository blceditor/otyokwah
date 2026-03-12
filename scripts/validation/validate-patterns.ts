#!/usr/bin/env tsx
/**
 * Pattern Validation Script
 * REQ-PROC-006: Validate design pattern compliance across production site
 *
 * Scans production website using Playwright to verify elements match
 * design pattern specifications from lib/design-system/patterns.
 *
 * Usage:
 *   npx tsx scripts/validation/validate-patterns.ts https://www.bearlakecamp.com
 *   npx tsx scripts/validation/validate-patterns.ts https://www.bearlakecamp.com --verbose
 *   npx tsx scripts/validation/validate-patterns.ts https://www.bearlakecamp.com --pattern=SessionHeaderPattern
 *
 * Exit codes:
 *   0 - All patterns valid
 *   1 - Validation violations found
 *   2 - Script error or invalid arguments
 */

import { chromium, type Browser, type Page } from '@playwright/test';
import * as patterns from '../../lib/design-system/patterns';

// Type definitions
type ValidationResult = {
  isValid: boolean;
  violations: string[];
};

type PatternViolation = {
  pattern: string;
  element: string;
  selector: string;
  url: string;
  violations: string[];
};

type ValidationReport = {
  timestamp: string;
  baseUrl: string;
  totalPages: number;
  totalElements: number;
  totalViolations: number;
  violationsByPattern: Record<string, number>;
  violations: PatternViolation[];
  summary: {
    passed: number;
    failed: number;
    successRate: string;
  };
};

// Configuration
const PAGES_TO_SCAN = [
  '/',
  '/summer-camp',
  '/summer-camp-sessions',
  '/work-at-camp',
  '/work-at-camp-summer-staff',
  '/facilities',
  '/about',
];

// Pattern selectors - maps pattern names to their CSS selectors
const PATTERN_SELECTORS: Record<string, { selector: string; description: string }> = {
  SessionHeaderPattern: {
    selector: '.prose h2',
    description: 'Session headers (h2) in prose content',
  },
  CTAButtonPattern: {
    selector: 'a[href*="ultracamp"], a[href*="register"], a.cta-button',
    description: 'CTA buttons (Register Now, Apply, etc.)',
  },
  GridSectionPattern: {
    selector: 'section[role="region"]',
    description: 'Grid sections with image/content pairs',
  },
  SessionCardPattern: {
    selector: '.bg-white\\/20, [class*="bg-white/20"]',
    description: 'Session detail cards with translucent backgrounds',
  },
  AnchorNavPattern: {
    selector: 'nav[aria-label*="Section"], nav[aria-label*="navigation"]',
    description: 'Anchor navigation for section jumping',
  },
};

// CLI arguments
const args = process.argv.slice(2);
const baseUrl = args.find((arg) => !arg.startsWith('--')) || 'https://www.bearlakecamp.com';
const verbose = args.includes('--verbose') || args.includes('-v');
const patternFilter = args.find((arg) => arg.startsWith('--pattern='))?.split('=')[1];

// Utility functions
function log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
  const prefix = {
    info: '\x1b[36mℹ\x1b[0m',
    warn: '\x1b[33m⚠\x1b[0m',
    error: '\x1b[31m✗\x1b[0m',
  }[level];

  console.log(`${prefix} ${message}`);
}

function logSuccess(message: string) {
  console.log(`\x1b[32m✓\x1b[0m ${message}`);
}

function logViolation(violation: PatternViolation) {
  console.log(`\n\x1b[31m✗ ${violation.pattern}\x1b[0m`);
  console.log(`  Element: ${violation.element}`);
  console.log(`  Selector: ${violation.selector}`);
  console.log(`  URL: ${violation.url}`);
  console.log(`  Violations:`);
  violation.violations.forEach((v) => {
    console.log(`    - ${v}`);
  });
}

/**
 * Validate SessionHeaderPattern elements
 */
async function validateSessionHeaders(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.SessionHeaderPattern.selector;

  const headers = await page.locator(selector).all();

  if (verbose && headers.length > 0) {
    log(`Found ${headers.length} session headers on ${url}`);
  }

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const text = await header.textContent();

    // Run validation using pattern's testHelper
    const result = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Check font size
      if (styles.fontSize !== '48px') {
        violations.push(`fontSize: expected 48px, got ${styles.fontSize}`);
      }

      // Check line height
      if (styles.lineHeight !== '48px') {
        violations.push(`lineHeight: expected 48px, got ${styles.lineHeight}`);
      }

      // Check font weight
      if (styles.fontWeight !== '700' && styles.fontWeight !== 'bold') {
        violations.push(`fontWeight: expected 700/bold, got ${styles.fontWeight}`);
      }

      // Check text alignment
      if (styles.textAlign !== 'left') {
        violations.push(`textAlign: expected left, got ${styles.textAlign}`);
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'SessionHeaderPattern',
        element: text?.slice(0, 50) || `Header ${i + 1}`,
        selector: `${selector}:nth-child(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}

/**
 * Validate CTAButtonPattern elements
 */
async function validateCTAButtons(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.CTAButtonPattern.selector;

  const buttons = await page.locator(selector).all();

  if (verbose && buttons.length > 0) {
    log(`Found ${buttons.length} CTA buttons on ${url}`);
  }

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();

    const result = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Check display
      if (styles.display !== 'inline-flex') {
        violations.push(`display: expected inline-flex, got ${styles.display}`);
      }

      // Check align-items
      if (styles.alignItems !== 'center') {
        violations.push(`alignItems: expected center, got ${styles.alignItems}`);
      }

      // Check justify-content
      if (styles.justifyContent !== 'center') {
        violations.push(`justifyContent: expected center, got ${styles.justifyContent}`);
      }

      // Check border-radius
      const borderRadius = styles.borderRadius;
      if (!borderRadius.includes('8px') && !borderRadius.includes('0.5rem')) {
        violations.push(`borderRadius: expected 0.5rem (8px), got ${borderRadius}`);
      }

      // Check font weight
      const fontWeight = parseInt(styles.fontWeight, 10);
      if (fontWeight < 600) {
        violations.push(`fontWeight: expected ≥600 (semibold/bold), got ${fontWeight}`);
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'CTAButtonPattern',
        element: text?.trim() || `Button ${i + 1}`,
        selector: `${selector}:nth-child(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}

/**
 * Validate GridSectionPattern elements
 */
async function validateGridSections(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.GridSectionPattern.selector;

  const sections = await page.locator(selector).all();

  if (verbose && sections.length > 0) {
    log(`Found ${sections.length} grid sections on ${url}`);
  }

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];

    const result = await section.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Check display
      if (styles.display !== 'flex') {
        violations.push(`display: expected flex, got ${styles.display}`);
      }

      // Check minimum height on desktop
      const minHeight = parseFloat(styles.minHeight);
      if (window.innerWidth >= 1024 && minHeight < 600) {
        violations.push(`minHeight: expected ≥600px on desktop, got ${minHeight}px`);
      }

      // Check children (should have 2 for 50/50 split)
      const children = el.children;
      if (children.length !== 2) {
        violations.push(`children: expected 2 (image + content), got ${children.length}`);
      }

      // Check child widths on desktop
      if (window.innerWidth >= 1024) {
        Array.from(children).forEach((child, index) => {
          const childStyles = window.getComputedStyle(child);
          const width = parseFloat(childStyles.width);
          const parentWidth = parseFloat(styles.width);
          const expectedWidth = parentWidth / 2;
          const tolerance = 2;

          if (Math.abs(width - expectedWidth) > tolerance) {
            violations.push(
              `child[${index}] width: expected ~${expectedWidth}px (50%), got ${width}px`
            );
          }
        });
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'GridSectionPattern',
        element: `Section ${i + 1}`,
        selector: `${selector}:nth-of-type(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}

/**
 * Validate SessionCardPattern elements
 */
async function validateSessionCards(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.SessionCardPattern.selector;

  const cards = await page.locator(selector).all();

  if (verbose && cards.length > 0) {
    log(`Found ${cards.length} session cards on ${url}`);
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];

    const result = await card.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Check border radius
      const borderRadius = styles.borderRadius;
      if (!borderRadius.includes('8px') && !borderRadius.includes('0.5rem')) {
        violations.push(`borderRadius: expected 0.5rem (8px), got ${borderRadius}`);
      }

      // Check background color (should be white with opacity)
      const bgColor = styles.backgroundColor;
      const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

      if (rgbaMatch) {
        const [, r, g, b, a] = rgbaMatch;
        const isWhite = r === '255' && g === '255' && b === '255';
        const hasOpacity = a && parseFloat(a) < 1;

        if (!isWhite) {
          violations.push(`backgroundColor: expected white, got rgb(${r}, ${g}, ${b})`);
        }

        if (!hasOpacity) {
          violations.push(`backgroundColor: expected opacity < 1, got ${a || '1'}`);
        }
      }

      // Check padding
      const padding = parseFloat(styles.padding);
      if (padding < 24) {
        violations.push(`padding: expected ≥24px (1.5rem), got ${padding}px`);
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'SessionCardPattern',
        element: `Card ${i + 1}`,
        selector: `${selector}:nth-of-type(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}

/**
 * Validate AnchorNavPattern elements
 */
async function validateAnchorNav(
  page: Page,
  url: string
): Promise<PatternViolation[]> {
  const violations: PatternViolation[] = [];
  const selector = PATTERN_SELECTORS.AnchorNavPattern.selector;

  const navs = await page.locator(selector).all();

  if (verbose && navs.length > 0) {
    log(`Found ${navs.length} anchor navs on ${url}`);
  }

  for (let i = 0; i < navs.length; i++) {
    const nav = navs[i];

    const result = await nav.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      const violations: string[] = [];

      // Check position
      if (styles.position !== 'sticky' && styles.position !== 'fixed') {
        violations.push(`position: expected sticky or fixed, got ${styles.position}`);
      }

      // Check top
      if (styles.position === 'sticky' && styles.top !== '0px') {
        violations.push(`top: expected 0px, got ${styles.top}`);
      }

      // Check z-index
      const zIndex = parseInt(styles.zIndex, 10);
      if (isNaN(zIndex) || zIndex < 10) {
        violations.push(`zIndex: expected ≥10, got ${styles.zIndex}`);
      }

      // Check has border or shadow
      const hasBorder = parseFloat(styles.borderBottomWidth) > 0;
      const hasShadow = styles.boxShadow !== 'none';

      if (!hasBorder && !hasShadow) {
        violations.push('visual separation: expected border or shadow');
      }

      return {
        isValid: violations.length === 0,
        violations,
      };
    });

    if (!result.isValid) {
      violations.push({
        pattern: 'AnchorNavPattern',
        element: `Nav ${i + 1}`,
        selector: `${selector}:nth-of-type(${i + 1})`,
        url,
        violations: result.violations,
      });
    }
  }

  return violations;
}

/**
 * Scan a single page for pattern violations
 */
async function scanPage(
  page: Page,
  url: string,
  patternsToCheck: string[]
): Promise<{ violations: PatternViolation[]; elementCount: number }> {
  log(`Scanning ${url}...`);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  const allViolations: PatternViolation[] = [];
  let elementCount = 0;

  // Run validators for each pattern
  for (const patternName of patternsToCheck) {
    let patternViolations: PatternViolation[] = [];

    switch (patternName) {
      case 'SessionHeaderPattern':
        patternViolations = await validateSessionHeaders(page, url);
        break;
      case 'CTAButtonPattern':
        patternViolations = await validateCTAButtons(page, url);
        break;
      case 'GridSectionPattern':
        patternViolations = await validateGridSections(page, url);
        break;
      case 'SessionCardPattern':
        patternViolations = await validateSessionCards(page, url);
        break;
      case 'AnchorNavPattern':
        patternViolations = await validateAnchorNav(page, url);
        break;
    }

    allViolations.push(...patternViolations);
  }

  // Count total elements checked
  for (const patternName of patternsToCheck) {
    const selector = PATTERN_SELECTORS[patternName]?.selector;
    if (selector) {
      const count = await page.locator(selector).count();
      elementCount += count;
    }
  }

  if (verbose) {
    if (allViolations.length === 0) {
      logSuccess(`${url} - All patterns valid (${elementCount} elements checked)`);
    } else {
      log(`${url} - Found ${allViolations.length} violations`, 'warn');
    }
  }

  return { violations: allViolations, elementCount };
}

/**
 * Generate validation report
 */
function generateReport(
  violations: PatternViolation[],
  totalElements: number
): ValidationReport {
  const violationsByPattern: Record<string, number> = {};

  violations.forEach((v) => {
    violationsByPattern[v.pattern] = (violationsByPattern[v.pattern] || 0) + 1;
  });

  const failed = violations.length;
  const passed = totalElements - failed;
  const successRate = totalElements > 0 ? ((passed / totalElements) * 100).toFixed(1) : '0.0';

  return {
    timestamp: new Date().toISOString(),
    baseUrl,
    totalPages: PAGES_TO_SCAN.length,
    totalElements,
    totalViolations: violations.length,
    violationsByPattern,
    violations,
    summary: {
      passed,
      failed,
      successRate: `${successRate}%`,
    },
  };
}

/**
 * Print report to console
 */
function printReport(report: ValidationReport) {
  console.log('\n' + '='.repeat(80));
  console.log('PATTERN VALIDATION REPORT');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Base URL: ${report.baseUrl}`);
  console.log(`Pages Scanned: ${report.totalPages}`);
  console.log(`Elements Checked: ${report.totalElements}`);
  console.log('');

  if (report.totalViolations === 0) {
    console.log('\x1b[32m✓ ALL PATTERNS VALID\x1b[0m');
    console.log(`  ${report.summary.passed} elements passed validation`);
  } else {
    console.log(`\x1b[31m✗ ${report.totalViolations} VIOLATIONS FOUND\x1b[0m`);
    console.log(`  Passed: ${report.summary.passed}`);
    console.log(`  Failed: ${report.summary.failed}`);
    console.log(`  Success Rate: ${report.summary.successRate}`);
    console.log('');

    console.log('Violations by Pattern:');
    Object.entries(report.violationsByPattern).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}`);
    });

    console.log('\n' + '-'.repeat(80));
    console.log('VIOLATION DETAILS:');
    console.log('-'.repeat(80));

    report.violations.forEach((violation) => {
      logViolation(violation);
    });
  }

  console.log('\n' + '='.repeat(80));
  console.log('');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n\x1b[1mPattern Validation Script\x1b[0m');
  console.log('REQ-PROC-006: Design pattern compliance check\n');

  // Validate arguments
  if (!baseUrl.startsWith('http')) {
    log('Error: Invalid URL provided', 'error');
    log(`Usage: npx tsx ${process.argv[1]} <url> [--verbose] [--pattern=PatternName]`, 'info');
    process.exit(2);
  }

  // Determine patterns to check
  const patternsToCheck = patternFilter
    ? [patternFilter]
    : Object.keys(PATTERN_SELECTORS);

  log(`Base URL: ${baseUrl}`);
  log(`Patterns to check: ${patternsToCheck.join(', ')}`);
  log(`Pages to scan: ${PAGES_TO_SCAN.length}`);
  console.log('');

  // Launch browser
  const browser: Browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const allViolations: PatternViolation[] = [];
  let totalElements = 0;

  try {
    // Scan each page
    for (const path of PAGES_TO_SCAN) {
      const url = `${baseUrl}${path}`;
      const { violations, elementCount } = await scanPage(page, url, patternsToCheck);

      allViolations.push(...violations);
      totalElements += elementCount;
    }

    // Generate and print report
    const report = generateReport(allViolations, totalElements);
    printReport(report);

    // Exit with appropriate code
    const exitCode = report.totalViolations > 0 ? 1 : 0;
    await browser.close();
    process.exit(exitCode);
  } catch (error) {
    log(`Error during validation: ${error}`, 'error');
    await browser.close();
    process.exit(2);
  }
}

// Run main function
main();
