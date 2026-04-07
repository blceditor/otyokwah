"use client";

import { useEffect } from "react";

export function AdminOverflowReset() {
  useEffect(() => {
    // Force-clear overflow on mount (fixes stale state from Keystatic navigation)
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    // Watch for anything re-setting overflow hidden on body after navigation
    const observer = new MutationObserver(() => {
      if (
        document.body.style.overflow === "hidden" ||
        document.documentElement.style.overflow === "hidden"
      ) {
        document.body.style.overflow = "";
        document.documentElement.style.overflow = "";
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["style"],
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      observer.disconnect();
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);
  return null;
}
