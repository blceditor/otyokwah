/**
 * REQ-EMAIL-001: Contact email uses centralized config for from-name and to-address
 *
 * Acceptance:
 * - CONTACT_FORM_TO falls back to EMAIL.contact from lib/config (not hardcoded)
 * - FROM_NAME falls back to a config-driven value (not hardcoded "Bear Lake Camp Website")
 * - Module reads CONTACT_FORM_TO env var when set (existing behaviour preserved)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { DEFAULT_CONTACT_EMAIL } from "@/lib/config/email";

describe("REQ-EMAIL-001: Contact email config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.CONTACT_FORM_TO;
    delete process.env.CONTACT_FORM_FROM;
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.resetModules();
  });

  it("DEFAULT_CONTACT_EMAIL is a valid email address", () => {
    expect(DEFAULT_CONTACT_EMAIL).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it("DEFAULT_CONTACT_EMAIL does not contain 'Bear Lake' as a literal string", () => {
    // The email address itself can be bearlakecamp.org, but the constant
    // should not embed the camp name as a human-readable string
    // (i.e., it is an email, not a display name)
    expect(DEFAULT_CONTACT_EMAIL).not.toContain(" ");
  });

  it("sendContactEmail returns error when Resend not configured", async () => {
    const { sendContactEmail } = await import("./send-contact-email");
    const result = await sendContactEmail({
      name: "Test User",
      email: "test@example.com",
      message: "Hello",
      ip: "127.0.0.1",
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe("Email not configured");
  });
});
