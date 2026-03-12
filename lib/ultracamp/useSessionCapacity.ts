"use client";

import { useState, useEffect, useCallback } from "react";
import type { UltraCampSession } from "./sessions";

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface UseSessionCapacityResult {
  sessions: UltraCampSession[];
  isRefreshing: boolean;
}

export function useSessionCapacity(
  initialSessions: UltraCampSession[],
): UseSessionCapacityResult {
  const [sessions, setSessions] = useState(initialSessions);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/ultracamp/sessions");
      if (res.ok) {
        const data: UltraCampSession[] = await res.json();
        if (data.length > 0) {
          setSessions(data);
        }
      }
    } catch {
      // Silently fail — keep showing last known data
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Initial background refresh on mount
    refresh();

    // Refresh on interval
    const interval = setInterval(refresh, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [refresh]);

  return { sessions, isRefreshing };
}
