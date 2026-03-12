#!/usr/bin/env python3
"""
REQ-TEAM-004 - Secret Scanner

Detects hardcoded secrets in code.
Used by: security-reviewer.md § Secret Handling

Detects:
- API keys (Stripe, AWS, GitHub, generic)
- Passwords and connection strings
- Private keys (RSA, SSH)
- JWT tokens
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any, Optional


# Secret patterns with severity
SECRET_PATTERNS = {
    'stripe_secret': {
        'pattern': r'sk_(?:live|test)_[a-zA-Z0-9]{10,}',
        'type': 'stripe_api_key',
        'severity': 'high'
    },
    'stripe_publishable': {
        'pattern': r'pk_(?:live|test)_[a-zA-Z0-9]{10,}',
        'type': 'stripe_publishable_key',
        'severity': 'medium'
    },
    'aws_access_key': {
        'pattern': r'AKIA[0-9A-Z]{16}',
        'type': 'aws_access_key',
        'severity': 'high'
    },
    'aws_secret_key': {
        'pattern': r'(?i)aws[_-]?secret[_-]?access[_-]?key["\s:=]+["\']?([A-Za-z0-9/+=]{40})',
        'type': 'aws_secret_key',
        'severity': 'critical'
    },
    'github_token': {
        'pattern': r'ghp_[a-zA-Z0-9]{30,}',
        'type': 'github_token',
        'severity': 'high'
    },
    'github_oauth': {
        'pattern': r'gho_[a-zA-Z0-9]{36}',
        'type': 'github_oauth',
        'severity': 'high'
    },
    'generic_api_key': {
        'pattern': r'(?i)(?:api[_-]?key|apikey)["\s:=]+["\']?([a-zA-Z0-9_-]{20,})',
        'type': 'api_key',
        'severity': 'high'
    },
    'jwt_token': {
        'pattern': r'eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*',
        'type': 'jwt_token',
        'severity': 'high'
    },
    'private_key_rsa': {
        'pattern': r'-----BEGIN (?:RSA )?PRIVATE KEY-----',
        'type': 'private_key',
        'severity': 'critical'
    },
    'private_key_ssh': {
        'pattern': r'-----BEGIN OPENSSH PRIVATE KEY-----',
        'type': 'ssh_private_key',
        'severity': 'critical'
    },
    'password_assignment': {
        'pattern': r'(?i)(?:password|passwd|pwd)["\s:=]+["\']([^"\']{8,})["\']',
        'type': 'password',
        'severity': 'high'
    },
    'connection_string': {
        'pattern': r'(?:postgresql|mysql|mongodb)://[^:]+:[^@]+@[^\s]+',
        'type': 'connection_string',
        'severity': 'high'
    },
    'supabase_service_role': {
        'pattern': r'eyJ[a-zA-Z0-9_-]*\.eyJ[^.]*"role"\s*:\s*"service_role"[^.]*\.[a-zA-Z0-9_-]*',
        'type': 'supabase_service_role_key',
        'severity': 'critical'
    }
}

# Patterns that indicate safe usage (environment variables)
SAFE_PATTERNS = [
    r'process\.env\.',
    r'import\.meta\.env\.',
    r'Deno\.env\.',
    r'\$\{?[A-Z_]+\}?',  # Shell variables
    r'os\.environ',
    r'getenv\(',
]

TEST_FILE_SUFFIXES = (
    '.spec.ts', '.spec.tsx', '.test.ts', '.test.tsx',
    '.spec.js', '.test.js', '_spec.py', '_test.py',
)

PLACEHOLDER_PATTERNS = [
    r'YOUR_[A-Z_]+_HERE',
    r'<your[_-]?[a-z_-]+>',
    r'xxx[-_]xxx[-_]xxx',
    r'REPLACE_ME',
    r'placeholder',
    r'example[_-]?(?:key|token|secret)',
    r'test[_-]?(?:key|token|secret|api)',
    r'your[_-]?(?:key|token|secret)',
]


def is_safe_usage(code: str, match_pos: int) -> bool:
    """Check if the match is in a safe context (env variable)."""
    # Get surrounding context (100 chars before)
    start = max(0, match_pos - 100)
    context = code[start:match_pos]

    for pattern in SAFE_PATTERNS:
        if re.search(pattern, context):
            return True
    return False


def is_placeholder(value: str) -> bool:
    """Check if the value is a placeholder."""
    for pattern in PLACEHOLDER_PATTERNS:
        if re.search(pattern, value, re.IGNORECASE):
            return True
    return False


def detect_secrets(code: str) -> Dict[str, Any]:
    """Detect secrets in code string."""
    result = {
        'secrets': [],
        'safe_references': []
    }

    for name, config in SECRET_PATTERNS.items():
        for match in re.finditer(config['pattern'], code):
            match_value = match.group(0)
            match_pos = match.start()
            line_num = code[:match_pos].count('\n') + 1

            # Skip if it's a safe usage
            if is_safe_usage(code, match_pos):
                result['safe_references'].append({
                    'type': config['type'],
                    'line': line_num,
                    'reason': 'Environment variable reference'
                })
                continue

            # Skip if it's a placeholder
            if is_placeholder(match_value):
                continue

            result['secrets'].append({
                'type': config['type'],
                'severity': config['severity'],
                'line': line_num,
                'value_preview': match_value[:20] + '...' if len(match_value) > 20 else match_value
            })

    return result


def scan_file(file_path: str) -> Dict[str, Any]:
    """Scan a single file for secrets."""
    result = {
        'file': file_path,
        'secrets': [],
        'safe_references': [],
        'is_template': False,
        'is_test': False
    }

    path = Path(file_path)

    # Check if it's a template file
    if path.name in ['.env.example', '.env.template', '.env.sample']:
        result['is_template'] = True
        return result

    if path.name.endswith(TEST_FILE_SUFFIXES):
        result['is_test'] = True

    try:
        content = path.read_text()
        detection = detect_secrets(content)

        if result['is_test']:
            detection['secrets'] = [
                s for s in detection['secrets']
                if s['type'] != 'password'
            ]

        result['secrets'] = detection['secrets']
        result['safe_references'] = detection['safe_references']

    except Exception as e:
        result['error'] = str(e)

    return result


def should_skip_file(file_path: Path, respect_gitignore: bool = True) -> bool:
    """Check if file should be skipped."""
    skip_dirs = ['node_modules', '.git', '.next', 'dist', 'build', '.cache']
    skip_extensions = ['.lock', '.map', '.min.js', '.min.css']

    # Check directory
    for part in file_path.parts:
        if part in skip_dirs or part.startswith('.'):
            return True

    # Check extension
    if file_path.suffix in skip_extensions:
        return True

    return False


def scan_directory(
    directory: str,
    respect_gitignore: bool = True,
    extensions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Scan entire directory for secrets."""
    if extensions is None:
        extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.yaml', '.yml']

    result = {
        'directory': directory,
        'files_scanned': 0,
        'secrets_found': 0,
        'files_with_secrets': [],
        'all_secrets': []
    }

    dir_path = Path(directory)

    # Load gitignore patterns if needed
    gitignore_patterns = []
    if respect_gitignore:
        gitignore_path = dir_path / '.gitignore'
        if gitignore_path.exists():
            gitignore_patterns = [
                line.strip() for line in gitignore_path.read_text().splitlines()
                if line.strip() and not line.startswith('#')
            ]

    for file_path in dir_path.rglob('*'):
        if not file_path.is_file():
            continue

        if should_skip_file(file_path):
            continue

        # Check gitignore
        if respect_gitignore:
            relative_path = str(file_path.relative_to(dir_path))
            if any(re.match(p.replace('*', '.*'), relative_path) for p in gitignore_patterns):
                continue

        # Check extension
        if extensions and file_path.suffix not in extensions:
            continue

        result['files_scanned'] += 1

        file_result = scan_file(str(file_path))
        if file_result.get('secrets'):
            result['secrets_found'] += len(file_result['secrets'])
            result['files_with_secrets'].append(str(file_path.relative_to(dir_path)))
            for secret in file_result['secrets']:
                result['all_secrets'].append({
                    **secret,
                    'file': str(file_path.relative_to(dir_path))
                })

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python secret_scanner.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]

    if os.path.isfile(target):
        result = scan_file(target)
    else:
        result = scan_directory(target)

    print(json.dumps(result, indent=2))

    # Exit with error if high-severity secrets found
    high_severity = [
        s for s in result.get('all_secrets', result.get('secrets', []))
        if s.get('severity') in ['high', 'critical']
    ]
    if high_severity:
        sys.exit(1)


if __name__ == "__main__":
    main()
