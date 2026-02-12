# Review: Infrastructure, Quality Conventions, and Long-Term Governance (P4)

**Reviewed**: 2026-02-12
**Proposal**: docs/proposals/INFRASTRUCTURE_QUALITY_AND_GOVERNANCE.md
**Skill files referenced**: cross-cutting-specs.md, verify-mode.md, run-mode.md, autopilot-mode.md, start-mode.md, cl-implementer SKILL.md, cl-reviewer SKILL.md, audit-mode.md, bootstrap-guide.md
**Public docs referenced**: cl-implementer.md, cl-researcher.md, pipeline-concepts.md
**Research doc**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F23-F25, F28-F32, F35-F37)

## Summary

This proposal closes out the remaining 11 gaps from the PIPELINE_GAP_ANALYSIS research by adding operational readiness (config specs, migration, observability, integration contracts), code quality conventions (dependency compatibility, code organization, performance budgets), and long-term governance (L1 assumption tracking, backend policies, data modeling, specification drift detection). The proposal follows the established pattern of thin pointers in existing files + new reference files for substantial content. The architecture is sound — Dimension 7 as a composite of 10 advisory sub-checks with "Skip If" conditions is well-designed, and the L1 assumption tracking in run mode fills a genuine governance gap. One internal coherence issue in the gap-to-change mapping needs correction before merge.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Gap 25 Change Reference Mismatch

- **Dimension**: Internal Coherence
- **Where**: "Where Each Gap Lands" section, Gap 25 (Dependency compatibility — F29), run mode bullet (proposal line ~131)
- **Issue**: The gap mapping says "Enhanced Step 3.5 (P3) — when a dependency issue involves two libraries conflicting, classify as `dependency-compat` alongside existing types (Change 6, via governance-checks.md guidance)". But Change 6 in the Change Manifest is "Add L1 assumption tracking to run mode post-task flow" (Research: F32). These are completely different concerns. No change in the manifest actually enhances Step 3.5 with a `dependency-compat` classification.
- **Why it matters**: The Change Manifest is the merge contract. If the "Where Each Gap Lands" section claims coverage that isn't backed by a Change entry, the merge will either miss the enhancement or the validator will find a discrepancy. This is an internal consistency gap that could cause confusion during implementation.
- **Suggestion**: Either:
  (a) **Remove the claim**: Delete the run-mode bullet from Gap 25's "Where it Lands". Dependency compatibility is already covered by spec generation (Change 2 waterfall gate) and verify mode (Change 8 sub-check 7c). The run-mode enhancement is not essential.
  (b) **Add Change 19**: Add a small change to run-mode.md Step 4 (Fix Tasks) that adds `dependency-compat` as a fix task classification type alongside `supply-chain`, `context-gap`, `design-gap`. Update the Change Manifest accordingly.
  Option (a) is simpler and recommended — the gap is well-covered without it.

## Non-Blocking Suggestions

### 1. Sync Mode Insertion Point Precision

Change 11 says the insertion point is "After the current Sync Mode description ending with 'Output: `{docsRoot}/reviews/audit/SYNC_[YYYY-MM-DD].md` -- alongside audit reports.'" But the actual Sync Mode section continues with a "Usage:" line after the Output line (cl-reviewer SKILL.md line 346). The DECISIONS.md reconciliation subsection should be inserted after the full Sync Mode section (after the "Usage:" line), not mid-section after the Output line. Otherwise the reconciliation content would split the Output and Usage lines.

### 2. Operational-specs.md Token Density

The new `operational-specs.md` file packs 9 spec categories into ~195 lines. Several categories (Integration Contracts, Backend Policies, Data Modeling) include detailed table templates with multi-column examples. During merge, verify the actual token count stays within the ~3000 token soft limit for reference files. If it exceeds, consider splitting Integration Contracts into its own reference file — it's the most self-contained section.

### 3. Autopilot L1 Tracking Inheritance

Run mode gains Step 3f (L1 assumption tracking) with `l1ScanFrequency` configuration. Autopilot mode inherits run mode's mechanisms, but the proposal doesn't explicitly state whether autopilot inherits Step 3f. Since autopilot's "Relationship to Run Mode" section says it IS run mode with additions, the inheritance should be implicit. Consider adding a one-line note to Change 9's content or the autopilot SKILL.md summary confirming L1 tracking runs in autopilot mode at the same frequency.

## Consistency Map

| Skill/Doc File | Status | Notes |
|---|---|---|
| `cross-cutting-specs.md` | ✅ Consistent | Step 4e follows 4d cleanly. Pointer pattern matches P3's approach. |
| `verify-mode.md` | ✅ Consistent | Dimension 7 after Dimension 6. Heading update "Six" → "Seven" is correct. Output section example matches format of Dimensions 1-6. |
| `run-mode.md` | ✅ Consistent | Step 3f after Step 3e. Configurable frequency mirrors configurable spot-check in Step 3e. |
| `autopilot-mode.md` | ✅ Consistent | Step 3d-ops after 3d-int. Tier 3 (auto-proceed) is appropriate for lightweight operational checks. |
| `start-mode.md` | ✅ Consistent | Rules 12-13 follow rule 11. Infrastructure tasks as no-dependency parallels match test infrastructure pattern. |
| `bootstrap-guide.md` | ✅ Consistent | Pointer after security section follows the P1/P3 pattern. New reference file keeps bootstrap-guide.md from growing further beyond ~718 lines. |
| `cl-reviewer SKILL.md` | ✅ Consistent | Sync Mode addition and audit mode sub-dimensions integrate without changing existing functionality. |
| `audit-mode.md` | ✅ Consistent | L1 trend analysis fits naturally in Dimension 4 (Goal Alignment & Drift). Structural drift is a logical extension. Completeness additions for Dimension 5 fill genuine gaps. |
| `cl-implementer SKILL.md` | ✅ Consistent | Spec Mode summary gains two bullet points. Verify Mode summary updates to "seven dimensions". Guidelines follow existing pattern (imperative statements with rationale). |
| `docs/cl-implementer.md` | ✅ Consistent | Public-facing updates mirror internal skill changes. |
| `docs/cl-researcher.md` | ✅ Consistent | Bootstrap description gains operational concerns alongside existing security/testing mentions. |
| `docs/pipeline-concepts.md` | ✅ Consistent | Directory structure, config key, and category tags are additive. 7 new categories bring total to 22 — manageable. |

## Strengths

1. **Pointer-and-reference pattern is well-executed.** Three new reference files (operational-specs, operational-bootstrap, governance-checks) keep existing files from bloating. The thin pointer pattern established in P1-P3 is consistently applied here. bootstrap-guide.md was already at 718 lines — adding the operational bootstrap questions inline would have pushed it past reasonable limits.

2. **"Where Each Gap Lands" section is excellent.** Mapping each of the 11 gaps to their specific pipeline stage, change number, and brief description makes it trivially easy to verify completeness. Every gap has at least two pipeline touchpoints (typically bootstrap + spec + verify or run + verify).

3. **Skip-if-not-applicable design for Dimension 7.** The 10 sub-checks each have a "Skip If" column with the prerequisite spec. This prevents Dimension 7 from being overbearing for small projects — a prototype skips 8 of 10 sub-checks, a full-stack app runs most. The advisory (not blocking) default is the right call for governance checks.

4. **L1 assumption tracking is the highest-value addition.** The periodic scan with configurable frequency, batch promotion to DECISIONS.md, and the option to trigger research cycles — this is a clean governance mechanism that catches invisible drift without slowing down implementation. The 5-task/5-assumption thresholds are sensible defaults.

5. **Sensible defaults in operational-bootstrap.md.** Every question section has a "sensible defaults" block. For users who don't have strong opinions, the defaults provide immediate value without requiring decisions. The `[auto-default]` source tag preserves auditability.

6. **27-item validation checklist.** Comprehensive and mechanically checkable. Items 24-27 (negative assertions — what was NOT modified) are a good practice for ensuring scope boundaries are respected during merge.

## Risk Assessment

**Low risk overall.** The main risk is scope creep in Dimension 7 — 10 sub-checks could encourage exhaustive verification that bogs down the pipeline. The advisory (non-blocking) default mitigates this well. The only scenario where Dimension 7 blocks is hardcoded secrets or critical architectural drift, which are genuinely critical.

**CONFIG_SPEC.md generation for non-service projects**: The operational-specs.md starts with "If the system has deployment targets, external service integrations, data persistence, or backend API endpoints" — this is a good gate that prevents unnecessary spec generation for libraries and scripts. The operational-bootstrap.md reinforces this with a "What to Skip" section. No additional risk.
