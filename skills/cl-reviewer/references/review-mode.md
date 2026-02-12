# Initial Review Process

### Step 1: Gather Context

The proposal you're reviewing already contains embedded system context — a System Context
section, Change Manifest, and Current -> Proposed diffs. Use this as your primary source
instead of re-reading every system doc from scratch.

1. **Read the proposal doc** — Thoroughly. The proposal's System Context section and Change
   Manifest tell you which system docs are affected and what the current state looks like.

2. **Read the system doc manifest** — Read `docs/system/.manifest.md` for the full system
   picture — file list, section headings, and cross-references. This single file tells you
   the doc landscape without reading every doc.

3. **Targeted deep-reads for cross-referencing** — Only read individual system docs directly
   when you need to verify a specific claim the proposal makes about the current state, or
   to check consistency with docs the proposal doesn't reference. Use the manifest's line
   ranges for targeted reads. The manifest + proposal context covers 90% of cases.

4. **Check for a corresponding research doc** — If one exists in `docs/research/`, skim it
   to verify the proposal faithfully represents the research findings.

5. **Check the proposal tracker** — Read `docs/PROPOSAL_TRACKER.md` to check for other
   in-flight proposals that might conflict with the same target sections.

### Step 2: Analyze Across Six Dimensions

Evaluate the proposal along these dimensions. Only report issues you actually find.
Don't manufacture concerns to look thorough.

For very long proposals (>500 lines), consider dispatching subagents to analyze different
dimensions in parallel, each with the full proposal text and the system doc context.

#### 1. Value Assessment
Does this proposal add something meaningful to the system?
- Does it solve a real problem or address a real gap?
- Is the complexity it introduces justified by the value it provides?
- Could the same goal be achieved with a simpler approach?
- Is it solving the right problem, or solving a symptom?

#### 2. Internal Coherence
Is the proposal consistent with itself?
- Do later sections contradict earlier ones?
- Are terms used consistently throughout?
- Do the proposed solutions actually address the stated problems?
- Are there logical gaps where the reasoning jumps?

#### 3. External Consistency
Is the proposal consistent with the existing system docs?
- Does it conflict with the current architecture?
- Does it redefine terms that already have established meanings in system docs?
- Does it propose patterns that contradict existing design decisions?
- Does it account for existing systems it would interact with?
- Are there integration points that aren't addressed?

#### 4. Technical Soundness
Are the technical ideas solid?
- Are the proposed approaches feasible with the stated tech stack?
- Are there obvious scalability, performance, or security concerns?
- Are edge cases considered?
- Are the abstractions at the right level?
- Would the approach actually work in production, not just in theory?

#### 5. Completeness & Gaps
Is anything important missing?
- Are there unstated assumptions that should be explicit?
- Are failure modes and error handling addressed?
- Are migration paths considered (if changing existing behavior)?
- Is there enough detail for implementation, or is it still too abstract?

#### 6. Spec-Readiness
Can structured specs eventually be derived from this proposal's content?
- Are types concrete enough for spec generation (e.g., "UUID v4", not "a string")?
- Are interfaces defined precisely enough to generate contracts?
- Are edge cases enumerated, not just implied?
- Would a spec generator have enough information to produce unambiguous output?

This dimension is advisory, not blocking — early proposals may not be spec-ready. But
flagging spec-readiness issues helps the user improve precision before merging.

### Step 3: Cross-Proposal Conflict Detection

Check `docs/PROPOSAL_TRACKER.md` for in-flight proposals. If any other proposals target
the same system doc sections as this one, flag the conflict:

- Which proposals overlap
- Which sections they both modify
- Whether the changes are compatible or contradictory
- Recommended resolution (merge order, coordination, etc.)

### Step 4: Produce the Review File

Create the review as a markdown file at:
```
docs/reviews/proposals/REVIEW_P-NNN_v1.md
```

Create the `docs/reviews/proposals/` directory if it doesn't exist.

Use this structure:

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
- **Dimension**: Which of the six dimensions this falls under
- **Where**: Section or line reference in the proposal
- **Issue**: What's wrong
- **Why it matters**: Impact on the system
- **Suggestion**: How to fix it

## Non-Blocking Suggestions

Improvements that would strengthen the proposal but aren't required.
If none, write "No suggestions — the proposal is solid."

## Spec-Readiness Notes

Advisory notes on how ready this proposal is for eventual spec generation.
If spec-ready: "Content is precise enough for spec generation."

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| [doc name] | Consistent / Tension / Conflict | Brief note |
| ... | ... | ... |

## Strengths

What the proposal does well — helps the author know what to preserve during revisions.

## Risk Assessment

Risks of adopting this proposal that aren't addressed in the proposal itself.
If no significant risks, say so briefly.
```

### Step 5: Update Tracking

After writing the review file:
1. Update `docs/PROPOSAL_TRACKER.md` — set status to `in-review`, increment review round

After writing the file, tell the user where it is and give a brief verbal summary of
the verdict and any blocking issues.
