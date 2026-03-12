/**
 * REQ-FUTURE-007: Media Library API
 *
 * Handles media file operations:
 * - GET: List all media files
 * - POST: Upload new media files (GitHub API in production, fs in dev)
 * - DELETE: Delete media files
 */

import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import {
  isKeystatiAuthenticated,
  getKeystatiAuthCookie,
} from "@/lib/keystatic/auth";
import {
  scanMediaFilesWithUsage,
  deleteMediaFile,
} from "@/lib/keystatic/mediaScanner";
import {
  DEFAULT_GITHUB_OWNER,
  DEFAULT_GITHUB_REPO,
} from "@/lib/config";

const PUBLIC_DIR = path.join(process.cwd(), "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "images", "uploads");
const DOCUMENTS_DIR = path.join(PUBLIC_DIR, "documents");

const DOCUMENT_EXTENSIONS = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

const isProduction = process.env.NODE_ENV === "production";

function isDocumentExtension(ext: string): boolean {
  return DOCUMENT_EXTENSIONS.includes(ext);
}

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function deleteViaGitHub(
  token: string,
  repoPath: string,
): Promise<boolean> {
  const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;

  const getResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!getResponse.ok) return false;

  const { sha } = await getResponse.json();

  const deleteResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `media: delete ${repoPath.split("/").pop()}`,
        sha,
      }),
    },
  );

  return deleteResponse.ok;
}

async function uploadViaGitHub(
  token: string,
  repoPath: string,
  content: string,
  message: string,
): Promise<boolean> {
  const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO || DEFAULT_GITHUB_REPO;

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message, content }),
    },
  );

  return response.ok;
}

/**
 * GET: List all media files
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type"); // 'image', 'video', or null for all
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "500");

    let files = await scanMediaFilesWithUsage();

    // Filter by type
    if (type) {
      files = files.filter((f) => f.type === type);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      files = files.filter(
        (f) =>
          f.filename.toLowerCase().includes(searchLower) ||
          f.path.toLowerCase().includes(searchLower),
      );
    }

    // Pagination
    const total = files.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedFiles = files.slice(offset, offset + limit);

    return NextResponse.json({
      files: paginatedFiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to list media files" },
      { status: 500 },
    );
  }
}

/**
 * POST: Upload new media files
 * REQ-SEC-002: Authentication required
 * Uses GitHub Contents API in production (Vercel read-only fs), local fs in dev
 */
export async function POST(request: NextRequest) {
  try {
    // REQ-SEC-002: Auth check
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ghToken = isProduction ? getKeystatiAuthCookie(cookieStore) : null;

    if (!isProduction) {
      await ensureDir(UPLOAD_DIR);
      await ensureDir(DOCUMENTS_DIR);
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadedFiles: { filename: string; url: string }[] = [];
    const errors: { filename: string; error: string }[] = [];

    for (const file of files) {
      const extension = path.extname(file.name).toLowerCase();
      // REQ-SEC-003: SVG removed - can contain embedded JavaScript (XSS)
      const allowedMediaExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".gif",
        ".webp",
        ".avif",
        ".mp4",
        ".webm",
      ];
      const allowedExtensions = [...allowedMediaExtensions, ...DOCUMENT_EXTENSIONS];

      if (!allowedExtensions.includes(extension)) {
        errors.push({
          filename: file.name,
          error: `Invalid file type: ${extension}`,
        });
        continue;
      }

      // REQ-BUG9: Documents allow up to 10MB, media up to 5MB
      const isDocument = isDocumentExtension(extension);
      const MAX_SIZE = isDocument ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        errors.push({
          filename: file.name,
          error: `File exceeds ${isDocument ? "10MB" : "5MB"} limit`,
        });
        continue;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filename = `${timestamp}-${safeName}`;
      const repoDir = isDocument ? "public/documents" : "public/images/uploads";
      const publicUrl = isDocument
        ? `/documents/${filename}`
        : `/images/uploads/${filename}`;

      const buffer = Buffer.from(await file.arrayBuffer());

      if (isProduction && ghToken) {
        // Upload via GitHub Contents API (Vercel fs is read-only)
        const base64Content = buffer.toString("base64");
        const repoPath = `${repoDir}/${filename}`;
        const ok = await uploadViaGitHub(
          ghToken,
          repoPath,
          base64Content,
          `media: upload ${filename}`,
        );
        if (!ok) {
          errors.push({ filename: file.name, error: "GitHub upload failed" });
          continue;
        }
      } else {
        // Local filesystem write (development)
        const targetDir = isDocument ? DOCUMENTS_DIR : UPLOAD_DIR;
        const filePath = path.join(targetDir, filename);
        await fs.writeFile(filePath, buffer);
      }

      uploadedFiles.push({ filename, url: publicUrl });
    }

    return NextResponse.json({
      uploaded: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to upload files";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE: Delete media files
 * REQ-SEC-002: Authentication required + path traversal prevention
 */
export async function DELETE(request: NextRequest) {
  try {
    // REQ-SEC-002: Auth check
    const cookieStore = await cookies();
    const isAdmin = await isKeystatiAuthenticated(cookieStore);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { paths } = body as { paths: string[] };

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json(
        { error: "No file paths provided" },
        { status: 400 },
      );
    }

    const results: { path: string; success: boolean; error?: string }[] = [];
    const imagesDir = path.resolve(process.cwd(), "public/images");
    const documentsDir = path.resolve(process.cwd(), "public/documents");

    for (const filePath of paths) {
      // Security: Only allow deletion from specific directories
      const isImagesPath =
        filePath.startsWith("/images/") || filePath.startsWith("images/");
      const isDocumentsPath =
        filePath.startsWith("/documents/") || filePath.startsWith("documents/");

      if (!isImagesPath && !isDocumentsPath) {
        results.push({ path: filePath, success: false, error: "Invalid path" });
        continue;
      }

      // REQ-SEC-002: Path traversal prevention with double decode
      const decodedPath = decodeURIComponent(decodeURIComponent(filePath));
      const normalizedPath = path.normalize(decodedPath);

      const baseDir = isDocumentsPath ? documentsDir : imagesDir;
      const stripPrefix = isDocumentsPath
        ? /^\/?(documents\/)?/
        : /^\/?(images\/)?/;
      const resolvedPath = path.resolve(
        baseDir,
        normalizedPath.replace(stripPrefix, ""),
      );

      if (!resolvedPath.startsWith(baseDir)) {
        results.push({ path: filePath, success: false, error: "Invalid path" });
        continue;
      }

      const relativePath = filePath.replace(/^\//, "");
      let success = false;

      if (isProduction) {
        const ghToken = getKeystatiAuthCookie(cookieStore);
        if (!ghToken) {
          results.push({
            path: filePath,
            success: false,
            error: "Not authenticated",
          });
          continue;
        }
        success = await deleteViaGitHub(ghToken, `public/${relativePath}`);
      } else {
        success = await deleteMediaFile(relativePath);
      }

      results.push({ path: filePath, success });
    }

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete files" },
      { status: 500 },
    );
  }
}
