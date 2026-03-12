/**
 * P2 Polish - Hero Height Tests (TDD - Expected to Fail Initially)
 *
 * REQ-UAT-014: Hero Height (1 SP)
 * - Hero on /summer-camp-what-to-bring is at least 400px tall
 * - Full subjects visible (no awkward cropping)
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-014: Hero Height - What To Bring Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-014 - Hero section is at least 400px tall", async ({
    page,
  }) => {
    // Find the hero section
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Get the hero dimensions
    const heroBox = await heroSection.boundingBox();
    expect(heroBox).toBeTruthy();

    // Hero MUST be at least 400px tall
    expect(heroBox!.height).toBeGreaterThanOrEqual(400);
  });

  test("REQ-UAT-014 - Hero has minimum height CSS property set", async ({
    page,
  }) => {
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Check computed minHeight
    const minHeight = await heroSection.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        minHeight: styles.minHeight,
        height: styles.height,
      };
    });

    // Should have a minHeight of at least 400px or height of at least 400px
    const minHeightValue = parseFloat(minHeight.minHeight) || 0;
    const heightValue = parseFloat(minHeight.height) || 0;

    expect(minHeightValue >= 400 || heightValue >= 400).toBe(true);
  });

  test("REQ-UAT-014 - Hero image is displayed without awkward cropping", async ({
    page,
  }) => {
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    // Find the hero image
    const heroImage = heroSection.locator("img");

    if ((await heroImage.count()) > 0) {
      const imageStyles = await heroImage.first().evaluate((img) => {
        const styles = getComputedStyle(img);
        return {
          objectFit: styles.objectFit,
          objectPosition: styles.objectPosition,
          height: styles.height,
          width: styles.width,
        };
      });

      // Object-fit should be 'cover' or 'contain' to prevent distortion
      expect(["cover", "contain"]).toContain(imageStyles.objectFit);

      // Object-position should center the subject (center or top center)
      // This helps ensure heads aren't cropped off
      expect(imageStyles.objectPosition).toMatch(
        /center|top|50%.*50%|50%.*0%|center.*top/i,
      );
    }
  });

  test("REQ-UAT-014 - Hero image has sufficient visible height", async ({
    page,
  }) => {
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const heroImage = heroSection.locator("img");

    if ((await heroImage.count()) > 0) {
      const imageBox = await heroImage.first().boundingBox();
      expect(imageBox).toBeTruthy();

      // Image should have reasonable height to show full subjects
      // At least 200px visible height
      expect(imageBox!.height).toBeGreaterThanOrEqual(200);
    }
  });

  test("REQ-UAT-014 - Hero has proper aspect ratio for content visibility", async ({
    page,
  }) => {
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const heroBox = await heroSection.boundingBox();
    expect(heroBox).toBeTruthy();

    // Hero should not be too squished (aspect ratio > 2:1 is too wide/short)
    // For a 1280px viewport, hero should be at least 320px tall (4:1 ratio max)
    const aspectRatio = heroBox!.width / heroBox!.height;
    expect(aspectRatio).toBeLessThan(4);
  });
});

test.describe("REQ-UAT-014: Hero Height - Mobile Responsiveness", () => {
  test("REQ-UAT-014 - Hero maintains minimum height on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");

    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const heroBox = await heroSection.boundingBox();
    expect(heroBox).toBeTruthy();

    // On mobile, hero should still be at least 300px tall
    expect(heroBox!.height).toBeGreaterThanOrEqual(300);
  });

  test("REQ-UAT-014 - Hero image is not cropped on mobile", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");

    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const heroImage = heroSection.locator("img");

    if ((await heroImage.count()) > 0) {
      const imageBox = await heroImage.first().boundingBox();
      expect(imageBox).toBeTruthy();

      // Image should maintain reasonable height on mobile
      expect(imageBox!.height).toBeGreaterThanOrEqual(150);
    }
  });
});

test.describe("REQ-UAT-014: Hero Height - Visual Verification", () => {
  test("REQ-UAT-014 - Screenshot verification of hero height", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("networkidle");

    // Wait for images to load
    await page.waitForTimeout(2000);

    // Take screenshot for visual verification
    await page.screenshot({
      path: "verification-screenshots/uat-what-to-bring-hero.png",
      fullPage: false,
    });

    // Get hero dimensions for logging
    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    const heroBox = await heroSection.boundingBox();
    console.log(`Hero dimensions: ${heroBox?.width}x${heroBox?.height}px`);

    // Verify hero meets requirements
    expect(heroBox).toBeTruthy();
    expect(heroBox!.height).toBeGreaterThanOrEqual(400);
  });

  test("REQ-UAT-014 - Hero image shows full subjects without head cropping", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("networkidle");

    const heroSection = page
      .locator('[data-component="hero"]')
      .or(page.locator(".hero-section"))
      .or(page.locator('[class*="hero"]'))
      .or(page.locator("section").first());

    await expect(heroSection).toBeVisible({ timeout: 10000 });

    const heroImage = heroSection.locator("img");

    if ((await heroImage.count()) > 0) {
      // Get image properties
      const imageInfo = await heroImage.first().evaluate((img) => {
        const styles = getComputedStyle(img);
        const rect = img.getBoundingClientRect();
        return {
          naturalWidth: (img as HTMLImageElement).naturalWidth,
          naturalHeight: (img as HTMLImageElement).naturalHeight,
          displayWidth: rect.width,
          displayHeight: rect.height,
          objectFit: styles.objectFit,
          objectPosition: styles.objectPosition,
        };
      });

      console.log(`Image info:`, JSON.stringify(imageInfo, null, 2));

      // Calculate if image is being significantly cropped
      const naturalAspectRatio =
        imageInfo.naturalWidth / imageInfo.naturalHeight;
      const displayAspectRatio =
        imageInfo.displayWidth / imageInfo.displayHeight;

      // If aspect ratios differ significantly, check that object-position is set appropriately
      // to avoid cropping heads (should be 'top' or 'center')
      if (Math.abs(naturalAspectRatio - displayAspectRatio) > 0.1) {
        // When cropping occurs, position should prioritize showing subjects
        expect(imageInfo.objectPosition).toMatch(/top|center|50%/i);
      }
    }
  });
});
