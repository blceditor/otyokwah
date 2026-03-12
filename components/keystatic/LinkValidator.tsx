'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  X,
  Link,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  Hash,
  FileText,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import type { LinkValidationResult, ValidationStatus } from '@/app/api/validate-links/route';

interface PageResult {
  slug: string;
  title: string;
  editUrl: string;
  results: LinkValidationResult[];
  summary: {
    total: number;
    valid: number;
    warning: number;
    broken: number;
    skipped: number;
  };
}

interface SiteSummary {
  totalPages: number;
  pagesWithBrokenLinks: number;
  pagesWithWarnings: number;
  totalLinks: number;
  totalBroken: number;
  totalWarnings: number;
}

interface LinkValidatorProps {
  onClose: () => void;
}

const statusConfig: Record<
  ValidationStatus,
  { icon: typeof CheckCircle2; className: string; label: string }
> = {
  valid: {
    icon: CheckCircle2,
    className: 'text-green-600 dark:text-green-400',
    label: 'Valid',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-amber-600 dark:text-amber-400',
    label: 'Warning',
  },
  broken: {
    icon: XCircle,
    className: 'text-red-600 dark:text-red-400',
    label: 'Broken',
  },
  skipped: {
    icon: AlertTriangle,
    className: 'text-gray-400 dark:text-dark-muted',
    label: 'Skipped',
  },
};

const typeIcons: Record<string, typeof Link> = {
  internal: FileText,
  external: ExternalLink,
  email: Mail,
  tel: Phone,
  anchor: Hash,
};

export function LinkValidator({ onClose }: LinkValidatorProps) {
  const [isValidating, setIsValidating] = useState(false);
  const [pages, setPages] = useState<PageResult[]>([]);
  const [siteSummary, setSiteSummary] = useState<SiteSummary | null>(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'broken' | 'warning'>('all');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const validateLinks = useCallback(async () => {
    setIsValidating(true);
    setError('');
    setPages([]);
    setSiteSummary(null);

    try {
      const response = await fetch('/api/validate-links/all');
      if (!response.ok) throw new Error('Validation failed');

      const data = await response.json();
      setPages(data.pages);
      setSiteSummary(data.summary);

      // Auto-expand pages with broken links
      const broken = new Set<string>();
      data.pages.forEach((p: PageResult) => {
        if (p.summary.broken > 0) broken.add(p.slug);
      });
      setExpandedPages(broken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, []);

  useEffect(() => {
    validateLinks();
  }, [validateLinks]);

  const togglePage = (slug: string) => {
    setExpandedPages(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const filteredPages = pages.filter(p => {
    if (filter === 'broken') return p.summary.broken > 0;
    if (filter === 'warning') return p.summary.warning > 0 || p.summary.broken > 0;
    return true;
  });

  return (
    <div
      role="dialog"
      aria-label="Site Link Validator"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-gray-900 dark:text-dark-text">
              Site-wide Link Validator
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Site Summary */}
        {siteSummary && (
          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-dark-bg border-b border-gray-200 dark:border-dark-border flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-200 dark:bg-dark-border text-gray-900 dark:text-dark-text'
                  : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface'
              }`}
            >
              All Pages ({siteSummary.totalPages})
            </button>
            <button
              onClick={() => setFilter('broken')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'broken'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10'
              }`}
            >
              <XCircle size={14} />
              {siteSummary.pagesWithBrokenLinks} pages with broken links
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'
              }`}
            >
              <AlertTriangle size={14} />
              {siteSummary.pagesWithWarnings} with warnings
            </button>
            <span className="text-xs text-gray-400 dark:text-dark-muted ml-auto">
              {siteSummary.totalLinks} links across {siteSummary.totalPages} pages
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isValidating && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <span className="text-gray-600 dark:text-dark-muted">
                Scanning all pages for broken links...
              </span>
              <span className="text-xs text-gray-400 dark:text-dark-muted">
                This may take a minute for external links
              </span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!isValidating && !error && filteredPages.length === 0 && siteSummary && (
            <div className="text-center py-12">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-dark-muted font-medium">
                {filter === 'all' ? 'No pages found' : 'No issues found!'}
              </p>
              {filter !== 'all' && (
                <p className="text-sm text-gray-400 dark:text-dark-muted mt-1">
                  All links across {siteSummary.totalPages} pages are valid
                </p>
              )}
            </div>
          )}

          {!isValidating && filteredPages.length > 0 && (
            <div className="space-y-2">
              {filteredPages.map((page) => {
                const isExpanded = expandedPages.has(page.slug);
                const hasBroken = page.summary.broken > 0;
                const hasWarning = page.summary.warning > 0;

                return (
                  <div
                    key={page.slug}
                    className={`rounded-lg border ${
                      hasBroken
                        ? 'border-red-200 dark:border-red-800'
                        : hasWarning
                        ? 'border-amber-200 dark:border-amber-800'
                        : 'border-gray-200 dark:border-dark-border'
                    }`}
                  >
                    {/* Page header */}
                    <div
                      className="flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-bg rounded-t-lg"
                      onClick={() => togglePage(page.slug)}
                    >
                      <ChevronRight
                        size={16}
                        className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      />
                      <FileText size={16} className="text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-sm text-gray-900 dark:text-dark-text truncate">
                        {page.title}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-dark-muted">
                        /{page.slug}
                      </span>
                      <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                        {page.summary.broken > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                            <XCircle size={12} /> {page.summary.broken}
                          </span>
                        )}
                        {page.summary.warning > 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <AlertTriangle size={12} /> {page.summary.warning}
                          </span>
                        )}
                        {page.summary.broken === 0 && page.summary.warning === 0 && (
                          <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                            <CheckCircle2 size={12} /> OK
                          </span>
                        )}
                        <a
                          href={page.editUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline ml-2"
                          title="Edit this page in CMS"
                        >
                          <Edit3 size={12} />
                          Edit
                        </a>
                      </div>
                    </div>

                    {/* Expanded link results */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-dark-border p-3 space-y-1.5">
                        {page.results.map((result, index) => {
                          const StatusIcon = statusConfig[result.status].icon;
                          const TypeIcon = typeIcons[result.type] || Link;

                          return (
                            <div
                              key={`${result.url}-${index}`}
                              className="flex items-start gap-2 py-1.5 px-2 rounded text-sm"
                            >
                              <StatusIcon
                                size={14}
                                className={`mt-0.5 flex-shrink-0 ${statusConfig[result.status].className}`}
                              />
                              <TypeIcon
                                size={12}
                                className="mt-0.5 text-gray-400 dark:text-dark-muted flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-900 dark:text-dark-text truncate block">
                                  {result.url}
                                </span>
                                {result.text && result.text !== result.url && (
                                  <span className="text-xs text-gray-400 dark:text-dark-muted">
                                    &quot;{result.text}&quot;
                                  </span>
                                )}
                                {result.message && result.status !== 'valid' && (
                                  <span className={`text-xs block ${
                                    result.status === 'broken'
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}>
                                    {result.message}
                                    {result.statusCode ? ` (${result.statusCode})` : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-dark-border">
          <button
            onClick={validateLinks}
            disabled={isValidating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isValidating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Link size={16} />
                Re-scan All Pages
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default LinkValidator;
