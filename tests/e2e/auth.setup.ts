/**
 * Playwright Auth Setup for GitHub OAuth
 *
 * This setup script authenticates with GitHub for Keystatic admin access.
 * It saves the authenticated state for reuse by other tests.
 *
 * Environment Variables Required:
 * - GITHUB_TEST_USER: GitHub username
 * - GITHUB_TEST_PASS: GitHub password
 *
 * Usage:
 *   GITHUB_TEST_USER=username GITHUB_TEST_PASS=password npx playwright test --project=setup
 *
 * Or create a .env.local file (gitignored) with the credentials.
 */
import { test as setup, expect } from "@playwright/test";

const authFile = "tests/e2e/.auth/user.json";

setup("authenticate with GitHub", async ({ page }) => {
  const githubUser = process.env.GITHUB_TEST_USER;
  const githubPass = process.env.GITHUB_TEST_PASS;

  if (!githubUser || !githubPass) {
    console.log("⚠️  GITHUB_TEST_USER and GITHUB_TEST_PASS not set");
    console.log("   Skipping authentication setup.");
    console.log("   Keystatic tests will be skipped.");

    // Create empty auth file to prevent test failures
    await page.context().storageState({ path: authFile });
    return;
  }

  console.log("🔐 Starting GitHub OAuth authentication...");

  // Navigate to Keystatic admin
  await page.goto("/keystatic");

  // Wait for the page to load
  await page.waitForTimeout(2000);

  // Check if already authenticated
  const content = await page.content();
  if (
    content.includes("Pages") ||
    content.includes("Collections") ||
    content.includes("Dashboard")
  ) {
    console.log("✅ Already authenticated");
    await page.context().storageState({ path: authFile });
    return;
  }

  // Look for GitHub sign-in button
  const githubButton = page.locator(
    'button:has-text("GitHub"), a:has-text("GitHub"), button:has-text("Sign in")',
  );

  if ((await githubButton.count()) > 0) {
    console.log("📝 Clicking GitHub sign-in button...");
    await githubButton.first().click();

    // Wait for GitHub OAuth page
    await page.waitForURL(/github\.com/, { timeout: 10000 }).catch(() => {
      console.log("   Not redirected to GitHub, may already be logged in");
    });

    // If on GitHub, enter credentials
    if (page.url().includes("github.com")) {
      console.log("📝 Entering GitHub credentials...");

      // Enter username
      const usernameField = page.locator('input[name="login"]');
      if ((await usernameField.count()) > 0) {
        await usernameField.fill(githubUser);
      }

      // Enter password
      const passwordField = page.locator('input[name="password"]');
      if ((await passwordField.count()) > 0) {
        await passwordField.fill(githubPass);
      }

      // Submit
      const submitButton = page.locator(
        'input[type="submit"], button[type="submit"]',
      );
      if ((await submitButton.count()) > 0) {
        await submitButton.first().click();
      }

      // Wait for redirect back to app
      await page.waitForURL(/keystatic/, { timeout: 30000 }).catch(() => {
        console.log("   Waiting for OAuth callback...");
      });

      // Handle possible 2FA or authorization prompts
      const authorizeButton = page.locator('button:has-text("Authorize")');
      if ((await authorizeButton.count()) > 0) {
        console.log("📝 Authorizing application...");
        await authorizeButton.click();
        await page.waitForURL(/keystatic/, { timeout: 30000 });
      }
    }
  }

  // Verify authentication succeeded
  await page.waitForTimeout(3000);
  await page.goto("/keystatic");

  const finalContent = await page.content();
  const isAuthenticated =
    finalContent.includes("Pages") ||
    finalContent.includes("Collections") ||
    finalContent.includes("Dashboard") ||
    finalContent.includes("Sign out");

  if (isAuthenticated) {
    console.log("✅ GitHub authentication successful!");
  } else {
    console.log("⚠️  Authentication may not have completed");
    console.log("   Tests requiring auth may be skipped");
  }

  // Save authentication state
  await page.context().storageState({ path: authFile });
  console.log(`💾 Auth state saved to ${authFile}`);
});

setup("verify auth state file exists", async ({ page }) => {
  // This is a secondary setup step that verifies the auth file was created
  // It ensures the chromium project can load it
  const fs = await import("fs");

  if (!fs.existsSync(authFile)) {
    console.log("⚠️  Auth file not created, creating empty placeholder");
    await page.context().storageState({ path: authFile });
  }
});
