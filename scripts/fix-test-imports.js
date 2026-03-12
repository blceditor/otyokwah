#!/usr/bin/env node
/**
 * REQ-000: Fix component test imports
 * Converts require() calls to ES6 import statements in test files
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
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Pattern 1: const { ComponentName } = require('./ComponentName');
  // Convert to: import ComponentName from './ComponentName';
  content = content.replace(
    /\/\/\s*@ts-ignore.*\n\s*const\s+\{\s*(\w+)\s*\}\s*=\s*require\(['"](.\/[\w-]+)['"]\);/g,
    (match, componentName, modulePath) => {
      return `import ${componentName} from '${modulePath}';`;
    }
  );

  // Pattern 2: const Module = require('./module');
  // Convert to: import Module from './module';
  content = content.replace(
    /\/\/\s*@ts-ignore.*\n\s*const\s+(\w+)\s*=\s*require\(['"](.\/[\w-]+)['"]\);/g,
    (match, moduleName, modulePath) => {
      return `import ${moduleName} from '${modulePath}';`;
    }
  );

  // Pattern 3: Inline require in test blocks
  // const { Component } = require('./Component');
  content = content.replace(
    /\/\/\s*@ts-ignore.*\n\s*const\s+\{\s*(\w+)\s*\}\s*=\s*require\(['"](.\/[\w-]+)['"]\);/g,
    ''  // Remove inline requires - they'll be added as imports at top
  );

  // Extract all unique component names referenced in the file
  const componentMatches = content.matchAll(/const\s+\{\s*(\w+)\s*\}\s*=\s*require\(['"](.\/[\w-]+)['"]\);/g);
  const imports = new Set();

  for (const match of componentMatches) {
    imports.add(`import ${match[1]} from '${match[2]}';`);
  }

  // Add imports after existing import statements
  if (imports.size > 0) {
    const importLines = Array.from(imports).join('\n');
    content = content.replace(
      /(import.*?['"];?\n)+/,
      (match) => match + importLines + '\n'
    );
  }

  // Remove remaining @ts-ignore comments related to requires
  content = content.replace(/\/\/\s*@ts-ignore\s*-\s*Component will be implemented\n/g, '');

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes: ${filePath}`);
    return false;
  }
}

let fixedCount = 0;
for (const file of testFiles) {
  if (fixTestFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} out of ${testFiles.length} files`);
