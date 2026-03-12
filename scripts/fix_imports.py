#!/usr/bin/env python3
"""
REQ-000: Fix component test imports - clean approach
Removes all inline/embedded import statements and adds proper import at top
"""

import os
import re
from pathlib import Path

FILES_TO_FIX = [
    "components/keystatic/ProductionLink.spec.tsx",
    "components/content/Timeline.spec.tsx",
    "components/content/StatsCounter.spec.tsx",
    "components/keystatic/GenerateSEOButton.spec.tsx",
    "components/keystatic/BugReportModal.spec.tsx",
    "components/content/Accordion.spec.tsx",
    "components/content/Hero.spec.tsx",
    "components/content/PricingTable.spec.tsx",
    "components/content/SplitContent.spec.tsx",
    "components/content/Testimonial.spec.tsx",
    "components/content/FeatureGrid.spec.tsx",
    "components/keystatic/SparkryBranding.spec.tsx",
    "components/keystatic/DeploymentStatus.spec.tsx",
    "components/content/TableOfContents.spec.tsx",
    "components/content/ImageGallery.spec.tsx",
    "components/content/Callout.spec.tsx",
    "components/content/Button.spec.tsx",
    "components/OptimizedImage.spec.tsx",
    "app/keystatic/[[...params]]/page.spec.tsx",
    "components/homepage/ProgramCard.spec.tsx",
]

def fix_file(file_path):
    """Fix a single test file's imports"""
    if not os.path.exists(file_path):
        print(f"⚠️  Not found: {file_path}")
        return False

    # Get component name from file
    component_name = Path(file_path).stem.replace('.spec', '')

    with open(file_path, 'r') as f:
        content = f.read()

    original = content
    lines = content.split('\n')

    # Remove all inline import statements (indented or anywhere in test blocks)
    # Pattern: any line with "import ComponentName from './ComponentName';"
    import_pattern = re.compile(r'^\s*import\s+' + re.escape(component_name) + r"\s+from\s+['\"]\./" + re.escape(component_name) + r"['\"];?\s*$")

    # Also handle require() patterns
    require_pattern = re.compile(r'^\s*(?://\s*@ts-ignore[^\n]*)?\s*const\s+(?:\{\s*' + re.escape(component_name) + r'\s*\}|' + re.escape(component_name) + r')\s*=\s*require\([\'"]\./' + re.escape(component_name) + r"['\]\);?\s*$")

    filtered_lines = []
    for line in lines:
        # Skip inline imports and requires
        if import_pattern.match(line) or require_pattern.match(line):
            continue
        # Also skip @ts-ignore comments that were for requires
        if line.strip().startswith('// @ts-ignore') and filtered_lines and 'Component will be implemented' in line:
            # Check if next line would be a require (peek ahead)
            continue
        filtered_lines.append(line)

    # Find where to insert proper import (after last import line)
    last_import_idx = -1
    for idx, line in enumerate(filtered_lines):
        if re.match(r"^import\s+.*?\s+from\s+['\"].*?['\"];?\s*$", line):
            last_import_idx = idx

    # Insert proper import if we found imports and it's not already there
    import_statement = f"import {component_name} from './{component_name}';"
    if last_import_idx >= 0:
        # Check if import already exists at top level
        has_top_import = any(
            re.match(r"^import\s+" + re.escape(component_name) + r"\s+from", line)
            for line in filtered_lines[:last_import_idx + 5]  # Check first few imports
        )
        if not has_top_import:
            filtered_lines.insert(last_import_idx + 1, import_statement)

    new_content = '\n'.join(filtered_lines)

    if new_content != original:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"✅ Fixed: {file_path}")
        return True
    else:
        print(f"⏭️  No changes: {file_path}")
        return False

fixed_count = 0
for file_path in FILES_TO_FIX:
    if fix_file(file_path):
        fixed_count += 1

print(f"\n✨ Fixed {fixed_count} out of {len(FILES_TO_FIX)} files")
