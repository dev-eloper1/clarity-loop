---
mode: review
tier: structured
depends-on: []
state-files:
  - docs/PROPOSAL_TRACKER.md
  - docs/system/.manifest.md
---

# Initial Review Process

The proposal you're reviewing already contains embedded system context -- a System Context
section, Change Manifest, and Current -> Proposed diffs. Use this as your primary source
instead of re-reading every system doc from scratch.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Proposal file | `docs/proposals/P-NNN-slug.md` | Yes | The proposal being reviewed |
| System doc manifest | `docs/system/.manifest.md` | Yes | File list, section headings, cross-references for the doc landscape |
| Research doc | `docs/research/` | No | Corresponding research doc, if one exists |
| Proposal tracker | `docs/PROPOSAL_TRACKER.md` | Yes | Tracks in-flight proposals for conflict detection |
| System docs | `docs/system/` | No | Individual system docs for targeted deep-reads when cross-referencing |
| Review output path | `docs/reviews/proposals/REVIEW_P-NNN_v1.md` | Yes | Where the review file is written |

## Workflow

### Phase 1: Gather Context

1. **Read the proposal doc** -- Thoroughly. The proposal's System Context section and Change
   Manifest tell you which system docs are affected and what the current state looks like.

2. **Read the system doc manifest** -- Read `docs/system/.manifest.md` for the full system
   picture -- file list, section headings, and cross-references. This single file tells you
   the doc landscape without reading every doc.

3. **Targeted deep-reads for cross-referencing** -- Only read individual system docs directly
   when you need to verify a specific claim the proposal makes about the current state, or
   to check consistency with docs the proposal doesn't reference. Use the manifest's line
   ranges for targeted reads. The manifest + proposal context covers 90% of cases.

4. **Check for a corresponding research doc** -- If one exists in `docs/research/`, skim it
   to verify the proposal faithfully represents the research findings.

5. **Check the proposal tracker** -- Read `docs/PROPOSAL_TRACKER.md` to check for other
   in-flight proposals that might conflict with the same target sections.

**Verify**: Proposal file, manifest, and tracker are all loaded. Research doc checked if present.

**On failure**: If proposal file doesn't exist, stop and tell the user. If manifest is missing, warn and proceed with full system doc reads.

### Phase 2: Ground Truth Spot-Check

Before dimensional analysis, verify the proposal's factual claims against actual target
files. This catches accuracy and executability issues that dimensional analysis cannot
detect.

6. **Select 3-5 Change Manifest items for spot-checking.** Prioritize:
   - MODIFY operations (claims about current state are most likely to be wrong)
   - Items with terse "Current" descriptions (less detail = more room for inaccuracy)
   - Items targeting files modified by other recent proposals
   - Items with broad targets ("restructure section X")

7. **For each selected item, read the actual target file and verify:**
   - **Factual accuracy** -- Does the proposal's "Current" description match what's actually
     in the file? Check line counts, section structure, content summaries.
   - **Target completeness** -- For "remove all references to X" or "replace X with Y"
     operations, grep the target directory for the key terms. Are there references the
     proposal missed?
   - **Design specificity** -- Is there enough detail in the merge instructions for
     mechanical execution? Could someone apply this change without interpretation?
   - **Insertion point awareness** -- For Add/Add Section changes, what already exists at
     the proposed location? Will the new content fit naturally?

8. **Code-related claims** -- If any spot-checked items involve claims about code (e.g.,
   "the codebase currently uses X", "the system does Y"), verify those claims against the
   actual codebase using targeted sync checks:
   - Existence claims: Does the referenced file, module, function, or dependency exist?
   - If the Change Manifest modifies sections about technology, architecture, or code
     structure, check the specific claims in those sections.

   This is NOT a full sync scan. It piggybacks on the spot-check -- same 3-5 items, checking
   against code only when claims are code-related.

**Verify**: 3-5 items spot-checked against actual target files. Code-related claims verified where applicable.

**On failure**: If target files don't exist or are inaccessible, report as ground truth findings.

9. **Report findings under Dimension 7: Ground Truth** in the review output.

### Phase 3: Seven-Dimension Analysis

Evaluate the proposal along these dimensions. Only report issues you actually find.
Don't manufacture concerns to look thorough.

For very long proposals (>500 lines), consider dispatching subagents to analyze different
dimensions in parallel, each with the full proposal text and the system doc context.

**Result protocol**: Subagents report using the Structured Agent Result Protocol, type:
`consistency`. Load the protocol prompt template from
`skills/cl-reviewer/references/agent-result-protocol.md` Phase 6 and include it in each
subagent's Task prompt. Parse the RESULT summary line from each response for status
classification and aggregation.

10. **Dimension 1: Value Assessment** -- Does this proposal add something meaningful to the system?
    - Does it solve a real problem or address a real gap?
    - Is the complexity it introduces justified by the value it provides?
    - Could the same goal be achieved with a simpler approach?
    - Is it solving the right problem, or solving a symptom?

11. **Dimension 2: Internal Coherence** -- Is the proposal consistent with itself?
    - Do later sections contradict earlier ones?
    - Are terms used consistently throughout?
    - Do the proposed solutions actually address the stated problems?
    - Are there logical gaps where the reasoning jumps?

12. **Dimension 3: External Consistency** -- Is the proposal consistent with the existing system docs?
    - Does it conflict with the current architecture?
    - Does it redefine terms that already have established meanings in system docs?
    - Does it propose patterns that contradict existing design decisions?
    - Does it account for existing systems it would interact with?
    - Are there integration points that aren't addressed?

13. **Dimension 4: Technical Soundness** -- Are the technical ideas solid?
    - Are the proposed approaches feasible with the stated tech stack?
    - Are there obvious scalability, performance, or security concerns?
    - Are edge cases considered?
    - Are the abstractions at the right level?
    - Would the approach actually work in production, not just in theory?

14. **Dimension 5: Completeness & Gaps** -- Is anything important missing?
    - Are there unstated assumptions that should be explicit?
    - Are failure modes and error handling addressed?
    - Are migration paths considered (if changing existing behavior)?
    - Is there enough detail for implementation, or is it still too abstract?

15. **Dimension 6: Spec-Readiness** -- Can structured specs eventually be derived from this proposal's content?
    - Are types concrete enough for spec generation (e.g., "UUID v4", not "a string")?
    - Are interfaces defined precisely enough to generate contracts?
    - Are edge cases enumerated, not just implied?
    - Would a spec generator have enough information to produce unambiguous output?

    This dimension is advisory, not blocking -- early proposals may not be spec-ready. But
    flagging spec-readiness issues helps the user improve precision before merging.

16. **Dimension 7: Ground Truth** -- Do the proposal's factual claims match reality?
    - Are "Current" descriptions accurate against the actual target files?
    - Are all references accounted for (no orphaned references after removal)?
    - Are merge instructions specific enough for mechanical execution?
    - Do code-related claims match the actual codebase?

    Ground truth issues are always blocking -- inaccurate claims about current state lead to
    merge failures. Unlike other dimensions, ground truth findings include a `Type` column
    distinguishing Doc-to-File (target file mismatch) from Doc-to-Code (codebase mismatch).

    **UX**: On clean pass, report a single summary line:
    `**Dimension 7: Ground Truth** -- 5 items spot-checked, all confirmed.`

    On issues found, report a table of only the failed items:

    | Change # | Issue | Type | Severity |
    |----------|-------|------|----------|
    | Change 3 | "Current" says ~10 lines, actual is ~45 lines | Doc-to-File | Blocking |
    | Change 5 | Proposal claims pgvector uses 768-dim, code uses 1536 | Doc-to-Code | Blocking |

**Verify**: All seven dimensions evaluated. Only actual issues reported.

### Phase 4: Cross-Proposal Conflict Detection

17. Check `docs/PROPOSAL_TRACKER.md` for in-flight proposals. If any other proposals target
    the same system doc sections as this one, flag the conflict:
    - Which proposals overlap
    - Which sections they both modify
    - Whether the changes are compatible or contradictory
    - Recommended resolution (merge order, coordination, etc.)

**Verify**: Proposal tracker checked for conflicts with all in-flight proposals.

### Phase 5: Produce the Review File

18. Create the review as a markdown file at:
    ```
    docs/reviews/proposals/REVIEW_P-NNN_v1.md
    ```

    Create the `docs/reviews/proposals/` directory if it doesn't exist.

19. Use this structure:

    ```markdown
    # Review: [Proposal Name]

    **Reviewed**: [date]
    **Proposal**: docs/proposals/P-NNN-slug.md
    **System docs referenced**: [list of system docs read]
    **Research doc**: [corresponding research doc, if found, or "None found"]

    ## Summary

    One paragraph: what this proposal aims to change and its overall readiness.

    ## Verdict: [APPROVE | APPROVE WITH CHANGES | NEEDS REWORK]

    - **APPROVE**: Sound, consistent, ready to update system docs.
    - **APPROVE WITH CHANGES**: Good overall, but specific issues need addressing first.
    - **NEEDS REWORK**: Fundamental issues with coherence, consistency, or value.

    ## Cross-Proposal Conflicts

    Conflicts with other in-flight proposals, if any. If none: "No conflicts detected."

    ## Blocking Issues

    Issues that MUST be resolved before this proposal updates system docs.
    If none, write "No blocking issues found."

    ### [Issue Title]
    - **Dimension**: Which of the seven dimensions this falls under
    - **Where**: Section or line reference in the proposal
    - **Issue**: What's wrong
    - **Why it matters**: Impact on the system
    - **Suggestion**: How to fix it

    ## Non-Blocking Suggestions

    Improvements that would strengthen the proposal but aren't required.
    If none, write "No suggestions -- the proposal is solid."

    ## Merge Advisory

    Recommend exhaustive pre-apply validation: Yes / No
    [If Yes: brief rationale -- e.g., "high MODIFY density with imprecise Current descriptions"]

    ## Spec-Readiness Notes

    Advisory notes on how ready this proposal is for eventual spec generation.
    If spec-ready: "Content is precise enough for spec generation."

    ## Consistency Map

    | System Doc | Status | Notes |
    |------------|--------|-------|
    | [doc name] | Consistent / Tension / Conflict | Brief note |
    | ... | ... | ... |

    ## Strengths

    What the proposal does well -- helps the author know what to preserve during revisions.

    ## Risk Assessment

    Risks of adopting this proposal that aren't addressed in the proposal itself.
    If no significant risks, say so briefly.
    ```

**Verify**: Review file written to correct path with all required sections populated.

### Phase 6: Update Tracking

20. Update `docs/PROPOSAL_TRACKER.md` -- set status to `in-review`, increment review round.

**Verify**: Tracker updated with correct status and review round.

21. After writing the file, tell the user where it is and give a brief verbal summary of
    the verdict and any blocking issues.

## Report

Output: Review file at `docs/reviews/proposals/REVIEW_P-NNN_v1.md`

### On success
```
REVIEW: APPROVE | Issues: 0
```
or
```
REVIEW: APPROVE WITH CHANGES | Blocking: N
```
or
```
REVIEW: NEEDS REWORK | Blocking: N
```

### On failure
```
REVIEW: FAILED | Reason: [reason]
```
