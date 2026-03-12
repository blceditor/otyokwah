// REQ-202: Client-side search using generated page index
export interface SearchResult {
  title: string;
  excerpt: string;
  url: string;
}

interface PageEntry {
  slug: string;
  title: string;
  description: string;
}

let cachedIndex: PageEntry[] | null = null;

async function loadIndex(): Promise<PageEntry[]> {
  if (cachedIndex) return cachedIndex;

  try {
    const res = await fetch("/api/search-index");
    if (!res.ok) return [];
    cachedIndex = await res.json();
    return cachedIndex || [];
  } catch {
    return [];
  }
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.every((term) => lower.includes(term));
}

export async function searchPages(
  query: string,
  options?: { limit?: number },
): Promise<SearchResult[]> {
  if (typeof window === "undefined" || !query.trim()) {
    return [];
  }

  const index = await loadIndex();
  const limit = options?.limit || 10;

  return index
    .filter(
      (page) =>
        fuzzyMatch(page.title, query) || fuzzyMatch(page.description, query),
    )
    .slice(0, limit)
    .map((page) => ({
      title: page.title,
      excerpt: page.description,
      url: page.slug,
    }));
}
