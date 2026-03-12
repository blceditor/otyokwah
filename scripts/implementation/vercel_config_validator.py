#!/usr/bin/env python3
"""
REQ-TEAM-003 - Vercel Config Validator

Validates vercel.json configuration for Bear Lake Camp.
Used by: nextjs-vercel-specialist

Checks:
- Valid JSON syntax
- Redirect/rewrite syntax
- Framework configuration
"""

import json
from pathlib import Path
from typing import Dict, Any, List


def validate_redirects(redirects: List[Dict]) -> List[str]:
    """Validate redirect configurations."""
    warnings = []
    errors = []

    for i, redirect in enumerate(redirects):
        if 'source' not in redirect:
            errors.append(f"Redirect {i}: Missing 'source' field")
        if 'destination' not in redirect:
            errors.append(f"Redirect {i}: Missing 'destination' field")
        if 'permanent' not in redirect:
            warnings.append(
                f"Redirect {i}: Missing 'permanent' field. "
                "Specify 'permanent: true' (308) or 'permanent: false' (307)"
            )

    return errors, warnings


def validate_rewrites(rewrites: List[Dict]) -> List[str]:
    """Validate rewrite configurations."""
    errors = []

    for i, rewrite in enumerate(rewrites):
        if 'source' not in rewrite:
            errors.append(f"Rewrite {i}: Missing 'source' field")
        if 'destination' not in rewrite:
            errors.append(f"Rewrite {i}: Missing 'destination' field")

    return errors


def validate_headers(headers: List[Dict]) -> List[str]:
    """Validate header configurations."""
    errors = []

    for i, header in enumerate(headers):
        if 'source' not in header:
            errors.append(f"Header {i}: Missing 'source' field")
        if 'headers' not in header:
            errors.append(f"Header {i}: Missing 'headers' array")
        elif isinstance(header.get('headers'), list):
            for j, h in enumerate(header['headers']):
                if 'key' not in h:
                    errors.append(f"Header {i}.headers[{j}]: Missing 'key' field")
                if 'value' not in h:
                    errors.append(f"Header {i}.headers[{j}]: Missing 'value' field")

    return errors


def validate_vercel_config(file_path: str) -> Dict[str, Any]:
    """Validate a vercel.json file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'config': {},
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Parse JSON
    try:
        config = json.loads(content)
        result['config'] = config
    except json.JSONDecodeError as e:
        result['valid'] = False
        result['errors'].append(f"Invalid JSON: {e}")
        return result

    # Validate framework
    if 'framework' in config:
        if config['framework'] not in ['nextjs', 'react', 'vue', 'nuxt', 'svelte']:
            result['warnings'].append(
                f"Unusual framework value: {config['framework']}. "
                "Expected 'nextjs' for Next.js projects."
            )
    else:
        result['warnings'].append(
            "No 'framework' specified. Consider adding 'framework': 'nextjs'"
        )

    # Validate redirects
    if 'redirects' in config:
        errors, warnings = validate_redirects(config['redirects'])
        result['errors'].extend(errors)
        result['warnings'].extend(warnings)
        if errors:
            result['valid'] = False

    # Validate rewrites
    if 'rewrites' in config:
        errors = validate_rewrites(config['rewrites'])
        result['errors'].extend(errors)
        if errors:
            result['valid'] = False

    # Validate headers
    if 'headers' in config:
        errors = validate_headers(config['headers'])
        result['errors'].extend(errors)
        if errors:
            result['valid'] = False

    # Check for common misconfigurations
    if 'buildCommand' in config and 'outputDirectory' not in config:
        result['warnings'].append(
            "Custom buildCommand without outputDirectory. "
            "Vercel may not find the build output."
        )

    return result


def main():
    """CLI entry point."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python vercel_config_validator.py <vercel.json>")
        sys.exit(1)

    config_file = sys.argv[1]
    result = validate_vercel_config(config_file)

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
