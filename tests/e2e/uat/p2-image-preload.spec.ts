/**
 * P2 Polish - Image Preload Tests (TDD - Expected to Fail Initially)
 *
 * REQ-UAT-004: Image Preload (1 SP)
 * - Mission section image does NOT have loading="lazy"
 * - Image request starts within first 2 seconds of page load
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-004: Image Preload", () => {
  test("REQ-UAT-004 - Mission section image does NOT have loading=lazy", async ({
    page,
  }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    // Find the mission section image
    const missionSection = page.locator('#mission');

    // Get the first image in the mission section
    const missionImage = missionSection.locator("img").first();

    // Verify the mission section exists
    await expect(missionSection).toBeVisible({ timeout: 10000 });

    // Verify image exists
    await expect(missionImage).toBeVisible({ timeout: 10000 });

    // Get the loading attribute
    const loadingAttr = await missionImage.getAttribute("loading");

    // MUST NOT be lazy loaded - this is above-the-fold critical content
    expect(loadingAttr).not.toBe("lazy");
  });

  test("REQ-UAT-004 - Mission image request starts within first 2 seconds", async ({
    page,
  }) => {
    // Track image requests timing
    const imageRequests: { url: string; timestamp: number }[] = [];
    let navigationStart: number = 0;

    page.on("request", (request) => {
      if (request.resourceType() === "image") {
        const timestamp = Date.now();
        if (navigationStart === 0) {
          navigationStart = timestamp;
        }
        imageRequests.push({
          url: request.url(),
          timestamp: timestamp - navigationStart,
        });
      }
    });

    // Record navigation start
    navigationStart = Date.now();
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    // Find mission section image
    const missionSection = page.locator('#mission');
    const missionImage = missionSection.locator("img").first();
    await expect(missionImage).toBeVisible({ timeout: 10000 });

    const imageSrc = await missionImage.getAttribute("src");

    // Find when this image was requested
    const missionImageRequest = imageRequests.find(
      (req) => imageSrc && req.url.includes(imageSrc.split("?")[0]),
    );

    // The mission image MUST be requested within the first 2 seconds
    // If the image is lazy loaded, it won't be requested until scroll
    expect(missionImageRequest).toBeDefined();
    expect(missionImageRequest!.timestamp).toBeLessThan(2000);
  });

  test("REQ-UAT-004 - Mission image has eager loading or no loading attribute", async ({
    page,
  }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    const missionSection = page.locator('#mission');
    const missionImage = missionSection.locator("img").first();
    await expect(missionImage).toBeVisible({ timeout: 10000 });

    const loadingAttr = await missionImage.getAttribute("loading");

    // Should be either "eager" or no loading attribute (which defaults to eager)
    expect(loadingAttr === "eager" || loadingAttr === null).toBe(true);
  });

  test("REQ-UAT-004 - Mission image has priority or fetchpriority attribute", async ({
    page,
  }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    const missionSection = page.locator('#mission');
    const missionImage = missionSection.locator("img").first();
    await expect(missionImage).toBeVisible({ timeout: 10000 });

    // Check for Next.js priority prop (renders as fetchpriority="high")
    const fetchPriority = await missionImage.getAttribute("fetchpriority");
    const dataPriority = await missionImage.getAttribute("data-priority");

    // At least one of these should indicate high priority
    const hasPriority =
      fetchPriority === "high" ||
      dataPriority === "true" ||
      dataPriority === "high";

    expect(hasPriority).toBe(true);
  });
});
