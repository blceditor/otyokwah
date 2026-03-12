"use client";

/**
 * REQ-ADMIN-001: Admin Nav Strip Component
 * REQ-ADMIN-002: Client-side auth check for ISR compatibility
 *
 * A site-wide admin navigation strip that appears when logged into GitHub CMS.
 * Provides quick access to CMS, deployment status, bug reporting, and page editing.
 *
 * Uses client-side auth check to work with ISR-cached pages.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminDeploymentStatus } from "./AdminDeploymentStatus";
import { DEFAULT_GITHUB_FULL } from "@/lib/config";
import { isNavHidden } from "@/lib/config/feature-flags";

// GitHub repo for bug reports (uses centralized config)
const GITHUB_REPO = DEFAULT_GITHUB_FULL;

export function AdminNavStrip() {
  const pathname = usePathname() ?? "";
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [navHidden, setNavHiddenState] = useState(false);

  useEffect(() => {
    setNavHiddenState(isNavHidden());
  }, []);

  // REQ-ADMIN-002: Check auth status client-side to work with ISR
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/check', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  // REQ-U03-FIX-011: Don't show admin strip inside Keystatic CMS or admin dashboard
  if (pathname?.startsWith('/keystatic') || pathname?.startsWith('/admin')) {
    return null;
  }

  // Don't render until auth check is complete, or if nav hidden via CMS toggle
  if (isLoading || !isAdmin || navHidden) {
    return null;
  }

  // REQ-U03-FIX-004: Convert pathname to Keystatic edit URL with correct format
  // - "/" -> /keystatic/branch/main/collection/pages/item/index
  // - "/about" -> /keystatic/branch/main/collection/pages/item/about
  // - "/work-at-camp/counselors" -> /keystatic/branch/main/collection/pages/item/work-at-camp-counselors
  const getEditUrl = () => {
    if (!pathname || pathname === "/") {
      return "/keystatic/branch/main/collection/pages/item/index";
    }
    // Remove leading slash and convert slashes to dashes for nested paths
    const pagePath = pathname.slice(1).replace(/\//g, "-");
    return `/keystatic/branch/main/collection/pages/item/${pagePath}`;
  };

  // Build bug report URL with current page context
  const getBugReportUrl = () => {
    const currentPath = pathname ?? "/";
    const pageUrl =
      typeof window !== "undefined" ? window.location.href : currentPath;
    const title = encodeURIComponent(`Bug on ${currentPath}`);
    const body = encodeURIComponent(
      `**Found on:** ${pageUrl}\n\n**Description:**\n\n`,
    );
    return `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}`;
  };

  return (
    <nav
      data-testid="admin-nav-strip"
      aria-label="Admin Navigation"
      className="fixed top-0 left-0 right-0 z-admin-nav w-full h-8 bg-black text-white flex items-center px-4 gap-6 text-sm font-sans"
    >
      <Link href="/keystatic" className="hover:text-gray-300 transition-colors">
        CMS
      </Link>

      <AdminDeploymentStatus />

      <a
        href={getBugReportUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-gray-300 transition-colors"
      >
        Report Bug
      </a>

      <Link
        href={getEditUrl()}
        className="hover:text-gray-300 transition-colors"
      >
        Edit Page
      </Link>
    </nav>
  );
}

export default AdminNavStrip;
