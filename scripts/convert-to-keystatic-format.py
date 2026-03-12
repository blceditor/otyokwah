#!/usr/bin/env python3
"""
Convert migrated pages to Keystatic-compatible format.
Transforms 'template: X' to 'templateFields: { discriminant: X }'
and renames .md to .mdoc
"""

import os
import re
from pathlib import Path

def convert_frontmatter(content: str, template: str) -> str:
    """Convert template field to templateFields format"""
    lines = content.split('\n')
    output_lines = []
    in_frontmatter = False
    frontmatter_ended = False

    for line in lines:
        if line.strip() == '---':
            if not in_frontmatter:
                in_frontmatter = True
                output_lines.append(line)
            else:
                # End of frontmatter - add templateFields before closing
                output_lines.append(f'templateFields:')
                output_lines.append(f'  discriminant: {template}')
                output_lines.append(line)
                frontmatter_ended = True
                in_frontmatter = False
            continue

        if in_frontmatter:
            # Skip lines that are template-specific fields we'll move later
            if line.startswith('template:'):
                continue
            # Keep other frontmatter fields
            output_lines.append(line)
        else:
            output_lines.append(line)

    return '\n'.join(output_lines)

def extract_template(content: str) -> str:
    """Extract template value from frontmatter"""
    match = re.search(r'^template:\s*(\w+)', content, re.MULTILINE)
    return match.group(1) if match else 'standard'

def convert_page(file_path: Path):
    """Convert a single page"""
    print(f"Converting {file_path.name}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract template type
    template = extract_template(content)

    # Convert frontmatter
    converted = convert_frontmatter(content, template)

    # Write to .mdoc file
    new_path = file_path.with_suffix('.mdoc')
    with open(new_path, 'w', encoding='utf-8') as f:
        f.write(converted)

    print(f"  ✓ Created {new_path.name} with template: {template}")

    # Remove old .md file
    file_path.unlink()
    print(f"  ✓ Removed {file_path.name}")

def main():
    content_dir = Path(__file__).parent.parent / 'content' / 'pages'

    # Find all migrated .md files (exclude .mdoc which are already correct)
    md_files = list(content_dir.glob('*.md'))

    if not md_files:
        print("No .md files found to convert")
        return

    print(f"Found {len(md_files)} files to convert\n")

    for file_path in md_files:
        convert_page(file_path)

    print(f"\n✓ Converted {len(md_files)} pages to Keystatic format")

if __name__ == '__main__':
    main()
