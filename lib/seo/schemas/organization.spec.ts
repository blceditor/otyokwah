/**
 * REQ-SEO-002: Organization JSON-LD schema uses centralized config
 *
 * Acceptance:
 * - generateOrganizationSchema() produces valid schema.org/Organization from SiteConfig
 * - Values come from the SiteConfig parameter, not hardcoded strings
 * - Address is correctly parsed from comma-separated format
 * - sameAs array populated from config social URLs
 */

import { describe, it, expect } from "vitest";
import { generateOrganizationSchema } from "./organization";
import { SITE } from "@/lib/config/site";
import type { SiteConfig } from "@/lib/config/site-config";

const TEST_CONFIG: SiteConfig = {
  siteName: "Test Camp",
  logoPath: "/images/logo/test.png",
  logoAlt: "Test Camp",
  contactEmail: "test@test.org",
  contactPhone: "(555) 123-4567",
  contactPhoneHref: "tel:+15551234567",
  contactAddress: "123 Main St, Springfield, IL 62701",
  registrationUrl: "https://register.test.com",
  donationUrl: "https://donate.test.com",
  facebookUrl: "https://facebook.com/testcamp",
  instagramUrl: "https://instagram.com/testcamp",
  youtubeUrl: "https://youtube.com/testcamp",
  spotifyUrl: "https://spotify.com/testcamp",
  mapsUrl: "https://maps.google.com/testcamp",
};

describe("REQ-SEO-002: Organization JSON-LD Schema", () => {
  it("returns a valid schema.org Organization type", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
  });

  it("uses config.siteName as name", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.name).toBe("Test Camp");
  });

  it("url matches SITE.productionUrl", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.url).toBe(SITE.productionUrl);
  });

  it("logo uses SITE.productionUrl as base", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.logo).toContain(SITE.productionUrl);
  });

  it("parses 3-part address correctly", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.address["@type"]).toBe("PostalAddress");
    expect(schema.address.streetAddress).toBe("123 Main St");
    expect(schema.address.addressLocality).toBe("Springfield");
    expect(schema.address.addressRegion).toBe("IL");
    expect(schema.address.postalCode).toBe("62701");
    expect(schema.address.addressCountry).toBe("US");
  });

  it("populates sameAs from config social URLs", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.sameAs).toContain("https://facebook.com/testcamp");
    expect(schema.sameAs).toContain("https://instagram.com/testcamp");
  });

  it("filters empty social URLs from sameAs", () => {
    const emptyConfig = { ...TEST_CONFIG, facebookUrl: "", instagramUrl: "" };
    const schema = generateOrganizationSchema(emptyConfig);
    expect(schema.sameAs).toHaveLength(0);
  });

  it("uses config telephone in contactPoint", () => {
    const schema = generateOrganizationSchema(TEST_CONFIG);
    expect(schema.contactPoint.telephone).toBe("+15551234567");
  });
});
