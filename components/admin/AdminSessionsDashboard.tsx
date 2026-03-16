"use client";

import { useState, useCallback, useMemo } from "react";
import {
  RefreshCw,
  BedDouble,
  Users,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from "lucide-react";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import {
  formatDateRange,
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

type SortKey =
  | "name"
  | "date"
  | "enrollment"
  | "boys"
  | "girls"
  | "waitlist"
  | "status";
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<CapacityTier, string> = {
  critical: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  available: "text-green-600 dark:text-green-400",
};

const BAR_COLORS: Record<CapacityTier, string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  available: "bg-green-500",
};

const STATUS_LABELS: Record<CapacityTier, string | null> = {
  critical: "Almost Full",
  warning: "Filling Fast",
  available: null,
};

function getEnrollPct(s: UltraCampSession): number {
  return getCapacityPct(s.totalEnrollment, s.maxTotal);
}

function getSortValue(s: UltraCampSession, key: SortKey): number | string {
  switch (key) {
    case "name":
      return s.plainSessionName.toLowerCase();
    case "date":
      return new Date(s.beginDate).getTime();
    case "enrollment":
      return getEnrollPct(s);
    case "boys":
      return s.maxMales > 0 ? s.maleEnrollment / s.maxMales : 0;
    case "girls":
      return s.maxFemales > 0 ? s.femaleEnrollment / s.maxFemales : 0;
    case "waitlist":
      return s.totalWaitListCount;
    case "status":
      return getEnrollPct(s);
    default:
      return 0;
  }
}

interface AdminSessionsDashboardProps {
  initialSessions: UltraCampSession[];
}

export function AdminSessionsDashboard({
  initialSessions,
}: AdminSessionsDashboardProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ultracamp/sessions");
      if (res.ok) {
        const data: UltraCampSession[] = await res.json();
        if (data.length > 0) {
          setSessions(data);
          setLastRefreshed(new Date());
        }
      }
    } catch {
      // Keep showing last data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey],
  );

  const sortedSessions = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => {
      const aVal = getSortValue(a, sortKey);
      const bVal = getSortValue(b, sortKey);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      const diff = (aVal as number) - (bVal as number);
      return sortDir === "asc" ? diff : -diff;
    });
    return sorted;
  }, [sessions, sortKey, sortDir]);

  const totalEnrolled = sessions.reduce(
    (sum, s) => sum + s.totalEnrollment,
    0,
  );
  const totalCapacity = sessions.reduce((sum, s) => sum + s.maxTotal, 0);
  const totalWaitlist = sessions.reduce(
    (sum, s) => sum + s.totalWaitListCount,
    0,
  );
  const overallPct =
    totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            Camp Sessions Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
            Summer 2026 — Live enrollment data from UltraCamp
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 dark:text-dark-muted">
            Last updated:{" "}
            {lastRefreshed.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={refresh}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <SummaryCard
          label="Total Enrolled"
          value={totalEnrolled}
          subtext={`of ${totalCapacity} capacity`}
          icon={<Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
        />
        <SummaryCard
          label="Overall Fill"
          value={`${overallPct}%`}
          subtext={`${totalCapacity - totalEnrolled} spots remaining`}
          icon={
            <div
              className={`h-5 w-5 rounded-full ${BAR_COLORS[getCapacityTier(overallPct)]}`}
            />
          }
        />
        <SummaryCard
          label="Sessions"
          value={sessions.length}
          subtext="active sessions"
          icon={<BedDouble className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />}
        />
        <SummaryCard
          label="Waitlisted"
          value={totalWaitlist}
          subtext={totalWaitlist > 0 ? "across all sessions" : "no waitlists"}
          icon={<AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />}
        />
      </div>

      {/* Sessions Table */}
      <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg">
              <SortHeader
                label="Session"
                sortKey="name"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
                className="px-6"
              />
              <SortHeader
                label="Dates"
                sortKey="date"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Enrollment"
                sortKey="enrollment"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Boys"
                sortKey="boys"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Girls"
                sortKey="girls"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Waitlist"
                sortKey="waitlist"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Status"
                sortKey="status"
                currentKey={sortKey}
                currentDir={sortDir}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
            {sortedSessions.map((session) => (
              <SessionRow key={session.sessionId} session={session} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === sortKey;
  return (
    <th
      className={`text-left text-xs font-medium text-gray-500 dark:text-dark-muted uppercase tracking-wider ${className || "px-4"} py-3 cursor-pointer select-none hover:text-gray-700 dark:hover:text-dark-text transition-colors`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-30" />
        )}
      </div>
    </th>
  );
}

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
        <span className="text-sm font-medium text-gray-500 dark:text-dark-muted">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-dark-text">{value}</div>
      <div className="text-xs text-gray-400 dark:text-dark-muted mt-1">{subtext}</div>
    </div>
  );
}

function SessionRow({ session }: { session: UltraCampSession }) {
  const pct = getEnrollPct(session);
  const malePct = getCapacityPct(session.maleEnrollment, session.maxMales);
  const femalePct = getCapacityPct(session.femaleEnrollment, session.maxFemales);
  const statusLabel = STATUS_LABELS[getCapacityTier(pct)];

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 dark:text-dark-text">
          {session.plainSessionName}
        </div>
        <div className="text-xs text-gray-400 dark:text-dark-muted">{session.cost}</div>
      </td>
      <td className="px-4 py-4 text-sm text-gray-600 dark:text-dark-muted">
        {formatDateRange(session.beginDate, session.endDate, { abbrev: true, includeYear: false })}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-24 h-2 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${BAR_COLORS[getCapacityTier(pct)]}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <span className={`text-sm font-medium ${STATUS_COLORS[getCapacityTier(pct)]}`}>
            {session.totalEnrollment}/{session.maxTotal}
          </span>
        </div>
      </td>
      <td className="px-4 py-4">
        <MiniBar
          current={session.maleEnrollment}
          max={session.maxMales}
          pct={malePct}
        />
      </td>
      <td className="px-4 py-4">
        <MiniBar
          current={session.femaleEnrollment}
          max={session.maxFemales}
          pct={femalePct}
        />
      </td>
      <td className="px-4 py-4">
        {session.totalWaitListCount > 0 ? (
          <span className="inline-flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400 font-medium">
            {session.totalWaitListCount}
          </span>
        ) : (
          <span className="text-sm text-gray-300 dark:text-dark-border">—</span>
        )}
      </td>
      <td className="px-4 py-4">
        {statusLabel ? (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
              getCapacityTier(pct) === "critical"
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${getCapacityTier(pct) === "critical" ? "bg-red-500 animate-pulse" : "bg-amber-500"}`}
            />
            {statusLabel}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Open
          </span>
        )}
      </td>
    </tr>
  );
}

function MiniBar({
  current,
  max,
  pct,
}: {
  current: number;
  max: number;
  pct: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-dark-border overflow-hidden">
        <div
          className={`h-full rounded-full ${BAR_COLORS[getCapacityTier(pct)]}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-dark-muted">
        {current}/{max}
      </span>
    </div>
  );
}
