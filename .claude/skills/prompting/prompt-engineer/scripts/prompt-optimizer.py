#!/usr/bin/env python3
"""
Prompt Optimizer

Automatically optimizes prompts for token efficiency while preserving clarity.

Usage:
    python prompt-optimizer.py <prompt-file.txt> [--output optimized.txt]

Optimizations:
    - Verbose phrase replacement
    - Redundant instruction removal
    - Example consolidation suggestions
    - Progressive disclosure recommendations
"""

import json
import re
import sys
from pathlib import Path
from typing import List, Tuple

# Import token counter if available
try:
    from pathlib import Path
    import sys
    sys.path.append(str(Path(__file__).parent))
    from token_counter import count_tokens
except:
    def count_tokens(text: str) -> int:
        return len(text) // 4  # Fallback estimate


# Verbose phrase replacements
VERBOSE_REPLACEMENTS = {
    "for example": "e.g.",
    "for instance": "e.g.",
    "in order to": "to",
    "as well as": "and",
    "due to the fact that": "because",
    "at this point in time": "now",
    "in the event that": "if",
    "please make sure": "ensure",
    "it is important to note": "note",
    "in addition to": "plus",
    "with regard to": "about",
    "in spite of": "despite",
    "prior to": "before",
    "subsequent to": "after",
}


def apply_verbose_replacements(text: str) -> Tuple[str, List[str]]:
    """Replace verbose phrases with concise equivalents"""
    changes = []
    optimized = text

    for verbose, concise in VERBOSE_REPLACEMENTS.items():
        pattern = re.compile(re.escape(verbose), re.IGNORECASE)
        matches = pattern.findall(optimized)

        if matches:
            count = len(matches)
            optimized = pattern.sub(concise, optimized)
            tokens_saved = count * ((len(verbose) - len(concise)) // 4)
            changes.append(
                f"Replaced '{verbose}' with '{concise}' ({count}x, ~{tokens_saved} tokens saved)"
            )

    return optimized, changes


def remove_redundant_bullets(text: str) -> Tuple[str, List[str]]:
    """Consolidate redundant bullet points"""
    changes = []
    lines = text.split('\n')
    optimized_lines = []

    # Track similar bullets for consolidation
    i = 0
    while i < len(lines):
        line = lines[i]

        # Check if this is a bullet point
        if line.strip().startswith('-'):
            # Look ahead for similar bullets
            similar = [line]
            j = i + 1

            while j < len(lines) and lines[j].strip().startswith('-'):
                # Simple similarity check (same first 3 words)
                words_current = line.strip('- ').split()[:3]
                words_next = lines[j].strip('- ').split()[:3]

                if words_current == words_next:
                    similar.append(lines[j])
                    j += 1
                else:
                    break

            if len(similar) > 1:
                # Consolidate similar bullets
                optimized_lines.append(similar[0])  # Keep first one
                changes.append(
                    f"Consolidated {len(similar)} similar bullet points into 1 "
                    f"(~{len(similar) * 10} tokens saved)"
                )
                i = j
            else:
                optimized_lines.append(line)
                i += 1
        else:
            optimized_lines.append(line)
            i += 1

    return '\n'.join(optimized_lines), changes


def suggest_progressive_disclosure(text: str) -> List[str]:
    """Suggest sections that could use progressive disclosure"""
    suggestions = []
    lines = text.split('\n')

    # Find long sections (>30 lines between headings)
    section_start = 0
    current_section = []

    for i, line in enumerate(lines):
        if line.startswith('#'):  # Heading detected
            if len(current_section) > 30:
                suggestions.append(
                    f"Section starting at line {section_start} has {len(current_section)} lines - "
                    f"consider moving to references/ (potential ~{len(current_section) * 8} tokens saved)"
                )
            section_start = i
            current_section = []
        else:
            current_section.append(line)

    return suggestions


def consolidate_examples(text: str) -> Tuple[str, List[str]]:
    """Suggest example consolidation"""
    changes = []

    # Count explicit examples
    example_count = len(re.findall(r'Example \d+:', text, re.IGNORECASE))

    if example_count > 2:
        changes.append(
            f"Detected {example_count} numbered examples - "
            f"consider consolidating to 1-2 representative examples "
            f"(potential ~{(example_count - 2) * 100} tokens saved)"
        )

    return text, changes


def optimize_prompt(text: str) -> Tuple[str, dict]:
    """Apply all optimizations and return results"""

    original_tokens = count_tokens(text)
    optimized = text
    all_changes = []

    # Apply optimizations
    optimized, changes1 = apply_verbose_replacements(optimized)
    all_changes.extend(changes1)

    optimized, changes2 = remove_redundant_bullets(optimized)
    all_changes.extend(changes2)

    _, changes3 = consolidate_examples(optimized)
    all_changes.extend(changes3)

    # Suggestions (don't modify text)
    suggestions = suggest_progressive_disclosure(optimized)

    # Calculate savings
    optimized_tokens = count_tokens(optimized)
    tokens_saved = original_tokens - optimized_tokens
    savings_pct = (tokens_saved / original_tokens * 100) if original_tokens > 0 else 0

    result = {
        "original_tokens": original_tokens,
        "optimized_tokens": optimized_tokens,
        "savings": tokens_saved,
        "savings_pct": round(savings_pct, 1),
        "changes": all_changes,
        "suggestions": suggestions
    }

    return optimized, result


def main():
    if len(sys.argv) < 2:
        print("Usage: python prompt-optimizer.py <prompt-file.txt> [--output optimized.txt]", file=sys.stderr)
        sys.exit(1)

    prompt_file = sys.argv[1]
    output_file = None

    # Check for --output flag
    if len(sys.argv) > 2 and sys.argv[2] == '--output':
        output_file = sys.argv[3] if len(sys.argv) > 3 else 'optimized.txt'

    if not Path(prompt_file).exists():
        print(json.dumps({
            "error": f"File not found: {prompt_file}"
        }))
        sys.exit(1)

    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt = f.read()

        optimized, result = optimize_prompt(prompt)

        # Output results as JSON
        print(json.dumps(result, indent=2))

        # Write optimized prompt to file if requested
        if output_file:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(optimized)
            print(f"\nOptimized prompt written to: {output_file}", file=sys.stderr)

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
