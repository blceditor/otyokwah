/**
 * REQ-CMS-001, REQ-CMS-012: Page Editing Toolbar Tests
 *
 * PageEditingToolbar provides modal dialogs for:
 * - SEOGenerationPanel (triggered via 'show-seo-panel' event)
 * - LinkValidator (triggered via 'show-link-validator' event)
 *
 * The floating toolbar UI has been moved to KeystaticToolsHeader.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock next/navigation
const mockPathname = vi.fn();
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock usePageContent hook
vi.mock('@/lib/hooks/usePageContent', () => ({
  usePageContent: vi.fn().mockReturnValue({
    title: 'Test Page',
    body: 'Test content',
  }),
}));

// Mock SEOGenerationPanel
vi.mock('./SEOGenerationPanel', () => ({
  SEOGenerationPanel: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" data-testid="seo-panel">
      <button onClick={onClose}>Close SEO</button>
    </div>
  ),
}));

// Mock LinkValidator
vi.mock('./LinkValidator', () => ({
  LinkValidator: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" data-testid="link-validator">
      <button onClick={onClose}>Close Links</button>
    </div>
  ),
}));

import { PageEditingToolbar } from './PageEditingToolbar';

describe('REQ-CMS-001 — PageEditingToolbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/keystatic/collection/pages/item/about');
  });

  describe('Rendering', () => {
    test('renders without crashing', () => {
      const { container } = render(<PageEditingToolbar />);
      expect(container).toBeTruthy();
    });

    test('renders no visible elements by default', () => {
      render(<PageEditingToolbar />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('SEO Panel Modal', () => {
    test('opens SEO panel when show-seo-panel event is dispatched', async () => {
      render(<PageEditingToolbar />);

      act(() => {
        window.dispatchEvent(new CustomEvent('show-seo-panel'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('seo-panel')).toBeInTheDocument();
      });
    });

    test('closes SEO panel when onClose is called', async () => {
      const userEvent = await import('@testing-library/user-event');
      const user = userEvent.default.setup();
      render(<PageEditingToolbar />);

      act(() => {
        window.dispatchEvent(new CustomEvent('show-seo-panel'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('seo-panel')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Close SEO'));

      await waitFor(() => {
        expect(screen.queryByTestId('seo-panel')).not.toBeInTheDocument();
      });
    });

    test('only shows SEO panel on page editing routes', async () => {
      mockPathname.mockReturnValue('/keystatic/dashboard');
      render(<PageEditingToolbar />);

      act(() => {
        window.dispatchEvent(new CustomEvent('show-seo-panel'));
      });

      // Panel should NOT appear since we're not on a page route
      await new Promise(r => setTimeout(r, 50));
      expect(screen.queryByTestId('seo-panel')).not.toBeInTheDocument();
    });
  });

  describe('Link Validator Modal', () => {
    test('opens link validator when show-link-validator event is dispatched', async () => {
      render(<PageEditingToolbar />);

      act(() => {
        window.dispatchEvent(new CustomEvent('show-link-validator'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('link-validator')).toBeInTheDocument();
      });
    });

    test('closes link validator when onClose is called', async () => {
      const userEvent = await import('@testing-library/user-event');
      const user = userEvent.default.setup();
      render(<PageEditingToolbar />);

      act(() => {
        window.dispatchEvent(new CustomEvent('show-link-validator'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('link-validator')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Close Links'));

      await waitFor(() => {
        expect(screen.queryByTestId('link-validator')).not.toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    test('removes event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<PageEditingToolbar />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('show-seo-panel', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('show-link-validator', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });
});
