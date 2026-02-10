## Verify Mode

Post-implementation holistic verification. This is the implementation equivalent of
`/doc-reviewer verify` after a merge — it checks the whole picture, not just individual
task acceptance criteria.

Run verify after all tasks are complete, or after a significant batch of tasks to catch
issues before they compound.

**Gate**: At least one task must be in `done` status. If no tasks are completed: "Nothing
to verify — no tasks have been implemented yet."

---

### Four Verification Dimensions

#### Dimension 1: Per-Task Acceptance Criteria

Re-check every completed task's acceptance criteria against current code.

This catches:
- Regressions from later tasks that weren't caught by spot-checks
- Drift from acceptance criteria due to refactoring
- Criteria that passed initially but were invalidated by subsequent work

For each task with status `done` or `done (external)`:
1. Read the acceptance criteria from TASKS.md
2. Check each criterion against the current codebase
3. Record: pass/fail per criterion

If failures found: create fix tasks (same as run-mode Step 4) or flag for user decision
if the code was externally written.

#### Dimension 2: Per-Spec Contract Compliance

Check that the full implementation honors the spec contracts — not just task-level criteria,
but the spec as a whole.

This catches:
- Tasks that individually pass criteria but collectively don't satisfy the spec
- Interface mismatches between implementations of different spec sections
- Type inconsistencies (spec says UUID, code uses integer IDs)
- Missing constraints (spec says unique, code doesn't enforce it)

For each spec file:
1. Read the full spec
2. Check the implemented code against every contract, type, and constraint
3. Record: compliant/non-compliant per spec section

Report non-compliances with specific file and line references.

#### Dimension 3: Cross-Spec Integration

Check that implemented modules work together as the specs described.

This catches:
- API endpoint returns a shape that the UI doesn't expect
- Database schema doesn't match the data model spec
- Event producers emit events that consumers don't handle
- Authentication flow doesn't connect frontend to backend correctly

For each cross-spec dependency (from `.spec-manifest.md`):
1. Read both specs' shared interface definitions
2. Check that both sides of the interface are implemented consistently
3. Look for shape mismatches, missing fields, type disagreements

This dimension requires reading code across module boundaries — it's the most context-heavy
check.

#### Dimension 4: Spec-to-Doc Alignment

Check that the implemented code still aligns with the system docs. This is where the
implementer connects back to the documentation pipeline.

Invoke `/doc-reviewer sync` (if available) to check:
- Do file paths in system docs match actual code structure?
- Do technology claims in docs match actual dependencies?
- Do architectural patterns described in docs match code patterns?

If doc-reviewer sync is not available (skill not loaded), do a lightweight manual check:
- Read Architecture doc and PRD
- Verify key claims against implemented code
- Flag any obvious misalignments

---

### Output

Update IMPLEMENTATION_PROGRESS.md with verification results:

```markdown
## Verification Results

**Run date**: [date]
**Scope**: [all completed tasks | tasks T-001 through T-012]

### Per-Task Acceptance Criteria
- 15/15 tasks pass all criteria ✓
  (or: T-007 fails criterion 3: "Dashboard loads in under 2s" — actual: 4.2s)

### Per-Spec Contract Compliance
- api-spec.yaml: COMPLIANT
- data-model-spec.md: COMPLIANT
- auth-spec.md: NON-COMPLIANT — token refresh endpoint returns 200 instead of 204

### Cross-Spec Integration
- API ↔ UI: PASS — response shapes match
- API ↔ Database: PASS — queries match schema
- Auth ↔ API: ISSUE — middleware expects header "Authorization", UI sends "X-Auth-Token"

### Spec-to-Doc Alignment
- [doc-reviewer sync results or manual check findings]
```

### After Verification

If all dimensions pass: "Verification complete. All specs implemented correctly.
Implementation is done."

If issues found: "Verification found [N] issues. [Summary]. Fix these before considering
implementation complete." Create fix tasks for actionable issues.

After all verification passes, update IMPLEMENTATION_PROGRESS.md status to `Complete`.
