"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { useRepoAccessCheck } from "@/hooks/useRepoAccessCheck";
import { useCallback, useEffect, useRef, useState } from "react";

// Use a key that won't be swept by the logged-out page's cleanup
// (which clears anything containing "keystatic" or "github")
const AUTO_SWITCH_KEY = "blc-acct-switch-attempted";

/**
 * REQ-CMS-AUTH: Repo Access Error Banner
 *
 * When signed in with the wrong GitHub account, automatically triggers
 * an account switch (once per session to prevent loops). If auto-switch
 * already attempted, shows a manual banner with Switch Account button.
 */
export function RepoAccessErrorBanner() {
  const { authenticatedUser, expectedOwner, hasMismatch, isLoading } =
    useRepoAccessCheck();
  const autoSwitchTriggered = useRef(false);
  const [autoSwitchFailed, setAutoSwitchFailed] = useState(false);

  const clearAuthData = useCallback(async () => {
    try {
      if (window.indexedDB?.databases) {
        const databases = await window.indexedDB.databases();
        for (const db of databases) {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        }
      }

      const localStorageKeysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("keystatic") ||
            key.includes("github") ||
            key.includes("Keystatic"))
        ) {
          localStorageKeysToRemove.push(key);
        }
      }
      localStorageKeysToRemove.forEach((key) => localStorage.removeItem(key));

      const sessionStorageKeysToRemove: string[] = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (
          key &&
          (key.includes("keystatic") ||
            key.includes("github") ||
            key.includes("Keystatic"))
        ) {
          sessionStorageKeysToRemove.push(key);
        }
      }
      sessionStorageKeysToRemove.forEach((key) =>
        sessionStorage.removeItem(key),
      );

      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        if (name.includes("keystatic") || name.includes("github")) {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/keystatic`;
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api/keystatic`;
        }
      });
    } catch {
      // Ignore cleanup errors
    }
  }, []);

  // REQ-CMS-AUTH: Auto-switch on mismatch (once per session)
  useEffect(() => {
    if (isLoading || !hasMismatch || autoSwitchTriggered.current) return;

    const alreadyAttempted = sessionStorage.getItem(AUTO_SWITCH_KEY);
    if (alreadyAttempted) {
      setAutoSwitchFailed(true);
      return;
    }

    autoSwitchTriggered.current = true;
    sessionStorage.setItem(AUTO_SWITCH_KEY, "true");

    clearAuthData().then(() => {
      window.location.href = "/api/keystatic/logout";
    });
  }, [isLoading, hasMismatch, clearAuthData]);

  const handleSwitchAccount = useCallback(async () => {
    sessionStorage.removeItem(AUTO_SWITCH_KEY);
    await clearAuthData();
    window.location.href = "/api/keystatic/logout";
  }, [clearAuthData]);

  if (isLoading || !hasMismatch) {
    return null;
  }

  // Auto-switch in progress - show brief message
  if (!autoSwitchFailed) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-200 dark:border-blue-700 px-4 py-3">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Switching to the correct GitHub account (
            <code className="bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded font-mono text-xs">
              {expectedOwner}
            </code>
            )&hellip;
          </p>
        </div>
      </div>
    );
  }

  // Auto-switch already attempted - show manual fallback
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-4 py-3">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <span className="font-semibold">Wrong GitHub Account:</span>{" "}
            You&apos;re signed in as{" "}
            <code className="bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-100 font-mono text-xs">
              {authenticatedUser}
            </code>
            , but this repo belongs to{" "}
            <code className="bg-amber-100 dark:bg-amber-800 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-100 font-mono text-xs">
              {expectedOwner}
            </code>
            .
          </p>
        </div>
        <button
          onClick={handleSwitchAccount}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-800 dark:text-amber-100 bg-amber-100 dark:bg-amber-800 hover:bg-amber-200 dark:hover:bg-amber-700 rounded-md transition-colors flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          Switch Account
        </button>
      </div>
    </div>
  );
}

export default RepoAccessErrorBanner;
