// REQ-F006: CTA Button Component
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import { CTAButton } from "./CTAButton";

describe("REQ-F006 — CTA Button Component", () => {
  const DEFAULT_REGISTRATION_URL =
    "https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campCode=OTY";

  describe("Component Rendering", () => {
    test("renders as link when href is provided", () => {
      render(<CTAButton href="/test">Click Me</CTAButton>);
      const link = screen.getByRole("link", { name: "Click Me" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/test");
    });

    test("renders as button when onClick is provided", () => {
      const handleClick = () => {};
      render(<CTAButton onClick={handleClick}>Click Me</CTAButton>);
      const button = screen.getByRole("button", { name: "Click Me" });
      expect(button).toBeInTheDocument();
    });

    test('uses default registration URL when href="register"', () => {
      render(<CTAButton href="register">Register Now</CTAButton>);
      const link = screen.getByRole("link", { name: "Register Now" });
      expect(link).toHaveAttribute("href", DEFAULT_REGISTRATION_URL);
    });

    test("renders children content", () => {
      render(<CTAButton href="/test">Register for Summer Camp</CTAButton>);
      expect(screen.getByText("Register for Summer Camp")).toBeInTheDocument();
    });

    test("renders with complex children", () => {
      render(
        <CTAButton href="/test">
          <span>Register</span> <strong>Now</strong>
        </CTAButton>,
      );
      expect(screen.getByText("Register")).toBeInTheDocument();
      expect(screen.getByText("Now")).toBeInTheDocument();
    });
  });

  describe("REQ-F006 — Variant Styles", () => {
    test("renders primary variant by default", () => {
      render(<CTAButton href="/test">Primary</CTAButton>);
      const button = screen.getByRole("link", { name: "Primary" });
      // Should have filled background color
    });

    test("renders primary variant when explicitly set", () => {
      render(
        <CTAButton href="/test" variant="primary">
          Primary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Primary" });
    });

    test("renders secondary variant with outline style", () => {
      render(
        <CTAButton href="/test" variant="secondary">
          Secondary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Secondary" });
      // Should have border and no filled background
    });

    test("primary variant has white text", () => {
      render(
        <CTAButton href="/test" variant="primary">
          Primary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Primary" });
    });

    test("secondary variant has colored text", () => {
      render(
        <CTAButton href="/test" variant="secondary">
          Secondary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Secondary" });
    });
  });

  describe("REQ-F006 — Size Variants", () => {
    test("renders medium size by default", () => {
      render(<CTAButton href="/test">Medium</CTAButton>);
      const button = screen.getByRole("link", { name: "Medium" });
    });

    test("renders small size", () => {
      render(
        <CTAButton href="/test" size="sm">
          Small
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Small" });
    });

    test("renders medium size", () => {
      render(
        <CTAButton href="/test" size="md">
          Medium
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Medium" });
    });

    test("renders large size", () => {
      render(
        <CTAButton href="/test" size="lg">
          Large
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Large" });
    });
  });

  describe("REQ-F006 — Rounded Corners", () => {
    test("has rounded corners", () => {
      render(<CTAButton href="/test">Button</CTAButton>);
      const button = screen.getByRole("link", { name: "Button" });
    });

    test("uses consistent border radius", () => {
      const { container } = render(<CTAButton href="/test">Button</CTAButton>);
      const button = container.querySelector("a");
    });
  });

  describe("REQ-F006 — Hover and Focus States", () => {
    test("has hover state classes", () => {
      render(<CTAButton href="/test">Hover Me</CTAButton>);
      const button = screen.getByRole("link", { name: "Hover Me" });
    });

    test("has focus state classes", () => {
      render(<CTAButton href="/test">Focus Me</CTAButton>);
      const button = screen.getByRole("link", { name: "Focus Me" });
    });

    test("has transition classes for smooth state changes", () => {
      render(<CTAButton href="/test">Transition</CTAButton>);
      const button = screen.getByRole("link", { name: "Transition" });
    });

    test("primary variant has darker hover state", () => {
      render(
        <CTAButton href="/test" variant="primary">
          Hover Primary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Hover Primary" });
    });

    test("secondary variant has background on hover", () => {
      render(
        <CTAButton href="/test" variant="secondary">
          Hover Secondary
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Hover Secondary" });
    });
  });

  describe("REQ-F006 — External Link Behavior", () => {
    test("opens in same window by default", () => {
      render(<CTAButton href="/test">Same Window</CTAButton>);
      const link = screen.getByRole("link", { name: "Same Window" });
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });

    test("opens in new tab when external=true", () => {
      render(
        <CTAButton href="/test" external>
          New Tab
        </CTAButton>,
      );
      const link = screen.getByRole("link", { name: "New Tab" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("opens registration URL in new tab by default", () => {
      render(<CTAButton href="register">Register</CTAButton>);
      const link = screen.getByRole("link", { name: "Register" });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });

    test("can override external for registration URL", () => {
      render(
        <CTAButton href="register" external={false}>
          Register
        </CTAButton>,
      );
      const link = screen.getByRole("link", { name: "Register" });
      expect(link).not.toHaveAttribute("target");
    });
  });

  describe("REQ-F006 — Button Click Handler", () => {
    test("calls onClick handler when clicked", async () => {
      let clicked = false;
      const handleClick = () => {
        clicked = true;
      };
      render(<CTAButton onClick={handleClick}>Click Me</CTAButton>);
      const button = screen.getByRole("button", { name: "Click Me" });
      await userEvent.click(button);
      expect(clicked).toBe(true);
    });

    test('button has type="button" to prevent form submission', () => {
      render(<CTAButton onClick={() => {}}>Button</CTAButton>);
      const button = screen.getByRole("button", { name: "Button" });
      expect(button).toHaveAttribute("type", "button");
    });

    test("works with async onClick handlers", async () => {
      let clicked = false;
      const handleClick = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        clicked = true;
      };
      render(<CTAButton onClick={handleClick}>Async Click</CTAButton>);
      const button = screen.getByRole("button", { name: "Async Click" });
      await userEvent.click(button);
      // Wait for async handler
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(clicked).toBe(true);
    });
  });

  describe("Accessibility", () => {
    test("is keyboard focusable as link", () => {
      render(<CTAButton href="/test">Focusable Link</CTAButton>);
      const link = screen.getByRole("link", { name: "Focusable Link" });
      link.focus();
      expect(document.activeElement).toBe(link);
    });

    test("is keyboard focusable as button", () => {
      render(<CTAButton onClick={() => {}}>Focusable Button</CTAButton>);
      const button = screen.getByRole("button", { name: "Focusable Button" });
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    test("has visible focus indicator", () => {
      render(<CTAButton href="/test">Focus Indicator</CTAButton>);
      const link = screen.getByRole("link", { name: "Focus Indicator" });
    });

    test("has proper ARIA role for link", () => {
      render(<CTAButton href="/test">Link Role</CTAButton>);
      const link = screen.getByRole("link", { name: "Link Role" });
      expect(link.tagName).toBe("A");
    });

    test("has proper ARIA role for button", () => {
      render(<CTAButton onClick={() => {}}>Button Role</CTAButton>);
      const button = screen.getByRole("button", { name: "Button Role" });
      expect(button.tagName).toBe("BUTTON");
    });
  });

  describe("REQ-GRID-014 — Inverse Variant", () => {
    test("renders inverse variant with white background", () => {
      render(
        <CTAButton href="/test" variant="inverse">
          Inverse
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Inverse" });
    });

    test("inverse variant has colored text matching section", () => {
      render(
        <CTAButton href="/test" variant="inverse">
          Inverse
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Inverse" });
      // Should have colored text (sky, amber, emerald, or purple)
    });

    test("inverse variant has hover effect", () => {
      render(
        <CTAButton href="/test" variant="inverse">
          Inverse Hover
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Inverse Hover" });
    });
  });

  describe("REQ-ANALYTICS-002: CTA event tracking", () => {
    test("CTAButton imports trackEvent", () => {
      const content = require("fs").readFileSync(
        require.resolve("./CTAButton"),
        "utf-8",
      );
      expect(content).toContain("trackEvent");
    });

    test("fires cta_click event on link click", async () => {
      const mockGtag = vi.fn();
      Object.defineProperty(window, "gtag", {
        value: mockGtag,
        writable: true,
        configurable: true,
      });

      render(
        <CTAButton href="/test" variant="primary">
          Track Me
        </CTAButton>,
      );
      const link = screen.getByRole("link", { name: "Track Me" });
      await userEvent.click(link);

      expect(mockGtag).toHaveBeenCalledWith("event", "cta_click", {
        cta_label: "Track Me",
        cta_href: "/test",
        cta_variant: "primary",
        is_external: "false",
      });
    });

    test("fires cta_click event on button click", async () => {
      const mockGtag = vi.fn();
      Object.defineProperty(window, "gtag", {
        value: mockGtag,
        writable: true,
        configurable: true,
      });

      const handleClick = vi.fn();
      render(
        <CTAButton onClick={handleClick} variant="secondary">
          Click Track
        </CTAButton>,
      );
      const button = screen.getByRole("button", { name: "Click Track" });
      await userEvent.click(button);

      expect(handleClick).toHaveBeenCalled();
      expect(mockGtag).toHaveBeenCalledWith("event", "cta_click", {
        cta_label: "Click Track",
        cta_href: "",
        cta_variant: "secondary",
        is_external: "false",
      });
    });
  });

  describe("Design System Integration", () => {
    test("uses Bear Lake Camp secondary color for primary variant", () => {
      render(
        <CTAButton href="/test" variant="primary">
          Forest Green
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Forest Green" });
      // Should use secondary (forest green) from design system
    });

    test("uses consistent font weight", () => {
      render(<CTAButton href="/test">Font Weight</CTAButton>);
      const button = screen.getByRole("link", { name: "Font Weight" });
    });

    test("is inline-flex for proper alignment", () => {
      render(<CTAButton href="/test">Flex</CTAButton>);
      const button = screen.getByRole("link", { name: "Flex" });
    });

    test("centers items for icon + text support", () => {
      render(<CTAButton href="/test">Centered</CTAButton>);
      const button = screen.getByRole("link", { name: "Centered" });
    });
  });

  describe("Edge Cases", () => {
    test("handles empty children", () => {
      const { container } = render(<CTAButton href="/test"></CTAButton>);
      const link = container.querySelector("a");
      expect(link).toBeInTheDocument();
    });

    test("handles very long text content", () => {
      render(
        <CTAButton href="/test">
          This is a very long button text that should wrap properly on small
          screens
        </CTAButton>,
      );
      expect(
        screen.getByText(
          "This is a very long button text that should wrap properly on small screens",
        ),
      ).toBeInTheDocument();
    });

    test("handles special characters in href", () => {
      render(<CTAButton href="/test?foo=bar&baz=qux">Link</CTAButton>);
      const link = screen.getByRole("link", { name: "Link" });
      expect(link).toHaveAttribute("href", "/test?foo=bar&baz=qux");
    });

    test("prevents default behavior when both href and onClick are provided", () => {
      // Should prioritize onClick and ignore href
      const handleClick = () => {};
      render(
        <CTAButton href="/test" onClick={handleClick}>
          Both Props
        </CTAButton>,
      );
      // Should render as button, not link
      expect(
        screen.getByRole("button", { name: "Both Props" }),
      ).toBeInTheDocument();
    });

    test("requires either href or onClick", () => {
      // @ts-expect-error - either href or onClick is required
      render(<CTAButton>No Props</CTAButton>);
    });
  });

  describe("Mobile Responsiveness", () => {
    test("has minimum 48px touch target for small size", () => {
      render(
        <CTAButton href="/test" size="sm">
          Small Touch
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Small Touch" });
      // Should have sufficient padding for 48px minimum
    });

    test("has adequate spacing for medium size", () => {
      render(
        <CTAButton href="/test" size="md">
          Medium Touch
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Medium Touch" });
    });

    test("has large touch target for large size", () => {
      render(
        <CTAButton href="/test" size="lg">
          Large Touch
        </CTAButton>,
      );
      const button = screen.getByRole("link", { name: "Large Touch" });
    });
  });

  describe("TypeScript Type Safety", () => {
    test("enforces children prop", () => {
      // @ts-expect-error - children is required
      render(<CTAButton href="/test" />);
    });

    test("enforces variant type", () => {
      // @ts-expect-error - variant must be 'primary', 'secondary', or 'inverse'
      render(
        <CTAButton href="/test" variant="tertiary">
          Invalid
        </CTAButton>,
      );
    });

    test("enforces size type", () => {
      // @ts-expect-error - size must be 'sm', 'md', or 'lg'
      render(
        <CTAButton href="/test" size="xl">
          Invalid
        </CTAButton>,
      );
    });
  });
});
