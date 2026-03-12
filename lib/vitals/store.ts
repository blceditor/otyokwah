/**
 * In-memory Web Vitals store.
 *
 * LIMITATION: This store lives in the serverless function's memory.
 * On Vercel, each function instance has its own copy — data from one
 * instance is not visible to others, and all data is lost on cold
 * starts and new deployments. This is acceptable for a lightweight
 * admin dashboard that shows "recent" vitals for quick diagnostics.
 * For persistent vitals tracking, use the GA4 integration instead.
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

interface VitalSample {
  value: number;
  timestamp: number;
}

interface VitalsStore {
  [metric: string]: VitalSample[];
}

const MAX_SAMPLES = 1000;
const STORE_PATH = join(tmpdir(), "blc-vitals.json");

function loadStore(): VitalsStore {
  try {
    const data = readFileSync(STORE_PATH, "utf-8");
    return JSON.parse(data) as VitalsStore;
  } catch {
    return {};
  }
}

function saveStore(store: VitalsStore): void {
  try {
    writeFileSync(STORE_PATH, JSON.stringify(store));
  } catch {
    // Best-effort persistence to /tmp
  }
}

export function recordVital(name: string, value: number): void {
  const store = loadStore();
  store[name] ??= [];
  store[name].push({ value, timestamp: Date.now() });
  if (store[name].length > MAX_SAMPLES) {
    store[name] = store[name].slice(-MAX_SAMPLES);
  }
  saveStore(store);
}

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export interface VitalsSummary {
  name: string;
  p75: number;
  median: number;
  count: number;
  recent: Array<{ value: number; timestamp: number }>;
}

export const VITAL_METRICS = ["LCP", "FCP", "CLS", "INP", "TTFB"] as const;
export type VitalName = (typeof VITAL_METRICS)[number];

export function getVitalsSummary(since?: number): VitalsSummary[] {
  const store = loadStore();
  const cutoff = since ?? Date.now() - 24 * 60 * 60 * 1000;

  return VITAL_METRICS.map((name) => {
    const samples = (store[name] ?? []).filter((s) => s.timestamp >= cutoff);
    const values = samples.map((s) => s.value);
    return {
      name,
      p75: percentile(values, 75),
      median: percentile(values, 50),
      count: values.length,
      recent: samples.slice(-50),
    };
  });
}
