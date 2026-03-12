#!/usr/bin/env python3
"""
REQ-TEAM-002 - Pattern Library Validator Tests

Tests that all required pattern library files exist and contain expected sections.
"""

import os
import pytest
from pathlib import Path

# Base path for pattern libraries
BASE_PATH = Path(__file__).parent.parent.parent / ".claude" / "patterns"

# Required pattern libraries from REQ-TEAM-002
REQUIRED_PATTERNS = [
    ("nextjs", "app-router-patterns.md"),
    ("nextjs", "metadata-generation.md"),
    ("nextjs", "server-components-best-practices.md"),
    ("keystatic", "schema-design-patterns.md"),
    ("keystatic", "field-types-reference.md"),
    ("react", "server-client-components.md"),
    ("tailwind", "responsive-design-patterns.md"),
    ("accessibility", "wcag-compliance.md"),
]


class TestPatternLibraryExistence:
    """REQ-TEAM-002 - Pattern libraries must exist"""

    @pytest.mark.parametrize("domain,filename", REQUIRED_PATTERNS)
    def test_pattern_file_exists(self, domain: str, filename: str):
        """Each required pattern file must exist"""
        pattern_path = BASE_PATH / domain / filename
        assert pattern_path.exists(), f"Missing pattern: {domain}/{filename}"

    @pytest.mark.parametrize("domain,filename", REQUIRED_PATTERNS)
    def test_pattern_file_not_empty(self, domain: str, filename: str):
        """Each pattern file must have content"""
        pattern_path = BASE_PATH / domain / filename
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert len(content) > 100, f"Pattern {domain}/{filename} is too short"


class TestPatternLibraryStructure:
    """REQ-TEAM-002 - Pattern libraries must have required sections"""

    @pytest.mark.parametrize("domain,filename", REQUIRED_PATTERNS)
    def test_pattern_has_title(self, domain: str, filename: str):
        """Each pattern must start with a markdown title"""
        pattern_path = BASE_PATH / domain / filename
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert content.startswith("# "), f"Pattern {domain}/{filename} must start with '# '"

    @pytest.mark.parametrize("domain,filename", REQUIRED_PATTERNS)
    def test_pattern_has_checklist(self, domain: str, filename: str):
        """Each pattern should have a checklist section"""
        pattern_path = BASE_PATH / domain / filename
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "## Checklist" in content or "- [ ]" in content, \
                f"Pattern {domain}/{filename} should have a checklist"

    @pytest.mark.parametrize("domain,filename", REQUIRED_PATTERNS)
    def test_pattern_has_code_examples(self, domain: str, filename: str):
        """Each pattern should have code examples"""
        pattern_path = BASE_PATH / domain / filename
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "```" in content, f"Pattern {domain}/{filename} should have code examples"


class TestNextJSPatterns:
    """Next.js-specific pattern requirements"""

    def test_app_router_patterns_has_file_conventions(self):
        """App router patterns must document special files"""
        pattern_path = BASE_PATH / "nextjs" / "app-router-patterns.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "page.tsx" in content, "Must document page.tsx convention"
            assert "layout.tsx" in content, "Must document layout.tsx convention"

    def test_metadata_patterns_has_generateMetadata(self):
        """Metadata patterns must document generateMetadata"""
        pattern_path = BASE_PATH / "nextjs" / "metadata-generation.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "generateMetadata" in content, "Must document generateMetadata function"
            assert "OpenGraph" in content or "openGraph" in content, "Must document OpenGraph"

    def test_server_components_has_use_client(self):
        """Server components patterns must document 'use client' directive"""
        pattern_path = BASE_PATH / "nextjs" / "server-components-best-practices.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "'use client'" in content or '"use client"' in content, \
                "Must document 'use client' directive"


class TestKeystaticPatterns:
    """Keystatic-specific pattern requirements"""

    def test_schema_patterns_has_collection(self):
        """Schema patterns must document collection definition"""
        pattern_path = BASE_PATH / "keystatic" / "schema-design-patterns.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "collection(" in content, "Must show collection() usage"
            assert "fields." in content, "Must show fields usage"

    def test_field_types_has_all_common_types(self):
        """Field types reference must cover common types"""
        pattern_path = BASE_PATH / "keystatic" / "field-types-reference.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            required_types = ["fields.text", "fields.image", "fields.document", "fields.array"]
            for field_type in required_types:
                assert field_type in content, f"Must document {field_type}"


class TestReactPatterns:
    """React-specific pattern requirements"""

    def test_server_client_has_boundaries(self):
        """Server/Client patterns must explain boundaries"""
        pattern_path = BASE_PATH / "react" / "server-client-components.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "Server Component" in content, "Must explain Server Components"
            assert "Client Component" in content, "Must explain Client Components"


class TestTailwindPatterns:
    """Tailwind-specific pattern requirements"""

    def test_responsive_has_breakpoints(self):
        """Responsive patterns must document breakpoints"""
        pattern_path = BASE_PATH / "tailwind" / "responsive-design-patterns.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            breakpoints = ["sm:", "md:", "lg:", "xl:"]
            for bp in breakpoints:
                assert bp in content, f"Must document {bp} breakpoint"


class TestAccessibilityPatterns:
    """Accessibility-specific pattern requirements"""

    def test_wcag_has_aria(self):
        """WCAG patterns must document ARIA"""
        pattern_path = BASE_PATH / "accessibility" / "wcag-compliance.md"
        if pattern_path.exists():
            content = pattern_path.read_text()
            assert "aria-" in content, "Must document ARIA attributes"
            assert "alt" in content.lower(), "Must document alt text"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
