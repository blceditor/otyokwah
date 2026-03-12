/**
 * REQ-DESIGN-001: Modern Card-Based Layout System - SectionCard Component
 * REQ-UAT-017: Container Width/Height/Background Options
 * Story Points: 1.5 SP (part of 3 SP total for card system)
 *
 * Wrapper component for high-level page sections with centered max-width container,
 * consistent spacing, and responsive behavior.
 */

'use client';

import React from 'react';

// REQ-CMS-003: Container width type
// REQ-UAT-017: Added '25' and 'custom' width options
export type ContainerWidth = 'auto' | '25' | '50' | '60' | '75' | '100' | 'custom';

// REQ-UAT-017: Container height type
export type ContainerHeight = 'auto' | '200' | '400' | '600';

export interface SectionCardProps {
  children?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'flat' | 'full-width';
  background?: 'cream' | 'white' | 'dark';
  className?: string;
  'aria-label'?: string;
  // REQ-CMS-003: Width option
  // REQ-UAT-017: Enhanced with custom width support
  width?: ContainerWidth;
  customWidth?: string;
  // REQ-UAT-017: Height option
  height?: ContainerHeight;
  // REQ-UAT-017: Background color options (hex)
  backgroundColor?: string;
  // REQ-UAT-017: Background image
  backgroundImage?: string;
}

export function SectionCard({
  children,
  variant = 'default',
  background = 'cream',
  className = '',
  'aria-label': ariaLabel,
  width,
  customWidth,
  height,
  backgroundColor,
  backgroundImage,
}: SectionCardProps) {
  // Base classes for all variants
  const baseClasses = 'rounded-lg py-section-y transition-shadow';

  // Responsive padding: px-4 mobile, md:px-8 desktop
  const paddingClasses = 'px-4 md:px-8';

  // Variant-specific classes
  const variantClasses = {
    'default': 'max-w-7xl mx-auto shadow-md hover:shadow-lg',
    'elevated': 'max-w-7xl mx-auto shadow-lg hover:shadow-xl',
    'flat': 'max-w-7xl mx-auto',
    'full-width': 'w-full shadow-md hover:shadow-lg',
  };

  // Background color classes (only used if no custom backgroundColor)
  const backgroundClasses = {
    'cream': 'bg-cream',
    'white': 'bg-white',
    'dark': 'bg-bark text-cream',
  };

  const combinedClasses = [
    baseClasses,
    paddingClasses,
    variantClasses[variant],
    // Only apply background class if no custom background color or image
    !backgroundColor && !backgroundImage ? backgroundClasses[background] : '',
    // Add background cover classes if background image is set
    backgroundImage ? 'bg-cover bg-center bg-no-repeat' : '',
    className,
  ].filter(Boolean).join(' ');

  // REQ-CMS-003: Build inline styles for width
  // REQ-UAT-017: Enhanced with custom width, height, and background support
  const containerStyle: React.CSSProperties = {};

  // Handle width
  if (width === 'custom' && customWidth) {
    containerStyle.width = customWidth;
    containerStyle.marginLeft = 'auto';
    containerStyle.marginRight = 'auto';
  } else if (width && width !== 'auto') {
    containerStyle.width = `${width}%`;
    containerStyle.marginLeft = 'auto';
    containerStyle.marginRight = 'auto';
  }

  // Handle height
  if (height && height !== 'auto') {
    containerStyle.minHeight = `${height}px`;
  }

  // Handle background color
  if (backgroundColor && backgroundColor !== 'custom') {
    containerStyle.backgroundColor = backgroundColor;
  }

  // Handle background image
  if (backgroundImage) {
    containerStyle.backgroundImage = `url(${backgroundImage})`;
  }

  return (
    <section
      className={combinedClasses}
      aria-label={ariaLabel}
      style={containerStyle}
      data-width={width}
      data-height={height}
      data-background={backgroundColor ? 'custom' : background}
    >
      {children}
    </section>
  );
}

export default SectionCard;
