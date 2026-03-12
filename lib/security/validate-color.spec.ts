/**
 * REQ-SEC-001: Color Validation Tests
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isValidHexColor,
  isAllowedTailwindColor,
  sanitizeColorValue,
} from './validate-color';

describe('REQ-SEC-001: Color Validation', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('isValidHexColor', () => {
    test('accepts valid 6-digit hex colors', () => {
      expect(isValidHexColor('#047857')).toBe(true);
      expect(isValidHexColor('#FFFFFF')).toBe(true);
      expect(isValidHexColor('#000000')).toBe(true);
      expect(isValidHexColor('#F5F0E8')).toBe(true);
    });

    test('accepts valid 3-digit hex colors', () => {
      expect(isValidHexColor('#fff')).toBe(true);
      expect(isValidHexColor('#000')).toBe(true);
      expect(isValidHexColor('#ABC')).toBe(true);
    });

    test('rejects invalid hex colors', () => {
      expect(isValidHexColor('047857')).toBe(false);
      expect(isValidHexColor('#GGGGGG')).toBe(false);
      expect(isValidHexColor('#12345')).toBe(false);
      expect(isValidHexColor('#1234567')).toBe(false);
      expect(isValidHexColor('red')).toBe(false);
      expect(isValidHexColor('')).toBe(false);
    });

    test('rejects CSS injection attempts', () => {
      expect(isValidHexColor('expression(alert(1))')).toBe(false);
      expect(isValidHexColor('url(javascript:alert(1))')).toBe(false);
      expect(isValidHexColor('#000;background:url(evil)')).toBe(false);
    });
  });

  describe('isAllowedTailwindColor', () => {
    test('accepts whitelisted Tailwind colors', () => {
      expect(isAllowedTailwindColor('cream')).toBe(true);
      expect(isAllowedTailwindColor('cream/90')).toBe(true);
      expect(isAllowedTailwindColor('accent-light')).toBe(true);
      expect(isAllowedTailwindColor('secondary')).toBe(true);
      expect(isAllowedTailwindColor('bark')).toBe(true);
      expect(isAllowedTailwindColor('forest')).toBe(true);
      expect(isAllowedTailwindColor('transparent')).toBe(true);
    });

    test('rejects non-whitelisted colors', () => {
      expect(isAllowedTailwindColor('red')).toBe(false);
      expect(isAllowedTailwindColor('blue-500')).toBe(false);
      expect(isAllowedTailwindColor('arbitrary-class')).toBe(false);
    });
  });

  describe('sanitizeColorValue', () => {
    test('returns none for undefined/empty values', () => {
      expect(sanitizeColorValue(undefined)).toEqual({ type: 'none', value: '' });
      expect(sanitizeColorValue('')).toEqual({ type: 'none', value: '' });
    });

    test('returns hex type for valid hex colors', () => {
      expect(sanitizeColorValue('#047857')).toEqual({ type: 'hex', value: '#047857' });
      expect(sanitizeColorValue('#fff')).toEqual({ type: 'hex', value: '#fff' });
    });

    test('returns class type for whitelisted Tailwind colors', () => {
      expect(sanitizeColorValue('cream')).toEqual({ type: 'class', value: 'cream' });
      expect(sanitizeColorValue('secondary')).toEqual({ type: 'class', value: 'secondary' });
    });

    test('returns none and logs warning for invalid values', () => {
      expect(sanitizeColorValue('expression(alert(1))')).toEqual({ type: 'none', value: '' });
      expect(consoleWarnSpy).toHaveBeenCalledWith('Invalid color value rejected: expression(alert(1))');
    });

    test('prefers hex over class when valid as both would not overlap', () => {
      // Hex colors like #fff wouldn't match Tailwind class names
      expect(sanitizeColorValue('#fff')).toEqual({ type: 'hex', value: '#fff' });
    });
  });
});
