# Review: Reference File Template Convention

**Reviewed**: 2026-02-15
**Proposal**: docs/proposals/REFERENCE_FILE_TEMPLATE_CONVENTION.md
**System docs referenced**: SYSTEM_DESIGN.md (S1, S16, S17), docs/pipeline-concepts.md
**Research doc**: docs/research/R-003-REFERENCE_FILE_TEMPLATE_CONVENTION.md

## Summary

This proposal standardizes the internal structure of all 35 reference files across Clarity
Loop's 4 skills by adding YAML frontmatter, Variables tables, and consistent section
organization. It introduces a two-tier model (Structured for 15 deterministic modes, Guided
for 20 judgment-driven modes) and migrates all files in a single pass. The proposal also
corrects a file inventory discrepancy in SYSTEM_DESIGN.md (31 listed vs. 35 actual). The
change is purely structural — no behavioral modifications.

The proposal is well-structured with clear traceability to R-003, solid design decisions,
and good before/after examples. A few ground truth issues and design gaps need addressing
before merge.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Correction-mode Tier Assignment Is Wrong

- **Dimension**: Internal Coherence / Ground Truth
- **Where**: Change Manifest #20 — correction-mode.md assigned Tier 1: Structured
- **Issue**: The proposal assigns correction-mode to Tier 1 (Structured), but the actual
  file has a mixed structure. It starts with a "When to Use Corrections (vs. Full Pipeline)"
  decision section with bulleted heuristics, followed by an "Inputs" section with a source
  finding table, and only then has Steps. The first half of the file is judgment-driven
  guidance about *when* to use corrections, not a deterministic pipeline. This is a
  borderline file that fits Tier 2 better — it has a clear decision-making phase before
  its mechanical steps.
- **Why it matters**: Forcing correction-mode into Tier 1's rigid Workflow structure would
  either lose the "When to Use" judgment guidance or awkwardly shoehorn it into a Variables
  table. The file's value is partly in helping the agent decide whether to use correction
  mode at all.
- **Suggestion**: Reassign correction-mode.md to Tier 2: Guided. This changes the count to
  14 Tier 1 / 21 Tier 2. The mechanical steps (build manifest, approve, apply, spot-check)
  become phases within the Tier 2 Process section, and the "When to Use" guidance becomes
  part of the Guidelines section.

### 2. Changes 8–42 Lack Per-File Detailed Design

- **Dimension**: Completeness & Gaps
- **Where**: Detailed Design, "Changes 8–42: Reference File Reformats" section
- **Issue**: The proposal provides transformation patterns (4-step for Tier 1, 5-step for
  Tier 2) and two before/after examples (merge-mode, audit-mode), but all 35 individual
  file reformats are covered by a single generic section. The merge plan in the proposal
  says "preserving all existing instructions" and "[...remaining phases follow same pattern]"
  — but the actual merge operator needs to know what specific Variables to extract from each
  file, what Phases to create, and what Report variants to define.
- **Why it matters**: During the merge step, whoever executes these 35 reformats will need
  to make judgment calls about each file's structure. Without per-file design, two different
  sessions could produce different reformats of the same file — which is exactly the variance
  problem this proposal aims to solve.
- **Suggestion**: This doesn't need to be 35 detailed designs in the proposal (that would
  make it 3000+ lines). Instead: (a) add 2 more before/after examples covering different
  file types — a Rules/Checklist file (e.g., design-checklist.md) and a Template file (e.g.,
  research-template.md) — so all 5 structural patterns from Finding 1 have coverage, and
  (b) add a section stating that per-file Variable extraction and Phase structure will be
  determined during migration by the executing agent, following the patterns and examples
  in the proposal. This makes the migration contract explicit rather than implicit.

### 3. Frontmatter `inputs`/`outputs` Overlap with Variables Table

- **Dimension**: Internal Coherence
- **Where**: Finding 3 frontmatter design, Finding 4 Variables convention
- **Issue**: The frontmatter has `inputs` and `outputs` fields listing high-level names
  (e.g., `proposal`, `latest-review`), and the Variables table also lists inputs with full
  detail. This creates two sources of truth for "what does this mode need?" The proposal
  acknowledges frontmatter-body drift as a risk but doesn't resolve the redundancy.
- **Why it matters**: If someone adds a Variable to the table but forgets to update
  frontmatter `inputs`, the quick-scan from frontmatter becomes misleading. Two places
  stating the same thing will drift.
- **Suggestion**: Either (a) remove `inputs`/`outputs` from frontmatter and rely solely on
  the Variables table for input declaration (frontmatter keeps `mode`, `tier`, `depends-on`,
  `state-files` — 4 fields instead of 6), or (b) explicitly state that frontmatter
  `inputs`/`outputs` are a summary-level index and the Variables table is the authoritative
  source, and define a rule for keeping them in sync. Option (a) is simpler and eliminates
  the drift risk entirely.

## Non-Blocking Suggestions

### 1. Pencil Files May Not Need Variables Tables

The proposal's Open Item #2 asks whether pencil-templates.md and pencil-schema-quick-ref.md
need Tier 2 treatment. Having read pencil-templates.md, it's 1,107 lines of copy-paste code
blocks with no workflow, no inputs, and no outputs. Adding frontmatter with `mode: templates`
and an empty Variables table would be misleading — this file isn't a mode, it's a reference
data file consulted by other modes.

**Suggestion**: Consider a "Tier 0: Reference Data" designation for pure data files that
have no workflow. These would get frontmatter (for discoverability) but skip Variables,
Guidelines/Workflow, and Output sections entirely. Alternatively, just add frontmatter
and leave the body untouched — the tier field can be `reference` instead of `structured`
or `guided`. This is a minor point that doesn't block the proposal.

### 2. Warmth Gradient Alignment

SYSTEM_DESIGN.md S16 defines a warmth gradient from Warm (bootstrap, research) to Cool
(verification, review). The two-tier model maps well to this: Tier 2 (Guided) covers the
warm end, Tier 1 (Structured) covers the cool end. The proposal could explicitly reference
this alignment to strengthen the rationale for two tiers.

### 3. SYSTEM_DESIGN.md Change 1 Insertion Point

The proposal says "after Plugin Structure diagram" but should be more precise. The current
S1 flow is: Plugin Structure diagram → Created Directory Structure diagram → Skill
Responsibilities table. The new "Reference File Convention" subsection would fit best
between the Created Directory Structure diagram and the Skill Responsibilities table, as
it describes how the files within that structure are organized internally.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| SYSTEM_DESIGN.md | ⚠️ Tension | S17 file inventory needs correction (acknowledged in proposal). The new Reference File Convention section is additive and consistent with S1's plugin structure description. |
| pipeline-concepts.md | ✅ Consistent | New section is additive. Existing concepts (pipeline depth, protection, manifest) are unaffected. |
| SYSTEM_DESIGN.md S16 (Warmth Gradient) | ✅ Consistent | Two-tier model aligns with the warm-to-cool gradient. Tier 2 covers warm modes, Tier 1 covers cool modes. Not referenced but compatible. |
| Existing reference files | ✅ Consistent | Spot-checked merge-mode.md, correction-mode.md, audit-mode.md, pencil-templates.md, component-identification-process.md. Proposal's "Current" descriptions are factually accurate for all except correction-mode's tier assignment (blocking issue #1). |

## Strengths

1. **The two-tier model is well-justified.** The distinction between deterministic pipeline
   modes and judgment-driven modes is real and maps cleanly to the existing file patterns.
   The research's exhaustive file-by-file tier assignment table is thorough.

2. **All-at-once migration eliminates the mixed-state risk.** The user's feedback to avoid
   waves was the right call, and the proposal incorporated it cleanly.

3. **Before/after examples are concrete.** The merge-mode and audit-mode examples show
   exactly what the transformation looks like for both tiers. The Variables table design is
   practical — the 4-column format answers the right questions.

4. **The inventory correction is valuable.** Catching the 4 missing cl-designer files in
   SYSTEM_DESIGN.md S17 is a real accuracy improvement.

5. **Design decisions table is comprehensive.** 8 decisions with alternatives and rationale.
   The audit-mode Tier 2 assignment decision is particularly well-reasoned.

## Risk Assessment

The proposal's risk table covers the main risks well. One additional risk worth noting:

**Agent token overhead from Variables tables**: Adding a Variables table (~10-20 lines) to
each of 35 files adds roughly 350-700 lines of new content across the plugin. Since only
1-3 reference files are loaded per mode invocation, the per-invocation cost is small
(~150-300 additional tokens). This is acceptable but should be monitored — if reference
files grow further (from R-004 Report sections, R-005 fan-out patterns), the cumulative
token pressure could become noticeable.

No significant unaddressed risks beyond this.
