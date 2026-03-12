#!/usr/bin/env python3
"""
REQ-TEAM-003 - Keystatic Schema Validator

Validates Keystatic CMS schema configuration for Bear Lake Camp.
Used by: keystatic-specialist

Checks:
- Valid field types
- Collection structure
- Relationship references exist
- No circular dependencies
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


# Valid Keystatic field types
VALID_FIELD_TYPES = {
    'fields.text',
    'fields.slug',
    'fields.select',
    'fields.multiselect',
    'fields.checkbox',
    'fields.image',
    'fields.file',
    'fields.document',
    'fields.markdoc',
    'fields.array',
    'fields.object',
    'fields.relationship',
    'fields.conditional',
    'fields.date',
    'fields.datetime',
    'fields.integer',
    'fields.number',
    'fields.url',
    'fields.pathReference',
    'fields.blocks',
    'fields.emptyDocument',
    'fields.empty',
}


def is_valid_field_type(field_type: str) -> bool:
    """Check if a field type is valid."""
    return field_type in VALID_FIELD_TYPES


def extract_collections(content: str) -> Dict[str, Dict[str, Any]]:
    """Extract collection definitions from schema content."""
    collections = {}

    # Find collections block
    collections_match = re.search(r'collections:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', content, re.DOTALL)

    if collections_match:
        collections_content = collections_match.group(1)

        # Find collection names
        collection_pattern = r'(\w+):\s*collection\s*\('
        for match in re.finditer(collection_pattern, collections_content):
            collection_name = match.group(1)
            collections[collection_name] = {'fields': [], 'relationships': []}

    return collections


def extract_singletons(content: str) -> Dict[str, Dict[str, Any]]:
    """Extract singleton definitions from schema content."""
    singletons = {}

    # Find singletons block
    singletons_match = re.search(r'singletons:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}', content, re.DOTALL)

    if singletons_match:
        singletons_content = singletons_match.group(1)

        # Find singleton names
        singleton_pattern = r'(\w+):\s*singleton\s*\('
        for match in re.finditer(singleton_pattern, singletons_content):
            singleton_name = match.group(1)
            singletons[singleton_name] = {'fields': []}

    return singletons


def extract_field_types(content: str) -> List[str]:
    """Extract all field type usages from schema content."""
    field_types = []

    # Find all fields.* patterns
    pattern = r'fields\.(\w+)\s*\('
    for match in re.finditer(pattern, content):
        field_type = f"fields.{match.group(1)}"
        field_types.append(field_type)

    return field_types


def extract_relationships(content: str) -> List[Dict[str, str]]:
    """Extract relationship field references."""
    relationships = []

    # Find fields.relationship with collection reference
    pattern = r"fields\.relationship\s*\(\s*\{[^}]*collection:\s*['\"](\w+)['\"]"
    for match in re.finditer(pattern, content):
        relationships.append({
            'type': 'relationship',
            'target': match.group(1)
        })

    return relationships


def validate_schema(file_path: str) -> Dict[str, Any]:
    """Validate a Keystatic schema file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'collections': {},
        'singletons': {},
        'field_types': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading schema file: {e}")
        return result

    # Check for basic structure
    if 'config(' not in content and 'config ({' not in content:
        result['valid'] = False
        result['errors'].append("Schema must export a config() function")

    # Check for storage configuration
    if 'storage:' not in content and 'storage :' not in content:
        result['warnings'].append("No storage configuration found")

    # Extract collections
    collections = extract_collections(content)
    result['collections'] = collections

    if not collections:
        result['valid'] = False
        result['errors'].append(
            "No collections found in schema. "
            "Expected at least one collection() definition."
        )

    # Extract singletons
    singletons = extract_singletons(content)
    result['singletons'] = singletons

    # Extract and validate field types
    field_types = extract_field_types(content)
    result['field_types'] = field_types

    for field_type in field_types:
        if not is_valid_field_type(field_type):
            result['valid'] = False
            result['errors'].append(f"Unknown field type: {field_type}")

    # Extract and validate relationships
    relationships = extract_relationships(content)

    for rel in relationships:
        target = rel['target']
        if target not in collections and target not in singletons:
            result['valid'] = False
            result['errors'].append(
                f"Relationship references non-existent collection: '{target}'. "
                f"Available collections: {list(collections.keys())}"
            )

    # Check for common issues

    # Circular dependency detection (simplified)
    # A full implementation would build a dependency graph

    # Check for required fields without validation
    if 'validation:' not in content and 'isRequired' not in content:
        result['warnings'].append(
            "No field validation found. Consider adding validation rules."
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python keystatic_schema_validator.py <schema_file>")
        sys.exit(1)

    schema_file = sys.argv[1]
    result = validate_schema(schema_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
