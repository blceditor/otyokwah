#!/usr/bin/env python3
"""
Learning Integrator for Feedback Analyzer

Integrates categorized feedback into .claude/learnings/<domain>/user-feedback.md files.

Usage:
    python learning-integrator.py <categorized-comments.json> <source-file.md>

Output (JSON):
    {
      "integrated": 5,
      "files_updated": [".claude/learnings/research/user-feedback.md"],
      "trigger_compaction": false,
      "learnings_size_kb": 12.3
    }
"""

import json
import sys
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import os


LEARNINGS_DIR = Path(".claude/learnings")
COMPACTION_THRESHOLD_KB = 50  # Trigger compaction at 50KB


def get_file_size_kb(file_path: Path) -> float:
    """Get file size in KB"""
    if not file_path.exists():
        return 0.0
    return file_path.stat().st_size / 1024


def create_learning_entry(comment: Dict[str, Any], source_file: str) -> str:
    """Create markdown entry for a single learning"""
    title = comment["text"][:60].strip()
    if len(comment["text"]) > 60:
        title += "..."

    # Sanitize title for anchor links
    title = title.replace("[", "").replace("]", "").replace("(", "").replace(")", "")

    entry = f"""## {title} (Priority: {comment['priority'].title()})

**Date**: {datetime.now().strftime('%Y-%m-%d')}
**Feedback**: {comment['text']}
**Context Before**:
{chr(10).join('> ' + line for line in comment.get('context_before', []) if line.strip())}

**Context After**:
{chr(10).join('> ' + line for line in comment.get('context_after', []) if line.strip())}

**Source**: {source_file}:{comment['line']}
**Type**: {comment['type']}
**Action**: {comment.get('action', 'review')}
**Status**: active

### Application
{_generate_application_guidance(comment)}

---

"""
    return entry


def _generate_application_guidance(comment: Dict[str, Any]) -> str:
    """Generate application guidance based on comment type and domain"""
    domain = comment.get('domain', 'general')
    comment_type = comment.get('type', 'general')

    guidance_templates = {
        'improvement': f"When working on {domain} tasks, consider: {comment['text']}",
        'learning': f"Reference this pattern in future {domain} work: {comment['text']}",
        'correction': f"Avoid this approach in {domain}: {comment['text']}",
        'suggestion': f"Evaluate this suggestion for {domain} tasks: {comment['text']}",
        'question': f"Investigate this question before next {domain} task: {comment['text']}",
        'issue': f"Check for this issue in future {domain} implementations: {comment['text']}"
    }

    return guidance_templates.get(comment_type, f"Apply this learning to {domain} tasks: {comment['text']}")


def integrate_learnings(categorized_data: Dict[str, Any], source_file: str) -> Dict[str, Any]:
    """Integrate categorized comments into learning files"""

    # Ensure learnings directory structure exists
    LEARNINGS_DIR.mkdir(parents=True, exist_ok=True)

    # Group comments by domain
    by_domain = {}
    for comment in categorized_data.get("categorized_comments", []):
        domain = comment.get("domain", "general")
        if domain not in by_domain:
            by_domain[domain] = []
        by_domain[domain].append(comment)

    files_updated = []
    files_needing_compaction = []
    total_integrated = 0

    # Process each domain
    for domain, comments in by_domain.items():
        domain_dir = LEARNINGS_DIR / domain
        domain_dir.mkdir(parents=True, exist_ok=True)

        learning_file = domain_dir / "user-feedback.md"

        # Read existing content or create header
        if learning_file.exists():
            with open(learning_file, 'r', encoding='utf-8') as f:
                existing_content = f.read()

            # Extract header stats
            existing_lines = existing_content.split('\n')
            header_end = 0
            for i, line in enumerate(existing_lines):
                if line.startswith('---'):
                    header_end = i + 1
                    break

            if header_end > 0:
                content_without_header = '\n'.join(existing_lines[header_end:])
            else:
                content_without_header = existing_content
        else:
            content_without_header = ""

        # Create new entries
        new_entries = []
        for comment in comments:
            new_entries.append(create_learning_entry(comment, source_file))
            total_integrated += 1

        # Count total learnings
        total_learnings = len(comments)
        if content_without_header:
            # Count existing learning sections
            total_learnings += content_without_header.count('\n## ')

        # Get current file size
        current_size_kb = get_file_size_kb(learning_file)

        # Create updated header
        header = f"""# User Feedback: {domain.title()}

**Last Updated**: {datetime.now().strftime('%Y-%m-%d')}
**Total Learnings**: {total_learnings}
**Size**: {current_size_kb:.1f} KB{' (⚠️  Approaching 50 KB limit - compaction recommended)' if current_size_kb > 40 else ''}

---

"""

        # Combine header + new entries + existing content
        updated_content = header + ''.join(new_entries) + content_without_header

        # Write updated file
        with open(learning_file, 'w', encoding='utf-8') as f:
            f.write(updated_content)

        files_updated.append(str(learning_file))

        # Check if compaction needed
        new_size_kb = get_file_size_kb(learning_file)
        if new_size_kb >= COMPACTION_THRESHOLD_KB:
            files_needing_compaction.append(str(learning_file))

    return {
        "integrated": total_integrated,
        "files_updated": files_updated,
        "trigger_compaction": len(files_needing_compaction) > 0,
        "files_needing_compaction": files_needing_compaction,
        "learnings_size_kb": {
            str(Path(f)): get_file_size_kb(Path(f))
            for f in files_updated
        }
    }


def main():
    if len(sys.argv) < 3:
        print("Usage: python learning-integrator.py <categorized-comments.json> <source-file.md>", file=sys.stderr)
        sys.exit(1)

    categorized_file = sys.argv[1]
    source_file = sys.argv[2]

    if not Path(categorized_file).exists():
        print(json.dumps({
            "error": f"File not found: {categorized_file}"
        }))
        sys.exit(1)

    try:
        with open(categorized_file, 'r', encoding='utf-8') as f:
            categorized_data = json.load(f)

        result = integrate_learnings(categorized_data, source_file)
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
