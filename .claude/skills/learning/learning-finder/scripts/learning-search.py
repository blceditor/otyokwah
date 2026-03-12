#!/usr/bin/env python3
"""
Learning Search for Learning Finder

Searches .claude/learnings/<domain>/user-feedback.md files for relevant learnings.

Usage:
    python learning-search.py <domain> <keywords...> [--limit N] [--min-score X]

Examples:
    python learning-search.py research "RAG" "architecture"
    python learning-search.py all "cost analysis" --limit 10
    python learning-search.py architecture "LLM-Twin" --min-score 0.5

Output (JSON):
    {
      "domain": "research",
      "keywords": ["RAG", "architecture"],
      "total_learnings_searched": 45,
      "relevant_learnings": [...],
      "top_n": 5
    }
"""

import json
import sys
import re
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Tuple
import argparse


LEARNINGS_DIR = Path(".claude/learnings")

# Priority weights for scoring
PRIORITY_WEIGHTS = {
    "high": 1.0,
    "medium": 0.6,
    "low": 0.3
}


def parse_learning_file(file_path: Path) -> List[Dict[str, Any]]:
    """Parse a learning file and extract all learning entries"""
    if not file_path.exists():
        return []

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    learnings = []

    # Split by learning sections (## headers)
    sections = re.split(r'\n## ', content)

    # Skip header section
    for section in sections[1:]:
        learning = _parse_learning_section(section, file_path)
        if learning:
            learnings.append(learning)

    return learnings


def _parse_learning_section(section: str, file_path: Path) -> Dict[str, Any]:
    """Parse a single learning section"""
    lines = section.split('\n')

    # Extract title and priority from first line
    title_line = lines[0]
    priority_match = re.search(r'\(Priority:\s*(\w+)\)', title_line)
    priority = priority_match.group(1).lower() if priority_match else "medium"
    title = re.sub(r'\s*\(Priority:.*?\)', '', title_line).strip()

    # Extract fields
    learning = {
        "title": title,
        "priority": priority,
        "feedback": "",
        "application": "",
        "context_before": "",
        "context_after": "",
        "source": "",
        "date": "",
        "type": "",
        "action": "",
        "status": "active",
        "file": str(file_path)
    }

    current_field = None
    field_content = []

    for line in lines[1:]:
        # Check for field markers
        if line.startswith("**Date**:"):
            learning["date"] = line.replace("**Date**:", "").strip()
        elif line.startswith("**Feedback**:"):
            learning["feedback"] = line.replace("**Feedback**:", "").strip()
        elif line.startswith("**Source**:"):
            learning["source"] = line.replace("**Source**:", "").strip()
        elif line.startswith("**Type**:"):
            learning["type"] = line.replace("**Type**:", "").strip()
        elif line.startswith("**Action**:"):
            learning["action"] = line.replace("**Action**:", "").strip()
        elif line.startswith("**Status**:"):
            learning["status"] = line.replace("**Status**:", "").strip()
        elif line.startswith("**Context Before**:"):
            current_field = "context_before"
            field_content = []
        elif line.startswith("**Context After**:"):
            current_field = "context_after"
            field_content = []
        elif line.startswith("### Application"):
            current_field = "application"
            field_content = []
        elif line.startswith("---") or line.startswith("###"):
            # End of section or subsection
            if current_field and field_content:
                learning[current_field] = '\n'.join(field_content).strip()
            current_field = None
            field_content = []
        elif current_field:
            # Add to current field content
            field_content.append(line)

    # Capture any remaining field content
    if current_field and field_content:
        learning[current_field] = '\n'.join(field_content).strip()

    return learning


def calculate_relevance_score(
    learning: Dict[str, Any],
    keywords: List[str]
) -> float:
    """Calculate relevance score for a learning based on keywords"""

    # Combine searchable text
    searchable_text = (
        learning.get("title", "") + " " +
        learning.get("feedback", "") + " " +
        learning.get("application", "") + " " +
        learning.get("context_before", "") + " " +
        learning.get("context_after", "")
    ).lower()

    # Count keyword matches
    keyword_matches = sum(
        1 for keyword in keywords
        if keyword.lower() in searchable_text
    )

    if keyword_matches == 0:
        return 0.0

    # Calculate keyword match score (0.0-1.0)
    keyword_score = min(keyword_matches / len(keywords), 1.0)

    # Get priority weight
    priority = learning.get("priority", "medium")
    priority_weight = PRIORITY_WEIGHTS.get(priority, 0.6)

    # Calculate recency weight
    recency_weight = _calculate_recency_weight(learning.get("date", ""))

    # Calculate application match score
    application_text = learning.get("application", "").lower()
    application_matches = sum(
        1 for keyword in keywords
        if keyword.lower() in application_text
    )
    application_score = min(application_matches / len(keywords), 1.0) if keywords else 0.0

    # Combined relevance score
    relevance_score = (
        keyword_score * 0.4 +
        priority_weight * 0.3 +
        recency_weight * 0.2 +
        application_score * 0.1
    )

    return round(relevance_score, 2)


def _calculate_recency_weight(date_str: str) -> float:
    """Calculate recency weight based on learning date"""
    if not date_str:
        return 0.5  # Default for learnings without dates

    try:
        learning_date = datetime.strptime(date_str, "%Y-%m-%d")
        days_since = (datetime.now() - learning_date).days
        return 1.0 / (days_since + 1)
    except ValueError:
        return 0.5  # Default if date parsing fails


def search_learnings(
    domain: str,
    keywords: List[str],
    limit: int = 5,
    min_score: float = 0.3
) -> Dict[str, Any]:
    """Search learnings and return top N by relevance"""

    all_learnings = []

    # Determine which domains to search
    if domain == "all":
        domains_to_search = [
            "research", "planning", "architecture", "quality",
            "security", "testing", "business", "prompting", "content"
        ]
    else:
        domains_to_search = [domain]

    # Search each domain
    for domain_name in domains_to_search:
        domain_dir = LEARNINGS_DIR / domain_name
        learning_file = domain_dir / "user-feedback.md"

        if learning_file.exists():
            learnings = parse_learning_file(learning_file)
            all_learnings.extend(learnings)

    # Filter out archived/inactive learnings
    active_learnings = [
        l for l in all_learnings
        if l.get("status", "active") == "active"
    ]

    # Calculate relevance scores
    scored_learnings = []
    for learning in active_learnings:
        score = calculate_relevance_score(learning, keywords)
        if score >= min_score:
            learning["relevance_score"] = score
            scored_learnings.append(learning)

    # Sort by relevance score (descending)
    scored_learnings.sort(key=lambda x: x["relevance_score"], reverse=True)

    # Return top N
    top_learnings = scored_learnings[:limit]

    return {
        "domain": domain,
        "keywords": keywords,
        "total_learnings_searched": len(all_learnings),
        "active_learnings": len(active_learnings),
        "relevant_learnings": top_learnings,
        "top_n": len(top_learnings)
    }


def main():
    parser = argparse.ArgumentParser(
        description="Search learnings by domain and keywords"
    )
    parser.add_argument(
        "domain",
        help="Domain to search (research, architecture, etc.) or 'all'"
    )
    parser.add_argument(
        "keywords",
        nargs="+",
        help="Keywords to search for"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="Maximum number of learnings to return (default: 5)"
    )
    parser.add_argument(
        "--min-score",
        type=float,
        default=0.3,
        help="Minimum relevance score (0.0-1.0, default: 0.3)"
    )

    args = parser.parse_args()

    try:
        result = search_learnings(
            args.domain,
            args.keywords,
            args.limit,
            args.min_score
        )
        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
