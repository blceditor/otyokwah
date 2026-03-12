/**
 * Session Header Pattern
 * REQ-PROC-005: Design pattern library
 *
 * Used for camp session titles (Primary Overnight, Junior Camp, etc.)
 * in colored grid sections.
 *
 * Design requirements:
 * - 3rem font size (48px)
 * - line-height: none (tight spacing)
 * - font-weight: bold
 * - text-align: left
 * - color: inherit from parent
 * - minimal spacing (mb-2, mt-0)
 */

export interface ValidationResult {
  isValid: boolean;
  violations: string[];
}

export const SessionHeaderPattern = {
  name: 'SessionHeaderPattern',

  /**
   * Tailwind classes for session headers
   * Applied via prose overrides in GridSquare component
   */
  tailwind: 'text-[3rem] leading-none font-bold text-left !text-inherit mb-2 mt-0',

  /**
   * Validation rules for pattern compliance
   */
  validation: {
    /**
     * Required classes that MUST be present
     */
    requiredClasses: [
      'text-[3rem]',      // Exact 48px font size
      'leading-none',     // Tight line height
      'font-bold',        // Bold weight
      'text-left',        // Left alignment
      '!text-inherit',    // Inherit color from parent
    ],

    /**
     * Forbidden classes that indicate incorrect implementation
     */
    forbiddenClasses: [
      'text-center',      // Headers must be left-aligned
      'text-3xl',         // Must use exact 3rem, not Tailwind preset
      'text-4xl',         // Must use exact 3rem
      'text-5xl',         // Must use exact 3rem
      'leading-tight',    // Must use leading-none
      'leading-normal',   // Must use leading-none
    ],

    /**
     * Required computed styles
     */
    requiredStyles: {
      fontSize: '48px',        // Computed from text-[3rem]
      lineHeight: '48px',      // Computed from leading-none (1 × 48px)
      fontWeight: '700',       // Computed from font-bold
      textAlign: 'left',       // Computed from text-left
      marginBottom: '0.5rem',  // Computed from mb-2
      marginTop: '0px',        // Computed from mt-0
    },
  },

  /**
   * Test helper for Playwright assertions
   *
   * @example
   * ```typescript
   * const header = page.locator('.prose h2').first();
   * const result = await header.evaluate((el) => {
   *   const { testHelper } = SessionHeaderPattern;
   *   return testHelper(el);
   * });
   * expect(result.isValid).toBe(true);
   * ```
   */
  testHelper: (element: HTMLElement): ValidationResult => {
    const styles = window.getComputedStyle(element);
    const violations: string[] = [];

    // Check font size
    if (styles.fontSize !== '48px') {
      violations.push(`fontSize: expected 48px, got ${styles.fontSize}`);
    }

    // Check line height (should equal font size for leading-none)
    if (styles.lineHeight !== '48px') {
      violations.push(`lineHeight: expected 48px, got ${styles.lineHeight}`);
    }

    // Check font weight
    if (styles.fontWeight !== '700' && styles.fontWeight !== 'bold') {
      violations.push(`fontWeight: expected 700/bold, got ${styles.fontWeight}`);
    }

    // Check text alignment
    if (styles.textAlign !== 'left') {
      violations.push(`textAlign: expected left, got ${styles.textAlign}`);
    }

    // Check margin bottom (approximately 8px for mb-2)
    const marginBottom = parseFloat(styles.marginBottom);
    if (marginBottom < 7 || marginBottom > 9) {
      violations.push(`marginBottom: expected ~8px (0.5rem), got ${marginBottom}px`);
    }

    // Check margin top
    const marginTop = parseFloat(styles.marginTop);
    if (marginTop !== 0) {
      violations.push(`marginTop: expected 0px, got ${marginTop}px`);
    }

    return {
      isValid: violations.length === 0,
      violations,
    };
  },

  /**
   * Prose override selector for GridSquare component
   * Used to apply pattern with higher specificity than prose plugin defaults
   */
  proseOverride: '[&_h2]:!text-left [&_h2]:!text-[3rem] [&_h2]:!leading-none [&_h2]:!font-bold [&_h2]:!mb-2 [&_h2]:!mt-0 [&_h2]:!text-inherit',

  /**
   * Usage example
   */
  example: `
    // In GridSquare component:
    <div className="prose prose-lg [&_h2]:!text-left [&_h2]:!text-[3rem] [&_h2]:!leading-none ...">
      <h2>Primary Overnight</h2>
      {children}
    </div>

    // In Markdown content:
    ## Primary Overnight
    **Rising 2nd-3rd Graders**
  `,
} as const;

export default SessionHeaderPattern;
