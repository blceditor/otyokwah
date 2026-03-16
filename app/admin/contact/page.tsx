"use client";

import { useState, useCallback, useEffect } from "react";
import { RefreshCw, Mail, Send, Shield, AlertTriangle } from "lucide-react";
import { niceAxisMax } from "@/lib/charts/utils";

function formatLocalTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "";
  }
}

interface ContactMetrics {
  totalLast7Days: number;
  sentToday: number;
  dailyCounts: Record<string, number>;
  recentEmails: {
    id: string;
    to: string[];
    subject: string;
    createdAt: string;
  }[];
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
  };
}

interface SecurityData {
  totalEvents: number;
  counts: {
    turnstile_fail: number;
    spam_domain: number;
    missing_fields: number;
    invalid_email: number;
    success: number;
    rate_limited: number;
    spam_content: number;
    bot_timing: number;
    plus_alias: number;
  };
  recentEvents: {
    timestamp: string;
    type: string;
    email?: string;
    ip: string;
    detail?: string;
  }[];
}

const EVENT_LABELS: Record<string, string> = {
  turnstile_fail: "Turnstile Blocks",
  spam_domain: "Spam Domain Blocks",
  missing_fields: "Missing Fields",
  invalid_email: "Invalid Email",
  success: "Successful Sends",
};

const EVENT_COLORS: Record<string, string> = {
  turnstile_fail: "text-red-600 dark:text-red-400",
  spam_domain: "text-orange-600 dark:text-orange-400",
  missing_fields: "text-yellow-600 dark:text-yellow-400",
  invalid_email: "text-yellow-600 dark:text-yellow-400",
  success: "text-green-600 dark:text-green-400",
};

function SummaryCard({
  label,
  value,
  subtext,
  icon,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500 dark:text-dark-muted">
          {label}
        </span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-dark-text">
        {value}
      </div>
      <div className="text-xs text-gray-400 dark:text-dark-muted mt-1">
        {subtext}
      </div>
    </div>
  );
}

export default function AdminContactPage() {
  const [metrics, setMetrics] = useState<ContactMetrics | null>(null);
  const [security, setSecurity] = useState<SecurityData | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    setMetricsError(null);
    try {
      const [metricsRes, securityRes] = await Promise.all([
        fetch("/api/admin/contact-metrics"),
        fetch("/api/contact"),
      ]);

      if (metricsRes.ok) {
        const data: ContactMetrics = await metricsRes.json();
        setMetrics(data);
      } else {
        const err = await metricsRes.json();
        setMetricsError(err.error || "Failed to load metrics");
      }

      if (securityRes.ok) {
        const data: SecurityData = await securityRes.json();
        setSecurity(data);
      }
    } catch {
      setMetricsError("Failed to fetch data");
    } finally {
      setIsRefreshing(false);
      setLastRefreshed(new Date());
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const dailyEntries = metrics
    ? Object.entries(metrics.dailyCounts).sort(([a], [b]) =>
        a.localeCompare(b)
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Contact Emails Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Resend delivery metrics and security events — {getTimezone()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-dark-muted">
            Last updated:{" "}
            {lastRefreshed.toLocaleString([], {
              hour: "2-digit",
              minute: "2-digit",
              timeZoneName: "short",
            })}
          </span>
          <button
            onClick={() => void fetchData()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white/10 text-white text-sm rounded-lg hover:bg-gray-800 dark:hover:bg-white/20 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {metricsError && (
        <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>{metricsError}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Sent Today"
          value={metrics?.sentToday ?? "—"}
          subtext={`of ${metrics?.limits.dailyLimit ?? 100} daily limit`}
          icon={<Send className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
        />
        <SummaryCard
          label="Last 7 Days"
          value={metrics?.totalLast7Days ?? "—"}
          subtext="emails delivered"
          icon={<Mail className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />}
        />
        <SummaryCard
          label="Daily Limit"
          value={metrics?.limits.dailyLimit ?? 100}
          subtext="Resend free tier"
          icon={
            <div className="h-5 w-5 rounded-full bg-green-500" />
          }
        />
        <SummaryCard
          label="Monthly Limit"
          value={metrics?.limits.monthlyLimit ?? 3000}
          subtext="Resend free tier"
          icon={<Shield className="h-5 w-5 text-purple-500 dark:text-purple-400" />}
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* 7-Day Line Chart */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-4">
            Emails Sent — Last 7 Days
          </h2>
          {dailyEntries.length > 0 ? (() => {
            const maxVal = Math.max(...dailyEntries.map(([, c]) => c), 1);
            const yMax = niceAxisMax(Math.ceil(maxVal * 1.05));
            const ticks = Array.from({ length: 4 }, (_, i) => Math.round((i * yMax) / 3));
            const W = 300, H = 130, pL = 35, pR = 10, pT = 8, pB = 22;
            const pW = W - pL - pR, pH = H - pT - pB;
            const n = dailyEntries.length;
            const xStep = n > 1 ? pW / (n - 1) : pW;
            const xPos = (i: number) => pL + (n > 1 ? i * xStep : pW / 2);
            const yPos = (v: number) => pT + pH - (v / yMax) * pH;
            const pts = dailyEntries.map(([, c], i) => `${xPos(i)},${yPos(c)}`).join(" ");
            return (
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" aria-label="Emails sent chart">
                {ticks.map((t) => (
                  <g key={t}>
                    <line x1={pL} x2={W - pR} y1={yPos(t)} y2={yPos(t)}
                      stroke="currentColor" strokeOpacity={0.15} strokeDasharray="3 3" />
                    <text x={pL - 4} y={yPos(t) + 3} textAnchor="end" fontSize={10}
                      fill="currentColor" opacity={0.6} fontWeight={500}>{t}</text>
                  </g>
                ))}
                <polyline points={pts} fill="none" stroke="#3b82f6" strokeWidth={2}
                  strokeLinejoin="round" strokeLinecap="round" />
                {dailyEntries.map(([date, count], i) => {
                  const label = new Date(date + "T12:00:00").toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
                  return (
                    <g key={date}>
                      <circle cx={xPos(i)} cy={yPos(count)} r={4} fill="#3b82f6" opacity={0.9}>
                        <title>{`${label}: ${count} emails`}</title>
                      </circle>
                      <text x={xPos(i)} y={H - 5} textAnchor="middle" fontSize={10}
                        fill="currentColor" opacity={0.6} fontWeight={500}>
                        {new Date(date + "T12:00:00").toLocaleDateString([], { weekday: "short" })}
                      </text>
                    </g>
                  );
                })}
              </svg>
            );
          })() : (
            <div className="h-32 flex items-center justify-center text-sm text-gray-400 dark:text-dark-muted">
              No data available
            </div>
          )}
        </div>

        {/* Security Counts */}
        <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-dark-text mb-4">
            Security Events — All Time
          </h2>
          {security ? (
            <div className="space-y-3">
              {Object.entries(EVENT_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-dark-muted">
                    {label}
                  </span>
                  <span
                    className={`text-sm font-semibold ${EVENT_COLORS[type] ?? "text-gray-600 dark:text-dark-text"}`}
                  >
                    {security.counts[type as keyof typeof security.counts] ?? 0}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-100 dark:border-dark-border flex items-center justify-between">
                <span className="text-xs text-gray-400 dark:text-dark-muted">
                  Total events logged
                </span>
                <span className="text-xs font-medium text-gray-600 dark:text-dark-muted">
                  {security.totalEvents}
                </span>
              </div>
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-gray-400 dark:text-dark-muted">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Emails */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-x-auto mb-6">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-dark-text">
            Recent Emails
          </h2>
        </div>
        {metrics?.recentEmails && metrics.recentEmails.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-6 py-3">
                  To
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-3">
                  Subject
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-3">
                  Sent
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {metrics.recentEmails.map((email) => (
                <tr
                  key={email.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-3 text-sm text-gray-600 dark:text-dark-muted font-mono">
                    {email.to.join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800 dark:text-dark-text">
                    {email.subject}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-dark-muted whitespace-nowrap">
                    {formatLocalTime(email.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-sm text-gray-400 dark:text-dark-muted text-center">
            {metricsError ? "Could not load email list" : "No emails found"}
          </div>
        )}
      </div>

      {/* Recent Security Events */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-x-auto">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-dark-text">
            Recent Security Events
          </h2>
        </div>
        {security?.recentEvents && security.recentEvents.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-6 py-3">
                  Time
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-3">
                  Type
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider px-4 py-3">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {security.recentEvents.map((event, i) => (
                <tr
                  key={i}
                  className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-3 text-xs text-gray-400 dark:text-dark-muted whitespace-nowrap">
                    {formatLocalTime(event.timestamp)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-medium ${EVENT_COLORS[event.type] ?? "text-gray-600 dark:text-dark-text"}`}
                    >
                      {EVENT_LABELS[event.type] ?? event.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-dark-muted font-mono">
                    {event.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 dark:text-dark-muted font-mono">
                    {event.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-sm text-gray-400 dark:text-dark-muted text-center">
            No security events logged yet
          </div>
        )}
      </div>
    </div>
  );
}
