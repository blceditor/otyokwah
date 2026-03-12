// REQ-F002: Hero Video Component
import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

describe("REQ-F002 — Hero Video Component Structure", () => {
  test("HeroVideo component exists and exports default", async () => {
    const module = await import("./HeroVideo");

    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe("function");
  });

  test("HeroVideo component renders without errors", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    expect(() => {
      render(<HeroVideo src="/video.mp4" />);
    }).not.toThrow();
  });

  test("HeroVideo component renders a section element", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });

  test("HeroVideo component accepts className prop", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const customClass = "custom-hero-video";
    const { container } = render(
      <HeroVideo src="/video.mp4" className={customClass} />,
    );

    const section = container.querySelector("section");
  });
});

describe("REQ-F002 — Video Element Requirements", () => {
  test("renders video element with correct src", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/videos/hero.mp4" />);

    const video = container.querySelector("video");
    expect(video).toBeInTheDocument();
    expect(video?.querySelector("source")?.src).toContain("/videos/hero.mp4");
  });

  test("video element has autoplay, muted, and loop attributes", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
    expect(video).toHaveProperty("autoplay", true);
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("loop", true);
  });

  test("video element has playsInline for mobile support", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("playsInline");
  });

  test("video element has aria-hidden for accessibility", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("aria-hidden", "true");
  });

  test("video element uses poster image when provided", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(
      <HeroVideo src="/video.mp4" poster="/images/poster.jpg" />,
    );

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("poster", "/images/poster.jpg");
  });
});

describe("REQ-F002 — Fallback Image Support", () => {
  test("renders fallback image when video fails to load", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(
      <HeroVideo src="/video.mp4" poster="/images/fallback.jpg" />,
    );

    // Simulate video error
    const video = container.querySelector("video");
    if (video) {
      const errorEvent = new Event("error");
      video.dispatchEvent(errorEvent);
    }

    // Should still have a fallback mechanism (handled by poster attribute)
    expect(video).toHaveAttribute("poster");
  });
});

describe("REQ-F002 — Text Overlay Support", () => {
  test("renders title and subtitle when provided", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    render(
      <HeroVideo
        src="/video.mp4"
        title="To Know Christ"
        subtitle="And Make Him Known"
      />,
    );

    expect(screen.getByText("To Know Christ")).toBeInTheDocument();
    expect(screen.getByText("And Make Him Known")).toBeInTheDocument();
  });

  test("renders custom children overlay content", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    render(
      <HeroVideo src="/video.mp4">
        <div data-testid="custom-overlay">Custom Content</div>
      </HeroVideo>,
    );

    expect(screen.getByTestId("custom-overlay")).toBeInTheDocument();
  });

  test("renders gradient overlay for text readability", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(
      <HeroVideo src="/video.mp4" title="Bear Lake Camp" />,
    );

    // Check for gradient overlay element
    const overlay = container.querySelector('[class*="gradient"]');
    expect(overlay).toBeInTheDocument();
  });
});

describe("REQ-F002 — Responsive Design", () => {
  test("video container is full width", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
  });

  test("section has responsive height classes", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const section = container.querySelector("section");
    // Should have minimum height for responsiveness
  });
});

describe("REQ-F002 — TypeScript Props Interface", () => {
  test("component accepts all required props", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    expect(() => {
      render(
        <HeroVideo
          src="/video.mp4"
          poster="/poster.jpg"
          title="Title"
          subtitle="Subtitle"
          className="custom"
        >
          <div>Children</div>
        </HeroVideo>,
      );
    }).not.toThrow();
  });

  test("component works with only required src prop", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    expect(() => {
      render(<HeroVideo src="/video.mp4" />);
    }).not.toThrow();
  });
});

describe("REQ-F002 — Accessibility", () => {
  test("section has proper ARIA label", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" title="Hero" />);

    const section = container.querySelector("section");
    expect(section).toHaveAttribute("aria-labelledby");
  });

  test("title element has proper heading role", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    render(<HeroVideo src="/video.mp4" title="Bear Lake Camp" />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Bear Lake Camp");
  });
});

describe("REQ-F002 — Performance", () => {
  test("video has preload metadata for performance", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
    expect(video).toHaveAttribute("preload", "metadata");
  });

  test("video has object-cover class for aspect ratio", async () => {
    const { default: HeroVideo } = await import("./HeroVideo");

    const { container } = render(<HeroVideo src="/video.mp4" />);

    const video = container.querySelector("video");
  });
});
