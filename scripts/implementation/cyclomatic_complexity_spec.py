#!/usr/bin/env python3
"""
REQ-TEAM-004 - Cyclomatic Complexity Analyzer Tests

Tests for cyclomatic-complexity.py that analyzes function complexity.
Referenced by: pe-reviewer.md § Function Best Practices
"""

import os
import sys
import pytest
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))


class TestCyclomaticComplexityExists:
    """REQ-TEAM-004 - Script must exist"""

    def test_script_exists(self):
        """The cyclomatic complexity script must exist"""
        script_path = Path(__file__).parent / "cyclomatic_complexity.py"
        assert script_path.exists(), "cyclomatic_complexity.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import cyclomatic_complexity
            assert hasattr(cyclomatic_complexity, 'analyze_file')
            assert hasattr(cyclomatic_complexity, 'calculate_complexity')
        except ImportError:
            pytest.fail("cyclomatic_complexity.py must be importable")


class TestComplexityCalculation:
    """REQ-TEAM-004 - Complexity calculation"""

    def test_simple_function_low_complexity(self, tmp_path):
        """Simple function should have complexity of 1"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function simple() {
    return 42;
}
"""
            result = calculate_complexity(code, "typescript")
            assert result['functions'][0]['complexity'] == 1
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_if_statement_adds_complexity(self, tmp_path):
        """Each if adds 1 to complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withIf(x) {
    if (x > 0) {
        return 'positive';
    }
    return 'non-positive';
}
"""
            result = calculate_complexity(code, "typescript")
            assert result['functions'][0]['complexity'] == 2
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_nested_if_adds_complexity(self, tmp_path):
        """Nested if statements each add complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function nestedIf(x, y) {
    if (x > 0) {
        if (y > 0) {
            return 'both positive';
        }
        return 'x positive';
    }
    return 'x non-positive';
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + if x + if y = 3
            assert result['functions'][0]['complexity'] == 3
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_switch_case_complexity(self, tmp_path):
        """Each case in switch adds complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withSwitch(status) {
    switch (status) {
        case 'pending':
            return 1;
        case 'active':
            return 2;
        case 'done':
            return 3;
        default:
            return 0;
    }
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + 3 cases (default doesn't count) = 4
            assert result['functions'][0]['complexity'] == 4
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_logical_operators_add_complexity(self, tmp_path):
        """&& and || add complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withLogical(x, y, z) {
    if (x > 0 && y > 0 || z < 0) {
        return true;
    }
    return false;
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + if + && + || = 4
            assert result['functions'][0]['complexity'] == 4
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_ternary_adds_complexity(self, tmp_path):
        """Ternary operator adds complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withTernary(x) {
    return x > 0 ? 'positive' : 'non-positive';
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + ternary = 2
            assert result['functions'][0]['complexity'] == 2
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_loop_adds_complexity(self, tmp_path):
        """for/while loops add complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withLoop(items) {
    for (const item of items) {
        if (item.valid) {
            process(item);
        }
    }
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + for + if = 3
            assert result['functions'][0]['complexity'] == 3
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_catch_adds_complexity(self, tmp_path):
        """catch blocks add complexity"""
        try:
            from cyclomatic_complexity import calculate_complexity

            code = """
function withTryCatch() {
    try {
        riskyOperation();
    } catch (e) {
        handleError(e);
    }
}
"""
            result = calculate_complexity(code, "typescript")
            # Base 1 + catch = 2
            assert result['functions'][0]['complexity'] == 2
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")


class TestFileAnalysis:
    """REQ-TEAM-004 - File-level analysis"""

    def test_analyze_file_returns_all_functions(self, tmp_path):
        """analyze_file should return complexity for all functions"""
        try:
            from cyclomatic_complexity import analyze_file

            ts_file = tmp_path / "test.ts"
            ts_file.write_text("""
function simpleFunc() {
    return 1;
}

function mediumFunc(x) {
    if (x > 0) {
        return 'positive';
    }
    return 'other';
}

const arrowFunc = (y) => {
    if (y && y.valid) {
        return true;
    }
    return false;
};
""")
            result = analyze_file(str(ts_file))
            # Should find at least the named functions
            assert len(result['functions']) >= 3
            assert result['total_complexity'] >= 3
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_analyze_tsx_file(self, tmp_path):
        """Should handle TSX files with JSX"""
        try:
            from cyclomatic_complexity import analyze_file

            tsx_file = tmp_path / "component.tsx"
            tsx_file.write_text("""
export default function Component({ data }) {
    if (!data) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            {data.map(item => (
                <span key={item.id}>{item.name}</span>
            ))}
        </div>
    );
}
""")
            result = analyze_file(str(tsx_file))
            assert 'functions' in result
            # At least one function found with complexity >= 1
            assert len(result['functions']) >= 1
            assert result['total_complexity'] >= 1
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_high_complexity_warning(self, tmp_path):
        """Should flag functions with complexity > 10"""
        try:
            from cyclomatic_complexity import analyze_file

            ts_file = tmp_path / "complex.ts"
            ts_file.write_text("""
function veryComplex(a, b, c, d, e, f) {
    if (a > 0) {
        if (b > 0) {
            if (c > 0 && d > 0) {
                return 1;
            } else if (e > 0 || f > 0) {
                return 2;
            }
        } else {
            switch (c) {
                case 1: return 3;
                case 2: return 4;
                case 3: return 5;
            }
        }
    }
    return a && b ? c || d : e && f;
}
""")
            result = analyze_file(str(ts_file))
            assert result['functions'][0]['complexity'] > 10
            assert result['functions'][0]['warning'] is True
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")


class TestComplexityThresholds:
    """REQ-TEAM-004 - Complexity thresholds"""

    def test_threshold_classification(self):
        """Should classify complexity levels"""
        try:
            from cyclomatic_complexity import classify_complexity

            assert classify_complexity(1) == 'low'
            assert classify_complexity(5) == 'low'
            assert classify_complexity(6) == 'moderate'
            assert classify_complexity(10) == 'moderate'
            assert classify_complexity(11) == 'high'
            assert classify_complexity(20) == 'high'
            assert classify_complexity(21) == 'very_high'
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")


class TestProjectAnalysis:
    """REQ-TEAM-004 - Project-wide analysis"""

    def test_analyze_directory(self, tmp_path):
        """Should analyze all TS/TSX files in directory"""
        try:
            from cyclomatic_complexity import analyze_directory

            # Create test files
            (tmp_path / "a.ts").write_text("function a() { return 1; }")
            (tmp_path / "b.tsx").write_text("function b() { if (true) return 1; return 2; }")
            (tmp_path / "c.js").write_text("function c() { return 3; }")  # Should be skipped

            result = analyze_directory(str(tmp_path), extensions=['.ts', '.tsx'])
            assert len(result['files']) == 2
            assert 'average_complexity' in result
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")

    def test_analyze_bear_lake_camp_app(self):
        """Should analyze actual app directory"""
        try:
            from cyclomatic_complexity import analyze_directory

            project_root = Path(__file__).parent.parent.parent
            app_dir = project_root / "app"

            if app_dir.exists():
                result = analyze_directory(str(app_dir))
                assert 'files' in result
                assert 'average_complexity' in result
                assert 'high_complexity_functions' in result
        except ImportError:
            pytest.skip("cyclomatic_complexity.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
