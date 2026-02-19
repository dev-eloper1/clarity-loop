# Review: Fan-Out Orchestration

**Reviewed**: 2026-02-19
**Proposal**: docs/proposals/FAN_OUT_ORCHESTRATION.md
**Research doc**: docs/research/R-005-FAN_OUT_ORCHESTRATION.md (confirmed present)
**System docs referenced**: docs/wiki/SYSTEM_DESIGN.md (S1, S10, S12, S14), docs/wiki/pipeline-concepts.md, skills/cl-reviewer/references/audit-mode.md, skills/cl-reviewer/references/verify-mode.md, skills/cl-reviewer/references/review-mode.md, skills/cl-reviewer/references/re-review-mode.md, skills/cl-implementer/references/spec-mode.md, skills/cl-implementer/references/run-mode.md, skills/cl-implementer/references/autopilot-mode.md

## Summary

This proposal formalizes 15 currently-prose parallelization points across 7 reference files into a structured 4-phase Discover/Spawn/Collect/Aggregate pattern, introduces 5 thin agent definitions in `.claude/agents/`, and adds an `orchestration` config block to `.clarity-loop.json`. The design is well-grounded in R-002 and R-005 research, depends on R-004 (confirmed merged per RESEARCH_LEDGER), and uses a dual-path approach that preserves the current sequential behavior as an explicit opt-out. The proposal is ready to merge with two targeted fixes: Change Manifest paths need updating for the recent `docs/wiki/` reorganization, and one step number reference in Change 18 is incorrect.

## Verdict: APPROVE WITH CHANGES

The design is sound and the value is high. Both blocking issues are mechanical corrections — no design rework needed.

---

## Cross-Proposal Conflicts

The proposal explicitly notes R-006 (Guidance/Execution Separation) designs the same agent types and targets the same modes. R-006 status is `draft` in RESEARCH_LEDGER. Since R-006 has no proposal yet, there is no manifest-level conflict right now. If R-006 reaches proposal stage, the two will need reconciliation — this proposal's agent file definitions should be treated as the canonical versions.

No other in-flight proposals detected in PROPOSAL_TRACKER.

---

## Blocking Issues

### 1. Change Manifest paths are stale — wiki docs moved to docs/wiki/

- **Dimension**: Ground Truth (Doc-to-File)
- **Where**: Change Manifest items 6, 7, 8, 9, 10, 11, 12, 13 — and the System Context table
- **Issue**: The `docs/wiki/` reorganization moved five documentation files after this proposal was written. All eight of these changes reference their pre-move paths:

  | Change # | Path in Proposal | Actual Current Path |
  |----------|-----------------|-------------------|
  | 6, 7, 8, 9 | `SYSTEM_DESIGN.md` | `docs/wiki/SYSTEM_DESIGN.md` |
  | 10 | `docs/cl-implementer.md` | `docs/wiki/cl-implementer.md` |
  | 11 | `docs/cl-reviewer.md` | `docs/wiki/cl-reviewer.md` |
  | 12 | `docs/cl-designer.md` | `docs/wiki/cl-designer.md` |
  | 13 | `docs/pipeline-concepts.md` | `docs/wiki/pipeline-concepts.md` |

- **Why it matters**: Merge mode will fail to locate all 8 targets if applied against current paths. The System Context table also references the old paths.
- **Fix**: Update the 8 Change Manifest entries and the System Context table with `docs/wiki/` prefixes. One-line change per entry.

### 2. Change 18 — incorrect step reference for spec-mode.md dispatch point

- **Dimension**: Ground Truth (Doc-to-File)
- **Where**: Change Manifest item 18, description field
- **Issue**: The proposal says "Step 2 system doc reads" but the actual dispatch instruction in spec-mode.md is at **Step 8** (line 135: "Dispatch subagents in parallel, one per system doc"). Step 2 in spec-mode.md is the PROPOSAL_TRACKER check — a completely different operation.
- **Why it matters**: Merge mode targeting "Step 2" would apply the change to the wrong step, potentially overwriting the waterfall gate logic.
- **Fix**: Change "Step 2 system doc reads" to "Step 8 system doc reads" in Change 18.

---

## Non-Blocking Suggestions

### 1. cl-dimension-analyzer-agent.md RESULT line leaves metrics unspecified

The `cl-dimension-analyzer-agent` report format has `...metrics...` as a placeholder:
```
RESULT: {CLEAN|FINDINGS} | Type: {consistency|verification|digest} | ...metrics...
```
The other four agent definitions fully specify their metrics (e.g., doc-reader has `Sections: {N} | Entities: {N} | Cross-refs: {N}`). The dimension analyzer spans three result types and the metrics differ by type, so `...metrics...` is genuinely variable — but it should still enumerate them:
- `consistency` type: `Findings: {N} | Critical: {N} | Major: {N} | Minor: {N}`
- `verification` type: `Coverage: {pct} | Confirmed: {N} | Failed: {N}`
- `digest` type: `Sections: {N} | Entities: {N}`

This won't block merge but orchestrators constructing result-parsing logic will have to guess.

### 2. New agent files land in a protected path — worth noting in the proposal

`.claude/` is in the repo's `protectedPaths` (set in `.clarity-loop.json`). Creating the 5 agent definition files during merge therefore requires the `.pipeline-authorized` marker, just like skill file changes. This is correct behavior and merge mode handles it automatically — but the proposal's Dependency section doesn't mention it. Worth a note so the person executing the merge isn't surprised when all 5 file creates require the authorization window.

### 3. R-004 dependency is met — can be marked resolved

The proposal says "depends on R-004 being merged" and offers an inline fallback. Per RESEARCH_LEDGER.md, R-004 is in Completed status and `agent-result-protocol.md` is present in `skills/cl-reviewer/references/`. The agent definitions can reference the protocol by name without inlining it. The inline fallback option can be removed from the Dependency section to reduce ambiguity.

---

## Merge Advisory

**Recommend exhaustive pre-apply validation: Yes.**

Rationale: 21 changes across 11 existing files + 5 new files. The blocking path issue means pre-apply validation will flag 8 stale targets immediately — fixing the proposal paths before proceeding is essential. After the fix, 13 of the 21 changes are MODIFY type on reference files, which benefits from exhaustive validation to confirm insertion point surroundings haven't shifted since the proposal was written.

---

## Spec-Readiness Notes

The 5 agent definitions are themselves structured specs — variable tables, workflow steps, and RESULT line formats are concrete. The orchestration pattern (Discover/Spawn/Collect/Aggregate with exact Task call syntax) is specific enough to generate implementation specs. After the dimension-analyzer RESULT line metrics are filled in, this content will be fully spec-ready.

---

## Consistency Map

| Doc | Status | Notes |
|-----|--------|-------|
| docs/wiki/SYSTEM_DESIGN.md | Consistent (after path fix) | S1 insertion point confirmed (after "Structured Agent Result Protocol" subsection, line 128). S10 Field Reference table confirmed (line 931). |
| docs/wiki/pipeline-concepts.md | Consistent (after path fix) | "Subagent Communication" section exists at line 416 — correct insertion anchor. |
| docs/wiki/cl-reviewer.md | Consistent (after path fix) | Change is description-level update to mode summaries. |
| docs/wiki/cl-implementer.md | Consistent (after path fix) | Same. |
| docs/wiki/cl-designer.md | Consistent (after path fix) | Same. |
| skills/cl-reviewer/references/audit-mode.md | Consistent | Prose dispatch instruction confirmed at lines 60-73. Insertion point clear. |
| skills/cl-implementer/references/spec-mode.md | Consistent (after step fix) | Dispatch instruction confirmed at Step 8. |
| skills/cl-implementer/references/run-mode.md | Consistent | "Fork subagents for each independent group" at line 195. |
| skills/cl-implementer/references/autopilot-mode.md | Consistent | Parallel group dispatch at line 341. |
| .clarity-loop.json | Consistent | `orchestration` block doesn't conflict with existing `protectedPaths`, `docsRoot`, or `version` fields. |

---

## Strengths

- **Dual-path design** is the right call. Fan-out as default with `orchestration.fanOut: "disabled"` as explicit opt-out means users get parallelism without any configuration, and the sequential path is preserved exactly rather than deprecated.
- **Context injection rule** (orchestrator passes context via Task prompt, agents don't read shared files) elegantly solves the concurrency problem. Agents never write to PARKING.md or DECISIONS.md — the orchestrator does after collection. Clean responsibility boundary.
- **Staged rollout** (foundation → analysis → implementation) is independently valuable at each stage. Stage 1 alone ships meaningful improvement to 3 modes.
- **Mixed model assignment** (sonnet for read/analysis/design, opus for implementation) is a sensible cost/quality tradeoff with clear justification.
- **R-006 cross-reference note** proactively flags the overlap rather than letting it become a silent conflict later.
- **Research lineage table** is exactly right — shows which specific findings from which docs drove which decisions. Highly executable.

---

## Risk Assessment

The largest unresolved risk is OQ2: no documented Claude Code ceiling on concurrent agents. `maxAgents: 10` is a reasonable default but empirical validation after Stage 1 is genuinely needed — the 30-agent audit worst case could hit a ceiling. The proposal acknowledges this explicitly, which is appropriate.

The PARKING.md concurrent-write risk is low because the "agents never write" rule is enforced by instruction rather than a technical lock. If a future agent definition violates the rule, the enforcement mechanism won't catch it. Worth a post-implementation audit check.
