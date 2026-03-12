"use client";

/**
 * ContentCleanupEnhancer
 *
 * Detects empty leading paragraphs in Keystatic's ProseMirror editor and
 * provides a small dismiss button to remove them. Keystatic's editor treats
 * the first empty paragraph as a required block — Backspace/Delete tries to
 * merge it with the next node (a Markdoc component), which either fails or
 * deletes content. This enhancer gives users a safe way to remove it.
 */

import { useEffect, useRef } from "react";

const MARKER_ATTR = "data-cleanup-enhanced";

function isEmptyParagraph(node: Element): boolean {
  if (node.tagName !== "P") return false;
  // Empty paragraph patterns: <p><br></p>, <p></p>, <p> </p>
  const text = node.textContent || "";
  if (text.trim() !== "") return false;
  // Also check it has no meaningful child elements (except <br>)
  for (const child of Array.from(node.children)) {
    if (child.tagName !== "BR") return false;
  }
  return true;
}

function addCleanupButton(emptyP: Element): void {
  if (emptyP.querySelector("[data-cleanup-btn]")) return;

  const btn = document.createElement("button");
  btn.setAttribute("data-cleanup-btn", "true");
  btn.type = "button";
  btn.textContent = "\u00d7 Remove empty line";
  btn.title = "Remove this empty line";
  btn.style.cssText = [
    "position: absolute",
    "right: 4px",
    "top: 50%",
    "transform: translateY(-50%)",
    "font-size: 11px",
    "padding: 2px 8px",
    "border-radius: 4px",
    "background: #f3f4f6",
    "border: 1px solid #d1d5db",
    "color: #6b7280",
    "cursor: pointer",
    "z-index: 10",
    "line-height: 1.4",
    "white-space: nowrap",
  ].join(";");

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#e5e7eb";
    btn.style.color = "#374151";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "#f3f4f6";
    btn.style.color = "#6b7280";
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    emptyP.remove();
  });

  // Position the paragraph relatively so the button can be absolute
  const pEl = emptyP as HTMLElement;
  const computed = window.getComputedStyle(pEl);
  if (computed.position === "static") {
    pEl.style.position = "relative";
  }

  emptyP.appendChild(btn);
}

function removeCleanupButton(el: Element): void {
  const btn = el.querySelector("[data-cleanup-btn]");
  if (btn) btn.remove();
}

function scanEditorAreas(): void {
  // Keystatic uses [contenteditable="true"] for ProseMirror editors
  const editors = document.querySelectorAll('[contenteditable="true"]');

  for (const editor of Array.from(editors)) {
    // Skip tiny editors (single-line fields) — only target the main document editor
    if (editor.clientHeight < 100) continue;

    const firstChild = editor.firstElementChild;
    if (!firstChild) continue;

    if (isEmptyParagraph(firstChild)) {
      addCleanupButton(firstChild);
      if (!editor.hasAttribute(MARKER_ATTR)) {
        editor.setAttribute(MARKER_ATTR, "true");
      }
    } else {
      // If the first child is no longer empty, clean up any stale buttons
      removeCleanupButton(firstChild);
    }
  }
}

export function ContentCleanupEnhancer(): null {
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // Initial scan after a short delay (editor needs time to render)
    const initialTimer = setTimeout(scanEditorAreas, 500);

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    observerRef.current = new MutationObserver((mutations) => {
      let relevant = false;
      for (const mutation of mutations) {
        // Only react to childList changes (not attribute changes to avoid cascades)
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          relevant = true;
          break;
        }
      }
      if (!relevant) return;

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(scanEditorAreas, 300);
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(initialTimer);
      if (debounceTimer) clearTimeout(debounceTimer);
      observerRef.current?.disconnect();
    };
  }, []);

  return null;
}
