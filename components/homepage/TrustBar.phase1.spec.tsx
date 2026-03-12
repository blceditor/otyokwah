// REQ-Q1-003: Trust Bar Component Phase 1 Tests
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-Q1-003 — Trust Bar Trust Signals', () => {
  test('TrustBar renders 4 default trust signals', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const trustItems = container.querySelectorAll('[data-testid*="trust-item"]');
    expect(trustItems.length).toBe(4);
  });

  test('TrustBar displays Est. 1940 signal', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { getByText } = render(<TrustBar />);

    expect(getByText(/Est\. 1940/)).toBeInTheDocument();
  });

  test('TrustBar displays 1000+ Campers/Year signal', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { getByText } = render(<TrustBar />);

    expect(getByText(/1000\+ Campers\/Year/)).toBeInTheDocument();
  });

  test('TrustBar displays Christian Faith signal', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { getByText } = render(<TrustBar />);

    expect(getByText(/Christian Faith/)).toBeInTheDocument();
  });

  test('TrustBar displays Northern Indiana signal', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { getByText } = render(<TrustBar />);

    expect(getByText(/Northern Indiana/)).toBeInTheDocument();
  });
});

describe('REQ-Q1-003 — Trust Bar Semantic HTML', () => {
  test('TrustBar has role="complementary"', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    expect(section).toHaveAttribute('role', 'complementary');
  });

  test('TrustBar has aria-label for accessibility', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    const hasAriaLabel =
      section?.hasAttribute('aria-label') ||
      section?.hasAttribute('aria-labelledby');

    expect(hasAriaLabel).toBe(true);
  });

  test('TrustBar aria-label describes purpose', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    const ariaLabel = section?.getAttribute('aria-label') || '';

    expect(ariaLabel.toLowerCase()).toMatch(/trust|credibility|indicator/);
  });
});

describe('REQ-Q1-003 — Trust Bar Mobile Accessibility', () => {
  test('Trust items have minimum 48px tap target via min-h class', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const trustItems = container.querySelectorAll('[data-testid*="trust-item"]');
    expect(trustItems.length).toBe(4);

    trustItems.forEach((item) => {
      expect(item.className).toContain('min-h-[48px]');
    });
  });

  test('Trust items render as visible elements with content', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const trustItems = container.querySelectorAll('[data-testid*="trust-item"]');
    expect(trustItems.length).toBe(4);

    trustItems.forEach((item) => {
      expect(item.textContent?.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('REQ-Q1-003 — Trust Bar Layout', () => {
  test('TrustBar uses grid layout', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const grid = container.querySelector('ul');
    expect(grid?.className).toContain('grid');
  });

  test('TrustBar renders a section element', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});

describe('REQ-Q1-003 — Trust Bar Icons', () => {
  test('Each trust item has an SVG icon', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const trustItems = container.querySelectorAll('[data-testid*="trust-item"]');
    trustItems.forEach((item) => {
      const svg = item.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  test('Icons have aria-hidden for accessibility', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { container } = render(<TrustBar />);

    const svgs = container.querySelectorAll('svg');
    svgs.forEach((svg) => {
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

describe('REQ-Q1-003 — Trust Bar CMS Integration', () => {
  test('Accepts custom items via items prop', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { Calendar } = await import('lucide-react');

    const customItems = [
      { Icon: Calendar, text: 'Custom Signal' },
    ];

    const { getByText } = render(<TrustBar items={customItems} />);
    expect(getByText('Custom Signal')).toBeInTheDocument();
  });

  test('Custom items override defaults', async () => {
    const { default: TrustBar } = await import('./TrustBar');
    const { Calendar } = await import('lucide-react');

    const customItems = [
      { Icon: Calendar, text: 'Only Item' },
    ];

    const { container } = render(<TrustBar items={customItems} />);
    const trustItems = container.querySelectorAll('[data-testid*="trust-item"]');
    expect(trustItems.length).toBe(1);
  });
});

describe('REQ-Q1-003 — Trust Bar Non-Goals Validation', () => {
  test('Trust signals are static (no animated counters)', async () => {
    const fs = await import('fs');
    const trustBarSource = fs.readFileSync(
      require.resolve('./TrustBar'),
      'utf-8'
    );

    const hasAnimations =
      trustBarSource.includes('CountUp') ||
      trustBarSource.includes('useCounter') ||
      trustBarSource.includes('animate');

    expect(hasAnimations).toBe(false);
  });

  test('Trust items do not open review modals on click', async () => {
    const fs = await import('fs');
    const trustBarSource = fs.readFileSync(
      require.resolve('./TrustBar'),
      'utf-8'
    );

    const hasModal =
      trustBarSource.includes('modal') ||
      trustBarSource.includes('Modal') ||
      trustBarSource.includes('Dialog');

    expect(hasModal).toBe(false);
  });
});
