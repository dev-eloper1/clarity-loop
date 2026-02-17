# R-010: Designer Skill Systematic Review

**Status**: Analysis Complete
**Date**: 2026-02-16
**Reviewer**: Claude Sonnet 4.5
**Context**: User reported severe visual corruption in generated designs. Investigation revealed fundamental issues present since initial commit.

## Executive Summary

The cl-designer skill has **never worked correctly** with Pencil MCP. Two critical bugs were present from the initial commit (Feb 9, 2026):

1. **Wrong property names**: Used `layoutMode` instead of `layout`, causing all frames to fall back to manual positioning
2. **Missing color specifications**: Never specified `fill` colors for frames or text, causing dark-on-dark invisible content

Both bugs are now fixed, but this review uncovered **deeper systemic issues** in how the skill documents Pencil operations.

---

## What Went Wrong

### Timeline

- **Feb 9, 2026**: Initial commit — tokens-mode.md created with `layoutMode: "VERTICAL"` throughout
- **Feb 15, 2026**: Major merge (Guided Autonomy) — no changes to the layout bug
- **Feb 16, 2026**: User reports severe visual corruption
- **Feb 16, 2026**: Bugs discovered and fixed

The bugs existed for **7 days** across all commits. If the user says "this used to work really well," they were either:
1. Using the markdown fallback path (not Pencil)
2. Remembering a different system
3. Working with manually-corrected designs

### Root Cause Analysis

The skill was written by **describing** what should happen, not by showing **exact code**. Compare:

**What tokens-mode.md said (vague):**
> "Set the frame to `layoutMode: "VERTICAL"` with `gap: 24`"

**What it should have said (concrete):**
```javascript
colorFrame=I(document, {type: "frame", name: "Color Tokens",
                         layout: "vertical", gap: 24, padding: 32,
                         fill: "#ffffff", width: 900, height: 600})
```

The instructions told Claude Code to use wrong property names because **the author didn't verify against the actual Pencil schema**. The instructions were written from memory or intuition, not from working code.

---

## Systemic Issues Found

### Issue 1: Inconsistent Specificity

**tokens-mode.md** tries to be specific but gets details wrong:
- ✅ Specifies exact gap values: `gap: 24`
- ✅ Specifies exact sizes: `width: 900, height: 600`
- ❌ Uses wrong property names: `layoutMode` instead of `layout`
- ❌ Uses wrong case: `"VERTICAL"` instead of `"vertical"`
- ❌ Never specifies `fill` for backgrounds
- ❌ Never specifies `fill` for text colors

**mockups-mode.md** is too vague:
- ❌ "Apply layout using auto-layout properties where possible" (which properties?)
- ❌ No concrete examples of batch_design calls
- ❌ No fill color specifications
- ❌ References Gestalt principles but doesn't show how to encode them in Pencil

### Issue 2: No Schema Validation

The skill references Pencil MCP tools but never validates property names against the actual tool schema. The batch_design tool description shows:

```javascript
mainContent=I("29c0s", {type: "frame", layout: "vertical", gap: 24, padding: 32})
```

But tokens-mode.md never checked this example. It used `layoutMode` throughout, which doesn't appear in ANY Pencil example.

### Issue 3: Verification Protocol Gaps

`visual-quality-rules.md` defines a 4-step verification protocol:
1. ✅ Layout integrity (`snapshot_layout` for overlaps)
2. ✅ Gestalt compliance (manual review)
3. ✅ Accessibility spot checks (contrast, targets, labels)
4. ✅ Visual confirmation (`get_screenshot`)

But this protocol can't catch:
- **Wrong property names** — `snapshot_layout` shows overlaps, not missing auto-layout properties
- **Missing fill colors** — only visible in screenshots, not in layout data
- **Schema violations** — Pencil silently ignores unknown properties

The protocol assumes the `batch_design` calls are structurally correct. It only validates the *results*, not the *operations*.

### Issue 4: No Working Examples End-to-End

Neither tokens-mode.md nor mockups-mode.md shows a **complete, working `batch_design` call** that:
1. Creates a frame with layout, padding, fill, dimensions
2. Adds a title with fontSize, fontWeight, fill
3. Adds content with proper layout and colors

The closest is the example I added in R-009:

```javascript
colorFrame=I(document, {type: "frame", name: "Color Tokens", layout: "vertical",
                         gap: 24, padding: 32, fill: "#ffffff", width: 900, height: 600})
title=I(colorFrame, {type: "text", content: "Color Tokens", fontSize: 24,
                     fontWeight: "normal", fill: "#1a1a1a"})
```

This should have been in the original file.

---

## What's Missing

### 1. Schema-Validated Property Reference

The skill should include a **property quick reference** extracted from the Pencil batch_design tool schema:

**Frame properties:**
- `type`: "frame" | "group" | "rectangle" | "text" | "ref" | ...
- `layout`: "vertical" | "horizontal" | undefined (manual positioning)
- `gap`: number (spacing between children in auto-layout)
- `padding`: number (internal spacing)
- `fill`: hex color string (background color)
- `stroke`: hex color string (border color)
- `width`: number | "fill_container"
- `height`: number | "fill_container"

**Text properties:**
- `content`: string
- `fontSize`: number
- `fontWeight`: "light" | "normal" | "medium" | "semibold" | "bold"
- `fontFamily`: string
- `fill`: hex color (text color)

This reference should be in `references/pencil-schema-quick-ref.md` and loaded during tokens/mockups modes.

### 2. Template Examples Library

Create `references/pencil-templates.md` with copy-paste-ready snippets:

**Token section frame:**
```javascript
sectionFrame=I(document, {
  type: "frame",
  name: "Section Title",
  layout: "vertical",
  gap: 24,
  padding: 32,
  fill: "#ffffff",
  width: 800,
  height: 600,
  x: 100,
  y: 100
})
sectionTitle=I(sectionFrame, {
  type: "text",
  content: "Section Title",
  fontSize: 24,
  fontWeight: "normal",
  fill: "#1a1a1a"
})
```

**Component with variants:**
```javascript
// Primary button (reusable)
btnPrimary=I(componentFrame, {
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
btnLabel=I(btnPrimary, {
  type: "text",
  content: "Button",
  fontSize: 14,
  fontWeight: "medium",
  fill: "#ffffff"
})
```

**Screen mockup with component refs:**
```javascript
// Screen frame
dashboardScreen=I(screenGroup, {
  type: "frame",
  name: "Dashboard",
  layout: "vertical",
  padding: 32,
  gap: 24,
  fill: "#f9fafb",
  width: 1440,
  height: 900
})
// Use design system button component
submitBtn=I(dashboardScreen, {
  type: "ref",
  ref: "btnPrimary"  // references the reusable button created in tokens mode
})
```

### 3. Pre-Generation Checklist

Before any `batch_design` call in tokens or mockups mode, verify:

- [ ] All frames have `layout: "vertical"` or `"horizontal"` (not `layoutMode`)
- [ ] All showcase frames have `fill: "#ffffff"` (white background)
- [ ] All text elements have `fill: "#1a1a1a"` (dark text)
- [ ] All property names match Pencil schema (check batch_design tool docs)
- [ ] No hardcoded theme-dependent colors (token showcase must be theme-independent)

### 4. Post-Generation Validation

After `batch_design`, before presenting to user:

1. ✅ **Structural validation**: Use `batch_get` to read back the created nodes. Verify:
   - `layout` property is set (not `layoutMode`)
   - `fill` property is set for frames and text
   - `gap` and `padding` are present where expected

2. ✅ **Layout validation**: Call `snapshot_layout`. Check:
   - No overlapping bounding boxes
   - Elements within container bounds
   - Non-zero sizes for content elements

3. ✅ **Visual validation**: Call `get_screenshot`. Self-check:
   - Content is visible (not dark-on-dark)
   - Spacing looks deliberate, not cramped or overlapping
   - Hierarchy is clear

---

## Recommendations

### Immediate (Already Done)

- [x] Fix `layoutMode` → `layout` property names
- [x] Fix `"VERTICAL"/"HORIZONTAL"` → `"vertical"/"horizontal"` values
- [x] Add explicit `fill: "#ffffff"` for all showcase frames
- [x] Add explicit `fill: "#1a1a1a"` for all showcase text
- [x] Add working example in tokens-mode.md

### Short-Term (Should Do Next)

1. **Create `references/pencil-schema-quick-ref.md`**
   - Extract property definitions from batch_design tool
   - Include common patterns (frame, text, ref nodes)
   - Load this during tokens/mockups mode setup

2. **Create `references/pencil-templates.md`**
   - Copy-paste-ready examples for common operations
   - Section frames, components, screens, component refs
   - Each template fully working, tested code

3. **Add pre-generation checklist to tokens-mode.md and mockups-mode.md**
   - Run before each batch_design call
   - Verify property names, fill colors, layout properties

4. **Enhance verification protocol in visual-quality-rules.md**
   - Add Step 0: Structural validation (read back nodes, verify properties)
   - Add schema compliance check (all properties exist in Pencil schema)

5. **Add mockups-mode.md examples**
   - Currently too vague ("apply auto-layout properties")
   - Show concrete batch_design calls with layout + fill
   - Show ref node usage with proper syntax

### Long-Term (Process Changes)

1. **Schema-driven documentation**
   - When writing instructions for MCP tools, always validate against tool schema
   - Include working examples extracted from tool documentation
   - Test examples in real sessions before committing

2. **Verification protocol enforcement**
   - Make snapshot_layout + get_screenshot mandatory, not optional
   - Add structural validation (read back nodes) before visual validation
   - Document what each validation step catches (and doesn't catch)

3. **Template-first approach**
   - Provide templates for all common operations
   - Instructions say "use the X template" rather than describing operations
   - Templates are tested, working code

---

## Impact Assessment

### What Broke

- All Pencil-generated design tokens since Feb 9, 2026
- All Pencil-generated component libraries since Feb 9, 2026
- All Pencil-generated mockups since Feb 9, 2026

### What Worked

- Markdown fallback path (doesn't use Pencil properties)
- Visual quality rules (correct but not applied due to broken generation)
- Design discovery and planning (separate from Pencil execution)

### User Experience

If the skill had been used between Feb 9-16:
- Token sections: overlapping swatches, unreadable labels, dark-on-dark text
- Components: broken layouts, invisible content
- Mockups: unusable chaos

The skill would have appeared completely broken for Pencil users. Markdown fallback users would have been fine.

---

## Lessons Learned

1. **Vague instructions fail silently.** "Use auto-layout" doesn't work if you don't specify the property names.

2. **Memory-based documentation is unreliable.** Property names must be verified against actual schemas, not written from intuition.

3. **Verification protocols need structural checks.** Visual validation (screenshots) catches cosmetic issues but not schema violations.

4. **Working examples are mandatory.** Every operation that Claude Code must perform needs a tested, complete example.

5. **Schema changes break things.** If Pencil uses `layout` but instructions say `layoutMode`, the mismatch is invisible until runtime.

---

## Related Documents

- R-009: Pencil Layout Property and Dark Mode Visibility Fix
- skills/cl-designer/references/tokens-mode.md
- skills/cl-designer/references/mockups-mode.md
- skills/cl-designer/references/visual-quality-rules.md
