'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/**
 * REQ-CMS-AUTH: Logged Out Page
 *
 * This page is shown after signing out of Keystatic.
 * It does NOT auto-redirect to /keystatic, which would trigger
 * automatic re-authentication with GitHub.
 *
 * Instead, it shows a confirmation and requires the user to
 * manually click to sign back in.
 */
export default function LoggedOutPage() {
  // Clear any remaining client-side state on mount
  useEffect(() => {
    // Clear IndexedDB
    if (window.indexedDB?.databases) {
      window.indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            window.indexedDB.deleteDatabase(db.name);
          }
        });
      });
    }

    // Clear localStorage
    const localKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('keystatic') || key.includes('github') || key.includes('Keystatic'))) {
        localKeys.push(key);
      }
    }
    localKeys.forEach(key => localStorage.removeItem(key));

    // Clear sessionStorage
    const sessionKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.includes('keystatic') || key.includes('github') || key.includes('Keystatic'))) {
        sessionKeys.push(key);
      }
    }
    sessionKeys.forEach(key => sessionStorage.removeItem(key));

    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.includes('keystatic') || name.includes('github')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/keystatic`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/api/keystatic`;
      }
    });

  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">
          Signed Out Successfully
        </h1>

        <p className="text-slate-400 mb-6">
          All cached data has been cleared. You will need to sign in with GitHub again to access the CMS.
        </p>

        <div className="space-y-3">
          <Link
            href="/keystatic"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Sign In with GitHub
          </Link>

          <Link
            href="/"
            className="block w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Return to Website
          </Link>
        </div>

        <p className="text-slate-500 text-sm mt-6">
          If you continue to have issues, try{' '}
          <a
            href="https://github.com/settings/applications"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            revoking the app on GitHub
          </a>
          {' '}and signing in again.
        </p>
      </div>
    </div>
  );
}
