#!/usr/bin/env python3
"""
REQ-TEAM-003 - Next.js Route Validator Tests

Tests for the next-route-validator.py script that validates Next.js App Router structure.
"""

import os
import sys
import pytest
import tempfile
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))


class TestNextRouteValidatorExists:
    """REQ-TEAM-003 - Script must exist"""

    def test_script_exists(self):
        """The route validator script must exist"""
        script_path = Path(__file__).parent / "next_route_validator.py"
        assert script_path.exists(), "next_route_validator.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import next_route_validator
            assert hasattr(next_route_validator, 'validate_app_directory')
        except ImportError:
            pytest.fail("next_route_validator.py must be importable")


class TestRouteValidation:
    """REQ-TEAM-003 - Route structure validation"""

    @pytest.fixture
    def valid_app_structure(self, tmp_path):
        """Create a valid Next.js app structure"""
        app_dir = tmp_path / "app"
        app_dir.mkdir()

        # Root page
        (app_dir / "page.tsx").write_text("export default function Home() {}")

        # Root layout
        (app_dir / "layout.tsx").write_text("export default function RootLayout() {}")

        # Dynamic route
        slug_dir = app_dir / "[slug]"
        slug_dir.mkdir()
        (slug_dir / "page.tsx").write_text("export default function Page() {}")

        # API route
        api_dir = app_dir / "api" / "health"
        api_dir.mkdir(parents=True)
        (api_dir / "route.ts").write_text("export async function GET() {}")

        return app_dir

    @pytest.fixture
    def invalid_app_structure(self, tmp_path):
        """Create an invalid Next.js app structure"""
        app_dir = tmp_path / "app"
        app_dir.mkdir()

        # Directory without page.tsx
        about_dir = app_dir / "about"
        about_dir.mkdir()
        (about_dir / "AboutComponent.tsx").write_text("export function About() {}")

        return app_dir

    def test_validate_valid_structure(self, valid_app_structure):
        """Valid app structure should pass validation"""
        try:
            from next_route_validator import validate_app_directory
            result = validate_app_directory(str(valid_app_structure))
            assert result['valid'] is True
            assert len(result['errors']) == 0
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")

    def test_detect_missing_page(self, invalid_app_structure):
        """Should detect directories without page.tsx"""
        try:
            from next_route_validator import validate_app_directory
            result = validate_app_directory(str(invalid_app_structure))
            assert result['valid'] is False
            assert any('page.tsx' in err.lower() for err in result['errors'])
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")

    def test_validate_dynamic_route_syntax(self, tmp_path):
        """Should validate dynamic route bracket syntax"""
        try:
            from next_route_validator import validate_route_name
            assert validate_route_name("[slug]") is True
            assert validate_route_name("[...slug]") is True
            assert validate_route_name("[[...slug]]") is True
            assert validate_route_name("(group)") is True
            assert validate_route_name("invalid[route") is False
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")


class TestRouteFileValidation:
    """REQ-TEAM-003 - Individual file validation"""

    def test_page_tsx_required_export(self, tmp_path):
        """page.tsx must have default export"""
        try:
            from next_route_validator import validate_page_file

            # Valid page
            valid_page = tmp_path / "valid_page.tsx"
            valid_page.write_text("export default function Page() { return <div>Hello</div> }")
            assert validate_page_file(str(valid_page))['valid'] is True

            # Invalid - no default export
            invalid_page = tmp_path / "invalid_page.tsx"
            invalid_page.write_text("export function Page() { return <div>Hello</div> }")
            assert validate_page_file(str(invalid_page))['valid'] is False
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")

    def test_route_ts_http_methods(self, tmp_path):
        """route.ts must export HTTP methods"""
        try:
            from next_route_validator import validate_route_file

            # Valid route
            valid_route = tmp_path / "valid_route.ts"
            valid_route.write_text("""
export async function GET() { return Response.json({}) }
export async function POST() { return Response.json({}) }
""")
            assert validate_route_file(str(valid_route))['valid'] is True

            # Invalid - no HTTP methods
            invalid_route = tmp_path / "invalid_route.ts"
            invalid_route.write_text("const handler = () => {}")
            result = validate_route_file(str(invalid_route))
            assert result['valid'] is False
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")


class TestBearLakeCampRoutes:
    """REQ-TEAM-003 - Bear Lake Camp specific route validation"""

    def test_validate_existing_routes(self):
        """Should validate the actual app directory structure"""
        try:
            from next_route_validator import validate_app_directory

            # Find the actual app directory
            project_root = Path(__file__).parent.parent.parent
            app_dir = project_root / "app"

            if app_dir.exists():
                result = validate_app_directory(str(app_dir))
                # Should either pass or return specific errors
                assert 'valid' in result
                assert 'errors' in result
        except ImportError:
            pytest.skip("next_route_validator.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
