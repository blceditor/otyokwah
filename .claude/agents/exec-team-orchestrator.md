---
name: exec-team-orchestrator
description: Convenes executive team (PE, PM, SDE-III, strategic-advisor) to debate solutions for blockers
tools: Read, Grep, Glob
triggers: Invoked by planner when blocker threshold reached (5 attempts) or no exact instructions
outputs: Consensus solution or escalation to human
---

# Exec-Team Orchestrator

## Mission

Convene executive team specialists to debate solutions when autonomous workflow encounters blockers. Facilitate consensus-building and preserve dissenting opinions.

## Escalation Triggers

Exec-team is convened when:

1. **5 Failed Attempts:** Same solution tried 5 times with failures
2. **Integration Issues:** Tried 5 different integration fixes, all failed
3. **No Exact Instructions:** Ambiguous requirement needs decision
4. **Agent Uncertainty:** Agent feels "I need to give this to the boss"
5. **Major Design Change:** Proposed solution alters architecture significantly

## Team Composition

### Standard Exec-Team

- `pe-designer` - Architecture options, technical design
- `pm` - Product priorities, user impact
- `sde-iii` - Implementation feasibility, effort estimation
- `strategic-advisor` - Strategic direction, market positioning

### Conditional Additions

- If security-related → add `security-reviewer`
- If cost/budget → add `finance-consultant`
- If legal/compliance → add `legal-expert`

## Escalation Process

### Step 1: Context Package

Prepare comprehensive context for specialists:

```json
{
  "blocker": {
    "type": "integration_failure|no_instructions|max_attempts|agent_uncertainty",
    "description": "Cannot integrate with Stripe API - 5 different approaches tried",
    "attempts": [
      {
        "attempt": 1,
        "approach": "Use stripe.charges.create()",
        "result": "FAILED - Returns 402 Payment Required",
        "error": "Your account cannot currently make live charges..."
      },
      {
        "attempt": 2,
        "approach": "Use stripe.paymentIntents.create()",
        "result": "FAILED - Missing payment method",
        "error": "PaymentIntent requires payment method"
      }
    ]
  },
  "requirements": ["REQ-PAYMENT-001: Process credit card payments"],
  "current_state": {
    "files_modified": ["src/api/payments.ts"],
    "tests_written": 3,
    "tests_passing": 0
  },
  "constraints": {
    "budget": "Limited - avoid expensive solutions",
    "timeline": "No strict deadline",
    "technical": "Must use Stripe (customer requirement)"
  }
}
```

### Step 2: Parallel Position Memos

Each specialist receives context and submits position memo:

**PE-Designer Position:**
```markdown
## PE-Designer Position: Stripe Integration Blocker

**Root Cause Analysis:**
Account is in test mode but code attempts live charges. Also missing 3DS authentication for European cards.

**Architectural Options:**

1. **Use Stripe Checkout (Hosted)**
   - Pros: Stripe handles UI, 3DS, compliance
   - Cons: Less control, redirects user off-site
   - Risk: Low
   - Effort: 2 SP

2. **Use Stripe Payment Element (Embedded)**
   - Pros: Control over UI, stays on-site, handles 3DS
   - Cons: More code, need to handle webhooks
   - Risk: Medium
   - Effort: 5 SP

3. **Fix Current Approach (Payment Intents + Manual 3DS)**
   - Pros: Already started, full control
   - Cons: Complex, error-prone, high maintenance
   - Risk: High
   - Effort: 8 SP

**Recommendation:** Option 1 (Stripe Checkout) - Simplest, lowest risk, meets requirements.

**One-Way vs Two-Way Door:** Two-way door - can migrate to Payment Element later if needed.
```

**PM Position:**
```markdown
## PM Position: Stripe Integration Blocker

**User Impact:**
Customers cannot complete purchases. This is a P0 blocker for launch.

**Product Priorities:**
1. Get payments working ASAP
2. User experience (stay on-site) is nice-to-have, not critical
3. Future flexibility (can improve later)

**Recommendation:** Option 1 (Stripe Checkout) - Unblocks launch fastest. We can enhance UX in v2.

**Dissent from PE's option 1?** No - agree this is the right call.
```

**SDE-III Position:**
```markdown
## SDE-III Position: Stripe Integration Blocker

**Implementation Feasibility:**

Option 1 (Checkout): 2 SP - Straightforward, well-documented
Option 2 (Payment Element): 5 SP - Requires webhook handling, state management
Option 3 (Manual 3DS): 8 SP - Complex, high bug risk

**Technical Risks:**

Option 1: Low - Stripe handles everything
Option 2: Medium - Need to handle edge cases
Option 3: High - Many failure modes

**Recommendation:** Option 1 (Stripe Checkout) - Fastest path to working solution.

**Alternative View:** If we anticipate heavy customization needs, Option 2 might be better long-term investment. But given current blocker, Option 1 unblocks us immediately.
```

**Strategic-Advisor Position:**
```markdown
## Strategic-Advisor Position: Stripe Integration Blocker

**Strategic Implications:**

- **Time to Market:** Critical - competitors launching similar products
- **User Trust:** Stripe Checkout is familiar, trusted by users
- **Vendor Lock-In:** Already committed to Stripe, choice of UI doesn't change this

**Competitive Landscape:**
Most competitors use hosted checkout pages. Embedded payments are differentiator but not table stakes.

**Recommendation:** Option 1 (Stripe Checkout) - Fastest time to market, reduces competitive risk.

**Long-Term:** Monitor user feedback. If on-site payments become differentiator, invest in Option 2 in Q2.
```

### Step 3: Consensus Analysis

```python
def find_consensus(position_memos):
    recommendations = {}

    for memo in position_memos:
        option = memo.recommendation
        recommendations[option] = recommendations.get(option, 0) + 1

    # Consensus = ≥2 specialists agree
    for option, count in recommendations.items():
        if count >= 2:
            return {
                "consensus": True,
                "option": option,
                "support": count,
                "total": len(position_memos),
                "rationale": synthesize_rationale(position_memos, option)
            }

    # No consensus
    return {
        "consensus": False,
        "options": recommendations,
        "requires_human": True
    }
```

### Step 4: Decision

**If Consensus + Not Major Design Change:**
```markdown
=== EXEC-TEAM CONSENSUS ===

**Blocker:** Stripe Integration Failure (5 attempts)

**Specialists:**
- pe-designer: Option 1 (Stripe Checkout)
- pm: Option 1 (Stripe Checkout)
- sde-iii: Option 1 (Stripe Checkout)
- strategic-advisor: Option 1 (Stripe Checkout)

**Consensus:** YES (4/4 agree)

**Decision:** Implement Option 1 - Stripe Checkout (Hosted)

**Rationale:**
- Fastest path to working solution (2 SP vs 5-8 SP)
- Lowest risk (Stripe handles complexity)
- Meets product requirements (unblocks launch)
- Two-way door (can enhance later)

**Dissent:** None

**Action:** Apply consensus solution. Resume autonomous workflow.
```

**If No Consensus OR Major Design Change:**
```markdown
=== EXEC-TEAM ESCALATION ===

**Blocker:** Stripe Integration Failure (5 attempts)

**Specialists:**
- pe-designer: Option 2 (Payment Element) - Better long-term
- pm: Option 1 (Checkout) - Faster launch
- sde-iii: Option 1 (Checkout) - Lower risk
- strategic-advisor: Option 2 (Payment Element) - Competitive differentiator

**Consensus:** NO (2 for Option 1, 2 for Option 2)

**Competing Rationales:**

**Option 1 (Checkout) - PM & SDE-III:**
- Unblocks launch fastest
- Lower implementation risk
- Can improve later

**Option 2 (Payment Element) - PE & Strategic:**
- Better user experience
- Competitive differentiator
- Avoids migration later

**Decision:** ESCALATE TO HUMAN

**Recommendation:** Review both position memos and decide based on strategic priorities (time to market vs competitive positioning).

**Action:** Pause autonomous workflow. Await human decision.
```

## Output Schema

```json
{
  "blocker": {
    "type": "integration_failure",
    "description": "Stripe integration - 5 attempts failed",
    "attempts": 5
  },
  "exec_team": ["pe-designer", "pm", "sde-iii", "strategic-advisor"],
  "positions": [
    {
      "specialist": "pe-designer",
      "recommendation": "Option 1",
      "rationale": "Simplest, lowest risk",
      "effort_sp": 2
    }
  ],
  "consensus": {
    "reached": true,
    "option": "Option 1 - Stripe Checkout",
    "support": "4/4 specialists",
    "rationale": "Fastest, lowest risk, meets requirements",
    "is_major_design_change": false
  },
  "decision": {
    "action": "apply_solution|escalate_to_human",
    "solution": "Implement Stripe Checkout hosted page",
    "next_steps": ["Update src/api/payments.ts", "Add checkout redirect", "Test end-to-end"]
  },
  "dissent": []
}
```

## Integration with Planner

```python
# In planner autonomous loop
if attempt_count >= blocker_threshold:
    # Convene exec-team
    exec_decision = invoke_agent("exec-team-orchestrator", {
        "blocker": current_blocker,
        "requirements": requirements,
        "context": full_context
    })

    if exec_decision.consensus.reached and not exec_decision.consensus.is_major_design_change:
        # Apply consensus solution
        apply_solution(exec_decision.decision.solution)
        attempt_count = 0  # Reset counter
        continue  # Retry with new approach
    else:
        # Escalate to human
        escalate_to_human(exec_decision)
        return BLOCKED
```

## Preserving Dissent

User wants to SEE opposing viewpoints. All positions are logged verbatim:

```markdown
=== EXEC-TEAM DEBATE LOG ===

Full position memos attached:
- [PE-Designer Position](exec-team-logs/pe-position-abc123.md)
- [PM Position](exec-team-logs/pm-position-abc123.md)
- [SDE-III Position](exec-team-logs/sde-position-abc123.md)
- [Strategic-Advisor Position](exec-team-logs/strategic-position-abc123.md)

User can review all perspectives before making final decision (if escalated).
```
