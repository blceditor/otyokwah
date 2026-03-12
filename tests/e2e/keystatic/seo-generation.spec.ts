/**
 * REQ-CMS-012: AI-Powered SEO Generation - E2E Tests
 *
 * Playwright tests for Generate SEO button in Keystatic toolbar.
 */
import { test, expect } from '@playwright/test';

test.describe('REQ-CMS-012 — AI SEO Generation in Editor', () => {
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

  test('Generate SEO button appears in toolbar', async ({ page }) => {
    // Look for our custom toolbar
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible({ timeout: 10000 });

    // Find Generate SEO button
    const generateButton = toolbar.locator('button:has-text("Generate SEO"), button:has([data-testid="sparkles-icon"])');
    await expect(generateButton).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/generate-seo-button.png',
      fullPage: false,
    });
  });

  test('clicking Generate SEO opens panel', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Click Generate SEO button
    const generateButton = toolbar.locator('button:has-text("Generate SEO")');
    await generateButton.click();

    // Panel should appear
    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-panel-open.png',
      fullPage: false,
    });
  });

  test('SEO panel can be closed', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Close with X button
    const closeButton = panel.locator('button[aria-label*="close"], button:has([data-testid="x-icon"])');
    await closeButton.click();

    await expect(panel).not.toBeVisible();
  });

  test('SEO panel can be closed with Escape key', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');

    await expect(panel).not.toBeVisible();
  });

  test('SEO panel shows rate limit info', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Should show remaining credits
    const rateLimit = panel.locator('text=/\\d+\\/\\d+ remaining/, text=/remaining/i');
    await expect(rateLimit).toBeVisible();
  });

  test('SEO generation shows loading state', async ({ page }) => {
    // This test may need mocking in a real scenario
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY for full test');

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Click generate in panel
    const panelGenerateButton = panel.locator('button:has-text("Generate SEO")');
    await panelGenerateButton.click();

    // Should show loading state
    const loading = panel.locator('text=/generating/i, [data-testid="loading-spinner"]');
    await expect(loading).toBeVisible({ timeout: 2000 });
  });

  test('generated SEO shows character counts', async ({ page }) => {
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY for full test');

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel and generate
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await panel.locator('button:has-text("Generate SEO")').click();

    // Wait for generation to complete (up to 30s)
    const applyButton = panel.locator('button:has-text("Apply to Form")');
    await expect(applyButton).toBeVisible({ timeout: 30000 });

    // Check for character counts
    const metaTitleCount = panel.locator('text=/\\d+\\/60/');
    const metaDescCount = panel.locator('text=/\\d+\\/155/');

    await expect(metaTitleCount).toBeVisible();
    await expect(metaDescCount).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-generated.png',
      fullPage: false,
    });
  });

  test('Apply to Form populates SEO fields', async ({ page }) => {
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY for full test');

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel and generate
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await panel.locator('button:has-text("Generate SEO")').click();

    // Wait for generation
    const applyButton = panel.locator('button:has-text("Apply to Form")');
    await expect(applyButton).toBeVisible({ timeout: 30000 });

    // Get generated values for comparison
    const generatedTitle = await panel.locator('[data-field="metaTitle"], .meta-title-preview').textContent();

    // Apply to form
    await applyButton.click();

    // Panel should close
    await expect(panel).not.toBeVisible();

    // Expand SEO accordion if needed
    const seoDetails = page.locator('details:has(summary:has-text("SEO"))');
    if (await seoDetails.count() > 0 && !(await seoDetails.getAttribute('open'))) {
      await seoDetails.locator('summary').click();
    }

    // Check that metaTitle field has value
    const metaTitleField = page.locator('input[name*="metaTitle"]').first();
    await expect(metaTitleField).not.toHaveValue('');

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-applied.png',
      fullPage: false,
    });
  });

  test('toolbar button has accessible label', async ({ page }) => {
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    const generateButton = toolbar.locator('button:has-text("Generate SEO")');
    await expect(generateButton).toBeVisible();

    // Should have aria-label or accessible text
    const ariaLabel = await generateButton.getAttribute('aria-label');
    const buttonText = await generateButton.textContent();

    expect(ariaLabel || buttonText).toBeTruthy();
    expect((ariaLabel || buttonText)?.toLowerCase()).toContain('seo');
  });

  test('SEO generation completes without "Title is required" error', async ({ page }) => {
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY for full test');

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Click generate
    await panel.locator('button:has-text("Generate SEO")').click();

    // Wait for either success (Apply button) or error
    const applyButton = panel.locator('button:has-text("Apply to Form")');
    const errorMessage = panel.locator('text=/title.*required/i, text=/error/i');

    // Wait up to 30 seconds for generation
    await Promise.race([
      expect(applyButton).toBeVisible({ timeout: 30000 }),
      expect(errorMessage).toBeVisible({ timeout: 30000 }).then(() => {
        throw new Error('SEO generation failed with error');
      }),
    ]);

    // Should NOT see "Title is required" error
    const titleError = panel.locator('text=/title.*required/i');
    await expect(titleError).not.toBeVisible();

    // Should see generated content
    await expect(applyButton).toBeVisible();

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-generation-success.png',
      fullPage: false,
    });
  });

  test('SEO generation works on program page with rich context', async ({ page }) => {
    test.skip(!process.env.UNIVERSAL_LLM_KEY, 'Requires UNIVERSAL_LLM_KEY for full test');

    // Navigate to a program page (has templateType, ageRange, etc.)
    await page.goto('/keystatic/branch/main/collection/pages/item/retreats-youth-groups');
    await page.waitForTimeout(3000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible({ timeout: 10000 });

    // Open panel
    await toolbar.locator('button:has-text("Generate SEO")').click();

    const panel = page.locator('[role="dialog"]:has-text("Generate SEO Metadata"), .seo-generation-panel');
    await expect(panel).toBeVisible();

    // Click generate
    await panel.locator('button:has-text("Generate SEO")').click();

    // Wait for success
    const applyButton = panel.locator('button:has-text("Apply to Form")');
    await expect(applyButton).toBeVisible({ timeout: 30000 });

    // Verify generated content contains relevant keywords
    const generatedContent = await panel.locator('.meta-title-preview, [data-field="metaTitle"]').textContent();

    // Should include "Bear Lake Camp" (from enhanced prompt)
    expect(generatedContent?.toLowerCase()).toContain('bear lake');

    await page.screenshot({
      path: 'tests/e2e/screenshots/seo-program-page-generated.png',
      fullPage: false,
    });
  });
});
