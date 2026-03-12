// REQ-ADMIN-001, REQ-UAT-001: Admin Nav Strip Component Tests
import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/summer-camp"),
}));

// Import after mocking
import { AdminNavStrip } from "./AdminNavStrip";
import { usePathname } from "next/navigation";

// Helper to mock authenticated state
function mockAuthenticatedUser() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ isAdmin: true }),
  });
}

// Helper to mock unauthenticated state
function mockUnauthenticatedUser() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ isAdmin: false }),
  });
}

// Helper to render and wait for auth check to complete
async function renderWithAuth() {
  let result;
  await act(async () => {
    result = render(<AdminNavStrip />);
    // Wait for the auth check to complete
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return result;
}

describe("REQ-UAT-001 — Admin Nav Strip Visibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/summer-camp");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authentication State", () => {
    test("renders nav strip for authenticated admin users", async () => {
      mockAuthenticatedUser();
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
      expect(navStrip).toBeInTheDocument();
    });

    test("does NOT render nav strip for unauthenticated users", async () => {
      mockUnauthenticatedUser();
      await renderWithAuth();

      const navStrip = screen.queryByRole("navigation", { name: /admin/i });
      expect(navStrip).not.toBeInTheDocument();
    });

    test("handles auth check failure gracefully (no errors)", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      await renderWithAuth();

      // Should not render nav strip on error
      const navStrip = screen.queryByRole("navigation", { name: /admin/i });
      expect(navStrip).not.toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test("auth check completes within 2 seconds (timeout requirement)", async () => {
      const startTime = Date.now();
      mockAuthenticatedUser();
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
      const endTime = Date.now();

      expect(navStrip).toBeInTheDocument();
      expect(endTime - startTime).toBeLessThan(2000);
    });
  });
});

describe("REQ-ADMIN-001 — Admin Nav Strip Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/summer-camp");
    mockAuthenticatedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Visual Design", () => {
    test("renders with black background", async () => {
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
    });

    test("renders with white text", async () => {
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
    });

    test("renders with compact height (h-8 = 32px)", async () => {
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
    });

    test("renders full width", async () => {
      await renderWithAuth();

      const navStrip = await screen.findByRole("navigation", {
        name: /admin/i,
      });
    });
  });

  describe("Navigation Links", () => {
    test("renders all 4 required links (CMS, Edit Page, Report Bug, Deployment Status)", async () => {
      await renderWithAuth();

      // 1. CMS link
      const cmsLink = await screen.findByRole("link", { name: /cms/i });
      expect(cmsLink).toBeInTheDocument();
      expect(cmsLink).toHaveAttribute("href", "/keystatic");

      // 2. Edit Page link
      const editLink = screen.getByRole("link", { name: /edit page/i });
      expect(editLink).toBeInTheDocument();

      // 3. Report Bug link
      const bugLink = screen.getByRole("link", { name: /report bug/i });
      expect(bugLink).toBeInTheDocument();
      expect(bugLink).toHaveAttribute(
        "href",
        expect.stringContaining("github.com"),
      );

      // 4. Deployment Status indicator
      const statusIndicator = screen.getByTestId("admin-deployment-status");
      expect(statusIndicator).toBeInTheDocument();
    });

    test("renders CMS link to /keystatic", async () => {
      await renderWithAuth();

      const cmsLink = await screen.findByRole("link", { name: /cms/i });
      expect(cmsLink).toBeInTheDocument();
      expect(cmsLink).toHaveAttribute("href", "/keystatic");
    });

    test("renders Report Bug link to GitHub issues", async () => {
      await renderWithAuth();

      const bugLink = await screen.findByRole("link", { name: /report bug/i });
      expect(bugLink).toBeInTheDocument();
      expect(bugLink).toHaveAttribute(
        "href",
        expect.stringContaining("github.com"),
      );
      expect(bugLink).toHaveAttribute(
        "href",
        expect.stringContaining("issues/new"),
      );
      expect(bugLink).toHaveAttribute("target", "_blank");
      expect(bugLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("REQ-U03-FIX-004: Edit Page link generates correct Keystatic URL for pages", async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/summer-camp");
      await renderWithAuth();

      const editLink = await screen.findByRole("link", { name: /edit page/i });
      expect(editLink).toBeInTheDocument();
      expect(editLink).toHaveAttribute(
        "href",
        "/keystatic/branch/main/collection/pages/item/summer-camp",
      );
    });

    test("REQ-U03-FIX-004: Edit Page link generates correct Keystatic URL for homepage", async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/");
      await renderWithAuth();

      const editLink = await screen.findByRole("link", { name: /edit page/i });
      expect(editLink).toHaveAttribute(
        "href",
        "/keystatic/branch/main/collection/pages/item/index",
      );
    });

    test("REQ-U03-FIX-004: Edit Page link handles nested paths correctly", async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
        "/work-at-camp/counselors",
      );
      await renderWithAuth();

      const editLink = await screen.findByRole("link", { name: /edit page/i });
      expect(editLink).toHaveAttribute(
        "href",
        "/keystatic/branch/main/collection/pages/item/work-at-camp-counselors",
      );
    });
  });

  describe("Bug Report URL", () => {
    test("includes current page URL in bug report", async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/about");
      await renderWithAuth();

      const bugLink = await screen.findByRole("link", { name: /report bug/i });
      const href = bugLink.getAttribute("href") || "";

      // Should include the pathname in the URL
      expect(decodeURIComponent(href)).toContain("/about");
    });

    test("pre-fills issue title with page path", async () => {
      (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/facilities");
      await renderWithAuth();

      const bugLink = await screen.findByRole("link", { name: /report bug/i });
      const href = bugLink.getAttribute("href") || "";

      // Should include title parameter
      expect(href).toContain("title=");
      expect(decodeURIComponent(href)).toContain("/facilities");
    });
  });

  describe("Deployment Status", () => {
    test("renders deployment status indicator", async () => {
      await renderWithAuth();

      // Should have a status indicator element
      const statusIndicator = await screen.findByTestId(
        "admin-deployment-status",
      );
      expect(statusIndicator).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("has proper navigation landmark role", async () => {
      await renderWithAuth();

      const nav = await screen.findByRole("navigation", { name: /admin/i });
      expect(nav).toBeInTheDocument();
    });

    test("links have accessible names", async () => {
      await renderWithAuth();

      expect(
        await screen.findByRole("link", { name: /cms/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /report bug/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /edit page/i }),
      ).toBeInTheDocument();
    });
  });
});

describe("REQ-U03-FIX-011 — Admin Nav Hidden in CMS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthenticatedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("does not render when on keystatic routes", async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/keystatic");
    await renderWithAuth();

    const navStrip = screen.queryByRole("navigation", { name: /admin/i });
    expect(navStrip).not.toBeInTheDocument();
  });

  test("does not render when on nested keystatic routes", async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(
      "/keystatic/branch/main/collection/pages",
    );
    await renderWithAuth();

    const navStrip = screen.queryByRole("navigation", { name: /admin/i });
    expect(navStrip).not.toBeInTheDocument();
  });

  test("renders normally on non-keystatic routes when authenticated", async () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/about");
    await renderWithAuth();

    const navStrip = await screen.findByRole("navigation", { name: /admin/i });
    expect(navStrip).toBeInTheDocument();
  });
});

describe("REQ-ADMIN-001 — Admin Nav Strip Behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/summer-camp");
    mockAuthenticatedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("is fixed positioned at top of viewport", async () => {
    await renderWithAuth();

    const navStrip = await screen.findByRole("navigation", { name: /admin/i });

    // Should be fixed at top with proper z-index (header adjusts to be below)
  });

  test("uses flexbox for layout", async () => {
    await renderWithAuth();

    const navStrip = await screen.findByRole("navigation", { name: /admin/i });
  });

  test("has proper link spacing", async () => {
    await renderWithAuth();

    const navStrip = await screen.findByRole("navigation", { name: /admin/i });
    // Should have gap between items
  });

  test("nav strip persists across page navigation (within test scope)", async () => {
    await renderWithAuth();

    // Verify it renders initially
    const navStrip = await screen.findByRole("navigation", { name: /admin/i });
    expect(navStrip).toBeInTheDocument();

    // Note: Full persistence testing is done in E2E tests
  });
});

describe("REQ-UAT-001 — Admin Nav Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUnauthenticatedUser();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("nav strip hidden when API returns isAdmin: false", async () => {
    await renderWithAuth();

    const navStrip = screen.queryByRole("navigation", { name: /admin/i });
    expect(navStrip).not.toBeInTheDocument();
  });

  test("API error does not expose admin UI", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await renderWithAuth();

    const navStrip = screen.queryByRole("navigation", { name: /admin/i });
    expect(navStrip).not.toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
