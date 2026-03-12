/**
 * Updates-03 Final Requirements - Production Tests
 * TDD: These tests should FAIL initially, then PASS after implementation
 *
 * REQ-U03-001: Session headings 3rem size (ALREADY PASSING - verified at 48px)
 * REQ-U03-006a: Button text no underline
 * REQ-U03-006b: Session card tight spacing (CMS only)
 * REQ-U03-013: Bottom page template redesign
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('REQ-U03-006a: Button Text No Underline', () => {
  test('Register Now buttons should NOT have text-decoration underline', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Find all Register Now links
    const registerButtons = page.locator('a').filter({ hasText: 'Register Now' });

    const count = await registerButtons.count();
    expect(count).toBeGreaterThan(0);

    // Check each button for underline
    for (let i = 0; i < count; i++) {
      const button = registerButtons.nth(i);
      const textDecoration = await button.evaluate(el => getComputedStyle(el).textDecoration);
      // Text decoration should NOT include 'underline'
      expect(textDecoration).not.toContain('underline');
    }
  });

  test('Request Scholarship button should NOT have underline', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    const scholarshipButton = page.locator('a:has-text("Request Scholarship")');
    await expect(scholarshipButton).toBeVisible();

    const textDecoration = await scholarshipButton.evaluate(el => getComputedStyle(el).textDecoration);
    expect(textDecoration).not.toContain('underline');
  });
});

test.describe('REQ-U03-006b: Session Card Tight Spacing', () => {
  test('session card elements should have minimal vertical margins', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Use JavaScript to find translucent session cards (bg-white/20)
    const spacing = await page.evaluate(() => {
      const allDivs = document.querySelectorAll('div');
      const sessionCards = Array.from(allDivs).filter(d => d.className.includes('bg-white/20'));

      if (sessionCards.length === 0) return null;

      const card = sessionCards[0];
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');

      return {
        h3MarginTop: h3 ? parseInt(getComputedStyle(h3).marginTop) : null,
        h3MarginBottom: h3 ? parseInt(getComputedStyle(h3).marginBottom) : null,
        pMarginTop: p ? parseInt(getComputedStyle(p).marginTop) : null,
        pMarginBottom: p ? parseInt(getComputedStyle(p).marginBottom) : null,
        cardCount: sessionCards.length
      };
    });

    expect(spacing).not.toBeNull();
    expect(spacing!.cardCount).toBeGreaterThan(0);

    // H3 should have minimal margins (< 10px)
    expect(spacing!.h3MarginTop).toBeLessThan(10);
    expect(spacing!.h3MarginBottom).toBeLessThan(10);

    // Paragraphs should have tight margins (< 10px)
    expect(spacing!.pMarginTop).toBeLessThan(10);
    expect(spacing!.pMarginBottom).toBeLessThan(10);
  });
});

test.describe('REQ-U03-013: Bottom Page Template', () => {
  test('Registration Information section should have 4 cards in 2x2 grid', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Look for Registration Information heading
    const regInfoHeading = page.locator('h2').filter({ hasText: 'Registration Information' });
    await expect(regInfoHeading).toBeVisible();

    // Check for 4 card headings using h3 elements specifically
    const cardHeadings = [
      'Pricing & Early Bird',
      'Share the Love Discount',
      'Grade Levels',
      'Questions?'
    ];

    for (const title of cardHeadings) {
      const heading = page.locator('h3').filter({ hasText: title });
      await expect(heading).toBeVisible();
    }
  });

  test('Registration Info cards should have outlined style with border', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Use JavaScript to find ContentCard components and check border
    const hasBorderedCards = await page.evaluate(() => {
      const articles = document.querySelectorAll('article');
      const cardTitles = ['Pricing & Early Bird', 'Share the Love Discount', 'Grade Levels', 'Questions?'];

      let borderedCount = 0;
      for (const article of articles) {
        const h3 = article.querySelector('h3');
        if (h3 && cardTitles.some(title => h3.textContent?.includes(title))) {
          const borderWidth = getComputedStyle(article).borderWidth;
          if (borderWidth !== '0px') {
            borderedCount++;
          }
        }
      }
      return borderedCount;
    });

    // Should have at least 4 bordered cards
    expect(hasBorderedCards).toBeGreaterThanOrEqual(4);
  });

  test('Scholarships Available section should have white heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    const scholarshipHeading = page.locator('h2:has-text("Scholarships Available")').last();
    await expect(scholarshipHeading).toBeVisible();

    const color = await scholarshipHeading.evaluate(el => getComputedStyle(el).color);
    // Should be white (rgb(255, 255, 255))
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('Scholarships button should have green text matching section background', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Find the Request Scholarship button in the CTA section
    const scholarshipButton = page.locator('section').filter({
      has: page.locator('h2:has-text("Scholarships Available")')
    }).locator('a:has-text("Request Scholarship")');

    await expect(scholarshipButton).toBeVisible();

    const color = await scholarshipButton.evaluate(el => getComputedStyle(el).color);
    // Should be green (secondary color - rgb(47, 79, 61))
    expect(color).toBe('rgb(47, 79, 61)');
  });

  test('Ready to Register section should have white heading', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    const registerHeading = page.locator('h2:has-text("Ready to Register")');
    await expect(registerHeading).toBeVisible();

    const color = await registerHeading.evaluate(el => getComputedStyle(el).color);
    // Should be white (rgb(255, 255, 255))
    expect(color).toBe('rgb(255, 255, 255)');
  });

  test('Ready to Register button should have brown text matching section background', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    // Find the Register Now button in the brown CTA section
    const registerButton = page.locator('section').filter({
      has: page.locator('h2:has-text("Ready to Register")')
    }).locator('a:has-text("Register Now")');

    await expect(registerButton).toBeVisible();

    const color = await registerButton.evaluate(el => getComputedStyle(el).color);
    // Should be bark/brown color - rgb(90, 74, 58)
    expect(color).toBe('rgb(90, 74, 58)');
  });
});

test.describe('REQ-U03-001: Session Headings Size (Already Implemented)', () => {
  test('session headings should be 3rem (48px) with line-height 1', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-sessions`);
    await page.waitForLoadState('networkidle');

    const sessionHeadings = ['Primary Overnight', 'Junior Camp', 'Jr. High Camp', 'Sr. High Camp'];

    for (const headingText of sessionHeadings) {
      const heading = page.locator(`h2:has-text("${headingText}")`).first();

      if (await heading.isVisible()) {
        const fontSize = await heading.evaluate(el => getComputedStyle(el).fontSize);
        const lineHeight = await heading.evaluate(el => getComputedStyle(el).lineHeight);
        const color = await heading.evaluate(el => getComputedStyle(el).color);

        // Should be 48px (3rem)
        expect(fontSize).toBe('48px');
        // Line height should be 48px (same as font-size for line-height: 1)
        expect(lineHeight).toBe('48px');
        // Should be white
        expect(color).toBe('rgb(255, 255, 255)');
      }
    }
  });
});
