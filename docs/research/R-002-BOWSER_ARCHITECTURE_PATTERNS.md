# Research: Bowser Architecture Patterns for Clarity Loop

**ID**: R-002
**Created**: 2026-02-15
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Hybrid
- **Status**: draft
- **Open Questions**: 8 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Hybrid

This research examines architecture patterns from the Bowser project (an open-source Claude
Code browser automation framework) for potential adoption in Clarity Loop. It's hybrid because
it introduces net-new capabilities (browser automation, fan-out orchestration) while also
proposing evolutionary changes to the existing skill/reference architecture and the Guided
Autonomy Execution Model.

### Related System Docs

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| SYSTEM_DESIGN.md | §1 Architecture Overview, §2 End-to-End Pipeline Flow | Defines the plugin structure (4 skills, hooks, templates) that any restructuring must respect |
| SYSTEM_DESIGN.md | §3-6 Per-skill Architecture | Defines mode dispatch, reference loading, and subagent patterns per skill |
| SYSTEM_DESIGN.md | §7 State Management | Defines how pipeline state flows between skills — relevant to fan-out coordination |
| SYSTEM_DESIGN.md | §12 Spec Generation Pipeline | Mentions parallel subagent dispatch for heavy reads — the only current parallelization |
| SYSTEM_DESIGN.md | §14 Verification and Audit Systems | Audit mode dispatches parallel subagents — another parallelization precedent |
| docs/cl-implementer.md | Spec mode, Run mode | References subagent dispatch for parallel doc reads and task execution |
| docs/cl-reviewer.md | Verify mode, Audit mode | References parallel subagent dispatch for cross-document checks |
| docs/cl-designer.md | Mockups mode | References generate → screenshot → feedback → refine loop |

### Current State

Clarity Loop is a Claude Code plugin with 4 skills (cl-researcher, cl-reviewer, cl-designer,
cl-implementer), ~28 modes across those skills, and ~34 reference files containing mode
instructions. The architecture follows a single pattern:

**Current execution model**: One Claude Code session loads a SKILL.md, detects the mode from
user arguments, reads the corresponding reference file(s), and executes all work within that
single context. Subagents are mentioned in some modes (spec-mode dispatches parallel readers,
audit-mode dispatches parallel analyzers) but the orchestration is implicit — described in
prose within reference files rather than formalized as a pattern.

**Current Guided Autonomy model**: The GUIDED_AUTONOMY_EXECUTION_MODEL proposal (in-flight,
Draft status) adds intent-driven UX, file rationalization, and cross-cutting protocols. It
focuses on *what to do next* (session start orientation, transition advisories) but doesn't
address *how work gets distributed* across agents. The execution model remains single-context.

**Current browser/UI integration**: None. cl-designer generates design artifacts (.pen files
via Pencil MCP, or markdown fallback) but has no runtime validation — designs are never
tested against an actual browser. cl-implementer generates code from specs but has no visual
regression testing.

### Why This Research

Three gaps in the current pipeline prompted this research:

1. **Scalability ceiling**: As pipeline complexity grows (28+ modes, heavy verification passes,
   parallel spec generation), the single-context model hits token and time limits. Bowser's
   fan-out pattern shows how to break work into parallel agent teams.

2. **Guided Automation Execution**: The current model has one agent doing everything — guidance
   AND execution — in a single context. Bowser separates these: a command layer *guides*
   (discovers work, plans distribution) while an agent layer *executes* (isolated, parallel,
   focused). This could provide a more natural Guided Automation Execution model for Clarity
   Loop than the single-context approach.

3. **No design validation feedback loop**: cl-designer creates designs but can't verify them.
   Bowser's browser automation (Playwright CLI skill + QA agents) demonstrates a proven
   pattern for UI testing that could close this loop.

## Scope

### In Scope

- Bowser's 4-layer prompt abstraction: how it maps to Clarity Loop's skill/reference structure
- Bowser's fan-out orchestration pattern: TeamCreate → TaskCreate → parallel agents → collect → aggregate
- Browser automation architecture: Playwright CLI skill, named sessions, YAML story format
- How these patterns enable a more natural separation of guidance from execution
- Concrete mapping to Clarity Loop's existing modes and parallelization needs

### Out of Scope

- Implementing a browser automation skill for Clarity Loop (that's a follow-up proposal)
- Rewriting existing skill files (this research recommends restructuring patterns, not code)
- Chrome MCP vs Playwright CLI evaluation (Bowser supports both; we evaluate the pattern, not
  the specific browser tool)
- Bowser's justfile layer (Layer 4) — Clarity Loop is a Claude Code plugin, not a CLI tool;
  the reusability layer doesn't directly apply

### Constraints

- Clarity Loop is a Claude Code plugin — it must use Claude Code's native primitives (SKILL.md,
  agents, commands, Task tool) for any orchestration
- Claude Code's agent teams feature is experimental (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
  — any fan-out design must degrade gracefully if teams aren't available
- Existing skill/reference file structure has ~10,498 lines across 34 files — any
  restructuring must be incremental, not a rewrite
- The Guided Autonomy proposal is in-flight — this research should complement, not conflict

## Research Findings

### Finding 1: Bowser's 4-Layer Abstraction

**Context**: How Bowser organizes prompts across layers of abstraction and what each layer
provides.

**Analysis**: Bowser defines four explicit layers in its justfile:

| Layer | Name | What It Contains | Purpose |
|-------|------|-----------------|---------|
| Layer 1 | Skill (Capability) | `SKILL.md` files (playwright-bowser, claude-bowser) | Core capability: how to use a tool. Token-efficient, stateless, reusable across all agents. |
| Layer 2 | Agent (Scale) | Agent `.md` files (playwright-bowser-agent, claude-bowser-agent, bowser-qa-agent) | Thin wrappers (~20 lines) that bind a skill to an agent identity. Enables parallel instances. |
| Layer 3 | Command (Orchestration) | Command `.md` files (ui-review, hop-automate) | Multi-phase workflows: discover → plan → spawn agents → collect → aggregate. The "brain" layer. |
| Layer 4 | Just (Reusability) | Justfile recipes | CLI entry points with parameterized defaults. Maps human-friendly commands to Layer 3. |

**Key insight**: Layers 1 and 2 are deliberately thin. The playwright-bowser-agent is only
~20 lines — it says "you are a browser agent, use the playwright-bowser skill, report
results." It doesn't duplicate any skill knowledge. This separation means:

- Skills can evolve without touching agents
- Multiple agent types can share one skill (bowser-qa-agent and playwright-bowser-agent
  both use playwright-bowser)
- Agents can be spawned in parallel without context bloat (each carries only its thin
  identity + the shared skill)

Layer 3 is where intelligence lives. The `ui-review` command (~156 lines) handles discovery
(glob YAML files), planning (build story list, compute screenshot paths), orchestration
(TeamCreate, spawn all agents in one message), collection (parse results), and reporting
(aggregated pass/fail table). It never touches a browser — it only coordinates.

**Mapping to Clarity Loop**: Currently, Clarity Loop has only Layer 1 (SKILL.md files that
are both capability AND orchestration) and partially Layer 2 (subagent dispatch mentioned in
prose). There is no formal Layer 3 — orchestration is embedded within SKILL.md mode
descriptions.

| Bowser Layer | Clarity Loop Equivalent | Current State |
|-------------|------------------------|---------------|
| Layer 1: Skill | Reference files (e.g., `review-mode.md`) | Exists but overloaded — contains both capability instructions AND orchestration logic |
| Layer 2: Agent | Subagent mentions in prose | Implicit, not formalized |
| Layer 3: Command | SKILL.md mode dispatch sections | Mixed with session management, state checks, and guidelines |
| Layer 4: Just | N/A (plugin, not CLI) | Not applicable |

**Tradeoffs**:
- *Pro*: Separation makes each layer independently testable and evolvable
- *Pro*: Thin agents enable true parallelism without context duplication
- *Con*: More files to maintain (skills + agents + commands vs. skills-only)
- *Con*: Indirection — understanding the full flow requires reading 3 files instead of 1

**Source**: Direct analysis of Bowser source files (`justfile`, all agent `.md` files, all
command `.md` files, both skill SKILL.md files).

### Finding 2: Fan-Out Orchestration Pattern

**Context**: How Bowser distributes work across parallel agents and what protocol they follow.

**Analysis**: Bowser's `ui-review` command implements a clean 4-phase fan-out pattern:

```
Phase 1: DISCOVER
  Glob for YAML story files → parse each → build flat story list
  Handle: filename filtering, parse failures (skip with warning), empty results (stop)

Phase 2: SPAWN
  TeamCreate("ui-review")
  For each story: TaskCreate(subject=story.name, description=full workflow)
  For each story: Task(subagent_type="bowser-qa-agent", prompt=structured prompt)
  CRITICAL: All Task calls in a single message (parallel launch)

Phase 3: COLLECT
  Wait for teammate messages (delivered automatically on completion)
  Parse each report: extract PASS/FAIL, steps completed/total, full report text
  TaskUpdate(status="completed") for each finished task
  Handle: timeouts, crashes → mark FAIL with available output

Phase 4: CLEANUP & REPORT
  SendMessage(type="shutdown_request") to all teammates
  TeamDelete("ui-review")
  Aggregate: total/passed/failed, per-story table, failure details
```

**The communication protocol is simple and structured**:
- Orchestrator → Agent: A structured prompt with story name, URL, workflow steps, and
  screenshot path. Natural language, not JSON.
- Agent → Orchestrator: A structured report with a parseable `RESULT: {PASS|FAIL} | Steps:
  {X/Y}` summary line plus a markdown table. Enough structure to parse, enough prose to
  understand.

**Mapping to Clarity Loop parallelization needs**:

| Clarity Loop Mode | Current Approach | Fan-Out Opportunity |
|------------------|-----------------|-------------------|
| spec-mode (cl-implementer) | "Dispatch subagents in parallel, one per system doc" (prose instruction) | Formalize as Discover (read manifest) → Spawn (one reader-agent per doc) → Collect (summaries) → Aggregate (cross-references) |
| audit-mode (cl-reviewer) | "Dispatch subagents to check each pair of system docs" (prose instruction) | Formalize as Discover (enumerate doc pairs) → Spawn (one consistency-agent per pair) → Collect → Aggregate (health report) |
| verify-mode Part C (cl-reviewer) | "Dispatch subagents to check each pair" (prose instruction) | Same pattern as audit, scoped to post-merge docs |
| run-mode (cl-implementer) | Sequential task execution | Could fan out independent tasks (no dependency chain) to parallel implementation agents |
| mockups-mode (cl-designer) | Sequential screen generation | Could fan out independent screens to parallel design agents |

**Key pattern elements that Clarity Loop could adopt**:

1. **All agents launched in a single message**: Bowser is explicit about this — "Launch ALL
   teammates in a single message so they run in parallel." This is the difference between
   sequential and parallel execution in Claude Code's Task tool.

2. **Structured result parsing**: The `RESULT: {PASS|FAIL} | Steps: {X/Y}` format enables
   automated aggregation. Clarity Loop's subagent results are currently unstructured prose.

3. **Resilient collection**: "If a teammate times out or crashes, mark that story as FAIL
   and include whatever output was available." Clarity Loop's current prose-based subagent
   dispatch has no failure handling.

4. **Team lifecycle management**: TeamCreate → work → TeamDelete. Clean setup and teardown.
   Clarity Loop has no team concept currently.

**Tradeoffs**:
- *Pro*: True parallelism — N agents executing simultaneously vs. sequential context sharing
- *Pro*: Isolation — each agent has its own context, no cross-contamination
- *Pro*: Resilience — individual agent failures don't crash the whole operation
- *Con*: Requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` (experimental feature)
- *Con*: Higher total token cost (N parallel contexts vs. 1 shared context)
- *Con*: Aggregation complexity — collecting and synthesizing N independent reports

**Source**: Direct analysis of `ui-review.md` orchestration command, `bowser-qa-agent.md`
agent definition, and the fan-out/collect pattern.

### Finding 3: Browser Automation as UI Validation

**Context**: How Bowser's browser automation could provide design validation and visual
regression testing for cl-designer and cl-implementer.

**Analysis**: Bowser provides three relevant capabilities:

**1. Playwright CLI Skill** (`playwright-bowser`):
- Token-efficient: CLI-based, no accessibility trees or tool schemas in context
- Named sessions (`-s=<name>`): Enables parallel browser instances with isolated state
- Persistent profiles: Cookies and localStorage preserved between calls
- Vision mode (opt-in): Screenshots returned as image responses for richer validation
- Full command set: navigate, click, fill, screenshot, console errors, network interception

**2. YAML Story Format**:
```yaml
stories:
  - name: "Front page loads with posts"
    url: "https://news.ycombinator.com/"
    workflow: |
      Navigate to https://news.ycombinator.com/
      Verify the front page loads successfully
      Verify at least 10 posts are visible, each with a title and a link
```
- Declarative: stories defined as data, not code
- Auto-discoverable: glob pattern finds all YAML files in a directory
- Natural language workflows: agents interpret steps, not execute scripts
- Extensible: any assertion format works (BDD, imperative, checklist)

**3. QA Agent** (`bowser-qa-agent`):
- Structured reporting: per-step PASS/FAIL table with screenshots
- Console error capture on failure
- Fail-fast with SKIPPED for remaining steps
- Screenshot at every step (audit trail)

**Mapping to Clarity Loop**:

For **cl-designer**:
- After generating mockups (.pen files), a browser-based validation agent could render them
  and verify: layout integrity, component rendering, responsive breakpoints, accessibility
  (color contrast, focus order)
- The YAML story format maps naturally to design acceptance criteria: "Verify the navigation
  bar has 5 items", "Verify the hero section is above the fold at 1440px"
- This closes the feedback loop: design → render → validate → fix

For **cl-implementer**:
- After implementation, visual regression testing against design specs
- YAML stories generated from TEST_SPEC.md UI test cases
- Screenshot comparison between design mockups and implemented screens
- This provides the "verify" step that currently only checks code, not visual output

**The key architectural insight**: Bowser's browser skill is a *capability* (Layer 1) that
gets wrapped in *agents* (Layer 2) and orchestrated by *commands* (Layer 3). For Clarity Loop,
browser automation wouldn't be a new skill — it would be a new capability that existing skills
(cl-designer, cl-implementer) could invoke through their orchestration layer.

**Tradeoffs**:
- *Pro*: Closes the design validation gap — currently the biggest feedback loop missing
- *Pro*: YAML stories are user-editable and reviewable (not opaque test code)
- *Pro*: Screenshots provide visual evidence for design reviews
- *Con*: Requires Playwright CLI installation (dependency)
- *Con*: Browser tests are inherently slower and flakier than unit tests
- *Con*: Vision mode is expensive (screenshots as images in context = high token cost)
- *Con*: .pen files (Pencil MCP) may not be directly renderable in a browser — need a
  rendering/export step

**Source**: Direct analysis of `playwright-bowser/SKILL.md`, `bowser-qa-agent.md`,
`ui-review.md`, and `hackernews.yaml` story format.

### Finding 4: Natural Guided Automation Execution

**Context**: How Bowser's layered architecture provides a more natural separation of guidance
from execution, and what this means for Clarity Loop's execution model.

**Analysis**: The current Clarity Loop execution model is **single-context monolithic**:

```
User triggers mode → SKILL.md loads → reference file loads → agent does EVERYTHING:
  - Reads all inputs
  - Plans the work
  - Executes each step sequentially
  - Handles errors
  - Produces output
  - Updates tracking files
```

This means one agent is simultaneously the planner, executor, error handler, and reporter.
As modes get more complex (audit-mode reads ALL system docs, cross-references every pair,
runs 7 dimensions of analysis, performs external research), the single context becomes the
bottleneck — both in tokens and in cognitive load on the model.

Bowser's model is **layered delegation**:

```
Command layer (guidance):          Agent layer (execution):
  - Discovers work items            - Receives a focused prompt
  - Plans distribution              - Executes one specific task
  - Spawns parallel agents     →    - Reports structured result
  - Collects results            ←   - Handles its own errors
  - Aggregates and reports          - Has no awareness of siblings
```

The command doesn't execute. The agents don't plan. Each layer does one thing well.

**This maps directly to the Guided Autonomy concept**:

| Guided Autonomy Concept | Current Implementation | Bowser-Informed Alternative |
|------------------------|----------------------|---------------------------|
| Guidance | Inline prose in SKILL.md ("dispatch subagents to...") | Formal command layer that discovers, plans, distributes |
| Execution | Same agent that provides guidance | Dedicated execution agents with focused prompts |
| Coordination | N/A (single context) | Team lifecycle: create → distribute → collect → cleanup |
| Progress tracking | Agent writes to TASKS.md directly | Agents report to orchestrator; orchestrator updates tracking |
| Error handling | Agent handles its own errors in the same context | Agents report failures; orchestrator decides recovery strategy |

**Concrete example — audit mode today vs. with Bowser patterns**:

Today:
```
cl-reviewer audit →
  Read ALL system docs (fills context)
  For each dimension: analyze (more context)
  For each doc pair: check consistency (even more context)
  External research (web searches, more context)
  Produce report (context near limit)
```

With layered delegation:
```
cl-reviewer audit (command layer) →
  Read manifest (light read)
  Plan: 7 dimensions × docs = work items
  Spawn: consistency-agent per doc pair, dimension-agent per dimension
  Collect: structured findings from each
  Aggregate: produce unified report
  (Main context stays light — heavy reads happen in agent contexts)
```

**The key behavioral difference**: In the current model, the agent must hold ALL system docs
in context simultaneously to cross-reference them. In the delegated model, each consistency
agent holds only its assigned doc pair — dramatically reducing per-agent context pressure
while achieving better parallelism.

**Tradeoffs**:
- *Pro*: Main context stays lightweight — it coordinates, doesn't execute
- *Pro*: Each agent has a focused, manageable scope
- *Pro*: Natural parallelism — launch all agents in one message
- *Pro*: Better error isolation — one agent's failure doesn't corrupt the others
- *Con*: Cross-agent coordination is hard (agent A's finding might affect agent B's analysis)
- *Con*: Information that spans multiple agents requires the command layer to synthesize
- *Con*: More total tokens (N agent contexts vs. 1 shared context)
- *Con*: Requires Claude Code teams feature (experimental)

**Source**: Comparative analysis of Bowser's ui-review.md orchestration pattern vs. Clarity
Loop's cl-reviewer/references/audit-mode.md and verify-mode.md execution patterns.

### Finding 5: Keyword-Based Configuration and Declarative Workflows

**Context**: How Bowser handles configuration and workflow definition in a user-friendly way.

**Analysis**: Bowser uses two patterns that improve developer experience:

**1. Keyword detection for configuration** (from `hop-automate.md`):
```
Parse $ARGUMENTS to extract:
- SKILL: keyword detection — `playwright-bowser` (default) or `claude-bowser`
- MODE: keyword detection — `headed` (default) or `headless`
- VISION: keyword detection — `false` (default), `true` if `vision` keyword present
- PROMPT: all remaining non-keyword text
```

Arguments are natural language with embedded keywords: `hop amazon-add-to-cart "notebooks"
playwright headed vision`. No flags, no `--key=value` syntax. Keywords are detected
case-insensitively and extracted; everything else is treated as the prompt.

**2. YAML-driven declarative workflows** (from `ai_review/user_stories/`):
Stories are data files auto-discovered by the orchestrator via glob patterns. Adding a new
test is: create a YAML file, write natural language steps, done. No code, no registration,
no configuration.

**Mapping to Clarity Loop**:

Clarity Loop already uses keyword-based mode detection in SKILL.md argument-hint fields
(e.g., `[spec|spec-review|start|run|autopilot|verify|status|sync]`). But within modes,
configuration is implicit — there's no equivalent of Bowser's per-mode defaults with
user overrides.

The YAML story pattern maps to potential use cases:
- **Design validation stories**: YAML files defining what each screen should contain
- **Implementation verification stories**: YAML files defining acceptance criteria per feature
- **Audit checklists**: YAML files defining consistency checks per doc pair

**Tradeoffs**:
- *Pro*: YAML stories are human-readable, versionable, reviewable
- *Pro*: Auto-discovery (glob) means no registration step
- *Pro*: Natural language workflows reduce the barrier to writing tests
- *Con*: YAML is fragile (indentation-sensitive, no IDE support for workflow validation)
- *Con*: Natural language workflows rely on agent interpretation (non-deterministic)

**Source**: Direct analysis of `hop-automate.md` argument parsing and `hackernews.yaml`
story format.

### Finding 6: Internal File Structure Conventions

**Context**: Beyond the 4-layer separation, Bowser's files follow a consistent internal
template within each layer. This structural convention makes files predictable, parseable,
and easier for agents to follow reliably.

**Analysis**: Every Bowser file follows a layer-specific template:

**Frontmatter conventions by layer:**

| Field | Skills | Agents | Commands |
|-------|--------|--------|----------|
| `name` | Required | Required | Not used |
| `description` | Required (keyword-rich) | Required (keyword-rich) | Required |
| `model` | Not used | Optional (e.g., `opus`) | Optional |
| `color` | Not used | Optional (UI hint) | Not used |
| `skills` | Not used | Required (array of skill dependencies) | Not used |
| `allowed-tools` | Optional (constraint) | Not used | Not used |
| `argument-hint` | Not used | Not used | Required |

**Section ordering by layer:**

Skills:
```
## Purpose
## Key Details (bullet list of capabilities)
## Sessions / Setup (configuration)
## Quick Reference (CLI cheat sheet — optional)
## Workflow (numbered steps with code blocks)
## Configuration (optional)
## Full Help (reference link)
```

Agents (thin — ~20 lines):
```
## Purpose ("You are a [role].")
## Workflow (2 steps: execute skill, report results)
```

Agents (rich — orchestrators):
```
## Purpose ("You are a [role].")
## Variables (all inputs with types, defaults, parsing rules)
## Workflow (phased: Parse → Setup → Execute → Close → Return)
## Report (exact format with ### On success / ### On failure variants)
## Examples (multiple input formats accepted)
```

Commands (orchestrator):
```
## Purpose
## Variables (all inputs with defaults and keyword detection rules)
## Codebase Structure (ASCII directory tree showing expected layout)
## Instructions (bullet list of key rules and constraints)
## Workflow (### Phase N: Name, with global step numbering across phases)
## Report (exact aggregation template)
```

**Six conventions that differ from Clarity Loop's current approach:**

| Convention | Bowser | Clarity Loop |
|-----------|--------|-------------|
| **Variables upfront** | Explicit `## Variables` section declares ALL inputs, defaults, parsing rules at the top | Variables are implicit, scattered throughout prose paragraphs |
| **Phased workflows** | `### Phase N: Name` with globally numbered steps (1-8 in Phase 1, 9-12 in Phase 2...) | `### Step N:` headings with unnumbered prose underneath |
| **Report templates** | Exact output format with `### On success` / `### On failure` variants and parseable summary lines (`RESULT: PASS\|FAIL`) | Markdown template in a fenced code block (suggested structure, not enforced format) |
| **Error handling** | Explicit "On FAIL" blocks in workflow: "capture console errors, stop execution, mark remaining SKIPPED" | Prose paragraphs in separate Error Handling section |
| **Cross-references** | Frontmatter `skills:` array — machine-parseable dependency declaration | Inline prose: "read `references/verify-mode.md`" — requires text parsing |
| **Verified checkpoints** | Explicit "Verify X" steps after every action in workflows | Implicit — verification is part of the prose description |

**Why this matters for Clarity Loop**: The current reference files (e.g., `review-mode.md`,
`spec-mode.md`) are well-written prose, but prose is ambiguous. When an agent reads "Dispatch
subagents to check each pair of system docs for contradictory statements," it must interpret:
- How many subagents?
- What prompt to give each?
- What result format to expect?
- What to do if one fails?

Bowser answers all of these explicitly in the file structure:
- Variables section: how many (computed from input)
- Workflow phase: exact prompt template with `{variable}` substitution
- Report section: exact result format with parseable summary line
- Instructions section: "Be resilient: if a teammate times out, mark as FAIL"

**Mapping to Clarity Loop**: Adopting this convention would mean:

1. **Add frontmatter to reference files** — Currently only SKILL.md has frontmatter. Adding
   it to reference files enables machine-readable metadata (dependencies, expected inputs).

2. **Add Variables sections** — Each reference file that takes input (mode arguments, file
   paths, configuration) would declare them upfront instead of extracting them from prose.

3. **Convert Step prose to phased numbered workflows** — Instead of "### Step 3: Analyze
   Across Seven Dimensions" followed by paragraphs, use numbered steps with explicit actions:
   "3.1. Read system doc manifest. 3.2. For each dimension, evaluate..."

4. **Add Report sections with exact templates** — Instead of "Use this structure:" followed
   by a code block, define the exact output contract with success/failure variants and
   parseable summary lines.

5. **Add explicit verification checkpoints** — After each major workflow step, add "Verify:
   [what should be true]" to catch failures early.

6. **Add explicit error/resilience rules** — Instead of a separate Error Handling section
   with prose, embed "On failure:" blocks directly in workflow steps.

**Tradeoffs**:
- *Pro*: More predictable agent behavior — less interpretation needed
- *Pro*: Machine-parseable metadata enables tooling (dependency graphs, validation)
- *Pro*: Structured reports enable automated aggregation in fan-out scenarios
- *Pro*: Consistent template across all files reduces cognitive load for maintainers
- *Con*: Significant migration effort — 34 reference files + 4 SKILL.md files to restructure
- *Con*: Structured format is less flexible than prose for nuanced instructions
- *Con*: Risk of over-structuring — some modes genuinely need prose explanation for complex
  judgment calls that don't reduce to numbered steps
- *Con*: Frontmatter on reference files is non-standard for Claude Code (SKILL.md frontmatter
  is a Claude Code convention; reference file frontmatter would be a Clarity Loop addition)

**Source**: Structural analysis of all 12 Bowser prompt files (3 skills, 3 agents, 6
commands) comparing internal section patterns, frontmatter conventions, workflow formats,
and error handling approaches.

### Finding 7: Operational Design Patterns

**Context**: Beyond architecture and file structure, Bowser embeds several operational
patterns that affect reliability, cost, developer experience, and maintainability.

**Analysis**: A deep sweep of all Bowser project files revealed seven operational patterns
that Clarity Loop doesn't currently employ:

**1. Directory-as-API (Convention over Configuration)**

Bowser treats directories as discoverable APIs:
- Drop a `.yaml` file in `ai_review/user_stories/` → auto-discovered on next `ui-review` run
- Drop a `.md` file in `.claude/commands/bowser/` → auto-available via `hop-automate`
- No registration step. No config file to update. Glob discovers what exists.

Clarity Loop currently requires explicit references between files. Adding a new mode means
modifying SKILL.md's mode detection section AND creating the reference file. If a reference
file could be auto-discovered by naming convention (e.g., `references/{mode-name}-mode.md`),
SKILL.md wouldn't need updating for every new mode.

**2. Layer-Independent Testability**

Each Bowser layer is independently invocable:
- Layer 1: `/playwright-bowser (headed: true) Navigate to https://example.com`
- Layer 2: `Use a @bowser-qa-agent: Verify the homepage loads`
- Layer 3: `/ui-review headed hackernews`
- Layer 4: `just ui-review`

You can enter at any layer for testing or production. Clarity Loop has no equivalent — you
always invoke the full SKILL.md, which loads session management, state checks, and mode
dispatch before reaching the actual mode instructions. There's no way to test a reference
file (e.g., `verify-mode.md`) in isolation.

**3. Token Efficiency as Explicit Design Constraint**

Bowser made Playwright CLI the default choice specifically because:
- CLI-based: no accessibility trees or tool schemas loaded into context
- Screenshots save to disk by default, not embedded in context
- Named sessions reduce context churn (session name persists, state accumulates)
- Vision mode (screenshots in context) is opt-in because it's expensive

Clarity Loop's heavy-read modes (audit reads ALL system docs, spec-mode reads all system
docs in parallel) have no token-aware design. No mode explicitly manages its context budget
or offers "light" vs "thorough" tiers based on token cost.

**4. Graceful Degradation at Every Layer**

Bowser handles failures at each orchestration boundary:
- YAML parse failure → log warning, skip file, continue with others
- Agent timeout → mark story as FAIL, include whatever partial output was available
- Step failure → capture JS console errors, SKIPPED remaining steps, return detailed report
- No stories found → report and stop (don't crash or hang)

Each failure is classified (skip, partial, stop) rather than a uniform "crash and report."
Clarity Loop's error handling exists but is described in prose paragraphs, not structured
into the workflow as explicit checkpoints.

**5. Auto-Generated Documentation**

Bowser's `TOOLS.md` is generated by the `/list-tools` command, which reads the system
prompt, extracts all available tools, and formats them as TypeScript function prototypes.
This means the tool catalog is always current.

Clarity Loop's `.manifest.md` (auto-generated by the PostToolUse hook) is the closest
equivalent, but it indexes system docs, not pipeline capabilities. There's no
auto-generated catalog of available modes, their inputs, and their outputs.

**6. Specification as Archived Design Artifact**

`specs/init-automation.md` is a design spec that was used to build the `hop-automate`
command. It includes design principles, frontmatter conventions, implementation checklists,
and test scenarios. After implementation, it became an archived artifact — not deleted, but
not actively maintained.

This maps to Clarity Loop's own research → proposal → implementation pipeline, but Bowser
does it lightweight: one spec file per feature, not a multi-stage review process. This
suggests that for smaller, self-contained features (like a new command), a lighter-weight
design process might be appropriate.

**7. CLAUDE.md as Ephemeral Scaffolding**

Bowser gitignores CLAUDE.md. It's local developer guidance (how to test each layer, which
flags to use), not canonical documentation. The skills, agents, and commands ARE the
documentation — they're self-describing via their structured sections.

This is the opposite of Clarity Loop, where CLAUDE.md is the canonical project-level
config committed to git. But Bowser's approach suggests an interesting question: if the
skills themselves are structured enough (via Finding 6's conventions), does CLAUDE.md need
to describe how to use them, or can it focus purely on project-level configuration?

**Tradeoffs**:
- *Pro*: Each pattern independently improves reliability, DX, or maintainability
- *Pro*: Most patterns are low-cost to adopt (conventions, not infrastructure)
- *Con*: "Directory-as-API" requires rethinking mode registration in SKILL.md
- *Con*: Token-aware design adds complexity to mode instructions
- *Con*: Auto-generated docs require build/generation scripts to maintain

**Source**: Complete file sweep of Bowser project including CLAUDE.md, .gitignore,
.env.sample, settings.json, specs/, TOOLS.md, README.md, and all prompt files.

## Options Analysis

The research identified three adoption strategies:

| Criterion | Option A: Pattern Adoption | Option B: Full Restructure | Option C: Selective Integration |
|-----------|--------------------------|--------------------------|-------------------------------|
| **Scope** | Add formal agent/command layers alongside existing structure | Restructure all 4 skills into Bowser's 4-layer model | Cherry-pick fan-out for 2-3 modes + add browser automation |
| **File structure convention** | Adopt for new files + incrementally for existing | Full rewrite of all files to new template | Adopt for new files only |
| **Migration effort** | Medium — new files, existing files get delegation hooks | Very High — rewrite 34 reference files, 4 SKILL.md files | Low — 5-8 new files, minimal changes to existing |
| **Risk** | Medium — new pattern must coexist with existing | High — everything changes at once | Low — additive changes only |
| **Parallelism gains** | High — all identified modes get fan-out | High — universal fan-out | Medium — only selected modes |
| **Browser automation** | Yes — as a new skill/agent pair | Yes — as part of restructure | Yes — as standalone addition |
| **Compatibility with Guided Autonomy proposal** | High — extends it with execution layer | Conflicts — different file structure | High — complementary additions |
| **Time to first value** | Medium — agent definitions needed before fan-out works | Long — full restructure before any value | Short — can ship browser automation while planning fan-out |
| **Claude Code teams dependency** | Required for fan-out modes | Required for everything | Required only for fan-out modes; browser works without |

## Recommendations

### Primary Recommendation: Option C (Selective Integration) with Roadmap to Option A

Start with selective integration to deliver value quickly, then expand to full pattern adoption
as the patterns prove themselves. Specifically:

**Phase 0: File Structure Convention** (cross-cutting, incremental)
- Define a Clarity Loop file template convention inspired by Bowser's patterns: frontmatter,
  Variables section, phased Workflow, Report templates, verification checkpoints
- Apply to ALL new files created in Phases 1-3 (new skills, agents, commands)
- Incrementally retrofit existing reference files as they're touched by other changes —
  don't rewrite all 34 files at once, but when a file is modified for any reason, bring it
  into conformance
- Define a "Clarity Loop Reference File Template" document that codifies the convention
- Deliverable: Consistent, predictable file structure across new and incrementally updated files

**Phase 1: Browser Automation Capability** (net new, no restructuring)
- Add a browser automation skill (Playwright CLI based, following Bowser's token-efficient
  pattern)
- Add a QA validation agent (thin wrapper, Bowser's bowser-qa-agent pattern)
- Integrate into cl-designer: post-mockup validation with YAML-defined acceptance criteria
- Integrate into cl-implementer: post-implementation visual regression testing
- Deliverable: Design validation feedback loop closed

**Phase 2: Formalize Fan-Out for Heavy Modes** (evolutionary, targeted)
- Add formal agent definitions for the 3-4 modes that already mention subagent dispatch:
  spec-mode parallel readers, audit-mode consistency checkers, verify-mode cross-doc
  validators
- Add orchestration logic to those modes: discover → spawn → collect → aggregate
- Define structured result formats for agent → orchestrator communication
- Deliverable: Heavy modes run in parallel with resilient error handling

**Phase 3: Command Layer Separation** (evolutionary, architectural)
- For modes that have grown complex enough, separate the orchestration logic from the
  capability instructions
- This naturally emerges from Phase 2 — as orchestration gets formalized, it separates
  from the reference files
- Evaluate whether SKILL.md mode dispatch should become a formal command layer
- Deliverable: Clean guidance/execution separation for complex modes

**Why this order**: Phase 1 delivers visible value (screenshots! validation!) without any
architectural risk. Phase 2 formalizes what's already implied in the documentation. Phase 3
is the architectural evolution that only makes sense after Phases 1 and 2 prove the patterns.

### Relationship to Guided Autonomy Proposal

This research **complements** the Guided Autonomy proposal rather than replacing it:

| Guided Autonomy Concern | This Research Adds |
|------------------------|-------------------|
| Intent detection (Ship/Quality/Rigor) | Fan-out depth could be calibrated by intent (Ship = less parallel verification, Rigor = full fan-out) |
| Session start orientation | Orchestration layer could produce richer orientation by parallelizing source file reads |
| Transition advisory | Advisory could include fan-out readiness check (are agents available? teams enabled?) |
| Parking protocol | No interaction — orthogonal concerns |
| File rationalization | No conflict — fan-out operates on whatever file structure exists |

The Guided Autonomy proposal should proceed as-is. This research adds an execution dimension
that Guided Autonomy doesn't address.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Claude Code teams feature remains experimental or breaks | Medium | High — fan-out depends on it | Phase 1 (browser) works without teams; Phase 2 degrades to sequential if teams unavailable |
| Parallel agent contexts exceed token budget for complex modes | Medium | Medium — cost increase | Start with 2-3 agent fan-out, measure token usage, calibrate |
| Agent result aggregation loses nuance (individual findings compressed into summary) | Medium | Medium — quality reduction in reports | Define structured result formats that preserve key findings; orchestrator synthesizes, doesn't summarize |
| Browser automation adds flakiness to the pipeline | High | Low — advisory only, never blocking | All browser validation is advisory; failures suggest issues, don't block pipeline progress |
| .pen files (Pencil MCP) can't be rendered in a browser | Medium | Medium — limits designer validation | Research Pencil export capabilities; use markdown fallback path as initial target |
| Restructuring conflicts with in-flight proposals | Low | Medium — merge conflicts | Phase 1 is additive (no existing file changes); Phase 2-3 sequence after Guided Autonomy merges |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| SYSTEM_DESIGN.md | New section on fan-out orchestration pattern; browser automation capability; agent layer architecture |
| docs/cl-designer.md | New validation mode using browser automation; YAML acceptance criteria format |
| docs/cl-implementer.md | Visual regression testing integration; formalized parallel agent dispatch for spec-mode |
| docs/cl-reviewer.md | Formalized parallel agent dispatch for audit-mode and verify-mode |
| docs/pipeline-concepts.md | Fan-out orchestration as a pipeline concept; guidance/execution separation |
| (new) Browser automation skill | New SKILL.md + reference files for Playwright CLI capability |
| (new) Agent definitions | Formal agent .md files for existing implicit subagent roles |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Research scope | Bowser-only vs. broader industry patterns | Bowser-focused with industry references | Bowser provides concrete, working implementation rather than theoretical patterns |
| 2 | Adoption strategy | Full restructure vs. selective integration | Selective integration with roadmap | Risk-managed approach; deliver value early, expand later |
| 3 | Browser tool | Playwright CLI vs. Chrome MCP | Recommend Playwright CLI | Token-efficient, supports parallel sessions (critical for fan-out), headless by default |
| 4 | Guided Autonomy relationship | Replace vs. complement | Complement | GA proposal addresses different concerns (intent, orientation); this adds execution layer |
| 5 | Justfile layer applicability | Adopt vs. skip | Skip for Clarity Loop | CL is a plugin, not a CLI tool; entry point is Claude Code skill invocation, not shell commands |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| YAML-driven acceptance criteria | Design and implementation verification defined as declarative, human-readable stories — auto-discovered, versionable, reviewable | Scope into Phase 1 of this research's recommendation; define YAML schema for design acceptance criteria |
| Structured agent result protocol | Standardized format for agents to report results back to orchestrators — enables automated aggregation and failure detection | Scope into Phase 2; define protocol before implementing fan-out |
| Intent-calibrated fan-out depth | Ship intent → minimal parallel verification; Rigor intent → full fan-out with N consistency agents | Could extend the Guided Autonomy proposal's intent system |
| Design-to-code visual regression | Screenshot comparison between design mockups and implemented UI — closes the design → implementation → verify loop | Scope into Phase 1 browser automation; depends on .pen file export or markdown fallback rendering |
| Reference file template convention | Standardized internal structure (frontmatter, Variables, phased Workflow, Report templates) across all skill/reference files — reduces agent interpretation variance and enables machine-parseable metadata | Phase 0 of recommendation; define template, apply to new files, retrofit incrementally |
| Directory-as-API for mode discovery | Modes auto-discovered by naming convention (e.g., `references/{mode}-mode.md`) instead of explicit SKILL.md registration — reduces friction when adding modes | Evaluate feasibility; may conflict with SKILL.md's role as mode documentation |
| Token-aware mode design | Modes explicitly manage context budget with "light" vs "thorough" tiers — prevents context exhaustion in heavy modes like audit | Could integrate with Guided Autonomy's intent system (Ship=light, Rigor=thorough) |
| Auto-generated pipeline capability catalog | A `/list-modes` equivalent that generates a catalog of all available modes, their inputs, outputs, and dependencies | Low-priority tooling improvement; could be a script like generate-manifest.js |

## Open Questions

1. **Pencil MCP export**: Can .pen files be exported to HTML/images for browser-based
   validation? If not, browser validation is limited to the markdown fallback path for
   cl-designer. This needs investigation before Phase 1 design validation can be scoped.

2. **Claude Code teams stability**: What's the maturity and roadmap for the agent teams
   feature? Is it stable enough for production use in Phases 2-3, or should fan-out be
   designed with a fallback to sequential execution?

3. **Token cost of fan-out**: How much more expensive is 5 parallel agent contexts vs. 1
   serial context doing the same work? The answer affects whether fan-out should be
   opt-in (Rigor intent) or default.

4. **Cross-agent dependency in audit mode**: Audit dimension analysis is partially
   interdependent (a finding in technical correctness might affect completeness scoring).
   Can the orchestrator synthesize cross-cutting findings, or do some dimensions need to
   run sequentially?

5. **YAML story schema**: Should Clarity Loop adopt Bowser's simple schema (name, url,
   workflow) or define a richer schema (with expected outcomes, screenshots, accessibility
   checks)? This affects Phase 1 scope.

6. **File structure convention scope**: How far should the template convention go? Bowser's
   structured approach works for its focused domain (browser automation), but Clarity Loop's
   reference files contain nuanced judgment instructions (e.g., "assess whether the
   complexity is justified by the value"). Should the convention have a "structured" tier
   (for procedural modes like merge, verify) and a "guided prose" tier (for judgment modes
   like review, audit)? Or one template for all?

7. **Directory-as-API for modes**: Could SKILL.md's mode detection be replaced by
   auto-discovery (glob `references/*-mode.md`)? This would mean adding a mode is just
   creating a file — no SKILL.md edit. But SKILL.md currently serves as both mode router
   AND mode documentation (description, when-to-trigger). How would auto-discovery preserve
   the documentation role?

8. **Token budgeting**: Should heavy modes (audit, spec-generation) have explicit token
   budgets that trigger different strategies (fan-out vs. sequential, summarize vs. full
   read)? What's the right mechanism — a Variables declaration at the top of the mode, or
   a pipeline-wide configuration?

## References

- Bowser project source code: `/Users/bhushan/Documents/bowser/`
  - `.claude/commands/ui-review.md` — Fan-out orchestration pattern
  - `.claude/agents/bowser-qa-agent.md` — QA validation agent
  - `.claude/skills/playwright-bowser/SKILL.md` — Browser automation skill
  - `.claude/commands/bowser/hop-automate.md` — Keyword-based workflow routing
  - `.claude/agents/playwright-bowser-agent.md` — Thin agent wrapper pattern
  - `justfile` — 4-layer abstraction with labeled sections
  - `ai_review/user_stories/hackernews.yaml` — YAML story format
- Clarity Loop system docs: `/Users/bhushan/Documents/Clarity_Loop/clarity-loop/`
  - `docs/SYSTEM_DESIGN.md` — Architecture reference
  - `skills/cl-*/SKILL.md` — All 4 skill definitions
  - `skills/cl-*/references/*.md` — All 34 reference files
- Related in-flight proposal: `docs/proposals/GUIDED_AUTONOMY_EXECUTION_MODEL.md`
