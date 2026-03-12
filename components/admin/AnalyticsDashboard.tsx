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

  const maxDailyValue = Math.max(
    ...data.dailyViews.map((d) => Math.max(d.views, d.users)),
    1,
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

      {/* Daily Views Chart */}
      {data.dailyViews.length > 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 dark:text-dark-muted">
              Daily Page Views
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500 dark:bg-blue-400 opacity-80" />
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  Views
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-400 opacity-80" />
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  Visitors
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {data.dailyViews.map((day) => (
              <div
                key={day.date}
                className="flex flex-col items-center gap-1"
                style={{
                  flex: data.dailyViews.length <= 7 ? "0 0 auto" : "1",
                  width:
                    data.dailyViews.length <= 7
                      ? `${Math.min(100, Math.floor(600 / data.dailyViews.length))}px`
                      : undefined,
                }}
              >
                <span className="text-[10px] text-gray-400 dark:text-dark-muted">
                  {day.views > 0 ? day.views : ""}
                </span>
                <div
                  className="w-full flex items-end gap-1"
                  style={{ height: "100%" }}
                >
                  <div
                    className="flex-1 bg-blue-500 dark:bg-blue-400 rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[4px]"
                    style={{
                      height: `${Math.max((day.views / maxDailyValue) * 100, 4)}%`,
                    }}
                    title={`${formatDate(day.date)}: ${day.views} views`}
                  />
                  <div
                    className="flex-1 bg-green-500 dark:bg-green-400 rounded-t opacity-80 hover:opacity-100 transition-opacity min-h-[4px]"
                    style={{
                      height: `${Math.max((day.users / maxDailyValue) * 100, 4)}%`,
                    }}
                    title={`${formatDate(day.date)}: ${day.users} visitors`}
                  />
                </div>
                <span className="text-[10px] text-gray-400 dark:text-dark-muted">
                  {formatDate(day.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
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
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h2
            className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4 cursor-help"
            title="Breakdown of visitors by device type (desktop, mobile, tablet)"
          >
            Devices
          </h2>
          <div className="space-y-3">
            {(() => {
              const totalDeviceUsers = data.devices.reduce(
                (sum, x) => sum + x.users,
                0,
              );
              return data.devices.map((d) => {
              const pct =
                totalDeviceUsers > 0
                  ? Math.round((d.users / totalDeviceUsers) * 100)
                  : 0;
              return (
                <div key={d.device} className="flex items-center gap-3">
                  <span className="text-gray-400 dark:text-dark-muted">
                    {getDeviceIcon(d.device)}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-dark-text w-20 capitalize">
                    {d.device}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-500 dark:bg-indigo-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-dark-muted w-12 text-right">
                    {pct}%
                  </span>
                </div>
              );
            });
            })()}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
          <h2
            className="text-sm font-medium text-gray-500 dark:text-dark-muted mb-4 cursor-help"
            title="Which web browsers your visitors use"
          >
            Browsers
          </h2>
          <div className="space-y-3">
            {(() => {
              const totalBrowserUsers = data.browsers.reduce(
                (sum, x) => sum + x.users,
                0,
              );
              return data.browsers.slice(0, 6).map((b) => {
              const pct =
                totalBrowserUsers > 0
                  ? Math.round((b.users / totalBrowserUsers) * 100)
                  : 0;
              return (
                <div key={b.browser} className="flex items-center gap-3">
                  <span className="text-sm text-gray-700 dark:text-dark-text w-24 truncate">
                    {b.browser}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green-500 dark:bg-green-400"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-dark-muted w-12 text-right">
                    {pct}%
                  </span>
                </div>
              );
            });
            })()}
          </div>
        </div>
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
