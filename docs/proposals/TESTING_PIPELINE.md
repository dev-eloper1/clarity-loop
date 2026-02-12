# Proposal: Testing Pipeline — Test Specs, Test Tasks, and Integration Testing

**Created**: 2026-02-11
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F14-F20, Changes 8-11)
**Author**: Bhushan + AI Researcher
**Depends On**: P0 (SKILL_RENAME_AND_FOLD — complete, all skills now use cl-* namespace), P0.5 (UX_STREAMLINING — complete, establishes decision flow protocol, tiered checkpoints, review styles, project profile system, warmth gradient, and parallelization hints)

## Summary

This proposal adds a structured testing pipeline to Clarity Loop by extending four existing
artifacts: spec generation, start mode, autopilot mode, and bootstrap. Today, the
implementer's only testing mechanism is autopilot Step 3c — writing tests after each task
from acceptance criteria. This is circular: the tests verify the code the implementer just
wrote using the assumptions the implementer just made, rather than verifying against an
independent specification.

The fix introduces testing as a first-class pipeline concern at every stage. Spec generation
produces a `TEST_SPEC.md` alongside implementation specs — defining mock boundaries, test
data strategy, per-module unit test cases, cross-spec integration contracts, and contract
tests. Start mode generates test tasks from TEST_SPEC.md that live as first-class entries in
TASKS.md. Autopilot gains per-milestone integration testing and a full-suite gate before
completion. Bootstrap probes for testing architecture decisions that flow into DECISIONS.md
and inform TEST_SPEC.md generation.

The expected impact: tests verify code against specifications (not against itself), testing
decisions are consistent project-wide (not improvised per-task), and integration boundaries
are tested at milestone checkpoints rather than left to the final verify step.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/PIPELINE_GAP_ANALYSIS.md | F15 (Testing Strategy Needs a Home), F16 (Specification-Testing Duality), F17 (Unit Testing Has No Specification Surface), F18 (Integration Testing Is Entirely Absent), F19 (Test Architecture — The Missing Blueprint), F20 (The Test Spec as a Pipeline Artifact) | Changes 8-11: Test spec generation, test task generation, per-milestone integration testing, expanded bootstrap testing probing |

## System Context

### Research Type: Evolutionary

This proposal extends four existing skill files with testing capabilities. No new skills or
modes are created — testing is woven into existing pipeline stages.

### Current State

| Artifact | Current State Summary | Sections Referenced |
|----------|----------------------|-------------------|
| `skills/cl-implementer/references/spec-mode.md` | Generates implementation specs from system docs. No testing output. Steps 1-6: waterfall gate, read docs, suggest format, generate specs, generate manifest, update tracking. | Steps 4-5 (Generate Specs, Generate Spec Manifest) |
| `skills/cl-implementer/references/start-mode.md` | Generates TASKS.md from spec artifacts. Step 1 pre-checks mention testing only in a coverage gap warning (Step 1.4). Step 3 generates tasks by area. No test-specific task generation. | Steps 1.4 (Spec coverage), 3 (Generate TASKS.md) |
| `skills/cl-implementer/references/autopilot-mode.md` | Self-testing per task in Step 3c (write tests from acceptance criteria). Step 3d runs tests. No per-milestone integration testing. No full-suite gate. P0.5 added tier awareness to Step 3h (checkpoint evaluation categorizes items by Tier 1/2/3). | Steps 3c (Write Tests), 3d (Run Tests), 3h (Checkpoint Evaluation) |
| `skills/cl-implementer/SKILL.md` | Guidelines mention "Testing is spec-driven" (line 284) but no test spec exists for this to reference. P0.5 added a "Decision flow: read before asking" guideline that references the `testing` category. Mode descriptions for spec, start, and autopilot have no testing-specific content. | Guidelines section, Mode Detection section |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation (Step 2) asks "What are the main workflows or user journeys?" — no testing-specific questions. P0.5 added Step 2b (Project Profile Detection) with three-level system (auto-detect, quick research, presets) and Step 2c (Defaults Sheet). Presets already include testing-related defaults (framework, test data, mock boundaries, coverage) but these are generic preset values, not project-specific testing probes. | Greenfield Step 2 (Discovery Conversation), Step 2b (Project Profile Detection), Step 2c (Defaults Sheet) |
| `skills/cl-researcher/SKILL.md` | Bootstrap mode description references bootstrap-guide.md. P0.5 added warmth gradient and decision flow guidelines. No testing-specific content. | Bootstrap Mode section |
| `docs/pipeline-concepts.md` | P0.5 added `ux.*` config keys (`reviewStyle`, `profileMode`, `autoDefaults`, `parallelGeneration`), DECISIONS.md category tags (including `testing`), warmth gradient, and tiered checkpoint definitions. Configuration section now has the full `.clarity-loop.json` schema. | Configuration section, DECISIONS.md section |
| `docs/cl-implementer.md` | Public-facing docs describe spec mode, start mode, autopilot. Autopilot section mentions "self-testing" from acceptance criteria. No test spec, no test tasks, no integration testing. | Spec, Start, Autopilot sections |
| `docs/cl-researcher.md` | Public-facing docs describe bootstrap. Discovery conversation has no testing questions. | Bootstrap section |

### Proposed State

After this proposal is applied:

1. **Spec generation** produces `TEST_SPEC.md` as a parallel artifact alongside implementation
   specs — containing test architecture, per-module unit test cases, cross-spec integration
   contracts, and contract test definitions.

2. **Start mode** generates test tasks from TEST_SPEC.md as first-class entries in TASKS.md —
   a test infrastructure setup task, per-module unit test tasks, per-milestone integration
   test tasks, and contract test tasks.

3. **Autopilot** has two test execution modes: per-task (existing, for unit tests) and
   per-milestone (new, for integration tests when an area or boundary completes), plus a
   full-suite gate before reporting completion.

4. **Bootstrap** probes for testing architecture decisions (framework, mock boundaries, test
   data approach, coverage expectations, integration priority) that are recorded in
   DECISIONS.md and consumed by spec generation when producing TEST_SPEC.md.

5. **Public-facing docs** reflect all of the above.

## Change Manifest

> This is the contract between the proposal and the skill files. Each row specifies exactly
> what changes where.

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|-------------------|------------|----------------|------|-------------|
| 1 | Add TEST_SPEC.md generation to spec mode (Steps 4b, 5) | `skills/cl-implementer/references/spec-mode.md` | Step 4 (Generate Specs), Step 5 (Generate Spec Manifest) | Add | F17, F19, F20 |
| 2 | Add test task generation to start mode (Steps 2, 3) | `skills/cl-implementer/references/start-mode.md` | Step 2 (Read All Spec Artifacts), Step 3 (Generate Unified TASKS.md) | Add | F17, F18, F19 |
| 3 | Update start mode pre-checks to use TEST_SPEC.md | `skills/cl-implementer/references/start-mode.md` | Step 1.4 (Spec coverage) | Modify | F15 |
| 4 | Add per-milestone integration testing and full-suite gate to autopilot | `skills/cl-implementer/references/autopilot-mode.md` | Step 3d (Run Tests), Step 3h (Checkpoint Evaluation), new Step 3d-int | Add | F18, F19 |
| 5 | Update autopilot Step 3c to reference TEST_SPEC.md for test cases | `skills/cl-implementer/references/autopilot-mode.md` | Step 3c (Write Tests) | Modify | F17, F20 |
| 6 | Add per-milestone integration testing to autopilot summary | `skills/cl-implementer/references/autopilot-mode.md` | Step 4 (Summary Report) | Modify | F18 |
| 7 | Update verify mode to include test coverage as a verification dimension (Dimension 5: Test Coverage Against Test Spec). Note: P3 also adds a new dimension (Dependency Audit) — P2 claims Dimension 5, P3 should use Dimension 6. After both P2 and P3 merge, verify mode will have six dimensions total. | `skills/cl-implementer/references/verify-mode.md` | Four Verification Dimensions | Add | F19 |
| 8 | Update run mode Step 3c to reference TEST_SPEC.md when writing tests | `skills/cl-implementer/references/run-mode.md` | Step 3 (Queue Processing), substep 3c | Add | F20 |
| 9 | Update SKILL.md guidelines to reference TEST_SPEC.md | `skills/cl-implementer/SKILL.md` | Guidelines section | Modify | F15, F20 |
| 10 | Update SKILL.md spec mode description to mention TEST_SPEC.md | `skills/cl-implementer/SKILL.md` | Spec Mode section | Modify | F20 |
| 11 | Update SKILL.md start mode description to mention test tasks | `skills/cl-implementer/SKILL.md` | Start Mode section | Modify | F17 |
| 12 | Update SKILL.md autopilot mode description to mention integration testing | `skills/cl-implementer/SKILL.md` | Autopilot Mode section | Modify | F18 |
| 13 | Add testing probes to bootstrap discovery conversation | `skills/cl-researcher/references/bootstrap-guide.md` | Greenfield Step 2 (Discovery Conversation) | Add | F15, F19 |
| 14 | Update cl-implementer public docs for test spec, test tasks, integration testing | `docs/cl-implementer.md` | Spec, Start, Autopilot sections | Modify | F15-F20 |
| 15 | Update cl-researcher public docs for bootstrap testing probes | `docs/cl-researcher.md` | Bootstrap section | Modify | F19 |
| 16 | Update pipeline-concepts.md configuration section for testing config | `docs/pipeline-concepts.md` | Configuration section | Add | F19 |

**Scope boundary**: This proposal ONLY modifies the files/sections listed above. Changes to
cl-designer (behavioral test scenarios from walkthrough), browser validation tooling
(autopilot Step 3e), and security/error specs are out of scope — those are separate proposals
(P1, P3 respectively).

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|--------------|---------------------|-----------|
| P1 (Behavioral Foundation) | autopilot-mode.md Step 3e (UI Validation); bootstrap-guide.md Step 2 (Discovery Conversation) | P1 modifies Step 3e for browser tooling. P2 adds Step 3d-int and modifies Step 3d. No overlap — P1 handles browser validation, P2 handles test execution. Can merge in either order. **Bootstrap-guide.md overlap**: Both P1 and P2 add discovery questions to bootstrap-guide.md Step 2. P1 adds behavioral, accessibility, resilience, and content probing questions. P2 adds testing strategy probes. Both additions are complementary — P1's behavioral questions and P2's testing questions target different subsections. Merge both in either order; the reviewer should ensure questions from both proposals appear without duplication. |
| P3 (Security & Error Taxonomy) | spec-mode.md Step 4 (Generate Specs); verify-mode.md Verification Dimensions | P3 adds SECURITY_SPEC.md generation to spec-mode.md. P2 adds TEST_SPEC.md generation. Both extend the same step but produce different artifacts. No content overlap — can merge in either order. **Verify mode dimension numbering**: Both P2 and P3 add a new dimension after Dimension 4. P2 claims Dimension 5 (Test Coverage Against Test Spec). P3 should use Dimension 6 (Dependency Audit). After both merge, verify mode will have six dimensions total. SKILL.md and docs/cl-implementer.md dimension count references must reflect the total after both merge (six dimensions, not five). |

## Detailed Design

### Change Area 1: Test Spec Generation in Spec Mode

**What**: Extend spec-mode.md to generate `{docsRoot}/specs/TEST_SPEC.md` alongside
implementation specs. The test spec is a specification artifact — NOT test code. It defines
what should be tested, how modules should be isolated, and what integration boundaries exist.

**Why**: F17 found that unit testing has no specification surface — the implementer improvises
mock boundaries, test data, and test cases per-task, resulting in inconsistent testing
approaches across modules. F20 proposed TEST_SPEC.md as the solution: a parallel output from
the same system doc read that spec generation already performs.

**Applies to Change Manifest rows**: 1, 10

---

**Target**: `skills/cl-implementer/references/spec-mode.md`

**Current** (Step 4: Generate Specs):
> For each significant concept in the system docs, generate a spec file in `{docsRoot}/specs/`.
> Every spec must include: Source reference, Concrete types, Edge cases, Dependencies,
> Implementability.

**Proposed** — Add a new subsection **Step 4b: Generate Test Spec** after Step 4:

```markdown
### Step 4b: Generate Test Spec

Generate `{docsRoot}/specs/TEST_SPEC.md` from the same system doc analysis used for
implementation specs. The test spec is NOT test code — it's a specification that the
implementer and autopilot use to write tests. It's generated alongside implementation
specs, not as a separate step.

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

### [Spec A] ↔ [Spec B] Integration

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
   section in TEST_SPEC.md with function → input → output → edge cases (table format).
   Extract these from the spec's concrete types, contracts, and edge cases — which were
   already enumerated in Step 4.

2. **Cross-spec integration contracts**: For every boundary in the cross-spec dependency
   table (from Step 5), generate explicit integration test cases covering: full request
   lifecycle flows, error propagation chains, auth flows.

3. **Contract tests**: For every producer/consumer relationship across specs (API returns
   shape X, frontend consumes shape X), generate a contract test entry.

4. **Mock boundaries**: Use DECISIONS.md testing decisions if available. If not, apply
   defaults (mock DB in unit tests, real DB in integration; always mock external APIs).

5. **Test data**: For each entity in the data spec, define a factory function signature
   and key fixtures covering common states (valid, invalid, edge cases).
```

**Current** (Step 5: Generate Spec Manifest):
> Create `{docsRoot}/specs/.spec-manifest.md` with Generated date, Source docs, Format,
> Waterfall gate, Specs table, Cross-Spec Dependencies table.

**Proposed** — Add TEST_SPEC.md to the manifest. In the Specs table, add:

```markdown
| Spec File | Source Doc(s) | Source Section(s) | Description |
|-----------|--------------|-------------------|-------------|
| TEST_SPEC.md | [all source docs] | [all sections — derived from implementation specs] | Test architecture, per-module test cases, integration contracts |
```

---

**Target**: `skills/cl-implementer/SKILL.md`

**Current** (Spec Mode section, line 144-148):
> Generates implementation-ready specs from verified system docs. Enforces the waterfall
> gate — specs are generated only after all system docs are complete and verified. The
> spec format adapts to the content...

**Proposed**:
> Generates implementation-ready specs from verified system docs, including `TEST_SPEC.md` —
> a parallel artifact defining test architecture, per-module unit test cases, cross-spec
> integration contracts, and contract tests. Enforces the waterfall gate — specs are
> generated only after all system docs are complete and verified. The spec format adapts
> to the content...

---

### Change Area 2: Start Mode Test Task Generation

**What**: Extend start mode to generate test tasks from TEST_SPEC.md as first-class entries
in TASKS.md — with acceptance criteria, spec references (to TEST_SPEC.md), dependencies, and
status tracking.

**Why**: F17 found that unit tests are written ad-hoc per task by autopilot with no
specification backing. F18 found that integration testing is entirely absent. F19 identified
four types of test tasks needed: infrastructure, unit, integration, and contract. Test tasks
as first-class TASKS.md entries means they get the same tracking, dependency management, and
verification as implementation tasks.

**Applies to Change Manifest rows**: 2, 3, 11

---

**Target**: `skills/cl-implementer/references/start-mode.md`

**Current** (Step 1.4 — Spec coverage):
> Special case: if system docs mention testing requirements (search PRD for "test",
> "coverage", "CI", "CI/CD") but no testing spec exists, offer three paths:
> a) Add test tasks manually to TASKS.md after generation
> b) Run `/cl-researcher research 'testing strategy'` to create proper specs first
> c) Skip — implement features first, address testing later

**Proposed**:
> Special case: if `TEST_SPEC.md` exists in `{docsRoot}/specs/`, test tasks will be
> generated automatically (see Step 3). If `TEST_SPEC.md` does NOT exist but system docs
> mention testing requirements (search PRD for "test", "coverage", "CI", "CI/CD"), warn:
> "System docs mention testing but no TEST_SPEC.md exists. Options:
> a) Regenerate specs with `/cl-implementer spec` — this will produce TEST_SPEC.md
> b) Add test tasks manually to TASKS.md after generation
> c) Skip — implement features first, address testing later"

---

**Current** (Step 2: Read All Spec Artifacts):
> 1. Parse `.spec-manifest.md`...
> 2. Read each spec file in full...
> 3. Read `{docsRoot}/specs/DESIGN_TASKS.md` if it exists...
> 4. Read Architecture doc for tech stack context...

**Proposed** — Add item 5:

```markdown
5. Read `{docsRoot}/specs/TEST_SPEC.md` if it exists. Parse its structure:
   - Test architecture (mock boundaries, test data strategy, environment requirements)
   - Per-module unit test cases
   - Cross-spec integration contracts
   - Contract test definitions
```

---

**Current** (Step 3: Generate Unified TASKS.md — Task generation rules):
> 1. **One task per bounded implementation unit.**...
> 2. **Areas, not phases.**...
> 3. **DESIGN_TASKS.md merge.**...
> 4. **Acceptance criteria from specs.**...
> 5. **Spec hash per task.**...
> 6. **Task IDs are sequential.**...
> 7. **Source marker.**...

**Proposed** — Add rules 8-11:

```markdown
8. **Test infrastructure task.** If TEST_SPEC.md exists, generate a test infrastructure
   task in the "Testing" area:

   ```markdown
   ## Area: Testing

   ### T-00X: Test Infrastructure Setup
   - **Spec reference**: TEST_SPEC.md, Test Architecture section
   - **Spec hash**: [hash]
   - **Dependencies**: None
   - **Status**: pending
   - **Source**: spec-derived
   - **Acceptance criteria**:
     - [ ] Test runner configured ([framework] from TEST_SPEC.md/DECISIONS.md)
     - [ ] Test database setup (if TEST_SPEC.md requires it for integration tests)
     - [ ] Mock server configured (if TEST_SPEC.md specifies external API mocking)
     - [ ] Factory functions created for each entity in TEST_SPEC.md Test Data table
     - [ ] Test helper utilities in place (e.g., `createAuthenticatedContext()`)
     - [ ] `npm test` (or equivalent) runs and passes with zero tests
   - **Complexity**: Medium
   ```

   This task has NO dependencies and can run in parallel with early implementation tasks.

9. **Unit test tasks.** For each per-module section in TEST_SPEC.md, generate a unit test
   task that FOLLOWS its corresponding implementation task:

   ```markdown
   ### T-005T: Auth Service Unit Tests
   - **Spec reference**: TEST_SPEC.md, Per-Module Test Cases > Auth Service
   - **Spec hash**: [hash of TEST_SPEC.md section]
   - **Dependencies**: T-005 (Auth Service implementation), T-00X (Test Infrastructure)
   - **Status**: pending
   - **Source**: spec-derived
   - **Acceptance criteria**:
     - [ ] Unit tests cover all functions in TEST_SPEC.md table for this module
     - [ ] Edge cases from TEST_SPEC.md table are tested
     - [ ] Mock boundaries match TEST_SPEC.md specification
     - [ ] All tests pass
   - **Complexity**: [derived from implementation task complexity]
   ```

   Unit test task IDs use the `T-NNNT` suffix convention — tied to their implementation
   task. This makes the relationship visible in TASKS.md and the dependency graph.

10. **Integration test tasks.** For each cross-spec integration contract in TEST_SPEC.md,
    generate an integration test task that depends on ALL implementation tasks it spans:

    ```markdown
    ### T-0XX: Data-API Integration Tests
    - **Spec reference**: TEST_SPEC.md, Cross-Spec Integration Contracts > Data ↔ API
    - **Spec hash**: [hash]
    - **Dependencies**: T-001 (DB schema), T-002 (Auth service), T-003 (API endpoints), T-00X (Test Infrastructure)
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Full request lifecycle flows tested per TEST_SPEC.md
      - [ ] Error propagation chains verified per TEST_SPEC.md
      - [ ] All integration tests pass against running test environment
    - **Complexity**: Complex
    ```

    Integration test tasks are placed in the "Testing" area and positioned in the
    dependency graph AFTER all implementation tasks they span.

11. **Contract test tasks.** For each contract in TEST_SPEC.md's Contract Tests section,
    generate a task verifying cross-layer contracts:

    ```markdown
    ### T-0XX: API-Frontend Contract Tests
    - **Spec reference**: TEST_SPEC.md, Contract Tests
    - **Spec hash**: [hash]
    - **Dependencies**: [API implementation tasks], [Frontend implementation tasks], T-00X (Test Infrastructure)
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Response shapes verified against consumer type expectations
      - [ ] All contract tests pass
    - **Complexity**: Medium
    ```
```

---

**Target**: `skills/cl-implementer/SKILL.md`

**Current** (Start Mode section, line 163-168):
> Generates a unified `TASKS.md` from ALL spec artifacts (tech specs + DESIGN_TASKS.md if it
> exists). Tasks are organized by implementation area with a cross-area Mermaid dependency
> graph. Creates `IMPLEMENTATION_PROGRESS.md` for session persistence. Populates Claude Code's
> task system via `TaskCreate`.

**Proposed**:
> Generates a unified `TASKS.md` from ALL spec artifacts (tech specs + DESIGN_TASKS.md +
> TEST_SPEC.md if they exist). Tasks are organized by implementation area with a cross-area
> Mermaid dependency graph. If TEST_SPEC.md exists, generates test tasks as first-class
> entries: a test infrastructure task (no dependencies, parallel with early impl), per-module
> unit test tasks (follow their implementation task), per-milestone integration test tasks
> (depend on all spanned impl tasks), and contract test tasks. Creates
> `IMPLEMENTATION_PROGRESS.md` for session persistence. Populates Claude Code's task system
> via `TaskCreate`.

---

### Change Area 3: Autopilot Per-Milestone Integration Testing

**What**: Extend autopilot with two additions: (a) per-milestone integration testing when an
area or integration boundary completes, and (b) a full-suite gate before reporting "all tasks
complete." Also update Step 3c to reference TEST_SPEC.md for test case generation.

**Why**: F18 found that integration testing is entirely absent — autopilot only runs per-task
unit tests. Per-milestone integration testing catches composition failures (the root cause
identified in the research: individual components work but their integration breaks). The
full-suite gate catches regressions that per-task tests miss.

**Applies to Change Manifest rows**: 4, 5, 6, 12

---

**Target**: `skills/cl-implementer/references/autopilot-mode.md`

**Current** (Step 3c: Write Tests):
> 1. Read the task's acceptance criteria from TASKS.md
> 2. Translate each criterion into one or more test cases:
>    - **Behavioral criteria** ("user can log in with valid credentials") → integration test
>    - **Structural criteria** ("exports a `UserService` class") → unit test
>    - **Edge case criteria** ("returns 401 for expired tokens") → unit test
>    - **UI criteria** ("shows loading spinner while fetching") → component test or browser test
> 3. Write tests in the project's testing framework (detected from package.json / config)
> 4. If no testing framework exists, ask user once...

**Proposed**:
```markdown
#### 3c: Write Tests

**This is the key difference from run mode.** After implementing, write tests that
validate the task's acceptance criteria:

1. Read the task's acceptance criteria from TASKS.md
2. **Check TEST_SPEC.md** — if the task has a corresponding per-module section in
   TEST_SPEC.md, use it as the primary test specification:
   - Use the function → input → output → edge cases table for unit test cases
   - Use the specified mock boundaries (don't improvise — follow the spec)
   - Use the specified test data factories and fixtures
   - If the task is a test task (T-NNNT, integration, or contract), implement the
     test cases defined in TEST_SPEC.md directly
3. **Fallback to acceptance criteria** — if no TEST_SPEC.md exists or the task has no
   corresponding test spec section, fall back to translating acceptance criteria:
   - **Behavioral criteria** ("user can log in with valid credentials") → integration test
   - **Structural criteria** ("exports a `UserService` class") → unit test
   - **Edge case criteria** ("returns 401 for expired tokens") → unit test
   - **UI criteria** ("shows loading spinner while fetching") → component test or browser test
4. Write tests in the project's testing framework (detected from package.json / config)
5. If no testing framework exists, ask user once: "No test framework detected. Options:
   a) Set one up (I'll add vitest/jest/pytest), b) Skip self-testing (reduces autopilot
   reliability), c) Use assertion-based checks only (no framework needed)."
   Log the choice to DECISIONS.md with category `testing`.

**Test file convention**: Place tests adjacent to implementation files or in the project's
existing test directory. Follow existing conventions if tests already exist. Follow
TEST_SPEC.md conventions if specified.
```

---

**Current** (Step 3d: Run Tests):
> 1. Run the tests written in 3c
> 2. If all pass → task verified → proceed to 3f
> 3. If tests fail:
>    - **Attempt 1**: Read the error, debug, fix the implementation (not the test)
>    - **Attempt 2**: If still failing, re-examine the test — is the test wrong?
>    - **Attempt 3**: If still failing, check if it's a context-gap or design-gap
>    - After 3 failed attempts → **stop and ask the user**...

**Proposed** — Keep existing Step 3d unchanged but add new Step 3d-int after it:

```markdown
#### 3d-int: Integration Test Check (Milestone Gate) — Tier 2

This step is classified as **Tier 2 (Batch Review)**: integration test results are
presented as a summary at the next checkpoint. The user reviews the batch and flags
issues. Respects `ux.autoDefaults` — if set to `"tier2-3"`, integration gate results
auto-proceed (logged with `[auto-default]` tag).

After completing a task, check if it triggers a milestone integration test:

1. **Area completion**: If this was the last pending task in an implementation area
   (e.g., all Data Layer tasks are now `done`), check TASKS.md for integration test
   tasks that depend on this area. If any exist and all their dependencies are now
   satisfied, queue them for immediate execution.

2. **Integration boundary**: If this task completes an integration boundary (e.g.,
   both sides of an API ↔ DB contract are now implemented), check for integration
   test tasks spanning that boundary.

3. **Execute integration tests**: When triggered, run the integration test task:
   - Start any required infrastructure (test DB, mock server) if not running
   - Execute the integration test suite for the completed boundary
   - If all pass → mark the integration test task as `done` → continue
   - If tests fail → create fix tasks targeting the specific seam:
     ```
     F-NNN: Fix [boundary] integration failure (integration-failure from T-0XX)
     - Source task: T-0XX (integration test task)
     - Discovered during: milestone gate after T-[last impl task]
     - Seam: [which integration boundary failed]
     - Failure: [specific test failure]
     ```
   - Fix tasks take priority per standard run mode rules

4. **Do not block**: If integration test dependencies are not yet satisfied, continue
   to the next implementation task. Integration tests run when ready, not when checked.
```

---

**Current** (Step 3h: Checkpoint Evaluation — at end):
> After the task (or parallel group) completes:
> - `checkpoint: none` → continue to next task
> - `checkpoint: phase` → if this was the last task in an area, stop and report
> - `checkpoint: N` → if N tasks completed since last stop, stop and report
> - `checkpoint: every` → stop and report

**Proposed** — Add full-suite gate. Note: P0.5 already added tier awareness to Step 3h
(categorizing checkpoint items by Tier 1/2/3). The full-suite gate is an addition that
does not modify the existing checkpoint or tier logic:

```markdown
#### 3h: Checkpoint Evaluation

After the task (or parallel group) completes:

- `checkpoint: none` → continue to next task
- `checkpoint: phase` → if this was the last task in an area, stop and report
- `checkpoint: N` → if N tasks completed since last stop, stop and report
- `checkpoint: every` → stop and report

[P0.5 tier awareness remains unchanged — Tier 1/2/3 categorization of checkpoint items.]

**Full-Suite Gate** (Tier 1 — must confirm): Before reporting "all tasks complete"
(when the last pending task finishes), run the ENTIRE test suite — all unit tests, all
integration tests, all contract tests:

1. Run `npm test` (or equivalent) to execute the full suite
2. If all pass → proceed to summary report
3. If failures:
   - Identify which tests regressed (they passed when first written but fail now)
   - Create fix tasks for regressions
   - Process fix tasks before declaring completion
   - Re-run full suite after fixes
4. Report full-suite results in the summary (see Step 4)

The full-suite gate catches regressions that per-task and per-milestone tests miss —
a later task's code change may break an earlier task's tests without triggering a
spot-check (if the files don't overlap).
```

---

**Current** (Step 4: Summary Report):
> ```
> Autopilot Summary
> =================
> Tasks completed:   [N] (since last checkpoint)
> Tasks remaining:   [M]
> Tests written:     [X] ([Y] passing, [Z] failing)
> Fix tasks:         [A] created, [B] resolved
> Screenshots:       [C] captured ([D] need visual review)
> ```

**Proposed**:
```markdown
### Step 4: Summary Report

**Review style compatibility**: Test result presentation in the summary respects
`ux.reviewStyle` from `.clarity-loop.json`:
- `"batch"` (default): Present all test results in the summary table below
- `"serial"`: Present test results one area at a time (integration gate results,
  then unit test results, then contract test results)
- `"minimal"`: Auto-approve test results with a condensed one-line summary

At checkpoints and at the end of the run, present:

```
Autopilot Summary
=================
Tasks completed:      [N] (since last checkpoint)
Tasks remaining:      [M]
Tests written:        [X] ([Y] passing, [Z] failing)
  Unit tests:         [U] passing
  Integration tests:  [I] passing ([J] milestones tested)
  Contract tests:     [C] passing
Fix tasks:            [A] created, [B] resolved
Integration gates:    [G] passed, [H] failed
Full-suite gate:      [PASS / NOT YET / FAIL — N regressions]
Screenshots:          [S] captured ([T] need visual review)
```

If this is the final summary (all tasks complete + full-suite gate passed):
```
Final Summary
=============
Implementation:       [N] tasks complete
Test coverage:        [U] unit, [I] integration, [C] contract tests
Full-suite gate:      PASS (all [total] tests passing)
Integration gates:    [G] milestones verified
Regressions found:    [R] (all resolved)
```
```

---

**Target**: `skills/cl-implementer/SKILL.md`

**Current** (Autopilot Mode section, line 186-189):
> Run mode with two additions: **self-testing** and **autonomous progression**. The implementer
> writes tests from acceptance criteria, runs them to verify its own work, commits per task,
> and only stops at user-configured checkpoints or when it hits a genuine blocker. Parallel
> execution where the dependency graph allows.

**Proposed**:
> Run mode with three additions: **self-testing**, **integration testing**, and **autonomous
> progression**. The implementer writes tests from acceptance criteria (and TEST_SPEC.md when
> available), runs them to verify its own work, commits per task, and only stops at
> user-configured checkpoints or when it hits a genuine blocker. At milestone boundaries
> (area completion or integration boundary completion), runs integration test tasks. Before
> final completion, runs the full test suite as a regression gate. Parallel execution where
> the dependency graph allows.

---

### Change Area 4: Autopilot Step 3c TEST_SPEC.md Integration in Run Mode

**What**: Update run-mode.md Step 3c to reference TEST_SPEC.md when the implementer writes
verification checks during run mode (not autopilot). While run mode doesn't have formal
self-testing like autopilot, its verification step (3d) checks acceptance criteria — and
those criteria should reference TEST_SPEC.md when available.

**Why**: F20 established that TEST_SPEC.md should be the source of truth for what to test.
Run mode's verification (Step 3d) should also be informed by it.

**Applies to Change Manifest row**: 8

---

**Target**: `skills/cl-implementer/references/run-mode.md`

**Current** (Step 3c: Implement):
> 1. Read the task's spec reference in full
> 2. Read any dependency tasks' files (for context on what already exists)
> 3. **Load relevant context**...
> 4. Implement the code to meet the acceptance criteria
> 5. Test/verify the implementation against each criterion
> 6. Record files modified...

**Proposed** — Add to item 5:

```markdown
5. Test/verify the implementation against each criterion. If `TEST_SPEC.md` exists and
   has a per-module section for this task's spec reference, use the test cases defined
   there as additional verification criteria — particularly the edge cases and mock
   boundary specifications. This does not mean writing formal test files in run mode
   (that's autopilot's job) — it means checking the implementation against the test
   spec's expectations to catch issues before moving on.
```

---

### Change Area 5: Verify Mode Test Coverage Dimension

**What**: Add a fifth verification dimension to verify mode: test coverage against
TEST_SPEC.md.

**Why**: F19 identified that test architecture is a system-level concern. Verify mode checks
four dimensions but none of them verify that the test suite matches the test specification.
A project could have all implementation acceptance criteria met but have missing or
non-conforming tests.

**Applies to Change Manifest row**: 7

---

**Target**: `skills/cl-implementer/references/verify-mode.md`

**Current** (Four Verification Dimensions):
> #### Dimension 1: Per-Task Acceptance Criteria
> #### Dimension 2: Per-Spec Contract Compliance
> #### Dimension 3: Cross-Spec Integration
> #### Dimension 4: Spec-to-Doc Alignment

**Proposed** — Add Dimension 5:

```markdown
#### Dimension 5: Test Coverage Against Test Spec

If `TEST_SPEC.md` exists, verify that the test suite conforms to the specification.

This catches:
- Missing test files for modules that TEST_SPEC.md defines test cases for
- Mock boundaries that don't match TEST_SPEC.md (e.g., spec says mock DB, tests use real DB)
- Missing integration tests for boundaries defined in TEST_SPEC.md
- Missing contract tests
- Test data factories that don't cover all entities in TEST_SPEC.md

For each section in TEST_SPEC.md:
1. Check that corresponding test files exist
2. Verify test count covers the specified test cases (not necessarily 1:1, but
   all specified functions/flows should have at least one test)
3. Verify integration test tasks match cross-spec integration contracts
4. Run the full test suite and report results

If TEST_SPEC.md doesn't exist, skip this dimension with a note: "No TEST_SPEC.md
found — test coverage verification skipped. Consider regenerating specs to include
test specifications."
```

Update the Output section to include Dimension 5:

```markdown
### Test Coverage (if TEST_SPEC.md exists)
- Per-module unit test coverage: 8/8 modules have tests ✓
  (or: Auth Service module has 3/7 specified test cases covered)
- Integration test coverage: 3/3 boundaries tested ✓
- Contract test coverage: 2/2 contracts verified ✓
- Full suite: 47 tests passing ✓
```

---

### Change Area 6: Bootstrap Testing Probes

**What**: Enhance the bootstrap testing probes to integrate with the P0.5 project profile
system. The profile system (Level 1 auto-detect, Level 2 quick research, Level 3 presets)
already captures generic testing defaults (framework, test data, mock boundaries, coverage)
via presets and auto-detection. This change adds a deeper testing strategy probe to Step 2
that captures integration-specific decisions not covered by the profile system, and ensures
all testing decisions use the `testing` category tag in DECISIONS.md.

**Why**: F15 found that testing strategy has no home in the pipeline. F19 found that test
architecture decisions (framework, mock boundaries, test data approach) are project-wide
decisions that must be made before implementation, not per-task. P0.5's profile system
partially addresses this — auto-detect finds existing test frameworks, and presets provide
defaults for mock boundaries and coverage. But the profile system captures generic testing
decisions, not project-specific testing architecture (integration boundaries, priority
areas, test data relationships). The testing probes complement the profile system by filling
these deeper gaps.

**Applies to Change Manifest rows**: 13, 15

---

**Target**: `skills/cl-researcher/references/bootstrap-guide.md`

**Current** (Greenfield Step 2: Discovery Conversation — "Then dig deeper"):
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - Are there performance, security, or compliance requirements?
> - What's the scope? What's explicitly out of scope?

**Proposed** — Add a testing probe section after the existing questions:

```markdown
**Testing strategy (probe when project type warrants it — skip for pure documentation
or simple scripts):**

The project profile system (Step 2b) already captures basic testing decisions via
auto-detect and presets (framework, mock boundaries, test data approach, coverage
expectations). These probes go deeper into project-specific testing architecture:

- "What integration boundaries matter most? (API contracts? Database operations?
  Full user flows? Authentication chain?)"
  → Record in DECISIONS.md with category `testing`
- "Are there any testing constraints? (CI time budget, specific test environments,
  external service dependencies that can't be mocked?)"
  → Record in DECISIONS.md with category `testing`

If the profile system already resolved framework, mock boundaries, test data, and
coverage via auto-detect or presets, don't re-ask those. Only probe for gaps.

These are ARCHITECTURE-LEVEL decisions. Don't ask for implementation details — ask for
strategy and philosophy. The answers go into DECISIONS.md with category tag `testing`
and are consumed by spec generation when producing TEST_SPEC.md.

**If the user doesn't have strong opinions and the profile system provided no
testing defaults**: Use sensible defaults:
- Framework: vitest (for JS/TS projects) or pytest (for Python)
- Test data: factories for entities, fixtures for API responses
- Mocking: mock DB in unit tests, real test DB in integration tests, always mock
  external APIs
- Coverage: focus on business logic and integration boundaries
- Integration priority: API contracts and auth flows

Record the defaults in DECISIONS.md with source `[auto-default]` and category `testing`.
```

---

**Target**: `docs/cl-researcher.md`

**Current** (Bootstrap section, under Greenfield):
> 1. Discovery conversation about your project — goals, users, tech stack, constraints

**Proposed**:
> 1. Discovery conversation about your project — goals, users, tech stack, constraints,
>    testing strategy (framework, mock boundaries, test data approach, coverage expectations)

---

### Change Area 7: SKILL.md Guidelines Update

**What**: Update the cl-implementer SKILL.md guidelines to reference TEST_SPEC.md as the
authoritative source for testing decisions.

**Why**: F15 identified that testing strategy needs a home. The existing guideline "Testing
is spec-driven" is aspirational — it references test specs that don't exist. After this
proposal, TEST_SPEC.md will exist, making the guideline concrete.

**Applies to Change Manifest row**: 9

---

**Target**: `skills/cl-implementer/SKILL.md`

**Current** (Guidelines, line 284):
> - **Testing is spec-driven**: If testing specs exist, generate testing tasks. If system docs
>   mention testing but no spec exists, nudge the user. Don't decide what to test — that's a
>   research concern.

**Proposed**:
```markdown
- **Testing is spec-driven**: `TEST_SPEC.md` is the authoritative source for testing
  decisions — mock boundaries, test data strategy, per-module test cases, integration
  contracts, and contract tests. When TEST_SPEC.md exists, autopilot Step 3c uses it
  instead of improvising from acceptance criteria. When it doesn't exist, nudge the user:
  "No TEST_SPEC.md found. Regenerate specs with `/cl-implementer spec` to produce one, or
  continue with acceptance-criteria-based testing (less consistent)." Test tasks generated
  from TEST_SPEC.md in start mode are first-class tasks — they have acceptance criteria,
  dependencies, and status tracking like any implementation task. TEST_SPEC.md consumes
  decisions with category tag `testing` from DECISIONS.md (per the P0.5 decision flow
  protocol — check before asking, respect precedence rules).
```

---

### Change Area 8: Public-Facing Documentation Updates

**What**: Update `docs/cl-implementer.md` and `docs/pipeline-concepts.md` to reflect
TEST_SPEC.md, test tasks, integration testing, and testing configuration.

**Why**: Public-facing docs must reflect the actual skill behavior.

**Applies to Change Manifest rows**: 14, 16

---

**Target**: `docs/cl-implementer.md`

**Current** (Spec section, Step 3: Generate Specs):
> For each significant concept, a spec file is created in `{docsRoot}/specs/`.

**Proposed** — Add after Step 4 (Generate Spec Manifest):

```markdown
### Step 5: Generate Test Spec

Generates `{docsRoot}/specs/TEST_SPEC.md` alongside implementation specs. The test spec
defines test architecture decisions (mock boundaries, test data strategy, environment
requirements), per-module unit test cases (function/input/output/edge cases), cross-spec
integration contracts, and contract tests.

TEST_SPEC.md consumes testing decisions from DECISIONS.md (captured during bootstrap) and
is consumed by start mode (test task generation) and autopilot (test case specification).

| Section | Content |
|---------|---------|
| **Test Architecture** | Mock boundaries per layer, test data factories, environment requirements |
| **Per-Module Test Cases** | Function → input → expected output → edge cases (table format) |
| **Cross-Spec Integration Contracts** | Full request lifecycle flows, error propagation chains |
| **Contract Tests** | Producer/consumer response shape verification |
```

**Current** (Start section):
> Tasks are organized by **implementation area** (Data Layer, API Layer, UI Layer, etc.)...

**Proposed** — Add after existing content:

```markdown
### Test Tasks

If TEST_SPEC.md exists, start mode generates four types of test tasks:

| Task Type | Naming | Dependencies | When |
|-----------|--------|-------------|------|
| **Test infrastructure** | T-00X | None (parallel with early impl) | Always first |
| **Unit test** | T-NNNT (suffix of impl task) | Impl task + test infrastructure | After each module |
| **Integration test** | T-0XX | All spanned impl tasks + infrastructure | After area/boundary completion |
| **Contract test** | T-0XX | Producer + consumer impl tasks + infrastructure | After both sides implemented |

Test tasks are first-class in TASKS.md — acceptance criteria, spec references, dependencies,
status tracking. They appear in the dependency graph and are processed by run/autopilot modes.
```

**Current** (Autopilot section):
> Run mode with two additions: **self-testing** and **autonomous progression**.

**Proposed**:
> Run mode with three additions: **self-testing**, **per-milestone integration testing**, and
> **autonomous progression**.

Add under Self-Testing:

```markdown
### Integration Testing

At milestone boundaries, autopilot runs integration tests:

| Trigger | What Runs |
|---------|----------|
| Last task in an area completes | Integration test tasks depending on that area |
| Integration boundary tasks all complete | Cross-boundary integration tests |
| All tasks complete (final gate) | Full test suite — unit + integration + contract |

Integration test failures create fix tasks targeting the specific seam. The full-suite gate
catches regressions before declaring implementation complete.
```

---

**Target**: `docs/pipeline-concepts.md`

**Current** (Configuration section, `.clarity-loop.json` — post-P0.5):
> ```json
> {
>   "version": 1,
>   "docsRoot": "docs",
>   "implementer": {
>     "checkpoint": "every"
>   },
>   "ux": {
>     "reviewStyle": "batch",
>     "profileMode": "auto",
>     "autoDefaults": "tier3",
>     "parallelGeneration": true
>   }
> }
> ```

**Proposed** — Add `testing` config key alongside existing `ux` section:

```markdown
```json
{
  "version": 1,
  "docsRoot": "docs",
  "implementer": {
    "checkpoint": "every"
  },
  "ux": {
    "reviewStyle": "batch",
    "profileMode": "auto",
    "autoDefaults": "tier3",
    "parallelGeneration": true
  },
  "testing": {
    "integrationGate": true,
    "fullSuiteGate": true
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `testing.integrationGate` | `true` | Run integration tests at milestone boundaries (Tier 2 checkpoint) |
| `testing.fullSuiteGate` | `true` | Run full test suite before declaring completion (Tier 1 checkpoint) |
```

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| **TEST_SPEC.md** | Test specification artifact generated alongside implementation specs. Defines test architecture, per-module test cases, integration contracts, and contract tests. NOT test code. | spec-mode.md, start-mode.md, autopilot-mode.md, run-mode.md, verify-mode.md, SKILL.md, docs/cl-implementer.md |
| **Test task** | First-class task in TASKS.md derived from TEST_SPEC.md. Four types: infrastructure, unit (T-NNNT), integration, contract. | start-mode.md, autopilot-mode.md, SKILL.md, docs/cl-implementer.md |
| **Milestone gate** | Integration test execution triggered when the last task in an area or integration boundary completes. Tier 2 checkpoint — presented as batch review, respects `ux.autoDefaults`. | autopilot-mode.md, docs/cl-implementer.md |
| **Full-suite gate** | Complete test suite execution before reporting all tasks complete. Catches regressions. Tier 1 checkpoint — always requires explicit confirmation. | autopilot-mode.md, docs/cl-implementer.md |
| **T-NNNT suffix** | Naming convention for unit test tasks — the `T` suffix ties them to their implementation task (e.g., T-005 → T-005T). | start-mode.md, docs/cl-implementer.md |

### Migration

This proposal adds new capabilities without changing existing behavior:

- **Spec generation**: Existing implementation spec generation is unchanged. TEST_SPEC.md is
  an additional parallel output.
- **Start mode**: Existing task generation rules 1-7 are unchanged. Test task generation
  (rules 8-11) is additive and only triggers when TEST_SPEC.md exists.
- **Autopilot Step 3c**: Existing acceptance-criteria-based testing is the FALLBACK. When
  TEST_SPEC.md exists, it takes precedence. When it doesn't, behavior is unchanged.
- **Autopilot Step 3d-int**: New step. Does not modify existing Step 3d.
- **Full-suite gate**: New addition to Step 3h. Does not modify existing checkpoint logic
  or P0.5's tier awareness (Tier 1/2/3 categorization of checkpoint items).
- **Verify Dimension 5**: New dimension. Does not modify existing Dimensions 1-4. Note: P3 also adds a new dimension (Dependency Audit) which should become Dimension 6. After both P2 and P3 merge, verify mode will have six dimensions total. SKILL.md and docs/cl-implementer.md references to dimension counts should reflect six dimensions after both proposals merge.

No backward compatibility concerns. Projects without TEST_SPEC.md see no behavioral change.

### Integration Points

| Component | Interaction |
|-----------|------------|
| **DECISIONS.md** | Bootstrap testing probes write here with category tag `testing`. Spec generation reads decisions with category `testing` for TEST_SPEC.md defaults. Uses P0.5 precedence rules (DECISIONS.md > auto-detect > research > presets) and supersession protocol for overrides. |
| **TEST_SPEC.md** | Generated by spec mode. Read by start mode (task generation), autopilot (test case source), run mode (verification), verify mode (coverage check). |
| **TASKS.md** | Test tasks are first-class entries alongside implementation tasks. Same dependency graph, same status tracking. |
| **.spec-manifest.md** | TEST_SPEC.md is listed in the manifest. Same staleness detection and hash-based sync as implementation specs. |
| **IMPLEMENTATION_PROGRESS.md** | Test task statuses tracked alongside implementation task statuses. Integration gate results recorded. |
| **.clarity-loop.json** | New `testing` config section controls integration gate and full-suite gate behavior. Test result presentation respects existing `ux.reviewStyle`. Milestone gate respects `ux.autoDefaults` (Tier 2). Full-suite gate is Tier 1 (always requires confirmation regardless of `ux.autoDefaults`). |

## Context Budget & Progressive Disclosure (Hard Requirement)

Every change in this proposal MUST respect the plugin's progressive disclosure model. Skills load reference files on-demand per mode — this is the primary mechanism for keeping context lean. Violating it bloats every invocation.

### Rules

1. **SKILL.md stays thin.** Mode detection + "Read `references/[mode].md`" pointers only. No inline process descriptions, no large tables, no protocol details. A SKILL.md should be under ~200 lines.

2. **Reference files are mode-scoped.** Content added to a reference file must be relevant to that mode's execution. Cross-cutting protocols (e.g., test spec format, integration gate logic) belong in a shared reference or in `pipeline-concepts.md` — NOT duplicated across multiple mode files.

3. **Large tables and catalogs go in separate files.** If a change adds a table with >10 rows (e.g., test taxonomy, mock boundary catalog, integration contract templates), it should be a separate reference file loaded only when needed — not inlined in the mode reference.

4. **Measure additions by token cost.** Each change should note its approximate token cost. A mode reference file should stay under ~3000 tokens. If a change pushes a file over budget, extract the addition into a sub-reference.

5. **Shared content uses references, not duplication.** If the same protocol or format is used by multiple modes or skills, define it once (in a shared reference or `pipeline-concepts.md`) and link to it. The decision flow protocol from P0.5 is the model: defined once, referenced everywhere.

6. **Exceptions.** Inlining is acceptable when the content is small (<20 lines), mode-specific, and would create unnecessary indirection if extracted. Use judgment — the goal is minimal context per invocation, not maximum file count.

### Merge Validation

During merge, the reviewer should verify:
- No SKILL.md file exceeds ~200 lines after changes
- No reference file exceeds ~3000 tokens after changes
- No content is duplicated across multiple files
- Cross-cutting additions use shared references

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| **Single TEST_SPEC.md file** | Per-spec test files (e.g., `auth-spec.test-spec.md`) | A single file provides a unified view of the test architecture — mock boundaries, test data strategy, and integration contracts are cross-cutting. Per-spec files fragment this view. For large projects, sections within the single file provide adequate organization. |
| **T-NNNT suffix for unit test task IDs** | Sequential IDs (T-020, T-021...), separate numbering (UT-001, UT-002...) | The suffix makes the implementation↔test relationship immediately visible. T-005 and T-005T are obviously paired. Sequential IDs lose this connection. Separate numbering creates two parallel tracking systems. |
| **Integration tests as TASKS.md entries** | Integration tests as autopilot-only behavior (not tracked) | First-class tasks get dependency tracking, acceptance criteria, status tracking, and sync-mode support. Untracked tests would be invisible to the rest of the pipeline. |
| **Full-suite gate in autopilot** | Full-suite only in verify mode | Catching regressions DURING autopilot prevents compounding. Waiting for verify mode means regressions accumulate across all tasks. The cost of running the full suite once before completion is minimal compared to fixing cascading regressions. |
| **Bootstrap probes → DECISIONS.md → TEST_SPEC.md** | Ask testing questions during spec generation | Testing decisions are architecture-level (like tech stack choices). They belong in bootstrap/DECISIONS.md, not in a per-spec-generation conversation. This also means testing decisions persist across spec regenerations. P0.5's profile system already captures generic testing defaults (framework, mock boundaries, coverage) via auto-detect and presets — the bootstrap probes complement this by capturing project-specific testing architecture (integration boundaries, constraints) that the profile system doesn't cover. |
| **Milestone gate triggered by area/boundary completion** | Integration tests only after ALL tasks complete | Per-milestone catches integration issues early, when the relevant code is fresh in context. Waiting until all tasks complete means debugging integration failures in code written many tasks ago. |
| **Testing config in .clarity-loop.json** | Always-on, no config | Some projects (prototypes, spikes) don't need integration gates. Config provides an escape hatch without removing the feature. Defaults are on — testing is opt-out, not opt-in. The `testing.*` config section sits alongside P0.5's `ux.*` section. Gate behavior also interacts with `ux.autoDefaults` via tier classification (integration gate is Tier 2, full-suite gate is Tier 1). |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| TEST_SPEC.md increases spec generation time | Medium | Low | Test spec is a parallel output from the same system doc read. Marginal cost — the heavy work (reading all system docs) is already done. |
| Test specs become stale when impl specs change | Medium | Medium | Same staleness detection as impl specs — hash-based, in .spec-manifest.md. When specs are regenerated, TEST_SPEC.md regenerates too. Sync mode detects hash mismatches for test tasks. |
| Integration test tasks slow down autopilot | Low | Low | Integration tests run per-milestone, not per-task. Amortized cost is low. Users can disable via `testing.integrationGate: false`. |
| Test architecture decisions feel premature at bootstrap | Medium | Medium | P0.5's profile system already provides sensible defaults via presets and auto-detect (mock DB in unit, real in integration). Bootstrap testing probes only ask about project-specific gaps the profile system can't cover. Record defaults in DECISIONS.md with category `testing` and source `[auto-default]` — user can override at any time. |
| T-NNNT suffix convention conflicts with user-added tasks | Low | Low | The suffix is a convention, not enforced. User-added test tasks can use any ID. The convention only applies to spec-derived test tasks. |
| Full-suite gate adds time before completion | Low | Low | Only runs once — after the last task. Benefits (catching regressions) far outweigh the one-time cost. Users can disable via `testing.fullSuiteGate: false`. |
| Too many test tasks inflate TASKS.md | Medium | Low | Test tasks are proportional to implementation tasks and integration boundaries. For a typical project with 20 impl tasks: ~1 infrastructure + ~20 unit test + ~3-5 integration + ~2-3 contract = ~26-29 test tasks. The dependency graph keeps them organized. |

## Open Items

1. **TEST_SPEC.md and behavioral walkthrough test scenarios**: P1 (Behavioral Foundation) will
   add behavioral test scenarios to UI_SCREENS.md. These are E2E/browser-level tests at the
   top of the test pyramid. TEST_SPEC.md covers the middle and bottom (unit + integration).
   The relationship between these two artifacts should be cross-referenced but doesn't need
   to be resolved in this proposal — they're complementary, not competing.

2. **Test task ordering within the dependency graph**: Should unit test tasks (T-NNNT) block
   tasks that depend on the implementation task? E.g., if T-005 (auth service) is done and
   T-005T (auth tests) is pending, should T-010 (which depends on T-005) wait for T-005T?
   Current design: no — T-005T's completion is not a prerequisite for dependents of T-005.
   Tests verify, they don't gate downstream implementation. This could be configurable.

3. **Spec-review integration**: The existing spec-review mode checks five consistency
   dimensions for implementation specs. Should it also check TEST_SPEC.md consistency
   (e.g., test cases reference functions that exist in impl specs, integration boundaries
   match cross-spec dependencies)? Likely yes, but this can be a follow-up enhancement.

4. **Test task complexity estimation**: Implementation tasks have complexity estimates
   (Simple/Medium/Complex). Test task complexity should derive from the implementation task
   but may differ — a simple implementation with many edge cases produces a complex test
   task. The heuristic needs refinement during implementation.

## Appendix: Research Summary

The PIPELINE_GAP_ANALYSIS research identified testing as one of several fundamental gaps in
the Clarity Loop pipeline. Key findings:

- **F15**: Testing strategy has no home — no pipeline stage is responsible for testing
  decisions, so the implementer improvises framework choice, mock boundaries, and test data
  strategy per-task.

- **F16**: Behavioral specifications and test cases are the same artifact expressed
  differently (the ATDD duality). Solving the behavioral spec gap partially solves the
  testing gap.

- **F17**: Unit testing has no specification surface. The autopilot writes tests from
  acceptance criteria — circular self-verification. Mock boundaries are decided ad-hoc,
  resulting in inconsistent testing approaches across modules.

- **F18**: Integration testing is entirely absent. The pipeline verifies individual tasks in
  isolation but nothing verifies that components work together across layers. This is the
  same root cause as the behavioral gap (components work individually, fail in composition)
  but at the code level.

- **F19**: Test architecture is a missing blueprint. Test pyramid strategy, environment setup,
  fixture strategy, cross-layer verification — all unspecified. The autopilot detects a
  testing framework but doesn't set up any infrastructure.

- **F20**: TEST_SPEC.md is proposed as a pipeline artifact — a parallel output of spec
  generation that defines what should be tested and how. Not test code — a specification
  consumed by the implementer to write consistent, spec-backed tests.

The research recommends addressing testing through Changes 8-11, which this proposal
implements. These changes are in Tier 1b (parallel to Tier 1 behavioral changes and
Tier 1c security changes) because they primarily affect cl-implementer's spec generation,
start mode, and autopilot — different pipeline stages than the design-phase changes in Tier 1.

This proposal builds on P0.5 (UX_STREAMLINING) infrastructure: the decision flow protocol
with `testing` category tags, the project profile system (which provides generic testing
defaults via auto-detect and presets), tiered checkpoints (used to classify the milestone
gate as Tier 2 and full-suite gate as Tier 1), and review style compatibility (test results
respect `ux.reviewStyle`).
