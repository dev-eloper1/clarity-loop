# Research: Reference File Template Convention for Clarity Loop

**ID**: R-003
**Created**: 2026-02-16
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Evolutionary
- **Status**: draft
- **Open Questions**: 4 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Evolutionary

This research evolves the internal structure of Clarity Loop's existing prompt files (SKILL.md
files and reference files). No new capabilities are introduced -- this is about standardizing
the internal format of the ~38 files that already exist (4 SKILL.md + 34 references) and
defining the template for all future files.

### Related System Docs

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| SYSTEM_DESIGN.md | S1 Architecture Overview (Plugin Structure) | Defines the 4-skill + references architecture that the template must fit within |
| SYSTEM_DESIGN.md | S3-6 Per-skill Architecture | Defines mode dispatch, reference loading, and subagent patterns -- the template must preserve how SKILL.md loads references |
| SYSTEM_DESIGN.md | S7 State Management | Defines pipeline state flow between skills -- reference file Variables sections must align with state contracts |
| SYSTEM_DESIGN.md | S12 Spec Generation Pipeline | Mentions parallel subagent dispatch -- structured reports from this research would improve spec-mode output aggregation |
| SYSTEM_DESIGN.md | S14 Verification and Audit Systems | Audit mode dispatches parallel subagents -- structured reports needed for aggregation |
| docs/pipeline-concepts.md | Full document | Defines pipeline concepts (modes, reference files, state files) that the template convention must respect |

### Current State

Clarity Loop is a Claude Code plugin with 4 skills (cl-researcher, cl-reviewer, cl-designer,
cl-implementer), ~28 modes across those skills, and ~34 reference files containing mode
instructions. The current reference files use **unstructured prose** as their primary
organizational pattern:

- **No frontmatter**: Only SKILL.md files have YAML frontmatter (name, description,
  argument-hint). Reference files begin with a markdown heading and dive directly into prose.
- **No Variables section**: Inputs (file paths, mode arguments, state from tracking files)
  are mentioned inline throughout the prose. An agent must read the entire file to understand
  what inputs a mode needs.
- **Inconsistent step structure**: Some files use `### Step N:` headings (review-mode,
  spec-mode, verify-mode, merge-mode), others use `### Phase N:` (setup-mode), and some
  use a flat bullet-list structure (bootstrap-guide). Step numbering is top-level only --
  no sub-step numbering (3.1, 3.2) within steps.
- **Suggested output formats**: Several modes include markdown code blocks showing the
  output template (audit report, review file, verify file, TASKS.md), but these are
  "suggested structures" embedded in prose, not enforced contracts with success/failure
  variants.
- **Error handling as prose sections**: Where error handling exists (merge-mode's "Error
  Handling" section, audit's "Guidelines for Audit Mode"), it appears as a separate prose
  section at the end of the file rather than inline with the workflow step where the error
  can occur.
- **No verification checkpoints**: Workflow steps describe what to do but rarely include
  explicit "Verify: [condition]" steps between actions.

### Why This Research

R-002 (Bowser Architecture Patterns) identified in Finding 6 that Bowser uses a consistent
internal file structure convention across all prompt files -- YAML frontmatter, explicit
Variables sections, phased numbered workflows, exact report templates with success/failure
variants, and verified checkpoints. R-002's primary recommendation (Option C with roadmap to
A) designated this convention work as "Phase 0" -- the cross-cutting foundation that all
subsequent phases depend on.

This is research R-003 because every subsequent research (R-004 through R-008+) will produce
new files that follow whatever convention this research establishes. Getting the template
right is the single highest-leverage standardization effort in the pipeline.

Three specific problems motivate this:

1. **Agent behavior variance**: When an agent reads "Dispatch subagents to check each pair
   of system docs for contradictory statements" (audit-mode), it must interpret how many
   subagents, what prompt format, what result format, and what to do on failure. Different
   sessions interpret this differently, producing inconsistent outputs.

2. **Onboarding friction**: A new contributor (or a fresh Claude session with no conversation
   history) must read an entire reference file to understand what inputs it expects, what it
   produces, and how errors are handled. There is no quick-scan structure.

3. **Fan-out readiness**: R-002 identified fan-out orchestration as a future capability
   (Phases 2-3). Fan-out requires structured result formats for automated aggregation. The
   current prose-based output formats cannot be reliably parsed by an orchestrator.

## Scope

### In Scope

- Define a standard internal structure template for Clarity Loop reference files
- Analyze whether one template fits all modes or whether two tiers are needed (structured
  vs. guided)
- Design the specific sections, their order, purpose, and content expectations
- Design a frontmatter convention for reference files
- Design a Variables convention for declaring inputs
- Design a Workflow convention for step structure
- Design a Report convention for output format specification
- Design an Error handling convention (inline vs. separate)
- Provide before/after examples using real Clarity Loop reference files
- Provide a prioritized retrofit plan for the 34 existing reference files
- Provide the literal template files that new reference files would copy

### Out of Scope

- Restructuring SKILL.md files into a command/agent/skill layer separation (that is R-002
  Phase 3, a separate research cycle)
- Implementing fan-out orchestration (R-002 Phase 2)
- Adding browser automation capabilities (R-002 Phase 1)
- Changing the mode dispatch mechanism in SKILL.md
- Creating new modes or skills
- Modifying the hook system or init scripts

### Constraints

- The template must work within Claude Code's native skill/reference file convention --
  SKILL.md files have Claude Code-defined frontmatter; reference files are loaded via `Read`
  tool invocations
- Reference file frontmatter is a Clarity Loop addition, not a Claude Code convention --
  the agent must be instructed to parse it (this is already done for SKILL.md by Claude Code
  itself, but reference files are just markdown files read by the agent)
- The existing ~34 reference files total ~10,498 lines -- migration must be incremental,
  not a big-bang rewrite
- The template must preserve the existing warmth gradient (bootstrap and research modes are
  conversational; implementation and verification modes are mechanical)
- Template structure must not increase token cost significantly -- a 50-line Variables
  section that repeats information already in the workflow prose would be counterproductive

## Research Findings

### Finding 1: Current Structural Patterns Across All Reference Files

**Context**: Before designing a template, we need to understand what structural patterns
currently exist across all 34 reference files and 4 SKILL.md files.

**Analysis**: A systematic read of all files reveals five distinct structural patterns
currently in use:

**Pattern A: Step-Based Procedural** (13 files)
Used by: review-mode, re-review-mode, verify-mode, merge-mode, spec-mode, start-mode,
spec-consistency-check, correction-mode, fix-mode, sync-mode, design-review-mode,
build-plan-mode, context-mode

Structure:
```
## [Mode Name]
[1-3 paragraphs of context]
### When to Use / Prerequisites
### Step 1: [Action]
### Step 2: [Action]
...
### Step N: [Action]
### Error Handling (sometimes)
### Guidelines (sometimes)
```

Characteristics: Clear sequential flow, well-defined step boundaries, output templates
embedded as code blocks within the final step. Steps use top-level numbering only. Sub-steps
are described in prose or numbered lists within a step.

**Pattern B: Phase-Based Conversational** (3 files)
Used by: bootstrap-guide, setup-mode, research-template

Structure:
```
## [Mode Name]
[Context paragraphs]
### Phase 1: [Name]
#### Step 1: [Action]
#### Step 2: [Action]
### Phase 2: [Name]
...
```

Characteristics: Multi-phase with named phases, conversational in nature (questions to ask
the user, discovery loops), deeper heading nesting. Bootstrap-guide is the most complex file
at ~945 lines with multiple conditional paths (greenfield, brownfield-docs, brownfield-code).

**Pattern C: Template/Specification** (4 files)
Used by: proposal-template, research-template, document-plan-template, cross-cutting-specs

Structure:
```
## Process
### Step 1: [Action]
...
## Template
```markdown
[Exact output template in a fenced code block]
```
## Key Principles
```

Characteristics: The file serves dual purpose -- process instructions AND output template.
The template section is the primary artifact; the process section instructs how to fill it.

**Pattern D: Rules/Checklist** (5 files)
Used by: visual-quality-rules, governance-checks, operational-specs, behavioral-walkthrough,
design-checklist

Structure:
```
## [Topic]
### [Rule Category 1]
- Rule 1
- Rule 2
### [Rule Category 2]
...
### When to Apply (table)
```

Characteristics: Non-sequential -- these are reference documents consulted during other
modes, not standalone workflows. They define constraints rather than steps.

**Pattern E: Run/Operational Mode** (4 files)
Used by: run-mode, autopilot-mode, tokens-mode, mockups-mode

Structure:
```
## [Mode Name]
[Context]
### Core Loop
[Loop description with conditions]
### [Sub-process 1]
### [Sub-process 2]
### Completion
```

Characteristics: Loop-based rather than linear -- the agent repeats a cycle (implement
task, verify, update, next) until a condition is met. Not easily reducible to numbered steps.

**What is consistent across all files**:
- All start with a `##` heading matching the mode name
- All contain some form of workflow/process description
- All reference tracking files (DECISIONS.md, PARKING.md, etc.) inline
- All mention the parking protocol in their parent SKILL.md

**What varies**:
- Input declaration: scattered through prose (all files)
- Output format: code-block templates (Patterns A, C), inline descriptions (Pattern E),
  none (Pattern D)
- Error handling: separate section (Pattern A, some files), inline (rare), absent (most)
- Verification checkpoints: almost entirely absent
- Step numbering: top-level only, inconsistent (Step 1/Step 2 vs. Phase 1/Phase 2)

**Tradeoffs**:
- *Pro*: The current prose style is flexible and allows nuanced instruction for judgment-heavy
  modes
- *Con*: No quick-scan capability -- an agent must read the entire file to extract inputs,
  outputs, and error conditions
- *Con*: Agent interpretation variance is highest in the transition between steps and in
  error handling

**Source**: Direct structural analysis of all 34 reference files and 4 SKILL.md files in
`/Users/bhushan/Documents/Clarity_Loop/clarity-loop/skills/`.

### Finding 2: One Template Does Not Fit All -- Two Tiers Are Needed

**Context**: R-002 Open Question 6 asked whether Clarity Loop needs one template or two.
This finding resolves that question.

**Analysis**: The five structural patterns identified in Finding 1 map to two fundamentally
different execution models:

**Execution Model 1: Deterministic Pipeline** (Patterns A, C)
- The agent follows a fixed sequence of steps
- Each step has a clear input, action, and output
- The step order is not negotiable -- skipping or reordering would break the mode
- Examples: merge-mode (read manifest, validate, authorize, apply, verify), spec-mode
  (gate check, read docs, suggest format, generate, manifest), review-mode (gather context,
  spot-check, analyze dimensions, cross-proposal check, produce review)

These modes benefit most from Bowser's structured convention: Variables upfront, numbered
phased workflows, explicit verification checkpoints, and exact Report templates.

**Execution Model 2: Judgment-Driven Process** (Patterns B, D, E)
- The agent makes judgment calls at every step
- The "workflow" is more a set of guidelines than a fixed sequence
- User interaction determines the path (conversational modes)
- The output is not a single structured artifact but an evolving conversation or a
  dynamic loop
- Examples: bootstrap-guide (discovery conversation with multiple conditional paths),
  audit-mode (eight-dimension analysis where depth per dimension varies by findings),
  run-mode (loop with branching on task validity, gap triage, parallel execution decisions)

These modes would be damaged by over-structuring. Forcing bootstrap-guide's conversational
discovery into a rigid numbered workflow would eliminate the warmth and adaptability that
makes it effective. Forcing audit-mode's eight-dimension analysis into step 3.1, 3.2, 3.3
would obscure the judgment that makes it valuable.

**The Two-Tier Model**:

| Tier | Name | For | Template Strictness |
|------|------|-----|-------------------|
| **Tier 1: Structured** | For deterministic pipeline modes | merge, verify, review, re-review, fix, correction, spec, spec-review, start, sync, build-plan, design-review, context | Full Bowser-style: Variables, phased Workflow with numbered steps and verification checkpoints, exact Report template with success/failure variants |
| **Tier 2: Guided** | For judgment-driven and conversational modes | bootstrap, setup, research, triage, structure, proposal, audit, run, autopilot, tokens, mockups | Lighter structure: Variables (still required), Guidelines (instead of rigid Workflow), Output section (instead of exact Report template), Checkpoints (verification gates between phases, not between every step) |

**Key difference**: Tier 1 says "do exactly this, in this order, produce exactly this."
Tier 2 says "here are your inputs, here are the phases, here are the constraints, here is
what your output should contain -- use your judgment within these boundaries."

**Both tiers share**: Frontmatter, Variables section, and a clearly defined output section.
The difference is in the middle -- Workflow (rigid) vs. Guidelines+Phases (flexible).

**Assignment of existing reference files to tiers**:

| File | Current Pattern | Tier | Rationale |
|------|----------------|------|-----------|
| review-mode | A (Step-based) | 1-Structured | Fixed 6-step process, exact output template |
| re-review-mode | A (Step-based) | 1-Structured | Fixed process building cumulative ledger |
| merge-mode | A (Step-based) | 1-Structured | Fixed 7-step process with authorization marker |
| verify-mode | A (Step-based) | 1-Structured | Fixed 5-part verification, exact output template |
| fix-mode | A (Step-based) | 1-Structured | Fixed read-suggest-apply-re-review process |
| correction-mode | A (Step-based) | 1-Structured | Fixed manifest-approve-apply-spot-check process |
| sync-mode | A (Step-based) | 1-Structured | Fixed extract-verify-report process |
| design-review-mode | A (Step-based) | 1-Structured | Fixed read-analyze-report process |
| spec-mode | A (Step-based) | 1-Structured | Fixed gate-read-format-generate-manifest process |
| spec-consistency-check | A (Step-based) | 1-Structured | Fixed 6-dimension check process |
| start-mode | A (Step-based) | 1-Structured | Fixed pre-check-read-generate-review-populate process |
| build-plan-mode | A (Step-based) | 1-Structured | Fixed read-generate-review process |
| context-mode | A (Step-based) | 1-Structured | Fixed identify-research-generate process |
| bootstrap-guide | B (Phase-based) | 2-Guided | Conversational discovery, conditional paths |
| setup-mode | B (Phase-based) | 2-Guided | MCP detection + conversational discovery |
| research-template | C (Template) | 2-Guided | Template file, not a workflow |
| proposal-template | C (Template) | 2-Guided | Template file with process guidance |
| document-plan-template | C (Template) | 2-Guided | Template file with heuristics |
| audit-mode | A (Step-based, but judgment-heavy) | 2-Guided | 8+ dimensions with variable depth per dimension |
| run-mode | E (Loop-based) | 2-Guided | Core implementation loop with branching |
| autopilot-mode | E (Loop-based) | 2-Guided | Extended run-mode loop with self-testing |
| tokens-mode | E (Loop-based) | 2-Guided | Generate-screenshot-feedback-refine loop |
| mockups-mode | E (Loop-based) | 2-Guided | Generate-screenshot-feedback-refine loop |
| visual-quality-rules | D (Rules) | 2-Guided | Constraint reference, not a workflow |
| governance-checks | D (Rules) | 2-Guided | Constraint reference |
| operational-specs | D (Rules) | 2-Guided | Discovery question reference |
| behavioral-walkthrough | D (Rules) | 2-Guided | Walkthrough protocol reference |
| design-checklist | D (Rules) | 2-Guided | Checklist reference |
| cross-cutting-specs | C (Template) | 2-Guided | Generation guidance with templates |
| operational-bootstrap | D (Rules) | 2-Guided | Discovery question reference |

**Final count**: 13 Tier 1 files, 17 Tier 2 files. (This excludes the 4 SKILL.md files
which have their own Claude Code-defined structure and should not adopt reference file
templates.)

**Tradeoffs**:
- *Pro*: Two tiers respect the fundamental difference between deterministic and
  judgment-driven modes
- *Pro*: Tier 1 gets the full predictability benefits of Bowser's convention
- *Pro*: Tier 2 preserves the flexibility that judgment modes need
- *Con*: Two templates are more complex to learn than one
- *Con*: Some files are borderline (audit-mode is Step-based but judgment-heavy)
- *Con*: Tier assignment could become a source of debate

**Source**: Comparative analysis of all 34 reference files against the execution model
taxonomy, cross-referenced with Bowser's structured convention from R-002 Finding 6.

### Finding 3: Frontmatter Design for Reference Files

**Context**: Currently only SKILL.md files have YAML frontmatter (parsed by Claude Code
itself). Reference files have no frontmatter. R-002 Finding 6 identified that Bowser uses
layer-specific frontmatter fields. Should Clarity Loop reference files have frontmatter, and
if so, what fields?

**Analysis**: Frontmatter on reference files would be a **Clarity Loop convention**, not a
Claude Code convention. The agent would need to be instructed (in SKILL.md) to parse the
frontmatter when reading a reference file. This is straightforward -- the YAML block between
`---` markers is a well-known convention that the agent can parse.

**Proposed frontmatter fields for reference files**:

```yaml
---
mode: merge          # Mode name (matches argument-hint keyword)
tier: structured     # "structured" or "guided" — determines template expectations
depends-on:          # Other reference files this mode reads or requires
  - verify-mode.md   # (loaded after merge completes)
inputs:              # What this mode expects to receive
  - proposal         # A proposal file path (from user argument or PROPOSAL_TRACKER)
  - latest-review    # The most recent REVIEW_P-NNN_v*.md
outputs:             # What this mode produces
  - system-doc-edits # Changes to docs/system/ files
  - verify-trigger   # Auto-triggers verify mode
state-files:         # Tracking files this mode reads or writes
  - PROPOSAL_TRACKER.md  # reads and writes
  - DECISIONS.md          # writes (propagates design decisions)
---
```

**Field-by-field justification**:

| Field | Purpose | Why Needed |
|-------|---------|-----------|
| `mode` | Machine-readable mode name | Enables auto-discovery (R-002 Finding 7, pattern 1: directory-as-API). If SKILL.md ever moves to auto-discovery, this field identifies what mode a reference file implements. |
| `tier` | Template tier assignment | Tells a contributor (or an auto-validator) which template tier this file should follow. Enables automated template compliance checks. |
| `depends-on` | Cross-reference to other reference files | Currently embedded in prose ("Read `references/verify-mode.md`"). Making it machine-readable enables dependency graph tooling and load-order optimization. |
| `inputs` | What the mode expects to receive | Currently scattered throughout prose. A quick-scan field that answers "what does this mode need?" without reading the full file. |
| `outputs` | What the mode produces | Currently discoverable only by reading the full file. Enables pipeline visualization -- what flows from mode to mode. |
| `state-files` | Tracking files read/written | Currently embedded in prose. Enables state dependency analysis -- which modes can run in parallel without state conflicts. |

**What NOT to include**: Model specification (Clarity Loop doesn't control model selection --
Claude Code does), color (irrelevant for reference files), allowed-tools (Clarity Loop
reference files don't constrain tool access).

**Token cost assessment**: The proposed frontmatter adds ~10-15 lines (roughly 80-120
tokens) per file. With 34 reference files, that is ~2,700-4,080 tokens of additional context
when a reference file is loaded. Since only 1-3 reference files are loaded per mode
invocation, the per-invocation cost is ~80-360 tokens -- negligible relative to the
5,000-20,000 tokens of the reference file body.

**Tradeoffs**:
- *Pro*: Machine-readable metadata enables tooling (dependency graphs, compliance checks,
  auto-discovery)
- *Pro*: Quick-scan capability -- understand a mode's interface without reading the full file
- *Pro*: Lightweight -- ~15 lines per file, minimal token overhead
- *Con*: Clarity Loop convention, not a Claude Code convention -- adds cognitive load for
  contributors who expect reference files to be plain markdown
- *Con*: Risk of frontmatter drifting from reality (frontmatter says X, file body says Y)
- *Con*: No enforcement mechanism -- compliance depends on discipline (or a future linter)

**Source**: Analysis of SKILL.md frontmatter conventions, Bowser's layer-specific frontmatter
patterns (R-002 Finding 6), and Clarity Loop's reference file loading mechanism.

### Finding 4: Variables Convention

**Context**: Bowser's files declare all inputs in a `## Variables` section at the top of the
file body, with types, defaults, and parsing rules. Clarity Loop's reference files scatter
input declarations throughout their prose.

**Analysis**: Here is a concrete before/after comparison using two real reference files.

**Example 1: merge-mode.md (Tier 1: Structured)**

Before (current -- inputs scattered in prose):
```markdown
## Merge Mode

Merge mode is the missing link between an APPROVE verdict and the verify step...

### Prerequisites

Before merging, verify:
1. **The proposal exists** — Read the proposal file from `docs/proposals/`
2. **An APPROVE verdict exists** — Read the latest `REVIEW_P-NNN_v*.md` in
   `docs/reviews/proposals/`...
```

The agent must read the Prerequisites section to discover it needs a proposal file and the
latest review file. The fact that it also needs the Change Manifest, PROPOSAL_TRACKER.md,
and DECISIONS.md is discovered even later in the Process section.

After (proposed):
```markdown
## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| PROPOSAL_FILE | User argument or PROPOSAL_TRACKER.md (status: `approved`) | Yes | Path to the proposal file (e.g., `docs/proposals/P-001-MEMORY_V2.md`) |
| LATEST_REVIEW | Auto-resolved from `docs/reviews/proposals/REVIEW_P-NNN_v*.md` (highest version) | Yes | Latest review file with APPROVE or APPROVE WITH CHANGES verdict |
| CHANGE_MANIFEST | Extracted from PROPOSAL_FILE, "Change Manifest" section | Yes | Table mapping changes to target docs, sections, and types |
| PROPOSAL_TRACKER | `{docsRoot}/PROPOSAL_TRACKER.md` | Yes | Read: check for conflicting merges. Write: update status to `merged` |
| DECISIONS_MD | `{docsRoot}/DECISIONS.md` | Yes | Write: propagate design decisions, log merge conflict resolutions |
| DOCS_ROOT | From `.clarity-loop.json` `docsRoot` field, default: `docs/` | Yes | Base path for all documentation directories |
```

**Example 2: audit-mode.md (Tier 2: Guided)**

Before (current -- inputs embedded in step descriptions):
```markdown
## Audit Mode

A rigorous, comprehensive review of the entire system documentation set...

### Step 1: Load Everything

1. **Read every file in `docs/system/`** — Dispatch subagents in parallel...
2. **Read all previous audit reports** — Check `docs/reviews/audit/AUDIT_*.md`...
3. **Read the research and proposal history** — Skim `docs/research/` and
   `docs/proposals/`...
```

After (proposed):
```markdown
## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| SYSTEM_DOCS | All `*.md` files in `{docsRoot}/system/` (excluding `.manifest.md`) | Yes | Every system doc, read fresh -- no manifest shortcuts |
| PREVIOUS_AUDITS | All `AUDIT_*.md` files in `{docsRoot}/reviews/audit/` | No | Prior audit reports for trend/drift analysis. Empty on first audit. |
| RESEARCH_HISTORY | All files in `{docsRoot}/research/` | No | Research docs for understanding change sequence |
| PROPOSAL_HISTORY | All files in `{docsRoot}/proposals/` | No | Proposals for understanding change sequence |
| TASKS_MD | `{docsRoot}/specs/TASKS.md` | No | If exists, check for L1 assumption trends |
| PARKING_MD | `{docsRoot}/PARKING.md` | No | Active items for parking lot health check |
| DOCS_ROOT | From `.clarity-loop.json` `docsRoot` field, default: `docs/` | Yes | Base path for all documentation directories |
```

**The Variables table answers three questions at a glance**:
1. What does this mode read? (Source column)
2. What is optional vs. required? (Required column)
3. Where does each input come from? (Source column -- user argument, auto-resolved, state file)

**Convention rules for Variables sections**:
- Variables table appears immediately after the mode heading (or after frontmatter)
- Every input that the mode reads or writes is listed
- "Source" indicates where the value comes from -- user argument, auto-resolved from file
  system, extracted from another variable, or state file
- "Required" indicates whether the mode can proceed without this input
- Variables are referenced in the Workflow/Guidelines sections using SCREAMING_SNAKE_CASE
  names, making it clear when a step uses a declared input vs. introduces a new concept

**Tradeoffs**:
- *Pro*: Agent can understand mode interface by reading ~10 lines instead of the full file
- *Pro*: Makes input dependencies explicit -- no hidden assumptions
- *Pro*: SCREAMING_SNAKE_CASE references in workflow steps create visual anchors
- *Con*: Adds ~10-20 lines per file (~150-300 tokens)
- *Con*: Risk of Variables table and workflow prose drifting apart
- *Con*: Some inputs are genuinely dynamic (discovered during execution, not known upfront)
  -- the table should mark these as "Resolved at runtime" rather than pretending they are
  static

**Source**: Comparison of Bowser's Variables sections (ui-review.md, bowser-qa-agent.md) with
Clarity Loop's current input scattering patterns across 8 representative reference files.

### Finding 5: Workflow Convention

**Context**: How should steps be structured within each tier? Bowser uses phased, globally
numbered workflows. Clarity Loop currently uses top-level `### Step N:` headings with
unnumbered prose underneath.

**Analysis**:

**Tier 1 (Structured) Workflow Convention**:

Bowser uses `### Phase N: Name` with globally numbered steps. For Clarity Loop's Tier 1
modes, a modified version works better:

```markdown
## Workflow

### Phase 1: Gather Context

1. Read PROPOSAL_FILE. Extract CHANGE_MANIFEST from the "Change Manifest" section.
2. Read LATEST_REVIEW. Confirm verdict is APPROVE or APPROVE WITH CHANGES.
   - If APPROVE WITH CHANGES: verify specified changes have been made since the review.
3. Read PROPOSAL_TRACKER. Confirm no other proposals have status `merging`.
   - **On failure**: "Another merge is in progress (P-NNN). Only one merge at a time.
     Resolve the existing merge first."
4. **Verify**: All prerequisites confirmed. Present merge plan to user.

### Phase 2: Pre-Apply Validation

5. For each item in CHANGE_MANIFEST, read the target file and confirm:
   a. Target section exists at stated location
   b. Content broadly matches the proposal's "Current" description
6. **Verify**: All targets confirmed.
   - **On clean**: Auto-proceed: "Pre-apply validation: N/N targets confirmed. Proceeding."
   - **On issues**: Present validation report table and wait for user decision.
```

**Key conventions**:
- Phases have names (not just numbers) -- provides semantic grouping
- Steps are globally numbered across phases (1, 2, 3... not 1.1, 1.2 within phases) --
  enables unambiguous cross-reference ("see step 6")
- Sub-steps use lettered lists (a, b, c) for items within a step
- `**Verify**:` checkpoints appear after action steps -- explicit confirmation gates
- `**On failure**:` / `**On clean**:` / `**On issues**:` blocks appear inline with the
  step where the condition arises -- not in a separate Error Handling section
- SCREAMING_SNAKE_CASE variable references make input usage visible

**Tier 2 (Guided) Workflow Convention**:

Guided modes retain their current phase/step structure but gain three additions:

```markdown
## Guidelines

[Numbered or bulleted list of principles and constraints -- the "rules of the game"
for this mode. These replace the scattered prose guidelines currently at the bottom
of some files.]

## Process

### Phase 1: [Name]

[Description of what happens in this phase -- conversational, not rigidly numbered.
May include questions to ask, heuristics to apply, conditional paths.]

**Checkpoint**: [What should be true before moving to Phase 2]

### Phase 2: [Name]

[Description...]

**Checkpoint**: [What should be true before moving to Phase 3]
```

**Key conventions for Tier 2**:
- `## Guidelines` replaces scattered prose guidelines -- a single location for constraints
- `## Process` uses `### Phase N: [Name]` headings for major phases
- Within phases, prose description is the primary format -- not forced numbered steps
- `**Checkpoint**:` at phase boundaries (not between every step) -- lighter verification
  than Tier 1 but still explicit
- Conditional paths are described naturally: "If the user provides screenshots... If not..."

**Before/after for a Tier 2 file (audit-mode, Step 2 excerpt)**:

Before:
```markdown
### Step 2: Eight-Dimension Analysis

Audit is more rigorous than review...

Use subagents for parallel analysis where dimensions are independent.

#### 1. Internal Consistency (Cross-Document)

Check every pair of system docs for contradictions...
```

After:
```markdown
## Process

### Phase 2: Eight-Dimension Analysis

Analyze SYSTEM_DOCS across eight dimensions. Use subagents for parallel analysis
where dimensions are independent. Depth per dimension should scale with findings --
spend more time where problems surface.

**Dimensions**:

1. **Internal Consistency (Cross-Document)** -- Check every pair of system docs for
   contradictions. Dispatch subagents per doc pair if needed.
   [Rest of dimension description...]

2. **Internal Consistency (Within-Document)** -- Check each doc against itself...

[Remaining dimensions...]

**Checkpoint**: All eight dimensions analyzed. Findings collected for report generation.
```

The difference is subtle but significant: the Tier 2 version separates the Guidelines
(constraints) from the Process (what to do) and adds a Checkpoint at the phase boundary.
The dimension descriptions remain prose-based and judgment-heavy -- they are not forced into
sub-steps.

**Tradeoffs**:
- *Pro*: Tier 1 step numbering enables precise reference ("review found issues at step 6")
- *Pro*: Inline error handling catches failures where they occur, not in a separate section
- *Pro*: Tier 2 Checkpoints provide lightweight verification without over-constraining
- *Con*: Global step numbering across phases can produce high numbers (step 18 in Phase 4)
  -- potentially confusing
- *Con*: Inline error handling can make step descriptions longer and harder to scan
- *Con*: Converting existing files to the new convention requires understanding the intent
  of each step, not just mechanical reformatting

**Source**: Analysis of Bowser's phased workflow convention (ui-review.md steps 1-18,
bowser-qa-agent.md steps 1-5), compared with Clarity Loop's current Step N and Phase N
patterns across 13 Tier 1 and 17 Tier 2 files.

### Finding 6: Report Convention

**Context**: How should reference files specify their output format? Bowser uses exact
Report sections with `### On success` / `### On failure` variants and parseable summary
lines (`RESULT: PASS|FAIL`).

**Analysis**: Clarity Loop's current output specification falls into three categories:

1. **Exact templates** (review-mode, verify-mode, audit-mode, start-mode): A full markdown
   template in a fenced code block showing the exact output structure. These are close to
   Bowser's convention but lack success/failure variants and parseable summary lines.

2. **Inline descriptions** (merge-mode, run-mode): The output format is described in prose
   within workflow steps: "Present the plan to the user: [example table]."

3. **No output specification** (bootstrap-guide, setup-mode, tokens-mode): The mode's output
   is a conversation, not a file. Output is described implicitly.

**Proposed Report Convention**:

**Tier 1 files** get a formal `## Report` section with success/failure variants:

```markdown
## Report

Output: `{docsRoot}/reviews/proposals/VERIFY_P-NNN.md`

### On clean merge

```
VERDICT: CLEAN MERGE | Changes: N/N applied | Consistency: No issues

[Full report body following the template below]
```

### On issues found

```
VERDICT: ISSUES FOUND | Changes: N/N applied | Issues: M found

[Full report body with issues detailed]
```

### Template

```markdown
# Verification: [Proposal Name]

**Verified**: [date]
...
[Rest of the existing template]
```
```

**Key conventions**:
- `## Report` is a required section in Tier 1 files
- First line specifies the output path
- `### On [condition]` variants cover the major outcomes
- Each variant starts with a **summary line** that is parseable by an orchestrator:
  `VERDICT: [VALUE] | [Key metric]: [Value] | ...`
- The full template follows the variants
- The summary line format is consistent across all Tier 1 modes, enabling automated
  aggregation if fan-out is implemented later

**Tier 2 files** get a lighter `## Output` section:

```markdown
## Output

**Primary artifact**: `{docsRoot}/reviews/audit/AUDIT_[YYYY-MM-DD].md`

**Additional outputs**:
- PARKING.md: New emerged concepts (if any)
- DECISIONS.md: Audit judgment entries

**Output structure**: See the template in Phase 3 of the Process section.
```

Tier 2 files do not need success/failure variants because their outcomes are inherently
nuanced -- an audit does not "pass" or "fail"; it produces a health assessment. The template
remains embedded in the Process section where it naturally fits.

**Before/after for review-mode Report**:

Before (current -- template embedded in Step 5):
```markdown
### Step 5: Produce the Review File

Create the review as a markdown file at:
```
docs/reviews/proposals/REVIEW_P-NNN_v1.md
```

Use this structure:

```markdown
# Review: [Proposal Name]
...
```
```

After (proposed):
```markdown
## Report

Output: `{docsRoot}/reviews/proposals/REVIEW_P-NNN_v1.md`

### On approve

```
VERDICT: APPROVE | Blocking: 0 | Non-blocking: N | Consistency: All checked
```

### On approve with changes

```
VERDICT: APPROVE WITH CHANGES | Blocking: N (must fix) | Non-blocking: M
```

### On needs rework

```
VERDICT: NEEDS REWORK | Blocking: N (fundamental) | Non-blocking: M
```

### Template

```markdown
# Review: [Proposal Name]

**Reviewed**: [date]
**Proposal**: docs/proposals/P-NNN-slug.md
...
[Full existing template]
```
```

The summary lines enable future automated processing: an orchestrator could parse
`VERDICT: APPROVE` without reading the full review file.

**Tradeoffs**:
- *Pro*: Parseable summary lines enable automated aggregation for fan-out scenarios
- *Pro*: Success/failure variants make agent behavior explicit for every outcome
- *Pro*: Clear output path specification answers "where does this mode write?" instantly
- *Con*: Adds ~20-30 lines per Tier 1 file for the Report section
- *Con*: Summary line format is a new convention that must be respected by all Tier 1 modes
- *Con*: May feel over-engineered for modes that currently work fine with embedded templates

**Source**: Analysis of Bowser's Report sections (bowser-qa-agent.md On success/On failure,
ui-review.md Report format) compared with Clarity Loop's current output template patterns.

### Finding 7: Error Handling Convention

**Context**: Should reference files specify failure handling inline in the workflow or in a
separate section? Currently, merge-mode has a separate "Error Handling" section; most other
files have no explicit error handling.

**Analysis**: Bowser handles errors inline: "On FAIL: capture JS console errors, stop
execution, mark remaining SKIPPED." The error response is part of the step, not a separate
section.

Clarity Loop's merge-mode has the most developed error handling, but it is in a separate
section at the bottom of the file:

```markdown
### Error Handling

**Merge fails mid-way** (e.g., a system doc section referenced by the proposal doesn't
exist or has changed since the proposal was written)...

1. Stop applying changes
2. Do NOT remove the marker yet — partial changes have been made
3. Tell the user what happened...
```

The problem: when an agent is at step 4 (Apply Changes) and encounters a failure, it must
scroll to or recall the Error Handling section to know what to do. Inline error handling puts
the recovery instruction right where the failure occurs.

**Proposed convention -- inline error handling for Tier 1**:

```markdown
7. Apply each change from CHANGE_MANIFEST to target system docs.
   - **Modify**: Read target section, apply proposed changes. Preserve unchanged content.
   - **Add Section**: Insert new section at the appropriate location.
   - **On failure** (target section missing or content changed since proposal):
     a. Stop applying changes
     b. Do NOT remove the authorization marker (partial changes exist)
     c. Tell user: "Change #N couldn't be applied because [reason]. Changes 1 through
        N-1 were applied. Options: fix and continue, or revert partial changes."
     d. If user wants to revert: undo applied changes, then remove marker.
```

**For Tier 2 files**: Error handling remains in the Guidelines section (which replaces
scattered prose guidelines). Tier 2 modes have more diffuse failure modes that cannot be
tied to a specific step -- "if the user becomes frustrated during discovery, simplify your
questions" is a guideline, not a step-level error handler.

**Tradeoffs**:
- *Pro*: Inline error handling is encountered exactly when it is needed
- *Pro*: No "scroll to Error Handling section" cognitive load during execution
- *Pro*: Makes the step's contract complete: input, action, success, failure
- *Con*: Can make individual steps significantly longer (the merge-mode error handling adds
  ~15 lines to step 7)
- *Con*: Multiple inline error handlers can make the overall file harder to scan for
  "what is the happy path?"
- *Con*: Not all failures are step-specific -- some (like "stale authorization marker") are
  cross-cutting and better in a Prerequisites or Guidelines section

**Recommendation**: Use inline `**On failure**:` for step-specific errors in Tier 1.
Keep a brief `### Error Recovery` subsection in the Process section for cross-cutting
failure modes (e.g., "authorization marker already exists") that can occur at any step.
For Tier 2, keep error handling in Guidelines.

**Source**: Comparison of Bowser's inline error handling pattern (bowser-qa-agent.md step
3d, ui-review.md Phase 1 step 4) with Clarity Loop's separated error handling pattern
(merge-mode.md Error Handling section).

### Finding 8: Retrofit Strategy

**Context**: With 34 reference files totaling ~10,498 lines, how should migration to the
new convention be prioritized? A big-bang rewrite is explicitly out of scope per the
constraints.

**Analysis**: Migration impact depends on two factors:

1. **Structural gap**: How far is the current file from the target template? Files that
   already have Step N headings and embedded output templates are close; files that are
   pure prose are far.

2. **Usage frequency**: Files used in every pipeline run (merge, verify, review) should be
   migrated first to maximize the benefit of structural consistency.

**Priority grouping**:

**Priority 1 -- High frequency, high structural gap (migrate first)**

These files are invoked most often and would benefit most from Variables, Verify checkpoints,
and Report sections.

| File | Skill | Lines | Structural Gap | Frequency |
|------|-------|-------|---------------|-----------|
| review-mode.md | cl-reviewer | ~233 | Medium (has Steps, has template, no Variables/Verify) | Every proposal cycle |
| merge-mode.md | cl-reviewer | ~192 | Medium (has Steps, has Error section, no Variables/Verify/Report) | Every proposal merge |
| verify-mode.md | cl-reviewer | ~217 | Medium (has Steps, has template, no Variables/Verify/Report) | Every post-merge |
| re-review-mode.md | cl-reviewer | ~estimated | Medium | Every review cycle with fixes |
| fix-mode.md | cl-reviewer | ~estimated | Medium | Every review cycle with fixes |

**Priority 2 -- High structural gap, moderate frequency**

| File | Skill | Lines | Structural Gap | Frequency |
|------|-------|-------|---------------|-----------|
| spec-mode.md | cl-implementer | ~326 | High (long file, Steps + subagent patterns, no Variables) | Once per spec generation |
| start-mode.md | cl-implementer | ~446 | High (long file, complex pre-checks, no Variables) | Once per implementation start |
| audit-mode.md | cl-reviewer | ~357 | High (long Tier 2 file, no Guidelines separation) | Periodic audits |
| bootstrap-guide.md | cl-researcher | ~945 | Very High (longest file, multiple paths, no structure) | Once per project |

**Priority 3 -- Moderate gap, moderate frequency**

| File | Skill | Structural Gap | Frequency |
|------|-------|---------------|-----------|
| correction-mode.md | cl-reviewer | Medium | As needed |
| sync-mode.md | cl-reviewer | Medium | As needed |
| design-review-mode.md | cl-reviewer | Medium | After design phases |
| spec-consistency-check.md | cl-implementer | Medium | Once per spec review |
| build-plan-mode.md | cl-designer | Medium | Once per design cycle |
| setup-mode.md | cl-designer | Medium | Once per project design |
| context-mode.md | cl-researcher | Medium | As needed |
| proposal-template.md | cl-researcher | Low (already has process + template separation) | Every proposal |
| research-template.md | cl-researcher | Low (already is a template) | Every research |

**Priority 4 -- Low gap or infrequent (migrate opportunistically)**

| File | Skill | Structural Gap | Frequency |
|------|-------|---------------|-----------|
| run-mode.md | cl-implementer | High but Tier 2 (loop-based) | Frequent during implementation |
| autopilot-mode.md | cl-implementer | High but Tier 2 | User choice |
| tokens-mode.md | cl-designer | Medium, Tier 2 | Once per design cycle |
| mockups-mode.md | cl-designer | Medium, Tier 2 | Once per design cycle |
| visual-quality-rules.md | cl-designer | Low (constraint reference, not a workflow) | Consulted during design |
| governance-checks.md | cl-implementer | Low | Consulted during verify |
| operational-specs.md | cl-implementer | Low | Consulted during spec generation |
| behavioral-walkthrough.md | cl-designer | Low | Consulted during mockups |
| design-checklist.md | cl-designer | Low | Consulted during design |
| cross-cutting-specs.md | cl-implementer | Low | Consulted during spec generation |
| operational-bootstrap.md | cl-researcher | Low | Consulted during bootstrap |
| document-plan-template.md | cl-researcher | Low | Once per structure plan |

**Migration approach per file**:

1. **Add frontmatter** (5 minutes per file): Mechanical -- add the YAML block with mode,
   tier, depends-on, inputs, outputs, state-files. Can be done for all files in one pass
   without changing any content.

2. **Extract Variables table** (15-30 minutes per file): Read the file, identify all inputs,
   create the Variables table. Remove redundant input descriptions from prose where they
   were only serving as declarations (keep them where they serve as explanations).

3. **Restructure Workflow/Process** (30-60 minutes per file for Tier 1, 15-30 for Tier 2):
   This is the heaviest change. For Tier 1: add global step numbering, phase names, Verify
   checkpoints, inline error handling. For Tier 2: separate Guidelines from Process, add
   Checkpoints.

4. **Add/refactor Report section** (15-30 minutes per Tier 1 file): Extract existing
   template from embedded code block, add summary line variants, add output path.

**Total estimated effort**: ~40-60 hours for all 34 files. Spread across 4 priority waves:
Priority 1 (5 files, ~8-10 hours), Priority 2 (4 files, ~10-15 hours), Priority 3 (9 files,
~12-18 hours), Priority 4 (16 files, ~10-17 hours).

**Tradeoffs**:
- *Pro*: Priority-based migration delivers the highest-value improvements first
- *Pro*: Frontmatter can be added to all files immediately with no functional change
- *Pro*: Each priority wave is independently valuable -- no need to complete all waves
- *Con*: During migration, some files will follow the new convention and others will not
- *Con*: Contributors working on unmigrated files may be confused by the convention
  difference
- *Con*: The effort estimate assumes familiarity with the codebase -- first few files will
  take longer as the migrator learns the patterns

**Source**: Line counts and structural analysis of all 34 reference files, categorized by
current structural pattern, tier assignment, pipeline frequency, and estimated migration
complexity.

## Options Analysis

| Criterion | Option A: Two-Tier Template | Option B: Single Structured Template | Option C: Frontmatter + Variables Only |
|-----------|---------------------------|------------------------------------|-----------------------------------------|
| **Scope of change** | Full template reform -- frontmatter, Variables, Workflow/Guidelines, Report/Output, error handling | Same structure for all 34 files regardless of mode type | Minimal change -- add frontmatter and Variables table only, leave workflow/report structure as-is |
| **Agent predictability** | High for Tier 1, moderate for Tier 2 (preserves judgment flexibility) | High everywhere, but at the cost of awkward fits for judgment modes | Moderate -- inputs are clear but execution and output remain unstructured |
| **Retrofit effort** | ~40-60 hours across 4 waves | ~60-80 hours (judgment modes require forced restructuring) | ~15-20 hours (mechanical additions only) |
| **Template complexity** | Two templates to learn | One template (simpler) | One lightweight addition (simplest) |
| **Fan-out readiness** | Tier 1 Report sections enable automated aggregation | All files have Report sections, enabling universal aggregation | Not addressed -- output formats remain unstructured |
| **Warmth preservation** | Tier 2 preserves conversational style for discovery/judgment modes | Forced structure may damage conversational warmth in bootstrap, setup, research | Fully preserved -- no workflow changes |
| **Risk** | Medium -- two tiers adds complexity, but maps to natural file categories | High -- over-structuring judgment modes may reduce quality | Low -- minimal change, but also minimal benefit |

## Recommendations

### Primary Recommendation: Option A (Two-Tier Template)

Adopt the two-tier template model with incremental, priority-based retrofit. This is the
only option that simultaneously addresses agent predictability (Tier 1 structured modes),
preserves judgment quality (Tier 2 guided modes), and enables future fan-out aggregation
(Tier 1 Report sections with parseable summary lines).

### The Templates

The following are the literal templates that new files would copy. They are the primary
deliverable of this research.

#### Tier 1: Structured Reference File Template

```markdown
---
mode: [mode-name]
tier: structured
depends-on: []
inputs:
  - [input-name]
outputs:
  - [output-name]
state-files:
  - [tracking-file.md]
---

## [Mode Name] Mode

[1-2 sentence description of what this mode does and when it runs.]

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| [VAR_NAME] | [Where it comes from] | Yes/No | [What it is] |

## Workflow

### Phase 1: [Phase Name]

1. [Action step. Reference VARIABLE_NAME when using declared inputs.]
2. [Next action step.]
   a. [Sub-step if needed]
   b. [Sub-step if needed]
3. **Verify**: [Condition that must be true before proceeding.]
   - **On failure**: [What to do if verification fails.]

### Phase 2: [Phase Name]

4. [Action step. Global numbering continues across phases.]
5. [Action step.]
6. **Verify**: [Condition.]

### Phase N: [Phase Name]

N. [Final action steps.]
N+1. **Verify**: [Final verification.]

## Report

Output: `[output file path with {docsRoot} and variable substitution]`

### On [success condition]

```
VERDICT: [VALUE] | [Key metric]: [Value] | [Key metric]: [Value]
```

### On [failure condition]

```
VERDICT: [VALUE] | [Key metric]: [Value] | [Key metric]: [Value]
```

### Template

```markdown
[Exact output file template]
```
```

#### Tier 2: Guided Reference File Template

```markdown
---
mode: [mode-name]
tier: guided
depends-on: []
inputs:
  - [input-name]
outputs:
  - [output-name]
state-files:
  - [tracking-file.md]
---

## [Mode Name] Mode

[1-2 sentence description of what this mode does and when it runs.]

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| [VAR_NAME] | [Where it comes from] | Yes/No | [What it is] |

## Guidelines

[Numbered or bulleted list of principles and constraints for this mode. These are the
"rules of the game" -- not the steps to follow, but the boundaries within which the
agent exercises judgment.]

1. [Guideline]
2. [Guideline]
3. [Guideline]

## Process

### Phase 1: [Phase Name]

[Description of what happens in this phase. Conversational, not rigidly numbered.
May include questions to ask, heuristics to apply, conditional paths.]

**Checkpoint**: [What should be true before moving to the next phase.]

### Phase 2: [Phase Name]

[Description...]

**Checkpoint**: [Condition.]

### Phase N: [Phase Name]

[Description...]

**Checkpoint**: [Final verification.]

## Output

**Primary artifact**: `[output file path]`

**Additional outputs**:
- [State file or artifact]: [What gets written]

**Output structure**: [Reference to template within Process section, or inline template
if short.]
```

### Migration Plan

**Wave 0 (immediate, all files)**: Add frontmatter to all 34 reference files. This is
a mechanical change that can be done in a single pass -- read each file, determine mode
name, tier assignment, dependencies, inputs, outputs, and state files from the existing
prose, and write the YAML block. No content changes. Estimated: 3-4 hours.

**Wave 1 (Priority 1 -- cl-reviewer core)**: Migrate the 5 highest-frequency Tier 1 files:
review-mode, merge-mode, verify-mode, re-review-mode, fix-mode. These are the pipeline
backbone -- every proposal cycle uses them. Add Variables tables, restructure Workflows with
global numbering and Verify checkpoints, add Report sections with summary line variants,
move error handling inline. Estimated: 8-10 hours.

**Wave 2 (Priority 2 -- heavy modes)**: Migrate spec-mode, start-mode, audit-mode,
bootstrap-guide. These are the longest and most complex files. spec-mode and start-mode
get Tier 1 treatment; audit-mode and bootstrap-guide get Tier 2 treatment (Guidelines +
Process + Checkpoints). Estimated: 10-15 hours.

**Wave 3 (Priority 3 -- moderate frequency)**: Migrate the remaining active workflow files.
Estimated: 12-18 hours.

**Wave 4 (Priority 4 -- opportunistic)**: Migrate reference documents (rules, checklists,
operational specs) and lower-frequency modes. These can be migrated as they are touched by
other changes. Estimated: 10-17 hours.

**Trigger for migration**: A file should be migrated when it is being modified for any
other reason. This "opportunistic migration" approach means the wave ordering is a
recommendation, not a rigid schedule. If a Priority 4 file needs changes for R-004 work,
migrate it then rather than waiting for "its turn."

### Template Compliance Guidance for SKILL.md Files

SKILL.md files should NOT adopt the reference file template. They follow Claude Code's native
frontmatter convention and serve as mode routers + documentation, not workflow instructions.
However, SKILL.md files should be updated to instruct the agent to parse reference file
frontmatter when loading a reference:

```
When loading a reference file, read its frontmatter to understand the mode's interface
(inputs, outputs, dependencies, tier). Then follow the file's Workflow (Tier 1) or
Process (Tier 2) section.
```

This instruction can be added to the Session Start or Mode Detection sections of each
SKILL.md during the Wave 0 frontmatter pass.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Tier assignment disputes (is audit-mode Tier 1 or Tier 2?) | Medium | Low | The assignment table in Finding 2 provides rationale. Borderline cases default to Tier 2 (less risk of over-structuring). |
| Frontmatter-body drift (frontmatter says X inputs, body references Y) | Medium | Medium | Wave 0 adds frontmatter by reading the body. A future lint script can check consistency. Include a "last verified" date in frontmatter if drift becomes a problem. |
| Migration introduces regressions (reformatted file changes agent behavior) | Medium | High | Test each migrated file by running its mode on a sample project. Tier 1 migrations should produce identical outputs; Tier 2 migrations should produce equivalent (not necessarily identical) outputs. |
| Contributors ignore the convention for new files | Low | Medium | The template files are the primary defense. Reference them in SYSTEM_DESIGN.md. A future pre-commit hook could validate frontmatter presence. |
| Inline error handling makes steps too long to scan | Medium | Low | Use `**On failure**:` as a visual marker. Limit inline error handling to 3-5 lines per step. If an error handler needs more, create a separate `### Error Recovery` subsection within the Phase. |
| Over-structuring Tier 2 files (migrators treat Checkpoints as rigid gates) | Low | Medium | The Tier 2 template explicitly says "Conversational, not rigidly numbered" and "boundaries within which the agent exercises judgment." Include a note in the migration guide. |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| SYSTEM_DESIGN.md | New subsection in S1 (Architecture Overview) documenting the reference file template convention, tier model, and frontmatter fields. Update S3-6 (per-skill architecture) to reference the convention. |
| docs/pipeline-concepts.md | Add a section on "Reference File Structure" explaining the two-tier model, Variables convention, and Report convention as pipeline concepts. |
| (new) Template files | Two template files (one per tier) stored in a location accessible to contributors -- either in the plugin root or in a `templates/` directory. |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Number of template tiers | One universal template vs. two tiers vs. three tiers | Two tiers (Structured + Guided) | One tier over-constrains judgment modes. Three tiers adds unnecessary complexity. Two tiers maps naturally to the deterministic vs. judgment execution model split. |
| 2 | Frontmatter scope | No frontmatter vs. minimal (mode + tier) vs. rich (mode + tier + deps + inputs + outputs + state-files) | Rich frontmatter | The additional fields (deps, inputs, outputs, state-files) enable tooling and quick-scan capability for minimal token cost (~120 tokens per file). |
| 3 | Variables format | Prose paragraph vs. bulleted list vs. table | Table with Source, Required, Description columns | Table is scannable, structured, and explicitly distinguishes required from optional inputs. Aligns with Bowser convention. |
| 4 | Step numbering | Per-phase (1.1, 1.2, 2.1, 2.2) vs. global (1, 2, 3... 15, 16, 17) | Global numbering | Per-phase numbering is ambiguous ("step 2" could be Phase 1 Step 2 or Phase 2 Step 2). Global numbering enables unambiguous cross-reference. |
| 5 | Error handling placement | Separate section (current) vs. fully inline vs. hybrid | Hybrid: inline for step-specific, brief subsection for cross-cutting | Step-specific errors belong with the step (immediate context). Cross-cutting errors (marker already exists, session crashed) belong in a Recovery subsection because they can occur at any step. |
| 6 | Report convention scope | All files get Report section vs. only Tier 1 | Tier 1 gets Report with summary lines, Tier 2 gets lighter Output section | Tier 2 modes produce nuanced outputs (audits, conversations) that do not reduce to PASS/FAIL summary lines. Forcing summary lines on them would be artificial. |
| 7 | Migration approach | Big-bang rewrite vs. priority waves vs. purely opportunistic | Priority waves with opportunistic override | Waves provide structure and ensure highest-value files are migrated first. Opportunistic override allows flexibility when files are touched by other work. |
| 8 | Audit-mode tier assignment | Tier 1 (has Step headings, produces structured report) vs. Tier 2 (judgment-heavy, variable depth per dimension) | Tier 2 | Despite having step headings, audit-mode's core value is in the judgment it exercises across 8+ dimensions. Forcing it into rigid numbered steps would reduce audit quality. The structured audit report template can still exist within a Tier 2 Output section. |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Template compliance lint script | A script that reads frontmatter, checks for required sections (Variables, Workflow/Process, Report/Output), and validates that frontmatter inputs match Variables table entries. Would catch frontmatter-body drift automatically. | Low priority tooling improvement. Defer to after Wave 2 migration when enough files follow the convention to make linting worthwhile. |
| Reference file auto-discovery from frontmatter | The `mode` field in frontmatter enables SKILL.md to auto-discover modes by globbing `references/*.md` and reading frontmatter `mode` fields. This would mean adding a mode is just creating a file -- no SKILL.md edit needed. Related to R-002 Finding 7 (directory-as-API). | Scope into a separate research cycle after R-003 convention is established. Requires careful design -- SKILL.md currently serves as both mode router AND mode documentation. |
| Parseable summary line standard | The `VERDICT: VALUE | Key: Value` format proposed for Tier 1 Report sections could become a pipeline-wide standard for machine-readable output summaries. If fan-out is implemented (R-002 Phase 2), orchestrators would use this format to aggregate results. | Define the standard formally in the proposal. Keep it simple and extensible. |

## Open Questions

1. **Template file location**: Should the two template files live in the plugin root
   (`templates/structured-reference.md`, `templates/guided-reference.md`), in a new
   `skills/.shared/` directory, or alongside an existing skill's references? The location
   affects discoverability and the contributor workflow for creating new modes.

2. **Frontmatter parsing instruction**: Where should the instruction to parse reference
   file frontmatter be placed in SKILL.md? In the Session Start section (run once per
   session)? In each Mode Detection section (run per mode)? Or as a one-line addition to
   each mode's "Read `references/X.md`" instruction?

3. **Variables table vs. Variables list**: The proposed Variables table (Finding 4) uses a
   4-column table. For files with only 2-3 inputs, this may feel heavy. Should there be a
   "short form" (bulleted list with bold labels) for simple modes and a "table form" for
   complex modes? Or should consistency win over conciseness?

4. **Summary line format finalization**: The proposed parseable summary line format
   (`VERDICT: VALUE | Key: Value`) needs the specific keys defined per Tier 1 mode. Should
   this be standardized in R-003 (with a table of mode-to-keys mappings), or left to
   individual file migrations to define as they are converted?

## References

- R-002: Bowser Architecture Patterns for Clarity Loop
  (`docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md`), specifically Finding 6 (Internal
  File Structure Conventions) and Finding 7 (Operational Design Patterns)
- Bowser project source files:
  - `/Users/bhushan/Documents/bowser/.claude/commands/ui-review.md` (orchestrator command
    with Variables, phased Workflow, Report sections)
  - `/Users/bhushan/Documents/bowser/.claude/agents/bowser-qa-agent.md` (rich agent with
    Variables, Workflow, Report with On success/On failure variants)
  - `/Users/bhushan/Documents/bowser/.claude/skills/playwright-bowser/SKILL.md` (skill with
    Purpose, Key Details, Sessions, Quick Reference, Workflow, Configuration)
  - `/Users/bhushan/Documents/bowser/.claude/agents/playwright-bowser-agent.md` (thin agent
    -- 20 lines, Purpose + Workflow)
- Clarity Loop source files:
  - All 4 SKILL.md files in `skills/cl-*/SKILL.md`
  - All 34 reference files in `skills/cl-*/references/*.md`
  - `docs/SYSTEM_DESIGN.md` (architecture reference)
  - `docs/pipeline-concepts.md` (pipeline concept definitions)
