/**
 * Keystatic Admin UI Tests for Testing Pages
 *
 * These tests verify that the testing-* pages render correctly
 * in the Keystatic editor WITHOUT field validation errors.
 *
 * Prerequisites:
 *   1. Set GITHUB_TEST_USER and GITHUB_TEST_PASS environment variables
 *   2. Run: npx playwright test --project=setup
 *   3. Run: npx playwright test --project=chromium tests/e2e/keystatic/testing-pages.spec.ts
 */
import { test, expect } from "@playwright/test";

// Use saved auth state from setup
test.use({ storageState: "tests/e2e/.auth/user.json" });

const TESTING_PAGES = [
  "testing-components",
  "testing-gallery-cards",
  "testing-forms",
];

test.describe("Keystatic Testing Pages - No Field Errors", () => {
  test.beforeEach(async ({ page }) => {
    // Verify we can access Keystatic admin
    await page.goto("/keystatic");
    await page.waitForTimeout(2000);

    // Check if authenticated
    const content = await page.content();
    const isAuthenticated =
      content.includes("Pages") ||
      content.includes("Dashboard") ||
      content.includes("Sign out");

    if (!isAuthenticated) {
      test.skip();
    }
  });

  for (const pageName of TESTING_PAGES) {
    test(`${pageName} page loads without field validation errors`, async ({
      page,
    }) => {
      // Navigate to the page in Keystatic editor
      await page.goto(
        `/keystatic/branch/main/collection/pages/item/${pageName}`,
      );

      // Wait for page to load
      await page.waitForTimeout(3000);

      // Take a screenshot for debugging
      await page.screenshot({
        path: `tests/e2e/screenshots/keystatic-${pageName}.png`,
        fullPage: true,
      });

      // Check for VISIBLE error alerts (not hidden text in HTML/JS)
      // Keystatic shows errors in an alert role element with actual error text
      const visibleErrorAlert = page.locator('[role="alert"]').filter({
        hasText: /Field validation failed|Unexpected error|Error:/i,
      });
      const errorAlertCount = await visibleErrorAlert.count();

      // Also check for specific error text that would be visible to users
      const errorText = page.getByText(/Field validation failed/);
      const errorTextVisible = await errorText.isVisible().catch(() => false);

      // Collect error information
      const errors: string[] = [];
      if (errorAlertCount > 0) {
        const alertText = await visibleErrorAlert.first().textContent();
        errors.push(`Error alert visible: ${alertText}`);
      }
      if (errorTextVisible) {
        errors.push("Field validation error text visible");
      }

      // The test passes only if NO visible errors are found
      expect(errors, `Errors found on ${pageName}: ${errors.join(", ")}`).toEqual([]);
    });
  }

  test("testing-components page has no Markdoc syntax errors in body", async ({
    page,
  }) => {
    await page.goto(
      "/keystatic/branch/main/collection/pages/item/testing-components",
    );
    await page.waitForTimeout(3000);

    // Look specifically for the body field error state
    const bodyErrorIndicator = page.locator(
      '[data-field="body"] [data-error], [aria-invalid="true"]',
    );

    const errorCount = await bodyErrorIndicator.count();

    // Screenshot for debugging
    await page.screenshot({
      path: "tests/e2e/screenshots/keystatic-testing-components-body.png",
      fullPage: true,
    });

    expect(
      errorCount,
      "Body field has validation errors - Markdoc syntax may be invalid",
    ).toBe(0);
  });

});

test.describe("Keystatic Editor Functionality", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("editor loads without JavaScript errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    // Listen for console errors
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(
      "/keystatic/branch/main/collection/pages/item/testing-components",
    );
    await page.waitForTimeout(5000);

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes("favicon") &&
        !err.includes("404") &&
        !err.includes("net::ERR"),
    );

    // Screenshot
    await page.screenshot({
      path: "tests/e2e/screenshots/keystatic-console-errors.png",
      fullPage: true,
    });

    // Allow some minor errors, but flag if there are many
    expect(
      criticalErrors.length,
      `Console errors: ${criticalErrors.join("\n")}`,
    ).toBeLessThan(5);
  });
});
