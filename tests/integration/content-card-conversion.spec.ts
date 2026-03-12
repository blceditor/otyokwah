// REQ-CONTENT-004 through REQ-CONTENT-008: Content Layout Tests
// Test Guardian: Updated 2026-02-13 to match current squareGrid/gridSquare layouts
// Pages converted from InfoCard/ContentCard → squareGrid/gridSquare per BLC Fixes

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('REQ-CONTENT-004 — Retreats Page Layout', () => {
  const retreatsPath = join(process.cwd(), 'content', 'pages', 'retreats.mdoc');

  test('retreats page file exists', () => {
    expect(() => readFileSync(retreatsPath, 'utf-8')).not.toThrow();
  });

  test('retreats page uses fullbleed template', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toContain('discriminant: fullbleed');
  });

  test('retreats page uses squareGrid/gridSquare layout', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/squareGrid/);
    expect(content).toMatch(/gridSquare/);
  });

  test('retreats page has links to Defrost and Recharge', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/Defrost|defrost/);
    expect(content).toMatch(/Recharge|recharge/);
  });

  test('retreats page has CTA section', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/ctaSection/);
  });

  test('page maintains hero image', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/hero/i);
    expect(content).toMatch(/heroImage/);
  });

  test('retreats page has testimonial widget', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/testimonialWidget/);
  });
});

// REQ-CONTENT-005: Facilities pages removed (2026-02-12, commit 608f00b)

describe('REQ-CONTENT-006 — About Page Layout', () => {
  const aboutPath = join(process.cwd(), 'content', 'pages', 'about.mdoc');

  test('about page file exists', () => {
    expect(() => readFileSync(aboutPath, 'utf-8')).not.toThrow();
  });

  test('no braces "{}" artifacts in headings', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    const lines = content.split('\n');
    const headingLines = lines.filter((line) => line.startsWith('#'));

    headingLines.forEach((heading) => {
      expect(heading).not.toMatch(/\{\}/);
      expect(heading).not.toMatch(/\{[^%]/);
    });
  });

  test('no braces in paragraph content', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    const invalidBraces = content.match(/[^%]\{\}|\{\}[^%]/g);
    expect(invalidBraces).toBeNull();
  });

  test('Our Values section has core values listed', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    expect(content).toMatch(/Christ-Centered/i);
    expect(content).toMatch(/Community/i);
    expect(content).toMatch(/Creation/i);
    expect(content).toMatch(/Character/i);
  });

  test('page maintains hero image', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    expect(content).toMatch(/hero/i);
  });

  test('mission statement is visible and not obscured by braces', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    expect(content).toMatch(/mission/i);
    expect(content).not.toMatch(/\{\}.*mission|\{\}.*Mission/i);
  });

  test('Markdoc syntax is valid (no unclosed tags)', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    const openingTags = (content.match(/{%\s*\w+/g) || []).length;
    const closingTags = (content.match(/{%\s*\/\w+/g) || []).length;
    expect(Math.abs(openingTags - closingTags)).toBeLessThanOrEqual(1);
  });
});

describe('REQ-CONTENT-007 — Give Page Layout', () => {
  const givePath = join(process.cwd(), 'content', 'pages', 'give.mdoc');

  test('give page file exists', () => {
    expect(() => readFileSync(givePath, 'utf-8')).not.toThrow();
  });

  test('give page uses fullbleed template', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toContain('discriminant: fullbleed');
  });

  test('give page uses squareGrid/gridSquare layout', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/squareGrid/);
    expect(content).toMatch(/gridSquare/);
  });

  test('give page has online giving CTA', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/Give Online|Give Now|Donate/i);
  });

  test('give page links to UltraCamp', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/ultracamp\.com/);
  });

  test('give page has ctaButton components', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/ctaButton/);
  });

  test('give page has mailing address for donations', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/Albion/);
    expect(content).toMatch(/46701/);
  });

  test('give page has dollar impact amounts', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/\$\d+/);
  });

  test('give page has CTA section', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/ctaSection/);
  });

  test('give page has testimonial widget', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/testimonialWidget/);
  });
});

describe('REQ-CONTENT-008 — Contact Page', () => {
  const contactPath = join(process.cwd(), 'content', 'pages', 'contact.mdoc');

  test('contact page file exists', () => {
    expect(() => readFileSync(contactPath, 'utf-8')).not.toThrow();
  });

  test('contact page has ContactForm component', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toMatch(/ContactForm/);
  });

  test('phone number is present', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toMatch(/260-799-5988/);
  });

  test('email address is correct', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toContain('info@bearlakecamp.com');
  });

  test('email is a mailto link', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toMatch(/mailto:info@bearlakecamp\.com/);
  });

  test('mailing address is present', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toContain('Albion');
    expect(content).toContain('IN');
    expect(content).toContain('46701');
  });

  test('no placeholder text visible', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).not.toMatch(/\[Address Line|XXX|placeholder/i);
  });
});
