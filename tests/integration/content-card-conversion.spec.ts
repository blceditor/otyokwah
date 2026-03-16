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

  test('retreats page has links to Ignite', () => {
    const content = readFileSync(retreatsPath, 'utf-8');
    expect(content).toMatch(/Ignite|ignite/);
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

  test('About page links to core values and team', () => {
    const content = readFileSync(aboutPath, 'utf-8');
    expect(content).toMatch(/Core Values/i);
    expect(content).toMatch(/Doctrinal Statement/i);
    expect(content).toMatch(/Our Team/i);
    expect(content).toMatch(/mission/i);
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
    expect(content).toMatch(/Butler/);
    expect(content).toMatch(/44822/);
  });

  test('give page has donation information', () => {
    const content = readFileSync(givePath, 'utf-8');
    expect(content).toMatch(/501\(c\)\(3\)|tax-deductible|donation/i);
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
    expect(content).toMatch(/419.*883.*3854/);
  });

  test('email address is correct', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toContain('info@otyokwah.org');
  });

  test('email is a mailto link', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toMatch(/mailto:info@otyokwah\.org/);
  });

  test('mailing address is present', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).toContain('Butler');
    expect(content).toContain('OH');
    expect(content).toContain('44822');
  });

  test('no placeholder text visible', () => {
    const content = readFileSync(contactPath, 'utf-8');
    expect(content).not.toMatch(/\[Address Line|XXX|placeholder/i);
  });
});
