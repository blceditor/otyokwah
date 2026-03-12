# Test Plan: REQ-004 Image Upload Validation

> **Story Points**: Test development 0.5 SP

## Test Coverage Matrix

| REQ-ID | Unit Tests | Integration Tests | E2E Tests | Status |
|--------|------------|-------------------|-----------|--------|
| REQ-004 | ✅ 12 tests | ⏳ Pending | ⏳ Pending | Failing (TDD Red Phase) |

## Unit Tests

### Image Validation Unit Tests (0.5 SP)
- **File**: `lib/validation/image-validator.spec.ts`
- **Story Points**: 0.5 SP
- **Test Count**: 12 tests
- **Coverage**: All acceptance criteria

### Test Cases

#### Core Validation Tests (8 tests)
1. **REQ-004 — accepts images under 5MB**
   - Validates files below size limit are accepted
   - Tests: file.size < 5MB → valid: true

2. **REQ-004 — rejects images over 5MB with error message**
   - Validates files above size limit are rejected
   - Tests: file.size > 5MB → valid: false, error defined

3. **REQ-004 — error message includes current size and limit**
   - Validates error messages are user-friendly
   - Tests: error contains both "6 MB" (current) and "5 MB" (limit)

4. **REQ-004 — extracts and displays image dimensions**
   - Validates dimension extraction from image metadata
   - Tests: validateImageFile returns { dimensions: { width, height } }

5. **REQ-004 — validates image file types (jpg, png, webp, avif)**
   - Validates allowed MIME types
   - Tests: image/jpeg, image/png, image/webp, image/avif → valid

6. **REQ-004 — rejects non-image files**
   - Validates rejection of non-image MIME types
   - Tests: application/pdf, text/plain, video/mp4 → invalid

7. **REQ-004 — handles corrupt image files gracefully**
   - Validates error handling for unreadable files
   - Tests: FileReader.onerror → valid: false, error defined

8. **REQ-004 — accepts exactly 5MB files (boundary test)**
   - Validates boundary condition at exact size limit
   - Tests: file.size === 5MB → valid: true

#### Utility Function Tests (4 tests)

9. **REQ-004 — recommends optimal sizes based on usage type**
   - Validates dimension recommendations per image type
   - Tests:
     - hero → 1920x1080
     - social → 1200x630
     - gallery → 1200x800
     - thumbnail → 400x300

10. **REQ-004 — formats file sizes for display**
    - Validates human-readable size formatting
    - Tests: bytes → "1 KB", "2.5 MB", "500 KB"

11. **REQ-004 — extracts dimensions from valid image file**
    - Validates Image API integration
    - Tests: Image.onload → { width, height }

12. **REQ-004 — handles image load errors when extracting dimensions**
    - Validates error handling for Image API failures
    - Tests: Image.onerror → Promise.reject

## Test Execution Strategy

### Phase 1: Unit Tests (Current - TDD Red Phase)
- ✅ **Created**: `lib/validation/image-validator.spec.ts`
- ✅ **Tests Written**: 12 comprehensive tests
- ✅ **All Failing**: Confirmed "Not implemented - TDD red phase"
- ⏳ **Next**: Implementation to make tests pass

### Phase 2: Integration Tests (Post-Implementation)
- **File**: `lib/validation/__integration__/keystatic-integration.spec.ts`
- **Scope**: Test integration with Keystatic image field component
- **Story Points**: 0.3 SP
- **Tests**:
  - Upload flow with validation
  - Error display in Keystatic UI
  - Dimension display after upload
  - File type filtering in file picker

### Phase 3: E2E Tests (Final Validation)
- **File**: `tests/e2e/image-upload.spec.ts`
- **Scope**: Full user flow in CMS
- **Story Points**: 0.5 SP
- **Tests**:
  - Upload oversized image → see error
  - Upload valid image → see dimensions
  - Drag-and-drop upload workflow
  - File picker upload workflow

## Test Implementation Details

### Mock Strategies

#### File Objects
```typescript
const createMockFile = (size: number, type: string, name: string): File => {
  const blob = new Blob(['x'.repeat(size)], { type });
  return new File([blob], name, { type });
};
```

#### FileReader API
```typescript
vi.spyOn(global, 'FileReader').mockImplementation(function() {
  // Mock readAsDataURL, onload, onerror
});
```

#### Image API
```typescript
vi.spyOn(global, 'Image').mockImplementation(function() {
  // Mock width, height, onload, onerror, src setter
});
```

### Test Data Constants

```typescript
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const INVALID_TYPES = ['application/pdf', 'text/plain', 'video/mp4'];
```

### Dimension Recommendations

| Image Type | Width | Height | Use Case |
|------------|-------|--------|----------|
| hero | 1920 | 1080 | Hero/banner images |
| social | 1200 | 630 | Open Graph/social share |
| gallery | 1200 | 800 | Photo galleries |
| thumbnail | 400 | 300 | Small previews |

## Success Criteria

### Test Quality Gates
- ✅ All tests cite REQ-004
- ✅ All tests use named constants (no magic numbers)
- ✅ All tests have clear Arrange-Act-Assert structure
- ✅ Mock strategies isolate unit under test
- ✅ Edge cases covered (boundary, corrupt files, wrong types)
- ✅ Error messages tested for user-friendliness

### Code Coverage Targets
- **Line Coverage**: >95%
- **Branch Coverage**: >90%
- **Function Coverage**: 100%

### TDD Validation
- ✅ **Red Phase**: All 12 tests failing with "Not implemented"
- ⏳ **Green Phase**: Implementation makes tests pass
- ⏳ **Refactor Phase**: Optimize without breaking tests

## Test Failure Summary

**Initial Run**: 2025-11-21
**Test File**: `lib/validation/image-validator.spec.ts`
**Result**: 12 tests | 12 failed ✅ (Expected TDD Red Phase)

```
× REQ-004 — accepts images under 5MB
× REQ-004 — rejects images over 5MB with error message
× REQ-004 — error message includes current size and limit
× REQ-004 — extracts and displays image dimensions
× REQ-004 — validates image file types (jpg, png, webp, avif)
× REQ-004 — rejects non-image files
× REQ-004 — handles corrupt image files gracefully
× REQ-004 — accepts exactly 5MB files (boundary test)
× REQ-004 — recommends optimal sizes based on usage type
× REQ-004 — formats file sizes for display
× REQ-004 — extracts dimensions from valid image file
× REQ-004 — handles image load errors when extracting dimensions
```

**Status**: ✅ Ready for implementation (TDD green phase)

## Next Steps

1. **QCODE**: Implement `lib/validation/image-validator.ts` functions
2. **Test Validation**: Run tests, verify all pass
3. **Integration**: Create Keystatic integration tests
4. **E2E**: Create end-to-end upload flow tests
5. **QCHECK**: Code quality review
6. **QDOC**: Update documentation

## References

- **Requirements**: `requirements/new-features.md` (REQ-004)
- **Test File**: `lib/validation/image-validator.spec.ts`
- **Implementation File**: `lib/validation/image-validator.ts` (placeholder)
- **Keystatic Config**: `keystatic.config.ts` (image field integration)
- **Planning Poker**: `docs/project/PLANNING-POKER.md`
