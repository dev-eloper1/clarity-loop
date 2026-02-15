# Decisions

The system-wide decision journal for this project. Every skill reads this file at session start and writes to it when decisions are made.

**Two sections:**
- **Project Context** — living summary of the project (kept current after merges that change architecture)
- **Decision Log** — chronological entries for every decision that shapes the system

**How this relates to other decision surfaces:**
Research docs have a lightweight Decision Log table. Proposals have a Design Decisions table. Those capture decisions *in context* — useful while working on that research or proposal. This file is the *system-wide index* — decisions are extracted here so that every skill can check prior decisions before making new ones. If a decision only matters within a single research cycle and doesn't constrain future work, it stays local. If it could affect other skills, future research, or implementation, it propagates here.

## Project Context

> Living summary of the project. Updated during bootstrap and after any merge that changes the architecture, constraints, or technology stack. When Project Context changes, add a Decision Log entry explaining what changed and why, then update this section.

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

Entries are added chronologically — newest at the bottom. Every skill reads this log at session start to avoid contradicting prior decisions.

### What Gets Logged

Not every choice is a decision entry. The threshold is: **would a future skill or session need to know this to avoid contradicting it?**

**Log it:**
- Technology or library choices, additions, and removals
- Architecture pattern decisions (monolith vs. microservices, auth strategy, data model choices)
- Research concluding "do not proceed" — future research on the same topic needs to know
- Proposal rejections with rationale — so the same approach isn't re-proposed
- Merge conflict resolutions where the choice wasn't obvious
- Implementation discoveries that changed a prior design assumption
- Triage decisions for L2+ topics — why this complexity level was chosen
- Spec gap resolutions where the user made a design call

**Don't log it:**
- Routine triage at L0/L1 — unless the user overrode the assessment
- Mechanical corrections (typo fixes, broken references, formatting)
- Proposal approvals without conflict — the approval itself is tracked in PROPOSAL_TRACKER.md
- Implementation tasks completing normally — tracked in TASKS.md
- L1 spec gaps where the user accepted the default assumption unchanged

### Entry Formats

**Full entry** — for architectural decisions, technology choices, conflict resolutions, and anything where the reasoning is complex or the decision is likely to be revisited:

```markdown
#### D-NNN — [Short descriptive title]

**Date**: YYYY-MM-DD
**Source**: [What triggered this — e.g., "R-001 §Findings", "P-003 review v2", "Merge conflict in ARCHITECTURE.md §Auth", "Implementation gap G-003 during T-012"]
**Pipeline Phase**: [research | proposal | review | merge | verify | correct | audit | sync | spec-gen | implementation | design | bootstrap | ad-hoc]

**Context**:
[What was the situation? What problem or question triggered this decision? Include enough background that a reader in six months can follow along.]

**Options Considered**:
1. **[Option A]** — [Description. Pros: ... Cons: ...]
2. **[Option B]** — [Description. Pros: ... Cons: ...]

**Decision**: [What was decided — "We will use X" or "We will NOT adopt Y".]

**Rationale**: [Why this option. What tradeoff was accepted? If this reverses a prior decision, explain what changed.]

**Impact**: [Docs affected, downstream effects, risks accepted.]

**Status**: `active` | `superseded by D-NNN` | `revisited in D-NNN`
```

**Compact entry** — for triage assessments, straightforward conflict resolutions, and decisions where the context is already documented elsewhere:

```markdown
#### D-NNN — [Short descriptive title]

**Date**: YYYY-MM-DD | **Phase**: [phase] | **Source**: [ref]
**Decision**: [What was decided.]
**Rationale**: [One to two sentences — why.]
**Status**: `active`
```

Use full entries by default. Use compact entries only when the source document (research doc, audit report, sync report) already contains the full context and options analysis — the compact entry just records which option was chosen and why.

---

<!-- Decision entries below this line. Do not remove this comment. -->

<!-- clarity-loop-managed -->
