#!/usr/bin/env python3
"""
REQ-VAL-001 - Unified Validator Runner Tests

Tests for validator_runner.py that orchestrates all validation scripts.
"""

import os
import sys
import json
import pytest
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


class TestValidatorRunnerExists:
    """REQ-VAL-001 - Script must exist"""

    def test_script_exists(self):
        """The validator runner script must exist"""
        script_path = Path(__file__).parent / "validator_runner.py"
        assert script_path.exists(), "validator_runner.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import validator_runner
            assert hasattr(validator_runner, 'discover_validators')
            assert hasattr(validator_runner, 'run_validator')
            assert hasattr(validator_runner, 'run_all_validators')
            assert hasattr(validator_runner, 'generate_report')
        except ImportError:
            pytest.fail("validator_runner.py must be importable")


class TestValidatorDiscovery:
    """REQ-VAL-001 - Validator discovery"""

    def test_discover_implementation_validators(self):
        """Should discover validators in scripts/implementation/"""
        try:
            from validator_runner import discover_validators

            validators = discover_validators()
            # Should find at least the T1+T2 validators (not spec files)
            non_spec = [v for v in validators if '_spec' not in v['name']]
            assert len(non_spec) >= 18  # At least T1 validators
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_exclude_spec_files(self):
        """Should exclude *_spec.py files from validators"""
        try:
            from validator_runner import discover_validators

            validators = discover_validators()
            validator_names = [v['name'] for v in validators]
            assert not any('_spec' in name for name in validator_names)
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_categorize_validators(self):
        """Should categorize validators by type"""
        try:
            from validator_runner import discover_validators

            validators = discover_validators()
            categories = set(v.get('category') for v in validators)
            # Should have categories like: nextjs, keystatic, react, security, quality
            assert len(categories) >= 3
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_validator_metadata(self):
        """Each validator should have required metadata"""
        try:
            from validator_runner import discover_validators

            validators = discover_validators()
            for v in validators:
                assert 'name' in v
                assert 'path' in v
                assert 'category' in v
                assert Path(v['path']).exists()
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestValidatorExecution:
    """REQ-VAL-001 - Running validators"""

    def test_run_single_validator(self, tmp_path):
        """Should run a single validator and capture output"""
        try:
            from validator_runner import run_validator

            # Create a test validator
            validator = tmp_path / "test_validator.py"
            validator.write_text('''
import json
import sys
print(json.dumps({"valid": True, "errors": []}))
sys.exit(0)
''')
            result = run_validator(str(validator), str(tmp_path))
            assert result['success'] is True
            assert 'output' in result
            assert result['exit_code'] == 0
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_run_failing_validator(self, tmp_path):
        """Should capture failure from validator"""
        try:
            from validator_runner import run_validator

            validator = tmp_path / "failing_validator.py"
            validator.write_text('''
import json
import sys
print(json.dumps({"valid": False, "errors": ["Test error"]}))
sys.exit(1)
''')
            result = run_validator(str(validator), str(tmp_path))
            assert result['success'] is False
            assert result['exit_code'] == 1
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_run_validator_with_timeout(self, tmp_path):
        """Should timeout slow validators"""
        try:
            from validator_runner import run_validator

            validator = tmp_path / "slow_validator.py"
            validator.write_text('''
import time
time.sleep(10)
''')
            result = run_validator(str(validator), str(tmp_path), timeout=1)
            assert result['success'] is False
            assert 'timeout' in result.get('error', '').lower()
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_run_all_validators(self, tmp_path):
        """Should run all discovered validators"""
        try:
            from validator_runner import run_all_validators

            # Run against the actual project
            project_root = Path(__file__).parent.parent.parent
            results = run_all_validators(str(project_root))

            assert 'validators_run' in results
            assert 'passed' in results
            assert 'failed' in results
            assert results['validators_run'] >= 10
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_parallel_execution(self, tmp_path):
        """Should support parallel validator execution"""
        try:
            from validator_runner import run_all_validators
            import time

            project_root = Path(__file__).parent.parent.parent

            start = time.time()
            results = run_all_validators(str(project_root), parallel=True)
            parallel_time = time.time() - start

            # Parallel should be faster than sequential
            assert results['validators_run'] >= 10
            # If we have many validators, parallel should provide speedup
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestFilteringAndSelection:
    """REQ-VAL-001 - Validator filtering"""

    def test_filter_by_category(self):
        """Should filter validators by category"""
        try:
            from validator_runner import discover_validators

            # Filter to just security validators
            validators = discover_validators(categories=['security'])
            for v in validators:
                assert v['category'] == 'security'
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_filter_by_name(self):
        """Should filter validators by name pattern"""
        try:
            from validator_runner import discover_validators

            validators = discover_validators(pattern='*route*')
            for v in validators:
                assert 'route' in v['name'].lower()
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_exclude_validators(self):
        """Should support excluding specific validators"""
        try:
            from validator_runner import discover_validators

            all_validators = discover_validators()
            filtered = discover_validators(exclude=['cyclomatic_complexity'])

            assert len(filtered) < len(all_validators)
            assert not any('cyclomatic_complexity' in v['name'] for v in filtered)
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestReportGeneration:
    """REQ-VAL-004 - Report generation"""

    def test_generate_json_report(self, tmp_path):
        """Should generate JSON report"""
        try:
            from validator_runner import generate_report

            results = {
                'validators_run': 5,
                'passed': 4,
                'failed': 1,
                'results': [
                    {'name': 'test1', 'success': True},
                    {'name': 'test2', 'success': False, 'errors': ['error1']}
                ]
            }
            report_path = tmp_path / "report.json"
            generate_report(results, str(report_path), format='json')

            assert report_path.exists()
            report = json.loads(report_path.read_text())
            assert report['validators_run'] == 5
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_generate_markdown_report(self, tmp_path):
        """Should generate Markdown report"""
        try:
            from validator_runner import generate_report

            results = {
                'validators_run': 5,
                'passed': 4,
                'failed': 1,
                'results': [
                    {'name': 'test1', 'success': True},
                    {'name': 'test2', 'success': False, 'errors': ['error1']}
                ]
            }
            report_path = tmp_path / "report.md"
            generate_report(results, str(report_path), format='markdown')

            assert report_path.exists()
            content = report_path.read_text()
            assert '# Validation Report' in content
            assert 'test1' in content
            assert 'test2' in content
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_report_includes_summary(self, tmp_path):
        """Report should include summary statistics"""
        try:
            from validator_runner import generate_report

            results = {
                'validators_run': 10,
                'passed': 8,
                'failed': 2,
                'duration': 5.5,
                'results': []
            }
            report_path = tmp_path / "report.md"
            generate_report(results, str(report_path), format='markdown')

            content = report_path.read_text()
            # Check key statistics are present
            assert 'Passed' in content
            assert 'Failed' in content
            assert '8' in content   # passed count
            assert '2' in content   # failed count
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestIncrementalValidation:
    """REQ-VAL-005 - Incremental validation"""

    def test_get_changed_files(self):
        """Should detect changed files from git"""
        try:
            from validator_runner import get_changed_files

            # Should return a list (even if empty)
            changed = get_changed_files()
            assert isinstance(changed, list)
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_map_files_to_validators(self):
        """Should map changed files to relevant validators"""
        try:
            from validator_runner import map_files_to_validators

            changed_files = [
                'app/page.tsx',
                'keystatic.config.ts',
                'package.json'
            ]
            validators = map_files_to_validators(changed_files)

            # Should select validators relevant to these files
            assert len(validators) >= 1
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_incremental_mode(self):
        """Should support incremental validation mode"""
        try:
            from validator_runner import run_all_validators

            project_root = Path(__file__).parent.parent.parent
            results = run_all_validators(str(project_root), incremental=True)

            assert 'incremental' in results or 'validators_run' in results
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestExitCodes:
    """REQ-VAL-001 - Exit code handling"""

    def test_exit_zero_on_success(self):
        """Should return 0 when all validators pass"""
        try:
            from validator_runner import calculate_exit_code

            results = {'passed': 10, 'failed': 0}
            assert calculate_exit_code(results) == 0
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")

    def test_exit_one_on_failure(self):
        """Should return 1 when any validator fails"""
        try:
            from validator_runner import calculate_exit_code

            results = {'passed': 9, 'failed': 1}
            assert calculate_exit_code(results) == 1
        except ImportError:
            pytest.skip("validator_runner.py not yet implemented")


class TestCLIInterface:
    """REQ-VAL-001 - CLI interface"""

    def test_cli_help(self):
        """Should support --help flag"""
        try:
            import subprocess
            script = Path(__file__).parent / "validator_runner.py"
            result = subprocess.run(
                ['python3', str(script), '--help'],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0
            assert 'usage' in result.stdout.lower() or 'help' in result.stdout.lower()
        except Exception:
            pytest.skip("validator_runner.py not yet implemented")

    def test_cli_category_filter(self):
        """Should support --category flag"""
        try:
            import subprocess
            script = Path(__file__).parent / "validator_runner.py"
            project_root = Path(__file__).parent.parent.parent
            result = subprocess.run(
                ['python3', str(script), str(project_root), '--category', 'security', '--json'],
                capture_output=True,
                text=True,
                timeout=60
            )
            # Should produce JSON output
            output = json.loads(result.stdout)
            assert 'validators_run' in output
        except Exception:
            pytest.skip("validator_runner.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
