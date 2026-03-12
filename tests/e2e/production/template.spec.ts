/**
 * Playwright Production Test Template
 *
 * MANDATORY: All features must have production validation tests.
 * Copy this template and customize for your feature.
 *
 * Naming: {feature}.spec.ts (e.g., hero-carousel.spec.ts)
 * Location: tests/e2e/production/
 */

import { test, expect, Page } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('REQ-XXX: {Feature Name}', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(PRODUCTION_URL);
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('REQ-XXX-001: {Specific acceptance criterion}', async () => {
    // Arrange
    const element = page.locator('[data-testid="your-element"]');

    // Act
    await element.click();

    // Assert
    await expect(element).toHaveText('Expected Text');

    // Screenshot proof
    await page.screenshot({
      path: `verification-screenshots/${test.info().title.replace(/\s+/g, '-')}.png`,
      fullPage: true
    });
  });

  test('REQ-XXX-002: {Another acceptance criterion}', async () => {
    // Your test here
  });

  // Add more tests for each acceptance criterion
});

/**
 * Best Practices:
 *
 * 1. One test per acceptance criterion
 * 2. Use data-testid for selectors (not CSS classes)
 * 3. Always capture screenshot on success
 * 4. Test actual production URL (not localhost)
 * 5. Include mobile tests for responsive features:
 *
 * test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE
 */
