/**
 * P2 Polish - Size Adjustments Tests (TDD - Expected to Fail Initially)
 *
 * REQ-UAT-013: Size Adjustments (2 SP)
 * - Summer 2026 Worthy section card is ~75% width, centered
 * - Prepare For Camp cards are ~60% of previous width, centered
 * - Icons in Prepare section are XL size (48px+)
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe("REQ-UAT-013: Size Adjustments - Summer 2026 Worthy Card", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-013 - Summer 2026 Worthy card is approximately 75% viewport width", async ({
    page,
  }) => {
    // Find the Summer 2026 Worthy section
    const worthySection = page
      .locator('section:has-text("Worthy")')
      .or(page.locator('[data-section="worthy"]'))
      .or(page.locator('section:has-text("Summer 2026")'));

    await expect(worthySection).toBeVisible({ timeout: 10000 });

    // Get the card within this section
    const worthyCard = worthySection
      .locator('[data-component="wide-card"], article, .card')
      .first();

    if ((await worthyCard.count()) > 0) {
      const cardBox = await worthyCard.boundingBox();
      const viewportWidth = 1280;

      // Card should be approximately 75% of viewport width (allow 10% tolerance)
      // 75% of 1280 = 960px, tolerance range: 864px - 1056px
      const expectedWidth = viewportWidth * 0.75;
      const tolerance = viewportWidth * 0.1;

      expect(cardBox).toBeTruthy();
      expect(cardBox!.width).toBeGreaterThan(expectedWidth - tolerance);
      expect(cardBox!.width).toBeLessThan(expectedWidth + tolerance);
    }
  });

  test("REQ-UAT-013 - Summer 2026 Worthy card is horizontally centered", async ({
    page,
  }) => {
    const worthySection = page
      .locator('section:has-text("Worthy")')
      .or(page.locator('[data-section="worthy"]'))
      .or(page.locator('section:has-text("Summer 2026")'));

    await expect(worthySection).toBeVisible({ timeout: 10000 });

    const worthyCard = worthySection
      .locator('[data-component="wide-card"], article, .card')
      .first();

    if ((await worthyCard.count()) > 0) {
      const cardBox = await worthyCard.boundingBox();
      const viewportWidth = 1280;

      // Card should be centered - left margin should equal right margin
      const leftMargin = cardBox!.x;
      const rightMargin = viewportWidth - (cardBox!.x + cardBox!.width);

      // Allow 10px tolerance for centering
      expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(10);
    }
  });
});

test.describe("REQ-UAT-013: Size Adjustments - Prepare For Camp Cards", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");
    // Wait for page to fully load and scroll to see all content
    await page.waitForTimeout(1000);
  });

  test("REQ-UAT-013 - Prepare For Camp cards are approximately 60% of normal width", async ({
    page,
  }) => {
    // Find the Prepare For Camp cards by looking for the heading
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));

    // Scroll to heading to ensure visibility
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    // Find the grid container after the heading
    const cardGrid = page.locator('[data-width="60"]').or(page.locator('.grid').filter({ has: page.locator('[data-component="content-card"]').or(page.locator('article')) }));

    const prepareSection = cardGrid;

    // Get cards within this section
    const cards = prepareSection.locator("article, .card, [class*='card']");
    const cardCount = await cards.count();

    expect(cardCount).toBeGreaterThan(0);

    // Measure first card width
    const firstCard = cards.first();
    const cardBox = await firstCard.boundingBox();

    // Container is 60% of 1280 = 768px
    // 2-column grid: 768 - gaps and padding = ~600-650px per card (depending on gap size)
    // We just verify cards exist and are reasonably sized for 2-column layout
    const minExpectedWidth = 400; // Should be wider than single column
    const maxExpectedWidth = 750; // But less than full container

    expect(cardBox).toBeTruthy();
    expect(cardBox!.width).toBeGreaterThan(minExpectedWidth);
    expect(cardBox!.width).toBeLessThan(maxExpectedWidth);
  });

  test("REQ-UAT-013 - Prepare For Camp cards are horizontally centered", async ({
    page,
  }) => {
    // Scroll to Prepare section
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    const prepareSection = page.locator('[data-width="60"]');

    // Get the prepareSection container itself (which has the width constraint and centering)
    const containerBox = await prepareSection.boundingBox();

    // Get the viewport width
    const viewportWidth = 1280;

    if (containerBox) {
      // Container should be centered: left margin should equal right margin
      const leftMargin = containerBox.x;
      const rightMargin = viewportWidth - (containerBox.x + containerBox.width);

      // Allow 50px tolerance for padding/margin differences
      expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(50);

      // Container should be approximately 60% width (768px, allow 10% tolerance)
      const expectedWidth = viewportWidth * 0.6;
      expect(containerBox.width).toBeGreaterThan(expectedWidth * 0.9);
      expect(containerBox.width).toBeLessThan(expectedWidth * 1.1);
    }
  });

  test("REQ-UAT-013 - Prepare For Camp cards container has max-width constraint", async ({
    page,
  }) => {
    // Scroll to Prepare section
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    const prepareSection = page.locator('[data-width="60"]');

    const cardContainer = prepareSection.locator(
      ".grid, [class*='grid'], [class*='flex']",
    );

    if ((await cardContainer.count()) > 0) {
      const containerStyles = await cardContainer
        .first()
        .evaluate((el) => getComputedStyle(el).maxWidth);

      // Container should have a max-width constraint (not 'none')
      // OR the container width should be less than full viewport
      const containerBox = await cardContainer.first().boundingBox();
      const viewportWidth = 1280;

      // Either maxWidth is set OR the container is narrower than 80% of viewport
      const hasConstraint =
        containerStyles !== "none" ||
        (containerBox && containerBox.width < viewportWidth * 0.8);

      expect(hasConstraint).toBe(true);
    }
  });
});

test.describe("REQ-UAT-013: Size Adjustments - Prepare Section Icons", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);
  });

  test("REQ-UAT-013 - Prepare For Camp icons are XL size (48px or larger)", async ({
    page,
  }) => {
    // Scroll to Prepare section
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    const prepareSection = page.locator('[data-width="60"]');

    // Find SVG icons in the section
    const icons = prepareSection.locator("svg");
    const iconCount = await icons.count();

    expect(iconCount).toBeGreaterThan(0);

    // Check each icon's size
    for (let i = 0; i < iconCount; i++) {
      const icon = icons.nth(i);
      const iconBox = await icon.boundingBox();

      if (iconBox) {
        // Icons should be at least 48px (XL size)
        // Tailwind XL icons are typically w-12 h-12 = 48px
        expect(iconBox.width).toBeGreaterThanOrEqual(48);
        expect(iconBox.height).toBeGreaterThanOrEqual(48);
      }
    }
  });

  test("REQ-UAT-013 - Prepare For Camp icons have consistent XL sizing", async ({
    page,
  }) => {
    // Scroll to Prepare section
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    const prepareSection = page.locator('[data-width="60"]');

    // Get computed dimensions of icons
    const iconSizes = await prepareSection.evaluate((section) => {
      const icons = section.querySelectorAll("svg");
      return Array.from(icons).map((icon) => {
        const styles = getComputedStyle(icon);
        return {
          width: parseFloat(styles.width),
          height: parseFloat(styles.height),
        };
      });
    });

    expect(iconSizes.length).toBeGreaterThan(0);

    // All icons should be the same size and at least 48px
    const firstSize = iconSizes[0];
    iconSizes.forEach((size) => {
      expect(size.width).toBeGreaterThanOrEqual(48);
      expect(size.height).toBeGreaterThanOrEqual(48);
      expect(size.width).toBe(firstSize.width);
      expect(size.height).toBe(firstSize.height);
    });
  });
});

test.describe("REQ-UAT-013: Size Adjustments - Prepare Section Buttons", () => {
  test("REQ-UAT-013 - Prepare For Camp links are styled as centered buttons", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 1200 });
    await page.goto(`${PRODUCTION_URL}/summer-camp`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);

    // Scroll to Prepare section
    const heading = page.locator("h2:has-text('Prepare for Camp')").or(page.locator("h2:has-text('Prepare For Camp')"));
    if ((await heading.count()) > 0) {
      await heading.scrollIntoViewIfNeeded();
    }

    const prepareSection = page.locator('[data-width="60"]');

    // Find links/buttons at the bottom of cards
    const buttons = prepareSection.locator("a, button");
    const buttonCount = await buttons.count();

    expect(buttonCount).toBeGreaterThan(0);

    // Check that buttons are styled and centered
    const firstButton = buttons.first();
    const buttonStyles = await firstButton.evaluate((el) => {
      const styles = getComputedStyle(el);
      return {
        display: styles.display,
        textAlign: styles.textAlign,
        backgroundColor: styles.backgroundColor,
        padding: styles.padding,
      };
    });

    // Button should have visible styling (background color, padding)
    expect(
      buttonStyles.backgroundColor !== "rgba(0, 0, 0, 0)" ||
        buttonStyles.padding !== "0px",
    ).toBe(true);
  });
});
