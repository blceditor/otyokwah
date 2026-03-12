/**
 * REQ-CFG-002: Branding Colors Configuration Tests
 *
 * Verifies BRANDING_COLORS exports all seven brand color values
 * matching the design tokens defined in config/repository.yaml
 * and tailwind.config.ts.
 */

import { describe, it, expect } from "vitest";
import { BRANDING_COLORS } from "./branding";

describe("REQ-CFG-002: Branding Colors Configuration", () => {
  it("exports primary brand blue", () => {
    expect(BRANDING_COLORS.primary).toBe("#4A7A9E");
  });

  it("exports secondary forest green", () => {
    expect(BRANDING_COLORS.secondary).toBe("#2F4F3D");
  });

  it("exports accent warm brown", () => {
    expect(BRANDING_COLORS.accent).toBe("#A07856");
  });

  it("exports cream off-white background", () => {
    expect(BRANDING_COLORS.cream).toBe("#F5F0E8");
  });

  it("exports sand tan", () => {
    expect(BRANDING_COLORS.sand).toBe("#D4C5A9");
  });

  it("exports stone grey", () => {
    expect(BRANDING_COLORS.stone).toBe("#8B7D6B");
  });

  it("exports bark dark brown", () => {
    expect(BRANDING_COLORS.bark).toBe("#3D2E1F");
  });

  it("exports exactly seven color keys", () => {
    const keys = Object.keys(BRANDING_COLORS);
    expect(keys).toHaveLength(7);
    expect(keys).toEqual(["primary", "secondary", "accent", "cream", "sand", "stone", "bark"]);
  });

  it("all color values are valid hex strings", () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const [key, value] of Object.entries(BRANDING_COLORS)) {
      expect(value, `${key} should be a valid hex color`).toMatch(hexPattern);
    }
  });
});
