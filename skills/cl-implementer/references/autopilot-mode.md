---
mode: autopilot
tier: guided
depends-on: [run-mode.md, start-mode.md, spec-mode.md]
state-files: [TASKS.md, .spec-manifest.md, DECISIONS.md, .clarity-loop.json, TEST_SPEC.md]
---

## Autopilot Mode

Autonomous implementation with self-validation. The implementer processes the task queue
with minimal human interruption, writing tests to verify its own work and only stopping
when it genuinely needs a human decision.

**Gate**: TASKS.md must exist. At least one task must be pending. Specs must be verified
(same gates as run mode).

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| docsRoot | Project config / .clarity-loop.json | Yes | Root path for all documentation artifacts |
| TASKS.md | {docsRoot}/specs/ | Yes | Task tracker with statuses, acceptance criteria, session log |
| .spec-manifest.md | {docsRoot}/specs/ | Yes | Spec manifest for hash comparison |
| DECISIONS.md | {docsRoot}/ | No | Decision log for checkpoint choices, behavioral decisions |
| .clarity-loop.json | project root | No | Config for checkpoint setting, l1ScanFrequency, ux settings |
| TEST_SPEC.md | {docsRoot}/specs/ | No | Test spec for writing tests against task criteria |
| DESIGN_SYSTEM.md | {docsRoot}/specs/ | No | Design system for UI task validation |
| UI_SCREENS.md | {docsRoot}/specs/ | No | Screen designs for UI task validation |
| package.json | project root | No | For detecting test framework |

## Guidelines

1. Autopilot mode is run mode with three additions: self-testing, autonomous progression, and integration testing gates. All of run mode's mechanisms still apply.
2. The checkpoint setting determines how much oversight the user wants -- it should evolve over the project as trust builds.
3. After 3 failed test attempts for a task, always stop and ask the user.
4. The implementer can check structural correctness (right components, right tokens) but cannot judge aesthetic quality. Visual judgment issues are always deferred to the user.
5. Maximum 3 parallel groups to avoid resource contention. User can adjust.
6. Create atomic git commits per task for per-task rollback capability.
7. L1 assumption scans run silently in autopilot (Tier 3 auto-proceed) and surface in checkpoint summaries.
8. Test result presentation respects `ux.reviewStyle` from .clarity-loop.json.
9. Categorize checkpoint items by tier: Tier 1 (must-confirm) presented prominently, Tier 2 (batch review) as summary table, Tier 3 (auto-proceeded) in collapsed section.
10. Users can switch between run and autopilot modes freely at any time.

## Process

### Phase 1: Checkpoint Decision (First Run)

On the first autopilot invocation (no checkpoint setting in `.clarity-loop.json`), ask the
user to choose their oversight level:

"Autopilot processes tasks autonomously, writing tests to verify each one. How much
oversight do you want?"

| Setting | Behavior |
|---|---|
| `checkpoint: none` | Full autopilot — only stops on genuine blockers |
| `checkpoint: phase` | Stops after each implementation area (data layer, API, UI, etc.) |
| `checkpoint: N` | Stops every N tasks for a progress review |
| `checkpoint: every` | Task-by-task approval (same as run mode, but with self-testing) |

Save the choice to `.clarity-loop.json` under `implementer.checkpoint`. Log the decision
to DECISIONS.md:
- **Pipeline Phase**: `implementation`
- **Context**: "User selected autopilot checkpoint level"
- **Decision**: The chosen level with rationale the user provides
- **Status**: `active`

The user can change this at any time by saying "change checkpoint to [level]" — log the
change to DECISIONS.md with the new rationale. Trust evolves over a project.

**Checkpoint**: Checkpoint level configured and saved.

### Phase 2: Reconciliation

Same as run mode Phase 1. Detect external changes, map to tasks, re-verify. This runs
regardless of checkpoint setting.

**Checkpoint**: Reconciliation complete (same as run mode).

### Phase 3: Plan the Run

Before executing, analyze the task queue and present a plan:

1. Read the dependency graph from TASKS.md
2. Identify parallelizable task groups (no shared files or dependencies)
3. Estimate the run: "[N] tasks remaining. [M] can run in parallel across [P] groups.
   [K] are sequential. Checkpoint: [setting]."
4. If `checkpoint: none`, tell the user: "I'll process all tasks and report back when
   done (or when I hit a blocker). You can check `/cl-implementer status` anytime."
5. Proceed without waiting for approval (the checkpoint decision already gave consent).

**Checkpoint**: Run plan presented.

### Phase 4: Autonomous Task Loop

For each task (or parallel task group):

**4a: Validity Check**

Same as run mode — check dependencies, spec hash, acceptance criteria still relevant.
Skip without stopping if a task is already satisfied externally.

**4b: Implement**

Write the code. Load relevant context files (same as run mode Phase 3 step 3c).

**4c: Write Tests**

**This is the key difference from run mode.** After implementing, write tests that
validate the task's acceptance criteria:

1. Read the task's acceptance criteria from TASKS.md
2. **Check TEST_SPEC.md** — if the task has a corresponding per-module section in
   TEST_SPEC.md, use it as the primary test specification:
   - Use the function -> input -> output -> edge cases table for unit test cases
   - Use the specified mock boundaries (don't improvise — follow the spec)
   - Use the specified test data factories and fixtures
   - If the task is a test task (T-NNNT, integration, or contract), implement the
     test cases defined in TEST_SPEC.md directly
3. **Fallback to acceptance criteria** — if no TEST_SPEC.md exists or the task has no
   corresponding test spec section, fall back to translating acceptance criteria:
   - **Behavioral criteria** ("user can log in with valid credentials") -> integration test
   - **Structural criteria** ("exports a `UserService` class") -> unit test
   - **Edge case criteria** ("returns 401 for expired tokens") -> unit test
   - **UI criteria** ("shows loading spinner while fetching") -> component test or browser test
4. Write tests in the project's testing framework (detected from package.json / config)
5. If no testing framework exists, ask user once: "No test framework detected. Options:
   a) Set one up (I'll add vitest/jest/pytest), b) Skip self-testing (reduces autopilot
   reliability), c) Use assertion-based checks only (no framework needed)."
   Log the choice to DECISIONS.md with category `testing`.

**Test file convention**: Place tests adjacent to implementation files or in the project's
existing test directory. Follow existing conventions if tests already exist. Follow
TEST_SPEC.md conventions if specified.

**4d: Run Tests**

1. Run the tests written in 4c
2. If all pass -> task verified -> proceed to 4f
3. If tests fail:
   - **Attempt 1**: Read the error, debug, fix the implementation (not the test)
   - **Attempt 2**: If still failing, re-examine the test — is the test wrong?
   - **Attempt 3**: If still failing, check if it's a context-gap or design-gap
   - After 3 failed attempts -> **stop and ask the user**:
     "Task T-[NNN] is failing after 3 attempts. [Error summary]. Options: a) I'll keep
     debugging, b) Skip this task, c) This is a spec/design issue — let's discuss."

**4d-int: Integration Test Check (Milestone Gate) — Tier 2**

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
   both sides of an API <-> DB contract are now implemented), check for integration
   test tasks spanning that boundary.

3. **Execute integration tests**: When triggered, run the integration test task:
   - Start any required infrastructure (test DB, mock server) if not running
   - Execute the integration test suite for the completed boundary
   - If all pass -> mark the integration test task as `done` -> continue
   - If tests fail -> create fix tasks targeting the specific seam:
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

**4d-ops: Operational Verification (After Infrastructure Tasks) — Tier 3**

This step auto-proceeds (Tier 3) and is logged for checkpoint summary.

After completing an infrastructure or schema task, run relevant operational checks:

1. **After schema/migration tasks**: Verify the migration ran successfully. If the spec
   includes rollback notes, test the rollback (migrate down, migrate up). Verify seed
   data was created if specified. Log results.

2. **After config setup tasks**: Verify config validation works — temporarily remove a
   required env var and confirm the app crashes with a clear error. Restore and continue.

3. **After observability tasks**: Hit the health endpoint, verify it returns the expected
   shape. Check that a test request generates a structured log entry with correlation ID.

4. **Performance spot-check (when available)**: If the task involves an API endpoint and
   a running server is available, measure response time for a basic request. If
   performance budgets exist in specs, compare. Flag if over budget but don't block —
   log for the checkpoint summary.

These checks are lightweight and non-blocking. Results appear in the Tier 3 (auto-
proceeded) section of checkpoint summaries.

**Note**: Autopilot also inherits run mode's Phase 3 step 3f (L1 assumption tracking) at the
same `l1ScanFrequency` interval. L1 scans run silently in autopilot (Tier 3 auto-proceed)
and surface in checkpoint summaries.

**4e: UI Validation (for UI tasks only)**

If the task involves UI components or screens:

1. Start the dev server if not running
2. Navigate to the relevant page/component using browser tools
3. Take a screenshot
4. Compare against design spec (DESIGN_SYSTEM.md / UI_SCREENS.md):
   - Are the right components used?
   - Do token values match (colors, spacing, typography)?
   - Is the layout structurally correct?
5. If discrepancy found:
   - Check if it's an implementation error (code doesn't match spec) -> fix the code
   - If code matches spec but looks wrong -> this needs user eyes. Capture screenshot,
     note the discrepancy, and include in the checkpoint summary.

**Important**: The implementer can check structural correctness (right components, right
tokens) but cannot judge aesthetic quality. Visual judgment issues are always deferred to
the user — either at the next checkpoint or in the final summary.

**4f: Commit**

Create an atomic git commit for the task:
```
Implement T-NNN: [task name]

Tests: [N] passing
Files: [list]
Acceptance criteria: [all met / partial — see notes]
```

This enables per-task rollback if something goes wrong later.

**4g: Cascade Check**

Same as run mode — spot-check previously completed tasks whose files overlap with the
current task's changes. If regressions found, create fix tasks and handle them before
continuing.

**4h: Checkpoint Evaluation**

After the task (or parallel group) completes:

- `checkpoint: none` -> continue to next task
- `checkpoint: phase` -> if this was the last task in an area, stop and report
- `checkpoint: N` -> if N tasks completed since last stop, stop and report
- `checkpoint: every` -> stop and report

When stopping at a checkpoint, present a summary (see Phase 5).

**Tier awareness at checkpoints**: When presenting a checkpoint summary (Phase 5),
categorize items by tier:
- **Tier 1 items** (must-confirm): Always present prominently. These are the items
  that justify the checkpoint stop.
- **Tier 2 items** (batch review): Present as a summary table. The user reviews the
  batch and flags specific items.
- **Tier 3 items** (auto-proceeded): Listed in a collapsed "auto-decisions" section.
  The user can expand to review but doesn't need to.

This prevents checkpoint summaries from being overwhelmed by low-importance items
when the user really needs to focus on the 1-2 decisions that matter.

**Full-Suite Gate** (Tier 1 — must confirm): Before reporting "all tasks complete"
(when the last pending task finishes), run the ENTIRE test suite — all unit tests, all
integration tests, all contract tests:

1. Run `npm test` (or equivalent) to execute the full suite
2. If all pass -> proceed to summary report
3. If failures:
   - Identify which tests regressed (they passed when first written but fail now)
   - Create fix tasks for regressions
   - Process fix tasks before declaring completion
   - Re-run full suite after fixes
4. Report full-suite results in the summary (see Phase 5)

The full-suite gate catches regressions that per-task and per-milestone tests miss —
a later task's code change may break an earlier task's tests without triggering a
spot-check (if the files don't overlap).

**Checkpoint**: Task loop iteration complete (or checkpoint reached).

### Phase 5: Summary Report

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

If there are screenshots needing visual review, present them. The user reviews and either
approves or flags design gaps.

If there are failing tasks, the user decides: debug further, skip, or escalate.

**Checkpoint**: Summary presented to user.

### Parallel Execution

When the dependency graph allows parallel work:

1. Identify independent task groups (no shared files, no dependency chain between them)
2. Fork subagents for each group (Claude Code's fork capability)
3. Each subagent runs the autonomous loop (implement -> test -> commit) independently
4. Main context collects results and checks for file conflicts
5. If conflicts: re-run conflicting tasks sequentially
6. Merge results into TASKS.md

**Result protocol**: Subagents report using the Structured Agent Result Protocol, type:
`implementation`. Load the protocol prompt template from
`skills/cl-reviewer/references/agent-result-protocol.md` Phase 6 and include it in each
subagent's Task prompt. Parse the RESULT summary line from each response for status
classification and aggregation.

**Limit**: Maximum 3 parallel groups to avoid resource contention. User can adjust.

### Hard Stops

Autopilot always stops for:

- **L2 spec gaps**: Requires a design decision the implementer can't make
- **Repeated failures**: Same task or area failing after retries
- **Cascade regression**: A fix causes more regressions than it solves
- **No test framework and user chose to skip**: Warn that autopilot reliability is reduced
- **User interrupt**: The user can always say "stop" or "pause"

Autopilot never stops for:

- L0 spec gaps (patched inline)
- L1 spec gaps (assumption stated, logged, continues)
- Minor test failures that self-resolve on retry
- External changes (handled by reconciliation)
- Context-gap or design-gap that has a clear automatic fix

### Trust Evolution

The checkpoint setting should evolve over the project. After each autopilot run, the
implementer can suggest adjusting:

- If zero issues in the last 10 tasks: "The last batch ran clean. Want to reduce
  checkpoint frequency?"
- If multiple stops were needed: "This batch had [N] blockers. Consider increasing
  checkpoint frequency until the area stabilizes."

Always log changes to DECISIONS.md. The trust arc is project documentation.

### Relationship to Run Mode

Autopilot mode is run mode with three additions: **self-testing**, **autonomous
progression**, and **integration testing gates**. All of run mode's mechanisms still
apply — reconciliation, fix tasks, gap triage, tangent handling, cascade re-verification.
The only difference is that autopilot doesn't wait for user approval between tasks
(except at checkpoints).

Users can switch between modes freely:
- `/cl-implementer run` -> task-by-task with human interaction
- `/cl-implementer autopilot` -> autonomous with checkpoints
- Start with `run` to build trust, switch to `autopilot` once confident

## Output

- **Primary**: `{docsRoot}/specs/TASKS.md` (updated with task statuses, test results, session log)
- **Additional**: Test files (adjacent to implementation or in test directory), git commits (one per task), DECISIONS.md entries, checkpoint summaries
