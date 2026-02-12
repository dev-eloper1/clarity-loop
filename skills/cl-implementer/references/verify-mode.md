## Verify Mode

Post-implementation holistic verification. This is the implementation equivalent of
`/cl-reviewer verify` after a merge — it checks the whole picture, not just individual
task acceptance criteria.

Run verify after all tasks are complete, or after a significant batch of tasks to catch
issues before they compound.

**Gate**: At least one task must be in `done` status. If no tasks are completed: "Nothing
to verify — no tasks have been implemented yet."

---

### Six Verification Dimensions

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

Invoke `/cl-reviewer sync` (if available) to check:
- Do file paths in system docs match actual code structure?
- Do technology claims in docs match actual dependencies?
- Do architectural patterns described in docs match code patterns?

If cl-reviewer sync is not available (skill not loaded), do a lightweight manual check:
- Read Architecture doc and PRD
- Verify key claims against implemented code
- Flag any obvious misalignments

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

#### Dimension 6: Dependency Audit

Check the project's dependency health as a whole.

This catches:
- Vulnerabilities published after dependencies were installed
- Transitive dependency issues not caught per-task
- License compliance across the full dependency tree
- Hallucinated packages that slipped through (package exists but provides wrong functionality)
- Unnecessary dependencies (installed but never imported)

Steps:
1. Run `npm audit --json` (or equivalent for the project's package manager)
2. Parse results: group by severity (critical, high, medium, low)
3. Check all direct dependencies against SECURITY_SPEC.md approved license list
4. Cross-reference `package.json` dependencies against actual imports in source code —
   flag unused dependencies
5. Verify lockfile integrity (`npm ci --dry-run` or equivalent)

Report (with checkpoint tier assignments for autopilot compatibility).
Note: Medium CVEs are intentionally escalated from Tier 3 (during per-task implementation
in run mode) to Tier 2 here because verify is the final gate — a medium CVE that was
acceptable per-task may compound across the full dependency tree.
- Critical/High: must fix before implementation is considered complete — **Tier 1** (must-confirm, always stops autopilot)
- Medium: should fix, log for tracking — **Tier 2** (batch review, escalated from Tier 3 at final gate)
- Low: informational only — **Tier 3** (auto-proceed, logged with [auto-default] tag)
- License violations: flag for user decision — **Tier 1** (copyleft implications require explicit approval)
- Unused dependencies: suggest removal — **Tier 3** (advisory)

If no package manager or no SECURITY_SPEC.md: skip this dimension with a note.

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
- [cl-reviewer sync results or manual check findings]

### Test Coverage (if TEST_SPEC.md exists)
- Per-module unit test coverage: 8/8 modules have tests ✓
  (or: Auth Service module has 3/7 specified test cases covered)
- Integration test coverage: 3/3 boundaries tested ✓
- Contract test coverage: 2/2 contracts verified ✓
- Full suite: 47 tests passing ✓

### Dependency Audit
- npm audit: 0 critical, 0 high, 2 medium (advisory only)
- Licenses: all MIT/Apache-2.0 — compliant
- Unused dependencies: `lodash` (installed but never imported) — suggest removal
- Lockfile: verified
```

### After Verification

If all dimensions pass: "Verification complete. All specs implemented correctly.
Implementation is done."

If issues found: "Verification found [N] issues. [Summary]. Fix these before considering
implementation complete." Create fix tasks for actionable issues.

If Dimension 4 (spec-to-doc alignment) found misalignments where the implementation
deviates from system docs, log Decision entries in `docs/DECISIONS.md` for each
significant misalignment — documenting whether the code or the docs should be updated
and why. Use Pipeline Phase `implementation`, Source the verification dimension and
finding.

After all verification passes, update IMPLEMENTATION_PROGRESS.md status to `Complete`.
