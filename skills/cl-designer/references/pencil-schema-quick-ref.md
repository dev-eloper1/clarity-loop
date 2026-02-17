## Pencil Schema Quick Reference

Property definitions for Pencil MCP batch_design operations. Use this as a reference when writing `batch_design` calls to ensure correct property names and values.

**Source**: Extracted from `mcp__pencil__batch_design` tool schema. Last validated: 2026-02-16.

---

### Common Node Types

Valid values for the `type` property:
- `"frame"` — Container with layout capabilities (most common)
- `"group"` — Simple grouping without layout
- `"rectangle"` — Filled shape
- `"ellipse"` — Circular/oval shape
- `"text"` — Text element
- `"ref"` — Component instance (references a reusable node)
- `"line"`, `"polygon"`, `"path"`, `"icon_font"`, `"image"`, `"connection"`, `"note"`

---

### Frame Properties

Frames are the primary container type. They support auto-layout and are used for sections, components, and screens.

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `"frame"` | **Required.** Identifies this as a frame node. |
| `name` | string | Any string | Optional. Node name for identification. |
| `layout` | string | `"vertical"` \| `"horizontal"` \| undefined | **Critical.** Layout mode. `"vertical"` stacks children top-to-bottom, `"horizontal"` left-to-right. Omit for manual (absolute) positioning. |
| `gap` | number | Pixels (e.g., `24`) | Spacing between children in auto-layout. Only applies when `layout` is set. |
| `padding` | number | Pixels (e.g., `32`) | Internal spacing around children. |
| `fill` | string | Hex color (e.g., `"#ffffff"`) | Background color. **Always specify for showcase frames** — defaults can cause invisible content. |
| `stroke` | string | Hex color (e.g., `"#e5e7eb"`) | Border color. |
| `strokeWidth` | number | Pixels (e.g., `1`) | Border thickness. |
| `cornerRadius` | number | Pixels (e.g., `8`) | Rounded corners. |
| `width` | number \| string | Pixels (e.g., `800`) \| `"fill_container"` | Frame width. Use `"fill_container"` to fill parent width. |
| `height` | number \| string | Pixels (e.g., `600`) \| `"fill_container"` | Frame height. Use `"fill_container"` to fill parent height. |
| `x` | number | Pixels (e.g., `100`) | Absolute X position on canvas (for top-level frames only). |
| `y` | number | Pixels (e.g., `100`) | Absolute Y position on canvas (for top-level frames only). |
| `reusable` | boolean | `true` \| `false` | **Important for components.** Set to `true` to make this a reusable component that can be instantiated with `ref` nodes. |
| `placeholder` | boolean | `true` \| `false` | Marks frame as a container for child content. Set before adding children. |

**Auto-layout Example:**
```javascript
container=I(parent, {
  type: "frame",
  name: "Container",
  layout: "vertical",  // NOT "layoutMode"
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: 800,
  height: 600
})
```

**Manual positioning Example (avoid for token/component showcase):**
```javascript
// Without layout property, children use absolute x,y positioning
manualFrame=I(parent, {
  type: "frame",
  name: "Manual Frame",
  fill: "#ffffff",
  width: 400,
  height: 300
})
```

---

### Text Properties

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `"text"` | **Required.** Identifies this as a text node. |
| `content` | string | Any string | **Required.** The text content. |
| `fontSize` | number | Pixels (e.g., `24`) | Font size. |
| `fontWeight` | string | `"light"` \| `"normal"` \| `"medium"` \| `"semibold"` \| `"bold"` | Font weight. Values are **lowercase strings**, not numbers. |
| `fontFamily` | string | Font name (e.g., `"Inter"`) | Font family. |
| `fill` | string | Hex color (e.g., `"#1a1a1a"`) | **Text color** (not background). **Always specify for showcase text** — defaults can cause invisible dark-on-dark text. |
| `textAlign` | string | `"left"` \| `"center"` \| `"right"` | Horizontal alignment. |
| `width` | number \| string | Pixels \| `"fill_container"` | Text box width. Use `"fill_container"` to match parent. |

**Text Example:**
```javascript
heading=I(container, {
  type: "text",
  content: "Section Title",
  fontSize: 24,
  fontWeight: "normal",  // NOT "400" or "normal" with quotes
  fontFamily: "Inter",
  fill: "#1a1a1a"  // Dark text for visibility
})
```

---

### Ref (Component Instance) Properties

Use `ref` nodes to instantiate reusable components created during tokens mode.

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `"ref"` | **Required.** Identifies this as a component instance. |
| `ref` | string | Node ID (e.g., `"btnPrimary"`) | **Required.** ID of the reusable component to instantiate. |
| `width` | number \| string | Pixels \| `"fill_container"` | Override component width. |
| `height` | number \| string | Pixels \| `"fill_container"` | Override component height. |
| `x` | number | Pixels | Override X position (manual positioning only). |
| `y` | number | Pixels | Override Y position (manual positioning only). |

**Ref Example:**
```javascript
// Reference a button component created in tokens mode
submitButton=I(formContainer, {
  type: "ref",
  ref: "btnPrimary",  // ID of the reusable button component
  width: "fill_container"
})
```

**Updating ref descendants:**
```javascript
// Create ref instance
card=I(container, {type: "ref", ref: "CardComponent"})

// Update a descendant inside the instance (e.g., change title text)
U(card+"/titleText", {content: "New Title"})
```

---

### Rectangle Properties

Simple filled shape. Often used for color swatches or decorative elements.

| Property | Type | Values | Description |
|----------|------|--------|-------------|
| `type` | string | `"rectangle"` | **Required.** |
| `fill` | string | Hex color (e.g., `"#3b82f6"`) | Fill color. |
| `stroke` | string | Hex color | Border color. |
| `strokeWidth` | number | Pixels | Border thickness. |
| `cornerRadius` | number | Pixels | Rounded corners. |
| `width` | number | Pixels | Rectangle width. |
| `height` | number | Pixels | Rectangle height. |

**Rectangle Example (color swatch):**
```javascript
swatch=I(colorRow, {
  type: "rectangle",
  fill: "#3b82f6",  // Primary blue
  cornerRadius: 4,
  width: 60,
  height: 60
})
```

---

### Operation Syntax

#### Insert (I)

Creates a new node. Returns the node ID.

```javascript
nodeId=I(parentId, {property: value, ...})
```

**Important:**
- Parent is **required** for Insert
- Every Insert **must have a binding** (the `nodeId=` part)
- Never include `id` in the property object — IDs are auto-generated
- Use `document` as parent for top-level frames

#### Update (U)

Modifies existing node properties. Does NOT return a value.

```javascript
U(nodeIdOrPath, {property: value, ...})
```

**Important:**
- Can't change `type`, `ref`, or `id`
- Can't update `children` — use Replace (R) instead
- Use slash-separated paths for nested nodes: `"instanceId/childId"`

#### Replace (R)

Replaces a node with a new one. Returns the new node ID.

```javascript
newId=R(nodeIdOrPath, {property: value, ...})
```

#### Copy (C)

Copies an existing node. Returns the copied node ID.

```javascript
copyId=C(sourceNodeId, parentId, {overrides, positionPadding: 100, positionDirection: "right"})
```

#### Delete (D)

Deletes a node. Does NOT return a value.

```javascript
D(nodeId)
```

#### Move (M)

Moves a node to a different parent. Does NOT return a value.

```javascript
M(nodeId, newParentId, index)
```

#### Generate/Get Image (G)

Applies an image fill to a frame or rectangle.

```javascript
G(nodeId, "ai" | "stock", "prompt or keywords")
```

**Important:**
- There is NO `"image"` node type
- Images are applied as **fills** to frame/rectangle nodes
- First create the frame/rectangle, then use G to apply the image

---

### Common Mistakes

| ❌ Wrong | ✅ Correct | Issue |
|---------|-----------|-------|
| `layoutMode: "VERTICAL"` | `layout: "vertical"` | Wrong property name and case |
| `fontWeight: 400` | `fontWeight: "normal"` | Font weight is a string, not a number |
| `textColor: "#000"` | `fill: "#000"` | Text color uses `fill`, not `textColor` |
| `backgroundColor: "#fff"` | `fill: "#fff"` | Background uses `fill`, not `backgroundColor` |
| `I(parent, {id: "myId", ...})` | `myId=I(parent, {...})` | Don't set `id` — IDs are auto-generated. Use binding. |
| `padding: {top: 8, left: 16}` | `padding: 16` | Padding is a single number, not an object |
| `gap: "24px"` | `gap: 24` | Gap is a number, not a string |

---

### Default Colors to Always Specify

**Never rely on defaults for showcase frames.** Always set:

```javascript
// Token/component showcase frame
showcaseFrame=I(document, {
  type: "frame",
  name: "Showcase Section",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",      // ← Always white for visibility
  width: 800,
  height: 600
})

// Title text
title=I(showcaseFrame, {
  type: "text",
  content: "Title",
  fontSize: 24,
  fontWeight: "normal",
  fill: "#1a1a1a"       // ← Always dark for contrast
})

// Body text
body=I(showcaseFrame, {
  type: "text",
  content: "Description",
  fontSize: 14,
  fontWeight: "normal",
  fill: "#1a1a1a"       // ← Always dark for contrast
})
```

**Why:** Token and component showcase frames are documentation artifacts, not theme-aware UI. They must be readable regardless of the project's light/dark mode preference.

---

### Binding and Path Rules

**Bindings** are variable names assigned to node IDs:

```javascript
container=I(document, {...})   // "container" is the binding
row=I(container, {...})        // Use "container" as parent
```

**Paths** navigate into component instances:

```javascript
card=I(parent, {type: "ref", ref: "CardComponent"})

// Update the title inside the card instance
U(card+"/titleText", {content: "New Title"})

// The "+" concatenates the binding with the path
```

**Rules:**
- Every Insert, Copy, and Replace **must have a binding** (even if unused)
- Bindings only work **within the same batch_design call**
- Paths use slash separators: `"instanceId/childId/grandchildId"`
- Use bindings for parents: `I(container, ...)` not `I("container", ...)`

---

### When to Use Each Node Type

| Use Case | Node Type | Reason |
|----------|-----------|--------|
| Token section container | `frame` | Needs layout (vertical stacking) |
| Component container | `frame` | Needs layout + reusable flag |
| Screen mockup | `frame` | Needs layout for positioning components |
| Section title | `text` | Displays text content |
| Color swatch | `rectangle` | Simple filled shape |
| Button component | `frame` with `reusable: true` | Reusable component with layout |
| Button instance in screen | `ref` | References the reusable button |
| Image placeholder | `frame` + `G()` | Frame with image fill applied |

---

## Validation Checklist

Before calling `batch_design`, verify:

- [ ] All auto-layout frames use `layout: "vertical"` or `"horizontal"` (NOT `layoutMode`)
- [ ] All showcase frames have `fill: "#ffffff"`
- [ ] All showcase text has `fill: "#1a1a1a"`
- [ ] Font weights are strings: `"normal"` not `400`
- [ ] Layout values are lowercase: `"vertical"` not `"VERTICAL"`
- [ ] Gap and padding are numbers, not strings: `24` not `"24px"`
- [ ] No `id` properties in node data (IDs are auto-generated)
- [ ] Every Insert/Copy/Replace has a binding: `foo=I(...)`
- [ ] Reusable components have `reusable: true`
- [ ] Component instances use `type: "ref"` with `ref: "componentId"`

---

## Loading This Reference

Load during tokens mode (Step 2) and mockups mode (Step 2) before any `batch_design` calls:

```markdown
1. Call `get_guidelines("design-system")` for component composition best practices
2. Read `references/pencil-schema-quick-ref.md` for property syntax
3. Read `references/pencil-templates.md` for copy-paste examples
4. Begin batch_design operations
```
