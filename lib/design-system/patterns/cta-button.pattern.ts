/**
 * CTA Button Pattern
 * REQ-PROC-005: Design pattern library
 *
 * Used for "Register Now" and other call-to-action buttons
 * in camp session sections.
 *
 * Design requirements:
 * - Two variants: default (white bg with colored text), inverse (colored bg with white text)
 * - Section-specific colors (sky, amber, emerald, purple)
 * - Consistent sizing and padding
 * - Hover effects (scale, shadow)
 */

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export type CTAVariant = 'primary' | 'secondary' | 'inverse' | 'outline';
export type CTASize = 'sm' | 'md' | 'lg';
export type SectionColor = 'primary' | 'accent' | 'secondary' | 'primary-dark' | 'bark';

export const CTAButtonPattern = {
  name: 'CTAButtonPattern',

  /**
   * Base Tailwind classes applied to all CTA buttons
   */
  baseClasses: 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2',

  /**
   * Variant-specific classes
   */
  variants: {
    /**
     * Primary variant - solid secondary color background
     * Used for main CTAs
     */
    primary: 'bg-secondary text-white hover:bg-secondary-light',

    /**
     * Secondary variant - outlined button
     * Used for less prominent actions
     */
    secondary: 'border-2 border-secondary text-secondary bg-transparent hover:bg-stone/10',

    /**
     * Inverse variant - white background with colored text
     * Used in colored sections to create contrast
     * Requires textColor prop to specify section color
     */
    inverse: 'bg-white hover:bg-cream shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-bold',

    /**
     * Outline variant - transparent with white border
     * Used on colored backgrounds where inverse creates too much contrast
     */
    outline: 'border-2 border-white text-white bg-transparent hover:bg-white/10',
  },

  /**
   * Size-specific classes
   */
  sizes: {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  },

  /**
   * Section color mapping for inverse variant
   * Maps camp session sections to their branded colors
   */
  sectionColors: {
    primary: {
      name: 'Primary Overnight',
      textClass: 'text-primary',
      hex: '#4A7A9E',
      description: 'Primary blue for youngest campers',
    },
    accent: {
      name: 'Junior Camp',
      textClass: 'text-accent',
      hex: '#A07856',
      description: 'Accent brown for elementary',
    },
    secondary: {
      name: 'Jr. High',
      textClass: 'text-secondary',
      hex: '#2F4F3D',
      description: 'Secondary green for middle school',
    },
    'primary-dark': {
      name: 'Sr. High',
      textClass: 'text-primary-dark',
      hex: '#2F5A7A',
      description: 'Dark blue for high school',
    },
    bark: {
      name: 'Default',
      textClass: 'text-bark',
      hex: '#5A4A3A',
      description: 'Bark brown default',
    },
  },

  /**
   * Validation rules for pattern compliance
   */
  validation: {
    /**
     * Required classes for all CTA buttons
     */
    requiredClasses: [
      'inline-flex',
      'items-center',
      'justify-center',
      'font-semibold',
      'rounded-lg',
    ],

    /**
     * Forbidden classes that indicate incorrect implementation
     */
    forbiddenClasses: [
      'block',            // Should use inline-flex
      'font-normal',      // Must be font-semibold or font-bold
      'rounded-none',     // Must have rounded-lg
    ],

    /**
     * Required computed styles (base)
     */
    requiredStyles: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',  // rounded-lg
    },
  },

  /**
   * Test helper for Playwright assertions
   *
   * @example
   * ```typescript
   * const button = page.locator('a[href*="ultracamp"]').first();
   * const result = await button.evaluate((el) => {
   *   const { testHelper } = CTAButtonPattern;
   *   return testHelper(el);
   * });
   * expect(result.isValid).toBe(true);
   * ```
   */
  testHelper: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check display
    if (styles.display !== 'inline-flex') {
      violations.push(`display: expected inline-flex, got ${styles.display}`);
    }

    // Check align-items
    if (styles.alignItems !== 'center') {
      violations.push(`alignItems: expected center, got ${styles.alignItems}`);
    }

    // Check justify-content
    if (styles.justifyContent !== 'center') {
      violations.push(`justifyContent: expected center, got ${styles.justifyContent}`);
    }

    // Check border-radius
    const borderRadius = styles.borderRadius;
    if (!borderRadius.includes('8px') && !borderRadius.includes('0.5rem')) {
      violations.push(`borderRadius: expected 0.5rem (8px), got ${borderRadius}`);
    }

    // Check font weight (should be 600 or 700)
    const fontWeight = parseInt(styles.fontWeight, 10);
    if (fontWeight < 600) {
      violations.push(`fontWeight: expected ≥600 (semibold/bold), got ${fontWeight}`);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Helper to get full className for a CTA button
   *
   * @example
   * ```typescript
   * const className = CTAButtonPattern.getClassName('inverse', 'lg', 'primary');
   * // Returns: "inline-flex items-center ... bg-white ... text-primary px-8 py-4 text-lg"
   * ```
   */
  getClassName: (
    variant: CTAVariant = 'primary',
    size: CTASize = 'md',
    sectionColor?: SectionColor
  ): string => {
    const base = CTAButtonPattern.baseClasses;
    const variantClass = CTAButtonPattern.variants[variant];
    const sizeClass = CTAButtonPattern.sizes[size];

    // For inverse variant, append section color
    if (variant === 'inverse' && sectionColor) {
      const colorClass = CTAButtonPattern.sectionColors[sectionColor].textClass;
      return `${base} ${variantClass} ${colorClass} ${sizeClass}`;
    }

    return `${base} ${variantClass} ${sizeClass}`;
  },

  /**
   * Usage example
   */
  example: `
    // In CTAButton component:
    import { CTAButtonPattern } from '@/lib/design-system/patterns/cta-button.pattern';

    const className = CTAButtonPattern.getClassName(variant, size, textColor);

    // In Markdown content (Primary Overnight section with primary background):
    {% ctaButton label="Register Now" href="register" variant="inverse" textColor="primary" size="lg" /%}

    // Renders with:
    // - White background (contrast against primary)
    // - text-primary (matches section color)
    // - Large sizing
  `,
} as const;

export default CTAButtonPattern;
