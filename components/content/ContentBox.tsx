/**
 * REQ-527: Content Box wrapper for Markdoc
 * REQ-CMS-003: Added width, height, customBackgroundColor options
 * Creates an inset box with background styling
 */

import React from "react";

interface ContentBoxProps {
  style?: "white" | "light" | "colored" | "bordered";
  padding?: "sm" | "md" | "lg";
  children: React.ReactNode;
  width?: "auto" | "50" | "75" | "100";
  height?: "auto" | "200" | "400" | "600";
  customBackgroundColor?: string;
}

const styleMap: Record<string, string> = {
  white: "bg-white shadow-md",
  light: "bg-cream",
  colored: "bg-primary/5",
  bordered: "bg-white border-2 border-stone/20",
};

const paddingMap: Record<string, string> = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

// REQ-CMS-003: Validate hex color format
function isValidHex(color: string | undefined): boolean {
  if (!color) return false;
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

export function ContentBox({
  style = "white",
  padding = "md",
  children,
  width,
  height,
  customBackgroundColor,
}: ContentBoxProps) {
  const styleClass = styleMap[style] || styleMap.white;
  const paddingClass = paddingMap[padding] || paddingMap.md;

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

  // Custom hex background overrides the preset style
  if (isValidHex(customBackgroundColor)) {
    containerStyle.backgroundColor = customBackgroundColor;
  }

  // Only apply styleClass bg if no custom hex color is set
  const finalStyleClass = isValidHex(customBackgroundColor)
    ? "shadow-md"
    : styleClass;

  return (
    <div
      className={`rounded-lg my-6 ${finalStyleClass} ${paddingClass}`}
      style={containerStyle}
      data-testid="content-box"
      data-width={width}
      data-height={height}
      data-custom-background-color={customBackgroundColor}
    >
      {children}
    </div>
  );
}

export default ContentBox;
