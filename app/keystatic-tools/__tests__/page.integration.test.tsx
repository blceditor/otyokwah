// REQ-TOOLS-001: /keystatic-tools Integration Tests
// REQ-TOOLS-003: Component Integration with Props
//
// CRITICAL LEARNINGS FROM CAPA-2025-11-22:
// - Integration tests MUST verify components work together
// - Integration tests MUST verify actual DOM structure
// - Integration tests MUST verify component interactions
//
// These tests verify:
// 1. Components receive correct props
// 2. Page context is available to components
// 3. Async components load correctly
// 4. No runtime errors during render

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/keystatic-tools',
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('REQ-TOOLS-003 — Component Integration with Props', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset fetch mock
    (global.fetch as any).mockReset();

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

  test('BugReportModal integrates with default pageContext', async () => {
    // REQ-TOOLS-003: BugReportModal receives pageContext with default slug
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    // Open bug report modal
    const bugButton = screen.getByRole('button', { name: /report bug/i });
    await userEvent.click(bugButton);

    // Modal opens (proves pageContext prop is valid)
    const modal = await screen.findByRole('dialog');
    expect(modal).toBeVisible();

    // Fill out form
    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await userEvent.type(titleInput, 'Test bug');
    await userEvent.type(descriptionInput, 'Test description');

    // Mock API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await userEvent.click(submitButton);

    // Verify fetch called with correct context
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/submit-bug',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('keystatic-tools'),
        })
      );
    });
  });

  test('GenerateSEOButton integrates with pageContent and handler', async () => {
    // REQ-TOOLS-003: GenerateSEOButton receives pageContent and onSEOGenerated
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    const seoButton = screen.getByRole('button', { name: /generate seo/i });
    expect(seoButton).toBeVisible();

    // Mock API response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        metaTitle: 'Generated Title',
        metaDescription: 'Generated Description',
        ogTitle: 'Generated OG Title',
        ogDescription: 'Generated OG Description',
      }),
    });

    // Click generate button
    await userEvent.click(seoButton);

    // Verify fetch called with page content
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate-seo',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('CMS Tools'),
        })
      );
    });
  });

  test('ProductionLink integrates with Next.js pathname', async () => {
    // REQ-TOOLS-003: ProductionLink uses Next.js pathname hook
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    const productionLink = screen.getByLabelText('View live page on production site');
    expect(productionLink).toBeVisible();

    // Verify href includes production URL
    expect(productionLink).toHaveAttribute('href');
    const href = productionLink.getAttribute('href');
    expect(href).toContain('otyokwah');
  });

  test('DeploymentStatus integrates with Vercel API', async () => {
    // REQ-TOOLS-003: DeploymentStatus fetches from API
    const Page = (await import('../page')).default;

    // Mock deployment status API
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'Published',
        state: 'Published',
        timestamp: Date.now(),
      }),
    });

    render(<Page />);

    // Wait for status to load
    const statusElement = await screen.findByText(/Published/i);
    expect(statusElement).toBeVisible();

    // Verify API was called (tries /api/vercel-deployment-status first)
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/vercel-deployment-status');
    });
  });

  test('SparkryBranding renders standalone', async () => {
    // REQ-TOOLS-003: SparkryBranding works without props
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    const sparkryLogo = screen.getByAltText(/sparkry/i);
    expect(sparkryLogo).toBeVisible();

    // Verify it's a link to Sparkry.ai
    const sparkryLink = sparkryLogo.closest('a');
    expect(sparkryLink).toHaveAttribute('href');
    expect(sparkryLink?.getAttribute('href')).toContain('sparkry');
  });
});

describe('REQ-TOOLS-001 — Component Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();

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

  test('multiple components can be interacted with simultaneously', async () => {
    // REQ-TOOLS-001: All components are interactive
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    // Interact with ProductionLink
    const productionLink = screen.getByLabelText('View live page on production site');
    expect(productionLink).toBeVisible();

    // Interact with BugReportModal
    const bugButton = screen.getByRole('button', { name: /report bug/i });
    await userEvent.click(bugButton);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeVisible();

    // Close modal
    const closeButton = screen.getByLabelText(/close/i);
    await userEvent.click(closeButton);

    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    // Interact with GenerateSEOButton
    const seoButton = screen.getByRole('button', { name: /generate seo/i });
    expect(seoButton).toBeVisible();
  });

  test('components do not interfere with each other', async () => {
    // REQ-TOOLS-001: Components work together without conflicts
    const Page = (await import('../page')).default;

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    // All components should be visible simultaneously
    expect(screen.getByLabelText('View live page on production site')).toBeVisible();
    expect(screen.getByRole('button', { name: /report bug/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /generate seo/i })).toBeVisible();
    expect(screen.getByAltText(/sparkry/i)).toBeVisible();

    // DeploymentStatus may be loading
    const statusElement = screen.getByText(/Published|Deploying|Failed|Draft|Loading/i);
    expect(statusElement).toBeVisible();
  });

  test('async components load without blocking page render', async () => {
    // REQ-TOOLS-001: Async components load correctly
    const Page = (await import('../page')).default;

    // Mock slow API response
    (global.fetch as any).mockImplementationOnce(
      () =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => ({
                  status: 'Published',
                  state: 'Published',
                  timestamp: Date.now(),
                }),
              }),
            100
          )
        )
    );

    const { container } = render(<Page />);

    // Page should render immediately (not blocked by async DeploymentStatus)
    expect(container).toBeInTheDocument();

    // Other components should be visible immediately
    expect(screen.getByLabelText('View live page on production site')).toBeVisible();
    expect(screen.getByRole('button', { name: /report bug/i })).toBeVisible();

    // Wait for async component
    const statusElement = await screen.findByText(/Published/i, {}, { timeout: 2000 });
    expect(statusElement).toBeVisible();
  });
});

describe('REQ-TOOLS-003 — No Runtime Errors', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();

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

  test('page renders without runtime errors', async () => {
    // REQ-TOOLS-003: No console errors during render
    const Page = (await import('../page')).default;

    const originalError = console.error;
    const errors: any[] = [];
    console.error = (...args: any[]) => errors.push(args);

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    console.error = originalError;

    // Filter out expected warnings
    const realErrors = errors.filter(
      error =>
        !error[0]?.includes?.('Not implemented: HTMLFormElement') &&
        !error[0]?.includes?.('Could not parse CSS stylesheet') &&
        !error[0]?.includes?.('act(...)')
    );

    expect(realErrors.length).toBe(0);
  });

  test('components handle missing environment variables gracefully', async () => {
    // REQ-TOOLS-001: Components render with default/placeholder data when no context available
    const Page = (await import('../page')).default;

    // Mock API failures (simulating missing env vars)
    (global.fetch as any).mockRejectedValueOnce(new Error('API key missing'));

    render(<Page />);

    // Wait for async operations to settle
    await waitFor(() => {
      const heading = screen.queryByRole('heading', { level: 1 });
      expect(heading).toBeTruthy();
    });

    // Page should still render
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeVisible();

    // Components should still be visible (with error states or defaults)
    expect(screen.getByRole('button', { name: /report bug/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /generate seo/i })).toBeVisible();
  });

  test('page handles user interactions without errors', async () => {
    // REQ-TOOLS-001: No runtime errors in browser console
    const Page = (await import('../page')).default;

    const originalError = console.error;
    const errors: any[] = [];
    console.error = (...args: any[]) => errors.push(args);

    render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft/i);
      expect(statusElement).toBeTruthy();
    });

    // Perform user interactions
    const bugButton = screen.getByRole('button', { name: /report bug/i });
    await userEvent.click(bugButton);

    const modal = await screen.findByRole('dialog');
    expect(modal).toBeVisible();

    const closeButton = screen.getByLabelText(/close/i);
    await userEvent.click(closeButton);

    console.error = originalError;

    // Filter out expected warnings
    const realErrors = errors.filter(
      error =>
        !error[0]?.includes?.('Not implemented') &&
        !error[0]?.includes?.('Could not parse CSS')
    );

    expect(realErrors.length).toBe(0);
  });
});

describe('REQ-TOOLS-001 — Section Organization', () => {
  test('components are grouped in logical sections', async () => {
    // REQ-TOOLS-001: Components organized in logical sections
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Verify sections exist
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThanOrEqual(2);

    // Verify section headings
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.length).toBeGreaterThanOrEqual(2);

    // Verify at least one section heading mentions production/deployment or tools/support
    const headingTexts = headings.map(h => h.textContent);
    const hasRelevantHeadings = headingTexts.some(text =>
      text?.match(/production|deployment|tools|support|content/i)
    );
    expect(hasRelevantHeadings).toBe(true);
  });

  test('ProductionLink and DeploymentStatus are in same section', async () => {
    // REQ-TOOLS-001: Production & Deployment section groups related components
    const Page = (await import('../page')).default;

    const { container } = render(<Page />);

    // Wait for DeploymentStatus useEffect to complete
    await waitFor(() => {
      const statusElement = screen.queryByText(/Published|Deploying|Failed|Draft|Loading/i);
      expect(statusElement).toBeTruthy();
    });

    // Find ProductionLink
    const productionLink = screen.getByLabelText('View live page on production site');

    // Find DeploymentStatus (may be loading)
    const statusElement = screen.getByText(/Published|Deploying|Failed|Draft|Loading/i);

    // Verify they're in the same section or wrapper
    const productionSection = productionLink.closest('section');
    const statusSection = statusElement.closest('section');

    // If both are in sections, they should be the same section
    if (productionSection && statusSection) {
      expect(productionSection).toBe(statusSection);
    } else {
      // Or they should be in the same div wrapper
      const productionWrapper = productionLink.closest('div[class*="flex"], div[class*="grid"]');
      const statusWrapper = statusElement.closest('div[class*="flex"], div[class*="grid"]');
      expect(productionWrapper).toBe(statusWrapper);
    }
  });
});
