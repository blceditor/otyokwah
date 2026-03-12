/**
 * REQ-OP002, REQ-OP003: Give Page Tests
 *
 * Tests for Give page content structure and wishlist links
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('REQ-OP002 — Give Page Styling', () => {
  test('give.mdoc uses Markdoc components for visual layout', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    // Uses squareGrid, gridSquare, ctaButton, ctaSection
    const hasGridComponent =
      giveMdoc.includes('squareGrid') ||
      giveMdoc.includes('gridSquare');

    expect(hasGridComponent).toBe(true);
  });

  test('give.mdoc breaks content into logical sections', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    // Should have multiple section headings (##)
    const sectionMatches = giveMdoc.match(/^##\s+/gm);
    const sectionCount = sectionMatches ? sectionMatches.length : 0;

    expect(sectionCount).toBeGreaterThanOrEqual(2);
  });

  test('give.mdoc has visual hierarchy with proper spacing', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    // Should have significant component usage
    const componentCount = (giveMdoc.match(/{% \w+/g) || []).length;

    expect(componentCount).toBeGreaterThanOrEqual(5);
  });
});

describe('REQ-OP003 — Give Page Wishlist Links', () => {
  test('give.mdoc includes Amazon wishlist link', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    expect(giveMdoc).toMatch(/amazon|Amazon/i);
  });

  test('wishlist section has clear visual CTAs', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    // Uses ctaButton components for CTAs
    const hasButtonComponent = giveMdoc.includes('ctaButton');

    expect(hasButtonComponent).toBe(true);
  });
});

describe('REQ-OP004 — Give Page Donation Integration', () => {
  test('give.mdoc includes donation link', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    // Give page uses UltraCamp for donations
    expect(giveMdoc).toMatch(/ultracamp|donation/i);
  });

  test('donation link is in give online CTA', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    expect(giveMdoc).toContain('Give Online');
    expect(giveMdoc).toContain('ultracamp.com');
  });

  test('give page has hero section', () => {
    const giveMdoc = readFileSync(
      join(process.cwd(), 'content/pages/give.mdoc'),
      'utf-8'
    );

    expect(giveMdoc).toContain('heroTagline: Support Camp Ministry');
  });
});
