#!/usr/bin/env python3
"""
REQ-TEAM-003 - Schema Migration Planner

Plans migrations between Keystatic schema versions for Bear Lake Camp.
Used by: keystatic-specialist

Checks:
- Added fields
- Removed fields (breaking changes)
- Changed field types
- Migration complexity
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set, Tuple


def extract_fields(schema_content: str) -> Dict[str, str]:
    """Extract field definitions from schema content."""
    fields = {}

    # Find field definitions: fieldName: fields.type(...)
    pattern = r'(\w+):\s*fields\.(\w+)\s*\('
    for match in re.finditer(pattern, schema_content):
        field_name = match.group(1)
        field_type = match.group(2)
        fields[field_name] = field_type

    return fields


def plan_migration(old_schema_path: str, new_schema_path: str) -> Dict[str, Any]:
    """Plan migration between two schema versions."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'added_fields': [],
        'removed_fields': [],
        'changed_fields': [],
        'breaking_changes': [],
        'migration_steps': [],
        'risk_level': 'low',
    }

    # Read schemas
    try:
        old_content = Path(old_schema_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading old schema: {e}")
        return result

    try:
        new_content = Path(new_schema_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading new schema: {e}")
        return result

    # Extract fields
    old_fields = extract_fields(old_content)
    new_fields = extract_fields(new_content)

    old_field_names = set(old_fields.keys())
    new_field_names = set(new_fields.keys())

    # Find added fields
    added = new_field_names - old_field_names
    result['added_fields'] = list(added)
    for field in added:
        result['migration_steps'].append(
            f"ADD: Field '{field}' ({new_fields[field]}) - existing content will have null value"
        )

    # Find removed fields
    removed = old_field_names - new_field_names
    result['removed_fields'] = list(removed)
    for field in removed:
        result['breaking_changes'].append(
            f"REMOVE: Field '{field}' - data loss for existing content"
        )
        result['migration_steps'].append(
            f"REMOVE: Field '{field}' - backup data before migration"
        )

    # Find changed field types
    for field in old_field_names & new_field_names:
        if old_fields[field] != new_fields[field]:
            result['changed_fields'].append({
                'field': field,
                'old_type': old_fields[field],
                'new_type': new_fields[field],
            })
            result['breaking_changes'].append(
                f"CHANGE: Field '{field}' type changed from {old_fields[field]} to {new_fields[field]}"
            )
            result['migration_steps'].append(
                f"TRANSFORM: Field '{field}' - may require data transformation script"
            )

    # Calculate risk level
    if result['removed_fields'] or result['changed_fields']:
        result['risk_level'] = 'high'
    elif result['added_fields']:
        result['risk_level'] = 'low'
    else:
        result['risk_level'] = 'none'

    # Add migration recommendations
    if result['risk_level'] == 'high':
        result['warnings'].append(
            "High-risk migration detected. Create a backup before proceeding. "
            "Consider a phased migration approach."
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json
    import argparse

    parser = argparse.ArgumentParser(description='Plan Keystatic schema migration')
    parser.add_argument('--old', required=True, help='Path to old schema file')
    parser.add_argument('--new', required=True, help='Path to new schema file')

    args = parser.parse_args()

    result = plan_migration(args.old, args.new)

    print(json.dumps(result, indent=2))

    if not result['valid'] or result['risk_level'] == 'high':
        sys.exit(1)


if __name__ == "__main__":
    main()
