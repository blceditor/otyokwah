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
  repo: "otyokwah",
  full: "blceditor/otyokwah",
  appSlug: "otyokwah-keystatic",
  url: "https://github.com/blceditor/otyokwah",
} as const;

/** Current site configuration for tests */
export const TEST_SITE = {
  productionDomain: "otyokwah.vercel.app",
  productionUrl: "https://otyokwah.vercel.app",
  keystaticUrl: "https://otyokwah.vercel.app/keystatic",
} as const;

/** Current email configuration for tests */
export const TEST_EMAIL = {
  contact: "info@otyokwah.org",
  registrar: "info@otyokwah.org",
  default: "info@otyokwah.org",
} as const;

/** Current analytics configuration for tests */
export const TEST_ANALYTICS = {
  ga4MeasurementId: "",
} as const;

/** Current branding colors for tests */
export const TEST_BRANDING_COLORS = {
  primary: "#2D5A27",
  secondary: "#333333",
  accent: "#C4A84B",
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
  GITHUB_REPO: "blceditor/otyokwah",
  PRODUCTION_URL: "https://otyokwah.vercel.app",
  PRODUCTION_DOMAIN: "otyokwah.vercel.app",
  E2E_BASE_URL: "https://otyokwah.vercel.app",
  NEXT_PUBLIC_GA_ID: "",
} as const;
