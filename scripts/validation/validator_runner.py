#!/usr/bin/env python3
"""
REQ-VAL-001 - Unified Validator Runner

Orchestrates all validation scripts from scripts/implementation/.
"""

import os
import sys
import json
import subprocess
import argparse
import fnmatch
import time
from pathlib import Path
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime


# Validator categories based on file name patterns
CATEGORY_PATTERNS = {
    'nextjs': ['next_route*', 'app_router*', 'metadata*', 'vercel*', 'isr*'],
    'keystatic': ['keystatic*', 'field_type*', 'field_reference*', 'collection*', 'schema_migration*', 'content_model*'],
    'react': ['server_client*', 'component_*', 'client_component*', 'responsive*'],
    'security': ['secret_scanner*', 'injection_detector*', 'auth_flow*'],
    'quality': ['cyclomatic_complexity*', 'dependency_risk*', 'tailwind*', 'aria*'],
}


def get_validator_category(name: str) -> str:
    """Determine category for a validator based on its name."""
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if fnmatch.fnmatch(name, pattern):
                return category
    return 'other'


def discover_validators(
    categories: Optional[List[str]] = None,
    pattern: Optional[str] = None,
    exclude: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """Discover all validators in scripts/implementation/."""
    validators = []
    script_dir = Path(__file__).parent.parent / "implementation"

    if not script_dir.exists():
        return validators

    for py_file in script_dir.glob("*.py"):
        name = py_file.stem

        # Skip spec files
        if name.endswith('_spec'):
            continue

        # Skip __init__ and similar
        if name.startswith('_'):
            continue

        category = get_validator_category(name)

        # Filter by category
        if categories and category not in categories:
            continue

        # Filter by pattern
        if pattern and not fnmatch.fnmatch(name, pattern):
            continue

        # Exclude specific validators
        if exclude and name in exclude:
            continue

        validators.append({
            'name': name,
            'path': str(py_file),
            'category': category
        })

    return validators


# Map validators to their expected arguments
VALIDATOR_ARGS = {
    'dependency_risk': lambda target: [Path(target) / 'package.json'] if Path(target).is_dir() else [target],
    'keystatic_schema_validator': lambda target: [Path(target) / 'keystatic.config.ts'] if Path(target).is_dir() else [target],
    'vercel_config_validator': lambda target: [Path(target) / 'vercel.json'] if Path(target).is_dir() else [target],
    'next_route_validator': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'app_router_pattern_checker': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'metadata_validator': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'isr_validator': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'server_client_boundary_checker': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'client_component_detector': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'tailwind_class_validator': lambda target: ['**/*.tsx'] if Path(target).is_dir() else [target],
    'aria_checker': lambda target: ['**/*.tsx'] if Path(target).is_dir() else [target],
    'component_prop_validator': lambda target: ['**/*.tsx'] if Path(target).is_dir() else [target],
    'responsive_design_validator': lambda target: ['**/*.tsx'] if Path(target).is_dir() else [target],
    'component_isolator': lambda target: ['**/*.tsx'] if Path(target).is_dir() else [target],
    'cyclomatic_complexity': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'secret_scanner': lambda target: [target],
    'injection_detector': lambda target: [Path(target) / 'app'] if Path(target).is_dir() else [target],
    'auth_flow_validator': lambda target: [target],
    'field_type_checker': lambda target: [Path(target) / 'keystatic.config.ts'] if Path(target).is_dir() else [target],
    'field_reference_validator': lambda target: [Path(target) / 'keystatic.config.ts'] if Path(target).is_dir() else [target],
    'collection_sync_validator': lambda target: [Path(target) / 'keystatic.config.ts'] if Path(target).is_dir() else [target],
    'content_model_analyzer': lambda target: [Path(target) / 'keystatic.config.ts'] if Path(target).is_dir() else [target],
}


def get_validator_args(validator_name: str, target_path: str) -> List[str]:
    """Get the appropriate arguments for a validator."""
    if validator_name in VALIDATOR_ARGS:
        args = VALIDATOR_ARGS[validator_name](target_path)
        return [str(a) for a in args]
    return [target_path]


def run_validator(
    validator_path: str,
    target_path: str,
    timeout: int = 60
) -> Dict[str, Any]:
    """Run a single validator and capture output."""
    validator_name = Path(validator_path).stem
    result = {
        'validator': validator_name,
        'path': validator_path,
        'success': False,
        'exit_code': -1,
        'output': '',
        'error': '',
        'duration': 0
    }

    # Skip validators that require special args we can't provide
    if validator_name == 'schema_migration_planner':
        result['success'] = True
        result['exit_code'] = 0
        result['output'] = '{"skipped": true, "reason": "Requires --old and --new args"}'
        return result

    start_time = time.time()
    args = get_validator_args(validator_name, target_path)

    # Check if required files exist
    for arg in args:
        if arg.endswith('.json') or arg.endswith('.ts') or arg.endswith('.tsx'):
            if not Path(arg).exists():
                result['success'] = True  # Skip gracefully
                result['exit_code'] = 0
                result['output'] = json.dumps({'skipped': True, 'reason': f'File not found: {arg}'})
                return result

    try:
        proc = subprocess.run(
            ['python3', validator_path] + args,
            capture_output=True,
            text=True,
            timeout=timeout
        )

        result['exit_code'] = proc.returncode
        result['success'] = proc.returncode == 0
        result['output'] = proc.stdout
        result['error'] = proc.stderr

        # Try to parse JSON output
        if proc.stdout.strip():
            try:
                result['parsed_output'] = json.loads(proc.stdout)
            except json.JSONDecodeError:
                pass

    except subprocess.TimeoutExpired:
        result['error'] = f'Timeout after {timeout} seconds'
        result['success'] = False
    except Exception as e:
        result['error'] = str(e)
        result['success'] = False

    result['duration'] = time.time() - start_time
    return result


def run_all_validators(
    target_path: str,
    categories: Optional[List[str]] = None,
    pattern: Optional[str] = None,
    exclude: Optional[List[str]] = None,
    parallel: bool = False,
    incremental: bool = False,
    timeout: int = 60
) -> Dict[str, Any]:
    """Run all discovered validators."""
    start_time = time.time()

    validators = discover_validators(
        categories=categories,
        pattern=pattern,
        exclude=exclude
    )

    # Incremental mode - filter validators based on changed files
    if incremental:
        changed_files = get_changed_files()
        if changed_files:
            relevant_validators = map_files_to_validators(changed_files)
            validators = [v for v in validators if v['name'] in relevant_validators]

    results = {
        'validators_run': 0,
        'passed': 0,
        'failed': 0,
        'skipped': 0,
        'results': [],
        'duration': 0,
        'incremental': incremental,
        'target': target_path
    }

    if parallel and len(validators) > 1:
        with ThreadPoolExecutor(max_workers=min(8, len(validators))) as executor:
            futures = {
                executor.submit(run_validator, v['path'], target_path, timeout): v
                for v in validators
            }
            for future in as_completed(futures):
                validator = futures[future]
                try:
                    result = future.result()
                    result['category'] = validator['category']
                    results['results'].append(result)
                except Exception as e:
                    results['results'].append({
                        'validator': validator['name'],
                        'success': False,
                        'error': str(e),
                        'category': validator['category']
                    })
    else:
        for validator in validators:
            result = run_validator(validator['path'], target_path, timeout)
            result['category'] = validator['category']
            results['results'].append(result)

    # Calculate summary
    results['validators_run'] = len(results['results'])
    results['passed'] = sum(1 for r in results['results'] if r.get('success'))
    results['failed'] = sum(1 for r in results['results'] if not r.get('success'))
    results['duration'] = time.time() - start_time

    return results


def get_changed_files() -> List[str]:
    """Get list of changed files from git."""
    try:
        # Get staged and unstaged changes
        result = subprocess.run(
            ['git', 'diff', '--name-only', 'HEAD'],
            capture_output=True,
            text=True
        )
        files = result.stdout.strip().split('\n') if result.stdout.strip() else []

        # Also get untracked files
        result2 = subprocess.run(
            ['git', 'ls-files', '--others', '--exclude-standard'],
            capture_output=True,
            text=True
        )
        untracked = result2.stdout.strip().split('\n') if result2.stdout.strip() else []

        return [f for f in files + untracked if f]
    except Exception:
        return []


def map_files_to_validators(changed_files: List[str]) -> List[str]:
    """Map changed files to relevant validators."""
    validators = set()

    for file in changed_files:
        file_lower = file.lower()

        # Map file patterns to validator names
        if 'app/' in file or 'page' in file_lower or 'route' in file_lower:
            validators.update(['next_route_validator', 'app_router_pattern_checker', 'metadata_validator'])

        if 'keystatic' in file_lower or 'content/' in file:
            validators.update(['keystatic_schema_validator', 'field_type_checker', 'field_reference_validator'])

        if file.endswith('.tsx') or file.endswith('.jsx'):
            validators.update(['server_client_boundary_checker', 'component_prop_validator', 'aria_checker'])

        if 'package.json' in file:
            validators.add('dependency_risk')

        if file.endswith('.ts') or file.endswith('.tsx'):
            validators.update(['cyclomatic_complexity', 'injection_detector', 'secret_scanner'])

        if 'middleware' in file_lower or 'auth' in file_lower:
            validators.add('auth_flow_validator')

    return list(validators)


def calculate_exit_code(results: Dict[str, Any]) -> int:
    """Calculate exit code based on results."""
    return 0 if results.get('failed', 0) == 0 else 1


def generate_report(
    results: Dict[str, Any],
    output_path: str,
    format: str = 'json'
) -> None:
    """Generate report file."""
    from report_aggregator import save_report
    save_report(results, output_path, format=format)


def main():
    """CLI entry point."""
    parser = argparse.ArgumentParser(
        description='Run all validation scripts',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument('target', nargs='?', default='.', help='Target directory to validate')
    parser.add_argument('--category', '-c', action='append', help='Filter by category')
    parser.add_argument('--pattern', '-p', help='Filter by name pattern')
    parser.add_argument('--exclude', '-e', action='append', help='Exclude validators')
    parser.add_argument('--parallel', action='store_true', help='Run validators in parallel')
    parser.add_argument('--incremental', '-i', action='store_true', help='Only validate changed files')
    parser.add_argument('--timeout', '-t', type=int, default=60, help='Timeout per validator (seconds)')
    parser.add_argument('--json', action='store_true', help='Output JSON format')
    parser.add_argument('--output', '-o', help='Output report to file')
    parser.add_argument('--list', '-l', action='store_true', help='List available validators')

    args = parser.parse_args()

    # List validators mode
    if args.list:
        validators = discover_validators()
        for v in validators:
            print(f"{v['name']} ({v['category']})")
        return 0

    # Run validators
    results = run_all_validators(
        target_path=args.target,
        categories=args.category,
        pattern=args.pattern,
        exclude=args.exclude,
        parallel=args.parallel,
        incremental=args.incremental,
        timeout=args.timeout
    )

    # Output results
    if args.json:
        print(json.dumps(results, indent=2, default=str))
    else:
        print(f"\nValidation Results")
        print(f"==================")
        print(f"Validators run: {results['validators_run']}")
        print(f"Passed: {results['passed']}")
        print(f"Failed: {results['failed']}")
        print(f"Duration: {results['duration']:.2f}s")
        print()

        if results['failed'] > 0:
            print("Failed validators:")
            for r in results['results']:
                if not r.get('success'):
                    print(f"  - {r['validator']}: {r.get('error', 'Unknown error')}")

    # Save report if requested
    if args.output:
        format_type = 'json' if args.output.endswith('.json') else 'markdown'
        generate_report(results, args.output, format=format_type)

    return calculate_exit_code(results)


if __name__ == "__main__":
    sys.exit(main())
