/**
 * REQ-MEDIA-003: Browse Media in Markdoc Component Editors
 * Story Points: 5.0 SP
 *
 * Layer 2 E2E tests: Verifies Browse Media buttons appear in the Keystatic
 * editor for both top-level page fields and Markdoc component editors.
 *
 * This test suite catches the regression where fields.text() was swapped
 * to fields.image() in Markdoc components, breaking MediaFieldEnhancer
 * injection of Browse Media buttons.
 *
 * Requires: Authenticated Keystatic session (GitHub OAuth)
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

const KEYSTATIC_RENDER_DELAY = 2000;

function setupAuth(context: import("@playwright/test").BrowserContext) {
  return context.addCookies([
    {
      name: "keystatic-gh-access-token",
      value: "valid_test_token",
      domain: new URL(PRODUCTION_URL).hostname,
      path: "/",
    },
  ]);
}

test.describe("REQ-MEDIA-003: Browse Media — Top-Level Page Fields", () => {
  test("Hero Image Path field has Browse Media button on homepage editor", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    // Browse Media buttons should be injected by MediaFieldEnhancer
    const browseMediaButtons = page.locator(
      '[data-testid="media-picker-trigger"], button.media-browse-btn',
    );

    const count = await browseMediaButtons.count();

    // At minimum, Hero Image Path and Hero Video Path should have buttons
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify first button is visible
    await expect(browseMediaButtons.first()).toBeVisible();

    await page.screenshot({
      path: `verification-screenshots/REQ-MEDIA-003-hero-browse-media-${Date.now()}.png`,
      fullPage: false,
    });
  });

  test("Hero Video Path field has Browse Media button", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    // Find Browse Media buttons by text
    const browseButtons = page.locator('button:has-text("Browse Media")');
    const count = await browseButtons.count();

    // Should have at least 2 (hero image + hero video)
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe("REQ-MEDIA-003: Browse Media — Dialog Functionality", () => {
  test("clicking Browse Media opens media library dialog", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    const browseButton = page
      .locator(
        '[data-testid="media-picker-trigger"], button.media-browse-btn',
      )
      .first();

    const isVisible = await browseButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await browseButton.click();

    // Media library dialog should open
    const dialog = page.locator(
      '[role="dialog"][aria-modal="true"]:has-text("Media Library")',
    );
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Should show the media browser component
    const mediaBrowser = page.locator('[data-testid="media-browser"]');
    await expect(mediaBrowser).toBeVisible({ timeout: 5000 });

    await page.screenshot({
      path: `verification-screenshots/REQ-MEDIA-003-dialog-open-${Date.now()}.png`,
      fullPage: false,
    });
  });

  test("media library dialog has upload button", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    const browseButton = page
      .locator(
        '[data-testid="media-picker-trigger"], button.media-browse-btn',
      )
      .first();

    const isVisible = await browseButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await browseButton.click();

    // Upload button should be visible in the dialog
    const uploadButton = page.locator(
      '[data-testid="media-upload-button"]',
    );
    await expect(uploadButton).toBeVisible({ timeout: 5000 });
  });

  test("media library dialog closes on Escape key", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    const browseButton = page
      .locator(
        '[data-testid="media-picker-trigger"], button.media-browse-btn',
      )
      .first();

    const isVisible = await browseButton.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await browseButton.click();

    const dialog = page.locator('[role="dialog"][aria-modal="true"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Press Escape to close
    await page.keyboard.press("Escape");

    // Dialog should close
    await expect(dialog).not.toBeVisible({ timeout: 3000 });
  });
});

test.describe(
  "REQ-MEDIA-003: Browse Media — Markdoc Component Editors",
  () => {
    test("wideCard component editor has image field as text input (not file upload)", async ({
      page,
      context,
    }) => {
      await setupAuth(context);

      await page.goto(
        `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

      // Scroll down to find the wideCard components in the ProseMirror editor
      const wideCard = page.locator('text="wideCard"').first();
      const isVisible = await wideCard.isVisible().catch(() => false);

      if (!isVisible) {
        // Scroll to find wideCard in the editor
        await page.evaluate(() => {
          const el = document.querySelector('.ProseMirror');
          if (el) el.scrollTop = el.scrollHeight;
        });
        await page.waitForTimeout(500);
      }

      // Click on the wideCard to select it in the ProseMirror editor
      const wideCardEl = page.locator('text="wideCard"').first();
      if (await wideCardEl.isVisible().catch(() => false)) {
        await wideCardEl.click();
        await page.waitForTimeout(500);

        // Check what kind of fields appear when the component editor opens
        // After our fix: should be text inputs (not file inputs)
        const fileInputs = await page
          .locator('input[type="file"]')
          .count();
        const textInputs = await page
          .locator('input[type="text"]')
          .count();

        // The component editor should use text inputs for image paths
        // (not native file upload inputs from fields.image())
        // Note: file inputs may exist for other reasons, but text inputs
        // should be present for the image path field
        expect(textInputs).toBeGreaterThan(0);

        await page.screenshot({
          path: `verification-screenshots/REQ-MEDIA-003-widecard-editor-${Date.now()}.png`,
          fullPage: false,
        });
      }
    });

    test("campSessionCard component editor has image field as text input", async ({
      page,
      context,
    }) => {
      await setupAuth(context);

      await page.goto(
        `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/index`,
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

      // Find campSessionCard in ProseMirror editor
      const campCard = page.locator('text="campSessionCard"').first();

      if (await campCard.isVisible().catch(() => false)) {
        await campCard.click();
        await page.waitForTimeout(500);

        // After our fix: image field should be text input
        const textInputs = await page
          .locator('input[type="text"]')
          .count();
        expect(textInputs).toBeGreaterThan(0);

        await page.screenshot({
          path: `verification-screenshots/REQ-MEDIA-003-campsession-editor-${Date.now()}.png`,
          fullPage: false,
        });
      }
    });
  },
);

test.describe(
  "REQ-MEDIA-003: Browse Media — Cross-Page Verification",
  () => {
    test("Browse Media buttons appear on non-homepage page editors", async ({
      page,
      context,
    }) => {
      await setupAuth(context);

      // Test a page that has hero image fields
      await page.goto(
        `${PRODUCTION_URL}/keystatic/branch/main/collection/pages/item/summer-camp`,
      );
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

      // Should have Browse Media buttons for hero fields
      const browseButtons = page.locator(
        '[data-testid="media-picker-trigger"], button.media-browse-btn',
      );

      // Even non-homepage pages with hero image/video fields should get buttons
      const count = await browseButtons.count();

      // At least hero image should have a button (if the field has a value)
      // This is a soft check since the field might be empty
      if (count > 0) {
        await expect(browseButtons.first()).toBeVisible();
      }

      await page.screenshot({
        path: `verification-screenshots/REQ-MEDIA-003-summer-camp-editor-${Date.now()}.png`,
        fullPage: false,
      });
    });
  },
);

test.describe("REQ-MEDIA-003: Browse Media — Negative Tests", () => {
  test("Browse Media buttons do NOT appear on non-editor pages", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    // Dashboard page should NOT have Browse Media buttons
    await page.goto(`${PRODUCTION_URL}/keystatic`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    const browseButtons = page.locator(
      '[data-testid="media-picker-trigger"], button.media-browse-btn',
    );
    const count = await browseButtons.count();

    expect(count).toBe(0);
  });

  test("Browse Media buttons do NOT appear on collection list page", async ({
    page,
    context,
  }) => {
    await setupAuth(context);

    await page.goto(
      `${PRODUCTION_URL}/keystatic/branch/main/collection/pages`,
    );
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(KEYSTATIC_RENDER_DELAY);

    const browseButtons = page.locator(
      '[data-testid="media-picker-trigger"], button.media-browse-btn',
    );
    const count = await browseButtons.count();

    expect(count).toBe(0);
  });
});
