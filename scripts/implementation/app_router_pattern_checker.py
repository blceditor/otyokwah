#!/usr/bin/env python3
"""
REQ-TEAM-003 - App Router Pattern Checker

Validates Next.js App Router patterns for Bear Lake Camp.
Used by: nextjs-vercel-specialist

Checks:
- Proper async/await patterns in Server Components
- 'use client' directive placement
- Page component exports
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any


def check_page_file(file_path: str) -> Dict[str, Any]:
    """Check a single page file for App Router patterns."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'is_client': False,
        'is_async': False,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Check for 'use client' directive
    has_use_client = content.strip().startswith("'use client'") or content.strip().startswith('"use client"')
    result['is_client'] = has_use_client

    # If it's a page file and uses 'use client', warn
    if 'page.tsx' in file_path or 'page.ts' in file_path:
        if has_use_client:
            result['warnings'].append(
                f"Page file uses 'use client'. Consider using Server Components for better performance. "
                "If interactivity is needed, extract to a Client Component child."
            )

    # Check for async function pattern
    has_async = bool(re.search(r'export\s+default\s+async\s+function', content))
    result['is_async'] = has_async

    # Check for await without async
    # Find function bodies and check for await
    function_pattern = r'export\s+default\s+function\s+\w+\s*\([^)]*\)\s*\{'
    for match in re.finditer(function_pattern, content):
        func_start = match.end()
        # Find matching closing brace (simplified)
        brace_count = 1
        i = func_start
        while i < len(content) and brace_count > 0:
            if content[i] == '{':
                brace_count += 1
            elif content[i] == '}':
                brace_count -= 1
            i += 1

        func_body = content[func_start:i]

        # Check if await is used in the function body
        if 'await ' in func_body:
            result['valid'] = False
            result['errors'].append(
                "Found 'await' in non-async function. Add 'async' keyword to function declaration."
            )

    # Check for proper export default
    has_default_export = bool(re.search(r'export\s+default', content))
    if not has_default_export and ('page.tsx' in file_path or 'page.ts' in file_path):
        result['valid'] = False
        result['errors'].append("Page file must have a default export")

    return result


def check_app_router_patterns(app_dir: str) -> Dict[str, Any]:
    """Check all page files in the app directory."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'pages_checked': 0,
        'client_pages': 0,
        'async_pages': 0,
    }

    app_path = Path(app_dir)
    if not app_path.exists():
        result['valid'] = False
        result['errors'].append(f"App directory not found: {app_dir}")
        return result

    # Find all page files
    for page_file in app_path.rglob('page.tsx'):
        file_result = check_page_file(str(page_file))
        result['pages_checked'] += 1

        if file_result['is_client']:
            result['client_pages'] += 1
        if file_result['is_async']:
            result['async_pages'] += 1

        if not file_result['valid']:
            result['valid'] = False
            result['errors'].extend(
                f"{page_file}: {e}" for e in file_result['errors']
            )
        result['warnings'].extend(
            f"{page_file}: {w}" for w in file_result['warnings']
        )

    # Also check .ts files
    for page_file in app_path.rglob('page.ts'):
        file_result = check_page_file(str(page_file))
        result['pages_checked'] += 1

        if not file_result['valid']:
            result['valid'] = False
            result['errors'].extend(
                f"{page_file}: {e}" for e in file_result['errors']
            )
        result['warnings'].extend(
            f"{page_file}: {w}" for w in file_result['warnings']
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python app_router_pattern_checker.py <app_directory>")
        sys.exit(1)

    app_dir = sys.argv[1]
    result = check_app_router_patterns(app_dir)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
