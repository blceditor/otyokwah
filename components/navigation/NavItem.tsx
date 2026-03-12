"use client";

/**
 * NavItem Component
 * REQ-303: Navigation Menu Items with dropdown support
 * REQ-WEB-001: Split-button navigation pattern
 */

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import type { NavItemProps } from "./types";
import DropdownMenu from "./DropdownMenu";

export default function NavItem({ item, isActive = false }: NavItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasChildren = item.children && item.children.length > 0;

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setMobileDropdownOpen(false);
    }, 150);
  };

  const handleChevronKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setMobileDropdownOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  const handleChevronClick = () => {
    setIsOpen(!isOpen);
  };

  const handleParentClick = (e: React.MouseEvent) => {
    // On mobile (or when dropdown not yet opened via click), first click opens dropdown
    // On desktop with mouse hover, the dropdown is already open via handleMouseEnter
    // This handles the case where user clicks (mobile tap or desktop click without hover)
    if (hasChildren && !isOpen) {
      // First tap/click: prevent navigation, open dropdown
      e.preventDefault();
      setMobileDropdownOpen(true);
      setIsOpen(true);
    } else if (hasChildren && isOpen && !mobileDropdownOpen) {
      // Desktop: dropdown is open via hover, allow immediate navigation
      // Don't preventDefault - let the link navigate
    } else if (hasChildren && mobileDropdownOpen) {
      // Second tap on mobile: allow navigation (don't preventDefault)
      setMobileDropdownOpen(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
        setMobileDropdownOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Mode 1: Simple link (href only, no children)
  if (!hasChildren && item.href) {
    return (
      <Link
        href={item.href}
        className={`px-3 py-2 text-cream hover:text-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${
          isActive ? "text-white" : ""
        }`}
      >
        {item.label}
      </Link>
    );
  }

  // Mode 2: Dropdown-only button (children only, no href)
  if (hasChildren && !item.href) {
    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          className={`px-3 py-2 text-cream hover:text-white transition-colors font-medium flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${
            isActive ? "text-white" : ""
          }`}
          aria-expanded={isOpen}
          aria-haspopup="true"
          aria-label={`${item.label} menu`}
          onKeyDown={handleChevronKeyDown}
          onClick={handleChevronClick}
        >
          {item.label}
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <DropdownMenu
          items={item.children!}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      </div>
    );
  }

  // Mode 3: Split-button (href AND children)
  if (hasChildren && item.href) {
    return (
      <div
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center">
          {/* Parent link - navigates to parent page */}
          <Link
            href={item.href}
            onClick={handleParentClick}
            className={`px-3 py-2 text-cream hover:text-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${
              isActive ? "text-white" : ""
            }`}
          >
            {item.label}
          </Link>

          {/* Chevron button - opens dropdown */}
          <button
            type="button"
            className={`px-2 py-2 text-cream hover:text-white transition-colors font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-secondary ${
              isActive ? "text-white" : ""
            }`}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label={`${item.label} submenu`}
            onKeyDown={handleChevronKeyDown}
            onClick={handleChevronClick}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <DropdownMenu
          items={item.children!}
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setMobileDropdownOpen(false);
          }}
        />
      </div>
    );
  }

  // Fallback (should never reach here)
  return null;
}
