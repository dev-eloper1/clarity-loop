# Proposal: Structured Agent Result Protocol

**Created**: 2026-02-18
**Status**: Draft
**Research**: docs/research/R-004-STRUCTURED_AGENT_RESULT_PROTOCOL.md
**Author**: User + AI researcher

## Summary

This proposal introduces a standardized protocol for subagent-to-orchestrator communication
across all 13 dispatch sites in Clarity Loop's four skills. Currently, each dispatch site
describes expected subagent output in ad-hoc prose with no parseable structure. The
orchestrator must interpret natural language reports and manually synthesize unified outputs.

The Structured Agent Result Protocol defines: a four-status taxonomy (CLEAN, FINDINGS,
PARTIAL, ERROR), five result types matching Clarity Loop's dispatch patterns (digest,
consistency, verification, implementation, design-plan), a universal three-section envelope
(summary line + metadata block + detail section), a standardized finding table format, and
mechanical aggregation rules. The protocol extends Bowser's proven `RESULT:` line format for
Clarity Loop's multi-type documentation analysis domain.

The changes are: one new reference file containing the full protocol specification, system
doc updates documenting the protocol as a cross-cutting architectural pattern, and compact
protocol instructions added to all 13 existing dispatch sites.

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-004-STRUCTURED_AGENT_RESULT_PROTOCOL.md | Finding 1 (12 dispatch sites audit), Finding 2 (5 result types), Finding 3 (4-status taxonomy), Finding 4 (summary line format), Finding 5 (finding table format), Finding 6 (envelope), Finding 7 (aggregation rules), Finding 8 (before/after scenarios) | Option A (Universal Envelope) with all findings integrated |
| docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md | Finding 2 (fan-out communication protocol), Finding 6 (report section format) | Bowser's RESULT: line format as the foundation, extended for multi-type results |

## System Context

### Research Type: Net New

This capability does not currently exist. Clarity Loop has 13 subagent dispatch sites with
13 different implicit result formats and zero parseable structure. The protocol standardizes
this communication layer without changing what subagents do — only how they report results.

### Current State

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| SYSTEM_DESIGN.md | S1 describes plugin structure with Reference File Convention subsection but no subagent communication patterns. S12 describes spec generation pipeline with implicit parallel dispatch. S14 describes verification/audit systems with the most complex aggregation needs. S17 lists 9 cl-reviewer reference files. | S1, S12, S14, S17 |
| pipeline-concepts.md | 10 sections covering pipeline depth, system doc protection, manifests, tracking files, context files, emerged concepts, configuration, warmth gradient, directory structure, reference file structure. No section on subagent communication. | Full document |

### What Exists Today

13 dispatch sites across 4 skills, each with ad-hoc prose describing expected outputs:

| Category | Sites | Skills | Current State |
|----------|-------|--------|--------------|
| Content Extraction | 4 | cl-implementer, cl-reviewer | Bullet lists of what to extract; no result structure |
| Consistency Analysis | 4 | cl-reviewer | Lists of what to check; no finding format. Includes dimensions 2-9 general dispatch in audit-mode. |
| Implementation Work | 2 | cl-implementer | "reports: files modified, criteria status, gaps found" |
| Design Planning | 3 | cl-designer | Implicit: layout plans, screenshots, component lists |

### Proposed State

All 13 dispatch sites reference the Structured Agent Result Protocol. Each dispatch site
specifies its result type, and the orchestrator uses the protocol's aggregation rules to
mechanically combine N subagent results into a unified report.

- One new reference file: `skills/cl-reviewer/references/agent-result-protocol.md`
- SYSTEM_DESIGN.md S1: new "Structured Agent Result Protocol" subsection
- pipeline-concepts.md: new "Subagent Communication" section
- All 13 dispatch sites: compact protocol instruction added

## Change Manifest

### System Doc Changes

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Add "Structured Agent Result Protocol" subsection describing the protocol as a cross-cutting architectural pattern — status taxonomy, result types, envelope format, summary line format | SYSTEM_DESIGN.md | S1 Architecture Overview (after Reference File Convention) | Add Section | Findings 1, 2, 3, 4, 6 |
| ~~2~~ | ~~Add protocol cross-reference to S12~~ | ~~SYSTEM_DESIGN.md~~ | ~~S12~~ | ~~Add~~ | **Dropped**: S12 describes pipeline structure, not subagent dispatch. Protocol reference belongs in S1 (cross-cutting) and dispatch sites only. |
| ~~3~~ | ~~Add protocol cross-reference to S14~~ | ~~SYSTEM_DESIGN.md~~ | ~~S14~~ | ~~Add~~ | **Dropped**: S14 describes verification entry points, not dispatch operations. Same rationale as Change 2. |
| 4 | Update file inventory: cl-reviewer goes from 9 to 10 references (add agent-result-protocol.md with tier and purpose) | SYSTEM_DESIGN.md | S17 Complete File Inventory | Modify | — |
| 5 | Add "Subagent Communication" section describing the protocol's role in the pipeline | pipeline-concepts.md | New section (after Reference File Structure, before Related) | Add Section | Findings 2, 6 |

### New Reference File

| # | Change Description | Target File | Type | Research Ref |
|---|-------------------|-----------|------|-------------|
| 6 | Create protocol specification reference file with: status taxonomy, result types, envelope format, summary line formats, finding table format, aggregation rules, severity calibration guide, prompt templates per result type | skills/cl-reviewer/references/agent-result-protocol.md | Add Doc | All findings |

### Dispatch Site Updates

| # | Change Description | Target File | Target Location | Type | Result Type |
|---|-------------------|-----------|----------------|------|------------|
| 7 | Add protocol instruction for parallel doc read dispatch | spec-mode.md | Workflow Phase 2 (doc reads) | Add | digest |
| 8 | Add protocol instruction for parallel task group dispatch | run-mode.md | Process Phase 3 (queue processing, parallel groups) | Add | implementation |
| 9 | Add protocol instruction for parallel execution dispatch | autopilot-mode.md | Process Phase 3 (autonomous task loop, parallel) | Add | implementation |
| 10 | Add protocol instruction for dimensional analysis dispatch | review-mode.md | Workflow (large proposal dimension dispatch) | Add | consistency |
| 11 | Add protocol instruction for parallel review read dispatch | re-review-mode.md | Workflow Phase 1 (load review history) | Add | digest |
| 12 | Add protocol instruction for parallel doc read dispatch | verify-mode.md | Workflow (Step 1, parallel doc reads) | Add | digest |
| 13 | Add protocol instruction for doc pair consistency dispatch | verify-mode.md | Workflow (Part C, cross-doc consistency) | Add | consistency |
| 14 | Add protocol instruction for parallel doc read dispatch | audit-mode.md | Process Phase 1 (load everything) | Add | digest |
| 15 | Add protocol instruction for doc pair consistency dispatch | audit-mode.md | Process Phase 2 (Dimension 1) | Add | consistency |
| 16 | Add protocol instruction for screen planning dispatch | mockups-mode.md | Process Phase 2 (parallel planning) | Add | design-plan |
| 17 | Add protocol instruction for per-screen generation dispatch | mockups-mode.md | Process Phase 2 (per-screen generation) | Add | design-plan |
| 18 | Add protocol instruction for pre-generation dispatch | tokens-mode.md | Process (parallelization hints) | Add | design-plan |
| 19 | Add protocol instruction for dimensions 2-9 parallel analysis dispatch | audit-mode.md | Process Phase 2 (general dimension dispatch, line 81) | Add | varies by dimension |

**Scope boundary**: This proposal ONLY modifies the files listed above. It does NOT
implement fan-out orchestration, change mode logic, or alter what subagents do — only how
they format their results. The orchestrator's internal aggregation logic is documented in
the protocol reference file but not implemented in code.

**Total**: 17 changes across 11 existing files + 1 new file (Changes 2-3 dropped per review)

## Cross-Proposal Conflicts

No conflicts with in-flight proposals. The dispatch sites being updated were reformatted by
the R-003 proposal (Reference File Template Convention), but R-003 is now merged. The
protocol instructions are additive content within existing sections — they don't modify any
structural elements that R-003 established.

## Detailed Design

### Change 1: SYSTEM_DESIGN.md S1 — Structured Agent Result Protocol Subsection

**What**: Add a new subsection after "Reference File Convention" in S1 that documents the
protocol as a cross-cutting architectural pattern.

**Why**: The protocol governs communication across all 4 skills and 13 dispatch sites. It's
an architectural pattern, not a mode-specific concern. Like the Reference File Convention, it
belongs in S1 alongside other cross-cutting patterns. (Research Findings 1, 2, 3, 4, 6.)

**Current** (from SYSTEM_DESIGN.md S1, after Reference File Convention at ~line 126):
> The section moves directly to "Skill Responsibilities" table.

**Proposed** (new subsection before Skill Responsibilities):

> ### Structured Agent Result Protocol
>
> Modes that dispatch subagents (13 dispatch sites across 4 skills) use a standardized
> protocol for result reporting. The protocol ensures mechanical aggregation of parallel
> results without ad-hoc prose interpretation.
>
> **Status taxonomy**: Every subagent result has one of four statuses:
>
> | Status | Meaning | Orchestrator Action |
> |--------|---------|-------------------|
> | CLEAN | Completed, no issues found | Count toward passing total |
> | FINDINGS | Completed, issues enumerated | Aggregate findings by severity |
> | PARTIAL | Incomplete, partial results available | Include with coverage caveat |
> | ERROR | Failed entirely | Log for retry or manual review |
>
> **Result types**: Five types matching Clarity Loop's dispatch patterns:
> `digest`, `consistency`, `verification`, `implementation`, `design-plan`.
>
> **Summary line**: Every result begins with a parseable line:
> `RESULT: <STATUS> | Type: <TYPE> | <type-specific-metrics>`
>
> **Envelope**: Summary line, then metadata block (protocol version, agent, scope, coverage,
> confidence), then type-specific detail section.
>
> **Finding format**: Issues use a standardized table (ID, Severity, Type, Location,
> Counter-location, Description, Suggestion) enabling mechanical deduplication and sorting.
>
> **Aggregation**: Orchestrators collect results, separate by status bucket, merge finding
> tables, deduplicate, and produce unified reports with coverage maps.
>
> See `skills/cl-reviewer/references/agent-result-protocol.md` for the full specification
> including prompt templates and aggregation rules.

### Changes 2-3: Dropped

Changes 2 and 3 originally proposed adding protocol cross-references to SYSTEM_DESIGN.md
S12 and S14. Review finding: these sections describe pipeline structure and verification
entry points at an architectural level — they don't describe subagent dispatch operations.
Adding protocol references to sections that don't mention subagents would create dangling
references. The protocol is fully covered by the S1 cross-cutting subsection (Change 1)
and the dispatch site instructions (Changes 7-18).

### Change 4: SYSTEM_DESIGN.md S17 — File Inventory Update

**What**: Add agent-result-protocol.md to the cl-reviewer reference file table. Update
heading from "9 references" to "10 references". Update totals from "35 references" to
"36 references".

**Why**: New reference file must be reflected in the inventory.

**Current** (from S17):
> `#### cl-reviewer (SKILL.md + 9 references)` — lists 9 reference files
> `### Skills (4 SKILL.md + 35 references)`

**Proposed**:
> `#### cl-reviewer (SKILL.md + 10 references)` — adds row:
> `| agent-result-protocol.md | Guided | Structured result protocol: status taxonomy, result types, envelope, finding format, aggregation rules, prompt templates |`
> `### Skills (4 SKILL.md + 36 references)`
>
> Also update the Mermaid Plugin Structure diagram: cl-reviewer "9 references" → "10 references"
> and totals "35" → "36".

### Change 5: pipeline-concepts.md — Subagent Communication Section

**What**: Add a new section explaining the protocol's role in the pipeline.

**Why**: pipeline-concepts.md defines the conceptual vocabulary of Clarity Loop. Subagent
communication is a new concept that contributors need to understand. (Research Finding 6.)

**Proposed** (new section after Reference File Structure, before Related):

> ## Subagent Communication
>
> Modes that dispatch subagents for parallel work use the Structured Agent Result Protocol
> to standardize how results flow back to the orchestrating context. The protocol defines:
>
> - **Four statuses** (CLEAN, FINDINGS, PARTIAL, ERROR) that distinguish "analysis completed
>   with no issues" from "analysis completed and found problems" — unlike binary PASS/FAIL
>   which conflates these
> - **Five result types** (digest, consistency, verification, implementation, design-plan)
>   matching the natural shape of each dispatch pattern
> - **A universal envelope** (summary line + metadata + detail) enabling the orchestrator
>   to parse any result without knowing the type in advance
> - **Mechanical aggregation rules** for combining N parallel results into unified reports
>
> The protocol specification lives in `skills/cl-reviewer/references/agent-result-protocol.md`.
> Each dispatch site in the skill reference files specifies which result type to use.
>
> See SYSTEM_DESIGN.md Section 1 (Structured Agent Result Protocol) for the architectural
> overview.

### Change 6: New Reference File — agent-result-protocol.md

**What**: Create the protocol specification reference file at
`skills/cl-reviewer/references/agent-result-protocol.md`.

**Why**: The full protocol spec — including prompt templates, aggregation rules, and severity
calibration — is too detailed for SYSTEM_DESIGN.md. It needs to be a loadable reference file
that orchestrating modes can read before dispatching subagents. (All research findings.)

**Location**: Under cl-reviewer because cl-reviewer has the most dispatch sites (7 of 13)
and the most complex aggregation needs. Other skills cross-reference it by path.

**File structure** (Tier 2: Guided, per R-003 convention):

```markdown
---
mode: agent-result-protocol
tier: guided
depends-on: []
state-files: []
---

## Structured Agent Result Protocol

[Protocol purpose and when to load this file]

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Dispatch site result type | Calling mode's reference file | Yes | One of: digest, consistency, verification, implementation, design-plan |
| Subagent prompt | Constructed by orchestrator | Yes | The prompt sent to the subagent, including protocol instructions |
| Subagent response | Task tool result | Yes | The natural language response to parse |

## Guidelines

1. Every subagent prompt MUST include the compact protocol instruction for its result type.
2. Graceful degradation: if a subagent omits the RESULT line, treat as PARTIAL.
3. Severity calibration: critical = blocks pipeline progress, major = should fix before
   merge, minor = cosmetic or low-impact.
4. Never silently discard a finding — even from PARTIAL results.
5. FINDINGS is a success state, not a failure. An agent that finds issues did its job well.
6. Coverage and confidence are self-assessed — use them directionally, not precisely.
7. Deduplication is conservative: when uncertain, keep both findings rather than merging.

## Process

### Phase 1: Status Taxonomy

Four terminal states for subagent results:

| Status | Meaning | When It Occurs |
|--------|---------|---------------|
| CLEAN | Completed, no issues found | Consistency check finds no contradictions |
| FINDINGS | Completed, issues enumerated | Consistency check finds contradictions |
| PARTIAL | Incomplete, partial results available | Context limit reached, timeout |
| ERROR | Failed entirely | Subagent crashed, target missing |

**Checkpoint**: Status taxonomy understood.

### Phase 2: Result Types

Five types matching dispatch patterns:

| Type | Produced By | Detail Section Contains |
|------|------------|----------------------|
| digest | Content extraction subagents | Section inventory, terms, decisions, cross-refs |
| consistency | Doc pair comparison subagents | Finding table + expanded details |
| verification | Checklist verification subagents | Checklist table (item, status, notes) |
| implementation | Task implementation subagents | Files modified, criteria, tests, gaps |
| design-plan | Design planning subagents | Component layout, tokens, execution instructions |

**Checkpoint**: Result types understood.

### Phase 3: Result Envelope

Every result has three sections in this order:

**Section 1 — Summary Line** (one line, parseable):
```
RESULT: <STATUS> | Type: <TYPE> | <type-specific-metrics>
```

Per-type metrics:
- digest: `Doc: <path> | Sections: <N> | Entities: <N> | Cross-refs: <N>`
- consistency: `Pair: <docA>/<docB> | Findings: <N> | Critical: <N> | Major: <N> | Minor: <N>`
- verification: `Items: <N> | Applied: <N> | Partial: <N> | Missing: <N>`
- implementation: `Task: <ID> | Files: <N> | Criteria: <pass>/<total> | Tests: <pass>/<total>`
- design-plan: `Screen: <name> | Components: <N>`

PARTIAL/ERROR append: `| Coverage: <X%> | Reason: <reason>`

**Section 2 — Metadata Block**:
```
---
**Protocol**: v1
**Agent**: <role description>
**Assigned**: <task description>
**Scope**: <documents or work units>
**Coverage**: <percentage or section list>
**Confidence**: <high | medium | low>
---
```

**Section 3 — Detail Section**: Type-specific (see result type definitions above).

**Checkpoint**: Envelope format understood.

### Phase 4: Finding Table Format

All findings use this table format:

| Column | Purpose | Values |
|--------|---------|--------|
| ID | Sequential within report | F1, F2, ... |
| Severity | Impact classification | critical, major, minor |
| Type | Nature of finding | See taxonomy below |
| Location | Where in source | Doc + section or line range |
| Counter-location | Conflicting source | Doc + section, or -- |
| Description | What's wrong | Concise statement |
| Suggestion | How to resolve | Brief recommendation |

Finding type taxonomy:
- contradiction, terminology-drift, broken-reference, stale-content
- missing-coverage, redundant-spec, abstraction-leak
- fidelity-loss, scope-violation, regression

Critical/major findings get expanded discussion below the table, keyed by ID.

**Checkpoint**: Finding format understood.

### Phase 5: Aggregation Rules

When combining N subagent results:

1. **Collect**: Scan each response for RESULT: line. Classify into buckets
   (CLEAN, FINDINGS, PARTIAL, ERROR, unparseable).
2. **Merge findings**: Concatenate all finding tables. Deduplicate by
   location + counter-location + type (keep more detailed, higher severity).
3. **Re-number**: Assign global IDs (G1, G2, ...).
4. **Sort**: By severity (critical first), then type, then location.
5. **Compute stats**: Total subagents, per-status counts, finding counts
   by severity, coverage percentage.
6. **Generate report**: Summary stats, coverage map, unified finding table,
   expanded details, coverage gaps.

Handling conflicts: If two subagents assess the same issue differently,
report both assessments. Use higher severity. Never silently discard.

**Checkpoint**: Aggregation rules understood.

### Phase 6: Prompt Templates

Compact protocol instructions to include in subagent prompts. The orchestrator
pastes the relevant template into each subagent's Task tool prompt.

#### Template: digest

```
Format your response using the Structured Agent Result Protocol.
Line 1 (required): RESULT: <CLEAN|FINDINGS|PARTIAL|ERROR> | Type: digest | Doc: <path> | Sections: <N> | Entities: <N> | Cross-refs: <N>
Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage (percentage or section list), Confidence (high/medium/low).
Then the detail section: section inventory (heading + 1-line summary each), key terms and entities defined,
architectural decisions found, and cross-references to other docs.
Use CLEAN if extraction completed. FINDINGS if you found issues in the document itself. PARTIAL if you hit context limits.
```

#### Template: consistency

```
Format your response using the Structured Agent Result Protocol.
Line 1 (required): RESULT: <CLEAN|FINDINGS|PARTIAL|ERROR> | Type: consistency | Pair: <docA>/<docB> | Findings: <N> | Critical: <N> | Major: <N> | Minor: <N>
Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage, Confidence.
Then the detail section: a finding table with columns (ID, Severity, Type, Location, Counter-location, Description, Suggestion).
Below the table, expand on critical and major findings with full context.
Use CLEAN if no inconsistencies. FINDINGS if issues found. Severity: critical = blocks pipeline, major = fix before merge, minor = cosmetic.
```

#### Template: verification

```
Format your response using the Structured Agent Result Protocol.
Line 1 (required): RESULT: <CLEAN|FINDINGS|PARTIAL|ERROR> | Type: verification | Items: <N> | Applied: <N> | Partial: <N> | Missing: <N>
Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage, Confidence.
Then the detail section: a checklist table with columns (Item, Status, Notes). Status values: applied, partial, missing, not-applicable.
Below the table, expand on partial and missing items with evidence.
Use CLEAN if all items applied. FINDINGS if any are partial or missing.
```

#### Template: implementation

```
Format your response using the Structured Agent Result Protocol.
Line 1 (required): RESULT: <CLEAN|FINDINGS|PARTIAL|ERROR> | Type: implementation | Task: <ID> | Files: <N> | Criteria: <pass>/<total> | Tests: <pass>/<total>
Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage, Confidence.
Then the detail section: files modified (path + change summary), acceptance criteria results (criterion, pass/fail, evidence),
test results (name, pass/fail), and gaps found.
Use CLEAN if all criteria and tests pass. FINDINGS if any fail.
```

#### Template: design-plan

```
Format your response using the Structured Agent Result Protocol.
Line 1 (required): RESULT: <CLEAN|FINDINGS|PARTIAL|ERROR> | Type: design-plan | Screen: <name> | Components: <N>
Then a metadata block: Protocol (v1), Agent, Assigned, Scope, Coverage, Confidence.
Then the detail section: component list with placement, layout specifications, content decisions,
and execution instructions. FINDINGS means issues with the plan itself (missing components, constraint violations),
not issues in analyzed content.
Use CLEAN if plan is complete. PARTIAL if planning was incomplete.
```

**Checkpoint**: Prompt templates available for all 5 result types.

## Output

**Primary artifact**: Protocol-conformant subagent results (produced by subagents
following this protocol).

**Additional outputs**:
- Aggregated unified reports (produced by orchestrators following aggregation rules)

**Loading instructions**: Orchestrating modes load this file before dispatching
subagents. Read Phase 6 (Prompt Templates) to get the compact instruction for
each subagent's prompt.
```

### Changes 7-9: Dispatch Site Updates — Pattern

**What**: Add a compact protocol instruction at each of the 13 dispatch sites across 8
reference files. Each instruction is 2-4 lines specifying the result type and pointing to
the protocol reference file.

**Why**: Dispatch sites currently describe what subagents should extract but not how to
format results. Adding the protocol instruction closes this gap. (Research Finding 1.)

**The pattern** (same structure at every dispatch site):

```markdown
**Result protocol**: Subagents report using the Structured Agent Result Protocol, type:
`<TYPE>`. Load the protocol prompt template from
`skills/cl-reviewer/references/agent-result-protocol.md` Phase 6 and include it in each
subagent's Task prompt. Parse the RESULT summary line from each response for status
classification and aggregation.
```

This is 3 lines added near the dispatch instruction. It doesn't replace the existing
description of what to extract — it adds how to format the result.

### Changes 7-18: Per-Site Details

#### Change 7: spec-mode.md (digest)

**Location**: Workflow Phase 2, after the existing bullet list of what to extract (around
line 135-145).

**Addition**: Protocol instruction specifying type `digest`. The existing bullet list
(content summary, types, interfaces, constraints, cross-refs) becomes the extraction
checklist within the digest detail section.

#### Change 8: run-mode.md (implementation)

**Location**: Process Phase 3, in the parallel groups subsection (around line 194-202).

**Addition**: Protocol instruction specifying type `implementation`. The existing
expectations (files modified, criteria status, gaps found) map to the implementation
detail section fields.

#### Change 9: autopilot-mode.md (implementation)

**Location**: Process Phase 3, in the parallel execution subsection (around line 336-345).

**Addition**: Protocol instruction specifying type `implementation`. Same as run-mode but
with test results included in the summary line metrics.

#### Change 10: review-mode.md (consistency)

**Location**: Workflow, at the large proposal dimension dispatch instruction (around
line 97-99).

**Addition**: Protocol instruction specifying type `consistency`. Each dimensional analysis
subagent reports findings in the standardized table format.

#### Change 11: re-review-mode.md (digest)

**Location**: Workflow Phase 1, at the parallel review read instruction (around line 33-35).

**Addition**: Protocol instruction specifying type `digest`. Each review reader extracts
blocking issues, non-blocking suggestions, and their context from one review file. The
orchestrator assembles these extracts into the cumulative issue ledger.

#### Change 12: verify-mode.md — dispatch site 1 (digest)

**Location**: Workflow Step 1, parallel doc reads (around line 50-56).

**Addition**: Protocol instruction specifying type `digest`. Each doc reader produces a
structured digest of the system doc.

#### Change 13: verify-mode.md — dispatch site 2 (consistency)

**Location**: Workflow Part C, cross-document consistency (around line 86-92).

**Addition**: Protocol instruction specifying type `consistency`. Each doc pair checker
produces a finding table.

#### Change 14: audit-mode.md — dispatch site 1 (digest)

**Location**: Process Phase 1, parallel doc reads (around line 60-67).

**Addition**: Protocol instruction specifying type `digest`. Same extraction as verify-mode
but with additional audit-specific fields (aspirational content, external claims).

#### Change 15: audit-mode.md — dispatch site 2 (consistency)

**Location**: Process Phase 2, Dimension 1 consistency (around line 85-86).

**Addition**: Protocol instruction specifying type `consistency`. Doc pair consistency
checks produce standardized finding tables for aggregation.

#### Change 16: mockups-mode.md — dispatch site 1 (design-plan)

**Location**: Process Phase 2, parallel planning subsection (around line 256-262).

**Addition**: Protocol instruction specifying type `design-plan`. Planning subagents report
component lists and placement specifications.

#### Change 17: mockups-mode.md — dispatch site 2 (design-plan)

**Location**: Process Phase 2, per-screen generation subsection (around line 264-267).

**Addition**: Protocol instruction specifying type `design-plan`. Per-screen generation
subagents report generated file paths and screenshots.

#### Change 18: tokens-mode.md (design-plan)

**Location**: Process parallelization hints section (around line 648-655).

**Addition**: Protocol instruction specifying type `design-plan`. Pre-generation subagents
report generated content sections with invalidation status.

#### Change 19: audit-mode.md — dispatch site 3 (varies by dimension)

**Location**: Process Phase 2, general dimension dispatch instruction (line 81: "Use
subagents for parallel analysis where dimensions are independent.").

**Addition**: Protocol instruction specifying that each dimension subagent uses the
Structured Agent Result Protocol with the result type matching the dimension's nature.
The orchestrator selects the template based on what the dimension measures:

| Dimension | Result Type | Rationale |
|-----------|------------|-----------|
| Dim 1: Cross-doc consistency | consistency | Finding contradictions between doc pairs (covered by Change 15) |
| Dim 2: Within-doc consistency | consistency | Finding internal contradictions |
| Dim 3: Technical correctness | verification | Checking claims against external reality |
| Dim 4: Goal alignment | verification | Checking current state against stated goals |
| Dim 5: Completeness | verification | Checking for missing content |
| Dim 6: Abstraction coherence | consistency | Finding level-of-detail mismatches |
| Dim 7: Design completeness | verification | Checking design coverage |
| Dim 8: Staleness assessment | digest | Extracting age/freshness indicators |
| Dim 9: Parking lot health | digest | Extracting tracking item status |

The instruction text (added after line 81):

```markdown
**Result protocol**: Subagents report using the Structured Agent Result Protocol. Select
the result type per dimension: `consistency` for dimensions checking doc-vs-doc or
internal coherence (Dims 1-2, 6), `verification` for dimensions checking against
external criteria (Dims 3-5, 7), `digest` for dimensions extracting content status
(Dims 8-9). Load the appropriate prompt template from
`skills/cl-reviewer/references/agent-result-protocol.md` Phase 6.
```

**Why this was missed**: The original research (R-004) counted Dimension 1 as a separate
dispatch site (explicit "dispatch subagents per doc pair" instruction) but treated the
general "Use subagents for parallel analysis" at line 81 as an implementation detail
rather than a dispatch site. However, dimensions 2-9 are also dispatched as subagents
when the orchestrator parallelizes, and those subagents need protocol instructions too.

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Structured Agent Result Protocol | Standardized format for subagent-to-orchestrator result reporting in Clarity Loop | SYSTEM_DESIGN.md S1, pipeline-concepts.md, agent-result-protocol.md, all dispatch sites |
| Status taxonomy | Four terminal states for subagent results: CLEAN, FINDINGS, PARTIAL, ERROR | Protocol spec, all dispatch sites |
| Result type | Classification of subagent output: digest, consistency, verification, implementation, design-plan | Protocol spec, dispatch site instructions |
| Result envelope | Three-section structure: summary line + metadata block + detail section | Protocol spec |
| Summary line | Parseable first line of every result: `RESULT: <STATUS> \| Type: <TYPE> \| <metrics>` | Protocol spec, aggregation rules |
| Finding table | Standardized table format for issues: ID, Severity, Type, Location, Counter-location, Description, Suggestion | Protocol spec, consistency and verification results |
| Aggregation | Mechanical process of combining N subagent results into a unified report | Protocol spec, orchestrating modes |

### Migration

**No behavioral migration needed.** This is additive — dispatch sites gain protocol
instructions that standardize how subagents format results. Existing dispatch logic is
unchanged. Subagents that don't follow the protocol perfectly are handled by graceful
degradation (treat as PARTIAL).

**Risk**: Subagents may not follow the protocol instructions in the early stages. The
protocol's graceful degradation ensures this isn't a hard failure — non-conformant results
are treated as PARTIAL and the orchestrator extracts what it can.

### Integration Points

**Protocol reference file ↔ dispatch sites**: Dispatch sites reference the protocol file
by path. The orchestrator loads the protocol file once per session, reads the prompt
template for the relevant result type, and includes it in each subagent's Task prompt.

**Protocol ↔ R-003 convention**: The protocol reference file follows the R-003 two-tier
template convention (Tier 2: Guided) with frontmatter, Variables, Guidelines, Process,
and Output sections.

**Protocol ↔ SYSTEM_DESIGN.md**: The S1 subsection is the authoritative architectural
description. The reference file is the operational specification. They complement but
don't duplicate — S1 gives the overview, the reference file gives the details.

**Cross-skill loading**: The protocol file lives under cl-reviewer. Other skills
(cl-implementer, cl-designer) load it by path when their modes dispatch subagents.
This is a read-only cross-reference — no coupling beyond file location.

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Four-status taxonomy (CLEAN/FINDINGS/PARTIAL/ERROR) | Binary PASS/FAIL (Bowser-style) | PASS/FAIL conflates "analysis completed with no issues" and "analysis completed and found problems." FINDINGS is a success state in documentation analysis. PARTIAL preserves valuable work from incomplete analyses. (Research Finding 3) |
| Universal envelope (summary + metadata + detail) | Summary line only; per-type protocols; no protocol | Universal envelope balances standardization with flexibility. One format to learn, type-specific internals. Extends Bowser's pattern. (Research Finding 6) |
| Five result types | Fewer types (2-3); more types (one per dispatch site) | Five types match the natural shape of Clarity Loop's four dispatch categories (A-D from Finding 1). Fewer types would over-generalize; more would fragment. (Research Finding 2) |
| Standardized finding table | Free-form prose; custom tables per type | Tables enable mechanical aggregation — concatenate, deduplicate, sort. Prose expansion for critical/major preserves nuance. (Research Finding 5) |
| Heuristic deduplication (location + type) | Strict exact match; no deduplication | Strict misses semantically equivalent findings at different granularity. Heuristic with conservative bias (keep both on uncertainty) errs toward surfacing more. (Research Finding 7) |
| Graceful degradation (treat non-conformant as PARTIAL) | Reject non-conformant results; require strict compliance | Subagents may not always follow protocol perfectly. Rejecting useful results because of formatting is worse than accepting them imperfectly. (Research Decision 6) |
| Protocol file under cl-reviewer | Shared directory; per-skill copies; inline in each dispatch site | cl-reviewer has 7 of 13 dispatch sites and the most complex aggregation. Other skills cross-reference by path. Avoids new directory structure and duplication. |
| Severity calibration in protocol | Per-site calibration; no calibration | Shared rubric (critical = blocks pipeline, major = fix before merge, minor = cosmetic) improves cross-subagent consistency. Sites can add domain-specific guidance on top. (Research Open Question 2, resolved) |
| Section-level location granularity | Line-level; paragraph-level; free-form | Section headings are stable across edits (line numbers shift). Section-level is the right default; agents can be more specific when useful. (Research Open Question 3, resolved) |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Subagents omit summary line | Medium | Low | Graceful degradation: treat as PARTIAL. Prompt templates start with "Begin your response with the RESULT summary line." |
| Protocol adds token overhead | Low | Low | ~10 lines per result, small relative to typical 50-200 line output. Amortized by orchestrator's saved interpretation effort. |
| Severity calibration varies across subagents | Medium | Medium | Shared rubric in protocol spec. Orchestrator can normalize during aggregation (Phase 2). |
| Protocol becomes stale as modes evolve | Low | Medium | Protocol is versioned (v1). Future updates go through the documentation pipeline. |
| Cross-skill file loading adds latency | Low | Low | Single file read per session, cached in context. No per-dispatch overhead. |
| Finding deduplication produces false matches | Medium | Low | Conservative bias: keep both on uncertainty. Worst case is duplicate findings (better than missing findings). |

## Open Items

1. ~~**Protocol versioning**~~: **Resolved** — `Protocol: v1` field added to the metadata
   block spec (Phase 3). Enables future protocol evolution without breaking dispatch sites.

2. ~~**Design-plan result type scope**~~: **Resolved** — The design-plan prompt template
   (Phase 6) documents the lighter variant: FINDINGS means issues with the plan itself
   (missing components, constraint violations), not issues in analyzed content. No finding
   table is expected for design-plan results.

3. **Orchestrator prompt template library**: After this protocol is established, a future
   proposal could create parameterized prompt templates (one per result type) to further
   reduce duplication across dispatch sites. This is an optimization, not a requirement.

## Appendix: Research Summary

R-004 audited subagent dispatch sites across Clarity Loop's 4 skills and found 13
different implicit result formats with zero parseable structure. The research designed a
protocol with: a four-status taxonomy distinguishing "completed cleanly" from "completed
with findings" from "incomplete" from "failed"; five result types matching the natural
dispatch patterns; a universal three-section envelope (summary line + metadata + detail);
a standardized finding table enabling mechanical aggregation; and four-phase aggregation
rules for combining parallel results.

The protocol extends Bowser's proven `RESULT: PASS|FAIL | Steps: X/Y` format for Clarity
Loop's more complex documentation analysis domain, where PASS/FAIL is insufficient
(FINDINGS is a success state, PARTIAL preserves valuable work).

Key design choice: universal envelope with type-specific internals — one format to learn,
applied everywhere, with natural result shapes preserved in the detail section. Graceful
degradation ensures non-conformant results are treated as PARTIAL rather than discarded.

The full research doc is at `docs/research/R-004-STRUCTURED_AGENT_RESULT_PROTOCOL.md`.
