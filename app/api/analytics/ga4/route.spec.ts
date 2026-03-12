import { describe, test, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

vi.mock("@/lib/keystatic/auth", () => ({
  requireKeystatic: vi.fn(),
}));

vi.mock("@/lib/google-analytics/auth", () => ({
  isConfigured: vi.fn(() => true),
}));

vi.mock("@/lib/google-analytics/client", () => ({
  isPropertyConfigured: vi.fn(() => true),
  getAnalyticsSummary: vi.fn(async () => ({ sessions: 100, pageViews: 200 })),
}));

import { requireKeystatic } from "@/lib/keystatic/auth";

describe("GA4 analytics route auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("returns 401 when not authenticated", async () => {
    vi.mocked(requireKeystatic).mockResolvedValue(
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/analytics/ga4?days=7");
    const response = await GET(request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe("Unauthorized");
  });

  test("returns 200 with data when authenticated", async () => {
    vi.mocked(requireKeystatic).mockResolvedValue(null);

    const { GET } = await import("./route");
    const request = new Request("http://localhost/api/analytics/ga4?days=7");
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty("sessions");
  });
});
