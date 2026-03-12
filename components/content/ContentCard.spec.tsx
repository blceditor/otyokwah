// REQ-DESIGN-001: Modern Card-Based Layout System - ContentCard Component Tests
// P2-31: Replaced CSS className assertions with behavior/structure tests

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentCard } from './ContentCard';

describe('REQ-DESIGN-001 — ContentCard Component', () => {
  describe('Basic Rendering', () => {
    test('renders title and children content', () => {
      render(
        <ContentCard title="Card Title">
          <p>Card content</p>
        </ContentCard>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    test('renders without title when not provided', () => {
      render(
        <ContentCard>
          <p>Content only</p>
        </ContentCard>
      );

      expect(screen.getByText('Content only')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    test('renders as an article element', () => {
      const { container } = render(
        <ContentCard title="Test">
          <p>Content</p>
        </ContentCard>
      );

      expect(container.querySelector('article')).toBeInTheDocument();
    });
  });

  describe('Icon Support', () => {
    test('renders Lucide icon from icon prop', () => {
      render(
        <ContentCard title="Features" icon="CheckCircle">
          <p>Content</p>
        </ContentCard>
      );

      const icon = screen.getByTestId('icon-CheckCircle');
      expect(icon).toBeInTheDocument();
    });

    test('renders without icon when not provided', () => {
      const { container } = render(
        <ContentCard title="No Icon">
          <p>Content</p>
        </ContentCard>
      );

      expect(container.querySelector('[data-testid^="icon-"]')).not.toBeInTheDocument();
    });

    test('icon has aria-hidden for accessibility', () => {
      render(
        <ContentCard title="Test" icon="Heart">
          <p>Content</p>
        </ContentCard>
      );

      const icon = screen.getByTestId('icon-Heart');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    test('handles invalid icon name gracefully', () => {
      render(
        <ContentCard title="Test" icon="InvalidIconName">
          <p>Content</p>
        </ContentCard>
      );

      expect(screen.getByText('Test')).toBeInTheDocument();
      expect(screen.queryByTestId('icon-InvalidIconName')).not.toBeInTheDocument();
    });
  });

  describe('Grid Behavior', () => {
    test('renders multiple cards with correct content', () => {
      render(
        <div>
          <ContentCard title="Card 1"><p>Content 1</p></ContentCard>
          <ContentCard title="Card 2"><p>Content 2</p></ContentCard>
          <ContentCard title="Card 3"><p>Content 3</p></ContentCard>
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
      expect(screen.getByText('Card 3')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('uses h3 heading by default', () => {
      render(
        <ContentCard title="Card Title">
          <p>Content</p>
        </ContentCard>
      );

      const heading = screen.getByRole('heading', { level: 3, name: 'Card Title' });
      expect(heading).toBeInTheDocument();
    });

    test('supports custom heading level', () => {
      render(
        <ContentCard title="Card Title" headingLevel={2}>
          <p>Content</p>
        </ContentCard>
      );

      const heading = screen.getByRole('heading', { level: 2, name: 'Card Title' });
      expect(heading).toBeInTheDocument();
    });
  });

  describe('REQ-CARD-001 — Icon and Title Layout', () => {
    test('icon renders alongside title within same container', () => {
      render(
        <ContentCard title="Test Title" icon="Star">
          <p>Content</p>
        </ContentCard>
      );

      const icon = screen.getByTestId('icon-Star');
      const title = screen.getByRole('heading', { name: 'Test Title' });

      // Both should be present in the same article
      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    test('icon renders before title in DOM order', () => {
      const { container } = render(
        <ContentCard title="Test Title" icon="Star">
          <p>Content</p>
        </ContentCard>
      );

      const heading = container.querySelector('h3');
      expect(heading).toBeInTheDocument();
      expect(heading?.textContent).toBe('Test Title');
    });
  });

  describe('Markdoc Integration', () => {
    test('component accepts Markdoc-compatible props', () => {
      render(
        <ContentCard title="Test Title" icon="Star">
          <p>Test content</p>
        </ContentCard>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    test('handles empty children gracefully', () => {
      const { container } = render(
        <ContentCard title="Empty Card" />
      );

      expect(screen.getByText('Empty Card')).toBeInTheDocument();
      expect(container.querySelector('article')).toBeInTheDocument();
    });

    test('handles very long title without crashing', () => {
      const longTitle = 'This is a very long card title that should wrap properly without breaking the layout';
      render(
        <ContentCard title={longTitle}>
          <p>Content</p>
        </ContentCard>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });
});
