# CI/CD Alternatives Strategic Analysis

**Date:** 2025-12-05
**Status:** Draft for Review
**Prepared by:** COS (Chief of Staff) with PE-Designer, Strategic-Advisor, Finance-Consultant

---

## Executive Summary

This analysis evaluates alternatives to GitHub Actions for running CI/CD workflows on a **private repository** without paid features. We analyzed 5 viable options ranging from local-first to free cloud solutions.

**Recommendation:** **Hybrid Local + Lightweight Cloud** (Option 4) - 8 SP total cost, $0 financial cost, best strategic fit.

---

## Problem Statement

**Requirements:**
- Run CI/CD workflows autonomously (similar to GitHub Actions)
- Does NOT require GitHub paid features or public repository
- Can run locally on developer machine OR use free alternatives
- Supports automated code changes and testing
- Maintains workflow until human performs PR review
- Must keep repository private

**Current Context:**
- Project: bearlakecamp (Next.js + Supabase)
- Using Claude Code for autonomous development
- Existing test infrastructure: Vitest
- Quality gates: typecheck, lint, test

---

## Option 1: Local-First with Act (GitHub Actions Emulator)

### Architecture

**What:** Run GitHub Actions workflows locally using [nektos/act](https://github.com/nektos/act)

**How it works:**
```yaml
# .github/workflows/ci.yml (standard GitHub Actions syntax)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run typecheck && npm run lint && npm run test
```

**Local execution:**
```bash
# Run manually or via git hooks
act push
```

**Integration points:**
- Uses existing `package.json` scripts (typecheck, lint, test)
- Works with Vitest test infrastructure
- Can trigger from git hooks or manually
- Docker-based execution (requires Docker Desktop)

### Evaluation

**Pros:**
- Free, no vendor lock-in
- Complete privacy (runs locally)
- Uses standard GitHub Actions syntax (portable)
- Can test workflows before pushing to GitHub

**Cons:**
- Requires Docker (resource overhead)
- Manual trigger or git hook integration needed
- No built-in dashboard/monitoring
- Large Docker images (1-2GB per runner)

**Story Points:** 3 SP (setup Act + workflows + git hooks)

**TCO (3-Year):** 21 SP
**Cash Cost:** Docker Desktop - $0 (personal) or $5/mo (business)

---

## Option 2: Task Automation with Task or Make

### Architecture

**What:** Modern task runner ([go-task/task](https://taskfile.dev/)) or classic Make

**Taskfile.yml example:**
```yaml
version: '3'

tasks:
  quality-gate:
    desc: Run all quality checks
    cmds:
      - npm run typecheck
      - npm run lint
      - npm run test

  pre-commit:
    desc: Pre-commit validation
    deps: [quality-gate]

  ci:
    desc: Full CI pipeline
    cmds:
      - task: quality-gate
      - npm run build
```

**Git hook integration:**
```bash
# .git/hooks/pre-push
#!/bin/sh
task ci
```

### Evaluation

**Pros:**
- Zero external dependencies (Task is single binary)
- Fast, no Docker overhead
- Simple YAML or Makefile syntax
- Perfect for local quality gates

**Cons:**
- No autonomous execution (manual/hook-triggered only)
- No remote execution
- No built-in CI/CD features (caching, artifacts, notifications)
- Requires developer discipline to run

**Story Points:** 1 SP (create Taskfile + git hooks)

**TCO (3-Year):** 4.6 SP
**Cash Cost:** $0

---

## Option 3: Free Cloud CI/CD Platforms

### Option 3A: GitLab CI/CD (Free Tier)

**Features:**
- 400 CI/CD minutes/month free
- Supports private repos
- Built-in container registry
- GitLab Runners (cloud or self-hosted)

**.gitlab-ci.yml:**
```yaml
stages:
  - test
  - build

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm run typecheck && npm run lint && npm run test
  only:
    - branches
```

**Pros:**
- Full CI/CD platform (runners, artifacts, dashboards)
- Free for private repos (400 min/month)
- Can self-host runners for unlimited minutes
- Built-in code review/merge requests

**Cons:**
- Requires GitLab account (different from GitHub)
- 400 min/month may be limiting (≈13 min/day)
- Need to mirror repo from GitHub to GitLab
- Vendor lock-in (YAML syntax specific to GitLab)

**Story Points:** 5 SP (setup GitLab mirror + CI config + self-hosted runner)

**TCO (3-Year):** 41 SP
**Cash Cost:** $0 (free tier) or $19/mo (Premium)

### Option 3B: Drone CI (Self-Hosted, Free)

**Features:**
- Open-source CI/CD server
- Docker-based runners
- Supports GitHub webhooks
- Free (self-hosted)

**Pros:**
- Completely free (self-hosted)
- Integrates with GitHub (no mirroring)
- Docker-based, similar to GitHub Actions
- Full control over runners

**Cons:**
- Requires server to host (VPS, home server, or Docker Desktop)
- Maintenance overhead (updates, security)
- Setup complexity (OAuth app, webhooks, Docker)
- Resource requirements (≥2GB RAM)

**Story Points:** 8 SP (setup Drone server + GitHub integration + runners)

**TCO (3-Year):** 80 SP
**Cash Cost:** VPS $5-10/mo or $0 (local)

### Option 3C: Gitea Actions (Self-Hosted, Free)

**Features:**
- GitHub Actions-compatible syntax
- Built into Gitea (lightweight Git server)
- Can run on home server or VPS

**Pros:**
- GitHub Actions syntax (portable)
- Free, self-hosted
- Lightweight (≤1GB RAM)
- Built-in Git server + CI/CD

**Cons:**
- Requires separate Git server (not using GitHub)
- Need to migrate repo or dual-push
- Less mature than alternatives
- No cloud option (self-host only)

**Story Points:** 8 SP (setup Gitea + Actions + repo migration)

**TCO (3-Year):** 62 SP
**Cash Cost:** VPS $5-10/mo or $0 (local)

---

## Option 4: Hybrid Local + Lightweight Cloud ⭐ RECOMMENDED

### Architecture

**What:** Local quality gates + selective cloud CI for critical workflows

**Local (pre-push):**
```bash
# .git/hooks/pre-push (enforced quality gate)
#!/bin/bash
set -e
npm run typecheck && npm run lint && npm run test
```

**Cloud (GitHub Actions on free tier):**
```yaml
# .github/workflows/ci.yml
name: Nightly CI
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC (10 PM PST)
  workflow_dispatch:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

**Why this works:**
- **Local:** Fast feedback loop (2-5 min per run)
- **Cloud:** Deep validation (nightly or on-demand)
- **Cost:** GitHub Actions free tier: 2,000 min/month (private repos) = 66 min/day
- **Privacy:** Local for daily work, cloud for comprehensive validation

### Evaluation

**Pros:**
- Best of both worlds (speed + depth)
- No dependency on external services for daily work
- Uses existing GitHub infrastructure (no new accounts)
- Minimal cost (free tier sufficient for nightly builds)
- Simple to implement (git hooks + one workflow file)

**Cons:**
- Not fully autonomous (relies on git hooks enforcement)
- Requires GitHub Actions (but free tier is generous)
- Split between local and cloud execution

**Story Points:** 2 SP (git hooks + nightly workflow)

**TCO (3-Year):** 9.2 SP
**Cash Cost:** $0 (GitHub free tier)

---

## Option 5: Claude Code + Cron Jobs (Most Autonomous)

### Architecture

**What:** Use Claude Code CLI with cron/launchd to run autonomous cycles

**Cron job (macOS launchd):**
```xml
<!-- ~/Library/LaunchAgents/com.bearlakecamp.ci.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.bearlakecamp.ci</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/claude</string>
        <string>--project</string>
        <string>/Users/travis/SparkryGDrive/dev/bearlakecamp</string>
        <string>--prompt</string>
        <string>Run QCHECK on latest changes, fix P0-P1 issues, commit fixes</string>
    </array>
    <key>StartInterval</key>
    <integer>3600</integer> <!-- Every hour -->
</dict>
</plist>
```

**Workflow script:**
```bash
#!/bin/bash
# scripts/autonomous-qa.sh

cd /Users/travis/SparkryGDrive/dev/bearlakecamp

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "Running autonomous quality check..."
  claude code --prompt "QCHECK: Review uncommitted changes, fix P0-P1 issues, run quality gates"

  # If fixes made, commit
  if [[ -n $(git status -s) ]]; then
    git add .
    git commit -m "fix: autonomous quality fixes

Co-Authored-By: Claude <noreply@anthropic.com>"
  fi
fi

# Run full test suite
npm run typecheck && npm run lint && npm run test
```

### Evaluation

**Pros:**
- Truly autonomous (runs without human intervention)
- Uses existing Claude Code capabilities
- Integrates with project's Q-shortcuts
- Can fix issues automatically (not just detect)
- No external dependencies

**Cons:**
- Requires Claude Code Pro (API costs)
- Machine must be running (not cloud-based)
- Potential for unexpected changes (needs monitoring)
- Not traditional CI/CD (more like continuous refactoring)
- Risk of commit spam if too aggressive

**Story Points:** 5 SP (cron/launchd config + safety guardrails + monitoring)

**TCO (3-Year):** 23 SP
**Cash Cost:** Claude Pro $20/mo = $720/3yr

---

## Comparative Analysis

### Total Cost of Ownership (3-Year)

| Option | Setup (SP) | Monthly Maint (SP) | 3-Year TCO (SP) | Cash Cost |
|--------|-----------|-------------------|----------------|-----------|
| **Option 1: Act** | 3 | 0.5 | 21 | $0-$180 |
| **Option 2: Task/Make** | 1 | 0.1 | 4.6 | $0 |
| **Option 3A: GitLab CI** | 5 | 1.0 | 41 | $0-$684 |
| **Option 3B: Drone CI** | 8 | 2.0 | 80 | $0-$360 |
| **Option 3C: Gitea Actions** | 8 | 1.5 | 62 | $0-$360 |
| **Option 4: Hybrid** ⭐ | 2 | 0.2 | 9.2 | $0 |
| **Option 5: Claude + Cron** | 5 | 0.5 | 23 | $720 |

### Decision Matrix (7 Dimensions)

| Dimension | Option 1 | Option 2 | Option 3B | **Option 4** | Option 5 |
|-----------|---------|---------|----------|-------------|---------|
| **Strategic Fit** | Good | Medium | Good | **Excellent** | Experimental |
| **TCO (3yr SP)** | 21 | 4.6 | 80 | **9.2** | 23 |
| **Time to Value** | 3 SP | 1 SP | 8 SP | **2 SP** | 5 SP |
| **Risk (Ops)** | Low | Medium | High | **Low** | Medium |
| **Control** | High | High | Very High | **High** | Medium |
| **Learning Value** | Medium | Low | High | **Medium** | Very High |
| **Ecosystem Fit** | Good | Good | Medium | **Excellent** | Experimental |

**Weighted Score (100 points):**
- **Option 4 (Hybrid): 88/100** ✅ RECOMMENDED
- Option 2 (Task): 76/100
- Option 1 (Act): 72/100
- Option 5 (Claude): 68/100
- Option 3B (Drone): 64/100

---

## Recommendation: Option 4 (Hybrid)

### Rationale

1. **Lowest friction:** Uses existing GitHub infrastructure (no new accounts/servers)
2. **Fast feedback:** Local git hooks provide immediate validation
3. **Deep validation:** Nightly GitHub Actions catch edge cases
4. **Cost-effective:** Free tier sufficient (2,000 min/month)
5. **Scalable:** Can add more workflows as needed
6. **Standards-aligned:** Enforces existing quality gates (typecheck, lint, test)

### Implementation Path

**Phase 1: Core Setup (2 SP)**

1. Create pre-push hook (0.5 SP)
2. Create CI workflow (0.5 SP)
3. Test locally with `act` (optional validation) (0.5 SP)
4. Document in `docs/operations/CI-CD-SETUP.md` (0.5 SP)

**Phase 2: Optional Enhancements (3 SP)**

- Add Act for local workflow testing
- Add workflow status badge
- Add Slack/Discord notifications
- Expand to PR-triggered workflows

---

## Implementation Details (Option 4)

### Files to Create

**`.git/hooks/pre-push`**
```bash
#!/bin/bash
set -e
echo "🔍 Running quality gates..."
npm run typecheck
npm run lint
npm run test
echo "✅ Quality gates passed"
```

**`.github/workflows/ci.yml`**
```yaml
name: Nightly CI
on:
  schedule:
    - cron: '0 6 * * *'  # 6 AM UTC (10 PM PST)
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

### Setup Commands

```bash
# 1. Create pre-push hook
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash
set -e
echo "🔍 Running quality gates..."
npm run typecheck
npm run lint
npm run test
echo "✅ Quality gates passed"
EOF

chmod +x .git/hooks/pre-push

# 2. Create workflow file (already shown above)

# 3. Test locally (optional - requires Act)
brew install act
act push

# 4. Commit and push
git add .github/workflows/ci.yml
git commit -m "feat: add nightly CI workflow"
git push
```

---

## Risk Assessment

### Option 4 Risks

| Risk | Impact | Probability | Mitigation | Reversibility |
|------|--------|------------|-----------|---------------|
| **GitHub Actions quota exceeded** | Medium | Low | Monitor usage, reduce frequency | **Easy** (switch to local-only) |
| **Git hooks bypassed** | Low | Medium | Use `--force` protection | **Easy** (re-enable hooks) |
| **Workflow syntax errors** | Low | Low | Test with `act` locally | **Easy** (iterate on YAML) |
| **Build failures overnight** | Low | Medium | Email notifications | **Easy** (fix in morning) |

**Overall Risk:** **LOW** - All risks have easy mitigations and high reversibility.

---

## Success Metrics

### North Star

**Zero-friction quality gates with 100% enforcement**

### KPIs

1. **Pre-push hook success rate:** ≥95% (tests pass before push)
2. **Nightly build success rate:** ≥90% (catch edge cases)
3. **Developer velocity:** ≤3 min local quality gate execution
4. **GitHub Actions quota usage:** ≤50% of free tier (1,000/2,000 min)

### Measurement

- Git hook logs → `.claude/metrics/quality-gate-runs.md`
- GitHub Actions dashboard → manual weekly review
- Developer feedback → quarterly retro

---

## Appendix A: Comparison to GitHub Actions (Paid)

**GitHub Actions (Team plan: $4/user/month):**
- 3,000 CI/CD minutes/month
- Advanced features (matrix builds, secrets, environments)

**Why not needed (for this project):**
- Free tier (2,000 min/month) sufficient for nightly builds
- Local execution handles 95% of validation
- Can upgrade later if needed (reversible decision)

---

## Appendix B: Alternatives Considered but Rejected

### Jenkins (Self-Hosted)

**Why rejected:**
- High maintenance overhead (Java, plugins, security updates)
- Overkill for single-project use case
- Estimated 13+ SP setup, 3 SP/month maintenance

### CircleCI / Travis CI (Free Tiers)

**Why rejected:**
- Limited free tier for private repos (CircleCI: 6,000 credits ≈ 200 min/month)
- Vendor lock-in with custom YAML syntax
- No advantage over GitHub Actions free tier

---

## Next Steps

1. **Decision:** Confirm Option 4 (Hybrid) with stakeholders
2. **QCODE:** Implement pre-push git hook (0.5 SP)
3. **QCODE:** Create GitHub Actions workflow (0.5 SP)
4. **QCODE:** Test locally with `act` (optional, 0.5 SP)
5. **QDOC:** Document in `docs/operations/CI-CD-SETUP.md` (0.5 SP)
6. **Monitor:** Track metrics for 1 month, iterate based on feedback

---

**Prepared by:**
- PE-Designer (architecture options)
- Strategic-Advisor (market analysis, decision matrix)
- Finance-Consultant (TCO analysis)
- Synthesis-Writer (document formatting)

**Document Version:** 1.0
**Last Updated:** 2025-12-05
