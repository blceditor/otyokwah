# Documentation Standards

**Purpose**: Establish consistent documentation practices to prevent confusion and enable efficient cross-session context management.

**Last Updated**: 2025-11-19

---

## Core Principles

1. **Documentation is Code** - Treat docs with same rigor as code
2. **Single Source of Truth** - Each fact documented once, referenced many times
3. **Progressive Disclosure** - Quick facts first, details on demand
4. **Always Current** - Update docs when code changes
5. **Findable** - Clear naming, consistent structure, searchable

---

## Required Documentation Files

Every project MUST have these files in the root directory:

### 1. README.md
**Purpose**: Project overview and navigation hub
**Max Length**: 300 lines
**Update Frequency**: When major changes occur

**Required Sections**:
```markdown
# Project Name

## Quick Facts
- Project description (1 sentence)
- Technology stack (bullet list)
- Current status
- Live URLs
- Last updated date

## Project Structure
- Directory tree
- Key files explanation

## Architecture
- High-level system diagram
- Key components
- Data flow

## Getting Started
- Prerequisites
- Installation
- Configuration
- First run

## Development
- Local development setup
- Common commands
- Testing
- Building

## Deployment
- Where deployed
- How to deploy
- Environment variables
- Rollback procedure

## Documentation
- Links to other docs
- What each doc contains

## Support
- Key contacts
- Resources
- Emergency procedures
```

**Example**:
```markdown
# Bear Lake Camp

Church camp website with Git-based CMS for content management.

## Quick Facts
- **Stack**: Next.js 14 + Keystatic CMS
- **Status**: Production
- **URL**: https://prelaunch.bearlakecamp.com
- **Last Updated**: 2025-11-19

[... rest of sections ...]
```

---

### 2. CONTEXT.md
**Purpose**: Session-to-session continuity for developers and AI assistants
**Max Length**: 500 lines
**Update Frequency**: End of every work session

**Required Sections**:
```markdown
# Project Name - Session Context

**Last Updated**: YYYY-MM-DD
**Status**: Current status
**Current Phase**: What phase of development

## Quick Facts (15-second scan)
- Table of key facts
- URLs, accounts, identifiers

## Technology Stack
- Framework versions
- Key dependencies
- Tools used

## Key Resources
- GitHub, Vercel, etc.
- Credentials locations (NOT the credentials themselves)
- Important URLs

## Recent Changes
- Last 3 sessions
- What was done
- What changed

## Current Issues
- Active blockers
- Known bugs
- Pending items

## Next Session TODO
- Prioritized list
- Estimated effort

## Common Operations
- Start dev server
- Run tests
- Deploy

## Troubleshooting
- Common issues
- Solutions

## Session Startup Checklist
- Steps to orient quickly

## Session Shutdown Checklist
- What to do before ending session
```

**Update Template**:
```markdown
### Session YYYY-MM-DD
**Focus**: What this session was about

**Actions Taken**:
- Bullet list of what was done
- Include commands run
- Include files changed

**Outcome**: What was achieved
**Next**: What comes next
```

---

### 3. ARCHITECTURE.md
**Purpose**: System design and technical decisions
**Max Length**: 1000 lines (split if longer)
**Update Frequency**: When architecture changes

**Required Sections**:
```markdown
# Architecture

## System Overview
- High-level description
- Key design decisions
- Trade-offs made

## Technology Stack
- Framework and versions
- Why chosen
- Alternatives considered

## Architecture Diagrams
- System architecture
- Data flow
- Deployment architecture

## Key Components
- Component description
- Responsibilities
- Interfaces

## Data Model
- Entities
- Relationships
- Storage

## Security
- Authentication
- Authorization
- Data protection

## Performance
- Optimization strategies
- Caching
- CDN usage

## Scalability
- Current limits
- Growth plan
- Bottlenecks

## Dependencies
- External services
- APIs used
- Third-party libraries

## ADRs (Architecture Decision Records)
- Links to ADR files
- Summary of key decisions
```

---

### 4. QUICKSTART.md (or GETTING-STARTED.md)
**Purpose**: Happy path user guide for new developers
**Max Length**: 200 lines
**Update Frequency**: When setup process changes

**Required Sections**:
```markdown
# Quick Start

## Prerequisites
- Required software and versions
- Required accounts
- Required access

## Installation (5 min)
Step-by-step with exact commands:
```bash
git clone [repo]
cd [dir]
npm install
```

## Configuration (2 min)
- Environment variables needed
- Config files to create
- Where to get values

## First Run (1 min)
```bash
npm run dev
```
- Expected output
- What to verify
- Common first-run issues

## Verification
- Checklist of what should work
- URLs to test
- Expected results

## Next Steps
- Where to go from here
- Additional reading
- Common tasks
```

---

### 5. DEPLOYMENT.md
**Purpose**: How to deploy, environment variables, infrastructure
**Max Length**: 500 lines
**Update Frequency**: When deployment process changes

**Required Sections**:
```markdown
# Deployment

## Environments
- Development
- Staging (if exists)
- Production

## Infrastructure
- Hosting provider
- Services used
- Account details (NOT credentials)

## Environment Variables
- Complete list
- What each is for
- Where to set them
- Example values (NOT real values)

## Deployment Process
- Manual steps
- Automated steps
- Commands to run
- Verification steps

## Rollback Procedure
- How to rollback
- When to rollback
- Emergency contacts

## Monitoring
- Where to check health
- Key metrics
- Alert thresholds

## Troubleshooting
- Common deployment issues
- Solutions
- Who to contact
```

---

### 6. CHANGELOG.md
**Purpose**: Record of significant changes over time
**Max Length**: Unlimited (historical record)
**Update Frequency**: With each significant change

**Format** (Keep a Changelog):
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [1.0.0] - 2025-11-19
### Added
- Initial production release
- Next.js 14 + Keystatic CMS
- Content components
- Static search

### Fixed
- OAuth redirect issues

## [0.1.0] - 2025-11-01
### Added
- Project initialization
- Basic Next.js setup
```

---

## Optional Documentation Files

Recommended for larger projects:

### CONTRIBUTING.md
- How to contribute
- Code standards
- PR process
- Testing requirements

### ARCHITECTURE-DECISION-RECORDS/ (ADRs)
Format: `ADR-001-use-nextjs-over-gatsby.md`

```markdown
# ADR-001: Use Next.js Instead of Gatsby

**Date**: 2025-10-15
**Status**: Accepted
**Deciders**: Travis, Team

## Context
Need to choose static site framework for church camp website.

## Decision
Use Next.js 14 with App Router.

## Consequences
**Positive**:
- Server components for better performance
- Flexibility for dynamic routes
- Better developer experience

**Negative**:
- Slightly more complex than Gatsby
- Need to configure image optimization manually

## Alternatives Considered
- Gatsby (rejected: GraphQL overhead)
- Astro (rejected: less mature ecosystem)
```

### API.md
- API endpoints
- Request/response formats
- Authentication
- Rate limits

### TESTING.md
- Testing strategy
- How to run tests
- Writing new tests
- Test coverage goals

---

## Documentation Organization

### File Naming Conventions

**All Caps**: Important top-level docs
- `README.md`
- `CONTRIBUTING.md`
- `CHANGELOG.md`
- `LICENSE.md`

**Title Case**: Feature/component docs
- `Content-Components.md`
- `Search-Implementation.md`

**Lowercase**: Code-related docs in subdirectories
- `docs/api/authentication.md`
- `docs/guides/deployment.md`

**ADRs**: Numbered, hyphenated
- `docs/adr/ADR-001-use-typescript.md`
- `docs/adr/ADR-002-use-tailwind.md`

### Directory Structure

```
project-root/
├── README.md                      # Navigation hub
├── CONTEXT.md                     # Session context
├── CHANGELOG.md                   # Change history
├── ARCHITECTURE.md                # System design
├── QUICKSTART.md                  # Getting started
├── DEPLOYMENT.md                  # Deployment guide
├── docs/                          # Additional documentation
│   ├── adr/                      # Architecture decisions
│   │   ├── ADR-001-*.md
│   │   └── ADR-002-*.md
│   ├── api/                      # API documentation
│   ├── guides/                   # How-to guides
│   ├── architecture/             # Architecture diagrams
│   └── archive/                  # Old/deprecated docs
├── .github/                       # GitHub-specific
│   ├── ISSUE_TEMPLATE.md
│   └── PULL_REQUEST_TEMPLATE.md
└── archive/                       # Archived code/attempts
    └── ARCHIVE.md                # What's archived and why
```

---

## Documentation Best Practices

### 1. Start with Why
Every doc should answer:
- **What** is this?
- **Why** does it exist?
- **When** to use it?
- **How** to use it?

### 2. Progressive Disclosure
Structure information in layers:
1. **TL;DR** - Quick facts (15 sec)
2. **Overview** - High-level (2 min)
3. **Details** - Deep dive (10+ min)
4. **Reference** - Comprehensive details

### 3. Consistent Formatting

**Dates**: YYYY-MM-DD (ISO 8601)
```markdown
**Last Updated**: 2025-11-19
```

**Commands**: Use code blocks with bash syntax
```markdown
```bash
npm install
npm run dev
```
```

**File Paths**: Use code formatting
```markdown
Located in `app/api/keystatic/route.ts`
```

**URLs**: Use descriptive link text
```markdown
Visit the [Vercel Dashboard](https://vercel.com/dashboard)
NOT: Visit https://vercel.com/dashboard
```

**Tables**: Use for structured data
```markdown
| Environment | URL | Status |
|-------------|-----|--------|
| Production  | https://example.com | Live |
| Staging     | https://staging.example.com | Live |
```

### 4. Include Examples
Every concept should have an example:
```markdown
## Environment Variables

Set environment variables in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=https://api.example.com
API_SECRET=your-secret-key
```

Example usage:
```typescript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```
```

### 5. Checklists for Procedures
Use checklists for step-by-step procedures:
```markdown
## Deployment Checklist

- [ ] Run tests locally
- [ ] Update CHANGELOG.md
- [ ] Commit changes
- [ ] Push to main branch
- [ ] Verify Vercel deployment
- [ ] Test production URL
- [ ] Update documentation
```

### 6. Version Information
Always include version info:
```markdown
## Technology Stack
- Next.js: 14.2.0
- React: 18.3.0
- Node.js: 20.x
- Last verified: 2025-11-19
```

### 7. Cross-References
Link related documents:
```markdown
For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
For architecture details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
```

---

## Documentation Maintenance

### Session Shutdown Checklist

Before ending any work session:

1. **Update CONTEXT.md**:
   ```markdown
   ### Session 2025-11-19
   **Focus**: OAuth debugging
   **Actions Taken**:
   - Fixed callback URL
   - Tested login flow
   **Outcome**: OAuth working
   ```

2. **Update CHANGELOG.md** (if significant change):
   ```markdown
   ## [Unreleased]
   ### Fixed
   - OAuth redirect issues with Keystatic
   ```

3. **Update README.md** (if changed architecture/setup)

4. **Create ADR** (if made architectural decision):
   ```bash
   # Create new ADR
   touch docs/adr/ADR-003-use-keystatic-over-tinacms.md
   ```

5. **Verify Links** (if added new docs):
   ```bash
   # Check for broken links (if using link checker)
   npx markdown-link-check *.md
   ```

### Weekly Review

Every week, review docs for:
- [ ] Accuracy (anything outdated?)
- [ ] Completeness (anything missing?)
- [ ] Clarity (anything confusing?)
- [ ] Links (anything broken?)

### Monthly Cleanup

Every month:
- [ ] Archive old/obsolete docs
- [ ] Consolidate duplicate information
- [ ] Update version numbers
- [ ] Review and update CONTEXT.md "Recent Changes"

---

## Documentation Quality Gates

Before merging any PR:

### Required
- [ ] Updated CONTEXT.md with session summary
- [ ] Updated CHANGELOG.md if user-facing change
- [ ] Updated README.md if changed setup/usage
- [ ] Code changes include inline documentation

### If Architectural Change
- [ ] Created or updated ADR
- [ ] Updated ARCHITECTURE.md
- [ ] Updated relevant diagrams

### If API Change
- [ ] Updated API.md (if exists)
- [ ] Updated type definitions
- [ ] Updated integration tests

### If Deployment Change
- [ ] Updated DEPLOYMENT.md
- [ ] Updated environment variable docs
- [ ] Tested deployment procedure

---

## Anti-Patterns to Avoid

### 1. Stale Documentation
**Bad**:
```markdown
Last Updated: 2024-01-01
```
(But code changed in November)

**Good**: Update docs when code changes, or use automation

### 2. Documentation Drift
**Bad**: README says use `npm start`, but actual command is `npm run dev`

**Good**: Verify docs match reality, add to CI if possible

### 3. Scattered Information
**Bad**: OAuth setup instructions in README, DEPLOYMENT.md, and CONTEXT.md

**Good**: Define once in DEPLOYMENT.md, reference from others

### 4. No Examples
**Bad**:
```markdown
Set the API_KEY environment variable.
```

**Good**:
```markdown
Set the API_KEY environment variable:

```bash
export API_KEY=your-key-here
```

Example `.env.local`:
```
API_KEY=abc123xyz
```
```

### 5. Wall of Text
**Bad**: 500-line paragraph with no structure

**Good**: Use headings, bullets, tables, code blocks for scannable content

### 6. Assuming Context
**Bad**: "Fix the OAuth thing like we discussed"

**Good**: "Fix OAuth redirect by adding callback URL to GitHub App settings"

---

## Documentation Templates

### Session Update Template
```markdown
### Session YYYY-MM-DD
**Focus**: Brief description

**Actions Taken**:
- Action 1
- Action 2
- Action 3

**Files Changed**:
- `path/to/file.ts` - What changed
- `path/to/another.tsx` - What changed

**Outcome**: What was achieved
**Next**: What comes next
**Blockers**: Any issues encountered
```

### ADR Template
```markdown
# ADR-NNN: Title

**Date**: YYYY-MM-DD
**Status**: Proposed | Accepted | Deprecated | Superseded
**Deciders**: Names

## Context
What is the issue we're seeing that is motivating this decision?

## Decision
What is the change we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?

**Positive**:
- Benefit 1
- Benefit 2

**Negative**:
- Cost 1
- Cost 2

## Alternatives Considered
- Alternative 1 (rejected because...)
- Alternative 2 (rejected because...)
```

### Troubleshooting Entry Template
```markdown
### Problem: Brief description

**Symptoms**:
- What you see
- Error messages

**Cause**: Why it happens

**Solution**:
```bash
# Commands to fix
```

**Verification**:
- How to verify it's fixed
```

---

## AI Context Optimization

### Optimizing Docs for AI Assistants

AI assistants work best with:

1. **Structured Information**:
   - Use consistent headings
   - Use tables for related data
   - Use lists for steps/items

2. **Explicit Context**:
   - Include "Quick Facts" section
   - State current status explicitly
   - Include last updated date

3. **Self-Contained Sections**:
   - Each section understandable independently
   - Include necessary context
   - Cross-reference related sections

4. **Actionable Information**:
   - Include exact commands
   - Include verification steps
   - Include troubleshooting

### Session Startup Prompt Template

For efficient AI context loading:

```markdown
I'm working on the Bear Lake Camp project. Here's the context:

**Project**: Bear Lake Camp website
**Location**: /Users/travis/dev/bearlakecamp
**Stack**: Next.js 14 + Keystatic CMS
**Status**: Production at https://prelaunch.bearlakecamp.com

**Current Task**: [What I want to do]

**Context Docs**:
- CONTEXT.md has full project context
- README.md has project overview
- MIGRATION-PLAN.md has pending migration

**Question**: [Specific question or request]
```

---

## Success Criteria

Documentation is successful when:

1. **New Session Startup** < 2 minutes
   - Read Quick Facts
   - Understand current state
   - Know what to work on

2. **New Developer Onboarding** < 30 minutes
   - Read README.md
   - Follow QUICKSTART.md
   - Have working local environment

3. **Issue Resolution** < 15 minutes
   - Find relevant troubleshooting section
   - Follow solution steps
   - Verify fix

4. **Cross-Session Context** = 100%
   - No repeated explanations
   - No "what was I working on?"
   - Clear next steps

---

## Documentation Metrics

Track these metrics to improve documentation quality:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Session startup time | <2 min | Time from "new session" to oriented |
| Docs freshness | <7 days | Time since last update |
| Broken links | 0 | Link checker results |
| Completeness | 100% | All required files exist |
| Clarity | >90% | Feedback from users |

---

**End of Documentation Standards**

Update this document when documentation practices evolve.
