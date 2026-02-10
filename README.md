# Clarity Loop

A spec-first documentation pipeline plugin for Claude Code. Iteratively research, review, and refine system documentation through structured gates until docs are precise enough to generate implementation specs.

## Philosophy

> **AI does the work. Humans make the calls. Files hold the truth.**

Six principles that shape every design decision in this plugin:

1. **React, don't originate.** The human never faces a blank page. The AI generates first — a token table, a screen mockup, a proposal draft — and the human reacts: "warmer blues", "too much spacing", "merge these sections." It's easier for humans to evaluate and refine than to create from scratch.

2. **Judgment is the bottleneck, not effort.** The pipeline minimizes human effort (the AI writes, researches, cross-references, tracks state) but maximizes human judgment (every gate is an approval, every artifact is reviewed). The human is the quality mechanism — the system does the work to make that judgment effective.

3. **The system remembers so the human doesn't have to.** Every decision is recorded with rationale in persistent files — DESIGN_PROGRESS.md, PROPOSAL_TRACKER.md, STATUS.md. Conversations are ephemeral; artifacts are permanent. If a session crashes or context compresses, the pipeline picks up from the last recorded state.

4. **Structured iteration beats one-shot generation.** No artifact is generated once and trusted. Everything loops: generate, present, feedback, refine. This is the antidote to AI slop — any single generation might be wrong, but structured iteration with human gates converges on quality.

5. **Process protects the product — proportionally.** System docs are pipeline-protected. You can't just edit them. But not everything needs the full pipeline — triage determines depth, corrections bypass research, trivial changes skip gates entirely. The ceremony matches the risk.

6. **Tools enhance, never gate.** Pencil MCP or markdown fallback, the documentation output is identical. The pipeline works with no specialized tools. Better tools add visual feedback loops, but the core value — vague idea to implementable spec — is always available.

## What It Does

Clarity Loop manages the lifecycle of system documentation through four skills:

| Skill | Command | What It Does |
|-------|---------|-------------|
| **doc-researcher** | `/doc-researcher` | Bootstrap initial docs, triage complexity, research topics, plan document structure, generate proposals |
| **doc-reviewer** | `/doc-reviewer` | Review proposals, fix review issues, re-review after fixes, merge approved proposals, verify merges, audit full doc sets, apply targeted corrections, check code-doc sync, review designs |
| **doc-spec-gen** | `/doc-spec-gen` | Generate structured specs from verified system docs, check cross-spec consistency |
| **ui-designer** | `/ui-designer` | Design discovery, generate design tokens and components, screen mockups, implementation task breakdown. Supports Pencil MCP (generate from scratch) and markdown fallback |

## Lifecycle

```
--- Getting started (new project or existing project without system docs) ---

/doc-researcher bootstrap              # Greenfield: conversation -> initial docs
/doc-researcher bootstrap              # Brownfield: import existing docs or generate from code

--- Normal pipeline (system docs exist) ---

Idea or problem
  |
  v
/doc-researcher research "topic"      # Triage (Level 0-3) + research
  |  <-- human discussion loop -->
  v
/doc-researcher structure              # Suggest doc structure, human confirms
  v
/doc-researcher proposal               # Generate proposal with Change Manifest
  |
  v
/doc-reviewer review                   # AI review (6 dimensions + spec-readiness)
  |  <-- fix loop -->
  |     /doc-reviewer fix              # Help resolve blocking issues
  |     (auto re-review after fixes)
  v
  APPROVE verdict
  |
  v
/doc-reviewer merge                    # Apply approved proposal to system docs
  |
  v
/doc-reviewer verify                   # Post-merge verification (auto-triggered by merge)
  |
  v
  ... repeat for all topics ...
  |
  v
  [optional: design phase — if system docs describe UI features]
  |
/ui-designer setup                     # Detect MCP (Pencil/none) + design discovery
  v
/ui-designer tokens                    # Design tokens + component library
  v
/ui-designer mockups                   # Screen mockups using design system
  v
/ui-designer build-plan                # Implementation task breakdown
  v
/doc-reviewer design-review            # Validate designs against PRD + internal consistency
  |
  v
/doc-spec-gen generate                 # Waterfall: generate specs from ALL verified docs
  v
/doc-spec-gen review                   # Cross-spec consistency check

--- Correction shortcut (when audit/review finds fixable issues) ---

/doc-reviewer audit                    # Finds: stale refs, terminology drift, etc.
  v
/doc-reviewer correct AUDIT_DATE.md    # Build manifest, user approves, apply fixes

--- Code-doc alignment check ---

/doc-reviewer sync                     # Full: check all doc claims against code
/doc-reviewer sync --since main~10     # Targeted: only areas where code changed
```

The correction path bypasses the full pipeline for targeted fixes where the diagnosis
is already clear. The audit report IS the research — no separate research cycle needed.

The sync check detects drift between what system docs claim and what the code actually
does. It produces an advisory report — findings feed into corrections or research cycles.

## Installation

### Local development

```bash
claude --plugin-dir ./clarity-loop
```

### From marketplace (when published)

```bash
claude plugin add clarity-loop
```

## Setup

After installing, initialize your project's doc structure:

```bash
# From your project root (preferred — cross-platform):
node clarity-loop/scripts/init.js

# Or via bash wrapper:
bash clarity-loop/scripts/init.sh
```

Init will check for existing directories that might collide with Clarity Loop's default
`docs/` structure. If collisions are found, you'll be prompted to choose an alternative
docs root (e.g., `clarity-docs`). The choice is saved to `.clarity-loop.json`.

This creates:

```
.clarity-loop.json            # Config file (commit to git)
docs/                         # Or your chosen docsRoot
  system/                     # Protected system docs (pipeline-managed only)
  research/                   # Research docs (R-NNN-slug.md)
  proposals/                  # Proposals (P-NNN-slug.md)
  reviews/
    proposals/                # Review artifacts (auto-generated)
    audit/                    # System audit reports + sync reports (auto-generated)
    design/                   # Design review artifacts (auto-generated)
  specs/                      # Generated specs (waterfall output)
  designs/                    # Design files (.pen, DESIGN_PROGRESS.md)
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
  STATUS.md
```

## Configuration

Clarity Loop stores its configuration in `.clarity-loop.json` at the project root:

```json
{
  "version": 1,
  "docsRoot": "docs"
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `version` | `1` | Config format version |
| `docsRoot` | `"docs"` | Base path for all documentation directories |

All documentation paths derive from `docsRoot`: `{docsRoot}/system/`, `{docsRoot}/research/`, `{docsRoot}/proposals/`, `{docsRoot}/RESEARCH_LEDGER.md`, etc.

**When to change `docsRoot`**: If your project already uses `docs/system/` for other purposes, change `docsRoot` to avoid collisions (e.g., `"clarity-docs"` or `".clarity-loop"`). The init script detects collisions and prompts you automatically.

**Commit this file to git** so all team members use the same docs root.

If `.clarity-loop.json` is missing or invalid, all tools fall back to the default `docs/` root.

## Getting Started

### Greenfield (new project, no docs)

```bash
node clarity-loop/scripts/init.js     # Scaffold directory structure
/doc-researcher bootstrap             # Conversation -> initial system docs
```

### Brownfield (existing project with docs)

```bash
node clarity-loop/scripts/init.js     # Scaffold directory structure (collision detection runs)
/doc-researcher bootstrap             # Will detect existing docs and offer to import
```

### Brownfield (existing code, no docs)

```bash
node clarity-loop/scripts/init.js     # Scaffold directory structure
/doc-researcher bootstrap             # Will analyze codebase and generate docs from conversation
```

After bootstrap, use the normal pipeline: `/doc-researcher research "topic"` to research changes, then proposal → review → merge → verify.

## Pipeline Depth

Not every change needs the full pipeline. Triage determines the right level:

| Level | When | Pipeline |
|-------|------|----------|
| **0 - Trivial** | Typo, config tweak | Direct edit (no pipeline) |
| **1 - Contained** | Single feature, clear scope | Research note -> system doc update |
| **2 - Complex** | Cross-cutting, multi-doc impact | Full: research -> proposal -> review -> merge -> specs |
| **3 - Exploratory** | Unclear idea, needs discovery | Extended research -> proposal -> review -> merge -> specs |

## Hooks

Two hooks (Node.js, cross-platform) enforce pipeline discipline:

- **protect-system-docs** (PreToolUse): Blocks direct edits to `{docsRoot}/system/` unless a valid `.pipeline-authorized` marker exists. Three operations can create the marker: bootstrap (initial doc creation), merge (applying approved proposals), and correct (targeted fixes from audit/review). The marker is temporary — created before edits, removed immediately after. Reads `docsRoot` from `.clarity-loop.json`.
- **generate-manifest** (PostToolUse): Auto-regenerates `{docsRoot}/system/.manifest.md` when system docs change. Reads `docsRoot` from `.clarity-loop.json`.

### Pipeline Authorization Marker

The file `{docsRoot}/system/.pipeline-authorized` is a structured marker that temporarily allows edits to system docs:

```
operation: bootstrap|merge|correct
source: [proposal ID, audit report, or "genesis"]
authorized_by: user
timestamp: [ISO 8601]
```

The marker is gitignored and should never persist across sessions. If a skill finds a stale marker on startup, it helps the user clean up or finish the interrupted operation.

## Tracking Files

| File | Purpose |
|------|---------|
| `RESEARCH_LEDGER.md` | All research cycles — ID, topic, type, status, open questions, discussion rounds |
| `PROPOSAL_TRACKER.md` | All proposals — ID, title, research ref, status, review round, dependencies, conflicts |
| `STATUS.md` | High-level dashboard — pipeline state, emerged concepts, research queue |

## Key Concepts

### System Doc Manifest

Instead of reading every system doc to orient, skills read `{docsRoot}/system/.manifest.md` — a lightweight auto-generated index with file metadata, section headings with line ranges, and cross-references. Skills then do targeted reads of only the sections they need.

### Change Manifest

Every proposal includes a Change Manifest — a table mapping each change to its target doc, section, change type, and research finding. This is the contract that reviewers verify and the verify step uses to confirm completeness.

### Emerged Concepts

During any pipeline phase, if a new idea surfaces that isn't tracked, it gets captured in STATUS.md. The emerged concepts table is a parking lot — concepts can be scoped into the research queue, deferred, or discarded.

### Waterfall Spec Generation

Specs are generated only after ALL system docs are complete and verified. No incremental spec merging — if docs change, specs regenerate from scratch.

## Project Structure

```
clarity-loop/
  .claude-plugin/
    plugin.json
  skills/
    doc-researcher/
      SKILL.md
      references/
        research-template.md
        proposal-template.md
        document-plan-template.md
        bootstrap-guide.md
    doc-reviewer/
      SKILL.md
      references/
        re-review-mode.md
        verify-mode.md
        audit-mode.md
        correction-mode.md
        merge-mode.md
        fix-mode.md
        sync-mode.md
        design-review-mode.md
    doc-spec-gen/
      SKILL.md
      references/
        spec-consistency-check.md
    ui-designer/
      SKILL.md
      references/
        setup-mode.md
        tokens-mode.md
        mockups-mode.md
        build-plan-mode.md
        design-checklist.md
  hooks/
    hooks.json
    config.js                   # Shared config loader (.clarity-loop.json)
    protect-system-docs.js      # PreToolUse hook (Node.js)
    generate-manifest.js        # PostToolUse hook (Node.js)
    protect-system-docs.sh      # Deprecated — kept for one release cycle
    generate-manifest.sh        # Deprecated — kept for one release cycle
  scripts/
    init.js                     # Init script (Node.js, cross-platform)
    init.sh                     # Thin wrapper calling init.js
  templates/
    research-ledger.md
    proposal-tracker.md
    status.md
  docs/
    DOC_PIPELINE_PLUGIN.md      # Design lineage
```

## License

MIT
