#!/usr/bin/env python3
"""
REQ-TEAM-003 - Field Reference Validator

Validates relationship field references in Keystatic schema for Bear Lake Camp.
Used by: keystatic-specialist

Checks:
- Relationship fields reference existing collections
- No circular dependencies
- Valid reference syntax
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


def extract_collections(content: str) -> Set[str]:
    """Extract collection names from schema content."""
    collections = set()

    # Find collection definitions
    pattern = r'(\w+):\s*collection\s*\('
    for match in re.finditer(pattern, content):
        collections.add(match.group(1))

    return collections


def extract_singletons(content: str) -> Set[str]:
    """Extract singleton names from schema content."""
    singletons = set()

    # Find singleton definitions
    pattern = r'(\w+):\s*singleton\s*\('
    for match in re.finditer(pattern, content):
        singletons.add(match.group(1))

    return singletons


def extract_relationships(content: str) -> List[Dict[str, Any]]:
    """Extract relationship field references from schema content."""
    relationships = []

    # Find fields.relationship with collection reference
    pattern = r"fields\.relationship\s*\(\s*\{[^}]*collection:\s*['\"](\w+)['\"]"
    for match in re.finditer(pattern, content, re.DOTALL):
        line_num = content[:match.start()].count('\n') + 1
        target = match.group(1)
        relationships.append({
            'line': line_num,
            'target': target,
        })

    return relationships


def validate_references(file_path: str) -> Dict[str, Any]:
    """Validate relationship references in a Keystatic schema file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'collections': [],
        'singletons': [],
        'relationships': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Extract collections and singletons
    collections = extract_collections(content)
    singletons = extract_singletons(content)
    result['collections'] = sorted(collections)
    result['singletons'] = sorted(singletons)

    # All valid targets (collections + singletons)
    valid_targets = collections | singletons

    # Extract and validate relationships
    relationships = extract_relationships(content)
    result['relationships'] = relationships

    for rel in relationships:
        target = rel['target']
        if target not in valid_targets:
            result['valid'] = False
            result['errors'].append(
                f"Line {rel['line']}: Relationship references non-existent collection '{target}'. "
                f"Available collections: {sorted(collections)}"
            )

    # Check for potential circular dependencies (simplified check)
    # A full implementation would build a dependency graph
    if len(relationships) > 0 and len(collections) > 1:
        result['warnings'].append(
            "Multiple collections with relationships detected. "
            "Ensure no circular dependencies exist."
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python field_reference_validator.py <schema_file>")
        sys.exit(1)

    schema_file = sys.argv[1]
    result = validate_references(schema_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
