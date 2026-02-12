# Re-Review: Testing Pipeline (P2)

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/TESTING_PIPELINE.md
**Previous review**: docs/reviews/proposals/REVIEW_TESTING_PIPELINE_v1.md
**Review round**: v2 (re-review after v1 fixes)

## Cumulative Issue Ledger

| # | Issue (from v1) | Status | Notes |
|---|----------------|--------|-------|
| B1 | Verify Mode Dimension 5 Numbering Collision with P3 -- Cross-Proposal Conflicts table did not identify the verify-mode.md collision; both P2 and P3 claimed Dimension 5; SKILL.md and cl-implementer.md dimension count references were uncoordinated. | RESOLVED | Three fixes applied: (1) Cross-Proposal Conflicts table P3 row now explicitly identifies the verify-mode.md dimension numbering overlap and states "P2 claims Dimension 5, P3 should use Dimension 6. After both merge, verify mode will have six dimensions total. SKILL.md and docs/cl-implementer.md dimension count references must reflect the total after both merge (six dimensions, not five)." (2) Change Manifest row 7 now includes a coordination note about P3 using Dimension 6 and the six-dimension total. (3) Migration section now explicitly states that dimension counts should reflect six after both proposals merge. Additionally, P3 itself has been updated -- its Change Manifest row 9 now reads "Add Dimension **6**: Dependency Audit" with target section "(new section after Dimension 5)", confirming bilateral coordination. |
| B2 | Missing P1 Bootstrap Overlap in Cross-Proposal Conflicts -- P1 also modifies bootstrap-guide.md Step 2 (Discovery Conversation) with behavioral probing questions, but P2's conflicts table only listed P1 for autopilot Step 3e. | RESOLVED | Cross-Proposal Conflicts table P1 row now includes "bootstrap-guide.md Step 2 (Discovery Conversation)" in the Overlapping Sections column and adds a full paragraph: "Bootstrap-guide.md overlap: Both P1 and P2 add discovery questions to bootstrap-guide.md Step 2. P1 adds behavioral, accessibility, resilience, and content probing questions. P2 adds testing strategy probes. Both additions are complementary -- P1's behavioral questions and P2's testing questions target different subsections. Merge both in either order; the reviewer should ensure questions from both proposals appear without duplication." This is exactly what the v1 review requested. |

## New Issues Found

No new issues introduced.

The fixes are clean additions to the Cross-Proposal Conflicts table, Change Manifest annotations, and Migration section. They do not contradict or modify any existing proposal content. Specifically:

- The Cross-Proposal Conflicts table additions (lines 114-115) are purely additive -- they extend existing rows with additional overlapping sections and resolutions without altering the existing conflict descriptions.
- The Change Manifest row 7 annotation (line 94) adds coordination metadata without changing the actual change description or target.
- The Migration section addition (line 1055) extends the existing Verify Dimension 5 bullet point with cross-proposal coordination notes.

No content elsewhere in the proposal was modified, so no regression pathways exist.

## Verdict: APPROVE

Both blocking issues are fully resolved. The dimension numbering coordination is bilateral (both P2 and P3 have been updated to agree on P2=Dimension 5, P3=Dimension 6). The P1 bootstrap overlap is now documented in the conflicts table with clear merge guidance. No regressions were introduced by the fixes. The proposal is ready for merge.

## Non-Blocking Suggestions

Carried forward from v1 (none were addressed in this round, which is acceptable -- they are non-blocking):

1. **TEST_SPEC.md size concern for large projects** (v1 S1): Consider adding a note about splitting TEST_SPEC.md for projects where it exceeds ~3000 tokens. The single-file default is fine for most projects.

2. **Run mode Step 3c item 5 scope clarification** (v1 S2): Adding a concrete example of "checking against expectations" vs. "writing tests" would reduce ambiguity for an LLM executing the skill.

3. **Integration gate fix task convention** (v1 S3): Note that the F-NNN format with Seam/Discovered metadata is an extension of the existing `integration-failure` fix task type in run-mode.md Step 4.

4. **Config key defaults for absent `testing` section** (v1 S4): Add a note about fallback behavior when the `testing` key is absent entirely (default to `true` for both gates) and when a `testing.*` key has an unrecognized value (fall back to `true`, same pattern as `ux.*` fallback behavior).

5. **Open Item 2 resolution** (v1 S5): Consider resolving "test task ordering within the dependency graph" to a definitive "no -- tests verify, they don't gate downstream" rather than leaving it as a potentially-configurable open item. This affects TASKS.md dependency graph generation during spec implementation.

New suggestion from this review round:

6. **SKILL.md and cl-implementer.md verify section dimension count at merge time**: The proposal correctly documents that dimension counts should reflect "six dimensions" after both P2 and P3 merge (in the Cross-Proposal Conflicts table and Migration section). However, there is no Change Manifest row for updating the SKILL.md verify mode description or the `docs/cl-implementer.md` verify section. The current Change Manifest row 14 for cl-implementer.md only targets "Spec, Start, Autopilot sections" -- not the Verify section. The merger should add the verify section dimension count update to their merge checklist, or a follow-up Change Manifest row could be added. This is not blocking because the coordination is clearly documented and the merger has sufficient guidance.

## Regression Check

Confirmed: no regressions were introduced by the fixes.

**Internal coherence**: The new Cross-Proposal Conflicts table content is consistent with the Change Manifest, Detailed Design (Change Area 5), and Migration section. All references to Dimension 5 and Dimension 6 are internally consistent -- P2 claims Dimension 5 in every location, and P3 is referenced as Dimension 6 in every location.

**Change Manifest accuracy**: All 16 Change Manifest rows still accurately describe the changes in the Detailed Design sections. The row 7 annotation is metadata-only and does not alter the change specification.

**Cross-proposal conflict table completeness**: Both P1 and P3 conflicts are now fully documented, including all overlapping files and sections. The three-proposal bootstrap convergence (P1 + P2 + P3 all adding to bootstrap-guide.md Step 2) is implicitly documented through the P1 and P3 conflict rows. The v1 Risk Assessment item 2 (three-proposal bootstrap convergence) remains a valid concern for the merger to consider.

**Dimension numbering consistency**: P2=Dim5, P3=Dim6 is stated consistently in: Change Manifest row 7, Cross-Proposal Conflicts table P3 row, Migration section Verify Dimension 5 bullet, and confirmed by P3's own Change Manifest row 9 ("Dimension 6").

**No orphaned references**: All cross-references (to P1, P3, research findings F14-F20, P0.5 infrastructure) remain valid and reachable.
