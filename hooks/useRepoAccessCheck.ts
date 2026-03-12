"use client";

import { useGitHubUser } from "./useGitHubUser";
import { DEFAULT_GITHUB_OWNER } from "@/lib/config";

interface UseRepoAccessCheckResult {
  authenticatedUser: string | null;
  expectedOwner: string;
  hasMismatch: boolean;
  isLoading: boolean;
}

/**
 * REQ-CMS-AUTH: Detect GitHub account mismatch
 *
 * Compares the authenticated GitHub user against the expected repo owner
 * to detect when users are signed in with the wrong account.
 */
export function useRepoAccessCheck(): UseRepoAccessCheckResult {
  const { user, isLoading } = useGitHubUser();
  const expectedOwner = DEFAULT_GITHUB_OWNER;

  // Mismatch detected when:
  // - User is authenticated (user exists)
  // - User's login doesn't match the expected repo owner
  const hasMismatch = !isLoading && !!user && user.login !== expectedOwner;

  return {
    authenticatedUser: user?.login ?? null,
    expectedOwner,
    hasMismatch,
    isLoading,
  };
}

export default useRepoAccessCheck;
