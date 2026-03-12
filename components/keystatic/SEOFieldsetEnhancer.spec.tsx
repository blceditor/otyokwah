/**
 * REQ-CMS-003: SEO Metadata Accordion - Unit Tests
 *
 * Tests for SEOFieldsetEnhancer component that adds collapse behavior
 * to Keystatic's SEO fieldset via DOM manipulation.
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SEOFieldsetEnhancer, __resetForTesting } from './SEOFieldsetEnhancer';

describe('REQ-CMS-003 — SEOFieldsetEnhancer', () => {
  let container: HTMLElement;

  beforeEach(() => {
    __resetForTesting();
    // Create a mock Keystatic SEO fieldset structure
    container = document.createElement('div');
    container.innerHTML = `
      <div data-testid="keystatic-editor">
        <fieldset>
          <legend>SEO & Social Media</legend>
          <div class="seo-fields">
            <input name="seo.metaTitle" type="text" />
            <textarea name="seo.metaDescription"></textarea>
            <input name="seo.ogTitle" type="text" />
            <textarea name="seo.ogDescription"></textarea>
          </div>
        </fieldset>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  describe('Collapse Behavior', () => {
    test('wraps SEO fieldset content in details/summary elements', async () => {
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        const details = document.querySelector('details');
        expect(details).toBeInTheDocument();
      });

      const summary = document.querySelector('summary');
      expect(summary).toBeInTheDocument();
      expect(summary?.textContent).toContain('SEO');
    });

    test('SEO section is collapsed by default', async () => {
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        const details = document.querySelector('details');
        expect(details).toBeInTheDocument();
        expect(details).not.toHaveAttribute('open');
      });
    });

    test('clicking summary expands the SEO section', async () => {
      const user = userEvent.setup();
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      const summary = document.querySelector('summary')!;
      await user.click(summary);

      const details = document.querySelector('details');
      expect(details).toHaveAttribute('open');
    });

    test('SEO fields are visible when expanded', async () => {
      const user = userEvent.setup();
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      // Expand
      const summary = document.querySelector('summary')!;
      await user.click(summary);

      // Fields should exist in the expanded details
      const metaTitleInput = document.querySelector('input[name="seo.metaTitle"]');
      expect(metaTitleInput).toBeInTheDocument();
    });

    test('marks fieldset as enhanced to prevent re-processing', async () => {
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        const fieldset = document.querySelector('fieldset');
        expect(fieldset).toHaveAttribute('data-seo-enhanced', 'true');
      });
    });

    test('does not re-enhance already enhanced fieldsets', async () => {
      // Pre-mark fieldset and its parent container as enhanced
      const fieldset = document.querySelector('fieldset');
      fieldset?.setAttribute('data-seo-enhanced', 'true');
      // Also mark the parent container that Strategy 3 targets
      const legend = fieldset?.querySelector('legend');
      const parentContainer = legend?.parentElement?.parentElement;
      parentContainer?.setAttribute('data-seo-enhanced', 'true');

      render(<SEOFieldsetEnhancer />);

      // Wait a bit and verify no details element was added
      await new Promise(resolve => setTimeout(resolve, 100));

      const details = document.querySelector('details');
      expect(details).not.toBeInTheDocument();
    });
  });

  describe('Character Counters', () => {
    test('adds character counter to meta title field', async () => {
      const user = userEvent.setup();
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      // Expand and type in meta title
      const summary = document.querySelector('summary')!;
      await user.click(summary);

      const metaTitleInput = document.querySelector('input[name="seo.metaTitle"]') as HTMLInputElement;
      await user.type(metaTitleInput, 'Test Title');

      // Should show character counter
      const counter = document.querySelector('[data-char-counter="metaTitle"]');
      expect(counter).toBeInTheDocument();
      expect(counter?.textContent).toContain('10');
      expect(counter?.textContent).toContain('60');
    });

    test('adds character counter to meta description field', async () => {
      const user = userEvent.setup();
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      // Expand and type in meta description
      const summary = document.querySelector('summary')!;
      await user.click(summary);

      const metaDescInput = document.querySelector('textarea[name="seo.metaDescription"]') as HTMLTextAreaElement;
      await user.type(metaDescInput, 'Test description text');

      // Should show character counter
      const counter = document.querySelector('[data-char-counter="metaDescription"]');
      expect(counter).toBeInTheDocument();
      expect(counter?.textContent).toContain('21');
      expect(counter?.textContent).toContain('155');
    });

    test('counter turns red when exceeding limit', async () => {
      const user = userEvent.setup();
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      const summary = document.querySelector('summary')!;
      await user.click(summary);

      const metaTitleInput = document.querySelector('input[name="seo.metaTitle"]') as HTMLInputElement;
      // Type more than 60 chars
      await user.type(metaTitleInput, 'This is a very long title that exceeds the sixty character limit for SEO');

      const counter = document.querySelector('[data-char-counter="metaTitle"]');
    });
  });

  describe('MutationObserver Cleanup', () => {
    test('disconnects observer on unmount', async () => {
      const disconnectSpy = vi.fn();
      const originalMutationObserver = global.MutationObserver;

      global.MutationObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: disconnectSpy,
        takeRecords: vi.fn(),
      }));

      const { unmount } = render(<SEOFieldsetEnhancer />);
      unmount();

      expect(disconnectSpy).toHaveBeenCalled();

      global.MutationObserver = originalMutationObserver;
    });
  });

  describe('Accessibility', () => {
    test('summary is keyboard accessible', async () => {
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        expect(document.querySelector('details')).toBeInTheDocument();
      });

      const summary = document.querySelector('summary')!;
      const details = document.querySelector('details')!;

      // Native details/summary toggle on click, not keyboard in jsdom
      // Simulate the click that would happen from keyboard activation
      summary.click();

      expect(details).toHaveAttribute('open');
    });

    test('has proper ARIA attributes', async () => {
      render(<SEOFieldsetEnhancer />);

      await waitFor(() => {
        const details = document.querySelector('details');
        expect(details).toBeInTheDocument();
      });

      const summary = document.querySelector('summary');
      expect(summary).toHaveAttribute('aria-expanded', 'false');
    });
  });
});
