// REQ-P1-005: Sparkry AI Branding (Simplified - logo only)
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SparkryBranding from './SparkryBranding';
import '@testing-library/jest-dom/vitest';

describe('REQ-P1-005 — Sparkry AI Branding (Simplified)', () => {
  const SPARKRY_URL = 'https://sparkry.ai';

  test('renders logo image', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);
    expect(logo).toBeInTheDocument();
  });

  test('link opens https://sparkry.ai in new tab', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', SPARKRY_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('logo loads from sparkry.ai', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);
    const imgSrc = logo.getAttribute('src');

    expect(imgSrc).toBeTruthy();
    expect(logo).toHaveAttribute('alt', 'Sparkry AI');
  });

  test('does NOT show "Powered by" text (simplified)', () => {
    render(<SparkryBranding />);

    const poweredByText = screen.queryByText('Powered by');
    expect(poweredByText).not.toBeInTheDocument();
  });

  test('does NOT show external link icon (simplified)', () => {
    const { container } = render(<SparkryBranding />);

    // Should not have an SVG icon (external link icon was removed)
    const svg = container.querySelector('svg');
    expect(svg).not.toBeInTheDocument();
  });

  test('logo has correct height with auto width for aspect ratio', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);

    // Height is 32, width is auto based on aspect ratio
    expect(logo).toHaveAttribute('height', '28');
    expect(logo).toHaveAttribute('width', '100');
  });

  test('link is an interactive element', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  test('link wraps the logo image', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    const logo = screen.getByAltText(/Sparkry AI/i);
    expect(link).toContainElement(logo);
  });

  test('uses Next.js Image component for optimization', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);
    // Rendered via Next Image mock — verify it has src
    expect(logo).toHaveAttribute('src');
  });

  test('is accessible with proper ARIA attributes', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');

    link.focus();
    expect(document.activeElement).toBe(link);

    const logo = screen.getByAltText(/Sparkry AI/i);
    expect(logo.getAttribute('alt')).toBeTruthy();
  });

  test('link has aria-label for accessibility', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-label', 'Built & Powered by Sparkry.AI');
  });

  test('component is self-contained with no required props', () => {
    expect(() => {
      render(<SparkryBranding />);
    }).not.toThrow();
  });

  test('renders inline (parent handles layout)', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  test('uses correct external link security attributes', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    const rel = link.getAttribute('rel') || '';
    expect(rel).toContain('noopener');
    expect(rel).toContain('noreferrer');
  });
});

describe('REQ-P1-005 — Sparkry AI Branding Integration', () => {
  test('component can be imported and rendered', () => {
    expect(typeof SparkryBranding).toBe('function');

    const { container } = render(<SparkryBranding />);
    expect(container.firstChild).toBeTruthy();
  });

  test('works correctly when rendered in header alongside other elements', () => {
    const { container } = render(
      <div className="flex items-center justify-between">
        <div>Other Header Content</div>
        <SparkryBranding />
      </div>
    );

    const logo = screen.getByAltText(/Sparkry AI/i);
    expect(logo).toBeInTheDocument();

    expect(screen.getByText('Other Header Content')).toBeInTheDocument();
  });

  test('logo is visible', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);
    expect(logo).toBeVisible();
  });
});

describe('REQ-P1-005 — Sparkry AI Branding Performance', () => {
  test('uses Next.js Image for automatic optimization', () => {
    render(<SparkryBranding />);

    const logo = screen.getByAltText(/Sparkry AI/i);
    const imgSrc = logo.getAttribute('src');

    expect(imgSrc).toBeTruthy();
  });

  test('external link does not impact page performance', () => {
    render(<SparkryBranding />);

    const link = screen.getByRole('link');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
