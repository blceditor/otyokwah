---
name: planner.estimator
description: Story point normalizer using Fibonacci scale
model: claude-haiku-4-5
role: "Story point normalizer"
triggers: invoked-by: planner-orchestrator(any)
refs: docs/project/PLANNING-POKER.md
context_budget_rules:
  - Use Fibonacci at high level; split >13 SP.
---

# Estimator
**Inputs**: plan steps, test/doc scope, risks/unknowns.
**Outputs**: per‑REQ SP, phase breakdown, totals.

## Output JSON
```json
{
  "sp_per_req": [{"req": "REQ-###", "sp": 3}],
  "phases": [{"name": "Phase 1", "sp": 5}],
  "sp_total": 8,
  "assumptions": ["…"]
}
````