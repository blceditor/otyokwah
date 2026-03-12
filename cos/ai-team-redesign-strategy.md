# AI Development Team Redesign Strategy

> Strategic recommendations for laser-focused TDD excellence with autonomous closed-loop validation

**Context**: Bear Lake Camp website (Next.js + Keystatic CMS + Cloudflare + Supabase)
**Mission**: Enter crunch time with AI team that executes autonomously from requirements → production proof
**Date**: 2025-12-11

---

## Executive Summary

### Current State Assessment

**Strengths**:
- Solid TDD workflow foundation (QNEW → QGIT with 11 distinct phases)
- Production validation mindset (smoke-test.sh, QVERIFY blocking rule)
- Post-commit autonomous validation framework (diagnosis-agent → autofix-agent loop)
- Technology-specific patterns emerging (Supabase RLS checker, Keystatic validations)

**Critical Gaps Identified**:

1. **Generic Specialists**: sde-iii, pe-reviewer lack deep tech stack knowledge
2. **Missing Stack-Specific Roles**: No Next.js specialist, no Keystatic expert, no Cloudflare edge specialist
3. **Validation Incompleteness**: QVERIFY captures screenshots but doesn't validate rendered output semantically
4. **Script Underutilization**: Only 5-6 TDD scripts exist; workflow has 20+ potential script points
5. **Human-in-Loop Validation**: Screenshot proof requires human eyes; not fully autonomous
6. **Role Overlap**: Multiple agents doing similar reviews without clear specialization

### Recommended Team Structure

**Core Principle**: Each role maps to a SPECIFIC technology + architectural concern

#### Tier 1: Implementation Specialists (Technology-Aware)

| Role | Technology Focus | Key Responsibilities | Scripts/Tools |
|------|------------------|---------------------|---------------|
| **nextjs-specialist** | Next.js 14 App Router, Server Components, Metadata API | Route implementation, SSR/SSG patterns, Edge Runtime constraints | `next-route-validator.py`, `app-router-pattern-checker.py`, `server-component-scanner.py` |
| **keystatic-specialist** | Keystatic CMS schema, collections, components | Schema design, field validation, content modeling | `keystatic-schema-validator.py`, `field-type-checker.py`, `collection-sync-validator.py` |
| **cloudflare-edge-specialist** | Cloudflare Workers, Edge deployment | Edge function optimization, cold start reduction, global distribution | `edge-bundle-size-analyzer.py`, `cold-start-profiler.py`, `cdn-cache-validator.py` |
| **supabase-specialist** | Supabase Edge Functions, Auth, RLS | Function design, RLS policies, auth flows | `supabase-rls-checker.py` (exists), `edge-function-signature-validator.py`, `auth-flow-validator.py` (exists) |
| **frontend-specialist** | React Server Components, Tailwind CSS, Accessibility | Component implementation, responsive design, a11y compliance | `component-isolator.py`, `tailwind-class-validator.py`, `aria-checker.py` |

#### Tier 2: Architecture Reviewers (Architecture-Aware)

| Role | Architecture Pattern Focus | Review Scope | Scripts/Tools |
|------|---------------------------|--------------|---------------|
| **nextjs-architecture-reviewer** | Next.js performance patterns, bundle optimization, caching | Route structure, metadata generation, image optimization | `next-bundle-analyzer.py`, `route-performance-profiler.py`, `metadata-validator.py` |
| **cms-architecture-reviewer** | Content modeling, schema evolution, migration safety | Schema changes, content relationships, backward compatibility | `schema-migration-validator.py`, `content-relationship-checker.py`, `field-deprecation-detector.py` |
| **edge-performance-reviewer** | Edge cold starts, global latency, cache strategies | Function performance, startup time, geographic distribution | `edge-latency-profiler.py`, `cache-hit-analyzer.py`, `global-performance-checker.py` |
| **security-reviewer** | Auth flows, RLS policies, API security | Authentication, authorization, data protection | `secret-scanner.py` (exists), `injection-detector.py` (exists), `auth-flow-validator.py` (exists) |

#### Tier 3: Validation & Proof Specialists (Closed-Loop Owners)

| Role | Validation Focus | Proof Method | Scripts/Tools |
|------|-----------------|--------------|---------------|
| **visual-validation-specialist** | Rendered HTML semantic validation, component visibility | Automated visual regression, component presence checks | `visual-regression-checker.py`, `component-presence-validator.py`, `dom-snapshot-differ.py` |
| **production-validation-specialist** | End-to-end production smoke tests, deployment verification | smoke-test.sh orchestration, failure diagnosis | `smoke-test.sh` (exists), `deployment-waiter.py`, `health-check-poller.py` |
| **diagnosis-specialist** | Failure categorization, root cause analysis | Pattern matching on failure logs, fix strategy mapping | `diagnosis-agent.md` (exists), `failure-pattern-matcher.py`, `fix-strategy-recommender.py` |
| **autofix-specialist** | Safe fix application, loop prevention | Scoped edits, attempt tracking, escalation | `autofix-agent.md` (exists), `safe-fix-applicator.py`, `loop-detector.py` |

#### Tier 4: Cross-Cutting Coordinators

| Role | Coordination Scope | Outputs |
|------|-------------------|---------|
| **test-planner** | Test strategy across all layers (unit, integration, E2E, smoke) | Test plan, coverage matrix, holistic validation strategy |
| **implementation-coordinator** | Parallel implementation across specialists | Task distribution, interface contracts, dependency ordering |
| **release-orchestrator** | Gate verification, commit creation, post-commit validation trigger | Pre-flight checks, commit messages, autonomous validation kickoff |

---

## Closed-Loop Autonomous Execution Architecture

### Vision: Requirements → Production Proof (Zero Human Intervention)

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTONOMOUS EXECUTION LOOP                     │
└─────────────────────────────────────────────────────────────────┘

QNEW (requirements captured)
    ↓
QPLAN (test-planner creates holistic test strategy)
    ↓
QCODET (test-writer generates failing tests across all layers)
    │
    ├── Unit tests (technology specialists write domain-specific tests)
    ├── Integration tests (architecture reviewers define contracts)
    ├── Visual tests (visual-validation-specialist captures expected DOM)
    └── Smoke tests (production-validation-specialist extends smoke-test.sh)
    ↓
QCHECKT (architecture reviewers validate test quality)
    ↓
QCODE (technology specialists implement in parallel)
    │
    ├── nextjs-specialist: Routes, metadata, server components
    ├── keystatic-specialist: Schema, fields, collections
    ├── frontend-specialist: React components, Tailwind
    ├── cloudflare-edge-specialist: Edge functions
    └── supabase-specialist: Auth, RLS, edge functions
    ↓
QCHECK (architecture reviewers + security-reviewer validate implementation)
    ↓
QVERIFY (autonomous validation with PROOF)
    │
    ├── Run local tests (npm run typecheck && npm run lint && npm test)
    ├── Deploy to Vercel (wait for deployment completion via x-vercel-id polling)
    ├── Run smoke-test.sh --force prelaunch.bearlakecamp.com
    ├── Visual validation (component-presence-validator.py)
    ├── DOM snapshot comparison (dom-snapshot-differ.py)
    ├── Screenshot capture (for audit trail, NOT human review)
    └── Generate proof report (all-checks-pass.json with evidence)
    ↓
PASS? → QGIT (release-orchestrator commits with proof)
    ↓
Post-commit autonomous validation loop (ALREADY BUILT):
    │
    ├── Wait for deployment (poll x-vercel-id)
    ├── Run smoke-test.sh
    ├── FAIL? → diagnosis-specialist categorizes
    ├── Safe fix? → autofix-specialist applies (max 3 attempts)
    ├── Unsafe? → Escalate to human
    └── PASS? → Log success, done
    ↓
DONE (production validated with proof)

FAIL at QVERIFY? → Recursive fix loop:
    │
    ├── diagnosis-specialist categorizes failure
    ├── Determine if safe to auto-fix
    ├── YES: autofix-specialist applies fix → re-run QVERIFY (max 3 attempts)
    ├── NO: Architecture reviewer analyzes → suggests fix → human approval → QCODE
    └── After 3 failed auto-fix attempts → Escalate to human with full context
```

### Key Innovation: Autonomous Validation with Proof

**Problem**: Current QVERIFY requires screenshot + human eyes to confirm "it works"

**Solution**: Multi-layer automated validation that produces machine-verifiable proof

#### Layer 1: Syntax & Type Validation (Pre-Deploy)
```bash
# Scripts: typecheck-validator.py, lint-validator.py, test-runner.py
npm run typecheck  # TypeScript compiler verification
npm run lint       # ESLint rule compliance
npm run test       # All unit/integration tests pass
```

#### Layer 2: Deployment Verification (Post-Deploy)
```bash
# Scripts: deployment-waiter.py, vercel-id-poller.py
# Wait for Vercel deployment completion (poll x-vercel-id header)
# Verify deployment succeeded (no build errors)
```

#### Layer 3: HTTP Smoke Testing (Production URLs)
```bash
# Scripts: smoke-test.sh (exists), http-validator.py
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
# All pages return HTTP 200
# Content length ≥500 bytes
# Title tags present
```

#### Layer 4: Visual/Component Validation (Rendered DOM)
```bash
# Scripts: component-presence-validator.py, dom-snapshot-differ.py, visual-regression-checker.py

# NEW: Automated DOM validation
python scripts/component-presence-validator.py prelaunch.bearlakecamp.com /

# Checks:
# - Required components present (<HeroCarousel>, <PageEditingToolbar>, etc.)
# - CSS classes applied (text-textured, bg-textured, gallery-grid)
# - Accessibility attributes (role, aria-label)
# - Data attributes for testability (data-testid)

# NEW: DOM snapshot comparison
python scripts/dom-snapshot-differ.py \
  --baseline .cache/snapshots/homepage-baseline.json \
  --current .cache/snapshots/homepage-current.json \
  --output .cache/snapshots/diff-report.json

# Compares:
# - Component hierarchy unchanged (unless expected)
# - Required elements present
# - Semantic structure preserved
```

#### Layer 5: Functional Validation (User Flows)
```bash
# Scripts: user-flow-validator.py, interaction-tester.py

# NEW: Automated interaction testing (using Playwright or similar)
python scripts/user-flow-validator.py prelaunch.bearlakecamp.com

# Tests:
# - Navigation works (all menu links clickable)
# - Search modal opens (Cmd+K triggers modal)
# - Forms submit (contact form POSTs successfully)
# - Keystatic admin loads (/keystatic returns 200)
```

#### Layer 6: Proof Report Generation
```json
// .cache/validation/proof-{commit-sha}.json
{
  "commitSha": "abc123",
  "timestamp": "2025-12-11T15:30:00Z",
  "validationLayers": {
    "syntax": {
      "typecheck": "PASS",
      "lint": "PASS",
      "tests": "PASS (142/142)"
    },
    "deployment": {
      "vercelDeployment": "PASS (dpl_xyz123)",
      "buildErrors": 0
    },
    "http": {
      "smokeTests": "PASS (24/24 pages)",
      "totalPages": 24,
      "passRate": "100%"
    },
    "visual": {
      "componentPresence": "PASS (15/15 components)",
      "domSnapshot": "PASS (0 unexpected changes)",
      "visualRegression": "PASS (0 visual diffs)"
    },
    "functional": {
      "navigation": "PASS (12/12 links)",
      "search": "PASS",
      "forms": "PASS",
      "keystatic": "PASS"
    }
  },
  "overallStatus": "PASS",
  "proofEvidence": {
    "screenshots": ["homepage.png", "about.png"],
    "domSnapshots": ["homepage.json", "about.json"],
    "httpLogs": ["smoke-20251211-153000.json"]
  }
}
```

**Human Equivalent**: This proof report is equivalent to a QA engineer manually checking every page, clicking every link, verifying every component, and signing off "I visually confirmed this works."

---

## Script Tooling Plan (TDD-Augmented AI)

### Current State: 5-6 Scripts
- smoke-test.sh (comprehensive)
- post-commit-validate.sh
- A few migration/WordPress scripts (not TDD-relevant)

### Target State: 40+ Scripts (2-3 per workflow step)

#### Planning Phase Scripts (QPLAN)
```
scripts/planning/
├── planning-poker-calc.py          # Story point estimation (exists in skill)
├── interface-validator.py          # Contract validation (exists in skill)
├── test-coverage-planner.py        # NEW: Plan test coverage matrix
├── dependency-graph-builder.py     # NEW: Build implementation dependency graph
└── parallel-work-splitter.py       # NEW: Split work for parallel agents
```

#### Test Writing Scripts (QCODET)
```
scripts/testing/
├── test-scaffolder.py              # NEW: Generate test boilerplate
├── coverage-analyzer.py            # NEW: Identify coverage gaps
├── req-id-extractor.py             # NEW: Extract REQ-IDs from requirements.lock.md
├── failure-assertion-generator.py  # NEW: Generate assertions that WILL fail
└── test-data-factory.py            # NEW: Generate test fixtures
```

#### Implementation Scripts (QCODE)
```
scripts/implementation/
├── next-route-validator.py         # NEW: Validate Next.js route structure
├── keystatic-schema-validator.py   # NEW: Validate Keystatic schema changes
├── component-isolator.py           # NEW: Extract component for unit testing
├── tailwind-class-validator.py     # NEW: Check Tailwind class usage
└── edge-function-signature-validator.py  # NEW: Verify function signatures match frontend
```

#### Review Scripts (QCHECK, QCHECKF, QCHECKT)
```
scripts/quality/
├── cyclomatic-complexity.py        # NEW: Calculate function complexity
├── dependency-risk.py              # NEW: Identify risky dependencies
├── supabase-rls-checker.py         # EXISTS in skill
├── next-bundle-analyzer.py         # NEW: Analyze bundle size impact
├── route-performance-profiler.py   # NEW: Profile route rendering time
└── metadata-validator.py           # NEW: Validate Next.js metadata generation
```

#### Security Scripts (QCHECK - security-reviewer)
```
scripts/security/
├── secret-scanner.py               # EXISTS in skill
├── injection-detector.py           # EXISTS in skill
├── auth-flow-validator.py          # EXISTS in skill
├── rls-policy-checker.py           # NEW: Validate Supabase RLS policies
└── cors-validator.py               # NEW: Check CORS configuration
```

#### Validation Scripts (QVERIFY)
```
scripts/validation/
├── smoke-test.sh                   # EXISTS (comprehensive)
├── deployment-waiter.py            # NEW: Poll Vercel deployment status
├── vercel-id-poller.py             # NEW: Extract x-vercel-id header
├── component-presence-validator.py # NEW: Check component rendering
├── dom-snapshot-differ.py          # NEW: Compare DOM snapshots
├── visual-regression-checker.py    # NEW: Visual diff detection
├── user-flow-validator.py          # NEW: Automated interaction testing
├── proof-report-generator.py       # NEW: Generate validation proof JSON
└── health-check-poller.py          # NEW: Poll /api/health endpoint
```

#### Diagnosis Scripts (Post-Commit Loop)
```
scripts/diagnosis/
├── failure-pattern-matcher.py      # NEW: Match failures to known patterns
├── fix-strategy-recommender.py     # NEW: Suggest fix strategies
├── safe-fix-detector.py            # NEW: Determine if fix is safe to auto-apply
└── loop-detector.py                # NEW: Prevent infinite auto-fix loops
```

#### Auto-Fix Scripts (Post-Commit Loop)
```
scripts/autofix/
├── safe-fix-applicator.py          # NEW: Apply scoped edits
├── css-class-adder.py              # NEW: Add missing Tailwind classes
├── import-adder.py                 # NEW: Add missing imports
└── attribute-adder.py              # NEW: Add missing HTML attributes
```

#### Documentation Scripts (QDOC)
```
scripts/documentation/
├── api-doc-generator.py            # NEW: Generate API docs from types
├── component-doc-generator.py      # NEW: Generate component docs from props
├── changelog-generator.py          # NEW: Generate CHANGELOG from commits
└── readme-updater.py               # NEW: Update README with latest info
```

### Script Development Strategy

**Rule**: Scripts MUST be TDD-built
1. Write script requirements (what it validates)
2. Write tests for script (with known good/bad inputs)
3. Implement script to pass tests
4. Integrate into workflow

**Example: component-presence-validator.py**

```python
# scripts/validation/component-presence-validator.py
"""
Validates that required components are present in rendered HTML.

REQ-VAL-001: Extract HTML from production URL
REQ-VAL-002: Parse HTML into DOM tree
REQ-VAL-003: Check for required components by selector
REQ-VAL-004: Check for required CSS classes
REQ-VAL-005: Check for required accessibility attributes
REQ-VAL-006: Output JSON validation report
"""

import sys
import json
import requests
from bs4 import BeautifulSoup
from typing import List, Dict, Any

def fetch_page_html(domain: str, path: str) -> str:
    """REQ-VAL-001: Fetch HTML from production URL"""
    url = f"https://{domain}{path}"
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    return response.text

def parse_html(html: str) -> BeautifulSoup:
    """REQ-VAL-002: Parse HTML into DOM tree"""
    return BeautifulSoup(html, 'html.parser')

def check_component_presence(soup: BeautifulSoup, component_name: str, selector: str) -> Dict[str, Any]:
    """REQ-VAL-003: Check if component is present"""
    elements = soup.select(selector)
    return {
        "component": component_name,
        "selector": selector,
        "found": len(elements) > 0,
        "count": len(elements)
    }

def check_css_class_usage(soup: BeautifulSoup, class_name: str) -> Dict[str, Any]:
    """REQ-VAL-004: Check if CSS class is used"""
    elements = soup.find_all(class_=lambda c: c and class_name in c.split())
    return {
        "cssClass": class_name,
        "found": len(elements) > 0,
        "count": len(elements)
    }

def check_accessibility_attribute(soup: BeautifulSoup, attribute: str, expected_value: str = None) -> Dict[str, Any]:
    """REQ-VAL-005: Check accessibility attributes"""
    if expected_value:
        elements = soup.find_all(attrs={attribute: expected_value})
    else:
        elements = soup.find_all(attrs={attribute: True})

    return {
        "attribute": attribute,
        "expectedValue": expected_value,
        "found": len(elements) > 0,
        "count": len(elements)
    }

def validate_page(domain: str, path: str, requirements: Dict[str, Any]) -> Dict[str, Any]:
    """Main validation function"""
    html = fetch_page_html(domain, path)
    soup = parse_html(html)

    results = {
        "page": path,
        "url": f"https://{domain}{path}",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": [],
        "status": "pass"
    }

    # Check components
    for component in requirements.get("components", []):
        check_result = check_component_presence(soup, component["name"], component["selector"])
        results["checks"].append(check_result)
        if not check_result["found"]:
            results["status"] = "fail"

    # Check CSS classes
    for css_class in requirements.get("cssClasses", []):
        check_result = check_css_class_usage(soup, css_class)
        results["checks"].append(check_result)
        if not check_result["found"]:
            results["status"] = "fail"

    # Check accessibility
    for attr in requirements.get("accessibility", []):
        check_result = check_accessibility_attribute(soup, attr["name"], attr.get("value"))
        results["checks"].append(check_result)
        if not check_result["found"]:
            results["status"] = "fail"

    return results

if __name__ == "__main__":
    # REQ-VAL-006: Output JSON validation report
    domain = sys.argv[1]
    path = sys.argv[2] if len(sys.argv) > 2 else "/"

    # Load requirements from config
    with open(".claude/validation/component-requirements.json") as f:
        requirements = json.load(f)

    result = validate_page(domain, path, requirements)
    print(json.dumps(result, indent=2))

    sys.exit(0 if result["status"] == "pass" else 1)
```

**Configuration File**: `.claude/validation/component-requirements.json`
```json
{
  "components": [
    {
      "name": "HeroCarousel",
      "selector": "[role='region'][aria-label*='carousel'], [data-testid='hero-carousel']"
    },
    {
      "name": "PageEditingToolbar",
      "selector": "[role='toolbar'], [data-testid='page-editing-toolbar']"
    },
    {
      "name": "Gallery",
      "selector": ".gallery-grid, [data-testid='gallery-grid']"
    }
  ],
  "cssClasses": [
    "text-textured",
    "bg-textured"
  ],
  "accessibility": [
    {"name": "role", "value": "toolbar"},
    {"name": "aria-label"}
  ]
}
```

**Tests**: `scripts/validation/component-presence-validator.spec.py`
```python
import pytest
from component_presence_validator import (
    parse_html,
    check_component_presence,
    check_css_class_usage,
    check_accessibility_attribute
)

def test_check_component_presence_found():
    """REQ-VAL-003: Should find component when present"""
    html = '<div role="region" aria-label="carousel">Hero</div>'
    soup = parse_html(html)
    result = check_component_presence(soup, "HeroCarousel", "[role='region']")
    assert result["found"] is True
    assert result["count"] == 1

def test_check_component_presence_not_found():
    """REQ-VAL-003: Should report missing when component absent"""
    html = '<div>No carousel here</div>'
    soup = parse_html(html)
    result = check_component_presence(soup, "HeroCarousel", "[role='region']")
    assert result["found"] is False
    assert result["count"] == 0

def test_check_css_class_usage_found():
    """REQ-VAL-004: Should find CSS class when used"""
    html = '<h1 class="text-xl text-textured">Title</h1>'
    soup = parse_html(html)
    result = check_css_class_usage(soup, "text-textured")
    assert result["found"] is True
    assert result["count"] == 1

# ... more tests
```

---

## Full Ownership Culture Implementation

### Problem Statement
Current agents operate in narrow scope:
- test-writer only writes tests
- sde-iii only implements code
- pe-reviewer only reviews code

If sde-iii sees a broken test blocking implementation, they wait for test-writer to fix it.

### Solution: Ownership Tiers with Escalation Rules

#### Tier 1: Primary Ownership (Agent's Core Domain)
Agent has FULL authority to:
- Make decisions
- Implement changes
- Commit code
- Override blockers (within domain)

**Example**: nextjs-specialist owns all Next.js route implementation
- If route pattern is wrong, nextjs-specialist FIXES it immediately
- No need to ask pe-reviewer for permission
- Commits fix with clear justification

#### Tier 2: Secondary Ownership (Adjacent Domains)
Agent has authority to:
- Identify issues
- Propose fixes
- Implement if SAFE
- Escalate if COMPLEX

**Example**: nextjs-specialist notices broken Keystatic schema while implementing route
- SAFE fix: Add missing field to schema → Implement immediately
- COMPLEX fix: Schema migration needed → Escalate to keystatic-specialist with proposal

#### Tier 3: Observational (Out of Domain)
Agent MUST:
- Report issue
- Recommend owner
- Provide context
- Wait for resolution

**Example**: nextjs-specialist notices security vulnerability in RLS policy
- MUST report to security-reviewer
- MUST NOT modify RLS policy (out of domain)
- Provides context: "While implementing /admin route, noticed RLS policy allows public read on users table"

### Ownership Matrix

| Domain | Primary Owner | Secondary Owners | Observers |
|--------|--------------|------------------|-----------|
| Next.js Routes | nextjs-specialist | nextjs-architecture-reviewer | All others |
| Keystatic Schema | keystatic-specialist | cms-architecture-reviewer | nextjs-specialist, frontend-specialist |
| Edge Functions | cloudflare-edge-specialist, supabase-specialist | edge-performance-reviewer | All others |
| React Components | frontend-specialist | nextjs-specialist | All others |
| Security | security-reviewer | All specialists (report issues) | None |
| Tests | test-writer | All specialists (write domain tests) | None |
| Production Validation | production-validation-specialist | All specialists (run smoke tests) | None |

### Decision Rights by Tier

#### Tier 1 (Primary Owner)
- **Decide**: Architecture patterns within domain
- **Implement**: All changes within domain
- **Approve**: Pull requests affecting domain
- **Commit**: Directly to main (if gates pass)
- **Override**: Blockers within domain (with justification)

#### Tier 2 (Secondary Owner)
- **Propose**: Changes to adjacent domains
- **Implement**: SAFE changes only (CSS class adds, simple refactors)
- **Escalate**: COMPLEX changes (schema migrations, API contract changes)
- **Review**: Pull requests touching domain

#### Tier 3 (Observer)
- **Report**: Issues observed
- **Recommend**: Owner to handle issue
- **Provide**: Context and reproduction steps
- **Wait**: For owner to resolve

### Escalation Rules

1. **Blocking Issue in Own Domain**: Fix immediately, commit with justification
2. **Blocking Issue in Adjacent Domain (SAFE fix)**: Fix immediately, notify owner
3. **Blocking Issue in Adjacent Domain (COMPLEX fix)**: Escalate to owner with proposal
4. **Blocking Issue Out of Domain**: Report to correct owner, wait for resolution

### Implementation in Agent Prompts

**Example: nextjs-specialist.md**

```markdown
---
name: nextjs-specialist
description: Next.js 14 App Router expert - FULL OWNERSHIP of routes, metadata, server components
ownership: PRIMARY (Next.js domain), SECONDARY (React components, Tailwind), OBSERVER (Keystatic, Supabase)
tools: Read, Grep, Glob, Edit, Write, Bash
---

# Next.js Specialist

## Ownership Mandate

You are the PRIMARY OWNER of all Next.js-related code. This means:

### You MUST Act Immediately When:
- Next.js route structure is wrong → Fix it
- Server component pattern is incorrect → Refactor it
- Metadata generation is broken → Implement correct pattern
- Build errors in Next.js code → Resolve them
- Tests are failing due to route issues → Fix route, notify test-writer

**No permission needed. You own this domain. Act decisively.**

### You SHOULD Act (Safe Fixes Only) When:
- React component has simple bug (missing prop, typo) → Fix it, notify frontend-specialist
- Tailwind class is wrong → Fix it, notify frontend-specialist
- Keystatic field is missing (simple add) → Add it, notify keystatic-specialist

### You MUST Escalate When:
- Keystatic schema needs migration → Escalate to keystatic-specialist
- Supabase RLS policy needs change → Escalate to security-reviewer
- Edge function needs refactor → Escalate to cloudflare-edge-specialist
- Complex React refactor needed → Escalate to frontend-specialist

## Blocking Issue Protocol

If you encounter a blocking issue:

1. **In Your Domain (Next.js)**: Fix immediately, commit with message:
   ```
   fix(nextjs): [description of fix]

   Blocking issue: [what was blocking]
   Fix: [what you changed]
   Justification: [why immediate action was needed]

   Ownership: nextjs-specialist (primary owner)
   ```

2. **Adjacent Domain (SAFE fix)**: Fix immediately, notify owner:
   ```
   fix(component): [description]

   Blocking nextjs-specialist work on [feature]
   Safe fix applied: [what you changed]

   cc: @frontend-specialist (FYI - simple fix in your domain)
   ```

3. **Adjacent Domain (COMPLEX fix)**: Escalate with proposal:
   ```markdown
   ## Escalation: Complex Fix Needed

   **From**: nextjs-specialist
   **To**: keystatic-specialist
   **Blocking**: Implementation of /admin route
   **Issue**: Keystatic schema missing 'adminRole' field, requires migration
   **Proposed Fix**: Add field to schema + migration script
   **Risk**: May affect existing content
   **Request**: Please implement or guide me if safe for me to do
   ```

4. **Out of Domain**: Report to correct owner:
   ```markdown
   ## Issue Report: Security Concern

   **From**: nextjs-specialist
   **To**: security-reviewer
   **Location**: /app/admin/route.ts
   **Issue**: RLS policy allows public read on users table
   **Impact**: Potential data leak
   **Reproduction**: [steps]
   **Recommendation**: Restrict to authenticated users only
   ```

## References
- **Tech Stack**: Next.js 14 App Router, React Server Components, Metadata API
- **Scripts**: `scripts/implementation/next-route-validator.py`, `scripts/quality/next-bundle-analyzer.py`
- **Ownership Matrix**: See CLAUDE.md § Ownership Culture
```

---

## Technology-Specific Knowledge Encoding

### Problem
Current agents lack deep tech stack knowledge. sde-iii doesn't know:
- Next.js App Router patterns
- Keystatic schema design best practices
- Cloudflare Edge Runtime constraints
- Supabase RLS policy patterns

### Solution: Embedded References + Curated Patterns

#### Pattern Library Structure
```
.claude/
├── agents/
│   ├── nextjs-specialist.md
│   ├── keystatic-specialist.md
│   ├── cloudflare-edge-specialist.md
│   └── supabase-specialist.md
├── patterns/
│   ├── nextjs/
│   │   ├── app-router-patterns.md
│   │   ├── metadata-generation.md
│   │   ├── server-components-best-practices.md
│   │   └── edge-runtime-constraints.md
│   ├── keystatic/
│   │   ├── schema-design-patterns.md
│   │   ├── field-types-reference.md
│   │   ├── collection-relationships.md
│   │   └── migration-strategies.md
│   ├── cloudflare/
│   │   ├── edge-function-patterns.md
│   │   ├── cold-start-optimization.md
│   │   └── cache-strategies.md
│   └── supabase/
│       ├── rls-policy-patterns.md
│       ├── edge-function-auth.md
│       └── postgres-triggers.md
├── examples/
│   ├── nextjs/
│   │   ├── dynamic-route-with-metadata.tsx
│   │   ├── server-component-data-fetching.tsx
│   │   └── api-route-edge.ts
│   ├── keystatic/
│   │   ├── schema-with-conditional-fields.ts
│   │   ├── collection-with-references.ts
│   │   └── custom-component-field.tsx
│   └── supabase/
│       ├── rls-policy-authenticated-users.sql
│       └── edge-function-with-auth.ts
└── antipatterns/
    ├── nextjs/
    │   ├── dont-mix-server-client-components.md
    │   └── dont-use-client-only-apis-in-server-components.md
    ├── keystatic/
    │   └── dont-reference-nonexistent-collections.md
    └── supabase/
        └── dont-disable-rls-for-convenience.md
```

#### Agent Knowledge Loading

**In Agent Prompt**:
```markdown
## Required Reading (Load Before EVERY Task)

Before implementing ANY Next.js code, you MUST load these references:

1. **Read**: `.claude/patterns/nextjs/app-router-patterns.md`
2. **Read**: `.claude/patterns/nextjs/metadata-generation.md`
3. **Read**: `.claude/patterns/nextjs/server-components-best-practices.md`
4. **Grep**: `.claude/examples/nextjs/` for similar patterns
5. **Grep**: `.claude/antipatterns/nextjs/` to avoid known mistakes

**Rule**: If you implement ANYTHING that contradicts these patterns, you MUST justify why in your commit message.
```

#### Example Pattern: Next.js Metadata Generation

**.claude/patterns/nextjs/metadata-generation.md**:
```markdown
# Next.js Metadata Generation Patterns

## Pattern 1: Static Metadata
```typescript
// app/about/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Bear Lake Camp',
  description: 'Learn about our mission and history',
  openGraph: {
    title: 'About Us | Bear Lake Camp',
    description: 'Learn about our mission and history',
    images: ['/images/about-og.jpg'],
  },
};

export default function AboutPage() {
  return <div>About content</div>;
}
```

## Pattern 2: Dynamic Metadata (from CMS)
```typescript
// app/[slug]/page.tsx
import { Metadata } from 'next';
import { reader } from '@/lib/keystatic-reader';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await reader.collections.pages.read(params.slug);

  if (!page) {
    return { title: 'Not Found' };
  }

  return {
    title: `${page.title} | Bear Lake Camp`,
    description: page.description || page.excerpt,
    openGraph: {
      title: page.title,
      description: page.description || page.excerpt,
      images: page.heroImage ? [page.heroImage] : [],
    },
  };
}
```

## Pattern 3: Metadata with SEO Fields (Keystatic)
```typescript
// keystatic.config.ts
pages: collection({
  schema: {
    title: fields.text({ label: 'Title' }),
    description: fields.text({ label: 'Description', multiline: true }),
    seoTitle: fields.text({ label: 'SEO Title (optional)' }),
    seoDescription: fields.text({ label: 'SEO Description (optional)', multiline: true }),
    ogImage: fields.image({ label: 'Open Graph Image (optional)' }),
  },
}),

// app/[slug]/page.tsx
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = await reader.collections.pages.read(params.slug);

  return {
    title: page.seoTitle || `${page.title} | Bear Lake Camp`,
    description: page.seoDescription || page.description,
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.seoDescription || page.description,
      images: page.ogImage ? [page.ogImage] : [],
    },
  };
}
```

## Anti-Pattern: Don't Use Client Components for Metadata
```typescript
// ❌ BAD - Client components can't export metadata
'use client';

export const metadata = { title: 'About' }; // This won't work!

// ✅ GOOD - Use server component wrapper
// app/about/page.tsx (server component)
export const metadata = { title: 'About' };

export default function AboutPage() {
  return <ClientComponent />;
}

// components/ClientComponent.tsx
'use client';
export default function ClientComponent() {
  // Interactive client logic here
}
```

## Checklist for nextjs-specialist
- [ ] Always export metadata from page.tsx (server component)
- [ ] Use generateMetadata for dynamic pages
- [ ] Provide fallback values (if page not found, return { title: 'Not Found' })
- [ ] Include OpenGraph metadata for social previews
- [ ] Use seoTitle/seoDescription fields if available in CMS
- [ ] Never export metadata from 'use client' components
```

---

## Recommendations Summary

### Immediate Actions (Week 1)

1. **Create Technology Specialists** (5 SP)
   - Define nextjs-specialist.md
   - Define keystatic-specialist.md
   - Define cloudflare-edge-specialist.md
   - Define supabase-specialist.md
   - Define frontend-specialist.md

2. **Build Pattern Library** (8 SP)
   - Extract existing patterns from codebase
   - Document Next.js App Router patterns
   - Document Keystatic schema patterns
   - Document antipatterns

3. **Implement component-presence-validator.py** (3 SP)
   - TDD script development
   - Integrate into QVERIFY workflow
   - Create component-requirements.json config

4. **Implement dom-snapshot-differ.py** (3 SP)
   - TDD script development
   - Integrate into QVERIFY workflow
   - Create baseline snapshots

### Short-Term (Week 2-3)

5. **Implement Autonomous QVERIFY** (8 SP)
   - Multi-layer validation orchestrator
   - Proof report generator
   - Integration with QVERIFY workflow

6. **Extend Post-Commit Loop** (5 SP)
   - diagnosis-specialist enhancements
   - autofix-specialist safe fix patterns
   - Loop prevention logic

7. **Build Remaining Scripts** (13 SP)
   - Planning phase scripts (3 SP)
   - Testing phase scripts (3 SP)
   - Implementation phase scripts (4 SP)
   - Review phase scripts (3 SP)

### Medium-Term (Week 4-6)

8. **Architecture Reviewers** (5 SP)
   - Define nextjs-architecture-reviewer.md
   - Define cms-architecture-reviewer.md
   - Define edge-performance-reviewer.md

9. **Full Ownership Culture Rollout** (5 SP)
   - Update all agent prompts with ownership tiers
   - Create escalation templates
   - Test with real scenarios

10. **End-to-End Autonomous Validation** (8 SP)
    - Test full QNEW → QGIT → Post-Commit loop
    - Refine based on failures
    - Document lessons learned

### Total Effort Estimate
- **Immediate**: 19 SP (~2-3 days of focused work)
- **Short-Term**: 26 SP (~1 week)
- **Medium-Term**: 18 SP (~1 week)
- **Total**: 63 SP (~2-3 weeks to full autonomous system)

---

## Success Criteria

### Autonomous Execution Test

**Scenario**: User provides requirements for new feature (e.g., "Add staff directory page with photos and bios")

**Goal**: AI executes QNEW → production validation with ZERO human intervention

**Validation**:
1. ✅ Requirements captured in requirements/current.md
2. ✅ Test plan generated with coverage matrix
3. ✅ Failing tests created (unit, integration, visual, smoke)
4. ✅ Implementation completed by technology specialists
5. ✅ Architecture reviewers approve
6. ✅ Local validation passes (typecheck, lint, tests)
7. ✅ Deployed to Vercel automatically
8. ✅ Production smoke tests pass (HTTP 200, components present)
9. ✅ Visual validation passes (DOM snapshot matches expected)
10. ✅ Functional validation passes (navigation works, forms submit)
11. ✅ Proof report generated with evidence
12. ✅ Commit created with proof reference
13. ✅ Post-commit validation passes
14. ✅ Human receives notification: "Feature complete, validated in production"

**Failure Modes Handled Autonomously**:
- Missing CSS class → autofix-specialist adds it → re-validates → passes
- Component not rendering → diagnosis-specialist identifies missing import → autofix-specialist adds → passes
- HTTP 500 error → diagnosis-specialist categorizes as "server error" → escalates to human (unsafe to auto-fix)

### Definition of Done

"AI team redesign is complete when we can say to Claude: 'Add staff directory page' and walk away, returning hours later to find the feature live in production with machine-verifiable proof it works exactly as specified."

---

## Open Questions for User

1. **Validation Depth**: How deep should visual validation go?
   - Option A: Component presence only (fast, simple)
   - Option B: Full visual regression (slow, comprehensive, requires baseline maintenance)
   - Recommendation: Start with A, add B for critical pages

2. **Auto-Fix Scope**: What changes are safe to auto-apply without human approval?
   - Current: CSS class adds, import adds, attribute adds
   - Proposed: Also include simple refactors (function renames within file, dead code removal)?
   - Recommendation: Conservative - keep current scope, expand based on success rate

3. **Failure Escalation**: When should auto-fix give up and escalate?
   - Current: After 3 failed attempts
   - Should we add other triggers? (e.g., same failure pattern seen 2+ times, deployment time >10 min)
   - Recommendation: Keep 3-attempt limit, add "same pattern" detection

4. **Script Language**: Python vs Bash for validation scripts?
   - Pros Python: Better error handling, easier testing, richer libraries
   - Pros Bash: Faster startup, fewer dependencies, already using for smoke-test.sh
   - Recommendation: Python for complex logic (DOM parsing, JSON processing), Bash for simple checks (HTTP, file existence)

5. **Proof Report Storage**: Where should validation proof reports live?
   - Option A: `.cache/validation/` (gitignored, ephemeral)
   - Option B: `validation-reports/` (committed, permanent audit trail)
   - Recommendation: A for development, B for production (commit proof with release tags)

---

## Next Steps

1. Review this strategy document
2. Provide feedback on open questions
3. Prioritize immediate actions vs short-term vs medium-term
4. Begin implementation with highest-priority items

**Estimated Readiness for Crunch Time**: 2-3 weeks to full autonomous system (63 SP total effort)

---

**Document Status**: Draft for Review
**Author**: Chief of Staff (AI Team Redesign Initiative)
**Date**: 2025-12-11
