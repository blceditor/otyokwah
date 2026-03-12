/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Generated from: config/repository.yaml
 * Generator: scripts/generate-config.ts
 *
 * To update values:
 * 1. Edit config/repository.yaml
 * 2. Run: npm run generate:config
 */

/**
 * Site/Domain Configuration
 *
 * Central source of truth for all domain-related constants.
 * Environment variables can override these defaults.
 */

export const SITE = {
  /** Production domain (without protocol) */
  productionDomain:
    process.env.PRODUCTION_DOMAIN ?? "www.bearlakecamp.com",

  /** Production URL (with protocol) */
  get productionUrl(): string {
    return (
      process.env.PRODUCTION_URL ??
      process.env.E2E_BASE_URL ??
      `https://${this.productionDomain}`
    );
  },

  /** Keystatic CMS URL */
  get keystaticUrl(): string {
    return `${this.productionUrl}/keystatic`;
  },
} as const;

/** Default production domain (for fallbacks) */
export const DEFAULT_PRODUCTION_DOMAIN = "www.bearlakecamp.com";

/** Default production URL (for fallbacks) */
export const DEFAULT_PRODUCTION_URL = "https://www.bearlakecamp.com";

/** Default Keystatic URL */
export const DEFAULT_KEYSTATIC_URL = "https://www.bearlakecamp.com/keystatic";
