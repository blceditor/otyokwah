import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";
import HeroVideo from "@/components/hero/HeroVideo";
import {
  getCapacityTier,
  getCapacityPct,
  type CapacityTier,
} from "@/lib/ultracamp/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Session Availability (Badge Demo) - Camp Otyokwah",
  robots: { index: false },
};

const BADGE_STYLES: Record<CapacityTier, string> = {
  critical: "text-red-100 bg-red-600/80",
  warning: "text-amber-100 bg-amber-600/80",
  available: "text-green-100 bg-green-700/80",
};

const DOT_STYLES: Record<CapacityTier, string> = {
  critical: "bg-red-200 animate-pulse",
  warning: "bg-amber-200",
  available: "bg-green-200",
};

function Badge({ session }: { session: UltraCampSession }) {
  const pct = getCapacityPct(session.totalEnrollment, session.maxTotal);
  const spotsLeft = session.maxTotal - session.totalEnrollment;
  const tier = getCapacityTier(pct);

  let label: string;
  if (tier === "critical") {
    label = spotsLeft <= 5 ? `Only ${spotsLeft} left!` : "Almost Full!";
  } else if (tier === "warning") {
    label = `${spotsLeft} spots left`;
  } else {
    label = `${spotsLeft} spots open`;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase ${BADGE_STYLES[tier]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[tier]}`} />
      {label}
    </span>
  );
}

function SessionRow({
  session,
}: {
  session: UltraCampSession;
}) {
  return (
    <div className="bg-white/20 rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-bold text-xl text-white !m-0 !mb-1">
            {session.plainSessionName}
          </h3>
          <p className="text-white !m-0">
            {session.beginDate} &ndash; {session.endDate}
          </p>
          <p className="text-sm text-white/80 !m-0">
            {session.cost} (Early Bird / Regular)
          </p>
        </div>
        <Badge session={session} />
      </div>
    </div>
  );
}

// Map session names to our mock data
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

export default async function CapacityDemoBadges() {
  const sessions = await fetchUltraCampSessions();

  // Group sessions by program for matching
  const primaryOvernight = findSession(sessions, "Primary Overnight");
  const junior1 = findSession(sessions, "Junior 1");
  const junior2 = findSession(sessions, "Junior 2");
  const junior3 = findSession(sessions, "Junior 3");
  const jrHigh1 = findSession(sessions, "Jr. High 1");
  const jrHigh2 = findSession(sessions, "Jr. High 2");
  const jrHigh3 = findSession(sessions, "Jr. High 3");
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
          DEMO — Option 4: Compact capacity badges on the existing session
          layout (mock data)
        </p>
      </div>

      {/* Mirroring the existing camp-sessions fullbleed layout with badges injected */}

      {/* Primary Overnight */}
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
            {primaryOvernight && (
              <div className="grid gap-4 mb-6">
                <SessionRow session={primaryOvernight} />
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
            <div className="grid gap-4 mb-6">
              {junior1 && <SessionRow session={junior1} />}
              {junior2 && <SessionRow session={junior2} />}
              {junior3 && <SessionRow session={junior3} />}
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
            <div className="grid gap-4 mb-6">
              {jrHigh1 && <SessionRow session={jrHigh1} />}
              {jrHigh2 && <SessionRow session={jrHigh2} />}
              {jrHigh3 && <SessionRow session={jrHigh3} />}
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
              <div className="grid gap-4 mb-6">
                <SessionRow session={srHigh} />
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
