#!/usr/bin/env python3
"""
Fix frontmatter in converted pages to match Keystatic schema.
Flattens nested 'hero' object to heroImage and heroTagline.
"""

import os
import re
import yaml
from pathlib import Path

def fix_frontmatter(file_path: Path):
    """Fix frontmatter to match Keystatic schema"""
    print(f"Fixing {file_path.name}...")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split frontmatter and body
    parts = content.split('---\n', 2)
    if len(parts) < 3:
        print(f"  ⚠ Skipping - invalid format")
        return

    frontmatter_text = parts[1]
    body = parts[2]

    # Parse frontmatter as YAML
    frontmatter = yaml.safe_load(frontmatter_text)

    # Fix hero object
    if 'hero' in frontmatter:
        hero = frontmatter.pop('hero')
        if 'backgroundImage' in hero:
            frontmatter['heroImage'] = hero['backgroundImage']
        if 'tagline' in hero:
            frontmatter['heroTagline'] = hero['tagline']

    # Fix SEO fields - rename description->metaDescription, title->metaTitle
    if 'seo' in frontmatter:
        seo = frontmatter['seo']
        if 'description' in seo:
            seo['metaDescription'] = seo.pop('description')
        if 'title' in seo:
            seo['metaTitle'] = seo.pop('title')

    # Remove old template and slug fields if still present
    frontmatter.pop('template', None)
    frontmatter.pop('slug', None)  # slug field not needed - title serves as slug

    # Rebuild file
    new_frontmatter = yaml.dump(frontmatter, default_flow_style=False, allow_unicode=True, sort_keys=False)
    new_content = f"---\n{new_frontmatter}---\n{body}"

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"  ✓ Fixed {file_path.name}")

def main():
    content_dir = Path(__file__).parent.parent / 'content' / 'pages'

    # Find all .mdoc files that need fixing
    mdoc_files = [
        f for f in content_dir.glob('*.mdoc')
        if f.name not in ['testing.mdoc', 'test2.mdoc']  # Skip already correct files
    ]

    if not mdoc_files:
        print("No files found to fix")
        return

    print(f"Found {len(mdoc_files)} files to fix\n")

    for file_path in mdoc_files:
        fix_frontmatter(file_path)

    print(f"\n✓ Fixed {len(mdoc_files)} files")

if __name__ == '__main__':
    main()
