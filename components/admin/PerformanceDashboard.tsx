"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import type { VitalsSummary } from "@/lib/vitals/store";

interface DeploymentInfo {
  status: string;
  state: string;
  timestamp: number | null;
}

const THRESHOLDS: Record<string, { good: number; poor: number; unit: string }> =
  {
    LCP: { good: 2500, poor: 4000, unit: "ms" },
    FCP: { good: 1800, poor: 3000, unit: "ms" },
    CLS: { good: 0.1, poor: 0.25, unit: "" },
    INP: { good: 200, poor: 500, unit: "ms" },
    TTFB: { good: 800, poor: 1800, unit: "ms" },
  };

const METRIC_LABELS: Record<string, string> = {
  LCP: "Largest Contentful Paint",
  FCP: "First Contentful Paint",
  CLS: "Cumulative Layout Shift",
  INP: "Interaction to Next Paint",
  TTFB: "Time to First Byte",
};

const METRIC_TOOLTIPS: Record<string, string> = {
  LCP: "How long until the largest visible element (hero image, heading) finishes loading. Target: under 2.5s",
  FCP: "How long until the first text or image appears on screen. Target: under 1.8s",
  CLS: "How much the page layout shifts unexpectedly while loading (0 = no shifts). Target: under 0.1",
  INP: "How long the page takes to respond after a user clicks or taps. Target: under 200ms",
  TTFB: "How long the server takes to send the first byte of the page. Target: under 800ms",
};

function getRating(
  name: string,
  value: number,
): "good" | "needs-improvement" | "poor" {
  const t = THRESHOLDS[name];
  if (!t) return "needs-improvement";
  if (value <= t.good) return "good";
  if (value <= t.poor) return "needs-improvement";
  return "poor";
}

function formatVital(name: string, value: number): string {
  if (name === "CLS") return value.toFixed(3);
  return `${Math.round(value)}ms`;
}

const RATING_COLORS = {
  good: "text-green-600 dark:text-green-400",
  "needs-improvement": "text-amber-600 dark:text-amber-400",
  poor: "text-red-600 dark:text-red-400",
};

const RATING_BG = {
  good: "bg-green-100 dark:bg-green-900/30",
  "needs-improvement": "bg-amber-100 dark:bg-amber-900/30",
  poor: "bg-red-100 dark:bg-red-900/30",
};

const RATING_LABELS = {
  good: "Good",
  "needs-improvement": "Needs Improvement",
  poor: "Poor",
};

const DEPLOY_STATE_STYLES: Record<string, { badge: string; dot: string }> = {
  Published: {
    badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    dot: "bg-green-500",
  },
  Deploying: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    dot: "bg-amber-500 animate-pulse",
  },
};

const DEPLOY_STATE_DEFAULT = {
  badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  dot: "bg-red-500",
};

const SPARK_COLORS = {
  good: "bg-green-400/60",
  "needs-improvement": "bg-amber-400/60",
  poor: "bg-red-400/60",
};

function DeploymentStateBadge({ state }: { state: string }) {
  const styles = DEPLOY_STATE_STYLES[state] ?? DEPLOY_STATE_DEFAULT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${styles.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
      {state}
    </span>
  );
}

export function PerformanceDashboard() {
  const [vitals, setVitals] = useState<VitalsSummary[]>([]);
  const [deployment, setDeployment] = useState<DeploymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vitalsRes, deployRes] = await Promise.all([
        fetch("/api/vitals"),
        fetch("/api/vercel-status"),
      ]);
      if (vitalsRes.ok) setVitals(await vitalsRes.json());
      if (deployRes.ok) setDeployment(await deployRes.json());
    } catch {
      // keep last data
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Site Performance
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Core Web Vitals and deployment status
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white/10 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white/20 disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-900 dark:focus-visible:ring-white"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Deployment Info */}
      {deployment && !("error" in deployment) && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-8">
          <h2 className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-3">
            Latest Production Deployment
          </h2>
          <div className="flex items-center gap-4">
            <DeploymentStateBadge state={deployment.state} />
            {deployment.timestamp && (
              <span className="text-sm text-gray-500 dark:text-dark-muted">
                {new Date(deployment.timestamp).toLocaleString()}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {isLoading && vitals.length === 0 && Object.keys(METRIC_LABELS).map((name) => (
          <div
            key={name}
            className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 animate-pulse"
          >
            <div className="text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-1">
              {name}
            </div>
            <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
              {METRIC_LABELS[name]}
            </p>
            <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-24" />
          </div>
        ))}
        {vitals.map((v) => {
          const rating = v.count > 0 ? getRating(v.name, v.p75) : null;
          return (
            <div
              key={v.name}
              className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 cursor-help"
              title={METRIC_TOOLTIPS[v.name]}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider">
                  {v.name}
                </span>
                {rating && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${RATING_BG[rating]} ${RATING_COLORS[rating]}`}
                  >
                    {RATING_LABELS[rating]}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
                {METRIC_LABELS[v.name]}
              </p>
              {v.count > 0 ? (
                <>
                  <div
                    className={`text-3xl font-bold ${rating ? RATING_COLORS[rating] : "text-gray-900 dark:text-dark-text"}`}
                  >
                    {formatVital(v.name, v.p75)}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-dark-muted">
                    <span>p75</span>
                    <span>Median: {formatVital(v.name, v.median)}</span>
                    <span>{v.count} samples</span>
                  </div>
                  {/* Mini sparkline */}
                  {v.recent.length > 1 && (() => {
                    const spark = v.recent.slice(-30);
                    const sparkMax = Math.max(...spark.map((r) => r.value), 1);
                    return (
                    <div className="flex items-end gap-px h-8 mt-3">
                      {spark.map((s, i) => {
                        const height = Math.max((s.value / sparkMax) * 100, 5);
                        const sRating = getRating(v.name, s.value);
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-t ${SPARK_COLORS[sRating]}`}
                            style={{ height: `${height}%` }}
                            title={`${formatVital(v.name, s.value)} at ${new Date(s.timestamp).toLocaleTimeString()}`}
                          />
                        );
                      })}
                    </div>
                    );
                  })()}
                </>
              ) : (
                <div className="text-sm text-gray-400 dark:text-dark-muted mt-2">
                  No data yet. Browse the site to collect samples.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Thresholds Reference */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
        <h2 className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4">
          Thresholds Reference (Google)
        </h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-border">
              <th className="text-left text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider px-3 py-2">
                Metric
              </th>
              <th className="text-right text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider px-3 py-2">
                Good
              </th>
              <th className="text-right text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider px-3 py-2">
                Needs Work
              </th>
              <th className="text-right text-xs font-medium text-red-600 dark:text-red-400 uppercase tracking-wider px-3 py-2">
                Poor
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {Object.entries(THRESHOLDS).map(([name, t]) => (
              <tr key={name}>
                <td className="px-3 py-2 text-sm text-gray-900 dark:text-dark-text font-medium">
                  {name}
                </td>
                <td className="px-3 py-2 text-sm text-right text-green-600 dark:text-green-400">
                  ≤{t.unit ? `${t.good}${t.unit}` : t.good}
                </td>
                <td className="px-3 py-2 text-sm text-right text-amber-600 dark:text-amber-400">
                  ≤{t.unit ? `${t.poor}${t.unit}` : t.poor}
                </td>
                <td className="px-3 py-2 text-sm text-right text-red-600 dark:text-red-400">
                  &gt;{t.unit ? `${t.poor}${t.unit}` : t.poor}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
