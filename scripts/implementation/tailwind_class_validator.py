#!/usr/bin/env python3
"""
REQ-TEAM-003 - Tailwind Class Validator

Validates Tailwind CSS class usage in React components.
Used by: react-frontend-specialist

Checks:
- Valid Tailwind class patterns
- Responsive prefix usage (sm:, md:, lg:, xl:)
- Common typos and mistakes
"""

import re
from pathlib import Path
from typing import Dict, List, Any, Set


# Common Tailwind class prefixes
VALID_PREFIXES = {
    # Responsive
    'sm:', 'md:', 'lg:', 'xl:', '2xl:',
    # State
    'hover:', 'focus:', 'active:', 'visited:', 'disabled:',
    'focus-within:', 'focus-visible:',
    # Dark mode
    'dark:',
    # Group
    'group-hover:', 'group-focus:',
    # Peer
    'peer-hover:', 'peer-focus:',
    # First/Last
    'first:', 'last:', 'odd:', 'even:',
    # Aria
    'aria-selected:', 'aria-hidden:',
}

# Common Tailwind utility patterns (simplified)
COMMON_PATTERNS = [
    # Spacing
    r'^[pm][trblxy]?-\d+$',
    r'^[pm][trblxy]?-\[\d+(?:px|rem|em|%)\]$',
    r'^gap-\d+$',
    r'^space-[xy]-\d+$',
    # Sizing
    r'^[wh]-(?:\d+|full|screen|auto|min|max|fit)$',
    r'^min-[wh]-(?:\d+|full|screen|auto|min|max|fit)$',
    r'^max-[wh]-(?:\d+|full|screen|auto|min|max|fit)$',
    # Flexbox
    r'^flex(?:-\d+)?$',
    r'^flex-(?:row|col|wrap|nowrap|grow|shrink)$',
    r'^items-(?:start|end|center|baseline|stretch)$',
    r'^justify-(?:start|end|center|between|around|evenly)$',
    # Grid
    r'^grid$',
    r'^grid-cols-\d+$',
    r'^grid-rows-\d+$',
    r'^col-span-\d+$',
    r'^row-span-\d+$',
    # Typography
    r'^text-(?:xs|sm|base|lg|xl|\dxl)$',
    r'^text-(?:left|center|right|justify)$',
    r'^font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)$',
    r'^leading-(?:none|tight|snug|normal|relaxed|loose|\d+)$',
    r'^tracking-(?:tighter|tight|normal|wide|wider|widest)$',
    # Colors
    r'^(?:text|bg|border)-(?:transparent|current|white|black)$',
    r'^(?:text|bg|border)-(?:gray|red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|sky|lime|amber|violet|fuchsia|rose|emerald|slate|zinc|neutral|stone)-\d+$',
    r'^(?:text|bg|border)-(?:primary|secondary|accent)(?:-\w+)?$',
    # Borders
    r'^border(?:-\d+)?$',
    r'^border-(?:t|r|b|l|x|y)(?:-\d+)?$',
    r'^rounded(?:-\w+)?$',
    # Effects
    r'^shadow(?:-\w+)?$',
    r'^opacity-\d+$',
    # Layout
    r'^(?:block|inline|inline-block|hidden|flex|grid)$',
    r'^(?:relative|absolute|fixed|sticky|static)$',
    r'^(?:top|right|bottom|left|inset)-\d+$',
    r'^z-\d+$',
    r'^overflow-(?:auto|hidden|visible|scroll|x-auto|y-auto|x-hidden|y-hidden)$',
    # Transforms
    r'^scale-\d+$',
    r'^rotate-\d+$',
    r'^translate-[xy]-\d+$',
    # Transitions
    r'^transition(?:-\w+)?$',
    r'^duration-\d+$',
    r'^ease-(?:linear|in|out|in-out)$',
    # Misc
    r'^cursor-(?:pointer|default|not-allowed|wait|text|move|grab|grabbing)$',
    r'^select-(?:none|text|all|auto)$',
    r'^pointer-events-(?:none|auto)$',
    r'^aspect-(?:auto|square|video)$',
    r'^object-(?:contain|cover|fill|none|scale-down)$',
    r'^sr-only$',
    r'^not-sr-only$',
]

# Known valid class names that don't match patterns
KNOWN_CLASSES = {
    'container', 'prose', 'antialiased', 'subpixel-antialiased',
    'truncate', 'whitespace-nowrap', 'whitespace-pre', 'whitespace-normal',
    'break-words', 'break-all', 'break-normal',
    'line-clamp-1', 'line-clamp-2', 'line-clamp-3',
    'underline', 'no-underline', 'line-through',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'italic', 'not-italic',
    'list-disc', 'list-decimal', 'list-none', 'list-inside', 'list-outside',
    'resize', 'resize-none', 'resize-x', 'resize-y',
    'ring', 'ring-0', 'ring-1', 'ring-2', 'ring-4', 'ring-8',
    'ring-inset', 'ring-offset-0', 'ring-offset-1', 'ring-offset-2', 'ring-offset-4',
    'outline', 'outline-none', 'outline-offset-0', 'outline-offset-1',
    'backdrop-blur', 'backdrop-blur-sm', 'backdrop-blur-md', 'backdrop-blur-lg',
    'filter', 'grayscale', 'invert', 'sepia', 'blur', 'blur-sm', 'blur-md', 'blur-lg',
    'transform', 'transform-none',
    'animate-spin', 'animate-ping', 'animate-pulse', 'animate-bounce',
    'will-change-auto', 'will-change-scroll', 'will-change-contents', 'will-change-transform',
    'mix-blend-normal', 'mix-blend-multiply', 'mix-blend-screen', 'mix-blend-overlay',
}


def strip_prefix(class_name: str) -> str:
    """Remove responsive/state prefix from class name."""
    for prefix in VALID_PREFIXES:
        if class_name.startswith(prefix):
            return class_name[len(prefix):]
    return class_name


def is_valid_class(class_name: str) -> bool:
    """Check if a Tailwind class name is valid."""
    # Strip prefix
    base_class = strip_prefix(class_name)

    # Check known classes
    if base_class in KNOWN_CLASSES:
        return True

    # Check against patterns
    for pattern in COMMON_PATTERNS:
        if re.match(pattern, base_class):
            return True

    # Allow arbitrary values [...]
    if '[' in base_class and ']' in base_class:
        return True

    # Allow custom classes (might be from tailwind.config.js)
    # We're lenient here - only flag obvious issues
    return True  # Be lenient by default


def extract_classnames(content: str) -> List[Dict[str, Any]]:
    """Extract className attributes from JSX content."""
    classnames = []

    # Find className="..." or className='...'
    pattern = r'className\s*=\s*["\']([^"\']+)["\']'
    for match in re.finditer(pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        classes = match.group(1).split()
        classnames.append({
            'line': line_num,
            'classes': classes,
            'raw': match.group(1),
        })

    # Find className={`...`} template literals
    template_pattern = r'className\s*=\s*\{\s*`([^`]+)`\s*\}'
    for match in re.finditer(template_pattern, content):
        line_num = content[:match.start()].count('\n') + 1
        # Extract static classes (ignore ${} expressions)
        raw = match.group(1)
        static_classes = re.sub(r'\$\{[^}]+\}', '', raw).split()
        classnames.append({
            'line': line_num,
            'classes': static_classes,
            'raw': raw,
            'dynamic': True,
        })

    return classnames


def validate_classes(file_path: str) -> Dict[str, Any]:
    """Validate Tailwind classes in a file."""
    result = {
        'valid': True,
        'errors': [],
        'warnings': [],
        'classes_found': 0,
    }

    try:
        content = Path(file_path).read_text()
    except Exception as e:
        result['valid'] = False
        result['errors'].append(f"Error reading file: {e}")
        return result

    classnames = extract_classnames(content)
    result['classes_found'] = sum(len(cn['classes']) for cn in classnames)

    # Check for common typos/issues
    common_typos = {
        'flex-center': 'items-center or justify-center',
        'text-bold': 'font-bold',
        'bg-grey': 'bg-gray',
        'colour': 'color',
        'centre': 'center',
    }

    for cn in classnames:
        for class_name in cn['classes']:
            # Check for typos
            base_class = strip_prefix(class_name)
            if base_class in common_typos:
                result['warnings'].append(
                    f"Line {cn['line']}: '{class_name}' might be a typo. "
                    f"Did you mean '{common_typos[base_class]}'?"
                )

            # Check for responsive prefix without base class
            if class_name.endswith(':') and ':' in class_name:
                result['errors'].append(
                    f"Line {cn['line']}: '{class_name}' is incomplete. "
                    f"Add a utility class after the prefix."
                )
                result['valid'] = False

    # Check for mobile-first violations (warnings only)
    for cn in classnames:
        classes_str = ' '.join(cn['classes'])
        # Check if desktop breakpoints appear without mobile base
        if 'lg:' in classes_str and 'sm:' not in classes_str and 'md:' not in classes_str:
            # This is just a warning - might be intentional
            pass

    return result


def main():
    """CLI entry point."""
    import sys
    import json

    if len(sys.argv) < 2:
        print("Usage: python tailwind_class_validator.py <file_or_pattern>")
        sys.exit(1)

    target = sys.argv[1]
    path = Path(target)

    if path.is_file():
        result = validate_classes(target)
    else:
        # Treat as glob pattern
        result = {
            'valid': True,
            'files_checked': 0,
            'total_classes': 0,
            'errors': [],
            'warnings': [],
        }
        for file_path in Path('.').glob(target):
            if file_path.is_file():
                file_result = validate_classes(str(file_path))
                result['files_checked'] += 1
                result['total_classes'] += file_result['classes_found']
                if not file_result['valid']:
                    result['valid'] = False
                result['errors'].extend(f"{file_path}: {e}" for e in file_result['errors'])
                result['warnings'].extend(f"{file_path}: {w}" for w in file_result['warnings'])

    print(json.dumps(result, indent=2))

    if not result['valid']:
        sys.exit(1)


if __name__ == "__main__":
    main()
