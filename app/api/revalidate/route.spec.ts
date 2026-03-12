import { describe, test, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => null),
  })),
}));

vi.mock("@/lib/keystatic/auth", () => ({
  isKeystatiAuthenticated: vi.fn(async () => false),
}));

describe("REQ-SEC-002 -- Revalidation route timing-safe secret", () => {
  const REAL_SECRET = "test-revalidation-secret-value";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("REVALIDATE_SECRET", REAL_SECRET);
  });

  test("returns 401 with wrong secret", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "x-revalidate-secret": "wrong-secret-value-here",
        "content-type": "application/json",
      },
      body: JSON.stringify({ type: "all" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  test("returns 200 with correct secret", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "x-revalidate-secret": REAL_SECRET,
        "content-type": "application/json",
      },
      body: JSON.stringify({ type: "all" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.revalidated).toBe(true);
  });

  test("returns 401 with no secret and no session", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ type: "all" }),
    });

    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });

  test("rejects different-length secret (timing-safe length guard)", async () => {
    const { POST } = await import("./route");
    const request = new Request("http://localhost/api/revalidate", {
      method: "POST",
      headers: {
        "x-revalidate-secret": "short",
        "content-type": "application/json",
      },
      body: JSON.stringify({ type: "all" }),
    });
    const response = await POST(request as never);
    expect(response.status).toBe(401);
  });
});
