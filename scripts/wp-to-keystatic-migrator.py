#!/usr/bin/env python3
"""
WordPress to Keystatic Content Migrator
Migrates WordPress XML exports to Keystatic YAML + Markdown format for Next.js + Keystatic

Usage:
    python wp-to-keystatic-migrator.py <wordpress-export.xml> <output-directory>

Example:
    python wp-to-keystatic-migrator.py bearlakecamp.WordPress.2025-10-31.xml ./content
"""

import xml.etree.ElementTree as ET
import re
import os
import sys
import yaml
from pathlib import Path
from html.parser import HTMLParser
from datetime import datetime


# WordPress XML namespaces
NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
}


class HTMLToMarkdown(HTMLParser):
    """Converts HTML to Markdown, handling common WordPress patterns"""

    def __init__(self):
        super().__init__()
        self.markdown = []
        self.in_link = False
        self.link_href = None
        self.in_strong = False
        self.in_em = False
        self.in_heading = False
        self.heading_level = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag == 'p':
            self.markdown.append('\n')
        elif tag == 'br':
            self.markdown.append('\n')
        elif tag == 'a':
            self.in_link = True
            self.link_href = attrs_dict.get('href', '')
        elif tag == 'strong' or tag == 'b':
            self.in_strong = True
            self.markdown.append('**')
        elif tag == 'em' or tag == 'i':
            self.in_em = True
            self.markdown.append('_')
        elif tag.startswith('h') and len(tag) == 2 and tag[1].isdigit():
            self.in_heading = True
            self.heading_level = int(tag[1])
            self.markdown.append('\n' + ('#' * self.heading_level) + ' ')
        elif tag == 'ul':
            self.markdown.append('\n')
        elif tag == 'ol':
            self.markdown.append('\n')
        elif tag == 'li':
            self.markdown.append('- ')
        elif tag == 'img':
            src = attrs_dict.get('src', '')
            alt = attrs_dict.get('alt', '')
            self.markdown.append(f'![{alt}]({src})')

    def handle_endtag(self, tag):
        if tag == 'p':
            self.markdown.append('\n')
        elif tag == 'a':
            if self.in_link:
                self.markdown.append(f']({self.link_href})')
                self.in_link = False
                self.link_href = None
        elif tag == 'strong' or tag == 'b':
            if self.in_strong:
                self.markdown.append('**')
                self.in_strong = False
        elif tag == 'em' or tag == 'i':
            if self.in_em:
                self.markdown.append('_')
                self.in_em = False
        elif tag.startswith('h') and self.in_heading:
            self.markdown.append('\n')
            self.in_heading = False
        elif tag == 'li':
            self.markdown.append('\n')

    def handle_data(self, data):
        if self.in_link:
            self.markdown.append(f'[{data}')
        else:
            # Clean up excessive whitespace
            cleaned = re.sub(r'\s+', ' ', data.strip())
            if cleaned:
                self.markdown.append(cleaned)

    def get_markdown(self):
        """Return the converted markdown, cleaned up"""
        result = ''.join(self.markdown)
        # Clean up excessive newlines
        result = re.sub(r'\n{3,}', '\n\n', result)
        return result.strip()


def html_to_markdown(html_content):
    """Convert HTML to Markdown"""
    if not html_content:
        return ''

    parser = HTMLToMarkdown()
    parser.feed(html_content)
    return parser.get_markdown()


def classify_page_template(title, slug, content):
    """
    Classify a WordPress page into one of the Keystatic template types
    Returns: 'homepage' | 'program' | 'facility' | 'staff' | 'standard'
    """
    title_lower = title.lower()
    slug_lower = slug.lower()

    # Homepage detection
    if slug_lower in ['home', 'home-2', 'index']:
        return 'homepage'

    # Program detection (camp programs, retreats, events)
    program_keywords = ['anchored', 'breathe', 'defrost', 'recharge', 'lit', 'leaders-in-training',
                        'summer-camp', 'retreats', 'rentals']
    if any(keyword in slug_lower for keyword in program_keywords):
        return 'program'

    # Facility detection
    facility_keywords = ['cabins', 'chapel', 'dining', 'dininghall', 'mac', 'gym', 'outdoor']
    if any(keyword in slug_lower for keyword in facility_keywords):
        return 'facility'

    # Staff detection
    staff_keywords = ['staff', 'work-at-camp', 'employment']
    if any(keyword in slug_lower for keyword in staff_keywords):
        return 'staff'

    # Default to standard template
    return 'standard'


def extract_images_from_content(content):
    """Extract image URLs from HTML content"""
    if not content:
        return []

    # Find all img src attributes
    img_pattern = r'<img[^>]+src="([^"]+)"[^>]*>'
    images = re.findall(img_pattern, content)
    return images


def migrate_page(item, output_dir):
    """Migrate a single WordPress page to Keystatic format"""

    # Extract basic fields
    title = item.find('title').text or 'Untitled'
    post_id = item.find('wp:post_id', NS).text
    slug = item.find('wp:post_name', NS).text
    status = item.find('wp:status', NS).text
    post_type = item.find('wp:post_type', NS).text

    # Skip if not a published page
    if status != 'publish' or post_type != 'page':
        return None

    # Extract content
    content_elem = item.find('content:encoded', NS)
    html_content = content_elem.text if content_elem is not None else ''

    # Extract excerpt
    excerpt_elem = item.find('excerpt:encoded', NS)
    excerpt = excerpt_elem.text if excerpt_elem is not None else ''

    # Classify template type
    template = classify_page_template(title, slug, html_content)

    # Convert HTML to Markdown
    markdown_content = html_to_markdown(html_content)

    # Extract images
    images = extract_images_from_content(html_content)

    # Build frontmatter
    frontmatter = {
        'title': title,
        'slug': slug,
        'template': template,
    }

    # Add template-specific fields
    if template == 'homepage':
        frontmatter['hero'] = {
            'tagline': 'To Know Christ - Phil. 3:10',
            'backgroundImage': '/images/hero/home-hero.jpg'  # Placeholder
        }
    elif template == 'program':
        frontmatter['ageRange'] = 'TBD'  # To be filled manually
        frontmatter['dates'] = []
        frontmatter['pricing'] = 'TBD'
    elif template == 'facility':
        frontmatter['capacity'] = 'TBD'
        frontmatter['amenities'] = []
    elif template == 'staff':
        frontmatter['positions'] = []

    # Add excerpt if exists
    if excerpt:
        frontmatter['excerpt'] = html_to_markdown(excerpt)

    # SEO fields (extract from WordPress meta if available)
    frontmatter['seo'] = {
        'title': title,
        'description': excerpt[:160] if excerpt else f'{title} - Bear Lake Camp'
    }

    # Generate output file
    safe_slug = re.sub(r'[^a-z0-9-]', '-', slug.lower())
    output_path = Path(output_dir) / f'{safe_slug}.md'

    # Write frontmatter + content
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('---\n')
        yaml.dump(frontmatter, f, default_flow_style=False, allow_unicode=True)
        f.write('---\n\n')
        f.write(markdown_content)

    return {
        'id': post_id,
        'title': title,
        'slug': slug,
        'template': template,
        'output_path': str(output_path),
        'images': images
    }


def migrate_wordpress_export(xml_path, output_dir, page_ids=None):
    """
    Migrate WordPress XML export to Keystatic format

    Args:
        xml_path: Path to WordPress XML export
        output_dir: Directory to output Keystatic content files
        page_ids: Optional list of specific page IDs to migrate (for testing)
    """

    # Parse XML
    print(f"Parsing WordPress export: {xml_path}")
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Find all items
    items = root.findall('.//item')
    print(f"Found {len(items)} total items in export")

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Track results
    migrated_pages = []
    image_manifest = []

    # Migrate pages
    for item in items:
        post_type_elem = item.find('wp:post_type', NS)
        if post_type_elem is None or post_type_elem.text != 'page':
            continue

        post_id_elem = item.find('wp:post_id', NS)
        if post_id_elem is None:
            continue

        post_id = post_id_elem.text

        # Filter by page_ids if specified
        if page_ids and post_id not in page_ids:
            continue

        print(f"\nMigrating page ID {post_id}...")
        result = migrate_page(item, output_dir)

        if result:
            migrated_pages.append(result)
            print(f"✓ Migrated: {result['title']} ({result['template']}) -> {result['output_path']}")

            # Track images
            for img_url in result['images']:
                image_manifest.append({
                    'page_id': result['id'],
                    'page_title': result['title'],
                    'image_url': img_url
                })

    # Write image manifest
    manifest_path = Path(output_dir) / 'image-manifest.csv'
    with open(manifest_path, 'w', encoding='utf-8') as f:
        f.write('page_id,page_title,image_url\n')
        for entry in image_manifest:
            f.write(f"{entry['page_id']},{entry['page_title']},{entry['image_url']}\n")

    # Print summary
    print(f"\n{'=' * 60}")
    print("Migration Summary")
    print(f"{'=' * 60}")
    print(f"Pages migrated: {len(migrated_pages)}")
    print(f"Images found: {len(image_manifest)}")
    print(f"Output directory: {output_dir}")
    print(f"Image manifest: {manifest_path}")
    print(f"\nTemplate breakdown:")

    template_counts = {}
    for page in migrated_pages:
        template = page['template']
        template_counts[template] = template_counts.get(template, 0) + 1

    for template, count in sorted(template_counts.items()):
        print(f"  {template}: {count}")

    return migrated_pages, image_manifest


def main():
    """CLI entry point"""
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    xml_path = sys.argv[1]
    output_dir = sys.argv[2]

    # Optional: filter by specific page IDs (for testing on 5 sample pages)
    page_ids = None
    if len(sys.argv) > 3:
        page_ids = sys.argv[3].split(',')
        print(f"Filtering to pages: {page_ids}")

    migrate_wordpress_export(xml_path, output_dir, page_ids)


if __name__ == '__main__':
    main()
