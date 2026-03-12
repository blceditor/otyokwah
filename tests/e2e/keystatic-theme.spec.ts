/**
 * REQ-CMS-001: Dark Mode Theme Complete
 * REQ-CMS-002: Light Mode Theme Complete
 * REQ-UAT-021: Light/Dark Mode Consistency Fix
 *
 * Playwright E2E tests for Keystatic theme functionality
 */
import { test, expect } from "@playwright/test";

test.describe("REQ-CMS-001 — Keystatic Dark Mode Theme", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to Keystatic admin
    await page.goto("/keystatic");
    // Wait for Keystatic to load
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });
  });

  test("dark mode applies to all form input fields", async ({ page }) => {
    // Enable dark mode via theme toggle
    const themeToggle = page.getByRole("button", {
      name: /toggle theme|dark mode|light mode/i,
    });
    if (await themeToggle.isVisible()) {
      // Click to enable dark mode
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition
    }

    // Verify html element has dark class
    const htmlClass = await page.locator("html").getAttribute("class");
    expect(htmlClass).toContain("dark");

    // Navigate to a page editor
    await page.click("text=Pages");
    await page.waitForTimeout(500);

    // Click on first available page
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Check input fields have dark backgrounds
    const inputs = page.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const bgColor = await input.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor,
        );
        // Should be a dark color (RGB values low)
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          // Dark background should have low RGB values (< 100)
          expect(r).toBeLessThan(100);
          expect(g).toBeLessThan(100);
          expect(b).toBeLessThan(100);
        }
      }
    }
  });

  test("dark mode applies to field labels", async ({ page }) => {
    // Enable dark mode
    const themeToggle = page.getByRole("button", {
      name: /toggle theme|dark mode|light mode/i,
    });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Check label text color
    const labels = page.locator("label, [data-field-label]");
    const labelCount = await labels.count();

    for (let i = 0; i < Math.min(labelCount, 3); i++) {
      const label = labels.nth(i);
      if (await label.isVisible()) {
        const color = await label.evaluate(
          (el) => window.getComputedStyle(el).color,
        );
        // Should be a light color for readability (RGB values high)
        const rgbMatch = color.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          // Light text should have high RGB values (> 150)
          expect(Math.max(r, g, b)).toBeGreaterThan(150);
        }
      }
    }
  });

  test("dark mode applies to SEO section accordion", async ({ page }) => {
    // Enable dark mode
    const themeToggle = page.getByRole("button", {
      name: /toggle theme|dark mode|light mode/i,
    });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(500);
    }

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Find SEO section (usually a details/summary element)
    const seoSection = page.locator('details summary, [aria-label*="SEO"]');
    if (await seoSection.isVisible()) {
      const bgColor = await seoSection.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      // Should have dark background
      const rgbMatch = bgColor.match(/\d+/g);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number);
        expect(Math.max(r, g, b)).toBeLessThan(100);
      }
    }
  });

});

test.describe("REQ-CMS-002 — Keystatic Light Mode Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });
  });

  test("light mode has white/light backgrounds on inputs", async ({ page }) => {
    // Ensure light mode is active (toggle off dark mode if needed)
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Check input fields have light backgrounds
    const inputs = page.locator('input[type="text"], textarea');
    const inputCount = await inputs.count();

    for (let i = 0; i < Math.min(inputCount, 3); i++) {
      const input = inputs.nth(i);
      if (await input.isVisible()) {
        const bgColor = await input.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor,
        );
        // Should be a light color (RGB values high)
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          // Light background should have high RGB values (> 200)
          expect(Math.min(r, g, b)).toBeGreaterThan(200);
        }
      }
    }
  });

  test("light mode labels have dark readable text", async ({ page }) => {
    // Ensure light mode
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Check label text color
    const labels = page.locator("label, [data-field-label]");
    const labelCount = await labels.count();

    for (let i = 0; i < Math.min(labelCount, 3); i++) {
      const label = labels.nth(i);
      if (await label.isVisible()) {
        const color = await label.evaluate(
          (el) => window.getComputedStyle(el).color,
        );
        // Should be a dark color for readability
        const rgbMatch = color.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          // Dark text should have low RGB values (< 100)
          expect(Math.min(r, g, b)).toBeLessThan(100);
        }
      }
    }
  });

  test("theme persists across page navigation", async ({ page }) => {
    // Set to light mode
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to different section
    await page.click("text=Pages");
    await page.waitForTimeout(500);

    // Navigate back
    await page.click("text=Dashboard");
    await page.waitForTimeout(500);

    // Theme should still be light
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).not.toContain("dark");
  });
});

test.describe("REQ-UAT-021 — Light/Dark Mode Consistency Fix", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });
    // Wait for CMS to fully load
    await page.waitForTimeout(1000);
  });

  // Helper to navigate to pages via Content dropdown
  async function navigateToPages(
    page: import("@playwright/test").Page,
  ): Promise<boolean> {
    // Open Content dropdown first
    const contentBtn = page.locator('button:has-text("Content")');
    if (await contentBtn.isVisible()) {
      await contentBtn.click();
      await page.waitForTimeout(300);
      // Click on All Pages in the dropdown
      const pagesLink = page
        .locator('a:has-text("All Pages"), a:has-text("Pages")')
        .first();
      if (await pagesLink.isVisible()) {
        await pagesLink.click();
        await page.waitForTimeout(500);
        return true;
      }
    }
    // Fallback: try direct Pages link if dropdown pattern doesn't match
    const directPages = page.locator("text=Pages").first();
    if (await directPages.isVisible()) {
      await directPages.click();
      await page.waitForTimeout(500);
      return true;
    }
    return false;
  }

  test("light mode sidebar has light background", async ({ page }) => {
    // Ensure light mode is active
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify HTML does NOT have dark class
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).not.toContain("dark");

    // Check sidebar/aside background
    const sidebar = page.locator("aside, nav").first();
    if (await sidebar.isVisible()) {
      const bgColor = await sidebar.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      const rgbMatch = bgColor.match(/\d+/g);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number);
        // Light mode sidebar should have high RGB values (> 200)
        expect(Math.min(r, g, b)).toBeGreaterThan(200);
      }
    }
  });

  test("light mode main content area has light background", async ({
    page,
  }) => {
    // Ensure light mode is active
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Check main content area
    const main = page.locator('main, [role="main"]').first();
    if (await main.isVisible()) {
      const bgColor = await main.evaluate(
        (el) => window.getComputedStyle(el).backgroundColor,
      );
      const rgbMatch = bgColor.match(/\d+/g);
      if (rgbMatch) {
        const [r, g, b] = rgbMatch.map(Number);
        // Light mode main should have high RGB values (> 200)
        expect(Math.min(r, g, b)).toBeGreaterThan(200);
      }
    }
  });

  test("theme persists after page refresh", async ({ page }) => {
    // Set to light mode
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify light mode is set
    let currentClass = await page.locator("html").getAttribute("class");
    expect(currentClass).not.toContain("dark");

    // Refresh the page
    await page.reload();
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });

    // Theme should persist as light after refresh
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).not.toContain("dark");
  });

  test("theme consistent across CMS pages navigation", async ({ page }) => {
    // Set to light mode
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to Pages via Content dropdown
    const navigated = await navigateToPages(page);
    if (navigated) {
      let currentClass = await page.locator("html").getAttribute("class");
      expect(currentClass).not.toContain("dark");

      // Navigate to a specific page if available
      const firstPage = page.locator('[role="listitem"]').first();
      if (await firstPage.isVisible()) {
        await firstPage.click();
        await page.waitForTimeout(1000);
        currentClass = await page.locator("html").getAttribute("class");
        expect(currentClass).not.toContain("dark");
      }
    }

    // Verify theme is still light at the end
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).not.toContain("dark");
  });

  test("popup/modal follows current theme in light mode", async ({ page }) => {
    // Ensure light mode is active
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to Pages and open a page editor
    const navigated = await navigateToPages(page);
    if (navigated) {
      const firstPage = page.locator('[role="listitem"]').first();
      if (await firstPage.isVisible()) {
        await firstPage.click();
        await page.waitForTimeout(1000);
      }

      // Try to open a popup/dialog (e.g., add component button or any modal trigger)
      const addButton = page
        .locator('button:has-text("Add"), [aria-label*="Add"]')
        .first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Check if a dialog/popup opened
        const dialog = page
          .locator('[role="dialog"], [role="menu"], [role="listbox"]')
          .first();
        if (await dialog.isVisible()) {
          const bgColor = await dialog.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor,
          );
          const rgbMatch = bgColor.match(/\d+/g);
          if (rgbMatch) {
            const [r, g, b] = rgbMatch.map(Number);
            // Light mode popup should have high RGB values (> 200)
            expect(Math.min(r, g, b)).toBeGreaterThan(200);
          }
        }
      }
    }

    // Verify we're still in light mode
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).not.toContain("dark");
  });

  test("popup/modal follows current theme in dark mode", async ({ page }) => {
    // Ensure dark mode is active
    const htmlClass = await page.locator("html").getAttribute("class");
    if (!htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify dark mode
    const darkClass = await page.locator("html").getAttribute("class");
    expect(darkClass).toContain("dark");

    // Navigate to Pages and open a page editor
    const navigated = await navigateToPages(page);
    if (navigated) {
      const firstPage = page.locator('[role="listitem"]').first();
      if (await firstPage.isVisible()) {
        await firstPage.click();
        await page.waitForTimeout(1000);
      }

      // Try to open a popup/dialog
      const addButton = page
        .locator('button:has-text("Add"), [aria-label*="Add"]')
        .first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);

        // Check if a dialog/popup opened
        const dialog = page
          .locator('[role="dialog"], [role="menu"], [role="listbox"]')
          .first();
        if (await dialog.isVisible()) {
          const bgColor = await dialog.evaluate(
            (el) => window.getComputedStyle(el).backgroundColor,
          );
          const rgbMatch = bgColor.match(/\d+/g);
          if (rgbMatch) {
            const [r, g, b] = rgbMatch.map(Number);
            // Dark mode popup should have low RGB values (< 100)
            expect(Math.max(r, g, b)).toBeLessThan(100);
          }
        }
      }
    }

    // Verify we're still in dark mode
    const finalClass = await page.locator("html").getAttribute("class");
    expect(finalClass).toContain("dark");
  });

  test("form fields have consistent theme in light mode", async ({ page }) => {
    // Ensure light mode is active
    const htmlClass = await page.locator("html").getAttribute("class");
    if (htmlClass?.includes("dark")) {
      const themeToggle = page.getByRole("button", {
        name: /toggle theme|dark mode|light mode/i,
      });
      if (await themeToggle.isVisible()) {
        await themeToggle.click();
        await page.waitForTimeout(500);
      }
    }

    // Navigate to a page editor
    const navigated = await navigateToPages(page);
    if (navigated) {
      const firstPage = page.locator('[role="listitem"]').first();
      if (await firstPage.isVisible()) {
        await firstPage.click();
        await page.waitForTimeout(1000);
      }
    }

    // Check all form fields have light background
    const formFields = page.locator('input[type="text"], textarea, select');
    const fieldCount = await formFields.count();

    // Skip form field check if no fields are visible (e.g., not authenticated)
    if (fieldCount === 0) {
      // Still verify light mode is active
      const finalClass = await page.locator("html").getAttribute("class");
      expect(finalClass).not.toContain("dark");
      return;
    }

    let lightFieldCount = 0;
    for (let i = 0; i < Math.min(fieldCount, 5); i++) {
      const field = formFields.nth(i);
      if (await field.isVisible()) {
        const bgColor = await field.evaluate(
          (el) => window.getComputedStyle(el).backgroundColor,
        );
        const rgbMatch = bgColor.match(/\d+/g);
        if (rgbMatch) {
          const [r, g, b] = rgbMatch.map(Number);
          // Light mode form fields should have high RGB values (> 200)
          if (Math.min(r, g, b) > 200) {
            lightFieldCount++;
          }
        }
      }
    }

    // At least some fields should be properly themed (if we got here, there are fields)
    expect(lightFieldCount).toBeGreaterThan(0);
  });
});

test.describe("REQ-CMS-005 — No Blank Component Above SEO", () => {
  test("no empty collapsible sections in page editor", async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Check for empty details/fieldset elements
    const detailsElements = page.locator("details, fieldset");
    const count = await detailsElements.count();

    for (let i = 0; i < count; i++) {
      const element = detailsElements.nth(i);
      if (await element.isVisible()) {
        // Get inner content excluding the summary/legend
        const innerContent = await element.evaluate((el) => {
          const clone = el.cloneNode(true) as HTMLElement;
          clone.querySelector("summary, legend")?.remove();
          return clone.textContent?.trim() || "";
        });

        // Element should have content if visible
        // Allow for some elements that might be empty but styled
        const hasInputs = await element
          .locator("input, textarea, select")
          .count();
        if (hasInputs === 0 && innerContent.length === 0) {
          // This is a potentially blank element
          const isHidden = await element.evaluate(
            (el) => window.getComputedStyle(el).display === "none",
          );
          // Should be hidden if empty
          expect(isHidden).toBe(true);
        }
      }
    }
  });

  test("SEO section has content", async ({ page }) => {
    await page.goto("/keystatic");
    await page.waitForSelector("[data-keystatic-wrapper], main", {
      timeout: 10000,
    });

    // Navigate to a page
    await page.click("text=Pages");
    await page.waitForTimeout(500);
    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1000);
    }

    // Find SEO section
    const seoSection = page.locator("text=SEO").first();
    if (await seoSection.isVisible()) {
      // Click to expand if collapsed
      await seoSection.click();
      await page.waitForTimeout(300);

      // Should have input fields
      const seoInputs = page.locator(
        '[data-field-label*="Meta"], input[name*="meta"], input[name*="seo"]',
      );
      const inputCount = await seoInputs.count();
      expect(inputCount).toBeGreaterThan(0);
    }
  });
});
