/**
 * REQ-UAT-021: Light/Dark Mode (2 SP)
 *
 * TDD Tests - MUST FAIL before implementation
 *
 * Acceptance Criteria:
 * - Toggle switches theme
 * - Light mode: all backgrounds light, form fields light
 * - Dark mode: all backgrounds dark
 * - Popup/modals follow theme
 * - Theme persists after refresh and navigation
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-021 -- Light/Dark Mode", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);
  });

  test("REQ-UAT-021 -- theme toggle button exists", async ({ page }) => {
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], ' +
        'button[aria-label*="theme"], ' +
        'button[aria-label*="dark"], ' +
        'button[aria-label*="light"], ' +
        'button:has(svg[class*="sun"]), ' +
        'button:has(svg[class*="moon"])',
    );

    await expect(
      themeToggle.first(),
      "Theme toggle button should exist",
    ).toBeVisible({ timeout: 10000 });
  });

  test("REQ-UAT-021 -- clicking toggle switches from light to dark", async ({
    page,
  }) => {
    // Ensure starting in light mode
    const htmlElement = page.locator("html");
    const initialClass = await htmlElement.getAttribute("class");

    // If in dark mode, toggle to light first
    if (initialClass?.includes("dark")) {
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button[aria-label*="theme"]',
      );
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Verify we're in light mode
    const lightModeClass = await htmlElement.getAttribute("class");
    expect(
      lightModeClass,
      "Should start in light mode for this test",
    ).not.toContain("dark");

    // Click toggle to switch to dark mode
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="dark"]',
    );
    await themeToggle.first().click();
    await page.waitForTimeout(500);

    // Verify dark mode is enabled
    const darkModeClass = await htmlElement.getAttribute("class");
    expect(darkModeClass, "Dark mode should be enabled after toggle").toContain(
      "dark",
    );
  });

  test("REQ-UAT-021 -- light mode has light backgrounds", async ({ page }) => {
    // Ensure light mode
    const htmlElement = page.locator("html");
    const currentClass = await htmlElement.getAttribute("class");

    if (currentClass?.includes("dark")) {
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button[aria-label*="theme"]',
      );
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Check main content area background
    const mainContent = page.locator("main, [data-keystatic-wrapper], body");
    const bgColor = await mainContent.first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      // Light background should have high RGB values (> 200)
      expect(
        Math.min(r, g, b),
        "Light mode background should have high RGB values",
      ).toBeGreaterThan(200);
    }
  });

  test("REQ-UAT-021 -- light mode form fields have light backgrounds", async ({
    page,
  }) => {
    // Ensure light mode and navigate to page editor
    const htmlElement = page.locator("html");
    const currentClass = await htmlElement.getAttribute("class");

    if (currentClass?.includes("dark")) {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Check form field backgrounds
    const formFields = page.locator('input[type="text"], textarea, select');
    const fieldCount = await formFields.count();

    for (let i = 0; i < Math.min(fieldCount, 3); i++) {
      const field = formFields.nth(i);
      if (await field.isVisible()) {
        const bgColor = await field.evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          expect(
            Math.min(r, g, b),
            "Light mode form fields should have light backgrounds",
          ).toBeGreaterThan(200);
        }
      }
    }
  });

  test("REQ-UAT-021 -- dark mode has dark backgrounds", async ({ page }) => {
    // Enable dark mode
    const htmlElement = page.locator("html");
    const currentClass = await htmlElement.getAttribute("class");

    if (!currentClass?.includes("dark")) {
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button[aria-label*="theme"]',
      );
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Verify dark class is present
    const darkClass = await htmlElement.getAttribute("class");
    expect(darkClass).toContain("dark");

    // Check main content area background
    const mainContent = page.locator("main, [data-keystatic-wrapper], body");
    const bgColor = await mainContent.first().evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch.map(Number);
      // Dark background should have low RGB values (< 100)
      expect(
        Math.max(r, g, b),
        "Dark mode background should have low RGB values",
      ).toBeLessThan(100);
    }
  });

  test("REQ-UAT-021 -- popup/modals follow theme", async ({ page }) => {
    // Enable dark mode
    const htmlElement = page.locator("html");
    const currentClass = await htmlElement.getAttribute("class");

    if (!currentClass?.includes("dark")) {
      const themeToggle = page.locator('[data-testid="theme-toggle"]');
      await themeToggle.first().click();
      await page.waitForTimeout(500);
    }

    // Navigate to page editor to trigger a modal
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Open a color picker modal (if available)
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible().catch(() => false)) {
      await colorPreview.click();
      await page.waitForTimeout(500);

      // Check modal/dialog background
      const modal = page.locator(
        '[role="dialog"], [data-testid="color-picker-modal"], .modal',
      );
      if (await modal.isVisible()) {
        const modalBgColor = await modal.first().evaluate((el) => {
          return window.getComputedStyle(el).backgroundColor;
        });

        const rgbMatch = modalBgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
          const [, r, g, b] = rgbMatch.map(Number);
          // In dark mode, modal should also have dark background
          expect(
            Math.max(r, g, b),
            "Modal should follow dark theme",
          ).toBeLessThan(100);
        }
      }
    }
  });

  test("REQ-UAT-021 -- theme persists after page refresh", async ({ page }) => {
    // Set to dark mode
    const htmlElement = page.locator("html");

    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"]',
    );
    if (await themeToggle.first().isVisible()) {
      // Ensure dark mode
      const currentClass = await htmlElement.getAttribute("class");
      if (!currentClass?.includes("dark")) {
        await themeToggle.first().click();
        await page.waitForTimeout(500);
      }

      // Verify dark mode is set
      const darkClass = await htmlElement.getAttribute("class");
      expect(darkClass).toContain("dark");

      // Refresh the page
      await page.reload();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);

      // Theme should persist
      const classAfterRefresh = await htmlElement.getAttribute("class");
      expect(
        classAfterRefresh,
        "Dark theme should persist after refresh",
      ).toContain("dark");
    }
  });

  test("REQ-UAT-021 -- theme persists after navigation", async ({ page }) => {
    // Set to dark mode
    const htmlElement = page.locator("html");

    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"]',
    );
    if (await themeToggle.first().isVisible()) {
      // Ensure dark mode
      const currentClass = await htmlElement.getAttribute("class");
      if (!currentClass?.includes("dark")) {
        await themeToggle.first().click();
        await page.waitForTimeout(500);
      }

      // Navigate to different CMS pages
      await page.click("text=Pages");
      await page.waitForTimeout(1000);

      // Theme should persist on Pages list
      let classAfterNav = await htmlElement.getAttribute("class");
      expect(
        classAfterNav,
        "Dark theme should persist when navigating to Pages",
      ).toContain("dark");

      // Navigate to a specific page
      const firstPage = page.locator('[role="listitem"]').first();
      if (await firstPage.isVisible()) {
        await firstPage.click();
        await page.waitForTimeout(1500);

        // Theme should still persist
        classAfterNav = await htmlElement.getAttribute("class");
        expect(
          classAfterNav,
          "Dark theme should persist when navigating to page editor",
        ).toContain("dark");
      }
    }
  });

  test("REQ-UAT-021 -- theme is stored in localStorage", async ({ page }) => {
    // Set to dark mode
    const themeToggle = page.locator(
      '[data-testid="theme-toggle"], button[aria-label*="theme"]',
    );

    if (await themeToggle.first().isVisible()) {
      // Ensure dark mode
      const htmlClass = await page.locator("html").getAttribute("class");
      if (!htmlClass?.includes("dark")) {
        await themeToggle.first().click();
        await page.waitForTimeout(500);
      }

      // Check localStorage
      const storedTheme = await page.evaluate(() => {
        return (
          localStorage.getItem("theme") ||
          localStorage.getItem("keystatic-theme") ||
          localStorage.getItem("color-scheme")
        );
      });

      expect(
        storedTheme,
        "Theme preference should be stored in localStorage",
      ).toBeTruthy();
      expect(
        storedTheme?.toLowerCase(),
        "Stored theme should be dark",
      ).toContain("dark");
    }
  });
});
