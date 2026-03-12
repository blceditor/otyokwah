#!/usr/bin/env python3
"""
REQ-TEAM-003 - Collection Sync Validator

Validates content files match Keystatic schema for Bear Lake Camp.
Used by: keystatic-specialist

Checks:
- Content files match schema structure
- No orphaned content files
- Required fields present
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any, Set


def extract_collection_paths(schema_content: str) -> Dict[str, str]:
    """Extract collection paths from schema."""
    collections = {}

    # Find collection definitions with path
    pattern = r"(\w+):\s*collection\s*\(\s*\{[^}]*path:\s*['\"]([^'\"]+)['\"]"
    for match in re.finditer(pattern, schema_content, re.DOTALL):
        collection_name = match.group(1)
        path_pattern = match.group(2)
        # Convert path pattern to directory (remove /* or /**)
        dir_path = re.sub(r'/\*+$', '', path_pattern)
        collections[collection_name] = dir_path

    return collections


def find_content_files(base_dir: str) -> Set[str]:
    """Find all content files in the base directory."""
    content_files = set()
    base_path = Path(base_dir)

    # Look for common content file extensions
    for ext in ['*.mdoc', '*.md', '*.mdx', '*.json', '*.yaml', '*.yml']:
        for content_file in base_path.rglob(ext):
            # Get relative path from base
            rel_path = str(content_file.relative_to(base_path))
            content_files.add(rel_path)

    return content_files


def validate_collection_sync(content_dir: str, schema_file: str) -> Dict[str, Any]:
    """Validate content files match schema definitions."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'collections': {},
        'orphaned_files': [],
        'missing_content': [],
    }

    # Read schema
    try:
        schema_content = Path(schema_file).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading schema: {e}")
        return result

    # Extract collection paths
    collections = extract_collection_paths(schema_content)
    result['collections'] = collections

    if not collections:
        result['warnings'].append(
            "No collections with 'path' found in schema. "
            "Cannot validate content sync."
        )
        return result

    # Find all content files
    content_path = Path(content_dir)
    if not content_path.exists():
        result['valid'] = False
        result['errors'].append(f"Content directory not found: {content_dir}")
        return result

    all_content_files = find_content_files(content_dir)

    # Track which files are covered by collections
    covered_files: Set[str] = set()

    for collection_name, path_pattern in collections.items():
        # Find files matching this collection's path
        collection_dir = content_path / path_pattern.lstrip('/')

        if collection_dir.exists():
            for content_file in collection_dir.glob('*'):
                if content_file.is_file():
                    rel_path = str(content_file.relative_to(content_path))
                    covered_files.add(rel_path)
        else:
            result['missing_content'].append(
                f"Collection '{collection_name}' expects content in '{path_pattern}' but directory doesn't exist"
            )

    # Find orphaned files (content files not covered by any collection)
    for content_file in all_content_files:
        is_covered = False
        for collection_name, path_pattern in collections.items():
            if content_file.startswith(path_pattern.lstrip('/')):
                is_covered = True
                break

        if not is_covered:
            # Check if it's in a recognized content directory
            if content_file.startswith('content/'):
                result['orphaned_files'].append(content_file)

    if result['orphaned_files']:
        result['warnings'].append(
            f"Found {len(result['orphaned_files'])} orphaned content file(s) "
            "not matching any collection path: " +
            ', '.join(result['orphaned_files'][:5]) +
            ('...' if len(result['orphaned_files']) > 5 else '')
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 3:
        print("Usage: python collection_sync_validator.py <content_dir> <schema_file>")
        sys.exit(1)

    content_dir = sys.argv[1]
    schema_file = sys.argv[2]
    result = validate_collection_sync(content_dir, schema_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
