# cl-researcher

The research and proposal generation skill. Takes ideas from vague problem statements to structured, reviewable proposals through a multi-turn conversational process grounded in existing system documentation.

**Command**: `/cl-researcher [mode]`

---

## Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| `bootstrap` | "bootstrap", "set up docs", "initialize docs" | Create initial system docs for greenfield projects |
| `bootstrap-brownfield` | "bootstrap existing", "set up docs for existing project" | Create system docs for existing codebases (reads code first) |
| `triage` | Implicit on research start | Assess complexity before launching full research |
| `research` | "research [topic]", "explore", "investigate" | Multi-turn research cycle with system doc context |
| `structure` | "structure", "plan the docs" | Plan document structure after research approval |
| `proposal` | "generate proposal", "proposal from R-NNN.md" | Convert approved research into a reviewable proposal |
| `context` | "create context", "context [library]" | Create/update per-library knowledge files for accurate implementation |

---

## Bootstrap

Creates the initial system doc set. Detects your starting point and adapts.

### Three Starting Points

**Greenfield** (no code, no docs):
1. Discovery conversation about your project — goals, users, tech stack, constraints,
   security strategy, data sensitivity, compliance requirements, deployment targets,
   observability needs, data lifecycle decisions, code organization, performance targets
2. Project profile detection (auto-detect, quick research, or presets) captures error
   handling, API conventions, dependency policy, and other cross-cutting decisions
3. Suggests initial doc set based on project type
4. Generates starting system docs with `[TBD]` markers for areas needing more detail

The discovery conversation includes security-specific depth probing. Most other cross-
cutting decisions (error handling, API style, accessibility, etc.) are captured by the
project profile system and defaults sheet.

**Brownfield with existing docs** (project docs, wiki exports, AI-generated research from ChatGPT/Claude):
1. Discovers existing documentation files
2. Assesses quality and freshness
3. You choose the import path:

| Path | Best When | What Happens |
|------|-----------|-------------|
| **Import + Audit** | You trust the docs (recent AI research, fresh project docs) | Migrates into system docs, immediately suggests [audit](cl-reviewer.md#audit) to verify quality |
| **Research Context + Regenerate** | Docs might be stale or uncertain quality | Copies into `docs/research/` as reference, runs fresh discovery conversation informed by old docs, generates new system docs |

The import path is fast — your existing work becomes the system docs and an audit catches any issues. The regeneration path is thorough — no stale claims sneak through, but the old docs still accelerate the conversation.

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
- [Emerged concepts](pipeline-concepts.md#emerged-concepts) parked in PARKING.md

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

This manifest is the contract that the [reviewer](cl-reviewer.md) verifies and the [verify step](cl-reviewer.md#verify) uses to confirm completeness.

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

Review is NOT auto-triggered — you read and refine at your own pace, then explicitly request review. See [cl-reviewer](cl-reviewer.md) for the review process.

---

## Context Mode

Creates and maintains per-library context files that bridge the gap between LLM training data and current library reality. Context files use a three-layer progressive disclosure model and are consumed by all skills.

### Entry Points

- **Auto-offer**: After bootstrap generates an Architecture doc, the skill offers to create context for the declared tech stack
- **Manual**: `/cl-researcher context [library]` — create or refresh for a specific library or all libraries
- **Feedback loop**: The cl-implementer's `context-gap` classification routes library knowledge errors back here

### What Context Files Contain

The delta between what the LLM knows and what's actually true for the library version in use:

| Content | Example |
|---------|---------|
| Version pinning | "This covers Drizzle ORM 0.38.x on better-sqlite3 11.x" |
| Breaking changes | "In v4, Tailwind replaced tailwind.config.js with CSS-based @theme" |
| Correct imports | "Use `import { sqliteTable } from 'drizzle-orm/sqlite-core'`" |
| Working patterns | Tested code snippets for common operations |
| Common errors | Error messages and their fixes |
| Gotchas | Non-obvious behavior the LLM would miss |

### Three-Layer Disclosure

| Layer | File | When Loaded | Cost |
|-------|------|-------------|------|
| 1 — Index | `.context-manifest.md` | Always (task start) | ~50 tokens/library |
| 2 — Overview | `{library}/_meta.md` | Working with that library | ~500-2000 tokens |
| 3 — Detail | `{library}/{topic}.md` | On demand | Variable |

### Staleness Model

Context staleness is **version-pinned**, not time-based. A context file is valid as long as the project uses the version it covers. Version changes trigger update/versioning decisions. A 1-week soft check catches errata within the current version range.

For the full process, loading protocol, and versioning rules, see the [context mode reference](../skills/cl-researcher/references/context-mode.md).

---

## Related

- [cl-reviewer](cl-reviewer.md) — Reviews, fixes, merges, and verifies proposals
- [cl-implementer](cl-implementer.md) — Generates implementation specs from verified system docs
- [Pipeline Concepts](pipeline-concepts.md) — Protection model, tracking files, manifest
- [Hooks](hooks.md) — System doc protection and manifest generation
