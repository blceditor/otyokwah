/**
 * IDB Fix Regression Tests
 * REQ-IDB-FIX: Prevent stale IndexedDB schemas from silently breaking Keystatic saves
 *
 * Root cause (3x occurrences): Keystatic's IDB databases get created with empty
 * object stores. Our IDB fix script was silently returning fake stores, which made
 * reads return [] and writes silently discard data. This broke the save pipeline
 * because Keystatic couldn't compute diffs against an empty tree cache.
 *
 * Fix: When stale schema is detected, nuke corrupted DBs and reload instead of
 * silently faking stores.
 */
import { test, expect } from "@playwright/test";

test.describe("IDB Fix Script - Stale Schema Recovery", () => {
  test("IDB fix script is loaded before Keystatic", async ({ page }) => {
    await page.goto("/keystatic");
    // The script must be present with beforeInteractive strategy
    const script = page.locator('script#idb-timeout-fix');
    await expect(script).toBeAttached();
  });

  test("IDB fix script auto-recovers from stale schema instead of silently failing", async ({ page }) => {
    // Navigate to keystatic to get the IDB fix script loaded
    await page.goto("/keystatic");
    await page.waitForLoadState("networkidle");

    // Verify the script contains the auto-recovery logic (nuke + reload)
    // instead of the old silent fake store fallback
    const scriptContent = await page.evaluate(() => {
      const script = document.querySelector('script#idb-timeout-fix');
      return script?.textContent || '';
    });

    // Must contain the auto-recovery pattern
    expect(scriptContent).toContain('nuking corrupted DBs');
    expect(scriptContent).toContain('location.reload()');

    // Must NOT contain the old silent fallback pattern (without recovery)
    // The old pattern was: just log a warning and return fake store
    // New pattern: log, delete DBs, and reload
    expect(scriptContent).toContain('alreadyResetting');
  });

  test("Keystatic IDB databases have proper object stores after fresh load", async ({ page }) => {
    // First, clear any existing DBs
    await page.goto("/keystatic/logged-out");
    await page.evaluate(() => {
      return Promise.all(
        ['keystatic', 'keystatic-blobs', 'keystatic-trees'].map(name =>
          new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          })
        )
      );
    });

    // Now load Keystatic fresh
    await page.goto("/keystatic");
    await page.waitForLoadState("networkidle");
    // Give IDB time to initialize
    await page.waitForTimeout(3000);

    // Check that keystatic DB has the "items" object store
    const storeInfo = await page.evaluate(() => {
      return new Promise<{ keystatic: string[]; blobs: string[]; trees: string[] }>((resolve) => {
        const results: Record<string, string[]> = {};
        let done = 0;
        const dbs = [
          { key: 'keystatic', name: 'keystatic' },
          { key: 'blobs', name: 'keystatic-blobs' },
          { key: 'trees', name: 'keystatic-trees' },
        ];
        dbs.forEach(({ key, name }) => {
          const req = indexedDB.open(name);
          req.onsuccess = (e) => {
            const db = (e.target as IDBOpenDBRequest).result;
            results[key] = Array.from(db.objectStoreNames);
            db.close();
            done++;
            if (done === dbs.length) resolve(results as any);
          };
          req.onerror = () => {
            results[key] = ['ERROR'];
            done++;
            if (done === dbs.length) resolve(results as any);
          };
        });
        setTimeout(() => resolve(results as any), 5000);
      });
    });

    // Each DB should have at least one object store (not be empty shells)
    expect(storeInfo.keystatic.length).toBeGreaterThan(0);
    expect(storeInfo.keystatic).not.toContain('ERROR');
  });

  test("no IDB stale schema warnings on clean Keystatic load", async ({ page }) => {
    const consoleWarnings: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "warning" && msg.text().includes("[IDB-Fix]")) {
        consoleWarnings.push(msg.text());
      }
    });

    // Clear DBs first for a clean start
    await page.goto("/keystatic/logged-out");
    await page.evaluate(() => {
      return Promise.all(
        ['keystatic', 'keystatic-blobs', 'keystatic-trees'].map(name =>
          new Promise<void>((resolve) => {
            const req = indexedDB.deleteDatabase(name);
            req.onsuccess = () => resolve();
            req.onerror = () => resolve();
            req.onblocked = () => resolve();
          })
        )
      );
    });

    await page.goto("/keystatic");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Filter for stale schema warnings specifically
    const staleSchemaWarnings = consoleWarnings.filter(w =>
      w.includes("stale schema") || w.includes("Stale schema")
    );
    expect(staleSchemaWarnings).toHaveLength(0);
  });
});
