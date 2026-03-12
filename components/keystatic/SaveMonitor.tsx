"use client";

import { useEffect, useRef } from "react";

/**
 * REQ-CMS-003: Save Monitor
 * REQ-BUILD-010: ISR Revalidation on Save
 * REQ-BUILD-015: Optimistic Save Toast
 *
 * Monitors Keystatic's save operations and dispatches 'content-saved' events
 * when content is successfully saved. Uses MutationObserver to detect
 * save button state changes.
 *
 * Shows an instant "Saved!" toast for immediate feedback (REQ-BUILD-015).
 * Triggers ISR revalidation via /api/revalidate (REQ-BUILD-010).
 */

/**
 * REQ-BUILD-010: Extract the page slug from Keystatic's URL structure
 * e.g., /keystatic/collection/pages/about -> about
 */
const extractSlugFromUrl = (): string | null => {
  const path = window.location.pathname;
  const match = path.match(/\/keystatic\/collection\/pages\/([^/]+)/);
  return match ? match[1] : null;
};

/**
 * REQ-BUILD-010: Trigger ISR revalidation for a specific page
 */
const triggerRevalidation = async (slug: string): Promise<void> => {
  try {
    const response = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({ slug, type: "page" }),
    });
    if (!response.ok && process.env.NODE_ENV === "development") {
      // Silently ignore in production; log only in dev
    }
  } catch {
    // Revalidation is best-effort from the client
  }
};

export function SaveMonitor() {
  const observerRef = useRef<MutationObserver | null>(null);
  const lastSaveTimeRef = useRef<number>(0);

  useEffect(() => {
    // Debounce to prevent duplicate events
    const MIN_SAVE_INTERVAL = 2000; // 2 seconds

    /**
     * REQ-BUILD-015: Show optimistic save toast immediately
     * Provides instant feedback when save is detected, before API response
     */
    const showOptimisticToast = () => {
      // Check if toast already exists to prevent duplicates
      const existingToast = document.querySelector("[data-save-toast]");
      if (existingToast) return;

      const toast = document.createElement("div");
      toast.setAttribute("data-save-toast", "true");
      toast.className =
        "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-[9999] transition-opacity duration-300";
      toast.innerHTML =
        '<span class="flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Saved!</span>';
      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    };

    const dispatchContentSaved = () => {
      const now = Date.now();
      if (now - lastSaveTimeRef.current < MIN_SAVE_INTERVAL) {
        return;
      }
      lastSaveTimeRef.current = now;

      window.dispatchEvent(new CustomEvent("content-saved"));

      // REQ-BUILD-010: Trigger ISR revalidation after successful save
      const slug = extractSlugFromUrl();
      if (slug) {
        triggerRevalidation(slug);
      } else {
        // If no specific page slug, trigger homepage revalidation
        triggerRevalidation("");
      }
    };

    // Strategy 1: Monitor for save button clicks and subsequent success
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Find if this is a save button (Keystatic uses type="submit" buttons)
      const button = target.closest('button[type="submit"]');
      if (!button) return;

      // Check for save button text indicators
      const buttonText = button.textContent?.toLowerCase() || "";
      const isSaveButton =
        buttonText.includes("save") ||
        buttonText.includes("update") ||
        buttonText.includes("commit") ||
        button.getAttribute("aria-label")?.toLowerCase().includes("save");

      if (!isSaveButton) return;

      // REQ-BUILD-015: Show optimistic toast immediately (<100ms)
      showOptimisticToast();

      // Wait for the save operation to complete
      // Keystatic shows success via toast notifications or button state changes
      setTimeout(() => {
        // Check if there's no error state (no error toast visible)
        const errorToast = document.querySelector(
          '[role="alert"][data-type="error"]',
        );
        if (!errorToast) {
          dispatchContentSaved();
        }
      }, 1500);
    };

    // Strategy 2: Monitor for success toast notifications
    const observeToasts = () => {
      observerRef.current = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            for (const node of mutation.addedNodes) {
              if (node instanceof HTMLElement) {
                // Look for success indicators
                const successToast =
                  node.querySelector?.('[role="alert"]') ||
                  (node.getAttribute?.("role") === "alert" ? node : null);

                if (successToast) {
                  const text = successToast.textContent?.toLowerCase() || "";
                  if (
                    text.includes("saved") ||
                    text.includes("updated") ||
                    text.includes("success") ||
                    text.includes("committed")
                  ) {
                    dispatchContentSaved();
                  }
                }
              }
            }
          }
        }
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    // Strategy 3: Monitor network requests for GitHub API commits
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);

      const url =
        typeof args[0] === "string"
          ? args[0]
          : args[0] instanceof Request
            ? args[0].url
            : String(args[0]);
      if (url && typeof url === "string") {
        // Detect GitHub API commit requests
        if (
          (url.includes("api.github.com") && url.includes("/git/")) ||
          url.includes("/api/keystatic/")
        ) {
          const method = typeof args[1] === "object" ? args[1]?.method : "GET";
          if (method === "POST" || method === "PUT") {
            // Clone response to check status without consuming body
            if (response.ok) {
              // Delay to allow UI to update
              setTimeout(dispatchContentSaved, 500);
            }
          }
        }
      }

      return response;
    };

    // Initialize monitoring
    document.addEventListener("click", handleClick);
    observeToasts();

    return () => {
      document.removeEventListener("click", handleClick);
      observerRef.current?.disconnect();
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}

export default SaveMonitor;
