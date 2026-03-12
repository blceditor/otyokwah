"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { MediaPickerDialog } from "./MediaPickerDialog";
import type { MediaFile } from "@/lib/keystatic/mediaScanner";

function setValueViaExecCommand(
  field: HTMLInputElement,
  value: string,
): boolean {
  try {
    field.focus();
    field.select();
    // execCommand('insertText') goes through the browser's native input pipeline
    // which React's event system properly intercepts
    return document.execCommand("insertText", false, value);
  } catch {
    return false;
  }
}

function setValueViaNativeSetter(field: HTMLInputElement, value: string) {
  field.focus();

  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value",
  )?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(field, value);
  } else {
    field.value = value;
  }

  // Single input event is sufficient — React listens for bubbled input events
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * REQ-MEDIA-003: Media Field Enhancer
 *
 * Injects "Browse Media" buttons into Keystatic image/video path fields.
 * Uses MutationObserver to detect dynamically rendered fields.
 */
export function MediaFieldEnhancer() {
  const pathname = usePathname() ?? "";
  const observerRef = useRef<MutationObserver | null>(null);
  const enhancedFieldsRef = useRef<Set<Element>>(new Set());
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    targetField: HTMLInputElement | null;
  }>({
    isOpen: false,
    targetField: null,
  });

  // Check if we're on a page editing route
  const isPageEditor = useCallback(() => {
    if (!pathname) return null;
    const normalizedPath = pathname.replace(/\/+$/, "");
    return normalizedPath.match(
      /\/keystatic\/(?:branch\/[^/]+\/)?(?:collection\/(?:pages|staff|testimonials)\/(?:item\/)?[^/]+|singleton\/[^/]+)$/,
    );
  }, [pathname]);

  // Handle file selection from dialog
  const handleSelect = useCallback(
    (file: MediaFile) => {
      const { targetField } = dialogState;
      if (!targetField) return;

      // Verify the field is still in the DOM (Keystatic may re-render while dialog is open)
      if (!targetField.isConnected) return;

      const newValue = file.url;

      // Strategy 1: React fiber props onChange (most reliable for controlled inputs)
      // Keystatic uses @react-aria/textfield which has onChange: (e) => setValue(e.target.value)
      const propsKey = Object.keys(targetField).find((k) =>
        k.startsWith("__reactProps$"),
      );
      if (propsKey) {
        const reactProps = (
          targetField as unknown as Record<
            string,
            { onChange?: (e: { target: { value: string } }) => void }
          >
        )[propsKey];
        if (reactProps?.onChange) {
          reactProps.onChange({ target: { value: newValue } });
          // Verify and fallback if needed
          setTimeout(() => {
            if (targetField.value !== newValue && targetField.isConnected) {
              setValueViaExecCommand(targetField, newValue);
            }
          }, 50);
          return;
        }
      }

      // Strategy 2: execCommand goes through browser's native input pipeline
      // which React properly intercepts (works with @react-aria controlled inputs)
      if (setValueViaExecCommand(targetField, newValue)) return;

      // Strategy 3: Native value setter + input event (last resort)
      setValueViaNativeSetter(targetField, newValue);
    },
    [dialogState],
  );

  // Close dialog
  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false, targetField: null }));
  }, []);

  // Check if a text input is near a label containing image/photo/video keywords
  const isImageFieldByLabel = useCallback(
    (field: HTMLInputElement): boolean => {
      const imageKeywords =
        /image|photo|video|hero\s*image|hero\s*video|background\s*image/i;

      // Check associated label via for/id
      if (field.id) {
        const label = document.querySelector<HTMLLabelElement>(
          `label[for="${field.id}"]`,
        );
        if (label && imageKeywords.test(label.textContent || "")) return true;
      }

      // Check parent/sibling labels (Keystatic renders labels near inputs)
      const container = field.closest(
        '[role="group"], fieldset, [data-field], form > div, div',
      );
      if (container) {
        const labels = container.querySelectorAll(
          'label, span[class*="label"], legend',
        );
        for (const label of labels) {
          if (imageKeywords.test(label.textContent || "")) return true;
        }
      }

      // Check preceding sibling text content
      const prev = field.previousElementSibling;
      if (prev && imageKeywords.test(prev.textContent || "")) return true;

      return false;
    },
    [],
  );

  // Inject browse button next to a path field
  const injectBrowseButton = useCallback((field: HTMLInputElement) => {
    // Check if button already exists
    const existingButton =
      field.parentElement?.querySelector(".media-browse-btn");
    if (existingButton) return;

    // Create button
    const button = document.createElement("button");
    button.type = "button";
    button.className =
      "media-browse-btn inline-flex items-center gap-1 ml-2 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors";
    button.setAttribute("data-testid", "media-picker-trigger");
    button.title = "Browse media library";
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>
      </svg>
      Browse Media
    `;

    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      setDialogState({
        isOpen: true,
        targetField: field,
      });
    });

    // Insert button after field
    const parent = field.parentElement;
    if (parent) {
      if (
        parent.classList.contains("flex") ||
        getComputedStyle(parent).display === "flex"
      ) {
        parent.appendChild(button);
      } else {
        field.insertAdjacentElement("afterend", button);
      }
    }
  }, []);

  // Find and enhance path fields
  const enhancePathFields = useCallback(() => {
    if (!isPageEditor()) return;

    // Strategy 1: Direct attribute matching (placeholders, names, values)
    const selectorMatched = document.querySelectorAll<HTMLInputElement>(
      'input[type="text"][placeholder*="image" i], ' +
        'input[type="text"][placeholder*="path" i], ' +
        'input[type="text"][placeholder*="url" i], ' +
        'input[type="text"][placeholder*="video" i], ' +
        'input[type="text"][value*="/images/"], ' +
        'input[type="text"][value*="/videos/"], ' +
        'input[name*="heroImage" i], ' +
        'input[name*="heroVideo" i], ' +
        'input[name*="image" i], ' +
        'input[name*="photo" i]',
    );

    // Strategy 2: Label-based detection for Markdoc component fields
    // Keystatic renders text fields without name/placeholder in component editors
    const allTextInputs =
      document.querySelectorAll<HTMLInputElement>('input[type="text"]');
    const labelMatched: HTMLInputElement[] = [];
    allTextInputs.forEach((input) => {
      if (!enhancedFieldsRef.current.has(input) && isImageFieldByLabel(input)) {
        labelMatched.push(input);
      }
    });

    const allFields = new Set([...selectorMatched, ...labelMatched]);

    // Purge stale refs (disconnected DOM nodes)
    for (const field of enhancedFieldsRef.current) {
      if (!field.isConnected) {
        enhancedFieldsRef.current.delete(field);
      }
    }

    allFields.forEach((field) => {
      if (enhancedFieldsRef.current.has(field)) return;

      // Skip non-text or search fields
      if (field.type !== "text") return;
      if (field.placeholder?.toLowerCase().includes("search")) return;

      injectBrowseButton(field);
      enhancedFieldsRef.current.add(field);
    });
  }, [isPageEditor, isImageFieldByLabel, injectBrowseButton]);

  // Set up observer
  useEffect(() => {
    if (!isPageEditor()) {
      enhancedFieldsRef.current.clear();
      return;
    }

    // Initial enhancement attempt with delay for Keystatic to render
    const timeout = setTimeout(enhancePathFields, 1500);

    // Set up observer for dynamic content — childList only (no attributes)
    // to avoid cascade loops with other MutationObservers
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    observerRef.current = new MutationObserver((mutations) => {
      if (document.body.hasAttribute("data-media-dialog-open")) return;
      let hasNewNodes = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          hasNewNodes = true;
          break;
        }
      }
      if (!hasNewNodes) return;
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(enhancePathFields, 400);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const currentObserver = observerRef.current;
    const currentEnhanced = enhancedFieldsRef.current;
    return () => {
      clearTimeout(timeout);
      if (debounceTimer) clearTimeout(debounceTimer);
      if (currentObserver) {
        currentObserver.disconnect();
      }
      currentEnhanced.clear();
    };
  }, [pathname, isPageEditor, enhancePathFields]);

  return (
    <MediaPickerDialog
      isOpen={dialogState.isOpen}
      onClose={closeDialog}
      onSelect={handleSelect}
    />
  );
}

export default MediaFieldEnhancer;
