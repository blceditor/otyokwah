/**
 * REQ-202: Public search index endpoint
 * Returns page titles, slugs, and descriptions for client-side search.
 * Cached via ISR — regenerates hourly.
 */
import { NextResponse } from "next/server";
import { getReader } from "@/lib/keystatic-reader";

export const revalidate = 3600;

export async function GET() {
  try {
    const reader = getReader();
    const pages = await reader.collections.pages.all();

    const index = pages.map((page) => ({
      slug: page.slug === "index" ? "/" : `/${page.slug}`,
      title: page.entry.title || page.slug,
      description: page.entry.seo?.metaDescription || "",
    }));

    return NextResponse.json(index, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
