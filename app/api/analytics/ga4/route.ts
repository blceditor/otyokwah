import { NextResponse } from "next/server";
import { isConfigured } from "@/lib/google-analytics/auth";
import { getAnalyticsSummary, isPropertyConfigured } from "@/lib/google-analytics/client";
import { requireKeystatic } from "@/lib/keystatic/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireKeystatic();
  if (authError) return authError;

  if (!isConfigured() || !isPropertyConfigured()) {
    return NextResponse.json(
      { error: "Google Analytics not configured" },
      { status: 503 },
    );
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") ?? "7", 10);
  const validDays = [7, 30, 90].includes(days) ? days : 7;

  try {
    const data = await getAnalyticsSummary(validDays);
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch (err) {
    console.error("[GA4 API]", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 },
    );
  }
}
