"use client";

import { useEffect, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { SITE_URL } from "@/lib/site-url";

function createUrlPreviewElement(slug: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "slug-url-preview";
  container.setAttribute("data-injected", "true");

  const fullUrl = slug ? `${SITE_URL}/${slug}` : SITE_URL;

  container.innerHTML = `
    <div style="margin-top: 8px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 13px;">
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        <span style="color: #64748b; font-weight: 500;">Live URL:</span>
        <a
          href="${fullUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="color: #2563eb; text-decoration: none; word-break: break-all;"
          title="Open in new tab (page must be deployed first)"
        >
          ${fullUrl}
        </a>
        <span
          style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #fef3c7; color: #92400e; border-radius: 4px; font-size: 11px; font-weight: 500;"
          title="Changes must be saved and deployed before they appear on the live site"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          Deploy required
        </span>
      </div>
    </div>
  `;

  return container;
}

function findSlugField(): HTMLElement | null {
  // Keystatic renders slug fields with specific patterns
  // Look for the slug input container
  const slugLabels = document.querySelectorAll("label");

  for (const label of slugLabels) {
    const labelText = label.textContent?.toLowerCase() || "";
    if (labelText.includes("slug") || labelText.includes("page title")) {
      // Find the parent form group that contains the input
      const formGroup = label.closest("[data-field]") || label.parentElement;
      if (formGroup) {
        return formGroup as HTMLElement;
      }
    }
  }

  // Fallback: look for input with slug-related attributes
  const slugInput = document.querySelector(
    'input[name*="slug"], input[id*="slug"]',
  );
  if (slugInput) {
    return (
      (slugInput.closest("[data-field]") as HTMLElement) ||
      (slugInput.parentElement as HTMLElement)
    );
  }

  return null;
}

function getSlugValue(): string {
  // Try to get the slug from the URL first (most reliable)
  // Keystatic uses /keystatic/collection/pages/{slug} structure
  const pathname = window.location.pathname;
  const match = pathname.match(/\/keystatic\/collection\/pages\/([^/]+)/);
  if (match) {
    return match[1];
  }

  // Fallback: try to read from the input field
  const slugInput = document.querySelector(
    'input[name*="slug"], input[id*="slug"]',
  ) as HTMLInputElement;
  if (slugInput) {
    return slugInput.value;
  }

  return "";
}

export function SlugFieldInjector() {
  const pathname = usePathname() ?? "";
  const observerRef = useRef<MutationObserver | null>(null);
  const injectedRef = useRef(false);

  const injectUrlPreview = useCallback(() => {
    // Only inject on page editing routes (Keystatic uses /collection/pages/ structure)
    if (!pathname?.includes("/keystatic/collection/pages/")) {
      return;
    }

    // Check if already injected
    if (document.querySelector('.slug-url-preview[data-injected="true"]')) {
      return;
    }

    const slugField = findSlugField();
    if (!slugField) {
      return;
    }

    const slug = getSlugValue();
    const preview = createUrlPreviewElement(slug);

    // Insert after the slug field container
    slugField.insertAdjacentElement("afterend", preview);
    injectedRef.current = true;
  }, [pathname]);

  const cleanupInjected = useCallback(() => {
    const existing = document.querySelectorAll(
      '.slug-url-preview[data-injected="true"]',
    );
    existing.forEach((el) => el.remove());
    injectedRef.current = false;
  }, []);

  useEffect(() => {
    // Only run on page editing routes (Keystatic uses /collection/pages/ structure)
    if (!pathname?.includes("/keystatic/collection/pages/")) {
      cleanupInjected();
      return;
    }

    // Initial injection attempt
    const initialTimeout = setTimeout(() => {
      injectUrlPreview();
    }, 500);

    // Set up MutationObserver to handle dynamic content loading
    observerRef.current = new MutationObserver((mutations) => {
      // Check if Keystatic has rendered new content
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Debounce the injection
          setTimeout(() => {
            if (!injectedRef.current) {
              injectUrlPreview();
            }
          }, 100);
          break;
        }
      }
    });

    // Observe the main content area
    const keystatic = document.querySelector("main") || document.body;
    observerRef.current.observe(keystatic, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(initialTimeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      cleanupInjected();
    };
  }, [pathname, injectUrlPreview, cleanupInjected]);

  // Re-inject when pathname changes
  useEffect(() => {
    cleanupInjected();
    const timeout = setTimeout(() => {
      injectUrlPreview();
    }, 500);

    return () => clearTimeout(timeout);
  }, [pathname, injectUrlPreview, cleanupInjected]);

  // This component doesn't render anything - it only injects into DOM
  return null;
}

export default SlugFieldInjector;
