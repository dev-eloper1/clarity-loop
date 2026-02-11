# Decisions

Tracks all architectural and conflict-resolution decisions in this project. The Project Context section captures the current understanding of the project. The Decision Log records every significant choice — including decisions **not** to proceed — with full rationale.

Updated by all pipeline skills whenever a decision is made during research, review, merge, verification, correction, or implementation.

## Project Context

> This section is a living summary of everything known about the project. Update it as understanding evolves, but never delete history — when context changes, add a Decision Log entry explaining what changed and why, then update this section to reflect the new state.

### Purpose

<!-- What is this project? What problem does it solve? Who is it for? One to three paragraphs. -->

### Architecture

<!-- High-level architecture: components, data flow, key boundaries, deployment model. Reference system docs where they exist (e.g., "see ARCHITECTURE.md §Auth Layer"). This section should give a reader enough to understand the shape of the system without reading every system doc. -->

### Constraints

<!-- Non-negotiable constraints that bound all decisions: technology mandates, compliance requirements, performance targets, team capacity, timeline commitments, budget limits. When a constraint changes, log the change below and update this section. -->

### Technology Stack

| Layer | Choice | Decided | Rationale | Decision Ref |
|-------|--------|---------|-----------|-------------|
| | | | | |

<!-- Current stack choices. When a stack choice changes, add a Decision Log entry and update this row. Decision Ref links to the D-NNN entry below. -->

### Design Principles

<!-- Governing principles that guide decisions when options are otherwise equal. E.g., "Prefer simplicity over flexibility", "All state changes must be auditable", "Optimize for developer experience over runtime performance". These should be few (3-7) and stable. When a principle is added, removed, or reordered, log the change below. -->

---

## Decision Log

Each entry captures a decision, its full context, what was considered, and why the choice was made. Entries are added chronologically — newest at the bottom.

**Every conflict resolution, rejection, no-go conclusion, and design choice gets an entry.** This includes:
- Research concluding "do not proceed" with a topic
- Review fixes where you disagreed with the reviewer and kept the original
- Merge conflicts where existing text was kept over proposed text (or vice versa)
- Verification findings where the system doc version was preferred over the proposal
- Spec conflicts resolved in favor of one interpretation
- Implementation discoveries that changed a prior design choice
- Technology or library choices, additions, and removals

### Entry Format

> Copy this block for each new entry. Every field is required — if a field doesn't apply, write "N/A" rather than omitting it. The goal is that someone reading this entry in six months has enough context to understand the decision without reading any other document.

```markdown
#### D-NNN — [Short descriptive title]

**Date**: YYYY-MM-DD
**Source**: [What triggered this decision — e.g., "R-001 §Findings", "P-003 review v2 blocking issue #2", "Merge conflict in ARCHITECTURE.md §Auth", "Implementation discovery during T-012", "User decision during discussion"]
**Pipeline Phase**: [research | proposal | review | merge | verify | correct | spec-gen | implementation | ad-hoc]
**Participants**: [Who was involved — e.g., "user + doc-reviewer", "user decision", "doc-researcher recommendation accepted by user"]

**Context**:
[What was the situation? What problem or question triggered this decision? Include enough background that a reader who hasn't seen the source documents can follow along. Reference specific documents and sections where relevant.]

**Options Considered**:
1. **[Option A]** — [Description. Pros: ... Cons: ...]
2. **[Option B]** — [Description. Pros: ... Cons: ...]
3. **[Option C / Do nothing / Do not proceed]** — [Description. Pros: ... Cons: ...]

**Decision**: [What was decided. Be explicit — "We will use X" or "We will NOT adopt Y" or "We will keep the existing Z unchanged".]

**Rationale**: [Why this option over the others. What was the deciding factor? What tradeoff was accepted? If this reverses or supersedes a prior decision, explain what changed.]

**Impact**:
- Documents affected: [List specific docs and sections that were or will be modified]
- Downstream effects: [Specs, tasks, or code that need to change as a result]
- Risks accepted: [Any known downsides of this choice]

**Status**: `active` | `superseded by D-NNN` | `revisited in D-NNN`
```

---

<!-- Decision entries below this line. Do not remove this comment. -->

<!-- clarity-loop-managed -->
