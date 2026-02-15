# Proposal: Guided Autonomy Execution Model (Revised)

**Created**: 2026-02-12 (revised 2026-02-13)
**Status**: Draft
**Research**: docs/research/PIPELINE_EXECUTION_MODEL.md
**Author**: User + AI researcher

## Summary

This proposal adds an execution model to the Clarity Loop pipeline. Today, the pipeline has
29 modes across 4 skills but no overarching guidance: after bootstrap, users face a blank
canvas with no map and no signal for when to stop researching and start building.

The revised proposal is simpler than the first attempt. It has three pillars:

1. **File rationalization** — Normalize tracking files using database design principles.
   Eliminate STATUS.md as a runtime artifact (skills read source files directly). Replace
   Emerged Concepts with a dedicated PARKING.md. Merge IMPLEMENTATION_PROGRESS into TASKS.md.
   Establish a consistent naming convention.

2. **Intent-driven UX** — Add intent detection (Ship/Quality/Rigor/Explore) at bootstrap.
   Make guidance concrete at 4 moments: post-bootstrap orientation, session start, transition
   advisory before spec/start, and "what next?" suggestions. No new mechanisms — just better
   instructions in skill files about what to say when.

3. **Cross-cutting protocols** — Parking protocol for all skills (classify and capture
   findings without derailing work). Loop calibration (lightweight vs full pipeline cycles).
   Review convergence tracking. Consistent source file writes.

What was removed from the first proposal: the pulse log (source files are the activity
record), STATUS.md expansion (eliminated instead), stigmergic decay complexity (simple
active/resolved sections instead), and the snapshot generation script (replaced by direct
source file reads).

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/PIPELINE_EXECUTION_MODEL.md | F1-F10, Themes A/B/C | Guided Autonomy (Model D) with 11 design decisions (D1-D11) |
| docs/research/PIPELINE_UX_PATTERNS.md | Patterns 1-7 (editable intermediates, status as side effect, track uncertainty, CQRS, minimum viable state, autonomous checkpoints, staleness signals) | Informed D7 (rationalization), D8 (concrete UX), D9 (growth) |

## System Context

### Research Type: Evolutionary

This proposal evolves the existing pipeline by adding cross-skill coordination, file
rationalization, and intent-driven guidance. No new skills or fundamental architectural
changes — the core skill/mode/reference structure remains intact.

### Current State

| Artifact | Current State Summary | Sections Referenced |
|----------|----------------------|-------------------|
| templates/status.md | 3 sections: Pipeline State, Research Queue, Emerged Concepts. Skills read at session start but write inconsistently (14 major gaps). | Full file (36 lines) |
| skills/cl-researcher/SKILL.md | Session start reads STATUS.md. No intent concept. Emerged concepts tracked in research mode only. | Session Start, Guidelines |
| skills/cl-researcher/references/bootstrap-guide.md | Step 6 presents a comprehensive pipeline overview (~80 lines) with project-type-specific guidance. No intent inference. STATUS.md referenced in scaffold check (~line 33) and update step (~line 466). | Step 2 (Discovery), Step 6 (Clean Up) |
| skills/cl-designer/SKILL.md | Session start reads STATUS.md. Design modes have conditional STATUS.md writes ("if it tracks design state"). | Session Start, Guidelines |
| skills/cl-implementer/SKILL.md | Session start checks DECISIONS.md. No readiness advisory before spec or start modes. | Session Start, Mode detection |
| skills/cl-implementer/references/*.md | IMPLEMENTATION_PROGRESS.md tracks session state separately from TASKS.md. | start-mode, run-mode, verify-mode |
| skills/cl-reviewer/SKILL.md | Session start reads STATUS.md. Review modes don't track convergence metrics. | Session Start, Mode detection |
| All skill references touching STATUS.md | 14 major gaps in write operations (Finding 8). | See Finding 8 gap table |

### Proposed State

After this proposal:
- STATUS.md eliminated as runtime artifact. Skills read 2-3 source files directly.
- PARKING.md replaces Emerged Concepts with classification and active/resolved sections.
- Research Queue lives in RESEARCH_LEDGER.md.
- IMPLEMENTATION_PROGRESS.md merged into TASKS.md.
- Bootstrap infers and confirms project intent (Ship/Quality/Rigor/Explore).
- Post-bootstrap message is intent-aware and project-specific.
- Session start gives 2-3 sentence orientation from source files.
- Transition advisory at spec/start modes shows area coverage, calibrated by intent.
- All skills can park findings with classification during any mode.
- Lightweight loops formally supported with risk-driven sizing.
- Review rounds track convergence metrics with intent-calibrated thresholds.
- Consistent naming convention across all artifact directories.
- Optional `generate-status.js` script for human-readable dashboard on demand.

## Change Manifest

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Create PARKING.md template with active/resolved sections and classification | templates/parking.md | (new file) | Add Doc | F5, F6, D2, D9 |
| 2 | Remove Emerged Concepts section from STATUS.md template | templates/status.md | Emerged Concepts | Remove | D2, D7 |
| 3 | Remove Pipeline State metrics that duplicate other files | templates/status.md | Pipeline State | Remove | F9, D7 |
| 4 | Move Research Queue section to RESEARCH_LEDGER.md template | templates/research-ledger.md | (new section) | Add Section | D7 |
| 5 | Add Session Log section to TASKS.md to absorb IMPLEMENTATION_PROGRESS tracking | cl-implementer/references/*.md | Task file format | Modify | D7, D9 |
| 6 | Merge IMPLEMENTATION_PROGRESS.md into TASKS.md | cl-implementer/SKILL.md + references/start-mode + run-mode + autopilot-mode + verify-mode + sync-mode + governance-checks | Progress tracking, status mode, implementation state check, L1 assumption scanning | Modify | D7 |
| 7 | Add naming convention to all skills' file creation steps | All SKILL.md / references | File creation | Modify | D11 |
| 8 | Add intent inference to bootstrap discovery | cl-researcher/references/bootstrap-guide.md | Step 2 (Discovery) | Add | F3, D3 |
| 9 | Add intent-aware post-bootstrap message | cl-researcher/references/bootstrap-guide.md | Step 6 (Clean Up) | Modify | D3, D8 |
| 10 | Add intent recording in DECISIONS.md | cl-researcher/references/bootstrap-guide.md | Step 6 (Clean Up) | Modify | D3 |
| 11 | Add intent concept to researcher SKILL.md | cl-researcher/SKILL.md | Guidelines | Add | F3, D3 |
| 12 | Update session-start to read source files (not STATUS.md) in all 4 skills | All SKILL.md | Session Start | Modify | D1, D7 |
| 13 | Add session-start orientation protocol | All SKILL.md | Session Start | Add | D8 |
| 14 | Add transition advisory to implementer spec mode | cl-implementer/SKILL.md or references/spec-mode.md | Spec mode entry | Add | F7, D8 |
| 15 | Add transition advisory to implementer start mode | cl-implementer/SKILL.md or references/start-mode.md | Start mode entry | Add | F7, D8 |
| 16 | Add parking protocol to all 4 SKILL.md files | All SKILL.md | Guidelines | Add | F5, D2, D10 |
| 17 | Standardize source file writes across all skill references | All references/*.md | Mode completion steps | Modify | F8, D7 |
| 17b | Remove or redirect all STATUS.md references across skills and templates | All SKILL.md, All references/*.md, research-template.md | Session Start, Guidelines, Folder Structure, mode completion steps | Modify | D1, D7 |
| 18 | Add loop calibration protocol | cl-researcher/SKILL.md | Guidelines | Add | D4 |
| 19 | Add convergence tracking to reviewer re-review | cl-reviewer/SKILL.md or references/re-review-mode.md | Re-review process | Add | D6 |
| 20 | Add parking hygiene to reviewer audit mode | cl-reviewer/references/audit-mode.md | Audit analysis | Add | D5 |
| 21 | (optional) Create generate-status.js script spec | scripts/generate-status.js | (new file) | Add Doc | D7 |
| 22 | Update research template Emerged Concepts section to reference PARKING.md | cl-researcher/references/research-template.md | Emerged Concepts | Modify | D2 |

**Scope boundary**: This proposal ONLY modifies the docs/sections listed above. It does
NOT change: individual mode internals, MCP tool interactions, the hook system, the
protection model, or the init script scaffolding logic.

## Detailed Design

### Phase 1: File Rationalization (Changes 1-7)

This phase normalizes the tracking file landscape. Must be completed before Phase 2 —
skills need to know which files to read/write.

#### PARKING.md Template (Change 1)

**What**: Create `templates/parking.md` with the structure from D2.

```markdown
# Parking Lot

Findings, gaps, and ideas that surfaced during pipeline work. Classified by impact.
Skills check Active section before parking new items to prevent duplicates.

## Active

| # | Concept | Classification | Origin | Date | Impact | Notes |
|---|---------|---------------|--------|------|--------|-------|

## Resolved

| # | Concept | Classification | Origin | Date | Resolution | Resolved Date |
|---|---------|---------------|--------|------|------------|---------------|

**Classification**: `architectural` (blocks progress) | `incremental` (can wait) |
`scope-expansion` (new feature idea)
**Resolution**: `resolved` | `scoped` (moved to research queue) | `deferred` | `discarded`
**Lifecycle**: Items live in Active until acted on, then move to Resolved with a resolution type.

<!-- clarity-loop-managed -->
```

**Why**: D2 — dedicated file with clear ownership replaces the Emerged Concepts section
that was embedded in STATUS.md. Active/resolved split (D9) keeps the hot section small.

#### STATUS.md Simplification (Changes 2-3)

**What**: Remove the Emerged Concepts section (moved to PARKING.md) and the Pipeline State
metrics that duplicate other files (active research count → in RESEARCH_LEDGER, proposal
count → in PROPOSAL_TRACKER). What remains is a minimal file — or STATUS.md can be
eliminated from the template entirely, replaced by the optional generate-status.js script.

**Recommendation**: Eliminate STATUS.md from the template. It served as a dashboard that
skills read at session start, but skills will now read source files directly (D7). An
optional `generate-status.js` script can produce a dashboard for humans on demand.

If kept, STATUS.md should contain ONLY the intent field (which also lives in DECISIONS.md)
and nothing else. No counts, no lists, no sections that duplicate source files.

#### Research Queue Migration (Change 4)

**What**: Move the Research Queue table from STATUS.md to RESEARCH_LEDGER.md as a new
section at the top. Research planning and research tracking belong in the same file.

**Current** (in templates/status.md):
> Research Queue table with Priority, Topic, Type, Depends On, Notes columns.

**Proposed** (in templates/research-ledger.md, new section before Active Research):
```markdown
## Research Queue

Recommended order for upcoming research. Adaptive — reorder based on new
information, dependencies, or priority changes.

| Priority | Topic | Type | Depends On | Notes |
|----------|-------|------|-----------|-------|
```

#### TASKS.md Absorbs IMPLEMENTATION_PROGRESS (Changes 5-6)

**What**: Merge the session state tracking from IMPLEMENTATION_PROGRESS.md into TASKS.md.
TASKS.md becomes the single implementation tracking file with task definitions, status,
and a session log section.

**Why**: D7 — these two files track the same domain (implementation) and can drift.
Merging eliminates the overlap.

**Proposed TASKS.md structure**:

TASKS.md already uses an Area-based grouping (e.g., `## Area: Data Layer`), a Dependency
Graph (Mermaid flowchart), and per-task metadata blocks (spec reference, spec hash,
dependencies, status, source, acceptance criteria). This proposal does NOT change that
existing structure. It adds a Session Log section at the end:

```markdown
# Implementation Tasks

## Area: [name]
(existing structure — task blocks with metadata, unchanged)

## Area: [name]
(existing structure — task blocks with metadata, unchanged)

## Dependency Graph
(existing Mermaid graph, unchanged)

## Session Log
| Date | Session | Tasks Touched | Spec Gaps Found | Files Modified |
|------|---------|--------------|-----------------|----------------|
```

The Session Log absorbs what IMPLEMENTATION_PROGRESS.md currently tracks: per-session
state, spec gaps discovered during implementation, and files modified. The existing
Area/task/metadata structure remains intact.

The specific merge points:

**cl-implementer/SKILL.md** (4 references to update):
- Line ~94: Implementation state check reads IMPLEMENTATION_PROGRESS.md → read TASKS.md Session Log instead
- Line ~183: Start Mode description says "Creates IMPLEMENTATION_PROGRESS.md" → "Updates TASKS.md Session Log"
- Line ~231: Status Mode reads "from TASKS.md and IMPLEMENTATION_PROGRESS.md" → "from TASKS.md"
- Line ~251: Status Mode description mentions IMPLEMENTATION_PROGRESS.md → remove reference

**cl-implementer/references/*.md** (6 reference files):
- start-mode: creates TASKS.md instead of both TASKS.md and IMPLEMENTATION_PROGRESS.md (3 refs: lines ~363, ~394, ~396)
- run-mode: updates TASKS.md task status and session log (10 IMPLEMENTATION_PROGRESS refs throughout — significant scope)
- autopilot-mode: merges results into TASKS.md (line ~311)
- verify-mode: reads TASKS.md for completion status (2 refs: lines ~169, ~234)
- sync-mode: reconciles TASKS.md (2 refs: lines ~130, ~140)
- governance-checks.md: scans TASKS.md for L1 assumptions (line ~59)

#### Naming Convention (Change 7)

**What**: Update file creation steps across all skill references to use the normalized
naming convention from D11.

| Directory | Pattern | Example |
|-----------|---------|---------|
| docs/research/ | `R-NNN-TOPIC.md` | `R-001-PIPELINE_EXECUTION_MODEL.md` |
| docs/proposals/ | `P-NNN-TOPIC.md` | `P-001-GUIDED_AUTONOMY.md` |
| docs/reviews/proposals/ | `REVIEW_P-NNN_vN.md` | `REVIEW_P-001_v1.md` |
| docs/reviews/proposals/ | `VERIFY_P-NNN.md` | `VERIFY_P-001.md` |
| docs/reviews/audit/ | `AUDIT_YYYY-MM-DD.md` | `AUDIT_2026-02-12.md` |
| docs/reviews/design/ | `DESIGN_REVIEW_YYYY-MM-DD.md` | `DESIGN_REVIEW_2026-02-12.md` |

Rules: SCREAMING_SNAKE_CASE. Content files get sequential ID prefixes. IDs use hyphens,
names use underscores. Singleton tracking files don't need IDs.

ID allocation: RESEARCH_LEDGER assigns R-NNN when creating research docs. PROPOSAL_TRACKER
assigns P-NNN when creating proposals.

**Merge targets** for naming convention updates: In addition to the file creation steps
in skill reference files (research-mode.md, proposal generation, review/verify/audit
filename generation), update these two templates that already have filename convention
sections:

- `cl-researcher/references/research-template.md` (lines 7-16): Currently uses
  `R-NNN-slug.md` with **lowercase-hyphen** slugs (e.g., `R-001-memory-layer.md`).
  Change to SCREAMING_SNAKE_CASE (e.g., `R-001-MEMORY_LAYER.md`). Update examples.
- `cl-researcher/references/proposal-template.md` (lines 53-63): Currently uses
  `P-NNN-slug.md` with **lowercase-hyphen** slugs (e.g., `P-001-memory-system-v2.md`).
  Change to SCREAMING_SNAKE_CASE (e.g., `P-001-MEMORY_SYSTEM_V2.md`). Update examples.

This is a **modification** of existing conventions, not an addition — both templates
already define naming patterns. The merge must update the convention text AND all examples.

**Dependencies**: None — this is Phase 1.

---

### Phase 2: Intent & UX (Changes 8-15)

This phase makes "guided autonomy" a concrete user experience, not an abstract concept.

#### Intent Detection at Bootstrap (Changes 8-10)

**What**: During bootstrap discovery, the AI infers the user's project intent from
conversational signals and confirms it explicitly. Intent is recorded in DECISIONS.md.

**Target: cl-researcher/references/bootstrap-guide.md, Step 2 (Discovery)**

Insert between the end of Step 2's discovery conversation (~line 146: "Don't rush — the
quality of initial docs depends on getting the picture right.") and the start of Step 2b:
Project Profile Detection (~line 148). Intent is inferred from the discovery conversation
before profile detection and stack validation begin:

```markdown
#### Intent Inference

From the discovery conversation, infer the user's project intent:

| Signal | Inferred Intent |
|--------|----------------|
| "deadline," "demo," "weekend project," "prototype" | **Ship** |
| "production," "users," "scale," "maintain," "team" | **Quality** |
| "HIPAA," "compliance," "audit," "regulated" | **Rigor** |
| Exploring a problem, no clear build target | **Explore** |

Present the inference conversationally:

"From what you've described — [reflect key signals] — this sounds like a **[intent]**
project. That means [what it implies for the pipeline]. Sound right?"

Record in defaults sheet with source `[from discovery]`. If the user doesn't confirm
or changes intent later, update the entry.
```

**Target: cl-researcher/references/bootstrap-guide.md, Step 6 (Clean Up)**

Record intent as a Decision in DECISIONS.md with Pipeline Phase = `meta`.

#### Intent-Aware Post-Bootstrap Message (Change 9)

**What**: Replace the generic one-liner completion message with an intent-aware,
project-specific orientation.

**Current**: Step 6 presents a multi-section pipeline overview (~80 lines) covering
available modes, when to use each, and project-type-specific guidance. It's comprehensive
but generic — not calibrated to what the user actually said during discovery. The goal is
NOT to shorten it but to make it intent-aware so the overview prioritizes what matters
for this specific project.

**Proposed** (in bootstrap-guide.md Step 6, completion message):

```markdown
#### Post-Bootstrap Orientation

Based on confirmed intent, present the pipeline overview:

**Ship**:
"Bootstrap complete. [N] system docs ready. Since you're shipping fast, I'd suggest
going straight to specs — `/cl-implementer spec`. [If UI features in PRD: 'If you
want UI mockups first, try `/cl-designer setup`.']"

**Quality**:
"Bootstrap complete. [N] system docs ready. For a production build, I'd recommend:
1. [If UI features: `/cl-designer setup` — design your UI]
2. `/cl-researcher research '[highest-priority topic]'` — [why]
3. [Other relevant research topics]
When you're satisfied, `/cl-implementer spec` to generate specs."

**Rigor**:
"Bootstrap complete. [N] system docs ready. For compliance, several areas need deep
research before implementation: [list based on project type]. I'd start with
`/cl-researcher research '[most critical topic]'`."

**Explore**:
"Bootstrap complete. [N] system docs capture what we know. Since you're exploring,
what aspect interests you most? I can research any topic in depth."
```

#### Intent Concept in Researcher Guidelines (Change 11)

**What**: Add to cl-researcher/SKILL.md Guidelines section, a new guideline entry:

```markdown
- **Respect project intent.** The user's confirmed intent (Ship/Quality/Rigor/Explore,
  recorded in DECISIONS.md) calibrates how you work. Ship intent means bias toward action —
  don't suggest extensive research when the user wants to build. Rigor intent means bias
  toward thoroughness — flag gaps even if they seem minor. Quality is the default balance.
  Explore means follow curiosity — don't push toward implementation. If intent isn't set
  yet (pre-bootstrap or intent not recorded), default to Quality behavior.
```

This guideline ensures the researcher's behavior across ALL modes (not just bootstrap)
respects the intent calibration. It's referenced by Changes 8-9 (bootstrap) and Change 18
(loop calibration) but applies globally.

#### Session-Start Orientation (Changes 12-13)

**What**: Update all 4 SKILL.md files to (a) read source files directly instead of
STATUS.md, and (b) give a brief orientation at session start.

**Session Start — source file reads** (Change 12):

The change for each skill is: **remove the STATUS.md bullet** from the existing tracking
file read list and **add a PARKING.md bullet**. Do NOT replace the entire list — preserve
all existing reads that aren't STATUS.md.

| Skill | Current Reads | Action |
|-------|--------------|--------|
| cl-researcher | RESEARCH_LEDGER, PROPOSAL_TRACKER, STATUS.md, DECISIONS.md | Remove STATUS.md bullet, add PARKING.md bullet |
| cl-designer | STATUS.md, PROPOSAL_TRACKER, DECISIONS.md (+ DESIGN_PROGRESS in step 3) | Remove STATUS.md bullet, add PARKING.md bullet. Keep PROPOSAL_TRACKER. |
| cl-implementer | DECISIONS.md (no STATUS.md) | Add TASKS.md and PARKING.md bullets |
| cl-reviewer | PROPOSAL_TRACKER, RESEARCH_LEDGER, STATUS.md, DECISIONS.md | Remove STATUS.md bullet, add PARKING.md bullet. Keep RESEARCH_LEDGER. |

**Session Start — orientation** (Change 13):

cl-researcher and cl-reviewer already have "Orient the user" steps in their Session Start
sections (cl-researcher ~lines 130-137: summarize active research, suggest proposals;
cl-reviewer ~lines 149-155: mention in-review proposals, suggest merge/verify). This change
**augments** those existing steps with PARKING.md awareness and decision context — it does
NOT replace them. The existing skill-specific orientation content stays; the new protocol
adds cross-cutting context from PARKING.md and DECISIONS.md.

For cl-designer, this is a new addition — it has no orientation step. For cl-implementer,
there is a minimal existing step at ~line 102 (`Orient the user — briefly note any issues
found`) which this change **expands** with PARKING.md awareness and decision context.

Add to all 4 SKILL.md files in the Session Start section:

```markdown
### Orientation

After reading source files, give a 2-3 sentence orientation:
- What's the current state? (e.g., "3 research cycles complete, 1 in review")
- Any architectural items parked? (from PARKING.md active section)
- What was the last significant decision? (from DECISIONS.md)

Keep it brief. The user will say what they want to do.
```

#### Transition Advisory (Changes 14-15)

**What**: Add a readiness check before cl-implementer spec and start modes.

**Target: cl-implementer spec mode entry**

```markdown
#### Transition Advisory

Before checking gates, read PARKING.md and DECISIONS.md:

1. Filter PARKING.md Active section for `architectural` items. If any:
   "⚠️ [N] architectural items parked: [list]. These may affect spec generation."

2. Check intent (from DECISIONS.md):
   - Ship: proceed unless architectural blockers exist
   - Quality: mention areas without deliberate decisions
   - Rigor: highlight all gaps

3. Never block. The user can always say "proceed."
```

Same pattern for start mode, but lighter (specs already exist): check PARKING.md for
architectural items but skip intent-calibrated messaging since the user is already past
the spec gate.

**Integration with existing pre-checks**: start-mode.md already has a Step 1: Pre-Checks
section with 5 checks presented as a batch: (1) specs exist, (2) spec review done,
(3) git repository, (4) spec coverage, (5) context freshness. The transition advisory
should be integrated as check 6 in this existing batch — not presented as a separate
dialogue. Similarly, spec-mode.md has a Step 1: Waterfall Gate Check with 4 checks
(active research, in-flight proposals, unverified merges, context freshness) and a batch
presentation table. The advisory integrates into these existing check flows rather than
creating a new UX pattern.

**Dependencies**: Phase 1 (skills must know which files to read).

**Merge ordering note**: Change 12 (session-start reads) removes STATUS.md from session
start in Phase 2, but Change 17b (full STATUS.md reference removal) is in Phase 3. This
means after Phase 2 but before Phase 3, skills will no longer read STATUS.md at session
start but may still reference it in other contexts (folder structure diagrams, mode
completion steps). This is acceptable — the remaining references are write instructions
to a file that's already being ignored at read time, and they're cleaned up in Phase 3.
However, during merge, Phase 2 and Phase 3 should be applied in the same pass to avoid
a window where write instructions point to an unread file.

---

### Phase 3: Cross-Cutting Protocols (Changes 16-20)

#### Parking Protocol (Change 16)

**What**: Add to all 4 SKILL.md files in Guidelines. In cl-researcher, this **replaces**
the existing "Capture emerged concepts immediately" guideline (currently at ~line 524-526:
"Ideas that surface during research but aren't the current topic should be captured in both
the research doc and STATUS.md right away. Don't wait — they'll be forgotten."). The parking
protocol is a superset of that guideline — it captures the same intent (don't lose ideas)
but adds classification, deduplication, and PARKING.md as the destination instead of STATUS.md.

In the other 3 skills, this is a new addition — they don't currently have an equivalent
guideline.

```markdown
### Parking Protocol

When a finding surfaces during any mode that is NOT the current focus:

1. **Check first**: Read PARKING.md active section. If a similar item exists,
   add context to it rather than creating a duplicate.

2. **Classify**: `architectural` (blocks progress) | `incremental` (can wait) |
   `scope-expansion` (new feature idea). Default to `incremental` if uncertain.

3. **Record** in PARKING.md → Active section:
   - Assign next EC-NNN ID
   - Fill all columns (Concept, Classification, Origin, Date, Impact, Notes)

4. **Tell the user**: "Found [classification] issue: [brief]. Parked as EC-NNN."
   If architectural: "This may affect implementation — I'll flag it at spec/start."

5. **Continue current work.** Don't derail.
```

#### Source File Write Consistency (Change 17)

**What**: Audit all reference files and ensure every mode that completes work writes to
its primary source file. This is the reframed version of Finding 8's "14 major gaps" —
instead of fixing STATUS.md writes, fix source file writes.

Specific gaps to close:

| Skill | Mode | Should Write To | Currently Missing |
|-------|------|----------------|-------------------|
| cl-researcher | research completion | RESEARCH_LEDGER.md (update status) | Partial — only emerged concepts |
| cl-researcher | proposal generation | PROPOSAL_TRACKER.md (add entry) | Yes — no tracker update |
| cl-designer | setup/tokens/mockups/build-plan | DESIGN_PROGRESS.md (update phase) | Conditional — "if it tracks" |
| cl-implementer | run/autopilot | TASKS.md (update task status) | Partial |
| cl-implementer | verify | TASKS.md (mark verified) | Missing |
| cl-reviewer | review/re-review | PROPOSAL_TRACKER.md (update status) | Missing |
| cl-reviewer | merge | PROPOSAL_TRACKER.md (move to merged) | Missing |

Each gap needs a specific fix in the corresponding reference file's completion step.

#### STATUS.md Reference Removal (Change 17b)

**What**: With STATUS.md eliminated, every reference to it across skill files must be
removed or redirected. Change 12 handles session-start reads; Change 16 handles emerged
concepts writes via the parking protocol. Change 17b covers everything else.

Complete inventory of STATUS.md references to update:

**Note**: This inventory covers references NOT handled by Change 12 (session-start reads)
or Change 16 (emerged concepts → parking protocol). Those changes handle their own
STATUS.md references. This table covers everything else.

| # | File | Reference | Action |
|---|------|-----------|--------|
| 1 | cl-researcher/SKILL.md (Folder Structure) | `STATUS.md # High-level dashboard` | Remove from folder structure diagram; add PARKING.md |
| 2 | cl-researcher/SKILL.md (Guidelines) | "Update RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md, STATUS.md, and DECISIONS.md" | Remove STATUS.md from the list |
| 3 | cl-researcher/SKILL.md (Guidelines) | "captured in both the research doc and STATUS.md right away" | Replace with "captured in both the research doc and PARKING.md" (this guideline is also replaced by Change 16's parking protocol) |
| 4 | cl-researcher/references/bootstrap-guide.md (Step 6) | "Update docs/STATUS.md — note that bootstrap was completed" | Remove — bootstrap completion is tracked by the existence of system docs |
| 5 | cl-researcher/references/bootstrap-guide.md (scaffold check, ~line 33) | Scaffold check lists `docs/STATUS.md` as one of the tracking files | Replace with `docs/PARKING.md` in the scaffold check list |
| 6 | cl-researcher/references/research-template.md | Emerged Concepts section: "get added to STATUS.md's emerged concepts table" | Replace with "get added to PARKING.md" (see also Change 22) |
| 7 | cl-researcher/SKILL.md (Research Mode, ~line 383) | "add them to docs/STATUS.md's emerged concepts table" (Phase 5 emerged concepts instruction) | Replace with "add them to PARKING.md per parking protocol". Note: this is in the Research Mode body text, separate from the Guidelines emerged concepts guideline that Change 16 replaces. |
| 8 | cl-researcher/references/context-mode.md | "Update docs/STATUS.md — if Context section exists" | Remove — context state lives in context manifest |
| 9 | cl-reviewer/SKILL.md (Folder Structure) | `STATUS.md # High-level dashboard` | Remove from folder structure diagram; add PARKING.md |
| 10 | cl-reviewer/SKILL.md (Guidelines) | "Update STATUS.md after audits" | Remove — audit date is in the audit report itself |
| 11 | cl-reviewer/references/verify-mode.md (~line 162) | "Update docs/STATUS.md — increment merged proposals count" | Remove — merged count is in PROPOSAL_TRACKER.md |
| 12 | cl-reviewer/references/audit-mode.md (~line 316) | "Update docs/STATUS.md — set Last audit to today's date" | Remove — audit date is in the audit report filename |
| 13 | cl-reviewer/references/audit-mode.md (~line 317) | "add them to STATUS.md's emerged concepts table" | Replace with PARKING.md per parking protocol |
| 14 | cl-reviewer/references/correction-mode.md (~line 144) | "Update STATUS.md — Note that corrections were applied" | Remove — corrections are logged in their own file |
| 15 | cl-reviewer/references/design-review-mode.md (~line 293) | "Update STATUS.md — note the design review date" | Remove — review date is in the review filename |
| 16 | cl-designer/SKILL.md (Folder Structure) | `STATUS.md` | Remove from folder structure diagram; add PARKING.md |
| 17 | cl-designer/references/tokens-mode.md (~line 517) | "Update STATUS.md if it tracks design state" | Remove — design state lives in DESIGN_PROGRESS.md |
| 18 | cl-designer/references/mockups-mode.md (~line 381) | "Update STATUS.md if it tracks design state" | Remove — design state lives in DESIGN_PROGRESS.md |
| 19 | cl-designer/references/build-plan-mode.md (~line 220) | "Update STATUS.md if it tracks design state" | Remove — design state lives in DESIGN_PROGRESS.md |
| 20 | cl-implementer/references/spec-mode.md (~line 269) | "Update STATUS.md — set Specs generated to Yes" | Remove — spec state lives in .spec-manifest.md |

All folder structure diagrams should also add `PARKING.md` where STATUS.md was removed.

#### Loop Calibration (Change 18)

**What**: Add to cl-researcher/SKILL.md, Guidelines:

```markdown
### Loop Calibration

When a parked finding (from PARKING.md) is picked up, assess the loop type:

| Risk Level | Signal | Loop Type | Ceremony |
|------------|--------|-----------|----------|
| Low | Typo, formatting, minor clarification | Direct fix | No ceremony |
| Medium | Single-section update, new edge case | Lightweight | Update + targeted re-review |
| High | Cross-doc impact, architectural change | Full cycle | Research → proposal → review |
| Critical | Fundamental assumption invalidated | Full + advisory | Research + user decision |

Risk = blast radius × reversibility.

Compression: Areas with 2+ full cycles without issues → default risk drops one level.
Deming safeguard: Don't upgrade all loops after a single failure. Only if there's a pattern.
```

#### Convergence Tracking (Change 19)

**What**: Add to cl-reviewer re-review process:

```markdown
#### Convergence Tracking

At each re-review round, compute:
1. Raw blocking issue count
2. Severity-weighted sum of all unresolved blocking issues (Critical=4, Major=2, Minor=1)
3. Contraction ratio (this round's weighted sum / previous round's weighted sum)

If contraction ratio > 1: "Review round [N] found MORE issues than round [N-1].
Fixes may be destabilizing other parts."

After round 3: "Is the problem with the proposal, or the process that produced it?"

Epsilon thresholds — compare the severity-weighted sum against the intent threshold
(from DECISIONS.md). If at or below threshold, the proposal qualifies for APPROVE
even with remaining minor issues. This supplements (does not replace) the existing
verdict criteria — the reviewer still assesses all dimensions, but epsilon provides
a quantitative minimum bar calibrated to project intent:
- Ship: severity-weighted sum ≤ 4 (e.g., up to 2 minor issues or 1 major)
- Quality: severity-weighted sum ≤ 2 (at most 2 minor issues)
- Rigor: severity-weighted sum = 0 (all blocking issues must be resolved)
```

#### Parking Hygiene in Audit (Change 20)

**What**: Add to cl-reviewer audit mode:

```markdown
#### Parking Lot Health

1. Count active items. 0-14: healthy. 15-24: suggest triage. 25+: flag.
2. Architectural items older than 3 days: re-surface with emphasis.
3. Items not referenced since parking: flag as potentially stale.
4. Pull-based check: any active items that a completed mode could have addressed?
```

**Dependencies**: Phase 1 (PARKING.md must exist).

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Intent | Project calibration (Ship/Quality/Rigor/Explore) inferred from conversation, confirmed by user. Affects guidance, thresholds, defaults. | cl-researcher (bootstrap), cl-implementer (advisory), cl-reviewer (epsilon), DECISIONS.md |
| Parking | Recording a finding in PARKING.md with classification for later action, without derailing current work. | All 4 skills |
| Transition advisory | Non-blocking readiness check at spec/start boundaries. | cl-implementer |
| Lightweight loop | Reduced-ceremony pipeline cycle for medium-risk changes. | cl-researcher |
| Convergence tracking | Issue count + severity tracking across review rounds. | cl-reviewer |

### Migration

This proposal does NOT break existing projects.

- Projects with existing STATUS.md: the file stays but skills stop reading it. It becomes
  a stale artifact that can be deleted manually or left as-is.
- Projects without PARKING.md: skills create it on first park operation.
- Existing Emerged Concepts entries: migrate to PARKING.md active section with
  classification defaulting to `scope-expansion`.
- Existing IMPLEMENTATION_PROGRESS.md: content migrated into TASKS.md session log
  section. Original file can be deleted.
- Naming convention: applies to new files only. Existing files are not renamed
  retroactively (would break cross-references).

### Integration Points

Skills now read source files directly instead of a shared STATUS.md. This means:
- Each skill reads 2-3 files (slightly more than reading 1 STATUS.md)
- But each file is always current (no drift from centralized dashboard)
- The coupling between skills shifts from "all read STATUS.md" to "all read DECISIONS.md
  and PARKING.md" — these are shared, the third file is skill-specific

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Eliminate STATUS.md as runtime artifact (D1, D7) | Pulse log in STATUS.md, computed dashboard, write-through cache | Source files can't drift from themselves. No regeneration cost. Skills reading 2-3 files is cheaper than maintaining a shared dashboard. |
| PARKING.md replaces Emerged Concepts (D2) | Extend EC in STATUS.md, split across Decisions + backlog, no parking file | Dedicated file with clear ownership. Active/resolved sections manage growth. Classification enables triage. |
| Infer intent + confirm (D3) | Cold menu, replace presets, infer without confirming | Most natural UX — conversational reflection, always confirmed. |
| Risk-driven loops + compression (D4) | Artifact boundary, experience-only | Risk-driven covers full spectrum. Deming safeguard prevents over-correction. |
| Layered parking hygiene (D5) | Pull-only, age-only, WIP-only | Each mechanism covers a different failure mode. |
| Multi-dimensional convergence (D6) | Count-only, severity-only | Count + severity + Deming catches volume, impact, and structural issues. |
| DB-normalized file schema (D7) | Centralized STATUS.md, CQRS computed views | Each file = one table. No redundant data. No drift. Cheapest read pattern. |
| Four moments of guidance (D8) | Abstract "guided autonomy" mechanisms | Concrete UX at specific moments. No new files needed. |
| Active/resolved sections (D9) | Archiving scripts, rolling windows | Simplest growth management. Convention, not mechanism. |
| IDs as foreign keys (D10) | Content duplication, automated dedup | Normalized references. Check before insert. Lifecycle = state change, not copy. |
| Consistent naming convention (D11) | Status quo | R-NNN/P-NNN prefixes, SCREAMING_SNAKE, consistent across directories. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Skills forget to write to source files | High | Low | Degraded not broken — orientation is less complete, but pipeline still works. Reviewer audit can detect gaps. |
| Intent inference is wrong | Low | Medium | Always confirmed by user. Can change anytime. Wrong intent = slightly miscalibrated suggestions. |
| Transition advisory feels nagging | Low | Medium | Ship intent skips advisory. Others keep it brief — a list, not a lecture. User can always say "proceed." |
| PARKING.md gets large | Medium | Low | Active/resolved sections. WIP limit at 15/25. Architectural override prevents important items from fading. |
| Migration disrupts existing projects | Low | Medium | Non-breaking: skills stop reading STATUS.md, PARKING.md created on demand, naming convention for new files only. |
| Naming convention adoption is uneven | Medium | Low | Applied during merge. Existing files not renamed. Convention documented in each skill's file creation steps. |

## Open Items

1. **Exact placement within reference files**: This proposal specifies WHAT to add but not
   line-level placement. During merge, read each target file and insert at the natural point.

2. **generate-status.js implementation**: Optional human-convenience script. Specification
   in Change 21. Not required for pipeline function — can be deferred.

3. **init.js scaffolding update**: The init script that creates the docs/ directory structure
   should create PARKING.md and place Research Queue in RESEARCH_LEDGER.md instead of STATUS.md.
   This is an implementation detail of the merge, not a system doc change.

4. **CLAUDE.md rule updates**: Rules 8-10 in the project CLAUDE.md reference STATUS.md and
   Emerged Concepts. These need updating to reference PARKING.md and source files. Since
   CLAUDE.md is a skill instruction file (not a system doc), this is a merge detail.

## Appendix: Research Summary

The research (PIPELINE_EXECUTION_MODEL.md) identified 10 findings:

1. **No execution model** — 29 modes, no map connecting them
2. **Industry models** — Linear, Convergence, Continuous, Guided Autonomy (selected)
3. **Intent > type** — Ship/Quality/Rigor/Explore calibrates the pipeline
4. **Emergent readiness** — 6 frameworks confirm readiness is emergent, not prescriptive
5. **Park and proceed** — Zeigarnik Effect + Masicampo 2011: plans neutralize cognitive load
6. **Classify, don't block** — Architectural/incremental/scope-expansion; default incremental
7. **User convergence** — Informed consent; pipeline informs, user decides
8. **STATUS.md gaps** — 14 major write gaps across all skills
9. **Document proliferation** — 23 artifacts with significant overlap; CQRS insight
10. **UX patterns** — 7 patterns from real tools; "guided autonomy" needs concrete UX

Companion research: PIPELINE_UX_PATTERNS.md — patterns from Copilot Workspace, Cursor,
Linear, Shape Up, and Claude Code session memory.

Scientific foundations span cognitive psychology, complexity science, decision theory, and
engineering convergence. 30+ academic references in the research doc.
