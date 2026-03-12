import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/google-analytics/auth";

export const dynamic = "force-dynamic";

/**
 * Google OAuth callback — exchanges authorization code for tokens.
 * The refresh_token must be saved as GOOGLE_REFRESH_TOKEN env var in Vercel.
 * This route is used once during initial setup.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code" },
      { status: 400 },
    );
  }

  const redirectUri = `${url.origin}/api/auth/google/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    // Display the refresh token so it can be saved as an env var.
    // This page is only visited once during setup.
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head><title>Google Analytics Setup</title></head>
<body style="font-family: system-ui; max-width: 600px; margin: 40px auto; padding: 20px;">
  <h1>Google Analytics Connected</h1>
  <p>Copy the refresh token below and save it as <code>GOOGLE_REFRESH_TOKEN</code> in Vercel environment variables:</p>
  <textarea readonly style="width: 100%; height: 100px; font-family: monospace; padding: 8px; font-size: 13px;">${tokens.refresh_token}</textarea>
  <p style="margin-top: 16px; color: #666;">After saving the env var, redeploy to activate the analytics dashboard.</p>
  <p><a href="/admin/analytics">Go to Analytics Dashboard</a></p>
</body>
</html>`,
      {
        headers: { "Content-Type": "text/html" },
      },
    );
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
