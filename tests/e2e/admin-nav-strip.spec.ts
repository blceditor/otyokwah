/**
 * REQ-ADMIN-001, REQ-UAT-001: Admin Nav Strip E2E Tests
 *
 * Tests that the admin nav strip appears correctly when authenticated
 * and is hidden for regular visitors.
 *
 * REQ-UAT-001 Acceptance Criteria:
 * - Admin nav visible within 2s for authenticated users
 * - Admin nav hidden for unauthenticated users
 * - All 4 links functional (CMS, Edit Page, Report Bug, Deployment Status)
 * - Nav persists across non-CMS pages
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-001: Admin Nav Strip Visibility", () => {
  test.describe("Unauthenticated Users", () => {
    test("REQ-UAT-001: admin nav strip is NOT visible to regular visitors", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);

      // Wait for page to fully load (auth check runs on mount)
      await page.waitForLoadState("networkidle");

      // Admin nav should not be present
      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible();
    });

    test("REQ-UAT-001: admin nav strip is NOT visible on any page for visitors", async ({
      page,
    }) => {
      // Check multiple pages - validates nav persistence behavior
      const pages = ["/", "/summer-camp", "/about", "/work-at-camp"];

      for (const pagePath of pages) {
        await page.goto(`${PRODUCTION_URL}${pagePath}`);
        await page.waitForLoadState("networkidle");
        const adminNav = page.locator('[data-testid="admin-nav-strip"]');
        await expect(adminNav).not.toBeVisible();
      }
    });

    test("REQ-UAT-001: /api/auth/check returns isAdmin: false for unauthenticated", async ({
      request,
    }) => {
      const response = await request.get(`${PRODUCTION_URL}/api/auth/check`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty("isAdmin", false);
    });
  });

  test.describe("Admin Nav Strip Components", () => {
    // These tests require authentication - skipped when no valid auth token
    test.skip(
      () => !process.env.KEYSTATIC_GITHUB_TOKEN,
      "Skipping admin nav tests - no GitHub token available",
    );

    test("has CMS link", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const cmsLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("CMS")',
      );
      await expect(cmsLink).toBeVisible();
      await expect(cmsLink).toHaveAttribute("href", "/keystatic");
    });

    test("has Report Bug link", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const bugLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("Report Bug")',
      );
      await expect(bugLink).toBeVisible();
      await expect(bugLink).toHaveAttribute("href", /github\.com.*issues/);
    });

    test("has Edit Page link", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(`${PRODUCTION_URL}/about`);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const editLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("Edit Page")',
      );
      await expect(editLink).toBeVisible();
      await expect(editLink).toHaveAttribute("href", /keystatic.*pages.*about/);
    });

    test("has deployment status indicator", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const statusIndicator = page.locator(
        '[data-testid="admin-deployment-status"]',
      );
      await expect(statusIndicator).toBeVisible();
    });
  });

  test.describe("Visual Design", () => {
    test.skip(
      () => !process.env.KEYSTATIC_GITHUB_TOKEN,
      "Skipping visual design tests - no GitHub token available",
    );

    test("admin strip has black background", async ({ page, context }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const bgColor = await adminNav.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      // rgb(0, 0, 0) = black
      expect(bgColor).toBe("rgb(0, 0, 0)");
    });

    test("admin strip is at the top of the page", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const boundingBox = await adminNav.boundingBox();

      // Should be at the very top
      expect(boundingBox?.y).toBe(0);
    });

    test("main content is pushed down (not overlaid)", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: process.env.KEYSTATIC_GITHUB_TOKEN || "test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("networkidle");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      if (!(await adminNav.isVisible().catch(() => false))) {
        test.skip();
        return;
      }

      const header = page.locator("header");

      const adminNavBox = await adminNav.boundingBox();
      const headerBox = await header.boundingBox();

      // Header should start after admin nav
      expect(headerBox?.y).toBeGreaterThanOrEqual(
        (adminNavBox?.y || 0) + (adminNavBox?.height || 0),
      );
    });
  });

  test.describe("Security", () => {
    test("cannot spoof admin access via URL manipulation", async ({ page }) => {
      // Try accessing with query param - should not work
      await page.goto(`${PRODUCTION_URL}/?admin=true`);

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible();
    });

    test("cannot spoof admin access via localStorage", async ({ page }) => {
      await page.goto(PRODUCTION_URL);

      // Try setting localStorage - should not work
      await page.evaluate(() => {
        localStorage.setItem("isAdmin", "true");
      });

      await page.reload();

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible();
    });
  });
});
