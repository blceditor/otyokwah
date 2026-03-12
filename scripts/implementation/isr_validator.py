#!/usr/bin/env python3
"""
REQ-TEAM-003 - ISR Validator

Validates Incremental Static Regeneration configuration for Bear Lake Camp.
Used by: nextjs-vercel-specialist

Checks:
- revalidate export presence
- dynamic export configuration
- Fetch with ISR considerations
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional


def validate_isr(file_path: str) -> Dict[str, Any]:
    """Validate ISR configuration in a Next.js page file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'has_revalidate': False,
        'revalidate_value': None,
        'is_dynamic': False,
        'dynamic_value': None,
        'has_data_fetching': False,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Check for revalidate export
    revalidate_match = re.search(r'export\s+const\s+revalidate\s*=\s*(\d+)', content)
    if revalidate_match:
        result['has_revalidate'] = True
        result['revalidate_value'] = int(revalidate_match.group(1))

    # Check for dynamic export
    dynamic_match = re.search(r"export\s+const\s+dynamic\s*=\s*['\"]([^'\"]+)['\"]", content)
    if dynamic_match:
        result['dynamic_value'] = dynamic_match.group(1)
        result['is_dynamic'] = dynamic_match.group(1) in ['force-dynamic', 'auto']

    # Check for data fetching (async operations)
    has_async_operations = (
        'await ' in content or
        'fetch(' in content or
        'reader.collections' in content
    )
    result['has_data_fetching'] = has_async_operations

    # Check for 'use client' (client components don't need ISR)
    is_client = content.strip().startswith("'use client'") or content.strip().startswith('"use client"')

    # Warn if dynamic data fetching without ISR or explicit dynamic
    if has_async_operations and not is_client:
        if not result['has_revalidate'] and not result['is_dynamic']:
            result['warnings'].append(
                "Page has data fetching but no ISR configuration. "
                "Consider adding 'export const revalidate = <seconds>' for caching, "
                "or 'export const dynamic = \"force-dynamic\"' for always-fresh data."
            )

    # Warn about very short revalidate times
    if result['revalidate_value'] is not None and result['revalidate_value'] < 60:
        result['warnings'].append(
            f"Revalidate time is very short ({result['revalidate_value']}s). "
            "Consider if this frequency is necessary for your content update needs."
        )

    # Warn about very long revalidate times for dynamic content
    if result['revalidate_value'] is not None and result['revalidate_value'] > 86400:
        result['warnings'].append(
            f"Revalidate time is very long ({result['revalidate_value']}s = {result['revalidate_value'] // 3600}h). "
            "Content may feel stale to users."
        )

    return result


def validate_isr_directory(directory: str) -> Dict[str, Any]:
    """Validate ISR configuration in all page files in a directory."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'files_checked': 0,
        'files_with_isr': 0,
        'files_with_dynamic': 0,
    }

    dir_path = Path(directory)
    if not dir_path.exists():
        result['valid'] = False
        result['errors'].append(f"Directory not found: {directory}")
        return result

    for page_file in dir_path.rglob('page.tsx'):
        file_result = validate_isr(str(page_file))
        result['files_checked'] += 1

        if file_result['has_revalidate']:
            result['files_with_isr'] += 1
        if file_result['is_dynamic']:
            result['files_with_dynamic'] += 1

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
        print("Usage: python isr_validator.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = validate_isr(target)
    else:
        result = validate_isr_directory(target)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
