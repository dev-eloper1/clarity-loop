## Design Checklists

Gate checklists for tokens and mockups modes. The skill self-assesses each item, then
presents the checklist to the user. The user has final say — they can approve with minor
gaps if they choose.

### Tokens Checklist

Run this checklist after completing tokens mode, before moving to mockups.

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section — no raw hex/rgb in components |
| 2 | Typography scale defined | Font families, size scale (xs–4xl), weights, line heights all present |
| 3 | Spacing scale defined | Base unit + scale (1x–16x) documented |
| 4 | Core components generated | Cross-reference PRD features — each UI-facing feature has components |
| 5 | Components use tokens (not hardcoded values) | Pencil: `search_all_unique_properties` to find hardcoded values. Markdown: component specs reference token names |
| 6 | Each component reviewed by user | DESIGN_PROGRESS.md has approval entries for each component |
| 7 | DESIGN_SYSTEM.md generated | File exists at `{docsRoot}/specs/DESIGN_SYSTEM.md` with token catalog + component catalog |
| 8 | User approved | Explicit user confirmation that the design system is ready for mockups |

**Gate semantics**: Items 1–7 are self-assessed by the skill. Item 8 requires explicit user
confirmation. If any of items 1–6 are incomplete, present what's missing and ask the user:
"These gaps remain: [list]. Proceed to mockups anyway, or address them first?"

### Mockups Checklist

Run this checklist after completing mockups mode, before generating the build plan.

| # | Check | How to Verify |
|---|-------|---------------|
| 1 | All major PRD views have mockups | Cross-reference PRD features with UI_SCREENS.md screen inventory |
| 2 | Mockups use design system components | Pencil: components are `ref` nodes. Markdown: screen specs reference component catalog |
| 3 | Responsive states represented (if applicable) | Only if PRD specifies or user requested — check for mobile/tablet/desktop variants |
| 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md has approval entries for each screen |
| 5 | UI_SCREENS.md generated | File exists at `{docsRoot}/specs/UI_SCREENS.md` with screen-to-feature mapping |
| 6 | User approved | Explicit user confirmation that mockups are complete |

**Gate semantics**: Items 1–5 are self-assessed. Item 3 is conditional — skip if not
applicable. Item 6 requires explicit user confirmation. If gaps exist, present them and
let the user decide whether to proceed.
