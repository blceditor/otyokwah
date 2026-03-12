/**
 * REQ-CMS-009: Hero Section Accordion
 *
 * Enhances Keystatic's Hero object field with collapse behavior via DOM manipulation.
 * Uses MutationObserver to detect when Hero fields are rendered and wraps them
 * in a native <details>/<summary> element for collapse functionality.
 *
 * Pattern mirrors SEOFieldsetEnhancer.
 */
"use client";

import { useEffect, useRef } from "react";

const listenerCleanups = new Set<() => void>();

let isEnhancing = false;

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

function enhanceHeroFieldset(fieldset: Element): void {
  if (fieldset.hasAttribute("data-hero-enhanced")) return;
  fieldset.setAttribute("data-hero-enhanced", "true");

  const legend = fieldset.querySelector("legend");
  const content = fieldset.querySelector(":scope > div");

  if (!legend || !content) return;

  const details = document.createElement("details");
  details.className = "hero-accordion";
  details.open = true;

  const summary = document.createElement("summary");
  summary.className =
    "cursor-pointer font-medium text-gray-700 dark:text-dark-text py-2 px-3 bg-gray-50 dark:bg-dark-surface rounded-t border border-gray-200 dark:border-dark-border flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors";
  summary.setAttribute("aria-expanded", "true");
  summary.setAttribute(
    "aria-label",
    "Hero Section. Press Enter or Space to expand/collapse",
  );

  const indicator = document.createElement("span");
  indicator.className = "transform transition-transform duration-200";
  indicator.style.transform = "rotate(90deg)";
  indicator.appendChild(createChevronSVG());

  const labelText = document.createElement("span");
  labelText.textContent = legend.textContent || "Hero Section";

  const hint = document.createElement("span");
  hint.className = "text-xs text-gray-400 dark:text-dark-muted ml-auto";
  hint.textContent = "(click to collapse)";

  summary.appendChild(indicator);
  summary.appendChild(labelText);
  summary.appendChild(hint);

  const contentWrapper = document.createElement("div");
  contentWrapper.className =
    "border border-t-0 border-gray-200 dark:border-dark-border rounded-b p-4 bg-white dark:bg-dark-surface";

  while (content.firstChild) {
    contentWrapper.appendChild(content.firstChild);
  }

  details.appendChild(summary);
  details.appendChild(contentWrapper);

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

  legend.style.display = "none";
  content.replaceWith(details);
}

function enhanceKestaticHeroObjectField(
  container: Element,
  labelElement: Element,
): void {
  if (container.hasAttribute("data-hero-enhanced")) return;
  container.setAttribute("data-hero-enhanced", "true");

  const contentDiv =
    container.querySelector(":scope > div:last-child") ||
    labelElement.nextElementSibling;

  if (!contentDiv || contentDiv === labelElement) return;

  const details = document.createElement("details");
  details.className = "hero-accordion";
  details.open = true;

  const summary = document.createElement("summary");
  summary.className =
    "cursor-pointer font-medium text-gray-700 dark:text-dark-text py-2 px-3 bg-gray-50 dark:bg-dark-surface rounded-t border border-gray-200 dark:border-dark-border flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors";
  summary.setAttribute("aria-expanded", "true");
  summary.setAttribute(
    "aria-label",
    "Hero Section. Press Enter or Space to expand/collapse",
  );

  const indicator = document.createElement("span");
  indicator.className = "transform transition-transform duration-200";
  indicator.style.transform = "rotate(90deg)";
  indicator.appendChild(createChevronSVG());

  const labelText = document.createElement("span");
  labelText.textContent = labelElement.textContent || "Hero Section";

  const hint = document.createElement("span");
  hint.className = "text-xs text-gray-400 dark:text-dark-muted ml-auto";
  hint.textContent = "(click to collapse)";

  summary.appendChild(indicator);
  summary.appendChild(labelText);
  summary.appendChild(hint);

  const contentWrapper = document.createElement("div");
  contentWrapper.className =
    "border border-t-0 border-gray-200 dark:border-dark-border rounded-b p-4 bg-white dark:bg-dark-surface";

  while (contentDiv.firstChild) {
    contentWrapper.appendChild(contentDiv.firstChild);
  }

  details.appendChild(summary);
  details.appendChild(contentWrapper);

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

  labelElement.setAttribute("style", "display: none !important");
  contentDiv.replaceWith(details);
}

function findAndEnhanceHeroFieldsets(): void {
  if (isEnhancing) return;
  isEnhancing = true;

  try {
    // Strategy 1: Fieldsets with "Hero" legend
    const fieldsets = document.querySelectorAll("fieldset");
    fieldsets.forEach((fieldset) => {
      const legend = fieldset.querySelector("legend");
      if (legend && /hero/i.test(legend.textContent || "")) {
        enhanceHeroFieldset(fieldset);
      }
    });

    // Strategy 2: Keystatic object field labels containing "hero"
    const allLabels = document.querySelectorAll("span, label, h3, h4, legend");
    allLabels.forEach((label) => {
      const text = label.textContent?.toLowerCase() || "";
      if (
        text === "hero section" ||
        text === "hero" ||
        text.includes("hero section")
      ) {
        // Walk up from parent to find the object field container
        // (label itself may have css- classes, so skip it)
        const container =
          label.parentElement?.closest('[class*="css-"]') ||
          label.parentElement?.parentElement;

        if (
          container &&
          container !== label &&
          !container.hasAttribute("data-hero-enhanced")
        ) {
          enhanceKestaticHeroObjectField(container, label);
        }
      }
    });

    // Strategy 3: Find by input field names (fallback)
    const heroImageInput = document.querySelector(
      'input[name*="hero.heroImage"], input[name="heroImage"]',
    );
    if (heroImageInput) {
      let current: Element | null = heroImageInput;
      for (let i = 0; i < 10 && current; i++) {
        current = current.parentElement;
        if (!current) break;

        const labelInContainer = current.querySelector(
          ":scope > span, :scope > label",
        );
        if (
          labelInContainer &&
          /hero/i.test(labelInContainer.textContent || "")
        ) {
          if (!current.hasAttribute("data-hero-enhanced")) {
            enhanceKestaticHeroObjectField(current, labelInContainer);
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

function cleanupListeners(): void {
  listenerCleanups.forEach((cleanup) => cleanup());
  listenerCleanups.clear();
}

export function HeroFieldsetEnhancer(): null {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    findAndEnhanceHeroFieldsets();

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    observerRef.current = new MutationObserver((mutations) => {
      // Keystatic renders object fields as divs/spans (no fieldsets),
      // so fire on any childList addition with debounce
      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (!hasNewNodes) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(findAndEnhanceHeroFieldsets, 300);
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

  return null;
}

export default HeroFieldsetEnhancer;
