/**
 * Keystatic Floating Navigation (PageEditingToolbar) E2E Tests
 *
 * These tests verify that the floating navigation toolbar appears correctly
 * in the Keystatic editor when editing pages.
 *
 * Prerequisites:
 *   1. Set GITHUB_TEST_USER and GITHUB_TEST_PASS environment variables
 *   2. Run: npx playwright test --project=setup
 *   3. Run: npx playwright test --project=chromium tests/e2e/keystatic/floating-nav.spec.ts
 */
import { test, expect } from "@playwright/test";

// Use saved auth state from setup
test.use({ storageState: "tests/e2e/.auth/user.json" });

const TEST_PAGES = [
  { slug: "index", expectedPath: "/", expectedUrl: "https://www.bearlakecamp.com/" },
  { slug: "about", expectedPath: "/about", expectedUrl: "https://www.bearlakecamp.com/about" },
  { slug: "summer-camp", expectedPath: "/summer-camp", expectedUrl: "https://www.bearlakecamp.com/summer-camp" },
];

test.describe("Keystatic Floating Navigation - Visibility", () => {
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

  test("floating toolbar appears when editing a page", async ({ page }) => {
    // Navigate to edit a page
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    // Screenshot for debugging
    await page.screenshot({
      path: "tests/e2e/screenshots/keystatic-floating-nav-about.png",
      fullPage: true,
    });

    // Look for the toolbar by role
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible({ timeout: 10000 });
  });

  test("floating toolbar has correct positioning (bottom-right)", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Check fixed positioning classes
    const toolbarClasses = await toolbar.getAttribute("class");
    expect(toolbarClasses).toContain("fixed");
    expect(toolbarClasses).toContain("bottom-4");
    expect(toolbarClasses).toContain("right-4");
  });

  test("floating toolbar does NOT appear on dashboard", async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForTimeout(2000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).not.toBeVisible();
  });

  test("floating toolbar does NOT appear on collection list", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages");
    await page.waitForTimeout(2000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).not.toBeVisible();
  });
});

test.describe("Keystatic Floating Navigation - View Live Link", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForTimeout(2000);

    const content = await page.content();
    const isAuthenticated =
      content.includes("Pages") ||
      content.includes("Dashboard") ||
      content.includes("Sign out");

    if (!isAuthenticated) {
      test.skip();
    }
  });

  for (const testPage of TEST_PAGES) {
    test(`shows correct View Live link for ${testPage.slug} page`, async ({ page }) => {
      await page.goto(`/keystatic/branch/main/collection/pages/item/${testPage.slug}`);
      await page.waitForTimeout(3000);

      // Screenshot for debugging
      await page.screenshot({
        path: `tests/e2e/screenshots/keystatic-floating-nav-${testPage.slug}.png`,
        fullPage: true,
      });

      const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
      await expect(toolbar).toBeVisible({ timeout: 10000 });

      // Check the View Live link
      const viewLiveLink = toolbar.locator("a").filter({ hasText: /View.*Live/i });
      await expect(viewLiveLink).toBeVisible();

      // Verify link text contains the path
      const linkText = await viewLiveLink.textContent();
      expect(linkText).toContain(`View ${testPage.expectedPath} Live`);

      // Verify href points to production
      const href = await viewLiveLink.getAttribute("href");
      expect(href).toBe(testPage.expectedUrl);

      // Verify opens in new tab
      expect(await viewLiveLink.getAttribute("target")).toBe("_blank");
      expect(await viewLiveLink.getAttribute("rel")).toBe("noopener noreferrer");
    });
  }
});

test.describe("Keystatic Floating Navigation - Deployment Status", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForTimeout(2000);

    const content = await page.content();
    const isAuthenticated =
      content.includes("Pages") ||
      content.includes("Dashboard") ||
      content.includes("Sign out");

    if (!isAuthenticated) {
      test.skip();
    }
  });

  test("deployment status component is visible in toolbar", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // DeploymentStatus should show one of: Published, Deploying, Failed, or Loading
    const statusText = toolbar.locator("text=/Published|Deploying|Failed|Loading/i");
    await expect(statusText).toBeVisible({ timeout: 10000 });
  });

  test("toolbar has visual separator between status and link", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();

    // Check for separator element (div with w-px class)
    const separator = toolbar.locator("div.w-px");
    await expect(separator).toBeVisible();
  });
});

test.describe("Keystatic Floating Navigation - Accessibility", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForTimeout(2000);

    const content = await page.content();
    const isAuthenticated =
      content.includes("Pages") ||
      content.includes("Dashboard") ||
      content.includes("Sign out");

    if (!isAuthenticated) {
      test.skip();
    }
  });

  test("toolbar has proper ARIA attributes", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    // Use specific selector for our toolbar (not Keystatic's toolbar)
    const toolbar = page.locator('[role="toolbar"][aria-label="Page Editing Tools"]');
    await expect(toolbar).toBeVisible();
  });

  test("View Live link has descriptive aria-label", async ({ page }) => {
    await page.goto("/keystatic/branch/main/collection/pages/item/about");
    await page.waitForTimeout(3000);

    // Use specific selector to find our View Live link
    const viewLiveLink = page.locator('a[aria-label*="production"]');
    await expect(viewLiveLink).toBeVisible();

    const ariaLabel = await viewLiveLink.getAttribute("aria-label");
    expect(ariaLabel).toContain("production");
  });
});
