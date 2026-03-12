/**
 * REQ-CMS-012: AI-Powered SEO Generation - injectSEOIntoForm Utility
 *
 * Injects generated SEO data into Keystatic form fields and triggers
 * appropriate events for form state management.
 *
 * Note: Keystatic uses react-aria IDs, not name attributes.
 * We find fields by their label text within the SEO accordion.
 */

import type { SEOData } from '@/lib/types/seo';

interface FieldMapping {
  key: keyof SEOData;
  labelPatterns: string[];
  type: 'input' | 'textarea';
}

const FIELD_MAPPINGS: FieldMapping[] = [
  {
    key: 'metaTitle',
    labelPatterns: ['meta title', '50-60 characters'],
    type: 'input',
  },
  {
    key: 'metaDescription',
    labelPatterns: ['meta description', '150-155 characters'],
    type: 'textarea',
  },
  {
    key: 'ogTitle',
    labelPatterns: ['open graph title', 'og title', 'defaults to meta title'],
    type: 'input',
  },
  {
    key: 'ogDescription',
    labelPatterns: ['open graph description', 'og description', 'defaults to meta description'],
    type: 'textarea',
  },
];

/**
 * Finds an element by looking for nearby label text
 * Keystatic uses react-aria IDs, not name attributes
 */
function findElementByLabel(
  labelPatterns: string[],
  elementType: 'input' | 'textarea'
): HTMLInputElement | HTMLTextAreaElement | null {
  // Get all potential containers (divs that might contain label + input)
  const containers = document.querySelectorAll('div');

  for (const container of containers) {
    // Look for label text in this container
    const textContent = container.textContent?.toLowerCase() || '';

    // Check if any pattern matches
    const matches = labelPatterns.some(pattern => textContent.includes(pattern.toLowerCase()));

    if (matches) {
      // Find the input/textarea in this container
      const element = container.querySelector(elementType) as HTMLInputElement | HTMLTextAreaElement | null;

      if (element) {
        // Verify this is a form field (has an id)
        if (element.id) {
          return element;
        }
      }
    }
  }

  return null;
}

/**
 * Dispatches input and change events to trigger form state updates
 */
function dispatchEvents(element: HTMLInputElement | HTMLTextAreaElement): void {
  // Create and dispatch input event
  const inputEvent = new Event('input', { bubbles: true, cancelable: true });
  element.dispatchEvent(inputEvent);

  // Create and dispatch change event
  const changeEvent = new Event('change', { bubbles: true, cancelable: true });
  element.dispatchEvent(changeEvent);

  // For React controlled inputs, we may need to trigger a synthetic event
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    element.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    'value'
  )?.set;

  if (nativeInputValueSetter) {
    // This helps with React's synthetic event system
    const currentValue = element.value;
    nativeInputValueSetter.call(element, currentValue);

    const reactEvent = new Event('input', { bubbles: true });
    element.dispatchEvent(reactEvent);
  }
}

/**
 * Expands the SEO accordion if it exists and is collapsed
 * Note: :has-text() is Playwright-specific, not valid CSS - use JS iteration
 */
function expandSEOAccordion(): void {
  // Find SEO accordion by iterating through details elements
  const allDetails = document.querySelectorAll('details');
  for (const details of allDetails) {
    const summary = details.querySelector('summary');
    if (summary?.textContent?.toLowerCase().includes('seo')) {
      if (!details.open) {
        details.open = true;
      }
      return;
    }
  }

  // Fallback: try class-based selector
  const seoAccordion = document.querySelector(
    'details.seo-accordion'
  ) as HTMLDetailsElement | null;

  if (seoAccordion && !seoAccordion.open) {
    seoAccordion.open = true;
  }
}

/**
 * Injects SEO data into form fields
 *
 * @param data - The SEO data to inject
 * @returns true if at least one field was updated, false otherwise
 */
export function injectSEOIntoForm(data: SEOData): boolean {
  // First, expand the SEO accordion so fields are accessible
  expandSEOAccordion();

  // Small delay to allow DOM to update after accordion expansion
  let updatedCount = 0;

  for (const mapping of FIELD_MAPPINGS) {
    const value = data[mapping.key];

    // Skip empty values to avoid overwriting existing content
    if (!value) continue;

    const element = findElementByLabel(mapping.labelPatterns, mapping.type);

    if (element) {
      element.value = value;
      dispatchEvents(element);
      updatedCount++;
    }
  }
  return updatedCount > 0;
}

export default injectSEOIntoForm;
