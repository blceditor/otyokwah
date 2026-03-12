// REQ-PROD-001: TrustBar Integration Tests
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock Keystatic reader for singleton data
vi.mock('@keystatic/core/reader', () => ({
  createReader: vi.fn(() => ({
    singletons: {
      trustBar: {
        read: vi.fn(),
      },
    },
  })),
}));

/**
 * Integration Test Suite: TrustBar Component
 *
 * Tests the TrustBar component integration with Keystatic CMS,
 * sticky positioning, mobile responsive behavior, and accessibility.
 *
 * Story Points: 0.2 SP (5 tests)
 * Related Requirements: REQ-PROD-001
 */

describe('REQ-PROD-001 — TrustBar Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders trust bar with all 5 trust items from CMS', async () => {
    // REQ-PROD-001: Trust items should load from Keystatic singleton
    const mockTrustBarData = {
      items: [
        { icon: '🏆', text: 'ACA Accredited' },
        { icon: '👨‍👩‍👧‍👦', text: '500+ Families Served' },
        { icon: '📅', text: 'Since 1948' },
        { icon: '⭐', text: '4.9/5 Star Rating' },
        { icon: '🔄', text: '80% Return Rate' },
      ],
    };

    const { createReader } = await import('@keystatic/core/reader');
    const reader = createReader('', {} as any);
    vi.mocked(reader.singletons.trustBar.read).mockResolvedValue(mockTrustBarData);

    // This will fail because TrustBar doesn't yet accept CMS data
    const { default: TrustBar } = await import('./TrustBar');
    const trustBarData = await reader.singletons.trustBar.read();

    render(<TrustBar items={trustBarData?.items} />);

    // Verify all 5 trust items are rendered
    expect(screen.getByText('ACA Accredited')).toBeInTheDocument();
    expect(screen.getByText('500+ Families Served')).toBeInTheDocument();
    expect(screen.getByText('Since 1948')).toBeInTheDocument();
    expect(screen.getByText('4.9/5 Star Rating')).toBeInTheDocument();
    expect(screen.getByText('80% Return Rate')).toBeInTheDocument();

    // Verify count
    const trustItems = screen.getAllByTestId(/trust-item-/);
    expect(trustItems).toHaveLength(5);
  });

  test('applies sticky positioning on scroll', async () => {
    // REQ-PROD-001: TrustBar should remain visible when scrolling
    const { default: TrustBar } = await import('./TrustBar');

    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Verify sticky positioning CSS classes
    const classes = section?.className || '';
    expect(classes).toContain('sticky');
    expect(classes).toContain('top-0');

    // Verify z-index is set (should be z-40)
    expect(classes).toContain('z-40');
  });

  test('mobile horizontal scroll behavior works on viewport < 768px', async () => {
    // REQ-PROD-001: Mobile devices should allow horizontal scrolling of trust items
    const { default: TrustBar } = await import('./TrustBar');

    // Mock mobile viewport
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));

    const { container } = render(<TrustBar />);

    const trustContainer = container.querySelector('.flex');
    expect(trustContainer).toBeInTheDocument();

    // On mobile, should have flex-wrap or overflow-x-auto for horizontal scroll
    const classes = trustContainer?.className || '';

    // This will fail because current implementation uses flex-wrap
    // which doesn't provide horizontal scroll
    expect(
      classes.includes('overflow-x-auto') ||
      classes.includes('overflow-x-scroll')
    ).toBe(true);
  });

  test('content loads from Keystatic singleton', async () => {
    // REQ-PROD-001: Trust items should be editable via Keystatic
    const mockTrustBarData = {
      items: [
        { icon: '✅', text: 'Custom Trust Item 1' },
        { icon: '🎯', text: 'Custom Trust Item 2' },
        { icon: '💪', text: 'Custom Trust Item 3' },
        { icon: '🌟', text: 'Custom Trust Item 4' },
        { icon: '🚀', text: 'Custom Trust Item 5' },
      ],
    };

    const { createReader } = await import('@keystatic/core/reader');
    const reader = createReader('', {} as any);
    vi.mocked(reader.singletons.trustBar.read).mockResolvedValue(mockTrustBarData);

    // This will fail because integration doesn't exist yet
    const trustBarData = await reader.singletons.trustBar.read();
    expect(trustBarData).toBeDefined();
    expect(trustBarData?.items).toHaveLength(5);
    expect(trustBarData?.items[0].text).toBe('Custom Trust Item 1');

    // Verify TrustBar can accept CMS data
    const { default: TrustBar } = await import('./TrustBar');
    render(<TrustBar items={trustBarData?.items} />);

    // Custom content should render
    expect(screen.getByText('Custom Trust Item 1')).toBeInTheDocument();
    expect(screen.getByText('Custom Trust Item 5')).toBeInTheDocument();
  });

  test('ARIA labels present for accessibility', async () => {
    // REQ-PROD-001: Screen readers should understand trust bar purpose
    const { default: TrustBar } = await import('./TrustBar');

    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();

    // Verify semantic HTML and ARIA attributes
    expect(section?.getAttribute('role')).toBe('complementary');
    expect(section?.getAttribute('aria-label')).toBeTruthy();

    // Verify aria-label describes the purpose
    const ariaLabel = section?.getAttribute('aria-label') || '';
    expect(
      ariaLabel.toLowerCase().includes('trust') ||
      ariaLabel.toLowerCase().includes('credibility')
    ).toBe(true);
  });
});
