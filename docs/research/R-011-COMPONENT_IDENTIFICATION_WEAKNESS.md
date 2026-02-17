# R-011: Component Identification Process Weakness

**Status**: Analysis Complete → Solution Pending
**Date**: 2026-02-16
**Reporter**: User
**Context**: "component generation phase does a poor job of identifying all the required reusable components for the project based on the design and requirements"

## Problem Statement

The current component identification process in tokens-mode.md is shallow and inadequate:

**Current approach (lines 224-228):**
```markdown
2. Identify components needed from PRD features:
   - **Minimum set** (adapt per project): Button, Input, TextArea, Select, Checkbox, Card,
     Badge, Nav/Sidebar, Modal/Dialog, Toast/Alert
   - **Project-specific**: derived from PRD (e.g., todo item, kanban card, chat bubble,
     data table row, metric card)

Present the component plan to the user before generating...
```

### What's Wrong

1. **No methodology** — Says "derive from PRD" but doesn't explain HOW
2. **No atomic design thinking** — Doesn't distinguish atoms → molecules → organisms → templates
3. **No pattern analysis** — Doesn't guide cross-feature pattern recognition
4. **No composition analysis** — Doesn't help identify which components are atomic vs composite
5. **No behavioral analysis** — Doesn't consider state complexity when planning components
6. **Too generic** — The "minimum set" is UI-toolkit-flavored, not project-specific
7. **No validation** — Doesn't verify completeness against PRD features before generating

### User Impact

Without a systematic component identification process:
- **Missing components** — Key reusable patterns not recognized, forcing ad-hoc creation during mockups
- **Duplicate effort** — Similar patterns recreated multiple times instead of one reusable component
- **Poor composition** — Composite components built as monoliths instead of composing atoms
- **Incomplete behavioral specs** — States and interactions identified late (during mockups) rather than early (during component design)
- **Wasted generation time** — Generating generic components (Badge, Toast) that the project doesn't need
- **Design system debt** — Missing the opportunity to build a coherent, comprehensive design system

---

## What a Good Process Looks Like

### Atomic Design Methodology (Brad Frost)

Components are built in layers of increasing complexity:

1. **Atoms** — Indivisible UI primitives
   - Examples: Button, Input, Label, Icon, Avatar, Badge
   - Characteristics: Single responsibility, no composition, highly reusable

2. **Molecules** — Small groups of atoms functioning together
   - Examples: Input with Label, Search Box (Input + Icon + Button), Tag (Badge + Close Icon)
   - Characteristics: Simple composition, focused purpose, reusable within context

3. **Organisms** — Complex UI components composed of molecules and/or atoms
   - Examples: Form Section, Card with Header/Body/Footer, Navigation Bar, Data Table Row
   - Characteristics: Complex composition, feature-specific, moderate reusability

4. **Templates** — Page-level layouts composed of organisms
   - Examples: Dashboard Layout, Settings Page, Two-Column Layout
   - Characteristics: Structure without content, defines composition patterns

5. **Pages** — Specific instances of templates with real content
   - Examples: User Dashboard, Profile Settings
   - Characteristics: Final screens with actual data

**In Clarity Loop:**
- Tokens mode generates **atoms** and **molecules**
- Mockups mode composes **organisms** and **templates**
- Implementation creates **pages** (actual screens with data)

### Component Identification Process

A systematic process should:

1. **Analyze PRD feature by feature** — Extract UI patterns from each feature description
2. **Identify atomic elements** — What buttons, inputs, labels, icons are needed?
3. **Spot repeating patterns** — Which UI patterns appear in multiple features?
4. **Compose molecules** — Which atoms always appear together?
5. **Define organisms** — Which complex components are feature-specific but reusable?
6. **Map to features** — Ensure every PRD feature's UI needs are covered
7. **Validate completeness** — Cross-reference component list against PRD to find gaps
8. **Prioritize by reusability** — Generate highly reusable components first

---

## Proposed Solution

### Step-by-Step Component Identification Process

**Step 1: Extract UI Patterns from PRD (feature-by-feature analysis)**

For each feature in the PRD, identify:
- **Data displays** — What information is shown? (lists, cards, tables, stats, charts)
- **Input mechanisms** — How does the user provide input? (forms, search, filters, uploads)
- **Actions** — What can the user do? (buttons, links, menus, drag-drop)
- **Navigation** — How does the user move between views? (tabs, sidebar, breadcrumbs)
- **Feedback** — How does the system communicate state? (toasts, modals, inline errors, loading)

Create a feature-to-UI-pattern matrix:

| Feature | Data Display | Input | Actions | Navigation | Feedback |
|---------|-------------|-------|---------|------------|----------|
| User can create a task | — | Task form (title, desc, due date) | "Create" button | — | Success toast, validation errors |
| User can view task list | Task list (cards or table rows) | — | Click to view details | — | Empty state, loading state |
| User can filter tasks | Filtered task list | Filter dropdown | "Apply filter" button | — | Loading indicator |
| ... | ... | ... | ... | ... | ... |

**Step 2: Identify Atoms (indivisible primitives)**

From the UI pattern matrix, extract atomic elements:

**Buttons:**
- Primary action button (create, save, submit)
- Secondary action button (cancel, reset)
- Danger button (delete, remove)
- Icon button (close, menu, more)
- Ghost/text button (view details, learn more)

**Inputs:**
- Text input (single-line)
- Text area (multi-line)
- Select dropdown
- Checkbox
- Radio button
- Date picker
- File upload

**Text:**
- Heading (H1, H2, H3)
- Body text (regular, small)
- Label
- Caption / helper text

**Indicators:**
- Badge (count, status)
- Avatar
- Icon
- Loading spinner
- Progress bar

**Step 3: Identify Molecules (simple compositions)**

Look for atoms that always appear together:

**Input with Label:**
- Label + Text Input + Optional helper text + Optional error message

**Search Box:**
- Search icon + Text input + Clear button

**Tag / Chip:**
- Badge + Close icon

**Stat Display:**
- Label + Value + Optional trend indicator

**Link with Icon:**
- Icon + Link text

**Step 4: Identify Organisms (complex compositions)**

Look for feature-specific complex components that compose molecules/atoms:

**Task List Item:**
- Checkbox + Task title + Due date badge + Priority indicator + Actions menu
- Used in: Task List, Today View, Search Results

**Form Section:**
- Section heading + Multiple input-with-label groups + Submit/Cancel button row
- Used in: Create Task, Edit Task, User Settings

**Navigation Sidebar:**
- Logo + Navigation items (icon + label) + User profile section
- Used in: All main screens

**Data Table Row:**
- Multiple columns (text, badges, actions) with consistent styling
- Used in: Admin views, Reports

**Card:**
- Header (title + optional actions) + Body content + Optional footer
- Used in: Dashboard, Feature lists

**Modal / Dialog:**
- Overlay + Modal container + Header (title + close) + Body + Footer (action buttons)
- Used in: Confirmations, Forms, Details

**Step 5: Map Components to Features (validation)**

Create a component-to-feature traceability matrix:

| Component | Type | Used In (PRD Features) | Reusability |
|-----------|------|----------------------|-------------|
| Button (primary) | Atom | Create Task, Submit Form, Confirm Delete | High |
| Input with Label | Molecule | Create Task, Edit Task, User Settings, Login | High |
| Task List Item | Organism | Task List, Search Results, Today View | Medium |
| Navigation Sidebar | Organism | All main screens | Low (single instance) |
| ... | ... | ... | ... |

**Validation checks:**
- [ ] Every PRD feature's UI needs are represented by at least one component
- [ ] No component is single-use (if so, is it worth making reusable?)
- [ ] High-reusability components are identified for early generation
- [ ] Composite components clearly list their child components (composition tree)

**Step 6: Prioritize by Dependency + Reusability**

Generate in this order:
1. **Atoms** (no dependencies, highest reusability)
2. **Molecules** (depend on atoms, high reusability)
3. **High-reuse organisms** (used in 3+ features)
4. **Feature-specific organisms** (used in 1-2 features)

**Step 7: Define Behavioral Variants**

For each component, identify required states:

**Button:**
- Visual variants: primary, secondary, danger, ghost
- States: idle, hover, focused, loading, disabled

**Input:**
- States: empty, focused, filled, error (with message), disabled

**Task List Item:**
- States: unchecked, checked, hover, selected, deleting (loading)

**Modal:**
- States: open (with focus trap), closing (animation)

---

## Proposed Implementation

### New Reference File: `component-identification-process.md`

Create a step-by-step guide with:
1. Feature-to-UI-pattern extraction instructions
2. Atomic design layer definitions (atoms → molecules → organisms)
3. Pattern recognition heuristics (what makes a good reusable component?)
4. Composition analysis (how to decompose organisms into molecules/atoms)
5. Validation checklist (ensure completeness before generation)
6. Worked example (full process for a sample PRD)

### Update tokens-mode.md Step 3

Replace the shallow "identify components" step with:

```markdown
#### Step 3: Identify Reusable Components

**IMPORTANT:** Component identification is the foundation of the design system. A shallow
analysis here causes downstream problems (missing components, duplicate effort, poor
composition). Invest time in this step.

1. **Load component identification process:**
   Read `references/component-identification-process.md` for the full methodology.

2. **Extract UI patterns from PRD** (feature-by-feature analysis):
   For each PRD feature, identify data displays, input mechanisms, actions, navigation,
   and feedback patterns. Create a feature-to-UI-pattern matrix.

3. **Identify atoms** (indivisible primitives):
   Buttons, inputs, labels, icons, badges, avatars. These have no composition and highest
   reusability.

4. **Identify molecules** (simple compositions):
   Input-with-label, search box, tag/chip, stat display. These compose 2-3 atoms with a
   focused purpose.

5. **Identify organisms** (complex compositions):
   Task list items, cards, forms, modals, navigation sidebars. These are feature-specific
   but still reusable.

6. **Create component-to-feature traceability matrix:**
   Ensure every PRD feature's UI needs are covered. Validate completeness.

7. **Prioritize by dependency order:**
   Generate atoms → molecules → organisms (build foundation first).

8. **Define behavioral variants per component:**
   For each component, identify required states (idle, hover, focus, loading, error,
   disabled, etc.).

9. **Present comprehensive component plan to user:**
   Show the full inventory with component type, composition, features served, and states.
   Ask: "This is the complete design system based on the PRD. Add, remove, or adjust?"
```

### Example Output Format

When presenting the component plan:

```markdown
## Component Inventory

### Atoms (13 components)

| Component | Variants | States | Reusability |
|-----------|----------|--------|-------------|
| Button | primary, secondary, danger, ghost, icon | idle, hover, focus, loading, disabled | High (used in 8 features) |
| Input | text, email, password, number | empty, focused, filled, error, disabled | High (used in 6 features) |
| Badge | default, success, warning, error, info | — | Medium (used in 4 features) |
| ... | ... | ... | ... |

### Molecules (8 components)

| Component | Composition | Used In | Reusability |
|-----------|------------|---------|-------------|
| Input with Label | Label + Input + Helper Text + Error Message | All forms | High (used in 6 features) |
| Search Box | Search Icon + Input + Clear Button | Task List, Navigation, Search | Medium (used in 3 features) |
| Stat Display | Label + Value + Trend Icon | Dashboard, Analytics | Medium (used in 2 features) |
| ... | ... | ... | ... |

### Organisms (5 components)

| Component | Composition | Used In | Reusability |
|-----------|------------|---------|-------------|
| Task List Item | Checkbox + Title + Badge + Due Date + Actions | Task List, Today View, Search Results | Medium (used in 3 features) |
| Card | Header (Title + Actions) + Body + Footer | Dashboard, Feature Lists | Medium (used in 4 features) |
| Navigation Sidebar | Logo + Nav Items + User Profile | All main screens | Low (single instance) |
| ... | ... | ... | ... |

**Behavioral Specifications:**
- Button (loading state): Shows spinner, disables click, aria-busy="true"
- Input (error state): Red border, shows error message, aria-invalid="true"
- Task List Item (deleting state): Shows loading spinner, disables interactions
- Modal (open state): Focus trap, backdrop click to close, Escape to close

Add, remove, or adjust components before generation?
```

---

## Impact Analysis

### Before (Current Process)

1. Generic "minimum set" listed
2. "Derive from PRD" with no methodology
3. User might add/remove 1-2 components
4. Generate ~10-12 generic components
5. During mockups: "Oh, we need a Task List Item component" → create ad-hoc
6. During mockups: "This form needs error states" → retrofit after generation
7. Design system feels incomplete, inconsistent

### After (Systematic Process)

1. Full feature-by-feature PRD analysis
2. Atomic design methodology applied
3. Comprehensive inventory with traceability
4. User reviews complete plan before generation
5. All required components identified upfront
6. Behavioral states planned before generation
7. Design system feels complete, coherent

### Effort Comparison

**Current:** 5 minutes (list minimum set, ask user)
**Proposed:** 15-20 minutes (full analysis, matrix creation, validation)

**ROI:** The 15-minute investment prevents hours of rework during mockups and implementation.

---

## Next Steps

1. **Create `component-identification-process.md`** with full methodology
2. **Update tokens-mode.md Step 3** to reference the process
3. **Add worked example** (sample PRD → full component inventory)
4. **Add validation checklist** (verify completeness before generation)
5. **Test on real PRD** (notes-app or another project)

---

## Related Issues

- R-009: Layout property bugs (fixed)
- R-010: Systematic designer review (schema validation, templates)
- This issue: Component identification methodology (pending)

---

## User Quote

> "this phase does require better alignment with the design and more research before generation, also it does a poor job of identifying all the required reusable components for the project based on the design and requirements"

**Diagnosis:** Confirmed. The current process is a placeholder, not a systematic methodology. The fix requires adding a structured component identification process based on atomic design principles.
