/**
 * REQ-OP005: Contact Form E2E Smoke Tests
 * Tests ContactForm with Cloudflare Turnstile integration
 */
import { test, expect } from "@playwright/test";

test.describe("REQ-OP005 — Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact");
  });

  test("contact page loads with form", async ({ page }) => {
    await expect(
      page.locator('form[aria-label="Contact form"]'),
    ).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/contact-form.png",
      fullPage: true,
    });
  });

  test("form has required fields", async ({ page }) => {
    await expect(page.locator("#contact-name")).toBeVisible();
    await expect(page.locator("#contact-email")).toBeVisible();
    await expect(page.locator("#contact-message")).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("name field has required attribute", async ({ page }) => {
    const nameField = page.locator("#contact-name");
    await expect(nameField).toHaveAttribute("required");
  });

  test("email field has required attribute", async ({ page }) => {
    const emailField = page.locator("#contact-email");
    await expect(emailField).toHaveAttribute("required");
  });

  test("message field has required attribute", async ({ page }) => {
    const messageField = page.locator("#contact-message");
    await expect(messageField).toHaveAttribute("required");
  });

  test("turnstile widget container exists", async ({ page }) => {
    // Invisible turnstile renders a container div
    await expect(page.locator("[data-turnstile]")).toBeAttached();
  });

  test("submit button text is correct", async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toHaveText(
      "Send Message",
    );
  });

  test("form is accessible with aria-label", async ({ page }) => {
    const form = page.locator("form");
    await expect(form).toHaveAttribute("aria-label", "Contact form");
  });

  test("form fields have labels", async ({ page }) => {
    await expect(page.locator('label[for="contact-name"]')).toBeVisible();
    await expect(page.locator('label[for="contact-email"]')).toBeVisible();
    await expect(page.locator('label[for="contact-message"]')).toBeVisible();
  });

  test("mobile responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(
      page.locator('form[aria-label="Contact form"]'),
    ).toBeVisible();
    await page.screenshot({
      path: "tests/e2e/screenshots/contact-form-mobile.png",
      fullPage: true,
    });
  });
});
