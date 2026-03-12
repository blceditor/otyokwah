/**
 * REQ-CMS-004: Global SEO Generation Component
 *
 * Allows generating SEO metadata for all pages at once.
 * Shows progress and handles rate limiting.
 */
'use client';

import { useState, useCallback } from 'react';
import { Wand2, CheckCircle, XCircle, Loader2, X } from 'lucide-react';

interface PageSEOStatus {
  slug: string;
  title: string;
  status: 'pending' | 'generating' | 'success' | 'error' | 'skipped';
  error?: string;
}

interface Page {
  slug: string;
  title: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
  };
}

const DELAY_BETWEEN_CALLS_MS = 2000; // 2 seconds between API calls

interface GlobalSEOGeneratorProps {
  asDropdownItem?: boolean; // REQ-CMS-007: Render as dropdown item
}

export function GlobalSEOGenerator({ asDropdownItem = false }: GlobalSEOGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pages, setPages] = useState<PageSEOStatus[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [skipExisting, setSkipExisting] = useState(true);
  const [currentPage, setCurrentPage] = useState<string | null>(null);

  const loadPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/keystatic/pages');
      if (!response.ok) throw new Error('Failed to load pages');

      const allPages: Page[] = await response.json();

      // Filter pages based on skipExisting preference
      const pagesNeedingSEO = skipExisting
        ? allPages.filter(p => !p.seo?.metaTitle || !p.seo?.metaDescription)
        : allPages;

      setPages(pagesNeedingSEO.map(p => ({
        slug: p.slug,
        title: p.title || p.slug,
        status: 'pending' as const
      })));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }, [skipExisting]);

  const handleOpen = async () => {
    setIsOpen(true);
    await loadPages();
  };

  const handleClose = () => {
    if (!isRunning) {
      setIsOpen(false);
      setPages([]);
    }
  };

  const generateAllSEO = async () => {
    setIsRunning(true);

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      setCurrentPage(page.slug);

      // Update status to generating
      setPages(prev => prev.map((p, idx) =>
        idx === i ? { ...p, status: 'generating' as const } : p
      ));

      try {
        const response = await fetch('/api/generate-seo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: page.slug,
            autoApply: true
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Generation failed');
        }

        // Update status to success
        setPages(prev => prev.map((p, idx) =>
          idx === i ? { ...p, status: 'success' as const } : p
        ));
      } catch (error) {
        // Update status to error
        setPages(prev => prev.map((p, idx) =>
          idx === i ? {
            ...p,
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : p
        ));
      }

      // Wait between API calls to respect rate limits
      if (i < pages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CALLS_MS));
      }
    }

    setIsRunning(false);
    setCurrentPage(null);
  };

  const getStatusIcon = (status: PageSEOStatus['status']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
      case 'generating':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'skipped':
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
      default:
        return null;
    }
  };

  const completedCount = pages.filter(p => p.status === 'success' || p.status === 'error').length;
  const successCount = pages.filter(p => p.status === 'success').length;
  const errorCount = pages.filter(p => p.status === 'error').length;

  // REQ-CMS-007: Dropdown item trigger for black nav bar
  const triggerButton = asDropdownItem ? (
    <button
      onClick={handleOpen}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-purple-400 hover:bg-purple-900/30 transition-colors"
    >
      <Wand2 className="h-4 w-4" />
      Generate All SEO
    </button>
  ) : (
    <button
      onClick={handleOpen}
      className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
      aria-label="Generate All SEO"
    >
      <Wand2 className="h-4 w-4" />
      Generate All SEO
    </button>
  );

  return (
    <>
      {/* Trigger Button */}
      {triggerButton}

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="global-seo-title"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 id="global-seo-title" className="text-lg font-semibold text-gray-900 dark:text-white">
                Generate SEO for All Pages
              </h2>
              <button
                onClick={handleClose}
                disabled={isRunning}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">Loading pages...</span>
                </div>
              ) : pages.length === 0 ? (
                <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                  {skipExisting
                    ? 'All pages already have SEO metadata!'
                    : 'No pages found.'}
                </div>
              ) : (
                <>
                  {/* Options */}
                  <div className="mb-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={skipExisting}
                        onChange={(e) => {
                          setSkipExisting(e.target.checked);
                          loadPages();
                        }}
                        disabled={isRunning}
                        className="rounded border-gray-300"
                        aria-label="Skip pages with existing SEO"
                      />
                      Skip pages with existing SEO
                    </label>
                  </div>

                  {/* Progress */}
                  {isRunning && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                        <span>Progress: {completedCount}/{pages.length}</span>
                        <span>{successCount} success, {errorCount} errors</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(completedCount / pages.length) * 100}%` }}
                        />
                      </div>
                      {currentPage && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Generating: {currentPage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Pages List */}
                  <ul className="space-y-2" role="list">
                    {pages.map((page) => (
                      <li
                        key={page.slug}
                        className="flex items-center gap-3 p-2 rounded bg-gray-50 dark:bg-gray-700"
                      >
                        {getStatusIcon(page.status)}
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">
                          {page.title}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {page.slug}
                        </span>
                        {page.error && (
                          <span className="text-xs text-red-600 dark:text-red-400">
                            {page.error}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-700">
              <button
                onClick={handleClose}
                disabled={isRunning}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={generateAllSEO}
                disabled={isRunning || pages.length === 0}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                aria-label="Start Generation"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Start Generation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalSEOGenerator;
