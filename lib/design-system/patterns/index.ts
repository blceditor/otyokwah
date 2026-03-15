/**
 * Design Pattern Library
 * REQ-PROC-005: Core design patterns
 *
 * Single source of truth for design patterns used across the Camp Otyokwah website.
 * Each pattern exports:
 * - Tailwind class strings
 * - Validation rules (required/forbidden classes)
 * - Test helpers for Playwright assertions
 * - Usage examples
 *
 * Purpose:
 * - Ensure consistency across components
 * - Enable pattern validation in CI/CD
 * - Provide clear documentation for developers
 * - Prevent implementation drift over time
 */

export { SessionHeaderPattern, default as sessionHeader } from './session-header.pattern';
export { CTAButtonPattern, default as ctaButton } from './cta-button.pattern';
export { GridSectionPattern, default as gridSection } from './grid-section.pattern';
export { SessionCardPattern, default as sessionCard } from './session-card.pattern';
export { AnchorNavPattern, default as anchorNav } from './anchor-nav.pattern';

export type { ValidationResult } from './session-header.pattern';
export type { CTAVariant, CTASize, SectionColor } from './cta-button.pattern';

/**
 * Pattern library metadata
 */
export const PatternLibrary = {
  version: '1.1.0',
  patterns: [
    'SessionHeaderPattern',
    'CTAButtonPattern',
    'GridSectionPattern',
    'SessionCardPattern',
    'AnchorNavPattern',
  ],
  createdDate: '2025-12-23',
  updatedDate: '2025-12-23',
  description: 'Core design patterns for Camp Otyokwah website',
} as const;

/**
 * Usage:
 *
 * ```typescript
 * // Import specific pattern
 * import { SessionHeaderPattern } from '@/lib/design-system/patterns';
 *
 * // Use in component
 * <div className={SessionHeaderPattern.proseOverride}>
 *   <h2>Session Title</h2>
 * </div>
 *
 * // Use in tests
 * const result = await header.evaluate((el) => {
 *   const { testHelper } = SessionHeaderPattern;
 *   return testHelper(el);
 * });
 * expect(result.isValid).toBe(true);
 *
 * // Import all patterns
 * import * as patterns from '@/lib/design-system/patterns';
 * console.log(patterns.PatternLibrary.patterns);
 * ```
 */
