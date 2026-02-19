---
mode: spec
tier: structured
depends-on: []
state-files: [RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md, .spec-manifest.md, DECISIONS.md, PARKING.md]
---

## Spec Generation Mode

Reference for the `cl-implementer spec` mode. Generates structured, implementation-ready
specs from verified system documentation. This is the bridge between documentation and
implementation — the final derivation step before tasks can be generated.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| docsRoot | Project config / .clarity-loop.json | Yes | Root path for all documentation artifacts |
| RESEARCH_LEDGER.md | docs/ | No | Active research cycles tracker |
| PROPOSAL_TRACKER.md | docs/ | No | In-flight proposals tracker |
| .spec-manifest.md | {docsRoot}/specs/ | No | Generated spec manifest (output of this mode) |
| DECISIONS.md | {docsRoot}/ | No | Captured decisions for testing, security, API, etc. |
| PARKING.md | {docsRoot}/ | No | Parked architectural items |
| .context-manifest.md | {docsRoot}/context/ | No | Library context manifest for freshness checks |
| package.json | project root | No | Dependency file for version alignment checks |

## Workflow

### Phase 1: Waterfall Gate Check

**Critical Principle**: Specs are generated ONLY after ALL system docs are complete and verified. This is intentionally NOT iterative. The reasoning:

1. If you generate specs from partially-complete docs, later doc changes require spec merging
2. Spec merging across features/tasks is extremely messy — conflicts, stale references
3. The whole point of the doc pipeline is to get docs to a stable, verified state FIRST
4. Once docs are stable, spec generation is a one-shot derivation

If system docs change later (new research cycle), specs should be regenerated from scratch,
not patched.

**Step 1.** Check RESEARCH_LEDGER.md — Are there active research cycles? If any research has
status `draft` or `in-discussion`, warn the user: "There's active research in progress
(R-NNN). Generating specs now means they'll be stale when that research produces changes.
Continue anyway?"

**Verify**: RESEARCH_LEDGER.md exists and has been read.
**On failure**: If file missing, note advisory and proceed (no research tracker found).

**Step 2.** Check PROPOSAL_TRACKER.md — Are there in-flight proposals? If any proposal has status
`draft`, `in-review`, or `merging`, warn the user: "There are in-flight proposals
(P-NNN). Specs generated now won't reflect those changes. Continue anyway?"

**Verify**: PROPOSAL_TRACKER.md exists and has been read.
**On failure**: If file missing, note advisory and proceed.

**Step 3.** Check for unverified merges — Are there proposals with status `approved` but not
`verified`? If so, warn: "Proposal P-NNN was approved but not yet verified. Run
`/cl-reviewer verify` first to ensure system docs are consistent."

**Verify**: No proposals stuck in approved-but-unverified state.
**On failure**: Present as blocker in batch table.

**Step 4.** Check context freshness — If `{docsRoot}/context/.context-manifest.md` exists,
check version alignment and freshness dates for all libraries. If any context is stale
(version mismatch with `package.json` or past freshness threshold), warn: "Context for
[library] may be stale. Specs generated with stale context may produce implementation
issues. Run `/cl-researcher context [library]` to update, or continue anyway?"
If no context exists but system docs reference a tech stack, note (advisory only):
"No context files found. Context files improve implementation accuracy. Consider
running `/cl-researcher context` before or after spec generation."

**Verify**: Context manifest read and versions compared against package.json.
**On failure**: If no context manifest, note advisory and proceed.

**Step 5.** Transition advisory — Before presenting the gate check batch, read PARKING.md and
DECISIONS.md:

a. Filter PARKING.md Active section for `architectural` items. If any:
   "There are [N] architectural items parked: [list]. These may affect spec generation."

b. Check intent (from DECISIONS.md):
   - Ship: proceed unless architectural blockers exist
   - Quality: mention areas without deliberate decisions
   - Rigor: highlight all gaps

c. Never block. The user can always say "proceed."

**Verify**: PARKING.md and DECISIONS.md read.
**On failure**: If files missing, skip advisory.

**Step 6.** Code-doc alignment — Run a lightweight, targeted sync check on the system
docs that will be used for spec generation. Check structural and technology claims only:
file paths, dependency names, module structure, export shapes. Skip behavioral claims
(too expensive for a gate check).

- **Clear**: All checked claims match the codebase
- **Advisory**: Minor drift detected (e.g., file renamed but logic unchanged) — note and proceed
- **Warning**: Structural drift detected (e.g., docs describe a module that no longer exists) —
  suggest running `/cl-reviewer sync` or `/cl-reviewer correct` before proceeding

This is advisory, not blocking. The user can always proceed. But structural drift means
specs will describe a system that doesn't match reality.

**Verify**: Structural claims spot-checked against codebase.
**On failure**: If codebase not accessible, skip with advisory.

**Batch presentation**: Present all gate check results as a single status table rather
than sequential warnings:

| Check | Status | Details |
|-------|--------|---------|
| Active research | Clear / Warning | [details if warning] |
| In-flight proposals | Clear / Warning | [details] |
| Unverified merges | Clear / Warning | [details] |
| Context freshness | Clear / Advisory | [details] |
| Transition advisory | Clear / Advisory | [architectural items or gaps if any] |
| Code-doc alignment | Clear / Advisory / Warning | [sync check results] |

"Gate check complete. [N issues found / All clear]. Proceed?"

The user makes one go/no-go decision for the batch. If any check is a hard blocker
(e.g., unverified merge), call it out prominently: "1 blocker: unverified merge for
P-003 must be resolved before spec generation. 2 advisories: context staleness."

If all clear, proceed. If warnings were issued and the user confirms, proceed with a note
in the spec manifest about the caveat.

### Phase 2: Read All System Docs

**Step 7.** Read `{docsRoot}/system/.manifest.md` for the overall structure.

**Verify**: Manifest file exists and lists all system docs.
**On failure**: If manifest missing, scan {docsRoot}/system/ directory for .md files.

**Step 8.** Dispatch `cl-doc-reader-agent` instances in parallel via the basic Task tool
(one per system doc) to read all system docs.

**Parallel (default — Task tool, no flag required)**

Phase 1: Discover
  Read the manifest from Step 7 → doc list. Total work units: N doc-reader agents.

Phase 2: Spawn
  For each system doc in the manifest:
    Task(subagent_type="cl-doc-reader-agent",
         description="Read {doc name} for spec generation",
         prompt="DOC_PATH: {path}\nFOCUS: types, interfaces, contracts, behavioral rules\nFORMAT: full\nDECISIONS_CONTEXT: {relevant DECISIONS.md entries}")
  Issue ALL Task calls in a single message → parallel launch.

Phase 3: Collect
  Parse each RESULT line: COMPLETE|PARTIAL|FAILED | Type: digest | Doc: ... | Sections: N
  On FAILED/PARTIAL: mark that doc as EXTRACTION_FAILED, log error, continue with remaining docs.

Phase 4: Aggregate
  Unified knowledge base ready for Phase 3 (spec format suggestion) and Phase 4 (spec generation):
  - All defined types, entities, and their properties
  - All interfaces, contracts, and protocols
  - All behavioral rules and constraints
  - All cross-references (for cross-spec dependency table in Step 14)

**Parallel with teams (optional — CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)**
Same as above with TeamCreate("spec-doc-reads") before Phase 2 and TeamDelete() after Phase 3.

**Sequential (orchestration.fanOut: "disabled")**
Read each doc in `docs/system/` directly. Each doc produces: full content summary with
key concepts, all defined types/entities/properties, all interfaces/contracts/protocols,
all behavioral rules/constraints, all cross-references to other docs.

**Verify**: All system docs listed in manifest have been read and summarized.
**On failure**: If a doc fails to read, log error and continue with remaining docs.

### Phase 3: Suggest Spec Format

**Step 9.** Analyze the content and suggest the appropriate format(s). The spec format is NOT
prescribed — it depends on what the system docs describe:

| Content Type | Suggested Format | When |
|-------------|-----------------|------|
| API endpoints | OpenAPI YAML | REST/HTTP APIs |
| Data models | JSON Schema or SQL DDL | Data-heavy systems |
| UI components | Component specs (props/state) | Frontend systems |
| Events/messages | AsyncAPI or event schemas | Event-driven systems |
| Workflows | State machine definitions | Process-heavy systems |
| General | Structured Markdown | Mixed or unclear |

Present your recommendation to the user: "Based on the system docs, I recommend generating
[format] specs because [reason]. The system docs describe [N] key areas that would produce
[M] spec files. Does this format work for you, or would you prefer something different?"

**Verify**: User has confirmed or overridden the format choice.
**On failure**: If user does not respond, wait for confirmation before proceeding.

The user confirms or overrides.

### Phase 4: Generate Specs

**Step 10.** For each significant concept in the system docs, generate a spec file in `{docsRoot}/specs/`.

Every spec must include:
- **Source reference**: Which system doc section(s) it derives from
- **Concrete types**: No ambiguity — "UUID v4", not "a string"
- **Edge cases**: Enumerated, not implied
- **Dependencies**: Which other specs this one references
- **Implementability**: Each spec should be implementable in isolation (bounded context)

**Verify**: Each generated spec has source reference, concrete types, edge cases, dependencies.
**On failure**: Flag specs missing required sections for user review.

**Step 11.** Generate Cross-Cutting Specs — For cross-cutting spec generation (security, error
handling, API conventions, shared types), read `references/cross-cutting-specs.md` and follow
its process. This generates:
- SECURITY_SPEC.md (per-endpoint auth, system security, secure UX, dependency governance)
- Error taxonomy (standard format, code system, propagation chain, per-endpoint catalog)
- API conventions preamble (pagination, naming, filtering, envelope -- inherited by all endpoint specs)
- Shared types inventory (cross-boundary types, serialization contracts, sharing strategy)
- Per-spec edge cases and accessibility requirements sections

**Verify**: Cross-cutting specs generated for all applicable areas.
**On failure**: If system docs don't describe applicable areas, skip with note.

**Step 12.** Generate Test Spec — Generate `{docsRoot}/specs/TEST_SPEC.md` from the same system
doc analysis used for implementation specs. The test spec is NOT test code — it's a
specification that the implementer and autopilot use to write tests. It's generated alongside
implementation specs, not as a separate step.

**Read testing decisions first**: Check `{docsRoot}/DECISIONS.md` for decisions with
category tag `testing` (framework, mock boundaries, test data approach, coverage
expectations). These were captured during bootstrap (via the project profile system or
testing probes) or prior discussion. Respect the P0.5 precedence rules: existing
DECISIONS.md entries > auto-detected > research-generated > presets. If no testing
decisions exist, use sensible defaults and note the gap — the user may want to address
this before implementation.

**TEST_SPEC.md structure**:

```markdown
# Test Specification

**Generated alongside**: [.spec-manifest.md reference]
**Testing framework**: [from DECISIONS.md or "not yet decided"]
**Test data strategy**: [from DECISIONS.md or "not yet decided"]
**Mock boundaries**: [from DECISIONS.md or default below]

## Test Architecture

### Mock Boundaries

Define the default mock boundary for each layer. These apply to ALL modules in that
layer unless a per-module override is specified.

| Layer | Unit Tests | Integration Tests | Rationale |
|-------|-----------|------------------|-----------|
| Database | Mocked (fixtures/factories) | Real test DB | Unit tests stay fast. Integration tests catch constraint issues. |
| External APIs | Always mocked | Always mocked | External dependencies are never hit in tests. |
| Auth | Mocked (helper: `createAuthenticatedContext()`) | Real auth flow | Non-auth unit tests skip auth setup. Auth integration tests use real flow. |
| File system | Mocked (in-memory or temp dirs) | Real temp dirs | Unit tests don't touch disk. Integration tests use isolated temp dirs. |
| Time/dates | Mocked (fake timers) | Real time | Unit tests need deterministic time. |

### Test Data Strategy

| Entity | Factory Function | Key Fixtures | Notes |
|--------|-----------------|-------------|-------|
| [Entity from data spec] | `create[Entity](overrides?)` | [Named fixtures for common states] | [Any special considerations] |

### Test Environment Requirements

| Requirement | Unit Tests | Integration Tests |
|-------------|-----------|------------------|
| Database | Not required | Test DB with migrations applied |
| Dev server | Not required | Running on test port |
| External services | Not required | Mock server (MSW/nock) if needed |
| Browser | Not required (jsdom/happy-dom) | Playwright for E2E |

## Per-Module Test Cases

### [Module Name] (from [spec-file.md])

**Unit Tests**:

| Function/Method | Input | Expected Output | Edge Cases |
|----------------|-------|-----------------|------------|
| [function name] | [input description] | [expected return/behavior] | [edge case inputs and expected handling] |

**Mock boundary**: [What's mocked for this module, if different from default]
**Test data requirements**: [Which factories/fixtures this module needs]

## Cross-Spec Integration Contracts

For every boundary between implementation specs, define the integration test contract.

### [Spec A] <-> [Spec B] Integration

**Boundary**: [What connects them — API endpoint, shared type, event, etc.]

| Flow | Steps | Assertions |
|------|-------|------------|
| [Flow name] | [Step-by-step through the boundary] | [What to verify at each step] |

**Error propagation**: [How errors cross this boundary — what transforms into what]

## Contract Tests

For cross-layer contracts where a producer and consumer must agree on shapes.

| Producer | Consumer | Contract | Verification |
|----------|----------|----------|-------------|
| [API endpoint] | [Frontend component] | [Response shape] | Response matches consumer's type expectation |
```

**Generation rules**:

1. **Per-module unit test cases**: For each implementation spec, generate a companion
   section in TEST_SPEC.md with function -> input -> output -> edge cases (table format).
   Extract these from the spec's concrete types, contracts, and edge cases — which were
   already enumerated in Step 10.

2. **Cross-spec integration contracts**: For every boundary in the cross-spec dependency
   table (from Step 14), generate explicit integration test cases covering: full request
   lifecycle flows, error propagation chains, auth flows.

3. **Contract tests**: For every producer/consumer relationship across specs (API returns
   shape X, frontend consumes shape X), generate a contract test entry.

4. **Mock boundaries**: Use DECISIONS.md testing decisions if available. If not, apply
   defaults (mock DB in unit tests, real DB in integration; always mock external APIs).

5. **Test data**: For each entity in the data spec, define a factory function signature
   and key fixtures covering common states (valid, invalid, edge cases).

**Verify**: TEST_SPEC.md contains per-module test cases, integration contracts, and contract tests.
**On failure**: Flag missing sections; ensure at minimum the test architecture section is generated.

**Step 13.** Generate Operational and Backend Policy Specs — If the system has deployment
targets, external service integrations, data persistence, or backend API endpoints, read
`references/operational-specs.md` and follow its process. This generates:
- CONFIG_SPEC.md (environment variables, secrets, feature flags, deployment targets)
- Migration notes per data spec (ordering, rollback, seed data)
- Observability section per service spec (logging, metrics, health checks)
- Per-service integration specs (third-party endpoints, auth, payloads, rate limits)
- Backend policies section (idempotency, transactions, caching, validation authority)
- Data modeling section per entity spec (deletion, cascade, temporal, volume)
- Code conventions section (file naming, directory structure, import patterns)
- Performance acceptance criteria per spec
- Dependency compatibility notes

**Verify**: Operational specs generated for all applicable areas.
**On failure**: If system docs don't describe applicable areas, skip with note.

### Phase 5: Generate Spec Manifest

**Step 14.** Create `{docsRoot}/specs/.spec-manifest.md`:

```markdown
# Spec Manifest

**Generated**: [date]
**Source docs**: [list all system docs used]
**Format**: [format chosen]
**Waterfall gate**: [CLEAR | CAVEATS — list any warnings from gate check]

## Specs

| Spec File | Source Doc(s) | Source Section(s) | Description |
|-----------|--------------|-------------------|-------------|
| [filename] | [doc name] | Section X, Y | [one-line description] |
| TEST_SPEC.md | [all source docs] | [all sections — derived from implementation specs] | Test architecture, per-module test cases, integration contracts |
| ... | ... | ... | ... |

## Security & Cross-Cutting Specs

| Spec File | Scope | Source |
|-----------|-------|--------|
| SECURITY_SPEC.md | Per-endpoint auth, system security, secure UX, dependency governance | Architecture, DECISIONS.md, PRD |
| (error taxonomy) | Inline in API specs | Architecture, DECISIONS.md |
| (API conventions preamble) | Inherited by all endpoint specs | Architecture, DECISIONS.md |
| (shared types) | Cross-boundary type definitions | Architecture, all endpoint specs |

## Cross-Spec Dependencies

| Spec | Depends On | Shared Entities |
|------|-----------|----------------|
| [spec A] | [spec B] | [entity names] |
| ... | ... | ... |
```

**Verify**: Manifest lists all generated specs with source mappings and cross-spec dependencies.
**On failure**: If any spec is missing from manifest, add it before finalizing.

### Phase 6: Update Tracking

**Step 15.** After generating specs, tell the user: "Specs generated in `{docsRoot}/specs/`. Run
`/cl-implementer spec-review` for a cross-spec consistency check before starting implementation."

**Verify**: All spec files exist in {docsRoot}/specs/ and manifest is complete.
**On failure**: List any missing or incomplete specs.

**Parallelization hint**: While the user reviews the spec format suggestion (Phase 3),
pre-read all system docs in parallel (Phase 2) using subagent dispatch. If the user
confirms the format, spec generation begins immediately with docs already loaded.
Invalidation risk: Low -- format change only affects output structure, not content
gathering.

### Guidance

- **Waterfall is non-negotiable.** Don't generate specs from partial docs. The user can
  override the gate check warnings, but always warn them. Partial specs are worse than no
  specs — they create false confidence.

- **Format follows content.** Don't force everything into one format. If the system has both
  APIs and data models, generate OpenAPI for the APIs and JSON Schema for the models. Use
  whatever format serves the content best.

- **Concrete over abstract.** The whole point of specs is to remove ambiguity. If a system
  doc says "a unique identifier", the spec should say "UUID v4 (string, 36 chars, RFC 4122)".
  If you can't be concrete because the system doc is vague, flag it.

- **Traceability enables maintenance.** Every spec must reference its source. When system
  docs change, traceability tells you which specs need regeneration.

- **Use subagent dispatch for heavy reads.** Phase 2 dispatches one subagent per system doc
  to avoid overloading the main context. This provides the same isolation as a context fork
  without requiring the entire skill to run in a forked context.

## Report

```
SPEC: COMPLETE | Specs: N generated | Format: [format] | Gate: CLEAR
SPEC: COMPLETE | Specs: N generated | Format: [format] | Gate: CAVEATS (M warnings)
SPEC: PARTIAL | Generated: M/N | Blocked: [reason]
```
