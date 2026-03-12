/**
 * P2 Polish - Retreats and Rentals Section Tests (TDD - Expected to Fail Initially)
 *
 * REQ-UAT-008: Retreats Section (1 SP)
 * - Wide card visible in retreats section
 * - Link to /retreats works
 *
 * REQ-UAT-009: Rentals Section (1 SP)
 * - Rentals section has different background color than retreats
 * - Link to /rentals works
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-008: Retreats Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-008 - Retreats section has a wide card component", async ({
    page,
  }) => {
    // Find the retreats section
    const retreatsSection = page
      .locator('[data-section="retreats"]')
      .or(page.locator('section:has-text("Retreats")'))
      .or(page.locator('[data-component="wide-card"]:has-text("Retreats")'));

    await expect(retreatsSection).toBeVisible({ timeout: 10000 });

    // Check for wide card component
    const wideCard = retreatsSection.locator(
      '[data-component="wide-card"], article, .card',
    );

    // At least one card-like element should exist
    await expect(wideCard.first()).toBeVisible();

    // Verify it's a "wide" card by checking its aspect ratio
    const cardBox = await wideCard.first().boundingBox();
    expect(cardBox).toBeTruthy();

    // Wide cards should be wider than they are tall (aspect ratio > 1)
    if (cardBox) {
      const aspectRatio = cardBox.width / cardBox.height;
      expect(aspectRatio).toBeGreaterThan(1);
    }
  });

  test("REQ-UAT-008 - Retreats section contains link to /retreats", async ({
    page,
  }) => {
    const retreatsSection = page
      .locator('[data-section="retreats"]')
      .or(page.locator('section:has-text("Retreats")'));

    await expect(retreatsSection).toBeVisible({ timeout: 10000 });

    // Find link to retreats page
    const retreatsLink = retreatsSection.locator('a[href*="retreats"]');
    await expect(retreatsLink.first()).toBeVisible();

    // Verify href is correct
    const href = await retreatsLink.first().getAttribute("href");
    expect(href).toMatch(/\/retreats/);
  });

  test("REQ-UAT-008 - Retreats link navigates correctly", async ({ page }) => {
    const retreatsSection = page
      .locator('[data-section="retreats"]')
      .or(page.locator('section:has-text("Retreats")'));

    await expect(retreatsSection).toBeVisible({ timeout: 10000 });

    const retreatsLink = retreatsSection.locator('a[href*="retreats"]').first();
    await retreatsLink.click();

    // Verify navigation to retreats page
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/retreats");

    // Verify page loaded successfully (not 404)
    const heading = page.locator("h1");
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("REQ-UAT-008 - Retreats wide card has image and content", async ({
    page,
  }) => {
    const retreatsSection = page
      .locator('[data-section="retreats"]')
      .or(page.locator('section:has-text("Retreats")'));

    await expect(retreatsSection).toBeVisible({ timeout: 10000 });

    const wideCard = retreatsSection.locator(
      '[data-component="wide-card"], article',
    );

    if ((await wideCard.count()) > 0) {
      // Should have an image
      const image = wideCard.locator("img");
      await expect(image.first()).toBeVisible();

      // Should have text content
      const textContent = await wideCard.first().textContent();
      expect(textContent?.length).toBeGreaterThan(20);
    }
  });
});

test.describe("REQ-UAT-009: Rentals Section", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-009 - Rentals section has different background color than retreats", async ({
    page,
  }) => {
    // Find both sections
    const retreatsSection = page
      .locator('[data-section="retreats"]')
      .or(page.locator('section:has-text("Retreats")').first());

    const rentalsSection = page
      .locator('[data-section="rentals"]')
      .or(page.locator('section:has-text("Rentals")').first());

    await expect(retreatsSection).toBeVisible({ timeout: 10000 });
    await expect(rentalsSection).toBeVisible({ timeout: 10000 });

    // Get background colors
    const retreatsBg = await retreatsSection.evaluate((el) => {
      // Check the element and its first child/card for background
      const directBg = getComputedStyle(el).backgroundColor;
      const card = el.querySelector("article, .card, [data-component]");
      const cardBg = card ? getComputedStyle(card).backgroundColor : directBg;
      return directBg !== "rgba(0, 0, 0, 0)" ? directBg : cardBg;
    });

    const rentalsBg = await rentalsSection.evaluate((el) => {
      const directBg = getComputedStyle(el).backgroundColor;
      const card = el.querySelector("article, .card, [data-component]");
      const cardBg = card ? getComputedStyle(card).backgroundColor : directBg;
      return directBg !== "rgba(0, 0, 0, 0)" ? directBg : cardBg;
    });

    // Backgrounds MUST be different to distinguish sections visually
    expect(retreatsBg).not.toBe(rentalsBg);
  });

  test("REQ-UAT-009 - Rentals section contains link to /rentals", async ({
    page,
  }) => {
    const rentalsSection = page
      .locator('[data-section="rentals"]')
      .or(page.locator('section:has-text("Rentals")'));

    await expect(rentalsSection).toBeVisible({ timeout: 10000 });

    // Find link to rentals page
    const rentalsLink = rentalsSection.locator('a[href*="rentals"]');
    await expect(rentalsLink.first()).toBeVisible();

    // Verify href is correct
    const href = await rentalsLink.first().getAttribute("href");
    expect(href).toMatch(/\/rentals/);
  });

  test("REQ-UAT-009 - Rentals link navigates correctly", async ({ page }) => {
    const rentalsSection = page
      .locator('[data-section="rentals"]')
      .or(page.locator('section:has-text("Rentals")'));

    await expect(rentalsSection).toBeVisible({ timeout: 10000 });

    const rentalsLink = rentalsSection.locator('a[href*="rentals"]').first();
    await rentalsLink.click();

    // Verify navigation to rentals page
    await page.waitForLoadState("domcontentloaded");
    expect(page.url()).toContain("/rentals");

    // Verify page loaded successfully (not 404)
    const heading = page.locator("h1");
    await expect(heading).toBeVisible({ timeout: 10000 });
  });

  test("REQ-UAT-009 - Rentals section has a wide card component", async ({
    page,
  }) => {
    const rentalsSection = page
      .locator('[data-section="rentals"]')
      .or(page.locator('section:has-text("Rentals")'));

    await expect(rentalsSection).toBeVisible({ timeout: 10000 });

    // Check for card component
    const card = rentalsSection.locator(
      '[data-component="wide-card"], article, .card',
    );

    // At least one card element should exist
    await expect(card.first()).toBeVisible();

    // Verify it's styled as a wide card
    const cardBox = await card.first().boundingBox();
    expect(cardBox).toBeTruthy();

    if (cardBox) {
      const aspectRatio = cardBox.width / cardBox.height;
      expect(aspectRatio).toBeGreaterThan(1);
    }
  });
});

test.describe("REQ-UAT-008/009: Visual Differentiation", () => {
  test("Retreats and Rentals sections are visually distinct", async ({
    page,
  }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    // Capture visual information about both sections
    const sectionStyles = await page.evaluate(() => {
      const retreats =
        document.querySelector('[data-section="retreats"]') ||
        Array.from(document.querySelectorAll("section")).find((s) =>
          s.textContent?.includes("Retreats"),
        );
      const rentals =
        document.querySelector('[data-section="rentals"]') ||
        Array.from(document.querySelectorAll("section")).find((s) =>
          s.textContent?.includes("Rentals"),
        );

      const getStyles = (el: Element | null | undefined) => {
        if (!el) return null;
        const styles = getComputedStyle(el);
        const card = el.querySelector("article, .card, [data-component]");
        const cardStyles = card ? getComputedStyle(card) : null;
        return {
          backgroundColor: styles.backgroundColor,
          cardBackgroundColor: cardStyles?.backgroundColor || null,
          color: styles.color,
        };
      };

      return {
        retreats: getStyles(retreats),
        rentals: getStyles(rentals),
      };
    });

    expect(sectionStyles.retreats).toBeTruthy();
    expect(sectionStyles.rentals).toBeTruthy();

    // At least one visual property should be different
    const isDifferent =
      sectionStyles.retreats?.backgroundColor !==
        sectionStyles.rentals?.backgroundColor ||
      sectionStyles.retreats?.cardBackgroundColor !==
        sectionStyles.rentals?.cardBackgroundColor;

    expect(isDifferent).toBe(true);
  });

  test("Both sections have proper data-section attributes", async ({
    page,
  }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");

    // Sections should have proper data attributes for testing and styling
    const retreatsDataSection = page.locator('[data-section="retreats"]');
    const rentalsDataSection = page.locator('[data-section="rentals"]');

    // Both sections should have data-section attributes
    await expect(retreatsDataSection).toBeVisible({ timeout: 10000 });
    await expect(rentalsDataSection).toBeVisible({ timeout: 10000 });
  });
});
