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
 * Central Configuration Index
 *
 * Re-exports all configuration modules for easy importing.
 *
 * Usage:
 *   import { GITHUB, SITE, EMAIL, ANALYTICS, BRANDING_COLORS } from '@/lib/config';
 */

export { GITHUB, DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO, DEFAULT_GITHUB_FULL, GITHUB_APP_SLUG } from './repository';
export { SITE, DEFAULT_PRODUCTION_DOMAIN, DEFAULT_PRODUCTION_URL, DEFAULT_KEYSTATIC_URL } from './site';
export { EMAIL, DEFAULT_CONTACT_EMAIL, DEFAULT_REGISTRAR_EMAIL } from './email';
export { ANALYTICS, DEFAULT_GA4_MEASUREMENT_ID } from './analytics';
export { BRANDING_COLORS } from './branding';
