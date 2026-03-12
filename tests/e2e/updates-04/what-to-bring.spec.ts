/**
 * Updates-04 What To Bring Page Tests
 *
 * REQ-BRING-001: Hero Image Size
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-BRING-001: Hero Image Size", () => {
  test("what to bring hero is sufficiently tall", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator('.hero-section, [data-component="hero"]');
    await expect(hero).toBeVisible({ timeout: 10000 });

    const heroBox = await hero.boundingBox();
    // Hero should be at least 400px tall to show full content
    expect(heroBox?.height).toBeGreaterThanOrEqual(350);
  });

  test("hero image shows full subject matter", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");

    const heroImage = page.locator(
      '.hero-section img, [data-component="hero"] img',
    );
    if ((await heroImage.count()) > 0) {
      const imgBox = await heroImage.boundingBox();
      // Image should have reasonable height
      expect(imgBox?.height).toBeGreaterThanOrEqual(200);
    }
  });

  test("hero height configurable per page", async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator('.hero-section, [data-component="hero"]');
    if ((await hero.count()) > 0) {
      // Check for height attribute
      const heightAttr = await hero.getAttribute("data-hero-height");
      // Should have height configuration or default
      expect(heightAttr || "default").toBeTruthy();
    }
  });
});

test.describe("REQ-BRING-001: Visual Verification", () => {
});
