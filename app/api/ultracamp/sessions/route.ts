import { NextResponse } from "next/server";
import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";

export const revalidate = 300; // 5 minute cache

export async function GET() {
  const sessions = await fetchUltraCampSessions();
  return NextResponse.json(sessions, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
    },
  });
}
