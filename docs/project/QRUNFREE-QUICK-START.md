# QRUNFREE Implementation - Quick Start Guide

**Ready to execute immediately after approval.**

---

## TL;DR

Execute these phases in order:

1. **Phase 1 (8 SP):** Core infrastructure - Settings, TDD flow, agents
2. **Phase 2 (3 SP):** Comprehensive validation - Playwright, screenshots, reports
3. **Phase 3 (2 SP):** Documentation updates
4. **Test:** Run first autonomous task end-to-end

---

## Phase 1: Core Infrastructure (8 SP)

### Step 1.1: Update Settings Configuration

**File:** `.claude/settings.json`

**Action:** Insert after line 1 (after opening `{`):

```json
  "executionMode": {
    "default": "autonomous",
    "description": "autonomous = QRUNFREE workflow (no pauses, recursive fixing). interactive = checkpoint-based (ask before each phase)",
    "pauseOnBlockers": true,
    "blockerThreshold": 5,
    "maxRecursiveIterations": 4,
    "prioritySystem": "team-debate",
    "fixAllPreExisting": true,
    "tokenBudget": "unlimited"
  },
```

**Validation:** `cat .claude/settings.json | jq .executionMode`

---

### Step 1.2: Create Priority Debate Moderator

**File:** `.claude/agents/priority-debate-moderator.md`

**Action:** Copy full content from implementation plan Part 2.2

**Quick check:** File should contain:
- Mission statement
- NOT stack ranking principle
- Priority criteria (4 dimensions)
- Debate process (4 steps)
- Output schema

**Validation:** `ls -lh .claude/agents/priority-debate-moderator.md`

---

### Step 1.3: Create Exec-Team Orchestrator

**File:** `.claude/agents/exec-team-orchestrator.md`

**Action:** Copy full content from implementation plan Part 2.4

**Quick check:** File should contain:
- Escalation triggers (5 types)
- Team composition
- Escalation process (4 steps)
- Consensus analysis
- Output schema

**Validation:** `ls -lh .claude/agents/exec-team-orchestrator.md`

---

### Step 1.4: Update Planner Orchestrator

**File:** `.claude/agents/planner.md`

**Action 1:** Insert after line 13 (after context_budget_rules):

```yaml
execution_mode: autonomous|interactive
autonomous_config:
  max_recursive_iterations: 4
  blocker_threshold: 5
  fix_all_pre_existing: true
  exec_team_escalation: true
```

**Action 2:** Insert after line 117 (before final closing backticks):

Copy entire "Autonomous Mode Orchestration" section from implementation plan Part 2.1 (lines after output contract)

**Quick check:** File should contain:
- Mode detection logic
- Autonomous loop structure (Python pseudocode)
- recursive_fix_loop function
- team_priority_debate function
- escalate_to_exec_team function
- Interactive mode section
- Comparison table

**Validation:** `grep -c "autonomous_orchestration" .claude/agents/planner.md` (should be >0)

---

### Step 1.5: Update CLAUDE.md TDD Flow

**File:** `CLAUDE.md`

**Action:** Replace lines 66-92 (entire § 3 TDD Flow) with new content from implementation plan Part 1.2

**Quick check:** New section should contain:
- Execution Modes heading
- Autonomous Mode (DEFAULT) description
- Interactive Mode description
- Autonomous Workflow diagram
- Blocker Escalation section
- Blocking Rules

**Validation:** `grep "Autonomous Mode (DEFAULT)" CLAUDE.md` (should match)

---

### Step 1.6: Update CLAUDE.md QShortcuts

**File:** `CLAUDE.md`

**Action:** Insert after line 110 (after QGIT definition in § 4):

```markdown

### Execution Mode Modifiers

All QShortcuts support execution mode flags:

- **Default (Autonomous):** `QPLAN` runs full autonomous workflow
- **Interactive:** `QPLAN --interactive` runs checkpoint-based workflow
- **Settings Override:** Set `"executionMode.default": "interactive"` in `.claude/settings.json`

**Examples:**

```bash
# Autonomous (default) - No pausing, recursive fixing, comprehensive validation
QPLAN "Implement hero carousel component"

# Interactive (opt-in) - Checkpoint-based, manual review
QPLAN --interactive "Implement hero carousel component"

# Force interactive for one-off tasks
QPLAN --interactive "Quick CSS fix for button alignment"
```
```

**Validation:** `grep "Execution Mode Modifiers" CLAUDE.md` (should match)

---

## Phase 2: Comprehensive Validation (3 SP)

### Step 2.1: Update Validation Specialist

**File:** `.claude/agents/validation-specialist.md`

**Action:** Insert after line 48 (after "Without screenshot proof..." section):

Copy entire "Comprehensive Validation Mode" section from implementation plan Part 2.3

**Quick check:** New section should contain:
- Validation Phases (4 phases)
- Phase 3: Playwright Production Tests (MANDATORY)
- Example production test
- Blocking Rule
- Screenshot proof auto-capture
- Comprehensive Report Generation
- QGIT Blocking Logic

**Validation:** `grep "Comprehensive Validation Mode" .claude/agents/validation-specialist.md` (should match)

---

### Step 2.2: Create Playwright Production Test Template

**File:** `tests/e2e/production/template.spec.ts`

**Action:** Create new file with content from implementation plan Part 3.2

**Quick check:** File should contain:
- TypeScript imports
- PRODUCTION_URL constant
- test.describe block with REQ reference
- beforeEach and afterEach hooks
- Example test with screenshot capture
- Best practices comments

**Validation:** `cat tests/e2e/production/template.spec.ts | grep "PRODUCTION_URL"`

---

### Step 2.3: Create Playwright Production Config (if needed)

**File:** `playwright.production.config.ts`

**Check if exists:** `ls playwright.production.config.ts`

**If missing, create:**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e/production',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'https://prelaunch.bearlakecamp.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
    },
  ],
});
```

**Validation:** `npx playwright test --config=playwright.production.config.ts --list`

---

## Phase 3: Documentation (2 SP)

### Step 3.1: Create Autonomous Workflow User Guide

**File:** `docs/project/AUTONOMOUS-WORKFLOW-GUIDE.md`

**Content:**

```markdown
# Autonomous Workflow User Guide

## Quick Start

By default, all tasks run in **autonomous mode** (QRUNFREE workflow).

### Running a Task

```bash
# Autonomous (default) - Runs to completion without stopping
QPLAN "Implement hero carousel"

# Interactive (opt-in) - Pauses at checkpoints
QPLAN --interactive "Quick CSS fix"
```

### What Happens in Autonomous Mode

1. **No pausing** - Runs through all phases automatically
2. **Recursive fixing** - Fixes ALL issues 4 times per phase
3. **Pre-existing bugs** - Scans and fixes entire codebase
4. **Team debate** - Specialists debate priorities individually
5. **Comprehensive validation** - Local + production + Playwright + screenshots
6. **Deployment monitoring** - Waits for production, auto-fixes failures

### Expected Output

At the end, you'll receive:
- Comprehensive test report (JSON + Markdown)
- Screenshot proof links
- Requirements completion matrix
- Pre-existing bugs fixed list
- Production deployment verification

### Opt-Out (Switch to Interactive Mode)

**Per-task:**
```bash
QPLAN --interactive "task description"
```

**Globally (persistent):**

Edit `.claude/settings.json`:
```json
{
  "executionMode": {
    "default": "interactive"
  }
}
```

### When Does It Pause?

Autonomous mode only pauses for:
- **True blockers** (5 failed attempts on same solution)
- **Exec-team escalation** (no consensus or major design change)
- **Missing tests** (Playwright production tests required)

### Priority System (Team Debate)

Issues are NOT stack ranked. Each issue is debated individually:

**Criteria:**
1. Functionality (does it work?)
2. Maintainability (can we maintain it?)
3. Operations (does it run reliably?)
4. Design (is it well-architected?)

**Result:** All issues could be P1 (or all P2). No artificial ranking.

### Exec-Team Escalation

After 5 failed attempts, specialists convene:
- PE-Designer (architecture)
- PM (product priorities)
- SDE-III (implementation)
- Strategic-Advisor (strategy)

If consensus + not major design change → solution applied automatically.
If no consensus or major change → escalates to you with all viewpoints.

### Token Usage

Autonomous mode uses more tokens (30-50k avg vs 10-30k interactive).

You have 200k budget, so no hard limit. System doesn't block on token usage.

### Monitoring Progress

Autonomous workflow logs verbosely:

```
[QPLAN] Analyzing requirements...
[QCODET] Writing failing tests...
[QCHECKT] Reviewing tests... 5 issues found
[TEAM DEBATE] pe-reviewer: 4 are P1, code-auditor: 5 are P1
[FIX ITERATION 1] Fixed 4 issues...
[FIX ITERATION 2] Clean ✅
[QCODE] Implementing...
```

You can follow along without needing to respond.

### Screenshots & Reports

After validation:
- **Screenshots:** `verification-screenshots/{commit-sha}-*.png`
- **JSON Report:** `validation-reports/validation-{commit-sha}.json`
- **Markdown Report:** `validation-reports/validation-{commit-sha}.md`

### FAQ

**Q: Can I stop it mid-execution?**
A: Not yet (future: PAUSE command). For now, use `--interactive` if you want control.

**Q: What if it fixes something I didn't want fixed?**
A: Pre-existing bug fixes are logged. Review validation report. Revert if needed.

**Q: What if I disagree with exec-team consensus?**
A: All position memos are logged in `exec-team-logs/`. Review and override if needed.

**Q: Does it commit automatically?**
A: Yes (QGIT phase). All quality gates pass first. Production validation runs post-commit.

**Q: What about sensitive changes (auth, payments)?**
A: Security-reviewer is automatically added to team debate for auth/network/fs changes.

---

See full spec: [QRUNFREE-IMPLEMENTATION-PLAN.md](./QRUNFREE-IMPLEMENTATION-PLAN.md)
```

**Validation:** `cat docs/project/AUTONOMOUS-WORKFLOW-GUIDE.md | grep "Quick Start"`

---

### Step 3.2: Update README (if applicable)

**File:** `README.md`

**Check if README has development workflow section:**

```bash
grep -i "workflow\|development process" README.md
```

**If yes, add:**

```markdown
## Development Workflow

This project uses **autonomous TDD workflow** by default:

- **No pausing** except true blockers (5 failed attempts)
- **Recursive fixing** of ALL issues (4 iterations per phase)
- **Team-based priority debate** (not stack ranking)
- **Comprehensive validation** (Playwright + screenshots mandatory)
- **Deployment monitoring** with auto-fix

### Running Tasks

```bash
# Autonomous mode (default)
QPLAN "Implement new feature"

# Interactive mode (checkpoint-based)
QPLAN --interactive "Quick fix"
```

See [CLAUDE.md](./CLAUDE.md) for full workflow documentation.
```

**Validation:** `grep "autonomous TDD workflow" README.md`

---

## Testing & Validation

### Test 1: Verify Settings Load

```bash
cat .claude/settings.json | jq .executionMode
```

**Expected:** Should show executionMode config with `"default": "autonomous"`

---

### Test 2: Verify Agents Exist

```bash
ls -1 .claude/agents/priority-debate-moderator.md
ls -1 .claude/agents/exec-team-orchestrator.md
```

**Expected:** Both files exist

---

### Test 3: Verify CLAUDE.md Changes

```bash
grep "Autonomous Mode (DEFAULT)" CLAUDE.md
grep "Execution Mode Modifiers" CLAUDE.md
```

**Expected:** Both patterns match

---

### Test 4: Verify Validation Specialist Changes

```bash
grep "Comprehensive Validation Mode" .claude/agents/validation-specialist.md
grep "MANDATORY" .claude/agents/validation-specialist.md
```

**Expected:** Both patterns match

---

### Test 5: Verify Playwright Template Exists

```bash
ls -1 tests/e2e/production/template.spec.ts
```

**Expected:** File exists

---

### Test 6: Run First Autonomous Task (End-to-End)

```bash
# Simple test task
QPLAN "Add a test comment to homepage hero section"
```

**Expected Behavior:**
1. QPLAN analyzes requirements
2. QCODET writes tests
3. QCHECKT reviews → debates issues → fixes recursively
4. QCODE implements
5. QCHECK reviews → debates issues → fixes recursively
6. QVERIFY runs comprehensive validation (may require creating Playwright test)
7. QDOC updates docs
8. QGIT commits and pushes
9. Production monitoring runs
10. Comprehensive report generated

**Validation:**
- Check `validation-reports/` for new report
- Check `verification-screenshots/` for screenshots
- Verify production deployment succeeded
- No manual intervention required (except creating Playwright test if missing)

---

## Rollback Plan (If Issues)

### Immediate Rollback (Settings Change)

**Edit `.claude/settings.json`:**

```json
{
  "executionMode": {
    "default": "interactive"
  }
}
```

**Result:** All tasks revert to checkpoint-based workflow (old behavior)

---

### Full Rollback (Revert Commits)

If implementation causes issues:

```bash
# Find commit before QRUNFREE changes
git log --oneline | head -10

# Revert to previous commit
git revert <commit-sha>

# Or hard reset (destructive)
git reset --hard <commit-sha>
```

---

## Success Criteria Checklist

After implementing and running 3 tasks:

- [ ] User ran ≥3 autonomous tasks successfully
- [ ] ≥80% completed to production without manual intervention
- [ ] Average token usage ≤40k per task
- [ ] Zero production-breaking auto-fixes
- [ ] Comprehensive reports generated for all tasks
- [ ] Screenshots captured for all validations
- [ ] Pre-existing bugs fixed automatically
- [ ] User reports productivity improvement

---

## File Checklist (Ready to Execute)

### New Files (5)

- [ ] `.claude/agents/priority-debate-moderator.md`
- [ ] `.claude/agents/exec-team-orchestrator.md`
- [ ] `tests/e2e/production/template.spec.ts`
- [ ] `docs/project/AUTONOMOUS-WORKFLOW-GUIDE.md`
- [ ] `playwright.production.config.ts` (if missing)

### Modified Files (4)

- [ ] `.claude/settings.json` (add executionMode)
- [ ] `CLAUDE.md` (replace § 3, update § 4)
- [ ] `.claude/agents/planner.md` (add autonomous orchestration)
- [ ] `.claude/agents/validation-specialist.md` (add comprehensive validation)

### Documentation Files (Already Created)

- [x] `docs/project/QRUNFREE-IMPLEMENTATION-PLAN.md`
- [x] `docs/project/QRUNFREE-EXECUTIVE-SUMMARY.md`
- [x] `docs/project/QRUNFREE-DECISION-TREE.md`
- [x] `docs/project/QRUNFREE-QUICK-START.md` (this file)

---

## Execution Timeline

**Phase 1 (8 SP):** 30-45 min (file creation + editing)
**Phase 2 (3 SP):** 15-20 min (validation updates)
**Phase 3 (2 SP):** 10-15 min (documentation)
**Testing:** 20-30 min (end-to-end autonomous task)

**Total:** ~90 minutes to fully implement and test

---

## Next Steps

1. ✅ Review this quick-start guide
2. ⏳ Get user approval
3. ⏳ Execute Phase 1 (create + modify files)
4. ⏳ Execute Phase 2 (validation enhancements)
5. ⏳ Execute Phase 3 (documentation)
6. ⏳ Run Test 6 (first autonomous task)
7. ⏳ Monitor success criteria for 1 week
8. ⏳ Iterate based on feedback

---

**Ready to execute immediately after user approval.**
