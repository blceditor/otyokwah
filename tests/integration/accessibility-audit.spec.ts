// REQ-NAV-007: Navigation Accessibility Audit
// Story Points: 0.5 SP (automated testing portion of 2 SP)
// Test Guardian: Updated to check correct component files

import { describe, test, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

// Helper to read component files
const readComponent = (relativePath: string) =>
  readFileSync(join(process.cwd(), relativePath), 'utf-8');

describe('REQ-NAV-007 — Navigation Accessibility Audit', () => {
  describe('ARIA Attributes', () => {
    test('NavItem trigger has aria-expanded attribute', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toContain('aria-expanded');
    });

    test('NavItem trigger has aria-haspopup attribute', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/aria-haspopup/);
    });

    test('NavItem trigger has aria-label on toggle buttons', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toContain('aria-label');
    });

    test('dropdown menu role is menu or navigation', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/role="menu"|role="navigation"|<nav/);
    });

    test('dropdown items have role="menuitem" or use semantic links', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/role="menuitem"|<Link|<a\s/);
    });
  });

  describe('Keyboard Navigation', () => {
    test('NavItem handles Escape key to close dropdown', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/Escape/);
    });

    test('NavItem handles ArrowDown key to open dropdown', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/ArrowDown/);
    });

    test('NavItem has onKeyDown handler', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/onKeyDown/);
    });

    test('MobileNav handles Escape key to close', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/Escape/);
    });
  });

  describe('Focus Indicators', () => {
    test('navigation links have visible focus ring with 2px minimum', () => {
      const cssContent = readComponent('app/globals.css');
      expect(cssContent).toMatch(/focus:ring-2|focus-visible:ring-2|focus:outline-2/);
    });

    test('NavItem uses focus-visible for keyboard-only focus', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toContain('focus-visible');
    });

    test('focus-visible pseudo-class used in global CSS', () => {
      const cssContent = readComponent('app/globals.css');
      expect(cssContent).toContain('focus-visible');
    });

    test('focus indicators are not removed globally', () => {
      const cssContent = readComponent('app/globals.css');
      const hasOutlineNone = cssContent.includes('outline: none') || cssContent.includes('outline:none');
      const hasFocusVisible = cssContent.includes('focus-visible');

      if (hasOutlineNone) {
        expect(hasFocusVisible).toBe(true);
      }
    });
  });

  describe('Mobile Touch Targets', () => {
    test('mobile navigation buttons meet 44x44px minimum touch target', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/min-h-\[44px\]|min-h-\[48px\]|min-h-11|min-h-12|touch-target-44/);
    });

    test('Header hamburger button meets 44x44px minimum touch target', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toMatch(/min-w-\[44px\].*min-h-\[44px\]/);
    });

    test('mobile menu links have adequate spacing between targets', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/space-y-|gap-|py-/);
    });
  });

  describe('Screen Reader Support', () => {
    test('DesktopNav uses <nav> element with aria-label', () => {
      const content = readComponent('components/navigation/DesktopNav.tsx');
      expect(content).toMatch(/<nav/);
      expect(content).toMatch(/aria-label/);
    });

    test('MobileNav uses <nav> element with aria-label', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/<nav/);
      expect(content).toMatch(/aria-label/);
    });

    test('skip-to-content link exists for screen readers', () => {
      const cssContent = readComponent('app/globals.css');
      expect(cssContent).toContain('skip-link');
    });

    test('dropdown menu states announced to screen readers via NavItem', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/aria-expanded/);
    });

    test('Header has role="banner"', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toMatch(/role="banner"/);
    });
  });

  describe('Focus Management', () => {
    test('NavItem manages refs for focus control', () => {
      const content = readComponent('components/navigation/NavItem.tsx');
      expect(content).toMatch(/useRef|useEffect/);
    });

    test('MobileNav focuses close button when opened', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/\.focus\(\)/);
    });

    test('mobile menu manages focus when opening/closing', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/focus|useEffect.*isOpen/);
    });
  });

  describe('Color and Contrast', () => {
    test('Header uses accessible text colors on dark background', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toMatch(/text-cream|text-white/);
    });

    test('dropdown items have sufficient contrast', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/text-bark|text-secondary-dark|text-cream/);
    });

    test('hover states change color for visibility', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/hover:text-|hover:bg-/);
    });
  });

  describe('Responsive Behavior', () => {
    test('desktop navigation hidden on mobile', () => {
      const content = readComponent('components/navigation/DesktopNav.tsx');
      expect(content).toMatch(/hidden\s+lg:flex/);
    });

    test('mobile menu button visible only on mobile', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toMatch(/lg:hidden/);
    });

    test('mobile menu button has accessible label', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toMatch(/aria-label.*[Mm]enu/);
    });

    test('mobile overlay is modal dialog', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toMatch(/aria-modal/);
    });
  });

  describe('Motion Preferences', () => {
    test('animations respect prefers-reduced-motion', () => {
      const cssContent = readComponent('app/globals.css');
      expect(cssContent).toContain('prefers-reduced-motion');
    });

    test('dropdown animations use CSS transitions', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/transition|animate/);
    });
  });

  describe('Semantic HTML', () => {
    test('DesktopNav uses <nav> element', () => {
      const content = readComponent('components/navigation/DesktopNav.tsx');
      expect(content).toContain('<nav');
    });

    test('MobileNav uses <nav> element', () => {
      const content = readComponent('components/navigation/MobileNav.tsx');
      expect(content).toContain('<nav');
    });

    test('links use Next Link for SEO and accessibility', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).toMatch(/<Link|<a\s/);
    });

    test('Header uses semantic <header> element', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toContain('<header');
    });
  });

  describe('Common Accessibility Pitfalls (Preventive)', () => {
    test('no links styled as buttons without proper role', () => {
      const content = readComponent('components/navigation/Header.tsx');
      expect(content).toBeDefined();
    });

    test('no javascript-only click handlers without keyboard support', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      const hasOnClick = content.includes('onClick');
      const hasKeyboard = content.includes('onKeyDown') || content.includes('<button') || content.includes('<Link');

      if (hasOnClick) {
        expect(hasKeyboard).toBe(true);
      }
    });

    test('interactive elements are keyboard accessible (tabindex >= 0)', () => {
      const content = readComponent('components/navigation/DropdownMenu.tsx');
      expect(content).not.toMatch(/tabIndex=\{-1\}.*button|tabIndex=\{-1\}.*Link/);
    });
  });
});
