## Design Review Mode

Reviews design artifacts (DESIGN_SYSTEM.md, UI_SCREENS.md, .pen files) against system docs
and for internal consistency. This is the validation counterpart to the cl-designer skill —
creation and validation are intentionally separate.

### When to Use

- After `/cl-designer tokens` completes — review the design system before mockups
- After `/cl-designer mockups` completes — review screens before the build plan
- After `/cl-designer build-plan` completes — final design review before implementation
- When design artifacts exist and someone wants a fresh validation pass
- When system docs have been updated and designs may need to align

### Prerequisites

At minimum, `{docsRoot}/specs/DESIGN_SYSTEM.md` must exist. If UI_SCREENS.md and
DESIGN_TASKS.md also exist, include them in the review. If none exist: "No design artifacts
found. Run `/cl-designer setup` to start the design process."

### MCP Detection

Before reviewing, check which design MCPs are available (same detection as cl-designer
setup). Available MCPs determine which verification tools you can use:

- **Pencil available**: Can read .pen files, check token values, inspect component structure
- **Not available**: Review is documentation-only — check DESIGN_SYSTEM.md and UI_SCREENS.md
  against PRD and system docs without visual verification

---

### Step 1: Gather Context

1. **Read the PRD** — The source of truth for what features the design should support.
   Extract all UI-facing features and requirements.

2. **Read design artifacts**:
   - `{docsRoot}/specs/DESIGN_SYSTEM.md` — token catalog, component catalog, traceability
   - `{docsRoot}/specs/UI_SCREENS.md` (if exists) — screen inventory, component usage
   - `{docsRoot}/specs/DESIGN_TASKS.md` (if exists) — implementation plan
   - `{docsRoot}/designs/DESIGN_PROGRESS.md` — design decisions and user approvals

3. **Read Architecture doc** (if exists) — tech stack context for design-to-code alignment.

4. **Check previous design reviews** — Read `{docsRoot}/reviews/design/DESIGN_REVIEW_*.md`
   for any prior reviews. If found, track whether previous findings were addressed.

---

### Step 2: Four-Dimension Analysis

#### Dimension 1: Design vs. System Docs

Does the design accurately represent what the system docs describe?

**Token alignment:**
- Do color choices align with any brand or UI requirements stated in the PRD?
- Does the typography support the content types described (data-heavy? prose-heavy? code?)?
- Are spacing values appropriate for the interface density the PRD implies?

**Feature coverage:**
- Are all PRD features with UI implications represented in the component catalog?
- Are all screens described or implied by the PRD present in UI_SCREENS.md?
- Are there design components that don't trace to any PRD feature (orphans)?

**MCP-specific checks:**
- *Pencil*: Call `get_variables` to read actual token values from the .pen file. Compare
  with DESIGN_SYSTEM.md — do documented values match the .pen file?

| PRD Feature | Design Component(s) | Status |
|-------------|---------------------|--------|
| [feature] | [component list] | Covered / Partial / Missing |
| ... | ... | ... |

#### Dimension 2: Design vs. Code

If a codebase exists, does the design align with code conventions?

**Component naming:**
- Do component names in DESIGN_SYSTEM.md follow the codebase naming conventions?
  (e.g., PascalCase for React, kebab-case for web components)
- Do file/folder structures implied by the design match existing patterns?

**Token mapping:**
- Do token names map to CSS custom properties, Tailwind config values, or whatever
  the project uses for styling?
- If the project uses a component library (shadcn/ui, Material UI, etc.), are design
  components aligned with library component names?

**MCP-specific checks:**
- *Pencil*: Read key code files (e.g., tailwind.config, CSS files, component directory)
  and compare naming/structure with DESIGN_SYSTEM.md.

If no codebase exists yet (pure docs phase), skip this dimension and note: "No codebase
to compare against. Design-to-code alignment will be checked after implementation begins."

#### Dimension 3: Visual Quality (Gestalt + Accessibility)

Does the design follow established visual perception principles and accessibility standards?
See `skills/cl-designer/references/visual-quality-rules.md` for the full rule set.

**Gestalt compliance:**
- **Proximity**: Are related elements grouped with tight spacing, separated from unrelated
  elements with wider spacing? Within-group gaps should be ≤ half between-group gaps.
- **Similarity**: Do same-function elements share visual treatment across the design system?
  All buttons of same type styled identically. All cards at same hierarchy share shadow,
  radius, padding.
- **Closure**: Are related content groups contained in bounded parent frames? No scattered
  related elements at flat hierarchy levels.
- **Hierarchy**: One focal point per section. Page title is the largest text per screen.
  Primary CTA visually dominant over secondary actions.

**Accessibility constraints (WCAG 2.2):**
- Color contrast: text on backgrounds meets 4.5:1 (regular) or 3:1 (large ≥ 24px).
  Check especially: disabled states, placeholder text, text on colored backgrounds,
  error/warning banner text.
- Target sizes: interactive elements ≥ 24×24px. Button height ≥ 36px.
- Label association: every input has a visible label (not placeholder-only).
- Heading hierarchy: one H1 per screen, no skipped levels, sizes descend correctly.
- Focus indicators: interactive components have visible focus state variants.

**MCP-specific checks:**
- *Pencil*: Call `get_screenshot` of key screens and spot-check contrast, hierarchy,
  and grouping visually. Use `search_all_unique_properties` to detect hardcoded values
  that break similarity within component families.

| Check | Status |
|-------|--------|
| Gestalt proximity | Compliant / [specific violation] |
| Gestalt similarity | Compliant / [specific violation] |
| Gestalt closure | Compliant / [specific violation] |
| Spatial hierarchy | Compliant / [specific violation] |
| Contrast ratios | Compliant / [specific violation] |
| Target sizes | Compliant / [specific violation] |
| Label association | Compliant / [specific violation] |
| Heading hierarchy | Compliant / [specific violation] |
| Focus indicators | Compliant / [specific violation] |

#### Dimension 4: Internal Consistency

Is the design system consistent with itself?

**Token usage:**
- Are tokens used consistently across components? No hardcoded color/spacing/font values?
- Does every component reference tokens from the documented catalog?

**Spacing discipline:**
- Does spacing follow the defined scale? No arbitrary values outside the scale?

**Naming conventions:**
- Are component names, variant names, and token names consistent in style?
  (e.g., all kebab-case, all camelCase — not mixed)

**Component coherence:**
- Do similar components follow similar patterns? (e.g., all form inputs have the same
  state handling, all cards use the same shadow/radius)
- Are variants defined consistently? (e.g., if Button has sm/md/lg, do Input and Select too?)

**MCP-specific checks:**
- *Pencil*: Call `batch_get` with reusable filter to list all reusable components.
  Call `search_all_unique_properties` on the design system to find any hardcoded values
  that should be tokens.

---

### Step 3: Produce the Design Review

Create the review at:
```
{docsRoot}/reviews/design/DESIGN_REVIEW_[YYYY-MM-DD].md
```

Create the `{docsRoot}/reviews/design/` directory if it doesn't exist.

```markdown
# Design Review

**Date**: [date]
**Artifacts reviewed**:
- specs/DESIGN_SYSTEM.md
- specs/UI_SCREENS.md [if exists]
- specs/DESIGN_TASKS.md [if exists]
- designs/*.pen [if Pencil path]
**System docs referenced**: [list]
**Design MCP used**: [Pencil | None]
**Previous design reviews**: [list or "First review"]

## Summary

One paragraph: overall design quality and alignment with system docs.

## Verdict: [SOUND | ISSUES FOUND | SIGNIFICANT GAPS]

- **SOUND**: Design is consistent, complete, and aligned with system docs.
- **ISSUES FOUND**: Design is mostly complete but has specific problems to address.
- **SIGNIFICANT GAPS**: Major features missing, serious consistency problems, or
  misalignment with system docs.

## Dimension 1: Design vs. System Docs

### Feature Coverage

| PRD Feature | Design Component(s) | Screen(s) | Status |
|-------------|---------------------|-----------|--------|
| [feature] | [components] | [screens] | Covered / Partial / Missing |

### Token Alignment

[Assessment of whether token values serve the PRD's UI needs]

### Issues

[List issues found, or "No issues — design aligns with system docs."]

#### [Issue Title]
- **What**: [description]
- **PRD says**: [requirement]
- **Design shows**: [what's in the design]
- **Suggestion**: [how to fix]

## Dimension 2: Design vs. Code

[If no codebase: "No codebase to compare against."]

### Naming Alignment

| Design Name | Code Convention | Status |
|------------|----------------|--------|
| [component] | [expected pattern] | Aligned / Misaligned |

### Token Mapping

[Assessment of token-to-code mapping]

### Issues

[List issues, or "No issues — design conventions match code conventions."]

## Dimension 3: Visual Quality

### Gestalt Compliance

[Are related elements properly grouped? Do same-function elements share visual treatment?
Is there clear hierarchy per section?]

### Accessibility Compliance

[Do contrast ratios meet WCAG 2.2? Are target sizes sufficient? Are labels present?
Is heading hierarchy logical? Are focus indicators defined?]

### Issues

[List issues, or "No issues — visual quality rules are met."]

## Dimension 4: Internal Consistency

### Token Discipline

[Are tokens used consistently? Any hardcoded values?]

### Component Coherence

[Do similar components follow similar patterns?]

### Naming Consistency

[Are naming conventions consistent across the design system?]

### Issues

[List issues, or "No issues — design system is internally consistent."]

## Previous Review Findings (if applicable)

| Previous Finding | Status |
|-----------------|--------|
| [finding from prior review] | Resolved / Still present / Regressed |

## Strengths

What the design does well — helps the designer know what to preserve.

## Recommendations

1. **Blocking**: Issues that should be fixed before implementation
2. **Suggested**: Improvements that would strengthen the design
3. **Future**: Things to consider as the design evolves
```

### Step 4: Update Tracking

After writing the review:
1. If the review reveals design gaps that trace to missing PRD content, flag it:
   "The design review found gaps that may need PRD updates. Consider a research cycle
   for: [list]."
2. If the review resulted in design-to-PRD misalignment decisions, naming conflict
   resolutions, or component pattern choices constrained by architecture, log Decision
   entries in `docs/DECISIONS.md` with Pipeline Phase `design`

Tell the user where the review file is and summarize the verdict. If issues were found,
be specific about what needs fixing — the user will likely re-run the relevant cl-designer
mode to address them.
