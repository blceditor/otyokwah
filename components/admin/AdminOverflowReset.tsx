"use client";

import { useEffect } from "react";

/**
 * Keystatic's UI bundle injects a global `body { overflow: hidden }` stylesheet
 * rule via `injectGlobal` (keystatic-core-ui.js). This persists across client-side
 * navigations. We override it with an inline style (highest specificity) and
 * neutralize the injected rule by scanning stylesheets.
 */
export function AdminOverflowReset() {
  useEffect(() => {
    // 1. Force inline override (beats stylesheet rules)
    document.body.style.setProperty("overflow", "auto", "important");

    // 2. Find and disable Keystatic's injected body { overflow: hidden } rule
    try {
      for (const sheet of document.styleSheets) {
        try {
          for (let i = 0; i < sheet.cssRules.length; i++) {
            const rule = sheet.cssRules[i] as CSSStyleRule;
            if (
              rule.selectorText === "body" &&
              rule.style?.overflow === "hidden"
            ) {
              rule.style.overflow = "";
            }
          }
        } catch {
          // Cross-origin stylesheet, skip
        }
      }
    } catch {
      // Stylesheet access not available
    }

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, []);
  return null;
}
