# Test Plan: WordPress to Markdoc Page Generation

> **REQ-CONTENT-004**: Enhanced page generation script with complete content extraction
> **Story Points**: 5 SP (2 SP test development + 3 SP implementation)
> **Status**: RED (24/30 tests failing - expected TDD state)

---

## Test Coverage Summary

### Test File
`scripts/generate-from-wordpress.spec.ts`

### Total Tests: 30
- **Passing**: 6 (YAML quoting, CTA preservation, image verification)
- **Failing**: 24 (implementation stubs not yet written)

---

## Test Suites

### 1. Template Classification (10 tests)

Tests the `classifyPageTemplate()` function that maps WordPress page slugs to Keystatic template types.

| Test | Slug | Expected Template | Status |
|------|------|-------------------|--------|
| Homepage | `home-2` | `homepage` | FAILING |
| Staff page | `summer-staff` | `staff` | FAILING |
| Chapel | `chapel` | `facility` | FAILING |
| Dining hall | `dininghall` | `facility` | FAILING |
| Cabins | `cabins` | `facility` | FAILING |
| Recreation center | `mac` | `facility` | FAILING |
| Program pages | `summer-camp-junior-high` | `program` | FAILING |
| Retreats | `retreats-youth-groups` | `program` | FAILING |
| Give page | `financial-partnerships` | `standard` | FAILING |
| About page | `about` | `standard` | FAILING |

**Acceptance Criteria**:
- All WordPress page slugs correctly map to one of 5 Keystatic templates
- Template discriminant matches Keystatic config schema

---

### 2. Image Mapping Accuracy (2 tests)

Tests the image URL mapping from WordPress to local `/public/images/` directories.

| Test | Acceptance Criteria | Current Status |
|------|---------------------|----------------|
| 95%+ mapping success | Maps WordPress image URLs to existing local files | FAILING (6.5% success) |
| Verify file existence | All mapped images exist in `/public/images/` | PASSING |

**Current Issues**:
- Image mapping success rate: 6.5% (needs 95%)
- Many WordPress URLs not matching local filenames
- Need fuzzy matching logic for renamed files

**Sample Unmapped Images**:
```
http://www.bearlakecamp.com/wp-content/uploads/2019/10/BLC-Logo-compass-whiteletters-no-background-small.png
https://www.bearlakecamp.com/wp-content/uploads/2024/11/Jr.-High-145-scaled-e1731002421710.jpg
https://www.bearlakecamp.com/wp-content/uploads/2024/11/Jr.-Bible-study-9-scaled.jpg
```

---

### 3. Template Field Extraction (4 tests)

Tests the `extractTemplateFields()` function that pulls template-specific data from Elementor.

| Template | Fields to Extract | Status |
|----------|-------------------|--------|
| Homepage | `galleryImages[]`, `ctaHeading`, `ctaButtonText`, `ctaButtonLink` | FAILING |
| Program | `dates`, `pricing`, `registrationLink`, `ageRange`, `galleryImages[]` | FAILING |
| Facility | `capacity`, `amenities`, `galleryImages[]` | FAILING |
| Staff | `galleryImages[]`, `ctaHeading`, `ctaButtonText`, `ctaButtonLink` | FAILING |

**Acceptance Criteria**:
- All template fields match Keystatic schema
- Dates with colons properly quoted in YAML
- CTA links preserved from WordPress

---

### 4. YAML Quoting Correctness (3 tests)

Tests proper YAML string quoting for special characters.

| Test | Input | Expected Output | Status |
|------|-------|-----------------|--------|
| Dates with colons | `Week 1: June 14-20` | `dates: "Week 1: June 14-20"` | PASSING |
| Pricing with special chars | `$350 (early bird: $325)` | `pricing: "$350 (early bird: $325)"` | PASSING |
| Multiline text | Multi-line content | `description: \|` block syntax | PASSING |

**Acceptance Criteria**:
- All strings with colons, quotes, or special chars properly escaped
- YAML parsing succeeds without errors

---

### 5. CTA Link Preservation (2 tests)

Tests that all call-to-action buttons from Elementor are preserved.

| Test | Acceptance Criteria | Status |
|------|---------------------|--------|
| Extract all CTA buttons | Button text and URL preserved | PASSING |
| Preserve UltraCamp links | Registration links valid URLs | PASSING |

---

### 6. Complete Page Generation (6 tests)

Tests the main `generateFromWordPress()` function that produces all pages.

| Test | Expected Output | Status |
|------|-----------------|--------|
| Homepage generation | `index.mdoc` with homepage template | FAILING |
| Generate all 18 pages | All expected `.mdoc` files created | FAILING |
| Summer staff page | Positions and testimonials extracted | FAILING |
| Summer camp pages | Dates, pricing, registration links | FAILING |
| Facilities pages | Capacity and amenities | FAILING |
| Retreat pages | Program details and group info | FAILING |

**18 Expected Pages**:
1. `index.mdoc` (homepage)
2. `about.mdoc` (standard)
3. `contact.mdoc` (standard)
4. `summer-camp.mdoc` (standard)
5. `summer-camp-junior-high.mdoc` (program)
6. `summer-camp-senior-high.mdoc` (program)
7. `work-at-camp.mdoc` (standard)
8. `summer-staff.mdoc` (staff)
9. `work-at-camp-kitchen-staff.mdoc` (staff)
10. `retreats.mdoc` (standard)
11. `retreats-youth-groups.mdoc` (program)
12. `retreats-adult-retreats.mdoc` (program)
13. `facilities.mdoc` (standard)
14. `facilities-chapel.mdoc` (facility)
15. `facilities-dining-hall.mdoc` (facility)
16. `facilities-cabins.mdoc` (facility)
17. `facilities-rec-center.mdoc` (facility)
18. `give.mdoc` (standard)

---

### 7. Keystatic Schema Compatibility (3 tests)

Tests that generated pages match Keystatic field schema.

| Test | Acceptance Criteria | Status |
|------|---------------------|--------|
| Template discriminants | All discriminants valid (`standard`, `homepage`, `program`, `facility`, `staff`) | FAILING |
| Gallery image fields | All images have `image`, `alt`, `caption` | FAILING |
| CTA field structure | Homepage/staff pages have complete CTA fields | FAILING |

---

## Implementation Roadmap

### Phase 1: Core Functions (2 SP)
**File**: `scripts/generate-from-wordpress.ts`

1. **`classifyPageTemplate(slug, title)`** (0.3 SP)
   - Map WordPress slugs to Keystatic templates
   - Handle special cases (home-2 → homepage, chapel/dininghall → facility)

2. **`extractTemplateFields(template, elementorData, content)`** (1 SP)
   - Parse Elementor JSON for template-specific fields
   - Extract galleries, CTAs, dates, pricing, capacity, amenities
   - Handle missing data gracefully

3. **`generateFromWordPress(xmlPath)`** (0.5 SP)
   - Load and parse WordPress XML
   - Transform all pages to Keystatic format
   - Write `.mdoc` files with proper YAML frontmatter

4. **`generateYAML(page)`** (0.2 SP)
   - Convert page data to YAML frontmatter
   - Quote strings with special characters
   - Handle discriminated union fields

### Phase 2: Image Mapping Enhancement (1 SP)
**File**: `scripts/parsers/elementor-transformer.ts`

1. **Fuzzy filename matching** (0.5 SP)
   - Strip WordPress suffixes (`-scaled`, `-e1731002421710`)
   - Try multiple filename variations
   - Case-insensitive matching

2. **Expand search directories** (0.3 SP)
   - Check all subdirectories in `/public/images/`
   - Build filename index for fast lookup

3. **Image download fallback** (0.2 SP)
   - Download unmapped images if still hosted
   - Log missing images for manual review

### Phase 3: Content Enhancement (1 SP)

1. **Position extraction for staff pages** (0.3 SP)
   - Parse job positions from Elementor flip-box widgets
   - Structure as list with title + description

2. **Testimonial extraction** (0.3 SP)
   - Extract quotes and author info
   - Link to video URLs if present

3. **Date and pricing parsing** (0.2 SP)
   - Extract structured dates from program pages
   - Parse pricing with early bird discounts

4. **Capacity and amenities parsing** (0.2 SP)
   - Extract facility details from text content
   - Structure as comma-separated lists

---

## Story Point Breakdown

| Phase | Tasks | SP |
|-------|-------|-----|
| Test Development | Write 30 comprehensive tests | 2 |
| Core Functions | Template classification, field extraction, YAML generation | 2 |
| Image Mapping | Fuzzy matching, directory expansion | 1 |
| Content Enhancement | Positions, testimonials, structured data | 1 |
| **TOTAL** | | **6 SP** |

---

## Success Criteria

### Test Passing Threshold
- **Minimum**: 95% of tests passing (28/30)
- **Target**: 100% of tests passing (30/30)

### Image Mapping
- **Minimum**: 90% of images mapped to local files
- **Target**: 95%+ of images mapped to local files

### Page Generation
- **Required**: All 18 pages generated with correct templates
- **Required**: All template fields populated with valid data
- **Required**: YAML parsing succeeds without errors

### Quality Gates
- `npm run typecheck` passes
- `npm run lint` passes
- `npm test` passes (all tests green)
- Generated `.mdoc` files load correctly in Keystatic admin

---

## Dependencies

### Input Files
- `bearlakecamp-original/bearlakecamp.WordPress.2025-10-31.xml` (WordPress export)
- `/public/images/summer-program-and-general/*.jpg`
- `/public/images/staff/*.jpg`
- `/public/images/facilities/*.jpg`

### Libraries
- `fast-xml-parser` (WordPress XML parsing)
- `js-yaml` (YAML frontmatter generation)
- `fs`, `path` (file system operations)

### Related Files
- `scripts/parsers/wordpress-xml-parser.ts` (existing)
- `scripts/parsers/elementor-transformer.ts` (existing)
- `keystatic.config.ts` (schema reference)

---

## Test Execution

### Run All Tests
```bash
npm test -- scripts/generate-from-wordpress.spec.ts
```

### Run Specific Suite
```bash
npm test -- scripts/generate-from-wordpress.spec.ts -t "Template Classification"
```

### Watch Mode
```bash
npm test -- scripts/generate-from-wordpress.spec.ts --watch
```

---

## Next Steps

1. **QCODET Phase**: Implement core functions to pass failing tests
2. **Image Mapping**: Enhance fuzzy matching to achieve 95%+ success rate
3. **Content Extraction**: Parse Elementor data for positions, testimonials, structured fields
4. **QCHECK Phase**: Review implementation for quality and edge cases
5. **QDOC Phase**: Document WordPress-to-Keystatic mapping guide

---

## Related Documents

- `requirements/requirements.lock.md` (REQ-CONTENT-004)
- `keystatic.config.ts` (schema reference)
- `scripts/parsers/wordpress-xml-parser.spec.ts` (existing tests)
- `scripts/parsers/elementor-transformer.spec.ts` (existing tests)
