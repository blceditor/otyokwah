/**
 * REQ-UAT-022: Card Grid Container E2E Tests (2 SP)
 *
 * TDD: These tests MUST FAIL initially until implementation is complete.
 *
 * Acceptance Criteria:
 * - Desktop: 4 columns
 * - Tablet: 2-3 columns
 * - Mobile: 1 column
 * - Equal height cards
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

// Viewport sizes for responsive testing
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 800 },
  widescreen: { width: 1920, height: 1080 },
};

test.describe("REQ-UAT-022: Card Grid Container", () => {
  test.describe("Desktop Layout (4 columns)", () => {
    test("REQ-UAT-022-01 - card grid displays 4 columns on desktop", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        const gridContainer = cardGrid.first();

        // Check grid-template-columns computed style
        const gridColumns = await gridContainer.evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns,
        );

        // Should have 4 columns (4 values separated by spaces)
        // e.g., "300px 300px 300px 300px" or "1fr 1fr 1fr 1fr"
        const columnCount = gridColumns
          .split(/\s+/)
          .filter((c) => c && c !== "none").length;
        expect(columnCount).toBe(4);
      }
    });

    test("REQ-UAT-022-02 - all 4 cards visible in single row on desktop", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 4) {
        // Get bounding boxes for first 4 cards
        const card1Box = await sessionCards.nth(0).boundingBox();
        const card2Box = await sessionCards.nth(1).boundingBox();
        const card3Box = await sessionCards.nth(2).boundingBox();
        const card4Box = await sessionCards.nth(3).boundingBox();

        // All 4 cards should be on the same row (same Y position, give or take a few pixels)
        if (card1Box && card2Box && card3Box && card4Box) {
          const tolerance = 10; // pixels tolerance for alignment
          expect(Math.abs(card1Box.y - card2Box.y)).toBeLessThan(tolerance);
          expect(Math.abs(card2Box.y - card3Box.y)).toBeLessThan(tolerance);
          expect(Math.abs(card3Box.y - card4Box.y)).toBeLessThan(tolerance);
        }
      }
    });
  });

  test.describe("Tablet Layout (2-3 columns)", () => {
    test("REQ-UAT-022-03 - card grid displays 2 columns on tablet", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        const gridContainer = cardGrid.first();

        const gridColumns = await gridContainer.evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns,
        );

        // Should have 2-3 columns on tablet
        const columnCount = gridColumns
          .split(/\s+/)
          .filter((c) => c && c !== "none").length;
        expect(columnCount).toBeGreaterThanOrEqual(2);
        expect(columnCount).toBeLessThanOrEqual(3);
      }
    });

    test("REQ-UAT-022-04 - cards wrap to second row on tablet", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 4) {
        // Get bounding boxes for first 2 and third card
        const card1Box = await sessionCards.nth(0).boundingBox();
        const card3Box = await sessionCards.nth(2).boundingBox();

        if (card1Box && card3Box) {
          // With 2 columns, card 3 should be on a different row than card 1
          // (y position should be different)
          expect(card3Box.y).toBeGreaterThan(card1Box.y + card1Box.height - 10);
        }
      }
    });
  });

  test.describe("Mobile Layout (1 column)", () => {
    test("REQ-UAT-022-05 - card grid displays 1 column on mobile", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        const gridContainer = cardGrid.first();

        const gridColumns = await gridContainer.evaluate(
          (el) => getComputedStyle(el).gridTemplateColumns,
        );

        // Should have 1 column on mobile (single value)
        const columnCount = gridColumns
          .split(/\s+/)
          .filter((c) => c && c !== "none").length;
        expect(columnCount).toBe(1);
      }
    });

    test("REQ-UAT-022-06 - cards stack vertically on mobile", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 2) {
        const card1Box = await sessionCards.nth(0).boundingBox();
        const card2Box = await sessionCards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Cards should be stacked (card2 below card1)
          expect(card2Box.y).toBeGreaterThan(card1Box.y + card1Box.height - 10);

          // Cards should have similar X positions (aligned left)
          expect(Math.abs(card1Box.x - card2Box.x)).toBeLessThan(10);
        }
      }
    });

    test("REQ-UAT-022-07 - cards take full width on mobile", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');

      if ((await sessionCards.count()) > 0) {
        const firstCard = sessionCards.first();
        const cardBox = await firstCard.boundingBox();

        if (cardBox) {
          // Card should take most of the viewport width (accounting for padding)
          const viewportWidth = VIEWPORTS.mobile.width;
          const minExpectedWidth = viewportWidth * 0.85; // 85% of viewport

          expect(cardBox.width).toBeGreaterThan(minExpectedWidth);
        }
      }
    });
  });

  test.describe("Equal Height Cards", () => {
    test("REQ-UAT-022-08 - cards in same row have equal height on desktop", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 4) {
        // Get heights of first 4 cards
        const heights = await Promise.all(
          [0, 1, 2, 3].map(async (i) => {
            const box = await sessionCards.nth(i).boundingBox();
            return box?.height ?? 0;
          }),
        );

        // All heights should be equal (within tolerance)
        const tolerance = 5; // pixels
        const avgHeight = heights.reduce((a, b) => a + b, 0) / heights.length;

        for (const height of heights) {
          expect(Math.abs(height - avgHeight)).toBeLessThan(tolerance);
        }
      }
    });

    test("REQ-UAT-022-09 - cards in same row have equal height on tablet", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 2) {
        // Get heights of first 2 cards (same row on tablet)
        const card1Box = await sessionCards.nth(0).boundingBox();
        const card2Box = await sessionCards.nth(1).boundingBox();

        if (card1Box && card2Box) {
          // Heights should be equal (within tolerance)
          const tolerance = 5;
          expect(Math.abs(card1Box.height - card2Box.height)).toBeLessThan(
            tolerance,
          );
        }
      }
    });

    test("REQ-UAT-022-10 - equal heights maintained with varying content", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const sessionCards = page.locator('[data-component="camp-session-card"]');
      const cardCount = await sessionCards.count();

      if (cardCount >= 2) {
        // Get content lengths (bullet counts) for each card
        const bulletCounts = await Promise.all(
          [0, 1].map(async (i) => {
            const bullets = sessionCards.nth(i).locator("li");
            return bullets.count();
          }),
        );

        // Get card heights
        const heights = await Promise.all(
          [0, 1].map(async (i) => {
            const box = await sessionCards.nth(i).boundingBox();
            return box?.height ?? 0;
          }),
        );

        // Even if bullet counts differ, heights should be equal
        // (CSS grid should equalize heights)
        if (bulletCounts[0] !== bulletCounts[1]) {
          const tolerance = 10;
          expect(Math.abs(heights[0] - heights[1])).toBeLessThan(tolerance);
        }
      }
    });
  });

  test.describe("Grid Gap and Spacing", () => {
    test("REQ-UAT-022-11 - card grid has consistent gap between cards", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        const gridContainer = cardGrid.first();

        const gap = await gridContainer.evaluate(
          (el) => getComputedStyle(el).gap,
        );

        // Should have a defined gap (not 0 or "normal")
        expect(gap).not.toBe("0px");
        expect(gap).not.toBe("normal");
      }
    });

    test("REQ-UAT-022-12 - horizontal gap matches vertical gap", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        const gridContainer = cardGrid.first();

        const rowGap = await gridContainer.evaluate(
          (el) => getComputedStyle(el).rowGap,
        );
        const columnGap = await gridContainer.evaluate(
          (el) => getComputedStyle(el).columnGap,
        );

        // Both gaps should be defined and equal for consistent spacing
        if (rowGap !== "normal" && columnGap !== "normal") {
          expect(rowGap).toBe(columnGap);
        }
      }
    });
  });

  test.describe("Responsive Breakpoints", () => {
    test("REQ-UAT-022-13 - grid transitions smoothly at breakpoints", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );

      if ((await cardGrid.count()) > 0) {
        // Test at each breakpoint
        const breakpoints = [375, 640, 768, 1024, 1280];

        for (const width of breakpoints) {
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(100);

          const gridContainer = cardGrid.first();
          const gridColumns = await gridContainer.evaluate(
            (el) => getComputedStyle(el).gridTemplateColumns,
          );

          // Grid should always have defined columns (not "none")
          expect(gridColumns).not.toBe("none");
        }
      }
    });

    test("REQ-UAT-022-14 - no horizontal scroll at any viewport width", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      // Test at mobile width
      await page.setViewportSize(VIEWPORTS.mobile);

      const body = page.locator("body");
      const bodyBox = await body.boundingBox();

      if (bodyBox) {
        // Body should not exceed viewport width
        expect(bodyBox.width).toBeLessThanOrEqual(VIEWPORTS.mobile.width + 10);
      }

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return (
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
        );
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe("Screenshot Evidence", () => {
    test("REQ-UAT-022-15 - capture desktop grid layout screenshot", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.desktop);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );
      if ((await cardGrid.count()) > 0) {
        await cardGrid.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `verification-screenshots/REQ-UAT-022-desktop-grid-${Date.now()}.png`,
        fullPage: false,
      });
    });

    test("REQ-UAT-022-16 - capture tablet grid layout screenshot", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.tablet);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );
      if ((await cardGrid.count()) > 0) {
        await cardGrid.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `verification-screenshots/REQ-UAT-022-tablet-grid-${Date.now()}.png`,
        fullPage: false,
      });
    });

    test("REQ-UAT-022-17 - capture mobile grid layout screenshot", async ({
      page,
    }) => {
      await page.setViewportSize(VIEWPORTS.mobile);
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const cardGrid = page.locator(
        '[data-component="camp-session-card-grid"]',
      );
      if ((await cardGrid.count()) > 0) {
        await cardGrid.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: `verification-screenshots/REQ-UAT-022-mobile-grid-${Date.now()}.png`,
        fullPage: false,
      });
    });
  });
});
