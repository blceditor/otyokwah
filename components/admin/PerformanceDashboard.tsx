"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Maximize2, Minimize2 } from "lucide-react";
import type { VitalsSummary } from "@/lib/vitals/store";
import { niceAxisMax } from "@/lib/charts/utils";

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

const SPARK_LINE_COLORS = {
  good: "#22c55e",
  "needs-improvement": "#f59e0b",
  poor: "#ef4444",
};

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function VitalLineChart({
  samples,
  metricName,
  formatFn,
  ratingFn,
  expanded = false,
}: {
  samples: { value: number; timestamp: number }[];
  metricName: string;
  formatFn: (name: string, value: number) => string;
  ratingFn: (name: string, value: number) => "good" | "needs-improvement" | "poor";
  expanded?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (samples.length < 2) return null;

  const W = expanded ? 700 : 400;
  const H = expanded ? 250 : 140;
  const padL = expanded ? 60 : 50;
  const padR = expanded ? 20 : 15;
  const padT = 20;
  const padB = expanded ? 35 : 25;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const fontSize = expanded ? 12 : 10;
  const dotR = expanded ? 5 : 3.5;

  const values = samples.map((s) => s.value);
  const p75Val = percentile(values, 75);
  const p90Val = percentile(values, 90);

  const maxRaw = Math.max(...values, 1);
  const yMax = niceAxisMax(Math.ceil(maxRaw * 1.05));
  const tickCount = expanded ? 5 : 3;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) =>
    Math.round((i * yMax) / tickCount),
  );

  const xStep = plotW / (samples.length - 1);
  const x = (i: number) => padL + i * xStep;
  const y = (v: number) => padT + plotH - (v / yMax) * plotH;

  const points = samples.map((s, i) => `${x(i)},${y(s.value)}`).join(" ");

  const xLabelInterval = expanded
    ? Math.max(1, Math.floor(samples.length / 8))
    : Math.max(1, Math.floor(samples.length / 3));

  const hovered = hoveredIndex !== null ? samples[hoveredIndex] : null;

  return (
    <div className="relative mt-3">
      {/* Floating tooltip */}
      {hovered && hoveredIndex !== null && (
        <div
          className="absolute z-10 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 pointer-events-none shadow-lg whitespace-nowrap"
          style={{
            left: `${(x(hoveredIndex) / W) * 100}%`,
            top: `${Math.max(0, (y(hovered.value) / H) * 100 - 12)}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold">{formatFn(metricName, hovered.value)}</div>
          <div className="opacity-75">
            {new Date(hovered.timestamp).toLocaleString([], {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short",
            })}
          </div>
        </div>
      )}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        aria-label={`${metricName} trend`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Grid lines + Y-axis labels */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={padL} x2={W - padR} y1={y(tick)} y2={y(tick)}
              stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4" />
            <text x={padL - 6} y={y(tick) + 4} textAnchor="end" fontSize={fontSize}
              fill="currentColor" opacity={0.6} fontWeight={500}>
              {metricName === "CLS" ? tick.toFixed(2) : tick}
            </text>
          </g>
        ))}

        {/* p75 reference line */}
        {p75Val > 0 && p75Val < yMax && (
          <g>
            <line x1={padL} x2={W - padR} y1={y(p75Val)} y2={y(p75Val)}
              stroke="#3b82f6" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="6 3" />
            <text x={W - padR + 2} y={y(p75Val) + 3} textAnchor="start" fontSize={fontSize - 2}
              fill="#3b82f6" opacity={0.5} fontWeight={500}>p75</text>
          </g>
        )}

        {/* p90 reference line */}
        {p90Val > 0 && p90Val < yMax && (
          <g>
            <line x1={padL} x2={W - padR} y1={y(p90Val)} y2={y(p90Val)}
              stroke="#f59e0b" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="6 3" />
            <text x={W - padR + 2} y={y(p90Val) + 3} textAnchor="start" fontSize={fontSize - 2}
              fill="#f59e0b" opacity={0.5} fontWeight={500}>p90</text>
          </g>
        )}

        {/* Line */}
        <polyline points={points} fill="none" stroke="#6b7280" strokeWidth={expanded ? 2.5 : 2}
          strokeLinejoin="round" strokeLinecap="round" opacity={0.7} />

        {/* Data points + invisible wider hover targets */}
        {samples.map((s, i) => {
          const rating = ratingFn(metricName, s.value);
          const color = SPARK_LINE_COLORS[rating];
          const isHovered = hoveredIndex === i;
          return (
            <g key={i}>
              {/* Wide invisible hover target */}
              <circle cx={x(i)} cy={y(s.value)} r={expanded ? 12 : 8}
                fill="transparent" className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
              {/* Visible dot */}
              <circle cx={x(i)} cy={y(s.value)} r={isHovered ? dotR + 2 : dotR}
                fill={color} opacity={isHovered ? 1 : 0.9}
                stroke={isHovered ? "white" : "none"} strokeWidth={isHovered ? 2 : 0}
                className="pointer-events-none transition-all duration-100" />
            </g>
          );
        })}

        {/* X-axis labels */}
        {samples.map((s, i) => {
          if (i % xLabelInterval !== 0 && i !== samples.length - 1) return null;
          return (
            <text key={`xl-${i}`} x={x(i)} y={H - (expanded ? 8 : 4)}
              textAnchor="middle" fontSize={fontSize - 1}
              fill="currentColor" opacity={0.55} fontWeight={400}>
              {new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

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
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

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
      <div className={expandedCard ? "space-y-4 mb-8" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"}>
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
          const isExpanded = expandedCard === v.name;
          if (expandedCard && !isExpanded) return null;
          return (
            <div
              key={v.name}
              className={`bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 ${isExpanded ? "col-span-full" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider">
                  {v.name}
                </span>
                <div className="flex items-center gap-2">
                  {rating && (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${RATING_BG[rating]} ${RATING_COLORS[rating]}`}
                    >
                      {RATING_LABELS[rating]}
                    </span>
                  )}
                  {v.count > 0 && (
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : v.name)}
                      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      title={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded
                        ? <Minimize2 className="h-3.5 w-3.5 text-gray-400" />
                        : <Maximize2 className="h-3.5 w-3.5 text-gray-400" />}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-dark-muted mb-1">
                {METRIC_LABELS[v.name]}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted mb-3 leading-snug">
                {METRIC_TOOLTIPS[v.name]}
              </p>
              {v.count > 0 ? (
                <>
                  <div
                    className={`text-3xl font-bold ${rating ? RATING_COLORS[rating] : "text-gray-900 dark:text-dark-text"}`}
                  >
                    {formatVital(v.name, v.p75)}
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-dark-muted flex-wrap">
                    <span>p75</span>
                    <span>p90: {formatVital(v.name, v.p90)}</span>
                    <span>Median: {formatVital(v.name, v.median)}</span>
                    <span>{v.count} samples</span>
                  </div>
                  <VitalLineChart
                    samples={v.recent.slice(isExpanded ? -50 : -30)}
                    metricName={v.name}
                    formatFn={formatVital}
                    ratingFn={getRating}
                    expanded={isExpanded}
                  />
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
