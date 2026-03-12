#!/usr/bin/env python3
"""
REQ-VAL-004 - Report Aggregator

Combines validation results into various output formats.
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime


def aggregate_results(results: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Aggregate results from multiple validators."""
    aggregated = {
        'total_validators': len(results),
        'passed': 0,
        'failed': 0,
        'total_issues': 0,
        'by_severity': {
            'critical': 0,
            'high': 0,
            'medium': 0,
            'low': 0
        },
        'by_category': {},
        'results': results,
        'generated_at': datetime.utcnow().isoformat() + 'Z'
    }

    for result in results:
        # Count pass/fail
        if result.get('success'):
            aggregated['passed'] += 1
        else:
            aggregated['failed'] += 1

        # Count issues by severity
        issues = result.get('issues', [])
        if isinstance(issues, list):
            aggregated['total_issues'] += len(issues)
            for issue in issues:
                severity = issue.get('severity', 'medium').lower()
                if severity in aggregated['by_severity']:
                    aggregated['by_severity'][severity] += 1

        # Group by category
        category = result.get('category', 'other')
        if category not in aggregated['by_category']:
            aggregated['by_category'][category] = {'total': 0, 'passed': 0, 'failed': 0}

        aggregated['by_category'][category]['total'] += 1
        if result.get('success'):
            aggregated['by_category'][category]['passed'] += 1
        else:
            aggregated['by_category'][category]['failed'] += 1

    return aggregated


def format_json(aggregated: Dict[str, Any]) -> str:
    """Format aggregated results as JSON."""
    if 'generated_at' not in aggregated and 'timestamp' not in aggregated:
        aggregated['timestamp'] = datetime.utcnow().isoformat() + 'Z'

    return json.dumps(aggregated, indent=2, default=str)


def format_markdown(aggregated: Dict[str, Any]) -> str:
    """Format aggregated results as Markdown."""
    lines = []

    # Header
    lines.append("# Validation Report")
    lines.append("")
    lines.append(f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    lines.append("")

    # Summary
    lines.append("## Summary")
    lines.append("")
    lines.append("| Metric | Value |")
    lines.append("|--------|-------|")
    lines.append(f"| Validators Run | {aggregated.get('total_validators', 0)} |")
    lines.append(f"| Passed | {aggregated.get('passed', 0)} |")
    lines.append(f"| Failed | {aggregated.get('failed', 0)} |")

    if 'duration' in aggregated:
        lines.append(f"| Duration | {aggregated['duration']:.2f}s |")

    if 'total_issues' in aggregated:
        lines.append(f"| Total Issues | {aggregated['total_issues']} |")

    lines.append("")

    # Issues by severity
    if aggregated.get('by_severity'):
        lines.append("## Issues by Severity")
        lines.append("")
        for severity, count in aggregated['by_severity'].items():
            if count > 0:
                lines.append(f"- **{severity.capitalize()}**: {count}")
        lines.append("")

    # Results by category
    if aggregated.get('by_category'):
        lines.append("## Results by Category")
        lines.append("")
        lines.append("| Category | Total | Passed | Failed |")
        lines.append("|----------|-------|--------|--------|")
        for category, stats in aggregated['by_category'].items():
            lines.append(f"| {category} | {stats['total']} | {stats['passed']} | {stats['failed']} |")
        lines.append("")

    # Detailed results
    if aggregated.get('results'):
        lines.append("## Detailed Results")
        lines.append("")

        for result in aggregated['results']:
            name = result.get('validator') or result.get('name', 'Unknown')
            success = result.get('success', False)
            status = "PASS" if success else "FAIL"

            lines.append(f"### {name}")
            lines.append(f"- **Status**: {status}")

            if result.get('category'):
                lines.append(f"- **Category**: {result['category']}")

            if result.get('duration'):
                lines.append(f"- **Duration**: {result['duration']:.2f}s")

            # List issues
            issues = result.get('issues', [])
            if issues:
                lines.append("")
                lines.append("**Issues:**")
                for issue in issues[:10]:  # Limit to 10 issues
                    file = issue.get('file', '')
                    line = issue.get('line', '')
                    msg = issue.get('message', '')
                    severity = issue.get('severity', 'medium')

                    location = f"{file}:{line}" if file and line else file or ''
                    lines.append(f"- [{severity.upper()}] {location}: {msg}")

                if len(issues) > 10:
                    lines.append(f"- ... and {len(issues) - 10} more issues")

            if result.get('error') and not result.get('success'):
                lines.append(f"- **Error**: {result['error'][:200]}")

            lines.append("")

    return "\n".join(lines)


def severity_to_github_level(severity: str) -> str:
    """Map severity to GitHub annotation level."""
    mapping = {
        'critical': 'error',
        'high': 'error',
        'medium': 'warning',
        'low': 'notice'
    }
    return mapping.get(severity.lower(), 'warning')


def format_github_annotations(aggregated: Dict[str, Any]) -> str:
    """Format as GitHub Actions workflow annotations."""
    lines = []

    for result in aggregated.get('results', []):
        issues = result.get('issues', [])
        for issue in issues:
            file = issue.get('file', '')
            line = issue.get('line', '')
            msg = issue.get('message', '')
            severity = issue.get('severity', 'medium')

            level = severity_to_github_level(severity)

            if file:
                if line:
                    lines.append(f"::{level} file={file},line={line}::{msg}")
                else:
                    lines.append(f"::{level} file={file}::{msg}")
            else:
                lines.append(f"::{level}::{msg}")

        # Also add general validator failure
        if not result.get('success') and not issues:
            validator = result.get('validator', 'Unknown')
            error = result.get('error', 'Validation failed')
            lines.append(f"::error::{validator}: {error}")

    return "\n".join(lines)


def save_report(
    aggregated: Dict[str, Any],
    output_path: str,
    format: str = 'json'
) -> None:
    """Save report to file."""
    # Ensure aggregated has proper structure
    if 'results' not in aggregated:
        aggregated = {'results': [], **aggregated}

    if format == 'json':
        content = format_json(aggregated)
    elif format == 'markdown':
        content = format_markdown(aggregated)
    elif format == 'github':
        content = format_github_annotations(aggregated)
    else:
        content = format_json(aggregated)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(content)


def main():
    """CLI entry point."""
    import argparse

    parser = argparse.ArgumentParser(description='Aggregate validation results')
    parser.add_argument('input', help='Input JSON file with results')
    parser.add_argument('--output', '-o', help='Output file')
    parser.add_argument('--format', '-f', choices=['json', 'markdown', 'github'],
                       default='json', help='Output format')

    args = parser.parse_args()

    # Load input
    with open(args.input) as f:
        data = json.load(f)

    # Handle both raw results list and wrapped results
    if isinstance(data, list):
        aggregated = aggregate_results(data)
    elif 'results' in data:
        aggregated = aggregate_results(data['results'])
        # Preserve other fields
        for key in data:
            if key != 'results' and key not in aggregated:
                aggregated[key] = data[key]
    else:
        aggregated = data

    # Output
    if args.format == 'json':
        output = format_json(aggregated)
    elif args.format == 'markdown':
        output = format_markdown(aggregated)
    elif args.format == 'github':
        output = format_github_annotations(aggregated)
    else:
        output = format_json(aggregated)

    if args.output:
        save_report(aggregated, args.output, format=args.format)
    else:
        print(output)


if __name__ == "__main__":
    main()
