"use client";

import { useState, useCallback } from "react";
import {
  RefreshCw,
  Eye,
  Users,
  Clock,
  MousePointerClick,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import type { AnalyticsSummary } from "@/lib/google-analytics/client";
import { niceAxisMax } from "@/lib/charts/utils";

type DateRange = 7 | 30 | 90;

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

function formatDate(dateStr: string): string {
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  const date = new Date(`${y}-${m}-${d}`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDeviceIcon(device: string) {
  switch (device.toLowerCase()) {
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "tablet":
      return <Tablet className="h-4 w-4" />;
    default:
      return <Monitor className="h-4 w-4" />;
  }
}

interface AnalyticsDashboardProps {
  initialData: AnalyticsSummary;
}

function getYAxisTicks(max: number): number[] {
  const tickCount = 5;
  const step = max / tickCount;
  return Array.from({ length: tickCount + 1 }, (_, i) => Math.round(i * step));
}

function DailyViewsChart({
  dailyViews,
  formatDate: fmtDate,
}: {
  dailyViews: { date: string; views: number; users: number }[];
  formatDate: (s: string) => string;
}) {
  const maxRaw = Math.max(...dailyViews.map((d) => Math.max(d.views, d.users)), 1);
  const yMax = niceAxisMax(Math.ceil(maxRaw * 1.05));
  const ticks = getYAxisTicks(yMax);

  const chartW = 600;
  const chartH = 200;
  const padL = 50;
  const padR = 20;
  const padT = 10;
  const padB = 30;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  const n = dailyViews.length;
  const xStep = n > 1 ? plotW / (n - 1) : plotW;

  function x(i: number) { return padL + (n > 1 ? i * xStep : plotW / 2); }
  function y(v: number) { return padT + plotH - (v / yMax) * plotH; }

  function polyline(key: "views" | "users") {
    return dailyViews.map((d, i) => `${x(i)},${y(d[key])}`).join(" ");
  }

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
          Daily Page Views
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-400 opacity-80" />
            <span className="text-xs text-gray-400 dark:text-dark-muted">Views</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400 opacity-80" />
            <span className="text-xs text-gray-400 dark:text-dark-muted">Visitors</span>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" aria-label="Daily page views chart">
        {/* Grid lines + Y-axis labels */}
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padL} x2={chartW - padR}
              y1={y(tick)} y2={y(tick)}
              stroke="currentColor" strokeOpacity={0.15} strokeDasharray="4 4"
            />
            <text
              x={padL - 8} y={y(tick) + 3}
              textAnchor="end" fontSize={11}
              fill="currentColor" opacity={0.6} fontWeight={500}
            >
              {tick}
            </text>
          </g>
        ))}

        {/* Views line */}
        <polyline
          points={polyline("views")}
          fill="none" stroke="#3b82f6" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round"
        />
        {/* Views dots */}
        {dailyViews.map((d, i) => (
          <circle key={`v-${i}`} cx={x(i)} cy={y(d.views)} r={4}
            fill="#3b82f6" opacity={0.9}>
            <title>{`${fmtDate(d.date)}: ${d.views} views`}</title>
          </circle>
        ))}

        {/* Visitors line */}
        <polyline
          points={polyline("users")}
          fill="none" stroke="#22c55e" strokeWidth={2.5}
          strokeLinejoin="round" strokeLinecap="round"
        />
        {/* Visitors dots */}
        {dailyViews.map((d, i) => (
          <circle key={`u-${i}`} cx={x(i)} cy={y(d.users)} r={4}
            fill="#22c55e" opacity={0.9}>
            <title>{`${fmtDate(d.date)}: ${d.users} visitors`}</title>
          </circle>
        ))}

        {/* X-axis labels */}
        {dailyViews.map((d, i) => (
          <text key={`x-${i}`}
            x={x(i)} y={chartH - 5}
            textAnchor="middle" fontSize={11}
            fill="currentColor" opacity={0.6} fontWeight={500}
          >
            {fmtDate(d.date)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function AnalyticsDashboard({ initialData }: AnalyticsDashboardProps) {
  const [data, setData] = useState(initialData);
  const [days, setDays] = useState<DateRange>(7);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchData = useCallback(async (range: DateRange) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/analytics/ga4?days=${range}`);
      if (res.ok) {
        const newData: AnalyticsSummary = await res.json();
        setData(newData);
        setLastRefreshed(new Date());
      }
    } catch {
      // Keep showing last data
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRangeChange = useCallback(
    (range: DateRange) => {
      setDays(range);
      fetchData(range);
    },
    [fetchData],
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Site Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Website traffic and engagement from Google Analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date range picker */}
          <div className="flex items-center bg-gray-100 dark:bg-dark-surface rounded-lg p-0.5">
            {([7, 30, 90] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => handleRangeChange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  days === range
                    ? "bg-white dark:bg-dark-border text-gray-900 dark:text-dark-text shadow-sm"
                    : "text-gray-500 dark:text-dark-muted hover:text-gray-700 dark:hover:text-dark-text"
                }`}
              >
                {range}d
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-dark-muted">
            {lastRefreshed.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={() => fetchData(days)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white/10 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Page Views"
          value={formatNumber(data.totalPageViews)}
          icon={<Eye className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
          tooltip="Total number of pages viewed, including repeated views of the same page"
        />
        <SummaryCard
          label="Visitors"
          value={formatNumber(data.totalUsers)}
          icon={
            <Users className="h-5 w-5 text-green-500 dark:text-green-400" />
          }
          tooltip="Unique users who visited the site (deduplicated by browser/device)"
        />
        <SummaryCard
          label="Sessions"
          value={formatNumber(data.totalSessions)}
          icon={
            <Globe className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
          }
          tooltip="Total visits to the site — one user can have multiple sessions"
        />
        <SummaryCard
          label="Avg. Duration"
          value={formatDuration(data.avgSessionDuration)}
          icon={
            <Clock className="h-5 w-5 text-amber-500 dark:text-amber-400" />
          }
          tooltip="Average time a visitor spends on the site per session"
        />
      </div>

      {/* Daily Views Line Chart */}
      {data.dailyViews.length > 0 && (
        <DailyViewsChart dailyViews={data.dailyViews} formatDate={formatDate} />
      )}

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Top Pages */}
        <DataTable
          title="Top Pages"
          headers={["Page", "Views", "Visitors"]}
          rows={data.topPages.map((p) => [
            p.page,
            formatNumber(p.views),
            formatNumber(p.users),
          ])}
          tooltip="Most visited pages ranked by total page views"
        />

        {/* Referrers */}
        <DataTable
          title="Traffic Sources"
          headers={["Source", "Sessions", "Visitors"]}
          rows={data.referrers.map((r) => [
            r.source,
            formatNumber(r.sessions),
            formatNumber(r.users),
          ])}
          tooltip="Where your visitors came from (search engines, social media, direct visits, etc.)"
        />

        {/* Devices */}
        <BarCard
          title="Devices"
          tooltip="Breakdown of visitors by device type (desktop, mobile, tablet)"
          items={data.devices.map((d) => ({
            label: d.device,
            users: d.users,
            icon: (
              <span className="text-gray-400 dark:text-dark-muted">
                {getDeviceIcon(d.device)}
              </span>
            ),
          }))}
          barColor="bg-indigo-500 dark:bg-indigo-400"
          labelWidth="w-20"
          capitalize
        />

        {/* Browsers */}
        <BarCard
          title="Browsers"
          tooltip="Which web browsers your visitors use"
          items={data.browsers.slice(0, 6).map((b) => ({
            label: b.browser,
            users: b.users,
          }))}
          barColor="bg-green-500 dark:bg-green-400"
          labelWidth="w-24 truncate"
        />
      </div>

      {/* CTA Clicks */}
      {data.ctaClicks.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-8">
          <h2
            className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4 flex items-center gap-2 cursor-help"
            title="Clicks on Call-to-Action buttons tracked via the cta_click custom event"
          >
            <MousePointerClick className="h-4 w-4" />
            CTA Button Clicks
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-2">
                  Button
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-2">
                  Destination
                </th>
                <th className="text-right text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-2">
                  Clicks
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {data.ctaClicks.map((cta, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text font-medium">
                    {cta.label}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500 dark:text-dark-muted truncate max-w-xs">
                    {cta.href}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-dark-text font-medium text-right">
                    {cta.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Journey */}
      {(data.landingPages?.length > 0 || data.pageFlow?.length > 0) && (
        <div className="grid grid-cols-2 gap-6 mb-8">
          {data.landingPages?.length > 0 && (
            <DataTable
              title="Top Landing Pages"
              headers={["Entry Page", "Sessions", "Visitors"]}
              rows={data.landingPages.map((p) => [
                p.page,
                formatNumber(p.sessions),
                formatNumber(p.users),
              ])}
              tooltip="The first page visitors see when they arrive at the site"
            />
          )}

          {data.pageFlow?.length > 0 && (
            <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
              <h2 className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4">
                Page Engagement
                <span
                  className="ml-1.5 inline-block text-[10px] text-gray-400 dark:text-dark-muted font-normal cursor-help"
                  title="Bounce rate = % of sessions where the user viewed only this page and left without interaction"
                >
                  (?)
                </span>
              </h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider px-3 py-2">
                      Page
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider px-3 py-2">
                      Sessions
                    </th>
                    <th className="text-right text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider px-3 py-2">
                      Bounce Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
                  {data.pageFlow.map((p, i) => (
                    <tr
                      key={i}
                      className="hover:bg-gray-50 dark:hover:bg-white/5"
                    >
                      <td className="px-3 py-2 text-sm text-gray-900 dark:text-dark-text truncate max-w-xs">
                        {p.page}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500 dark:text-dark-muted text-right">
                        {formatNumber(p.sessions)}
                      </td>
                      <td className="px-3 py-2 text-sm text-right">
                        <span
                          className={
                            p.bounceRate > 0.7
                              ? "text-red-500"
                              : p.bounceRate > 0.4
                                ? "text-amber-500"
                                : "text-green-500"
                          }
                        >
                          {(p.bounceRate * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Countries */}
      {data.countries.length > 0 && (
        <DataTable
          title="Top Countries"
          headers={["Country", "Visitors"]}
          rows={data.countries.map((c) => [c.country, formatNumber(c.users)])}
          tooltip="Geographic breakdown of where your visitors are located"
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  tooltip,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tooltip?: string;
}) {
  return (
    <div
      className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5"
      title={tooltip}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-dark-muted cursor-help">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-dark-text">
        {value}
      </div>
    </div>
  );
}

function DataTable({
  title,
  headers,
  rows,
  tooltip,
}: {
  title: string;
  headers: string[];
  rows: string[][];
  tooltip?: string;
}) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
      <h2
        className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4 cursor-help"
        title={tooltip}
      >
        {title}
      </h2>
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-dark-border">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`text-xs font-medium text-gray-400 dark:text-dark-muted uppercase tracking-wider px-3 py-2 ${
                  i === 0 ? "text-left" : "text-right"
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-white/5">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`px-3 py-2 text-sm ${
                    j === 0
                      ? "text-gray-900 dark:text-dark-text truncate max-w-xs"
                      : "text-gray-500 dark:text-dark-muted text-right"
                  }`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BarCard({
  title,
  tooltip,
  items,
  barColor,
  labelWidth,
  capitalize: cap,
}: {
  title: string;
  tooltip?: string;
  items: { label: string; users: number; icon?: React.ReactNode }[];
  barColor: string;
  labelWidth: string;
  capitalize?: boolean;
}) {
  const total = items.reduce((sum, x) => sum + x.users, 0);
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
      <h2
        className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4 cursor-help"
        title={tooltip}
      >
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const pct = total > 0 ? Math.round((item.users / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center gap-3">
              {item.icon}
              <span
                className={`text-sm text-gray-700 dark:text-dark-text ${labelWidth}${cap ? " capitalize" : ""}`}
              >
                {item.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-dark-muted w-12 text-right">
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
