#!/usr/bin/env python3
"""
REQ-VAL-004 - Report Aggregator Tests

Tests for report_aggregator.py that combines validation results.
"""

import os
import sys
import json
import pytest
from pathlib import Path
from datetime import datetime

sys.path.insert(0, str(Path(__file__).parent))


class TestReportAggregatorExists:
    """REQ-VAL-004 - Script must exist"""

    def test_script_exists(self):
        """The report aggregator script must exist"""
        script_path = Path(__file__).parent / "report_aggregator.py"
        assert script_path.exists(), "report_aggregator.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import report_aggregator
            assert hasattr(report_aggregator, 'aggregate_results')
            assert hasattr(report_aggregator, 'format_json')
            assert hasattr(report_aggregator, 'format_markdown')
            assert hasattr(report_aggregator, 'format_github_annotations')
        except ImportError:
            pytest.fail("report_aggregator.py must be importable")


class TestResultAggregation:
    """REQ-VAL-004 - Result aggregation"""

    def test_aggregate_multiple_results(self):
        """Should aggregate results from multiple validators"""
        try:
            from report_aggregator import aggregate_results

            results = [
                {'name': 'validator1', 'success': True, 'issues': []},
                {'name': 'validator2', 'success': False, 'issues': [{'severity': 'high'}]},
                {'name': 'validator3', 'success': True, 'issues': [{'severity': 'low'}]}
            ]

            aggregated = aggregate_results(results)
            assert aggregated['total_validators'] == 3
            assert aggregated['passed'] == 2
            assert aggregated['failed'] == 1
            assert aggregated['total_issues'] >= 1
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_categorize_issues_by_severity(self):
        """Should categorize issues by severity"""
        try:
            from report_aggregator import aggregate_results

            results = [
                {'name': 'v1', 'success': False, 'issues': [
                    {'severity': 'critical', 'message': 'Critical issue'},
                    {'severity': 'high', 'message': 'High issue'},
                    {'severity': 'medium', 'message': 'Medium issue'},
                    {'severity': 'low', 'message': 'Low issue'}
                ]}
            ]

            aggregated = aggregate_results(results)
            assert aggregated['by_severity']['critical'] == 1
            assert aggregated['by_severity']['high'] == 1
            assert aggregated['by_severity']['medium'] == 1
            assert aggregated['by_severity']['low'] == 1
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_group_by_category(self):
        """Should group results by validator category"""
        try:
            from report_aggregator import aggregate_results

            results = [
                {'name': 'v1', 'category': 'security', 'success': True, 'issues': []},
                {'name': 'v2', 'category': 'security', 'success': False, 'issues': []},
                {'name': 'v3', 'category': 'quality', 'success': True, 'issues': []}
            ]

            aggregated = aggregate_results(results)
            assert 'security' in aggregated['by_category']
            assert 'quality' in aggregated['by_category']
            assert aggregated['by_category']['security']['total'] == 2
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")


class TestJSONFormat:
    """REQ-VAL-004 - JSON output format"""

    def test_format_json(self):
        """Should format results as JSON"""
        try:
            from report_aggregator import format_json

            aggregated = {
                'total_validators': 5,
                'passed': 4,
                'failed': 1,
                'results': []
            }

            output = format_json(aggregated)
            parsed = json.loads(output)
            assert parsed['total_validators'] == 5
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_json_includes_timestamp(self):
        """JSON output should include timestamp"""
        try:
            from report_aggregator import format_json

            aggregated = {'total_validators': 1, 'passed': 1, 'failed': 0}
            output = format_json(aggregated)
            parsed = json.loads(output)
            assert 'timestamp' in parsed or 'generated_at' in parsed
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")


class TestMarkdownFormat:
    """REQ-VAL-004 - Markdown output format"""

    def test_format_markdown_header(self):
        """Should format markdown with header"""
        try:
            from report_aggregator import format_markdown

            aggregated = {
                'total_validators': 5,
                'passed': 4,
                'failed': 1,
                'results': []
            }

            output = format_markdown(aggregated)
            assert '# Validation Report' in output
            assert '5' in output
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_format_markdown_summary_table(self):
        """Should include summary table"""
        try:
            from report_aggregator import format_markdown

            aggregated = {
                'total_validators': 10,
                'passed': 8,
                'failed': 2,
                'duration': 5.5,
                'results': []
            }

            output = format_markdown(aggregated)
            assert '|' in output  # Table formatting
            assert 'Passed' in output or 'passed' in output
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_format_markdown_issues_list(self):
        """Should list issues with file/line references"""
        try:
            from report_aggregator import format_markdown

            aggregated = {
                'total_validators': 1,
                'passed': 0,
                'failed': 1,
                'results': [
                    {
                        'name': 'test_validator',
                        'success': False,
                        'issues': [
                            {'file': 'test.ts', 'line': 10, 'message': 'Test issue', 'severity': 'high'}
                        ]
                    }
                ]
            }

            output = format_markdown(aggregated)
            assert 'test.ts' in output
            assert 'Test issue' in output
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")


class TestGitHubAnnotations:
    """REQ-VAL-004 - GitHub annotations format"""

    def test_format_github_annotations(self):
        """Should format as GitHub workflow annotations"""
        try:
            from report_aggregator import format_github_annotations

            aggregated = {
                'results': [
                    {
                        'name': 'test_validator',
                        'success': False,
                        'issues': [
                            {'file': 'app/page.tsx', 'line': 10, 'message': 'Error message', 'severity': 'high'}
                        ]
                    }
                ]
            }

            output = format_github_annotations(aggregated)
            # GitHub annotation format: ::error file=...,line=...::message
            assert '::error' in output or '::warning' in output
            assert 'app/page.tsx' in output
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_severity_mapping_to_github(self):
        """Should map severity to GitHub annotation level"""
        try:
            from report_aggregator import severity_to_github_level

            assert severity_to_github_level('critical') == 'error'
            assert severity_to_github_level('high') == 'error'
            assert severity_to_github_level('medium') == 'warning'
            assert severity_to_github_level('low') == 'notice'
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")


class TestSaveReport:
    """REQ-VAL-004 - Report saving"""

    def test_save_to_file(self, tmp_path):
        """Should save report to file"""
        try:
            from report_aggregator import save_report

            aggregated = {'total_validators': 1, 'passed': 1, 'failed': 0}
            report_path = tmp_path / "report.json"

            save_report(aggregated, str(report_path), format='json')
            assert report_path.exists()
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")

    def test_save_multiple_formats(self, tmp_path):
        """Should save in multiple formats"""
        try:
            from report_aggregator import save_report

            aggregated = {'total_validators': 1, 'passed': 1, 'failed': 0, 'results': []}

            save_report(aggregated, str(tmp_path / "report.json"), format='json')
            save_report(aggregated, str(tmp_path / "report.md"), format='markdown')

            assert (tmp_path / "report.json").exists()
            assert (tmp_path / "report.md").exists()
        except ImportError:
            pytest.skip("report_aggregator.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
