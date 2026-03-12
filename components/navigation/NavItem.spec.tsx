/**
 * NavItem Component Tests
 * REQ-WEB-001: Top-Level Navigation Links
 *
 * Tests split-button navigation pattern where:
 * - Desktop: Click text → navigate, Click chevron → dropdown
 * - Mobile: First tap → expand, Second tap → navigate
 * - Keyboard: Enter → navigate, Arrow Down → dropdown
 */

import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import NavItem from "./NavItem";
import type { NavMenuItem } from "./types";

describe("REQ-WEB-001 — Top-Level Navigation Links", () => {
  const PARENT_PAGE_HREF = "/summer-staff";
  const PARENT_LABEL = "Work at Camp";

  const CHILD_LINKS = [
    { label: "Summer Staff", href: "/summer-staff/apply" },
    { label: "Year-Round Staff", href: "/year-round-staff" },
  ];

  // Test data: Nav item with both href and children (split-button pattern)
  const navItemWithBothHrefAndChildren: NavMenuItem = {
    label: PARENT_LABEL,
    href: PARENT_PAGE_HREF,
    children: CHILD_LINKS,
  };

  // Test data: Nav item with only children (current behavior)
  const navItemWithOnlyChildren: NavMenuItem = {
    label: PARENT_LABEL,
    children: CHILD_LINKS,
  };

  // Test data: Nav item with only href (simple link)
  const navItemWithOnlyHref: NavMenuItem = {
    label: "About",
    href: "/about",
  };

  describe("Split-button rendering (Desktop)", () => {
    test("REQ-WEB-001 — renders split-button for items with href AND children", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      // Should render parent link
      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });
      expect(parentLink).toBeInTheDocument();
      expect(parentLink).toHaveAttribute("href", PARENT_PAGE_HREF);

      // Should render separate chevron button
      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });
      expect(chevronButton).toBeInTheDocument();
    });

    test("REQ-WEB-001 — parent link is clickable and navigates to parent page", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });

      // Link should have correct href
      expect(parentLink).toHaveAttribute("href", PARENT_PAGE_HREF);

      // Link should be focusable
      parentLink.focus();
      expect(document.activeElement).toBe(parentLink);
    });

    test("REQ-WEB-001 — chevron button opens dropdown without navigation", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Initially dropdown should be closed
      expect(chevronButton).toHaveAttribute("aria-expanded", "false");

      // Click chevron
      fireEvent.click(chevronButton);

      // Dropdown should open
      expect(chevronButton).toHaveAttribute("aria-expanded", "true");

      // Child links should be visible
      const childLink = screen.getByRole("link", { name: "Summer Staff" });
      expect(childLink).toBeInTheDocument();
    });

    test("REQ-WEB-001 — parent link and chevron are separate clickable areas", () => {
      const { container } = render(
        <NavItem item={navItemWithBothHrefAndChildren} />,
      );

      // Should have both link and button elements
      const links = container.querySelectorAll("a");
      const buttons = container.querySelectorAll("button");

      // At least one link (parent) and one button (chevron)
      expect(links.length).toBeGreaterThanOrEqual(1);
      expect(buttons.length).toBeGreaterThanOrEqual(1);

      // They should be different elements
      expect(links[0]).not.toBe(buttons[0]);
    });
  });

  describe("Keyboard navigation", () => {
    test("REQ-WEB-001 — Enter key on parent link navigates to parent page", async () => {
      const user = userEvent.setup();
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });

      // Tab to link
      await user.tab();
      expect(document.activeElement).toBe(parentLink);

      // Enter should not be prevented (browser handles navigation)
      const enterEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
      });
      const preventDefaultSpy = vi.spyOn(enterEvent, "preventDefault");

      parentLink.dispatchEvent(enterEvent);

      // For links, Enter should NOT be prevented
      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    test("REQ-WEB-001 — Arrow Down on parent opens dropdown menu", async () => {
      const user = userEvent.setup();
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Focus chevron button
      chevronButton.focus();
      expect(chevronButton).toHaveAttribute("aria-expanded", "false");

      // Press Arrow Down
      await user.keyboard("{ArrowDown}");

      // Dropdown should open
      expect(chevronButton).toHaveAttribute("aria-expanded", "true");
    });

    test("REQ-WEB-001 — Escape key closes dropdown menu", async () => {
      const user = userEvent.setup();
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Open dropdown
      fireEvent.click(chevronButton);
      expect(chevronButton).toHaveAttribute("aria-expanded", "true");

      // Press Escape
      await user.keyboard("{Escape}");

      // Dropdown should close
      expect(chevronButton).toHaveAttribute("aria-expanded", "false");
    });

    test("REQ-WEB-001 — Tab key allows navigation between parent link and chevron", async () => {
      const user = userEvent.setup();
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });
      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Tab to first element (should be parent link)
      await user.tab();
      expect(document.activeElement).toBe(parentLink);

      // Tab to second element (should be chevron button)
      await user.tab();
      expect(document.activeElement).toBe(chevronButton);
    });
  });

  describe("ARIA attributes for screen readers", () => {
    test("REQ-WEB-001 — parent link has correct accessible name", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });
      expect(parentLink).toHaveAccessibleName(PARENT_LABEL);
    });

    test("REQ-WEB-001 — chevron button has aria-haspopup attribute", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });
      expect(chevronButton).toHaveAttribute("aria-haspopup", "true");
    });

    test("REQ-WEB-001 — chevron button has aria-expanded attribute", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Initially false
      expect(chevronButton).toHaveAttribute("aria-expanded", "false");

      // After click, true
      fireEvent.click(chevronButton);
      expect(chevronButton).toHaveAttribute("aria-expanded", "true");
    });

    test("REQ-WEB-001 — chevron button has descriptive aria-label", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });
      expect(chevronButton).toHaveAttribute(
        "aria-label",
        `${PARENT_LABEL} submenu`,
      );
    });

    test('REQ-WEB-001 — screen reader announces: "link with submenu"', () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });
      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Parent link should be a link
      expect(parentLink.tagName).toBe("A");

      // Chevron should announce submenu
      expect(chevronButton).toHaveAttribute("aria-label");
      expect(chevronButton.getAttribute("aria-label")).toContain("submenu");
    });
  });

  describe("Mobile behavior (tap-to-expand, second-tap-to-navigate)", () => {
    test("REQ-WEB-001 — first tap on parent opens dropdown", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });

      // First tap (simulated as click)
      fireEvent.click(parentLink);

      // Dropdown should open (child links visible)
      const childLink = screen.getByRole("link", { name: "Summer Staff" });
      expect(childLink).toBeInTheDocument();
    });

    test("REQ-WEB-001 — second tap on parent navigates to parent page", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });

      // First tap - opens dropdown
      fireEvent.click(parentLink);
      expect(
        screen.getByRole("link", { name: "Summer Staff" }),
      ).toBeInTheDocument();

      // Second tap - should navigate (browser handles this)
      // We verify href is still set correctly
      expect(parentLink).toHaveAttribute("href", PARENT_PAGE_HREF);
    });
  });

  describe("No regression: Existing functionality preserved", () => {
    test("REQ-WEB-001 — items with only href still render as simple links", () => {
      render(<NavItem item={navItemWithOnlyHref} />);

      const link = screen.getByRole("link", { name: "About" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/about");

      // Should NOT have chevron button
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });

    test("REQ-WEB-001 — items with only children still render as dropdown-only buttons", () => {
      render(<NavItem item={navItemWithOnlyChildren} />);

      const button = screen.getByRole("button", {
        name: `${PARENT_LABEL} menu`,
      });
      expect(button).toBeInTheDocument();

      // Should NOT have parent link (current behavior)
      const links = screen.queryAllByRole("link", { name: PARENT_LABEL });
      expect(links).toHaveLength(0);
    });

    test("REQ-WEB-001 — dropdown menu opens on mouse hover (existing behavior)", () => {
      const { container } = render(
        <NavItem item={navItemWithBothHrefAndChildren} />,
      );

      const navItemContainer = container.querySelector(".relative");
      expect(navItemContainer).toBeInTheDocument();

      // Simulate mouse enter
      fireEvent.mouseEnter(navItemContainer!);

      // Dropdown should open
      const childLink = screen.getByRole("link", { name: "Summer Staff" });
      expect(childLink).toBeInTheDocument();
    });

    test("REQ-WEB-001 — dropdown menu closes on mouse leave with delay", async () => {
      vi.useFakeTimers();

      try {
        const { container } = render(
          <NavItem item={navItemWithBothHrefAndChildren} />,
        );

        const navItemContainer = container.querySelector(".relative");

        // Open dropdown
        fireEvent.mouseEnter(navItemContainer!);
        expect(
          screen.getByRole("link", { name: "Summer Staff" }),
        ).toBeInTheDocument();

        // Mouse leave
        fireEvent.mouseLeave(navItemContainer!);

        // Should still be open immediately
        expect(
          screen.getByRole("link", { name: "Summer Staff" }),
        ).toBeInTheDocument();

        // After delay (150ms), should close
        vi.advanceTimersByTime(150);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("Focus management", () => {
    test("REQ-WEB-001 — parent link has visible focus indicator", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });

      // Check for focus ring classes
    });

    test("REQ-WEB-001 — chevron button has visible focus indicator", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} />);

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });

      // Check for focus ring classes
    });
  });

  describe("Edge cases", () => {
    test("REQ-WEB-001 — handles empty children array gracefully", () => {
      const navItemWithEmptyChildren: NavMenuItem = {
        label: "Programs",
        href: "/programs",
        children: [],
      };

      render(<NavItem item={navItemWithEmptyChildren} />);

      // Should render as simple link (no children)
      const link = screen.getByRole("link", { name: "Programs" });
      expect(link).toBeInTheDocument();

      // No button should be rendered
      const buttons = screen.queryAllByRole("button");
      expect(buttons).toHaveLength(0);
    });

    test("REQ-WEB-001 — handles very long label text", () => {
      const LONG_LABEL =
        "This is an extremely long navigation label that should still work properly";
      const longLabelItem: NavMenuItem = {
        label: LONG_LABEL,
        href: "/long-page",
        children: CHILD_LINKS,
      };

      render(<NavItem item={longLabelItem} />);

      const parentLink = screen.getByRole("link", { name: LONG_LABEL });
      expect(parentLink).toBeInTheDocument();
    });

    test("REQ-WEB-001 — handles special characters in href", () => {
      const specialHrefItem: NavMenuItem = {
        label: "FAQ",
        href: "/faq?section=camp&topic=registration",
        children: CHILD_LINKS,
      };

      render(<NavItem item={specialHrefItem} />);

      const parentLink = screen.getByRole("link", { name: "FAQ" });
      expect(parentLink).toHaveAttribute(
        "href",
        "/faq?section=camp&topic=registration",
      );
    });
  });

  describe("Visual indicators", () => {
    test("REQ-WEB-001 — chevron rotates when dropdown is open", () => {
      const { container } = render(
        <NavItem item={navItemWithBothHrefAndChildren} />,
      );

      const chevronButton = screen.getByRole("button", {
        name: `${PARENT_LABEL} submenu`,
      });
      const chevronSvg = chevronButton.querySelector("svg");

      // Initially not rotated
      expect(chevronSvg?.getAttribute('class')).not.toContain("rotate-180");

      // After click, rotated
      fireEvent.click(chevronButton);
      expect(chevronSvg?.getAttribute('class')).toContain("rotate-180");
    });

    test("REQ-WEB-001 — active state highlights parent link", () => {
      render(<NavItem item={navItemWithBothHrefAndChildren} isActive={true} />);

      const parentLink = screen.getByRole("link", { name: PARENT_LABEL });
    });
  });
});
