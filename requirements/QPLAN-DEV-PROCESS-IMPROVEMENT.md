# QPLAN: Development Process Improvement

**Date:** 2025-12-23
**Status:** AWAITING APPROVAL
**Total Estimate:** 12 SP (broken into phases)
**Triggering Issue:** Repeated failure to implement visual requirements despite multiple passes

---

## Problem Statement

Requirements from Updates-01 → Updates-02 → Updates-03 keep getting marked "complete" but failing user acceptance. Analysis by 4 parallel agents identified a **systematic gap** between code validation and visual validation.

### Evidence of Failure

From Updates-03.md:
- "The header size didn't change" - Code has `text-[3rem]` but still not rendered correctly
- "still centered" - Code has `text-left` but CSS specificity order is wrong
- "This didn't get updated" - Actually WAS updated (user had cached version)

### Root Cause (Consensus of 4 Agents)

**Visual verification is not enforced.** Tests check class presence, not rendered result.

---

## Proposed Changes

### Phase 1: Immediate Bug Fixes (1 SP)

**REQ-PROC-001: Fix CSS Class Ordering Bug**
- **File:** `components/content/GridSquare.tsx` line 81
- **Change:** Reorder `prose-headings:text-left` to come AFTER `prose-headings:text-inherit`
- **Rationale:** Tailwind rightmost utility wins; current order lets `text-inherit` override `text-left`
- **Acceptance:** Headers in production render left-aligned (verified via DevTools computed style)

**REQ-PROC-002: Verify Tailwind Arbitrary Value Compilation**
- **Action:** Check if `text-[3rem]` compiles into CSS bundle
- **Command:** `grep "text-\[3rem\]" .next/static/css/*.css`
- **Fallback:** Add to safelist if missing

### Phase 2: Visual Regression Testing (3 SP)

**REQ-PROC-003: Add Computed Style Assertions to Playwright Tests**
- **Location:** `tests/e2e/production/`
- **What:** Assert actual CSS computed values, not class presence
- **Example:**
  ```typescript
  test('session headers are 3rem and left-aligned', async ({ page }) => {
    const header = page.locator('h2#primary-overnight');
    const fontSize = await header.evaluate(el => getComputedStyle(el).fontSize);
    const textAlign = await header.evaluate(el => getComputedStyle(el).textAlign);
    expect(fontSize).toBe('48px'); // 3rem = 48px
    expect(textAlign).toBe('left');
  });
  ```
- **Acceptance:** Test fails if CSS doesn't render correctly, not just if class missing

**REQ-PROC-004: Screenshot Capture in QVERIFY**
- **Location:** Update `validation-specialist.md` and `scripts/post-commit-validate.sh`
- **What:** Capture production screenshots for each visual requirement
- **Store:** `verification-screenshots/REQ-{ID}-{timestamp}.png`
- **Acceptance:** Cannot call QGIT without screenshot evidence for visual changes

### Phase 3: Pattern Library Foundation (5 SP)

**REQ-PROC-005: Create Core Design Patterns**
- **Location:** `/lib/design-system/patterns/`
- **Patterns to Create:**
  1. `SessionHeaderPattern` - 3rem, white, left-aligned, line-height: 1
  2. `CTAButtonPattern` - Section-colored text, white background
  3. `GridSectionPattern` - Alternating image/content layout
  4. `SessionCardPattern` - bg-white/20 with bark titles
  5. `AnchorNavPattern` - Section jump navigation
- **Format:**
  ```typescript
  export const SessionHeaderPattern = {
    tailwind: 'text-[3rem] leading-none font-bold text-left text-white mb-2',
    validation: {
      requiredClasses: ['text-[3rem]', 'text-left'],
      forbiddenClasses: ['text-center', 'text-3xl'],
    },
  };
  ```
- **Acceptance:** Single source of truth for each pattern; no competing implementations

**REQ-PROC-006: Pattern Validation Script**
- **Location:** `scripts/validation/validate-patterns.ts`
- **What:** Scan production for pattern violations
- **Integration:** Runs in CI before deployment
- **Acceptance:** Build fails if pattern violated

### Phase 4: Workflow Updates (3 SP)

**REQ-PROC-007: Visual Checkpoint for CSS Changes**
- **Update to CLAUDE.md:** Visual changes require human checkpoint
- **Trigger:** File diff contains CSS/Tailwind patterns (text-, prose-, bg-, etc.)
- **Checkpoint:** Pause after implementation, capture screenshots, human approves
- **Acceptance:** No CSS change can be auto-deployed without screenshot approval

**REQ-PROC-008: Per-Requirement Verification in Lock File**
- **Update to:** `requirements/requirements.lock.md`
- **New Format:**
  ```markdown
  | REQ-ID | Description | SP | Tests | Screenshot | Production | Status |
  |--------|------------|-----|-------|------------|------------|--------|
  | REQ-U03-001 | Headers 3rem | 0.3 | ✅ | ✅ | ✅ | VERIFIED |
  ```
- **Acceptance:** Cannot mark requirement complete without all columns checked

**REQ-PROC-009: Reduce Requirements Batch Size**
- **Rule:** Max 5 SP per implementation phase
- **Rule:** Max 3 visual requirements per batch
- **Rule:** Verify each requirement BEFORE moving to next
- **Acceptance:** QPLAN splits large batches automatically

---

## Implementation Order

```
Phase 1 (Immediate - 1 SP)
  ├── REQ-PROC-001: Fix CSS ordering bug
  └── REQ-PROC-002: Verify Tailwind compilation

Phase 2 (This Week - 3 SP)
  ├── REQ-PROC-003: Computed style tests
  └── REQ-PROC-004: Screenshot capture

Phase 3 (Next Week - 5 SP)
  ├── REQ-PROC-005: Pattern library
  └── REQ-PROC-006: Validation script

Phase 4 (Following Week - 3 SP)
  ├── REQ-PROC-007: Visual checkpoint
  ├── REQ-PROC-008: Lock file update
  └── REQ-PROC-009: Batch size limits
```

---

## Success Metrics

**Before (Current State):**
- Requirements "complete" → User acceptance: ~60%
- Visual bugs found: In production (too late)
- Rework cycles: 3+ passes per feature

**After (Target State):**
- Requirements "complete" → User acceptance: 95%+
- Visual bugs found: In CI (before deployment)
- Rework cycles: 1 pass with visual verification

---

## Non-Goals

- **Not redesigning the entire workflow** - Incremental improvements only
- **Not adding new dependencies** - Use existing Playwright + TypeScript
- **Not creating Storybook** - Pattern library is TypeScript contracts, not visual docs (yet)

---

## Questions for User

1. **Phase 3 Priority:** Should pattern library be Phase 2 (earlier) if visual tests alone aren't enough?

2. **Human Checkpoint Scope:** Should ALL CSS changes require human approval, or only "significant" ones (>3 class changes)?

3. **Batch Size:** Is 5 SP / 3 visual requirements the right limit, or should it be smaller?

---

## Agent Position Memos (Full Analysis)

Detailed findings saved to:
- `docs/analysis/PE-DESIGNER-POSITION-MEMO-IMPLEMENTATION-GAPS.md` (Architecture gaps)
- `cos/SDE-III-IMPLEMENTATION-FAILURE-ANALYSIS.md` (Technical root cause)
- PM and Strategic Advisor findings included inline above

---

## Approval Requested

**Phase 1** is a **critical bug fix** and can proceed immediately.

**Phases 2-4** require your approval before implementation begins.

Please review and indicate which phases to proceed with.
