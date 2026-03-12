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
  const spotsLeft = session.maxTotal - session.totalEnrollment;
  const hasWaitlist = session.totalWaitListCount > 0;

  // Full: both genders at capacity or has waitlist with no spots
  if ((boysPct >= 100 && girlsPct >= 100) || (hasWaitlist && spotsLeft <= 0)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase bg-red-500/30 text-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300 animate-pulse" />
        Waitlist
      </span>
    );
  }

  // Use the worst of overall, boys, or girls percentage to determine tier
  const worstPct = Math.max(overallPct, boysPct, girlsPct);
  // Also escalate if there's a waitlist (people are already being turned away)
  const tier = hasWaitlist ? "critical" : getCapacityTier(worstPct);

  if (tier === "critical") {
    const label = spotsLeft <= 5 ? `Only ${spotsLeft} left!` : "Almost Full!";
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase bg-red-500/30 text-red-200">
        <span className="h-1.5 w-1.5 rounded-full bg-red-300 animate-pulse" />
        {label}
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

function CapacityBar({
  label,
  enrollment,
  max,
}: {
  label: string;
  enrollment: number;
  max: number;
}) {
  const pct = getCapacityPct(enrollment, max);
  const spotsLeft = max - enrollment;
  const tier = getCapacityTier(pct);
  return (
    <div>
      <div className="flex items-center justify-between mb-0.5">
        <span className="text-xs font-semibold text-white/90">{label}</span>
        <span className="text-xs text-white/70">
          {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${BAR_COLORS[tier]}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
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
        <CapacityBar label="Boys" enrollment={session.maleEnrollment} max={session.maxMales} />
        <CapacityBar label="Girls" enrollment={session.femaleEnrollment} max={session.maxFemales} />
      </div>

    </div>
  );
}
