## Autopilot Mode

Autonomous implementation with self-validation. The implementer processes the task queue
with minimal human interruption, writing tests to verify its own work and only stopping
when it genuinely needs a human decision.

**Gate**: TASKS.md must exist. At least one task must be pending. Specs must be verified
(same gates as run mode).

---

### First Run: Checkpoint Decision

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

---

### Step 1: Reconciliation

Same as run mode Step 1. Detect external changes, map to tasks, re-verify. This runs
regardless of checkpoint setting.

---

### Step 2: Plan the Run

Before executing, analyze the task queue and present a plan:

1. Read the dependency graph from TASKS.md
2. Identify parallelizable task groups (no shared files or dependencies)
3. Estimate the run: "[N] tasks remaining. [M] can run in parallel across [P] groups.
   [K] are sequential. Checkpoint: [setting]."
4. If `checkpoint: none`, tell the user: "I'll process all tasks and report back when
   done (or when I hit a blocker). You can check `/implementer status` anytime."
5. Proceed without waiting for approval (the checkpoint decision already gave consent).

---

### Step 3: Autonomous Task Loop

For each task (or parallel task group):

#### 3a: Validity Check

Same as run mode — check dependencies, spec hash, acceptance criteria still relevant.
Skip without stopping if a task is already satisfied externally.

#### 3b: Implement

Write the code. Load relevant context files (same as run mode Step 3c).

#### 3c: Write Tests

**This is the key difference from run mode.** After implementing, write tests that
validate the task's acceptance criteria:

1. Read the task's acceptance criteria from TASKS.md
2. Translate each criterion into one or more test cases:
   - **Behavioral criteria** ("user can log in with valid credentials") → integration test
   - **Structural criteria** ("exports a `UserService` class") → unit test
   - **Edge case criteria** ("returns 401 for expired tokens") → unit test
   - **UI criteria** ("shows loading spinner while fetching") → component test or browser test
3. Write tests in the project's testing framework (detected from package.json / config)
4. If no testing framework exists, ask user once: "No test framework detected. Options:
   a) Set one up (I'll add vitest/jest/pytest), b) Skip self-testing (reduces autopilot
   reliability), c) Use assertion-based checks only (no framework needed)."
   Log the choice to DECISIONS.md.

**Test file convention**: Place tests adjacent to implementation files or in the project's
existing test directory. Follow existing conventions if tests already exist.

#### 3d: Run Tests

1. Run the tests written in 3c
2. If all pass → task verified → proceed to 3f
3. If tests fail:
   - **Attempt 1**: Read the error, debug, fix the implementation (not the test)
   - **Attempt 2**: If still failing, re-examine the test — is the test wrong?
   - **Attempt 3**: If still failing, check if it's a context-gap or design-gap
   - After 3 failed attempts → **stop and ask the user**:
     "Task T-[NNN] is failing after 3 attempts. [Error summary]. Options: a) I'll keep
     debugging, b) Skip this task, c) This is a spec/design issue — let's discuss."

#### 3e: UI Validation (for UI tasks only)

If the task involves UI components or screens:

1. Start the dev server if not running
2. Navigate to the relevant page/component using browser tools
3. Take a screenshot
4. Compare against design spec (DESIGN_SYSTEM.md / UI_SCREENS.md):
   - Are the right components used?
   - Do token values match (colors, spacing, typography)?
   - Is the layout structurally correct?
5. If discrepancy found:
   - Check if it's an implementation error (code doesn't match spec) → fix the code
   - If code matches spec but looks wrong → this needs user eyes. Capture screenshot,
     note the discrepancy, and include in the checkpoint summary.

**Important**: The implementer can check structural correctness (right components, right
tokens) but cannot judge aesthetic quality. Visual judgment issues are always deferred to
the user — either at the next checkpoint or in the final summary.

#### 3f: Commit

Create an atomic git commit for the task:
```
Implement T-NNN: [task name]

Tests: [N] passing
Files: [list]
Acceptance criteria: [all met / partial — see notes]
```

This enables per-task rollback if something goes wrong later.

#### 3g: Cascade Check

Same as run mode — spot-check previously completed tasks whose files overlap with the
current task's changes. If regressions found, create fix tasks and handle them before
continuing.

#### 3h: Checkpoint Evaluation

After the task (or parallel group) completes:

- `checkpoint: none` → continue to next task
- `checkpoint: phase` → if this was the last task in an area, stop and report
- `checkpoint: N` → if N tasks completed since last stop, stop and report
- `checkpoint: every` → stop and report

When stopping at a checkpoint, present a summary (see Step 4).

---

### Step 4: Summary Report

At checkpoints and at the end of the run, present:

```
Autopilot Summary
=================
Tasks completed:   [N] (since last checkpoint)
Tasks remaining:   [M]
Tests written:     [X] ([Y] passing, [Z] failing)
Fix tasks:         [A] created, [B] resolved
Screenshots:       [C] captured ([D] need visual review)

Completed tasks:
  T-001: Auth middleware           ✓ 4 tests passing
  T-002: User service              ✓ 6 tests passing
  T-003: Login page                ✓ 3 tests, 1 screenshot for review

Needs attention:
  T-004: Session refresh           ✗ Failing after 3 attempts (race condition)
  Screenshot: Login page           ? Visual review needed (attached)

Decisions logged: 2 (see DECISIONS.md)
```

If there are screenshots needing visual review, present them. The user reviews and either
approves or flags design gaps.

If there are failing tasks, the user decides: debug further, skip, or escalate.

---

### Parallel Execution

When the dependency graph allows parallel work:

1. Identify independent task groups (no shared files, no dependency chain between them)
2. Fork subagents for each group (Claude Code's fork capability)
3. Each subagent runs the autonomous loop (implement → test → commit) independently
4. Main context collects results and checks for file conflicts
5. If conflicts: re-run conflicting tasks sequentially
6. Merge results into IMPLEMENTATION_PROGRESS.md

**Limit**: Maximum 3 parallel groups to avoid resource contention. User can adjust.

---

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

---

### Trust Evolution

The checkpoint setting should evolve over the project. After each autopilot run, the
implementer can suggest adjusting:

- If zero issues in the last 10 tasks: "The last batch ran clean. Want to reduce
  checkpoint frequency?"
- If multiple stops were needed: "This batch had [N] blockers. Consider increasing
  checkpoint frequency until the area stabilizes."

Always log changes to DECISIONS.md. The trust arc is project documentation.

---

### Relationship to Run Mode

Autopilot mode is run mode with two additions: **self-testing** and **autonomous
progression**. All of run mode's mechanisms still apply — reconciliation, fix tasks, gap
triage, tangent handling, cascade re-verification. The only difference is that autopilot
doesn't wait for user approval between tasks (except at checkpoints).

Users can switch between modes freely:
- `/implementer run` → task-by-task with human interaction
- `/implementer autopilot` → autonomous with checkpoints
- Start with `run` to build trust, switch to `autopilot` once confident
