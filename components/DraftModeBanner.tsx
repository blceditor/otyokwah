// REQ-101: Draft Mode Visual Indicator
'use client';

import { useState, useEffect } from 'react';

export default function DraftModeBanner() {
  const [isDraftMode, setIsDraftMode] = useState(false);
  const [branch, setBranch] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're in draft mode by looking for the branch parameter
    const params = new URLSearchParams(window.location.search);
    const branchParam = params.get('branch');

    if (branchParam) {
      setIsDraftMode(true);
      setBranch(branchParam);
    }

    // Also check for draft mode cookie
    const cookies = document.cookie.split(';');
    const hasDraftCookie = cookies.some(cookie =>
      cookie.trim().startsWith('__prerender_bypass=')
    );

    if (hasDraftCookie && !branchParam) {
      setIsDraftMode(true);
    }
  }, []);

  if (!isDraftMode) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-bold">Draft Preview Mode</span>
          {branch && (
            <span className="text-sm">
              Viewing branch: <code className="bg-yellow-600 px-2 py-1 rounded">{branch}</code>
            </span>
          )}
        </div>
        <a
          href="/api/exit-draft"
          className="bg-black text-yellow-500 px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          Exit Preview
        </a>
      </div>
    </div>
  );
}