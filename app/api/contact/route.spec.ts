import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/email/send-contact-email", () => ({
  sendContactEmail: vi.fn(async () => ({ success: true })),
}));

const TURNSTILE_SECRET = "test-turnstile-secret";

describe("REQ-SEC-003 -- Contact form newline sanitization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("TURNSTILE_SECRET_KEY", TURNSTILE_SECRET);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ success: true }) })),
    );
  });

  function makeFormRequest(fields: Record<string, string>): NextRequest {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(fields)) {
      params.set(key, value);
    }
    return new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "x-forwarded-for": "127.0.0.1",
      },
      body: params.toString(),
    });
  }

  test("strips \\r and \\n from name field", async () => {
    const { sendContactEmail } = await import(
      "@/lib/email/send-contact-email"
    );
    const { POST } = await import("./route");

    const request = makeFormRequest({
      name: "John\r\nDoe",
      email: "john@example.com",
      message: "Hello there",
      "turnstile-response": "valid-token",
    });

    await POST(request);

    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "John  Doe",
      }),
    );
  });

  test("strips newlines from email preventing header injection", async () => {
    const { sendContactEmail } = await import(
      "@/lib/email/send-contact-email"
    );
    const { POST } = await import("./route");

    const request = makeFormRequest({
      name: "Test User",
      email: "evil@example.com\r\nBcc: attacker@evil.com",
      message: "Hello",
      "turnstile-response": "valid-token",
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("Invalid email");
    expect(sendContactEmail).not.toHaveBeenCalled();
  });

  test("preserves newlines in message field", async () => {
    const { sendContactEmail } = await import(
      "@/lib/email/send-contact-email"
    );
    const { POST } = await import("./route");

    const request = makeFormRequest({
      name: "John Doe",
      email: "john@example.com",
      message: "Line 1\nLine 2\r\nLine 3",
      "turnstile-response": "valid-token",
    });

    await POST(request);

    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Line 1\nLine 2\r\nLine 3",
      }),
    );
  });
});
