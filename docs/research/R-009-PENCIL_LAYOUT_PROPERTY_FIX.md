# R-009: Pencil Layout Property and Dark Mode Visibility Fix

**Status**: Resolved
**Date**: 2026-02-16
**Impact**: Critical — affects all generated design token visualizations
**Type**: Bug Fix

## Problems

The cl-designer skill was generating .pen files with two severe visual defects:

1. **Overlapping elements**: Text and components slapped on top of each other, unusable layouts
2. **Invisible content**: Dark backgrounds with dark text, making token sections completely unreadable

User reports:
- "design for a test project is all over the place with alignment, it even did a sanity check and came back positive but the visual artifacts are all slapped on top of each other"
- "the design token sections starts with a dark frame and nothing that is generated on top of that is visible"

Investigation revealed two root causes in the tokens-mode reference file.

## Root Causes

### Issue 1: Incorrect Layout Property Names

The tokens-mode.md and SKILL.md files instructed Claude Code to use:
- `layoutMode: "VERTICAL"`
- `layoutMode: "HORIZONTAL"`

However, the **correct Pencil schema properties** are:
- `layout: "vertical"`
- `layout: "horizontal"`

**Why this caused overlaps**: When Claude Code generated designs following the incorrect instructions, it set properties that don't exist in the Pencil schema. This caused all frames to fall back to **manual/absolute positioning** instead of **auto-layout**. Without auto-layout:
- Elements were positioned at absolute x,y coordinates
- Text rendered taller than expected (e.g., 36px heading needs ~50px vertical space with line-height)
- No automatic spacing calculations
- Overlaps occurred when actual rendered sizes differed from predicted sizes

The instructions explicitly warned against this: "Manual absolute positioning is the root cause of overlap. Auto-layout (vertical or horizontal stacking with gap values) lets Pencil calculate positions." But the instructions themselves contained the wrong property names, so the auto-layout was never applied.

### Issue 2: Missing Background and Text Color Specifications

The tokens-mode.md file **never specified what background color (fill) or text color** to use for section frames. When creating frames, the instructions said:
- Set layout, gap, padding
- ❌ But never said: `fill: "#ffffff"` or `fill: "#1a1a1a"` for text

**Why this caused invisible content**: When no fill is specified, Pencil defaults to transparent or inherits from the canvas. For projects with dark mode or dark aesthetics:
- Frames got dark backgrounds (inherited or default)
- Text used default dark colors
- Result: dark-on-dark, completely invisible content

Token/component showcase frames are documentation/presentation artifacts, not theme-aware UI — they must always be readable regardless of the project's theme. But the instructions didn't enforce this.

## Fixes Applied

### Fix 1: Layout Property Names

**Files Modified:**

1. **skills/cl-designer/SKILL.md** (line 242)
   - Changed: `layoutMode: "VERTICAL"` or `"HORIZONTAL"`
   - To: `layout: "vertical"` or `layout: "horizontal"`

2. **skills/cl-designer/references/tokens-mode.md** (lines 90, 112-113, 128, 144-145)
   - Changed all instances of `layoutMode:` to `layout:`
   - Changed all instances of `"VERTICAL"` to `"vertical"` (in layout context)
   - Changed all instances of `"HORIZONTAL"` to `"horizontal"` (in layout context)

**Verification**: Confirmed no other cl-designer reference files contain the incorrect property names. The bug was isolated to SKILL.md (1 instance) and tokens-mode.md (5 instances).

### Fix 2: Background and Text Colors

**File Modified:** skills/cl-designer/references/tokens-mode.md

**Changes:**
1. Added mandatory light background specification for all token/component showcase frames:
   - "Always use light backgrounds with dark text for token/component showcase frames. Regardless of the project's theme (light or dark mode), token section frames and component category frames must have `fill: "#ffffff"` (white) with dark text (`fill: "#1a1a1a"` for labels and titles)."

2. Added explicit fill colors to each section specification:
   - Color Tokens section: `fill: "#ffffff"`, `padding: 32`, title text `fill: "#1a1a1a"`
   - Typography section: `fill: "#ffffff"`, `padding: 32`, all text `fill: "#1a1a1a"`
   - Spacing section: `fill: "#ffffff"`, `padding: 32`, labels `fill: "#1a1a1a"`
   - Component category frames: `fill: "#ffffff"` with dark text

3. Added concrete example showing exact batch_design syntax:
   ```javascript
   colorFrame=I(document, {type: "frame", name: "Color Tokens", layout: "vertical",
                            gap: 24, padding: 32, fill: "#ffffff", width: 900, height: 600,
                            x: 100, y: 100})
   title=I(colorFrame, {type: "text", content: "Color Tokens", fontSize: 24,
                        fontWeight: "normal", fill: "#1a1a1a"})
   ```

## Expected Outcome

After these fixes, the cl-designer tokens mode will:
1. ✅ Generate frames with proper auto-layout: `layout: "vertical"` or `layout: "horizontal"`
2. ✅ Pencil will calculate element positions automatically based on content size and gap values
3. ✅ No more overlapping text or elements
4. ✅ All token/component showcase frames will have white backgrounds (`#ffffff`)
5. ✅ All text in showcase frames will be dark (`#1a1a1a`) for contrast
6. ✅ Content will be visible regardless of the project's theme (light or dark mode)
7. ✅ Layouts will be clean, properly spaced, and visually coherent

## Prevention

These bugs highlight the importance of:
1. **Schema validation**: MCP tool schemas should be checked against actual implementation
2. **Visual verification protocol**: The tokens-mode already includes `snapshot_layout` checks after each `batch_design` call, but these checks only detect overlaps — they don't catch root causes (missing layout properties or missing fill colors)
3. **Property name precision**: Case sensitivity and exact property names matter in schema-based tools
4. **Explicit defaults**: Never rely on implicit defaults for critical properties. Always specify:
   - Layout properties (`layout`, `gap`, `padding`)
   - Visual properties (`fill` for backgrounds, `fill` for text colors)
   - Size properties (`width`, `height`)
5. **Theme-independent presentation**: Documentation/showcase artifacts (token frames, component libraries) should be theme-independent — always readable, always visible, regardless of the project's light/dark mode preference

## Related

- Tokens mode process: `skills/cl-designer/references/tokens-mode.md`
- Visual quality rules: `skills/cl-designer/references/visual-quality-rules.md`
- Overlap prevention guidelines: `skills/cl-designer/SKILL.md` lines 237-257
