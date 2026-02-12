# Re-Review: Pipeline UX Optimization (P0.5)

**Reviewed**: 2026-02-12
**Proposal**: docs/proposals/PIPELINE_UX_OPTIMIZATION.md
**Previous review**: docs/reviews/proposals/REVIEW_PIPELINE_UX_OPTIMIZATION_v1.md
**Research doc**: docs/research/INTERACTION_AUDIT.md

## Summary

Re-review of P0.5 after fixes for 4 blocking issues from v1. All blocking issues are now fully resolved. The "Level" vs "Tier" terminology is clean throughout, counts are consistent across all tables, and the decision flow protocol now handles multi-category tags, precedence rules, and conflict resolution. No regressions detected.

## Verdict: APPROVE

## Cumulative Issue Ledger

### Blocking Issue 1: Tier 1 Count Discrepancy and "Tier" Terminology Conflation
- **v1 status**: BLOCKING
- **v2 status**: RESOLVED
- **What was done**:
  - Profile system renamed from "Tiers" to "Levels" throughout (Level 1: Auto-Detect, Level 2: Quick Research, Level 3: Presets)
  - R9, R15, D4 reclassified from Tier 1 to "-- (Warmth-governed)" with new row in checkpoint tiering table
  - Summary updated to 24 Tier 1 + 3 warmth-governed + 51 optimizable
  - Proposed State item 14 updated with correct count
  - Audit Summary strategy table updated from 19 to 24 with warmth-governed row added
  - Per-skill breakdown table updated with Warmth-governed column and corrected counts (6+7+7+4=24)
  - Research Lineage annotated to clarify the audit's original 19 was refined to 24 during proposal analysis
  - Change 2 replacement text (bootstrap-guide.md content) uses "levels" not "tiers"
  - Terminology table and Design Decisions table use "Levels" with disambiguation note
  - All 5 remaining "three-tier" → "three-level" renames completed (lines 157, 219, 286, 460, 639, 1533, 1688)

### Blocking Issue 2: Category Tags Don't Support Multi-Category Decisions
- **v1 status**: BLOCKING
- **v2 status**: RESOLVED
- **What was done**: Category field supports comma-separated values. Format example updated to `[category tag, category tag, ...]`. Cross-skill lookup matches on ANY category in the list. Concrete example provided (JWT auth = `auth, api-style`).

### Blocking Issue 3: No Precedence Rule for Auto-Detect vs. Existing DECISIONS.md
- **v1 status**: BLOCKING
- **v2 status**: RESOLVED
- **What was done**: Four-level precedence chain specified: (1) DECISIONS.md entries, (2) auto-detect, (3) research, (4) presets. Conflict display format added for defaults sheet showing `[CONFLICT -- resolve?]`. Cold start behavior specified (empty lookups for new projects, defaults sheet becomes first bulk write).

### Blocking Issue 4: Decision Conflict Resolution Must Be Specified
- **v1 status**: BLOCKING
- **v2 status**: RESOLVED
- **What was done**: Supersession protocol added: new entry includes `Supersedes: D-NNN`, original marked `Status: Superseded by D-MMM`, user notified at point of override with reason. Original rationale preserved. Open Item 3 marked as resolved.

## Regression Scan

No regressions detected. The fixes are additive and don't conflict with any existing proposal content. The decision flow additions (precedence, supersession, cold start, multi-category) integrate cleanly into Change 29.

## Non-Blocking Suggestions (from v1, carried forward)

All 9 non-blocking suggestions from v1 remain applicable and were not affected by the blocking issue fixes. These are advisory improvements, not merge blockers:

| # | Suggestion | Status |
|---|-----------|--------|
| 5 | Monorepo auto-detect ambiguity | Unchanged -- still applicable |
| 6 | `[auto-default]` may bloat DECISIONS.md | Unchanged -- still applicable |
| 7 | `autoDefaults` vs `reviewStyle` precedence | Unchanged -- still applicable |
| 8 | Change 11 under-specified | Unchanged -- still applicable |
| 9 | tokens-mode.md step numbering | Unchanged -- still applicable |
| 10 | Mid-pipeline migration not addressed | Unchanged -- still applicable |
| 11 | Strategy 1 over-specified for AI instructions | Unchanged -- still applicable |
| 12 | Auto-detect depth: open item vs stated decision | Unchanged -- still applicable |
| 13 | Dropped bootstrap question not noted | Unchanged -- still applicable |

## Strengths (carried forward from v1)

1. Thorough interaction audit grounding (78 points traced to specific files)
2. Six complementary strategies with no conflicts
3. External consistency verified against all actual files
4. Preserves user control with escape hatches at every level
5. Sound merge ordering (P0.5 before P1-P3)
6. **New**: The decision flow protocol is now significantly more robust with precedence, supersession, and multi-category support
7. **New**: The warmth-governed category is a clean solution for "conversational items that aren't checkpoints"
