import { fetchUltraCampSessions } from "@/lib/ultracamp/sessions";
import { SessionCapacityLive } from "./SessionCapacityLive";

interface SessionCapacityServerProps {
  sessions: string[];
}

export async function SessionCapacityServer({
  sessions: sessionNames,
}: SessionCapacityServerProps) {
  const allSessions = await fetchUltraCampSessions();

  const now = new Date();
  const earlyBirdDeadline = new Date("2026-04-14");
  const isEarlyBirdActive = now < earlyBirdDeadline;

  return (
    <SessionCapacityLive
      initialSessions={allSessions}
      sessionNames={sessionNames}
      isEarlyBirdActive={isEarlyBirdActive}
    />
  );
}
