#!/usr/bin/env python3
"""
REQ-TEAM-003 - ARIA Accessibility Checker

Validates accessibility attributes in React components for Bear Lake Camp.
Used by: react-frontend-specialist

Checks:
- Images have alt text
- Interactive elements have labels
- ARIA attributes are valid
- Semantic HTML usage
"""

import re
from pathlib import Path
from typing import Dict, List, Any


# Valid ARIA attributes
VALID_ARIA_ATTRIBUTES = {
    'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-details',
    'aria-hidden', 'aria-expanded', 'aria-selected', 'aria-checked',
    'aria-disabled', 'aria-readonly', 'aria-required', 'aria-invalid',
    'aria-current', 'aria-haspopup', 'aria-controls', 'aria-owns',
    'aria-live', 'aria-atomic', 'aria-busy', 'aria-relevant',
    'aria-pressed', 'aria-valuenow', 'aria-valuemin', 'aria-valuemax',
    'aria-valuetext', 'aria-orientation', 'aria-modal', 'aria-sort',
    'aria-colcount', 'aria-colindex', 'aria-colspan',
    'aria-rowcount', 'aria-rowindex', 'aria-rowspan',
    'aria-activedescendant', 'aria-autocomplete', 'aria-errormessage',
    'aria-flowto', 'aria-keyshortcuts', 'aria-level', 'aria-multiline',
    'aria-multiselectable', 'aria-placeholder', 'aria-posinset',
    'aria-roledescription', 'aria-setsize',
}

# Valid ARIA roles
VALID_ROLES = {
    'alert', 'alertdialog', 'application', 'article', 'banner',
    'button', 'cell', 'checkbox', 'columnheader', 'combobox',
    'complementary', 'contentinfo', 'definition', 'dialog', 'directory',
    'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group',
    'heading', 'img', 'link', 'list', 'listbox', 'listitem', 'log',
    'main', 'marquee', 'math', 'menu', 'menubar', 'menuitem',
    'menuitemcheckbox', 'menuitemradio', 'navigation', 'none', 'note',
    'option', 'presentation', 'progressbar', 'radio', 'radiogroup',
    'region', 'row', 'rowgroup', 'rowheader', 'scrollbar', 'search',
    'searchbox', 'separator', 'slider', 'spinbutton', 'status',
    'switch', 'tab', 'table', 'tablist', 'tabpanel', 'term', 'textbox',
    'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem',
}


def find_images_without_alt(content: str) -> List[Dict[str, Any]]:
    """Find <img> tags without alt attributes."""
    issues = []

    # Find img tags
    img_pattern = r'<img\s+([^>]*)/?>'
    for match in re.finditer(img_pattern, content, re.IGNORECASE | re.DOTALL):
        line_num = content[:match.start()].count('\n') + 1
        attrs = match.group(1)

        # Check for alt attribute
        has_alt = bool(re.search(r'\balt\s*=', attrs))

        if not has_alt:
            issues.append({
                'line': line_num,
                'type': 'missing_alt',
                'message': 'Image is missing alt attribute'
            })

    return issues


def find_buttons_without_labels(content: str) -> List[Dict[str, Any]]:
    """Find buttons/interactive elements without accessible labels."""
    issues = []

    # Find button tags - including self-closing and JSX with components inside
    button_pattern = r'<button\s+([^>]*)>([^<]*(?:<[^>]+>[^<]*)*)</button>'
    for match in re.finditer(button_pattern, content, re.IGNORECASE | re.DOTALL):
        line_num = content[:match.start()].count('\n') + 1
        attrs = match.group(1)
        inner_content = match.group(2).strip()

        # Check if button has accessible name
        has_aria_label = bool(re.search(r'aria-label\s*=', attrs))
        has_aria_labelledby = bool(re.search(r'aria-labelledby\s*=', attrs))
        # Has text if there's non-JSX text content
        plain_text = re.sub(r'<[^>]+>', '', inner_content).strip()
        has_text = bool(plain_text) and not plain_text.startswith('{')

        # If inner content is just a component (like <XIcon />), need label
        is_icon_only = bool(re.match(r'^\s*<\w+Icon[^>]*/>\s*$', inner_content, re.IGNORECASE))
        is_component_only = bool(re.match(r'^\s*<[A-Z]\w+[^>]*/>\s*$', inner_content))

        if not has_aria_label and not has_aria_labelledby and (not has_text or is_icon_only or is_component_only):
            issues.append({
                'line': line_num,
                'type': 'missing_button_label',
                'message': 'Button without accessible label (add aria-label or text content)'
            })

    # Find role="button" divs
    role_button_pattern = r'<div\s+([^>]*role\s*=\s*["\']button["\'][^>]*)>'
    for match in re.finditer(role_button_pattern, content, re.IGNORECASE):
        line_num = content[:match.start()].count('\n') + 1
        attrs = match.group(1)

        has_aria_label = bool(re.search(r'aria-label\s*=', attrs))
        has_tabindex = bool(re.search(r'tabIndex\s*=', attrs))

        if not has_aria_label:
            issues.append({
                'line': line_num,
                'type': 'missing_button_label',
                'message': 'Element with role="button" should have aria-label'
            })

        if not has_tabindex:
            issues.append({
                'line': line_num,
                'type': 'missing_tabindex',
                'message': 'Element with role="button" should have tabIndex={0}'
            })

    return issues


def find_invalid_aria(content: str) -> List[Dict[str, Any]]:
    """Find invalid ARIA attributes."""
    issues = []

    # Find all aria-* attributes
    aria_pattern = r'(aria-[\w-]+)\s*='
    for match in re.finditer(aria_pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        attr = match.group(1)

        if attr not in VALID_ARIA_ATTRIBUTES:
            issues.append({
                'line': line_num,
                'type': 'invalid_aria',
                'message': f"Invalid ARIA attribute: '{attr}'"
            })

    # Find role attributes and validate
    role_pattern = r'role\s*=\s*["\']([^"\']+)["\']'
    for match in re.finditer(role_pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        role = match.group(1)

        if role not in VALID_ROLES:
            issues.append({
                'line': line_num,
                'type': 'invalid_role',
                'message': f"Invalid ARIA role: '{role}'"
            })

    return issues


def find_missing_form_labels(content: str) -> List[Dict[str, Any]]:
    """Find form inputs without labels."""
    issues = []

    # Find input elements
    input_pattern = r'<input\s+([^>]*)/?>'
    for match in re.finditer(input_pattern, content, re.IGNORECASE):
        line_num = content[:match.start()].count('\n') + 1
        attrs = match.group(1)

        # Skip hidden inputs
        if 'type="hidden"' in attrs or "type='hidden'" in attrs:
            continue

        # Check for labeling
        has_id = bool(re.search(r'\bid\s*=', attrs))
        has_aria_label = bool(re.search(r'aria-label\s*=', attrs))
        has_aria_labelledby = bool(re.search(r'aria-labelledby\s*=', attrs))

        # Check if there's a label with matching htmlFor nearby
        # This is a simplified check - might miss some cases
        if not has_aria_label and not has_aria_labelledby:
            if has_id:
                input_id_match = re.search(r'id\s*=\s*["\']([^"\']+)["\']', attrs)
                if input_id_match:
                    input_id = input_id_match.group(1)
                    # Check if htmlFor={input_id} exists
                    label_for_pattern = rf'htmlFor\s*=\s*["\']?{re.escape(input_id)}["\']?'
                    if not re.search(label_for_pattern, content):
                        issues.append({
                            'line': line_num,
                            'type': 'missing_input_label',
                            'message': f"Input with id='{input_id}' has no associated label"
                        })
            else:
                issues.append({
                    'line': line_num,
                    'type': 'missing_input_label',
                    'message': 'Input without id, aria-label, or aria-labelledby'
                })

    return issues


def check_accessibility(file_path: str) -> Dict[str, Any]:
    """Check accessibility issues in a file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    # Run checks
    img_issues = find_images_without_alt(content)
    button_issues = find_buttons_without_labels(content)
    aria_issues = find_invalid_aria(content)
    form_issues = find_missing_form_labels(content)

    # Categorize issues
    for issue in img_issues:
        result['errors'].append(f"Line {issue['line']}: {issue['message']}")
        result['valid'] = False

    for issue in button_issues:
        if issue['type'] == 'missing_button_label':
            result['warnings'].append(f"Line {issue['line']}: {issue['message']}")
        else:
            result['errors'].append(f"Line {issue['line']}: {issue['message']}")
            result['valid'] = False

    for issue in aria_issues:
        result['errors'].append(f"Line {issue['line']}: {issue['message']}")
        result['valid'] = False

    for issue in form_issues:
        result['warnings'].append(f"Line {issue['line']}: {issue['message']}")

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python aria_checker.py <file_or_pattern>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = check_accessibility(target)
    else:
        # Treat as glob pattern
        result = {
            'valid': True,
            'files_checked': 0,
            'errors': [],
            'warnings': [],
        }
        for file_path in Path('.').glob(target):
            if file_path.is_file():
                file_result = check_accessibility(str(file_path))
                result['files_checked'] += 1
                if not file_result['valid']:
                    result['valid'] = False
                result['errors'].extend(f"{file_path}: {e}" for e in file_result['errors'])
                result['warnings'].extend(f"{file_path}: {w}" for w in file_result['warnings'])

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
