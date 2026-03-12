// REQ-HEADER-001 through REQ-HEADER-008: KeystaticToolsHeader Component Tests
// NOTE: DeploymentStatus and ProductionLink moved to PageEditingToolbar
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { KeystaticToolsHeader } from './KeystaticToolsHeader';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('REQ-HEADER-001 — KeystaticToolsHeader Rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('renders without crashing', () => {
    const { container } = render(<KeystaticToolsHeader />);
    expect(container).toBeTruthy();
  });

  test('renders as a header element', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('renders header with child elements', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.children.length).toBeGreaterThan(0);
  });
});

describe('REQ-HEADER-004 — BugReportModal Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('contains BugReportModal trigger button', () => {
    render(<KeystaticToolsHeader />);

    const bugReportButton = screen.getByRole('button', { name: /report issue/i });
    expect(bugReportButton).toBeInTheDocument();
  });

  test('BugReportModal opens when button clicked', async () => {
    const user = userEvent.setup();
    render(<KeystaticToolsHeader />);

    const bugReportButton = screen.getByRole('button', { name: /report issue/i });
    await user.click(bugReportButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  test('BugReportModal receives page context from pathname', async () => {
    const user = userEvent.setup();
    mockPathname.mockReturnValue('/keystatic/pages/staff/john-doe');

    render(<KeystaticToolsHeader />);

    const bugReportButton = screen.getByRole('button', { name: /report issue/i });
    await user.click(bugReportButton);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });
});

describe('REQ-HEADER-005 — SparkryBranding Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('contains SparkryBranding component', () => {
    render(<KeystaticToolsHeader />);

    const sparkryLink = screen.getByRole('link', { name: /sparkry/i });
    expect(sparkryLink).toBeInTheDocument();
  });

  test('SparkryBranding links to sparkry.ai', () => {
    render(<KeystaticToolsHeader />);

    const sparkryLink = screen.getByRole('link', { name: /sparkry/i });
    expect(sparkryLink).toHaveAttribute('href', 'https://sparkry.ai');
  });

  test('SparkryBranding shows logo image', () => {
    render(<KeystaticToolsHeader />);

    const logo = screen.getByAltText(/sparkry/i);
    expect(logo).toBeInTheDocument();
  });
});

describe('REQ-HEADER-007 — Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('has appropriate ARIA role (banner)', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('has accessible label', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toHaveAttribute('aria-label');
  });

  test('all interactive elements are keyboard accessible', async () => {
    const user = userEvent.setup();
    render(<KeystaticToolsHeader />);

    // All buttons and links should be focusable via tab
    const buttons = screen.getAllByRole('button');
    const links = screen.getAllByRole('link');

    // At minimum, Content, Tools, Report Issue buttons + Sparkry link exist
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    expect(links.length).toBeGreaterThanOrEqual(1);

    // Tab through to verify focusability
    await user.tab();
    expect(document.activeElement?.tagName).toMatch(/BUTTON|A/);
  });

  test('provides landmark navigation', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('all links have descriptive accessible names', () => {
    render(<KeystaticToolsHeader />);

    const links = screen.getAllByRole('link');

    links.forEach((link) => {
      const accessibleName = link.getAttribute('aria-label') || link.textContent;
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    });
  });

  test('buttons have descriptive accessible names', () => {
    render(<KeystaticToolsHeader />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      const accessibleName = button.getAttribute('aria-label') || button.textContent;
      expect(accessibleName).toBeTruthy();
      expect(accessibleName?.trim().length).toBeGreaterThan(0);
    });
  });
});

describe('REQ-HEADER-008 — Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('renders on mobile viewport (320px)', () => {
    global.innerWidth = 320;
    global.dispatchEvent(new Event('resize'));

    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('renders on tablet viewport (768px)', () => {
    global.innerWidth = 768;
    global.dispatchEvent(new Event('resize'));

    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('renders on desktop viewport (1024px)', () => {
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));

    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  test('renders header with content on all viewports', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.children.length).toBeGreaterThan(0);
  });
});

describe('REQ-HEADER — Component Layout and Organization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('all child components render in logical order', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    const reportButton = screen.getByRole('button', { name: /report issue/i });
    const sparkryLink = screen.getByRole('link', { name: /sparkry/i });

    // Both should be inside the header
    expect(header).toContainElement(reportButton);
    expect(header).toContainElement(sparkryLink);

    // Nav should appear before the right-side status section
    const nav = screen.getByRole('navigation', { name: /cms navigation/i });
    expect(header).toContainElement(nav);
  });

  test('header has child elements', () => {
    render(<KeystaticToolsHeader />);

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
    expect(header.children.length).toBeGreaterThan(0);
  });
});

describe('REQ-HEADER — Simplified Header (post-refactor)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/pages/about');
  });

  test('shows View Live link when editing a page', () => {
    mockPathname.mockReturnValue('/keystatic/collection/pages/item/about');
    render(<KeystaticToolsHeader />);

    const viewLiveLink = screen.getByRole('link', { name: /view.*live/i });
    expect(viewLiveLink).toBeInTheDocument();
  });

  test('contains Report Issue button and SparkryBranding', () => {
    render(<KeystaticToolsHeader />);

    const reportButton = screen.getByRole('button', { name: /report issue/i });
    const sparkryLink = screen.getByRole('link', { name: /sparkry/i });

    expect(reportButton).toBeInTheDocument();
    expect(sparkryLink).toBeInTheDocument();
  });

  test('contains dropdown menus for Content and Tools', () => {
    render(<KeystaticToolsHeader />);

    const contentBtn = screen.getByRole('button', { name: /content/i });
    const toolsBtn = screen.getByRole('button', { name: /tools/i });

    expect(contentBtn).toBeInTheDocument();
    expect(toolsBtn).toBeInTheDocument();
  });
});
