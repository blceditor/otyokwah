#!/usr/bin/env python3
"""
List Recommendations Tool

Query and filter recommendations from the central registry.

Usage:
    python list-recommendations.py [--priority P0 P1] [--status proposed approved] [--category design]
    python list-recommendations.py --source-document "STRATEGIC-RESEARCH-BRIEF.md"
    python list-recommendations.py --format json

Output (Markdown table by default, JSON if --format json):
    | ID | Category | Priority | Status | Title | Effort |
    |----|----------|----------|--------|-------|--------|
    | REC-001 | design | P1 | proposed | Update color palette | 1 SP |
"""

import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any
import re


def find_project_root() -> Path:
    """Find project root by looking for .claude directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.claude').exists():
            return current
        current = current.parent
    raise FileNotFoundError("Could not find project root (.claude directory not found)")


def parse_registry(registry_path: Path) -> List[Dict[str, Any]]:
    """Parse recommendations from registry markdown table."""
    if not registry_path.exists():
        return []

    content = registry_path.read_text(encoding='utf-8')

    # Find table rows (skip header and separator)
    lines = content.split('\n')
    recommendations = []

    in_table = False
    for line in lines:
        if line.startswith('| ID |'):
            in_table = True
            continue
        if in_table and line.startswith('|--'):
            continue
        if in_table and line.startswith('|'):
            # Parse table row
            parts = [p.strip() for p in line.split('|')[1:-1]]  # Skip first/last empty
            if len(parts) >= 8:
                rec = {
                    'recommendation_id': parts[0],
                    'category': parts[1],
                    'priority': parts[2],
                    'status': parts[3],
                    'title': parts[4],
                    'effort_sp': parts[5],
                    'impact': parts[6],
                    'source': parts[7],
                    'created_date': parts[8] if len(parts) > 8 else '-'
                }
                recommendations.append(rec)
        elif in_table and not line.startswith('|'):
            # End of table
            break

    return recommendations


def filter_recommendations(
    recommendations: List[Dict[str, Any]],
    priorities: List[str] = None,
    statuses: List[str] = None,
    categories: List[str] = None,
    source_document: str = None
) -> List[Dict[str, Any]]:
    """Filter recommendations based on criteria."""
    filtered = recommendations

    if priorities:
        filtered = [r for r in filtered if r['priority'] in priorities]

    if statuses:
        filtered = [r for r in filtered if r['status'] in statuses]

    if categories:
        filtered = [r for r in filtered if r['category'] in categories]

    if source_document:
        # Note: source_document not in table, would need full JSON storage
        # For now, just warn
        print(f"Warning: source_document filter not available in table format", file=sys.stderr)

    return filtered


def format_as_table(recommendations: List[Dict[str, Any]]) -> str:
    """Format recommendations as markdown table."""
    if not recommendations:
        return "No recommendations found matching criteria."

    table = "| ID | Category | Priority | Status | Title | Effort |\n"
    table += "|-----|----------|----------|--------|-------|--------|\n"

    for rec in recommendations:
        table += f"| {rec['recommendation_id']} | {rec['category']} | {rec['priority']} | {rec['status']} | {rec['title']} | {rec['effort_sp']} |\n"

    return table


def main():
    parser = argparse.ArgumentParser(description='List and filter recommendations')
    parser.add_argument('--priority', nargs='+', choices=['P0', 'P1', 'P2'], help='Filter by priority')
    parser.add_argument('--status', nargs='+',
                        choices=['proposed', 'approved', 'in-progress', 'implemented', 'validated', 'rejected'],
                        help='Filter by status')
    parser.add_argument('--category', nargs='+',
                        choices=['design', 'technical', 'content', 'business', 'ux', 'performance', 'security'],
                        help='Filter by category')
    parser.add_argument('--source-document', help='Filter by source document (partial match)')
    parser.add_argument('--format', choices=['table', 'json'], default='table', help='Output format')

    args = parser.parse_args()

    try:
        # Find project root and registry
        project_root = find_project_root()
        registry_path = project_root / 'docs' / 'project' / 'recommendations.md'

        # Parse registry
        recommendations = parse_registry(registry_path)

        # Filter
        filtered = filter_recommendations(
            recommendations,
            priorities=args.priority,
            statuses=args.status,
            categories=args.category,
            source_document=args.source_document
        )

        # Output
        if args.format == 'json':
            print(json.dumps(filtered, indent=2))
        else:
            print(format_as_table(filtered))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
