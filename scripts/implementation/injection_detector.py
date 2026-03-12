#!/usr/bin/env python3
"""
REQ-TEAM-004 - Injection Detector

Finds SQL/XSS/command injection patterns in code.
Used by: security-reviewer.md § Injection

Detects:
- SQL injection (string concatenation, template literals)
- XSS (innerHTML, dangerouslySetInnerHTML, eval)
- Command injection (exec, spawn with shell)
- Path traversal
- SSRF
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any, Optional


# SQL injection patterns
SQL_PATTERNS = {
    'string_concat': {
        'pattern': r'["\']SELECT[^"\']*["\']\s*\+\s*\w+',
        'severity': 'high',
        'message': 'SQL query with string concatenation'
    },
    'template_literal_sql': {
        'pattern': r'`SELECT[^`]*\$\{[^}]+\}[^`]*`',
        'severity': 'high',
        'message': 'SQL query with template literal interpolation'
    },
    'raw_query_unsafe': {
        'pattern': r'\.\$queryRawUnsafe\s*\(`[^`]*\$\{',
        'severity': 'critical',
        'message': 'Prisma $queryRawUnsafe with interpolation'
    },
    'exec_sql': {
        'pattern': r'(?:execute|exec|query)\s*\(\s*["\']?(?:SELECT|INSERT|UPDATE|DELETE)[^)]*\+',
        'severity': 'high',
        'message': 'SQL execution with string concatenation'
    }
}

# XSS patterns
XSS_PATTERNS = {
    'dangerously_set': {
        'pattern': r'dangerouslySetInnerHTML',
        'severity': 'high',
        'message': 'dangerouslySetInnerHTML usage - ensure input is sanitized'
    },
    'inner_html_assign': {
        'pattern': r'\.innerHTML\s*=',
        'severity': 'high',
        'message': 'Direct innerHTML assignment'
    },
    'document_write': {
        'pattern': r'document\.write(?:ln)?\s*\(',
        'severity': 'high',
        'message': 'document.write usage'
    },
    'eval_usage': {
        'pattern': r'\beval\s*\(',
        'severity': 'critical',
        'message': 'eval() usage - extremely dangerous'
    },
    'new_function': {
        'pattern': r'new\s+Function\s*\(',
        'severity': 'critical',
        'message': 'new Function() constructor - code injection risk'
    },
    'set_timeout_string': {
        'pattern': r'setTimeout\s*\(\s*["\'][^"\']+["\']\s*,',
        'severity': 'medium',
        'message': 'setTimeout with string argument (code execution risk)'
    }
}

# Command injection patterns
COMMAND_PATTERNS = {
    'exec_template': {
        'pattern': r'exec\s*\(`[^`]*\$\{',
        'severity': 'critical',
        'message': 'exec with template literal interpolation'
    },
    'exec_concat': {
        'pattern': r'exec\s*\([^)]*\+',
        'severity': 'critical',
        'message': 'exec with string concatenation'
    },
    'exec_sync': {
        'pattern': r'execSync\s*\(\s*\w+',
        'severity': 'high',
        'message': 'execSync with variable argument'
    },
    'spawn_shell': {
        'pattern': r'spawn\s*\([^)]*shell\s*:\s*true',
        'severity': 'high',
        'message': 'spawn with shell: true'
    }
}

# Path traversal patterns
PATH_PATTERNS = {
    'path_join_user': {
        'pattern': r'path\.join\s*\([^,]+,\s*\w+(?:Input|Path|Name|File)',
        'severity': 'high',
        'message': 'path.join with user-controlled input'
    },
    'fs_user_path': {
        'pattern': r'fs\.(?:read|write|access|stat|unlink|rmdir|mkdir)\w*\s*\([^,)]*\+',
        'severity': 'high',
        'message': 'fs operation with concatenated path'
    },
    'direct_path_concat': {
        'pattern': r'(?:__dirname|process\.cwd\(\))\s*\+\s*[\'"]?/[\'"]?\s*\+',
        'severity': 'medium',
        'message': 'Path concatenation without validation'
    }
}

# SSRF patterns
SSRF_PATTERNS = {
    'fetch_user_url': {
        'pattern': r'fetch\s*\(\s*\w+(?:Url|URI|url|uri)\s*[,)]',
        'severity': 'high',
        'message': 'fetch with user-controlled URL'
    },
    'axios_user_url': {
        'pattern': r'axios\.(?:get|post|put|delete|patch)\s*\(\s*\w+(?:Url|url)',
        'severity': 'high',
        'message': 'axios with user-controlled URL'
    },
    'http_request_user': {
        'pattern': r'(?:http|https)\.(?:get|request)\s*\(\s*\w+',
        'severity': 'high',
        'message': 'HTTP request with user-controlled URL'
    }
}

# Safe patterns (mitigation)
SAFE_MITIGATION_PATTERNS = {
    'dompurify': r'DOMPurify\.sanitize',
    'parameterized': r'\$\d|:\w+|\?',
    'orm_where': r'\.(?:where|findFirst|findMany|findUnique)\s*\(\s*\{',
    'url_whitelist': r'allowedDomains|whitelist|allowedHosts',
    'url_hardcoded_base': r'=\s*`https?://[a-zA-Z0-9./-]+\$\{',
    'path_resolve_check': r'\.startsWith\s*\(\s*(?:baseDir|rootDir)',
    'spawn_array': r'spawn\s*\(\s*[\'"][^\'"]+[\'"]\s*,\s*\[',
}


def has_mitigation(code: str, vuln_type: str) -> bool:
    """Check if code has mitigation for vulnerability type."""
    if vuln_type == 'xss':
        return bool(re.search(SAFE_MITIGATION_PATTERNS['dompurify'], code))
    elif vuln_type == 'sql_injection':
        return bool(re.search(SAFE_MITIGATION_PATTERNS['parameterized'], code) or
                   re.search(SAFE_MITIGATION_PATTERNS['orm_where'], code))
    elif vuln_type == 'ssrf':
        return bool(re.search(SAFE_MITIGATION_PATTERNS['url_whitelist'], code) or
                   re.search(SAFE_MITIGATION_PATTERNS['url_hardcoded_base'], code))
    elif vuln_type == 'path_traversal':
        return bool(re.search(SAFE_MITIGATION_PATTERNS['path_resolve_check'], code))
    elif vuln_type == 'command_injection':
        return bool(re.search(SAFE_MITIGATION_PATTERNS['spawn_array'], code))
    return False


VULNERABILITY_TYPES = {
    'sql_injection': {'patterns': SQL_PATTERNS, 'flags': re.IGNORECASE},
    'xss': {'patterns': XSS_PATTERNS, 'flags': 0},
    'command_injection': {'patterns': COMMAND_PATTERNS, 'flags': 0},
    'path_traversal': {'patterns': PATH_PATTERNS, 'flags': 0},
    'ssrf': {'patterns': SSRF_PATTERNS, 'flags': 0},
}


def detect_vulnerabilities(code: str, vuln_type: str) -> List[Dict[str, Any]]:
    """Detect vulnerabilities of a given type in code."""
    type_config = VULNERABILITY_TYPES[vuln_type]
    vulnerabilities = []

    for name, config in type_config['patterns'].items():
        for match in re.finditer(config['pattern'], code, type_config['flags']):
            # For command injection, skip mitigated spawn_shell entirely
            if vuln_type == 'command_injection' and name == 'spawn_shell':
                if has_mitigation(code, 'command_injection'):
                    continue

            line_num = code[:match.start()].count('\n') + 1

            # Support inline nosec comments (industry standard, like bandit/gosec)
            line_start = code.rfind('\n', 0, match.start()) + 1
            line_end = code.find('\n', match.end())
            if line_end == -1:
                line_end = len(code)
            line_text = code[line_start:line_end]
            if '// nosec' in line_text or '/* nosec */' in line_text:
                continue

            severity = config['severity']

            # For XSS, check mitigation in surrounding context only
            if vuln_type == 'xss':
                context_start = max(0, match.start() - 200)
                context = code[context_start:match.end() + 100]
                if has_mitigation(context, 'xss'):
                    severity = 'low'
            elif has_mitigation(code, vuln_type):
                severity = 'low'

            vulnerabilities.append({
                'type': vuln_type,
                'subtype': name,
                'severity': severity,
                'line': line_num,
                'message': config['message'],
                'snippet': match.group(0)[:50]
            })

    return vulnerabilities


def scan_file(file_path: str) -> Dict[str, Any]:
    """Scan a single file for all injection types."""
    result = {
        'file': file_path,
        'vulnerabilities': [],
        'total_vulnerabilities': 0
    }

    try:
        content = Path(file_path).read_text()

        for vuln_type in VULNERABILITY_TYPES:
            result['vulnerabilities'].extend(
                detect_vulnerabilities(content, vuln_type)
            )

        result['total_vulnerabilities'] = len(result['vulnerabilities'])

    except Exception as e:
        result['error'] = str(e)

    return result


def scan_directory(
    directory: str,
    extensions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Scan entire directory for injection vulnerabilities."""
    if extensions is None:
        extensions = ['.ts', '.tsx', '.js', '.jsx']

    result = {
        'directory': directory,
        'files_scanned': 0,
        'total_vulnerabilities': 0,
        'vulnerabilities_by_type': {},
        'files_with_issues': []
    }

    dir_path = Path(directory)

    for file_path in dir_path.rglob('*'):
        if not file_path.is_file():
            continue

        # Skip node_modules and hidden
        if 'node_modules' in str(file_path) or '/.' in str(file_path):
            continue

        if file_path.suffix not in extensions:
            continue

        result['files_scanned'] += 1

        file_result = scan_file(str(file_path))
        if file_result['total_vulnerabilities'] > 0:
            result['total_vulnerabilities'] += file_result['total_vulnerabilities']
            result['files_with_issues'].append({
                'file': str(file_path.relative_to(dir_path)),
                'vulnerabilities': file_result['vulnerabilities']
            })

            # Count by type
            for vuln in file_result['vulnerabilities']:
                vtype = vuln['type']
                result['vulnerabilities_by_type'][vtype] = \
                    result['vulnerabilities_by_type'].get(vtype, 0) + 1

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python injection_detector.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]

    if os.path.isfile(target):
        result = scan_file(target)
    else:
        result = scan_directory(target)

    print(json.dumps(result, indent=2))

    # Exit with error if critical/high vulnerabilities found
    if os.path.isfile(target):
        vulns = result.get('vulnerabilities', [])
    else:
        vulns = []
        for f in result.get('files_with_issues', []):
            vulns.extend(f.get('vulnerabilities', []))

    critical_high = [v for v in vulns if v.get('severity') in ['critical', 'high']]
    if critical_high:
        sys.exit(1)


# Backward-compatible wrappers for tests that import individual detect functions
def _wrap_detect(vuln_type: str):
    def wrapper(code: str) -> Dict[str, Any]:
        vulns = detect_vulnerabilities(code, vuln_type)
        return {'vulnerabilities': vulns}
    return wrapper

detect_sql_injection = _wrap_detect('sql_injection')
detect_xss = _wrap_detect('xss')
detect_command_injection = _wrap_detect('command_injection')
detect_path_traversal = _wrap_detect('path_traversal')
detect_ssrf = _wrap_detect('ssrf')


def classify_severity(vuln_type: str, code_snippet: str) -> str:
    """Classify severity based on vulnerability type and code context."""
    high_patterns = {
        'xss': ['eval(', 'new Function('],
        'sql_injection': ['+', '${'],
        'command_injection': ['exec(', 'execSync('],
    }
    for pattern in high_patterns.get(vuln_type, []):
        if pattern in code_snippet:
            return 'high'
    return 'medium'


if __name__ == "__main__":
    main()
