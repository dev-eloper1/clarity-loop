# Post-Merge Verification: TESTING_PIPELINE (P2)

**Date**: 2026-02-09
**Proposal**: `docs/proposals/TESTING_PIPELINE.md`
**Verdict**: **PASS** -- All 16 changes applied correctly. No missing content, no duplication, no collateral damage.

---

## Change-by-Change Verification

### Change 1: Add TEST_SPEC.md generation to spec mode (Steps 4b, 5)

**Target**: `skills/cl-implementer/references/spec-mode.md`
**Type**: Add
**Status**: PASS

Evidence:
- **Step 4b: Generate Test Spec** exists at lines 108-217, inserted after Step 4 (Generate Specs, lines 97-107). Placement is correct -- immediately after Step 4 as proposed.
- Full TEST_SPEC.md structure template is present: Test Architecture (Mock Boundaries table, Test Data Strategy table, Test Environment Requirements table), Per-Module Test Cases, Cross-Spec Integration Contracts, Contract Tests.
- "Read testing decisions first" paragraph references DECISIONS.md with category tag `testing`, respects P0.5 precedence rules. Correct.
- Five generation rules present (per-module unit test cases, cross-spec integration contracts, contract tests, mock boundaries, test data).
- **Step 5: Generate Spec Manifest** (lines 219-245) includes `TEST_SPEC.md` in the Specs table template with description "Test architecture, per-module test cases, integration contracts". Matches proposal exactly.
- Old Step 4 content (lines 97-107) is untouched -- no collateral damage.
- Old Step 5 content preserved with the addition only.

### Change 2: Add test task generation to start mode (Steps 2, 3)

**Target**: `skills/cl-implementer/references/start-mode.md`
**Type**: Add
**Status**: PASS

Evidence:
- **Step 2** (Read All Spec Artifacts, lines 80-102) now has item 5: "Read `{docsRoot}/specs/TEST_SPEC.md` if it exists." with the four parsed structures (test architecture, per-module unit test cases, cross-spec integration contracts, contract test definitions). Lines 97-101.
- **Step 3** (Generate Unified TASKS.md, lines 105-270) includes rules 8-11:
  - Rule 8 (Test infrastructure task, lines 190-212): Task template with Testing area, T-00X naming, acceptance criteria including factory functions, test runner, `npm test`. NO dependencies, parallel with early impl.
  - Rule 9 (Unit test tasks, lines 214-233): T-NNNT suffix convention. Dependencies on impl task + test infrastructure. Correct.
  - Rule 10 (Integration test tasks, lines 235-253): Depends on ALL spanned impl tasks. Testing area, positioned after impl tasks in dependency graph.
  - Rule 11 (Contract test tasks, lines 255-269): Producer + consumer dependencies + infrastructure.
- Original rules 1-7 (lines 160-188) are unchanged.

### Change 3: Update start mode pre-checks to use TEST_SPEC.md

**Target**: `skills/cl-implementer/references/start-mode.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Step 1.4 (Spec coverage, lines 35-44) now reads: "Special case: if `TEST_SPEC.md` exists in `{docsRoot}/specs/`, test tasks will be generated automatically (see Step 3). If `TEST_SPEC.md` does NOT exist but system docs mention testing requirements..."
- The old content ("offer three paths: a) Add test tasks manually...") is replaced, not duplicated. The three options are now: a) Regenerate specs with `/cl-implementer spec`, b) Add test tasks manually, c) Skip. Option (a) is updated to reference `/cl-implementer spec` producing TEST_SPEC.md. Old option (b) about `/cl-researcher research 'testing strategy'` is correctly replaced.
- No duplication of old and new content.

### Change 4: Add per-milestone integration testing and full-suite gate to autopilot

**Target**: `skills/cl-implementer/references/autopilot-mode.md`
**Type**: Add
**Status**: PASS

Evidence:
- **Step 3d-int** (Integration Test Check / Milestone Gate, lines 114-147): Present after Step 3d (Run Tests). Tier 2 classification stated. Respects `ux.autoDefaults`. Four substeps: area completion, integration boundary, execute integration tests (with fix task template F-NNN), do not block.
- Fix task template format correct: `F-NNN: Fix [boundary] integration failure (integration-failure from T-0XX)` with source task, discovered during, seam, failure fields.
- **Full-Suite Gate** (lines 211-226): Added to Step 3h (Checkpoint Evaluation). Tier 1 classification. Four substeps: run `npm test`, if pass proceed, if failures identify regressions and create fix tasks, report in summary.
- Existing Step 3d (lines 102-112) is unchanged -- the new Step 3d-int is additive.
- Existing checkpoint logic in Step 3h (lines 189-197) is preserved; the full-suite gate is appended after it.
- Tier awareness paragraph (lines 199-209, from P0.5) is preserved intact.

### Change 5: Update autopilot Step 3c to reference TEST_SPEC.md for test cases

**Target**: `skills/cl-implementer/references/autopilot-mode.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Step 3c (Write Tests, lines 74-100): The new content is in place:
  - Point 2: "Check TEST_SPEC.md" with four sub-bullets (function/input/output/edge cases table, mock boundaries, test data factories, T-NNNT/integration/contract tasks).
  - Point 3: "Fallback to acceptance criteria" with the original four criteria types (behavioral, structural, edge case, UI) preserved as the fallback.
  - Points 4-5: Testing framework detection and DECISIONS.md logging with category `testing`.
  - Test file convention paragraph present.
- The old Step 3c content (which had points 1-4 without TEST_SPEC.md reference) is fully replaced. No duplication -- the old "Translate each criterion" is now under the fallback (point 3), not at the top level.

### Change 6: Add per-milestone integration testing to autopilot summary

**Target**: `skills/cl-implementer/references/autopilot-mode.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Step 4 (Summary Report, lines 230-265): Updated with:
  - `ux.reviewStyle` compatibility paragraph (batch, serial, minimal).
  - Summary template includes: Unit tests, Integration tests (with milestones tested), Contract tests, Integration gates (passed/failed), Full-suite gate (PASS/NOT YET/FAIL).
  - Final Summary template includes: Test coverage line, Full-suite gate PASS, Integration gates verified, Regressions found.
- Old summary template (just "Tasks completed, Tasks remaining, Tests written, Fix tasks, Screenshots") is replaced with the expanded version. No duplication.

### Change 7: Update verify mode to include Dimension 5

**Target**: `skills/cl-implementer/references/verify-mode.md`
**Type**: Add
**Status**: PASS

Evidence:
- **Dimension 5: Test Coverage Against Test Spec** (lines 85-105): Present after Dimension 4 (Spec-to-Doc Alignment, lines 72-84). Numbered correctly as Dimension 5.
- Content matches proposal: catches list (missing test files, mock boundary mismatches, missing integration tests, missing contract tests, factory coverage), four verification steps, graceful skip when TEST_SPEC.md doesn't exist.
- Output section (lines 109-142) includes "Test Coverage (if TEST_SPEC.md exists)" subsection with per-module, integration, contract, and full-suite reporting.
- Existing Dimensions 1-4 are untouched. The section heading on line 15 still reads "Four Verification Dimensions" -- this is a minor inconsistency since there are now five dimensions. However, the proposal itself does not call for renaming the section heading (it says "Add Dimension 5" to the existing section), and the P3 proposal notes that after both merge the count should reflect six. This is a known forward-looking item, not a merge error.
- **Note**: SKILL.md (line 209) says "four dimensions" -- see Change 9/10/12 cross-check below.

### Change 8: Update run mode Step 3c to reference TEST_SPEC.md

**Target**: `skills/cl-implementer/references/run-mode.md`
**Type**: Add
**Status**: PASS

Evidence:
- Step 3c: Implement, item 5 (lines 120-125): Updated to read "Test/verify the implementation against each criterion. If `TEST_SPEC.md` exists and has a per-module section for this task's spec reference, use the test cases defined there as additional verification criteria -- particularly the edge cases and mock boundary specifications. This does not mean writing formal test files in run mode (that's autopilot's job) -- it means checking the implementation against the test spec's expectations to catch issues before moving on."
- This matches the proposal exactly. The clarification about not writing formal test files is present.
- Surrounding content (items 1-4, 6) is unchanged.

### Change 9: Update SKILL.md guidelines to reference TEST_SPEC.md

**Target**: `skills/cl-implementer/SKILL.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Guidelines section, "Testing is spec-driven" (lines 293-302): Updated to the full proposed text:
  - References TEST_SPEC.md as authoritative source for mock boundaries, test data strategy, per-module test cases, integration contracts, contract tests.
  - Autopilot Step 3c reference.
  - Nudge text for when TEST_SPEC.md doesn't exist.
  - First-class test tasks with acceptance criteria, dependencies, status tracking.
  - DECISIONS.md with category `testing` and P0.5 decision flow protocol reference.
- Old one-liner guideline replaced, not duplicated.

### Change 10: Update SKILL.md spec mode description to mention TEST_SPEC.md

**Target**: `skills/cl-implementer/SKILL.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Spec Mode section (lines 140-151): Updated to read "Generates implementation-ready specs from verified system docs, including `TEST_SPEC.md` -- a parallel artifact defining test architecture, per-module unit test cases, cross-spec integration contracts, and contract tests."
- The rest of the paragraph (waterfall gate, format adaptation, subagent dispatch) is preserved.
- Old text ("Generates implementation-ready specs from verified system docs. Enforces the waterfall gate...") replaced cleanly.

### Change 11: Update SKILL.md start mode description to mention test tasks

**Target**: `skills/cl-implementer/SKILL.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Start Mode section (lines 165-174): Updated to reference "ALL spec artifacts (tech specs + DESIGN_TASKS.md + TEST_SPEC.md if they exist)" and describes four test task types: test infrastructure task, per-module unit test tasks, per-milestone integration test tasks, contract test tasks.
- Original content about IMPLEMENTATION_PROGRESS.md and TaskCreate preserved.
- No duplication.

### Change 12: Update SKILL.md autopilot mode description to mention integration testing

**Target**: `skills/cl-implementer/SKILL.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Autopilot Mode section (lines 192-198): Updated to "Run mode with three additions: **self-testing**, **integration testing**, and **autonomous progression**." Mentions TEST_SPEC.md, milestone boundaries, full test suite as regression gate.
- Old text ("Run mode with two additions: **self-testing** and **autonomous progression**") replaced cleanly.
- **Note on verify mode description**: Line 209 still reads "Post-implementation holistic verification across four dimensions". The proposal does not explicitly call for updating this line -- it adds Dimension 5 to the verify reference file and proposes that dimension count references "should reflect six dimensions after both P2 and P3 merge." Since P3 has not yet merged, leaving this at "four" is technically the current state, though it is now inaccurate (should say "five"). This is a known forward-looking item flagged in the proposal's migration section. Not a merge error.

### Change 13: Add testing probes to bootstrap discovery conversation

**Target**: `skills/cl-researcher/references/bootstrap-guide.md`
**Type**: Add
**Status**: PASS

Evidence:
- Testing strategy probes section (lines 95-125): Present after the existing "Then dig deeper" questions and the behavioral/UX questions block. Inserted before "Continue the conversation naturally" (line 127).
- Two probe questions present:
  1. "What integration boundaries matter most?" with record to DECISIONS.md category `testing`
  2. "Are there any testing constraints?" with record to DECISIONS.md category `testing`
- Profile system integration note: "If the profile system already resolved framework, mock boundaries, test data, and coverage via auto-detect or presets, don't re-ask those. Only probe for gaps."
- Sensible defaults listed (vitest/pytest, factories, mock DB in unit/real in integration, business logic + integration boundaries, API contracts + auth flows).
- Record defaults with source `[auto-default]` and category `testing`.
- **No duplication with P1 behavioral questions**: The existing behavioral/UX questions (lines 64-91, added by P0.5/P1) cover errors, loading states, empty states, accessibility, keyboard/mouse, voice, offline, testing philosophy, and target devices. The P2 testing probes are in a separate subsection and focus on integration boundaries and testing constraints -- complementary, not overlapping. The existing "What's your testing philosophy?" question (line 80-81) covers the general philosophy, while P2's probes dig into project-specific architecture. No duplication.

### Change 14: Update cl-implementer public docs

**Target**: `docs/cl-implementer.md`
**Type**: Modify
**Status**: PASS

Evidence:
- **Spec section**: "Step 5: Generate Test Spec" (lines 95-111) present after Step 4 (Generate Spec Manifest). Describes TEST_SPEC.md with four-section content table (Test Architecture, Per-Module Test Cases, Cross-Spec Integration Contracts, Contract Tests). References DECISIONS.md consumption and start/autopilot consumption.
- **Start section**: "Test Tasks" subsection (lines 180-193) present. Four-row table with task types (Test infrastructure T-00X, Unit test T-NNNT, Integration test T-0XX, Contract test T-0XX), dependencies, and when. Description of first-class status in TASKS.md.
- **Autopilot section**: Line 269 reads "Run mode with three additions: **self-testing**, **per-milestone integration testing**, and **autonomous progression**." Updated from "two additions".
- "Integration Testing" subsection (lines 287-297): Three-row trigger table (last task in area, integration boundary complete, all tasks complete), fix task and full-suite gate descriptions.
- **Verify section**: Line 315 still reads "Post-implementation holistic check. Four dimensions:" -- same forward-looking item as noted in Change 12. The proposal does not call for updating this count in the public docs since P3 will also add a dimension and the final count should be six.

### Change 15: Update cl-researcher public docs for bootstrap testing probes

**Target**: `docs/cl-researcher.md`
**Type**: Modify
**Status**: PASS

Evidence:
- Bootstrap section, Greenfield item 1 (line 29-30): Updated to "Discovery conversation about your project -- goals, users, tech stack, constraints, testing strategy (framework, mock boundaries, test data approach, coverage expectations)".
- Old text ("goals, users, tech stack, constraints") expanded, not duplicated.

### Change 16: Update pipeline-concepts.md configuration section for testing config

**Target**: `docs/pipeline-concepts.md`
**Type**: Add
**Status**: PASS

Evidence:
- Configuration JSON block (lines 279-296) includes the `testing` section:
  ```json
  "testing": {
    "integrationGate": true,
    "fullSuiteGate": true
  }
  ```
- Config table (lines 299-309) includes:
  - `testing.integrationGate` | `true` | Run integration tests at milestone boundaries (Tier 2 checkpoint)
  - `testing.fullSuiteGate` | `true` | Run full test suite before declaring completion (Tier 1 checkpoint)
- Existing `ux.*` section preserved. New `testing` section is additive.
- **Config matches autopilot references**: autopilot-mode.md Step 3d-int references `ux.autoDefaults` for Tier 2 behavior, and the full-suite gate in Step 3h is Tier 1. The pipeline-concepts.md config confirms: integrationGate is Tier 2, fullSuiteGate is Tier 1. Consistent.

---

## Cross-File Consistency Checks

### SKILL.md summaries match reference file content

| SKILL.md Section | Reference File | Match |
|-----------------|---------------|-------|
| Spec Mode (lines 144-151) | spec-mode.md | PASS -- mentions TEST_SPEC.md, test architecture, per-module unit test cases, cross-spec integration contracts, contract tests |
| Start Mode (lines 167-174) | start-mode.md | PASS -- mentions TEST_SPEC.md, four test task types, first-class entries |
| Autopilot Mode (lines 192-198) | autopilot-mode.md | PASS -- mentions three additions (self-testing, integration testing, autonomous progression), TEST_SPEC.md, milestone boundaries, full test suite regression gate |
| Verify Mode (lines 208-211) | verify-mode.md | ADVISORY -- says "four dimensions" but verify-mode.md now has five. Forward-looking item per proposal (P3 will add sixth). Not a merge error. |

### Bootstrap testing probes do not duplicate P1's behavioral questions

- P0.5/P1 behavioral questions (bootstrap-guide.md lines 64-91): error handling, loading states, empty states, accessibility, keyboard/mouse, voice, offline, testing philosophy, target devices.
- P2 testing probes (bootstrap-guide.md lines 95-125): integration boundaries, testing constraints.
- The existing "What's your testing philosophy?" (line 80-81) is a general philosophy question. P2's probes ask about specific integration boundaries and constraints. Complementary, not duplicative. PASS.

### Verify mode Dimension 5 exists and is numbered correctly

- verify-mode.md line 85: "#### Dimension 5: Test Coverage Against Test Spec"
- Follows Dimension 4 (lines 72-84) with no gap or misnumbering. PASS.
- Section heading line 15 still reads "Four Verification Dimensions" -- minor label inconsistency, but the proposal does not call for changing this heading (and P3 will also add a dimension). ADVISORY.

### Pipeline-concepts.md config matches autopilot references

| Config Key | pipeline-concepts.md | autopilot-mode.md Reference | Consistent |
|-----------|---------------------|---------------------------|-----------|
| `testing.integrationGate` | Tier 2 checkpoint | Step 3d-int: "Tier 2 (Batch Review)" | PASS |
| `testing.fullSuiteGate` | Tier 1 checkpoint | Step 3h Full-Suite Gate: "Tier 1 -- must confirm" | PASS |
| `ux.autoDefaults` interaction | Described in tier threshold logic | Step 3d-int: "Respects `ux.autoDefaults` -- if set to `'tier2-3'`, integration gate results auto-proceed" | PASS |
| `ux.reviewStyle` interaction | Described in ux config | Step 4: "respects `ux.reviewStyle` from `.clarity-loop.json`" | PASS |

### Tier classifications consistent

| Gate | Tier | autopilot-mode.md | pipeline-concepts.md | docs/cl-implementer.md |
|------|------|-------------------|---------------------|----------------------|
| Milestone gate (integration) | Tier 2 | Step 3d-int: "Tier 2 (Batch Review)" (line 116) | `testing.integrationGate`: "Tier 2 checkpoint" (line 308) | Not explicitly tiered in public docs (acceptable -- public docs are less granular) | PASS |
| Full-suite gate | Tier 1 | Step 3h: "Tier 1 -- must confirm" (line 211) | `testing.fullSuiteGate`: "Tier 1 checkpoint" (line 309) | Not explicitly tiered in public docs | PASS |

### Terminology consistency

| Term | Expected Usage | Files Checked | Consistent |
|------|---------------|--------------|-----------|
| `TEST_SPEC.md` | Always backticked, always the same name | spec-mode.md, start-mode.md, autopilot-mode.md, run-mode.md, verify-mode.md, SKILL.md, cl-implementer.md, cl-researcher.md, pipeline-concepts.md | PASS |
| Test tasks | "first-class" entries/tasks in TASKS.md | start-mode.md (rules 8-11), SKILL.md (start mode, guidelines), cl-implementer.md (Test Tasks section) | PASS |
| Milestone gate | Integration test execution at area/boundary completion | autopilot-mode.md (Step 3d-int), SKILL.md, cl-implementer.md | PASS |
| Full-suite gate | Complete test suite before completion | autopilot-mode.md (Step 3h), SKILL.md, cl-implementer.md | PASS |
| T-NNNT | Unit test task ID suffix convention | start-mode.md (rule 9), autopilot-mode.md (Step 3c), cl-implementer.md (Test Tasks table) | PASS |
| Category `testing` | DECISIONS.md category tag | bootstrap-guide.md, autopilot-mode.md (Step 3c), SKILL.md (guidelines), pipeline-concepts.md (category table) | PASS |

---

## Advisory Items (Not Merge Errors)

1. **Verify mode dimension count**: The section heading in verify-mode.md (line 15) reads "Four Verification Dimensions" but the section now contains five. SKILL.md verify mode description (line 209) says "four dimensions." Public docs cl-implementer.md (line 315) says "Four dimensions." The proposal explicitly notes this is a forward-looking item: "P2 claims Dimension 5, P3 should use Dimension 6. After both P2 and P3 merge, verify mode will have six dimensions total. SKILL.md and docs/cl-implementer.md dimension count references must reflect the total after both merge." This should be updated when P3 merges.

2. **Relationship to Run Mode section**: autopilot-mode.md lines 324-328 still contain the old "Relationship to Run Mode" text that says "Autopilot mode is run mode with two additions: **self-testing** and **autonomous progression**." The SKILL.md autopilot description was updated to "three additions" but this section at the bottom of autopilot-mode.md was not. The proposal did not explicitly call for updating this section (it targeted Steps 3c, 3d, 3d-int, 3h, and 4). This is a minor inconsistency that could be cleaned up but is not a merge error per the Change Manifest scope.

---

## Summary

| # | Change | Target File | Verdict |
|---|--------|------------|---------|
| 1 | TEST_SPEC.md generation (Steps 4b, 5) | spec-mode.md | PASS |
| 2 | Test task generation (Steps 2, 3) | start-mode.md | PASS |
| 3 | Pre-checks use TEST_SPEC.md | start-mode.md | PASS |
| 4 | Per-milestone integration + full-suite gate | autopilot-mode.md | PASS |
| 5 | Step 3c references TEST_SPEC.md | autopilot-mode.md | PASS |
| 6 | Autopilot summary updated | autopilot-mode.md | PASS |
| 7 | Verify mode Dimension 5 | verify-mode.md | PASS |
| 8 | Run mode Step 3c references TEST_SPEC.md | run-mode.md | PASS |
| 9 | Guidelines reference TEST_SPEC.md | SKILL.md | PASS |
| 10 | Spec mode description updated | SKILL.md | PASS |
| 11 | Start mode description updated | SKILL.md | PASS |
| 12 | Autopilot mode description updated | SKILL.md | PASS |
| 13 | Testing probes in bootstrap | bootstrap-guide.md | PASS |
| 14 | Public docs cl-implementer | cl-implementer.md | PASS |
| 15 | Public docs cl-researcher | cl-researcher.md | PASS |
| 16 | Testing config in pipeline-concepts | pipeline-concepts.md | PASS |

**Cross-file consistency**: PASS (all 6 checks passed)
**Terminology consistency**: PASS (all 6 terms consistent across files)
**No content duplication detected.**
**No collateral damage to surrounding content.**
**2 advisory items noted (not merge errors).**

**Overall Verdict: PASS**
