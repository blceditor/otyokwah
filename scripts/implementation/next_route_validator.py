#!/usr/bin/env python3
"""
REQ-TEAM-003 - Next.js Route Validator

Validates Next.js App Router structure for Bear Lake Camp.
Used by: nextjs-vercel-specialist

Checks:
- Route directories have required files (page.tsx, layout.tsx)
- Dynamic routes use correct bracket syntax
- API routes export HTTP methods
- No invalid route patterns
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Any


# Valid Next.js special files
SPECIAL_FILES = {
    'page.tsx', 'page.ts', 'page.jsx', 'page.js',
    'layout.tsx', 'layout.ts', 'layout.jsx', 'layout.js',
    'loading.tsx', 'loading.ts', 'loading.jsx', 'loading.js',
    'error.tsx', 'error.ts', 'error.jsx', 'error.js',
    'not-found.tsx', 'not-found.ts', 'not-found.jsx', 'not-found.js',
    'route.tsx', 'route.ts', 'route.jsx', 'route.js',
    'template.tsx', 'template.ts', 'template.jsx', 'template.js',
}

# Files that make a directory a route
ROUTE_FILES = {'page.tsx', 'page.ts', 'page.jsx', 'page.js', 'route.tsx', 'route.ts'}

# Valid dynamic route patterns
DYNAMIC_ROUTE_PATTERNS = [
    r'^\[[\w-]+\]$',           # [slug]
    r'^\[\.\.\.[\w-]+\]$',     # [...slug]
    r'^\[\[\.\.\.[\w-]+\]\]$', # [[...slug]]
    r'^\([\w-]+\)$',           # (group)
    r'^@[\w-]+$',              # @modal (parallel routes)
]

# HTTP methods for API routes
HTTP_METHODS = {'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'}


def validate_route_name(name: str) -> bool:
    """Check if a route directory name is valid."""
    # Regular directory names (alphanumeric, hyphens, underscores)
    if re.match(r'^[\w-]+$', name):
        return True

    # Check dynamic route patterns
    for pattern in DYNAMIC_ROUTE_PATTERNS:
        if re.match(pattern, name):
            return True

    return False


def validate_page_file(file_path: str) -> Dict[str, Any]:
    """Validate a page.tsx file has required exports."""
    result = {'valid': True, 'errors': [], 'warnings': []}

    try:
        content = Path(file_path).read_text()

        # Check for default export
        has_default_export = (
            'export default' in content or
            'export { default }' in content
        )

        if not has_default_export:
            result['valid'] = False
            result['errors'].append(
                f"{file_path}: page.tsx must have a default export"
            )

    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"{file_path}: Error reading file - {e}")

    return result


def validate_route_file(file_path: str) -> Dict[str, Any]:
    """Validate a route.ts API file has HTTP method exports."""
    result = {'valid': True, 'errors': [], 'warnings': []}

    try:
        content = Path(file_path).read_text()

        # Check for at least one HTTP method export
        has_http_method = any(
            f'export async function {method}' in content or
            f'export function {method}' in content or
            f'export const {method}' in content
            for method in HTTP_METHODS
        )

        if not has_http_method:
            result['valid'] = False
            result['errors'].append(
                f"{file_path}: route.ts must export at least one HTTP method (GET, POST, etc.)"
            )

    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"{file_path}: Error reading file - {e}")

    return result


def validate_app_directory(app_dir: str) -> Dict[str, Any]:
    """Validate the entire Next.js app directory structure."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'routes': [],
        'api_routes': [],
    }

    app_path = Path(app_dir)

    if not app_path.exists():
        result['valid'] = False
        result['errors'].append(f"App directory not found: {app_dir}")
        return result

    # Check root layout exists
    root_layout = app_path / 'layout.tsx'
    if not root_layout.exists() and not (app_path / 'layout.ts').exists():
        result['warnings'].append(
            "Root layout.tsx not found in app directory (recommended)"
        )

    # Walk through the app directory
    for root, dirs, files in os.walk(app_dir):
        rel_path = Path(root).relative_to(app_path)
        dir_name = Path(root).name

        # Skip hidden directories and node_modules
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'node_modules']

        # Validate directory name if it's not the root
        if str(rel_path) != '.':
            if not validate_route_name(dir_name):
                result['valid'] = False
                result['errors'].append(
                    f"Invalid route directory name: {rel_path} "
                    f"(use [param], [...param], [[...param]], (group), or @slot)"
                )

        # Check if this directory contains route files
        has_page = any(f in files for f in ['page.tsx', 'page.ts', 'page.jsx', 'page.js'])
        has_route = any(f in files for f in ['route.tsx', 'route.ts'])
        has_tsx_files = any(f.endswith('.tsx') or f.endswith('.ts') for f in files)

        # Directory with .tsx files but no page.tsx or route.ts
        if has_tsx_files and not has_page and not has_route:
            # Check if it's a special directory (api, keystatic, etc.)
            is_api_dir = 'api' in str(rel_path).split(os.sep)
            is_keystatic = 'keystatic' in str(rel_path)
            is_route_group = dir_name.startswith('(') and dir_name.endswith(')')

            if not is_api_dir and not is_keystatic and str(rel_path) != '.' and not is_route_group:
                # Check for subdirectories with pages (might be a grouping directory)
                has_subdir_with_page = any(
                    (Path(root) / d / 'page.tsx').exists() or
                    (Path(root) / d / 'page.ts').exists()
                    for d in dirs
                )
                if not has_subdir_with_page:
                    result['valid'] = False
                    result['errors'].append(
                        f"Directory {rel_path} has .tsx files but no page.tsx "
                        "(add page.tsx to make it a route)"
                    )

        # Validate page files
        for page_file in ['page.tsx', 'page.ts']:
            page_path = Path(root) / page_file
            if page_path.exists():
                page_result = validate_page_file(str(page_path))
                result['errors'].extend(page_result['errors'])
                if not page_result['valid']:
                    result['valid'] = False
                else:
                    result['routes'].append(str(rel_path))

        # Validate route files
        for route_file in ['route.tsx', 'route.ts']:
            route_path = Path(root) / route_file
            if route_path.exists():
                route_result = validate_route_file(str(route_path))
                result['errors'].extend(route_result['errors'])
                if not route_result['valid']:
                    result['valid'] = False
                else:
                    result['api_routes'].append(str(rel_path))

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python next_route_validator.py <app_directory>")
        sys.exit(1)

    app_dir = sys.argv[1]
    result = validate_app_directory(app_dir)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
