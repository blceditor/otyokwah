"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import {
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * KeystaticThemeSync - Syncs next-themes TO Keystatic
 *
 * REQ-CMS-008: Robust theme sync for Keystatic CMS.
 *
 * Syncs next-themes to Keystatic's kui-theme elements.
 * Uses a single delayed sync + childList-only MutationObserver
 * to avoid cascade loops with other observers.
 */
function KeystaticThemeSync({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isSyncingRef = useRef(false);

  // Apply theme classes to an element
  // REQ-UAT-021: Ensure both dark and light modes are properly synced
  const applyThemeToElement = useCallback((element: Element, theme: string) => {
    const isDark = theme === "dark";
    const addClass = isDark ? "kui-scheme--dark" : "kui-scheme--light";
    const removeClasses = isDark
      ? ["kui-scheme--light", "kui-scheme--auto"]
      : ["kui-scheme--dark", "kui-scheme--auto"];

    if (!element.classList.contains(addClass)) {
      element.classList.add(addClass);
    }
    removeClasses.forEach((cls) => element.classList.remove(cls));

    // REQ-UAT-021: Also set color-scheme CSS property for native elements
    if (element instanceof HTMLElement) {
      element.style.colorScheme = isDark ? "dark" : "light";
    }
  }, []);

  // Sync theme to ALL kui-theme elements
  const syncAllElements = useCallback(
    (theme: string) => {
      // Prevent infinite loop from MutationObserver
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;

      try {
        // Apply to HTML element
        applyThemeToElement(document.documentElement, theme);

        // Apply to ALL nested Keystatic theme providers
        const kuiElements = document.querySelectorAll(
          '.kui-theme, [class*="kui-scheme"]',
        );
        kuiElements.forEach((el) => {
          applyThemeToElement(el, theme);
        });

      } finally {
        // Use setTimeout to release lock after mutations settle
        setTimeout(() => {
          isSyncingRef.current = false;
        }, 300);
      }
    },
    [applyThemeToElement],
  );

  // Clean up localStorage conflicts and initialize
  useEffect(() => {
    // Remove conflicting 'theme' key if it differs from keystatic-color-scheme
    const keystatic = localStorage.getItem("keystatic-color-scheme");
    const nextThemes = localStorage.getItem("theme");

    if (keystatic && nextThemes && keystatic !== nextThemes) {
      // Prefer keystatic-color-scheme as source of truth
      localStorage.removeItem("theme");
    }

    setMounted(true);
  }, []);

  // Main theme sync effect
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    // Immediate sync
    syncAllElements(resolvedTheme);

    // Update localStorage
    localStorage.setItem("keystatic-color-scheme", resolvedTheme);

    // Also set 'theme' key to prevent conflicts
    localStorage.setItem("theme", resolvedTheme);

    // Dispatch storage event for any listeners
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "keystatic-color-scheme",
        newValue: resolvedTheme,
      }),
    );
  }, [mounted, resolvedTheme, syncAllElements]);

  // Sync once after a short delay to catch late-loading Keystatic components
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    const timeoutId = setTimeout(() => {
      syncAllElements(resolvedTheme);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [mounted, resolvedTheme, syncAllElements]);

  // MutationObserver for dynamically created kui-theme elements (childList only)
  useEffect(() => {
    if (!mounted || !resolvedTheme) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver((mutations) => {
      let needsSync = false;

      for (const mutation of mutations) {
        if (mutation.type !== "childList" || mutation.addedNodes.length === 0)
          continue;
        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (
            node.classList?.contains("kui-theme") ||
            node.querySelector?.(".kui-theme")
          ) {
            needsSync = true;
            break;
          }
        }
        if (needsSync) break;
      }

      if (needsSync) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => syncAllElements(resolvedTheme), 300);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      observer.disconnect();
    };
  }, [mounted, resolvedTheme, syncAllElements]);

  // Listen for external theme changes
  useEffect(() => {
    if (!mounted) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "keystatic-color-scheme" && e.newValue) {
        if (e.newValue !== resolvedTheme) {
          setTheme(e.newValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [mounted, resolvedTheme, setTheme]);

  return <>{children}</>;
}

/**
 * ThemeProvider - REQ-CMS-008
 *
 * Wraps Keystatic admin with next-themes provider.
 * - attribute="class" uses Tailwind dark mode (.dark class on html)
 * - defaultTheme="system" respects OS preference on first visit
 * - enableSystem allows auto-detection
 * - storageKey aligns with Keystatic's expected localStorage key
 * - next-themes is the SOURCE OF TRUTH for theme state
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="keystatic-color-scheme"
      disableTransitionOnChange={false}
    >
      <KeystaticThemeSync>{children}</KeystaticThemeSync>
    </NextThemesProvider>
  );
}

export default ThemeProvider;
