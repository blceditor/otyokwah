/**
 * Tests for slug validation utilities
 * P0-SEC-003: Path traversal prevention
 */

import { describe, it, expect } from 'vitest';
import { isValidSlug, sanitizeSlug } from './validate-slug';

describe('isValidSlug', () => {
  it('P0-SEC-003 — accepts valid slugs with alphanumeric and dashes', () => {
    expect(isValidSlug('about-us')).toBe(true);
    expect(isValidSlug('contact')).toBe(true);
    expect(isValidSlug('page-123')).toBe(true);
    expect(isValidSlug('index')).toBe(true);
  });

  it('P0-SEC-003 — accepts slugs with underscores', () => {
    expect(isValidSlug('about_us')).toBe(true);
    expect(isValidSlug('junior_high')).toBe(true);
  });

  it('P0-SEC-003 — rejects path traversal with double dots', () => {
    expect(isValidSlug('../etc/passwd')).toBe(false);
    expect(isValidSlug('../../etc/passwd')).toBe(false);
    expect(isValidSlug('page..txt')).toBe(false);
  });

  it('P0-SEC-003 — rejects slugs with forward slashes', () => {
    expect(isValidSlug('pages/about')).toBe(false);
    expect(isValidSlug('/etc/passwd')).toBe(false);
  });

  it('P0-SEC-003 — rejects slugs with backslashes', () => {
    expect(isValidSlug('pages\\about')).toBe(false);
    expect(isValidSlug('C:\\Windows\\System32')).toBe(false);
  });

  it('P0-SEC-003 — rejects slugs with special characters', () => {
    expect(isValidSlug('page%20name')).toBe(false);
    expect(isValidSlug('page name')).toBe(false);
    expect(isValidSlug('page$name')).toBe(false);
    expect(isValidSlug('page@name')).toBe(false);
  });

  it('P0-SEC-003 — rejects empty slugs', () => {
    expect(isValidSlug('')).toBe(false);
  });

  it('P0-SEC-003 — case insensitive (allows uppercase)', () => {
    expect(isValidSlug('AboutUs')).toBe(true);
    expect(isValidSlug('CONTACT')).toBe(true);
  });
});

describe('sanitizeSlug', () => {
  it('P0-SEC-003 — returns valid slug unchanged', () => {
    expect(sanitizeSlug('about-us')).toBe('about-us');
    expect(sanitizeSlug('contact')).toBe('contact');
  });

  it('P0-SEC-003 — throws on path traversal attempts', () => {
    expect(() => sanitizeSlug('../etc/passwd')).toThrow('Path traversal attempt detected');
    expect(() => sanitizeSlug('../../etc/passwd')).toThrow('Path traversal attempt detected');
  });

  it('P0-SEC-003 — removes dangerous characters', () => {
    expect(sanitizeSlug('page name')).toBe('pagename');
    expect(sanitizeSlug('page/name')).toBe('pagename');
    expect(sanitizeSlug('page%20name')).toBe('page20name');
  });

  it('P0-SEC-003 — preserves dashes and underscores', () => {
    expect(sanitizeSlug('about-us')).toBe('about-us');
    expect(sanitizeSlug('junior_high')).toBe('junior_high');
  });

  it('P0-SEC-003 — throws when no valid characters remain', () => {
    expect(() => sanitizeSlug('$$$')).toThrow('Invalid slug: no valid characters remaining');
    expect(() => sanitizeSlug('///')).toThrow('Invalid slug: no valid characters remaining');
  });

  it('P0-SEC-003 — handles mixed case', () => {
    expect(sanitizeSlug('AboutUs')).toBe('AboutUs');
  });
});
