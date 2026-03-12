import { test, expect } from '@playwright/test';

const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('REQ-PROC-003: Session Header Computed Styles', () => {
  test('headers have correct font-size (3rem = 48px)', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);

    // Wait for content to load
    await page.waitForSelector('h2');

    // Find headers in colored grid sections
    const headers = page.locator('.prose h2');
    const count = await headers.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const fontSize = await header.evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      expect(fontSize, `Header ${i} should be 48px`).toBe('48px');
    }
  });

  test('headers are left-aligned', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForSelector('h2');

    const headers = page.locator('.prose h2');
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const textAlign = await header.evaluate(el =>
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign, `Header ${i} should be left-aligned`).toBe('left');
    }
  });

  test('headers on colored backgrounds are white', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForSelector('h2');

    // Headers in light-text sections should be white
    const whiteTextSections = page.locator('.text-white .prose h2');
    const count = await whiteTextSections.count();

    for (let i = 0; i < count; i++) {
      const header = whiteTextSections.nth(i);
      const color = await header.evaluate(el =>
        window.getComputedStyle(el).color
      );
      // rgb(255, 255, 255) is white
      expect(color, `Header ${i} should be white`).toBe('rgb(255, 255, 255)');
    }
  });

  test('headers have tight line-height (1)', async ({ page }) => {
    await page.goto(`${PRODUCTION_URL}/summer-camp-sessions`);
    await page.waitForSelector('h2');

    const headers = page.locator('.prose h2');
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const lineHeight = await header.evaluate(el =>
        window.getComputedStyle(el).lineHeight
      );
      // line-height: 1 on a 48px font = 48px
      expect(lineHeight, `Header ${i} should have tight line-height`).toBe('48px');
    }
  });
});
