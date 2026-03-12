# Process Improvements & Best Practices

**Purpose**: Recommendations for reducing cross-session ramp-up time and preventing future organizational confusion.

**Last Updated**: 2025-11-19

---

## Executive Summary

**Problem**: Losing context between sessions, getting lost in mixed project structures, inefficient cross-session handoffs.

**Solution**: Systemic improvements in organization, documentation, tooling, and AI context management.

**Expected Impact**:
- Session startup time: 10 min → <2 min (80% reduction)
- Context confusion: Frequent → Rare
- Project organization: Mixed → Clean separation
- Documentation drift: Common → Prevented

---

## 1. Project Organization Best Practices

### Principle: One Project = One Directory

**Anti-Pattern**:
```
dev/blacklinewebsite/
├── [blackline stuff]
├── requirements/content-hosting/
│   ├── bearlakecamp/              # Old attempt
│   ├── bearlakecamp-nextjs/       # Working code
│   ├── bearlakecamp-mockup/       # Old mockup
│   └── bearlakecamp-tina-backend/ # Failed attempt
```

**Best Practice**:
```
dev/
├── blackline/                      # Blackline project
└── bearlakecamp/                   # Bear Lake Camp project
    ├── [working code]
    ├── docs/
    └── archive/                    # Old attempts if needed
```

### Implementation Guide

**Step 1: Separate Projects**
```bash
# Each project in its own top-level directory
~/dev/project-a/
~/dev/project-b/
~/dev/project-c/

# NOT nested under another project
```

**Step 2: Archive Failed Attempts**
```bash
project-root/
├── [working code]
└── archive/
    ├── ARCHIVE.md                  # What's archived and why
    ├── attempt-1-astro/
    └── attempt-2-gatsby/
```

**Step 3: Use Git Properly**
```bash
# One repo per project
git clone repo.git project-name/

# NOT multiple implementations in same repo
```

---

## 2. Context Management System

### The Context Triangle

Every project needs three levels of context:

```
┌─────────────────────────────────────┐
│  QUICK FACTS (15 seconds)           │  ← Session startup
│  - Status, URLs, key info           │
├─────────────────────────────────────┤
│  RECENT CHANGES (2 minutes)         │  ← What happened recently
│  - Last 3 sessions                  │
│  - Current issues                   │
├─────────────────────────────────────┤
│  FULL CONTEXT (10+ minutes)         │  ← Deep dive when needed
│  - Architecture, decisions, history │
└─────────────────────────────────────┘
```

### CONTEXT.md Mandatory Sections

**1. Quick Facts (Always at Top)**
```markdown
## Quick Facts (15-second scan)

| Attribute | Value |
|-----------|-------|
| **Project** | Project name |
| **Stack** | Tech stack |
| **Status** | Current status |
| **URL** | Live URL |
| **Last Updated** | YYYY-MM-DD |
```

**2. Recent Changes (Last 3 Sessions)**
```markdown
## Recent Changes

### Session 2025-11-19
**Focus**: What this session was about
**Actions Taken**: Bullet list
**Outcome**: What was achieved
**Next**: What comes next
```

**3. Current Issues (Active Blockers)**
```markdown
## Current Issues

### Issue #1: Brief Title (P0)
**Status**: In progress | Blocked | Waiting
**Problem**: Description
**Impact**: Who/what affected
**Next Step**: What to do next
```

**4. Next Session TODO**
```markdown
## Next Session TODO

### Immediate (Next Session)
- [ ] Task with checkbox
- [ ] Another task

### Short-term (Within Week)
- [ ] Medium priority task

### Long-term (Within Month)
- [ ] Nice to have
```

---

## 3. Session Management Workflow

### Session Startup Checklist (2 min)

**Step 1: Read Quick Facts** (15 sec)
```bash
# Open CONTEXT.md, read top section
# Know: Status, URL, last updated
```

**Step 2: Check Git Status** (30 sec)
```bash
git status                # Uncommitted changes?
git log -3 --oneline      # Recent commits
git branch                # Current branch
```

**Step 3: Review Recent Changes** (45 sec)
```bash
# Read "Recent Changes" in CONTEXT.md
# Know what happened last 1-3 sessions
```

**Step 4: Verify System** (30 sec)
```bash
# Optional: verify deployment, tests, etc.
npm run typecheck         # If code project
curl -I [production-url]  # If web project
```

**Total**: <2 minutes to full orientation

### Session Shutdown Checklist (3 min)

**Step 1: Commit Changes** (1 min)
```bash
git add .
git commit -m "descriptive message"
git push origin main
```

**Step 2: Update CONTEXT.md** (1.5 min)
```markdown
### Session YYYY-MM-DD
**Focus**: Brief description
**Actions Taken**:
- What I did
- What changed
**Outcome**: What was achieved
**Next**: What comes next
```

**Step 3: Update TODO List** (30 sec)
```markdown
## Next Session TODO
- [ ] New task based on this session
- [x] Completed task (mark done)
```

**Total**: ~3 minutes for clean handoff

### Session Summary Automation

**Option A: Manual Template**
Create `.claude/templates/session-summary.md`:
```markdown
### Session {{DATE}}
**Focus**: {{FOCUS}}

**Actions Taken**:
- {{ACTION_1}}
- {{ACTION_2}}

**Outcome**: {{OUTCOME}}
**Next**: {{NEXT_STEP}}
```

**Option B: Git Hook**
Create `.git/hooks/post-commit`:
```bash
#!/bin/bash
# Remind to update CONTEXT.md after commit

echo ""
echo "✅ Commit successful!"
echo "📝 Don't forget to update CONTEXT.md with session summary"
echo ""
```

**Option C: Script**
Create `scripts/session-end.sh`:
```bash
#!/bin/bash
# Helper script for session shutdown

echo "Session Shutdown Checklist"
echo ""

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
  echo "⚠️  You have uncommitted changes"
  git status -s
  echo ""
  read -p "Commit changes now? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add .
    read -p "Commit message: " commit_msg
    git commit -m "$commit_msg"
    git push origin main
  fi
fi

# Remind to update CONTEXT.md
echo ""
echo "✅ Code committed"
echo "📝 Next: Update CONTEXT.md with session summary"
echo "📋 Then: Update Next Session TODO list"
echo ""
echo "Session shutdown complete!"
```

---

## 4. Documentation Hygiene

### Update Triggers

Update docs when:

| Trigger | Update |
|---------|--------|
| End of session | CONTEXT.md - Recent Changes |
| Significant change | CHANGELOG.md |
| Architecture decision | ADR + ARCHITECTURE.md |
| Setup change | QUICKSTART.md, README.md |
| Deployment change | DEPLOYMENT.md |
| New feature | README.md, relevant docs |

### Documentation Freshness Rules

**Rule 1: CONTEXT.md Updated Every Session**
- No exceptions
- Even if "nothing changed"
- Minimum: update "Last Updated" date

**Rule 2: README.md Reflects Reality**
- Commands actually work
- URLs are current
- Status is accurate

**Rule 3: CHANGELOG.md Captures Significant Changes**
- User-facing changes
- Breaking changes
- Major features

**Rule 4: No Orphaned Docs**
- Delete obsolete docs, don't leave them
- Or move to `docs/archive/` with reason

### Documentation Review Cadence

**Daily** (session end):
- [ ] CONTEXT.md updated

**Weekly**:
- [ ] Review all docs for accuracy
- [ ] Fix any outdated information
- [ ] Check for broken links

**Monthly**:
- [ ] Archive old session summaries (keep last 3 months)
- [ ] Consolidate learnings
- [ ] Update architecture diagrams if changed

---

## 5. AI Context Optimization

### Structured Context Loading

**Inefficient**:
```
User: "I'm working on bearlakecamp, what was I doing?"
AI: "I don't have context, can you provide more info?"
User: "It's a Next.js project with Keystatic..."
AI: "OK, what specifically are you working on?"
[10 messages to establish context]
```

**Efficient**:
```
User: "Working on bearlakecamp. See CONTEXT.md for full context.
Current task: Fix OAuth login issue.
Question: What's the likely cause of OAuth redirect not working?"

AI: [reads CONTEXT.md, immediately oriented]
"Based on CONTEXT.md, issue is likely missing callback URL in GitHub App..."
```

### Context Loading Template

Create `.claude/templates/session-start.md`:
```markdown
**Project**: {{PROJECT_NAME}}
**Location**: {{PROJECT_PATH}}
**Stack**: {{TECH_STACK}}
**Status**: {{CURRENT_STATUS}}

**Context**: See CONTEXT.md for full project context
**Recent Work**: [Brief summary from CONTEXT.md Recent Changes]

**Current Task**: {{WHAT_I_WANT_TO_DO}}

**Question/Request**: {{SPECIFIC_QUESTION}}
```

**Usage**:
```markdown
**Project**: Bear Lake Camp
**Location**: /Users/travis/dev/bearlakecamp
**Stack**: Next.js 14 + Keystatic CMS
**Status**: Production at https://prelaunch.bearlakecamp.com

**Context**: See CONTEXT.md for full project context
**Recent Work**: Implemented all P0+P1 features, debugging OAuth

**Current Task**: Fix Keystatic login OAuth redirect

**Question**: What's the most likely cause of OAuth redirect not working?
```

### File References

Use @-mentions or explicit file references:
```markdown
# Inefficient
"Check the config file for the settings"

# Efficient
"Check `keystatic.config.ts` for the `github` settings object"

# Most Efficient (if AI supports @-mentions)
"@keystatic.config.ts - check the github settings object"
```

---

## 6. Multi-Project Management

### Directory Structure for Multiple Projects

**Flat Structure** (Recommended for <10 projects):
```
~/dev/
├── project-a/
├── project-b/
├── project-c/
└── project-d/
```

**Grouped Structure** (For many projects):
```
~/dev/
├── clients/
│   ├── client-a-website/
│   └── client-b-app/
├── internal/
│   ├── admin-tool/
│   └── monitoring-dashboard/
└── experiments/
    ├── experiment-1/
    └── experiment-2/
```

### Project Registry

Create `~/dev/PROJECTS.md`:
```markdown
# Active Projects

## Production
- **bearlakecamp** - Church camp website (Next.js + Keystatic)
  - Location: `/Users/travis/dev/bearlakecamp`
  - URL: https://prelaunch.bearlakecamp.com
  - Last Active: 2025-11-19

- **blackline** - Financial consulting site
  - Location: `/Users/travis/dev/blackline`
  - URL: https://blackline.example.com
  - Last Active: 2025-11-15

## In Development
- **project-x** - Description
  - Location: `/Users/travis/dev/project-x`
  - Status: MVP development

## Archived
- **old-project** - Deprecated, replaced by new-project
  - Location: `/Users/travis/dev/archive/old-project`
  - Archived: 2025-10-01
```

### Cross-Project Context Script

Create `~/dev/which-project.sh`:
```bash
#!/bin/bash
# Quick project lookup

PROJECT_NAME=$1

if [ -z "$PROJECT_NAME" ]; then
  echo "Usage: ./which-project.sh <project-name>"
  echo ""
  echo "Active Projects:"
  ls -1 ~/dev | grep -v "archive" | grep -v ".md" | grep -v ".sh"
  exit 0
fi

PROJECT_PATH=~/dev/$PROJECT_NAME

if [ -d "$PROJECT_PATH" ]; then
  echo "📁 Project: $PROJECT_NAME"
  echo "📍 Location: $PROJECT_PATH"

  if [ -f "$PROJECT_PATH/CONTEXT.md" ]; then
    echo ""
    echo "📄 Quick Facts:"
    head -20 "$PROJECT_PATH/CONTEXT.md" | tail -15
  fi

  echo ""
  echo "🔗 Commands:"
  echo "  cd $PROJECT_PATH"
  echo "  code $PROJECT_PATH"
else
  echo "❌ Project not found: $PROJECT_NAME"
fi
```

Usage:
```bash
./which-project.sh bearlakecamp
```

---

## 7. Preventing Common Mistakes

### Mistake 1: Nested Projects

**Wrong**:
```
project-a/
├── [project-a code]
└── experiments/
    ├── project-b/              # ❌ Nested project
    └── project-c/              # ❌ Nested project
```

**Right**:
```
dev/
├── project-a/
├── project-b/
└── project-c/
```

**Prevention**: Establish flat structure from start, resist nesting urge.

---

### Mistake 2: Multiple Implementations in Same Repo

**Wrong**:
```
bearlakecamp/
├── astro-version/              # ❌ Multiple implementations
├── nextjs-version/             # ❌ Confusion
└── gatsby-version/             # ❌ Which is current?
```

**Right**:
```
bearlakecamp/                   # ✅ Working code only
├── [current implementation]
└── archive/
    ├── ARCHIVE.md
    ├── astro-attempt/
    └── gatsby-attempt/
```

**Prevention**: Archive failed attempts immediately, keep only one working implementation in root.

---

### Mistake 3: Stale Documentation

**Wrong**:
```markdown
# README.md (Last Updated: 2024-01-01)

Run: npm start                  # ❌ Doesn't work anymore
```

**Right**:
```markdown
# README.md (Last Updated: 2025-11-19)

Run: npm run dev                # ✅ Correct command
```

**Prevention**:
- Update docs when changing code
- Add "Last Updated" to all docs
- Weekly doc review

---

### Mistake 4: No Context Handoff

**Wrong**:
Session ends with uncommitted changes, no notes about what was being worked on.

**Right**:
```markdown
### Session 2025-11-19
**Focus**: OAuth debugging
**Actions Taken**:
- Fixed callback URL
- Tested locally
**Outcome**: Working locally, needs production test
**Next**: Test on production, verify with real users
```

**Prevention**: Session shutdown checklist (mandatory).

---

### Mistake 5: Assuming Context

**Wrong**:
```
User: "Fix the thing we talked about"
AI: "Which thing?"
```

**Right**:
```
User: "Fix the OAuth redirect issue documented in CONTEXT.md Issue #1.
The callback URL needs to be added to GitHub App settings."
```

**Prevention**: Be explicit, reference docs, include context.

---

## 8. Tooling Recommendations

### Essential Tools

**1. Session Management**
```bash
# Create session management script
~/dev/bearlakecamp/scripts/session-start.sh
~/dev/bearlakecamp/scripts/session-end.sh
```

**2. Documentation Validation**
```bash
# Check for broken links
npm install -g markdown-link-check
markdown-link-check *.md

# Check for outdated "Last Updated" dates
# (Custom script to find docs >30 days old)
```

**3. Git Hooks**
```bash
# .git/hooks/pre-commit
# - Remind to update CONTEXT.md
# - Check for uncommitted docs

# .git/hooks/post-commit
# - Remind to push
# - Remind to update Vercel (if manual)
```

**4. Quick Navigation**
```bash
# Add to ~/.zshrc or ~/.bashrc
alias cdblc='cd /Users/travis/dev/bearlakecamp && cat CONTEXT.md | head -20'
alias ctx='code CONTEXT.md'
alias readme='code README.md'
```

### Optional Automation

**1. Auto-Generate Session Summary**
```bash
# scripts/session-summary.sh
#!/bin/bash

DATE=$(date +%Y-%m-%d)
COMMITS=$(git log --since="1 day ago" --oneline)

echo "### Session $DATE"
echo "**Focus**: [FILL IN]"
echo ""
echo "**Commits**:"
echo "$COMMITS" | sed 's/^/- /'
echo ""
echo "**Outcome**: [FILL IN]"
echo "**Next**: [FILL IN]"
```

**2. CONTEXT.md Last Updated Check**
```bash
# scripts/check-context-freshness.sh
#!/bin/bash

CONTEXT_FILE="CONTEXT.md"
LAST_UPDATED=$(grep "Last Updated" $CONTEXT_FILE | grep -oE "[0-9]{4}-[0-9]{2}-[0-9]{2}")
DAYS_OLD=$(( ($(date +%s) - $(date -j -f "%Y-%m-%d" "$LAST_UPDATED" +%s)) / 86400 ))

if [ $DAYS_OLD -gt 7 ]; then
  echo "⚠️  CONTEXT.md is $DAYS_OLD days old!"
  echo "Consider updating it with recent changes."
fi
```

**3. Documentation Health Check**
```bash
# scripts/doc-health.sh
#!/bin/bash

echo "📚 Documentation Health Check"
echo ""

# Check required files
REQUIRED_FILES=("README.md" "CONTEXT.md" "CHANGELOG.md")
for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file exists"
  else
    echo "❌ $file missing"
  fi
done

# Check CONTEXT.md freshness
echo ""
./scripts/check-context-freshness.sh

# Check for broken links
echo ""
echo "🔗 Checking for broken links..."
markdown-link-check *.md --quiet || echo "⚠️  Some links are broken"

echo ""
echo "Health check complete!"
```

---

## 9. AI Assistant Best Practices

### Efficient Prompting

**Inefficient**:
```
"Help me with my project"
```

**Efficient**:
```
Project: bearlakecamp (Next.js + Keystatic)
Context: CONTEXT.md (OAuth issue, see Issue #1)
Task: Fix OAuth redirect in Keystatic CMS
Question: What callback URL format does Keystatic expect?
```

### Context Priming

**First Message of Session** (Efficient):
```markdown
**Project**: Bear Lake Camp
**Location**: /Users/travis/dev/bearlakecamp
**Context Document**: CONTEXT.md (read for full context)
**Last Session**: Fixed P0/P1 features, debugging OAuth
**Current Task**: Verify OAuth fix works in production

See CONTEXT.md for complete project context including:
- Technology stack
- Recent changes
- Current issues
- Architecture

**Immediate Question**: Should I test OAuth locally first or go straight to production?
```

### Progressive Context Loading

Don't dump entire context at once. Load progressively:

**Level 1**: Quick facts
```
Project: bearlakecamp
Stack: Next.js + Keystatic
Status: Production, OAuth issue
```

**Level 2**: Specific context for task
```
Issue: OAuth redirect not working
Likely cause: Missing callback URL
Location: GitHub App settings
```

**Level 3**: Deep context (only if needed)
```
Full context in CONTEXT.md
Architecture in ARCHITECTURE.md
Deployment in DEPLOYMENT.md
```

### Referencing Documentation

**Instead of**: Explaining entire project setup

**Do**: Reference documentation
```
"See QUICKSTART.md for setup instructions. I'm stuck at Step 3."
```

**Instead of**: Copying code into prompt

**Do**: Reference file and line
```
"In keystatic.config.ts line 45, the github.repo setting..."
```

---

## 10. Success Metrics

Track these metrics to measure improvement:

### Time Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Session startup | 10 min | <2 min | Time to full orientation |
| Context explanation | 5 min | 30 sec | Time to explain context to AI |
| Finding info | 3 min | <30 sec | Time to find relevant doc |
| Session handoff | Ad-hoc | 3 min | Time to update CONTEXT.md |

### Quality Metrics

| Metric | Before | Target | Measurement |
|--------|--------|--------|-------------|
| Doc freshness | 30+ days | <7 days | Time since last update |
| Context loss | Often | Rare | # of "what was I doing?" moments |
| Repeated work | Common | None | # of times re-solving same problem |
| Confusion events | Weekly | Monthly | # of times lost in project structure |

### Completeness Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Required docs exist | 100% | Count of README, CONTEXT, etc. |
| CONTEXT.md updated | 100% | Every session has entry |
| Broken links | 0 | Link checker results |
| Uncommitted changes | 0 | Git status at session end |

---

## 11. Implementation Roadmap

### Phase 1: Immediate (This Session)
- [x] Create MIGRATION-PLAN.md
- [x] Create CONTEXT.md
- [x] Create DOCUMENTATION-STANDARDS.md
- [x] Create PROCESS-IMPROVEMENTS.md (this doc)
- [ ] Execute migration to `/Users/travis/dev/bearlakecamp/`

**Time**: 1 hour
**Impact**: Immediate clarity, better organization

### Phase 2: Short-term (Within Week)
- [ ] Archive old attempts
- [ ] Create session management scripts
- [ ] Set up documentation review calendar
- [ ] Create project registry (`~/dev/PROJECTS.md`)
- [ ] Test new structure for 1 week

**Time**: 2 hours
**Impact**: Sustainable practices established

### Phase 3: Medium-term (Within Month)
- [ ] Add git hooks for documentation reminders
- [ ] Create documentation health check script
- [ ] Implement automated context freshness checks
- [ ] Remove migration symlink (after confidence)
- [ ] Document learnings in this file

**Time**: 3 hours
**Impact**: Automated enforcement of practices

### Phase 4: Long-term (Ongoing)
- [ ] Apply practices to all projects
- [ ] Refine based on experience
- [ ] Share best practices with team
- [ ] Contribute to open source (if applicable)

**Time**: Ongoing
**Impact**: Consistent excellence across all work

---

## 12. Adoption Checklist

For applying these practices to a new or existing project:

### New Project
- [ ] Create project in standalone directory (`~/dev/project-name/`)
- [ ] Initialize with required docs (README, CONTEXT, CHANGELOG)
- [ ] Set up session management scripts
- [ ] Add git hooks
- [ ] Add to project registry
- [ ] Test session startup/shutdown workflow

### Existing Project (Migration)
- [ ] Create CONTEXT.md from scratch
- [ ] Review and update README.md
- [ ] Create/update CHANGELOG.md
- [ ] Move to standalone directory if needed
- [ ] Archive old attempts
- [ ] Update documentation
- [ ] Set up session management
- [ ] Test for 1 week before removing old location

---

## Appendix A: Templates

All templates available in `.claude/templates/`:

1. `session-summary.md` - Session summary template
2. `session-start.md` - Session startup context template
3. `adr.md` - Architecture Decision Record template
4. `troubleshooting.md` - Troubleshooting entry template

---

## Appendix B: Scripts

All scripts available in `scripts/`:

1. `session-start.sh` - Session startup helper
2. `session-end.sh` - Session shutdown helper
3. `check-context-freshness.sh` - Check CONTEXT.md age
4. `doc-health.sh` - Documentation health check
5. `session-summary.sh` - Auto-generate session summary

---

## Appendix C: Git Hooks

Example git hooks for `.git/hooks/`:

### post-commit
```bash
#!/bin/bash
echo ""
echo "✅ Commit successful!"
echo "📝 Don't forget to update CONTEXT.md"
echo ""
```

### pre-push
```bash
#!/bin/bash
# Check if CONTEXT.md updated recently (within 7 days)

CONTEXT_FILE="CONTEXT.md"
if [ -f "$CONTEXT_FILE" ]; then
  DAYS_OLD=$(( ($(date +%s) - $(stat -f %m $CONTEXT_FILE)) / 86400 ))
  if [ $DAYS_OLD -gt 7 ]; then
    echo "⚠️  CONTEXT.md is $DAYS_OLD days old"
    echo "Consider updating before push"
    read -p "Continue push anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
fi
```

---

**End of Process Improvements**

Apply these practices consistently for maximum benefit.
