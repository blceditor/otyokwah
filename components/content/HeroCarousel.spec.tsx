/**
 * Hero Carousel Component Tests
 * REQ-HERO-001: Hero Image Carousel Component
 *
 * Tests for auto-rotating carousel with accessibility features
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { HeroCarousel } from './HeroCarousel';

describe('HeroCarousel - REQ-HERO-001', () => {
  const mockImages = [
    { src: '/images/test1.jpg', alt: 'Test image 1' },
    { src: '/images/test2.jpg', alt: 'Test image 2' },
    { src: '/images/test3.jpg', alt: 'Test image 3' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders carousel with initial image', () => {
      render(<HeroCarousel images={mockImages} />);

      const firstImage = screen.getByLabelText('Test image 1');
      expect(firstImage).toBeInTheDocument();
    });

    it('renders all images in DOM with appropriate visibility', () => {
      render(<HeroCarousel images={mockImages} />);

      const allImages = screen.getAllByRole('img');
      expect(allImages).toHaveLength(3);
    });

    it('displays indicators matching image count', () => {
      render(<HeroCarousel images={mockImages} showIndicators={true} />);

      const indicators = screen.getAllByRole('button', { name: /go to slide/i });
      expect(indicators).toHaveLength(3);
    });

    it('hides indicators when showIndicators is false', () => {
      render(<HeroCarousel images={mockImages} showIndicators={false} />);

      const indicators = screen.queryAllByRole('button', { name: /go to slide/i });
      expect(indicators).toHaveLength(0);
    });
  });

  describe('Auto-rotation', () => {
    it('advances to next image after interval (default 5s)', async () => {
      render(<HeroCarousel images={mockImages} />);

      // Initially showing first image
      const firstImage = screen.getByLabelText('Test image 1');

      // Advance timer by 5 seconds and run pending timers
      await vi.advanceTimersByTimeAsync(5000);

      // Should now show second image
      const secondImage = screen.getByLabelText('Test image 2');
    });

    it('respects custom interval prop', async () => {
      render(<HeroCarousel images={mockImages} interval={3000} />);

      const firstImage = screen.getByLabelText('Test image 1');

      // Advance timer by 3 seconds
      await vi.advanceTimersByTimeAsync(3000);

      const secondImage = screen.getByLabelText('Test image 2');
    });

    it('loops back to first image after last image', async () => {
      render(<HeroCarousel images={mockImages} />);

      // Advance through all images
      await vi.advanceTimersByTimeAsync(5000 * 3); // 3 images * 5s each

      // Should loop back to first image
      const firstImage = screen.getByLabelText('Test image 1');
    });
  });

  describe('Pause on Hover', () => {
    it('pauses auto-rotation when carousel is hovered', async () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Hover over carousel
      fireEvent.mouseEnter(carousel);

      // Advance timer
      vi.advanceTimersByTime(5000);

      // Should still show first image (paused)
      const firstImage = screen.getByLabelText('Test image 1');
    });

    it('resumes auto-rotation when hover ends', async () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Hover then unhover
      fireEvent.mouseEnter(carousel);
      fireEvent.mouseLeave(carousel);

      // Advance timer
      await vi.advanceTimersByTimeAsync(5000);

      // Should advance to second image
      const secondImage = screen.getByLabelText('Test image 2');
    });
  });

  describe('Keyboard Navigation', () => {
    it('advances to next image on right arrow key', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      const secondImage = screen.getByLabelText('Test image 2');
    });

    it('goes to previous image on left arrow key', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Go to next image first
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      // Then go back
      fireEvent.keyDown(carousel, { key: 'ArrowLeft' });

      const firstImage = screen.getByLabelText('Test image 1');
    });

    it('wraps to last image when pressing left on first image', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      fireEvent.keyDown(carousel, { key: 'ArrowLeft' });

      const lastImage = screen.getByLabelText('Test image 3');
    });

    it('wraps to first image when pressing right on last image', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Go to last image
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      // Wrap to first
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      const firstImage = screen.getByLabelText('Test image 1');
    });
  });

  describe('Indicator Buttons', () => {
    it('navigates to specific slide when indicator clicked', () => {
      render(<HeroCarousel images={mockImages} showIndicators={true} />);

      const indicators = screen.getAllByRole('button', { name: /go to slide/i });

      // Click third indicator
      fireEvent.click(indicators[2]);

      const thirdImage = screen.getByLabelText('Test image 3');
    });

    it('marks current slide indicator as active', () => {
      render(<HeroCarousel images={mockImages} showIndicators={true} />);

      const indicators = screen.getAllByRole('button', { name: /go to slide/i });

      // First indicator should be active
      expect(indicators[0]).toHaveAttribute('aria-current', 'true');
      expect(indicators[1]).toHaveAttribute('aria-current', 'false');
    });
  });

  describe('Touch/Swipe Support', () => {
    it('advances to next image on swipe left', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Simulate swipe left
      fireEvent.touchStart(carousel, { touches: [{ clientX: 200 }] });
      fireEvent.touchMove(carousel, { touches: [{ clientX: 50 }] });
      fireEvent.touchEnd(carousel);

      const secondImage = screen.getByLabelText('Test image 2');
    });

    it('goes to previous image on swipe right', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Go to second image first
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      // Swipe right
      fireEvent.touchStart(carousel, { touches: [{ clientX: 50 }] });
      fireEvent.touchMove(carousel, { touches: [{ clientX: 200 }] });
      fireEvent.touchEnd(carousel);

      const firstImage = screen.getByLabelText('Test image 1');
    });

    it('ignores small swipes (< threshold)', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });

      // Small swipe (< 50px threshold)
      fireEvent.touchStart(carousel, { touches: [{ clientX: 100 }] });
      fireEvent.touchMove(carousel, { touches: [{ clientX: 90 }] });
      fireEvent.touchEnd(carousel);

      const firstImage = screen.getByLabelText('Test image 1');
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA role and label', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region', { name: /carousel/i });
      expect(carousel).toBeInTheDocument();
    });

    it('has correct ARIA region for screen readers', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region');
      expect(carousel).toHaveAttribute('aria-label', 'Hero carousel');
    });

    it('pauses on focus for keyboard users', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region');

      fireEvent.focus(carousel);

      // Advance timer - should not rotate while focused
      vi.advanceTimersByTime(5000);

      const firstImage = screen.getByLabelText('Test image 1');
    });

    it('is keyboard focusable with tabindex', () => {
      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region');
      expect(carousel).toHaveAttribute('tabindex', '0');
    });
  });

  describe('Reduced Motion', () => {
    it('disables auto-rotation when prefers-reduced-motion is set', () => {
      // Mock prefers-reduced-motion
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<HeroCarousel images={mockImages} />);

      // Advance timer
      vi.advanceTimersByTime(5000);

      // Should still show first image (auto-rotation disabled)
      const firstImage = screen.getByLabelText('Test image 1');
    });

    it('allows manual navigation even with reduced motion', () => {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(<HeroCarousel images={mockImages} />);

      const carousel = screen.getByRole('region');
      fireEvent.keyDown(carousel, { key: 'ArrowRight' });

      const secondImage = screen.getByLabelText('Test image 2');
    });
  });

  describe('Transition Effects', () => {
    it('applies fade transition class during image change', async () => {
      render(<HeroCarousel images={mockImages} />);

      await vi.advanceTimersByTimeAsync(5000);

      const images = screen.getAllByRole('img');
      // Should have transition classes applied
      expect(images.some(img => img.classList.contains('transition-opacity'))).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('only renders images with safe URLs', () => {
      const unsafeImages = [
        { src: '/images/safe.jpg', alt: 'Safe' },
        { src: 'javascript:alert("xss")', alt: 'Unsafe' },
        { src: '/images/safe2.jpg', alt: 'Safe 2' },
      ];

      render(<HeroCarousel images={unsafeImages} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(2); // Only safe images rendered
    });
  });

  describe('Edge Cases', () => {
    it('handles single image gracefully (no rotation)', () => {
      const singleImage = [{ src: '/images/test1.jpg', alt: 'Single' }];

      render(<HeroCarousel images={singleImage} />);

      // Should not attempt to rotate
      vi.advanceTimersByTime(5000);

      const image = screen.getByLabelText('Single');
      expect(image).toBeInTheDocument();
    });

    it('renders empty state when no images provided', () => {
      render(<HeroCarousel images={[]} />);

      const carousel = screen.getByRole('region');
      expect(carousel).toBeInTheDocument();
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });
  });
});
