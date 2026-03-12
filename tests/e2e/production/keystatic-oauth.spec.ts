/**
 * REQ-U01-005: GitHub OAuth Keystatic 404 Fix
 *
 * Tests that the Keystatic OAuth callback route exists and functions correctly.
 * This is critical for collaborators to access the CMS.
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('REQ-U01-005: Keystatic OAuth Callback Route', () => {
  test('OAuth callback route returns non-404 status', async ({ request }) => {
    // The callback route should exist even without valid OAuth code
    const response = await request.get(
      `${PRODUCTION_URL}/api/keystatic/github/oauth/callback`
    );

    // Route should exist (may return 400 for missing params, but NOT 404)
    expect(response.status()).not.toBe(404);
  });

  test('OAuth callback accepts code parameter', async ({ request }) => {
    // Route should accept code parameter (will fail auth but route should exist)
    const response = await request.get(
      `${PRODUCTION_URL}/api/keystatic/github/oauth/callback?code=test123&state=abc`
    );

    // Should process request (may fail auth, but route should exist)
    expect(response.status()).not.toBe(404);
  });

  test('Keystatic admin page loads', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);

    // Should load the Keystatic admin page
    await expect(page).toHaveTitle(/Keystatic|Bear Lake Camp/);

    // Should have sign-in option
    const signInButton = page.locator('text=Sign in');
    await expect(signInButton).toBeVisible({ timeout: 10000 });
  });

  test('Keystatic base API route exists', async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/keystatic`);

    // Route should exist
    expect(response.status()).not.toBe(404);
  });
});
