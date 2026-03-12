/**
 * FAQ Accordion Alignment & CTA Button Alignment Regression Tests
 * REQ-FAQ-ALIGN: FAQ accordion title supports left/center/right alignment
 * REQ-CTA-ALIGN: CTA button supports left/center/right alignment
 *
 * Tests verify the summer-camp-faq page has centered FAQ title and centered
 * Register Now button, and that the alignment CSS classes are applied correctly.
 */
import { test, expect } from "@playwright/test";

test.describe("FAQ Accordion - Title Alignment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/summer-camp-faq");
    await page.waitForLoadState("networkidle");
  });

  test("FAQ section title is centered on summer-camp-faq", async ({ page }) => {
    const faqTitle = page.locator('[role="region"][aria-label="Summer Camp FAQ"] h2');
    await expect(faqTitle).toBeVisible();
    await expect(faqTitle).toContainText("Summer Camp FAQ");
    // Verify center alignment class
    await expect(faqTitle).toHaveClass(/text-center/);
  });

  test("FAQ accordion renders with proper structure", async ({ page }) => {
    // FAQ section exists
    const faqRegion = page.locator('[role="region"][aria-label="Summer Camp FAQ"]');
    await expect(faqRegion).toBeVisible();

    // Has expandable FAQ items
    const faqButtons = faqRegion.locator('button[aria-expanded]');
    const count = await faqButtons.count();
    expect(count).toBeGreaterThan(5); // We have ~25 FAQ items

    // First FAQ item is clickable and expands
    const firstButton = faqButtons.first();
    await expect(firstButton).toBeVisible();
    await expect(firstButton).toHaveAttribute("aria-expanded", "false");
    await firstButton.click();
    await expect(firstButton).toHaveAttribute("aria-expanded", "true");
  });

  test("FAQ category headers render when multiple categories present", async ({ page }) => {
    // summer-camp-faq has registration, summer-camp, and general categories
    const registrationHeader = page.locator('h3:has-text("Registration")');
    const summerCampHeader = page.locator('h3:has-text("Summer Camp")');
    const generalHeader = page.locator('h3:has-text("General")');

    await expect(registrationHeader).toBeVisible();
    await expect(summerCampHeader).toBeVisible();
    await expect(generalHeader).toBeVisible();
  });
});

test.describe("CTA Button - Alignment", () => {
  test("Register Now button is centered on summer-camp-faq", async ({ page }) => {
    await page.goto("/summer-camp-faq");
    await page.waitForLoadState("networkidle");

    const registerButton = page.locator('a:has-text("Register Now")');
    await expect(registerButton).toBeVisible();

    // The button should be inside a text-center wrapper div
    const wrapper = registerButton.locator('..');
    await expect(wrapper).toHaveClass(/text-center/);
  });

  test("Register Now button links to UltraCamp", async ({ page }) => {
    await page.goto("/summer-camp-faq");
    await page.waitForLoadState("networkidle");

    const registerButton = page.locator('a:has-text("Register Now")');
    await expect(registerButton).toBeVisible();
    const href = await registerButton.getAttribute("href");
    expect(href).toContain("ultracamp.com");
  });
});
