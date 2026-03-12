/**
 * REQ-CFG-003: Footer Config — centralized social links and contact info
 *
 * Acceptance:
 * - FOOTER_CONFIG exports all social URL fields
 * - FOOTER_CONFIG exports contact info fields
 * - No hardcoded Bear Lake-specific values in Footer component imports
 */

import { describe, it, expect } from "vitest";
import { FOOTER_CONFIG } from "./footer";

describe("REQ-CFG-003: Footer Configuration", () => {
  it("exports facebookUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("facebookUrl");
    expect(typeof FOOTER_CONFIG.facebookUrl).toBe("string");
  });

  it("exports instagramUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("instagramUrl");
    expect(typeof FOOTER_CONFIG.instagramUrl).toBe("string");
  });

  it("exports youtubeUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("youtubeUrl");
    expect(typeof FOOTER_CONFIG.youtubeUrl).toBe("string");
  });

  it("exports spotifyUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("spotifyUrl");
    expect(typeof FOOTER_CONFIG.spotifyUrl).toBe("string");
  });

  it("exports donationUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("donationUrl");
    expect(typeof FOOTER_CONFIG.donationUrl).toBe("string");
  });

  it("exports contactAddress", () => {
    expect(FOOTER_CONFIG).toHaveProperty("contactAddress");
    expect(typeof FOOTER_CONFIG.contactAddress).toBe("string");
  });

  it("exports contactEmail", () => {
    expect(FOOTER_CONFIG).toHaveProperty("contactEmail");
    expect(typeof FOOTER_CONFIG.contactEmail).toBe("string");
  });

  it("exports contactPhone", () => {
    expect(FOOTER_CONFIG).toHaveProperty("contactPhone");
    expect(typeof FOOTER_CONFIG.contactPhone).toBe("string");
  });

  it("exports mapsUrl", () => {
    expect(FOOTER_CONFIG).toHaveProperty("mapsUrl");
    expect(typeof FOOTER_CONFIG.mapsUrl).toBe("string");
  });

  it("exports siteName", () => {
    expect(FOOTER_CONFIG).toHaveProperty("siteName");
    expect(typeof FOOTER_CONFIG.siteName).toBe("string");
  });

  it("donationUrl is not empty (required for donate link)", () => {
    expect(FOOTER_CONFIG.donationUrl.length).toBeGreaterThan(0);
  });

  it("contactEmail is not empty (required for email link)", () => {
    expect(FOOTER_CONFIG.contactEmail.length).toBeGreaterThan(0);
  });

  it("contactPhone is not empty (required for phone link)", () => {
    expect(FOOTER_CONFIG.contactPhone.length).toBeGreaterThan(0);
  });
});
