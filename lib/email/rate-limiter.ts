const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 3; // max 3 submissions per IP per minute
const ipSubmissions = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipSubmissions.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  ipSubmissions.set(ip, recent);
  if (ipSubmissions.size > 100) {
    for (const [key, ts] of ipSubmissions) {
      const filtered = ts.filter((t) => now - t < RATE_LIMIT_WINDOW);
      if (filtered.length === 0) ipSubmissions.delete(key);
      else ipSubmissions.set(key, filtered);
    }
  }
  return false;
}

/** @internal — exported for test cleanup only */
export function _resetRateLimiter() {
  ipSubmissions.clear();
}
