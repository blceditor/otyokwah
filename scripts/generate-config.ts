#!/usr/bin/env npx tsx
/**
 * Config Generator Script
 *
 * Reads config/repository.yaml and generates:
 * - lib/config/repository.ts (GitHub constants)
 * - lib/config/site.ts (domain/URL constants)
 * - tests/fixtures/config.ts (test fixtures)
 *
 * Usage: npm run generate:config
 *        npx tsx scripts/generate-config.ts
 */

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

// Types for the YAML config
interface RepoConfig {
  github: {
    owner: string;
    repo: string;
    full: string;
    app_slug: string;
    url: string;
  };
  site: {
    production_domain: string;
    production_url: string;
    keystatic_url: string;
  };
  email: {
    contact: string;
    registrar: string;
    default: string;
  };
  analytics: {
    ga4_measurement_id: string;
  };
  branding: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      cream: string;
      sand: string;
      stone: string;
      bark: string;
    };
  };
}

const PROJECT_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH = path.join(PROJECT_ROOT, "config/repository.yaml");
const LIB_CONFIG_DIR = path.join(PROJECT_ROOT, "lib/config");
const TEST_FIXTURES_DIR = path.join(PROJECT_ROOT, "tests/fixtures");

// Header for generated files
const GENERATED_HEADER = `/**
 * AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
 *
 * Generated from: config/repository.yaml
 * Generator: scripts/generate-config.ts
 *
 * To update values:
 * 1. Edit config/repository.yaml
 * 2. Run: npm run generate:config
 */

`;

function loadConfig(): RepoConfig {
  const configContent = fs.readFileSync(CONFIG_PATH, "utf-8");
  return yaml.load(configContent) as RepoConfig;
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateRepositoryTs(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * GitHub Repository Configuration
 *
 * Central source of truth for all GitHub-related constants.
 * Environment variables can override these defaults.
 */

export const GITHUB = {
  /** Repository owner (GitHub username or organization) */
  owner: process.env.GITHUB_OWNER ?? "${config.github.owner}",

  /** Repository name */
  repo: process.env.GITHUB_REPO?.split("/").pop() ?? "${config.github.repo}",

  /** Full repository path (owner/repo) */
  get full(): string {
    const envRepo = process.env.GITHUB_REPO;
    if (envRepo && envRepo.includes("/")) return envRepo;
    return \`\${this.owner}/\${this.repo}\`;
  },

  /** GitHub App slug for Keystatic CMS */
  appSlug:
    process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ?? "${config.github.app_slug}",

  /** GitHub repository URL */
  get url(): string {
    return \`https://github.com/\${this.full}\`;
  },
} as const;

/** Default GitHub owner (for fallbacks in source code) */
export const DEFAULT_GITHUB_OWNER = "${config.github.owner}";

/** Default GitHub repo (for fallbacks in source code) */
export const DEFAULT_GITHUB_REPO = "${config.github.repo}";

/** Default full repo path */
export const DEFAULT_GITHUB_FULL = "${config.github.full}";

/** GitHub App slug */
export const GITHUB_APP_SLUG = "${config.github.app_slug}";
`;
}

function generateSiteTs(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * Site/Domain Configuration
 *
 * Central source of truth for all domain-related constants.
 * Environment variables can override these defaults.
 */

export const SITE = {
  /** Production domain (without protocol) */
  productionDomain:
    process.env.PRODUCTION_DOMAIN ?? "${config.site.production_domain}",

  /** Production URL (with protocol) */
  get productionUrl(): string {
    return (
      process.env.PRODUCTION_URL ??
      process.env.E2E_BASE_URL ??
      \`https://\${this.productionDomain}\`
    );
  },

  /** Keystatic CMS URL */
  get keystaticUrl(): string {
    return \`\${this.productionUrl}/keystatic\`;
  },
} as const;

/** Default production domain (for fallbacks) */
export const DEFAULT_PRODUCTION_DOMAIN = "${config.site.production_domain}";

/** Default production URL (for fallbacks) */
export const DEFAULT_PRODUCTION_URL = "${config.site.production_url}";

/** Default Keystatic URL */
export const DEFAULT_KEYSTATIC_URL = "${config.site.keystatic_url}";
`;
}

function generateEmailTs(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * Email Configuration
 *
 * Central source of truth for contact email addresses.
 * Environment variables can override these defaults.
 */

export const EMAIL = {
  /** General contact email */
  contact: process.env.CONTACT_EMAIL ?? "${config.email.contact}",

  /** Camp registrar email */
  registrar: process.env.REGISTRAR_EMAIL ?? "${config.email.registrar}",

  /** Default contact email (CMS defaults) */
  default: "${config.email.default}",
} as const;

/** Default contact email */
export const DEFAULT_CONTACT_EMAIL = "${config.email.contact}";

/** Default registrar email */
export const DEFAULT_REGISTRAR_EMAIL = "${config.email.registrar}";
`;
}

function generateAnalyticsTs(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * Analytics Configuration
 *
 * Central source of truth for analytics identifiers.
 * Environment variables can override these defaults.
 */

export const ANALYTICS = {
  /** Google Analytics 4 measurement ID */
  ga4MeasurementId:
    process.env.NEXT_PUBLIC_GA_ID ?? "${config.analytics.ga4_measurement_id}",
} as const;

/** Default GA4 measurement ID */
export const DEFAULT_GA4_MEASUREMENT_ID = "${config.analytics.ga4_measurement_id}";
`;
}

function generateBrandingTs(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * Branding Colors Configuration
 *
 * Central source of truth for brand color values.
 * These values mirror the design tokens in tailwind.config.ts.
 */

export const BRANDING_COLORS = {
  /** Brand blue */
  primary: "${config.branding.colors.primary}",

  /** Forest green */
  secondary: "${config.branding.colors.secondary}",

  /** Warm brown */
  accent: "${config.branding.colors.accent}",

  /** Off-white background */
  cream: "${config.branding.colors.cream}",

  /** Sandy tan */
  sand: "${config.branding.colors.sand}",

  /** Stone grey */
  stone: "${config.branding.colors.stone}",

  /** Dark bark brown */
  bark: "${config.branding.colors.bark}",
} as const;
`;
}

function generateIndexTs(): string {
  return `${GENERATED_HEADER}/**
 * Central Configuration Index
 *
 * Re-exports all configuration modules for easy importing.
 *
 * Usage:
 *   import { GITHUB, SITE, EMAIL, ANALYTICS, BRANDING_COLORS } from '@/lib/config';
 */

export { GITHUB, DEFAULT_GITHUB_OWNER, DEFAULT_GITHUB_REPO, DEFAULT_GITHUB_FULL, GITHUB_APP_SLUG } from './repository';
export { SITE, DEFAULT_PRODUCTION_DOMAIN, DEFAULT_PRODUCTION_URL, DEFAULT_KEYSTATIC_URL } from './site';
export { EMAIL, DEFAULT_CONTACT_EMAIL, DEFAULT_REGISTRAR_EMAIL } from './email';
export { ANALYTICS, DEFAULT_GA4_MEASUREMENT_ID } from './analytics';
export { BRANDING_COLORS } from './branding';
`;
}

function generateTestFixtures(config: RepoConfig): string {
  return `${GENERATED_HEADER}/**
 * Test Fixtures for Configuration
 *
 * Use these fixtures in tests to ensure consistency with actual config.
 * These values reflect the current config/repository.yaml settings.
 */

/** Current GitHub configuration for tests */
export const TEST_GITHUB = {
  owner: "${config.github.owner}",
  repo: "${config.github.repo}",
  full: "${config.github.full}",
  appSlug: "${config.github.app_slug}",
  url: "${config.github.url}",
} as const;

/** Current site configuration for tests */
export const TEST_SITE = {
  productionDomain: "${config.site.production_domain}",
  productionUrl: "${config.site.production_url}",
  keystaticUrl: "${config.site.keystatic_url}",
} as const;

/** Current email configuration for tests */
export const TEST_EMAIL = {
  contact: "${config.email.contact}",
  registrar: "${config.email.registrar}",
  default: "${config.email.default}",
} as const;

/** Current analytics configuration for tests */
export const TEST_ANALYTICS = {
  ga4MeasurementId: "${config.analytics.ga4_measurement_id}",
} as const;

/** Current branding colors for tests */
export const TEST_BRANDING_COLORS = {
  primary: "${config.branding.colors.primary}",
  secondary: "${config.branding.colors.secondary}",
  accent: "${config.branding.colors.accent}",
  cream: "${config.branding.colors.cream}",
  sand: "${config.branding.colors.sand}",
  stone: "${config.branding.colors.stone}",
  bark: "${config.branding.colors.bark}",
} as const;

/**
 * Helper to stub environment variables for tests
 * Usage: vi.stubEnv('GITHUB_REPO', TEST_GITHUB.full)
 */
export const TEST_ENV_STUBS = {
  GITHUB_OWNER: "${config.github.owner}",
  GITHUB_REPO: "${config.github.full}",
  PRODUCTION_URL: "${config.site.production_url}",
  PRODUCTION_DOMAIN: "${config.site.production_domain}",
  E2E_BASE_URL: "${config.site.production_url}",
  NEXT_PUBLIC_GA_ID: "${config.analytics.ga4_measurement_id}",
} as const;
`;
}

function generateShellConfig(config: RepoConfig): string {
  return `#!/bin/bash
# AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
#
# Generated from: config/repository.yaml
# Generator: scripts/generate-config.ts
#
# To update values:
# 1. Edit config/repository.yaml
# 2. Run: npm run generate:config
#
# Usage in bash scripts:
#   source "$(dirname "\${BASH_SOURCE[0]}")/../config/site.sh"
#   echo "Domain: \$CONFIG_PRODUCTION_DOMAIN"

# GitHub Configuration
CONFIG_GITHUB_OWNER="${config.github.owner}"
CONFIG_GITHUB_REPO="${config.github.repo}"
CONFIG_GITHUB_FULL="${config.github.full}"
CONFIG_GITHUB_APP_SLUG="${config.github.app_slug}"
CONFIG_GITHUB_URL="${config.github.url}"

# Site/Domain Configuration
CONFIG_PRODUCTION_DOMAIN="${config.site.production_domain}"
CONFIG_PRODUCTION_URL="${config.site.production_url}"
CONFIG_KEYSTATIC_URL="${config.site.keystatic_url}"

# Email Configuration
CONFIG_EMAIL_CONTACT="${config.email.contact}"
CONFIG_EMAIL_REGISTRAR="${config.email.registrar}"
CONFIG_EMAIL_DEFAULT="${config.email.default}"
`;
}

function main(): void {
  console.log("Generating configuration files...\n");

  // Load config
  console.log(`Reading: ${CONFIG_PATH}`);
  const config = loadConfig();

  // Ensure directories exist
  ensureDir(LIB_CONFIG_DIR);
  ensureDir(TEST_FIXTURES_DIR);

  // Generate lib/config files
  const files = [
    {
      path: path.join(LIB_CONFIG_DIR, "repository.ts"),
      content: generateRepositoryTs(config),
    },
    {
      path: path.join(LIB_CONFIG_DIR, "site.ts"),
      content: generateSiteTs(config),
    },
    {
      path: path.join(LIB_CONFIG_DIR, "email.ts"),
      content: generateEmailTs(config),
    },
    {
      path: path.join(LIB_CONFIG_DIR, "analytics.ts"),
      content: generateAnalyticsTs(config),
    },
    {
      path: path.join(LIB_CONFIG_DIR, "branding.ts"),
      content: generateBrandingTs(config),
    },
    {
      path: path.join(LIB_CONFIG_DIR, "index.ts"),
      content: generateIndexTs(),
    },
    {
      path: path.join(TEST_FIXTURES_DIR, "config.ts"),
      content: generateTestFixtures(config),
    },
    {
      path: path.join(PROJECT_ROOT, "config/site.sh"),
      content: generateShellConfig(config),
    },
  ];

  // Write all files
  for (const file of files) {
    fs.writeFileSync(file.path, file.content, "utf-8");
    console.log(`Generated: ${path.relative(PROJECT_ROOT, file.path)}`);
  }

  console.log("\nConfiguration generation complete!");
  console.log("\nGenerated values:");
  console.log(`  GitHub Owner: ${config.github.owner}`);
  console.log(`  GitHub Repo: ${config.github.repo}`);
  console.log(`  Production Domain: ${config.site.production_domain}`);
  console.log(`  Production URL: ${config.site.production_url}`);
  console.log(`  GA4 Measurement ID: ${config.analytics.ga4_measurement_id}`);
  console.log(`  Branding Colors: ${Object.keys(config.branding.colors).join(", ")}`);
}

main();
