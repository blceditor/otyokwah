"use client";

import { useState, useCallback } from "react";
import { Bug, X, Camera } from "lucide-react";
import { useGitHubUser } from "@/hooks/useGitHubUser";

interface PageContext {
  slug: string;
  fieldValues?: Record<string, unknown>;
  timestamp?: string;
}

interface BugReportContext {
  slug: string;
  fullUrl: string;
  fieldValues?: Record<string, unknown>;
  browser: string;
  timestamp: string;
  deploymentUrl: string;
  screenshot?: string; // REQ-U03-FIX-015: Base64 encoded screenshot
  user?: {
    login: string;
    name: string | null;
    email: string | null;
  };
}

interface BugReportModalProps {
  pageContext: PageContext;
  onSubmit?: (data: {
    title: string;
    description: string;
    includeContext: boolean;
    context?: BugReportContext;
  }) => void;
  asDropdownItem?: boolean; // REQ-CMS-007: Render as dropdown item
  asNavItem?: boolean; // Render as top-level nav bar button
}

export function BugReportModal({
  pageContext,
  onSubmit,
  asDropdownItem = false,
  asNavItem = false,
}: BugReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [includeContext, setIncludeContext] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  // REQ-U03-FIX-015: Screenshot capture state
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [includeScreenshot, setIncludeScreenshot] = useState(true);

  const { user: githubUser } = useGitHubUser();

  // REQ-U03-FIX-015: Capture screenshot using html2canvas
  // REQ-BUILD-011: Dynamic import to reduce initial bundle size
  const captureScreenshot = useCallback(async () => {
    setIsCapturingScreenshot(true);
    // Store reference to modal before hiding
    const modalBackdrop = document.querySelector(".fixed.inset-0.z-50");

    try {
      // Dynamic import html2canvas only when needed
      const html2canvas = (await import("html2canvas")).default;

      // Hide the modal backdrop temporarily for screenshot
      if (modalBackdrop instanceof HTMLElement) {
        modalBackdrop.style.visibility = "hidden";
      }

      // Capture the page with error handling for unsupported CSS
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        scale: 0.5, // Reduce size for faster upload
        logging: false,
        ignoreElements: (element) => {
          // Ignore elements that might cause parsing issues
          return element.getAttribute("role") === "dialog";
        },
      });

      // Convert to base64
      const dataUrl = canvas.toDataURL("image/png", 0.7);
      setScreenshot(dataUrl);
    } catch {
    } finally {
      // Always show the modal again
      if (modalBackdrop instanceof HTMLElement) {
        modalBackdrop.style.visibility = "visible";
      }
      setIsCapturingScreenshot(false);
    }
  }, []);

  // Open modal - screenshot capture is manual due to CSS compatibility issues
  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    // Note: Auto-capture disabled due to html2canvas not supporting modern CSS color() functions
    // User can manually capture screenshot using the button in the modal
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setIsSubmitting(true);

    const bugReport = {
      title,
      description,
      includeContext,
      context: includeContext
        ? {
            slug: pageContext.slug,
            fullUrl: window.location.href,
            fieldValues: pageContext.fieldValues,
            browser: window.navigator.userAgent,
            timestamp: new Date().toISOString(),
            deploymentUrl: window.location.origin,
            // REQ-U03-FIX-015: Include screenshot if captured and checkbox is checked
            screenshot:
              includeScreenshot && screenshot ? screenshot : undefined,
            user: githubUser
              ? {
                  login: githubUser.login,
                  name: githubUser.name,
                  email: githubUser.email,
                }
              : undefined,
          }
        : undefined,
    };

    if (onSubmit) {
      onSubmit(bugReport);
    }

    try {
      const response = await fetch("/api/submit-bug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bugReport),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit bug report");
      }

      setSuccess(true);
      setTitle("");
      setDescription("");
      setIncludeContext(true);

      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setError("");
    setSuccess(false);
    setScreenshot(null); // Reset screenshot on close
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClose();
    }
  };

  // REQ-CMS-007: Dropdown item trigger for black nav bar
  // REQ-UAT-021: Theme-aware dropdown item styling
  const triggerButton = asNavItem ? (
    <button
      onClick={handleOpenModal}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
      title="Report a bug or request a change"
    >
      <Bug className="h-4 w-4" />
      Report Issue
    </button>
  ) : asDropdownItem ? (
    <button
      onClick={handleOpenModal}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Bug className="h-4 w-4" />
      Report Issue
    </button>
  ) : (
    <button
      onClick={handleOpenModal}
      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
    >
      <Bug className="h-4 w-4" />
      Report Bug
    </button>
  );

  return (
    <>
      {triggerButton}

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleClose}
          onKeyDown={handleKeyDown}
        >
          <div
            role="dialog"
            aria-labelledby="bug-report-title"
            aria-modal="true"
            className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-md p-6 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2
                id="bug-report-title"
                className="text-xl font-semibold text-gray-900 dark:text-dark-text"
              >
                Report a Bug
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close"
                className="text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <p className="text-green-600 dark:text-green-400 font-medium">
                  Bug report submitted successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label
                    htmlFor="bug-title"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="bug-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-white dark:bg-dark-bg dark:text-dark-text"
                    placeholder="Brief description of the issue"
                  />
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="bug-description"
                    className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="bug-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-secondary bg-white dark:bg-dark-bg dark:text-dark-text"
                    placeholder="Detailed description of what happened..."
                  />
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeContext}
                      onChange={(e) => setIncludeContext(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-secondary border-gray-300 dark:border-dark-border rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-dark-text">
                      Include page context
                    </span>
                  </label>
                </div>

                {/* REQ-U03-FIX-015: Screenshot checkbox and preview */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeScreenshot}
                      onChange={(e) => setIncludeScreenshot(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-secondary border-gray-300 dark:border-dark-border rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-dark-text">
                      Include screenshot
                    </span>
                    {isCapturingScreenshot && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-dark-muted">
                        Capturing...
                      </span>
                    )}
                  </label>
                  {includeScreenshot && screenshot && (
                    <div className="mt-2 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element -- data URI from canvas capture */}
                      <img
                        src={screenshot}
                        alt="Screenshot preview"
                        className="w-full max-h-32 object-contain border border-gray-200 dark:border-dark-border rounded"
                      />
                      <button
                        type="button"
                        onClick={captureScreenshot}
                        disabled={isCapturingScreenshot}
                        className="absolute top-1 right-1 p-1 bg-white dark:bg-dark-surface rounded shadow hover:bg-gray-100 dark:hover:bg-dark-bg"
                        title="Retake screenshot"
                      >
                        <Camera className="h-4 w-4 text-gray-600 dark:text-dark-text" />
                      </button>
                    </div>
                  )}
                  {includeScreenshot && !screenshot && (
                    <button
                      type="button"
                      onClick={captureScreenshot}
                      disabled={isCapturingScreenshot}
                      className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50"
                    >
                      <Camera className="h-3 w-3" />
                      {isCapturingScreenshot
                        ? "Capturing..."
                        : "Capture screenshot"}
                    </button>
                  )}
                </div>

                {includeContext && (
                  <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-md text-sm text-gray-600 dark:text-dark-muted">
                    <p className="font-medium text-gray-700 dark:text-dark-text mb-1">
                      Context to be included:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Page: {pageContext.slug}</li>
                      <li>
                        URL:{" "}
                        {typeof window !== "undefined"
                          ? window.location.href
                          : "N/A"}
                      </li>
                      {githubUser && (
                        <li>
                          Reporter: {githubUser.name || githubUser.login} (@
                          {githubUser.login})
                        </li>
                      )}
                      <li>Browser info & timestamp</li>
                      {includeScreenshot && screenshot && (
                        <li>Screenshot attached</li>
                      )}
                    </ul>
                  </div>
                )}

                {error && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default BugReportModal;
