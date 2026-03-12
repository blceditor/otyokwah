"use client";

/**
 * REQ-ADMIN-001: Compact Deployment Status Indicator
 * REQ-U03-FIX-014: Async polling while Building
 *
 * A compact version of the deployment status for the admin nav strip.
 * Shows a colored dot and status text.
 * Polls continuously while in Building state until deployment completes.
 */

import { useEffect, useState, useCallback, useRef } from "react";

type DeploymentState =
  | "Published"
  | "Building"
  | "Error"
  | "Local Dev"
  | "Checking";

interface DeploymentStatusData {
  status: string;
  state: string;
  timestamp: number | null;
  error?: string;
}

// Polling intervals in milliseconds
const BUILDING_POLL_INTERVAL = 5000; // Poll every 5 seconds while building
const MAX_POLL_DURATION = 600000; // Stop polling after 10 minutes

// Map API states to display states
function mapApiStateToDisplayState(apiState: string): DeploymentState {
  const stateMap: Record<string, DeploymentState> = {
    READY: "Published",
    BUILDING: "Building",
    QUEUED: "Building",
    INITIALIZING: "Building",
    ERROR: "Error",
    CANCELED: "Error",
    Published: "Published",
    Deploying: "Building",
    "Deploying to Site": "Building",
    Failed: "Error",
    Draft: "Published",
    "Local Dev": "Local Dev",
    unknown: "Local Dev",
    error: "Error",
    local: "Local Dev",
  };
  return stateMap[apiState] || "Local Dev";
}

export function AdminDeploymentStatus() {
  const [state, setState] = useState<DeploymentState>("Checking");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollStartTimeRef = useRef<number | null>(null);

  // REQ-U03-FIX-014: Clear any existing polling interval
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    pollStartTimeRef.current = null;
  }, []);

  const fetchStatus = useCallback(async (): Promise<DeploymentState> => {
    try {
      let response = await fetch("/api/vercel-deployment-status");

      // Fall back to legacy endpoint if new one doesn't exist
      if (response.status === 404) {
        response = await fetch("/api/vercel-status");
      }

      if (!response.ok) {
        return "Local Dev";
      }

      const data: DeploymentStatusData = await response.json();

      if (data.error) {
        return "Local Dev";
      }

      return mapApiStateToDisplayState(data.state);
    } catch {
      return "Local Dev";
    }
  }, []);

  // REQ-U03-FIX-014: Start continuous polling while in Building state
  const startBuildingPoll = useCallback(() => {
    // Don't start if already polling
    if (pollIntervalRef.current) return;

    pollStartTimeRef.current = Date.now();

    pollIntervalRef.current = setInterval(async () => {
      // Check if we've exceeded max poll duration
      if (
        pollStartTimeRef.current &&
        Date.now() - pollStartTimeRef.current > MAX_POLL_DURATION
      ) {
        stopPolling();
        setState("Error"); // Assume error if build takes too long
        return;
      }

      const newState = await fetchStatus();
      setState(newState);

      // Stop polling if no longer building
      if (newState !== "Building") {
        stopPolling();
      }
    }, BUILDING_POLL_INTERVAL);
  }, [fetchStatus, stopPolling]);

  useEffect(() => {
    // Initial fetch
    const initialFetch = async () => {
      const initialState = await fetchStatus();
      setState(initialState);

      // If initially building, start polling
      if (initialState === "Building") {
        startBuildingPoll();
      }
    };

    initialFetch();

    // Listen for content saved events
    const handleContentSaved = () => {
      setState("Building");
      startBuildingPoll();
    };

    window.addEventListener("content-saved", handleContentSaved);

    return () => {
      window.removeEventListener("content-saved", handleContentSaved);
      stopPolling();
    };
  }, [fetchStatus, startBuildingPoll, stopPolling]);

  const statusConfig: Record<
    DeploymentState,
    { dotClass: string; text: string }
  > = {
    Published: { dotClass: "bg-green-500", text: "Published" },
    Building: { dotClass: "bg-yellow-500 animate-pulse", text: "Building" },
    Error: { dotClass: "bg-red-500", text: "Error" },
    "Local Dev": { dotClass: "bg-gray-400", text: "Local" },
    Checking: { dotClass: "bg-gray-400 animate-pulse", text: "..." },
  };

  const config = statusConfig[state];

  return (
    <div
      data-testid="admin-deployment-status"
      className="inline-flex items-center gap-1.5 text-xs"
      aria-label={`Deployment status: ${config.text}`}
    >
      <span
        data-testid="status-dot"
        className={`w-2 h-2 rounded-full ${config.dotClass}`}
        aria-hidden="true"
      />
      <span className="opacity-80">{config.text}</span>
    </div>
  );
}

export default AdminDeploymentStatus;
