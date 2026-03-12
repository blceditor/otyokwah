#!/usr/bin/env python3
"""
Comment Extractor for Feedback Analyzer

Extracts user comments from markdown documents with surrounding context.

Supported formats:
- [TS- <feedback> ]
- [FEEDBACK- <feedback> ]

Context: 2 lines before, 8 lines after

Usage:
    python comment-extractor.py <markdown-file.md>

Output (JSON):
    {
      "file": "path/to/file.md",
      "total_comments": 5,
      "comments": [...]
    }
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Dict, Any


# Comment patterns to match
# Note: Handles both plain brackets [TS - ...] and escaped brackets \[TS \- ...\]
COMMENT_PATTERNS = [
    r'\\?\[TS\s*\\?-\s*(.*?)\\?\]',        # [TS - feedback ] or \[TS \- feedback \]
    r'\\?\[FEEDBACK\s*\\?-\s*(.*?)\\?\]',  # [FEEDBACK - feedback ] or \[FEEDBACK \- feedback \]
]

CONTEXT_BEFORE = 2  # Lines before comment
CONTEXT_AFTER = 8   # Lines after comment


def extract_comments(file_path: str) -> Dict[str, Any]:
    """
    Extract all comments from markdown file with context.

    Args:
        file_path: Path to markdown file

    Returns:
        Dict with file info and list of comments
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')
    comments = []

    # Search for comments line by line
    for line_num, line in enumerate(lines, start=1):
        for pattern in COMMENT_PATTERNS:
            matches = re.finditer(pattern, line)

            for match in matches:
                comment_text = match.group(1).strip()

                # Determine which pattern matched
                if 'TS' in pattern:
                    pattern_name = "[TS-"
                elif 'FEEDBACK' in pattern:
                    pattern_name = "[FEEDBACK-"
                else:
                    pattern_name = "unknown"

                # Extract context before (2 lines)
                start_line = max(0, line_num - 1 - CONTEXT_BEFORE)
                context_before = lines[start_line:line_num - 1]

                # Extract context after (8 lines)
                end_line = min(len(lines), line_num + CONTEXT_AFTER)
                context_after = lines[line_num:end_line]

                comments.append({
                    "line": line_num,
                    "pattern": pattern_name,
                    "text": comment_text,
                    "context_before": context_before,
                    "context_after": context_after,
                    "full_line": line.strip()
                })

    return {
        "file": file_path,
        "total_comments": len(comments),
        "comments": comments
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python comment-extractor.py <markdown-file.md>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]

    if not Path(file_path).exists():
        print(json.dumps({
            "error": f"File not found: {file_path}"
        }))
        sys.exit(1)

    try:
        result = extract_comments(file_path)
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
