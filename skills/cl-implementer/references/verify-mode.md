---
mode: verify
tier: structured
depends-on: [run-mode.md, spec-mode.md]
state-files: [TASKS.md, .spec-manifest.md, TEST_SPEC.md, SECURITY_SPEC.md, DECISIONS.md]
---

## Verify Mode

Post-implementation holistic verification. This is the implementation equivalent of
`/cl-reviewer verify` after a merge — it checks the whole picture, not just individual
task acceptance criteria.

Run verify after all tasks are complete, or after a significant batch of tasks to catch
issues before they compound.

**Gate**: At least one task must be in `done` status. If no tasks are completed: "Nothing
to verify — no tasks have been implemented yet."

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| docsRoot | Project config / .clarity-loop.json | Yes | Root path for all documentation artifacts |
| TASKS.md | {docsRoot}/specs/ | Yes | Task tracker with completed task statuses and acceptance criteria |
| .spec-manifest.md | {docsRoot}/specs/ | Yes | Spec manifest for cross-spec dependency checks |
| TEST_SPEC.md | {docsRoot}/specs/ | No | Test spec for coverage verification (Dimension 5) |
| SECURITY_SPEC.md | {docsRoot}/specs/ | No | Security spec for license allowlist (Dimension 6) |
| DECISIONS.md | {docsRoot}/ | No | Decisions for alignment logging |
| Architecture doc | {docsRoot}/system/ | No | For spec-to-doc alignment (Dimension 4) |
| PRD | {docsRoot}/system/ | No | For spec-to-doc alignment (Dimension 4) |
| package.json | project root | No | For dependency audit (Dimension 6) |
| governance-checks.md | references/ | No | Sub-check process for Dimension 7 |

## Workflow

### Phase 1: Per-Task Acceptance Criteria (Dimension 1)

Re-check every completed task's acceptance criteria against current code.

This catches:
- Regressions from later tasks that weren't caught by spot-checks
- Drift from acceptance criteria due to refactoring
- Criteria that passed initially but were invalidated by subsequent work

**Step 1.** For each task with status `done` or `done (external)`:
1. Read the acceptance criteria from TASKS.md
2. Check each criterion against the current codebase
3. Record: pass/fail per criterion

**Verify**: All completed tasks' acceptance criteria checked against current code.
**On failure**: Create fix tasks (same as run-mode Phase 4) or flag for user decision if the code was externally written.

### Phase 2: Per-Spec Contract Compliance (Dimension 2)

Check that the full implementation honors the spec contracts — not just task-level criteria,
but the spec as a whole.

This catches:
- Tasks that individually pass criteria but collectively don't satisfy the spec
- Interface mismatches between implementations of different spec sections
- Type inconsistencies (spec says UUID, code uses integer IDs)
- Missing constraints (spec says unique, code doesn't enforce it)

**Step 2.** For each spec file:
1. Read the full spec
2. Check the implemented code against every contract, type, and constraint
3. Record: compliant/non-compliant per spec section

**Verify**: All spec contracts, types, and constraints verified against implemented code.
**On failure**: Report non-compliances with specific file and line references.

### Phase 3: Cross-Spec Integration (Dimension 3)

Check that implemented modules work together as the specs described.

This catches:
- API endpoint returns a shape that the UI doesn't expect
- Database schema doesn't match the data model spec
- Event producers emit events that consumers don't handle
- Authentication flow doesn't connect frontend to backend correctly

**Step 3.** For each cross-spec dependency (from `.spec-manifest.md`):
1. Read both specs' shared interface definitions
2. Check that both sides of the interface are implemented consistently
3. Look for shape mismatches, missing fields, type disagreements

**Verify**: All cross-spec interfaces implemented consistently on both sides.
**On failure**: Report mismatches with both spec references and implementation file locations.

This dimension requires reading code across module boundaries — it's the most context-heavy
check.

### Phase 4: Spec-to-Doc Alignment (Dimension 4)

Check that the implemented code still aligns with the system docs. This is where the
implementer connects back to the documentation pipeline.

**Step 4.** Invoke `/cl-reviewer sync` (if available) to check:
- Do file paths in system docs match actual code structure?
- Do technology claims in docs match actual dependencies?
- Do architectural patterns described in docs match code patterns?

If cl-reviewer sync is not available (skill not loaded), do a lightweight manual check:
- Read Architecture doc and PRD
- Verify key claims against implemented code
- Flag any obvious misalignments

**Verify**: Implemented code aligns with system doc claims.
**On failure**: Flag misalignments for user decision (update code or update docs).

### Phase 5: Test Coverage Against Test Spec (Dimension 5)

If `TEST_SPEC.md` exists, verify that the test suite conforms to the specification.

This catches:
- Missing test files for modules that TEST_SPEC.md defines test cases for
- Mock boundaries that don't match TEST_SPEC.md (e.g., spec says mock DB, tests use real DB)
- Missing integration tests for boundaries defined in TEST_SPEC.md
- Missing contract tests
- Test data factories that don't cover all entities in TEST_SPEC.md

**Step 5.** For each section in TEST_SPEC.md:
1. Check that corresponding test files exist
2. Verify test count covers the specified test cases (not necessarily 1:1, but
   all specified functions/flows should have at least one test)
3. Verify integration test tasks match cross-spec integration contracts
4. Run the full test suite and report results

**Verify**: Test suite conforms to TEST_SPEC.md — all modules, integration boundaries, and contracts have tests.
**On failure**: Report missing test files, uncovered test cases, and mock boundary mismatches.

If TEST_SPEC.md doesn't exist, skip this dimension with a note: "No TEST_SPEC.md
found — test coverage verification skipped. Consider regenerating specs to include
test specifications."

### Phase 6: Dependency Audit (Dimension 6)

Check the project's dependency health as a whole.

This catches:
- Vulnerabilities published after dependencies were installed
- Transitive dependency issues not caught per-task
- License compliance across the full dependency tree
- Hallucinated packages that slipped through (package exists but provides wrong functionality)
- Unnecessary dependencies (installed but never imported)

**Step 6.** Execute the audit:
1. Run `npm audit --json` (or equivalent for the project's package manager)
2. Parse results: group by severity (critical, high, medium, low)
3. Check all direct dependencies against SECURITY_SPEC.md approved license list
4. Cross-reference `package.json` dependencies against actual imports in source code —
   flag unused dependencies
5. Verify lockfile integrity (`npm ci --dry-run` or equivalent)

**Verify**: Dependency tree audited for vulnerabilities, licenses, and usage.
**On failure**: Report findings by severity tier.

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

### Phase 7: Operational and Governance Checks (Dimension 7)

Read `references/governance-checks.md` for the full sub-check process. This dimension
groups infrastructure, quality, and governance verification into a single composite check
with ten sub-checks:

**Step 7.** Execute applicable sub-checks:

| Sub-Check | What It Verifies | Skip If |
|-----------|-----------------|---------|
| 7a: Config completeness | Env vars documented, no hardcoded secrets, startup validation | No CONFIG_SPEC.md |
| 7b: Observability coverage | Health endpoint, structured logging, correlation IDs | No observability spec |
| 7c: Dependency compatibility | Peer dep conflicts, version pin alignment | No context files |
| 7d: Code organization consistency | Naming consistency, directory structure, import patterns | No code conventions spec |
| 7e: Performance budget | Bundle size, query patterns, response time | No performance criteria |
| 7f: L1 assumption scan | Assumption accumulation, systemic gap detection | No L1 assumptions logged |
| 7g: Backend policy adherence | Idempotency, transactions, validation authority | No backend policies spec |
| 7h: Data model consistency | Deletion strategy, cascade, temporal, indexes | No data modeling specs |
| 7i: Architecture alignment | Dependency direction, layer boundaries, communication patterns | No architecture doc |
| 7j: DECISIONS.md reconciliation | Active decisions reflected in code | No DECISIONS.md |

Not every sub-check applies to every project. Skip sub-checks whose prerequisite specs
don't exist, with a note in the output.

**Verify**: All applicable governance sub-checks executed and findings recorded.
**On failure**: Surface governance concerns; Dimension 7 doesn't fail verification unless a sub-check reveals a critical issue (hardcoded secrets, critical architectural drift).

Report findings as a grouped summary (see governance-checks.md for format). Sub-checks
are advisory rather than blocking — Dimension 7 surfaces governance concerns but
doesn't fail the verification unless a sub-check reveals a critical issue (hardcoded
secrets, critical architectural drift).

### Phase 8: Generate Verification Output

**Step 8.** Update TASKS.md with verification results:

```markdown
## Verification Results

**Run date**: [date]
**Scope**: [all completed tasks | tasks T-001 through T-012]

### Per-Task Acceptance Criteria
- 15/15 tasks pass all criteria
  (or: T-007 fails criterion 3: "Dashboard loads in under 2s" — actual: 4.2s)

### Per-Spec Contract Compliance
- api-spec.yaml: COMPLIANT
- data-model-spec.md: COMPLIANT
- auth-spec.md: NON-COMPLIANT — token refresh endpoint returns 200 instead of 204

### Cross-Spec Integration
- API <-> UI: PASS — response shapes match
- API <-> Database: PASS — queries match schema
- Auth <-> API: ISSUE — middleware expects header "Authorization", UI sends "X-Auth-Token"

### Spec-to-Doc Alignment
- [cl-reviewer sync results or manual check findings]

### Test Coverage (if TEST_SPEC.md exists)
- Per-module unit test coverage: 8/8 modules have tests
  (or: Auth Service module has 3/7 specified test cases covered)
- Integration test coverage: 3/3 boundaries tested
- Contract test coverage: 2/2 contracts verified
- Full suite: 47 tests passing

### Dependency Audit
- npm audit: 0 critical, 0 high, 2 medium (advisory only)
- Licenses: all MIT/Apache-2.0 — compliant
- Unused dependencies: `lodash` (installed but never imported) — suggest removal
- Lockfile: verified

### Operational and Governance Checks
- Config: 12/12 vars documented, 0 hardcoded secrets
- Observability: 3/4 (distributed tracing not implemented — advisory)
- Dependencies: No compatibility conflicts
- Code organization: 2 naming violations / 147 files (minor)
- Performance: 2/3 budgets met, 1 not measurable
- L1 assumptions: 7 total, 1 systemic gap (pagination — 3 assumptions)
- Backend policies: 4/5 implemented
- Data model: COMPLIANT
- Architecture alignment: 2 advisory findings
- DECISIONS.md: 18/20 verified, 2 contradictions
```

**Verify**: Verification output written to TASKS.md with all seven dimensions.
**On failure**: Ensure all dimensions are represented even if skipped.

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

After all verification passes, update TASKS.md status to `Complete`.

## Report

```
VERIFY: PASS | Tests: N/N passing | Dimensions: 7/7 clear
VERIFY: PASS | Tests: N/N passing | Dimensions: 6/7 clear | Advisory: M findings
VERIFY: FAIL | Failing: N | Dimensions with issues: [list]
```
