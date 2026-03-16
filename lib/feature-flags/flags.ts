/**
 * Feature Flag Registry
 *
 * All feature flags are defined here. Each flag MUST have startDate,
 * expirationDate, evergreen, and active values.
 *
 * When a flag expires, the lint check in feature-flags.lint.spec.ts will
 * fail until a human removes the flag and its usages.
 */

import type { FeatureFlag } from "./index";

/**
 * CC_STAFF_EMAIL: Route contact form staff notifications to an
 * additional recipient for monitoring.
 *
 * Evergreen: only info@otyokwah.org receives staff notifications.
 * Active: empty (no CC recipients configured for Otyokwah yet).
 */
export const CC_STAFF_EMAIL: FeatureFlag<string[]> = {
  name: "CC_STAFF_EMAIL",
  description:
    "CC contact form staff notifications to additional recipients for monitoring",
  startDate: "2026-03-14",
  expirationDate: "2026-04-13",
  evergreen: [],
  active: [],
};

/** Registry of all flags for lint enforcement */
export const ALL_FLAGS: FeatureFlag<unknown>[] = [CC_STAFF_EMAIL];
