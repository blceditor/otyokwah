"use client";

import { useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { MediaLibrary } from "./MediaLibrary";
import type { MediaFile } from "@/lib/keystatic/mediaScanner";

interface MediaPickerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
}

export function MediaPickerDialog({
  isOpen,
  onClose,
  onSelect,
}: MediaPickerDialogProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  const handleSelect = useCallback(
    (file: MediaFile) => {
      onSelect(file);
      onClose();
    },
    [onSelect, onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-media-dialog-open", "true");
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      document.body.removeAttribute("data-media-dialog-open");
    };
  }, [isOpen, handleKeyDown]);

  // Defense against React Aria's ariaHideOutside setting inert on our portal.
  // Keystatic's useModalOverlay calls ariaHideOutside which walks document.body
  // and sets inert=true on all elements not in its visible set. Even with
  // data-react-aria-top-layer="true", timing issues can cause our element to
  // be inerted before the MutationObserver processes it. This observer
  // immediately removes inert if it gets set on our wrapper.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!isOpen || !el) return;

    // Remove inert immediately if already set
    if (el.inert) el.inert = false;

    const observer = new MutationObserver(() => {
      if (el.inert) el.inert = false;
    });
    observer.observe(el, { attributes: true, attributeFilter: ["inert"] });
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  const dialog = (
    <div
      ref={wrapperRef}
      data-media-picker-dialog
      data-react-aria-top-layer="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop — purely visual, no event handling */}
      <div
        className="fixed inset-0 bg-black/50 pointer-events-none"
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-label="Select media"
        className="relative w-full max-w-5xl h-[80vh] mx-4 bg-white dark:bg-dark-bg rounded-xl shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-gray-400 hover:text-gray-600 dark:text-dark-muted dark:hover:text-dark-text rounded-lg hover:bg-gray-100 dark:hover:bg-dark-surface transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <MediaLibrary
          onClose={onClose}
          onSelect={handleSelect}
          selectionMode={true}
        />
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}

export default MediaPickerDialog;
