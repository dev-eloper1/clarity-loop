# Research: Browser Automation for Design Validation

**ID**: R-007
**Created**: 2026-02-16
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Net New
- **Status**: draft
- **Open Questions**: 6 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Net New

Browser automation does not currently exist in Clarity Loop. This research designs how
browser-based validation could close two feedback loops that are currently open:
(1) cl-designer produces design artifacts but never validates them in a real browser, and
(2) cl-implementer verifies code against specs but never visually compares implemented UI
against design artifacts.

### Related System Docs

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| SYSTEM_DESIGN.md | Per-skill architecture (cl-designer, cl-implementer) | Defines skill structure, mode dispatch, and reference loading that any new capability must integrate with |
| SYSTEM_DESIGN.md | State Management | Defines how pipeline state flows between skills -- browser validation results must fit this model |
| docs/cl-designer.md | Mockups mode, Visual Quality Rules, Browser Validation Tools | Defines the design pipeline and the nascent browser tool detection already present |
| docs/cl-implementer.md | Verify mode (7 dimensions) | Defines implementation verification -- visual verification is the gap this research fills |
| docs/pipeline-concepts.md | Cross-cutting pipeline concepts | Defines patterns (parking protocol, decision flow, checkpoint tiering) that browser validation must follow |

### Current State

This capability does not currently exist in the system. The following describes the
architectural context it must fit within.

**cl-designer's current validation model**: The cl-designer skill operates on a
generate-then-screenshot-then-feedback-then-refine loop. During Pencil path operation,
`batch_design` creates visual elements, `snapshot_layout` checks for overlaps and
structural issues, and `get_screenshot` captures the result for user review. The visual
verification protocol (in `references/visual-quality-rules.md`) checks four dimensions:
layout integrity, Gestalt compliance, accessibility spot checks, and visual confirmation.
All of this happens within the Pencil MCP canvas -- none of it renders in a real browser,
tests responsive breakpoints, exercises interactive behavior, or validates accessibility
via actual DOM inspection.

The cl-designer SKILL.md already includes a "Browser Validation Tools (Optional)" section
that detects three possible browser tools: `agent-browser` (CLI), Playwright MCP, and
Chrome MCP. However, this detection is limited to noting availability in
DESIGN_PROGRESS.md and suggesting accessibility pre-checks when a dev server is running.
There is no structured validation flow, no acceptance criteria format, and no integration
with the design feedback loop.

**cl-implementer's current verification model**: The verify mode checks seven dimensions:
per-task acceptance criteria, per-spec contract compliance, cross-spec integration,
spec-to-doc alignment, test coverage, dependency audit, and operational/governance checks.
Dimension 1 (acceptance criteria) checks code against criteria text. Dimension 2 (contract
compliance) reads specs and checks code. Neither dimension renders the UI in a browser or
compares visual output against design artifacts. The gap is explicit: there is no Dimension
8 for visual verification.

**What R-002 established**: Research R-002 (Bowser Architecture Patterns) analyzed how the
Bowser project implements browser automation. Finding 3 identified the specific opportunity:
Bowser's Playwright CLI skill, YAML story format, and QA agent provide a proven pattern for
UI validation that could close the design feedback loop. Finding 5 analyzed YAML-driven
declarative workflows as auto-discoverable, human-readable test definitions. R-002
recommended browser automation as Phase 1 of its adoption strategy (selective integration).
This research picks up where R-002 left off and designs the specific capability.

### Why This Research

Three gaps prompted this research:

1. **Design artifacts are never browser-tested.** cl-designer generates mockups as .pen
   files (Pencil path) or markdown specs (fallback path). The Pencil MCP provides
   screenshot and layout analysis, but these operate on the Pencil canvas, not on a
   browser rendering. Responsive breakpoints, real CSS behavior, actual accessibility
   tree structure, and interactive behavior are all unvalidated.

2. **Implemented UI is never compared against design.** cl-implementer's verify mode
   checks code against acceptance criteria text but has no mechanism to screenshot the
   running application, compare it against design artifacts, and identify visual drift.
   The "looks right" validation happens only if a human manually eyeballs the output.

3. **No structured acceptance criteria for visual validation.** Even if browser tools were
   available, there is no format for defining what to check. Bowser's YAML story format
   provides a pattern, but Clarity Loop needs a richer schema that captures screen names,
   breakpoints, component verification, and accessibility checks specific to design
   validation.

## Scope

### In Scope

- Designing a browser automation capability adapted from Bowser's playwright-bowser skill
- Defining a YAML acceptance criteria schema specific to design and implementation validation
- Defining integration points with cl-designer (post-mockup validation mode)
- Defining integration points with cl-implementer (visual verification dimension)
- Evaluating Playwright CLI vs Chrome MCP vs Playwright MCP for Clarity Loop's needs
- Evaluating what Pencil MCP can and cannot export for browser testing
- Designing the validation agent (adapted from bowser-qa-agent)
- Defining vision mode cost/benefit tradeoffs
- Providing a phased rollout plan

### Out of Scope

- Implementing the browser automation skill (this is a design research document)
- Full E2E test suite design (this focuses on visual/design validation, not functional testing)
- Cross-browser testing strategy (Chromium-only is sufficient for design validation)
- Performance testing or load testing
- Mobile device testing (responsive viewport simulation is in scope, real device testing is not)
- Restructuring cl-designer or cl-implementer (this research defines integration points, not rewrites)

### Constraints

- Must work as a Claude Code skill/reference within the existing Clarity Loop plugin structure
- Must follow existing patterns: SKILL.md frontmatter, mode detection, reference file loading
- Must integrate with checkpoint tiering (Tier 1/2/3) for user interaction decisions
- Browser tools are optional -- the pipeline must function without them (graceful degradation)
- Token cost awareness: vision mode (screenshots in context) is expensive and must be opt-in
- Must not block pipeline progress -- browser validation is advisory, not a gate

## Research Findings

### Finding 1: The Design Validation Gap in Detail

**Context**: What cl-designer produces today, how it validates, and what is missing.

**Analysis**: The cl-designer skill produces two categories of output across its two paths:

**Pencil path outputs:**
- `.pen` file containing design tokens (color swatches, typography samples, spacing blocks),
  reusable components (with `reusable: true` for ref node instantiation), and screen mockups
  (composed from ref nodes in labeled frames)
- Screenshots via Pencil MCP's `get_screenshot` tool (captured per-section or per-screen)
- Layout analysis via `snapshot_layout` (bounding box overlap detection)
- `DESIGN_SYSTEM.md` and `UI_SCREENS.md` as structured markdown specifications

**Markdown fallback outputs:**
- `DESIGN_SYSTEM.md` with token catalogs, component specs (including behavioral states,
  accessibility attributes, boundary behavior), and traceability matrices
- `UI_SCREENS.md` with screen-to-feature mappings, behavioral contracts, navigation flow,
  and test scenarios
- No visual artifacts -- everything is structured text

**Current validation (Pencil path):**
The visual verification protocol (`references/visual-quality-rules.md`) runs after each
`batch_design` call. It checks four things:

| Step | What It Checks | How | Limitation |
|------|---------------|-----|------------|
| Layout integrity | Overlapping bounding boxes, escaped elements, zero-size elements | `snapshot_layout` | Canvas coordinates only -- not CSS rendering |
| Gestalt compliance | Proximity, similarity, closure, hierarchy | Layout structure analysis | Subjective assessment by the agent, not computed |
| Accessibility spot check | Contrast ratios, target sizes, labels, heading hierarchy | Visual inspection of generated elements | Computed from token values, not from actual rendered DOM |
| Visual confirmation | Overall visual quality | `get_screenshot` + agent self-check | Screenshot is of Pencil canvas, not browser |

**What is missing:**

| Gap | Impact | Example |
|-----|--------|---------|
| No real CSS rendering | Designs may look correct on canvas but break with actual CSS box model, flexbox/grid, or font rendering | A component with `gap: 8px` in Pencil may render differently when the CSS `gap` property interacts with `padding` and `border` |
| No responsive testing | No validation at multiple viewport widths | A sidebar layout designed at 1440px may overflow or collapse at 768px -- never tested |
| No interaction testing | Behavioral states are documented but never exercised | A dropdown's keyboard navigation (Arrow keys, Escape, Enter) is specified in DESIGN_SYSTEM.md but never tested in a browser |
| No real accessibility validation | Contrast ratios calculated from token values, not from rendered pixels; no ARIA tree inspection | Agent computes contrast from hex values, but CSS `opacity`, `backdrop-filter`, or overlapping elements can alter effective contrast |
| No cross-browser rendering check | Pencil canvas is not a browser | Font rendering, SVG behavior, and CSS property support vary across engines |
| No animation/transition validation | Transitions specified in tokens (fast: 150ms, normal: 200ms) are never rendered | Perceived smoothness of a 200ms ease-out transition can only be evaluated in a browser |

**Current validation (Markdown path):**
Zero visual validation. Components and screens exist only as text specifications.
Validation is limited to structural completeness checks (does the spec have all required
sections?) and consistency checks (do component references in UI_SCREENS.md match
DESIGN_SYSTEM.md?). This path is inherently not visually testable until implementation.

**The gap is largest between mockups mode and implementation.** After cl-designer mockups
mode completes, the next step is `/cl-designer build-plan` followed by
`/cl-implementer spec` and `/cl-implementer run`. At no point in this chain does
anyone (human or agent) render a design artifact in a browser and verify it. The feedback
loop from "design looks right on canvas" to "design looks right in browser" is entirely
open.

**Source**: Analysis of cl-designer SKILL.md, references/mockups-mode.md,
references/visual-quality-rules.md, references/tokens-mode.md.

### Finding 2: The Implementation Verification Gap

**Context**: What cl-implementer's verify mode checks today and what is missing regarding
visual verification against design artifacts.

**Analysis**: The cl-implementer verify mode defines seven verification dimensions. Their
coverage of visual/design concerns:

| Dimension | Checks | Visual/Design Coverage |
|-----------|--------|----------------------|
| 1: Per-Task Acceptance | Re-checks each completed task's acceptance criteria against code | Checks criteria text (e.g., "renders loading state with spinner") against code. Does NOT render the result. |
| 2: Per-Spec Contract | Checks full implementation honors spec contracts | Checks types, constraints, interfaces. Does NOT compare visual output. |
| 3: Cross-Spec Integration | Checks modules work together | Checks API shapes, data flow. Does NOT verify UI integration. |
| 4: Spec-to-Doc Alignment | Checks code matches system docs | Checks file paths, tech claims, patterns. Does NOT compare visuals. |
| 5: Test Coverage | Verifies test suite against TEST_SPEC.md | Checks test file existence and coverage. Does NOT run visual tests. |
| 6: Dependency Audit | Checks dependency health | Not visual. |
| 7: Operational/Governance | 10 sub-checks for infrastructure quality | Not visual. |

**The missing dimension**: There is no "Dimension 8: Visual Verification" that would:
1. Start the dev server
2. Navigate to each screen defined in UI_SCREENS.md
3. Screenshot each screen at specified breakpoints
4. Compare screenshots against design artifacts (Pencil screenshots or structured descriptions)
5. Check accessibility via real DOM inspection (axe-core or equivalent)
6. Exercise interactive behaviors (keyboard navigation, state transitions)
7. Report visual regressions with before/after screenshots

**The build-plan-to-verify gap**: DESIGN_TASKS.md generates acceptance criteria that
include behavioral specifications (from DESIGN_SYSTEM.md and UI_SCREENS.md). For example,
a Button task includes "renders loading state with spinner, disables during loading, shows
`aria-busy` attribute." When cl-implementer's run or autopilot mode implements this task,
verification is done by reading the code. The agent checks whether the code structurally
satisfies the criteria -- but never renders the button, clicks it, observes the spinner,
or verifies `aria-busy` appears in the DOM. The behavioral contract is verified
syntactically, not behaviorally.

**What autopilot adds but still misses**: Autopilot mode includes self-testing -- the
implementer writes tests from acceptance criteria, runs them, and uses test results as
verification. This is closer to behavioral verification because tests can render
components (via testing-library) and assert on DOM state. However:
- Tests use JSDOM or similar, not a real browser
- No visual comparison against design artifacts
- No responsive testing
- No cross-component visual regression detection
- No accessibility tree validation (JSDOM's accessibility support is limited)

**Source**: Analysis of cl-implementer SKILL.md, references/verify-mode.md,
references/autopilot-mode.md, references/build-plan-mode.md.

### Finding 3: Playwright CLI vs Chrome MCP vs Playwright MCP

**Context**: Which browser automation approach is best suited for Clarity Loop's design
validation needs.

**Analysis**: Three browser automation approaches are available in the Claude Code
ecosystem. Each was evaluated against Clarity Loop's specific requirements.

**Approach comparison:**

| Criterion | Playwright CLI | Chrome MCP | Playwright MCP |
|-----------|---------------|------------|----------------|
| **Parallelism** | Named sessions (`-s=name`) enable multiple independent browser instances | Single Chrome instance -- no parallelism | Depends on implementation; typically single context |
| **Headless support** | Headless by default, `--headed` opt-in | Observable only (uses real Chrome) -- no headless | Headless by default |
| **Token efficiency** | CLI-based -- no tool schemas or accessibility trees in context | MCP tool schemas loaded into context | MCP tool schemas loaded into context |
| **Vision mode** | Opt-in (`PLAYWRIGHT_MCP_CAPS=vision`) -- screenshots saved to disk by default | Screenshots returned in context by default | Screenshots via MCP tool calls |
| **Session persistence** | Cookies and localStorage preserved via `--persistent` profiles | Uses real Chrome profile -- full persistence | Depends on implementation |
| **CI suitability** | Excellent -- headless, CLI, no GUI dependency | Poor -- requires Chrome with extension | Good -- headless, but needs MCP server |
| **Installation** | `npm install -g playwright-cli` (or project-local) | Built into Claude Code with `--chrome` flag | Varies by implementation |
| **Authentication** | Persistent profiles handle auth state across calls | Real Chrome profile has existing auth | Session-based |
| **Dev server testing** | Connect to `localhost:3000` or any URL | Connect to `localhost:3000` or any URL | Connect to `localhost:3000` or any URL |
| **Multi-breakpoint testing** | `resize <w> <h>` per session -- easy viewport changes | Window resize possible but manual | Viewport configuration per context |
| **Proven pattern** | Bowser project -- working fan-out with QA agents | Bowser project -- simpler, single-session | No Bowser precedent |

**Clarity Loop-specific requirements and how each approach fits:**

1. **Multiple screens to validate**: cl-designer can generate 10+ screens. Validating them
   sequentially is slow. Playwright CLI's named sessions enable parallel validation (one
   session per screen or per screen group). Chrome MCP cannot parallelize. This is the
   decisive factor.

2. **Responsive breakpoints**: Each screen may need testing at 3-4 breakpoints
   (1440px, 1024px, 768px, 390px). Playwright CLI's `resize` command makes viewport
   changes trivial within a session. Chrome MCP requires window manipulation. Playwright
   MCP supports viewport configuration.

3. **Token budget sensitivity**: Design validation can involve many screens and
   breakpoints. If each screenshot is embedded in context (vision mode), the token cost
   scales rapidly. Playwright CLI's default of saving screenshots to disk (not in context)
   is the right default for Clarity Loop. Vision mode should be opt-in for specific
   troubleshooting scenarios.

4. **CI/automation potential**: Although Clarity Loop is currently a developer tool, future
   CI integration (run design validation on every PR) requires headless operation.
   Playwright CLI is the only option that works headless without additional infrastructure.

5. **Existing detection in cl-designer**: The SKILL.md already checks for three tools in
   priority order: (1) `agent-browser` (CLI, "most context-efficient"), (2) Playwright MCP
   ("most capable, cross-browser"), (3) Chrome MCP ("built-in, no install"). This priority
   order aligns with the analysis, though `agent-browser` appears to be a reference to a
   generic CLI tool rather than a specific Bowser component.

**Recommendation**: Playwright CLI as the primary tool, with Chrome MCP as a degraded
fallback for single-screen debugging. Playwright MCP is viable but offers no advantage
over the CLI approach for Clarity Loop's specific needs.

**Tradeoffs**:
- *Pro*: Playwright CLI is the most flexible, parallelizable, and token-efficient option
- *Pro*: Direct precedent in Bowser's working implementation
- *Con*: Requires Playwright CLI installation (dependency to manage)
- *Con*: Named sessions add complexity vs. simple single-session Chrome MCP
- *Con*: Chrome MCP is zero-install ("built-in") -- Playwright CLI requires setup

**Source**: Bowser's playwright-bowser/SKILL.md, claude-bowser/SKILL.md, and Clarity Loop's
cl-designer SKILL.md Browser Validation Tools section.

### Finding 4: YAML Acceptance Criteria Schema Design

**Context**: Designing a YAML schema for design validation that builds on Bowser's simple
story format but addresses Clarity Loop's richer validation needs.

**Analysis**: Bowser's YAML story format is intentionally minimal:

```yaml
stories:
  - name: "Front page loads with posts"
    url: "https://news.ycombinator.com/"
    workflow: |
      Navigate to https://news.ycombinator.com/
      Verify the front page loads successfully
      Verify at least 10 posts are visible
```

This works for general-purpose QA validation where stories are authored by humans. For
Clarity Loop, the acceptance criteria are more structured because they can be *generated*
from existing design artifacts (DESIGN_SYSTEM.md, UI_SCREENS.md, DESIGN_TASKS.md).

**Proposed schema -- Design Validation Criteria (DVC):**

```yaml
# docs/validation/dashboard.dvc.yaml
version: "1"
screen: Dashboard
source:
  design_system: specs/DESIGN_SYSTEM.md
  ui_screens: specs/UI_SCREENS.md
  design_tasks: specs/DESIGN_TASKS.md

url: "http://localhost:3000/dashboard"
auth:
  strategy: "session"        # none | session | token
  credentials_env: "TEST_CREDENTIALS"  # env var with user:pass

breakpoints:
  - name: desktop
    width: 1440
    height: 900
  - name: tablet
    width: 768
    height: 1024
  - name: mobile
    width: 390
    height: 844

components:
  - name: NavBar
    design_ref: "DESIGN_SYSTEM.md#NavBar"
    checks:
      - "Navigation bar is visible at top of viewport"
      - "Contains at least 3 navigation links"
      - "Active page indicator is visible on Dashboard link"
    responsive:
      mobile: "Navigation collapses into hamburger menu"

  - name: MetricCards
    design_ref: "DESIGN_SYSTEM.md#Card"
    checks:
      - "At least 3 metric cards are visible"
      - "Each card displays a label and a numeric value"
      - "Cards use consistent shadow and border radius"
    responsive:
      tablet: "Cards stack in 2-column grid"
      mobile: "Cards stack in single column"

states:
  - name: empty
    setup: "Navigate with no data seeded"
    checks:
      - "Empty state component is visible"
      - "CTA button 'Create your first task' is present"
      - "No metric cards shown"

  - name: loading
    setup: "Throttle network to simulate slow response"
    checks:
      - "Skeleton loaders appear in card positions"
      - "Navigation remains interactive during loading"

  - name: error
    setup: "Block API endpoint to simulate fetch failure"
    checks:
      - "Error banner is visible with retry button"
      - "Error message text is not generic ('Error')"

accessibility:
  - "All text meets 4.5:1 contrast ratio against background"
  - "All interactive elements are keyboard-reachable via Tab"
  - "Page has exactly one H1 element"
  - "All form inputs have associated labels"
  - "Focus indicator is visible on focused elements"

interactions:
  - name: "Filter tasks"
    steps: |
      Click the filter dropdown
      Select 'Active' filter
      Verify task list updates to show only active tasks
      Verify URL updates with filter parameter

  - name: "Navigate to task detail"
    steps: |
      Click the first task card
      Verify navigation to task detail page
      Click browser back
      Verify return to dashboard with preserved state
```

**Why this schema vs. Bowser's simpler format:**

| Feature | Bowser's format | DVC format | Why DVC needs it |
|---------|----------------|------------|-----------------|
| Breakpoints | Not present | Per-screen list of viewport sizes | Responsive testing is a core design validation need |
| Component-level checks | Not present | Named components with design system refs | Ties validation back to DESIGN_SYSTEM.md artifacts |
| Screen states | Not present | Named states with setup instructions | UI_SCREENS.md defines screen states that must be verified |
| Accessibility | Not present | Structured accessibility checks | WCAG compliance is a hard constraint in visual-quality-rules.md |
| Auth handling | Not present | Auth strategy with credential env var | Local dev servers often require authentication |
| Source traceability | Not present | Source references to design artifacts | Pipeline requires traceability back to specs |

**Auto-generation potential**: Unlike Bowser's stories (human-authored), DVC files can be
partially generated from existing pipeline artifacts:

- `screen`, `url` from UI_SCREENS.md screen inventory and route definitions
- `breakpoints` from UI_SCREENS.md responsive behavior section
- `components` from UI_SCREENS.md component usage tables + DESIGN_SYSTEM.md
- `states` from UI_SCREENS.md screen states tables
- `accessibility` from visual-quality-rules.md hard constraints
- `interactions` from UI_SCREENS.md interaction flows tables

The generation would happen as a new mode in cl-designer (post-mockups) or as a step in
cl-implementer's start mode (alongside TASKS.md generation).

**File discovery**: Following Bowser's directory-as-API pattern, DVC files would live in a
discoverable directory (`docs/validation/` or `{docsRoot}/validation/`) and be found via
glob (`*.dvc.yaml`). Adding a new screen's validation is: create a YAML file, done.

**Tradeoffs**:
- *Pro*: Richer schema captures design-specific validation needs that Bowser's format misses
- *Pro*: Auto-generation from existing artifacts reduces manual authoring burden
- *Pro*: Traceability back to design system maintains pipeline coherence
- *Pro*: YAML is human-readable, versionable, reviewable
- *Con*: More complex schema increases the learning curve for manual authoring
- *Con*: Auto-generation adds a build step to the pipeline
- *Con*: Schema may over-specify -- not every screen needs all sections
- *Con*: YAML indentation sensitivity and no IDE validation for custom schemas

**Source**: Analysis of Bowser's hackernews.yaml and example-app.yaml story files,
Clarity Loop's UI_SCREENS.md output format, DESIGN_SYSTEM.md output format, and
visual-quality-rules.md accessibility constraints.

### Finding 5: Integration with cl-designer

**Context**: Where browser validation fits in the cl-designer pipeline and how it
interacts with the existing generate-then-screenshot-then-feedback-then-refine loop.

**Analysis**: The cl-designer pipeline currently has four modes:

```
setup → tokens → mockups → build-plan
```

Browser validation cannot run during `setup` (no design exists), `tokens` (components
exist in Pencil but not in a browser), or `build-plan` (no rendered UI). It becomes
relevant at two points:

**Point 1: After mockups, before build-plan (new "validate" mode)**

This is the highest-value integration point. At this stage, UI_SCREENS.md exists with
screen definitions, component usage, behavioral contracts, and test scenarios. If the
implementation has begun (even partially) or if the design uses a component library with
a Storybook or dev server, browser validation can check:

- Component rendering against design system specifications
- Responsive behavior at specified breakpoints
- Accessibility compliance via real DOM inspection
- Interactive behavior (if components are functional)

However, there is a critical prerequisite: **code must exist to test.** Browser validation
requires a running application or component server. If cl-designer runs before any
implementation, there is nothing to open in a browser. This means the validate mode is
most useful in two scenarios:

*Scenario A: Design iteration after partial implementation.* The user runs `cl-designer
mockups` to add or update screens after some implementation work has been done. The
validate mode can then check existing screens in the running app against the updated
design specifications.

*Scenario B: Component library with a dev server.* If the project uses a component
library (Storybook, Ladle, or framework dev server), individual components can be
browser-tested against their DESIGN_SYSTEM.md specifications even before full screens
are assembled.

**Point 2: Within mockups mode, as a post-generation check (enhancement)**

The cl-designer SKILL.md already includes a "Browser Validation Tools" section that
mentions accessibility pre-checks. This could be expanded: after generating screen mockups
and completing the behavioral walkthrough, if a dev server is detected, offer to run a
quick validation pass on any screens that are already implemented. This is lighter than a
full validate mode -- it is an opportunistic check during the design loop, not a separate
pipeline step.

**Proposed integration -- new "validate" mode:**

```
setup → tokens → mockups → [validate] → build-plan
                                ↓
                        (requires running app or
                         component server)
```

The validate mode would:

1. **Check prerequisites**: Dev server running? Component server available? If neither,
   tell the user: "Browser validation requires a running application. Start your dev
   server, then re-run `/cl-designer validate`."
2. **Discover or generate DVC files**: Check `{docsRoot}/validation/` for existing
   `.dvc.yaml` files. If none exist, offer to generate them from UI_SCREENS.md and
   DESIGN_SYSTEM.md.
3. **Run validation**: For each DVC file with a reachable URL, spawn a validation agent
   that navigates to the screen, checks components, tests breakpoints, runs accessibility
   checks.
4. **Report**: Structured pass/fail results per screen, per breakpoint, per component.
   Screenshots saved to disk. Vision mode available for troubleshooting.
5. **Feed back**: Validation failures generate specific, actionable findings that can
   feed back into the design loop (update mockup) or forward into the implementation
   pipeline (create fix tasks).

**Interaction with existing Browser Validation Tools section:**

The current SKILL.md section detects `agent-browser`, Playwright MCP, and Chrome MCP
during setup mode and records the result in DESIGN_PROGRESS.md. The validate mode would
build on this detection:

- If Playwright CLI is detected: use it (preferred)
- If Playwright MCP is detected: use it (capable but higher token cost)
- If Chrome MCP is detected: use it (degraded -- no parallelism, no headless)
- If nothing is detected: "No browser automation tool found. Install Playwright CLI
  (`npm install -g playwright-cli`) or restart Claude Code with `--chrome` for basic
  validation."

**Gate and checkpoint considerations:**

Browser validation should be **Tier 3 (Auto-proceed)** -- advisory, not blocking.
Failures are logged and surfaced, but they do not prevent moving to build-plan mode.
Rationale: design validation in a browser depends on implementation state, which may be
incomplete or non-existent at the time of design. Making it a gate would block the
pipeline in the common case where design precedes implementation.

However, specific findings could be escalated:
- Accessibility failures (WCAG hard constraints): escalate to Tier 2 (batch review)
- Visual regressions between design and implementation: Tier 2
- Component rendering failures (component doesn't render at all): Tier 1 (must confirm)

**Tradeoffs**:
- *Pro*: Closes the design validation gap at the right pipeline stage
- *Pro*: Generates actionable findings that feed forward and backward in the pipeline
- *Pro*: Advisory (Tier 3) default prevents blocking the pipeline on missing infrastructure
- *Con*: Requires running application -- useless if design precedes implementation
- *Con*: Adds another mode to cl-designer (already has 4 modes)
- *Con*: DVC file generation adds complexity to the pipeline

**Source**: Analysis of cl-designer SKILL.md pipeline flow, mockups-mode.md, setup-mode.md
browser detection section, and checkpoint tiering from design-checklist.md.

### Finding 6: Integration with cl-implementer

**Context**: Where browser-based visual verification fits in the implementation pipeline
and how it compares implemented UI against design specifications.

**Analysis**: cl-implementer's verify mode checks seven dimensions. Visual verification
would add an eighth.

**Proposed Dimension 8: Visual Verification Against Design Artifacts**

This dimension activates when:
- UI_SCREENS.md exists (design specs to compare against)
- A dev server is running or can be started
- A browser automation tool is available (detected during verify setup)

**Verification process:**

1. **Discover DVC files** in `{docsRoot}/validation/`. If none exist but UI_SCREENS.md
   exists, generate DVC files from the screen specifications.

2. **Start dev server** if not running. Check common ports (3000, 5173, 8080). If the
   project has a `dev` script in package.json, offer to start it. If no server can be
   started, skip this dimension with a note.

3. **Per-screen validation** (parallelizable via fan-out):
   - Navigate to each screen's URL
   - At each breakpoint: screenshot, check component presence, verify layout
   - Run accessibility checks (inject axe-core via `run-code` or use Playwright's
     accessibility snapshot)
   - Test interactive behaviors defined in DVC interaction steps
   - Compare screenshots against design references (if Pencil screenshots exist)

4. **Report** as part of the verify output:
   ```
   ### Visual Verification Against Design Artifacts
   - Dashboard (desktop): PASS -- 3/3 components verified, 5/5 accessibility checks pass
   - Dashboard (mobile): FAIL -- NavBar does not collapse to hamburger menu
   - Task List (desktop): PASS
   - Task List (tablet): PASS -- 2-column grid confirmed
   - Settings: SKIP -- not yet implemented

   Accessibility findings:
   - 2 contrast ratio violations (Task List filter labels: 3.2:1, needs 4.5:1)
   - 1 missing form label (search input on Dashboard)

   Screenshots: screenshots/verify-visual/20260216_143022/
   ```

5. **Create fix tasks** for actionable failures, same as other verify dimensions.
   Visual regressions become fix tasks with specific component, screen, and breakpoint
   references.

**Relationship to autopilot mode:**

Autopilot mode includes self-testing at task completion. A lightweight visual check could
run after each UI task:

- After implementing a component task (Phase 2 or 3 of DESIGN_TASKS.md): if a component
  server is running, open the component and verify it renders correctly
- After implementing a screen task (Phase 4): if a dev server is running, navigate to the
  screen and run the corresponding DVC checks
- This is more granular than verify mode's holistic check -- it catches visual issues
  immediately rather than accumulating them

**Integration with existing verify dimensions:**

Dimension 8 should run after Dimension 2 (per-spec contract compliance) and before
Dimension 4 (spec-to-doc alignment). Rationale: Dimension 2 confirms the code is
structurally correct. Dimension 8 then confirms the visual output matches the design.
Dimension 4 then confirms the overall implementation aligns with system docs. This
ordering prevents wasted effort -- if Dimension 2 finds contract violations, there is
no point running visual checks on broken code.

**Tradeoffs**:
- *Pro*: Fills the explicit gap in verify mode's coverage
- *Pro*: Fix tasks from visual verification are immediately actionable
- *Pro*: Autopilot integration catches regressions early (per-task, not just at verify)
- *Con*: Dev server dependency -- verify mode must handle "server not running" gracefully
- *Con*: Visual verification is slower and flakier than code analysis
- *Con*: Adds complexity to an already complex verify mode (7 dimensions + 10 sub-checks)

**Source**: Analysis of cl-implementer SKILL.md, references/verify-mode.md,
references/autopilot-mode.md, and DESIGN_TASKS.md phase structure.

### Finding 7: Design-to-Code Visual Regression

**Context**: Can you screenshot a design mockup and the implemented page, then compare
them? What tools enable this? Is it feasible within Claude Code?

**Analysis**: Visual regression testing typically involves comparing two images: a
"baseline" (what it should look like) and a "current" (what it actually looks like).
In Clarity Loop, the baseline is a design artifact and the current is the running
implementation.

**Three comparison approaches:**

**Approach A: AI-powered visual comparison (vision mode)**

How it works: Take a screenshot of the design (from Pencil MCP or a saved design screenshot)
and a screenshot of the implemented page. Present both to the AI agent with a prompt:
"Compare these two images. Identify visual differences in layout, spacing, colors,
typography, and component rendering."

Feasibility in Claude Code: Fully feasible. Claude's vision capabilities can analyze two
images and identify differences. The agent reads both screenshots and produces a structured
diff.

Tradeoffs:
- *Pro*: No additional tooling -- works with existing Claude vision capabilities
- *Pro*: Can identify semantic differences ("the button text changed from 'Save' to
  'Submit'") not just pixel differences
- *Pro*: Handles layout differences across rendering engines (Pencil vs browser) gracefully
- *Con*: Expensive -- two images in context per comparison, multiplied by screens and
  breakpoints
- *Con*: Non-deterministic -- the AI may miss subtle differences or flag irrelevant ones
- *Con*: Cannot compute exact pixel-level metrics (precise spacing, exact color values)

**Approach B: Structural comparison (no vision)**

How it works: Instead of comparing images, compare the structural properties. From the
design: read component positions, sizes, colors, typography from DESIGN_SYSTEM.md and
UI_SCREENS.md. From the implementation: use `snapshot` (Playwright) to get the
accessibility tree, `run-code` to extract computed styles.

Feasibility in Claude Code: Feasible with Playwright CLI. The `snapshot` command returns
the accessibility tree. JavaScript can be run via `run-code` to extract computed CSS
properties.

Tradeoffs:
- *Pro*: Token-efficient -- text comparison, no images
- *Pro*: Deterministic -- exact property values compared
- *Pro*: Can check things images miss (z-index, overflow:hidden clipping, aria attributes)
- *Con*: Requires mapping between design system token names and CSS property names
- *Con*: Cannot catch visual issues that aren't reflected in properties (font rendering,
  anti-aliasing, visual weight/balance)
- *Con*: More complex to implement (property extraction + mapping + comparison)

**Approach C: Hybrid (structural by default, vision for flagged screens)**

How it works: Use structural comparison (Approach B) as the default for all screens. When
structural comparison detects potential issues or when the user flags specific screens for
deeper review, switch to vision mode for those screens.

This is the recommended approach. It balances token cost (most comparisons are structural
and cheap) with validation depth (vision mode is available for troubleshooting).

**Pencil-to-browser comparison specifically:**

The challenge with comparing Pencil mockups to browser renders is that Pencil is not a
browser. Font rendering, sub-pixel anti-aliasing, CSS box model nuances, and browser
compositor effects mean the two will never be pixel-identical. This is expected and
acceptable. The comparison should focus on:

- Layout structure (component order, hierarchy, presence/absence)
- Approximate dimensions (within tolerance -- a 200px-wide card at 195px is fine)
- Color values (token-based comparison, not pixel sampling)
- Typography (font family, size, weight -- not rendering quality)
- Component presence and variant (is the Button primary or ghost?)
- Responsive adaptation (does the layout change as specified at breakpoints?)

**Source**: Analysis of Bowser's Playwright CLI capabilities (screenshot, snapshot,
run-code), Claude's vision capabilities, and Pencil MCP's get_screenshot tool.

### Finding 8: Pencil MCP Rendering and Export Capabilities

**Context**: Can .pen files be exported to HTML for browser testing? What can Pencil MCP
export?

**Analysis**: Research into Pencil MCP's capabilities reveals the following:

**What Pencil MCP can do:**
- `batch_design`: Create, modify, and manipulate design elements on the canvas
- `batch_get`: Read design components, search elements, inspect hierarchy
- `get_screenshot`: Render previews of specific frames or the full canvas
- `snapshot_layout`: Analyze structure, detect positioning issues
- `get_variables` / `set_variables`: Manage design tokens
- `get_guidelines`: Retrieve design guidelines (e.g., Tailwind best practices)
- `get_style_guide` / `get_style_guide_tags`: Access style categories and inspiration
- `find_empty_space_on_canvas`: Find available canvas space for new elements
- `search_all_unique_properties`: Detect property inconsistencies across elements
- `replace_all_matching_properties`: Batch-update element properties

**What Pencil MCP cannot do (as of current documentation):**
- Export a `.pen` file to standalone HTML/CSS
- Export a `.pen` file to a runnable component (React, Vue, Svelte)
- Serve a `.pen` file as a browsable web page
- Generate a static site from design frames

**The .pen file format** is an open JSON-based format. Design files live in the git
repository and are version-controlled. However, the JSON structure describes canvas
elements (positions, sizes, fills, text content, nesting), not DOM elements. There is
no direct mapping from .pen JSON to HTML/CSS that would produce a renderable page.

**Code generation is AI-mediated, not automated export.** Pencil's design-to-code
workflow works by having the AI agent read the .pen file structure (via MCP tools) and
generate React/HTML/CSS code. This is a generative process, not an export function. The
generated code is an interpretation of the design, not a direct export.

**Implications for browser testing:**

1. **.pen files cannot be directly browser-tested.** There is no "export to HTML and open
   in browser" workflow. The .pen file is a design artifact, not a web artifact.

2. **Screenshots from `get_screenshot` are the closest to a "rendered" design.** These
   PNG files can be saved and used as visual baselines for comparison against
   implemented pages. This is the recommended approach for design-to-code visual
   regression.

3. **The markdown fallback path is inherently not visually testable.** Since it produces
   structured text (DESIGN_SYSTEM.md, UI_SCREENS.md), there is nothing to render. Browser
   validation on the markdown path only becomes possible after implementation begins.

4. **Component-level code generation could enable earlier browser testing.** If the AI
   generates a component from the Pencil design (via the standard code-generation
   workflow), that component could be rendered in a Storybook or dev server and
   browser-tested against the Pencil screenshot. This creates a workflow:

   ```
   .pen component → AI generates React code → Render in Storybook → Browser test →
   Compare against Pencil screenshot
   ```

   This is viable but depends on the implementation pipeline being active. It is not
   a cl-designer-only workflow.

**Recommendation**: Accept that .pen files are not browser-testable. Use Pencil MCP's
`get_screenshot` output as design baselines. Browser validation kicks in when
implementation produces renderable code, not before. The validate mode should clearly
communicate this: "Design validation requires implemented code. Save Pencil screenshots
as baselines and validate after implementation begins."

**Tradeoffs**:
- *Pro*: Clear boundary -- design artifacts are design tools, browser testing is for code
- *Pro*: Pencil screenshots as baselines are available immediately (no export needed)
- *Con*: Cannot validate responsive behavior of designs before implementation
- *Con*: Gap between design approval and visual validation remains until code exists

**Source**: Pencil MCP documentation at docs.pencil.dev, web research on Pencil's export
capabilities, analysis of .pen file format as JSON-based design data.

### Finding 9: Vision Mode Cost/Benefit Analysis

**Context**: When should screenshots be embedded in context (expensive but enables AI
judgment) vs. saved to disk (cheap but requires explicit review)?

**Analysis**: Vision mode in Playwright CLI is controlled by the environment variable
`PLAYWRIGHT_MCP_CAPS=vision`. When enabled, screenshots are returned as image responses
in the agent's context. When disabled (default), screenshots are saved to disk as PNG
files.

**Token cost comparison:**

| Scenario | Without Vision | With Vision |
|----------|---------------|-------------|
| Single screen, 1 breakpoint | ~500 tokens (text report) | ~1,500-2,500 tokens (text + image) |
| Single screen, 4 breakpoints | ~2,000 tokens | ~6,000-10,000 tokens |
| 10 screens, 4 breakpoints | ~20,000 tokens | ~60,000-100,000 tokens |
| Design-to-code comparison (2 images per screen) | N/A | ~120,000-200,000 tokens (10 screens) |

Note: Token costs for images are approximate and depend on resolution and content. Claude
processes images at approximately 1,000-2,500 tokens per image depending on size and the
number of tiles needed.

**When vision mode adds value:**

| Scenario | Value of Vision | Recommended |
|----------|----------------|-------------|
| Initial design validation (first pass) | Low -- structural checks sufficient | Disk |
| Investigating a specific failure | High -- AI can see what went wrong | Vision |
| Design-to-code comparison | High -- only way AI can judge visual similarity | Vision (targeted) |
| Responsive layout check | Medium -- layout issues visible in screenshots | Disk (review manually) or Vision (if automating) |
| Accessibility contrast check | Low -- can be computed from DOM properties | Disk |
| Component rendering check | Medium -- AI can assess visual correctness | Vision (if structural check flags issues) |

**Recommended policy for Clarity Loop:**

1. **Default: disk mode.** All screenshots saved to `screenshots/validation/<run-dir>/`.
   Text-based reports (PASS/FAIL per check, per breakpoint, per screen). This is the
   token-efficient default that works for most validation.

2. **Selective vision: flagged screens.** When structural comparison (Finding 7, Approach B)
   detects potential issues on a specific screen, escalate that screen to vision mode for
   the agent to analyze the screenshot. This keeps the cost proportional to the number of
   issues, not the number of screens.

3. **User-requested vision: troubleshooting.** When the user wants to understand a specific
   visual discrepancy, they can request vision mode for a specific screen or breakpoint.
   The DVC file or the validate command could accept a `--vision` flag for this purpose.

4. **Never bulk vision.** Running vision mode across all screens and all breakpoints should
   be explicitly warned against: "Vision mode for all 10 screens at 4 breakpoints will
   consume approximately [X] tokens. Continue? (Recommended: use structural validation
   first, then vision for flagged issues.)"

**Integration with checkpoint tiering:**

Vision mode invocation maps to checkpoint tiers:
- Structural validation results: Tier 3 (auto-proceed, logged)
- Vision escalation for flagged issues: Tier 2 (batch review -- present findings with
  screenshots)
- Full vision validation request: Tier 1 (must confirm -- warn about token cost)

**Source**: Bowser's playwright-bowser SKILL.md vision mode documentation,
bowser-qa-agent.md VISION variable, and token cost analysis based on Claude's image
processing characteristics.

## Options Analysis

Three approaches to implementing browser automation in Clarity Loop:

| Criterion | Option A: Full Integration | Option B: Standalone Skill | Option C: Lightweight Enhancement |
|-----------|--------------------------|--------------------------|----------------------------------|
| **Scope** | New validate mode in cl-designer, new Dimension 8 in cl-implementer verify, DVC YAML schema, validation agent, auto-generation of DVC files from design artifacts | New standalone cl-validator skill with its own modes, independent of cl-designer and cl-implementer | Enhance existing cl-designer browser tool detection + add simple post-implementation spot checks in cl-implementer |
| **DVC schema** | Rich schema with breakpoints, components, states, accessibility, interactions | Rich schema (same as A) | No schema -- inline checks in natural language |
| **Agent architecture** | Validation agent (adapted from bowser-qa-agent) spawnable by both cl-designer validate mode and cl-implementer verify mode | Standalone validation agent owned by cl-validator | No dedicated agent -- main context runs browser checks |
| **Parallelism** | Fan-out per screen via agent teams (if available), sequential fallback | Same fan-out capability | No parallelism -- single-context sequential checks |
| **Pipeline integration** | Deep -- generates from design artifacts, feeds back into design loop and implementation pipeline | Shallow -- reads design artifacts but doesn't generate from them | Minimal -- no structured integration |
| **Complexity** | High -- touches cl-designer, cl-implementer, adds new file format, new agent | Medium -- self-contained skill, new file format | Low -- minor changes to existing skills |
| **Time to first value** | Medium -- need DVC schema, agent definition, mode implementation | Medium -- need skill definition, modes, agent | Short -- enhance existing browser detection |
| **Value delivered** | Complete design validation loop closure | Design validation capability (but pipeline integration is manual) | Spot-check capability (not systematic) |
| **Maintenance** | Distributed -- changes span multiple skills and reference files | Centralized -- one skill to maintain | Minimal -- small additions to existing files |

## Recommendations

### Primary Recommendation: Option A (Full Integration), Phased

Full integration delivers the most value because it closes the feedback loop end-to-end.
But it should be delivered in phases to manage risk and deliver value incrementally.

**Phase 1: Foundation (Immediate)**

Deliverables:
- Playwright CLI browser skill reference file for Clarity Loop (adapted from Bowser's
  playwright-bowser SKILL.md, tailored for design validation context)
- Design validation agent definition (adapted from bowser-qa-agent, with design-specific
  reporting format)
- DVC YAML schema specification (version 1 -- screen, URL, breakpoints, components,
  accessibility checks)
- Browser tool detection enhancement in cl-designer setup mode (update priority order,
  detect Playwright CLI via `which playwright-cli`)

What works today: A user can manually create DVC files and invoke the validation agent
to check implemented screens against design specs. The pipeline provides the vocabulary
and tools, but auto-generation and deep integration come later.

**Phase 2: cl-designer Integration (After Phase 1)**

Deliverables:
- New `validate` mode in cl-designer with reference file (`references/validate-mode.md`)
- DVC auto-generation from UI_SCREENS.md and DESIGN_SYSTEM.md
- Pencil screenshot baseline capture (save `get_screenshot` outputs as design baselines
  during mockups mode for later comparison)
- Integration with design feedback loop: validation failures surface as design refinement
  suggestions or parked findings

What works now: After running `/cl-designer mockups` and starting implementation,
`/cl-designer validate` discovers or generates DVC files and runs validation against
the running application.

**Phase 3: cl-implementer Integration (After Phase 2)**

Deliverables:
- Dimension 8 (Visual Verification) in cl-implementer verify mode
- Autopilot mode integration: per-task visual checks after UI task completion
- Fix task generation from visual regression findings
- DVC file sync with spec changes (when cl-implementer sync mode detects spec changes
  that affect UI_SCREENS.md, flag DVC files for regeneration)

What works now: `/cl-implementer verify` includes visual verification alongside the
existing seven dimensions. Autopilot catches visual regressions per-task.

**Phase 4: Advanced Capabilities (Future)**

Deliverables:
- Fan-out validation via agent teams (one validation agent per screen, parallel execution)
- Vision mode with hybrid comparison (structural default, vision for flagged screens)
- Cross-screen visual consistency checks (are all pages using the same nav component?)
- CI integration guidance (headless validation on PR)

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| No dev server running during validation | High | Medium -- validate mode cannot execute | Clear error message: "Start your dev server first." Skip gracefully. Never block the pipeline. |
| Playwright CLI not installed | Medium | Medium -- primary tool unavailable | Fall back to Chrome MCP (degraded). Provide installation instructions. Detect during setup mode. |
| DVC files become stale as design evolves | Medium | Low -- stale checks produce false failures | DVC files auto-regenerated from UI_SCREENS.md. Spec hash tracking (like TASKS.md) detects staleness. |
| Browser tests are flaky (network timing, rendering delays) | High | Low -- validation is advisory | All browser validation is advisory (Tier 3). Flaky results are logged, not blocking. Retry logic for transient failures. |
| Token cost of vision mode exceeds budget | Medium | Medium -- expensive validation runs | Default to disk mode. Vision is opt-in and scoped. Warn before bulk vision runs. |
| .pen files cannot be exported to HTML | Confirmed | Medium -- cannot browser-test designs before implementation | Accept this limitation. Use Pencil screenshots as baselines. Browser validation starts when code exists. |
| DVC schema becomes too complex for manual authoring | Low | Low -- auto-generation is primary path | Keep manual authoring simple (only required fields: screen, url, checks). Rich schema is for auto-generated files. |
| Agent teams feature unavailable or unstable | Medium | Low for Phase 1-3, High for Phase 4 | Phases 1-3 work without teams (sequential validation). Phase 4 fan-out degrades to sequential if teams unavailable. |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| SYSTEM_DESIGN.md | New section on browser automation capability; DVC schema specification; validation agent architecture |
| docs/cl-designer.md | New validate mode description; updated browser tool detection; baseline screenshot capture during mockups |
| docs/cl-implementer.md | New Dimension 8 in verify mode; autopilot visual check integration; DVC file handling in sync mode |
| docs/pipeline-concepts.md | Browser validation as a cross-cutting pipeline concept; vision mode cost/benefit guidance |
| (new) Browser automation reference | Reference file defining Playwright CLI usage patterns adapted for Clarity Loop |
| (new) Validation agent definition | Agent definition for design validation (thin wrapper around browser skill) |
| (new) DVC schema reference | YAML schema specification for Design Validation Criteria files |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Browser automation tool | Playwright CLI vs Chrome MCP vs Playwright MCP | Playwright CLI as primary, Chrome MCP as fallback | Parallelism via named sessions, headless support, token efficiency, CI suitability, proven Bowser precedent |
| 2 | Integration approach | Full integration vs standalone skill vs lightweight enhancement | Full integration, phased delivery | Closes the feedback loop end-to-end; phasing manages risk and delivers value incrementally |
| 3 | Validation criteria format | Bowser's simple YAML vs rich DVC schema vs no schema (inline checks) | Rich DVC schema with auto-generation from design artifacts | Design validation needs richer schema than general QA; auto-generation reduces authoring burden |
| 4 | .pen file browser testing | Direct export vs screenshot baselines vs skip entirely | Screenshot baselines from Pencil MCP | .pen files cannot be exported to HTML; screenshots are available and sufficient for comparison |
| 5 | Vision mode default | Always on vs always off vs selective | Off by default (disk), selective escalation for flagged issues | Token cost management; most validation works structurally; vision is available when needed |
| 6 | Validation gating | Blocking gate vs advisory vs conditional | Advisory (Tier 3) by default, with escalation for accessibility failures | Validation depends on running code which may not exist; blocking would stall the pipeline |
| 7 | Visual comparison approach | Pixel comparison vs AI vision vs structural vs hybrid | Hybrid: structural default, vision for flagged screens | Balances token cost (structural is cheap) with validation depth (vision for troubleshooting) |
| 8 | Phase ordering | cl-designer first vs cl-implementer first vs parallel | Foundation first, then cl-designer, then cl-implementer | cl-designer validate mode generates DVC files that cl-implementer verify mode consumes; natural dependency |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| DVC auto-generation as a pipeline artifact | DVC files generated from UI_SCREENS.md + DESIGN_SYSTEM.md create a new artifact type in the pipeline -- validation criteria derived from design specs, consumed by implementation verification | Scope as part of Phase 2; define generation rules and staleness tracking |
| Pencil screenshot baselines | Saving `get_screenshot` output during mockups mode as design baselines for later visual regression testing creates a new data flow: design screenshots persisted for implementation comparison | Scope as part of Phase 2; define storage location and naming convention for baseline screenshots |
| Component server detection | Detecting whether a Storybook, Ladle, or framework dev server is running (and at what URL) is a prerequisite for component-level browser testing. This is a general-purpose capability other pipeline stages could use | Low-priority infrastructure; could be part of cl-implementer's dev environment awareness |
| Accessibility-first validation | Running axe-core or equivalent in a real browser provides accessibility validation that is significantly more accurate than the agent's computed checks from token values. This could become the primary accessibility gate. | Consider making real-browser accessibility checks the authoritative source, replacing or supplementing the visual-quality-rules.md computed checks |

## Open Questions

1. **Playwright CLI availability**: Is `playwright-cli` the exact binary name in the
   current ecosystem, or is it project-specific to Bowser? If Bowser uses a custom CLI
   wrapper, Clarity Loop may need to use the standard Playwright test runner or the
   `@playwright/test` npm package instead. Need to verify the exact installation and
   invocation path.

2. **DVC auto-generation fidelity**: How accurately can DVC files be generated from
   UI_SCREENS.md and DESIGN_SYSTEM.md? The design artifacts use natural language
   descriptions ("Navigation bar with 5 links") that must be translated into testable
   assertions ("Verify navigation bar has at least 5 link elements"). What is the error
   rate of this translation, and how should ambiguous descriptions be handled?

3. **Component server detection**: How should the validate mode detect a running dev
   server? Options: check common ports, read `package.json` scripts, ask the user, or
   require explicit configuration in `.clarity-loop.json`. What is the right default
   behavior?

4. **Baseline screenshot management**: Where should Pencil design screenshots be stored
   for later comparison? Options: `{docsRoot}/designs/baselines/`, alongside the .pen file,
   or in a gitignored cache directory. Should they be version-controlled (they are PNGs --
   large, binary) or treated as ephemeral (regenerated from .pen file as needed)?

5. **axe-core injection**: Is injecting axe-core via Playwright CLI's `run-code` command
   reliable for accessibility testing? Does Playwright CLI support loading external scripts,
   or would axe-core need to be bundled/fetched at runtime? What is the scope of
   accessibility checks that can be performed this way vs. using a dedicated accessibility
   testing library?

6. **Interaction testing depth**: How deep should interaction testing go in the validate
   mode? Options range from "verify elements are clickable" (smoke test) to "execute full
   user flows with state assertions" (integration test). Deeper testing provides more
   confidence but takes longer, costs more tokens, and is more prone to flakiness. Where
   is the right balance for design validation (as opposed to full QA testing)?

## References

- **Bowser project source code**: `/Users/bhushan/Documents/bowser/`
  - `.claude/skills/playwright-bowser/SKILL.md` -- Playwright CLI browser automation skill
  - `.claude/skills/claude-bowser/SKILL.md` -- Chrome MCP alternative
  - `.claude/agents/bowser-qa-agent.md` -- QA validation agent
  - `.claude/commands/ui-review.md` -- Fan-out test orchestration
  - `ai_review/user_stories/hackernews.yaml` -- YAML story format
  - `ai_review/user_stories/example-app.yaml` -- Example with localhost testing

- **Clarity Loop skills**:
  - `skills/cl-designer/SKILL.md` -- Design skill with browser tool detection
  - `skills/cl-designer/references/mockups-mode.md` -- Screen generation and review
  - `skills/cl-designer/references/visual-quality-rules.md` -- Visual verification protocol
  - `skills/cl-designer/references/tokens-mode.md` -- Component generation
  - `skills/cl-designer/references/behavioral-walkthrough.md` -- Screen behavioral specs
  - `skills/cl-designer/references/build-plan-mode.md` -- Implementation task generation
  - `skills/cl-implementer/SKILL.md` -- Implementation orchestration
  - `skills/cl-implementer/references/verify-mode.md` -- 7-dimension verification

- **Prior research**: `docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md` -- Bowser
  architecture analysis, specifically Finding 3 (Browser Automation as UI Validation) and
  Finding 5 (YAML Workflows)

- **Pencil MCP documentation**: [docs.pencil.dev](https://docs.pencil.dev/getting-started/ai-integration) --
  AI integration capabilities, MCP tool reference
