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

---

## Priority System (Team Debate)

Issues are NOT stack ranked. Each issue is debated individually:

**Criteria:**
1. Functionality (does it work?)
2. Maintainability (can we maintain it?)
3. Operations (does it run reliably?)
4. Design (is it well-architected?)

**Result:** All issues could be P1 (or all P2). No artificial ranking.

---

## Exec-Team Escalation

After 5 failed attempts, specialists convene:
- PE-Designer (architecture)
- PM (product priorities)
- SDE-III (implementation)
- Strategic-Advisor (strategy)

If consensus + not major design change → solution applied automatically.
If no consensus or major change → escalates to you with all viewpoints.

---

## Token Usage

Autonomous mode uses more tokens (30-50k avg vs 10-30k interactive).

You have 200k budget, so no hard limit. System doesn't block on token usage.

---

## Monitoring Progress

Autonomous workflow logs verbosely:

```
[QPLAN] Analyzing requirements...
[QCODET] Writing failing tests...
[QCHECKT] Reviewing tests... 5 issues found
[TEAM DEBATE] pe-reviewer: 4 are P1, code-auditor: 5 are P1
[FIX ITERATION 1] Fixed 4 issues...
[FIX ITERATION 2] Clean
[QCODE] Implementing...
```

You can follow along without needing to respond.

---

## Screenshots & Reports

After validation:
- **Screenshots:** `verification-screenshots/{commit-sha}-*.png`
- **JSON Report:** `validation-reports/validation-{commit-sha}.json`
- **Markdown Report:** `validation-reports/validation-{commit-sha}.md`

---

## FAQ

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

## See Also

- [QRUNFREE-IMPLEMENTATION-PLAN.md](./QRUNFREE-IMPLEMENTATION-PLAN.md) - Full technical specification
- [QRUNFREE-DECISION-TREE.md](./QRUNFREE-DECISION-TREE.md) - Visual workflow diagrams
- [QRUNFREE-QUICK-START.md](./QRUNFREE-QUICK-START.md) - Execution checklist
