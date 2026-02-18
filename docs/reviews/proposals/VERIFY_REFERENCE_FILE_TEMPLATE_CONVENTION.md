# Verification: Reference File Template Convention

**Verified**: 2026-02-17 (independent re-verification)
**Proposal**: docs/proposals/REFERENCE_FILE_TEMPLATE_CONVENTION.md
**Approved review**: docs/reviews/proposals/REVIEW_REFERENCE_FILE_TEMPLATE_CONVENTION_v2.md
**System docs checked**: SYSTEM_DESIGN.md (S1, S17, Mermaid diagram), pipeline-concepts.md, all 4 SKILL.md files, all 35 reference files

## Summary

All 42 changes from the Change Manifest have been applied faithfully. System docs,
SKILL.md files, and all 35 reference files are structurally correct and mutually
consistent. Tier assignments in S17 match actual file frontmatter across all 35 files.
No collateral damage detected. One pre-existing system doc inaccuracy noted (not
introduced by this proposal).

## Verdict: CLEAN MERGE

## Application Status

### System Doc Changes (3)

| # | Proposed Change | Target Doc | Status | Notes |
|---|----------------|------------|--------|-------|
| 1 | Add "Reference File Convention" subsection | SYSTEM_DESIGN.md S1 | Applied | Lines 103-126. Positioned after "Created Directory Structure", before "Skill Responsibilities". Contains: two-tier description, 4 frontmatter fields, tier counts (14/21), S17 cross-reference, enforcement note. |
| 2 | Update file inventory counts and add Tier column | SYSTEM_DESIGN.md S17 | Applied | Heading: "Skills (4 SKILL.md + 35 references)" (line 1305). cl-designer: 10 references (line 1334). All 4 skill tables have Tier column. Mermaid diagram (line 43) shows "10 references" for cl-designer. 4 missing files added. |
| 3 | Add "Reference File Structure" section | pipeline-concepts.md | Applied | Lines 403-414. Describes two-tier convention, mentions frontmatter and Variables table, cross-references SYSTEM_DESIGN.md S1. |

### SKILL.md Changes (4)

| # | Target File | Status | Line | Notes |
|---|------------|--------|------|-------|
| 4 | cl-researcher/SKILL.md | Applied | 142 | Exact text match. In Session Start section. |
| 5 | cl-reviewer/SKILL.md | Applied | 158 | Exact text match. In Session Start section. |
| 6 | cl-designer/SKILL.md | Applied | 121 | Exact text match. In Session Start section. |
| 7 | cl-implementer/SKILL.md | Applied | 110 | Exact text match. In Session Start section. |

All 4 contain identical instruction text referencing 4 frontmatter fields (no inputs/outputs)
and directing agents to Workflow (Tier 1) or Process (Tier 2) sections and the Variables table.

### Reference File Reformats (35)

| Check | Result |
|-------|--------|
| YAML frontmatter present (opening + closing `---`) | 35/35 |
| `mode:` field present | 35/35 |
| `tier:` field present (structured or guided) | 35/35 |
| `depends-on:` field present | 35/35 |
| `state-files:` field present | 35/35 |
| No `inputs:` or `outputs:` fields (deliberately removed) | 35/35 |
| `## Variables` section present | 35/35 |
| Tier 1 files have `## Workflow` + `## Report` | 14/14 |
| Tier 2 files have `## Guidelines` + `## Process` + `## Output` | 21/21 |

#### Tier 1: Structured (14 files)

| Skill | File | Frontmatter | Variables | Workflow | Report | Verified |
|-------|------|-------------|-----------|----------|--------|----------|
| cl-researcher | context-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | review-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | re-review-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | fix-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | merge-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | verify-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | sync-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-reviewer | design-review-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-designer | build-plan-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-implementer | spec-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-implementer | spec-consistency-check.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-implementer | start-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-implementer | verify-mode.md | tier: structured | Yes | Yes | Yes | Yes |
| cl-implementer | sync-mode.md | tier: structured | Yes | Yes | Yes | Yes |

#### Tier 2: Guided (21 files)

| Skill | File | Frontmatter | Variables | Guidelines | Process | Output | Verified |
|-------|------|-------------|-----------|------------|---------|--------|----------|
| cl-researcher | bootstrap-guide.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-researcher | operational-bootstrap.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-researcher | document-plan-template.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-researcher | proposal-template.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-researcher | research-template.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-reviewer | audit-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-reviewer | correction-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | setup-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | tokens-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | mockups-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | behavioral-walkthrough.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | design-checklist.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | visual-quality-rules.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | component-identification-process.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | pencil-schema-quick-ref.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-designer | pencil-templates.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-implementer | cross-cutting-specs.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-implementer | operational-specs.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-implementer | governance-checks.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-implementer | run-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |
| cl-implementer | autopilot-mode.md | tier: guided | Yes | Yes | Yes | Yes | Yes |

#### Detailed Spot-Checks (8 files, content verification)

1. **context-mode.md** (Tier 1, cl-researcher): 6 phases with globally numbered steps,
   Verify checkpoints, On failure blocks, Report section with CONTEXT: LOADED/FAILED variants.

2. **verify-mode.md** (Tier 1, cl-reviewer): 5 phases, Verify checkpoints, Report section.

3. **build-plan-mode.md** (Tier 1, cl-designer): 4 phases, Verify checkpoints, Report
   section with BUILD-PLAN: COMPLETE/INCOMPLETE variants.

4. **spec-mode.md** (Tier 1, cl-implementer): 5 phases with globally numbered steps,
   Verify checkpoints, Report section with SPEC: COMPLETE/PARTIAL variants.

5. **bootstrap-guide.md** (Tier 2, cl-researcher): 11 guidelines, 6 process phases with
   checkpoints, Output section.

6. **audit-mode.md** (Tier 2, cl-reviewer): Guidelines section, phased process with
   checkpoints, Output section with primary artifact path.

7. **setup-mode.md** (Tier 2, cl-designer): Guidelines, 3 process phases with checkpoints,
   Output section.

8. **operational-specs.md** (Tier 2, cl-implementer): 10 guidelines, 9 process phases with
   checkpoints, Output section.

## Fidelity Issues

All changes were applied faithfully. No simplification, distortion, or dropped detail detected.

Specific fidelity checks:
- Frontmatter uses exactly 4 fields as specified (no inputs/outputs)
- SKILL.md instruction text matches proposal verbatim across all 4 files
- S1 Reference File Convention subsection content matches proposal's Detailed Design
- S17 tables include all 4 missing cl-designer files with correct purposes
- Mermaid diagram updated to show 10 references for cl-designer (addresses the v2 review's
  non-blocking observation about diagram consistency)

## Cross-Document Consistency

| Document Pair | Status | Notes |
|---------------|--------|-------|
| SYSTEM_DESIGN.md S1 <-> S17 | Consistent | S1 references "Section 17 for the complete assignment table." S17 Tier column values match S1's tier counts (14 Structured, 21 Guided). |
| SYSTEM_DESIGN.md S17 <-> Actual files | Consistent | All 35 files listed in S17 exist. All tier assignments in S17 match actual frontmatter values (independently verified by reading 6 files and grep-scanning all 35). File counts: 6 + 9 + 10 + 10 = 35. |
| SYSTEM_DESIGN.md Mermaid <-> S17 | Consistent | Diagram shows cl-designer with "10 references", matching S17 heading "cl-designer (SKILL.md + 10 references)". |
| SYSTEM_DESIGN.md S1 <-> pipeline-concepts.md | Consistent | Both describe the two-tier model with matching terminology. pipeline-concepts.md cross-references S1 for the full specification. |
| SKILL.md instruction <-> reference files | Consistent | Instruction directs agents to read frontmatter for 4 fields (matching actual fields), follow Workflow (Tier 1) or Process (Tier 2) (matching actual section names), and consult Variables table (present in all 35 files). |
| Tier counts (S1 claim vs actual) | Consistent | S1 says "14 Tier 1 files, 21 Tier 2 files." Actual: 14 structured + 21 guided = 35. |
| correction-mode.md tier | Consistent | S17: Guided. Frontmatter: guided. Matches v1 blocking fix. |

## Collateral Damage

No unintended changes detected.

- **SKILL.md files**: Only the frontmatter parsing instruction was added to each. No other
  sections modified. SKILL.md files themselves do NOT have YAML frontmatter (correct --
  the convention applies only to reference files).
- **Non-reference files**: hooks/, scripts/, and plugin manifest files were not modified.
- **Reference file content**: Spot-checked 8 files across all 4 skills. Original
  instructions preserved within the new structure. Transformation is purely structural.
- **pipeline-concepts.md**: Only the new "Reference File Structure" section was added.
  All existing sections remain unchanged.
- **SYSTEM_DESIGN.md**: Only S1 (new subsection) and S17 (inventory correction + Tier
  column) were modified. Mermaid diagram updated consistently.

## Pre-Existing Issues (Not Introduced by This Proposal)

1. **design-checklist.md item counts in S17**: Line 1344 reads "Tokens checklist (14 items),
   mockups checklist (11 items)" but both checklists actually have 17 items each. This was
   identified in the v2 review (lines 96-99) as a pre-existing system doc inaccuracy.
   Recommend correcting in a future pipeline pass.

## Final Assessment

The merge was applied cleanly and comprehensively. All 42 changes landed in the correct
locations with faithful content. The system documentation set is internally consistent --
S1, S17, the Mermaid diagram, pipeline-concepts.md, SKILL.md instructions, and all 35
reference file frontmatters agree on tier assignments, file counts, and terminology.

The convention is now fully established across the Clarity Loop plugin. No follow-up work
is required except the pre-existing design-checklist item count correction in S17.
