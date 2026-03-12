/**
 * REQ-DESIGN-001: Modern Card-Based Layout System - ContentCard Component
 * REQ-CMS-003: Added width, height, backgroundColor options
 * REQ-CMS-004: Icon Size Settings
 * Story Points: 1.5 SP (part of 3 SP total for card system)
 *
 * Nested content card with Lucide icons, title, and children content.
 * Designed for grid layouts with responsive behavior.
 */

"use client";

import React from "react";
import { getIconByName } from "@/lib/icons";

// REQ-CMS-004: Icon size type and class mapping
export type IconSize = "sm" | "md" | "lg" | "xl";

const ICON_SIZE_CLASSES: Record<IconSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

// REQ-CMS-003: Validate hex color format
function isValidHex(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

export interface ContentCardProps {
  title?: string;
  icon?: string;
  iconSize?: IconSize;
  children?: React.ReactNode;
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  width?: "auto" | "50" | "75" | "100";
  height?: "auto" | "200" | "400" | "600";
  backgroundColor?: string;
}

export function ContentCard({
  title,
  icon,
  iconSize = "md",
  children,
  headingLevel = 3,
  className = "",
  width,
  height,
  backgroundColor,
}: ContentCardProps) {
  // REQ-CMS-004: Get Lucide icon component with configurable size
  const renderIcon = (iconName: string) => {
    const Icon = getIconByName(iconName);
    const sizeClass = ICON_SIZE_CLASSES[iconSize];
    return Icon ? (
      <Icon
        className={`${sizeClass} text-secondary`}
        data-testid={`icon-${iconName}`}
        data-icon-size={iconSize}
        aria-hidden="true"
      />
    ) : null;
  };

  // Create heading element based on level
  const HeadingTag = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  // Base classes: card styling with compact padding, borders, and shadows
  const baseClasses =
    "rounded-xl border-2 border-secondary/20 p-6 shadow-md hover:shadow-lg hover:scale-[1.02] hover:border-secondary/40 transition-all duration-300";

  // REQ-CMS-003: Only add bg-cream if no custom background color
  const bgClass = isValidHex(backgroundColor) ? "" : "bg-cream";

  const combinedClasses = [baseClasses, bgClass, className]
    .filter(Boolean)
    .join(" ");

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
    <article
      className={combinedClasses}
      style={containerStyle}
      data-width={width}
      data-height={height}
      data-background-color={backgroundColor}
    >
      {(icon || title) && (
        <div className="flex flex-col items-center text-center mb-1">
          {icon && <div className="mb-1">{renderIcon(icon)}</div>}
          {title && (
            <HeadingTag className="text-lg font-semibold text-bark leading-tight">
              {title}
            </HeadingTag>
          )}
        </div>
      )}
      {children && (
        <div className="text-sm text-bark/80 leading-tight [&_p]:mb-1 [&_p:last-child]:mb-0 [&_p:has(a:only-child)]:text-center [&_p:has(a:only-child)]:mt-3 [&_a]:inline-block [&_p:has(a:only-child)>a]:bg-secondary [&_p:has(a:only-child)>a]:hover:bg-secondary-light [&_p:has(a:only-child)>a]:text-white [&_p:has(a:only-child)>a]:font-semibold [&_p:has(a:only-child)>a]:px-4 [&_p:has(a:only-child)>a]:py-2 [&_p:has(a:only-child)>a]:rounded-lg [&_p:has(a:only-child)>a]:transition-colors [&_p:has(a:only-child)>a]:no-underline">
          {children}
        </div>
      )}
    </article>
  );
}

export default ContentCard;
