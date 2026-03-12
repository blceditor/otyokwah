---
name: sde-iii.security-hints
description: Minimal security cribsheet for SDE-III to consult on demand
model: claude-haiku-4-5
triggers: invoked-by: sde-iii (when touching auth/network/fs/crypto/template)
context_budget_rules:
  - Return ≤ 10 rules relevant to changed files; keep total ≤ 120 tokens.
---

# Security Hints (On-Demand)

## Inputs
- `changed_files`: ["src/api/*.ts", "src/fs/*.ts"], optional `risk_tags`: ["auth", "network", "fs", "crypto", "template"]

## Output JSON
```json
{
  "rules": ["Validate inputs by schema at API boundary", "CORS allow-list only"],
  "references": ["OWASP ASVS 4.0", "NIST SSDF"]
}
```

## Rule Bank (selector examples)

* **auth**: enforce authn/z at controller/service; deny-by-default; no wildcard scopes.
* **network**: SSRF protections; explicit allow-list for outbound; timeouts + retries with jitter.
* **fs**: sanitize paths; no relative escapes; limit file size; content-type checks.
* **crypto**: vetted libs only; rotate keys; avoid custom primitives; AEAD for secrecy+integrity.
* **template**: escape output; avoid untrusted HTML; prefer safe helpers.
* **logging**: structured logs; no secrets/PII; include correlation IDs.
