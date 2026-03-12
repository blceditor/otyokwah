/**
 * REQ-MISSION-001: MissionSection Markdoc Component
 * Full-width mission section with background image and parallax support
 */

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { sanitizeColorValue } from "@/lib/security/validate-color";
import { isSafeImageUrl } from "@/lib/security/validate-url";

export interface MissionSectionProps {
  line1Text?: string;
  line1Font?: string;
  line1Size?: string;
  line1Color?: string;
  line2Text?: string;
  line2Font?: string;
  line2Size?: string;
  line2Color?: string;
  line2Bold?: boolean;
  line3Text?: string;
  line3Font?: string;
  line3Size?: string;
  line3Color?: string;
  backgroundImage?: string;
  overlayOpacity?: string;
  enableParallax?: boolean;
}

// Font family mapping
const fontFamilyMap: Record<string, string> = {
  handwritten: "font-handwritten",
  heading: "font-heading",
  body: "font-body",
};

// Font size mapping
const fontSizeMap: Record<string, string> = {
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
};

// Color mapping
const colorMap: Record<string, string> = {
  cream: "text-cream",
  "cream/90": "text-cream/90",
  "accent-light": "text-accent-light",
  white: "text-white",
  bark: "text-bark",
};

// Overlay opacity mapping
const overlayOpacityMap: Record<string, string> = {
  "20": "bg-black/20",
  "40": "bg-black/40",
  "60": "bg-black/60",
};

/**
 * MissionSection - Full-width mission section with background image
 * Supports parallax effect on desktop (respects prefers-reduced-motion)
 */
export function MissionSection({
  line1Text,
  line1Font = "body",
  line1Size = "lg",
  line1Color = "cream",
  line2Text,
  line2Font = "body",
  line2Size = "lg",
  line2Color = "cream",
  line2Bold = false,
  line3Text,
  line3Font = "body",
  line3Size = "lg",
  line3Color = "cream",
  backgroundImage,
  overlayOpacity = "40",
  enableParallax = false,
}: MissionSectionProps) {
  const [isParallaxActive, setIsParallaxActive] = useState(false);

  useEffect(() => {
    if (!enableParallax) {
      setIsParallaxActive(false);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Check viewport width (parallax only on desktop >= 1024px)
    const isDesktop = window.innerWidth >= 1024;

    // Enable parallax only if: desktop viewport AND no reduced motion preference
    setIsParallaxActive(isDesktop && !prefersReducedMotion);

    // Listen for viewport changes
    const handleResize = () => {
      const isDesktopNow = window.innerWidth >= 1024;
      const prefersReducedMotionNow = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      setIsParallaxActive(isDesktopNow && !prefersReducedMotionNow);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [enableParallax]);

  // Validate background image URL
  const safeBackgroundImage =
    backgroundImage && isSafeImageUrl(backgroundImage)
      ? backgroundImage
      : undefined;

  // Get text classes for each line
  const getTextClasses = (
    font: string,
    size: string,
    color: string,
    bold?: boolean,
  ) => {
    const sanitizedColor = sanitizeColorValue(color);
    const fontClass = fontFamilyMap[font] || "font-body";
    const sizeClass = fontSizeMap[size] || "text-lg";
    const colorClass =
      sanitizedColor.type === "class" && colorMap[sanitizedColor.value]
        ? colorMap[sanitizedColor.value]
        : "text-cream";
    const boldClass = bold ? "font-bold tracking-tight" : "";

    return `${fontClass} ${sizeClass} ${colorClass} ${boldClass}`.trim();
  };

  // Get overlay class
  const overlayClass = overlayOpacityMap[overlayOpacity] || "bg-black/40";

  // Determine if we have a background image
  const hasBackgroundImage = !!safeBackgroundImage;

  return (
    <section
      id="mission"
      aria-labelledby={line2Text ? "mission-heading" : undefined}
      className={`relative py-section-y md:py-section-y-md overflow-hidden ${
        !hasBackgroundImage ? "bg-bark" : ""
      }`}
      data-parallax={isParallaxActive.toString()}
      style={
        hasBackgroundImage
          ? {
              backgroundImage: `url("${safeBackgroundImage}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Background Image with Overlay */}
      {hasBackgroundImage && (
        <div
          className="absolute inset-0 z-0"
          style={isParallaxActive ? { backgroundAttachment: "fixed" } : undefined}
        >
          <Image
            src={safeBackgroundImage}
            alt="Mission section background"
            fill
            sizes="100vw"
            className="object-cover"
            quality={75}
            priority
            data-testid="faith-section-image"
          />
          {/* Dark overlay for text readability */}
          <div className={`absolute inset-0 ${overlayClass}`} />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Line 1 */}
          {line1Text && (
            <p className={`${getTextClasses(line1Font, line1Size, line1Color)} mb-4`}>
              {line1Text}
            </p>
          )}

          {/* Line 2 (Heading) */}
          {line2Text && (
            <h2
              id="mission-heading"
              className={`${getTextClasses(line2Font, line2Size, line2Color, line2Bold)} mb-6`}
            >
              {line2Text}
            </h2>
          )}

          {/* Line 3 */}
          {line3Text && (
            <p
              className={`${getTextClasses(line3Font, line3Size, line3Color)} leading-relaxed max-w-3xl mx-auto`}
            >
              {line3Text}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
MissionSection.displayName = "MissionSection";
