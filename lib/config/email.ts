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
 * Email Configuration
 *
 * Central source of truth for contact email addresses.
 * Environment variables can override these defaults.
 */

export const EMAIL = {
  /** General contact email */
  contact: process.env.CONTACT_EMAIL ?? "info@otyokwah.org",

  /** Camp registrar email */
  registrar: process.env.REGISTRAR_EMAIL ?? "info@otyokwah.org",

  /** Default contact email (CMS defaults) */
  default: "info@otyokwah.org",

  /** Email sending domain (used for Resend from address) */
  domain: "otyokwah.org",
} as const;

/** Default contact email */
export const DEFAULT_CONTACT_EMAIL = "info@otyokwah.org";

/** Default registrar email */
export const DEFAULT_REGISTRAR_EMAIL = "info@otyokwah.org";
