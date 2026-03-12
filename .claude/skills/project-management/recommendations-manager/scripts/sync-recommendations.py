#!/usr/bin/env python3
"""
Sync Recommendations Tool

Extract recommendations from existing documents and consolidate into central registry.
Uses pattern matching to identify recommendation-like content.

Usage:
    python sync-recommendations.py --source "path/to/document.md"
    python sync-recommendations.py --discover  # Auto-discover from common locations

Output (JSON):
    {
      "extracted": 47,
      "new": 39,
      "duplicates": 8,
      "recommendations_file": "docs/project/recommendations.md"
    }
"""

import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any, Tuple
import re
from datetime import date


def find_project_root() -> Path:
    """Find project root by looking for .claude directory."""
    current = Path.cwd()
    while current != current.parent:
        if (current / '.claude').exists():
            return current
        current = current.parent
    raise FileNotFoundError("Could not find project root (.claude directory not found)")


def extract_recommendations_from_design_doc(content: str, source_doc: str) -> List[Dict[str, Any]]:
    """Extract recommendations from DESIGN-DIRECTION-RECOMMENDATIONS.md."""
    recommendations = []

    # Pattern 1: Quick Wins Checklist
    checklist_pattern = r'- \[ \] (.+?)(?:\((\d+(?:\.\d+)?) (?:hour|SP)\))?'
    for match in re.finditer(checklist_pattern, content):
        title = match.group(1).strip()
        effort = match.group(2)

        # Skip if too generic
        if len(title) < 10:
            continue

        # Infer category from title keywords
        category = infer_category(title)
        priority = infer_priority_from_checklist(title)

        rec = {
            'title': title,
            'description': f'From Quick Wins checklist: {title}',
            'category': category,
            'priority': priority,
            'source': 'best-practice',
            'source_document': source_doc,
            'status': 'proposed',
            'created_date': str(date.today()),
            'updated_date': str(date.today())
        }

        if effort:
            # Convert hours to SP (rough: 1 hour = 0.5 SP)
            rec['effort_sp'] = float(effort) * 0.5 if 'hour' in match.group(0) else float(effort)

        recommendations.append(rec)

    # Pattern 2: Before/After tables
    table_pattern = r'\| \*\*(.+?)\*\* \| `([^`]+)` \| `([^`]+)` \| (.+?) \|'
    for match in re.finditer(table_pattern, content):
        element = match.group(1).strip()
        before = match.group(2).strip()
        after = match.group(3).strip()
        rationale = match.group(4).strip()

        title = f"Update {element}: {before} → {after}"
        category = infer_category(element)

        rec = {
            'title': title,
            'description': f'{rationale} (Before: {before}, After: {after})',
            'category': category,
            'priority': 'P1',
            'source': 'best-practice',
            'source_document': source_doc,
            'status': 'proposed',
            'created_date': str(date.today()),
            'updated_date': str(date.today())
        }

        recommendations.append(rec)

    # Pattern 3: Headings as recommendations (e.g., "## 1. Color Palette Update")
    heading_pattern = r'^###? \d+\.\s+(.+)$'
    for match in re.finditer(heading_pattern, content, re.MULTILINE):
        heading = match.group(1).strip()

        # Skip if looks like a section header, not a recommendation
        if any(skip in heading.lower() for skip in ['before/after', 'what\'s', 'summary', 'checklist']):
            continue

        # Extract description (next paragraph)
        start_pos = match.end()
        next_section = content.find('\n##', start_pos)
        if next_section == -1:
            next_section = len(content)

        description = content[start_pos:next_section].strip()[:200]  # First 200 chars

        if description:
            category = infer_category(heading)
            rec = {
                'title': heading,
                'description': description,
                'category': category,
                'priority': 'P1',
                'source': 'best-practice',
                'source_document': source_doc,
                'status': 'proposed',
                'created_date': str(date.today()),
                'updated_date': str(date.today())
            }
            recommendations.append(rec)

    return recommendations


def extract_recommendations_from_research_brief(content: str, source_doc: str) -> List[Dict[str, Any]]:
    """Extract recommendations from STRATEGIC-RESEARCH-BRIEF.md."""
    recommendations = []

    # Pattern 1: "What to Do" lists
    action_pattern = r'^\*\*What TO Do:\*\*\s*$(.+?)(?=^\*\*|^##|$)'
    matches = re.finditer(action_pattern, content, re.MULTILINE | re.DOTALL)

    for match in matches:
        section_content = match.group(1)
        # Extract bullet points
        bullets = re.findall(r'^- \*\*(.+?):\*\* (.+)$', section_content, re.MULTILINE)

        for bullet in bullets:
            title = bullet[0].strip()
            description = bullet[1].strip()

            category = infer_category(title + ' ' + description)

            rec = {
                'title': title,
                'description': description,
                'category': category,
                'priority': 'P1',
                'source': 'research',
                'source_document': source_doc,
                'status': 'proposed',
                'impact': 'high',
                'created_date': str(date.today()),
                'updated_date': str(date.today())
            }
            recommendations.append(rec)

    # Pattern 2: Phase-based recommendations
    phase_pattern = r'###\s+Phase\s+\d+:\s+(.+?)\s+\(Week.+?\)\s+—\s+(\d+)\s+SP\s*$(.+?)(?=^###|$)'
    matches = re.finditer(phase_pattern, content, re.MULTILINE | re.DOTALL)

    for match in matches:
        phase_title = match.group(1).strip()
        effort_sp = int(match.group(2))
        phase_content = match.group(3)

        # Extract sub-items
        sub_items = re.findall(r'^- (.+)$', phase_content, re.MULTILINE)

        for item in sub_items:
            title = f"{phase_title}: {item.strip()}"
            category = infer_category(phase_title)

            rec = {
                'title': item.strip(),
                'description': f'Part of {phase_title} phase',
                'category': category,
                'priority': 'P1',
                'source': 'research',
                'source_document': source_doc,
                'status': 'proposed',
                'effort_sp': effort_sp / max(len(sub_items), 1),  # Divide effort among items
                'created_date': str(date.today()),
                'updated_date': str(date.today())
            }
            recommendations.append(rec)

    return recommendations


def infer_category(text: str) -> str:
    """Infer category from text content."""
    text_lower = text.lower()

    if any(kw in text_lower for kw in ['color', 'photo', 'typography', 'layout', 'visual', 'palette', 'design']):
        return 'design'
    elif any(kw in text_lower for kw in ['video', 'testimonial', 'content', 'copy', 'text', 'story']):
        return 'content'
    elif any(kw in text_lower for kw in ['mobile', 'ux', 'user', 'navigation', 'interaction', 'button', 'cta']):
        return 'ux'
    elif any(kw in text_lower for kw in ['performance', 'speed', 'load', 'optimize', 'cache']):
        return 'performance'
    elif any(kw in text_lower for kw in ['security', 'auth', 'ssl', 'encrypt']):
        return 'security'
    elif any(kw in text_lower for kw in ['code', 'api', 'database', 'technical', 'function', 'backend']):
        return 'technical'
    else:
        return 'business'


def infer_priority_from_checklist(title: str) -> str:
    """Infer priority from checklist item urgency."""
    title_lower = title.lower()

    if any(kw in title_lower for kw in ['critical', 'urgent', 'blocking', 'required', 'must']):
        return 'P0'
    elif any(kw in title_lower for kw in ['important', 'key', 'primary', 'quick win']):
        return 'P1'
    else:
        return 'P2'


def deduplicate_recommendations(recommendations: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], int]:
    """Remove duplicate recommendations based on title similarity."""
    seen_titles = set()
    unique = []
    duplicates = 0

    for rec in recommendations:
        # Normalize title for comparison
        normalized = re.sub(r'\W+', '', rec['title'].lower())

        if normalized not in seen_titles:
            seen_titles.add(normalized)
            unique.append(rec)
        else:
            duplicates += 1

    return unique, duplicates


def get_next_rec_id(registry_path: Path) -> int:
    """Get next available REC-ID number."""
    if not registry_path.exists():
        return 1

    content = registry_path.read_text(encoding='utf-8')
    rec_ids = re.findall(r'REC-(\d{3,})', content)

    if not rec_ids:
        return 1

    return max(int(id_num) for id_num in rec_ids) + 1


def append_recommendations_to_registry(
    registry_path: Path,
    recommendations: List[Dict[str, Any]],
    start_id: int
) -> None:
    """Append multiple recommendations to registry."""

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

    content = registry_path.read_text(encoding='utf-8')

    # Update timestamp
    content = re.sub(
        r'Last Updated: \d{4}-\d{2}-\d{2}',
        f'Last Updated: {date.today()}',
        content
    )

    # Append recommendations
    for i, rec in enumerate(recommendations):
        rec_id = f"REC-{start_id + i:03d}"
        category = rec['category']
        priority = rec['priority']
        status = rec['status']
        title = rec['title'][:80]  # Truncate for table
        effort = rec.get('effort_sp', 'TBD')
        impact = rec.get('impact', '-')
        source = rec['source']
        created = rec['created_date']

        row = f"| {rec_id} | {category} | {priority} | {status} | {title} | {effort} | {impact} | {source} | {created} |\n"
        content += row

    registry_path.write_text(content, encoding='utf-8')


def discover_documents(project_root: Path) -> List[Path]:
    """Auto-discover documents likely to contain recommendations."""
    patterns = [
        'requirements/**/*RECOMMENDATION*.md',
        'requirements/**/*RESEARCH*.md',
        'requirements/**/*BRIEF*.md',
        'docs/**/*recommendation*.md',
        'research/**/*.md'
    ]

    discovered = []
    for pattern in patterns:
        discovered.extend(project_root.glob(pattern))

    return list(set(discovered))  # Remove duplicates


def main():
    parser = argparse.ArgumentParser(description='Sync recommendations from documents')
    parser.add_argument('--source', help='Path to source document')
    parser.add_argument('--discover', action='store_true', help='Auto-discover documents')

    args = parser.parse_args()

    if not args.source and not args.discover:
        print(json.dumps({
            "error": "Must specify --source or --discover"
        }), file=sys.stderr)
        sys.exit(1)

    try:
        project_root = find_project_root()
        registry_path = project_root / 'docs' / 'project' / 'recommendations.md'

        all_recommendations = []

        if args.discover:
            # Auto-discover
            documents = discover_documents(project_root)
            for doc in documents:
                content = doc.read_text(encoding='utf-8')
                relative_path = str(doc.relative_to(project_root))

                if 'DESIGN-DIRECTION' in doc.name:
                    recs = extract_recommendations_from_design_doc(content, relative_path)
                elif 'RESEARCH-BRIEF' in doc.name:
                    recs = extract_recommendations_from_research_brief(content, relative_path)
                else:
                    # Generic extraction (simple bullet points)
                    recs = []

                all_recommendations.extend(recs)

        else:
            # Single source
            source_path = project_root / args.source
            if not source_path.exists():
                print(json.dumps({
                    "error": f"Source document not found: {args.source}"
                }), file=sys.stderr)
                sys.exit(1)

            content = source_path.read_text(encoding='utf-8')
            relative_path = str(source_path.relative_to(project_root))

            if 'DESIGN-DIRECTION' in source_path.name:
                all_recommendations = extract_recommendations_from_design_doc(content, relative_path)
            elif 'RESEARCH-BRIEF' in source_path.name:
                all_recommendations = extract_recommendations_from_research_brief(content, relative_path)
            else:
                print(json.dumps({
                    "error": "Unknown document type. Expected DESIGN-DIRECTION or RESEARCH-BRIEF"
                }), file=sys.stderr)
                sys.exit(1)

        # Deduplicate
        unique_recs, duplicates = deduplicate_recommendations(all_recommendations)

        # Get next ID
        next_id = get_next_rec_id(registry_path)

        # Append to registry
        append_recommendations_to_registry(registry_path, unique_recs, next_id)

        # Output results
        print(json.dumps({
            "extracted": len(all_recommendations),
            "new": len(unique_recs),
            "duplicates": duplicates,
            "recommendations_file": str(registry_path.relative_to(project_root))
        }, indent=2))

    except Exception as e:
        print(json.dumps({
            "error": str(e)
        }), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
