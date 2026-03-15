/**
 * Web Vitals store.
 *
 * Uses Vercel KV (Upstash Redis) when configured for persistent storage.
 * Falls back to in-memory when KV is not available.
 */

import { kvLpush, kvLrange, kvLtrim, kvLlen } from "@/lib/kv";

interface VitalSample {
  value: number;
  timestamp: number;
}

const MAX_SAMPLES = 1000;

function kvKey(metric: string): string {
  return `vitals:${metric}`;
}

export async function recordVital(name: string, value: number): Promise<void> {
  const sample: VitalSample = { value, timestamp: Date.now() };
  await kvLpush(kvKey(name), sample);
  const len = await kvLlen(kvKey(name));
  if (len > MAX_SAMPLES) {
    await kvLtrim(kvKey(name), 0, MAX_SAMPLES - 1);
  }
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
  p90: number;
  median: number;
  count: number;
  recent: Array<{ value: number; timestamp: number }>;
}

export const VITAL_METRICS = ["LCP", "FCP", "CLS", "INP", "TTFB"] as const;
export type VitalName = (typeof VITAL_METRICS)[number];

export async function getVitalsSummary(
  since?: number,
): Promise<VitalsSummary[]> {
  const cutoff = since ?? Date.now() - 24 * 60 * 60 * 1000;

  const results: VitalsSummary[] = [];
  for (const name of VITAL_METRICS) {
    const allSamples = await kvLrange<VitalSample>(kvKey(name), 0, -1);
    const samples = allSamples.filter((s) => s.timestamp >= cutoff);
    const values = samples.map((s) => s.value);
    results.push({
      name,
      p75: percentile(values, 75),
      p90: percentile(values, 90),
      median: percentile(values, 50),
      count: values.length,
      recent: samples.slice(-50),
    });
  }
  return results;
}
