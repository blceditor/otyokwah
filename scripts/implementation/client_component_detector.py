#!/usr/bin/env python3
"""
REQ-TEAM-003 - Client Component Detector

Detects React Client Component patterns for Bear Lake Camp.
Used by: react-frontend-specialist

Checks:
- 'use client' directive presence
- Unnecessary 'use client' usage
- Missing 'use client' when needed
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


# Hooks that require Client Components
CLIENT_HOOKS = {
    'useState', 'useEffect', 'useContext', 'useReducer',
    'useCallback', 'useMemo', 'useRef', 'useImperativeHandle',
    'useLayoutEffect', 'useDebugValue', 'useDeferredValue',
    'useTransition', 'useId', 'useSyncExternalStore',
    'useInsertionEffect',
}

# Event handlers that require Client Components
CLIENT_EVENTS = {
    'onClick', 'onChange', 'onSubmit', 'onKeyDown', 'onKeyUp',
    'onMouseEnter', 'onMouseLeave', 'onFocus', 'onBlur',
    'onScroll', 'onInput', 'onDrag', 'onDrop', 'onTouchStart',
    'onTouchEnd', 'onTouchMove', 'onLoad', 'onError',
}


def detect_client_components(file_path: str) -> Dict[str, Any]:
    """Detect Client Component patterns in a React file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'is_client_component': False,
        'has_use_client_directive': False,
        'hooks_found': [],
        'events_found': [],
        'needs_client': False,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Check for 'use client' directive
    has_use_client = (
        content.strip().startswith("'use client'") or
        content.strip().startswith('"use client"')
    )
    result['has_use_client_directive'] = has_use_client
    result['is_client_component'] = has_use_client

    # Find hooks used
    hooks_found: Set[str] = set()
    for hook in CLIENT_HOOKS:
        # Match hook usage like useState( or useState<
        if re.search(rf'\b{hook}\s*[(<]', content):
            hooks_found.add(hook)
    result['hooks_found'] = sorted(hooks_found)

    # Find event handlers used
    events_found: Set[str] = set()
    for event in CLIENT_EVENTS:
        if re.search(rf'\b{event}\s*=', content):
            events_found.add(event)
    result['events_found'] = sorted(events_found)

    # Check if component needs to be a Client Component
    needs_client = len(hooks_found) > 0 or len(events_found) > 0
    result['needs_client'] = needs_client

    # Validate: hooks/events without 'use client'
    if needs_client and not has_use_client:
        result['valid'] = False
        if hooks_found:
            result['errors'].append(
                f"Found React hooks ({', '.join(hooks_found)}) but no 'use client' directive. "
                "Add 'use client' at the top of the file or move hooks to a Client Component."
            )
        if events_found:
            result['errors'].append(
                f"Found event handlers ({', '.join(events_found)}) but no 'use client' directive. "
                "Add 'use client' at the top of the file or extract interactive parts to a Client Component."
            )

    # Warn: 'use client' without hooks/events (possibly unnecessary)
    if has_use_client and not needs_client:
        result['warnings'].append(
            "'use client' directive found but no hooks or event handlers detected. "
            "This component might be unnecessarily marked as a Client Component. "
            "Consider removing 'use client' for better server-side rendering."
        )

    return result


def detect_client_components_directory(directory: str) -> Dict[str, Any]:
    """Detect Client Component patterns in all files in a directory."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'files_checked': 0,
        'client_components': 0,
        'unnecessary_client': 0,
        'missing_client': 0,
    }

    dir_path = Path(directory)
    if not dir_path.exists():
        result['valid'] = False
        result['errors'].append(f"Directory not found: {directory}")
        return result

    for tsx_file in dir_path.rglob('*.tsx'):
        # Skip test files
        if '.spec.' in str(tsx_file) or '.test.' in str(tsx_file):
            continue

        file_result = detect_client_components(str(tsx_file))
        result['files_checked'] += 1

        if file_result['is_client_component']:
            result['client_components'] += 1

        if not file_result['valid']:
            result['valid'] = False
            result['missing_client'] += 1
            result['errors'].extend(
                f"{tsx_file}: {e}" for e in file_result['errors']
            )

        if file_result['has_use_client_directive'] and not file_result['needs_client']:
            result['unnecessary_client'] += 1
            result['warnings'].extend(
                f"{tsx_file}: {w}" for w in file_result['warnings']
            )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python client_component_detector.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = detect_client_components(target)
    else:
        result = detect_client_components_directory(target)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
