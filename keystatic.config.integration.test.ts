// REQ-FIX-002: Keystatic Config Integration Test (API Verification)
// Verifies Keystatic config can be imported and has correct structure
// Updated to test actual Keystatic API (not fictional ui.header)
import { describe, test, expect } from "vitest";
import keystaticConfig, { getStorageConfig } from "./keystatic.config";

describe("REQ-FIX-002 — Keystatic Config API Verification", () => {
  test("config can be imported without errors", () => {
    expect(keystaticConfig).toBeDefined();
    expect(typeof keystaticConfig).toBe("object");
  });

  test("config has required storage property", () => {
    expect(keystaticConfig.storage).toBeDefined();
    expect(keystaticConfig.storage).toHaveProperty("kind");
  });

  test("config has collections property", () => {
    expect(keystaticConfig.collections).toBeDefined();
    expect(typeof keystaticConfig.collections).toBe("object");
  });

  test("storage config returns correct type for development", () => {
    // In test environment, should use local storage
    const storage = getStorageConfig();
    expect(storage).toBeDefined();
    expect(storage.kind).toBe("local");
  });

  test("collections include pages and faqs", () => {
    expect(keystaticConfig.collections).toHaveProperty("pages");
    expect(keystaticConfig.collections).toHaveProperty("faqs");
  });

  test("pages collection has required schema fields", () => {
    const pagesCollection = keystaticConfig.collections.pages;
    expect(pagesCollection).toBeDefined();
    expect(pagesCollection.schema).toBeDefined();
    expect(pagesCollection.schema.title).toBeDefined();
    expect(pagesCollection.schema.body).toBeDefined();
  });

  test("config structure matches Keystatic API requirements", () => {
    // Verify top-level structure
    expect(keystaticConfig).toMatchObject({
      storage: expect.objectContaining({
        kind: expect.stringMatching(/^(local|github)$/),
      }),
      collections: expect.objectContaining({
        pages: expect.any(Object),
        faqs: expect.any(Object),
      }),
    });
  });

  test("ui.header property does NOT exist (documents API limitation)", () => {
    // REQ-FIX-002: This test documents the constraint for future engineers
    // Keystatic v0.5.48 does NOT support ui.header customization
    // Source: @keystatic/core/dist/declarations/src/config.d.ts

    // REQ-FIX-002: Document that ui.header doesn't exist in Keystatic API
    // Config may not define ui at all (valid - ui is optional)
    if (keystaticConfig.ui) {
      expect(keystaticConfig.ui).not.toHaveProperty("header");
    } else {
      // If ui is undefined, header definitely doesn't exist
      expect(keystaticConfig.ui).toBeUndefined();
    }
  });

  test("config supports actual Keystatic ui properties (brand, navigation)", () => {
    // REQ-FIX-002: Documents what IS supported
    // If ui is defined, it should only have brand or navigation
    if (keystaticConfig.ui) {
      const uiKeys = Object.keys(keystaticConfig.ui);
      uiKeys.forEach((key) => {
        expect(["brand", "navigation"]).toContain(key);
      });
    }
    // If ui is undefined, that's also valid (ui is optional)
    expect(keystaticConfig.ui === undefined || typeof keystaticConfig.ui === "object").toBe(true);
  });
});
