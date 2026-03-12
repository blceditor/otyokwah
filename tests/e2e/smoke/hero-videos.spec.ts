/**
 * REQ-VIDEO-001: Hero Video Integration Tests
 *
 * Tests that hero videos are properly integrated on all designated pages.
 * Videos should autoplay, be muted, loop, and have fallback poster images.
 *
 * Video to Page Mapping:
 * - Home page compressed.mp4 → / (index) → /videos/hero-home.mp4
 * - About compressed.mp4 → /about → /videos/hero-about.mp4
 * - Summer hero compressed.mp4 → /summer-camp → /videos/hero-summer-camp.mp4
 * - Camp sessions compressed.mp4 → /summer-camp-sessions → /videos/hero-camp-sessions.mp4
 * - Work at camp compressed.mp4 → /work-at-camp → /videos/hero-work-at-camp.mp4
 * - Summer staff compressed.mp4 → /work-at-camp-summer-staff → /videos/hero-summer-staff.mp4
 * - LIT compressed.mp4 → /work-at-camp-leaders-in-training → /videos/hero-lit.mp4
 * - Defrost compressed.mp4 → /retreats-defrost → /videos/hero-defrost.mp4
 * - Facilities compressed.mp4 → /rentals → /videos/hero-facilities.mp4
 */
import { test, expect } from "@playwright/test";

// Pages that should have hero videos
const heroVideoPages = [
  { path: "/", name: "Homepage", videoSrc: "/videos/hero-home.mp4" },
  { path: "/about", name: "About", videoSrc: "/videos/hero-about.mp4" },
  { path: "/summer-camp", name: "Summer Camp", videoSrc: "/videos/hero-camp-sessions.mp4" },
  { path: "/summer-staff-landing", name: "Summer Staff Landing", videoSrc: "/videos/hero-summer-staff.mp4" },
  { path: "/summer-camp-sessions", name: "Camp Sessions", videoSrc: "/videos/hero-camp-sessions.mp4" },
  { path: "/work-at-camp", name: "Work at Camp", videoSrc: "/videos/hero-work-at-camp.mp4" },
  { path: "/work-at-camp-summer-staff", name: "Summer Staff", videoSrc: "/videos/hero-summer-staff.mp4" },
  { path: "/work-at-camp-leaders-in-training", name: "Leaders in Training", videoSrc: "/videos/hero-lit.mp4" },
  { path: "/retreats-defrost", name: "Defrost Retreat", videoSrc: "/videos/hero-defrost.mp4" },
  { path: "/rentals", name: "Facility Rentals", videoSrc: "/videos/hero-facilities.mp4" },
];

test.describe("REQ-VIDEO-001: Hero Video Integration", () => {
  test.describe("Video Element Presence", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page (${page.path}) has hero video element`, async ({ page: p }) => {
        await p.goto(page.path);

        // Hero video should be present
        const heroVideo = p.locator('video').first();
        await expect(heroVideo).toBeVisible({ timeout: 10000 });
      });
    }
  });

  test.describe("Video Attributes", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page video has correct attributes`, async ({ page: p }) => {
        await p.goto(page.path);

        const heroVideo = p.locator('video').first();
        await expect(heroVideo).toBeVisible({ timeout: 10000 });

        // Check autoplay attribute
        const autoplay = await heroVideo.getAttribute('autoplay');
        expect(autoplay !== null || await heroVideo.evaluate(v => (v as HTMLVideoElement).autoplay)).toBeTruthy();

        // Check muted attribute (required for autoplay)
        const muted = await heroVideo.getAttribute('muted');
        expect(muted !== null || await heroVideo.evaluate(v => (v as HTMLVideoElement).muted)).toBeTruthy();

        // Check loop attribute
        const loop = await heroVideo.getAttribute('loop');
        expect(loop !== null || await heroVideo.evaluate(v => (v as HTMLVideoElement).loop)).toBeTruthy();

        // Check playsInline attribute (for mobile)
        const playsInline = await heroVideo.getAttribute('playsinline');
        expect(playsInline !== null).toBeTruthy();
      });
    }
  });

  test.describe("Video Source", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page has correct video source (${page.videoSrc})`, async ({ page: p }) => {
        await p.goto(page.path);

        // Check for video element with the expected source
        const videoSource = p.locator(`video source[src="${page.videoSrc}"], video[src="${page.videoSrc}"]`);
        const count = await videoSource.count();

        // If no direct match, check for any video source containing the filename
        if (count === 0) {
          const anyVideo = p.locator('video source, video[src]').first();
          const src = await anyVideo.getAttribute('src');
          expect(src).toContain(page.videoSrc.split('/').pop());
        } else {
          expect(count).toBeGreaterThan(0);
        }
      });
    }
  });

  test.describe("Poster Fallback", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page video has poster fallback`, async ({ page: p }) => {
        await p.goto(page.path);

        const heroVideo = p.locator('video').first();
        await expect(heroVideo).toBeVisible({ timeout: 10000 });

        // Check poster attribute exists
        const poster = await heroVideo.getAttribute('poster');
        expect(poster).toBeTruthy();
        expect(poster).toMatch(/\.(jpg|jpeg|png|webp)$/i);
      });
    }
  });

  test.describe("Hero Content Overlay", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page has hero text overlay`, async ({ page: p }) => {
        await p.goto(page.path);

        // Should have heading visible over the video
        const heroHeading = p.locator('h1').first();
        await expect(heroHeading).toBeVisible({ timeout: 10000 });

        // Heading should have readable text (white or light colored)
        const headingText = await heroHeading.textContent();
        expect(headingText?.trim().length).toBeGreaterThan(0);
      });
    }
  });

  test.describe("Video Accessibility", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page video is accessible`, async ({ page: p }) => {
        await p.goto(page.path);

        const heroVideo = p.locator('video').first();
        await expect(heroVideo).toBeVisible({ timeout: 10000 });

        // Video should be aria-hidden (decorative background)
        const ariaHidden = await heroVideo.getAttribute('aria-hidden');
        expect(ariaHidden).toBe('true');
      });
    }
  });

  test.describe("Video File Requests", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page video file loads successfully`, async ({ page: p }) => {
        // Track video file requests
        const videoRequests: string[] = [];

        p.on('request', request => {
          if (request.url().includes('.mp4') || request.url().includes('.webm')) {
            videoRequests.push(request.url());
          }
        });

        const failedRequests: string[] = [];
        p.on('response', response => {
          if (response.url().includes('.mp4') || response.url().includes('.webm')) {
            if (response.status() >= 400) {
              failedRequests.push(`${response.url()} - ${response.status()}`);
            }
          }
        });

        await p.goto(page.path);
        await p.waitForTimeout(2000); // Allow video to start loading

        // Should have made video request
        expect(videoRequests.length).toBeGreaterThan(0);

        // No video requests should have failed
        expect(failedRequests).toEqual([]);
      });
    }
  });

  test.describe("Visual Regression", () => {
    for (const page of heroVideoPages) {
      test(`${page.name} page hero section screenshot`, async ({ page: p }) => {
        await p.goto(page.path);
        await p.waitForTimeout(2000); // Allow video to start

        // Take screenshot of hero video section specifically
        const heroVideo = p.locator('#hero-video, [data-testid="hero-section"]').first();

        if (await heroVideo.count() > 0) {
          await heroVideo.screenshot({
            path: `tests/e2e/screenshots/hero-video-${page.path.replace(/\//g, '-').replace(/^-/, '') || 'home'}.png`,
          });
        } else {
          // Fallback to viewport screenshot
          await p.screenshot({
            path: `tests/e2e/screenshots/hero-video-${page.path.replace(/\//g, '-').replace(/^-/, '') || 'home'}.png`,
            clip: { x: 0, y: 0, width: 1280, height: 720 },
          });
        }
      });
    }
  });
});

test.describe("REQ-U01-001: Hero Video Height Consistency", () => {
  test("work-at-camp-summer-staff hero video has minimum height of 600px", async ({
    page,
  }) => {
    await page.goto("/work-at-camp-summer-staff");
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator("#hero-video");
    await expect(hero).toBeVisible({ timeout: 10000 });

    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox?.height).toBeGreaterThanOrEqual(600);
  });

  test("work-at-camp-leaders-in-training hero video has minimum height of 600px", async ({
    page,
  }) => {
    await page.goto("/work-at-camp-leaders-in-training");
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator("#hero-video");
    await expect(hero).toBeVisible({ timeout: 10000 });

    const heroBox = await hero.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox?.height).toBeGreaterThanOrEqual(600);
  });

  test("hero videos on work-at-camp pages match homepage hero height standard", async ({
    page,
  }) => {
    // Get homepage hero height as baseline
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const homepageHero = page.locator("#hero");
    await expect(homepageHero).toBeVisible({ timeout: 10000 });
    const homepageBox = await homepageHero.boundingBox();

    // Homepage should have min 600px height
    expect(homepageBox?.height).toBeGreaterThanOrEqual(600);

    // Compare work-at-camp-summer-staff
    await page.goto("/work-at-camp-summer-staff");
    await page.waitForLoadState("domcontentloaded");

    const summerStaffHero = page.locator("#hero-video");
    await expect(summerStaffHero).toBeVisible({ timeout: 10000 });
    const summerStaffBox = await summerStaffHero.boundingBox();

    // Allow 5% variance for viewport differences
    expect(summerStaffBox?.height).toBeGreaterThanOrEqual(
      Math.min(homepageBox?.height ?? 600, 600) * 0.95
    );
  });
});

test.describe("REQ-VIDEO-002: Video Performance", () => {
  test("Homepage video loads within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    // Wait for video to be ready to play
    const video = page.locator('video').first();
    await expect(video).toBeVisible({ timeout: 10000 });

    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return v && v.readyState >= 2; // HAVE_CURRENT_DATA
    }, { timeout: 15000 });

    const loadTime = Date.now() - startTime;

    // Video should load within 10 seconds
    expect(loadTime).toBeLessThan(10000);
  });

  test("Video files are appropriately sized (compressed)", async ({ page }) => {
    const videoSizes: { url: string; size: number }[] = [];

    page.on('response', async response => {
      if (response.url().includes('.mp4')) {
        const contentLength = response.headers()['content-length'];
        if (contentLength) {
          videoSizes.push({
            url: response.url(),
            size: parseInt(contentLength, 10),
          });
        }
      }
    });

    await page.goto("/");
    await page.waitForTimeout(3000);

    // Compressed videos should be under 10MB each
    for (const video of videoSizes) {
      const sizeMB = video.size / (1024 * 1024);
      expect(sizeMB).toBeLessThan(10);
    }
  });
});
