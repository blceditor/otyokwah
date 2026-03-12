#!/usr/bin/env python3
"""
REQ-TEAM-003 - Server/Client Boundary Checker

Validates React Server/Client component boundaries for Bear Lake Camp.
Used by: react-frontend-specialist, nextjs-vercel-specialist

Checks:
- No hooks (useState, useEffect) in Server Components
- No event handlers (onClick) in Server Components
- 'use client' directive present when needed
"""

import re
from pathlib import Path
from typing import Dict, List, Any


# React hooks that require client component
CLIENT_HOOKS = [
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'useImperativeHandle',
    'useDebugValue',
    'useDeferredValue',
    'useTransition',
    'useId',
    'useSyncExternalStore',
    'useInsertionEffect',
]

# Event handlers that require client component
EVENT_HANDLERS = [
    'onClick',
    'onChange',
    'onSubmit',
    'onFocus',
    'onBlur',
    'onKeyDown',
    'onKeyUp',
    'onKeyPress',
    'onMouseDown',
    'onMouseUp',
    'onMouseEnter',
    'onMouseLeave',
    'onDrag',
    'onDrop',
    'onScroll',
    'onInput',
    'onTouchStart',
    'onTouchEnd',
]

# Browser APIs that require client component
BROWSER_APIS = [
    'window.',
    'document.',
    'localStorage',
    'sessionStorage',
    'navigator.',
]


def is_client_component(content: str) -> bool:
    """Check if file has 'use client' directive."""
    # 'use client' must be at the top of the file
    lines = content.strip().split('\n')
    for line in lines[:5]:  # Check first 5 lines
        stripped = line.strip()
        if stripped.startswith('//') or stripped.startswith('/*'):
            continue
        if stripped == "'use client'" or stripped == '"use client"':
            return True
        if stripped.startswith("'use client';") or stripped.startswith('"use client";'):
            return True
        # If we hit a non-comment, non-directive line, stop
        if stripped and not stripped.startswith('//') and not stripped.startswith('/*'):
            break
    return False


def find_hook_usage(content: str) -> List[Dict[str, Any]]:
    """Find React hook usage in content."""
    usages = []

    for hook in CLIENT_HOOKS:
        # Look for import of hook
        import_pattern = rf'import\s*\{{[^}}]*{hook}[^}}]*\}}\s*from\s*[\'"]react[\'"]'
        if re.search(import_pattern, content):
            # Look for actual usage
            usage_pattern = rf'\b{hook}\s*\('
            for match in re.finditer(usage_pattern, content):
                # Get line number
                line_num = content[:match.start()].count('\n') + 1
                usages.append({
                    'hook': hook,
                    'line': line_num,
                    'type': 'hook'
                })

    return usages


def find_event_handler_usage(content: str) -> List[Dict[str, Any]]:
    """Find event handler usage in JSX."""
    usages = []

    for handler in EVENT_HANDLERS:
        # Look for handler in JSX (e.g., onClick={...})
        pattern = rf'{handler}\s*=\s*\{{'
        for match in re.finditer(pattern, content):
            line_num = content[:match.start()].count('\n') + 1
            usages.append({
                'handler': handler,
                'line': line_num,
                'type': 'event_handler'
            })

    return usages


def find_browser_api_usage(content: str) -> List[Dict[str, Any]]:
    """Find browser API usage."""
    usages = []

    for api in BROWSER_APIS:
        pattern = rf'\b{re.escape(api)}'
        for match in re.finditer(pattern, content):
            # Skip if it's in a comment
            line_start = content.rfind('\n', 0, match.start()) + 1
            line = content[line_start:match.start()]
            if '//' in line or '/*' in line:
                continue

            line_num = content[:match.start()].count('\n') + 1
            usages.append({
                'api': api.rstrip('.'),
                'line': line_num,
                'type': 'browser_api'
            })

    return usages


def check_boundaries(file_path: str) -> Dict[str, Any]:
    """Check Server/Client component boundaries in a file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'is_client_component': False,
        'client_features': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Check if it's a client component
    is_client = is_client_component(content)
    result['is_client_component'] = is_client

    # Find client-side feature usage
    hooks = find_hook_usage(content)
    handlers = find_event_handler_usage(content)
    browser_apis = find_browser_api_usage(content)

    all_usages = hooks + handlers + browser_apis
    result['client_features'] = all_usages

    # If not a client component but uses client features, that's an error
    if not is_client and all_usages:
        result['valid'] = False

        for usage in hooks:
            result['errors'].append(
                f"Line {usage['line']}: {usage['hook']} hook used in Server Component. "
                f"Add 'use client' directive or move to Client Component."
            )

        for usage in handlers:
            result['errors'].append(
                f"Line {usage['line']}: {usage['handler']} event handler in Server Component. "
                f"Add 'use client' directive or move to Client Component."
            )

        for usage in browser_apis:
            result['errors'].append(
                f"Line {usage['line']}: {usage['api']} browser API in Server Component. "
                f"Add 'use client' directive or move to Client Component."
            )

    # Warn if 'use client' is used but no client features are found
    if is_client and not all_usages:
        result['warnings'].append(
            "File has 'use client' directive but no client-side features detected. "
            "Consider removing 'use client' to make this a Server Component."
        )

    return result


def check_directory(dir_path: str, extensions: List[str] = None) -> Dict[str, Any]:
    """Check all files in a directory."""
    if extensions is None:
        extensions = ['.tsx', '.ts', '.jsx', '.js']

    result = {
        'valid': True,
        'files_checked': 0,
        'errors': [],
        'warnings': [],
        'summary': {
            'server_components': 0,
            'client_components': 0,
            'violations': 0,
        }
    }

    for file_path in Path(dir_path).rglob('*'):
        if file_path.suffix not in extensions:
            continue
        if 'node_modules' in str(file_path):
            continue
        if file_path.name.endswith('.spec.tsx') or file_path.name.endswith('.test.tsx'):
            continue

        result['files_checked'] += 1
        file_result = check_boundaries(str(file_path))

        if file_result['is_client_component']:
            result['summary']['client_components'] += 1
        else:
            result['summary']['server_components'] += 1

        if not file_result['valid']:
            result['valid'] = False
            result['summary']['violations'] += 1
            for error in file_result['errors']:
                result['errors'].append(f"{file_path}: {error}")

        result['warnings'].extend(file_result['warnings'])

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python server_client_boundary_checker.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = check_boundaries(target)
    elif path.is_dir():
        result = check_directory(target)
    else:
        print(f"Error: {target} not found")
        sys.exit(1)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
