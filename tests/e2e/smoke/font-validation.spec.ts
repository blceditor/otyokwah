/**
 * Font validation test - captures screenshots to verify TradesmithStamp rendering
 */
import { test } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('TradesmithStamp Font Validation', () => {
  test('capture homepage heading font', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/`);
    await page.waitForLoadState('networkidle');

    // Capture the hero section with heading
    await page.screenshot({
      path: 'tests/e2e/screenshots/font-validation-homepage.png',
      fullPage: false
    });

    // Also capture just a heading element
    const heading = page.locator('h1, h2').first();
    if (await heading.count() > 0) {
      await heading.screenshot({
        path: 'tests/e2e/screenshots/font-validation-heading.png'
      });
    }
  });

  test('capture summer-camp page headings', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/e2e/screenshots/font-validation-summer-camp.png',
      fullPage: false
    });
  });

  test('capture about page headings', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/about`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'tests/e2e/screenshots/font-validation-about.png',
      fullPage: false
    });
  });
});
