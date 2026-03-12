import { createReader } from '@keystatic/core/reader';
import { createGitHubReader } from '@keystatic/core/reader/github';
import config from '../keystatic.config';
import { GITHUB } from '@/lib/config';

const DEFAULT_BRANCH = process.env.KEYSTATIC_DEFAULT_BRANCH || 'main';

function isLocalEnvironment(): boolean {
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PHASE === 'phase-production-build'
  );
}

export function getReader(branch?: string) {
  if (isLocalEnvironment()) {
    return createReader(process.cwd(), config);
  }

  const repo = GITHUB.full as `${string}/${string}`;
  const ref = branch && branch !== 'main' ? branch : DEFAULT_BRANCH;
  const token = process.env.GITHUB_TOKEN;

  if (branch && branch !== 'main' && !token) {
    throw new Error(
      'GITHUB_TOKEN environment variable is required for draft mode preview with private repositories',
    );
  }

  return createGitHubReader(config, { repo, token, ref });
}

/**
 * IMPORTANT: Do NOT cache as a module-level singleton. On Vercel, module
 * code runs once during build (NEXT_PHASE='phase-production-build'),
 * creating a filesystem reader. ISR runtime reuses the same module, so a
 * singleton would remain stale instead of using the GitHub reader.
 */
export function reader() {
  return getReader();
}

export async function readRawPageContent(slug: string): Promise<string> {
  const fileContent = isLocalEnvironment()
    ? await readFromFilesystem(slug)
    : await readFromGitHub(slug);

  const contentMatch = fileContent.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return contentMatch ? contentMatch[1].trim() : '';
}

async function readFromFilesystem(slug: string): Promise<string> {
  const fs = await import('fs/promises');
  const pathMod = await import('path');
  const filePath = pathMod.join(process.cwd(), 'content', 'pages', `${slug}.mdoc`);
  return fs.readFile(filePath, 'utf-8');
}

async function readFromGitHub(slug: string): Promise<string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN is required for ISR content fetch');
  }

  const url = `https://api.github.com/repos/${GITHUB.full}/contents/content/pages/${slug}.mdoc?ref=${DEFAULT_BRANCH}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3.raw',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) return '';
    throw new Error(`GitHub API fetch failed: ${res.status} ${res.statusText}`);
  }

  return res.text();
}