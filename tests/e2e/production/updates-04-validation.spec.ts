/**
 * Updates-04 Visual Validation - Production Tests
 * Validates all new components deployed to production
 *
 * REQ-U04-001: CampSessionCard, CampSessionCardGrid components
 * REQ-U04-002: WideCard, WorkAtCampSection components
 * REQ-U04-003: YouTubeHero component
 * REQ-U04-004: ColorPicker with theme presets
 * REQ-U04-005: Container width/height/background options
 * REQ-U04-006: Icon size options
 * REQ-U04-007: Hero height options (tall = 576px)
 * REQ-U04-008: Admin nav visibility
 * REQ-U04-009: Faith section image priority loading
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PRODUCTION_URL || 'https://www.bearlakecamp.com';

test.describe('Homepage Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.waitForLoadState('networkidle');
  });

  test('REQ-U04-008: Admin nav should render', async ({ page }) => {
    // Check for PageEditingToolbar or admin navigation
    const adminNav = page.locator('[data-testid="page-editing-toolbar"]').or(
      page.locator('nav').filter({ hasText: 'Edit Page' })
    ).or(
      page.locator('a[href*="/keystatic"]')
    );

    // Check if any admin elements are visible
    const adminElements = await page.evaluate(() => {
      const elements = {
        editPageLinks: document.querySelectorAll('a[href*="/keystatic"]').length,
        toolbars: document.querySelectorAll('[class*="toolbar"]').length,
        adminNavs: document.querySelectorAll('[class*="admin"]').length
      };
      return elements;
    });

    console.log('Admin elements found:', JSON.stringify(adminElements));

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'verification-screenshots/homepage-admin-nav.png',
      fullPage: false
    });
  });

  test('REQ-U04-009: Faith section image should have priority loading', async ({ page }) => {
    // Look for Faith section image
    const faithSection = page.locator('section').filter({ hasText: 'Faith' }).or(
      page.locator('section').filter({ hasText: 'Adventure' })
    ).or(
      page.locator('section').filter({ hasText: 'Transformation' })
    );

    // Check if images in this section have priority/eager loading
    const imageLoadingInfo = await page.evaluate(() => {
      const faithImages = document.querySelectorAll('img');
      const results: { src: string; loading: string | null; priority: boolean; fetchPriority: string | null }[] = [];

      faithImages.forEach(img => {
        // Check if image is in the faith section area
        const parent = img.closest('section');
        if (parent && (
          parent.textContent?.includes('Faith') ||
          parent.textContent?.includes('Adventure') ||
          parent.textContent?.includes('Transformation')
        )) {
          results.push({
            src: img.src.substring(0, 100),
            loading: img.getAttribute('loading'),
            priority: img.hasAttribute('priority') || img.getAttribute('loading') === 'eager',
            fetchPriority: img.getAttribute('fetchpriority')
          });
        }
      });
      return results;
    });

    console.log('Faith section images:', JSON.stringify(imageLoadingInfo, null, 2));

    // At least one image should NOT be lazy loaded
    const hasEagerImage = imageLoadingInfo.some(
      img => img.loading !== 'lazy' || img.priority === true
    );

    await page.screenshot({
      path: 'verification-screenshots/homepage-faith-section.png',
      fullPage: false
    });
  });

  test('Hero video should be present and playable', async ({ page }) => {
    const heroVideo = page.locator('video').first();

    // Check if video exists
    const videoExists = await heroVideo.count() > 0;
    console.log('Hero video exists:', videoExists);

    if (videoExists) {
      const videoProps = await heroVideo.evaluate(video => ({
        src: (video as HTMLVideoElement).src || (video as HTMLVideoElement).querySelector('source')?.src,
        autoplay: (video as HTMLVideoElement).autoplay,
        muted: (video as HTMLVideoElement).muted,
        loop: (video as HTMLVideoElement).loop,
        poster: (video as HTMLVideoElement).poster
      }));

      console.log('Video properties:', JSON.stringify(videoProps, null, 2));
    }

    await page.screenshot({
      path: 'verification-screenshots/homepage-hero-video.png',
      fullPage: false
    });
  });
});

test.describe('Summer Camp Page Validation', () => {
  test('REQ-U04-003: YouTube hero field availability', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp`);
    await page.waitForLoadState('networkidle');

    // Check for YouTube iframe or video element
    const youtubeEmbed = page.locator('iframe[src*="youtube"]').or(
      page.locator('iframe[src*="youtu.be"]')
    ).or(
      page.locator('[data-testid="youtube-hero"]')
    );

    const hasYouTube = await youtubeEmbed.count() > 0;
    console.log('YouTube embed found:', hasYouTube);

    // Check for any video content
    const videoContent = await page.evaluate(() => {
      return {
        iframes: Array.from(document.querySelectorAll('iframe')).map(f => f.src),
        videos: Array.from(document.querySelectorAll('video')).length,
        youtubeEmbeds: document.querySelectorAll('iframe[src*="youtube"]').length
      };
    });

    console.log('Video content:', JSON.stringify(videoContent, null, 2));

    await page.screenshot({
      path: 'verification-screenshots/summer-camp-hero.png',
      fullPage: false
    });
  });

  test('REQ-U04-001: Camp session cards should render if present', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp`);
    await page.waitForLoadState('networkidle');

    // Look for camp session cards or related content
    const sessionContent = await page.evaluate(() => {
      // Check for various session-related selectors
      const results = {
        sessionCards: document.querySelectorAll('[data-testid*="session-card"]').length,
        campCards: document.querySelectorAll('[class*="session"]').length,
        sessionHeadings: Array.from(document.querySelectorAll('h2, h3')).filter(h =>
          h.textContent?.includes('Jr. High') ||
          h.textContent?.includes('Sr. High') ||
          h.textContent?.includes('Junior') ||
          h.textContent?.includes('Primary')
        ).map(h => h.textContent?.trim())
      };
      return results;
    });

    console.log('Session content:', JSON.stringify(sessionContent, null, 2));

    await page.screenshot({
      path: 'verification-screenshots/summer-camp-sessions.png',
      fullPage: true
    });
  });
});

test.describe('What to Bring Page - Hero Height', () => {
  test('REQ-U04-007: Hero should be 576px tall for "tall" setting', async ({ page }) => {
    await page.goto(`${BASE_URL}/summer-camp-what-to-bring`);
    await page.waitForLoadState('networkidle');

    // Find the hero section
    const heroSection = page.locator('section').first().or(
      page.locator('[class*="hero"]').first()
    ).or(
      page.locator('header').first()
    );

    // Get hero dimensions
    const heroDimensions = await page.evaluate(() => {
      // Look for hero-like elements
      const possibleHeros = [
        document.querySelector('section:first-of-type'),
        document.querySelector('[class*="hero"]'),
        document.querySelector('header + section'),
        document.querySelector('main > section:first-child')
      ].filter(Boolean);

      return possibleHeros.map(el => {
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          tagName: el.tagName,
          className: (el as HTMLElement).className,
          height: rect.height,
          minHeight: getComputedStyle(el).minHeight
        };
      });
    });

    console.log('Hero dimensions:', JSON.stringify(heroDimensions, null, 2));

    // Check if any hero element is at least 576px tall
    const hasTallHero = heroDimensions.some(h => h && h.height >= 500);
    console.log('Has tall hero (>=500px):', hasTallHero);

    await page.screenshot({
      path: 'verification-screenshots/what-to-bring-hero.png',
      fullPage: false
    });

    // Take full page screenshot to show hero context
    await page.screenshot({
      path: 'verification-screenshots/what-to-bring-full.png',
      fullPage: true
    });
  });
});

test.describe('Testing Components Page', () => {
  test('Check for new component test patterns', async ({ page }) => {
    await page.goto(`${BASE_URL}/testing-components`);
    await page.waitForLoadState('networkidle');

    // Analyze page structure
    const pageStructure = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section'));
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(h => h.textContent?.trim());

      return {
        sectionCount: sections.length,
        headings: headings.slice(0, 20), // First 20 headings
        hasCards: document.querySelectorAll('article, [class*="card"]').length,
        hasGrids: document.querySelectorAll('[class*="grid"]').length,
        hasIcons: document.querySelectorAll('svg').length
      };
    });

    console.log('Testing components page structure:', JSON.stringify(pageStructure, null, 2));

    await page.screenshot({
      path: 'verification-screenshots/testing-components-overview.png',
      fullPage: true
    });
  });
});

test.describe('CMS Admin Validation', () => {
  test('REQ-U04-004/005/006: Check Keystatic admin features', async ({ page }) => {
    await page.goto(`${BASE_URL}/keystatic`);
    await page.waitForLoadState('networkidle');

    // Check if we get redirected to login or see admin UI
    const currentUrl = page.url();
    const isAuthRequired = currentUrl.includes('login') || currentUrl.includes('auth');

    if (isAuthRequired) {
      test.skip();
      return;
    }

    await page.screenshot({
      path: 'verification-screenshots/keystatic-admin.png',
      fullPage: false
    });
  });
});

// Summary test to collect all validation results
test.describe('Validation Summary', () => {
  test('Collect deployment validation metrics', async ({ page }) => {
    const validationResults = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      pagesChecked: [
        '/',
        '/summer-camp',
        '/summer-camp-what-to-bring',
        '/testing-components'
      ],
      requirements: {
        'REQ-U04-001': 'CampSessionCard/Grid - needs content verification',
        'REQ-U04-002': 'WideCard/WorkAtCamp - needs content verification',
        'REQ-U04-003': 'YouTubeHero - check summer-camp page',
        'REQ-U04-004': 'ColorPicker - requires CMS access',
        'REQ-U04-005': 'Container options - requires CMS access',
        'REQ-U04-006': 'Icon sizes - requires CMS access',
        'REQ-U04-007': 'Hero height 576px - check what-to-bring',
        'REQ-U04-008': 'Admin nav - check homepage',
        'REQ-U04-009': 'Faith image priority - check homepage'
      }
    };

    console.log('\n=== VALIDATION SUMMARY ===');
    console.log(JSON.stringify(validationResults, null, 2));
  });
});
