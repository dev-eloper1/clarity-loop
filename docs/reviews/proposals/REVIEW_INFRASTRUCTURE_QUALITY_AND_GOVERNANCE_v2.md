# Re-Review: Infrastructure, Quality Conventions, and Long-Term Governance (v2)

**Reviewed**: 2026-02-12
**Proposal**: docs/proposals/INFRASTRUCTURE_QUALITY_AND_GOVERNANCE.md
**Previous reviews**: REVIEW_INFRASTRUCTURE_QUALITY_AND_GOVERNANCE_v1.md
**Skill files referenced**: cross-cutting-specs.md, verify-mode.md, run-mode.md, autopilot-mode.md, start-mode.md, cl-implementer SKILL.md, cl-reviewer SKILL.md, audit-mode.md, bootstrap-guide.md
**Public docs referenced**: cl-implementer.md, cl-researcher.md, pipeline-concepts.md
**Review cycle**: 2 (this is re-review #1)

## Summary

All three fixes from v1 landed cleanly. The blocking issue (Gap 25 change reference mismatch) was resolved by removing the incorrect run-mode bullet — the simpler option (a) as recommended. The two non-blocking suggestions (Sync Mode insertion point precision and autopilot L1 inheritance) were both addressed. The token density suggestion was intentionally deferred per user direction. One minor residual inconsistency was found in the Cross-Proposal Conflicts table, which still references the removed Step 3.5 enhancement. The proposal is converging cleanly and ready for merge.

## Verdict: APPROVE

## Issue Resolution

### From v1 Review:

| # | Issue | Type | Status | Notes |
|---|-------|------|--------|-------|
| 1 | Gap 25 Change Reference Mismatch | Blocking | Fixed | Run-mode bullet removed from Gap 25 "Where Each Gap Lands" (lines 129-131). Only spec generation (Change 2) and verify mode (Change 8) remain. Option (a) applied as recommended. |
| 2 | Sync Mode Insertion Point Precision | Non-blocking | Fixed | Change 11 insertion point (line 1052) updated to "After the full Sync Mode section (after the 'Usage:' line at the end of the section) and before the '---' separator leading to Design Review Mode." |
| 3 | Operational-specs.md Token Density | Non-blocking | Deferred | Intentionally deferred per user direction — will be addressed in a future research round. |
| 4 | Autopilot L1 Tracking Inheritance | Non-blocking | Fixed | Note added in Change 9 content (lines 995-997): "Autopilot also inherits run mode's Step 3f (L1 assumption tracking) at the same `l1ScanFrequency` interval." |

## New Issues Found

### 1. Cross-Proposal Conflicts Table Residual Reference

- **Dimension**: Internal Coherence
- **Where**: Cross-Proposal Conflicts table, P3 row, Resolution column (line 173)
- **Issue**: The P3 resolution still says "P4 enhances Step 3.5 with `dependency-compat` classification" — but the Gap 25 fix removed this claim from the "Where Each Gap Lands" section. The Cross-Proposal Conflicts table wasn't updated to match.
- **Likely cause**: The Gap 25 fix correctly updated the authoritative section but missed this secondary reference.
- **Why non-blocking**: The Cross-Proposal Conflicts table is informational context for reviewers, not the merge contract. The Change Manifest (which drives the actual merge) is correct and consistent. No implementer will look at the conflicts table to decide what to merge.
- **Suggestion**: Remove "P4 enhances Step 3.5 with `dependency-compat` classification." from the P3 Resolution cell. Replace with "P4 adds Dimension 7 after P3's Dimension 6." (already present, so just delete the Step 3.5 sentence).

## Regressions

No regressions detected.

## Consistency Map

| Skill/Doc File | Status | Notes |
|---|---|---|
| `cross-cutting-specs.md` | Consistent | Step 4e unchanged from v1. |
| `verify-mode.md` | Consistent | Dimension 7 unchanged. "Seven" heading correct. |
| `run-mode.md` | Consistent | Step 3f unchanged. No spurious Step 3.5 enhancement. |
| `autopilot-mode.md` | Consistent | Step 3d-ops now includes L1 inheritance note. Strengthened. |
| `start-mode.md` | Consistent | Rules 12-13 unchanged. |
| `bootstrap-guide.md` | Consistent | Pointer unchanged. |
| `cl-reviewer SKILL.md` | Consistent | Sync Mode insertion point now matches actual file structure. |
| `audit-mode.md` | Consistent | L1 trend analysis and structural drift unchanged. |
| `cl-implementer SKILL.md` | Consistent | Spec, Verify, Guidelines sections unchanged. |
| `docs/cl-implementer.md` | Consistent | Public-facing updates unchanged. |
| `docs/cl-researcher.md` | Consistent | Bootstrap updates unchanged. |
| `docs/pipeline-concepts.md` | Consistent | Directory structure, config, categories unchanged. |

## Review Cycle Health

The proposal is converging cleanly. All three fixes were applied correctly with no regressions and only one minor residual inconsistency in an informational table. The Change Manifest (the actual merge contract) is internally consistent and matches the "Where Each Gap Lands" section. Ready for merge.
