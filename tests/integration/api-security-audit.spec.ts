/**
 * API Security Audit
 *
 * Validates API route security patterns via static source analysis.
 * - Keystatic routes require auth
 * - Mutating routes have auth checks
 * - No dangerous anti-patterns
 *
 * ~1 SP
 */
import { describe, test, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const API_DIR = join(process.cwd(), "app/api");

/**
 * Routes that are intentionally public (no auth required).
 * Each entry needs a justification.
 */
const PUBLIC_ROUTE_ALLOWLIST: Record<string, string> = {
  "health/route.ts": "Health check endpoint",
  "health/keystatic/route.ts": "Keystatic health check",
  "contact/route.ts": "Public contact form (CAPTCHA protected)",
  "search-index/route.ts": "Public search index",
  "submit-bug/route.ts": "Public bug report (CAPTCHA protected)",
  "keystatic/[...params]/route.ts": "Keystatic core handler (has own auth)",
  "keystatic/logout/route.ts": "Logout endpoint (clears cookies, no auth needed)",
  "vitals/route.ts": "Public web vitals beacon endpoint (receives sendBeacon from all visitors)",
};

/**
 * Recursively collect all route.ts files under a directory.
 */
function collectRouteFiles(dir: string): string[] {
  const results: string[] = [];

  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      if (statSync(fullPath).isDirectory()) {
        results.push(...collectRouteFiles(fullPath));
      } else if (entry === "route.ts") {
        results.push(fullPath);
      }
    }
  } catch {
    // Directory doesn't exist
  }

  return results;
}

function getRelativePath(fullPath: string): string {
  return relative(API_DIR, fullPath);
}

function hasAuthCheck(source: string): boolean {
  return (
    source.includes("isKeystatiAuthenticated") ||
    source.includes("requireKeystatic") ||
    source.includes("getKeystatiAuthCookie") ||
    source.includes("REVALIDATION_SECRET") ||
    source.includes("REVALIDATE_SECRET") ||
    source.includes("TURNSTILE_SECRET") ||
    source.includes("verifyTurnstileToken") ||
    source.includes("x-revalidation-secret") ||
    source.includes("DRAFT_SECRET") ||
    source.includes("authorization") ||
    source.includes("Authorization")
  );
}

function hasMutatingMethods(source: string): boolean {
  return (
    source.includes("export async function POST") ||
    source.includes("export async function PUT") ||
    source.includes("export async function DELETE") ||
    source.includes("export async function PATCH") ||
    source.includes("export function POST") ||
    source.includes("export function PUT") ||
    source.includes("export function DELETE") ||
    source.includes("export function PATCH")
  );
}

describe("API Security Audit", () => {
  const routeFiles = collectRouteFiles(API_DIR);

  test("discovered API routes exist", () => {
    expect(routeFiles.length).toBeGreaterThan(0);
  });

  describe("keystatic admin routes require authentication", () => {
    const keystatiRoutes = routeFiles.filter((f) => {
      const rel = getRelativePath(f);
      return (
        rel.startsWith("keystatic/") && !PUBLIC_ROUTE_ALLOWLIST[rel]
      );
    });

    for (const routeFile of keystatiRoutes) {
      const rel = getRelativePath(routeFile);

      test(`${rel} calls auth check`, () => {
        const source = readFileSync(routeFile, "utf-8");
        expect(
          hasAuthCheck(source),
          `Keystatic route ${rel} does not call isKeystatiAuthenticated or similar auth check`,
        ).toBe(true);
      });
    }
  });

  describe("mutating endpoints have auth checks", () => {
    for (const routeFile of routeFiles) {
      const rel = getRelativePath(routeFile);
      if (PUBLIC_ROUTE_ALLOWLIST[rel]) continue;

      const source = readFileSync(routeFile, "utf-8");
      if (!hasMutatingMethods(source)) continue;

      test(`${rel} POST/PUT/DELETE has auth check`, () => {
        expect(
          hasAuthCheck(source),
          `${rel} accepts mutations (POST/PUT/DELETE) but has no auth check. ` +
            `Add isKeystatiAuthenticated, CAPTCHA, or secret validation.`,
        ).toBe(true);
      });
    }
  });

  describe("admin-only routes require authentication", () => {
    const adminRoutes = routeFiles.filter((f) => {
      const rel = getRelativePath(f);
      return (
        !PUBLIC_ROUTE_ALLOWLIST[rel] &&
        (rel.includes("keystatic/") ||
          rel.includes("generate-seo") ||
          rel.includes("suggest-alt-text") ||
          rel.includes("validate-links") ||
          rel.includes("media") ||
          rel.includes("revalidate") ||
          rel.includes("draft") ||
          rel.includes("exit-draft"))
      );
    });

    for (const routeFile of adminRoutes) {
      const rel = getRelativePath(routeFile);

      test(`admin route ${rel} has auth check`, () => {
        const source = readFileSync(routeFile, "utf-8");
        expect(
          hasAuthCheck(source),
          `Admin route ${rel} lacks authentication check`,
        ).toBe(true);
      });
    }
  });

  describe("no empty catch blocks that return success", () => {
    // Routes where catch-and-return-success is intentional (e.g., graceful degradation)
    const CATCH_SUCCESS_ALLOWLIST = new Set([
      "contact/route.ts", // Returns user-friendly error on email failure
    ]);

    for (const routeFile of routeFiles) {
      const rel = getRelativePath(routeFile);
      if (CATCH_SUCCESS_ALLOWLIST.has(rel)) continue;

      const source = readFileSync(routeFile, "utf-8");

      test(`${rel}: catch blocks don't silently swallow errors`, () => {
        const emptyCatchSuccess =
          /catch\s*(?:\([^)]*\))?\s*\{\s*return\s+(?:NextResponse\.json\s*\(\s*\{[^}]*(?:success|ok))/s;
        expect(
          source,
          `${rel} has a catch block that returns success — errors may be silently swallowed`,
        ).not.toMatch(emptyCatchSuccess);
      });
    }
  });

  describe("revalidation routes use secret validation", () => {
    const revalidateRoutes = routeFiles.filter((f) =>
      getRelativePath(f).includes("revalidate"),
    );

    for (const routeFile of revalidateRoutes) {
      const rel = getRelativePath(routeFile);

      test(`${rel} validates revalidation secret or auth`, () => {
        const source = readFileSync(routeFile, "utf-8");
        const hasSecretOrAuth =
          source.includes("REVALIDATION_SECRET") ||
          source.includes("x-revalidation-secret") ||
          hasAuthCheck(source);

        expect(
          hasSecretOrAuth,
          `Revalidation route ${rel} has no secret/auth validation — ` +
            `anyone could trigger cache purges`,
        ).toBe(true);
      });
    }
  });

  describe("no unvalidated redirects", () => {
    for (const routeFile of routeFiles) {
      const rel = getRelativePath(routeFile);
      const source = readFileSync(routeFile, "utf-8");

      if (!source.includes("redirect")) continue;

      test(`${rel}: redirects don't use unvalidated user input`, () => {
        const dangerousRedirect =
          /redirect\s*\(\s*(?:req\.(?:query|url|nextUrl)|searchParams\.get)/;
        expect(
          source,
          `${rel} may have an open redirect vulnerability`,
        ).not.toMatch(dangerousRedirect);
      });
    }
  });
});
