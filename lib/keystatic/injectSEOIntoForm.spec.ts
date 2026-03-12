/**
 * REQ-CMS-012: AI-Powered SEO Generation - injectSEOIntoForm Utility Tests
 *
 * Tests for utility that injects generated SEO data into Keystatic form fields.
 * The implementation uses label-text matching (not name attributes) because
 * Keystatic uses react-aria IDs, not name attributes.
 */
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

import { injectSEOIntoForm } from './injectSEOIntoForm';

/**
 * Creates a realistic Keystatic-like form field with label text and a
 * child input/textarea that has an id (like react-aria assigns).
 */
function createField(labelText: string, type: 'input' | 'textarea', id: string): HTMLDivElement {
  const wrapper = document.createElement('div');
  const label = document.createElement('label');
  label.textContent = labelText;
  label.setAttribute('for', id);
  wrapper.appendChild(label);

  const field = document.createElement(type);
  field.id = id;
  wrapper.appendChild(field);

  return wrapper;
}

describe('REQ-CMS-012 — injectSEOIntoForm', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Use a form element (not div) as outer container so querySelectorAll('div')
    // in findElementByLabel only matches the inner wrapper divs
    container = document.createElement('form');

    // Create Keystatic-like form with label text matching the implementation's FIELD_MAPPINGS
    container.appendChild(createField('Meta Title (50-60 characters)', 'input', 'field-meta-title'));
    container.appendChild(createField('Meta Description (150-155 characters)', 'textarea', 'field-meta-desc'));
    container.appendChild(createField('Open Graph Title (defaults to meta title)', 'input', 'field-og-title'));
    container.appendChild(createField('Open Graph Description (defaults to meta description)', 'textarea', 'field-og-desc'));

    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Field Injection', () => {
    test('injects metaTitle into form field', () => {
      const seoData = {
        metaTitle: 'Test Meta Title',
        metaDescription: 'Test description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
      };

      injectSEOIntoForm(seoData);

      const input = document.getElementById('field-meta-title') as HTMLInputElement;
      expect(input.value).toBe('Test Meta Title');
    });

    test('injects metaDescription into form field', () => {
      const seoData = {
        metaTitle: 'Title',
        metaDescription: 'This is the meta description for the page.',
        ogTitle: 'OG',
        ogDescription: 'OG Desc',
      };

      injectSEOIntoForm(seoData);

      const textarea = document.getElementById('field-meta-desc') as HTMLTextAreaElement;
      expect(textarea.value).toBe('This is the meta description for the page.');
    });

    test('injects ogTitle into form field', () => {
      const seoData = {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'Open Graph Title',
        ogDescription: 'OG Desc',
      };

      injectSEOIntoForm(seoData);

      const input = document.getElementById('field-og-title') as HTMLInputElement;
      expect(input.value).toBe('Open Graph Title');
    });

    test('injects ogDescription into form field', () => {
      const seoData = {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG Title',
        ogDescription: 'Open Graph description for social sharing.',
      };

      injectSEOIntoForm(seoData);

      const textarea = document.getElementById('field-og-desc') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Open Graph description for social sharing.');
    });

    test('injects all SEO fields at once', () => {
      const seoData = {
        metaTitle: 'Meta Title',
        metaDescription: 'Meta Description',
        ogTitle: 'OG Title',
        ogDescription: 'OG Description',
      };

      injectSEOIntoForm(seoData);

      expect((document.getElementById('field-meta-title') as HTMLInputElement).value).toBe('Meta Title');
      expect((document.getElementById('field-meta-desc') as HTMLTextAreaElement).value).toBe('Meta Description');
      expect((document.getElementById('field-og-title') as HTMLInputElement).value).toBe('OG Title');
      expect((document.getElementById('field-og-desc') as HTMLTextAreaElement).value).toBe('OG Description');
    });
  });

  describe('Event Dispatching', () => {
    test('dispatches input event after injection', () => {
      const inputHandler = vi.fn();
      const input = document.getElementById('field-meta-title') as HTMLInputElement;
      input.addEventListener('input', inputHandler);

      injectSEOIntoForm({
        metaTitle: 'Test',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(inputHandler).toHaveBeenCalled();
    });

    test('dispatches change event after injection', () => {
      const changeHandler = vi.fn();
      const input = document.getElementById('field-meta-title') as HTMLInputElement;
      input.addEventListener('change', changeHandler);

      injectSEOIntoForm({
        metaTitle: 'Test',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(changeHandler).toHaveBeenCalled();
    });

    test('events bubble up to parent', () => {
      const parentHandler = vi.fn();
      container.addEventListener('input', parentHandler);

      injectSEOIntoForm({
        metaTitle: 'Test',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(parentHandler).toHaveBeenCalled();
    });
  });

  describe('Missing Fields', () => {
    test('skips fields that do not exist in DOM', () => {
      // Remove ogTitle field wrapper
      const ogTitleWrapper = document.getElementById('field-og-title')?.parentElement;
      ogTitleWrapper?.remove();

      const seoData = {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG Title',
        ogDescription: 'OG Desc',
      };

      expect(() => injectSEOIntoForm(seoData)).not.toThrow();

      expect((document.getElementById('field-meta-title') as HTMLInputElement).value).toBe('Title');
    });

    test('handles completely empty DOM', () => {
      // Remove all children safely
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const seoData = {
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG',
        ogDescription: 'OG Desc',
      };

      expect(() => injectSEOIntoForm(seoData)).not.toThrow();
    });
  });

  describe('Partial Data', () => {
    test('handles partial SEO data with empty strings', () => {
      const seoData = {
        metaTitle: 'Only Title',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      };

      injectSEOIntoForm(seoData);

      expect((document.getElementById('field-meta-title') as HTMLInputElement).value).toBe('Only Title');
      // Empty string fields are skipped, so textarea keeps default empty value
      expect((document.getElementById('field-meta-desc') as HTMLTextAreaElement).value).toBe('');
    });

    test('does not overwrite existing values when data is empty', () => {
      const metaTitle = document.getElementById('field-meta-title') as HTMLInputElement;
      metaTitle.value = 'Existing Title';

      const seoData = {
        metaTitle: '',
        metaDescription: 'New Description',
        ogTitle: '',
        ogDescription: '',
      };

      injectSEOIntoForm(seoData);

      expect(metaTitle.value).toBe('Existing Title');
      expect((document.getElementById('field-meta-desc') as HTMLTextAreaElement).value).toBe('New Description');
    });
  });

  describe('Return Value', () => {
    test('returns true when at least one field was updated', () => {
      const result = injectSEOIntoForm({
        metaTitle: 'Title',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(result).toBe(true);
    });

    test('returns false when no fields were found', () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      const result = injectSEOIntoForm({
        metaTitle: 'Title',
        metaDescription: 'Desc',
        ogTitle: 'OG',
        ogDescription: 'OG Desc',
      });

      expect(result).toBe(false);
    });

    test('returns false when all values are empty', () => {
      const result = injectSEOIntoForm({
        metaTitle: '',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(result).toBe(false);
    });
  });

  describe('SEO Accordion', () => {
    test('expands collapsed SEO accordion', () => {
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = 'SEO Settings';
      details.appendChild(summary);
      details.appendChild(createField('Meta Title (50-60 characters)', 'input', 'field-accordion-title'));
      container.appendChild(details);

      expect(details.open).toBe(false);

      injectSEOIntoForm({
        metaTitle: 'Accordion Test',
        metaDescription: '',
        ogTitle: '',
        ogDescription: '',
      });

      expect(details.open).toBe(true);
    });
  });
});
