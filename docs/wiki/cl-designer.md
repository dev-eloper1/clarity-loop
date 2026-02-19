# cl-designer

The visual design skill. Bridges the gap between written requirements (PRD) and visual design artifacts through a conversational discovery process, design token generation, component libraries, screen mockups, and implementation task breakdowns.

**Command**: `/cl-designer [mode]`

---

## Modes

| Mode | Trigger | Gate |
|------|---------|------|
| `setup` | "setup design", "start UI design" | PRD with UI features must exist |
| `tokens` | "design tokens", "component library" | Setup must be complete |
| `mockups` | "screen mockups", "design screens" | Tokens must be complete |
| `build-plan` | "build plan", "design tasks" | Tokens must exist (mockups recommended) |

Modes must run in order. Each gate is enforced — you can't generate mockups without a design system.

---

## Two Paths

The skill works with or without visual design tools:

| Path | Requires | Produces |
|------|----------|---------|
| **Pencil** | [Pencil MCP](https://docs.pencil.dev/) running | `.pen` files with live visual artifacts + markdown specs |
| **Markdown fallback** | Nothing | Structured markdown specs only |

Both paths produce the same documentation output: DESIGN_SYSTEM.md, UI_SCREENS.md, and DESIGN_TASKS.md. Pencil adds the visual feedback loop — generate, screenshot, feedback, refine.

---

## Setup

The entry point. Detects available design tools and runs a discovery conversation.

### Phase 1: MCP Detection

The skill searches for Pencil MCP tools (`batch_design`, `get_screenshot`, `set_variables`, etc.) and probes with `get_guidelines("tailwind")` to verify they're responsive.

If Pencil is detected, you get visual artifacts. If not, the skill produces equivalent markdown specs and tells you: "No design MCP detected. I'll produce structured markdown specs. You can add Pencil later and regenerate."

### Phase 2: Design Discovery

A conversational process to establish the design direction. The skill asks (in order, stopping when it has enough):

**1. Visual references**
- Do you have screenshots or mockups to share?
- Using a specific component library? (shadcn/ui, Material UI, Ant Design, etc.)
  - If yes: researches the library's defaults, principles, and token values
- Inspiration apps or sites you admire?

**2. Design preferences** (skipped if answered by references)
- Overall aesthetic / mood
- Color preferences
- Typography direction
- Interaction patterns (keyboard-first, mouse-first, touch)
- Theme support (light, dark, both)
- Brand constraints

**3. Style guide** (Pencil path only)
- Fetches available style guide tags from Pencil
- Matches your preferences to relevant styles
- Shows results for your reaction

### Output

All decisions recorded in `docs/designs/DESIGN_PROGRESS.md` — MCP path, design direction, component library choices, user preferences. This file persists across sessions so progress is never lost.

---

## Tokens

Generates the design system foundation: color palette, typography scale, spacing system, and reusable components.

### Token Categories

| Category | Tokens Generated |
|----------|-----------------|
| **Colors** | Primary + shades (50-950), secondary, accent, neutral (grays), semantic (success/warning/error/info) |
| **Typography** | Font families (sans/mono/display), size scale (xs-4xl), weight scale, line heights |
| **Spacing** | Base unit (4px or 8px), scale (0.5x-16x) |
| **Other** | Border radius, shadows, transitions |
| **Themes** | Light/dark semantic color mappings (if multi-theme) |

Token values are derived from your discovery preferences and presented as a table for confirmation before any generation begins.

### Pencil Path

1. **Create .pen file** — named after your project (e.g., `todo-app.pen`, `hermit.pen`). One file for everything — tokens, components, and mockups share the same infinite canvas.

2. **Set design tokens** — calls `set_variables` to register all tokens in Pencil's variable system. Themes defined as variable axes.

3. **Generate token showcase** — creates visual sections on the canvas:
   - Color palette with labeled swatches
   - Typography scale with rendered samples
   - Spacing scale with sized blocks
   - All arranged in a **2-column grid** (not a vertical column)

4. **Visual feedback loop** — shows you each section via `get_screenshot`, gathers feedback, refines. One section at a time to avoid overwhelm.

5. **Generate reusable components** — creates components with `reusable: true` (critical — this registers them in Pencil's component library so mockups can reference them via `ref` nodes):
   - Minimum set: Button, Input, TextArea, Select, Checkbox, Card, Badge, Nav/Sidebar, Modal/Dialog, Toast/Alert
   - Project-specific components from PRD features
   - Each uses token variable references (not hardcoded values)

6. **Component feedback loop** — shows each component group, gathers feedback, refines.

### Markdown Fallback Path

Same token derivation and component planning, but outputs structured tables and component specifications directly into DESIGN_SYSTEM.md instead of visual artifacts.

### Output

Both paths generate `docs/specs/DESIGN_SYSTEM.md`:
- Token catalog (all values with source)
- Component catalog (name, variants, purpose, PRD feature reference)
- Theme information
- Traceability: which PRD features drove which components

---

## Mockups

Screen-level designs using the design system components.

### Screen Inventory

Reads your PRD to identify all screens/views needed, cross-references with the component catalog, and presents the inventory for your confirmation:

| Field | Example |
|-------|---------|
| Screen name | "Task Dashboard" |
| PRD features | "Task list, filtering, bulk actions" |
| Components used | Card, Badge, Button, Select, Nav |
| Navigation flow | "From Login → Dashboard, links to Settings" |

### Pencil Path

Mockups go on the **same .pen file** as tokens and components (one infinite canvas). The skill:

1. Creates top-level frames per feature area (e.g., "Auth Flow", "Dashboard", "Settings")
2. Arranges groups in a 2-column grid on the canvas
3. For each screen:
   - Creates a frame at viewport size (desktop: 1440x900, mobile: 390x844)
   - **Uses `ref` nodes** to instantiate design system components — never recreates from raw shapes
   - Adds realistic content (not "Lorem ipsum")
   - Runs `snapshot_layout` to detect overlaps before showing you
   - Shows `get_screenshot` for your feedback

Changes to a component in the design system propagate to every screen that references it — this is why `ref` nodes matter.

### Responsive States

If your PRD specifies responsive design:
- Generates frames at additional breakpoints (tablet, mobile)
- Documents layout changes per breakpoint
- Focus on what shifts: visibility changes, nav pattern changes, stacking order

### Output

Both paths generate `docs/specs/UI_SCREENS.md`:
- Screen-to-feature mapping
- Component usage per screen
- Navigation flow (Mermaid diagram)
- Responsive behavior per breakpoint
- Design file references

---

## Build Plan

Phased implementation task breakdown derived from design artifacts.

### Five Implementation Phases

| Phase | Contents | Dependencies |
|-------|----------|-------------|
| **1. Token/Theme Setup** | CSS custom properties, Tailwind config, theme provider | None |
| **2. Atomic Components** | Button, Input, Card — individual primitives | Phase 1 |
| **3. Composite Components** | Nav, Modal, Form groups — composed from atomics | Phase 2 |
| **4. Screen Layouts** | Full pages assembling components, routing | Phase 3 |
| **5. Interactive States** | Hover/focus/loading states, responsive, animations | Phase 4 |

### Task Format

Each task includes:

| Field | Description |
|-------|-------------|
| ID | `T-001`, `T-002`, etc. |
| Name | Imperative form ("Implement Button component") |
| Phase | 1-5 |
| Description | What to build with design context |
| Design reference | DESIGN_SYSTEM.md section or .pen node ID |
| Dependencies | Which tasks must complete first |
| Acceptance criteria | Concrete, verifiable conditions |
| Complexity | Simple / Medium / Complex |

### Output

Generates `docs/specs/DESIGN_TASKS.md` with:
- Mermaid dependency graph showing all phases and task relationships
- Summary table (tasks per phase)
- Full task list with all fields
- Implementation notes (cross-cutting concerns, testing approach, accessibility)

The plan is presented for your review — you can reorder, split, merge, or remove tasks before it's finalized.

---

## Pencil MCP Integration

For detailed Pencil setup instructions, see the [README](../README.md#pencil-mcp-setup).

### Key Behaviors

**File management**: One .pen file per project, named after the project. Everything (tokens, components, mockups) lives on the same infinite canvas. The file must be created on disk first (Write tool), then opened with `open_document`.

**Canvas layout**: Separate top-level frames per section, arranged in a 2-column grid. No single wrapper frame — each section is independently zoomable.

**Overlap prevention**: Auto-layout (`layoutMode: "VERTICAL"` or `"HORIZONTAL"` with explicit `gap`) on every container. `snapshot_layout` after every `batch_design` call to catch issues before showing screenshots.

**Reusable components**: Created with `reusable: true` during tokens mode. Referenced via `ref` nodes in mockups. Never recreated from raw shapes.

**Parallelization safety**: Never two agents writing to the same .pen file. Subagents handle planning; main context executes MCP operations.

---

## Progress Persistence

All decisions and progress are recorded in `docs/designs/DESIGN_PROGRESS.md`. If a session crashes or context compresses, the skill reads this file and resumes from the last recorded state. Sections tracked:

- Setup status and MCP path
- Design direction and user decisions
- .pen filename
- Token generation status and approvals
- Component list and approval status
- Mockup generation status per screen
- Build plan status

---

## Related

- [cl-reviewer](cl-reviewer.md#design-review) — Reviews design artifacts against PRD and for consistency
- [cl-implementer](cl-implementer.md) — Generates tech specs that reference design artifacts
- [cl-researcher](cl-researcher.md) — Creates the PRD that drives design decisions
- [Pipeline Concepts](pipeline-concepts.md) — How design fits in the overall pipeline
