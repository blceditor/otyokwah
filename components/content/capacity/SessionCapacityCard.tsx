"use client";

import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import {
  formatDateRange,
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

const STATUS_MAP: Record<
  CapacityTier,
  { label: string; color: string; barColor: string; bgColor: string }
> = {
  critical: {
    label: "Almost Full!",
    color: "text-red-700",
    barColor: "bg-red-500",
    bgColor: "bg-red-50",
  },
  warning: {
    label: "Filling Fast",
    color: "text-amber-700",
    barColor: "bg-amber-500",
    bgColor: "bg-amber-50",
  },
  available: {
    label: "Spots Available",
    color: "text-green-700",
    barColor: "bg-primary",
    bgColor: "bg-green-50",
  },
};

export function SessionCapacityCard({
  session,
}: {
  session: UltraCampSession;
}) {
  const pct = getCapacityPct(session.totalEnrollment, session.maxTotal);
  const spotsLeft = session.maxTotal - session.totalEnrollment;
  const status = STATUS_MAP[getCapacityTier(pct)];

  return (
    <div className="rounded-xl border border-stone-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-bark">
            {session.plainSessionName}
          </h3>
          <span
            className={`text-xs font-bold uppercase px-2 py-1 rounded-full ${status.bgColor} ${status.color}`}
          >
            {status.label}
          </span>
        </div>

        <p className="text-sm text-bark/60 mb-4">
          {formatDateRange(session.beginDate, session.endDate, { abbrev: true })} &middot;{" "}
          {session.cost}
        </p>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="h-2.5 w-full rounded-full bg-stone-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${status.barColor}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end text-sm">
          <span className={`font-semibold ${status.color}`}>
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </span>
        </div>
      </div>

      <div className="border-t border-stone-100 p-4">
        <a
          href={session.registrationLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`block w-full text-center py-2.5 px-4 rounded-lg font-semibold text-white transition-colors ${
            pct >= 85
              ? "bg-red-600 hover:bg-red-700"
              : "bg-secondary hover:bg-secondary/90"
          }`}
        >
          Register Now
        </a>
      </div>
    </div>
  );
}

export function SessionCapacityCardGrid({
  sessions,
}: {
  sessions: UltraCampSession[];
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-bark mb-2">
          Session Availability
        </h2>
        <p className="text-bark/60">
          Real-time registration data &middot; Updated every 5 minutes
        </p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sessions.map((s) => (
          <SessionCapacityCard key={s.sessionId} session={s} />
        ))}
      </div>
    </div>
  );
}
