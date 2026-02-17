## Pencil Templates

Copy-paste-ready `batch_design` templates for common operations. All examples are tested and use correct Pencil schema properties.

**Usage**: Copy the relevant template, replace placeholder values (in CAPS or brackets), adjust dimensions/colors as needed.

---

## Token Section Frame

Creates a top-level showcase frame for token visualizations (colors, typography, spacing).

```javascript
SECTION_NAME_Frame=I(document, {
  type: "frame",
  name: "SECTION_NAME",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: 800,
  height: 600,
  x: 100,
  y: 100
})

SECTION_NAME_Title=I(SECTION_NAME_Frame, {
  type: "text",
  content: "SECTION_NAME",
  fontSize: 24,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a"
})
```

**Example** (Color Tokens section):
```javascript
colorFrame=I(document, {
  type: "frame",
  name: "Color Tokens",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: 900,
  height: 600,
  x: 100,
  y: 100
})

colorTitle=I(colorFrame, {
  type: "text",
  content: "Color Tokens",
  fontSize: 24,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a"
})
```

---

## Color Swatch Row

Creates a horizontal row of color swatches with labels.

```javascript
ROW_NAME_Row=I(colorFrame, {
  type: "frame",
  name: "ROW_NAME Row",
  layout: "horizontal",
  gap: 16,
  width: "fill_container"
})

ROW_NAME_Label=I(ROW_NAME_Row, {
  type: "text",
  content: "ROW_NAME",
  fontSize: 14,
  fontWeight: "medium",
  fill: "#1a1a1a",
  width: 100
})

// First swatch
SWATCH1=I(ROW_NAME_Row, {
  type: "frame",
  layout: "vertical",
  gap: 4,
  width: 80
})

SWATCH1_Color=I(SWATCH1, {
  type: "rectangle",
  fill: "#HEX_COLOR",
  cornerRadius: 4,
  width: 60,
  height: 60
})

SWATCH1_Label=I(SWATCH1, {
  type: "text",
  content: "TOKEN-NAME\n#HEX_COLOR",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})

// Repeat for additional swatches...
```

**Example** (Primary color row with 3 swatches):
```javascript
primaryRow=I(colorFrame, {
  type: "frame",
  name: "Primary Row",
  layout: "horizontal",
  gap: 16,
  width: "fill_container"
})

primaryLabel=I(primaryRow, {
  type: "text",
  content: "Primary",
  fontSize: 14,
  fontWeight: "medium",
  fill: "#1a1a1a",
  width: 100
})

primary50=I(primaryRow, {
  type: "frame",
  layout: "vertical",
  gap: 4,
  width: 80
})

primary50Color=I(primary50, {
  type: "rectangle",
  fill: "#eff6ff",
  cornerRadius: 4,
  width: 60,
  height: 60
})

primary50Label=I(primary50, {
  type: "text",
  content: "primary-50\n#eff6ff",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})

primary500=I(primaryRow, {
  type: "frame",
  layout: "vertical",
  gap: 4,
  width: 80
})

primary500Color=I(primary500, {
  type: "rectangle",
  fill: "#3b82f6",
  cornerRadius: 4,
  width: 60,
  height: 60
})

primary500Label=I(primary500, {
  type: "text",
  content: "primary-500\n#3b82f6",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})

primary900=I(primaryRow, {
  type: "frame",
  layout: "vertical",
  gap: 4,
  width: 80
})

primary900Color=I(primary900, {
  type: "rectangle",
  fill: "#1e3a8a",
  cornerRadius: 4,
  width: 60,
  height: 60
})

primary900Label=I(primary900, {
  type: "text",
  content: "primary-900\n#1e3a8a",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})
```

---

## Typography Sample Row

Shows a text sample at a specific font size.

```javascript
SIZE_NAME_Sample=I(typographyFrame, {
  type: "text",
  content: "SIZE_NAME — The quick brown fox jumps over the lazy dog",
  fontSize: FONT_SIZE_NUMBER,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a",
  width: "fill_container"
})
```

**Example** (Typography scale):
```javascript
xl4Sample=I(typographyFrame, {
  type: "text",
  content: "4xl — The quick brown fox jumps over the lazy dog",
  fontSize: 36,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a",
  width: "fill_container"
})

xl3Sample=I(typographyFrame, {
  type: "text",
  content: "3xl — The quick brown fox jumps over the lazy dog",
  fontSize: 30,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a",
  width: "fill_container"
})

xl2Sample=I(typographyFrame, {
  type: "text",
  content: "2xl — The quick brown fox jumps over the lazy dog",
  fontSize: 24,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a",
  width: "fill_container"
})
```

---

## Spacing Token Grid

Shows spacing value blocks with labels.

```javascript
spacingGrid=I(spacingFrame, {
  type: "frame",
  layout: "horizontal",
  gap: 16,
  width: "fill_container"
})

SPACING_NAME=I(spacingGrid, {
  type: "frame",
  layout: "vertical",
  gap: 8,
  width: 80
})

SPACING_NAME_Block=I(SPACING_NAME, {
  type: "rectangle",
  fill: "#3b82f6",
  cornerRadius: 4,
  width: SPACING_VALUE_PX,
  height: SPACING_VALUE_PX
})

SPACING_NAME_Label=I(SPACING_NAME, {
  type: "text",
  content: "SPACING_NAME\nSPACING_VALUE_PXpx",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})
```

**Example** (Spacing scale):
```javascript
spacingGrid=I(spacingFrame, {
  type: "frame",
  layout: "horizontal",
  gap: 16,
  width: "fill_container"
})

spacing1=I(spacingGrid, {
  type: "frame",
  layout: "vertical",
  gap: 8,
  width: 80
})

spacing1Block=I(spacing1, {
  type: "rectangle",
  fill: "#3b82f6",
  cornerRadius: 4,
  width: 4,
  height: 4
})

spacing1Label=I(spacing1, {
  type: "text",
  content: "space-1\n4px",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})

spacing4=I(spacingGrid, {
  type: "frame",
  layout: "vertical",
  gap: 8,
  width: 80
})

spacing4Block=I(spacing4, {
  type: "rectangle",
  fill: "#3b82f6",
  cornerRadius: 4,
  width: 16,
  height: 16
})

spacing4Label=I(spacing4, {
  type: "text",
  content: "space-4\n16px",
  fontSize: 11,
  fontWeight: "normal",
  fill: "#6b7280",
  textAlign: "center",
  width: "fill_container"
})
```

---

## Component Category Frame

Creates a top-level showcase frame for component categories (buttons, inputs, etc.).

```javascript
CATEGORY_Frame=I(document, {
  type: "frame",
  name: "Components — CATEGORY",
  layout: "vertical",
  gap: 32,
  padding: 32,
  fill: "#ffffff",
  width: 700,
  height: 500,
  x: X_POSITION,
  y: Y_POSITION
})

CATEGORY_Title=I(CATEGORY_Frame, {
  type: "text",
  content: "CATEGORY",
  fontSize: 18,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a"
})
```

**Example** (Form Controls category):
```javascript
formControlsFrame=I(document, {
  type: "frame",
  name: "Components — Form Controls",
  layout: "vertical",
  gap: 32,
  padding: 32,
  fill: "#ffffff",
  width: 700,
  height: 600,
  x: 100,
  y: 2200
})

formControlsTitle=I(formControlsFrame, {
  type: "text",
  content: "Form Controls",
  fontSize: 18,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1a1a1a"
})
```

---

## Button Component (Reusable)

Creates a reusable button component with variants.

```javascript
// Primary button
btnPrimary=I(CATEGORY_Frame, {
  type: "frame",
  name: "Button Primary",
  reusable: true,
  layout: "horizontal",
  padding: 12,
  gap: 8,
  fill: "#3b82f6",
  cornerRadius: 6,
  width: 120,
  height: 40
})

btnPrimaryLabel=I(btnPrimary, {
  type: "text",
  content: "Button",
  fontSize: 14,
  fontWeight: "medium",
  fontFamily: "Inter",
  fill: "#ffffff"
})

// Secondary button
btnSecondary=I(CATEGORY_Frame, {
  type: "frame",
  name: "Button Secondary",
  reusable: true,
  layout: "horizontal",
  padding: 12,
  gap: 8,
  fill: "#ffffff",
  stroke: "#d1d5db",
  strokeWidth: 1,
  cornerRadius: 6,
  width: 120,
  height: 40
})

btnSecondaryLabel=I(btnSecondary, {
  type: "text",
  content: "Button",
  fontSize: 14,
  fontWeight: "medium",
  fontFamily: "Inter",
  fill: "#1f2937"
})

// Disabled button
btnDisabled=I(CATEGORY_Frame, {
  type: "frame",
  name: "Button Disabled",
  reusable: true,
  layout: "horizontal",
  padding: 12,
  gap: 8,
  fill: "#f3f4f6",
  cornerRadius: 6,
  width: 120,
  height: 40
})

btnDisabledLabel=I(btnDisabled, {
  type: "text",
  content: "Button",
  fontSize: 14,
  fontWeight: "medium",
  fontFamily: "Inter",
  fill: "#9ca3af"
})
```

---

## Input Component (Reusable)

Creates a reusable input field component with label.

```javascript
// Input (idle state)
inputIdle=I(CATEGORY_Frame, {
  type: "frame",
  name: "Input Idle",
  reusable: true,
  layout: "vertical",
  gap: 8,
  width: 300
})

inputIdleLabel=I(inputIdle, {
  type: "text",
  content: "Label",
  fontSize: 14,
  fontWeight: "medium",
  fontFamily: "Inter",
  fill: "#374151"
})

inputIdleField=I(inputIdle, {
  type: "frame",
  layout: "horizontal",
  padding: 12,
  fill: "#ffffff",
  stroke: "#d1d5db",
  strokeWidth: 1,
  cornerRadius: 6,
  width: "fill_container",
  height: 40
})

inputIdlePlaceholder=I(inputIdleField, {
  type: "text",
  content: "Placeholder text",
  fontSize: 14,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#9ca3af"
})

// Input (error state)
inputError=I(CATEGORY_Frame, {
  type: "frame",
  name: "Input Error",
  reusable: true,
  layout: "vertical",
  gap: 8,
  width: 300
})

inputErrorLabel=I(inputError, {
  type: "text",
  content: "Label",
  fontSize: 14,
  fontWeight: "medium",
  fontFamily: "Inter",
  fill: "#374151"
})

inputErrorField=I(inputError, {
  type: "frame",
  layout: "horizontal",
  padding: 12,
  fill: "#ffffff",
  stroke: "#ef4444",
  strokeWidth: 1,
  cornerRadius: 6,
  width: "fill_container",
  height: 40
})

inputErrorPlaceholder=I(inputErrorField, {
  type: "text",
  content: "Invalid value",
  fontSize: 14,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#1f2937"
})

inputErrorMessage=I(inputError, {
  type: "text",
  content: "This field is required",
  fontSize: 12,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#ef4444"
})
```

---

## Card Component (Reusable)

Creates a reusable card container.

```javascript
card=I(CATEGORY_Frame, {
  type: "frame",
  name: "Card",
  reusable: true,
  layout: "vertical",
  gap: 16,
  padding: 24,
  fill: "#ffffff",
  stroke: "#e5e7eb",
  strokeWidth: 1,
  cornerRadius: 8,
  width: 320,
  height: 200
})

cardTitle=I(card, {
  type: "text",
  content: "Card Title",
  fontSize: 18,
  fontWeight: "semibold",
  fontFamily: "Inter",
  fill: "#111827"
})

cardBody=I(card, {
  type: "text",
  content: "Card description text goes here. This is placeholder content.",
  fontSize: 14,
  fontWeight: "normal",
  fontFamily: "Inter",
  fill: "#6b7280",
  width: "fill_container"
})
```

---

## Screen Mockup Frame

Creates a screen frame for mockups mode.

```javascript
SCREEN_NAME_Screen=I(screenGroupFrame, {
  type: "frame",
  name: "SCREEN_NAME",
  layout: "vertical",
  padding: 32,
  gap: 24,
  fill: "#f9fafb",
  width: 1440,
  height: 900
})

SCREEN_NAME_Title=I(SCREEN_NAME_Screen, {
  type: "text",
  content: "SCREEN_TITLE",
  fontSize: 32,
  fontWeight: "bold",
  fontFamily: "Inter",
  fill: "#111827"
})
```

**Example** (Dashboard screen):
```javascript
dashboardScreen=I(dashboardGroup, {
  type: "frame",
  name: "Dashboard",
  layout: "vertical",
  padding: 32,
  gap: 24,
  fill: "#f9fafb",
  width: 1440,
  height: 900
})

dashboardTitle=I(dashboardScreen, {
  type: "text",
  content: "Dashboard",
  fontSize: 32,
  fontWeight: "bold",
  fontFamily: "Inter",
  fill: "#111827"
})
```

---

## Multi-Pane Screen Layouts

### Three-Pane Layout (Sidebar + List + Detail)

**CRITICAL:** Screen frame uses `layout: "horizontal"` to place panes side-by-side.
Each pane is a child frame with explicit width and `height: "fill_container"`.

```javascript
// Screen frame with horizontal layout (NO padding/gap at this level)
threePaneScreen=I(screenGroup, {
  type: "frame",
  name: "Three-Pane Screen",
  layout: "horizontal",
  gap: 0,
  padding: 0,
  width: 1440,
  height: 900
})

// Left sidebar (240px wide, fills height)
sidebar=I(threePaneScreen, {
  type: "frame",
  name: "Sidebar",
  layout: "vertical",
  gap: 16,
  padding: 24,
  fill: "#f9fafb",
  width: 240,
  height: "fill_container"
})

sidebarTitle=I(sidebar, {
  type: "text",
  content: "Navigation",
  fontSize: 14,
  fontWeight: "semibold",
  fontFamily: "Inter",
  fill: "#111827"
})

// Middle list pane (400px wide, fills height)
listPane=I(threePaneScreen, {
  type: "frame",
  name: "List",
  layout: "vertical",
  gap: 16,
  padding: 24,
  fill: "#ffffff",
  stroke: "#e5e7eb",
  strokeWidth: 1,
  width: 400,
  height: "fill_container"
})

listTitle=I(listPane, {
  type: "text",
  content: "Items",
  fontSize: 18,
  fontWeight: "semibold",
  fontFamily: "Inter",
  fill: "#111827"
})

// Right detail pane (fills remaining width and height)
detailPane=I(threePaneScreen, {
  type: "frame",
  name: "Detail",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: "fill_container",
  height: "fill_container"
})

detailTitle=I(detailPane, {
  type: "text",
  content: "Detail View",
  fontSize: 24,
  fontWeight: "bold",
  fontFamily: "Inter",
  fill: "#111827"
})
```

**Example** (Notes app with sidebar, note list, note detail):
```javascript
notesScreen=I(appScreens, {
  type: "frame",
  name: "Notes App — Three Panes",
  layout: "horizontal",
  gap: 0,
  padding: 0,
  width: 1440,
  height: 900
})

// Sidebar with navigation
notesSidebar=I(notesScreen, {
  type: "frame",
  layout: "vertical",
  gap: 8,
  padding: 16,
  fill: "#f3f4f6",
  width: 240,
  height: "fill_container"
})

// Note list
notesList=I(notesScreen, {
  type: "frame",
  layout: "vertical",
  gap: 0,
  padding: 0,
  fill: "#ffffff",
  stroke: "#e5e7eb",
  strokeWidth: 1,
  width: 400,
  height: "fill_container"
})

// Note detail/editor
noteDetail=I(notesScreen, {
  type: "frame",
  layout: "vertical",
  gap: 16,
  padding: 32,
  fill: "#ffffff",
  width: "fill_container",
  height: "fill_container"
})
```

---

### Two-Pane Layout (Sidebar + Content)

```javascript
// Screen frame with horizontal layout
twoPaneScreen=I(screenGroup, {
  type: "frame",
  name: "Two-Pane Screen",
  layout: "horizontal",
  gap: 0,
  padding: 0,
  width: 1440,
  height: 900
})

// Left sidebar (280px wide)
sidebar=I(twoPaneScreen, {
  type: "frame",
  layout: "vertical",
  gap: 16,
  padding: 24,
  fill: "#f9fafb",
  width: 280,
  height: "fill_container"
})

// Main content area (fills remaining width)
mainContent=I(twoPaneScreen, {
  type: "frame",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: "fill_container",
  height: "fill_container"
})
```

**Example** (Dashboard with sidebar):
```javascript
dashboardScreen=I(appScreens, {
  type: "frame",
  name: "Dashboard — Two Panes",
  layout: "horizontal",
  gap: 0,
  padding: 0,
  width: 1440,
  height: 900
})

dashboardSidebar=I(dashboardScreen, {
  type: "frame",
  layout: "vertical",
  gap: 12,
  padding: 20,
  fill: "#1f2937",
  width: 280,
  height: "fill_container"
})

dashboardContent=I(dashboardScreen, {
  type: "frame",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#f9fafb",
  width: "fill_container",
  height: "fill_container"
})
```

---

## Why Multi-Pane Layouts Need Special Care

**Common mistake:**
```javascript
// WRONG - Creates overlapping panes
screen=I(group, {type: "frame", layout: "vertical", ...})  // ← Vertical stacks panes on top of each other!
sidebar=I(screen, {type: "frame", width: 240, height: 900, x: 0, y: 0})  // ← Absolute positioning
listPane=I(screen, {type: "frame", width: 400, height: 900, x: 240, y: 0})  // ← Manual coordinates = OVERLAP
```

**Correct:**
```javascript
// RIGHT - Uses horizontal auto-layout
screen=I(group, {type: "frame", layout: "horizontal", gap: 0, padding: 0, ...})  // ← Horizontal places panes side-by-side
sidebar=I(screen, {type: "frame", width: 240, height: "fill_container", ...})  // ← Auto-positioned by parent
listPane=I(screen, {type: "frame", width: 400, height: "fill_container", ...})  // ← No x,y needed
```

**Key differences:**
- Screen frame: `layout: "horizontal"` (not `"vertical"`)
- Screen frame: `gap: 0`, `padding: 0` (panes go edge-to-edge)
- Panes: Explicit `width`, `height: "fill_container"` (fills parent height)
- Panes: NO `x` or `y` properties (auto-positioned by horizontal layout)

---

## Component Instance (ref node)

Instantiates a reusable component in a screen mockup.

```javascript
INSTANCE_NAME=I(screenFrame, {
  type: "ref",
  ref: "COMPONENT_ID",
  width: WIDTH_OR_FILL_CONTAINER
})
```

**Example** (Using button components in a screen):
```javascript
// Primary action button
submitBtn=I(dashboardScreen, {
  type: "ref",
  ref: "btnPrimary",
  width: 140
})

// Secondary action button
cancelBtn=I(dashboardScreen, {
  type: "ref",
  ref: "btnSecondary",
  width: 140
})

// Full-width input field
emailInput=I(formSection, {
  type: "ref",
  ref: "inputIdle",
  width: "fill_container"
})
```

**Updating ref instance descendants:**
```javascript
// Create card instance
userCard=I(dashboardScreen, {
  type: "ref",
  ref: "card",
  width: 320
})

// Update the title inside this specific card
U(userCard+"/cardTitle", {content: "John Doe"})
U(userCard+"/cardBody", {content: "Premium member since 2024"})
```

---

## Form Section with Multiple Inputs

Creates a form section with grouped inputs.

```javascript
formSection=I(screenFrame, {
  type: "frame",
  name: "Form Section",
  layout: "vertical",
  gap: 24,
  padding: 24,
  fill: "#ffffff",
  stroke: "#e5e7eb",
  strokeWidth: 1,
  cornerRadius: 8,
  width: "fill_container"
})

formTitle=I(formSection, {
  type: "text",
  content: "Personal Information",
  fontSize: 18,
  fontWeight: "semibold",
  fontFamily: "Inter",
  fill: "#111827"
})

firstNameInput=I(formSection, {
  type: "ref",
  ref: "inputIdle",
  width: "fill_container"
})

U(firstNameInput+"/inputIdleLabel", {content: "First Name"})
U(firstNameInput+"/inputIdleField/inputIdlePlaceholder", {content: "Enter your first name"})

lastNameInput=I(formSection, {
  type: "ref",
  ref: "inputIdle",
  width: "fill_container"
})

U(lastNameInput+"/inputIdleLabel", {content: "Last Name"})
U(lastNameInput+"/inputIdleField/inputIdlePlaceholder", {content: "Enter your last name"})

submitRow=I(formSection, {
  type: "frame",
  layout: "horizontal",
  gap: 12,
  width: "fill_container"
})

submitButton=I(submitRow, {
  type: "ref",
  ref: "btnPrimary",
  width: 120
})

U(submitButton+"/btnPrimaryLabel", {content: "Save"})

cancelButton=I(submitRow, {
  type: "ref",
  ref: "btnSecondary",
  width: 120
})

U(cancelButton+"/btnSecondaryLabel", {content: "Cancel"})
```

---

## Grid Layout (Cards)

Creates a grid of card components.

```javascript
cardGrid=I(screenFrame, {
  type: "frame",
  layout: "horizontal",
  gap: 24,
  width: "fill_container"
})

card1=I(cardGrid, {
  type: "ref",
  ref: "card",
  width: 320
})

U(card1+"/cardTitle", {content: "Feature 1"})
U(card1+"/cardBody", {content: "Description of feature 1 goes here."})

card2=I(cardGrid, {
  type: "ref",
  ref: "card",
  width: 320
})

U(card2+"/cardTitle", {content: "Feature 2"})
U(card2+"/cardBody", {content: "Description of feature 2 goes here."})

card3=I(cardGrid, {
  type: "ref",
  ref: "card",
  width: 320
})

U(card3+"/cardTitle", {content: "Feature 3"})
U(card3+"/cardBody", {content: "Description of feature 3 goes here."})
```

---

## Usage Notes

1. **Always specify fill colors** for showcase frames (`#ffffff`) and text (`#1a1a1a`)
2. **Use lowercase property values**: `"vertical"` not `"VERTICAL"`, `"normal"` not `"NORMAL"`
3. **Set `reusable: true`** for components that will be instantiated in screens
4. **Use `ref` nodes** in mockups to instantiate design system components
5. **Keep batch_design calls to ~25 operations** — break large sections into multiple calls
6. **Call `snapshot_layout` after each `batch_design`** to verify no overlaps
7. **Replace placeholder values** (CAPS or brackets) with your specific values
8. **Test incrementally** — generate one section, verify, then proceed to next

---

## Loading This File

Load during tokens mode (Step 2) and mockups mode (Step 2) alongside the schema quick reference:

```markdown
1. Call `get_guidelines("design-system")`
2. Read `references/pencil-schema-quick-ref.md`
3. Read `references/pencil-templates.md`
4. Begin batch_design operations using these templates
```
