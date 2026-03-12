/**
 * SquareGrid Component
 * REQ-GRID-002: Full-width alternating sections for camp sessions
 * REQ-CMS-003: Added width, height, backgroundColor options
 *
 * Renders full-width sections with:
 * - 50/50 split (image on one side, colored content on other)
 * - Alternating left/right layout for each pair
 * - Full-bleed design for camp sessions layout
 */

import React from "react";

export interface SquareGridProps {
  children: React.ReactNode;
  columns?: "2" | "3" | "4";
  gap?: "none" | "sm" | "md" | "lg";
  width?: "auto" | "50" | "75" | "100";
  height?: "auto" | "200" | "400" | "600";
  backgroundColor?: string;
}

// REQ-CMS-003: Validate hex color format
function isValidHex(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

export function SquareGrid({
  children,
  columns: _columns = "2",
  gap: _gap = "none",
  width,
  height,
  backgroundColor,
}: SquareGridProps) {
  // Note: columns and gap are kept for API compatibility but not used in full-width layout
  void _columns;
  void _gap;
  // Convert children to array for processing
  const childArray = React.Children.toArray(children);

  // Group children into pairs (image + content)
  const pairs: React.ReactNode[][] = [];
  for (let i = 0; i < childArray.length; i += 2) {
    pairs.push([childArray[i], childArray[i + 1]].filter(Boolean));
  }

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
      className="w-full"
      style={containerStyle}
      data-width={width}
      data-height={height}
      data-background-color={backgroundColor}
    >
      {pairs.map((pair, index) => {
        // REQ-U03-001: Alternate layout using flex-row-reverse for odd rows
        // Even rows: Image LEFT, Content RIGHT (normal flex-row)
        // Odd rows: Content LEFT, Image RIGHT (flex-row-reverse)
        const isOddRow = index % 2 === 1;

        return (
          <section
            key={index}
            className={`flex flex-col min-h-[600px] ${isOddRow ? "lg:flex-row-reverse" : "lg:flex-row"}`}
            role="region"
            aria-label={`Content section ${index + 1}`}
          >
            <div className="w-full lg:w-1/2">{pair[0]}</div>
            <div className="w-full lg:w-1/2">{pair[1]}</div>
          </section>
        );
      })}
    </div>
  );
}

export default SquareGrid;
