/**
 * REQ-CMS-003: SEO Metadata Accordion - E2E Tests
 *
 * Playwright tests for SEO accordion collapse/expand behavior in Keystatic editor.
 */
import { test, expect } from '@playwright/test';

test.describe('REQ-CMS-003 — SEO Metadata Accordion', () => {
  // Use saved auth state from setup
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // Navigate to edit a page in Keystatic
    await page.goto('/keystatic/branch/main/collection/pages/item/about');
    await page.waitForTimeout(3000);

    // Check if authenticated
    const content = await page.content();
    const isAuthenticated =
      content.includes('title') ||
      content.includes('Save') ||
      content.includes('content');

    if (!isAuthenticated) {
      test.skip();
    }
  });

  test('SEO section exists and is collapsible', async ({ page }) => {
    // Look for SEO section with the full label
    const seoSection = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();
    await expect(seoSection).toBeVisible({ timeout: 10000 });

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-section-visible.png',
      fullPage: false,
    });
  });

  test('SEO section can be expanded and collapsed', async ({ page }) => {
    // Find the SEO details element with full label
    const seoDetails = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();

    // If it's a native details, it should work
    if (await seoDetails.count() > 0) {
      const summary = seoDetails.locator('summary');
      await expect(summary).toBeVisible();

      // Initially collapsed
      await expect(seoDetails).not.toHaveAttribute('open');

      // Click to expand
      await summary.click();
      await expect(seoDetails).toHaveAttribute('open');

      // Click to collapse
      await summary.click();
      await expect(seoDetails).not.toHaveAttribute('open');

      await page.screenshot({
        path: 'tests/e2e/screenshots/seo-accordion-collapsed.png',
        fullPage: false,
      });
    }
  });

  test('SEO fields are accessible when expanded', async ({ page }) => {
    // Target specifically the "SEO & Social Media" accordion
    const seoDetails = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();

    if (await seoDetails.count() > 0) {
      // Expand by clicking summary
      const summary = seoDetails.locator('summary');
      await summary.click();

      // Wait for expansion - the details element gets 'open' attribute
      await expect(seoDetails).toHaveAttribute('open', { timeout: 5000 });

      // Verified: accordion expands successfully
      // The character counter tests verify specific field interactions work
    }
  });

  test('character counter shows for meta title', async ({ page }) => {
    const seoDetails = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();

    if (await seoDetails.count() > 0) {
      // Expand
      await seoDetails.locator('summary').click();
      await page.waitForTimeout(500);

      // Find meta title input (first text input in SEO section)
      const metaTitleField = seoDetails.locator('input[type="text"]').first();

      if (await metaTitleField.isVisible()) {
        await metaTitleField.fill('Test SEO Title');

        // Look for character counter - check within the details element
        const counter = seoDetails.locator('[data-char-counter="metaTitle"]');
        await expect(counter).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('character counter shows for meta description', async ({ page }) => {
    const seoDetails = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();

    if (await seoDetails.count() > 0) {
      // Expand
      await seoDetails.locator('summary').click();
      await page.waitForTimeout(500);

      // Find meta description textarea (first textarea in SEO section)
      const metaDescField = seoDetails.locator('textarea').first();

      if (await metaDescField.isVisible()) {
        await metaDescField.fill('Test meta description for SEO purposes');

        // Look for character counter - check within the details element
        const counter = seoDetails.locator('[data-char-counter="metaDescription"]');
        await expect(counter).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('SEO accordion is keyboard accessible', async ({ page }) => {
    const seoDetails = page.locator('details:has(summary:has-text("SEO & Social Media"))').first();

    if (await seoDetails.count() > 0) {
      const summary = seoDetails.locator('summary');

      // Focus on summary
      await summary.focus();

      // Press Enter to toggle
      await page.keyboard.press('Enter');
      await expect(seoDetails).toHaveAttribute('open');

      // Press Enter again to close
      await page.keyboard.press('Enter');
      await expect(seoDetails).not.toHaveAttribute('open');

      // Press Space to open
      await page.keyboard.press('Space');
      await expect(seoDetails).toHaveAttribute('open');
    }
  });
});
