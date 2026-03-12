"use client";

import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import {
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

const BADGE_COLORS: Record<CapacityTier, { dotColor: string; textColor: string }> = {
  critical: { dotColor: "bg-red-500", textColor: "text-red-700" },
  warning: { dotColor: "bg-amber-500", textColor: "text-amber-700" },
  available: { dotColor: "bg-green-500", textColor: "text-green-700" },
};

function getBadgeLabel(tier: CapacityTier, spotsLeft: number): string {
  if (tier === "critical") {
    return spotsLeft <= 5 ? `Only ${spotsLeft} left!` : "Almost Full!";
  }
  return `${spotsLeft} spots left`;
}

export function SessionCapacityBadge({
  session,
  variant = "inline",
}: {
  session: UltraCampSession;
  variant?: "inline" | "pill";
}) {
  const pct = getCapacityPct(session.totalEnrollment, session.maxTotal);
  const spotsLeft = session.maxTotal - session.totalEnrollment;
  const tier = getCapacityTier(pct);
  const colors = BADGE_COLORS[tier];
  const label = getBadgeLabel(tier, spotsLeft);

  if (!session.open) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500">
        <span className="h-2 w-2 rounded-full bg-stone-400" />
        Session Closed
      </span>
    );
  }

  if (variant === "pill") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${colors.textColor} bg-white/80 border border-current/20`}
      >
        <span className={`h-2 w-2 rounded-full ${colors.dotColor}`} />
        {label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${colors.textColor}`}
    >
      <span className={`h-2 w-2 rounded-full ${colors.dotColor}`} />
      {label}
    </span>
  );
}
