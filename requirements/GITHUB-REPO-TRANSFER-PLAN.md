# GitHub Repository Transfer Plan: sparkst → blceditor

**Status**: Centralization COMPLETE ✅ \| **Verified**: 2026-01-13 (33/33 smoke tests passed)

**Current**: `sparkst/bearlakecamp` \@ `prelaunch.bearlakecamp.com` **Target**: `blceditor/bearlakecamp` \@ `www.bearlakecamp.com`

------------------------------------------------------------------------

# Part A: Repository Transfer (sparkst → blceditor)

*Domain stays at prelaunch.bearlakecamp.com during this phase*

### Step A1: Edit Master Config - GitHub Only (1 min)

Edit `config/repository.yaml` (only the `github` section):

``` yaml
github:
  owner: blceditor                              # ← Change from sparkst
  repo: bearlakecamp
  full: blceditor/bearlakecamp                  # ← Change from sparkst/bearlakecamp
  app_slug: bearlakecamp-cms
  url: https://github.com/blceditor/bearlakecamp  # ← Change URL

site:
  production_domain: prelaunch.bearlakecamp.com   # ← Keep unchanged for now
  production_url: https://prelaunch.bearlakecamp.com
  keystatic_url: https://prelaunch.bearlakecamp.com/keystatic
```

### Step A2: Regenerate Config Files (30 sec)

``` bash
npm run generate:config
```

This updates: `lib/config/*.ts`, `config/site.sh`, `tests/fixtures/config.ts`

### Step A3: Perform GitHub Transfer (5 min)

1.  Go to: https://github.com/sparkst/bearlakecamp/settings
2.  Scroll to "Danger Zone" → "Transfer ownership"
3.  Transfer to: `blceditor`
4.  Confirm transfer

### Step A4: Update Git Remote (1 min)

``` bash
git remote set-url origin https://github.com/blceditor/bearlakecamp.git
git remote -v  # Verify
```

### Step A5: Update Vercel (5 min)

1.  **Vercel Dashboard** → Project Settings → Git
2.  Disconnect current repository
3.  Connect to `blceditor/bearlakecamp`
4.  **Environment Variables** → Update `GITHUB_OWNER` to `blceditor`

### Step A6: Update GitHub App (3 min)

1.  Go to GitHub App settings (`bearlakecamp-cms`)
2.  Install on `blceditor` account if different
3.  Grant access to `blceditor/bearlakecamp`

### Step A7: Commit & Verify (5 min)

``` bash
# Run tests locally
npm run typecheck && npm run lint && npm test

# Commit changes
git add -A
git commit -m "chore: transfer repository to blceditor"
git push origin main

# Wait for Vercel deployment (~2 min)
sleep 120

# Verify production (still on prelaunch domain)
./scripts/smoke-test.sh --force prelaunch.bearlakecamp.com
```

### Step A8: Update Documentation - GitHub References (10 min)

Global search/replace for GitHub references only:

``` bash
# Find all sparkst occurrences
grep -rn "sparkst" docs/ README.md requirements/

# Replace sparkst with blceditor in documentation
# (manually or via sed)
```

**Estimated Time for Part A**: \~30 minutes

------------------------------------------------------------------------

# Part B: Domain Migration (prelaunch → www)

*Perform this phase separately, after repository transfer is verified working*

### Step B1: Edit Master Config - Site Only (1 min)

Edit `config/repository.yaml` (only the `site` section):

``` yaml
github:
  owner: blceditor                              # Already updated in Part A
  repo: bearlakecamp
  full: blceditor/bearlakecamp
  app_slug: bearlakecamp-cms
  url: https://github.com/blceditor/bearlakecamp

site:
  production_domain: www.bearlakecamp.com       # ← Change from prelaunch
  production_url: https://www.bearlakecamp.com  # ← Change URL
  keystatic_url: https://www.bearlakecamp.com/keystatic  # ← Change URL
```

### Step B2: Regenerate Config Files (30 sec)

``` bash
npm run generate:config
```

### Step B3: Update Manual Configs (5 min)

| File | Change |
|-------------------------------|-----------------------------------------|
| `.claude/settings.json` | Line 20: `"productionDomain": "www.bearlakecamp.com"` |
| `CLAUDE.md` | Update productionDomain example if present |

### Step B4: Update Vercel Domain (5 min)

1.  **Vercel Dashboard** → Project Settings → Domains
2.  Add `www.bearlakecamp.com` as primary domain
3.  Configure DNS (if not already done)
4.  Optionally remove or redirect `prelaunch.bearlakecamp.com`

### Step B5: Commit & Verify (5 min)

``` bash
# Run tests locally
npm run typecheck && npm run lint && npm test

# Commit changes
git add -A
git commit -m "chore: migrate domain to www.bearlakecamp.com"
git push origin main

# Wait for Vercel deployment (~2 min)
sleep 120

# Verify production on new domain
./scripts/smoke-test.sh --force www.bearlakecamp.com
```

### Step B6: Update Documentation - Domain References (10 min)

Global search/replace for domain references:

``` bash
# Find all prelaunch occurrences
grep -rn "prelaunch.bearlakecamp.com" docs/ README.md requirements/

# Replace with www.bearlakecamp.com
# (manually or via sed)
```

**Estimated Time for Part B**: \~25 minutes

------------------------------------------------------------------------

## Quick Reference

### Part A: Repository Transfer

| What | Old Value | New Value |
|------------------|---------------------------|---------------------------|
| GitHub Owner | `sparkst` | `blceditor` |
| GitHub Repo | `sparkst/bearlakecamp` | `blceditor/bearlakecamp` |
| Git Remote | `https://github.com/sparkst/bearlakecamp.git` | `https://github.com/blceditor/bearlakecamp.git` |

### Part B: Domain Migration

| What | Old Value | New Value |
|------------------|---------------------------|---------------------------|
| Production Domain | `prelaunch.bearlakecamp.com` | `www.bearlakecamp.com` |
| Production URL | `https://prelaunch.bearlakecamp.com` | `https://www.bearlakecamp.com` |

**Total Estimated Time**: \~55 minutes (30 min Part A + 25 min Part B)

------------------------------------------------------------------------

## Detailed Reference (Original Analysis Below)

------------------------------------------------------------------------

## 1. Complete Inventory of References

### 1.1 CRITICAL: Source Code (Must Update for Functionality)

| File | Line(s) | Reference Type | Priority |
|-----------------|-----------------|-----------------------|-----------------|
| `lib/keystatic/constants.ts` | 83 | Default fallback owner | P0 |
| `lib/keystatic-reader.ts` | 20 | Default fallback repo | P0 |
| `app/api/submit-bug/route.ts` | 143 | Default fallback owner | P0 |
| `app/api/keystatic/git-dates/route.ts` | 81-82 | Default fallback owner/repo | P0 |
| `components/admin/AdminNavStrip.tsx` | 19 | Hardcoded repo constant | P0 |

**Total: 5 files, 6 references**

### 1.2 CRITICAL: Environment Variables (Must Update for Functionality)

| File             | Variable(s)                   | Notes                   |
|------------------|-------------------------------|-------------------------|
| `.env.local`     | `GITHUB_TEST_USER`            | Contains "sparkst"      |
| `.env.local.bak` | `GITHUB_OWNER`, `GITHUB_REPO` | Full credentials backup |
| `.env.verify`    | `GITHUB_OWNER`, `GITHUB_REPO` | Verification template   |

**Environment Variables to Update in Vercel Dashboard**: - `GITHUB_OWNER` = "sparkst" -\> "blceditor" - `GITHUB_REPO` = "bearlakecamp" (unchanged if repo name stays same)

### 1.3 CRITICAL: Git Remote Configuration

``` bash
# Current:
origin  https://github.com/sparkst/bearlakecamp.git (fetch)
origin  https://github.com/sparkst/bearlakecamp.git (push)

# After transfer:
origin  https://github.com/blceditor/bearlakecamp.git (fetch)
origin  https://github.com/blceditor/bearlakecamp.git (push)
```

### 1.4 HIGH: Vercel Project Configuration

| File | Content |
|-----------------------------|-------------------------------------------|
| `.vercel/project.json` | `projectId`, `orgId`, `projectName` (may need re-linking) |

**Note**: After GitHub transfer, Vercel must be re-linked to the new repository location.

### 1.5 HIGH: Test Files with Hardcoded References

| File | Lines | Reference |
|-------------------|---------------------|--------------------------------|
| `app/keystatic/[[...params]]/page.spec.tsx` | 365 | `expect(prodConfig.repo.owner).toBe('sparkst')` |
| `lib/keystatic-reader.spec.ts` | 27, 39, 61, 73, 116 | `vi.stubEnv('GITHUB_REPO', 'sparkst/bearlakecamp')` |
| `app/api/submit-bug/route.spec.ts` | 7, 73, 119, 161, 298, 345 | Mock repo owner/URLs |
| `tests/integration/draft-mode.spec.ts` | 8 | `vi.stubEnv('GITHUB_REPO', 'sparkst/bearlakecamp')` |
| `components/keystatic/BugReportModal.spec.tsx` | 200, 236 | Mock issue URLs |

**Total: 5 test files, 15+ references**

### 1.6 MEDIUM: Documentation References

Documentation files with repository references (50+ occurrences across 30+ files):

| Directory          | File Count | Typical References                 |
|--------------------|------------|------------------------------------|
| `docs/`            | 18 files   | URLs, clone commands, setup guides |
| `docs/project/`    | 4 files    | Quick reference, context           |
| `docs/technical/`  | 2 files    | Keystatic domain modes             |
| `docs/operations/` | 4 files    | Deployment, collaborator setup     |
| `docs/analysis/`   | 3 files    | Diagnosis reports                  |
| `docs/tasks/`      | 6 files    | Implementation plans               |
| `requirements/`    | 4 files    | Requirements docs                  |
| `README.md`        | 15+ refs   | Main documentation                 |

**Notable High-Traffic Documentation**: - `README.md` - Main entry point (15+ references) - `docs/FINAL-CONFIGURATION.md` - Detailed setup guide - `docs/project/QUICK-REFERENCE.md` - Quick reference card - `docs/operations/DEPLOYMENT.md` - Deployment guide

### 1.7 HIGH: Scripts, Tooling & Domain Configuration

**CRITICAL CHANGE**: The production domain will switch from `prelaunch.bearlakecamp.com` → `www.bearlakecamp.com`

| File | Line(s) | Reference | Priority |
|-----------------|-----------------|---------------------|-------------------|
| `scripts/smoke-test.sh` | 22 | `DEFAULT_DOMAIN="prelaunch.bearlakecamp.com"` | P0 |
| `scripts/post-commit-validate.sh` | \- | References smoke-test.sh domain | P0 |
| `.claude/settings.json` | 20 | `"productionDomain": "prelaunch.bearlakecamp.com"` | P0 |
| `playwright.config.ts` | 37 | `baseURL: process.env.E2E_BASE_URL \|\| "https://prelaunch.bearlakecamp.com"` | P0 |
| `playwright.production.config.ts` | 20 | `baseURL: 'https://prelaunch.bearlakecamp.com'` (hardcoded!) | P0 |
| `diagnose.sh` | \- | GitHub App URL reference | P1 |
| `CLAUDE.md` | 345 | productionDomain in example | P2 |

#### Domain Change Impact Analysis

**Files affected by domain change: 186 files**

| Category | File Count | Key Files |
|----------------------|--------------------------|------------------------|
| E2E Tests (PRODUCTION_URL) | 40+ | tests/e2e/uat/*.spec.ts, tests/e2e/production/*.spec.ts |
| Playwright Configs | 2 | playwright.config.ts, playwright.production.config.ts |
| Shell Scripts | 3 | smoke-test.sh, post-commit-validate.sh, diagnose.sh |
| Settings/Config | 2 | .claude/settings.json, CLAUDE.md |
| Documentation | 130+ | docs/*, requirements/*, README.md |
| Components | 3 | KeystaticToolsHeader.tsx, ProductionLink.tsx, SlugFieldInjector.tsx |

#### Environment Variables for Domain

| Variable           | Current Usage            | Files                 |
|--------------------|--------------------------|-----------------------|
| `E2E_BASE_URL`     | Playwright test base URL | playwright.config.ts  |
| `PRODUCTION_URL`   | E2E test production URL  | 40+ test files        |
| `productionDomain` | Post-commit validation   | .claude/settings.json |

#### Centralization Strategy for Domain

The domain will be centralized via: 1. `config/repository.yaml` - single source of truth 2. `lib/config/site.ts` - generated constants for runtime 3. Environment variable overrides for flexibility

### 1.8 LOW: COS/Planning Documents \[TS- Low but we still MUST DO this and everything above.\]

| File                            | Notes                     |
|---------------------------------|---------------------------|
| `cos/pattern-libraries-spec.md` | Storage config example    |
| `cos/delivery-summary.md`       | Vercel/GitHub commit URLs |

------------------------------------------------------------------------

## 2. Current State Analysis

### 2.1 Scatter Analysis

```         
Category                    | File Count | Reference Count | Centralized?
----------------------------|------------|-----------------|-------------
Source Code (fallbacks)     | 5          | 6               | NO
Environment Variables       | 3+         | 6+              | Partial (Vercel)
Test Files                  | 5          | 15+             | NO
Documentation               | 30+        | 100+            | NO
Scripts                     | 3          | 3               | NO
Git Configuration           | 1          | 1               | N/A
Vercel Configuration        | 1          | 3               | N/A
----------------------------|------------|-----------------|-------------
TOTAL                       | 48+        | 134+            |
```

### 2.2 Problem Statement

The current architecture has **zero centralization** for repository owner/name configuration:

1.  **Hardcoded fallbacks in 5 source files** - Each file has its own fallback string
2.  **Test files use hardcoded mocks** - Not derived from shared config
3.  **Documentation scattered everywhere** - No single source of truth
4.  **No central constants file** - Despite having `lib/keystatic/constants.ts`, repo info isn't there

------------------------------------------------------------------------

## 3. Refactoring Options

### Option A: Minimal Centralization (Recommended for Transfer)

**Approach**: Create a single `lib/config/repository.ts` file with constants, update source code to use it.

``` typescript
// lib/config/repository.ts
export const REPOSITORY = {
  owner: process.env.GITHUB_OWNER || 'blceditor',
  name: process.env.GITHUB_REPO || 'bearlakecamp',
  get full() {
    return `${this.owner}/${this.name}`;
  },
  get url() {
    return `https://github.com/${this.full}`;
  },
};
```

**Pros**: - Quick to implement (2 SP) - Centralizes runtime references - Environment variables still override

**Cons**: - Documentation still manual - Test mocks still need updates

**Story Points**: 2 SP

------------------------------------------------------------------------

### Option B: Full Centralization with Config Generation ✅ SELECTED

**Approach**: Create a master config that generates documentation, test fixtures, and source constants.

``` yaml
# config/repository.yaml - SINGLE SOURCE OF TRUTH
github:
  owner: sparkst              # Current owner (will change to blceditor)
  repo: bearlakecamp
  app_slug: bearlakecamp-cms

site:
  production_domain: prelaunch.bearlakecamp.com  # Will change to www.bearlakecamp.com
  production_url: https://prelaunch.bearlakecamp.com

email:
  contact: info@bearlakecamp.org
  registrar: registrar@bearlakecamp.com
```

``` typescript
// scripts/generate-config.ts
// Generates:
// - lib/config/repository.ts (GitHub constants)
// - lib/config/site.ts (domain/URL constants)
// - tests/fixtures/config.ts (test fixtures with current values)
// - .env.generated (environment variable template)
```

**Workflow**: 1. Edit `config/repository.yaml` with new values 2. Run `npm run generate:config` (or `npx tsx scripts/generate-config.ts`) 3. Commit generated files 4. All source files import from `lib/config/` - automatically use new values 5. Tests use fixtures that reflect actual config

**Pros**: - Single source of truth for ALL transferable config - Documentation stays in sync - Tests auto-update - Proves centralization works BEFORE transfer - Easy rollback (revert YAML + regenerate)

**Cons**: - More complex (5 SP) - Requires build step - Additional tooling to maintain

**Story Points**: 5 SP (now 8 SP with domain centralization)

------------------------------------------------------------------------

### Option C: Environment-Only (Current Pattern, Enhanced)

**Approach**: Keep environment variables as single source, but add validation and documentation.

``` typescript
// lib/config/env-validator.ts
export function validateRepositoryEnv() {
  const required = ['GITHUB_OWNER', 'GITHUB_REPO'];
  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.warn(`Missing env vars: ${missing.join(', ')}. Using defaults.`);
  }
}
```

**Pros**: - No new abstractions - Works with existing pattern - Flexible for different environments

**Cons**: - Fallbacks still hardcoded in source - Documentation still manual

**Story Points**: 1 SP

------------------------------------------------------------------------

## 4. Implementation Status: Centralization Complete

**Centralization has been implemented.** The codebase now uses a single source of truth.

### Files Created

| File                         | Purpose                                 |
|------------------------------|-----------------------------------------|
| `config/repository.yaml`     | Master configuration (edit this!)       |
| `config/site.sh`             | Generated shell config for bash scripts |
| `lib/config/repository.ts`   | Generated TypeScript config for GitHub  |
| `lib/config/site.ts`         | Generated TypeScript config for domains |
| `lib/config/email.ts`        | Generated TypeScript config for emails  |
| `lib/config/index.ts`        | Re-exports all configs                  |
| `tests/fixtures/config.ts`   | Generated test fixtures                 |
| `scripts/generate-config.ts` | Generator script                        |

### Files Updated to Use Central Config

| File | Change |
|-------------------------------|-----------------------------------------|
| `lib/keystatic/constants.ts` | Uses `DEFAULT_GITHUB_OWNER`, `DEFAULT_GITHUB_REPO` |
| `lib/keystatic-reader.ts` | Uses `DEFAULT_GITHUB_FULL` |
| `app/api/submit-bug/route.ts` | Uses `DEFAULT_GITHUB_OWNER`, `DEFAULT_GITHUB_REPO` |
| `app/api/keystatic/git-dates/route.ts` | Uses `DEFAULT_GITHUB_OWNER`, `DEFAULT_GITHUB_REPO` |
| `components/admin/AdminNavStrip.tsx` | Uses `DEFAULT_GITHUB_FULL` |
| `scripts/smoke-test.sh` | Sources `config/site.sh` |
| `playwright.config.ts` | Uses `DEFAULT_PRODUCTION_URL` |
| `playwright.production.config.ts` | Uses `DEFAULT_PRODUCTION_URL` |

### How to Execute Transfer

1.  **Edit `config/repository.yaml`**:

    ``` yaml
    github:
      owner: blceditor          # Changed from sparkst
      repo: bearlakecamp
      full: blceditor/bearlakecamp
      url: https://github.com/blceditor/bearlakecamp

    site:
      production_domain: www.bearlakecamp.com  # Changed from prelaunch
      production_url: https://www.bearlakecamp.com
    ```

2.  **Regenerate configs**:

    ``` bash
    npm run generate:config
    ```

3.  **Update remaining manual configs** (not auto-generated):

    -   `.claude/settings.json` - productionDomain
    -   Vercel Dashboard - Environment variables
    -   Git remote - `git remote set-url origin ...`

4.  **Update test files** that have hardcoded assertions

5.  **Update documentation** with new values

6.  **Commit and verify**

------------------------------------------------------------------------

## 5. Recommended Approach

### Phase 1: Transfer Execution (8 SP Total)

| Step | Description                            | SP  | Priority |
|------|----------------------------------------|-----|----------|
| 1.1  | Update environment variables in Vercel | 0.5 | P0       |
| 1.2  | Update source code fallbacks (5 files) | 1   | P0       |
| 1.3  | Update test file mocks (5 files)       | 1   | P0       |
| 1.4  | Update git remote                      | 0.1 | P0       |
| 1.5  | Re-link Vercel to new repo             | 0.5 | P0       |
| 1.6  | Update GitHub App settings             | 0.5 | P0       |
| 1.7  | Update local .env files                | 0.2 | P1       |
| 1.8  | Update README.md                       | 1   | P1       |
| 1.9  | Update key documentation (5 files)     | 2   | P2       |
| 1.10 | Update remaining documentation         | 1.2 | P3       |

### Phase 2: Centralization Refactor (2 SP Total)

| Step | Description                               | SP  |
|------|-------------------------------------------|-----|
| 2.1  | Create `lib/config/repository.ts`         | 0.5 |
| 2.2  | Update source files to use central config | 0.5 |
| 2.3  | Create test fixture generator             | 0.5 |
| 2.4  | Document the pattern                      | 0.5 |

------------------------------------------------------------------------

## 5. Implementation Steps (Detailed)

### Step 1.1: Update Vercel Environment Variables (0.5 SP)

1.  Go to Vercel Dashboard \> Project Settings \> Environment Variables
2.  Update for ALL environments (Production, Preview, Development):
    -   `GITHUB_OWNER`: `sparkst` -\> `blceditor`
3.  Trigger redeployment

### Step 1.2: Update Source Code Fallbacks (1 SP)

**Files to modify**:

``` typescript
// lib/keystatic/constants.ts (line 83)
- owner: process.env.GITHUB_OWNER || "sparkst",
+ owner: process.env.GITHUB_OWNER || "blceditor",

// lib/keystatic-reader.ts (line 20)
- const repo = process.env.GITHUB_REPO || 'sparkst/bearlakecamp';
+ const repo = process.env.GITHUB_REPO || 'blceditor/bearlakecamp';

// app/api/submit-bug/route.ts (line 143)
- const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'sparkst';
+ const GITHUB_REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'blceditor';

// app/api/keystatic/git-dates/route.ts (lines 81-82)
- const owner = process.env.GITHUB_OWNER || 'sparkst';
+ const owner = process.env.GITHUB_OWNER || 'blceditor';

// components/admin/AdminNavStrip.tsx (line 19)
- const GITHUB_REPO = "sparkst/bearlakecamp";
+ const GITHUB_REPO = "blceditor/bearlakecamp";
```

### Step 1.3: Update Test Files (1 SP)

**Pattern**: Find/replace with test-specific assertions

``` typescript
// All test files: replace 'sparkst' with 'blceditor'
// Use replace_all in files:
// - app/keystatic/[[...params]]/page.spec.tsx
// - lib/keystatic-reader.spec.ts
// - app/api/submit-bug/route.spec.ts
// - tests/integration/draft-mode.spec.ts
// - components/keystatic/BugReportModal.spec.tsx
```

### Step 1.4: Update Git Remote (0.1 SP)

``` bash
git remote set-url origin https://github.com/blceditor/bearlakecamp.git
git remote -v  # Verify
```

### Step 1.5: Re-link Vercel (0.5 SP)

1.  Vercel Dashboard \> Project Settings \> Git
2.  Disconnect current repository
3.  Connect to `blceditor/bearlakecamp`
4.  Verify webhook is created

### Step 1.6: Update GitHub App (0.5 SP)

1.  Go to GitHub App settings (`bearlakecamp-cms`)
2.  Update callback URLs if needed
3.  Install app on new organization/account if different
4.  Grant access to `blceditor/bearlakecamp`

### Step 1.7: Update Local .env Files (0.2 SP)

``` bash
# .env.local, .env.verify, .env.local.bak
# Replace GITHUB_OWNER="sparkst" with GITHUB_OWNER="blceditor"
```

### Step 1.8: Update README.md (1 SP)

Critical references to update: - Line 72: sparkst/bearlakecamp - Line 113: https://github.com/sparkst/bearlakecamp - Line 158: GITHUB_OWNER \# sparkst - Line 194: GitHub Repo URL - Line 292: Repo URL

### Step 1.9-1.10: Documentation Updates (3.2 SP)

**Priority P2 (Key docs)**: - `docs/FINAL-CONFIGURATION.md` - `docs/project/QUICK-REFERENCE.md` - `docs/operations/DEPLOYMENT.md` - `docs/operations/KEYSTATIC-COLLABORATOR-SETUP.md` - `docs/START-HERE.md`

**Priority P3 (Remaining docs)**: Run global search/replace

------------------------------------------------------------------------

## 6. Verification Checklist

After transfer completion:

-   [ ] Git remote points to new repo
-   [ ] Local `git push` works
-   [ ] Vercel shows new repository connection
-   [ ] Vercel deployments work
-   [ ] Keystatic CMS login works
-   [ ] Keystatic save creates commits in new repo
-   [ ] Bug report submission creates issues in new repo
-   [ ] All tests pass with new references
-   [ ] Production smoke tests pass

------------------------------------------------------------------------

## 7. Rollback Plan

If transfer causes issues:

1.  Revert environment variables in Vercel
2.  Revert source code changes (git revert)
3.  Re-link Vercel to original repo
4.  Update git remote back to original

------------------------------------------------------------------------

## 8. Summary

| Metric                      | Value     |
|-----------------------------|-----------|
| Total Files to Update       | 48+       |
| Total References            | 134+      |
| P0 Files (Critical)         | 10        |
| P1 Files (Important)        | 5         |
| P2/P3 Files (Documentation) | 33+       |
| **Total Estimated SP**      | **10 SP** |

**Recommendation**: Execute Phase 1 for the transfer (8 SP), then implement Phase 2 centralization (2 SP) to prevent this issue in the future.