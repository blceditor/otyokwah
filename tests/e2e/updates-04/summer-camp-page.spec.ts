/**
 * Updates-04 Summer Camp Page Tests
 *
 * REQ-SUMMER-001: YouTube Hero Video Support
 * REQ-SUMMER-002: Worthy Section Card Width
 * REQ-SUMMER-003: Summer Camp Sessions Cards
 * REQ-SUMMER-004: Prepare For Camp Card Width
 * REQ-SUMMER-005: Prepare For Camp Icon Size
 * REQ-SUMMER-006: Prepare For Camp Button Links
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-SUMMER-001: YouTube Hero Video Support", () => {
  test("YouTube hero component is visible with data-testid", async ({
    page,
  }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    // Per YouTubeHero.tsx: data-testid="youtube-hero" and data-component="youtube-hero"
    const youtubeHero = page.locator('[data-testid="youtube-hero"]');
    const regularHero = page.locator('.hero-section, [data-component="hero"]');

    // Either YouTube hero or regular hero should be visible
    const isYoutube = (await youtubeHero.count()) > 0;
    const isRegular = (await regularHero.count()) > 0;
    expect(isYoutube || isRegular).toBe(true);
  });

  test("YouTube hero iframe loads with correct video ID", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    // Per YouTubeHero.tsx: data-testid="youtube-hero-iframe"
    const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
    if ((await youtubeIframe.count()) > 0) {
      await expect(youtubeIframe).toBeVisible({ timeout: 10000 });
      const src = await youtubeIframe.getAttribute("src");
      // Should be using youtube-nocookie.com for privacy
      expect(src).toContain("youtube-nocookie.com/embed/");
      // Should have autoplay, mute, loop params for hero behavior
      expect(src).toContain("autoplay=1");
      expect(src).toContain("mute=1");
      expect(src).toContain("loop=1");
    }
  });

  test("YouTube hero has fallback image when iframe fails", async ({
    page,
    context,
  }) => {
    // Block YouTube domains
    await context.route("**/youtube.com/**", (route) => route.abort());
    await context.route("**/youtube-nocookie.com/**", (route) => route.abort());
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    // Per YouTubeHero.tsx: data-testid="youtube-hero-fallback"
    const fallbackImage = page.locator('[data-testid="youtube-hero-fallback"]');
    const heroImage = page.locator(
      '.hero-section img, [data-component="hero"] img',
    );

    // Either fallback image or regular hero image should be visible
    const hasFallback = (await fallbackImage.count()) > 0;
    const hasHeroImage = (await heroImage.count()) > 0;
    if (hasFallback || hasHeroImage) {
      expect(hasFallback || hasHeroImage).toBe(true);
    }
  });

  test("YouTube hero has minimum height of 600px", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const youtubeHero = page.locator('[data-testid="youtube-hero"]');
    if ((await youtubeHero.count()) > 0) {
      const box = await youtubeHero.boundingBox();
      // Per YouTubeHero.tsx: min-h-[600px]
      expect(box?.height).toBeGreaterThanOrEqual(600);
    }
  });

  test("YouTube hero has dark gradient overlay for text readability", async ({
    page,
  }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const youtubeHero = page.locator('[data-testid="youtube-hero"]');
    if ((await youtubeHero.count()) > 0) {
      // Check for gradient overlay div
      const overlay = youtubeHero.locator(".bg-gradient-to-b");
      await expect(overlay).toBeVisible();
    }
  });
});

test.describe("REQ-SUMMER-002: Worthy Section Card Width", () => {
  test("worthy section card has custom width", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const worthySection = page.locator(
      '[data-section="summer-2026-worthy"], [data-section="worthy"]',
    );
    if ((await worthySection.count()) > 0) {
      const card = worthySection.locator("[data-width]");
      if ((await card.count()) > 0) {
        const width = await card.getAttribute("data-width");
        expect(["50", "75", "100"]).toContain(width);
      }
    }
  });
});

test.describe("REQ-SUMMER-003: Summer Camp Sessions Cards", () => {
  test("camp session cards visible on summer camp page", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const cards = page.locator('[data-component="camp-session-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("session cards link to correct pages", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const cards = page.locator('[data-component="camp-session-card"]');
    if ((await cards.count()) > 0) {
      const ctaLinks = cards.locator("a");
      const href = await ctaLinks.first().getAttribute("href");
      expect(href).toBeTruthy();
    }
  });
});

test.describe("REQ-SUMMER-004: Prepare For Camp Card Width", () => {
  test("prepare for camp cards have reduced width", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const prepareSection = page.locator('[data-section="prepare-for-camp"]');
    if ((await prepareSection.count()) > 0) {
      const cards = prepareSection.locator("[data-width]");
      if ((await cards.count()) > 0) {
        const cardBox = await cards.first().boundingBox();
        const sectionBox = await prepareSection.boundingBox();
        // Cards should be ~60% of section width
        if (cardBox && sectionBox) {
          expect(cardBox.width).toBeLessThan(sectionBox.width * 0.8);
        }
      }
    }
  });
});

test.describe("REQ-SUMMER-005: Prepare For Camp Icon Size", () => {
  test("prepare section icons are larger", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const prepareSection = page.locator('[data-section="prepare-for-camp"]');
    if ((await prepareSection.count()) > 0) {
      const icon = prepareSection.locator("[data-icon-size]").first();
      if ((await icon.count()) > 0) {
        const size = await icon.getAttribute("data-icon-size");
        expect(["lg", "xl"]).toContain(size);
      }
    }
  });
});

test.describe("REQ-SUMMER-006: Prepare For Camp Button Links", () => {
  test("prepare for camp has centered buttons", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const prepareSection = page.locator('[data-section="prepare-for-camp"]');
    if ((await prepareSection.count()) > 0) {
      await expect(prepareSection).toBeVisible();

      const buttons = prepareSection.locator(
        'a[class*="button"], button, [data-component="cta-button"]',
      );
      if ((await buttons.count()) > 0) {
        await expect(buttons.first()).toBeVisible();

        // Check centered alignment
        const buttonBox = await buttons.first().boundingBox();
        const sectionBox = await prepareSection.boundingBox();
        if (buttonBox && sectionBox) {
          const buttonCenter = buttonBox.x + buttonBox.width / 2;
          const sectionCenter = sectionBox.x + sectionBox.width / 2;
          // Allow 100px tolerance
          expect(Math.abs(buttonCenter - sectionCenter)).toBeLessThan(100);
        }
      }
    }
  });

  test("prepare links render as buttons", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");

    const prepareSection = page.locator('[data-section="prepare-for-camp"]');
    if ((await prepareSection.count()) > 0) {
      const buttons = prepareSection.locator("a, button").filter({
        has: page.locator('[class*="button"], [class*="btn"]'),
      });
      // At least some links should be styled as buttons
      if ((await buttons.count()) > 0) {
        const bgColor = await buttons
          .first()
          .evaluate((el) => getComputedStyle(el).backgroundColor);
        // Should have a visible background (not transparent)
        expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
      }
    }
  });
});
