import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const KEYSTATIC_AUTH_COOKIE = "keystatic-gh-access-token";
const VALIDATION_CACHE_TTL_MS = 5 * 60 * 1000;

const validationCache = new Map<string, { valid: boolean; expiresAt: number }>();

async function validateTokenWithGitHub(token: string): Promise<boolean> {
  const cached = validationCache.get(token);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.valid;
  }

  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    });
    const valid = response.status === 200;
    validationCache.set(token, {
      valid,
      expiresAt: Date.now() + VALIDATION_CACHE_TTL_MS,
    });
    return valid;
  } catch {
    validationCache.set(token, {
      valid: false,
      expiresAt: Date.now() + VALIDATION_CACHE_TTL_MS,
    });
    return false;
  }
}

export async function isKeystatiAuthenticated(
  cookieStore: ReadonlyRequestCookies,
): Promise<boolean> {
  const token = getKeystatiAuthCookie(cookieStore);
  if (!token) {
    return false;
  }
  return validateTokenWithGitHub(token);
}

export async function requireKeystatic(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const isAuthed = await isKeystatiAuthenticated(cookieStore);
  if (!isAuthed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function getKeystatiAuthCookie(
  cookieStore: ReadonlyRequestCookies,
): string | null {
  const cookie = cookieStore.get(KEYSTATIC_AUTH_COOKIE);
  if (!cookie || !cookie.value) {
    return null;
  }
  return cookie.value;
}
