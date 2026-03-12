/**
 * REQ-CMS-012: AI-Powered SEO Generation - usePageContent Hook Tests
 *
 * Tests for hook that extracts page content from Keystatic form fields.
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// Hook to be implemented
import { usePageContent } from './usePageContent';

describe('REQ-CMS-012 — usePageContent Hook', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Content Extraction', () => {
    test('extracts title from title input field', async () => {
      container.innerHTML = `
        <input name="title" value="About Bear Lake Camp" />
      `;

      const { result } = renderHook(() => usePageContent('about'));

      await waitFor(() => {
        expect(result.current.title).toBe('About Bear Lake Camp');
      });
    });

    test('extracts body content from content field', async () => {
      container.innerHTML = `
        <input name="title" value="Test" />
        <div data-field="content">
          <p>This is the page content.</p>
          <p>It has multiple paragraphs.</p>
        </div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        expect(result.current.body).toContain('This is the page content');
        expect(result.current.body).toContain('multiple paragraphs');
      });
    });

    test('returns empty strings when fields not found', async () => {
      container.innerHTML = `<div>No form fields</div>`;

      const { result } = renderHook(() => usePageContent('missing'));

      await waitFor(() => {
        expect(result.current.title).toBe('');
        expect(result.current.body).toBe('');
      });
    });

    test('strips HTML tags from body content', async () => {
      container.innerHTML = `
        <input name="title" value="Test" />
        <div data-field="content">
          <p><strong>Bold text</strong> and <em>italic text</em></p>
        </div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        expect(result.current.body).not.toContain('<strong>');
        expect(result.current.body).not.toContain('<em>');
        expect(result.current.body).toContain('Bold text');
        expect(result.current.body).toContain('italic text');
      });
    });
  });

  describe('Updates on Change', () => {
    test('updates when title input changes', async () => {
      container.innerHTML = `
        <input name="title" value="Original Title" />
      `;

      const { result, rerender } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        expect(result.current.title).toBe('Original Title');
      });

      // Simulate user changing the title
      const input = container.querySelector('input[name="title"]') as HTMLInputElement;
      input.value = 'Updated Title';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      rerender();

      await waitFor(() => {
        expect(result.current.title).toBe('Updated Title');
      });
    });

    test('updates when slug changes', async () => {
      container.innerHTML = `
        <input name="title" value="Page One" />
      `;

      const { result, rerender } = renderHook(
        ({ slug }) => usePageContent(slug),
        { initialProps: { slug: 'page-one' } }
      );

      await waitFor(() => {
        expect(result.current.title).toBe('Page One');
      });

      // Change slug
      container.innerHTML = `
        <input name="title" value="Page Two" />
      `;

      rerender({ slug: 'page-two' });

      await waitFor(() => {
        expect(result.current.title).toBe('Page Two');
      });
    });
  });

  describe('Content Processing', () => {
    test('truncates very long body content', async () => {
      const longContent = 'A'.repeat(10000);
      container.innerHTML = `
        <input name="title" value="Test" />
        <div data-field="content">${longContent}</div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        // Should truncate to reasonable length for API
        expect(result.current.body.length).toBeLessThan(5000);
      });
    });

    test('normalizes whitespace in body content', async () => {
      container.innerHTML = `
        <input name="title" value="Test" />
        <div data-field="content">
          Text   with    multiple     spaces
          and

          newlines
        </div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        // Should normalize to single spaces
        expect(result.current.body).not.toMatch(/\s{2,}/);
      });
    });
  });

  describe('Edge Cases', () => {
    test('handles special characters in content', async () => {
      container.innerHTML = `
        <input name="title" value="Test &amp; More" />
        <div data-field="content">Content with &quot;quotes&quot; &amp; ampersands</div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        expect(result.current.title).toBe('Test & More');
        expect(result.current.body).toContain('"quotes"');
        expect(result.current.body).toContain('&');
      });
    });

    test('handles empty content field', async () => {
      container.innerHTML = `
        <input name="title" value="Test" />
        <div data-field="content"></div>
      `;

      const { result } = renderHook(() => usePageContent('test'));

      await waitFor(() => {
        expect(result.current.body).toBe('');
      });
    });
  });
});
