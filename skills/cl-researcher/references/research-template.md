# Research Doc Template

Use this template when generating research documents. Adjust section depth based on the
complexity of the research — a simple investigation might only need brief sections, while
a major architectural exploration deserves full detail.

## Filename Convention

Use `R-NNN-slug.md` format: `docs/research/R-NNN-slug.md`

The NNN is a sequential number. The slug is a lowercase, hyphen-separated descriptor.

Examples: `R-001-memory-layer.md`, `R-002-event-bus-scaling.md`, `R-003-auth-strategy.md`

To determine the next ID, check `docs/RESEARCH_LEDGER.md` for the highest existing ID
and increment.

## Template

```markdown
# Research: [Topic Title]

**ID**: R-NNN
**Created**: [date]
**Status**: Draft | In Discussion | Approved
**Author**: [user + AI researcher]

## Status

- **Research Type**: [Evolutionary | Net New | Hybrid]
- **Status**: [draft | in-discussion | approved | superseded]
- **Open Questions**: [count] remaining
- **Discussion Rounds**: [count]
- **Complexity**: [L0-trivial | L1-contained | L2-complex | L3-exploratory]

## System Context

> This section is critical — it's what enables the cl-reviewer to trace your research
> back to the existing system. Never skip it.

### Research Type: [Evolutionary | Net New | Hybrid]

- **Evolutionary**: Changing or extending something that exists in the system docs.
- **Net New**: Adding a capability that doesn't exist yet. No system doc sections are
  being modified, but integration points and architectural constraints still apply.
- **Hybrid**: New capability that also requires changes to existing components.

### Related System Docs

For evolutionary/hybrid research — docs and sections being changed:

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| [doc name] | Section X, Section Y | [What's being changed and why] |
| ... | ... | ... |

For net new/hybrid research — docs and sections that define integration points,
constraints, or patterns the new capability must respect:

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| [doc name] | Section A (system patterns) | [Pattern this must follow] |
| [doc name] | Section B (component model) | [Where the new component fits] |
| ... | ... | ... |

If no existing system doc section is directly related, say so explicitly and explain
which docs define the architectural context the new capability will live within.

### Current State

For evolutionary: Describe the current system behavior that will change.

For net new: Describe the architectural landscape this new capability enters — what
exists around where this will live, what patterns it should follow, and what constraints
the current system imposes. Note explicitly: "This capability does not currently exist
in the system. The following describes the architectural context it must fit within."

### Why This Research

What gap, problem, or opportunity prompted this research? Tie it to specific aspects
of the current system or user requirements.

## Scope

### In Scope
- [Specific questions this research will answer]
- [Specific areas of the system this research covers]

### Out of Scope
- [Things this research explicitly will NOT address]
- [Adjacent topics deferred to future research]

### Constraints
- [Technical constraints from the existing system]
- [User-specified constraints]
- [Compatibility requirements]

## Research Findings

### [Finding Area 1]

Present findings organized by theme or question. For each finding:

**Context**: What aspect of the system or problem this addresses.

**Analysis**: What you found, with evidence. Reference system docs where relevant:
"Currently, [SYSTEM_DOC] Section X defines Y as Z. This finding examines whether
an alternative approach would better support [requirement]."

**Tradeoffs**: What are the pros and cons? Be honest about downsides.

**Source**: Where this finding comes from — system doc analysis, industry best practice,
user requirements, external research, etc.

### [Finding Area 2]

...

### [Finding Area N]

...

## Options Analysis

If the research identified multiple approaches, analyze them here.

| Criterion | Option A: [Name] | Option B: [Name] | Option C: [Name] |
|-----------|-------------------|-------------------|-------------------|
| Complexity | ... | ... | ... |
| Performance | ... | ... | ... |
| Migration effort | ... | ... | ... |
| Alignment with current architecture | ... | ... | ... |
| [criterion from user constraints] | ... | ... | ... |

## Recommendations

Take a position. Don't just list options — recommend one and explain why.

### Primary Recommendation

What approach to take and why. Tie the rationale back to findings and constraints.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ... | Low/Med/High | Low/Med/High | ... |

### Impact on System Docs

Which system docs would need to change if this recommendation is adopted?
This is a preview of what the proposal will formalize.

| System Doc | Expected Changes |
|------------|-----------------|
| [doc name] | [What sections would change and how] |
| (new) [doc name] | [New system doc needed — describe purpose] |
| ... | ... |

For net new capabilities: note if an entirely new system doc is needed, and which
existing docs would need cross-references added to point to it.

## Decision Log

Running log of decisions made during the human discussion loop. Captures what was
considered and why it was accepted or rejected — invaluable for reconstructing
reasoning later.

> **Propagation**: When research is approved, review this log for significant entries —
> scope-setting decisions, rejected approaches with rationale, assumptions that downstream
> work depends on. Extract those to `docs/DECISIONS.md` with Pipeline Phase `research` and
> Source pointing to this research doc and row number.

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | | | | |

## Emerged Concepts

Ideas that surfaced during this research that aren't the main topic but should be
tracked. These get added to STATUS.md's emerged concepts table.

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| | | |

## Open Questions

Questions that emerged during research and need user input or further investigation
before this can move to proposal stage. The discussion gate passes when all open
questions are resolved.

## References

External sources, articles, documentation, or prior research consulted.
```

## Section Guidance

**System Context is non-negotiable.** The cl-reviewer skill cross-references proposals
against system docs. If your research doesn't trace to system docs, the proposal generated
from it won't either, and the reviewer will flag it.

**The Status section makes progress visible.** Always update the open questions count and
discussion round number as the research evolves. The gate passes when open questions = 0
AND status = approved.

**The Decision Log captures reasoning.** Don't just record the final answer — record what
was considered and rejected. Three months from now, "why didn't we use approach X?" is
answered by the decision log.

**Take a position in Recommendations.** "Here are three options" without a recommendation
is a research failure. If you can't recommend, you haven't researched deeply enough.

**Keep Options Analysis honest.** Don't stack the deck for your preferred option. The user
needs to see real tradeoffs to make an informed decision.

**Open Questions are a feature, not a bug.** It's better to surface what you don't know
than to pretend you've covered everything. These questions drive the refinement conversation.

**Emerged Concepts keep the pipeline honest.** Ideas that surface during research but aren't
the current topic should be captured, not forgotten. They feed the research queue.
