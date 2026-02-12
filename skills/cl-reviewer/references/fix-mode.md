## Fix Mode

Fix mode helps the user address blocking issues identified in a proposal review. Instead of
the user reading a review and figuring out what to change themselves, fix mode reads the
review, explains each issue in context, suggests specific edits, and applies them to the
proposal. After all fixes are applied, it auto-triggers a re-review.

### When to Use

Fix mode triggers when:
- The user says "fix the proposal", "address the review issues", "fix blocking issues",
  "help me fix P-NNN"
- The user asks for help resolving review feedback on a proposal
- A review with verdict NEEDS REWORK or APPROVE WITH CHANGES exists and the user wants
  to address the issues

### Prerequisites

1. **A proposal exists** — Read the proposal file from `docs/proposals/`
2. **A review exists** — At least one `REVIEW_P-NNN_v*.md` in `docs/reviews/proposals/`
3. **The review has blocking issues** — If the latest review is APPROVE with no blocking
   issues, there's nothing to fix. Tell the user: "The latest review is APPROVE — no
   blocking issues to fix. Ready for merge."

### Process

#### Step 1: Read the Review and Proposal

1. Read the latest review file (`REVIEW_P-NNN_v[highest].md`)
2. Read the proposal file
3. Extract all **Blocking Issues** from the review — these are the items that must be
   resolved before the proposal can be approved

#### Step 2: Present the Issues

For each blocking issue, present it to the user with context:

```
## Blocking Issue #1: [Title from review]

**Dimension**: [which review dimension — value, coherence, consistency, etc.]
**Where in proposal**: [section/line reference]
**The issue**: [what the reviewer found]
**Why it matters**: [impact on the system]

**Suggested fix**: [your specific suggestion for how to edit the proposal to resolve this]
```

After presenting all issues, ask: "I'll apply these fixes to the proposal. Want me to
proceed with all of them, or do you want to discuss any first?"

#### Step 3: Apply Fixes

For each approved fix:
1. Read the relevant section of the proposal
2. Apply the edit — this modifies the proposal file in `docs/proposals/`, NOT system docs
3. No hook bypass needed — proposals aren't protected

Keep fixes focused on the blocking issue. Don't restructure the proposal, don't add new
content beyond what's needed to resolve the issue, and don't change things the review
didn't flag.

#### Step 4: Summary and Re-Review

After all fixes are applied:
1. Summarize what was changed: "Applied [N] fixes to P-NNN: [brief list]"
2. Tell the user: "Proposal updated. Running re-review to check the fixes and scan for
   regressions."
3. Auto-trigger re-review mode (see `references/re-review-mode.md`)

### Non-Blocking Suggestions

The review may also have **Non-Blocking Suggestions**. These are improvements that aren't
required for approval. During fix mode:

- Present them separately from blocking issues
- Ask the user if they want to address any of them while we're editing
- If yes, include them in the fix batch
- If no, they can be ignored — the proposal can still be approved without them

### Edge Cases

**Review has both blocking and non-blocking items**: Present blocking items first with a
clear header, then non-blocking suggestions separately. Don't mix them.

**Multiple review rounds exist**: Always use the LATEST review. Previous reviews' blocking
issues may already be resolved. The latest review's issue list is the current state.

**User disagrees with a blocking issue**: If the user says "that's not actually a problem",
don't apply the fix. Instead, note it as a discussion point — the re-review will assess
whether the reviewer's concern was valid. The user can add a rationale to the proposal
explaining why they disagree.

**Fix introduces a new problem**: If while fixing issue A you notice the fix creates a
tension with another part of the proposal, flag it to the user before applying. Don't
silently introduce new issues.
