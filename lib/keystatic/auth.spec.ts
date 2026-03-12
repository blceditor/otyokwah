import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

import { cookies } from "next/headers";
import {
  isKeystatiAuthenticated,
  getKeystatiAuthCookie,
  requireKeystatic,
} from "./auth";

describe("REQ-ADMIN-001 — Keystatic Authentication Detection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isKeystatiAuthenticated", () => {
    test("returns true when keystatic-gh-access-token cookie exists and token is valid", async () => {
      vi.spyOn(global, "fetch").mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ login: "user" }),
      } as Response);

      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "gho_valid_token_123" }),
      };

      const result = await isKeystatiAuthenticated(mockCookies as any);

      expect(result).toBe(true);
      expect(mockCookies.get).toHaveBeenCalledWith("keystatic-gh-access-token");
    });

    test("returns false when keystatic-gh-access-token cookie is missing", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue(undefined),
      };

      const result = await isKeystatiAuthenticated(mockCookies as any);

      expect(result).toBe(false);
    });

    test("returns false when cookie value is empty string", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "" }),
      };

      const result = await isKeystatiAuthenticated(mockCookies as any);

      expect(result).toBe(false);
    });

    test("returns false when cookie value is null", async () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: null }),
      };

      const result = await isKeystatiAuthenticated(mockCookies as any);

      expect(result).toBe(false);
    });
  });

  describe("getKeystatiAuthCookie", () => {
    test("returns the cookie value when present", () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue({ value: "gho_valid_token_123" }),
      };

      const result = getKeystatiAuthCookie(mockCookies as any);

      expect(result).toBe("gho_valid_token_123");
    });

    test("returns null when cookie is not present", () => {
      const mockCookies = {
        get: vi.fn().mockReturnValue(undefined),
      };

      const result = getKeystatiAuthCookie(mockCookies as any);

      expect(result).toBeNull();
    });
  });
});

describe("REQ-ADMIN-001 — requireKeystatic helper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns null when authenticated", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ login: "user" }),
    } as Response);

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "gho_valid_token_123" }),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await requireKeystatic();
    expect(result).toBeNull();
  });

  test("returns 401 NextResponse when not authenticated", async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await requireKeystatic();
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);

    const body = await result!.json();
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 401 when token validation fails", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: () => Promise.resolve({ message: "Bad credentials" }),
    } as Response);

    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: "gho_expired_token" }),
    };
    vi.mocked(cookies).mockResolvedValue(mockCookieStore as any);

    const result = await requireKeystatic();
    expect(result).not.toBeNull();
    expect(result!.status).toBe(401);
  });
});

describe("REQ-ADMIN-001 — Auth Detection Security", () => {
  test("does not expose sensitive token information", async () => {
    const mockCookies = {
      get: vi.fn().mockReturnValue({ value: "gho_secret_token" }),
    };

    const result = await isKeystatiAuthenticated(mockCookies as any);

    expect(typeof result).toBe("boolean");
    expect(result).not.toEqual("gho_secret_token");
  });
});
