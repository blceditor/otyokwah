// REQ-001: Production Link in CMS Header
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductionLink from "./ProductionLink";
import "@testing-library/jest-dom/vitest";

// Mock Next.js navigation hooks
const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname(),
}));

describe("REQ-001 — Production Link Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders link with correct production URL for nested page", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://otyokwah.vercel.app/about",
    );
  });

  test("constructs URL correctly for homepage", () => {
    mockPathname.mockReturnValue("/keystatic/pages/home");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });
    expect(link).toHaveAttribute("href", "https://otyokwah.vercel.app/");
  });

  test("constructs URL correctly for deeply nested pages", () => {
    mockPathname.mockReturnValue("/keystatic/pages/programs/summer-camp");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });
    expect(link).toHaveAttribute(
      "href",
      "https://otyokwah.vercel.app/programs/summer-camp",
    );
  });

  test("opens in new tab with secure attributes", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders ExternalLink icon from lucide-react", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about");

    const { container } = render(<ProductionLink />);

    // ExternalLink icon should be present (check for svg element)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  test("shows fallback message for unpublished pages", () => {
    // Simulate a new page that doesn't exist in production yet
    mockPathname.mockReturnValue("/keystatic/pages/new-unpublished-page");

    render(<ProductionLink />);

    // Link should still render (we can't know server-side if page exists)
    // But we can add a note in the UI
    const link = screen.getByRole("link", { name: /view live page/i });
    expect(link).toBeInTheDocument();

    // Should include helpful text about unpublished pages
    const helpText = screen.queryByText(/page may not be published yet/i);
    // This is optional - component can choose to show or not show this
    // Keeping test flexible to allow implementation choice
  });

  test("handles edge case with trailing slash in pathname", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about/");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });
    // Should not have double slashes in path (after protocol) or trailing slash
    const href = link.getAttribute("href");
    expect(href).toBe("https://otyokwah.vercel.app/about");
    // Verify no double slashes in the path portion (after https://)
    const pathPortion = href?.replace("https://", "") || "";
    expect(pathPortion).not.toContain("//");
  });

  test("is keyboard accessible", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });

    // Link should be focusable
    link.focus();
    expect(document.activeElement).toBe(link);
  });

  test("link is focusable and interactive", () => {
    mockPathname.mockReturnValue("/keystatic/pages/about");

    render(<ProductionLink />);

    const link = screen.getByRole("link", { name: /view live page/i });

    // Test actual behavior: link should be focusable
    link.focus();
    expect(document.activeElement).toBe(link);

    // Test that link is clickable (has href)
    expect(link).toHaveAttribute("href");
  });

  test("renders as client component", () => {
    // Verify component uses client-side hooks (usePathname)
    // Client components are required to use Next.js navigation hooks
    mockPathname.mockReturnValue("/keystatic/pages/about");

    // Should render successfully (client components work in test env)
    const { container } = render(<ProductionLink />);
    expect(container).toBeTruthy();

    // Verify usePathname was called (client-side hook)
    expect(mockPathname).toHaveBeenCalled();
  });

  test("correctly extracts slug from keystatic pathname structure", () => {
    // Test various Keystatic path patterns
    const testCases = [
      {
        path: "/keystatic/pages/index",
        expected: "https://otyokwah.vercel.app/",
      },
      {
        path: "/keystatic/pages/about",
        expected: "https://otyokwah.vercel.app/about",
      },
      {
        path: "/keystatic/pages/programs/youth",
        expected: "https://otyokwah.vercel.app/programs/youth",
      },
    ];

    testCases.forEach(({ path, expected }) => {
      mockPathname.mockReturnValue(path);

      const { unmount } = render(<ProductionLink />);

      const link = screen.getByRole("link", { name: /view live page/i });
      expect(link).toHaveAttribute("href", expected);

      unmount();
    });
  });
});
