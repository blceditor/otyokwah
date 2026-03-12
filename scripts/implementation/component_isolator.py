#!/usr/bin/env python3
"""
REQ-TEAM-003 - Component Isolator

Extracts React component dependencies for testing.
Used by: react-frontend-specialist

Provides:
- Import extraction
- Props interface detection
- Dependency list for mocking
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


def isolate_component(file_path: str) -> Dict[str, Any]:
    """Extract component dependencies and props for isolation testing."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'imports': [],
        'types': [],
        'props_interface': None,
        'required_props': [],
        'optional_props': [],
        'hooks_used': [],
        'dependencies': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Extract imports
    import_pattern = r"import\s+(?:type\s+)?(?:\{[^}]+\}|[\w*]+)\s+from\s+['\"]([^'\"]+)['\"]"
    for match in re.finditer(import_pattern, content):
        import_path = match.group(1)
        result['imports'].append(import_path)

        # Categorize dependencies
        if import_path.startswith('@/') or import_path.startswith('./') or import_path.startswith('../'):
            result['dependencies'].append(import_path)

    # Extract type imports
    type_import_pattern = r"import\s+type\s+\{([^}]+)\}"
    for match in re.finditer(type_import_pattern, content):
        types = [t.strip() for t in match.group(1).split(',')]
        result['types'].extend(types)

    # Also find types from regular imports
    combined_import_pattern = r"import\s+\{([^}]+)\}\s+from"
    for match in re.finditer(combined_import_pattern, content):
        imports = match.group(1).split(',')
        for imp in imports:
            imp = imp.strip()
            if imp.startswith('type '):
                result['types'].append(imp.replace('type ', '').strip())

    # Find props interface
    interface_pattern = r'interface\s+(\w+Props)\s*\{'
    for match in re.finditer(interface_pattern, content):
        result['props_interface'] = match.group(1)

        # Extract the interface body
        start = match.end()
        brace_count = 1
        i = start
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1

        interface_body = content[start:i-1]

        # Parse props from interface body
        prop_pattern = r'(\w+)(\??):\s*([^;]+)'
        for prop_match in re.finditer(prop_pattern, interface_body):
            prop_name = prop_match.group(1)
            is_optional = prop_match.group(2) == '?'

            if is_optional:
                result['optional_props'].append(prop_name)
            else:
                result['required_props'].append(prop_name)

        break  # Only process first Props interface

    # Also check for type alias props
    type_props_pattern = r'type\s+(\w+Props)\s*=\s*\{'
    if not result['props_interface']:
        for match in re.finditer(type_props_pattern, content):
            result['props_interface'] = match.group(1)
            break

    # Find hooks used
    hook_pattern = r'\buse[A-Z]\w+\s*\('
    hooks: Set[str] = set()
    for match in re.finditer(hook_pattern, content):
        hook_name = match.group(0).replace('(', '').strip()
        hooks.add(hook_name)
    result['hooks_used'] = sorted(hooks)

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python component_isolator.py <component_file>")
        sys.exit(1)

    component_file = sys.argv[1]
    result = isolate_component(component_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
