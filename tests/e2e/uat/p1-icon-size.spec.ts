/**
 * REQ-UAT-018: Icon Size Settings (1 SP)
 *
 * TDD Tests - MUST FAIL before implementation
 *
 * Acceptance Criteria:
 * - Icon size dropdown has: Small, Medium, Large, Extra Large
 * - XL icon renders at 48px
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

const EXPECTED_ICON_SIZES = ["Small", "Medium", "Large", "Extra Large"];
const XL_ICON_SIZE_PX = 48;

test.describe("REQ-UAT-018 -- Icon Size Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-018 -- icon size dropdown contains all required options", async ({
    page,
  }) => {
    // Navigate to a page editor with icon settings
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    if (await firstPage.isVisible()) {
      await firstPage.click();
      await page.waitForTimeout(1500);
    }

    // Find icon size dropdown (may be in a component's settings)
    const iconSizeSelect = page.locator(
      '[data-testid="icon-size-select"], select[name*="iconSize"], [aria-label*="Icon Size"], [data-field="iconSize"]',
    );

    await expect(iconSizeSelect.first()).toBeVisible({ timeout: 10000 });

    // Click to open dropdown
    await iconSizeSelect.first().click();
    await page.waitForTimeout(300);

    // Check all required options exist
    for (const size of EXPECTED_ICON_SIZES) {
      const option = page.locator(
        `[role="option"]:has-text("${size}"), option:has-text("${size}")`,
      );
      await expect(
        option.first(),
        `Icon size option "${size}" should be available`,
      ).toBeVisible();
    }
  });

  test("REQ-UAT-018 -- icon size dropdown shows exactly 4 size options", async ({
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

    // Find and click icon size dropdown
    const iconSizeSelect = page.locator(
      '[data-testid="icon-size-select"], select[name*="iconSize"], [aria-label*="Icon Size"]',
    );

    if (await iconSizeSelect.first().isVisible()) {
      await iconSizeSelect.first().click();
      await page.waitForTimeout(300);

      // Count options
      const options = page.locator('[role="option"], option');
      const optionCount = await options.count();

      expect(
        optionCount,
        "Should have exactly 4 icon size options (Small, Medium, Large, Extra Large)",
      ).toBe(4);
    }
  });

  test("REQ-UAT-018 -- XL icon renders at 48px on frontend", async ({
    page,
  }) => {
    // Go to a page that has icons with XL size configured
    await page.goto(`${PRODUCTION_URL}/testing-components`);
    await page.waitForLoadState("networkidle");

    // Find XL icons on the page
    const xlIcon = page.locator(
      '[data-icon-size="xl"] svg, [data-icon-size="extra-large"] svg, .icon-xl svg',
    );

    if ((await xlIcon.count()) > 0) {
      const firstXlIcon = xlIcon.first();
      await expect(firstXlIcon).toBeVisible();

      // Get computed size
      const iconSize = await firstXlIcon.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          width: parseFloat(computed.width),
          height: parseFloat(computed.height),
        };
      });

      expect(
        iconSize.width,
        `XL icon width should be ${XL_ICON_SIZE_PX}px`,
      ).toBe(XL_ICON_SIZE_PX);
      expect(
        iconSize.height,
        `XL icon height should be ${XL_ICON_SIZE_PX}px`,
      ).toBe(XL_ICON_SIZE_PX);
    } else {
      // If no XL icons exist yet, this test should fail to indicate implementation needed
      expect(
        await xlIcon.count(),
        "No XL icons found - implementation required",
      ).toBeGreaterThan(0);
    }
  });

  test("REQ-UAT-018 -- Small icon renders smaller than Medium", async ({
    page,
  }) => {
    await page.goto(`${PRODUCTION_URL}/testing-components`);
    await page.waitForLoadState("networkidle");

    const smallIcon = page.locator(
      '[data-icon-size="sm"] svg, [data-icon-size="small"] svg, .icon-sm svg',
    );
    const mediumIcon = page.locator(
      '[data-icon-size="md"] svg, [data-icon-size="medium"] svg, .icon-md svg',
    );

    if ((await smallIcon.count()) > 0 && (await mediumIcon.count()) > 0) {
      const smallSize = await smallIcon.first().evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).width);
      });

      const mediumSize = await mediumIcon.first().evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).width);
      });

      expect(
        smallSize,
        "Small icon should be smaller than Medium icon",
      ).toBeLessThan(mediumSize);
    } else {
      // Test should fail if icons don't exist
      expect(
        (await smallIcon.count()) > 0 && (await mediumIcon.count()) > 0,
        "Both small and medium icons should exist for comparison",
      ).toBe(true);
    }
  });

  test("REQ-UAT-018 -- Large icon renders smaller than Extra Large", async ({
    page,
  }) => {
    await page.goto(`${PRODUCTION_URL}/testing-components`);
    await page.waitForLoadState("networkidle");

    const largeIcon = page.locator(
      '[data-icon-size="lg"] svg, [data-icon-size="large"] svg, .icon-lg svg',
    );
    const xlIcon = page.locator(
      '[data-icon-size="xl"] svg, [data-icon-size="extra-large"] svg, .icon-xl svg',
    );

    if ((await largeIcon.count()) > 0 && (await xlIcon.count()) > 0) {
      const largeSize = await largeIcon.first().evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).width);
      });

      const xlSize = await xlIcon.first().evaluate((el) => {
        return parseFloat(window.getComputedStyle(el).width);
      });

      expect(
        largeSize,
        "Large icon should be smaller than Extra Large icon",
      ).toBeLessThan(xlSize);
      expect(xlSize, `XL icon should be ${XL_ICON_SIZE_PX}px`).toBe(
        XL_ICON_SIZE_PX,
      );
    } else {
      expect(
        (await largeIcon.count()) > 0 && (await xlIcon.count()) > 0,
        "Both large and XL icons should exist for comparison",
      ).toBe(true);
    }
  });
});
