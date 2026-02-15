## Verify Mode

Verify mode runs after a proposal has been approved and the AI has updated the system docs
based on it. Your job is to ensure the proposal was applied faithfully and that the updated
system docs are internally consistent, mutually consistent with each other, and haven't
lost or distorted anything in the merge process.

This is important because when an AI updates multiple system docs based on a proposal, it can:
- Apply changes to some docs but miss others
- Paraphrase ideas in a way that subtly shifts meaning
- Create contradictions between system docs that were previously consistent
- Drop nuance or edge cases from the proposal during the merge
- Over-apply changes, modifying sections the proposal didn't intend to touch
- Break cross-references between system docs

### Step 1: Gather All Inputs

**Important**: Verify mode is the one phase where you CANNOT rely on the manifest — the
system docs have just been modified. You must read them fresh.

1. **Read the approved proposal** — The source of truth for what should have changed. The
   Change Manifest is your verification checklist.

2. **Read the latest review** — The most recent `REVIEW_P-NNN_v*.md` to understand what was
   approved, including any conditions in an APPROVE WITH CHANGES verdict.

3. **Read ALL system docs fresh** — Dispatch subagents to read every doc in `docs/system/`
   in parallel. The manifest is stale because these docs were just modified. Each subagent
   should produce:
   - Full content summary
   - Any sections that appear to reference or relate to the proposal's topic
   - Any sections that seem recently modified or inconsistent with surrounding content

### Step 2: Four-Part Verification

#### Part A: Application Completeness

Walk through each concrete change the proposal describes and verify it landed in the
correct system doc(s):

- **Applied** — The change is present in the system doc, faithfully representing the proposal.
- **Partially applied** — The change is present but incomplete, missing details, or watered
  down. Note what's missing.
- **Not applied** — The change described in the proposal is absent from the system docs.
- **Misapplied** — The change landed in the wrong doc, wrong section, or was interpreted
  incorrectly.

For "Add Doc" changes, verify the new doc exists, is in the right location, and that
existing system docs have been updated with cross-references where the proposal specified.
For "Add Section" changes, verify the section exists in the right place within the doc.

#### Part B: Fidelity Check

For each applied change, verify the system doc version faithfully represents the proposal:

- Are technical details preserved accurately, or were they simplified/distorted?
- Are constraints and edge cases carried over, or were they dropped?
- Is terminology consistent between the proposal and the system docs?
- Were conditional statements (e.g., "only when X") preserved, or were they generalized?

#### Part C: Cross-Document Consistency

This is the highest-value check. After a merge, the system docs must remain consistent
with each other. Dispatch subagents to check each pair of system docs for:

- Contradictory statements about the same concept
- Terminology drift (same thing called different names in different docs)
- Broken cross-references (doc A refers to something in doc B that was moved or renamed)
- Architectural inconsistencies (e.g., one doc describes a flow that another doc can't support)
- Redundant or conflicting specifications of the same behavior

#### Part D: Collateral Damage

Check for unintended changes — sections of system docs that were modified but shouldn't
have been based on the proposal's scope:

- Were unrelated sections accidentally modified?
- Did the merge accidentally delete or overwrite existing content?
- Were existing design decisions changed that the proposal didn't intend to revisit?

### Step 3: Produce the Verification File

```
docs/reviews/proposals/VERIFY_P-NNN.md
```

Use this structure:

```markdown
# Verification: [Proposal Name]

**Verified**: [date]
**Proposal**: docs/proposals/P-NNN-slug.md
**Approved review**: docs/reviews/proposals/REVIEW_P-NNN_v[latest].md
**System docs checked**: [list ALL system docs examined]

## Summary

One paragraph: was the proposal applied cleanly, or are there issues?

## Verdict: [CLEAN MERGE | ISSUES FOUND | INCOMPLETE MERGE]

- **CLEAN MERGE**: All changes applied faithfully, no inconsistencies introduced.
- **ISSUES FOUND**: Changes applied but problems were introduced. Detail below.
- **INCOMPLETE MERGE**: Significant parts of the proposal were not applied to system docs.

## Application Status

| Proposed Change | Target Doc(s) | Status | Notes |
|----------------|---------------|--------|-------|
| [change description] | [doc name] | Applied / Partial / Missing / Misapplied | ... |
| ... | ... | ... | ... |

## Fidelity Issues

Cases where the system doc version doesn't faithfully represent the proposal.
If none: "All changes were applied faithfully."

### [Issue Title]
- **System doc**: Which doc and section
- **Proposal says**: What the proposal intended
- **System doc says**: What actually landed
- **Impact**: Does this matter, or is it just a phrasing difference?
- **Suggestion**: How to correct

## Cross-Document Consistency

| Doc Pair | Status | Notes |
|----------|--------|-------|
| [doc A] <-> [doc B] | Consistent / Tension / Conflict | ... |
| ... | ... | ... |

### [Inconsistency Title] (if any found)
- **Doc A**: [doc] Section [X] says...
- **Doc B**: [doc] Section [Y] says...
- **Nature**: Contradiction / terminology drift / broken reference
- **Suggestion**: Which doc should be corrected, and how

## Collateral Damage

Unintended modifications to system docs outside the proposal's scope.
If none: "No unintended changes detected."

### [Issue Title]
- **System doc**: Which doc and section
- **What changed**: What appears to have been modified
- **Was this in scope?**: Why this seems unintended
- **Suggestion**: Revert or keep?

## Final Assessment

Brief overall assessment:
- Were the system docs improved by this merge?
- Is the system documentation set still coherent as a whole?
- Any follow-up work needed?
```

### Step 4: Update Tracking and Manifest

After writing the verification file:
1. Update `docs/PROPOSAL_TRACKER.md` — set status to `verified`, record the merge date
2. If verification found discrepancies where the system doc version was preferred over the proposal (or vice versa), log a Decision entry in `docs/DECISIONS.md` explaining what diverged and which version was kept
3. The manifest will be auto-regenerated by the PostToolUse hook since system docs changed

After writing the file, tell the user where it is and summarize the verdict. If the merge
was incomplete or introduced issues, be specific about what needs fixing — the user will
likely ask the AI to correct the system docs based on your findings.

### Step 5: Design Nudge

After verification completes, check if system docs reference UI features. Search the PRD
(and other system docs) for terms like "interface", "dashboard", "UI", "frontend", "screen",
"page", "view", "component", "layout".

If UI-related terms are found, check whether design artifacts exist: look for
`{docsRoot}/designs/` directory and `{docsRoot}/specs/DESIGN_SYSTEM.md`.

If the system docs describe UI features but no design artifacts exist, suggest:
"Your docs describe a user interface but no design artifacts exist yet. Run
`/cl-designer setup` when ready to generate a design system."

This is advisory — don't block the verify verdict on design existence.
