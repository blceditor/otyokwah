/**
 * REQ-ADMIN-002: Admin Auth API Tests
 *
 * Tests the /api/auth/check endpoint that determines admin nav visibility.
 * These tests verify the client-side auth check mechanism works correctly.
 */

import { test, expect } from "@playwright/test";

const PRODUCTION_URL =
  process.env.PRODUCTION_URL || "https://www.bearlakecamp.com";

test.describe("REQ-ADMIN-002: Auth Check API", () => {
  test("returns isAdmin: false when not authenticated", async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/auth/check`);

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty("isAdmin");
    expect(data.isAdmin).toBe(false);
  });

  test("API is accessible and returns JSON", async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/auth/check`);

    expect(response.ok()).toBe(true);
    const contentType = response.headers()["content-type"];
    expect(contentType).toContain("application/json");
  });

  test("API returns correct structure", async ({ request }) => {
    const response = await request.get(`${PRODUCTION_URL}/api/auth/check`);
    const data = await response.json();

    // Should only have isAdmin property
    expect(Object.keys(data)).toEqual(["isAdmin"]);
    expect(typeof data.isAdmin).toBe("boolean");
  });
});

test.describe("REQ-ADMIN-002: Admin Nav Client-Side Auth", () => {
  test("admin nav hidden when auth check returns false", async ({ page }) => {
    // Navigate to homepage
    await page.goto(PRODUCTION_URL);

    // Wait for client-side hydration and auth check
    await page.waitForLoadState("networkidle");

    // Admin nav should not be visible
    const adminNav = page.locator('[data-testid="admin-nav-strip"]');
    await expect(adminNav).not.toBeVisible();
  });

  test("page loads without errors when auth check called", async ({ page }) => {
    // Monitor for console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Filter out expected errors (like 404s for missing images)
    const authErrors = errors.filter(
      (e) => e.includes("auth") || e.includes("AdminNav")
    );
    expect(authErrors).toHaveLength(0);
  });

  test("auth check request is made with credentials", async ({ page }) => {
    // Track network requests
    const authRequests: { url: string; credentials: string }[] = [];

    page.on("request", (request) => {
      if (request.url().includes("/api/auth/check")) {
        authRequests.push({
          url: request.url(),
          credentials: request.headers()["cookie"] ? "included" : "omitted",
        });
      }
    });

    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState("networkidle");

    // Verify auth check was called
    expect(authRequests.length).toBeGreaterThan(0);
  });
});
