#!/usr/bin/env tsx
// REQ-TEST-002: Image Existence Verification Script
// Verifies all hardcoded image paths exist in /public directory

import fs from 'fs';
import path from 'path';
import {glob} from 'glob';

interface ImageReference {
  file: string;
  line: number;
  imagePath: string;
}

/**
 * Extract image paths from source code
 * Matches patterns like:
 * - src="/images/..."
 * - src='/images/...'
 * - src={"/images/..."}
 * - src={'/images/...'}
 * - <img src="..." />
 * - <Image src="..." />
 */
function extractImagePaths(content: string, filePath: string): ImageReference[] {
  const references: ImageReference[] = [];
  const lines = content.split('\n');

  // Patterns to match image paths
  const patterns = [
    // JSX/TSX src attributes with quotes
    /src=["']([^"']+)["']/g,
    // JSX/TSX src attributes with template literals
    /src=\{["'`]([^"'`]+)["'`]\}/g,
  ];

  lines.forEach((line, index) => {
    patterns.forEach(pattern => {
      const matches = line.matchAll(pattern);
      for (const match of matches) {
        const imagePath = match[1];
        // Only include paths that look like images (start with / or contain image extensions)
        if (
          imagePath.startsWith('/images/') ||
          imagePath.startsWith('/uploads/') ||
          /\.(jpg|jpeg|png|gif|svg|webp|avif|ico)$/i.test(imagePath)
        ) {
          references.push({
            file: filePath,
            line: index + 1,
            imagePath,
          });
        }
      }
    });
  });

  return references;
}

/**
 * Scan all component files for image references
 */
async function scanForImageReferences(): Promise<ImageReference[]> {
  const allReferences: ImageReference[] = [];

  // Scan component files (exclude tests and scripts)
  const componentFiles = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: process.cwd(),
    ignore: [
      'node_modules/**',
      '.next/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '**/*.spec.{ts,tsx,js,jsx}',
      '**/*.test.{ts,tsx,js,jsx}',
      'tests/**',
      'scripts/**',
    ],
  });

  for (const file of componentFiles) {
    const filePath = path.join(process.cwd(), file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const references = extractImagePaths(content, file);
    allReferences.push(...references);
  }

  return allReferences;
}

/**
 * Verify image exists in public directory
 * Returns true for external URLs (we don't verify those)
 */
function verifyImageExists(imagePath: string): boolean {
  // Skip external URLs - they don't need to be in public directory
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return true;
  }

  // Remove leading slash to create relative path from public directory
  const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  const fullPath = path.join(process.cwd(), 'public', relativePath);

  return fs.existsSync(fullPath);
}

/**
 * Main verification function
 */
async function main() {
  console.log('🔍 REQ-TEST-002: Scanning codebase for image references...\n');

  const references = await scanForImageReferences();

  console.log(`Found ${references.length} image references\n`);

  // Group references by image path
  const imagePathMap = new Map<string, ImageReference[]>();
  references.forEach(ref => {
    const existing = imagePathMap.get(ref.imagePath) || [];
    existing.push(ref);
    imagePathMap.set(ref.imagePath, existing);
  });

  const uniqueImages = Array.from(imagePathMap.keys());
  console.log(`Found ${uniqueImages.length} unique image paths\n`);

  // Verify each unique image exists
  const missingImages: Array<{path: string, references: ImageReference[]}> = [];

  for (const imagePath of uniqueImages) {
    const exists = verifyImageExists(imagePath);
    const refs = imagePathMap.get(imagePath)!;

    if (!exists) {
      missingImages.push({ path: imagePath, references: refs });
    }
  }

  // Report results
  if (missingImages.length === 0) {
    console.log('✅ All images exist!');
    process.exit(0);
  } else {
    console.error(`❌ Found ${missingImages.length} missing images:\n`);

    missingImages.forEach(({ path, references }) => {
      console.error(`  Missing: ${path}`);
      console.error(`  Referenced in:`);
      references.forEach(ref => {
        console.error(`    - ${ref.file}:${ref.line}`);
      });
      console.error('');
    });

    console.error(`\n❌ Image verification failed. ${missingImages.length} missing images found.`);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Error running image verification:', error);
  process.exit(1);
});
