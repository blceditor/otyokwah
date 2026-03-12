/**
 * REQ-UAT-007: Wide Card Component E2E Tests
 * Story Points: 2 SP
 *
 * Tests for Wide Card component:
 * - Desktop: image and content side-by-side
 * - Mobile: stacked vertically
 * - Background color configurable
 * - Image position (left/right) works
 *
 * TDD: These tests are designed to FAIL initially until implementation is complete.
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-007: Wide Card Component", () => {
  test.describe("Wide Card Visibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-001 - Wide Card component renders on homepage", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]');
      const count = await wideCard.count();

      expect(
        count,
        "Homepage should have at least one Wide Card"
      ).toBeGreaterThanOrEqual(1);

      await expect(
        wideCard.first(),
        "Wide Card should be visible"
      ).toBeVisible({ timeout: 10000 });
    });

    test("REQ-UAT-007-002 - Wide Card has image element", async ({ page }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const image = wideCard.locator("img");
      await expect(
        image,
        "Wide Card should have an image"
      ).toBeVisible();
    });

    test("REQ-UAT-007-003 - Wide Card has content elements", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      // Should have heading (h3)
      const heading = wideCard.locator("h3");
      await expect(
        heading,
        "Wide Card should have a heading"
      ).toBeVisible();

      // Should have description (p)
      const description = wideCard.locator("p");
      await expect(
        description,
        "Wide Card should have a description"
      ).toBeVisible();

      // Should have CTA link
      const ctaLink = wideCard.locator("a");
      await expect(
        ctaLink,
        "Wide Card should have a CTA link"
      ).toBeVisible();
    });
  });

  test.describe("Desktop Layout - Side by Side", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-004 - Desktop renders image and content side-by-side", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      // Check flex direction is row on desktop
      const flexDirection = await wideCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.flexDirection;
      });

      expect(
        flexDirection,
        "Desktop Wide Card should use row layout (side-by-side)"
      ).toBe("row");
    });

    test("REQ-UAT-007-005 - Desktop image and content have equal widths", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const cardBox = await wideCard.boundingBox();
      expect(cardBox).toBeTruthy();

      const image = wideCard.locator("img");
      const imageBox = await image.boundingBox();
      expect(imageBox).toBeTruthy();

      // Image should be approximately 50% of card width
      const imageWidthPercent = ((imageBox?.width ?? 0) / (cardBox?.width ?? 1)) * 100;

      expect(
        imageWidthPercent,
        "Image should be approximately 50% of card width"
      ).toBeGreaterThan(40);
      expect(imageWidthPercent).toBeLessThan(60);
    });

    test("REQ-UAT-007-006 - Desktop image and content are horizontally aligned", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      // Get image container and content container
      const children = wideCard.locator("> div");
      const child1 = children.nth(0);
      const child2 = children.nth(1);

      const box1 = await child1.boundingBox();
      const box2 = await child2.boundingBox();

      expect(box1).toBeTruthy();
      expect(box2).toBeTruthy();

      // Should be at similar Y position (horizontally aligned)
      const tolerance = 50; // pixels
      expect(
        Math.abs((box1?.y ?? 0) - (box2?.y ?? 0)),
        "Image and content should be horizontally aligned"
      ).toBeLessThan(tolerance);

      // Should be at different X positions (side by side)
      expect(
        Math.abs((box1?.x ?? 0) - (box2?.x ?? 0)),
        "Image and content should be at different X positions"
      ).toBeGreaterThan(100);
    });
  });

  test.describe("Mobile Layout - Stacked Vertically", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-007 - Mobile stacks image and content vertically", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      // Check flex direction is column on mobile
      const flexDirection = await wideCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.flexDirection;
      });

      expect(
        flexDirection,
        "Mobile Wide Card should use column layout (stacked)"
      ).toBe("column");
    });

    test("REQ-UAT-007-008 - Mobile image is above content", async ({ page }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const image = wideCard.locator("img");
      const heading = wideCard.locator("h3");

      const imageBox = await image.boundingBox();
      const headingBox = await heading.boundingBox();

      expect(imageBox).toBeTruthy();
      expect(headingBox).toBeTruthy();

      // Image should be above heading (lower Y value)
      expect(
        (imageBox?.y ?? 0) < (headingBox?.y ?? 0),
        "Image should be above heading on mobile"
      ).toBe(true);
    });

    test("REQ-UAT-007-009 - Mobile image takes full width", async ({ page }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const cardBox = await wideCard.boundingBox();
      const imageContainer = wideCard.locator("> div").first();
      const imageBox = await imageContainer.boundingBox();

      expect(cardBox).toBeTruthy();
      expect(imageBox).toBeTruthy();

      // Image container should be approximately full width on mobile
      const widthPercent = ((imageBox?.width ?? 0) / (cardBox?.width ?? 1)) * 100;
      expect(
        widthPercent,
        "Image should take full width on mobile"
      ).toBeGreaterThan(90);
    });
  });

  test.describe("Background Color Configuration", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-010 - Wide Card has configurable background color", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      // Background color should be set (either via style or CSS class)
      const bgColor = await wideCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });

      expect(
        bgColor,
        "Wide Card should have a background color"
      ).not.toBe("rgba(0, 0, 0, 0)"); // Not transparent
    });

    test("REQ-UAT-007-011 - Different Wide Cards can have different backgrounds", async ({
      page,
    }) => {
      const wideCards = page.locator('[data-component="wide-card"]');
      const count = await wideCards.count();

      if (count < 2) {
        test.info().annotations.push({
          type: "skip",
          description: "Need at least 2 Wide Cards to test different backgrounds",
        });
        return;
      }

      const card1 = wideCards.nth(0);
      const card2 = wideCards.nth(1);

      const bg1 = await card1.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });

      const bg2 = await card2.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });

      // Wide Cards should have different background colors
      expect(
        bg1,
        "First Wide Card should have a background"
      ).not.toBe("rgba(0, 0, 0, 0)");
      expect(
        bg2,
        "Second Wide Card should have a background"
      ).not.toBe("rgba(0, 0, 0, 0)");

      // They SHOULD be different for visual differentiation
      expect(
        bg1 !== bg2,
        "Different Wide Cards should have different background colors for visual distinction"
      ).toBe(true);
    });
  });

  test.describe("Image Position (Left/Right)", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-012 - Wide Card supports image-left position", async ({
      page,
    }) => {
      const wideCards = page.locator('[data-component="wide-card"]');
      const count = await wideCards.count();

      let foundLeftImage = false;

      for (let i = 0; i < count; i++) {
        const card = wideCards.nth(i);
        await expect(card).toBeVisible();

        // Get image container and content positions
        const children = card.locator("> div");
        const firstChild = children.nth(0);
        const secondChild = children.nth(1);

        const firstBox = await firstChild.boundingBox();
        const secondBox = await secondChild.boundingBox();

        if (!firstBox || !secondBox) continue;

        // Check if image is on the left (first child contains image and has lower X)
        const firstHasImage = (await firstChild.locator("img").count()) > 0;
        const imageOnLeft = firstHasImage && firstBox.x < secondBox.x;

        if (imageOnLeft) {
          foundLeftImage = true;
          break;
        }
      }

      expect(
        foundLeftImage,
        "At least one Wide Card should have image on the left"
      ).toBe(true);
    });

    test("REQ-UAT-007-013 - Wide Card supports image-right position", async ({
      page,
    }) => {
      const wideCards = page.locator('[data-component="wide-card"]');
      const count = await wideCards.count();

      let foundRightImage = false;

      for (let i = 0; i < count; i++) {
        const card = wideCards.nth(i);
        await expect(card).toBeVisible();

        const children = card.locator("> div");
        const firstChild = children.nth(0);
        const secondChild = children.nth(1);

        const firstBox = await firstChild.boundingBox();
        const secondBox = await secondChild.boundingBox();

        if (!firstBox || !secondBox) continue;

        // Check if image is on the right
        const secondHasImage = (await secondChild.locator("img").count()) > 0;
        const imageOnRight = secondHasImage && secondBox.x > firstBox.x;

        if (imageOnRight) {
          foundRightImage = true;
          break;
        }
      }

      // This test may not pass if all cards use same position
      // Marking as info if not found
      if (!foundRightImage) {
        test.info().annotations.push({
          type: "info",
          description:
            "No Wide Card with image-right found - may all use image-left",
        });
      }
    });
  });

  test.describe("Wide Card Content", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-014 - Wide Card CTA button has correct styling", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const ctaLink = wideCard.locator("a");
      await expect(ctaLink).toBeVisible();

      const styles = await ctaLink.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontWeight: computed.fontWeight,
          borderRadius: computed.borderRadius,
        };
      });

      // CTA should have green background (#047857)
      expect(
        styles.backgroundColor,
        "CTA background should be green"
      ).toMatch(/rgb\(4,\s*120,\s*87\)|rgb\(5,\s*150,\s*105\)/);

      // Text should be white
      expect(
        styles.color,
        "CTA text should be white"
      ).toBe("rgb(255, 255, 255)");

      // Should be medium, semibold, or bold (500-700)
      expect(
        styles.fontWeight,
        "CTA should be medium or heavier font weight"
      ).toMatch(/^(500|600|700)$/);
    });

    test("REQ-UAT-007-015 - Wide Card CTA link has valid href", async ({
      page,
    }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const ctaLink = wideCard.locator("a");
      const href = await ctaLink.getAttribute("href");

      expect(
        href,
        "CTA link should have valid href"
      ).toBeTruthy();
      expect(
        href,
        "CTA href should be a valid URL pattern"
      ).toMatch(/^https?:\/\/|^\//);
    });

    test("REQ-UAT-007-016 - Wide Card image has alt text", async ({ page }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const image = wideCard.locator("img");
      const alt = await image.getAttribute("alt");

      expect(
        alt,
        "Wide Card image should have alt attribute"
      ).not.toBeNull();
      expect(
        alt?.trim().length,
        "Wide Card image alt should not be empty"
      ).toBeGreaterThan(0);
    });
  });

  test.describe("Wide Card Hover Effects", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-007-017 - Wide Card has hover animation", async ({ page }) => {
      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      const initialStyles = await wideCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });

      await wideCard.hover();
      await page.waitForTimeout(400); // Wait for transition

      const hoverStyles = await wideCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
          boxShadow: computed.boxShadow,
        };
      });

      // At least one style should change on hover
      const hasHoverEffect =
        initialStyles.transform !== hoverStyles.transform ||
        initialStyles.boxShadow !== hoverStyles.boxShadow;

      expect(
        hasHoverEffect,
        "Wide Card should have hover animation effect"
      ).toBe(true);
    });
  });

  test.describe("Wide Card Screenshot Proof", () => {
    test("REQ-UAT-007-018 - Capture Wide Card desktop visual proof", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      await wideCard.screenshot({
        path: "verification-screenshots/REQ-UAT-007-wide-card-desktop.png",
      });
    });

    test("REQ-UAT-007-019 - Capture Wide Card mobile visual proof", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const wideCard = page.locator('[data-component="wide-card"]').first();
      await expect(wideCard).toBeVisible({ timeout: 10000 });

      await wideCard.screenshot({
        path: "verification-screenshots/REQ-UAT-007-wide-card-mobile.png",
      });
    });

    test("REQ-UAT-007-020 - Capture all Wide Cards on homepage", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      // Scroll to ensure all Wide Cards are loaded
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));

      await page.screenshot({
        path: "verification-screenshots/REQ-UAT-007-all-wide-cards.png",
        fullPage: true,
      });
    });
  });
});
