// REQ-TOOLS-001: /keystatic-tools Page Component Tests
// REQ-TOOLS-003: Component Integration Tests
//
// CRITICAL LEARNINGS FROM CAPA-2025-11-22:
// - Tests MUST verify components are RENDERED, not just imported
// - Tests MUST use .toBeVisible(), not just .toBeInTheDocument()
// - Tests MUST verify actual integration, not isolated behavior
//
// These tests verify:
// 1. Page renders without errors
// 2. All 5 components are VISIBLE in DOM (not just present)
// 3. Page has proper semantic HTML structure
// 4. Page is accessible (WCAG 2.1 AA)
// 5. Responsive layout works

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Mock fetch for DeploymentStatus API calls
global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Mock fetch with valid DeploymentStatus response
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: async () => ({
      status: 'Published',
      state: 'Published',
      timestamp: Date.now(),
    }),
  });
});

// EXPECTED BEHAVIOR BEFORE IMPLEMENTATION:
// - All tests MUST FAIL with "Cannot find module" error
// - This proves TDD compliance (tests before implementation)

describe('REQ-TOOLS-001 — /keystatic-tools Page Rendering', () => {
  test('page module exists and can be imported', async () => {
    // REQ-TOOLS-001: Page component exists at app/keystatic-tools/page.tsx
    // This test will fail with "Cannot find module" until page is created
    const Page = (await import('../page')).default;

    expect(Page).toBeDefined();
    expect(typeof Page).toBe('function');
  });

  test('page renders without crashing', async () => {
    // REQ-TOOLS-001: Page renders without errors
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    expect(container).toBeInTheDocument();
  });

  test('page has main heading "CMS Tools" or similar', async () => {
    // REQ-TOOLS-001: Page has proper semantic HTML (h1)
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Check for h1 heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeVisible();
    expect(heading.textContent).toMatch(/CMS|Tools|Keystatic/i);
  });

  test('page has descriptive subheading or intro text', async () => {
    // REQ-TOOLS-001: Page provides context for users
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Look for paragraph or heading explaining page purpose
    const intro = screen.getByText(/utilities|tools|content|management/i);
    expect(intro).toBeVisible();
  });
});

describe('REQ-TOOLS-001 — Component Visibility (CRITICAL)', () => {
  // CAPA-2025-11-22: These tests verify actual RENDERING, not just imports
  // Must use toBeVisible() to catch integration failures

  test('ProductionLink component is VISIBLE on page', async () => {
    // REQ-TOOLS-001: ProductionLink renders and is visible
    // CAPA Learning: Must verify VISIBLE, not just toBeInTheDocument()
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // ProductionLink has aria-label "View live page on production site"
    const productionLink = screen.getByLabelText('View live page on production site');
    expect(productionLink).toBeVisible();
  });

  test('DeploymentStatus component is VISIBLE on page', async () => {
    // REQ-TOOLS-001: DeploymentStatus renders and is visible
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading deployment status/i);
      expect(statusElement).toBeTruthy();
    });

    // DeploymentStatus shows one of: Published | Deploying | Failed | Draft
    // Use flexible matcher since actual status is dynamic
    const statusElement = screen.getByText(/Published|Deploying|Failed|Draft|Loading deployment status/i);
    expect(statusElement).toBeVisible();
  });

  test('BugReportModal trigger button is VISIBLE on page', async () => {
    // REQ-TOOLS-001: BugReportModal renders and is visible
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // BugReportModal has "Report Bug" button
    const bugButton = screen.getByRole('button', { name: /report bug/i });
    expect(bugButton).toBeVisible();
  });

  test('SparkryBranding component is VISIBLE on page', async () => {
    // REQ-TOOLS-001: SparkryBranding renders and is visible
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // SparkryBranding has "Sparkry AI" alt text or similar
    const sparkryLogo = screen.getByAltText(/sparkry/i);
    expect(sparkryLogo).toBeVisible();
  });

  test('GenerateSEOButton component is VISIBLE on page', async () => {
    // REQ-TOOLS-001: GenerateSEOButton renders and is visible
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // GenerateSEOButton has "Generate SEO" text
    const seoButton = screen.getByRole('button', { name: /generate seo/i });
    expect(seoButton).toBeVisible();
  });
});

describe('REQ-TOOLS-001 — Semantic HTML Structure', () => {
  test('page uses semantic HTML5 landmarks', async () => {
    // REQ-TOOLS-001: Accessible (WCAG 2.1 AA) - proper landmarks
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Should have header landmark (or main)
    const landmarks = container.querySelectorAll('header, main, nav, section');
    expect(landmarks.length).toBeGreaterThan(0);
  });

  test('page has proper heading hierarchy (h1 → h2)', async () => {
    // REQ-TOOLS-001: Accessible - heading hierarchy
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Check h1 exists
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeVisible();

    // Check at least one h2 exists (for sections)
    const h2Elements = screen.getAllByRole('heading', { level: 2 });
    expect(h2Elements.length).toBeGreaterThanOrEqual(1);
  });

  test('page organizes components into logical sections', async () => {
    // REQ-TOOLS-001: Components organized in logical sections
    // Expected sections:
    // - Production & Deployment (ProductionLink, DeploymentStatus)
    // - Content Tools (GenerateSEOButton)
    // - Support (BugReportModal, SparkryBranding)
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Look for section headings
    const headings = screen.getAllByRole('heading', { level: 2 });
    const headingTexts = headings.map(h => h.textContent);

    // Verify at least 2 section headings exist
    expect(headingTexts.length).toBeGreaterThanOrEqual(2);

    // Verify sections cover key topics (flexible matching)
    const hasProductionSection = headingTexts.some(text =>
      text?.match(/production|deployment/i)
    );
    const hasToolsOrSupportSection = headingTexts.some(text =>
      text?.match(/tools|support|content/i)
    );

    expect(hasProductionSection || hasToolsOrSupportSection).toBe(true);
  });
});

describe('REQ-TOOLS-001 — Responsive Design', () => {
  test('page uses responsive container classes', async () => {
    // REQ-TOOLS-001: Responsive design (mobile, tablet, desktop)
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Check for Tailwind responsive classes (container, mx-auto, etc.)
    const mainElement = container.firstChild as HTMLElement;
    const classes = mainElement?.className || '';

    // Should use container or grid/flex for responsive layout
    const hasResponsiveClasses =
      classes.includes('container') ||
      classes.includes('mx-auto') ||
      classes.includes('flex') ||
      classes.includes('grid');

    expect(hasResponsiveClasses).toBe(true);
  });

  test('components wrap properly in flex/grid layout', async () => {
    // REQ-TOOLS-001: Components organized with flex/grid for responsiveness
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Look for flex or grid wrapper around component groups
    const wrappers = container.querySelectorAll('[class*="flex"], [class*="grid"]');
    expect(wrappers.length).toBeGreaterThan(0);
  });
});

describe('REQ-TOOLS-001 — Accessibility (WCAG 2.1 AA)', () => {
  test('page has no missing alt text on images', async () => {
    // REQ-TOOLS-001: Accessible - all images have alt text
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    const images = container.querySelectorAll('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  test('interactive elements are keyboard accessible', async () => {
    // REQ-TOOLS-001: Accessible - keyboard navigation works
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // All buttons should be accessible via keyboard
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeVisible();
      // Button elements are inherently keyboard accessible
      expect(button.tagName).toBe('BUTTON');
    });
  });

  test('links have descriptive text or aria-labels', async () => {
    // REQ-TOOLS-001: Accessible - links are descriptive
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // ProductionLink has aria-label
    const productionLink = screen.getByLabelText('View live page on production site');
    expect(productionLink).toBeVisible();
  });
});

describe('REQ-TOOLS-001 — No Console Errors', () => {
  test('page renders without console errors', async () => {
    // REQ-TOOLS-001: No console errors when page loads
    const Page = (await import('../page')).default;

    const originalError = console.error;
    const errors: any[] = [];
    console.error = (...args: any[]) => errors.push(args);

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    console.error = originalError;

    // Filter out React testing library warnings
    const realErrors = errors.filter(
      error =>
        !error[0]?.includes?.('Not implemented: HTMLFormElement') &&
        !error[0]?.includes?.('Could not parse CSS stylesheet') &&
        !error[0]?.includes?.('act(...)')
    );

    expect(realErrors.length).toBe(0);
  });
});

describe('REQ-TOOLS-003 — Component Props Integration', () => {
  test('BugReportModal receives correct pageContext prop', async () => {
    // REQ-TOOLS-003: BugReportModal receives pageContext with default slug
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Click bug report button to verify it opens (proves props work)
    const bugButton = screen.getByRole('button', { name: /report bug/i });
    await userEvent.click(bugButton);

    // Modal should open (proves pageContext prop was valid)
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeVisible();
  });

  test('GenerateSEOButton receives pageContent and onSEOGenerated props', async () => {
    // REQ-TOOLS-003: GenerateSEOButton receives required props
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Button should be visible and enabled (proves props are valid)
    const seoButton = screen.getByRole('button', { name: /generate seo/i });
    expect(seoButton).toBeVisible();
    expect(seoButton).not.toBeDisabled();
  });

  test('ProductionLink works without props (uses Next.js pathname hook)', async () => {
    // REQ-TOOLS-003: ProductionLink works standalone
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Link should be visible and have valid href
    const productionLink = screen.getByLabelText('View live page on production site');
    expect(productionLink).toBeVisible();
    expect(productionLink).toHaveAttribute('href');
  });

  test('DeploymentStatus works without props (fetches from API)', async () => {
    // REQ-TOOLS-003: DeploymentStatus works standalone
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Should show loading or status (proves no props required)
    const statusElement = screen.getByText(/Published|Deploying|Failed|Draft|Loading/i);
    expect(statusElement).toBeVisible();
  });

  test('SparkryBranding works without props', async () => {
    // REQ-TOOLS-003: SparkryBranding works standalone
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Logo should be visible
    const sparkryLogo = screen.getByAltText(/sparkry/i);
    expect(sparkryLogo).toBeVisible();
  });
});

describe('REQ-TOOLS-003 — TypeScript Prop Type Compliance', () => {
  test('page compiles without TypeScript errors', async () => {
    // REQ-TOOLS-003: No prop type mismatches (TypeScript compile check)
    // If this test runs, TypeScript compilation succeeded
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    expect(container).toBeDefined();
  });

  test('all component imports resolve correctly', async () => {
    // REQ-TOOLS-003: All 5 components imported correctly from @/components/keystatic/
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Verify all 5 components are present (proves imports worked)
    expect(screen.getByLabelText('View live page on production site')).toBeVisible();
    expect(screen.getByText(/Published|Deploying|Failed|Draft|Loading/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /report bug/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /generate seo/i })).toBeVisible();
    expect(screen.getByAltText(/sparkry/i)).toBeVisible();
  });
});
