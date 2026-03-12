/**
 * REQ-OP001: Rentals Page Content Tests
 * Story Points: 0.2 SP
 */

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('REQ-OP001 — Rentals Page Content', () => {
  const rentalsMdoc = readFileSync(
    join(process.cwd(), 'content/pages/rentals.mdoc'),
    'utf-8'
  );

  test('rentals.mdoc includes gallery component', () => {
    expect(rentalsMdoc).toContain('gallery');
  });

  test('rentals.mdoc gallery has facility images', () => {
    expect(rentalsMdoc).toMatch(/image:\s*"/);
  });

  test('rentals.mdoc has CTA sections for rentals', () => {
    expect(rentalsMdoc).toContain('ctaSection');
    expect(rentalsMdoc).toContain('Inquire About Rentals');
  });

  test('rentals.mdoc gallery has at least 3 images', () => {
    const imageMatches = rentalsMdoc.match(/image:\s*"/g);
    const imageCount = imageMatches ? imageMatches.length : 0;
    expect(imageCount).toBeGreaterThanOrEqual(3);
  });
});
