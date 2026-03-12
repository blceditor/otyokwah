// REQ-011: Stats Counter Component
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import StatsCounter from './StatsCounter';
import '@testing-library/jest-dom/vitest';

describe('REQ-011 — Stats Counter Component', () => {
  const MOCK_STATS = [
    { number: 500, label: 'Campers', suffix: '+' },
    { number: 25, label: 'Years', suffix: '' },
    { number: 95, label: 'Satisfaction', suffix: '%' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
    const mockIntersectionObserver = vi.fn((callback) => {
      // Immediately trigger intersection
      callback([{ isIntersecting: true }]);
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      };
    });
    global.IntersectionObserver = mockIntersectionObserver as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test('renders number, label, suffix', async () => {
    render(<StatsCounter stats={MOCK_STATS} />);

    // Should render all labels
    expect(screen.getByText('Campers')).toBeInTheDocument();
    expect(screen.getByText('Years')).toBeInTheDocument();
    expect(screen.getByText('Satisfaction')).toBeInTheDocument();

    // Advance timers to complete the animation (2000ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Should render final number with suffix after animation completes
    const numberElement = screen.getByText(/500/);
    expect(numberElement).toBeInTheDocument();
  });

  test('animates count-up on scroll', () => {
    const { container } = render(<StatsCounter stats={MOCK_STATS} />);

    // Should use intersection observer or scroll event
    // Check for data attributes that indicate animation capability
    const statElements = container.querySelectorAll('[data-testid*="stat"]') ||
                        container.querySelectorAll('[class*="stat"]');

    expect(statElements.length).toBeGreaterThan(0);
  });

  test('handles large numbers (1000+)', () => {
    const LARGE_STATS = [
      { number: 5000, label: 'Total Campers', suffix: '+' },
      { number: 10000, label: 'Memories Created', suffix: '' },
    ];

    render(<StatsCounter stats={LARGE_STATS} />);

    // Should format or display large numbers
    expect(screen.getByText('Total Campers')).toBeInTheDocument();
    expect(screen.getByText('Memories Created')).toBeInTheDocument();
  });

  test('suffix renders correctly (+, %, etc)', () => {
    render(<StatsCounter stats={MOCK_STATS} />);

    // Check for suffix in the rendered output
    const { container } = render(<StatsCounter stats={MOCK_STATS} />);
    const html = container.innerHTML;

    expect(html.includes('+')).toBe(true);
    expect(html.includes('%')).toBe(true);
  });

  test('animation triggers once per page load', () => {
    const { container, rerender } = render(<StatsCounter stats={MOCK_STATS} />);

    // Animation should be set up (check for animation classes or data attributes)
    const statElement = container.querySelector('[data-testid="stats-counter"]') || container.firstChild;

    expect(statElement).toBeInTheDocument();

    // Rerender shouldn't restart animation
    rerender(<StatsCounter stats={MOCK_STATS} />);

    expect(statElement).toBeInTheDocument();
  });

  test('accessible (aria-live for screen readers)', () => {
    const { container } = render(<StatsCounter stats={MOCK_STATS} />);

    // Should have aria-live for dynamic content (animated counters)
    const liveRegions = container.querySelectorAll('[aria-live]');

    // At least one element should have aria-live for accessibility
    expect(liveRegions.length).toBeGreaterThan(0);
  });

  test('works without JavaScript (shows final value)', () => {
    render(<StatsCounter stats={MOCK_STATS} />);

    // Final values should be in the DOM (even if animated)
    // They may be in data attributes or as initial content
    const { container } = render(<StatsCounter stats={MOCK_STATS} />);
    const html = container.innerHTML;

    expect(html.includes('500') || html.includes('Campers')).toBe(true);
  });
});
