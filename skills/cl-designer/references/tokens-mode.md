## Tokens Mode

Generates or extracts design tokens and a reusable component library. This is the most
complex mode — two paths (Pencil and markdown fallback) converge on the same output
artifacts.

**Gate**: Setup must be complete. Check `{docsRoot}/designs/DESIGN_PROGRESS.md` for:
- `Setup` status is `Complete`
- MCP path is recorded
- Design direction / user decisions are captured

If setup is incomplete: "Setup hasn't been completed yet. Run `/cl-designer setup` first
to detect design tools and establish the design direction."

---

### Pencil Path (generating from scratch)

#### Step 1: Derive Token Values

Map user preferences from DESIGN_PROGRESS.md to concrete token values. Read the PRD to
understand what features need — an admin dashboard needs different tokens than a consumer
mobile app.

Derive these token categories:

**Colors:**
- Primary (main brand color + shades: 50–950)
- Secondary (supporting color + shades)
- Accent (call-to-action, highlights)
- Neutral (grays for text, borders, backgrounds)
- Semantic: success, warning, error, info (each with base + light + dark)

**Typography:**
- Font families: sans (UI), mono (code), display (headings, if distinct)
- Size scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl
- Weight scale: light (300), normal (400), medium (500), semibold (600), bold (700)
- Line heights: tight (1.25), normal (1.5), relaxed (1.75)

**Spacing:**
- Base unit (typically 4px or 8px)
- Scale: 0.5x, 1x, 1.5x, 2x, 3x, 4x, 6x, 8x, 10x, 12x, 16x

**Other:**
- Border radius: none, sm, md, lg, full
- Shadows: sm, md, lg, xl
- Transition durations: fast (150ms), normal (200ms), slow (300ms)

**Theme axes** (if user wants light + dark):
- Define semantic color mappings for each theme (background, surface, text, border)

Present the token table to the user: "Here are the proposed token values based on our
design discussion. Review and adjust before I generate them: [table]"

Wait for user confirmation or adjustments.

#### Step 2: Create and Set Up the .pen File

**Important**: Pencil MCP's `open_document("new")` creates a file in memory only — it does
NOT write to disk. You must create the file on the filesystem first, then open it.

1. Derive the .pen filename from the project name (e.g., `hermit.pen`, `todo-app.pen`).
   Use the PRD title or project directory name, lowercased and hyphenated.
   If `{docsRoot}/designs/{project-name}.pen` does not exist, create it on disk using the
   `Write` tool (empty content is fine — Pencil will populate it).
   Record the chosen filename in DESIGN_PROGRESS.md so mockups mode knows which file to open.
2. Call `open_document("{docsRoot}/designs/{project-name}.pen")` to open it in Pencil
3. **Load Pencil schema reference and templates** before any `batch_design` operations:
   - Read `references/pencil-schema-quick-ref.md` for property syntax (layout, fill, text properties)
   - Read `references/pencil-templates.md` for copy-paste examples
   - These files ensure correct property names and provide working code snippets
4. **Create separate top-level frames — not one giant wrapper.** A fresh .pen file is a
   blank canvas. The instinct is to create a single large frame that holds everything, but
   this forces the user to constantly zoom in and out of a massive container. Instead,
   create each section as its own independent top-level frame on the canvas:
   - "Color Tokens" — sized to fit its content (e.g., 900×600)
   - "Typography" — sized to fit its content (e.g., 600×500)
   - "Spacing & Sizing" — sized to fit its content (e.g., 600×400)
   - "Components" — starts small, grows as components are added
   - **Arrange frames in a grid, not a vertical column.** A single column wastes the
     canvas width and forces endless scrolling. Use a layout like:
     ```
     Row 1:  [ Color Tokens (wide)       ] [ Typography        ]
     Row 2:  [ Spacing & Sizing           ] [ (empty or overflow)]
     Row 3:  [ Components — Form Controls ] [ Components — Data Display    ]
     Row 4:  [ Components — Navigation    ] [ Components — Layout/Feedback ]
     ```
     Color Tokens is typically the widest section — give it ~900px width. Typography and
     Spacing can sit beside each other or beside Color Tokens. Component categories work
     well in a 2-column grid since they're similar in width.
   - Use **at least 100px gaps** between frames in both directions
   - Use `find_empty_space_on_canvas` if resuming an existing file
   - Each frame gets a clear title label at the top
   - **Set `layout: "vertical"` with explicit `gap` values on every frame.** This is
     critical — auto-layout prevents the text overlap issues that manual positioning causes.
     Without auto-layout, elements placed at absolute coordinates will overlap when text
     renders taller than expected (a 36px heading needs ~50px of vertical space with line
     height and padding).
   - **Always use light backgrounds with dark text for token/component showcase frames.**
     Regardless of the project's theme (light or dark mode), token section frames and
     component category frames must have `fill: "#ffffff"` (white) with dark text
     (`fill: "#1a1a1a"` for labels and titles). These are documentation/presentation frames,
     not theme-aware UI — visibility is critical. The actual app components will use the
     project's theme tokens, but the showcase frames displaying those tokens must remain
     readable. This prevents dark-on-dark invisible content when the user's design direction
     includes dark mode aesthetics.
   - Use `batch_design` for all of this in one call — frame creation + title labels
   - **Why separate frames matter**: the user can click any frame and zoom to fit just that
     section. They can evaluate colors at readable size without the typography section
     eating space below. When you `get_screenshot` a specific frame, it captures just that
     section at a useful zoom level — not a tiny overview of a 4000px canvas.
   - This structure is what the user will see. **Organization is not optional** — the user
     is not a designer, so clearly scoped, navigable sections are essential for them to
     understand and provide feedback on
4. Call `set_variables` for all token values:
   - Group by category (color, typography, spacing, etc.)
   - If light + dark themes: define theme axes with per-theme values
5. Call `get_variables` to verify tokens were set correctly
6. **Run pre-generation checklist** before any `batch_design` calls. Verify:
   - [ ] All auto-layout frames will use `layout: "vertical"` or `"horizontal"` (NOT `layoutMode`)
   - [ ] All showcase frames will have `fill: "#ffffff"` (white background)
   - [ ] All showcase text will have `fill: "#1a1a1a"` (dark text for contrast)
   - [ ] Font weights are strings: `"normal"` not `400`, `"bold"` not `700`
   - [ ] Layout values are lowercase: `"vertical"` not `"VERTICAL"`
   - [ ] Gap and padding are numbers: `24` not `"24px"`
   - [ ] Every Insert/Copy/Replace will have a binding: `foo=I(...)`
   - [ ] Property names match Pencil schema (check `pencil-schema-quick-ref.md` if unsure)
7. **Populate each section frame with token visualizations.** This is the first visual
   artifact the user sees — if it's a wall of unlabeled rectangles, they'll be lost.
   Structure each section carefully:

   **Color Tokens section** — organize as labeled rows, one row per color role:
   - Set the frame to `layout: "vertical"` with `gap: 24` between rows
   - Each row is a horizontal auto-layout container (`layout: "horizontal"`, `gap: 16`)
   - Row label on the left (e.g., "Primary", "Secondary", "Neutral", "Success")
   - Swatches in a horizontal strip from lightest to darkest (50 → 900)
   - Only show 5-6 key shades per row, not all 10+ — too many swatches is noise
   - Each swatch labeled with its token name and hex value — label goes below the swatch
     with enough vertical space (the swatch + label together need ~80px height minimum)
   - Semantic colors (success, warning, error, info) as a separate group below the
     palette, with just base + light + dark variants each
   - If light + dark themes: show them as two side-by-side sub-groups within the color
     frame, not interleaved
   - **After `batch_design`: call `snapshot_layout` and check for overlapping bounding
     boxes.** If any swatch labels overlap adjacent swatches or row labels bleed into
     the row below, fix spacing before proceeding.
   - **Example structure** for Color Tokens frame:
     ```javascript
     colorFrame=I(document, {type: "frame", name: "Color Tokens", layout: "vertical",
                              gap: 24, padding: 32, fill: "#ffffff", width: 900, height: 600,
                              x: 100, y: 100})
     title=I(colorFrame, {type: "text", content: "Color Tokens", fontSize: 24,
                          fontWeight: "normal", fill: "#1a1a1a"})
     // Then add rows, swatches, labels — all with explicit fill colors for visibility
     ```

   **Typography section** — show as a vertical stack, largest to smallest:
   - Set the frame to `layout: "vertical"` with `gap: 16`, `fill: "#ffffff"`, `padding: 32`
   - Frame title and all text samples use `fill: "#1a1a1a"` (dark text on white background)
   - One line per size level: "4xl — The quick brown fox" / "3xl — The quick brown fox" /
     etc., each rendered at the actual font size
   - **Give each line enough vertical space.** A 36px heading needs at least 50px of row
     height (font size × 1.4). Don't pack lines tightly — overlap between large text and
     the line below is the most common visual defect.
   - Below the size stack, add a divider or 32px gap, then a "Weights" group showing the
     same text in light / normal / medium / semibold / bold
   - If showing multiple font families (e.g., sans + mono), separate them with a clear
     label and 32px gap — don't let one family's last line overlap the next family's title
   - Font family name as a label at the top of each family group
   - **After `batch_design`: call `snapshot_layout`.** Typography is the highest-risk
     section for overlap because text at different sizes renders at unpredictable heights.
     Verify every line has clear separation.

   **Spacing & Sizing section** — show as a horizontal row of blocks:
   - Set the frame to `layout: "vertical"` with `gap: 24` between sub-sections,
     `fill: "#ffffff"`, `padding: 32`
   - Frame title and all labels use `fill: "#1a1a1a"` (dark text)
   - The spacing row itself is `layout: "horizontal"` with `gap: 16`
   - Each block is a filled square sized to the spacing value (4px, 8px, 16px, etc.)
   - Label below each block with token name and pixel value
   - This row naturally reads left-to-right, small to large
   - Below the spacing row, show border radius and shadow tokens as small example
     rectangles with labels
   - **After `batch_design`: call `snapshot_layout`** to verify no overlap between blocks
     or labels.

   Use `batch_design` — keep to ~25 operations per call. Do one section at a time.
   **Always `snapshot_layout` after each section before moving on.** Fix any overlaps
   immediately — don't accumulate layout issues across sections.

   **Accessibility during token visualization:**
   - When generating color swatches, note which foreground colors meet 4.5:1 contrast
     against which background colors. Document safe pairings (e.g., "primary-900 text on
     primary-50 background: ✓ 4.5:1") in the swatch labels or as a summary after the
     color section. This prevents downstream contrast failures in components and screens.
   - If any primary text/background combination fails 4.5:1, flag it to the user during
     token review: "Warning: [token pair] has insufficient contrast ([ratio]). Adjust the
     shade or plan to use it only for large text (3:1 threshold)."

7. **Show tokens to the user one section at a time.** Don't screenshot the entire design
   system frame — it will be too dense to evaluate.
   - `get_screenshot` of the Color Tokens section → present, gather feedback
   - `get_screenshot` of the Typography section → present, gather feedback
   - `get_screenshot` of the Spacing section → present, gather feedback
   - For each: explain what they're looking at. "Here's your color palette. The top row
     is your primary blue in 5 shades from light to dark. Below that are neutrals for
     text and backgrounds, then semantic colors for status indicators."
   - If the user wants changes to a section, apply them before moving to the next

   **Batch option for token sections**: When `ux.reviewStyle` is `"batch"`, present all
   three token sections (colors, typography, spacing) together with a summary table before
   individual screenshots. "Here's your design token overview: [summary]. Want to see each
   section in detail, or does the summary cover it?" If the user wants details, show
   section-by-section screenshots. If the summary is sufficient, proceed to components.
   Default for token sections is still sectional (colors then typography then spacing) because
   the feedback on these tends to be substantive. The batch option is for experienced users
   who know what they want.

8. Record in DESIGN_PROGRESS.md: tokens generated, file reference, user approval per section

#### Step 3: Identify and Generate Reusable Components

**IMPORTANT:** Component identification is the foundation of the design system. A shallow
analysis here causes downstream problems (missing components, duplicate effort, poor
composition, incomplete behavioral specs). Invest 15-20 minutes in systematic identification.

1. **Load component identification process:**
   Read `references/component-identification-process.md` for the full methodology. This guide
   explains atomic design principles (atoms → molecules → organisms), pattern recognition,
   and traceability validation.

2. **Extract UI patterns from PRD** (feature-by-feature analysis):
   For each PRD feature, identify:
   - Data displays (lists, cards, tables, stats)
   - Input mechanisms (forms, search, filters)
   - Actions (buttons, links, menus)
   - Navigation (tabs, sidebar, breadcrumbs)
   - Feedback (toasts, modals, errors, loading)

   Create a feature-to-UI-pattern matrix to visualize coverage.

3. **Identify atoms** (indivisible primitives):
   Buttons (primary, secondary, danger, ghost, icon), Inputs (text, textarea, select,
   checkbox, radio), Text (headings, body, labels), Indicators (badges, avatars, icons,
   spinners). These have no composition and highest reusability.

4. **Identify molecules** (simple compositions):
   Look for atoms that always appear together: Input-with-Label (Label + Input + Helper +
   Error), Search Box (Icon + Input + Clear Button), Tag/Chip (Badge + Close Icon). These
   compose 2-3 atoms with a focused purpose.

5. **Identify organisms** (complex compositions):
   Feature-specific components that compose molecules/atoms: Cards, Form Sections, List Items
   (e.g., Task List Item), Modals, Navigation Sidebars. These map to specific PRD features
   but are reusable across 2+ features.

6. **Create component-to-feature traceability matrix:**
   Map every component to the PRD features it serves. Validate that every feature's UI needs
   are covered. Identify gaps.

7. **Prioritize by dependency order:**
   Generate atoms first (no dependencies), then molecules (depend on atoms), then organisms
   (depend on molecules). This builds the foundation before complex components.

8. **Define behavioral variants per component:**
   For each component, identify required states: Button (idle, hover, focus, loading,
   disabled), Input (empty, focused, filled, error, disabled), Organism-specific states
   (Task List Item: unchecked, checked, deleting). Include ARIA attributes.

9. **Present comprehensive component plan to user:**
   Show the full inventory with:
   - Atoms (X components) — table with variants, states, reusability
   - Molecules (X components) — table with composition, features served
   - Organisms (X components) — table with composition, features served, complexity
   - Behavioral specifications for key components
   - Generation order (atoms → molecules → organisms)

   Ask: "This is the complete design system based on the PRD. It covers all [N] features.
   Add, remove, or adjust components?"

   Wait for user confirmation or adjustments.

10. **Load component templates:**
    Read `references/pencil-templates.md` for copy-paste examples of common atoms and
    molecules (Button, Input, Card, etc.). Use these as starting points — copy the template,
    adjust colors/sizes to match your tokens, execute via `batch_design`. This ensures
    correct property names and structure.

11. Call `get_guidelines("tailwind")` for additional styling best practices (if needed)

4. Create a **separate top-level frame per component category** on the canvas (same
   principle as token sections — no giant wrapper):
   - "Components — Form Controls" (Button, Input, TextArea, Select, Checkbox)
   - "Components — Layout" (Card, Nav/Sidebar, Modal/Dialog)
   - "Components — Feedback" (Toast/Alert, Badge)
   - "Components — Project-Specific" (whatever the PRD requires)
   - **Arrange component categories in a grid (2 columns), not a vertical stack.**
     Use `find_empty_space_on_canvas` to place them below the token frames but side
     by side — e.g., Form Controls next to Data Display, Navigation next to Layout.
     This cuts the vertical scrolling in half and lets the user see related categories
     at the same zoom level.
   - Size each category frame to fit its components (not oversized)
   - **Use light backgrounds (`fill: "#ffffff"`) for component category frames** with dark
     text for labels — same principle as token sections. This ensures components are visible
     regardless of the project's theme.
4. For each component:
   - Create a labeled container group within its category frame
   - Call `batch_design` with `reusable: true` — **this is critical.** The `reusable` flag
     registers the component in Pencil's component library. During mockups mode, screens
     will use `ref` nodes to instantiate these components instead of recreating them from
     scratch. A component created without `reusable: true` can't be referenced — it's just
     a one-off group of shapes.
   - Apply tokens via variable references (not hardcoded values)
   - Show all variants side-by-side within the container (e.g., Button: primary, secondary,
     ghost — all in one row with labels)
   - Keep operations to ~25 per `batch_design` call
   - **Generate behavioral state variants** for components that have significant states
     beyond visual variants. Not every component needs this — focus on components with
     loading, error, or disabled states that affect user interaction:
     - **Button**: idle, loading (spinner variant), disabled. Show loading variant with
       spinner replacing or overlaying text.
     - **Input**: empty, focused, filled, error (with error message), disabled. Show
       error variant with inline error text.
     - **Form group**: pristine, dirty, submitting, error. At minimum show error state.
     - **List/Table**: populated, empty (with empty state component), loading (skeleton rows).
     - **Modal**: open state with focus trap indicator (visual note, not animation).
     - **Toast/Alert**: visible state with variants (success, error, warning, info).
     Place behavioral state variants in a separate row below the visual variants within
     the component group, labeled "States". Use `snapshot_layout` to prevent overlap.
   - **Enforce accessibility hard constraints during generation** (see
     `references/visual-quality-rules.md`):
     - **Target sizes**: Button height ≥ 36px, icon buttons ≥ 32×32px, checkbox/radio/toggle
       controls ≥ 20×20px with padding to reach 24×24px interactive area.
     - **Contrast**: Text color on component backgrounds must meet 4.5:1 (regular) or 3:1
       (large text ≥ 24px). Check especially: disabled state text, placeholder text, error
       state text on colored backgrounds.
     - **Labels**: Input, Select, TextArea components must include a label element in their
       reusable structure (or be documented as requiring an external label). Placeholder text
       alone is never sufficient.
     - **Focus indicators**: Include a "focused" state variant for every interactive component
       showing the design system's focus outline (color, offset, width from tokens). This
       variant doesn't need to be a full behavioral state — a visual annotation showing the
       focus ring is sufficient.
     - **Similarity within component families**: All buttons share fill + font weight + corner
       radius across variants (only the specific values change). All inputs share border style
       + padding + label positioning. Use `search_all_unique_properties` after generating a
       component category to detect unintended inconsistencies.
5. **Every element must be inside its category frame.** Never create floating elements
   on the root canvas. If a component doesn't fit existing categories, create a new
   category frame for it.

#### Step 4: Component Validation

**Check the review style** from `.clarity-loop.json` (`ux.reviewStyle`). Default is
`"batch"`. If `"serial"`, use the serial path below. If the value is unrecognized, fall
back to `"batch"` and warn the user.

##### Batch Review (Default)

Generate ALL components first (Steps 3.1-3.5 above), then present them as a set:

1. **Generate all components** before presenting any for review. Use `snapshot_layout`
   after each `batch_design` call to catch overlaps -- fix layout issues immediately, but
   don't stop for user feedback yet.

2. **Present the batch.** Two presentation options depending on path:

   **Pencil path**: Take a grid screenshot showing all component categories
   (or one screenshot per category if the grid is too dense). Present with a summary table:

   | Component | Variants | PRD Feature | Tokens Used | Behavioral States | A11y | Status |
   |-----------|----------|-------------|-------------|-------------------|------|--------|
   | Button | primary, secondary, ghost | Task actions, forms | primary-500, space-3 | idle, loading, disabled | Enter/Space, aria-busy | Review |
   | Input | text, email, password | Forms, search | neutral-200, space-2 | empty, focused, error, disabled | aria-invalid, Tab | Review |
   | Card | default, compact | Task list, dashboard | neutral-50, shadow-md | | | Review |
   | ... | ... | ... | ... | ... | ... | Review |

   "Here are all [N] components. Review the summary and screenshots. Flag any that need
   changes -- I'll revise those and leave the rest as-is."

   **Markdown fallback path**: Present the full component spec table. Same summary format.

3. **Gather batch feedback.** The user responds with specific items to revise:
   - "Button loading state needs work, Card padding too tight, rest looks good"
   - "All approved"
   - "I want to review Input and Modal more closely" (switches to serial for those items)

4. **Revise flagged items.** For each flagged component:
   - Apply the feedback
   - Re-screenshot the specific component (zoomed in)
   - Present the revision: "Updated Button loading state. Here's the before and after."
   - If Pencil: re-run `snapshot_layout` to verify no new overlaps
   - When presenting a component (during revision or initial review), include:
     - **Behavioral states**: Explain the state model. "Button has idle, loading, and
       disabled states. Loading shows a spinner and prevents re-click. Disabled triggers:
       [proposed triggers based on PRD context]."
     - **Accessibility**: Note ARIA attributes and keyboard interaction. "Button uses
       `aria-busy` during loading, `aria-disabled` when conditions aren't met. Activates on
       Enter and Space."
     - **Boundary behavior**: Note truncation/overflow strategy. "Text truncates with
       ellipsis at container width. Minimum width: 80px."

5. **Record all decisions** in DESIGN_PROGRESS.md -- both batch-approved and individually
   revised components.

6. **Capture behavioral specification per component** in DESIGN_PROGRESS.md:

   ```markdown
   ### [Component Name]
   - **Approval**: [Approved | Needs changes]
   - **Behavioral states**: [idle, loading, error, disabled — with triggers]
   - **Accessibility**: [ARIA attributes, keyboard interaction, focus behavior]
   - **Boundary behavior**: [truncation strategy, overflow, min/max constraints]
   ```

**Efficiency note**: Most components are approved without changes. Batch review turns
N interruptions into 1 + K (where K is the number flagged for revision, typically 2-3).

##### Serial Review (Opt-in)

When `ux.reviewStyle` is `"serial"`, or when the user requests "I want to review each
component individually":

For each component (or small batches of related components):
1. Call `get_screenshot` of the specific component group
2. Call `snapshot_layout` to check for layout issues
3. Present screenshot to user with component name, PRD feature, variants, tokens used.
   Include when presenting:
   - **Behavioral states**: Explain the state model. "Button has idle, loading, and
     disabled states. Loading shows a spinner and prevents re-click. Disabled triggers:
     [proposed triggers based on PRD context]."
   - **Accessibility**: Note ARIA attributes and keyboard interaction. "Button uses
     `aria-busy` during loading, `aria-disabled` when conditions aren't met. Activates on
     Enter and Space."
   - **Boundary behavior**: Note truncation/overflow strategy. "Text truncates with
     ellipsis at container width. Minimum width: 80px."
4. Gather feedback: Approved / Needs changes / Rejected
5. Record all decisions and iterations in DESIGN_PROGRESS.md

##### Minimal Review (Opt-in)

When `ux.reviewStyle` is `"minimal"`:

Generate all components, present a one-line summary per component, and auto-approve
unless the user speaks up. Record with `[auto-approved]` tag in DESIGN_PROGRESS.md.

---

### Markdown Fallback Path

#### Step 1: Derive Token Values

Same process as Pencil Step 1 — map user preferences to concrete values, present table,
get confirmation.

#### Step 2: Document Tokens

Write token tables directly. No .pen file generation — tokens are captured as structured
markdown in the output DESIGN_SYSTEM.md.

#### Step 3: Document Components

For each component identified from PRD features, document:
- **Name**: Component name
- **Purpose**: What it does, which PRD feature it serves
- **Variants**: List of visual variants with descriptions (primary, secondary, ghost, etc.)
- **Props/inputs**: What the component accepts (name, type, default)
- **Visual states**: Appearance states (default, hover, focus, disabled)
- **Behavioral states**: State machine with triggers and transitions:

  | State | Trigger | Visual Change | Behavior |
  |-------|---------|---------------|----------|
  | idle | default | — | Clickable, accepts focus |
  | loading | form submit / async action | Spinner, text change or overlay | Prevents re-click, `aria-busy="true"` |
  | error | action failure | Error styling (red border, etc.) | Shows error message, allows retry |
  | disabled | [condition from PRD context] | Reduced opacity | Not focusable via click, `aria-disabled="true"` |

  Not every component needs all states. Focus on states that affect user interaction —
  a Badge has no loading state. A Button does.

- **Accessibility**: ARIA attributes, keyboard interaction, focus behavior:
  - `role` (if not implicit from HTML element)
  - Relevant ARIA attributes (e.g., `aria-expanded`, `aria-invalid`, `aria-busy`)
  - Keyboard interaction: which keys do what (Enter, Space, Escape, Arrow keys)
  - Focus behavior: is it focusable? Tab order? Focus trap (for modals)?

- **Boundary behavior**:
  - Truncation strategy (ellipsis, fade, word boundary, none)
  - Overflow handling (scroll, wrap, hide)
  - Min/max constraints (minimum width, maximum content length)

- **Token usage**: Which tokens the component uses (colors, spacing, typography)
- **Visual description**: Textual description of appearance since no screenshot is available

Present each component spec to the user for feedback.

---

### All Paths: Generate DESIGN_SYSTEM.md

After tokens and components are complete (any path), generate
`{docsRoot}/specs/DESIGN_SYSTEM.md`:

```markdown
# Design System

**Generated**: [date]
**Source**: [Pencil (.pen file) | Manual specification]
**PRD reference**: [filename]

## Design Direction

[Summary from DESIGN_PROGRESS.md — aesthetic, mood, key decisions]

## Token Catalog

### Colors

| Token | Light | Dark | Source |
|-------|-------|------|--------|
| color-primary-500 | #3B82F6 | #60A5FA | [generated | user preference] |
| ... | ... | ... | ... |

### Typography

| Token | Value | Source |
|-------|-------|--------|
| font-sans | Inter, system-ui, sans-serif | [source] |
| text-base | 16px / 1.5 | [source] |
| ... | ... | ... |

### Spacing

| Token | Value | Source |
|-------|-------|--------|
| space-1 | 4px | [source] |
| space-2 | 8px | [source] |
| ... | ... | ... |

### Other Tokens

[Border radius, shadows, transitions — same format]

## Component Catalog

### [Component Name]

- **Purpose**: [what it does]
- **PRD feature**: [which feature drove this component]
- **Variants**: [visual variants list — primary, secondary, ghost, etc.]
- **Design reference**: [.pen node ID | "markdown spec"]

**Behavioral States**:
| State | Trigger | Visual Change | Behavior |
|-------|---------|---------------|----------|
| idle | default | — | [default behavior] |
| loading | [trigger] | [visual change] | [behavioral change, e.g., prevents re-click] |
| error | [trigger] | [visual change] | [behavioral change, e.g., shows error message] |
| disabled | [trigger] | [visual change] | [behavioral change, e.g., not focusable] |

Omit states that don't apply to this component.

**Accessibility**:
- **ARIA**: [relevant attributes — aria-busy, aria-disabled, aria-expanded, etc.]
- **Keyboard**: [interaction model — Enter/Space activates, Escape closes, Arrow keys navigate]
- **Focus**: [focusable? Tab order? Focus trap? Focus visible styling?]

**Boundary Behavior**:
- **Truncation**: [strategy — ellipsis, word boundary, fade, none]
- **Overflow**: [handling — scroll, wrap, clip]
- **Constraints**: [min width, max content length, etc.]

[Repeat for each component]

## Theme Information

[Light/dark mode details, theme switching approach]

## Traceability

| PRD Feature | Components | Tokens |
|-------------|-----------|--------|
| [feature name] | [component list] | [key tokens used] |
| ... | ... | ... |
```

### Parallelization Hints

When `ux.parallelGeneration` is `true` (default):

| User is reviewing... | Skill can pre-generate... | Invalidation risk |
|---------------------|--------------------------|-------------------|
| Color token values | Typography and spacing sections | Low -- colors rarely affect type/spacing |
| Typography screenshot | Spacing section | Low |
| Component plan confirmation | Start generating minimum-set components | Medium -- user may add/remove from plan |
| Component batch review | DESIGN_SYSTEM.md output file | Low -- output is derived from approved tokens + components |

**Implementation**: Subagent dispatch for pre-generation. Main context handles user
interaction. Discard pre-generated work if user feedback invalidates it.

### Checklist Gate

Read `references/design-checklist.md` and run the Tokens Checklist. Present results to user.

### Update Tracking

1. Update DESIGN_PROGRESS.md:
   - Set `Tokens` status to `Complete`
   - Record component list with approval status
   - Add `Last updated` date

Tell the user: "Design system complete. DESIGN_SYSTEM.md generated at
`{docsRoot}/specs/DESIGN_SYSTEM.md`. Run `/cl-designer mockups` to generate screen
mockups, or `/cl-designer build-plan` if you want to skip mockups and go straight to
implementation tasks."
