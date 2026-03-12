/**
 * CSS Inspection Test for Summer Camp Sessions Page
 * REQ-INVESTIGATION: Diagnose actual computed CSS values for session headers
 *
 * This test navigates to the production site and extracts the ACTUAL computed
 * CSS values for the session headers to diagnose styling issues.
 */

import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('Summer Camp Sessions - CSS Investigation', () => {
  test('REQ-INVESTIGATION - Extract actual computed CSS for session headers', async ({ page }) => {
    // Navigate to the production page
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);

    // Wait for the page to fully load
    await page.waitForLoadState('networkidle');

    // Extract all h2 elements within the colored grid squares
    const headerData = await page.evaluate(() => {
      // Find all h2 elements in the page
      const headers = Array.from(document.querySelectorAll('.prose h2'));

      const results = headers.map((h) => {
        const styles = window.getComputedStyle(h);
        const parent = h.closest('[id]');

        return {
          text: h.textContent?.trim() || '',
          parentId: parent?.id || 'no-id',
          computedStyles: {
            fontSize: styles.fontSize,
            textAlign: styles.textAlign,
            color: styles.color,
            lineHeight: styles.lineHeight,
            fontWeight: styles.fontWeight,
            marginTop: styles.marginTop,
            marginBottom: styles.marginBottom,
            backgroundColor: window.getComputedStyle(parent || h).backgroundColor,
          },
          // Get all classes applied to the h2
          classList: Array.from(h.classList),
          // Get all classes applied to the parent
          parentClassList: parent ? Array.from(parent.classList) : [],
        };
      });

      return results;
    });

    // Log the results
    console.log('\n=== COMPUTED CSS INVESTIGATION ===\n');
    console.log(JSON.stringify(headerData, null, 2));

    // Take a screenshot for visual reference
    await page.screenshot({
      path: 'verification-screenshots/css-investigation-summer-camp-sessions.png',
      fullPage: true
    });

    // Find the specific session headers we care about
    const sessionHeaders = headerData.filter(h =>
      ['Primary Overnight', 'Junior Camp', 'Jr. High Camp', 'Sr. High Camp'].includes(h.text)
    );

    console.log('\n=== SESSION HEADERS ONLY ===\n');
    console.log(JSON.stringify(sessionHeaders, null, 2));

    // Assertions to verify expected values
    for (const header of sessionHeaders) {
      console.log(`\n--- Checking: ${header.text} ---`);
      console.log(`Font Size: ${header.computedStyles.fontSize} (expected: 48px)`);
      console.log(`Text Align: ${header.computedStyles.textAlign} (expected: left)`);
      console.log(`Color: ${header.computedStyles.color} (expected: rgb(255, 255, 255) for white)`);
      console.log(`Line Height: ${header.computedStyles.lineHeight} (expected: close to font size for leading-none)`);
      console.log(`Font Weight: ${header.computedStyles.fontWeight} (expected: 700 for bold)`);

      // Check if values match expectations
      const fontSizeMatch = header.computedStyles.fontSize === '48px';
      const textAlignMatch = header.computedStyles.textAlign === 'left';
      const colorMatch = header.computedStyles.color === 'rgb(255, 255, 255)';

      console.log(`\nMatches Expected?`);
      console.log(`- Font Size: ${fontSizeMatch ? '✓' : '✗'}`);
      console.log(`- Text Align: ${textAlignMatch ? '✓' : '✗'}`);
      console.log(`- Color (white): ${colorMatch ? '✓' : '✗'}`);
    }

    // Verify we found the headers
    expect(sessionHeaders.length).toBe(4);

    // Store results for further analysis
    expect(sessionHeaders).toBeTruthy();
  });

  test('REQ-INVESTIGATION - Check prose class cascade', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Check the entire cascade of classes applied to the prose div and its children
    const proseAnalysis = await page.evaluate(() => {
      const proseDivs = Array.from(document.querySelectorAll('.prose'));

      return proseDivs.map((div) => {
        const h2s = Array.from(div.querySelectorAll('h2'));

        return {
          proseClasses: Array.from(div.classList),
          h2Analysis: h2s.map((h2) => {
            const styles = window.getComputedStyle(h2);
            return {
              text: h2.textContent?.trim() || '',
              classes: Array.from(h2.classList),
              // Check for inline styles that might override
              inlineStyles: h2.getAttribute('style'),
              computedFontSize: styles.fontSize,
              computedTextAlign: styles.textAlign,
              computedColor: styles.color,
              // Check specificity issues
              cssText: styles.cssText,
            };
          }),
        };
      });
    });

    console.log('\n=== PROSE CLASS CASCADE ANALYSIS ===\n');
    console.log(JSON.stringify(proseAnalysis, null, 2));

    expect(proseAnalysis).toBeTruthy();
  });
});
