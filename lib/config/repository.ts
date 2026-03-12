/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Generated from: config/repository.yaml
 * Generator: scripts/generate-config.ts
 *
 * To update values:
 * 1. Edit config/repository.yaml
 * 2. Run: npm run generate:config
 */

/**
 * GitHub Repository Configuration
 *
 * Central source of truth for all GitHub-related constants.
 * Environment variables can override these defaults.
 */

export const GITHUB = {
  /** Repository owner (GitHub username or organization) */
  owner: process.env.GITHUB_OWNER ?? "blceditor",

  /** Repository name */
  repo: process.env.GITHUB_REPO?.split("/").pop() ?? "bearlakecamp",

  /** Full repository path (owner/repo) */
  get full(): string {
    const envRepo = process.env.GITHUB_REPO;
    if (envRepo && envRepo.includes("/")) return envRepo;
    return `${this.owner}/${this.repo}`;
  },

  /** GitHub App slug for Keystatic CMS */
  appSlug:
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ?? "bearlakecamp-cms",

  /** GitHub repository URL */
  get url(): string {
    return `https://github.com/${this.full}`;
  },
} as const;

/** Default GitHub owner (for fallbacks in source code) */
export const DEFAULT_GITHUB_OWNER = "blceditor";

/** Default GitHub repo (for fallbacks in source code) */
export const DEFAULT_GITHUB_REPO = "bearlakecamp";

/** Default full repo path */
export const DEFAULT_GITHUB_FULL = "blceditor/bearlakecamp";

/** GitHub App slug */
export const GITHUB_APP_SLUG = "bearlakecamp-cms";
