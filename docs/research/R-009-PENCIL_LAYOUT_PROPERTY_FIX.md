# R-009: Pencil Layout Property Fix

**Status**: Resolved
**Date**: 2026-02-16
**Impact**: Critical — affects all generated design token visualizations
**Type**: Bug Fix

## Problem

The cl-designer skill was generating .pen files with severe visual corruption: overlapping text, overlapping elements, and unusable layouts. User reported: "design for a test project is all over the place with alignment, it even did a sanity check and came back positive but the visual artifacts are all slapped on top of each other."

Investigation revealed the root cause: **incorrect Pencil schema property names** in the tokens-mode reference file.

## Root Cause

The tokens-mode.md and SKILL.md files instructed Claude Code to use:
- `layoutMode: "VERTICAL"`
- `layoutMode: "HORIZONTAL"`

However, the **correct Pencil schema properties** are:
- `layout: "vertical"`
- `layout: "horizontal"`

### Why This Caused Overlaps

When Claude Code generated designs following the incorrect instructions, it set properties that don't exist in the Pencil schema. This caused all frames to fall back to **manual/absolute positioning** instead of **auto-layout**. Without auto-layout:
- Elements were positioned at absolute x,y coordinates
- Text rendered taller than expected (e.g., 36px heading needs ~50px vertical space with line-height)
- No automatic spacing calculations
- Overlaps occurred when actual rendered sizes differed from predicted sizes

The instructions explicitly warned against this: "Manual absolute positioning is the root cause of overlap. Auto-layout (vertical or horizontal stacking with gap values) lets Pencil calculate positions."

But the instructions themselves contained the wrong property names, so the auto-layout was never applied.

## Fix Applied

### Files Modified

1. **skills/cl-designer/SKILL.md** (line 242)
   - Changed: `layoutMode: "VERTICAL"` or `"HORIZONTAL"`
   - To: `layout: "vertical"` or `layout: "horizontal"`

2. **skills/cl-designer/references/tokens-mode.md** (lines 90, 112-113, 128, 144-145)
   - Changed all instances of `layoutMode:` to `layout:`
   - Changed all instances of `"VERTICAL"` to `"vertical"` (in layout context)
   - Changed all instances of `"HORIZONTAL"` to `"horizontal"` (in layout context)

### Verification

Confirmed no other cl-designer reference files contain the incorrect property names. The bug was isolated to:
- SKILL.md (1 instance)
- tokens-mode.md (5 instances)

## Expected Outcome

After this fix, the cl-designer tokens mode will:
1. Generate frames with proper auto-layout: `layout: "vertical"` or `layout: "horizontal"`
2. Pencil will calculate element positions automatically based on content size and gap values
3. No more overlapping text or elements
4. Layouts will be clean, properly spaced, and visually coherent

## Prevention

This bug highlights the importance of:
1. **Schema validation**: MCP tool schemas should be checked against actual implementation
2. **Visual verification protocol**: The tokens-mode already includes `snapshot_layout` checks after each `batch_design` call, but these checks only detect overlaps — they don't catch the root cause (missing layout properties)
3. **Property name precision**: Case sensitivity and exact property names matter in schema-based tools

## Related

- Tokens mode process: `skills/cl-designer/references/tokens-mode.md`
- Visual quality rules: `skills/cl-designer/references/visual-quality-rules.md`
- Overlap prevention guidelines: `skills/cl-designer/SKILL.md` lines 237-257
