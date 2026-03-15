/**
 * Contact form security event logging.
 *
 * Uses Vercel KV (Upstash Redis) when configured for persistent storage.
 * Falls back to in-memory when KV is not available.
 */

import { kvLpush, kvLrange, kvLtrim, kvLlen } from "@/lib/kv";

export interface SecurityEvent {
  timestamp: string;
  type:
    | "turnstile_fail"
    | "spam_domain"
    | "missing_fields"
    | "invalid_email"
    | "success"
    | "rate_limited"
    | "spam_content"
    | "bot_timing"
    | "plus_alias";
  email?: string;
  ip: string;
  detail?: string;
}

const KV_KEY = "contact:security-events";
const MAX_EVENTS = 500;

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    await kvLpush(KV_KEY, event);
    const len = await kvLlen(KV_KEY);
    if (len > MAX_EVENTS) {
      await kvLtrim(KV_KEY, 0, MAX_EVENTS - 1);
    }
    console.log(`[contact-security] ${JSON.stringify(event)}`);
  } catch {
    // Logging should never break the main flow
  }
}

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
  try {
    return await kvLrange<SecurityEvent>(KV_KEY, 0, -1);
  } catch {
    return [];
  }
}
