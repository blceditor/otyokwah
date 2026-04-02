"use client";

import { useEffect } from "react";

export function AdminOverflowReset() {
  useEffect(() => {
    document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return null;
}
