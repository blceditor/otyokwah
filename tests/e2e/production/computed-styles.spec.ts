/**
 * REQ-PROC-003: Computed Style Assertions for Summer Camp Sessions
 *
 * Tests actual rendered CSS values (not just class presence) to catch
 * CSS specificity issues that caused the original bug where classes
 * were present but not rendering correctly.
 *
 * Target: https://www.bearlakecamp.com/summer-camp-sessions
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('REQ-PROC-003: Session Header Computed Styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');
  });

  test('REQ-PROC-003-001: Primary Overnight header has correct computed styles', async ({ page }) => {
    // Find the Primary Overnight header
    const header = page.locator('#primary-overnight h2').first();

    // Verify header exists
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Primary Overnight');

    // Get computed styles using page.evaluate()
    const styles = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
      };
    });

    // Assert computed values match requirements
    expect(styles.fontSize, 'Font size should be 48px (3rem)').toBe('48px');
    expect(styles.textAlign, 'Text should be left-aligned').toBe('left');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');
    expect(styles.lineHeight, 'Line height should be 48px (leading-none, 1:1 ratio)').toBe('48px');
    expect(styles.color, 'Text color should be white on colored background').toBe('rgb(255, 255, 255)');

    // Screenshot proof
    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-001-primary-overnight-header.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-002: Junior Camp header has correct computed styles', async ({ page }) => {
    const header = page.locator('#junior-camp h2').first();

    await expect(header).toBeVisible();
    await expect(header).toHaveText('Junior Camp');

    const styles = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
      };
    });

    expect(styles.fontSize, 'Font size should be 48px (3rem)').toBe('48px');
    expect(styles.textAlign, 'Text should be left-aligned').toBe('left');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');
    expect(styles.lineHeight, 'Line height should be 48px (leading-none)').toBe('48px');
    expect(styles.color, 'Text color should be white on colored background').toBe('rgb(255, 255, 255)');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-002-junior-camp-header.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-003: Jr. High Camp header has correct computed styles', async ({ page }) => {
    const header = page.locator('#jr-high-camp h2').first();

    await expect(header).toBeVisible();
    await expect(header).toHaveText('Jr. High Camp');

    const styles = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
      };
    });

    expect(styles.fontSize, 'Font size should be 48px (3rem)').toBe('48px');
    expect(styles.textAlign, 'Text should be left-aligned').toBe('left');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');
    expect(styles.lineHeight, 'Line height should be 48px (leading-none)').toBe('48px');
    expect(styles.color, 'Text color should be white on colored background').toBe('rgb(255, 255, 255)');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-003-jr-high-camp-header.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-004: Sr. High Camp header has correct computed styles', async ({ page }) => {
    const header = page.locator('#sr-high-camp h2').first();

    await expect(header).toBeVisible();
    await expect(header).toHaveText('Sr. High Camp');

    const styles = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
      };
    });

    expect(styles.fontSize, 'Font size should be 48px (3rem)').toBe('48px');
    expect(styles.textAlign, 'Text should be left-aligned').toBe('left');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');
    expect(styles.lineHeight, 'Line height should be 48px (leading-none)').toBe('48px');
    expect(styles.color, 'Text color should be white on colored background').toBe('rgb(255, 255, 255)');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-004-sr-high-camp-header.png',
      fullPage: false,
    });
  });
});

test.describe('REQ-PROC-003: CTA Button Computed Styles', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');
  });

  test('REQ-PROC-003-005: Primary Overnight Register Now button has correct styles', async ({ page }) => {
    // Find the Register Now button in Primary Overnight section
    const button = page.locator('#primary-overnight a').filter({ hasText: 'Register Now' });

    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontWeight: computed.fontWeight,
      };
    });

    // Inverse variant with sky textColor: white background, sky-600 text
    expect(styles.backgroundColor, 'Background should be white (rgb(255, 255, 255))').toBe('rgb(255, 255, 255)');
    expect(styles.color, 'Text color should be sky-600 (rgb(2, 132, 199))').toBe('rgb(2, 132, 199)');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-005-primary-overnight-button.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-006: Junior Camp Register Now button has correct styles', async ({ page }) => {
    const button = page.locator('#junior-camp a').filter({ hasText: 'Register Now' });

    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontWeight: computed.fontWeight,
      };
    });

    // Inverse variant with amber textColor: white background, amber-600 text
    expect(styles.backgroundColor, 'Background should be white (rgb(255, 255, 255))').toBe('rgb(255, 255, 255)');
    expect(styles.color, 'Text color should be amber-600 (rgb(217, 119, 6))').toBe('rgb(217, 119, 6)');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-006-junior-camp-button.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-007: Jr. High Camp Register Now button has correct styles', async ({ page }) => {
    const button = page.locator('#jr-high-camp a').filter({ hasText: 'Register Now' });

    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontWeight: computed.fontWeight,
      };
    });

    // Inverse variant with emerald textColor: white background, emerald-700 text
    expect(styles.backgroundColor, 'Background should be white (rgb(255, 255, 255))').toBe('rgb(255, 255, 255)');
    expect(styles.color, 'Text color should be emerald-700 (rgb(4, 120, 87))').toBe('rgb(4, 120, 87)');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-007-jr-high-camp-button.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-008: Sr. High Camp Register Now button has correct styles', async ({ page }) => {
    const button = page.locator('#sr-high-camp a').filter({ hasText: 'Register Now' });

    await expect(button).toBeVisible();

    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        fontWeight: computed.fontWeight,
      };
    });

    // Inverse variant with purple textColor: white background, purple-700 text
    expect(styles.backgroundColor, 'Background should be white (rgb(255, 255, 255))').toBe('rgb(255, 255, 255)');
    expect(styles.color, 'Text color should be purple-700 (rgb(126, 34, 206))').toBe('rgb(126, 34, 206)');
    expect(styles.fontWeight, 'Font weight should be 700 (bold)').toBe('700');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-008-sr-high-camp-button.png',
      fullPage: false,
    });
  });
});

test.describe('REQ-PROC-003: CSS Specificity Regression Detection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');
  });

  test('REQ-PROC-003-009: Verify all session headers have consistent styling', async ({ page }) => {
    // Get all h2 elements within colored grid sections
    const sessionHeaders = [
      { id: '#primary-overnight', name: 'Primary Overnight' },
      { id: '#junior-camp', name: 'Junior Camp' },
      { id: '#jr-high-camp', name: 'Jr. High Camp' },
      { id: '#sr-high-camp', name: 'Sr. High Camp' },
    ];

    for (const session of sessionHeaders) {
      const header = page.locator(`${session.id} h2`).first();

      const styles = await header.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          fontSize: computed.fontSize,
          textAlign: computed.textAlign,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          color: computed.color,
        };
      });

      // All headers should have identical computed styles
      expect(styles.fontSize, `${session.name} font size`).toBe('48px');
      expect(styles.textAlign, `${session.name} text align`).toBe('left');
      expect(styles.fontWeight, `${session.name} font weight`).toBe('700');
      expect(styles.lineHeight, `${session.name} line height`).toBe('48px');
      expect(styles.color, `${session.name} color`).toBe('rgb(255, 255, 255)');
    }

    // Full page screenshot showing all sections
    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-009-all-sessions-consistency.png',
      fullPage: true,
    });
  });

  test('REQ-PROC-003-010: Verify prose class does not override session header styles', async ({ page }) => {
    // Check if prose class is present but not overriding our custom styles
    const header = page.locator('#primary-overnight h2').first();

    const analysis = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const parent = el.closest('.prose');

      return {
        hasProseParent: !!parent,
        classList: Array.from(el.classList),
        parentClassList: parent ? Array.from(parent.classList) : [],
        computedStyles: {
          fontSize: computed.fontSize,
          textAlign: computed.textAlign,
          color: computed.color,
        },
      };
    });

    // Verify prose class exists (for markdown rendering)
    expect(analysis.hasProseParent, 'Header should be inside .prose container').toBe(true);

    // But our custom styles should still be applied (not overridden by prose)
    expect(analysis.computedStyles.fontSize, 'Custom font size should override prose').toBe('48px');
    expect(analysis.computedStyles.textAlign, 'Custom text-align should override prose').toBe('left');
    expect(analysis.computedStyles.color, 'Custom color should override prose').toBe('rgb(255, 255, 255)');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-010-prose-override-check.png',
      fullPage: false,
    });
  });

  test('REQ-PROC-003-011: Verify no inline styles are overriding computed styles', async ({ page }) => {
    // Check all session headers for inline styles (which would indicate a hack/workaround)
    const sessionHeaders = [
      '#primary-overnight h2',
      '#junior-camp h2',
      '#jr-high-camp h2',
      '#sr-high-camp h2',
    ];

    for (const selector of sessionHeaders) {
      const header = page.locator(selector).first();

      const inlineStyle = await header.evaluate((el) => el.getAttribute('style'));

      expect(inlineStyle, `${selector} should not have inline styles (use CSS classes only)`).toBeNull();
    }

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-011-no-inline-styles.png',
      fullPage: true,
    });
  });
});

test.describe('REQ-PROC-003: Mobile Responsive Styles', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('REQ-PROC-003-012: Session headers remain correctly styled on mobile', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    const header = page.locator('#primary-overnight h2').first();

    const styles = await header.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        textAlign: computed.textAlign,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        color: computed.color,
      };
    });

    // Mobile should maintain the same computed styles (responsive design, not adaptive)
    expect(styles.fontSize, 'Font size should be 48px on mobile').toBe('48px');
    expect(styles.textAlign, 'Text should be left-aligned on mobile').toBe('left');
    expect(styles.fontWeight, 'Font weight should be 700 on mobile').toBe('700');
    expect(styles.lineHeight, 'Line height should be 48px on mobile').toBe('48px');
    expect(styles.color, 'Text color should be white on mobile').toBe('rgb(255, 255, 255)');

    await page.screenshot({
      path: 'verification-screenshots/REQ-PROC-003-012-mobile-session-headers.png',
      fullPage: true,
    });
  });
});
