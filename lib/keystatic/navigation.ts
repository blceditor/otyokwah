// REQ-412, REQ-414: Navigation Data Structure and Reader Function
// REQ-P0-2: Error Telemetry and Monitoring
import { reader } from '../keystatic-reader';
import { defaultNavigation } from '../../components/navigation/config';
import type { NavigationConfig } from '../../components/navigation/types';
import fs from 'fs';
import path from 'path';
import {
  shouldRetryError,
  calculateBackoffDelay,
  logRetry,
} from '../telemetry/error-reporter';

export { defaultNavigation };

/**
 * REQ-412: Initialize navigation data file
 * Creates initial navigation.yaml if it doesn't exist
 */
export function initializeNavigation(): void {
  const navigationFile = path.join(process.cwd(), 'content', 'navigation.yaml');

  // Only create if it doesn't exist
  if (fs.existsSync(navigationFile)) {
    return;
  }

  // YAML content with proper structure matching Keystatic schema
  const yamlContent = `menuItems:
  - label: About
    href: /about
    children:
      - label: Core Values
        href: /about-core-values
        external: false
      - label: Doctrinal Statement
        href: /about-doctrinal-statement
        external: false
      - label: Our Team
        href: /about-our-team
        external: false
  - label: Summer Camp
    href: /summer-camp
    children:
      - label: Camp Sessions
        href: /summer-camp-sessions
        external: false
      - label: What to Bring
        href: /summer-camp-what-to-bring
        external: false
      - label: Parent Info
        href: /summer-camp-parent-info
        external: false
      - label: FAQ
        href: /summer-camp-faq
        external: false
  - label: Join Our Team
    href: /work-at-camp
    children:
      - label: Summer Staff
        href: /summer-staff
        external: false
      - label: Leaders in Training
        href: /work-at-camp-leaders-in-training
        external: false
  - label: Ignite Retreat
    href: /retreats-ignite
    children: []
  - label: Rentals
    href: /rentals
    children:
      - label: Cabins & Lodging
        href: /rentals-cabins
        external: false
      - label: Dining Hall
        href: /rentals-dining-hall
        external: false
      - label: Outdoor Spaces
        href: /rentals-outdoor-spaces
        external: false
  - label: Give
    href: /give
    children: []
  - label: Contact
    href: /contact
    children: []
primaryCTA:
  label: Register Now
  href: https://www.ultracamp.com/clientlogin.aspx?idCamp=1342&campcode=OTY
  external: true
`;

  // Ensure directory exists
  const dir = path.dirname(navigationFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(navigationFile, yamlContent, 'utf-8');
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * REQ-414: Navigation Reader Function
 * REQ-P0-2: With retry logic and error telemetry
 * Fetches navigation data from Keystatic, with fallback to defaultNavigation
 */
export async function getNavigation(): Promise<NavigationConfig> {
  const MAX_ATTEMPTS = 4; // 1 initial + 3 retries
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      // Try to read from Keystatic
      const navigationData = await reader().singletons.siteNavigation.read();

      if (!navigationData) {
        return defaultNavigation;
      }

      // Transform Keystatic data to NavigationConfig format
      const config: NavigationConfig = {
        logo: defaultNavigation.logo, // Logo stays in default config (REQ-415)
        menuItems: navigationData.menuItems.map((item) => ({
          label: item.label,
          href: item.href || undefined,
          children: item.children?.map((child) => ({
            label: child.label,
            href: child.href,
            external: child.external,
          })),
        })),
        primaryCTA: {
          label: navigationData.primaryCTA.label,
          href: navigationData.primaryCTA.href,
          external: navigationData.primaryCTA.external,
        },
      };

      return config;
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (shouldRetryError(lastError, attempt)) {
        const delay = calculateBackoffDelay(attempt);

        // Log retry attempt
        logRetry({
          attempt: attempt + 1,
          maxAttempts: 3,
          delay,
          error: { message: lastError.message },
        });

        // Wait before retrying
        await sleep(delay);
        continue;
      } else {
        // Fatal error or max retries exhausted - log and return default
        break;
      }
    }
  }

  return defaultNavigation;
}
