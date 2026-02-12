# Review: Testing Pipeline (P2)

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/TESTING_PIPELINE.md
**System docs referenced**: skills/cl-implementer/SKILL.md, skills/cl-implementer/references/spec-mode.md, skills/cl-implementer/references/start-mode.md, skills/cl-implementer/references/autopilot-mode.md, skills/cl-implementer/references/run-mode.md, skills/cl-implementer/references/verify-mode.md, skills/cl-researcher/references/bootstrap-guide.md, skills/cl-researcher/SKILL.md, docs/pipeline-concepts.md, docs/cl-implementer.md, docs/cl-researcher.md
**Research doc**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F14-F20, Changes 8-11)

## Summary

This proposal introduces a structured testing pipeline to Clarity Loop by extending four existing artifacts (spec generation, start mode, autopilot mode, and bootstrap) with testing capabilities. The core contribution is `TEST_SPEC.md` -- a specification artifact generated alongside implementation specs that defines test architecture, per-module unit test cases, cross-spec integration contracts, and contract tests. Start mode generates test tasks as first-class TASKS.md entries. Autopilot gains per-milestone integration testing and a full-suite regression gate. Bootstrap probes for testing architecture decisions that flow into DECISIONS.md. The proposal is well-grounded in research findings F15-F20, builds cleanly on P0.5 infrastructure (tiered checkpoints, decision flow protocol, project profile system), and respects the progressive disclosure model with a dedicated context budget section. It correctly identifies that today's autopilot self-testing is circular (verifying code against itself rather than against an independent specification) and solves this with specification-backed testing.

## Verdict: APPROVE WITH CHANGES

Two blocking issues must be resolved before merge. Both are cross-proposal numbering conflicts that would cause confusion or merge failures if not addressed. All other observations are non-blocking.

## Cross-Proposal Conflicts

### Verify Mode Dimension 5 Numbering Conflict (P2 vs P3) -- BLOCKING

P2 (this proposal) adds **Dimension 5: Test Coverage Against Test Spec** to `verify-mode.md`.

P3 (SECURITY_ERRORS_AND_API_CONVENTIONS) adds **Dimension 5: Dependency Audit** to the same file, at the same insertion point (after Dimension 4).

Both proposals claim "Dimension 5" as a new section in `skills/cl-implementer/references/verify-mode.md`. The P2 Cross-Proposal Conflicts table lists P3 but only mentions the spec-mode.md overlap ("P3 adds SECURITY_SPEC.md generation. P2 adds TEST_SPEC.md generation. Both extend the same step but produce different artifacts. No content overlap -- can merge in either order."). It does NOT identify the verify-mode.md conflict.

P3's Cross-Proposal Conflicts table does not mention P2 at all (it references P0, P0.5, IMPLEMENTER_SKILL, and CONTEXT_SYSTEM).

Since the research's proposal strategy (line 1910) lists P2 and P3 as siblings in Tier 1b/1c with "both depend on P0," they can theoretically merge in either order. The verify dimension numbering must be coordinated. Whichever merges first gets Dimension 5; the other becomes Dimension 6. Both proposals should declare this dependency explicitly.

### Bootstrap Discovery Conversation Overlap (P1, P2, P3)

P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE, Change 5), P2 (this proposal, Change 13), and P3 (Change 12) all add probing questions to the same location: `skills/cl-researcher/references/bootstrap-guide.md`, Step 2 Discovery Conversation, under the "Then dig deeper" section.

P2's Cross-Proposal Conflicts table does not mention P1's bootstrap overlap (only mentions autopilot Step 3e). All three proposals add content to the same markdown section. The content is complementary (behavioral, testing, and security probing respectively), but the merge order and formatting need coordination to avoid messy diffs.

This is not blocking because the additions are additive (different question blocks), but P2 should document P1 as also touching bootstrap-guide.md Step 2.

## Blocking Issues

### Issue 1: Verify Mode Dimension 5 Numbering Collision with P3

- **Dimension**: External Consistency
- **Where**: Change Manifest row 7 (verify-mode.md); Cross-Proposal Conflicts table; Change Area 5 detailed design
- **Issue**: P2 and P3 both add "Dimension 5" to `skills/cl-implementer/references/verify-mode.md`. The Cross-Proposal Conflicts table does not identify this collision. P3 is not listed as having an overlapping section in verify-mode.md.
- **Why it matters**: If both proposals merge without coordination, one will overwrite the other's Dimension 5, or the file will have two sections named "Dimension 5." The SKILL.md verify mode description and `docs/cl-implementer.md` verify section also reference the dimension count ("four dimensions" updated to "five dimensions"), compounding the confusion. Both P2 and P3 update these references independently.
- **Suggestion**: Add verify-mode.md to the P2 Cross-Proposal Conflicts table under P3. Explicitly state: "P3 also adds a new dimension to verify-mode.md (Dependency Audit). Both add 'Dimension 5' -- whichever merges first takes Dimension 5, the other takes Dimension 6. SKILL.md and cl-implementer.md dimension counts must reflect the total after both merge." Also update the SKILL.md proposed text (Change Area 5 and elsewhere) to say "five or six dimensions" with a merge-order note, or defer the numbering to merge time. The same applies to `docs/cl-implementer.md` (Change Manifest row 14), which says "four dimensions" in the current state -- P2's proposed text should account for P3 potentially having already changed this to "five dimensions."

### Issue 2: Missing P1 Bootstrap Overlap in Cross-Proposal Conflicts

- **Dimension**: External Consistency
- **Where**: Cross-Proposal Conflicts table; Change Manifest row 13
- **Issue**: P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE, Change 5) adds behavioral probing questions to `skills/cl-researcher/references/bootstrap-guide.md`, Step 2: Discovery Conversation -- the same section P2 modifies. P2's Cross-Proposal Conflicts table lists P1 but only identifies the autopilot Step 3e overlap, missing the bootstrap-guide.md overlap entirely.
- **Why it matters**: During merge, the reviewer needs to know all proposals touching the same file/section to apply changes correctly. Missing this overlap could cause merge conflicts or content duplication (both proposals adding questions after the same anchor line).
- **Suggestion**: Add bootstrap-guide.md to the P1 conflict row. State: "P1 also adds probing questions to bootstrap-guide.md Step 2 Discovery Conversation (behavioral, accessibility, resilience, content probes). P2 adds testing strategy probes to the same section. Both are additive and complementary -- can merge in either order, but the reviewer should ensure questions from both proposals appear without duplication."

## Non-Blocking Suggestions

### Suggestion 1: TEST_SPEC.md Size Concern for Large Projects

- **Dimension**: Completeness & Gaps
- **Where**: Change Area 1, Design Decisions table ("Single TEST_SPEC.md file")
- **Observation**: The design decision to use a single TEST_SPEC.md is reasonable for most projects, but the proposal's own risk table estimates ~26-29 test tasks for a project with 20 implementation tasks. For projects with 50+ implementation specs, TEST_SPEC.md could become very large. The proposal's Context Budget section (rule 3) says "Large tables and catalogs go in separate files" when over 10 rows, but the per-module test cases section will have many rows for large projects.
- **Suggestion**: Add a brief note in the generation rules or design decisions table: "For projects where TEST_SPEC.md exceeds ~3000 tokens, consider splitting into per-area test spec files (e.g., `TEST_SPEC_DATA.md`, `TEST_SPEC_API.md`) linked from the manifest. The single-file default is appropriate for most projects." This keeps the progressive disclosure commitment without over-engineering for typical cases.

### Suggestion 2: Clarify Run Mode Step 3c Item 5 Scope

- **Dimension**: Internal Coherence
- **Where**: Change Area 4, run-mode.md Step 3c, proposed item 5
- **Observation**: The proposed text says: "This does not mean writing formal test files in run mode (that's autopilot's job) -- it means checking the implementation against the test spec's expectations to catch issues before moving on." This is a useful clarification, but the boundary between "checking against expectations" and "writing tests" could be ambiguous to an LLM executing the skill. In practice, an agent might interpret "check against edge cases" as writing actual test assertions.
- **Suggestion**: Consider adding one concrete example: "For instance, if TEST_SPEC.md says `validateCredentials` should throw on empty email, verify the implementation handles empty email -- don't write a test file for it. The test file is written when the corresponding T-NNNT test task is processed in autopilot mode."

### Suggestion 3: Integration Gate Fix Task Convention

- **Dimension**: Internal Coherence
- **Where**: Change Area 3, Step 3d-int, item 3
- **Observation**: The fix task format for integration failures uses `F-NNN` with a `(integration-failure from T-0XX)` annotation. The existing run-mode.md Step 4 already defines `integration-failure` as a fix task type. However, the P2 integration gate fix tasks have additional metadata (Seam, Discovered during: milestone gate) that the existing fix task format in run-mode.md doesn't include. The proposal shows the format inline but doesn't explicitly note that this extends the existing fix task template.
- **Suggestion**: Add a brief note that this is an extension of the existing `integration-failure` type with additional context fields, so the merger knows to integrate it with the existing Step 4 format rather than creating a parallel structure.

### Suggestion 4: Config Key Defaults Should Be Explicit in pipeline-concepts.md

- **Dimension**: Completeness & Gaps
- **Where**: Change Area 8, pipeline-concepts.md Configuration section
- **Observation**: The proposed `testing.integrationGate` and `testing.fullSuiteGate` config keys default to `true` (opt-out, not opt-in). This is stated in the design decisions table and the config table. However, the proposal doesn't explicitly note what happens if `testing` key is absent entirely vs present with `false`. The existing `ux.*` section has an "Invalid or missing values" fallback rule. The `testing.*` section should follow the same pattern.
- **Suggestion**: Add a brief note: "If the `testing` section is absent, both gates default to `true`. If a `testing.*` key has an unrecognized value, fall back to `true` (same pattern as `ux.*` fallback behavior)."

### Suggestion 5: Open Item 2 Resolution Guidance

- **Dimension**: Spec-Readiness
- **Where**: Open Items, item 2
- **Observation**: Open Item 2 asks whether T-NNNT (unit test task) completion should gate downstream tasks that depend on the implementation task. The current design says "no -- tests verify, they don't gate." This is stated as potentially configurable. For spec generation purposes, this needs a definitive answer because it affects the dependency graph in TASKS.md.
- **Suggestion**: Resolve this in the proposal text rather than leaving it open. The current design answer ("no, tests don't gate downstream") is the right one for pragmatic reasons. State it as the decided approach with a note that it could be made configurable in a future enhancement. Leaving it open creates ambiguity for the spec-mode implementation.

## Spec-Readiness Notes

The proposal is largely spec-ready. Each Change Area has explicit current/proposed text with clear insertion points in the target files. The Change Manifest is complete and correctly maps each change to its target file and section.

Key items for spec generation:

1. **Verify mode dimension numbering** must be coordinated with P3 before either proposal's verify-mode.md changes can be specced.

2. **SKILL.md line references** (e.g., "line 144-148", "line 163-168", "line 186-189", "line 284") are useful for review but should be validated at merge time -- other proposals may have shifted line numbers.

3. **Open Items 2 and 3** should ideally be resolved before spec generation. Open Item 2 (test task dependency gating) affects TASKS.md dependency graph generation. Open Item 3 (spec-review integration with TEST_SPEC.md) can safely be deferred.

4. **Token budget validation** is called out in the Context Budget section but actual token counts per change area are not provided. The merge validator should verify that no reference file exceeds ~3000 tokens after all P2 changes are applied, particularly autopilot-mode.md which receives the most additions (Steps 3c rewrite, 3d-int new step, 3h expansion, Step 4 expansion).

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| `skills/cl-implementer/SKILL.md` | Consistent | Proposal correctly identifies four sections to update (Spec Mode, Start Mode, Autopilot Mode, Guidelines). Current-state quotes match actual file content. |
| `skills/cl-implementer/references/spec-mode.md` | Consistent | Step 4 and Step 5 current-state descriptions match the actual file. New Step 4b insertion point is logical. |
| `skills/cl-implementer/references/start-mode.md` | Consistent | Step 1.4, Step 2, Step 3 current-state descriptions match. New rules 8-11 extend the existing 7-rule structure cleanly. |
| `skills/cl-implementer/references/autopilot-mode.md` | Consistent | Steps 3c, 3d, 3h, 4 current-state descriptions match actual file. New 3d-int step is correctly positioned. P0.5 tier awareness in 3h is acknowledged. |
| `skills/cl-implementer/references/run-mode.md` | Consistent | Step 3c item 5 current-state matches. Proposed addition is appropriately scoped (verification, not test writing). |
| `skills/cl-implementer/references/verify-mode.md` | CONFLICT | Both P2 and P3 add "Dimension 5." See Blocking Issue 1. Current "Four Verification Dimensions" heading is correctly identified. |
| `skills/cl-researcher/references/bootstrap-guide.md` | Consistent (with overlap) | Step 2 current-state matches. Testing probes complement P0.5 profile system defaults. But P1 also modifies this section -- see Blocking Issue 2. |
| `skills/cl-researcher/SKILL.md` | Not modified | Proposal correctly excludes this from changes (Change Manifest row 15 targets bootstrap-guide.md, not SKILL.md). |
| `docs/pipeline-concepts.md` | Consistent | Configuration section current-state matches post-P0.5 content. New `testing` config section sits alongside `ux` section logically. |
| `docs/cl-implementer.md` | Consistent | Spec, Start, Autopilot, Verify sections identified correctly. Public-facing doc updates mirror skill changes. The Verify section says "four dimensions" -- after P2+P3, this would need to say "six dimensions." |
| `docs/cl-researcher.md` | Consistent | Bootstrap section current-state matches. Minimal change (add testing strategy to discovery conversation description). |

## Strengths

1. **Strong research grounding.** Every change traces to specific research findings (F15-F20) with clear rationale. The proposal doesn't introduce features that weren't identified in the gap analysis.

2. **Excellent backward compatibility.** All changes are additive. Projects without TEST_SPEC.md see zero behavioral change. Every new step has a graceful fallback ("If TEST_SPEC.md doesn't exist..."). The autopilot Step 3c rewrite keeps the existing acceptance-criteria-based approach as an explicit fallback.

3. **Clean P0.5 integration.** The proposal builds on P0.5 infrastructure correctly -- milestone gates use Tier 2 classification, full-suite gate uses Tier 1, test results respect `ux.reviewStyle`, DECISIONS.md entries use the `testing` category tag, and bootstrap probes complement (rather than duplicate) the project profile system.

4. **Progressive disclosure respect.** The Context Budget section is a standout. It explicitly names six rules for keeping skill files lean and calls out merge-time validation criteria. This is rare in proposals and shows awareness of the system's operational constraints.

5. **Practical design decisions.** The T-NNNT naming convention is clever -- it makes implementation-to-test relationships immediately visible without parallel numbering systems. The decision to make integration tests first-class tasks (rather than invisible autopilot behavior) means they get the same tracking and dependency management as implementation tasks.

6. **Well-scoped.** The proposal explicitly states what it does NOT cover (cl-designer behavioral test scenarios, browser validation tooling, security specs) and explains why these are separate proposals. The scope boundary is clean.

7. **Honest risk assessment.** The risk table identifies real concerns (TEST_SPEC.md staleness, test task inflation, premature bootstrap decisions) with practical mitigations rather than dismissing risks.

## Risk Assessment

1. **Autopilot-mode.md token budget risk.** This file receives the most additions from P2: a full Step 3c rewrite (~30 lines), a new Step 3d-int (~35 lines), Step 3h expansion (~25 lines), and Step 4 expansion (~30 lines). Combined with existing content (~260 lines), this pushes the file toward the ~3000 token budget. If P1's browser validation changes also land in autopilot-mode.md (though P1 says its autopilot changes are deferred to P2), the budget could be exceeded. Monitor this during merge.

2. **Three-proposal bootstrap convergence.** P1, P2, and P3 all add probing questions to the same bootstrap discovery conversation section. The cumulative effect could make the "Then dig deeper" section feel like an interrogation rather than a conversation. The warmth gradient (P0.5) asks for warm interaction during bootstrap -- a long list of probing questions (behavioral + testing + security + error + API) may undermine that warmth. Consider grouping all probes into a shared reference file that bootstrap-guide.md references, rather than inlining them all.

3. **TEST_SPEC.md generation quality depends on implementation spec quality.** The proposal correctly notes that TEST_SPEC.md is "generated alongside implementation specs" from the "same system doc analysis." But if implementation specs have gaps (which they often do -- that's why spec-review mode exists), the test spec will inherit those gaps. There's no equivalent of spec-review for TEST_SPEC.md (Open Item 3 acknowledges this but defers it).
