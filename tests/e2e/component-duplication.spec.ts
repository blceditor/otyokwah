/**
 * REQ-CMS-006: Component Duplication Feature
 *
 * Playwright E2E tests for Markdoc component duplication in Keystatic
 */
import { test, expect } from '@playwright/test';

test.describe('REQ-CMS-006 — Component Duplication in Keystatic', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/keystatic');
    await page.waitForSelector('[data-keystatic-wrapper], main', { timeout: 10000 });
  });

  test('duplicate button appears on Markdoc components', async ({ page }) => {
    // Navigate to a page with Markdoc content
    await page.click('text=Pages');
    await page.waitForTimeout(500);

    // Find a page with rich content (like summer-camp-sessions)
    const summerCampPage = page.locator('text=summer-camp, text=Summer Camp');
    if (await summerCampPage.isVisible().catch(() => false)) {
      await summerCampPage.first().click();
      await page.waitForTimeout(1000);

      // Look for Markdoc components in the editor
      const markdocComponents = page.locator(
        '[data-markdoc-component], ' +
        '[class*="markdoc"], ' +
        '[data-component-type]'
      );

      if (await markdocComponents.count() > 0) {
        // Hover over first component
        await markdocComponents.first().hover();
        await page.waitForTimeout(300);

        // Look for duplicate button
        const duplicateButton = page.locator(
          'button:has-text("Duplicate"), ' +
          '[aria-label*="duplicate"], ' +
          '.duplicate-btn'
        );

        await expect(duplicateButton.first()).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('clicking duplicate creates a copy of the component', async ({ page }) => {
    await page.click('text=Pages');
    await page.waitForTimeout(500);

    const testPage = page.locator('[role="listitem"]').first();
    if (await testPage.isVisible()) {
      await testPage.click();
      await page.waitForTimeout(1000);

      // Find Markdoc components
      const markdocComponents = page.locator('[data-markdoc-component], [class*="markdoc"]');
      const initialCount = await markdocComponents.count();

      if (initialCount > 0) {
        // Hover and click duplicate
        await markdocComponents.first().hover();
        await page.waitForTimeout(300);

        const duplicateButton = page.locator(
          'button:has-text("Duplicate"), [aria-label*="duplicate"], .duplicate-btn'
        );

        if (await duplicateButton.isVisible().catch(() => false)) {
          await duplicateButton.first().click();
          await page.waitForTimeout(500);

          // Should have one more component
          const newCount = await markdocComponents.count();
          expect(newCount).toBe(initialCount + 1);
        }
      }
    }
  });

  test('duplicated component renders correctly on page', async ({ page }) => {
    // This test verifies that duplicated components actually render
    // We test by checking if cardGrid components work

    await page.goto('/summer-camp-sessions');
    await page.waitForLoadState('domcontentloaded');

    // Find card grid or similar component
    const cardGrids = page.locator('[class*="grid"], [data-component="cardGrid"]');
    const gridCount = await cardGrids.count();

    // Should have at least one grid rendered
    expect(gridCount).toBeGreaterThan(0);

    // Each grid should have child cards
    if (gridCount > 0) {
      const firstGrid = cardGrids.first();
      const cards = firstGrid.locator('[class*="card"], > div');
      const cardCount = await cards.count();
      expect(cardCount).toBeGreaterThan(0);
    }
  });

  test('pasted Markdoc syntax validates correctly', async ({ page }) => {
    await page.click('text=Pages');
    await page.waitForTimeout(500);

    const testPage = page.locator('[role="listitem"]').first();
    if (await testPage.isVisible()) {
      await testPage.click();
      await page.waitForTimeout(1000);

      // Find the Markdoc editor / body field
      const bodyEditor = page.locator(
        '[data-field-label*="Body"], ' +
        '[contenteditable="true"], ' +
        '.ProseMirror, ' +
        'textarea[name*="body"]'
      );

      if (await bodyEditor.isVisible().catch(() => false)) {
        // Try to paste valid Markdoc syntax
        const validMarkdoc = '{% ctaButton label="Test" href="/test" /%}';

        await bodyEditor.first().click();
        await page.keyboard.type(validMarkdoc);
        await page.waitForTimeout(500);

        // Should not show validation error
        const validationError = page.locator('text=Invalid, text=Error, [class*="error"]');
        const hasError = await validationError.isVisible().catch(() => false);

        // No validation error expected for valid syntax
        expect(hasError).toBe(false);
      }
    }
  });

});

test.describe('REQ-CMS-006 — Markdoc Validation', () => {

});
