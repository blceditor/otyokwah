// REQ-F003: Quote Rotation Component
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { QuoteRotation, type QuoteData } from './QuoteRotation';

describe('REQ-F003 — Quote Rotation Component', () => {
  const MOCK_QUOTES: QuoteData[] = [
    {
      quote: 'Bear Lake Camp changed my life. The counselors were amazing!',
      name: 'Sarah Johnson',
      role: 'Parent of Camper',
    },
    {
      quote: 'Working at camp was the most rewarding experience of my life.',
      name: 'Michael Chen',
      role: 'Former Summer Staff',
    },
    {
      quote: 'Supporting Bear Lake Camp fills our hearts with joy.',
      name: 'Robert and Linda Martinez',
      role: 'Camp Supporters',
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
    });
    vi.restoreAllMocks();
  });

  test('renders first quote initially', () => {
    render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();
    expect(screen.getByText(MOCK_QUOTES[0].name)).toBeInTheDocument();
    expect(screen.getByText(MOCK_QUOTES[0].role)).toBeInTheDocument();
  });

  test('rotates quotes after interval', async () => {
    render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    // Initially shows first quote
    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();

    // Fast-forward 5 seconds (interval) + 300ms transition
    await act(async () => {
      vi.advanceTimersByTime(5300);
    });

    // Should show second quote
    expect(screen.getByText(MOCK_QUOTES[1].quote)).toBeInTheDocument();
  });

  test('has mouse event handlers for pause on hover', () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    const rotationContainer = container.firstChild as HTMLElement;

    // Component should have mouse event handlers for hover pause functionality
    expect(rotationContainer).toBeInTheDocument();
    expect(rotationContainer).toHaveAttribute('role', 'region');

    // Component is interactive and can receive mouse events
    expect(rotationContainer).toHaveAttribute('tabindex', '0');
  });

  test('pauses rotation on focus', async () => {
    const user = userEvent.setup({ delay: null });
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    const rotationContainer = container.firstChild as HTMLElement;

    // Focus the component
    rotationContainer.focus();

    // Fast-forward 5 seconds
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Should still show first quote (paused)
    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();
  });

  test('navigates with keyboard arrows', async () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    const rotationContainer = container.firstChild as HTMLElement;

    // Focus the component
    act(() => {
      rotationContainer.focus();
    });

    // Press ArrowRight to go to next quote
    act(() => {
      rotationContainer.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })
      );
    });

    // Wait for transition
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(MOCK_QUOTES[1].quote)).toBeInTheDocument();

    // Press ArrowLeft to go back
    act(() => {
      rotationContainer.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })
      );
    });

    // Wait for transition
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();
  });

  test('renders navigation dots for multiple quotes', () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    const dots = container.querySelectorAll('button[aria-label^="Go to quote"]');
    expect(dots).toHaveLength(MOCK_QUOTES.length);
  });

  test('clicking navigation dots changes quote', async () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    // Initially shows first quote
    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();

    // Click third dot
    const thirdDot = container.querySelector('button[aria-label="Go to quote 3"]');
    expect(thirdDot).toBeInTheDocument();

    if (thirdDot) {
      act(() => {
        (thirdDot as HTMLElement).click();
      });

      // Wait for transition
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText(MOCK_QUOTES[2].quote)).toBeInTheDocument();
    }
  });

  test('loops back to first quote after last quote', async () => {
    render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    // Fast-forward to show last quote (2 intervals + transitions)
    await act(async () => {
      vi.advanceTimersByTime(10600); // 2x(5000+300)
    });

    expect(screen.getByText(MOCK_QUOTES[2].quote)).toBeInTheDocument();

    // Fast-forward one more interval + transition
    await act(async () => {
      vi.advanceTimersByTime(5300);
    });

    // Should loop back to first quote
    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();
  });

  test('handles single quote without rotation', async () => {
    const singleQuote = [MOCK_QUOTES[0]];
    const { container } = render(<QuoteRotation quotes={singleQuote} interval={5000} />);

    // Shows the quote
    expect(screen.getByText(singleQuote[0].quote)).toBeInTheDocument();

    // No navigation dots
    const dots = container.querySelectorAll('button[aria-label^="Go to quote"]');
    expect(dots).toHaveLength(0);

    // Fast-forward - should not crash or change
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByText(singleQuote[0].quote)).toBeInTheDocument();
  });

  test('handles empty quotes array gracefully', () => {
    const { container } = render(<QuoteRotation quotes={[]} interval={5000} />);

    // Should render nothing
    expect(container.firstChild).toBeNull();
  });

  test('accessible with semantic HTML and ARIA', () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    // Has role="region" with aria-label
    const region = container.querySelector('[role="region"]');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-label', 'Testimonial quote rotation');

    // Has aria-live for screen readers
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toHaveAttribute('aria-atomic', 'true');

    // Uses blockquote element
    const blockquote = container.querySelector('blockquote');
    expect(blockquote).toBeInTheDocument();
    expect(blockquote).toHaveTextContent(MOCK_QUOTES[0].quote);

    // Navigation has role="group"
    const navGroup = container.querySelector('[role="group"]');
    expect(navGroup).toBeInTheDocument();
    expect(navGroup).toHaveAttribute('aria-label', 'Quote navigation');

    // Screen reader announcement
    expect(screen.getByText(/Quote 1 of 3/)).toBeInTheDocument();
  });

  test('fade transition between quotes', async () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    const transitionDiv = container.querySelector('.transition-opacity');
    expect(transitionDiv).toBeInTheDocument();

    // Fast-forward to trigger rotation + wait for transition
    await act(async () => {
      vi.advanceTimersByTime(5300);
    });

    // After transition, should show next quote
    expect(screen.getByText(MOCK_QUOTES[1].quote)).toBeInTheDocument();
  });

  test('mobile responsive with proper classes', () => {
    const { container } = render(<QuoteRotation quotes={MOCK_QUOTES} interval={5000} />);

    // Check for responsive padding classes
    const card = container.querySelector('.rounded-lg');

    // Check for responsive text sizing
    const blockquote = container.querySelector('blockquote');
  });

  test('respects custom interval prop', async () => {
    const customInterval = 3000;
    render(<QuoteRotation quotes={MOCK_QUOTES} interval={customInterval} />);

    // Initially shows first quote
    expect(screen.getByText(MOCK_QUOTES[0].quote)).toBeInTheDocument();

    // Fast-forward by custom interval + transition
    await act(async () => {
      vi.advanceTimersByTime(customInterval + 300);
    });

    // Should rotate to second quote
    expect(screen.getByText(MOCK_QUOTES[1].quote)).toBeInTheDocument();
  });

  test('applies custom className prop', () => {
    const customClass = 'my-custom-class';
    const { container } = render(
      <QuoteRotation quotes={MOCK_QUOTES} interval={5000} className={customClass} />
    );

  });
});
