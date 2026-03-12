#!/usr/bin/env python3
"""
WordPress Content Extraction Script
Extracts all page content from WordPress XML export for Bear Lake Camp website migration
"""

import xml.etree.ElementTree as ET
import json
import html
import re
from pathlib import Path
from typing import Dict, List, Optional

# Define namespaces
NAMESPACES = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'excerpt': 'http://wordpress.org/export/1.2/excerpt/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

def clean_html(content: str) -> str:
    """Remove HTML tags and clean WordPress shortcodes"""
    if not content:
        return ""

    # Decode HTML entities
    content = html.unescape(content)

    # Remove WordPress shortcodes
    content = re.sub(r'\[.*?\]', '', content)

    # Remove HTML comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)

    # Remove script and style tags
    content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL | re.IGNORECASE)
    content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL | re.IGNORECASE)

    # Remove HTML tags but preserve line breaks
    content = re.sub(r'<br\s*/?>', '\n', content, flags=re.IGNORECASE)
    content = re.sub(r'<p>', '\n\n', content, flags=re.IGNORECASE)
    content = re.sub(r'</p>', '', content, flags=re.IGNORECASE)
    content = re.sub(r'<[^>]+>', '', content)

    # Clean up whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = content.strip()

    return content

def extract_page_content(item) -> Optional[Dict]:
    """Extract content from a WordPress page item"""
    # Check if this is a published page
    post_type = item.find('wp:post_type', NAMESPACES)
    status = item.find('wp:status', NAMESPACES)

    if post_type is None or post_type.text != 'page':
        return None

    if status is None or status.text != 'publish':
        return None

    # Extract basic metadata
    title_elem = item.find('title')
    title = title_elem.text if title_elem is not None else ''

    post_name = item.find('wp:post_name', NAMESPACES)
    slug = post_name.text if post_name is not None else ''

    # Extract content
    content_elem = item.find('content:encoded', NAMESPACES)
    raw_content = content_elem.text if content_elem is not None else ''
    clean_content = clean_html(raw_content)

    # Extract excerpt
    excerpt_elem = item.find('excerpt:encoded', NAMESPACES)
    excerpt = clean_html(excerpt_elem.text) if excerpt_elem is not None and excerpt_elem.text else ''

    # Extract metadata
    post_id = item.find('wp:post_id', NAMESPACES)
    post_id = post_id.text if post_id is not None else ''

    post_date = item.find('wp:post_date', NAMESPACES)
    post_date = post_date.text if post_date is not None else ''

    # Extract parent page (for hierarchical pages)
    post_parent = item.find('wp:post_parent', NAMESPACES)
    parent_id = post_parent.text if post_parent is not None else '0'

    return {
        'id': post_id,
        'title': title,
        'slug': slug,
        'content': clean_content,
        'raw_content': raw_content,
        'excerpt': excerpt,
        'post_date': post_date,
        'parent_id': parent_id,
        'url_path': f'/{slug}' if slug else '/'
    }

def build_page_hierarchy(pages: List[Dict]) -> Dict:
    """Build hierarchical structure of pages"""
    # Create lookup by ID
    pages_by_id = {page['id']: page for page in pages}

    # Build hierarchy
    root_pages = []
    for page in pages:
        parent_id = page['parent_id']
        if parent_id == '0':
            root_pages.append(page)
        else:
            if parent_id in pages_by_id:
                parent = pages_by_id[parent_id]
                if 'children' not in parent:
                    parent['children'] = []
                parent['children'].append(page)

    return {
        'root_pages': root_pages,
        'pages_by_id': pages_by_id
    }

def main():
    """Main extraction function"""
    # File paths
    xml_path = Path('/Users/travis/SparkryGDrive/dev/bearlakecamp/bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml')
    output_path = Path('/Users/travis/SparkryGDrive/dev/bearlakecamp/cos/content-extraction.json')

    print(f"Extracting content from: {xml_path}")

    # Parse XML
    tree = ET.parse(xml_path)
    root = tree.getroot()

    # Find all items
    items = root.findall('.//item')
    print(f"Found {len(items)} total items")

    # Extract page content
    pages = []
    for item in items:
        page_data = extract_page_content(item)
        if page_data:
            pages.append(page_data)

    print(f"Extracted {len(pages)} published pages")

    # Build hierarchy
    hierarchy = build_page_hierarchy(pages)

    # Create output data
    output_data = {
        'extraction_date': '2025-12-09',
        'source_file': str(xml_path),
        'total_pages': len(pages),
        'pages': pages,
        'hierarchy': {
            'root_pages': [
                {
                    'id': p['id'],
                    'title': p['title'],
                    'slug': p['slug'],
                    'children': [
                        {
                            'id': c['id'],
                            'title': c['title'],
                            'slug': c['slug']
                        } for c in p.get('children', [])
                    ]
                } for p in hierarchy['root_pages']
            ]
        },
        'pages_by_slug': {p['slug']: p for p in pages}
    }

    # Write output
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)

    print(f"\nContent extraction complete!")
    print(f"Output written to: {output_path}")
    print(f"\nPage summary:")
    for page in sorted(pages, key=lambda x: x['title']):
        content_length = len(page['content'])
        print(f"  - {page['title']:40s} ({page['slug']:30s}) - {content_length:5d} chars")

if __name__ == '__main__':
    main()
