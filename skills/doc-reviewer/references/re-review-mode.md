## Re-Review Mode

Re-review runs after the user has had the AI fix issues from a previous review. The proposal
file and folder structure haven't changed — only the content of the proposal has been updated.
Your job is to verify fixes landed correctly AND that the fix process didn't introduce new
problems.

### Step 1: Load Review History

1. **Find all previous reviews** — Read every `REVIEW_P-NNN_v*.md` file in
   `docs/reviews/proposals/`, ordered by version number. Dispatch subagents to read these
   in parallel if there are multiple.

2. **Build a cumulative issue ledger** — Collect every blocking issue and non-blocking
   suggestion from ALL previous reviews into a single checklist. This is critical: you're
   not just checking against the last review, you're checking against every issue ever raised.
   Fixes for issue A sometimes silently revert or break issue B from an earlier review.

3. **Read the updated proposal** — Read the current version of the proposal doc. Its
   embedded System Context and Change Manifest provide most of the system context you need.

4. **Read the system doc manifest** — Read `docs/system/.manifest.md` for the document
   index. Only deep-read individual system docs if you need to verify something specific
   that the proposal's context doesn't cover.

### Step 2: Three-Part Analysis

#### Part A: Issue Resolution Check

Go through every item in the cumulative issue ledger:

- **Fixed** — The issue has been addressed. Note how.
- **Partially fixed** — The spirit of the fix is there but the execution is incomplete.
  Explain what's still missing.
- **Not fixed** — The issue persists unchanged.
- **Regressed** — The issue was fixed in an earlier version but has re-emerged, possibly
  as a side-effect of fixing something else. This is the most important category to catch.

#### Part B: Regression Scan

Independently of the issue ledger, scan the updated proposal for NEW issues that weren't
present in the version that was last reviewed. Fixes have a tendency to:

- Introduce internal contradictions (fixing Section 3 breaks consistency with Section 7)
- Shift terminology in the fixed section without updating the rest of the doc
- Over-correct, removing nuance that was actually important
- Add complexity that wasn't in the original review scope
- Break external consistency — the original proposal was consistent with system docs,
  but the fix introduced a new conflict

Use the same five dimensions from the initial review (value, internal coherence, external
consistency, technical soundness, completeness) but focus specifically on areas that changed.

#### Part C: External Consistency Recheck

Even if the initial review found no external consistency issues, re-verify against system
docs. The proposal's content has changed, so the consistency map needs to be rebuilt.

### Step 3: Produce the Re-Review File

Determine the next version number by finding the highest existing `_v*.md` and incrementing.
For example, if `_v1.md` and `_v2.md` exist, create `_v3.md`.

```
docs/reviews/proposals/REVIEW_P-NNN_v[N].md
```

Use this structure:

```markdown
# Re-Review: [Proposal Name] (v[N])

**Reviewed**: [date]
**Proposal**: docs/proposals/P-NNN-slug.md
**Previous reviews**: [list of all previous review files]
**System docs referenced**: [list of system docs read]
**Review cycle**: [N] (this is re-review #[N-1])

## Summary

One paragraph: what changed since the last review and overall trajectory — is the proposal
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

If none: "No new issues introduced — the fixes were clean."

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

### Step 4: Update Tracking

After writing the review file:
1. Update `docs/PROPOSAL_TRACKER.md` — increment the review round count, update status

After writing the file, tell the user where it is, summarize the verdict, and call out
any regressions — those are the highest-priority items since they indicate the fix loop
is fighting itself.
