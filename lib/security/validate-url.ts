/**
 * URL Validation Utilities
 * P1-PE-001 + P0-SEC-004: Prevent XSS via malicious URLs
 */

/**
 * Validates that an image URL is safe to use in inline styles or img src
 * - Blocks javascript:, data:, vbscript:, file:, blob: schemes
 * - Only allows relative paths (/) or HTTPS URLs
 */
export function isSafeImageUrl(url: string | undefined): boolean {
  if (!url) return false;

  // Allow relative paths starting with /
  if (url.startsWith('/')) return true;

  // Allow HTTPS URLs only
  if (url.startsWith('https://')) return true;

  // Block everything else (javascript:, data:, http:, etc.)
  return false;
}

/**
 * Validates that a link URL is safe to use in anchor tags
 * - Blocks dangerous schemes: javascript:, data:, vbscript:, file:, blob:
 * - Allows: http:, https:, mailto:, tel:, and relative URLs
 */
export function isSafeLinkUrl(url: string | undefined): boolean {
  if (!url) return false;

  // List of dangerous URL schemes
  const dangerousSchemes = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'blob:',
  ];

  const urlLower = url.toLowerCase();

  // Block dangerous schemes
  if (dangerousSchemes.some(scheme => urlLower.startsWith(scheme))) {
    return false;
  }

  // Allow all other URLs (http, https, mailto, tel, relative)
  return true;
}
