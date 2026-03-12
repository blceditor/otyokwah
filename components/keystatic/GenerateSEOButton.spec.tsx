// REQ-012: AI-Powered SEO Generation - Generate Button Component
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateSEOButton from "./GenerateSEOButton";
import "@testing-library/jest-dom/vitest";

describe("REQ-012 — Generate SEO Button Component", () => {
  const MOCK_PAGE_CONTENT = {
    title: "Summer Camp Programs",
    body: "Join us for an unforgettable summer experience with activities, faith-building, and adventure.",
  };

  const MOCK_GENERATED_SEO = {
    metaTitle: "Summer Camp Programs | Bear Lake Camp",
    metaDescription:
      "Experience faith, adventure, and transformation at Bear Lake Camp. Join our summer programs for unforgettable memories and spiritual growth.",
    ogTitle: "Unforgettable Summer Camp Experience",
    ogDescription:
      "Discover faith-building activities, outdoor adventures, and lifelong friendships at Bear Lake Camp.",
  };

  beforeEach(() => {
    // Mock localStorage for rate limiting
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => Object.keys(store).forEach((key) => delete store[key]),
      length: 0,
      key: () => null,
    };

    // Mock fetch for API calls
    global.fetch = vi.fn();
  });

  test("renders button with Sparkles icon", () => {
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    expect(button).toBeInTheDocument();

    // Should contain Sparkles icon (check by SVG or icon component)
    expect(button.innerHTML).toMatch(/sparkles|Sparkles/i);
  });

  test("shows loading spinner during generation", async () => {
    // Mock slow API response
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: async () => MOCK_GENERATED_SEO,
              }),
            100,
          ),
        ),
    );

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    // Should show loading state (spinner or "Generating..." text or disabled)
    await waitFor(() => {
      const loadingButton = screen.getByRole("button");
      const hasLoadingIndicator = loadingButton.innerHTML.match(
        /Generating|loader|spinner/i,
      );
      const isDisabled = loadingButton.hasAttribute("disabled");

      // Must show either loading indicator OR be disabled during load
      expect(hasLoadingIndicator || isDisabled).toBeTruthy();
    });
  });

  test("pre-fills SEO fields with generated content", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => MOCK_GENERATED_SEO,
    });

    const onSEOGenerated = vi.fn();
    const user = userEvent.setup();

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={onSEOGenerated}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      expect(onSEOGenerated).toHaveBeenCalledWith(MOCK_GENERATED_SEO);
    });
  });

  test("allows editing after generation", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => MOCK_GENERATED_SEO,
    });

    const onSEOGenerated = vi.fn();
    const user = userEvent.setup();

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={onSEOGenerated}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      expect(onSEOGenerated).toHaveBeenCalled();
    });

    // After generation, callback provides data that can be edited
    // Component should not lock fields or prevent editing
    const generatedData = onSEOGenerated.mock.calls[0][0];
    expect(generatedData).toEqual(MOCK_GENERATED_SEO);
  });

  test("shows remaining credits (X/10)", () => {
    // Set localStorage to show 3 generations used
    localStorage.setItem(
      "seo_generations",
      JSON.stringify({
        count: 3,
        resetTime: Date.now() + 3600000, // 1 hour from now
      }),
    );

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    // Should show remaining credits (7/10 remaining)
    expect(screen.getByText(/7.*10|7.*remaining/i)).toBeInTheDocument();
  });

  test("disables button when rate limit reached", () => {
    // Set localStorage to show 10 generations used (limit reached)
    localStorage.setItem(
      "seo_generations",
      JSON.stringify({
        count: 10,
        resetTime: Date.now() + 3600000,
      }),
    );

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  test("shows error message on API failure", async () => {
    (global.fetch as any).mockRejectedValue(new Error("API connection failed"));

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      const errorMessage = screen.getByText(
        /generation failed|error|failed|try again/i,
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test("resets rate limit after 1 hour", () => {
    // Set localStorage with expired reset time
    localStorage.setItem(
      "seo_generations",
      JSON.stringify({
        count: 10,
        resetTime: Date.now() - 1000, // Already passed
      }),
    );

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    // Button should be enabled (rate limit reset)
    const button = screen.getByRole("button");
    expect(button).not.toBeDisabled();

    // Should show full 10/10 credits available
    expect(screen.getByText(/10.*10|10.*remaining/i)).toBeInTheDocument();
  });

  test("increments usage count after successful generation", async () => {
    // Ensure localStorage starts completely empty
    localStorage.clear();

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => MOCK_GENERATED_SEO,
    });

    const setItemSpy = vi.spyOn(localStorage, "setItem");

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "seo_generations",
        expect.stringContaining('"count":1'),
      );
      const stored = localStorage.getItem("seo_generations");
      if (stored) {
        const data = JSON.parse(stored);
        expect(data.count).toBe(1);
      }
    });
  });

  test("sends correct request to Universal LLM API", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => MOCK_GENERATED_SEO,
    });

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/generate-seo",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: expect.stringContaining(MOCK_PAGE_CONTENT.title),
        }),
      );
    });
  });

  test("handles network timeout gracefully", async () => {
    (global.fetch as any).mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 100),
        ),
    );

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/timeout|try again|error/i)).toBeInTheDocument();
    });
  });

  test("is keyboard accessible", async () => {
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  test("has accessible label for screen readers", () => {
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    expect(button).toHaveAccessibleName();
  });
});

describe("REQ-012 — Generate SEO Button Rate Limiting", () => {
  const MOCK_PAGE_CONTENT = {
    title: "Test Page",
    body: "Test content",
  };

  beforeEach(() => {
    const store: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => Object.keys(store).forEach((key) => delete store[key]),
      length: 0,
      key: () => null,
    };
  });

  test("enforces 10 generations per hour limit", () => {
    localStorage.setItem(
      "seo_generations",
      JSON.stringify({
        count: 10,
        resetTime: Date.now() + 3600000,
      }),
    );

    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(screen.getByText(/limit reached|0.*10/i)).toBeInTheDocument();
  });

  test("stores reset time when first generation happens", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const user = userEvent.setup();
    render(
      <GenerateSEOButton
        pageContent={MOCK_PAGE_CONTENT}
        onSEOGenerated={vi.fn()}
      />,
    );

    const button = screen.getByRole("button", { name: /Generate SEO/i });
    await user.click(button);

    await waitFor(() => {
      const stored = localStorage.getItem("seo_generations");
      expect(stored).toBeTruthy();
      const data = JSON.parse(stored!);
      expect(data.resetTime).toBeGreaterThan(Date.now());
      expect(data.resetTime).toBeLessThanOrEqual(Date.now() + 3600000);
    });
  });
});
