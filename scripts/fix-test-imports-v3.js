#!/usr/bin/env node
/**
 * REQ-000: Fix component test imports (v3 - remove invalid inline imports, add to top)
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all spec files
const specFiles = glob.syncglobSync('**/*.spec.tsx', {
  ignore: ['node_modules/**', 'dist/**', '.next/**'],
  cwd: process.cwd(),
  absolute: true
});

console.log(`Found ${specFiles.length} test files`);

let fixedCount = 0;

for (const fullPath of specFiles) {
  let content = fs.readFileSync(fullPath, 'utf8');
  const originalContent = content;

  // Find all inline import statements (inside functions - indented)
  const inlineImportPattern = /^\s{2,}import\s+(\w+)\s+from\s+['"](.\/[^'"]+)['"];?\s*$/gm;
  const imports = new Map(); // path -> Set(names)

  let match;
  while ((match = inlineImportPattern.exec(content)) !== null) {
    const componentName = match[1];
    const modulePath = match[2];

    if (!imports.has(modulePath)) {
      imports.set(modulePath, new Set());
    }
    imports.get(modulePath).add(componentName);
  }

  if (imports.size === 0) {
    continue; // No inline imports found
  }

  // Remove all inline imports
  content = content.replace(inlineImportPattern, '');

  // Build proper imports for top of file
  const importStatements = [];
  for (const [modulePath, names] of imports.entries()) {
    const nameList = Array.from(names);
    if (nameList.length === 1) {
      importStatements.push(`import ${nameList[0]} from '${modulePath}';`);
    }
  }

  // Find where to insert imports (after existing imports)
  const lines = content.split('\n');
  let lastImportLine = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(/^import\s+.*?from\s+['"].*?['"];?\s*$/)) {
      lastImportLine = i;
    }
  }

  if (lastImportLine >= 0 && importStatements.length > 0) {
    // Insert after last import
    lines.splice(lastImportLine + 1, 0, ...importStatements);
    content = lines.join('\n');
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf8');
    const relPath = path.relative(process.cwd(), fullPath);
    console.log(`✅ Fixed: ${relPath} (added ${imports.size} imports at top)`);
    fixedCount++;
  }
}

console.log(`\n✨ Fixed ${fixedCount} files`);
