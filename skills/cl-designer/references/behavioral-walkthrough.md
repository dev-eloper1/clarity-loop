---
mode: behavioral-walkthrough
tier: guided
depends-on:
  - mockups-mode.md
  - tokens-mode.md
state-files:
  - DESIGN_PROGRESS.md
  - DECISIONS.md
  - UI_SCREENS.md
---

## Behavioral Walkthrough

After visual approval, walk through each screen's behavioral requirements. This is a
conversation -- propose behaviors, ask clarifying questions, and record decisions. The
walkthrough extends the mockup feedback loop, not replaces it.

**Do NOT skip this step.** The walkthrough is what prevents the "looks right but works
wrong" failure mode. Without it, the implementer makes 50+ behavioral micro-decisions
per screen, many of which will be wrong.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Approved screen mockups | Pencil .pen file or markdown specs | Yes | Visually approved screens to walk through |
| DESIGN_PROGRESS.md | `{docsRoot}/designs/` | Yes | Tracks walkthrough status per screen |
| DECISIONS.md | `{docsRoot}/decisions/` | No | Existing decisions to inform behavioral defaults |
| PRD | `docs/system/` or equivalent | Yes | Feature requirements for interaction context |
| ux.reviewStyle | `.clarity-loop.json` | No | Review mode: `"batch"` (default) or `"serial"` |

## Guidelines

1. Do NOT skip the behavioral walkthrough. It prevents the "looks right but works wrong" failure mode.
2. The walkthrough is a conversation -- propose behaviors, ask clarifying questions, and record decisions.
3. Not every screen needs every state. Skip states that don't apply (e.g., a settings page with no data fetch doesn't need a loading state).
4. Pin down actual content for non-default states -- not "No items" but "Create your first task to get started".
5. For screens that share a layout pattern (e.g., all list views, all form pages), conduct the walkthrough on the first screen of each pattern, then confirm the pattern applies to similar screens.
6. Walkthrough decisions flow into UI_SCREENS.md when generating the output artifact.

## Process

### Phase 1: Review Style Selection

**Check the review style** from `.clarity-loop.json` (`ux.reviewStyle`):

**Batch mode (default)**: Generate behavioral specs for all screens at once using
DECISIONS.md entries to inform defaults. Present as a review table:

| Screen | States Defined | Key Interactions | Nav Context | Content Notes |
|--------|---------------|------------------|-------------|---------------|
| Dashboard | default, empty, loading, error | View task, filter | `/dashboard`, auth | Empty: "Create your first task" |
| Task List | default, empty (filtered), loading | Add, edit, delete, bulk | `/tasks`, auth | Filtered empty: "No tasks match" |
| Settings | default, saving, error | Edit prefs, toggle theme | `/settings`, auth | -- |

Gather batch feedback: "Dashboard empty state should have an illustration. Task List
needs an offline state. Rest looks good." Revise flagged items.

**Serial mode** (`ux.reviewStyle: "serial"`): Run the full conversational walkthrough
below per screen.

**Hybrid**: Batch-approve most screens, serial walkthrough for 1-2 complex screens.

**Checkpoint**: Review style determined and approach selected.

### Phase 2: Screen States

For each approved screen, identify all states it can be in:

| State | When It Occurs | What To Ask |
|-------|---------------|-------------|
| **Default (populated)** | Data loaded successfully | Already shown in the mockup |
| **Empty (first-use)** | New user, no data yet | "What should users see on first use? Onboarding? CTA?" |
| **Empty (filtered)** | Filters applied, no matches | "Different from first-use? 'No results' vs 'Create your first...'?" |
| **Loading** | Data being fetched | "Skeleton? Spinner? Progressive loading?" |
| **Error (fetch)** | Network/server failure | "Full-page error? Banner? Retry button? Cached data fallback?" |
| **Error (action)** | User action failed | "Toast? Inline error? Revert changes? Keep form data?" |
| **Partial** | Some data loaded, some pending | "Show available data? Loading indicator for missing parts?" |
| **Offline** | Lost connectivity | "Read-only? Queue actions? Warning banner? (Skip if N/A)" |
| **Permission denied** | Insufficient access | "Redirect? Explain? 'Contact admin'? (Skip if N/A)" |

Not every screen needs every state. Skip states that don't apply (e.g., a settings page
with no data fetch doesn't need a loading state).

**With Pencil**: Generate variant frames for the most important non-default states (empty,
loading, error at minimum). Show the user with `get_screenshot` and gather feedback. Use
the design system components (EmptyState, Skeleton, ErrorBanner, etc.) via `ref` nodes.

**Without Pencil**: Describe each state as structured text, referencing design system
components by name: "Empty state uses the EmptyState component with illustration and
'Create your first task' CTA button."

**Checkpoint**: All applicable screen states identified with user decisions recorded.

### Phase 3: Interaction Flows

Walk through each significant user interaction on the screen:

For each interaction, ask/propose:
- **Trigger**: What starts the interaction? (click, submit, drag, keyboard shortcut)
- **Happy path**: What happens on success? (optimistic update? loading then success? animation?)
- **Error path**: What happens on failure? (toast? inline error? revert? retry?)
- **Loading feedback**: Is there a loading indicator? Where? How long before timeout?
- **Result**: What changes on screen after the interaction completes?

Present interactions as a table for the user to confirm:

```
| User Action | Expected Behavior | Error Case |
|-------------|-------------------|------------|
| Click "Add Task" | Modal opens | -- |
| Submit form | Optimistic add to list, toast confirmation | Error toast, form data preserved |
| Delete item | Confirm dialog, then remove with undo toast | Error toast, item restored |
```

**Checkpoint**: All significant interactions documented with happy path, error path, and loading feedback.

### Phase 4: Navigation Context

For each screen, capture:
- **Route**: URL path (e.g., `/tasks`, `/tasks/:id`)
- **Auth required**: Yes/No/Optional
- **Back behavior**: Browser back? In-app back? Where does "back" go?
- **State persistence**: What's preserved when navigating away and returning? (scroll, filters, form data)
- **Focus on arrival**: Where does focus go when this screen loads? (heading, first interactive element, search input)

**Checkpoint**: Navigation context defined for all screens.

### Phase 5: Content Decisions

Pin down actual content for non-default states:
- Empty state copy (not "No items" -- actual text: "Create your first task to get started")
- Error message text (not "Error" -- actual text: "Couldn't load your tasks. Try again?")
- Confirmation dialog text (not "Are you sure?" -- actual text: "Delete 'Project Alpha'? This can't be undone.")
- Loading text if applicable ("Fetching your tasks..." vs. no text, just skeleton)
- Help text, tooltips, inline guidance

**Checkpoint**: Actual content text decided for all non-default states.

### Phase 6: Record and Continue

Record all walkthrough decisions in DESIGN_PROGRESS.md under the screen entry:

```markdown
### [Screen Name] -- Behavioral Walkthrough

**Screen States**: [list of applicable states with decisions]
**Interaction Flows**: [table of interactions]
**Navigation Context**: route, auth, back, persistence, focus
**Content Decisions**: [key copy for non-default states]
**Status**: Complete
```

These decisions flow into UI_SCREENS.md when generating the output artifact (see
mockups-mode.md "All Paths: Generate UI_SCREENS.md").

**Efficiency tip**: For screens that share a layout pattern (e.g., all list views, all
form pages), conduct the walkthrough on the first screen of each pattern, then confirm
the pattern applies to similar screens with brief per-screen adjustments.

**Checkpoint**: All walkthrough decisions recorded in DESIGN_PROGRESS.md.

## Output

- **Primary artifact**: Behavioral walkthrough entries in DESIGN_PROGRESS.md (per screen: states, interactions, navigation, content)
- **Additional outputs**: Pencil variant frames for non-default states (Pencil path), interaction flow tables
- **Downstream**: Decisions flow into UI_SCREENS.md generation in mockups mode
