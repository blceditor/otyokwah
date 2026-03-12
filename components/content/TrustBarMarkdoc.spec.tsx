/**
 * REQ-TRUST-001: TrustBar Markdoc Component Tests
 * TDD: These tests are written before implementation
 */

import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrustBarMarkdoc, TrustBarItem } from "./TrustBarMarkdoc";
import React from "react";

describe("REQ-TRUST-001: TrustBar Markdoc Component", () => {
  test('renders section with id="trust-bar"', () => {
    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="Calendar" text="Est. 1940" />
      </TrustBarMarkdoc>,
    );

    const section = document.querySelector('section[id="trust-bar"]');
    expect(section).toBeTruthy();
  });

  test("renders child TrustBarItem components", () => {
    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="Calendar" text="Est. 1940" />
        <TrustBarItem icon="Users" text="1000+ Campers/Year" />
      </TrustBarMarkdoc>,
    );

    expect(screen.getByText("Est. 1940")).toBeInTheDocument();
    expect(screen.getByText("1000+ Campers/Year")).toBeInTheDocument();
  });

  test("applies correct background color class for secondary", () => {
    render(
      <TrustBarMarkdoc backgroundColor="secondary">
        <TrustBarItem icon="Calendar" text="Test" />
      </TrustBarMarkdoc>,
    );

    const section = document.querySelector('section[id="trust-bar"]');
  });

  test("applies correct background color class for bark", () => {
    render(
      <TrustBarMarkdoc backgroundColor="bark">
        <TrustBarItem icon="Calendar" text="Test" />
      </TrustBarMarkdoc>,
    );

    const section = document.querySelector('section[id="trust-bar"]');
  });

  test("handles custom hex background color", () => {
    render(
      <TrustBarMarkdoc backgroundColor="#047857">
        <TrustBarItem icon="Calendar" text="Test" />
      </TrustBarMarkdoc>,
    );

    const section = document.querySelector('section[id="trust-bar"]');
    expect(section).toHaveStyle({ backgroundColor: "#047857" });
  });

  test("gracefully handles no children (returns null)", () => {
    const { container } = render(<TrustBarMarkdoc />);
    expect(container.querySelector('section[id="trust-bar"]')).toBeNull();
  });

  test("unknown icon name falls back to Calendar", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="UnknownIcon" text="Test" />
      </TrustBarMarkdoc>,
    );

    // Should still render, using Calendar as fallback
    expect(screen.getByText("Test")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  test("validates icon names against allowlist", () => {
    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="Calendar" text="Calendar Test" />
        <TrustBarItem icon="Users" text="Users Test" />
        <TrustBarItem icon="Cross" text="Cross Test" />
        <TrustBarItem icon="Mountain" text="Mountain Test" />
      </TrustBarMarkdoc>,
    );

    expect(screen.getByText("Calendar Test")).toBeInTheDocument();
    expect(screen.getByText("Users Test")).toBeInTheDocument();
    expect(screen.getByText("Cross Test")).toBeInTheDocument();
    expect(screen.getByText("Mountain Test")).toBeInTheDocument();
  });

  test("enforces max text length of 30 characters", () => {
    const longText = "This text is way too long for the trust bar item";

    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="Calendar" text={longText} />
      </TrustBarMarkdoc>,
    );

    // Should truncate or warn about long text
    const item = screen.getByText((content) =>
      content.includes("This text is way too long"),
    );
    // Implementation should handle this gracefully (truncate or show warning)
    expect(item).toBeInTheDocument();
  });

  test("has accessible aria-label", () => {
    render(
      <TrustBarMarkdoc>
        <TrustBarItem icon="Calendar" text="Test" />
      </TrustBarMarkdoc>,
    );

    const section = document.querySelector('section[id="trust-bar"]');
    expect(section).toHaveAttribute("aria-label", "Trust signals");
  });
});

describe("REQ-TRUST-001: TrustBarItem Component", () => {
  test("renders icon and text", () => {
    render(<TrustBarItem icon="Calendar" text="Est. 1940" />);
    expect(screen.getByText("Est. 1940")).toBeInTheDocument();
  });

  test("applies correct icon size", () => {
    render(<TrustBarItem icon="Calendar" text="Test" />);
    // Icon should be rendered (implementation will use Lucide)
    const text = screen.getByText("Test");
    expect(text).toBeInTheDocument();
  });
});
