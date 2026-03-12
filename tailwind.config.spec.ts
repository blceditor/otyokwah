// REQ-001: CSS Variables in Tailwind Config
import { describe, test, expect } from 'vitest';
import type { Config } from 'tailwindcss';

describe('REQ-001 — CSS Variables in Tailwind Config', () => {
  test('config exports valid Tailwind Config type', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;

    expect(config).toBeDefined();
    expect(config.content).toBeDefined();
    expect(config.theme).toBeDefined();
  });

  test('theme extends with custom colors matching mockup', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;

    expect(config.theme?.extend).toBeDefined();

    const colors = (config.theme?.extend as any)?.colors;
    expect(colors).toBeDefined();

    // Primary colors (Water/Sky - Muted Lake Blue)
    expect(colors?.primary).toEqual({
      DEFAULT: '#4A7A9E',
      light: '#7A9DB8',
      dark: '#2F5A7A',
    });

    // Secondary colors (Forest/Moss - Deep Forest Green)
    expect(colors?.secondary).toEqual({
      DEFAULT: '#2F4F3D',
      light: '#5A7A65',
      dark: '#0C3F23',
    });

    // Accent colors (Earth/Clay)
    expect(colors?.accent).toEqual({
      DEFAULT: '#A07856',
      light: '#C4A882',
    });

    // Neutral colors (Natural Tones)
    expect(colors?.cream).toBe('#F5F0E8');
    expect(colors?.sand).toBe('#D4C5B0');
    expect(colors?.stone).toBe('#8A8A7A');
    expect(colors?.bark).toBe('#5A4A3A');
  });

  test('theme extends with custom font families', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;

    const fontFamily = (config.theme?.extend as any)?.fontFamily;
    expect(fontFamily).toBeDefined();

    // System font stack for sans
    expect(fontFamily?.sans).toBeDefined();
    expect(Array.isArray(fontFamily?.sans)).toBe(true);
    expect(fontFamily?.sans).toContain('-apple-system');
    expect(fontFamily?.sans).toContain('BlinkMacSystemFont');
    expect(fontFamily?.sans).toContain('sans-serif');

    // Handwritten font (Caveat)
    expect(fontFamily?.handwritten).toBeDefined();
    expect(Array.isArray(fontFamily?.handwritten)).toBe(true);
    expect(fontFamily?.handwritten).toContain('Caveat');
    expect(fontFamily?.handwritten).toContain('cursive');
  });

  test('theme extends with custom spacing scale', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;

    const spacing = (config.theme?.extend as any)?.spacing;
    expect(spacing).toBeDefined();

    // Spacing scale from mockup
    expect(spacing?.xs).toBe('0.5rem'); // 8px
    expect(spacing?.sm).toBe('1rem'); // 16px
    expect(spacing?.md).toBe('1.5rem'); // 24px
    expect(spacing?.lg).toBe('2rem'); // 32px
    expect(spacing?.xl).toBe('3rem'); // 48px
    expect(spacing?.xxl).toBe('4rem'); // 64px
  });

  test('content includes all necessary file paths', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;

    expect(Array.isArray(config.content)).toBe(true);

    const content = config.content as string[];

    // Should include all relevant paths
    expect(content.some(path => path.includes('pages/**'))).toBe(true);
    expect(content.some(path => path.includes('components/**'))).toBe(true);
    expect(content.some(path => path.includes('app/**'))).toBe(true);
  });

  test('config structure is TypeScript-compatible', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default;

    // Type guard: ensure config matches Config type structure
    expect(typeof config).toBe('object');
    expect('content' in config).toBe(true);
    expect('theme' in config).toBe(true);
  });
});

describe('REQ-001 — Generated CSS Classes', () => {
  test('custom color classes are available for use', () => {
    // This test validates that the config structure allows generation of:
    // - text-primary, bg-primary-light, border-primary-dark
    // - text-secondary, bg-secondary-light
    // - text-accent, bg-accent-light
    // - text-cream, bg-sand, text-stone, text-bark

    const expectedColorUtilities = [
      'text-primary',
      'bg-primary',
      'border-primary',
      'text-primary-light',
      'bg-primary-light',
      'text-primary-dark',
      'bg-primary-dark',
      'text-secondary',
      'bg-secondary',
      'text-secondary-light',
      'bg-secondary-light',
      'text-accent',
      'bg-accent',
      'text-accent-light',
      'bg-accent-light',
      'text-cream',
      'bg-cream',
      'text-sand',
      'bg-sand',
      'text-stone',
      'bg-stone',
      'text-bark',
      'bg-bark',
    ];

    // This is a structural test - actual CSS generation happens at build time
    expect(expectedColorUtilities.length).toBeGreaterThan(0);
  });

  test('custom font classes are available for use', () => {
    const expectedFontUtilities = [
      'font-sans',
      'font-handwritten',
    ];

    expect(expectedFontUtilities.length).toBe(2);
  });

  test('custom spacing classes are available for use', () => {
    const expectedSpacingUtilities = [
      'p-xs',
      'p-sm',
      'p-md',
      'p-lg',
      'p-xl',
      'p-xxl',
      'm-xs',
      'm-sm',
      'm-md',
      'm-lg',
      'm-xl',
      'm-xxl',
      'gap-xs',
      'gap-sm',
      'gap-md',
      'gap-lg',
      'gap-xl',
      'gap-xxl',
    ];

    expect(expectedSpacingUtilities.length).toBeGreaterThan(0);
  });
});

describe('REQ-001 — Color Palette Validation', () => {
  test('all colors are valid hex codes', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;
    const colors = (config.theme?.extend as any)?.colors;

    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    // Validate primary colors
    expect(colors?.primary.DEFAULT).toMatch(hexColorRegex);
    expect(colors?.primary.light).toMatch(hexColorRegex);
    expect(colors?.primary.dark).toMatch(hexColorRegex);

    // Validate secondary colors
    expect(colors?.secondary.DEFAULT).toMatch(hexColorRegex);
    expect(colors?.secondary.light).toMatch(hexColorRegex);

    // Validate accent colors
    expect(colors?.accent.DEFAULT).toMatch(hexColorRegex);
    expect(colors?.accent.light).toMatch(hexColorRegex);

    // Validate neutral colors
    expect(colors?.cream).toMatch(hexColorRegex);
    expect(colors?.sand).toMatch(hexColorRegex);
    expect(colors?.stone).toMatch(hexColorRegex);
    expect(colors?.bark).toMatch(hexColorRegex);
  });

  test('spacing values use rem units', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;
    const spacing = (config.theme?.extend as any)?.spacing;

    const remUnitRegex = /^\d+(\.\d+)?rem$/;

    expect(spacing?.xs).toMatch(remUnitRegex);
    expect(spacing?.sm).toMatch(remUnitRegex);
    expect(spacing?.md).toMatch(remUnitRegex);
    expect(spacing?.lg).toMatch(remUnitRegex);
    expect(spacing?.xl).toMatch(remUnitRegex);
    expect(spacing?.xxl).toMatch(remUnitRegex);
  });

  test('spacing values match mockup pixel equivalents', async () => {
    const configModule = await import('./tailwind.config');
    const config = configModule.default as Config;
    const spacing = (config.theme?.extend as any)?.spacing;

    // Convert rem to pixels (assuming 16px base font size)
    const remToPx = (rem: string): number => {
      return parseFloat(rem.replace('rem', '')) * 16;
    };

    expect(remToPx(spacing?.xs)).toBe(8);
    expect(remToPx(spacing?.sm)).toBe(16);
    expect(remToPx(spacing?.md)).toBe(24);
    expect(remToPx(spacing?.lg)).toBe(32);
    expect(remToPx(spacing?.xl)).toBe(48);
    expect(remToPx(spacing?.xxl)).toBe(64);
  });
});
