# Research: Comprehensive Pipeline Gap Analysis — Behavioral, Structural, and Quality

**Created**: 2026-02-09
**Status**: Draft
**Author**: Bhushan + AI Researcher

## System Context

### Research Type: Evolutionary

This research is a comprehensive audit of the entire Clarity Loop pipeline — from bootstrap
through implementation — to identify every category of gap where the pipeline produces
output that "looks right but works wrong." The immediate trigger was real-world testing of
the todo app, where the pipeline produced visually polished components that behaved
incorrectly when assembled. But investigation revealed the behavioral gap is one of at
least 10 distinct gap categories, all rooted in the same structural cause: the pipeline
treats design as purely visual.

### Related Clarity Loop Artifacts

| Artifact | Relevant Sections | Relationship |
|---|---|---|
| `skills/cl-designer/SKILL.md` | Mockups mode, Tokens mode | Primary change target — behavioral discovery, screen states, accessibility |
| `skills/cl-designer/references/mockups-mode.md` | Screen generation, feedback loop | Needs behavioral walkthrough, navigation context, content prompting |
| `skills/cl-designer/references/tokens-mode.md` | Component generation (Step 3-4) | Components need behavioral states, accessibility specs, boundary behavior |
| `skills/cl-designer/references/build-plan-mode.md` | Phase 5 (Interactive states) | Currently an afterthought — needs elevation to a core concern |
| `skills/cl-designer/references/design-checklist.md` | Tokens and Mockups checklists | Need behavioral, accessibility, and content coverage checks |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation (Step 2) | Should probe for behavior, accessibility, resilience, content, testing |
| `skills/cl-implementer/SKILL.md` | Step 2 (read system docs), Step 4 (generate specs) | Should extract behavioral contracts, add edge case and accessibility sections |
| `skills/cl-implementer/references/autopilot-mode.md` | Step 3c-3e (tests, UI validation) | Needs concrete browser tools, accessibility testing, behavioral test execution |
| `skills/cl-implementer/SKILL.md` | Guidelines | Needs testing strategy awareness |
| `docs/pipeline-concepts.md` | Directory structure, configuration | May need new paths and config options |

### Current State

**What exists today:**

The pipeline currently handles non-visual concerns in scattered, shallow ways:

1. **Bootstrap** (cl-researcher): Asks "what are the main workflows or user journeys?" —
   a single question among many. No deep behavioral probing. No follow-up about error
   states, edge cases, interaction patterns, accessibility requirements, or content strategy.

2. **TDD/PRD**: The PRD describes features ("user can add a todo"). The TDD describes
   architecture ("use React with Zustand"). Neither specifies behavioral contracts ("adding
   uses optimistic updates, shows loading spinner for perceived performance, reverts with
   error toast on API failure, deduplicates by normalized title").

3. **Design system** (cl-designer tokens): Components are generated with visual variants
   (primary, secondary, ghost Button) but states are treated as visual concerns only
   (hover, focus, disabled appearance). No behavioral specification, no accessibility
   attributes, no keyboard interaction model, no boundary behavior (truncation, overflow).

4. **Mockups** (cl-designer mockups): Screens show a single static state — the "happy path"
   default view. No empty states, loading states, error states, or edge cases. No navigation
   context (routes, auth guards, back behavior). No content for non-default states. The user
   approves a screenshot that represents maybe 20% of what the screen actually needs to do.

5. **Build plan** (cl-designer build-plan): Phase 5 ("Interactive States + Responsive") is
   listed last, as an afterthought. Acceptance criteria for earlier phases don't include
   behavioral requirements — a Button task says "renders primary/secondary/ghost variants"
   but not "disables during form submission, shows spinner, re-enables on response."

6. **Spec generation** (cl-implementer): Reads system docs and generates implementation specs.
   If the system docs don't contain behavioral contracts, the specs won't either. The specs
   inherit the upstream gap. No standard edge case or accessibility sections.

7. **Implementation** (implementer): Autopilot mode writes tests from acceptance criteria —
   but if acceptance criteria are purely visual ("renders a card with title and description"),
   the tests will be purely visual. Behavioral tests require behavioral acceptance criteria,
   which require behavioral specs, which don't exist.

8. **Browser validation** (implementer autopilot): Step 3e describes UI validation as
   "screenshot comparison against design spec." The current autopilot-mode.md references
   "browser tools" generically without specifying which tools are available, how to detect
   them, or how to run actual behavioral or accessibility tests.

**The observed failure mode:**

In the todo app test project, the pipeline produced:
- Token system: correct (colors, spacing, typography all matched)
- Component library: correct (Button, Input, Card all visually polished)
- Screen layouts: correct (Dashboard, Task List looked exactly like mockups)
- App behavior: broken (form submission didn't work correctly, state management was
  inconsistent, error handling was missing, navigation had edge cases)

The components were individually correct but their composition — the behavioral glue that
makes an app work — was never specified. The implementer had to make 50+ micro-decisions
about behavior per screen, and many were wrong because no spec existed to guide them.

### Why This Research

**Immediate trigger**: Real-world testing revealed that visually polished output masks
behavioral and structural gaps. Users approve screenshots that look perfect but behave
incorrectly.

**Root cause**: The pipeline treats design as purely visual. But design IS behavior. A
loading spinner is a behavioral decision. An error toast vs. inline error is a behavioral
decision. Keyboard navigation is an accessibility decision. "No tasks yet" vs. "Create
your first task" is a content decision. These decisions are best made when the user can
SEE the screen — during the design phase — not during implementation when it's too late
for meaningful feedback.

**Why the design phase is the right place**: Users can't fully reason about these details
in the abstract. "What happens when the form fails?" is hard to answer without seeing the
form. But when looking at a mockup, they can point at specific elements and say "this should
shake, show an inline error here, and keep the user's input." With Pencil MCP, variant
states can be generated visually. Without Pencil, structured walkthroughs still force the
conversation.

## Scope

### In Scope

Every category of specification gap in the Clarity Loop pipeline that causes implementation
to fail, break, or require rework:

1. **Behavioral specifications** — interaction flows, state management, error handling
2. **Screen states / defensive UI** — empty, loading, error, partial, offline, permission
3. **Navigation and routing** — deep links, guards, back button, SPA focus, transitions
4. **Accessibility** — keyboard nav, focus management, ARIA, WCAG compliance
5. **Data and state management** — client vs server, caching, optimistic updates, sync
6. **Error recovery and resilience** — retry, offline, error boundaries, session handling
7. **Edge cases and boundary conditions** — data limits, concurrent edits, unicode, timing
8. **Responsive design details** — beyond layout: feature adaptation, touch vs mouse
9. **Animation and micro-interactions** — transitions, feedback, mount/unmount
10. **Content strategy** — empty state copy, error messages, truncation, formatting
11. **Browser validation tooling** — tools for autopilot behavioral and accessibility testing
12. **Testing strategy** — where testing decisions live in the pipeline
13. **Full-stack unit testing** — what gets unit tested, mocking boundaries, test data, per-layer strategy
14. **Full-stack integration testing** — API contracts, service interactions, DB operations, cross-module flows
15. **Test architecture** — test pyramid, environment setup, fixture strategy, cross-layer verification
16. **Cross-cutting**: where in the pipeline each gap should be caught
17. **Security specification** — auth flows, input validation, CORS, secrets management, OWASP concerns
18. **Error taxonomy** — system-level error format, codes, propagation chain
19. **Environment and configuration** — env vars, secrets, feature flags, build config
20. **Data migration and evolution** — migration strategy, rollback, seed data
21. **Observability** — logging, metrics, health checks, tracing
22. **API design conventions** — pagination, filtering, naming, versioning, error format
23. **Type safety across boundaries** — shared types, serialization, code generation
24. **Third-party integration contracts** — external service payloads, auth, rate limits
25. **Dependency compatibility** — cross-library conflicts, peer dependencies
26. **Code organization conventions** — file naming, directory structure, import patterns
27. **Performance budgets** — quantitative targets, bundle size, response time
28. **Long-term quality governance** — L1 accumulation, AI tech debt, supply chain security
29. **Cross-cutting backend policies** — idempotency, transaction boundaries, caching, rate limiting, validation authority
30. **Data modeling behavioral decisions** — soft/hard delete, temporal requirements, cascade behavior, data volume projections
31. **Specification drift** — structural drift beyond sync mode, model-code gap, DECISIONS.md reconciliation

### Out of Scope

- Internationalization (adjacent to content strategy but significantly more complex — separate research)
- CI/CD pipeline configuration (how tests run in CI — that's infrastructure, not specification)
- Multi-tenancy specification (important but project-specific — separate research)
- Compliance frameworks (GDPR, HIPAA, SOC2 — important but domain-specific)

### Constraints

- Changes must work with AND without Pencil MCP (markdown fallback must be equally capable)
- Browser validation tools are optional — the pipeline must degrade gracefully
- Must not significantly increase the design phase duration — additions should feel like
  natural extensions of the mockup feedback loop, not separate ceremonies
- Must work within the existing pipeline flow (bootstrap → research → proposal → review →
  merge → spec gen → design → implement)
- Each gap category should be addressable independently (no all-or-nothing)

---

## Research Findings

### Part I: Behavioral Specifications (The Core Gap)

#### Finding 1: The Behavioral Gap Is Structural, Not Incidental

**Context**: The gap isn't because someone forgot to ask about behavior. It's because no
stage of the pipeline has a dedicated place for behavioral specifications.

**Analysis**:

The pipeline currently has five information handoff points where behavioral requirements
could be captured:

| Handoff | What's Captured Today | What's Missing |
|---|---|---|
| Bootstrap → PRD | Features, user journeys, requirements | Per-feature interaction flows, error handling strategy, state management approach |
| PRD → Design (cl-designer) | Feature list, UI requirements | Behavioral contracts per feature — what triggers what, what happens on failure |
| Design → DESIGN_SYSTEM.md | Token values, component variants (visual) | Component state machines (loading → success/error), interaction behaviors |
| Design → UI_SCREENS.md | Screen layouts, component usage, navigation | Per-screen behavioral walkthrough (empty state, loading, error, partial, full) |
| Specs → Implementation | Acceptance criteria (visual: "renders X") | Behavioral acceptance criteria ("submitting with empty field shows inline error within 200ms") |

Each handoff loses behavioral information because no artifact format includes it.

**Source**: Analysis of current Clarity Loop skill files + real-world testing observation.

#### Finding 2: The Design Phase Is the Optimal Capture Point

**Context**: Where in the pipeline should behavioral specs be captured?

**Analysis**:

Three candidate capture points:

**Option A — Bootstrap/PRD phase**: Ask users about behavior early ("what happens when the
form fails?"). **Problem**: Users can't reason about behavior in the abstract. They answer
with vague generalities ("show an error") that don't translate to implementation guidance.
The PRD becomes bloated with speculative behavioral details that change once the UI is
designed.

**Option B — Design phase (mockups)**: After the user sees each screen, walk through its
behavioral states. Show them variant mockups (loading, error, empty). Ask specific
questions grounded in what they're looking at. **Advantage**: Users can point at elements
and describe behavior concretely. With Pencil, you can GENERATE the variant states and
get visual approval. The behavioral spec becomes a natural extension of the visual approval
loop — not a separate ceremony.

**Option C — Spec generation**: Have the spec generator infer behavioral requirements from
PRD features. **Problem**: This is too late. The spec generator has no user interaction —
it reads docs and generates specs. Behavioral decisions require human judgment. Deferring
to spec gen means the implementer has to make behavioral decisions at implementation time,
which is exactly the current failure mode.

**Recommendation**: **Option B is primary, Option A is supplementary.** Bootstrap should
ask high-level behavioral questions (error handling philosophy, state management approach,
interaction style). The design phase should capture per-screen, per-component behavioral
contracts through visual walkthroughs. Spec generation should extract behavioral
requirements from design artifacts, not infer them.

**Source**: User feedback from todo app testing; analysis of where behavioral decisions
are actually made in practice.

#### Finding 3: Component States Need a Behavioral Model, Not Just Visual Variants

**Context**: The current tokens mode generates components with visual variants (primary,
secondary, ghost) but doesn't model behavioral states.

**Analysis**:

A Button component today has:
- **Visual variants**: primary, secondary, ghost, destructive
- **Visual states**: default, hover, focus, disabled (appearance only)

What's missing is the **behavioral model**:
- **When is it disabled?** During form submission? When required fields are empty?
- **What does loading look like?** Spinner replacing text? Text change? Opacity reduction?
- **What happens on click?** Immediate feedback? Wait for response? Optimistic update?
- **Error recovery**: If the action fails, what happens to the button?

This behavioral model varies by component type:

| Component | Key Behavioral States |
|---|---|
| **Button** | idle → loading → success/error → idle. Disabled conditions. Click debouncing. |
| **Input** | empty → typing → validating → valid/invalid. When does validation fire (blur, change, submit)? |
| **Form** | pristine → dirty → submitting → success/error. What resets the form? What preserves input on error? |
| **List/Table** | empty → loading → populated → filtering → empty-after-filter. Pagination behavior. |
| **Modal** | closed → opening → open → closing. What triggers close (X, overlay click, Escape)? What happens to unsaved form data? |
| **Toast/Alert** | hidden → appearing → visible → auto-dismiss. Duration? Stacking? Dismissable? |

The design system should document these as **state machines** (or at least state tables)
alongside the visual variants.

**With Pencil MCP**: Generate visual representations of each behavioral state as additional
component variants. The user sees "Button: loading state" with a spinner and approves it.

**Without Pencil (markdown)**: Document the state machine as a table or simple state diagram
in the component spec.

**Source**: Analysis of tokens-mode.md component generation; Radix UI documents four layers
per component (behavior, accessibility, state management, DOM structure). Material Design,
Ant Design all document behavioral states alongside visual variants.

#### Finding 4: Mockups Mode Needs a Behavioral Walkthrough Step

**Context**: Currently, mockups mode generates a static screenshot, the user approves the
visual, and moves on. The screen's behavior is never discussed.

**Analysis**:

After the user approves a screen's visual layout (the current flow), a **behavioral
walkthrough** should run as a natural next step. This is the single highest-impact change
this research recommends.

The walkthrough per screen:

1. **Identify all states this screen can be in**:
   - Default/populated (what the mockup shows)
   - Empty state (no data yet — first use, filtered to nothing)
   - Loading state (data being fetched)
   - Error state (fetch failed, action failed)
   - Partial state (some data loaded, some pending)
   - Offline state (device lost connectivity)
   - Permission denied (user lacks access)

2. **Walk through each user interaction**:
   - "When the user clicks 'Add Task'..." → what happens? Form appears? Modal? Inline?
   - "When the user submits the form..." → optimistic? Wait for response? Loading indicator?
   - "If the submission fails..." → inline error? Toast? Revert? Keep form data?
   - "When the user deletes an item..." → confirm dialog? Swipe? Undo toast?

3. **With Pencil**: Generate variant frames showing key states (empty, loading, error). The
   user can see and approve the empty state mockup, not just imagine it.

4. **Without Pencil**: Document each state as a structured description with component
   variant references (e.g., "Uses EmptyState component with illustration and 'Add your
   first task' CTA").

5. **Record decisions**: Every behavioral decision goes into DESIGN_PROGRESS.md and flows
   into UI_SCREENS.md as behavioral contracts.

**Impact on the user experience**: This extends the mockup feedback loop by ~30-50% per
screen. But the alternative is discovering behavioral gaps during implementation and either
making wrong decisions silently or pausing to ask the user out of context. The upfront
investment prevents the downstream behavioral chaos observed in the todo app.

**Source**: User observation ("behavioral details are lacking quite a bit... the behavior
of the app was all over the place"); analysis of what information the implementer needs
but doesn't receive.

---

### Part II: Defensive UI and Screen States

#### Finding 5: The Pipeline Only Designs the Happy Path

**Context**: The pipeline currently generates mockups of screens in their default,
data-populated state. Every other state — which collectively represent 60-80% of what
users actually see — is unspecified.

**Analysis**:

Every interactive screen has multiple states that users encounter:

| State Category | Examples | Currently Captured? |
|---|---|---|
| **First-use empty** | New account, no data yet. "Add your first..." | No |
| **Cleared empty** | User deleted all items. Different from first-use (no onboarding needed). | No |
| **Search/filter empty** | Applied filters returned no results. "No results for..." | No |
| **Loading** | Initial page load, data fetch in progress. Skeleton? Spinner? Progressive? | No |
| **Partial load** | Some data loaded, some pending. Above-the-fold content first? | No |
| **Error — fetch** | Network failure, server error, timeout. Retry? Fallback? Cached data? | No |
| **Error — action** | User action failed (save, delete, submit). What persists? What reverts? | No |
| **Offline** | Device lost connectivity. Read-only mode? Queue actions? Warning banner? | No |
| **Degraded** | Some features unavailable (API partially down). What still works? | No |
| **Permission denied** | User lacks access to this view. Redirect? Explain? Contact admin? | No |
| **Stale data** | Data changed on server since page loaded. Alert? Auto-refresh? Merge? | No |

**Industry evidence**: Defensive UI design is a well-established practice. The four primary
empty state patterns (first use, user cleared, error state, no results) are considered
mandatory in modern design systems. Material Design, Apple HIG, and Ant Design all
document empty states as a core component pattern, not an afterthought.

**Pipeline impact**: Without screen state specifications, the implementer either:
- Skips non-default states entirely (missing features)
- Improvises states inconsistently across screens (UX chaos)
- Creates generic fallbacks that don't match the app's design language

**Integration with behavioral walkthrough**: Screen states ARE behavioral specifications.
They fold naturally into the behavioral walkthrough (Finding 4) — when walking through
"what happens when data loads...", "what if there's no data...", "what if the fetch fails..."
the states emerge organically. This does NOT require a separate step.

**Source**: Web research on defensive UI design patterns; Material Design and Apple HIG
documentation; real-world observation from todo app testing.

---

### Part III: Navigation and Routing

#### Finding 6: Navigation — The Invisible Architecture

**Context**: The pipeline captures screen layouts and component usage, but navigation
behavior — how users move between screens, what's preserved across transitions, how
deep links work — is never specified.

**Analysis**:

Navigation is the connective tissue of any multi-screen app. The pipeline's current
treatment:
- **UI_SCREENS.md**: Has a "Navigation Flow" section listing screen-to-screen connections
- **Mockups mode**: Generates individual screens in isolation — no transition behavior
- **Build plan**: Phase 4 "Screen layouts / pages" creates individual page tasks

What's missing:

| Navigation Aspect | What The Implementer Needs | Currently Specified? |
|---|---|---|
| **URL structure** | `/tasks`, `/tasks/:id`, `/settings/profile` | No |
| **Deep linking** | Which routes are directly accessible? Auth required? | No |
| **Back button** | What "back" means from each screen (browser back? in-app back? both?) | No |
| **Auth guards** | Which routes require authentication? Redirect behavior? | No |
| **SPA focus management** | Where does focus go after navigation? (WCAG 2.2 requirement) | No |
| **Transition behavior** | Page transition animations? Scroll position? Form state? | No |
| **Breadcrumbs / location** | How does the user know where they are? Active nav state? | No |
| **Loading during navigation** | Route-level loading (skeleton page vs. spinner vs. progress bar)? | No |
| **Error during navigation** | Route doesn't exist? Server error on data fetch? | No |
| **Query params / filters** | Are filter states preserved in URL? Shareable? Bookmarkable? | No |
| **Unsaved changes** | Navigate away from dirty form — warn? Auto-save? Discard? | No |

**Industry evidence**: 62% of developers spend excessive time redoing work due to
communication breakdowns between design and implementation. Navigation behavior is one of
the highest-frequency breakdown points because it spans multiple screens and is inherently
cross-cutting.

**Where it should be caught**: Two places:
1. **Mockups mode** — when generating screens, a brief "Navigation Context" section:
   route, auth requirement, what "back" means, what state persists, focus target on arrival.
2. **Build plan** — a dedicated "Navigation & Routing" phase or cross-cutting task that
   documents the URL structure and route guards.

**Source**: Web research on design-to-code handoff gaps; analysis of common SPA
implementation issues.

---

### Part IV: Accessibility

#### Finding 7: Accessibility — The Systematically Ignored Dimension

**Context**: The pipeline has zero accessibility awareness. No skill asks about
accessibility requirements, no checklist checks for them, no spec includes them, and no
validation tests for them.

**Analysis**:

This is the most clear-cut gap: accessibility isn't partially covered — it's entirely
absent from every pipeline stage.

| Pipeline Stage | Accessibility Treatment |
|---|---|
| Bootstrap | No questions about accessibility requirements |
| PRD | May mention "accessible" as a buzzword with no concrete requirements |
| Design tokens | No mention of contrast ratios, focus indicators, or touch targets |
| Component generation | No ARIA attributes, no keyboard interaction spec, no focus styling |
| Mockups | No tab order, no focus states shown, no screen reader content |
| Design checklist | Zero accessibility items |
| Spec generation | Inherits upstream gap — no accessibility acceptance criteria |
| Autopilot | No accessibility testing (axe-core, Pa11y, screen reader simulation) |

**What should be specified per component** (from WCAG 2.2 and WAI-ARIA Authoring Practices):

| Component | Accessibility Concerns |
|---|---|
| **Button** | `role`, `aria-label` for icon-only, `aria-disabled` vs `disabled`, `aria-busy` during loading |
| **Input** | `aria-invalid`, `aria-describedby` for error messages, `aria-required`, `autocomplete` values |
| **Modal** | Focus trap, `aria-modal`, return focus on close, `Escape` to dismiss |
| **Dropdown/Select** | `aria-expanded`, `aria-activedescendant`, arrow key navigation, typeahead |
| **Toast/Alert** | `role="alert"` or `role="status"`, `aria-live` region, auto-dismiss accessibility |
| **Navigation** | `aria-current="page"`, skip links, landmark roles |
| **Table** | `scope` attributes, `aria-sort`, keyboard navigation model |
| **Tabs** | `role="tablist"`, arrow key navigation, `aria-selected`, panel association |

**Commonly missed WCAG 2.2 requirements in AI-generated code**:
- **2.4.3 Focus Order**: Focus must follow a meaningful sequence. SPAs that insert DOM
  elements dynamically often break focus order.
- **2.4.7 Focus Visible**: Focus indicators must be visible. Many designs remove the default
  outline without adding a custom one.
- **2.4.11 Focus Not Obscured**: Focused elements can't be hidden behind sticky
  headers/footers.
- **2.1.2 No Keyboard Trap**: User must be able to navigate away from every focusable
  element. Modals and custom dropdowns are common trap sources.
- **1.4.3 Contrast**: Text and interactive elements must meet 4.5:1 (normal text) or 3:1
  (large text, UI components) contrast ratios.
- **2.5.8 Target Size**: Interactive targets must be at least 24x24 CSS pixels.

**Industry data**: Research shows AI-generated code has approximately 1.7x more issues than
human-written code, with accessibility being one of the largest gap areas. Roughly half of
AI-generated code samples contain security or accessibility flaws that wouldn't pass
automated auditing.

**Where it should be caught**: Three places:
1. **Bootstrap** — Ask about accessibility requirements (compliance level: WCAG 2.1 AA? 2.2?
   Section 508?). Record in DECISIONS.md.
2. **Tokens mode** — Verify contrast ratios on color tokens. Add focus indicator tokens.
   Document keyboard interaction per component.
3. **Design checklist** — Add accessibility checks: contrast ratios verified, keyboard
   interactions documented, ARIA requirements listed per component, focus management defined.

**Source**: Web research on WCAG 2.2 commonly missed requirements; WAI-ARIA Authoring
Practices; research on AI-generated code accessibility gaps.

---

### Part V: Data, State, and Resilience

#### Finding 8: Data and State Management — The Architectural Void

**Context**: The pipeline describes WHAT data appears on screen but never HOW data flows,
WHERE state lives, or WHEN it refreshes.

**Analysis**:

The architecture doc (in the target project's system docs) typically describes the data
layer at a high level (e.g., "React with Zustand" or "Next.js with server components").
But the design phase — which decides what data appears where — never connects back to
state management decisions.

| Data/State Question | Impact If Unspecified |
|---|---|
| **Client vs. server state** | Implementer guesses — some data fetched on every render, some cached when it shouldn't be |
| **Cache invalidation** | Stale data shown after mutations. "I just added a task but it's not in the list." |
| **Optimistic updates** | Some mutations feel instant, others show spinners. Inconsistent UX. |
| **Cross-screen state** | Filters on page A lost when navigating to page B and back. Badge counts not synced. |
| **Real-time updates** | Does the task list auto-update when another user adds a task? Or only on refresh? |
| **Form state persistence** | User fills a long form, accidentally navigates away, loses everything. |
| **Derived/computed state** | Badge counts, aggregations, filtered views — computed where? Cached? |
| **URL as state** | Are filters, sort order, pagination reflected in the URL? (Affects shareability, back button) |
| **Loading granularity** | Entire page loading skeleton vs. individual component loading? |
| **Error granularity** | Entire page error vs. individual component error boundary? |

These are decisions that MUST be made before implementation. When the implementer makes
them ad hoc, the result is inconsistent data handling across screens — exactly the "behavior
all over the place" observation from the todo app test.

**Where it should be caught**: Two places:
1. **Bootstrap/Architecture** — High-level state management strategy (what tool, what
   patterns, where state lives). This is already partially covered by the architecture doc
   but should be more intentionally probed.
2. **Behavioral walkthrough** — Per-screen data requirements. "When data loads...", "when
   data changes elsewhere..." are natural walkthrough questions.

**Source**: Analysis of common frontend state management issues; real-world todo app
observation.

#### Finding 9: Error Recovery and Resilience — The Missing Safety Net

**Context**: The pipeline never discusses what happens when things go wrong at the system
level — not individual interaction errors (covered in behavioral specs) but systemic failure
modes.

**Analysis**:

| Resilience Concern | What The Implementer Needs | Currently Specified? |
|---|---|---|
| **Error boundaries** | Which components should isolate failures? Crash one widget, not the page? | No |
| **Retry strategy** | Automatic retry on failure? How many times? Exponential backoff? User-initiated? | No |
| **Offline behavior** | What works offline? Queue mutations? Read-only mode? No offline support? | No |
| **Session expiry** | Token expires mid-session. Silent refresh? Redirect to login? Preserve state? | No |
| **Rate limiting** | User hits API rate limit. Back off? Show warning? Degrade gracefully? | No |
| **Partial failure** | Dashboard loads 4/5 widgets. Show the 4? Show error for the 1? Block all? | No |
| **Recovery after crash** | Browser crash, tab accidentally closed. Restore state? Start fresh? | No |
| **Concurrent modifications** | Two tabs open, both editing. Last-write-wins? Conflict resolution? Lock? | No |

These aren't edge cases — they're normal conditions in any production app. The pipeline
should at minimum establish a project-wide resilience strategy during bootstrap, then
apply it consistently during implementation.

**Where it should be caught**:
1. **Bootstrap** — Ask about offline support, session handling, error recovery philosophy
2. **Architecture doc** — Resilience strategy (error boundary placement, retry policy)
3. **Behavioral walkthrough** — System-level error states per screen

**Source**: Analysis of common production app failure modes.

---

### Part VI: Edge Cases, Responsive, Animation, and Content

#### Finding 10: Edge Cases — The Long Tail of Failures

**Context**: AI-generated code is particularly weak at handling edge cases because edge
cases are underrepresented in training data.

**Analysis**:

Research shows AI-generated code has specific failure patterns: edge cases
underrepresented in training data, error handling paths overlooked (optimistic path bias),
boundary conditions not tested, concurrency issues not considered.

| Edge Case Category | Examples | Why AI Misses It |
|---|---|---|
| **Data boundaries** | Empty string, null, undefined, 10k+ char text, special characters, RTL text, emoji, zero-width chars | Training data is mostly clean/normal data |
| **Numeric boundaries** | 0, negative numbers, MAX_SAFE_INTEGER, floating point precision, NaN | Positive-path bias |
| **Collection boundaries** | Empty array, single item, 10k items, items with identical keys | Usually tested with 3-5 items |
| **Timing** | Race conditions, rapid clicks, slow networks, instant responses, concurrent requests | Async timing is hard to specify declaratively |
| **Input combinations** | Paste vs. type, drag-and-drop, autocomplete, password managers, browser autofill | Training data focuses on standard input |
| **Unicode** | Emoji in usernames, RTL in labels, combining characters, zero-width joiners | English-centric training data |
| **Display overflow** | Title that's 500 characters, 200 tags on one item, deeply nested content | Mockups use short placeholder text |
| **Browser differences** | Safari date inputs, Firefox focus behavior, Chrome autofill styling | Code tested in one browser |

**Where it should be caught**:
1. **Component-level** (tokens mode): How components handle boundary content (truncation,
   overflow, min/max constraints)
2. **Screen-level** (behavioral walkthrough): Brief "what could go wrong?" per interaction
3. **Spec generation**: Standard "Edge Cases" section based on component types used

**Source**: Research on AI-generated code failure patterns (1.7x more issues than human code).

#### Finding 11: Responsive Design — Beyond Layout Swaps

**Context**: The pipeline treats responsive design as a layout concern. But responsive also
involves feature adaptation, interaction pattern changes, and device-specific behavior.

**Analysis**:

| Responsive Aspect | Beyond Layout | Currently Captured? |
|---|---|---|
| **Feature adaptation** | Desktop: inline edit. Mobile: edit in separate screen | No |
| **Touch vs. mouse** | Hover previews → long-press on mobile. Right-click → swipe actions | No |
| **Touch targets** | 44px minimum on touch devices (Apple HIG). Desktop can be smaller. | No |
| **Orientation** | Landscape tablet = different layout than portrait tablet | No |
| **Input methods** | Physical keyboard shortcuts on desktop. Virtual keyboard pushing layout on mobile. | No |
| **Viewport interactions** | Safe areas (notch), fixed headers, virtual keyboard, pull-to-refresh | No |
| **Reduced motion** | `prefers-reduced-motion` — disable animations for users who need it | No |

**Where it should be caught**:
1. **Tokens mode** — Breakpoint tokens, touch target sizes, motion preferences
2. **Mockups mode** — Mobile variants showing feature differences (not just column stacking)
3. **Build plan** — Responsive as acceptance criteria, not deferred phase

**Source**: Apple HIG and Material Design responsive guidelines.

#### Finding 12: Animation and Micro-Interactions — The Polish Gap

**Context**: The pipeline generates static designs. Animations — which significantly impact
perceived quality and usability feedback — are never specified.

**Analysis**:

Animations serve functional purposes beyond aesthetics:

| Animation Type | Purpose | Impact If Missing |
|---|---|---|
| **Loading feedback** | Spinner, skeleton, progress bar | User doesn't know something is happening |
| **State transitions** | Fade in/out, slide, expand/collapse | Content appears/disappears jarringly |
| **Success confirmation** | Checkmark animation, toast slide-in | User unsure if action succeeded |
| **Error indication** | Shake, highlight, bounce | User doesn't notice the error |
| **Navigation transitions** | Page slide, crossfade | App feels like disconnected pages |
| **Hover/focus feedback** | Scale, color shift, elevation | Interactive elements feel static |
| **List reorder** | Animated insert/remove/reorder | Items pop in/out without context |

Most of these are not "nice to have" — they're usability features. A button that doesn't
show loading feedback causes users to click multiple times.

**Where it should be caught**:
1. **Tokens mode** — Animation tokens: duration scale, easing curves, `prefers-reduced-motion`
2. **Mockups mode** — Transition annotations on mockups (described, not shown)
3. **Build plan** — Animation as acceptance criteria ("Toast enters with slide + fade, 200ms")

**Source**: Material Motion documentation; UX research on micro-interaction importance.

#### Finding 13: Content Strategy — The Words Nobody Designs

**Context**: The pipeline generates placeholder content in mockups. Real content —
error messages, empty state copy, labels, help text — is never specified.

**Analysis**:

| Content Type | Why It Matters | Currently Specified? |
|---|---|---|
| **Empty state copy** | "No tasks yet" vs "Create your first task to get started" — tone, helpfulness, CTA | No |
| **Error messages** | "Error 500" vs "Something went wrong. Try again in a few minutes." | No |
| **Validation messages** | "Invalid" vs "Email must include an @ symbol" — specific, actionable | No |
| **Loading text** | "Loading..." vs "Fetching your tasks..." — context-specific | No |
| **Confirmation dialogs** | "Are you sure?" vs "Delete 'Project Alpha'? This can't be undone." | No |
| **Help text** | Inline guidance, tooltips, onboarding tips | No |
| **Truncation rules** | How to shorten long text — ellipsis? Fade? Word boundary? | No |
| **Pluralization** | "1 task" vs "2 tasks" vs "0 tasks" (or "No tasks") | No |
| **Date/time formatting** | "2 hours ago" vs "Feb 9, 2026" vs "2026-02-09" | No |

The implementer makes ALL of these decisions ad hoc. The result is inconsistent content
across the app.

**Where it should be caught**:
1. **Behavioral walkthrough** — When discussing states, pin down actual copy
2. **Design system** — Content patterns in DESIGN_SYSTEM.md (error message format,
   empty state format, confirmation dialog format)

**Source**: Analysis of design-to-code handoff gaps; content strategy best practices.

---

### Part VII: Testing and Validation

#### Finding 14: Browser Validation Tooling for Autopilot

**Context**: The autopilot mode needs to validate not just visual output (screenshot
comparison) but behavioral correctness (click flows, form submission, navigation, error
handling) and accessibility.

**Analysis**:

Three browser automation tools are available to Claude Code, each with different strengths:

| Tool | Type | Context Cost | Headless | Behavioral Testing | Best For |
|---|---|---|---|---|---|
| **Vercel agent-browser** | CLI (Bash) | ~280 chars/snapshot | Yes | Yes — full Playwright under the hood | Long autopilot runs (context-efficient) |
| **Playwright MCP** | MCP server | ~13.7k for schemas | Yes | Yes — 26 tools including form fill, click, assertions | Cross-browser, test generation, CI/CD |
| **Claude Code /chrome** | Built-in MCP (beta) | ~26 tools, moderate | No | Yes — click, fill, navigate, evaluate JS | Quick debugging, authenticated sites |

**Detection hierarchy for autopilot**:

1. **Check for agent-browser**: `which agent-browser` or check for the skill in
   `.claude/skills/agent-browser/`. Most context-efficient — ideal for autopilot.
2. **Check for Playwright MCP**: ToolSearch for `mcp__playwright__*` tools. Most capable —
   cross-browser, headless, test script generation.
3. **Check for /chrome**: ToolSearch for `mcp__claude-in-chrome__*` tools. Built-in, no
   extra install — good fallback but requires visible Chrome window.
4. **No browser tool**: Warn user that autopilot's UI validation is limited to static
   analysis. Suggest installing agent-browser for full autopilot capability.

**How behavioral tests work with each tool**:

For a task with acceptance criterion "submitting an empty form shows inline validation errors":

- **agent-browser**: `agent-browser open http://localhost:3000/tasks` → `agent-browser snapshot -i` → `agent-browser click @e5` → `agent-browser snapshot -i` → check for error elements
- **Playwright MCP**: `browser_navigate` → `browser_click` on submit → `browser_snapshot` → check accessibility tree for error messages
- **/chrome**: `navigate_page` → `click` on submit → `take_snapshot` → check DOM for error elements

All three can also run accessibility checks (via axe-core injection or accessibility
tree inspection).

**Source**: Web research on agent-browser (Vercel), Playwright MCP (Microsoft), Claude Code
/chrome documentation.

#### Finding 15: Testing Strategy Needs a Home in the Pipeline

**Context**: Where should testing strategy live? Currently, it's nowhere — the implementer
improvises.

**Analysis**:

Testing touches three pipeline stages:

**A) Bootstrap/TDD — Testing philosophy** (high-level):
- What testing framework? (vitest, jest, pytest, etc.)
- What testing approach? (TDD, BDD, integration-first, snapshot testing?)
- What coverage expectations? (critical paths only? comprehensive?)

**B) Design phase — Behavioral test cases** (per-screen):
- Each behavioral walkthrough naturally produces test scenarios:
  "Submit empty form → see error" is both a behavioral spec AND a test case
- These should be captured in UI_SCREENS.md alongside the behavioral contracts

**C) Spec generation — Implementation test specs** (per-module):
- Concrete test file structure, test data, mocking strategy
- Generated from behavioral contracts + acceptance criteria

**Recommendation**: Testing strategy should be addressed at ALL three levels — woven into
existing stages rather than as a separate research cycle. Each stage captures its
appropriate level of testing detail.

**Source**: Analysis of implementer start-mode.md spec coverage check; ATDD methodology.

#### Finding 16: The Specification-Testing Duality

**Context**: Cross-cutting finding that applies to ALL gap categories above.

**Analysis**:

Acceptance Test-Driven Development (ATDD) reveals a powerful insight: behavioral
specifications and acceptance test cases are the SAME artifact expressed differently.

| Behavioral Spec | Test Case |
|---|---|
| "Submit empty form → see inline validation" | `test('shows validation on empty submit', ...)` |
| "Loading state shows skeleton for 0-3s" | `test('shows skeleton while loading', ...)` |
| "Empty state shows CTA to create first task" | `test('shows CTA on empty state', ...)` |
| "Modal traps focus, Escape closes" | `test('traps focus in modal', ...)` |
| "Error toast appears on API failure" | `test('shows error toast on failure', ...)` |
| "Tab order follows visual layout" | `test('focus order matches layout', ...)` |

This means solving the behavioral specification gap ALSO solves the testing gap as a side
effect. Every behavioral contract captured during the design phase is a test case the
autopilot can execute. Storybook interaction tests demonstrate this duality: play functions
that serve as both documentation AND tests.

**Source**: ATDD methodology; Storybook interaction testing documentation.

---

### Part VIII: Full-Stack Testing — Unit, Integration, and Test Architecture

#### Finding 17: Unit Testing Has No Specification Surface

**Context**: The autopilot writes unit tests per-task as a verification mechanism (Step 3c).
But there's no upstream specification of WHAT should be unit tested, HOW modules should be
isolated for testing, or WHERE mock boundaries live. The implementer improvises all of this.

**Analysis**:

The current pipeline handles unit testing as follows:
- **Bootstrap**: No testing questions
- **TDD/Architecture**: May mention a framework ("use vitest") but no test architecture
- **Spec generation**: Specs define types, contracts, edge cases — but no test cases
- **Start mode**: Checks if docs mention testing; offers 3 paths; but all 3 are deferred
- **Autopilot 3c**: After implementing a task, translates acceptance criteria to tests

The problem with autopilot-generated tests: they verify the code the autopilot just wrote,
using the assumptions the autopilot just made. This is circular — the tests confirm the
implementation matches itself, not that it matches the specification correctly. It's like
grading your own homework.

What's missing per stack layer:

| Layer | What Should Be Unit Tested | What The Implementer Needs | Currently Specified? |
|---|---|---|---|
| **Data layer** | Schema validation, migration correctness, constraint enforcement, computed fields, triggers | Which fields have validation? What constraints exist? What should computed fields return? | Partially (specs define schemas, but not what to test) |
| **Service layer** | Business logic, authorization rules, error handling, state transitions, event emission | What are the business rules? What inputs produce what outputs? What should throw? | Partially (specs define contracts, but not boundary conditions) |
| **API layer** | Request validation, response shapes, status codes, auth enforcement, rate limiting, error formats | What's the exact response shape for each status code? What malformed inputs should be rejected? | Partially (OpenAPI specs if generated, but not failure modes) |
| **Utility functions** | String manipulation, date formatting, data transformation, parsers | Expected inputs → outputs with edge cases | No |
| **UI components** | Render states, prop handling, event emission, accessibility attributes | What props? What states render what? What events fire when? | Partially (design system, but gaps per F3) |

**Mock boundaries — the critical unspecified decision**:

The biggest unit testing question the implementer faces: what gets mocked and what doesn't?

| Mock Boundary Decision | Impact If Wrong |
|---|---|
| Mock the database in service tests? | If yes: fast tests but miss constraint violations. If no: slow tests, need test DB. |
| Mock HTTP in API tests? | If yes: miss serialization issues. If no: tests depend on running server. |
| Mock external APIs? | Always yes — but with what fixtures? What response shapes? |
| Mock the auth layer? | If yes: miss permission bugs. If no: every test needs auth setup. |
| Mock the file system? | Depends on what the code does with files. |

These decisions affect the entire test architecture and must be consistent project-wide.
When the autopilot makes them per-task, the result is: service A mocks the DB, service B
doesn't, service C partially mocks it. Three different testing approaches for the same layer.

**Where it should be caught**:
1. **TDD/Architecture** — Test architecture section: mock boundaries, test data strategy,
   testing framework configuration
2. **Spec generation** — Per-spec test expectations: what inputs produce what outputs, what
   should throw, what edge cases need coverage
3. **Start mode** — Test tasks should be generated alongside implementation tasks, not
   as an afterthought

**Source**: Analysis of autopilot-mode.md Step 3c; analysis of common AI-generated test
quality issues; analysis of spec-gen output vs testing needs.

---

#### Finding 18: Integration Testing Is Entirely Absent

**Context**: The pipeline has NO concept of integration testing. Autopilot tests verify
individual tasks in isolation. Nothing verifies that components work together across layers.

**Analysis**:

Integration testing verifies the SEAMS between components. These seams are exactly where
AI-generated code breaks most often — individual components work, but their composition
doesn't. (This is the same root cause as the behavioral gap, but at the code level instead
of the UI level.)

| Integration Boundary | What Should Be Tested | Currently Specified? |
|---|---|---|
| **API → Service → DB** | Full request lifecycle: HTTP request → handler → service logic → DB write → response | No |
| **Auth flow** | Login → token issue → protected request → token validation → authorized access | No |
| **Service → Service** | Service A calls Service B — do the contracts match? Error propagation correct? | No |
| **Frontend → API** | Component sends request → API returns → component updates state → UI reflects change | No |
| **Webhook → Handler → Processing** | External event → webhook handler → queue → processing → side effects | No |
| **Migration → Seed → Query** | Schema migration runs → seed data loads → queries return expected shapes | No |
| **Error propagation** | DB constraint violation → service error → API error response → frontend error display | No — this is the most common integration failure |
| **Cross-module state** | User creates item on page A → navigates to page B → item appears in list | No |

**The cross-layer contract gap**:

The spec generator produces specs per bounded context (Data Layer spec, API Layer spec,
UI Layer spec). Each spec is internally consistent. But nobody verifies the CONTRACTS
BETWEEN specs:
- Does the API response shape match what the frontend expects?
- Does the service error format match what the API handler catches?
- Does the DB schema match the ORM model the service uses?

The spec consistency review (cl-implementer review mode) checks five dimensions — type
consistency, naming, contract consistency, completeness, traceability — but it checks
these WITHIN the spec set, not against actual runtime behavior. It's a static check of
documents, not a dynamic check of code.

**Where it should be caught**:
1. **Spec generation** — Cross-spec integration contracts: "API spec endpoint X returns
   shape Y, which Frontend spec component Z consumes." These explicit connections become
   integration test cases.
2. **Start mode** — Integration test tasks: after implementing Data + API layers,
   generate integration test tasks that verify the seams.
3. **Autopilot** — After completing a layer or area, run integration tests for all
   completed cross-layer boundaries. Not per-task — per-milestone.

**Source**: Analysis of spec-gen review mode (static, not dynamic); analysis of the todo
app failure pattern (components worked individually, failed in composition).

---

#### Finding 19: Test Architecture — The Missing Blueprint

**Context**: Testing is not a single concern — it's an architecture that spans the full
stack. The pipeline currently has no place for test architecture decisions.

**Analysis**:

A test architecture answers these questions before any test is written:

**1. Test Pyramid / Testing Strategy**

| Level | What | Quantity | Speed | Where Specified? |
|---|---|---|---|---|
| **Unit** | Individual functions, classes, components in isolation | Many (50-70% of tests) | Fast (ms) | Nowhere |
| **Integration** | Cross-module boundaries, API contracts, DB operations | Moderate (20-30%) | Medium (100ms-1s) | Nowhere |
| **E2E / Browser** | Full user flows through the running application | Few (5-10%) | Slow (seconds) | Partially (autopilot 3e) |

The pipeline should specify the STRATEGY (what level gets what coverage) at the architecture
level, not leave it to the implementer's judgment.

**2. Test Environment**

| Decision | Options | Impact |
|---|---|---|
| **Test database** | In-memory (SQLite)? Test schema on real DB? Docker container? | Affects data layer test reliability and speed |
| **Test API server** | Supertest (no server)? Running server on test port? | Affects API test isolation and setup complexity |
| **Mock server for external APIs** | MSW (Mock Service Worker)? nock? Manual mocks? | Affects external dependency isolation |
| **Browser environment** | jsdom? happy-dom? Real browser (Playwright)? | Affects UI test fidelity |
| **Test data** | Fixtures (static JSON)? Factories (dynamic generation)? Seeds (DB preload)? | Affects test maintainability and data coverage |
| **Environment variables** | `.env.test`? Hardcoded? Injected? | Affects test portability |

None of these are specified anywhere in the pipeline. The autopilot detects a testing
framework (Step 3c.4) but doesn't set up any infrastructure.

**3. Test Data Strategy**

| Approach | When To Use | Currently Specified? |
|---|---|---|
| **Fixtures** | Static test data in JSON/TS files. Good for snapshots, API response mocking. | No |
| **Factories** | Dynamic test data generation (e.g., `createUser({ name: 'test' })`). Good for unit tests needing varied data. | No |
| **Seeds** | DB preload scripts for integration tests. Good for consistent state. | No |
| **Generated** | Faker/random data for property-based testing. Good for finding edge cases. | No |

The autopilot writes tests that inline their test data (`const user = { name: 'Test', email: 'test@test.com' }`). This works for one test but creates data duplication across hundreds
of tests — and the test data often doesn't match the actual schema constraints.

**4. What A Test Spec Should Look Like**

For each module/area in the implementation specs, a corresponding test spec should define:

```markdown
### Testing: Auth Module

**Unit Tests (service layer)**:
| Function | Input | Expected Output | Edge Cases |
|----------|-------|-----------------|------------|
| `validateCredentials(email, pass)` | Valid credentials | `{ user, token }` | Empty email, invalid format, SQL injection attempt |
| `validateCredentials(email, pass)` | Invalid password | throws `AuthError('invalid_credentials')` | After 5 failures: throws `AuthError('account_locked')` |
| `refreshToken(token)` | Valid refresh token | New access token | Expired token, revoked token, malformed token |

**Mock boundaries**: DB is mocked (use fixtures). External auth provider (if any) is mocked.

**Integration Tests (API layer)**:
| Flow | Steps | Assertions |
|------|-------|------------|
| Login flow | POST /auth/login with valid creds → verify response shape → use token for GET /me → verify user data | Response matches `LoginResponse` type from API spec. Token contains expected claims. |
| Token refresh | POST /auth/refresh with valid refresh token → verify new access token → use it for a protected endpoint | New token works. Old token still valid until expiry. |
| Auth failure propagation | POST /auth/login with invalid creds → verify error response → verify no token issued → verify attempt logged | Error response matches `ErrorResponse` type. Status 401. No Set-Cookie header. |

**Test data**: Use `createUser` factory with `password: 'test-password-hash'` fixture.

**Test environment**: Requires test database with auth schema migrated. No external services.
```

This is what the implementer NEEDS but never gets. The spec generator produces implementation
specs (types, contracts, edge cases) but not test specs. And the autopilot can't generate
proper tests without them.

**Where it should be caught**:
1. **Bootstrap** — Ask about testing strategy (unit, integration, e2e balance), testing
   framework, test data approach. Record in DECISIONS.md.
2. **TDD/Architecture** — Test architecture section: pyramid strategy, environment setup,
   mock boundaries, data strategy. This is a SYSTEM-LEVEL decision, not per-task.
3. **Spec generation** — Generate test specs alongside implementation specs. Each
   implementation spec gets a companion test spec defining: unit test cases, mock boundaries,
   integration test flows, test data requirements.
4. **Start mode** — Generate test tasks from test specs. Test tasks are FIRST-CLASS tasks
   in TASKS.md, not by-products of implementation tasks. Integration test tasks appear after
   the areas they span are complete.
5. **Autopilot** — Two test execution modes:
   a) Per-task: unit tests run immediately after implementation (existing behavior)
   b) Per-milestone: integration tests run after a layer/area completes (NEW)

**Source**: Analysis of spec-gen Step 4 output; analysis of autopilot-mode.md Step 3c;
analysis of test architecture best practices; observation that autopilot tests verify
themselves rather than specs.

---

#### Finding 20: The Test Spec as a Pipeline Artifact

**Context**: The pipeline currently produces implementation specs. It should also produce
test specs as a parallel artifact.

**Analysis**:

The key insight: **test specifications are not test code**. They're design artifacts that
describe WHAT should be tested and HOW — analogous to how implementation specs describe
what should be built and how. The spec generator already does the hard work of reading all
system docs and extracting types, contracts, and edge cases. Generating test specs from
the same input is a natural extension.

**Proposed artifact: `{docsRoot}/specs/TEST_SPEC.md`**

```markdown
# Test Specification

**Generated alongside**: [implementation spec manifest reference]
**Testing framework**: [from DECISIONS.md or detected from project]
**Test data strategy**: [from DECISIONS.md]

## Test Architecture

### Mock Boundaries
| Layer | Mock? | Rationale |
|-------|-------|-----------|
| Database | Yes (unit), No (integration) | Unit tests use fixtures. Integration tests use test DB. |
| External APIs | Always | Use MSW/nock with recorded fixtures. |
| Auth | Mocked in non-auth tests | Auth tests use real auth flow. Others use `createAuthenticatedContext()`. |
| File system | Yes | Use in-memory fs or temp dirs. |
| Time/dates | Yes | Use `vi.useFakeTimers()`. All dates use factory-generated values. |

### Test Data
| Entity | Factory | Key Fixtures |
|--------|---------|-------------|
| User | `createUser(overrides?)` | `adminUser`, `disabledUser`, `unverifiedUser` |
| Task | `createTask(overrides?)` | `completedTask`, `overdueTasks(5)` |

## Per-Module Test Specs

### Data Layer: Database Schema
**Unit tests**: Migration reversibility, constraint validation, computed field correctness
**Integration tests**: Seed → query round-trip, concurrent write handling

### Service Layer: Auth Service
**Unit tests**: [table of function → input → output → edge cases]
**Mock boundary**: DB mocked. Password hasher real (fast enough for tests).
**Integration tests**: Full login → token → protected access flow

### API Layer: Auth Endpoints
**Unit tests**: Request validation, response shape per status code
**Integration tests**: HTTP request → handler → service → DB → response
**Contract tests**: Response shapes match frontend type expectations

### UI Layer: Login Form
**Unit tests**: Render states (empty, filled, submitting, error), accessibility attributes
**Integration tests**: Submit → API call → state update → navigation
**Browser tests**: Full login flow (from behavioral walkthrough test scenarios)
```

**How test specs relate to behavioral specs**:

The behavioral walkthrough (Finding 4) produces TEST SCENARIOS for UI screens:
"Submit empty form → inline validation." These are E2E/browser-level tests.

Test specs cover the FULL PYRAMID beneath those:
- The validation logic is unit tested in the service layer
- The API error response is integration tested
- The form → API → error → display chain is browser tested

The behavioral walkthrough produces the top of the pyramid. The test spec produces the
middle and bottom.

**Where it should be caught**: Spec generation. The test spec is generated at the same time
as implementation specs — from the same system doc input. It's a parallel output, not a
sequential step.

**Source**: Analysis of spec-gen mode; analysis of test pyramid methodology; observation that
autopilot per-task tests cover only one pyramid level inconsistently.

---

### Part IX: Security — The Completely Absent Dimension

#### Finding 21: Security Is Not an Optional Concern — It's a Specification Gap

**Context**: The pipeline has ZERO security awareness. No skill asks about security
requirements, no spec includes authentication/authorization contracts, no checklist
verifies secure patterns, and no validation tests for security. The current research
marked security as "out of scope" — but that framing is itself a gap.

**Analysis**:

Security is not a separate testing concern — it's a specification concern. Auth flows,
input validation, CORS policies, CSP headers, secrets management, and data sanitization
are all things that need to be SPECIFIED before implementation. When left to the
implementer, the result is: some endpoints validate input, others don't. Some routes
check auth, others forget. CORS is configured differently in dev vs. prod with no spec
for either.

| Pipeline Stage | Security Treatment | What's Missing |
|---|---|---|
| **Bootstrap** | No security questions | Authentication strategy, authorization model, compliance requirements, data sensitivity classification |
| **PRD** | May mention "secure" as a buzzword | Concrete security requirements: auth method, session management, data encryption |
| **Architecture** | May describe auth at high level | Threat model, trust boundaries, input validation strategy, secrets management |
| **Design** | No security awareness | Secure UX: password requirements shown to user, session timeout behavior, CSRF token handling |
| **Spec generation** | Inherits upstream gap | No auth spec per endpoint, no input validation rules, no rate limiting, no CORS policy |
| **Implementation** | Ad hoc security decisions | No security acceptance criteria, no OWASP checklist, no dependency vulnerability check |
| **Autopilot** | No security testing | No SQL injection testing, no XSS testing, no auth bypass testing |

**What should be specified per layer**:

| Layer | Security Specification Needed |
|---|---|
| **Data** | Encryption at rest, PII field identification, data retention rules, column-level access |
| **API** | Auth required per endpoint, rate limits, input validation rules, CORS policy, CSP headers |
| **Service** | Authorization rules (who can do what), input sanitization, secrets injection (not hardcoded) |
| **Frontend** | Secure storage of tokens, XSS prevention, CSRF handling, sensitive data in URL params |
| **Infrastructure** | TLS configuration, secrets management (env vars vs vault), SBOM for dependencies |

**Industry evidence**: Research shows 49% of dependencies imported by AI coding agents have
known vulnerabilities, and 34% are hallucinated (don't exist in any package registry). Only
1 in 5 AI-recommended dependencies are safe to use. AI-generated code is systematically
weaker on security than human-written code — secure patterns are underrepresented in
training data.

OWASP 2025 data on AI-generated code vulnerability multipliers:

| Vulnerability Type | AI Code Risk vs. Human Code |
|---|---|
| Improper password handling | 1.88x more likely |
| Insecure direct object references (IDOR) | 1.91x more likely |
| Cross-site scripting (XSS) | 2.74x more likely |
| Insecure deserialization | 1.82x more likely |

These multipliers mean that AI-generated code without security specifications will
systematically produce MORE vulnerabilities than human code would — and the pipeline
currently has no mechanism to counteract this.

**Where it should be caught**:
1. **Bootstrap** — Security requirements: auth strategy, compliance level, data sensitivity
2. **Architecture** — Threat model, trust boundaries, secrets management strategy
3. **Spec generation** — Per-endpoint auth requirements, input validation rules, security
   acceptance criteria. A SECURITY_SPEC.md alongside implementation and test specs.
4. **Design checklist** — Secure UX patterns (password feedback, session timeout, error
   messages that don't leak information)
5. **Autopilot** — Security smoke tests: SQL injection on inputs, XSS on outputs, auth
   bypass on protected endpoints

**Source**: Endor Labs State of Dependency Management 2025; OWASP Top 10 2025;
research on AI-generated code security vulnerabilities; analysis of pipeline skills.

#### Finding 22: Error Taxonomy — The Unstructured Error System

**Context**: The pipeline handles errors as emergent per-screen concerns (behavioral
walkthrough) and per-task concerns (fix tasks). But there's no SYSTEM-LEVEL error
taxonomy — no consistent error format, no error code system, no propagation chain
specification.

**Analysis**:

The behavioral walkthrough (Finding 4) captures "what happens when the form fails?"
per screen. But it never asks: "What does an error LOOK LIKE in this system?"

Without an error taxonomy, the implementer makes these decisions per-endpoint:

| Error Decision | What Happens Without A Taxonomy |
|---|---|
| **Error format** | Some endpoints return `{error: "message"}`, others return `{code: "INVALID_INPUT", message: "...", details: [...]}`, others return just HTTP status codes |
| **Error codes** | No standard error code system. Frontend can't programmatically handle different error types |
| **Error propagation** | DB constraint → service layer → API layer → frontend: each layer transforms the error differently. No chain specification |
| **Validation errors** | Some return all errors at once, some return first error only. Field names may not match frontend form field names |
| **Auth errors** | 401 vs 403 distinction inconsistent. Token expiry vs invalid token vs insufficient permissions — different error shapes |
| **Rate limiting** | Some return 429 with `Retry-After`, some return 403, some silently fail |

**What a system error taxonomy specifies**:

```markdown
## Error Response Format (all endpoints)
{
  "code": "ERROR_CODE",      // Machine-readable, SCREAMING_SNAKE
  "message": "Human-readable description",
  "details": [...],           // Optional: field-level errors for validation
  "requestId": "uuid"        // For support/debugging correlation
}

## Error Categories
| Category | Code Prefix | HTTP Status | Example |
|---|---|---|---|
| Validation | VALIDATION_* | 400 | VALIDATION_REQUIRED_FIELD |
| Authentication | AUTH_* | 401 | AUTH_TOKEN_EXPIRED |
| Authorization | AUTHZ_* | 403 | AUTHZ_INSUFFICIENT_PERMISSIONS |
| Not Found | NOT_FOUND_* | 404 | NOT_FOUND_USER |
| Conflict | CONFLICT_* | 409 | CONFLICT_DUPLICATE_EMAIL |
| Rate Limit | RATE_LIMIT | 429 | RATE_LIMIT (with Retry-After header) |
| Server Error | INTERNAL_* | 500 | INTERNAL_DATABASE_ERROR |
```

**Where it should be caught**:
1. **Bootstrap/Architecture** — Error handling philosophy: format, code system, propagation
2. **Spec generation** — Error taxonomy section in API specs. Per-endpoint error responses
   with specific codes and conditions
3. **Behavioral walkthrough** — Frontend error display patterns (toast, inline, page-level)
   referencing the error taxonomy

**Source**: REST API best practices; analysis of pipeline spec-gen output; observation
that error handling is the most common source of frontend-backend integration failures.

---

### Part X: Infrastructure and Operations

#### Finding 23: Environment Configuration — The Missing Layer

**Context**: The pipeline produces code but never specifies HOW that code runs: environment
variables, secrets management, build configuration, feature flags. Every real project
needs environment configuration, and when it's unspecified, the implementer hardcodes
values, commits secrets, or creates inconsistent config patterns.

**Analysis**:

| Configuration Concern | What The Implementer Needs | Currently Specified? |
|---|---|---|
| **Environment variables** | What env vars exist, what they default to, which are required | No |
| **Secrets management** | Where API keys, database passwords, tokens go. Env vars? Vault? OS keychain? | No |
| **Build configuration** | TypeScript tsconfig options, bundler config, path aliases | No |
| **Feature flags** | How to toggle incomplete features during development. Environment-based? Runtime? | No |
| **Per-environment differences** | What differs between dev, staging, production. Which URLs, which DB, which features | No |
| **Config validation** | What happens if a required env var is missing at startup. Crash? Warn? Default? | No |
| **Development setup** | What a new developer needs to run the project. Docker? Local services? Seed data? | No |

Without environment specification, the implementer:
- Hardcodes a database URL that works on their machine but not CI
- Puts API keys in a `.env` file with no documentation of what keys are needed
- Uses `process.env.NODE_ENV` inconsistently (some code checks it, some doesn't)
- Creates different config patterns in different modules

**Where it should be caught**:
1. **Bootstrap** — "How will this be deployed?" (Docker? Vercel? bare metal?)
2. **Architecture** — Config strategy section: env vars, secrets, feature flags
3. **Spec generation** — CONFIG_SPEC.md or a section in each spec: required env vars,
   default values, sensitive values (secrets)
4. **Start mode** — Config infrastructure task: `.env.example`, config validation,
   development setup script

**Source**: Analysis of common "works on my machine" failures; analysis of bootstrap
questions (no deployment/config probing).

#### Finding 24: Data Migration and Evolution — Schema Exists, Path Doesn't

**Context**: Spec generation can produce data model specs (JSON Schema, SQL DDL). But specs
describe the TARGET schema, not HOW TO GET THERE. Migration strategy, rollback planning,
seed data, and zero-downtime migration — all unspecified.

**Analysis**:

| Migration Concern | What The Implementer Needs | Currently Specified? |
|---|---|---|
| **Migration strategy** | Which tool (Drizzle Kit, Prisma Migrate, Knex, raw SQL)? Auto-generate or hand-write? | No (context files may cover the tool, not the strategy) |
| **Migration ordering** | When multiple schema changes exist, what order? Dependencies between migrations? | No |
| **Rollback strategy** | Can migrations be reversed? What's the rollback procedure? | No |
| **Seed data** | What data must exist for the app to function? Admin account? Default settings? Reference data? | No |
| **Development data** | Sample data for development. Realistic enough to test edge cases, small enough to be fast | No |
| **Zero-downtime migration** | For production: can the migration run while the old code is still serving? | No |
| **Data transformation** | When a column changes type or splits, what happens to existing data? | No |

This matters because migration code is some of the most dangerous code in a project —
a bad migration can destroy production data. The spec says "users table has email column
(unique, not null)" but never says "migrate existing usernames to email format with
validation."

**Where it should be caught**:
1. **Spec generation** — Migration notes alongside schema specs: ordering constraints,
   breaking changes, rollback considerations
2. **Start mode** — Seed data task, migration verification task
3. **Autopilot** — After schema tasks: run migration, verify schema matches spec, seed
   test data

**Source**: Analysis of data model spec output vs. actual migration needs.

#### Finding 25: Observability — The Invisible Instrumentation Gap

**Context**: The pipeline has no concept of observability as a specification concern. What
gets logged, what metrics matter, what health checks exist — all left to the implementer.

**Analysis**:

Observability affects CODE DESIGN. If you need structured logging, your service layer
needs a logger injected. If you need request tracing, your middleware needs trace
propagation. If you need health checks, your server needs health endpoints. These are
not afterthoughts — they're architectural decisions that change how code is written.

| Observability Concern | Impact If Unspecified |
|---|---|
| **Logging** | Inconsistent log format (some JSON, some plaintext). Sensitive data in logs. No correlation IDs |
| **Metrics** | No request latency tracking. No error rate monitoring. No business metrics |
| **Health checks** | No `/health` endpoint. No readiness/liveness distinction. Deployment health unknown |
| **Tracing** | No distributed tracing. Cross-service debugging requires log correlation by timestamp |
| **Error tracking** | No Sentry/Bugsnag integration. Errors visible only in logs |
| **Structured logging** | Some code uses `console.log`, some uses the logger. No consistent context fields |

**Where it should be caught**:
1. **Bootstrap** — "How will you monitor this in production?" (observability tooling)
2. **Architecture** — Observability strategy: logging framework, metric collection,
   tracing approach, health check endpoints
3. **Spec generation** — Per-module: what's logged at what level. Health check endpoint
   spec. Error tracking integration spec
4. **Start mode** — Observability infrastructure task: logger setup, health endpoint,
   metric collection

**Source**: Analysis of pipeline skills (zero observability mentions); research on
observability-as-code practices; observation that instrumentation retrofit is expensive.

---

### Part XI: Cross-Boundary Consistency

#### Finding 26: API Design Conventions — The Missing Style Guide

**Context**: Spec generation produces individual endpoint specs. But there's no SYSTEM-LEVEL
API style guide that ensures all endpoints follow the same conventions.

**Analysis**:

| API Convention | Why It Needs System-Level Specification |
|---|---|
| **Error response format** | See Finding 22. Every endpoint must return errors in the same shape |
| **Pagination** | Cursor-based? Offset-based? What params? (`page`/`limit` vs `cursor`/`take`) Response envelope? |
| **Filtering** | Query params? JSON body? What operators? (`?status=active` vs `?filter[status]=active`) |
| **Sorting** | `?sort=name` vs `?sort_by=name&order=asc` vs `?sort=-name` |
| **Naming** | Plural or singular resources? (`/users` vs `/user`). camelCase or snake_case in JSON? |
| **Versioning** | URL path (`/v1/users`) vs header (`Accept: application/vnd.api+json;version=1`)? |
| **Rate limiting headers** | `X-RateLimit-Remaining`, `Retry-After`? Standardized or custom? |
| **Envelope** | `{data: [...], meta: {total, page}}` vs raw array? Consistent across all list endpoints? |

Without these conventions, each spec generates endpoint-specific decisions. Endpoint A uses
cursor pagination, Endpoint B uses offset, Endpoint C returns an unwrapped array. The
frontend has to handle three different patterns.

The spec consistency check (cl-implementer review) checks type and naming consistency but
not API CONVENTION consistency — it doesn't know what pagination style was chosen.

**Where it should be caught**:
1. **Bootstrap/Architecture** — API style decisions recorded in DECISIONS.md
2. **Spec generation** — API conventions preamble that all endpoint specs inherit:
   error format, pagination style, naming, filtering, envelope
3. **Spec consistency check** — New dimension: API convention adherence

**Source**: Analysis of spec-gen output and spec consistency check dimensions.

#### Finding 27: Type Safety Across the Stack — The Shared Types Problem

**Context**: Frontend specs define TypeScript types. Backend specs define TypeScript types.
Are they the same types? The spec consistency check verifies contract consistency at the
SPEC level, but at IMPLEMENTATION time, nothing ensures shared types stay shared.

**Analysis**:

The spec consistency check (Dimension 3: Contract Consistency) catches spec-level
mismatches — "API spec says `userId: string` but frontend spec says `userId: number`."
Good. But at implementation time:

| Type Safety Problem | What Goes Wrong |
|---|---|
| **Duplicated types** | Backend defines `User` type. Frontend defines its own `User` type. They drift |
| **No shared type source** | Should types be generated from API spec? Shared package? Manual sync? |
| **Serialization gaps** | Backend `Date` → JSON `string` → Frontend `Date`. Parsing format unspecified |
| **Optional field drift** | Backend adds optional field. Frontend doesn't know about it. No compile error |
| **Enum value drift** | Backend adds new status enum value. Frontend switch statement doesn't handle it |

This is an ARCHITECTURAL decision that must be made before implementation:

| Approach | Tradeoff |
|---|---|
| **Shared types package** | Single source of truth. But: build complexity, monorepo required |
| **Generated from API spec** | OpenAPI → TypeScript. But: generation step, stale if spec changes |
| **Manual sync** | Simple. But: drift is inevitable, no compile-time safety |
| **Runtime validation** | Zod/Yup on both ends. But: validation code duplicated, schema drift |

**Where it should be caught**:
1. **Architecture** — Type sharing strategy: shared package, generated, manual
2. **Spec generation** — Explicit shared types section: which types cross the boundary,
   serialization format
3. **Start mode** — Type infrastructure task: shared types setup, generation pipeline

**Source**: Analysis of spec consistency check vs. implementation reality; common
frontend-backend integration failure patterns.

#### Finding 28: Third-Party Integration Contracts — Beyond Library Context

**Context**: Context files capture library API knowledge (correct imports, breaking changes).
But external SERVICE integrations (Stripe, Twilio, Auth0, AWS S3) have contracts that are
completely different from library knowledge and are never captured.

**Analysis**:

Library context answers: "How do I use this library correctly?"
Integration contracts answer: "What does this external service expect and return?"

| Integration Aspect | Library Context Covers? | What's Actually Needed |
|---|---|---|
| **Webhook payload shapes** | No | Exact JSON shape Stripe sends for `payment_intent.succeeded` |
| **OAuth callback flows** | No | Redirect URLs, token exchange steps, scope requirements |
| **API rate limits** | No | Stripe: 100 req/sec. Auth0: 1000 tokens/min. Per-endpoint limits |
| **Error responses** | No | Stripe error codes, retry-able vs. fatal, idempotency keys |
| **Sandbox/test mode** | No | Test API keys, test card numbers, webhook simulation |
| **Required headers** | No | Stripe-Version header, idempotency-key for POST requests |
| **SLA and latency** | No | Expected response times, timeout recommendations |

When the implementer encounters a Stripe integration task, they either:
- Read Stripe docs during implementation (slow, error-prone, context-expensive)
- Rely on LLM training data about Stripe (may be stale — API version changes)
- Use a context file about the Stripe SDK (covers the SDK, not the API contract)

**Where it should be caught**:
1. **Research** — When the project has external integrations, research their contracts
2. **Spec generation** — Integration spec per external service: endpoints used, payload
   shapes, error handling, rate limits, test mode
3. **Context files** — Extend context mode to cover service contracts, not just library APIs

**Source**: Analysis of context-mode.md scope (library-only); observation that external
service integration is one of the highest-error implementation areas.

#### Finding 29: Dependency Compatibility — The Cross-Library Blind Spot

**Context**: Context files capture individual library knowledge. But library INTERACTIONS —
compatibility, peer dependency conflicts, conflicting patterns — are invisible.

**Analysis**:

| Compatibility Problem | Example | Context Files Catch It? |
|---|---|---|
| **Peer dependency conflict** | React 19 + an older component library that requires React 18 | No — each context file covers one library |
| **CSS framework conflicts** | Tailwind v4 + CSS Modules + a component library's own styles | No — style conflicts emerge at runtime |
| **Build tool compatibility** | Vite 6 + a library that only supports Webpack | No — build config isn't in context |
| **Runtime conflicts** | Two libraries that both monkey-patch the same global | No — emerges only at runtime |
| **Pattern conflicts** | Next.js App Router + a library designed for Pages Router patterns | Partially — if the context file mentions App Router |

The spec-gen gate checks context freshness per library but not cross-library compatibility.
A project could have perfectly current context for React 19 AND for Library X, but Library X
doesn't actually support React 19.

**Where it should be caught**:
1. **Context mode** — When creating context for a library, check compatibility notes with
   other libraries in the project's stack
2. **Spec-gen gate** — Cross-library compatibility check: do all versioned context files
   represent a compatible combination?
3. **Implementer** — When a build error involves two libraries, classify as `dependency-compat`
   (new type alongside `context-gap`)

**Source**: Analysis of context-mode.md and spec-gen gate check; common build failure
patterns in multi-library projects.

#### Finding 30: Code Organization Conventions — The Spec-to-File Gap

**Context**: Specs describe WHAT to build. The implementer decides HOW to organize the code.
No conventions artifact bridges this gap, leading to inconsistent file structure, naming
patterns, import conventions, and module boundaries.

**Analysis**:

The architecture doc describes high-level module structure ("src/gateway/, src/agent/,
src/channels/"). But within each module:

| Code Convention | What The Implementer Decides Ad Hoc |
|---|---|
| **File naming** | `userService.ts` vs `user-service.ts` vs `user.service.ts` |
| **Directory structure** | Feature-based vs layer-based vs hybrid |
| **Import patterns** | Barrel exports (`index.ts`) vs direct imports? Absolute paths vs relative? |
| **Component structure** | Co-located styles? Separate files? `Component/index.tsx + styles.module.css`? |
| **Test file location** | Co-located (`Button.test.tsx` next to `Button.tsx`) vs `__tests__/` directory? |
| **Naming conventions** | `getUsers()` vs `fetchUsers()` vs `listUsers()`. `UserRepository` vs `UserRepo` vs `userStore` |

The first task in each module establishes the pattern. Subsequent tasks may follow a
different pattern if the LLM doesn't read the first task's code (context window limits).

**Where it should be caught**:
1. **Architecture** — Code organization strategy (feature vs layer, naming conventions)
2. **Spec generation** — Implementation notes: file naming, import patterns for this spec
3. **Start mode** — Scaffolding task: create directory structure and pattern files before
   implementation begins
4. **Autopilot** — After each task: verify naming/structure consistency with existing code

**Source**: Observation that AI-generated code creates inconsistent patterns across modules;
analysis of the gap between architectural descriptions and file-level decisions.

---

### Part XII: Long-Term Quality and Governance

#### Finding 31: Performance Budgets — The Quantitative Void

**Context**: The pipeline is entirely qualitative. "Should be fast" but never "must respond
within 200ms." Without quantitative targets, the implementer has no guardrails and
performance degrades silently.

**Analysis**:

| Performance Concern | What A Budget Specifies | Currently? |
|---|---|---|
| **Response time** | "API endpoints respond within 200ms p95" | No |
| **Page load** | "First Contentful Paint under 1.5s on 4G" | No |
| **Bundle size** | "JavaScript bundle under 200KB gzipped" | No |
| **Database queries** | "No query exceeds 50ms. No N+1 queries" | No |
| **Memory** | "Server process stays under 512MB RSS" | No |
| **Concurrency** | "Handle 100 concurrent users without degradation" | No |

Performance budgets serve as acceptance criteria. Without them:
- The implementer writes correct but slow code (no signal that it's wrong)
- Performance regressions go undetected until production
- Bundle sizes grow without limit (AI tends to import entire libraries)
- Database queries accumulate without N+1 detection

**Where it should be caught**:
1. **Bootstrap** — "Any performance requirements?" (response time, scale targets)
2. **Architecture** — Performance budget section: quantitative targets per layer
3. **Spec generation** — Performance acceptance criteria per spec
4. **Autopilot** — Lightweight performance checks: response time measurement, bundle
   size tracking (if tools available)

**Source**: Web performance best practices; analysis of AI-generated code performance
characteristics (tends toward correctness over efficiency).

#### Finding 32: L1 Assumption Accumulation — The Silent Divergence

**Context**: The pipeline triages spec gaps: L0 patched inline, L1 logged with assumption,
L2 triggers research. L2 gaps get the pipeline treatment. L1 assumptions are logged to
IMPLEMENTATION_PROGRESS.md but NEVER SYSTEMATICALLY REVIEWED. Over time, 50+ undiscussed
assumptions accumulate and system docs silently diverge from reality.

**Analysis**:

L1 assumptions are individually reasonable: "Spec doesn't cover pagination. I'll use
cursor-based pagination (logged assumption)." But collectively:
- 15 pagination assumptions across different endpoints (some cursor, some offset — nobody
  checked for consistency)
- 8 error handling assumptions (some retry, some don't — nobody verified the strategy)
- 12 state management assumptions (some cache, some don't — no system-level policy)

The implementer logs each to IMPLEMENTATION_PROGRESS.md. But:
- No skill reads these assumptions later
- No audit dimension checks for assumption accumulation
- No mechanism to batch-promote L1 assumptions to architectural decisions
- DECISIONS.md only captures L2+ decisions, not L1 assumptions

The gap: **L1 assumptions are decisions that bypass the decision journal.**

**Where it should be caught**:
1. **Implementer verify** — New dimension: scan IMPLEMENTATION_PROGRESS.md for L1
   assumptions. Group by category. Flag patterns (10+ assumptions in one area = systemic
   gap, promote to L2)
2. **Audit mode** — New dimension: L1 assumption accumulation analysis. Compare
   assumption count and categories against system doc coverage
3. **Periodic consolidation** — After N tasks or end of an area: review L1 assumptions,
   batch-promote to DECISIONS.md or research queue

**Source**: Analysis of run-mode.md L1 handling; analysis of DECISIONS.md logging
threshold; observation that L1 bypass creates invisible technical debt.

#### Finding 33: AI Technical Debt — Code Quality Degradation Over Time

**Context**: Research shows AI-generated code is "highly functional but systematically
lacking in architectural judgment." The pipeline has no mechanism to detect code quality
degradation: duplication, inconsistent patterns, architectural erosion.

**Analysis**:

Industry-wide statistics on AI code quality degradation:
- A 25% increase in AI usage leads to a **7.2% decrease in delivery stability**
- 66% of developers report spending **more time fixing "almost-right" AI code** than saved
- PRs per author increased 20% YoY while **incidents per PR increased 23.5%**
- 73% of AI-built startups face scaling disasters by month 6
- Change failure rates rose ~30% across the industry
- AI-generated code is **1.42x more likely** to introduce performance inefficiencies

AI technical debt compounds through three vectors (per InfoQ 2025 research):
1. **Code generation bloat**: AI-generated snippets encourage copy-paste over refactoring.
   Similar code appears in multiple places instead of being abstracted.
2. **Pattern inconsistency**: Different tasks use different patterns for the same problem
   (three different ways to handle API errors in one codebase).
3. **Architectural erosion**: Individual tasks are correct but collectively move the
   codebase away from the intended architecture (dependency directions violated, layer
   boundaries blurred).

The pipeline's current code quality checks:
- **Per-task verification** (run mode 3d): Checks acceptance criteria — functional, not quality
- **Spot-check** (run mode 3e): Checks regressions in overlapping files — functional, not quality
- **Verify mode** (4 dimensions): Per-task criteria, per-spec compliance, cross-spec
  integration, spec-to-doc alignment — all functional, zero quality

**What's missing**: A code quality dimension that checks:
- Duplication: Are there near-identical code blocks that should be abstracted?
- Pattern consistency: Does every API route use the same middleware chain? Same error handler?
- Architectural adherence: Do imports follow the intended dependency direction? Do modules
  stay within their layer boundaries?
- Bundle impact: Is the same utility imported from three different packages?

**Where it should be caught**:
1. **Verify mode** — New dimension 5: Code Quality. Duplication scan, pattern consistency
   check, architectural boundary verification
2. **Autopilot** — After every N tasks: lightweight quality scan (duplication detection,
   import pattern verification)
3. **Spec generation** — Code conventions section (Finding 30) provides the quality baseline

**Source**: InfoQ "AI-Generated Code Creates New Wave of Technical Debt" (2025);
LeadDev "How AI Generated Code Compounds Technical Debt"; MIT Sloan "The Hidden Costs
of Coding With Generative AI"; analysis of verify-mode.md dimensions.

#### Finding 34: Dependency Supply Chain Security — The Invisible Risk

**Context**: The pipeline uses context files to capture library knowledge. But it has no
mechanism to detect vulnerable dependencies, hallucinated packages, or supply chain attacks.
This is especially critical because AI coding agents are particularly prone to recommending
problematic dependencies.

**Analysis**:

2025 research from Endor Labs found that AI coding agents:
- Import dependencies with known vulnerabilities 49% of the time
- Hallucinate non-existent packages 34% of the time (creating typosquatting risk)
- Recommend safe dependencies only 20% of the time

The pipeline's current dependency handling:
- Context files capture library KNOWLEDGE but not SECURITY STATUS
- Spec-gen gate checks context FRESHNESS but not VULNERABILITY status
- No SBOM (Software Bill of Materials) generation
- No dependency governance policy
- Implementer can `npm install` any package without verification

**What should be specified**:

| Dependency Concern | What's Needed |
|---|---|
| **Approved dependencies** | Allowlist of vetted packages. New dependencies require justification |
| **Version constraints** | Exact versions or narrow ranges? Lockfile committed? |
| **Vulnerability scanning** | `npm audit` / `snyk` as part of implementation verification |
| **License compliance** | Which licenses are acceptable? GPL in a commercial project? |
| **Hallucination detection** | Verify every new `import` or `require` against actual npm registry |
| **Update strategy** | Automated (Dependabot)? Manual? What triggers an update? |

**Where it should be caught**:
1. **Bootstrap** — Dependency governance: approved packages, license policy, update strategy
2. **Context mode** — When researching a library, check for known vulnerabilities and
   license compatibility
3. **Implementer** — Before `npm install`: verify package exists in registry, check
   vulnerability status, check license
4. **Verify mode** — `npm audit` (or equivalent) as part of verification. Flag new
   dependencies added during implementation

**Source**: Endor Labs State of Dependency Management 2025; OWASP Software Supply Chain
Top 10; Sonatype "Future of Dependency Management in AI-Driven SDLC"; Cloudsmith
"AI is Now Writing Code at Scale — But Who's Checking It?"

### Part XIII: Cross-Cutting Backend Policies

#### Finding 35: Idempotency, Transactions, and Caching — The Invisible Contracts

**Context**: Several critical backend behaviors are cross-cutting — they apply to multiple
or ALL endpoints but belong to no single feature. The pipeline documents features one at a
time, which means concerns that span all features fall through the cracks. These are not
"nice to have" patterns — they are correctness requirements that, when unspecified, produce
data corruption, duplicate records, and stale reads.

**Analysis**:

| Cross-Cutting Concern | What Needs Specifying | What Happens Without It |
|---|---|---|
| **Idempotency** | Which operations are safe to retry? How are idempotency keys generated? How long are they stored? | Duplicate records from retried API calls. Webhook handlers process the same event twice. Payment endpoints double-charge users. |
| **Transaction boundaries** | Which operations must be atomic? What happens if step 3 of 5 fails? Should partial results persist? | Data corruption from partially-completed operations. Orphaned records when a multi-step process fails midway. |
| **Caching strategy** | What's cached, for how long, how is it invalidated, what are cache keys? | Different modules make different caching decisions. "I updated the record but the old value still shows" bugs. Cache stampede under load. |
| **Rate limiting** | Per-user? Per-endpoint? Global? What happens when exceeded? | Auth endpoints unprotected from brute force. Public APIs abused. Some endpoints rate-limited, others not. |
| **Input validation location** | Which layer validates — API, service, DB, all three? When they conflict, which is authoritative? | Frontend allows something the API rejects. DB constraint fails after service logic succeeds. Inconsistent error messages per entry point. |

These are distinct from F26 (API conventions) which covers response FORMAT — these are
behavioral POLICIES that determine correctness.

**The key insight**: These cross-cutting concerns need to be specified ONCE at the
architecture level and then INHERITED by every endpoint spec. The pipeline currently has
no mechanism for "this policy applies to everything." Each spec is generated independently,
so each endpoint independently (and inconsistently) decides its own caching, validation,
and error handling behavior.

**Where it should be caught**:
1. **Architecture doc** — Cross-cutting policies section: idempotency requirements, transaction
   strategy, caching policy, rate limiting policy, input validation authority
2. **Spec generation** — Each endpoint spec inherits cross-cutting policies from architecture.
   Spec-gen reads the cross-cutting section and applies it as constraints to every spec.
3. **Spec consistency check** — New dimension: cross-cutting policy adherence. Verify every
   spec is consistent with the architecture's cross-cutting decisions.
4. **Implementer** — When implementing an endpoint that creates resources, check for
   idempotency requirement. When implementing a multi-step operation, check for transaction
   boundary specification.

**Source**: Martin Fowler on idempotency; Zalando REST API Guidelines (cross-cutting
policies); research agent Category 4 analysis; analysis of spec-consistency-check.md
missing dimensions.

#### Finding 36: Data Modeling Behavioral Decisions — Beyond Schema

**Context**: Finding 24 covers data MIGRATION (how to get from schema A to schema B).
But there's a deeper gap: the behavioral decisions WITHIN the data model that affect
every layer of the application. These are architecture-level decisions that, when
unspecified, force the implementer to make contradictory ad-hoc choices.

**Analysis**:

| Data Decision | Options | Implications When Unspecified |
|---|---|---|
| **Soft delete vs hard delete** | Soft (mark as deleted, retain data) vs Hard (permanently remove) | Foreign key constraint failures. "Restore" feature impossible after hard delete. Query performance degraded by accumulated soft-deleted rows. GDPR "right to erasure" violated by soft delete without purge strategy. |
| **Temporal requirements** | Simple timestamps (updated_at) vs Audit log vs Event sourcing vs Bitemporal | "Who changed this and when?" requirement discovered post-deployment. Audit compliance impossible without history. Event replay impossible without event sourcing. |
| **Validation authority** | DB constraints vs API validation vs Service validation vs Frontend validation | Validation exists in 4 layers and all 4 differ. DB rejects what the API accepts. Frontend allows what the service blocks. Error messages inconsistent depending on which layer catches the violation first. |
| **Data volume projections** | Expected row counts per table, growth rate, archival strategy | N+1 queries work fine with 10 test records, timeout with 100k production records. No indexes on frequently queried columns. Tables grow without bound because no archival was specified. |
| **Cascade behavior** | ON DELETE CASCADE vs SET NULL vs RESTRICT vs application-level | Deleting a user cascades to delete all their data (unintended). Or: deleting fails with cryptic FK error (unspecified RESTRICT). |

Research on data migration specifically: specifications change in 90% of data migration
projects, and 50% of all data migration projects exceed their budgets. The migration
problem starts at schema design time — when behavioral decisions are unspecified, every
migration becomes a surprise.

**Where it should be caught**:
1. **Bootstrap** — "When users delete data, should it be recoverable? Do you need an audit
   trail? How much data do you expect?" (This feeds into architecture decisions.)
2. **Architecture doc** — Data modeling decisions section: deletion strategy per entity type,
   temporal requirements, validation authority chain, cascade behavior, volume projections
3. **Spec generation** — Each data spec inherits deletion strategy and cascade behavior from
   architecture. Migration notes alongside target schema.
4. **Spec consistency check** — Verify that specs referencing the same entity agree on
   deletion behavior, cascade direction, and validation rules

**Source**: Martin Fowler "Evolutionary Database Design"; Gable "Database Schema Evolution
Risks"; Airbyte "Data Migration Plan"; research agent Category 8 analysis.

### Part XIV: Specification Drift — The Long-Term Erosion

#### Finding 37: The Model-Code Gap Widens Systematically

**Context**: Architecture models and source code will never show the same things — models
contain a mixture of intentional design decisions and extensional implementations, while
code has only extensional elements. This "model-code gap" is well-documented in software
engineering literature and it grows over time as implementation diverges from architectural
intent. The pipeline's sync mode partially addresses this, but structural drift is its
most insidious form.

**Analysis**:

The pipeline already has a code-doc sync mechanism (cl-reviewer sync mode) that "extracts
claims from docs and checks them against the actual codebase." This is ahead of most tools.
But drift is most dangerous in STRUCTURAL decisions:

| Drift Type | Example | Sync Mode Catches? |
|---|---|---|
| **Value drift** | Doc says "timeout = 30s", code says 60s | Yes — claim extraction compares values |
| **Implementation drift** | Doc says "validate with Zod", code uses custom validation | Yes — library reference claim |
| **Structural drift** | Doc says "event-driven", code uses synchronous calls everywhere | No — sync mode checks claims, not architecture |
| **Abstraction drift** | Doc says "microservice-like boundaries", code has a monolith with blurred layers | No — architectural intent is hard to extract as claims |
| **Decision drift** | DECISIONS.md says "use JWT", implementation switched to sessions because it was easier | Partially — depends on whether the decision produced a verifiable claim |

The pipeline's sync mode is one-directional: it checks whether CODE matches DOCS. But it
doesn't check whether DOCS still accurately describe the CODE. When 50+ tasks of
implementation accumulate, the architecture document may describe a system that no longer
exists — not because anyone changed the docs, but because implementation made thousands of
micro-decisions that collectively altered the architecture.

**The compounding factor**: Martin Fowler's research on specification-driven development
notes that AI implementation amplifies this gap because "AI is both the best tool for
maintaining specs and the biggest risk for specification drift." The speed of AI code
generation means more code is written between each spec review, so drift accumulates
faster than in human-written codebases.

**Where it should be caught**:
1. **Verify mode** — Architecture alignment check: not just "do claims match" but "does the
   code's STRUCTURE match the architectural intent" (dependency direction, layer boundaries,
   communication patterns)
2. **Audit mode** — Drift trend analysis already exists but should include structural drift:
   "The architecture says event-driven, but 15 of 20 inter-module calls are synchronous"
3. **Implementation milestones** — After each implementation area completes, compare the
   area's actual structure against the architectural description. Flag divergence for user
   review.
4. **DECISIONS.md reconciliation** — After implementation, verify that every active decision
   is still reflected in the code. Decisions that the implementation contradicted should be
   flagged: either update the decision or fix the code.

**Source**: Martin Fowler "Spec-Driven Development in the Age of AI" (2025); ArXiv
"Spec-Driven Development: Understanding Specification Drift" (2025); analysis of
cl-reviewer sync-mode.md and audit-mode.md capabilities.

---

## Cross-Cutting Analysis: Where Each Gap Should Be Caught

| Gap Category | Bootstrap | Design: Tokens | Design: Mockups | Spec Gen | Start Mode | Autopilot |
|---|---|---|---|---|---|---|
| **Behavioral** (F1-4) | Error handling philosophy | Component state machines | Behavioral walkthrough | Extract from design | — | Behavioral browser tests |
| **Screen states** (F5) | Empty state philosophy | — | Part of walkthrough | Extract from design | — | Test non-default states |
| **Navigation** (F6) | Routing approach | — | Nav context per screen | Route spec | — | Deep link & guard tests |
| **Accessibility** (F7) | WCAG level | Contrast, focus tokens | Tab order per screen | ARIA per component | — | axe-core tests |
| **Data/state** (F8) | State mgmt approach | — | Per-screen data reqs | State per module | — | State consistency tests |
| **Resilience** (F9) | Offline/resilience | — | System error states | Error boundary spec | — | Resilience tests |
| **Edge cases** (F10) | — | Boundary behavior | "What could go wrong?" | Standard edge section | — | Boundary tests |
| **Responsive** (F11) | Target devices | Breakpoints, touch targets | Mobile variants | Responsive criteria | — | Cross-device tests |
| **Animation** (F12) | Animation style | Duration/easing tokens | Transition annotations | Animation criteria | — | Animation smoke tests |
| **Content** (F13) | Tone/voice | Content patterns | Actual copy for states | Content requirements | — | Content presence tests |
| **Unit testing** (F17) | Framework, philosophy | — | — | Per-module test cases (inputs → outputs, edge cases) | Unit test tasks | Per-task unit tests |
| **Integration testing** (F18) | — | — | — | Cross-spec integration contracts | Integration test tasks (per-milestone) | Per-milestone integration suite |
| **Test architecture** (F19) | Pyramid, data strategy, mock boundaries | — | — | TEST_SPEC.md (environment, fixtures, factories) | Test infra setup task | Environment validation |
| **Test spec artifact** (F20) | — | — | — | Generate alongside impl specs | Test tasks from test specs | Execute test spec cases |
| **Security** (F21) | Auth strategy, compliance | — | Secure UX patterns | SECURITY_SPEC.md (per-endpoint auth, input validation) | Security tasks | Security smoke tests |
| **Error taxonomy** (F22) | Error philosophy | — | Error display patterns | Error format, codes, propagation chain | — | Error format verification |
| **Environment config** (F23) | Deployment target | — | — | CONFIG_SPEC.md (env vars, secrets, feature flags) | Config infra task | Env validation |
| **Data migration** (F24) | — | — | — | Migration notes alongside schema specs | Seed + migration tasks | Migration verification |
| **Observability** (F25) | Monitoring strategy | — | — | Logging, metrics, health check specs | Observability infra task | Health check verification |
| **API conventions** (F26) | — | — | — | API style preamble (pagination, errors, naming) | — | Convention adherence check |
| **Type safety** (F27) | — | — | — | Shared types section, serialization spec | Type infra task | Type drift detection |
| **Integration contracts** (F28) | — | — | — | Per-service integration spec (payloads, auth, rate limits) | Integration setup tasks | Contract verification |
| **Dependency compat** (F29) | — | — | — | Cross-library compatibility notes | — | Build verification |
| **Code conventions** (F30) | — | — | — | File naming, import patterns, directory structure | Scaffolding task | Pattern consistency check |
| **Performance budgets** (F31) | Scale targets | — | — | Quantitative targets per layer | — | Performance measurement |
| **L1 accumulation** (F32) | — | — | — | — | — | L1 scan + batch promotion |
| **AI tech debt** (F33) | — | — | — | Code conventions baseline | — | Duplication + pattern scan |
| **Supply chain security** (F34) | Dep governance, license policy | — | — | Approved deps, version constraints | Dep audit task | npm audit, hallucination check |
| **Cross-cutting backend** (F35) | — | — | — | Inherit from arch: idempotency, transactions, caching, rate limiting | — | Policy adherence check |
| **Data modeling behavior** (F36) | Delete strategy, temporal needs, data volume | — | — | Per-entity deletion, cascade, validation authority | — | Schema behavioral verification |
| **Specification drift** (F37) | — | — | — | — | — | Structural architecture alignment, DECISIONS.md reconciliation |

---

## Options Analysis

### How deeply should the pipeline address these gaps?

| Criterion | Option A: Behavioral Only | Option B: Top 10 + Testing (recommended) | Option C: All Categories |
|---|---|---|---|
| **Gaps addressed** | Behavioral, screen states | + Accessibility, Navigation, Content, Testing, Security, Error taxonomy, API conventions, Type safety | + Responsive, Animation, Data, Edge, Resilience, Observability, Performance, Config, Migrations, Code conventions, Supply chain, Cross-cutting backend, Data modeling, Spec drift |
| **Findings covered** | F1-5 (5) | F1-22, F26-27 (22) | F1-37 (all 37) |
| **Coverage** | ~14% of gaps | ~59% of gaps | ~100% of gaps |
| **File changes** | ~7 files | ~18 files | ~25+ files |
| **Per-screen time** | +30-50% | +50-70% | +80-120% |
| **User burden** | Moderate | Moderate-high | High |
| **Immediate value** | Fixes the most visible gap | Fixes most gaps users will hit + prevents security/quality regressions | Fixes all identified gaps |
| **Complexity risk** | Low | Manageable | Risk of process overload |

### What's in each option tier:

**Tier 1 (behavioral core)**: Behavioral walkthrough, component states, screen states,
testing strategy, browser tooling, build plan restructuring, bootstrap behavioral questions

**Tier 1b (full-stack testing — parallel to Tier 1)**: Test spec generation alongside impl
specs, unit test cases per module, integration test contracts, test architecture decisions
(mock boundaries, data strategy, environment), test tasks as first-class TASKS.md items,
per-milestone integration test execution in autopilot

**Tier 1c (security and error taxonomy — parallel to Tier 1)**: Security specification
(per-endpoint auth, input validation, CORS), error taxonomy (format, codes, propagation),
SECURITY_SPEC.md generation, dependency supply chain checks, security smoke tests in
autopilot. These are pipeline-critical because security and error handling affect every
other gap — behavioral specs reference errors, test specs test error paths, API specs
inherit error format.

**Tier 2 (+ accessibility, navigation, content, API conventions, type safety)**: Accessibility
at token + checklist level, navigation context during mockups, content prompting during
walkthrough, API convention preamble in spec gen, shared types specification, edge case
sections in spec gen, bootstrap accessibility and content questions

**Tier 3 (+ infrastructure, operations, and backend policies)**: Environment configuration
spec, data migration strategy, observability specification, code organization conventions,
performance budgets, integration contracts for external services, dependency compatibility
checks, cross-cutting backend policies (idempotency, transactions, caching), data modeling
behavioral decisions (soft/hard delete, temporal, cascade)

**Tier 4 (+ quality governance and drift)**: L1 assumption accumulation review, AI technical
debt detection (duplication, pattern consistency, architectural adherence), verify mode code
quality dimension, specification drift detection (structural architecture alignment,
DECISIONS.md reconciliation, implementation milestone checks)

**Tier 5 (+ remaining visual/interactive)**: Animation tokens and specs, detailed responsive
feature adaptation, full data/state management depth, comprehensive resilience strategy

## Structural Recommendation: Skill Rename and Spec-Gen Fold

### Decision: Rename skills from `doc-*` to `cl-*` (Clarity Loop)

The `doc-*` prefix reflected the original document-focused scope. With behavioral specs,
test specs, security specs, design systems, and implementation tracking, these skills are
a full development pipeline — not document management tools. The `cl-*` namespace reflects
the actual scope.

| Old | New | Rationale |
|---------|-----|-----------|
| `doc-researcher` | `cl-researcher` | Researches problems, not just documents |
| `doc-reviewer` | `cl-reviewer` | Reviews specs, designs, code alignment — not just docs |
| `ui-designer` | `cl-designer` | Broader than "UI" with behavioral specs, accessibility, content |
| `doc-spec-gen` | *(folded into cl-implementer)* | See below |
| `implementer` | `cl-implementer` | Owns everything from "docs ready" to "code done" |

### Decision: Fold spec-gen into cl-implementer

Spec generation is implementation preparation. The implementer already runs `start` (tasks
from specs). Adding `spec` mode means one skill owns the full build pipeline:

```
cl-implementer spec      →  generate specs from verified system docs (waterfall gate)
cl-implementer start     →  generate tasks from specs
cl-implementer run       →  implement tasks
cl-implementer autopilot →  autonomous implementation
cl-implementer verify    →  holistic verification
cl-implementer sync      →  handle spec/task drift
cl-implementer status    →  progress report
```

**Why implementer, not researcher**: Spec generation's waterfall gate checks reviewer
output (docs verified). Its consistency check verifies type safety, naming, contracts —
implementation concerns. The consumer of specs is the best judge of what they need. Folding
eliminates the `/cl-implementer spec` → `/cl-implementer start` handoff.

**The researcher stays focused**: bootstrap, research, proposals, library context —
understanding the problem. The implementer owns the solution side.

### Proposal Strategy

The rename has wide blast radius (every skill file, cross-references, README, docs, hooks,
plugin manifest) but narrow conceptual scope. Treat as **P0: standalone rename proposal**
that lands first, then the gap analysis proposals (P1-P4) use the new names.

| Proposal | Content | Dependencies |
|----------|---------|-------------|
| **P0: Skill rename + spec-gen fold** | Rename all skills, move spec-gen into implementer, update all references | None |
| **P1: Behavioral specs + design phase** | F1-13 (Tier 1 + Tier 2 behavioral) | P0 |
| **P2: Testing pipeline** | F14-20 (Tier 1b) | P0 |
| **P3: Security, errors, and API conventions** | F21-22, F26-27, F34-35 (Tier 1c + Tier 2 backend) | P0 |
| **P4: Infrastructure, quality, and drift** | F23-25, F28-33, F36-37 (Tier 3-5) | P0 |

P1-P3 can be developed in parallel after P0 merges. P4 follows.

---

## Recommendations

### Primary Recommendation: Option B — Top 10 + Full-Stack Testing

Tier 1 (behavioral), 1b (testing), and 1c (security/errors) form the foundation — they
address the three most critical gap categories (user-facing behavior, code quality, and
security) and should be implemented in parallel since they affect different pipeline stages.

**Tier 1 changes** (design phase):
1. **Screen states** (F5) — Already part of the behavioral walkthrough. No extra step.
2. **Component behavioral states** (F3) — State machines during tokens mode.
3. **Behavioral walkthrough** (F4) — Core addition to mockups mode.

**Tier 1b changes** (spec gen + implementation):
4. **Test specs** (F17-F20) — TEST_SPEC.md alongside implementation specs.
5. **Test tasks** — First-class in TASKS.md.
6. **Per-milestone integration testing** — In autopilot.

**Tier 1c changes** (spec gen + implementation + security):
7. **Security spec** (F21) — SECURITY_SPEC.md with per-endpoint auth, input validation.
8. **Error taxonomy** (F22) — System-level error format in specs.
9. **Supply chain security** (F34) — Dependency verification in implementer.

**Tier 2 additions** (integrate into existing steps):
10. **Accessibility** (F7) — Token-level (contrast, focus) and checklist-level checks.
11. **Navigation** (F6) — "Navigation Context" during mockups.
12. **Content** (F13) — Folded into behavioral walkthrough.
13. **API conventions** (F26) — Style preamble in spec generation.
14. **Type safety** (F27) — Shared types section in specs.
15. **Edge cases** (F10) — Standard Edge Cases section in spec generation.

**Deferred to Tier 3** (infrastructure, operations, and backend policies):
- Environment configuration spec (F23)
- Data migration strategy (F24)
- Observability specification (F25)
- Integration contracts for external services (F28)
- Dependency compatibility checks (F29)
- Code organization conventions (F30)
- Cross-cutting backend policies (F35) — idempotency, transactions, caching, rate limiting
- Data modeling behavioral decisions (F36) — soft/hard delete, temporal, cascade, validation authority

**Deferred to Tier 4** (quality governance and drift):
- Performance budgets (F31)
- L1 assumption accumulation review (F32)
- AI technical debt detection (F33)
- Specification drift detection (F37) — structural alignment, DECISIONS.md reconciliation

**Deferred to Tier 5** (visual/interactive):
- Animation tokens and specifications (F12)
- Detailed responsive feature adaptation (F11)
- Full data/state management depth (F8) — partially covered by walkthrough
- Comprehensive resilience strategy (F9) — partially covered by bootstrap questions

### Implementation Approach — Changes by File

**Highest priority (behavioral foundation — addresses Tier 1):**

#### Change 1: Mockups mode behavioral walkthrough (highest impact)

After each screen's visual approval, run a behavioral walkthrough:
1. Identify all screen states (default, empty, loading, error, partial, offline, permission)
2. For each significant interaction: ask/propose what happens, generate variant (Pencil) or describe (markdown)
3. Capture navigation context: route, auth, back behavior, state persistence, focus target
4. Pin down content: actual copy for empty states, error messages, confirmations
5. Record everything in DESIGN_PROGRESS.md → flows into UI_SCREENS.md

#### Change 2: Component behavioral states in tokens mode

Extend component generation:
- Behavioral states table per component (idle, loading, error, disabled triggers)
- With Pencil: variant frames for key states
- Accessibility: ARIA attributes, keyboard interaction model, focus behavior per component
- Boundary behavior: truncation strategy, overflow handling, min/max constraints
- State triggers documented

#### Change 3: Design checklist updates

**Tokens checklist additions:**
- Component behavioral states documented
- Interactive state triggers defined
- Contrast ratios verified (4.5:1 text, 3:1 UI components)
- Keyboard interactions documented per component
- Focus indicators defined
- Component boundary behavior specified (truncation, overflow)

**Mockups checklist additions:**
- All screens have behavioral walkthroughs completed
- Empty, loading, and error states addressed per screen
- Key interaction flows documented with expected outcomes
- Navigation context defined per screen (route, auth, back, state, focus)
- Non-default state content defined (not placeholders)

#### Change 4: Bootstrap probing questions

Add to the discovery conversation:
- **Behavior**: "How should the app handle errors? (Toast? Inline? Error pages?)"
- **Behavior**: "Should actions feel instant (optimistic updates) or show loading states?"
- **Behavior**: "What happens when there's no data yet? (Empty states? Onboarding?)"
- **Accessibility**: "What accessibility level? (WCAG 2.1 AA? 2.2? None specified?)"
- **Accessibility**: "Keyboard-first? Mouse-first? Touch-optimized?"
- **Content**: "What's the app's voice? (Professional? Friendly? Minimal?)"
- **Resilience**: "How should the app handle being offline? Network errors?"
- **Testing**: "Testing philosophy? (Framework? Coverage expectations?)"
- **Responsive**: "Target devices? (Desktop only? Mobile? Both? Tablet?)"

#### Change 5: UI_SCREENS.md behavioral contracts format

Extend per-screen format:

```markdown
### [Screen Name]

... (existing: features, component usage, layout) ...

**Route**: `/tasks` — Auth required: yes — Back: browser back to previous route
**Focus on arrival**: Page heading (`<h1>`)

**Screen States**:
| State | Trigger | Visual | Content | Components Used |
|-------|---------|--------|---------|-----------------|
| Empty (first-use) | No data | [ref] | "Create your first task to get started" | EmptyState, Button |
| Empty (filtered) | No results | [ref] | "No tasks match your filters" | EmptyState |
| Loading | Fetch in progress | [ref] | — | Skeleton |
| Error | Fetch failed | [ref] | "Couldn't load your tasks. Try again?" | ErrorBanner, Button |
| Populated | Data loaded | [default mockup] | — | Card, Badge |

**Interaction Flows**:
| User Action | Expected Behavior | Error Case | Accessibility |
|-------------|-------------------|------------|---------------|
| Click "Add Task" | Modal opens, focus trapped | — | Focus moves to first input |
| Submit form | Optimistic add, button loading | Toast error, form preserved | aria-busy on button |
| Click delete | Confirm dialog | Toast on failure | Focus to confirm button |
| Press Escape (in modal) | Modal closes | — | Focus returns to trigger |

**Test Scenarios** (derived from interactions):
- Submit empty form → inline validation on required fields
- Submit valid form → task appears in list, toast confirmation
- Submit form, API fails → error toast, form data preserved
- Navigate away with dirty form → confirm dialog
- Tab through form → focus order matches visual layout
- Screen reader: empty state announces CTA text
```

#### Change 6: Autopilot browser validation tooling

Update autopilot-mode.md Step 3e:
1. Tool detection at autopilot start (agent-browser → Playwright MCP → /chrome → none)
2. Behavioral test execution for UI tasks with behavioral acceptance criteria
3. Accessibility testing when browser tools available (axe-core via JS injection)
4. Fallback: warn user, limit to static code analysis

#### Change 7: Build plan restructuring

- Behavioral acceptance criteria appear in Phase 2-4 tasks, not deferred to Phase 5
- Phase 5 becomes "Integration Behavior + Responsive" — cross-screen flows only
- Accessibility tasks added to Phase 1 (token setup: focus indicators, contrast check)
- Navigation/routing task as a cross-cutting Phase 4 addition

**Tier 1b additions (full-stack testing — parallel to Tier 1):**

#### Change 8: Test spec generation in cl-implementer

Extend spec generation to produce `TEST_SPEC.md` alongside implementation specs:

1. **Test architecture section**: Mock boundaries per layer, test data strategy (fixtures vs
   factories vs seeds), test environment requirements (test DB, mock servers, browser env)
2. **Per-module unit test cases**: For each implementation spec, generate a companion section
   in TEST_SPEC.md with:
   - Function/method → input → expected output → edge cases (table format)
   - Mock boundary for that module (what's mocked, what's real)
   - Test data requirements (which factories/fixtures needed)
3. **Cross-spec integration contracts**: For every boundary between specs (API spec returns
   shape X, Frontend spec consumes shape X), generate explicit integration test cases:
   - Full request lifecycle flows (HTTP → handler → service → DB → response)
   - Error propagation chains (DB error → service → API → frontend)
   - Auth flows (login → token → protected access)
4. **Contract tests**: Verify response shapes match consumer expectations across specs

The test spec is NOT test code — it's a specification that the implementer uses to write
tests. It's generated from the same system doc input as implementation specs.

#### Change 9: Start mode test task generation

Extend start mode to generate test tasks from TEST_SPEC.md:

1. **Test infrastructure task** (T-00X): Set up test environment — test DB, mock server
   config, test helpers/factories, test runner config. This task has NO dependencies and
   can run in parallel with early implementation tasks.
2. **Unit test tasks**: Per-module unit test tasks that follow their implementation task.
   E.g., after T-005 "Auth service", generate T-005T "Auth service unit tests".
3. **Integration test tasks**: Per-milestone integration test tasks. After Data + API
   layers are both implemented, generate "Data-API integration tests". These tasks depend
   on ALL the implementation tasks they span.
4. **Contract test tasks**: Tasks that verify cross-layer contracts (API response shapes
   match frontend expectations).

Test tasks are FIRST-CLASS in TASKS.md — they have acceptance criteria, spec references
(to TEST_SPEC.md), dependencies, and status tracking. They're not by-products.

#### Change 10: Autopilot per-milestone integration testing

Extend autopilot with a second test execution mode:

1. **Per-task** (existing): Unit tests run after each task implementation
2. **Per-milestone** (NEW): When the last task in an area completes, OR when all tasks
   spanning an integration boundary are complete, run the integration test suite for those
   seams. If integration tests fail, create fix tasks targeting the specific seam.
3. **Full-suite gate**: Before reporting "all tasks complete", run the ENTIRE test suite
   (unit + integration). This catches regressions that per-task tests miss.

#### Change 11: Bootstrap testing probing (expanded)

Extend the testing question beyond "testing philosophy":
- "Testing framework? (vitest, jest, pytest, etc.)" → Record in DECISIONS.md
- "Test data approach? (factories, fixtures, seeds, generated?)"
- "Mock boundaries? (In-memory DB for tests? Real DB? External API mocking?)"
- "Coverage expectations? (Critical paths only? 80%? Comprehensive?)"
- "Integration testing priority? (API contracts? DB operations? Full flows?)"

These are ARCHITECTURE-LEVEL decisions recorded in DECISIONS.md and consumed by spec gen
when generating TEST_SPEC.md.

**Tier 1c additions (security and error taxonomy — parallel to Tier 1 and 1b):**

#### Change 12: Security specification in spec generation

Extend spec generation to produce `SECURITY_SPEC.md`:

1. **Per-endpoint security**: Auth required (yes/no/optional), auth method (JWT, API key,
   session), authorization rules (role-based, resource-based), input validation rules
   (type, length, pattern, sanitization)
2. **System-level security**: CORS policy, CSP headers, rate limiting strategy, session
   management, secrets injection method (env vars, vault)
3. **Secure UX patterns**: Password requirements feedback, session timeout behavior, error
   messages that don't leak information, CSRF token handling
4. **Dependency governance**: Approved package list, license allowlist, vulnerability
   scanning requirement

#### Change 13: Error taxonomy in spec generation

Extend spec generation to include a system-level error specification:

1. **Error response format**: Standard JSON shape for all error responses
2. **Error code system**: Category prefixes (VALIDATION_*, AUTH_*, AUTHZ_*, NOT_FOUND_*),
   machine-readable codes, human-readable messages
3. **Error propagation chain**: How errors transform as they cross layer boundaries
   (DB constraint → service error → API response → frontend display)
4. **Per-endpoint error catalog**: Which error codes each endpoint can return and under
   what conditions

#### Change 14: Supply chain security in implementer

Extend the implementer to verify dependencies:

1. **Before `npm install`**: Verify package exists in registry (catch hallucinated packages)
2. **After installation**: Run `npm audit` or equivalent, flag high/critical vulnerabilities
3. **License check**: Verify new dependencies match approved license list
4. **In verify mode**: Full dependency audit as a verification dimension

#### Change 15: Bootstrap security and error probing

Add to discovery conversation:
- "Authentication strategy? (JWT, sessions, OAuth, API keys?)"
- "Authorization model? (Role-based, resource-based, attribute-based?)"
- "Compliance requirements? (WCAG, GDPR, HIPAA, SOC2, none?)"
- "Error handling philosophy? (Consistent error codes? Error format?)"
- "Dependency policy? (Approved libraries? License restrictions?)"

**Tier 2 additions (layer after Tier 1 + 1b + 1c):**

#### Change 16: Spec generation enhancements

- Standard "Edge Cases" section per spec based on component types used
- Accessibility requirements section (ARIA, keyboard, focus management)
- Content requirements section (format patterns from DESIGN_SYSTEM.md)
- API conventions preamble: pagination style, naming convention, error format, filtering
  syntax (inherited by all endpoint specs)
- Shared types section: which types cross frontend/backend boundary, serialization format

#### Change 17: Bootstrap additional probing

- Accessibility, content tone, resilience strategy, target devices (see Change 4)
- API style preferences (REST conventions, pagination style)
- Type sharing strategy (shared package, generated, manual)

### Priority and Sequencing

1. **First (three parallel tracks)**:
   - Changes 1-7 (Tier 1: behavioral foundation — affects design phase)
   - Changes 8-11 (Tier 1b: full-stack testing — affects spec gen + implementation)
   - Changes 12-15 (Tier 1c: security + errors — affects spec gen + implementation)
2. **Second**: Changes 16-17 (Tier 2: accessibility, API conventions, type safety, content)
3. **Third**: Tier 3 — infrastructure, operations, and backend policies (env config, data
   migration, observability, integration contracts, dependency compat, code conventions,
   cross-cutting backend policies, data modeling behavioral decisions)
4. **Fourth**: Tier 4 — quality governance and drift (performance budgets, L1 accumulation,
   AI tech debt detection, specification drift detection)
5. **Later**: Tier 5 — animation, responsive detail, full resilience (separate proposal)

Tiers 1, 1b, and 1c can all be implemented in parallel because they affect different
pipeline stages:
- Tier 1 primarily changes: cl-designer skills, bootstrap, build plan
- Tier 1b primarily changes: cl-implementer (TEST_SPEC.md), cl-implementer start mode, autopilot
- Tier 1c primarily changes: cl-implementer (SECURITY_SPEC.md + error taxonomy), cl-implementer
  (dependency verification), bootstrap (security probing)

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Walkthrough becomes too long | Medium | High | Template with skip-able sections. Triage: simple screens get minimal walkthrough. |
| Users find questions tedious | Low | Medium | Frame as "let me show you what happens when..." — generate first, confirm second. |
| Pencil can't show animations/transitions | Medium | Low | Static state variants sufficient for decisions. Transitions described in text. |
| Browser tools not available | Medium | Medium | Enhancement, not gate. Static analysis fallback. |
| Accessibility feels like bureaucracy | Medium | Medium | Auto-verify contrast. Frame as "make sure everyone can use this." |
| Bootstrap asks too many questions | Medium | Medium | Group by concern. Skip if project type doesn't warrant (CLI tool ≠ web app). |
| Edge case sections become boilerplate | Low | Low | Only add edge cases relevant to components used, not generic. |
| Too many changes at once | Medium | Medium | Tier 1 and 1b in parallel, then layer in Tier 2. Each independently valuable. |
| Test spec generation increases spec-gen time | Medium | Low | Test spec is a parallel output from the same system doc read. Marginal cost. |
| Test specs become stale when impl specs change | Medium | Medium | Same staleness detection as impl specs — hash-based, regenerate together. |
| Integration test tasks slow down autopilot | Low | Low | Integration tests run per-milestone, not per-task. Amortized cost is low. |
| Test architecture decisions feel premature at bootstrap | Medium | Medium | Use sensible defaults (mock DB in unit, real in integration). User can override. |
| Security spec adds burden for hobby projects | Medium | Medium | Triage by project type. Personal projects can skip SECURITY_SPEC.md. Commercial projects should not. |
| Error taxonomy feels over-engineered for simple APIs | Low | Low | Scale to project: simple apps get a format + 5 codes. Complex apps get full taxonomy. |
| Dependency verification slows down implementation | Low | Low | `npm audit` is fast. Hallucination check is a single registry lookup. Amortized cost minimal. |
| Supply chain security creates false positives | Medium | Medium | Only flag high/critical vulnerabilities. Low-severity advisories are informational only. |
| Too many spec artifacts (SECURITY_SPEC.md, TEST_SPEC.md, CONFIG_SPEC.md) | Medium | Medium | Could consolidate into sections within existing specs. Separate files are cleaner for large projects. |
| L1 assumption review adds process overhead | Low | Low | Run only at milestones (end of area), not per-task. Low frequency, high value. |
| Code quality checks are subjective | Medium | Medium | Focus on mechanical checks (duplication, import patterns) not style opinions. |
| Cross-cutting policies feel over-engineered for simple apps | Medium | Low | Scale to project: simple CRUD gets defaults (no idempotency). Complex apps get full policy. |
| Data modeling decisions vary by domain | Medium | Medium | Use common defaults (soft delete for user-facing, hard delete for ephemeral). User overrides per entity. |
| Structural drift detection requires deep code analysis | High | Medium | Start with heuristics (import direction, layer boundary violations). Full analysis in later tiers. |
| Specification drift false positives | Medium | Medium | Flag drift for user review, not auto-fix. User decides: update docs or fix code. |

### Impact on Clarity Loop Plugin Files

| File | Changes |
|---|---|
| `skills/cl-designer/references/mockups-mode.md` | Behavioral walkthrough, navigation context, content prompting, state variant generation |
| `skills/cl-designer/references/tokens-mode.md` | Behavioral states, accessibility (ARIA, keyboard, focus), boundary behavior, contrast verification |
| `skills/cl-designer/references/design-checklist.md` | Behavioral, accessibility, content coverage checks |
| `skills/cl-designer/references/build-plan-mode.md` | Restructure Phase 5, integrate behavioral/accessibility criteria into Phases 2-4, navigation task |
| `skills/cl-designer/SKILL.md` | Update mode descriptions to mention behavioral and accessibility discovery |
| `skills/cl-researcher/references/bootstrap-guide.md` | Behavioral, accessibility, content, resilience, testing probing questions (expanded: framework, data strategy, mock boundaries, coverage) |
| `skills/cl-implementer/SKILL.md` | **Major**: Generate TEST_SPEC.md alongside impl specs. Add test architecture section, per-module test cases, cross-spec integration contracts. Edge Cases section, accessibility section, content requirements section. |
| `skills/cl-implementer/references/start-mode.md` | **Major**: Generate test tasks from TEST_SPEC.md — test infra task, per-module unit test tasks, per-milestone integration test tasks, contract test tasks. All first-class in TASKS.md. |
| `skills/cl-implementer/references/autopilot-mode.md` | **Major**: Browser tool detection, behavioral test execution, accessibility testing, per-milestone integration test execution, full-suite gate before completion. |
| `skills/cl-implementer/SKILL.md` | Update guidelines: testing is spec-driven not improvised. Test tasks are first-class. |
| `docs/cl-implementer.md` | Update autopilot section for browser validation + integration testing milestones |
| `docs/cl-implementer.md` | Add TEST_SPEC.md generation documentation |
| `docs/cl-designer.md` | Add behavioral walkthrough, accessibility, navigation context documentation |
| `docs/pipeline-concepts.md` | Add TEST_SPEC.md to directory structure. Add testing config (framework, data strategy, mock boundaries) to `.clarity-loop.json`. |
| `README.md` | Update stage 4 to mention test spec and security spec generation. Update stage 5 to mention integration testing and dependency verification. Update "What else it handles" table. |
| `skills/cl-implementer/references/verify-mode.md` | **Major (Tier 4)**: New dimension 5: Code Quality (duplication, pattern consistency, architectural adherence). New dimension 6: L1 Assumption Scan (group by category, flag patterns, promote to L2). Dependency audit as verification step. |
| `skills/cl-reviewer/references/audit-mode.md` | New dimension 9: L1 Assumption Accumulation (compare assumption count against system doc coverage). |

## Open Questions

1. **Should behavioral walkthroughs be mandatory or opt-out?** Simple CRUD apps might not
   need the full walkthrough. Should there be a triage mechanism (L0 screens skip)?

2. **How detailed should component state machines be?** Table format (key states) vs full
   Mermaid stateDiagram per component?

3. **Should accessibility be mandatory or opt-in?** WCAG is legally required in many contexts
   but may feel burdensome for personal/hobby projects. Triage by project type?

4. **Should the pipeline mandate a testing framework?** Bootstrap proactively set one up,
   or continue "ask when needed" approach? Recommendation: ask at bootstrap and record the
   decision. If the user defers, ask again at spec-gen time (since TEST_SPEC.md needs it).

5. **agent-browser as a recommended tool?** Should README recommend it alongside Pencil MCP?

6. **How should the pipeline handle internationalization?** Adjacent to content strategy but
   significantly more complex. Separate research topic?

7. **Should navigation be its own design mode?** For complex apps (many routes, nested
   layouts, auth flows), the brief navigation context might not be enough.

8. **How much edge case coverage is enough?** Triage-dependent? L0 specs get none, L2 get
   comprehensive?

9. **Should the pipeline leverage existing design system docs?** If the target project uses
   Material UI or Radix, the pipeline should reference their behavioral and accessibility
   docs instead of re-specifying.

10. **Should TEST_SPEC.md be a single file or per-module?** Single file is easier to
    cross-reference but gets large. Per-module mirrors the implementation spec structure
    but creates more files. Recommendation: single file with clear per-module sections,
    matching the implementation spec manifest structure.

11. **How should the pipeline handle projects with existing test suites?** If the project
    already has tests, the test spec should acknowledge them and fill gaps rather than
    prescribe a complete rewrite. Detection at start mode?

12. **Should integration tests be separate tasks or embedded in implementation tasks?**
    Separate tasks are cleaner for tracking but add to task count. Embedded tests are
    simpler but harder to track. Recommendation: separate tasks — the tracking overhead
    is worth the visibility.

13. **What's the mock boundary default?** If bootstrap doesn't specify, what should spec-gen
    assume? Recommendation: DB mocked in unit tests (fixtures), real in integration tests
    (test schema). External APIs always mocked. Auth mocked in non-auth tests.

14. **Should SECURITY_SPEC.md be a separate artifact or a section in each spec?** Separate
    file is easier to audit holistically. Per-spec sections are closer to the code they
    protect. Recommendation: Both — system-level policy in SECURITY_SPEC.md, per-endpoint
    rules in each spec.

15. **How should the error taxonomy scale with project complexity?** A simple CRUD API needs
    5 error codes. A complex enterprise API needs 50+. Recommendation: start with a minimal
    taxonomy (5 categories × 3-5 codes each) and extend during implementation.

16. **Should dependency verification block implementation or just warn?** Blocking prevents
    vulnerable deps but slows the implementer. Warning allows progress but risks shipping
    vulns. Recommendation: block on critical CVEs, warn on high/medium.

17. **Should the pipeline generate Dockerfiles and docker-compose?** These are infrastructure
    artifacts that affect how code runs. Recommendation: Tier 3 — spec the requirements
    (ports, volumes, env vars), let users decide on infrastructure tooling.

18. **How should the pipeline handle monorepos with shared types?** Shared type packages are
    the cleanest solution but require monorepo tooling (turborepo, nx). Recommendation:
    spec the TYPE BOUNDARY (what crosses), let architecture decide the mechanism.

19. **Should code quality checks use external linting tools or AI judgment?** ESLint/Prettier
    are objective. AI pattern analysis is subjective. Recommendation: both — lint for
    formatting, AI for architectural consistency.

20. **What's the right frequency for L1 assumption review?** Per-milestone is too granular.
    Per-project is too infrequent. Recommendation: after each implementation area completes
    (end of Data Layer, end of API Layer, etc.).

21. **Should the pipeline enforce an approved dependency list?** Strict allowlists prevent
    supply chain attacks but limit implementer flexibility. Recommendation: advisory by
    default. Strict mode configurable in `.clarity-loop.json` for security-conscious projects.

22. **How should observability specification scale with project type?** A CLI tool needs
    minimal logging. A distributed system needs full tracing. Recommendation: bootstrap
    probes for project type and calibrates observability depth accordingly.

23. **Should cross-cutting backend policies be a section in ARCHITECTURE.md or a separate
    artifact?** Architecture section keeps it close to the system design. Separate artifact
    (CROSS_CUTTING_POLICIES.md) is easier to reference from every spec. Recommendation:
    architecture section, inherited by spec-gen as constraints.

24. **How should the pipeline handle idempotency for different operation types?** Not all
    operations need idempotency. Create operations do. Read operations are naturally
    idempotent. Update operations may or may not need it. Should the spec-gen default to
    "idempotent unless specified otherwise" or "non-idempotent unless specified"?

25. **Should data modeling behavioral decisions be per-entity or system-wide?** System-wide
    defaults (e.g., "all user-facing entities use soft delete") with per-entity overrides
    seems right. But the pipeline has no mechanism for entity-level overrides in specs.

26. **How should specification drift detection handle intentional divergence?** Sometimes
    the implementation intentionally diverges from the architecture for good reasons
    (performance optimization, library limitations). The drift detector needs a way to
    distinguish intentional divergence (should update docs) from accidental drift (should
    fix code). Recommendation: flag all, let user classify.

27. **Should the pipeline enforce architecture alignment during implementation, not just
    after?** Currently, architecture alignment is only checked in verify mode (post-
    implementation). Checking during implementation (e.g., "this import violates the layer
    boundary in ARCHITECTURE.md") would catch drift earlier but adds overhead per task.

## References

- Vercel agent-browser: github.com/vercel-labs/agent-browser — CLI for AI-first browser
  automation, 93% less context than Playwright MCP
- Microsoft Playwright MCP: github.com/microsoft/playwright-mcp — 26 tools, accessibility
  tree snapshots
- Claude Code /chrome: code.claude.com/docs/en/chrome — built-in browser integration (beta)
- Radix UI Primitives: radix-ui.com/primitives — four-layer component architecture
  (behavior, accessibility, state management, DOM structure)
- Material Design: m3.material.io — component behavioral and motion documentation
- Apple Human Interface Guidelines: developer.apple.com/design/human-interface-guidelines/
- WCAG 2.2 Quick Reference: w3.org/WAI/WCAG22/quickref/
- WAI-ARIA Authoring Practices: w3.org/WAI/ARIA/apg/
- AI-generated code quality research: ~1.7x more issues than human code
- Design-to-code handoff research: 62% of developers spend excessive time redoing work
- Storybook Interaction Tests: storybook.js.org/docs/writing-tests/interaction-testing
- ATDD / Specification-Driven Development: behavioral specs as test case duality
- Defensive UI design patterns: empty states, loading states, error states
- Test pyramid methodology: unit > integration > e2e in quantity, inverse in scope
- Testing Trophy (Kent C. Dodds): integration tests as the sweet spot for confidence/cost
- MSW (Mock Service Worker): mswjs.io — API mocking for integration tests
- Vitest / Jest: modern test runners with built-in mocking, coverage, watch mode
- Todo app test project: real-world observation of pipeline gaps in Clarity Loop output
- OWASP Secure by Design Framework: owasp.org/www-project-secure-by-design-framework/
- OWASP 2025 AI code vulnerability multipliers: 1.88x-2.74x per vulnerability type
- InfoQ "AI-Generated Code Creates New Wave of Technical Debt" (2025)
- LeadDev "How AI Generated Code Accelerates Technical Debt" (2025)
- MIT Sloan "The Hidden Costs of Coding With Generative AI" (2025)
- ArXiv "Unveiling Inefficiencies in LLM-Generated Code" (2025): 1.42x performance issues
- Martin Fowler "Spec-Driven Development in the Age of AI" (2025)
- ArXiv "Spec-Driven Development: Understanding Specification Drift" (2025)
- Martin Fowler "Evolutionary Database Design": schema evolution, backward-compatible migrations
- Gable "Database Schema Evolution Risks": 90% spec change rate in migration projects
- Airbyte "Data Migration Plan": 50% of migration projects exceed budgets
- Zalando REST API Guidelines: cross-cutting policies, compatibility, versioning
- Google AIP-180: backwards compatibility principles
- SLODLC Handbook: Service Level Objective Development Lifecycle
- Stack Overflow "How Observability-Driven Development Creates Elite Performers" (2022)
- Endor Labs State of Dependency Management 2025: AI agent dependency statistics
- Cloudflare "Shifting Left at Enterprise Scale": infrastructure specification gaps
