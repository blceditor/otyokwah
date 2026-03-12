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
 * Test Fixtures for Configuration
 *
 * Use these fixtures in tests to ensure consistency with actual config.
 * These values reflect the current config/repository.yaml settings.
 */

/** Current GitHub configuration for tests */
export const TEST_GITHUB = {
  owner: "blceditor",
  repo: "bearlakecamp",
  full: "blceditor/bearlakecamp",
  appSlug: "bearlakecamp-cms",
  url: "https://github.com/blceditor/bearlakecamp",
} as const;

/** Current site configuration for tests */
export const TEST_SITE = {
  productionDomain: "www.bearlakecamp.com",
  productionUrl: "https://www.bearlakecamp.com",
  keystaticUrl: "https://www.bearlakecamp.com/keystatic",
} as const;

/** Current email configuration for tests */
export const TEST_EMAIL = {
  contact: "info@bearlakecamp.org",
  registrar: "registrar@bearlakecamp.com",
  default: "ben@bearlakecamp.com",
} as const;

/** Current analytics configuration for tests */
export const TEST_ANALYTICS = {
  ga4MeasurementId: "G-QF89BLRP5F",
} as const;

/** Current branding colors for tests */
export const TEST_BRANDING_COLORS = {
  primary: "#4A7A9E",
  secondary: "#2F4F3D",
  accent: "#A07856",
  cream: "#F5F0E8",
  sand: "#D4C5A9",
  stone: "#8B7D6B",
  bark: "#3D2E1F",
} as const;

/**
 * Helper to stub environment variables for tests
 * Usage: vi.stubEnv('GITHUB_REPO', TEST_GITHUB.full)
 */
export const TEST_ENV_STUBS = {
  GITHUB_OWNER: "blceditor",
  GITHUB_REPO: "blceditor/bearlakecamp",
  PRODUCTION_URL: "https://www.bearlakecamp.com",
  PRODUCTION_DOMAIN: "www.bearlakecamp.com",
  E2E_BASE_URL: "https://www.bearlakecamp.com",
  NEXT_PUBLIC_GA_ID: "G-QF89BLRP5F",
} as const;
