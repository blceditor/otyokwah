/**
 * REQ-CMS-003: SEO Metadata Accordion
 *
 * Enhances Keystatic's SEO fieldset with collapse behavior via DOM manipulation.
 * Uses MutationObserver to detect when SEO fields are rendered and wraps them
 * in a native <details>/<summary> element for collapse functionality.
 */
"use client";

import { useEffect, useRef } from "react";

const MAX_META_TITLE_LENGTH = 60;
const MAX_META_DESCRIPTION_LENGTH = 155;

// Track cleanup functions for event listeners (P0 fix: memory leak prevention)
const listenerCleanups = new Set<() => void>();

// Re-entrancy guard to prevent cascade with other MutationObservers
let isEnhancing = false;

/**
 * Creates SVG chevron icon without innerHTML (P0 fix: XSS prevention)
 */
function createChevronSVG(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "w-4 h-4");
  svg.setAttribute("viewBox", "0 0 20 20");
  svg.setAttribute("fill", "currentColor");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill-rule", "evenodd");
  path.setAttribute("clip-rule", "evenodd");
  path.setAttribute(
    "d",
    "M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z",
  );

  svg.appendChild(path);
  return svg;
}

/**
 * Creates a character counter element
 */
function createCharCounter(
  fieldName: string,
  currentLength: number,
  maxLength: number,
): HTMLSpanElement {
  const counter = document.createElement("span");
  counter.setAttribute("data-char-counter", fieldName);
  counter.className = `text-xs ml-2 ${currentLength > maxLength ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-dark-muted"}`;
  counter.textContent = `${currentLength}/${maxLength}`;
  return counter;
}

/**
 * Adds character counter to a field with cleanup tracking
 */
function addCharCounter(
  input: HTMLInputElement | HTMLTextAreaElement,
  fieldName: string,
  maxLength: number,
): void {
  const parent = input.parentElement;
  if (!parent) return;

  // Remove existing counter if present
  const existingCounter = parent.querySelector(
    `[data-char-counter="${fieldName}"]`,
  );
  if (existingCounter) {
    existingCounter.remove();
  }

  // Create and add counter
  const counter = createCharCounter(fieldName, input.value.length, maxLength);
  parent.appendChild(counter);

  // Update handler with cleanup tracking (P0 fix: memory leak prevention)
  const updateHandler = () => {
    counter.textContent = `${input.value.length}/${maxLength}`;
    counter.className = `text-xs ml-2 ${input.value.length > maxLength ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-dark-muted"}`;
  };

  input.addEventListener("input", updateHandler);

  // Track cleanup
  listenerCleanups.add(() => {
    input.removeEventListener("input", updateHandler);
  });
}

/**
 * Enhances SEO fieldset with collapse behavior and character counters
 */
function enhanceSEOFieldset(fieldset: Element): void {
  // Mark as enhanced to prevent re-processing
  if (fieldset.hasAttribute("data-seo-enhanced")) return;
  fieldset.setAttribute("data-seo-enhanced", "true");

  const legend = fieldset.querySelector("legend");
  const content = fieldset.querySelector(":scope > div");

  if (!legend || !content) return;

  // Create details/summary structure
  const details = document.createElement("details");
  details.className = "seo-accordion";

  const summary = document.createElement("summary");
  summary.className =
    "cursor-pointer font-medium text-gray-700 dark:text-dark-text py-2 px-3 bg-gray-50 dark:bg-dark-surface rounded-t border border-gray-200 dark:border-dark-border flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors";
  summary.setAttribute("aria-expanded", "false");
  summary.setAttribute(
    "aria-label",
    "SEO & Social Media section. Press Enter or Space to expand/collapse",
  );

  // Add expand/collapse indicator (P0 fix: using createElement instead of innerHTML)
  const indicator = document.createElement("span");
  indicator.className = "transform transition-transform duration-200";
  indicator.appendChild(createChevronSVG());

  const labelText = document.createElement("span");
  labelText.textContent = legend.textContent || "SEO & Social Media";

  const hint = document.createElement("span");
  hint.className = "text-xs text-gray-400 dark:text-dark-muted ml-auto";
  hint.textContent = "(click to expand)";

  summary.appendChild(indicator);
  summary.appendChild(labelText);
  summary.appendChild(hint);

  // Wrap content
  const contentWrapper = document.createElement("div");
  contentWrapper.className =
    "border border-t-0 border-gray-200 dark:border-dark-border rounded-b p-4 bg-white dark:bg-dark-surface";

  // Move content nodes (not clone)
  while (content.firstChild) {
    contentWrapper.appendChild(content.firstChild);
  }

  details.appendChild(summary);
  details.appendChild(contentWrapper);

  // Update aria-expanded on toggle with cleanup tracking (P0 fix: memory leak prevention)
  const toggleHandler = () => {
    summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    indicator.style.transform = details.open ? "rotate(90deg)" : "rotate(0deg)";
    hint.textContent = details.open
      ? "(click to collapse)"
      : "(click to expand)";
  };

  details.addEventListener("toggle", toggleHandler);

  // Track cleanup
  listenerCleanups.add(() => {
    details.removeEventListener("toggle", toggleHandler);
  });

  // Replace original content
  legend.style.display = "none";
  content.replaceWith(details);

  // Add character counters to SEO fields
  const metaTitleInput = contentWrapper.querySelector(
    'input[name*="metaTitle"]',
  ) as HTMLInputElement;
  const metaDescInput = contentWrapper.querySelector(
    'textarea[name*="metaDescription"]',
  ) as HTMLTextAreaElement;

  if (metaTitleInput) {
    addCharCounter(metaTitleInput, "metaTitle", MAX_META_TITLE_LENGTH);
  }

  if (metaDescInput) {
    addCharCounter(
      metaDescInput,
      "metaDescription",
      MAX_META_DESCRIPTION_LENGTH,
    );
  }
}

/**
 * Enhances Keystatic object field container with collapse behavior
 * Keystatic renders object fields as divs, not fieldsets
 */
function enhanceKestaticObjectField(
  container: Element,
  labelElement: Element,
): void {
  // Mark as enhanced to prevent re-processing
  if (container.hasAttribute("data-seo-enhanced")) return;
  container.setAttribute("data-seo-enhanced", "true");

  // Find the content div (sibling or child after the label)
  const contentDiv =
    container.querySelector(":scope > div:last-child") ||
    labelElement.nextElementSibling;

  if (!contentDiv || contentDiv === labelElement) return;

  // Create details/summary structure
  const details = document.createElement("details");
  details.className = "seo-accordion";

  const summary = document.createElement("summary");
  summary.className =
    "cursor-pointer font-medium text-gray-700 dark:text-dark-text py-2 px-3 bg-gray-50 dark:bg-dark-surface rounded-t border border-gray-200 dark:border-dark-border flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors";
  summary.setAttribute("aria-expanded", "false");
  summary.setAttribute(
    "aria-label",
    "SEO & Social Media section. Press Enter or Space to expand/collapse",
  );

  // Add expand/collapse indicator
  const indicator = document.createElement("span");
  indicator.className = "transform transition-transform duration-200";
  indicator.appendChild(createChevronSVG());

  const labelText = document.createElement("span");
  labelText.textContent = labelElement.textContent || "SEO & Social Media";

  const hint = document.createElement("span");
  hint.className = "text-xs text-gray-400 dark:text-dark-muted ml-auto";
  hint.textContent = "(click to expand)";

  summary.appendChild(indicator);
  summary.appendChild(labelText);
  summary.appendChild(hint);

  // Wrap content
  const contentWrapper = document.createElement("div");
  contentWrapper.className =
    "border border-t-0 border-gray-200 dark:border-dark-border rounded-b p-4 bg-white dark:bg-dark-surface";

  // Move content nodes (not clone) to preserve React fiber references
  while (contentDiv.firstChild) {
    contentWrapper.appendChild(contentDiv.firstChild);
  }

  details.appendChild(summary);
  details.appendChild(contentWrapper);

  // Update aria-expanded on toggle
  const toggleHandler = () => {
    summary.setAttribute("aria-expanded", details.open ? "true" : "false");
    indicator.style.transform = details.open ? "rotate(90deg)" : "rotate(0deg)";
    hint.textContent = details.open
      ? "(click to collapse)"
      : "(click to expand)";
  };

  details.addEventListener("toggle", toggleHandler);
  listenerCleanups.add(() => {
    details.removeEventListener("toggle", toggleHandler);
  });

  // Hide original label and replace content
  labelElement.setAttribute("style", "display: none !important");
  contentDiv.replaceWith(details);

  // Add character counters to SEO fields
  const metaTitleInput = contentWrapper.querySelector(
    'input[name*="metaTitle"]',
  ) as HTMLInputElement;
  const metaDescInput = contentWrapper.querySelector(
    'textarea[name*="metaDescription"]',
  ) as HTMLTextAreaElement;

  if (metaTitleInput) {
    addCharCounter(metaTitleInput, "metaTitle", MAX_META_TITLE_LENGTH);
  }

  if (metaDescInput) {
    addCharCounter(
      metaDescInput,
      "metaDescription",
      MAX_META_DESCRIPTION_LENGTH,
    );
  }
}

/**
 * REQ-CMS-005: Hide empty fieldsets that have no content
 * Checks if a fieldset has any meaningful content (inputs, textareas, selects)
 */
function hideEmptyFieldsets(): void {
  const fieldsets = document.querySelectorAll("fieldset, details");
  fieldsets.forEach((fieldset) => {
    // Skip already processed elements
    if (fieldset.hasAttribute("data-empty-checked")) return;
    fieldset.setAttribute("data-empty-checked", "true");

    // Check for any form inputs
    const hasInputs = fieldset.querySelector(
      'input, textarea, select, [contenteditable="true"]',
    );

    // Check for meaningful text content (excluding legend/summary)
    const clone = fieldset.cloneNode(true) as HTMLElement;
    clone.querySelector("legend, summary")?.remove();
    const textContent = clone.textContent?.trim() || "";

    // If no inputs and minimal text, hide it
    if (!hasInputs && textContent.length < 10) {
      (fieldset as HTMLElement).style.display = "none";
    }
  });
}

/**
 * Finds and enhances SEO sections in the DOM
 * Supports both traditional fieldsets and Keystatic's div-based structure
 */
function findAndEnhanceSEOFieldsets(): void {
  if (isEnhancing) return;
  isEnhancing = true;

  try {
    // REQ-CMS-005: First, hide any empty fieldsets
    hideEmptyFieldsets();

    // Strategy 1: Check all fieldsets for SEO legend (traditional forms)
    const fieldsets = document.querySelectorAll("fieldset");
    fieldsets.forEach((fieldset) => {
      const legend = fieldset.querySelector("legend");
      if (legend && legend.textContent?.toLowerCase().includes("seo")) {
        enhanceSEOFieldset(fieldset);
      }
    });

    // Strategy 2: Check for data-field="seo" patterns
    const seoFields = document.querySelectorAll('[data-field="seo"]');
    seoFields.forEach((field) => {
      const fieldset = field.closest("fieldset");
      if (fieldset) {
        enhanceSEOFieldset(fieldset);
      }
    });

    // Strategy 3: Find Keystatic object field labels containing "seo"
    // Keystatic uses spans/labels for object field headers
    const allLabels = document.querySelectorAll("span, label, h3, h4, legend");
    allLabels.forEach((label) => {
      const text = label.textContent?.toLowerCase() || "";
      if (
        text === "seo" ||
        text === "seo & social media" ||
        text.includes("seo metadata")
      ) {
        // Find the parent container that wraps this object field
        // Keystatic typically nests: container > label + content
        // Walk up from parent (label itself may have css- classes)
        const container =
          label.parentElement?.closest('[class*="css-"]') ||
          label.parentElement?.parentElement;

        if (
          container &&
          container !== label &&
          !container.hasAttribute("data-seo-enhanced")
        ) {
          enhanceKestaticObjectField(container, label);
        }
      }
    });

    // Strategy 4: Find by input field names (fallback)
    const metaTitleInput = document.querySelector(
      'input[name*="seo.metaTitle"], input[name="metaTitle"]',
    );
    if (metaTitleInput) {
      // Walk up to find the SEO section container
      let current: Element | null = metaTitleInput;
      for (let i = 0; i < 10 && current; i++) {
        current = current.parentElement;
        if (!current) break;

        // Look for a label/heading in this container
        const labelInContainer = current.querySelector(
          ":scope > span, :scope > label",
        );
        if (
          labelInContainer &&
          labelInContainer.textContent?.toLowerCase().includes("seo")
        ) {
          if (!current.hasAttribute("data-seo-enhanced")) {
            enhanceKestaticObjectField(current, labelInContainer);
          }
          break;
        }
      }
    }
  } finally {
    setTimeout(() => {
      isEnhancing = false;
    }, 300);
  }
}

/**
 * Cleanup all tracked event listeners
 */
function cleanupListeners(): void {
  listenerCleanups.forEach((cleanup) => cleanup());
  listenerCleanups.clear();
}

export function __resetForTesting(): void {
  isEnhancing = false;
  cleanupListeners();
}

export function SEOFieldsetEnhancer(): null {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Initial check
    findAndEnhanceSEOFieldsets();

    // Set up MutationObserver to detect when SEO fields are rendered
    // Keystatic renders object fields as divs/spans (no fieldsets),
    // so fire on any childList addition with debounce
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    observerRef.current = new MutationObserver((mutations) => {
      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (!hasNewNodes) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(findAndEnhanceSEOFieldsets, 300);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observerRef.current?.disconnect();
      cleanupListeners();
    };
  }, []);

  // This component doesn't render anything - it just enhances the DOM
  return null;
}

export default SEOFieldsetEnhancer;
