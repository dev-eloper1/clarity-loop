---
mode: merge
tier: structured
depends-on:
  - verify-mode.md
state-files:
  - docs/PROPOSAL_TRACKER.md
  - docs/DECISIONS.md
  - .pipeline-authorized
---

## Merge Mode

Merge mode is the missing link between an APPROVE verdict and the verify step. When a
proposal is approved, someone still needs to actually apply the changes to system docs.
That's what merge mode does -- guided by the proposal's Change Manifest, with the protection
hook temporarily authorized.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Proposal file | `docs/proposals/P-NNN-slug.md` | Yes | The approved proposal containing the Change Manifest |
| Latest review | `docs/reviews/proposals/REVIEW_P-NNN_v*.md` | Yes | Must have APPROVE or APPROVE WITH CHANGES verdict |
| Proposal tracker | `docs/PROPOSAL_TRACKER.md` | Yes | Check for conflicting merges and update status |
| Target system docs | `docs/system/` | Yes | The files being modified |
| Authorization marker | `.pipeline-authorized` (project root) | Yes | Created during merge, removed after |
| DECISIONS.md | `docs/DECISIONS.md` | No | Log design decisions and conflict resolutions |

### When to Use

Merge mode triggers when:
- The user says "merge", "apply this proposal", "apply to system docs", "update system docs
  from proposal", "merge P-NNN"
- A proposal has an APPROVE or APPROVE WITH CHANGES verdict in its latest review, and the
  user approves updating system docs

### Prerequisites

Before merging, verify:
1. **The proposal exists** -- Read the proposal file from `docs/proposals/`
2. **An APPROVE verdict exists** -- Read the latest `REVIEW_P-NNN_v*.md` in
   `docs/reviews/proposals/`. The verdict must be APPROVE or APPROVE WITH CHANGES.
3. **APPROVE WITH CHANGES conditions are met** -- If the verdict was APPROVE WITH CHANGES,
   check that the specified changes have been made to the proposal since the review.
4. **No conflicting merges** -- Check `docs/PROPOSAL_TRACKER.md` for other proposals with
   status `merging`. Only one merge should be in progress at a time.

If prerequisites aren't met, tell the user what's missing and suggest the right action
(e.g., "This proposal hasn't been reviewed yet. Run `/cl-reviewer review` first.").

## Workflow

### Phase 1: Build the Merge Plan

1. Read the proposal's **Change Manifest** -- the table that maps each change to its target
   system doc, section, and change type. This is your execution plan.

2. Present the plan to the user:

   ```
   I'll apply these changes from P-NNN to the system docs:

   | # | Change | Target Doc | Section | Type |
   |---|--------|-----------|---------|------|
   | 1 | [description] | [doc] | [section] | Modify |
   | 2 | [description] | [doc] | (new) [section] | Add Section |
   | ... | ... | ... | ... | ... |

   This will modify [N] files and add [M] new sections. Approve?
   ```

3. Wait for explicit user approval before proceeding.

**Verify**: Merge plan presented and user has approved.

**On failure**: If user rejects, stop. No changes made.

### Phase 2: Pre-Apply Validation

After the user approves the merge plan, validate that target files still match the
proposal's assumptions before applying any changes.

4. **Lightweight validation (always runs)** -- For every Change Manifest item, read the target file and confirm:
   - The target section exists at the stated location
   - The content broadly matches the proposal's "Current" description

5. **Exhaustive validation (complexity-triggered)** -- Runs when any of these signals are present:
   - Change Manifest has 12+ items
   - 50%+ of changes are MODIFY type
   - Any file is targeted by 3+ changes
   - Proposal has been through 3+ review/fix rounds
   - User or reviewer explicitly requests it (e.g., review recommends exhaustive validation)

   Exhaustive validation additionally:
   - Verifies every factual claim in the proposal against target files
   - Greps for missed references on removal/replacement operations
   - Checks insertion point surroundings for conflicts
   - Validates merge instruction specificity

6. **Validation report** --

   If all items confirmed, auto-proceed with a one-line summary:
   ```
   Pre-apply validation: 8/8 targets confirmed. Proceeding to apply.
   ```
   No user prompt -- clean merges should feel unchanged.

   If issues found, present the validation report and wait for user decision:
   ```
   Pre-apply validation: 6/8 confirmed, 2 issues.

   | # | Target | Status | Proposal Expects | Actual State | Impact on Change |
   |---|--------|--------|-----------------|--------------|-----------------|
   | 3 | ARCHITECTURE.md section Event Flow | Stale | ~10-line section describing webhook flow | ~45 lines, restructured with subheadings | HIGH -- "replace section" would discard 35 lines of new content |
   | 7 | TDD.md section Sandbox Config | Stale | 3-tier list (bash, OS, Docker) | 3-tier list with added resource limits table | LOW -- proposal appends to end, existing content unaffected |

   Options: (1) Fix proposal and re-review, (2) Proceed anyway, (3) Abort merge
   ```

   The **Impact on Change** column is what makes the decision actionable:
   - **HIGH**: Proposed change would overwrite, discard, or conflict with current content
   - **LOW**: Drift exists but proposed change wouldn't collide with it
   - **Missing**: Target section/file doesn't exist at all

   No automatic blocking -- the user decides based on assessed impact.

**Verify**: All targets validated. Issues (if any) presented to user and decision obtained.

**On failure**: If user chooses to abort, stop. If user chooses to fix and re-review, stop and direct to fix mode.

### Phase 3: Create Authorization Marker

7. Write the marker file at `.pipeline-authorized` (project root):

   ```
   operation: merge
   source: P-NNN-slug.md
   authorized_by: user
   timestamp: [ISO 8601]
   ```

   This tells the PreToolUse hook to allow edits to protected paths.

**Verify**: Marker file exists at the correct path.

### Phase 4: Apply Changes

8. Walk through each row of the Change Manifest and apply the change to the target system doc:

   - **Modify**: Read the target section, apply the proposed changes. Preserve existing
     content that isn't being changed. Don't paraphrase -- use the proposal's wording.
   - **Add Section**: Insert the new section at the appropriate location in the target doc.
     Add cross-references from other docs as specified in the proposal.
   - **Add Doc**: Create the new doc at the specified path. Add cross-references from
     existing docs as specified in the proposal.
   - **Remove**: Delete the specified content. Update any cross-references that pointed to it.
   - **Restructure**: Follow the proposal's restructuring plan. This is the most complex
     type -- read the proposal carefully for the exact steps.

   **Important**: Apply changes faithfully from the proposal. Don't improve, rephrase, or
   editorialize. The proposal has already been through review -- the merge is mechanical.

**Verify**: Each Change Manifest item applied. Count of applied changes matches total.

**On failure**: If a change can't be applied (target section doesn't exist or has changed), stop. See Error Handling below.

### Phase 5: Remove Authorization Marker

9. Delete `.pipeline-authorized` (project root). The window for protected path edits is closed.

**Verify**: Marker file no longer exists.

### Phase 6: Update Tracking

10. Update `docs/PROPOSAL_TRACKER.md` -- set status to `merged`, record merge date.

11. **Propagate design decisions** -- If the proposal's Design Decisions section includes
    architectural choices (technology selections, pattern decisions, tradeoff resolutions),
    log a Decision entry for each in `docs/DECISIONS.md` with Pipeline Phase `proposal`,
    Source the proposal ID and section.

12. If any merge conflicts were resolved (existing text kept over proposed, or vice versa),
    log a Decision entry in `docs/DECISIONS.md` with the conflict context, options, and
    rationale for resolution.

13. **Refresh Project Context** -- If this merge changed the architecture, constraints, or
    technology stack, update the Project Context section in `docs/DECISIONS.md` to reflect
    the new state. This keeps DECISIONS.md current so future skills orient correctly.

14. Tell the user: "Proposal P-NNN merged into system docs. Running post-merge verification."

**Verify**: Tracker updated. Decision entries logged. User notified.

### Phase 7: Auto-Trigger Verify

15. Immediately transition to verify mode. Read `references/verify-mode.md` and run the full
    verification process. The user doesn't need to separately invoke `/cl-reviewer verify` --
    it runs as part of the merge flow.

### Error Handling

**Merge fails mid-way** (e.g., a system doc section referenced by the proposal doesn't
exist or has changed since the proposal was written). Pre-apply validation (Step 2) should
catch most target issues before they reach this point. This error handling covers edge cases
that validation missed:

1. Stop applying changes
2. Do NOT remove the marker yet -- partial changes have been made
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

## Report

Output: Updated system docs in `docs/system/` plus auto-triggered verify report

### On success
```
MERGE: COMPLETE | Changes: N/N applied | Conflicts: 0
```

### On failure
```
MERGE: PARTIAL | Changes: M/N applied
```
