/**
 * REQ-KEYSTATIC-002 — siteConfig singleton schema validation
 */
import { siteConfig } from "./site-config";
import { singletons } from "./index";

describe("REQ-KEYSTATIC-002 — siteConfig singleton", () => {
  it("is defined and has a label", () => {
    expect(siteConfig).toBeDefined();
    expect(siteConfig.label).toBe("Site Config");
  });

  it("uses the correct content path", () => {
    expect(siteConfig.path).toBe(
      "content/singletons/site-config/site-config",
    );
  });

  const requiredTextFields = [
    "siteName",
    "logoPath",
    "logoAlt",
    "contactEmail",
    "contactPhone",
    "emailFromName",
  ];

  it.each(requiredTextFields)(
    "schema contains required text field: %s",
    (field) => {
      expect(siteConfig.schema).toHaveProperty(field);
    },
  );

  const optionalTextFields = ["contactAddress"];

  it.each(optionalTextFields)(
    "schema contains optional text field: %s",
    (field) => {
      expect(siteConfig.schema).toHaveProperty(field);
    },
  );

  const urlFields = [
    "registrationUrl",
    "donationUrl",
    "facebookUrl",
    "instagramUrl",
    "youtubeUrl",
    "spotifyUrl",
    "mapsUrl",
  ];

  it.each(urlFields)("schema contains url field: %s", (field) => {
    expect(siteConfig.schema).toHaveProperty(field);
  });

  it("is included in the singletons export", () => {
    expect(singletons).toHaveProperty("siteConfig");
    expect(singletons.siteConfig).toBe(siteConfig);
  });
});
