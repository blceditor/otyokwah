import { NextRequest, NextResponse } from "next/server";
import { recordVital, getVitalsSummary, VITAL_METRICS } from "@/lib/vitals/store";
import { requireKeystatic } from "@/lib/keystatic/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, value } = body;
    if (typeof name !== "string" || typeof value !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    if (!VITAL_METRICS.includes(name as typeof VITAL_METRICS[number])) {
      return NextResponse.json({ error: "Unknown metric" }, { status: 400 });
    }
    await recordVital(name, value);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function GET() {
  const authError = await requireKeystatic();
  if (authError) return authError;
  const summary = await getVitalsSummary();
  return NextResponse.json(summary, {
    headers: { "Cache-Control": "no-cache, must-revalidate" },
  });
}
