# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Clarity Loop** is a Claude Code plugin that manages a structured documentation pipeline — from vague idea to working code through research, reviewed documentation, visual design, and tracked implementation. It is NOT a standalone application; it runs inside Claude Code sessions as a set of skills, hooks, scripts, and templates.

**Core principle**: AI does the work. Humans make the calls. Files hold the truth.

## Architecture

### Plugin Structure

The plugin is registered via `.claude-plugin/plugin.json`. Skills are loaded from `skills/` at session start. Hooks run on every Edit/Write tool call.

**Four skills** (each is a SKILL.md + references/ directory):

| Skill | Modes | Role |
|-------|-------|------|
| `cl-researcher` | bootstrap, brownfield, triage, research, structure, proposal, context | Creates and evolves documentation |
| `cl-reviewer` | review, re-review, fix, merge, verify, audit, correct, sync, design-review | Gates and validates changes |
| `cl-designer` | setup, tokens, mockups, build-plan | UI/UX design generation |
| `cl-implementer` | spec, spec-review, start, run, autopilot, verify, status, sync | Spec generation and implementation tracking |

**Two hooks** (registered in `hooks/hooks.json`):

- **PreToolUse** (`protect-system-docs.js`): Blocks Edit/Write to `{docsRoot}/system/` unless a `.pipeline-authorized` marker exists with a valid operation (bootstrap, merge, correct). This is the protection model — system docs are pipeline-managed only.
- **PostToolUse** (`generate-manifest.js`): Auto-regenerates `{docsRoot}/system/.manifest.md` after any system doc is modified. The manifest contains section indexes, line ranges, cross-references, and a content hash.

### Configuration

`.clarity-loop.json` in the project root configures the plugin. All hooks and skills resolve paths through `hooks/config.js` → `loadConfig()` / `resolveDocPath()` / `resolveProtectedPaths()`.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `version` | number | `1` | Config schema version |
| `docsRoot` | string | `"docs"` | Root directory for pipeline docs (research, proposals, reviews, etc.) |
| `protectedPaths` | string[] | `null` | Directories protected from direct edits. When null, defaults to `["{docsRoot}/system"]`. Each entry is relative to the project root. |

Example — self-hosted plugin repo:
```json
{
  "version": 1,
  "docsRoot": "docs",
  "protectedPaths": ["skills", "hooks", "scripts", "templates", ".claude"]
}
```

Example — user project protecting additional source dirs:
```json
{
  "version": 1,
  "docsRoot": "docs",
  "protectedPaths": ["docs/system", "src/core", "config"]
}
```

User projects that omit `protectedPaths` default to protecting `docs/system/` — identical to the pre-`protectedPaths` behavior.

### Skill Architecture (Progressive Disclosure)

Each skill uses a two-level loading pattern:
- **SKILL.md**: Loaded at session start. Contains mode detection, gates, guidelines, and the overall process. The frontmatter `description` field controls auto-triggering.
- **references/*.md**: Loaded on-demand when a specific mode runs. Contains detailed step-by-step instructions. Skills explicitly say "read `references/X-mode.md` and follow its process."

This keeps context window usage low — only the relevant reference is loaded for the active mode.

### Protection Model

```
User tries to edit a file in a protected path (e.g. skills/cl-reviewer/SKILL.md)
  → PreToolUse hook fires
  → Resolves protected paths from config.protectedPaths (or defaults to {docsRoot}/system)
  → File matches a protected path → checks for .pipeline-authorized at project root
  → No marker → DENY with message explaining authorized operations
  → Marker exists with valid operation → ALLOW
```

Three operations can create the marker: `/cl-researcher bootstrap`, `/cl-reviewer merge`, `/cl-reviewer correct`. The marker is written to the project root as `.pipeline-authorized` and deleted after the operation completes.

### Per-Project Directory Structure (created by init.js)

When bootstrap runs, `scripts/init.js` scaffolds inside the user's project:

```
{docsRoot}/
  system/          # Protected system docs (PRD, ARCHITECTURE, TDD, etc.)
    .manifest.md   # Auto-generated index (gitignored)
  research/        # Research documents (R-NNN format)
  proposals/       # Proposals with Change Manifests (P-NNN format)
  reviews/
    proposals/     # Review artifacts (REVIEW_*, VERIFY_*)
    audit/         # System audit reports (AUDIT_*)
    design/        # Design review artifacts
  specs/           # Implementation specs and design specs
  designs/         # Design files (.pen, DESIGN_PROGRESS.md)
  context/         # Per-library context files (three-layer progressive disclosure)
  DECISIONS.md     # System-wide decision journal
  PARKING.md       # Parked findings, gaps, and ideas
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
```

### Key Pipeline Flows

**Research → Proposal → Review → Merge**:
Research doc created → user approves → proposal generated with Change Manifest → reviewer checks 6 dimensions → fix cycle until APPROVE → merge to system docs with authorization marker → post-merge verify → manifest regenerated.

**Design flow**: Setup (MCP detection + discovery) → Tokens (design system) → Mockups (screen-level) → Build Plan (task breakdown). Each stage has a generate → screenshot → feedback → refine loop.

**Implementation flow**: Waterfall gate (all system docs must be verified) → Spec generation (parallel, format-selected) → Cross-spec consistency check → Task queue generation (TASKS.md) → Run mode (reconcile → process → verify). Fix tasks trigger automatic re-verification of downstream completed tasks.

## Development

### No Build Step

This is a Claude Code plugin — pure markdown skills, Node.js hooks/scripts, and templates. No compilation, no dependencies to install, no test suite.

### Running Hooks Locally

```bash
# Test the protection hook (simulates a tool call)
echo '{"tool_name":"Edit","tool_input":{"file_path":"/path/to/docs/system/ARCHITECTURE.md"}}' | \
  node hooks/protect-system-docs.js

# Generate manifest manually
CLARITY_LOOP_PROJECT_ROOT=/path/to/project node hooks/generate-manifest.js --init

# Run init with custom project root
CLARITY_LOOP_PROJECT_ROOT=/path/to/project node scripts/init.js
```

### Environment Variables

| Variable | Used By | Purpose |
|----------|---------|---------|
| `CLAUDE_PLUGIN_ROOT` | hooks.json | Resolves hook script paths (set by Claude Code) |
| `CLARITY_LOOP_PROJECT_ROOT` | init.js, generate-manifest.js | Override project root (defaults to cwd) |

## Diagram Conventions

- **Use Mermaid** (`\`\`\`mermaid`) for all diagrams. Avoid ASCII art.
- **Always set `color:#000`** on styled nodes. Mermaid defaults to inheriting text color
  from stroke color, which produces unreadable text in dark mode (e.g., red text on light
  red background). Every `style` directive with a custom `fill` or `stroke` must include
  `color:#000` explicitly.
- **Use Tailwind-scale hex colors** for fills — they have enough contrast in both light and
  dark themes:
  - Success/added: `fill:#dcfce7,stroke:#16a34a,color:#000` (green-100/green-600)
  - Error/gap: `fill:#fee2e2,stroke:#b91c1c,color:#000` (red-100/red-700)
  - Info/neutral: `fill:#dbeafe,stroke:#2563eb,color:#000` (blue-100/blue-600)
  - Warning: `fill:#fef9c3,stroke:#ca8a04,color:#000` (yellow-100/yellow-600)
- **Avoid `<b>`, `<i>`, special characters in node text** — they render inconsistently
  across Mermaid viewers. Use plain text. If emphasis is needed, use CAPS or prefix labels
  (e.g., "NEW: ...", "GAP: ...").
- **Diagram types**: `flowchart` for flows, `graph` for architecture, `sequenceDiagram` for
  interactions, `erDiagram` for schemas, `stateDiagram-v2` for state machines.

## Key Design Decisions

- **Skills use markdown, not code.** SKILL.md files are prompts, not programs. They instruct Claude Code how to behave. References are loaded lazily to minimize context usage.
- **Protected paths are NEVER edited directly.** The PreToolUse hook enforces this. All changes go through the pipeline: research → proposal → review → merge. Even typo fixes. Which paths are protected is configured in `.clarity-loop.json`.
- **The manifest is the index.** Skills read `.manifest.md` to understand what system docs exist, their section structure, and cross-references — avoiding full reads of every doc.
- **Decisions persist across sessions.** DECISIONS.md is read at session start by every skill. Decisions constrain future work and prevent contradictions across context compressions.
- **Context files bridge LLM training gaps.** Per-library context in `{docsRoot}/context/` provides version-pinned, curated knowledge (correct imports, breaking changes, gotchas) that the LLM's training data gets wrong.

## Working on This Codebase

This repo is **self-hosted**: it uses its own pipeline to manage changes to `skills/`, `hooks/`, `scripts/`, and `templates/`. The `.clarity-loop.json` at the repo root sets `protectedPaths` to those directories, so direct edits are blocked by the hook.

The plugin is **not installed in this repo** (by design — installing it here would require reloading after every skill change). Instead, invoke the pipeline by reading the skill reference files directly and following their process. This works because skill files are just instructions to Claude, not compiled code.

### Invoking the Pipeline (No Slash Commands)

**When the hook blocks an edit to a protected path** — that's the signal to run the pipeline instead of editing directly. Read the appropriate reference and follow its process.

**Explicit invocations** — say any of the following and the mapped reference will be read and followed:

| What you say | Reference to read and follow |
|---|---|
| "triage [idea]" / "should I research this?" | `skills/cl-researcher/SKILL.md` → triage mode |
| "research [topic]" / "let's research..." | `skills/cl-researcher/references/research-template.md` |
| "create a proposal" / "let's propose..." | `skills/cl-researcher/SKILL.md` → proposal mode |
| "review the proposal" | `skills/cl-reviewer/references/review-mode.md` |
| "merge the proposal" / "apply [P-NNN]" | `skills/cl-reviewer/references/merge-mode.md` |
| "correct [issue]" / "small fix to..." | `skills/cl-reviewer/references/correction-mode.md` |
| "verify the merge" | `skills/cl-reviewer/references/verify-mode.md` |

**Always read `docs/DECISIONS.md` and `docs/RESEARCH_LEDGER.md` at the start of any pipeline operation** — decisions constrain what can be proposed, and the ledger shows what's already been researched.

### What Changes vs. What Stays the Same

The process is identical to any user project. The only difference:
- **Change Manifest targets are skill/hook files** (e.g., `skills/cl-reviewer/references/merge-mode.md`) instead of `docs/system/` files
- **Merge writes to those files directly** — no intermediate system doc layer
- **The `.pipeline-authorized` marker** lives at the project root, not inside a docs subdirectory

### Technical Notes

When modifying skills:
- Edit `SKILL.md` for changes to mode detection, gates, or guidelines that apply across modes
- Edit specific `references/*.md` files for mode-specific behavior changes
- The frontmatter `description` field in `SKILL.md` controls auto-triggering — changes here affect when the skill activates
- The `argument-hint` field shows available modes in autocomplete

When modifying hooks:
- Both hooks read from stdin (JSON with `tool_name` and `tool_input`) and must exit cleanly
- `protect-system-docs.js` outputs a JSON `permissionDecision: "deny"` to block; silent exit = allow
- `generate-manifest.js` writes directly to `{docsRoot}/system/.manifest.md`; it's idempotent
- Both use `hooks/config.js` for path resolution — always go through `loadConfig()`, never hardcode `docs/`

When modifying templates:
- Templates in `templates/` are copied once during init. Changes to templates don't affect existing projects.
- Templates include `<!-- clarity-loop-managed -->` markers used by collision detection.
