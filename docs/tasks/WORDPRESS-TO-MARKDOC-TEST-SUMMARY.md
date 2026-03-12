# WordPress to Markdoc Generation - Test Implementation Summary

> **Task**: Write comprehensive tests for enhanced page generation script
> **Requirement**: REQ-CONTENT-004
> **Status**: COMPLETE (TDD Red Phase)
> **Story Points**: 2 SP (test development)

---

## What Was Delivered

### Test File Created
**Location**: `/scripts/generate-from-wordpress.spec.ts`

**Lines of Code**: 622 lines

**Total Tests**: 30 comprehensive tests

**Current Status**: 24 failing (expected TDD state), 6 passing

---

## Test Coverage Breakdown

### 1. Template Classification Suite (10 tests)
Tests the mapping of WordPress page slugs to Keystatic template types.

**Coverage**:
- Homepage template (`home-2` → `homepage`)
- Staff template (`summer-staff` → `staff`)
- Facility templates (`chapel`, `dininghall`, `cabins`, `mac` → `facility`)
- Program templates (summer camps, retreats → `program`)
- Standard templates (`about`, `financial-partnerships` → `standard`)

**Test Pattern**:
```typescript
test('REQ-CONTENT-004 — classifies home-2 slug as homepage template', () => {
  const result = classifyPageTemplate('home-2', 'Home');
  expect(result.type).toBe('homepage');
  expect(result.discriminant).toBe('homepage');
});
```

---

### 2. Image Mapping Suite (2 tests)
Verifies that WordPress image URLs map to existing local files with 95%+ success rate.

**Current Baseline**:
- Success rate: 6.5% (needs 95%)
- Identifies unmapped images for enhancement
- Verifies mapped images exist in `/public/images/`

**Sample Unmapped Images**:
```
http://www.bearlakecamp.com/wp-content/uploads/2019/10/BLC-Logo-compass...
https://www.bearlakecamp.com/wp-content/uploads/2024/11/Jr.-High-145-scaled...
```

**Implementation Path**:
- Fuzzy filename matching (strip `-scaled`, `-e1731002421710` suffixes)
- Case-insensitive matching
- Multiple directory search

---

### 3. Template Field Extraction Suite (4 tests)
Tests extraction of template-specific fields from Elementor data.

**Tested Templates**:
| Template | Fields Validated | Test Status |
|----------|------------------|-------------|
| Homepage | `galleryImages[]`, CTA fields | FAILING (stub) |
| Program | `dates`, `pricing`, `registrationLink`, `ageRange` | FAILING (stub) |
| Facility | `capacity`, `amenities`, `galleryImages[]` | FAILING (stub) |
| Staff | `galleryImages[]`, CTA fields | FAILING (stub) |

**Acceptance Criteria**:
- All fields match Keystatic schema
- Dates with colons properly quoted
- Registration links preserved

---

### 4. YAML Quoting Suite (3 tests) ✅ PASSING
Tests proper YAML string escaping for special characters.

**Test Cases**:
1. **Dates with colons** ✅
   - Input: `Week 1: June 14-20, Week 2: June 21-27`
   - Output: `dates: "Week 1: June 14-20..."`

2. **Pricing with special chars** ✅
   - Input: `$350 per camper (early bird: $325 before May 1)`
   - Output: `pricing: "$350 per camper..."`

3. **Multiline text** ✅
   - Uses pipe syntax: `description: |`

---

### 5. CTA Link Preservation Suite (2 tests) ✅ PASSING
Validates that all call-to-action buttons from Elementor are extracted.

**Test Coverage**:
1. **Extract all CTA buttons** ✅
   - Validates button text and URL preservation
   - Ensures no empty values

2. **Preserve UltraCamp links** ✅
   - Validates registration URLs are valid
   - Ensures HTTPS links

---

### 6. Complete Page Generation Suite (6 tests)
Tests end-to-end page generation from WordPress XML to `.mdoc` files.

**18 Pages to Generate**:
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

**Test Validation**:
- Correct template assignment
- Hero image and tagline extraction
- Body content transformation
- Template-specific fields populated

---

### 7. Keystatic Schema Compatibility Suite (3 tests)
Validates generated pages match Keystatic field schema exactly.

**Validations**:
1. **Template discriminants** - Must be one of: `standard`, `homepage`, `program`, `facility`, `staff`
2. **Gallery image structure** - Each image has `image`, `alt`, `caption` fields
3. **CTA field completeness** - Homepage/staff pages have all CTA fields

---

## Test Quality Metrics

### Code Quality
- **TypeScript Strict Mode**: All tests pass `tsc --noEmit` ✅
- **Linting**: No ESLint warnings ✅
- **Best Practices**: Follows TDD test-writer agent guidelines ✅

### Test Structure
- **Arrange-Act-Assert Pattern**: Consistent across all tests ✅
- **Descriptive Names**: All tests prefixed with `REQ-CONTENT-004` ✅
- **Independent Tests**: No test depends on another ✅
- **Parameterized Inputs**: Uses named constants, not magic numbers ✅

### Coverage
- **All 18 pages covered**: Each expected output file has test ✅
- **All 5 templates covered**: Standard, homepage, program, facility, staff ✅
- **Edge cases**: YAML quoting, missing data, unmapped images ✅

---

## TDD Workflow Compliance

### Red Phase ✅ COMPLETE
- **24 tests failing** with "Not implemented" stubs
- **6 tests passing** (YAML quoting, CTA preservation)
- Tests define exact acceptance criteria for implementation

### Green Phase (Next: QCODE)
**Functions to Implement**:
1. `classifyPageTemplate(slug, title)` - Template classification logic
2. `extractTemplateFields(template, elementorData, content)` - Field extraction
3. `generateFromWordPress(xmlPath)` - Main generation pipeline
4. `generateYAML(page)` - YAML frontmatter serialization

**Implementation File**: `scripts/generate-from-wordpress.ts` (to be created)

### Refactor Phase (After Green)
- Optimize image mapping algorithm
- Extract reusable parsers
- Add logging and error handling

---

## Test Execution Results

### Initial Run
```bash
npm test -- scripts/generate-from-wordpress.spec.ts
```

**Output**:
- ✅ 6 tests passing
- ❌ 24 tests failing (expected - stubs not implemented)
- ⚠️  Image mapping at 6.5% (needs enhancement)

**No compilation errors** - TypeScript types are correct ✅

---

## Implementation Roadmap (3 SP)

### Phase 1: Core Functions (2 SP)
**File**: `scripts/generate-from-wordpress.ts`

| Function | Description | SP |
|----------|-------------|-----|
| `classifyPageTemplate()` | Map WordPress slugs to Keystatic templates | 0.3 |
| `extractTemplateFields()` | Parse Elementor data for template fields | 1.0 |
| `generateFromWordPress()` | Main generation pipeline | 0.5 |
| `generateYAML()` | YAML frontmatter serialization | 0.2 |

### Phase 2: Image Enhancement (1 SP)
**File**: `scripts/parsers/elementor-transformer.ts`

| Enhancement | Description | SP |
|-------------|-------------|-----|
| Fuzzy matching | Strip suffixes, case-insensitive | 0.5 |
| Directory expansion | Search all image subdirectories | 0.3 |
| Download fallback | Fetch unmapped images | 0.2 |

### Success Criteria
- **95% image mapping** (currently 6.5%)
- **All 30 tests passing** (currently 6/30)
- **All 18 pages generated** with valid YAML
- **TypeScript compilation** with no errors

---

## Files Created

1. **Test File**: `scripts/generate-from-wordpress.spec.ts` (622 lines)
2. **Test Plan**: `docs/tasks/wordpress-to-markdoc-test-plan.md`
3. **Summary**: `docs/tasks/WORDPRESS-TO-MARKDOC-TEST-SUMMARY.md` (this file)

---

## Related Documentation

- **Requirements**: `requirements/requirements.lock.md` (REQ-CONTENT-004)
- **Keystatic Schema**: `keystatic.config.ts`
- **Existing Parsers**:
  - `scripts/parsers/wordpress-xml-parser.ts`
  - `scripts/parsers/elementor-transformer.ts`
- **Agent Guidelines**: `.claude/agents/test-writer.md`

---

## Next Steps

### For Implementation Team (QCODE)
1. Read test file to understand requirements
2. Implement `classifyPageTemplate()` function
3. Implement `extractTemplateFields()` function
4. Implement `generateFromWordPress()` function
5. Enhance image mapping to achieve 95%+ success
6. Run tests until all 30 pass

### For Review Team (QCHECK)
1. Verify all tests pass
2. Check edge cases (missing data, invalid URLs)
3. Validate YAML output format
4. Confirm Keystatic can load generated files

### For Documentation Team (QDOC)
1. Document WordPress slug → template mapping
2. Create migration guide for content editors
3. Document image mapping strategy
4. Add troubleshooting guide for unmapped images

---

## Compliance Checklist

### TDD Requirements ✅
- [x] Tests written before implementation
- [x] At least 1 failing test per requirement
- [x] Tests cite REQ-CONTENT-004 in descriptions
- [x] Tests use Arrange-Act-Assert pattern

### Test Quality ✅
- [x] No magic numbers or unexplained literals
- [x] Tests can fail for real defects
- [x] Test descriptions match assertions
- [x] Independent expectations (not circular logic)
- [x] Same quality standards as production code

### Code Quality ✅
- [x] TypeScript strict mode passes
- [x] ESLint passes (no warnings)
- [x] Prettier formatted
- [x] No `any` types without justification

### Documentation ✅
- [x] Test plan document created
- [x] Coverage matrix documented
- [x] Story point estimates provided
- [x] Implementation roadmap defined

---

## Definition of Done

- [x] Test file created with 30 comprehensive tests
- [x] 24 tests failing with "Not implemented" (TDD red phase)
- [x] 6 tests passing (YAML quoting, CTA preservation)
- [x] TypeScript compilation succeeds
- [x] Test plan document created
- [x] Story point estimates documented
- [ ] Implementation passes all tests (Next: QCODE phase)
- [ ] Image mapping achieves 95%+ success rate (Next: QCODE phase)
- [ ] All 18 pages generated correctly (Next: QCODE phase)

---

**Delivered**: Comprehensive test suite for WordPress to Markdoc page generation
**Next Phase**: QCODE - Implement functions to pass failing tests
**Story Points**: 2 SP (test development) + 3 SP (implementation) = 5 SP total
