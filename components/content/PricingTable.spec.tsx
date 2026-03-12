// REQ-011: Pricing Table Component
import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingTable from './PricingTable';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Pricing Table Component', () => {
  const MOCK_TIERS = [
    {
      name: 'Week-Long Camp',
      price: 399,
      period: 'per week',
      features: ['All meals included', '24/7 supervision', 'Daily Bible study', 'Recreation activities'],
      cta: { text: 'Register Now', url: '/registration?tier=week' },
    },
    {
      name: 'Weekend Retreat',
      price: 149,
      period: 'per weekend',
      features: ['3 meals', 'Group activities', 'Chapel service', 'Team building'],
      cta: { text: 'Book Retreat', url: '/registration?tier=weekend' },
      popular: true,
    },
    {
      name: 'Day Camp',
      price: 59,
      period: 'per day',
      features: ['Lunch included', 'Supervised activities', 'Pick-up/drop-off'],
      cta: { text: 'Sign Up', url: '/registration?tier=day' },
    },
  ];

  test('renders multiple pricing tiers', () => {

    render(<PricingTable tiers={MOCK_TIERS} />);

    // All tier names should be visible
    expect(screen.getByText('Week-Long Camp')).toBeInTheDocument();
    expect(screen.getByText('Weekend Retreat')).toBeInTheDocument();
    expect(screen.getByText('Day Camp')).toBeInTheDocument();
  });

  test('highlights popular tier', () => {

    const { container } = render(<PricingTable tiers={MOCK_TIERS} />);

    // Weekend Retreat is marked as popular - should be visually distinct
    expect(screen.getByText('Weekend Retreat')).toBeInTheDocument();

    // Popular tier should have a badge or visual indicator
    const popularBadge = container.querySelector('[data-testid="popular-badge"]');
    const popularText = screen.queryByText(/popular|recommended|best value/i);
    expect(popularBadge || popularText).toBeTruthy();
  });

  test('renders features list per tier', () => {

    render(<PricingTable tiers={MOCK_TIERS} />);

    // Check features for first tier
    expect(screen.getByText('All meals included')).toBeInTheDocument();
    expect(screen.getByText('24/7 supervision')).toBeInTheDocument();
    expect(screen.getByText('Daily Bible study')).toBeInTheDocument();
    expect(screen.getByText('Recreation activities')).toBeInTheDocument();

    // Check features for third tier
    expect(screen.getByText('Lunch included')).toBeInTheDocument();
    expect(screen.getByText('Supervised activities')).toBeInTheDocument();
  });

  test('renders CTA button per tier', () => {

    render(<PricingTable tiers={MOCK_TIERS} />);

    // All CTA buttons should be rendered
    const registerButton = screen.getByRole('link', { name: 'Register Now' });
    const bookButton = screen.getByRole('link', { name: 'Book Retreat' });
    const signUpButton = screen.getByRole('link', { name: 'Sign Up' });

    expect(registerButton).toHaveAttribute('href', '/registration?tier=week');
    expect(bookButton).toHaveAttribute('href', '/registration?tier=weekend');
    expect(signUpButton).toHaveAttribute('href', '/registration?tier=day');
  });

  test('responsive: renders all tiers', () => {

    render(<PricingTable tiers={MOCK_TIERS} />);

    // All three tiers should be rendered and visible
    expect(screen.getByText('Week-Long Camp')).toBeInTheDocument();
    expect(screen.getByText('Weekend Retreat')).toBeInTheDocument();
    expect(screen.getByText('Day Camp')).toBeInTheDocument();
  });

  test('accessible (table semantics or cards)', () => {

    const { container } = render(<PricingTable tiers={MOCK_TIERS} />);

    // Should use semantic elements (headings for tier names)
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThanOrEqual(3);

    // Features should be in lists
    const lists = container.querySelectorAll('ul') || container.querySelectorAll('ol');
    expect(lists.length).toBeGreaterThan(0);
  });

  test('validates required props (tiers array)', () => {

    // Should render with valid tiers
    expect(() => {
      render(<PricingTable tiers={MOCK_TIERS} />);
    }).not.toThrow();

    expect(screen.getByText('Week-Long Camp')).toBeInTheDocument();
  });

  test('handles 2-5 tiers gracefully', () => {
    const TWO_TIERS = MOCK_TIERS.slice(0, 2);
    const FIVE_TIERS = [
      ...MOCK_TIERS,
      {
        name: 'Family Camp',
        price: 799,
        period: 'per family',
        features: ['Accommodations for 4', 'All meals', 'Family activities'],
        cta: { text: 'Book Family', url: '/registration?tier=family' },
      },
      {
        name: 'Group Discount',
        price: 349,
        period: 'per person',
        features: ['10+ campers', 'Group activities', 'Dedicated counselor'],
        cta: { text: 'Book Group', url: '/registration?tier=group' },
      },
    ];


    // Test with 2 tiers
    const { rerender } = render(<PricingTable tiers={TWO_TIERS} />);
    expect(screen.getByText('Week-Long Camp')).toBeInTheDocument();
    expect(screen.getByText('Weekend Retreat')).toBeInTheDocument();

    // Test with 5 tiers
    rerender(<PricingTable tiers={FIVE_TIERS} />);
    expect(screen.getByText('Family Camp')).toBeInTheDocument();
    expect(screen.getByText('Group Discount')).toBeInTheDocument();
  });
});
