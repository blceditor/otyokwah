import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import HeroVideo from "@/components/hero/HeroVideo";
import { BedDouble } from "lucide-react";
import {
  formatDateRange,
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Session Availability (v2 Design Mock) - Camp Otyokwah",
  robots: { index: false },
};

const BAR_COLORS: Record<CapacityTier, string> = {
  critical: "bg-red-400",
  warning: "bg-amber-400",
  available: "bg-green-400",
};

function getStatusPill(pct: number, spotsLeft: number) {
  const tier = getCapacityTier(pct);
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

function SessionCard({ session }: { session: UltraCampSession }) {
  const pct = getCapacityPct(session.totalEnrollment, session.maxTotal);
  const spotsLeft = session.maxTotal - session.totalEnrollment;
  const barColor = BAR_COLORS[getCapacityTier(pct)];
  const statusPill = getStatusPill(pct, spotsLeft);

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
          <p className="text-xs text-white/60 !m-0">{session.cost}</p>
        </div>
        {statusPill}
      </div>

      {/* Total progress bar */}
      <div className="mt-3">
        <div className="h-2 w-full rounded-full bg-white/20 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-white/70">
            {session.totalEnrollment}/{session.maxTotal} registered
          </span>
          <span className="text-xs text-white/70">
            {spotsLeft > 0 ? `${spotsLeft} spots left` : "Full"}
          </span>
        </div>
      </div>

      {/* M/F bed breakdown */}
      <div className="flex items-center gap-5 mt-2 text-xs text-white/70">
        <span className="inline-flex items-center gap-1.5">
          <BedDouble className="h-3.5 w-3.5 text-white/50" />
          {session.maleEnrollment}/{session.maxMales} boys
        </span>
        <span className="inline-flex items-center gap-1.5">
          <BedDouble className="h-3.5 w-3.5 text-white/50" />
          {session.femaleEnrollment}/{session.maxFemales} girls
        </span>
      </div>

      {/* Waitlist */}
      {session.totalWaitListCount > 0 && (
        <p className="text-xs text-white/50 mt-1.5">
          {session.totalWaitListCount} on waitlist
        </p>
      )}
    </div>
  );
}

function findSession(
  sessions: UltraCampSession[],
  match: string,
): UltraCampSession | undefined {
  return sessions.find(
    (s) =>
      s.plainSessionName.toLowerCase().includes(match.toLowerCase()) ||
      s.sessionName.toLowerCase().includes(match.toLowerCase()),
  );
}

function findSessions(
  sessions: UltraCampSession[],
  matches: string[],
): UltraCampSession[] {
  return matches
    .map((m) => findSession(sessions, m))
    .filter((s): s is UltraCampSession => s !== undefined);
}

export default async function CapacityDemoCards() {
  const sessions = await fetchUltraCampSessions();

  const primary = findSession(sessions, "Primary");
  const juniors = findSessions(sessions, ["Junior 1", "Junior 2", "Junior 3"]);
  const jrHighs = findSessions(sessions, [
    "Jr. High 1",
    "Jr. High 2",
    "Jr. High 3",
  ]);
  const srHigh = findSession(sessions, "Sr. High");

  return (
    <div className="min-h-screen">
      <HeroVideo
        src="/videos/hero-camp-sessions.mp4"
        poster="heroes/hero-camp-sessions-poster.jpg"
        title="Camp Sessions"
        subtitle="Summer 2026 Sessions"
      />

      {/* Demo banner */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 text-center">
        <p className="text-sm text-amber-800 font-medium">
          DESIGN MOCK v2 — Total bar + bed icon M/F breakdown + status pills
          (live UltraCamp data)
        </p>
      </div>

      {/* Primary Camp */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/summer-sessions/primary-overnight.jpg"
            alt="Young campers enjoying Primary Overnight activities"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="flex flex-col justify-center p-8 md:p-12"
          style={{ backgroundColor: "#4A7A9E" }}
        >
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white !mt-0" id="primary-overnight">
              Primary Overnight
            </h2>
            <p className="text-white/90">
              <strong>Rising 2nd-3rd Graders</strong>
            </p>
            {primary && (
              <div className="not-prose grid gap-4 mb-6">
                <SessionCard session={primary} />
              </div>
            )}
            <p className="text-white/80">
              A fun first taste of overnight camp just for our youngest campers!
            </p>
            <a
              href="https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors no-underline"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>

      {/* Junior Camp */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/summer-sessions/junior-camp.jpg"
            alt="Junior campers enjoying summer activities"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="flex flex-col justify-center p-8 md:p-12"
          style={{ backgroundColor: "#A07856" }}
        >
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white !mt-0" id="junior-camp">
              Junior Camp
            </h2>
            <p className="text-white/90">
              <strong>Rising 3rd-5th or 4th-6th Graders</strong>
            </p>
            <div className="not-prose grid gap-3 mb-6">
              {juniors.map((s) => (
                <SessionCard key={s.sessionId} session={s} />
              ))}
            </div>
            <p className="text-white/80">
              Full-week adventure for elementary students!
            </p>
            <a
              href="https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-white text-accent font-semibold rounded-lg hover:bg-white/90 transition-colors no-underline"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>

      {/* Jr. High Camp */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/summer-sessions/jr-high-camp.jpg"
            alt="Jr. High campers at Camp Otyokwah"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="flex flex-col justify-center p-8 md:p-12"
          style={{ backgroundColor: "#2F4F3D" }}
        >
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white !mt-0" id="jr-high-camp">
              Jr. High Camp
            </h2>
            <p className="text-white/90">
              <strong>Rising 7th-9th Graders</strong>
            </p>
            <div className="not-prose grid gap-3 mb-6">
              {jrHighs.map((s) => (
                <SessionCard key={s.sessionId} session={s} />
              ))}
            </div>
            <p className="text-white/80">
              A week of growth and exploration for middle school students!
            </p>
            <a
              href="https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-white text-secondary font-semibold rounded-lg hover:bg-white/90 transition-colors no-underline"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>

      {/* Sr. High Camp */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-square md:aspect-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/summer-sessions/sr-high-camp.jpg"
            alt="Sr. High campers enjoying summer activities"
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className="flex flex-col justify-center p-8 md:p-12"
          style={{ backgroundColor: "#2F5A7A" }}
        >
          <div className="prose prose-invert max-w-none">
            <h2 className="text-white !mt-0" id="sr-high-camp">
              Sr. High Camp
            </h2>
            <p className="text-white/90">
              <strong>Rising 10th Graders - Graduates</strong>
            </p>
            {srHigh && (
              <div className="not-prose grid gap-4 mb-6">
                <SessionCard session={srHigh} />
              </div>
            )}
            <p className="text-white/80">
              Our summer session for high school students!
            </p>
            <a
              href="https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-4 px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-white/90 transition-colors no-underline"
            >
              Register Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
