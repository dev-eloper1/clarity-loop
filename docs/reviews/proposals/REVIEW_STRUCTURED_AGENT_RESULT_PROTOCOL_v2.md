# Re-Review: Structured Agent Result Protocol (v2)

**Reviewed**: 2026-02-18
**Proposal**: docs/proposals/STRUCTURED_AGENT_RESULT_PROTOCOL.md
**Previous reviews**: docs/reviews/proposals/REVIEW_STRUCTURED_AGENT_RESULT_PROTOCOL_v1.md
**System docs referenced**: SYSTEM_DESIGN.md (S1, S17), pipeline-concepts.md
**Review cycle**: 2 (this is re-review #1)

## Summary

All 5 issues from the v1 review (2 blocking, 3 non-blocking) have been addressed cleanly.
The prompt templates are now complete and well-formed. Changes 2-3 (S12/S14) are dropped
with clear rationale. Category counts corrected, result type for Change 11 changed to
digest, protocol versioning resolved. Two minor issues introduced by the fixes: the file
count in the total line is off by one, and the new prompt templates don't mention the
`Protocol: v1` field that was simultaneously added to the metadata block. Both are trivial
to fix.

## Verdict: APPROVE WITH CHANGES

## Issue Resolution

### From v1 Review:

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| B1 | Phase 6 prompt templates are placeholders | Fixed | 5 complete templates written (digest, consistency, verification, implementation, design-plan). Each is 6-7 lines with RESULT line format, metadata instruction, detail section description, and status guidance. |
| B2 | S12/S14 don't mention subagent dispatch | Fixed | Changes 2-3 dropped. Manifest rows struck through with rationale. New "Changes 2-3: Dropped" section explains why. Protocol covered by S1 + dispatch sites. |
| NB1 | "What Exists Today" category counts wrong | Fixed | Updated to 4/3/2/3, matching result type groupings. |
| NB2 | Change 11 result type debatable | Fixed | Changed from `verification` to `digest`. Detailed Design updated with rationale: subagents extract content, orchestrator builds the ledger. |
| NB3 | Protocol versioning can be resolved now | Fixed | `Protocol: v1` added to metadata block (Phase 3). S1 proposed content updated. Open Items 1 and 2 marked as resolved. |

## New Issues Found

### 1. Prompt Templates Don't Mention Protocol: v1 Field

- **Dimension**: Internal Coherence
- **Where**: Change 6, Phase 6 (all 5 templates) vs Phase 3 (metadata block)
- **Issue**: The metadata block spec in Phase 3 now includes `**Protocol**: v1` as the
  first field. But the prompt templates in Phase 6 say "Then a metadata block: Agent,
  Assigned, Scope, Coverage, Confidence" — omitting Protocol. A subagent following the
  template would produce a metadata block without the version field.
- **Likely cause**: Templates were written before the Protocol: v1 field was added to Phase 3
  in the same fix cycle.
- **Suggestion**: Add "Protocol (v1)" to the metadata field list in each template, e.g.:
  "Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage, Confidence."

### 2. File Count in Total Line Is Off By One

- **Dimension**: Internal Coherence
- **Where**: Change Manifest, total line (line 110)
- **Issue**: Says "16 changes across 10 files + 1 new file." Actual unique existing files
  being modified: SYSTEM_DESIGN.md, pipeline-concepts.md, spec-mode.md, run-mode.md,
  autopilot-mode.md, review-mode.md, re-review-mode.md, verify-mode.md, audit-mode.md,
  mockups-mode.md, tokens-mode.md = 11 files + 1 new.
- **Likely cause**: When dropping Changes 2-3 (both targeting SYSTEM_DESIGN.md), the count
  subtracted 2 from 12, but SYSTEM_DESIGN.md is still modified by Changes 1 and 4.
- **Suggestion**: Change to "16 changes across 11 existing files + 1 new file".

## Regressions

No regressions detected.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| SYSTEM_DESIGN.md S1 | Consistent | Cross-cutting subsection fits naturally after Reference File Convention |
| SYSTEM_DESIGN.md S12 | N/A | No longer targeted (Changes 2-3 dropped) |
| SYSTEM_DESIGN.md S14 | N/A | No longer targeted (Changes 2-3 dropped) |
| SYSTEM_DESIGN.md S17 | Consistent | Inventory update is mechanical (9->10, 35->36) |
| pipeline-concepts.md | Consistent | New Subagent Communication section fits after Reference File Structure |

## Review Cycle Health

The proposal is converging cleanly. All v1 issues were addressed directly without
over-correction or scope creep. The two new issues are trivial artifacts of simultaneous
edits (templates written before versioning was added, file count arithmetic). One more
small fix round should produce an APPROVE.
