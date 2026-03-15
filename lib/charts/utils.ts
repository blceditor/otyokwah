/**
 * Shared chart utility helpers.
 * Used by AnalyticsDashboard, PerformanceDashboard, and AdminContactPage.
 */

/**
 * Round a raw maximum value up to the nearest "nice" number for chart Y-axis labels.
 * Returns a round value (e.g. 10, 20, 40, 60, 80, 100) that is at least as large as
 * `maxValue` and visually clean for axis ticks.
 */
export function niceAxisMax(maxValue: number): number {
  if (maxValue <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
  const normalized = maxValue / magnitude;
  const nice =
    normalized <= 1.5
      ? 2
      : normalized <= 3
        ? 4
        : normalized <= 5
          ? 6
          : normalized <= 7
            ? 8
            : 10;
  return nice * magnitude;
}
