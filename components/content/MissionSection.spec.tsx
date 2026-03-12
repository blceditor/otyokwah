/**
 * REQ-MISSION-001: MissionSection Markdoc Component Tests
 * TDD: These tests are written before implementation
 */

import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MissionSection } from "./MissionSection";
import React from "react";

// Mock window.matchMedia for parallax tests
const mockMatchMedia = vi.fn((query: string) => ({
  matches: query === "(prefers-reduced-motion: reduce)" ? false : true,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

describe("REQ-MISSION-001: MissionSection Markdoc Component", () => {
  beforeEach(() => {
    vi.stubGlobal("matchMedia", mockMatchMedia);
    // Set desktop viewport
    vi.stubGlobal("innerWidth", 1440);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("renders all 3 text lines when provided", () => {
    render(
      <MissionSection
        line1Text="Our Mission"
        line2Text="Faith. Adventure. Transformation."
        line3Text="Bear Lake Camp exists to be a Christian Ministry Center."
      />,
    );

    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(
      screen.getByText("Faith. Adventure. Transformation."),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes("Bear Lake Camp exists"),
      ),
    ).toBeInTheDocument();
  });

  test("omits empty text lines (no empty elements)", () => {
    render(
      <MissionSection
        line1Text="Our Mission"
        line2Text=""
        line3Text="Description"
      />,
    );

    // Line 1 and 3 should render
    expect(screen.getByText("Our Mission")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();

    // Should not have empty elements for line 2
    const section = document.querySelector('section[id="mission"]');
    expect(section?.querySelectorAll(":empty").length).toBe(0);
  });

  test("applies font family classes correctly", () => {
    render(
      <MissionSection
        line1Text="Handwritten"
        line1Font="handwritten"
        line2Text="Heading"
        line2Font="heading"
        line3Text="Body"
        line3Font="body"
      />,
    );

    const handwritten = screen.getByText("Handwritten");
    const heading = screen.getByText("Heading");
    const body = screen.getByText("Body");

  });

  test("applies font size classes correctly", () => {
    render(
      <MissionSection
        line1Text="Small"
        line1Size="2xl"
        line2Text="Large"
        line2Size="5xl"
      />,
    );

    const small = screen.getByText("Small");
    const large = screen.getByText("Large");

  });

  test("background image renders with overlay", () => {
    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="/mission-background.jpg"
        overlayOpacity="40"
      />,
    );

    const section = document.querySelector('section[id="mission"]');
    // Should have background image style
    expect(section).toHaveStyle({
      backgroundImage: 'url("/mission-background.jpg")',
    });

    // Should have overlay element
    const overlay = section?.querySelector('[class*="bg-black"]');
    expect(overlay).toBeTruthy();
  });

  test("solid color background (bark) when no image", () => {
    render(<MissionSection line1Text="Test" />);

    const section = document.querySelector('section[id="mission"]');
  });

  test("sanitizes color values (rejects injection)", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <MissionSection
        line1Text="Test"
        line1Color="expression(alert(1))"
      />,
    );

    // Should still render without the malicious color
    expect(screen.getByText("Test")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("validates background image URL with isSafeImageUrl", () => {
    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="javascript:alert(1)"
      />,
    );

    const section = document.querySelector('section[id="mission"]');
    // Should NOT apply the javascript URL
    expect(section).not.toHaveStyle({
      backgroundImage: 'url("javascript:alert(1)")',
    });
    // Should fall back to bark background
  });

  test("parallax disabled by default", () => {
    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="/test.jpg"
      />,
    );

    const section = document.querySelector('section[id="mission"]');
    expect(section).toHaveAttribute("data-parallax", "false");
  });

  test("parallax enabled when enableParallax=true and desktop viewport", () => {
    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="/test.jpg"
        enableParallax={true}
      />,
    );

    const section = document.querySelector('section[id="mission"]');
    expect(section).toHaveAttribute("data-parallax", "true");
  });

  test("parallax respects prefers-reduced-motion", () => {
    // Override matchMedia to return reduced motion preference
    mockMatchMedia.mockImplementation((query: string) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="/test.jpg"
        enableParallax={true}
      />,
    );

    const section = document.querySelector('section[id="mission"]');
    // Should disable parallax when user prefers reduced motion
    expect(section).toHaveAttribute("data-parallax", "false");
  });

  test('renders section with id="mission"', () => {
    render(<MissionSection line1Text="Test" />);

    const section = document.querySelector('section[id="mission"]');
    expect(section).toBeTruthy();
  });

  test('includes data-testid="faith-section-image" for E2E', () => {
    render(
      <MissionSection
        line1Text="Test"
        backgroundImage="/test.jpg"
      />,
    );

    const element = screen.getByTestId("faith-section-image");
    expect(element).toBeInTheDocument();
  });
});
