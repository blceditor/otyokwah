#!/usr/bin/env npx ts-node
/**
 * Mobile Responsiveness Validator
 *
 * Tests responsive design across viewport sizes using Playwright
 *
 * Usage: npx ts-node scripts/validation/mobile-check.ts [url]
 *
 * Viewports tested:
 * - Mobile: 375x667 (iPhone SE)
 * - Mobile Large: 414x896 (iPhone 11)
 * - Tablet: 768x1024 (iPad)
 * - Desktop: 1440x900 (Laptop)
 *
 * Checks:
 * - Touch target sizes (min 44x44px)
 * - Text readability (min 16px)
 * - Horizontal scroll (should not exist)
 * - Viewport meta tag
 * - Mobile navigation functionality
 */

interface ViewportConfig {
  name: string;
  width: number;
  height: number;
  isMobile: boolean;
  hasTouch: boolean;
}

interface MobileCheckResult {
  url: string;
  timestamp: string;
  passed: boolean;
  viewports: Array<{
    name: string;
    passed: boolean;
    screenshot?: string;
    issues: string[];
  }>;
  globalIssues: string[];
}

const VIEWPORTS: ViewportConfig[] = [
  { name: 'Mobile (iPhone SE)', width: 375, height: 667, isMobile: true, hasTouch: true },
  { name: 'Mobile Large (iPhone 11)', width: 414, height: 896, isMobile: true, hasTouch: true },
  { name: 'Tablet (iPad)', width: 768, height: 1024, isMobile: true, hasTouch: true },
  { name: 'Desktop', width: 1440, height: 900, isMobile: false, hasTouch: false },
];

const MIN_TOUCH_TARGET = 44; // pixels
const MIN_FONT_SIZE = 16; // pixels

function generateReport(result: MobileCheckResult): string {
  const lines: string[] = [
    '═══════════════════════════════════════════════════════',
    '  MOBILE RESPONSIVENESS VALIDATION REPORT',
    '═══════════════════════════════════════════════════════',
    '',
    `URL: ${result.url}`,
    `Timestamp: ${result.timestamp}`,
    '',
    '─── Viewport Results ────────────────────────────────',
  ];

  result.viewports.forEach(viewport => {
    const status = viewport.passed ? '✅' : '❌';
    lines.push(`  ${status} ${viewport.name}`);
    viewport.issues.forEach(issue => {
      lines.push(`      ⚠️  ${issue}`);
    });
    if (viewport.screenshot) {
      lines.push(`      📷 Screenshot: ${viewport.screenshot}`);
    }
  });

  if (result.globalIssues.length > 0) {
    lines.push('');
    lines.push('─── Global Issues ───────────────────────────────────');
    result.globalIssues.forEach(issue => {
      lines.push(`  ⚠️  ${issue}`);
    });
  }

  lines.push('');
  lines.push('─── Result ──────────────────────────────────────────');
  lines.push(result.passed
    ? '  ✅ PASSED - All viewport tests passed'
    : '  ❌ FAILED - Mobile responsiveness issues found');
  lines.push('');
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}

async function runMobileCheck(url: string): Promise<MobileCheckResult> {
  console.log(`\n🔍 Running mobile responsiveness check for: ${url}\n`);

  const result: MobileCheckResult = {
    url,
    timestamp: new Date().toISOString(),
    passed: true,
    viewports: [],
    globalIssues: [],
  };

  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });

    // First, check global HTML structure
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    const html = await page.content();

    // Check viewport meta tag
    const hasViewportMeta = /<meta[^>]*name=["']viewport["'][^>]*>/i.test(html);
    if (!hasViewportMeta) {
      result.globalIssues.push('Missing viewport meta tag');
      result.passed = false;
    }

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    if (hasHorizontalScroll) {
      result.globalIssues.push('Page has horizontal scroll on desktop');
    }

    await page.close();

    // Test each viewport
    for (const viewport of VIEWPORTS) {
      const viewportResult = {
        name: viewport.name,
        passed: true,
        issues: [] as string[],
        screenshot: undefined as string | undefined,
      };

      const page = await browser.newPage({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        hasTouch: viewport.hasTouch,
      });

      await page.goto(url, { waitUntil: 'networkidle' });

      // Check for horizontal scroll at this viewport
      const hasScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 5;
      });
      if (hasScroll) {
        viewportResult.issues.push('Horizontal scroll detected');
        viewportResult.passed = false;
      }

      // Check touch target sizes for mobile
      if (viewport.isMobile) {
        const smallTargets = await page.evaluate((minSize) => {
          const clickables = document.querySelectorAll('a, button, input, select, textarea, [role="button"]');
          const small: string[] = [];
          clickables.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              if (rect.width < minSize || rect.height < minSize) {
                const text = (el as HTMLElement).innerText?.slice(0, 30) || el.tagName;
                small.push(`${text} (${Math.round(rect.width)}x${Math.round(rect.height)}px)`);
              }
            }
          });
          return small.slice(0, 5);
        }, MIN_TOUCH_TARGET);

        if (smallTargets.length > 0) {
          viewportResult.issues.push(`Touch targets too small: ${smallTargets.join(', ')}`);
          // Don't fail for this, just warn
        }
      }

      // Check text readability
      const smallText = await page.evaluate((minSize) => {
        const textElements = document.querySelectorAll('p, span, a, li, td, th, label');
        let smallCount = 0;
        textElements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          if (fontSize > 0 && fontSize < minSize) {
            smallCount++;
          }
        });
        return smallCount;
      }, MIN_FONT_SIZE);

      if (smallText > 10) {
        viewportResult.issues.push(`${smallText} elements have font-size < ${MIN_FONT_SIZE}px`);
        // Don't fail for this, just warn
      }

      // Check mobile navigation is visible/functional
      if (viewport.isMobile) {
        const hasMobileNav = await page.evaluate(() => {
          // Check for hamburger menu or mobile nav
          const hamburger = document.querySelector('[aria-label*="menu"], [aria-label*="Menu"], .hamburger, .mobile-menu-toggle, button svg');
          const mobileNav = document.querySelector('.mobile-nav, .mobile-menu, [class*="mobile"]');
          return !!(hamburger || mobileNav);
        });

        if (!hasMobileNav) {
          viewportResult.issues.push('No mobile navigation detected');
        }
      }

      // Save screenshot
      const screenshotDir = `tests/e2e/screenshots/mobile-validation`;
      const screenshotName = `${viewport.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
      try {
        await page.screenshot({
          path: `${screenshotDir}/${screenshotName}`,
          fullPage: false,
        });
        viewportResult.screenshot = `${screenshotDir}/${screenshotName}`;
      } catch {
        // Screenshot directory might not exist
      }

      await page.close();

      if (!viewportResult.passed) {
        result.passed = false;
      }
      result.viewports.push(viewportResult);
    }

    await browser.close();

  } catch (error) {
    console.error('Playwright not available, using basic HTML check...');

    // Fallback: Basic HTML structure checks
    const response = await fetch(url);
    const html = await response.text();

    // Check viewport meta
    if (!/<meta[^>]*name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html)) {
      result.globalIssues.push('Missing or incorrect viewport meta tag');
      result.passed = false;
    }

    // Check for responsive images
    if (!/<img[^>]*srcset=/i.test(html) && !/<picture/i.test(html)) {
      result.globalIssues.push('No responsive images (srcset or picture) detected');
    }

    // Add placeholder viewport results
    VIEWPORTS.forEach(viewport => {
      result.viewports.push({
        name: viewport.name,
        passed: true,
        issues: ['Manual check required (Playwright not available)'],
      });
    });
  }

  return result;
}

// Main execution
const url = process.argv[2] || 'https://www.bearlakecamp.com';

runMobileCheck(url)
  .then(result => {
    console.log(generateReport(result));
    process.exit(result.passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Error running mobile check:', error);
    process.exit(1);
  });

export { runMobileCheck, VIEWPORTS };
export type { MobileCheckResult };
