/**
 * Tests for URL validation utilities
 * P1-PE-001 + P0-SEC-004: XSS prevention via URL validation
 */

import { describe, it, expect } from 'vitest';
import { isSafeImageUrl, isSafeLinkUrl } from './validate-url';

describe('isSafeImageUrl', () => {
  it('P0-SEC-004 — accepts relative paths starting with /', () => {
    expect(isSafeImageUrl('/images/hero.jpg')).toBe(true);
    expect(isSafeImageUrl('/assets/photo.png')).toBe(true);
  });

  it('P0-SEC-004 — accepts HTTPS URLs', () => {
    expect(isSafeImageUrl('https://example.com/image.jpg')).toBe(true);
    expect(isSafeImageUrl('https://cdn.example.com/photo.png')).toBe(true);
  });

  it('P0-SEC-004 — rejects javascript: scheme', () => {
    expect(isSafeImageUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeImageUrl('JavaScript:void(0)')).toBe(false);
  });

  it('P0-SEC-004 — rejects data: scheme', () => {
    expect(isSafeImageUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isSafeImageUrl('data:image/svg+xml,<svg></svg>')).toBe(false);
  });

  it('P0-SEC-004 — rejects HTTP URLs (not secure)', () => {
    expect(isSafeImageUrl('http://example.com/image.jpg')).toBe(false);
  });

  it('P0-SEC-004 — rejects vbscript: scheme', () => {
    expect(isSafeImageUrl('vbscript:msgbox')).toBe(false);
  });

  it('P0-SEC-004 — rejects file: scheme', () => {
    expect(isSafeImageUrl('file:///etc/passwd')).toBe(false);
  });

  it('P0-SEC-004 — rejects blob: scheme', () => {
    expect(isSafeImageUrl('blob:http://example.com/uuid')).toBe(false);
  });

  it('P0-SEC-004 — rejects undefined', () => {
    expect(isSafeImageUrl(undefined)).toBe(false);
  });

  it('P0-SEC-004 — rejects empty string', () => {
    expect(isSafeImageUrl('')).toBe(false);
  });
});

describe('isSafeLinkUrl', () => {
  it('P0-SEC-004 — accepts HTTP URLs', () => {
    expect(isSafeLinkUrl('http://example.com')).toBe(true);
  });

  it('P0-SEC-004 — accepts HTTPS URLs', () => {
    expect(isSafeLinkUrl('https://example.com')).toBe(true);
  });

  it('P0-SEC-004 — accepts mailto: links', () => {
    expect(isSafeLinkUrl('mailto:info@example.com')).toBe(true);
  });

  it('P0-SEC-004 — accepts tel: links', () => {
    expect(isSafeLinkUrl('tel:+1234567890')).toBe(true);
  });

  it('P0-SEC-004 — accepts relative paths', () => {
    expect(isSafeLinkUrl('/about')).toBe(true);
    expect(isSafeLinkUrl('../contact')).toBe(true);
    expect(isSafeLinkUrl('page')).toBe(true);
  });

  it('P0-SEC-004 — rejects javascript: scheme', () => {
    expect(isSafeLinkUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeLinkUrl('JavaScript:void(0)')).toBe(false);
    expect(isSafeLinkUrl('JAVASCRIPT:alert("XSS")')).toBe(false);
  });

  it('P0-SEC-004 — rejects data: scheme', () => {
    expect(isSafeLinkUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('P0-SEC-004 — rejects vbscript: scheme', () => {
    expect(isSafeLinkUrl('vbscript:msgbox')).toBe(false);
    expect(isSafeLinkUrl('VBScript:msgbox')).toBe(false);
  });

  it('P0-SEC-004 — rejects file: scheme', () => {
    expect(isSafeLinkUrl('file:///etc/passwd')).toBe(false);
  });

  it('P0-SEC-004 — rejects blob: scheme', () => {
    expect(isSafeLinkUrl('blob:http://example.com/uuid')).toBe(false);
  });

  it('P0-SEC-004 — rejects undefined', () => {
    expect(isSafeLinkUrl(undefined)).toBe(false);
  });

  it('P0-SEC-004 — rejects empty string', () => {
    expect(isSafeLinkUrl('')).toBe(false);
  });

  it('P0-SEC-004 — handles case insensitivity for dangerous schemes', () => {
    expect(isSafeLinkUrl('JaVaScRiPt:alert(1)')).toBe(false);
    expect(isSafeLinkUrl('DATA:text/html,test')).toBe(false);
  });
});
