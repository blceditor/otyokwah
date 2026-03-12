# Requirements Lock: PageEditingToolbar Text Format Change

**Date**: 2025-12-02
**Task**: Change toolbar link text from page name to path format

---

## REQ-TOOLBAR-006: Display Path Format in Link Text

**Description**: The "View Live" link should display the page path (e.g., "/contact") instead of the formatted page name (e.g., "Contact").

**Acceptance Criteria**:
- Link text shows "View /slug Live" format
- Regular pages show "View /contact Live" (not "View Contact Live")
- Multi-word slugs show "View /summer-camp Live" (not "View Summer Camp Live")
- Home/index pages show "View / Live" (not "View Home Live")
- Production URL href remains correct (no change)
- Aria-label updated to reflect path format

**Non-Goals**:
- Changing the production URL generation logic
- Modifying DeploymentStatus component
- Changing toolbar styling or positioning

---

## REQ-TOOLBAR-007: Maintain Accessibility with New Format

**Description**: Ensure aria-label reflects the new path format and remains descriptive.

**Acceptance Criteria**:
- Aria-label includes path format (e.g., "View /contact page on production site")
- Screen readers can identify the link purpose
- No accessibility regressions

**Non-Goals**:
- Changing other accessibility attributes
- Modifying keyboard navigation

---

## Implementation Notes

**Current Implementation**:
```typescript
// Line 62 in PageEditingToolbar.tsx
View {pageName} Live
```

**New Implementation**:
```typescript
View /{slug === 'index' ? '' : slug} Live
```

**Current aria-label** (line 60):
```typescript
aria-label={`View ${pageName} page on production site`}
```

**New aria-label**:
```typescript
aria-label={`View /${slug === 'index' ? '' : slug} page on production site`}
```

---

## Test Coverage Matrix

| REQ-ID | Test File | Status |
|--------|-----------|--------|
| REQ-TOOLBAR-006 | PageEditingToolbar.spec.tsx | ❌ Pending (5 new tests) |
| REQ-TOOLBAR-007 | PageEditingToolbar.spec.tsx | ❌ Pending (2 new tests) |

**Total**: 7 new tests (0.2 SP test development)
