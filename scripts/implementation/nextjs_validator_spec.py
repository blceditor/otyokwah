#!/usr/bin/env python3
"""
TDD Tests for Next.js Validator Scripts

REQ-TEAM-003: Next.js specialist scripts
Tests for: app_router_pattern_checker, metadata_validator, vercel_config_validator, isr_validator
"""

import pytest
import tempfile
import os
from pathlib import Path


# ============================================================================
# app_router_pattern_checker.py tests
# ============================================================================

class TestAppRouterPatternChecker:
    """Tests for app_router_pattern_checker.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "app_router_pattern_checker.py"
        assert script_path.exists(), "app_router_pattern_checker.py should exist"

    def test_detect_async_page_component(self, tmp_path):
        """REQ-TEAM-003: Detect proper async Server Component pattern"""
        from app_router_pattern_checker import check_app_router_patterns

        page_file = tmp_path / "app" / "test" / "page.tsx"
        page_file.parent.mkdir(parents=True)
        page_file.write_text("""
export default async function TestPage() {
  const data = await fetch('/api/data');
  return <div>Test</div>;
}
""")

        result = check_app_router_patterns(str(tmp_path / "app"))
        assert result['valid'] is True

    def test_detect_client_directive_in_page(self, tmp_path):
        """REQ-TEAM-003: Warn when page.tsx uses 'use client'"""
        from app_router_pattern_checker import check_app_router_patterns

        page_file = tmp_path / "app" / "test" / "page.tsx"
        page_file.parent.mkdir(parents=True)
        page_file.write_text("""
'use client';

export default function TestPage() {
  return <div>Test</div>;
}
""")

        result = check_app_router_patterns(str(tmp_path / "app"))
        # Should warn - pages shouldn't typically be client components
        assert len(result['warnings']) > 0

    def test_detect_missing_async_with_await(self, tmp_path):
        """REQ-TEAM-003: Detect await without async"""
        from app_router_pattern_checker import check_app_router_patterns

        page_file = tmp_path / "app" / "test" / "page.tsx"
        page_file.parent.mkdir(parents=True)
        page_file.write_text("""
export default function TestPage() {
  const data = await fetch('/api/data'); // ERROR: await without async
  return <div>Test</div>;
}
""")

        result = check_app_router_patterns(str(tmp_path / "app"))
        assert result['valid'] is False
        assert any('await' in e.lower() or 'async' in e.lower() for e in result['errors'])


# ============================================================================
# metadata_validator.py tests
# ============================================================================

class TestMetadataValidator:
    """Tests for metadata_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "metadata_validator.py"
        assert script_path.exists(), "metadata_validator.py should exist"

    def test_detect_static_metadata(self, tmp_path):
        """REQ-TEAM-003: Detect valid static metadata export"""
        from metadata_validator import validate_metadata

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bear Lake Camp',
  description: 'Christian summer camp',
};

export default function Page() {
  return <div>Home</div>;
}
""")

        result = validate_metadata(str(page_file))
        assert result['valid'] is True
        assert result['has_title'] is True
        assert result['has_description'] is True

    def test_detect_dynamic_metadata(self, tmp_path):
        """REQ-TEAM-003: Detect valid generateMetadata function"""
        from metadata_validator import validate_metadata

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
import { Metadata } from 'next';

export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: params.slug,
    description: 'Dynamic page',
  };
}

export default function Page() {
  return <div>Page</div>;
}
""")

        result = validate_metadata(str(page_file))
        assert result['valid'] is True
        assert result['has_dynamic_metadata'] is True

    def test_detect_missing_metadata(self, tmp_path):
        """REQ-TEAM-003: Warn when page has no metadata"""
        from metadata_validator import validate_metadata

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
export default function Page() {
  return <div>No metadata here</div>;
}
""")

        result = validate_metadata(str(page_file))
        # Should warn - pages should have metadata for SEO
        assert len(result['warnings']) > 0

    def test_detect_metadata_in_client_component(self, tmp_path):
        """REQ-TEAM-003: Error when metadata exported from client component"""
        from metadata_validator import validate_metadata

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
'use client';

export const metadata = {
  title: 'This will not work',
};

export default function Page() {
  return <div>Client</div>;
}
""")

        result = validate_metadata(str(page_file))
        assert result['valid'] is False
        assert any('client' in e.lower() for e in result['errors'])


# ============================================================================
# vercel_config_validator.py tests
# ============================================================================

class TestVercelConfigValidator:
    """Tests for vercel_config_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "vercel_config_validator.py"
        assert script_path.exists(), "vercel_config_validator.py should exist"

    def test_validate_valid_config(self, tmp_path):
        """REQ-TEAM-003: Accept valid vercel.json"""
        from vercel_config_validator import validate_vercel_config

        config_file = tmp_path / "vercel.json"
        config_file.write_text("""{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}""")

        result = validate_vercel_config(str(config_file))
        assert result['valid'] is True

    def test_detect_invalid_json(self, tmp_path):
        """REQ-TEAM-003: Detect invalid JSON syntax"""
        from vercel_config_validator import validate_vercel_config

        config_file = tmp_path / "vercel.json"
        config_file.write_text("""{
  "framework": "nextjs",
  invalid json here
}""")

        result = validate_vercel_config(str(config_file))
        assert result['valid'] is False
        assert any('json' in e.lower() for e in result['errors'])

    def test_detect_invalid_redirects(self, tmp_path):
        """REQ-TEAM-003: Detect invalid redirect syntax"""
        from vercel_config_validator import validate_vercel_config

        config_file = tmp_path / "vercel.json"
        config_file.write_text("""{
  "framework": "nextjs",
  "redirects": [
    { "source": "/old", "destination": "/new" }
  ]
}""")

        # Missing 'permanent' field in redirect
        result = validate_vercel_config(str(config_file))
        # Should warn about missing permanent field
        assert len(result['warnings']) > 0 or result['valid'] is False


# ============================================================================
# isr_validator.py tests
# ============================================================================

class TestISRValidator:
    """Tests for isr_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "isr_validator.py"
        assert script_path.exists(), "isr_validator.py should exist"

    def test_detect_revalidate_export(self, tmp_path):
        """REQ-TEAM-003: Detect proper revalidate export"""
        from isr_validator import validate_isr

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
export const revalidate = 3600;

export default async function Page() {
  const data = await fetch('/api/data');
  return <div>ISR Page</div>;
}
""")

        result = validate_isr(str(page_file))
        assert result['valid'] is True
        assert result['revalidate_value'] == 3600

    def test_detect_missing_revalidate_with_fetch(self, tmp_path):
        """REQ-TEAM-003: Warn when dynamic page lacks revalidate"""
        from isr_validator import validate_isr

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
export default async function Page() {
  const data = await fetch('/api/data');
  return <div>Dynamic but no ISR</div>;
}
""")

        result = validate_isr(str(page_file))
        # Should warn - dynamic content without ISR means no caching
        assert len(result['warnings']) > 0

    def test_detect_dynamic_force(self, tmp_path):
        """REQ-TEAM-003: Detect force-dynamic export"""
        from isr_validator import validate_isr

        page_file = tmp_path / "page.tsx"
        page_file.write_text("""
export const dynamic = 'force-dynamic';

export default async function Page() {
  return <div>Always fresh</div>;
}
""")

        result = validate_isr(str(page_file))
        assert result['valid'] is True
        assert result['is_dynamic'] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
