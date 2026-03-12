/**
 * REQ-FUTURE-007: Media Scanner
 *
 * Scans the public/ directory for media files and extracts metadata.
 * In production (Vercel), uses GitHub Trees API instead of local filesystem
 * so newly uploaded files appear immediately.
 */

import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { GITHUB } from '@/lib/config';

const CONTENT_BRANCH = process.env.KEYSTATIC_DEFAULT_BRANCH || 'main';

export interface MediaFile {
  id: string;
  filename: string;
  path: string; // Relative to public/
  url: string; // URL path (e.g., /images/hero.jpg)
  thumbnailUrl?: string; // GitHub raw URL for production thumbnails
  size: number;
  type: string;
  extension: string;
  uploadedAt: Date;
  usedIn?: string[]; // Page slugs where this image is used
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov'];
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
const MEDIA_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOCUMENT_EXTENSIONS];

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'pages');

const useGitHub =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE !== 'phase-production-build';

/**
 * Generate a unique ID for a media file based on its path
 */
function generateFileId(filePath: string): string {
  return crypto.createHash('md5').update(filePath).digest('hex').slice(0, 12);
}

/**
 * Get file extension
 */
function getExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Determine file type based on extension
 */
function getFileType(extension: string): string {
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  if (DOCUMENT_EXTENSIONS.includes(extension)) return 'document';
  return 'other';
}

/**
 * Parse epoch-millisecond timestamp from uploaded filenames (e.g. "1771540602023-bear-pixoo.jpeg")
 */
function parseFilenameTimestamp(filename: string): Date | null {
  const match = filename.match(/^(\d{13})-/);
  if (!match) return null;
  const ts = parseInt(match[1], 10);
  if (isNaN(ts) || ts < 1_000_000_000_000 || ts > 2_000_000_000_000) return null;
  return new Date(ts);
}

/**
 * Recursively scan a directory for media files
 */
async function scanDirectory(
  dir: string,
  basePath: string = ''
): Promise<MediaFile[]> {
  const files: MediaFile[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(basePath, entry.name);

      if (entry.isDirectory()) {
        // Skip certain directories
        if (['node_modules', '.git', '.next', 'pagefind'].includes(entry.name)) {
          continue;
        }
        // Recurse into subdirectories
        const subFiles = await scanDirectory(fullPath, relativePath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const extension = getExtension(entry.name);

        if (MEDIA_EXTENSIONS.includes(extension)) {
          const stats = await fs.stat(fullPath);
          const uploadedAt = parseFilenameTimestamp(entry.name) ?? stats.mtime;

          files.push({
            id: generateFileId(relativePath),
            filename: entry.name,
            path: relativePath,
            url: '/' + relativePath.replace(/\\/g, '/'),
            size: stats.size,
            type: getFileType(extension),
            extension: extension.slice(1), // Remove leading dot
            uploadedAt,
          });
        }
      }
    }
  } catch {
    // Directory scan failed; return partial results
  }

  return files;
}

/**
 * Scan media files from GitHub Trees API (production).
 * Single API call returns the entire repo tree; we filter for public/ media files.
 */
async function scanMediaFilesFromGitHub(): Promise<MediaFile[]> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return [];

  const repo = GITHUB.full;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/git/trees/${CONTENT_BRANCH}?recursive=1`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) return [];

  const data = await res.json();
  const tree = data.tree as Array<{ path: string; type: string; size?: number }>;
  const files: MediaFile[] = [];

  for (const entry of tree) {
    if (entry.type !== 'blob') continue;
    if (!entry.path.startsWith('public/')) continue;

    const relativePath = entry.path.slice('public/'.length); // e.g. "images/uploads/123-foo.jpg"
    const filename = relativePath.split('/').pop() || '';
    const extension = getExtension(filename);

    if (!MEDIA_EXTENSIONS.includes(extension)) continue;

    const uploadedAt = parseFilenameTimestamp(filename) ?? new Date(0);

    files.push({
      id: generateFileId(relativePath),
      filename,
      path: relativePath,
      url: '/' + relativePath.replace(/\\/g, '/'),
      thumbnailUrl: `/api/media/thumbnail?path=${encodeURIComponent(relativePath)}`,
      size: entry.size ?? 0,
      type: getFileType(extension),
      extension: extension.slice(1),
      uploadedAt,
    });
  }

  return files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

/**
 * Find media usage from GitHub (production).
 * Fetches .mdoc file list from the tree, then reads each to find media references.
 */
async function findMediaUsageFromGitHub(
  tree: Array<{ path: string; type: string }>,
): Promise<Map<string, string[]>> {
  const usageMap = new Map<string, string[]>();
  const token = process.env.GITHUB_TOKEN;
  if (!token) return usageMap;

  const repo = GITHUB.full;
  const mdocFiles = tree.filter(
    (e) => e.type === 'blob' && e.path.startsWith('content/pages/') && e.path.endsWith('.mdoc'),
  );

  // Fetch all .mdoc files in parallel (typically ~31 files)
  const fetches = mdocFiles.map(async (entry) => {
    const url = `https://api.github.com/repos/${repo}/contents/${entry.path}?ref=${CONTENT_BRANCH}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3.raw',
      },
      cache: 'no-store',
    });
    if (!res.ok) return;

    const content = await res.text();
    const pageSlug = entry.path.split('/').pop()?.replace('.mdoc', '') || '';
    const mediaRefs = content.match(
      /(?:\/[^\s"']+\.(?:jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov))/gi,
    );

    if (mediaRefs) {
      for (const ref of mediaRefs) {
        const normalizedRef = ref.toLowerCase();
        const existing = usageMap.get(normalizedRef) || [];
        if (!existing.includes(pageSlug)) {
          existing.push(pageSlug);
          usageMap.set(normalizedRef, existing);
        }
      }
    }
  });

  await Promise.all(fetches);
  return usageMap;
}

/**
 * Scan the public directory for all media files
 */
export async function scanMediaFiles(): Promise<MediaFile[]> {
  if (useGitHub) {
    return scanMediaFilesFromGitHub();
  }

  const files = await scanDirectory(PUBLIC_DIR);

  // Sort by most recently modified first
  return files.sort(
    (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime()
  );
}

/**
 * Find usage of media files across content pages
 */
export async function findMediaUsage(): Promise<Map<string, string[]>> {
  const usageMap = new Map<string, string[]>();

  try {
    const pageFiles = await fs.readdir(CONTENT_DIR);

    for (const pageFile of pageFiles) {
      if (!pageFile.endsWith('.mdoc')) continue;

      const pagePath = path.join(CONTENT_DIR, pageFile);
      const content = await fs.readFile(pagePath, 'utf-8');
      const pageSlug = pageFile.replace('.mdoc', '');

      // Find all image/video references in the content
      const mediaRefs = content.match(/(?:\/[^\s"']+\.(?:jpg|jpeg|png|gif|webp|svg|avif|mp4|webm|mov))/gi);

      if (mediaRefs) {
        for (const ref of mediaRefs) {
          const normalizedRef = ref.toLowerCase();
          const existing = usageMap.get(normalizedRef) || [];
          if (!existing.includes(pageSlug)) {
            existing.push(pageSlug);
            usageMap.set(normalizedRef, existing);
          }
        }
      }
    }
  } catch {
    // Usage scan failed; return partial results
  }

  return usageMap;
}

/**
 * Scan media files and include usage information
 */
export async function scanMediaFilesWithUsage(): Promise<MediaFile[]> {
  if (useGitHub) {
    // In production, use GitHub Trees API for both file listing and usage
    const token = process.env.GITHUB_TOKEN;
    if (!token) return [];

    const repo = GITHUB.full;
    const res = await fetch(
      `https://api.github.com/repos/${repo}/git/trees/${CONTENT_BRANCH}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
        },
        cache: 'no-store',
      },
    );

    if (!res.ok) return [];

    const data = await res.json();
    const tree = data.tree as Array<{ path: string; type: string; size?: number }>;

    // Build file list and usage map from the same tree fetch
    const files: MediaFile[] = [];
    for (const entry of tree) {
      if (entry.type !== 'blob') continue;
      if (!entry.path.startsWith('public/')) continue;

      const relativePath = entry.path.slice('public/'.length);
      const filename = relativePath.split('/').pop() || '';
      const extension = getExtension(filename);

      if (!MEDIA_EXTENSIONS.includes(extension)) continue;

      const uploadedAt = parseFilenameTimestamp(filename) ?? new Date(0);

      files.push({
        id: generateFileId(relativePath),
        filename,
        path: relativePath,
        url: '/' + relativePath.replace(/\\/g, '/'),
        thumbnailUrl: `/api/media/thumbnail?path=${encodeURIComponent(relativePath)}`,
        size: entry.size ?? 0,
        type: getFileType(extension),
        extension: extension.slice(1),
        uploadedAt,
      });
    }

    files.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());

    // Get usage from .mdoc files in the same tree
    const usageMap = await findMediaUsageFromGitHub(tree);

    return files.map((file) => ({
      ...file,
      usedIn: usageMap.get(file.url.toLowerCase()) || [],
    }));
  }

  const [files, usageMap] = await Promise.all([
    scanMediaFiles(),
    findMediaUsage(),
  ]);

  return files.map((file) => ({
    ...file,
    usedIn: usageMap.get(file.url.toLowerCase()) || [],
  }));
}

/**
 * Delete a media file
 */
export async function deleteMediaFile(filePath: string): Promise<boolean> {
  try {
    const fullPath = path.join(PUBLIC_DIR, filePath);

    // Security check: ensure path is within public directory
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(PUBLIC_DIR)) {
      throw new Error('Invalid file path');
    }

    await fs.unlink(resolvedPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
