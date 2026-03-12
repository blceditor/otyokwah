import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SITE_URL } from "@/lib/site-url";

function expireCookie(
  name: string,
  path: string,
  httpOnly: boolean,
  secure: boolean,
): string {
  let header = `${name}=; Path=${path}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; SameSite=Lax`;
  if (secure) header += "; Secure";
  if (httpOnly) header += "; HttpOnly";
  return header;
}

export async function GET(request: Request) {
  // Allow redirect override (used by Nuclear Reset to go back to /keystatic)
  const url = new URL(request.url);
  const returnPath = url.searchParams.get("return");
  // Only allow relative paths to prevent open redirect
  const redirectTo =
    returnPath && returnPath.startsWith("/")
      ? returnPath
      : "/keystatic/logged-out";
  const response = NextResponse.redirect(new URL(redirectTo, SITE_URL));
  const isProduction = process.env.NODE_ENV === "production";

  const knownCookies = [
    "keystatic-gh-access-token",
    "keystatic-gh-refresh-token",
    "keystatic-gh-token",
    "__Host-keystatic-gh-access-token",
    "__Host-keystatic-gh-refresh-token",
    "__Secure-keystatic-gh-access-token",
    "__Secure-keystatic-gh-refresh-token",
    "keystatic-state",
    "keystatic-csrf",
  ];

  // Keystatic sets the access token with explicit path: '/' but the refresh
  // token has NO explicit path — it defaults to the OAuth callback's request
  // URI directory: /api/keystatic/github (per RFC 6265 default-path).
  // We MUST clear at all possible paths.
  //
  // IMPORTANT: response.cookies.set() uses a Map keyed by name, so calling
  // it multiple times with the same name but different paths OVERWRITES
  // previous entries. We must use raw Set-Cookie headers via headers.append().
  const paths = [
    "/",
    "/api",
    "/api/keystatic",
    "/api/keystatic/github",
    "/api/keystatic/github/callback",
    "/api/keystatic/github/refresh-token",
    "/keystatic",
  ];

  for (const cookieName of knownCookies) {
    const isRefreshToken = cookieName.toLowerCase().includes("refresh");
    for (const path of paths) {
      response.headers.append(
        "Set-Cookie",
        expireCookie(cookieName, path, isRefreshToken, isProduction),
      );
    }
  }

  // Also clear any dynamically-discovered keystatic/github cookies
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    for (const c of allCookies) {
      const name = c.name.toLowerCase();
      if (name.includes("keystatic") || name.includes("github")) {
        for (const path of paths) {
          response.headers.append(
            "Set-Cookie",
            expireCookie(c.name, path, true, isProduction),
          );
        }
      }
    }
  } catch {
    // Ignore cookie read errors
  }

  return response;
}

export async function POST(request: Request) {
  return GET(request);
}
