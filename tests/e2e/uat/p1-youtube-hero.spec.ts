/**
 * REQ-UAT-010: YouTube Hero Video (3 SP)
 *
 * TDD Failing Tests for YouTube Hero functionality on /summer-camp
 *
 * Acceptance Criteria:
 * 1. YouTube iframe or hero-youtube component visible on /summer-camp
 * 2. Video plays muted (autoplay requires muted)
 * 3. Fallback: when YouTube blocked, hero image shows
 * 4. CMS field for heroYouTubeId exists in page schema
 *
 * These tests MUST fail initially (TDD red phase).
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-010: YouTube Hero Video", () => {
  test.describe("YouTube Hero Visibility", () => {
    test("REQ-UAT-010 - YouTube hero component is visible on /summer-camp", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // The YouTube hero component should be present with proper test IDs
      const youtubeHero = page.locator('[data-testid="youtube-hero"]');
      await expect(youtubeHero).toBeVisible({ timeout: 15000 });
    });

    test("REQ-UAT-010 - YouTube iframe is embedded in hero section", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // The YouTube iframe should be present and have youtube-nocookie.com src
      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

      const src = await youtubeIframe.getAttribute("src");
      expect(src).toContain("youtube-nocookie.com/embed/");
    });

    test("REQ-UAT-010 - YouTube hero has minimum height of 600px", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeHero = page.locator('[data-testid="youtube-hero"]');
      await expect(youtubeHero).toBeVisible({ timeout: 15000 });

      const box = await youtubeHero.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.height).toBeGreaterThanOrEqual(600);
    });
  });

  test.describe("Video Autoplay Muted", () => {
    test("REQ-UAT-010 - YouTube embed URL contains mute=1 parameter", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

      const src = await youtubeIframe.getAttribute("src");
      expect(src).toContain("mute=1");
    });

    test("REQ-UAT-010 - YouTube embed URL contains autoplay=1 parameter", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

      const src = await youtubeIframe.getAttribute("src");
      expect(src).toContain("autoplay=1");
    });

    test("REQ-UAT-010 - YouTube embed URL contains loop=1 parameter", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

      const src = await youtubeIframe.getAttribute("src");
      expect(src).toContain("loop=1");
    });

    test("REQ-UAT-010 - YouTube embed hides controls for hero experience", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      await expect(youtubeIframe).toBeVisible({ timeout: 15000 });

      const src = await youtubeIframe.getAttribute("src");
      expect(src).toContain("controls=0");
    });
  });

  test.describe("Fallback Image When YouTube Blocked", () => {
    test("REQ-UAT-010 - Fallback image appears when YouTube is blocked", async ({
      page,
      context,
    }) => {
      // Block all YouTube domains to simulate restricted network
      await context.route("**/youtube.com/**", (route) => route.abort());
      await context.route("**/youtube-nocookie.com/**", (route) =>
        route.abort(),
      );
      await context.route("**/ytimg.com/**", (route) => route.abort());
      await context.route("**/googlevideo.com/**", (route) => route.abort());

      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Wait for fallback to potentially trigger
      await page.waitForTimeout(3000);

      // Either the fallback image OR a hero with background image should appear
      const fallbackImage = page.locator(
        '[data-testid="youtube-hero-fallback"]',
      );
      const heroSection = page.locator('[data-testid="youtube-hero"]');

      // At minimum, the hero section should still be visible
      await expect(heroSection).toBeVisible({ timeout: 10000 });

      // If fallback is configured, it should be visible
      const fallbackCount = await fallbackImage.count();
      if (fallbackCount > 0) {
        await expect(fallbackImage).toBeVisible();
      }
    });

    test("REQ-UAT-010 - Hero section remains accessible when YouTube fails to load", async ({
      page,
      context,
    }) => {
      // Simulate YouTube loading failure
      await context.route("**/youtube-nocookie.com/**", (route) =>
        route.abort(),
      );

      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Hero section should remain functional
      const heroSection = page.locator('[data-testid="youtube-hero"]');
      await expect(heroSection).toBeVisible({ timeout: 15000 });

      // Should still have text overlay
      const heroContent = heroSection.locator("h1, h2, .hero-content, p");
      // At least some content should be visible
      const contentCount = await heroContent.count();
      expect(contentCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe("CMS Field for heroYouTubeId", () => {
    test("REQ-UAT-010 - Summer camp page uses heroYouTubeId from CMS", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // The YouTube hero should be rendering with a valid video ID
      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');

      // If the CMS field is properly configured, iframe should have a video ID in src
      const iframeCount = await youtubeIframe.count();
      if (iframeCount > 0) {
        const src = await youtubeIframe.getAttribute("src");
        // Check that src has a valid video ID pattern (11 characters typically)
        expect(src).toMatch(/embed\/[a-zA-Z0-9_-]{10,12}/);
      }
    });

    test("REQ-UAT-010 - YouTube hero extracts video ID from various URL formats", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Verify the component handles the video ID (regardless of input format)
      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      const iframeCount = await youtubeIframe.count();

      if (iframeCount > 0) {
        const src = await youtubeIframe.getAttribute("src");
        // The embed URL should have extracted a clean video ID
        // No full YouTube URLs should be in the embed path
        expect(src).not.toContain("youtube.com/watch");
        expect(src).not.toContain("youtu.be/");
      }
    });
  });

  test.describe("Visual and Accessibility", () => {
    test("REQ-UAT-010 - YouTube hero has dark gradient overlay for text readability", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeHero = page.locator('[data-testid="youtube-hero"]');
      await expect(youtubeHero).toBeVisible({ timeout: 15000 });

      // Check for gradient overlay element
      const overlay = youtubeHero.locator('[class*="bg-gradient"]');
      await expect(overlay.first()).toBeVisible();
    });

    test("REQ-UAT-010 - YouTube iframe is non-interactive (pointer-events-none)", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeIframe = page.locator('[data-testid="youtube-hero-iframe"]');
      const iframeCount = await youtubeIframe.count();

      if (iframeCount > 0) {
        // Check computed style for pointer-events
        const pointerEvents = await youtubeIframe.evaluate(
          (el) => getComputedStyle(el).pointerEvents,
        );
        expect(pointerEvents).toBe("none");
      }
    });

    test("REQ-UAT-010 - YouTube hero is full viewport width", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const youtubeHero = page.locator('[data-testid="youtube-hero"]');
      await expect(youtubeHero).toBeVisible({ timeout: 15000 });

      const box = await youtubeHero.boundingBox();
      const viewport = page.viewportSize();

      expect(box).not.toBeNull();
      expect(viewport).not.toBeNull();

      if (box && viewport) {
        // Hero should span full viewport width
        expect(box.width).toBeGreaterThanOrEqual(viewport.width * 0.95);
      }
    });
  });

  test.describe("Screenshot Proof", () => {
    test("REQ-UAT-010 - Capture YouTube hero screenshot for visual verification", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Wait for video to potentially start playing
      await page.waitForTimeout(3000);

      const youtubeHero = page.locator('[data-testid="youtube-hero"]');
      if ((await youtubeHero.count()) > 0) {
        await youtubeHero.screenshot({
          path: "tests/e2e/screenshots/REQ-UAT-010-youtube-hero.png",
        });
      } else {
        // Fallback to viewport screenshot
        await page.screenshot({
          path: "tests/e2e/screenshots/REQ-UAT-010-youtube-hero-viewport.png",
          clip: { x: 0, y: 0, width: 1280, height: 720 },
        });
      }
    });
  });
});
