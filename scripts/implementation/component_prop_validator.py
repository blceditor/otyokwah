#!/usr/bin/env python3
"""
REQ-TEAM-003 - Component Prop Validator

Validates TypeScript prop types in React components for Bear Lake Camp.
Used by: react-frontend-specialist

Checks:
- Components have explicit prop interfaces
- No 'any' type usage
- Proper TypeScript patterns
"""

import re
from pathlib import Path
from typing import Dict, List, Any


def find_any_type_usage(content: str) -> List[Dict[str, Any]]:
    """Find usage of 'any' type."""
    issues = []

    # Find : any type annotations
    any_patterns = [
        r':\s*any\b',           # : any
        r':\s*any\s*\)',        # : any)
        r':\s*any\s*;',         # : any;
        r':\s*any\s*,',         # : any,
        r':\s*any\s*\|',        # : any |
        r'\|\s*any\b',          # | any
        r'<\s*any\s*>',         # <any>
        r'as\s+any\b',          # as any
    ]

    for pattern in any_patterns:
        for match in re.finditer(pattern, content):
            line_num = content[:match.start()].count('\n') + 1
            issues.append({
                'line': line_num,
                'type': 'any_type',
                'message': "Avoid using 'any' type. Use 'unknown' or a specific type instead."
            })

    return issues


def find_components_without_interfaces(content: str) -> List[Dict[str, Any]]:
    """Find function components without prop type interfaces."""
    issues = []

    # Find function components
    # Pattern: export function ComponentName(props) or export function ComponentName({ prop1, prop2 })
    component_patterns = [
        # Arrow function with untyped props
        r'(?:export\s+)?(?:const|let)\s+([A-Z]\w+)\s*=\s*\(\s*props\s*\)',
        r'(?:export\s+)?(?:const|let)\s+([A-Z]\w+)\s*=\s*\(\s*\{[^}]+\}\s*\)',
        # Regular function with untyped props
        r'(?:export\s+)?function\s+([A-Z]\w+)\s*\(\s*props\s*\)',
        r'(?:export\s+)?function\s+([A-Z]\w+)\s*\(\s*\{[^}]+\}\s*\)',
    ]

    for pattern in component_patterns:
        for match in re.finditer(pattern, content):
            component_name = match.group(1)
            line_num = content[:match.start()].count('\n') + 1

            # Check if there's a type annotation nearby
            context_start = max(0, match.start() - 200)
            context_end = min(len(content), match.end() + 50)
            context = content[context_start:context_end]

            # Look for type annotation after destructuring or props
            has_type = (
                ': ' in match.group(0) or
                f'{component_name}Props' in context or
                'Props' in context.split(match.group(0))[0][-100:] if match.group(0) in context else False
            )

            # More accurate check for typed props
            full_match = match.group(0)
            if ': ' not in full_match and 'Props' not in full_match:
                issues.append({
                    'line': line_num,
                    'type': 'missing_interface',
                    'message': f"Component '{component_name}' has props without type annotation. "
                              f"Add an interface like '{component_name}Props'."
                })

    return issues


def find_missing_return_types(content: str) -> List[Dict[str, Any]]:
    """Find functions without explicit return types (warning only)."""
    issues = []

    # Find exported functions without return types
    pattern = r'export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)\s*\{'
    for match in re.finditer(pattern, content):
        func_name = match.group(1)
        line_num = content[:match.start()].count('\n') + 1

        # Check for return type annotation
        func_signature = match.group(0)
        if ')' in func_signature:
            after_params = func_signature.split(')')[-1]
            if ':' not in after_params:
                # Skip common React patterns that have implicit return types
                if func_name.startswith('use'):  # hooks
                    continue
                if func_name[0].isupper():  # Components have implicit JSX.Element
                    continue

                issues.append({
                    'line': line_num,
                    'type': 'missing_return_type',
                    'message': f"Function '{func_name}' has no explicit return type (consider adding one)"
                })

    return issues


def validate_props(file_path: str) -> Dict[str, Any]:
    """Validate prop types in a file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Skip .d.ts files
    if file_path.endswith('.d.ts'):
        return result

    # Skip test files
    if '.spec.' in file_path or '.test.' in file_path:
        return result

    # Run checks
    any_issues = find_any_type_usage(content)
    interface_issues = find_components_without_interfaces(content)
    return_type_issues = find_missing_return_types(content)

    # Any type usage is an error
    for issue in any_issues:
        result['errors'].append(f"Line {issue['line']}: {issue['message']}")
        result['valid'] = False

    # Missing interface is an error
    for issue in interface_issues:
        result['errors'].append(f"Line {issue['line']}: {issue['message']}")
        result['valid'] = False

    # Missing return type is just a warning
    for issue in return_type_issues:
        result['warnings'].append(f"Line {issue['line']}: {issue['message']}")

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python component_prop_validator.py <file_or_pattern>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = validate_props(target)
    else:
        # Treat as glob pattern
        result = {
            'valid': True,
            'files_checked': 0,
            'errors': [],
            'warnings': [],
        }
        for file_path in Path('.').glob(target):
            if file_path.is_file():
                file_result = validate_props(str(file_path))
                result['files_checked'] += 1
                if not file_result['valid']:
                    result['valid'] = False
                result['errors'].extend(f"{file_path}: {e}" for e in file_result['errors'])
                result['warnings'].extend(f"{file_path}: {w}" for w in file_result['warnings'])

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
