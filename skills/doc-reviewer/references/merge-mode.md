## Merge Mode

Merge mode is the missing link between an APPROVE verdict and the verify step. When a
proposal is approved, someone still needs to actually apply the changes to system docs.
That's what merge mode does — guided by the proposal's Change Manifest, with the protection
hook temporarily authorized.

### When to Use

Merge mode triggers when:
- The user says "merge", "apply this proposal", "apply to system docs", "update system docs
  from proposal", "merge P-NNN"
- A proposal has an APPROVE or APPROVE WITH CHANGES verdict in its latest review, and the
  user approves updating system docs

### Prerequisites

Before merging, verify:
1. **The proposal exists** — Read the proposal file from `docs/proposals/`
2. **An APPROVE verdict exists** — Read the latest `REVIEW_P-NNN_v*.md` in
   `docs/reviews/proposals/`. The verdict must be APPROVE or APPROVE WITH CHANGES.
3. **APPROVE WITH CHANGES conditions are met** — If the verdict was APPROVE WITH CHANGES,
   check that the specified changes have been made to the proposal since the review.
4. **No conflicting merges** — Check `docs/PROPOSAL_TRACKER.md` for other proposals with
   status `merging`. Only one merge should be in progress at a time.

If prerequisites aren't met, tell the user what's missing and suggest the right action
(e.g., "This proposal hasn't been reviewed yet. Run `/doc-reviewer review` first.").

### Process

#### Step 1: Build the Merge Plan

Read the proposal's **Change Manifest** — the table that maps each change to its target
system doc, section, and change type. This is your execution plan.

Present the plan to the user:

```
I'll apply these changes from P-NNN to the system docs:

| # | Change | Target Doc | Section | Type |
|---|--------|-----------|---------|------|
| 1 | [description] | [doc] | [section] | Modify |
| 2 | [description] | [doc] | (new) [section] | Add Section |
| ... | ... | ... | ... | ... |

This will modify [N] files and add [M] new sections. Approve?
```

Wait for explicit user approval before proceeding.

#### Step 2: Create Authorization Marker

Write the marker file at `docs/system/.pipeline-authorized`:

```
operation: merge
source: P-NNN-slug.md
authorized_by: user
timestamp: [ISO 8601]
```

This tells the PreToolUse hook to allow edits to `docs/system/` files.

#### Step 3: Apply Changes

Walk through each row of the Change Manifest and apply the change to the target system doc:

- **Modify**: Read the target section, apply the proposed changes. Preserve existing
  content that isn't being changed. Don't paraphrase — use the proposal's wording.
- **Add Section**: Insert the new section at the appropriate location in the target doc.
  Add cross-references from other docs as specified in the proposal.
- **Add Doc**: Create the new doc at the specified path. Add cross-references from
  existing docs as specified in the proposal.
- **Remove**: Delete the specified content. Update any cross-references that pointed to it.
- **Restructure**: Follow the proposal's restructuring plan. This is the most complex
  type — read the proposal carefully for the exact steps.

**Important**: Apply changes faithfully from the proposal. Don't improve, rephrase, or
editorialize. The proposal has already been through review — the merge is mechanical.

#### Step 4: Remove Authorization Marker

Delete `docs/system/.pipeline-authorized`. The window for system doc edits is closed.

#### Step 5: Update Tracking

1. Update `docs/PROPOSAL_TRACKER.md` — set status to `merged`, record merge date
2. **Propagate design decisions** — If the proposal's Design Decisions section includes
   architectural choices (technology selections, pattern decisions, tradeoff resolutions),
   log a Decision entry for each in `docs/DECISIONS.md` with Pipeline Phase `proposal`,
   Source the proposal ID and section
3. If any merge conflicts were resolved (existing text kept over proposed, or vice versa),
   log a Decision entry in `docs/DECISIONS.md` with the conflict context, options, and
   rationale for resolution
4. Tell the user: "Proposal P-NNN merged into system docs. Running post-merge verification."

#### Step 6: Auto-Trigger Verify

Immediately transition to verify mode. Read `references/verify-mode.md` and run the full
verification process. The user doesn't need to separately invoke `/doc-reviewer verify` —
it runs as part of the merge flow.

### Error Handling

**Merge fails mid-way** (e.g., a system doc section referenced by the proposal doesn't
exist or has changed since the proposal was written):

1. Stop applying changes
2. Do NOT remove the marker yet — partial changes have been made
3. Tell the user what happened: "Change #N couldn't be applied because [reason].
   Changes 1 through N-1 were applied. Options: fix the issue and continue, or
   revert the partial changes."
4. If the user wants to continue: fix the issue and resume
5. If the user wants to revert: undo the applied changes, then remove the marker

**Marker already exists** when merge starts:

This means a previous operation (merge, bootstrap, or correct) didn't clean up. Read the
existing marker to understand what happened:
- If it's a stale merge marker for the same proposal, the previous merge may have crashed.
  Ask the user: "A merge marker already exists for P-NNN. A previous merge may have been
  interrupted. Should I check what was applied and finish, or start fresh?"
- If it's a marker for a different operation, warn the user and don't proceed until the
  existing operation is resolved.

### Safety Rails

- **One merge at a time.** Don't start a merge if another is in progress.
- **User approves the plan.** The merge plan is presented before any edits happen.
- **Marker is temporary.** It exists only during the merge. Clean up immediately after.
- **Verify catches mistakes.** Even if the merge is imperfect, the auto-triggered verify
  step will catch fidelity issues, cross-doc inconsistencies, and collateral damage.
- **Changes are faithful.** The proposal's Change Manifest is the contract. Don't deviate.
