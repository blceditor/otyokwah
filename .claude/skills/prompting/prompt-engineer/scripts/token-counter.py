#!/usr/bin/env python3
"""
Token Counter for Claude Prompts

Counts tokens using tiktoken and estimates costs for Claude Sonnet 4.5.

Usage:
    python token-counter.py <prompt-file.txt>

Output (JSON):
    {
      "tokens": 1523,
      "cost_1m_input": 0.00457,
      "cost_1m_output": 0.01523,
      "model": "claude-sonnet-4-5",
      "suggestions": [...]
    }
"""

import json
import sys
from pathlib import Path

try:
    import tiktoken
except ImportError:
    print("Error: tiktoken not installed. Run: pip install tiktoken", file=sys.stderr)
    sys.exit(1)


# Claude Sonnet 4.5 pricing (as of 2025)
PRICING = {
    "claude-sonnet-4-5": {
        "input_per_1m": 3.00,   # $3.00 per 1M input tokens
        "output_per_1m": 15.00  # $15.00 per 1M output tokens
    }
}


def count_tokens(text: str, model: str = "claude-3-5-sonnet-20241022") -> int:
    """
    Count tokens using tiktoken.

    Note: Claude uses a similar tokenizer to GPT-4, so we use cl100k_base encoding.
    """
    try:
        enc = tiktoken.get_encoding("cl100k_base")
        return len(enc.encode(text))
    except Exception as e:
        # Fallback: rough estimate (1 token ≈ 4 characters)
        return len(text) // 4


def analyze_prompt(prompt: str) -> dict:
    """Analyze prompt and provide token count + optimization suggestions"""

    tokens = count_tokens(prompt)
    model = "claude-sonnet-4-5"

    # Calculate costs
    cost_input = (tokens / 1_000_000) * PRICING[model]["input_per_1m"]
    cost_output = (tokens / 1_000_000) * PRICING[model]["output_per_1m"]

    # Generate suggestions
    suggestions = []

    # Check for verbose phrases
    verbose_phrases = {
        "for example": "e.g.",
        "for instance": "e.g.",
        "in order to": "to",
        "as well as": "and",
        "due to the fact that": "because",
        "at this point in time": "now",
        "in the event that": "if",
        "please make sure": "ensure",
        "it is important to note": "note",
    }

    for verbose, concise in verbose_phrases.items():
        if verbose in prompt.lower():
            count = prompt.lower().count(verbose)
            savings = count * (len(verbose) - len(concise)) // 4  # Rough token estimate
            suggestions.append(
                f"Replace '{verbose}' with '{concise}' ({count} occurrences, ~{savings} tokens saved)"
            )

    # Check for long sections (candidates for progressive disclosure)
    lines = prompt.split('\n')
    if len(lines) > 50:
        suggestions.append(
            f"Consider progressive disclosure: {len(lines)} lines detected, "
            f"move detailed sections to references/ (potential ~{tokens // 3} tokens saved)"
        )

    # Check for redundant examples
    example_count = prompt.lower().count("example")
    if example_count > 3:
        suggestions.append(
            f"Consolidate examples: {example_count} examples detected, "
            f"consider using 1-2 representative examples (potential ~{example_count * 50} tokens saved)"
        )

    # Check for redundant instructions
    redundant_patterns = [
        ("read", "analyze", "examine"),
        ("carefully", "thoroughly", "in detail"),
        ("ensure", "make sure", "verify"),
    ]

    for pattern in redundant_patterns:
        found = [word for word in pattern if word in prompt.lower()]
        if len(found) > 1:
            suggestions.append(
                f"Consolidate redundant instructions: {', '.join(found)} - "
                f"use one term consistently (~{len(found) * 5} tokens saved)"
            )

    return {
        "tokens": tokens,
        "cost_1m_input": round(cost_input, 5),
        "cost_1m_output": round(cost_output, 5),
        "model": model,
        "suggestions": suggestions,
        "breakdown": {
            "total": tokens,
            "avg_per_line": tokens // max(len(lines), 1)
        }
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: python token-counter.py <prompt-file.txt>", file=sys.stderr)
        sys.exit(1)

    prompt_file = sys.argv[1]

    if not Path(prompt_file).exists():
        print(json.dumps({
            "error": f"File not found: {prompt_file}"
        }))
        sys.exit(1)

    try:
        with open(prompt_file, 'r', encoding='utf-8') as f:
            prompt = f.read()

        result = analyze_prompt(prompt)
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
