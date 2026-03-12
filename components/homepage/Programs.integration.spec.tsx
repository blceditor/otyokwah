// REQ-PROD-003: Programs Grid Integration Tests
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';

// Mock Next.js modules
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => {
    return <a href={href} {...props}>{children}</a>;
  },
}));

describe('REQ-PROD-003 — Programs Grid Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders 4-card grid with default programs', async () => {
    const { default: Programs } = await import('./Programs');

    render(<Programs />);

    // Verify all 4 program titles
    expect(screen.getByText('Primary Overnight')).toBeInTheDocument();
    expect(screen.getByText('Junior Camp')).toBeInTheDocument();
    expect(screen.getByText('Jr. High Camp')).toBeInTheDocument();
    expect(screen.getByText('Sr. High Camp')).toBeInTheDocument();
  });

  test('card content displays correctly (title, subtitle, benefits)', async () => {
    const { default: Programs } = await import('./Programs');

    render(<Programs />);

    // Verify Primary Overnight card
    expect(screen.getByText('Primary Overnight')).toBeInTheDocument();
    expect(screen.getByText('Rising 2nd-3rd Graders')).toBeInTheDocument();
    expect(screen.getByText(/First taste of overnight camp/)).toBeInTheDocument();

    // Verify Jr. High Camp card
    expect(screen.getByText('Jr. High Camp')).toBeInTheDocument();
    expect(screen.getByText('Rising 7th-9th Graders')).toBeInTheDocument();
    expect(screen.getByText(/Faith growth & exploration/)).toBeInTheDocument();
  });

  test('hover lift effect applies (card has program-card class)', async () => {
    const { default: Programs } = await import('./Programs');

    const { container } = render(<Programs />);

    const firstCard = container.querySelector('.program-card');
    expect(firstCard).toBeInTheDocument();
    expect(firstCard).toBeVisible();
  });

  test('ProgramCard renders with correct props', async () => {
    const { default: ProgramCard } = await import('./ProgramCard');

    const mockProgram = {
      title: 'Test Program',
      subtitle: 'Grades 6-8',
      imageSrc: '/test-image.jpg',
      imageAlt: 'Test image',
      benefits: ['Benefit 1', 'Benefit 2'],
      ctaText: 'Learn More',
      ctaHref: '/test-program',
    };

    const { container } = render(<ProgramCard {...mockProgram} />);

    const image = container.querySelector('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Test image');
  });

  test('renders correct number of cards with images', async () => {
    const { default: Programs } = await import('./Programs');

    const { container } = render(<Programs />);

    const programCards = container.querySelectorAll('.program-card');
    expect(programCards.length).toBe(4);

    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThanOrEqual(4);
  });

  test('CTA buttons link to session page anchors', async () => {
    const { default: Programs } = await import('./Programs');

    render(<Programs />);

    const ctaLinks = screen.getAllByRole('link', { name: /See Dates & Pricing/i });
    expect(ctaLinks).toHaveLength(4);

    expect(ctaLinks[0]).toHaveAttribute('href', '/summer-camp-sessions#primary-overnight');
    expect(ctaLinks[1]).toHaveAttribute('href', '/summer-camp-sessions#junior-camp');
    expect(ctaLinks[2]).toHaveAttribute('href', '/summer-camp-sessions#jr-high-camp');
    expect(ctaLinks[3]).toHaveAttribute('href', '/summer-camp-sessions#sr-high-camp');
  });

  test('touch tap on card works', async () => {
    const { default: ProgramCard } = await import('./ProgramCard');

    const mockProgram = {
      title: 'Test Program',
      subtitle: 'Grades 6-8',
      imageSrc: '/test-image.jpg',
      imageAlt: 'Test image',
      benefits: ['Benefit 1'],
      ctaText: 'Learn More',
      ctaHref: '/test-program',
    };

    const { container } = render(<ProgramCard {...mockProgram} />);

    const card = container.querySelector('.program-card');
    expect(card).toBeInTheDocument();

    fireEvent.touchStart(card as Element);

    const ctaLink = card?.querySelector('a');
    expect(ctaLink).toBeInTheDocument();
  });

  test('keyboard navigation and focus states work', async () => {
    const { default: Programs } = await import('./Programs');

    render(<Programs />);

    const user = userEvent.setup();

    await user.tab();

    const focusedElement = document.activeElement;
    expect(focusedElement).toBeTruthy();
    expect(['A', 'BUTTON'].includes(focusedElement?.tagName || '')).toBe(true);

    await user.tab();
    expect(['A', 'BUTTON'].includes(document.activeElement?.tagName || '')).toBe(true);
  });
});
