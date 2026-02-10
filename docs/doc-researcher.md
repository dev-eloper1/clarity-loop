# doc-researcher

The research and proposal generation skill. Takes ideas from vague problem statements to structured, reviewable proposals through a multi-turn conversational process grounded in existing system documentation.

**Command**: `/doc-researcher [mode]`

---

## Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| `bootstrap` | "bootstrap", "set up docs", "initialize docs" | Create initial system docs for new or existing projects |
| `triage` | Implicit on research start | Assess complexity before launching full research |
| `research` | "research [topic]", "explore", "investigate" | Multi-turn research cycle with system doc context |
| `structure` | "structure", "plan the docs" | Plan document structure after research approval |
| `proposal` | "generate proposal", "proposal from R-NNN.md" | Convert approved research into a reviewable proposal |

---

## Bootstrap

Creates the initial system doc set. Detects your starting point and adapts.

### Three Starting Points

**Greenfield** (no code, no docs):
1. Discovery conversation about your project — goals, users, tech stack, constraints
2. Suggests initial doc set based on project type
3. Generates starting system docs with `[TBD]` markers for areas needing more detail

**Brownfield with existing docs**:
1. Discovers existing documentation files
2. Suggests reorganization into the Clarity Loop structure
3. Migrates content, preserving what's valuable

**Brownfield with code, no docs**:
1. Analyzes codebase structure (directories, dependencies, patterns)
2. Runs discovery conversation informed by what the code reveals
3. Generates docs reflecting both code reality and intended direction

### Initial Doc Templates

The doc set adapts to project type:

| Project Type | Typical Docs |
|--------------|-------------|
| API / backend service | PRD, ARCHITECTURE, API_DESIGN, DATA_MODEL |
| Full-stack app | PRD, ARCHITECTURE, TDD, DATA_MODEL |
| Library / SDK | PRD, API_DESIGN, USAGE_GUIDE |
| Infrastructure / platform | PRD, ARCHITECTURE, OPERATIONS, SECURITY |

---

## Triage

Before launching a full research cycle, triage evaluates complexity to determine the right pipeline depth. See [Pipeline Depth](pipeline-concepts.md#pipeline-depth) for the four levels.

### Heuristic Evaluation

The skill evaluates four signals:

- **Doc impact**: How many system docs are affected (1 = contained, 3+ = complex)
- **Clarity**: How well-understood the problem is (clear = lower, fuzzy = higher)
- **Novelty**: New concepts vs. modifications to existing (new = higher)
- **Cross-cutting concerns**: Security, performance, data model changes push complexity up

---

## Research

The core research mode. A multi-turn conversational process with five phases.

### Phase 1: Learn the System

Reads the [manifest](pipeline-concepts.md#manifest-based-context-loading) to understand the current doc landscape, then does targeted reads of the 1-3 most relevant system docs for the topic.

### Phase 2: Gather Requirements

A multi-turn conversation to understand what you need. The skill:

- Determines research type: **Evolutionary** (changing existing), **Net new** (new capability), or **Hybrid** (new + changes to existing)
- Asks about the problem, constraints, approaches, success criteria
- References system docs throughout ("Your architecture currently uses X, so this would affect...")
- Summarizes understanding and confirms before proceeding

### Phase 3: Conduct Research

Deep analysis grounded in your system docs:

- Reads relevant system docs in full
- Analyzes the problem space — what changes, what stays, options, tradeoffs, risks, dependencies
- Researches external approaches if applicable
- Synthesizes findings addressing your specific questions

### Phase 4: Generate Research Doc

Creates `docs/research/R-NNN-slug.md` with these sections:

| Section | Content |
|---------|---------|
| **Status** | Type, status, open questions, discussion rounds, complexity level |
| **System Context** | Which system docs are affected, with specific section references |
| **Current State** | What exists today in the system |
| **Scope** | In scope, out of scope, constraints |
| **Research Findings** | Organized by theme — context, analysis, tradeoffs, sources |
| **Options Analysis** | Approaches compared with criteria |
| **Recommendations** | Primary recommendation with rationale, risks, doc impact preview |
| **Decision Log** | What was considered and decided during discussion |
| **Emerged Concepts** | Ideas that surfaced but aren't the main topic |
| **Open Questions** | Questions needing your input |

### Phase 5: Refine

Research docs are living documents until approved:

- Added to [RESEARCH_LEDGER.md](pipeline-concepts.md#tracking-files) with status `draft`
- Refined in-place based on your feedback
- Open questions resolved through continued discussion
- When you're satisfied, status changes to `approved`
- [Emerged concepts](pipeline-concepts.md#emerged-concepts) captured in STATUS.md

---

## Structure

Plans document structure before proposal generation. Determines how research findings map to system doc changes.

### When to Use

| Complexity | Structure Mode |
|-----------|---------------|
| L0 (Trivial) | Skip — no pipeline |
| L1 (Contained) | Optional |
| L2 (Complex) | Always |
| L3 (Exploratory) | Always |

### Organic Growth Heuristic

The skill applies these rules to decide doc structure:

- Single-section change → modify existing section
- New section in existing topic → add section to existing doc
- Large standalone concern → new doc
- Multiple inter-referencing concerns → multiple docs with cross-refs
- Reshaping existing structure → restructure proposal

### Output

A structure plan with:
- Suggested changes table (doc, section, change type)
- Document dependency graph
- Section outlines
- Rationale for structural decisions

You confirm the structure before proposal generation begins.

---

## Proposal

Transforms an approved research doc into a concrete, reviewable proposal.

### Prerequisites

- Approved research doc (status = `approved`)
- System doc manifest loaded
- Document plan (if structure mode was used)
- No conflicting in-flight proposals for same sections

### Change Manifest

The heart of every proposal. A table mapping each change to:

| Field | Description |
|-------|-------------|
| Change description | What's changing |
| Target doc | Which system doc |
| Target section | Which section within that doc |
| Change type | `Modify` · `Add` · `Add Section` · `Add Doc` · `Remove` · `Restructure` |
| Research ref | Which research finding drives this change |

This manifest is the contract that the [reviewer](doc-reviewer.md) verifies and the [verify step](doc-reviewer.md#verify) uses to confirm completeness.

### Proposal Structure

| Section | Content |
|---------|---------|
| **Header** | ID, date, status, research reference, dependencies |
| **Summary** | What changes, why, expected impact |
| **Research Lineage** | Which findings inform the proposal |
| **System Context** | Current state → proposed state with doc references |
| **Change Manifest** | The change contract table |
| **Cross-Proposal Conflicts** | Other in-flight proposals touching same sections |
| **Detailed Design** | Per-change: what, why, system doc impact, dependencies |
| **Design Decisions** | What was decided, alternatives, rationale |
| **Risks** | Risk, likelihood, impact, mitigation |

### After Generation

The proposal is added to [PROPOSAL_TRACKER.md](pipeline-concepts.md#tracking-files) with status `draft`. The skill tells you: "Proposals generated. Read them over and let me know when you'd like to run them through the review gate."

Review is NOT auto-triggered — you read and refine at your own pace, then explicitly request review. See [doc-reviewer](doc-reviewer.md) for the review process.

---

## Related

- [doc-reviewer](doc-reviewer.md) — Reviews, fixes, merges, and verifies proposals
- [doc-spec-gen](doc-spec-gen.md) — Generates implementation specs from verified system docs
- [Pipeline Concepts](pipeline-concepts.md) — Protection model, tracking files, manifest
- [Hooks](hooks.md) — System doc protection and manifest generation
