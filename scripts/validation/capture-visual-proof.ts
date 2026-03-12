/**
 * Visual Proof Capture Utility
 * REQ-PROC-004: Screenshot capture for visual verification
 *
 * Integrates with Playwright to capture screenshots during test runs
 * and stores them with requirement-based naming.
 *
 * @module capture-visual-proof
 */

import type { Page, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export type VisualProofConfig = {
  /** Base directory for screenshots (default: verification-screenshots/) */
  outputDir?: string;
  /** Whether to include timestamp in filename (default: true) */
  includeTimestamp?: boolean;
  /** Whether to create subdirectories by requirement ID (default: false) */
  organizeByRequirement?: boolean;
  /** Screenshot quality 0-100 (default: 90) */
  quality?: number;
  /** Full page screenshot (default: true) */
  fullPage?: boolean;
};

export type VisualProofMetadata = {
  /** Requirement ID (e.g., REQ-PROC-004) */
  requirementId: string;
  /** Description of what the screenshot proves */
  description: string;
  /** Page URL at time of capture */
  url?: string;
  /** Test name from Playwright */
  testName?: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
};

export type VisualProofResult = {
  /** Path to saved screenshot */
  path: string;
  /** Filename of screenshot */
  filename: string;
  /** Requirement ID */
  requirementId: string;
  /** Timestamp of capture */
  timestamp: string;
  /** Full metadata */
  metadata: VisualProofMetadata;
};

export class VisualProofCapture {
  private config: Required<VisualProofConfig>;
  private projectRoot: string;

  constructor(config: VisualProofConfig = {}) {
    this.projectRoot = path.resolve(__dirname, '../..');
    this.config = {
      outputDir: config.outputDir || 'verification-screenshots',
      includeTimestamp: config.includeTimestamp ?? true,
      organizeByRequirement: config.organizeByRequirement ?? false,
      quality: config.quality ?? 90,
      fullPage: config.fullPage ?? true,
    };
  }

  /**
   * Capture a screenshot with requirement-based naming
   *
   * @param page - Playwright page instance
   * @param metadata - Metadata about the visual proof
   * @returns Result with path and metadata
   */
  async capture(
    page: Page,
    metadata: VisualProofMetadata
  ): Promise<VisualProofResult> {
    const timestamp = this.generateTimestamp();
    const filename = this.generateFilename(metadata.requirementId, timestamp);
    const outputPath = this.resolveOutputPath(
      metadata.requirementId,
      filename
    );

    // Ensure output directory exists
    this.ensureDirectoryExists(path.dirname(outputPath));

    // Capture screenshot
    await page.screenshot({
      path: outputPath,
      fullPage: this.config.fullPage,
      quality: this.config.quality,
    });

    // Capture current URL if not provided
    const url = metadata.url || page.url();

    // Create result
    const result: VisualProofResult = {
      path: outputPath,
      filename,
      requirementId: metadata.requirementId,
      timestamp,
      metadata: {
        ...metadata,
        url,
      },
    };

    // Write metadata file
    await this.writeMetadata(result);

    return result;
  }

  /**
   * Capture multiple screenshots from a test
   *
   * @param page - Playwright page instance
   * @param captures - Array of capture metadata
   * @returns Array of results
   */
  async captureMultiple(
    page: Page,
    captures: VisualProofMetadata[]
  ): Promise<VisualProofResult[]> {
    const results: VisualProofResult[] = [];

    for (const metadata of captures) {
      const result = await this.capture(page, metadata);
      results.push(result);
    }

    return results;
  }

  /**
   * Capture screenshot with automatic test info integration
   *
   * @param page - Playwright page instance
   * @param testInfo - Playwright test info
   * @param requirementId - Requirement ID
   * @param description - Description of visual proof
   * @returns Result with path and metadata
   */
  async captureFromTest(
    page: Page,
    testInfo: TestInfo,
    requirementId: string,
    description: string
  ): Promise<VisualProofResult> {
    return this.capture(page, {
      requirementId,
      description,
      testName: testInfo.title,
      url: page.url(),
      metadata: {
        project: testInfo.project.name,
        file: testInfo.file,
        line: testInfo.line,
      },
    });
  }

  /**
   * Generate manifest of all captured screenshots
   *
   * @param outputPath - Path to write manifest (default: verification-screenshots/manifest.json)
   * @returns Manifest data
   */
  async generateManifest(
    outputPath?: string
  ): Promise<VisualProofManifest> {
    const manifestPath =
      outputPath || path.join(this.getOutputDir(), 'manifest.json');
    const screenshots = await this.findAllScreenshots();

    const manifest: VisualProofManifest = {
      generated: new Date().toISOString(),
      totalCount: screenshots.length,
      byRequirement: this.groupByRequirement(screenshots),
      screenshots,
    };

    await fs.promises.writeFile(
      manifestPath,
      JSON.stringify(manifest, null, 2)
    );

    return manifest;
  }

  /**
   * Clean old screenshots (older than specified days)
   *
   * @param daysToKeep - Number of days to keep screenshots (default: 30)
   * @returns Number of files deleted
   */
  async cleanOldScreenshots(daysToKeep = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    const cutoffTimestamp = cutoffDate.getTime();

    const outputDir = this.getOutputDir();
    const files = await this.findAllScreenshotFiles();

    let deletedCount = 0;

    for (const file of files) {
      const stats = await fs.promises.stat(file);
      if (stats.mtime.getTime() < cutoffTimestamp) {
        await fs.promises.unlink(file);
        deletedCount++;

        // Also delete associated metadata file
        const metadataFile = file.replace(/\.png$/, '.meta.json');
        if (fs.existsSync(metadataFile)) {
          await fs.promises.unlink(metadataFile);
        }
      }
    }

    return deletedCount;
  }

  // Private helper methods

  private generateTimestamp(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '');
  }

  private generateFilename(requirementId: string, timestamp: string): string {
    const parts = [requirementId];

    if (this.config.includeTimestamp) {
      parts.push(timestamp);
    }

    return `${parts.join('-')}.png`;
  }

  private resolveOutputPath(requirementId: string, filename: string): string {
    const outputDir = this.getOutputDir();

    if (this.config.organizeByRequirement) {
      return path.join(outputDir, requirementId, filename);
    }

    return path.join(outputDir, filename);
  }

  private getOutputDir(): string {
    return path.join(this.projectRoot, this.config.outputDir);
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async writeMetadata(result: VisualProofResult): Promise<void> {
    const metadataPath = result.path.replace(/\.png$/, '.meta.json');

    const metadata = {
      requirementId: result.requirementId,
      timestamp: result.timestamp,
      filename: result.filename,
      description: result.metadata.description,
      url: result.metadata.url,
      testName: result.metadata.testName,
      metadata: result.metadata.metadata,
    };

    await fs.promises.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2)
    );
  }

  private async findAllScreenshots(): Promise<VisualProofResult[]> {
    const files = await this.findAllScreenshotFiles();
    const results: VisualProofResult[] = [];

    for (const file of files) {
      const metadataFile = file.replace(/\.png$/, '.meta.json');

      if (fs.existsSync(metadataFile)) {
        const metadataContent = await fs.promises.readFile(
          metadataFile,
          'utf-8'
        );
        const metadata = JSON.parse(metadataContent);

        results.push({
          path: file,
          filename: path.basename(file),
          requirementId: metadata.requirementId,
          timestamp: metadata.timestamp,
          metadata,
        });
      }
    }

    return results;
  }

  private async findAllScreenshotFiles(): Promise<string[]> {
    const outputDir = this.getOutputDir();

    if (!fs.existsSync(outputDir)) {
      return [];
    }

    const files: string[] = [];

    const scanDir = async (dir: string): Promise<void> => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await scanDir(fullPath);
        } else if (entry.name.endsWith('.png')) {
          files.push(fullPath);
        }
      }
    };

    await scanDir(outputDir);

    return files;
  }

  private groupByRequirement(
    screenshots: VisualProofResult[]
  ): Record<string, number> {
    const groups: Record<string, number> = {};

    for (const screenshot of screenshots) {
      const reqId = screenshot.requirementId;
      groups[reqId] = (groups[reqId] || 0) + 1;
    }

    return groups;
  }
}

export type VisualProofManifest = {
  generated: string;
  totalCount: number;
  byRequirement: Record<string, number>;
  screenshots: VisualProofResult[];
};

/**
 * Playwright custom reporter for visual proof capture
 *
 * Usage in playwright.config.ts:
 * ```
 * reporter: [
 *   ['./scripts/validation/visual-proof-reporter.ts'],
 *   ['html']
 * ]
 * ```
 */
export class VisualProofReporter {
  private capture: VisualProofCapture;
  private results: VisualProofResult[] = [];

  constructor(config?: VisualProofConfig) {
    this.capture = new VisualProofCapture(config);
  }

  onEnd() {
    // Generate manifest after all tests complete
    this.capture.generateManifest().then((manifest) => {
      console.log('\n========================================');
      console.log('Visual Proof Capture Summary');
      console.log('========================================');
      console.log(`Total screenshots: ${manifest.totalCount}`);
      console.log('\nBy Requirement:');

      for (const [reqId, count] of Object.entries(manifest.byRequirement)) {
        console.log(`  ${reqId}: ${count} screenshot(s)`);
      }

      console.log('\nManifest saved to:');
      console.log(
        `  ${path.join(this.capture['getOutputDir'](), 'manifest.json')}`
      );
      console.log('========================================\n');
    });
  }

  recordCapture(result: VisualProofResult) {
    this.results.push(result);
  }
}

// Singleton instance for use in tests
export const visualProof = new VisualProofCapture();

/**
 * Helper function to capture visual proof in tests
 *
 * @example
 * ```typescript
 * import { captureVisualProof } from '@/scripts/validation/capture-visual-proof';
 *
 * test('hero section renders correctly', async ({ page }) => {
 *   await page.goto('/');
 *   await captureVisualProof(page, {
 *     requirementId: 'REQ-HERO-001',
 *     description: 'Hero section with video background'
 *   });
 * });
 * ```
 */
export async function captureVisualProof(
  page: Page,
  metadata: VisualProofMetadata
): Promise<VisualProofResult> {
  return visualProof.capture(page, metadata);
}

/**
 * Helper function to capture visual proof with test info
 */
export async function captureVisualProofFromTest(
  page: Page,
  testInfo: TestInfo,
  requirementId: string,
  description: string
): Promise<VisualProofResult> {
  return visualProof.captureFromTest(page, testInfo, requirementId, description);
}
