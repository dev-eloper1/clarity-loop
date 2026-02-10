# Document Structure Plan Template

Use this template when the user has approved research (status = `approved`) and is ready
to plan the document structure before generating a proposal.

## Purpose

Document structure planning answers: "What docs do I need, and how do they relate?"

This happens AFTER research is approved but BEFORE proposal generation. The structure is
suggested by the skill, confirmed by the human, and then locked — the proposal must follow
the locked structure.

## Process

### Step 1: Read the Manifest

Read `docs/system/.manifest.md` to understand the current document landscape:
- What system docs exist
- What sections each contains
- How they cross-reference each other

### Step 2: Analyze Research Scope

From the approved research doc, determine:
- How many system docs would this touch?
- Does this need new docs or just modifications to existing ones?
- Are there cross-cutting concerns that span multiple docs?

### Step 3: Apply the Organic Growth Heuristic

First, determine which heuristic applies based on the current doc landscape:

**When system docs already exist** (the common case):

```
Single idea
  |
  +-- Fits in one section of an existing doc?
  |     -> Modify that section (no new docs needed)
  |
  +-- Needs its own section but within existing doc structure?
  |     -> Add section to existing doc
  |
  +-- Too large for a section but single concern?
  |     -> New standalone doc
  |
  +-- Multiple concerns that reference each other?
  |     -> Multiple docs with explicit cross-references
  |
  +-- Reshapes existing doc structure?
        -> Restructure proposal: split/merge/reorganize existing docs
```

**When no system docs exist yet** (empty landscape — post-bootstrap or first research):

```
Research scope
  |
  +-- What kind of project is this?
  |     -> Determines the core doc set (see bootstrap-guide.md for examples)
  |
  +-- What are the main concerns/subsystems?
  |     -> Each major concern typically maps to one system doc
  |
  +-- Are there cross-cutting concerns (security, observability, etc.)?
  |     -> These can be sections in relevant docs or standalone docs
  |     -> Standalone only if the concern is substantial enough
  |
  +-- What's the minimum viable doc set?
        -> Start with 3-5 docs that cover the core. Additional docs come
           through subsequent research cycles, not the initial plan.
```

The empty-landscape heuristic is about "what docs does this project need?" rather than
"what existing docs should change?" It only applies when `docs/system/` has no content
docs (or only has stubs from bootstrap). Once the project has substantive system docs,
always use the existing-landscape heuristic above.

### Step 4: Suggest and Confirm

Present the suggested structure to the user with rationale. The user can:
- **Approve** as-is -> structure is locked
- **Modify** -> incorporate changes, re-present, user confirms -> locked
- **Reject** -> suggest alternative -> loop

Once locked, the structure doesn't change unless the user explicitly requests a restructure.

## Template

```markdown
# Document Plan: [Topic]

**Research**: docs/research/R-NNN-slug.md
**Created**: [date]
**Status**: Suggested | Confirmed | Locked

## Proposed Changes

| # | Action | Target | Section/Doc | Rationale |
|---|--------|--------|------------|-----------|
| 1 | Modify | [existing doc] | Section X | [Why this section needs changes] |
| 2 | Add Section | [existing doc] | (new) Section Y | [What this section covers] |
| 3 | Add Doc | (new) [doc name] | Full doc | [Why a new doc is needed] |
| ... | ... | ... | ... | ... |

**Action types**: `Modify` | `Add Section` | `Add Doc` | `Remove Section` | `Restructure`

## Document Dependency Graph

Show how the proposed docs relate to each other and to existing docs:

```
[existing doc A]
  |-- references --> [existing doc B] (unchanged)
  |-- new section --> references [new doc C]

[new doc C]
  |-- integrates with --> [existing doc A] Section X
  |-- defines contracts for --> [existing doc D] Section Y
```

## Section Outlines

For each new doc or significantly modified existing doc, provide a section outline:

### [Doc Name] (new / modified)

- ## [Section 1 Title] — [one-line description of what this covers]
- ## [Section 2 Title] — [one-line description]
- ## [Section 3 Title] — [one-line description]
- ...

### [Another Doc] (modified)

- ## [Existing Section] — [no changes / minor updates to reference new doc]
- ## [New Section Title] — [one-line description of what this adds]

## Why This Structure

Brief rationale for the overall document organization:
- Why these docs and not fewer/more?
- Why this grouping of concerns?
- How does this fit with the existing doc landscape?

## Confirmation Gate

[ ] User has reviewed the proposed structure
[ ] User has confirmed or modified the plan
[ ] Structure is locked — proposal generation may proceed
```

## Guidance

**Don't over-structure.** If the research scope maps cleanly to modifications in 1-2
existing docs, the plan is just a table with 2 rows. Don't create new docs when existing
ones will do.

**Respect the existing landscape.** The plan should fit naturally into the project's
current doc structure. Don't reorganize everything just because one new topic was researched.

**Section outlines are just outlines.** Don't write content — that's the proposal's job.
The plan establishes structure; the proposal fills it in.

**Lock means lock.** Once the user confirms, the structure is fixed. If the proposal
generation process reveals that the structure needs changes, stop and ask the user rather
than silently restructuring.
