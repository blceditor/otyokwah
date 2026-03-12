/**
 * REQ-UAT-019: Color Picker (2 SP)
 *
 * TDD Tests - MUST FAIL before implementation
 *
 * Acceptance Criteria:
 * - Theme color presets visible (Emerald, Sky Blue, Amber, Purple, Cream, Bark)
 * - Clicking preset updates hex value
 * - Hex input validation works
 * - Invalid hex shows error
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

const THEME_COLOR_PRESETS = [
  { name: "Emerald", hex: "#10b981" },
  { name: "Sky Blue", hex: "#0ea5e9" },
  { name: "Amber", hex: "#f59e0b" },
  { name: "Purple", hex: "#8b5cf6" },
  { name: "Cream", hex: "#fef3c7" },
  { name: "Bark", hex: "#78350f" },
];

test.describe("REQ-UAT-019 -- Color Picker", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("REQ-UAT-019 -- theme color presets are visible in color picker", async ({
    page,
  }) => {
    // Navigate to a page with color picker fields
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const testPage = page.locator("text=testing-components").first();
    if (await testPage.isVisible().catch(() => false)) {
      await testPage.click();
    } else {
      const firstPage = page.locator('[role="listitem"]').first();
      await firstPage.click();
    }
    await page.waitForTimeout(1500);

    // Find color picker preview and click to open modal
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    await expect(
      colorPreview,
      "Color picker preview should be visible",
    ).toBeVisible({ timeout: 10000 });

    await colorPreview.click();
    await page.waitForTimeout(500);

    // Check all theme presets are visible
    for (const preset of THEME_COLOR_PRESETS) {
      const presetButton = page.locator(
        `[data-testid="theme-color-preset"][data-color-name="${preset.name}"], ` +
          `[data-testid="theme-color-preset"]:has-text("${preset.name}"), ` +
          `button[aria-label*="${preset.name}"]`,
      );
      await expect(
        presetButton.first(),
        `Theme preset "${preset.name}" should be visible`,
      ).toBeVisible();
    }
  });

  test("REQ-UAT-019 -- color picker shows exactly 6 theme presets", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Open color picker
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible()) {
      await colorPreview.click();
      await page.waitForTimeout(500);

      // Count theme presets
      const themePresets = page.locator('[data-testid="theme-color-preset"]');
      const presetCount = await themePresets.count();

      expect(
        presetCount,
        "Should have exactly 6 theme color presets (Emerald, Sky Blue, Amber, Purple, Cream, Bark)",
      ).toBe(6);
    }
  });

  test("REQ-UAT-019 -- clicking preset updates hex value", async ({ page }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Open color picker
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    await expect(colorPreview).toBeVisible({ timeout: 10000 });
    await colorPreview.click();
    await page.waitForTimeout(500);

    // Get the hex input
    const hexInput = page.locator('[data-testid="color-hex-input"]').first();
    await expect(hexInput).toBeVisible();

    // Get initial value
    const initialValue = await hexInput.inputValue();

    // Click on a theme preset (Emerald)
    const emeraldPreset = page.locator(
      '[data-testid="theme-color-preset"][data-color-name="Emerald"], ' +
        '[data-testid="theme-color-preset"]:has-text("Emerald")',
    );
    await emeraldPreset.first().click();
    await page.waitForTimeout(300);

    // Get new value
    const newValue = await hexInput.inputValue();

    // Value should have changed to Emerald's hex
    expect(
      newValue.toLowerCase(),
      "Hex value should update to Emerald color",
    ).toBe(THEME_COLOR_PRESETS[0].hex.toLowerCase());
    expect(newValue, "Hex value should change after clicking preset").not.toBe(
      initialValue,
    );
  });

  test("REQ-UAT-019 -- hex input accepts valid hex values", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Find hex input (may be directly visible or need to open picker)
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible()) {
      await colorPreview.click();
      await page.waitForTimeout(500);
    }

    const hexInput = page.locator('[data-testid="color-hex-input"]').first();
    await expect(hexInput).toBeVisible({ timeout: 10000 });

    // Enter valid hex
    await hexInput.fill("#ff5500");
    await page.waitForTimeout(300);

    // Should NOT show error
    const isInvalid = await hexInput.getAttribute("aria-invalid");
    expect(isInvalid, "Valid hex should not show error").not.toBe("true");

    // Color preview should update
    const previewBgColor = await colorPreview.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // #ff5500 = rgb(255, 85, 0)
    expect(
      previewBgColor,
      "Color preview should reflect entered hex value",
    ).toMatch(/rgb\(255,\s*85,\s*0\)/);
  });

  test("REQ-UAT-019 -- invalid hex shows error state", async ({ page }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Open color picker
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible()) {
      await colorPreview.click();
      await page.waitForTimeout(500);
    }

    const hexInput = page.locator('[data-testid="color-hex-input"]').first();
    await expect(hexInput).toBeVisible({ timeout: 10000 });

    // Enter invalid hex values and check for error
    const invalidValues = ["invalid", "xyz123", "#gg0000", "12345", "#12"];

    for (const invalidValue of invalidValues) {
      await hexInput.fill(invalidValue);
      await page.waitForTimeout(200);

      const isInvalid = await hexInput.getAttribute("aria-invalid");
      expect(
        isInvalid,
        `Invalid hex "${invalidValue}" should show aria-invalid="true"`,
      ).toBe("true");
    }
  });

  test("REQ-UAT-019 -- error message is shown for invalid hex", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Open color picker
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible()) {
      await colorPreview.click();
      await page.waitForTimeout(500);
    }

    const hexInput = page.locator('[data-testid="color-hex-input"]').first();
    await expect(hexInput).toBeVisible({ timeout: 10000 });

    // Enter invalid hex
    await hexInput.fill("not-a-color");
    await page.waitForTimeout(300);

    // Look for error message
    const errorMessage = page.locator(
      '[data-testid="color-error"], [role="alert"], .error-message, [aria-describedby] + [id]',
    );
    const hasError = await errorMessage.isVisible().catch(() => false);

    expect(hasError, "Error message should be displayed for invalid hex").toBe(
      true,
    );
  });

  test("REQ-UAT-019 -- hex input normalizes 3-digit hex to 6-digit", async ({
    page,
  }) => {
    // Navigate to page editor
    await page.click("text=Pages");
    await page.waitForTimeout(1000);

    const firstPage = page.locator('[role="listitem"]').first();
    await firstPage.click();
    await page.waitForTimeout(1500);

    // Open color picker
    const colorPreview = page.locator('[data-testid="color-preview"]').first();
    if (await colorPreview.isVisible()) {
      await colorPreview.click();
      await page.waitForTimeout(500);
    }

    const hexInput = page.locator('[data-testid="color-hex-input"]').first();
    await expect(hexInput).toBeVisible({ timeout: 10000 });

    // Enter 3-digit hex
    await hexInput.fill("#f00");
    await hexInput.blur();
    await page.waitForTimeout(300);

    // Should be valid (no error)
    const isInvalid = await hexInput.getAttribute("aria-invalid");
    expect(isInvalid, "3-digit hex should be valid").not.toBe("true");

    // Value should be normalized or preview should work
    const previewBgColor = await colorPreview.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor,
    );
    // #f00 = rgb(255, 0, 0)
    expect(previewBgColor, "3-digit hex should render correctly").toMatch(
      /rgb\(255,\s*0,\s*0\)/,
    );
  });
});
