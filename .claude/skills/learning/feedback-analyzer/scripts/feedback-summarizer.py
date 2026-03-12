#!/usr/bin/env python3
"""
Feedback Summarizer for Feedback Analyzer

Generates human-readable summary report from categorized feedback.

Usage:
    python feedback-summarizer.py <categorized-comments.json>

Output: Markdown summary report
"""

import json
import sys
from pathlib import Path
from typing import List, Dict, Any
from collections import defaultdict


def generate_summary(categorized_data: Dict[str, Any]) -> str:
    """Generate markdown summary report"""

    comments = categorized_data.get("categorized_comments", [])
    source_file = categorized_data.get("source_file", "unknown")
    total_comments = categorized_data.get("total_comments", len(comments))

    summary = categorized_data.get("summary", {})
    by_domain = summary.get("by_domain", {})
    by_type = summary.get("by_type", {})
    by_priority = summary.get("by_priority", {})

    # Build report
    report = f"""# Feedback Analysis: {source_file}

**Total Comments**: {total_comments}
**Analysis Date**: {_get_date()}

## Summary Statistics

### By Domain
{_format_stats(by_domain)}

### By Type
{_format_stats(by_type)}

### By Priority
{_format_stats(by_priority)}

---

## High Priority Actions

{_format_priority_section(comments, "high")}

## Medium Priority Actions

{_format_priority_section(comments, "medium")}

## Low Priority Actions

{_format_priority_section(comments, "low")}

---

## Learnings Integrated

{_format_learnings_by_domain(comments)}

---

## Recommended Next Steps

{_generate_recommendations(comments)}

---

## Detailed Comments

{_format_detailed_comments(comments)}
"""

    return report


def _get_date() -> str:
    """Get current date"""
    from datetime import datetime
    return datetime.now().strftime('%Y-%m-%d')


def _format_stats(stats: Dict[str, int]) -> str:
    """Format statistics dictionary as markdown list"""
    if not stats:
        return "- None\n"

    lines = []
    # Sort by count descending
    sorted_stats = sorted(stats.items(), key=lambda x: x[1], reverse=True)

    for key, count in sorted_stats:
        lines.append(f"- **{key.title()}**: {count}")

    return '\n'.join(lines) + '\n'


def _format_priority_section(comments: List[Dict], priority: str) -> str:
    """Format comments by priority"""
    filtered = [c for c in comments if c.get("priority") == priority]

    if not filtered:
        return f"No {priority} priority items.\n"

    lines = []
    for i, comment in enumerate(filtered, 1):
        domain = comment.get("domain", "general")
        text = comment.get("text", "")
        line_num = comment.get("line", "?")
        action = comment.get("action", "review")

        lines.append(f"{i}. **[{domain.title()}]** {text}")
        lines.append(f"   - Source: Line {line_num}")
        lines.append(f"   - Action: {action.replace('_', ' ').title()}")
        lines.append("")

    return '\n'.join(lines)


def _format_learnings_by_domain(comments: List[Dict]) -> str:
    """Format learnings grouped by domain"""
    by_domain = defaultdict(list)

    for comment in comments:
        domain = comment.get("domain", "general")
        by_domain[domain].append(comment)

    if not by_domain:
        return "No learnings to integrate.\n"

    lines = []
    for domain, domain_comments in sorted(by_domain.items()):
        lines.append(f"### {domain.title()}")
        lines.append(f"**Count**: {len(domain_comments)} learnings")
        lines.append(f"**Suggested Agent**: {domain_comments[0].get('suggested_agent', 'general-purpose')}")
        lines.append("")

        # Group by type within domain
        by_type = defaultdict(int)
        for comment in domain_comments:
            by_type[comment.get("type", "general")] += 1

        lines.append("**Types**:")
        for comment_type, count in sorted(by_type.items(), key=lambda x: x[1], reverse=True):
            lines.append(f"- {comment_type.title()}: {count}")
        lines.append("")

    return '\n'.join(lines)


def _generate_recommendations(comments: List[Dict]) -> str:
    """Generate recommended next steps"""
    if not comments:
        return "No recommendations.\n"

    recommendations = []

    # Get unique domains
    domains = set(c.get("domain", "general") for c in comments)

    # Recommend learning retrieval for each domain
    for domain in sorted(domains):
        domain_comments = [c for c in comments if c.get("domain") == domain]
        high_priority = sum(1 for c in domain_comments if c.get("priority") == "high")

        if high_priority > 0:
            recommendations.append(
                f"- **{domain.title()}**: Run `QLEARN: \"{domain}\"` before next {domain} task ({high_priority} high-priority learnings)"
            )
        else:
            recommendations.append(
                f"- **{domain.title()}**: {len(domain_comments)} learnings available via `QLEARN: \"{domain}\"`"
            )

    recommendations.append("")
    recommendations.append("### Integration Status")
    recommendations.append(f"- Learnings have been integrated into `.claude/learnings/*/user-feedback.md`")
    recommendations.append(f"- Agents will automatically load these learnings when triggered")

    return '\n'.join(recommendations) + '\n'


def _format_detailed_comments(comments: List[Dict]) -> str:
    """Format detailed comment list"""
    if not comments:
        return "No comments found.\n"

    lines = []

    # Group by domain
    by_domain = defaultdict(list)
    for comment in comments:
        domain = comment.get("domain", "general")
        by_domain[domain].append(comment)

    for domain, domain_comments in sorted(by_domain.items()):
        lines.append(f"### {domain.title()}")
        lines.append("")

        for comment in domain_comments:
            text = comment.get("text", "")
            line_num = comment.get("line", "?")
            priority = comment.get("priority", "medium")
            comment_type = comment.get("type", "general")
            pattern = comment.get("pattern", "unknown")

            lines.append(f"#### Line {line_num} ({priority.upper()} - {comment_type.title()})")
            lines.append(f"**Pattern**: `{pattern}`")
            lines.append(f"**Feedback**: {text}")
            lines.append("")

            # Show context if available
            context_before = comment.get("context_before", [])
            context_after = comment.get("context_after", [])

            if context_before:
                lines.append("**Context Before**:")
                for ctx_line in context_before:
                    if ctx_line.strip():
                        lines.append(f"> {ctx_line}")
                lines.append("")

            if context_after:
                lines.append("**Context After** (first 3 lines):")
                for ctx_line in context_after[:3]:
                    if ctx_line.strip():
                        lines.append(f"> {ctx_line}")
                lines.append("")

            lines.append("---")
            lines.append("")

    return '\n'.join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python feedback-summarizer.py <categorized-comments.json>", file=sys.stderr)
        sys.exit(1)

    categorized_file = sys.argv[1]

    if not Path(categorized_file).exists():
        print(f"Error: File not found: {categorized_file}", file=sys.stderr)
        sys.exit(1)

    try:
        with open(categorized_file, 'r', encoding='utf-8') as f:
            categorized_data = json.load(f)

        report = generate_summary(categorized_data)
        print(report)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
