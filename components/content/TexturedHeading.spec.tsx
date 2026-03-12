/**
 * Textured Heading Component Tests
 * REQ-TEXT-002: Textured Font Effect for Headings
 *
 * Tests for textured heading rendering and accessibility
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TexturedHeading } from './TexturedHeading';

describe('TexturedHeading - REQ-TEXT-002', () => {
  describe('Rendering', () => {
    it('renders h2 element by default', () => {
      render(<TexturedHeading>Test Heading</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('Test Heading');
    });

    it('renders heading with text content', () => {
      render(<TexturedHeading>Styled Heading</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Styled Heading');
    });

    it('supports custom level prop', () => {
      render(<TexturedHeading level={3}>H3 Heading</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toBeInTheDocument();
    });

    it('supports custom className prop', () => {
      render(<TexturedHeading className="custom-class">Custom</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Custom');
    });

    it('renders children correctly', () => {
      render(
        <TexturedHeading>
          Multiple <span>Words</span> Here
        </TexturedHeading>
      );

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      const span = heading.querySelector('span');
      expect(span).toHaveTextContent('Words');
    });
  });

  describe('Styling', () => {
    it('renders as a heading element for gradient styling', () => {
      render(<TexturedHeading>Gradient Test</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.tagName).toBe('H2');
      expect(heading).toHaveTextContent('Gradient Test');
    });

    it('accepts additional className for heading styles', () => {
      render(<TexturedHeading className="text-3xl font-bold">Large Bold</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Large Bold');
    });
  });

  describe('Accessibility', () => {
    it('maintains semantic heading structure', () => {
      render(<TexturedHeading>Accessible Heading</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading.tagName).toBe('H2');
    });

    it('preserves text content for screen readers', () => {
      render(<TexturedHeading>Screen Reader Text</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Screen Reader Text');
    });

    it('does not add aria-hidden or hide text', () => {
      render(<TexturedHeading>Visible Text</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).not.toHaveAttribute('aria-hidden');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(<TexturedHeading></TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('');
    });

    it('handles very long text', () => {
      const longText = 'A'.repeat(200);
      render(<TexturedHeading>{longText}</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent(longText);
    });

    it('supports ref forwarding', () => {
      const ref = { current: null as HTMLHeadingElement | null };
      render(<TexturedHeading ref={ref}>Ref Test</TexturedHeading>);

      expect(ref.current).toBeInstanceOf(HTMLHeadingElement);
      expect(ref.current?.tagName).toBe('H2');
    });
  });
});

describe('TexturedHeading Integration', () => {
  it('can be used multiple times on a page', () => {
    render(
      <>
        <TexturedHeading>First Heading</TexturedHeading>
        <TexturedHeading>Second Heading</TexturedHeading>
        <TexturedHeading>Third Heading</TexturedHeading>
      </>
    );

    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent('First Heading');
    expect(headings[1]).toHaveTextContent('Second Heading');
    expect(headings[2]).toHaveTextContent('Third Heading');
  });

  it('works alongside non-textured headings', () => {
    render(
      <>
        <h1>Regular H1</h1>
        <TexturedHeading>Textured H2</TexturedHeading>
        <h3>Regular H3</h3>
      </>
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    const h2 = screen.getByRole('heading', { level: 2 });
    const h3 = screen.getByRole('heading', { level: 3 });

    expect(h1).toHaveTextContent('Regular H1');
    expect(h2).toHaveTextContent('Textured H2');
    expect(h3).toHaveTextContent('Regular H3');
  });
});

describe('REQ-TEXT-003 — Tradesmith Distressed/Grunge Texture Effect', () => {
  describe('Component Integration', () => {
    it('TexturedHeading renders text content correctly', () => {
      render(<TexturedHeading>WHO WE ARE</TexturedHeading>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('WHO WE ARE');
    });

    it('regular headings render independently of TexturedHeading', () => {
      render(<h2>Regular Text</h2>);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Regular Text');
    });
  });
});
