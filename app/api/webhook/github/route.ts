import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createHmac, timingSafeEqual } from 'crypto';

const ACTIVE_BRANCH = process.env.KEYSTATIC_DEFAULT_BRANCH || 'main';

const LAYOUT_REVALIDATION_PREFIXES = [
  'content/navigation/',
  'content/testimonials/',
  'content/staff/',
  'content/faqs/',
  'content/singletons/',
];

interface GitHubCommit {
  added: string[];
  modified: string[];
  removed: string[];
}

interface GitHubPushPayload {
  ref: string;
  commits: GitHubCommit[];
}

function verifySignature(payload: Buffer, signature: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || !signature) return false;

  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') return false;

  const expected = createHmac('sha256', secret).update(payload).digest('hex');

  try {
    return timingSafeEqual(
      Buffer.from(parts[1], 'hex'),
      Buffer.from(expected, 'hex'),
    );
  } catch {
    return false;
  }
}

function collectChangedFiles(commits: GitHubCommit[]): Set<string> {
  const files = new Set<string>();
  for (const commit of commits) {
    for (const file of [...commit.added, ...commit.modified, ...commit.removed]) {
      files.add(file);
    }
  }
  return files;
}

function revalidateChangedPaths(changedFiles: Set<string>): string[] {
  const revalidated: string[] = [];
  let layoutRevalidated = false;

  for (const filePath of changedFiles) {
    if (!layoutRevalidated) {
      const matchedPrefix = LAYOUT_REVALIDATION_PREFIXES.find((prefix) =>
        filePath.startsWith(prefix),
      );
      if (matchedPrefix) {
        revalidatePath('/', 'layout');
        revalidated.push(`/ (layout - ${matchedPrefix.split('/')[1]})`);
        layoutRevalidated = true;
        continue;
      }
    }

    const pageMatch = filePath.match(/^content\/pages\/([^/]+)\.mdoc$/);
    if (pageMatch) {
      const slug = pageMatch[1];
      const pagePath = slug === 'index' ? '/' : `/${slug}`;
      if (!revalidated.includes(pagePath)) {
        revalidatePath(pagePath);
        revalidated.push(pagePath);
      }
    }
  }

  return revalidated;
}

export async function POST(request: NextRequest) {
  if (!process.env.REVALIDATE_SECRET) {
    console.error('[Webhook] REVALIDATE_SECRET not configured');
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = request.headers.get('x-github-event');
  if (event !== 'push') {
    return NextResponse.json({ message: 'Ignored non-push event', revalidated: [] });
  }

  let payload: GitHubPushPayload;
  try {
    payload = JSON.parse(rawBody.toString('utf-8'));
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (payload.ref !== `refs/heads/${ACTIVE_BRANCH}`) {
    return NextResponse.json({
      message: `Ignored non-${ACTIVE_BRANCH} branch`,
      revalidated: [],
    });
  }

  const changedFiles = collectChangedFiles(payload.commits ?? []);
  const revalidated = revalidateChangedPaths(changedFiles);

  console.log(`[Webhook] Revalidated: ${revalidated.join(', ') || 'none'}`);

  return NextResponse.json({
    revalidated,
    message: `Processed ${changedFiles.size} changed files`,
  });
}
