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

/** Registry of all flags for lint enforcement */
export const ALL_FLAGS: FeatureFlag<unknown>[] = [];
