"use client";

import { BarChart3, ExternalLink } from "lucide-react";

interface AnalyticsSetupProps {
  isTokenMissing: boolean;
  hasError?: boolean;
}

export function AnalyticsSetup({ isTokenMissing, hasError }: AnalyticsSetupProps) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">
      <BarChart3 className="h-12 w-12 text-gray-300 dark:text-dark-border mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-2">
        {hasError ? "Analytics Connection Error" : "Connect Google Analytics"}
      </h2>
      <p className="text-gray-500 dark:text-dark-muted mb-6">
        {hasError
          ? "Could not fetch data from Google Analytics. The refresh token may have expired. Re-authorize below."
          : isTokenMissing
            ? "Complete the one-time setup to display site analytics here."
            : "Set the GA4_PROPERTY_ID environment variable in Vercel to finish setup."}
      </p>
      {(isTokenMissing || hasError) && (
        <a
          href="/api/auth/google/consent"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Authorize with Google
        </a>
      )}
    </div>
  );
}
