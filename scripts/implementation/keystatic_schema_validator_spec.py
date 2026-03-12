#!/usr/bin/env python3
"""
REQ-TEAM-003 - Keystatic Schema Validator Tests

Tests for the keystatic-schema-validator.py script that validates Keystatic CMS schema.
"""

import pytest
import tempfile
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent))


class TestKeystaticSchemaValidatorExists:
    """REQ-TEAM-003 - Script must exist"""

    def test_script_exists(self):
        """The schema validator script must exist"""
        script_path = Path(__file__).parent / "keystatic_schema_validator.py"
        assert script_path.exists(), "keystatic_schema_validator.py must exist"

    def test_script_is_importable(self):
        """The script must be importable as a module"""
        try:
            import keystatic_schema_validator
            assert hasattr(keystatic_schema_validator, 'validate_schema')
        except ImportError:
            pytest.fail("keystatic_schema_validator.py must be importable")


class TestSchemaValidation:
    """REQ-TEAM-003 - Schema structure validation"""

    @pytest.fixture
    def valid_schema(self):
        """Valid Keystatic schema content"""
        return '''
import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  collections: {
    pages: collection({
      label: 'Pages',
      slugField: 'title',
      path: 'content/pages/*',
      schema: {
        title: fields.text({ label: 'Title' }),
        content: fields.document({ label: 'Content' }),
      },
    }),
  },
});
'''

    @pytest.fixture
    def invalid_schema_missing_collection(self):
        """Schema with missing collection definition"""
        return '''
import { config } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  // Missing collections
});
'''

    def test_validate_valid_schema(self, valid_schema, tmp_path):
        """Valid schema should pass validation"""
        try:
            from keystatic_schema_validator import validate_schema

            schema_file = tmp_path / "keystatic.config.ts"
            schema_file.write_text(valid_schema)

            result = validate_schema(str(schema_file))
            assert result['valid'] is True
            assert len(result['errors']) == 0
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")

    def test_detect_missing_collections(self, invalid_schema_missing_collection, tmp_path):
        """Should detect missing collections"""
        try:
            from keystatic_schema_validator import validate_schema

            schema_file = tmp_path / "keystatic.config.ts"
            schema_file.write_text(invalid_schema_missing_collection)

            result = validate_schema(str(schema_file))
            assert result['valid'] is False
            assert any('collection' in err.lower() for err in result['errors'])
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")


class TestFieldTypeValidation:
    """REQ-TEAM-003 - Field type checking"""

    def test_validate_field_types(self):
        """Should recognize all valid field types"""
        try:
            from keystatic_schema_validator import is_valid_field_type

            valid_types = [
                'fields.text',
                'fields.image',
                'fields.document',
                'fields.array',
                'fields.object',
                'fields.relationship',
                'fields.conditional',
                'fields.select',
                'fields.checkbox',
                'fields.date',
            ]

            for field_type in valid_types:
                assert is_valid_field_type(field_type), f"{field_type} should be valid"

            assert not is_valid_field_type('fields.invalid'), "fields.invalid should be invalid"
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")

    def test_detect_undefined_field_types(self, tmp_path):
        """Should detect undefined field types"""
        try:
            from keystatic_schema_validator import validate_schema

            schema_content = '''
import { config, collection, fields } from '@keystatic/core';

export default config({
  collections: {
    pages: collection({
      schema: {
        title: fields.text({ label: 'Title' }),
        invalid: fields.unknownType({ label: 'Invalid' }),
      },
    }),
  },
});
'''
            schema_file = tmp_path / "keystatic.config.ts"
            schema_file.write_text(schema_content)

            result = validate_schema(str(schema_file))
            assert result['valid'] is False
            assert any('unknownType' in err for err in result['errors'])
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")


class TestRelationshipValidation:
    """REQ-TEAM-003 - Relationship field validation"""

    def test_detect_invalid_relationship(self, tmp_path):
        """Should detect relationships to non-existent collections"""
        try:
            from keystatic_schema_validator import validate_schema

            schema_content = '''
import { config, collection, fields } from '@keystatic/core';

export default config({
  collections: {
    posts: collection({
      schema: {
        title: fields.text({ label: 'Title' }),
        category: fields.relationship({ collection: 'categories' }),
      },
    }),
    // Note: 'categories' collection is not defined!
  },
});
'''
            schema_file = tmp_path / "keystatic.config.ts"
            schema_file.write_text(schema_content)

            result = validate_schema(str(schema_file))
            assert result['valid'] is False
            assert any('categories' in err for err in result['errors'])
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")


class TestBearLakeCampSchema:
    """REQ-TEAM-003 - Bear Lake Camp specific schema validation"""

    def test_validate_existing_schema(self):
        """Should validate the actual keystatic.config.ts"""
        try:
            from keystatic_schema_validator import validate_schema

            project_root = Path(__file__).parent.parent.parent
            schema_file = project_root / "keystatic.config.ts"

            if schema_file.exists():
                result = validate_schema(str(schema_file))
                assert 'valid' in result
                assert 'errors' in result
                assert 'collections' in result
        except ImportError:
            pytest.skip("keystatic_schema_validator.py not yet implemented")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
