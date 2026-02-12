# Proposal: Behavioral Specs + Design Phase

**Created**: 2026-02-11
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md
**Document Plan**: None (structure derived from research recommendations, Changes 1-7)
**Author**: Bhushan + AI Researcher
**Depends On**: P0 (SKILL_RENAME_AND_FOLD.md) — all file paths use the cl-* namespace; P0.5 (UX pattern infrastructure) — decision flow protocol, batch/serial/minimal review styles, tiered checkpoints, project profile system, generate-confirm pattern, warmth gradient, parallelization hints, and config keys (ux.reviewStyle, ux.profileMode, ux.autoDefaults, ux.parallelGeneration) are already applied to skill files

## Summary

This proposal adds behavioral specification capture to the Clarity Loop design phase. Today, the pipeline produces visually polished designs that behave incorrectly when assembled — the "looks right but works wrong" failure mode observed during real-world testing. The root cause: no stage of the pipeline has a dedicated place for behavioral specifications. Design is treated as purely visual, but design IS behavior.

The core change is a **behavioral walkthrough** integrated into mockups mode: after the user approves each screen's visual layout, the skill walks through screen states (empty, loading, error), interaction flows (what happens on click, on failure, on edge case), navigation context (route, auth, back behavior), and content decisions (actual copy for non-default states). With Pencil MCP, variant states are generated visually; without it, structured markdown captures the same decisions. This extends the mockup feedback loop by roughly 30-50% per screen but prevents the downstream behavioral chaos that currently requires extensive rework during implementation.

Supporting changes reinforce the behavioral foundation across the pipeline: component behavioral states in tokens mode, expanded design checklists, behavioral probing during bootstrap, an extended UI_SCREENS.md format for behavioral contracts, browser validation tooling for autopilot, and build plan restructuring that elevates behavior from a deferred Phase 5 concern to acceptance criteria in every phase.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|---|---|---|
| docs/research/PIPELINE_GAP_ANALYSIS.md | F1 (structural behavioral gap), F2 (design phase as optimal capture point), F3 (component behavioral states), F4 (mockups behavioral walkthrough), F5 (screen states / defensive UI), F6 (navigation), F7 (accessibility), F10 (edge cases / boundary conditions), F11 (responsive), F12 (animation), F13 (content strategy), F14 (browser validation tooling), F15 (testing strategy home), F16 (spec-testing duality) | Option B primary recommendation, Changes 1-7 (research priority group 1 + group 2 behavioral) |

## System Context

### Research Type: Evolutionary

This proposal modifies existing skill files to add behavioral specification capability. One new reference file is created (`skills/cl-designer/references/behavioral-walkthrough.md`) to house the behavioral walkthrough process, keeping mockups-mode.md within the ~3000 token budget. All changes integrate into the existing pipeline flow.

### Current State

| Artifact | Current State Summary | Sections Referenced |
|---|---|---|
| `skills/cl-designer/SKILL.md` | Defines four modes (setup, tokens, mockups, build-plan). Tokens and Mockups mode summaries mention batch/serial/minimal review styles (P0.5). Decision flow guideline added (P0.5). No behavioral specification in any mode. Build plan Phase 5 treats interactive states as an afterthought. | Mode Detection, Tokens Mode, Mockups Mode, Build Plan Mode, Guidelines sections |
| `skills/cl-designer/references/tokens-mode.md` | Generates components with visual variants (primary, secondary, ghost) and visual states (hover, focus, disabled appearance). Batch/serial/minimal review styles implemented for component validation (P0.5). Parallelization hints section added (P0.5). No behavioral states, no accessibility attributes, no boundary behavior. | Step 3 (Generate Reusable Components), Step 4 (Component Validation — batch/serial/minimal), Markdown Fallback Step 3, Parallelization Hints |
| `skills/cl-designer/references/mockups-mode.md` | Generates static screenshots of screens in their default populated state. Batch/serial/minimal review styles implemented for screen review (P0.5). A "Behavioral Walkthrough: Batch Mode" section already exists as a P0.5 stub (generate-confirm pattern for behavioral specs using DECISIONS.md defaults). Parallelization hints section added (P0.5). No full behavioral walkthrough process, no screen states, no navigation context, no content for non-default states. | Step 2 (Generate Mockups), Screen Review (batch/serial), Behavioral Walkthrough: Batch Mode, Parallelization Hints, All Paths: Generate UI_SCREENS.md |
| `skills/cl-designer/references/build-plan-mode.md` | Five phases: tokens, atomics, composites, screens, interactive states. Phase 5 is listed last as an afterthought. Acceptance criteria in Phase 2-4 are purely visual. | Step 2 (Generate Phased Task List), all five phase descriptions |
| `skills/cl-designer/references/design-checklist.md` | Checkpoint tiering system (Tier 1/2/3) implemented (P0.5). Tokens checklist: 8 items with tier assignments, zero behavioral or accessibility checks. Mockups checklist: 6 items with tier assignments, zero behavioral, empty state, or interaction checks. Has a P0.5 placeholder noting future P1 tier assignments for behavioral items. | Checkpoint Tiering, Tokens Checklist, Mockups Checklist |
| `skills/cl-designer/references/setup-mode.md` | Design discovery with generate-confirm pattern for preferences (P0.5). Reads DECISIONS.md before asking questions (P0.5). No behavioral questions (error handling, empty states, accessibility level). | Phase 2: Design Discovery, Step 2 (Design Preferences — Generate-Confirm) |
| `skills/cl-researcher/SKILL.md` | Bootstrap mode references `bootstrap-guide.md`. No behavioral probing in the skill itself. | Bootstrap Mode section |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation asks about workflows, integrations, architectural decisions, scope. Three-level project profile system (Level 1 Auto-Detect, Level 2 Quick Research, Level 3 Presets) implemented (P0.5). Defaults sheet with generate-confirm pattern (P0.5). Records decisions to DECISIONS.md with category tags and source attribution (P0.5). No dedicated behavioral, accessibility, resilience, content, or testing probing in the discovery conversation itself. | Greenfield Bootstrap, Step 2: Discovery Conversation, Step 2b: Project Profile Detection, Step 2c: Defaults Sheet |

### Proposed State

After this proposal is applied (on top of P0.5's UX infrastructure), the design phase becomes a behavioral specification capture point:

- **Tokens mode** generates components with behavioral state tables, accessibility attributes, keyboard interaction models, and boundary behavior alongside visual variants. The existing batch/serial/minimal review structure (P0.5) presents behavioral specs alongside visual specs in the same review flow.
- **Mockups mode** runs a behavioral walkthrough after each screen's visual approval: identifying screen states, walking through interactions, capturing navigation context, and pinning down content for non-default states. The walkthrough integrates with P0.5's review style system — batch mode uses the existing generate-confirm stub, serial mode uses the full conversational walkthrough.
- **UI_SCREENS.md** includes per-screen behavioral contracts: route/auth/focus metadata, screen states table, interaction flows table, and test scenarios.
- **Design checklists** include behavioral, accessibility, and content checks with tiered checkpoints (P0.5 Tier 1/2/3 system). Behavioral items are Tier 2 (Batch Review), accessibility details are Tier 3 (Auto-proceed), user approval remains Tier 1 (Must Confirm).
- **Bootstrap** asks high-level behavioral questions (error handling, accessibility, content tone, resilience, testing, responsive targets) during discovery conversation. Answers feed into P0.5's defaults sheet and DECISIONS.md using established category tags.
- **Build plan** distributes behavioral acceptance criteria across Phase 2-4 tasks instead of deferring to Phase 5. Phase 5 becomes "Integration Behavior + Responsive" for cross-screen flows only.
- **Autopilot** detects browser validation tools and can execute behavioral and accessibility tests.

## Change Manifest

> This is the contract between the proposal and the skill files. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|---|---|---|---|---|
| 1 | Add behavioral walkthrough reference pointers in mockups mode (Pencil and Markdown Fallback paths); consolidate P0.5 "Behavioral Walkthrough: Batch Mode" stub into pointer to new reference file | `skills/cl-designer/references/mockups-mode.md` | After "Screen Review" (Pencil Path), after "Step 2: Document Screens" (Markdown Fallback), replace existing "Behavioral Walkthrough: Batch Mode" section with pointer | Modify | F1, F2, F4, F5, F6, F13 |
| 1b | New reference file containing the full behavioral walkthrough process (screen states, interaction flows, navigation context, content decisions, batch/serial paths) | `skills/cl-designer/references/behavioral-walkthrough.md` | New file | Add Doc | F1, F2, F4, F5, F6, F13 |
| 2 | Add component behavioral states, accessibility, and boundary behavior to tokens mode | `skills/cl-designer/references/tokens-mode.md` | Step 3 (Generate Reusable Components), Step 4 (Component Validation — batch/serial/minimal), Markdown Fallback Step 3 | Modify | F3, F7, F10 |
| 3 | Add behavioral and accessibility items to tokens checklist with tier assignments; replace P0.5 placeholder | `skills/cl-designer/references/design-checklist.md` | Tokens Checklist | Add + Modify | F3, F7, F10 |
| 4 | Add behavioral, empty state, interaction, and navigation items to mockups checklist with tier assignments; replace P0.5 placeholder | `skills/cl-designer/references/design-checklist.md` | Mockups Checklist | Add + Modify | F4, F5, F6, F13 |
| 5 | Add behavioral probing questions to bootstrap discovery conversation | `skills/cl-researcher/references/bootstrap-guide.md` | Greenfield Bootstrap, Step 2: Discovery Conversation | Add | F1, F7, F9, F11, F13, F15 |
| 6 | Extend UI_SCREENS.md format with behavioral contracts | `skills/cl-designer/references/mockups-mode.md` (Screen Details template in "All Paths: Generate UI_SCREENS.md") and `skills/cl-designer/references/behavioral-walkthrough.md` (walkthrough output format reference) | All Paths: Generate UI_SCREENS.md, behavioral walkthrough output | Modify | F4, F5, F6, F13, F16 |
| 7 | Add autopilot browser validation tooling section | `skills/cl-designer/SKILL.md` | Guidelines | Add Section | F14 |
| 8 | Restructure build plan phases with behavioral acceptance criteria | `skills/cl-designer/references/build-plan-mode.md` | Step 2 (Generate Phased Task List) — all five phase descriptions | Modify | F1, F4, F7 |
| 9 | Update SKILL.md mockups mode summary to mention behavioral walkthrough | `skills/cl-designer/SKILL.md` | Mockups Mode section | Modify | F4 |
| 10 | Update SKILL.md build plan mode summary to reflect restructured phases | `skills/cl-designer/SKILL.md` | Build Plan Mode section | Modify | F1, F4 |
| 11 | Update SKILL.md tokens mode summary to mention behavioral states | `skills/cl-designer/SKILL.md` | Tokens Mode section | Modify | F3 |
| 12 | Add DESIGN_SYSTEM.md component behavioral states format | `skills/cl-designer/references/tokens-mode.md` | All Paths: Generate DESIGN_SYSTEM.md | Modify | F3, F7 |

**Scope boundary**: This proposal ONLY modifies the files listed above. It does NOT modify:
- `skills/cl-implementer/` (autopilot-mode.md changes are deferred to P2: Testing Pipeline)
- `skills/cl-reviewer/` (design-review enhancements are out of scope)
- `docs/cl-designer.md` or `docs/cl-implementer.md` (public-facing docs updated separately after skill changes land)
- Any spec generation files (deferred to P2/P3)

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|---|---|---|
| SKILL_RENAME_AND_FOLD.md (P0) | All target files (renamed from doc-* to cl-*) | P0 must merge first. This proposal uses cl-* names throughout. |
| P0.5 (UX Pattern Infrastructure) | tokens-mode.md (Step 4 renamed to Component Validation, batch/serial/minimal added), mockups-mode.md (Screen Review batch/serial added, Behavioral Walkthrough: Batch Mode stub added, Parallelization Hints added), design-checklist.md (Tier column added, P1 tier placeholders added), SKILL.md (review style mentions in Tokens/Mockups summaries, decision flow guideline added), bootstrap-guide.md (profile system added, defaults sheet added), setup-mode.md (generate-confirm pattern, DECISIONS.md reads) | P0.5 must merge first. This proposal builds on P0.5 infrastructure: behavioral walkthrough uses the review style system, new checklist items use tiered checkpoints, bootstrap questions integrate with the defaults sheet pattern, DECISIONS.md category tags are used for behavioral decisions. All "Current" sections reflect post-P0.5 state. |
| CONTEXT_SYSTEM.md | None | No overlap. |
| IMPLEMENTER_SKILL.md | None | No overlap. |

No conflicts with in-flight proposals beyond the dependencies on P0 and P0.5.

## Detailed Design

### Change 1: Mockups Mode Behavioral Walkthrough (Pointers) + Change 1b: New Reference File

**What**: After the user approves each screen's visual layout, the skill runs a structured behavioral walkthrough. This is the single highest-impact change in this proposal. The full walkthrough process is housed in a new reference file (`references/behavioral-walkthrough.md`) to keep mockups-mode.md within the ~3000 token budget. mockups-mode.md contains brief pointers to the new file.

**Why**: Research Finding F4 identified that mockups mode generates a static screenshot, the user approves the visual, and moves on. The screen's behavior is never discussed. Finding F2 established that the design phase is the optimal capture point because users can point at elements and describe behavior concretely when looking at a screen. Finding F5 showed that every interactive screen has multiple states (empty, loading, error, partial, offline, permission denied) that collectively represent 60-80% of what users actually see — all unspecified today. Finding F6 identified that navigation behavior (routes, auth guards, back button, focus management) is never captured. Finding F13 showed that content for non-default states (error messages, empty state copy, confirmation dialogs) is never designed.

**Why extract**: mockups-mode.md is currently 334 lines. Inlining the full walkthrough process (~95 lines for Pencil path, ~15 for markdown fallback, plus the expanded batch mode content) would push it to ~450-460 lines, exceeding the ~3000 token budget established in this proposal's Context Budget section. The walkthrough content is self-contained and applies identically to both Pencil and markdown fallback paths, making extraction clean.

**Target files**: `skills/cl-designer/references/mockups-mode.md` (pointers), `skills/cl-designer/references/behavioral-walkthrough.md` (new file, full process)

**System doc impact**: Three changes to mockups-mode.md (pointers only), one new file.

---

**Change 1 — mockups-mode.md modifications (pointers only)**:

**Insertion Point A — Pencil Path, after "Screen Review" section (after the serial review and parallel screen generation subsections)**:

Add a brief pointer:

> #### Step 3: Behavioral Walkthrough (Per Screen)
>
> After visual approval, run the behavioral walkthrough for each screen. For the full
> walkthrough process, read `references/behavioral-walkthrough.md`.

**Insertion Point B — Markdown Fallback, after "Step 2: Document Screens" section**:

Add a brief pointer:

> #### Step 3: Behavioral Walkthrough (Per Screen)
>
> Same behavioral walkthrough process as the Pencil path. For the full walkthrough process,
> read `references/behavioral-walkthrough.md`. The only difference is that all states are
> described in structured text rather than generated as visual variants.

**Merge instruction — P0.5 "Behavioral Walkthrough: Batch Mode" stub consolidation**: During merge, replace the P0.5 "Behavioral Walkthrough: Batch Mode" stub in mockups-mode.md (lines ~201-225) with a reference pointer to `references/behavioral-walkthrough.md`. The new file incorporates and expands the stub content — the batch mode generate-confirm table, serial conversational walkthrough, and hybrid approach are all defined in the new reference file. The stub should be replaced with:

> #### Behavioral Walkthrough
>
> After screen review, run the behavioral walkthrough. Read
> `references/behavioral-walkthrough.md` for the full process, including batch mode
> (generate-confirm, default), serial mode (conversational, opt-in), and hybrid approaches.

This consolidation eliminates the structural ambiguity where the batch stub and the new Step 3 pointers could appear as disconnected sections. There is one walkthrough process, documented in one place, with three brief pointers from mockups-mode.md (Pencil path, markdown fallback, and the consolidated stub location).

---

**Change 1b — New file: `skills/cl-designer/references/behavioral-walkthrough.md`**:

This new reference file contains the full behavioral walkthrough process. It is loaded on-demand when the skill reaches Step 3 of mockups mode.

**Proposed** (full file content):

> ## Behavioral Walkthrough
>
> After visual approval, walk through each screen's behavioral requirements. This is a
> conversation — propose behaviors, ask clarifying questions, and record decisions. The
> walkthrough extends the mockup feedback loop, not replaces it.
>
> **Do NOT skip this step.** The walkthrough is what prevents the "looks right but works
> wrong" failure mode. Without it, the implementer makes 50+ behavioral micro-decisions
> per screen, many of which will be wrong.
>
> ---
>
> ### Review Style Integration
>
> **Check the review style** from `.clarity-loop.json` (`ux.reviewStyle`):
>
> **Batch mode (default)**: Generate behavioral specs for all screens at once using
> DECISIONS.md entries to inform defaults. Present as a review table:
>
> | Screen | States Defined | Key Interactions | Nav Context | Content Notes |
> |--------|---------------|------------------|-------------|---------------|
> | Dashboard | default, empty, loading, error | View task, filter | `/dashboard`, auth | Empty: "Create your first task" |
> | Task List | default, empty (filtered), loading | Add, edit, delete, bulk | `/tasks`, auth | Filtered empty: "No tasks match" |
> | Settings | default, saving, error | Edit prefs, toggle theme | `/settings`, auth | -- |
>
> Gather batch feedback: "Dashboard empty state should have an illustration. Task List
> needs an offline state. Rest looks good." Revise flagged items.
>
> **Serial mode** (`ux.reviewStyle: "serial"`): Run the full conversational walkthrough
> below per screen.
>
> **Hybrid**: Batch-approve most screens, serial walkthrough for 1-2 complex screens.
>
> ---
>
> ### 1. Screen States
>
> For each approved screen, identify all states it can be in:
>
> | State | When It Occurs | What To Ask |
> |-------|---------------|-------------|
> | **Default (populated)** | Data loaded successfully | Already shown in the mockup |
> | **Empty (first-use)** | New user, no data yet | "What should users see on first use? Onboarding? CTA?" |
> | **Empty (filtered)** | Filters applied, no matches | "Different from first-use? 'No results' vs 'Create your first...'?" |
> | **Loading** | Data being fetched | "Skeleton? Spinner? Progressive loading?" |
> | **Error (fetch)** | Network/server failure | "Full-page error? Banner? Retry button? Cached data fallback?" |
> | **Error (action)** | User action failed | "Toast? Inline error? Revert changes? Keep form data?" |
> | **Partial** | Some data loaded, some pending | "Show available data? Loading indicator for missing parts?" |
> | **Offline** | Lost connectivity | "Read-only? Queue actions? Warning banner? (Skip if N/A)" |
> | **Permission denied** | Insufficient access | "Redirect? Explain? 'Contact admin'? (Skip if N/A)" |
>
> Not every screen needs every state. Skip states that don't apply (e.g., a settings page
> with no data fetch doesn't need a loading state).
>
> **With Pencil**: Generate variant frames for the most important non-default states (empty,
> loading, error at minimum). Show the user with `get_screenshot` and gather feedback. Use
> the design system components (EmptyState, Skeleton, ErrorBanner, etc.) via `ref` nodes.
>
> **Without Pencil**: Describe each state as structured text, referencing design system
> components by name: "Empty state uses the EmptyState component with illustration and
> 'Create your first task' CTA button."
>
> ### 2. Interaction Flows
>
> Walk through each significant user interaction on the screen:
>
> For each interaction, ask/propose:
> - **Trigger**: What starts the interaction? (click, submit, drag, keyboard shortcut)
> - **Happy path**: What happens on success? (optimistic update? loading then success? animation?)
> - **Error path**: What happens on failure? (toast? inline error? revert? retry?)
> - **Loading feedback**: Is there a loading indicator? Where? How long before timeout?
> - **Result**: What changes on screen after the interaction completes?
>
> Present interactions as a table for the user to confirm:
>
> ```
> | User Action | Expected Behavior | Error Case |
> |-------------|-------------------|------------|
> | Click "Add Task" | Modal opens | — |
> | Submit form | Optimistic add to list, toast confirmation | Error toast, form data preserved |
> | Delete item | Confirm dialog, then remove with undo toast | Error toast, item restored |
> ```
>
> ### 3. Navigation Context
>
> For each screen, capture:
> - **Route**: URL path (e.g., `/tasks`, `/tasks/:id`)
> - **Auth required**: Yes/No/Optional
> - **Back behavior**: Browser back? In-app back? Where does "back" go?
> - **State persistence**: What's preserved when navigating away and returning? (scroll, filters, form data)
> - **Focus on arrival**: Where does focus go when this screen loads? (heading, first interactive element, search input)
>
> ### 4. Content Decisions
>
> Pin down actual content for non-default states:
> - Empty state copy (not "No items" — actual text: "Create your first task to get started")
> - Error message text (not "Error" — actual text: "Couldn't load your tasks. Try again?")
> - Confirmation dialog text (not "Are you sure?" — actual text: "Delete 'Project Alpha'? This can't be undone.")
> - Loading text if applicable ("Fetching your tasks..." vs. no text, just skeleton)
> - Help text, tooltips, inline guidance
>
> ### 5. Record and Continue
>
> Record all walkthrough decisions in DESIGN_PROGRESS.md under the screen entry:
>
> ```markdown
> ### [Screen Name] — Behavioral Walkthrough
>
> **Screen States**: [list of applicable states with decisions]
> **Interaction Flows**: [table of interactions]
> **Navigation Context**: route, auth, back, persistence, focus
> **Content Decisions**: [key copy for non-default states]
> **Status**: Complete
> ```
>
> These decisions flow into UI_SCREENS.md when generating the output artifact (see
> mockups-mode.md "All Paths: Generate UI_SCREENS.md").
>
> **Efficiency tip**: For screens that share a layout pattern (e.g., all list views, all
> form pages), conduct the walkthrough on the first screen of each pattern, then confirm
> the pattern applies to similar screens with brief per-screen adjustments.

---

**Insertion Point C — The existing "All Paths: Responsive States" section**: No change to the responsive section itself, but the behavioral walkthrough (Step 3) runs before responsive states are considered. The order becomes: Step 2 (generate screens) → Step 3 (behavioral walkthrough per screen) → responsive states → generate UI_SCREENS.md.

**P0.5 integration**: The P0.5 "Behavioral Walkthrough: Batch Mode" stub content is fully incorporated into the new `behavioral-walkthrough.md` file (see "Review Style Integration" section above, which includes the batch generate-confirm table, serial conversational walkthrough, and hybrid approach). The P0.5 parallelization hint ("While user reviews visual mockup batch, pre-generate ALL behavioral specs") applies to the expanded walkthrough and remains in mockups-mode.md's Parallelization Hints section.

**Dependencies**: Change 6 (UI_SCREENS.md format) must be applied simultaneously — the walkthrough output feeds into the extended format.

---

### Change 2: Component Behavioral States in Tokens Mode

**What**: Extend component generation to include a behavioral states table, accessibility attributes, keyboard interaction model, and boundary behavior alongside visual variants.

**Why**: Finding F3 established that components today have visual variants (primary, secondary, ghost) but no behavioral model — when is a button disabled? What does loading look like? What happens on click error? Finding F7 showed accessibility is entirely absent from component generation. Finding F10 showed edge cases like text truncation and overflow are never specified.

**Target file**: `skills/cl-designer/references/tokens-mode.md`

**System doc impact**: Three sections modified.

---

**Section: Pencil Path, Step 3 (Generate Reusable Components)**

**Current** (item 4 in the numbered list):
> 4. For each component:
>    - Create a labeled container group within its category frame
>    - Call `batch_design` with `reusable: true` — **this is critical.** [...]
>    - Apply tokens via variable references (not hardcoded values)
>    - Show all variants side-by-side within the container (e.g., Button: primary, secondary,
>      ghost — all in one row with labels)
>    - Keep operations to ~25 per `batch_design` call

**Proposed** (replace item 4):
> 4. For each component:
>    - Create a labeled container group within its category frame
>    - Call `batch_design` with `reusable: true` — **this is critical.** The `reusable` flag
>      registers the component in Pencil's component library. During mockups mode, screens
>      will use `ref` nodes to instantiate these components instead of recreating them from
>      scratch. A component created without `reusable: true` can't be referenced — it's just
>      a one-off group of shapes.
>    - Apply tokens via variable references (not hardcoded values)
>    - Show all variants side-by-side within the container (e.g., Button: primary, secondary,
>      ghost — all in one row with labels)
>    - Keep operations to ~25 per `batch_design` call
>    - **Generate behavioral state variants** for components that have significant states
>      beyond visual variants. Not every component needs this — focus on components with
>      loading, error, or disabled states that affect user interaction:
>      - **Button**: idle, loading (spinner variant), disabled. Show loading variant with
>        spinner replacing or overlaying text.
>      - **Input**: empty, focused, filled, error (with error message), disabled. Show
>        error variant with inline error text.
>      - **Form group**: pristine, dirty, submitting, error. At minimum show error state.
>      - **List/Table**: populated, empty (with empty state component), loading (skeleton rows).
>      - **Modal**: open state with focus trap indicator (visual note, not animation).
>      - **Toast/Alert**: visible state with variants (success, error, warning, info).
>      Place behavioral state variants in a separate row below the visual variants within
>      the component group, labeled "States". Use `snapshot_layout` to prevent overlap.

---

**Section: Step 4 (Component Validation) — Batch Review presentation**

P0.5 renamed Step 4 from "Visual Validation Loop" to "Component Validation" and restructured it into batch/serial/minimal review paths. The behavioral additions integrate into the existing review structure.

**Current** (Batch Review, item 2 — summary table):
> | Component | Variants | PRD Feature | Tokens Used | Status |
> |-----------|----------|-------------|-------------|--------|

**Proposed** (extend the summary table):
> | Component | Variants | PRD Feature | Tokens Used | Behavioral States | A11y | Status |
> |-----------|----------|-------------|-------------|-------------------|------|--------|
> | Button | primary, secondary, ghost | Task actions, forms | primary-500, space-3 | idle, loading, disabled | Enter/Space, aria-busy | Review |
> | Input | text, email, password | Forms, search | neutral-200, space-2 | empty, focused, error, disabled | aria-invalid, Tab | Review |

Add behavioral detail to the per-component presentation (both batch "revise flagged items" step and serial review path). When presenting a component, include:
>    - **Behavioral states**: Explain the state model. "Button has idle, loading, and
>      disabled states. Loading shows a spinner and prevents re-click. Disabled triggers:
>      [proposed triggers based on PRD context]."
>    - **Accessibility**: Note ARIA attributes and keyboard interaction. "Button uses
>      `aria-busy` during loading, `aria-disabled` when conditions aren't met. Activates on
>      Enter and Space."
>    - **Boundary behavior**: Note truncation/overflow strategy. "Text truncates with
>      ellipsis at container width. Minimum width: 80px."

---

**Section: Step 4 (Component Validation) — after batch "Record all decisions" step (item 5)**

Add new item 6:

> 6. **Capture behavioral specification per component** in DESIGN_PROGRESS.md:
>
>    ```markdown
>    ### [Component Name]
>    - **Approval**: [Approved | Needs changes]
>    - **Behavioral states**: [idle, loading, error, disabled — with triggers]
>    - **Accessibility**: [ARIA attributes, keyboard interaction, focus behavior]
>    - **Boundary behavior**: [truncation strategy, overflow, min/max constraints]
>    ```

---

**Section: Markdown Fallback Path, Step 3 (Document Components)**

**Current**:
> For each component identified from PRD features, document:
> - **Name**: Component name
> - **Purpose**: What it does, which PRD feature it serves
> - **Variants**: List of variants with descriptions
> - **Props/inputs**: What the component accepts (name, type, default)
> - **States**: Interactive states (default, hover, focus, disabled, error, loading)
> - **Token usage**: Which tokens the component uses (colors, spacing, typography)
> - **Visual description**: Textual description of appearance since no screenshot is available

**Proposed**:
> For each component identified from PRD features, document:
> - **Name**: Component name
> - **Purpose**: What it does, which PRD feature it serves
> - **Variants**: List of visual variants with descriptions (primary, secondary, ghost, etc.)
> - **Props/inputs**: What the component accepts (name, type, default)
> - **Visual states**: Appearance states (default, hover, focus, disabled)
> - **Behavioral states**: State machine with triggers and transitions:
>
>   | State | Trigger | Visual Change | Behavior |
>   |-------|---------|---------------|----------|
>   | idle | default | — | Clickable, accepts focus |
>   | loading | form submit / async action | Spinner, text change or overlay | Prevents re-click, `aria-busy="true"` |
>   | error | action failure | Error styling (red border, etc.) | Shows error message, allows retry |
>   | disabled | [condition from PRD context] | Reduced opacity | Not focusable via click, `aria-disabled="true"` |
>
>   Not every component needs all states. Focus on states that affect user interaction —
>   a Badge has no loading state. A Button does.
>
> - **Accessibility**: ARIA attributes, keyboard interaction, focus behavior:
>   - `role` (if not implicit from HTML element)
>   - Relevant ARIA attributes (e.g., `aria-expanded`, `aria-invalid`, `aria-busy`)
>   - Keyboard interaction: which keys do what (Enter, Space, Escape, Arrow keys)
>   - Focus behavior: is it focusable? Tab order? Focus trap (for modals)?
>
> - **Boundary behavior**:
>   - Truncation strategy (ellipsis, fade, word boundary, none)
>   - Overflow handling (scroll, wrap, hide)
>   - Min/max constraints (minimum width, maximum content length)
>
> - **Token usage**: Which tokens the component uses (colors, spacing, typography)
> - **Visual description**: Textual description of appearance since no screenshot is available

**Dependencies**: Change 12 (DESIGN_SYSTEM.md format) must be applied simultaneously so the behavioral states captured here flow into the output artifact.

---

### Change 3: Tokens Checklist Additions

**What**: Add behavioral, accessibility, and boundary behavior items to the tokens checklist.

**Why**: Finding F7 showed zero accessibility items in any checklist. Finding F3 showed component behavioral states aren't checked. Finding F10 showed boundary behavior isn't checked.

**Target file**: `skills/cl-designer/references/design-checklist.md`

**Current** (Tokens Checklist — post-P0.5, includes Tier column):
> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section | 3 |
> | 2 | Typography scale defined | Font families, size scale, weights, line heights | 3 |
> | 3 | Spacing scale defined | Base unit + scale documented | 3 |
> | 4 | Core components generated | Cross-reference PRD features | 2 |
> | 5 | Components use tokens (not hardcoded) | Pencil search or markdown check | 3 |
> | 6 | Each component reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 7 | DESIGN_SYSTEM.md generated | File exists with token + component catalog | 3 |
> | 8 | User approved | Explicit user confirmation | 1 |

**Proposed** (add behavioral/accessibility items with tier assignments, replace the P0.5 placeholder):
> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section | 3 |
> | 2 | Typography scale defined | Font families, size scale, weights, line heights | 3 |
> | 3 | Spacing scale defined | Base unit + scale documented | 3 |
> | 4 | Core components generated | Cross-reference PRD features | 2 |
> | 5 | Components use tokens (not hardcoded) | Pencil search or markdown check | 3 |
> | 6 | Each component reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 7 | Component behavioral states documented | Each interactive component has a state table (idle, loading, error, disabled) with triggers. Non-interactive components (Badge, Divider) may skip this. | 2 |
> | 8 | Interactive state triggers defined | For each behavioral state, the trigger condition is documented (e.g., "disabled when required fields empty") | 2 |
> | 9 | Contrast ratios verified | Text on backgrounds meets 4.5:1 ratio. UI components and graphical objects meet 3:1 ratio. Use token values to calculate or Pencil's contrast check if available. | 3 |
> | 10 | Keyboard interactions documented per component | Each interactive component documents which keys do what (Enter, Space, Escape, Arrow keys, Tab). Refer to WAI-ARIA Authoring Practices for standard patterns. | 3 |
> | 11 | Focus indicators defined | Design system includes focus indicator tokens (outline color, outline offset, outline width). Components show visible focus styling distinct from other states. | 3 |
> | 12 | Component boundary behavior specified | Each component documents truncation strategy (ellipsis, wrap, fade), overflow handling, and min/max constraints where applicable. | 3 |
> | 13 | DESIGN_SYSTEM.md generated | File exists at `{docsRoot}/specs/DESIGN_SYSTEM.md` with token catalog + component catalog + behavioral states | 3 |
> | 14 | User approved | Explicit user confirmation that the design system is ready for mockups | 1 |
>
> **Gate semantics**: Items 1–13 are self-assessed by the skill. Item 14 requires explicit user
> confirmation (Tier 1 — Must Confirm). Items 7-8 are Tier 2 (Batch Review) — generated in
> batch with other component specs, user flags issues. Items 9-12 are Tier 3 (Auto-proceed) —
> generated with sensible defaults, logged to DECISIONS.md with `[auto-default]` tag. The
> `ux.autoDefaults` config controls which tiers auto-proceed. If behavioral/accessibility gaps
> remain, present what's missing and ask: "These behavioral/accessibility gaps remain: [list].
> Proceed to mockups anyway, or address them first?" The user can choose to proceed with gaps
> if the project doesn't require full behavioral specification (e.g., a prototype).
>
> This replaces the P0.5 placeholder ("When P1's checklist items are added...") with the
> actual items and their tier assignments.

---

### Change 4: Mockups Checklist Additions

**What**: Add behavioral walkthrough, screen states, interaction flows, navigation context, and content items to the mockups checklist.

**Why**: Findings F4, F5, F6, F13 showed these concerns are entirely absent from the mockups gate check.

**Target file**: `skills/cl-designer/references/design-checklist.md`

**Current** (Mockups Checklist — post-P0.5, includes Tier column):
> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All major PRD views have mockups | Cross-reference PRD features | 2 |
> | 2 | Mockups use design system components | Pencil ref nodes or markdown refs | 3 |
> | 3 | Responsive states represented (if applicable) | Conditional check | 3 |
> | 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 5 | UI_SCREENS.md generated | File exists with screen-to-feature mapping | 3 |
> | 6 | User approved | Explicit user confirmation | 1 |

**Proposed** (add behavioral items with tier assignments, replace the P0.5 placeholder):
> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All major PRD views have mockups | Cross-reference PRD features | 2 |
> | 2 | Mockups use design system components | Pencil ref nodes or markdown refs | 3 |
> | 3 | Responsive states represented (if applicable) | Conditional check | 3 |
> | 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 5 | Behavioral walkthroughs completed for all screens | DESIGN_PROGRESS.md has walkthrough entries per screen. Each screen has screen states, interaction flows, navigation context, and content decisions recorded. | 2 |
> | 6 | Empty, loading, and error states addressed per screen | UI_SCREENS.md Screen States table exists for each screen with at minimum: empty (first-use or N/A), loading (or N/A), and error states defined. | 2 |
> | 7 | Key interaction flows documented with expected outcomes | UI_SCREENS.md Interaction Flows table exists for each screen with user actions, expected behavior, and error cases. | 2 |
> | 8 | Navigation context defined per screen | Each screen in UI_SCREENS.md has: route, auth requirement, back behavior, state persistence, and focus-on-arrival documented. | 2 |
> | 9 | Non-default state content defined | Empty state copy, error messages, and confirmation dialog text are actual text (not placeholders like "Error" or "No items"). | 2 |
> | 10 | UI_SCREENS.md generated | File exists at `{docsRoot}/specs/UI_SCREENS.md` with screen-to-feature mapping, behavioral contracts, and test scenarios | 3 |
> | 11 | User approved | Explicit user confirmation that mockups and behavioral specs are complete | 1 |
>
> **Gate semantics**: Items 1–10 are self-assessed. Item 3 is conditional — skip if not
> applicable. Items 5-9 are new behavioral checks at Tier 2 (Batch Review) — generated in
> batch, user reviews the set and flags issues. Item 11 is Tier 1 (Must Confirm). The
> `ux.autoDefaults` config controls which tiers auto-proceed. If behavioral gaps exist,
> present them and let the user decide whether to proceed: "These behavioral gaps remain:
> [list]. The build plan will have less behavioral detail for these screens. Proceed anyway?"
>
> This replaces the P0.5 placeholder ("When P1's checklist items are added...") with the
> actual items and their tier assignments.

---

### Change 5: Bootstrap Behavioral Probing Questions

**What**: Add behavioral, accessibility, content, resilience, testing, and responsive discovery questions to the bootstrap discovery conversation.

**Why**: Finding F1 showed the behavioral gap is structural — no pipeline stage asks behavioral questions. Finding F2 recommended bootstrap as a supplementary capture point for high-level behavioral philosophy. Findings F7, F9, F11, F13, F15 showed these categories are entirely unasked.

**Target file**: `skills/cl-researcher/references/bootstrap-guide.md`

**Current** (Greenfield Bootstrap, Step 2: Discovery Conversation, "Then dig deeper" section — post-P0.5):
> **Then dig deeper (conversational):**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - What's the scope? What's explicitly out of scope?

Note: P0.5 reorganized the discovery flow. After Step 2 (discovery conversation), Step 2b
runs project profile detection (Level 1 Auto-Detect, Level 2 Quick Research, Level 3 Presets),
then Step 2c generates a defaults sheet for batch review. The defaults sheet already covers
some behavioral categories (error handling, accessibility, content tone, resilience, loading
states, target devices) via presets and auto-detect. However, the discovery conversation
itself has no behavioral probing — it relies entirely on the profile system and presets to
surface these decisions, which means they appear as defaults rather than discovered through
conversation.

**Proposed** (add behavioral probing to the "Then dig deeper" section, before Step 2b):
> **Then dig deeper (conversational):**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - What's the scope? What's explicitly out of scope?
>
> **Behavioral and UX questions** (ask these as a natural continuation of the conversation,
> not as a separate checklist dump — adapt to context and skip what's not applicable):
> - How should the app handle errors? Toast notifications? Inline errors? Error pages?
>   (Establishes error handling philosophy — category: `errors`)
> - Should actions feel instant (optimistic updates) or show loading states?
>   (Establishes state management approach — category: `resilience`)
> - What happens when there's no data yet? Empty states with onboarding? Minimal
>   placeholders? (Establishes empty state philosophy — category: `content`)
> - What accessibility level are you targeting? WCAG 2.1 AA? 2.2? No specific target?
>   (Category: `accessibility` — this constrains design tokens and component specs)
> - Is this keyboard-first, mouse-first, or touch-optimized?
>   (Affects interaction patterns, component sizing, focus management — category: `accessibility`)
> - What's the app's voice — professional? Friendly? Minimal? Technical?
>   (Establishes content tone for error messages, empty states, help text — category: `content`)
> - How should the app handle being offline or network errors?
>   (Establishes resilience philosophy — category: `resilience`. Skip for server-only apps)
> - What's your testing philosophy? Specific framework? Coverage expectations?
>   (Category: `testing` — feeds into spec generation)
> - Target devices? Desktop only? Mobile? Both? Tablet?
>   (Establishes responsive targets — category: `responsive`)
>
> Not every project needs all of these. Server-side APIs don't need empty state philosophy.
> Simple tools don't need offline handling. Ask what's relevant to the project type. But
> **always ask about error handling and accessibility** — these affect every project.
>
> These conversational answers feed into Step 2b (profile detection) and Step 2c (defaults
> sheet). If the user answered a behavioral question here, the defaults sheet pre-fills that
> category with source `[from discovery]` instead of `[preset]` or `[research-generated]`.
> This means the user won't be re-asked the same question in the defaults sheet — their
> conversational answer takes precedence per the DECISIONS.md precedence rules.

**Dependencies**: None. This change is independent. It integrates naturally with the P0.5
defaults sheet — behavioral answers from discovery become inputs to the profile system.

---

### Change 6: UI_SCREENS.md Behavioral Contracts Format

**What**: Extend the per-screen format in UI_SCREENS.md to include route/auth/focus metadata, screen states table, interaction flows table, and test scenarios.

**Why**: Finding F4 established the behavioral walkthrough produces structured output per screen. Finding F5 showed screen states need a systematic format. Finding F6 showed navigation context is never captured in artifacts. Finding F16 showed every behavioral spec is also a test case — capturing them in UI_SCREENS.md creates a dual-purpose artifact.

**Target file**: `skills/cl-designer/references/mockups-mode.md` (the UI_SCREENS.md template in the "All Paths: Generate UI_SCREENS.md" section remains in mockups-mode.md since it's the output format, not the walkthrough process)

**Current** (All Paths: Generate UI_SCREENS.md — the per-screen format in the template):
> ```markdown
> ### [Screen Name]
>
> - **Features**: [PRD feature list]
> - **Route**: [URL path]
> - **Design reference**: [.pen node ID | "markdown"]
>
> **Component Usage**:
> | Component | Usage | Variant | Design System Ref |
> |-----------|-------|---------|------------------|
> | [name] | [how used] | [variant] | [DESIGN_SYSTEM.md section] |
>
> **Layout Structure**:
> [Brief description of layout hierarchy]
>
> **Responsive Behavior** (if applicable):
> | Breakpoint | Changes |
> |-----------|---------|
> | < 768px | [layout changes] |
> | < 1024px | [layout changes] |
>
> [Repeat for each screen]
> ```

**Proposed** (replace the per-screen format):
> ```markdown
> ### [Screen Name]
>
> - **Features**: [PRD feature list]
> - **Route**: [URL path] — **Auth**: [required | optional | none] — **Back**: [browser back to previous | in-app to parent]
> - **Focus on arrival**: [element that receives focus, e.g., page heading, search input, first list item]
> - **State persistence**: [what's preserved when navigating away and returning: scroll position, filter state, form data, etc.]
> - **Design reference**: [.pen node ID | "markdown"]
>
> **Component Usage**:
> | Component | Usage | Variant | Design System Ref |
> |-----------|-------|---------|------------------|
> | [name] | [how used] | [variant] | [DESIGN_SYSTEM.md section] |
>
> **Layout Structure**:
> [Brief description of layout hierarchy]
>
> **Screen States**:
> | State | Trigger | Visual | Content | Components Used |
> |-------|---------|--------|---------|-----------------|
> | Default | Data loaded | [default mockup ref] | — | [primary components] |
> | Empty (first-use) | No data | [variant ref or "described"] | "[actual copy, e.g., Create your first task]" | EmptyState, Button |
> | Empty (filtered) | No filter matches | [variant ref or "described"] | "[actual copy, e.g., No tasks match your filters]" | EmptyState |
> | Loading | Fetch in progress | [variant ref or "described"] | — | Skeleton |
> | Error | Fetch failed | [variant ref or "described"] | "[actual copy, e.g., Couldn't load tasks. Try again?]" | ErrorBanner, Button |
>
> States that don't apply to this screen are omitted (not marked N/A).
>
> **Interaction Flows**:
> | User Action | Expected Behavior | Error Case | Accessibility |
> |-------------|-------------------|------------|---------------|
> | [action] | [what happens — be specific] | [what happens on failure] | [focus, ARIA, keyboard notes] |
> | [action] | [behavior] | [error behavior] | [a11y notes] |
>
> **Test Scenarios** (derived from screen states and interactions):
> - [scenario: expected outcome]
> - [scenario: expected outcome]
> - [scenario: expected outcome]
>
> **Responsive Behavior** (if applicable):
> | Breakpoint | Changes |
> |-----------|---------|
> | < 768px | [layout changes] |
> | < 1024px | [layout changes] |
>
> [Repeat for each screen]
> ```

**Dependencies**: Change 1/1b (behavioral walkthrough) must be applied — the walkthrough produces the data that populates this format.

---

### Change 7: Autopilot Browser Validation Tooling

**What**: Add a section to cl-designer's SKILL.md Guidelines documenting the available browser validation tools and how to detect/use them during the design feedback loop.

**Why**: Finding F14 identified three browser automation tools available to Claude Code (agent-browser, Playwright MCP, /chrome) with different strengths. The design skill needs to know about these tools to offer enhanced validation when available — for example, running accessibility checks on Pencil-generated designs or validating behavioral states in the dev server during build plan execution.

**Note**: The full autopilot behavioral testing changes are deferred to P2 (Testing Pipeline), which modifies `skills/cl-implementer/references/autopilot-mode.md`. This change only adds tool awareness to cl-designer's guidelines for design-time validation.

**Target file**: `skills/cl-designer/SKILL.md`

**Current**: No browser validation tooling section exists in Guidelines.

**Proposed** (add new subsection at the end of Guidelines, after "Design review is separate"):

> ### Browser Validation Tools (Optional)
>
> Three browser automation tools may be available during design. Detection is optional —
> the design skill works without any of them. But when available, they enhance validation:
>
> **Detection** (run once during setup mode, record result in DESIGN_PROGRESS.md):
> 1. Check for `agent-browser`: `which agent-browser` — CLI tool, most context-efficient
> 2. Check for Playwright MCP: ToolSearch for `mcp__playwright__*` — most capable, cross-browser
> 3. Check for /chrome: ToolSearch for `mcp__claude-in-chrome__*` — built-in, no install
>
> **When useful during design**:
> - **Accessibility pre-check**: If a dev server is running and components are implemented,
>   inject axe-core to check contrast ratios and ARIA attributes before the user reviews.
>   This catches accessibility issues early rather than during implementation.
> - **Behavioral smoke test**: If the design skill is re-run after partial implementation
>   (e.g., to add a new screen), browser tools can verify existing screens still behave
>   correctly.
>
> **When NOT to use**: During initial design (no code exists yet). Browser tools are only
> useful when there's a running application to test against.
>
> Record the detected tool in DESIGN_PROGRESS.md so downstream skills (cl-implementer
> autopilot) know what's available without re-detecting.

**Dependencies**: None. This is an additive section.

---

### Change 8: Build Plan Phase Restructuring

**What**: Restructure the five build plan phases so behavioral acceptance criteria appear in Phase 2-4 tasks (not deferred to Phase 5), Phase 5 becomes "Integration Behavior + Responsive" for cross-screen flows only, accessibility tasks join Phase 1, and navigation/routing becomes a cross-cutting Phase 4 addition.

**Why**: Finding F1 established that deferring behavior to Phase 5 is the structural cause of the "looks right but works wrong" failure. Finding F4 showed behavioral contracts should be acceptance criteria for the components and screens that exhibit them. Finding F7 showed accessibility setup (focus indicators, contrast verification) should be Phase 1 infrastructure.

**Target file**: `skills/cl-designer/references/build-plan-mode.md`

**Current** (Step 2: Generate Phased Task List):
> #### Phase 1: Token/Theme Setup
> - Configure CSS custom properties or Tailwind theme values
> - Set up theme provider (if dark/light mode)
> - Create spacing/typography utility classes or tokens
> - One task per token category unless they're trivially small
>
> #### Phase 2: Atomic Components
> - Individual UI primitives (Button, Input, Select, Checkbox, Badge, etc.)
> - Each component is one task (or split if it has many complex variants)
> - Order by dependency — standalone components first, then ones that use others
>
> #### Phase 3: Composite Components
> - Components that compose atomics (Nav/Sidebar, Modal/Dialog, Form groups, etc.)
> - Each composite is one task
> - Dependencies on Phase 2 components are explicit
>
> #### Phase 4: Screen Layouts / Pages
> - Only generated if UI_SCREENS.md exists
> - Each screen is one task (or split for very complex screens)
> - Assembles components into page layouts
> - Includes routing setup if multiple screens
>
> #### Phase 5: Interactive States + Responsive Behavior
> - Hover, focus, active, disabled, loading, error states
> - Responsive breakpoint behavior
> - Animations and transitions
> - Can be one task per screen or grouped by interaction type

**Proposed** (replace all five phase descriptions):
> #### Phase 1: Token/Theme Setup + Accessibility Infrastructure
> - Configure CSS custom properties or Tailwind theme values
> - Set up theme provider (if dark/light mode)
> - Create spacing/typography utility classes or tokens
> - **Set up focus indicator tokens** (outline color, offset, width) as CSS custom properties
> - **Verify contrast ratios** of color token combinations (text on backgrounds: 4.5:1;
>   UI components: 3:1). If any fail, note in the task for user decision.
> - One task per token category unless they're trivially small
>
> #### Phase 2: Atomic Components (with behavioral states)
> - Individual UI primitives (Button, Input, Select, Checkbox, Badge, etc.)
> - Each component is one task (or split if it has many complex variants)
> - Order by dependency — standalone components first, then ones that use others
> - **Acceptance criteria include behavioral states from DESIGN_SYSTEM.md**: a Button task
>   includes "renders loading state with spinner, disables during loading, shows
>   `aria-busy` attribute" — not just "renders primary/secondary/ghost variants"
> - **Acceptance criteria include accessibility**: keyboard interaction (Enter/Space
>   activates), ARIA attributes (`aria-disabled`, `aria-busy`), focus visible styling
> - **Acceptance criteria include boundary behavior**: truncation, overflow handling,
>   min/max constraints from DESIGN_SYSTEM.md
>
> #### Phase 3: Composite Components (with interaction behavior)
> - Components that compose atomics (Nav/Sidebar, Modal/Dialog, Form groups, etc.)
> - Each composite is one task
> - Dependencies on Phase 2 components are explicit
> - **Acceptance criteria include composite behavioral contracts**: Modal traps focus and
>   returns on close; Form group tracks dirty/pristine/submitting states; Nav highlights
>   active route
> - **Acceptance criteria include accessibility**: focus trap for modals, `aria-expanded`
>   for dropdowns, `aria-current="page"` for active nav
>
> #### Phase 4: Screen Layouts / Pages + Navigation
> - Only generated if UI_SCREENS.md exists
> - Each screen is one task (or split for very complex screens)
> - Assembles components into page layouts
> - **Acceptance criteria include behavioral contracts from UI_SCREENS.md**: screen states
>   (empty, loading, error), interaction flows (form submission behavior, delete
>   confirmation), content for non-default states
> - **Navigation and routing as a cross-cutting task in this phase**: URL structure, route
>   guards, auth redirects, back behavior, focus management on navigation. If UI_SCREENS.md
>   has navigation context per screen, generate a routing task that covers the full URL
>   structure and auth requirements.
> - **Test scenarios from UI_SCREENS.md** become acceptance criteria: "submit empty form
>   → inline validation" is a verifiable condition
>
> #### Phase 5: Integration Behavior + Responsive
> - **Cross-screen behavioral flows** — interactions that span multiple screens: navigation
>   transitions, state persistence across routes, shared state (badge counts, filters),
>   unsaved changes warnings
> - Responsive breakpoint behavior (layout changes, feature adaptation, touch vs. mouse
>   differences if specified)
> - Animations and transitions (if specified in behavioral walkthrough or design tokens)
> - This phase is for behaviors that can't be verified in isolation — they require multiple
>   screens working together

Also modify the **Per task, include** section to update acceptance criteria description:

**Current**:
> - **Acceptance criteria**: Concrete, verifiable conditions for completion

**Proposed**:
> - **Acceptance criteria**: Concrete, verifiable conditions for completion. Must include
>   behavioral criteria from DESIGN_SYSTEM.md (component states, accessibility) and
>   UI_SCREENS.md (screen states, interaction flows, content) — not just visual rendering.
>   Each behavioral contract documented in the design artifacts becomes an acceptance
>   criterion in the build plan task.

**Dependencies**: Changes 1/1b, 2, and 6 must be applied first — the build plan references behavioral contracts from DESIGN_SYSTEM.md (Change 2) and UI_SCREENS.md (Changes 1/1b, 6).

---

### Change 9: SKILL.md Mockups Mode Summary Update

**What**: Update the Mockups Mode summary paragraph in SKILL.md to mention the behavioral walkthrough.

**Why**: The summary currently only mentions visual mockups. With the behavioral walkthrough, the mode produces both visual and behavioral artifacts.

**Target file**: `skills/cl-designer/SKILL.md`

**Current** (Mockups Mode section — post-P0.5, includes review style mention):
> ## Mockups Mode
>
> When running mockups mode, read `references/mockups-mode.md` and follow its process.
>
> Mockups mode creates screen-level designs using the design system components from tokens mode.
> Pencil generates layouts, markdown fallback documents layout hierarchy. Both paths produce
> UI_SCREENS.md.
>
> The default review style is **batch**: all screens are generated, then presented as a set.
> The user flags specific screens for revision. Serial review (one screen at a time) is
> available via `ux.reviewStyle` config.

**Proposed** (replace the summary paragraph, keep the review style paragraph):
> ## Mockups Mode
>
> When running mockups mode, read `references/mockups-mode.md` and follow its process.
>
> Mockups mode creates screen-level designs using the design system components from tokens mode,
> then runs a **behavioral walkthrough** per screen — capturing screen states (empty, loading,
> error), interaction flows (what happens on click, on failure), navigation context (route,
> auth, back behavior, focus), and content decisions (actual copy for non-default states).
> Pencil generates layouts and state variants, markdown fallback documents everything as
> structured specs. Both paths produce UI_SCREENS.md with behavioral contracts.
>
> The default review style is **batch**: all screens are generated, then presented as a set.
> The user flags specific screens for revision. Serial review (one screen at a time) is
> available via `ux.reviewStyle` config.

---

### Change 10: SKILL.md Build Plan Mode Summary Update

**What**: Update the Build Plan Mode summary paragraph to reflect the restructured phases.

**Why**: The summary currently describes Phase 5 as "interactive states" — the restructured plan distributes behavioral criteria across all phases.

**Target file**: `skills/cl-designer/SKILL.md`

**Current** (Build Plan Mode section):
> ## Build Plan Mode
>
> When running build plan mode, read `references/build-plan-mode.md` and follow its process.
>
> Build plan mode generates a phased implementation task breakdown from the design artifacts.
> Five phases: token setup, atomic components, composite components, screen layouts, interactive
> states. Each task maps to a design reference with dependencies and acceptance criteria.
> Produces DESIGN_TASKS.md.

**Proposed**:
> ## Build Plan Mode
>
> When running build plan mode, read `references/build-plan-mode.md` and follow its process.
>
> Build plan mode generates a phased implementation task breakdown from the design artifacts.
> Five phases: token setup + accessibility infrastructure, atomic components with behavioral
> states, composite components with interaction behavior, screen layouts + navigation with
> behavioral contracts, and integration behavior + responsive. Behavioral acceptance criteria
> from DESIGN_SYSTEM.md and UI_SCREENS.md appear in Phase 2-4 tasks — not deferred to Phase 5.
> Each task maps to a design reference with dependencies and acceptance criteria. Produces
> DESIGN_TASKS.md.

---

### Change 11: SKILL.md Tokens Mode Summary Update

**What**: Update the Tokens Mode summary to mention behavioral states, accessibility, and boundary behavior.

**Why**: With Change 2 applied, tokens mode generates more than visual tokens and variants.

**Target file**: `skills/cl-designer/SKILL.md`

**Current** (Tokens Mode section — post-P0.5, includes review style paragraph):
> ## Tokens Mode
>
> When running tokens mode, read `references/tokens-mode.md` and follow its process.
>
> Tokens mode generates design tokens (colors, typography, spacing) and a reusable component
> library. Two paths based on the MCP detected during setup: Pencil generates from scratch,
> markdown fallback documents everything as structured specs. Both paths produce
> DESIGN_SYSTEM.md.
>
> The default review style is **batch**: all components are generated, then presented as a set
> for the user to review and flag items for revision. Serial review (one component at a time)
> is available via the `ux.reviewStyle` config. For Pencil path, the core loop is generate all
> then batch screenshot then batch feedback then revise flagged items.

**Proposed** (replace both paragraphs, keep review style):
> ## Tokens Mode
>
> When running tokens mode, read `references/tokens-mode.md` and follow its process.
>
> Tokens mode generates design tokens (colors, typography, spacing) and a reusable component
> library with **behavioral states** (idle, loading, error, disabled), **accessibility
> attributes** (ARIA, keyboard interactions, focus behavior), and **boundary behavior**
> (truncation, overflow, min/max constraints). Two paths based on the MCP detected during
> setup: Pencil generates from scratch, markdown fallback documents everything as structured
> specs. Both paths produce DESIGN_SYSTEM.md.
>
> The default review style is **batch**: all components are generated, then presented as a set
> for the user to review and flag items for revision. Serial review (one component at a time)
> is available via the `ux.reviewStyle` config. For Pencil path, the core loop is generate all
> then batch screenshot then batch feedback then revise flagged items.

---

### Change 12: DESIGN_SYSTEM.md Component Behavioral States Format

**What**: Extend the component catalog format in DESIGN_SYSTEM.md to include behavioral states, accessibility, and boundary behavior.

**Why**: Change 2 captures behavioral specifications per component during tokens mode. Those specs need to flow into DESIGN_SYSTEM.md so they're available to downstream consumers (build plan, spec generation, implementation).

**Target file**: `skills/cl-designer/references/tokens-mode.md`

**Current** (All Paths: Generate DESIGN_SYSTEM.md — component catalog section):
> ```markdown
> ## Component Catalog
>
> ### [Component Name]
>
> - **Purpose**: [what it does]
> - **PRD feature**: [which feature drove this component]
> - **Variants**: [list]
> - **Design reference**: [.pen node ID | "markdown spec"]
>
> [Repeat for each component]
> ```

**Proposed** (replace the component catalog section):
> ```markdown
> ## Component Catalog
>
> ### [Component Name]
>
> - **Purpose**: [what it does]
> - **PRD feature**: [which feature drove this component]
> - **Variants**: [visual variants list — primary, secondary, ghost, etc.]
> - **Design reference**: [.pen node ID | "markdown spec"]
>
> **Behavioral States**:
> | State | Trigger | Visual Change | Behavior |
> |-------|---------|---------------|----------|
> | idle | default | — | [default behavior] |
> | loading | [trigger] | [visual change] | [behavioral change, e.g., prevents re-click] |
> | error | [trigger] | [visual change] | [behavioral change, e.g., shows error message] |
> | disabled | [trigger] | [visual change] | [behavioral change, e.g., not focusable] |
>
> Omit states that don't apply to this component.
>
> **Accessibility**:
> - **ARIA**: [relevant attributes — aria-busy, aria-disabled, aria-expanded, etc.]
> - **Keyboard**: [interaction model — Enter/Space activates, Escape closes, Arrow keys navigate]
> - **Focus**: [focusable? Tab order? Focus trap? Focus visible styling?]
>
> **Boundary Behavior**:
> - **Truncation**: [strategy — ellipsis, word boundary, fade, none]
> - **Overflow**: [handling — scroll, wrap, clip]
> - **Constraints**: [min width, max content length, etc.]
>
> [Repeat for each component]
> ```

**Dependencies**: Change 2 must be applied — this format captures the behavioral data produced during component generation.

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|---|---|---|
| **Behavioral walkthrough** | Structured conversation after visual mockup approval that identifies screen states, interaction flows, navigation context, and content decisions for a screen | mockups-mode.md, design-checklist.md, UI_SCREENS.md |
| **Screen states** | The set of visual/behavioral modes a screen can be in: default, empty (first-use), empty (filtered), loading, error (fetch), error (action), partial, offline, permission denied | mockups-mode.md, UI_SCREENS.md |
| **Behavioral states** (component) | The state machine for a component: idle, loading, error, disabled — with triggers for each transition | tokens-mode.md, DESIGN_SYSTEM.md |
| **Interaction flow** | A documented sequence: user action → expected behavior → error case → accessibility notes | mockups-mode.md, UI_SCREENS.md |
| **Navigation context** | Per-screen metadata: route, auth requirement, back behavior, state persistence, focus on arrival | mockups-mode.md, UI_SCREENS.md |
| **Test scenario** | A verifiable behavioral statement derived from screen states and interaction flows, serving as both specification and acceptance test case | UI_SCREENS.md |
| **Boundary behavior** | How a component handles content at its limits: truncation, overflow, min/max constraints | tokens-mode.md, DESIGN_SYSTEM.md |

### Migration

This proposal changes skill instruction files, not code. No migration path is needed for existing projects — the behavioral walkthrough and extended formats will apply to new design runs. Existing DESIGN_SYSTEM.md and UI_SCREENS.md files from previous runs remain valid but won't have behavioral sections.

For projects mid-design (tokens complete, mockups not started): the behavioral walkthrough will run naturally when mockups mode starts.

For projects with completed mockups: the user can re-run `/cl-designer mockups` on specific screens to add behavioral walkthroughs retroactively, or proceed to build-plan with reduced behavioral detail.

### Integration Points

**cl-designer → cl-implementer**: The extended DESIGN_SYSTEM.md (behavioral states, accessibility) and UI_SCREENS.md (behavioral contracts, test scenarios) feed directly into spec generation and task creation. The implementer's spec mode reads these artifacts and should extract behavioral acceptance criteria. P2 (Testing Pipeline) will formalize this integration.

**cl-designer → cl-reviewer**: The design-review mode validates designs against the PRD. With behavioral additions, it can also validate behavioral completeness. This is not changed in this proposal — the reviewer naturally checks whatever content exists in DESIGN_SYSTEM.md and UI_SCREENS.md.

**cl-researcher → cl-designer**: Bootstrap behavioral questions (Change 5) produce DECISIONS.md entries with standard category tags (`errors`, `accessibility`, `content`, `resilience`, `testing`, `responsive`). cl-designer reads these during setup mode (already part of the pipeline state check — P0.5 added the decision flow guideline). The behavioral entries use the same category tags established in P0.5's DECISIONS.md protocol, so cl-designer's existing decision flow lookup finds them without new integration.

## Context Budget & Progressive Disclosure (Hard Requirement)

Every change in this proposal MUST respect the plugin's progressive disclosure model. Skills load reference files on-demand per mode — this is the primary mechanism for keeping context lean. Violating it bloats every invocation.

### Rules

1. **SKILL.md stays thin.** Mode detection + "Read `references/[mode].md`" pointers only. No inline process descriptions, no large tables, no protocol details. A SKILL.md should be under ~200 lines.

2. **Reference files are mode-scoped.** Content added to a reference file must be relevant to that mode's execution. Cross-cutting protocols (e.g., behavioral state format, walkthrough sequence) belong in a shared reference or in `pipeline-concepts.md` — NOT duplicated across multiple mode files.

3. **Large tables and catalogs go in separate files.** If a change adds a table with >10 rows (e.g., behavioral state catalog, screen state matrix, interaction pattern reference), it should be a separate reference file loaded only when needed — not inlined in the mode reference.

4. **Measure additions by token cost.** Each change should note its approximate token cost. A mode reference file should stay under ~3000 tokens. If a change pushes a file over budget, extract the addition into a sub-reference.

5. **Shared content uses references, not duplication.** If the same protocol or format is used by multiple modes or skills, define it once (in a shared reference or `pipeline-concepts.md`) and link to it. The decision flow protocol from P0.5 is the model: defined once, referenced everywhere.

6. **Exceptions.** Inlining is acceptable when the content is small (<20 lines), mode-specific, and would create unnecessary indirection if extracted. Use judgment — the goal is minimal context per invocation, not maximum file count.

### Merge Validation

During merge, the reviewer should verify:
- No SKILL.md file exceeds ~200 lines after changes
- No reference file exceeds ~3000 tokens after changes
- No content is duplicated across multiple files
- Cross-cutting additions use shared references

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| Behavioral walkthrough runs after visual approval, not during | Could interleave behavioral and visual feedback in a single loop per screen | Separation keeps the visual feedback loop focused. Users evaluate aesthetics differently from behavior. Mixing them increases cognitive load per screen. Research F2 recommends this ordering. |
| Batch walkthrough uses generate-confirm (tables), serial uses conversation | Could make the walkthrough always conversational or always table-based | Aligns with P0.5's warmth gradient: mockups stage is "Medium" (batch review, generate-confirm, focused feedback, tables over conversation). The batch walkthrough presents behavioral specs as tables for review, matching the gradient. Serial walkthrough (opt-in) is warmer but appropriate for complex screens where the user needs to think through behavior. |
| Behavioral states in tokens mode (not deferred to mockups) | Could capture all behavioral specs during mockups mode only | Components are the atoms — their behavioral model constrains screen-level behavior. A Button's loading state is the same whether it's on the Dashboard or Settings page. Capturing it once in tokens mode avoids repetition during mockups. Research F3 recommends this. |
| Screen states are a table format, not visual mockups for every state | Could generate Pencil variants for every state of every screen | Diminishing returns. Empty, loading, and error get variants when Pencil is available (these are the highest-impact states). Partial, offline, and permission denied are described in text — they're important but generating visual variants for all of them would triple the design time. |
| Test scenarios in UI_SCREENS.md, not a separate test file | Could generate a separate TEST_SCENARIOS.md from the behavioral walkthrough | Finding F16 (spec-testing duality) shows behavioral specs ARE test cases. Keeping them in UI_SCREENS.md maintains the single-source-of-truth principle. P2 (Testing Pipeline) will formalize how these flow into TEST_SPEC.md. |
| Browser validation is "awareness only" in cl-designer (detection and recording) | Could add full behavioral testing to the design skill | The design skill creates; it doesn't implement or test. Browser tools are useful during design only if a running app exists (rare during initial design). Full behavioral testing belongs in cl-implementer (P2). Design-time detection is added so the info is available downstream. |
| Bootstrap adds behavioral questions as conversation extensions, not a separate phase | Could add a dedicated "Behavioral Requirements" bootstrap step | Research F2 established that users can't reason about behavior in the abstract. High-level philosophy questions (error handling approach, accessibility level) are appropriate at bootstrap. Per-screen decisions happen during design when users can see the screen. Separate phase would feel like a bureaucratic gate. |
| Phase 5 becomes "Integration Behavior + Responsive" rather than being eliminated | Could distribute ALL Phase 5 content into earlier phases | Some behaviors are inherently cross-screen: navigation transitions, shared state, unsaved changes warnings. These can't be verified in component or single-screen isolation. Phase 5 retains these cross-cutting concerns while individual component/screen behavior moves to Phase 2-4. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Behavioral walkthrough increases design time by 30-50% per screen, users skip it | Medium | High — skipping defeats the purpose | Checklist gate catches skips. Efficiency tips for pattern reuse. Allow partial walkthroughs (the gate warns but doesn't hard-block). |
| Component behavioral states add complexity to tokens mode for simple projects | Low | Medium — over-specified simple components | "Not every component needs all states" guidance. Non-interactive components (Badge, Divider) skip behavioral tables entirely. |
| Accessibility requirements scare away non-expert users | Low | Medium — users skip a11y items | Framed as "what level are you targeting?" with "none specified" as a valid answer. Concrete questions, not jargon. WCAG referenced only in the skill instructions, not presented to users. |
| Extended UI_SCREENS.md format is too verbose for large apps (20+ screens) | Medium | Low — verbosity but complete | Pattern reuse guidance: walkthrough the first screen of each type, confirm pattern applies to similar screens. Screens with no state complexity (static pages) get minimal entries. |
| Bootstrap behavioral questions add too many questions to the discovery conversation | Low | Low — longer bootstrap | "Ask what's relevant to the project type" guidance. Server-side APIs skip empty states. Simple tools skip offline handling. Only error handling and accessibility are always-ask. |

## Open Items

1. **Content strategy depth**: Change 1 pins down content for non-default states during the walkthrough. Should cl-designer also capture a "content style guide" (tone, voice, terminology) as a separate section in DESIGN_SYSTEM.md, or is the per-screen content sufficient? This could be a future enhancement.

2. **Animation specification**: Finding F12 identified animation as a gap. This proposal captures transition behavior during the walkthrough ("toast enters with slide + fade") but doesn't add systematic animation tokens or specifications. Animation depth could be a future proposal addition (research priority group 5).

3. **Pencil accessibility validation**: If Pencil MCP adds contrast checking or accessibility analysis tools in the future, the tokens mode could auto-verify contrast ratios during generation. Currently, contrast verification is manual (calculate from token hex values). The checklist item is included but the verification method may evolve.

4. **Behavioral walkthrough for responsive variants**: When a screen has responsive variants (mobile, tablet), should the behavioral walkthrough run for each viewport or once with responsive notes? Current proposal: once with responsive notes. This may need revision for apps where mobile behavior differs significantly (e.g., swipe actions on mobile, click actions on desktop).

## Appendix: Research Summary

The Pipeline Gap Analysis research (docs/research/PIPELINE_GAP_ANALYSIS.md) conducted a comprehensive audit of the entire Clarity Loop pipeline and identified 37 findings across 14 categories. The core finding: the pipeline treats design as purely visual, but design IS behavior. This produces the "looks right but works wrong" failure mode observed in real-world testing.

Key findings relevant to this proposal:

- **F1-F2**: The behavioral gap is structural (no pipeline stage captures behavior) and the design phase is the optimal capture point (users can reason about behavior when looking at screens).
- **F3**: Components need behavioral state models (idle, loading, error, disabled) alongside visual variants.
- **F4**: A behavioral walkthrough after visual mockup approval is the single highest-impact addition.
- **F5**: Screen states (empty, loading, error, partial, offline) represent 60-80% of what users see — all unspecified today.
- **F6**: Navigation behavior (routes, auth guards, back button, focus management) is invisible architecture that's never captured.
- **F7**: Accessibility is systematically absent from every pipeline stage.
- **F10**: Edge cases and boundary conditions (truncation, overflow, data limits) are never specified.
- **F13**: Content for non-default states (error messages, empty state copy) is never designed.
- **F14**: Browser automation tools exist (agent-browser, Playwright MCP, /chrome) but the pipeline doesn't detect or use them.
- **F16**: The specification-testing duality — every behavioral spec is also a test case.

The research recommended Option B (Top 10 + Full-Stack Testing) with a phased proposal strategy. This proposal (P1) covers Changes 1-7 from the research — the behavioral foundation in the design phase. P2 (Testing Pipeline), P3 (Security/Errors/API), and P4 (Infrastructure/Quality/Drift) follow.
