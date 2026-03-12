'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { CheckCircle2, XCircle, Loader2, FileEdit, Laptop } from 'lucide-react';

type DeploymentState = 'Published' | 'Deploying' | 'Failed' | 'Draft' | 'Local Dev' | 'Deploying to Site';

interface DeploymentStatusData {
  status: string;
  state: DeploymentState;
  timestamp: number | null;
  error?: string;
}

// REQ-CMS-003: Improved deployment monitoring configuration
const INITIAL_WAIT_MS = 30000; // 30 seconds before first poll (reduced from 2 minutes)
const POLL_INTERVAL_MS = 15000; // 15 seconds between polls (reduced from 30s)
const MAX_POLL_RETRIES = 20; // 20 retries = 5 minutes of polling

// Threshold for considering a "Deploying" state as stale
const STALE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

function formatRelativeTime(timestamp: number, state: DeploymentState): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  // Context-aware prefix based on state
  const prefix = state === 'Deploying' ? 'started ' : '';

  if (minutes < 1) {
    return `${prefix}just now`;
  } else if (minutes < 60) {
    return `${prefix}${minutes}m ago`;
  } else if (hours < 24) {
    return `${prefix}${hours}h ago`;
  } else {
    const days = Math.floor(hours / 24);
    return `${prefix}${days}d ago`;
  }
}

function isStaleDeploying(timestamp: number | null): boolean {
  if (!timestamp) return false;
  return Date.now() - timestamp > STALE_THRESHOLD_MS;
}

// Map API states to display states
function mapApiStateToDisplayState(apiState: string): DeploymentState {
  const stateMap: Record<string, DeploymentState> = {
    // Vercel API states
    'READY': 'Published',
    'BUILDING': 'Deploying',
    'QUEUED': 'Deploying',
    'INITIALIZING': 'Deploying',
    'ERROR': 'Failed',
    'CANCELED': 'Failed',
    // Direct display states (for internal use)
    'Published': 'Published',
    'Deploying': 'Deploying',
    'Deploying to Site': 'Deploying to Site',
    'Failed': 'Failed',
    'Draft': 'Draft',
    'Local Dev': 'Local Dev',
    // Fallbacks
    'unknown': 'Local Dev',
    'error': 'Failed',
    'local': 'Local Dev',
  };
  return stateMap[apiState] || 'Local Dev';
}

interface DeploymentStatusProps {
  darkMode?: boolean; // REQ-CMS-007: Dark mode for black nav bar
}

export function DeploymentStatus({ darkMode = false }: DeploymentStatusProps) {
  const [deploymentData, setDeploymentData] = useState<DeploymentStatusData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollRetryCount, setPollRetryCount] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialWaitRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDeploymentStatus = useCallback(async () => {
    try {
      // REQ-CMS-003: Try new direct Vercel API first, fall back to legacy endpoint
      let response = await fetch('/api/vercel-deployment-status');

      // Fall back to legacy endpoint if new one doesn't exist
      if (response.status === 404) {
        response = await fetch('/api/vercel-status');
      }

      if (!response.ok) {
        setDeploymentData({
          status: 'local',
          state: 'Local Dev',
          timestamp: null,
        });
        setIsPolling(false);
        return;
      }

      const data: DeploymentStatusData = await response.json();

      if (data.error) {
        setDeploymentData({
          status: 'local',
          state: 'Local Dev',
          timestamp: null,
        });
        setIsPolling(false);
        return;
      }

      // Map API state to display state
      const mappedState = mapApiStateToDisplayState(data.state);
      const mappedData: DeploymentStatusData = {
        ...data,
        state: mappedState,
        timestamp: data.timestamp ?? (data as { createdAt?: string }).createdAt
          ? new Date((data as { createdAt?: string }).createdAt!).getTime()
          : null,
      };

      // Normal deployment status handling...
      // If state is "Deploying" but timestamp is stale (>10 min),
      // the deployment likely completed but we have stale data - force re-check
      if (mappedState === 'Deploying' && isStaleDeploying(mappedData.timestamp)) {
        // Set to Published with current timestamp as fallback
        // (deployment likely completed, API may be behind)
        setDeploymentData({
          ...mappedData,
          state: 'Published',
          timestamp: Date.now(),
        });
        setIsPolling(false);
      } else {
        setDeploymentData(mappedData);

        // Stop polling when deployment completes or fails
        if (mappedState === 'Published' || mappedState === 'Failed') {
          setIsPolling(false);
        }
      }
    } catch {
      setDeploymentData({
        status: 'local',
        state: 'Local Dev',
        timestamp: null,
      });
      setIsPolling(false);
    }
  }, []);

  // Initial fetch and event listener setup
  useEffect(() => {
    fetchDeploymentStatus();

    const handleContentSaved = () => {
      // Clear any existing timers
      if (initialWaitRef.current) clearTimeout(initialWaitRef.current);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

      // Immediately set to "Deploying to Site" state
      setDeploymentData({
        status: 'deploying',
        state: 'Deploying to Site',
        timestamp: Date.now(),
      });
      setPollRetryCount(0);

      // Wait 2 minutes before starting to poll (give Vercel time to build)
      initialWaitRef.current = setTimeout(() => {
        setIsPolling(true);
        fetchDeploymentStatus();
      }, INITIAL_WAIT_MS);
    };

    window.addEventListener('content-saved', handleContentSaved);

    return () => {
      window.removeEventListener('content-saved', handleContentSaved);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (initialWaitRef.current) clearTimeout(initialWaitRef.current);
    };
  }, [fetchDeploymentStatus]);

  // Polling logic with retry limit
  useEffect(() => {
    if (isPolling && !pollIntervalRef.current) {
      pollIntervalRef.current = setInterval(() => {
        setPollRetryCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= MAX_POLL_RETRIES) {
            setDeploymentData({
              status: 'failed',
              state: 'Failed',
              timestamp: Date.now(),
              error: 'Deployment timed out after 5 minutes. Vercel build may have failed.',
            });
            setIsPolling(false);
            return 0;
          }
          return newCount;
        });
        fetchDeploymentStatus();
      }, POLL_INTERVAL_MS);
    } else if (!isPolling && pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isPolling, fetchDeploymentStatus]);

  if (!deploymentData) {
    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-400 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg'}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span className="text-xs">Checking...</span>
      </div>
    );
  }

  const { state, timestamp } = deploymentData;

  // REQ-CMS-007: Dark mode config for black nav bar
  const stateConfig = darkMode ? {
    Published: {
      icon: CheckCircle2,
      className: 'text-green-400',
      iconClassName: '',
      label: 'Published',
    },
    Deploying: {
      icon: Loader2,
      className: 'text-blue-400',
      iconClassName: 'animate-spin',
      label: 'Deploying',
    },
    'Deploying to Site': {
      icon: Loader2,
      className: 'text-purple-400',
      iconClassName: 'animate-spin',
      label: 'Building...',
    },
    Failed: {
      icon: XCircle,
      className: 'text-red-400',
      iconClassName: '',
      label: 'Failed',
    },
    Draft: {
      icon: FileEdit,
      className: 'text-amber-400',
      iconClassName: '',
      label: 'Draft',
    },
    'Local Dev': {
      icon: Laptop,
      className: 'text-gray-400',
      iconClassName: '',
      label: 'Local',
    },
  } : {
    Published: {
      icon: CheckCircle2,
      className: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
      iconClassName: '',
      label: 'Published',
    },
    Deploying: {
      icon: Loader2,
      className: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
      iconClassName: 'animate-spin',
      label: 'Deploying',
    },
    'Deploying to Site': {
      icon: Loader2,
      className: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800',
      iconClassName: 'animate-spin',
      label: 'Deploying to Site',
    },
    Failed: {
      icon: XCircle,
      className: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
      iconClassName: '',
      label: 'Failed',
    },
    Draft: {
      icon: FileEdit,
      className: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800',
      iconClassName: '',
      label: 'Draft',
    },
    'Local Dev': {
      icon: Laptop,
      className: 'text-gray-700 dark:text-dark-muted bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border',
      iconClassName: '',
      label: 'Local Dev',
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  // Show retry count during polling
  const showRetryCount = state === 'Deploying to Site' && pollRetryCount > 0;
  const showError = state === 'Failed' && deploymentData.error;

  return (
    <div
      className={`flex items-center gap-1.5 ${darkMode ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-md text-xs transition-colors ${config.className}`}
      role="status"
      aria-live="polite"
      title={showError ? deploymentData.error : undefined}
    >
      <Icon className={`h-3.5 w-3.5 ${config.iconClassName}`} aria-hidden="true" />
      <span className="font-medium">{config.label}</span>
      {showRetryCount && (
        <span className="opacity-75">
          ({pollRetryCount}/{MAX_POLL_RETRIES})
        </span>
      )}
      {!showRetryCount && timestamp && !darkMode && (
        <span className="opacity-75">
          {formatRelativeTime(timestamp, state)}
        </span>
      )}
    </div>
  );
}

export default DeploymentStatus;
