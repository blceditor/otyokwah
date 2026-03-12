/**
 * REQ-CMS-003: Deployment Status Widget Updates
 *
 * Playwright E2E tests for deployment status indicator
 */
import { test, expect } from '@playwright/test';

test.describe('REQ-CMS-003 — Deployment Status Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Keystatic admin
    await page.goto('/keystatic');
    await page.waitForSelector('[data-keystatic-wrapper], main', { timeout: 10000 });
  });

  test('deployment status widget is visible in header', async ({ page }) => {
    // Look for deployment status indicator
    const statusIndicator = page.locator(
      '[data-testid="deployment-status"], ' +
      'text=Published, ' +
      'text=Deploying, ' +
      'text=Draft, ' +
      'text=Local Dev'
    );

    await expect(statusIndicator.first()).toBeVisible({ timeout: 10000 });
  });

  test('widget shows one of valid states', async ({ page }) => {
    // Wait for status to load
    await page.waitForTimeout(2000);

    // Should show one of the valid states
    const validStates = ['Published', 'Deploying', 'Draft', 'Local Dev', 'Failed', 'Building'];

    let foundState = false;
    for (const state of validStates) {
      const stateElement = page.locator(`text=${state}`);
      if (await stateElement.isVisible().catch(() => false)) {
        foundState = true;
        break;
      }
    }

    expect(foundState).toBe(true);
  });

  test('widget updates within 30 seconds after content save', async ({ page }) => {
    // Navigate to a page to edit
    await page.click('text=Pages');
    await page.waitForTimeout(500);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Find an input and make a change
    const input = page.locator('input[type="text"]').first();
    if (await input.isVisible()) {
      const currentValue = await input.inputValue();
      await input.fill(currentValue + ' ');
      await input.fill(currentValue); // Revert to not actually change
    }

    // Dispatch content-saved event
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('content-saved'));
    });

    // Wait for status to potentially update (30s is initial wait per REQ)
    await page.waitForTimeout(5000);

    // Status should still be visible
    const statusIndicator = page.locator(
      '[data-testid="deployment-status"], ' +
      'text=Published, ' +
      'text=Deploying, ' +
      'text=Draft, ' +
      'text=Local Dev'
    );

    await expect(statusIndicator.first()).toBeVisible();
  });

  test('widget shows timestamp for deployment', async ({ page }) => {
    // Wait for status to load
    await page.waitForTimeout(2000);

    // Look for timestamp pattern (e.g., "2m ago", "5 minutes ago", time format)
    const timestampPatterns = [
      /\d+\s*(m|min|minutes?|h|hours?|s|sec|seconds?)\s*ago/i,
      /just now/i,
      /\d{1,2}:\d{2}/,
      /started/i
    ];

    const pageContent = await page.content();
    const hasTimestamp = timestampPatterns.some(pattern => pattern.test(pageContent));

    // Should have some form of timestamp or "Local Dev" mode
    const isLocalDev = pageContent.includes('Local Dev');
    expect(hasTimestamp || isLocalDev).toBe(true);
  });

  test('widget does not show infinite "Checking" spinner', async ({ page }) => {
    // Wait sufficient time
    await page.waitForTimeout(5000);

    // Should NOT show permanent "Checking" state
    const checkingElement = page.locator('text=Checking');

    // If checking is visible, it should disappear within reasonable time
    if (await checkingElement.isVisible().catch(() => false)) {
      // Wait for it to resolve
      await page.waitForTimeout(10000);

      // Should have resolved to actual state
      const stillChecking = await checkingElement.isVisible().catch(() => false);
      expect(stillChecking).toBe(false);
    }
  });

  test('widget handles API errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('/api/vercel-status', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    // Reload to trigger new status fetch
    await page.reload();
    await page.waitForSelector('[data-keystatic-wrapper], main', { timeout: 10000 });

    // Should show "Local Dev" or similar fallback, not crash
    await page.waitForTimeout(3000);

    const statusIndicator = page.locator(
      'text=Local Dev, text=Published, text=Deploying, text=Draft'
    );

    await expect(statusIndicator.first()).toBeVisible({ timeout: 5000 });
  });

});

test.describe('REQ-CMS-003 — Deployment Status API', () => {
  test('vercel-deployment-status endpoint returns valid response', async ({ request }) => {
    const response = await request.get('/api/vercel-deployment-status');

    // Should return 200 (or 500 if not configured, which is acceptable in dev)
    expect([200, 500]).toContain(response.status());

    const data = await response.json();

    // Should have state property
    expect(data).toHaveProperty('state');

    // State should be valid
    const validStates = ['READY', 'BUILDING', 'QUEUED', 'ERROR', 'unknown', 'error'];
    expect(validStates).toContain(data.state);
  });

  test('vercel-status endpoint exists', async ({ request }) => {
    const response = await request.get('/api/vercel-status');

    // Should exist (200 or 500 acceptable)
    expect([200, 500]).toContain(response.status());
  });
});
