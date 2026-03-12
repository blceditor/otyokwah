# QRUNFREE Autonomous Workflow - Decision Tree

Visual guide to autonomous execution flow with all decision points and escalation paths.

---

## High-Level Flow

```
User Request
    ↓
┌─────────────────────────────────────────┐
│ Check Execution Mode                    │
│ (.claude/settings.json or --flag)       │
└─────────────────────────────────────────┘
    ↓
    ├─ Interactive? → Traditional TDD Flow (checkpoint-based)
    │
    └─ Autonomous (DEFAULT) →
        ↓
┌─────────────────────────────────────────┐
│ AUTONOMOUS LOOP                         │
│ (max 5 attempts before exec-team)       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ PHASE 1: Test Development               │
│  - QCODET (write failing tests)         │
│  - QCHECKT (review tests)               │
│  - RECURSIVE FIX LOOP (4x)              │
└─────────────────────────────────────────┘
    ↓
    Clean? ────NO──→ Attempt++, Loop Phase 1
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 2: Implementation                 │
│  - QCODE (implement)                    │
│  - QCHECK (review code)                 │
│  - QCHECKF (review functions)           │
│  - RECURSIVE FIX LOOP (4x)              │
│    ├─ Fix active feature issues         │
│    └─ Scan & fix ENTIRE CODEBASE        │
└─────────────────────────────────────────┘
    ↓
    Clean? ────NO──→ Attempt++, Loop Phase 2
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 3: Comprehensive Validation       │
│  - Local tests (unit, integration, e2e) │
│  - Production smoke tests               │
│  - Playwright production tests          │
│  - Screenshot proof                     │
│  - RECURSIVE FIX LOOP (4x)              │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ Attempt++, Loop Phase 3
    ↓ YES
    │
    Playwright Tests Exist? ────NO──→ BLOCK (create tests first)
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 4: Documentation & Deployment     │
│  - QDOC (update docs)                   │
│  - QGIT (commit + push)                 │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ PHASE 5: Production Monitoring          │
│  - Wait 2min for Vercel                 │
│  - Poll every 30s for 5min              │
│  - Run smoke + Playwright on production │
│  - Auto-fix failures (max 3)            │
└─────────────────────────────────────────┘
    ↓
    Production Pass? ────NO──→ Auto-fix loop (max 3)
    ↓ YES                       ↓ Still failing
    ↓                           Escalate to human
    │
┌─────────────────────────────────────────┐
│ GENERATE COMPREHENSIVE REPORT           │
│  - Test counts & coverage               │
│  - Screenshot links                     │
│  - Requirements completion              │
│  - Pre-existing bugs fixed              │
└─────────────────────────────────────────┘
    ↓
   DONE ✅
```

---

## Recursive Fix Loop (Each Phase)

```
Issues Found
    ↓
┌─────────────────────────────────────────┐
│ TEAM PRIORITY DEBATE                    │
│  - Convene specialists                  │
│  - Parallel position memos              │
│  - Individual impact assessment         │
│    (Functionality, Maintainability,     │
│     Operations, Design)                 │
│  - NO stack ranking                     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Prioritized Issues                      │
│  - Issue A: P1 (critical functionality) │
│  - Issue B: P1 (critical maintainability│
│  - Issue C: P2 (nice to have)           │
│  - Dissent preserved                    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ FIX ALL P1 ISSUES                       │
│  - Apply fixes                          │
│  - Include pre-existing (if Phase 2)    │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ RE-RUN CHECKS                           │
│  - QCHECKT (if Phase 1)                 │
│  - QCHECK + QCHECKF (if Phase 2)        │
│  - QVERIFY (if Phase 3)                 │
└─────────────────────────────────────────┘
    ↓
    Iteration < 4? ────YES──→ Loop (debate → fix → re-check)
    ↓ NO (4 iterations complete)
    │
    Issues Remaining? ────NO──→ Phase Complete ✅
    ↓ YES
    │
┌─────────────────────────────────────────┐
│ LOG RESIDUAL ISSUES                     │
│  - Document what couldn't be fixed      │
│  - Continue to next phase               │
│    (may need to loop entire workflow)   │
└─────────────────────────────────────────┘
```

---

## Blocker Escalation (After 5 Attempts)

```
Attempt >= 5 on Same Blocker
    ↓
┌─────────────────────────────────────────┐
│ BLOCKER DETECTED                        │
│  - Same solution tried 5 times          │
│  - Integration fix tried 5 approaches   │
│  - No exact instructions                │
│  - Agent feels uncertain                │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ CONVENE EXEC-TEAM                       │
│  - pe-designer (architecture)           │
│  - pm (product priorities)              │
│  - sde-iii (implementation)             │
│  - strategic-advisor (strategy)         │
│  + conditional: security, finance, etc. │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ PARALLEL POSITION MEMOS                 │
│  Each specialist submits:               │
│   - Root cause analysis                 │
│   - Proposed solutions (2-3 options)    │
│   - Effort estimates                    │
│   - Risk assessment                     │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ SYNTHESIZE POSITIONS                    │
│  - Count recommendations                │
│  - Check for consensus (≥2 specialists) │
│  - Assess if major design change        │
│  - Preserve dissenting opinions         │
└─────────────────────────────────────────┘
    ↓
    ├─ Consensus? ────NO──→ ESCALATE TO HUMAN
    ↓ YES                   (show all positions)
    │
    Major Design Change? ────YES──→ ESCALATE TO HUMAN
    ↓ NO                            (needs approval)
    │
┌─────────────────────────────────────────┐
│ APPLY CONSENSUS SOLUTION                │
│  - Implement agreed approach            │
│  - Reset attempt counter                │
│  - Resume autonomous loop               │
└─────────────────────────────────────────┘
```

---

## Priority Debate Flow

```
Issues Identified (QCHECKT, QCHECK, or QVERIFY)
    ↓
┌─────────────────────────────────────────┐
│ CONVENE SPECIALISTS                     │
│  Standard:                              │
│   - pe-reviewer (design quality)        │
│   - code-quality-auditor (maintainability│
│   - sde-iii (operational concerns)      │
│  Conditional:                           │
│   + security-reviewer (if security)     │
│   + ux-designer (if UX)                 │
│   + pe-designer (if data/schema)        │
└─────────────────────────────────────────┘
    ↓
FOR EACH ISSUE (individually):
    ↓
┌─────────────────────────────────────────┐
│ SPECIALIST ASSESSMENT                   │
│  Each specialist evaluates:             │
│   - Functionality impact: Low/Med/High  │
│   - Maintainability impact: Low/Med/High│
│   - Operations impact: Low/Med/High     │
│   - Design impact: Low/Med/High         │
│   - Recommendation: P1 or P2            │
│   - Rationale: Why this priority?       │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ AGGREGATE VOTES                         │
│  - Find max impact dimension            │
│  - Count specialist recommendations     │
│  - Identify dissenting opinions         │
└─────────────────────────────────────────┘
    ↓
    Max Impact = High? ────YES──→ P1
    ↓ NO
    │
    Max Impact = Medium + Any specialist recommends fix? ────YES──→ P1
    ↓ NO
    │
    P2 (nice to have)
    ↓
┌─────────────────────────────────────────┐
│ DOCUMENT DECISION                       │
│  - Priority: P1 or P2                   │
│  - Rationale: Why this priority         │
│  - Consensus: How many agreed           │
│  - Dissent: Who disagreed and why       │
└─────────────────────────────────────────┘
    ↓
    More Issues? ────YES──→ Loop (next issue)
    ↓ NO
    │
┌─────────────────────────────────────────┐
│ PRIORITIZED ISSUE LIST                  │
│  - All issues assessed individually     │
│  - No artificial ranking                │
│  - All could be P1 (or all P2)          │
│  - Dissent preserved for user review    │
└─────────────────────────────────────────┘
```

---

## Comprehensive Validation Flow

```
QVERIFY Triggered
    ↓
┌─────────────────────────────────────────┐
│ PHASE 1: Local Test Suite              │
│  npm run test:unit --coverage           │
│  npm run test:integration --coverage    │
│  npm run test:e2e --coverage            │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ FIX LOOP (recursive 4x)
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 2: Production Smoke Tests        │
│  ./scripts/smoke-test.sh --force        │
│  prelaunch.bearlakecamp.com             │
│   - HTTP 200 checks (24 pages)          │
│   - Visual elements present             │
│   - Keystatic admin accessible          │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ FIX LOOP (recursive 4x)
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 3: Playwright Production Tests   │
│  Check: tests/e2e/production/*.spec.ts  │
└─────────────────────────────────────────┘
    ↓
    Tests Exist? ────NO──→ BLOCK QGIT
    ↓ YES                  (create tests first)
    │
┌─────────────────────────────────────────┐
│ RUN PLAYWRIGHT PRODUCTION TESTS         │
│  playwright test --config               │
│  playwright.production.config.ts        │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ FIX LOOP (recursive 4x)
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 4: Screenshot Proof              │
│  Auto-capture from Playwright tests     │
│  Save to verification-screenshots/      │
└─────────────────────────────────────────┘
    ↓
    Screenshots Captured? ────NO──→ BLOCK QGIT
    ↓ YES
┌─────────────────────────────────────────┐
│ PHASE 5: Generate Reports              │
│  JSON: validation-reports/*.json        │
│  Markdown: validation-reports/*.md      │
│   - Test counts & coverage              │
│   - Screenshot links                    │
│   - Requirements completion             │
│   - Pre-existing bugs fixed             │
└─────────────────────────────────────────┘
    ↓
   QVERIFY PASS ✅ → Proceed to QGIT
```

---

## Production Monitoring Flow (Post-QGIT)

```
QGIT Push Completes
    ↓
┌─────────────────────────────────────────┐
│ WAIT FOR VERCEL DEPLOYMENT              │
│  - Poll x-vercel-id header              │
│  - Max wait: 2 min default              │
│  - Max timeout: 5 min total             │
└─────────────────────────────────────────┘
    ↓
    Deployment Detected? ────NO──→ Timeout (escalate)
    ↓ YES
┌─────────────────────────────────────────┐
│ RUN PRODUCTION SMOKE TESTS              │
│  ./scripts/smoke-test.sh --force        │
│  prelaunch.bearlakecamp.com             │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ DIAGNOSE FAILURES
    ↓ YES               ↓
    │              ┌─────────────────────────────────────────┐
    │              │ FAILURE DIAGNOSIS                       │
    │              │  - Parse JSON log                       │
    │              │  - Categorize errors                    │
    │              │    (missing_component, missing_class,   │
    │              │     cms_field, render_error, etc.)      │
    │              │  - Determine fix strategy               │
    │              └─────────────────────────────────────────┘
    │                  ↓
    │                  Safe Fix? ────NO──→ ESCALATE TO HUMAN
    │                  ↓ YES
    │              ┌─────────────────────────────────────────┐
    │              │ AUTO-FIX ATTEMPT                        │
    │              │  - Check attempt count < 3              │
    │              │  - Check cooldown (10 min)              │
    │              │  - Apply safe fix                       │
    │              │    (add CSS class, add import, etc.)    │
    │              │  - Commit fix                           │
    │              │  - Push (triggers new deployment)       │
    │              └─────────────────────────────────────────┘
    │                  ↓
    │                  Attempt < 3? ────YES──→ Loop (wait → test → fix)
    │                  ↓ NO
    │                  ESCALATE TO HUMAN
    ↓
┌─────────────────────────────────────────┐
│ RUN PLAYWRIGHT PRODUCTION TESTS         │
│  playwright test production             │
└─────────────────────────────────────────┘
    ↓
    All Pass? ────NO──→ FIX LOOP (auto-fix or escalate)
    ↓ YES
┌─────────────────────────────────────────┐
│ LOG SUCCESS                             │
│  - Record deployment verification       │
│  - Timestamp, build ID, test results    │
└─────────────────────────────────────────┘
    ↓
   PRODUCTION VERIFIED ✅
```

---

## Example Trace: Successful Autonomous Run

```
USER: "Implement hero carousel"
    ↓
AUTONOMOUS MODE DETECTED (settings.json default)
    ↓
QPLAN: Extract REQs, design, estimate → 8 SP
    ↓
PHASE 1: Test Development
    QCODET → 8 tests written
    QCHECKT → 5 issues found
    TEAM DEBATE → 4 are P1 (functionality, design)
    ITERATION 1 → Fixed 4 issues, 1 remains
    ITERATION 2 → Fixed 1 issue, clean ✅
    ↓
PHASE 2: Implementation
    QCODE → HeroCarousel.tsx created, tests pass
    QCHECK → 15 issues found
      ├─ 8 in active feature
      └─ 7 pre-existing in src/utils/legacy.ts
    TEAM DEBATE → 13 are P1 (maintainability, operations)
    ITERATION 1 → Fixed 13 issues, 2 remain
    ITERATION 2 → Fixed 2 issues, clean ✅
    ↓
PHASE 3: Comprehensive Validation
    Local Tests → 52 total, 52 passed, 93% coverage ✅
    Smoke Tests → 24 pages, 24 passed ✅
    Playwright Tests → 4 total, 4 passed ✅
    Screenshots → 6 captured ✅
    Report Generated ✅
    ↓
PHASE 4: Documentation & Deployment
    QDOC → Component docs updated
    QGIT → Commit abc123, pushed to main
    ↓
PHASE 5: Production Monitoring
    Wait 2min → Deployment detected (dpl_xyz789)
    Smoke Tests → 24 pages, 24 passed ✅
    Playwright Production → 4 total, 4 passed ✅
    ↓
COMPREHENSIVE REPORT GENERATED
    validation-reports/validation-abc123.md
    ├─ Test Results: All passed
    ├─ Screenshots: 6 images linked
    ├─ Requirements: 2/2 complete (100%)
    └─ Pre-existing Bugs Fixed: 7
    ↓
DONE ✅ (no human intervention)
```

---

## Example Trace: Blocker Escalation

```
USER: "Integrate Stripe payments"
    ↓
AUTONOMOUS MODE DETECTED
    ↓
QPLAN → REQ-PAYMENT-001, design, estimate → 5 SP
    ↓
PHASE 1: Tests → Clean after 2 iterations ✅
    ↓
PHASE 2: Implementation
    QCODE → Attempt 1: stripe.charges.create() → FAIL (402)
    QCODE → Attempt 2: stripe.paymentIntents.create() → FAIL (missing payment method)
    QCODE → Attempt 3: Add payment method → FAIL (3DS required)
    QCODE → Attempt 4: Add 3DS handling → FAIL (account in test mode)
    QCODE → Attempt 5: Switch to live mode → FAIL (account not approved)
    ↓
BLOCKER DETECTED (5 attempts)
    ↓
CONVENE EXEC-TEAM
    ↓
PARALLEL POSITION MEMOS
    pe-designer → Recommend Stripe Checkout (hosted)
    pm → Recommend Stripe Checkout (fastest launch)
    sde-iii → Recommend Stripe Checkout (lowest risk)
    strategic-advisor → Recommend Stripe Checkout (time to market)
    ↓
CONSENSUS REACHED (4/4 agree)
    ↓
MAJOR DESIGN CHANGE? → NO (Stripe Checkout is simpler)
    ↓
APPLY CONSENSUS SOLUTION
    ├─ Implement Stripe Checkout redirect
    ├─ Update tests
    ├─ All tests pass ✅
    └─ Reset attempt counter
    ↓
PHASE 2: Implementation Complete ✅
    ↓
PHASE 3-5 → Continue autonomous workflow
    ↓
DONE ✅
```

---

## Opt-Out Decision Points

```
ANY POINT IN WORKFLOW
    ↓
    User wants manual control?
    ↓
┌─────────────────────────────────────────┐
│ OPTION 1: Per-Task Opt-Out             │
│  Next task: QPLAN --interactive         │
│  → Checkpoint-based for this task only  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ OPTION 2: Global Opt-Out               │
│  Edit .claude/settings.json:            │
│  "executionMode": {                     │
│    "default": "interactive"             │
│  }                                      │
│  → All future tasks checkpoint-based    │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ OPTION 3: Mid-Task Pause (Future)      │
│  User: "PAUSE"                          │
│  → Agent stops, waits for instruction   │
│  → User: "RESUME" or "QCODE"            │
└─────────────────────────────────────────┘
```

---

## Quick Reference: When Does Autonomous Workflow Pause?

| Scenario | Autonomous Behavior | Interactive Behavior |
|----------|---------------------|----------------------|
| **After QPLAN** | Continue to QCODET | STOP, wait for user |
| **After QCODET** | Continue to QCHECKT | STOP, wait for user |
| **Issues found in QCHECKT** | Team debate → fix 4x | Show issues, STOP |
| **After QCODE** | Continue to QCHECK | STOP, wait for user |
| **Issues found in QCHECK** | Team debate → fix 4x | Show issues, STOP |
| **After QVERIFY pass** | Continue to QDOC | STOP, wait for user |
| **After QGIT** | Monitor deployment (autonomous) | STOP (user monitors) |
| **Production failure** | Auto-fix (max 3) | STOP, escalate to user |
| **5 failed attempts** | Exec-team → consensus or escalate | STOP, escalate to user |
| **No Playwright tests** | BLOCK, require creation | BLOCK, require creation |
| **No screenshot proof** | BLOCK, require capture | BLOCK, require capture |

---

## Decision Points Summary

**Autonomous workflow makes these decisions automatically:**

1. ✅ Which issues to fix (team debate, not stack ranking)
2. ✅ How many iterations to attempt (4x per phase)
3. ✅ When to escalate to exec-team (5 attempts)
4. ✅ Whether to apply consensus solution (if not major design change)
5. ✅ Whether to auto-fix production failures (if safe fix)
6. ✅ When to escalate to human (no consensus, unsafe fix, max attempts)

**User still controls:**

1. 🔧 Overall task definition ("implement hero carousel")
2. 🔧 Requirements (via requirements/current.md)
3. 🔧 Execution mode (autonomous vs interactive)
4. 🔧 Final approval on major design changes
5. 🔧 Escalated decisions (when exec-team can't reach consensus)

---

**See Full Spec:** `docs/project/QRUNFREE-IMPLEMENTATION-PLAN.md`
**See Summary:** `docs/project/QRUNFREE-EXECUTIVE-SUMMARY.md`
