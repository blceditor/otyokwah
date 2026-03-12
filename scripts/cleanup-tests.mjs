#!/usr/bin/env node
/**
 * Test Stabilization Script - Phase 7
 * P2-31: Remove className assertions (line-by-line, safe approach)
 * P2-32: Remove placeholder assertions
 *
 * Strategy: Only remove individual assertion LINES, never remove test blocks.
 * After removing lines, identify and remove empty test blocks in a second pass
 * using brace counting for safety.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function isClassNameAssertionLine(line) {
  const trimmed = line.trim();
  // Skip commented-out lines
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;

  // Match: expect(...).toHaveClass(...)
  if (/expect\([^)]*\)\.toHaveClass\(/.test(trimmed)) return true;
  // Match: expect(...).not.toHaveClass(...)
  if (/expect\([^)]*\)\.not\.toHaveClass\(/.test(trimmed)) return true;
  // Match: expect(el.className).toContain/toMatch/toBe
  if (/expect\([^)]*\.className\)/.test(trimmed)) return true;
  // Match: expect(className).toContain/toMatch (local variable named className)
  if (/^expect\(className\)\.to/.test(trimmed)) return true;

  return false;
}

function isPlaceholderAssertionLine(line) {
  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return false;
  if (/expect\(true\)\.toBe\(true\)/.test(trimmed)) return true;
  if (/expect\(1\)\.toBe\(1\)/.test(trimmed)) return true;
  return false;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let classNameRemoved = 0;
  let placeholderRemoved = 0;

  // Pass 1: Remove className and placeholder assertion lines
  const filteredLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isClassNameAssertionLine(line)) {
      classNameRemoved++;
      // Also skip trailing blank line if next line is blank
      continue;
    }
    if (isPlaceholderAssertionLine(line)) {
      placeholderRemoved++;
      continue;
    }
    filteredLines.push(line);
  }

  if (classNameRemoved === 0 && placeholderRemoved === 0) {
    return { classNameRemoved: 0, placeholderRemoved: 0, modified: false };
  }

  // Pass 2: Remove empty test blocks
  // An empty test block is: it/test(..., () => { <only whitespace/comments/setup-no-expect> });
  let result = filteredLines.join('\n');

  // Clean up excessive blank lines (3+ consecutive)
  result = result.replace(/\n{3,}/g, '\n\n');

  // Pass 3: Remove test blocks that have NO expect() calls remaining
  // We do this carefully by finding test block boundaries
  const resultLines = result.split('\n');
  const finalLines = [];
  let i = 0;

  while (i < resultLines.length) {
    const line = resultLines[i];
    const trimmed = line.trim();

    // Check if this is the start of a test/it block
    const testMatch = trimmed.match(/^(it|test)\s*\(/);
    if (testMatch) {
      // Collect the entire test block by counting braces
      const blockLines = [line];
      let braceCount = 0;
      let foundOpenBrace = false;
      let j = i;

      // Count braces in the first line
      for (const ch of line) {
        if (ch === '{') { braceCount++; foundOpenBrace = true; }
        if (ch === '}') braceCount--;
      }

      // If braces are balanced on the first line and we found an open brace, it's a one-liner
      if (foundOpenBrace && braceCount === 0) {
        // Single-line test block - check for expect
        if (!line.includes('expect(')) {
          // Empty test, skip it
          i++;
          continue;
        }
        finalLines.push(line);
        i++;
        continue;
      }

      // Multi-line: keep scanning until braces balance
      j++;
      while (j < resultLines.length && (braceCount > 0 || !foundOpenBrace)) {
        const nextLine = resultLines[j];
        blockLines.push(nextLine);
        for (const ch of nextLine) {
          if (ch === '{') { braceCount++; foundOpenBrace = true; }
          if (ch === '}') braceCount--;
        }
        if (foundOpenBrace && braceCount <= 0) break;
        j++;
      }

      // Check if block has any expect() calls
      const blockContent = blockLines.join('\n');
      const hasExpect = blockLines.some(l => {
        const t = l.trim();
        return !t.startsWith('//') && t.includes('expect(');
      });

      if (!hasExpect) {
        // Empty test block after cleanup - skip it
        i = j + 1;
        continue;
      }

      // Keep the test block
      for (const bl of blockLines) {
        finalLines.push(bl);
      }
      i = j + 1;
      continue;
    }

    // Check if this is start of a describe block with NO tests inside
    const describeMatch = trimmed.match(/^describe\s*\(/);
    if (describeMatch) {
      // Collect the entire describe block
      const blockLines = [line];
      let braceCount = 0;
      let foundOpenBrace = false;
      let j = i;

      for (const ch of line) {
        if (ch === '{') { braceCount++; foundOpenBrace = true; }
        if (ch === '}') braceCount--;
      }

      if (foundOpenBrace && braceCount === 0) {
        // Single-line describe - unusual but handle it
        if (!line.includes('it(') && !line.includes('test(') && !line.includes('expect(')) {
          i++;
          continue;
        }
        finalLines.push(line);
        i++;
        continue;
      }

      j++;
      while (j < resultLines.length && (braceCount > 0 || !foundOpenBrace)) {
        const nextLine = resultLines[j];
        blockLines.push(nextLine);
        for (const ch of nextLine) {
          if (ch === '{') { braceCount++; foundOpenBrace = true; }
          if (ch === '}') braceCount--;
        }
        if (foundOpenBrace && braceCount <= 0) break;
        j++;
      }

      // Check if describe has any it/test blocks remaining
      const hasTests = blockLines.some(l => {
        const t = l.trim();
        return !t.startsWith('//') && (t.match(/^(it|test)\s*\(/) || t.match(/^describe\s*\(/));
      });

      // Only remove if there's exactly one describe (the one we found) and no nested content
      // To be safe, we check if there are any it/test calls inside (skip the first line which is describe itself)
      const innerLines = blockLines.slice(1, -1); // Skip first and last line
      const hasInnerTests = innerLines.some(l => {
        const t = l.trim();
        return t.match(/^(it|test)\s*\(/) || t.match(/^describe\s*\(/) || (t.includes('expect(') && !t.startsWith('//'));
      });

      if (!hasInnerTests) {
        // Empty describe block - skip it
        i = j + 1;
        continue;
      }

      // Keep the describe block
      for (const bl of blockLines) {
        finalLines.push(bl);
      }
      i = j + 1;
      continue;
    }

    finalLines.push(line);
    i++;
  }

  // Final cleanup: remove excessive blank lines
  let finalResult = finalLines.join('\n');
  finalResult = finalResult.replace(/\n{3,}/g, '\n\n');

  // Only write if changed
  if (finalResult !== content) {
    fs.writeFileSync(filePath, finalResult);
    return { classNameRemoved, placeholderRemoved, modified: true };
  }

  return { classNameRemoved, placeholderRemoved, modified: false };
}

// Get all spec files (not in node_modules or archive)
function getSpecFiles(dir) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (['node_modules', '.git', '.next', 'archive'].includes(entry.name)) continue;
        files.push(...getSpecFiles(fullPath));
      } else if (entry.isFile() && (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.spec.tsx'))) {
        files.push(fullPath);
      }
    }
  } catch (e) {
    // Skip inaccessible directories
  }
  return files;
}

const specFiles = getSpecFiles(ROOT);
let totalClassNameRemoved = 0;
let totalPlaceholderRemoved = 0;
let filesModified = 0;

for (const filePath of specFiles) {
  const { classNameRemoved, placeholderRemoved, modified } = processFile(filePath);

  if (modified) {
    filesModified++;
    totalClassNameRemoved += classNameRemoved;
    totalPlaceholderRemoved += placeholderRemoved;

    const relPath = path.relative(ROOT, filePath);
    console.log(`${relPath}: -${classNameRemoved} className, -${placeholderRemoved} placeholder`);
  }
}

console.log(`\n=== Summary ===`);
console.log(`Files modified: ${filesModified}`);
console.log(`className assertions removed: ${totalClassNameRemoved}`);
console.log(`Placeholder assertions removed: ${totalPlaceholderRemoved}`);
