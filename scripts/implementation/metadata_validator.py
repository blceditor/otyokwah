#!/usr/bin/env python3
"""
REQ-TEAM-003 - Metadata Validator

Validates Next.js metadata exports for Bear Lake Camp.
Used by: nextjs-vercel-specialist

Checks:
- Static metadata exports
- generateMetadata function
- Metadata in Client Components (error)
- Title and description presence
"""

import re
from pathlib import Path
from typing import Dict, Any


def validate_metadata(file_path: str) -> Dict[str, Any]:
    """Validate metadata in a Next.js page file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'has_metadata': False,
        'has_static_metadata': False,
        'has_dynamic_metadata': False,
        'has_title': False,
        'has_description': False,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Check for 'use client' directive
    is_client = content.strip().startswith("'use client'") or content.strip().startswith('"use client"')

    # Check for static metadata export
    has_static_metadata = bool(re.search(r'export\s+const\s+metadata\s*[:=]', content))
    result['has_static_metadata'] = has_static_metadata

    # Check for generateMetadata function
    has_dynamic_metadata = bool(re.search(r'export\s+(?:async\s+)?function\s+generateMetadata', content))
    result['has_dynamic_metadata'] = has_dynamic_metadata

    result['has_metadata'] = has_static_metadata or has_dynamic_metadata

    # Error: metadata in client component
    if is_client and (has_static_metadata or has_dynamic_metadata):
        result['valid'] = False
        result['errors'].append(
            "Cannot export metadata from a Client Component. "
            "Remove 'use client' or move metadata to a Server Component wrapper."
        )

    # Check for title
    if has_static_metadata:
        result['has_title'] = bool(re.search(r'title\s*:', content))
        result['has_description'] = bool(re.search(r'description\s*:', content))
    elif has_dynamic_metadata:
        # For dynamic metadata, assume title and description are returned
        result['has_title'] = True
        result['has_description'] = True

    # Warn if no metadata in page file
    if 'page.tsx' in file_path or 'page.ts' in file_path:
        if not result['has_metadata'] and not is_client:
            result['warnings'].append(
                "Page has no metadata export. Add 'export const metadata' or "
                "'export async function generateMetadata' for SEO."
            )

    return result


def validate_metadata_directory(directory: str) -> Dict[str, Any]:
    """Validate metadata in all page files in a directory."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'files_checked': 0,
        'files_with_metadata': 0,
    }

    dir_path = Path(directory)
    if not dir_path.exists():
        result['valid'] = False
        result['errors'].append(f"Directory not found: {directory}")
        return result

    for page_file in dir_path.rglob('page.tsx'):
        file_result = validate_metadata(str(page_file))
        result['files_checked'] += 1

        if file_result['has_metadata']:
            result['files_with_metadata'] += 1

        if not file_result['valid']:
            result['valid'] = False
            result['errors'].extend(
                f"{page_file}: {e}" for e in file_result['errors']
            )
        result['warnings'].extend(
            f"{page_file}: {w}" for w in file_result['warnings']
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python metadata_validator.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = validate_metadata(target)
    else:
        result = validate_metadata_directory(target)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
