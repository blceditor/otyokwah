const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_ABBR = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDateRange(
  begin: string,
  end: string,
  opts?: { abbrev?: boolean; includeYear?: boolean },
): string {
  const b = new Date(begin);
  const e = new Date(end);
  if (isNaN(b.getTime()) || isNaN(e.getTime())) return `${begin} – ${end}`;
  const months = opts?.abbrev ? MONTHS_ABBR : MONTHS_FULL;
  const includeYear = opts?.includeYear !== false;
  const yearSuffix = includeYear ? `, ${b.getFullYear()}` : "";
  if (b.getMonth() === e.getMonth()) {
    return `${months[b.getMonth()]} ${b.getDate()}-${e.getDate()}${yearSuffix}`;
  }
  return `${months[b.getMonth()]} ${b.getDate()} - ${months[e.getMonth()]} ${e.getDate()}${yearSuffix}`;
}

export const CAPACITY_THRESHOLDS = { CRITICAL: 85, WARNING: 65 } as const;

export type CapacityTier = "critical" | "warning" | "available";

export function getCapacityTier(pct: number): CapacityTier {
  if (pct >= CAPACITY_THRESHOLDS.CRITICAL) return "critical";
  if (pct >= CAPACITY_THRESHOLDS.WARNING) return "warning";
  return "available";
}

export function getCapacityPct(enrolled: number, max: number): number {
  return max > 0 ? Math.round((enrolled / max) * 100) : 0;
}
