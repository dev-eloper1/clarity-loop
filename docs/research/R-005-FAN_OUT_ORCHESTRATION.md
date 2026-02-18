# Research: Fan-Out Orchestration for Pipeline Modes

**ID**: R-005
**Created**: 2026-02-16
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Hybrid
- **Status**: draft
- **Open Questions**: 6 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Hybrid

This research introduces a net-new agent orchestration layer (formal agent definitions, team lifecycle management, structured result protocols) while also proposing evolutionary changes to existing reference files that already describe parallel subagent dispatch in prose. The new layer lives alongside the existing skill/reference structure; the evolutionary changes formalize what is currently implicit.

### Related System Docs

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| SYSTEM_DESIGN.md | §1 Architecture Overview | Defines the plugin structure (4 skills, hooks, templates) that agent definitions must integrate with |
| SYSTEM_DESIGN.md | §7 State Management | Defines pipeline state flow between skills -- fan-out coordination must respect this |
| SYSTEM_DESIGN.md | §10 Configuration System | `ux.parallelGeneration` already exists -- fan-out config should extend this pattern |
| SYSTEM_DESIGN.md | §12 Spec Generation Pipeline | References "parallel subagents" for heavy reads -- primary formalization target |
| SYSTEM_DESIGN.md | §14 Verification and Audit Systems | Audit mode dispatches parallel subagents -- another formalization target |
| docs/cl-implementer.md | Spec mode, Run mode, Autopilot mode | References subagent dispatch for parallel doc reads and parallel task execution |
| docs/cl-reviewer.md | Verify mode, Audit mode, Review mode, Re-review mode | References parallel subagent dispatch for cross-document checks and review history loading |
| docs/cl-designer.md | Mockups mode, Tokens mode | References parallelization for screen generation and token pre-generation |

### Current State

Clarity Loop has **11 distinct parallelization points** across its reference files, all described in prose rather than formalized as a pattern. The current approach is: "dispatch subagents in parallel" or "fork subagents for each group" -- natural language instructions that leave the orchestration protocol (how to spawn, what to collect, how to handle failures, when to clean up) to agent interpretation.

**Parallelization inventory from reference files** (exhaustive grep across all 32 reference files):

| Mode | Reference File | What's Parallelized | Current Instruction |
|------|---------------|--------------------|--------------------|
| spec-mode | `spec-mode.md` | System doc reads (Step 2) | "Dispatch subagents in parallel, one per system doc" |
| spec-mode | `spec-mode.md` | Pre-read during user review | "Parallelization hint: pre-read all system docs in parallel using subagent dispatch" |
| audit-mode | `audit-mode.md` | System doc reads (Step 1) | "Dispatch subagents in parallel, one per doc" |
| audit-mode | `audit-mode.md` | Dimension analysis (Step 2) | "Use subagents for parallel analysis where dimensions are independent" |
| audit-mode | `audit-mode.md` | Cross-doc consistency (Dim 1) | "Dispatch subagents per doc pair if needed" |
| verify-mode (reviewer) | `verify-mode.md` (reviewer) | System doc reads (Step 1) | "Dispatch subagents to read every doc in docs/system/ in parallel" |
| verify-mode (reviewer) | `verify-mode.md` (reviewer) | Cross-doc consistency (Part C) | "Dispatch subagents to check each pair of system docs" |
| review-mode | `review-mode.md` | Dimension analysis | "Consider dispatching subagents to analyze different dimensions in parallel" |
| re-review-mode | `re-review-mode.md` | Review history loading (Step 1) | "Dispatch subagents to read these in parallel if there are multiple" |
| run-mode | `run-mode.md` | Parallel task groups | "Fork subagents for each independent group" |
| autopilot-mode | `autopilot-mode.md` | Parallel task groups | "Fork subagents for each group (Claude Code's fork capability)" |
| mockups-mode | `mockups-mode.md` | Screen generation planning | "Dispatch subagents for planning, not MCP writes" |
| mockups-mode | `mockups-mode.md` | Per-screen .pen file generation | "Subagents can each write to their own file safely" |
| tokens-mode | `tokens-mode.md` | Pre-generation during user review | "Subagent dispatch for pre-generation" |
| start-mode | `start-mode.md` | Claude Code task pre-population | "Parallelization hint: pre-populate Claude Code tasks" |

None of these specify: agent identity, structured result format, failure handling, team lifecycle, or graceful degradation. Each mode independently re-invents the dispatch pattern.

### Why This Research

R-002 (Bowser Architecture Patterns) identified that Bowser uses a formal 4-phase fan-out pattern -- Discover, Spawn, Collect, Aggregate -- with thin agent definitions (~20 lines), structured result protocols, team lifecycle management, and resilient error handling. R-002's Finding 2 and Finding 4 recommended formalizing this pattern for Clarity Loop, and R-002's recommendations (Phase 2) specifically called for "formal agent definitions for the 3-4 modes that already mention subagent dispatch."

This research takes that recommendation and designs the concrete implementation: which agents, which modes, what protocols, what degradation paths.

## Scope

### In Scope

- Formal agent definitions for every parallelizable work unit in Clarity Loop
- Per-mode fan-out orchestration design (Discover, Spawn, Collect, Aggregate phases)
- Team lifecycle management (create, distribute, collect, cleanup)
- Graceful degradation to sequential execution when Claude Code teams are unavailable
- Structured result protocol for agent-to-orchestrator communication
- Cross-agent dependency handling and post-collection synthesis
- Token cost analysis: fan-out vs. sequential context pressure
- Priority ordering of which modes to formalize first

### Out of Scope

- Browser automation integration (addressed by R-002 Phase 1 recommendation)
- File structure convention changes (addressed by R-002 Finding 6 -- separate proposal)
- Command layer separation from SKILL.md (R-002 Phase 3 -- depends on this research)
- Implementation of the agents or orchestration code (this is design only)
- Changes to Claude Code's teams feature itself

### Constraints

- Claude Code's agent teams feature is experimental (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) -- all designs must degrade gracefully to sequential
- Agent definitions must be `.md` files in a discoverable location within the plugin structure
- Orchestration additions go into existing reference files, not new command files (Clarity Loop is a plugin, not a CLI tool -- no command layer yet)
- Must not conflict with the in-flight Guided Autonomy proposal
- Existing reference files continue to work unchanged for users who don't enable teams

## Research Findings

### Finding 1: Parallelization Taxonomy

**Context**: Not all parallelization points are equal. Before designing the fan-out pattern, we need to classify the work by type, scale, and dependency characteristics.

**Analysis**: The 15 parallelization points in Clarity Loop fall into four distinct categories:

**Category A: Heavy Read Fan-Out** (data gathering)

| Mode | Work Units | Expected Agent Count | Input Per Agent | Output Per Agent | Cross-Agent Dependencies |
|------|-----------|---------------------|----------------|-----------------|------------------------|
| spec-mode Step 2 | One reader per system doc | 3-8 (depends on doc count) | One system doc path | Structured summary (concepts, types, interfaces, constraints, cross-refs) | None -- pure read |
| audit-mode Step 1 | One reader per system doc | 3-8 | One system doc path | Full content summary, terms, decisions, cross-refs, tech claims, aspirational markers | None -- pure read |
| verify-mode Step 1 | One reader per system doc | 3-8 | One system doc path + proposal topic | Content summary, proposal-related sections, recently-modified sections | None -- pure read |
| re-review-mode Step 1 | One reader per review file | 2-6 (depends on review history) | One review file path | Issue list with statuses | None -- pure read |

These are the simplest fan-out targets. Each agent reads one file, produces a structured summary, has zero dependencies on other agents. The orchestrator collects all summaries and uses them for downstream analysis.

**Category B: Analysis Fan-Out** (independent evaluation)

| Mode | Work Units | Expected Agent Count | Input Per Agent | Output Per Agent | Cross-Agent Dependencies |
|------|-----------|---------------------|----------------|-----------------|------------------------|
| audit-mode Step 2 | One analyzer per dimension | Up to 9 (8 dimensions + parking lot health) | All doc summaries + dimension instructions | Dimension findings (issues, ratings) | Partial -- see below |
| review-mode Step 3 | One analyzer per dimension | Up to 7 | Proposal text + system doc context + dimension instructions | Dimension findings | Partial -- value assessment informs completeness |
| verify-mode Part C | One checker per doc pair | N*(N-1)/2 where N = doc count (e.g., 6 docs = 15 pairs) | Two doc summaries + proposal change manifest | Consistency findings for the pair | None between pairs |

Analysis fan-out has a subtlety: some dimensions are partially interdependent. In audit-mode, a finding in "Technical Correctness" (Dimension 3) might affect "Completeness" (Dimension 5) scoring. In review-mode, "Value Assessment" (Dimension 1) context could inform "Completeness" (Dimension 7). However, Bowser's pattern handles this correctly -- the orchestrator performs a post-collection synthesis pass that catches cross-dimension implications.

**Category C: Implementation Fan-Out** (code production)

| Mode | Work Units | Expected Agent Count | Input Per Agent | Output Per Agent | Cross-Agent Dependencies |
|------|-----------|---------------------|----------------|-----------------|------------------------|
| run-mode Step 3c | One implementer per task group | 2-3 (capped) | Task description, spec references, acceptance criteria | Files modified, criteria status, gaps found | File conflict potential |
| autopilot-mode Step 3 | One implementer per task group | 2-3 (capped) | Same as run-mode + test spec | Same + test results | File conflict potential |
| mockups-mode | One designer per screen (.pen file) | 2-5 | Screen spec, design system tokens, component inventory | .pen file + screenshot | MCP write isolation required |

Implementation fan-out is the most complex because agents produce artifacts (files, designs) that can conflict. The existing reference files already address this: run-mode says "check for file conflicts (same file modified by multiple subagents), resolve conflicts or re-run sequentially." Mockups-mode explicitly requires separate .pen files per subagent.

**Category D: Speculative Pre-Generation** (opportunistic parallelism)

| Mode | Work Units | Expected Agent Count | Input Per Agent | Output Per Agent | Cross-Agent Dependencies |
|------|-----------|---------------------|----------------|-----------------|------------------------|
| spec-mode hint | Pre-read during user format review | Same as Category A | Same as Category A | Same as Category A | None |
| tokens-mode hint | Pre-generate sections during review | 1-3 | Token category + design decisions | Token section draft | None |
| start-mode hint | Pre-populate Claude Code tasks | 1 | Dependency-free task list | Task creation confirmations | None |

Speculative fan-out is fire-and-forget with discard on invalidation. These are the lowest-priority formalization targets because they already have a natural degradation path (just don't pre-generate).

**Tradeoffs**:
- *Pro*: This taxonomy makes it clear that Categories A and B are the highest-value targets (many agents, zero conflict risk, pure information gathering)
- *Pro*: Category C fan-out is already well-specified in existing reference files -- just needs protocol formalization
- *Con*: Category B's partial dependencies mean not all analysis dimensions can truly run in parallel without a synthesis pass
- *Con*: Category D is nice-to-have but low impact -- don't invest heavily

**Source**: Exhaustive analysis of all 32 reference files across 4 skills, cross-referenced with Bowser's fan-out pattern from R-002 Finding 2.

### Finding 2: Agent Definition Design

**Context**: Bowser uses thin agent definitions (~20 lines) that bind a skill to an agent identity. What should Clarity Loop's agent definitions look like?

**Analysis**: Clarity Loop's parallelizable work maps to **5 thin agent types**:

**Agent 1: doc-reader-agent**

Purpose: Read a single document and produce a structured summary. This is the workhorse -- used by spec-mode, audit-mode, verify-mode, and re-review-mode.

```markdown
---
name: doc-reader-agent
description: Reads a single document and produces a structured content summary. Use for parallel document reading across pipeline modes. Supports system docs, proposals, reviews, and spec files. Keywords - read, summary, document, parallel, content extraction.
model: sonnet
---

# Doc Reader Agent

## Purpose

You are a document reader agent. Read the assigned document thoroughly and produce a structured summary that captures all significant content for downstream analysis.

## Variables

- **DOC_PATH**: Path to the document to read
- **FOCUS**: Optional focus area (e.g., "proposal-related sections", "code-related claims", "cross-references only"). If empty, produce a full summary.
- **FORMAT**: Output format variant — "full" (default), "terms-only", "claims-only", "cross-refs-only"

## Workflow

1. Read the document at DOC_PATH completely
2. If FOCUS is specified, give extra attention to sections matching the focus but still summarize the whole document
3. Produce the structured summary per the Report section

## Report

```
DOC: {DOC_PATH}
STATUS: COMPLETE | PARTIAL (if document couldn't be fully read)

## Content Summary
[2-4 paragraph summary of the document's purpose and key content]

## Defined Terms
| Term | Definition | Section |
|------|-----------|---------|
| [term] | [definition] | [where defined] |

## Key Decisions and Rationale
| Decision | Rationale | Section |
|----------|----------|---------|
| [decision] | [why] | [where stated] |

## Cross-References
| References | Target Doc | Section | Nature |
|-----------|-----------|---------|--------|
| [what] | [which doc] | [section] | [defines/extends/contradicts/depends-on] |

## Technology Claims
| Claim | Section | Verifiable? |
|-------|---------|-------------|
| [claim text] | [section] | [yes/no/partially] |

## Aspirational vs. Decided
| Statement | Classification | Section |
|-----------|---------------|---------|
| [statement] | aspirational / decided / unclear | [section] |

RESULT: COMPLETE | {total sections read}/{total sections in doc}
```
```

**Agent 2: consistency-checker-agent**

Purpose: Check two documents for consistency issues. Used by audit-mode Dimension 1 and verify-mode Part C.

```markdown
---
name: consistency-checker-agent
description: Checks two documents for contradictions, terminology drift, broken cross-references, and architectural inconsistencies. Use for parallel pairwise consistency checking. Keywords - consistency, contradiction, cross-reference, terminology, pairwise, audit, verify.
model: sonnet
---

# Consistency Checker Agent

## Purpose

You are a consistency checking agent. Given two documents, identify every point of inconsistency between them.

## Variables

- **DOC_A_PATH**: Path to first document (or its pre-read summary)
- **DOC_B_PATH**: Path to second document (or its pre-read summary)
- **SCOPE**: "full" (check everything) or "post-merge" (focus on sections affected by a specific proposal)
- **CHANGE_MANIFEST**: Optional — if SCOPE is "post-merge", the proposal's change manifest to focus the check

## Workflow

1. Read both documents (or use provided summaries)
2. If SCOPE is "post-merge", focus on sections listed in CHANGE_MANIFEST but still scan broadly
3. Check all six consistency dimensions
4. Produce the structured report

## Report

```
PAIR: {DOC_A filename} <-> {DOC_B filename}
STATUS: CONSISTENT | TENSION | CONFLICT

## Contradictions
| Doc A Statement | Doc A Section | Doc B Statement | Doc B Section | Severity |
|----------------|--------------|----------------|--------------|----------|
| [what A says] | [section] | [what B says] | [section] | critical/major/minor |

## Terminology Drift
| Concept | Doc A Term | Doc B Term | Suggested Standard |
|---------|-----------|-----------|-------------------|
| [concept] | [term in A] | [term in B] | [recommendation] |

## Broken Cross-References
| Source Doc | Reference | Target Doc | Issue |
|-----------|-----------|-----------|-------|
| [doc] | [what it references] | [target] | [missing/moved/renamed] |

## Architectural Inconsistencies
| Description | Doc A Section | Doc B Section | Impact |
|------------|--------------|--------------|--------|
| [what's inconsistent] | [section] | [section] | [what breaks] |

## Redundant Specifications
| Concept | Doc A Section | Doc B Section | Differences |
|---------|--------------|--------------|-------------|
| [concept] | [section] | [section] | [how they differ] |

RESULT: {CONSISTENT|TENSION|CONFLICT} | Issues: {count}
```
```

**Agent 3: dimension-analyzer-agent**

Purpose: Analyze one dimension of an audit or review. Used by audit-mode Step 2 and review-mode Step 3.

```markdown
---
name: dimension-analyzer-agent
description: Analyzes one specific dimension of an audit or review — internal consistency, technical correctness, completeness, goal alignment, etc. Receives all relevant context and dimension-specific instructions. Keywords - audit, review, dimension, analysis, finding, quality.
model: sonnet
---

# Dimension Analyzer Agent

## Purpose

You are an analysis agent specialized in one dimension of a documentation audit or proposal review. Evaluate the provided content against the specific dimension criteria and produce structured findings.

## Variables

- **DIMENSION_NAME**: Which dimension to evaluate (e.g., "Technical Correctness", "Completeness", "Value Assessment")
- **DIMENSION_INSTRUCTIONS**: The specific evaluation criteria for this dimension (copied from the mode reference)
- **CONTENT**: The document content or summaries to evaluate
- **CONTEXT**: Additional context (system doc summaries, previous audit results, goal statements)
- **MODE**: "audit" (system-wide) or "review" (proposal-scoped)

## Workflow

1. Read the DIMENSION_INSTRUCTIONS carefully
2. Apply the dimension criteria to CONTENT using CONTEXT for reference
3. If MODE is "audit" and the dimension requires external research (e.g., Technical Correctness), conduct web searches
4. Produce findings with evidence and severity ratings

## Report

```
DIMENSION: {DIMENSION_NAME}
MODE: {MODE}
RATING: good | some-issues | significant-problems

## Findings

### [Finding Title]
- **Severity**: critical / major / minor / advisory
- **Location**: [which doc(s) and section(s)]
- **Finding**: [what's wrong or concerning]
- **Evidence**: [specific quotes, references, or research results]
- **Impact**: [what goes wrong if not addressed]
- **Suggested Action**: [how to fix]

### [Finding Title 2]
...

## Dimension Summary
[1-2 paragraph assessment of this dimension's health]

RESULT: {RATING} | Findings: {critical count}/{major count}/{minor count}/{advisory count}
```
```

**Agent 4: task-implementer-agent**

Purpose: Implement a single task or task group. Used by run-mode and autopilot-mode parallel execution.

```markdown
---
name: task-implementer-agent
description: Implements a single task from the task queue — reads specs, writes code, runs tests, reports results. Used for parallel task group execution. Keywords - implement, code, task, parallel, test, build.
model: opus
---

# Task Implementer Agent

## Purpose

You are an implementation agent. Implement the assigned task according to its spec reference and acceptance criteria. Write tests if in autopilot mode. Report structured results.

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
3. If CONTEXT_FILES provided, load them for library-specific guidance
4. Implement the code to meet acceptance criteria
5. If MODE is "autopilot", write tests per TEST_SPEC_SECTION or acceptance criteria
6. If MODE is "autopilot", run the tests
7. Verify each acceptance criterion
8. Produce the structured report

## Report

```
TASK: {TASK_ID}
STATUS: COMPLETE | PARTIAL | FAILED

## Files Modified
| File | Action | Description |
|------|--------|-------------|
| [path] | created / modified | [what was done] |

## Acceptance Criteria
| # | Criterion | Status | Notes |
|---|----------|--------|-------|
| 1 | [criterion text] | PASS / FAIL | [details if FAIL] |

## Tests (autopilot mode only)
| Test File | Tests | Passing | Failing |
|-----------|-------|---------|---------|
| [path] | [count] | [count] | [count] |

## Gaps Found
| Gap ID | Level | Description | Assumption Made |
|--------|-------|-------------|-----------------|
| [id] | L0/L1/L2 | [what's missing] | [what was assumed, if L0/L1] |

## Dependencies Added
| Package | Version | License | Audit Status |
|---------|---------|---------|-------------|
| [name] | [version] | [license] | clean / advisory / flagged |

RESULT: {COMPLETE|PARTIAL|FAILED} | Criteria: {passed}/{total} | Gaps: {L0}/{L1}/{L2}
```
```

**Agent 5: design-planner-agent**

Purpose: Plan a screen layout without making MCP writes. Used by mockups-mode parallel planning.

```markdown
---
name: design-planner-agent
description: Plans a screen layout — which components, where placed, what content — without making any MCP or file writes. Pure planning output for the main context to execute. Keywords - design, layout, plan, screen, mockup, component, parallel.
model: sonnet
---

# Design Planner Agent

## Purpose

You are a design planning agent. Plan the layout for a single screen based on the design system and screen spec. Do NOT make any MCP calls or file writes -- output a plan that the main context will execute.

## Variables

- **SCREEN_NAME**: Name of the screen to plan
- **SCREEN_SPEC**: Screen specification (features, route, viewport, interactions)
- **DESIGN_SYSTEM**: Design system tokens and component inventory
- **UI_SCREENS_SPEC**: Full UI screens specification for cross-screen consistency context

## Workflow

1. Read the screen spec and design system
2. Plan the layout: component selection, placement, content, variants needed
3. Identify which design system tokens apply to each component
4. Check cross-screen consistency (navigation, shared components)
5. Produce the structured plan

## Report

```
SCREEN: {SCREEN_NAME}
STATUS: PLANNED | NEEDS_COMPONENTS (if screen requires components not in design system)

## Layout Plan
[Structured description of the screen layout — sections, components, placement]

## Component Usage
| Component | Usage | Variant | Tokens Applied |
|-----------|-------|---------|---------------|
| [component name] | [where/how used] | [which variant] | [color, spacing, typography tokens] |

## Missing Components
| Needed Component | Closest Existing | Gap |
|-----------------|-----------------|-----|
| [what's needed] | [closest match in design system] | [what's different] |

## Batch Design Operations
[Ordered list of batch_design calls the main context should execute]

## Cross-Screen Notes
[Any consistency considerations with other screens]

RESULT: {PLANNED|NEEDS_COMPONENTS} | Components: {used}/{total in design system} | Missing: {count}
```
```

**Why these five agents and not more?** The five agents map directly to the five distinct work types identified in Finding 1. Creating agents for every subvariation (e.g., separate agents for "read system doc" vs. "read review file") would violate the thin-agent principle. A doc-reader-agent with a FORMAT variable handles both cases.

**Why Sonnet for most agents?** Read and analysis tasks don't require Opus-level reasoning. The orchestrator (running in the main context, which is already Opus) handles synthesis and judgment. Agents handle data gathering and structured evaluation. The task-implementer-agent is the exception -- code production benefits from Opus.

**Tradeoffs**:
- *Pro*: Five agents cover all 15 parallelization points with no redundancy
- *Pro*: Thin agents (~30-40 lines including report template) minimize context overhead per spawn
- *Pro*: Structured reports with parseable summary lines (`RESULT: ...`) enable automated collection
- *Con*: Agent definitions are new files that need to live somewhere in the plugin structure
- *Con*: The model field (sonnet vs. opus) may need configuration -- not all users have access to all models

**Source**: Design synthesis from Bowser's agent patterns (R-002 Finding 1, bowser-qa-agent.md, playwright-bowser-agent.md) applied to Clarity Loop's parallelization inventory.

### Finding 3: Per-Mode Fan-Out Design

**Context**: With agents defined, each mode needs a concrete 4-phase orchestration design (Discover, Spawn, Collect, Aggregate).

**Analysis**: Below is the complete fan-out design for every mode that benefits from formalization, ordered by priority (highest-value first).

---

**Mode 1: audit-mode (cl-reviewer) -- HIGHEST PRIORITY**

Audit mode is the heaviest operation in the pipeline. It reads ALL system docs, analyzes across 9 dimensions, checks every doc pair for consistency, and conducts external research. Current prose instruction: "Dispatch subagents in parallel, one per doc" and "Use subagents for parallel analysis where dimensions are independent."

**Phase 1: Discover**

```
1. Glob docs/system/*.md to build the doc list
2. Read docs/reviews/audit/AUDIT_*.md to find previous audits
3. Skim docs/research/ and docs/proposals/ headers for change history
4. Compute work units:
   - Doc read agents: N (one per system doc)
   - Consistency checker agents: N*(N-1)/2 (one per doc pair)
   - Dimension analyzer agents: 9 (one per audit dimension)
   - Total agents: N + N*(N-1)/2 + 9
   - Example: 6 docs = 6 + 15 + 9 = 30 work units
5. Build the fan-out plan and present to user:
   "Audit will fan out [X] agents: [N] doc readers, [P] consistency checkers,
   [D] dimension analyzers. Estimated parallel execution. Proceed?"
```

**Phase 2: Spawn (two waves)**

Wave 1 (doc reads) must complete before Wave 2 (analysis) starts, because analyzers need the doc summaries.

```
Wave 1: Doc Reads
  TeamCreate("audit-read")
  For each system doc:
    TaskCreate(subject="Read: {doc name}", description="Full content analysis")
    Task(subagent_type="doc-reader-agent", prompt=structured prompt with DOC_PATH and FORMAT="full")
  Launch ALL doc reader agents in a single message
  Wait for all to complete
  Collect structured summaries
  TeamDelete("audit-read")

Wave 2: Analysis (two parallel tracks)
  TeamCreate("audit-analyze")

  Track A: Consistency checking
    For each doc pair (from collected summaries):
      TaskCreate(subject="Consistency: {doc A} <-> {doc B}")
      Task(subagent_type="consistency-checker-agent", prompt with both summaries, SCOPE="full")

  Track B: Dimension analysis
    For each of the 9 audit dimensions:
      TaskCreate(subject="Dimension: {dimension name}")
      Task(subagent_type="dimension-analyzer-agent", prompt with all doc summaries +
        dimension-specific instructions copied from audit-mode reference +
        previous audit results for trend analysis)

  Launch ALL consistency + dimension agents in a single message
  Wait for all to complete
  TeamDelete("audit-analyze")
```

**Phase 3: Collect**

```
For each consistency checker result:
  Parse RESULT line: CONSISTENT | TENSION | CONFLICT
  Extract issue count
  Store full report for aggregation

For each dimension analyzer result:
  Parse RESULT line: rating + finding counts by severity
  Store full findings for aggregation

Handle failures:
  If a consistency checker times out: mark that pair as "UNVERIFIED" in the cross-reference map
  If a dimension analyzer times out: mark that dimension as "INCOMPLETE" in the health score
  Include whatever partial output was available
```

**Phase 4: Aggregate**

```
1. Cross-dimension synthesis pass:
   - Scan all dimension findings for cross-cutting themes
   - Example: Technical Correctness found "pgvector claims 768-dim" AND Completeness found
     "memory layer spec incomplete" -- these are related, note the connection
   - This is the orchestrator's unique value: no individual agent sees the full picture

2. Build the audit report structure:
   - Executive Summary: synthesized from all dimension ratings
   - Health Score: one row per dimension from dimension-analyzer results
   - Cross-Reference Map: from consistency-checker results
   - Critical Findings: severity=critical from any agent, with cross-dimension connections
   - Warnings: severity=major from any agent
   - Technical Verification: from Technical Correctness dimension agent
   - Goal Alignment: from Goal Alignment dimension agent
   - Staleness: from Staleness dimension agent
   - Comparison with previous audit: delta analysis

3. Final report assembly follows the existing audit-mode output template exactly
```

---

**Mode 2: verify-mode Part C (cl-reviewer) -- HIGH PRIORITY**

Verify mode's Parts A, B, and D are sequential (they walk through the change manifest). Part C (cross-document consistency) is the fan-out target.

**Phase 1: Discover**

```
1. Read the proposal's Change Manifest to identify affected docs
2. Build the affected doc pair list (only pairs where at least one doc was modified)
3. If N docs were modified and M total docs exist:
   - Minimum pairs: N (each modified doc vs. itself-before -- but we don't have before)
   - Realistic pairs: all pairs involving at least one modified doc
   - Example: 2 docs modified out of 6 total = up to 11 pairs (2*5 + C(2,2) = 11)
   - Optimization: skip pairs where neither doc was modified by the proposal
```

**Phase 2: Spawn**

```
Note: Verify-mode already runs Wave 1 (doc reads) in Step 1, before Part C.
Reuse the doc summaries already collected.

TeamCreate("verify-consistency")
For each affected doc pair:
  TaskCreate(subject="Verify consistency: {doc A} <-> {doc B}")
  Task(subagent_type="consistency-checker-agent", prompt with both doc summaries +
    SCOPE="post-merge" + CHANGE_MANIFEST from the proposal)
Launch ALL in a single message
```

**Phase 3: Collect**

```
Same as audit-mode -- parse RESULT lines, extract issue counts, handle timeouts
```

**Phase 4: Aggregate**

```
Build the Cross-Document Consistency section of the verify report:
- Consistency status table (doc pairs with status)
- Detail sections for any TENSION or CONFLICT findings
- Note any pairs that couldn't be checked (timeout/failure)
Feed into the existing verify-mode Step 3 output template
```

---

**Mode 3: spec-mode Step 2 (cl-implementer) -- HIGH PRIORITY**

Spec mode's heavy read is the first bottleneck users hit when entering the implementation phase.

**Phase 1: Discover**

```
1. Read docs/system/.manifest.md for the doc list
2. Build the reader agent list: one per system doc
3. Compute expected summary size (rough: 500-1000 tokens per doc summary)
```

**Phase 2: Spawn**

```
TeamCreate("spec-read")
For each system doc:
  TaskCreate(subject="Read for spec: {doc name}")
  Task(subagent_type="doc-reader-agent", prompt with DOC_PATH +
    FOCUS="types, entities, interfaces, contracts, behavioral rules, cross-references" +
    FORMAT="full")
Launch ALL in a single message
```

**Phase 3: Collect**

```
For each reader result:
  Parse RESULT line for completion status
  Extract structured summaries
  If a reader fails: fall back to direct read of that doc in the main context
```

**Phase 4: Aggregate**

```
1. Merge all doc summaries into a unified knowledge base:
   - All defined types across all docs
   - All interfaces and contracts
   - All cross-references (build a dependency graph)
   - All behavioral rules and constraints

2. This aggregated knowledge feeds into Step 3 (format selection) and Step 4 (generation)
3. The cross-reference graph from the aggregation directly produces the
   Cross-Spec Dependencies table in the spec manifest
```

---

**Mode 4: review-mode Step 3 (cl-reviewer) -- MEDIUM PRIORITY**

Only valuable for very long proposals (>500 lines). The reference file already says "consider dispatching subagents to analyze different dimensions in parallel."

**Phase 1: Discover**

```
1. Measure proposal length
2. If < 500 lines: skip fan-out, analyze sequentially (existing behavior)
3. If >= 500 lines: plan fan-out across 7 review dimensions
```

**Phase 2: Spawn**

```
TeamCreate("review-dimensions")
For each of the 7 review dimensions:
  TaskCreate(subject="Review dimension: {dimension name}")
  Task(subagent_type="dimension-analyzer-agent", prompt with:
    DIMENSION_NAME, DIMENSION_INSTRUCTIONS (from review-mode reference),
    CONTENT=full proposal text, CONTEXT=system doc summaries,
    MODE="review")
Launch ALL in a single message
```

**Phase 3: Collect**

```
Parse each dimension result for findings with severity ratings
Handle timeouts by marking dimension as "INCOMPLETE -- manual review needed"
```

**Phase 4: Aggregate**

```
1. Cross-dimension synthesis:
   - Do value assessment findings affect completeness scoring?
   - Do internal coherence issues compound with external consistency issues?
2. Build the 7-dimension review report following the existing review-mode template
3. Determine verdict: APPROVE / APPROVE WITH CHANGES / NEEDS REWORK
   based on aggregated severity counts
```

---

**Mode 5: re-review-mode Step 1 (cl-reviewer) -- MEDIUM PRIORITY**

Simple fan-out for parallel reading of review history.

**Phase 1: Discover**

```
1. Glob docs/reviews/proposals/REVIEW_P-NNN_v*.md
2. Count review files
3. If 1 file: no fan-out needed, read directly
4. If 2+ files: fan out readers
```

**Phase 2: Spawn**

```
TeamCreate("rereview-read")
For each review file:
  Task(subagent_type="doc-reader-agent", prompt with DOC_PATH +
    FOCUS="blocking issues and non-blocking suggestions" +
    FORMAT="claims-only")
Launch ALL in a single message
```

**Phase 3: Collect and Aggregate**

```
Collect all issue lists
Build the cumulative issue ledger ordered by version
This feeds into Step 2 (Five-Part Analysis)
```

---

**Mode 6: run-mode / autopilot-mode parallel groups (cl-implementer) -- LOWER PRIORITY**

These modes already have well-specified parallel execution instructions. The fan-out formalization adds structured result collection and failure handling.

**Phase 1: Discover**

```
1. Read TASKS.md dependency graph
2. Identify independent task groups (from start-mode Step 4 analysis)
3. If no parallel groups approved: skip fan-out
4. Cap at 3 parallel groups (existing constraint)
```

**Phase 2: Spawn**

```
TeamCreate("impl-parallel")
For each task group:
  Task(subagent_type="task-implementer-agent", prompt with:
    TASK_ID, TASK_DESCRIPTION, SPEC_REFERENCE, ACCEPTANCE_CRITERIA,
    DEPENDENCY_CONTEXT, MODE="run" or "autopilot",
    TEST_SPEC_SECTION if available, CONTEXT_FILES if available)
Launch ALL in a single message
```

**Phase 3: Collect**

```
For each implementer result:
  Parse RESULT line for completion status and criteria pass rate
  Extract files modified list
  Check for file conflicts: any file modified by multiple agents
  Extract gap reports
```

**Phase 4: Aggregate**

```
1. File conflict resolution:
   - If same file modified by multiple agents: re-run conflicting tasks sequentially
   - This is the existing behavior, now formalized
2. Update TASKS.md with all task completions
3. Merge gap reports into the Spec Gaps table
4. If autopilot: merge test results into the checkpoint summary
```

---

**Mode 7: mockups-mode parallel planning (cl-designer) -- LOWER PRIORITY**

Design parallelization is already well-constrained in the existing reference file. The formalization adds the team lifecycle.

**Phase 1: Discover**

```
1. Count confirmed screens
2. If < 5: no fan-out (existing threshold)
3. If >= 5 and all reusable components exist: proceed with fan-out
```

**Phase 2: Spawn**

```
TeamCreate("design-plan")
For each screen:
  Task(subagent_type="design-planner-agent", prompt with:
    SCREEN_NAME, SCREEN_SPEC, DESIGN_SYSTEM, UI_SCREENS_SPEC)
Launch ALL in a single message
```

**Phase 3: Collect and Aggregate**

```
Collect screen plans
Identify any NEEDS_COMPONENTS results -- these block execution until design system is updated
Feed completed plans to main context for sequential batch_design execution
(MCP writes remain sequential in main context -- the parallelism is in planning only)
```

**Tradeoffs**:
- *Pro*: Every mode has a concrete, implementable orchestration design
- *Pro*: The two-wave pattern (read first, analyze second) naturally handles the most common dependency
- *Pro*: Aggregation phase is where the orchestrator adds unique value (cross-cutting synthesis)
- *Con*: Audit mode's 30-agent fan-out is aggressive -- may need to be capped at smaller doc counts
- *Con*: Two-wave pattern means audit mode needs two team lifecycles (sequential waves), which adds overhead

**Source**: Design synthesis from per-mode reference file analysis applied to Bowser's 4-phase pattern (R-002 Finding 2, ui-review.md).

### Finding 4: Team Lifecycle Management

**Context**: Each fan-out operation needs to create a team, distribute work, collect results, and clean up. How should Clarity Loop manage this lifecycle?

**Analysis**: Based on Bowser's `TeamCreate` / `TeamDelete` pattern and Clarity Loop's specific needs:

**Naming Convention**

Teams are named `{skill}-{mode}-{purpose}[-{wave}]`:
- `reviewer-audit-read` -- audit mode, doc reading wave
- `reviewer-audit-analyze` -- audit mode, analysis wave
- `reviewer-verify-consistency` -- verify mode, consistency checking
- `implementer-spec-read` -- spec mode, doc reading
- `implementer-run-parallel` -- run mode, parallel task groups
- `reviewer-review-dimensions` -- review mode, dimension analysis
- `reviewer-rereview-read` -- re-review mode, history loading
- `designer-mockups-plan` -- mockups mode, screen planning

**Lifecycle Protocol**

```
Phase: CREATE
  1. Check if teams are available:
     - Attempt TeamCreate with the team name
     - If the TeamCreate tool is not available or returns an error:
       Log: "Agent teams not available. Falling back to sequential execution."
       Set SEQUENTIAL_FALLBACK = true
       Skip all team operations
  2. If teams are available:
     - TeamCreate({team-name})
     - Log: "Team {team-name} created for {purpose}"

Phase: DISTRIBUTE
  1. For each work unit:
     - TaskCreate(subject={work description}, description={full details})
     - Task(subagent_type={agent-type}, team_name={team-name}, prompt={structured prompt})
  2. CRITICAL: All Task calls in a single message for parallel launch
  3. Log: "Dispatched {N} agents to team {team-name}"

Phase: COLLECT
  1. Wait for teammate messages (delivered automatically on completion)
  2. For each result:
     - Parse the RESULT summary line
     - Extract structured data
     - TaskUpdate(status="completed")
  3. Timeout handling:
     - If an agent hasn't responded within AGENT_TIMEOUT (default: 300s):
       Mark as TIMEOUT with whatever partial output is available
     - Continue collection for other agents
  4. Log: "Collected {M}/{N} results ({N-M} timed out)"

Phase: CLEANUP
  1. SendMessage(type="shutdown_request") to all teammates
  2. TeamDelete({team-name})
  3. Log: "Team {team-name} cleaned up"
```

**Multi-Wave Orchestration**

Some modes (audit) require two sequential waves where Wave 2 depends on Wave 1's output:

```
Wave 1: READ
  CREATE → DISTRIBUTE → COLLECT → CLEANUP

[Orchestrator processes Wave 1 results, prepares Wave 2 inputs]

Wave 2: ANALYZE
  CREATE → DISTRIBUTE → COLLECT → CLEANUP

[Orchestrator aggregates everything into final output]
```

Each wave gets its own team (different name suffix). This avoids team reuse complexity and makes cleanup straightforward.

**Error Classification**

| Error Type | Handling | Impact |
|-----------|---------|--------|
| Agent timeout | Mark work unit as TIMEOUT, include partial output, continue | Degraded but functional |
| Agent crash (no output) | Mark work unit as FAILED, note in report | Missing data point |
| Team creation failure | Fall back to sequential execution entirely | No parallelism for this invocation |
| Partial team failure (some agents work, some don't) | Collect what succeeded, note what failed | Partial results |
| All agents fail | Fall back to sequential execution, warn user | Full sequential fallback |

**Tradeoffs**:
- *Pro*: Clean lifecycle with predictable naming and cleanup
- *Pro*: Each wave is self-contained -- partial failures don't corrupt the team state
- *Pro*: Error classification enables intelligent degradation rather than all-or-nothing
- *Con*: Multi-wave adds latency (can't start Wave 2 until Wave 1 completes)
- *Con*: Team name collisions are theoretically possible if two modes run concurrently (unlikely in practice since skills are sequential)

**Source**: Adapted from Bowser's ui-review.md lifecycle protocol (R-002 Finding 2) with Clarity Loop-specific naming and multi-wave extension.

### Finding 5: Graceful Degradation Design

**Context**: Claude Code's agent teams feature is experimental. Every mode must work with or without it.

**Analysis**: The degradation design has three layers:

**Layer 1: Feature Detection (at orchestration start)**

```
function canFanOut():
  try:
    // Attempt to create a probe team
    TeamCreate("probe-{random-id}")
    TeamDelete("probe-{random-id}")
    return true
  catch:
    return false
```

In practice, this is simpler: if the TeamCreate tool is not available in the tool list, teams are not enabled. The orchestrator checks once at the start of a fan-out operation and caches the result for the session.

**Layer 2: Reference File Dual-Path Structure**

Each reference file that uses fan-out should have a dual-path structure:

```markdown
### Step N: [Description]

**With agent teams** (when available):

[Fan-out orchestration as designed in Finding 3]

**Sequential fallback** (when teams are unavailable):

[Sequential execution instructions -- read docs one at a time,
analyze dimensions one at a time, etc.]
```

This is additive -- the sequential path is what the reference files already contain today. The fan-out path is the new addition. No existing behavior changes.

**Layer 3: Configuration Override**

Add to `.clarity-loop.json`:

```json
{
  "orchestration": {
    "fanOut": "auto" | "enabled" | "disabled",
    "maxAgents": 10,
    "agentTimeout": 300000,
    "waveTimeout": 600000
  }
}
```

- `"auto"` (default): detect teams availability, fan out if available
- `"enabled"`: require teams, error if not available
- `"disabled"`: always use sequential execution, even if teams are available

This gives users explicit control. Some may prefer sequential for cost reasons even when teams are available.

**Degradation impact per mode:**

| Mode | Fan-Out Value | Sequential Penalty | Degradation Recommendation |
|------|-------------|-------------------|-----------------------------|
| audit-mode | Very High -- 30 agents eliminate the context bottleneck | High -- reading ALL docs sequentially fills context | Accept degraded quality: summarize more aggressively in sequential mode |
| verify-mode Part C | High -- N doc pairs checked in parallel | Medium -- pairs can be checked sequentially since each is independent | Acceptable: check pairs sequentially, same quality, more time |
| spec-mode Step 2 | High -- N docs read in parallel | Medium -- sequential reads work but fill context | Acceptable: read sequentially with progressive summarization |
| review-mode Step 3 | Medium -- 7 dimensions in parallel | Low -- dimensions are already evaluated in one pass today | Minimal impact: current behavior IS sequential |
| run-mode / autopilot | Medium -- parallel task groups | Low -- sequential execution is the default today | No impact: sequential is the current behavior |
| mockups-mode | Low -- planning only, MCP writes are sequential | Very Low -- planning is fast even sequentially | No meaningful impact |

**Tradeoffs**:
- *Pro*: Zero breaking changes -- existing behavior is the fallback
- *Pro*: Configuration gives users explicit control over parallelism
- *Pro*: Probe-based detection is automatic and transparent
- *Con*: Maintaining dual paths in reference files adds documentation bulk
- *Con*: Sequential audit mode is genuinely worse (context pressure) -- not just slower

**Source**: Design synthesis from R-002 Finding 7 (Graceful Degradation), applied to Clarity Loop's experimental feature dependency.

### Finding 6: Cross-Agent Dependency Handling

**Context**: Some fan-out work units have partial dependencies. A finding from agent A might affect agent B's analysis. How does the orchestrator handle this without sacrificing parallelism?

**Analysis**: Cross-agent dependencies in Clarity Loop fall into three categories:

**Category 1: No Dependencies (Pure Parallel)**

All Category A (heavy read) work has zero cross-agent dependencies. Each reader operates on a different file with no shared state. This is the simplest case and covers the majority of agents spawned.

All Category B consistency checking (pairwise doc checks) also has zero cross-agent dependencies. Each pair is checked independently.

**Category 2: Output Dependencies (Two-Wave)**

Audit mode's analysis agents (Category B dimension analysis) depend on the output of read agents (Category A). This is handled by the two-wave pattern from Finding 4: Wave 1 reads all docs, Wave 2 analyzes using the summaries. No cross-agent dependency within a wave -- only between waves.

**Category 3: Soft Dependencies (Post-Collection Synthesis)**

Some analysis dimensions have soft dependencies:
- **Audit**: Technical Correctness findings might inform Completeness assessment
- **Audit**: Goal Alignment analysis might connect to Staleness findings
- **Review**: Value Assessment context informs Completeness scoring

These are NOT hard dependencies. Each dimension agent can produce valid findings independently. The connections between dimensions are emergent -- they're discovered during aggregation, not required during analysis.

**The post-collection synthesis pass** (in the Aggregate phase) handles soft dependencies:

```
After collecting all dimension results:

1. Cross-reference scan:
   For each finding with severity >= major:
     Search all other dimension findings for:
       - Same document/section referenced
       - Same concept mentioned
       - Related technology or pattern
     If connections found:
       Add a "Cross-Dimension Connection" note to the finding
       Elevate severity if the connection makes the issue worse

2. Theme extraction:
   Group findings by:
     - Affected document (same doc appears in multiple dimensions)
     - Affected concept (same concept flagged by multiple dimensions)
     - Root cause (multiple findings trace to the same underlying issue)
   If a theme has 3+ findings across dimensions:
     Promote to a "Critical Finding" with explicit cross-dimension evidence

3. Narrative synthesis:
   The orchestrator writes the Executive Summary with knowledge no individual
   agent had -- the cross-dimensional view. This is the highest-value output
   of the fan-out pattern: not just parallel speed, but emergent insight from
   combining independent analyses.
```

**Why not just pass findings between agents?**

Passing real-time findings between parallel agents would:
1. Require sequential ordering (agent A before agent B) -- defeating parallelism
2. Create cascading context bloat (each agent inherits all previous agents' output)
3. Add coordination complexity (which agent sends to which? in what order?)

The post-collection synthesis is simpler, equally effective, and preserves full parallelism. The orchestrator is the only entity that sees all results -- it's the natural point for synthesis.

**Tradeoffs**:
- *Pro*: Full parallelism preserved -- no agent waits for another within a wave
- *Pro*: Synthesis pass catches cross-cutting themes that individual agents miss
- *Pro*: Orchestrator has the full picture for the highest-quality summary
- *Con*: Subtle connections between dimensions might be missed if agents don't know about each other
- *Con*: Synthesis adds a processing step after collection

**Source**: Analysis of audit-mode and review-mode dimension interdependencies, informed by Bowser's approach where agents have "no awareness of siblings" (R-002 Finding 4).

### Finding 7: Token Cost Analysis

**Context**: Fan-out spawns N parallel contexts instead of 1 serial context. Is this actually cheaper, or does the overhead of N agent contexts outweigh the benefit?

**Analysis**: Token cost depends on three factors: per-agent context size, orchestration overhead, and the alternative (sequential) context pressure.

**Per-Agent Context Estimates**

| Agent Type | Base Context (agent .md + skill) | Per-Task Input | Per-Task Output | Total Per Agent |
|-----------|--------------------------------|---------------|----------------|----------------|
| doc-reader-agent | ~800 tokens | ~2,000-10,000 tokens (one doc) | ~500-1,500 tokens (summary) | ~3,300-12,300 |
| consistency-checker-agent | ~1,000 tokens | ~2,000-4,000 tokens (two summaries) | ~500-2,000 tokens (findings) | ~3,500-7,000 |
| dimension-analyzer-agent | ~900 tokens | ~3,000-8,000 tokens (all doc summaries + dimension instructions) | ~500-3,000 tokens (findings) | ~4,400-11,900 |
| task-implementer-agent | ~1,200 tokens | ~2,000-5,000 tokens (spec + context) | ~1,000-3,000 tokens (code + report) | ~4,200-9,200 |
| design-planner-agent | ~900 tokens | ~2,000-5,000 tokens (screen spec + design system) | ~500-1,500 tokens (plan) | ~3,400-7,400 |

**Audit Mode Token Comparison (6 system docs)**

Sequential (current):
```
Read all 6 docs into one context:     ~30,000-60,000 tokens (input)
Analyze 9 dimensions sequentially:     Reuses same context (no additional input cost)
Cross-reference 15 doc pairs:          Reuses same context
Total context size at peak:            ~60,000-80,000 tokens
Total output (one report):             ~5,000-10,000 tokens
Total cost: ~65,000-90,000 tokens
```

Fan-out (proposed):
```
Wave 1: 6 doc-reader-agents:
  Per agent: ~3,300-12,300 tokens
  Total: ~19,800-73,800 tokens (parallel, but summed for cost)

Wave 2: 15 consistency-checkers + 9 dimension-analyzers:
  Per consistency agent: ~3,500-7,000 tokens
  Total consistency: ~52,500-105,000 tokens
  Per dimension agent: ~4,400-11,900 tokens
  Total dimension: ~39,600-107,100 tokens

Orchestrator context:
  Collecting summaries + synthesis: ~15,000-25,000 tokens

Grand total: ~127,000-311,000 tokens
```

**Fan-out is 1.5x to 3.5x more expensive in raw tokens.** However:

1. **The sequential approach hits a wall.** With 6 large system docs, the single context approaches Claude's effective context window. The quality of analysis degrades as context fills -- later dimensions get worse analysis because earlier content is less accessible. Fan-out gives each agent a fresh, focused context.

2. **Wall-clock time is dramatically better.** 30 agents in parallel complete in the time of the slowest agent. Sequential execution takes the sum of all agent times.

3. **Sonnet agents are cheaper.** The per-agent cost comparison above assumes Opus for both. If fan-out agents use Sonnet (as recommended in Finding 2), the token cost is similar but the dollar cost is roughly 5-10x lower per agent, partially offsetting the higher total token count.

4. **The aggregation step adds unique value.** Sequential analysis in one context doesn't naturally produce cross-dimensional insights. The orchestrator's synthesis pass (Finding 6) surfaces emergent patterns that justify the additional cost.

**Break-Even Analysis**

| Mode | Fan-Out Multiplier | Quality Improvement | Wall-Clock Improvement | Recommendation |
|------|-------------------|--------------------|-----------------------|---------------|
| audit-mode | 2-3.5x tokens | High (fresh context per analysis) | 5-10x faster | Fan out -- quality and speed justify cost |
| verify-mode Part C | 1.5-2x tokens | Medium (focused pairwise checks) | 3-5x faster | Fan out -- speed is the primary value |
| spec-mode Step 2 | 1.2-1.5x tokens | Low (reads are reads) | 2-3x faster | Fan out -- low overhead, pure parallelism |
| review-mode Step 3 | 2-3x tokens | Medium (independent dimension analysis) | 2-3x faster | Only for long proposals (>500 lines) |
| run-mode/autopilot | 1.5-2x tokens | Low (same work, just parallel) | 2-3x faster | User opt-in only -- cost-sensitive |
| mockups-mode | 1.2-1.5x tokens | None (planning only) | 1.5-2x faster | Low priority |

**Tradeoffs**:
- *Pro*: Fan-out improves quality for analysis-heavy modes (audit, review) by preventing context degradation
- *Pro*: Dramatic wall-clock time improvement for all modes
- *Pro*: Sonnet for agents partially offsets the token count multiplier
- *Con*: 2-3.5x more tokens for audit mode is a real cost increase
- *Con*: Users paying per-token will feel this -- needs to be opt-in or at least opt-out

**Source**: Token estimates based on analysis of system doc sizes (SYSTEM_DESIGN.md is ~61KB, other docs are 5-30KB), agent definition sizes, and output format sizes. Sequential context estimates based on current mode execution patterns.

## Options Analysis

| Criterion | Option A: Full Fan-Out | Option B: Read-Only Fan-Out | Option C: Audit-Only Fan-Out |
|-----------|----------------------|---------------------------|----------------------------|
| **Scope** | All 7 modes get fan-out | Only doc-read operations fan out; analysis stays sequential | Only audit-mode (the heaviest) gets fan-out |
| **Agent definitions** | All 5 agents defined | Only doc-reader-agent | doc-reader-agent + consistency-checker + dimension-analyzer |
| **Token cost increase** | 2-3.5x for heavy modes | 1.2-1.5x (reads only) | 2-3.5x for audit only |
| **Implementation effort** | High -- 7 modes updated, 5 agents, lifecycle management | Low -- 4 modes updated, 1 agent, simple lifecycle | Medium -- 1 mode updated, 3 agents |
| **Quality improvement** | High across all modes | Low-Medium (reads don't improve quality, just speed) | High for audit only |
| **Risk** | Medium -- many moving parts | Low -- minimal changes | Low-Medium -- concentrated change |
| **Value delivery** | Gradual -- each mode takes effort | Immediate -- simple reads are easy | Focused -- biggest pain point first |
| **Graceful degradation** | All modes need dual paths | Simple -- reads just go sequential | One mode needs dual path |
| **Foundation for future** | Complete pattern established | Incomplete -- analysis fan-out still needed later | Partial -- other modes still need fan-out |

## Recommendations

### Primary Recommendation: Option A (Full Fan-Out) with Staged Rollout

Implement all 5 agents and all 7 mode fan-out designs, but roll them out in three stages ordered by value and complexity. This avoids the "build it all at once" risk of Option A while avoiding the "rebuild the pattern later" cost of Options B and C.

**Stage 1: Foundation + Doc Reads** (immediate value, low risk)

Define all 5 agent files (they're small -- ~30-40 lines each). Update the 4 modes that use doc-reader-agent:
- spec-mode Step 2 (cl-implementer)
- audit-mode Step 1 (cl-reviewer)
- verify-mode Step 1 (cl-reviewer)
- re-review-mode Step 1 (cl-reviewer)

Add the `orchestration` configuration block to `.clarity-loop.json` schema.
Add graceful degradation detection.

**Deliverables**: 5 agent definitions, 4 reference file updates, config schema update.
**Value**: Parallel doc reads across 4 modes. Foundation for all subsequent fan-out.

**Stage 2: Analysis Fan-Out** (highest quality impact)

Update the modes that dispatch analysis agents:
- audit-mode Step 2 -- full two-wave orchestration (read wave already from Stage 1 + analysis wave)
- verify-mode Part C -- consistency checker fan-out (doc reads already from Stage 1)
- review-mode Step 3 -- dimension analysis fan-out (conditional on proposal length)

Add post-collection synthesis pass to audit-mode and review-mode aggregation.

**Deliverables**: 3 reference file updates with full 4-phase orchestration + synthesis.
**Value**: The quality-of-analysis improvement that justifies fan-out. Cross-dimensional insight.

**Stage 3: Implementation Fan-Out** (completing the pattern)

Update the implementation and design modes:
- run-mode parallel groups (cl-implementer)
- autopilot-mode parallel groups (cl-implementer)
- mockups-mode parallel planning (cl-designer)

These modes already have well-specified parallel execution instructions. Stage 3 adds formal team lifecycle, structured result collection, and file conflict handling protocol.

**Deliverables**: 3 reference file updates with team lifecycle and structured results.
**Value**: Formal protocol for implementation parallelism. Cleaner error handling.

### Why this order

1. **Stage 1 is low-risk, high-frequency.** Doc reads happen in almost every heavy mode. Formalizing them establishes the pattern (team lifecycle, result protocol, degradation) that all subsequent stages reuse.

2. **Stage 2 is the highest-value target.** Audit mode is the most expensive pipeline operation and the one where context pressure most degrades quality. Analysis fan-out with post-collection synthesis is where the pattern delivers something sequential execution cannot: emergent cross-dimensional insight.

3. **Stage 3 is refinement.** Implementation and design fan-out already work informally. Formalizing them improves reliability and error handling but doesn't change the fundamental capability.

### Agent File Location

Agent definitions should live at:
```
skills/agents/
  doc-reader-agent.md
  consistency-checker-agent.md
  dimension-analyzer-agent.md
  task-implementer-agent.md
  design-planner-agent.md
```

This places them under `skills/` (they're part of the skill infrastructure) in a dedicated `agents/` directory (Bowser pattern: `.claude/agents/`). They're discoverable by any skill that needs to dispatch them.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude Code teams feature remains experimental or is removed | Medium | High -- all fan-out depends on it | Every mode has a sequential fallback. Agent definitions are still useful for documentation even without teams. |
| 30-agent audit fan-out exceeds Claude Code's team capacity | Medium | Medium -- audit can't fully parallelize | Cap concurrent agents. Wave 2 can be split into sub-waves (consistency agents first, then dimension agents) if needed. |
| Token cost increase makes fan-out uneconomical for some users | Medium | Medium -- adoption barrier | Configuration allows disabling fan-out (`orchestration.fanOut: "disabled"`). Sonnet for agents keeps dollar cost manageable. |
| Cross-dimension synthesis misses subtle connections | Low | Medium -- quality gap vs. sequential analysis by Opus | The synthesis pass is Opus (orchestrator context). Individual agents are Sonnet for efficiency, but the synthesis is high-quality. |
| Dual-path reference files become maintenance burden | Medium | Low -- documentation complexity | The sequential path is the existing content (unchanged). The fan-out path is additive. Over time, if teams become stable, the sequential path can be deprecated. |
| Concurrent mode invocations cause team name collisions | Low | Low -- one session, one skill at a time | Team names include mode name. If needed, add a session-unique suffix. |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| SYSTEM_DESIGN.md | New subsection in §1 (Architecture Overview) describing the agent layer; update §10 (Configuration) with orchestration config; update §12 (Spec Generation) to reference formal fan-out; update §14 (Verification and Audit) to reference formal fan-out |
| docs/cl-implementer.md | Update spec-mode description to reference fan-out; update run-mode and autopilot-mode to reference formal parallel protocol |
| docs/cl-reviewer.md | Update audit-mode, verify-mode, review-mode, re-review-mode descriptions to reference fan-out |
| docs/cl-designer.md | Update mockups-mode description to reference fan-out planning |
| docs/pipeline-concepts.md | New section on fan-out orchestration as a pipeline concept |
| (new) skills/agents/*.md | 5 new agent definition files |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Agent count | Many fine-grained agents vs. few general-purpose | 5 general-purpose agents | Maps 1:1 to the 4 work categories (read, check, analyze, implement) + 1 for design planning. Fine-grained agents (separate reader for system docs vs. reviews) would duplicate logic. |
| 2 | Agent model | All Opus vs. all Sonnet vs. mixed | Mixed: Sonnet for read/analysis, Opus for implementation | Read and analysis tasks don't need Opus reasoning. Implementation benefits from it. This keeps cost manageable while preserving quality where it matters. |
| 3 | Rollout strategy | All at once vs. staged | 3-stage rollout | Risk management. Stage 1 establishes the pattern with the simplest fan-out (reads). Stage 2 adds the highest-value fan-out (analysis). Stage 3 completes the picture. |
| 4 | Audit wave structure | Single wave (all agents at once) vs. two waves (reads then analysis) | Two waves | Analysis agents need doc summaries as input. Single wave would require agents to read their own docs, duplicating reads and inflating token cost. |
| 5 | Cross-agent dependencies | Real-time passing vs. post-collection synthesis | Post-collection synthesis | Real-time passing defeats parallelism. Synthesis preserves it while still catching cross-cutting themes. |
| 6 | Configuration default | Fan-out on by default vs. off by default | Auto-detect (on if teams available) | Users who enable experimental teams presumably want the benefits. `orchestration.fanOut: "auto"` respects this while allowing override. |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Agent model configuration | Users may want to override the model for specific agents (e.g., use Opus for consistency checking in production audits). A per-agent model override in `.clarity-loop.json` would enable this. | Add to config schema in Stage 1. Low effort, high flexibility. |
| Fan-out observability | When 30 agents run in parallel, the user has no visibility into progress. A progress display (N/M agents complete) would improve UX. | Research whether Claude Code teams provide progress callbacks. If not, consider a polling-based progress display. |
| Reusable doc summaries | If spec-mode reads all docs and then audit-mode reads all docs in the same session, the summaries are duplicated. Caching summaries across mode invocations would save tokens. | Low priority -- cross-mode invocations in the same session are rare. Revisit if usage patterns show repeated reads. |
| Agent composition | Some modes could compose agents -- e.g., audit-mode could use doc-reader-agent output as input to consistency-checker-agent AND dimension-analyzer-agent. The two-wave pattern does this, but it could be generalized as a pipeline-of-agents pattern. | Defer to V2. Current two-wave pattern is sufficient. |
| Structured result protocol standard | The RESULT summary line format (`RESULT: {STATUS} | Key: value | Key: value`) could become a cross-project standard for Claude Code agent communication, not just a Clarity Loop convention. | Out of scope for this research. Could be proposed as a Claude Code community convention. |

## Open Questions

1. **Claude Code teams API surface**: What exactly are the TeamCreate, TeamDelete, TaskCreate, TaskUpdate, Task, and SendMessage tool signatures? The design assumes Bowser's usage patterns, but the actual Claude Code API may differ. This needs verification before implementation.

2. **Maximum concurrent agents**: Is there a practical limit on how many agents Claude Code teams can support simultaneously? Audit mode's worst case (30 agents) may exceed it. Testing is needed to find the ceiling.

3. **Agent timeout behavior**: When an agent times out, does Claude Code provide partial output, or is the output lost? The error handling design assumes partial output is available (Bowser's pattern: "include whatever output was available"), but this needs verification.

4. **Sonnet availability in agent teams**: Can individual agents within a team use a different model than the orchestrator? The design assumes yes (orchestrator=Opus, agents=Sonnet), but this may be a teams feature limitation.

5. **Agent definition discovery**: Where should agent .md files live for Claude Code to discover them as valid agent types? Bowser uses `.claude/agents/`. Clarity Loop is a plugin -- do agents need to be in the plugin's directory, or in the user project's `.claude/agents/`?

6. **Cost tracking per fan-out operation**: Can token usage be attributed per-agent within a team? This would enable the user to see the actual cost of fan-out vs. sequential and make informed decisions about the `orchestration.fanOut` setting.

## References

- R-002: Bowser Architecture Patterns (`/Users/bhushan/Documents/Clarity_Loop/clarity-loop/docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md`) -- Findings 2, 4, and 7
- Bowser ui-review.md (`/Users/bhushan/Documents/bowser/.claude/commands/ui-review.md`) -- Complete fan-out orchestration pattern
- Bowser bowser-qa-agent.md (`/Users/bhushan/Documents/bowser/.claude/agents/bowser-qa-agent.md`) -- Rich agent definition pattern
- Bowser playwright-bowser-agent.md (`/Users/bhushan/Documents/bowser/.claude/agents/playwright-bowser-agent.md`) -- Thin agent pattern
- Clarity Loop reference files (all 32 files across 4 skills) -- Parallelization inventory source
- Clarity Loop SYSTEM_DESIGN.md (`/Users/bhushan/Documents/Clarity_Loop/clarity-loop/docs/SYSTEM_DESIGN.md`) -- Architecture context
