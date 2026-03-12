/**
 * REQ-OP002, REQ-OP003, REQ-OP004: Give Page E2E Smoke Tests
 * Tests Give page with DonorBox integration and wishlist links
 */
import { test, expect } from "@playwright/test";

test.describe("Give Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/give");
  });

  test("give page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/give/);
    await page.screenshot({
      path: "tests/e2e/screenshots/give-page.png",
      fullPage: true,
    });
  });

  test("page has main heading", async ({ page }) => {
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
  });

  test("REQ-OP004: DonorBox link is present", async ({ page }) => {
    const donorboxLink = page.locator('a[href*="donorbox.org"]');
    await expect(donorboxLink.first()).toBeVisible();
  });

  test("REQ-OP004: DonorBox link has correct URL", async ({ page }) => {
    const donorboxLink = page.locator('a[href*="donorbox.org"]').first();
    await expect(donorboxLink).toHaveAttribute(
      "href",
      expect.stringContaining("donate-to-blc"),
    );
  });

  test("REQ-OP003: wishlist section exists", async ({ page }) => {
    const content = await page.content();
    // Check for wishlist references (Amazon or Walmart)
    const hasWishlist =
      content.toLowerCase().includes("wishlist") ||
      content.toLowerCase().includes("amazon") ||
      content.toLowerCase().includes("walmart");
    expect(hasWishlist).toBe(true);
  });

  test("REQ-OP002: page has multiple content sections", async ({ page }) => {
    // Check for section headings (h2 elements)
    const headings = page.locator("h2");
    const count = await headings.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("page has call-to-action buttons", async ({ page }) => {
    const buttons = page.locator("a").filter({ hasText: /donate|give/i });
    await expect(buttons.first()).toBeVisible();
  });

  test("mobile responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/give-page-mobile.png",
      fullPage: true,
    });
  });

  test("external links open in new tab", async ({ page }) => {
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();
    // Should have at least DonorBox as external link
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
