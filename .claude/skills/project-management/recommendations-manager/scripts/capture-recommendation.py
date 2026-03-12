#!/usr/bin/env python3
"""
Capture Recommendation Tool

Adds a new recommendation to the central registry (docs/project/recommendations.md).
Automatically assigns next available REC-ID and timestamps creation.

Usage:
    python capture-recommendation.py \
      --title "Add video testimonials" \
      --category "content" \
      --priority "P1" \
      --description "Parents trust video testimonials more than text" \
      --source "user-feedback" \
      --source-document "research/brief.md" \
      [--effort-sp 2] \
      [--impact "high"] \
      [--dependencies REC-001,REC-002]

Output (JSON):
    {
      "recommendation_id": "REC-042",
      "status": "proposed",
      "created_date": "2025-10-31",
      "registry_file": "docs/project/recommendations.md"
    }
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import date
from typing import Dict, Any, List, Optional
import re


VALID_CATEGORIES = ['design', 'technical', 'content', 'business', 'ux', 'performance', 'security']
VALID_PRIORITIES = ['P0', 'P1', 'P2']
VALID_SOURCES = ['research', 'user-feedback', 'competitive-analysis', 'best-practice',
                 'code-review', 'stakeholder-meeting', 'testing', 'analytics']
VALID_IMPACTS = ['high', 'medium', 'low']


def find_project_root() -> Path:
    """Find project root by looking for .claude directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.claude').exists():
            return current
        current = current.parent
    raise FileNotFoundError("Could not find project root (.claude directory not found)")


def get_next_rec_id(registry_path: Path) -> str:
    """Extract highest REC-ID from registry and return next ID."""
    if not registry_path.exists():
        return "REC-001"

    content = registry_path.read_text(encoding='utf-8')
    rec_ids = re.findall(r'REC-(\d{3,})', content)

    if not rec_ids:
        return "REC-001"

    max_id = max(int(id_num) for id_num in rec_ids)
    return f"REC-{max_id + 1:03d}"


def validate_dependencies(dependencies: List[str]) -> bool:
    """Validate REC-ID format for dependencies."""
    pattern = re.compile(r'^REC-\d{3,}$')
    return all(pattern.match(dep) for dep in dependencies)


def create_recommendation(
    title: str,
    category: str,
    priority: str,
    description: str,
    source: str,
    source_document: Optional[str],
    effort_sp: Optional[float],
    impact: Optional[str],
    dependencies: Optional[List[str]]
) -> Dict[str, Any]:
    """Create recommendation dictionary."""

    rec = {
        'recommendation_id': '',  # Set by caller
        'category': category,
        'priority': priority,
        'status': 'proposed',
        'title': title,
        'description': description,
        'source': source,
        'created_date': str(date.today()),
        'updated_date': str(date.today())
    }

    if source_document:
        rec['source_document'] = source_document
    if effort_sp is not None:
        rec['effort_sp'] = effort_sp
    if impact:
        rec['impact'] = impact
    if dependencies:
        rec['dependencies'] = dependencies

    return rec


def append_to_registry(registry_path: Path, recommendation: Dict[str, Any]) -> None:
    """Append recommendation to registry file."""

    # Create registry if it doesn't exist
    if not registry_path.exists():
        registry_path.parent.mkdir(parents=True, exist_ok=True)
        registry_path.write_text(
            "# Project Recommendations Registry\n\n"
            "Last Updated: " + str(date.today()) + "\n\n"
            "## All Recommendations\n\n"
            "| ID | Category | Priority | Status | Title | Effort (SP) | Impact | Source | Created |\n"
            "|-----|----------|----------|--------|-------|-------------|--------|--------|----------|\n",
            encoding='utf-8'
        )

    # Append recommendation as table row
    content = registry_path.read_text(encoding='utf-8')

    # Update "Last Updated" timestamp
    content = re.sub(
        r'Last Updated: \d{4}-\d{2}-\d{2}',
        f'Last Updated: {date.today()}',
        content
    )

    # Build table row
    rec_id = recommendation['recommendation_id']
    category = recommendation['category']
    priority = recommendation['priority']
    status = recommendation['status']
    title = recommendation['title']
    effort = recommendation.get('effort_sp', 'TBD')
    impact = recommendation.get('impact', '-')
    source = recommendation['source']
    created = recommendation['created_date']

    row = f"| {rec_id} | {category} | {priority} | {status} | {title} | {effort} | {impact} | {source} | {created} |\n"

    # Append to end of file
    content += row

    registry_path.write_text(content, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description='Capture a new recommendation')
    parser.add_argument('--title', required=True, help='Short, actionable title')
    parser.add_argument('--category', required=True, choices=VALID_CATEGORIES)
    parser.add_argument('--priority', required=True, choices=VALID_PRIORITIES)
    parser.add_argument('--description', required=True, help='Detailed description with rationale')
    parser.add_argument('--source', required=True, choices=VALID_SOURCES)
    parser.add_argument('--source-document', help='Path to source document or meeting ID')
    parser.add_argument('--effort-sp', type=float, help='Estimated effort in story points')
    parser.add_argument('--impact', choices=VALID_IMPACTS, help='Expected impact')
    parser.add_argument('--dependencies', help='Comma-separated REC-IDs (e.g., REC-001,REC-002)')

    args = parser.parse_args()

    # Parse dependencies
    dependencies = None
    if args.dependencies:
        dependencies = [dep.strip() for dep in args.dependencies.split(',')]
        if not validate_dependencies(dependencies):
            print(json.dumps({
                "error": "Invalid dependency format. Use REC-XXX format (e.g., REC-001)"
            }), file=sys.stderr)
            sys.exit(1)

    try:
        # Find project root and registry
        project_root = find_project_root()
        registry_path = project_root / 'docs' / 'project' / 'recommendations.md'

        # Get next REC-ID
        rec_id = get_next_rec_id(registry_path)

        # Create recommendation
        recommendation = create_recommendation(
            title=args.title,
            category=args.category,
            priority=args.priority,
            description=args.description,
            source=args.source,
            source_document=args.source_document,
            effort_sp=args.effort_sp,
            impact=args.impact,
            dependencies=dependencies
        )

        recommendation['recommendation_id'] = rec_id

        # Append to registry
        append_to_registry(registry_path, recommendation)

        # Output success
        print(json.dumps({
            "recommendation_id": rec_id,
            "status": "proposed",
            "created_date": recommendation['created_date'],
            "registry_file": str(registry_path.relative_to(project_root))
        }, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
