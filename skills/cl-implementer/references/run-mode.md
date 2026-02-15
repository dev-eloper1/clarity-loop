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

1. **Read TASKS.md** — get last session date, task states, known files
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
   column in TASKS.md.

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
- **Mismatch**: "Specs have changed since TASKS.md was generated. Run `/cl-implementer sync`
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
  a) Run `/cl-implementer sync` to update all tasks from new specs
  b) Continue with this task anyway (user's call — maybe the change is minor)
  c) Skip this task and move to the next

#### 3c: Implement

Implement the task. This is where Claude Code writes code:

1. Read the task's spec reference in full
2. Read any dependency tasks' files (for context on what already exists)
3. **Load relevant context** — if `{docsRoot}/context/.context-manifest.md` exists:
   a. Read the manifest to identify libraries relevant to this task (match spec references,
      file types, and task description against library names and tags)
   b. For each relevant library: read `_meta.md`, match task category against file tags
      in the inventory, load matching detail files
   c. Inject loaded context after spec reference, before implementation
   d. Record which context files were loaded in TASKS.md
   (See `skills/cl-researcher/references/context-mode.md` → "Standard Loading Protocol"
   for the full protocol.)
3.5. **Dependency verification** — When the implementation requires adding a new dependency
     (detected by `npm install`, `yarn add`, or similar in the implementation code):

     a) **Pre-install: Registry existence check** — Before installing, verify the package
        exists in the npm registry (or relevant package manager registry). This catches
        hallucinated packages — AI-generated code frequently imports packages that don't
        exist, creating typosquatting risk. Check: `npm view <package-name> version`.
        If the package doesn't exist — **Tier 1** (must-confirm): "Package `<name>` not
        found in npm registry. This may be a hallucinated dependency. Searching for
        alternatives..." — then search for the intended functionality and suggest a real
        package.

     b) **Post-install: Vulnerability audit** — After installation, run `npm audit --json`
        (or equivalent). Parse results with checkpoint tier assignments:
        - **Critical/High CVEs** — **Tier 1** (must-confirm): Block. "Dependency `<name>`
          has critical vulnerability [CVE-ID]: [description]. Options: a) Find an alternative
          package, b) Pin to a patched version if available, c) Accept risk (requires user
          approval)."
        - **Medium/Low** — **Tier 3** (auto-proceed): Warn. "Note: `<name>` has [N]
          medium/low advisories. Logged for reference." Continue without blocking.

     c) **License check** — Verify the package's license against the approved list from
        SECURITY_SPEC.md (or defaults from `dependencies` category decision in DECISIONS.md,
        or fallback: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC).
        - **Flagged license** (GPL, LGPL, AGPL, unknown) — **Tier 1** (must-confirm): Warn.
          "Package `<name>` uses [license]. This may have copyleft implications. Continue?
          [Y/flag for review]"
        - **Approved license**: Continue silently — **Tier 3** (auto-proceed).

     Record all dependency additions in TASKS.md with package name,
     version, license, and audit status.

4. Implement the code to meet the acceptance criteria
5. Test/verify the implementation against each criterion. If `TEST_SPEC.md` exists and
   has a per-module section for this task's spec reference, use the test cases defined
   there as additional verification criteria — particularly the edge cases and mock
   boundary specifications. This does not mean writing formal test files in run mode
   (that's autopilot's job) — it means checking the implementation against the test
   spec's expectations to catch issues before moving on.
6. Record files modified and update `_meta.md` "Tasks Implemented With This Context" for
   each library whose context was loaded

For parallel groups (if user approved in start mode):
- Fork subagents for each independent group
- Each subagent gets: task description, spec references, acceptance criteria, context
  about dependencies
- Each subagent implements independently and reports: files modified, criteria status,
  gaps found
- Main context: collect results, check for file conflicts (same file modified by multiple
  subagents), resolve conflicts or re-run sequentially
- Update TASKS.md and TASKS.md from main context

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

#### 3f: L1 Assumption Check (Periodic)

After completing every 5th task (configurable), scan TASKS.md's Spec
Gaps table for L1 assumptions:

1. **Count L1 assumptions by category**: Group all gaps with level `L1` by their
   implicit category (pagination, error handling, state management, caching, validation,
   naming, etc.)

2. **Threshold check**: If any category has 5+ L1 assumptions:
   - "I've made [N] assumptions about [category] across [M] tasks. This suggests a
     systemic spec gap. Options:
     a) Batch-promote to DECISIONS.md (make these the official decisions)
     b) Start a research cycle to properly resolve [category]
     c) Continue accumulating (your call — but drift risk increases)"

3. **If user chooses batch-promote**: For each L1 assumption in the category:
   - Create a compact DECISIONS.md entry with category tag, source `implementation:T-NNN`,
     and the assumption as the decision
   - Update the Spec Gaps table: change status from `L1-logged` to `promoted-to-decision`

4. **If user chooses research**: Log the gap as L2 and suggest
   `/cl-researcher research '[category] policy'`

5. **Log the check**: Record in TASKS.md when the L1 scan ran, what
   was found, and what action was taken.

The scan frequency is configurable in `.clarity-loop.json` under
`implementer.l1ScanFrequency` (default: 5 tasks). Set to 0 to disable.

---

### Step 4: Fix Tasks

When a runtime failure, regression, or integration error is detected — whether during
implementation (Step 3c), verification (Step 3d), or spot-check (Step 3e):

1. **Classify the issue**:
   - `runtime-error`: Code throws an error during execution
   - `regression`: Previously-passing acceptance criteria now fail
   - `integration-failure`: Two modules don't work together as specs described
   - `context-gap`: Error traced to stale or missing library knowledge (wrong import path,
     deprecated API, incorrect method signature). Distinguished from `runtime-error` by
     checking whether the error matches a known library API mismatch pattern.
   - `design-gap`: A visual/UI design element is missing or inadequate. Two detection paths:

     **Automatic** (structural): During implementation, the implementer checks task
     requirements against design artifacts. If a task references a component, state, or
     variant that doesn't exist in DESIGN_SYSTEM.md or the design files, that's a structural
     design gap. Examples: spec says "show loading spinner" but no LoadingSpinner component
     was designed; spec says "error state" but the component has no error variant.

     **User-triggered** (visual): The user sees the implemented result and gives feedback
     like "this doesn't look right", "the layout is wrong", "the spacing is off", "I don't
     like how this looks", "this needs a hover state", or any visual quality complaint.
     The implementer can't judge visual quality — only the user can.

     **Important: verify implementation matches spec first.** When the user reports a visual
     issue, do NOT immediately classify as design-gap. First check whether the code
     faithfully implements the design spec:
     1. Read the relevant DESIGN_SYSTEM.md / UI_SCREENS.md sections
     2. Compare the implemented code against the spec (tokens, spacing, colors, layout)
     3. If the code DOESN'T match the spec → this is a `runtime-error` or `regression`,
        not a design gap. Fix the code to match the spec first.
     4. Show the user the fix. If they're now satisfied → done.
     5. If the code DOES match the spec and the user still doesn't like it → NOW it's a
        `design-gap`. The design itself needs to change.
     This prevents changing the design to accommodate buggy implementations.

     Distinguished from `spec-gap` by asking: "Is this a *what to build* question (spec
     gap) or a *how it should look/behave visually* question (design gap)?"

   - `supply-chain`: Dependency issue — vulnerable package, hallucinated import, license
     violation, or version conflict. Detection: `npm audit` failure, registry lookup failure,
     or license check failure. Distinguished from `context-gap` by asking: "Is this about
     how to USE a library correctly (context gap) or about WHETHER this library is safe to
     use (supply chain)?"

   For `supply-chain` issues:
   - Identify the problematic dependency and the specific issue (CVE, hallucination, license)
   - Propose resolution:
     - **Hallucinated**: Search for a real package that provides the needed functionality
     - **Vulnerable**: Find a patched version or alternative package
     - **License**: Flag for user decision
   - Replace the dependency in all affected files
   - Re-run tests for all tasks that depend on the replaced package

   For `context-gap` issues:
   - Check if context files exist for the library in question
   - If no context: "Build error caused by stale [library] knowledge. No context file
     exists. Run `/cl-researcher context [library]` to create one? [Y/n]"
   - If context exists but may be wrong: "Context for [library] may be inaccurate (version
     [X]). Update context? Note: [N] tasks were implemented with current context — updating
     will version the context, not replace it. [Y/n]"
   - If user approves: researcher updates/versions context, implementer retries the task

   For `design-gap` issues:
   - Check if design artifacts exist (`{docsRoot}/designs/`, `{docsRoot}/specs/DESIGN_SYSTEM.md`)
   - Determine scope:
     - **Component-level** (missing state, variant, or new component): "Implementation needs
       a [loading state / error variant / new component] that isn't in the design system.
       Run `/cl-designer tokens` to add it? [Y/n]"
     - **Screen-level** (layout broken, flow doesn't work): "The [screen] layout doesn't
       work for [reason]. Run `/cl-designer mockups` to revise it? [Y/n]"
     - **Visual quality** (user says "this doesn't look right", "spacing is off", etc.):
       First verify the code matches the design spec (see detection paths above). If the
       code is faithful to the spec: "The implementation matches the design spec, but I
       hear you — the design itself needs work. Options: a) Run `/cl-designer mockups` to
       revise the screen design, b) Run `/cl-designer tokens` to adjust the design system,
       c) Make a quick visual call now and continue."
     - **Requirements-level** (the whole interaction pattern is wrong): This is actually a
       spec gap or research need, not a design gap. Reclassify as L2 spec gap and route to
       `/cl-researcher research`.
   - If user approves: cl-designer updates design artifacts, implementer retries the task
   - If no design artifacts exist at all: "No design system found. Options: a) Run
     `/cl-designer setup` to create one, b) Make a visual call now and continue."

2. **Distinguish fix tasks, spec gaps, context gaps, and design gaps**:
   - **Fix task**: The spec is right, the code is wrong. Fix the code.
   - **Spec gap** (Step 5): The spec is incomplete or wrong. A *what to build* question.
   - **Context gap**: The spec is right, but the library knowledge used to implement it is
     wrong or missing. A *how to build it with this library* question.
   - **Design gap**: The spec is right, but the visual design is missing or inadequate.
     A *how it should look or behave visually* question. Routes to cl-designer, not research.

3. **Create the fix task**:
   ```
   F-001: Fix [description] ([type] from T-[source])
   - Source task: T-[NNN] (the task whose code has the bug)
   - Discovered during: T-[MMM] (the task being worked on when the bug surfaced)
   - Files affected: [list]
   - Type: runtime-error | regression | integration-failure | design-gap
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

8. **Update tracking**: Record fix task in TASKS.md.

**When to create fix tasks vs. absorb inline**: Small issues discovered while implementing
the current task (missing import, wrong variable name, obvious typo) are fixed inline — no
separate fix task needed. Fix tasks are for issues that affect OTHER tasks' code or that
require significant debugging.

#### Behavioral bugs and emergent issues

Some bugs can't be predicted during research, design, or spec generation — they emerge only
when code runs: race conditions, unexpected state interactions, browser quirks, memory leaks
from a specific pattern, two libraries conflicting. These do NOT require a pipeline loop.

**Triage by what the bug reveals, not by how hard it is to fix:**

| What the bug reveals | Classification | Action |
|---|---|---|
| The code is wrong, the spec is fine | Fix task (`runtime-error` / `regression`) | Fix the code. No pipeline. |
| An edge case the spec didn't cover | L0/L1 spec gap | Patch spec inline (L0) or log assumption and ask user (L1). Continue. |
| A behavioral decision is needed (e.g., "should we debounce or throttle?") | L1 spec gap | State assumption, ask user. Log decision to DECISIONS.md. Continue. |
| The approach described in system docs fundamentally doesn't work | L2 spec gap | Pause task. Offer: make a call now, or research cycle. Only this triggers the pipeline. |

Most emergent bugs land in the first three rows — handled entirely within the implementer.
The full pipeline loop (research → proposal → review → merge) is only for the rare case
where a bug proves the *documentation itself* is wrong, not just the code. Even then, the
user can choose to make a quick call and continue instead.

**Always log behavioral decisions.** When a bug forces a decision that the spec didn't
anticipate (debounce vs. throttle, retry strategy, error recovery approach), log it to
DECISIONS.md regardless of severity. These decisions become constraints for future tasks
and future research — they're implementation knowledge that shouldn't be lost.

---

### Step 5: Spec Gap Triage

When implementation reveals a spec gap (missing information, ambiguous contract, impossible
requirement):

| Gap Level | Example | Action |
|-----------|---------|--------|
| **L0 — Trivial** | Typo in spec, obvious default missing | Patch spec inline, log in progress file, continue |
| **L1 — Contained** | Edge case not covered, minor ambiguity | Log gap, flag to user: "Spec doesn't cover [X]. I'll continue with assumption [Y] unless you disagree." |
| **L2 — Significant** | Conflicting constraints, missing requirements | Pause this task. "This task requires [X] but no spec covers it. Options: a) Make a call now and I'll implement it, b) Run `/cl-researcher research '[topic]'` to resolve properly." Note: if the gap is visual/UI (how it looks, not what it does), classify as `design-gap` in Step 4 instead — route to `/cl-designer`, not research. |

L0 and L1 gaps don't block the queue — the current task continues (L0 silently, L1 with
a stated assumption). L2 gaps pause the affected task but NOT the whole queue — other
unblocked tasks can continue.

Record all gaps in TASKS.md with ID (G-NNN), task, description, level,
status, and resolution.

**Log L2 gaps and user decisions to DECISIONS.md**: When an L2 gap is identified or when
the user decides how to resolve any gap (including L1 assumptions they override), log a
Decision entry in `docs/DECISIONS.md`:
- **Pipeline Phase**: `implementation`
- **Source**: Task (T-NNN), Gap (G-NNN), spec file and section
- **Context**: What the spec doesn't cover, why it blocks implementation
- **Options Considered**: The resolution options presented to the user
- **Decision**: What was chosen (including "research cycle needed")
- **Status**: `active`

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

1. Update TASKS.md with:
   - Current date as "Last session"
   - All task state changes from this session
   - Any open gaps or fix tasks
   - Git commit reference if available (for next reconciliation)

2. Update TASKS.md with any status changes.

3. Tell the user: "Session saved. [N] tasks completed this session, [M] remaining.
   Run `/cl-implementer run` to continue or `/cl-implementer status` for an overview."
