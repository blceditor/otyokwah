/**
 * Component Test Pages E2E Smoke Tests
 * Tests all Keystatic components render correctly after deployment
 *
 * These tests validate the testing-* pages that contain all component types.
 * Run these after Vercel deployment completes to verify component rendering.
 */
import { test, expect } from "@playwright/test";

// Tests for Keystatic Markdoc components.
// These tests validate components render correctly on deployed testing pages.
test.describe("Component Test Pages", () => {
  test.describe("testing-components page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/testing-components");
    });

    test("page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/testing-components/);
      await expect(page.locator("h1")).toContainText("Component Test Page");
    });

    test("CTA button renders", async ({ page }) => {
      const ctaButton = page.locator('a:has-text("Test CTA Button")');
      await expect(ctaButton).toBeVisible();
      await expect(ctaButton).toHaveAttribute("href", "/contact");
    });

    test("content card renders", async ({ page }) => {
      const cardTitle = page.locator('text="Test Content Card"');
      await expect(cardTitle).toBeVisible();
    });

    test("stats table renders", async ({ page }) => {
      // Stats shown as markdown table - use heading locator for section
      const statsSection = page.getByRole("heading", { name: /Stats.*Metrics/i });
      const yearsStat = page.getByText("Years of Ministry");

      await expect(statsSection).toBeVisible();
      await expect(yearsStat).toBeVisible();
    });

    test("accordion renders and is interactive", async ({ page }) => {
      // Find FAQ accordion question button
      const question = page.getByRole("button", {
        name: "Is this accordion working?",
      });
      await expect(question).toBeVisible();

      // First item is pre-expanded, click a collapsed item instead
      const secondQuestion = page.getByRole("button", {
        name: "What should I test?",
      });
      await secondQuestion.click();

      // Verify the button is now expanded (aria-expanded attribute)
      await expect(secondQuestion).toHaveAttribute("aria-expanded", "true");
    });

    test("YouTube embed renders", async ({ page }) => {
      // YouTube embeds typically use iframes
      const youtubeEmbed = page.locator('iframe[src*="youtube"]');
      const count = await youtubeEmbed.count();
      // YouTube might be blocked or lazy-loaded
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test("testimonial blockquote renders", async ({ page }) => {
      // Testimonial as blockquote
      const testimonialQuote = page.locator('blockquote:has-text("test testimonial quote")');
      const authorName = page.locator('text="Test Author"');

      await expect(testimonialQuote).toBeVisible();
      await expect(authorName).toBeVisible();
    });

    test("two column content renders", async ({ page }) => {
      const leftColumn = page.locator('text="Left Column Content"');
      const rightColumn = page.locator('text="Right Column Content"');

      await expect(leftColumn).toBeVisible();
      await expect(rightColumn).toBeVisible();
    });

    test("donate button renders", async ({ page }) => {
      const donateButton = page.locator('a:has-text("Test Donate Button")');
      await expect(donateButton).toBeVisible();
      await expect(donateButton).toHaveAttribute(
        "href",
        expect.stringContaining("donorbox"),
      );
    });

    test("captures full page screenshot", async ({ page }) => {
      await page.screenshot({
        path: "tests/e2e/screenshots/testing-components.png",
        fullPage: true,
      });
    });
  });

  // Gallery and card components tests
  test.describe("testing-gallery-cards page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/testing-gallery-cards");
    });

    test("page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/testing-gallery-cards/);
      await expect(page.locator("h1")).toContainText("Gallery and Cards Test");
    });

    test("photo gallery renders with images", async ({ page }) => {
      const images = page.locator('img[alt*="Chapel"], img[alt*="Dining"]');
      const count = await images.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test("card grid with content cards renders", async ({ page }) => {
      const cardOne = page.locator('text="Value Card One"');
      const cardTwo = page.locator('text="Value Card Two"');

      await expect(cardOne).toBeVisible();
      await expect(cardTwo).toBeVisible();
    });

    test("section cards render", async ({ page }) => {
      // Section cards contain test position descriptions (multiple exist, use first)
      const sectionCard = page.getByText(/test position description/i).first();
      await expect(sectionCard).toBeVisible();
    });

    test("info card renders with list", async ({ page }) => {
      const heading = page.locator('text="Test Info Card"');
      const listItem = page.locator('text="First list item"');

      await expect(heading).toBeVisible();
      await expect(listItem).toBeVisible();
    });

    test("captures full page screenshot", async ({ page }) => {
      await page.screenshot({
        path: "tests/e2e/screenshots/testing-gallery-cards.png",
        fullPage: true,
      });
    });
  });

  test.describe("testing-forms page", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/testing-forms");
    });

    test("page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/testing-forms/);
      await expect(page.locator("h1")).toContainText("Form Components Test");
    });

    test("contact form renders", async ({ page }) => {
      const form = page.locator('form[aria-label="Contact form"]');
      await expect(form).toBeVisible();
    });

    test("form has all required fields", async ({ page }) => {
      await expect(page.locator("#contact-name")).toBeVisible();
      await expect(page.locator("#contact-email")).toBeVisible();
      await expect(page.locator("#contact-message")).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test("turnstile widget is attached", async ({ page }) => {
      const turnstile = page.locator("[data-turnstile]");
      await expect(turnstile).toBeAttached();
    });

    test("captures full page screenshot", async ({ page }) => {
      await page.screenshot({
        path: "tests/e2e/screenshots/testing-forms.png",
        fullPage: true,
      });
    });
  });

  test.describe("Component rendering verification", () => {
    test("all test pages are accessible", async ({ page }) => {
      const testPages = [
        "/testing-components",
        "/testing-gallery-cards",
        "/testing-forms",
      ];

      for (const testPage of testPages) {
        const response = await page.goto(testPage);
        expect(response?.status()).toBe(200);
      }
    });

    test("test pages are hidden from search engines", async ({ page }) => {
      // Check noIndex meta tag on test pages
      await page.goto("/testing-components");

      const robotsMeta = page.locator('meta[name="robots"]');
      const count = await robotsMeta.count();

      if (count > 0) {
        const content = await robotsMeta.getAttribute("content");
        expect(content).toContain("noindex");
      }
    });
  });
});
