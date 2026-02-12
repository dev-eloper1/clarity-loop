# Design Lineage: Clarity Loop

**Date**: 2026-02-08
**Status**: Implemented (v0.1.0)
**Origin**: Hermit project's doc governance pipeline, developed organically during system design

---

## Problem Statement

When building complex, multi-part systems (full-stack apps, distributed systems, or any project where the idea isn't fully formed yet), you need to iterate on documentation until it's crystal clear and technically correct before writing code. The pain points:

1. **Complexity overwhelms humans** — 5+ interconnected docs drift from each other without structured review
2. **No "done" signal** — there's no clear point where docs are precise enough to implement from
3. **Ad-hoc AI generation produces slop** — without structured gates, AI generates plausible-sounding but inconsistent documentation
4. **Context rot** — long sessions degrade AI output quality; heavy docs exhaust context windows
5. **Document structure is unclear upfront** — you don't know whether you need 1 file or 12 until you're deep into the problem

**The goal**: A spec-first development lifecycle where you iterate over docs until they're clear enough to generate structured specs that a junior dev (or AI) can implement without hand-holding.

**When you DON'T need this**: Simple apps, single-file features, well-understood problems with obvious solutions. The overhead of the full pipeline isn't justified when the problem fits in your head.

**When you DO need this**: Complex full-stack applications, distributed systems, unclear initial ideas that need exploratory iteration, systems where multiple docs must stay consistent, regulated environments needing audit trails.

---

## Philosophy

> **AI does the work. Humans make the calls. Files hold the truth.**

This philosophy emerged organically from building the plugin — it wasn't designed top-down,
but every design decision turned out to follow these six principles:

### 1. React, don't originate

The human never faces a blank page. At every step — research, proposals, design tokens,
component libraries, screen mockups, build plans — the AI generates first, then the human
evaluates. The user sees a proposed token table and says "make the blues warmer." They see
a screenshot and say "the spacing is too tight." Even the design discovery conversation
works this way: ask for screenshots and component library names (concrete references),
not "describe your ideal aesthetic" (abstract origination).

**Why this matters**: Humans are better evaluators than originators when working with AI.
Generating from scratch requires holding the full problem in your head. Reacting to a
proposal only requires judgment about whether it's right — and that judgment is exactly
what humans are good at.

**Seen in**: Suggest-confirm-lock document structure (Decision 1), design discovery
conversation (visual references before abstract questions), proposal → review flow
(not "write the system doc directly").

### 2. Judgment is the bottleneck, not effort

The pipeline minimizes human *effort* (the AI writes, researches, cross-references, tracks
state, checks consistency) but maximizes human *judgment* (every gate is an approval, every
artifact is reviewed, every direction requires confirmation). The human is the quality
mechanism — the system does all the work to make that judgment effective.

This means: show one section at a time (not the full canvas). Explain what the user is
looking at ("the middle shade is for buttons, the lightest for backgrounds"). Use
screenshots instead of descriptions. Flag inconsistencies the human would never catch
manually across 10+ docs.

**Seen in**: Six-dimension review (Decision 2 rationale), design feedback loops (screenshot
→ explain → feedback), spec-readiness as advisory (not blocking), audit drift detection.

### 3. The system remembers so the human doesn't have to

Every decision is recorded with rationale in persistent files. DESIGN_PROGRESS.md captures
which MCP path was selected, what colors the user approved, which components passed review.
PROPOSAL_TRACKER.md knows which proposals are in-flight. STATUS.md shows the full pipeline
state. Emerged concepts are captured the moment they surface.

Conversations are ephemeral — context compresses, sessions end, models change. But the
artifacts are permanent. If a session crashes at 2am, the pipeline picks up from the last
recorded state the next morning. The human never has to remember "what did we decide about
the color palette last Tuesday?"

**Seen in**: Markdown state files (Decision 3), DESIGN_PROGRESS.md persistence across
sessions, emerged concepts tracking (always-on capture), manifest-based context loading
(Decision 4).

### 4. Structured iteration beats one-shot generation

No artifact is generated once and trusted. Everything loops: generate → present → feedback
→ refine. Research → proposal → review → fix → re-review. Tokens → components → mockups.
The pipeline assumes the first output might be wrong and builds correction into the process.

This is the antidote to AI slop. Without structured gates, AI generates plausible-sounding
but inconsistent documentation. With gates, each pass catches what the previous one missed:
the reviewer catches cross-doc contradictions the researcher missed; the verify step catches
incomplete merges; the audit catches drift that accumulated across many proposals.

**Seen in**: Multi-stage pipeline (the entire architecture), re-review with cumulative
issue ledger, post-merge verification, periodic audits, design generate → screenshot →
feedback → refine loop.

### 5. Process protects the product — proportionally

System docs are pipeline-protected. You can't just edit them — a PreToolUse hook blocks
direct writes. This isn't bureaucracy; it's recognition that consistency across many
documents requires structured gates.

But not everything needs the full pipeline. Triage determines depth: trivial changes skip
the pipeline entirely, contained changes get a lightweight path, complex changes get the
full treatment. The correction shortcut lets audit findings bypass research when the
diagnosis is already clear. The ceremony matches the risk.

**Seen in**: Pipeline-protected system docs (Decision 6), triage-based depth (Decision 9),
correction shortcut, code-doc sync as advisory (Decision 10).

### 6. Tools enhance, never gate

Pencil MCP gives you visual design artifacts, screenshots, and interactive feedback loops.
But without it, the pipeline still works — markdown fallback produces identical
documentation (token catalogs, component specs, screen descriptions). The only difference
is no .pen files.

This means the core value — going from vague idea to implementable spec — is always
available regardless of what tools the user has installed. Better tools make the process
richer, but the floor is always useful.

**Seen in**: Dual-path design skill (Decision 11), markdown fallback as first-class path,
manifest-based context loading (no external tools needed).

---

### How the Principles Interact

The principles reinforce each other:

- **React + Judgment**: The AI generates so the human can react; the human's reaction is
  the judgment that gates the next step
- **Remember + Iteration**: State files make iteration possible across sessions; without
  persistence, iteration resets to zero every time
- **Process + Proportional**: The pipeline protects quality, but triage ensures the
  protection doesn't become overhead for simple changes
- **Tools + React**: Better tools (Pencil MCP) give the human richer artifacts to react to
  (screenshots vs. text descriptions), but the reaction loop works either way

---

## Prior Art Research

### BMAD (Breakthrough Method of Agile AI-Driven Development)

An open-source framework (MIT, ~35k stars) that structures the full SDLC with AI. Role-based agent personas (PM, Architect, Dev, QA, etc.) generate cascading artifacts through a phased pipeline.

**Key strengths**:
- Scale-adaptive document generation via complexity routing (Levels 0-4)
- Formal document sharding with discovery protocol (split on `##` headings, `index.md` TOC)
- Implementation readiness gate before code is written
- Progressive disclosure (AI sees one step at a time)
- Tri-modal workflows (create/validate/edit)

**Key weaknesses**:
- Role-based agent model is heavy (21+ personas)
- Sequential pipeline — PM finishes before Architect starts
- Enterprise-oriented; solo devs find it bureaucratic
- No iterative human discussion loop — review is validate/edit, not conversation

### GSD (Get Shit Done)

An anti-bureaucracy spec-driven framework (~8.5k stars, MIT) for Claude Code. Focuses on context rot elimination through subagent delegation.

**Key strengths**:
- Context rot solved via fresh subagent contexts per heavy task
- Human discussion phase before planning (discuss -> plan)
- Minimal ceremony; 4 core commands
- Parallel research subagents
- Atomic git commits per task

**Key weaknesses**:
- Less comprehensive documentation output
- No formal review/validation gate between doc phases
- No document sharding strategy for large docs
- No audit/drift detection
- No emerged concepts tracking

### claude-mem

Persistent memory plugin for Claude Code (AGPL-3.0). Captures observations during sessions, compresses with AI, injects relevant context into future sessions.

**Relevance**: Demonstrates the full plugin packaging model — hooks (5 lifecycle events), MCP tools, skills, slash commands, CLAUDE.md injection. The progressive disclosure pattern (search -> timeline -> full details for ~10x token savings) influenced the manifest-based context loading design.

### Competitive Landscape Gaps

| Capability | Coverage | Gap? |
|-----------|----------|------|
| ADR/RFC creation (CLI) | Well-served (adr-tools, log4brains, MADR) | No |
| Template management | Well-served (MADR, dotnet-adr) | No |
| Prose linting/validation | Well-served (Vale, markdownlint) | No |
| Scale-adaptive doc generation | BMAD only | Partially |
| Context rot management | GSD only | Partially |
| **Iterative human discussion loops with state tracking** | Nothing | **Yes** |
| **Multi-stage pipeline with structured review gates** | Nothing | **Yes** |
| **AI-assisted generation + AI review + human gates** | Nothing | **Yes** |
| **Cross-document consistency verification** | Nothing | **Yes** |
| **Spec generation from validated docs** | Nothing | **Yes** |
| **Emerged concepts / research queue tracking** | Nothing | **Yes** |

---

## Design Decisions

### 1. Suggest-Confirm-Lock Document Structure

**Question**: Should document structure be opinionated (BMAD's fixed cascade) or freeform?

**Decision**: Suggest, confirm, lock. The plugin suggests structure based on research scope, the human confirms, then it's locked unless the human explicitly requests a restructure. This avoids both the rigidity of BMAD's fixed cascade and the chaos of no structure.

**Principles**: React, don't originate (AI suggests, human confirms) + Judgment is the bottleneck (human decides structure, AI does the work of generating it).

### 2. Focused Skills, Not One Mega-Skill

**Question**: How many skills? One monolith, or many small ones?

**Decision**: Five skills — `cl-researcher` (triage + research + structure + proposals), `cl-reviewer` (review + merge + verify + audit + correct + fix + sync + design review), `cl-implementer` (spec generation + consistency review), `cl-designer` (design discovery + tokens + mockups + build plan), `cl-implementer` (task generation + implementation tracking + verification + spec sync).

**Rationale**:
- Triage is lightweight — lives inside cl-researcher as the entry point, not its own skill
- Structure planning is tightly coupled to research — separating it fragments the flow
- Spec generation has different inputs (all system docs, not one proposal) and a different execution model (waterfall). It earns its own skill
- Review, verify, audit, merge, correct, fix, and sync are all "checking and applying" operations on the same artifact types — one skill with modes keeps them cohesive

**Principles**: Structured iteration (creation and validation are separate skills with separate mindsets).

### 3. Markdown Files for State, Not SQLite

**Question**: How to persist pipeline state across sessions?

**Decision**: Four markdown tracking files — `DECISIONS.md`, `RESEARCH_LEDGER.md`, `PROPOSAL_TRACKER.md`, `STATUS.md`. File-based state is simpler, git-friendly, and sufficient for the tracking needs. `STATUS.md` serves as the high-level dashboard, `DECISIONS.md` captures architectural choices and conflict-resolution rationale with full project context.

**Principles**: The system remembers (decisions persist in files, not memory) + Files hold the truth (git-friendly, survives session crashes).

### 4. Manifest-Based Context Loading, Not AI Summarization

**Question**: How should skills orient themselves in the doc landscape without reading every doc?

**Decision**: A lightweight auto-generated `.manifest.md` index (section headings with line ranges, cross-references, content hash) rather than an AI-summarized context cache. Skills read the manifest first, then do targeted `Read` calls for only the sections they need.

| | AI-Summarized Cache | Manifest (chosen) |
|---|---|---|
| **Generation** | AI-powered (expensive, non-deterministic) | Heading + line parsing (cheap, deterministic) |
| **Context cost** | Full digest loaded every time (~256KB) | Thin index (~2-5KB) + targeted reads |
| **Staleness** | Must regenerate manually | Auto-regenerated via PostToolUse hook |
| **Flexibility** | One summary for all use cases | Skills load what they need per-task |

**Principles**: Judgment is the bottleneck (targeted reads mean skills spend tokens on judgment, not ingestion) + The system remembers (manifest auto-regenerates, always current).

### 5. Waterfall Spec Generation

**Question**: Should specs be generated incrementally as docs are updated, or in one shot after all docs are stable?

**Decision**: Waterfall. All system docs must be complete and verified before specs are generated. If docs change later, specs regenerate from scratch.

**Rationale**: Incremental spec merging across features is extremely messy — conflicts, stale references, partial overwrites. The whole point of the doc pipeline is to get docs to a stable, verified state first. Once stable, spec generation is a clean one-shot derivation.

**Principles**: Structured iteration (docs must be stable before specs) + Process protects the product (verification gate before generation).

### 6. Pipeline-Protected System Docs

**Question**: How to prevent ad-hoc edits that bypass the review pipeline?

**Decision**: A `PreToolUse` hook blocks all direct writes to `{docsRoot}/system/`. Three operations can temporarily authorize edits via a structured `.pipeline-authorized` marker: bootstrap (initial creation), merge (applying approved proposals), and correct (targeted fixes from audit findings). The marker is created before edits and removed immediately after.

**Principles**: Process protects the product (the hook IS the protection) + Proportionally (three authorized operations provide escape hatches for legitimate changes).

### 7. Configurable Docs Root

**Question**: What if a project already uses `docs/system/` for other purposes?

**Decision**: A single `docsRoot` field in `.clarity-loop.json` (default `"docs"`). All paths derive from this prefix. The init script detects collisions with existing files and prompts the user to choose an alternative root. Skills read the config at session start and resolve all paths relative to it.

### 8. Flexible Spec Format

**Question**: Should spec output be prescribed (e.g., always OpenAPI)?

**Decision**: Flexible. The plugin suggests a format based on doc content — OpenAPI for API-heavy systems, JSON Schema for data-heavy ones, component specs for UI-heavy ones. The human confirms or overrides. An AI review then checks cross-spec consistency.

**Principles**: React, don't originate (AI suggests format, human confirms) + Judgment is the bottleneck (the human chooses, the AI generates).

### 9. Triage-Based Pipeline Depth

**Question**: Should every change go through the full pipeline?

**Decision**: Hybrid triage — AI suggests complexity level, human confirms. Four levels inspired by BMAD's scale-adaptive routing:

| Level | When | Pipeline |
|-------|------|----------|
| 0 - Trivial | Typo, config tweak | Direct edit (no pipeline) |
| 1 - Contained | Single feature, clear scope | Research note -> system doc update |
| 2 - Complex | Cross-cutting, multi-doc impact | Full pipeline |
| 3 - Exploratory | Unclear idea, needs discovery | Extended research -> full pipeline |

**Principles**: Process protects the product — proportionally (right-sized ceremony per change) + Judgment is the bottleneck (AI suggests level, human confirms).

### 10. Code-Doc Sync as Advisory Mode

**Question**: How to detect when code drifts from what system docs claim?

**Decision**: An on-demand `/cl-reviewer sync` mode that extracts verifiable claims from system docs (file structure, dependencies, API shapes, config values) and checks them against the actual codebase. Two scopes: full scan or git-diff targeted. Output is an advisory report — findings feed into corrections or research cycles. The mode does not modify docs directly.

**Principles**: Structured iteration (sync detects drift, findings feed back into the pipeline) + The system remembers (sync report is a persistent artifact, not a one-time check).

### 11. Visual Design as Separate Skill

**Question**: Should the plugin handle UI/UX design, and if so, how?

**Decision**: A separate `cl-designer` skill that owns the entire design flow. **Pencil
MCP** generates designs from scratch — .pen files with tokens, components, and mockups
created through a discovery + generate + screenshot + feedback loop. A **markdown
fallback** produces equivalent structured specs when Pencil is not available. Both paths
produce the same documentation artifacts (DESIGN_SYSTEM.md, UI_SCREENS.md,
DESIGN_TASKS.md). No separate UI_UX_DESIGN.md system doc — the skill's discovery
conversation replaces the text-based design spec. The discovery phase supports visual
input (screenshots, component library research) to short-circuit preference questions.

**Rationale**:
- Text-based design specs (colors, spacing) are hard to evaluate without seeing them
- Visual references and component library research during discovery reduce iteration
- Design review belongs in cl-reviewer (separation of creation and validation)
- Three trigger points (post-merge nudge, audit finding, on-demand) ensure design
  is suggested when relevant but never forced
- Markdown fallback ensures value even without design MCP tools
- Figma MCP support deferred to V2 (extract from existing Figma designs)

**Principles**: React, don't originate (screenshots and visual references before abstract questions; user evaluates generated designs, never creates from scratch) + Tools enhance, never gate (Pencil adds visual feedback, markdown fallback is fully functional) + Structured iteration (generate → screenshot → feedback → refine loop) + Judgment is the bottleneck (user sees one section at a time with explanations, makes approval decisions).

### 12. Post-Spec Implementation Tracking with Queue Semantics

**Question**: What happens after specs are generated? Should the pipeline end at specs, or extend through implementation?

**Decision**: A new `cl-implementer` skill that extends the pipeline from specs to working code. The skill generates a unified `TASKS.md` from ALL spec artifacts (tech specs + DESIGN_TASKS.md), organized by implementation area with a cross-area Mermaid dependency graph. It tracks progress via `IMPLEMENTATION_PROGRESS.md`, handles spec changes mid-implementation via queue semantics (process front-to-back, validity-check before each task, pop/replace if superseded), and feeds gaps back into the pipeline through the existing triage mechanism (L0-L2).

Three mechanisms handle real-world development messiness:
- **Fix tasks (F-NNN)**: Runtime failures and regressions are distinct from spec gaps ("spec is right, code is wrong"). Fix tasks are created, prioritized, and trigger cascading re-verification of transitive dependents.
- **Reconciliation on resume**: Git-diff-based detection of external changes (user edits, other tools, manual work). The skill maps changed files to tracked tasks and presents a reconciliation summary. User decides: re-verify, skip, or mark as `externally-managed`.
- **Tangent tolerance**: The queue is the plan, not the process. The skill is stateless about HOW code was written, only cares WHETHER acceptance criteria are met. Supports off-script work, manual edits, and multi-day absences through full reconciliation.

The skill uses dual-write tracking: TASKS.md is the persistent source of truth (survives sessions), Claude Code's `TaskCreate`/`TaskUpdate` is the active session view.

**Rationale**:
- The pipeline's value proposition was incomplete — structured process from idea to spec, then unstructured implementation
- Implementation is a distinct activity requiring main context (interactive), not fork (heavy subagent)
- Queue semantics are simpler than impact analysis — same process handles all spec change scenarios (additive, modificatory, superseding)
- Reuses existing pipeline concepts: pipeline depth for gap triage, emerged concepts for discoveries, sync mode for code-doc alignment
- Fix tasks distinguish "spec is wrong" (gap triage) from "code is wrong" (fix task) — different resolution paths
- Reconciliation respects the user's autonomy — external changes are legitimate, the skill adapts rather than gates
- Two dry runs (20 scenarios, 15 edge cases found and resolved) validated the design

**Principles**: Structured iteration (implement → verify → feedback → continue loop) + The system remembers (TASKS.md + IMPLEMENTATION_PROGRESS.md persist across sessions) + Judgment is the bottleneck (user approves task order, parallel groups, reconciliation decisions) + React, don't originate (AI generates task plan, user reacts and adjusts).

### 13. Implementation Context as Progressive Knowledge Files

**Question**: How should the plugin provide accurate, current library knowledge to skills?

**Decision**: Per-library context files using three-layer progressive disclosure (manifest index → library overview → detail files). Created by the cl-researcher through web research against official docs and context7.com (website, not MCP). Consumed by all skills via a standard loading protocol. Staleness is version-pinned, not time-based — context matches the library version in use, and is versioned (not replaced) when the project upgrades. Stored locally in `{docsRoot}/context/`, optionally promoted to global `~/.claude/context/`.

**Rationale**:
- Context7 MCP was rejected because it bloats the session context with raw API dumps (~9.7k tokens per query). Context files are fetched once during research, distilled into curated files, and loaded selectively (~50-2000 tokens per task).
- The researcher already does web research and produces structured output — context creation is a natural extension, not a new skill.
- Version-pinned staleness prevents mid-implementation context churn that would make existing code inconsistent with updated context.
- Three-layer disclosure is a proven pattern (Claude Code skills, Cursor rules, MCP meta-tools) with minimal overhead (1-2 extra file reads) and significant context savings.
- Local-first storage means context is a project artifact (committed, reviewed), while global promotion enables cross-project reuse of validated knowledge.

**Principles**: The system remembers (context files persist library knowledge across sessions) + Tools enhance, never gate (context files are optional — pipeline works without them) + Judgment is the bottleneck (user reviews all context before it's written, decides on version updates and global promotion) + React, don't originate (researcher generates context, user evaluates and approves).

---

## What We Took from Each Framework

### From BMAD
- Scale-adaptive routing (not everything needs the full pipeline)
- Implementation readiness gate (formal "are we ready to build?" checkpoint)
- Progressive disclosure (AI sees one step at a time)

### From GSD
- Human discussion before planning (the "discuss" phase that locks preferences)
- Fresh subagent contexts per heavy task (prevents context rot)
- Anti-bureaucracy ethos (complexity in the system, simplicity in the interface)

### What Neither Framework Does (Our Contribution)
- Iterative human discussion loops with state tracking
- Cross-document consistency verification (docs reviewed as a system, not individually)
- Emerged concepts tracking (ad-hoc ideas captured and queued)
- Adaptive document structure planning (suggest-confirm-lock)
- Spec generation from validated docs (the intermediate spec layer)
- Audit and drift detection (periodic health checks + code-doc sync)
- Pipeline-protected system docs with authorization markers

---

## Sources

- [BMAD Method Documentation](https://docs.bmad-method.org/)
- [BMAD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [GSD GitHub](https://github.com/glittercowboy/get-shit-done)
- [claude-mem GitHub](https://github.com/thedotmack/claude-mem)
- [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins)
- [Claude Code Hooks Reference](https://code.claude.com/docs/en/hooks)
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Applied BMAD — Benny Cheung](https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev)
- [Spec-Driven Development Frameworks Comparison](https://pasqualepillitteri.it/en/news/158/framework-ai-spec-driven-development-guide-bmad-gsd-ralph-loop)
- [adr-tools](https://github.com/npryce/adr-tools), [log4brains](https://github.com/thomvaill/log4brains), [MADR](https://adr.github.io/madr/)
- [Vale prose linter](https://vale.sh)
