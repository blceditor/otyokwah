/**
 * DonateButton Component
 * REQ-CMS-004: Icon Size Settings
 *
 * Large, prominent button for donation/giving links
 * Uses site design system colors (secondary green, cream)
 * Supports primary and secondary variants with icons
 */

import React from "react";
import { getIconByName } from "@/lib/icons";

// REQ-CMS-004: Icon size type and class mapping
export type IconSize = "sm" | "md" | "lg" | "xl";

const ICON_SIZE_CLASSES: Record<IconSize, string> = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
  xl: "w-12 h-12",
};

export interface DonateButtonProps {
  label: string;
  href: string;
  icon?: string;
  iconSize?: IconSize;
  variant?: "primary" | "secondary";
  external?: boolean;
}

/**
 * DonateButton - Call-to-action button for donations
 * @param label - Button text
 * @param href - Donation link URL
 * @param icon - Optional Lucide icon name (e.g., "Heart", "Calendar")
 * @param iconSize - Icon size: sm (16px), md (24px), lg (32px), xl (48px)
 * @param variant - Visual style: "primary" (forest green) or "secondary" (cream with border)
 * @param external - Whether link opens in new tab (default: true)
 */
export function DonateButton({
  label,
  href,
  icon,
  iconSize = "md",
  variant = "primary",
  external = true,
}: DonateButtonProps): JSX.Element {
  // Get icon component from curated icon map
  const IconComponent = icon ? getIconByName(icon) : null;
  const sizeClass = ICON_SIZE_CLASSES[iconSize];

  const isPrimary = variant === "primary";

  // Use site design system colors: secondary (forest green) and cream
  const buttonClasses = isPrimary
    ? "bg-secondary hover:bg-secondary-dark text-cream shadow-lg hover:shadow-xl"
    : "bg-cream hover:bg-sand text-secondary border-2 border-secondary shadow-md hover:shadow-lg";

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <a
      href={href}
      {...linkProps}
      className={`
        inline-flex items-center justify-center gap-3
        flex-nowrap whitespace-nowrap
        min-h-[44px] min-w-[44px]
        px-8 py-4 rounded-lg font-bold text-lg
        transition-all duration-200 hover:scale-105
        ${buttonClasses}
      `}
    >
      {IconComponent && (
        <IconComponent
          className={`${sizeClass} flex-shrink-0`}
          data-icon-size={iconSize}
        />
      )}
      {label}
    </a>
  );
}
