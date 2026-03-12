/**
 * REQ-CMS-017: Git Dates API for Recent Pages Sort
 *
 * Fetches the last commit date for all page files from GitHub.
 * Used by the Recent Pages sort feature in Keystatic.
 *
 * Security: Requires Keystatic auth, rate limited per IP
 */
import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { isKeystatiAuthenticated } from '@/lib/keystatic/auth';
import { DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// P0 Fix: Rate limiting per IP to prevent DoS
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 requests per 5 minutes per IP
const RATE_WINDOW = 5 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT) return false;
  limit.count++;
  return true;
}

interface GitCommitFile {
  filename: string;
}

interface GitCommit {
  sha: string;
  commit: {
    author: {
      date: string;
    };
    message: string;
  };
}

interface PageGitDate {
  slug: string;
  lastModified: string;
  commitMessage: string;
}

// Cache to avoid hitting GitHub rate limits
let cachedDates: Map<string, PageGitDate> | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // P0 Fix: Rate limiting check
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { pages: [], error: 'Rate limit exceeded. Try again in 5 minutes.', fallback: true },
        { status: 429 }
      );
    }

    // Check cache first
    const now = Date.now();
    if (cachedDates && (now - cacheTime) < CACHE_TTL) {
      return NextResponse.json({
        pages: Array.from(cachedDates.values()),
        cached: true,
      });
    }

    const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;
    const token = process.env.GITHUB_TOKEN || process.env.KEYSTATIC_GITHUB_TOKEN;

    if (!token) {
      return NextResponse.json({
        pages: [],
        error: 'GitHub token not configured',
        fallback: true,
      });
    }

    // P2 Fix: Reduced to 20 commits for better performance
    const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?path=content/pages&per_page=20`;

    // P1 Fix: Add timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second total timeout

    const response = await fetch(commitsUrl, {
      headers: {
        // P0 Fix: Use Bearer token format (modern GitHub API)
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'BearLakeCamp-CMS',
      },
      signal: controller.signal,
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      clearTimeout(timeoutId);
      if (response.status === 401) {
        return NextResponse.json({
          pages: [],
          error: 'Invalid GitHub token',
          fallback: true,
        });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits: GitCommit[] = await response.json();
    const pageMap = new Map<string, PageGitDate>();

    // P1 Fix: Process commits in parallel batches of 5 with individual timeouts
    const batchSize = 5;
    const maxPages = 30;

    for (let i = 0; i < commits.length && pageMap.size < maxPages; i += batchSize) {
      const batch = commits.slice(i, i + batchSize);

      const batchResults = await Promise.allSettled(
        batch.map(async (commit) => {
          const commitDetailUrl = `https://api.github.com/repos/${owner}/${repo}/commits/${commit.sha}`;
          const detailResponse = await fetch(commitDetailUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json',
              'User-Agent': 'BearLakeCamp-CMS',
            },
            signal: controller.signal,
          });

          if (!detailResponse.ok) return null;

          const commitDetail = await detailResponse.json();
          const files: GitCommitFile[] = commitDetail.files || [];

          const pageFiles: PageGitDate[] = [];
          for (const file of files) {
            const match = file.filename.match(/^content\/pages\/([^/]+)\.mdoc$/);
            if (match) {
              pageFiles.push({
                slug: match[1],
                lastModified: commit.commit.author.date,
                commitMessage: commit.commit.message.split('\n')[0],
              });
            }
          }
          return pageFiles;
        })
      );

      // Process results
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          for (const page of result.value) {
            if (!pageMap.has(page.slug)) {
              pageMap.set(page.slug, page);
            }
          }
        }
      }
    }

    clearTimeout(timeoutId);

    // Update cache
    cachedDates = pageMap;
    cacheTime = now;

    return NextResponse.json({
      pages: Array.from(pageMap.values()),
      cached: false,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch git dates';
    return NextResponse.json({
      pages: [],
      error: errorMessage,
      fallback: true,
    });
  }
}
