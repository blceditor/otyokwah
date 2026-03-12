/**
 * REQ-UAT-020: CMS Navigation (2 SP)
 *
 * TDD Tests - MUST FAIL before implementation
 *
 * Acceptance Criteria:
 * - Top nav has black background, white text
 * - Content dropdown opens and contains: All Pages, Media Library
 * - Tools dropdown contains: Generate All SEO
 * - Help dropdown contains: Report Issue
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-020 -- CMS Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);
  });

  test("REQ-UAT-020 -- top nav has black background", async ({ page }) => {
    // Find the top navigation bar
    const topNav = page.locator(
      '[data-testid="cms-top-nav"], header nav, [role="navigation"]:first-of-type, .keystatic-nav',
    );

    await expect(topNav.first()).toBeVisible({ timeout: 10000 });

    const bgColor = await topNav.first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Black = rgb(0, 0, 0) or very close to it
    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    expect(rgbMatch, "Background color should be parseable").not.toBeNull();

    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      expect(
        r,
        "Red channel should be near 0 for black background",
      ).toBeLessThanOrEqual(30);
      expect(
        g,
        "Green channel should be near 0 for black background",
      ).toBeLessThanOrEqual(30);
      expect(
        b,
        "Blue channel should be near 0 for black background",
      ).toBeLessThanOrEqual(30);
    }
  });

  test("REQ-UAT-020 -- top nav has white text", async ({ page }) => {
    const topNav = page.locator(
      '[data-testid="cms-top-nav"], header nav, [role="navigation"]:first-of-type',
    );

    await expect(topNav.first()).toBeVisible({ timeout: 10000 });

    // Check text color of links/buttons in nav
    const navText = topNav.first().locator("a, button, span").first();

    if (await navText.isVisible()) {
      const textColor = await navText.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // White = rgb(255, 255, 255) or close to it
      const rgbMatch = textColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      expect(rgbMatch, "Text color should be parseable").not.toBeNull();

      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        expect(
          r,
          "Red channel should be near 255 for white text",
        ).toBeGreaterThanOrEqual(220);
        expect(
          g,
          "Green channel should be near 255 for white text",
        ).toBeGreaterThanOrEqual(220);
        expect(
          b,
          "Blue channel should be near 255 for white text",
        ).toBeGreaterThanOrEqual(220);
      }
    }
  });

  test("REQ-UAT-020 -- Content dropdown exists and opens", async ({ page }) => {
    // Find Content dropdown trigger
    const contentDropdown = page.locator(
      'button:has-text("Content"), [data-testid="content-dropdown"], [aria-label*="Content"]',
    );

    await expect(
      contentDropdown.first(),
      "Content dropdown trigger should exist",
    ).toBeVisible({ timeout: 10000 });

    // Click to open
    await contentDropdown.first().click();
    await page.waitForTimeout(300);

    // Dropdown should open
    const dropdownMenu = page.locator(
      '[role="menu"], [data-testid="content-dropdown-menu"], .dropdown-menu',
    );
    await expect(
      dropdownMenu.first(),
      "Content dropdown should open",
    ).toBeVisible();
  });

  test("REQ-UAT-020 -- Content dropdown contains All Pages", async ({
    page,
  }) => {
    // Open Content dropdown
    const contentDropdown = page.locator(
      'button:has-text("Content"), [data-testid="content-dropdown"]',
    );

    if (await contentDropdown.first().isVisible()) {
      await contentDropdown.first().click();
      await page.waitForTimeout(300);

      // Check for All Pages option
      const allPagesOption = page.locator(
        '[role="menuitem"]:has-text("All Pages"), ' +
          '[role="menuitem"]:has-text("Pages"), ' +
          'a:has-text("All Pages")',
      );
      await expect(
        allPagesOption.first(),
        "Content dropdown should contain 'All Pages' option",
      ).toBeVisible();
    }
  });

  test("REQ-UAT-020 -- Content dropdown contains Media Library", async ({
    page,
  }) => {
    // Open Content dropdown
    const contentDropdown = page.locator(
      'button:has-text("Content"), [data-testid="content-dropdown"]',
    );

    if (await contentDropdown.first().isVisible()) {
      await contentDropdown.first().click();
      await page.waitForTimeout(300);

      // Check for Media Library option
      const mediaLibraryOption = page.locator(
        '[role="menuitem"]:has-text("Media Library"), ' +
          '[role="menuitem"]:has-text("Media"), ' +
          'a:has-text("Media Library")',
      );
      await expect(
        mediaLibraryOption.first(),
        "Content dropdown should contain 'Media Library' option",
      ).toBeVisible();
    }
  });

  test("REQ-UAT-020 -- Tools dropdown exists and contains Generate All SEO", async ({
    page,
  }) => {
    // Find Tools dropdown trigger
    const toolsDropdown = page.locator(
      'button:has-text("Tools"), [data-testid="tools-dropdown"], [aria-label*="Tools"]',
    );

    await expect(
      toolsDropdown.first(),
      "Tools dropdown trigger should exist",
    ).toBeVisible({ timeout: 10000 });

    // Click to open
    await toolsDropdown.first().click();
    await page.waitForTimeout(300);

    // Check for Generate All SEO option
    const generateSeoOption = page.locator(
      '[role="menuitem"]:has-text("Generate All SEO"), ' +
        '[role="menuitem"]:has-text("Generate SEO"), ' +
        'button:has-text("Generate All SEO")',
    );
    await expect(
      generateSeoOption.first(),
      "Tools dropdown should contain 'Generate All SEO' option",
    ).toBeVisible();
  });

  test("REQ-UAT-020 -- Help dropdown exists and contains Report Issue", async ({
    page,
  }) => {
    // Find Help dropdown trigger
    const helpDropdown = page.locator(
      'button:has-text("Help"), [data-testid="help-dropdown"], [aria-label*="Help"]',
    );

    await expect(
      helpDropdown.first(),
      "Help dropdown trigger should exist",
    ).toBeVisible({ timeout: 10000 });

    // Click to open
    await helpDropdown.first().click();
    await page.waitForTimeout(300);

    // Check for Report Issue option
    const reportIssueOption = page.locator(
      '[role="menuitem"]:has-text("Report Issue"), ' +
        '[role="menuitem"]:has-text("Report Bug"), ' +
        'a:has-text("Report Issue")',
    );
    await expect(
      reportIssueOption.first(),
      "Help dropdown should contain 'Report Issue' option",
    ).toBeVisible();
  });

  test("REQ-UAT-020 -- clicking Report Issue opens GitHub issues", async ({
    page,
  }) => {
    // Open Help dropdown
    const helpDropdown = page.locator(
      'button:has-text("Help"), [data-testid="help-dropdown"]',
    );

    if (await helpDropdown.first().isVisible()) {
      await helpDropdown.first().click();
      await page.waitForTimeout(300);

      // Find Report Issue link
      const reportIssueLink = page.locator(
        '[role="menuitem"]:has-text("Report Issue"), a:has-text("Report Issue")',
      );

      if (await reportIssueLink.first().isVisible()) {
        const href = await reportIssueLink.first().getAttribute("href");
        expect(href, "Report Issue should link to GitHub issues").toMatch(
          /github\.com.*issues/,
        );
      }
    }
  });

  test("REQ-UAT-020 -- navigation dropdowns close on outside click", async ({
    page,
  }) => {
    // Open a dropdown
    const contentDropdown = page.locator(
      'button:has-text("Content"), [data-testid="content-dropdown"]',
    );

    if (await contentDropdown.first().isVisible()) {
      await contentDropdown.first().click();
      await page.waitForTimeout(300);

      // Verify dropdown is open
      const dropdownMenu = page.locator('[role="menu"]').first();
      await expect(dropdownMenu).toBeVisible();

      // Click outside
      await page.click("body", { position: { x: 10, y: 10 } });
      await page.waitForTimeout(300);

      // Dropdown should be closed
      await expect(
        dropdownMenu,
        "Dropdown should close on outside click",
      ).not.toBeVisible();
    }
  });
});
