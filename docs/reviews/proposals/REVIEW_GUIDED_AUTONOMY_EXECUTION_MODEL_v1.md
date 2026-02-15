# Review: Guided Autonomy Execution Model (Revised)

**Reviewed**: 2026-02-12
**Proposal**: docs/proposals/GUIDED_AUTONOMY_EXECUTION_MODEL.md
**System docs referenced**: cl-researcher/SKILL.md, cl-implementer/SKILL.md, cl-reviewer/SKILL.md, cl-designer/SKILL.md, templates/status.md, templates/research-ledger.md, cl-researcher/references/bootstrap-guide.md, cl-implementer/references/start-mode.md
**Research doc**: docs/research/PIPELINE_EXECUTION_MODEL.md (with companion docs/research/PIPELINE_UX_PATTERNS.md)

## Summary

This proposal adds an execution model to the Clarity Loop pipeline through three pillars: file rationalization (eliminate STATUS.md, introduce PARKING.md, merge IMPLEMENTATION_PROGRESS into TASKS.md), intent-driven UX (Ship/Quality/Rigor/Explore calibration at bootstrap with 4 guidance moments), and cross-cutting protocols (parking, loop calibration, convergence tracking). It solves real, documented problems — STATUS.md has 14 write gaps, there's no post-bootstrap guidance, and two files track implementation state redundantly. The three-phase approach is well-structured. Five blocking issues need resolution, all of them completeness gaps rather than design flaws.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. PARKING.md status flow has no column in the table schema

- **Dimension**: Internal Coherence
- **Where**: Phase 1, Change 1 — PARKING.md template (lines 122-142)
- **Issue**: The template defines a status flow (`captured → picked-up → resolved / scoped / deferred / discarded`) but the Active section table has no Status column. Columns are: `#, Concept, Classification, Origin, Date, Impact, Notes`. The Transition Advisory (Change 14) filters for `architectural` items with status `captured`, which is impossible without a Status column. The Parking Protocol (step 3) says "Fill all columns" — but Status isn't one of them.
- **Why it matters**: Skills cannot implement the filtering logic the proposal requires. The status flow becomes decorative text rather than a functional mechanism.
- **Suggestion**: Two options: (a) add a Status column to the Active table with values `captured` / `picked-up`, and use the Resolution column in the Resolved table for terminal states, or (b) simplify — items are Active until moved to Resolved with a resolution type. Given D9's philosophy (active/resolved sections as the growth mechanism), option (b) is more internally consistent. Drop `captured` and `picked-up` as states; the section an item lives in IS its status. Transition Advisory filters Active items by Classification, not by a Status field.

### 2. Change 12 drops PROPOSAL_TRACKER.md from cl-researcher session start

- **Dimension**: External Consistency
- **Where**: Phase 2, Change 12 — session-start source file reads (line 316)
- **Issue**: cl-researcher currently reads 4 files at session start: RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md, STATUS.md, and DECISIONS.md. The proposal's replacement table for cl-researcher says "Read DECISIONS.md, RESEARCH_LEDGER.md, PARKING.md" — this drops PROPOSAL_TRACKER.md. The researcher needs proposal tracker state to know if proposals need attention and to detect cross-proposal conflicts during proposal generation.
- **Why it matters**: Losing PROPOSAL_TRACKER.md from the researcher's session start breaks the researcher's ability to detect in-flight proposals that touch the same system doc sections.
- **Suggestion**: Change cl-researcher's replacement to "Read DECISIONS.md, RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md, PARKING.md" (4 files, not 3).

### 3. STATUS.md write sites not fully enumerated in Change Manifest

- **Dimension**: Completeness
- **Where**: Change 17 gap table (lines 399-408) and Change Manifest overall
- **Issue**: Change 17 lists 7 source file write gaps to fix. But there are at least 10 additional locations across skill reference files that write to STATUS.md which are NOT listed in Change 17 and are NOT covered by the Parking Protocol (Change 16). These include: bootstrap-guide.md ("note that bootstrap was completed"), verify-mode.md ("increment merged proposals count"), audit-mode.md ("set Last audit to today's date"), correction-mode.md ("note that corrections were applied"), design-review-mode.md ("note the design review date"), spec-mode.md ("set Specs generated to Yes"), context-mode.md ("if Context section exists"), plus the cl-researcher and cl-reviewer Guidelines that say "Update STATUS.md." If STATUS.md is eliminated, every write instruction must be removed or redirected.
- **Why it matters**: The Change Manifest is the contract the reviewer verifies at merge and the verify step checks for completeness. Orphaned write instructions to a dead file will confuse skills at runtime.
- **Suggestion**: Either (a) add a catch-all Change Manifest entry: "Remove or redirect all STATUS.md write instructions across all skill reference files" with an enumerated list of locations, or (b) expand Change 17's gap table to include every STATUS.md write site with the appropriate redirection target (some should write to skill-specific files, some should simply be removed since they tracked vanity metrics).

### 4. Research template Emerged Concepts section still references STATUS.md

- **Dimension**: Completeness
- **Where**: Missing from Change Manifest; affects `cl-researcher/references/research-template.md`
- **Issue**: The research template has an "Emerged Concepts" section (line ~181) that says "These get added to STATUS.md's emerged concepts table." The proposal replaces Emerged Concepts with PARKING.md (Change 1, Change 16) but the Change Manifest has no entry for updating the research template. After merge, the template would instruct the AI to write to STATUS.md while the parking protocol says to write to PARKING.md — a direct contradiction.
- **Why it matters**: Research mode reads the template when generating research docs. A contradictory instruction creates unpredictable behavior — the AI may follow whichever instruction it encounters last in context.
- **Suggestion**: Add a Change Manifest entry to update `cl-researcher/references/research-template.md`: change the Emerged Concepts section guidance to reference PARKING.md, and align the classification system with the parking protocol's `architectural` / `incremental` / `scope-expansion` taxonomy.

### 5. Convergence tracking epsilon threshold is ambiguous

- **Dimension**: Technical Soundness
- **Where**: Phase 3, Change 19 — Convergence Tracking (lines 440-452)
- **Issue**: The epsilon thresholds say "Ship: max weighted 4 | Quality: max weighted 2 | Rigor: 0" but don't specify what metric this applies to. The preceding text computes three metrics: raw blocking issue count, severity-weighted sum, and contraction ratio. "Max weighted 4" most likely means the severity-weighted sum of remaining blocking issues, but this is never explicitly stated. The relationship to the existing APPROVE/APPROVE WITH CHANGES/NEEDS REWORK verdict system is also unclear — does epsilon supplement, replace, or override the verdict criteria?
- **Why it matters**: An AI agent implementing this cannot apply the threshold without knowing which number to compare against. Ambiguity in a quantitative gate defeats its purpose.
- **Suggestion**: Rewrite to: "Compare the severity-weighted sum of all unresolved blocking issues against the intent threshold. If at or below threshold, the proposal qualifies for APPROVE even with remaining minor issues. This supplements (does not replace) the existing verdict criteria — the reviewer still assesses all six dimensions, but epsilon provides a quantitative minimum bar calibrated to project intent."

## Non-Blocking Suggestions

### Naming convention self-violation should be acknowledged

The proposal defines `P-NNN-TOPIC.md` naming (Change 7) but the proposal itself is `GUIDED_AUTONOMY_EXECUTION_MODEL.md` and its research doc is `PIPELINE_EXECUTION_MODEL.md`. The Migration section correctly says "applies to new files only" but should add a sentence explicitly grandfathering pre-adoption artifacts to prevent future confusion.

### "What next?" — the fourth guidance moment — has no detailed design

The Summary (line 24) lists 4 moments: "post-bootstrap orientation, session start, transition advisory, and 'what next?' suggestions." The Detailed Design covers the first three in detail but "what next?" never gets its own subsection. If this is implicit in the other three moments, say so. If it's a distinct behavior (e.g., when the user says "what should I do next?"), it needs at least a brief specification.

### Explore intent is missing from downstream protocols

Intent is fully specified at bootstrap (4 levels) and post-bootstrap (4 messages). But Transition Advisory (Change 14) and Convergence Tracking (Change 19) only specify Ship/Quality/Rigor — Explore is absent from both. If Explore projects typically don't reach spec/start or formal review rounds, a brief note explaining this would prevent confusion.

### Loop calibration "areas" and triage "complexity levels" should cross-reference

Loop calibration (Change 18) uses risk levels for parked findings. Triage mode (existing) uses complexity levels for new topics. These overlap conceptually but use different terminology and criteria. A brief cross-reference ("Loop calibration augments triage — triage assesses new topics; loop calibration assesses parked findings being picked up") would clarify the relationship.

### PARKING.md ID prefix should align with naming convention

The Parking Protocol assigns `EC-NNN` IDs (line 382), where "EC" stands for the retired "Emerged Concepts" term. Consider renaming to `PK-NNN` for consistency with the new terminology, and adding the ID scheme to the naming convention table (Change 7).

### Folder Structure diagrams in all 4 SKILL.md files show STATUS.md

Each SKILL.md has a Folder Structure section listing `STATUS.md`. After the proposal, these should be updated to remove STATUS.md and add PARKING.md. Not listed in the Change Manifest.

### cl-implementer Status Mode and Session Start reference IMPLEMENTATION_PROGRESS.md

cl-implementer SKILL.md's Status Mode section (lines 231-249) reads "from TASKS.md and IMPLEMENTATION_PROGRESS.md." Session Start (line 94) reads IMPLEMENTATION_PROGRESS.md. Change 6 targets start-mode.md but not the SKILL.md sections that also reference the merged file. These should be included in the Change Manifest scope.

### Start mode transition advisory is under-specified

Change 15 says "Same pattern for start mode, but lighter (specs already exist)." A one-sentence clarification of what "lighter" means would help — e.g., "check PARKING.md for architectural items but skip intent-calibrated messaging since the user is already past the spec gate."

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| cl-researcher/SKILL.md | ⚠️ Tension | Session-start replacement drops PROPOSAL_TRACKER.md (Blocking #2). Guidelines reference STATUS.md in 3 places not addressed by Change Manifest (Blocking #3). |
| cl-implementer/SKILL.md | ⚠️ Tension | Status Mode and Session Start reference IMPLEMENTATION_PROGRESS.md — not listed as Change 6 targets. Minor scope gap. |
| cl-reviewer/SKILL.md | ⚠️ Tension | Guidelines say "Update STATUS.md after audits" — not addressed in Change 17. Multiple reference files write to STATUS.md (Blocking #3). |
| cl-designer/SKILL.md | ⚠️ Tension | Session-start reads STATUS.md; folder structure shows STATUS.md. Both need updating but only session-start is addressed. |
| templates/status.md | ✅ Consistent | Proposal correctly identifies the 3 sections and plans to eliminate/redistribute them. |
| templates/research-ledger.md | ✅ Consistent | Research Queue addition to existing Active/Completed/Abandoned structure is clean. |
| research-template.md | ❌ Conflict | Still references STATUS.md emerged concepts (Blocking #4). |

## Strengths

- **The file rationalization is genuinely simpler than the status quo.** Eliminating STATUS.md and having skills read source files directly removes an entire class of drift problems. This is the proposal's strongest contribution.
- **Intent detection is well-designed.** Inferring from conversation, confirming explicitly, recording in DECISIONS.md — this is the right UX pattern. The per-intent post-bootstrap messages are concrete and useful.
- **The research lineage is thorough.** 10 findings, 11 design decisions, companion UX patterns research. Every design choice traces back to a finding.
- **The phased approach is disciplined.** Phase 1 must complete before Phase 2 (skills need to know which files to read). Phase 3 depends on Phase 1 (PARKING.md must exist). No circular dependencies.
- **Migration is non-breaking.** Existing projects don't break — skills just stop reading STATUS.md. PARKING.md is created on demand. Naming convention applies to new files only.

## Risk Assessment

The primary risk is **merge complexity**. The proposal touches all 4 SKILL.md files, multiple reference files, and templates. The 5 blocking issues are all about the Change Manifest not fully enumerating the targets — the design itself is sound. The merge will require a careful sweep of every file that references STATUS.md, Emerged Concepts, or IMPLEMENTATION_PROGRESS.md, even beyond what the Change Manifest lists. Recommend treating the Change Manifest as a minimum, not an exhaustive list, during merge.

Secondary risk: **adoption inertia for the parking protocol**. All 4 skills need to learn the same parking behavior. If any skill's reference files don't get the parking protocol instructions, that skill will silently skip parking, and findings will be lost rather than captured. The parking protocol addition (Change 16) targets SKILL.md Guidelines, which is the right place — but each skill's individual reference files that currently handle emerged concepts also need updating.
