#!/usr/bin/env python3
"""
REQ-TEAM-003 - Responsive Design Validator

Validates Tailwind CSS responsive patterns for Bear Lake Camp.
Used by: react-frontend-specialist

Checks:
- Mobile-first approach
- Breakpoint coverage
- Consistent breakpoint usage
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


# Tailwind breakpoints in order (mobile-first)
BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl']
BREAKPOINT_SIZES = {'sm': 640, 'md': 768, 'lg': 1024, 'xl': 1280, '2xl': 1536}


def extract_classes(content: str) -> List[Dict[str, Any]]:
    """Extract className attributes from JSX content."""
    classes_info = []

    # Find className="..." or className='...'
    pattern = r'className\s*=\s*["\']([^"\']+)["\']'
    for match in re.finditer(pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        classes = match.group(1).split()
        classes_info.append({
            'line': line_num,
            'classes': classes,
            'raw': match.group(1),
        })

    # Find className={`...`} template literals
    template_pattern = r'className\s*=\s*\{\s*`([^`]+)`\s*\}'
    for match in re.finditer(template_pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        raw = match.group(1)
        static_classes = re.sub(r'\$\{[^}]+\}', '', raw).split()
        classes_info.append({
            'line': line_num,
            'classes': static_classes,
            'raw': raw,
            'dynamic': True,
        })

    return classes_info


def analyze_responsive_pattern(classes: List[str]) -> Dict[str, Any]:
    """Analyze responsive pattern in a class list."""
    result = {
        'breakpoints_used': set(),
        'base_classes': [],
        'responsive_classes': {},
        'is_mobile_first': True,
    }

    for class_name in classes:
        # Check if class has breakpoint prefix
        has_breakpoint = False
        for bp in BREAKPOINTS:
            if class_name.startswith(f'{bp}:'):
                result['breakpoints_used'].add(bp)
                if bp not in result['responsive_classes']:
                    result['responsive_classes'][bp] = []
                result['responsive_classes'][bp].append(class_name)
                has_breakpoint = True
                break

        if not has_breakpoint:
            result['base_classes'].append(class_name)

    # Check for mobile-first violations
    # If there's no base class but there is a responsive variant, it might be desktop-first
    for base_class in result['base_classes']:
        # Extract the utility part (e.g., "grid-cols-3" from "grid-cols-3")
        utility = base_class

        # Check if this utility has smaller breakpoint variants
        # This is a simplified heuristic
        for bp in BREAKPOINTS:
            bp_variant = f'{bp}:{utility}'
            if bp_variant in classes:
                # If the base is a larger value and we're reducing at smaller breakpoints,
                # that's desktop-first (antipattern)
                pass  # Complex to detect accurately, leaving as is

    result['breakpoints_used'] = sorted(result['breakpoints_used'])
    return result


def validate_responsive(file_path: str) -> Dict[str, Any]:
    """Validate responsive design patterns in a file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'is_mobile_first': True,
        'breakpoints_used': set(),
        'total_classes': 0,
        'responsive_classes': 0,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    classes_info = extract_classes(content)

    for ci in classes_info:
        result['total_classes'] += len(ci['classes'])

        analysis = analyze_responsive_pattern(ci['classes'])
        result['breakpoints_used'].update(analysis['breakpoints_used'])

        for bp_classes in analysis['responsive_classes'].values():
            result['responsive_classes'] += len(bp_classes)

        # Check for desktop-first antipatterns
        # Example: grid-cols-3 sm:grid-cols-1 (starts with desktop, reduces for mobile)
        for class_name in ci['classes']:
            # Check for patterns like "grid-cols-3 sm:grid-cols-1"
            if not class_name.startswith(('sm:', 'md:', 'lg:', 'xl:', '2xl:')):
                # This is a base class
                # Check if there's a smaller value at a smaller breakpoint
                base_utility = class_name

                # Extract numeric suffix if present
                base_match = re.match(r'(.+-)(\d+)$', base_utility)
                if base_match:
                    base_prefix = base_match.group(1)
                    base_value = int(base_match.group(2))

                    for bp in BREAKPOINTS[:3]:  # sm, md, lg
                        for other_class in ci['classes']:
                            if other_class.startswith(f'{bp}:{base_prefix}'):
                                other_match = re.match(rf'{bp}:{base_prefix}(\d+)$', other_class)
                                if other_match:
                                    other_value = int(other_match.group(1))
                                    if other_value < base_value:
                                        result['warnings'].append(
                                            f"Line {ci['line']}: Possible desktop-first pattern detected. "
                                            f"Base '{base_utility}' reduces to '{other_class}' at smaller breakpoint. "
                                            "Consider mobile-first: start with smaller value, increase at larger breakpoints."
                                        )
                                        result['is_mobile_first'] = False

    result['breakpoints_used'] = sorted(result['breakpoints_used'])
    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python responsive_design_validator.py <file_or_directory>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = validate_responsive(target)
    else:
        # Validate directory
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'files_checked': 0,
            'breakpoints_used': set(),
        }
        for tsx_file in path.rglob('*.tsx'):
            file_result = validate_responsive(str(tsx_file))
            result['files_checked'] += 1
            result['breakpoints_used'].update(file_result['breakpoints_used'])
            if not file_result['valid']:
                result['valid'] = False
            result['errors'].extend(f"{tsx_file}: {e}" for e in file_result['errors'])
            result['warnings'].extend(f"{tsx_file}: {w}" for w in file_result['warnings'])

        result['breakpoints_used'] = sorted(result['breakpoints_used'])

    print(json.dumps(result, indent=2, default=list))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
