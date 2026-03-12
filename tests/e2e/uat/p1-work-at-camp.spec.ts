/**
 * REQ-UAT-006: Work At Camp Section E2E Tests
 * Story Points: 2 SP
 *
 * Tests for Work At Camp section on homepage:
 * - Section visible with 3 cards/links
 * - Links to: summer-staff, leaders-in-training, year-round
 * - Visual differentiation from session cards
 * - Mobile: stacks to 1 column
 *
 * TDD: These tests are designed to FAIL initially until implementation is complete.
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-006: Work At Camp Section", () => {
  test.describe("Section Visibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-001 - Work At Camp section is visible on homepage", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(
        section,
        "Work At Camp section should be visible on homepage"
      ).toBeVisible({ timeout: 10000 });
    });

    test("REQ-UAT-006-002 - Section has heading 'Work at Camp'", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      // Find heading within section
      const heading = section.locator("h2");
      await expect(heading).toBeVisible();
      await expect(heading).toContainText(/work.*camp/i);
    });

    test("REQ-UAT-006-003 - Section contains exactly 3 cards", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      // Cards are article elements within the section
      const cards = section.locator("article");
      await expect(
        cards,
        "Work At Camp section should have exactly 3 cards"
      ).toHaveCount(3);
    });
  });

  test.describe("Card Links", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-004 - Section links to summer-staff page", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const summerStaffLink = section.locator('a[href*="summer-staff"]');
      await expect(
        summerStaffLink,
        "Should have link to summer-staff page"
      ).toBeVisible();

      // Verify the href is correct
      const href = await summerStaffLink.getAttribute("href");
      expect(href).toMatch(/summer-staff/);
    });

    test("REQ-UAT-006-005 - Section links to leaders-in-training page", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const litLink = section.locator('a[href*="leaders-in-training"]');
      await expect(
        litLink,
        "Should have link to leaders-in-training page"
      ).toBeVisible();

      const href = await litLink.getAttribute("href");
      expect(href).toMatch(/leaders-in-training/);
    });

    test("REQ-UAT-006-006 - Section links to year-round page", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const yearRoundLink = section.locator('a[href*="year-round"]');
      await expect(
        yearRoundLink,
        "Should have link to year-round page"
      ).toBeVisible();

      const href = await yearRoundLink.getAttribute("href");
      expect(href).toMatch(/year-round/);
    });

    test("REQ-UAT-006-007 - All three required links are present", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      // All three links should be present
      await expect(section.locator('a[href*="summer-staff"]')).toBeVisible();
      await expect(
        section.locator('a[href*="leaders-in-training"]')
      ).toBeVisible();
      await expect(section.locator('a[href*="year-round"]')).toBeVisible();
    });
  });

  test.describe("Visual Differentiation from Session Cards", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-008 - Work At Camp cards have icons (not images)", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      // Work At Camp cards use icons in rounded containers, not large images
      const iconContainers = section.locator(".rounded-full");
      const iconCount = await iconContainers.count();
      expect(
        iconCount,
        "Work At Camp cards should have icon containers"
      ).toBeGreaterThanOrEqual(3);
    });

    test("REQ-UAT-006-009 - Work At Camp cards are visually distinct from session cards", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const workAtCampCard = section.locator("article").first();

      // Get computed styles of Work At Camp card
      const workStyles = await workAtCampCard.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          textAlign: computed.textAlign,
          borderRadius: computed.borderRadius,
        };
      });

      // Work At Camp cards should be centered text and white background
      expect(workStyles.textAlign).toBe("center");
      expect(workStyles.backgroundColor).toMatch(/rgb\(255,\s*255,\s*255\)/); // white
    });

    test("REQ-UAT-006-010 - Work At Camp section has cream background", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const bgColor = await section.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.backgroundColor;
      });

      // Should have cream background (bg-cream class)
      // Cream is approximately rgb(252, 250, 245) or similar
      expect(
        bgColor,
        "Section should have cream background color"
      ).toMatch(/rgb\(2[45]\d,\s*2[45]\d,\s*2[34]\d\)/);
    });
  });

  test.describe("Desktop Layout - 3 Column Grid", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-011 - Desktop renders 3-column grid", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const grid = section.locator(".grid");
      const gridCols = await grid.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.gridTemplateColumns;
      });

      // Should have 3 columns on desktop (sm:grid-cols-3)
      const columnCount = gridCols.split(" ").length;
      expect(
        columnCount,
        "Desktop should show 3 columns"
      ).toBe(3);
    });

    test("REQ-UAT-006-012 - Desktop cards are horizontally aligned", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const cards = section.locator("article");
      const card1 = cards.nth(0);
      const card2 = cards.nth(1);
      const card3 = cards.nth(2);

      // Get bounding boxes
      const box1 = await card1.boundingBox();
      const box2 = await card2.boundingBox();
      const box3 = await card3.boundingBox();

      expect(box1).toBeTruthy();
      expect(box2).toBeTruthy();
      expect(box3).toBeTruthy();

      // Cards should be at approximately the same Y position (horizontal row)
      const tolerance = 10; // pixels
      expect(
        Math.abs((box1?.y ?? 0) - (box2?.y ?? 0)),
        "Cards 1 and 2 should be at same Y position"
      ).toBeLessThan(tolerance);
      expect(
        Math.abs((box2?.y ?? 0) - (box3?.y ?? 0)),
        "Cards 2 and 3 should be at same Y position"
      ).toBeLessThan(tolerance);
    });
  });

  test.describe("Mobile Layout - 1 Column Stack", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-013 - Mobile stacks to 1 column", async ({ page }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const grid = section.locator(".grid");
      const gridCols = await grid.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return computed.gridTemplateColumns;
      });

      // Should have 1 column on mobile
      const columnCount = gridCols.split(" ").length;
      expect(
        columnCount,
        "Mobile should show 1 column"
      ).toBe(1);
    });

    test("REQ-UAT-006-014 - Mobile cards are vertically stacked", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const cards = section.locator("article");
      const card1 = cards.nth(0);
      const card2 = cards.nth(1);

      const box1 = await card1.boundingBox();
      const box2 = await card2.boundingBox();

      expect(box1).toBeTruthy();
      expect(box2).toBeTruthy();

      // Cards should be stacked vertically (card2.y > card1.y + card1.height)
      expect(
        (box2?.y ?? 0) > (box1?.y ?? 0) + (box1?.height ?? 0) - 20,
        "Card 2 should be below Card 1 on mobile"
      ).toBe(true);
    });
  });

  test.describe("Card Content", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");
    });

    test("REQ-UAT-006-015 - Each card has title, description, and link", async ({
      page,
    }) => {
      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      const cards = section.locator("article");
      const cardCount = await cards.count();

      expect(cardCount).toBe(3);

      for (let i = 0; i < cardCount; i++) {
        const card = cards.nth(i);

        // Title (h3)
        const title = card.locator("h3");
        await expect(
          title,
          `Card ${i + 1} should have a title`
        ).toBeVisible();

        // Description (p)
        const description = card.locator("p");
        await expect(
          description,
          `Card ${i + 1} should have a description`
        ).toBeVisible();

        // Link (a)
        const link = card.locator("a");
        await expect(
          link,
          `Card ${i + 1} should have a link`
        ).toBeVisible();
      }
    });
  });

  test.describe("Screenshot Proof", () => {
    test("REQ-UAT-006-016 - Capture Work At Camp section visual proof (desktop)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      await section.screenshot({
        path: "verification-screenshots/REQ-UAT-006-work-at-camp-desktop.png",
      });
    });

    test("REQ-UAT-006-017 - Capture Work At Camp section visual proof (mobile)", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const section = page.locator('[data-component="work-at-camp-section"]');
      await expect(section).toBeVisible({ timeout: 10000 });

      await section.screenshot({
        path: "verification-screenshots/REQ-UAT-006-work-at-camp-mobile.png",
      });
    });
  });
});
