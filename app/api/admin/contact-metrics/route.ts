import { NextResponse } from "next/server";
import { requireKeystatic } from "@/lib/keystatic/auth";

export const dynamic = "force-dynamic";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";

interface ResendEmail {
  id: string;
  to: string[];
  from: string;
  subject: string;
  created_at: string;
  last_event: string;
}

export async function GET() {
  const authError = await requireKeystatic();
  if (authError) return authError;

  if (!RESEND_API_KEY) {
    return NextResponse.json({ error: "Resend not configured" }, { status: 503 });
  }

  try {
    // Use raw API instead of SDK — SDK was returning fewer results on Vercel
    const res = await fetch("https://api.resend.com/emails?limit=100", {
      headers: { Authorization: `Bearer ${RESEND_API_KEY}` },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Resend API: ${res.status}` }, { status: 500 });
    }

    const body = await res.json();
    const emails: ResendEmail[] = body.data || [];

    // Compute daily counts
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const todayEmails = emails.filter(
      (e) => new Date(e.created_at) >= todayStart
    );

    const last7Days = emails.filter(
      (e) => new Date(e.created_at) >= sevenDaysAgo
    );

    // Group by day for the chart
    const dailyCounts: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(todayStart.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split("T")[0];
      dailyCounts[key] = 0;
    }
    for (const email of last7Days) {
      const key = new Date(email.created_at).toISOString().split("T")[0];
      if (dailyCounts[key] !== undefined) dailyCounts[key]++;
    }

    const response = NextResponse.json({
      totalEmails: emails.length,
      totalLast7Days: last7Days.length,
      sentToday: todayEmails.length,
      dailyCounts,
      recentEmails: emails.slice(0, 20).map((e) => ({
        id: e.id,
        to: e.to,
        subject: e.subject,
        createdAt: e.created_at,
        lastEvent: e.last_event,
      })),
      limits: {
        dailyLimit: 100,
        monthlyLimit: 3000,
      },
    });
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
