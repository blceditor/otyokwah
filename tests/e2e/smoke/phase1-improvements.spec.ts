/**
 * Phase 1 Improvements E2E Tests
 * REQ-SMOKE-010: Smoke test HeroVideo support
 * REQ-HOME-001: Homepage hero displays title and tagline
 * REQ-MEDIA-001: Video Clips collection removed (verified by CMS load)
 */
import { test, expect } from "@playwright/test";

test.describe("REQ-HOME-001: Homepage Hero Content", () => {
  test("homepage hero displays title and tagline", async ({ page }) => {
    await page.goto("/");

    // Wait for hero section to load
    const heroSection = page.locator('#hero-video, [data-testid="hero-section"]');
    await expect(heroSection.first()).toBeVisible({ timeout: 10000 });

    // Check that the hero has a visible h1 title
    const heroTitle = page.locator('#hero-video h1, [data-testid="hero-section"] h1').first();
    await expect(heroTitle).toBeVisible();

    // Check that there's also a tagline/subtitle displayed
    // The tagline is "To Know Christ - Phil. 3:10" in the current design
    const heroSubtitle = page.locator('#hero-video p, [data-testid="hero-section"] p').first();
    await expect(heroSubtitle).toBeVisible();

    const subtitleText = await heroSubtitle.textContent();
    expect(subtitleText?.toLowerCase()).toContain("know christ");
  });

  test("homepage hero has meaningful content (not empty)", async ({ page }) => {
    await page.goto("/");

    const heroTitle = page.locator('#hero-video h1, [data-testid="hero-section"] h1').first();
    await expect(heroTitle).toBeVisible({ timeout: 10000 });

    const titleText = await heroTitle.textContent();
    // Title should have content and not be empty
    expect(titleText?.trim().length).toBeGreaterThan(0);
  });
});

test.describe("REQ-SMOKE-010: HeroVideo Detection", () => {
  test("homepage has HeroVideo component with id='hero-video'", async ({ page }) => {
    await page.goto("/");

    // HeroVideo component renders with id="hero-video"
    const heroVideo = page.locator('#hero-video');
    await expect(heroVideo).toBeVisible({ timeout: 10000 });

    // Should contain a video element
    const videoElement = heroVideo.locator('video');
    await expect(videoElement).toBeVisible();

    // Video should have autoplay, muted, loop attributes
    const autoplay = await videoElement.getAttribute('autoplay');
    const muted = await videoElement.getAttribute('muted');
    const loop = await videoElement.getAttribute('loop');

    expect(autoplay !== null || await videoElement.evaluate(v => (v as HTMLVideoElement).autoplay)).toBeTruthy();
    expect(muted !== null || await videoElement.evaluate(v => (v as HTMLVideoElement).muted)).toBeTruthy();
    expect(loop !== null || await videoElement.evaluate(v => (v as HTMLVideoElement).loop)).toBeTruthy();
  });

  test("homepage video is accessible (aria-hidden for decorative)", async ({ page }) => {
    await page.goto("/");

    const videoElement = page.locator('#hero-video video');
    await expect(videoElement).toBeVisible({ timeout: 10000 });

    const ariaHidden = await videoElement.getAttribute('aria-hidden');
    expect(ariaHidden).toBe('true');
  });
});

test.describe("REQ-MEDIA-001: Video Clips Collection Removed", () => {
  test("Keystatic CMS loads without videoClips in navigation", async ({ page }) => {
    // Navigate to Keystatic
    await page.goto("/keystatic");

    // Wait for Keystatic to load
    await page.waitForLoadState('networkidle');

    // Check that "Video Clips" is NOT in the navigation
    const pageContent = await page.content();
    expect(pageContent.toLowerCase()).not.toContain('video clips');
    expect(pageContent.toLowerCase()).not.toContain('videoclips');
  });

  test("Keystatic CMS homepage loads successfully", async ({ page }) => {
    // Navigate to Keystatic main page
    await page.goto("/keystatic");

    // Wait for Keystatic to load
    await page.waitForLoadState('networkidle');

    // Should show the CMS header (our custom KeystaticToolsHeader)
    const cmsContent = await page.content();
    expect(cmsContent).toContain('Media');

    // Should contain navigation items like "Content" section
    // Note: "Pages" appears in navigation under Content section
    expect(cmsContent.toLowerCase()).toContain('pages');
  });
});
