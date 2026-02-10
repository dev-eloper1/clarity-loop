## Run Mode

The core implementation loop. Processes the task queue front-to-back with reconciliation,
validity checking, implementation, verification, and gap handling.

Run mode is designed to be invoked repeatedly — once per session or multiple times within
a session. Each invocation starts with reconciliation (detecting what changed since last
time) and then processes tasks until the user stops or the queue is exhausted.

---

### Step 1: Reconciliation on Resume

This runs at the start of EVERY `run` invocation. It grounds the skill in reality before
processing any tasks.

1. **Read IMPLEMENTATION_PROGRESS.md** — get last session date, task states, known files
   per task.

2. **Git check** — Is this a git repository?
   - If not: offer to initialize (same prompt as start-mode). If user declines, fall back
     to file modification timestamps with reduced accuracy warning.
   - If yes: proceed with git-based reconciliation.

3. **Detect external changes**:
   - **With git**: `git diff --name-only <last-session-commit>...HEAD` (or date-based if
     no commit reference is stored). Also check `git status` for uncommitted changes.
   - **Without git**: Compare file modification timestamps against last session date. Less
     reliable — no rename detection, no granularity.

4. **Map changed files to tasks**: Cross-reference changed files against the "Files Modified"
   column in IMPLEMENTATION_PROGRESS.md.

5. **Categorize each external change**:

   | External Change | Task Impact | Action |
   |----------------|-------------|--------|
   | File NOT associated with any task | No task impact | Note in progress file, continue |
   | File associated with a completed task, minor change | May still be valid | Flag for re-verification |
   | File associated with a completed task, major change | Likely invalidated | Flag: re-verify or mark externally-managed |
   | File associated with an in-progress task | Current work affected | Flag: review before continuing |
   | New files not in any task | No task impact | Note as external addition |

6. **Present reconciliation summary** (only if changes found):
   ```
   Since your last session ([date]):
   - [N] files changed outside the implementer
   - T-003 (auth endpoints): auth.ts modified — needs re-verification
   - 2 new files not associated with any task
   Re-verify affected tasks before continuing? [Y/n/mark externally-managed]
   ```

7. **Process user decision**:
   - **Re-verify** (recommended): Check acceptance criteria for affected tasks against
     current code state. Update status accordingly.
   - **Skip**: Trust external changes, continue with current task states.
   - **Externally-managed**: Mark affected tasks as `externally-managed`. They stay in
     TASKS.md for completeness but are excluded from further verification.

**If no changes detected**: Skip reconciliation silently and proceed to Step 2.

---

### Step 2: Spec Hash Check

Compare the current `.spec-manifest.md` content hash against the hash recorded in TASKS.md.

- **Match**: Specs haven't changed. Proceed to queue processing.
- **Mismatch**: "Specs have changed since TASKS.md was generated. Run `/implementer sync`
  to update the task queue, or continue with current tasks (risk: some tasks may be stale)."

The user can defer sync and continue — not every spec change affects every task. But the
warning ensures they know.

---

### Step 3: Queue Processing

Process tasks front-to-back, respecting the dependency graph and user ordering.

#### 3a: Select Next Task

Pick the next task that is:
- Status: `pending` (not done, skipped, blocked, or externally-managed)
- All dependencies satisfied (all `blockedBy` tasks are `done` or `satisfied-externally`)
- Not blocked by an open fix task

If fix tasks (F-NNN) exist with status `in-progress` or `pending`, process those FIRST.
Fix tasks take priority over new tasks.

If no unblocked tasks remain and tasks are still pending: report the blockage. "All
remaining tasks are blocked. [Details of what's blocking what]. Resolve blockers or
adjust dependencies."

#### 3b: Validity Check

Before implementing, check the task's spec hash:
- **Matches current spec**: Proceed with implementation.
- **Doesn't match**: The spec changed. Options:
  a) Run `/implementer sync` to update all tasks from new specs
  b) Continue with this task anyway (user's call — maybe the change is minor)
  c) Skip this task and move to the next

#### 3c: Implement

Implement the task. This is where Claude Code writes code:

1. Read the task's spec reference in full
2. Read any dependency tasks' files (for context on what already exists)
3. Implement the code to meet the acceptance criteria
4. Test/verify the implementation against each criterion
5. Record files modified

For parallel groups (if user approved in start mode):
- Fork subagents for each independent group
- Each subagent gets: task description, spec references, acceptance criteria, context
  about dependencies
- Each subagent implements independently and reports: files modified, criteria status,
  gaps found
- Main context: collect results, check for file conflicts (same file modified by multiple
  subagents), resolve conflicts or re-run sequentially
- Update TASKS.md and IMPLEMENTATION_PROGRESS.md from main context

#### 3d: Verify Acceptance Criteria

After implementation, check EVERY acceptance criterion for the task:
- **All met**: Mark task `done`, record completion date and files modified.
- **Some met**: Note which criteria pass and which fail. Attempt to fix failures. If still
  failing, report to user with details.
- **None met**: Something went wrong. Report full details.

Update BOTH TASKS.md (persistent) and Claude Code tasks via `TaskUpdate` (session).

#### 3e: Post-Task Regression Spot-Check (Optional)

After marking a task done, do a lightweight regression check:
1. Identify completed tasks whose recorded files overlap with the files just modified
2. Quick-check their acceptance criteria against current code
3. If regressions found: create fix tasks (see Step 4)
4. If all pass: continue to next task

This is configurable. Users who prefer speed over safety can disable it. When disabled,
regressions are only caught during `verify` mode.

---

### Step 4: Fix Tasks

When a runtime failure, regression, or integration error is detected — whether during
implementation (Step 3c), verification (Step 3d), or spot-check (Step 3e):

1. **Classify the issue**:
   - `runtime-error`: Code throws an error during execution
   - `regression`: Previously-passing acceptance criteria now fail
   - `integration-failure`: Two modules don't work together as specs described

2. **Distinguish from spec gaps**: A fix task means "the spec is right, the code is wrong."
   If the issue is that the spec is incomplete or wrong, use gap triage (Step 5) instead.

3. **Create the fix task**:
   ```
   F-001: Fix [description] ([type] from T-[source])
   - Source task: T-[NNN] (the task whose code has the bug)
   - Discovered during: T-[MMM] (the task being worked on when the bug surfaced)
   - Files affected: [list]
   - Type: runtime-error | regression | integration-failure
   ```

4. **Implement the fix**: Prioritize over new tasks. Fix the code.

5. **Re-verify the source task**: Does the fixed code still meet its original acceptance
   criteria?

6. **Cascade re-verification**: Flag all completed tasks that:
   - Have files overlapping with the fix's modified files, OR
   - Transitively depend on the source task
   Mark them `needs-re-verification`. Process re-verifications before continuing with
   new tasks.

7. **Cascade deduplication**: If multiple fix tasks resolve in a batch, collect the union
   of all `needs-re-verification` tasks, deduplicate, then re-verify each once.

8. **Update tracking**: Record fix task in IMPLEMENTATION_PROGRESS.md.

**When to create fix tasks vs. absorb inline**: Small issues discovered while implementing
the current task (missing import, wrong variable name, obvious typo) are fixed inline — no
separate fix task needed. Fix tasks are for issues that affect OTHER tasks' code or that
require significant debugging.

---

### Step 5: Spec Gap Triage

When implementation reveals a spec gap (missing information, ambiguous contract, impossible
requirement):

| Gap Level | Example | Action |
|-----------|---------|--------|
| **L0 — Trivial** | Typo in spec, obvious default missing | Patch spec inline, log in progress file, continue |
| **L1 — Contained** | Edge case not covered, minor ambiguity | Log gap, flag to user: "Spec doesn't cover [X]. I'll continue with assumption [Y] unless you disagree." |
| **L2 — Significant** | Design-level gap, conflicting constraints | Pause this task. "This task requires [X] but no spec covers it. This is a design decision. Options: a) Make a call now and I'll implement it, b) Run `/doc-researcher research '[topic]'` to resolve properly." |

L0 and L1 gaps don't block the queue — the current task continues (L0 silently, L1 with
a stated assumption). L2 gaps pause the affected task but NOT the whole queue — other
unblocked tasks can continue.

Record all gaps in IMPLEMENTATION_PROGRESS.md with ID (G-NNN), task, description, level,
status, and resolution.

---

### Step 6: Tangent Handling

Real development has tangents. The run mode accommodates them:

| Tangent Size | Example | Handling |
|-------------|---------|----------|
| **Small** | Fix import, adjust config | Absorbed into current task |
| **Medium** | Debug error, fix regression | Fix task (F-NNN), Step 4 |
| **Large** | User refactors module externally | Caught by reconciliation on next resume |
| **Off-script** | User implements several features manually | Full reconciliation: check all tasks against code reality |

When the user returns after off-script work, reconciliation (Step 1) handles it:
- For each task: check if acceptance criteria are met by existing code
- Tasks whose criteria are met: mark `done (external)`
- Tasks partially met: mark `in-progress` with notes on what remains
- Tasks unaffected: remain `pending`

The queue reflects reality after reconciliation. Continue from wherever it actually stands.

---

### Session End

Before ending a session (context compression, user stops, crash recovery):

1. Update IMPLEMENTATION_PROGRESS.md with:
   - Current date as "Last session"
   - All task state changes from this session
   - Any open gaps or fix tasks
   - Git commit reference if available (for next reconciliation)

2. Update TASKS.md with any status changes.

3. Tell the user: "Session saved. [N] tasks completed this session, [M] remaining.
   Run `/implementer run` to continue or `/implementer status` for an overview."
