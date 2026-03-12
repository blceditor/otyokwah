# Quick Reference Guide

**Purpose**: One-page reference for common operations and workflows

---

## Navigation Map

**Start Here**: Read this file first
- **Detailed Plan**: [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) - Step-by-step migration
- **Session Context**: [CONTEXT.md](./CONTEXT.md) - Current state, recent changes
- **Documentation**: [DOCUMENTATION-STANDARDS.md](./DOCUMENTATION-STANDARDS.md) - How to maintain docs
- **Processes**: [PROCESS-IMPROVEMENTS.md](./PROCESS-IMPROVEMENTS.md) - Workflows and best practices
- **Project Overview**: [README-UPDATED.md](./README-UPDATED.md) - Project description
- **Executive Summary**: [STRATEGIC-REORGANIZATION-SUMMARY.md](./STRATEGIC-REORGANIZATION-SUMMARY.md) - Big picture

---

## Current State (As of 2025-11-19)

```
Current Location: ~/GoogleDrive/.../blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs/
Target Location:  ~/dev/bearlakecamp/

Status:   ✅ All deliverables created
          ⏳ Migration ready to execute
          ⏳ Waiting for user approval

Project:  Bear Lake Camp website
Stack:    Next.js 14 + Keystatic CMS
Live:     https://prelaunch.bearlakecamp.com
Repo:     https://github.com/sparkst/bearlakecamp
```

---

## Migration Quick Steps

**Total Time**: 30 minutes

```bash
# 1. Navigate and backup (2 min)
cd /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs
git tag -a backup-pre-migration-2025-11-19 -m "Backup before migration"
git push origin backup-pre-migration-2025-11-19

# 2. Clone to new location (5 min)
cd /Users/travis/dev
git clone https://github.com/sparkst/bearlakecamp.git
cd bearlakecamp

# 3. Install and verify (3 min)
npm install
npm run typecheck
npm run build

# 4. Copy environment variables (2 min)
cp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs/.env.local .env.local

# 5. Test local dev (5 min)
npm run dev
# Visit http://localhost:3000, verify works, Ctrl+C

# 6. Archive old attempts (3 min)
mkdir -p /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive
mv /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/archive/bearlakecamp-astro-tinacms

# 7. Create symlink (optional, 1 min)
rm -rf /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs
ln -s /Users/travis/dev/bearlakecamp /Users/travis/Library/CloudStorage/GoogleDrive-travis@sparkry.com/My\ Drive/dev/blacklinewebsite/requirements/content-hosting/bearlakecamp-nextjs

# 8. Update CONTEXT.md (5 min)
cd /Users/travis/dev/bearlakecamp
# Add entry to Recent Changes section
```

**See MIGRATION-PLAN.md for detailed steps and verification checklists**

---

## Session Workflow

### Starting a Session (2 min)

```bash
# 1. Navigate to project
cd /Users/travis/dev/bearlakecamp

# 2. Read Quick Facts
head -30 CONTEXT.md

# 3. Check git status
git status
git log -3 --oneline

# 4. Review recent changes
# Read "Recent Changes" section in CONTEXT.md
```

**AI Context Loading Template**:
```markdown
Working on bearlakecamp project.
Location: /Users/travis/dev/bearlakecamp
Stack: Next.js 14 + Keystatic CMS
Status: Production at https://prelaunch.bearlakecamp.com

Context: See CONTEXT.md for full project state
Recent: [Brief summary from Recent Changes]
Task: [What I want to do this session]

Question: [Specific question]
```

---

### Ending a Session (3 min)

```bash
# 1. Commit changes
git add .
git commit -m "feat: description of what was done"
git push origin main

# 2. Update CONTEXT.md
# Add to Recent Changes section:

### Session 2025-MM-DD
**Focus**: Brief description
**Actions Taken**:
- Action 1
- Action 2
**Outcome**: What was achieved
**Next**: What comes next

# 3. Update Next Session TODO
# Add/complete tasks in that section
```

---

## Common Commands

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run typecheck    # Type checking
npm run lint         # Linting
npm run test         # Run tests
```

### Git
```bash
git status                    # Check status
git log -3 --oneline          # Recent commits
git diff                      # See changes
git add .                     # Stage all
git commit -m "msg"           # Commit
git push origin main          # Push
```

### Vercel
```bash
npx vercel ls                 # List deployments
npx vercel logs               # View logs
npx vercel env ls             # List env vars
```

---

## Documentation Update Matrix

| When | Update |
|------|--------|
| **Every session end** | CONTEXT.md - Recent Changes |
| **Significant change** | CHANGELOG.md |
| **Architecture decision** | Create ADR, update ARCHITECTURE.md |
| **Setup change** | QUICKSTART.md, README.md |
| **Deployment change** | DEPLOYMENT.md |
| **New feature** | README.md |

---

## Troubleshooting

### Build Fails
```bash
npm run typecheck    # Check types
npm run lint         # Check lint
rm -rf .next         # Clear cache
npm run build        # Try again
```

### CMS Not Working
1. Check environment variables in Vercel
2. Verify GitHub App OAuth settings
3. Check CONTEXT.md Current Issues section

### Local Dev Won't Start
```bash
rm -rf node_modules
npm install
npm run dev
```

---

## Key URLs

| Resource | URL |
|----------|-----|
| **Production** | https://prelaunch.bearlakecamp.com |
| **CMS Admin** | https://prelaunch.bearlakecamp.com/keystatic |
| **Repository** | https://github.com/sparkst/bearlakecamp |
| **Vercel Dashboard** | https://vercel.com/travis-projects-3a622477/bearlakecamp |
| **GitHub App** | https://github.com/settings/apps/bearlakecamp-cms |

---

## File Locations

**After Migration**:
```
/Users/travis/dev/bearlakecamp/              # Working code
/Users/travis/dev/bearlakecamp/CONTEXT.md    # Session context
/Users/travis/dev/bearlakecamp/README.md     # Project overview

~/GoogleDrive/.../blacklinewebsite/requirements/content-hosting/archive/
  ├── bearlakecamp-astro-tinacms/            # Old Astro attempt
  ├── bearlakecamp-mockup/                   # Old mockup
  └── bearlakecamp-tina-backend/             # Old TinaCMS backend
```

---

## Decision Tree

### "Where do I find...?"

**Quick facts about project** → CONTEXT.md (top section)
**How to get started** → README-UPDATED.md
**How to deploy** → DEPLOYMENT.md (once created)
**Architecture details** → ARCHITECTURE.md (once created)
**Recent changes** → CONTEXT.md (Recent Changes section)
**What to do next** → CONTEXT.md (Next Session TODO)
**Migration steps** → MIGRATION-PLAN.md
**Documentation rules** → DOCUMENTATION-STANDARDS.md
**Workflow best practices** → PROCESS-IMPROVEMENTS.md

### "What should I do...?"

**Starting new session** → Session Workflow above
**Ending session** → Session Workflow above
**Made code changes** → Commit, update CONTEXT.md
**Made architectural decision** → Create ADR, update ARCHITECTURE.md
**Changed deployment** → Update DEPLOYMENT.md
**Confused about project** → Read CONTEXT.md Quick Facts

---

## Success Checklist

### Migration Complete When:
- [ ] New location at `/Users/travis/dev/bearlakecamp/` works
- [ ] Tests pass (`npm run typecheck && npm run lint && npm test`)
- [ ] Local dev works (`npm run dev`)
- [ ] Old attempts archived
- [ ] CONTEXT.md updated with migration details

### Session Complete When:
- [ ] Changes committed and pushed
- [ ] CONTEXT.md updated with session summary
- [ ] Next Session TODO updated
- [ ] No uncommitted files (`git status` clean)

### Documentation Healthy When:
- [ ] CONTEXT.md updated <7 days ago
- [ ] README.md reflects current setup
- [ ] No broken links
- [ ] All required files exist

---

## Emergency Contacts

| Issue | Action |
|-------|--------|
| **Production down** | Check Vercel dashboard, rollback if needed |
| **Can't deploy** | Check environment variables, build logs |
| **Lost context** | Read CONTEXT.md Quick Facts |
| **Migration failed** | Use rollback plan in MIGRATION-PLAN.md |

---

## Rollback Commands

### Rollback Migration
```bash
# Option A: Restore from tag
cd /Users/travis/dev/bearlakecamp
git checkout backup-pre-migration-2025-11-19

# Option B: Re-clone
rm -rf /Users/travis/dev/bearlakecamp
git clone https://github.com/sparkst/bearlakecamp.git /Users/travis/dev/bearlakecamp
```

### Rollback Deployment
```bash
# Revert last commit
git revert HEAD
git push origin main
# Vercel auto-deploys rollback
```

---

## Metrics Tracking

Track in CONTEXT.md or separate metrics file:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Session startup time | <2 min | Time from "start" to oriented |
| Context explanation time | <30 sec | Time to explain to AI |
| Doc freshness | <7 days | Date in CONTEXT.md |
| Broken links | 0 | Link checker |

---

## Next Steps

1. **Review** this guide and other deliverables (15 min)
2. **Approve** migration plan or provide feedback
3. **Execute** migration following MIGRATION-PLAN.md (30 min)
4. **Test** new workflow for 1 week
5. **Refine** based on experience

---

## Questions?

- **What is this?** Strategic reorganization plan to eliminate context loss
- **Why?** Currently losing 10 min per session to orientation
- **What's the fix?** Clean directory structure + CONTEXT.md system
- **How long?** 30 min to migrate, <2 min per session after
- **What if it breaks?** 3 rollback options provided
- **When to do it?** Now (recommended) or when ready

---

**For full details, see individual documents linked at top.**

**All deliverables complete and ready to use.**
