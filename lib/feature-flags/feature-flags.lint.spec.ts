/**
 * Feature Flag Lint Enforcement
 *
 * These tests enforce the feature flag contract:
 * 1. Every flag MUST have startDate and expirationDate (ISO 8601)
 * 2. expirationDate MUST be after startDate
 * 3. Expired flags FAIL THE BUILD until a human removes them
 * 4. Every flag MUST have an evergreen fallback
 *
 * When a flag expires, this test fails. The fix is:
 * 1. Remove the flag from flags.ts
 * 2. Remove all usages of the flag in source code
 * 3. The evergreen behavior is already the default (no code change needed)
 */

import { describe, it, expect } from "vitest";
import { ALL_FLAGS } from "./flags";
import { isExpired, daysUntilExpiration } from "./index";

describe("Feature Flag Lint Enforcement", () => {
  it("all flags have required fields", () => {
    for (const flag of ALL_FLAGS) {
      expect(flag.name, `${flag.name}: missing name`).toBeTruthy();
      expect(flag.description, `${flag.name}: missing description`).toBeTruthy();
      expect(flag.startDate, `${flag.name}: missing startDate`).toBeTruthy();
      expect(
        flag.expirationDate,
        `${flag.name}: missing expirationDate`,
      ).toBeTruthy();
      expect(
        flag.evergreen,
        `${flag.name}: missing evergreen fallback`,
      ).toBeDefined();
      expect(flag.active, `${flag.name}: missing active value`).toBeDefined();
    }
  });

  it("all flags have valid ISO 8601 dates", () => {
    for (const flag of ALL_FLAGS) {
      const start = new Date(flag.startDate);
      const end = new Date(flag.expirationDate);
      expect(
        isNaN(start.getTime()),
        `${flag.name}: invalid startDate "${flag.startDate}"`,
      ).toBe(false);
      expect(
        isNaN(end.getTime()),
        `${flag.name}: invalid expirationDate "${flag.expirationDate}"`,
      ).toBe(false);
    }
  });

  it("expirationDate is after startDate for all flags", () => {
    for (const flag of ALL_FLAGS) {
      const start = new Date(flag.startDate).getTime();
      const end = new Date(flag.expirationDate).getTime();
      expect(end, `${flag.name}: expirationDate must be after startDate`).toBeGreaterThan(start);
    }
  });

  it("NO expired flags exist — remove expired flags before committing", () => {
    const expired = ALL_FLAGS.filter(isExpired);
    if (expired.length > 0) {
      const details = expired
        .map(
          (f) =>
            `  - ${f.name}: expired ${f.expirationDate} (${Math.abs(daysUntilExpiration(f))} days ago)`,
        )
        .join("\n");
      expect.fail(
        `${expired.length} expired feature flag(s) found. Remove them from flags.ts and clean up usages:\n${details}`,
      );
    }
  });

  it("flags expiring within 7 days emit a warning", () => {
    const soon = ALL_FLAGS.filter(
      (f) => !isExpired(f) && daysUntilExpiration(f) <= 7,
    );
    if (soon.length > 0) {
      const details = soon
        .map((f) => `  - ${f.name}: expires in ${daysUntilExpiration(f)} days (${f.expirationDate})`)
        .join("\n");
      console.warn(
        `⚠️ Feature flags expiring soon:\n${details}`,
      );
    }
  });
});
