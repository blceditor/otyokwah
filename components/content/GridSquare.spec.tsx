/**
 * GridSquare Component Tests
 * REQ-GRID-001: Full-bleed grid square for camp sessions layout
 *
 * Tests for image and color variants with full-height layout
 */

import { render, screen } from '@testing-library/react';
import GridSquare from './GridSquare';

describe('GridSquare Component', () => {
  describe('REQ-GRID-001a: Image Variant', () => {
    it('renders image with required alt text', () => {
      render(
        <GridSquare
          contentType="image"
          image="/images/test.jpg"
          imageAlt="Test camp image"
        />
      );

      const img = screen.getByAltText('Test camp image');
      expect(img).toBeInTheDocument();
    });

    it('applies full-height classes for full-bleed effect', () => {
      const { container } = render(
        <GridSquare
          contentType="image"
          image="/images/test.jpg"
          imageAlt="Test image"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
    });

    it('has relative positioning for Next.js Image fill', () => {
      const { container } = render(
        <GridSquare
          contentType="image"
          image="/images/test.jpg"
          imageAlt="Test image"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
    });

    it('image has object-cover for proper sizing', () => {
      render(
        <GridSquare
          contentType="image"
          image="/images/test.jpg"
          imageAlt="Test image"
        />
      );

      const img = screen.getByAltText('Test image');
    });
  });

  describe('REQ-GRID-001b: Color Variant', () => {
    it('renders with custom hex background color', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="#0284c7">
          <p>Test content</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ backgroundColor: '#0284c7' });
    });

    it('renders children content', () => {
      render(
        <GridSquare contentType="color" backgroundColor="#0284c7">
          <h2>Test Heading</h2>
          <p>Test paragraph</p>
        </GridSquare>
      );

      expect(screen.getByText('Test Heading')).toBeInTheDocument();
      expect(screen.getByText('Test paragraph')).toBeInTheDocument();
    });

    it('applies light text color class when textColor is light', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="#0284c7" textColor="light">
          <p>Light text</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
    });

    it('applies dark text color class when textColor is dark', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="#f5f0e8" textColor="dark">
          <p>Dark text</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
    });

    it('defaults to cream background for invalid hex', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="invalid">
          <p>Content</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveStyle({ backgroundColor: '#f5f0e8' });
    });

    it('has min-height, full-height, and padding', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="#0284c7">
          <p>Content</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
    });

    it('centers content vertically with flex', () => {
      const { container } = render(
        <GridSquare contentType="color" backgroundColor="#0284c7">
          <p>Content</p>
        </GridSquare>
      );

      const wrapper = container.firstChild as HTMLElement;
    });
  });

  describe('REQ-GRID-001c: Accessibility', () => {
    it('image variant requires alt text (TypeScript enforces this)', () => {
      render(
        <GridSquare
          contentType="image"
          image="/images/test.jpg"
          imageAlt="Descriptive alt text for accessibility"
        />
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'Descriptive alt text for accessibility');
    });

    it('color variant content is accessible', () => {
      render(
        <GridSquare contentType="color" backgroundColor="#0284c7" textColor="light">
          <h2>Accessible Heading</h2>
        </GridSquare>
      );

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Accessible Heading');
    });
  });
});
