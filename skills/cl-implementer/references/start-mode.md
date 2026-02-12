## Start Mode

Generates a unified `TASKS.md` from all spec artifacts. This is the entry point for
implementation — run it once after specs are generated and reviewed.

If TASKS.md already exists: "An implementation plan already exists with [N] tasks ([M]
complete). Re-running start will regenerate from current specs and reset incomplete tasks.
Continue? This is usually only needed if specs were regenerated from scratch."

---

### Step 1: Pre-Checks

Run these checks before generating anything:

1. **Specs exist** — Read `{docsRoot}/specs/.spec-manifest.md`. If it doesn't exist:
   "No specs found. Run `/cl-implementer spec` first to create implementation specs."
   Stop.

2. **Spec review** — Check if any spec review output exists (from `/cl-implementer spec-review`).
   If not: "Specs haven't been reviewed for consistency. Consider running `/cl-implementer
   review` before implementation to catch cross-spec issues. Continue anyway? [Y/n]"

3. **Git repository** — Check if the project root is a git repository (`git rev-parse
   --git-dir`). If not:
   "This project isn't a git repository. Git enables implementation tracking — change
   detection, reconciliation on resume, regression identification. Initialize now? [Y/n]"
   - If yes: run `git init`. Offer to create an initial commit: "Create an initial commit
     with the current project state? This gives reconciliation a clean baseline. [Y/n]"
   - If no: warn "Without git, reconciliation accuracy is reduced. External changes may be
     missed or misattributed. The implementer will fall back to file modification timestamps."

4. **Spec coverage** — Cross-reference system doc areas against spec coverage. Read the
   system doc manifest (`{docsRoot}/system/.manifest.md`) and compare topics covered in
   system docs vs topics covered in specs. Warn on significant gaps:
   - "Your PRD describes [X] but no spec covers it. This area won't have implementation
     tasks. Intentional?"
   - Special case: if system docs mention testing requirements (search PRD for "test",
     "coverage", "CI", "CI/CD") but no testing spec exists, offer three paths:
     a) Add test tasks manually to TASKS.md after generation
     b) Run `/cl-researcher research 'testing strategy'` to create proper specs first
     c) Skip — implement features first, address testing later

5. **Context freshness** — If `{docsRoot}/context/.context-manifest.md` exists:
   - Read the manifest, get all library entries
   - For each library: compare version in `_meta.md` against `package.json` (or equivalent
     dependency file). Flag mismatches:
     "Context for [library] covers version [X] but package.json has [Y]. Context may be
     stale. Options:
     a) Run `/cl-researcher context [library]` to update
     b) Continue with current context (your call — may cause build issues)
     c) Skip context for this library"
   - Check `Last verified` dates against freshness thresholds (default: 7 days). Warn on
     stale context but don't block.
   - If no context manifest exists: "No context files found. Context files help avoid stale
     library knowledge during implementation. Run `/cl-researcher context` to create them,
     or continue without. [Continue/Create context]"

**Batch presentation**: Present all pre-check results as a single status table:

| Check | Status | Action Needed |
|-------|--------|--------------|
| Specs exist | Pass | -- |
| Spec review | Advisory | Not reviewed yet (recommend `/cl-implementer spec-review`) |
| Git repository | Pass / Action | [init or skip] |
| Spec coverage | Pass / Gaps | [list gaps with recommended action per gap] |
| Context freshness | Pass / Stale | [list stale libraries with recommended action] |

"Pre-checks complete. [N items need attention]. Address now or proceed?"

For each gap or stale item, include a recommended action inline so the user can approve
the batch in one response: "Specs not reviewed: recommend running spec-review first but
not blocking. Git repo: initialized. Context for drizzle-orm: stale (7 days), recommend
refresh. Proceed with these defaults, or adjust?"

---

### Step 2: Read All Spec Artifacts

1. Parse `.spec-manifest.md` — extract the list of spec files, their source doc mappings,
   cross-spec dependencies, and the content hash.

2. Read each spec file in full. For each, extract:
   - Defined types, entities, interfaces, contracts
   - Behavioral rules and constraints
   - Dependencies on other specs
   - Acceptance-testable conditions (these become task acceptance criteria)

3. Read `{docsRoot}/specs/DESIGN_TASKS.md` if it exists (from cl-designer build-plan mode).
   Parse its task structure: IDs, phases, dependencies, acceptance criteria, design references.

4. Read Architecture doc for tech stack context (framework, language, styling approach) —
   this informs task descriptions and complexity estimates.

---

### Step 3: Generate Unified TASKS.md

Write `{docsRoot}/specs/TASKS.md` with this structure:

```markdown
# Implementation Tasks

**Generated**: [date]
**Spec version**: [content hash from .spec-manifest.md]
**Source specs**: [list of spec files used]
**Source design tasks**: [DESIGN_TASKS.md or "None"]

## Dependency Graph

```mermaid
flowchart TD
    subgraph data["Data Layer"]
        T001[T-001: ...]
        T002[T-002: ...]
    end
    subgraph api["API Layer"]
        T003[T-003: ...]
    end
    subgraph ui["UI Layer"]
        T004[T-004: ...]
    end
    T001 --> T003
    T003 --> T004
```

## Area: Data Layer

### T-001: [Task Name]
- **Spec reference**: [spec-file.md], [Section or path]
- **Spec hash**: [hash of the referenced spec section]
- **Dependencies**: None
- **Status**: pending
- **Source**: spec-derived
- **Acceptance criteria**:
  - [ ] [concrete, verifiable condition from spec]
  - [ ] [another condition]
- **Complexity**: Simple | Medium | Complex

### T-002: [Task Name]
...

## Area: API Layer
...

## Area: UI Layer
...
```

**Task generation rules:**

1. **One task per bounded implementation unit.** A database table is one task. An API
   endpoint group (CRUD for one resource) is one task. A UI component is one task. Don't
   split too fine (individual columns) or too coarse (entire API layer).

2. **Areas, not phases.** Group by domain (Data, API, UI, Infrastructure, Testing), not by
   build order. The dependency graph handles ordering. Cross-area dependencies are the whole
   point — a screen task can depend on both a component task (UI) and an API task (backend).

3. **DESIGN_TASKS.md merge.** If DESIGN_TASKS.md exists, merge its tasks into the
   appropriate area (usually UI Layer). Renumber sequentially based on dependency-aware
   ordering. Preserve original DESIGN_TASKS.md references within task descriptions (e.g.,
   "Originally DESIGN_TASKS T-003"). DESIGN_TASKS.md remains as a design artifact; TASKS.md
   is the working implementation copy.

4. **Acceptance criteria from specs.** Each criterion must be concrete and verifiable —
   something that can be checked by reading code, running the app, or executing a test.
   "Implements the auth flow" is bad. "POST /auth/login returns a JWT with 1h expiry" is
   good.

5. **Spec hash per task.** Record the content hash of the specific spec section each task
   derives from. This enables validity checking during `sync` mode — if the spec section
   changes, the task's hash won't match.

6. **Task IDs are sequential.** T-001, T-002, T-003... regardless of area. The dependency
   graph provides ordering, not the ID numbers.

7. **Source marker.** All spec-derived tasks get `source: spec-derived`. Later, user-added
   tasks get `source: user-added` — they're tracked for progress but excluded from spec-based
   verification and sync.

---

### Step 4: Identify Parallelizable Groups

Analyze the dependency graph and file paths to find independent task groups:

- Tasks with NO dependency relationship (direct or transitive) between them
- Tasks that modify different files/directories (no shared code surface area)
- Tasks that don't share interface boundaries (unless the interface is defined upfront in
  a spec)

Present identified groups:
"These task groups can run in parallel (no shared dependencies or files):
  Group A: T-001, T-002 (Data Layer)
  Group B: T-005, T-006 (UI tokens + components)
Parallel execution uses Claude Code's fork capability. Approve? [Y/n/disable]"

If user disables: note in IMPLEMENTATION_PROGRESS.md that parallel execution is off.

---

### Step 5: User Review and Reordering

Present the full plan:
1. The dependency graph (Mermaid visualization)
2. The suggested implementation order (topological sort)
3. Parallelizable groups (if identified)
4. Total task count by area
5. Any spec coverage gaps found in pre-checks

"Here's the implementation plan: [N] tasks across [M] areas. You can reorder, split, merge,
skip, or add tasks. The dependency graph enforces hard constraints (can't build a component
before its tokens). Within those constraints, the order is yours. Any changes?"

Process user adjustments:
- **Reorder**: Move tasks, update dependency graph if needed
- **Split**: Break one task into subtasks, preserve spec references
- **Merge**: Combine tasks, union acceptance criteria
- **Skip**: Mark as `skipped` with reason. Check transitive dependents — if the requirement
  is satisfied externally (e.g., database already exists), mark `satisfied-externally` and
  unblock dependents. If not, flag dependents.
- **Add**: User-inserted tasks get `source: user-added` marker
- **Change dependencies**: Validate no circular deps, no orphaned references

After adjustments, regenerate the dependency graph if it changed.

---

### Step 6: Create IMPLEMENTATION_PROGRESS.md

Write `{docsRoot}/specs/IMPLEMENTATION_PROGRESS.md`:

```markdown
# Implementation Progress

**Spec version**: [content hash from .spec-manifest.md]
**Started**: [date]
**Last session**: [date]
**Status**: In Progress
**Git tracking**: [yes/no — based on git check in Step 1]
**Parallel execution**: [enabled/disabled — based on Step 4]

## Task Status

| Task | Status | Completed | Files Modified | Notes |
|------|--------|-----------|----------------|-------|
| T-001 | pending | — | — | — |
| T-002 | pending | — | — | — |
...

## Spec Gaps

| ID | Task | Gap | Level | Status | Resolution |
|----|------|-----|-------|--------|------------|

## Fix Tasks

| ID | Type | Source Task | Discovered During | Status | Files Modified |
|----|------|-----------|-------------------|--------|----------------|

## External Changes

| Date | Files Changed | Task Impact | Action Taken |
|------|--------------|-------------|--------------|

## Spec Sync History

| Date | Old Hash | New Hash | Impact | Action Taken |
|------|----------|----------|--------|--------------|
```

---

### Step 7: Populate Claude Code Tasks

For each task in TASKS.md, create a Claude Code task via `TaskCreate`:
- `subject`: Task ID + name (e.g., "T-001: Create database schema")
- `description`: Full task details including spec reference and acceptance criteria
- `activeForm`: Present continuous (e.g., "Creating database schema")

Set up `blockedBy` relationships matching the dependency graph.

This is the dual-write pattern: TASKS.md is the persistent source of truth (survives
sessions, crashes, context compression). Claude Code tasks are the active session view
(progress spinner, status display). Every state change must update both.

**Parallelization hint**: While the user reviews the task list (Step 5), pre-populate
Claude Code tasks (Step 7) for tasks that are dependency-free. If the user reorders,
update the task dependencies but the basic task entries are already created.
Invalidation risk: Medium -- user may split/merge/reorder tasks.

---

### Completion

Tell the user:
"Implementation plan ready. {N} tasks across {M} areas. Run `/cl-implementer run` to start
processing the queue, or `/cl-implementer status` for an overview."
