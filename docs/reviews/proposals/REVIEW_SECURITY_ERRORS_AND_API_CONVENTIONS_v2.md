# Re-Review: Security, Errors, and API Conventions

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/SECURITY_ERRORS_AND_API_CONVENTIONS.md
**Previous review**: docs/reviews/proposals/REVIEW_SECURITY_ERRORS_AND_API_CONVENTIONS_v1.md
**Review round**: v2 (re-review after v1 fixes)

## Cumulative Issue Ledger

| # | Issue (from v1) | Status | Notes |
|---|----------------|--------|-------|
| B1 | Context Budget Violation Risk for spec-mode.md -- Steps 4a-4d would add ~250+ lines to spec-mode.md, pushing it far beyond the ~3000-token budget. The proposal's own Rule 3 requires large tables go in separate files. | RESOLVED | The proposal now extracts all cross-cutting spec templates into a new file `skills/cl-implementer/references/cross-cutting-specs.md` (Change 1b, Add Doc). Spec-mode.md Step 4 now only receives a brief pointer ("Step 4+: Generate Cross-Cutting Specs") with a 10-line summary listing the artifacts and a reference to the new file. The full templates (Steps 4a-4d with all tables) live in cross-cutting-specs.md. This follows the proposal's own Rule 3 and Rule 5. The Change Manifest was updated: Change 1 is now "Add cross-cutting spec generation pointer to spec mode" and Change 1b is "Create cross-cutting specs reference." |
| B2 | Bootstrap Change Conflicts with P1 Textually -- P3's Cross-Proposal Conflicts table omitted P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md). Both P1 and P3 modify bootstrap-guide.md Step 2 "Then dig deeper" section. If either merges first, the other's changes would be lost without explicit coordination. | RESOLVED | P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md) has been added to the Cross-Proposal Conflicts table with a detailed resolution strategy. The entry specifies that P3 provides the restructuring frame (splitting "Then dig deeper" into subsections), P1's behavioral questions are an additive category within that frame, and provides explicit merge-order guidance for both orderings: "If P1 merges first, P3's replacement text must incorporate P1's behavioral questions into the restructured subsections. If P3 merges first, P1's additions should target the new 'dig deeper -- functional' subsection or add a 'dig deeper -- behavioral' subsection." This is comprehensive and actionable. |

## New Issues Found

No new issues introduced by the fixes. Specifically verified:

1. **Change Manifest accuracy after extraction**: The Change Manifest was correctly updated. Old Changes 2-5 (which corresponded to the inline Steps 4a-4d in spec-mode.md) were consolidated into Change 1b (the new cross-cutting-specs.md file). The remaining changes (6-19) retain their original numbering and descriptions. The manifest accurately reflects the new file structure -- Change 1 adds the pointer in spec-mode.md, Change 1b creates the new reference file, and Change 6 updates the spec manifest. There is no gap or duplication.

2. **Internal coherence of cross-cutting-specs.md extraction**: The detailed design for Change Area 1 now clearly describes two files: (a) spec-mode.md gets a brief pointer, and (b) cross-cutting-specs.md gets the full templates. The "Step 4+" naming in spec-mode.md avoids colliding with P2's Step 4a numbering -- P2 adds TEST_SPEC.md generation, and P3 now adds a single "Step 4+" that delegates to a reference file rather than claiming 4a-4d inline. This actually improves the P2/P3 merge story by reducing the surface area of conflict in spec-mode.md.

3. **P1 entry in Cross-Proposal Conflicts**: The entry is thorough and covers the merge mechanics for both orderings. It correctly identifies that SKILL.md and cl-implementer.md changes between P1 and P3 are to different sections and non-conflicting.

4. **No orphaned references**: The proposal's Terminology table, Integration Points, and Proposed State sections all correctly reference cross-cutting-specs.md where appropriate. The Context Budget section's merge validation criteria ("No reference file exceeds ~3000 tokens after changes") now applies to cross-cutting-specs.md as the budget-relevant file rather than spec-mode.md.

## Verdict: APPROVE

Both blocking issues are fully resolved. The cross-cutting specs extraction is clean and actually improves the proposal by reducing merge conflicts with P2 in spec-mode.md. The P1 conflict documentation is comprehensive with actionable merge-order guidance. No regressions detected.

## Non-Blocking Suggestions

Carrying forward unaddressed v1 suggestions with updated status, plus noting any that were addressed:

### From v1 (unaddressed -- not required)

**1. Forward-Reference Acknowledgment in Decision Flow Guideline (v1 NB-1)**
- **Status**: Not addressed.
- The P0.5 decision flow guideline (SKILL.md lines 292-297) still references SECURITY_SPEC.md and API conventions -- artifacts that don't exist until P3 is merged. Adding a brief note in Change 15's "Current" quote acknowledging this as intentional P0.5 forward-referencing would make the coordination explicit. Low priority.

**2. Error Taxonomy Inline vs. Separate File Tension (v1 NB-2)**
- **Status**: Not addressed, but the extraction to cross-cutting-specs.md partially resolves the underlying concern.
- The error taxonomy is still defined as "inline in API specs" per the Design Decisions table, but the template now lives in cross-cutting-specs.md rather than being inlined in spec-mode.md. The consumption pattern question remains: SECURITY_SPEC.md gets its own file while the error taxonomy is distributed across API specs. The Design Decisions table could benefit from a sentence explaining why the error taxonomy's consumption pattern differs from SECURITY_SPEC.md's (every API spec needs the format visible vs. security spec is consulted as a whole). Low priority -- the current design is defensible.

**3. Spec Consistency Check Heading Count Update (v1 NB-3)**
- **Status**: Not addressed.
- spec-consistency-check.md heading still says "Five Consistency Dimensions" (confirmed: line 12). The proposal adds Dimension 6 (API Convention Adherence) but does not include an explicit change to update this heading to "Six Consistency Dimensions." Similarly, SKILL.md Spec Review Mode (line 156) says "Checks five dimensions" -- no change proposed. These are small but will create internal inconsistencies if missed during merge.
- **Recommendation**: The merge author should update: (a) spec-consistency-check.md heading from "Five" to "Six Consistency Dimensions," and (b) SKILL.md line 156 from "five dimensions" to "six dimensions."

**4. Verify Mode Heading Count Update (v1 NB-4)**
- **Status**: Not addressed.
- verify-mode.md heading still says "Four Verification Dimensions" (confirmed: line 15). The proposal adds Dimension 6 (after P2's Dimension 5) but does not include an explicit change to update this heading. P2 presumably updates it to "Five" -- P3 should update to "Six."
- **Recommendation**: The merge author should update the verify-mode.md heading from "Four" (or "Five" if P2 has already merged) to "Six Verification Dimensions."

**5. Open Item 2 -- Config Key (v1 NB-5)**
- **Status**: Partially addressed.
- The proposal now clarifies the config key follows the "P0.5 convention (flat namespace under functional area)" and distinguishes it from UX keys. It also notes this is independent of `ux.*` keys. However, it remains in the Open Items section rather than being promoted to a concrete design decision with a Change Manifest entry for pipeline-concepts.md Configuration. This is acceptable for now -- the config key can be added when it is implemented, and the Open Items section correctly flags it as an open question.

**6. Accessibility Section Scope Creep (v1 NB-6)**
- **Status**: Not addressed.
- The accessibility requirements section in the cross-cutting specs (from Step 4a) still overlaps with P1's design-phase accessibility. The boundary between P1's component-level ARIA/keyboard models during design and P3's per-spec accessibility requirements during spec generation remains implicit. This is a coordination concern, not a correctness issue -- both proposals can coexist as long as the merge author understands the boundary.

### New Suggestions

**7. cross-cutting-specs.md Token Budget Estimate**
- The proposal's Context Budget section requires "No reference file exceeds ~3000 tokens after changes" during merge validation, but the new cross-cutting-specs.md file -- which contains all of Steps 4a-4d with 6+ tables -- may itself approach or exceed that budget. The detailed design for Change Area 1 shows the file containing: Step 4a (~90 lines with security tables), Step 4b (~70 lines with error tables), Step 4c (~40 lines with API convention table), Step 4d (~50 lines with type tables). That is ~250 lines of template content. At typical markdown token density (~1.3 tokens/word, ~10 words/line), this is roughly 3,250 tokens -- near the boundary.
- **Recommendation**: During merge, measure the actual token count. If it exceeds 3,000, consider splitting cross-cutting-specs.md into two files (e.g., security-and-error-specs.md and api-and-type-specs.md) or increasing the budget ceiling with an explicit exception note. The file is already on-demand loaded only during spec mode, so the progressive disclosure model is preserved either way.

**8. "Step 4+" Naming Convention**
- The pointer in spec-mode.md uses "Step 4+" as the heading. While this avoids P2 step-numbering collisions, the "+" notation is unconventional and could confuse readers or parsers. Consider "Step 4.5" or "Step 4x" or simply "Cross-Cutting Spec Generation" as a heading that does not imply a position in the step sequence. Purely cosmetic.

## Regression Check

Verified the following areas for regressions introduced by the fixes:

1. **Internal coherence**: The proposal's Proposed State section (items 1-9) accurately reflects the updated design. Item 1 mentions SECURITY_SPEC.md generation, which now lives in cross-cutting-specs.md -- the text correctly says "spec generation produces" without specifying which file contains the template. No contradiction.

2. **Change Manifest accuracy**: All 19 changes (including the new 1b) map correctly to the detailed design sections. Change 1 targets spec-mode.md Step 4 (pointer), Change 1b targets a new file (full templates), Change 6 targets spec-mode.md Step 5 (manifest update). The remaining changes (7-19) are unchanged from v1 and still match their detailed designs.

3. **Cross-Proposal Conflict table completeness**: Now includes P0, P0.5, P1, IMPLEMENTER_SKILL.md, and CONTEXT_SYSTEM.md. P2 (TESTING_PIPELINE.md) is not explicitly listed, but the merge conflict with P2 is reduced by the extraction -- P3 now adds only a brief pointer to spec-mode.md rather than 4 full steps, making P2/P3 coexistence in spec-mode.md simpler. The P2 conflict is adequately covered by the spec-mode.md Change Area 1 description which mentions P2's Step 4a numbering. Acceptable.

4. **Dimension numbering**: Verify mode uses "Dimension 6" (after P2's Dimension 5) -- correct. Spec consistency check uses "Dimension 6" (which is the 6th dimension after existing 5) -- correct. The Terminology table entry for "Dependency audit" correctly says "sixth verification dimension (Dimension 6, after P2's Dimension 5: Test Coverage Against Test Spec)" -- consistent.

5. **Token budgets**: spec-mode.md receives only a ~10-line pointer. The file is currently 168 lines and the addition is minimal. Well within budget. cross-cutting-specs.md is a new file loaded on-demand -- budget concern noted in NB-7 above but not a regression.

6. **No orphaned references**: All references to cross-cutting-specs.md in the proposal are consistent. The Scope Boundary statement still correctly lists the modified files. The new file is appropriately noted as "(new file)" in the Change Manifest.

**No regressions found.** The fixes are clean and well-integrated.
