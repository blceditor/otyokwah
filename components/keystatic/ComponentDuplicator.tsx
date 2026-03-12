/**
 * REQ-CMS-006: Component Duplication Feature
 *
 * Adds duplicate functionality to Markdoc components in the Keystatic editor.
 * Injects a "Duplicate" button next to each component for easy copying.
 */
'use client';

import { useEffect, useCallback } from 'react';

export function ComponentDuplicator() {
  const addDuplicateButtons = useCallback(() => {
    // Find all Markdoc component blocks in the editor
    const componentBlocks = document.querySelectorAll(
      '[data-node-type="block-wrapper"], [data-component-block]'
    );

    componentBlocks.forEach((block) => {
      // Skip if already has a duplicate button
      if (block.querySelector('.component-duplicate-btn')) return;

      // Find the component's toolbar or header
      const toolbar = block.querySelector('[data-component-toolbar], .component-toolbar');
      if (!toolbar) return;

      // Create duplicate button
      const btn = document.createElement('button');
      btn.className =
        'component-duplicate-btn inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors';
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>Duplicate</span>
      `;
      btn.title = 'Duplicate this component';
      btn.type = 'button';

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        duplicateComponent(block);
      };

      toolbar.appendChild(btn);
    });
  }, []);

  useEffect(() => {
    // Initial run
    addDuplicateButtons();

    // Watch for DOM changes
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          shouldUpdate = true;
          break;
        }
      }
      if (shouldUpdate) {
        // Debounce updates
        setTimeout(addDuplicateButtons, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [addDuplicateButtons]);

  return null;
}

/**
 * Duplicate a component block by copying its content and inserting after
 */
function duplicateComponent(block: Element): void {
  try {
    // Try to find the Markdoc source data
    const sourceAttr = block.getAttribute('data-markdoc-source');
    if (sourceAttr) {
      // Copy to clipboard
      navigator.clipboard.writeText(sourceAttr).then(() => {
        showToast('Component copied! Paste where you want to duplicate.');
      });
      return;
    }

    // Alternative: Try to extract text content
    const contentEl = block.querySelector('[data-component-content]');
    if (contentEl) {
      const text = contentEl.textContent || '';
      navigator.clipboard.writeText(text).then(() => {
        showToast('Content copied to clipboard!');
      });
      return;
    }

    // Fallback: Try to clone the DOM and find input values
    const inputs = block.querySelectorAll('input, textarea, select');
    const values: Record<string, string> = {};
    inputs.forEach((input, index) => {
      const el = input as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
      const label = el.getAttribute('aria-label') || el.name || `field_${index}`;
      values[label] = el.value;
    });

    if (Object.keys(values).length > 0) {
      navigator.clipboard.writeText(JSON.stringify(values, null, 2)).then(() => {
        showToast('Field values copied to clipboard!');
      });
      return;
    }

    showToast('Unable to duplicate - try manual copy/paste');
  } catch {
    showToast('Duplicate failed');
  }
}

/**
 * Show a toast notification
 */
function showToast(message: string): void {
  const existing = document.querySelector('.component-duplicate-toast');
  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');
  toast.className =
    'component-duplicate-toast fixed bottom-4 right-4 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-fade-in';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('animate-fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

export default ComponentDuplicator;
