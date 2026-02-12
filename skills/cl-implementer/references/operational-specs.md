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
