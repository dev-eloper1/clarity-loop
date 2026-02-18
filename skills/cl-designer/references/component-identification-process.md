---
mode: component-identification
tier: guided
depends-on:
  - tokens-mode.md
  - visual-quality-rules.md
  - pencil-templates.md
state-files:
  - DESIGN_PROGRESS.md
---

## Component Identification Process

Systematic methodology for identifying reusable components from PRD requirements. Use this
process during tokens mode (Step 3) to build a comprehensive design system instead of a
generic UI toolkit.

**Goal:** Ensure every PRD feature's UI needs are covered by the design system before
generation begins. Prevent "oh, we need X component" discoveries during mockups.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| PRD | `docs/system/` or equivalent | Yes | Requirements doc to extract UI patterns from |
| DESIGN_SYSTEM.md | `{docsRoot}/specs/` | No | Existing component catalog (if resuming) |
| DESIGN_PROGRESS.md | `{docsRoot}/designs/` | Yes | Tracks component identification status |

## Guidelines

1. Always derive components from PRD features, not from a generic component library checklist.
2. Ensure every PRD feature's UI needs are covered before generation begins.
3. Components are built in layers of increasing complexity: atoms -> molecules -> organisms.
4. Avoid nesting beyond 3 levels (atoms, molecules, organisms). If composing organisms from other organisms, flatten the hierarchy.
5. Only create organisms if they're used in 2+ features. Single-use patterns are composed during mockups, not tokens mode.
6. Always define behavioral states during identification, not retrofit them later.
7. Always create the component-to-feature traceability matrix. If you can't map a component to a feature, question why you're generating it.
8. Tokens mode generates atoms and molecules (reusable design system primitives); mockups mode composes organisms from atoms/molecules (feature-specific layouts).

## Process

### Phase 1: Why This Matters

**Without systematic identification:**
- Missing components force ad-hoc creation during mockups (breaks design system consistency)
- Duplicate effort (similar patterns recreated multiple times)
- Poor composition (monolithic components instead of composable atoms)
- Incomplete behavioral specs (states retrofitted instead of planned)
- Generic components that the project doesn't need (wasted generation time)

**With systematic identification:**
- Complete coverage of PRD UI needs
- Reusable patterns identified early
- Proper composition (atoms -> molecules -> organisms)
- Behavioral states planned upfront
- Project-specific design system, not generic UI toolkit

**Checkpoint**: Understanding of why systematic identification matters established.

### Phase 2: Atomic Design Foundation

Components are built in layers of increasing complexity:

#### Atoms -- Indivisible UI Primitives

Single-responsibility elements that can't be broken down further.

**Examples:** Button, Input, Label, Icon, Avatar, Badge, Divider, Link

**Characteristics:**
- No composition (not made of other components)
- Highly reusable (used across many features)
- Simple behavioral states (hover, focus, disabled)
- Direct mapping to HTML elements (button, input, span, img)

#### Molecules -- Simple Compositions

Small groups of atoms functioning together for a focused purpose.

**Examples:** Input with Label, Search Box, Tag/Chip, Stat Display, Link with Icon

**Characteristics:**
- Compose 2-3 atoms
- Focused purpose (one thing well)
- Moderate reusability (used in specific contexts)
- Simple interaction model

#### Organisms -- Complex Compositions

Feature-specific components composed of molecules and/or atoms.

**Examples:** Card, Form Section, Navigation Bar, Data Table Row, Modal, List Item

**Characteristics:**
- Complex composition (multiple molecules/atoms)
- Feature-specific but reusable
- Complex behavioral states (loading, error, empty, interaction flows)
- Map to feature requirements

#### In Clarity Loop:

- **Tokens mode** generates **atoms** and **molecules** (reusable design system primitives)
- **Mockups mode** composes **organisms** from atoms/molecules (feature-specific layouts)

**Checkpoint**: Atomic design layers understood and ready to apply.

### Phase 3: Extract UI Patterns from PRD (Step-by-Step)

#### Step 1: Extract UI Patterns from PRD

Read the PRD feature by feature. For each feature, identify:

**Data Displays** -- What information is shown to the user?
- Lists (flat, nested, infinite scroll)
- Cards (summary, detailed)
- Tables (simple, sortable, paginated)
- Charts (bar, line, pie)
- Stats (single metric, dashboard grid)
- Text (headings, paragraphs, labels)
- Media (images, avatars, icons)

**Input Mechanisms** -- How does the user provide input?
- Forms (single field, multi-field, multi-step)
- Search (simple, with filters)
- Dropdowns (select, multi-select, autocomplete)
- Toggles (checkbox, radio, switch)
- File uploads (single, multiple, drag-drop)
- Rich text editors
- Date/time pickers

**Actions** -- What can the user do?
- Primary actions (create, save, submit)
- Secondary actions (cancel, reset, back)
- Destructive actions (delete, remove, archive)
- Navigation actions (view details, go to page)
- Contextual actions (edit, duplicate, share)
- Bulk actions (select all, delete selected)

**Navigation** -- How does the user move between views?
- Tabs (horizontal, vertical)
- Sidebar (collapsible, fixed)
- Breadcrumbs
- Pagination
- Back/Forward buttons
- Menu (dropdown, hamburger)

**Feedback** -- How does the system communicate state?
- Toasts/Snackbars (success, error, info)
- Modals/Dialogs (confirmation, alert, form)
- Inline errors (form validation)
- Loading indicators (spinner, skeleton, progress bar)
- Empty states (no data, no results)
- Tooltips
- Status badges

**Create a Feature-to-UI-Pattern Matrix:**

| Feature (from PRD) | Data Display | Input | Actions | Navigation | Feedback |
|--------------------|-------------|-------|---------|------------|----------|
| User can create a task | -- | Form: title (text), description (textarea), due date (date picker), priority (dropdown) | Primary: "Create Task" button, Secondary: "Cancel" link | -- | Success toast, Inline validation errors |
| User can view task list | List of task items (checkbox + title + due date + priority badge) | -- | Click task to view details, Checkbox to mark complete | -- | Empty state: "No tasks yet", Loading spinner |
| User can filter tasks | Filtered task list (same as above) | Filter dropdown: status, priority | Primary: "Apply" button, Secondary: "Clear filters" link | -- | Loading indicator while filtering |
| User can edit a task | Pre-filled form (same fields as create) | Same as create | Primary: "Save" button, Secondary: "Cancel" link, Destructive: "Delete task" button | -- | Success toast, Confirmation modal for delete, Validation errors |
| User can search tasks | Search results (same task list format) | Search box: text input + search icon + clear button | Click task to view | -- | Empty state: "No results found", Loading indicator |
| ... | ... | ... | ... | ... | ... |

**Checkpoint**: Feature-to-UI-Pattern matrix complete for all PRD features.

#### Step 2: Identify Atoms

From the matrix, extract indivisible primitives. Group by category:

**Buttons:**
- **Primary Button** -- Main actions (create, save, submit)
- **Secondary Button** -- Alternative actions (cancel, reset)
- **Danger Button** -- Destructive actions (delete, remove)
- **Ghost Button** -- Low-emphasis actions (view details, learn more)
- **Icon Button** -- Icon-only actions (close, menu, more)

**States per button:** idle, hover, focused, loading (spinner), disabled

**Inputs:**
- **Text Input** -- Single-line text (email, password, search)
- **Text Area** -- Multi-line text (description, notes)
- **Select Dropdown** -- Single selection from list
- **Checkbox** -- Binary choice, multiple selections
- **Radio Button** -- Single selection from group
- **Toggle Switch** -- Binary choice with on/off states
- **Date Picker** -- Date selection (if PRD has due dates, schedules)
- **File Upload** -- File selection (if PRD has attachments, uploads)

**States per input:** empty (with placeholder), focused, filled, error (with message), disabled

**Text:**
- **Heading 1** -- Page titles
- **Heading 2** -- Section titles
- **Heading 3** -- Subsection titles
- **Body Text** -- Regular content
- **Small Text** -- Captions, helper text
- **Label** -- Form labels
- **Link** -- Clickable text navigation

**States:** default, hover (for links)

**Indicators:**
- **Badge** -- Status, count, category labels
  - Variants: default, success, warning, error, info
- **Avatar** -- User profile image (if PRD has users, profiles)
  - Variants: with image, with initials, placeholder
- **Icon** -- Visual indicators, decorative elements
- **Loading Spinner** -- Async operation indicator
- **Progress Bar** -- Determinate progress (if PRD has uploads, long operations)

**Validation Check:**
- [ ] Every button type mentioned in the matrix has a corresponding atom
- [ ] Every input type mentioned in the matrix has a corresponding atom
- [ ] Text hierarchy covers all content types in the PRD

**Checkpoint**: All atoms identified and validated against the UI pattern matrix.

#### Step 3: Identify Molecules

Look for atoms that always appear together in the matrix. Molecules compose 2-3 atoms
with a focused purpose.

**Common Molecules:**

**Input with Label:**
- **Composition:** Label + Input + Optional helper text + Optional error message
- **Used when:** Any form field in the matrix
- **Behavioral states:** Inherits from Input (empty, focused, filled, error, disabled)

**Search Box:**
- **Composition:** Search icon + Text input + Clear button (icon button)
- **Used when:** Search features in the matrix
- **Behavioral states:** empty (placeholder), typing, filled (with clear option)

**Tag / Chip:**
- **Composition:** Badge + Close icon
- **Used when:** Removable labels, filters, selected items
- **Behavioral states:** default, hover (for close icon)

**Stat Display:**
- **Composition:** Label (small text) + Value (heading) + Optional trend icon
- **Used when:** Dashboards, analytics, summary metrics
- **Behavioral states:** static (no interaction)

**Link with Icon:**
- **Composition:** Icon + Link text
- **Used when:** Navigation items, action links
- **Behavioral states:** default, hover

**Molecule Identification Heuristic:**

For each action/input/data display in the matrix, ask:
1. Does this pattern combine 2-3 atoms?
2. Does this pattern appear in multiple features?
3. Does this pattern serve a single, focused purpose?

If yes to all three -> It's a molecule candidate.

**Validation Check:**
- [ ] Every form field in the matrix is represented by Input with Label (or custom variant)
- [ ] Search features use Search Box molecule
- [ ] Commonly paired atoms (icon + text, label + value) are defined as molecules

**Checkpoint**: All molecules identified with composition and validation checks passed.

#### Step 4: Identify Organisms

Look for complex, feature-specific components that appear in the matrix. Organisms compose
molecules/atoms and map to specific PRD features.

**Common Organisms:**

**Card:**
- **Composition:** Header (heading + optional icon buttons) + Body (text/content) + Optional footer (action buttons)
- **Used when:** Grouping related content (dashboard widgets, feature summaries, list items)
- **Behavioral states:** default, hover (if clickable), selected (if selectable)
- **Variants:** default (with all sections), compact (header + body only), minimal (body only)

**Form Section:**
- **Composition:** Section heading + Multiple Input-with-Label molecules + Button row (primary + secondary)
- **Used when:** Create/edit features in the matrix
- **Behavioral states:** pristine (untouched), dirty (modified), submitting (loading), error (validation failed)
- **Variants:** By field layout (vertical stack, 2-column, inline)

**List Item (project-specific, e.g., Task List Item):**
- **Composition:** Checkbox + Title (heading) + Due date badge + Priority badge + Actions icon button
- **Used when:** Task list, search results, filtered views (from matrix)
- **Behavioral states:** unchecked, checked, hover, selected, deleting (loading with spinner)
- **Variants:** default, compact (fewer details), expanded (more details)

**Navigation Sidebar:**
- **Composition:** Logo + Navigation items (icon + link) + User profile section (avatar + name)
- **Used when:** All main screens (persistent navigation)
- **Behavioral states:** collapsed (icons only), expanded (icons + labels), active item highlighted
- **Variants:** By width (narrow, wide), by position (left, right)

**Modal / Dialog:**
- **Composition:** Overlay + Modal container (header: heading + close icon button, body: content, footer: action buttons)
- **Used when:** Confirmations, alerts, secondary forms (from feedback column in matrix)
- **Behavioral states:** closed (hidden), opening (animation), open (focus trap), closing (animation)
- **Variants:** By size (small, medium, large, full-screen), by type (alert, confirmation, form)

**Data Table Row:**
- **Composition:** Multiple columns (text, badges, icon buttons) with consistent styling
- **Used when:** Admin views, reports, data-heavy features (if in PRD)
- **Behavioral states:** default, hover, selected, editing (inline edit)
- **Variants:** By number of columns, by content type

**Organism Identification Heuristic:**

For each feature in the matrix, ask:
1. What is the main UI component that represents this feature?
2. Does this component compose multiple molecules/atoms?
3. Is this component reusable across 2+ features?

If yes to all three -> It's an organism.

**Validation Check:**
- [ ] Every feature in the matrix has at least one organism representing its main UI
- [ ] Each organism clearly lists its composition (what molecules/atoms it contains)
- [ ] Organisms are not duplicates (similar organisms are merged into one with variants)

**Checkpoint**: All organisms identified with composition, behavioral states, and validation passed.

#### Step 5: Map Components to Features (Traceability)

Create a component-to-feature matrix to validate completeness.

| Component | Type | Composition | Used In (PRD Features) | Reusability | Complexity |
|-----------|------|------------|----------------------|-------------|------------|
| Button (primary) | Atom | -- | Create Task, Edit Task, Apply Filters, Submit Form | High (4 features) | Low |
| Input with Label | Molecule | Label + Input + Helper + Error | Create Task, Edit Task, User Settings, Login | High (4 features) | Low |
| Task List Item | Organism | Checkbox + Heading + Badge (due date) + Badge (priority) + Icon Button (actions) | Task List, Search Results, Filter Results, Today View | Medium (4 features) | Medium |
| Form Section | Organism | Heading + 3x Input with Label + Button row | Create Task, Edit Task, User Settings | Medium (3 features) | Medium |
| Navigation Sidebar | Organism | Logo + 5x (Icon + Link) + Avatar + Name | All main screens | Low (single instance) | High |
| Modal | Organism | Overlay + Container (Header + Body + Footer) | Delete Confirmation, Edit Task (if modal), Alerts | Medium (3 features) | Medium |
| ... | ... | ... | ... | ... | ... |

**Reusability Levels:**
- **High** -- Used in 4+ features
- **Medium** -- Used in 2-3 features
- **Low** -- Used in 1 feature (single instance)

**Complexity Levels:**
- **Low** -- Simple structure, few states
- **Medium** -- Moderate composition, multiple states
- **High** -- Complex composition, state machine, async behavior

**Validation Checks:**
- [ ] Every PRD feature appears in at least one component's "Used In" column
- [ ] No feature is missing its main UI component
- [ ] Components with High reusability are prioritized for early generation
- [ ] Low-reusability organisms are questioned ("Is this worth making reusable?")

**Checkpoint**: Traceability matrix complete with full PRD coverage validated.

#### Step 6: Prioritize by Dependency Order

Generate components in this order to build the foundation first:

1. **Atoms** -- No dependencies, highest reusability
   - Buttons (all variants)
   - Inputs (all variants)
   - Text elements
   - Indicators (badges, avatars, icons, spinners)

2. **Molecules** -- Depend on atoms, high reusability
   - Input with Label
   - Search Box
   - Tag/Chip
   - Stat Display
   - Link with Icon

3. **High-Reuse Organisms** -- Used in 3+ features
   - Card
   - Form Section
   - List Item (if project-specific)

4. **Medium-Reuse Organisms** -- Used in 2 features
   - Modal/Dialog
   - Data Table Row (if applicable)

5. **Low-Reuse Organisms** -- Used in 1 feature (consider if worth generating)
   - Navigation Sidebar (usually single instance)
   - Dashboard-specific widgets

**Rationale:** Molecules depend on atoms, organisms depend on molecules. Generate dependencies first.

**Checkpoint**: Generation order established following dependency graph.

#### Step 7: Define Behavioral Variants

For each component, identify required states and transitions.

**Button Behavioral States:**

| State | Trigger | Visual Change | Behavior |
|-------|---------|---------------|----------|
| idle | default | Default fill + text color | Clickable, accepts focus, aria-busy="false" |
| hover | Mouse over | Darker fill | Cursor: pointer |
| focused | Tab / click | Focus ring (outline) | Keyboard accessible (Enter/Space activate) |
| loading | Async action start | Spinner replaces or overlays text | Not clickable, aria-busy="true", aria-live="polite" |
| disabled | Condition not met | Reduced opacity, gray fill | Not clickable, not focusable, aria-disabled="true" |

**Input Behavioral States:**

| State | Trigger | Visual Change | Behavior |
|-------|---------|---------------|----------|
| empty | No value | Placeholder visible, default border | Focusable, placeholder text, aria-invalid="false" |
| focused | Click / Tab | Focus ring (outline), border color change | Cursor blinks, accepts text input |
| filled | Has value | No placeholder, value visible | Editable |
| error | Validation failure | Red border, error icon, error message below | aria-invalid="true", error message linked with aria-describedby |
| disabled | Read-only context | Gray background, not editable | Not focusable, aria-disabled="true" |

**Organism-Specific States:**

**Task List Item:**
- unchecked (default)
- checked (checkbox selected, strikethrough title)
- hover (highlight background)
- selected (for bulk actions)
- deleting (loading spinner, disabled interactions)

**Modal:**
- closed (hidden, display: none)
- opening (fade-in animation, backdrop appears)
- open (focus trapped inside, Escape key closes, backdrop click closes)
- closing (fade-out animation)

**Form Section:**
- pristine (untouched, no errors)
- dirty (user modified fields)
- validating (checking input, loading indicators)
- error (validation failed, error messages shown)
- submitting (loading spinner on submit button, form disabled)
- success (redirect or success message)

**Validation Check:**
- [ ] Every interactive component has defined behavioral states
- [ ] States include ARIA attributes for accessibility
- [ ] State transitions are documented (what triggers each state)

**Checkpoint**: All behavioral variants defined with ARIA attributes and transition triggers.

#### Step 8: Present Comprehensive Plan to User

Format the component inventory for user review.

**Template:**

```markdown
## Component Inventory

Based on the PRD, here is the complete design system:

### Atoms (X components)

| Component | Variants | States | Used In (# features) | Reusability |
|-----------|----------|--------|---------------------|-------------|
| Button | primary, secondary, danger, ghost, icon | idle, hover, focus, loading, disabled | 8 features | High |
| Input | text, email, password, textarea | empty, focused, filled, error, disabled | 6 features | High |
| Badge | default, success, warning, error, info | -- | 5 features | High |
| ... | ... | ... | ... | ... |

### Molecules (X components)

| Component | Composition | Used In (# features) | Reusability |
|-----------|------------|---------------------|-------------|
| Input with Label | Label + Input + Helper + Error | 6 features | High |
| Search Box | Icon + Input + Clear Button | 3 features | Medium |
| Tag/Chip | Badge + Close Icon | 2 features | Medium |
| ... | ... | ... | ... |

### Organisms (X components)

| Component | Composition | Used In (Features) | Reusability | Complexity |
|-----------|------------|-------------------|-------------|------------|
| Task List Item | Checkbox + Heading + Badge x 2 + Icon Button | Task List, Search, Filters, Today View | Medium | Medium |
| Card | Header (Heading + Icon Button) + Body + Footer (Buttons) | Dashboard, Feature Lists, Summaries | Medium | Medium |
| Form Section | Heading + Input with Label x N + Button Row | Create Task, Edit Task, Settings | Medium | Medium |
| Modal | Overlay + Container (Header + Body + Footer) | Confirmations, Alerts, Forms | Medium | High |
| Navigation Sidebar | Logo + Nav Items + User Profile | All screens | Low | High |
| ... | ... | ... | ... | ... |

### Behavioral Specifications

**Button (loading state):**
- Visual: Spinner replaces text, maintains button dimensions
- Behavior: Not clickable, aria-busy="true", aria-live="polite"
- Trigger: Async action initiated (form submit, API call)

**Input (error state):**
- Visual: Red border (#ef4444), error icon, error message below
- Behavior: aria-invalid="true", error message linked with aria-describedby
- Trigger: Validation failure (required field empty, invalid format)

**Task List Item (deleting state):**
- Visual: Loading spinner overlays item, opacity reduced
- Behavior: Interactions disabled, aria-busy="true"
- Trigger: Delete action initiated, waiting for API confirmation

**Modal (open state):**
- Visual: Backdrop overlay, modal centered, fade-in animation
- Behavior: Focus trapped inside modal, Escape closes, backdrop click closes, aria-modal="true"
- Trigger: User clicks action that requires confirmation or secondary form

### Generation Order

1. Atoms (buttons, inputs, text, badges) -- ~10 components
2. Molecules (input with label, search box, tags) -- ~5 components
3. High-reuse organisms (card, form section, list item) -- ~3 components
4. Medium-reuse organisms (modal, table row) -- ~2 components

**Total:** ~20 components covering all PRD features.

---

**Review:** Does this design system cover all features from the PRD? Add, remove, or adjust components?
```

**User confirms** -> Proceed to generation
**User requests changes** -> Update inventory, re-present

**Checkpoint**: User confirms comprehensive component plan.

### Phase 4: Worked Example

**Sample PRD Feature:**
> "User can create a new note with a title and content. The note form should validate that the title is not empty. After creating a note, the user sees a success message and the note appears in their note list."

**Step 1: Extract UI Patterns**

| Feature | Data Display | Input | Actions | Navigation | Feedback |
|---------|-------------|-------|---------|------------|----------|
| Create note | -- | Form: title (text input), content (textarea) | Primary: "Create Note" button, Secondary: "Cancel" link | -- | Inline validation (title required), Success toast |
| View note list | List of note items (title + preview + date) | -- | Click note to view | -- | Empty state: "No notes yet" |

**Step 2: Identify Atoms**

From this feature:
- Button (primary) -- "Create Note"
- Button (ghost) -- "Cancel"
- Text Input -- Title field
- Text Area -- Content field
- Badge -- Date indicator (if shown)
- Small Text -- Preview text, helper text
- Heading -- "Create Note" form title, note titles in list

**Step 3: Identify Molecules**

- Input with Label -- Title field needs label + input + error message
- Input with Label (textarea variant) -- Content field needs label + textarea

**Step 4: Identify Organisms**

- Form Section -- "Create Note" form = Heading + 2x Input with Label + Button row
- Note List Item -- Title (heading) + Preview (small text) + Date (badge) -> clickable card

**Step 5: Traceability**

| Component | Type | Used In |
|-----------|------|---------|
| Button (primary) | Atom | Create Note |
| Input with Label | Molecule | Create Note (title), Create Note (content) |
| Form Section | Organism | Create Note |
| Note List Item | Organism | View Note List |

All features covered.

**Step 6: Generation Order**

1. Atoms: Button (primary, ghost), Input, Textarea, Badge, Heading, Small Text
2. Molecules: Input with Label, Input with Label (textarea variant)
3. Organisms: Form Section, Note List Item

**Step 7: Behavioral Variants**

- Button (primary): idle, hover, focus, loading (on submit), disabled (if validation fails)
- Input (title): empty (placeholder), focused, filled, error ("Title is required")
- Form Section: pristine, dirty, validating, error (title empty), submitting

### Phase 5: Tips and Common Mistakes

#### Pattern Recognition Heuristics

**What makes a good reusable component?**

1. **Appears in 2+ features** -- If it's single-use, question if it needs to be a separate component
2. **Focused purpose** -- Does one thing well, not a kitchen-sink mega-component
3. **Stable composition** -- The structure doesn't change wildly across uses (variants are okay, different structures are not)
4. **Clear boundaries** -- You can describe what's inside and what's outside without ambiguity

**Red Flags (bad component candidates):**

- "This component does X, but also Y, and sometimes Z" -> Too broad, split it
- "It's like X but completely different in feature Y" -> Not reusable, make it feature-specific
- "We might need this someday" -> YAGNI (You Aren't Gonna Need It), only generate what the PRD requires

#### Atomic vs Composite Decision

**Ask:** Can this be broken down into smaller pieces that are independently useful?

- **Yes** -> It's composite (molecule or organism). Identify the constituent parts.
- **No** -> It's atomic. Generate as-is.

**Example:** "Search Box"
- Can it be broken down? Yes -> Search icon + Text input + Clear button
- Are those parts independently useful? Yes -> Icon (used elsewhere), Input (used in forms), Button (used everywhere)
- Conclusion: Search Box is a **molecule** (composition of atoms)

#### Composition Depth Limit

**Avoid nesting beyond 3 levels:**
- Level 1: Atoms (button, input)
- Level 2: Molecules (input with label)
- Level 3: Organisms (form section)
- Level 4: Too deep, hard to maintain

If you find yourself composing organisms from other organisms, consider flattening the hierarchy or splitting into separate components.

#### Common Mistakes

**Mistake 1: Generic UI Toolkit Instead of Project-Specific Design System**

Wrong: "We need Button, Input, Select, Checkbox, Radio, Badge, Card, Modal, Toast, Avatar, Dropdown, Tabs, Accordion..."

Right: "Based on the PRD, we need: Button (used in 6 features), Input (used in 4 features), Task List Item (used in 3 features), Form Section (used in 2 features)."

Fix: Always derive from PRD features, not from a generic component library checklist.

**Mistake 2: Skipping Molecules**

Wrong: Atoms: Button, Input, Label -> Organisms: Form Section (contains buttons, inputs, labels)

Right: Atoms: Button, Input, Label -> Molecules: Input with Label (composes Label + Input + Error) -> Organisms: Form Section (composes Heading + 3x Input with Label + Button Row)

Fix: Identify commonly paired atoms and promote them to molecules. This improves reusability.

**Mistake 3: Single-Use Organisms**

Wrong: "Dashboard Header" organism -- used only on Dashboard screen

Right: Don't make it a reusable component. Compose it directly in the Dashboard mockup using atoms/molecules.

Fix: Only create organisms if they're used in 2+ features. Single-use patterns are composed during mockups, not tokens mode.

**Mistake 4: Ignoring Behavioral States**

Wrong: Button component generated with only visual variants (primary, secondary, danger)

Right: Button component includes visual variants AND behavioral states (idle, hover, focus, loading, disabled)

Fix: Always define behavioral states during identification, not retrofit them later.

**Mistake 5: No Traceability**

Wrong: Here are 15 components I generated: Button, Input, Card, Modal, Badge, ...

Right: Here are 15 components mapped to PRD features: Button (used in Create Task, Edit Task, Apply Filters, Delete Task), Task List Item (used in Task List, Search Results, Filtered Views), ...

Fix: Always create the component-to-feature matrix. If you can't map a component to a feature, question why you're generating it.

### Phase 6: Validation Checklist

Before proceeding to generation, verify:

- [ ] Every PRD feature appears in the component-to-feature matrix
- [ ] Every component lists which features it serves (traceability)
- [ ] Atoms have no composition (indivisible)
- [ ] Molecules compose 2-3 atoms with a focused purpose
- [ ] Organisms are feature-specific but reusable
- [ ] No component is used in only 1 feature without justification
- [ ] Generation order follows dependency graph (atoms -> molecules -> organisms)
- [ ] Every interactive component has defined behavioral states
- [ ] Behavioral states include ARIA attributes for accessibility
- [ ] User has reviewed and approved the complete inventory

**Checkpoint**: Full validation checklist passed before proceeding to component generation.

## Output

- **Primary artifact**: Comprehensive component plan (atoms, molecules, organisms) with traceability matrix
- **Additional outputs**: Feature-to-UI-Pattern matrix, generation order, behavioral specifications
- **References**: Atomic Design by Brad Frost (https://atomicdesign.bradfrost.com/), tokens mode (Step 3) where this process is invoked, visual quality rules for accessibility and Gestalt constraints, Pencil templates for ready-made examples
