# Research: Structured Agent Result Protocol

**ID**: R-004
**Created**: 2026-02-16
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Net New
- **Status**: draft
- **Open Questions**: 5 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Net New

This capability does not currently exist in the system. Multiple modes across all four
skills mention dispatching subagents, but no standardized protocol governs how those
subagents report results back to their orchestrating context. Each dispatch site describes
expected outputs in ad-hoc prose. This research designs a formal result protocol that all
subagent communication will follow.

### Related System Docs

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| SYSTEM_DESIGN.md | S12 Spec Generation Pipeline | Describes parallel subagent dispatch for heavy doc reads; protocol must support this pattern |
| SYSTEM_DESIGN.md | S14 Verification and Audit Systems | Audit and verify modes dispatch the most subagents with the most complex aggregation needs |
| SYSTEM_DESIGN.md | S6 cl-implementer Architecture | Run-mode and autopilot-mode dispatch parallel implementation subagents with different result shapes |
| SYSTEM_DESIGN.md | S5 cl-designer Architecture | Mockups-mode dispatches subagents for planning (not MCP writes); results are layout plans, not findings |
| docs/pipeline-concepts.md | Manifest-Based Context Loading | Subagent dispatch sites use the manifest to discover work items; protocol must integrate with this |

### Current State

This capability does not currently exist in the system. The following describes the
architectural context it must fit within.

Clarity Loop has **12 distinct subagent dispatch sites** across its four skills. Each site
describes what the subagent should do and what it should return, but every description uses
different prose, different implicit result shapes, and no parseable structure. The
orchestrating agent receives natural language reports and must interpret them ad-hoc to
synthesize a unified output.

Current dispatch sites and their implicit result expectations:

| Dispatch Site | Skill | What Subagents Do | Implicit Result Shape |
|---------------|-------|-------------------|----------------------|
| spec-mode Step 2 | cl-implementer | Read one system doc each, produce summaries | Content summary + types + interfaces + constraints + cross-refs |
| run-mode parallel groups | cl-implementer | Implement one task group each | Files modified + criteria status + gaps found |
| autopilot parallel groups | cl-implementer | Implement + test one task group each | Same as run-mode + test results |
| review-mode (>500 lines) | cl-reviewer | Analyze different dimensions of a proposal | Dimensional analysis findings |
| re-review-mode Step 1 | cl-reviewer | Read previous review files in parallel | Issue ledger entries |
| verify-mode Step 1 | cl-reviewer | Read all system docs fresh | Content summary + proposal-related sections + inconsistencies |
| verify-mode Part C | cl-reviewer | Check doc pairs for consistency | Contradictions + terminology drift + broken refs |
| audit-mode Step 1 | cl-reviewer | Read one system doc each | Content summary + terms + decisions + cross-refs + claims |
| audit-mode Dim 1 | cl-reviewer | Check doc pairs for cross-doc consistency | Same as verify Part C but more thorough |
| mockups-mode parallel gen | cl-designer | Plan screen layouts | Component list + placement + content plan |
| mockups-mode per-screen gen | cl-designer | Generate one screen each (.pen file) | Generated file path + screenshot path |
| tokens-mode pre-generation | cl-designer | Pre-generate design sections | Generated content (potentially discarded if invalidated) |

The problem is clear: 12 dispatch sites, 12 different implicit result formats, zero
parseable structure.

### Why This Research

R-002 (Bowser Architecture Patterns) identified "Structured agent result protocol" as an
emerged concept, noting: "Standardized format for agents to report results back to
orchestrators -- enables automated aggregation and failure detection." R-002 Finding 2
demonstrated Bowser's approach: a parseable `RESULT: PASS|FAIL | Steps: X/Y` summary line
plus structured tables, enabling the orchestrator to aggregate mechanically rather than
interpreting prose.

Before any fan-out implementation can proceed (Phase 2 of R-002's recommendation), this
protocol must be defined. Without it, each fan-out mode will invent its own result format,
creating the same inconsistency problem at the agent communication layer that the pipeline
was designed to prevent in the documentation layer.

## Scope

### In Scope

- Standardized result envelope (status, summary line, metadata, detailed report)
- Result taxonomy for documentation pipeline results (not browser testing)
- Failure classification specific to Clarity Loop's domain
- Parseable summary line format for each result type
- Structured finding format for issues discovered by subagents
- Aggregation rules for combining N agent results into a unified report
- Before/after examples for real dispatch scenarios
- Design for both fan-out (N parallel agents) and sequential (single subagent) cases

### Out of Scope

- Implementation of fan-out in any specific mode (that follows from this protocol)
- Claude Code agent teams lifecycle management (TeamCreate/TeamDelete)
- Token budgeting for parallel contexts (separate concern)
- The orchestrator's internal logic for deciding what to do with aggregated results
- Browser automation result formats (covered by Bowser's existing protocol)

### Constraints

- Must work with Claude Code's Task tool (subagent communication is via natural language
  prompts and natural language responses -- no structured data transport)
- Must be parseable by the orchestrating agent from the response text (no external state)
- Must degrade gracefully: if a subagent doesn't follow the protocol perfectly, the
  orchestrator should still be able to extract useful information
- Must not impose excessive token overhead: the protocol structure itself should be
  lightweight relative to the substantive content
- Must accommodate the full range of Clarity Loop result types: summaries, findings,
  verification results, implementation reports, and design plans

## Research Findings

### Finding 1: Current Subagent Patterns — A Comprehensive Audit

**Context**: Every place in the Clarity Loop codebase that mentions dispatching subagents,
what they ask for, what format they expect back, and how they handle results.

**Analysis**: A full grep across all skill and reference files reveals 12 dispatch sites
falling into four distinct categories by result type:

**Category A: Content Extraction (5 sites)**

These subagents read a document and extract structured information from it. The
orchestrator needs the extraction, not a judgment.

| Site | What's Extracted | Current Prose Description |
|------|-----------------|-------------------------|
| spec-mode Step 2 | "Full content summary with key concepts; all defined types, entities, and their properties; all interfaces, contracts, and protocols; all behavioral rules and constraints; all cross-references to other docs" | Bullet list in reference file |
| verify-mode Step 1 | "Full content summary; any sections that appear to reference or relate to the proposal's topic; any sections that seem recently modified or inconsistent with surrounding content" | Bullet list in reference file |
| audit-mode Step 1 | "Full content summary; all defined terms and their definitions; all architectural decisions and stated rationale; all cross-references to other system docs; any claims about external technologies or patterns; anything that reads as aspirational vs. decided" | Bullet list in reference file |
| re-review-mode Step 1 | Previous review contents (implicit: issue entries, verdicts, suggestions) | "Dispatch subagents to read these in parallel if there are multiple" (no result format specified) |
| tokens-mode pre-gen | Pre-generated design sections (colors, typography, spacing) | "Subagent dispatch for pre-generation. Main context handles user interaction." (no result format specified) |

**Category B: Consistency Analysis (3 sites)**

These subagents compare two or more documents and report findings. The orchestrator needs
structured findings it can aggregate.

| Site | What's Compared | Current Prose Description |
|------|----------------|-------------------------|
| verify-mode Part C | Pairs of system docs | "Dispatch subagents to check each pair of system docs for: contradictory statements, terminology drift, broken cross-references, architectural inconsistencies, redundant or conflicting specifications" |
| audit-mode Dim 1 | Pairs of system docs (more thorough) | "Check every pair of system docs for contradictions. This is the most mechanically intensive check -- dispatch subagents per doc pair if needed." |
| review-mode (large proposals) | Dimensions of a single proposal | "Consider dispatching subagents to analyze different dimensions in parallel, each with the full proposal text and the system doc context" |

**Category C: Implementation Work (2 sites)**

These subagents perform implementation tasks and report what they did. The orchestrator
needs a status report with file-level detail.

| Site | What's Implemented | Current Prose Description |
|------|-------------------|-------------------------|
| run-mode parallel groups | Independent task groups | "Each subagent implements independently and reports: files modified, criteria status, gaps found" |
| autopilot parallel execution | Independent task groups with tests | "Each subagent runs the autonomous loop (implement -> test -> commit) independently" |

**Category D: Design Planning (2 sites)**

These subagents plan design artifacts without executing MCP operations. The orchestrator
uses the plans to execute sequentially.

| Site | What's Planned | Current Prose Description |
|------|---------------|-------------------------|
| mockups-mode planning | Per-screen layout plans | "Dispatch subagents to plan each screen's layout (which components, where placed, what content)" |
| mockups-mode per-screen gen | Complete screen generation | "Each subagent: create file -> open_document -> batch_design -> get_screenshot" |

**Key observation**: Categories A and B account for 8 of 12 dispatch sites and are the
highest-value targets for standardization. They produce information that the orchestrator
must aggregate into a unified report. Categories C and D are more varied and may need
looser protocol constraints.

**Tradeoffs**: Standardizing all 12 sites under one protocol adds consistency but may
over-constrain implementation and design subagents whose outputs are inherently different
from documentation analysis results.

**Source**: Comprehensive grep of all skill and reference files for "subagent", "dispatch",
"parallel", and "fan-out" terms, followed by contextual reading of each dispatch site.

### Finding 2: Result Taxonomy for the Documentation Pipeline

**Context**: What kinds of results do Clarity Loop subagents produce, and how should each
be structured?

**Analysis**: Across the 12 dispatch sites, subagent results fall into five distinct types.
Each type has a natural shape that the protocol should codify rather than force into a
single format.

**Type 1: Document Digest**

*Produced by*: Content extraction subagents (spec-mode, verify-mode Step 1, audit-mode
Step 1).

*Natural shape*: A structured summary of a single document -- key concepts, defined terms,
cross-references, and notable sections. No judgment, no findings. Pure extraction.

*Key fields*:
- Document path and identity
- Section inventory (headings with line ranges)
- Extracted entities (terms, types, interfaces, decisions)
- Cross-references to other documents
- Notable sections (flagged for the orchestrator's attention)

*Aggregation need*: The orchestrator collects N digests and uses them as input for its own
analysis. Digests are not merged -- they are indexed.

**Type 2: Consistency Finding**

*Produced by*: Consistency analysis subagents (verify-mode Part C, audit-mode Dim 1,
review-mode dimensional analysis).

*Natural shape*: A set of findings, each describing a discrepancy between two sources.
Each finding has a location, severity, and description.

*Key fields*:
- Source A (document, section, line range)
- Source B (document, section, line range)
- Finding type (contradiction, terminology drift, broken reference, architectural
  inconsistency, redundant specification)
- Severity (critical, major, minor)
- Description (what's inconsistent)
- Suggestion (how to resolve)

*Aggregation need*: The orchestrator merges N sets of findings, deduplicates (same issue
found by different subagent pairs), and sorts by severity.

**Type 3: Verification Result**

*Produced by*: Verify-mode application completeness checks, re-review issue resolution
checks.

*Natural shape*: A checklist of expected items with a status for each. Binary per item
(present/absent, fixed/not fixed) with notes.

*Key fields*:
- Checklist item (what was expected)
- Status (applied, partially applied, not applied, misapplied -- or fixed, partial,
  not fixed, regressed)
- Source reference (where the expectation came from)
- Notes (details on partial or missing items)

*Aggregation need*: The orchestrator concatenates checklists and computes summary
statistics (N applied, M partial, P missing).

**Type 4: Implementation Report**

*Produced by*: Run-mode and autopilot-mode implementation subagents.

*Natural shape*: A task completion report with file-level detail and test results.

*Key fields*:
- Task ID and description
- Status (complete, partial, blocked, failed)
- Files modified (list with change description)
- Acceptance criteria status (per criterion: pass/fail)
- Test results (if applicable: pass count, fail count, details)
- Gaps found (spec gaps, dependencies, blockers)
- Conflicts (files also modified by other subagents)

*Aggregation need*: The orchestrator collects reports, checks for file conflicts across
subagents, updates TASKS.md.

**Type 5: Design Plan**

*Produced by*: Mockups-mode planning subagents, tokens-mode pre-generation.

*Natural shape*: A design specification that the orchestrator will execute. Not a finding
or status report -- an artifact to be consumed.

*Key fields*:
- Screen/section identity
- Component list with placement coordinates
- Content specifications
- Design token references
- Execution instructions (for the main context's MCP calls)

*Aggregation need*: The orchestrator consumes plans sequentially for execution. No merge
needed -- plans are independent.

**Key insight**: Types 1-3 are the core documentation pipeline types and share common
structural needs (source references, severity classification, aggregation). Types 4-5 are
domain-specific and need more flexibility. The protocol should define a strict envelope
for all types but allow type-specific detail sections.

**Tradeoffs**:
- *Pro*: Type-specific formats match the natural shape of each result, reducing friction
- *Pro*: Shared envelope enables universal parsing of status and summary
- *Con*: Five types is more complex than Bowser's single PASS/FAIL format
- *Con*: Subagents need to know which type they're producing (adds to prompt complexity)

**Source**: Analysis of all 12 dispatch site result expectations, categorized by the nature
of the output and the orchestrator's aggregation needs.

### Finding 3: Failure Classification for Documentation Analysis

**Context**: Bowser uses binary PASS/FAIL. Documentation analysis needs more nuance --
a subagent that finds issues hasn't "failed," it has done its job well. And a subagent
that crashes mid-analysis has partial results that shouldn't be discarded.

**Analysis**: Four terminal states capture the full range of subagent outcomes in the
documentation pipeline:

| Status | Meaning | When It Occurs | Orchestrator Action |
|--------|---------|---------------|-------------------|
| **CLEAN** | Task completed, no issues found | Consistency check finds no contradictions; verification finds all changes applied | Count toward "passing" total; no further action |
| **FINDINGS** | Task completed, issues enumerated | Consistency check finds contradictions; verification finds missing changes | Aggregate findings into unified report; sort by severity |
| **PARTIAL** | Task could not complete fully; partial results available | Context limit reached mid-analysis; one of two docs unreadable; timeout | Include partial results with coverage note; flag for orchestrator attention |
| **ERROR** | Task failed entirely; no usable results | Subagent crashed; prompt was malformed; target document missing | Log error; mark this work unit for retry or manual review |

**Why not binary PASS/FAIL?**

Bowser's domain is browser testing: a user story either works or it doesn't. Documentation
analysis is different:

1. **FINDINGS is a success state.** An audit subagent that finds 5 contradictions has
   succeeded -- it did exactly what was asked. PASS/FAIL conflates "completed the analysis"
   with "the analysis found nothing," which are very different signals.

2. **PARTIAL is common and valuable.** A subagent checking a 2000-line document pair might
   hit context limits after analyzing 70% of the content. Discarding that 70% because the
   agent "failed" is wasteful. PARTIAL preserves the work and tells the orchestrator what
   coverage was achieved.

3. **CLEAN vs FINDINGS determines aggregation strategy.** When combining N subagent
   results, CLEAN results need no further processing. FINDINGS results need deduplication,
   severity sorting, and cross-reference resolution. The orchestrator's aggregation logic
   branches on this distinction.

**Metadata per status**:

| Status | Required Metadata |
|--------|------------------|
| CLEAN | Coverage (what was checked), confidence note (if applicable) |
| FINDINGS | Finding count by severity, finding list |
| PARTIAL | Coverage achieved (percentage or section list), reason for incompleteness, whatever results were obtained |
| ERROR | Error description, recovery suggestion |

**Tradeoffs**:
- *Pro*: Four states capture real-world outcomes without loss of information
- *Pro*: PARTIAL prevents discarding valuable work
- *Pro*: CLEAN/FINDINGS distinction simplifies aggregation logic
- *Con*: More complex than binary PASS/FAIL -- subagents must classify their own outcome
- *Con*: PARTIAL requires the subagent to self-assess coverage, which may be imprecise

**Source**: Analysis of Bowser's PASS/FAIL model (R-002 Finding 2), mapped against the
failure modes observed in Clarity Loop's existing dispatch site descriptions, particularly
audit-mode's "resilient" instruction and verify-mode's five-part verification where
individual parts may succeed or fail independently.

### Finding 4: Summary Line Format

**Context**: The orchestrator should be able to extract key metrics from a subagent's
result without parsing the full report. Bowser uses `RESULT: PASS|FAIL | Steps: X/Y`.
Clarity Loop needs a domain-specific equivalent.

**Analysis**: The summary line must be:
1. **On a dedicated line** -- not embedded in a paragraph
2. **Prefix-parseable** -- starts with a known token that the orchestrator can search for
3. **Key-value structured** -- metrics extractable by simple text parsing
4. **Type-aware** -- includes the result type so the orchestrator knows what detail
   section to expect

**Proposed format**:

```
RESULT: <STATUS> | Type: <RESULT_TYPE> | <type-specific metrics>
```

**Per-type summary lines**:

| Result Type | Summary Line Format | Example |
|-------------|-------------------|---------|
| Document Digest | `RESULT: CLEAN \| Type: digest \| Doc: <path> \| Sections: <N> \| Entities: <N> \| Cross-refs: <N>` | `RESULT: CLEAN \| Type: digest \| Doc: ARCHITECTURE.md \| Sections: 14 \| Entities: 23 \| Cross-refs: 8` |
| Consistency Finding | `RESULT: <CLEAN\|FINDINGS> \| Type: consistency \| Pair: <docA>/<docB> \| Findings: <N> \| Critical: <N> \| Major: <N> \| Minor: <N>` | `RESULT: FINDINGS \| Type: consistency \| Pair: ARCHITECTURE.md/TDD.md \| Findings: 3 \| Critical: 1 \| Major: 1 \| Minor: 1` |
| Verification Result | `RESULT: <CLEAN\|FINDINGS> \| Type: verification \| Items: <N> \| Applied: <N> \| Partial: <N> \| Missing: <N>` | `RESULT: FINDINGS \| Type: verification \| Items: 8 \| Applied: 6 \| Partial: 1 \| Missing: 1` |
| Implementation Report | `RESULT: <CLEAN\|FINDINGS\|PARTIAL> \| Type: implementation \| Task: <ID> \| Files: <N> \| Criteria: <pass>/<total> \| Tests: <pass>/<total>` | `RESULT: CLEAN \| Type: implementation \| Task: T-003 \| Files: 4 \| Criteria: 5/5 \| Tests: 12/12` |
| Design Plan | `RESULT: <CLEAN\|PARTIAL> \| Type: design-plan \| Screen: <name> \| Components: <N>` | `RESULT: CLEAN \| Type: design-plan \| Screen: Dashboard \| Components: 7` |

**PARTIAL and ERROR summary lines** append a reason:

```
RESULT: PARTIAL | Type: consistency | Pair: ARCHITECTURE.md/TDD.md | Findings: 2 | Coverage: 70% | Reason: context limit reached
RESULT: ERROR | Type: digest | Doc: ARCHITECTURE.md | Reason: file not found at expected path
```

**Parsing rules for the orchestrator**:
1. Scan the subagent's response for a line starting with `RESULT:`
2. Split on ` | ` to get key-value pairs
3. First pair is always status (CLEAN, FINDINGS, PARTIAL, ERROR)
4. Second pair is always type (digest, consistency, verification, implementation, design-plan)
5. Remaining pairs are type-specific metrics
6. If no `RESULT:` line found, treat as PARTIAL with reason "no summary line"

**Tradeoffs**:
- *Pro*: Single line is scannable by both AI and human readers
- *Pro*: Pipe-delimited format is trivially parseable
- *Pro*: Type field enables the orchestrator to route to type-specific aggregation logic
- *Con*: Subagents must remember to include the summary line (failure mode: omission)
- *Con*: Pipe-delimited format is fragile if values contain pipes (mitigated by using
  known key names and positional rules)

**Source**: Bowser's `RESULT: {PASS|FAIL} | Steps: {X/Y}` format (from
`bowser-qa-agent.md` Report section and `ui-review.md` Phase 3 Collect), adapted for
Clarity Loop's multi-type result taxonomy.

### Finding 5: Structured Finding Format

**Context**: When a subagent discovers an issue (inconsistency, drift, gap, misapplication),
how should it report that finding in its detailed section? The orchestrator must be able to
merge findings from N subagents into a single report without losing information.

**Analysis**: Every finding, regardless of which subagent produced it, should follow a
standard table format. This enables mechanical aggregation: the orchestrator concatenates
tables from all subagents, deduplicates, and sorts.

**Universal finding table format**:

| Column | Purpose | Values |
|--------|---------|--------|
| **ID** | Unique within this subagent's report | `F1`, `F2`, etc. (sequential) |
| **Severity** | Impact classification | `critical`, `major`, `minor` |
| **Type** | Nature of the finding | See finding type taxonomy below |
| **Location** | Where in the source material | Doc path + section heading or line range |
| **Counter-location** | The conflicting source (if applicable) | Doc path + section heading or line range, or `--` if single-source |
| **Description** | What's wrong | Concise statement of the issue |
| **Suggestion** | How to resolve | Brief recommendation |

**Finding type taxonomy** (specific to documentation analysis):

| Finding Type | Meaning | Typical Severity |
|-------------|---------|-----------------|
| `contradiction` | Two sources make incompatible claims | critical or major |
| `terminology-drift` | Same concept named differently across docs | major or minor |
| `broken-reference` | Cross-reference points to moved/removed content | major |
| `stale-content` | Content references outdated versions, tools, or patterns | minor or major |
| `missing-coverage` | Expected content is absent | major or critical |
| `redundant-spec` | Same behavior specified in two places with differences | minor or major |
| `abstraction-leak` | Content at wrong level of abstraction for its doc | minor |
| `fidelity-loss` | Proposal content was distorted in the merge | major or critical |
| `scope-violation` | Changes outside the proposal's declared scope | major |
| `regression` | A previously-fixed issue has re-emerged | critical |

**Example finding table** (from a consistency subagent checking ARCHITECTURE.md vs TDD.md):

```markdown
| ID | Severity | Type | Location | Counter-location | Description | Suggestion |
|----|----------|------|----------|-----------------|-------------|------------|
| F1 | critical | contradiction | ARCHITECTURE.md S3.2 "Event Bus" | TDD.md S5.1 "Message Flow" | Architecture says events are fire-and-forget; TDD specifies exactly-once delivery with acknowledgment | Align on delivery guarantee; recommend updating TDD to match architecture's fire-and-forget with retry-on-failure |
| F2 | minor | terminology-drift | ARCHITECTURE.md S4 "Data Layer" | TDD.md S6 "Persistence" | Architecture uses "data nucleus"; TDD uses "storage layer" for the same PostgreSQL instance | Standardize on "data nucleus" per architecture's defined terminology |
| F3 | major | broken-reference | ARCHITECTURE.md S7.3 "See TDD S8.2" | TDD.md (no S8.2 exists) | Cross-reference points to a section that was restructured in P-004 merge | Update cross-reference to TDD S9.1 (the restructured location) |
```

**Tradeoffs**:
- *Pro*: Tabular format is mechanically aggregatable -- concatenate, deduplicate, sort
- *Pro*: Finding types enable category-level statistics in the aggregated report
- *Pro*: ID field enables cross-referencing between the finding table and any expanded
  discussion
- *Con*: Tabular format constrains description length (long findings need a detail section
  below the table, referenced by ID)
- *Con*: Severity assignment by subagents may be inconsistent across agents analyzing
  different doc pairs (mitigated by orchestrator normalization)

**Source**: Analysis of Bowser's per-step PASS/FAIL table format, Clarity Loop's existing
review report structures (verify-mode's Application Status table, audit-mode's Health
Score table), and the finding formats used in re-review-mode's Issue Resolution table.

### Finding 6: The Result Envelope

**Context**: Should there be a standard wrapper around all results? Every subagent result,
regardless of type, needs a predictable outer structure so the orchestrator can extract the
summary without understanding the type-specific internals.

**Analysis**: The result envelope has three sections, always in this order:

```
1. Summary Line     (one line, parseable)
2. Metadata Block   (key-value pairs, 3-8 lines)
3. Detail Section   (type-specific, variable length)
```

**Section 1: Summary Line** (as defined in Finding 4)

One line starting with `RESULT:`. Always first in the response. The orchestrator parses
this for status, type, and key metrics.

**Section 2: Metadata Block**

Structured key-value pairs that provide context the orchestrator needs for aggregation
and reporting but that don't fit in the summary line:

```markdown
---
**Agent**: <agent role description>
**Assigned**: <what this agent was asked to do>
**Scope**: <document(s) or work unit examined>
**Duration**: <approximate time taken, if measurable>
**Coverage**: <what percentage or which portions were analyzed>
**Confidence**: <high | medium | low — self-assessed by the agent>
---
```

Coverage and confidence are particularly important for PARTIAL results. A subagent that
analyzed 8 of 12 sections before hitting context limits should report `Coverage: 8/12
sections (67%)` so the orchestrator knows what was missed.

**Section 3: Detail Section**

Type-specific content. The format depends on the result type:

| Result Type | Detail Section Contains |
|-------------|----------------------|
| Document Digest | Section inventory table, extracted entities list, cross-reference list, notable sections with excerpts |
| Consistency Finding | Finding table (per Finding 5 format), expanded discussion for critical/major findings by ID |
| Verification Result | Checklist table (item, status, notes), expanded discussion for partial/missing items |
| Implementation Report | Files modified table, acceptance criteria table, test results, gap descriptions |
| Design Plan | Component layout specification, design token references, execution instructions |

**Envelope example** (consistency subagent):

```markdown
RESULT: FINDINGS | Type: consistency | Pair: ARCHITECTURE.md/TDD.md | Findings: 3 | Critical: 1 | Major: 1 | Minor: 1

---
**Agent**: Cross-document consistency checker
**Assigned**: Compare ARCHITECTURE.md and TDD.md for contradictions, terminology drift, and broken references
**Scope**: ARCHITECTURE.md (14 sections, 842 lines), TDD.md (11 sections, 623 lines)
**Duration**: ~45 seconds
**Coverage**: Full (all sections in both documents)
**Confidence**: high
---

## Findings

| ID | Severity | Type | Location | Counter-location | Description | Suggestion |
|----|----------|------|----------|-----------------|-------------|------------|
| F1 | critical | contradiction | ARCHITECTURE.md S3.2 | TDD.md S5.1 | Event delivery guarantee mismatch | Align on fire-and-forget |
| F2 | minor | terminology-drift | ARCHITECTURE.md S4 | TDD.md S6 | "data nucleus" vs "storage layer" | Standardize terminology |
| F3 | major | broken-reference | ARCHITECTURE.md S7.3 | TDD.md | Cross-reference to removed section | Update to S9.1 |

### F1: Event Delivery Guarantee Mismatch (critical)

ARCHITECTURE.md Section 3.2 "Event Bus" states: "All events are fire-and-forget. The
producer publishes and moves on. Consumers are responsible for idempotent processing."

TDD.md Section 5.1 "Message Flow" states: "Events use exactly-once delivery with
publisher-side acknowledgment. The event bus guarantees delivery or raises a
DeliveryFailure exception."

These are incompatible guarantees. Fire-and-forget means the producer has no knowledge
of delivery success. Exactly-once with acknowledgment means the producer blocks until
confirmation.

**Suggestion**: Align on fire-and-forget per the architecture doc (which is the
higher-authority source for system-level decisions). Update TDD Section 5.1 to describe
at-least-once delivery with consumer-side idempotency, which is the practical
implementation of fire-and-forget with reliability.
```

**Tradeoffs**:
- *Pro*: Three-section structure is predictable and quick to parse
- *Pro*: Metadata block provides aggregation context without polluting the summary line
- *Pro*: Detail section is unconstrained by type -- each type uses its natural format
- *Con*: The envelope adds ~8-10 lines of overhead per subagent result
- *Con*: Coverage and confidence are self-assessed -- subagents may over-estimate

**Source**: Bowser's two-section format (summary line + step table) from
`bowser-qa-agent.md`, extended with a metadata block to support Clarity Loop's more
complex aggregation needs (coverage tracking, multi-document scope).

### Finding 7: Aggregation Rules

**Context**: How does the orchestrator combine N subagent results into a unified report?
This is where the protocol pays off -- if results follow the standard format, aggregation
becomes mechanical rather than interpretive.

**Analysis**: Aggregation operates in four phases:

**Phase 1: Collect and Classify**

Scan each subagent response for the `RESULT:` summary line. Classify results into buckets:

| Bucket | Contents | Action |
|--------|----------|--------|
| CLEAN results | Subagents that completed with no findings | Count toward coverage; no further processing |
| FINDINGS results | Subagents that completed with findings | Extract finding tables for Phase 2 |
| PARTIAL results | Subagents that couldn't complete | Extract whatever results exist; flag coverage gaps |
| ERROR results | Subagents that failed entirely | Log for retry or manual review; flag in report |
| Unparseable results | No RESULT line found | Treat as PARTIAL; attempt to extract useful content from prose |

**Phase 2: Merge Findings**

For all FINDINGS and PARTIAL results:

1. **Concatenate all finding tables** into a single unified table
2. **Deduplicate**: If two subagents found the same issue (same location + counter-location
   + type), keep the more detailed description and the higher severity
3. **Resolve conflicts**: If two subagents disagree about the same issue (one says
   contradiction, the other says terminology-drift), the orchestrator flags the
   disagreement and presents both assessments
4. **Re-number**: Assign global IDs (G1, G2, ...) to the merged finding list
5. **Sort**: By severity (critical first), then by type, then by location

**Phase 3: Compute Summary Statistics**

From the merged finding list:

```
Total subagents: N
Completed (CLEAN): X
Completed (FINDINGS): Y
Partial: Z
Error: W
Coverage: [percentage of total work units that were fully analyzed]

Total findings: F
  Critical: Fc
  Major: Fm
  Minor: Fn
Finding types: [breakdown by type]
```

**Phase 4: Generate Unified Report**

The orchestrator produces a report that includes:

1. **Summary statistics** (from Phase 3)
2. **Coverage map** -- which work units were checked, which were partial, which errored

   | Work Unit | Agent Status | Findings |
   |-----------|-------------|----------|
   | ARCH.md + TDD.md | CLEAN | 0 |
   | ARCH.md + PRD.md | FINDINGS | 3 |
   | TDD.md + PRD.md | PARTIAL (70%) | 1 |
   | ARCH.md + PRIMITIVES.md | ERROR | -- |

3. **Unified finding table** (from Phase 2, with global IDs)
4. **Expanded finding details** (from individual subagent reports, keyed by global ID)
5. **Coverage gaps** -- work units that were not fully analyzed, with reasons

**Handling conflicting findings**:

When two subagents assess the same issue differently (possible when overlapping scopes are
assigned for redundancy or cross-validation):

1. If one is more specific (e.g., "contradiction in delivery guarantee" vs. "inconsistency
   in messaging section"), keep the more specific one
2. If severities differ, report both assessments with a note: "Severity disagreement:
   Agent A assessed as critical, Agent B as major. Presenting as critical (higher of two)."
3. Never silently discard a finding

**Tradeoffs**:
- *Pro*: Mechanical aggregation -- no interpretation needed if subagents follow the protocol
- *Pro*: Deduplication prevents inflated finding counts from overlapping scopes
- *Pro*: Coverage map makes gaps visible rather than silently ignoring them
- *Con*: Deduplication heuristic (same location + counter-location + type) may miss
  semantically-equivalent findings with different location granularity
- *Con*: Phase 2 sorting by severity requires severity to be consistent across subagents
  (different agents may calibrate differently)

**Source**: Bowser's `ui-review.md` Phase 4 (Cleanup and Report) aggregation pattern --
summary statistics table + per-failure detail sections. Extended for Clarity Loop's finding
deduplication and coverage tracking needs.

### Finding 8: Before/After for Real Dispatch Scenarios

**Context**: Concrete examples showing how the protocol transforms existing dispatch sites.

**Analysis**: Three scenarios demonstrating the protocol in practice.

**Scenario 1: Audit-Mode Step 1 (Content Extraction, Fan-Out)**

*Before* (current prose instruction):
```
Read every file in docs/system/ — Dispatch subagents in parallel, one per doc.
Each subagent produces:
- Full content summary
- All defined terms and their definitions
- All architectural decisions and stated rationale
- All cross-references to other system docs
- Any claims about external technologies or patterns
- Anything that reads as aspirational vs. decided
```

The orchestrator receives N blocks of unstructured prose and must manually parse each one
to build its analysis inputs.

*After* (with protocol):

Orchestrator prompt to each subagent:
```
You are a document digest agent. Read the assigned system doc and produce a structured
digest following the Structured Agent Result Protocol.

**Assigned document**: {doc_path}

Extract:
- Section inventory (all ## headings with line ranges)
- Defined terms and their definitions
- Architectural decisions and their stated rationale
- Cross-references to other system docs
- Claims about external technologies or patterns
- Content classified as aspirational vs. decided

Report format: Use result type "digest". Include the RESULT summary line, metadata
block, and detail section per the protocol.
```

Subagent response:
```markdown
RESULT: CLEAN | Type: digest | Doc: ARCHITECTURE.md | Sections: 14 | Entities: 23 | Cross-refs: 8

---
**Agent**: Document digest agent
**Assigned**: Extract structured digest from ARCHITECTURE.md
**Scope**: ARCHITECTURE.md (14 sections, 842 lines)
**Duration**: ~30 seconds
**Coverage**: Full (all sections)
**Confidence**: high
---

## Section Inventory

| # | Heading | Line Range |
|---|---------|-----------|
| 1 | Architecture Overview | 1-45 |
| 2 | Event Bus | 46-102 |
| ... | ... | ... |

## Defined Terms

| Term | Definition | Section |
|------|-----------|---------|
| data nucleus | The unified PostgreSQL instance... | S4 |
| fire-and-forget | Event delivery model where... | S3.2 |
| ... | ... | ... |

## Architectural Decisions

| Decision | Rationale | Section |
|----------|----------|---------|
| PostgreSQL as sole datastore | Reduces operational complexity... | S4 |
| ... | ... | ... |

## Cross-References

| From Section | References | Target Doc | Target Section |
|-------------|-----------|-----------|---------------|
| S7.3 | "See TDD S8.2 for..." | TDD.md | S8.2 |
| ... | ... | ... | ... |

## Notable Sections

### Aspirational Content
- S12 "Future: Multi-region deployment" — no corresponding architecture support

### External Technology Claims
- S3.2 claims pgmq supports "guaranteed delivery" — verify against pgmq docs
```

The orchestrator can now mechanically process this: parse the RESULT line to confirm
success, index the section inventory, cross-reference the cross-references table across
all digests to find broken links, and pass the external technology claims to the technical
correctness dimension.

**Scenario 2: Verify-Mode Part C (Consistency Analysis, Fan-Out)**

*Before* (current prose instruction):
```
Dispatch subagents to check each pair of system docs for:
- Contradictory statements about the same concept
- Terminology drift (same thing called different names in different docs)
- Broken cross-references (doc A refers to something in doc B that was moved or renamed)
- Architectural inconsistencies
- Redundant or conflicting specifications of the same behavior
```

*After* (with protocol):

Orchestrator prompt:
```
You are a cross-document consistency checker. Compare the two assigned system docs
and report any inconsistencies using the Structured Agent Result Protocol.

**Document A**: {doc_a_path}
**Document B**: {doc_b_path}

Check for: contradictions, terminology drift, broken cross-references, architectural
inconsistencies, and redundant specifications.

Report format: Use result type "consistency". Include finding table with columns:
ID, Severity, Type, Location, Counter-location, Description, Suggestion.
```

Subagent response:
```markdown
RESULT: FINDINGS | Type: consistency | Pair: ARCHITECTURE.md/TDD.md | Findings: 3 | Critical: 1 | Major: 1 | Minor: 1

---
**Agent**: Cross-document consistency checker
**Assigned**: Compare ARCHITECTURE.md and TDD.md
**Scope**: ARCHITECTURE.md (14 sections), TDD.md (11 sections)
**Duration**: ~45 seconds
**Coverage**: Full
**Confidence**: high
---

## Findings

| ID | Severity | Type | Location | Counter-location | Description | Suggestion |
|----|----------|------|----------|-----------------|-------------|------------|
| F1 | critical | contradiction | ARCHITECTURE.md S3.2 | TDD.md S5.1 | Event delivery guarantee mismatch | Align on fire-and-forget |
| F2 | minor | terminology-drift | ARCHITECTURE.md S4 | TDD.md S6 | "data nucleus" vs "storage layer" | Standardize terminology |
| F3 | major | broken-reference | ARCHITECTURE.md S7.3 | TDD.md | Cross-ref to removed section | Update to S9.1 |

[Expanded details for F1, F2, F3...]
```

The orchestrator collects these from all doc-pair subagents, concatenates the finding
tables, deduplicates, re-numbers with global IDs, and produces the unified
Cross-Reference Map and findings for the verification report.

**Scenario 3: Re-Review Mode Step 1 (Sequential, Single Subagent)**

*Before* (current prose instruction):
```
Find all previous reviews — Read every REVIEW_P-NNN_v*.md file in
docs/reviews/proposals/, ordered by version number. Dispatch subagents to read these
in parallel if there are multiple.
```

No result format specified. The orchestrator must read prose summaries and manually build
the cumulative issue ledger.

*After* (with protocol):

Orchestrator prompt:
```
You are a review history reader. Read the assigned review file and extract all issues
(blocking and non-blocking) into a structured ledger using the Structured Agent Result
Protocol.

**Review file**: {review_file_path}

Extract every issue mentioned in the review: its severity, which dimension it falls
under, the specific section/location it references, and its current status if stated.

Report format: Use result type "verification" (checklist of issues). Each item is an
issue from the review with its original context.
```

Subagent response:
```markdown
RESULT: FINDINGS | Type: verification | Items: 7 | Applied: 0 | Partial: 0 | Missing: 0

---
**Agent**: Review history reader
**Assigned**: Extract issue ledger from REVIEW_P-005_v1.md
**Scope**: REVIEW_P-005_v1.md (1 file, 156 lines)
**Duration**: ~15 seconds
**Coverage**: Full
**Confidence**: high
---

## Issue Ledger

| ID | Dimension | Severity | Section | Issue | Status |
|----|-----------|----------|---------|-------|--------|
| I1 | Internal Coherence | major | Change Manifest | Row 3 targets wrong section | Open |
| I2 | Technical Soundness | critical | Detailed Design S2 | Missing error handling for timeout | Open |
| I3 | External Consistency | minor | System Context | Stale reference to ARCHITECTURE.md S8 | Open |
| I4 | Completeness | major | Detailed Design S4 | No migration strategy for schema change | Open |
| I5 | Value | minor | Rationale | Overstated benefit claim without evidence | Open |
| I6 | Technical Soundness | major | Detailed Design S3 | Race condition in concurrent writes | Open |
| I7 | Internal Coherence | minor | Summary vs Detail | Summary says "3 docs affected", detail shows 4 | Open |
```

The orchestrator collects issue ledgers from all review version subagents and builds the
cumulative ledger mechanically -- concatenating, checking for issues that appear across
versions (tracking fix/regression status).

**Tradeoffs**:
- *Pro*: Before/after demonstrates significant reduction in interpretation burden
- *Pro*: All three scenarios use the same envelope, making the pattern learnable
- *Con*: The "after" prompts are longer (protocol instructions take tokens)
- *Con*: Subagents must understand the protocol to produce conformant output

**Source**: Direct application of the protocol to three real dispatch sites from
spec-mode.md, verify-mode.md, and re-review-mode.md.

## Options Analysis

The research identified three approaches to protocol complexity:

| Criterion | Option A: Universal Envelope | Option B: Type-Specific Protocols | Option C: Minimal Convention |
|-----------|----------------------------|----------------------------------|---------------------------|
| **Envelope** | One envelope format for all 5 result types | Different envelope per type | Summary line only, no envelope |
| **Finding format** | Universal finding table (same columns for all finding types) | Different table formats per type | No table format prescribed |
| **Summary line** | Standardized `RESULT:` line with type field | Type-specific summary lines (no shared prefix) | No summary line |
| **Learning curve** | Medium -- one format to learn, applied everywhere | High -- 5 formats to learn | Low -- minimal convention |
| **Aggregation** | Mechanical -- same parse logic for any result | Type-specific parse logic for each | Manual -- orchestrator interprets prose |
| **Token overhead** | ~10 lines per result (envelope + summary) | ~10-15 lines per result (type-specific headers) | ~1 line per result |
| **Graceful degradation** | Good -- if summary line missing, still readable prose | Poor -- type-specific parsing breaks if wrong format used | Excellent -- no format to break |
| **Extensibility** | Add new result types by defining a new Type value | Add new protocol document per type | N/A -- no format to extend |
| **Bowser alignment** | Extends Bowser's pattern (same RESULT prefix, compatible metrics) | Diverges from Bowser's single-format approach | Mirrors Bowser's minimal approach (summary line only) |

## Recommendations

### Primary Recommendation: Option A (Universal Envelope)

Adopt a single, universal result envelope that all subagents use, with type-specific detail
sections. This is the sweet spot between standardization and flexibility:

1. **One envelope to learn**: Summary line + metadata block + detail section. Every
   subagent, regardless of type, follows the same outer structure.
2. **Type-specific internals**: The detail section varies by result type, but the envelope
   is consistent. The orchestrator parses the envelope mechanically and dispatches to
   type-specific logic for the details.
3. **Bowser-compatible**: The `RESULT:` prefix and pipe-delimited metrics extend Bowser's
   proven format. An agent familiar with Bowser's protocol can adapt to Clarity Loop's
   with minimal friction.
4. **Graceful degradation**: If a subagent omits the summary line, the orchestrator treats
   the result as PARTIAL and attempts to extract useful content from the prose. The protocol
   enhances but doesn't gate-keep.

### The Protocol Specification

**Every subagent result MUST include, in this order:**

**Line 1: Summary Line**
```
RESULT: <STATUS> | Type: <TYPE> | <type-specific-metrics>
```
Where:
- STATUS is one of: `CLEAN`, `FINDINGS`, `PARTIAL`, `ERROR`
- TYPE is one of: `digest`, `consistency`, `verification`, `implementation`, `design-plan`
- Metrics are type-specific key-value pairs (see Finding 4)

**Lines 2-8: Metadata Block**
```markdown
---
**Agent**: <role description>
**Assigned**: <task description>
**Scope**: <documents or work units>
**Coverage**: <percentage or section list>
**Confidence**: <high | medium | low>
---
```

**Remaining lines: Detail Section**
- For CLEAN results: brief confirmation of what was checked
- For FINDINGS results: finding table (Finding 5 format) + expanded details for
  critical/major findings
- For PARTIAL results: whatever results were obtained + coverage gap description
- For ERROR results: error description + what was attempted before failure

**The orchestrator MUST:**
1. Parse the `RESULT:` line to classify each subagent result
2. Separate CLEAN/FINDINGS/PARTIAL/ERROR results into buckets
3. For FINDINGS results: extract finding tables and aggregate per Finding 7
4. For PARTIAL results: include partial findings in aggregation with coverage caveat
5. For ERROR results: log and flag for retry or manual review
6. For unparseable results: treat as PARTIAL, attempt best-effort extraction
7. Produce a unified report with summary statistics, coverage map, and merged findings

### Integration Points

The protocol integrates with existing Clarity Loop dispatch sites as follows:

| Dispatch Site | Protocol Type | Changes to Reference File |
|---------------|--------------|--------------------------|
| spec-mode Step 2 | digest | Add protocol prompt template; add "Report format" instruction |
| verify-mode Step 1 | digest | Same |
| audit-mode Step 1 | digest | Same |
| verify-mode Part C | consistency | Add protocol prompt template; add finding table instruction |
| audit-mode Dim 1 | consistency | Same |
| review-mode (large) | consistency | Add protocol prompt template for dimensional findings |
| re-review-mode Step 1 | verification | Add protocol prompt template; issue ledger as checklist |
| run-mode parallel | implementation | Add protocol prompt template; acceptance criteria table |
| autopilot parallel | implementation | Same, plus test results |
| mockups-mode planning | design-plan | Add protocol prompt template; layout spec format |
| mockups-mode per-screen | design-plan | Same, plus file paths |
| tokens-mode pre-gen | design-plan | Add protocol prompt template |

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Subagents forget to include the summary line | Medium | Low -- orchestrator falls back to PARTIAL | Graceful degradation is built into the spec; first line of every prompt template says "Begin your response with the RESULT summary line" |
| Protocol adds token overhead that exceeds its value for simple tasks | Low | Low -- ~10 lines per result | Overhead is fixed and small relative to typical subagent output (50-200 lines); amortized across the orchestrator's saved interpretation effort |
| Finding severity calibration varies across subagents | Medium | Medium -- aggregation may sort inconsistently | Define severity guidelines in the protocol reference (critical = blocks pipeline, major = should fix before merge, minor = cosmetic or low-impact) |
| New result types emerge that don't fit the five defined types | Low | Low -- protocol is extensible | Add new Type values as needed; the envelope format doesn't change |
| Orchestrator aggregation deduplication produces false matches | Medium | Low -- worst case is duplicate findings in report | Dedup heuristic uses location + counter-location + type; false matches are conservative (two entries better than zero) |
| Protocol becomes stale as modes evolve | Low | Medium -- outdated protocol confuses subagents | Version the protocol; reference file prompts point to a specific protocol version |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| SYSTEM_DESIGN.md | New section describing the Structured Agent Result Protocol as a cross-cutting system pattern |
| SYSTEM_DESIGN.md | Updates to S12 (Spec Generation) and S14 (Verification and Audit) to reference the protocol |
| docs/pipeline-concepts.md | New subsection: "Subagent Communication" explaining the protocol's role in the pipeline |
| (new) Protocol reference file | A reference file (e.g., `references/agent-result-protocol.md`) containing the full protocol spec, to be loaded by orchestrating modes |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Status taxonomy | PASS/FAIL (Bowser-style) vs. CLEAN/FINDINGS/PARTIAL/ERROR | Four-status taxonomy | PASS/FAIL conflates "analysis succeeded" with "analysis found nothing"; documentation analysis requires the distinction |
| 2 | Envelope complexity | Summary line only vs. full envelope (summary + metadata + detail) | Full envelope | Metadata block provides coverage and confidence signals essential for PARTIAL result handling; overhead is small (~10 lines) |
| 3 | Finding format | Free-form prose vs. standardized table | Standardized table with prose expansion for critical/major | Tables enable mechanical aggregation; prose expansion preserves nuance for important findings |
| 4 | Protocol scope | Documentation types only (A+B) vs. all dispatch types (A+B+C+D) | All dispatch types with universal envelope, type-specific details | Universal envelope keeps the learning curve low; type-specific details accommodate the real variance in result shapes |
| 5 | Aggregation deduplication | Strict (exact match) vs. heuristic (location + type) | Heuristic with conservative bias (keep both on uncertain matches) | Strict matching misses findings described at different granularity; heuristic with conservative bias errs toward surfacing more findings rather than fewer |
| 6 | Graceful degradation | Reject non-conformant results vs. best-effort extraction | Best-effort extraction (treat as PARTIAL) | Subagents may not always follow the protocol perfectly; rejecting useful results because of formatting is worse than accepting them imperfectly |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Protocol versioning | As Clarity Loop evolves, the result protocol will need updates. Subagent prompts should reference a version so orchestrators know what format to expect. | Add `Protocol: v1` to the metadata block; define versioning policy in the protocol reference file |
| Severity calibration guide | Different subagents may assign different severities to similar findings. A shared rubric would improve consistency across parallel agents. | Define severity rubric as part of the protocol reference: critical = blocks pipeline progress; major = should fix before merge; minor = cosmetic, can defer |
| Orchestrator prompt template library | Each dispatch site needs a prompt template that includes the protocol instructions. A shared library of templates, parameterized by result type, would reduce duplication. | Create after this protocol is approved; one template per result type with {variable} slots for the dispatch-site-specific content |
| Coverage-aware retry | When a subagent reports PARTIAL with specific coverage gaps, the orchestrator could dispatch a targeted retry for just the uncovered portion. | Defer to implementation; the protocol's coverage metadata enables this but the retry logic is orchestrator-internal |
| Cross-subagent finding correlation | Two subagents analyzing different doc pairs may find findings that are actually the same root cause (e.g., a terminology change that affects multiple cross-references). The orchestrator could detect patterns across finding tables. | Defer to implementation; the standardized finding type taxonomy enables pattern detection |

## Open Questions

1. **Protocol reference file location**: Should the protocol specification live as a
   standalone reference file (e.g., `skills/shared/agent-result-protocol.md`) loaded by
   orchestrating modes, or should it be inlined into each dispatch site's prompt template?
   Standalone is DRY but adds a file read per dispatch. Inlined is self-contained but
   creates duplication across 12 sites.

2. **Severity calibration across subagents**: The protocol defines severity levels
   (critical, major, minor) but doesn't prescribe calibration. Should the protocol include
   a severity rubric (critical = X, major = Y, minor = Z), or should each dispatch site
   define severity for its specific domain? A shared rubric improves consistency; a
   per-site rubric improves precision.

3. **Finding deduplication granularity**: The aggregation rules deduplicate by location +
   counter-location + type. But "location" can be at different granularities (section
   heading vs. line range vs. paragraph). Should the protocol prescribe a standard
   location granularity, or let the orchestrator normalize?

4. **PARTIAL coverage threshold**: At what coverage percentage should the orchestrator
   accept PARTIAL results vs. retrying? 80%? 50%? Should this be configurable per mode?
   Audit-mode (thoroughness critical) might need higher thresholds than spec-mode
   (pre-read optimization).

5. **Design-plan result type validation**: Types 1-3 (digest, consistency, verification)
   have clear success criteria (did you find everything? are findings valid?). Type 5
   (design-plan) is an artifact, not an analysis -- its "correctness" is determined by
   the main context when it executes the plan. Should design-plan results even use the
   full protocol, or just the summary line? What would FINDINGS mean for a design plan?

## References

- R-002: Bowser Architecture Patterns for Clarity Loop
  (`/Users/bhushan/Documents/Clarity_Loop/clarity-loop/docs/research/R-002-BOWSER_ARCHITECTURE_PATTERNS.md`)
  - Finding 2: Fan-Out Orchestration Pattern (communication protocol, RESULT line format)
  - Finding 6: File Structure Conventions (Report section templates)
- Bowser source files:
  - `/Users/bhushan/Documents/bowser/.claude/agents/bowser-qa-agent.md` — Structured
    PASS/FAIL report with per-step tables, success/failure variants
  - `/Users/bhushan/Documents/bowser/.claude/commands/ui-review.md` — Fan-out
    orchestration, Phase 3 Collect (parsing RESULT lines), Phase 4 Report (aggregation)
- Clarity Loop dispatch sites (12 total):
  - `skills/cl-implementer/references/spec-mode.md` — Step 2 parallel doc reads
  - `skills/cl-implementer/references/run-mode.md` — Parallel task group implementation
  - `skills/cl-implementer/references/autopilot-mode.md` — Parallel execution section
  - `skills/cl-reviewer/references/review-mode.md` — Large proposal dimensional analysis
  - `skills/cl-reviewer/references/re-review-mode.md` — Step 1 parallel review reads
  - `skills/cl-reviewer/references/verify-mode.md` — Step 1 parallel doc reads, Part C
    doc pair consistency
  - `skills/cl-reviewer/references/audit-mode.md` — Step 1 parallel reads, Dim 1
    consistency, Dim 3 with subagent option
  - `skills/cl-designer/references/mockups-mode.md` — Parallel planning, per-screen gen
  - `skills/cl-designer/references/tokens-mode.md` — Pre-generation parallelization
