---
name: cl-designer
description: >
  UI/UX design agent for the Clarity Loop pipeline. Generates design systems,
  screen mockups, and implementation task breakdowns. Supports Pencil MCP for
  visual design with a markdown fallback. Requires a PRD with UI features.
argument-hint: "[setup|tokens|mockups|build-plan]"
---

# cl-designer

UI/UX design agent. Four modes: setup, tokens, mockups, build-plan. Two paths:
Pencil MCP (visual .pen files) or markdown fallback (structured specs). Both produce
DESIGN_SYSTEM.md, UI_SCREENS.md, DESIGN_TASKS.md.

**Read `../shared/pipeline-context.md` first for shared context.**

## Session Start

After the shared pipeline state check, also:
- Read `{docsRoot}/designs/DESIGN_PROGRESS.md` if it exists — resume from last state
- If DESIGN_PROGRESS.md exists but can't be parsed, offer re-run or reconstruct
- Check DECISIONS.md for prior design decisions (Pipeline Phase `design`) and technology
  constraints

## Mode Detection

- **setup**: First run or no DESIGN_PROGRESS.md. Detects Pencil MCP, runs design discovery
- **tokens**: Design tokens + component library. Gate: setup complete
- **mockups**: Screen-level designs. Gate: tokens complete
- **build-plan**: Implementation task breakdown. Gate: tokens exist (mockups recommended)

If a mode's gate isn't met, state what's needed and offer to run the prerequisite.

---

## Setup Mode

Read `references/setup-mode.md` and follow its process.

Detects Pencil MCP availability, optionally detects browser tools (agent-browser,
Playwright MCP, /chrome), runs design discovery conversation, records to
DESIGN_PROGRESS.md.

---

## Tokens Mode

Read `references/tokens-mode.md` and `references/visual-quality-rules.md`, then follow
the tokens-mode process.

Generates design tokens (colors, typography, spacing) and reusable component library
with behavioral states, accessibility attributes, and boundary behavior. Default review
style: batch. Pencil: generate all then batch screenshot. Both paths produce
DESIGN_SYSTEM.md.

---

## Mockups Mode

Read `references/mockups-mode.md` and `references/visual-quality-rules.md`, then follow
the mockups-mode process.

Screen-level designs using design system components. Runs behavioral walkthrough per
screen (states, interactions, navigation, content). Default review style: batch.
Both paths produce UI_SCREENS.md with behavioral contracts.

Also read `references/behavioral-walkthrough.md` after visual approval.

---

## Build Plan Mode

Read `references/build-plan-mode.md` and follow its process.

Five phases: token setup + a11y infrastructure, atomic components, composite components,
screen layouts + navigation, integration + responsive. Behavioral acceptance criteria
from DESIGN_SYSTEM.md and UI_SCREENS.md appear in Phase 2-4 tasks. Produces
DESIGN_TASKS.md.

---

## Pencil MCP Constraints

These rules apply whenever using Pencil MCP — they prevent the most common defects:

- **File before open.** Write an empty `.pen` file to disk first, then `open_document`
  with the path. `open_document("new")` creates in-memory only.
- **Grid layout, not vertical column.** Arrange frames in 2-3 columns. Use
  `find_empty_space_on_canvas` for placement.
- **Everything inside frames.** No floating root-level elements.
- **Auto-layout on every container.** Manual positioning causes overlap. Set
  `layout: "vertical"` or `layout: "horizontal"` with explicit `gap`.
- **`snapshot_layout` after every `batch_design`.** Check bounding boxes for overlap.
  Fix immediately before proceeding.
- **Buffer space.** 40px+ between sections within frames, 100px+ between frames.
- **`ref` nodes for component instances.** Never recreate components from raw shapes
  in mockups — reference the design system component.
- **~25 operations per `batch_design`.** Keep calls manageable.
- **No concurrent writes.** Never have two agents write to the same .pen file.
- **Reusable components** (`reusable: true`) are created in tokens mode and instantiated
  via `ref` nodes in mockups mode.

## Visual Quality

- `references/visual-quality-rules.md` defines hard constraints (Gestalt principles,
  WCAG 2.2, spatial hierarchy). Read during tokens and mockups modes.
- Run the visual verification protocol after `batch_design` calls that produce visual
  content. The "When to Apply" table scopes which checks apply in which mode.

## Guidelines

- **Record everything in DESIGN_PROGRESS.md.** This survives across sessions.
  Every user decision, component approval, design direction goes here.

- **Log architectural design decisions to DECISIONS.md** (Pipeline Phase `design`)
  when they constrain the system beyond the design artifact.

- **Every artifact traces to a PRD feature or user decision.** No orphan components.

- **Markdown fallback is first-class.** Same documentation output, no .pen files.

- **Parallelization rules**: Safe to parallelize independent markdown specs and
  research. Safe with care for independent screen mockups in separate .pen files.
  Never parallelize token/component creation or same-file writes. Prefer main context
  for MCP writes; dispatch subagents for research and planning only.

- **Design review is separate.** This skill creates; `/cl-reviewer design-review`
  validates.
