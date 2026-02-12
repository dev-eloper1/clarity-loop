# Review: Behavioral Specs and Design Phase (P1)

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md
**System docs referenced**: skills/cl-designer/SKILL.md, skills/cl-designer/references/mockups-mode.md, skills/cl-designer/references/tokens-mode.md, skills/cl-designer/references/build-plan-mode.md, skills/cl-designer/references/design-checklist.md, skills/cl-designer/references/setup-mode.md, skills/cl-researcher/references/bootstrap-guide.md, skills/cl-researcher/SKILL.md, docs/pipeline-concepts.md
**Research doc**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F1-F7, F10, F13-F16; Changes 1-7)

## Summary

This is a comprehensive, well-structured proposal that addresses the most critical gap in the Clarity Loop pipeline: the absence of behavioral specification capture during the design phase. The proposal introduces 12 changes across 6 target files, centered on a behavioral walkthrough integrated into mockups mode, component behavioral states in tokens mode, expanded checklists, bootstrap probing questions, an extended UI_SCREENS.md format with behavioral contracts, browser validation tool awareness, and build plan restructuring. The proposal correctly identifies the "looks right but works wrong" failure mode, traces it to its structural root cause (no pipeline stage has a dedicated place for behavioral specifications), and addresses it at the optimal capture point (design phase, where users can reason about behavior concretely while looking at screens). The research lineage is solid, the dependency chain (P0 merged, P0.5 verified) is correctly stated, and the integration with P0.5's UX infrastructure (review styles, tiered checkpoints, generate-confirm, warmth gradient, decision flow, parallelization) is thorough and well-considered.

## Verdict: APPROVE WITH CHANGES

Two blocking issues must be resolved before merge. Both are tractable and affect specific sections rather than the overall design.

## Cross-Proposal Conflicts

The proposal's conflict analysis is accurate. I verified:

- **P0 (SKILL_RENAME_AND_FOLD)**: All file paths in P1 use the cl-* namespace. P0's rename is verified merged. No conflict.
- **P0.5 (PIPELINE_UX_OPTIMIZATION)**: P0.5 is verified merged (VERIFY_PIPELINE_UX_OPTIMIZATION.md confirms all 30 changes). P1's "Current State" sections accurately describe the post-P0.5 state of each target file. The behavioral walkthrough integrates with P0.5's batch/serial review styles, tiered checkpoints, and parallelization hints correctly.
- **P2 (TESTING_PIPELINE)**: P2 targets cl-implementer files. P1 explicitly defers autopilot changes to P2. No overlap.
- **P3 (SECURITY_ERRORS_AND_API_CONVENTIONS)**: P3 targets cl-implementer spec-mode and bootstrap. P1's bootstrap changes (Change 5) add behavioral questions, while P3 adds security/error/API questions. Both modify the same "Then dig deeper" section of bootstrap-guide.md. However, P3 explicitly builds on P0.5's defaults sheet rather than the discovery conversation section, so the overlap is minimal. **Low risk**, but the merge order matters: if P1 merges first, P3's bootstrap changes need to account for the behavioral questions already present.
- **CONTEXT_SYSTEM**: No overlap (targets cl-researcher context mode and pipeline-concepts.md).
- **IMPLEMENTER_SKILL**: No overlap (targets cl-implementer, README, pipeline docs).

No undocumented conflicts found.

## Blocking Issues

### Issue 1: Context Budget Violation — mockups-mode.md Will Exceed ~3000 Token Budget

- **Dimension**: Completeness & Gaps / Technical Soundness
- **Where**: Change 1 (Insertion Point A, ~95 lines of new content) + Change 6 (UI_SCREENS.md format expansion, ~45 lines replacing ~20) + existing file at 334 lines
- **Issue**: The proposal's own "Context Budget & Progressive Disclosure" section (lines 989-1013) establishes a hard requirement that no reference file exceed ~3000 tokens. mockups-mode.md is currently 334 lines. Change 1 adds ~95 lines (behavioral walkthrough for Pencil path) plus ~15 lines (markdown fallback walkthrough). Change 6 replaces ~20 lines with ~45 lines in the UI_SCREENS.md format. The existing "Behavioral Walkthrough: Batch Mode" section (P0.5 stub) is ~25 lines that get expanded but remain. After all changes, mockups-mode.md grows to approximately 450-460 lines. At roughly 1.3 tokens per word and 8-10 words per line, this is approximately 4700-6000 tokens — well beyond the stated ~3000 token budget. The proposal's own Merge Validation section says the reviewer should verify "No reference file exceeds ~3000 tokens after changes." This file would fail that check.
- **Why it matters**: The progressive disclosure model is the primary mechanism for keeping context lean. mockups-mode.md loads for every mockups invocation. If it bloats past budget, every mockup session pays the token cost even for screens that don't need the full behavioral walkthrough (e.g., static pages, simple settings screens).
- **Suggestion**: Extract the behavioral walkthrough process (the full Step 3 content from Insertion Point A) into a new reference file `skills/cl-designer/references/behavioral-walkthrough.md`. mockups-mode.md would contain a brief pointer: "After visual approval, run the behavioral walkthrough. Read `references/behavioral-walkthrough.md` for the full process." This follows the established pattern where SKILL.md points to mode references, and mode references point to sub-references when content is large. The walkthrough content is self-contained (screen states table, interaction flows, navigation context, content decisions, recording) and applies identically to both Pencil and markdown fallback paths, making extraction clean. The UI_SCREENS.md format extension (Change 6) can remain in mockups-mode.md since it's the output format, not the walkthrough process.

### Issue 2: Insertion Point C (Change 1) Is Imprecise and Could Cause Ordering Confusion

- **Dimension**: Spec-Readiness
- **Where**: Change 1, Insertion Point C (line 234)
- **Issue**: Insertion Point C says "No change to the responsive section itself, but the behavioral walkthrough (Step 3) runs before responsive states are considered. The order becomes: Step 2 (generate screens) -> Step 3 (behavioral walkthrough per screen) -> responsive states -> generate UI_SCREENS.md." This is stated as a clarification, not an actual file change. However, the current mockups-mode.md has the order: Step 2 (generate) -> Screen Review -> Behavioral Walkthrough: Batch Mode -> Responsive States -> UI_SCREENS.md. The behavioral walkthrough (P0.5 stub) currently appears AFTER the Screen Review section. Insertion Point A adds the full walkthrough process inside/after the Screen Review section for Pencil path, which places it correctly. But there is no explicit instruction to reorder the existing "Behavioral Walkthrough: Batch Mode" stub or clarify its relationship to the new Insertion Point A content. The P0.5 integration paragraph (lines 236) says the batch mode section "remains" and is expanded, but the physical location of the batch mode stub (currently between Screen Review and Responsive States) and the new Step 3 content (after Screen Review's feedback loop) needs to be explicit. During merge, the implementer could place the behavioral walkthrough in the wrong location relative to the batch mode stub.
- **Why it matters**: If the walkthrough ends up in the wrong order or the batch mode stub and the full walkthrough appear as disconnected sections, the skill's flow becomes ambiguous. Does it run the batch mode stub OR the full walkthrough? The proposal says batch mode is the default and serial is opt-in, but the physical file structure needs to make this clear.
- **Suggestion**: Add an explicit merge instruction: "The existing 'Behavioral Walkthrough: Batch Mode' section (P0.5 stub, currently between Screen Review and Responsive States) becomes the batch path of the full Step 3. The new Step 3 content (Insertion Point A) wraps the existing batch mode stub. The section header changes from 'Behavioral Walkthrough: Batch Mode' to 'Step 3: Behavioral Walkthrough' with the batch mode content as a subsection. Serial walkthrough content is a peer subsection. This consolidation eliminates the current structural ambiguity where the batch stub and the full walkthrough appear to be separate steps."

## Non-Blocking Suggestions

### Suggestion 1: Tokens-mode.md Is Also Approaching Budget

- **Dimension**: Internal Coherence
- **Where**: Change 2 (tokens-mode.md, currently 411 lines)
- **Detail**: tokens-mode.md is already the longest reference file at 411 lines. Change 2 adds ~30 lines to Step 3 (behavioral state variants in Pencil path), ~20 lines to Step 4 (Component Validation batch table extension and behavioral detail), ~10 lines to Step 4 (new item 6 for behavioral specification capture), and ~30 lines to markdown fallback Step 3 (expanded component documentation). Change 12 adds ~30 lines to DESIGN_SYSTEM.md format. Total addition: ~120 lines, bringing the file to ~530 lines — likely ~4500-5500 tokens. While this is less severe than mockups-mode.md (tokens mode has more structural content that compresses well), it's worth monitoring. If the merge pushes tokens-mode.md noticeably past 3000 tokens, the behavioral state format tables (from Change 2's Pencil path and markdown fallback) could be extracted into a shared reference (e.g., `behavioral-states-format.md`) that both paths reference.

### Suggestion 2: SKILL.md Line Count After Changes

- **Dimension**: Internal Coherence
- **Where**: Changes 7, 9, 10, 11 (SKILL.md, currently 303 lines)
- **Detail**: SKILL.md is currently 303 lines. The proposal's Context Budget section requires SKILL.md to stay under ~200 lines. It is already over budget. Changes 9-11 are net-neutral line changes (replacing summary paragraphs). Change 7 adds ~25 lines (Browser Validation Tools section). After all changes, SKILL.md grows to ~328 lines. The proposal should note that SKILL.md's current over-budget state is a pre-existing condition, not introduced by P1. The proposal's Changes 9-11 actually improve the situation by replacing vague summaries with accurate ones at the same line count. Change 7's Browser Validation Tools section is borderline — it's useful but could be a reference file. Consider noting this as technical debt for a future cleanup pass rather than addressing it in this proposal.

### Suggestion 3: Bootstrap Question Deduplication With P0.5 Defaults Sheet

- **Dimension**: External Consistency
- **Where**: Change 5 (bootstrap-guide.md)
- **Detail**: The proposal's Change 5 adds behavioral probing questions to the discovery conversation's "Then dig deeper" section and notes that answers feed into Step 2b (profile detection) and Step 2c (defaults sheet). The P0.5 defaults sheet already includes rows for `Accessibility: Level`, `Accessibility: Interaction mode`, `Content: Tone`, `Content: Empty states`, `Resilience: Offline handling`, `Resilience: Loading states`, and `Target devices: Viewports`. Several of the proposed bootstrap questions directly overlap with these defaults sheet rows (accessibility level, interaction mode, content tone, offline handling, target devices). The proposal addresses this in the last paragraph of Change 5: "If the user answered a behavioral question here, the defaults sheet pre-fills that category with source `[from discovery]` instead of `[preset]` or `[research-generated]`." This is correct and follows DECISIONS.md precedence rules. However, the merge should verify that the discovery questions don't cause redundancy where the user is asked the same question twice — once in discovery and again in the defaults sheet. The existing P0.5 defaults sheet presents ALL rows including those already answered. The proposed solution (pre-fill with `[from discovery]` source) handles this, but only if the skill implementation correctly tags and propagates the answers. Since these are skill instruction files (not code), the instruction in Change 5 should be slightly more explicit: "When presenting the defaults sheet (Step 2c), rows that were answered during the behavioral probing questions show the user's answer with source `[from discovery]` and are NOT re-asked. The user sees them in the sheet as confirmation, not as questions."

### Suggestion 4: Test Scenarios in UI_SCREENS.md Lack Generation Guidance

- **Dimension**: Completeness & Gaps
- **Where**: Change 6 (UI_SCREENS.md format)
- **Detail**: The extended UI_SCREENS.md format includes a "Test Scenarios" section with examples like "Submit empty form -> inline validation on required fields." The format is clear, but there is no guidance in the behavioral walkthrough (Change 1) about HOW to derive test scenarios from the walkthrough. The walkthrough captures screen states, interaction flows, navigation context, and content — but doesn't explicitly say "Now derive test scenarios from the above." Adding a brief instruction in the "Record and Continue" step of the walkthrough: "Derive 3-5 test scenarios from the behavioral decisions above. Each scenario should be a verifiable statement: [user action or condition] -> [expected outcome]. Focus on error paths and non-default states — happy paths are implicit from the interaction flows."

## Spec-Readiness Notes

The proposal is well-structured for implementation. The Change Manifest (12 changes) maps cleanly to target files and sections, with explicit "Current" and "Proposed" content for each change. The dependency chain between changes is documented (Change 6 depends on Change 1; Change 12 depends on Change 2; Change 8 depends on Changes 1, 2, and 6). The P0.5 integration points are clearly called out with specific section names and P0.5 feature references.

Two areas need attention for spec-readiness:

1. **Insertion Point precision**: The blocking issues above address the imprecise Insertion Point C. After those are resolved, all 12 changes have clear, unambiguous insertion/replacement targets.

2. **File extraction**: If Blocking Issue 1 is resolved by extracting the walkthrough into a separate reference file, the Change Manifest needs to be updated to reflect the new file. Change 1 would split into: (a) pointer in mockups-mode.md, (b) new file behavioral-walkthrough.md with the full walkthrough content, (c) markdown fallback pointer in mockups-mode.md.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| skills/cl-designer/SKILL.md | CONSISTENT | Changes 7, 9, 10, 11 update mode summaries and add guidelines. Current state descriptions match the actual file content (post-P0.5). |
| skills/cl-designer/references/mockups-mode.md | CONSISTENT | Changes 1, 6 match the file's current structure. The P0.5 "Behavioral Walkthrough: Batch Mode" stub, Screen Review batch/serial paths, Parallelization Hints, and UI_SCREENS.md format all match the proposal's "Current" descriptions. |
| skills/cl-designer/references/tokens-mode.md | CONSISTENT | Changes 2, 12 correctly reference Step 3 item 4, Step 4 batch review table, markdown fallback Step 3, and DESIGN_SYSTEM.md component catalog format. All match actual file content. |
| skills/cl-designer/references/design-checklist.md | CONSISTENT | Changes 3, 4 correctly reproduce the current tokens checklist (8 items with tiers) and mockups checklist (6 items with tiers + P1 placeholder). The P0.5 placeholder text "When P1's checklist items are added..." (lines 66-78) matches exactly and is correctly targeted for replacement. |
| skills/cl-designer/references/build-plan-mode.md | CONSISTENT | Change 8 correctly reproduces all five current phase descriptions and the "Per task, include" acceptance criteria line. |
| skills/cl-researcher/references/bootstrap-guide.md | CONSISTENT | Change 5 correctly identifies the "Then dig deeper" section (lines 58-64) and the P0.5 profile detection flow (Step 2b, 2c). The description of what's missing (no behavioral probing in the discovery conversation itself) is accurate. |
| docs/pipeline-concepts.md | NOT MODIFIED | Proposal does not modify pipeline-concepts.md. The DECISIONS.md category tags (`errors`, `accessibility`, `content`, `resilience`, `testing`, `responsive`) referenced in Change 5 exist in pipeline-concepts.md. No consistency issue. |

## Strengths

1. **Root cause analysis is correct and well-evidenced.** The proposal correctly identifies that the behavioral gap is structural (no pipeline stage captures behavior) rather than incidental (someone forgot). The five-handoff analysis from the research is properly distilled into the proposal's rationale.

2. **P0.5 integration is thorough and accurate.** Every change explicitly describes how it builds on P0.5 infrastructure — batch/serial review styles, tiered checkpoints, generate-confirm pattern, warmth gradient, DECISIONS.md category tags, parallelization hints. The proposal doesn't reinvent any P0.5 mechanism; it correctly uses them. The "Current State" table (lines 34-43) reflects post-P0.5 state accurately for all 6 target files.

3. **The behavioral walkthrough design is well-scoped.** The five-part walkthrough (screen states, interaction flows, navigation context, content decisions, record and continue) covers the critical behavioral dimensions without bloating into a comprehensive behavioral analysis exercise. The "not every screen needs every state" guidance and the efficiency tip for pattern reuse show practical awareness.

4. **Context budget awareness.** The proposal includes an explicit "Context Budget & Progressive Disclosure" section with rules and merge validation criteria. This is a self-imposed discipline that future proposals should emulate — even though the proposal itself may violate the budget (see Blocking Issue 1), the fact that it articulates the constraint makes the violation detectable and fixable.

5. **Design decisions table is excellent.** Seven decisions with alternatives considered and clear rationale. The decisions around batch walkthrough using generate-confirm (matching P0.5's warmth gradient), behavioral states in tokens mode (not deferred to mockups), and test scenarios in UI_SCREENS.md (spec-testing duality) are all well-reasoned and traceable to specific research findings.

6. **Scope boundaries are clear.** The "Scope boundary" note (lines 77-81) explicitly states what is NOT modified, preventing scope creep. The deferral of autopilot changes to P2 and design-review enhancements is appropriate.

7. **Cross-cutting terminology table.** The Terminology section (lines 963-971) defines seven key terms used across multiple changes. This prevents definition drift across the 12 changes and gives the merge implementer a reference for consistent language.

## Risk Assessment

1. **Design phase time increase.** The proposal estimates 30-50% increase per screen for the behavioral walkthrough. For large apps (15+ screens), this could significantly extend the design phase. The pattern reuse guidance ("walkthrough the first screen of each pattern, confirm pattern applies to similar screens") mitigates this, but the mitigation is advisory, not structural. Risk: users skip the walkthrough for "simple" screens and lose behavioral coverage. Likelihood: medium. The checklist gate (Change 4, item 5: "Behavioral walkthroughs completed for all screens") catches this, but the user can choose to proceed with gaps.

2. **P0 dependency not yet verified.** The proposal states "Depends On: P0 (SKILL_RENAME_AND_FOLD.md)." P0 has a v2 review (REVIEW_SKILL_RENAME_AND_FOLD_v2.md exists) but no VERIFY file. If P0 has not been merged, all file paths in P1 are wrong (they use cl-* names but files would still be doc-*/ui-*). This is a merge-time concern, not a proposal quality issue. The merge must wait for P0 to be verified.

3. **Bootstrap question volume.** Change 5 adds 9 behavioral probing questions to a discovery conversation that already has 4 core questions plus the P0.5 profile system. Combined with P2's testing questions and P3's security/error/API questions, the discovery phase could feel like an interrogation even with the "ask what's relevant, skip what's not" guidance. The P0.5 defaults sheet was designed to compress this, but the proposal adds questions to the conversation phase BEFORE the defaults sheet. The suggestion to ensure no re-asking (Non-Blocking Suggestion 3) partially addresses this.

4. **No enforcement mechanism for behavioral completeness.** The checklists detect missing behavioral specs, but the user can always choose "proceed with gaps." The pipeline has no way to flag downstream that a screen is missing behavioral specifications — the implementer will encounter a UI_SCREENS.md entry without a Screen States table and have to improvise. A future enhancement could add a `behavioral_completeness` field to UI_SCREENS.md entries (complete/partial/none) so the implementer knows which screens need extra care.
