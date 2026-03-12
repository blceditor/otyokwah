# AI Team Implementation Plan - Revised Architecture

> **Stack**: Next.js 14 + Keystatic CMS + Vercel ONLY
> **Priority**: T1 Specialists → T2 Reviewers → T3 Validation
> **Timeline**: 3 weeks to full autonomous system

**Date**: 2025-12-11
**Status**: Ready for Implementation

---

## Revised Team Structure

### Tier 1: Technology Specialists (3 roles - SIMPLIFIED)

| Role | Technology Focus | Primary Responsibilities | Scripts |
|------|------------------|-------------------------|---------|
| **nextjs-vercel-specialist** | Next.js 14 App Router, Vercel Edge Runtime, ISR, Middleware | Routes, metadata, server components, Vercel deployment config | 8 scripts |
| **keystatic-specialist** | Keystatic CMS schema, collections, reader API, content modeling | Schema design, field validation, content structure | 6 scripts |
| **react-frontend-specialist** | React Server Components, Client Components, Tailwind CSS, Accessibility | Component implementation, responsive design, a11y compliance | 7 scripts |

**Removed**: cloudflare-edge-specialist, supabase-specialist (not in stack)
**Merged**: Next.js + Vercel expertise into single specialist (tight integration)

### Tier 2: Architecture Reviewers (3 roles - FOCUSED)

| Role | Architecture Pattern Focus | Review Scope | Scripts |
|------|---------------------------|--------------|---------|
| **nextjs-vercel-architecture-reviewer** | Next.js performance, Vercel ISR/SSG, Edge middleware, bundle optimization | Route structure, caching strategy, build optimization | 5 scripts |
| **cms-architecture-reviewer** | Content modeling, schema evolution, migration safety | Schema changes, relationships, backward compatibility | 4 scripts |
| **frontend-architecture-reviewer** | Component architecture, accessibility patterns, responsive design | Component hierarchy, a11y compliance, design system | 4 scripts |

**Removed**: edge-performance-reviewer (merged into nextjs-vercel-architecture-reviewer)
**Removed**: security-reviewer (Vercel handles most security; Next.js patterns cover the rest)

### Tier 3: Validation & Proof (4 roles - UNCHANGED)

| Role | Validation Focus | Scripts |
|------|-----------------|---------|
| **visual-validation-specialist** | Component presence, DOM structure | 4 scripts |
| **production-validation-specialist** | Smoke tests, deployment verification | 3 scripts |
| **diagnosis-specialist** | Failure pattern matching, categorization | 3 scripts |
| **autofix-specialist** | Safe fix application, refactors | 4 scripts |

**Total Team**: 10 roles (was 13)
**Total Scripts**: 48 scripts (focused on actual stack)

---

## Implementation Phases

### Phase 1: T1 Specialists (Week 1) - 21 scripts

**Goal**: Create 3 technology specialists with deep expertise

#### Day 1-2: nextjs-vercel-specialist (8 scripts)
- Agent markdown file
- Pattern library (App Router, ISR, Edge Runtime)
- 8 Python scripts (route validation, bundle analysis, metadata checking)
- Example implementations
- Antipatterns documentation

#### Day 3-4: keystatic-specialist (6 scripts)
- Agent markdown file
- Pattern library (schema design, field types, collections)
- 6 Python scripts (schema validation, field type checking, collection sync)
- Example schemas
- Migration patterns

#### Day 5-7: react-frontend-specialist (7 scripts)
- Agent markdown file
- Pattern library (Server/Client components, Tailwind, a11y)
- 7 Python scripts (component isolation, Tailwind validation, ARIA checking)
- Component examples
- Accessibility patterns

**Deliverables Week 1**:
- 3 agent markdown files
- 3 pattern libraries (15 pattern docs total)
- 21 Python scripts (TDD-built with tests)
- Integration with QCODE workflow

### Phase 2: T2 Reviewers (Week 2) - 13 scripts

**Goal**: Create architecture-aware reviewers

#### Day 8-10: nextjs-vercel-architecture-reviewer (5 scripts)
- Agent markdown file
- Review checklists (performance, caching, builds)
- 5 Python scripts (bundle analysis, route profiling, ISR validation)
- Integration with QCHECK workflow

#### Day 11-12: cms-architecture-reviewer (4 scripts)
- Agent markdown file
- Review checklists (schema evolution, migrations)
- 4 Python scripts (schema migration validator, relationship checker)
- Integration with QCHECK workflow

#### Day 13-14: frontend-architecture-reviewer (4 scripts)
- Agent markdown file
- Review checklists (component architecture, a11y)
- 4 Python scripts (component hierarchy analyzer, a11y compliance checker)
- Integration with QCHECK workflow

**Deliverables Week 2**:
- 3 reviewer agent files
- 3 review checklists
- 13 Python scripts
- QCHECK workflow integration

### Phase 3: T3 Validation (Week 3) - 14 scripts

**Goal**: Autonomous validation with machine-verifiable proof

#### Day 15-17: Visual & Production Validation (7 scripts)
- visual-validation-specialist agent
- production-validation-specialist agent
- 7 Python scripts (component presence, DOM snapshot, deployment waiter)
- Integration with QVERIFY workflow

#### Day 18-19: Diagnosis & Auto-Fix (7 scripts)
- diagnosis-specialist agent (enhance existing)
- autofix-specialist agent (enhance existing)
- 7 Python scripts (pattern matcher, safe fix applicator, refactor engine)
- Integration with post-commit loop

#### Day 20-21: End-to-End Testing
- Test full QNEW → QGIT → Post-Commit loop
- Real feature implementation (staff directory page)
- Refine based on failures
- Document lessons learned

**Deliverables Week 3**:
- 4 validation agent files
- 14 Python scripts
- Full autonomous validation loop
- End-to-end proof of concept

---

## Script Inventory by TDD Phase

### Phase: QPLAN (Planning)

**Owner**: planner agent (existing, enhanced)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `planning-poker-calc.py` | Calculate story points | Task description | SP estimate |
| `test-coverage-planner.py` | Plan test coverage matrix | Requirements lock | Coverage plan |
| `dependency-graph-builder.py` | Build implementation order | File dependencies | DAG graph |
| `parallel-work-splitter.py` | Split work for parallel agents | Task breakdown | Agent assignments |

### Phase: QCODET (Test Writing)

**Owner**: test-writer agent (existing, enhanced)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `test-scaffolder.py` | Generate test boilerplate | Component path | Test file skeleton |
| `coverage-analyzer.py` | Identify coverage gaps | Test files + code | Gap report |
| `req-id-extractor.py` | Extract REQ-IDs | requirements.lock.md | REQ-ID list |
| `failure-assertion-generator.py` | Generate assertions that fail | REQ acceptance criteria | Test assertions |
| `test-data-factory.py` | Generate test fixtures | Schema/types | Mock data |

### Phase: QCODE (Implementation)

**Owner**: T1 Specialists

#### nextjs-vercel-specialist (8 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `next-route-validator.py` | Validate route structure | app/ directory | Validation report |
| `app-router-pattern-checker.py` | Check App Router patterns | .tsx files | Pattern compliance |
| `server-component-scanner.py` | Scan for server/client issues | Components | Issue list |
| `metadata-validator.py` | Validate metadata generation | page.tsx files | Metadata report |
| `vercel-config-validator.py` | Validate vercel.json | vercel.json | Config validation |
| `edge-middleware-checker.py` | Check middleware patterns | middleware.ts | Middleware report |
| `isr-validator.py` | Validate ISR configuration | Page files | ISR config report |
| `next-bundle-analyzer.py` | Analyze bundle size | Build output | Bundle report |

#### keystatic-specialist (6 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `keystatic-schema-validator.py` | Validate schema structure | keystatic.config.ts | Schema validation |
| `field-type-checker.py` | Check field type usage | Schema definitions | Type compliance |
| `collection-sync-validator.py` | Validate content sync | content/ vs schema | Sync report |
| `schema-migration-planner.py` | Plan schema migrations | Old vs new schema | Migration plan |
| `field-reference-validator.py` | Validate field references | Schema relationships | Reference validation |
| `content-model-analyzer.py` | Analyze content model | All collections | Model report |

#### react-frontend-specialist (7 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `component-isolator.py` | Extract component for testing | Component file | Isolated component |
| `tailwind-class-validator.py` | Validate Tailwind usage | Component files | Class validation |
| `aria-checker.py` | Check accessibility attributes | Component files | A11y report |
| `server-client-boundary-checker.py` | Check RSC boundaries | Component tree | Boundary violations |
| `client-component-detector.py` | Detect 'use client' violations | Component files | Client usage report |
| `responsive-design-validator.py` | Validate responsive patterns | Component files | Responsive report |
| `component-prop-validator.py` | Validate component props | Component + usage | Prop validation |

### Phase: QCHECK (Review)

**Owner**: T2 Architecture Reviewers

#### nextjs-vercel-architecture-reviewer (5 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `route-performance-profiler.py` | Profile route rendering | Route files | Performance report |
| `cache-strategy-analyzer.py` | Analyze caching patterns | Routes + config | Cache report |
| `build-optimization-checker.py` | Check build optimizations | next.config.mjs | Optimization report |
| `vercel-deployment-validator.py` | Validate deployment config | Vercel settings | Deployment validation |
| `edge-runtime-compliance.py` | Check Edge Runtime compliance | Edge functions | Runtime report |

#### cms-architecture-reviewer (4 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `schema-evolution-validator.py` | Validate schema changes | Git diff | Evolution safety |
| `content-relationship-checker.py` | Check content relationships | Schema relationships | Relationship report |
| `field-deprecation-detector.py` | Detect deprecated fields | Schema history | Deprecation warnings |
| `migration-safety-checker.py` | Check migration safety | Migration script | Safety report |

#### frontend-architecture-reviewer (4 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `component-hierarchy-analyzer.py` | Analyze component tree | Component imports | Hierarchy report |
| `a11y-compliance-checker.py` | Check full a11y compliance | All components | A11y compliance |
| `design-system-validator.py` | Validate design system usage | Components + config | Design validation |
| `responsive-breakpoint-checker.py` | Check breakpoint consistency | Tailwind usage | Breakpoint report |

### Phase: QVERIFY (Validation)

**Owner**: T3 Validation Specialists

#### visual-validation-specialist (4 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `component-presence-validator.py` | Check component rendering | Production URL | Presence report |
| `dom-snapshot-differ.py` | Compare DOM snapshots | Baseline vs current | Diff report |
| `visual-regression-checker.py` | Check visual changes | Screenshots | Regression report |
| `css-class-presence-checker.py` | Validate CSS classes applied | Production HTML | Class validation |

#### production-validation-specialist (3 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `deployment-waiter.py` | Wait for deployment | Vercel deployment ID | Deployment status |
| `vercel-id-poller.py` | Poll x-vercel-id header | Domain | Build ID |
| `health-check-poller.py` | Poll health endpoints | URLs | Health status |

### Phase: Post-Commit Loop

**Owner**: diagnosis-specialist, autofix-specialist

#### diagnosis-specialist (3 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `failure-pattern-matcher.py` | Match failures to patterns | Smoke test log | Pattern matches |
| `fix-strategy-recommender.py` | Recommend fix strategies | Failure pattern | Fix strategy |
| `safe-fix-detector.py` | Determine fix safety | Fix strategy | Safety classification |

#### autofix-specialist (4 scripts)

| Script | Purpose | Input | Output |
|--------|---------|-------|--------|
| `safe-fix-applicator.py` | Apply safe fixes | Fix strategy + files | Modified files |
| `css-class-adder.py` | Add missing CSS classes | Component + class | Updated component |
| `import-adder.py` | Add missing imports | File + import | Updated file |
| `simple-refactor-engine.py` | Apply simple refactors | Refactor pattern | Refactored code |

**Total Scripts**: 48 (all Python, all TDD-built with tests)

---

## Implementation Order (Day-by-Day)

### Week 1: T1 Specialists

#### Day 1: nextjs-vercel-specialist Foundation
- **Morning**: Create agent markdown, pattern library structure
- **Afternoon**: Implement 4 core scripts (route validator, pattern checker, server component scanner, metadata validator)
- **Deliverable**: Basic nextjs-vercel-specialist operational

#### Day 2: nextjs-vercel-specialist Complete
- **Morning**: Implement 4 advanced scripts (Vercel config, middleware, ISR, bundle analyzer)
- **Afternoon**: Write tests for all 8 scripts, integrate with QCODE
- **Deliverable**: Full nextjs-vercel-specialist with 8 working scripts

#### Day 3: keystatic-specialist Foundation
- **Morning**: Create agent markdown, pattern library
- **Afternoon**: Implement 3 core scripts (schema validator, field type checker, collection sync)
- **Deliverable**: Basic keystatic-specialist operational

#### Day 4: keystatic-specialist Complete
- **Morning**: Implement 3 advanced scripts (migration planner, reference validator, model analyzer)
- **Afternoon**: Write tests, integrate with QCODE
- **Deliverable**: Full keystatic-specialist with 6 working scripts

#### Day 5: react-frontend-specialist Foundation
- **Morning**: Create agent markdown, pattern library
- **Afternoon**: Implement 4 core scripts (component isolator, Tailwind validator, ARIA checker, RSC boundary checker)
- **Deliverable**: Basic react-frontend-specialist operational

#### Day 6: react-frontend-specialist Complete
- **Morning**: Implement 3 advanced scripts (client detector, responsive validator, prop validator)
- **Afternoon**: Write tests, integrate with QCODE
- **Deliverable**: Full react-frontend-specialist with 7 working scripts

#### Day 7: T1 Integration & Testing
- **Morning**: Test all 3 specialists together on real feature
- **Afternoon**: Refine based on failures, document patterns
- **Deliverable**: T1 specialists production-ready

**Week 1 Output**: 3 specialists, 21 scripts, integrated QCODE workflow

### Week 2: T2 Reviewers

#### Day 8: nextjs-vercel-architecture-reviewer
- **All Day**: Agent markdown, review checklists, 5 scripts (performance profiler, cache analyzer, build checker, deployment validator, edge runtime checker)
- **Deliverable**: Complete reviewer with 5 scripts

#### Day 9: nextjs-vercel-architecture-reviewer Integration
- **Morning**: Write tests for 5 scripts
- **Afternoon**: Integrate with QCHECK workflow, test on real code
- **Deliverable**: Operational architecture reviewer

#### Day 10: cms-architecture-reviewer
- **All Day**: Agent markdown, review checklists, 4 scripts (evolution validator, relationship checker, deprecation detector, migration safety)
- **Deliverable**: Complete reviewer with 4 scripts

#### Day 11: cms-architecture-reviewer Integration
- **Morning**: Write tests for 4 scripts
- **Afternoon**: Integrate with QCHECK workflow
- **Deliverable**: Operational CMS reviewer

#### Day 12: frontend-architecture-reviewer
- **All Day**: Agent markdown, review checklists, 4 scripts (hierarchy analyzer, a11y checker, design system validator, breakpoint checker)
- **Deliverable**: Complete reviewer with 4 scripts

#### Day 13: frontend-architecture-reviewer Integration
- **Morning**: Write tests for 4 scripts
- **Afternoon**: Integrate with QCHECK workflow
- **Deliverable**: Operational frontend reviewer

#### Day 14: T2 Integration & Testing
- **All Day**: Test all 3 reviewers together, refine, document
- **Deliverable**: T2 reviewers production-ready

**Week 2 Output**: 3 reviewers, 13 scripts, integrated QCHECK workflow

### Week 3: T3 Validation

#### Day 15: visual-validation-specialist
- **All Day**: Agent markdown, 4 scripts (component presence, DOM snapshot differ, visual regression, CSS class checker)
- **Deliverable**: Visual validation operational

#### Day 16: production-validation-specialist
- **Morning**: Agent markdown, 3 scripts (deployment waiter, Vercel ID poller, health check poller)
- **Afternoon**: Integrate with smoke-test.sh, test on real deployments
- **Deliverable**: Production validation operational

#### Day 17: Visual + Production Integration
- **Morning**: Write tests for all 7 scripts
- **Afternoon**: Integrate with QVERIFY workflow, test autonomous validation
- **Deliverable**: Autonomous QVERIFY working

#### Day 18: diagnosis-specialist Enhancement
- **Morning**: Enhance existing agent, 3 new scripts (pattern matcher, fix recommender, safety detector)
- **Afternoon**: Integrate with post-commit loop
- **Deliverable**: Smart diagnosis working

#### Day 19: autofix-specialist Enhancement
- **Morning**: Enhance existing agent, 4 new scripts (safe fix applicator, CSS adder, import adder, refactor engine)
- **Afternoon**: Integrate with post-commit loop, test safe fixes
- **Deliverable**: Autonomous fixes working

#### Day 20: End-to-End Testing
- **All Day**: Test full QNEW → QGIT → Post-Commit loop on real feature (staff directory page)
- **Deliverable**: Autonomous execution proven

#### Day 21: Refinement & Documentation
- **Morning**: Refine based on E2E test failures
- **Afternoon**: Document patterns, update CLAUDE.md, create runbook
- **Deliverable**: System production-ready

**Week 3 Output**: 4 validation specialists, 14 scripts, full autonomous loop

---

## Success Metrics

### Week 1 Success Criteria
- ✅ nextjs-vercel-specialist can implement a new route autonomously
- ✅ keystatic-specialist can add a new collection autonomously
- ✅ react-frontend-specialist can create a new component autonomously
- ✅ All 21 scripts pass their tests
- ✅ QCODE workflow uses T1 specialists

### Week 2 Success Criteria
- ✅ nextjs-vercel-architecture-reviewer catches performance issues
- ✅ cms-architecture-reviewer validates schema migrations safely
- ✅ frontend-architecture-reviewer enforces a11y compliance
- ✅ All 13 scripts pass their tests
- ✅ QCHECK workflow uses T2 reviewers

### Week 3 Success Criteria
- ✅ QVERIFY runs autonomously with machine-verifiable proof
- ✅ Post-commit loop fixes simple failures autonomously (max 3 attempts)
- ✅ End-to-end test: "Add staff directory page" completes without human intervention
- ✅ Proof report generated with evidence (HTTP logs, DOM snapshots, screenshots)
- ✅ All 14 scripts pass their tests

### Final Success Criteria
- ✅ User can say "Add [feature]" and walk away
- ✅ AI executes QNEW → QGIT → production validation autonomously
- ✅ Failures handled autonomously (safe fixes) or escalated appropriately (complex fixes)
- ✅ Machine-verifiable proof report generated
- ✅ 48 Python scripts operational (all TDD-built)
- ✅ 10 specialist/reviewer agents operational
- ✅ Full autonomous loop proven with real feature

---

## Next Steps

1. **Review this plan** - Confirm timeline and priorities
2. **Start Day 1** - Create nextjs-vercel-specialist agent
3. **Follow day-by-day plan** - Build incrementally, test continuously
4. **Produce actual agent files** - See next documents for templates

**Estimated Total Effort**: 63 SP across 3 weeks (21 days)

---

**Document Status**: Ready for Implementation
**Next Document**: Agent templates for T1 specialists
