/**
 * Textured Heading Component
 * REQ-TEXT-002: Textured Font Effect for Headings
 * REQ-F001: Tradesmith Typography Distress System
 *
 * Applies gradient text effect with distressed/grunge texture to headings.
 *
 * Usage:
 * - Default (.text-textured): Dark green #0C3F23 with white distress for LIGHT backgrounds
 * - Hero variant (.text-textured-hero): White/cream with distress for DARK backgrounds
 *
 * The distress effect is achieved using CSS mask-image with SVG fractal noise
 * to create a worn/stamp appearance on text edges.
 */

import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface TexturedHeadingProps {
  children?: React.ReactNode;
  level?: HeadingLevel;
  className?: string;
}

export const TexturedHeading = React.forwardRef<
  HTMLHeadingElement,
  TexturedHeadingProps
>(({ children, level = 2, className = '' }, ref) => {
  const combinedClassName = `text-textured ${className}`.trim();

  const props = {
    ref: ref as React.Ref<HTMLHeadingElement>,
    className: combinedClassName,
  };

  switch (level) {
    case 1:
      return <h1 {...props}>{children}</h1>;
    case 2:
      return <h2 {...props}>{children}</h2>;
    case 3:
      return <h3 {...props}>{children}</h3>;
    case 4:
      return <h4 {...props}>{children}</h4>;
    case 5:
      return <h5 {...props}>{children}</h5>;
    case 6:
      return <h6 {...props}>{children}</h6>;
    default:
      return <h2 {...props}>{children}</h2>;
  }
});

TexturedHeading.displayName = 'TexturedHeading';
