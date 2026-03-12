import { defineConfig, devices } from '@playwright/test';
import { DEFAULT_PRODUCTION_URL } from './lib/config/site';

/**
 * Playwright Production Configuration
 *
 * Use for validating features on production after deployment.
 * Run with: npx playwright test --config=playwright.production.config.ts
 */
export default defineConfig({
  testDir: './tests/e2e/production',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report-production' }],
    ['json', { outputFile: 'validation-reports/playwright-results.json' }]
  ],
  use: {
    baseURL: process.env.PRODUCTION_URL || DEFAULT_PRODUCTION_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Output screenshots to verification-screenshots directory
  outputDir: 'verification-screenshots',
});
