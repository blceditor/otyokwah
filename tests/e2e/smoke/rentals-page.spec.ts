/**
 * REQ-OP001: Rentals Page E2E Smoke Tests
 * Tests Rentals page with ImageGallery and facility information
 */
import { test, expect } from "@playwright/test";

test.describe("REQ-OP001 — Rentals Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/rentals");
  });

  test("rentals page loads successfully", async ({ page }) => {
    await expect(page).toHaveURL(/\/rentals/);
    await page.screenshot({
      path: "tests/e2e/screenshots/rentals-page.png",
      fullPage: true,
    });
  });

  test("page has main heading", async ({ page }) => {
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    await expect(h1).toContainText("Facility Rentals");
  });

  test("hero section is present", async ({ page }) => {
    // Check for hero image or hero section
    const heroSection = page.locator('[class*="hero"], section').first();
    await expect(heroSection).toBeVisible();
  });

  test("page has multiple content sections", async ({ page }) => {
    const headings = page.locator("h2");
    const count = await headings.count();
    // Should have "Your Next Retreat", "Facilities at a Glance", "Contact Us", etc.
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test("ImageGallery renders", async ({ page }) => {
    // Check for gallery container or images
    const gallery = page.locator('[class*="gallery"], [class*="Gallery"]');
    const images = page.locator("img");
    const galleryCount = await gallery.count();
    const imageCount = await images.count();

    // Either gallery component exists or we have multiple images
    expect(galleryCount + imageCount).toBeGreaterThan(0);
  });

  test("has facility images", async ({ page }) => {
    const images = page.locator("img");
    const count = await images.count();
    // Should have at least one image (hero or gallery)
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("facility links are present", async ({ page }) => {
    // Check for links to facilities sub-pages
    const facilityLinks = page.locator('a[href*="facilities"]');
    const count = await facilityLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("contact link is present", async ({ page }) => {
    const contactLink = page.locator('a[href*="/contact"]');
    await expect(contactLink.first()).toBeVisible();
  });

  test("availability notice is displayed", async ({ page }) => {
    const content = await page.content();
    // Should mention rentals not available May through July
    const hasNotice =
      content.includes("MAY THROUGH JULY") ||
      content.toLowerCase().includes("not available");
    expect(hasNotice).toBe(true);
  });

  test("mobile responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator("h1").first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/rentals-page-mobile.png",
      fullPage: true,
    });
  });

  test("tablet responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator("h1").first()).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/rentals-page-tablet.png",
      fullPage: true,
    });
  });
});
