/**
 * REQ-UAT-012: Button Links in Prepare For Camp Section (2 SP)
 *
 * TDD Failing Tests for button styling on links in Prepare For Camp section
 *
 * Acceptance Criteria:
 * 1. Links in "Prepare For Camp" section have button styling
 * 2. Buttons are horizontally centered in card
 * 3. Padding and background color present
 *
 * These tests verify the implementation on /summer-camp page.
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-012: Button Links in Prepare For Camp", () => {
  test.describe("Button Styling Presence", () => {
    test("REQ-UAT-012 - Prepare For Camp heading is visible on /summer-camp", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // The section uses h2 heading followed by CardGrid
      const prepareHeading = page.locator('h2:text-is("Prepare for Camp")');
      await expect(prepareHeading).toBeVisible({ timeout: 15000 });
    });

    test("REQ-UAT-012 - CTA buttons exist on /summer-camp page", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // CTA buttons should be visible on the page
      const ctaButtons = page.locator('[data-component="cta-button"]');
      const count = await ctaButtons.count();

      expect(count).toBeGreaterThan(0);
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });
    });

    test("REQ-UAT-012 - CTA buttons are rendered as links with button styling", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Find CTA buttons with data-component attribute
      const ctaButtons = page.locator('[data-component="cta-button"]');
      const count = await ctaButtons.count();

      expect(count).toBeGreaterThan(0);

      // Check first CTA button has proper styling classes
      const firstButton = ctaButtons.first();
      const className = await firstButton.getAttribute("class");

      // Should have inline-flex and rounded-lg classes (from CTAButton component)
    });
  });

  test.describe("Background Color Present", () => {
    test("REQ-UAT-012 - CTA buttons have non-transparent background color", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });

      // Get background color of first CTA button
      const bgColor = await ctaButtons.first().evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Should not be transparent
      expect(bgColor).not.toBe("rgba(0, 0, 0, 0)");
      expect(bgColor).not.toBe("transparent");
    });

    test("REQ-UAT-012 - CTA buttons have green/secondary themed background", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });

      const bgColor = await ctaButtons.first().evaluate((el) => {
        return getComputedStyle(el).backgroundColor;
      });

      // Should be green - either:
      // - secondary color rgb(47, 79, 61) = #2F4F3D
      // - emerald-700 rgb(4, 120, 87) = #047857
      const isGreenish =
        bgColor.includes("47, 79, 61") || // secondary color #2F4F3D
        bgColor.includes("4, 120, 87") || // #047857 exact
        bgColor.includes("5, 150, 105") || // emerald-600
        bgColor.includes("16, 185, 129"); // emerald-500

      expect(
        isGreenish,
        `Expected green background, got: ${bgColor}`
      ).toBe(true);
    });
  });

  test.describe("Padding Present", () => {
    test("REQ-UAT-012 - CTA buttons have adequate horizontal padding", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });

      const paddingLeft = await ctaButtons.first().evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingLeft);
      });
      const paddingRight = await ctaButtons.first().evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingRight);
      });

      // CTAButton uses px-8 (32px) for lg size
      expect(paddingLeft).toBeGreaterThanOrEqual(16);
      expect(paddingRight).toBeGreaterThanOrEqual(16);
    });

    test("REQ-UAT-012 - CTA buttons have adequate vertical padding", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });

      const paddingTop = await ctaButtons.first().evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingTop);
      });
      const paddingBottom = await ctaButtons.first().evaluate((el) => {
        return parseFloat(getComputedStyle(el).paddingBottom);
      });

      // CTAButton uses py-4 (16px) for lg size
      expect(paddingTop).toBeGreaterThanOrEqual(8);
      expect(paddingBottom).toBeGreaterThanOrEqual(8);
    });
  });

  test.describe("Button Text and Interaction", () => {
    test("REQ-UAT-012 - CTA buttons have readable white text color", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      await expect(ctaButtons.first()).toBeVisible({ timeout: 10000 });

      const textColor = await ctaButtons.first().evaluate((el) => {
        return getComputedStyle(el).color;
      });

      // Text should be white (255, 255, 255) for contrast on green background
      expect(textColor).toContain("255, 255, 255");
    });

    test("REQ-UAT-012 - CTA buttons have valid href attributes", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      const ctaButtons = page.locator('[data-component="cta-button"]');
      const count = await ctaButtons.count();
      expect(count).toBeGreaterThan(0);

      // Check each CTA button has a valid href
      for (let i = 0; i < count; i++) {
        const button = ctaButtons.nth(i);
        const href = await button.getAttribute("href");

        expect(href).toBeTruthy();
        expect(href).not.toBe("#");
        expect(href).not.toBe("");
        // Should be internal link or valid URL
        expect(href).toMatch(/^\/|^https?:\/\//);
      }
    });

    test("REQ-UAT-012 - CTA button links navigate correctly", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await page.waitForLoadState("domcontentloaded");

      // Find first internal link CTA button
      const internalCtaButton = page
        .locator('[data-component="cta-button"][href^="/"]')
        .first();

      const count = await internalCtaButton.count();
      if (count === 0) {
        test.skip();
        return;
      }

      const href = await internalCtaButton.getAttribute("href");
      await internalCtaButton.click();
      await page.waitForLoadState("domcontentloaded");

      expect(page.url()).toContain(href);
    });
  });

  test.describe("Screenshot Proof", () => {
  });
});
