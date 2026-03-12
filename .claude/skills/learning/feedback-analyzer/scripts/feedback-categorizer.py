#!/usr/bin/env python3
"""
Feedback Categorizer

Auto-categorizes extracted comments by domain, type, and priority.

Usage:
    python feedback-categorizer.py <extracted-comments.json>

Output (JSON):
    {
      "categorized_comments": [
        {
          "line": 42,
          "text": "...",
          "domain": "research",
          "type": "improvement",
          "priority": "medium",
          "suggested_agent": "researcher"
        }
      ]
    }
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any


# Domain detection keywords
DOMAIN_KEYWORDS = {
    "research": ["search", "sources", "tier", "trust score", "validation", "research", "finding", "discovery"],
    "architecture": ["RAG", "RLHF", "LLM-Twin", "system design", "architecture", "schema", "database", "API"],
    "planning": ["story points", "estimation", "planning", "requirements", "REQ-", "scope", "timeline"],
    "quality": ["complexity", "refactor", "code review", "PE", "best practices", "clean code", "maintainability"],
    "security": ["RLS", "auth", "injection", "vulnerability", "security", "permission", "credential"],
    "testing": ["test", "coverage", "assertion", "spec", "integration", "e2e", "unit test"],
    "business": ["PRD", "PRFAQ", "tenets", "buy vs build", "PMF", "customer", "market", "business"],
    "prompting": ["token", "prompt", "optimization", "efficiency", "context", "instruction"],
    "content": ["LinkedIn", "Twitter", "Email", "platform", "tone", "voice", "persona"]
}

# Agent suggestions per domain
DOMAIN_AGENTS = {
    "research": "researcher",
    "architecture": "llm-systems-architect",
    "planning": "planner",
    "quality": "pe-reviewer",
    "security": "security-reviewer",
    "testing": "test-writer",
    "business": "cos",
    "prompting": "prompt-engineer",
    "content": "content-transformation-specialist"
}

# Type detection patterns
TYPE_PATTERNS = {
    "improvement": ["missing", "should add", "needs", "lacks", "improve", "enhance", "better"],
    "learning": ["great find", "validates", "important", "remember", "apply", "good", "excellent"],
    "correction": ["wrong", "incorrect", "doesn't apply", "skip", "remove", "fix", "error"],
    "question": ["?", "what about", "how do we", "why", "unclear", "confused"],
    "issue": ["problem", "bug", "broken", "fails", "error", "doesn't work"],
    "suggestion": ["consider", "maybe", "could", "recommend", "perhaps", "might"]
}

# Priority detection patterns
PRIORITY_PATTERNS = {
    "high": ["must", "critical", "required", "important", "ASAP", "blocker", "urgent"],
    "medium": ["should", "consider", "recommend", "nice to have", "helpful"],
    "low": ["maybe", "eventually", "future", "optional", "someday"]
}


def detect_domain(text: str, context: List[str]) -> str:
    """Detect domain based on keyword matching"""
    # Combine comment text with context for better detection
    full_text = (text + " " + " ".join(context)).lower()

    scores = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword.lower() in full_text)
        scores[domain] = score

    # Return domain with highest score, or "general" if no matches
    max_score = max(scores.values())
    if max_score == 0:
        return "general"

    return max(scores, key=scores.get)


def detect_type(text: str) -> str:
    """Detect feedback type based on pattern matching"""
    text_lower = text.lower()

    scores = {}
    for type_name, patterns in TYPE_PATTERNS.items():
        score = sum(1 for pattern in patterns if pattern.lower() in text_lower)
        scores[type_name] = score

    # Return type with highest score, or "general" if no matches
    max_score = max(scores.values())
    if max_score == 0:
        return "general"

    return max(scores, key=scores.get)


def detect_priority(text: str) -> str:
    """Detect priority based on keyword matching"""
    text_lower = text.lower()

    # Check high priority first (most important)
    for pattern in PRIORITY_PATTERNS["high"]:
        if pattern.lower() in text_lower:
            return "high"

    # Check medium priority
    for pattern in PRIORITY_PATTERNS["medium"]:
        if pattern.lower() in text_lower:
            return "medium"

    # Check low priority
    for pattern in PRIORITY_PATTERNS["low"]:
        if pattern.lower() in text_lower:
            return "low"

    # Default to medium if no patterns match
    return "medium"


def extract_action(text: str, comment_type: str) -> str:
    """Extract suggested action from feedback"""
    text_lower = text.lower()

    # Type-specific action extraction
    if comment_type == "improvement":
        if "add" in text_lower:
            return "add_feature"
        elif "improve" in text_lower or "enhance" in text_lower:
            return "improve_existing"
        else:
            return "enhance"

    elif comment_type == "learning":
        if "reference" in text_lower or "cite" in text_lower:
            return "reference_in_future"
        elif "apply" in text_lower:
            return "apply_pattern"
        else:
            return "document_learning"

    elif comment_type == "correction":
        if "skip" in text_lower or "remove" in text_lower:
            return "skip"
        elif "fix" in text_lower:
            return "fix_issue"
        else:
            return "correct"

    elif comment_type == "question":
        return "clarify"

    elif comment_type == "issue":
        return "fix_issue"

    else:
        return "review"


def categorize_comments(extracted_data: Dict[str, Any]) -> Dict[str, Any]:
    """Categorize all extracted comments"""
    categorized = []

    for comment in extracted_data.get("comments", []):
        text = comment["text"]
        context = comment.get("context_before", []) + comment.get("context_after", [])

        # Detect domain, type, priority
        domain = detect_domain(text, context)
        comment_type = detect_type(text)
        priority = detect_priority(text)
        action = extract_action(text, comment_type)

        categorized.append({
            "line": comment["line"],
            "pattern": comment.get("pattern", "unknown"),
            "text": text,
            "context_before": comment.get("context_before", []),
            "context_after": comment.get("context_after", []),
            "full_line": comment.get("full_line", ""),
            "domain": domain,
            "type": comment_type,
            "priority": priority,
            "suggested_agent": DOMAIN_AGENTS.get(domain, "general-purpose"),
            "action": action
        })

    return {
        "source_file": extracted_data.get("file", "unknown"),
        "total_comments": len(categorized),
        "categorized_comments": categorized,
        "summary": {
            "by_domain": _count_by_field(categorized, "domain"),
            "by_type": _count_by_field(categorized, "type"),
            "by_priority": _count_by_field(categorized, "priority")
        }
    }


def _count_by_field(comments: List[Dict], field: str) -> Dict[str, int]:
    """Count comments by a specific field"""
    counts = {}
    for comment in comments:
        value = comment.get(field, "unknown")
        counts[value] = counts.get(value, 0) + 1
    return counts


def main():
    if len(sys.argv) < 2:
        print("Usage: python feedback-categorizer.py <extracted-comments.json>", file=sys.stderr)
        sys.exit(1)

    input_file = sys.argv[1]

    if not Path(input_file).exists():
        print(json.dumps({
            "error": f"File not found: {input_file}"
        }))
        sys.exit(1)

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            extracted_data = json.load(f)

        result = categorize_comments(extracted_data)
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
