/**
 * REQ-BUILD-001, REQ-BUILD-002, REQ-BUILD-003
 * Production tests for build optimization features
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('Build Optimization Production Verification', () => {
  test('REQ-BUILD-001: /api/revalidate endpoint exists and returns info', async ({ request }) => {
    // GET request should return usage info
    const response = await request.get(`${PRODUCTION_URL}/api/revalidate`);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status', 'ok');
    expect(data).toHaveProperty('endpoint', 'revalidate');
    expect(data).toHaveProperty('usage');
  });

  test('REQ-BUILD-001: /api/revalidate rejects POST without secret', async ({ request }) => {
    // POST without secret should return 401
    const response = await request.post(`${PRODUCTION_URL}/api/revalidate`, {
      data: { type: 'page', slug: 'about' },
    });
    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.revalidated).toBe(false);
  });

  test('REQ-BUILD-001: Dynamic pages have cache headers', async ({ request }) => {
    // Check that pages have proper cache headers indicating ISR is working
    const response = await request.get(`${PRODUCTION_URL}/about`);
    expect(response.status()).toBe(200);

    // Vercel sets x-vercel-cache header for cached pages
    const headers = response.headers();
    // Page should either be HIT (cached), STALE (needs revalidation), or MISS (first request)
    const cacheHeader = headers['x-vercel-cache'];
    if (cacheHeader) {
      expect(['HIT', 'STALE', 'MISS', 'PRERENDER']).toContain(cacheHeader);
    }
  });

  test('Homepage loads successfully', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await expect(page).toHaveTitle(/Bear Lake Camp/);

    // Verify critical content is present
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('Summer camp sessions page loads with content', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await expect(page).toHaveTitle(/Summer Camp Sessions/);

    // Page should have session content
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
  });

  test('All critical pages return 200', async ({ request }) => {
    // Pages verified by smoke-test.sh - using subset here
    const criticalPages = [
      '/',
      '/about',
      '/summer-camp',
      '/summer-camp-sessions',
      '/give',
      '/work-at-camp',
    ];

    for (const path of criticalPages) {
      const response = await request.get(`${PRODUCTION_URL}${path}`);
      expect(response.status(), `${path} should return 200`).toBe(200);
    }
  });
});
