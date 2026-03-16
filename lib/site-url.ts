/**
 * Browser-safe site URL constant.
 *
 * Uses NEXT_PUBLIC_SITE_URL (available in both server and client contexts)
 * with a fallback to the production domain. Import this instead of
 * repeating `process.env.NEXT_PUBLIC_SITE_URL || '...'` inline.
 *
 * For server-only code that needs PRODUCTION_URL or PRODUCTION_DOMAIN,
 * use `SITE` from `@/lib/config/site` instead.
 */
export const SITE_URL: string =
  process.env.NEXT_PUBLIC_SITE_URL || "https://otyokwah.vercel.app";
