// REQ-DEPLOY-002: Pre-Deployment Validation Suite
// Validates that deployment infrastructure and configuration exists.
// NOTE: Does NOT run actual build/typecheck/lint commands — those belong in CI/CD.

import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('REQ-DEPLOY-002 — Pre-Deployment Validation Suite', () => {
  describe('Package.json Configuration', () => {
    test('all required scripts exist', () => {
      const packagePath = join(process.cwd(), 'package.json');
      const packageContent = JSON.parse(readFileSync(packagePath, 'utf-8'));

      expect(packageContent.scripts.typecheck).toBeDefined();
      expect(packageContent.scripts.lint).toBeDefined();
      expect(packageContent.scripts.test).toBeDefined();
      expect(packageContent.scripts.build).toBeDefined();
    });
  });

  describe('Accessibility Infrastructure', () => {
    test('accessibility test file exists', () => {
      const a11yTestPath = join(
        process.cwd(),
        'tests',
        'integration',
        'accessibility-audit.spec.ts',
      );

      expect(existsSync(a11yTestPath)).toBe(true);
    });

    test('focus indicators are defined in globals.css', () => {
      const cssPath = join(process.cwd(), 'app', 'globals.css');
      const cssContent = readFileSync(cssPath, 'utf-8');

      expect(cssContent).toMatch(/focus:ring|focus-visible:ring/);
    });

    test('ARIA attributes in navigation components', () => {
      const dropdownPath = join(
        process.cwd(),
        'components',
        'navigation',
        'DropdownMenu.tsx',
      );

      if (existsSync(dropdownPath)) {
        const content = readFileSync(dropdownPath, 'utf-8');
        expect(content).toMatch(/aria-expanded|aria-label|aria-haspopup|aria-orientation|aria-hidden/);
      }
    });
  });

  describe('Error Handling', () => {
    test('404 page exists', () => {
      const notFoundPath = join(process.cwd(), 'app', 'not-found.tsx');
      expect(existsSync(notFoundPath)).toBe(true);
    });

    test('error boundary exists', () => {
      const errorPath = join(process.cwd(), 'app', 'error.tsx');
      expect(existsSync(errorPath)).toBe(true);
    });
  });

  describe('Content Infrastructure', () => {
    test('homepage content exists', () => {
      const indexPath = join(process.cwd(), 'content', 'pages', 'index.mdoc');
      expect(existsSync(indexPath)).toBe(true);
    });

    test('footer component exists', () => {
      const footerPath = join(process.cwd(), 'components', 'footer', 'Footer.tsx');
      expect(existsSync(footerPath)).toBe(true);
    });

    test('navigation config exists', () => {
      const navPath = join(process.cwd(), 'content', 'navigation', 'navigation.yaml');
      expect(existsSync(navPath)).toBe(true);
    });
  });
});
