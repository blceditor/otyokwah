/**
 * Production smoke test: UltraCamp session data integrity
 *
 * Validates that the summer-camp-sessions page displays session capacity
 * data from the correct UltraCamp camp (not cross-contaminated from
 * another tenant's data).
 *
 * Each deployment sets ULTRACAMP_CAMP_ID in its Vercel environment:
 * - Bear Lake Camp: 268
 * - Camp Otyokwah: 1342
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('UltraCamp session data integrity', () => {
  test.setTimeout(60_000);

  test('session page loads with capacity bars', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`, {
      waitUntil: 'domcontentloaded',
    });

    // Page should have session content
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Should have at least one capacity indicator (spots left or Waitlist)
    const capacityIndicators = page.locator(
      'text=/\\d+ spots left|Waitlist|Full/'
    );
    const count = await capacityIndicators.count();
    expect(count).toBeGreaterThan(0);
  });

  test('all UltraCamp links use consistent camp ID', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`, {
      waitUntil: 'domcontentloaded',
    });

    // Extract all idCamp values from ultracamp links
    const campIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[href*="ultracamp"]'))
        .map((a) => {
          try {
            return new URL((a as HTMLAnchorElement).href).searchParams.get(
              'idCamp'
            );
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    );

    expect(campIds.length).toBeGreaterThan(0);

    // All links should use the same camp ID
    const uniqueIds = [...new Set(campIds)];
    expect(uniqueIds).toHaveLength(1);
  });

  test('session data matches site identity', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`, {
      waitUntil: 'domcontentloaded',
    });

    const title = await page.title();
    const campId = await page.evaluate(() => {
      const link = document.querySelector(
        'a[href*="ultracamp"][href*="idCamp"]'
      );
      if (!link) return null;
      try {
        return new URL((link as HTMLAnchorElement).href).searchParams.get(
          'idCamp'
        );
      } catch {
        return null;
      }
    });

    // Cross-check: if title says "Bear Lake", camp ID should be 268
    // If title says "Otyokwah", camp ID should be 1342
    if (title.includes('Bear Lake')) {
      expect(campId).toBe('268');
    } else if (title.includes('Otyokwah')) {
      expect(campId).toBe('1342');
    }
  });

  test('session prices are reasonable (not cross-tenant)', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`, {
      waitUntil: 'domcontentloaded',
    });

    // Extract all price elements matching "$X / $Y" pattern
    const prices = await page.evaluate(() =>
      Array.from(document.querySelectorAll('*'))
        .filter(
          (el) =>
            el.children.length === 0 &&
            /^\$\d+\s*\/\s*\$\d+$/.test(el.textContent?.trim() || '')
        )
        .map((el) => el.textContent?.trim() || '')
    );

    if (prices.length > 0) {
      // All session prices should be consistent (same pricing structure)
      const uniquePrices = [...new Set(prices)];
      // A healthy camp should have at most 2-3 price tiers, not a random mix
      expect(uniquePrices.length).toBeLessThanOrEqual(4);
    }
  });
});
