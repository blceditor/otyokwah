#!/usr/bin/env python3
"""
TDD Tests for Keystatic Validator Scripts

REQ-TEAM-003: Keystatic specialist scripts
Tests for: field_type_checker, collection_sync_validator, schema_migration_planner,
           field_reference_validator, content_model_analyzer
"""

import pytest
import tempfile
import os
from pathlib import Path


# ============================================================================
# field_type_checker.py tests
# ============================================================================

class TestFieldTypeChecker:
    """Tests for field_type_checker.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "field_type_checker.py"
        assert script_path.exists(), "field_type_checker.py should exist"

    def test_detect_valid_field_types(self, tmp_path):
        """REQ-TEAM-003: Validate standard field types"""
        from field_type_checker import check_field_types

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
import { config, collection, fields } from '@keystatic/core';

export default config({
  collections: {
    pages: collection({
      schema: {
        title: fields.text({ label: 'Title' }),
        content: fields.document({ label: 'Content' }),
        image: fields.image({ label: 'Image' }),
      },
    }),
  },
});
""")

        result = check_field_types(str(schema_file))
        assert result['valid'] is True

    def test_detect_deprecated_field_type(self, tmp_path):
        """REQ-TEAM-003: Detect deprecated or invalid field types"""
        from field_type_checker import check_field_types

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
import { config, collection, fields } from '@keystatic/core';

export default config({
  collections: {
    pages: collection({
      schema: {
        title: fields.string({ label: 'Title' }),  // WRONG: should be fields.text
      },
    }),
  },
});
""")

        result = check_field_types(str(schema_file))
        assert result['valid'] is False
        assert any('string' in e.lower() for e in result['errors'])


# ============================================================================
# collection_sync_validator.py tests
# ============================================================================

class TestCollectionSyncValidator:
    """Tests for collection_sync_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "collection_sync_validator.py"
        assert script_path.exists(), "collection_sync_validator.py should exist"

    def test_detect_synced_content(self, tmp_path):
        """REQ-TEAM-003: Validate content matches schema"""
        from collection_sync_validator import validate_collection_sync

        # Create schema
        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  pages: collection({
    path: 'content/pages/*',
    schema: {
      title: fields.text({ label: 'Title' }),
    },
  }),
}
""")

        # Create matching content
        content_dir = tmp_path / "content" / "pages"
        content_dir.mkdir(parents=True)
        (content_dir / "home.mdoc").write_text("""---
title: "Home Page"
---
Content here
""")

        result = validate_collection_sync(str(tmp_path), str(schema_file))
        assert result['valid'] is True

    def test_detect_orphaned_content(self, tmp_path):
        """REQ-TEAM-003: Detect content files without schema definition"""
        from collection_sync_validator import validate_collection_sync

        # Create schema without 'posts' collection
        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  pages: collection({
    path: 'content/pages/*',
    schema: {},
  }),
}
""")

        # Create orphaned content
        posts_dir = tmp_path / "content" / "posts"
        posts_dir.mkdir(parents=True)
        (posts_dir / "orphan.mdoc").write_text("orphaned content")

        result = validate_collection_sync(str(tmp_path), str(schema_file))
        # Should warn about orphaned content
        assert len(result['warnings']) > 0


# ============================================================================
# schema_migration_planner.py tests
# ============================================================================

class TestSchemaMigrationPlanner:
    """Tests for schema_migration_planner.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "schema_migration_planner.py"
        assert script_path.exists(), "schema_migration_planner.py should exist"

    def test_detect_added_field(self, tmp_path):
        """REQ-TEAM-003: Detect added fields in schema"""
        from schema_migration_planner import plan_migration

        old_schema = tmp_path / "old.ts"
        old_schema.write_text("""
schema: {
  title: fields.text({ label: 'Title' }),
}
""")

        new_schema = tmp_path / "new.ts"
        new_schema.write_text("""
schema: {
  title: fields.text({ label: 'Title' }),
  description: fields.text({ label: 'Description' }),
}
""")

        result = plan_migration(str(old_schema), str(new_schema))
        assert 'description' in result['added_fields']
        assert result['breaking_changes'] == []

    def test_detect_removed_field(self, tmp_path):
        """REQ-TEAM-003: Detect removed fields as breaking change"""
        from schema_migration_planner import plan_migration

        old_schema = tmp_path / "old.ts"
        old_schema.write_text("""
schema: {
  title: fields.text({ label: 'Title' }),
  deprecated: fields.text({ label: 'Deprecated' }),
}
""")

        new_schema = tmp_path / "new.ts"
        new_schema.write_text("""
schema: {
  title: fields.text({ label: 'Title' }),
}
""")

        result = plan_migration(str(old_schema), str(new_schema))
        assert 'deprecated' in result['removed_fields']
        assert len(result['breaking_changes']) > 0


# ============================================================================
# field_reference_validator.py tests
# ============================================================================

class TestFieldReferenceValidator:
    """Tests for field_reference_validator.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "field_reference_validator.py"
        assert script_path.exists(), "field_reference_validator.py should exist"

    def test_detect_valid_references(self, tmp_path):
        """REQ-TEAM-003: Validate relationship references"""
        from field_reference_validator import validate_references

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  roles: collection({ schema: {} }),
  staff: collection({
    schema: {
      role: fields.relationship({
        collection: 'roles',
      }),
    },
  }),
}
""")

        result = validate_references(str(schema_file))
        assert result['valid'] is True

    def test_detect_invalid_reference(self, tmp_path):
        """REQ-TEAM-003: Detect reference to non-existent collection"""
        from field_reference_validator import validate_references

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  staff: collection({
    schema: {
      role: fields.relationship({
        collection: 'nonexistent',
      }),
    },
  }),
}
""")

        result = validate_references(str(schema_file))
        assert result['valid'] is False
        assert any('nonexistent' in e for e in result['errors'])


# ============================================================================
# content_model_analyzer.py tests
# ============================================================================

class TestContentModelAnalyzer:
    """Tests for content_model_analyzer.py"""

    def test_script_exists(self):
        """REQ-TEAM-003: Script file exists"""
        script_path = Path(__file__).parent / "content_model_analyzer.py"
        assert script_path.exists(), "content_model_analyzer.py should exist"

    def test_analyze_collections(self, tmp_path):
        """REQ-TEAM-003: Analyze collection structure"""
        from content_model_analyzer import analyze_content_model

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  pages: collection({
    schema: {
      title: fields.text({ label: 'Title' }),
      content: fields.document({ label: 'Content' }),
    },
  }),
  staff: collection({
    schema: {
      name: fields.text({ label: 'Name' }),
      bio: fields.text({ label: 'Bio', multiline: true }),
    },
  }),
}
""")

        result = analyze_content_model(str(schema_file))
        assert result['collection_count'] == 2
        assert 'pages' in result['collections']
        assert 'staff' in result['collections']

    def test_calculate_complexity(self, tmp_path):
        """REQ-TEAM-003: Calculate schema complexity metrics"""
        from content_model_analyzer import analyze_content_model

        schema_file = tmp_path / "keystatic.config.ts"
        schema_file.write_text("""
collections: {
  pages: collection({
    schema: {
      title: fields.text({ label: 'Title' }),
      templateFields: fields.conditional(
        fields.select({ options: [{value: 'a'}, {value: 'b'}] }),
        { a: fields.object({}), b: fields.object({}) }
      ),
    },
  }),
}
""")

        result = analyze_content_model(str(schema_file))
        assert 'complexity_score' in result
        assert result['complexity_score'] > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
