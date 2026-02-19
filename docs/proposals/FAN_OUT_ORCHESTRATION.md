# Proposal: Fan-Out Orchestration

**Created**: 2026-02-19
**Status**: Draft
**Research**: docs/research/R-005-FAN_OUT_ORCHESTRATION.md
**Author**: User + AI researcher

## Summary

This proposal formalizes parallel subagent dispatch across 7 of Clarity Loop's 28 modes.
Currently, 15 parallelization points across 4 skills are described in prose ("dispatch
subagents in parallel, one per doc") with no defined agent identity, structured result
format, failure handling, or collection protocol. Each mode independently re-invents
the pattern.

The changes are: five new agent definition files in `.claude/agents/`, a 4-phase
orchestration block (Discover → Spawn → Collect → Aggregate) added to 7 reference
files with sequential fallback path, a post-collection synthesis pass for audit and
review modes, and an `orchestration` configuration block in `.clarity-loop.json`.

The core fan-out capability uses the basic `Task` tool — no experimental flag required.
Experimental agent teams (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) add an optional
lifecycle layer (named teams, streaming collection, progress visibility) but are not a
prerequisite. All 16 simple modes are unchanged.

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-005-FAN_OUT_ORCHESTRATION.md | All 8 findings; staged rollout recommendation | Option A (Full Fan-Out) with 3-stage rollout; basic Task as primary path |
| docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md | Finding 2 (4-phase fan-out), Finding 4 (thin agents), Finding 7 (graceful degradation) | Bowser's Discover/Spawn/Collect/Aggregate as the orchestration template |
| docs/research/R-004-STRUCTURED_AGENT_RESULT_PROTOCOL.md | All findings | R-004 protocol is the result format used by all agents. This proposal depends on R-004 being merged. |

## System Context

### Research Type: Hybrid

Net-new: 5 agent definition files, `orchestration` config block.
Evolutionary: 7 reference files gain a formal fan-out path. Existing sequential
instructions are preserved as the fallback path. No existing behavior changes for
users who don't dispatch agents.

### Current State

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| docs/wiki/SYSTEM_DESIGN.md | S1 describes 4-skill plugin with no agent layer. S10 has `ux.parallelGeneration` config but no orchestration config. S12 references "parallel subagents" for spec reads informally. S14 references "parallel subagents" for audit informally. | S1, S10, S12, S14 |
| docs/wiki/cl-reviewer.md | Audit, verify, review, re-review modes reference parallel dispatch in prose. No formal protocol. | Audit, Verify, Review, Re-review mode sections |
| docs/wiki/cl-implementer.md | Spec, run, autopilot modes reference parallel dispatch in prose. | Spec, Run, Autopilot mode sections |
| docs/wiki/cl-designer.md | Mockups mode references parallel planning. | Mockups mode section |
| docs/wiki/pipeline-concepts.md | No section on fan-out orchestration or agent dispatch. | Full document |

### What Exists Today

15 parallelization points across 7 reference files with prose-only instructions:

| Reference File | Dispatch Points | Current Instruction |
|---------------|-----------------|-------------------|
| audit-mode.md | 3 (doc reads, consistency, dimension analysis) | "Dispatch subagents in parallel, one per doc" |
| verify-mode.md | 2 (doc reads, Part C pairwise) | "Dispatch subagents to read every doc in parallel" |
| review-mode.md | 1 (dimension analysis) | "Consider dispatching subagents to analyze dimensions in parallel" |
| re-review-mode.md | 1 (review history reads) | "Dispatch subagents to read these in parallel if there are multiple" |
| spec-mode.md | 2 (doc reads, pre-read hint) | "Dispatch subagents in parallel, one per system doc" |
| run-mode.md | 1 (task groups) | "Fork subagents for each independent group" |
| autopilot-mode.md | 1 (task groups) | "Fork subagents for each group" |

None specify: agent type, structured result format, wave sequencing, failure handling,
or collection protocol.

### Proposed State

7 reference files gain a formal dual-path structure. 5 agent definitions provide
the identities the dispatch instructions reference. Orchestration config gives users
control over parallelism.

- 5 new agent definition files in `.claude/agents/`
- 7 reference files updated with dual-path orchestration (fan-out + sequential fallback)
- docs/wiki/SYSTEM_DESIGN.md: new Agent Layer subsection in S1, orchestration config in S10,
  formal fan-out references in S12 and S14
- docs/wiki/cl-reviewer.md, cl-implementer.md, cl-designer.md: mode description updates
- docs/wiki/pipeline-concepts.md: new Fan-Out Orchestration section
- `.clarity-loop.json` schema: `orchestration` block

## Dependency

**This proposal depends on R-004 (Structured Agent Result Protocol) being merged.**

All agent definitions use the R-004 result envelope (RESULT line + metadata block +
detail section). The dispatch instructions reference the R-004 protocol for each
result type. If R-004 has not been merged, either merge it first or include the
protocol spec inline in the agent definitions.

If R-004 is already merged: no duplication — agent definitions reference the protocol
by name. If R-004 is not yet merged: include the relevant prompt template inline in
each agent's `.md` file.

## Cross-Proposal Note: R-006 Overlap

R-006 (Guidance/Execution Separation) designs the same agent types, targets the same
modes, and reaches compatible conclusions. Both proposals were developed in parallel.
The agent naming convention used here (`cl-*` prefix, `.claude/agents/` location)
matches R-006's resolved decisions. If R-006 is approved, its proposal must be
reconciled with this one before implementation — the agent files defined here are
the same files R-006 would create.

## Change Manifest

### New Agent Definitions

| # | File | Agent Role | Model | Used By Modes |
|---|------|-----------|-------|--------------|
| 1 | `.claude/agents/cl-doc-reader-agent.md` | Reads one document, produces structured summary | sonnet | spec-mode, audit-mode, verify-mode, re-review-mode |
| 2 | `.claude/agents/cl-consistency-checker-agent.md` | Checks one doc pair for contradictions, terminology drift, broken cross-references | sonnet | audit-mode (Dim 1), verify-mode (Part C) |
| 3 | `.claude/agents/cl-dimension-analyzer-agent.md` | Analyzes one audit or review dimension against provided doc summaries | sonnet | audit-mode (Dims 2-9), review-mode |
| 4 | `.claude/agents/cl-task-implementer-agent.md` | Implements one task from the queue, runs tests in autopilot mode | opus | run-mode, autopilot-mode |
| 5 | `.claude/agents/cl-design-planner-agent.md` | Plans one screen layout without making MCP writes | sonnet | mockups-mode |

### System Doc Changes

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 6 | Add "Agent Layer" subsection: describes the 5 agents, `.claude/agents/` discovery location, `subagent_type` resolution, and the basic Task tool as the primary dispatch mechanism | docs/wiki/SYSTEM_DESIGN.md | S1 Architecture Overview (after Structured Agent Result Protocol subsection) | Add Section | Findings 2, 3 |
| 7 | Add `orchestration` config block to configuration reference: `fanOut` ("auto"/"teams"/"disabled"), `maxAgents` (default 10), `agentTimeout` (default 300000) | docs/wiki/SYSTEM_DESIGN.md | S10 Configuration System | Add Config | Finding 6 |
| 8 | Update spec generation pipeline description to reference formal fan-out: "Step 8 dispatches cl-doc-reader-agent instances in parallel via the basic Task tool" | docs/wiki/SYSTEM_DESIGN.md | S12 Spec Generation Pipeline | Modify | Finding 4 |
| 9 | Update verification/audit systems description to reference formal two-wave fan-out: "Wave 1 dispatches cl-doc-reader-agent, Wave 2 dispatches cl-consistency-checker-agent and cl-dimension-analyzer-agent" | docs/wiki/SYSTEM_DESIGN.md | S14 Verification and Audit Systems | Modify | Finding 4 |
| 10 | Update spec-mode, run-mode, autopilot-mode descriptions to reference formal fan-out protocol | docs/wiki/cl-implementer.md | Spec, Run, Autopilot mode sections | Modify | Finding 4 |
| 11 | Update audit-mode, verify-mode, review-mode, re-review-mode descriptions to reference formal fan-out protocol | docs/wiki/cl-reviewer.md | Audit, Verify, Review, Re-review mode sections | Modify | Finding 4 |
| 12 | Update mockups-mode description to reference formal fan-out planning | docs/wiki/cl-designer.md | Mockups mode section | Modify | Finding 4 |
| 13 | Add "Fan-Out Orchestration" section: describes the 4-phase pattern, agent lifecycle, context file rules (inject don't read, never write), and execution tiers | docs/wiki/pipeline-concepts.md | New section (after Subagent Communication if R-004 merged, otherwise after Reference File Structure) | Add Section | Findings 3, 5, 6 |

### Reference File Updates

Each reference file update adds a dual-path orchestration block replacing the current
prose dispatch instruction. The sequential path (the existing instruction) is preserved
as the `orchestration.fanOut: "disabled"` fallback.

**The pattern applied to all 7 files:**

```markdown
### [Step Name]

**Parallel (default — Task tool, no flag required)**

Phase 1: Discover
  [build work list from manifest/glob]
  Total work units: [N] agents

Phase 2: Spawn
  For each [work unit]:
    Task(subagent_type="cl-[agent-type]",
         description="[Short description]",
         prompt="[Variable bindings]")
  Issue ALL Task calls in a single message → parallel launch.

Phase 3: Collect
  For each result:
    Parse RESULT line: [STATUS] | Type: [type] | [metrics]
    Store structured content for aggregation
  On FAILED/missing RESULT: mark [work unit] as FAILED, include partial output, continue.

Phase 4: Aggregate
  [mode-specific synthesis instructions]

**Parallel with teams (optional — CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)**
Same as above with TeamCreate("[team-name]") before spawn and TeamDelete() after collect.

**Sequential (orchestration.fanOut: "disabled")**
[Existing prose instruction — unchanged]
```

| # | Target File | Dispatch Points Changed | Wave Structure | Agent Types Used | Research Ref |
|---|------------|------------------------|----------------|-----------------|-------------|
| 14 | `cl-reviewer/references/audit-mode.md` | Steps 1 + 2: doc reads, pairwise consistency, dimension analysis | Two waves: Wave 1 (doc reads) → Wave 2 (consistency + dimension, parallel) | cl-doc-reader, cl-consistency-checker, cl-dimension-analyzer | Finding 4, Mode 1 |
| 15 | `cl-reviewer/references/verify-mode.md` | Step 1 (doc reads) + Part C (pairwise consistency) | Two independent fan-outs: Step 1 runs before Part C | cl-doc-reader, cl-consistency-checker | Finding 4, Mode 2 |
| 16 | `cl-reviewer/references/review-mode.md` | Step 3 dimension analysis (conditional: proposals > 500 lines) | Single wave, 7 agents max | cl-dimension-analyzer | Finding 4, Mode 4 |
| 17 | `cl-reviewer/references/re-review-mode.md` | Step 1 review history reads | Single wave | cl-doc-reader (FORMAT="claims-only") | Finding 4, Mode 5 |
| 18 | `cl-implementer/references/spec-mode.md` | Step 8 system doc reads | Single wave | cl-doc-reader (FOCUS="types, interfaces, contracts") | Finding 4, Mode 3 |
| 19 | `cl-implementer/references/run-mode.md` | Step 3c parallel task groups | Single wave, capped at 3 agents | cl-task-implementer (MODE="run") | Finding 4, Mode 6 |
| 20 | `cl-implementer/references/autopilot-mode.md` | Step 3 parallel task groups | Single wave, capped at 3 agents | cl-task-implementer (MODE="autopilot") | Finding 4, Mode 6 |

### Configuration Schema Change

| # | Change Description | Target | Type | Research Ref |
|---|-------------------|--------|------|-------------|
| 21 | Add `orchestration` block to `.clarity-loop.json` schema documentation | `.clarity-loop.json` schema (documented in SYSTEM_DESIGN.md S10) | Add Config | Finding 6 |

**Schema addition:**
```json
{
  "orchestration": {
    "fanOut": "auto",
    "maxAgents": 10,
    "agentTimeout": 300000
  }
}
```
- `fanOut: "auto"` (default): use basic Task fan-out. If experimental teams are also available, wrap in team lifecycle.
- `fanOut: "teams"`: require experimental teams. Error if unavailable.
- `fanOut: "disabled"`: sequential execution only.

**Total**: 21 changes across 11 existing files + 5 new agent definition files.

## Detailed Design

### Change 1: cl-doc-reader-agent.md

**Full file content:**

```markdown
---
name: cl-doc-reader-agent
description: Reads a single document and produces a structured content summary. Use for
  parallel document reading across pipeline modes. Supports system docs, proposals, reviews,
  and spec files. Keywords - read, summary, document, parallel, content extraction.
model: sonnet
---

# Doc Reader Agent

## Purpose

You are a document reader agent. Read the assigned document thoroughly and produce a
structured summary that captures all significant content for downstream analysis.
Report emergent gaps or parkable findings in your result — do not write to any shared files.

## Variables

- **DOC_PATH**: Path to the document to read
- **FOCUS**: Optional focus area (e.g., "proposal-related sections", "types and interfaces").
  If empty, produce a full summary.
- **FORMAT**: Output format — "full" (default), "terms-only", "claims-only", "cross-refs-only"

## Workflow

1. Read the document at DOC_PATH completely
2. If FOCUS is specified, give extra attention to matching sections but still summarize the whole document
3. Produce the structured report below

## Report

Follow the Structured Agent Result Protocol (type: digest).

RESULT: COMPLETE | Type: digest | Doc: {DOC_PATH} | Sections: {N} | Entities: {N} | Cross-refs: {N}

---
**Protocol**: v1
**Agent**: doc-reader
**Assigned**: Read and summarize {DOC_PATH}
**Scope**: Full document
**Coverage**: {percentage or section list}
**Confidence**: high / medium / low
---

## Content Summary
[2-4 paragraph summary of the document's purpose and key content]

## Defined Terms
| Term | Definition | Section |
|------|-----------|---------|

## Key Decisions and Rationale
| Decision | Rationale | Section |
|----------|----------|---------|

## Cross-References
| References | Target Doc | Section | Nature |
|-----------|-----------|---------|--------|

## Technology Claims
| Claim | Section | Verifiable? |
|-------|---------|-------------|

## Aspirational vs. Decided
| Statement | Classification | Section |
|-----------|---------------|---------|

## Parkable Findings
| Finding | Category | Priority |
|---------|----------|----------|

## Decision Implications
| Implication | Relevant Decision | Impact |
|-------------|------------------|--------|
```

### Change 2: cl-consistency-checker-agent.md

**Full file content:**

```markdown
---
name: cl-consistency-checker-agent
description: Checks two documents for contradictions, terminology drift, broken
  cross-references, and architectural inconsistencies. Use for parallel pairwise
  consistency checking. Keywords - consistency, contradiction, cross-reference,
  terminology, pairwise, audit, verify.
model: sonnet
---

# Consistency Checker Agent

## Purpose

You are a consistency checking agent. Given two documents (or their summaries), identify
every point of inconsistency between them. Report findings in the structured format.
Do not write to any shared files — surface parkable findings in your result.

## Variables

- **DOC_A**: Path to first document or its pre-read summary
- **DOC_B**: Path to second document or its pre-read summary
- **SCOPE**: "full" (check everything) or "post-merge" (focus on proposal change manifest)
- **CHANGE_MANIFEST**: Optional — the proposal's change manifest when SCOPE="post-merge"

## Workflow

1. Read both documents or use provided summaries
2. If SCOPE="post-merge", focus on sections in CHANGE_MANIFEST but scan broadly
3. Check: contradictions, terminology drift, broken cross-references, architectural
   inconsistencies, redundant specifications
4. Produce the structured report

## Report

Follow the Structured Agent Result Protocol (type: consistency).

RESULT: {CLEAN|FINDINGS} | Type: consistency | Pair: {DOC_A}/{DOC_B} | Findings: {N} | Critical: {N} | Major: {N} | Minor: {N}

[Metadata block + finding table with columns: ID, Severity, Type, Location, Counter-location, Description, Suggestion]
[Expanded details for critical and major findings below the table]

## Parkable Findings
| Finding | Category | Priority |
|---------|----------|----------|
```

### Change 3: cl-dimension-analyzer-agent.md

**Full file content:**

```markdown
---
name: cl-dimension-analyzer-agent
description: Analyzes one specific dimension of an audit or review — internal consistency,
  technical correctness, completeness, goal alignment, etc. Receives all relevant context
  and dimension-specific instructions. Keywords - audit, review, dimension, analysis,
  finding, quality.
model: sonnet
---

# Dimension Analyzer Agent

## Purpose

You are an analysis agent specialized in one dimension of a documentation audit or proposal
review. Evaluate the provided content against the specific dimension criteria and produce
structured findings. Do not write to any shared files.

## Variables

- **DIMENSION_NAME**: Which dimension to evaluate (e.g., "Technical Correctness")
- **DIMENSION_INSTRUCTIONS**: The specific evaluation criteria for this dimension
- **CONTENT**: The document content or summaries to evaluate
- **CONTEXT**: Additional context (system doc summaries, previous audit results, goals)
- **MODE**: "audit" (system-wide) or "review" (proposal-scoped)

## Workflow

1. Read DIMENSION_INSTRUCTIONS carefully
2. Apply criteria to CONTENT using CONTEXT for reference
3. If MODE="audit" and dimension requires external research (e.g., Technical Correctness),
   conduct web searches
4. Produce the structured report

## Report

Follow the Structured Agent Result Protocol (type: consistency for coherence dimensions,
verification for correctness/completeness dimensions, digest for staleness/health dimensions).

RESULT: {CLEAN|FINDINGS} | Type: {consistency|verification|digest} | ...metrics...

[Metadata block + type-appropriate detail section]

## Parkable Findings
| Finding | Category | Priority |
|---------|----------|----------|

## Decision Implications
| Implication | Relevant Decision | Impact |
|-------------|------------------|--------|
```

### Change 4: cl-task-implementer-agent.md

```markdown
---
name: cl-task-implementer-agent
description: Implements a single task from the task queue — reads specs, writes code,
  runs tests, reports results. Used for parallel task group execution. Keywords -
  implement, code, task, parallel, test, build.
model: opus
---

# Task Implementer Agent

## Purpose

You are an implementation agent. Implement the assigned task per its spec and acceptance
criteria. Do not write to tracking files (TASKS.md, PARKING.md) — include all gap and
status information in your structured result.

## Variables

- **TASK_ID**: Task identifier (e.g., T-003)
- **TASK_DESCRIPTION**: Full task description from TASKS.md
- **SPEC_REFERENCE**: Path to the spec file this task derives from
- **ACCEPTANCE_CRITERIA**: List of criteria that must be met
- **DEPENDENCY_CONTEXT**: Files and exports from completed dependency tasks
- **MODE**: "run" (implement only) or "autopilot" (implement + write tests)
- **TEST_SPEC_SECTION**: Optional — per-module section from TEST_SPEC.md
- **CONTEXT_FILES**: Optional — library context files to load

## Workflow

1. Read the spec reference in full
2. Read dependency context to understand existing code
3. Load CONTEXT_FILES if provided
4. Implement the code to meet acceptance criteria
5. If MODE="autopilot": write tests per TEST_SPEC_SECTION and run them
6. Verify each acceptance criterion
7. Produce the structured report

## Report

Follow the Structured Agent Result Protocol (type: implementation).

RESULT: {COMPLETE|PARTIAL|FAILED} | Type: implementation | Task: {TASK_ID} | Files: {N} | Criteria: {pass}/{total} | Tests: {pass}/{total}

[Metadata block + files modified table + acceptance criteria table + test results + gaps found]

## Parkable Findings
| Finding | Category | Priority |
|---------|----------|----------|
```

### Change 5: cl-design-planner-agent.md

```markdown
---
name: cl-design-planner-agent
description: Plans a screen layout — which components, where placed, what content —
  without making any MCP or file writes. Pure planning output for the main context
  to execute. Keywords - design, layout, plan, screen, mockup, component, parallel.
model: sonnet
---

# Design Planner Agent

## Purpose

You are a design planning agent. Plan the layout for a single screen. Do NOT make any
MCP calls or file writes — output a plan the main context will execute.

## Variables

- **SCREEN_NAME**: Name of the screen to plan
- **SCREEN_SPEC**: Screen specification (features, route, viewport, interactions)
- **DESIGN_SYSTEM**: Design system tokens and component inventory
- **UI_SCREENS_SPEC**: Full UI screens specification for cross-screen consistency

## Workflow

1. Read the screen spec and design system
2. Plan layout: component selection, placement, content, variants
3. Identify which design tokens apply
4. Check cross-screen consistency
5. Produce the structured plan

## Report

Follow the Structured Agent Result Protocol (type: design-plan).

RESULT: {CLEAN|FINDINGS} | Type: design-plan | Screen: {SCREEN_NAME} | Components: {N}

[Metadata block + component layout + batch_design execution instructions]

## Missing Components
| Needed | Closest Existing | Gap |
|--------|-----------------|-----|

## Parkable Findings
| Finding | Category | Priority |
|---------|----------|----------|
```

### Change 6: docs/wiki/SYSTEM_DESIGN.md S1 — Agent Layer Subsection

**What**: Add subsection after "Structured Agent Result Protocol" (Change 1 from R-004 proposal).

**Proposed content:**

> ### Agent Layer
>
> Five thin agent definitions in `.claude/agents/` provide specialized subagents that
> orchestrating modes dispatch for parallel work:
>
> | Agent | File | Model | Purpose |
> |-------|------|-------|---------|
> | cl-doc-reader-agent | `.claude/agents/cl-doc-reader-agent.md` | sonnet | Reads one document, produces structured summary |
> | cl-consistency-checker-agent | `.claude/agents/cl-consistency-checker-agent.md` | sonnet | Checks one doc pair for contradictions |
> | cl-dimension-analyzer-agent | `.claude/agents/cl-dimension-analyzer-agent.md` | sonnet | Analyzes one audit/review dimension |
> | cl-task-implementer-agent | `.claude/agents/cl-task-implementer-agent.md` | opus | Implements one task from the queue |
> | cl-design-planner-agent | `.claude/agents/cl-design-planner-agent.md` | sonnet | Plans one screen layout without MCP writes |
>
> **Dispatch mechanism**: Orchestrating modes use the basic `Task` tool with
> `subagent_type` set to the agent's `name:` field. Multiple Task calls in a single
> message launch in parallel, each in its own isolated context window. No experimental
> flag is required for parallelism.
>
> **Context rules**: Relevant context (DECISIONS.md excerpts, manifest content) is
> injected by the orchestrator via the Task prompt — agents do not read shared files
> independently. Agents never write to shared context files (DECISIONS.md, PARKING.md,
> RESEARCH_LEDGER.md). Emergent findings are returned in the agent's structured result
> and written to shared files by the orchestrator after collection.
>
> **Optional teams enhancement**: When `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` is set,
> the same Task calls can be wrapped in a TeamCreate/TeamDelete lifecycle for named
> lifecycle management and streaming result collection.

### Change 14: audit-mode.md — Before/After for One Dispatch Point

Shows the pattern applied. The same structure is applied to all 7 reference files.

**Before** (current prose for doc reads):
```
1. **Read every file in `docs/system/`** -- Dispatch subagents in parallel, one per doc.
   Each subagent produces:
   - Full content summary
   - All defined terms and their definitions
   [...]
```

**After** (formal fan-out block):
```markdown
### Step 1: Load Everything

**Parallel (default — Task tool, no flag required)**

Phase 1: Discover
  1. Glob docs/system/*.md → doc list
  2. Read docs/reviews/audit/AUDIT_*.md for previous audits
  3. Work units: N doc-reader agents (one per system doc)

Phase 2: Spawn
  For each system doc in the doc list:
    Task(subagent_type="cl-doc-reader-agent",
         description="Read {doc name} for audit",
         prompt="DOC_PATH: {path}\nFOCUS: all content\nFORMAT: full\n
                 DECISIONS_CONTEXT: {relevant DECISIONS.md entries}")
  Issue ALL Task calls in a single message → parallel launch.

Phase 3: Collect
  For each result:
    Parse RESULT line: COMPLETE|PARTIAL|FAILED | Type: digest | Doc: ... | Sections: N
    Store full structured content (summaries, terms, decisions, cross-refs, claims)
  On FAILED/PARTIAL: mark that doc as EXTRACTION_FAILED, include partial output, continue.
  Log: "Collected {M}/{N} doc summaries ({N-M} failed)"

Phase 4: Aggregate
  Merge all summaries into a unified knowledge base:
  - All defined terms (deduplicated, conflicts flagged)
  - All architectural decisions (with source doc)
  - Cross-reference graph (doc → doc dependency map)
  - All technology claims (for Technical Correctness dimension)
  - Collect Parkable Findings sections from all agents → write to PARKING.md after all waves complete

**Parallel with teams (optional — CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)**
Same as above with TeamCreate("reviewer-audit-read") before Phase 2 and
TeamDelete() after Phase 3.

**Sequential (orchestration.fanOut: "disabled")**
Read every file in docs/system/ directly in the main context. [existing instruction]
```

## Cross-Cutting Concerns

### Prompt Construction Standard

The orchestrator constructs prompts as pure variable bindings — one line per variable.
The agent already knows what to do from its `.md` file; the prompt is only the inputs
for this specific dispatch.

```
DOC_PATH: docs/system/ARCHITECTURE.md
FOCUS: types, entities, interfaces, contracts, cross-references
FORMAT: full
DECISIONS_CONTEXT: [paste relevant 3-5 decisions from DECISIONS.md]
```

The orchestrator never re-explains the task in the prompt. Under-specified prompts
(missing required variables) result in PARTIAL results — the orchestrator must
construct complete prompts.

### Context File Rules (Applied Uniformly)

These rules apply to all 5 agents and all 7 updated reference files:

1. **Inject, don't read**: The orchestrator passes relevant context file excerpts
   (DECISIONS.md, manifest) via the Task prompt. Agents do not read shared files
   independently.
2. **Never write from agents**: Agents surface emergent findings in the `## Parkable
   Findings` and `## Decision Implications` sections of their structured result.
3. **Orchestrator writes after collection**: After all agents in a wave complete, the
   orchestrator reviews collected Parkable Findings sections, deduplicates, applies
   judgment, and writes to PARKING.md/DECISIONS.md in a single sequential step.

### Terminology

| Term | Definition |
|------|-----------|
| Fan-out | Dispatching N specialized agents in parallel for a single logical operation |
| Wave | A set of agents dispatched together whose results must all be collected before the next wave begins |
| Orchestrator | The main context (reference file running in the primary Claude Code session) that dispatches agents, collects results, and synthesizes |
| Agent | A specialized Task-tool subagent dispatched from an `.claude/agents/*.md` definition |
| Sequential fallback | The `orchestration.fanOut: "disabled"` path; identical to current behavior |

### Migration

**No behavioral migration needed.** The sequential fallback path is the current
behavior, preserved unchanged. Users who don't enable agent definitions or who set
`orchestration.fanOut: "disabled"` experience zero change.

Users who have agent definitions installed and `orchestration.fanOut: "auto"` (default)
see parallel execution in the 7 updated modes. No opt-in action required beyond having
the agent definition files in place.

### Staged Rollout

The change manifest above covers all 3 stages. They can be implemented independently:

| Stage | Changes | Value |
|-------|---------|-------|
| Stage 1: Foundation | Changes 1-5 (agent defs) + 18 (spec-mode) + 17 (re-review) + 15/part (verify Step 1) + Changes 6-8, 21 | Parallel doc reads in 3 modes. Foundation for all subsequent fan-out. |
| Stage 2: Analysis | Changes 14 (audit full), 15/part (verify Part C), 16 (review mode), 9 | Quality-of-analysis improvement. Cross-dimensional synthesis. |
| Stage 3: Implementation | Changes 19, 20 (run, autopilot), 5 (design planner), 12 | Formal protocol for implementation and design parallelism. |

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Basic Task as primary path (no experimental flag) | Teams as primary, sequential as fallback | Parallelism is already available via basic Task. Experimental teams adds lifecycle management, not capability. Fan-out ships immediately, not contingent on experimental feature stability. |
| 5 general-purpose agents | Many fine-grained agents (separate reader per mode); 1 universal agent | 5 maps 1:1 to 4 work categories (read, check, analyze, implement) + 1 design. Fine-grained would duplicate logic. 1 universal agent would need excessive branching. |
| Mixed models (sonnet for read/analysis, opus for implementation) | All opus; all sonnet | Read and analysis tasks don't require Opus-level reasoning. Implementation benefits from it. Sonnet agents at 2-3.5x fan-out token cost keeps dollar cost manageable. |
| `cl-` prefix for agent names | No prefix; skill-specific prefix | `cl-` namespaces Clarity Loop agents, avoids collision with user project agents in `.claude/agents/`. Short and recognizable. |
| Inject context via prompt (not agent reads) | Agent reads DECISIONS.md directly | Injection: explicit, auditable, snapshot-consistent. Direct reads: possible stale state mid-wave, no audit trail for what each agent received. |
| Agents never write to shared files | Agents write directly to PARKING.md | Concurrency conflict (no locking), responsibility boundary violation (agents have narrow view), audit trail destruction. Structured result is the correct channel. |
| `fanOut: "auto"` default | `fanOut: "disabled"` default | Parallelism via basic Task has no experimental dependency. Default on gives all users the speed and quality benefit. Sequential available via explicit opt-out. |
| Two-wave audit (read then analyze) | Single wave (all agents at once) | Analysis agents need doc summaries as input. Single wave would require each analyzer to read its own docs, duplicating reads and inflating token cost. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Agent definitions not discovered by Claude Code | Low | High — fan-out silently fails | Verified: `.claude/agents/` is Claude Code's discovery convention (R-006 Decision Log #2, Bowser pattern). File naming matches `name:` field in frontmatter. |
| 30-agent audit fan-out exceeds Claude Code capacity | Medium | Medium — audit can't fully parallelize | `maxAgents: 10` config cap. Wave 2 can be split into sub-waves (consistency agents first, then dimension agents). |
| Agents produce non-conformant results (missing RESULT line) | Medium | Low | R-004 graceful degradation: treat non-conformant as PARTIAL. Orchestrator extracts what it can. |
| Token cost 2-3.5x increase for audit/review | Medium | Medium — cost-sensitive users | `orchestration.fanOut: "disabled"` for explicit opt-out. Sonnet for most agents keeps dollar cost manageable. |
| Prompt under-specification produces poor agent output | Medium | Medium — degraded results | Standard prompt template per agent (variable bindings only). Orchestrator must populate all required variables. PARTIAL result flags the gap. |
| Concurrent PARKING.md writes if agent context rules violated | Low | Medium — file corruption | Rule is explicit in agent `.md` files and in Finding 3 / pipeline-concepts section. Enforcement is by instruction, not by hook. |

## Open Items

1. **OQ2 (Max concurrent agents)**: No documented Claude Code ceiling found. `maxAgents: 10`
   is a conservative default. After Stage 1 implementation, run an empirical test with the
   full audit-mode fan-out (30 agents worst case) to find the practical ceiling.

2. **OQ6 (Per-agent cost tracking)**: No evidence of per-agent token attribution in Claude
   Code. Users must rely on the Finding 8 token multiplier estimates (2-3.5x for audit) to
   set expectations. A future enhancement could add a pre-dispatch cost estimate to the
   fan-out plan display.

## Appendix: Research Summary

R-005 catalogued 15 parallelization points across 7 reference files, all described in
prose with no formal protocol. It identified 4 work categories (heavy reads, analysis,
implementation, speculative pre-generation), designed 5 thin agent types, produced
concrete 4-phase orchestration for each of the 7 modes, designed the team lifecycle,
and analysed token cost (2-3.5x for heavy modes, offset by fresh-context quality improvement).

Key correction during research: the initial draft recommended `skills/agents/` for agent
placement and treated experimental teams as required for parallelism. Both were corrected:
agents live in `.claude/agents/` (Claude Code convention, R-006 Decision Log #2), and the
basic Task tool already provides parallel execution with no experimental dependency.

The full research doc is at `docs/research/R-005-FAN_OUT_ORCHESTRATION.md`.
