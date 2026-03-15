/**
 * REQ-CFG-001: Analytics Configuration Tests
 *
 * Verifies ANALYTICS exports the correct GA4 measurement ID default
 * and honours the NEXT_PUBLIC_GA_ID environment variable override.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("REQ-CFG-001: Analytics Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_GA_ID;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("exports the default GA4 measurement ID when no env var is set", async () => {
    const { ANALYTICS } = await import("./analytics");
    expect(ANALYTICS.ga4MeasurementId).toBe("");
  });

  it("exports DEFAULT_GA4_MEASUREMENT_ID matching the YAML value", async () => {
    const { DEFAULT_GA4_MEASUREMENT_ID } = await import("./analytics");
    expect(DEFAULT_GA4_MEASUREMENT_ID).toBe("");
  });

  it("uses NEXT_PUBLIC_GA_ID env var override when set", async () => {
    process.env.NEXT_PUBLIC_GA_ID = "G-TESTOVERRIDE";
    const { ANALYTICS } = await import("./analytics");
    expect(ANALYTICS.ga4MeasurementId).toBe("G-TESTOVERRIDE");
  });

  it("DEFAULT_GA4_MEASUREMENT_ID matches ANALYTICS fallback when no env var", async () => {
    const { ANALYTICS, DEFAULT_GA4_MEASUREMENT_ID } = await import("./analytics");
    expect(ANALYTICS.ga4MeasurementId).toBe(DEFAULT_GA4_MEASUREMENT_ID);
  });
});
