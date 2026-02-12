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
| 7 | DESIGN_SYSTEM.md generated | File exists with token + component catalog | 3 |
| 8 | User approved | Explicit user confirmation | 1 |

**Gate semantics**: Items 1–7 are self-assessed by the skill. Item 8 requires explicit user
confirmation. If any of items 1–6 are incomplete, present what's missing and ask the user:
"These gaps remain: [list]. Proceed to mockups anyway, or address them first?"

### Mockups Checklist

Run this checklist after completing mockups mode, before generating the build plan.

| # | Check | How to Verify | Tier |
|---|-------|---------------|------|
| 1 | All major PRD views have mockups | Cross-reference PRD features | 2 |
| 2 | Mockups use design system components | Pencil ref nodes or markdown refs | 3 |
| 3 | Responsive states represented (if applicable) | Conditional check | 3 |
| 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
| 5 | UI_SCREENS.md generated | File exists with screen-to-feature mapping | 3 |
| 6 | User approved | Explicit user confirmation | 1 |

**When P1's checklist items are added**, they receive these tiers:
- Component behavioral states: Tier 2
- Interactive state triggers: Tier 2
- Contrast ratios: Tier 3
- Keyboard interactions: Tier 3
- Focus indicators: Tier 3
- Component boundary behavior: Tier 3
- Behavioral walkthroughs completed: Tier 2
- Empty/loading/error states: Tier 2
- Key interaction flows: Tier 2
- Navigation context: Tier 2
- Non-default state content: Tier 2
- User approved (behavioral): Tier 1

**Gate semantics**: Items 1–5 are self-assessed. Item 3 is conditional — skip if not
applicable. Item 6 requires explicit user confirmation. If gaps exist, present them and
let the user decide whether to proceed.
