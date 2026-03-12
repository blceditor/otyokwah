# Learning System Overview

This directory contains the complete feedback and learning integration system for Claude Code.

## Components

### 1. feedback-analyzer (Skill)
**Trigger**: `QFEEDBACK`
**Purpose**: Extract user feedback from markdown documents and integrate into learnings

**Tools**:
- `comment-extractor.py` - Extracts comments in `[TS- ...]` and `[FEEDBACK- ...]` formats
- `feedback-categorizer.py` - Auto-categorizes by domain, type, priority
- `learning-integrator.py` - Integrates into `.claude/learnings/<domain>/user-feedback.md`
- `feedback-summarizer.py` - Generates human-readable summary reports

**Workflow**:
```bash
QFEEDBACK: "Extract feedback from research/report.md"

# Automated pipeline:
# 1. Extract comments with context (2 lines before, 8 lines after)
# 2. Categorize by domain (research, architecture, planning, etc.)
# 3. Integrate into learning files
# 4. Generate summary report
# 5. Trigger compaction if files exceed 50KB
```

**Comment Formats Supported**:
- `[TS- feedback text ]` - Travis-specific format
- `[FEEDBACK- feedback text ]` - Standard format for sharing

### 2. learning-finder (Skill)
**Trigger**: `QLEARN`
**Purpose**: Retrieve relevant learnings for active tasks

**Tools**:
- `learning-search.py` - Search and rank learnings by relevance

**Workflow**:
```bash
# Search specific domain
QLEARN: "research" "RAG architecture" "cost analysis"

# Search all domains
QLEARN: "all" "LLM-Twin"

# Returns top 5 most relevant learnings with relevance scores
```

**Ranking Algorithm**:
```
relevance_score = (
    keyword_match_count * 0.4 +
    priority_weight * 0.3 +
    recency_weight * 0.2 +
    application_match * 0.1
)
```

### 3. learnings-compactor (Agent)
**Trigger**: `QCOMPACT` or automatic when files exceed 50KB
**Purpose**: Consolidate and archive learnings to prevent unbounded growth

**Workflow**:
1. Analyze learning file (identify themes, duplicates)
2. Consolidate redundant learnings
3. Archive old/integrated learnings
4. Integrate patterns into agent architecture
5. Reduce file size to <20KB
6. Generate compaction report

**Compaction Strategies**:
- Theme-based consolidation (group similar learnings)
- Time-based archival (archive old low-priority learnings)
- Pattern extraction (integrate recurring patterns into agents)
- Priority re-weighting (upgrade frequently-seen patterns)

## Learning Storage

**Directory Structure**:
```
.claude/learnings/
├── research/
│   ├── user-feedback.md (active learnings)
│   └── archived/
│       ├── 2025-10.md
│       └── 2025-09.md
├── architecture/
│   ├── user-feedback.md
│   └── archived/
├── planning/
├── quality/
├── security/
├── testing/
├── business/
├── prompting/
└── content/
```

**Learning Entry Format**:
```markdown
## [Learning Title] (Priority: High)

**Date**: 2025-10-18
**Feedback**: [user's feedback text]
**Context Before**:
> [2 lines before comment]

**Context After**:
> [8 lines after comment]

**Source**: file.md:line
**Type**: improvement | learning | correction | question | issue | suggestion
**Action**: add_feature | reference_in_future | skip | fix_issue | clarify
**Status**: active | integrated | archived

### Application
[How to apply this learning in future work]
```

## Auto-Categorization

### Domains (9 total)
Detected via keyword matching:
- **research**: search, sources, tier, trust score, validation
- **architecture**: RAG, RLHF, LLM-Twin, system design, schema
- **planning**: story points, estimation, requirements, REQ-
- **quality**: complexity, refactor, code review, PE
- **security**: RLS, auth, injection, vulnerability
- **testing**: test, coverage, assertion, spec
- **business**: PRD, PRFAQ, tenets, buy vs build, PMF
- **prompting**: token, prompt, optimization, efficiency
- **content**: LinkedIn, Twitter, Email, platform, tone

### Types (6 total)
Detected via sentiment/pattern matching:
- **improvement**: "missing", "should add", "needs", "lacks"
- **learning**: "great find", "validates", "important", "remember"
- **correction**: "wrong", "incorrect", "doesn't apply", "skip"
- **question**: "?", "what about", "how do we", "why"
- **issue**: "problem", "bug", "broken", "fails"
- **suggestion**: "consider", "maybe", "could", "recommend"

### Priorities (3 total)
Detected via keyword matching:
- **high**: "must", "critical", "required", "important", "ASAP", "blocker"
- **medium**: "should", "consider", "recommend", "nice to have"
- **low**: "maybe", "eventually", "future", "optional"

## Integration with Agent Workflow

Agents should load relevant learnings at initialization:

```markdown
## Agent Initialization Pattern

1. Parse task requirements
2. **Load learnings**: `QLEARN: "<domain>" "<task keywords>"`
3. Review learnings for applicable patterns
4. Execute task with learnings in context
5. Note new learnings for user to add via QFEEDBACK
```

**Example - Researcher Agent**:
```bash
# Before starting research
QLEARN: "research" "RAG" "cost analysis"

# Receives top 5 learnings about:
# - Cost analysis frameworks
# - RAG validation patterns
# - Search strategies
# - Source evaluation criteria

# Applies learnings during research
# Documents new insights for future QFEEDBACK
```

## Compaction Thresholds

**File Size Limits**:
- **Warning**: 40KB (approaching limit)
- **Trigger Compaction**: 50KB
- **Target After Compaction**: <20KB

**Archival Rules**:
- Status = "integrated" → archive immediately
- Priority = "low" AND age > 90 days → archive
- Priority = "medium" AND age > 180 days → archive
- Priority = "high" → manual review only (never auto-archive)

## Story Point Estimates

### feedback-analyzer
- Extract comments: 0.1 SP
- Categorize + integrate: 0.2 SP
- Generate summary: 0.1 SP
- **Total per document**: 0.4 SP

### learning-finder
- Search single domain: 0.05 SP
- Search all domains: 0.1 SP
- **Total per query**: 0.05-0.15 SP

### learnings-compactor
- Analyze file: 0.2 SP
- Consolidate learnings: 0.5 SP per 10 learnings
- Archive old learnings: 0.2 SP
- Integrate patterns: 0.3 SP per pattern
- Generate report: 0.2 SP
- **Total (typical 50KB file)**: 2-3 SP

## Usage Examples

### Example 1: Extract Feedback from Research Document
```bash
# User adds comments to research/report.md:
# [TS- Missing cost analysis table ]
# [TS- LLM-Twin validates our approach - reference in future planning ]

# Extract and integrate
QFEEDBACK: "Extract feedback from research/report.md"

# Output:
# - Extracted 2 comments
# - Categorized: research (1), architecture (1)
# - Integrated into learnings
# - Summary report generated
```

### Example 2: Load Learnings Before Research Task
```bash
# Researcher agent starting work
QLEARN: "research" "RAG" "architecture" "cost"

# Returns:
# 1. Cost Analysis Framework (Priority: High, Score: 0.85)
# 2. RAG Validation Pattern (Priority: High, Score: 0.78)
# 3. Search Strategy Optimization (Priority: Medium, Score: 0.65)
# 4. Source Tier Evaluation (Priority: Medium, Score: 0.58)
# 5. Token Usage Tracking (Priority: Medium, Score: 0.52)

# Agent applies these learnings during research
```

### Example 3: Compact Overflowing Learning File
```bash
# learning-integrator detects file >50KB
{
  "trigger_compaction": true,
  "files_needing_compaction": [".claude/learnings/research/user-feedback.md"]
}

# Manual compaction
QCOMPACT: "research"

# Actions taken:
# - Consolidated 8 learnings (23 → 15 active learnings)
# - Archived 10 old low-priority learnings
# - Integrated 2 patterns into researcher agent
# - Reduced file from 67.3 KB → 18.7 KB
# - Generated compaction report
```

## Best Practices

1. **Add comments during review**: When reviewing long documents, add `[TS- ...]` comments for insights
2. **Use QFEEDBACK regularly**: Extract learnings after completing research/planning documents
3. **Load learnings before work**: Agents should always run QLEARN before starting tasks
4. **Review compaction reports**: When compaction triggers, review the report to ensure no critical learnings lost
5. **Use specific keywords**: Better keywords in QLEARN = better relevance ranking
6. **Standard format for sharing**: Use `[FEEDBACK- ...]` when sharing documents with others

## Files Created

```
.claude/skills/learning/
├── README.md (this file)
├── feedback-analyzer/
│   ├── SKILL.md
│   └── scripts/
│       ├── comment-extractor.py
│       ├── feedback-categorizer.py
│       ├── learning-integrator.py
│       └── feedback-summarizer.py
└── learning-finder/
    ├── SKILL.md
    └── scripts/
        └── learning-search.py

.claude/agents/
└── learnings-compactor.md

.claude/learnings/
├── research/
├── planning/
├── architecture/
├── quality/
├── security/
├── testing/
├── business/
├── prompting/
└── content/
```

## CLAUDE.md Integration

The following QShortcuts have been added to CLAUDE.md:

```markdown
### Feedback & Learning Integration
- **QFEEDBACK**: Extract user feedback from markdown documents and integrate into learnings
- **QLEARN**: Retrieve relevant learnings for active task
- **QCOMPACT**: Consolidate learnings when files exceed 50KB
```
