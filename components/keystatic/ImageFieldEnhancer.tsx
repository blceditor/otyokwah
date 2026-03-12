'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

/**
 * REQ-FUTURE-019: Image Field Enhancer
 *
 * Injects "Suggest Alt Text" buttons into Keystatic image fields.
 * Uses MutationObserver to detect dynamically rendered fields.
 */
export function ImageFieldEnhancer() {
  const pathname = usePathname() ?? "";
  const observerRef = useRef<MutationObserver | null>(null);
  const enhancedFieldsRef = useRef<Set<Element>>(new Set());

  // Check if we're on a page editing route
  const isPageEditor = useCallback(() => {
    if (!pathname) return null;
    const normalizedPath = pathname.replace(/\/+$/, '');
    return normalizedPath.match(
      /\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/(?:item\/)?[^/]+$/
    );
  }, [pathname]);

  // Find and enhance image fields with alt text suggestion buttons
  const enhanceImageFields = useCallback(() => {
    if (!isPageEditor()) return;

    // Find alt text fields near image fields
    const altTextFields = document.querySelectorAll(
      'input[placeholder*="alt" i], input[aria-label*="alt" i], textarea[placeholder*="alt" i]'
    );

    const fieldsToEnhance = new Set<Element>();

    // Find alt text inputs that haven't been enhanced
    altTextFields.forEach((field) => {
      if (!enhancedFieldsRef.current.has(field)) {
        fieldsToEnhance.add(field);
      }
    });

    // Enhance each field
    fieldsToEnhance.forEach((field) => {
      injectSuggestButton(field as HTMLInputElement | HTMLTextAreaElement);
      enhancedFieldsRef.current.add(field);
    });
  }, [isPageEditor]);

  // Inject the suggest button next to an alt text field
  const injectSuggestButton = (
    altField: HTMLInputElement | HTMLTextAreaElement
  ) => {
    // Check if button already exists
    const existingButton = altField.parentElement?.querySelector(
      '.suggest-alt-text-btn'
    );
    if (existingButton) return;

    // Create button container
    const buttonWrapper = document.createElement('div');
    buttonWrapper.className =
      'suggest-alt-text-wrapper inline-flex items-center ml-2';

    buttonWrapper.innerHTML = `
      <button
        type="button"
        class="suggest-alt-text-btn inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
        title="Generate alt text with AI"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="suggest-icon">
          <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z"/>
          <path d="m14 7 3 3"/>
          <path d="M5 6v4"/>
          <path d="M19 14v4"/>
          <path d="M10 2v2"/>
          <path d="M7 8H3"/>
          <path d="M21 16h-4"/>
          <path d="M11 3H9"/>
        </svg>
        Suggest
      </button>
      <span class="suggest-alt-loading hidden ml-2 text-xs text-gray-500 dark:text-dark-muted">
        Generating...
      </span>
    `;

    // Find the image URL to use for generation
    const findImageUrl = (): string | null => {
      // Look for preview image in parent containers
      const container = altField.closest(
        'fieldset, [data-keystatic-image], [class*="image" i], div'
      );

      if (container) {
        const previewImg = container.querySelector(
          'img[src]:not([src=""])'
        ) as HTMLImageElement;
        if (previewImg?.src) {
          return previewImg.src;
        }
      }

      // Look for input with image value
      const imageInput = document.querySelector(
        'input[type="hidden"][value*="/images"], input[type="text"][value*="/images"]'
      ) as HTMLInputElement;
      if (imageInput?.value) {
        return imageInput.value;
      }

      return null;
    };

    // Handle button click
    const button = buttonWrapper.querySelector(
      '.suggest-alt-text-btn'
    ) as HTMLButtonElement;
    const loadingText = buttonWrapper.querySelector(
      '.suggest-alt-loading'
    ) as HTMLSpanElement;

    button.addEventListener('click', async () => {
      const imageUrl = findImageUrl();

      if (!imageUrl) {
        alert(
          'Could not find image URL. Please ensure an image is uploaded first.'
        );
        return;
      }

      // Show loading state
      button.disabled = true;
      button.classList.add('opacity-50', 'cursor-not-allowed');
      loadingText.classList.remove('hidden');

      try {
        const response = await fetch('/api/suggest-alt-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to generate alt text');
        }

        const data = await response.json();

        // Inject the alt text into the field
        altField.value = data.altText;

        // Trigger React's onChange handler
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(altField, data.altText);
        }

        // Dispatch events to notify React
        altField.dispatchEvent(new Event('input', { bubbles: true }));
        altField.dispatchEvent(new Event('change', { bubbles: true }));

        // Focus the field so user can review/edit
        altField.focus();
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Failed to generate alt text'
        );
      } finally {
        // Reset button state
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        loadingText.classList.add('hidden');
      }
    });

    // Insert button after the alt field or its label
    const parent = altField.parentElement;
    if (parent) {
      // Try to insert inline with the field
      if (
        parent.classList.contains('flex') ||
        getComputedStyle(parent).display === 'flex'
      ) {
        parent.appendChild(buttonWrapper);
      } else {
        // Insert after the field
        altField.insertAdjacentElement('afterend', buttonWrapper);
      }
    }
  };

  // Set up observer when on page editor
  useEffect(() => {
    if (!isPageEditor()) {
      enhancedFieldsRef.current.clear();
      return;
    }

    // Initial enhancement attempt
    const timeout = setTimeout(enhanceImageFields, 1000);

    // Set up observer for dynamic content with RAF debouncing
    let rafId: number | null = null;
    observerRef.current = new MutationObserver(() => {
      if (document.body.hasAttribute('data-media-dialog-open')) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        enhanceImageFields();
      });
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const currentObserver = observerRef.current;
    const currentEnhanced = enhancedFieldsRef.current;
    return () => {
      clearTimeout(timeout);
      if (rafId) cancelAnimationFrame(rafId);
      if (currentObserver) {
        currentObserver.disconnect();
      }
      currentEnhanced.clear();
    };
  }, [pathname, isPageEditor, enhanceImageFields]);

  return null;
}

export default ImageFieldEnhancer;
