/**
 * REQ-PM-007: Migrate WordPress image URLs to local paths
 *
 * This script finds all WordPress image URLs in .mdoc files and replaces them
 * with local /images/ paths based on filename matching.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

interface MigrationStats {
  filesProcessed: number;
  filesModified: number;
  urlsReplaced: number;
  imagesNotFound: string[];
  replacements: Array<{
    file: string;
    from: string;
    to: string;
  }>;
}

/**
 * Build a map of local image filenames to their public paths
 */
async function buildImageMap(): Promise<Map<string, string>> {
  const imageMap = new Map<string, string>();

  // Find all images in public/images directory
  const localImages = await glob('public/images/**/*.{jpg,png,webp,gif,jpeg,JPG,PNG}', {
    cwd: process.cwd(),
  });

  localImages.forEach(localPath => {
    const filename = path.basename(localPath).toLowerCase();
    const publicPath = '/' + localPath.replace('public/', '');

    // Store both the exact filename and normalized version
    imageMap.set(filename, publicPath);

    // Also store without file extension for fuzzy matching
    const nameWithoutExt = filename.replace(/\.(jpg|jpeg|png|webp|gif)$/i, '');
    if (!imageMap.has(nameWithoutExt)) {
      imageMap.set(nameWithoutExt, publicPath);
    }
  });

  console.log(`Built image map with ${imageMap.size} entries from ${localImages.length} images`);
  return imageMap;
}

/**
 * Normalize filename for fuzzy matching (lowercase, replace periods with hyphens)
 */
function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase()
    .replace(/\./g, '-') // Replace periods with hyphens (Jr. -> jr-)
    .replace(/_/g, '-'); // Replace underscores with hyphens
}

/**
 * Extract base name from filename, removing size suffixes and extensions
 */
function extractBaseName(filename: string): string {
  const normalized = normalizeFilename(filename)
    .replace(/-\d+x\d+/g, '') // Remove -1024x683 style sizes
    .replace(/-scaled/g, '') // Remove -scaled suffix
    .replace(/-e\d+/g, '') // Remove -e1731003336225 style timestamps
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, ''); // Remove extension

  // Special case: "jr-" (from "Jr.") should match "jr-high-"
  return normalized
    .replace(/^jr--/i, 'jr-high-')
    .replace(/^jr-(?!high)/i, 'jr-high-');
}

/**
 * Find the best matching local image path for a WordPress URL
 */
function findLocalImagePath(wpUrl: string, imageMap: Map<string, string>): string | null {
  // Extract filename from WordPress URL
  const urlParts = wpUrl.split('/');
  const wpFilename = urlParts[urlParts.length - 1];
  const wpNormalized = normalizeFilename(wpFilename);
  const wpBaseName = extractBaseName(wpFilename);

  // Try exact match first (case-insensitive)
  if (imageMap.has(wpNormalized)) {
    return imageMap.get(wpNormalized) || null;
  }

  // Try all images in the map for fuzzy matching
  for (const [localFilename, localPath] of imageMap.entries()) {
    const localBaseName = extractBaseName(localFilename);

    // Match on base name (most flexible)
    if (wpBaseName === localBaseName) {
      return localPath;
    }

    // Also try matching the basename without the size suffix from WP side
    const wpWithoutSize = wpNormalized
      .replace(/-\d+x\d+/g, '')
      .replace(/-scaled/g, '')
      .replace(/-e\d+/g, '');

    const localWithoutSize = normalizeFilename(localFilename)
      .replace(/-\d+x\d+/g, '')
      .replace(/-scaled/g, '')
      .replace(/-e\d+/g, '');

    if (wpWithoutSize === localWithoutSize) {
      return localPath;
    }
  }

  return null;
}

/**
 * Process a single .mdoc file and replace WordPress image URLs
 */
function processMdocFile(
  filePath: string,
  imageMap: Map<string, string>,
  dryRun: boolean,
  stats: MigrationStats
): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let newContent = content;

  // Match WordPress URLs in various formats:
  // 1. In YAML frontmatter: heroImage: "http://www.bearlakecamp.com/..."
  // 2. In YAML arrays: image: "https://www.bearlakecamp.com/..."
  // 3. In markdown: ![alt](https://www.bearlakecamp.com/...)
  const wpUrlPattern = /https?:\/\/(?:www\.)?bearlakecamp\.com\/wp-content\/uploads\/[^\s"')]+?\.(jpg|jpeg|png|webp|gif)/gi;

  const matches = content.matchAll(wpUrlPattern);

  for (const match of matches) {
    const wpUrl = match[0];
    const localPath = findLocalImagePath(wpUrl, imageMap);

    if (localPath) {
      newContent = newContent.replace(wpUrl, localPath);
      modified = true;
      stats.urlsReplaced++;
      stats.replacements.push({
        file: path.basename(filePath),
        from: wpUrl,
        to: localPath,
      });
      console.log(`  ✓ ${path.basename(filePath)}: ${path.basename(wpUrl)} -> ${localPath}`);
    } else {
      const filename = path.basename(wpUrl);
      stats.imagesNotFound.push(filename);
      console.warn(`  ⚠ ${path.basename(filePath)}: Image not found locally: ${filename}`);
    }
  }

  stats.filesProcessed++;

  if (modified) {
    stats.filesModified++;
    if (!dryRun) {
      fs.writeFileSync(filePath, newContent, 'utf-8');
      console.log(`  📝 Updated: ${path.basename(filePath)}`);
    }
  }
}

/**
 * Main migration function
 */
async function migrateImagePaths(dryRun = true): Promise<MigrationStats> {
  const stats: MigrationStats = {
    filesProcessed: 0,
    filesModified: 0,
    urlsReplaced: 0,
    imagesNotFound: [],
    replacements: [],
  };

  console.log('\n🔍 Building local image index...\n');
  const imageMap = await buildImageMap();

  console.log('\n📄 Processing .mdoc files...\n');
  const mdocFiles = await glob('content/pages/*.mdoc', {
    cwd: process.cwd(),
  });

  for (const file of mdocFiles) {
    processMdocFile(file, imageMap, dryRun, stats);
  }

  return stats;
}

/**
 * Print migration summary report
 */
function printReport(stats: MigrationStats, dryRun: boolean): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nMode: ${dryRun ? '🔍 DRY RUN (no changes written)' : '✅ APPLIED CHANGES'}`);
  console.log(`\nFiles processed: ${stats.filesProcessed}`);
  console.log(`Files modified: ${stats.filesModified}`);
  console.log(`URLs replaced: ${stats.urlsReplaced}`);
  console.log(`Images not found: ${stats.imagesNotFound.length}`);

  if (stats.imagesNotFound.length > 0) {
    console.log('\n⚠️  Missing Images:');
    const uniqueMissing = [...new Set(stats.imagesNotFound)];
    uniqueMissing.forEach(img => console.log(`   - ${img}`));
  }

  if (stats.replacements.length > 0) {
    console.log('\n✅ Replacements Made:');
    stats.replacements.forEach(({ file, from, to }) => {
      console.log(`   ${file}:`);
      console.log(`     FROM: ${from}`);
      console.log(`     TO:   ${to}`);
    });
  }

  if (dryRun && stats.filesModified > 0) {
    console.log('\n💡 To apply these changes, run:');
    console.log('   npx tsx scripts/migrate-image-paths.ts --apply');
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Entry point
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');

  console.log('\n' + '='.repeat(60));
  console.log('🖼️  Image Path Migration Tool');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'APPLY CHANGES'}`);
  console.log('='.repeat(60));

  try {
    const stats = await migrateImagePaths(dryRun);
    printReport(stats, dryRun);

    // Note: We don't exit with error if images aren't found - this is expected
    // The script will keep the original WordPress URLs for missing images
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

main();
