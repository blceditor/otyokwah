/**
 * REQ-CMS-012: AI-Powered SEO Generation - Panel Component Tests
 *
 * Tests for SEOGenerationPanel that generates SEO metadata
 * and auto-applies it to form fields via injectSEOIntoForm.
 */
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock injectSEOIntoForm for auto-apply behavior
vi.mock('@/lib/keystatic/injectSEOIntoForm', () => ({
  injectSEOIntoForm: vi.fn().mockReturnValue(true),
}));

import { SEOGenerationPanel } from './SEOGenerationPanel';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('REQ-CMS-012 — SEOGenerationPanel', () => {
  const mockPageContent = {
    title: 'About Bear Lake Camp',
    body: 'Bear Lake Camp is a Christian ministry center that challenges individuals toward maturity in Christ.',
  };

  const mockOnClose = vi.fn();
  const mockOnGenerated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  describe('Panel Rendering', () => {
    test('renders panel with header', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      expect(screen.getByText('Generate SEO Metadata')).toBeInTheDocument();
    });

    test('renders close button', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toBeInTheDocument();
    });

    test('clicking close button calls onClose', async () => {
      const user = userEvent.setup();
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    test('renders Generate SEO button', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      expect(screen.getByRole('button', { name: /generate seo/i })).toBeInTheDocument();
    });
  });

  describe('SEO Generation Flow', () => {
    test('shows loading state during generation', async () => {
      const user = userEvent.setup();
      mockFetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      expect(screen.getByText(/generating/i)).toBeInTheDocument();
    });

    test('shows success message after successful generation', async () => {
      const user = userEvent.setup();
      const mockSEOData = {
        metaTitle: 'About Bear Lake Camp | Christian Ministry Center',
        metaDescription: 'Discover Bear Lake Camp, a Christian ministry center dedicated to challenging individuals toward maturity in Christ.',
        ogTitle: 'About Bear Lake Camp',
        ogDescription: 'Christian ministry center for spiritual growth.',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSEOData,
      });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(screen.getByText(/seo applied successfully/i)).toBeInTheDocument();
      });
    });

    test('calls onGenerated after successful auto-apply', async () => {
      const user = userEvent.setup();
      const mockSEOData = {
        metaTitle: 'Test Title',
        metaDescription: 'Test description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSEOData,
      });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(mockOnGenerated).toHaveBeenCalledWith(mockSEOData);
      });
    });

    test('shows character counts in SEO preview after generation', async () => {
      const user = userEvent.setup();
      const mockSEOData = {
        metaTitle: 'Test Title', // 10 chars
        metaDescription: 'Test description', // 16 chars
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSEOData,
      });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(screen.getByText(/10\/60/)).toBeInTheDocument(); // metaTitle count
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error message on generation failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API key not configured' }),
      });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(screen.getByText(/api key not configured/i)).toBeInTheDocument();
      });
    });

    test('displays error message on network failure', async () => {
      const user = userEvent.setup();
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    test('allows retry after error', async () => {
      const user = userEvent.setup();
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            metaTitle: 'Retry Success Title',
            metaDescription: 'Retry Success Description',
            ogTitle: 'OG Retry',
            ogDescription: 'OG Retry Desc',
          }),
        });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      // First attempt fails
      await user.click(screen.getByRole('button', { name: /generate seo/i }));
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Retry succeeds — should show success
      await user.click(screen.getByRole('button', { name: /generate seo/i }));
      await waitFor(() => {
        expect(screen.getByText(/seo applied successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('REQ-CMS-019 — No Rate Limit', () => {
    test('no rate limit display in UI', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      expect(screen.queryByText(/this month/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/remaining/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
    });

    test('can generate without limit check', async () => {
      const user = userEvent.setup();
      const mockSEOData = {
        metaTitle: 'Test Title',
        metaDescription: 'Test description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSEOData,
      });

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await waitFor(() => {
        expect(screen.getByText(/seo applied successfully/i)).toBeInTheDocument();
      });

      expect(screen.queryByText(/limit reached/i)).not.toBeInTheDocument();
    });

    test('timeout still enforced at 30s', async () => {
      const user = userEvent.setup();
      vi.useFakeTimers({ shouldAdvanceTime: true });

      mockFetch.mockImplementation(() => new Promise(() => {}));

      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.click(screen.getByRole('button', { name: /generate seo/i }));

      await vi.advanceTimersByTimeAsync(31000);

      await waitFor(() => {
        expect(screen.getByText(/timed out/i)).toBeInTheDocument();
      });

      vi.useRealTimers();
    });
  });

  describe('Accessibility', () => {
    test('panel has accessible role', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('close button has aria-label', () => {
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAttribute('aria-label');
    });

    test('can close with Escape key', async () => {
      const user = userEvent.setup();
      render(
        <SEOGenerationPanel
          pageContent={mockPageContent}
          onClose={mockOnClose}
          onGenerated={mockOnGenerated}
        />
      );

      await user.keyboard('{Escape}');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
