# Proposal: Reference File Template Convention

**Created**: 2026-02-15
**Status**: Draft
**Research**: docs/research/R-003-REFERENCE_FILE_TEMPLATE_CONVENTION.md
**Author**: User + AI researcher

## Summary

This proposal standardizes the internal structure of all 35 reference files across Clarity
Loop's 4 skills. Currently, reference files are unstructured prose with no frontmatter, no
declared inputs, inconsistent step numbering, and error handling buried at the end of files
(or absent entirely). This produces agent behavior variance between sessions and blocks
future capabilities like fan-out orchestration.

The change is purely structural — the instructions stay the same, they just get reorganized
into a consistent format. Two template tiers handle the natural split between deterministic
pipeline modes (Tier 1: Structured) and judgment-driven modes (Tier 2: Guided). All 35
files are migrated in a single pass to avoid a mixed-format state.

The proposal also updates SYSTEM_DESIGN.md to document the convention and corrects its
file inventory (SYSTEM_DESIGN.md lists 31 references but 35 actually exist).

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-003-REFERENCE_FILE_TEMPLATE_CONVENTION.md | Finding 1 (current patterns), Finding 2 (two-tier model), Finding 3 (frontmatter), Finding 4 (Variables), Finding 5 (Workflow), Finding 6 (Report), Finding 7 (error handling), Finding 8 (retrofit strategy — modified per user feedback) | Option A (Two-Tier Template) with all-at-once migration instead of waves |
| docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md | Finding 6 (file structure conventions) | Selective adoption: frontmatter, Variables, phased workflows, report templates. Adapted for Clarity Loop's two-tier needs. |

## System Context

### Research Type: Evolutionary

This evolves the internal structure of existing plugin files. No new capabilities are added.
No behavioral changes occur. The pipeline continues to work exactly as before.

### Current State

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| SYSTEM_DESIGN.md | Section 1 describes plugin structure (4 skills + references). Section 17 lists complete file inventory with 31 references (actually 35). No section describes reference file internal structure or conventions. | S1 Architecture Overview, S16 Warmth Gradient, S17 Complete File Inventory |
| docs/pipeline-concepts.md | Defines pipeline concepts (modes, reference files, state files, tracking files). No section on reference file internal structure. | Full document |

### What Exists Today

35 reference files totaling ~11,000 lines across 4 skills:

| Skill | Reference Files | Total Lines |
|-------|----------------|-------------|
| cl-researcher | 6 | ~2,135 |
| cl-reviewer | 9 | ~2,070 |
| cl-designer | 10 | ~3,651 |
| cl-implementer | 10 | ~3,193 |

None have YAML frontmatter. None have a Variables table. Step numbering varies (Step N,
Phase N, flat bullets). Error handling is in a separate section at the end (1 file), in
Guidelines prose (a few files), or absent (most files). Output formats are embedded as
code blocks within step descriptions or described inline.

### Proposed State

All 35 reference files follow one of two templates:

- **Tier 1: Structured** (14 files) — YAML frontmatter, Variables table, Workflow section
  with globally numbered steps across named Phases, Verify checkpoints, inline error
  handling, formal Report section with parseable summary lines and success/failure variants.

- **Tier 2: Guided** (21 files) — YAML frontmatter, Variables table, Guidelines section,
  Process section with named Phases and Checkpoints, lighter Output section.

4 SKILL.md files gain a one-line instruction to read reference file frontmatter.
SYSTEM_DESIGN.md gains a new subsection documenting the convention.

## Change Manifest

> This is the contract between the proposal and the system docs/plugin files. The reviewer
> will use this table to verify every change was applied correctly.

### System Doc Changes

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Add "Reference File Convention" subsection documenting two-tier model, frontmatter fields, Variables, Workflow/Process, Report/Output conventions | SYSTEM_DESIGN.md | S1 Architecture Overview (after "Plugin Structure" diagram) | Add Section | Finding 2, 3, 4, 5, 6, 7 |
| 2 | Update file inventory counts: cl-designer has 10 references (not 6), total is 35 (not 31). Add 4 missing files: pencil-schema-quick-ref.md, visual-quality-rules.md, component-identification-process.md, pencil-templates.md | SYSTEM_DESIGN.md | S17 Complete File Inventory, cl-designer table | Modify | Finding 1 (file audit) |
| 3 | Add "Reference File Structure" section explaining the two-tier convention as a pipeline concept | docs/pipeline-concepts.md | New section after existing content | Add Section | Finding 2 |

### SKILL.md Changes

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 4 | Add frontmatter parsing instruction: "When loading a reference file, read its frontmatter to understand the mode's tier, dependencies, and state files. Then follow the file's Workflow (Tier 1) or Process (Tier 2) section." | skills/cl-researcher/SKILL.md | Session Start section | Add | Finding 3 |
| 5 | Same frontmatter parsing instruction | skills/cl-reviewer/SKILL.md | Session Start section | Add | Finding 3 |
| 6 | Same frontmatter parsing instruction | skills/cl-designer/SKILL.md | Session Start section | Add | Finding 3 |
| 7 | Same frontmatter parsing instruction | skills/cl-implementer/SKILL.md | Session Start section | Add | Finding 3 |

### Reference File Reformats — cl-researcher (6 files)

| # | File | Tier | Type | Research Ref |
|---|------|------|------|-------------|
| 8 | bootstrap-guide.md | 2-Guided | Restructure | Finding 2, 5 |
| 9 | operational-bootstrap.md | 2-Guided | Restructure | Finding 2 |
| 10 | document-plan-template.md | 2-Guided | Restructure | Finding 2 |
| 11 | context-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |
| 12 | proposal-template.md | 2-Guided | Restructure | Finding 2 |
| 13 | research-template.md | 2-Guided | Restructure | Finding 2 |

### Reference File Reformats — cl-reviewer (9 files)

| # | File | Tier | Type | Research Ref |
|---|------|------|------|-------------|
| 14 | review-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 15 | re-review-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 16 | verify-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 17 | audit-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 18 | merge-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 19 | fix-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 20 | correction-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 21 | sync-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |
| 22 | design-review-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |

### Reference File Reformats — cl-designer (10 files)

| # | File | Tier | Type | Research Ref |
|---|------|------|------|-------------|
| 23 | setup-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 24 | tokens-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 25 | mockups-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 26 | build-plan-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |
| 27 | visual-quality-rules.md | 2-Guided | Restructure | Finding 2 |
| 28 | component-identification-process.md | 2-Guided | Restructure | Finding 2 |
| 29 | behavioral-walkthrough.md | 2-Guided | Restructure | Finding 2 |
| 30 | design-checklist.md | 2-Guided | Restructure | Finding 2 |
| 31 | pencil-schema-quick-ref.md | 2-Guided | Restructure | Finding 2 |
| 32 | pencil-templates.md | 2-Guided | Restructure | Finding 2 |

### Reference File Reformats — cl-implementer (10 files)

| # | File | Tier | Type | Research Ref |
|---|------|------|------|-------------|
| 33 | spec-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 34 | cross-cutting-specs.md | 2-Guided | Restructure | Finding 2 |
| 35 | operational-specs.md | 2-Guided | Restructure | Finding 2 |
| 36 | governance-checks.md | 2-Guided | Restructure | Finding 2 |
| 37 | spec-consistency-check.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |
| 38 | start-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6, 7 |
| 39 | run-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 40 | autopilot-mode.md | 2-Guided | Restructure | Finding 2, 4, 5 |
| 41 | verify-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |
| 42 | sync-mode.md | 1-Structured | Restructure | Finding 2, 4, 5, 6 |

**Scope boundary**: This proposal ONLY modifies the files listed above. No new modes are
created. No mode dispatch logic changes. No behavioral changes to any mode.

**Total**: 42 changes (3 system/public docs + 4 SKILL.md + 35 reference files)

## Detailed Design

### Change 1: SYSTEM_DESIGN.md — Reference File Convention Section

**What**: Add a new subsection after the "Plugin Structure" diagram in Section 1 that
documents the reference file template convention.

**Why**: The convention is a cross-cutting architectural concern that affects all 35
reference files. It should be documented alongside the plugin structure it governs.
(Research Finding 2: the two-tier model is a fundamental architectural decision.)

**Current** (from SYSTEM_DESIGN.md S1):
> After the Plugin Structure diagram and Created Directory Structure diagram, Section 1
> moves directly to "Skill Responsibilities" table. There is no mention of reference file
> internal structure.

**Proposed** (new subsection after "Created Directory Structure"):

> ### Reference File Convention
>
> All reference files follow one of two templates based on their execution model.
>
> **Tier 1: Structured** — For deterministic pipeline modes where step order is fixed and
> outputs are predictable. Files have: YAML frontmatter, Variables table, Workflow section
> with globally numbered steps, Verify checkpoints, inline error handling, and a Report
> section with parseable summary lines.
>
> **Tier 2: Guided** — For judgment-driven and conversational modes where the agent
> exercises discretion. Files have: YAML frontmatter, Variables table, Guidelines section,
> Process section with named Phases and Checkpoints, and an Output section.
>
> Both tiers share: frontmatter, Variables, and a defined output section. The difference is
> in the middle — Workflow (rigid) vs. Guidelines+Process (flexible).
>
> **Frontmatter fields**: `mode`, `tier`, `depends-on`, `state-files`.
>
> **Tier assignment**: 14 Tier 1 files, 21 Tier 2 files. See Section 17 for the complete
> assignment table.
>
> **Convention enforcement**: Skills instruct the agent to read frontmatter when loading a
> reference file. A future lint script may validate compliance.

**Dependencies**: Change 2 (file inventory correction) should be applied simultaneously
since this section references "Section 17."

### Change 2: SYSTEM_DESIGN.md — File Inventory Correction

**What**: Update the cl-designer reference file table to include all 10 files (currently
lists 6), and update the heading count from "31 references" to "35 references". Add tier
assignment column to all reference file tables.

**Why**: 4 files exist in `skills/cl-designer/references/` that are not listed:
`pencil-schema-quick-ref.md`, `visual-quality-rules.md`, `component-identification-process.md`,
`pencil-templates.md`. The inventory should match reality.

**Current** (from SYSTEM_DESIGN.md S17):
> `#### cl-designer (SKILL.md + 6 references)`
> Lists: setup-mode, tokens-mode, mockups-mode, behavioral-walkthrough, build-plan-mode,
> design-checklist

**Proposed**:
> `#### cl-designer (SKILL.md + 10 references)`
>
> | File | Purpose | Tier |
> |------|---------|------|
> | setup-mode.md | MCP detection, visual references, design discovery, style guide | Guided |
> | tokens-mode.md | Token derivation, .pen file setup, component generation, behavioral states | Guided |
> | mockups-mode.md | Screen inventory, ref nodes, behavioral walkthrough, responsive states | Guided |
> | behavioral-walkthrough.md | Screen states, interaction flows, navigation context, content decisions | Guided |
> | build-plan-mode.md | 5-phase task breakdown, dependency graph, acceptance criteria | Structured |
> | design-checklist.md | Tokens checklist (14 items), mockups checklist (11 items), tier system | Guided |
> | visual-quality-rules.md | Gestalt principles, WCAG constraints, visual quality gates | Guided |
> | component-identification-process.md | Atomic design methodology, component hierarchy identification | Guided |
> | pencil-schema-quick-ref.md | Pencil MCP node types, frame properties, common patterns | Guided |
> | pencil-templates.md | Copy-paste Pencil code blocks for common UI components | Guided |

Also update the section heading from "Skills (4 SKILL.md + 31 references)" to
"Skills (4 SKILL.md + 35 references)" and add Tier column to all four skill tables.

### Change 3: pipeline-concepts.md — Reference File Structure Section

**What**: Add a section explaining the two-tier reference file convention as a pipeline
concept.

**Why**: pipeline-concepts.md defines the conceptual vocabulary of Clarity Loop. The
reference file convention is a new concept that contributors need to understand.

**Proposed** (new section):

> ## Reference File Structure
>
> Reference files are the mode instruction files that skills load when a mode is invoked.
> Each reference file follows one of two template tiers:
>
> - **Tier 1: Structured** — Deterministic modes with fixed step sequences
> - **Tier 2: Guided** — Judgment-driven modes with flexible execution
>
> All reference files begin with YAML frontmatter and a Variables table. This allows quick
> scanning of a mode's interface without reading the full file.
>
> See SYSTEM_DESIGN.md Section 1 (Reference File Convention) for the full specification.

### Changes 4–7: SKILL.md Frontmatter Parsing Instruction

**What**: Add a single instruction to each SKILL.md's Session Start section telling the
agent to read reference file frontmatter.

**Why**: Reference file frontmatter is a Clarity Loop convention, not a Claude Code
convention. The agent must be explicitly told to parse it. (Research Finding 3.)

**Current** (example from cl-reviewer SKILL.md Session Start):
> The section instructs the agent to read DECISIONS.md, check PARKING.md, and check
> pipeline status. No mention of reference file frontmatter.

**Proposed** (addition to Session Start, after existing instructions):

> **Reference file convention**: When loading a reference file, read its YAML frontmatter
> to understand the mode's tier (structured or guided), dependencies, and state files.
> Follow the file's Workflow section (Tier 1: Structured) or Process section (Tier 2:
> Guided). Consult the Variables table for the mode's inputs and outputs.

Same one-line addition to all 4 SKILL.md files.

### Changes 8–42: Reference File Reformats

**What**: Restructure all 35 reference files to follow the appropriate tier template.
No behavioral changes — same instructions, reorganized into consistent structure.

**Why**: Eliminates agent behavior variance (Research Finding 1), enables quick-scan
capability (Research Finding 4), and prepares for future fan-out aggregation (Research
Finding 6).

**The transformation for each file follows this pattern**:

#### Tier 1: Structured File Transformation

1. **Add YAML frontmatter**: Extract mode name, determine tier, identify dependencies
   from existing prose, list state files
2. **Extract Variables table**: Read through the file, identify every input the mode reads
   or writes, create a 4-column table (Variable, Source, Required, Description)
3. **Restructure into Workflow**: Convert existing Step N headings to `### Phase N: [Name]`
   with globally numbered steps. Add `**Verify**:` checkpoints after action steps. Move
   error handling inline as `**On failure**:` blocks.
4. **Add Report section**: Extract existing output template from embedded code block, add
   output path, add `### On [condition]` variants with parseable summary lines
   (`VERDICT: VALUE | Key: Value`)

#### Tier 2: Guided File Transformation

1. **Add YAML frontmatter**: Same as Tier 1
2. **Extract Variables table**: Same as Tier 1
3. **Add Guidelines section**: Extract scattered guidelines/rules from prose into a single
   numbered list
4. **Restructure into Process**: Convert existing headings to `### Phase N: [Name]`.
   Add `**Checkpoint**:` at phase boundaries. Keep prose descriptions — do not force
   into numbered steps.
5. **Add Output section**: Add primary artifact path and list of additional outputs

#### Before/After: merge-mode.md (Tier 1)

**Before** (first ~40 lines):
```markdown
## Merge Mode

Merge mode is the missing link between an APPROVE verdict and the verify step. When a
proposal is approved, someone still needs to actually apply the changes to system docs.
That's what merge mode does...

### When to Use

Merge mode triggers when:
- The user says "merge", "apply this proposal"...

### Prerequisites

Before merging, verify:
1. **The proposal exists** — Read the proposal file from `docs/proposals/`
2. **An APPROVE verdict exists** — Read the latest `REVIEW_P-NNN_v*.md`...
3. **APPROVE WITH CHANGES conditions are met** — If the verdict was APPROVE WITH CHANGES...
4. **No conflicting merges** — Check `docs/PROPOSAL_TRACKER.md`...

### Process

#### Step 1: Build the Merge Plan

Read the proposal's **Change Manifest**...
```

**After**:
```markdown
---
mode: merge
tier: structured
depends-on:
  - verify-mode.md
state-files:
  - PROPOSAL_TRACKER.md
  - DECISIONS.md
---

## Merge Mode

Merge mode is the missing link between an APPROVE verdict and the verify step. When a
proposal is approved, someone still needs to actually apply the changes to system docs.
That's what merge mode does...

### When to Use

[unchanged]

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| PROPOSAL_FILE | User argument or PROPOSAL_TRACKER.md (status: `approved`) | Yes | Path to the proposal file |
| LATEST_REVIEW | Auto-resolved: highest version `REVIEW_P-NNN_v*.md` in reviews/proposals/ | Yes | Latest review with APPROVE verdict |
| CHANGE_MANIFEST | Extracted from PROPOSAL_FILE "Change Manifest" section | Yes | Table mapping changes to target docs |
| PROPOSAL_TRACKER | `{docsRoot}/PROPOSAL_TRACKER.md` | Yes | Read: conflicting merges. Write: status → `merged` |
| DECISIONS_MD | `{docsRoot}/DECISIONS.md` | Yes | Write: propagate design decisions, log conflicts |
| DOCS_ROOT | `.clarity-loop.json` `docsRoot` field, default: `docs/` | Yes | Base path for documentation |

## Workflow

### Phase 1: Prerequisites

1. Read PROPOSAL_FILE. Extract CHANGE_MANIFEST.
2. Read LATEST_REVIEW. Confirm verdict is APPROVE or APPROVE WITH CHANGES.
   - If APPROVE WITH CHANGES: verify specified changes have been made since the review.
   - **On failure**: "This proposal hasn't been reviewed yet. Run `/cl-reviewer review` first."
3. Read PROPOSAL_TRACKER. Confirm no other proposals have status `merging`.
   - **On failure**: "Another merge is in progress (P-NNN). Only one merge at a time."
4. **Verify**: All prerequisites confirmed.

### Phase 2: Merge Plan

5. Present the merge plan to user (table from CHANGE_MANIFEST).
6. Wait for explicit user approval.
   - **On rejection**: Stop. No changes made.

### Phase 3: Pre-Apply Validation

7. For each item in CHANGE_MANIFEST, read target file and confirm:
   a. Target section exists at stated location
   b. Content broadly matches proposal's "Current" description
8. **Verify**: All targets confirmed.
   - **On clean**: Auto-proceed: "Pre-apply validation: N/N targets confirmed."
   - **On issues**: Present validation report. Wait for user decision.

[...remaining phases follow same pattern, preserving all existing instructions...]

## Report

Output: System doc edits (no standalone report file — triggers verify mode)

### On success

```
MERGE: COMPLETE | Changes: N/N applied | Conflicts: 0
```

### On partial failure

```
MERGE: PARTIAL | Changes: M/N applied | Failed at: #X | Reason: [reason]
```
```

#### Before/After: audit-mode.md (Tier 2)

**Before** (opening):
```markdown
## Audit Mode

A rigorous, comprehensive review of the entire system documentation set...

### Step 1: Load Everything

1. **Read every file in `docs/system/`** — Dispatch subagents in parallel...
2. **Read all previous audit reports**...
```

**After**:
```markdown
---
mode: audit
tier: guided
depends-on: []
state-files:
  - PARKING.md
  - DECISIONS.md
---

## Audit Mode

A rigorous, comprehensive review of the entire system documentation set...

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| SYSTEM_DOCS | All `*.md` in `{docsRoot}/system/` (excluding .manifest.md) | Yes | Every system doc, read fresh |
| PREVIOUS_AUDITS | All `AUDIT_*.md` in `{docsRoot}/reviews/audit/` | No | Prior audits for drift analysis |
| RESEARCH_HISTORY | All files in `{docsRoot}/research/` | No | Research docs for change sequence |
| PROPOSAL_HISTORY | All files in `{docsRoot}/proposals/` | No | Proposals for change sequence |
| DOCS_ROOT | `.clarity-loop.json` `docsRoot`, default: `docs/` | Yes | Base path |

## Guidelines

1. This is the most expensive operation in the pipeline. Read ALL system docs fresh —
   do not rely on the manifest cache.
2. Dispatch subagents for parallel analysis where dimensions are independent.
3. Depth per dimension should scale with findings — spend more time where problems surface.
4. External research (web search) is required for technical correctness verification.
5. If previous audits exist, include drift analysis comparing trends across audits.

## Process

### Phase 1: Load Everything

[Existing Step 1 content, preserved as prose — not forced into numbered steps]

**Checkpoint**: All system docs loaded. Previous audits loaded. Ready for analysis.

### Phase 2: Eight-Dimension Analysis

[Existing Step 2 content with all 8 dimensions, preserved as prose with judgment flexibility]

**Checkpoint**: All dimensions analyzed. Findings collected.

### Phase 3: Report Generation

[Existing Step 3 content]

**Checkpoint**: Report written. Tracking updated.

## Output

**Primary artifact**: `{docsRoot}/reviews/audit/AUDIT_[YYYY-MM-DD].md`

**Additional outputs**:
- PARKING.md: New emerged concepts (if any)
- DECISIONS.md: Audit judgment entries

**Output structure**: See the report template in Phase 3.
```

#### Before/After: design-checklist.md (Tier 2 — Rules/Checklist pattern)

**Before** (opening):
```markdown
## Design Checklists

Gate checklists for tokens and mockups modes. The skill self-assesses each item, then
presents the checklist to the user...

## Checkpoint Tiering

Not all decisions deserve the same level of attention. The tier system controls when
the pipeline stops for user input:

| Tier | Behavior | Examples |
|------|----------|---------|
| **Tier 1 -- Must Confirm** | Pipeline stops. Waits for explicit user approval. | ... |
...

### Tokens Checklist

Run this checklist after completing tokens mode, before moving to mockups.

| # | Check | How to Verify | Tier |
|---|-------|---------------|------|
| 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section | 3 |
...
```

**After**:
```markdown
---
mode: design-checklist
tier: guided
depends-on:
  - tokens-mode.md
  - mockups-mode.md
state-files:
  - DESIGN_PROGRESS.md
  - DECISIONS.md
---

## Design Checklists

Gate checklists for tokens and mockups modes. The skill self-assesses each item, then
presents the checklist to the user...

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| DESIGN_SYSTEM | `{docsRoot}/specs/DESIGN_SYSTEM.md` | Yes | Token catalog + component catalog to verify against |
| DESIGN_PROGRESS | `{docsRoot}/DESIGN_PROGRESS.md` | Yes | Approval entries for checklist items |
| PRD_FEATURES | PRD feature list | Yes | Cross-reference for completeness checks |
| UX_AUTO_DEFAULTS | `.clarity-loop.json` `ux.autoDefaults` field | Yes | Controls which tiers auto-proceed |

## Guidelines

1. The tier system (Tier 1: Must Confirm, Tier 2: Batch Review, Tier 3: Auto-proceed)
   controls when the pipeline stops for user input.
2. The `ux.autoDefaults` config controls the auto-proceed boundary.
3. Every Tier 3 auto-proceed decision is logged to DECISIONS.md with `[auto-default]` tag.
4. The user can proceed with gaps if the project doesn't require full specification.

## Process

### Phase 1: Checkpoint Tiering Context

[Existing Checkpoint Tiering section — tier table, configuration, audit trail]

**Checkpoint**: Tier behavior understood. Auto-defaults config loaded.

### Phase 2: Tokens Checklist

[Existing Tokens Checklist table and gate semantics, preserved as-is]

**Checkpoint**: All 17 tokens items assessed. User approved (Item 17).

### Phase 3: Mockups Checklist

[Existing Mockups Checklist table and gate semantics, preserved as-is]

**Checkpoint**: All 17 mockups items assessed. User approved (Item 17).

## Output

**Primary artifact**: Checklist results presented to user inline (no standalone file).

**Additional outputs**:
- DESIGN_PROGRESS.md: Approval entries for passed items
- DECISIONS.md: `[auto-default]` entries for Tier 3 auto-proceeds
```

#### Before/After: research-template.md (Tier 2 — Template pattern)

**Before** (opening):
```markdown
# Research Doc Template

Use this template when generating research documents. Adjust section depth based on the
complexity of the research...

## Filename Convention

Use `R-NNN-TOPIC.md` format: `docs/research/R-NNN-TOPIC.md`
...

## Template

(Large markdown code block with the full research doc template)

## Section Guidance

**System Context is non-negotiable.**
**The Decision Log captures reasoning.**
...
```

**After**:
```markdown
---
mode: research-template
tier: guided
depends-on: []
state-files:
  - RESEARCH_LEDGER.md
---

# Research Doc Template

Use this template when generating research documents. Adjust section depth based on the
complexity of the research...

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| RESEARCH_LEDGER | `{docsRoot}/RESEARCH_LEDGER.md` | Yes | Check for next R-NNN ID |
| SYSTEM_CONTEXT | `{docsRoot}/system/.context/SYSTEM_CONTEXT.md` | Yes | System orientation for System Context section |
| RESEARCH_TOPIC | User conversation | Yes | Scoped research topic with constraints |

## Guidelines

1. System Context section is non-negotiable — the reviewer traces everything through it.
2. Take a position in Recommendations — listing options without a recommendation is a
   research failure.
3. Keep Options Analysis honest — don't stack the deck for the preferred option.
4. Open Questions are a feature — surface what you don't know.
5. Emerged Concepts keep the pipeline honest — capture ideas outside current scope.

## Process

### Phase 1: Filename Convention

[Existing Filename Convention section — R-NNN-TOPIC.md format, ledger lookup]

**Checkpoint**: Research ID assigned.

### Phase 2: Template Application

[Existing Template section — the full markdown template, preserved as a code block]

**Checkpoint**: Research doc structure populated.

### Phase 3: Section Guidance

[Existing Section Guidance — detailed per-section writing guidance]

**Checkpoint**: All sections completed per guidance.

## Output

**Primary artifact**: `docs/research/R-NNN-TOPIC.md`

**Additional outputs**:
- RESEARCH_LEDGER.md: New entry with research ID and topic
```

#### Migration Contract for Per-File Reformats

The 4 before/after examples above cover all structural patterns found in R-003 Finding 1:

| Pattern | Example File | Tier |
|---------|-------------|------|
| Step-based Pipeline | merge-mode.md | Tier 1: Structured |
| Judgment-driven Process | audit-mode.md | Tier 2: Guided |
| Rules/Checklist | design-checklist.md | Tier 2: Guided |
| Template | research-template.md | Tier 2: Guided |

**Per-file Variable extraction and Phase structure are determined during migration by the
executing agent**, following these patterns and examples. The transformation rules
(Tier 1: 4-step, Tier 2: 5-step) and these examples define the contract. The executing
agent reads each source file, identifies its structural pattern from the table above,
applies the matching transformation, and diffs the result against the original to confirm
no instructions were lost.

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Tier 1: Structured | Reference file template for deterministic pipeline modes with fixed step sequences | All SKILL.md files, SYSTEM_DESIGN.md S1, pipeline-concepts.md |
| Tier 2: Guided | Reference file template for judgment-driven modes with flexible execution | Same |
| Variables table | 4-column table (Variable, Source, Required, Description) declaring mode inputs | All reference files |
| Frontmatter | YAML block between `---` markers at top of reference files with mode metadata | All reference files, SKILL.md parsing instruction |
| Verify checkpoint | `**Verify**:` marker in Tier 1 workflows indicating a gate between steps | Tier 1 reference files |
| Phase checkpoint | `**Checkpoint**:` marker in Tier 2 processes indicating a gate between phases | Tier 2 reference files |
| Summary line | Parseable `VERDICT: VALUE | Key: Value` format in Tier 1 Report sections | Tier 1 reference files |

### Migration

**No behavioral migration needed.** This is a structural reformat. All instructions are
preserved — they move from scattered prose into defined sections. The agent will follow
the same steps and produce the same outputs.

**Risk**: During reformatting, instructions could be accidentally altered, dropped, or
moved to the wrong section. Mitigation: each reformatted file should be diffed against the
original to confirm no instructions were lost.

**Approach**: All 35 files are migrated in a single pass. This avoids a mixed-format state
where some files follow the new convention and others don't. The migration can be
parallelized — one subagent per skill handles that skill's reference files.

### Integration Points

**SKILL.md ↔ reference files**: SKILL.md loads reference files via `Read` tool. The only
integration change is adding the frontmatter parsing instruction to SKILL.md's Session
Start. Reference file loading mechanism is unchanged.

**Hooks**: No changes. The PreToolUse and PostToolUse hooks operate on system docs, not
reference files.

**Scripts**: No changes. init.js scaffolds the user's docs directory, not the plugin's
skill files.

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Two template tiers | One universal template; three tiers (adding a "reference" tier for non-workflow files) | One tier over-constrains judgment modes (bootstrap, audit, run). Three tiers adds complexity without benefit — non-workflow files (checklists, rules) fit naturally into Tier 2's flexible structure. |
| All-at-once migration | Priority waves (4 waves over weeks); purely opportunistic (migrate when touched) | User feedback: mixed-format state is worse than either state. Since this is reformatting (not behavior change), parallelized single-pass migration eliminates the mixed-format risk entirely. |
| Focused frontmatter (4 fields) | Minimal frontmatter (mode + tier only); no frontmatter; rich frontmatter (6 fields including inputs/outputs) | 4 fields (mode, tier, depends-on, state-files) provide essential metadata without duplicating the Variables table. Inputs and outputs are declared authoritatively in the Variables table — having them in frontmatter too creates two sources of truth that will drift. |
| Global step numbering (Tier 1) | Per-phase numbering (1.1, 1.2, 2.1) | Global numbering enables unambiguous cross-reference ("see step 6"). Per-phase numbering creates ambiguity. |
| Inline error handling (Tier 1) | Separate Error Handling section at end of file | Error handling belongs where the error occurs. The agent encounters the recovery instruction at the exact point of failure instead of scrolling to a separate section. |
| Audit-mode as Tier 2 | Tier 1 (it has Step headings and produces a structured report) | Despite having step headings, audit-mode's core value is judgment across 8 dimensions. Forcing it into rigid numbered steps would reduce audit quality. The structured report template works fine within Tier 2's Output section. |
| Variables always a table | Bulleted list for simple modes (2-3 inputs), table for complex | Consistency wins. Even modes with 2-3 inputs benefit from the Source and Required columns. A table with 3 rows is not heavy. |
| Summary line keys deferred | Standardize all keys upfront in this proposal | Per-mode keys are best defined during reformatting when the specific outputs are in context. The format (`VERDICT: VALUE | Key: Value`) is standardized; the specific keys per mode are defined in each file's Report section. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Reformatting accidentally changes instructions | Medium | High | Diff each reformatted file against original. Verify no instructions were lost or altered. |
| Frontmatter drifts from file body over time | Medium | Medium | Future lint script can validate consistency. Include in emerged concepts. |
| Two tiers confuse contributors | Low | Low | Tier assignment is documented per-file in SYSTEM_DESIGN.md S17. Borderline cases default to Tier 2. |
| Agent ignores frontmatter instruction | Low | Low | SKILL.md Session Start is read at the beginning of every session. If ignored, mode still works — frontmatter is supplementary, not critical path. |
| Summary lines become inconsistent across modes | Medium | Low | Format is standardized (`VERDICT: VALUE | Key: Value`). Specific keys vary by mode but follow the pattern. |

## Open Items

1. **Template file location**: Should the two template files (one per tier) be stored in
   the plugin root as `templates/structured-reference.md` and `templates/guided-reference.md`,
   or in a new `skills/.shared/` directory? This doesn't block the migration — it affects
   where contributors find the template when creating new modes.

2. **Pencil-specific files**: `pencil-templates.md` (1,107 lines of copy-paste code blocks)
   and `pencil-schema-quick-ref.md` (359 lines of property definitions) are pure reference
   data, not mode instructions. They get Tier 2 frontmatter and a Variables table (which
   may have zero entries). The reviewer should confirm this light touch is appropriate
   rather than creating a third tier.

## Appendix: Research Summary

R-003 analyzed all 35 reference files and identified 5 structural patterns (Step-based,
Phase-based, Template, Rules/Checklist, Loop-based) that map to 2 execution models
(deterministic pipeline vs. judgment-driven). The research designed 6 conventions
(frontmatter, Variables, Workflow, Report, error handling, verification checkpoints) and
produced literal template files for both tiers.

Key findings: (1) Current files have no quick-scan capability — agents must read entire
files to extract inputs. (2) One template doesn't fit all — two tiers respect the natural
split. (3) Frontmatter adds ~120 tokens per file, negligible cost. (4) Inline error
handling is more effective than separate sections. (5) The retrofit can be done all-at-once
since it's reformatting, not behavioral change.

The full research doc is at `docs/research/R-003-REFERENCE_FILE_TEMPLATE_CONVENTION.md`.
