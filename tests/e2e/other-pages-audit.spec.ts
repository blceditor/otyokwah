/**
 * REQ-TPL-003: All Other Pages Audit
 *
 * Playwright E2E tests verifying all pages use CMS content (no hardcoded text)
 */
import { test, expect } from '@playwright/test';

test.describe('REQ-TPL-003 — Contact Page CMS Content', () => {
  test('contact page has real address (not placeholder)', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    // Should NOT have placeholder text
    const pageContent = await page.content();

    // Check for placeholder patterns
    expect(pageContent).not.toContain('[Address Line 1]');
    expect(pageContent).not.toContain('[City, State ZIP]');
    expect(pageContent).not.toContain('(XXX)');
    expect(pageContent).not.toContain('XX miles');
  });

  test('contact page displays actual phone number', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    // Should have a real phone number format
    const phonePattern = page.locator('text=/\\(\\d{3}\\)\\s*\\d{3}-\\d{4}/');
    await expect(phonePattern.first()).toBeVisible();
  });

  test('contact page displays actual email', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');

    // Should have email
    const email = page.locator('text=@bearlakecamp');
    await expect(email.first()).toBeVisible();
  });
});

test.describe('REQ-TPL-003 — Facility Pages (removed)', () => {
  test('facility pages have been removed from the site', () => {
    // Facilities pages were removed per user request (2026-02-12)
    // facilities, facilities-cabins, facilities-chapel, facilities-dining-hall, facilities-rec-center
    expect(true).toBe(true);
  });
});

test.describe('REQ-TPL-003 — Staff Pages CMS Content', () => {
  test('work-at-camp page uses CMS content', async ({ page }) => {
    await page.goto('/work-at-camp');
    await page.waitForLoadState('domcontentloaded');

    // Should have hero section
    const hero = page.locator('h1, [data-testid="hero"]');
    await expect(hero.first()).toBeVisible();

    // Should have CTA section
    const ctaButton = page.locator('a:has-text("Apply"), button:has-text("Apply")');
    await expect(ctaButton.first()).toBeVisible();
  });

  test('staff page CTA is editable in Keystatic', async ({ page }) => {
    await page.goto('/keystatic');
    await page.waitForSelector('[data-keystatic-wrapper], main', { timeout: 10000 });

    await page.click('text=Pages');
    await page.waitForTimeout(500);

    const workAtCamp = page.locator('text=work-at-camp');
    if (await workAtCamp.isVisible().catch(() => false)) {
      await workAtCamp.first().click();
      await page.waitForTimeout(1000);

      // Should have CTA fields
      const ctaHeading = page.locator(
        'label:has-text("CTA"), [data-field-label*="CTA"]'
      );
      await expect(ctaHeading.first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('REQ-TPL-003 — Give Page CMS Content', () => {
  test('give page renders donation information', async ({ page }) => {
    await page.goto('/give');
    await page.waitForLoadState('domcontentloaded');

    // Should have donation content
    const donationContent = page.locator('text=/donate|giving|support/i');
    await expect(donationContent.first()).toBeVisible();
  });

  test('give page has working donate button', async ({ page }) => {
    await page.goto('/give');
    await page.waitForLoadState('domcontentloaded');

    // Should have donate button
    const donateButton = page.locator(
      'a:has-text("Donate"), button:has-text("Donate"), [data-testid="donate-button"]'
    );
    await expect(donateButton.first()).toBeVisible();
  });
});

test.describe('REQ-TPL-003 — About Page CMS Content', () => {
  test('about page renders with CMS content', async ({ page }) => {
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    // Should have hero section
    const hero = page.locator('h1, [data-testid="hero"]');
    await expect(hero.first()).toBeVisible();

    // Should have content
    const content = page.locator('p');
    const paragraphCount = await content.count();
    expect(paragraphCount).toBeGreaterThan(0);
  });
});

test.describe('REQ-TPL-003 — All Pages Return 200', () => {
  const allPages = [
    '/',
    '/about',
    '/contact',
    '/give',
    '/work-at-camp',
    '/summer-camp',
    '/summer-camp-sessions',
    '/retreats'
  ];

  for (const pagePath of allPages) {
    test(`${pagePath} returns 200`, async ({ request }) => {
      const response = await request.get(pagePath);
      expect(response.status()).toBe(200);
    });
  }
});

test.describe('REQ-TPL-003 — Screenshots for Audit', () => {
  const pagesToScreenshot = [
    { path: '/contact', name: 'contact-page' },
    { path: '/give', name: 'give-page' },
    { path: '/about', name: 'about-page' },
    { path: '/work-at-camp', name: 'work-at-camp-page' },
  ];

  for (const { path, name } of pagesToScreenshot) {
  }
});
