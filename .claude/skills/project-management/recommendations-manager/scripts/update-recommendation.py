#!/usr/bin/env python3
"""
Update Recommendation Tool

Update status, priority, effort, or other fields for an existing recommendation.

Usage:
    python update-recommendation.py REC-001 --status approved
    python update-recommendation.py REC-001 --effort-sp 3
    python update-recommendation.py REC-001 --status implemented --implemented-in "abc123f"
    python update-recommendation.py REC-001 --req-id REQ-101

Output (JSON):
    {
      "recommendation_id": "REC-001",
      "updated_fields": ["status"],
      "updated_date": "2025-10-31"
    }
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import date
import re


def find_project_root() -> Path:
    """Find project root by looking for .claude directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.claude').exists():
            return current
        current = current.parent
    raise FileNotFoundError("Could not find project root (.claude directory not found)")


def update_recommendation_in_registry(
    registry_path: Path,
    rec_id: str,
    updates: dict
) -> bool:
    """Update recommendation fields in registry table."""

    if not registry_path.exists():
        return False

    content = registry_path.read_text(encoding='utf-8')
    lines = content.split('\n')

    updated = False
    for i, line in enumerate(lines):
        if line.startswith(f'| {rec_id} |'):
            # Parse current row
            parts = [p.strip() for p in line.split('|')[1:-1]]

            # Update fields
            if 'category' in updates:
                parts[1] = updates['category']
            if 'priority' in updates:
                parts[2] = updates['priority']
            if 'status' in updates:
                parts[3] = updates['status']
            if 'title' in updates:
                parts[4] = updates['title']
            if 'effort_sp' in updates:
                parts[5] = str(updates['effort_sp'])
            if 'impact' in updates:
                parts[6] = updates['impact']

            # Rebuild row
            lines[i] = '| ' + ' | '.join(parts) + ' |'
            updated = True
            break

    if updated:
        # Update timestamp
        content = '\n'.join(lines)
        content = re.sub(
            r'Last Updated: \d{4}-\d{2}-\d{2}',
            f'Last Updated: {date.today()}',
            content
        )
        registry_path.write_text(content, encoding='utf-8')

    return updated


def main():
    parser = argparse.ArgumentParser(description='Update an existing recommendation')
    parser.add_argument('rec_id', help='Recommendation ID (e.g., REC-001)')
    parser.add_argument('--status',
                        choices=['proposed', 'approved', 'in-progress', 'implemented', 'validated', 'rejected'])
    parser.add_argument('--priority', choices=['P0', 'P1', 'P2'])
    parser.add_argument('--category',
                        choices=['design', 'technical', 'content', 'business', 'ux', 'performance', 'security'])
    parser.add_argument('--effort-sp', type=float)
    parser.add_argument('--impact', choices=['high', 'medium', 'low'])
    parser.add_argument('--implemented-in', help='Commit hash or PR number')
    parser.add_argument('--req-id', help='Link to requirement ID')
    parser.add_argument('--rejection-rationale', help='Reason for rejection')

    args = parser.parse_args()

    # Validate REC-ID format
    if not re.match(r'^REC-\d{3,}$', args.rec_id):
        print(json.dumps({
            "error": "Invalid REC-ID format. Use REC-XXX (e.g., REC-001)"
        }), file=sys.stderr)
        sys.exit(1)

    # Collect updates
    updates = {}
    updated_fields = []

    if args.status:
        updates['status'] = args.status
        updated_fields.append('status')
    if args.priority:
        updates['priority'] = args.priority
        updated_fields.append('priority')
    if args.category:
        updates['category'] = args.category
        updated_fields.append('category')
    if args.effort_sp is not None:
        updates['effort_sp'] = args.effort_sp
        updated_fields.append('effort_sp')
    if args.impact:
        updates['impact'] = args.impact
        updated_fields.append('impact')

    if not updates:
        print(json.dumps({
            "error": "No fields to update specified"
        }), file=sys.stderr)
        sys.exit(1)

    try:
        project_root = find_project_root()
        registry_path = project_root / 'docs' / 'project' / 'recommendations.md'

        # Update in registry
        success = update_recommendation_in_registry(registry_path, args.rec_id, updates)

        if not success:
            print(json.dumps({
                "error": f"Recommendation {args.rec_id} not found in registry"
            }), file=sys.stderr)
            sys.exit(1)

        # Output success
        result = {
            "recommendation_id": args.rec_id,
            "updated_fields": updated_fields,
            "updated_date": str(date.today())
        }

        # Add note about non-table fields
        if args.implemented_in:
            result['note'] = f"implemented_in: {args.implemented_in} (not stored in table, consider JSON storage)"
        if args.req_id:
            result['note'] = f"req_id: {args.req_id} (not stored in table, consider JSON storage)"
        if args.rejection_rationale:
            result['note'] = f"rejection_rationale: {args.rejection_rationale} (not stored in table, consider JSON storage)"

        print(json.dumps(result, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
