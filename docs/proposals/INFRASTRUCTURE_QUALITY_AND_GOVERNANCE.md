# Proposal: Infrastructure, Quality Conventions, and Long-Term Governance

**Created**: 2026-02-12
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F23-F25, F28-F32, F35-F37)
**Author**: Bhushan + AI Researcher
**Depends On**: P1 (Behavioral Specs), P2 (Testing Pipeline), P3 (Security/Errors/API)

## Summary

This proposal addresses the remaining 11 gaps from the pipeline gap analysis — the operational, quality, and governance concerns that round out the Clarity Loop pipeline. These gaps fall into three clusters: operational readiness (environment configuration, data migration, observability, third-party integration contracts), code quality conventions (dependency compatibility, code organization, performance budgets), and long-term governance (L1 assumption accumulation, cross-cutting backend policies, data modeling behavioral decisions, specification drift).

While P1-P3 focused on the highest-impact behavioral, testing, and security gaps, P4 addresses the infrastructure and governance gaps that prevent projects from going to production and staying healthy over time. Without these, the pipeline produces code that works in development but breaks on deployment (no config spec), accumulates invisible technical debt (no L1 review), makes contradictory backend decisions per endpoint (no cross-cutting policies), and drifts silently from its architecture (no drift detection).

All changes use new reference files for substantial content to respect token budgets. Existing files receive thin pointers, not inline expansions.

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|---|---|---|
| docs/research/PIPELINE_GAP_ANALYSIS.md | F23 (Environment Configuration), F24 (Data Migration), F25 (Observability), F28 (Third-Party Integration Contracts), F29 (Dependency Compatibility), F30 (Code Organization), F31 (Performance Budgets), F32 (L1 Assumption Accumulation), F35 (Cross-Cutting Backend Policies), F36 (Data Modeling Behavioral Decisions), F37 (Specification Drift) | Tier 3 (infrastructure/operations/backend policies) + Tier 4 (quality governance/drift) from the research recommendations |

## System Context

### Research Type: Evolutionary

All changes modify existing skill files or add new reference files within the existing skill structure. No new skills or modes are created. Changes integrate into the existing pipeline flow at bootstrap, spec generation, start mode, run mode, autopilot, verify mode, and audit mode.

### Current State (After P1-P3 Merges)

| Artifact | Current State Summary | Sections Referenced |
|---|---|---|
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation (Step 2) probes for behavioral (P1), testing (P2), and security (P3) concerns. Step 2b (Project Profile Detection) captures cross-cutting decisions. Step 2c (Defaults Sheet) includes error handling, auth, testing, API style, security depth, dependency policy, accessibility, content, resilience, type sharing, target devices. ~718 lines. | Step 2 (Discovery), Step 2b (Profile Detection), Step 2c (Defaults Sheet) |
| `skills/cl-implementer/references/spec-mode.md` | Steps 1-6 with Step 4 (Generate Specs), Step 4+ (Cross-Cutting Specs via cross-cutting-specs.md), Step 4b (Generate Test Spec), Step 5 (Manifest), Step 6 (Update Tracking). | Steps 4, 4+, 4b, 5 |
| `skills/cl-implementer/references/cross-cutting-specs.md` | Steps 4a (Security Spec), 4b (Error Taxonomy), 4c (API Conventions Preamble), 4d (Shared Types). Per-spec edge cases and accessibility sections. | Steps 4a-4d |
| `skills/cl-implementer/references/start-mode.md` | Steps 1-7 with pre-checks, read specs, generate TASKS.md, parallelizable groups, user review, create progress file, populate Claude Code tasks. Test infrastructure, unit test, integration test, and contract test task generation from P2. | Steps 1-7 |
| `skills/cl-implementer/references/run-mode.md` | Steps 1-6 with reconciliation, spec hash check, queue processing (3a-3e including 3.5 dependency verification from P3), fix tasks, spec gap triage, tangent handling. Fix task types include `supply-chain` (P3). | Steps 1-6, Step 3.5 |
| `skills/cl-implementer/references/autopilot-mode.md` | Steps 1-4 with checkpoint decision, reconciliation, plan, autonomous loop (3a-3h). Step 3d-int for integration testing (P2). Full-suite gate (P2). Tier awareness at checkpoints (P0.5). | Steps 1-4, Step 3d-int |
| `skills/cl-implementer/references/verify-mode.md` | Six Verification Dimensions: (1) Per-Task Acceptance Criteria, (2) Per-Spec Contract Compliance, (3) Cross-Spec Integration, (4) Spec-to-Doc Alignment, (5) Test Coverage Against Test Spec (P2), (6) Dependency Audit (P3). | Six Verification Dimensions, Output |
| `skills/cl-implementer/SKILL.md` | Modes: spec, spec-review, start, run, autopilot, verify, status, sync. Guidelines include testing-spec-driven (P2), waterfall non-negotiable, decision flow, security specification (P3), dependency verification (P3). | Spec Mode, Start Mode, Run Mode, Autopilot Mode, Verify Mode, Guidelines |
| `skills/cl-reviewer/SKILL.md` | Nine modes: review, re-review, merge, verify, audit, correct, fix, sync, design-review. | Mode Detection, Audit Mode |
| `skills/cl-reviewer/references/audit-mode.md` | Eight-dimension analysis: cross-doc consistency, within-doc consistency, technical correctness, goal alignment, completeness, abstraction coherence, design completeness, staleness. | Step 2 (Eight-Dimension Analysis) |
| `docs/cl-implementer.md` | Public-facing docs describe all eight modes. Spec section mentions cross-cutting specs (P3). Verify lists six dimensions. | All mode sections |
| `docs/cl-researcher.md` | Public-facing docs describe bootstrap with three starting points. Discovery mentions goals, users, tech stack, constraints, security strategy, data sensitivity. | Bootstrap section |
| `docs/pipeline-concepts.md` | Configuration with full `.clarity-loop.json` schema. DECISIONS.md with 15 category tags. Directory structure shows SECURITY_SPEC.md. | Configuration, DECISIONS.md, Directory Structure |

### Proposed State

After this proposal is applied:

1. **Spec generation** produces three additional spec artifacts: `CONFIG_SPEC.md` (environment variables, secrets, feature flags, deployment targets), `INTEGRATION_SPECS/` (per-service integration contracts for third-party services), and cross-cutting backend policies and data modeling sections within existing specs. All generated via a new reference file (`references/operational-specs.md`) loaded from cross-cutting-specs.md.

2. **Bootstrap** captures operational, quality, and governance decisions through a new reference file (`references/operational-bootstrap.md`) pointed to from bootstrap-guide.md — deployment targets, observability strategy, data lifecycle, code organization preferences, performance targets.

3. **Start mode** generates operational infrastructure tasks: config setup, observability setup, migration setup, scaffolding (directory structure) — as early tasks with no dependencies.

4. **Run mode** gains L1 assumption tracking after each task — scanning IMPLEMENTATION_PROGRESS.md for pattern accumulation and periodic promotion to DECISIONS.md.

5. **Verify mode** gains a seventh dimension: **Operational and Governance Checks** — covering config completeness, observability coverage, L1 assumption scan, performance budget verification, code organization consistency, data model consistency, and architecture alignment.

6. **Autopilot** gains lightweight operational checkpoints: migration verification after schema tasks, performance measurement (when tools available).

7. **Audit mode** (cl-reviewer) gains L1 trend analysis and structural drift detection sub-dimensions within existing dimensions.

8. **Sync mode** (cl-reviewer) gains DECISIONS.md reconciliation — verifying active decisions are still reflected in code.

## Change Manifest

> This is the contract between the proposal and the skill files. Each row specifies exactly
> what changes where.

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|---|---|---|---|---|
| 1 | Add pointer to new operational-specs.md reference from cross-cutting specs | `skills/cl-implementer/references/cross-cutting-specs.md` | After Step 4d (Shared Types) | Add | F23, F24, F25, F28, F29, F35, F36 |
| 2 | New reference file: operational spec generation (CONFIG_SPEC.md, migration notes, observability specs, integration contracts, backend policies, data modeling, dependency compatibility, code conventions, performance criteria) | `skills/cl-implementer/references/operational-specs.md` | New file | Add Doc | F23-F25, F28-F31, F35-F36 |
| 3 | Add pointer to new operational-bootstrap.md reference from bootstrap guide | `skills/cl-researcher/references/bootstrap-guide.md` | After "Dig deeper — security and data" in Step 2 Discovery Conversation | Add | F23, F24, F25, F26, F27, F30, F31, F36 |
| 4 | New reference file: operational bootstrap questions (deployment, observability, data lifecycle, code org, performance targets) | `skills/cl-researcher/references/operational-bootstrap.md` | New file | Add Doc | F23, F25, F26, F30, F31, F36 |
| 5 | Add operational infrastructure tasks to start mode task generation | `skills/cl-implementer/references/start-mode.md` | Step 3 (Generate Unified TASKS.md), after rule 11 (contract test tasks) | Add | F23, F25, F26, F30 |
| 6 | Add L1 assumption tracking to run mode post-task flow | `skills/cl-implementer/references/run-mode.md` | After Step 3e (Post-Task Regression Spot-Check) | Add | F32 |
| 7 | New reference file: governance checks for verify and audit modes (L1 scan, performance, code org, data model, architecture alignment, DECISIONS.md reconciliation) | `skills/cl-implementer/references/governance-checks.md` | New file | Add Doc | F28, F29, F30, F31, F32, F35, F36, F37 |
| 8 | Add Dimension 7 (Operational and Governance Checks) to verify mode, pointing to governance-checks.md | `skills/cl-implementer/references/verify-mode.md` | After Dimension 6 (Dependency Audit), update heading to "Seven Verification Dimensions" | Add | F23, F25, F29, F30, F31, F32, F35, F36, F37 |
| 9 | Add operational checkpoints to autopilot (migration verification, performance measurement) | `skills/cl-implementer/references/autopilot-mode.md` | After Step 3d-int (Integration Test Check) | Add | F24, F31 |
| 10 | Add L1 trend analysis and structural drift sub-dimensions to audit mode | `skills/cl-reviewer/references/audit-mode.md` | Dimension 4 (Goal Alignment & Drift), Dimension 5 (Completeness) | Modify | F32, F37 |
| 11 | Add DECISIONS.md reconciliation to sync mode | `skills/cl-reviewer/SKILL.md` | Sync Mode section | Modify | F37 |
| 12 | Update SKILL.md spec mode summary to mention operational specs | `skills/cl-implementer/SKILL.md` | Spec Mode section | Modify | F23, F24, F25, F28 |
| 13 | Update SKILL.md verify mode summary to mention seven dimensions | `skills/cl-implementer/SKILL.md` | Verify Mode section | Modify | F32, F37 |
| 14 | Update SKILL.md guidelines to add operational awareness guidelines | `skills/cl-implementer/SKILL.md` | Guidelines section | Add | F23, F32, F35 |
| 15 | Update public-facing cl-implementer docs | `docs/cl-implementer.md` | Spec, Start, Verify sections | Modify | F23-F25, F28-F32, F35-F37 |
| 16 | Update public-facing cl-researcher docs (bootstrap) | `docs/cl-researcher.md` | Bootstrap section | Modify | F23, F25, F30, F31, F36 |
| 17 | Update pipeline-concepts.md directory structure and config | `docs/pipeline-concepts.md` | Directory Structure, Configuration | Modify | F23, F28 |
| 18 | Add new DECISIONS.md category tags | `docs/pipeline-concepts.md` | DECISIONS.md section (Category Tags table) | Modify | F23, F25, F30, F31, F35, F36 |

**Scope boundary**: This proposal ONLY modifies the files listed above. It does NOT modify:
- `skills/cl-designer/` (no design-phase changes)
- `skills/cl-reviewer/references/review-mode.md` or `re-review-mode.md` (no review process changes)
- Any spec files directly (those are generated output)

## Where Each Gap Lands

### Cluster A — Operational Readiness

**Gap 19 (Environment & configuration — F23)**:
- **Bootstrap**: New `references/operational-bootstrap.md` asks about deployment targets, environment strategy, secrets management (Change 4)
- **Spec generation**: New Step 4e in `references/operational-specs.md` generates CONFIG_SPEC.md — env vars table (name, type, default, required, secret flag), deployment targets, feature flags, config validation strategy (Change 2)
- **Start mode**: Config infrastructure task as an early no-dependency task (Change 5)
- **Verify mode**: Config completeness sub-check in Dimension 7 (Change 8)
- **Public docs**: Updated (Changes 15-17)

**Gap 20 (Data migration — F24)**:
- **Bootstrap**: Operational bootstrap asks about data persistence strategy, migration tooling (Change 4)
- **Spec generation**: Migration notes section per data spec — ordering, rollback, seed data, zero-downtime considerations (Change 2)
- **Start mode**: Migration tasks — schema creation, seed data, rollback scripts (Change 5)
- **Autopilot**: Migration verification checkpoint after schema tasks (Change 9)

**Gap 21 (Observability — F25)**:
- **Bootstrap**: Operational bootstrap asks about monitoring strategy, logging level, metrics, tracing (Change 4)
- **Spec generation**: Observability section per service spec — what's logged at what level, health endpoints, metrics (Change 2)
- **Start mode**: Observability infrastructure task (Change 5)
- **Verify mode**: Observability coverage sub-check in Dimension 7 (Change 8)

**Gap 24 (Third-party integration contracts — F28)**:
- **Spec generation**: Per-service integration spec — endpoints used, auth, payload shapes, rate limits, error handling, sandbox/test mode (Change 2)
- **Start mode**: Integration setup tasks with mock/stub requirements (Change 5)
- **Run mode**: Integration test context loading — load relevant integration spec before implementing integration tasks (existing context loading mechanism in Step 3c)
- **Verify mode**: Integration contract sub-check in Dimension 7 (Change 8)

### Cluster B — Code Quality Conventions

**Gap 25 (Dependency compatibility — F29)**:
- **Spec generation**: Dependency compatibility check as a waterfall gate sub-check — do all versioned libraries represent a compatible combination? (Change 2)
- **Verify mode**: Compatibility sub-check in Dimension 7 (Change 8)

**Gap 26 (Code organization — F30)**:
- **Bootstrap**: Operational bootstrap asks about code organization preferences — feature-based vs layer-based, naming conventions, import patterns (Change 4)
- **Spec generation**: CODE_CONVENTIONS section in operational specs — file naming, directory structure, import patterns, component structure, test file location (Change 2)
- **Start mode**: Scaffolding task as Task 0 — create directory structure and pattern files before implementation (Change 5)
- **Verify mode**: Pattern consistency sub-check in Dimension 7 (Change 8)

**Gap 27 (Performance budgets — F31)**:
- **Bootstrap**: Operational bootstrap asks about performance targets — response time, bundle size, load time, concurrency (Change 4)
- **Spec generation**: Performance acceptance criteria per spec — quantitative targets extracted from bootstrap decisions (Change 2)
- **Autopilot**: Lightweight performance checks — response time measurement when tools available (Change 9)
- **Verify mode**: Performance budget sub-check in Dimension 7 (Change 8)

### Cluster C — Long-Term Governance

**Gap 28 (L1 assumption accumulation — F32)**:
- **Run mode**: After each task, scan IMPLEMENTATION_PROGRESS.md for L1 assumptions in the current area. When count exceeds threshold (5+ in one category), suggest batch promotion to DECISIONS.md (Change 6)
- **Verify mode**: L1 scan sub-check in Dimension 7 — group by category, flag systemic gaps, promote patterns (Change 8)
- **Audit mode** (cl-reviewer): L1 trend analysis as a sub-dimension of Goal Alignment & Drift (Change 10)

**Gap 29 (Cross-cutting backend policies — F35)**:
- **Spec generation**: Backend policies section in operational specs — idempotency, transaction boundaries, caching strategy, validation authority. These are specified once and inherited by every endpoint spec (Change 2)
- **Start mode**: Backend policy setup tasks — idempotency key infrastructure, cache setup, transaction patterns (Change 5)
- **Verify mode**: Policy adherence sub-check in Dimension 7 (Change 8)

**Gap 30 (Data modeling behavioral decisions — F36)**:
- **Bootstrap**: Operational bootstrap asks about data lifecycle — soft/hard delete, audit trail, data retention, expected data volume (Change 4)
- **Spec generation**: Data modeling section per entity spec — deletion strategy, cascade behavior, temporal requirements, volume projections, validation authority chain (Change 2)
- **Verify mode**: Data model consistency sub-check in Dimension 7 (Change 8)

**Gap 31 (Specification drift — F37)**:
- **Verify mode**: Architecture alignment sub-check in Dimension 7 — compare implemented code patterns against ARCHITECTURE.md (dependency direction, layer boundaries, communication patterns) (Change 8)
- **Audit mode** (cl-reviewer): Structural drift detection as a sub-dimension of Goal Alignment & Drift (Change 10)
- **Sync mode**: DECISIONS.md reconciliation — verify active decisions are reflected in code (Change 11)

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|---|---|---|
| P1 (Behavioral Specs) | `bootstrap-guide.md` Step 2 — P1 added behavioral probing questions | P4 adds a pointer line after P1's behavioral section and P3's security section, pointing to a new reference file. No inline content conflicts. |
| P2 (Testing Pipeline) | `verify-mode.md` — P2 added Dimension 5 (Test Coverage). `start-mode.md` — P2 added test task generation rules 8-11. `autopilot-mode.md` — P2 added Step 3d-int. `spec-mode.md` — P2 added Step 4b. | P4 adds Dimension 7 after P3's Dimension 6. P4's start mode rules follow P2's rule 11. P4's autopilot step follows P2's Step 3d-int. P4's spec step (4e) follows P2's Step 4b. No conflicts. |
| P3 (Security/Errors/API) | `cross-cutting-specs.md` — P3 created Steps 4a-4d. `run-mode.md` — P3 added Step 3.5 (dependency verification). `verify-mode.md` — P3 added Dimension 6 (Dependency Audit). `bootstrap-guide.md` — P3 added security probing. `spec-consistency-check.md` — P3 added Dimension 6 (API convention adherence). | P4 adds Step 4e after P3's Step 4d. P4 adds Dimension 7 after P3's Dimension 6. P4's bootstrap pointer goes after P3's security section. No conflicts. |

No conflicting in-flight proposals beyond the stated dependencies.

## Detailed Design

### Change 1: Cross-Cutting Specs Pointer to Operational Specs

**Target**: `skills/cl-implementer/references/cross-cutting-specs.md`
**Section**: After Step 4d (Identify Shared Types)
**Type**: Add
**Research**: F23, F24, F25, F28, F29, F35, F36
**Insertion point**: After the last line of the Step 4d section (after the Serialization Contracts table)

**Content**:

```markdown
### Step 4e: Generate Operational and Backend Policy Specs

If the system has deployment targets, external service integrations, data persistence, or
backend API endpoints, generate operational specifications. Read
`references/operational-specs.md` and follow its process. This generates:

- CONFIG_SPEC.md (environment variables, secrets, feature flags, deployment targets)
- Migration notes per data spec (ordering, rollback, seed data)
- Observability section per service spec (logging, metrics, health checks)
- Per-service integration specs (third-party endpoints, auth, payloads, rate limits)
- Backend policies section (idempotency, transactions, caching, validation authority)
- Data modeling section per entity spec (deletion, cascade, temporal, volume)
- Code conventions section (file naming, directory structure, import patterns)
- Performance acceptance criteria per spec
- Dependency compatibility notes
```

---

### Change 2: New Reference File — Operational Spec Generation

**Target**: `skills/cl-implementer/references/operational-specs.md`
**Type**: Add Doc
**Research**: F23-F25, F28-F31, F35-F36

**Content**:

```markdown
## Operational and Backend Policy Specifications

Reference for generating operational specification artifacts during spec mode (Step 4e).
Loaded on-demand from `cross-cutting-specs.md` when the system has deployment targets,
external integrations, data persistence, or backend endpoints.

### Config Spec (CONFIG_SPEC.md)

If the system has any environment-dependent behavior (different DB URLs, feature flags,
API keys), generate `{docsRoot}/specs/CONFIG_SPEC.md`:

#### Environment Variables

Table of every environment variable the system needs:

| Variable | Type | Default | Required | Secret | Used By | Description |
|----------|------|---------|----------|--------|---------|-------------|
| DATABASE_URL | string | — | Yes | Yes | Data layer | PostgreSQL connection string |
| NODE_ENV | string | development | No | No | All | Runtime environment |
| API_KEY_STRIPE | string | — | Yes (prod) | Yes | Payment service | Stripe API key |

Extracted from Architecture doc, DECISIONS.md (`deployment`, `config` categories), and
per-module specs. Missing values get `[DECISION NEEDED]` markers.

#### Deployment Targets

| Target | Config Differences | Feature Flags | Notes |
|--------|-------------------|---------------|-------|
| development | Local DB, debug logging, all features | All enabled | Hot reload |
| staging | Managed DB, info logging | All enabled | Mirrors prod |
| production | Managed DB, warn logging, CDN | Per-flag config | Rate limiting active |

#### Feature Flags

| Flag | Type | Default | Scope | Description |
|------|------|---------|-------|-------------|
| [flag name] | boolean | false | [who controls] | [what it toggles] |

#### Config Validation

Specify what happens at startup when configuration is invalid:
- Missing required variable: crash with clear error message listing missing vars
- Invalid format (e.g., non-URL in DATABASE_URL): crash with validation error
- Missing optional variable: use default, log warning
- Unknown variable: ignore (forward compatibility)

### Migration Strategy

For each data spec that defines a schema, add a migration notes section:

#### Per-Schema Migration Notes

| Concern | Specification |
|---------|--------------|
| **Migration tool** | [from DECISIONS.md or detected from project — Drizzle Kit, Prisma, Knex, etc.] |
| **Generation strategy** | [Auto-generated from schema diff or hand-written] |
| **Ordering dependencies** | [Which migrations must run before this one] |
| **Rollback strategy** | [Reversible? What's the rollback procedure?] |
| **Seed data** | [Required seed data: admin accounts, reference data, default settings] |
| **Development data** | [Sample data for development — realistic enough for edge cases] |
| **Zero-downtime notes** | [Can this migration run while old code serves? Additive-only?] |
| **Data transformation** | [Any column type changes, splits, or merges requiring data migration] |

### Observability

For each service/module spec, add an observability section:

#### Per-Module Observability

| Concern | Specification |
|---------|--------------|
| **Logging level** | [What's logged at debug/info/warn/error for this module] |
| **Structured fields** | [Required context fields per log entry — requestId, userId, etc.] |
| **Metrics** | [Key metrics this module should emit — latency, error rate, throughput] |
| **Health check** | [What this module contributes to health status] |
| **Tracing** | [Span name, attributes, parent span expectations] |

#### System-Level Observability

If the architecture doc or DECISIONS.md describes observability strategy:

| Concern | Specification |
|---------|--------------|
| **Logging framework** | [from DECISIONS.md `observability` category or default: structured JSON] |
| **Health endpoint** | `GET /health` returning `{status: "ok", checks: {...}}` |
| **Readiness vs liveness** | [Readiness: all dependencies connected. Liveness: process running] |
| **Metrics collection** | [from DECISIONS.md or default: application metrics via structured logs] |
| **Error tracking** | [Sentry, Bugsnag, or structured error logs — from DECISIONS.md] |

### Integration Contracts (Per External Service)

For each external service the system integrates with (Stripe, Twilio, Auth0, AWS S3,
etc.), generate a spec in `{docsRoot}/specs/integrations/`:

#### Integration Spec Structure

```
# [Service Name] Integration Spec

**Service**: [service name and version/API version]
**Purpose**: [what the integration does in this system]
**Auth**: [API key, OAuth, JWT — how the system authenticates]

## Endpoints Used

| Endpoint | Method | Purpose | Rate Limit |
|----------|--------|---------|------------|
| [endpoint] | [method] | [what our system uses it for] | [per-second/minute limit] |

## Payload Contracts

### [Endpoint/Webhook Name]

**Request**:
[JSON shape with types and required/optional markers]

**Response (success)**:
[JSON shape]

**Response (error)**:
[Error shape, error codes, retry-able vs fatal]

## Webhook Payloads (if applicable)

| Event | Payload Shape | Idempotency | Verification |
|-------|--------------|-------------|-------------|
| [event type] | [JSON shape] | [idempotency key field] | [signature verification method] |

## Test Mode / Sandbox

| Concern | Details |
|---------|---------|
| **Test API keys** | [how to obtain, naming convention] |
| **Test data** | [test card numbers, test phone numbers, etc.] |
| **Webhook simulation** | [how to trigger test webhooks] |
| **Sandbox limitations** | [what differs from production] |

## Error Handling

| Error Code | Meaning | Retry? | Our Response |
|-----------|---------|--------|-------------|
| [code] | [meaning] | [yes/no + strategy] | [what our system does] |
```

### Backend Policies (Cross-Cutting)

If the system has backend API endpoints, generate a backend policies section that all
endpoint specs inherit:

#### Idempotency

| Concern | Policy |
|---------|--------|
| **Which operations** | All POST/PUT that create or modify resources |
| **Key generation** | Client-generated UUID in `Idempotency-Key` header |
| **Key storage** | [Cache/DB with TTL — from DECISIONS.md or default: 24h] |
| **Duplicate handling** | Return cached response, don't re-execute |

#### Transaction Boundaries

| Concern | Policy |
|---------|--------|
| **Atomic operations** | [List operations that must be all-or-nothing] |
| **Partial failure** | [Rollback entire transaction, no partial state] |
| **Distributed transactions** | [Saga pattern, compensation, or avoid — from architecture] |

#### Caching Strategy

| Concern | Policy |
|---------|--------|
| **Cache layer** | [In-memory, Redis, CDN — from DECISIONS.md or architecture] |
| **Cache keys** | [Key naming convention] |
| **Invalidation** | [TTL-based, event-based, or manual — per resource type] |
| **Cache-aside pattern** | [Read: check cache → miss → DB → populate cache] |

#### Validation Authority

| Layer | Validates | Authoritative For |
|-------|-----------|------------------|
| Frontend | Format, required fields | UX feedback (fast, not trusted) |
| API | Format, type, business rules | Request rejection (trusted boundary) |
| Service | Business logic, cross-entity | Complex validation (authoritative) |
| Database | Constraints, uniqueness, FK | Data integrity (last resort) |

Error responses reference the error taxonomy (from P3's Step 4b).

### Data Modeling (Per Entity)

For each entity in the data spec, add a data modeling section:

| Concern | Specification |
|---------|--------------|
| **Deletion strategy** | [Soft delete (mark deleted_at) / Hard delete / Depends on context] |
| **Cascade behavior** | [ON DELETE CASCADE / SET NULL / RESTRICT — per FK relationship] |
| **Temporal requirements** | [created_at + updated_at / Full audit log / Event sourcing] |
| **Volume projection** | [Expected row count at 1yr, 3yr. Growth rate. Archival threshold] |
| **Indexes** | [Columns frequently queried — derived from API endpoint specs] |
| **Validation authority** | [Which layer is authoritative for this entity's validation] |

Extracted from DECISIONS.md (`data-modeling`, `data-lifecycle` categories) and
architecture doc. Unspecified concerns get `[DECISION NEEDED]` markers.

### Code Conventions

If no code convention decisions exist in DECISIONS.md, generate defaults from the
project's existing codebase (brownfield) or framework conventions (greenfield):

| Convention | Specification |
|-----------|--------------|
| **File naming** | [kebab-case / camelCase / PascalCase — detected or from DECISIONS.md] |
| **Directory structure** | [Feature-based / Layer-based / Hybrid — from DECISIONS.md] |
| **Import patterns** | [Barrel exports / Direct imports / Path aliases — from tsconfig or DECISIONS.md] |
| **Component structure** | [Co-located styles / Separate files — from existing patterns or DECISIONS.md] |
| **Test file location** | [Co-located / __tests__ directory — from TEST_SPEC.md or DECISIONS.md] |
| **Naming conventions** | [Service naming: getX/fetchX/listX — from existing patterns or DECISIONS.md] |

### Performance Criteria

For each spec, add performance acceptance criteria extracted from DECISIONS.md
(`performance` category):

| Target | Budget | Measurement |
|--------|--------|-------------|
| **API response time** | [200ms p95 — from DECISIONS.md or `[DECISION NEEDED]`] |
| **Page load (FCP)** | [1.5s on 4G — from DECISIONS.md or `[DECISION NEEDED]`] |
| **Bundle size** | [200KB gzipped — from DECISIONS.md or `[DECISION NEEDED]`] |
| **DB query time** | [50ms max, no N+1 — from DECISIONS.md or `[DECISION NEEDED]`] |

If no performance decisions exist, flag as advisory: "No performance budgets found in
DECISIONS.md. Consider recording targets during bootstrap or before implementation."

### Dependency Compatibility

During the waterfall gate check (Step 1 of spec-mode.md), add a compatibility sub-check:

1. Read all library context files from `{docsRoot}/context/.context-manifest.md`
2. For each pair of libraries in the project's stack, check for known incompatibilities:
   - Peer dependency conflicts (React version vs component library requirements)
   - CSS framework conflicts (Tailwind + component library styles)
   - Build tool compatibility (Vite vs Webpack-only libraries)
   - Runtime conflicts (documented in context files' gotchas sections)
3. If conflicts found, add to the gate check status table:
   `| Dependency compatibility | Warning | [library A] and [library B] may conflict: [reason] |`

This is advisory — the user can proceed with awareness.
```

---

### Change 3: Bootstrap Guide Pointer to Operational Bootstrap

**Target**: `skills/cl-researcher/references/bootstrap-guide.md`
**Section**: After "Dig deeper -- security and data" block (after line ~134)
**Type**: Add
**Research**: F23, F24, F25, F26, F27, F30, F31, F36
**Insertion point**: After the line "These questions inform the `security`, `auth`, and `authorization` category decisions" and before "Continue the conversation naturally."

**Content**:

```markdown
**Dig deeper — operational and quality (scale to project type):**

For projects that will be deployed (not just prototypes or scripts), read
`references/operational-bootstrap.md` for operational discovery questions covering
deployment targets, observability needs, data lifecycle decisions, code organization
preferences, and performance targets. These feed into DECISIONS.md with category tags
`deployment`, `observability`, `data-lifecycle`, `code-conventions`, `performance`,
and `data-modeling`. Skip for Prototype preset projects.
```

---

### Change 4: New Reference File — Operational Bootstrap Questions

**Target**: `skills/cl-researcher/references/operational-bootstrap.md`
**Type**: Add Doc
**Research**: F23, F25, F26, F30, F31, F36

**Content**:

```markdown
## Operational Bootstrap Questions

Additional discovery questions for projects that will be deployed to production. These
are probed after the core discovery (Step 2), behavioral (P1), testing (P2), and security
(P3) sections. Scale to project type — skip categories that don't apply.

### Deployment & Configuration (Category: `deployment`, `config`)

Ask about deployment targets and configuration strategy:

- "Where will this be deployed?" (Docker? Vercel? AWS? Bare metal?)
  → Record in DECISIONS.md with category `deployment`
- "Do you need different environments?" (dev/staging/prod? Feature branches?)
  → Record with category `config`
- "How should secrets be managed?" (Env vars? Vault? OS keychain?)
  → Record with category `config`, `security`
- "Any feature flags needed?" (Progressive rollout? A/B testing?)
  → Record with category `config`

If the profile system (Step 2b) already detected deployment infrastructure (Docker,
CI/CD), reference it: "I see you have Docker and GitHub Actions. Should I assume
Docker-based deployment to [platform]?"

### Observability (Category: `observability`)

Ask about monitoring and debugging strategy:

- "How will you monitor this in production?" (Structured logging? Metrics? Tracing?)
  → Record with category `observability`
- "What logging level for production?" (Warn only? Info? Debug for specific modules?)
  → Record with category `observability`
- "Do you need a health check endpoint?" (Almost always yes for services)
  → Record with category `observability`

**Sensible defaults** (if no strong opinions):
- Logging: Structured JSON, info level in production
- Health: `/health` endpoint for readiness/liveness
- Metrics: Application metrics via structured logs (upgrade path to Prometheus/OpenTelemetry)
- Tracing: Request correlation ID (upgrade path to distributed tracing)

### Data Lifecycle (Categories: `data-lifecycle`, `data-modeling`)

Ask about how data lives and dies:

- "When users delete data, should it be recoverable?" (Soft vs hard delete)
  → Record with category `data-lifecycle`
- "Do you need an audit trail?" (Who changed what, when)
  → Record with category `data-modeling`
- "How much data do you expect?" (Hundreds? Millions? Growth rate?)
  → Record with category `data-modeling`
- "Any data retention requirements?" (GDPR erasure? Archive after N years?)
  → Record with category `data-lifecycle`

**Sensible defaults**:
- Deletion: Soft delete for user-facing entities, hard delete for transient data
- Temporal: created_at + updated_at minimum, audit log for compliance-sensitive entities
- Cascade: RESTRICT by default (fail loud), CASCADE only for true ownership (user → user_settings)

### Code Organization (Category: `code-conventions`)

Ask about project structure preferences:

- "Do you prefer feature-based or layer-based directory structure?"
  → Record with category `code-conventions`
- "Any naming conventions?" (kebab-case files? PascalCase components?)
  → Record with category `code-conventions`

For brownfield projects, auto-detect takes precedence — existing patterns in the codebase
are the convention. Only ask about code organization for greenfield.

**Sensible defaults** (framework-conventional):
- Next.js: feature-based (app router), co-located components
- Express/Fastify: layer-based (routes/, services/, models/)
- Monorepo: feature-based packages

### Performance Targets (Category: `performance`)

Ask about quantitative expectations:

- "Any performance requirements?" (Response time targets? Load time? Concurrency?)
  → Record with category `performance`
- "Expected concurrent users?" (10? 1000? 100k?)
  → Record with category `performance`
- "Mobile users?" (Bundle size matters more for mobile)
  → Record with category `performance`

**Sensible defaults** (if no strong opinions):
- API response time: 200ms p95 (fast enough for interactive UIs)
- Page load (FCP): 1.5s on 4G
- Bundle size: 200KB gzipped for initial load
- DB queries: 50ms max, zero N+1 queries

Record defaults with source `[auto-default]` so they can be reviewed and overridden.

### What to Skip

- **Prototype/Experiment preset**: Skip all operational questions. Defaults are sufficient.
- **CLI/Desktop Tool**: Skip deployment (it's local), observability (basic logging), data
  lifecycle (usually file-based, simple).
- **Library/Package**: Skip deployment, observability, data lifecycle. Ask about code
  conventions (public API naming matters for libraries).
```

---

### Change 5: Start Mode Operational Infrastructure Tasks

**Target**: `skills/cl-implementer/references/start-mode.md`
**Section**: Step 3 (Generate Unified TASKS.md), after rule 11 (contract test tasks)
**Type**: Add
**Research**: F23, F25, F26, F30
**Insertion point**: After the contract test tasks rule (rule 11) and before Step 4 (Identify Parallelizable Groups)

**Content**:

```markdown
12. **Operational infrastructure tasks.** If operational specs exist (CONFIG_SPEC.md,
    observability sections, code conventions, migration notes), generate early
    infrastructure tasks in an "Infrastructure" area:

    ```markdown
    ## Area: Infrastructure

    ### T-00X: Project Scaffolding
    - **Spec reference**: CODE_CONVENTIONS section from operational specs
    - **Dependencies**: None
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Directory structure created per code conventions spec
      - [ ] Path aliases configured (if specified)
      - [ ] Barrel exports set up (if specified)
      - [ ] .env.example created with all CONFIG_SPEC.md variables
    - **Complexity**: Simple

    ### T-00X: Config & Environment Setup
    - **Spec reference**: CONFIG_SPEC.md
    - **Dependencies**: None
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Config validation runs at startup (crashes on missing required vars)
      - [ ] .env.example documents all variables with descriptions
      - [ ] Secrets are loaded from env vars (not hardcoded)
      - [ ] Feature flag system in place (if CONFIG_SPEC.md specifies flags)
    - **Complexity**: Simple

    ### T-00X: Observability Setup
    - **Spec reference**: Observability section from operational specs
    - **Dependencies**: None
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Structured logger configured (JSON format in production)
      - [ ] Request correlation ID middleware in place
      - [ ] GET /health endpoint returns status with dependency checks
      - [ ] Log levels configurable via environment
    - **Complexity**: Simple
    ```

    These tasks have NO dependencies (or only depend on scaffolding) and can run in
    parallel with the test infrastructure task and early implementation tasks. The
    scaffolding task should be first — it creates the directory structure other tasks
    build in.

    **Conditional generation**: Only generate tasks for specs that exist. If no
    CONFIG_SPEC.md, skip the config task. If no observability section, skip that task.
    If no code conventions section, skip scaffolding.

13. **Migration tasks.** If data specs include migration notes, generate migration tasks
    that depend on the database schema implementation task:

    ```markdown
    ### T-00X: Database Migration Setup
    - **Spec reference**: Migration notes from [data-spec.md]
    - **Dependencies**: T-[schema-task] (schema implementation)
    - **Status**: pending
    - **Source**: spec-derived
    - **Acceptance criteria**:
      - [ ] Migration tool configured per spec
      - [ ] Initial migration created and runs successfully
      - [ ] Rollback tested (migration can be reversed)
      - [ ] Seed data script creates required reference data
      - [ ] Development data script creates realistic sample data
    - **Complexity**: Medium
    ```
```

---

### Change 6: Run Mode L1 Assumption Tracking

**Target**: `skills/cl-implementer/references/run-mode.md`
**Section**: After Step 3e (Post-Task Regression Spot-Check)
**Type**: Add
**Research**: F32
**Insertion point**: After the paragraph "This is configurable. Users who prefer speed over safety can disable it. When disabled, regressions are only caught during `verify` mode." and before the "---" separator leading to Step 4.

**Content**:

```markdown
#### 3f: L1 Assumption Check (Periodic)

After completing every 5th task (configurable), scan IMPLEMENTATION_PROGRESS.md's Spec
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

5. **Log the check**: Record in IMPLEMENTATION_PROGRESS.md when the L1 scan ran, what
   was found, and what action was taken.

The scan frequency is configurable in `.clarity-loop.json` under
`implementer.l1ScanFrequency` (default: 5 tasks). Set to 0 to disable.
```

---

### Change 7: New Reference File — Governance Checks

**Target**: `skills/cl-implementer/references/governance-checks.md`
**Type**: Add Doc
**Research**: F28-F32, F35-F37

**Content**:

```markdown
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
```

---

### Change 8: Verify Mode Dimension 7

**Target**: `skills/cl-implementer/references/verify-mode.md`
**Section**: After Dimension 6 (Dependency Audit)
**Type**: Add
**Research**: F23, F25, F29-F32, F35-F37
**Insertion point**: After the line "If no package manager or no SECURITY_SPEC.md: skip this dimension with a note." and before the "---" separator leading to Output. Also update the heading from "Six Verification Dimensions" to "Seven Verification Dimensions".

**Content**:

First, update the heading:

Replace `### Six Verification Dimensions` with `### Seven Verification Dimensions`

Then add after Dimension 6:

```markdown
#### Dimension 7: Operational and Governance Checks

Read `references/governance-checks.md` for the full sub-check process. This dimension
groups infrastructure, quality, and governance verification into a single composite check
with ten sub-checks:

| Sub-Check | What It Verifies | Skip If |
|-----------|-----------------|---------|
| 7a: Config completeness | Env vars documented, no hardcoded secrets, startup validation | No CONFIG_SPEC.md |
| 7b: Observability coverage | Health endpoint, structured logging, correlation IDs | No observability spec |
| 7c: Dependency compatibility | Peer dep conflicts, version pin alignment | No context files |
| 7d: Code organization | Naming consistency, directory structure, import patterns | No code conventions spec |
| 7e: Performance budget | Bundle size, query patterns, response time | No performance criteria |
| 7f: L1 assumption scan | Assumption accumulation, systemic gap detection | No L1 assumptions logged |
| 7g: Backend policy adherence | Idempotency, transactions, validation authority | No backend policies spec |
| 7h: Data model consistency | Deletion strategy, cascade, temporal, indexes | No data modeling specs |
| 7i: Architecture alignment | Dependency direction, layer boundaries, communication patterns | No architecture doc |
| 7j: DECISIONS.md reconciliation | Active decisions reflected in code | No DECISIONS.md |

Not every sub-check applies to every project. Skip sub-checks whose prerequisite specs
don't exist, with a note in the output.

Report findings as a grouped summary (see governance-checks.md for format). Sub-checks
are advisory rather than blocking — Dimension 7 surfaces governance concerns but
doesn't fail the verification unless a sub-check reveals a critical issue (hardcoded
secrets, critical architectural drift).
```

Also update the Output section to include Dimension 7:

**Insertion point**: In the Output section's example markdown block, after the `### Dependency Audit` section and before the closing triple backticks.

```markdown
### Operational and Governance Checks
- Config: 12/12 vars documented, 0 hardcoded secrets ✓
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

---

### Change 9: Autopilot Operational Checkpoints

**Target**: `skills/cl-implementer/references/autopilot-mode.md`
**Section**: After Step 3d-int (Integration Test Check)
**Type**: Add
**Research**: F24, F31
**Insertion point**: After Step 3d-int's point 4 ("Do not block") and before Step 3e (UI Validation)

**Content**:

```markdown
#### 3d-ops: Operational Verification (After Infrastructure Tasks) — Tier 3

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

**Note**: Autopilot also inherits run mode's Step 3f (L1 assumption tracking) at the
same `l1ScanFrequency` interval. L1 scans run silently in autopilot (Tier 3 auto-proceed)
and surface in checkpoint summaries.
```

---

### Change 10: Audit Mode L1 Trend Analysis and Structural Drift

**Target**: `skills/cl-reviewer/references/audit-mode.md`
**Section**: Dimension 4 (Goal Alignment & Drift), Dimension 5 (Completeness)
**Type**: Modify
**Research**: F32, F37

**Insertion point for Dimension 4**: After the bullet "Principle violations: Do the goals state design principles that the current system docs no longer reflect?" and before "If previous audit reports exist, compare..."

**Content to add to Dimension 4**:

```markdown
- **L1 assumption trend**: If `{docsRoot}/specs/IMPLEMENTATION_PROGRESS.md` exists, read
  the Spec Gaps table. Count L1 assumptions by category. Compare against previous audits:
  - Are the same categories accumulating assumptions across audit periods?
  - Are L1 assumptions being promoted to DECISIONS.md, or are they piling up?
  - Categories with 10+ unresolved L1 assumptions indicate persistent spec gaps that
    the system docs should address through research cycles.
- **Structural drift**: Compare the architecture doc's module descriptions, communication
  patterns (sync vs async, direct vs event-driven), and layer boundaries against the
  actual codebase structure:
  - Do imports follow the specified dependency direction?
  - Are communication patterns as described? (e.g., architecture says event-driven but
    implementation uses direct calls)
  - Do module boundaries in code match the architecture's descriptions?
  - This catches the most insidious form of drift — where individual tasks are correct
    but collectively alter the architecture.
```

**Insertion point for Dimension 5**: After the bullet "Migration and upgrade paths — are they specified for breaking changes?" and before the Dimension 6 heading.

**Content to add to Dimension 5**:

```markdown
- Operational specifications — are deployment, configuration, observability, and
  migration concerns addressed? (CONFIG_SPEC.md, observability sections, migration notes)
- Backend policy specifications — are cross-cutting concerns like idempotency,
  transactions, and caching specified system-wide rather than per-endpoint?
- Data modeling behavioral decisions — are deletion strategy, cascade behavior, and
  temporal requirements specified per entity rather than left to implementer judgment?
```

---

### Change 11: Sync Mode DECISIONS.md Reconciliation

**Target**: `skills/cl-reviewer/SKILL.md`
**Section**: Sync Mode section
**Type**: Modify
**Research**: F37
**Insertion point**: After the full Sync Mode section (after the "Usage:" line at the end of the section) and before the "---" separator leading to Design Review Mode.

**Content to add**:

```markdown

**DECISIONS.md Reconciliation**: When running sync (either full or git-diff scoped),
include a DECISIONS.md reconciliation pass:

1. Read all active decisions from DECISIONS.md
2. For each decision with a verifiable implementation claim (technology choice, pattern,
   configuration value, convention):
   - Extract the claim
   - Check it against the codebase (same claim extraction mechanism as doc-code sync)
3. Report contradictions: "D-NNN says [X] but code does [Y]"
4. Distinguish:
   - **Intentional evolution**: The decision may need updating (code was changed deliberately)
   - **Accidental drift**: The code may need fixing (decision was forgotten during implementation)
5. Include reconciliation results in the sync report under a "Decision Reconciliation" section
```

---

### Change 12: SKILL.md Spec Mode Summary Update

**Target**: `skills/cl-implementer/SKILL.md`
**Section**: Spec Mode section
**Type**: Modify
**Research**: F23, F24, F25, F28
**Insertion point**: In the Spec Mode section, after the line listing cross-cutting specifications. The current section ends with accessibility requirements.

Replace the current Spec Mode section text:

```
In addition to implementation specs, generates cross-cutting specifications:
- **SECURITY_SPEC.md**: Per-endpoint auth, system security policy, secure UX, dependency governance
- **Error taxonomy**: Standard error format, code system, propagation chain, per-endpoint catalog
- **API conventions preamble**: Pagination, naming, filtering, sorting, envelope — inherited by all endpoint specs
- **Shared types**: Cross-boundary type inventory, serialization contracts, sharing strategy
- **Edge cases**: Standard edge case section per spec based on component types
- **Accessibility**: ARIA, keyboard, focus management requirements per UI spec
```

With:

```
In addition to implementation specs, generates cross-cutting specifications:
- **SECURITY_SPEC.md**: Per-endpoint auth, system security policy, secure UX, dependency governance
- **Error taxonomy**: Standard error format, code system, propagation chain, per-endpoint catalog
- **API conventions preamble**: Pagination, naming, filtering, sorting, envelope — inherited by all endpoint specs
- **Shared types**: Cross-boundary type inventory, serialization contracts, sharing strategy
- **Edge cases**: Standard edge case section per spec based on component types
- **Accessibility**: ARIA, keyboard, focus management requirements per UI spec
- **CONFIG_SPEC.md**: Environment variables, secrets, feature flags, deployment targets, config validation
- **Operational specs**: Migration notes, observability sections, integration contracts, backend policies, data modeling, code conventions, performance criteria
```

---

### Change 13: SKILL.md Verify Mode Summary Update

**Target**: `skills/cl-implementer/SKILL.md`
**Section**: Verify Mode section
**Type**: Modify
**Research**: F32, F37
**Insertion point**: Replace the current Verify Mode section text.

Replace:

```
Post-implementation holistic verification across six dimensions: per-task acceptance
criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment
(via cl-reviewer sync), test coverage against test spec (P2), and dependency audit
(vulnerability scan, license compliance, unused dependency detection).
```

With:

```
Post-implementation holistic verification across seven dimensions: per-task acceptance
criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment
(via cl-reviewer sync), test coverage against test spec, dependency audit (vulnerability
scan, license compliance, unused dependency detection), and operational/governance checks
(config completeness, observability, code organization, performance budgets, L1 assumption
scan, backend policy adherence, data model consistency, architecture alignment, DECISIONS.md
reconciliation).
```

---

### Change 14: SKILL.md Guidelines — Operational Awareness

**Target**: `skills/cl-implementer/SKILL.md`
**Section**: Guidelines section
**Type**: Add
**Research**: F23, F32, F35
**Insertion point**: After the last guideline ("Verify dependencies before trusting them." section) and before any closing content.

**Content**:

```markdown
- **Config is a specification concern.** If CONFIG_SPEC.md exists, reference it when
  setting up environment variables, secrets, and feature flags. If no config spec exists
  but the system has environment-dependent behavior, nudge the user: "No config spec
  found. Consider running `/cl-implementer spec` to generate one."

- **Review L1 assumptions periodically.** L1 assumptions are individually reasonable but
  collectively create invisible drift. After every 5 tasks (configurable via
  `implementer.l1ScanFrequency`), scan for accumulation patterns and suggest batch
  promotion to DECISIONS.md. Categories with 5+ assumptions indicate systemic spec gaps.

- **Backend policies are inherited, not per-endpoint.** If operational specs define
  idempotency, transaction boundaries, caching, or validation authority policies, every
  endpoint inherits them. Don't make per-endpoint decisions that contradict the system
  policy — flag them as L1 spec gaps instead.
```

---

### Change 15: Public-Facing cl-implementer.md Updates

**Target**: `docs/cl-implementer.md`
**Section**: Spec, Start, Verify sections
**Type**: Modify
**Research**: F23-F25, F28-F32, F35-F37

**In the Spec section**, after the Cross-Cutting Specifications table, add a row:

```markdown
| **CONFIG_SPEC.md** | Environment variables, secrets, feature flags, deployment targets, config validation | Architecture, DECISIONS.md |
| **Operational specs** | Migration notes, observability, integration contracts, backend policies (idempotency, transactions, caching, validation authority), data modeling (deletion, cascade, temporal, volume), code conventions, performance criteria | Architecture, DECISIONS.md, per-module specs |
```

**In the Start section**, after "Test Tasks" subsection, add:

```markdown
### Operational Tasks

If operational specs exist (CONFIG_SPEC.md, observability sections, code conventions),
start mode generates infrastructure tasks: project scaffolding (directory structure),
config and environment setup, observability setup, and migration setup. These are early
tasks with no dependencies — they can run in parallel with test infrastructure and
initial implementation.
```

**In the Modes table** (top of file), update the `verify` row:

Replace:
```
| `verify` | "verify implementation", "are we done" | Post-implementation holistic check across six dimensions |
```

With:
```
| `verify` | "verify implementation", "are we done" | Post-implementation holistic check across seven dimensions |
```

**In the Verify section**, update the heading text and dimensions table:

Replace:
```
Post-implementation holistic check. Six dimensions:
```

With:
```
Post-implementation holistic check. Seven dimensions:
```

Then add a row to the dimensions table:

```markdown
| **Operational/governance** | Config, observability, code org, performance, L1 assumptions, backend policies, data model, architecture alignment, DECISIONS.md reconciliation | Infrastructure gaps, invisible drift, policy violations |
```

---

### Change 16: Public-Facing cl-researcher.md Updates

**Target**: `docs/cl-researcher.md`
**Section**: Bootstrap section
**Type**: Modify
**Research**: F23, F25, F30, F31, F36

**In the Bootstrap > Greenfield section**, update the first step description:

Replace:

```
1. Discovery conversation about your project — goals, users, tech stack, constraints,
   security strategy, data sensitivity, compliance requirements
```

With:

```
1. Discovery conversation about your project — goals, users, tech stack, constraints,
   security strategy, data sensitivity, compliance requirements, deployment targets,
   observability needs, data lifecycle decisions, code organization, performance targets
```

---

### Change 17: Pipeline Concepts Directory Structure and Config

**Target**: `docs/pipeline-concepts.md`
**Section**: Directory Structure, Configuration
**Type**: Modify
**Research**: F23, F28

**In the Directory Structure**, after the `SECURITY_SPEC.md` line under `specs/`, add:

```markdown
    CONFIG_SPEC.md            Environment variables, secrets, deployment targets
    integrations/             Per-service integration specs
```

**In the Configuration JSON example**, add under the `implementer` key:

```json
    "l1ScanFrequency": 5
```

**In the Configuration table**, add after the `implementer.checkpoint` row (to keep implementer fields grouped):

```markdown
| `implementer.l1ScanFrequency` | `5` | How many tasks between L1 assumption accumulation scans. Set to 0 to disable. |
```

---

### Change 18: New DECISIONS.md Category Tags

**Target**: `docs/pipeline-concepts.md`
**Section**: DECISIONS.md section (Category Tags table)
**Type**: Modify
**Research**: F23, F25, F30, F31, F35, F36

**Insertion point**: After the last row in the Category Tags table (currently `checkpoint-level`).

**Content to add**:

```markdown
| `deployment` | Deployment targets, environment strategy | spec-gen (CONFIG_SPEC.md), implementer |
| `config` | Configuration approach, feature flags, secrets management | spec-gen (CONFIG_SPEC.md), implementer |
| `observability` | Logging, metrics, health checks, tracing | spec-gen, implementer |
| `data-lifecycle` | Deletion strategy, retention, archival | spec-gen (data modeling), implementer |
| `data-modeling` | Temporal requirements, cascade, volume projections | spec-gen (data modeling), implementer |
| `code-conventions` | File naming, directory structure, import patterns | spec-gen, implementer |
| `performance` | Response time, bundle size, query budgets | spec-gen, implementer, verify |
```

## Validation Checklist

1. `skills/cl-implementer/references/cross-cutting-specs.md` has Step 4e pointing to operational-specs.md
2. `skills/cl-implementer/references/operational-specs.md` exists with CONFIG_SPEC.md, migration, observability, integration contracts, backend policies, data modeling, code conventions, performance criteria, and dependency compatibility sections
3. `skills/cl-researcher/references/bootstrap-guide.md` has a pointer to operational-bootstrap.md after the security section
4. `skills/cl-researcher/references/operational-bootstrap.md` exists with deployment, observability, data lifecycle, code organization, and performance target questions
5. `skills/cl-implementer/references/start-mode.md` has rules 12-13 for operational infrastructure and migration tasks
6. `skills/cl-implementer/references/run-mode.md` has Step 3f for L1 assumption tracking
7. `skills/cl-implementer/references/governance-checks.md` exists with sub-checks 7a-7j
8. `skills/cl-implementer/references/verify-mode.md` heading says "Seven Verification Dimensions" and includes Dimension 7 pointing to governance-checks.md
9. `skills/cl-implementer/references/verify-mode.md` Output section includes Dimension 7 example output
10. `skills/cl-implementer/references/autopilot-mode.md` has Step 3d-ops for operational verification
11. `skills/cl-reviewer/references/audit-mode.md` Dimension 4 includes L1 trend analysis and structural drift
12. `skills/cl-reviewer/references/audit-mode.md` Dimension 5 includes operational/backend policy/data modeling completeness checks
13. `skills/cl-reviewer/SKILL.md` Sync Mode section includes DECISIONS.md reconciliation
14. `skills/cl-implementer/SKILL.md` Spec Mode section mentions CONFIG_SPEC.md and operational specs
15. `skills/cl-implementer/SKILL.md` Verify Mode section says "seven dimensions" and mentions operational/governance checks
16. `skills/cl-implementer/SKILL.md` Guidelines section includes config, L1, and backend policy guidelines
17. `docs/cl-implementer.md` Spec section mentions CONFIG_SPEC.md and operational specs
18. `docs/cl-implementer.md` Start section mentions operational tasks
19. `docs/cl-implementer.md` Verify section heading says "Seven dimensions", Modes table row says "seven dimensions", and dimensions table includes operational/governance row
20. `docs/cl-researcher.md` Bootstrap section mentions deployment, observability, data lifecycle, code org, performance
21. `docs/pipeline-concepts.md` Directory Structure includes CONFIG_SPEC.md and integrations/
22. `docs/pipeline-concepts.md` Configuration includes `implementer.l1ScanFrequency`
23. `docs/pipeline-concepts.md` DECISIONS.md category tags include deployment, config, observability, data-lifecycle, data-modeling, code-conventions, performance
24. No file in `skills/cl-designer/` was modified
25. No file in `skills/cl-reviewer/references/review-mode.md` or `re-review-mode.md` was modified
26. New reference files (operational-specs.md, operational-bootstrap.md, governance-checks.md) are each under ~200 lines
27. Existing files received only thin pointers and summary updates, not inline expansions
