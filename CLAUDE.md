# Claude Code Guidelines

> **Purpose**: TDD-first with requirements discipline, parallel agents, story point estimation.

---

## 1) Core Principles (MUST/SHOULD)

**Before Coding**:
- Ask clarifying questions
- Draft approach → `requirements/current.md`
- List pros/cons; choose simplest

**While Coding**:
- TDD: failing test with REQ-ID first
- Domain vocabulary, small functions
- Type safety: branded `type`s, `import type`
- Compile frontend + edge function types together (no arg mismatches)
- CI MUST fail on `tsc --noEmit` errors before deploy
- Avoid comments (code explains itself)

**Dependencies**:
- Edge functions: pin exact version `@supabase/supabase-js@2.50.2`
- Frontend: `^2.50.2` in package.json
- MUST NOT mix versions across edge functions
- Run `grep -r "@supabase/supabase-js" supabase/functions/` before deploy

**Testing**:
- Co-locate `*.spec.ts`
- API changes → extend integration tests
- Tests cite REQ-IDs: `REQ-123 — description`
- Property-based tests for algorithms

**Organization**:
- Share code only when used ≥2 places
- Organize by feature, not layers

**Quality Gates**:
- prettier, lint, typecheck green
- Tests green before `qgit`

---

## 2) Requirements Lock

- `requirements/current.md` — canonical requirements
- `requirements/requirements.lock.md` — snapshot per task
- Tests reference REQ-IDs

**Template**:
```markdown
## REQ-101: <Requirement>
- Acceptance: <testable>
- Non-Goals: <optional>
```

---

## 3) TDD Flow

### Execution Modes

**Autonomous Mode (DEFAULT):**
- No pausing except true blockers (5 failed solution attempts)
- Recursive fixing of ALL issues (4 iterations minimum per phase)
- Team debate for priority assessment (not stack ranking)
- Comprehensive validation (Playwright + screenshots + full report)
- Deployment monitoring with auto-fix
- Exec-team escalation for blockers

**Interactive Mode (opt-in via `--interactive` flag or settings):**
- Checkpoint-based execution
- Human approval between phases
- Traditional P0-P1 priority assessment

### Autonomous Workflow (Default)

```
QPLAN[autonomous] → LOOP until success OR blocker:
  │
  ├─ PHASE 1: Test Development
  │  ├─ QCODET: test-writer creates failing tests (≥1 per REQ)
  │  ├─ QCHECKT: PE-Reviewer, test-writer review tests
  │  └─ FIX LOOP (4 iterations):
  │     ├─ Team debates ALL findings (no P0-P3 stack ranking, impact-based)
  │     ├─ Fix issues based on functionality, maintainability, design
  │     ├─ Re-run QCHECKT
  │     └─ Repeat 4x or until clean
  │
  ├─ PHASE 2: Implementation
  │  ├─ QCODE: sde-iii implements to pass tests
  │  ├─ QCHECK: PE-Reviewer, code-quality-auditor (+ security if needed)
  │  ├─ QCHECKF: Review functions
  │  └─ FIX LOOP (4 iterations):
  │     ├─ Team debates ALL findings
  │     ├─ Fix issues (including pre-existing in entire codebase)
  │     ├─ Re-run QCHECK + QCHECKF
  │     └─ Repeat 4x or until clean
  │
  ├─ PHASE 3: Comprehensive Validation
  │  ├─ QVERIFY[comprehensive]:
  │  │  ├─ Local tests (unit, integration, e2e)
  │  │  ├─ Playwright production tests (MANDATORY - blocks QGIT if missing)
  │  │  ├─ Screenshot proof (auto-captured)
  │  │  └─ Generate comprehensive report
  │  └─ FIX LOOP (4 iterations):
  │     ├─ If ANY failures → diagnose + fix
  │     ├─ Re-run full validation
  │     └─ Repeat 4x or until all pass
  │
  ├─ PHASE 4: Documentation & Deployment
  │  ├─ QDOC: docs-writer updates docs
  │  └─ QGIT: release-manager commits + pushes
  │
  └─ PHASE 5: Production Monitoring (autonomous)
     ├─ Wait 2min for Vercel deployment
     ├─ Poll every 30s for 5min total
     ├─ Run Playwright on production
     ├─ If fail → diagnose + auto-fix → re-deploy
     └─ Max 3 auto-fix attempts → escalate
```

### Blocker Escalation

**True Blocker Criteria:**
1. Same solution attempted 5 times with failures
2. Integration issue tried 5 different fixes (no hacks)
3. No exact instructions + 5 attempted solutions failed

**Escalation Protocol:**
1. Assume we are the problem first (not dependencies)
2. Try 5 different integration fixes
3. If still blocked → convene exec-team (pe-designer, pm, sde-iii, strategic-advisor)
4. Exec-team debates solutions (parallel position memos)
5. If consensus (≥2 specialists agree) → apply solution
6. If no consensus OR major design change → escalate to human with all viewpoints

### Blocking Rules

**Test Failure Rule:** test-writer must see failures before implementation.
**Production Validation Rule:** QVERIFY comprehensive validation must pass with screenshot proof before QGIT.
**Playwright Requirement:** ALL features must have Playwright production tests. Missing tests block QGIT.
**Visual Verification Rule:** Visual changes (CSS/Tailwind patterns) require screenshot validation before deployment.

### Visual Verification Checkpoint (REQ-PROC-007)

**Trigger**: File diff contains CSS/Tailwind patterns (`text-`, `prose-`, `bg-`, `flex-`, `grid-`, etc.)

**Required Actions**:
1. Capture screenshot of affected component/page in production
2. Store in `verification-screenshots/REQ-{ID}-{timestamp}.png`
3. Update `requirements/requirements.lock.md` with screenshot verification status
4. Verify computed styles match expected values (not just class presence)

**Blocking**: Cannot proceed to QGIT without screenshot evidence for visual changes.

**Tools**: Playwright production tests with `getComputedStyle()` assertions.

---

## 4) QShortcuts

> Full command text for user. Agent/Skill details: `.claude/agents/<name>.md` or `.claude/skills/<domain>/<name>/`

### Core Development Workflow
- **QNEW**: Understand BEST PRACTICES; follow them → **planner, docs-writer**
- **QPLAN**: Analyze codebase; plan consistent, minimal, reuses → **skills/planning/orchestrator** (tools: planning-poker-calc.py, interface-validator.py)
- **QCODET**: Implement tests, tests pass, prettier, typecheck, lint → **skills/testing/test-writer** (tools: test-scaffolder.py, coverage-analyzer.py, req-id-extractor.py)
- **QCODE**: Implement functionality, prettier, typecheck, lint → **sde-iii, implementation-coordinator**
- **QCHECK**: Skeptical review of functions/tests/implementation → **skills/quality/pe-reviewer** (tools: cyclomatic-complexity.py, dependency-risk.py, supabase-rls-checker.py), **code-quality-auditor**, **skills/security/security-reviewer** (tools: secret-scanner.py, injection-detector.py, auth-flow-validator.py)
- **QCHECKF**: Review functions → **skills/quality/pe-reviewer**, **code-quality-auditor**
- **QCHECKT**: Review tests → **skills/quality/pe-reviewer**, **skills/testing/test-writer**
- **QVERIFY**: Verify production deployment works, capture screenshot proof → **validation-specialist**
- **QUX**: UX test scenarios → **ux-tester**
- **QDOC**: Document per Progressive Docs → **docs-writer**
- **QIDEA**: Research/ideation, no code → **general-purpose**
- **QGIT**: Stage, commit (Conventional Commits), push → **release-manager**

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

### Learning AI & Architecture
- **QARCH**: Design learning AI systems (personas, RLHF, RAG) → **skills/architecture/llm-systems** (tools: rag-validator.py, feedback-loop-checker.py, persona-schema-gen.py)
- **QPROMPT**: Optimize prompts for token efficiency, persona consistency → **skills/prompting/prompt-engineer** (tools: token-counter.py, prompt-optimizer.py, persona-validator.py)
- **QTRANSFORM**: Design content transformation for platforms (LinkedIn, Twitter, Email) → **skills/content/transformation** (tools: platform-validator.py, tone-analyzer.py, feedback-learner.py)

### Feedback & Learning Integration
- **QFEEDBACK**: Extract user feedback from markdown documents and integrate into learnings → **skills/learning/feedback-analyzer** (tools: comment-extractor.py, feedback-categorizer.py, learning-integrator.py, feedback-summarizer.py)
- **QLEARN**: Retrieve relevant learnings for active task → **skills/learning/learning-finder** (tools: learning-search.py)
- **QCOMPACT**: Consolidate learnings when files exceed 50KB → **learnings-compactor agent**

### Project Management
- **QREC**: Manage recommendations lifecycle (capture, categorize, prioritize, track) → **skills/project-management/recommendations-manager** (tools: capture-recommendation.py, list-recommendations.py, sync-recommendations.py, update-recommendation.py)

### Skill Development
- **QSKILL**: Create new agent+skill complex with tools and references → **skill-builder**

---

## 5) Planning Poker

**Baseline**: 1 SP = simple authenticated API (key→value, secured, tested, deployed, documented)

**Scales**:
- Planning: 1, 2, 3, 5, 8, 13, 21... (Fibonacci; break >13)
- Coding: 0.05, 0.1, 0.2, 0.3, 0.5, 0.8, 1, 2, 3, 5 (break >5)

**Mandate**: All outputs include SP estimates and NEVER include time estimates.

**Batch Size Limits (REQ-PROC-009)**:
- **Max 5 SP per implementation phase** - Split larger batches automatically
- **Max 3 visual requirements per batch** - Reduce visual verification burden
- **Verify each requirement BEFORE moving to next** - Sequential validation, not batch
- **QPLAN must enforce splits** - Automatic batching by planning agent

**Details**: `docs/project/PLANNING-POKER.md`

---

## 6) Test Failure Tracking

**File**: `.claude/metrics/test-failures.md`

**Schema**: Date | Test File | Test Name | REQ-ID | Bug | Fix SP | Commit

**Rule**: Log when test reveals real bug (not test error).

---

## 6.5) Git Branch Rules (MUST FOLLOW)

**Working branch**: `staging` — ALL development happens here. NEVER commit or push directly to `main`.

**Workflow**:
1. Work on `staging` branch (or feature branches off `staging`)
2. Push to `staging` → Vercel deploys to `prelaunch.bearlakecamp.com`
3. Validate on prelaunch
4. Create PR: `staging` → `main` (triggers CI: typecheck, lint, test, build)
5. Merge PR → Vercel deploys to production

**Rules**:
- NEVER `git push origin main` — a pre-push hook blocks this
- NEVER `git checkout main` to make changes — stay on `staging`
- Keystatic CMS content edits commit directly to `main` via GitHub API — this is the ONE exception
- If on `main`, switch immediately: `git checkout staging`

---

## 6.6) Pre-Deployment Gates (MUST RUN)

**Before ANY deployment (Lovable/external/CI)**:
```bash
npm run typecheck && npm run lint && npm run test
```

**Edge functions MUST**:
- Use pinned `@supabase/supabase-js@2.50.2` (grep all functions)
- Match TypeScript signatures in frontend (no arg count mismatches)

**Blockers**: Signature mismatches, missing endpoints, dependency version drift

---

## 6.7) Workflow Automation Hooks

**Configuration**: `.claude/settings.json` (hooks section)

### PreToolUse Hooks (before Edit|Write operations)

**Typecheck Validation**:
```bash
npm run typecheck  # MUST pass before file modifications
```

**Dependency Version Check**:
```bash
# scripts/check-supabase-versions.sh
grep -r "@supabase/supabase-js" supabase/functions/ | grep -oE "[0-9]+\.[0-9]+\.[0-9]+" | sort -u
# MUST show single version: 2.50.2
```

**Purpose**: Catch type errors and dependency drift BEFORE modifications enter codebase.

### PostToolUse Hooks (after code changes)

**Auto-Format**:
```bash
npx prettier --write $CLAUDE_TOOL_FILE_PATH
```

**Test Validation**:
```bash
# Run affected tests if *.spec.ts exists
npm test -- $CLAUDE_TOOL_FILE_PATH.spec.ts
```

**Purpose**: Ensure code quality and test coverage immediately after changes.

---

## 7) Detailed Guidelines → Agents

- **Functions**: `.claude/agents/pe-reviewer.md` § Checklist
- **Tests**: `.claude/agents/test-writer.md` § Checklist
- **MCP Security**: `.claude/agents/pe-reviewer.md` § MCP
- **Docs Templates**: `.claude/agents/docs-writer.md` § Templates
- **Interface Contracts**: `docs/tasks/INTERFACE-CONTRACT-SCHEMA.md`
- **Parallel Agents**: `.claude/agents/planner.md` § Modes

---

## 8) Permissions

- Default: `acceptEdits` (no destructive ops)
- Narrow scope; deny secrets/dangerous commands

**External Tools** (Lovable, AI assistants):
- MUST run quality gates before committing
- NEVER bypass `npm run typecheck && npm test`

---

## 9) Documentation Organization

**Root Directory Rule**: ONLY `README.md` and `CLAUDE.md` live in root.

**Documentation Structure**:
- `docs/project/` — Planning, strategy, migration docs, standards
- `docs/technical/` — Architecture, system design, technical specs
- `docs/operations/` — Deployment, editor guides, runbooks
- `docs/analysis/` — Audits, research, investigation reports
- `docs/design/` — UI/UX, style guides, design decisions
- `docs/tasks/` — Phase plans, implementation tracking, task-specific docs

**Placement Rules**:
- Project management → `docs/project/`
- System architecture → `docs/technical/`
- Deployment/ops → `docs/operations/`
- Research/audits → `docs/analysis/`
- UI/UX → `docs/design/`
- Task tracking → `docs/tasks/`

**Maintenance**: Keep root clean. Move any stray docs immediately.

---

## Reminders

- Do what's asked; nothing more
- Prefer editing over creating files
- Never proactively create docs unless requested