---
mode: proposal-template
tier: guided
depends-on: []
state-files: [PROPOSAL_TRACKER.md, RESEARCH_LEDGER.md, DECISIONS.md, .manifest.md]
---

# Proposal Generation Process & Template

This reference covers the full process for generating a proposal from an approved research
doc, and the template to use for the output.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Research doc | docs/research/R-NNN-TOPIC.md (approved) | Yes | The source of truth for what was researched |
| System doc manifest | docs/system/.manifest.md | Yes | Document index -- file list, section headings with line ranges, cross-references |
| Document plan | Locked structure plan (if any) | No | Confirmed structure from `/cl-researcher structure` |
| Proposal tracker | docs/PROPOSAL_TRACKER.md | Yes | Existing proposals to check for conflicts and determine next ID |
| Research ledger | docs/RESEARCH_LEDGER.md | Yes | Updated after proposal generation to reference the proposal |
| System docs (targeted) | docs/system/*.md | No | Specific sections for deep-reads when research didn't thoroughly cover them |

## Guidelines

1. The Change Manifest is the backbone. Everything else in the proposal supports it. The reviewer will check every row. The verify step (post-merge) will use it to confirm every change landed. Make it precise and complete.
2. Traceability is non-negotiable. Every change must trace to a research finding. Every design decision must trace to a rationale. If you can't explain why a change is needed, it shouldn't be in the proposal.
3. Current -> Proposed diffs are gold. Showing "here's what the section says now, here's what it should say after" is the clearest way to communicate a change. The reviewer and the implementer both benefit from this.
4. Scope boundary is a safety net. Explicitly stating what the proposal does NOT change protects against accidental over-application during the merge and gives the verify step a clear boundary to check against.
5. Cross-proposal conflicts prevent merge disasters. Always check the tracker. Two proposals modifying the same section without coordination will produce inconsistent docs.
6. Update tracking files. After generating a proposal, always add it to PROPOSAL_TRACKER.md and update the research entry in RESEARCH_LEDGER.md. The pipeline relies on these for state management.
7. Design Decisions propagate at merge. The Design Decisions table in the proposal will be extracted and logged to `docs/DECISIONS.md` during the merge step (see merge-mode.md). Make sure each row has enough context (rationale, alternatives) to stand on its own -- the DECISIONS.md entry will reference this proposal but should be understandable without reading the full proposal.

## Process

### Phase 1: Load Context

Read the research doc -- the source of truth for what was researched. The research
doc's System Context section already contains detailed references to the relevant system
docs -- this is your primary context. Don't re-read what the research already captured.

Read the system doc manifest -- Read `docs/system/.manifest.md` for the document
index -- file list, section headings with line ranges, and cross-references. This tells
you the lay of the land without reading every doc in full.

Targeted deep-reads only -- If the proposal touches system docs that the research
didn't thoroughly cover (e.g., cross-cutting concerns or ripple effects), read those
specific sections using the line ranges from the manifest. Don't re-read docs that the
research already analyzed.

Read the document plan -- If a structure plan was confirmed during the research phase
(via `/cl-researcher structure`), read it. The proposal must follow the locked structure.

Check the proposal tracker -- Read `docs/PROPOSAL_TRACKER.md` to check for in-flight
proposals that might conflict (same target sections).

**Checkpoint**: All context loaded -- research doc, manifest, document plan (if any), and tracker reviewed.

### Phase 2: Build the Change Manifest

This is the most important artifact in the proposal. Walk through the research doc's
recommendations and for each one, determine:

- Which system doc(s) need to change
- Which specific section(s) in each doc
- What the change is (add, modify, remove, restructure)
- Why (traced back to which research finding)

The change manifest is what the cl-reviewer uses to verify the proposal is complete
and that nothing was missed. It's the contract between the proposal and the system docs.

**Checkpoint**: Change manifest complete -- every research recommendation mapped to specific doc/section changes.

### Phase 3: Design the Changes

For each entry in the change manifest, design the actual change:

- What should the section look like after the change?
- How does it integrate with surrounding content?
- Are cross-references to other system docs needed?
- Does this change require updates to other system docs for consistency?

**Checkpoint**: Detailed design complete for every change manifest entry.

### Phase 4: Write the Proposal

Use the template below. Generate at:
```
docs/proposals/P-NNN-TOPIC.md
```

Use sequential numbering matching the PROPOSAL_TRACKER. The TOPIC uses SCREAMING_SNAKE_CASE
and should reflect what's being proposed, not the research doc it came from. For example:
research `R-001-MEMORY_LAYER.md` might produce proposal `P-001-MEMORY_SYSTEM_V2.md`.

To determine the next ID, check `docs/PROPOSAL_TRACKER.md` for the highest existing ID
and increment.

**Checkpoint**: Proposal file written to docs/proposals/.

### Phase 5: Update Tracking and Handoff

After generating the proposal:
1. Add a row to `docs/PROPOSAL_TRACKER.md` with status `draft`
2. Update the corresponding research entry in `docs/RESEARCH_LEDGER.md` to reference the proposal

After generating, tell the user:
- Where the proposal is
- Summary of what it proposes
- That they can refine it further and then run it through the review gate
  with `/cl-reviewer review P-NNN-TOPIC.md`

Tell the user: "Proposal generated. Read it over and let me know when you'd like to run
it through the review gate."

**Checkpoint**: PROPOSAL_TRACKER.md and RESEARCH_LEDGER.md updated, user notified.

---

## Template

```markdown
# Proposal: [Title]

**ID**: P-NNN
**Created**: [date]
**Status**: Draft | In Review | Approved
**Research**: docs/research/R-NNN-TOPIC.md
**Document Plan**: [reference to locked structure plan, if any]
**Author**: [user + AI researcher]
**Depends On**: [P-XXX, P-YYY — or "None"]

## Summary

Two to three paragraphs: what this proposal changes, why, and the expected impact.
Write this so someone who hasn't read the research can understand the proposal's intent.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-NNN-TOPIC.md | [Which findings from the research inform this proposal] | [Which recommendation] |

## System Context

### Research Type: [Evolutionary | Net New | Hybrid]

Carried over from the research doc.

### Current State

For evolutionary/hybrid: Describe the relevant current state, referencing specific
system docs and sections.

For net new: Describe the architectural landscape — where this new capability fits,
what it integrates with, and what constraints it inherits from the existing system.

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| [doc name] | [What's relevant today] | Section X, Section Y |
| ... | ... | ... |

### Proposed State

Describe what the system will look like after this proposal is applied.

For evolutionary: Focus on the delta — what changes and what stays the same.

For net new: Describe the new capability and how it fits into the existing architecture.
Include where new docs/sections live and how they're cross-referenced from existing docs.

## Change Manifest

> This is the contract between the proposal and the system docs. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | [What changes] | [doc name] | Section X | Modify | Finding 2.1 |
| 2 | [What changes] | [doc name] | (new section) | Add Section | Finding 3.4 |
| 3 | [What changes] | [doc name] | Section Z | Add | Finding 2.3 |
| ... | ... | ... | ... | ... | ... |

**Change types:**
- **Modify** — Changing existing content in an existing section
- **Add** — Adding content to an existing section
- **Add Section** — Adding a new section to an existing doc
- **Add Doc** — Creating an entirely new system doc (for net new capabilities)
- **Remove** — Removing content or sections
- **Restructure** — Reorganizing without changing meaning

**Scope boundary**: This proposal ONLY modifies the docs/sections listed above. Any
changes to other docs or sections are out of scope and unintended.

For net new proposals that add new system docs, explain where the new doc fits in the
doc hierarchy and which existing docs should cross-reference it.

## Cross-Proposal Conflicts

Check PROPOSAL_TRACKER.md for in-flight proposals that modify the same target sections.

| Conflict With | Overlapping Sections | Resolution |
|--------------|---------------------|-----------|
| P-XXX | [doc name] Section Y | [How to resolve — merge order, coordination needed] |

If no conflicts: "No conflicts with in-flight proposals."

## Detailed Design

### [Change Area 1]

For each logical grouping of changes:

**What**: Describe the change in detail. Include enough specificity that someone could
implement it without ambiguity.

**Why**: Trace back to the research finding and/or user requirement that motivates this.
"Research Finding 2.1 identified that [problem]. This change addresses it by [approach]."

**System doc impact**: Which specific sections change and how. Quote or paraphrase the
current content and show what it becomes.

**Current** (from [SYSTEM_DOC] Section X):
> [Current content, paraphrased or quoted briefly]

**Proposed**:
> [What this section should say after the change]

**Dependencies**: Does this change require other changes in the manifest to be applied
first or simultaneously?

### [Change Area 2]

...

### [Change Area N]

...

## Cross-Cutting Concerns

Issues that affect multiple changes or span across system docs:

### Terminology

Any new terms introduced or existing terms redefined. Include definitions so the
reviewer can verify consistent usage across system docs.

| Term | Definition | Where Used |
|------|-----------|-----------|
| ... | ... | [Which system docs and sections] |

### Migration

If this proposal changes existing behavior:
- What breaks if applied naively?
- What's the migration path?
- Is backward compatibility maintained?

### Integration Points

How do the changed components interact with unchanged components?
Are there interface contracts that must be preserved?

## Design Decisions

Key decisions made in this proposal with rationale. These help the reviewer understand
WHY things are designed this way, not just WHAT they are.

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| [What was decided] | [What else was considered] | [Why this option won — reference research] |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | Low/Med/High | Low/Med/High | ... |

## Open Items

Anything that needs resolution but doesn't block the proposal from being reviewed.
The reviewer may weigh in on these.

## Appendix: Research Summary

Brief summary of the research findings for reviewers who want context without reading
the full research doc. Keep this to one page — point them to the research doc for details.
```

## Output

**Primary artifact**: `docs/proposals/P-NNN-TOPIC.md`

**Additional outputs**:
- Updated `docs/PROPOSAL_TRACKER.md` (new row with status `draft`)
- Updated `docs/RESEARCH_LEDGER.md` (research entry references the proposal)
