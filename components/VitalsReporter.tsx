"use client";

import { useReportWebVitals } from "next/web-vitals";

export function VitalsReporter() {
  useReportWebVitals((metric) => {
    const body = JSON.stringify({ name: metric.name, value: metric.value });
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        "/api/vitals",
        new Blob([body], { type: "application/json" }),
      );
    } else {
      fetch("/api/vitals", { method: "POST", body, keepalive: true });
    }
  });
  return null;
}
