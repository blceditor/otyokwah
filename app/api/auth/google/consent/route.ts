import { NextResponse } from "next/server";
import { getConsentUrl } from "@/lib/google-analytics/auth";

export const dynamic = "force-dynamic";

/**
 * Redirects to Google OAuth consent screen.
 * Visit this URL to authorize the app for GA4 data access.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/google/callback`;
  return NextResponse.redirect(getConsentUrl(redirectUri));
}
