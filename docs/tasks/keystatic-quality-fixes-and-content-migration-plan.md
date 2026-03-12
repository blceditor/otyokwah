# Keystatic Quality Fixes + Real Content Migration Plan

**Created**: 2025-12-02
**Purpose**: Fix PE review issues + migrate WordPress content to Keystatic pages
**Scope**: Quality improvements (7.15 SP) + Content migration (TBD SP)

---

## Overview

This plan addresses two objectives:
1. **Fix quality issues** identified in PE review (P0, P1, P2)
2. **Migrate real content** from WordPress SQL/XML export into generated pages

### Data Sources

- **WordPress XML**: `/bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml` (Elementor page data)
- **WordPress SQL**: `/bearlakecamp-original/bearlakecamp_com.sql` (database dump)
- **Images**: `/public/images/` (organized by category)
- **Site Analysis**: `/docs/analysis/bear-lake-analysis.md` (31 pages inventory)

---

## Part 1: Quality Fixes (7.15 SP Total)

### Phase 1A: Critical P0 Fixes (1.6 SP)

**Must complete before any deployment**

#### P0-1: XSS Vulnerability Fix (0.5 SP)
**File**: `components/content/SplitContent.tsx:40`
**Issue**: `dangerouslySetInnerHTML` without sanitization

**Steps**:
1. Install DOMPurify: `npm install dompurify @types/dompurify`
2. Import and use in SplitContent component
3. Add test case verifying script tags stripped
4. Verify all Markdoc components safe from XSS

**Acceptance**:
- [ ] DOMPurify sanitizes all HTML before rendering
- [ ] Test passes: `<script>alert('xss')</script>` is stripped
- [ ] No console warnings about unsafe HTML

---

#### P0-2: Error Telemetry + Monitoring (0.8 SP)
**File**: `lib/keystatic/navigation.ts:96-130`
**Issue**: Silent failures mask CMS connectivity issues

**Steps**:
1. Create error telemetry utility: `lib/telemetry/error-reporter.ts`
2. Add structured error logging with severity levels
3. Differentiate recoverable vs fatal errors
4. Add retry logic with exponential backoff for transient failures
5. Create health check endpoint: `/api/health/keystatic`

**Acceptance**:
- [ ] Errors logged with context (error code, stack, timestamp)
- [ ] Retry 3x for network errors before fallback
- [ ] Health endpoint returns CMS connectivity status
- [ ] No silent failures in production

---

#### P0-3: Integration Smoke Tests (0.3 SP)
**File**: `tests/integration/keystatic-smoke.spec.ts` (new)
**Issue**: No integration tests for actual Keystatic operations

**Steps**:
1. Create smoke test suite with real Keystatic reader
2. Test pages collection can be listed
3. Test navigation singleton is readable
4. Test sample page can be created and read back
5. Add to CI pipeline (run after build)

**Acceptance**:
- [ ] 5 smoke tests pass against real Keystatic instance
- [ ] Tests verify actual file I/O, not mocks
- [ ] CI fails if Keystatic reader broken

---

### Phase 1B: Major P1 Fixes (2.3 SP)

#### P1-1: Extract Magic Numbers to Constants (0.2 SP)
**Files**: `components/markdoc/MarkdocComponents.tsx`, `scripts/generate-sample-pages.ts`

**Steps**:
1. Create `lib/constants/media.ts`:
   - `IMAGE_SIZES` (hero, gallery, thumbnail dimensions)
   - `CONTENT_CONFIG` (page counts, limits)
2. Replace all hardcoded numbers with named constants
3. Update tests to use same constants

**Acceptance**:
- [ ] No magic numbers in component files
- [ ] All dimensions referenced from constants
- [ ] Tests import and use same constants

---

#### P1-2: Replace Console with Logger (0.3 SP)
**Files**: Multiple (13 console statements)

**Steps**:
1. Create `lib/logger/index.ts` with structured logging
2. Support log levels: debug, info, warn, error
3. Replace all `console.log/warn/error` with logger
4. Add `--verbose` flag to CLI scripts
5. Filter debug logs in production (NODE_ENV check)

**Acceptance**:
- [ ] Zero console.* statements in production code
- [ ] Structured JSON logs with context
- [ ] Debug logs only appear with --verbose flag

---

#### P1-3: Input Validation for Components (0.5 SP)
**File**: `components/markdoc/MarkdocComponents.tsx`

**Steps**:
1. Add validation to YouTubeComponent (11-char alphanumeric ID)
2. Add URL validation to CTAComponent (valid href format)
3. Add image path validation (exists in public/images)
4. Return null or error component for invalid inputs
5. Add property-based tests for edge cases

**Acceptance**:
- [ ] Invalid YouTube IDs render nothing (no broken iframe)
- [ ] Invalid URLs logged as warnings
- [ ] Missing images show placeholder instead of 404

---

#### P1-4: Remove Hardcoded GitHub Credentials (0.2 SP)
**File**: `keystatic.config.ts:24-27`

**Steps**:
1. Remove fallback values for `GITHUB_OWNER` and `GITHUB_REPO`
2. Throw clear error if env vars missing
3. Add pre-deploy validation script
4. Update deployment docs with required env vars

**Acceptance**:
- [ ] Config throws error if GITHUB_OWNER undefined
- [ ] Deployment checklist includes env var setup
- [ ] No repository structure exposed in code

---

#### P1-5: Fix Navigation Init Race Condition (0.3 SP)
**File**: `lib/keystatic/navigation.ts:17-90`

**Steps**:
1. Use atomic file write pattern (write to temp, rename)
2. Add file locking with `proper-lockfile` library
3. Make truly idempotent with `wx` flag (write if not exists)
4. Add test for concurrent calls

**Acceptance**:
- [ ] Concurrent calls don't corrupt file
- [ ] File writes are atomic (no partial writes)
- [ ] Test spawns 10 concurrent initializations, all succeed

---

#### P1-6: Refactor Large generateYAML Function (0.8 SP)
**File**: `scripts/generate-sample-pages.ts:1130-1248`

**Steps**:
1. Extract template serializers:
   - `serializeHomepageFields()`
   - `serializeProgramFields()`
   - `serializeFacilityFields()`
   - `serializeStaffFields()`
2. Create main `generateYAML()` that delegates
3. Add unit tests for each serializer
4. Reduce cyclomatic complexity from 15 → 3

**Acceptance**:
- [ ] Each template has dedicated serializer function
- [ ] Main function ≤ 30 lines
- [ ] Each serializer has unit tests
- [ ] Cyclomatic complexity ≤ 5

---

### Phase 1C: Minor P2 Fixes (1.25 SP - Backlog)

- Enable TypeScript strict mode verification
- Add REQ-ID comments to interfaces
- Create branded types for domain objects
- Standardize error message format
- Add JSDoc to public API functions
- Fix page gen script concurrency safety
- Add accessibility ARIA labels
- Standardize import styles

*(P2 fixes deferred to backlog)*

---

## Part 2: Real Content Migration (Estimated 5-8 SP)

### Phase 2A: Content Parser Development (2 SP)

#### Task 2A-1: WordPress XML Parser
**File**: `scripts/parsers/wordpress-xml-parser.ts` (new)

**Purpose**: Extract content from Elementor JSON embedded in WordPress XML

**Steps**:
1. Install `fast-xml-parser`: `npm install fast-xml-parser`
2. Parse XML to find all `<item>` nodes with `<wp:post_type>page</wp:post_type>`
3. For each page, extract:
   - Title (from `<title>`)
   - Slug (from `<wp:post_name>`)
   - Content (from `<content:encoded>` or `<wp:postmeta>` with `_elementor_data`)
4. Parse Elementor JSON to extract:
   - Hero images
   - Headings and body text
   - Call-to-action buttons
   - Image galleries
   - Embedded content (maps, forms, videos)

**Output**: JSON array of PageContent objects

```typescript
interface PageContent {
  slug: string;
  title: string;
  excerpt?: string;
  heroImage?: string;
  sections: Section[];
}

interface Section {
  type: 'heading' | 'text' | 'image' | 'cta' | 'gallery' | 'video';
  content: Record<string, unknown>;
}
```

**Acceptance**:
- [ ] Parser extracts all 31 pages from XML
- [ ] Elementor JSON successfully decoded
- [ ] Structured content output matches schema
- [ ] Test suite with sample XML snippets

---

#### Task 2A-2: Image Path Mapper
**File**: `scripts/parsers/image-mapper.ts` (new)

**Purpose**: Map WordPress image URLs to local `/public/images/` paths

**Steps**:
1. Scan `/public/images/` and build index of available files
2. Extract WordPress URLs from content: `bearlakecamp.com/wp-content/uploads/...`
3. Match by filename (handle scaled/resized variants)
4. Create mapping table: WP URL → local path
5. Update all image references in parsed content

**Output**: Updated PageContent with local image paths

**Acceptance**:
- [ ] 95%+ of images successfully mapped
- [ ] Missing images logged as warnings with filename
- [ ] Mapping includes fallbacks for common patterns (scaled, resized)
- [ ] Test with known image sets

---

#### Task 2A-3: Content Template Classifier
**File**: `scripts/parsers/template-classifier.ts` (new)

**Purpose**: Determine which template each page should use

**Classification Rules**:
- **Homepage**: slug === 'home' or 'home-2'
- **Program**: slug matches 'summer-camp', 'defrost', 'recharge', 'anchored', 'breathe'
- **Facility**: slug matches 'cabins', 'chapel', 'dininghall', 'mac', 'outdoor'
- **Staff**: slug matches 'summer-staff', 'work-at-camp'
- **Standard**: everything else

**Output**: PageContent with `template` field

**Acceptance**:
- [ ] All 31 pages classified correctly
- [ ] Template-specific fields populated
- [ ] Validation warns if required fields missing

---

### Phase 2B: Content Generation (2 SP)

#### Task 2B-1: Update generate-sample-pages Script
**File**: `scripts/generate-sample-pages.ts`

**Changes**:
1. Import WordPress parser, image mapper, template classifier
2. Load and parse WordPress XML
3. For each parsed page:
   - Map template fields from parsed sections
   - Convert Elementor content to Markdoc format
   - Map images to local paths
   - Generate YAML frontmatter + Markdoc body
4. Write to `content/pages/{slug}.mdoc`

**Key Transformations**:
- Elementor headings → Markdoc headings
- Elementor text blocks → Markdoc paragraphs
- Elementor image widgets → `{% image %}` components
- Elementor buttons → `{% cta %}` components
- Elementor galleries → `{% gallery %}` components
- Elementor embedded content → appropriate components

**Acceptance**:
- [ ] Script generates 18 priority pages with real content
- [ ] All images use actual photos from `/public/images/`
- [ ] Text content extracted from WordPress
- [ ] Markdoc components used where appropriate
- [ ] Generated content passes Keystatic validation

---

#### Task 2B-2: Manual Content Review Checklist
**File**: `docs/tasks/content-review-checklist.md` (new)

**Purpose**: QA process for generated content

**Review Items**:
- [ ] **Homepage**: Hero text accurate, programs listed, images relevant
- [ ] **Summer Camp**: Dates, pricing, program descriptions match original
- [ ] **Facilities**: Photos correct for each building, descriptions accurate
- [ ] **Staff**: Headshots present, bios extracted, roles correct
- [ ] **Retreats**: Program types listed, contact info preserved
- [ ] **About**: Mission statement, history, leadership team
- [ ] **Contact**: Address, phone, email, map embed working
- [ ] **Give**: Donation info, Partners in Ministry content

For each page:
1. Compare side-by-side with original WordPress site
2. Verify all images display correctly
3. Check links are not broken
4. Validate dates and pricing current
5. Confirm contact information accurate

---

### Phase 2C: Content Enhancement (1-2 SP - Optional)

#### Task 2C-1: SEO Optimization
- Extract meta descriptions from WordPress
- Generate alt text for images without it
- Create OpenGraph tags for social sharing
- Add structured data (JSON-LD)

#### Task 2C-2: Accessibility Improvements
- Ensure all images have meaningful alt text
- Add ARIA labels to interactive elements
- Verify heading hierarchy (h1 → h2 → h3)
- Test keyboard navigation

#### Task 2C-3: Content Cleanup
- Fix broken links
- Update outdated information (dates, prices)
- Standardize formatting (headings, lists, spacing)
- Remove WordPress-specific shortcodes

---

## Implementation Phases

### Recommended Sequence

**Sprint 1: Critical Fixes (Week 1)**
- P0-1: XSS Fix (0.5 SP)
- P0-2: Error Telemetry (0.8 SP)
- P0-3: Smoke Tests (0.3 SP)
- **Total: 1.6 SP**

**Sprint 2: Major Fixes + Parser (Week 2)**
- P1-1 through P1-6 (2.3 SP)
- Task 2A-1: XML Parser (1 SP)
- Task 2A-2: Image Mapper (0.5 SP)
- Task 2A-3: Template Classifier (0.5 SP)
- **Total: 4.3 SP**

**Sprint 3: Content Migration (Week 3)**
- Task 2B-1: Update generation script (1.5 SP)
- Task 2B-2: Manual review checklist (0.5 SP)
- **Total: 2 SP**

**Sprint 4: Enhancement (Optional)**
- Task 2C-1, 2C-2, 2C-3: SEO/A11y/Cleanup (1-2 SP)

---

## Testing Strategy

### Unit Tests
- XML parser with sample Elementor JSON
- Image mapper with known file sets
- Template classifier with all page types
- Each quality fix has test coverage

### Integration Tests
- End-to-end content generation from WordPress export
- Keystatic smoke tests against real CMS
- Image resolution and path validation

### Manual Testing
- Side-by-side comparison with original site
- Visual QA of all generated pages
- Link checking and image verification

---

## Risk Mitigation

### Content Loss Risk
- **Risk**: Elementor JSON parsing fails, content not extracted
- **Mitigation**: Manual fallback for critical pages (homepage, summer camp, contact)
- **Test**: Parse XML in isolated script before integrating

### Image Missing Risk
- **Risk**: WordPress image URLs don't match local filenames
- **Mitigation**: Log all missing images, provide fallback placeholder
- **Test**: Image mapper reports 95%+ match rate

### Template Mismatch Risk
- **Risk**: Page classified to wrong template, fields missing
- **Mitigation**: Manual override list in config, validation warnings
- **Test**: Template classifier achieves 100% accuracy on known pages

---

## Success Criteria

### Quality Fixes
- [ ] All P0 issues resolved and deployed
- [ ] All P1 issues resolved and deployed
- [ ] PE review score improves from 78/100 to 90/100+
- [ ] Zero console pollution in production
- [ ] Integration tests passing in CI

### Content Migration
- [ ] 18 priority pages generated with real content
- [ ] 95%+ of images successfully mapped
- [ ] Zero broken links on generated pages
- [ ] Content passes manual QA review
- [ ] Side-by-side comparison shows fidelity to original

### Documentation
- [ ] Content review checklist completed
- [ ] Migration process documented
- [ ] Keystatic editing guide published (REQ-417)
- [ ] Known issues/limitations documented

---

## Appendix: Page Priority List

Based on traffic and importance, migrate in this order:

1. **Tier 1 (Must Have - Week 1)**:
   - Home (homepage template)
   - Summer Camp (program template)
   - Contact Us (standard template)
   - About (standard template)

2. **Tier 2 (High Priority - Week 2)**:
   - Retreats (program template)
   - Work at Camp (staff template)
   - Summer Staff (staff template)
   - Facilities pages: Chapel, Cabins, Dining Hall, MAC (facility template × 4)

3. **Tier 3 (Complete Site - Week 3)**:
   - Defrost, Recharge (program template)
   - Leaders in Training (program template)
   - Financial Partnerships (standard template)
   - Partners in Ministry (standard template)
   - Outdoor Spaces (facility template)
   - FAQ (standard template)
   - What to Bring (standard template)

**Total: 18 pages**

---

## Dependencies

### npm Packages (New)
```bash
npm install fast-xml-parser      # XML parsing
npm install dompurify             # XSS prevention
npm install @types/dompurify
npm install proper-lockfile       # File locking
```

### Existing Packages (Used)
- `@keystatic/core` - CMS reader
- `js-yaml` - YAML generation (for P1-2)
- `vitest` - Testing

---

## Estimated Timeline

- **Quality Fixes**: 2-3 weeks (7.15 SP)
- **Content Migration**: 2-3 weeks (5-8 SP)
- **Total**: 4-6 weeks (12-15 SP)

**Note**: Story points assume 0.5 SP/day velocity (1 SP = 1 full dev day)
