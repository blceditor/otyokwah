#!/usr/bin/env python3
"""
REQ-TEAM-003 - Field Type Checker

Validates Keystatic field type usage for Bear Lake Camp.
Used by: keystatic-specialist

Checks:
- Valid field types
- Deprecated field types
- Proper field configuration
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


# Valid Keystatic field types
VALID_FIELD_TYPES = {
    'text', 'slug', 'select', 'multiselect', 'checkbox',
    'image', 'file', 'document', 'markdoc',
    'array', 'object', 'relationship', 'conditional',
    'date', 'datetime', 'integer', 'number', 'url',
    'pathReference', 'blocks', 'emptyDocument', 'empty',
}

# Deprecated or invalid field types that might be mistakenly used
INVALID_FIELD_TYPES = {
    'string': 'Use fields.text() instead',
    'boolean': 'Use fields.checkbox() instead',
    'rich-text': 'Use fields.document() instead',
    'markdown': 'Use fields.document() or fields.markdoc() instead',
    'ref': 'Use fields.relationship() instead',
    'list': 'Use fields.array() instead',
    'nested': 'Use fields.object() instead',
}


def check_field_types(file_path: str) -> Dict[str, Any]:
    """Check field type usage in a Keystatic schema file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'field_types_used': [],
        'field_count': 0,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Find all fields.* patterns
    field_pattern = r'fields\.(\w+)\s*\('
    used_types: Set[str] = set()

    for match in re.finditer(field_pattern, content):
        field_type = match.group(1)
        line_num = content[:match.start()].count('\n') + 1
        used_types.add(field_type)
        result['field_count'] += 1

        # Check if it's an invalid/deprecated type
        if field_type in INVALID_FIELD_TYPES:
            result['valid'] = False
            result['errors'].append(
                f"Line {line_num}: Invalid field type 'fields.{field_type}'. "
                f"{INVALID_FIELD_TYPES[field_type]}"
            )
        # Check if it's a valid type
        elif field_type not in VALID_FIELD_TYPES:
            result['valid'] = False
            result['errors'].append(
                f"Line {line_num}: Unknown field type 'fields.{field_type}'. "
                f"Valid types: {', '.join(sorted(VALID_FIELD_TYPES))}"
            )

    result['field_types_used'] = sorted(used_types)

    # Check for common configuration issues
    # Image without directory
    if 'image' in used_types:
        if 'directory:' not in content and 'publicPath:' not in content:
            result['warnings'].append(
                "fields.image() used without 'directory' or 'publicPath'. "
                "Consider specifying where images should be stored."
            )

    # Document without formatting options
    doc_pattern = r'fields\.document\s*\(\s*\{[^}]*\}\s*\)'
    for match in re.finditer(doc_pattern, content):
        doc_config = match.group(0)
        if 'formatting' not in doc_config:
            result['warnings'].append(
                "fields.document() without explicit 'formatting' option. "
                "Consider specifying formatting: true/false."
            )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python field_type_checker.py <schema_file>")
        sys.exit(1)

    schema_file = sys.argv[1]
    result = check_field_types(schema_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
