# Recommendation Prioritization Framework

> **Purpose**: Decision criteria for P0/P1/P2 priority assignment and impact vs effort analysis
> **Load when**: Prioritizing new recommendations, sprint planning, or resolving priority disputes

## Priority Levels

### P0: Critical
**Definition**: Blocking critical path or high-risk security/performance issue

**Characteristics**:
- **Blocks** other work from proceeding
- **Security** vulnerability with high severity
- **Performance** issue causing user abandonment (>50% bounce rate)
- **Production** outage or critical bug
- **Legal/Compliance** requirement (GDPR, accessibility lawsuit)

**Examples**:
- "Fix SQL injection vulnerability in login form" (security)
- "Optimize homepage load time from 10s to <3s" (performance, blocking conversions)
- "Add WCAG 2.1 AA compliance before launch" (legal requirement)
- "Fix mobile navigation broken in production" (critical bug)

**Response Time**: Immediate (same day or next sprint)

**Approval**: Tech lead or product owner can fast-track

**Effort Constraint**: No constraint (do whatever it takes)

### P1: High Priority
**Definition**: High impact, aligns with strategic goals, feasible effort

**Characteristics**:
- **High impact** on user experience, conversion, or revenue
- **Aligns** with current strategic goals (e.g., "increase mobile conversions")
- **Feasible** effort (≤5 SP for single recommendation)
- **No blockers** preventing implementation
- **Stakeholder** buy-in (client/team agrees this matters)

**Examples**:
- "Add video testimonials to homepage" (high impact on trust/conversions)
- "Implement sticky mobile CTA" (aligns with mobile-first strategy)
- "Update color palette for nature-authentic aesthetic" (strategic rebrand)
- "Add Instagram feed to homepage" (social proof, Gen Z engagement)

**Response Time**: Next 1-2 sprints

**Approval**: Product owner or planning meeting consensus

**Effort Constraint**: ≤5 SP (if >5 SP, consider breaking into smaller recommendations)

### P2: Nice-to-Have
**Definition**: Low urgency, high effort, or speculative

**Characteristics**:
- **Low urgency** (no immediate user pain or business need)
- **High effort** (>5 SP for uncertain ROI)
- **Speculative** (unvalidated assumption about value)
- **Future-oriented** (would be nice eventually, but not now)
- **Low alignment** with current goals

**Examples**:
- "Add 3D product viewer" (cool but expensive, uncertain ROI)
- "Implement dark mode" (nice-to-have, not requested by users)
- "Build custom CMS" (huge effort, WordPress works fine for now)
- "Add gamification to user profile" (speculative, unvalidated)

**Response Time**: Backlog (revisit quarterly)

**Approval**: Low bar (can capture without formal approval)

**Effort Constraint**: Deprioritize if >8 SP unless becomes P1

## Impact vs. Effort Matrix

### High Impact, Low Effort (Do First — P0/P1)
**Characteristics**:
- Impact: High (user conversion, revenue, core value prop)
- Effort: ≤2 SP

**Examples**:
- "Add trust badges above fold" (1 SP, high conversion impact)
- "Update CTA button color to forest green" (0.5 SP, aligns with rebrand)
- "Add 'Since [YEAR]' to homepage" (0.2 SP, builds trust)

**Priority**: P1 (or P0 if blocking)

**Action**: Implement immediately, quick wins

### High Impact, High Effort (Plan Carefully — P1)
**Characteristics**:
- Impact: High
- Effort: 3-8 SP

**Examples**:
- "Film and embed 5 video testimonials" (5 SP, high trust impact)
- "Redesign homepage with new visual identity" (8 SP, strategic rebrand)
- "Implement progressive web app (PWA)" (8 SP, mobile experience improvement)

**Priority**: P1

**Action**: Break into phases, get stakeholder buy-in, schedule in sprint

### Low Impact, Low Effort (Nice Polish — P2)
**Characteristics**:
- Impact: Low (minor polish, not critical)
- Effort: ≤2 SP

**Examples**:
- "Add animation to button hover state" (0.5 SP, polish)
- "Update favicon to new brand colors" (0.2 SP, minor)
- "Change footer copyright year to 2025" (0.05 SP, maintenance)

**Priority**: P2

**Action**: Batch with other quick tasks, low priority

### Low Impact, High Effort (Avoid — P2 or Reject)
**Characteristics**:
- Impact: Low
- Effort: >3 SP

**Examples**:
- "Build custom 3D product viewer" (20 SP, unvalidated ROI)
- "Rewrite codebase in new framework" (50 SP, no user benefit)
- "Add multi-language support" (15 SP, no international users yet)

**Priority**: P2 or reject

**Action**: Reject unless strategic shift makes it P1

## Decision Framework

### Step 1: Assess Impact
**Question**: What happens if we DON'T implement this?

**High Impact**:
- Users abandon site (conversion drops)
- Revenue decreases
- Competitive disadvantage
- Security/legal risk

**Medium Impact**:
- User experience degrades slightly
- Some users frustrated but not leaving
- Missed optimization opportunity

**Low Impact**:
- Minor polish
- No observable user effect
- Internal preference only

### Step 2: Estimate Effort
**Question**: How many story points to implement AND validate?

**Effort includes**:
- Design/planning: 10-20% of total
- Implementation: 50-60% of total
- Testing/validation: 20-30% of total
- Documentation: 10% of total

**Examples**:
- "Add trust badge" = 0.5 SP (0.1 planning + 0.2 implementation + 0.1 testing + 0.1 docs)
- "Film video testimonials" = 5 SP (0.5 planning + 3 filming/editing + 1 embedding/testing + 0.5 docs)

### Step 3: Check Dependencies
**Question**: Can we implement now, or are we blocked?

**Blockers**:
- Waiting on external vendor (API, assets, approval)
- Dependent on other work (REC-050 must complete first)
- Resource unavailable (videographer not available until March)

**Action**:
- If blocked: Mark `dependencies`, defer priority
- If clear: Proceed with prioritization

### Step 4: Align with Strategy
**Question**: Does this support current strategic goals?

**Current goals** (example):
- Increase mobile conversions
- Build trust with Gen Z + parents
- Nature-authentic brand aesthetic

**Aligned recommendations** (P1):
- "Add video testimonials" (builds trust)
- "Implement sticky mobile CTA" (mobile conversions)
- "Update color palette to earthy tones" (nature aesthetic)

**Misaligned recommendations** (P2 or reject):
- "Add blog comments" (not a goal)
- "Build custom CMS" (not strategic)

### Step 5: Assign Priority
**Decision matrix**:

| Impact | Effort | Aligned? | Blocked? | Priority |
|--------|--------|----------|----------|----------|
| High   | Low    | Yes      | No       | **P1**   |
| High   | High   | Yes      | No       | **P1**   |
| High   | Low    | No       | No       | **P2**   |
| High   | High   | No       | No       | **P2**   |
| Low    | Low    | Yes      | No       | **P2**   |
| Low    | High   | Yes      | No       | **P2**   |
| Any    | Any    | Any      | Yes      | **P2** (revisit when unblocked) |
| High   | Any    | Yes      | Blocking others | **P0** |

## Reprioritization Triggers

### When to Upgrade Priority

**P2 → P1**:
- Strategic shift (goal now aligns)
- User feedback surge (5+ requests)
- Competitive pressure (competitors launched similar)
- Blocker removed (dependency completed)

**P1 → P0**:
- Security vulnerability discovered
- Production outage
- Legal/compliance deadline
- Blocking critical path

**Example**:
- REC-046 "Add dark mode" was P2 (nice-to-have)
- User survey: 80% request dark mode
- Competitive analysis: All competitors have dark mode
- → Upgrade to P1

### When to Downgrade Priority

**P1 → P2**:
- Strategic deprioritization (goal no longer critical)
- Effort explosion (estimated 2 SP, actually 10 SP)
- Blocker introduced (dependency broke)
- Better alternative found (different approach)

**P0 → P1**:
- Blocker resolved (other work unblocked)
- Workaround found (temporary fix deployed)

**Example**:
- REC-047 "Implement custom CMS" was P1 (strategic)
- Effort re-estimated: 50 SP (not 8 SP)
- Alternative: WordPress works fine with plugins
- → Downgrade to P2 or reject

## Prioritization Workshop Template

Use in planning meetings to batch-prioritize recommendations:

### Agenda (30-60 minutes)

1. **Review new recommendations** (10 min)
   - List all `proposed` recommendations
   - Quick categorization (design, technical, content, etc.)

2. **Impact assessment** (15 min)
   - Group vote: High, Medium, Low impact
   - Discuss outliers (why disagreement?)

3. **Effort estimation** (15 min)
   - Planning poker for each recommendation
   - Flag high-effort items (>5 SP)

4. **Priority assignment** (10 min)
   - Apply decision matrix
   - Assign P0/P1/P2
   - Identify dependencies

5. **Sprint selection** (10 min)
   - P0: Immediate
   - P1: Next 1-2 sprints
   - P2: Backlog

### Output

```markdown
## Prioritization Results (2025-10-31)

### P0 (Critical)
- REC-045: Fix mobile navigation (blocking production)

### P1 (Next Sprint)
- REC-042: Add video testimonials (5 SP, high trust impact)
- REC-043: Update color palette (1 SP, strategic rebrand)
- REC-044: Implement sticky mobile CTA (1 SP, mobile conversions)

### P2 (Backlog)
- REC-046: Add dark mode (8 SP, nice-to-have)
- REC-047: Custom 3D viewer (20 SP, speculative)

### Rejected
- REC-048: Rebuild in React (50 SP, no user benefit)
```

## Best Practices

### Be Honest About Impact
- Don't inflate impact to get priority
- Ask: "What's the measurable user/business outcome?"
- If uncertain, start with Medium impact

### Be Realistic About Effort
- Include ALL phases (design, implementation, testing, docs)
- Add 20% buffer for unknowns
- If estimate >5 SP, consider breaking into smaller recommendations

### Revisit Priorities Quarterly
- Strategic goals shift
- Market conditions change
- P2 recommendations may become P1

### Reject Low-Value Work
- It's OK to reject recommendations
- Saying "no" protects focus on high-impact work
- Always provide rationale (for future reference)

### Use Data When Available
- User analytics: "80% bounce on pricing page" → High impact
- Support tickets: "15 requests for dark mode" → Medium impact
- Competitive analysis: "All competitors have X" → Strategic pressure

### Default to P2, Upgrade with Evidence
- When in doubt, start with P2
- Require evidence/argument to upgrade to P1
- Prevents priority inflation
