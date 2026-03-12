#!/usr/bin/env python3
"""
REQ-TEAM-004 - Dependency Risk Analyzer

Assesses npm dependency vulnerability risks.
Used by: pe-reviewer.md § Dependencies, security-reviewer.md § Dependencies

Checks:
- Version pinning (exact vs ^/~)
- Known vulnerable packages
- Deprecated packages
- Supabase version consistency (per CLAUDE.md)
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Any, Optional


# Known deprecated packages
DEPRECATED_PACKAGES = {
    'request': 'Use axios, node-fetch, or got instead',
    'moment': 'Use dayjs, date-fns, or luxon instead',
    'uuid': 'Use crypto.randomUUID() in Node 14.17+',
    'colors': 'Use chalk instead',
    'node-uuid': 'Use uuid or crypto.randomUUID()',
    'gulp-util': 'Use individual packages instead',
}

# Known vulnerable version patterns (simplified - real scanner would use npm audit)
KNOWN_VULNERABILITIES = {
    'lodash': ['<4.17.21'],
    'axios': ['<0.21.1', '<0.21.2'],
    'minimist': ['<1.2.6'],
    'glob-parent': ['<5.1.2'],
    'trim-newlines': ['<3.0.1', '<4.0.1'],
    'path-parse': ['<1.0.7'],
    'ansi-regex': ['<5.0.1', '<6.0.1'],
}


def check_version_pinning(version: str) -> Dict[str, Any]:
    """Check if a version is properly pinned."""
    result = {
        'version': version,
        'pinned': False,
        'risk': 'low',
        'reason': ''
    }

    # Exact version (e.g., "2.50.2")
    if re.match(r'^\d+\.\d+\.\d+$', version):
        result['pinned'] = True
        result['risk'] = 'low'
        result['reason'] = 'Exact version pinned'
        return result

    # Caret (^) - allows minor updates
    if version.startswith('^'):
        result['risk'] = 'moderate'
        result['reason'] = 'Caret (^) allows minor version updates'
        return result

    # Tilde (~) - allows patch updates
    if version.startswith('~'):
        result['risk'] = 'moderate'
        result['reason'] = 'Tilde (~) allows patch version updates'
        return result

    # Star (*) or latest
    if version in ['*', 'latest']:
        result['risk'] = 'high'
        result['reason'] = f'{version} allows any version - very risky'
        return result

    # Git URLs
    if 'git' in version or 'github' in version:
        result['risk'] = 'high'
        result['reason'] = 'Git URL dependency - version not controlled'
        return result

    # Range (>=, >, etc.)
    if any(op in version for op in ['>=', '<=', '>', '<', '||']):
        result['risk'] = 'moderate'
        result['reason'] = 'Version range allows multiple versions'
        return result

    # Default case
    result['reason'] = 'Unknown version format'
    return result


def analyze_package_json(file_path: str) -> Dict[str, Any]:
    """Analyze package.json for dependency risks."""
    result = {
        'file': file_path,
        'dependencies': {},
        'devDependencies': {},
        'risk_summary': {
            'low': 0,
            'moderate': 0,
            'high': 0
        },
        'issues': []
    }

    try:
        content = json.loads(Path(file_path).read_text())

        # Analyze dependencies
        for dep, version in content.get('dependencies', {}).items():
            pin_result = check_version_pinning(version)
            result['dependencies'][dep] = {
                'version': version,
                **pin_result
            }
            result['risk_summary'][pin_result['risk']] += 1

        # Analyze devDependencies
        for dep, version in content.get('devDependencies', {}).items():
            pin_result = check_version_pinning(version)
            result['devDependencies'][dep] = {
                'version': version,
                **pin_result
            }
            # Don't count dev deps in risk summary as strictly

    except FileNotFoundError:
        result['error'] = f'File not found: {file_path}'
    except json.JSONDecodeError as e:
        result['error'] = f'Invalid JSON: {e}'

    return result


def check_version_consistency(versions: Dict[str, str]) -> Dict[str, Any]:
    """Check for version consistency across files."""
    result = {
        'consistent': True,
        'inconsistent_packages': {}
    }

    # Group versions by package name
    package_versions = {}
    for location, dep_string in versions.items():
        # Parse "@package/name@version" format
        match = re.match(r'@?([^@]+)@(.+)', dep_string)
        if match:
            pkg_name, version = match.groups()
            if pkg_name.startswith('/'):
                pkg_name = '@' + pkg_name[1:]
            if pkg_name not in package_versions:
                package_versions[pkg_name] = {}
            package_versions[pkg_name][location] = version

    # Check for inconsistencies
    for pkg_name, locations in package_versions.items():
        unique_versions = set(locations.values())
        if len(unique_versions) > 1:
            result['consistent'] = False
            result['inconsistent_packages'][pkg_name] = locations

    return result


def check_deprecated_packages(deps: Dict[str, str]) -> Dict[str, Any]:
    """Check for deprecated packages."""
    result = {
        'deprecated': {},
        'suggestions': {}
    }

    for pkg_name, version in deps.items():
        if pkg_name in DEPRECATED_PACKAGES:
            result['deprecated'][pkg_name] = version
            result['suggestions'][pkg_name] = DEPRECATED_PACKAGES[pkg_name]

    return result


def check_known_vulnerabilities(deps: Dict[str, str]) -> Dict[str, Any]:
    """Check for known vulnerable versions."""
    result = {
        'vulnerable': [],
        'safe': []
    }

    for pkg_name, version in deps.items():
        if pkg_name in KNOWN_VULNERABILITIES:
            # Simple version comparison (real implementation would use semver)
            clean_version = re.sub(r'^[\^~]', '', version)
            vulnerable_ranges = KNOWN_VULNERABILITIES[pkg_name]

            is_vulnerable = False
            for vuln_range in vulnerable_ranges:
                if vuln_range.startswith('<'):
                    vuln_version = vuln_range[1:]
                    # Very simplified comparison
                    if clean_version < vuln_version:
                        is_vulnerable = True
                        break

            if is_vulnerable:
                result['vulnerable'].append({
                    'package': pkg_name,
                    'version': version,
                    'vulnerable_range': vulnerable_ranges
                })
            else:
                result['safe'].append(pkg_name)
        else:
            result['safe'].append(pkg_name)

    return result


def check_supabase_pinning(file_path: str) -> Dict[str, Any]:
    """Check Supabase version pinning per CLAUDE.md requirements."""
    result = {
        'properly_pinned': True,
        'message': '',
        'current_version': None,
        'required_version': '2.50.2'
    }

    try:
        content = json.loads(Path(file_path).read_text())
        deps = content.get('dependencies', {})

        if '@supabase/supabase-js' in deps:
            version = deps['@supabase/supabase-js']
            result['current_version'] = version

            # Check if exact version
            if not re.match(r'^\d+\.\d+\.\d+$', version):
                result['properly_pinned'] = False
                result['message'] = 'Must use exact version (no ^ or ~) per CLAUDE.md'
            elif version != '2.50.2':
                result['properly_pinned'] = False
                result['message'] = f'Should use 2.50.2, found {version}'
            else:
                result['message'] = 'Supabase properly pinned to 2.50.2'
        else:
            result['message'] = 'Supabase not found in dependencies'

    except Exception as e:
        result['error'] = str(e)

    return result


def assess_risk(file_path: str) -> Dict[str, Any]:
    """Assess overall project dependency risk."""
    result = {
        'overall_risk': 'low',
        'recommendations': [],
        'analysis': {}
    }

    pkg_analysis = analyze_package_json(file_path)
    result['analysis'] = pkg_analysis

    # Gather all deps
    all_deps = {**pkg_analysis.get('dependencies', {})}
    dep_versions = {k: v.get('version', '') for k, v in all_deps.items() if isinstance(v, dict)}

    # Check deprecated
    deprecated = check_deprecated_packages(dep_versions)
    if deprecated['deprecated']:
        result['recommendations'].append(
            f"Replace deprecated packages: {', '.join(deprecated['deprecated'].keys())}"
        )

    # Check vulnerabilities
    vulnerabilities = check_known_vulnerabilities(dep_versions)
    if vulnerabilities['vulnerable']:
        result['overall_risk'] = 'high'
        for vuln in vulnerabilities['vulnerable']:
            result['recommendations'].append(
                f"Update {vuln['package']} - known vulnerabilities in {vuln['version']}"
            )

    # Check Supabase
    supabase = check_supabase_pinning(file_path)
    if not supabase.get('properly_pinned', True):
        result['recommendations'].append(
            f"Supabase: {supabase['message']}"
        )

    # Determine overall risk
    risk_counts = pkg_analysis.get('risk_summary', {})
    if risk_counts.get('high', 0) > 0:
        result['overall_risk'] = 'high'
    elif risk_counts.get('moderate', 0) > 2:
        result['overall_risk'] = 'moderate'

    return result


def main():
    """CLI entry point."""
    import sys

    if len(sys.argv) < 2:
        print("Usage: python dependency_risk.py <package.json>")
        sys.exit(1)

    file_path = sys.argv[1]
    result = assess_risk(file_path)

    print(json.dumps(result, indent=2))

    if result['overall_risk'] == 'high':
        sys.exit(1)


if __name__ == "__main__":
    main()
