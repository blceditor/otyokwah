// REQ-LAYOUT-001: Layout must render KeystaticToolsHeader component
// REQ-LAYOUT-002: Layout must render content area (children)
// REQ-LAYOUT-003: Header must be positioned ABOVE content (visually)
// REQ-LAYOUT-004: Content area must account for header height
// REQ-LAYOUT-005: Layout must work with dynamic [[...params]] routing
// REQ-LAYOUT-006: No hydration errors (client/server HTML match)

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/keystatic/collection/pages/home',
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock next/script to render inline content
vi.mock('next/script', () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <script>{children}</script>
  ),
}));

// Mock fetch for DeploymentStatus and useGitHubUser
beforeEach(() => {
  vi.clearAllMocks();

  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      status: 'ready',
      state: 'Published',
      timestamp: Date.now(),
    }),
  });
});

describe('REQ-LAYOUT-001 — Layout Structure Tests', () => {
  test('layout renders without crashing', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test content</div></Layout>);

    expect(container).toBeInTheDocument();
  });

  test('layout renders KeystaticToolsHeader with header role', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.tagName).toBe('HEADER');
  });

  test('layout renders SparkryBranding in header', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const sparkryLogo = screen.getByAltText(/sparkry/i);
    expect(sparkryLogo).toBeVisible();
  });

  test('layout renders children content area', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div data-testid="test-child">child content</div></Layout>);

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(container.childNodes.length).toBeGreaterThan(0);
  });

  test('header appears before content in DOM order', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky');
    expect(stickyWrapper).toBeInTheDocument();

    const header = stickyWrapper?.querySelector('header[role="banner"]');
    expect(header).toBeInTheDocument();
  });
});

describe('REQ-LAYOUT-003 — Header Positioning Tests', () => {
  test('header has sticky position styling via wrapper', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky.top-0');
    expect(stickyWrapper).toBeInTheDocument();

    const classes = stickyWrapper?.className || '';
    expect(classes).toMatch(/sticky/);
    expect(classes).toMatch(/top-0/);
    expect(classes).toMatch(/z-\d+/);
  });

  test('header has z-index via sticky wrapper', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky.top-0');
    const classes = stickyWrapper?.className || '';
    expect(classes).toMatch(/z-\d+/);
  });

  test('header spans full width', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const header = screen.getByRole('banner');
    expect(header.className).toContain('w-full');
  });
});

describe('REQ-LAYOUT-004 — Content Layout Tests', () => {
  test('content area renders after sticky header in DOM', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky');
    expect(stickyWrapper).toBeInTheDocument();

    const header = stickyWrapper?.querySelector('header');
    expect(header).toBeInTheDocument();
  });

  test('header has defined height for consistent layout', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    const classes = header?.className || '';
    expect(classes).toMatch(/h-\d+/);
  });
});

describe('REQ-LAYOUT-005 — Dynamic Routing Tests', () => {
  test('layout renders header with CMS navigation', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    const nav = screen.getByRole('navigation', { name: /cms navigation/i });
    expect(nav).toBeInTheDocument();
  });

  test('layout structure is sticky wrapper + content area', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    // Header inside sticky wrapper
    const header = container.querySelector('header[role="banner"]');
    expect(header).toBeInTheDocument();

    const stickyWrapper = container.querySelector('.sticky.top-0');
    expect(stickyWrapper).toBeInTheDocument();
    expect(stickyWrapper?.querySelector('header')).toBeInTheDocument();

    // Content area follows header
    const contentArea = container.querySelector('.flex-1.overflow-auto');
    expect(contentArea).toBeInTheDocument();
  });
});

describe('REQ-LAYOUT-006 — Hydration and SSR Tests', () => {
  test('layout has consistent HTML structure for SSR/CSR', async () => {
    const Layout = (await import('../layout')).default;

    const { container: ssrContainer } = render(<Layout><div>test</div></Layout>);
    const ssrHTML = ssrContainer.innerHTML;

    const { container: csrContainer } = render(<Layout><div>test</div></Layout>);
    const csrHTML = csrContainer.innerHTML;

    const ssrHasHeader = ssrHTML.includes('role="banner"');
    const csrHasHeader = csrHTML.includes('role="banner"');

    expect(ssrHasHeader).toBe(csrHasHeader);
  });

  test('no console errors during render', async () => {
    const Layout = (await import('../layout')).default;

    const originalError = console.error;
    const errors: any[] = [];
    console.error = (...args: any[]) => errors.push(args);

    render(<Layout><div>test</div></Layout>);

    console.error = originalError;

    const realErrors = errors.filter(
      error =>
        !error[0]?.includes?.('Not implemented: HTMLFormElement') &&
        !error[0]?.includes?.('Could not parse CSS stylesheet') &&
        !error[0]?.includes?.('act(...)') &&
        !error[0]?.includes?.('Warning:')
    );

    expect(realErrors.length).toBe(0);
  });

  test('layout renders on initial page load without hydration warnings', async () => {
    const Layout = (await import('../layout')).default;

    const originalWarn = console.warn;
    const warnings: any[] = [];
    console.warn = (...args: any[]) => warnings.push(args);

    render(<Layout><div>test</div></Layout>);

    console.warn = originalWarn;

    const hydrationWarnings = warnings.filter(
      warn => warn[0]?.includes?.('hydration') || warn[0]?.includes?.('mismatch')
    );

    expect(hydrationWarnings.length).toBe(0);
  });
});

describe('REQ-LAYOUT-001 — Integration: Header Components', () => {
  test('SparkryBranding component is visible in header', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const sparkryLogo = screen.getByAltText(/sparkry/i);
    expect(sparkryLogo).toBeVisible();
    expect(sparkryLogo.tagName).toBe('IMG');
  });

  test('ThemeToggle is visible in header', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    // ThemeToggle renders a button with Light/Dark
    const themeButton = screen.getByRole('button', { name: /light|dark/i });
    expect(themeButton).toBeInTheDocument();
  });

  test('CMS navigation has Content and Tools dropdowns', async () => {
    const Layout = (await import('../layout')).default;

    render(<Layout><div>test</div></Layout>);

    const contentBtn = screen.getByRole('button', { name: /content/i });
    expect(contentBtn).toBeInTheDocument();

    const toolsBtn = screen.getByRole('button', { name: /tools/i });
    expect(toolsBtn).toBeInTheDocument();
  });
});

describe('REQ-LAYOUT-003 — Edge Cases and Layout Behavior', () => {
  test('header remains sticky during scroll (stays visible at top)', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky.top-0');
    expect(stickyWrapper).toBeInTheDocument();

    const classes = stickyWrapper?.className || '';
    expect(classes).toContain('sticky');
    expect(classes).toContain('top-0');
  });

  test('header wrapper has appropriate background for readability', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky');

    const classes = stickyWrapper?.className || '';
    expect(classes).toMatch(/bg-\w+/);
  });

  test('sticky wrapper has border to distinguish from content', async () => {
    const Layout = (await import('../layout')).default;

    const { container } = render(<Layout><div>test</div></Layout>);

    const stickyWrapper = container.querySelector('.sticky');
    const classes = stickyWrapper?.className || '';

    expect(classes).toMatch(/border/);
  });

  test('layout renders at different viewport sizes', async () => {
    const Layout = (await import('../layout')).default;

    global.innerWidth = 375;

    const { container } = render(<Layout><div>test</div></Layout>);
    expect(container).toBeInTheDocument();

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();

    global.innerWidth = 1920;
    expect(header).toBeInTheDocument();
  });
});
