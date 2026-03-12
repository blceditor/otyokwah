/**
 * REQ-UAT-016: Component Deduplication (2 SP)
 *
 * TDD Tests - MUST FAIL before implementation
 *
 * Acceptance Criteria:
 * - No duplicate component names in CMS add menu
 * - Each component has distinct description
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-UAT-016 -- Component Deduplication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-016 -- CMS add menu has no duplicate component names", async ({
    page,
  }) => {
    // Navigate to a page editor to access component add menu
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Find the add component button (+ button in content editor)
    const addComponentButton = page.locator(
      'button[aria-label*="Add"], button:has-text("+"), [data-testid="add-component-button"]',
    );

    if (await addComponentButton.first().isVisible()) {
      await addComponentButton.first().click();
      await page.waitForTimeout(500);

      // Get all component names from the dropdown/menu
      const componentMenuItems = page.locator(
        '[role="menuitem"], [role="option"], [data-component-name]',
      );
      const componentNames: string[] = [];

      const itemCount = await componentMenuItems.count();
      for (let i = 0; i < itemCount; i++) {
        const name = await componentMenuItems.nth(i).textContent();
        if (name) {
          componentNames.push(name.trim().toLowerCase());
        }
      }

      // Check for duplicates
      const uniqueNames = new Set(componentNames);
      expect(
        componentNames.length,
        `Found duplicate components: ${componentNames.filter((name, idx) => componentNames.indexOf(name) !== idx).join(", ")}`,
      ).toBe(uniqueNames.size);
    }
  });

  test("REQ-UAT-016 -- each component has a distinct description", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Open component add menu
    const addComponentButton = page.locator(
      'button[aria-label*="Add"], button:has-text("+"), [data-testid="add-component-button"]',
    );

    if (await addComponentButton.first().isVisible()) {
      await addComponentButton.first().click();
      await page.waitForTimeout(500);

      // Get all component descriptions
      const componentItems = page.locator(
        '[role="menuitem"], [role="option"], [data-component-item]',
      );
      const descriptions: string[] = [];

      const itemCount = await componentItems.count();
      for (let i = 0; i < itemCount; i++) {
        // Look for description text (usually smaller text below component name)
        const description = await componentItems
          .nth(i)
          .locator("[data-description], .description, small, span:last-child")
          .textContent();
        if (description) {
          descriptions.push(description.trim().toLowerCase());
        }
      }

      // All descriptions should be unique and non-empty
      const uniqueDescriptions = new Set(
        descriptions.filter((d) => d.length > 0),
      );
      expect(
        descriptions.filter((d) => d.length > 0).length,
        "All visible components should have unique descriptions",
      ).toBe(uniqueDescriptions.size);
    }
  });

  test("REQ-UAT-016 -- deprecated InfoCard component is removed from menu", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Open component add menu
    const addComponentButton = page.locator(
      'button[aria-label*="Add"], button:has-text("+"), [data-testid="add-component-button"]',
    );

    if (await addComponentButton.first().isVisible()) {
      await addComponentButton.first().click();
      await page.waitForTimeout(500);

      // InfoCard should NOT appear if ContentCard exists (deduplication)
      const infoCardOption = page.locator(
        '[role="menuitem"]:has-text("InfoCard"), [role="option"]:has-text("InfoCard")',
      );
      const contentCardOption = page.locator(
        '[role="menuitem"]:has-text("ContentCard"), [role="option"]:has-text("ContentCard")',
      );

      const hasInfoCard = await infoCardOption.isVisible().catch(() => false);
      const hasContentCard = await contentCardOption
        .isVisible()
        .catch(() => false);

      // If ContentCard exists, InfoCard should be removed (deduplicated)
      if (hasContentCard) {
        expect(
          hasInfoCard,
          "InfoCard should be removed when ContentCard exists",
        ).toBe(false);
      }
    }
  });

  test("REQ-UAT-016 -- component list is alphabetically sorted", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Open component add menu
    const addComponentButton = page.locator(
      'button[aria-label*="Add"], button:has-text("+"), [data-testid="add-component-button"]',
    );

    if (await addComponentButton.first().isVisible()) {
      await addComponentButton.first().click();
      await page.waitForTimeout(500);

      // Get all component names
      const componentMenuItems = page.locator(
        '[role="menuitem"], [role="option"]',
      );
      const componentNames: string[] = [];

      const itemCount = await componentMenuItems.count();
      for (let i = 0; i < itemCount; i++) {
        const name = await componentMenuItems.nth(i).textContent();
        if (name) {
          componentNames.push(name.trim());
        }
      }

      // Check alphabetical order
      const sortedNames = [...componentNames].sort((a, b) =>
        a.toLowerCase().localeCompare(b.toLowerCase()),
      );
      expect(componentNames).toEqual(sortedNames);
    }
  });
});
