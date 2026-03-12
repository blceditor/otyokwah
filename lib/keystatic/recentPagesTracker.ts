/**
 * REQ-FUTURE-013: Recent Pages Tracker
 *
 * Tracks recently edited pages in localStorage for quick access.
 */

const STORAGE_KEY = 'keystatic_recent_pages';
const MAX_PAGES = 20;

export interface RecentPage {
  slug: string;
  title: string;
  timestamp: string; // ISO date
}

/**
 * Get all recent pages from localStorage
 */
export function getRecentPages(): RecentPage[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as RecentPage[];
  } catch {
    return [];
  }
}

/**
 * Track a page visit/edit
 */
export function trackPageVisit(slug: string, title: string): void {
  if (typeof window === 'undefined') return;

  try {
    const pages = getRecentPages();

    // Remove existing entry for this slug (will be re-added at top)
    const filtered = pages.filter((p) => p.slug !== slug);

    // Add new entry at the beginning
    const newEntry: RecentPage = {
      slug,
      title,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...filtered].slice(0, MAX_PAGES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear all recent pages history
 */
export function clearRecentPages(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Get the timestamp for a specific page slug
 * Returns null if not found
 */
export function getPageTimestamp(slug: string): Date | null {
  const pages = getRecentPages();
  const page = pages.find((p) => p.slug === slug);
  return page ? new Date(page.timestamp) : null;
}
