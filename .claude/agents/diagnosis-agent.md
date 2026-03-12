---
name: diagnosis-agent
description: Analyzes smoke test failures and identifies root cause with categorization and fix strategies
tools: Read, Grep, Glob
---

# Diagnosis Agent

## Critical Mission

Analyze smoke test JSON logs to diagnose production failures and categorize them for auto-fix or human intervention.

## Failure Categories

### HTTP Errors

| Status | Category | Keystatic-Related | Fix Strategy |
|--------|----------|-------------------|--------------|
| 404 | missing_route | Check URL pattern | check_route_config |
| 500 | server_error | Check logs | manual_investigation |
| 502/503 | infra_error | Vercel issue | wait_and_retry |

### Missing Components

| Error Pattern | Category | Keystatic-Related | Fix Strategy |
|---------------|----------|-------------------|--------------|
| `HeroCarousel` | missing_component | No | check_component_import |
| `PageEditingToolbar` | missing_component | Yes | check_keystatic_layout |
| `DeploymentStatus` | missing_component | Yes | check_component_import |
| `Gallery` | missing_component | No | check_component_import |

### Missing CSS Classes

| Error Pattern | Category | Fix Strategy |
|---------------|----------|--------------|
| `text-textured` | missing_class | add_css_class |
| `bg-textured` | missing_class | add_css_class |
| `gallery-grid` | missing_class | check_tailwind_config |

### CMS/Keystatic Errors

| Error Pattern | Category | Fix Strategy |
|---------------|----------|--------------|
| `heroImages missing` | cms_field | check_schema_config |
| `galleryImages missing` | cms_field | check_template_fields |
| `templateFields missing` | cms_config | check_keystatic_config |

### Render Errors

| Error Pattern | Category | Fix Strategy |
|---------------|----------|--------------|
| `Content too short` | render_error | check_data_fetching |
| `Missing <title>` | seo_error | check_metadata_config |

## Diagnosis Output Schema

```json
{
  "page": "/path",
  "error": "Error message",
  "category": "missing_component|missing_class|missing_route|render_error|seo_error|cms_field|cms_config",
  "isKeystaticRelated": true|false,
  "fixStrategy": "strategy_name",
  "confidence": 0.0-1.0,
  "targetFiles": ["path/to/file.tsx"],
  "suggestedFix": "Description of fix"
}
```

## Diagnosis Process

1. **Parse Log File**: Extract failures array from JSON log
2. **Pattern Match**: Match error messages to known patterns
3. **Categorize**: Assign category and Keystatic relation
4. **Map Fix Strategy**: Determine appropriate remediation
5. **Identify Target Files**: Find files that need modification
6. **Calculate Confidence**: Estimate likelihood of successful auto-fix

## Keystatic-Specific Detection

A failure is Keystatic-related if:
- URL contains `/keystatic`
- Error mentions `PageEditingToolbar`, `DeploymentStatus`, or `Keystatic`
- Error involves CMS fields (`heroImages`, `galleryImages`, `templateFields`)
- Page is `/keystatic/*` route

## Fix Strategy Definitions

| Strategy | Description | Safe for Auto-Fix |
|----------|-------------|-------------------|
| `add_css_class` | Add missing Tailwind class | Yes |
| `check_component_import` | Verify import statement | Yes (add only) |
| `check_keystatic_layout` | Check Keystatic wrapper | No (complex) |
| `check_route_config` | Verify route exists | No (manual) |
| `check_schema_config` | Verify keystatic.config.ts | No (schema change) |
| `check_data_fetching` | Debug data loading | No (manual) |
| `check_metadata_config` | Fix SEO metadata | Yes (simple cases) |
| `manual_investigation` | Requires human analysis | No |
| `wait_and_retry` | Transient error | No (auto-retry) |

## Collaboration

- Receives: Smoke test JSON log file path
- Outputs: Structured diagnosis for autofix-agent
- Escalates: Unknown patterns to human
