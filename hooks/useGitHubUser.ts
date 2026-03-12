'use client';

import { useState, useEffect } from 'react';

interface GitHubUser {
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface UseGitHubUserResult {
  user: GitHubUser | null;
  isLoading: boolean;
  error: string | null;
}

function getKestaticGitHubToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // First, check cookies - Keystatic stores the token in a cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'keystatic-gh-access-token' && value) {
        // Token found in cookie (starts with ghu_ or gho_)
        return value;
      }
    }

    // Fallback: check localStorage for older storage patterns
    const possibleKeys = [
      'keystatic-github-token',
      'keystatic:github-token',
      'keystatic.github.token',
    ];

    for (const key of possibleKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (parsed.access_token) return parsed.access_token;
          if (parsed.token) return parsed.token;
          if (typeof parsed === 'string') return parsed;
        } catch {
          // Value might be a raw token string
          if (value.startsWith('gho_') || value.startsWith('ghp_') || value.startsWith('ghu_')) {
            return value;
          }
        }
      }
    }

    // Also check for OAuth token patterns in all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('keystatic') || key.includes('github'))) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.access_token) return parsed.access_token;
            if (parsed.token) return parsed.token;
          } catch {
            if (value.startsWith('gho_') || value.startsWith('ghp_') || value.startsWith('ghu_')) {
              return value;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error accessing token storage:', error);
  }

  return null;
}

export function useGitHubUser(): UseGitHubUserResult {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      const token = getKestaticGitHubToken();

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/github-user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid - not really an error, just not logged in
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch user');
        }

        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  return { user, isLoading, error };
}

export default useGitHubUser;
