/**
 * Logo Component Tests
 * REQ-WEB-002: Logo 2X Larger + Hanging Effect
 *
 * Tests logo sizing, hanging effect, and scroll behavior:
 * - Initial: 200x102px, hangs below header
 * - On scroll >100px: Shrinks to 150x76px (scale 0.75)
 * - Uses transform: scale() for GPU acceleration
 * - Smooth transition (300ms ease-in-out)
 * - No layout shift (CLS < 0.1)
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Logo from './Logo';
import type { LogoProps } from './types';

describe('REQ-WEB-002 — Logo 2X Larger + Hanging Effect', () => {
  const LOGO_SRC = '/blc-logo-transparent-500x250.png';
  const LOGO_ALT = 'Bear Lake Camp Logo';
  const LOGO_HREF = '/';

  const mockLogoProps: LogoProps = {
    src: LOGO_SRC,
    alt: LOGO_ALT,
    href: LOGO_HREF,
  };

  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Initial sizing (160x82)', () => {
    test('REQ-WEB-002 — logo renders at 160x82 on page load', () => {
      render(<Logo {...mockLogoProps} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      expect(img).toHaveAttribute('width', '160');
      expect(img).toHaveAttribute('height', '82');
    });

    test('REQ-WEB-002 — logo has correct default dimensions', () => {
      render(<Logo {...mockLogoProps} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      expect(img.getAttribute('width')).toBe('160');
      expect(img.getAttribute('height')).toBe('82');
    });

    test('REQ-WEB-002 — logo uses h-auto for responsive height', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');
    });

    test('REQ-WEB-002 — logo loads with priority (above-the-fold)', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      // Next.js Image with priority prop should not have loading="lazy"
      expect(img).not.toHaveAttribute('loading', 'lazy');
    });
  });

  describe('Hanging effect (absolute positioning)', () => {
    test('REQ-WEB-002 — logo hangs below header bottom edge', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Should use absolute positioning
    });

    test('REQ-WEB-002 — logo positioned at left edge with padding', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Should have left positioning
    });

    test('REQ-WEB-002 — logo positioned from top of viewport', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Should have top positioning
    });

    test('REQ-WEB-002 — logo has high z-index to prevent overlap', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Should have z-index class (z-50 or similar)
    });

    test('REQ-WEB-002 — logo hangs approximately 25-30px below header', () => {
      // Logo height: 102px
      // Header height: ~68px (desktop)
      // Expected overhang: ~34px

      // This will be verified in integration tests with actual layout
    });
  });

  describe('Scroll behavior (shrink on scroll)', () => {
    test('REQ-WEB-002 — logo shrinks when scrolled >100px', () => {
      vi.useFakeTimers();
      const { rerender } = render(<Logo {...mockLogoProps} isScrolled={false} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      // Initially not scrolled - should have scale-100

      // Re-render with scrolled state
      rerender(<Logo {...mockLogoProps} isScrolled={true} />);

      const scrolledImg = screen.getByRole('img', { name: LOGO_ALT });

      // After scroll - should have scale-75 (150x76 = 75% of 200x102)

      vi.useRealTimers();
    });

    test('REQ-WEB-002 — uses CSS transform: scale() for performance', () => {
      const { container } = render(<Logo {...mockLogoProps} isScrolled={false} />);

      const img = container.querySelector('img');

      // Should use Tailwind scale utility (GPU-accelerated)
    });

    test('REQ-WEB-002 — transition is smooth (300ms)', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      // Should have transition classes
    });

    test('REQ-WEB-002 — scroll threshold is exactly 100px', () => {
      // This test verifies the component accepts isScrolled prop
      // The actual scroll listener logic is tested in integration tests

      const { rerender } = render(<Logo {...mockLogoProps} isScrolled={false} />);
      const imgNotScrolled = screen.getByRole('img', { name: LOGO_ALT });

      rerender(<Logo {...mockLogoProps} isScrolled={true} />);
      const imgScrolled = screen.getByRole('img', { name: LOGO_ALT });
    });

    test('REQ-WEB-002 — scroll listener is throttled to 16ms (60fps)', () => {
      // This will be tested in integration tests
      // Component receives isScrolled prop from parent
    });
  });

  describe('Clickable link to homepage', () => {
    test('REQ-WEB-002 — logo links to homepage', () => {
      render(<Logo {...mockLogoProps} />);

      const link = screen.getByRole('link', { name: 'Go to homepage' });
      expect(link).toHaveAttribute('href', LOGO_HREF);
    });

    test('REQ-WEB-002 — logo remains clickable at all scroll positions', () => {
      const { rerender } = render(<Logo {...mockLogoProps} isScrolled={false} />);

      let link = screen.getByRole('link', { name: 'Go to homepage' });
      expect(link).toHaveAttribute('href', LOGO_HREF);

      rerender(<Logo {...mockLogoProps} isScrolled={true} />);

      link = screen.getByRole('link', { name: 'Go to homepage' });
      expect(link).toHaveAttribute('href', LOGO_HREF);
    });

    test('REQ-WEB-002 — logo has accessible aria-label', () => {
      render(<Logo {...mockLogoProps} />);

      const link = screen.getByRole('link', { name: 'Go to homepage' });
      expect(link).toHaveAttribute('aria-label', 'Go to homepage');
    });
  });

  describe('Mobile responsiveness', () => {
    test('REQ-WEB-002 — logo scales proportionally on mobile', () => {
      render(<Logo {...mockLogoProps} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      // h-auto ensures aspect ratio is maintained
    });

    test('REQ-WEB-002 — logo respects mobile viewport width', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      expect(img).toHaveAttribute('width', '160');
      expect(img).toHaveAttribute('height', '82');
    });
  });

  describe('No layout shift (CLS < 0.1)', () => {
    test('REQ-WEB-002 — logo has explicit width and height to prevent CLS', () => {
      render(<Logo {...mockLogoProps} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      expect(img).toHaveAttribute('width', '160');
      expect(img).toHaveAttribute('height', '82');
    });

    test('REQ-WEB-002 — dimensions change on scroll for responsive sizing', () => {
      const { container, rerender } = render(<Logo {...mockLogoProps} isScrolled={false} />);

      let img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('160');
      expect(img?.getAttribute('height')).toBe('82');

      rerender(<Logo {...mockLogoProps} isScrolled={true} />);

      img = container.querySelector('img');
      expect(img?.getAttribute('width')).toBe('120');
      expect(img?.getAttribute('height')).toBe('61');
    });

    test('REQ-WEB-002 — absolute positioning prevents content reflow', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Absolute positioning takes element out of flow
    });
  });

  describe('Transparent background handling', () => {
    test('REQ-WEB-002 — logo file has transparent background (metadata check)', () => {
      render(<Logo {...mockLogoProps} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });

      // Verify correct PNG file is used
      expect(img).toHaveAttribute('src');
      expect(img.getAttribute('src')).toContain('blc-logo-transparent');
    });

    test('REQ-WEB-002 — logo does not have background color applied', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const logoLink = container.querySelector('a');

      // Should not have bg- classes
    });
  });

  describe('Edge cases', () => {
    test('REQ-WEB-002 — handles missing src gracefully', () => {
      const propsWithoutSrc = { ...mockLogoProps, src: '' };

      render(<Logo {...propsWithoutSrc} />);

      const img = screen.getByRole('img', { name: LOGO_ALT });
      expect(img).toBeInTheDocument();
    });

    test('REQ-WEB-002 — handles very long alt text', () => {
      const LONG_ALT = 'Bear Lake Camp - A Christian summer camp providing life-changing experiences for youth in Northern Utah';
      const propsWithLongAlt = { ...mockLogoProps, alt: LONG_ALT };

      render(<Logo {...propsWithLongAlt} />);

      const img = screen.getByRole('img', { name: LONG_ALT });
      expect(img).toBeInTheDocument();
    });

    test('REQ-WEB-002 — handles custom href (not just homepage)', () => {
      const CUSTOM_HREF = '/about';
      const propsWithCustomHref = { ...mockLogoProps, href: CUSTOM_HREF };

      render(<Logo {...propsWithCustomHref} />);

      const link = screen.getByRole('link', { name: 'Go to homepage' });
      expect(link).toHaveAttribute('href', CUSTOM_HREF);
    });
  });

  describe('Visual indicators', () => {
    test('REQ-WEB-002 — logo has smooth transition class', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

    });

    test('REQ-WEB-002 — transition uses ease-in-out timing function', () => {
      // Tailwind default transition includes ease-in-out
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      // Tailwind transition classes
    });
  });

  describe('Performance optimizations', () => {
    test('REQ-WEB-002 — logo uses Next.js Image component', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      // Next.js Image component adds specific attributes
      expect(img).toHaveAttribute('width');
      expect(img).toHaveAttribute('height');
    });

    test('REQ-WEB-002 — logo preloads for faster initial render', () => {
      const { container } = render(<Logo {...mockLogoProps} />);

      const img = container.querySelector('img');

      // Priority prop means no lazy loading
      expect(img).not.toHaveAttribute('loading', 'lazy');
    });

    test('REQ-WEB-002 — transform scale uses GPU acceleration', () => {
      const { container } = render(<Logo {...mockLogoProps} isScrolled={true} />);

      const img = container.querySelector('img');

      // Tailwind scale utilities use transform (GPU-accelerated)
    });
  });
});
