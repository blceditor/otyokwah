/**
 * REQ-GRID-001: Shared Grid Utility
 *
 * Centralized grid column classes to reduce duplication across
 * FeatureGrid and CardGrid components.
 */

export type GridColumns = 2 | 3 | 4;
export type GridGap = 'sm' | 'md' | 'lg';

/**
 * Generate responsive grid CSS classes
 *
 * @param columns - Number of columns on desktop (2, 3, or 4)
 * @param gap - Gap size between grid items
 * @returns Tailwind grid classes string
 *
 * @example
 * getGridClasses(3, 'md')
 * // Returns: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
 */
export function getGridClasses(
  columns: GridColumns = 3,
  gap: GridGap = 'md'
): string {
  const gaps: Record<GridGap, string> = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const cols: Record<GridColumns, string> = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-3 lg:grid-cols-4',
  };

  return `grid grid-cols-1 sm:grid-cols-2 ${cols[columns]} ${gaps[gap]}`;
}
