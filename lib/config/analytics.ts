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
 * Analytics Configuration
 *
 * Central source of truth for analytics identifiers.
 * Environment variables can override these defaults.
 */

export const ANALYTICS = {
  /** Google Analytics 4 measurement ID */
  ga4MeasurementId:
    process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

/** Default GA4 measurement ID */
export const DEFAULT_GA4_MEASUREMENT_ID = "";
