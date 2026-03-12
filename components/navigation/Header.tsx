"use client";

/**
 * Header Component
 * REQ-301: Header Layout Structure
 * REQ-302: Hanging Logo Design
 * REQ-305: Scroll Behavior (transparent → solid)
 * REQ-WEB-002: Logo scroll behavior
 * REQ-ADMIN-002: Client-side auth check for ISR compatibility
 */

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import type { HeaderProps } from "./types";
import { defaultNavigation } from "./config";
import { isNavHidden } from "@/lib/config/feature-flags";
import Logo from "./Logo";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";
import { SearchModal } from "../SearchModal";

function throttle(func: () => void, delay: number) {
  let lastCall = 0;
  return function () {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func();
    }
  };
}

export default function Header({
  navigation = defaultNavigation,
}: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Check if we're on Keystatic routes
  const isKeystatic = pathname?.startsWith("/keystatic");

  // REQ-ADMIN-002: Check auth status client-side for proper header positioning
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        }
      } catch {
        // Silently fail - default to non-admin
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    // Don't add scroll listener on Keystatic pages
    if (isKeystatic) return;

    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > 100);
    }, 16); // 60fps throttle

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isKeystatic]);

  // Don't render header on Keystatic or admin dashboard routes
  if (isKeystatic || pathname?.startsWith("/admin")) {
    return null;
  }

  // Always use solid green background
  // REQ-ADMIN-001: Adjust top position when admin nav strip is visible
  const headerClasses = `
    fixed ${isAdmin && !isNavHidden() ? "top-8" : "top-0"} left-0 right-0 z-header
    bg-secondary-light shadow-lg
    transition-all duration-300
  `;

  return (
    <>
      <header className={headerClasses} role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 lg:h-[68px]">
            {/* Logo on left - part of flex flow */}
            <Logo
              src={navigation.logo.src}
              alt={navigation.logo.alt}
              href={navigation.logo.href}
              isScrolled={isScrolled}
            />

            {/* Desktop Navigation on right */}
            <DesktopNav navigation={navigation} onSearchClick={() => setIsSearchOpen(true)} />

            {/* Mobile Search + Hamburger - REQ-MOBILE-001: 44px touch target */}
            <div className="lg:hidden flex items-center ml-auto">
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream hover:text-white transition-colors"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                type="button"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-cream hover:text-white transition-colors"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <MobileNav
        navigation={navigation}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
