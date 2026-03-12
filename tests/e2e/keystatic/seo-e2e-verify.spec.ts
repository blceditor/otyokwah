/**
 * E2E Verification Test for Generate SEO Feature
 *
 * This test verifies the full flow on production:
 * 1. Navigate to Keystatic editor
 * 2. Click Generate SEO
 * 3. Verify SEO is generated without errors
 * 4. Verify generated values appear
 */
import { test, expect } from '@playwright/test';

test.describe('Generate SEO E2E Verification', () => {
  test.use({ storageState: 'tests/e2e/.auth/user.json' });

  // Allow up to 2 minutes for the full test (API can be slow)
  test.setTimeout(120000);

  test('Generate SEO produces valid results', async ({ page }) => {
    // Navigate to edit page
    console.log('Navigating to Keystatic editor...');
    await page.goto('/keystatic/branch/main/collection/pages/item/about');

    // Wait for page to load
    await page.waitForTimeout(5000);

    // Check if authenticated
    const pageContent = await page.content();
    if (!pageContent.includes('Save') && !pageContent.includes('content')) {
      console.log('Not authenticated - skipping');
      test.skip();
      return;
    }

    // Wait for toolbar to appear
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible({ timeout: 10000 });
    console.log('Toolbar visible');

    // Find and click Generate SEO button
    const generateButton = page.locator('button:has-text("Generate SEO")');
    await expect(generateButton).toBeVisible();
    console.log('Generate SEO button found');

    await generateButton.click();
    console.log('Clicked Generate SEO');

    // Wait for panel to open
    const panel = page.locator('[role="dialog"]');
    await expect(panel).toBeVisible({ timeout: 5000 });
    console.log('SEO Panel opened');

    // Take screenshot of panel
    await page.screenshot({ path: 'tests/e2e/screenshots/seo-panel-before-generate.png' });

    // Click the Generate button inside the panel
    const panelGenerateBtn = panel.locator('button:has-text("Generate SEO")');
    await expect(panelGenerateBtn).toBeVisible();
    await panelGenerateBtn.click();
    console.log('Clicked Generate in panel');

    // Wait for either:
    // 1. Success: Apply to Form button appears OR generated content appears
    // 2. Error: Error message appears
    const applyButton = panel.locator('button:has-text("Apply to Form")');
    const metaTitleField = panel.locator('[data-field="metaTitle"]');
    const errorMessage = panel.locator('.bg-red-50 .text-red-600');

    // Wait up to 90 seconds for generation (Universal LLM API can be slow)
    console.log('Waiting for generation to complete (up to 90s)...');

    const result = await Promise.race([
      applyButton.waitFor({ state: 'visible', timeout: 90000 }).then(() => 'success'),
      metaTitleField.waitFor({ state: 'visible', timeout: 90000 }).then(() => 'success'),
      errorMessage.waitFor({ state: 'visible', timeout: 90000 }).then(() => 'error'),
    ]).catch(() => 'timeout');

    // Take screenshot of result
    await page.screenshot({ path: 'tests/e2e/screenshots/seo-generation-result.png' });

    if (result === 'error') {
      const errorText = await errorMessage.textContent();
      console.log('ERROR:', errorText);

      // Fail the test with the actual error
      expect.soft(result).toBe('success');
      throw new Error(`SEO generation failed: ${errorText}`);
    }

    if (result === 'timeout') {
      console.log('TIMEOUT: Generation took too long');
      throw new Error('SEO generation timed out after 60 seconds');
    }

    // Success path
    console.log('SUCCESS: Generation completed');

    // Verify generated content is visible
    const metaTitlePreview = panel.locator('[data-field="metaTitle"], .meta-title-preview');
    await expect(metaTitlePreview).toBeVisible();

    const metaTitleText = await metaTitlePreview.textContent();
    console.log('Generated Meta Title:', metaTitleText);

    // Verify it contains "Bear Lake"
    expect(metaTitleText?.toLowerCase()).toContain('bear lake');

    // Take final screenshot
    await page.screenshot({ path: 'tests/e2e/screenshots/seo-generation-success.png' });

    console.log('Test PASSED - SEO generation working correctly');
  });
});
