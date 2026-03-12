/**
 * CardGrid Component
 *
 * Responsive grid container for ContentCard components
 * Automatically lays out cards in a responsive grid (1-4 columns)
 * REQ-CMS-003: Added width, height, backgroundColor options
 */

import React from "react";
import {
  getGridClasses,
  type GridColumns,
} from "@/lib/design-system/grid-classes";

export interface CardGridProps {
  children: React.ReactNode;
  cols?: "2" | "3" | "4";
  width?: "auto" | "50" | "60" | "75" | "100";
  height?: "auto" | "200" | "400" | "600";
  backgroundColor?: string;
}

// REQ-CMS-003: Validate hex color format
function isValidHex(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

/**
 * CardGrid - Responsive grid layout for cards
 * @param cols - Number of columns on desktop (defaults to auto-detect based on children count)
 * @param width - Container width (auto, 50%, 75%, 100%)
 * @param height - Container height (auto, 200px, 400px, 600px)
 * @param backgroundColor - Background color (hex code)
 */
export function CardGrid({
  children,
  cols,
  width,
  height,
  backgroundColor,
}: CardGridProps): JSX.Element {
  // Count children to auto-detect grid columns if not specified
  const childCount = React.Children.count(children);

  // Determine grid columns - convert string to number for utility
  const colsNum = cols
    ? (parseInt(cols, 10) as GridColumns)
    : childCount >= 4
      ? 4
      : childCount === 3
        ? 3
        : 2;

  // REQ-CMS-003: Build inline styles for width/height/background
  const containerStyle: React.CSSProperties = {};

  if (width && width !== "auto") {
    containerStyle.width = `${width}%`;
    containerStyle.marginLeft = "auto";
    containerStyle.marginRight = "auto";
  }

  if (height && height !== "auto") {
    containerStyle.minHeight = `${height}px`;
  }

  if (isValidHex(backgroundColor)) {
    containerStyle.backgroundColor = backgroundColor;
  }

  return (
    <div
      className={`${getGridClasses(colsNum, "md")} my-8 mx-4 md:mx-8 lg:mx-12`}
      style={containerStyle}
      data-width={width}
      data-height={height}
      data-background-color={backgroundColor}
    >
      {children}
    </div>
  );
}
