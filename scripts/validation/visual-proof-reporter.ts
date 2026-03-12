/**
 * Playwright Custom Reporter for Visual Proof Capture
 * REQ-PROC-004: Logs screenshot paths for visual requirements
 *
 * @module visual-proof-reporter
 */

import type {
  Reporter,
  FullConfig,
  Suite,
  TestCase,
  TestResult,
  FullResult,
} from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

type VisualProofEntry = {
  testFile: string;
  testName: string;
  requirementId: string;
  screenshotPath: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'skipped';
  url?: string;
};

type VisualProofReport = {
  generated: string;
  totalTests: number;
  totalScreenshots: number;
  byRequirement: Record<string, VisualProofEntry[]>;
  byStatus: {
    passed: number;
    failed: number;
    skipped: number;
  };
  entries: VisualProofEntry[];
};

/**
 * Custom Playwright reporter that tracks visual proof screenshots
 *
 * Configuration in playwright.config.ts:
 * ```typescript
 * reporter: [
 *   ['./scripts/validation/visual-proof-reporter.ts', {
 *     outputFile: 'verification-screenshots/visual-proof-report.json',
 *     logToConsole: true
 *   }],
 *   ['html']
 * ]
 * ```
 */
class VisualProofReporter implements Reporter {
  private config: {
    outputFile: string;
    logToConsole: boolean;
  };

  private entries: VisualProofEntry[] = [];
  private projectRoot: string;

  constructor(
    options: {
      outputFile?: string;
      logToConsole?: boolean;
    } = {}
  ) {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.config = {
      outputFile:
        options.outputFile ||
        'verification-screenshots/visual-proof-report.json',
      logToConsole: options.logToConsole ?? true,
    };
  }

  onBegin(config: FullConfig, suite: Suite) {
    if (this.config.logToConsole) {
      console.log('\n========================================');
      console.log('Visual Proof Reporter: Starting');
      console.log('========================================\n');
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Extract requirement IDs from test title or description
    const requirementIds = this.extractRequirementIds(test);

    if (requirementIds.length === 0) {
      return; // Not a visual requirement test
    }

    // Find screenshots in test attachments
    const screenshots = result.attachments.filter(
      (a) => a.name === 'screenshot' && a.path
    );

    // If no screenshots in attachments, check for visual proof captures
    const visualProofScreenshots = this.findVisualProofScreenshots(test, result);

    const allScreenshots = [...screenshots, ...visualProofScreenshots];

    if (allScreenshots.length === 0) {
      return; // No screenshots captured
    }

    // Record each screenshot with requirement association
    for (const requirementId of requirementIds) {
      for (const screenshot of allScreenshots) {
        const entry: VisualProofEntry = {
          testFile: test.location.file,
          testName: test.title,
          requirementId,
          screenshotPath: screenshot.path || '',
          timestamp: new Date().toISOString(),
          status: this.getTestStatus(result),
        };

        this.entries.push(entry);

        if (this.config.logToConsole) {
          console.log(`[VISUAL PROOF] ${requirementId}: ${screenshot.path}`);
        }
      }
    }
  }

  async onEnd(result: FullResult) {
    // Generate report
    const report = this.generateReport();

    // Write to file
    const outputPath = path.join(this.projectRoot, this.config.outputFile);
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    await fs.promises.writeFile(
      outputPath,
      JSON.stringify(report, null, 2),
      'utf-8'
    );

    if (this.config.logToConsole) {
      this.printSummary(report);
    }
  }

  private extractRequirementIds(test: TestCase): string[] {
    const ids: string[] = [];

    // Check test title for requirement IDs (e.g., "REQ-PROC-004: Description")
    const titleMatch = test.title.match(/REQ-[A-Z0-9]+-\d+/g);
    if (titleMatch) {
      ids.push(...titleMatch);
    }

    // Check test suite title
    let suite: Suite | undefined = test.parent;
    while (suite) {
      const suiteMatch = suite.title.match(/REQ-[A-Z0-9]+-\d+/g);
      if (suiteMatch) {
        ids.push(...suiteMatch);
      }
      suite = suite.parent;
    }

    // Remove duplicates
    return Array.from(new Set(ids));
  }

  private findVisualProofScreenshots(
    test: TestCase,
    result: TestResult
  ): Array<{ path: string; name: string }> {
    const screenshots: Array<{ path: string; name: string }> = [];
    const screenshotDir = path.join(
      this.projectRoot,
      'verification-screenshots'
    );

    if (!fs.existsSync(screenshotDir)) {
      return screenshots;
    }

    // Look for screenshots matching test file and timestamp
    const testFileName = path.basename(test.location.file, '.spec.ts');
    const files = fs.readdirSync(screenshotDir);

    for (const file of files) {
      if (file.endsWith('.png') && file.includes('REQ-')) {
        const fullPath = path.join(screenshotDir, file);
        const stats = fs.statSync(fullPath);

        // Check if screenshot was created during this test run (within 1 minute)
        const timeDiff = Date.now() - stats.mtime.getTime();
        if (timeDiff < 60000) {
          screenshots.push({ path: fullPath, name: 'screenshot' });
        }
      }
    }

    return screenshots;
  }

  private getTestStatus(
    result: TestResult
  ): 'passed' | 'failed' | 'skipped' {
    if (result.status === 'passed') return 'passed';
    if (result.status === 'failed') return 'failed';
    return 'skipped';
  }

  private generateReport(): VisualProofReport {
    const byRequirement: Record<string, VisualProofEntry[]> = {};
    const byStatus = {
      passed: 0,
      failed: 0,
      skipped: 0,
    };

    for (const entry of this.entries) {
      // Group by requirement
      if (!byRequirement[entry.requirementId]) {
        byRequirement[entry.requirementId] = [];
      }
      byRequirement[entry.requirementId].push(entry);

      // Count by status
      byStatus[entry.status]++;
    }

    return {
      generated: new Date().toISOString(),
      totalTests: new Set(this.entries.map((e) => e.testFile)).size,
      totalScreenshots: this.entries.length,
      byRequirement,
      byStatus,
      entries: this.entries,
    };
  }

  private printSummary(report: VisualProofReport) {
    console.log('\n========================================');
    console.log('Visual Proof Reporter: Summary');
    console.log('========================================');
    console.log(`Total tests with visual proofs: ${report.totalTests}`);
    console.log(`Total screenshots captured: ${report.totalScreenshots}`);
    console.log('\nBy Status:');
    console.log(`  Passed: ${report.byStatus.passed}`);
    console.log(`  Failed: ${report.byStatus.failed}`);
    console.log(`  Skipped: ${report.byStatus.skipped}`);
    console.log('\nBy Requirement:');

    for (const [reqId, entries] of Object.entries(report.byRequirement)) {
      console.log(`  ${reqId}: ${entries.length} screenshot(s)`);
    }

    console.log('\nReport saved to:');
    console.log(`  ${this.config.outputFile}`);
    console.log('========================================\n');
  }
}

export default VisualProofReporter;
