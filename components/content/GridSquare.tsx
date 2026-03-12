/**
 * GridSquare Component
 * REQ-GRID-001: Full-bleed grid square for camp sessions layout
 * REQ-CMS-003: Added width, height options
 *
 * A full-height panel that displays either:
 * - Full-bleed image (contentType="image"), OR
 * - Colored background with nested content (contentType="color")
 *
 * Designed to work with SquareGrid for 50/50 split alternating sections.
 */

import React from "react";
import Image from "next/image";
import { DESIGN_TOKEN_HEX } from "@/lib/keystatic/constants";

// REQ-CMS-003: Container dimension types
type ContainerWidth = "auto" | "50" | "75" | "100";
type ContainerHeight = "auto" | "200" | "400" | "600";

export interface GridSquareImageProps {
  contentType: "image";
  image: string;
  imageAlt: string;
  aspectRatio?: "square" | "portrait" | "landscape";
  id?: string;
  width?: ContainerWidth;
  height?: ContainerHeight;
  backgroundColor?: never;
  textColor?: never;
  children?: never;
}

export interface GridSquareColorProps {
  contentType: "color";
  backgroundColor: string;
  textColor?: "dark" | "light";
  aspectRatio?: "square" | "portrait" | "landscape";
  id?: string;
  width?: ContainerWidth;
  height?: ContainerHeight;
  children?: React.ReactNode;
  image?: never;
  imageAlt?: never;
}

export type GridSquareProps = GridSquareImageProps | GridSquareColorProps;

// Validate hex color format
function isValidHex(color: string): boolean {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(color);
}

// REQ-CMS-003: Build container styles based on width/height props
function buildContainerStyle(
  width?: ContainerWidth,
  height?: ContainerHeight,
): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (width && width !== "auto") {
    style.width = `${width}%`;
    style.marginLeft = "auto";
    style.marginRight = "auto";
  }

  if (height && height !== "auto") {
    style.minHeight = `${height}px`;
  }

  return style;
}

export function GridSquare(props: GridSquareProps) {
  const { contentType, width, height } = props;

  // REQ-CMS-003: Build container styles
  const containerStyle = buildContainerStyle(width, height);

  if (contentType === "image") {
    const { image, imageAlt, id } = props as GridSquareImageProps;

    // Full-bleed image that fills the entire half of the section
    // REQ-U03-FIX-012: Add !m-0 to override prose plugin's default image margins
    return (
      <div
        id={id}
        className="relative min-h-[400px] lg:min-h-full h-full scroll-mt-4"
        style={containerStyle}
        data-width={width}
        data-height={height}
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          className="object-cover !m-0"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
      </div>
    );
  }

  // Color variant - full-height colored panel with content
  const {
    backgroundColor,
    textColor = "dark",
    children,
    id,
  } = props as GridSquareColorProps;

  // Validate and fallback to cream for invalid hex
  const bgColor = isValidHex(backgroundColor) ? backgroundColor : DESIGN_TOKEN_HEX.cream;

  // Text color classes
  const textColorClass = textColor === "light" ? "text-white" : "text-bark";

  // REQ-U03-001: Headers should be white, 3rem, line-height 1, left-aligned
  // REQ-U03-006: Content order - header, age group, cards, description, button
  return (
    <div
      id={id}
      className={`flex flex-col justify-center p-8 lg:p-12 min-h-[400px] lg:min-h-full h-full scroll-mt-4 ${textColorClass}`}
      style={{ backgroundColor: bgColor, ...containerStyle }}
      data-width={width}
      data-height={height}
      data-background-color={backgroundColor}
    >
      {/* REQ-PROC-001: Use explicit child selectors for higher CSS specificity over global .prose h2 rules */}
      {/* REQ-PROC-002: Force text-inherit on prose div itself to override prose plugin default colors */}
      {/* REQ-U03-FIX-003: Use :not() selector to exempt CTAButton links with explicit text-color classes */}
      <div className="prose prose-lg max-w-none !text-inherit [&_h2]:!text-inherit [&_h3]:!text-inherit [&_p]:!text-inherit [&_li]:!text-inherit [&_strong]:!text-inherit [&_a:not([class*='text-'])]:!text-inherit [&_h2]:!text-left [&_h2]:!text-[3rem] [&_h2]:!leading-none [&_h2]:!font-bold [&_h2]:!mb-2 [&_h2]:!mt-0 [&_h3]:!text-left [&_h3]:!text-2xl [&_p]:!text-lg [&_li]:!text-lg [&>p:first-of-type]:opacity-80 [&>p:first-of-type]:mb-4">
        {children}
      </div>
    </div>
  );
}

export default GridSquare;
