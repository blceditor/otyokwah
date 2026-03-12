/**
 * Contact Form API Route
 * REQ-OP005: Server-side Turnstile validation and silent email handling
 */

import { NextRequest, NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email/send-contact-email";
import { isSpamDomain, extractEmailDomain } from "@/lib/email/spam-denylist";

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
    };
  }

  const formData = await request.formData();
  return {
    name: sanitizeInput((formData.get("name") as string) || "", true),
    email: sanitizeInput((formData.get("email") as string) || "", true),
    message: sanitizeInput((formData.get("message") as string) || ""),
    turnstileToken: (formData.get("turnstile-response") as string) || "",
  };
}

function validateSubmission(
  name: string,
  email: string,
  message: string,
  turnstileToken: string,
): { valid: boolean; error?: string } {
  if (!name || !email || !message || !turnstileToken) {
    return { valid: false, error: "Missing required fields" };
  }

  if (!isValidEmail(email)) {
    return { valid: false, error: "Invalid email address" };
  }

  return { valid: true };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { name, email, message, turnstileToken } =
      await parseFormData(request);

    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";

    const validation = validateSubmission(
      name,
      email,
      message,
      turnstileToken,
    );
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 },
      );
    }

    if (isSpamDomain(email)) {
      console.log("[contact] Spam domain rejected:", extractEmailDomain(email));
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, ip);
    if (!isCaptchaValid) {
      return NextResponse.json(
        { success: false, error: "Captcha verification failed" },
        { status: 400 },
      );
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
