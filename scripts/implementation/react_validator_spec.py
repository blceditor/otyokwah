#!/usr/bin/env python3
"""
TDD Tests for React Validator Scripts

REQ-TEAM-003: React frontend specialist scripts
Tests for: component_isolator, client_component_detector, responsive_design_validator
"""

import pytest
import tempfile
import os
from pathlib import Path


# ============================================================================
# component_isolator.py tests
# ============================================================================

class TestComponentIsolator:
    """Tests for component_isolator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "component_isolator.py"
        assert script_path.exists(), "component_isolator.py should exist"

    def test_extract_component_imports(self, tmp_path):
        """REQ-TEAM-003: Extract component dependencies"""
        from component_isolator import isolate_component

        component_file = tmp_path / "StaffCard.tsx"
        component_file.write_text("""
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import type { Staff } from '@/types';

interface StaffCardProps {
  staff: Staff;
}

export function StaffCard({ staff }: StaffCardProps) {
  return (
    <Card>
      <Avatar src={staff.photo} />
      <h3>{staff.name}</h3>
    </Card>
  );
}
""")

        result = isolate_component(str(component_file))
        assert '@/components/ui/Card' in result['imports']
        assert '@/components/ui/Avatar' in result['imports']
        assert 'Staff' in result['types']

    def test_detect_component_props(self, tmp_path):
        """REQ-TEAM-003: Extract component props interface"""
        from component_isolator import isolate_component

        component_file = tmp_path / "Button.tsx"
        component_file.write_text("""
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}
""")

        result = isolate_component(str(component_file))
        assert result['props_interface'] == 'ButtonProps'
        assert 'label' in result['required_props']
        assert 'onClick' in result['required_props']
        assert 'variant' in result['optional_props']


# ============================================================================
# client_component_detector.py tests
# ============================================================================

class TestClientComponentDetector:
    """Tests for client_component_detector.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "client_component_detector.py"
        assert script_path.exists(), "client_component_detector.py should exist"

    def test_detect_use_client_directive(self, tmp_path):
        """REQ-TEAM-003: Detect 'use client' directive"""
        from client_component_detector import detect_client_components

        component_file = tmp_path / "Modal.tsx"
        component_file.write_text("""
'use client';

import { useState } from 'react';

export function Modal() {
  const [isOpen, setIsOpen] = useState(false);
  return <div>Modal</div>;
}
""")

        result = detect_client_components(str(component_file))
        assert result['is_client_component'] is True
        assert result['has_use_client_directive'] is True

    def test_detect_unnecessary_client_directive(self, tmp_path):
        """REQ-TEAM-003: Warn when 'use client' is unnecessary"""
        from client_component_detector import detect_client_components

        component_file = tmp_path / "StaticCard.tsx"
        component_file.write_text("""
'use client';

// No hooks or events - doesn't need to be client component
export function StaticCard({ title }: { title: string }) {
  return <div>{title}</div>;
}
""")

        result = detect_client_components(str(component_file))
        assert result['is_client_component'] is True
        # Should warn about unnecessary 'use client'
        assert len(result['warnings']) > 0, f"Expected warnings but got: {result}"
        assert any('unnecessar' in w.lower() for w in result['warnings']), f"No 'unnecessar' in: {result['warnings']}"

    def test_detect_missing_client_directive(self, tmp_path):
        """REQ-TEAM-003: Error when hooks used without 'use client'"""
        from client_component_detector import detect_client_components

        component_file = tmp_path / "Broken.tsx"
        component_file.write_text("""
import { useState } from 'react';

export function Broken() {
  const [count, setCount] = useState(0);  // ERROR: useState without 'use client'
  return <div>{count}</div>;
}
""")

        result = detect_client_components(str(component_file))
        assert result['valid'] is False
        assert any('use client' in e.lower() or 'usestate' in e.lower() for e in result['errors'])


# ============================================================================
# responsive_design_validator.py tests
# ============================================================================

class TestResponsiveDesignValidator:
    """Tests for responsive_design_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "responsive_design_validator.py"
        assert script_path.exists(), "responsive_design_validator.py should exist"

    def test_detect_mobile_first_pattern(self, tmp_path):
        """REQ-TEAM-003: Validate mobile-first responsive pattern"""
        from responsive_design_validator import validate_responsive

        component_file = tmp_path / "Grid.tsx"
        component_file.write_text("""
export function Grid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {/* Content */}
    </div>
  );
}
""")

        result = validate_responsive(str(component_file))
        assert result['valid'] is True
        assert result['is_mobile_first'] is True

    def test_detect_desktop_first_antipattern(self, tmp_path):
        """REQ-TEAM-003: Warn about desktop-first patterns"""
        from responsive_design_validator import validate_responsive

        component_file = tmp_path / "DesktopFirst.tsx"
        component_file.write_text("""
export function DesktopFirst() {
  return (
    <div className="grid-cols-3 sm:grid-cols-1">
      {/* Bad: starts with desktop (3 cols), then reduces for mobile */}
    </div>
  );
}
""")

        result = validate_responsive(str(component_file))
        # Should warn about desktop-first pattern
        assert len(result['warnings']) > 0

    def test_detect_breakpoint_coverage(self, tmp_path):
        """REQ-TEAM-003: Check breakpoint coverage"""
        from responsive_design_validator import validate_responsive

        component_file = tmp_path / "FullResponsive.tsx"
        component_file.write_text("""
export function FullResponsive() {
  return (
    <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
      Responsive text
    </div>
  );
}
""")

        result = validate_responsive(str(component_file))
        assert result['valid'] is True
        assert 'sm' in result['breakpoints_used']
        assert 'md' in result['breakpoints_used']
        assert 'lg' in result['breakpoints_used']
        assert 'xl' in result['breakpoints_used']


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
