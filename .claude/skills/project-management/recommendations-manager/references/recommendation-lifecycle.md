# Recommendation Lifecycle Guide

> **Purpose**: Define how recommendations flow from capture to validation
> **Load when**: Establishing process, onboarding team members, or clarifying lifecycle status

## What Qualifies as a Recommendation?

### Recommendation vs. Requirement

**Recommendation**: Proposed improvement, enhancement, or change
- Not yet committed to implementation
- Requires approval and prioritization
- May be rejected or deferred
- Example: "Add video testimonials to homepage"

**Requirement**: Committed, formal specification
- Has REQ-ID and lives in `requirements/current.md`
- Locked in `requirements/requirements.lock.md` when work begins
- Tests reference REQ-IDs
- Example: "REQ-101: Homepage must display video testimonials with <3s load time"

**Transition**: Approved P0/P1 recommendations often become formal requirements when work begins.

### Recommendation vs. Task vs. Bug

**Recommendation**: Strategic suggestion for improvement
- "Add sticky mobile CTA" (not yet approved)

**Task**: Implementation work item
- "Implement sticky mobile CTA" (approved, in sprint)

**Bug**: Defect in existing functionality
- "Mobile CTA disappears on scroll" (regression)

**Rule of thumb**: If it's a new capability or change, it's a recommendation. If it's fixing broken existing behavior, it's a bug.

## Lifecycle States

### 1. Proposed
**Definition**: Newly captured, awaiting review

**Who sets**: Recommendations Manager (via `capture-recommendation.py`)

**What happens**:
- Recommendation appears in registry with `proposed` status
- Waits for stakeholder/team review
- May be categorized and prioritized

**Next steps**:
- Review in weekly planning meeting
- Move to `approved` or `rejected`

### 2. Approved
**Definition**: Stakeholders have agreed to implement

**Who sets**: Product owner, tech lead, or team consensus

**What happens**:
- Recommendation is blessed for implementation
- Gets effort estimate (story points)
- May be queued for upcoming sprint
- May be promoted to formal requirement (REQ-ID assigned)

**Next steps**:
- Add to sprint backlog
- Move to `in-progress` when work starts

### 3. In-Progress
**Definition**: Actively being implemented

**Who sets**: Developer starting work, or automatically during sprint start

**What happens**:
- Developer working on implementation
- May have associated branch, PR, or task
- Regular status updates expected

**Next steps**:
- Move to `implemented` when code merged

### 4. Implemented
**Definition**: Code merged to main branch

**Who sets**: Release manager (via `update-recommendation.py`)

**What happens**:
- Commit hash or PR number recorded in `implemented_in` field
- Code deployed to staging or production
- Ready for validation testing

**Next steps**:
- QA/stakeholder validates functionality
- Move to `validated` if working as intended

### 5. Validated
**Definition**: Verified working in production

**Who sets**: QA, product owner, or stakeholder

**What happens**:
- Functionality confirmed working
- User feedback positive (if applicable)
- Recommendation considered complete

**Next steps**:
- Archive to `recommendations-archive.md` (monthly cleanup)
- Include in release notes

### 6. Rejected
**Definition**: Explicitly declined, will not implement

**Who sets**: Product owner, tech lead, or stakeholder

**What happens**:
- `rejection_rationale` field populated with reason
- Recommendation marked as closed
- Preserved for historical record (why we chose NOT to do this)

**Reasons for rejection**:
- Technical constraints (not feasible)
- Strategic misalignment (doesn't support goals)
- Opportunity cost (better alternatives exist)
- Resource constraints (too expensive, not enough time)

**Next steps**:
- None; recommendation closed
- May be revisited if context changes

## State Transitions

### Valid Transitions

```
proposed → approved
proposed → rejected

approved → in-progress
approved → rejected

in-progress → implemented
in-progress → proposed (if blocked/paused)

implemented → validated
implemented → in-progress (if defect found)

rejected → proposed (if reconsidered)
```

### Invalid Transitions

```
proposed → implemented (skip approval)
approved → validated (skip implementation)
in-progress → rejected (should return to proposed first)
```

**Rule**: Don't skip states unless explicitly documented why.

## Source Attribution

### Source Types

**research**: From research briefs, competitive analysis, market studies
- Example: "Gen Z prefers video over text" → "Add video testimonials"

**user-feedback**: From user testing, surveys, support tickets
- Example: "Users couldn't find pricing" → "Add pricing to navigation"

**competitive-analysis**: From analyzing competitor websites/products
- Example: "Competitors use sticky CTAs" → "Add sticky mobile CTA"

**best-practice**: From design systems, frameworks, accessibility guidelines
- Example: "WCAG requires 4.5:1 contrast" → "Update color palette for accessibility"

**code-review**: From PR feedback, static analysis, quality audits
- Example: "Function has cyclomatic complexity 15" → "Refactor authentication logic"

**stakeholder-meeting**: From client meetings, planning sessions, ad-hoc discussions
- Example: "Client wants faster load times" → "Optimize image loading"

**testing**: From QA, integration tests, performance benchmarks
- Example: "Mobile load time 5s" → "Implement lazy loading"

**analytics**: From usage data, heat maps, conversion funnels
- Example: "80% bounce on pricing page" → "Simplify pricing table"

### Source Document Format

**File path**: `requirements/content-hosting/bearlakecamp/STRATEGIC-RESEARCH-BRIEF.md`

**Meeting identifier**: `stakeholder-meeting-2025-10-31`

**External link**: `https://example.com/article`

**Tool output**: `tools/cyclomatic-complexity.py output 2025-10-31`

**Rule**: Always provide source for audit trail. If multiple sources, list primary source.

## Impact Assessment

### High Impact
- Directly affects user conversion or revenue
- Addresses critical user pain point
- Improves core product value proposition
- Example: "Add video testimonials" (builds trust, increases conversions)

### Medium Impact
- Improves user experience moderately
- Enhances existing functionality
- Reduces technical debt
- Example: "Update color palette for accessibility" (better UX, not critical)

### Low Impact
- Minor polish or refinement
- Nice-to-have feature
- Incremental improvement
- Example: "Add animation to button hover state" (polish)

**Rule**: When in doubt, start with medium impact. Adjust after stakeholder discussion.

## Priority Framework

See `references/prioritization-framework.md` for detailed P0/P1/P2 decision criteria.

**Quick reference**:
- **P0**: Critical path blocker, high-risk security/performance issue
- **P1**: High impact, aligns with goals, feasible effort
- **P2**: Nice-to-have, low urgency, high effort, or speculative

## Integration with Requirements

### When Recommendation Becomes Requirement

**Trigger**: Approved P0/P1 recommendation entering sprint

**Process**:
1. Recommendation approved and prioritized
2. Product owner/tech lead drafts formal requirement
3. Requirement added to `requirements/current.md` with REQ-ID
4. Recommendation updated with `req_id` field linking to REQ-ID
5. When sprint starts, requirement locked in `requirements/requirements.lock.md`

**Example**:
```markdown
Recommendation:
- REC-042: Add video testimonials to homepage (P1, approved)

Becomes:

Requirement:
- REQ-112: Homepage Video Testimonials
  - Acceptance: Homepage displays 2-3 video testimonials, each <60s, load in <3s
  - Linked from: REC-042
```

### Lightweight Recommendations (Don't Need Requirements)

Not all recommendations need formal REQ-IDs:
- **Quick wins** (<1 SP): Color changes, copy edits, minor CSS tweaks
- **Experiments**: A/B tests, feature flags, temporary changes
- **Cleanup**: Code refactoring, dependency updates (unless risky)

**Rule**: If it has acceptance criteria and tests, make it a requirement. If it's a quick fix, keep as recommendation only.

## Workflow Examples

### Example 1: Recommendation Approved and Implemented

```bash
# Day 1: Capture from research
python scripts/capture-recommendation.py \
  --title "Add sticky mobile CTA" \
  --category "ux" \
  --priority "P1" \
  --description "Gen Z mobile users need persistent CTA" \
  --source "research" \
  --source-document "STRATEGIC-RESEARCH-BRIEF.md"
# Output: REC-045 (status: proposed)

# Day 2: Approve in planning meeting
python scripts/update-recommendation.py REC-045 --status approved

# Day 3: Estimate effort
python scripts/update-recommendation.py REC-045 --effort-sp 1

# Day 5: Start implementation
python scripts/update-recommendation.py REC-045 --status in-progress

# Day 6: Merge to main
python scripts/update-recommendation.py REC-045 \
  --status implemented \
  --implemented-in "abc123f"

# Day 10: Validate in production
python scripts/update-recommendation.py REC-045 --status validated
```

### Example 2: Recommendation Rejected

```bash
# Capture recommendation
python scripts/capture-recommendation.py \
  --title "Add 3D product viewer" \
  --category "ux" \
  --priority "P2" \
  --description "Interactive 3D models of products" \
  --source "competitive-analysis"
# Output: REC-046 (status: proposed)

# Reject after review
python scripts/update-recommendation.py REC-046 \
  --status rejected \
  --rejection-rationale "Technical constraints: no 3D assets available, high implementation cost (20 SP), low ROI"
```

### Example 3: Recommendation Blocked, Returns to Proposed

```bash
# Start implementation
python scripts/update-recommendation.py REC-047 --status in-progress

# Discover blocker (e.g., dependency not available)
python scripts/update-recommendation.py REC-047 \
  --status proposed \
  --rejection-rationale "Blocked: requires API upgrade (REC-050) to be completed first"

# Add dependency
python scripts/update-recommendation.py REC-047 --dependencies REC-050
```

## Best Practices

### Capture Immediately
Don't wait to formalize recommendations. Capture as soon as identified:
- In meeting? Capture before meeting ends
- Reading research? Capture while reading
- Code review? Capture before closing PR

**Why**: Recommendations lost = opportunities lost.

### Update Promptly
Update status within 24 hours of change:
- Code merged? Mark `implemented` same day
- Approved in meeting? Mark `approved` before end of day

**Why**: Stale status → confusion about what's actually happening.

### Provide Rationale for Rejections
Always explain why rejected:
- **Bad**: `status: rejected`
- **Good**: `status: rejected, rejection_rationale: "Technical constraints: requires API not available"`

**Why**: Future context (why we didn't do this, even though it seemed good).

### Link to Requirements
When recommendation becomes requirement, link both ways:
- Recommendation: `req_ids: [REQ-112]`
- Requirement: `Linked from: REC-042`

**Why**: Traceability from idea → implementation.

### Archive Completed Work
Monthly cleanup: move `validated` recommendations to archive:
- Keeps registry focused on active work
- Preserves historical record
- Reduces noise in queries

**Why**: Registry manageable size, faster queries.
