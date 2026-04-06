import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import {
  formatDateRange,
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

const BAR_COLORS: Record<CapacityTier, string> = {
  critical: "bg-red-400",
  warning: "bg-amber-400",
  available: "bg-green-400",
};

function getOverallStatusPill(session: UltraCampSession) {
  const overallPct = getCapacityPct(session.totalEnrollment, session.maxTotal);
  const boysPct = getCapacityPct(session.maleEnrollment, session.maxMales);
  const girlsPct = getCapacityPct(session.femaleEnrollment, session.maxFemales);
  const hasWaitlist = session.totalWaitListCount > 0;

  const boysSpots = session.maxMales - session.maleEnrollment;
  const girlsSpots = session.maxFemales - session.femaleEnrollment;
  const boysWaitlist = boysPct >= 100 || (hasWaitlist && boysSpots <= session.totalWaitListCount);
  const girlsWaitlist = girlsPct >= 100 || (hasWaitlist && girlsSpots <= session.totalWaitListCount);
  const eitherGenderWaitlist = boysWaitlist || girlsWaitlist;
  const isEffectivelyFull = boysWaitlist && girlsWaitlist;

  // Use the worst of overall, boys, or girls percentage to determine tier;
  // also escalate if there's a waitlist (people are already being turned away)
  const worstPct = Math.max(overallPct, boysPct, girlsPct);
  const tier = hasWaitlist ? "critical" : getCapacityTier(worstPct);

  if (isEffectivelyFull) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase bg-red-500/30 text-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300 animate-pulse" />
        Waitlist
      </span>
    );
  }
  if (eitherGenderWaitlist || tier === "critical") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase bg-amber-500/30 text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300 animate-pulse" />
        Filling Fast
      </span>
    );
  }
  if (tier === "warning") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase bg-amber-500/30 text-amber-200">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
        Filling Fast
      </span>
    );
  }
  return null;
}

function formatPrice(cost: string, isEarlyBirdActive: boolean): string {
  const cleaned = cost.replace(/\.00$/, "");
  if (!isEarlyBirdActive) return cleaned;
  const amount = parseFloat(cost.replace(/[^0-9.]/g, ""));
  if (isNaN(amount) || amount <= 100) return cleaned;
  const earlyBird = `$${amount - 50}`;
  return `${earlyBird} / ${cleaned}`;
}

/**
 * Per-gender capacity bar state machine:
 *
 * WAITLIST:   enrollment >= max, OR open beds reserved for waitlist → "Waitlist", red, 100%
 * AVAILABLE:  genuine open spots                                   → "N spots left", color by tier
 *
 * All camp sessions allow waitlists. "Full" would only apply if
 * UltraCamp indicated waitlists were disabled, which it doesn't.
 */
function CapacityBar({
  label,
  enrollment,
  max,
  sessionWaitlistCount = 0,
}: {
  label: string;
  enrollment: number;
  max: number;
  sessionWaitlistCount?: number;
}) {
  const pct = getCapacityPct(enrollment, max);
  const spotsLeft = max - enrollment;
  const tier = getCapacityTier(pct);

  const atCapacity = enrollment >= max;
  const waitlistHold =
    !atCapacity &&
    sessionWaitlistCount > 0 &&
    spotsLeft <= sessionWaitlistCount;
  const isWaitlist = atCapacity || waitlistHold;

  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-semibold text-white/90">{label}</span>
        <span className="text-xs text-white/70">
          {isWaitlist
            ? "Waitlist"
            : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[isWaitlist ? "critical" : tier]}`}
          style={{ width: `${Math.min(isWaitlist ? 100 : pct, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface SessionCapacityBarProps {
  session: UltraCampSession;
  isRefreshing?: boolean;
  isEarlyBirdActive?: boolean;
}

export function SessionCapacityBar({
  session,
  isRefreshing = false,
  isEarlyBirdActive = false,
}: SessionCapacityBarProps) {
  const statusPill = getOverallStatusPill(session);
  const shimmer = isRefreshing ? "animate-pulse" : "";

  return (
    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="min-w-0">
          <h3 className="font-bold text-lg text-white !m-0 leading-tight">
            {session.plainSessionName}
          </h3>
          <p className="text-sm text-white/80 !m-0">
            {formatDateRange(session.beginDate, session.endDate)}
          </p>
          <p className="text-xs text-white/60 !m-0">
            {formatPrice(session.cost, isEarlyBirdActive)}
          </p>
        </div>
        {statusPill}
      </div>

      <div className={`mt-3 space-y-2 ${shimmer}`}>
        <CapacityBar label="Boys" enrollment={session.maleEnrollment} max={session.maxMales} sessionWaitlistCount={session.totalWaitListCount} />
        <CapacityBar label="Girls" enrollment={session.femaleEnrollment} max={session.maxFemales} sessionWaitlistCount={session.totalWaitListCount} />
      </div>

    </div>
  );
}
