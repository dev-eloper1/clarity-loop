# cl-reviewer

The quality gate skill. Reviews proposals, manages the fix-review loop, merges approved changes to system docs, verifies merges, audits the full documentation set, detects code-doc drift, reviews design artifacts, and applies targeted corrections.

**Command**: `/cl-reviewer [mode]`

---

## Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| `review` | "review", "check this proposal", "is this ready to merge" | Initial proposal review against system docs |
| `re-review` | Auto-triggered after fixes | Verify fixes landed, check for regressions |
| `fix` | "fix the proposal", "address review issues" | Help resolve blocking issues from a review |
| `merge` | "merge", "apply to system docs" | Apply approved proposal to system docs |
| `verify` | Auto-triggered after merge | Confirm merge was complete and faithful |
| `audit` | "audit", "check system doc health" | Full health check of all system docs |
| `correct` | "correct", "apply fixes from audit" | Targeted fixes with clear diagnosis |
| `sync` | "sync", "check code-doc alignment" | Detect drift between docs and codebase |
| `design-review` | "review designs", "check design against PRD" | Validate design artifacts against system docs |

---

## Review

Co-reviews proposals against system docs across six dimensions.

### Six Review Dimensions

| Dimension | What It Checks |
|-----------|---------------|
| **Value Assessment** | Does this solve a real problem? Is complexity justified? |
| **Internal Coherence** | Consistent with itself? Terms used consistently? Logic gaps? |
| **External Consistency** | Conflicts with system docs? Redefines established terms? |
| **Technical Soundness** | Feasible? Scalability/security concerns? Edge cases? |
| **Completeness** | Unstated assumptions? Missing failure modes? Migration paths? |
| **Spec-Readiness** | Types concrete enough? Interfaces precise? Enough for implementation? |

### Cross-Proposal Conflict Detection

Checks [PROPOSAL_TRACKER.md](pipeline-concepts.md#tracking-files) for other in-flight proposals targeting the same system doc sections.

### Verdicts

| Verdict | Meaning |
|---------|---------|
| **APPROVE** | Ready to merge |
| **APPROVE WITH CHANGES** | Minor issues, can merge after small fixes |
| **NEEDS REWORK** | Blocking issues that must be resolved |

### Review Output

Creates `docs/reviews/proposals/REVIEW_P-NNN_v1.md` with:
- Summary and verdict
- Blocking issues (dimension, location, issue, why it matters, suggestion)
- Non-blocking suggestions
- Spec-readiness notes
- Consistency map against system docs
- Strengths and risk assessment

---

## Re-Review

Auto-triggered after fixes are applied to a proposal. Not just a diff check — it builds a **cumulative issue ledger** from ALL previous reviews.

### Why Cumulative?

Fixing issue A can silently re-break issue B from an earlier round. The cumulative ledger catches regressions that round-by-round review would miss.

### Analysis

For each item in the cumulative ledger:
- **Fixed** — issue resolved
- **Partially fixed** — some improvement, not complete
- **Not fixed** — unchanged
- **Regressed** — was fixed, now broken again

Plus a regression scan for NEW issues introduced by the fix process.

### Output

Creates `docs/reviews/proposals/REVIEW_P-NNN_v[N].md` with issue resolution status, new issues, regressions, and review cycle health assessment.

---

## Fix

Helps you address blocking issues from a review. Walks through each issue with context and applies approved fixes.

### Process

1. Reads the latest review file and extracts blocking issues
2. Presents each issue with: title, dimension, location, the issue, why it matters, suggested fix
3. You approve, modify, or skip each fix
4. Applies approved fixes to the proposal
5. Auto-triggers [re-review](#re-review)

Non-blocking suggestions are presented separately — you choose whether to address them.

---

## Merge

Applies an approved proposal to system docs. This is the only way (besides bootstrap and correct) to modify protected system docs.

### Prerequisites

- Proposal exists with APPROVE or APPROVE WITH CHANGES verdict
- No conflicting merges in progress

### Process

1. Reads the proposal's [Change Manifest](cl-researcher.md#change-manifest)
2. Presents the merge plan for your approval
3. Creates the [pipeline authorization marker](pipeline-concepts.md#system-doc-protection)
4. Applies each change from the manifest
5. Removes the authorization marker
6. Updates PROPOSAL_TRACKER (status: merged)
7. Auto-triggers [verify](#verify)

See [System Doc Protection](pipeline-concepts.md#system-doc-protection) for how the authorization model works.

---

## Verify

Post-merge verification. Ensures the proposal was applied faithfully and system docs remain internally consistent.

### Four-Part Verification

| Check | What It Does |
|-------|-------------|
| **Application Completeness** | Every change in the manifest applied? None missing or partial? |
| **Fidelity** | System doc version faithfully represents proposal intent? Details preserved? |
| **Cross-Document Consistency** | Contradictions? Terminology drift? Broken cross-references? |
| **Collateral Damage** | Unrelated sections accidentally modified or deleted? |

### Verdicts

| Verdict | Meaning |
|---------|---------|
| **CLEAN MERGE** | All changes applied correctly, no issues |
| **ISSUES FOUND** | Minor problems detected |
| **INCOMPLETE MERGE** | Changes missing or misapplied |

### Design Nudge

After verification, if system docs reference UI features but no design artifacts exist in `docs/designs/`, the skill suggests running `/cl-designer setup`.

### Output

Creates `docs/reviews/proposals/VERIFY_P-NNN.md` with application status table, fidelity issues, consistency report, and collateral damage check.

---

## Audit

Comprehensive health check of the entire `docs/system/` directory. Unlike proposal-scoped reviews, audits examine all documentation as a unified body.

### Eight Dimensions

| Dimension | What It Checks |
|-----------|---------------|
| **Cross-Document Consistency** | Contradictions, terminology drift, stale cross-refs, redundancy |
| **Within-Document Consistency** | Internal contradictions, definition shifts, orphaned references, unresolved TODOs |
| **Technical Correctness** | Technology claims accurate? Patterns correct? Feasibility concerns? Uses web search to verify |
| **Goal Alignment & Drift** | Still serving original goals? Feature creep? Lost priorities? Compares with previous audits for trends |
| **Completeness** | Features in requirements but not architecture? Missing integration points? |
| **Abstraction Coherence** | Architecture staying architectural? Technical design not restating requirements? |
| **Design Completeness** | If UI features exist in docs, do design artifacts exist? Are they current? |
| **Staleness** | Outdated approaches? Unresolved "planned" features? Stale dates and versions? |

### Drift Analysis

Reads previous audit reports (`docs/reviews/audit/AUDIT_*.md`) and compares trends. Catches gradual degradation that individual proposal reviews miss.

### When to Run

- After 3-5 proposals have been merged (cumulative drift check)
- Before a major implementation phase (confidence check)
- When something feels off but you can't pinpoint it
- Periodically as hygiene

### Output

Creates `docs/reviews/audit/AUDIT_YYYY-MM-DD.md` with executive summary, health scores per dimension with trend indicators, critical findings, and prioritized recommendations.

Audit findings feed back into the pipeline — critical findings should be addressed through targeted research or [corrections](#correct).

---

## Correct

Lightweight targeted fixes for issues where the diagnosis is already clear. Skips the full research-proposal-review pipeline.

### When to Use

Appropriate for:
- Stale cross-references
- Terminology drift
- Broken links
- Factual errors caught by audit
- Consistency fixes
- Orphaned TODOs
- Typos that change meaning

NOT appropriate for (use full pipeline instead):
- New concepts or capabilities
- Changing architectural decisions
- Restructuring
- Changes where the "right fix" isn't obvious

### Process

1. Builds a Corrections Manifest from the source finding (audit, verify, or sync report)
2. Presents the manifest for your approval
3. Creates the [pipeline authorization marker](pipeline-concepts.md#system-doc-protection)
4. Applies corrections surgically — minimal changes, no scope creep
5. Removes the marker
6. Spot-checks changed sections
7. Logs to `docs/reviews/proposals/CORRECTIONS_[DATE].md`

---

## Sync

Detects drift between system doc claims and the actual codebase. Produces an advisory report — does not modify anything.

### Scope Options

```bash
/cl-reviewer sync                    # Full scan — all claims
/cl-reviewer sync --since main~10    # Last 10 commits
/cl-reviewer sync --since v1.0.0     # Since tag
/cl-reviewer sync --since 2026-01-15 # Since date
```

### What It Checks

Claims extracted from system docs and verified against code:

| Claim Type | Example |
|-----------|---------|
| File/directory structure | "src/gateway/ contains WebSocket handlers" |
| Technology/dependency | "Uses pgvector for semantic search" |
| Module structure | "memory/ exports EpisodicStore and SemanticStore" |
| API shape | "POST /api/events handles webhook ingestion" |
| Configuration | "Default port is 3000" |
| Process/flow | "Webhooks queue in pgmq, trigger via pg_notify" |

Skips aspirational claims, design rationale, and abstract principles.

### Categorization

| Category | Meaning |
|----------|---------|
| **In sync** | Doc matches code |
| **Potentially stale** | Code changed, claim may no longer hold |
| **Confirmed drift** | Doc says X, code clearly says Y |
| **Unverifiable** | Too abstract to check against code |

### Output

Creates `docs/reviews/audit/SYNC_YYYY-MM-DD.md` with drift summary, confirmed drift details with evidence, and recommendations for corrections or research.

---

## Design Review

Validates design artifacts against system docs and for internal consistency. Separated from [cl-designer](cl-designer.md) intentionally — creation and validation are different concerns.

### Prerequisites

At minimum `docs/specs/DESIGN_SYSTEM.md` must exist.

### Three Review Dimensions

| Dimension | What It Checks |
|-----------|---------------|
| **Design vs. System Docs** | Token alignment with PRD, feature coverage, orphan components |
| **Design vs. Code** | Component naming conventions, token-to-code mapping, library alignment |
| **Internal Consistency** | Token usage discipline, spacing scale adherence, naming conventions, variant uniformity |

With Pencil MCP available, the review uses `get_variables`, `batch_get`, and `search_all_unique_properties` for deeper verification.

### Output

Creates `docs/reviews/design/DESIGN_REVIEW_YYYY-MM-DD.md` with verdict (SOUND / ISSUES FOUND / SIGNIFICANT GAPS), per-dimension analysis, and recommendations.

---

## Review Artifacts

All review files follow consistent naming conventions:

| File Pattern | Location | When Created |
|-------------|----------|-------------|
| `REVIEW_P-NNN_v1.md` | `docs/reviews/proposals/` | Initial review |
| `REVIEW_P-NNN_v[N].md` | `docs/reviews/proposals/` | Re-review after Nth fix round |
| `VERIFY_P-NNN.md` | `docs/reviews/proposals/` | Post-merge verification |
| `CORRECTIONS_[DATE].md` | `docs/reviews/proposals/` | Targeted corrections applied |
| `AUDIT_YYYY-MM-DD.md` | `docs/reviews/audit/` | Full system audit |
| `SYNC_YYYY-MM-DD.md` | `docs/reviews/audit/` | Code-doc sync check |
| `DESIGN_REVIEW_YYYY-MM-DD.md` | `docs/reviews/design/` | Design artifact review |

---

## Related

- [cl-researcher](cl-researcher.md) — Generates proposals that this skill reviews
- [cl-implementer](cl-implementer.md) — Generates specs from verified system docs
- [cl-designer](cl-designer.md) — Creates design artifacts that this skill reviews
- [Pipeline Concepts](pipeline-concepts.md) — Protection model, tracking files, manifest
- [Hooks](hooks.md) — System doc protection enforcement
