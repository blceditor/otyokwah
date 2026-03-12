/**
 * REQ-FUTURE-017: Site-wide Link Validation API
 *
 * Reads all .mdoc pages from content/pages/, parses links from each,
 * validates them, and returns results grouped by page.
 */

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { cookies } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';
import { isSsrfSafeUrl } from '@/lib/security/validate-ssrf';
import {
  parseLinks,
  validateEmail,
  validatePhoneNumber,
} from '@/lib/keystatic/linkParser';
import type { ValidationStatus, LinkValidationResult } from '../route';

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

const EXTERNAL_TIMEOUT_MS = 5000;
const CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');

async function checkInternalLink(url: string): Promise<LinkValidationResult> {
  let pagePath = url.replace(/^\//, '').replace(/\/$/, '');
  if (pagePath === '' || pagePath === '/') {
    pagePath = 'index';
  }

  const mdocPath = path.join(CONTENT_DIR, `${pagePath}.mdoc`);

  try {
    await fs.access(mdocPath);
    return { url, type: 'internal', status: 'valid', message: 'Page exists', text: '', position: 0 };
  } catch {
    return { url, type: 'internal', status: 'broken', message: 'Page not found', text: '', position: 0 };
  }
}

async function checkExternalLink(url: string): Promise<LinkValidationResult> {
  if (!isSsrfSafeUrl(url)) {
    return { url, type: 'external', status: 'broken', statusCode: 0, message: 'URL blocked for security', text: '', position: 0 };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EXTERNAL_TIMEOUT_MS);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LinkValidator/1.0)' },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      return { url, type: 'external', status: 'valid', statusCode: response.status, message: 'Link accessible', text: '', position: 0 };
    } else if (response.status >= 400 && response.status < 500) {
      return { url, type: 'external', status: 'broken', statusCode: response.status, message: `HTTP ${response.status}`, text: '', position: 0 };
    } else {
      return { url, type: 'external', status: 'warning', statusCode: response.status, message: `HTTP ${response.status}`, text: '', position: 0 };
    }
  } catch (error) {
    const message = error instanceof Error
      ? error.name === 'AbortError' ? 'Request timeout' : error.message
      : 'Failed to fetch';
    return { url, type: 'external', status: 'warning', message, text: '', position: 0 };
  }
}

// Deduplicate external URLs across all pages to avoid redundant requests
async function validateAllLinks(
  pageContents: { slug: string; title: string; content: string }[]
): Promise<PageResult[]> {
  // Collect all unique external URLs for batch validation
  const externalUrlCache = new Map<string, LinkValidationResult>();
  const pageResults: PageResult[] = [];

  // First pass: parse links, validate local types, collect external URLs
  const parsedPages = pageContents.map(({ slug, title, content }) => {
    const links = parseLinks(content);
    const localResults: LinkValidationResult[] = [];
    const externalUrls: { index: number; url: string; link: typeof links[0] }[] = [];

    links.forEach((link, index) => {
      switch (link.type) {
        case 'email': {
          const isValid = validateEmail(link.url);
          localResults.push({
            url: link.url, type: 'email',
            status: isValid ? 'valid' : 'warning',
            message: isValid ? 'Valid email format' : 'Invalid email format',
            text: link.text, position: link.position,
          });
          break;
        }
        case 'tel': {
          const isValid = validatePhoneNumber(link.url);
          localResults.push({
            url: link.url, type: 'tel',
            status: isValid ? 'valid' : 'warning',
            message: isValid ? 'Valid phone format' : 'Invalid phone format',
            text: link.text, position: link.position,
          });
          break;
        }
        case 'anchor':
          localResults.push({
            url: link.url, type: 'anchor', status: 'skipped',
            message: 'Anchor validation requires page context',
            text: link.text, position: link.position,
          });
          break;
        case 'external':
          externalUrls.push({ index, url: link.url, link });
          break;
        default:
          // internal links handled below
          break;
      }
    });

    return { slug, title, links, localResults, externalUrls };
  });

  // Validate all internal links
  for (const page of parsedPages) {
    for (const link of page.links) {
      if (link.type === 'internal') {
        const result = await checkInternalLink(link.url);
        result.text = link.text;
        result.position = link.position;
        page.localResults.push(result);
      }
    }
  }

  // Collect unique external URLs
  const allExternalUrls = new Set<string>();
  for (const page of parsedPages) {
    for (const ext of page.externalUrls) {
      allExternalUrls.add(ext.url);
    }
  }

  // Validate external URLs with concurrency limit
  const CONCURRENCY = 5;
  const urlArray = Array.from(allExternalUrls);
  for (let i = 0; i < urlArray.length; i += CONCURRENCY) {
    const batch = urlArray.slice(i, i + CONCURRENCY);
    const results = await Promise.all(batch.map(checkExternalLink));
    results.forEach((result, idx) => {
      externalUrlCache.set(batch[idx], result);
    });
  }

  // Assemble final results per page
  for (const page of parsedPages) {
    const allResults = [...page.localResults];

    for (const ext of page.externalUrls) {
      const cached = externalUrlCache.get(ext.url)!;
      allResults.push({
        ...cached,
        text: ext.link.text,
        position: ext.link.position,
      });
    }

    // Sort: broken first, then warning, then valid
    const statusOrder: Record<ValidationStatus, number> = { broken: 0, warning: 1, skipped: 2, valid: 3 };
    allResults.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    const summary = {
      total: allResults.length,
      valid: allResults.filter(r => r.status === 'valid').length,
      warning: allResults.filter(r => r.status === 'warning').length,
      broken: allResults.filter(r => r.status === 'broken').length,
      skipped: allResults.filter(r => r.status === 'skipped').length,
    };

    pageResults.push({
      slug: page.slug,
      title: page.title,
      editUrl: `/keystatic/branch/main/collection/pages/item/${page.slug}`,
      results: allResults,
      summary,
    });
  }

  // Sort pages: those with broken links first
  pageResults.sort((a, b) => {
    if (a.summary.broken !== b.summary.broken) return b.summary.broken - a.summary.broken;
    if (a.summary.warning !== b.summary.warning) return b.summary.warning - a.summary.warning;
    return a.slug.localeCompare(b.slug);
  });

  return pageResults;
}

// Extract title from YAML frontmatter or first heading
function extractTitle(content: string, slug: string): string {
  // Check YAML frontmatter for title
  const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (yamlMatch) {
    const titleMatch = yamlMatch[1].match(/^title:\s*['"]?(.+?)['"]?\s*$/m);
    if (titleMatch) return titleMatch[1];
  }
  // Fallback to slug
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Read all .mdoc files from content/pages/
    const files = await fs.readdir(CONTENT_DIR);
    const mdocFiles = files.filter(f => f.endsWith('.mdoc'));

    const pageContents = await Promise.all(
      mdocFiles.map(async (file) => {
        const slug = file.replace('.mdoc', '');
        const content = await fs.readFile(path.join(CONTENT_DIR, file), 'utf-8');
        const title = extractTitle(content, slug);
        return { slug, title, content };
      })
    );

    const pages = await validateAllLinks(pageContents);

    const siteSummary = {
      totalPages: pages.length,
      pagesWithBrokenLinks: pages.filter(p => p.summary.broken > 0).length,
      pagesWithWarnings: pages.filter(p => p.summary.warning > 0).length,
      totalLinks: pages.reduce((sum, p) => sum + p.summary.total, 0),
      totalBroken: pages.reduce((sum, p) => sum + p.summary.broken, 0),
      totalWarnings: pages.reduce((sum, p) => sum + p.summary.warning, 0),
    };

    return NextResponse.json({ pages, summary: siteSummary });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
