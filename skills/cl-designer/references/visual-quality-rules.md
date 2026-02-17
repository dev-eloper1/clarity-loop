## Visual Quality Rules

Hard constraints for visual generation. These rules apply during `batch_design` operations
in both tokens mode and mockups mode. They are not aspirational guidelines — they are
conditions that must be met before presenting any visual artifact to the user.

Read this file when generating components (tokens mode) or composing screens (mockups mode).

---

### Gestalt Principles as Design Constraints

These rules encode how humans perceive visual grouping. Violating them produces layouts
that feel "off" even when technically correct.

#### Proximity

Related elements must be closer to each other than to unrelated elements. This is the
primary mechanism for visual grouping.

**During generation:**
- Use smaller `gap` values within groups, larger `gap` values between groups. The
  within-group gap should be ≤ half the between-group gap. Example: form fields within
  a section use `gap: 12`, sections use `gap: 32`.
- When placing a label next to its input, the gap between them should be 4–8px. The gap
  between that input group and the next input group should be 16–24px.
- Action buttons related to a form or card should be inside the same container frame,
  not floating adjacent to it.
- Price and "Buy" button, title and subtitle, icon and label — these pairs must share a
  container with tight spacing.

**Verification:** After `snapshot_layout`, check that elements within a logical group
have bounding boxes closer to each other than to elements outside the group.

#### Similarity

Elements with the same function must share at least two visual attributes.

**During generation:**
- All primary action buttons share: fill color + font weight (+ corner radius if applicable)
- All secondary actions share: border style + text color
- All section headings share: font size + font weight
- All body text shares: font size + text color
- All cards at the same hierarchy level share: shadow + corner radius + padding

**Verification:** After generating a set of similar components or repeated elements,
confirm they use the same token values. Use `search_all_unique_properties` on a parent
frame to detect inconsistencies — if buttons within the same section use different fills
or font weights, fix before proceeding.

#### Closure

Group related content inside visually bounded containers.

**During generation:**
- Related form fields go inside a container frame with `padding` and optionally a
  `fill` or `stroke` (background or border).
- Feature cards, pricing tiers, testimonial blocks — each gets its own bounded container.
- Don't scatter related elements across a flat layout. If three metrics belong together,
  they share a parent frame, even if they also sit inside a larger grid.
- Navigation items belong inside a nav container, not placed as siblings of content elements.

**Verification:** Every interactive group (form section, card content, action bar) should
be traceable to a single parent frame. If related elements are siblings of the document
root or a very high-level container, they need an intermediate grouping frame.

#### Simplicity (Prägnanz)

Each section should have one clear focal point.

**During generation:**
- One primary CTA per section. Secondary actions are visually subordinate (outline or
  ghost variant, smaller size).
- Headings are the largest text in their section. Nothing else competes at the same
  font size and weight.
- Use whitespace to separate sections — generous `padding` and `gap` values between
  top-level sections (≥32px). Dense layouts need even more intentional spacing.
- Avoid decorative elements that don't serve comprehension. Every visual element should
  either communicate information or guide attention.

**Verification:** After `get_screenshot`, identify the focal point of each section. If
you can't immediately tell what the primary element is, the hierarchy needs adjustment —
increase size disparity between heading and body, or increase visual weight of the
primary action.

---

### Spatial Hierarchy via Size Disparity

Visual hierarchy is established through deliberate size ratios between elements at
different levels of importance.

**Heading hierarchy:**
- Page title (H1): largest text on the screen. Typically 28–36px for app screens,
  48–72px for landing pages.
- Section heading (H2): noticeably smaller than H1. At least 0.7x the H1 size.
- Subsection heading (H3): noticeably smaller than H2. Same ratio.
- Body text: the baseline. All headings should be measurably larger.
- **Never skip heading levels.** If a section uses H2, its subsections use H3, not H4.

**Interactive element hierarchy:**
- Primary buttons are larger or visually heavier than secondary buttons.
- Primary actions use filled backgrounds; secondary use outlines or ghost styling.
- The size difference should be obvious at a glance, not subtle.

**Verification:** After generating a screen, check font sizes. If H1 and H2 are within
2px of each other, the hierarchy is too flat — increase the disparity.

---

### Accessibility Hard Constraints (WCAG 2.2)

These are not suggestions. Designs that fail these constraints are not presentable.

#### Color Contrast

| Element | Minimum Ratio | WCAG Criterion |
|---------|--------------|----------------|
| Regular text (< 24px, or < 19px bold) | 4.5:1 | 1.4.3 |
| Large text (≥ 24px, or ≥ 19px bold) | 3:1 | 1.4.3 |
| UI components (borders, icons, controls) | 3:1 | 1.4.11 |
| Non-text graphics conveying information | 3:1 | 1.4.11 |

**During generation:**
- When setting `textColor` on a `fill` background, verify the contrast ratio. Common
  failures: light gray text on white, medium-colored text on colored backgrounds,
  placeholder text that's too faint.
- When creating color token swatches in tokens mode, note which foreground colors are
  safe on which backgrounds. Document this in the token catalog.
- For status badges and alerts, ensure the text/icon color meets contrast against the
  badge background, not just the page background.

**Contrast calculation:** For two colors, calculate relative luminance L = 0.2126R +
0.7152G + 0.0722B (where RGB are linearized). Ratio = (L1 + 0.05) / (L2 + 0.05) where
L1 > L2. If you can't calculate precisely, err toward higher contrast — use darker text
on light backgrounds and lighter text on dark backgrounds than your first instinct.

#### Target Size

| Element | Minimum Size | WCAG Criterion |
|---------|-------------|----------------|
| Interactive elements (buttons, links, inputs) | 24×24px | 2.5.8 (AA) |
| Touch targets (mobile) | 44×44px | 2.5.5 (AAA, recommended) |

**During generation:**
- Button minimum height: 36px (with padding, the touch target is ≥ 24px even for
  compact variants).
- Icon buttons: minimum 32×32px frame with padding to reach 24×24px interactive area.
- Checkbox / radio / toggle: minimum 20×20px for the control itself, with padding to
  reach 24×24px touch area.
- Links within text: ensure sufficient line-height (≥ 1.5) so link targets don't overlap
  vertically.

#### Semantic Heading Structure

- Screens must have a logical heading hierarchy: one H1 (page title), H2s for sections,
  H3s for subsections.
- **Don't use font size alone to imply hierarchy.** The design should document which text
  elements are headings (for screen reader mapping).
- In DESIGN_SYSTEM.md component specs, note which text elements serve as headings and
  their expected heading level.

#### Focus Indicators

- Every interactive element must have a visible focus state distinct from hover and active.
- Focus indicators use the design system's focus tokens (outline color, offset, width).
- Focus order follows visual layout: top-to-bottom, left-to-right (for LTR languages).
- Modals and dialogs trap focus — Tab cycles within the modal, not behind it.

**During generation (Pencil):**
- When creating interactive components with `reusable: true`, include a "focused" state
  variant showing the focus indicator. This can be a simple outline around the component.
- Document the focus order expectation in behavioral specs.

#### Label Association

- Every form input must have a visible text label. Placeholder text is NOT a label
  (it disappears on input).
- Labels appear above or to the left of their input, never only inside.
- Groups of related inputs (e.g., address fields) have a group label.

**During generation:**
- When creating Input, Select, TextArea, Checkbox, or Radio components, always include
  a label element in the component structure or document that a label is required.
- When composing forms in mockup screens, verify every input has a visible label.

---

### Visual Verification Protocol

Run this protocol after any `batch_design` call that produces visual content. This
extends the existing overlap detection with quality checks.

#### Step 0: Structural Validation (schema compliance)

**Purpose**: Catch wrong property names before they cause layout issues.

After `batch_design`, use `batch_get` to read back the nodes you just created. Verify:

**For all frames intended to use auto-layout:**
- [ ] `layout` property exists and equals `"vertical"` or `"horizontal"` (NOT `layoutMode`)
- [ ] `gap` property exists (number value, not string)
- [ ] `padding` property exists if specified

**For all showcase frames (token sections, component categories):**
- [ ] `fill` property exists and equals `"#ffffff"` (white background)

**For all text elements:**
- [ ] `fill` property exists (text color, typically `"#1a1a1a"`)
- [ ] `fontWeight` is a string if specified (`"normal"`, `"medium"`, `"semibold"`, `"bold"`)

**For reusable components:**
- [ ] `reusable` property equals `true`

**For component instances:**
- [ ] `type` equals `"ref"`
- [ ] `ref` property contains a valid component ID

**Common failure patterns:**
- Missing `layout` property → frame uses manual positioning, elements will overlap
- `fill` missing on frames → inherits from canvas, can cause dark-on-dark invisible content
- `fill` missing on text → inherits default, can cause invisible text
- `fontWeight: 400` → should be `"normal"` (string, not number)
- `layoutMode` instead of `layout` → property ignored, manual positioning fallback

**How to check:**

```javascript
// After batch_design that created colorFrame
batch_get({
  filePath: "path/to/file.pen",
  nodeIds: ["colorFrame"],
  readDepth: 2
})
```

Review the returned node data. If `layout` is missing but you intended auto-layout, fix
immediately with `U("colorFrame", {layout: "vertical"})`.

**Why this step matters**: Pencil silently ignores unrecognized properties. `layoutMode: "VERTICAL"`
produces no error — the property is just ignored, and the frame falls back to manual positioning.
This causes overlaps that Step 1 (snapshot_layout) will detect, but by then you're debugging
symptoms, not the root cause. Structural validation catches schema violations immediately.

If structural validation fails, fix with `batch_design` updates before proceeding to Step 1.

---

#### Step 1: Layout Integrity

Call `snapshot_layout`. Check for:
- Overlapping bounding boxes between siblings
- Elements escaping their parent container bounds
- Zero-size elements that should have content

Fix any issues before proceeding.

#### Step 2: Gestalt Compliance

Review the layout structure (from `snapshot_layout` or `batch_get`):
- **Proximity**: Are related elements grouped with tight spacing, separated from
  unrelated elements with wider spacing?
- **Similarity**: Do same-function elements share visual attributes?
- **Closure**: Are related element groups contained in bounded parent frames?
- **Hierarchy**: Is there one clear focal point per section?

If violations are found, fix with `batch_design` updates before proceeding.

#### Step 3: Accessibility Spot Check

For the content just generated:
- **Contrast**: Are text colors sufficiently contrasted against their backgrounds?
  Check especially: secondary text, placeholder text, disabled states, text on colored
  backgrounds.
- **Target sizes**: Are interactive elements at least 24×24px?
- **Labels**: Does every input have a visible label?
- **Heading hierarchy**: Are heading sizes correctly ordered (largest → smallest)?

If issues are found, fix before proceeding.

#### Step 4: Visual Confirmation

Call `get_screenshot` of the specific section or screen (not the full canvas).
Before presenting to the user, self-check:
- Can you immediately identify the primary action/heading in each section?
- Does the layout feel balanced, or is one area disproportionately heavy?
- Are there any areas where elements feel "scattered" rather than intentionally placed?

If the screenshot reveals issues that `snapshot_layout` didn't catch (visual weight
imbalance, unclear hierarchy, crowding), fix before presenting.

---

### When to Apply

| Mode | What to Apply |
|------|--------------|
| **Tokens — swatch generation** | Step 0 (structural validation), Step 1 (layout integrity), Contrast checking (note safe foreground/background pairs) |
| **Tokens — component generation** | Step 0 (structural validation), Step 1 (layout integrity), Target sizes, label association, focus indicators, similarity |
| **Mockups — screen composition** | Full verification protocol (Steps 0-4), All Gestalt principles, heading hierarchy |
| **Mockups — behavioral variants** | Step 0 (verify state properties), Contrast on error/warning states, focus indicators on interactive states |
| **Design review** | Full verification (Steps 0-4) as a review dimension |
