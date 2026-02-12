## Governance and Operational Verification Checks

Reference for Dimension 7 of verify mode and for audit mode sub-dimensions. These checks
address infrastructure completeness, code quality conventions, and long-term governance
concerns that the first six dimensions don't cover.

### Sub-Check 7a: Config Completeness

If CONFIG_SPEC.md exists:
1. Compare CONFIG_SPEC.md variables against actual `.env.example` or config files
2. Verify all required variables are documented
3. Check that config validation exists at startup (crashes on missing required vars)
4. Verify no hardcoded secrets in source code (scan for patterns: API keys, passwords,
   connection strings in non-env files)

Report: config variables covered / total specified, hardcoded secrets found (if any).

### Sub-Check 7b: Observability Coverage

If observability specs exist:
1. Verify health endpoint exists and returns expected shape
2. Check that structured logging is configured (not raw console.log in production code)
3. Verify request correlation ID is propagated (middleware exists)
4. Check log level configuration (environment-based)

Report: observability features implemented / specified.

### Sub-Check 7c: Dependency Compatibility

1. Run the project's package manager install in dry-run mode
2. Check for peer dependency warnings
3. Cross-reference installed versions against context file version pins
4. Flag any known incompatibilities from context file gotchas sections

Report: compatibility issues found (if any).

### Sub-Check 7d: Code Organization Consistency

If code conventions spec exists:
1. Scan source files for naming pattern consistency (are all files kebab-case? Mixed?)
2. Check directory structure against the conventions spec
3. Verify import patterns are consistent (barrel exports used consistently or not at all)
4. Check test file location consistency

Report: pattern violations found / files scanned.

### Sub-Check 7e: Performance Budget

If performance criteria exist in specs:
1. Check bundle size (if build tools available): `npm run build` and measure output
2. Check for obvious N+1 query patterns (scan for queries inside loops)
3. If a running server is available: measure response time for key endpoints
4. Flag any spec criteria that can't be verified without specific tooling

Report: budgets met / budgets specified / budgets not measurable.

### Sub-Check 7f: L1 Assumption Scan

Scan IMPLEMENTATION_PROGRESS.md for all L1 assumptions:
1. Group by category
2. Count total and per-category
3. Flag categories with 5+ assumptions as systemic gaps
4. Compare against DECISIONS.md — are there decisions that should have prevented these
   assumptions? (indicates decision coverage gaps)
5. Suggest batch promotion for accumulated categories

Report: total L1 assumptions, per-category counts, systemic gaps flagged.

### Sub-Check 7g: Backend Policy Adherence

If backend policies spec exists:
1. Check idempotency: Do POST/PUT endpoints that create resources accept an
   idempotency key? (Scan route handlers)
2. Check transaction boundaries: Do multi-step operations use transactions?
   (Scan service layer for transaction patterns)
3. Check validation authority: Is the specified validation layer actually validating?
   (Scan for validation middleware/decorators)
4. Check caching: If caching is specified, is it implemented consistently?

Report: policies implemented / policies specified.

### Sub-Check 7h: Data Model Consistency

If data modeling specs exist per entity:
1. Verify deletion strategy matches spec (soft delete columns exist where specified)
2. Check cascade behavior matches (FK constraints match spec)
3. Verify temporal columns exist (created_at, updated_at, deleted_at as specified)
4. Check that indexes exist for columns specified in the data modeling section

Report: data model compliance per entity.

### Sub-Check 7i: Architecture Alignment

Compare implemented code patterns against ARCHITECTURE.md (or equivalent):
1. **Dependency direction**: Do imports follow the specified layer hierarchy?
   (e.g., services don't import from routes, data layer doesn't import from UI)
2. **Communication patterns**: If architecture says "event-driven," scan for direct
   synchronous calls between modules that should communicate via events
3. **Layer boundaries**: Are there files that blur layer boundaries?
   (e.g., database queries in route handlers, UI logic in services)
4. **Module structure**: Does the actual directory structure match the architecture's
   module descriptions?

This is the most judgment-heavy sub-check. Flag findings as advisory rather than
pass/fail — architectural alignment is a spectrum, not a binary.

Report: alignment observations, structural drift indicators.

### Sub-Check 7j: DECISIONS.md Reconciliation

Scan DECISIONS.md for all active decisions:
1. For each decision with a verifiable implementation claim (technology choice, pattern
   choice, configuration value), check if the code reflects it
2. Flag decisions the implementation contradicts: "D-NNN says [X] but code does [Y]"
3. Distinguish intentional evolution (decision may need updating) from accidental drift
   (code may need fixing)

Report: decisions verified / decisions active, contradictions found.

### Verify Mode Usage

In verify mode, present Dimension 7 as a grouped report:

```
### Operational and Governance Checks
- Config completeness: 12/12 variables documented, 0 hardcoded secrets
- Observability: 3/4 features (missing: distributed tracing — advisory)
- Dependency compatibility: No conflicts detected
- Code organization: 2 naming violations in 147 files (minor)
- Performance: 2/3 budgets measurable, both met (bundle size not measurable without build)
- L1 assumptions: 7 total (3 pagination, 2 caching, 2 naming) — pagination flagged (systemic)
- Backend policies: 4/5 implemented (missing: idempotency on POST /orders)
- Data model: All entities compliant
- Architecture alignment: Advisory — 2 direct service-to-service calls where event-driven specified
- DECISIONS.md: 18/20 verified, 2 contradictions flagged
```

### Audit Mode Usage

For audit mode (cl-reviewer), these checks inform two existing dimensions:

**Dimension 4 (Goal Alignment & Drift)**: Add L1 trend analysis — compare L1 assumption
counts across audit periods. Are assumptions accumulating in the same areas? This
indicates the system docs have persistent gaps in those domains.

**Dimension 5 (Completeness)**: Add structural drift detection — compare the
architecture doc's module descriptions, communication patterns, and layer boundaries
against the implemented code structure. Flag areas where the architecture doc describes
a system that no longer matches reality.
