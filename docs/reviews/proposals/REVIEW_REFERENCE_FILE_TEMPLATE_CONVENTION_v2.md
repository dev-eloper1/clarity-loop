# Re-Review: Reference File Template Convention (v2)

**Reviewed**: 2026-02-17
**Proposal**: docs/proposals/REFERENCE_FILE_TEMPLATE_CONVENTION.md
**Previous reviews**: docs/reviews/proposals/REVIEW_REFERENCE_FILE_TEMPLATE_CONVENTION_v1.md
**System docs referenced**: SYSTEM_DESIGN.md (S1, S16, S17), docs/pipeline-concepts.md
**Review cycle**: 2 (this is re-review #1)

## Summary

Three blocking issues from v1 have been addressed with targeted, well-scoped fixes. The
correction-mode tier reassignment (Blocking #1) is clean. The frontmatter field reduction
from 6 to 4 (Blocking #3) eliminates the dual-source-of-truth risk. The two new
before/after examples for design-checklist.md and research-template.md (Blocking #2)
complete pattern coverage and the Migration Contract section makes the execution model
explicit. The proposal is improving steadily with no oscillation or scope creep. One
minor new issue was introduced by the fixes, described below.

## Verdict: APPROVE

## Issue Resolution

### From v1 Review:

#### Blocking Issues

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Correction-mode Tier Assignment Is Wrong | Fixed | Change Manifest #20 now reads `2-Guided`. Tier counts updated to 14/21. Proposed State section (lines 65-66) reflects 14 Tier 1 / 21 Tier 2. Consistent throughout the document. |
| 2 | Changes 8-42 Lack Per-File Detailed Design | Fixed | Two new before/after examples added: design-checklist.md (Rules/Checklist pattern, lines 503-594) and research-template.md (Template pattern, lines 596-679). Migration Contract section added (lines 681-697) with pattern-to-example table and explicit statement that per-file decisions are made by the executing agent. All 4 structural patterns from R-003 Finding 1 now have example coverage. |
| 3 | Frontmatter inputs/outputs Overlap with Variables Table | Fixed | Frontmatter reduced to 4 fields: `mode`, `tier`, `depends-on`, `state-files`. All before/after examples show only these 4 fields. Design decisions table updated (line 745): "4 fields (mode, tier, depends-on, state-files) provide essential metadata without duplicating the Variables table." SKILL.md instruction text (line 276) updated to remove inputs/outputs mention. |

#### Non-Blocking Suggestions

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Pencil Files May Not Need Variables Tables | Unchanged | Open Item #2 (lines 769-773) still asks whether pencil files need Tier 2 treatment. The proposal acknowledges they'd get "a Variables table (which may have zero entries)." This remains a reasonable open item — it does not block merge. |
| 2 | Warmth Gradient Alignment | Unchanged | The proposal does not explicitly reference S16's warmth gradient. Non-blocking; the alignment is implicit and clear. |
| 3 | SYSTEM_DESIGN.md Change 1 Insertion Point | Addressed | The proposal (line 173) now says "after Created Directory Structure" which matches the v1 suggestion. The Change Manifest (line 84) still says "after Plugin Structure diagram" which is less precise but the Detailed Design section is the authoritative location and it's correct there. |

## New Issues Found

No new issues introduced — the fixes were clean.

One observation worth noting (non-blocking):

### Migration Contract Pattern Table Omits One Pattern

- **Dimension**: Completeness
- **Where**: Migration Contract section, line 683-691
- **Observation**: The pattern-to-example table lists 4 patterns: Step-based Pipeline,
  Judgment-driven Process, Rules/Checklist, and Template. R-003 Finding 1 identified 5
  patterns — the fifth being "Loop-based" (e.g., run-mode.md with its reconciliation +
  queue processing loop). The Loop-based pattern maps to Tier 2: Guided in the proposal's
  tier assignments, and its transformation would follow the same 5-step Tier 2 process
  shown in the audit-mode example. This is a minor gap — the Loop-based pattern doesn't
  need a separate example since it maps naturally to the Tier 2 Guided template, and the
  Migration Contract explicitly states the executing agent determines per-file structure
  by following the patterns. Not blocking.
- **Likely cause**: The v1 review requested coverage for "different structural patterns"
  and suggested Rules/Checklist and Template specifically. The fix addressed exactly what
  was asked.
- **Suggestion**: No action needed. The audit-mode example adequately covers the Tier 2
  transformation that Loop-based files would follow. If desired, a one-line note in the
  pattern table saying "Loop-based patterns (e.g., run-mode.md) follow the Judgment-driven
  Process transformation" would make the mapping explicit.

## Regressions

No regressions detected.

## Ground Truth Spot-Check (Changed Sections)

### design-checklist.md Before/After (New in v2)

Verified the "Before" opening against the actual file at
`skills/cl-designer/references/design-checklist.md`:

- **Actual file** opens with: `## Design Checklists` followed by "Gate checklists for
  tokens and mockups modes. The skill self-assesses each item, then presents the checklist
  to the user..." — **matches** the proposal's Before text.
- **Actual file** has a "Checkpoint Tiering" section with a tier table, then "Tokens
  Checklist" (17 items) and "Mockups Checklist" (17 items) — **matches** the structural
  description in the proposal's After.
- The After example shows `depends-on: [tokens-mode.md, mockups-mode.md]` and
  `state-files: [DESIGN_PROGRESS.md, DECISIONS.md]` — these are accurate: the checklist
  is run after tokens mode (before mockups) and after mockups mode (before build-plan),
  and it writes to DESIGN_PROGRESS.md and DECISIONS.md.
- Variables table in the After includes `DESIGN_SYSTEM`, `DESIGN_PROGRESS`, `PRD_FEATURES`,
  `UX_AUTO_DEFAULTS` — all correspond to actual inputs referenced in the real file.
- Phase structure (Checkpoint Tiering Context, Tokens Checklist, Mockups Checklist) maps
  faithfully to the actual file's section organization.

**Note**: The proposal's After example says "Tokens Checklist" checkpoint confirms "All 17
tokens items assessed" (line 579) — the actual file has 17 items (numbered 1-17). This is
correct. SYSTEM_DESIGN.md S17 line 1320 currently says "Tokens checklist (14 items),
mockups checklist (11 items)" which is outdated (both are 17 items now), but that
discrepancy is in the existing system doc, not in the proposal's changes. The proposal's
Change 2 corrects the inventory table and would pick this up.

### research-template.md Before/After (New in v2)

Verified against actual file at `skills/cl-researcher/references/research-template.md`:

- **Actual file** opens with: `# Research Doc Template` followed by "Use this template
  when generating research documents. Adjust section depth based on the complexity..." —
  **matches** the proposal's Before text.
- **Actual file** has "Filename Convention" section with R-NNN-TOPIC.md format, a
  "Template" section with a large code block, and "Section Guidance" — **matches** the
  structural description in the proposal's After.
- The After example shows `depends-on: []` and `state-files: [RESEARCH_LEDGER.md]` —
  accurate: the template is standalone and it references RESEARCH_LEDGER.md for ID
  assignment.
- Variables table includes `RESEARCH_LEDGER`, `SYSTEM_CONTEXT`, `RESEARCH_TOPIC` — all
  verified against the actual file's content.

### correction-mode.md Tier Change (Modified in v2)

Verified against actual file at `skills/cl-reviewer/references/correction-mode.md`:

- The file has a "When to Use Corrections (vs. Full Pipeline)" section with bulleted
  heuristics (lines 7-28), an "Inputs" section with a source finding table (lines 30-46),
  and then "Process" with Steps 1-5 (lines 48-151), followed by guidance sections.
- This structure confirms the v1 review's assessment: the file is judgment-driven (the
  "When to Use" section requires agent discretion), with mechanical steps following.
  Tier 2: Guided is the correct assignment.

### Frontmatter Field Reduction (Modified in v2)

Verified across all 4 before/after examples:

- merge-mode.md After (line 347): `mode, tier, depends-on, state-files` — 4 fields.
- audit-mode.md After (line 441): `mode, tier, depends-on, state-files` — 4 fields.
- design-checklist.md After (line 536): `mode, tier, depends-on, state-files` — 4 fields.
- research-template.md After (line 627): `mode, tier, depends-on, state-files` — 4 fields.

All consistent. No `inputs` or `outputs` fields remain in any example.

### SKILL.md Instruction Text (Modified in v2)

The updated instruction (line 273-277) reads: "read its YAML frontmatter to understand the
mode's tier (structured or guided), dependencies, and state files. Follow the file's
Workflow section (Tier 1: Structured) or Process section (Tier 2: Guided). Consult the
Variables table for the mode's inputs and outputs."

This correctly omits `inputs`/`outputs` from the frontmatter description while still
directing agents to the Variables table for I/O information. Clean separation.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| SYSTEM_DESIGN.md S1 | Consistent | New Reference File Convention subsection is additive. Placement "after Created Directory Structure" is correct. |
| SYSTEM_DESIGN.md S16 (Warmth Gradient) | Consistent | Two-tier model aligns with warm-to-cool gradient. Not explicitly referenced, but compatible. |
| SYSTEM_DESIGN.md S17 (File Inventory) | Tension (acknowledged) | Proposal's Change 2 corrects cl-designer count from 6 to 10 and total from 31 to 35. Also adds Tier column. The current S17 text for design-checklist.md says "14 items / 11 items" but both checklists now have 17 items — this is an existing system doc inaccuracy, not introduced by the proposal. The proposal's Change 2 will update the purpose description, which should catch this. |
| docs/pipeline-concepts.md | Consistent | New "Reference File Structure" section is additive and consistent with existing concepts. |
| Plugin Structure diagram (S1) | Tension (not addressed by proposal) | The Mermaid diagram on line 43 shows `cl-designer: SKILL.md + 6 references`. The proposal's Change 2 updates the S17 table to 10 references but does not mention updating the Plugin Structure diagram. This is a pre-existing inconsistency (the diagram was wrong before this proposal), and the proposal is not required to fix it, but merging Change 2 without also updating the diagram would widen the gap. This is non-blocking — the diagram count is cosmetic and Change 2's scope is the S17 table. |
| Existing reference files | Consistent | Spot-checked correction-mode.md, design-checklist.md, research-template.md. Proposal's Before descriptions and tier assignments are factually accurate. |

## Review Cycle Health

The proposal is converging cleanly toward approval. All three blocking issues from v1
were resolved without introducing regressions or new blocking issues. The fixes were
precisely scoped — no over-correction, no scope creep, and no terminology drift. The
proposal has grown from ~700 to ~790 lines, all of which is justified by the new
examples and Migration Contract.

**Recommendation**: Approve. The proposal is ready for merge. The one non-blocking
observation (Loop-based pattern not explicitly listed in the Migration Contract table)
and the Plugin Structure diagram count discrepancy are both minor and can be addressed
opportunistically during or after the migration.
