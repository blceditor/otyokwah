/**
 * Session Card Pattern
 * REQ-PROC-006: Design pattern library expansion
 *
 * Used for session detail cards with translucent white backgrounds
 * and bark-colored titles.
 *
 * Design requirements:
 * - bg-white with 20% opacity (bg-white/20)
 * - Rounded corners (rounded-lg)
 * - Padding for content spacing
 * - Bark-colored headings (text-bark)
 * - Consistent typography
 */

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export const SessionCardPattern = {
  name: 'SessionCardPattern',

  /**
   * Tailwind classes for session cards
   * Applied to card containers with session details
   */
  tailwind: 'bg-white/20 rounded-lg p-6 lg:p-8',

  /**
   * Heading pattern for card titles
   * Uses bark color for brand consistency
   */
  heading: {
    tailwind: 'text-bark font-bold text-xl lg:text-2xl mb-4',
    description: 'Card heading with brand color',
  },

  /**
   * Content area pattern
   */
  content: {
    tailwind: 'prose prose-lg',
    description: 'Prose-formatted content area',
  },

  /**
   * Validation rules for pattern compliance
   */
  validation: {
    /**
     * Required classes for card container
     */
    requiredClasses: [
      'bg-white/20',     // Translucent white background
      'rounded-lg',      // Rounded corners
      'p-6',             // Padding on mobile
      'lg:p-8',          // Larger padding on desktop
    ],

    /**
     * Forbidden classes that indicate incorrect implementation
     */
    forbiddenClasses: [
      'bg-white',        // Must use opacity variant, not solid
      'bg-opacity-',     // Must use /20 syntax, not bg-opacity
      'rounded-none',    // Must have rounded corners
      'p-0',             // Must have padding
    ],

    /**
     * Required classes for card headings
     */
    headingRequiredClasses: [
      'text-bark',       // Brand color
      'font-bold',       // Bold weight
      'text-xl',         // Size on mobile
      'lg:text-2xl',     // Larger size on desktop
      'mb-4',            // Bottom margin
    ],

    /**
     * Required computed styles for card
     */
    requiredStyles: {
      borderRadius: '0.5rem',     // rounded-lg
      backgroundColor: 'rgba(255, 255, 255, 0.2)', // bg-white/20
    },

    /**
     * Required computed styles for heading
     */
    headingRequiredStyles: {
      color: '#3B5249',          // text-bark
      fontWeight: '700',          // font-bold
    },
  },

  /**
   * Test helper for Playwright assertions
   *
   * @example
   * ```typescript
   * const card = page.locator('.bg-white\\/20').first();
   * const result = await card.evaluate((el) => {
   *   const { testHelper } = SessionCardPattern;
   *   return testHelper(el);
   * });
   * expect(result.isValid).toBe(true);
   * ```
   */
  testHelper: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check border radius
    const borderRadius = styles.borderRadius;
    if (!borderRadius.includes('8px') && !borderRadius.includes('0.5rem')) {
      violations.push(`borderRadius: expected 0.5rem (8px), got ${borderRadius}`);
    }

    // Check background color (should be white with opacity)
    const bgColor = styles.backgroundColor;
    const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);

    if (rgbaMatch) {
      const [, r, g, b, a] = rgbaMatch;
      const isWhite = r === '255' && g === '255' && b === '255';
      const hasOpacity = a && parseFloat(a) < 1;

      if (!isWhite) {
        violations.push(`backgroundColor: expected white (255, 255, 255), got rgb(${r}, ${g}, ${b})`);
      }

      if (!hasOpacity) {
        violations.push(`backgroundColor: expected opacity < 1, got ${a || '1'}`);
      }

      // Check opacity is approximately 0.2
      if (a) {
        const opacity = parseFloat(a);
        if (Math.abs(opacity - 0.2) > 0.05) {
          violations.push(`backgroundColor opacity: expected ~0.2, got ${opacity}`);
        }
      }
    } else {
      violations.push(`backgroundColor: expected rgba() format, got ${bgColor}`);
    }

    // Check padding (should be at least 1.5rem / 24px on mobile)
    const padding = parseFloat(styles.padding);
    if (padding < 24) {
      violations.push(`padding: expected ≥24px (1.5rem), got ${padding}px`);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Test helper for card heading validation
   */
  testHeading: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check text color (bark: #3B5249)
    const color = styles.color;
    const expectedColor = 'rgb(59, 82, 73)'; // #3B5249 in RGB

    if (!color.includes('59') || !color.includes('82') || !color.includes('73')) {
      violations.push(`color: expected ${expectedColor} (text-bark), got ${color}`);
    }

    // Check font weight
    const fontWeight = parseInt(styles.fontWeight, 10);
    if (fontWeight < 700) {
      violations.push(`fontWeight: expected 700 (bold), got ${fontWeight}`);
    }

    // Check font size (should be at least 1.25rem / 20px)
    const fontSize = parseFloat(styles.fontSize);
    if (fontSize < 20) {
      violations.push(`fontSize: expected ≥20px (text-xl), got ${fontSize}px`);
    }

    // Check margin bottom
    const marginBottom = parseFloat(styles.marginBottom);
    if (marginBottom < 15 || marginBottom > 18) {
      violations.push(`marginBottom: expected ~16px (1rem), got ${marginBottom}px`);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Usage example
   */
  example: `
    // In GridSquare component:
    <div className="bg-primary text-white">
      <div className={SessionCardPattern.tailwind}>
        <h3 className={SessionCardPattern.heading.tailwind}>
          Session Details
        </h3>
        <div className={SessionCardPattern.content.tailwind}>
          <p>Content here...</p>
        </div>
      </div>
    </div>

    // In Markdown content:
    {% gridSquare contentType="color" backgroundColor="#0284c7" textColor="light" %}

    <div class="bg-white/20 rounded-lg p-6 lg:p-8">
      <h3 class="text-bark font-bold text-xl lg:text-2xl mb-4">Dates & Details</h3>

      **When:** June 10-14, 2025
      **Ages:** Rising 2nd-3rd Graders
    </div>

    {% /gridSquare %}
  `,
} as const;

export default SessionCardPattern;
