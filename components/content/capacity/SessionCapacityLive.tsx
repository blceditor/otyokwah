"use client";

import { useSessionCapacity } from "@/lib/ultracamp/useSessionCapacity";
import { SessionCapacityBar } from "./SessionCapacityBar";
import type { UltraCampSession } from "@/lib/ultracamp/sessions";

interface SessionCapacityLiveProps {
  initialSessions: UltraCampSession[];
  sessionNames: string[];
  isEarlyBirdActive?: boolean;
}

function findSessions(
  sessions: UltraCampSession[],
  names: string[],
): UltraCampSession[] {
  return names
    .map((name) =>
      sessions.find(
        (s) =>
          s.plainSessionName.toLowerCase().includes(name.toLowerCase()) ||
          s.sessionName.toLowerCase().includes(name.toLowerCase()),
      ),
    )
    .filter((s): s is UltraCampSession => s !== undefined);
}

export function SessionCapacityLive({
  initialSessions,
  sessionNames,
  isEarlyBirdActive = false,
}: SessionCapacityLiveProps) {
  const { sessions, isRefreshing } = useSessionCapacity(initialSessions);
  const matched = findSessions(sessions, sessionNames);

  if (matched.length === 0) return null;

  return (
    <div className="not-prose grid gap-3">
      {matched.map((session) => (
        <SessionCapacityBar
          key={session.sessionId}
          session={session}
          isRefreshing={isRefreshing}
          isEarlyBirdActive={isEarlyBirdActive}
        />
      ))}
    </div>
  );
}
