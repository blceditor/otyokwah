// REQ-CONTENT-007: Donate Button Component Tests
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { DonateButton } from './DonateButton';

describe('REQ-CONTENT-007 — DonateButton Component', () => {
  const ULTRACAMP_DONATION_URL =
    'https://www.ultracamp.com/donation.aspx?idCamp=268&campCode=blc';

  const defaultProps = {
    label: 'Donate Now',
    href: ULTRACAMP_DONATION_URL,
  };

  describe('Basic Rendering', () => {
    test('renders button with text', () => {
      render(<DonateButton {...defaultProps} />);

      expect(screen.getByRole('link', { name: /donate now/i })).toBeInTheDocument();
    });

    test('renders with custom label', () => {
      render(<DonateButton label="Give Monthly" href={ULTRACAMP_DONATION_URL} />);

      expect(screen.getByRole('link', { name: /give monthly/i })).toBeInTheDocument();
    });

    test('links to UltraCamp donation form', () => {
      render(<DonateButton {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', ULTRACAMP_DONATION_URL);
    });

    test('accepts custom href prop', () => {
      const customUrl = 'https://example.com/donate';
      render(<DonateButton label="Donate" href={customUrl} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', customUrl);
    });
  });

  describe('Styling Variants', () => {
    test('applies primary button styling by default', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('bg-secondary');
    });

    test('applies primary variant classes', () => {
      const { container } = render(<DonateButton {...defaultProps} variant="primary" />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('bg-secondary');
    });

    test('applies secondary button styling', () => {
      const { container } = render(<DonateButton {...defaultProps} variant="secondary" />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('bg-cream');
    });
  });

  describe('Icon Support', () => {
    test('renders with icon from Lucide', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="Heart" />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('renders without icon when not provided', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });

    test('icon appears before label text', () => {
      const { container } = render(<DonateButton label="Donate" href="/donate" icon="Heart" />);

      const link = container.querySelector('a');
      const svg = container.querySelector('svg');
      expect(link).toBeInTheDocument();
      expect(svg).toBeInTheDocument();
      // SVG should come before text node
      expect(link?.firstElementChild).toBe(svg);
    });

    test('icon has data-icon-size attribute', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="Heart" />);

      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('data-icon-size', 'md');
    });
  });

  describe('REQ-CMS-016 — Icon and Label Layout', () => {
    test('icon and label are on same line (flex-nowrap)', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="Heart" />);
      const button = container.querySelector('a');
      expect(button?.className).toContain('flex-nowrap');
    });

    test('button text does not wrap (whitespace-nowrap)', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="Heart" />);
      const button = container.querySelector('a');
      expect(button?.className).toContain('whitespace-nowrap');
    });

    test('icon has flex-shrink-0 to prevent compression', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="Heart" />);
      const svg = container.querySelector('svg');
      expect(svg?.getAttribute('class')).toContain('flex-shrink-0');
    });

    test('icon and text remain on same line even with long label', () => {
      const longLabel = 'This is a very long donation button label text';
      const { container } = render(<DonateButton label={longLabel} href="/donate" icon="Heart" />);
      const button = container.querySelector('a');
      expect(button?.className).toContain('flex-nowrap');
      expect(button?.className).toContain('whitespace-nowrap');
    });
  });

  describe('External Link Attributes', () => {
    test('opens in new tab by default', () => {
      render(<DonateButton {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
    });

    test('includes rel="noopener noreferrer" for security', () => {
      render(<DonateButton {...defaultProps} />);

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('supports internal links without target="_blank"', () => {
      render(<DonateButton label="Donate" href="/donate" external={false} />);

      const link = screen.getByRole('link');
      expect(link).not.toHaveAttribute('target', '_blank');
    });
  });

  describe('Accessibility', () => {
    test('meets minimum 44x44px touch target classes', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('min-h-[44px]');
      expect(link?.className).toContain('min-w-[44px]');
    });

    test('renders as accessible link element', () => {
      render(<DonateButton {...defaultProps} />);
      expect(screen.getByRole('link')).toBeInTheDocument();
    });
  });

  describe('Hover Effects', () => {
    test('applies hover shadow effect class', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('hover:shadow');
    });

    test('applies hover scale effect', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('hover:scale-105');
    });
  });

  describe('Responsive Behavior', () => {
    test('buttons render in a grid layout', () => {
      const { container } = render(
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DonateButton label="One-Time" href="/donate" />
          <DonateButton label="Monthly" href="/donate" />
        </div>
      );

      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(2);
    });

    test('maintains touch target size classes', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('min-h-[44px]');
    });
  });

  describe('Markdoc Integration', () => {
    test('component can be registered in Markdoc schema', () => {
      const markdocProps = {
        label: 'Donate Now',
        icon: 'Heart',
        href: ULTRACAMP_DONATION_URL,
      };

      render(<DonateButton {...markdocProps} />);

      expect(screen.getByText('Donate Now')).toBeInTheDocument();
      expect(screen.getByRole('link')).toHaveAttribute('href', ULTRACAMP_DONATION_URL);
    });
  });

  describe('Edge Cases', () => {
    test('handles very long label text', () => {
      const longLabel = 'Donate Now to Support Camp Programs and Facilities';
      render(<DonateButton label={longLabel} href="/donate" />);

      expect(screen.getByText(longLabel)).toBeInTheDocument();
    });

    test('handles empty href', () => {
      const { container } = render(<DonateButton label="Donate" href="" />);

      const link = container.querySelector('a');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '');
    });

    test('handles invalid icon name gracefully', () => {
      const { container } = render(<DonateButton {...defaultProps} icon="InvalidIconName" />);

      // Should render button without icon (getIconByName returns null)
      expect(screen.getByRole('link')).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeInTheDocument();
    });
  });

  describe('Giving Type Buttons', () => {
    test('One-Time button with Heart icon', () => {
      const { container } = render(
        <DonateButton label="One-Time Gift" href="/donate" icon="Heart" variant="secondary" />
      );

      expect(screen.getByText('One-Time Gift')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('Monthly button with Calendar icon', () => {
      const { container } = render(
        <DonateButton label="Monthly Giving" href="/donate" icon="Calendar" variant="secondary" />
      );

      expect(screen.getByText('Monthly Giving')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('Memorial button with Flower icon', () => {
      const { container } = render(
        <DonateButton label="Memorial Gift" href="/donate" icon="Flower" variant="secondary" />
      );

      expect(screen.getByText('Memorial Gift')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    test('Planned Giving button with Gift icon', () => {
      const { container } = render(
        <DonateButton label="Planned Giving" href="/donate" icon="Gift" variant="secondary" />
      );

      expect(screen.getByText('Planned Giving')).toBeInTheDocument();
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Theme Integration', () => {
    test('primary button uses secondary color from theme', () => {
      const { container } = render(<DonateButton {...defaultProps} />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('bg-secondary');
      expect(link?.className).toContain('text-cream');
    });

    test('secondary button uses cream color from theme', () => {
      const { container } = render(<DonateButton {...defaultProps} variant="secondary" />);

      const link = container.querySelector('a');
      expect(link?.className).toContain('bg-cream');
      expect(link?.className).toContain('text-secondary');
    });
  });
});
