/**
 * Slug Validation Utility
 * P0-SEC-003: Prevent path traversal attacks
 * P1-R4-SEC-001: Enhanced with null byte and URL-encoding checks
 */

/**
 * Validates that a slug is safe for file system operations
 * - Only allows alphanumeric characters, hyphens, and underscores
 * - Blocks path traversal sequences (..) including URL-encoded variants
 * - Blocks null bytes and control characters
 * - Enforces length limit
 * - Returns false for any suspicious patterns
 */
export function isValidSlug(slug: string): boolean {
  // Must be non-empty string
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Length limit (prevent DoS with extremely long slugs)
  if (slug.length > 100) {
    return false;
  }

  // Block null bytes (can truncate strings in some contexts)
  if (slug.includes("\x00") || slug.includes("%00")) {
    return false;
  }

  // Block path traversal sequences (including URL-encoded variants)
  // %2e = '.', %2E = '.', so %2e%2e = '..'
  if (
    slug.includes("..") ||
    slug.toLowerCase().includes("%2e%2e") ||
    slug.toLowerCase().includes("%2e.") ||
    slug.toLowerCase().includes(".%2e")
  ) {
    return false;
  }

  // Allow only safe characters: alphanumeric, dash, underscore
  // This regex blocks: /, \, %, etc.
  const safeSlugPattern = /^[a-z0-9_-]+$/i;
  return safeSlugPattern.test(slug);
}

/**
 * Sanitizes a slug by removing dangerous characters
 * Throws an error if the slug contains path traversal sequences
 */
export function sanitizeSlug(slug: string): string {
  if (slug.includes('..')) {
    throw new Error('Path traversal attempt detected');
  }

  // Remove any characters that aren't alphanumeric, dash, or underscore
  const sanitized = slug.replace(/[^a-z0-9_-]/gi, '');

  if (!sanitized) {
    throw new Error('Invalid slug: no valid characters remaining');
  }

  return sanitized;
}
