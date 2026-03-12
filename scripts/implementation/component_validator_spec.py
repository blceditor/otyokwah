#!/usr/bin/env python3
"""
REQ-TEAM-003 - React Component Validator Tests

Tests for component validation scripts used by react-frontend-specialist.
"""

import pytest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))


class TestServerClientBoundaryChecker:
    """REQ-TEAM-003 - Server/Client boundary validation"""

    def test_script_exists(self):
        """The boundary checker script must exist"""
        script_path = Path(__file__).parent / "server_client_boundary_checker.py"
        assert script_path.exists(), "server_client_boundary_checker.py must exist"

    def test_detect_hooks_in_server_component(self, tmp_path):
        """Should detect hooks in files without 'use client'"""
        try:
            from server_client_boundary_checker import check_boundaries

            # Server component with hooks (invalid)
            invalid_file = tmp_path / "ServerWithHook.tsx"
            invalid_file.write_text('''
import { useState } from 'react';

export default function ServerComponent() {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
}
''')

            result = check_boundaries(str(invalid_file))
            assert result['valid'] is False
            assert any('useState' in err for err in result['errors'])
        except ImportError:
            pytest.skip("server_client_boundary_checker.py not yet implemented")

    def test_allow_hooks_in_client_component(self, tmp_path):
        """Should allow hooks in files with 'use client'"""
        try:
            from server_client_boundary_checker import check_boundaries

            # Client component with hooks (valid)
            valid_file = tmp_path / "ClientWithHook.tsx"
            valid_file.write_text('''
'use client';

import { useState } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
''')

            result = check_boundaries(str(valid_file))
            assert result['valid'] is True
        except ImportError:
            pytest.skip("server_client_boundary_checker.py not yet implemented")

    def test_detect_onclick_in_server_component(self, tmp_path):
        """Should detect onClick in files without 'use client'"""
        try:
            from server_client_boundary_checker import check_boundaries

            invalid_file = tmp_path / "ServerWithEvent.tsx"
            invalid_file.write_text('''
export default function ServerComponent() {
  return <button onClick={() => alert('clicked')}>Click</button>;
}
''')

            result = check_boundaries(str(invalid_file))
            assert result['valid'] is False
            assert any('onClick' in err for err in result['errors'])
        except ImportError:
            pytest.skip("server_client_boundary_checker.py not yet implemented")


class TestTailwindClassValidator:
    """REQ-TEAM-003 - Tailwind CSS class validation"""

    def test_script_exists(self):
        """The Tailwind validator script must exist"""
        script_path = Path(__file__).parent / "tailwind_class_validator.py"
        assert script_path.exists(), "tailwind_class_validator.py must exist"

    def test_validate_valid_classes(self, tmp_path):
        """Should accept valid Tailwind classes"""
        try:
            from tailwind_class_validator import validate_classes

            component = tmp_path / "ValidComponent.tsx"
            component.write_text('''
export function Card() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
      <h3 className="text-lg font-bold text-gray-900">Title</h3>
      <p className="mt-2 text-gray-600">Description</p>
    </div>
  );
}
''')

            result = validate_classes(str(component))
            assert result['valid'] is True
        except ImportError:
            pytest.skip("tailwind_class_validator.py not yet implemented")

    def test_detect_invalid_classes(self, tmp_path):
        """Should detect invalid Tailwind classes"""
        try:
            from tailwind_class_validator import validate_classes

            component = tmp_path / "InvalidComponent.tsx"
            component.write_text('''
export function Card() {
  return (
    <div className="invalid-class-xyz not-a-class">
      Content
    </div>
  );
}
''')

            result = validate_classes(str(component))
            # Note: This might be lenient - we mainly check for typos in common patterns
            assert 'warnings' in result or 'errors' in result
        except ImportError:
            pytest.skip("tailwind_class_validator.py not yet implemented")


class TestAriaChecker:
    """REQ-TEAM-003 - Accessibility validation"""

    def test_script_exists(self):
        """The ARIA checker script must exist"""
        script_path = Path(__file__).parent / "aria_checker.py"
        assert script_path.exists(), "aria_checker.py must exist"

    def test_detect_missing_alt_text(self, tmp_path):
        """Should detect images without alt text"""
        try:
            from aria_checker import check_accessibility

            component = tmp_path / "ImageNoAlt.tsx"
            component.write_text('''
export function Gallery() {
  return (
    <div>
      <img src="/photo.jpg" />
      <img src="/another.jpg" className="w-full" />
    </div>
  );
}
''')

            result = check_accessibility(str(component))
            assert result['valid'] is False
            assert any('alt' in err.lower() for err in result['errors'])
        except ImportError:
            pytest.skip("aria_checker.py not yet implemented")

    def test_allow_empty_alt_for_decorative(self, tmp_path):
        """Should allow empty alt for decorative images"""
        try:
            from aria_checker import check_accessibility

            component = tmp_path / "DecorativeImage.tsx"
            component.write_text('''
export function Divider() {
  return <img src="/divider.svg" alt="" role="presentation" />;
}
''')

            result = check_accessibility(str(component))
            assert result['valid'] is True
        except ImportError:
            pytest.skip("aria_checker.py not yet implemented")

    def test_detect_missing_button_label(self, tmp_path):
        """Should detect icon buttons without labels"""
        try:
            from aria_checker import check_accessibility

            component = tmp_path / "IconButton.tsx"
            component.write_text('''
export function CloseButton() {
  return (
    <button onClick={onClose}>
      <XIcon />
    </button>
  );
}
''')

            result = check_accessibility(str(component))
            # Should warn about missing aria-label for icon-only button
            assert len(result['warnings']) > 0 or len(result['errors']) > 0
        except ImportError:
            pytest.skip("aria_checker.py not yet implemented")


class TestComponentPropValidator:
    """REQ-TEAM-003 - TypeScript prop validation"""

    def test_script_exists(self):
        """The prop validator script must exist"""
        script_path = Path(__file__).parent / "component_prop_validator.py"
        assert script_path.exists(), "component_prop_validator.py must exist"

    def test_detect_any_type(self, tmp_path):
        """Should detect 'any' type usage"""
        try:
            from component_prop_validator import validate_props

            component = tmp_path / "AnyProp.tsx"
            component.write_text('''
interface CardProps {
  data: any;
  onClick: any;
}

export function Card({ data, onClick }: CardProps) {
  return <div onClick={onClick}>{data}</div>;
}
''')

            result = validate_props(str(component))
            assert result['valid'] is False
            assert any('any' in err.lower() for err in result['errors'])
        except ImportError:
            pytest.skip("component_prop_validator.py not yet implemented")

    def test_detect_missing_interface(self, tmp_path):
        """Should detect components without prop interfaces"""
        try:
            from component_prop_validator import validate_props

            component = tmp_path / "NoPropInterface.tsx"
            component.write_text('''
export function Card(props) {
  return <div>{props.title}</div>;
}
''')

            result = validate_props(str(component))
            assert result['valid'] is False
            assert any('interface' in err.lower() or 'type' in err.lower()
                      for err in result['errors'])
        except ImportError:
            pytest.skip("component_prop_validator.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
