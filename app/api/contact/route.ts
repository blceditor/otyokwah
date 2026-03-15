/**
 * Contact Form API Route
 * REQ-OP005: Server-side Turnstile validation and silent email handling
 */

import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email/send-contact-email";
import {
  isSpamDomain,
  extractEmailDomain,
  hasPlusAlias,
} from "@/lib/email/spam-denylist";
import { logSecurityEvent, getSecurityEvents } from "@/lib/email/security-log";
import { isRateLimited } from "@/lib/email/rate-limiter";
import { requireKeystatic } from "@/lib/keystatic/auth";

// ---------------------------------------------------------------------------
// Content-based spam scorer
// ---------------------------------------------------------------------------
function getSpamScore(
  name: string,
  _email: string,
  message: string,
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // Excessive URLs
  const urlCount = (message.match(/https?:\/\//gi) || []).length;
  if (urlCount >= 3) {
    score += 40;
    reasons.push(`${urlCount} URLs`);
  } else if (urlCount >= 1) {
    score += 10;
    reasons.push(`${urlCount} URL(s)`);
  }

  // All-caps message (>50 % uppercase, at least 20 chars)
  if (message.length > 20) {
    const nonSpace = message.replace(/\s/g, "");
    if (nonSpace.length > 0) {
      const upperRatio =
        message.replace(/[^A-Z]/g, "").length / nonSpace.length;
      if (upperRatio > 0.5) {
        score += 30;
        reasons.push("excessive caps");
      }
    }
  }

  // Common spam phrases
  const spamPhrases = [
    /\bcrypto\b/i,
    /\bbitcoin\b/i,
    /\bSEO\b/,
    /\bbacklink/i,
    /\bcasino\b/i,
    /\bviagra\b/i,
    /\bloan\b/i,
    /\binvestment opportunity\b/i,
    /\bmake money\b/i,
    /\bwork from home\b/i,
    /\bclick here\b/i,
    /\bfree money\b/i,
    /\bprince\b/i,
    /\blottery\b/i,
    /\bwinner\b/i,
    /\bcongratulations\b/i,
    /\burgent\b/i,
  ];
  for (const phrase of spamPhrases) {
    if (phrase.test(message) || phrase.test(name)) {
      score += 20;
      reasons.push(`spam phrase: ${phrase.source}`);
      break;
    }
  }

  // Suspicious name patterns
  if (name.length <= 1) {
    score += 30;
    reasons.push("single-char name");
  }
  if (/^\d+$/.test(name)) {
    score += 40;
    reasons.push("numeric name");
  }

  // Very short message
  if (message.length < 10) {
    score += 20;
    reasons.push("very short message");
  }

  return { score, reasons };
}

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}

async function verifyTurnstileToken(
  token: string,
  ip: string,
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append("secret", TURNSTILE_SECRET_KEY);
    formData.append("response", token);
    formData.append("remoteip", ip);

    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: formData,
    });

    const data: TurnstileResponse = await response.json();
    return data.success;
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input: string, stripNewlines = false): string {
  let result = input.replace(/[<>]/g, "").trim();
  if (stripNewlines) {
    result = result.replace(/[\r\n]/g, " ");
  }
  return result.slice(0, 1000);
}

async function parseFormData(request: NextRequest): Promise<{
  name: string;
  email: string;
  message: string;
  turnstileToken: string;
  honeypot: string;
  timing: number;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const body = await request.text();
    const params = new URLSearchParams(body);
    return {
      name: sanitizeInput(params.get("name") || "", true),
      email: sanitizeInput(params.get("email") || "", true),
      message: sanitizeInput(params.get("message") || ""),
      turnstileToken: params.get("turnstile-response") || "",
      honeypot: params.get("website") || "",
      timing: parseInt(params.get("_timing") || "0", 10),
    };
  }

  const formData = await request.formData();
  return {
    name: sanitizeInput((formData.get("name") as string) || "", true),
    email: sanitizeInput((formData.get("email") as string) || "", true),
    message: sanitizeInput((formData.get("message") as string) || ""),
    turnstileToken: (formData.get("turnstile-response") as string) || "",
    honeypot: (formData.get("website") as string) || "",
    timing: parseInt((formData.get("_timing") as string) || "0", 10),
  };
}

function validateSubmission(
  name: string,
  email: string,
  message: string,
  turnstileToken: string,
): {
  valid: boolean;
  error?: string;
  type?: "missing_fields" | "invalid_email";
} {
  if (!name || !email || !message || !turnstileToken) {
    return { valid: false, error: "Missing required fields", type: "missing_fields" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email address", type: "invalid_email" };
  }

  return { valid: true };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, message, turnstileToken, honeypot, timing } =
      await parseFormData(request);

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate limiting
    if (isRateLimited(ip)) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "rate_limited",
        ip,
      });
      return NextResponse.json(
        { success: false, error: "Too many requests" },
        { status: 429 },
      );
    }

    // Honeypot check — bots fill hidden fields, humans don't
    if (honeypot) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Server-side timing check — submissions under 2s are almost certainly bots
    if (timing > 0 && timing < 2000) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "bot_timing",
        ip,
        detail: `${timing}ms`,
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const validation = validateSubmission(
      name,
      email,
      message,
      turnstileToken,
    );
    if (!validation.valid) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: validation.type ?? "missing_fields",
        email: email || undefined,
        ip,
        detail: validation.error,
      });
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    if (isSpamDomain(email)) {
      console.log("[contact] Spam domain rejected:", extractEmailDomain(email));
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "spam_domain",
        email,
        ip,
        detail: extractEmailDomain(email),
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Block + aliases (e.g. user+tag@gmail.com) — silently reject
    if (hasPlusAlias(email)) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "plus_alias",
        email,
        ip,
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!isCaptchaValid) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "turnstile_fail",
        email,
        ip,
      });
      return NextResponse.json(
        { success: false, error: "Captcha verification failed" },
        { status: 400 },
      );
    }

    // Content-based spam scoring (runs after Turnstile to avoid unnecessary work on bots)
    const spamCheck = getSpamScore(name, email, message);
    if (spamCheck.score >= 50) {
      await logSecurityEvent({
        timestamp: new Date().toISOString(),
        type: "spam_content",
        email,
        ip,
        detail: spamCheck.reasons.join(", "),
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const emailResult = await sendContactEmail({
      name,
      email,
      message,
      ip,
      timestamp: new Date().toISOString(),
    });

    if (!emailResult.success) {
      console.error("[contact] Email send failed:", emailResult.error);
      return NextResponse.json(
        { success: false, error: "Failed to send email" },
        { status: 500 },
      );
    }

    await logSecurityEvent({
      timestamp: new Date().toISOString(),
      type: "success",
      email,
      ip,
    });

    return NextResponse.json(
      { success: true, message: "Form submitted successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}

export async function GET(): Promise<NextResponse> {
  const authError = await requireKeystatic();
  if (authError) return authError;

  const { isKvConfigured } = await import("@/lib/kv");
  const events = await getSecurityEvents();

  const counts: Record<string, number> = {
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

  const response = NextResponse.json({
    totalEvents: events.length,
    counts,
    recentEvents: events.slice(0, 20),
    storage: isKvConfigured() ? "persistent" : "in-memory",
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
