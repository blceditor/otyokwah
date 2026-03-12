#!/usr/bin/env python3
"""
Enhance migrated WordPress pages with real data and prepare for production

This script:
1. Copies referenced WordPress images to public/images/
2. Updates image URLs to local paths
3. Fixes internal links to new site structure
4. Fills TBD fields where possible
5. Cleans up WordPress artifacts (gallery shortcodes, etc.)
"""

import re
import os
import sys
import shutil
from pathlib import Path


def copy_wp_image(wp_uploads_dir, image_url, dest_base_dir):
    """
    Copy WordPress image from uploads directory to public/images/

    Args:
        wp_uploads_dir: Path to WordPress uploads directory
        image_url: WordPress image URL
        dest_base_dir: Base destination directory (e.g., 'public/images')

    Returns:
        Local path for Next.js (e.g., '/images/gallery/photo.jpg')
    """
    # Extract path from URL
    # Example: https://www.bearlakecamp.com/wp-content/uploads/2024/11/photo.jpg
    #          -> 2024/11/photo.jpg
    match = re.search(r'/wp-content/uploads/(.+)$', image_url)
    if not match:
        return None

    rel_path = match.group(1)
    source_path = Path(wp_uploads_dir) / rel_path

    if not source_path.exists():
        print(f"  ⚠ Image not found: {source_path}")
        return None

    # Determine destination based on image type
    filename = source_path.name

    # Categorize by path patterns
    if '/elementor/' in str(source_path):
        dest_dir = Path(dest_base_dir) / 'elementor'
    elif 'logo' in filename.lower() or 'BLC-Logo' in filename:
        dest_dir = Path(dest_base_dir) / 'logo'
    elif any(prog in filename for prog in ['Jr.', 'camp', 'camper', 'staff']):
        dest_dir = Path(dest_base_dir) / 'gallery'
    elif any(fac in filename for fac in ['chapel', 'cabin', 'dining', 'MAC', 'DSC']):
        dest_dir = Path(dest_base_dir) / 'facilities'
    else:
        dest_dir = Path(dest_base_dir) / 'general'

    # Create destination directory
    dest_dir.mkdir(parents=True, exist_ok=True)

    # Copy file
    dest_path = dest_dir / filename
    shutil.copy2(source_path, dest_path)

    # Return web path
    web_path = '/' + str(dest_path.relative_to(Path(dest_base_dir).parent))
    return web_path


def fix_internal_links(content):
    """
    Update internal WordPress links to new site structure

    WordPress structure:
        /summer-camp-2/ -> /summer-camp
        /retreats -> /retreats
        /rentals -> /rentals
        /partners-in-ministry -> /partners  (TBD - page not migrated yet)
    """
    replacements = {
        'http://www.bearlakecamp.com/summer-camp-2/': '/summer-camp',
        'https://www.bearlakecamp.com/summer-camp-2/': '/summer-camp',
        'http://www.bearlakecamp.com/retreats': '/retreats',
        'https://www.bearlakecamp.com/retreats': '/retreats',
        'http://www.bearlakecamp.com/rentals': '/rentals',
        'https://www.bearlakecamp.com/rentals': '/rentals',
        'http://www.bearlakecamp.com/partners-in-ministry': '/partners  <!-- TBD: Partners page not migrated yet -->',
        'https://www.bearlakecamp.com/partners-in-ministry': '/partners  <!-- TBD: Partners page not migrated yet -->',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    return content


def clean_gallery_shortcodes(content):
    """Remove WordPress gallery shortcode CSS and clean up gallery markup"""
    # Remove gallery CSS
    content = re.sub(r'#gallery-\d+[^}]+}[^}]+}[^}]+}[^}]+}[^}]+}[^/]+/\*[^*]+\*/', '', content)

    # Clean up gallery link syntax - convert ![](url)](larger-url) to just ![](url)
    content = re.sub(r'!\[\]\(([^)]+)\)\]\([^)]+\)', r'![](\1)', content)

    return content


def update_image_urls(content, wp_uploads_dir, dest_base_dir):
    """
    Find all WordPress image URLs and update to local paths

    Returns: (updated_content, image_count)
    """
    # Find all WordPress image URLs
    wp_image_pattern = r'https?://www\.bearlakecamp\.com/wp-content/uploads/[^)\s]+'

    image_urls = re.findall(wp_image_pattern, content)
    copied_count = 0

    for image_url in set(image_urls):  # Use set to avoid duplicates
        local_path = copy_wp_image(wp_uploads_dir, image_url, dest_base_dir)
        if local_path:
            content = content.replace(image_url, local_path)
            copied_count += 1
            print(f"  ✓ Copied image: {Path(image_url).name} -> {local_path}")

    return content, copied_count


def enhance_frontmatter(filepath):
    """
    Update frontmatter TBD fields based on page type

    For program pages: Keep TBD with clear intent
    For facility pages: Keep TBD with clear intent
    For homepage: Update hero image to use actual logo
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract frontmatter and body
    parts = content.split('---\n', 2)
    if len(parts) < 3:
        return content

    frontmatter = parts[1]
    body = parts[2]

    # Update hero image for homepage
    if 'template: homepage' in frontmatter:
        frontmatter = frontmatter.replace(
            '/images/hero/home-hero.jpg',
            '/images/logo/BLC-Logo-compass-whiteletters-no-background-small.png  # TBD: Replace with actual hero image'
        )

    # Add clarifying comments to TBD fields
    frontmatter = frontmatter.replace('ageRange: TBD', 'ageRange: TBD  # TODO: Extract from WordPress content or manual entry')
    frontmatter = frontmatter.replace('pricing: TBD', 'pricing: TBD  # TODO: Extract from WordPress content or check UltraCamp')
    frontmatter = frontmatter.replace('capacity: TBD', 'capacity: TBD  # TODO: Get from facility specifications')

    return f'---\n{frontmatter}---\n{body}'


def enhance_page(filepath, wp_uploads_dir, dest_base_dir):
    """
    Enhance a single migrated page

    Args:
        filepath: Path to migrated .md file
        wp_uploads_dir: WordPress uploads directory
        dest_base_dir: Destination for images (e.g., public/images)
    """
    print(f"\nEnhancing: {filepath.name}")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update frontmatter TBD fields
    content = enhance_frontmatter(filepath)

    # 2. Copy images and update URLs
    content, image_count = update_image_urls(content, wp_uploads_dir, dest_base_dir)
    print(f"  → {image_count} images processed")

    # 3. Fix internal links
    content = fix_internal_links(content)

    # 4. Clean up WordPress artifacts
    content = clean_gallery_shortcodes(content)

    # Write enhanced content
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✓ Enhanced successfully")


def main():
    """
    Enhance all migrated pages and prepare for production
    """
    if len(sys.argv) < 2:
        print("Usage: python enhance-migrated-pages.py <migrated-pages-dir>")
        print("Example: python enhance-migrated-pages.py content/migrated-pages")
        sys.exit(1)

    migrated_dir = Path(sys.argv[1])
    wp_uploads_dir = "/Users/travis/bearlakecamp.com/wp-content/uploads"
    dest_base_dir = "public/images"

    if not migrated_dir.exists():
        print(f"Error: Directory not found: {migrated_dir}")
        sys.exit(1)

    if not Path(wp_uploads_dir).exists():
        print(f"Error: WordPress uploads directory not found: {wp_uploads_dir}")
        sys.exit(1)

    # Create destination directory
    Path(dest_base_dir).mkdir(parents=True, exist_ok=True)

    print(f"=" * 60)
    print("Enhancing Migrated Pages for Production")
    print(f"=" * 60)
    print(f"Source: {migrated_dir}")
    print(f"WordPress uploads: {wp_uploads_dir}")
    print(f"Image destination: {dest_base_dir}")

    # Process all .md files
    md_files = list(migrated_dir.glob('*.md'))

    for md_file in md_files:
        enhance_page(md_file, wp_uploads_dir, dest_base_dir)

    print(f"\n{'=' * 60}")
    print(f"✓ Enhanced {len(md_files)} pages")
    print(f"{'=' * 60}")
    print("\nNext steps:")
    print("1. Review enhanced pages in content/migrated-pages/")
    print("2. Check public/images/ for copied images")
    print("3. Move pages to content/pages/ when ready:")
    print(f"   mv {migrated_dir}/*.md content/pages/")


if __name__ == '__main__':
    main()
