import { NextResponse } from "next/server";
import { getSecurityEvents } from "@/lib/email/security-log";
import { requireKeystatic } from "@/lib/keystatic/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authError = await requireKeystatic();
  if (authError) return authError;

  const events = await getSecurityEvents();

  const counts = {
    turnstile_fail: 0,
    spam_domain: 0,
    missing_fields: 0,
    invalid_email: 0,
    success: 0,
    rate_limited: 0,
    spam_content: 0,
    bot_timing: 0,
    plus_alias: 0,
  };

  for (const event of events) {
    if (counts[event.type] !== undefined) counts[event.type]++;
  }

  return NextResponse.json({
    totalEvents: events.length,
    counts,
    recentEvents: events.slice(-20).reverse(),
  });
}
