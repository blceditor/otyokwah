/**
 * CtaSection Component Tests
 * REQ-U03-FIX-008: Full-width CTA section for camp sessions bottom template
 */

import { render, screen } from '@testing-library/react';
import CtaSection from './CtaSection';

describe('REQ-U03-FIX-008 — CtaSection Component', () => {
  const defaultProps = {
    heading: 'Test Heading',
    description: 'Test description text',
    buttonLabel: 'Click Me',
    buttonHref: '/test-link',
    variant: 'green' as const,
  };

  describe('Structure', () => {
    it('renders heading, description, and button', () => {
      render(<CtaSection {...defaultProps} />);

      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Test Heading');
      expect(screen.getByText('Test description text')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Click Me' })).toBeInTheDocument();
    });

    it('wraps content in a section element', () => {
      const { container } = render(<CtaSection {...defaultProps} />);
      expect(container.querySelector('section')).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('green variant has secondary background', () => {
      const { container } = render(<CtaSection {...defaultProps} variant="green" />);
      const section = container.querySelector('section');
    });

    it('green variant button has secondary text color', () => {
      render(<CtaSection {...defaultProps} variant="green" />);
      const button = screen.getByRole('link');
    });

    it('brown variant has bark background', () => {
      const { container } = render(<CtaSection {...defaultProps} variant="brown" />);
      const section = container.querySelector('section');
    });

    it('brown variant button has bark text color', () => {
      render(<CtaSection {...defaultProps} variant="brown" />);
      const button = screen.getByRole('link');
    });
  });

  describe('External Links', () => {
    it('internal links use Next.js Link', () => {
      render(<CtaSection {...defaultProps} external={false} />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test-link');
      expect(link).not.toHaveAttribute('target');
    });

    it('external links open in new tab', () => {
      render(<CtaSection {...defaultProps} external={true} buttonHref="https://example.com" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Accessibility', () => {
    it('heading has proper semantic level', () => {
      render(<CtaSection {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('button is accessible with role link', () => {
      render(<CtaSection {...defaultProps} />);
      expect(screen.getByRole('link', { name: defaultProps.buttonLabel })).toBeInTheDocument();
    });
  });
});
