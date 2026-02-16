# Proposal: Verification Gap Closure — Ground Truth, Pre-Apply Validation, and Code Alignment

**Created**: 2026-02-15
**Status**: Draft
**Research**: docs/research/R-001-VERIFICATION_GAPS.md
**Author**: user + AI researcher

## Summary

This proposal closes three categories of verification blind spots in the cl-reviewer and
cl-implementer pipelines. Currently, the review process evaluates proposals as documents
(are the ideas coherent, consistent, sound?) but never reads the actual target files to
verify the proposal's factual claims about current state. The merge step applies changes
without first confirming the targets still match what the proposal assumed. And the pipeline
modifies system docs without checking whether those docs still match the actual codebase.

The changes enhance 7 existing reference files — no new modes, no new files, no new CLI
invocations. Ground truth spot-checking becomes the 7th review dimension. Pre-apply
validation runs inside merge mode before changes are applied. Code alignment checks are
integrated at review, verify, and spec generation time by invoking targeted subsets of
the existing sync mode logic.

The UX principle throughout is **quiet on success, loud on failure**: clean passes produce
one-line summaries; failures produce structured tables with impact assessments. On the
happy path, these changes add ~5 summary lines across the entire lifecycle and zero new
decision points.

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-001-VERIFICATION_GAPS.md | F1: No ground truth dimension. F2: No pre-apply validation. F3: Re-review trusts claims. F4: No reference completeness. F5: Target freshness unchecked. F6: Uniform validation depth. F7: Verify catches what should be caught earlier. | Option A: Enhance existing steps (recs 1-4) |
| docs/research/R-001-VERIFICATION_GAPS.md | F8: Sync mode orphaned from lifecycle. F9: No code-doc gate before spec gen. F10: Post-merge verify doesn't check code. | Option D: Integrate sync into lifecycle (recs 5-7) |
| docs/research/R-001-VERIFICATION_GAPS.md | F11: No UX design for verification outputs. | UX Design section: quiet-on-success, three-tier progressive disclosure |

## System Context

### Research Type: Evolutionary

This proposal strengthens existing verification modes. It adds no new modes, no new files,
and no new CLI invocations.

### Current State

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| cl-reviewer/references/review-mode.md | 5-step process: gather context, analyze 6 dimensions, cross-proposal conflicts, produce review file, update tracking. No ground truth checking. No code verification. | Steps 1-5, all 6 dimension definitions, review file template |
| cl-reviewer/references/merge-mode.md | 6-step process: build plan, create marker, apply changes, remove marker, update tracking, auto-trigger verify. No pre-apply validation — goes directly from plan to apply. | Steps 1-6, error handling section |
| cl-reviewer/references/re-review-mode.md | 4-step process with Parts A-D: issue resolution, regression scan, external consistency, convergence tracking. No ground truth re-check on corrected claims. | Step 2 heading ("Three-Part Analysis" — inaccurate, actually 4 parts), Parts A-D |
| cl-reviewer/references/verify-mode.md | 5-step process with 4-part verification: application completeness, fidelity, cross-doc consistency, collateral damage. No code alignment check. | Step 2 Parts A-D, design nudge in Step 5 |
| cl-implementer/references/spec-mode.md | Waterfall gate with 5 checks (research, proposals, merges, context freshness, transition advisory). No code-doc alignment check. | Step 1 gate check batch table |
| cl-reviewer/SKILL.md | Mode summaries for initial review ("six dimensions"), merge ("presents a merge plan"), verify ("applied faithfully, consistent"). | Initial Review, Merge Mode, Verify Mode summary sections |
| cl-implementer/SKILL.md | Spec mode summary mentioning waterfall gate without code-doc check. | Spec Mode summary section |

### Proposed State

After this proposal:

- **Initial review** evaluates 7 dimensions, with ground truth as the 7th — spot-checking
  3-5 Change Manifest items against actual target files and, when items involve code claims,
  running targeted sync checks.
- **Re-review** includes a Part E that re-verifies ground truth on sections changed by fixes.
- **Merge** runs pre-apply validation between building the plan and applying changes. On the
  happy path (all targets confirmed), this auto-proceeds with a one-line summary. When issues
  are found, it presents an impact-assessed validation report.
- **Verify** includes a Part E that checks code alignment on claims changed by the merge.
- **Spec generation** gate includes a 6th check for code-doc alignment (advisory/warning, not blocking).

## Change Manifest

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Add Step 2 "Ground Truth Spot-Check" with doc-to-file and doc-to-code checks | cl-reviewer/references/review-mode.md | Between Step 1 and current Step 2 | Add Section | F1, F4, F5, F8 (Recs 1, 5) |
| 2 | Renumber current Step 2 → Step 3, update heading from "Six Dimensions" to "Seven Dimensions" | cl-reviewer/references/review-mode.md | Current Step 2 heading | Modify | F1 (Rec 1) |
| 3 | Add Dimension 7: Ground Truth to the dimensions list | cl-reviewer/references/review-mode.md | Within renumbered Step 3 (after Dimension 6) | Add | F1 (Rec 1) |
| 4 | Update review file template to include Dimension 7 in blocking issues | cl-reviewer/references/review-mode.md | Step 4 review file template | Modify | F1 (Rec 1) |
| 5 | Renumber Steps 3-5 → Steps 4-6 | cl-reviewer/references/review-mode.md | Steps 3, 4, 5 headings | Modify | F1 (Rec 1) |
| 6 | Add Step 2: Pre-Apply Validation between Build Merge Plan and Create Authorization Marker | cl-reviewer/references/merge-mode.md | Between Step 1 and current Step 2 | Add Section | F2, F5, F6, F7 (Rec 2) |
| 7 | Renumber current Steps 2-6 → Steps 3-7 | cl-reviewer/references/merge-mode.md | Steps 2-6 headings | Modify | F2 (Rec 2) |
| 8 | Fix Step 2 heading from "Three-Part Analysis" to "Five-Part Analysis" and add Part E: Ground Truth Re-Check | cl-reviewer/references/re-review-mode.md | Step 2 heading + after Part D | Modify + Add | F3 (Rec 3) |
| 9 | Add Part E: Code Alignment Check after existing Parts A-D | cl-reviewer/references/verify-mode.md | Step 2, after Part D | Add | F10 (Rec 6) |
| 10 | Add scope note to Part A intro indicating it is now confirmatory | cl-reviewer/references/verify-mode.md | Part A intro | Modify | F7 (Rec 4) |
| 11 | Add Check 6 "Code-doc alignment" to the waterfall gate batch table | cl-implementer/references/spec-mode.md | Step 1 batch table | Modify | F9 (Rec 7) |
| 12 | Update Initial Review summary to reference seven dimensions and ground truth | cl-reviewer/SKILL.md | Initial Review section | Modify | F1 (Rec 1) |
| 13 | Update Merge Mode summary to reference pre-apply validation | cl-reviewer/SKILL.md | Merge Mode section | Modify | F2 (Rec 2) |
| 14 | Update Verify Mode summary to reference code alignment check | cl-reviewer/SKILL.md | Verify Mode section | Modify | F10 (Rec 6) |
| 15 | Update Spec Mode summary to reference code-doc gate check | cl-implementer/SKILL.md | Spec Mode section | Modify | F9 (Rec 7) |
| 16 | Update Merge Mode workflow list to include pre-apply validation step | cl-reviewer/SKILL.md | Merge Mode workflow list | Modify | F2 (Rec 2) |
| 17 | Add Merge Advisory field to review file template for recommending exhaustive validation | cl-reviewer/references/review-mode.md | Step 5 review file template | Add | F6 (Rec 2) |
| 18 | Add note to merge-mode error handling that pre-apply validation should catch most target issues | cl-reviewer/references/merge-mode.md | Error handling section | Modify | F2, F7 (Rec 2) |

**Change types:**
- **Modify** — Changing existing content in an existing section
- **Add** — Adding content to an existing section
- **Add Section** — Adding a new section to an existing doc

**Scope boundary**: This proposal ONLY modifies the 7 files listed above. It does not touch
audit-mode.md, correction-mode.md, fix-mode.md, sync-mode.md, or design-review-mode.md.
Sync mode's logic is invoked, not modified — lifecycle steps reference the sync pattern
without duplicating or restructuring it.

## Detailed Design

### Change Area 1: Ground Truth Spot-Check in Initial Review

**What**: Add a new Step 2 "Ground Truth Spot-Check" to the initial review process. This
step reads actual target files to verify the proposal's factual claims before dimensional
analysis begins. It also checks code-related claims via targeted sync when applicable.

**Why**: Research Finding 1 identified that all 6 existing dimensions analyze the proposal
as a document — none read actual target files. The Guided Autonomy case study showed 13 of
19 errors (6 factual accuracy, 3 target completeness, 4 insertion point) were ground truth
issues invisible to dimensional analysis.

**System doc impact**: Changes 1-5 in the Change Manifest.

#### Change 1: Add Step 2 — Ground Truth Spot-Check (review-mode.md)

Insert between current Step 1 (Gather Context) and current Step 2 (Analyze Across Six
Dimensions):

**Current** (review-mode.md, between Step 1 and Step 2):
> Step 1 ends with checking the proposal tracker. Step 2 begins immediately with
> "Analyze Across Six Dimensions."

**Proposed** — insert this new section:

> ### Step 2: Ground Truth Spot-Check
>
> Before dimensional analysis, verify the proposal's factual claims against actual target
> files. This catches accuracy and executability issues that dimensional analysis cannot
> detect.
>
> **Select 3-5 Change Manifest items for spot-checking.** Prioritize:
> - MODIFY operations (claims about current state are most likely to be wrong)
> - Items with terse "Current" descriptions (less detail = more room for inaccuracy)
> - Items targeting files modified by other recent proposals
> - Items with broad targets ("restructure section X")
>
> **For each selected item, read the actual target file and verify:**
>
> 1. **Factual accuracy** — Does the proposal's "Current" description match what's actually
>    in the file? Check line counts, section structure, content summaries.
> 2. **Target completeness** — For "remove all references to X" or "replace X with Y"
>    operations, grep the target directory for the key terms. Are there references the
>    proposal missed?
> 3. **Design specificity** — Is there enough detail in the merge instructions for
>    mechanical execution? Could someone apply this change without interpretation?
> 4. **Insertion point awareness** — For Add/Add Section changes, what already exists at
>    the proposed location? Will the new content fit naturally?
>
> **Code-related claims** — If any spot-checked items involve claims about code (e.g.,
> "the codebase currently uses X", "the system does Y"), verify those claims against the
> actual codebase using targeted sync checks:
> - Existence claims: Does the referenced file, module, function, or dependency exist?
> - If the Change Manifest modifies sections about technology, architecture, or code
>   structure, check the specific claims in those sections.
>
> This is NOT a full sync scan. It piggybacks on the spot-check — same 3-5 items, checking
> against code only when claims are code-related.
>
> **Report findings under Dimension 7: Ground Truth** in the review output.

#### Change 2: Renumber Step 2 heading (review-mode.md)

**Current** (review-mode.md line 27):
> `### Step 2: Analyze Across Six Dimensions`

**Proposed**:
> `### Step 3: Analyze Across Seven Dimensions`

#### Change 3: Add Dimension 7 — Ground Truth (review-mode.md)

Insert after the existing Dimension 6 (Spec-Readiness) block:

**Current** (review-mode.md, after line 80):
> Dimension 6: Spec-Readiness ends with "flagging spec-readiness issues helps the user
> improve precision before merging." Next is Step 3: Cross-Proposal Conflict Detection.

**Proposed** — insert before the renumbered Step 4:

> #### 7. Ground Truth
> Do the proposal's factual claims match reality?
> - Are "Current" descriptions accurate against the actual target files?
> - Are all references accounted for (no orphaned references after removal)?
> - Are merge instructions specific enough for mechanical execution?
> - Do code-related claims match the actual codebase?
>
> Ground truth issues are always blocking — inaccurate claims about current state lead to
> merge failures. Unlike other dimensions, ground truth findings include a `Type` column
> distinguishing Doc-to-File (target file mismatch) from Doc-to-Code (codebase mismatch).
>
> **UX**: On clean pass, report a single summary line:
> `**Dimension 7: Ground Truth** — 5 items spot-checked, all confirmed.`
>
> On issues found, report a table of only the failed items:
>
> | Change # | Issue | Type | Severity |
> |----------|-------|------|----------|
> | Change 3 | "Current" says ~10 lines, actual is ~45 lines | Doc-to-File | Blocking |
> | Change 5 | Proposal claims pgvector uses 768-dim, code uses 1536 | Doc-to-Code | Blocking |

#### Change 4: Update review file template (review-mode.md)

**Current** (review-mode.md, within the review file template, line 131):
> ```
> - **Dimension**: Which of the six dimensions this falls under
> ```

**Proposed**:
> ```
> - **Dimension**: Which of the seven dimensions this falls under
> ```

#### Change 5: Renumber Steps 3-5 (review-mode.md)

**Current**:
> `### Step 3: Cross-Proposal Conflict Detection` (line 82)
> `### Step 4: Produce the Review File` (line 92)
> `### Step 5: Update Tracking` (line 164)

**Proposed**:
> `### Step 4: Cross-Proposal Conflict Detection`
> `### Step 5: Produce the Review File`
> `### Step 6: Update Tracking`

**Dependencies**: Changes 2, 3, 4, 5 depend on Change 1 being in place (they reference
the new step numbering and dimension).

---

### Change Area 2: Pre-Apply Validation in Merge Mode

**What**: Add a new Step 2 "Pre-Apply Validation" between the existing Step 1 (Build Merge
Plan) and Step 2 (Create Authorization Marker). This validates that target files still match
the proposal's assumptions before any changes are applied.

**Why**: Research Finding 2 identified that merge mode goes directly from plan to apply with
no validation — like running `terraform apply` without `terraform plan`. The Guided Autonomy
case showed errors discovered reactively mid-merge, with partial changes already applied.

**System doc impact**: Changes 6-7, 18 in the Change Manifest.

#### Change 6: Add Step 2 — Pre-Apply Validation (merge-mode.md)

Insert between current Step 1 (Build the Merge Plan) and current Step 2 (Create
Authorization Marker):

**Current** (merge-mode.md, between Step 1 and Step 2):
> Step 1 ends with "Wait for explicit user approval before proceeding."
> Step 2 begins with "Write the marker file at `docs/system/.pipeline-authorized`."

**Proposed** — insert this new section:

> #### Step 2: Pre-Apply Validation
>
> After the user approves the merge plan, validate that target files still match the
> proposal's assumptions before applying any changes.
>
> **Lightweight validation (always runs)**:
> For every Change Manifest item, read the target file and confirm:
> - The target section exists at the stated location
> - The content broadly matches the proposal's "Current" description
>
> **Exhaustive validation (complexity-triggered)**:
> Runs when any of these signals are present:
> - Change Manifest has 12+ items
> - 50%+ of changes are MODIFY type
> - Any file is targeted by 3+ changes
> - Proposal has been through 3+ review/fix rounds
> - User or reviewer explicitly requests it (e.g., review recommends exhaustive validation)
>
> Exhaustive validation additionally:
> - Verifies every factual claim in the proposal against target files
> - Greps for missed references on removal/replacement operations
> - Checks insertion point surroundings for conflicts
> - Validates merge instruction specificity
>
> **Validation report**:
>
> If all items confirmed, auto-proceed with a one-line summary:
> ```
> Pre-apply validation: 8/8 targets confirmed. Proceeding to apply.
> ```
> No user prompt — clean merges should feel unchanged.
>
> If issues found, present the validation report and wait for user decision:
> ```
> Pre-apply validation: 6/8 confirmed, 2 issues.
>
> | # | Target | Status | Proposal Expects | Actual State | Impact on Change |
> |---|--------|--------|-----------------|--------------|-----------------|
> | 3 | ARCHITECTURE.md §Event Flow | Stale | ~10-line section describing webhook flow | ~45 lines, restructured with subheadings | HIGH — "replace section" would discard 35 lines of new content |
> | 7 | TDD.md §Sandbox Config | Stale | 3-tier list (bash, OS, Docker) | 3-tier list with added resource limits table | LOW — proposal appends to end, existing content unaffected |
>
> Options: (1) Fix proposal and re-review, (2) Proceed anyway, (3) Abort merge
> ```
>
> The **Impact on Change** column is what makes the decision actionable:
> - **HIGH**: Proposed change would overwrite, discard, or conflict with current content
> - **LOW**: Drift exists but proposed change wouldn't collide with it
> - **Missing**: Target section/file doesn't exist at all
>
> No automatic blocking — the user decides based on assessed impact.

#### Change 7: Renumber Steps 2-6 → Steps 3-7 (merge-mode.md)

**Current**:
> `#### Step 2: Create Authorization Marker` (line 53)
> `#### Step 3: Apply Changes` (line 68)
> `#### Step 4: Remove Authorization Marker` (line 84)
> `#### Step 5: Update Tracking` (line 88)
> `#### Step 6: Auto-Trigger Verify` (line 102)

**Proposed**:
> `#### Step 3: Create Authorization Marker`
> `#### Step 4: Apply Changes`
> `#### Step 5: Remove Authorization Marker`
> `#### Step 6: Update Tracking`
> `#### Step 7: Auto-Trigger Verify`

**Dependencies**: Change 7 depends on Change 6 (renumbering follows from the insertion).

#### Change 18: Add pre-apply context note to error handling (merge-mode.md)

**Current** (merge-mode.md lines 110-111):
> ```
> **Merge fails mid-way** (e.g., a system doc section referenced by the proposal doesn't
> exist or has changed since the proposal was written):
> ```

**Proposed**:
> ```
> **Merge fails mid-way** (e.g., a system doc section referenced by the proposal doesn't
> exist or has changed since the proposal was written). Pre-apply validation (Step 2) should
> catch most target issues before they reach this point. This error handling covers edge cases
> that validation missed:
> ```

This is a one-sentence addendum. It clarifies the relationship between the new pre-apply
validation and the existing error handling without changing the error handling procedure
itself.

---

### Change Area 3: Ground Truth Re-Check in Re-Review

**What**: Fix the inaccurate Step 2 heading and add Part E "Ground Truth Re-Check" that
verifies corrected claims against actual target files.

**Why**: Research Finding 3 identified that re-review checks whether fixes were attempted
but not whether the corrected claims are accurate. The Guided Autonomy v3→v4 experience
found 9 additional issues in sections that were "fixed" — including new factual errors
introduced by the fix process itself.

**System doc impact**: Change 8 in the Change Manifest.

#### Change 8: Fix heading + Add Part E (re-review-mode.md)

**Current** (re-review-mode.md line 26):
> `### Step 2: Three-Part Analysis`

**Proposed**:
> `### Step 2: Five-Part Analysis`

Note: The current heading says "Three-Part" but the section actually contains four parts
(A, B, C, D). This was likely a heading that wasn't updated when Part D was added. The
proposed heading reflects the accurate count after adding Part E.

**Current** (re-review-mode.md, after Part D: Convergence Tracking, around line 80):
> Part D ends with epsilon thresholds and "Include convergence metrics in the 'Review
> Cycle Health' section of the report."

**Proposed** — insert after Part D:

> #### Part E: Ground Truth Re-Check
>
> Verify ground truth on sections that changed since the last review. This is lighter than
> the initial review's full spot-check — only re-verify what was actually modified.
>
> For each fix that changed a "Current" description or factual claim:
> - Read the actual target file and verify the corrected claim is accurate
>
> For each fix that expanded merge targets (new Change Manifest entries):
> - Verify the new target sections exist in the actual files
>
> For each fix that added new Detailed Design content:
> - Check it doesn't conflict with what already exists in the target file
>
> If no ground truth claims were modified in this fix round:
> `**Part E: Ground Truth Re-Check** — No ground truth claims were modified in this fix
> round. Skipped.`
>
> If claims were verified and all accurate:
> `**Part E: Ground Truth Re-Check** — 3 corrected claims verified against target files.
> All accurate.`
>
> If issues found: summary line with count, then a table of failures using the same format
> as Dimension 7 in the initial review.

**Dependencies**: None — this change is independent of other change areas.

---

### Change Area 4: Code Alignment in Verify and Scope Tightening

**What**: Add Part E "Code Alignment Check" to post-merge verify and add a scope note
to Part A indicating it is now confirmatory rather than discovery-oriented.

**Why**: Research Finding 10 identified that verify checks merged docs against other docs
but never against code — meaning docs can be "verified clean" but describe a system that
doesn't exist. Finding 7 identified that pre-apply validation (Change Area 2) now catches
executability issues that Part A previously had to discover.

**System doc impact**: Changes 9-10 in the Change Manifest.

#### Change 9: Add Part E — Code Alignment Check (verify-mode.md)

Insert after Part D (Collateral Damage):

**Current** (verify-mode.md, after Part D around line 79):
> Part D ends with "Were existing design decisions changed that the proposal didn't intend
> to revisit?"

**Proposed** — insert after Part D:

> #### Part E: Code Alignment Check
>
> Verify that code-related claims in the merged sections still match the actual codebase.
> This uses targeted sync checks — not a full sync scan.
>
> 1. Extract code-related claims from the sections changed by the merge. Focus on:
>    - Existence claims: file paths, module names, dependencies referenced
>    - Structural claims: function signatures, class hierarchies, config shapes
>    Skip behavioral claims (retry logic, rate limits) — those are the domain of standalone
>    sync and implementation verification.
>
> 2. Verify each claim against the actual codebase.
>
> 3. Report findings:
>
> If no code-related claims in merged sections:
> `**Part E: Code Alignment** — No code-related claims in merged sections. Skipped.`
>
> If all in sync:
> `**Part E: Code Alignment** — 4 code claims checked, all in sync.`
>
> If drift found:
>
> | Claim | Source Section | Expected | Actual | Severity |
> |-------|--------------|----------|--------|----------|
> | pgvector dimension | ARCHITECTURE.md §Memory | 768-dim | 1536-dim in schema.sql | Warning |
>
> Code alignment findings are advisory (Warning), not blocking. System docs describe
> intended state, which may legitimately differ from current code during implementation.
> But the finding should be surfaced so the user can decide whether it represents drift
> or intent.

#### Change 10: Add scope note to Part A (verify-mode.md)

**Current** (verify-mode.md line 37-38):
> `#### Part A: Application Completeness`
>
> `Walk through each concrete change the proposal describes and verify it landed in the`
> `correct system doc(s):`

**Proposed**:
> `#### Part A: Application Completeness`
>
> `Walk through each concrete change the proposal describes and verify it landed in the`
> `correct system doc(s). Pre-apply validation (merge Step 2) already confirmed that target`
> `sections exist — this step verifies the changes were actually applied, not just that the`
> `targets were valid.`

**Dependencies**: Change 10 depends on Change 6 (pre-apply validation must exist for the
scope note to make sense).

---

### Change Area 5: Code-Doc Alignment in Spec Waterfall Gate

**What**: Add a 6th check "Code-doc alignment" to the waterfall gate batch table in spec
generation mode.

**Why**: Research Finding 9 identified that the waterfall gate catches pipeline-level
staleness (active research, proposals) but not code-level staleness. If system docs have
drifted from the code, specs generated from those docs will produce tasks that contradict
what already exists.

**System doc impact**: Change 11 in the Change Manifest.

#### Change 11: Add Check 6 to gate batch table (spec-mode.md)

**Current** (spec-mode.md lines 65-73):
> ```
> | Check | Status | Details |
> |-------|--------|---------|
> | Active research | Clear / Warning | [details if warning] |
> | In-flight proposals | Clear / Warning | [details] |
> | Unverified merges | Clear / Warning | [details] |
> | Context freshness | Clear / Advisory | [details] |
> | Transition advisory | Clear / Advisory | [architectural items or gaps if any] |
>
> "Gate check complete. [N issues found / All clear]. Proceed?"
> ```

**Proposed**:
> ```
> | Check | Status | Details |
> |-------|--------|---------|
> | Active research | Clear / Warning | [details if warning] |
> | In-flight proposals | Clear / Warning | [details] |
> | Unverified merges | Clear / Warning | [details] |
> | Context freshness | Clear / Advisory | [details] |
> | Transition advisory | Clear / Advisory | [architectural items or gaps if any] |
> | Code-doc alignment | Clear / Advisory / Warning | [sync check results] |
>
> "Gate check complete. [N issues found / All clear]. Proceed?"
> ```

Insert after the batch table, a description of the new check:

> **Check 6: Code-doc alignment** — Run a lightweight, targeted sync check on the system
> docs that will be used for spec generation. Check structural and technology claims only:
> file paths, dependency names, module structure, export shapes. Skip behavioral claims
> (too expensive for a gate check).
>
> - **Clear**: All checked claims match the codebase
> - **Advisory**: Minor drift detected (e.g., file renamed but logic unchanged) — note and proceed
> - **Warning**: Structural drift detected (e.g., docs describe a module that no longer exists) —
>   suggest running `/cl-reviewer sync` or `/cl-reviewer correct` before proceeding
>
> This is advisory, not blocking. The user can always proceed. But structural drift means
> specs will describe a system that doesn't match reality.

**Dependencies**: None — this change is independent.

---

### Change Area 6: SKILL.md Summary Updates

**What**: Update the mode summary paragraphs in both SKILL.md files to reflect the
enhancements made in Change Areas 1-5.

**Why**: The SKILL.md summaries are what users and the AI read for orientation. They should
accurately describe what each mode does. Without these updates, the summaries would be
misleading — describing 6 dimensions when there are 7, omitting pre-apply validation, etc.

**System doc impact**: Changes 12-15 in the Change Manifest.

#### Change 12: Update Initial Review summary (cl-reviewer/SKILL.md)

**Current** (cl-reviewer/SKILL.md lines 209-215):
> ```
> Initial review gathers context (proposal, manifest, research doc, proposal tracker), analyzes
> across six dimensions (value, internal coherence, external consistency, technical soundness,
> completeness, spec-readiness), checks for cross-proposal conflicts, and produces a review
> file at `docs/reviews/proposals/REVIEW_P-NNN_v1.md` with verdict, blocking issues,
> non-blocking suggestions, consistency map, and risk assessment.
> ```

**Proposed**:
> ```
> Initial review gathers context (proposal, manifest, research doc, proposal tracker),
> spot-checks ground truth (3-5 Change Manifest items verified against actual target files
> and codebase), analyzes across seven dimensions (value, internal coherence, external
> consistency, technical soundness, completeness, spec-readiness, ground truth), checks for
> cross-proposal conflicts, and produces a review file at
> `docs/reviews/proposals/REVIEW_P-NNN_v1.md` with verdict, blocking issues, non-blocking
> suggestions, consistency map, and risk assessment.
> ```

#### Change 13: Update Merge Mode summary (cl-reviewer/SKILL.md)

**Current** (cl-reviewer/SKILL.md lines 260-263):
> ```
> Merge mode is the bridge between an APPROVE verdict and the verify step. It reads the
> proposal's Change Manifest, presents a merge plan for user approval, creates a
> `.pipeline-authorized` marker (operation: merge), applies changes to system docs, removes
> the marker, and auto-triggers verify mode.
> ```

**Proposed**:
> ```
> Merge mode is the bridge between an APPROVE verdict and the verify step. It reads the
> proposal's Change Manifest, presents a merge plan for user approval, runs pre-apply
> validation (confirms target files still match proposal assumptions — auto-proceeds on
> clean, presents impact-assessed report on issues), creates a `.pipeline-authorized` marker
> (operation: merge), applies changes to system docs, removes the marker, and auto-triggers
> verify mode.
> ```

#### Change 14: Update Verify Mode summary (cl-reviewer/SKILL.md)

**Current** (cl-reviewer/SKILL.md lines 233-235):
> ```
> Verify mode runs after a proposal has been approved and the system docs have been updated.
> It checks that the proposal was applied faithfully, that system docs remain consistent with
> each other, and that no collateral damage occurred during the merge.
> ```

**Proposed**:
> ```
> Verify mode runs after a proposal has been approved and the system docs have been updated.
> It checks that the proposal was applied faithfully, that system docs remain consistent with
> each other, that no collateral damage occurred during the merge, and that code-related
> claims in merged sections still match the actual codebase (targeted code alignment check).
> ```

#### Change 15: Update Spec Mode summary (cl-implementer/SKILL.md)

**Current** (cl-implementer/SKILL.md lines 150-156):
> ```
> Generates implementation-ready specs from verified system docs, including `TEST_SPEC.md` —
> a parallel artifact defining test architecture, per-module unit test cases, cross-spec
> integration contracts, and contract tests. Enforces the waterfall gate — specs are
> generated only after all system docs are complete and verified. The spec format adapts
> to the content (OpenAPI for APIs, JSON Schema for data, structured markdown for general).
> Uses subagent dispatch to read all system docs in parallel without overloading the main
> context.
> ```

**Proposed**:
> ```
> Generates implementation-ready specs from verified system docs, including `TEST_SPEC.md` —
> a parallel artifact defining test architecture, per-module unit test cases, cross-spec
> integration contracts, and contract tests. Enforces the waterfall gate — specs are
> generated only after all system docs are complete and verified, with a code-doc alignment
> advisory check to catch drift between docs and codebase before generating specs. The spec
> format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured markdown
> for general). Uses subagent dispatch to read all system docs in parallel without overloading
> the main context.
> ```

**Dependencies**: Changes 12-15 should be applied after all reference file changes (1-11)
are in place, so the summaries reflect the final state.

---

### Change Area 7: Merge Mode Workflow List Update

**What**: Update the numbered workflow list in the Merge Mode section of cl-reviewer/SKILL.md
to include the new pre-apply validation step.

**Why**: The workflow list (lines 265-273) is a quick-reference summary of the merge process.
It needs to match the updated reference file.

**System doc impact**: Change 16 in the Change Manifest.

**Current** (cl-reviewer/SKILL.md lines 265-273):
> ```
> **The workflow:**
> 1. Verify prerequisites (APPROVE verdict exists, no conflicting merges)
> 2. Build merge plan from the proposal's Change Manifest
> 3. Present the plan to the user for approval
> 4. Create `docs/system/.pipeline-authorized` marker (authorizes edits to system docs)
> 5. Apply each change from the Change Manifest to the target system docs
> 6. Remove the marker
> 7. Update tracking (PROPOSAL_TRACKER.md)
> 8. Auto-trigger verify mode
> ```

**Proposed**:
> ```
> **The workflow:**
> 1. Verify prerequisites (APPROVE verdict exists, no conflicting merges)
> 2. Build merge plan from the proposal's Change Manifest
> 3. Present the plan to the user for approval
> 4. Pre-apply validation (confirm targets still match proposal assumptions)
> 5. Create `docs/system/.pipeline-authorized` marker (authorizes edits to system docs)
> 6. Apply each change from the Change Manifest to the target system docs
> 7. Remove the marker
> 8. Update tracking (PROPOSAL_TRACKER.md)
> 9. Auto-trigger verify mode
> ```

### Change Area 8: Merge Advisory Field in Review Template

**What**: Add a `## Merge Advisory` section to the review file template in review-mode.md.
This gives the reviewer a structured mechanism to recommend exhaustive pre-apply validation,
closing the communication gap between the review step and the merge step.

**Why**: The pre-apply validation complexity triggers (Change Area 2) include "User or
reviewer explicitly requests it (e.g., review recommends exhaustive validation)" — but the
review output template has no structured field for this recommendation. Without it, the
recommendation would be buried in blocking issues or non-blocking notes. A dedicated field
makes the signal explicit and easy for merge mode to detect.

**System doc impact**: Change 17 in the Change Manifest.

#### Change 17: Add Merge Advisory section (review-mode.md)

Insert between the Non-Blocking Suggestions section and the Spec-Readiness Notes section
in the review file template:

**Current** (review-mode.md, within the review file template, lines 137-142):
> ```markdown
> ## Non-Blocking Suggestions
>
> Improvements that would strengthen the proposal but aren't required.
> If none, write "No suggestions — the proposal is solid."
>
> ## Spec-Readiness Notes
> ```

**Proposed**:
> ```markdown
> ## Non-Blocking Suggestions
>
> Improvements that would strengthen the proposal but aren't required.
> If none, write "No suggestions — the proposal is solid."
>
> ## Merge Advisory
>
> Recommend exhaustive pre-apply validation: Yes / No
> [If Yes: brief rationale — e.g., "high MODIFY density with imprecise Current descriptions"]
>
> ## Spec-Readiness Notes
> ```

The Merge Advisory section is always present in the template but is lightweight — one line
on most reviews. Merge mode checks this field as an additional complexity signal when
deciding whether to run exhaustive validation.

**Dependencies**: Change 17 relates to Change 6 (merge mode references the reviewer's
recommendation as a complexity trigger).

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Ground truth | Verification of a proposal's factual claims against the actual state of target files and/or codebase — as opposed to evaluating the proposal's reasoning or design quality | review-mode.md (Step 2, Dimension 7), re-review-mode.md (Part E) |
| Doc-to-File | A ground truth check axis: proposal claims vs. actual target file content | review-mode.md (Dimension 7 Type column) |
| Doc-to-Code | A ground truth check axis: system doc claims vs. actual codebase state | review-mode.md (Dimension 7 Type column), verify-mode.md (Part E), spec-mode.md (Check 6) |
| Pre-apply validation | The step between merge plan approval and change application that confirms targets still match the proposal's assumptions | merge-mode.md (Step 2), cl-reviewer/SKILL.md (Merge Mode summary) |
| Impact on Change | The assessed effect of target drift on the specific proposed change (HIGH/LOW/Missing) — what would happen if the change were applied to the current state | merge-mode.md (Step 2 validation report) |
| Targeted sync | A lightweight invocation of sync mode's claim-extraction and verification pattern, scoped to specific claims rather than a full scan | review-mode.md (Step 2), verify-mode.md (Part E), spec-mode.md (Check 6) |
| Complexity signals | Measurable properties of a proposal that indicate higher risk and warrant deeper validation (manifest size, MODIFY density, review round count, multi-file targeting) | merge-mode.md (Step 2 exhaustive trigger) |

### Migration

No migration needed. These changes add new steps and sections to existing reference files.
Existing proposals in progress will benefit from the enhanced checks on their next review
or merge. No backward compatibility issues — the additions are purely additive.

### Integration Points

- **Sync mode** is invoked conceptually (its claim-extraction and verification pattern is
  referenced) but not modified. If sync mode's internal structure changes later, the
  lifecycle integrations describe the pattern ("extract claims, verify against code,
  categorize results") rather than calling specific sync internals. This keeps the
  integration resilient to sync refactoring.

- **Fix mode** is unchanged. When fix mode corrects a proposal and auto-triggers re-review,
  the re-review will now include Part E (Ground Truth Re-Check). Fix mode doesn't need to
  know about this — it's a re-review concern.

- **Correction mode** is unchanged. Corrections bypass the review/merge pipeline entirely.

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Ground truth is always-on (3-5 items), not complexity-gated | Only spot-check complex proposals | Even small proposals can have ground truth errors (the cost of 3-5 reads is too low to skip). Research Decision 2. |
| Pre-apply validation lives in merge mode, not review mode | Run validation at review time | Review-time validation could go stale if merge is delayed. Validation needs to run at the moment targets are about to be modified. Research Decision 3. |
| Pre-apply auto-proceeds on clean pass (no user gate) | Always prompt user for validation results | A mandatory prompt on clean merges violates "must not increase baseline cost." The gate exists to catch problems, not to add ceremony. Research Decision 10. |
| Impact-assessed user decision, not automatic blocking | Stale targets auto-block, ambiguous auto-warn | A "Stale" label alone doesn't tell the user whether proceeding is safe. The impact assessment (HIGH/LOW/Missing) gives the user enough context to decide. Research Decision 12. |
| Re-review gets lighter Part E, not full spot-check | Run the full 3-5 item spot-check on every re-review | Re-review has the cumulative ledger with Dimension 7 results from the initial review. Part E only re-verifies what changed. Research Decision 11. |
| Targeted sync, not full sync, at lifecycle points | Run full sync at review, verify, and spec generation | Full sync is too expensive for lifecycle integration. Each step checks only claims related to its scope. Research Decision 7. |
| Sync logic invoked, not duplicated | Copy sync logic into each mode | Sync mode already has well-designed claim extraction. Lifecycle steps describe the pattern. One source of truth. Research Decision 6. |
| All new outputs follow three-tier progressive disclosure | Ad-hoc output format per recommendation | Without unified format, 7 new checks produce 7 different output styles. Cognitive load scales with format variety. Research Decision 9. |
| Dimension 7 always shows summary line on clean pass | Suppress entirely when no findings | Consistent with dimensions 1-6, which always appear. Builds trust in the new check. Research Decision 14. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Ground truth spot-check adds cost to every review | High (it will) | Low (3-5 reads) | Fixed cost. ROI from Guided Autonomy case was 19 errors caught. |
| Complexity triggers too sensitive → exhaustive runs too often | Medium | Medium | Start with conservative thresholds (12+ items, 50%+ MODIFY, 3+ rounds). Document in reference file for tuning. |
| Pre-apply validation makes merge mode longer | High | Low | Self-contained step. Auto-proceeds on clean. User's time impact is one line on happy path. |
| Code sync checks slow down reviews | Medium | Medium | Targeted (only code claims in spot-checked items). A few greps, not a full scan. |
| Sync advisory in waterfall gate creates false positives | Medium | Low | Advisory, not blocking. Structural claims only. User can proceed. |
| Verification output becomes noisy on happy path | Medium | Medium | Quiet-on-success: clean passes compress to one summary line. No tables, no prompts when everything passes. |
| Part A scope note in verify creates confusion about verify's role | Low | Low | The scope note is additive — it explains that verify's completeness check is now confirmatory, not that it does less. Verify still checks every manifest item. |

## Open Items

None — all open questions from the research were resolved before proposal generation
(see Research Decision Log entries 11-14).

## Appendix: Research Summary

R-001 analyzed the cl-reviewer pipeline's verification coverage across 11 findings and
3 axes:

- **Doc-to-Doc** (proposal ↔ system docs consistency): Well covered by existing 6 dimensions.
  No changes needed.
- **Doc-to-File** (proposal claims ↔ actual target files): Complete blind spot. Findings 1-7
  identified that no pipeline step reads target files to verify the proposal's factual claims.
  The Guided Autonomy case study (23 changes, 25+ files, 4 review rounds) found 19 ground
  truth errors — 9 critical, 10 moderate — invisible to dimensional analysis.
- **Doc-to-Code** (system doc claims ↔ actual codebase): Sync mode exists but is disconnected
  from the lifecycle. Findings 8-10 identified that sync is never invoked by review, merge,
  verify, or spec generation. Code drift accumulates silently.

Finding 11 identified that all 7 recommendations add verification output without specifying
the UX. The UX design principle "quiet on success, loud on failure" was added to ensure the
happy path cost is ~5 summary lines across the entire lifecycle with zero new decision points.

The research resolved 4 open questions through 6 discussion rounds, covering spot-check
scope in re-reviews (lighter Part E), pre-apply blocking behavior (impact-assessed user
decision), sync claim-type depth (concrete list per integration point), and output
suppression on clean pass (always show summary line).

Full research: docs/research/R-001-VERIFICATION_GAPS.md
