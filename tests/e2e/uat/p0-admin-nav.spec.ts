/**
 * REQ-UAT-001: Admin Nav Strip E2E Tests (2 SP)
 *
 * TDD: These tests MUST FAIL initially until implementation is complete.
 *
 * Acceptance Criteria:
 * - Admin nav visible for authenticated users within 3s
 * - Admin nav hidden for unauthenticated users
 * - Nav persists across page navigation
 * - All 4 links work (CMS, Edit Page, Report Bug, Deployment Status)
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';
const AUTH_TIMEOUT = 3000; // 3 seconds as per REQ-UAT-001

test.describe("REQ-UAT-001: Admin Nav Strip", () => {
  test.describe("Unauthenticated Users", () => {
    test("REQ-UAT-001-01 - admin nav is hidden for unauthenticated users on homepage", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);
      await page.waitForLoadState("domcontentloaded");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible({ timeout: AUTH_TIMEOUT });
    });

    test("REQ-UAT-001-02 - admin nav is hidden for unauthenticated users on all pages", async ({
      page,
    }) => {
      const pages = [
        "/",
        "/summer-camp",
        "/about",
        "/work-at-camp",
        "/retreats",
        "/contact",
      ];

      for (const pagePath of pages) {
        await page.goto(`${PRODUCTION_URL}${pagePath}`);
        await page.waitForLoadState("domcontentloaded");

        const adminNav = page.locator('[data-testid="admin-nav-strip"]');
        await expect(adminNav).not.toBeVisible({ timeout: AUTH_TIMEOUT });
      }
    });
  });

  test.describe("Authenticated Users", () => {
    // These tests require authentication via GitHub OAuth
    // They will use the auth setup project from playwright.config.ts

    test("REQ-UAT-001-03 - admin nav appears within 3 seconds for authenticated user", async ({
      page,
      context,
    }) => {
      // Mock auth cookie for testing
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');

      // MUST appear within 3 seconds (REQ-UAT-001 acceptance criteria)
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });
    });

    test("REQ-UAT-001-04 - admin nav persists across page navigation", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      // Start on homepage
      await page.goto(PRODUCTION_URL);
      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });

      // Navigate to summer-camp
      await page.goto(`${PRODUCTION_URL}/summer-camp`);
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });

      // Navigate to about
      await page.goto(`${PRODUCTION_URL}/about`);
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });

      // Navigate to contact
      await page.goto(`${PRODUCTION_URL}/contact`);
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });
    });

    test("REQ-UAT-001-05 - CMS link exists and points to /keystatic", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const cmsLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("CMS")',
      );
      await expect(cmsLink).toBeVisible({ timeout: AUTH_TIMEOUT });
      await expect(cmsLink).toHaveAttribute("href", "/keystatic");
    });

    test("REQ-UAT-001-06 - Edit Page link exists and uses correct format", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(`${PRODUCTION_URL}/about`);

      const editLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("Edit Page")',
      );
      await expect(editLink).toBeVisible({ timeout: AUTH_TIMEOUT });

      // Should point to Keystatic page editor with correct format
      await expect(editLink).toHaveAttribute(
        "href",
        /\/keystatic\/branch\/main\/collection\/pages\/item\/about/,
      );
    });

    test("REQ-UAT-001-07 - Report Bug link exists and opens GitHub issues", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const bugLink = page.locator(
        '[data-testid="admin-nav-strip"] a:has-text("Report Bug")',
      );
      await expect(bugLink).toBeVisible({ timeout: AUTH_TIMEOUT });
      await expect(bugLink).toHaveAttribute("href", /github\.com.*issues\/new/);
      await expect(bugLink).toHaveAttribute("target", "_blank");
    });

    test("REQ-UAT-001-08 - Deployment Status indicator is visible", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const statusIndicator = page.locator(
        '[data-testid="admin-deployment-status"]',
      );
      await expect(statusIndicator).toBeVisible({ timeout: AUTH_TIMEOUT });
    });
  });

  test.describe("Visual Design", () => {
    test("REQ-UAT-001-09 - admin strip has black background", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });

      const bgColor = await adminNav.evaluate(
        (el) => getComputedStyle(el).backgroundColor,
      );
      // rgb(0, 0, 0) = black
      expect(bgColor).toBe("rgb(0, 0, 0)");
    });

    test("REQ-UAT-001-10 - admin strip is fixed at top of viewport", async ({
      page,
      context,
    }) => {
      await context.addCookies([
        {
          name: "keystatic-gh-access-token",
          value: "valid_test_token",
          domain: new URL(PRODUCTION_URL).hostname,
          path: "/",
        },
      ]);

      await page.goto(PRODUCTION_URL);

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).toBeVisible({ timeout: AUTH_TIMEOUT });

      const position = await adminNav.evaluate(
        (el) => getComputedStyle(el).position,
      );
      expect(position).toBe("fixed");

      const top = await adminNav.evaluate((el) => getComputedStyle(el).top);
      expect(top).toBe("0px");
    });
  });

  test.describe("Security", () => {
    test("REQ-UAT-001-11 - cannot spoof admin access via query params", async ({
      page,
    }) => {
      await page.goto(`${PRODUCTION_URL}/?admin=true`);
      await page.waitForLoadState("domcontentloaded");

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible({ timeout: AUTH_TIMEOUT });
    });

    test("REQ-UAT-001-12 - cannot spoof admin access via localStorage", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);

      await page.evaluate(() => {
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("authenticated", "true");
      });

      await page.reload();

      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible({ timeout: AUTH_TIMEOUT });
    });
  });

  test.describe("Screenshot Evidence", () => {
    test("REQ-UAT-001-13 - capture admin nav strip screenshot on failure", async ({
      page,
    }) => {
      await page.goto(PRODUCTION_URL);

      // This test intentionally captures screenshot for verification
      await page.screenshot({
        path: `verification-screenshots/REQ-UAT-001-admin-nav-${Date.now()}.png`,
        fullPage: false,
      });

      // Unauthenticated should not see admin nav
      const adminNav = page.locator('[data-testid="admin-nav-strip"]');
      await expect(adminNav).not.toBeVisible({ timeout: AUTH_TIMEOUT });
    });
  });
});
