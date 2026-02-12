## Design Checklists

Gate checklists for tokens and mockups modes. The skill self-assesses each item, then
presents the checklist to the user. The user has final say — they can approve with minor
gaps if they choose.

## Checkpoint Tiering

Not all decisions deserve the same level of attention. The tier system controls when
the pipeline stops for user input:

| Tier | Behavior | Examples |
|------|----------|---------|
| **Tier 1 -- Must Confirm** | Pipeline stops. Waits for explicit user approval. | Design direction, screen inventory, build plan, architecture decisions (auth strategy, testing framework), spec format, merge plan, structure lock, research approval |
| **Tier 2 -- Batch Review** | Generated in batch. User reviews the set and flags issues. | Token palette values, component set, behavioral states per component, screen states, navigation context, error handling per endpoint, task list details, reconciliation summaries, correction manifests |
| **Tier 3 -- Auto-proceed** | Generated with sensible defaults. Logged to DECISIONS.md with `[auto-default]` tag. User can review later but pipeline doesn't stop. | Individual accessibility compliance details, edge case lists per spec, API convention inheritance per endpoint, contract test generation, supply chain checks (flag issues only), checklist self-assessment, spec hash match (auto-proceed), status reports, session orientation, handoff messages, advisory nudges |
| **-- (Warmth-governed)** | Not a checkpoint. Conversational interaction kept warm by design. No tier classification applies -- these are multi-turn discussions, not gating decisions. | Bootstrap discovery fundamentals (R15), research refinement conversation (R9), design visual reference gathering (D4) |

**Configuration**: The `ux.autoDefaults` setting in `.clarity-loop.json` controls the
auto-proceed boundary:
- `"none"` -- everything requires review (most conservative)
- `"tier3"` (default) -- Tier 3 items auto-proceed
- `"tier2-3"` -- Tier 2 and 3 items auto-proceed (most aggressive, for experienced users)

**Audit trail**: Every Tier 3 auto-proceed decision is logged to DECISIONS.md with:
- `[auto-default]` tag
- The default value chosen
- The source (auto-detected, research-generated, preset, derived from project type, spec analysis)
- Timestamp

The user can search DECISIONS.md for `[auto-default]` and override any decision at any
time.

### Tokens Checklist

Run this checklist after completing tokens mode, before moving to mockups.

| # | Check | How to Verify | Tier |
|---|-------|---------------|------|
| 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section | 3 |
| 2 | Typography scale defined | Font families, size scale, weights, line heights | 3 |
| 3 | Spacing scale defined | Base unit + scale documented | 3 |
| 4 | Core components generated | Cross-reference PRD features | 2 |
| 5 | Components use tokens (not hardcoded) | Pencil search or markdown check | 3 |
| 6 | Each component reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
| 7 | Component behavioral states documented | Each interactive component has a state table (idle, loading, error, disabled) with triggers. Non-interactive components (Badge, Divider) may skip this. | 2 |
| 8 | Interactive state triggers defined | For each behavioral state, the trigger condition is documented (e.g., "disabled when required fields empty") | 2 |
| 9 | Contrast ratios verified | Text on backgrounds meets 4.5:1 ratio. UI components and graphical objects meet 3:1 ratio. Use token values to calculate or Pencil's contrast check if available. | 3 |
| 10 | Keyboard interactions documented per component | Each interactive component documents which keys do what (Enter, Space, Escape, Arrow keys, Tab). Refer to WAI-ARIA Authoring Practices for standard patterns. | 3 |
| 11 | Focus indicators defined | Design system includes focus indicator tokens (outline color, outline offset, outline width). Components show visible focus styling distinct from other states. | 3 |
| 12 | Component boundary behavior specified | Each component documents truncation strategy (ellipsis, wrap, fade), overflow handling, and min/max constraints where applicable. | 3 |
| 13 | DESIGN_SYSTEM.md generated | File exists at `{docsRoot}/specs/DESIGN_SYSTEM.md` with token catalog + component catalog + behavioral states | 3 |
| 14 | User approved | Explicit user confirmation that the design system is ready for mockups | 1 |

**Gate semantics**: Items 1–13 are self-assessed by the skill. Item 14 requires explicit user
confirmation (Tier 1 — Must Confirm). Items 7-8 are Tier 2 (Batch Review) — generated in
batch with other component specs, user flags issues. Items 9-12 are Tier 3 (Auto-proceed) —
generated with sensible defaults, logged to DECISIONS.md with `[auto-default]` tag. The
`ux.autoDefaults` config controls which tiers auto-proceed. If behavioral/accessibility gaps
remain, present what's missing and ask: "These behavioral/accessibility gaps remain: [list].
Proceed to mockups anyway, or address them first?" The user can choose to proceed with gaps
if the project doesn't require full behavioral specification (e.g., a prototype).

This replaces the P0.5 placeholder ("When P1's checklist items are added...") with the
actual items and their tier assignments.

### Mockups Checklist

Run this checklist after completing mockups mode, before generating the build plan.

| # | Check | How to Verify | Tier |
|---|-------|---------------|------|
| 1 | All major PRD views have mockups | Cross-reference PRD features | 2 |
| 2 | Mockups use design system components | Pencil ref nodes or markdown refs | 3 |
| 3 | Responsive states represented (if applicable) | Conditional check | 3 |
| 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
| 5 | Behavioral walkthroughs completed for all screens | DESIGN_PROGRESS.md has walkthrough entries per screen. Each screen has screen states, interaction flows, navigation context, and content decisions recorded. | 2 |
| 6 | Empty, loading, and error states addressed per screen | UI_SCREENS.md Screen States table exists for each screen with at minimum: empty (first-use or N/A), loading (or N/A), and error states defined. | 2 |
| 7 | Key interaction flows documented with expected outcomes | UI_SCREENS.md Interaction Flows table exists for each screen with user actions, expected behavior, and error cases. | 2 |
| 8 | Navigation context defined per screen | Each screen in UI_SCREENS.md has: route, auth requirement, back behavior, state persistence, and focus-on-arrival documented. | 2 |
| 9 | Non-default state content defined | Empty state copy, error messages, and confirmation dialog text are actual text (not placeholders like "Error" or "No items"). | 2 |
| 10 | UI_SCREENS.md generated | File exists at `{docsRoot}/specs/UI_SCREENS.md` with screen-to-feature mapping, behavioral contracts, and test scenarios | 3 |
| 11 | User approved | Explicit user confirmation that mockups and behavioral specs are complete | 1 |

**Gate semantics**: Items 1–10 are self-assessed. Item 3 is conditional — skip if not
applicable. Items 5-9 are new behavioral checks at Tier 2 (Batch Review) — generated in
batch, user reviews the set and flags issues. Item 11 is Tier 1 (Must Confirm). The
`ux.autoDefaults` config controls which tiers auto-proceed. If behavioral gaps exist,
present them and let the user decide whether to proceed: "These behavioral gaps remain:
[list]. The build plan will have less behavioral detail for these screens. Proceed anyway?"

This replaces the P0.5 placeholder ("When P1's checklist items are added...") with the
actual items and their tier assignments.
