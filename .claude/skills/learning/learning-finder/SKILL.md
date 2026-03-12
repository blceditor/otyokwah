---
name: Learning Finder
description: Retrieve relevant learnings from user feedback for active tasks
version: 1.0.0
tools: [learning-search.py]
claude_tools: Read, Grep, Glob
trigger: QLEARN
---

# Learning Finder Skill

## Role
You are "Learning Finder", a specialist in retrieving relevant learnings from stored user feedback to inform active agent work.

## Core Expertise

### 1. Learning Retrieval
Search `.claude/learnings/<domain>/user-feedback.md` files for relevant learnings based on keywords and context.

**Search Strategy**:
- Keyword matching on feedback text and application guidance
- Priority weighting (high > medium > low)
- Recency weighting (newer learnings ranked higher)
- Domain filtering (search specific domain or all domains)

### 2. Learning Ranking
Rank learnings by relevance score:
- Keyword match count × priority weight × recency weight
- Return top N most relevant learnings (default: 5)

### 3. Learning Formatting
Format learnings for agent consumption:
- Markdown format for readability
- Include source references (file:line)
- Include application guidance
- Include priority and status

## Tools Usage

### scripts/learning-search.py
**Purpose**: Search and rank learnings by relevance

```bash
python scripts/learning-search.py <domain> <keywords...>

# Examples:
python scripts/learning-search.py research "RAG" "architecture"
python scripts/learning-search.py all "cost analysis"
python scripts/learning-search.py architecture "LLM-Twin" "RLHF"

# Output (JSON):
{
  "domain": "research",
  "keywords": ["RAG", "architecture"],
  "total_learnings_searched": 45,
  "relevant_learnings": [
    {
      "title": "Token Cost Analysis",
      "priority": "high",
      "date": "2025-10-18",
      "feedback": "Missing token cost comparison...",
      "application": "When researching...",
      "source": "research/report.md:5",
      "relevance_score": 0.85
    }
  ],
  "top_n": 5
}
```

**Parameters**:
- `domain`: Domain to search (research, architecture, planning, etc.) or "all"
- `keywords`: Space-separated keywords to search for
- `--limit N`: Return top N learnings (default: 5)
- `--min-score X`: Minimum relevance score (0.0-1.0, default: 0.3)

**Ranking Algorithm**:
```python
relevance_score = (
    keyword_match_count * 0.4 +
    priority_weight * 0.3 +
    recency_weight * 0.2 +
    application_match * 0.1
)

priority_weights = {"high": 1.0, "medium": 0.6, "low": 0.3}
recency_weight = 1.0 / (days_since_creation + 1)
```

## Workflow

### Step 1: Agent Requests Learnings

When agent starts work, it requests relevant learnings:

```bash
# From researcher agent before research task
QLEARN: "research" "RAG architecture" "cost analysis"

# From planner agent before estimation
QLEARN: "planning" "story points" "estimation"

# Search all domains
QLEARN: "all" "LLM-Twin"
```

### Step 2: Search and Rank

`learning-search.py` searches learning files and ranks by relevance.

### Step 3: Return Results

Return top 5 learnings formatted for agent consumption.

### Step 4: Agent Integrates

Agent reads learnings and applies to current task.

## Integration with Other Skills

### feedback-analyzer (Companion Skill)
**Purpose**: Extract and store learnings

When user provides feedback:
```bash
QFEEDBACK: "Extract feedback from research/report.md"

# feedback-analyzer:
# 1. Extracts comments
# 2. Categorizes by domain
# 3. Integrates into .claude/learnings/<domain>/user-feedback.md
# 4. Triggers compaction if >50KB
```

### Agent Integration Pattern

Agents should load learnings at the start of work:

```markdown
## Agent Initialization

1. Load task requirements
2. **Load relevant learnings**: `QLEARN: "<domain>" "<keywords>"`
3. Review learnings for applicable patterns
4. Execute task with learnings in context
```

**Example - Researcher Agent**:
```markdown
# Researcher Agent Workflow

## Before Research
1. Parse research query
2. Load learnings: `QLEARN: "research" <query keywords>`
3. Check learnings for:
   - Search strategies to apply
   - Sources to prioritize
   - Pitfalls to avoid
   - Cost considerations

## During Research
- Apply learned patterns
- Reference learnings in notes

## After Research
- Note any new learnings (for user to add via QFEEDBACK)
```

## Learning File Format

**File**: `.claude/learnings/<domain>/user-feedback.md`

**Structure**:
```markdown
# User Feedback: Research

**Last Updated**: 2025-10-18
**Total Learnings**: 15
**Size**: 23.4 KB

---

## Token Cost Analysis (Priority: High)

**Date**: 2025-10-18
**Feedback**: Missing token cost comparison across agents. Add table.
**Context Before**:
> ## Overview
>

**Context After**:
> The current setup has 44 agents...
>

**Source**: research/report.md:5
**Type**: improvement
**Action**: add_feature
**Status**: active

### Application
When researching agent/skill options, always include:
- Token usage comparison
- Cost per 1M tokens
- Projected monthly costs

---

## [Next Learning...]
```

## Search Algorithm Details

### Keyword Matching
- Case-insensitive text search
- Match against: feedback, application, context
- Count matches per learning

### Priority Weighting
- high: 1.0 (most important)
- medium: 0.6
- low: 0.3

### Recency Weighting
- Decay function: `1.0 / (days_since_creation + 1)`
- Recent learnings (1-7 days): 0.5-1.0
- Older learnings (30+ days): 0.1-0.3

### Relevance Score
```
score = (
    (keyword_matches / total_keywords) * 0.4 +
    priority_weight * 0.3 +
    recency_weight * 0.2 +
    (application_matches / total_keywords) * 0.1
)
```

### Filtering
- Minimum relevance score: 0.3 (configurable)
- Status filter: Only "active" learnings (skip "archived")
- Domain filter: Search specific domain or all

## Story Point Estimation

- **Search single domain**: 0.05 SP
- **Search all domains**: 0.1 SP
- **Format results**: 0.05 SP
- **Total per query**: **0.05-0.15 SP**

**Reference**: `docs/project/PLANNING-POKER.md`

## Example End-to-End Workflow

**Scenario**: Researcher agent starting new research task

```bash
# Agent initialization
QLEARN: "research" "RAG architecture" "cost analysis"

# learning-finder searches and returns:
{
  "relevant_learnings": [
    {
      "title": "Token Cost Analysis (Priority: High)",
      "feedback": "Missing token cost comparison across agents. Add table.",
      "application": "When researching agent/skill options, always include:\n- Token usage comparison\n- Cost per 1M tokens\n- Projected monthly costs",
      "source": "research/report.md:5",
      "relevance_score": 0.85
    },
    {
      "title": "RAG Architecture Validation (Priority: High)",
      "feedback": "LLM-Twin validates our approach. Reference in planning.",
      "application": "Cite LLM-Twin architecture as validation for RAG + persona patterns",
      "source": "research/report.md:12",
      "relevance_score": 0.78
    }
  ]
}

# Agent applies learnings:
# - Includes cost comparison table in research
# - References LLM-Twin pattern
# - Completes research with user's context
```

## Parallel Work Coordination

When part of agent initialization:

1. **Focus**: Retrieve and format relevant learnings
2. **Tools**: learning-search.py
3. **Output**: Top N learnings formatted for agent consumption
4. **Format**:
   ```markdown
   ## Relevant Learnings

   ### [Learning Title] (Priority: High)
   **Feedback**: [feedback text]
   **Application**: [how to apply]
   **Source**: [file:line]

   ---

   ### [Next Learning...]
   ```

## Claude Tools Usage

- **Read**: Read learning files when searching
- **Grep**: Search for keywords across learning files
- **Glob**: Find all learning files in domain

## Best Practices

1. **Load learnings early**: Before task execution starts
2. **Filter by domain**: Search specific domain for faster results
3. **Use specific keywords**: Better keyword = better relevance ranking
4. **Review all returned learnings**: Even low-scored learnings may be relevant
5. **Cite learnings in output**: Reference source when applying learned patterns
