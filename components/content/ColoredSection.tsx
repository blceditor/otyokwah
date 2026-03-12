/**
 * REQ-501: Colored Section wrapper for Markdoc
 * REQ-CMS-003: Added width, height, customBackgroundColor options
 * Wraps content with a colored background
 */

import React from "react";

interface ColoredSectionProps {
  backgroundColor?: "white" | "cream" | "primary" | "secondary" | "accent" | "bark";
  centered?: boolean;
  children: React.ReactNode;
  width?: "auto" | "50" | "75" | "100";
  height?: "auto" | "200" | "400" | "600";
  customBackgroundColor?: string;
}

const bgColorMap: Record<string, string> = {
  white: "bg-white",
  cream: "bg-cream",
  primary: "bg-primary text-white",
  secondary: "bg-secondary text-white",
  accent: "bg-accent text-white",
  bark: "bg-bark text-white",
};

// REQ-CMS-003: Validate hex color format
function isValidHex(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

export function ColoredSection({
  backgroundColor = "white",
  centered = true,
  children,
  width,
  height,
  customBackgroundColor,
}: ColoredSectionProps) {
  // Don't render empty sections
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

  const bgClass = bgColorMap[backgroundColor] || bgColorMap.white;
  const centerClass = centered ? "text-center max-w-4xl mx-auto" : "";

  // REQ-CMS-003: Build inline styles for width/height/custom background
  const containerStyle: React.CSSProperties = {};

  if (width && width !== "auto") {
    containerStyle.width = `${width}%`;
    containerStyle.marginLeft = "auto";
    containerStyle.marginRight = "auto";
  }

  if (height && height !== "auto") {
    containerStyle.minHeight = `${height}px`;
  }

  // Custom hex background overrides the preset backgroundColor
  if (isValidHex(customBackgroundColor)) {
    containerStyle.backgroundColor = customBackgroundColor;
  }

  // Only apply bgClass if no custom hex color is set
  const finalBgClass = isValidHex(customBackgroundColor) ? "" : bgClass;

  return (
    <section
      className={`py-12 px-6 my-8 rounded-lg ${finalBgClass}`}
      style={containerStyle}
      data-testid="colored-section"
      data-width={width}
      data-height={height}
      data-custom-background-color={customBackgroundColor}
    >
      <div className={centerClass}>{children}</div>
    </section>
  );
}

export default ColoredSection;
