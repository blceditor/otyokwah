import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  isKeystatiAuthenticated,
  getKeystatiAuthCookie,
} from "@/lib/keystatic/auth";
import { DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO } from "@/lib/config";

/**
 * GET: Returns GitHub upload config for client-side direct upload.
 * Used by MediaLibrary to bypass serverless body size limits for large files.
 * Auth-gated — requires valid Keystatic session.
 */
export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = await isKeystatiAuthenticated(cookieStore);
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = getKeystatiAuthCookie(cookieStore);
  if (!token) {
    return NextResponse.json(
      { error: "No GitHub token available" },
      { status: 401 },
    );
  }

  const owner = process.env.GITHUB_OWNER || DEFAULT_GITHUB_OWNER;
  const repo =
    process.env.GITHUB_REPO?.split("/").pop() || DEFAULT_GITHUB_REPO;
  const branch = process.env.KEYSTATIC_DEFAULT_BRANCH || "main";

  return NextResponse.json({ owner, repo, branch, token });
}
