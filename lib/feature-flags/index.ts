/**
 * Feature Flag System
 *
 * All flags MUST have:
 * - startDate: when the flag becomes active (ISO 8601)
 * - expirationDate: when the flag expires and falls back to evergreen (ISO 8601)
 * - evergreen: the fallback value that is ALWAYS safe (used when flag is expired or outside date range)
 * - active: the value used when the flag is within its active date range
 *
 * Expired flags produce lint errors until removed by a human.
 */

export interface FeatureFlag<T> {
  name: string;
  description: string;
  startDate: string;
  expirationDate: string;
  evergreen: T;
  active: T;
}

function isActive(flag: FeatureFlag<unknown>): boolean {
  const now = new Date();
  const start = new Date(flag.startDate);
  const end = new Date(flag.expirationDate);
  return now >= start && now < end;
}

export function resolve<T>(flag: FeatureFlag<T>): T {
  return isActive(flag) ? flag.active : flag.evergreen;
}

export function isExpired(flag: FeatureFlag<unknown>): boolean {
  return new Date() >= new Date(flag.expirationDate);
}

export function daysUntilExpiration(flag: FeatureFlag<unknown>): number {
  const diff = new Date(flag.expirationDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
