# Review: Pipeline UX Optimization (P0.5)

**Reviewed**: 2026-02-12
**Proposal**: docs/proposals/PIPELINE_UX_OPTIMIZATION.md
**Research doc**: docs/research/INTERACTION_AUDIT.md
**System docs referenced**: All 4 skill SKILL.md files, 9 reference files (bootstrap-guide.md, tokens-mode.md, mockups-mode.md, design-checklist.md, spec-mode.md, start-mode.md, autopilot-mode.md, run-mode.md, build-plan-mode.md), pipeline-concepts.md

## Summary

This proposal introduces six cross-cutting UX optimization strategies across all four Clarity Loop skills (cl-researcher, cl-designer, cl-implementer, cl-reviewer), targeting 78 audited interaction points to reduce decision fatigue and sequential Q&A. The core mechanism — replacing sequential questions with generate-confirm defaults sheets, converting serial reviews to batch, and introducing a three-tier checkpoint system — is well-conceived and grounded in a thorough interaction audit. The proposal is large (30 changes across 12+ files) but each individual change is small and additive. The research lineage is solid, external consistency is excellent (all 30 change targets verified against actual files), and the strategy interactions are complementary without conflicts. Four blocking issues need resolution before merge, all addressable without fundamental rework.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Tier 1 Count Discrepancy and "Tier" Terminology Conflation

- **Dimension**: Internal Coherence
- **Where**: Summary (line 14), Interaction Audit Summary (lines 118-119), mapping tables (lines 1472-1568)
- **Issue**: The proposal claims 19 Tier 1 checkpoints throughout, but the mapping tables assign Tier 1 to 27 items. Eight items (R9, R15, D4, D8, D21, and others) are assigned Tier 1 not because they're high-stakes pipeline gates but because they're "keep conversational" or "keep as-is." The tier system defines Tier 1 as "Pipeline stops. Waits for explicit user approval" (line 1038), but items like R9 (Phase 5 conversational refinement) and R15 (bootstrap discovery fundamentals) are conversations, not gates. This conflates "don't optimize this" with "this is a high-stakes checkpoint."
- **Why it matters**: The tier system is the backbone of the proposal's checkpoint logic. Inflating Tier 1 from 19 to 27 without acknowledging the change undermines the framework's precision. Skills implementing this will interpret "Tier 1" inconsistently.
- **Suggestion**: Either (a) introduce a "Tier 0: Keep as-is (not a checkpoint)" category for conversational items, or (b) reclassify these 8 items to their actual tiers and update the Tier 1 count. Also rename the project profile system tiers to "Levels" (Level 1: Auto-detect, Level 2: Quick research, Level 3: Presets) to avoid collision with checkpoint tiers.

### 2. Category Tags Don't Support Multi-Category Decisions

- **Dimension**: Technical Soundness
- **Where**: Strategy 6, Change 29, lines 1356-1362
- **Issue**: The decision entry format shows a single `**Category**:` field, but many decisions naturally span multiple categories (e.g., "JWT for API auth" is both `auth` and `api-style`). The cross-skill lookup protocol relies on category matching — if a skill searches for `auth` decisions but a relevant entry is filed under `api-style`, the lookup misses it.
- **Why it matters**: The decision flow is a core cross-cutting mechanism. Incomplete lookups defeat its purpose.
- **Suggestion**: Specify that the Category field supports comma-separated values (e.g., `**Category**: auth, api-style`). Update the lookup protocol to match on any category in the list.

### 3. No Precedence Rule for Auto-Detect vs. Existing DECISIONS.md

- **Dimension**: Completeness
- **Where**: Strategy 6 + Strategy 1 interaction
- **Issue**: During brownfield bootstrap, auto-detect may find values that contradict existing DECISIONS.md entries (e.g., auto-detect finds `vitest.config.ts` but DECISIONS.md has `testing: Jest`). The proposal doesn't specify which source wins or how conflicts surface to the user.
- **Why it matters**: Without a precedence rule, the first real conflict will be handled ad-hoc by whichever skill encounters it, leading to inconsistent behavior.
- **Suggestion**: Specify precedence: explicit DECISIONS.md entries always win over auto-detect (they represent prior human decisions). Auto-detect flags the conflict in the defaults sheet: "Auto-detected: Vitest | Prior decision D-NNN: Jest | **Resolve?**"

### 4. Decision Conflict Resolution Must Be Specified

- **Dimension**: Completeness
- **Where**: Open Item 3, line 1651
- **Issue**: The decision flow protocol is a core mechanism of this proposal, but conflict resolution is deferred as an open item ("later decision overrides" without specifying detection, notification, or supersession marking). This means the first conflict will be handled inconsistently across skills.
- **Why it matters**: Decision flow is used by all four skills. Unspecified conflict handling creates divergent behavior.
- **Suggestion**: Resolve now with: (a) later decision overrides earlier, (b) earlier entry marked `[superseded by D-NNN]`, (c) user notified at point of override: "Overriding D-NNN ([category]: [old value]) with [new value]. Reason: [context]." This is 3-4 sentences added to the decision flow protocol.

## Non-Blocking Suggestions

### 5. Monorepo Auto-Detect Ambiguity

- **Dimension**: Technical Soundness
- **Where**: Strategy 1, Change 2, lines 470-484
- **Issue**: A monorepo with heterogeneous packages (e.g., Next.js frontend + Go backend) would produce conflicting auto-detect signals.
- **Suggestion**: Add a note about scoping detection to the active workspace or presenting per-workspace profiles.

### 6. `[auto-default]` Entries May Bloat DECISIONS.md

- **Dimension**: Technical Soundness
- **Where**: Strategy 6, Tier 3 auto-proceed entries
- **Issue**: A full bootstrap with Tier 3 auto-proceed could add 15+ `[auto-default]` entries. Loading these on every session start wastes context.
- **Suggestion**: Consider a collapsed section in DECISIONS.md (`## Auto-Defaults (collapsed)`) or a separate `DECISIONS_AUTO.md` that isn't loaded on session start by default.

### 7. `autoDefaults` vs. `reviewStyle` Interaction Undefined

- **Dimension**: Technical Soundness
- **Where**: Configuration section, Change 28
- **Issue**: When `autoDefaults: "tier2-3"` and `reviewStyle: "batch"`, Tier 2 items are both "auto-proceed" (per autoDefaults) and "batch review" (per reviewStyle). Which wins?
- **Suggestion**: Clarify precedence: `autoDefaults` controls stop/proceed, `reviewStyle` controls presentation when the skill does stop.

### 8. Change 11 Under-Specified

- **Dimension**: Internal Coherence
- **Where**: Line 980
- **Issue**: Change 11 (Markdown screen review batch) is a single sentence: "Same batch pattern applied to Markdown Fallback Step 2." All other changes provide replacement text.
- **Suggestion**: Add the summary table format, consistent with Change 10's detail level.

### 9. tokens-mode.md Step Numbering Inaccuracy

- **Dimension**: External Consistency
- **Where**: System Context table (line 43), Change 9 target
- **Issue**: The proposal references "Steps 6-7 (token section presentation)" but these are actually sub-items 6-7 within Step 2, not standalone steps.
- **Suggestion**: Update to "Step 2, items 6-7 (token visualization and section-by-section presentation)."

### 10. Projects Mid-Pipeline Not Addressed in Migration

- **Dimension**: Completeness
- **Where**: Migration section, lines 1592-1597
- **Issue**: A project mid-tokens-mode would suddenly switch from serial to batch review upon next invocation.
- **Suggestion**: Note that skills should detect existing DESIGN_PROGRESS.md state and preserve review patterns for already-reviewed items. Only new/unreviewed items use the new patterns.

### 11. Strategy 1 (Project Profile) Is Over-Specified

- **Dimension**: Value Assessment
- **Where**: Lines 217-652 (Changes 1-2, ~400 lines)
- **Issue**: The auto-detect signal reference table (13 categories), five preset definition tables (~75 rows), and mixing model represent implementation-level detail for what are AI skill instructions. The AI interpreting these instructions already knows how to analyze codebases.
- **Suggestion**: Condense preset tables to one example + "generate sensible defaults appropriate to the project type." Move full signal reference to an appendix or separate reference file.

### 12. Auto-Detect Depth Should Be a Design Decision, Not Open Item

- **Dimension**: Completeness
- **Where**: Open Item 8, line 1661
- **Issue**: "Scan manifests first, source files as fallback" is already described in the proposal body but listed as an open item.
- **Suggestion**: Promote to a stated design decision. Defer only the `ux.profileScanDepth` config.

### 13. Dropped Bootstrap Question Not Explicitly Called Out

- **Dimension**: External Consistency
- **Where**: Change 1, bootstrap-guide.md replacement text
- **Issue**: The replacement drops "Are there performance, security, or compliance requirements?" from "Then dig deeper" without explicitly noting the removal. The question moves to the defaults sheet, which is correct, but reviewers checking line-by-line might flag it.
- **Suggestion**: Add a brief note in Change 1's design: "Fifth question moved to defaults sheet rows (security depth, compliance, performance requirements)."

## Consistency Map

| System Doc / File | Status | Notes |
|---|---|---|
| cl-researcher/SKILL.md | Consistent | Changes 3, 4, 6 are additive to existing Guidelines and Phase 2 |
| cl-researcher/references/bootstrap-guide.md | Consistent | Changes 1-2 modify Step 2 and add reference section; no conflicts |
| cl-researcher/references/context-mode.md | Consistent | Change 5 replaces library selection format |
| cl-designer/references/tokens-mode.md | Minor tension | Change 9 references "Steps 6-7" but actual numbering is sub-items of Step 2 |
| cl-designer/references/mockups-mode.md | Consistent | Changes 10-12, 17 replace serial loop with batch |
| cl-designer/references/design-checklist.md | Consistent | Changes 13-15 add Tier column; purely additive |
| cl-implementer/references/spec-mode.md | Consistent | Changes 21, 24 add batch and parallelization; additive |
| cl-implementer/references/start-mode.md | Consistent | Changes 22, 25 add batch and parallelization; additive |
| cl-implementer/references/autopilot-mode.md | Consistent | Change 23 adds tier-awareness; additive |
| pipeline-concepts.md | Consistent | Changes 28-30 add config, category tags, warmth gradient |
| DECISIONS.md protocol | New (additive) | Category tag system is new; compatible with existing format |
| P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md) | Compatible | Merge P0.5 first; P1 adapts to established patterns |
| P2 (TESTING_PIPELINE.md) | Compatible | Merge P0.5 first; P2 adapts to established patterns |
| P3 (SECURITY_ERRORS_AND_API_CONVENTIONS.md) | Compatible | Merge P0.5 first; P3 adapts to established patterns |

## Strengths

1. **Thorough interaction audit**. Every one of the 78 interaction points is traced to a specific file and line number, categorized by type, and evaluated for optimization. This is unusually rigorous grounding for a UX proposal.

2. **Six complementary strategies with no conflicts**. The strategies are designed to work together (profile feeds generate-confirm, tiers inform batch vs. serial, decision flow informs defaults) without overlap or contradiction.

3. **External consistency is excellent**. All 30 change targets were verified against actual files. The proposal's "Current" descriptions accurately reflect the codebase. No proposed changes break existing functionality.

4. **Preserves user control**. Every optimization has an escape hatch (serial opt-in, tier overrides, config options). The proposal compresses the default path without removing the verbose path.

5. **Merge ordering is sound**. P0.5 before P1-P3 establishes patterns that downstream proposals follow, preventing ad-hoc pattern invention.

## Risk Assessment

1. **Implementation complexity**. 30 changes across 12+ files is a large surface area. Risk: some changes may interact unexpectedly during implementation. Mitigation: changes are small and additive; most are "add a paragraph" or "add a column."

2. **Over-optimization for power users at the expense of first-time users**. Batch review assumes the user can evaluate multiple items simultaneously. First-time users of the design pipeline may prefer serial review to build understanding. Mitigation: `reviewStyle: "serial"` config option exists.

3. **Decision flow cold start**. For new projects, DECISIONS.md is empty, so decision flow provides no value. The system converges as decisions accumulate, but the first run through any pipeline is unoptimized. Mitigation: the defaults sheet (Strategy 1) provides value even without prior decisions.
