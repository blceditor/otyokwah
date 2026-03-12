// REQ-202: Search Modal Component
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { searchPages, SearchResult } from '../lib/search/pagefind';
import Link from 'next/link';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsLoading(true);
      const searchResults = await searchPages(query, { limit: 10 });
      setResults(searchResults);
      setIsLoading(false);
    }, 300); // Debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <input
            ref={searchInputRef}
            type="search"
            role="searchbox"
            placeholder="Search pages, events, and staff..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 text-lg border rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          />
          {query && (
            <div className="mt-2 text-sm text-stone">
              {isLoading ? 'Searching...' : `${results.length} results`}
            </div>
          )}
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {results.map((result, index) => (
            <Link
              key={index}
              href={result.url}
              className="block p-4 hover:bg-cream border-b transition-colors"
              onClick={onClose}
            >
              <h3 className="font-semibold text-lg text-primary hover:text-primary-dark">
                {result.title}
              </h3>
              <p className="mt-1 text-sm text-stone line-clamp-2">
                {result.excerpt}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}