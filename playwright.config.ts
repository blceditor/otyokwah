import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";
import { DEFAULT_PRODUCTION_URL } from "./lib/config/site";

// Load .env.local for test credentials (GITHUB_TEST_USER, GITHUB_TEST_PASS)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { open: "never" }],
    ["list"],
    // Visual proof reporter for REQ-PROC-004
    ...(process.env.VISUAL_PROOF_ENABLED === "true"
      ? [
          [
            "./scripts/validation/visual-proof-reporter.ts",
            {
              outputFile: "verification-screenshots/visual-proof-report.json",
              logToConsole: true,
            },
          ] as ["./scripts/validation/visual-proof-reporter.ts", any],
        ]
      : []),
  ] as any,

  use: {
    baseURL: process.env.E2E_BASE_URL || DEFAULT_PRODUCTION_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    // Auth setup project - runs first to establish GitHub OAuth session
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    // Main test project - depends on auth setup
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use saved auth state from setup
        storageState: "tests/e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Smoke tests that don't need auth
    {
      name: "smoke",
      testMatch: /smoke\/.+\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  outputDir: "./tests/e2e/results",

  // Expect settings
  expect: {
    timeout: 10000,
    // REQ-TEST-003: Visual regression screenshot comparison configuration
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },
});
