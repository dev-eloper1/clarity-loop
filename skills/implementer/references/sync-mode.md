## Sync Mode

Handles spec changes mid-implementation. When upstream changes (new research cycle, audit
findings, spec regeneration) produce new or modified specs, sync mode adjusts the task
queue to reflect the new reality.

**Gate**: TASKS.md must exist AND a spec hash mismatch must be detected (current
`.spec-manifest.md` hash differs from TASKS.md's recorded hash). If hashes match:
"Specs haven't changed since TASKS.md was generated. Nothing to sync."

---

### Step 1: Identify Changes

1. Read current `.spec-manifest.md` — extract file list, content hash, per-section hashes.
2. Read TASKS.md header — extract recorded spec version hash.
3. Compare overall hashes. If they differ, proceed to per-task analysis.

---

### Step 2: Per-Task Spec Hash Comparison

For each task in TASKS.md:

1. Read the task's `Spec hash` field (recorded hash of the spec section it derives from).
2. Compute the current hash of that same spec section.
3. Categorize:

| Task Status | Spec Hash | Category | Action |
|------------|-----------|----------|--------|
| `pending` | Match | Unchanged | No action |
| `pending` | Mismatch | Modified | Update acceptance criteria from new spec |
| `pending` | Section gone | Superseded | Mark `superseded`, generate replacement if new spec covers same area |
| `done` | Match | Unchanged | No action |
| `done` | Mismatch | Modified | Mark `needs-re-verification` |
| `done` | Section gone | Superseded | Mark `superseded` — completed work may need cleanup |
| `in-progress` | Mismatch | Modified | Flag to user: "The spec for your current task changed. Review before continuing." |
| `skipped` | Any | Skipped | No action (user chose to skip) |
| `externally-managed` | Any | External | No action (user owns this) |
| `user-added` (source) | N/A | User task | No action (no spec to compare against) |

---

### Step 3: Handle New Spec Sections

If the new `.spec-manifest.md` contains spec sections that have NO corresponding task in
TASKS.md:

1. Generate new tasks from the new spec sections (same rules as start-mode Step 3).
2. Assign sequential IDs continuing from the highest existing ID.
3. Determine dependencies:
   - Does the new task depend on existing tasks? (Check spec cross-references)
   - Do existing tasks depend on the new task? (Check if existing specs reference the new
     spec section)
4. Insert into TASKS.md at the dependency-appropriate position.
5. Mark new tasks as `source: spec-derived`.

---

### Step 4: Process Re-Verifications

For tasks marked `needs-re-verification` in Step 2:

1. Read the task's updated acceptance criteria (from new spec).
2. Check each criterion against the current code.
3. Results:
   - **All criteria still pass**: Task stays `done`. Update spec hash to current.
   - **Some criteria fail**: The spec change broke the implementation. Options:
     a) Re-queue as `pending` for re-implementation
     b) Create a fix task if the change is small
     c) Mark `externally-managed` if user wants to handle it themselves
   - **Criteria fundamentally changed**: Re-queue as `pending`. The old implementation
     doesn't apply to the new spec.

For tasks marked `superseded`:
- If the task was `pending`: Remove from queue (or mark `superseded` for audit trail).
- If the task was `done`: Flag to user: "T-003 was completed but its spec section no longer
  exists. The implemented code may need cleanup. Review? [Y/n/ignore]"

---

### Step 5: Cascade Analysis

After all direct task updates:

1. Check transitive dependencies: if a task was re-queued as `pending`, its dependents may
   now be blocked. Update their status.
2. Check completed dependents: if a task was `done` and its dependency was re-queued, the
   dependent should be re-verified (its foundation changed).
3. Deduplicate: if a task appears in multiple cascade chains, it only needs one
   re-verification.

---

### Step 6: Regenerate Dependency Graph

If tasks were added, removed, or had dependencies changed:

1. Regenerate the Mermaid dependency graph in TASKS.md.
2. Re-identify parallelizable groups (if parallel execution is enabled).

---

### Step 7: Present Changes to User

Show a summary of all changes before applying:

```
Sync summary (specs changed from [old-hash] to [new-hash]):

  Modified tasks (acceptance criteria updated):
    T-004: CRUD endpoints — new query parameter added
    T-007: Dashboard screen — new chart requirement

  Tasks needing re-verification:
    T-003: Auth endpoints — token format changed (was done)

  Superseded tasks:
    T-002: Migration scripts — old schema approach replaced

  New tasks:
    T-015: Event store schema (new spec: event-sourcing.md)
    T-016: Event projections (new spec: event-sourcing.md)

  Unaffected: 10 tasks

Apply these changes? [Y/n]
```

If user approves: apply all changes to TASKS.md, update IMPLEMENTATION_PROGRESS.md sync
history, update Claude Code tasks.

If user wants adjustments: process their feedback before applying.

---

### Step 8: Update Tracking

1. Update TASKS.md header with new spec version hash.
2. Add entry to IMPLEMENTATION_PROGRESS.md Spec Sync History:
   ```
   | [date] | [old-hash] | [new-hash] | [summary of impact] | [actions taken] |
   ```
3. Update Claude Code tasks to reflect any status changes.

Tell the user: "Sync complete. [N] tasks updated, [M] new tasks added, [K] tasks
superseded. Run `/implementer run` to continue implementation."
