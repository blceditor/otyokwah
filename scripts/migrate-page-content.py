#!/usr/bin/env python3
"""
Page Content Migration Helper
Generates .mdoc files from extracted WordPress content
"""

import json
import sys
from pathlib import Path
from typing import Dict, Optional

def load_extraction_data() -> Dict:
    """Load extracted WordPress content"""
    extraction_file = Path('/Users/travis/SparkryGDrive/dev/bearlakecamp/cos/content-extraction.json')
    with open(extraction_file, 'r') as f:
        return json.load(f)

def generate_mdoc_frontmatter(
    title: str,
    hero_image: str = "",
    hero_tagline: str = "",
    template: str = "standard",
    seo_title: str = "",
    seo_description: str = ""
) -> str:
    """Generate YAML frontmatter for .mdoc file"""

    if not seo_title:
        seo_title = f"{title} - Bear Lake Camp"

    if not seo_description:
        seo_description = f"Learn more about {title} at Bear Lake Camp, a Christian camp and retreat center in Fort Wayne, Indiana."

    frontmatter = f"""---
title: {title}"""

    if hero_image:
        frontmatter += f"""
heroImage: {hero_image}"""

    if hero_tagline:
        frontmatter += f"""
heroTagline: {hero_tagline}"""

    frontmatter += f"""
seo:
  metaTitle: {seo_title}
  metaDescription: {seo_description}
  ogTitle: ""
  ogDescription: ""
  twitterCard: summary_large_image
  noIndex: false
templateFields:
  discriminant: {template}
---
"""

    return frontmatter

def clean_content_for_markdown(content: str) -> str:
    """Clean content for markdown format"""
    # Replace multiple newlines with double newline
    import re
    content = re.sub(r'\n{3,}', '\n\n', content)

    # Fix common WordPress artifacts
    content = content.replace('\u00a0', ' ')  # Non-breaking space
    content = content.replace('\u2019', "'")  # Right single quote
    content = content.replace('\u201c', '"')  # Left double quote
    content = content.replace('\u201d', '"')  # Right double quote
    content = content.replace('\u2013', '-')  # En dash
    content = content.replace('\u2014', '—')  # Em dash

    return content.strip()

def get_page_content(slug: str, data: Dict) -> Optional[Dict]:
    """Get page content by slug"""
    return data.get('pages_by_slug', {}).get(slug)

def migrate_page(
    slug: str,
    output_filename: str,
    title_override: Optional[str] = None,
    hero_image: str = "",
    hero_tagline: str = "",
    template: str = "standard",
    seo_title: str = "",
    seo_description: str = ""
):
    """Migrate a single page from WordPress to .mdoc"""

    # Load data
    data = load_extraction_data()
    page = get_page_content(slug, data)

    if not page:
        print(f"ERROR: Page '{slug}' not found in extraction data")
        return False

    # Use title override or original title
    title = title_override or page['title']

    # Generate frontmatter
    frontmatter = generate_mdoc_frontmatter(
        title=title,
        hero_image=hero_image,
        hero_tagline=hero_tagline,
        template=template,
        seo_title=seo_title,
        seo_description=seo_description
    )

    # Clean content
    content = clean_content_for_markdown(page['content'])

    # Combine
    full_content = f"{frontmatter}\n{content}\n"

    # Write to file
    output_path = Path(f'/Users/travis/SparkryGDrive/dev/bearlakecamp/content/pages/{output_filename}')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_content)

    print(f"✅ Migrated: {slug} → {output_filename}")
    print(f"   Title: {title}")
    print(f"   Content: {len(content)} chars")
    print(f"   Output: {output_path}")

    return True

def main():
    """Main migration function"""
    if len(sys.argv) < 3:
        print("Usage: python migrate-page-content.py <slug> <output-filename.mdoc> [title] [hero-image] [hero-tagline]")
        print("\nExample: python migrate-page-content.py summer-camp summer-camp.mdoc 'Summer Camp' '/images/summer.jpg' 'The Adventure Begins'")
        sys.exit(1)

    slug = sys.argv[1]
    output_filename = sys.argv[2]
    title_override = sys.argv[3] if len(sys.argv) > 3 else None
    hero_image = sys.argv[4] if len(sys.argv) > 4 else ""
    hero_tagline = sys.argv[5] if len(sys.argv) > 5 else ""

    migrate_page(
        slug=slug,
        output_filename=output_filename,
        title_override=title_override,
        hero_image=hero_image,
        hero_tagline=hero_tagline
    )

if __name__ == '__main__':
    main()
