# Review: Verification Gap Closure

**Reviewed**: 2026-02-15
**Proposal**: docs/proposals/VERIFICATION_GAPS.md
**System docs referenced**: cl-reviewer/SKILL.md, cl-reviewer/references/review-mode.md, cl-reviewer/references/merge-mode.md, cl-reviewer/references/re-review-mode.md, cl-reviewer/references/verify-mode.md, cl-implementer/SKILL.md, cl-implementer/references/spec-mode.md
**Research doc**: docs/research/R-001-VERIFICATION_GAPS.md

## Summary

This proposal enhances 7 existing skill files to close three categories of verification
blind spots: doc-to-file (ground truth checking), pre-apply validation (merge safety), and
doc-to-code (sync integration). The 15-item Change Manifest is thorough, the Detailed Design
includes accurate Current/Proposed diffs for every change, and the UX design (quiet on
success, loud on failure) is well-considered. The proposal faithfully represents its research
and makes deliberate decisions about scope, complexity thresholds, and output formatting. One
manifest completeness issue needs fixing; everything else is solid.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Change Manifest missing the workflow list update

- **Dimension**: Ground Truth / Completeness
- **Where**: Change Manifest (Change 13) vs. Detailed Design (Change Area 7)
- **Issue**: The Detailed Design includes a "Change Area 7: Merge Mode Workflow List Update"
  that modifies the numbered workflow list in cl-reviewer/SKILL.md (lines 265-273). But the
  Change Manifest only has 15 items, and Change 13 ("Update Merge Mode summary to reference
  pre-apply validation") targets the "Merge Mode section" — which the proposal interprets as
  the summary paragraph at lines 260-263. The workflow list at lines 265-273 is a separate
  block with different content.

  The proposal acknowledges this: "Part of Change 13 scope but called out separately for
  merge precision." But the Change Manifest is the merge contract — if someone applies it
  mechanically, Change 13's description ("Update Merge Mode summary") would not naturally
  encompass a numbered workflow list. The Detailed Design catches it, but the manifest
  should be self-sufficient.
- **Why it matters**: The Change Manifest is what merge mode uses to verify every change
  was applied. A change described only in the Detailed Design but not in the manifest
  could be missed during merge and would fail the verify step's Application Completeness
  check.
- **Suggestion**: Either (a) add a Change 16 to the manifest for the workflow list update,
  or (b) expand Change 13's description to explicitly mention both the summary paragraph
  and the workflow list. Option (a) is cleaner — it keeps each manifest row scoped to one
  discrete change.

## Non-Blocking Suggestions

### 1. Reviewer-recommended validation input mechanism

The pre-apply validation complexity triggers include "User or reviewer explicitly requests
it (e.g., review recommends exhaustive validation)" — but the review output template
(review-mode.md) doesn't have a structured field for this recommendation. How would the
reviewer signal this? Currently it would be buried in a blocking issue or note. Consider
adding a one-line field to the review output template, e.g.:

```
## Merge Advisory
Recommend exhaustive pre-apply validation: Yes / No
```

This emerged concept was flagged in the research as "Include in proposal — add to review
report format" but wasn't carried into the proposal. Not blocking because the reviewer can
always write it informally, but a structured field would be more reliable.

### 2. Merge-mode error handling could reference pre-apply

The error handling section in merge-mode.md (lines 109-129) describes recovery from
"a system doc section referenced by the proposal doesn't exist or has changed since the
proposal was written." With pre-apply validation in place, this scenario should normally
be caught before it becomes a mid-merge error. The error handling section doesn't need to
change, but a brief note like "Pre-apply validation (Step 2) should catch most target
issues before they reach this point. This error handling covers edge cases that validation
missed." would clarify the relationship.

### 3. Minor line number inaccuracies in ground truth references

Two Change Manifest items have line references that are off by 2:
- Change 7 says `#### Step 2: Create Authorization Marker` is at line 55 in merge-mode.md;
  actual is line 53.
- Change 15 says the spec mode summary starts at line 148 in cl-implementer/SKILL.md;
  the quoted text starts at line 150 (line 148 is `Read references/spec-mode.md`).

These won't affect merge execution since the heading text is correct and unique (the merge
applies by content matching, not line numbers). But they should be corrected for accuracy.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| cl-reviewer/SKILL.md | Consistent | Summary updates accurately reflect reference file changes |
| cl-reviewer/references/review-mode.md | Consistent | New Step 2 and Dimension 7 integrate naturally into existing structure |
| cl-reviewer/references/merge-mode.md | Consistent | Pre-apply validation fits between plan and apply without disrupting the existing flow |
| cl-reviewer/references/re-review-mode.md | Consistent | Part E follows naturally from Parts A-D; heading fix corrects a pre-existing inaccuracy |
| cl-reviewer/references/verify-mode.md | Consistent | Part E and scope note are additive; existing Parts A-D unchanged |
| cl-implementer/SKILL.md | Consistent | Summary update is minimal and accurate |
| cl-implementer/references/spec-mode.md | Consistent | New table row follows existing format; description is proportional |
| cl-reviewer/references/sync-mode.md | Consistent | Not modified; sync pattern is invoked, not duplicated |
| cl-reviewer/references/fix-mode.md | Consistent | Not modified; fix auto-triggers re-review which now includes Part E |

## Strengths

- **Precise scope control.** 15 changes across 7 files, no new modes, no new files. The
  proposal enhances what exists rather than adding complexity. This is hard to do well.

- **UX design is first-class.** Most verification proposals focus on what to check and ignore
  what the user sees. The three-tier progressive disclosure pattern and per-recommendation
  UX specifications ensure the happy path stays clean. The aggregate impact table
  (Current vs. Enhanced experience per pipeline step) makes the cost transparent.

- **Impact-assessed validation report.** The decision to show HIGH/LOW/Missing impact
  instead of automatic blocking is nuanced. It respects user agency while providing
  enough context for informed decisions.

- **Research traceability.** Every change traces to a research finding. Every design
  decision traces to a research decision log entry. The research-to-proposal lineage is
  complete.

- **Correct Current/Proposed diffs.** Ground truth spot-check confirmed the proposal's
  claims about current file state are accurate (content-wise). The diffs are precise enough
  for mechanical merge execution.

## Risk Assessment

The main risk is that "targeted sync checks" at lifecycle integration points (review,
verify, spec gate) are described as a pattern to follow rather than a concrete mechanism.
Sync mode is a standalone mode with its own invocation — it's not structured as a callable
library. The proposal acknowledges this in the Emerged Concepts ("Sync mode as a library
pattern — defer"). In practice, the reviewer/verifier will need to independently extract
claims and check them against code, following sync's pattern but not calling sync directly.
This works but may lead to inconsistent implementation depth across the three integration
points. The mitigation (concrete claim-type list per integration point) helps, but the risk
of drift between the pattern implementations is real. This is a known, accepted risk per
Research Decision 6 — flagging for awareness, not as a blocking concern.

No other unaddressed risks identified.
