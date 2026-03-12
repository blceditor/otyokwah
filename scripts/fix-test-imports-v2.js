#!/usr/bin/env node
/**
 * REQ-000: Fix component test imports (v2 - proper placement)
 * Converts require() calls to ES6 import statements at file top
 */

const fs = require('fs');
const path = require('path');

const testFiles = [
  'components/keystatic/ProductionLink.spec.tsx',
  'app/keystatic/[[...params]]/page.spec.tsx',
  'components/content/Timeline.spec.tsx',
  'components/content/StatsCounter.spec.tsx',
  'components/keystatic/GenerateSEOButton.spec.tsx',
  'components/keystatic/BugReportModal.spec.tsx',
  'components/content/Accordion.spec.tsx',
  'components/content/Hero.spec.tsx',
  'components/content/PricingTable.spec.tsx',
  'components/content/SplitContent.spec.tsx',
  'components/content/Testimonial.spec.tsx',
  'components/content/FeatureGrid.spec.tsx',
  'components/keystatic/SparkryBranding.spec.tsx',
  'components/keystatic/DeploymentStatus.spec.tsx',
  'components/homepage/ProgramCard.spec.tsx',
  'components/content/TableOfContents.spec.tsx',
  'components/content/ImageGallery.spec.tsx',
  'components/content/Callout.spec.tsx',
  'components/content/Button.spec.tsx',
  'components/OptimizedImage.spec.tsx',
];

function fixTestFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Extract all imports needed from require() calls
  const imports = new Map(); // modulePath -> Set of componentNames

  // Find all patterns:
  // const { ComponentName } = require('./path');
  // const ComponentName = require('./path');
  const requirePattern = /(?:\/\/\s*@ts-ignore[^\n]*\n\s*)?const\s+(?:\{\s*(\w+)\s*\}|(\w+))\s*=\s*require\(['"](\.\/[^'"]+)['"]\);?/g;

  let match;
  while ((match = requirePattern.exec(content)) !== null) {
    const componentName = match[1] || match[2]; // Destructured or direct
    const modulePath = match[3];

    if (!imports.has(modulePath)) {
      imports.set(modulePath, new Set());
    }
    imports.get(modulePath).add(componentName);
  }

  if (imports.size === 0) {
    console.log(`⏭️  No require() calls found: ${filePath}`);
    return false;
  }

  // Remove all require() calls and @ts-ignore comments
  content = content.replace(/\/\/\s*@ts-ignore[^\n]*\n\s*const\s+(?:\{\s*\w+\s*\}|\w+)\s*=\s*require\(['"]\.[^)]+\);?\n?/g, '');

  // Also remove any standalone "import X from './Y';" that might have been incorrectly added inside functions
  content = content.replace(/^\s*import\s+\w+\s+from\s+['"]\.[^'"]+['"];?\n?/gm, '');

  // Build import statements
  const importStatements = [];
  for (const [modulePath, components] of imports.entries()) {
    const componentList = Array.from(components);
    if (componentList.length === 1) {
      importStatements.push(`import ${componentList[0]} from '${modulePath}';`);
    } else {
      // Multiple exports from same module
      importStatements.push(`import { ${componentList.join(', ')} } from '${modulePath}';`);
    }
  }

  // Find the last import statement in the file
  const importRegex = /^import\s+.*?['"];?\s*$/gm;
  let lastImportIndex = -1;
  let lastImportMatch;

  while ((lastImportMatch = importRegex.exec(content)) !== null) {
    lastImportIndex = lastImportMatch.index + lastImportMatch[0].length;
  }

  if (lastImportIndex === -1) {
    // No imports found, add after first line (probably a comment)
    const firstNewline = content.indexOf('\n');
    if (firstNewline !== -1) {
      content = content.slice(0, firstNewline + 1) +
                importStatements.join('\n') + '\n' +
                content.slice(firstNewline + 1);
    }
  } else {
    // Insert after last import
    content = content.slice(0, lastImportIndex) +
              '\n' + importStatements.join('\n') +
              content.slice(lastImportIndex);
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath} (added ${imports.size} imports, removed inline require() calls)`);
    return true;
  }

  return false;
}

let fixedCount = 0;
for (const file of testFiles) {
  if (fixTestFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} out of ${testFiles.length} files`);
