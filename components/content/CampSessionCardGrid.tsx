/**
 * REQ-COMP-001: Camp Session Card Grid Component
 * Story Points: 2 SP
 *
 * Wrapper component for displaying camp session cards in a responsive grid.
 * Uses CSS Grid for equal-height cards across all breakpoints.
 */

import React from "react";

export interface CampSessionCardGridProps {
  children: React.ReactNode;
  /** Number of columns on desktop (2, 3, or 4) */
  columns?: "2" | "3" | "4";
  /** Gap between cards */
  gap?: "sm" | "md" | "lg";
}

/**
 * CampSessionCardGrid - Responsive grid container for session cards
 *
 * Automatically handles responsive behavior:
 * - Mobile (< 640px): 1 column
 * - Tablet (640px - 1024px): 2 columns
 * - Desktop (> 1024px): configurable (2, 3, or 4 columns)
 *
 * @param children - SessionCard or InlineSessionCard components
 * @param columns - Number of columns on desktop (defaults to "4")
 * @param gap - Gap size between cards (defaults to "md")
 */
export function CampSessionCardGrid({
  children,
  columns = "4",
  gap = "md",
}: CampSessionCardGridProps): JSX.Element {
  // Gap size classes
  const gapClasses: Record<string, string> = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  // Responsive column classes
  const columnClasses: Record<string, string> = {
    "2": "grid-cols-1 sm:grid-cols-2",
    "3": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    "4": "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      data-component="camp-session-card-grid"
      className={`grid ${columnClasses[columns]} ${gapClasses[gap]} my-8`}
    >
      {children}
    </div>
  );
}

export default CampSessionCardGrid;
