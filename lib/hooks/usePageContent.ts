/**
 * REQ-CMS-012: AI-Powered SEO Generation - usePageContent Hook
 *
 * Extracts page content from Keystatic form fields for SEO generation.
 * Enhanced to extract rich context including slug, heroTagline, template type.
 *
 * Note: Keystatic doesn't use standard HTML name attributes on inputs.
 * We find body content via ProseMirror editor selectors.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PageContent } from '@/lib/types/seo';

const MAX_BODY_LENGTH = 4000; // Truncate for API efficiency
const EXTRACTION_DELAY_MS = 500; // Wait for DOM to stabilize
const MAX_RETRIES = 3;

/**
 * Strips HTML tags from content (P1 fix: using DOMParser instead of innerHTML)
 */
function stripHtml(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  } catch {
    // Fallback: simple regex strip (less safe but works)
    return html.replace(/<[^>]*>/g, '');
  }
}

/**
 * Normalizes whitespace in text
 */
function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Decodes HTML entities (P1 fix: using DOMParser instead of innerHTML)
 */
function decodeHtmlEntities(text: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'text/html');
    return doc.documentElement.textContent || '';
  } catch {
    // Fallback: return as-is
    return text;
  }
}

/**
 * Extracts slug from Keystatic URL path
 * Pattern: /keystatic/branch/{branch}/collection/pages/item/{slug}
 * Or: /keystatic/collection/pages/item/{slug}
 */
function extractSlugFromUrl(): string {
  if (typeof window === 'undefined') return '';

  const pathname = window.location.pathname;
  const match = pathname.match(/\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/(?:item\/)?([^/]+)/);
  return match ? match[1] : '';
}

/**
 * Gets value from an input/textarea by trying multiple selectors
 */
function getFieldValue(selectors: string[]): string {
  for (const selector of selectors) {
    const element = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
    if (element?.value) {
      return decodeHtmlEntities(element.value);
    }
  }
  return '';
}

/**
 * Hook to extract page content from Keystatic form fields
 */
export function usePageContent(propSlug: string): PageContent {
  // Store prop slug in ref to ensure it's never lost
  const slugFromProp = propSlug || '';

  const initialContent: PageContent = {
    title: '',
    slug: slugFromProp,
    heroTagline: '',
    templateType: '',
    templateFields: {},
    body: '',
  };

  const [content, setContent] = useState<PageContent>(initialContent);

  const extractContent = useCallback(() => {
    // Extract slug from URL, with multiple fallbacks
    const urlSlug = extractSlugFromUrl();
    // Priority: URL extraction > prop slug > empty
    const finalSlug = urlSlug || slugFromProp || '';

    // Find title input - expanded selectors for Keystatic's slug field
    const titleSelectors = [
      'input[name="title"]',
      'input[name*="title"][type="text"]',
      'input[name="name"]',  // Keystatic slug field uses "name" for display
      '[data-field="title"] input',
      'input[placeholder*="title" i]',
      // Keystatic renders slug fields with specific patterns
      'input[name="title__name"]',
      'input[id*="title"]',
    ];

    let title = getFieldValue(titleSelectors);

    // Fallback: derive title from slug
    if (!title && finalSlug) {
      title = finalSlug
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Extract heroTagline
    const heroTagline = getFieldValue([
      'input[name="heroTagline"]',
      '[data-field="heroTagline"] input',
      'input[name*="heroTagline"]',
    ]);

    // Extract templateType from discriminant field
    const templateTypeElement = document.querySelector(
      'select[name*="discriminant"], [data-field*="templateFields"] select, input[name*="discriminant"]'
    ) as HTMLSelectElement | HTMLInputElement | null;
    const templateType = templateTypeElement?.value || 'standard';

    // Extract template-specific fields
    const templateFields: PageContent['templateFields'] = {};

    const ageRange = getFieldValue(['input[name*="ageRange"]', '[data-field*="ageRange"] input']);
    if (ageRange) templateFields.ageRange = ageRange;

    const dates = getFieldValue(['input[name*="dates"]', '[data-field*="dates"] input']);
    if (dates) templateFields.dates = dates;

    const pricing = getFieldValue(['input[name*="pricing"]', '[data-field*="pricing"] input']);
    if (pricing) templateFields.pricing = pricing;

    const capacity = getFieldValue(['input[name*="capacity"]', '[data-field*="capacity"] input']);
    if (capacity) templateFields.capacity = capacity;

    // Find body content - try multiple selectors (order matters!)
    // Keystatic uses ProseMirror for rich text editing
    const bodySelectors = [
      '.ProseMirror',                    // Primary: ProseMirror editor
      '[contenteditable="true"]',        // Fallback: any contenteditable
      '[role="textbox"]',                // ARIA textbox role
      '[data-field="content"]',          // Keystatic data attribute
      '[data-field="body"]',             // Alternative data attribute
    ];

    let bodyElement: HTMLElement | null = null;
    for (const selector of bodySelectors) {
      bodyElement = document.querySelector(selector) as HTMLElement | null;
      if (bodyElement) break;
    }

    let body = '';

    if (bodyElement) {
      // Get text content and strip HTML
      const rawContent = bodyElement.innerHTML || bodyElement.textContent || '';
      body = stripHtml(rawContent);
      body = normalizeWhitespace(body);
      body = decodeHtmlEntities(body);

      // Truncate if too long
      if (body.length > MAX_BODY_LENGTH) {
        body = body.substring(0, MAX_BODY_LENGTH) + '...';
      }
    }

    setContent({
      title,
      slug: finalSlug,
      heroTagline,
      templateType,
      templateFields,
      body,
    });

    // Return body length for retry logic
    return body.length;
  }, [slugFromProp]);

  // Track retry count
  const retryCountRef = useRef(0);

  useEffect(() => {
    // Initial extraction with retry logic for body content
    const attemptExtraction = () => {
      const bodyLength = extractContent();

      // If body is empty and we haven't maxed out retries, try again
      if (bodyLength === 0 && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
        setTimeout(attemptExtraction, EXTRACTION_DELAY_MS);
      }
    };

    // Delay initial extraction to let DOM stabilize
    const initialTimeout = setTimeout(attemptExtraction, EXTRACTION_DELAY_MS);

    // Set up listeners for changes on multiple fields
    const handleFieldChange = () => {
      extractContent();
    };

    // Find all relevant inputs to monitor (Keystatic may not use name attrs)
    const inputSelectors = [
      'input[type="text"]',  // All text inputs (Keystatic doesn't use name attrs)
      'textarea',            // Textareas
    ];

    const inputs: (HTMLInputElement | HTMLTextAreaElement)[] = [];
    for (const selector of inputSelectors) {
      document.querySelectorAll(selector).forEach(input => {
        input.addEventListener('input', handleFieldChange);
        input.addEventListener('change', handleFieldChange);
        inputs.push(input as HTMLInputElement | HTMLTextAreaElement);
      });
    }

    // Set up MutationObserver for body content changes
    const bodySelectors = '.ProseMirror, [contenteditable="true"], [role="textbox"]';
    const bodyElement = document.querySelector(bodySelectors) as HTMLElement | null;

    let observer: MutationObserver | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    let isExtracting = false;

    const debouncedExtract = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (document.body.hasAttribute('data-media-dialog-open')) return;
        if (isExtracting) return;
        isExtracting = true;
        try {
          extractContent();
        } finally {
          isExtracting = false;
        }
      }, 300);
    };

    if (bodyElement) {
      observer = new MutationObserver(debouncedExtract);

      observer.observe(bodyElement, {
        childList: true,
        subtree: true,
      });
    } else {
      observer = new MutationObserver(() => {
        if (document.body.hasAttribute('data-media-dialog-open')) return;
        const newBodyElement = document.querySelector(bodySelectors);
        if (newBodyElement) {
          debouncedExtract();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      clearTimeout(initialTimeout);
      if (debounceTimer) clearTimeout(debounceTimer);
      for (const input of inputs) {
        input.removeEventListener('input', handleFieldChange);
        input.removeEventListener('change', handleFieldChange);
      }
      observer?.disconnect();
    };
  }, [slugFromProp, extractContent]);

  return content;
}

export default usePageContent;
