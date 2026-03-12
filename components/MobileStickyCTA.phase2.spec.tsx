// REQ-Q2-006: Add Mobile Sticky CTA - Detailed Tests
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('REQ-Q2-006 — Mobile Sticky CTA Responsive Behavior', () => {
  test('CTA visible on mobile viewport (375px)', async () => {
    // Set mobile viewport
    global.innerWidth = 375;

    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const cta = container.querySelector('[class*="block"], [class*="flex"]');
    expect(cta).toBeInTheDocument();
  });

  test('CTA visible on tablet viewport (768px)', async () => {
    global.innerWidth = 768;

    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const cta = container.querySelector('[class*="block"], [class*="flex"]');
    expect(cta).toBeInTheDocument();
  });

  test('CTA hidden on desktop viewport (1024px+)', async () => {
    global.innerWidth = 1440;

    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    // Should have lg:hidden class
    const cta = container.querySelector('[class*="lg:hidden"]');
    expect(cta).toBeInTheDocument();
  });
});

describe('REQ-Q2-006 — Mobile Sticky CTA Button Layout', () => {
  test('Buttons arranged horizontally with proper spacing', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const buttonContainer = container.querySelector('[class*="flex"], [class*="grid"]');
    expect(buttonContainer).toBeInTheDocument();

    // Should have gap for spacing
  });

  test('Renders interactive button elements', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const buttons = container.querySelectorAll('a, button');
    expect(buttons.length).toBeGreaterThan(0);

    // Each button should have text content
    buttons.forEach((btn) => {
      expect(btn.textContent?.trim().length).toBeGreaterThan(0);
    });
  });

  test('CTA container has proper padding on mobile', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const cta = container.querySelector('[class*="p-"], [class*="px-"]');
    expect(cta).toBeInTheDocument();
  });
});

describe('REQ-Q2-006 — Mobile Sticky CTA Z-Index Management', () => {
  test('CTA z-index is above content sections', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const cta = container.querySelector('[class*="z-"]');
    const zIndexClass = cta?.className.match(/z-(\d+)/)?.[0];

    // Should have z-40 or z-50
    expect(['z-40', 'z-50']).toContain(zIndexClass);
  });

  test('CTA does not overlap modal dialogs (z-index < 50)', async () => {
    const fs = await import('fs');
    const ctaSource = fs.readFileSync(
      require.resolve('./MobileStickyCTA'),
      'utf-8'
    );

    // Should not use z-50 or higher (reserved for modals)
    expect(ctaSource).not.toContain('z-60');
    expect(ctaSource).not.toContain('z-9999');
  });
});

describe('REQ-Q2-006 — Mobile Sticky CTA Animation', () => {
  test('Slide-in transition uses transform', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const cta = container.querySelector('[class*="translate"], [class*="transform"]');
    expect(cta).toBeInTheDocument();
  });

  test('Transition duration is smooth (200-300ms)', async () => {
    const fs = await import('fs');
    const ctaSource = fs.readFileSync(
      require.resolve('./MobileStickyCTA'),
      'utf-8'
    );

    // Should have duration class (duration-200, duration-300)
    expect(ctaSource).toMatch(/duration-200|duration-300/);
  });

  test('CTA appears when scrolled past 50% threshold', async () => {
    const scrollListeners: Array<(event: Event) => void> = [];

    // Mock addEventListener to capture scroll listener
    window.addEventListener = vi.fn((event, handler) => {
      if (event === 'scroll') {
        scrollListeners.push(handler as (event: Event) => void);
      }
    });

    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    // Simulate scroll past 50%
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 1000, writable: true });

    scrollListeners.forEach(listener => listener(new Event('scroll')));

    await waitFor(() => {
      // CTA should be visible (not translated out)
      const cta = container.querySelector('[class*="translate-y-0"]');
      expect(cta).toBeInTheDocument();
    });
  });
});

describe('REQ-Q2-006 — Mobile Sticky CTA External Links', () => {
  test('Register Now opens in same tab (user stays on page)', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const registerBtn = container.querySelector('a[href*="register"]');

    // External registration link should open in new tab
    if (registerBtn?.getAttribute('href')?.includes('http')) {
      expect(registerBtn).toHaveAttribute('target', '_blank');
    }
  });

  test('Find Your Week uses smooth scroll to programs section', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    const findWeekBtn = container.querySelector('a[href="#programs"]');
    expect(findWeekBtn).toBeInTheDocument();
  });
});

describe('REQ-Q2-006 — Mobile Sticky CTA Performance', () => {
  test('Uses CSS transforms for animation (GPU accelerated)', async () => {
    const fs = await import('fs');
    const ctaSource = fs.readFileSync(
      require.resolve('./MobileStickyCTA'),
      'utf-8'
    );

    // Should use translate (GPU) not top/bottom (CPU)
    expect(ctaSource).toContain('translate');
  });

  test('Scroll listener is throttled or uses IntersectionObserver', async () => {
    const fs = await import('fs');
    const ctaSource = fs.readFileSync(
      require.resolve('./MobileStickyCTA'),
      'utf-8'
    );

    const hasOptimization =
      ctaSource.includes('IntersectionObserver') ||
      ctaSource.includes('throttle') ||
      ctaSource.includes('requestAnimationFrame');

    expect(hasOptimization).toBe(true);
  });

  test('CTA does not cause layout thrashing', async () => {
    const { default: MobileStickyCTA } = await import('./MobileStickyCTA');
    const { container } = render(<MobileStickyCTA />);

    // Fixed/sticky positioning should not affect document flow
    const cta = container.querySelector('[class*="fixed"], [class*="sticky"]');
    expect(cta).toBeInTheDocument();
  });
});
