#!/usr/bin/env python3
"""
REQ-TEAM-003 - Content Model Analyzer

Analyzes Keystatic content model structure for Bear Lake Camp.
Used by: keystatic-specialist

Provides:
- Collection count and structure
- Field usage statistics
- Complexity metrics
- Relationship graph
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


def analyze_content_model(file_path: str) -> Dict[str, Any]:
    """Analyze content model structure in a Keystatic schema file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'collection_count': 0,
        'singleton_count': 0,
        'collections': {},
        'singletons': {},
        'field_type_stats': {},
        'complexity_score': 0,
        'relationships': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Extract collections
    collection_pattern = r'(\w+):\s*collection\s*\('
    for match in re.finditer(collection_pattern, content):
        collection_name = match.group(1)
        result['collections'][collection_name] = {
            'fields': [],
            'relationships': [],
        }
        result['collection_count'] += 1

    # Extract singletons
    singleton_pattern = r'(\w+):\s*singleton\s*\('
    for match in re.finditer(singleton_pattern, content):
        singleton_name = match.group(1)
        result['singletons'][singleton_name] = {
            'fields': [],
        }
        result['singleton_count'] += 1

    # Count field types
    field_pattern = r'fields\.(\w+)\s*\('
    for match in re.finditer(field_pattern, content):
        field_type = match.group(1)
        if field_type not in result['field_type_stats']:
            result['field_type_stats'][field_type] = 0
        result['field_type_stats'][field_type] += 1

    # Extract relationships
    rel_pattern = r"fields\.relationship\s*\(\s*\{[^}]*collection:\s*['\"](\w+)['\"]"
    for match in re.finditer(rel_pattern, content, re.DOTALL):
        target = match.group(1)
        result['relationships'].append({'target': target})

    # Calculate complexity score
    complexity = 0

    # Base complexity from collection/singleton count
    complexity += result['collection_count'] * 1
    complexity += result['singleton_count'] * 1

    # Additional complexity from field types
    complexity += result['field_type_stats'].get('conditional', 0) * 3  # Conditionals are complex
    complexity += result['field_type_stats'].get('array', 0) * 2  # Arrays add complexity
    complexity += result['field_type_stats'].get('object', 0) * 2  # Nested objects add complexity
    complexity += result['field_type_stats'].get('relationship', 0) * 2  # Relationships add complexity
    complexity += result['field_type_stats'].get('blocks', 0) * 4  # Blocks are very complex

    # Simple fields add less complexity
    simple_types = ['text', 'slug', 'checkbox', 'date', 'datetime', 'integer', 'number', 'url']
    for ft in simple_types:
        complexity += result['field_type_stats'].get(ft, 0) * 0.5

    result['complexity_score'] = round(complexity, 1)

    # Provide recommendations based on complexity
    if result['complexity_score'] > 50:
        result['warnings'].append(
            f"High schema complexity ({result['complexity_score']}). "
            "Consider splitting into smaller, focused collections."
        )
    elif result['complexity_score'] > 30:
        result['warnings'].append(
            f"Moderate schema complexity ({result['complexity_score']}). "
            "Document the schema structure for maintainability."
        )

    # Check for potential issues
    if result['field_type_stats'].get('conditional', 0) > 5:
        result['warnings'].append(
            "Many conditional fields detected. Consider if separate collections would be cleaner."
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python content_model_analyzer.py <schema_file>")
        sys.exit(1)

    schema_file = sys.argv[1]
    result = analyze_content_model(schema_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
