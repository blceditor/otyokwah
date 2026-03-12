/**
 * REQ-UI-002: Convert Body Descriptions to Card Components
 * REQ-CMS-004: Icon Size Settings
 *
 * InfoCard component for displaying heading, description, and bullet list.
 * Can be used via Markdoc for CMS authoring.
 */

"use client";

import { getIconByName } from "@/lib/icons";

// REQ-CMS-004: Icon size type and class mapping
export type IconSize = "sm" | "md" | "lg" | "xl";

const ICON_SIZE_CLASSES: Record<IconSize, string> = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

interface InfoCardProps {
  icon?: string;
  iconSize?: IconSize;
  heading: string;
  description?: string;
  items: string[];
}

export function InfoCard({
  icon,
  iconSize = "lg",
  heading,
  description,
  items,
}: InfoCardProps) {
  // REQ-CMS-004: Get Lucide icon component with configurable size
  const renderIcon = (iconName: string) => {
    const Icon = getIconByName(iconName);
    const sizeClass = ICON_SIZE_CLASSES[iconSize];
    return Icon ? (
      <Icon
        className={`${sizeClass} text-secondary`}
        data-testid={`icon-${iconName}`}
        data-icon-size={iconSize}
      />
    ) : null;
  };

  return (
    <div className="bg-cream rounded-lg border-2 border-secondary/20 p-6 transition-all duration-300 hover:shadow-lg hover:border-secondary/40">
      {icon && <div className="mb-4">{renderIcon(icon)}</div>}
      <h3 className="text-xl font-semibold text-bark mb-3">{heading}</h3>
      {description && <p className="text-bark/80 mb-4">{description}</p>}
      <ul className="space-y-2" role="list">
        {items.map((item, index) => (
          <li key={index} className="flex items-start" role="listitem">
            <span className="text-secondary font-bold mr-2 mt-1">✓</span>
            <span className="text-bark">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InfoCard;
