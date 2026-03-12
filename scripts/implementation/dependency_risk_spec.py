#!/usr/bin/env python3
"""
REQ-TEAM-004 - Dependency Risk Analyzer Tests

Tests for dependency-risk.py that assesses npm dependency vulnerability risks.
Referenced by: pe-reviewer.md § Dependencies, security-reviewer.md § Dependencies
"""

import os
import sys
import pytest
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


class TestDependencyRiskExists:
    """REQ-TEAM-004 - Script must exist"""

    def test_script_exists(self):
        """The dependency risk script must exist"""
        script_path = Path(__file__).parent / "dependency_risk.py"
        assert script_path.exists(), "dependency_risk.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import dependency_risk
            assert hasattr(dependency_risk, 'analyze_package_json')
            assert hasattr(dependency_risk, 'check_version_pinning')
            assert hasattr(dependency_risk, 'assess_risk')
        except ImportError:
            pytest.fail("dependency_risk.py must be importable")


class TestVersionPinning:
    """REQ-TEAM-004 - Version pinning validation"""

    def test_exact_version_is_safe(self):
        """Exact version pinning is safe"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("2.50.2")
            assert result['pinned'] is True
            assert result['risk'] == 'low'
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_caret_version_is_moderate_risk(self):
        """Caret versioning (^) allows minor updates"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("^2.50.2")
            assert result['pinned'] is False
            assert result['risk'] == 'moderate'
            assert 'allows minor' in result['reason'].lower()
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_tilde_version_is_moderate_risk(self):
        """Tilde versioning (~) allows patch updates"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("~2.50.2")
            assert result['pinned'] is False
            assert result['risk'] == 'moderate'
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_star_version_is_high_risk(self):
        """Star versioning (*) is high risk"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("*")
            assert result['pinned'] is False
            assert result['risk'] == 'high'
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_latest_tag_is_high_risk(self):
        """'latest' tag is high risk"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("latest")
            assert result['pinned'] is False
            assert result['risk'] == 'high'
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_git_url_is_high_risk(self):
        """Git URLs are high risk"""
        try:
            from dependency_risk import check_version_pinning

            result = check_version_pinning("git+https://github.com/foo/bar.git")
            assert result['risk'] == 'high'
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


class TestPackageJsonAnalysis:
    """REQ-TEAM-004 - Package.json analysis"""

    def test_analyze_dependencies(self, tmp_path):
        """Should analyze all dependencies"""
        try:
            from dependency_risk import analyze_package_json

            pkg = tmp_path / "package.json"
            pkg.write_text(json.dumps({
                "dependencies": {
                    "next": "14.2.3",
                    "react": "^18.2.0",
                    "lodash": "*"
                },
                "devDependencies": {
                    "typescript": "~5.0.0",
                    "eslint": "latest"
                }
            }))

            result = analyze_package_json(str(pkg))
            assert len(result['dependencies']) == 3
            assert len(result['devDependencies']) == 2
            assert result['risk_summary']['high'] >= 1  # lodash * is high risk
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_empty_dependencies(self, tmp_path):
        """Should handle empty dependencies"""
        try:
            from dependency_risk import analyze_package_json

            pkg = tmp_path / "package.json"
            pkg.write_text(json.dumps({
                "name": "test"
            }))

            result = analyze_package_json(str(pkg))
            assert result['dependencies'] == {}
            assert result['devDependencies'] == {}
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_version_consistency(self, tmp_path):
        """Should check for version consistency across files"""
        try:
            from dependency_risk import check_version_consistency

            # Simulate supabase version drift scenario
            versions = {
                "pkg1": "supabase/supabase-js@2.50.2",
                "pkg2": "supabase/supabase-js@2.51.0",
            }

            result = check_version_consistency(versions)
            assert result['consistent'] is False
            assert 'supabase/supabase-js' in result['inconsistent_packages']
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


class TestRiskAssessment:
    """REQ-TEAM-004 - Risk assessment logic"""

    def test_assess_overall_risk(self, tmp_path):
        """Should assess overall project risk"""
        try:
            from dependency_risk import assess_risk

            pkg = tmp_path / "package.json"
            pkg.write_text(json.dumps({
                "dependencies": {
                    "next": "14.2.3",
                    "react": "18.2.0",
                    "keystatic": "0.5.36"
                }
            }))

            result = assess_risk(str(pkg))
            assert 'overall_risk' in result
            assert 'recommendations' in result
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_deprecated_package_detection(self):
        """Should flag known deprecated packages"""
        try:
            from dependency_risk import check_deprecated_packages

            deps = {
                "request": "^2.88.0",  # deprecated
                "moment": "^2.29.0",   # deprecated (use dayjs/date-fns)
                "next": "14.2.3"       # not deprecated
            }

            result = check_deprecated_packages(deps)
            assert 'request' in result['deprecated']
            assert 'next' not in result['deprecated']
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


class TestSupabaseVersionCheck:
    """REQ-TEAM-004 - Supabase version check per CLAUDE.md"""

    def test_supabase_version_pinning(self, tmp_path):
        """Supabase must be pinned to exact version per CLAUDE.md"""
        try:
            from dependency_risk import check_supabase_pinning

            pkg = tmp_path / "package.json"
            pkg.write_text(json.dumps({
                "dependencies": {
                    "@supabase/supabase-js": "^2.50.2"
                }
            }))

            result = check_supabase_pinning(str(pkg))
            assert result['properly_pinned'] is False
            assert 'must use exact version' in result['message'].lower()
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")

    def test_supabase_correct_version(self, tmp_path):
        """Supabase at 2.50.2 should pass"""
        try:
            from dependency_risk import check_supabase_pinning

            pkg = tmp_path / "package.json"
            pkg.write_text(json.dumps({
                "dependencies": {
                    "@supabase/supabase-js": "2.50.2"
                }
            }))

            result = check_supabase_pinning(str(pkg))
            assert result['properly_pinned'] is True
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


class TestSecurityVulnerabilities:
    """REQ-TEAM-004 - Security vulnerability detection"""

    def test_known_vulnerable_patterns(self):
        """Should detect known vulnerable version patterns"""
        try:
            from dependency_risk import check_known_vulnerabilities

            deps = {
                "lodash": "4.17.11",  # Known vulnerable
                "axios": "0.21.0",    # Known vulnerable
                "next": "14.2.3"      # Safe
            }

            result = check_known_vulnerabilities(deps)
            assert len(result['vulnerable']) >= 1
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


class TestProjectAnalysis:
    """REQ-TEAM-004 - Analyze actual project"""

    def test_analyze_bear_lake_camp_deps(self):
        """Should analyze actual project package.json"""
        try:
            from dependency_risk import analyze_package_json

            project_root = Path(__file__).parent.parent.parent
            pkg_path = project_root / "package.json"

            if pkg_path.exists():
                result = analyze_package_json(str(pkg_path))
                assert 'dependencies' in result
                assert 'risk_summary' in result
        except ImportError:
            pytest.skip("dependency_risk.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
