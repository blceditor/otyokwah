/**
 * REQ-TRUST-001: TrustBar Markdoc Component
 * Full-width trust bar using child tag pattern for CMS editability
 */

import React from "react";
import {
  Calendar,
  Users,
  Cross,
  Mountain,
  Heart,
  Star,
  Shield,
  Award,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { sanitizeColorValue } from "@/lib/security/validate-color";

// Map icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  Calendar,
  Users,
  Cross,
  Mountain,
  Heart,
  Star,
  Shield,
  Award,
};

// Valid icon names for validation
const VALID_ICONS = Object.keys(iconMap);

// Background color mapping
const bgColorMap: Record<string, string> = {
  secondary: "bg-secondary",
  bark: "bg-bark",
  cream: "bg-cream",
  primary: "bg-primary",
};

export interface TrustBarMarkdocProps {
  backgroundColor?: string;
  children?: React.ReactNode; // For child tag pattern
}

export interface TrustBarItemProps {
  icon?: string;
  text?: string;
  iconSize?: string;
}

const ICON_SIZE_MAP: Record<string, string> = {
  sm: "w-4 h-4 md:w-5 md:h-5",
  md: "w-5 h-5 md:w-6 md:h-6",
  lg: "w-6 h-6 md:w-8 md:h-8",
};

/**
 * TrustBarItem - Individual trust signal item
 * Renders icon + text for a single trust indicator
 */
export function TrustBarItem({ icon = "Calendar", text = "", iconSize = "md" }: TrustBarItemProps) {
  // Validate and get icon
  const IconComponent = VALID_ICONS.includes(icon)
    ? iconMap[icon]
    : iconMap.Calendar;

  // Enforce max text length (30 characters per plan)
  const displayText = text.length > 30 ? text.slice(0, 30) + "..." : text;

  return (
    <li className="flex flex-col items-center justify-center gap-2 min-h-[48px]">
      <IconComponent
        className={ICON_SIZE_MAP[iconSize] || ICON_SIZE_MAP.md}
        aria-hidden="true"
      />
      <span className="text-sm md:text-base font-medium">{displayText}</span>
    </li>
  );
}
TrustBarItem.displayName = "TrustBarItem";

/**
 * TrustBarMarkdoc - Full-width trust bar section
 * Uses child tag pattern for CMS-editable items
 */
export function TrustBarMarkdoc({
  backgroundColor = "secondary",
  children,
}: TrustBarMarkdocProps) {
  // If no children, return null (graceful handling)
  const childCount = React.Children.count(children);
  if (childCount === 0) {
    return null;
  }

  // Sanitize and apply background color
  const sanitized = sanitizeColorValue(backgroundColor);
  let bgClass = "bg-secondary"; // default
  let bgStyle: React.CSSProperties | undefined;

  if (sanitized.type === "class" && bgColorMap[sanitized.value]) {
    bgClass = bgColorMap[sanitized.value];
  } else if (sanitized.type === "hex") {
    bgClass = "";
    bgStyle = { backgroundColor: sanitized.value };
  }

  return (
    <section
      id="trust-bar"
      role="complementary"
      aria-label="Trust signals"
      className={`${bgClass} py-4`}
      style={bgStyle}
    >
      <div className="container mx-auto px-4">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 text-cream text-center">
          {children}
        </ul>
      </div>
    </section>
  );
}
TrustBarMarkdoc.displayName = "TrustBarMarkdoc";
