/**
 * Grid Section Pattern
 * REQ-PROC-005: Design pattern library
 *
 * Used for alternating image/content layout in camp sessions
 * and work-at-camp pages.
 *
 * Design requirements:
 * - 50/50 split between image and content on desktop
 * - Alternating left/right layout for visual interest
 * - Full-bleed images
 * - Minimum heights for consistent sections
 * - Mobile-first responsive behavior
 */

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export const GridSectionPattern = {
  name: 'GridSectionPattern',

  /**
   * Container pattern - wraps all grid squares
   * Used in SquareGrid component
   */
  container: {
    name: 'SquareGrid',
    tailwind: 'w-full',
    description: 'Full-width container for alternating sections',
  },

  /**
   * Section pattern - each row (image + content pair)
   * Alternates image position between rows
   */
  section: {
    name: 'GridRow',
    tailwind: 'flex flex-col lg:flex-row min-h-[600px]',
    description: '50/50 split row with minimum height',

    validation: {
      requiredClasses: [
        'flex',
        'flex-col',        // Stack on mobile
        'lg:flex-row',     // Side-by-side on desktop
        'min-h-[600px]',   // Minimum height for visual consistency
      ],
      forbiddenClasses: [
        'grid',            // Use flex, not grid
        'gap-',            // No gaps between squares (full-bleed design)
        'max-h-',          // Should not limit height
      ],
    },
  },

  /**
   * Column pattern - each half of a row
   * Contains either image or content square
   */
  column: {
    name: 'GridColumn',
    tailwind: 'w-full lg:w-1/2',
    description: 'Half-width column on desktop, full-width on mobile',

    validation: {
      requiredClasses: [
        'w-full',          // Full width on mobile
        'lg:w-1/2',        // Half width on desktop
      ],
      forbiddenClasses: [
        'p-',              // No padding (padding is inside GridSquare)
        'm-',              // No margin (full-bleed)
      ],
    },
  },

  /**
   * Image square pattern
   * Full-bleed photo filling entire column
   */
  imageSquare: {
    name: 'ImageGridSquare',
    tailwind: 'relative min-h-[400px] lg:min-h-full h-full scroll-mt-4',
    description: 'Full-bleed image container with scroll anchor support',

    validation: {
      requiredClasses: [
        'relative',            // For absolute-positioned Image
        'min-h-[400px]',       // Minimum height on mobile
        'lg:min-h-full',       // Full height on desktop
        'h-full',              // Fill available height
        'scroll-mt-4',         // Scroll margin for anchor links
      ],
      forbiddenClasses: [
        'p-',                  // No padding (image is full-bleed)
      ],
      requiredStyles: {
        position: 'relative',
      },
    },
  },

  /**
   * Content square pattern
   * Colored background with nested content
   */
  contentSquare: {
    name: 'ContentGridSquare',
    tailwind: 'flex flex-col justify-center p-8 lg:p-12 min-h-[400px] lg:min-h-full h-full scroll-mt-4',
    description: 'Colored background container with centered content',

    validation: {
      requiredClasses: [
        'flex',
        'flex-col',            // Stack content vertically
        'justify-center',      // Vertically center content
        'p-8',                 // Padding on mobile
        'lg:p-12',             // Larger padding on desktop
        'min-h-[400px]',       // Minimum height on mobile
        'lg:min-h-full',       // Full height on desktop
        'h-full',              // Fill available height
        'scroll-mt-4',         // Scroll margin for anchor links
      ],
      forbiddenClasses: [
        'items-center',        // Content should not be horizontally centered
        'text-center',         // Text should be left-aligned
      ],
      requiredStyles: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      },
    },
  },

  /**
   * Alternating layout logic
   * Determines image position based on section index
   */
  alternating: {
    description: 'Even sections: image left, content right. Odd sections: content left, image right',

    /**
     * Get order classes for image position
     *
     * @param sectionIndex - Zero-based section index
     * @param isImageColumn - True if this column contains the image
     * @returns Tailwind order classes
     */
    getOrderClasses: (sectionIndex: number, isImageColumn: boolean): string => {
      const isImageLeft = sectionIndex % 2 === 0;

      // Image left (even sections)
      if (isImageLeft) {
        return isImageColumn
          ? 'order-1 lg:order-1'  // Image first on all screens
          : 'order-2 lg:order-2'; // Content second on all screens
      }

      // Image right (odd sections)
      return isImageColumn
        ? 'order-1 lg:order-2'  // Image first on mobile, second on desktop
        : 'order-2 lg:order-1'; // Content second on mobile, first on desktop
    },
  },

  /**
   * Responsive breakpoints
   */
  breakpoints: {
    mobile: '< 1024px',     // Stack vertically
    desktop: '≥ 1024px',    // Side-by-side 50/50
  },

  /**
   * Minimum heights
   */
  minHeights: {
    mobile: '400px',        // Minimum section height on mobile
    desktop: '600px',       // Minimum section height on desktop (from parent section)
  },

  /**
   * Test helper for Playwright assertions
   *
   * @example
   * ```typescript
   * const section = page.locator('section[role="region"]').first();
   * const result = await section.evaluate((el) => {
   *   const { testHelper } = GridSectionPattern;
   *   return testHelper(el);
   * });
   * expect(result.isValid).toBe(true);
   * ```
   */
  testHelper: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check display
    if (styles.display !== 'flex') {
      violations.push(`display: expected flex, got ${styles.display}`);
    }

    // Check minimum height (should be at least 600px on desktop)
    const minHeight = parseFloat(styles.minHeight);
    if (window.innerWidth >= 1024 && minHeight < 600) {
      violations.push(`minHeight: expected ≥600px on desktop, got ${minHeight}px`);
    }

    // Check children (should have exactly 2 for 50/50 split)
    const children = element.children;
    if (children.length !== 2) {
      violations.push(`children: expected 2 (image + content), got ${children.length}`);
    }

    // Check child widths on desktop
    if (window.innerWidth >= 1024) {
      Array.from(children).forEach((child, index) => {
        const childStyles = window.getComputedStyle(child);
        const width = parseFloat(childStyles.width);
        const parentWidth = parseFloat(styles.width);
        const expectedWidth = parentWidth / 2;
        const tolerance = 2; // Allow 2px tolerance for rounding

        if (Math.abs(width - expectedWidth) > tolerance) {
          violations.push(
            `child[${index}] width: expected ~${expectedWidth}px (50%), got ${width}px`
          );
        }
      });
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Accessibility requirements
   */
  accessibility: {
    section: {
      role: 'region',
      ariaLabel: 'Content section {index}',
      description: 'Each section should be a semantic region with descriptive label',
    },
    image: {
      alt: 'required',
      description: 'All images must have descriptive alt text',
    },
  },

  /**
   * Usage example
   */
  example: `
    // In SquareGrid component:
    import { GridSectionPattern } from '@/lib/design-system/patterns/grid-section.pattern';

    return (
      <div className={GridSectionPattern.container.tailwind}>
        {pairs.map((pair, index) => {
          const isImageLeft = index % 2 === 0;

          return (
            <section
              key={index}
              className={GridSectionPattern.section.tailwind}
              role={GridSectionPattern.accessibility.section.role}
              aria-label={\`Content section \${index + 1}\`}
            >
              <div className={\`\${GridSectionPattern.column.tailwind} \${orderClasses1}\`}>
                {pair[0]}
              </div>
              <div className={\`\${GridSectionPattern.column.tailwind} \${orderClasses2}\`}>
                {pair[1]}
              </div>
            </section>
          );
        })}
      </div>
    );

    // In Markdown content:
    {% squareGrid columns="2" gap="none" %}

    {% gridSquare contentType="image"
       image="/images/primary-overnight.jpg"
       imageAlt="Young campers at Primary Overnight" /%}

    {% gridSquare contentType="color" backgroundColor="#0284c7" textColor="light" %}
    ## Primary Overnight
    ...content...
    {% /gridSquare %}

    {% /squareGrid %}
  `,
} as const;

export default GridSectionPattern;
