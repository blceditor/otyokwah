'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageVisit } from '@/lib/keystatic/recentPagesTracker';

/**
 * REQ-FUTURE-013: Recent Pages Enhancer
 *
 * Tracks page visits when editing pages in Keystatic.
 * The sort functionality is now handled by KeystaticToolsHeader.
 */
export function RecentPagesEnhancer() {
  const pathname = usePathname() ?? "";

  // Extract page slug and title when editing a page
  const trackCurrentPage = useCallback(() => {
    if (!pathname) return;
    const normalizedPath = pathname.replace(/\/+$/, '');
    // Match page editing routes: /keystatic/branch/{branch}/collection/pages/item/{slug}
    const match = normalizedPath.match(
      /\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/(?:item\/)?([^/]+)$/
    );

    if (match && match[1] && match[1] !== 'pages') {
      const slug = match[1];

      // Try to extract title from the page heading
      setTimeout(() => {
        const titleElement = document.querySelector(
          'h1, [data-keystatic-page-title]'
        );
        const title = titleElement?.textContent?.trim() || slug;
        trackPageVisit(slug, title);
      }, 500); // Small delay to let page render
    }
  }, [pathname]);

  // Track page visits
  useEffect(() => {
    trackCurrentPage();
  }, [trackCurrentPage]);

  return null;
}

export default RecentPagesEnhancer;
