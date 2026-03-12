/**
 * Anchor Navigation Pattern
 * REQ-PROC-006: Design pattern library expansion
 *
 * Used for section jump navigation (smooth scroll to content sections).
 *
 * Design requirements:
 * - Sticky navigation bar
 * - Horizontal scroll on mobile
 * - Centered layout on desktop
 * - Active state indication
 * - Smooth scroll behavior
 * - Accessible keyboard navigation
 */

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export const AnchorNavPattern = {
  name: 'AnchorNavPattern',

  /**
   * Container pattern - wraps all anchor links
   */
  container: {
    tailwind: 'sticky top-0 z-10 bg-white border-b border-stone/20 shadow-sm',
    description: 'Sticky navigation bar with subtle border and shadow',

    validation: {
      requiredClasses: [
        'sticky',         // Sticky positioning
        'top-0',          // Stick to top of viewport
        'z-10',           // Above content, below modals
        'bg-white',       // Solid background
        'border-b',       // Bottom border
        'shadow-sm',      // Subtle shadow
      ],
      forbiddenClasses: [
        'fixed',          // Use sticky, not fixed
        'absolute',       // Use sticky, not absolute
        'z-50',           // Too high z-index
      ],
    },
  },

  /**
   * Nav wrapper pattern - contains scrollable link list
   */
  navWrapper: {
    tailwind: 'overflow-x-auto scrollbar-hide',
    description: 'Horizontal scroll container for mobile',

    validation: {
      requiredClasses: [
        'overflow-x-auto', // Horizontal scroll
      ],
    },
  },

  /**
   * Link list pattern
   */
  linkList: {
    tailwind: 'flex gap-1 p-2 lg:justify-center lg:gap-2',
    description: 'Flex container for anchor links',

    validation: {
      requiredClasses: [
        'flex',           // Flexbox layout
        'gap-1',          // Spacing between links (mobile)
        'lg:gap-2',       // Larger spacing (desktop)
        'p-2',            // Padding
        'lg:justify-center', // Centered on desktop
      ],
      forbiddenClasses: [
        'grid',           // Use flex, not grid
        'justify-start',  // Should center on desktop
      ],
    },
  },

  /**
   * Link pattern - individual anchor link
   */
  link: {
    base: 'px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
    default: 'text-bark hover:bg-stone/10',
    active: 'bg-secondary text-white',

    description: 'Individual anchor link with hover and active states',

    validation: {
      requiredClasses: [
        'px-4',           // Horizontal padding
        'py-2',           // Vertical padding
        'rounded-md',     // Rounded corners
        'text-sm',        // Small text
        'font-medium',    // Medium weight
        'transition-colors', // Smooth color transitions
        'whitespace-nowrap', // Prevent text wrapping
      ],
      forbiddenClasses: [
        'text-center',    // Text should not be centered
        'block',          // Should be inline-flex or default display
      ],
    },
  },

  /**
   * Scroll behavior configuration
   */
  scrollBehavior: {
    smooth: true,
    offset: 80, // Pixels to offset scroll (account for sticky nav height)
    description: 'Smooth scroll with offset for sticky header',
  },

  /**
   * Accessibility requirements
   */
  accessibility: {
    nav: {
      ariaLabel: 'Section navigation',
      description: 'Nav element with descriptive label',
    },
    links: {
      role: 'none', // Links are semantic, no role needed
      ariaLabel: 'required', // Each link should describe destination
      description: 'Links should have descriptive text or aria-label',
    },
  },

  /**
   * Validation rules
   */
  validation: {
    /**
     * Required computed styles for container
     */
    containerStyles: {
      position: 'sticky',
      top: '0px',
      backgroundColor: 'rgb(255, 255, 255)',
    },

    /**
     * Required computed styles for links
     */
    linkStyles: {
      borderRadius: '0.375rem', // rounded-md
      fontWeight: '500',         // font-medium
    },
  },

  /**
   * Test helper for Playwright assertions
   *
   * @example
   * ```typescript
   * const nav = page.locator('nav[aria-label="Section navigation"]');
   * const result = await nav.evaluate((el) => {
   *   const { testHelper } = AnchorNavPattern;
   *   return testHelper(el);
   * });
   * expect(result.isValid).toBe(true);
   * ```
   */
  testHelper: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check position
    if (styles.position !== 'sticky' && styles.position !== 'fixed') {
      violations.push(`position: expected sticky or fixed, got ${styles.position}`);
    }

    // Check top
    if (styles.top !== '0px') {
      violations.push(`top: expected 0px, got ${styles.top}`);
    }

    // Check background color (should be white or near-white)
    const bgColor = styles.backgroundColor;
    if (!bgColor.includes('255, 255, 255')) {
      violations.push(`backgroundColor: expected white rgb(255, 255, 255), got ${bgColor}`);
    }

    // Check z-index (should be at least 10)
    const zIndex = parseInt(styles.zIndex, 10);
    if (isNaN(zIndex) || zIndex < 10) {
      violations.push(`zIndex: expected ≥10, got ${styles.zIndex}`);
    }

    // Check has border or shadow (visual separation)
    const hasBorder = parseFloat(styles.borderBottomWidth) > 0;
    const hasShadow = styles.boxShadow !== 'none';

    if (!hasBorder && !hasShadow) {
      violations.push('visual separation: expected border or shadow, got neither');
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Test helper for link validation
   */
  testLink: (element: HTMLElement, isActive = false): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check border radius
    const borderRadius = styles.borderRadius;
    if (!borderRadius.includes('6px') && !borderRadius.includes('0.375rem')) {
      violations.push(`borderRadius: expected 0.375rem (6px), got ${borderRadius}`);
    }

    // Check font weight
    const fontWeight = parseInt(styles.fontWeight, 10);
    if (fontWeight < 500) {
      violations.push(`fontWeight: expected ≥500 (medium), got ${fontWeight}`);
    }

    // Check padding
    const paddingLeft = parseFloat(styles.paddingLeft);
    const paddingRight = parseFloat(styles.paddingRight);
    const paddingTop = parseFloat(styles.paddingTop);
    const paddingBottom = parseFloat(styles.paddingBottom);

    if (paddingLeft < 15 || paddingRight < 15) {
      violations.push(`padding-x: expected ≥16px (px-4), got ${paddingLeft}px / ${paddingRight}px`);
    }

    if (paddingTop < 7 || paddingBottom < 7) {
      violations.push(`padding-y: expected ≥8px (py-2), got ${paddingTop}px / ${paddingBottom}px`);
    }

    // Check active state styling
    if (isActive) {
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;

      // Should have colored background when active
      if (bgColor.includes('255, 255, 255') || bgColor === 'transparent') {
        violations.push('active state: expected colored background, got white/transparent');
      }

      // Should have contrasting text color
      if (textColor.includes('59, 82, 73')) {
        violations.push('active state: expected contrasting text color, got bark');
      }
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Helper to get full className for an anchor link
   *
   * @example
   * ```typescript
   * const className = AnchorNavPattern.getClassName(isActive);
   * // Returns: "px-4 py-2 ... bg-secondary text-white" (if active)
   * ```
   */
  getClassName: (isActive = false): string => {
    const base = AnchorNavPattern.link.base;
    const state = isActive
      ? AnchorNavPattern.link.active
      : AnchorNavPattern.link.default;

    return `${base} ${state}`;
  },

  /**
   * Usage example
   */
  example: `
    // In AnchorNav component:
    import { AnchorNavPattern } from '@/lib/design-system/patterns/anchor-nav.pattern';

    return (
      <div className={AnchorNavPattern.container.tailwind}>
        <nav
          className={AnchorNavPattern.navWrapper.tailwind}
          aria-label={AnchorNavPattern.accessibility.nav.ariaLabel}
        >
          <ul className={AnchorNavPattern.linkList.tailwind}>
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={\`#\${section.id}\`}
                  className={AnchorNavPattern.getClassName(activeSection === section.id)}
                  onClick={(e) => handleClick(e, section.id)}
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    );

    // In target sections (GridSquare):
    <div id="primary-overnight" className="scroll-mt-20">
      ...content...
    </div>
  `,
} as const;

export default AnchorNavPattern;
