/**
 * SSRF Protection Utilities
 * REQ-SEC-004: Prevent SSRF attacks via private IP validation
 * Round 5: Added IPv6 bracket handling
 * Round 6: Added IPv4-mapped IPv6 hex notation detection
 */

// Private IPv4 ranges (RFC 1918, RFC 6598, link-local, loopback)
const PRIVATE_IPV4_RANGES = [
  /^10\./,                    // 10.0.0.0/8
  /^172\.(1[6-9]|2\d|3[01])\./, // 172.16.0.0/12
  /^192\.168\./,              // 192.168.0.0/16
  /^169\.254\./,              // Link-local (AWS metadata!)
  /^127\./,                   // Loopback
  /^0\./,                     // Current network
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // CGNAT 100.64.0.0/10 (Round 5)
];

// Private/reserved hostnames
const BLOCKED_HOSTNAMES = [
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'ip6-loopback',
];

// Strip brackets from IPv6 hostname (Round 5 fix)
function stripBrackets(hostname: string): string {
  if (hostname.startsWith('[') && hostname.endsWith(']')) {
    return hostname.slice(1, -1);
  }
  return hostname;
}

// Check if hostname looks like an IP address
function isIPAddress(hostname: string): boolean {
  const clean = stripBrackets(hostname);
  // IPv4 pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(clean)) return true;
  // IPv6 pattern (contains colon)
  if (clean.includes(':')) return true;
  return false;
}

// Check if IP is in private range
function isPrivateIP(ip: string): boolean {
  const clean = stripBrackets(ip);

  // Check IPv4 private ranges
  for (const range of PRIVATE_IPV4_RANGES) {
    if (range.test(clean)) return true;
  }

  // Check IPv6 loopback and link-local (Round 5: handle with/without brackets)
  const ipLower = clean.toLowerCase();
  if (ipLower === '::1') return true;
  if (ipLower.startsWith('fe80:')) return true;  // Link-local
  if (ipLower.startsWith('fc00:')) return true;  // Unique local
  if (ipLower.startsWith('fd00:')) return true;  // Unique local
  // IPv4-mapped IPv6 decimal format (Round 5 fix: correct slice position)
  if (ipLower.startsWith('::ffff:')) {
    const ipv4Part = ipLower.slice(7); // '::ffff:' is 7 chars
    // Check if decimal format (169.254.169.254)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(ipv4Part)) {
      return isPrivateIP(ipv4Part);
    }
    // Round 6 fix: Check hex format (::ffff:a9fe:a9fe or ::ffff:7f00:0001)
    const hexMatch = ipv4Part.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMatch) {
      const hi = parseInt(hexMatch[1], 16);
      const lo = parseInt(hexMatch[2], 16);
      const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      return isPrivateIP(ipv4);
    }
  }

  return false;
}

export function isSsrfSafeUrl(url: string): boolean {
  // Allow relative URLs (internal references)
  if (url.startsWith('/')) return true;

  try {
    const parsed = new URL(url);

    // Only allow HTTPS
    if (parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();

    // Block known private hostnames
    const cleanHostname = stripBrackets(hostname);
    if (BLOCKED_HOSTNAMES.includes(cleanHostname)) return false;
    if (cleanHostname.endsWith('.local')) return false;
    if (cleanHostname.endsWith('.internal')) return false;

    // If hostname is an IP, check if it's private (Round 5: handles brackets)
    if (isIPAddress(hostname)) {
      if (isPrivateIP(hostname)) return false;
    }

    return true;
  } catch {
    // Invalid URL
    return false;
  }
}
