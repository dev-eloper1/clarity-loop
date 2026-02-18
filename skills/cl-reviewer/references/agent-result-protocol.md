---
mode: agent-result-protocol
tier: guided
depends-on: []
state-files: []
---

## Structured Agent Result Protocol

Standardized format for subagent-to-orchestrator result reporting in Clarity Loop. Load this
file before dispatching subagents to ensure consistent result formatting and mechanical
aggregation.

**When to load**: Before any dispatch site that launches subagents in parallel. Read Phase 6
(Prompt Templates) to get the compact instruction for each subagent's prompt.

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
