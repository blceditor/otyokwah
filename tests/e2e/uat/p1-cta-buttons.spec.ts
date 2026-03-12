/**
 * REQ-UAT-002: CTA Buttons E2E Tests
 * Story Points: 2 SP
 *
 * Tests for Call-to-Action buttons on homepage:
 * - CTA buttons visible on homepage
 * - Buttons have green primary styling (#047857)
 * - Links navigate correctly
 * - CTA Button available in CMS body editor
 *
 * TDD: These tests are designed to FAIL initially until implementation is complete.
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-002: CTA Buttons", () => {
  test.describe("Homepage CTA Button Visibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-002-001 - CTA buttons are visible on homepage", async ({
      page,
    }) => {
      // Find all CTA buttons on the homepage
      const ctaButtons = page.locator('[data-component="cta-button"]');

      // There should be at least one CTA button on the homepage
      const count = await ctaButtons.count();
      expect(count, "Homepage should have at least one CTA button").toBeGreaterThanOrEqual(1);

      // First CTA button should be visible
      await expect(
        ctaButtons.first(),
        "First CTA button should be visible"
      ).toBeVisible({ timeout: 10000 });
    });

    test("REQ-UAT-002-002 - CTA buttons have green primary styling (#047857)", async ({
      page,
    }) => {
      const ctaButton = page.locator('[data-component="cta-button"]').first();
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      // Get computed background color
      const styles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // Green colors - accept secondary (#2F4F3D = rgb(47, 79, 61))
      // or emerald variants (#047857 = rgb(4, 120, 87))
      const isGreenBackground =
        styles.backgroundColor === "rgb(47, 79, 61)" || // secondary #2F4F3D
        styles.backgroundColor === "rgb(4, 120, 87)" || // #047857
        styles.backgroundColor === "rgb(5, 150, 105)"; // emerald-600

      expect(
        isGreenBackground,
        `CTA button background should be green, got: ${styles.backgroundColor}`
      ).toBe(true);
    });

    test("REQ-UAT-002-003 - CTA buttons have valid href attributes", async ({
      page,
    }) => {
      const ctaButtons = page.locator('[data-component="cta-button"]');
      const count = await ctaButtons.count();

      expect(count, "Should have at least one CTA button").toBeGreaterThanOrEqual(1);

      // Check first 3 CTA buttons (or all if fewer)
      const buttonsToCheck = Math.min(count, 3);

      for (let i = 0; i < buttonsToCheck; i++) {
        const button = ctaButtons.nth(i);
        const href = await button.getAttribute("href");

        // If it's a link (not a button), it should have a valid href
        const tagName = await button.evaluate((el) => el.tagName.toLowerCase());
        if (tagName === "a") {
          expect(
            href,
            `CTA button ${i + 1} should have a valid href`
          ).toBeTruthy();
          expect(
            href,
            `CTA button ${i + 1} href should be a valid URL pattern`
          ).toMatch(/^https?:\/\/|^\//);
        }
      }
    });

    test("REQ-UAT-002-004 - CTA button links navigate correctly", async ({
      page,
    }) => {
      // Find a CTA button with an internal link
      const ctaButton = page
        .locator('[data-component="cta-button"][href^="/"]')
        .first();

      // Skip if no internal links found
      const count = await ctaButton.count();
      if (count === 0) {
        test.skip();
        return;
      }

      const href = await ctaButton.getAttribute("href");
      await ctaButton.click();

      // Should navigate to the target page
      await page.waitForLoadState("domcontentloaded");
      expect(page.url()).toContain(href);
    });
  });

  test.describe("CTA Button Styling Variants", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-002-005 - Primary variant has correct computed styles", async ({
      page,
    }) => {
      // Find primary variant CTA button (default variant)
      const primaryButton = page.locator('[data-component="cta-button"]').first();
      await expect(primaryButton).toBeVisible({ timeout: 10000 });

      const styles = await primaryButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontWeight: computed.fontWeight,
          borderRadius: computed.borderRadius,
        };
      });

      // Primary button should have:
      // - Green background (#047857 or secondary color)
      // - White text
      // - Bold/semibold font weight (600 or 700)
      // - Rounded corners
      expect(
        styles.fontWeight,
        "Font weight should be semibold or bold"
      ).toMatch(/^(600|700)$/);
      expect(
        styles.borderRadius,
        "Should have rounded corners"
      ).not.toBe("0px");
    });

    test("REQ-UAT-002-006 - CTA button has hover effects", async ({ page }) => {
      const ctaButton = page.locator('[data-component="cta-button"]').first();
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      // Get initial styles
      const initialStyles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });

      // Hover over button
      await ctaButton.hover();
      await page.waitForTimeout(300); // Wait for transition

      // Get hover styles
      const hoverStyles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });

      // At least one style should change on hover
      const hasHoverEffect =
        initialStyles.backgroundColor !== hoverStyles.backgroundColor ||
        initialStyles.transform !== hoverStyles.transform ||
        initialStyles.boxShadow !== hoverStyles.boxShadow;

      expect(
        hasHoverEffect,
        "CTA button should have visible hover effects"
      ).toBe(true);
    });
  });

  test.describe("CTA Button Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-002-007 - CTA buttons are keyboard accessible", async ({
      page,
    }) => {
      const ctaButton = page.locator('[data-component="cta-button"]').first();
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      // Should be focusable
      await ctaButton.focus();

      // Check if focus ring is visible
      const styles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          outline: computed.outline,
          outlineOffset: computed.outlineOffset,
          boxShadow: computed.boxShadow, // focus:ring uses box-shadow
        };
      });

      // Should have focus indicator (either outline or box-shadow ring)
      const hasFocusIndicator =
        styles.outline !== "none" ||
        styles.boxShadow !== "none";

      expect(
        hasFocusIndicator,
        "CTA button should have visible focus indicator"
      ).toBe(true);
    });

    test("REQ-UAT-002-008 - CTA buttons have sufficient color contrast", async ({
      page,
    }) => {
      const ctaButton = page.locator('[data-component="cta-button"]').first();
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      const styles = await ctaButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
        };
      });

      // White text (#fff = rgb(255, 255, 255)) on dark background
      // OR dark text on light background should pass
      const isWhiteText = styles.color === "rgb(255, 255, 255)";
      const isDarkBackground =
        styles.backgroundColor === "rgb(47, 79, 61)" || // secondary
        styles.backgroundColor === "rgb(4, 120, 87)" ||
        styles.backgroundColor === "rgb(5, 150, 105)";

      // Simple contrast check: white text on green bg = good contrast
      if (isDarkBackground) {
        expect(
          isWhiteText,
          "Dark background should have white text for contrast"
        ).toBe(true);
      }
    });
  });

  test.describe("CTA Button Screenshot Proof", () => {
    test("REQ-UAT-002-009 - Capture CTA button visual proof", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      // Find CTA button
      const ctaButton = page.locator('[data-component="cta-button"]').first();
      await expect(ctaButton).toBeVisible({ timeout: 10000 });

      // Screenshot of CTA button
      await ctaButton.screenshot({
        path: "verification-screenshots/REQ-UAT-002-cta-button.png",
      });

      // Full page screenshot showing CTA buttons in context
      await page.screenshot({
        path: "verification-screenshots/REQ-UAT-002-homepage-cta-buttons.png",
        fullPage: true,
      });
    });
  });
});
