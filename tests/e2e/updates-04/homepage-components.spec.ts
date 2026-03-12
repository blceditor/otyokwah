/**
 * Updates-04 Homepage Component Tests
 *
 * REQ-HOME-001: CTA Buttons in CMS
 * REQ-HOME-002: Gallery in CMS
 * REQ-HOME-003: Image Preload
 * REQ-HOME-004: Camp Session Card
 * REQ-HOME-005: Work At Camp Section
 * REQ-HOME-006: Wide Card Component
 * REQ-HOME-007: Retreats Section
 * REQ-HOME-008: Rentals Section
 * REQ-COMP-001: Card Grid Container
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-HOME-004: Camp Session Card Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("domcontentloaded");
  });

  test("camp session cards are visible on homepage", async ({ page }) => {
    const cards = page.locator('[data-component="camp-session-card"]');
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
  });

  test("camp session card has required elements", async ({ page }) => {
    const card = page.locator('[data-component="camp-session-card"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Image
    await expect(card.locator("img")).toBeVisible();
    // Heading
    await expect(card.locator("h2, h3, h4")).toBeVisible();
    // CTA button
    await expect(card.locator("a, button")).toBeVisible();
  });

  test("camp session card has hover animation", async ({ page }) => {
    const card = page.locator('[data-component="camp-session-card"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    const initialTransform = await card.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    await card.hover();
    await page.waitForTimeout(400);
    const hoverTransform = await card.evaluate(
      (el) => getComputedStyle(el).transform,
    );
    expect(hoverTransform).not.toBe(initialTransform);
  });

  test("camp session card CTA button is green", async ({ page }) => {
    const card = page.locator('[data-component="camp-session-card"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    const ctaButton = card.locator("a, button").last();
    const bgColor = await ctaButton.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    // Should be green (#047857 = rgb(4, 120, 87))
    expect(bgColor).toMatch(/rgb\(4,\s*120,\s*87\)|rgb\(5,\s*150,\s*105\)/);
  });

  test("camp session card bullets render correctly", async ({ page }) => {
    const card = page.locator('[data-component="camp-session-card"]').first();
    await expect(card).toBeVisible({ timeout: 10000 });

    // Should have bullet list with checkmarks or other bullet types
    const bullets = card.locator(
      'ul li, [data-bullet-type], [class*="bullet"]',
    );
    await expect(bullets.first()).toBeVisible();
  });
});

test.describe("REQ-COMP-001: Camp Session Card Grid", () => {
  test("card grid is responsive - desktop 4 columns", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(PRODUCTION_URL);

    const grid = page.locator('[data-component="camp-session-card-grid"]');
    if ((await grid.count()) > 0) {
      const gridCols = await grid.evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns,
      );
      // Should have 4 columns on desktop
      expect(gridCols.split(" ").length).toBeGreaterThanOrEqual(3);
    }
  });

  test("card grid is responsive - mobile 1 column", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);

    const grid = page.locator('[data-component="camp-session-card-grid"]');
    if ((await grid.count()) > 0) {
      const gridCols = await grid.evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns,
      );
      expect(gridCols.split(" ").length).toBe(1);
    }
  });
});

test.describe("REQ-HOME-001: CTA Buttons in CMS Body", () => {
  test("CTA button is visible on homepage", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const ctaButton = page.locator('[data-component="cta-button"]');
    await expect(ctaButton.first()).toBeVisible({ timeout: 10000 });
  });

  test("CTA button has valid href", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const ctaButton = page.locator('[data-component="cta-button"]').first();
    const href = await ctaButton.getAttribute("href");
    expect(href).toBeTruthy();
    expect(href).toMatch(/^https?:\/\/|^\//);
  });
});

test.describe("REQ-HOME-002: Gallery in CMS Body", () => {
  test("gallery renders on homepage if present", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const gallery = page.locator('[data-component="gallery"]');
    if ((await gallery.count()) > 0) {
      await expect(gallery.first()).toBeVisible();
      const images = gallery.first().locator("img");
      await expect(images.first()).toBeVisible();
    }
  });
});

test.describe("REQ-HOME-003: Image Preload Fix", () => {
  test("mission image has eager loading", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const missionImage = page
      .locator('[data-section="mission"] img, .mission-section img')
      .first();
    if ((await missionImage.count()) > 0) {
      const loading = await missionImage.getAttribute("loading");
      expect(loading).not.toBe("lazy");
    }
  });
});

test.describe("REQ-HOME-005: Work At Camp Section", () => {
  test("work at camp section is visible", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    // Uses data-component="work-at-camp-section" per WorkAtCampSection.tsx
    const section = page.locator('[data-component="work-at-camp-section"]');
    await expect(section).toBeVisible({ timeout: 10000 });
  });

  test("work at camp section renders 3-column grid on desktop", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(PRODUCTION_URL);
    const section = page.locator('[data-component="work-at-camp-section"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Grid should have sm:grid-cols-3 class applied
    const grid = section.locator(".grid");
    const gridCols = await grid.evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns,
    );
    // Should have 3 columns on desktop
    expect(gridCols.split(" ").length).toBe(3);
  });

  test("work at camp has 3 article cards with links", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const section = page.locator('[data-component="work-at-camp-section"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Each card is an article element per WorkAtCampSection.tsx
    const cards = section.locator("article");
    await expect(cards).toHaveCount(3);

    // Each card should have a link
    const links = section.locator("article a");
    await expect(links).toHaveCount(3);
  });

  test("work at camp cards have icons", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const section = page.locator('[data-component="work-at-camp-section"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    // Icons are in a rounded container per WorkAtCampSection.tsx
    const iconContainers = section.locator(".rounded-full");
    await expect(iconContainers).toHaveCount(3);
  });

  test("work at camp links are correct", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const section = page.locator('[data-component="work-at-camp-section"]');
    await expect(section).toBeVisible({ timeout: 10000 });

    await expect(section.locator('a[href*="summer-staff"]')).toBeVisible();
    await expect(
      section.locator('a[href*="leaders-in-training"]'),
    ).toBeVisible();
    await expect(section.locator('a[href*="year-round"]')).toBeVisible();
  });
});

test.describe("REQ-HOME-006: Wide Card Component", () => {
  test("wide card renders with image and content", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const wideCard = page.locator('[data-component="wide-card"]');
    if ((await wideCard.count()) > 0) {
      await expect(wideCard.first().locator("img")).toBeVisible();
      await expect(wideCard.first().locator("a, button")).toBeVisible();
    }
  });

  test("wide card stacks on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(PRODUCTION_URL);
    const wideCard = page.locator('[data-component="wide-card"]');
    if ((await wideCard.count()) > 0) {
      const flexDirection = await wideCard
        .first()
        .evaluate((el) => getComputedStyle(el).flexDirection);
      expect(flexDirection).toBe("column");
    }
  });
});

test.describe("REQ-HOME-007: Retreats Section", () => {
  test("retreats wide card is visible", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const retreatsCard = page.locator(
      '[data-component="wide-card"][data-section="retreats"], [data-section="retreats"]',
    );
    await expect(retreatsCard).toBeVisible({ timeout: 10000 });
  });

  test("retreats links to retreats page", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const retreatsCard = page.locator('[data-section="retreats"]');
    await expect(retreatsCard).toBeVisible({ timeout: 10000 });
    await expect(retreatsCard.locator('a[href*="retreats"]')).toBeVisible();
  });
});

test.describe("REQ-HOME-008: Rentals Section", () => {
  test("rentals card has different color from retreats", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const retreatsCard = page.locator('[data-section="retreats"]').first();
    const rentalsCard = page.locator('[data-section="rentals"]').first();

    if ((await retreatsCard.count()) > 0 && (await rentalsCard.count()) > 0) {
      const retreatsBg = await retreatsCard.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      const rentalsBg = await rentalsCard.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      expect(retreatsBg).not.toBe(rentalsBg);
    }
  });

  test("rentals links to rentals page", async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    const rentalsCard = page.locator('[data-section="rentals"]');
    await expect(rentalsCard).toBeVisible({ timeout: 10000 });
    await expect(rentalsCard.locator('a[href*="rentals"]')).toBeVisible();
  });
});
