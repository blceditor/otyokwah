import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isKeystatiAuthenticated } from "@/lib/keystatic/auth";
import { GITHUB } from "@/lib/config";

/**
 * GET /api/media/thumbnail?path=images/uploads/123-foo.jpg
 *
 * Proxies image bytes from the private GitHub repo so they can be used
 * as <img src> in the browser without exposing the GitHub token.
 */
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const isAdmin = await isKeystatiAuthenticated(cookieStore);
  if (!isAdmin) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const filePath = request.nextUrl.searchParams.get("path");
  if (!filePath) {
    return new NextResponse("Missing path parameter", { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const repo = GITHUB.full;
  const res = await fetch(
    `https://api.github.com/repos/${repo}/contents/public/${filePath}?ref=${process.env.KEYSTATIC_DEFAULT_BRANCH || 'main'}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3.raw",
      },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return new NextResponse("Not found", { status: 404 });
  }

  const contentType = res.headers.get("content-type") || "application/octet-stream";
  const body = await res.arrayBuffer();

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
