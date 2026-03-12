// REQ-INTEGRATE-002: Config Smoke Test
// Verifies Keystatic config loads without runtime errors
import { describe, test, expect } from "vitest";

describe("REQ-INTEGRATE-002 — Keystatic Config Smoke Tests", () => {
  test("config can be dynamically imported", async () => {
    // Dynamic import should not throw
    const module = await import("./keystatic.config");

    expect(module).toBeDefined();
    expect(module.default).toBeDefined();
  });

  test("config has required structure", async () => {
    const { default: config } = await import("./keystatic.config");

    // Must have storage
    expect(config).toHaveProperty("storage");

    // Must have collections
    expect(config).toHaveProperty("collections");
  });

  test("getStorageConfig function is exported", async () => {
    const module = await import("./keystatic.config");

    expect(module.getStorageConfig).toBeDefined();
    expect(typeof module.getStorageConfig).toBe("function");
  });

  test("config does not throw during evaluation", async () => {
    // If we got here, config evaluated without throwing
    const { default: config } = await import("./keystatic.config");

    // Verify it's an object (not undefined/null)
    expect(typeof config).toBe("object");
    expect(config).not.toBeNull();
  });
});
