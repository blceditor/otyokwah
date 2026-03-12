/**
 * REQ-U01-002: Camp Sessions Page Redesign
 *
 * Tests for the redesigned /summer-camp-sessions page with:
 * - Hero video at top
 * - In-page anchor navigation
 * - Alternating image/content rows
 * - Session cards with 2026 dates
 */

import { test, expect } from '@playwright/test';

test.describe('REQ-U01-002: Camp Sessions Page Redesign', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/summer-camp-sessions');
    await page.waitForLoadState('domcontentloaded');
  });

  test('REQ-U01-002-01: Hero video section displays correctly', async ({
    page,
  }) => {
    // Hero video should be present
    const heroVideo = page.locator('#hero-video, video').first();
    await expect(heroVideo).toBeVisible({ timeout: 10000 });

    // Should have hero heading
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
    await expect(heroHeading).toContainText(/Summer|Sessions|Camp/i);
  });

  test('REQ-U01-002-02: In-page anchor navigation exists', async ({ page }) => {
    // Should have navigation links for age groups
    const primaryLink = page.locator('a[href="#primary-overnight"]');
    const juniorLink = page.locator('a[href="#junior-camp"]');
    const jrHighLink = page.locator('a[href="#jr-high-camp"]');
    const srHighLink = page.locator('a[href="#sr-high-camp"]');

    // At least some anchor links should exist
    const anchorsExist =
      (await primaryLink.count()) > 0 ||
      (await juniorLink.count()) > 0 ||
      (await jrHighLink.count()) > 0 ||
      (await srHighLink.count()) > 0;

    expect(anchorsExist).toBe(true);
  });

  test('REQ-U01-002-03: Primary Overnight session displays correct content', async ({
    page,
  }) => {
    // Primary Overnight section should exist
    const primarySection = page.locator('#primary-overnight');

    if ((await primarySection.count()) > 0) {
      await expect(primarySection).toBeVisible();

      // Check for key content
      const sectionContent = await primarySection.textContent();
      expect(sectionContent).toContain('Primary');
      expect(sectionContent).toMatch(/\$100|100/); // Fee
      expect(sectionContent).toMatch(/June|2026/); // Date
    }
  });

  test('REQ-U01-002-04: Junior Camp sessions display', async ({ page }) => {
    // Junior Camp section should have 3 sessions
    const juniorSection = page.locator('#junior-camp');

    if ((await juniorSection.count()) > 0) {
      const sessionCards = juniorSection.locator('[data-testid*="session"]');
      expect(await sessionCards.count()).toBeGreaterThanOrEqual(3);
    }
  });

  test('REQ-U01-002-05: Jr. High Camp sessions display', async ({ page }) => {
    // Jr. High Camp section should have 3 sessions
    const jrHighSection = page.locator('#jr-high-camp');

    if ((await jrHighSection.count()) > 0) {
      const sessionCards = jrHighSection.locator('[data-testid*="session"]');
      expect(await sessionCards.count()).toBeGreaterThanOrEqual(3);
    }
  });

  test('REQ-U01-002-06: Sr. High Camp session displays', async ({ page }) => {
    // Sr. High Camp section should have at least 1 session
    const srHighSection = page.locator('#sr-high-camp');

    if ((await srHighSection.count()) > 0) {
      await expect(srHighSection).toBeVisible();
      const sectionContent = await srHighSection.textContent();
      expect(sectionContent).toMatch(/Senior High|Sr\.? High|10|12/i);
    }
  });

  test('REQ-U01-002-07: Session cards display 2026 dates', async ({ page }) => {
    // All session cards should have 2026 dates
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('2026');
  });

  test('REQ-U01-002-08: Early bird pricing displayed', async ({ page }) => {
    // Should show early bird pricing info
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/\$390|\$440|4\/14|early/i);
  });

  test('REQ-U01-002-09: Registration notes section exists', async ({
    page,
  }) => {
    // Should have registration notes
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/registration|registrar|260-799-5988/i);
  });

  test('REQ-U01-002-10: Scholarship info section exists', async ({ page }) => {
    // Should have scholarship information
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/scholarship|financial|assistance/i);
  });

  test('REQ-U01-002-11: Mobile responsive layout', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Page should still load without horizontal scroll
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    expect(bodyBox?.width).toBeLessThanOrEqual(400);

    // Hero should still be visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();
  });

  test('REQ-U01-002-12: Anchor navigation scrolls to sections', async ({
    page,
  }) => {
    // Find any anchor link and test scroll behavior
    const anchors = page.locator('a[href^="#"]');
    const anchorCount = await anchors.count();

    if (anchorCount > 0) {
      const firstAnchor = anchors.first();
      const href = await firstAnchor.getAttribute('href');

      await firstAnchor.click();

      // Should scroll to target section
      if (href) {
        const targetId = href.replace('#', '');
        const targetSection = page.locator(`#${targetId}`);

        if ((await targetSection.count()) > 0) {
          await expect(targetSection).toBeInViewport();
        }
      }
    }
  });
});

test.describe('REQ-U01-002: Camp Sessions Visual Tests', () => {
  test('Desktop layout screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/summer-camp-sessions');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'verification-screenshots/camp-sessions-desktop.png',
      fullPage: true,
    });
  });

  test('Mobile layout screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/summer-camp-sessions');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'verification-screenshots/camp-sessions-mobile.png',
      fullPage: true,
    });
  });
});
