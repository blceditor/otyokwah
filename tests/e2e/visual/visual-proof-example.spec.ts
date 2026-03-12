/**
 * Example Visual Proof Test
 * REQ-PROC-004: Demonstrates visual proof capture integration
 *
 * This test shows how to capture screenshots with requirement IDs
 * for visual verification of CSS changes.
 */

import { test, expect } from '@playwright/test';
import {
  captureVisualProof,
  captureVisualProofFromTest,
} from '@/scripts/validation/capture-visual-proof';

test.describe('REQ-PROC-004: Visual Proof Capture Examples', () => {
  test('capture hero section visual proof', async ({ page }, testInfo) => {
    await page.goto('/');

    // Wait for hero section to load
    await page.waitForSelector('h1');

    // Capture visual proof using helper function
    const result = await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-HERO-001',
      'Hero section with video background and title'
    );

    // Verify screenshot was saved
    expect(result.path).toContain('REQ-HERO-001');
    expect(result.requirementId).toBe('REQ-HERO-001');

    // Verify hero section is visible
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible();
  });

  test('capture navigation visual proof', async ({ page }) => {
    await page.goto('/');

    // Wait for navigation
    await page.waitForSelector('nav');

    // Capture visual proof with manual metadata
    const result = await captureVisualProof(page, {
      requirementId: 'REQ-NAV-001',
      description: 'Main navigation with logo and links',
      url: page.url(),
      metadata: {
        component: 'Navigation',
        viewport: 'desktop',
      },
    });

    // Verify navigation is visible
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Verify screenshot was captured
    expect(result.filename).toMatch(/REQ-NAV-001-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.png/);
  });

  test('capture responsive design visual proof', async ({ page }, testInfo) => {
    await page.goto('/');

    // Test desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForLoadState('networkidle');

    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-RESPONSIVE-001',
      'Desktop view - 1920x1080'
    );

    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-RESPONSIVE-001',
      'Tablet view - 768x1024'
    );

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-RESPONSIVE-001',
      'Mobile view - 375x667'
    );
  });

  test('capture CSS color changes visual proof', async ({ page }, testInfo) => {
    await page.goto('/summer-camp-sessions');

    // Wait for colored sections
    await page.waitForSelector('.bg-blue-500, .bg-green-500, .bg-red-500');

    // Capture visual proof of colored grid sections
    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-SESSIONS-001',
      'Summer camp sessions grid with colored backgrounds'
    );

    // Verify sections are present
    const coloredSections = page.locator('[class*="bg-"]');
    const count = await coloredSections.count();
    expect(count).toBeGreaterThan(0);
  });

  test('capture typography visual proof', async ({ page }, testInfo) => {
    await page.goto('/about');

    // Wait for content
    await page.waitForSelector('h1, h2, p');

    // Capture visual proof of typography
    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-TYPOGRAPHY-001',
      'Typography hierarchy - headings and body text'
    );

    // Verify font sizes using computed styles
    const h1 = page.locator('h1').first();
    const fontSize = await h1.evaluate((el) =>
      window.getComputedStyle(el).fontSize
    );

    // Font size should be reasonable (e.g., > 24px for h1)
    const fontSizeNum = parseInt(fontSize);
    expect(fontSizeNum).toBeGreaterThan(24);
  });
});

test.describe('REQ-PROC-003: Session Header Visual Verification', () => {
  test('headers have correct font-size with visual proof', async ({ page }, testInfo) => {
    await page.goto('/summer-camp-sessions');
    await page.waitForSelector('h2');

    // Capture visual proof BEFORE assertions
    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-PROC-003',
      'Session headers with 3rem (48px) font-size'
    );

    // Find headers in colored grid sections
    const headers = page.locator('.prose h2');
    const count = await headers.count();

    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const fontSize = await header.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );
      expect(fontSize, `Header ${i} should be 48px`).toBe('48px');
    }
  });

  test('headers are left-aligned with visual proof', async ({ page }, testInfo) => {
    await page.goto('/summer-camp-sessions');
    await page.waitForSelector('h2');

    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-PROC-003',
      'Session headers left-aligned'
    );

    const headers = page.locator('.prose h2');
    const count = await headers.count();

    for (let i = 0; i < count; i++) {
      const header = headers.nth(i);
      const textAlign = await header.evaluate((el) =>
        window.getComputedStyle(el).textAlign
      );
      expect(textAlign, `Header ${i} should be left-aligned`).toBe('left');
    }
  });

  test('headers on colored backgrounds are white with visual proof', async ({ page }, testInfo) => {
    await page.goto('/summer-camp-sessions');
    await page.waitForSelector('h2');

    await captureVisualProofFromTest(
      page,
      testInfo,
      'REQ-PROC-003',
      'Session headers white text on colored backgrounds'
    );

    // Headers in light-text sections should be white
    const whiteTextSections = page.locator('.text-white .prose h2');
    const count = await whiteTextSections.count();

    for (let i = 0; i < count; i++) {
      const header = whiteTextSections.nth(i);
      const color = await header.evaluate((el) =>
        window.getComputedStyle(el).color
      );
      // rgb(255, 255, 255) is white
      expect(color, `Header ${i} should be white`).toBe('rgb(255, 255, 255)');
    }
  });
});
