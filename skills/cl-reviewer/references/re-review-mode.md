---
mode: re-review
tier: structured
depends-on:
  - review-mode.md
state-files:
  - docs/PROPOSAL_TRACKER.md
  - docs/DECISIONS.md
---

## Re-Review Mode

Re-review runs after the user has had the AI fix issues from a previous review. The proposal
file and folder structure haven't changed -- only the content of the proposal has been updated.
Your job is to verify fixes landed correctly AND that the fix process didn't introduce new
problems.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Previous reviews | `docs/reviews/proposals/REVIEW_P-NNN_v*.md` | Yes | All prior review files for the proposal |
| Proposal file | `docs/proposals/P-NNN-slug.md` | Yes | The updated proposal being re-reviewed |
| System doc manifest | `docs/system/.manifest.md` | Yes | Document index for cross-referencing |
| System docs | `docs/system/` | No | Individual docs for targeted deep-reads |
| DECISIONS.md | `docs/DECISIONS.md` | No | Epsilon thresholds for convergence tracking |
| Review output path | `docs/reviews/proposals/REVIEW_P-NNN_v[N].md` | Yes | Where the re-review file is written |

## Workflow

### Phase 1: Load Review History

1. **Find all previous reviews** -- Read every `REVIEW_P-NNN_v*.md` file in
   `docs/reviews/proposals/`, ordered by version number. Dispatch subagents to read these
   in parallel if there are multiple.

   **Result protocol**: Subagents report using the Structured Agent Result Protocol, type:
   `digest`. Load the protocol prompt template from
   `skills/cl-reviewer/references/agent-result-protocol.md` Phase 6 and include it in each
   subagent's Task prompt. Parse the RESULT summary line from each response for status
   classification and aggregation.

2. **Build a cumulative issue ledger** -- Collect every blocking issue and non-blocking
   suggestion from ALL previous reviews into a single checklist. This is critical: you're
   not just checking against the last review, you're checking against every issue ever raised.
   Fixes for issue A sometimes silently revert or break issue B from an earlier review.

3. **Read the updated proposal** -- Read the current version of the proposal doc. Its
   embedded System Context and Change Manifest provide most of the system context you need.

4. **Read the system doc manifest** -- Read `docs/system/.manifest.md` for the document
   index. Only deep-read individual system docs if you need to verify something specific
   that the proposal's context doesn't cover.

**Verify**: All previous reviews loaded. Cumulative issue ledger built. Updated proposal read.

**On failure**: If no previous reviews exist, stop and tell the user to run initial review first.

### Phase 2: Five-Part Analysis

5. **Part A: Issue Resolution Check** -- Go through every item in the cumulative issue ledger:
   - **Fixed** -- The issue has been addressed. Note how.
   - **Partially fixed** -- The spirit of the fix is there but the execution is incomplete.
     Explain what's still missing.
   - **Not fixed** -- The issue persists unchanged.
   - **Regressed** -- The issue was fixed in an earlier version but has re-emerged, possibly
     as a side-effect of fixing something else. This is the most important category to catch.

**Verify**: Every item in the cumulative ledger has a status assigned.

6. **Part B: Regression Scan** -- Independently of the issue ledger, scan the updated proposal for NEW issues that weren't
   present in the version that was last reviewed. Fixes have a tendency to:
   - Introduce internal contradictions (fixing Section 3 breaks consistency with Section 7)
   - Shift terminology in the fixed section without updating the rest of the doc
   - Over-correct, removing nuance that was actually important
   - Add complexity that wasn't in the original review scope
   - Break external consistency -- the original proposal was consistent with system docs,
     but the fix introduced a new conflict

   Use the same five dimensions from the initial review (value, internal coherence, external
   consistency, technical soundness, completeness) but focus specifically on areas that changed.

7. **Part C: External Consistency Recheck** -- Even if the initial review found no external consistency issues, re-verify against system
   docs. The proposal's content has changed, so the consistency map needs to be rebuilt.

8. **Part D: Convergence Tracking** -- At each re-review round, compute:
   1. Raw blocking issue count
   2. Severity-weighted sum of all unresolved blocking issues (Critical=4, Major=2, Minor=1)
   3. Contraction ratio (this round's weighted sum / previous round's weighted sum)

   If contraction ratio > 1: "Review round [N] found MORE issues than round [N-1].
   Fixes may be destabilizing other parts."

   After round 3: "Is the problem with the proposal, or the process that produced it?"

   Epsilon thresholds -- compare the severity-weighted sum against the intent threshold
   (from DECISIONS.md). If at or below threshold, the proposal qualifies for APPROVE
   even with remaining minor issues. This supplements (does not replace) the existing
   verdict criteria -- the reviewer still assesses all dimensions, but epsilon provides
   a quantitative minimum bar calibrated to project intent:
   - Ship: severity-weighted sum <= 4 (e.g., up to 2 minor issues or 1 major)
   - Quality: severity-weighted sum <= 2 (at most 2 minor issues)
   - Rigor: severity-weighted sum = 0 (all blocking issues must be resolved)

   Include convergence metrics in the "Review Cycle Health" section of the report.

9. **Part E: Ground Truth Re-Check** -- Verify ground truth on sections that changed since the last review. This is lighter than
   the initial review's full spot-check -- only re-verify what was actually modified.

   For each fix that changed a "Current" description or factual claim:
   - Read the actual target file and verify the corrected claim is accurate

   For each fix that expanded merge targets (new Change Manifest entries):
   - Verify the new target sections exist in the actual files

   For each fix that added new Detailed Design content:
   - Check it doesn't conflict with what already exists in the target file

   If no ground truth claims were modified in this fix round:
   `**Part E: Ground Truth Re-Check** -- No ground truth claims were modified in this fix
   round. Skipped.`

   If claims were verified and all accurate:
   `**Part E: Ground Truth Re-Check** -- 3 corrected claims verified against target files.
   All accurate.`

   If issues found: summary line with count, then a table of failures using the same format
   as Dimension 7 in the initial review.

**Verify**: All five parts completed. Convergence metrics computed.

### Phase 3: Produce the Re-Review File

10. Determine the next version number by finding the highest existing `_v*.md` and incrementing.
    For example, if `_v1.md` and `_v2.md` exist, create `_v3.md`.

    ```
    docs/reviews/proposals/REVIEW_P-NNN_v[N].md
    ```

11. Use this structure:

    ```markdown
    # Re-Review: [Proposal Name] (v[N])

    **Reviewed**: [date]
    **Proposal**: docs/proposals/P-NNN-slug.md
    **Previous reviews**: [list of all previous review files]
    **System docs referenced**: [list of system docs read]
    **Review cycle**: [N] (this is re-review #[N-1])

    ## Summary

    One paragraph: what changed since the last review and overall trajectory -- is the proposal
    improving, stalling, or drifting?

    ## Verdict: [APPROVE | APPROVE WITH CHANGES | NEEDS REWORK]

    ## Issue Resolution

    ### From v[N-1] Review:

    | # | Issue | Status | Notes |
    |---|-------|--------|-------|
    | 1 | [issue title] | Fixed / Partial / Not Fixed / Regressed | Brief note |
    | 2 | ... | ... | ... |

    ### From Earlier Reviews (if any unresolved):

    | # | Originally Raised In | Issue | Status | Notes |
    |---|---------------------|-------|--------|-------|
    | 1 | v1 | [issue] | Fixed / Partial / Not Fixed / Regressed | ... |

    ## New Issues Found

    Issues that were NOT present in the previously reviewed version. These were introduced
    by the fix process itself.

    If none: "No new issues introduced -- the fixes were clean."

    ### [Issue Title]
    - **Dimension**: Which of the five dimensions
    - **Where**: Section or line reference
    - **Issue**: What's wrong
    - **Likely cause**: Which fix probably introduced this
    - **Suggestion**: How to fix it

    ## Regressions

    Issues that were previously fixed but have re-emerged. If none: "No regressions detected."

    ### [Regression Title]
    - **Originally fixed in**: v[X]
    - **Re-emerged in**: This version
    - **What happened**: How the regression likely occurred
    - **Suggestion**: How to fix without re-breaking the earlier fix

    ## Consistency Map

    | System Doc | Status | Notes |
    |------------|--------|-------|
    | [doc name] | Consistent / Tension / Conflict | ... |
    | ... | ... | ... |

    ## Review Cycle Health

    Brief assessment of how the review loop is going:
    - Is the proposal converging toward approval or oscillating?
    - Are fixes introducing as many issues as they resolve?
    - Is the scope creeping through the fix cycle?
    - Recommendation: continue iterating, step back and rethink, or approve.
    ```

**Verify**: Re-review file written with correct version number and all required sections.

### Phase 4: Update Tracking

12. Update `docs/PROPOSAL_TRACKER.md` -- increment the review round count, update status.

**Verify**: Tracker updated with incremented review round.

13. After writing the file, tell the user where it is, summarize the verdict, and call out
    any regressions -- those are the highest-priority items since they indicate the fix loop
    is fighting itself.

## Report

Output: Re-review file at `docs/reviews/proposals/REVIEW_P-NNN_v[N].md`

### On success
```
RE-REVIEW: APPROVE | Fixed: N/N | Regressions: 0
```
or
```
RE-REVIEW: NEEDS FIXES | Remaining: N
```

### On failure
```
RE-REVIEW: FAILED | Reason: [reason]
```
