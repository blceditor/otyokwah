import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to inject raw GA4 script tags into HTML responses.
 *
 * Next.js App Router serializes all <script> tags through its internal
 * RSC loader (self.__next_s), which Google's tag verification tool
 * cannot recognize. This middleware injects the standard <script> tags
 * that Google expects to find.
 */

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const GA_SNIPPET = GA_ID
  ? [
      `<!-- Google tag (gtag.js) -->`,
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');</script>`,
    ].join("")
  : "";

export async function middleware(request: NextRequest) {
  if (!GA_SNIPPET) return NextResponse.next();

  // Skip if this is a recursive call from our own fetch
  if (request.headers.get("x-ga-injected")) {
    return NextResponse.next();
  }

  // Fetch the actual page with a marker to prevent infinite loop
  const url = request.nextUrl.clone();
  const headers = new Headers(request.headers);
  headers.set("x-ga-injected", "1");

  const response = await fetch(url, { headers });
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("text/html")) {
    return NextResponse.next();
  }

  const html = await response.text();
  const modifiedHtml = html.replace("</head>", `${GA_SNIPPET}</head>`);

  return new Response(modifiedHtml, {
    status: response.status,
    headers: response.headers,
  });
}

export const config = {
  // Only apply to page routes, skip API/admin/static/image routes
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico|images|videos|fonts|keystatic).*)"],
};
