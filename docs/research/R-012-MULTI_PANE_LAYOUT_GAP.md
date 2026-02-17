# R-012: Multi-Pane Layout Gap

**Status**: Fixed
**Date**: 2026-02-17
**Issue**: Mockups mode generates overlapping panes in multi-column layouts

## Problem

User generated a three-pane screen (sidebar + list + detail) and the panes overlapped:

![Three panes overlapping](screenshot shows sidebar overlapping list, list overlapping detail)

**Root cause:** Mockups-mode.md and pencil-templates.md only had examples for **single-column layouts** (`layout: "vertical"`). No guidance for multi-pane layouts that need `layout: "horizontal"` at the screen level.

## The Missing Pattern

### What Was Missing

**Before** — Only single-column examples:
```javascript
// Screen frame with vertical layout
screen=I(group, {type: "frame", layout: "vertical", gap: 24, padding: 32, ...})
```

This works for:
- Single-column forms
- Vertical content stacks
- Mobile layouts

This **does NOT work** for:
- Three-pane layouts (sidebar + list + detail)
- Two-pane layouts (sidebar + content)
- Dashboard grids

### What Was Needed

Multi-pane layouts require `layout: "horizontal"` at the screen level:

```javascript
// Screen frame with HORIZONTAL layout
screen=I(group, {
  type: "frame",
  layout: "horizontal",  // ← Places children side-by-side
  gap: 0,                // ← No gap between panes (edge-to-edge)
  padding: 0,            // ← No padding at screen level
  width: 1440,
  height: 900
})

// Left pane
sidebar=I(screen, {
  type: "frame",
  layout: "vertical",
  width: 240,              // ← Explicit width
  height: "fill_container", // ← Fills parent height
  fill: "#f9fafb"
})

// Middle pane
listPane=I(screen, {
  type: "frame",
  layout: "vertical",
  width: 400,
  height: "fill_container",
  fill: "#ffffff"
})

// Right pane (fills remaining width)
detailPane=I(screen, {
  type: "frame",
  layout: "vertical",
  width: "fill_container",  // ← Fills remaining width
  height: "fill_container",
  fill: "#ffffff"
})
```

**Key properties:**
- Screen: `layout: "horizontal"` (NOT `"vertical"`)
- Screen: `gap: 0`, `padding: 0` (panes touch edges)
- Panes: Explicit `width` (240, 400, or `"fill_container"`)
- Panes: `height: "fill_container"` (fill parent height)
- Panes: NO `x` or `y` (auto-positioned by horizontal layout)

## Fix Applied

### 1. Updated mockups-mode.md

Added multi-pane layout guidance with working examples:

```markdown
**Multi-pane layouts (CRITICAL - prevents overlaps):**
- Three-pane screen (sidebar + list + detail): Screen frame uses `layout: "horizontal"`,
  `gap: 0`, `padding: 0`. Each pane is a child frame with explicit width + `height: "fill_container"`.
  Example: [working code snippet]
- Two-pane screen (sidebar + content): Same pattern with 2 children instead of 3
```

### 2. Updated pencil-templates.md

Added two new template sections:

**Three-Pane Layout (Sidebar + List + Detail):**
- Full template with sidebar, list pane, detail pane
- Example: Notes app (navigation + note list + note editor)
- Explanation of why horizontal layout is critical

**Two-Pane Layout (Sidebar + Content):**
- Full template with sidebar + main content
- Example: Dashboard with sidebar

**Common Mistakes Section:**
- Shows WRONG approach (vertical layout with absolute positioning)
- Shows CORRECT approach (horizontal layout with auto-positioning)
- Explains key differences

## Quick Fix for User's Broken Mockup

To fix the overlapping three-pane screen:

1. **Find the screen frame ID** (e.g., "mainAppScreen")

2. **Update screen frame to horizontal layout:**
   ```javascript
   U("mainAppScreen", {layout: "horizontal", gap: 0, padding: 0})
   ```

3. **Update each pane to fill height:**
   ```javascript
   U("sidebarPane", {width: 240, height: "fill_container"})
   U("listPane", {width: 400, height: "fill_container"})
   U("detailPane", {width: "fill_container", height: "fill_container"})
   ```

4. **Remove any x,y coordinates from panes** (if present):
   ```javascript
   // Horizontal layout auto-positions children, no manual x,y needed
   ```

5. **Verify with snapshot_layout** — panes should be side-by-side, no overlaps

## Prevention

Going forward, mockups mode will:
1. Load `pencil-templates.md` before generating (includes multi-pane examples)
2. Reference multi-pane guidance when PRD describes multi-column layouts
3. Use pre-generation checklist to verify layout properties before batch_design

## Related

- R-009: Layout property bug (layoutMode → layout)
- R-010: Systematic designer review
- R-011: Component identification process
- This issue: Multi-pane layout examples (fixed)
