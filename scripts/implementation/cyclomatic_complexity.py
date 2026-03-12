#!/usr/bin/env python3
"""
REQ-TEAM-004 - Cyclomatic Complexity Analyzer

Analyzes TypeScript/JavaScript code for cyclomatic complexity.
Used by: pe-reviewer.md § Function Best Practices

Complexity Rules:
- Base complexity: 1
- +1 for: if, else if, case, for, while, do-while, catch, &&, ||, ?:
"""

import re
import os
from pathlib import Path
from typing import Dict, List, Any, Optional


# Patterns that increase complexity
COMPLEXITY_PATTERNS = {
    'if': r'\bif\s*\(',
    'else_if': r'\belse\s+if\s*\(',
    'case': r'\bcase\s+[^:]+:',
    'for': r'\bfor\s*\(',
    'for_of': r'\bfor\s+(?:const|let|var)\s+\w+\s+of\s+',
    'for_in': r'\bfor\s+(?:const|let|var)\s+\w+\s+in\s+',
    'while': r'\bwhile\s*\(',
    'do_while': r'\bdo\s*\{',
    'catch': r'\bcatch\s*\(',
    'and': r'&&',
    'or': r'\|\|',
    'ternary': r'\?[^?:]+:',
    'nullish_coalesce': r'\?\?',
}

# Function patterns
FUNCTION_PATTERNS = [
    r'function\s+(\w+)\s*\([^)]*\)\s*\{',
    r'const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{',
    r'const\s+(\w+)\s*=\s*(?:async\s+)?function\s*\([^)]*\)\s*\{',
    r'(\w+)\s*:\s*(?:async\s+)?\([^)]*\)\s*=>\s*\{',
    r'(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{',
    r'export\s+(?:default\s+)?(?:async\s+)?function\s+(\w+)',
]


def extract_function_body(code: str, start_pos: int) -> str:
    """Extract function body by matching braces."""
    brace_count = 0
    in_string = False
    string_char = None
    body_start = None

    i = start_pos
    while i < len(code):
        char = code[i]

        # Handle strings
        if char in '"\'`' and (i == 0 or code[i-1] != '\\'):
            if not in_string:
                in_string = True
                string_char = char
            elif char == string_char:
                in_string = False
                string_char = None
            i += 1
            continue

        if in_string:
            i += 1
            continue

        if char == '{':
            if body_start is None:
                body_start = i
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0 and body_start is not None:
                return code[body_start:i+1]

        i += 1

    return code[body_start:] if body_start else ""


def calculate_complexity(code: str, language: str = "typescript") -> Dict[str, Any]:
    """Calculate cyclomatic complexity for all functions in code."""
    result = {
        'functions': [],
        'total_complexity': 0
    }

    # Find all functions
    for pattern in FUNCTION_PATTERNS:
        for match in re.finditer(pattern, code, re.MULTILINE):
            func_name = match.group(1) if match.lastindex else "anonymous"
            start_pos = match.start()

            # Extract function body
            body = extract_function_body(code, start_pos)
            if not body:
                continue

            # Calculate complexity
            complexity = 1  # Base complexity

            for name, regex in COMPLEXITY_PATTERNS.items():
                matches = re.findall(regex, body)
                complexity += len(matches)

            # Check if already added (avoid duplicates)
            if any(f['name'] == func_name and f['line'] == code[:start_pos].count('\n') + 1
                   for f in result['functions']):
                continue

            func_info = {
                'name': func_name,
                'complexity': complexity,
                'line': code[:start_pos].count('\n') + 1,
                'warning': complexity > 10,
                'classification': classify_complexity(complexity)
            }
            result['functions'].append(func_info)
            result['total_complexity'] += complexity

    return result


def classify_complexity(complexity: int) -> str:
    """Classify complexity level."""
    if complexity <= 5:
        return 'low'
    elif complexity <= 10:
        return 'moderate'
    elif complexity <= 20:
        return 'high'
    else:
        return 'very_high'


def analyze_file(file_path: str) -> Dict[str, Any]:
    """Analyze a single file for cyclomatic complexity."""
    result = {
        'file': file_path,
        'functions': [],
        'total_complexity': 0,
        'average_complexity': 0,
        'high_complexity_functions': []
    }

    try:
        content = Path(file_path).read_text()
        analysis = calculate_complexity(content)

        result['functions'] = analysis['functions']
        result['total_complexity'] = analysis['total_complexity']

        if analysis['functions']:
            result['average_complexity'] = round(
                analysis['total_complexity'] / len(analysis['functions']), 2
            )

        result['high_complexity_functions'] = [
            f for f in analysis['functions'] if f['complexity'] > 10
        ]

    except Exception as e:
        result['error'] = str(e)

    return result


def analyze_directory(
    directory: str,
    extensions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Analyze all files in a directory."""
    if extensions is None:
        extensions = ['.ts', '.tsx', '.js', '.jsx']

    result = {
        'directory': directory,
        'files': [],
        'total_functions': 0,
        'total_complexity': 0,
        'average_complexity': 0,
        'high_complexity_functions': []
    }

    dir_path = Path(directory)

    for ext in extensions:
        for file_path in dir_path.rglob(f'*{ext}'):
            # Skip node_modules and hidden directories
            if 'node_modules' in str(file_path) or '/.' in str(file_path):
                continue

            file_result = analyze_file(str(file_path))
            if 'error' not in file_result:
                result['files'].append({
                    'path': str(file_path.relative_to(dir_path)),
                    'functions': len(file_result['functions']),
                    'complexity': file_result['total_complexity'],
                    'average': file_result['average_complexity']
                })

                result['total_functions'] += len(file_result['functions'])
                result['total_complexity'] += file_result['total_complexity']
                result['high_complexity_functions'].extend([
                    {**f, 'file': str(file_path.relative_to(dir_path))}
                    for f in file_result['high_complexity_functions']
                ])

    if result['total_functions'] > 0:
        result['average_complexity'] = round(
            result['total_complexity'] / result['total_functions'], 2
        )

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python cyclomatic_complexity.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]

    if os.path.isfile(target):
        result = analyze_file(target)
    else:
        result = analyze_directory(target)

    print(json.dumps(result, indent=2))

    # Exit with error if high complexity found
    if result.get('high_complexity_functions'):
        sys.exit(1)


if __name__ == "__main__":
    main()
