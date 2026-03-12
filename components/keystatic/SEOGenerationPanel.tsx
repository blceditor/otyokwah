/**
 * REQ-CMS-012: AI-Powered SEO Generation - Panel Component
 *
 * A slide-out panel that generates SEO metadata and auto-applies it to form fields.
 * Includes timeout handling and progress feedback.
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import type { SEOData, PageContent } from '@/lib/types/seo';
import { SEO_LIMITS } from '@/lib/types/seo';
import { injectSEOIntoForm } from '@/lib/keystatic/injectSEOIntoForm';

const GENERATION_TIMEOUT_MS = 30000; // 30 second timeout
const LOADING_MESSAGES = [
  'Analyzing page content...',
  'Generating SEO metadata...',
  'Optimizing for search engines...',
  'Almost done...',
];

interface SEOGenerationPanelProps {
  pageContent: PageContent;
  onClose: () => void;
  onGenerated?: (data: SEOData) => void; // Optional, since we auto-apply now
  autoStart?: boolean; // REQ-CMS-020: Start generation immediately when panel opens
}

export function SEOGenerationPanel({
  pageContent,
  onClose,
  onGenerated,
  autoStart = false,
}: SEOGenerationPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedSEO, setGeneratedSEO] = useState<SEOData | null>(null);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Handle Escape key to close and cleanup on unmount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Cleanup timeouts and abort controller
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [onClose]);

  // Rotate loading messages every 3 seconds during generation
  useEffect(() => {
    if (!isGenerating) return;

    const messageInterval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);

    const elapsedInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(elapsedInterval);
    };
  }, [isGenerating]);

  const handleGenerate = useCallback(async () => {
    setError('');
    setGeneratedSEO(null);
    setLoadingMessageIndex(0);
    setElapsedSeconds(0);
    setShowSuccess(false);
    setIsGenerating(true);

    // Set up abort controller and timeout
    abortControllerRef.current = new AbortController();
    timeoutRef.current = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setError('Generation timed out after 30 seconds. Please try again.');
      setIsGenerating(false);
    }, GENERATION_TIMEOUT_MS);

    try {
      const response = await fetch('/api/generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: pageContent.title,
          slug: pageContent.slug,
          heroTagline: pageContent.heroTagline,
          templateType: pageContent.templateType,
          templateFields: pageContent.templateFields,
          body: pageContent.body,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Clear timeout on successful response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'SEO generation failed');
      }

      const seoData: SEOData = await response.json();
      setGeneratedSEO(seoData);

      // Auto-apply SEO to form fields
      const success = injectSEOIntoForm(seoData);
      if (success) {
        setShowSuccess(true);
        // Call onGenerated if provided
        if (onGenerated) {
          onGenerated(seoData);
        }
        // Auto-close after showing success for 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setError('Generated SEO, but could not apply to form. Please expand the SEO section and try again.');
      }
    } catch (err) {
      // Clear timeout on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // Timeout already handled
          return;
        }
        setError(err.message);
      } else {
        setError('Failed to generate SEO. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [pageContent, onClose, onGenerated]);

  // REQ-CMS-020: Auto-start generation when panel opens with autoStart=true
  // P1 Fix: Removed handleGenerate from deps to avoid stale closure issues
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (autoStart && !hasAutoStarted.current && !isGenerating && !generatedSEO) {
      // Small delay to ensure panel is rendered before starting
      const timer = setTimeout(() => {
        hasAutoStarted.current = true;
        handleGenerate();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoStart, isGenerating, generatedSEO]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      role="dialog"
      aria-label="Generate SEO Metadata"
      className="fixed bottom-20 right-4 w-96 bg-white dark:bg-dark-surface rounded-lg shadow-xl border border-gray-200 dark:border-dark-border z-50 seo-generation-panel transition-colors duration-200 animate-in slide-in-from-right-5"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-border">
        <h3 className="font-semibold text-gray-900 dark:text-dark-text">Generate SEO Metadata</h3>
        <button
          onClick={onClose}
          aria-label="Close panel"
          className="p-1 text-gray-400 dark:text-dark-muted hover:text-gray-600 dark:hover:text-dark-text rounded transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Success Toast */}
        {showSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">SEO applied successfully!</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        {!showSuccess && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" data-testid="sparkles-icon" />
                Generate SEO
              </>
            )}
          </button>
        )}

        {/* Loading Progress */}
        {isGenerating && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">{LOADING_MESSAGES[loadingMessageIndex]}</span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Elapsed: {elapsedSeconds}s (timeout: 30s)
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Generated SEO Preview (shown on success for 2 seconds) */}
        {generatedSEO && showSuccess && (
          <div className="space-y-2 text-sm">
            <div data-field="metaTitle" className="meta-title-preview">
              <label className="text-xs text-gray-500 dark:text-dark-muted flex justify-between">
                <span>Meta Title</span>
                <span className={generatedSEO.metaTitle.length > SEO_LIMITS.META_TITLE_MAX ? 'text-red-600 dark:text-red-400' : ''}>
                  {generatedSEO.metaTitle.length}/{SEO_LIMITS.META_TITLE_MAX}
                </span>
              </label>
              <p className="text-xs border dark:border-dark-border rounded p-2 bg-gray-50 dark:bg-dark-bg dark:text-dark-text">{generatedSEO.metaTitle}</p>
            </div>

            <div data-field="metaDescription" className="meta-description-preview">
              <label className="text-xs text-gray-500 dark:text-dark-muted flex justify-between">
                <span>Meta Description</span>
                <span className={generatedSEO.metaDescription.length > SEO_LIMITS.META_DESCRIPTION_MAX ? 'text-red-600 dark:text-red-400' : ''}>
                  {generatedSEO.metaDescription.length}/{SEO_LIMITS.META_DESCRIPTION_MAX}
                </span>
              </label>
              <p className="text-xs border dark:border-dark-border rounded p-2 bg-gray-50 dark:bg-dark-bg dark:text-dark-text truncate">{generatedSEO.metaDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SEOGenerationPanel;
