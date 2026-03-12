"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  X,
  Loader2,
  Link as LinkIcon,
  ExternalLink,
  ChevronDown,
  FileText,
  Wrench,
  Image as ImageIcon,
  History,
  LogOut,
  RefreshCw,
  PanelRight,
  EyeOff,
  LayoutDashboard,
  BarChart3,
} from "lucide-react";
import {
  isLivePreviewEnabled,
  setLivePreviewEnabled,
  isNavHidden,
  setNavHidden,
} from "@/lib/config/feature-flags";
import BugReportModal from "./BugReportModal";
import SparkryBranding from "./SparkryBranding";
import DeploymentStatus from "./DeploymentStatus";
import GlobalSEOGenerator from "./GlobalSEOGenerator";
import ThemeToggle from "./ThemeToggle";
import {
  getRecentPages,
  clearRecentPages,
} from "@/lib/keystatic/recentPagesTracker";
import { useGitHubUser } from "@/hooks/useGitHubUser";
import { SITE_URL } from "@/lib/site-url";

// Discard draft: clears only Keystatic IndexedDB databases (preserves auth cookies/login)
async function discardKeystatiDraft(): Promise<void> {
  const dbNames = ["keystatic", "keystatic-blobs", "keystatic-trees"];

  // Also find any Replicache databases
  if (window.indexedDB?.databases) {
    const allDbs = await window.indexedDB.databases();
    for (const db of allDbs) {
      if (
        db.name &&
        (db.name.startsWith("replicache-") || db.name.startsWith("keystatic"))
      ) {
        if (!dbNames.includes(db.name)) {
          dbNames.push(db.name);
        }
      }
    }
  }

  const deletePromises = dbNames.map(
    (name) =>
      new Promise<void>((resolve) => {
        const req = window.indexedDB.deleteDatabase(name);
        req.onsuccess = () => resolve();
        req.onerror = () => resolve();
        req.onblocked = () => resolve();
      }),
  );
  await Promise.all(deletePromises);
}

// Nuclear reset: properly awaits all IndexedDB deletions before returning
async function nuclearClearBrowserStorage(): Promise<void> {
  // 1. Delete ALL IndexedDB databases — await each deletion
  if (window.indexedDB?.databases) {
    const databases = await window.indexedDB.databases();
    const deletePromises = databases
      .filter((db) => db.name)
      .map(
        (db) =>
          new Promise<void>((resolve) => {
            const req = window.indexedDB.deleteDatabase(db.name!);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          }),
      );
    await Promise.all(deletePromises);
  }

  // 2. Clear all localStorage and sessionStorage
  localStorage.clear();
  sessionStorage.clear();

  // 3. Clear Cache API (Service Worker caches)
  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  // 4. Unregister service workers
  if ("serviceWorker" in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }

  // 5. Clear all client-accessible cookies at all paths
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      for (const path of [
        "/",
        "/keystatic",
        "/api",
        "/api/keystatic",
        "/api/keystatic/github",
      ]) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
      }
    }
  });
}

// REQ-CMS-007: Dropdown Menu Component for CMS Nav
interface DropdownProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
}

function NavDropdown({ label, icon, children, disabled }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title={label === "Content" ? "Browse pages and settings" : label === "Tools" ? "Media library, cache tools, and more" : undefined}
      >
        {icon}
        {label}
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 min-w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
          <div className="py-1">{children}</div>
        </div>
      )}
    </div>
  );
}

// REQ-CMS-007: Dropdown Menu Item Component
interface DropdownItemProps {
  onClick?: () => void;
  href?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  variant?: "default" | "warning" | "success" | "info";
  external?: boolean;
  disabled?: boolean;
}

function DropdownItem({
  onClick,
  href,
  icon,
  children,
  variant = "default",
  external,
  disabled,
}: DropdownItemProps) {
  // Theme-aware dropdown item colors
  const variantClasses = {
    default:
      "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
    warning:
      "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30",
    success:
      "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30",
    info: "text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30",
  };

  const baseClasses = `w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${variantClasses[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;

  if (href) {
    const content = (
      <>
        {icon}
        {children}
        {external && <ExternalLink size={12} className="ml-auto opacity-50" />}
      </>
    );
    if (external) {
      return (
        <a
          href={href}
          className={baseClasses}
          target="_blank"
          rel="noopener noreferrer"
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={baseClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={baseClasses}>
      {icon}
      {children}
    </button>
  );
}

interface PageGitDate {
  slug: string;
  lastModified: string;
  commitMessage: string;
}

// Extract page slug from pathname for page-aware buttons
function extractPageInfo(pathname: string): { slug: string } | null {
  const normalizedPath = pathname.replace(/\/+$/, "");
  const match = normalizedPath.match(
    /\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/(?:item\/)?([^/]+)/,
  );
  if (!match) return null;
  const slug = match[1].replace(/^\/+|\/+$/g, "");
  return { slug };
}

export const HEADER_HEIGHT = "h-14";

/**
 * KeystaticToolsHeader - Header for Keystatic CMS admin
 *
 * Provides:
 * - BugReportModal: GitHub issue creation
 * - DeploymentStatus: Shows deploy state
 * - MediaLibrary: REQ-FUTURE-007 - Media management
 * - RecentPages: REQ-FUTURE-013 - Recent pages sort
 * - SparkryBranding: White-label branding
 * - ThemeToggle: REQ-CMS-008 - Light/Dark mode toggle
 */
export function KeystaticToolsHeader() {
  const pathname = usePathname() ?? "";
  const [recentSortActive, setRecentSortActive] = useState(false);
  const [isLoadingGitDates, setIsLoadingGitDates] = useState(false);
  const { user: githubUser, isLoading: isLoadingUser } = useGitHubUser();

  // REQ-LP-003: Live Preview toggle state
  const [previewEnabled, setPreviewEnabled] = useState(() =>
    isLivePreviewEnabled(),
  );
  const [navHidden, setNavHiddenState] = useState(() => isNavHidden());

  // Check if we're editing a specific page
  const pageInfo = pathname ? extractPageInfo(pathname) : null;
  const isPageEditor = !!pageInfo;

  // Use state so origin updates after hydration (SSR has no window)
  const [origin, setOrigin] = useState<string | undefined>();
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);
  const baseUrl =
    origin && !origin.includes("localhost") ? origin : SITE_URL;
  const productionUrl = pageInfo
    ? pageInfo.slug === "index" || pageInfo.slug === "home"
      ? `${baseUrl}/`
      : `${baseUrl}/${pageInfo.slug}`
    : "";
  const pathDisplay = pageInfo
    ? pageInfo.slug === "index" || pageInfo.slug === "home"
      ? "/"
      : `/${pageInfo.slug}`
    : "";

  // Trigger link validator modal in PageEditingToolbar
  const handleValidateLinks = useCallback(() => {
    window.dispatchEvent(new CustomEvent("show-link-validator"));
  }, []);

  const getPageContext = useCallback(() => {
    if (!pathname) return null;
    const normalizedPath = pathname.replace(/\/+$/, "");
    const slugMatch = normalizedPath.match(
      /\/keystatic\/collection\/pages\/([^/]+)/,
    );

    if (slugMatch && slugMatch[1]) {
      return { slug: slugMatch[1] };
    }

    return {
      slug: normalizedPath.split("/").filter(Boolean).pop() || "dashboard",
    };
  }, [pathname]);

  // Check if we're on the pages collection view
  const isCollectionView = pathname?.match(
    /\/keystatic\/(?:branch\/[^/]+\/)?collection\/pages\/?$/,
  );

  // REQ-CMS-017: Sort pages by recently edited using git dates
  const handleRecentSort = useCallback(async () => {
    setIsLoadingGitDates(true);

    try {
      // Try to fetch git dates from API
      let gitDates: PageGitDate[] = [];
      let useGitDates = false;

      try {
        const response = await fetch("/api/keystatic/git-dates");
        if (response.ok) {
          const data = await response.json();
          if (data.pages && data.pages.length > 0) {
            gitDates = data.pages;
            useGitDates = true;
          }
        }
      } catch {
        // Git dates API unavailable, fall back to localStorage
      }

      // Fall back to localStorage if git dates not available
      const localRecentPages = getRecentPages();
      if (!useGitDates && localRecentPages.length === 0) {
        alert("No recently edited pages found. Edit some pages first!");
        setIsLoadingGitDates(false);
        return;
      }

      // REQ-CMS-017: Fixed selector to target React Spectrum components
      // Keystatic uses Voussoir/React Spectrum which uses role="listbox" or role="grid"
      // NOT role="list". Also uses data-key attributes on items.
      const findPagesList = async (): Promise<HTMLElement | null> => {
        // Selectors ordered by likelihood - React Spectrum uses these roles
        const selectors = [
          '[role="listbox"]', // React Spectrum ListView
          '[role="grid"]', // React Spectrum GridList
          "main ul", // Fallback to any ul in main
          "[data-key] + [data-key]", // Adjacent items with data-key (find parent)
        ];

        // Try each selector, looking for one that contains page links
        for (const selector of selectors) {
          const candidates = document.querySelectorAll(selector);
          for (const candidate of candidates) {
            if (candidate.querySelector('a[href*="/collection/pages/"]')) {
              return candidate as HTMLElement;
            }
          }
        }

        // If direct selectors fail, try finding parent of page links
        const pageLink = document.querySelector(
          'a[href*="/collection/pages/item/"]',
        );
        if (pageLink) {
          // Walk up to find a suitable container
          let parent = pageLink.parentElement;
          let depth = 0;
          while (parent && depth < 5) {
            const siblingLinks = parent.querySelectorAll(
              'a[href*="/collection/pages/item/"]',
            );
            if (siblingLinks.length > 3) {
              // Found a container with multiple page links
              return parent;
            }
            parent = parent.parentElement;
            depth++;
          }
        }

        return null;
      };

      // Retry mechanism - Keystatic may still be rendering
      let listContainer: HTMLElement | null = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        listContainer = await findPagesList();
        if (listContainer) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (!listContainer) {
        setIsLoadingGitDates(false);
        return;
      }

      // Find list items - React Spectrum uses role="row" or role="option"
      const listItems = Array.from(
        listContainer.querySelectorAll(
          '[role="row"], [role="option"], [data-key], li',
        ),
      ).filter((item) => {
        // Ensure we're getting actual list items with links to pages
        const link = item.querySelector('a[href*="/collection/pages/"]');
        return link !== null;
      });

      if (listItems.length === 0) {
        setIsLoadingGitDates(false);
        return;
      }

      // Create timestamp map from git dates or localStorage
      const timestampMap = new Map<string, number>();
      if (useGitDates) {
        gitDates.forEach((p) => {
          timestampMap.set(p.slug, new Date(p.lastModified).getTime());
        });
      } else {
        localRecentPages.forEach((p) => {
          timestampMap.set(p.slug, new Date(p.timestamp).getTime());
        });
      }

      // Extract slug from item
      const extractSlug = (item: Element): string => {
        const link = item.querySelector("a[href]");
        if (link) {
          const href = link.getAttribute("href") || "";
          const slugMatch = href.match(/\/pages\/(?:item\/)?([^/]+)/);
          if (slugMatch) return slugMatch[1];
        }
        const dataSlug = item.getAttribute("data-slug");
        if (dataSlug) return dataSlug;
        return (
          item.textContent?.trim().toLowerCase().replace(/\s+/g, "-") || ""
        );
      };

      // Sort and reorder
      const sortedItems = [...listItems].sort((a, b) => {
        const timeA = timestampMap.get(extractSlug(a)) ?? 0;
        const timeB = timestampMap.get(extractSlug(b)) ?? 0;
        return timeB - timeA;
      });

      sortedItems.forEach((item) => {
        listContainer.appendChild(item);
      });

      setRecentSortActive(true);
    } finally {
      setIsLoadingGitDates(false);
    }
  }, []);

  const handleClearRecent = useCallback(() => {
    clearRecentPages();
    setRecentSortActive(false);
    window.location.reload();
  }, []);

  // REQ-CMS-AUTH: Sign out — full cleanup then logout
  const handleSignOut = useCallback(async () => {
    const confirmed = window.confirm(
      "Sign out of Keystatic?\n\nThis will clear ALL cached data and sign you out.",
    );
    if (!confirmed) return;

    try {
      await nuclearClearBrowserStorage();
    } catch {
      // Continue to logout even if cleanup partially fails
    }

    window.location.href = "/api/keystatic/logout";
  }, []);

  // REQ-CMS-AUTH: Switch GitHub account — full cleanup then logout/re-login
  const handleSwitchAccount = useCallback(async () => {
    try {
      await nuclearClearBrowserStorage();
    } catch {
      // Continue even if cleanup partially fails
    }

    window.location.href = "/api/keystatic/logout";
  }, []);

  // Discard draft: clears Keystatic IDB caches but preserves login
  const handleDiscardDraft = useCallback(async () => {
    const confirmed = window.confirm(
      "Discard unsaved draft?\n\n" +
        "This reloads the page from GitHub, discarding any local changes.\n" +
        "You will stay logged in.",
    );
    if (!confirmed) return;

    try {
      await discardKeystatiDraft();
    } catch {
      // Continue to reload even if cleanup partially fails
    }
    window.location.reload();
  }, []);

  // REQ-CMS-FIX: Nuclear reset — navigate to dedicated reset page
  // MUST leave Keystatic first so IndexedDB connections are closed,
  // otherwise deleteDatabase() fires "onblocked" and silently fails.
  const handleClearCache = useCallback(() => {
    const confirmed = window.confirm(
      "Cache Reset: Clear ALL cached data and reload.\n\n" +
        "Use this if the editor is stuck spinning, showing stale data, or components aren't appearing.\n\n" +
        "Continue?",
    );
    if (!confirmed) return;

    // Navigate to standalone reset page (not Keystatic) that:
    // 1. Server-side: clears HttpOnly cookies via Set-Cookie headers
    // 2. Client-side: clears IndexedDB (no open connections), localStorage, etc.
    // 3. Redirects back to /keystatic
    window.location.href = "/api/keystatic/nuclear-reset";
  }, []);

  // REQ-LP-003: Toggle live preview panel
  const handleTogglePreview = useCallback(() => {
    const newValue = !previewEnabled;
    setLivePreviewEnabled(newValue);
    setPreviewEnabled(newValue);
    // Force re-render of layout by reloading
    window.location.reload();
  }, [previewEnabled]);

  const handleToggleNav = useCallback(() => {
    const newValue = !navHidden;
    setNavHidden(newValue);
    setNavHiddenState(newValue);
    window.location.reload();
  }, [navHidden]);

  // REQ-CMS-007: Black/white CMS nav with dropdowns
  return (
    <header
      role="banner"
      aria-label="CMS Tools Header"
      className={`${HEADER_HEIGHT} w-full flex items-center bg-gray-900`}
      data-testid="cms-nav-header"
    >
      <div className="flex items-center justify-between px-4 py-2 w-full">
        {/* Left section: Dropdown Menus */}
        <nav aria-label="CMS Navigation" className="flex items-center gap-1">
          {/* Content Menu - Pages, Media, Recent */}
          <NavDropdown label="Content" icon={<FileText size={16} />}>
            <DropdownItem
              href="/keystatic/branch/main/collection/pages"
              icon={<FileText size={14} />}
            >
              All Pages
            </DropdownItem>
            <DropdownItem href="/keystatic/media" icon={<ImageIcon size={14} />}>
              Media Library
            </DropdownItem>
            {isCollectionView && (
              <>
                <div className="border-t border-gray-700 my-1" />
                <DropdownItem
                  onClick={handleRecentSort}
                  icon={
                    isLoadingGitDates ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <History size={14} />
                    )
                  }
                  disabled={isLoadingGitDates}
                  variant={recentSortActive ? "info" : "default"}
                >
                  Sort by Recent
                </DropdownItem>
                {recentSortActive && (
                  <DropdownItem
                    onClick={handleClearRecent}
                    icon={<X size={14} />}
                  >
                    Clear Sort
                  </DropdownItem>
                )}
              </>
            )}
          </NavDropdown>

          {/* Tools Menu - SEO, Links, View Live, Cache */}
          <NavDropdown label="Tools" icon={<Wrench size={16} />}>
            {/* REQ-LP-003: Live Preview Toggle */}
            <DropdownItem
              onClick={handleTogglePreview}
              icon={<PanelRight size={14} />}
              variant={previewEnabled ? "success" : "default"}
            >
              {previewEnabled ? "✓ Live Preview On" : "Live Preview"}
            </DropdownItem>
            <DropdownItem
              onClick={handleToggleNav}
              icon={<EyeOff size={14} />}
              variant={navHidden ? "info" : "default"}
            >
              {navHidden ? "Admin Nav Hidden" : "Hide Admin Nav"}
            </DropdownItem>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            <GlobalSEOGenerator asDropdownItem />
            <DropdownItem
              onClick={handleValidateLinks}
              icon={<LinkIcon size={14} />}
              variant="success"
            >
              Check All Page Links
            </DropdownItem>
            <div className="border-t border-gray-700 my-1" />
            <DropdownItem
              href="/admin/sessions"
              icon={<LayoutDashboard size={14} />}
            >
              Sessions Dashboard
            </DropdownItem>
            <DropdownItem
              href="/admin/analytics"
              icon={<BarChart3 size={14} />}
            >
              Site Analytics
            </DropdownItem>
            <div className="border-t border-gray-700 my-1" />
            <DropdownItem
              onClick={handleDiscardDraft}
              icon={<X size={14} />}
            >
              Discard Draft
            </DropdownItem>
            <DropdownItem
              onClick={handleClearCache}
              icon={<RefreshCw size={14} />}
              variant="warning"
            >
              Cache Reset
            </DropdownItem>
            <DropdownItem
              onClick={handleSwitchAccount}
              icon={<RefreshCw size={14} />}
              variant="info"
            >
              Switch Account
            </DropdownItem>
            <DropdownItem
              onClick={handleSignOut}
              icon={<LogOut size={14} />}
              variant="warning"
            >
              Sign Out
            </DropdownItem>
          </NavDropdown>

          {/* Top-level Report Issue button */}
          <BugReportModal
            pageContext={getPageContext() ?? { slug: "" }}
            asNavItem
          />

          {/* Top-level View Page Live button (page-aware) */}
          {isPageEditor && productionUrl && (
            <a
              href={productionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
              aria-label={`View ${pathDisplay} live`}
              title="See this page on the live site"
            >
              <ExternalLink size={16} />
              View Live
            </a>
          )}
        </nav>

        {/* Right section: Status, User, Theme Toggle, Branding */}
        <div
          className="flex items-center gap-3"
          role="contentinfo"
          aria-label="Status and Settings"
        >
          <DeploymentStatus darkMode />
          {/* REQ-CMS-AUTH: Show authenticated GitHub user */}
          {!isLoadingUser && githubUser && (
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element -- external GitHub avatar URL */}
              <img
                src={githubUser.avatar_url}
                alt={`${githubUser.login}'s avatar`}
                className="w-5 h-5 rounded-full"
              />
              <span className="text-sm text-gray-300 font-medium">
                {githubUser.login}
              </span>
            </div>
          )}
          {/* REQ-CMS-007: Dark mode toggle in nav */}
          <ThemeToggle compact />
          <SparkryBranding darkMode />
        </div>
      </div>
    </header>
  );
}

export default KeystaticToolsHeader;
