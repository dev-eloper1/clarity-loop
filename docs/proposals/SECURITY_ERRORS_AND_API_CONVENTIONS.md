# Proposal: Security, Errors, and API Conventions

**Created**: 2026-02-11
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F21-F22, F26-F27, F34-F35; Changes 12-17)
**Author**: Bhushan + AI Researcher
**Depends On**: P0 (SKILL_RENAME_AND_FOLD.md) — completed; all skills now use `cl-*` namespace

## Summary

This proposal adds security specification, error taxonomy, supply chain security, API
convention enforcement, and type safety awareness to the Clarity Loop pipeline. Currently,
the pipeline has zero security awareness — no skill asks about authentication, no spec
includes authorization contracts, no checklist verifies secure patterns, and no validation
tests for security. Errors are handled ad-hoc per endpoint with no system-level format.
API conventions (pagination, naming, filtering) are decided independently per spec, causing
frontend integration headaches. Type safety across the stack boundary is unspecified.

These gaps are especially dangerous because AI-generated code is systematically weaker on
security than human-written code (2.74x more likely to introduce XSS, 1.91x more likely
for IDOR, 1.88x for improper password handling per OWASP 2025) and AI coding agents import
dependencies with known vulnerabilities 49% of the time while hallucinating non-existent
packages 34% of the time (Endor Labs 2025).

The changes span three pipeline stages: bootstrap (security/error/API probing questions),
spec generation (SECURITY_SPEC.md, error taxonomy, API conventions preamble, shared types
section, edge cases section, accessibility requirements), and implementation (dependency
supply chain verification in run mode and verify mode). All changes use the `cl-*` skill
namespace established by P0.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|---|---|---|
| docs/research/PIPELINE_GAP_ANALYSIS.md | F21 (Security Is Not Optional), F22 (Error Taxonomy), F26 (API Design Conventions), F27 (Type Safety Across Stack), F34 (Dependency Supply Chain Security), F35 (Cross-Cutting Backend Policies — rate limiting and input validation aspects only) | Changes 12-17 from the Tier 1c + Tier 2 recommendation |

## System Context

### Research Type: Evolutionary

All changes modify existing skill files to add security, error, and API convention
awareness to pipeline stages that already exist. No new skills or modes are created.

### Current State

| Skill File | Current State Summary | Sections Referenced |
|---|---|---|
| `skills/cl-implementer/SKILL.md` | Describes spec mode, run mode, verify mode, and guidelines. No mention of security specification, error taxonomy, dependency verification, API conventions, or shared types. Spec mode description says "Generates implementation-ready specs from verified system docs" with no security/error dimension. | Spec Mode (line 140-148), Run Mode (line 172-178), Verify Mode (line 196-203), Guidelines (line 243-291) |
| `skills/cl-implementer/references/spec-mode.md` | Six-step spec generation process. Step 4 (Generate Specs) requires source reference, concrete types, edge cases, dependencies, and implementability per spec. No security spec, error taxonomy, API conventions preamble, or shared types. | Step 4: Generate Specs (lines 81-91), Step 5: Generate Spec Manifest (lines 92-117) |
| `skills/cl-implementer/references/run-mode.md` | Core implementation loop with fix task classification, spec gap triage, and context loading. No dependency verification before or after `npm install`. Fix task types include `runtime-error`, `regression`, `integration-failure`, `context-gap`, `design-gap` — no `supply-chain` type. | Step 3c: Implement (lines 106-132), Step 4: Fix Tasks (lines 158-288) |
| `skills/cl-implementer/references/verify-mode.md` | Four verification dimensions: per-task acceptance criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment. No dependency audit dimension. No security verification. | Four Verification Dimensions (lines 15-83) |
| `skills/cl-implementer/references/spec-consistency-check.md` | Five consistency dimensions: type, naming, contract, completeness, traceability. No API convention consistency dimension. No security policy adherence check. | Five Consistency Dimensions (lines 12-68) |
| `skills/cl-researcher/SKILL.md` | Bootstrap mode section points to bootstrap-guide.md. No security, error, or API probing in the mode description. | Bootstrap Mode (lines 168-188) |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation asks about key components, tech stack, workflows, external integrations, architectural decisions, performance/security/compliance requirements. Security is a single bullet among many with no depth. No error handling philosophy question. No API convention question. No dependency governance question. No type sharing strategy question. | Step 2: Discovery Conversation (lines 48-69) |
| `docs/cl-implementer.md` | Public-facing doc mirrors skill file. Spec section mentions waterfall gate and format selection. Verify section lists four dimensions. No security, error, API convention, or dependency audit content. | Spec (lines 24-98), Verify (lines 269-282) |
| `docs/cl-researcher.md` | Public-facing doc for researcher. Bootstrap section describes three starting points with "Greenfield" discovery conversation. No depth on security/error/API probing. | Bootstrap (lines 22-60) |
| `docs/pipeline-concepts.md` | Configuration section lists `docsRoot` and `implementer.checkpoint`. No security-related config. Directory structure shows no SECURITY_SPEC.md or error taxonomy artifact. | Configuration (lines 192-224), Directory Structure (lines 227-252) |

### Proposed State

After this proposal is applied:

1. **Spec generation** produces `SECURITY_SPEC.md` alongside implementation specs — with
   per-endpoint auth requirements, input validation rules, system-level security policy
   (CORS, CSP, rate limiting, session management, secrets injection), secure UX patterns,
   and dependency governance policy.

2. **Spec generation** includes an **error taxonomy section** in API specs — a standard
   error response format, error code system with category prefixes, error propagation chain
   specification, and per-endpoint error catalog.

3. **Spec generation** produces an **API conventions preamble** that all endpoint specs
   inherit — pagination style, naming convention, error format, filtering syntax, rate
   limiting headers, response envelope.

4. **Spec generation** includes a **shared types section** — which types cross the
   frontend/backend boundary, serialization format, and type sharing strategy.

5. **Spec generation** includes standard **edge cases** and **accessibility requirements**
   sections per spec based on component types.

6. **Run mode** verifies dependencies before `npm install` (registry existence check for
   hallucinated packages) and after installation (vulnerability audit, license check).

7. **Verify mode** gains a fifth dimension: **dependency audit** — full `npm audit`,
   license compliance, hallucinated package detection.

8. **Bootstrap** probes for security strategy, error handling philosophy, API style
   preferences, type sharing strategy, dependency policy, accessibility level, content
   tone, and target devices.

9. **Spec consistency check** gains a sixth dimension: **API convention adherence** —
   verifying all endpoint specs follow the same pagination, naming, error format, and
   filtering conventions.

## Change Manifest

> This is the contract between the proposal and the plugin files. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|---|---|---|---|---|
| 1 | Add SECURITY_SPEC.md generation to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F21 |
| 2 | Add error taxonomy generation to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F22 |
| 3 | Add API conventions preamble to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F26 |
| 4 | Add shared types section to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F27 |
| 5 | Add edge cases and accessibility sections to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F21, F26 |
| 6 | Update spec manifest to include new spec artifacts | `skills/cl-implementer/references/spec-mode.md` | Step 5: Generate Spec Manifest | Modify | F21, F22, F26 |
| 7 | Add dependency verification to run mode implementation step | `skills/cl-implementer/references/run-mode.md` | Step 3c: Implement | Add | F34 |
| 8 | Add `supply-chain` fix task type to run mode | `skills/cl-implementer/references/run-mode.md` | Step 4: Fix Tasks | Add | F34 |
| 9 | Add Dimension 5: Dependency Audit to verify mode | `skills/cl-implementer/references/verify-mode.md` | (new section after Dimension 4) | Add Section | F34 |
| 10 | Update verify mode output to include dependency audit | `skills/cl-implementer/references/verify-mode.md` | Output | Modify | F34 |
| 11 | Add Dimension 6: API Convention Adherence to spec consistency check | `skills/cl-implementer/references/spec-consistency-check.md` | (new section after dimension 5) | Add Section | F26 |
| 12 | Add security/error/API probing to bootstrap discovery | `skills/cl-researcher/references/bootstrap-guide.md` | Step 2: Discovery Conversation | Add | F21, F22, F26, F27, F34, F35 |
| 13 | Update SKILL.md spec mode description for new artifacts | `skills/cl-implementer/SKILL.md` | Spec Mode | Modify | F21, F22, F26, F27 |
| 14 | Update SKILL.md verify mode description for dependency audit | `skills/cl-implementer/SKILL.md` | Verify Mode | Modify | F34 |
| 15 | Add security guideline to SKILL.md guidelines | `skills/cl-implementer/SKILL.md` | Guidelines | Add | F21, F34 |
| 16 | Update public-facing cl-implementer.md spec section | `docs/cl-implementer.md` | Spec | Modify | F21, F22, F26, F27 |
| 17 | Update public-facing cl-implementer.md verify section | `docs/cl-implementer.md` | Verify | Modify | F34 |
| 18 | Update public-facing cl-researcher.md bootstrap section | `docs/cl-researcher.md` | Bootstrap | Modify | F21, F22, F26, F27, F34 |
| 19 | Update pipeline-concepts.md directory structure | `docs/pipeline-concepts.md` | Directory Structure | Modify | F21, F22 |

**Scope boundary**: This proposal ONLY modifies the files/sections listed above. Changes
to `cl-designer` skills, `autopilot-mode.md`, `start-mode.md`, `sync-mode.md`, and
`cl-reviewer` skills are out of scope. Security smoke tests in autopilot mode are deferred
to a future proposal.

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|---|---|---|
| SKILL_RENAME_AND_FOLD.md (P0) | All files — P0 renames skills to `cl-*` | P0 is already complete. This proposal uses the new `cl-*` names throughout. No conflict. |
| IMPLEMENTER_SKILL.md | `skills/cl-implementer/SKILL.md`, `docs/cl-implementer.md` | IMPLEMENTER_SKILL.md adds the cl-implementer skill as a new artifact. This proposal modifies sections within it. Apply IMPLEMENTER_SKILL.md first if not yet merged, then this proposal adds to the existing structure. |
| CONTEXT_SYSTEM.md | `skills/cl-researcher/SKILL.md`, `docs/cl-researcher.md`, `docs/pipeline-concepts.md` | CONTEXT_SYSTEM.md adds context mode to the researcher. This proposal modifies the bootstrap section only, which CONTEXT_SYSTEM.md doesn't touch. No conflict. |

## Detailed Design

### Change Area 1: Security Specification in Spec Generation (Changes 1, 5, 6)

**What**: Extend spec generation (spec-mode.md Step 4) to produce `SECURITY_SPEC.md` as a
parallel artifact alongside implementation specs. The security spec has four sections:
per-endpoint security, system-level security, secure UX patterns, and dependency governance.
Also add per-spec accessibility requirements sections.

**Why**: Research Finding F21 identified that the pipeline has ZERO security awareness.
AI-generated code is systematically weaker on security (2.74x more likely for XSS, 1.91x
for IDOR per OWASP 2025). Without security specification, each endpoint independently
decides its auth requirements, input validation, and error exposure — leading to
inconsistent protection across the application.

**System doc impact**: `skills/cl-implementer/references/spec-mode.md`, Step 4: Generate
Specs.

**Current** (from spec-mode.md Step 4):
> Every spec must include:
> - **Source reference**: Which system doc section(s) it derives from
> - **Concrete types**: No ambiguity — "UUID v4", not "a string"
> - **Edge cases**: Enumerated, not implied
> - **Dependencies**: Which other specs this one references
> - **Implementability**: Each spec should be implementable in isolation (bounded context)

**Proposed** (add after Step 4's spec file generation, before Step 5):

```markdown
### Step 4a: Generate Security Spec

If the system docs describe any authentication, authorization, user-facing features, or
API endpoints, generate `{docsRoot}/specs/SECURITY_SPEC.md`:

#### Per-Endpoint Security

For every API endpoint defined in the specs:

| Endpoint | Auth Required | Auth Method | Authorization | Input Validation | Rate Limit |
|----------|--------------|-------------|---------------|-----------------|------------|
| POST /auth/login | No | — | — | email: format + length; password: length 8-128 | 5/min per IP |
| GET /users/:id | Yes | JWT Bearer | Owner or Admin role | id: UUID v4 format | Default |
| PUT /users/:id | Yes | JWT Bearer | Owner only | id: UUID v4; body: schema validation | Default |

If the system docs don't specify auth for an endpoint, flag it: "No auth specified for
[endpoint]. Default: auth required. Override by explicitly marking as public in specs."

#### System-Level Security

Extract from Architecture doc and DECISIONS.md, or flag as unspecified:

| Concern | Specification | Source |
|---------|--------------|--------|
| **CORS policy** | Allowed origins, methods, headers, credentials | Architecture or DECISIONS.md |
| **CSP headers** | Script-src, style-src, img-src directives | Architecture or unspecified |
| **Rate limiting** | Default rate, per-endpoint overrides, response on limit (429 + Retry-After) | Architecture or DECISIONS.md |
| **Session management** | Session duration, refresh strategy, concurrent session policy | Architecture or DECISIONS.md |
| **Secrets injection** | Method: env vars / vault / OS keychain. Never hardcoded. | Architecture or DECISIONS.md |

For each unspecified concern, add a `[DECISION NEEDED]` marker — these become L1 spec
gaps during implementation.

#### Secure UX Patterns

If the system has user-facing auth flows:

| Pattern | Specification |
|---------|--------------|
| **Password requirements** | Show requirements inline before submission. Don't reveal which requirement failed after submission. |
| **Session timeout** | Warn user N minutes before timeout. Redirect to login on expiry. Preserve form state on re-auth. |
| **Error messages** | Never expose internal details (stack traces, DB errors, internal IDs) in user-facing errors. |
| **CSRF protection** | Method (tokens, SameSite cookies, or both). Which endpoints need protection. |

If the system has no auth flows, skip this section.

#### Dependency Governance

Extract from DECISIONS.md (if bootstrap captured dependency policy) or generate defaults:

| Policy | Specification |
|--------|--------------|
| **Approved packages** | Advisory list from system docs. New deps require justification note in commit. |
| **License allowlist** | MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC. Flag GPL, LGPL, AGPL for review. |
| **Version constraints** | Use exact versions in lockfile. Allow minor range in package.json. |
| **Vulnerability scanning** | `npm audit` required before implementation completion. Block on critical CVEs. |

#### Per-Spec Accessibility Requirements

For each implementation spec that involves UI components, add an accessibility section:

| Requirement | Specification |
|------------|--------------|
| **ARIA attributes** | Required aria-* attributes per component from design system |
| **Keyboard interaction** | Tab order, Enter/Space activation, Escape dismissal, arrow key navigation |
| **Focus management** | Focus target on route change, focus trap in modals, focus return on dismiss |
| **Screen reader** | Announce dynamic content changes, label interactive elements, describe state changes |

Scale to the accessibility level chosen at bootstrap (WCAG 2.1 AA, 2.2, or minimal).
If no level was chosen, default to WCAG 2.1 AA for commercial projects, minimal for
personal projects.

#### Standard Edge Cases Per Spec

For each implementation spec, add a standard edge cases section based on the component
types present in the spec:

| Component Type | Standard Edge Cases |
|---------------|-------------------|
| **Text input** | Empty string, max length, Unicode (emoji, RTL), SQL injection attempt, XSS attempt, whitespace-only |
| **Numeric input** | Zero, negative, decimal precision, MAX_SAFE_INTEGER, NaN, string input |
| **List/array** | Empty array, single item, max items, duplicate items, pagination boundary |
| **File upload** | Empty file, max size, wrong type, special characters in filename, concurrent uploads |
| **Date/time** | Timezone handling, DST transitions, date boundaries (month-end, year-end, leap year) |
| **API endpoint** | Missing required fields, extra unknown fields, malformed JSON, empty body, oversized payload |
| **Auth-protected resource** | No token, expired token, malformed token, insufficient permissions, concurrent session |
```

**Also update Step 5 (Generate Spec Manifest)** to include the new artifacts:

**Current** (from spec-mode.md Step 5, the Specs table):
> | Spec File | Source Doc(s) | Source Section(s) | Description |
> |-----------|--------------|-------------------|-------------|
> | [filename] | [doc name] | Section X, Y | [one-line description] |

**Proposed** (add to the manifest template after the existing Specs table):

```markdown
## Security & Cross-Cutting Specs

| Spec File | Scope | Source |
|-----------|-------|--------|
| SECURITY_SPEC.md | Per-endpoint auth, system security, secure UX, dependency governance | Architecture, DECISIONS.md, PRD |
| (error taxonomy) | Inline in API specs | Architecture, DECISIONS.md |
| (API conventions preamble) | Inherited by all endpoint specs | Architecture, DECISIONS.md |
| (shared types) | Cross-boundary type definitions | Architecture, all endpoint specs |
```

**Dependencies**: None — this is a parallel output from the same system doc read.

---

### Change Area 2: Error Taxonomy in Spec Generation (Changes 2, 6)

**What**: Extend spec generation to include a system-level error specification section in
API specs. This defines the standard error response format, error code system, error
propagation chain, and per-endpoint error catalog.

**Why**: Research Finding F22 identified that without an error taxonomy, the implementer
makes per-endpoint error format decisions. Some endpoints return `{error: "message"}`,
others return `{code: "...", message: "...", details: [...]}`, others return just HTTP
status codes. The frontend must handle multiple inconsistent patterns. Error handling is
the most common source of frontend-backend integration failures.

**System doc impact**: `skills/cl-implementer/references/spec-mode.md`, Step 4: Generate
Specs.

**Current**: Step 4 lists five requirements per spec (source reference, concrete types,
edge cases, dependencies, implementability). No error format requirement.

**Proposed** (add as Step 4b, after the security spec generation):

```markdown
### Step 4b: Generate Error Taxonomy

If the system has API endpoints, generate an error taxonomy section. This can be:
- A standalone section in a system-level API spec, OR
- A preamble section that all endpoint specs reference

The error taxonomy has four parts:

#### Error Response Format

Define the standard JSON shape for ALL error responses:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable description",
  "details": [],
  "requestId": "uuid"
}
```

- `code`: Machine-readable, SCREAMING_SNAKE_CASE. Always present.
- `message`: Human-readable, suitable for display. Always present.
- `details`: Array of field-level errors for validation failures. Optional.
- `requestId`: UUID for support correlation. Always present in production.

#### Error Code System

Define category prefixes with their HTTP status mappings:

| Category | Code Prefix | HTTP Status | Example Codes |
|----------|------------|-------------|--------------|
| Validation | VALIDATION_* | 400 | VALIDATION_REQUIRED_FIELD, VALIDATION_INVALID_FORMAT, VALIDATION_TOO_LONG |
| Authentication | AUTH_* | 401 | AUTH_TOKEN_EXPIRED, AUTH_TOKEN_INVALID, AUTH_CREDENTIALS_INVALID |
| Authorization | AUTHZ_* | 403 | AUTHZ_INSUFFICIENT_PERMISSIONS, AUTHZ_RESOURCE_FORBIDDEN |
| Not Found | NOT_FOUND_* | 404 | NOT_FOUND_USER, NOT_FOUND_RESOURCE |
| Conflict | CONFLICT_* | 409 | CONFLICT_DUPLICATE_EMAIL, CONFLICT_VERSION_MISMATCH |
| Rate Limit | RATE_LIMIT_* | 429 | RATE_LIMIT_EXCEEDED (with Retry-After header) |
| Server Error | INTERNAL_* | 500 | INTERNAL_DATABASE_ERROR, INTERNAL_SERVICE_UNAVAILABLE |

Start with a minimal taxonomy (~15-20 codes) and extend during implementation. The
taxonomy should scale to project complexity — simple CRUD apps get the base set, complex
apps extend per domain.

#### Error Propagation Chain

Specify how errors transform as they cross layer boundaries:

```
DB constraint violation (e.g., unique constraint on email)
  → Service layer: catches ConstraintError, maps to domain error
    → throw new ConflictError('CONFLICT_DUPLICATE_EMAIL', 'An account with this email already exists')
  → API layer: catches domain error, maps to HTTP response
    → { status: 409, body: { code: 'CONFLICT_DUPLICATE_EMAIL', message: '...', requestId: '...' } }
  → Frontend: catches HTTP error, maps to user-facing message
    → Display: "An account with this email already exists. Try logging in instead."
```

Key rules:
- Internal details (SQL errors, stack traces, internal IDs) are NEVER exposed in API
  responses
- Each layer transforms errors into its own vocabulary
- The API layer is the security boundary — it sanitizes all errors before they cross to
  the frontend

#### Per-Endpoint Error Catalog

For each API endpoint in the specs, enumerate which error codes it can return and under
what conditions:

| Endpoint | Error Code | Condition | Response |
|----------|-----------|-----------|----------|
| POST /auth/login | AUTH_CREDENTIALS_INVALID | Wrong email or password | 401 |
| POST /auth/login | RATE_LIMIT_EXCEEDED | >5 attempts per minute | 429 + Retry-After |
| POST /auth/login | VALIDATION_REQUIRED_FIELD | Missing email or password | 400 + details |
| GET /users/:id | NOT_FOUND_USER | ID doesn't match any user | 404 |
| GET /users/:id | AUTHZ_INSUFFICIENT_PERMISSIONS | Requesting user != target and not admin | 403 |

This catalog is the contract between backend and frontend. The frontend can rely on these
codes for programmatic error handling.
```

**Dependencies**: Should be generated alongside or immediately after security spec (Step 4a).

---

### Change Area 3: API Conventions Preamble in Spec Generation (Change 3)

**What**: Add an API conventions preamble to spec generation that all endpoint specs
inherit. Covers pagination, naming, filtering, sorting, versioning, rate limiting headers,
and response envelope.

**Why**: Research Finding F26 identified that without system-level API conventions, each
spec independently decides its pagination style, naming convention, filtering syntax, etc.
The frontend must handle multiple inconsistent patterns. The spec consistency check checks
type and naming consistency but not API convention consistency.

**System doc impact**: `skills/cl-implementer/references/spec-mode.md`, Step 4: Generate
Specs.

**Proposed** (add as Step 4c, after error taxonomy):

```markdown
### Step 4c: Generate API Conventions Preamble

If the system has API endpoints, generate an API conventions preamble that all endpoint
specs reference. Extract from Architecture doc and DECISIONS.md, or propose defaults based
on common REST conventions:

#### Conventions Preamble Template

| Convention | Specification | Source |
|-----------|--------------|--------|
| **Naming** | Plural nouns for collections (`/users`, not `/user`). camelCase for JSON fields. kebab-case for URL paths with multi-word segments. | DECISIONS.md or default |
| **Pagination** | [Cursor-based / Offset-based]. Params: `cursor` + `limit` (or `page` + `limit`). Response: `{ data: [...], pagination: { nextCursor, hasMore } }` (or `{ data: [...], pagination: { page, limit, total } }`). | DECISIONS.md or default (cursor) |
| **Filtering** | Query params with explicit operators: `?status=active&created_after=2024-01-01`. Complex filters: `?filter[status]=active`. | DECISIONS.md or default |
| **Sorting** | `?sort=field` (ascending), `?sort=-field` (descending). Multiple: `?sort=-created_at,name`. | Default |
| **Versioning** | [URL path `/v1/` / Header / None for v1]. | DECISIONS.md or default (none until v2) |
| **Rate limiting headers** | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` (Unix timestamp). `429` response with `Retry-After` header. | Default |
| **Response envelope** | Collections: `{ data: [...], pagination: {...} }`. Singles: `{ data: {...} }`. Errors: error taxonomy format. | Default |
| **Content type** | `application/json` for all request/response bodies. `multipart/form-data` for file uploads. | Default |

If the Architecture doc or DECISIONS.md specifies these conventions, extract them. If not,
propose sensible defaults and flag each as `[DEFAULT — confirm or override]`. Unresolved
defaults become L1 spec gaps during implementation.

Every generated endpoint spec MUST reference the conventions preamble:

```markdown
## API Conventions
Inherits from: API_CONVENTIONS (see preamble)
Overrides: [none, or list specific overrides with rationale]
```

**Scale to project**: A simple CRUD API gets the base conventions. A complex API with
multiple consumers may need versioning, HATEOAS links, or custom envelopes — extend the
preamble accordingly.
```

**Dependencies**: Should be generated before endpoint specs so they can reference it.

---

### Change Area 4: Shared Types Section in Spec Generation (Change 4)

**What**: Add a shared types section to spec generation that identifies which types cross
the frontend/backend boundary, their serialization format, and the type sharing strategy.

**Why**: Research Finding F27 identified that frontend and backend specs both define
TypeScript types, but nothing ensures they stay synchronized. The spec consistency check
catches spec-level mismatches, but at implementation time, types duplicate and drift.
Serialization gaps (Backend `Date` to JSON `string` to Frontend `Date`) are a common
source of integration bugs.

**System doc impact**: `skills/cl-implementer/references/spec-mode.md`, Step 4: Generate
Specs.

**Proposed** (add as Step 4d, after API conventions preamble):

```markdown
### Step 4d: Identify Shared Types

If the system has both frontend and backend specs, generate a shared types section. This
can be a standalone spec file (`SHARED_TYPES.md`) or a section in a system-level spec.

#### Shared Types Inventory

For each type that crosses the frontend/backend boundary:

| Type Name | Defined In | Consumed By | Serialization Notes |
|-----------|-----------|-------------|-------------------|
| User | API spec (response shape) | Frontend (display, forms) | `createdAt`: ISO 8601 string → Date parse on frontend |
| LoginResponse | Auth spec | Frontend auth module | `token`: opaque string, `expiresIn`: seconds (number) |
| PaginatedResponse<T> | API conventions | All list views | Generic envelope — frontend wraps/unwraps |
| ErrorResponse | Error taxonomy | Frontend error handler | Always present on non-2xx responses |

#### Type Sharing Strategy

Record the strategy from DECISIONS.md (if bootstrap captured it) or flag as a decision
needed:

| Strategy | When to Use | Tradeoffs |
|----------|-------------|----------|
| **Shared types package** | Monorepo with shared `/packages/types` | Single source of truth. Build complexity. |
| **Generated from API spec** | OpenAPI spec exists | Auto-generated. Requires generation step. |
| **Manual sync** | Simple projects, few shared types | Simple. Drift is inevitable. |
| **Runtime validation** | Zod/Yup on both ends | Runtime safety. Schema duplication. |

Flag the chosen strategy. If none was chosen at bootstrap, flag as `[DECISION NEEDED]` —
this becomes an L1 spec gap during implementation.

#### Serialization Contracts

For types with non-trivial serialization:

| Field | Backend Type | Wire Format | Frontend Type | Parsing |
|-------|-------------|-------------|---------------|---------|
| `createdAt` | Date | ISO 8601 string | Date | `new Date(value)` |
| `amount` | Decimal | string (to avoid float precision) | number or Decimal | `parseFloat(value)` or Decimal lib |
| `id` | UUID | string | string | No parsing needed |
| `status` | Enum | string | Union type | Type guard or validation |
```

**Dependencies**: Requires endpoint specs to exist for cross-referencing.

---

### Change Area 5: Dependency Supply Chain Security in Run Mode (Changes 7, 8)

**What**: Add dependency verification steps to run mode's implementation step (Step 3c)
and a new `supply-chain` fix task type to Step 4.

**Why**: Research Finding F34 identified that AI coding agents import dependencies with
known vulnerabilities 49% of the time, hallucinate non-existent packages 34% of the time,
and recommend safe dependencies only 20% of the time (Endor Labs 2025). The pipeline
currently lets the implementer `npm install` any package without verification.

**System doc impact**: `skills/cl-implementer/references/run-mode.md`, Step 3c and Step 4.

**Current** (from run-mode.md Step 3c):
> 1. Read the task's spec reference in full
> 2. Read any dependency tasks' files (for context on what already exists)
> 3. **Load relevant context** — if `{docsRoot}/context/.context-manifest.md` exists: [...]
> 4. Implement the code to meet the acceptance criteria
> 5. Test/verify the implementation against each criterion
> 6. Record files modified [...]

**Proposed** (add step 3c.3.5, between context loading and implementation):

```markdown
3.5. **Dependency verification** — When the implementation requires adding a new dependency
     (detected by `npm install`, `yarn add`, or similar in the implementation code):

     a) **Pre-install: Registry existence check** — Before installing, verify the package
        exists in the npm registry (or relevant package manager registry). This catches
        hallucinated packages — AI-generated code frequently imports packages that don't
        exist, creating typosquatting risk. Check: `npm view <package-name> version`.
        If the package doesn't exist: "Package `<name>` not found in npm registry. This
        may be a hallucinated dependency. Searching for alternatives..." — then search for
        the intended functionality and suggest a real package.

     b) **Post-install: Vulnerability audit** — After installation, run `npm audit --json`
        (or equivalent). Parse results:
        - **Critical/High CVEs**: Block. "Dependency `<name>` has critical vulnerability
          [CVE-ID]: [description]. Options: a) Find an alternative package, b) Pin to a
          patched version if available, c) Accept risk (requires user approval)."
        - **Medium/Low**: Warn. "Note: `<name>` has [N] medium/low advisories. Logged for
          reference." Continue without blocking.

     c) **License check** — Verify the package's license against the approved list from
        SECURITY_SPEC.md (or defaults: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC).
        - **Flagged license** (GPL, LGPL, AGPL, unknown): Warn. "Package `<name>` uses
          [license]. This may have copyleft implications. Continue? [Y/flag for review]"
        - **Approved license**: Continue silently.

     Record all dependency additions in IMPLEMENTATION_PROGRESS.md with package name,
     version, license, and audit status.
```

**For Step 4 (Fix Tasks)**, add a new issue classification:

**Current** (from run-mode.md Step 4, classification list):
> - `runtime-error`: Code throws an error during execution
> - `regression`: Previously-passing acceptance criteria now fail
> - `integration-failure`: Two modules don't work together as specs described
> - `context-gap`: Error traced to stale or missing library knowledge
> - `design-gap`: A visual/UI design element is missing or inadequate

**Proposed** (add after `design-gap`):

```markdown
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
```

**Dependencies**: None — this is a runtime check during implementation.

---

### Change Area 6: Dependency Audit in Verify Mode (Changes 9, 10)

**What**: Add a fifth verification dimension to verify-mode.md: Dependency Audit. This
runs a comprehensive dependency health check as part of post-implementation verification.

**Why**: Research Finding F34 recommends `npm audit` as part of verification. Per-task
dependency checks (Change Area 5) catch issues at install time, but a full audit at verify
time catches accumulated drift — new CVEs published since installation, transitive
dependency vulnerabilities, and packages added outside the implementer's tracking.

**System doc impact**: `skills/cl-implementer/references/verify-mode.md`, new section after
Dimension 4, and Output section update.

**Current** (verify-mode.md has four dimensions, then Output):
> #### Dimension 4: Spec-to-Doc Alignment
> [...]
>
> ---
>
> ### Output

**Proposed** (add between Dimension 4 and Output):

```markdown
#### Dimension 5: Dependency Audit

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

Report:
- Critical/High: must fix before implementation is considered complete
- Medium: should fix, log for tracking
- Low: informational only
- License violations: flag for user decision
- Unused dependencies: suggest removal

If no package manager or no SECURITY_SPEC.md: skip this dimension with a note.
```

**Update Output section** to include the new dimension:

**Current** (from verify-mode.md Output):
> ```markdown
> ### Spec-to-Doc Alignment
> - [cl-reviewer sync results or manual check findings]
> ```

**Proposed** (add after Spec-to-Doc Alignment in the output template):

```markdown
### Dependency Audit
- npm audit: 0 critical, 0 high, 2 medium (advisory only)
- Licenses: all MIT/Apache-2.0 — compliant
- Unused dependencies: `lodash` (installed but never imported) — suggest removal
- Lockfile: verified
```

**Dependencies**: SECURITY_SPEC.md should exist for license policy reference, but this
dimension degrades gracefully without it (uses default license list).

---

### Change Area 7: API Convention Adherence in Spec Consistency Check (Change 11)

**What**: Add a sixth consistency dimension to spec-consistency-check.md: API Convention
Adherence. This checks that all endpoint specs follow the same API conventions.

**Why**: Research Finding F26 identified that the spec consistency check checks type and
naming consistency but not API convention consistency — it doesn't know what pagination
style was chosen. Without this dimension, specs can individually be correct but
collectively inconsistent (endpoint A uses cursor pagination, endpoint B uses offset).

**System doc impact**: `skills/cl-implementer/references/spec-consistency-check.md`, new
section after dimension 5.

**Current** (spec-consistency-check.md ends after dimension 5 — Traceability):
> #### 5. Traceability
> [...]

**Proposed** (add after Traceability):

```markdown
#### 6. API Convention Adherence

All endpoint specs must follow the conventions defined in the API conventions preamble.

Check for:
- Pagination style inconsistencies (some specs use cursor, others use offset)
- Naming convention violations (some specs use camelCase, others snake_case in JSON)
- Error response format deviations (some specs define custom error shapes)
- Filtering syntax disagreements (some use query params, others use JSON body)
- Response envelope inconsistencies (some wrap in `{data: ...}`, others return raw)
- Rate limiting specification gaps (some endpoints specify limits, others don't)
- Missing API conventions reference (specs that don't declare "Inherits from: API_CONVENTIONS")

If no API conventions preamble exists: skip this dimension but note: "No API conventions
preamble found. Consider generating one to ensure consistency across endpoint specs."
```

**Update the Output Format** in spec-consistency-check.md to include the new dimension:

**Current** (output template ends with Traceability section):
> ## Traceability
>
> | Spec File | Source Doc | Status |
> |-----------|-----------|--------|
> | [spec file] | [doc name] Section X | Traced / Stale / Missing |

**Proposed** (add after Traceability):

```markdown
## API Convention Adherence

| Convention | Expected (from preamble) | Violations |
|-----------|------------------------|-----------|
| Pagination | Cursor-based | spec-users.md uses offset pagination |
| Naming | camelCase JSON | spec-reports.md uses snake_case |
| Error format | Standard taxonomy | spec-legacy.md uses custom {error: "..."} |

If no violations: "All endpoint specs follow the API conventions preamble."
If no preamble: "No API conventions preamble found. Dimension skipped."
```

**Dependencies**: API conventions preamble should exist for this check to be meaningful,
but the dimension degrades gracefully without it.

---

### Change Area 8: Bootstrap Security and API Probing (Change 12)

**What**: Expand the bootstrap discovery conversation to probe for security strategy, error
handling philosophy, API style preferences, type sharing strategy, dependency policy,
accessibility level, content tone, resilience strategy, and target devices.

**Why**: Research Findings F21, F22, F26, F27, F34, and F35 all identify that these
decisions need to be captured EARLY — at bootstrap time — so they flow through Architecture
and DECISIONS.md into spec generation. Currently, bootstrap asks "Are there performance,
security, or compliance requirements?" as a single catch-all question with no depth.

**System doc impact**: `skills/cl-researcher/references/bootstrap-guide.md`, Step 2:
Discovery Conversation.

**Current** (from bootstrap-guide.md Step 2, the "Then dig deeper" section):
> **Then dig deeper:**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - Are there performance, security, or compliance requirements?
> - What's the scope? What's explicitly out of scope?

**Proposed** (replace the "Then dig deeper" section):

```markdown
**Then dig deeper — functional:**
- What are the main workflows or user journeys?
- Are there external integrations or dependencies?
- What are the key architectural decisions already made?
- What's the scope? What's explicitly out of scope?

**Dig deeper — security and compliance:**
- Authentication strategy? (JWT, sessions, OAuth, API keys, none for internal tools?)
- Authorization model? (Role-based, resource-based, attribute-based, none?)
- Compliance requirements? (WCAG, GDPR, HIPAA, SOC2, none?)
- Data sensitivity? (PII, financial data, health data, public only?)

**Dig deeper — error handling and resilience:**
- Error handling philosophy? (Consistent error codes? User-friendly messages? Error pages
  vs. inline vs. toast?)
- How should the app handle being offline? Network errors? (Retry? Queue? Degrade?)
- Should actions feel instant (optimistic updates) or show loading states?

**Dig deeper — API and type conventions:**
- API style preferences? (REST conventions, pagination style — cursor vs. offset,
  response envelopes?)
- Type sharing strategy? (Shared package, generated from API spec, manual sync?)

**Dig deeper — dependencies and quality:**
- Dependency policy? (Approved libraries? License restrictions? Vulnerability tolerance?)
- Testing philosophy? (Framework? Coverage expectations? Testing pyramid balance?)

**Dig deeper — accessibility and content:**
- What accessibility level? (WCAG 2.1 AA? 2.2? None specified? Keyboard-first?)
- What's the app's voice/tone? (Professional? Friendly? Minimal? Technical?)
- What happens when there's no data yet? (Empty states? Onboarding flow?)
- Target devices? (Desktop only? Mobile? Both? Tablet?)

**Throughout:**
- Summarize your understanding periodically
- Surface any contradictions or gaps
- Don't rush — the quality of initial docs depends on getting the picture right
- **Triage by project type**: personal/hobby projects can skip security and accessibility
  depth. Commercial projects should not skip them. If the user defers, note the deferral
  in DECISIONS.md and flag it during spec generation.
```

**Dependencies**: None — bootstrap runs before all other pipeline stages.

---

### Change Area 9: SKILL.md Updates (Changes 13, 14, 15)

**What**: Update cl-implementer SKILL.md to reflect the new spec artifacts, verify mode
dimension, and security guidelines.

**Why**: SKILL.md is the entry point that the agent reads. It must accurately describe what
each mode produces and what guidelines govern implementation.

**System doc impact**: `skills/cl-implementer/SKILL.md`.

**Change 13 — Spec Mode description update**:

**Current** (from SKILL.md, Spec Mode section, lines 140-148):
> ## Spec Mode
>
> Read `references/spec-mode.md` and follow its process.
>
> Generates implementation-ready specs from verified system docs. Enforces the waterfall
> gate — specs are generated only after all system docs are complete and verified. The
> spec format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured
> markdown for general). Uses subagent dispatch to read all system docs in parallel without
> overloading the main context.

**Proposed**:

```markdown
## Spec Mode

Read `references/spec-mode.md` and follow its process.

Generates implementation-ready specs from verified system docs. Enforces the waterfall
gate — specs are generated only after all system docs are complete and verified. The
spec format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured
markdown for general). Uses subagent dispatch to read all system docs in parallel without
overloading the main context.

In addition to implementation specs, generates cross-cutting specifications:
- **SECURITY_SPEC.md**: Per-endpoint auth, system security policy, secure UX, dependency governance
- **Error taxonomy**: Standard error format, code system, propagation chain, per-endpoint catalog
- **API conventions preamble**: Pagination, naming, filtering, sorting, envelope — inherited by all endpoint specs
- **Shared types**: Cross-boundary type inventory, serialization contracts, sharing strategy
- **Edge cases**: Standard edge case section per spec based on component types
- **Accessibility**: ARIA, keyboard, focus management requirements per UI spec
```

**Change 14 — Verify Mode description update**:

**Current** (from SKILL.md, Verify Mode section, lines 196-203):
> ## Verify Mode
>
> Read `references/verify-mode.md` and follow its process.
>
> Post-implementation holistic verification across four dimensions: per-task acceptance
> criteria, per-spec contract compliance, cross-spec integration, and spec-to-doc alignment
> (via cl-reviewer sync).

**Proposed**:

```markdown
## Verify Mode

Read `references/verify-mode.md` and follow its process.

Post-implementation holistic verification across five dimensions: per-task acceptance
criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment
(via cl-reviewer sync), and dependency audit (vulnerability scan, license compliance,
unused dependency detection).
```

**Change 15 — New security guideline**:

**Current** (from SKILL.md Guidelines, ends with the waterfall guideline at line 291):
> - **Waterfall is non-negotiable for spec generation.** Don't generate specs from partial
>   docs. The user can override gate check warnings, but always warn them. Partial specs are
>   worse than no specs — they create false confidence.

**Proposed** (add after the waterfall guideline):

```markdown
- **Security is a specification concern, not an afterthought.** If SECURITY_SPEC.md exists,
  reference it during implementation — check per-endpoint auth requirements before writing
  route handlers, check input validation rules before accepting user input, check the error
  taxonomy before writing error responses. If no security spec exists but the system has
  user-facing features, nudge the user: "No security spec found. Consider running
  `/cl-implementer spec` to generate one."

- **Verify dependencies before trusting them.** When adding new packages, check the registry
  first (catch hallucinated packages), audit after install (catch vulnerabilities), and check
  the license (catch copyleft surprises). Block on critical CVEs. Warn on medium/low. Log
  all dependency additions.
```

**Dependencies**: None.

---

### Change Area 10: Public-Facing Documentation Updates (Changes 16, 17, 18, 19)

**What**: Update `docs/cl-implementer.md`, `docs/cl-researcher.md`, and
`docs/pipeline-concepts.md` to reflect the new capabilities.

**Why**: Public-facing docs must mirror the skill files for users who read the docs before
invoking skills.

**Change 16 — cl-implementer.md Spec section**:

**Current** (from cl-implementer.md, Spec section, ends with "Design Artifact Integration"):
> ### Design Artifact Integration
>
> If [DESIGN_SYSTEM.md](cl-designer.md) and [UI_SCREENS.md](cl-designer.md) exist, the spec
> generator references them. Tech specs can point to specific design components for
> implementation guidance.

**Proposed** (add after Design Artifact Integration, before the `---` divider):

```markdown
### Cross-Cutting Specifications

Alongside implementation specs, the spec generator produces:

| Artifact | Content | Source |
|----------|---------|--------|
| **SECURITY_SPEC.md** | Per-endpoint auth/authz, input validation, system security policy (CORS, CSP, rate limiting, session management, secrets), secure UX patterns, dependency governance | Architecture, DECISIONS.md, PRD |
| **Error taxonomy** | Standard error response format, error code system with category prefixes, error propagation chain, per-endpoint error catalog | Architecture, DECISIONS.md |
| **API conventions** | Pagination style, naming convention, error format, filtering syntax, rate limiting headers, response envelope — inherited by all endpoint specs | Architecture, DECISIONS.md |
| **Shared types** | Cross-boundary type inventory, serialization contracts, type sharing strategy | All endpoint specs, Architecture |
| **Edge cases** | Standard edge case section per spec based on component types (text input, numeric, list, file, date, API endpoint, auth) | Spec content analysis |
| **Accessibility** | ARIA attributes, keyboard interaction, focus management, screen reader requirements per UI spec | Design system, bootstrap accessibility level |

These are generated from the same system doc read as implementation specs — marginal additional cost.
```

**Change 17 — cl-implementer.md Verify section**:

**Current** (from cl-implementer.md, Verify section):
> ## Verify
>
> Post-implementation holistic check. Four dimensions:
>
> | Dimension | What It Checks | Catches |
> |-----------|---------------|---------|
> | **Per-task** | Re-check all acceptance criteria | Regressions, drift from criteria |
> | **Per-spec** | Full spec contract compliance | Type mismatches, missing constraints |
> | **Cross-spec** | Integration between modules | Shape mismatches, protocol disagreements |
> | **Spec-to-doc** | Code alignment with system docs (via cl-reviewer sync) | Architectural drift |

**Proposed**:

```markdown
## Verify

Post-implementation holistic check. Five dimensions:

| Dimension | What It Checks | Catches |
|-----------|---------------|---------|
| **Per-task** | Re-check all acceptance criteria | Regressions, drift from criteria |
| **Per-spec** | Full spec contract compliance | Type mismatches, missing constraints |
| **Cross-spec** | Integration between modules | Shape mismatches, protocol disagreements |
| **Spec-to-doc** | Code alignment with system docs (via cl-reviewer sync) | Architectural drift |
| **Dependency audit** | Vulnerability scan, license compliance, unused deps, lockfile integrity | CVEs, copyleft surprises, bloat |
```

**Change 18 — cl-researcher.md Bootstrap section**:

**Current** (from cl-researcher.md, Bootstrap section, under "Greenfield"):
> **Greenfield** (no code, no docs):
> 1. Discovery conversation about your project — goals, users, tech stack, constraints
> 2. Suggests initial doc set based on project type
> 3. Generates starting system docs with `[TBD]` markers for areas needing more detail

**Proposed**:

```markdown
**Greenfield** (no code, no docs):
1. Discovery conversation about your project — goals, users, tech stack, constraints,
   security strategy, error handling philosophy, API conventions, dependency policy
2. Suggests initial doc set based on project type
3. Generates starting system docs with `[TBD]` markers for areas needing more detail

The discovery conversation probes across functional, security, error handling, API
convention, dependency, accessibility, and content dimensions. Depth scales to project
type — commercial projects get thorough security and compliance probing; personal projects
can defer.
```

**Change 19 — pipeline-concepts.md Directory Structure**:

**Current** (from pipeline-concepts.md, Directory Structure):
> ```
> {docsRoot}/
>   system/                       Protected system docs (pipeline-managed only)
>     .manifest.md                Auto-generated index (gitignored)
>   research/                     Research docs (R-NNN-slug.md)
>   proposals/                    Proposals (P-NNN-slug.md)
>   reviews/
>     proposals/                  Proposal reviews + verify + corrections
>     audit/                      Audit reports + sync reports
>     design/                     Design review artifacts
>   specs/                        Generated specs + design specs
>   designs/                      Design files (.pen, DESIGN_PROGRESS.md)
>   context/                      Per-library knowledge files (progressive disclosure)
>     .context-manifest.md        Layer 1: library index
>     {library}/                  One folder per library
>       _meta.md                  Layer 2: overview + file inventory
>       {topic}.md                Layer 3: detail files
>   DECISIONS.md
>   RESEARCH_LEDGER.md
>   PROPOSAL_TRACKER.md
>   STATUS.md
> ```

**Proposed**:

```
{docsRoot}/
  system/                       Protected system docs (pipeline-managed only)
    .manifest.md                Auto-generated index (gitignored)
  research/                     Research docs (R-NNN-slug.md)
  proposals/                    Proposals (P-NNN-slug.md)
  reviews/
    proposals/                  Proposal reviews + verify + corrections
    audit/                      Audit reports + sync reports
    design/                     Design review artifacts
  specs/                        Generated specs + design specs
    SECURITY_SPEC.md            Per-endpoint auth, system security, dependency governance
  designs/                      Design files (.pen, DESIGN_PROGRESS.md)
  context/                      Per-library knowledge files (progressive disclosure)
    .context-manifest.md        Layer 1: library index
    {library}/                  One folder per library
      _meta.md                  Layer 2: overview + file inventory
      {topic}.md                Layer 3: detail files
  DECISIONS.md
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
  STATUS.md
```

**Dependencies**: None.

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| SECURITY_SPEC.md | A specification artifact listing per-endpoint security requirements, system-level security policy, secure UX patterns, and dependency governance. Generated alongside implementation specs during spec mode. | spec-mode.md, SKILL.md, cl-implementer.md, pipeline-concepts.md |
| Error taxonomy | A system-level specification of error response format, error code system with category prefixes, error propagation chain, and per-endpoint error catalog. Part of API specs, not a separate file. | spec-mode.md, SKILL.md, cl-implementer.md |
| API conventions preamble | A set of system-level API conventions (pagination, naming, filtering, sorting, versioning, envelope) that all endpoint specs inherit. | spec-mode.md, spec-consistency-check.md, cl-implementer.md |
| Shared types | Types that cross the frontend/backend boundary. Inventoried during spec generation with serialization contracts. | spec-mode.md, cl-implementer.md |
| Supply-chain (fix task type) | A new fix task classification for dependency issues: vulnerable packages, hallucinated imports, license violations. Distinguished from `context-gap` (how to USE a library) by asking whether the library is SAFE to use. | run-mode.md |
| Dependency audit (verify dimension) | The fifth verification dimension. Runs `npm audit`, checks licenses, detects unused deps, verifies lockfile integrity. | verify-mode.md, SKILL.md, cl-implementer.md |

### Migration

This proposal adds new capabilities without changing existing behavior:
- Existing spec generation still works identically — new artifacts are ADDITIONAL outputs
- Existing run mode still works — dependency verification is an ADDITIONAL step
- Existing verify mode still works — Dimension 5 is ADDITIONAL, doesn't change Dimensions 1-4
- Existing spec consistency check still works — Dimension 6 is ADDITIONAL
- Bootstrap questions are ADDITIONS to the existing question flow

No backward compatibility concerns. Projects that already have specs can regenerate to get
the new artifacts. Projects mid-implementation can add the dependency verification by
re-running with updated skills.

### Integration Points

| Changed Component | Integrates With | Interface Preserved |
|---|---|---|
| Spec mode (new artifacts) | Start mode (reads specs to generate tasks) | Yes — start mode reads `.spec-manifest.md` which will list new artifacts. Tasks generated from SECURITY_SPEC.md follow the same task format. |
| Spec mode (new artifacts) | Spec consistency check | Yes — new dimension 6 reads the same spec files. API conventions preamble is just another spec artifact. |
| Run mode (dependency verification) | Context loading protocol | Yes — dependency verification runs after context loading, before implementation. No change to context protocol. |
| Verify mode (Dimension 5) | Existing Dimensions 1-4 | Yes — Dimension 5 runs after Dimension 4. Same output format (pass/fail per finding). |
| Bootstrap probing | Architecture doc generation | Yes — new questions produce content for Architecture doc security/API/error sections. Same doc generation process. |

## Context Budget & Progressive Disclosure (Hard Requirement)

Every change in this proposal MUST respect the plugin's progressive disclosure model. Skills load reference files on-demand per mode — this is the primary mechanism for keeping context lean. Violating it bloats every invocation.

### Rules

1. **SKILL.md stays thin.** Mode detection + "Read `references/[mode].md`" pointers only. No inline process descriptions, no large tables, no protocol details. A SKILL.md should be under ~200 lines.

2. **Reference files are mode-scoped.** Content added to a reference file must be relevant to that mode's execution. Cross-cutting protocols (e.g., error taxonomy, security audit dimensions, API convention preamble) belong in a shared reference or in `pipeline-concepts.md` — NOT duplicated across multiple mode files.

3. **Large tables and catalogs go in separate files.** If a change adds a table with >10 rows (e.g., CVE severity matrix, error code catalog, API convention rules), it should be a separate reference file loaded only when needed — not inlined in the mode reference.

4. **Measure additions by token cost.** Each change should note its approximate token cost. A mode reference file should stay under ~3000 tokens. If a change pushes a file over budget, extract the addition into a sub-reference.

5. **Shared content uses references, not duplication.** If the same protocol or format is used by multiple modes or skills, define it once (in a shared reference or `pipeline-concepts.md`) and link to it. The decision flow protocol from P0.5 is the model: defined once, referenced everywhere.

6. **Exceptions.** Inlining is acceptable when the content is small (<20 lines), mode-specific, and would create unnecessary indirection if extracted. Use judgment — the goal is minimal context per invocation, not maximum file count.

### Merge Validation

During merge, the reviewer should verify:
- No SKILL.md file exceeds ~200 lines after changes
- No reference file exceeds ~3000 tokens after changes
- No content is duplicated across multiple files
- Cross-cutting additions use shared references

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| SECURITY_SPEC.md as a separate file (not sections in each spec) | Per-spec security sections only | Separate file enables holistic security audit. Per-endpoint rules still appear in the per-endpoint table within SECURITY_SPEC.md. The reviewer can check security coverage in one place. Research F21 recommends "a SECURITY_SPEC.md alongside implementation and test specs." |
| Error taxonomy inline in API specs (not a separate file) | Separate ERROR_TAXONOMY.md | Error taxonomy is consumed by every API spec and is relatively compact (~1 page). Inline avoids a file lookup during implementation. The format and code system are defined once and referenced by all endpoints. |
| API conventions as a preamble reference (not duplicated per spec) | Duplicate conventions in each spec | DRY principle. One preamble, many references. Specs declare "Inherits from: API_CONVENTIONS" and list only overrides. Reduces drift risk. |
| Block on critical CVEs, warn on medium/low | Block on all vulnerabilities; warn on all | Blocking on everything would halt implementation too frequently — medium/low advisories are often irrelevant to the project's attack surface. Critical/high represent real exploitable risks. This matches npm's own severity classification. |
| Registry existence check before install (not just audit after) | Audit only (catches most issues) | Hallucinated packages are a unique AI risk — 34% of AI-recommended packages don't exist. Installing a nonexistent package either fails (wasting time) or installs a typosquatting attack. Pre-install verification is cheap (one HTTP request) and eliminates the risk entirely. |
| Triage bootstrap depth by project type | Same depth for all projects | Personal/hobby projects don't need HIPAA compliance probing. Commercial projects need thorough security questioning. Forcing the same depth on all projects makes bootstrap tedious for simple cases. The user can always request more depth. |
| Shared types inventory (not shared types implementation) | Generate shared type package structure | Spec generation specifies WHAT types cross boundaries and HOW they serialize. It does NOT generate the shared type package — that's an implementation concern handled during task generation. The spec-level inventory enables the consistency check to verify types match. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Security spec adds burden for hobby projects | Medium | Medium | Triage by project type at bootstrap. Personal projects can skip SECURITY_SPEC.md. Commercial projects should not. |
| Error taxonomy feels over-engineered for simple APIs | Low | Low | Scale to project: simple apps get format + ~15 codes. Complex apps get full taxonomy. Minimal base is small. |
| Dependency verification slows down implementation | Low | Low | `npm audit` is fast (<2s). Registry lookup is a single HTTP request. Amortized cost minimal. |
| Supply chain security creates false positives | Medium | Medium | Only block on critical/high. Medium/low are advisory. User can accept risk for specific packages. |
| Too many bootstrap questions | Medium | Medium | Group by concern. Triage by project type. Skip security/compliance depth for personal projects. Frame as quick decisions, not interrogation. |
| API conventions preamble becomes outdated mid-implementation | Low | Medium | Spec sync mechanism already handles this — if conventions change, affected specs are flagged for regeneration. |
| Spec consistency check becomes slower with dimension 6 | Low | Low | API convention check is lightweight — pattern matching against the preamble. No deep analysis. |

## Open Items

1. **Should the error taxonomy codes be customizable per project, or is the standard set
   sufficient?** The proposed taxonomy uses generic categories (VALIDATION_*, AUTH_*, etc.).
   Domain-specific codes (PAYMENT_DECLINED, SUBSCRIPTION_EXPIRED) would be extensions.
   Recommendation: standard base + domain extensions added during implementation as L1 spec
   gap resolutions.

2. **Should the dependency governance policy in SECURITY_SPEC.md be enforceable or
   advisory?** Currently proposed as advisory by default, with strict mode configurable in
   `.clarity-loop.json` for security-conscious projects. The config key would be something
   like `security.dependencyGovernance: "advisory" | "strict"`.

3. **How should the pipeline handle projects with existing security infrastructure?** If
   the project already has CORS configuration, rate limiting middleware, or an error handling
   system, the security spec should acknowledge existing infrastructure and fill gaps rather
   than prescribe a full replacement. Detection at spec-gen time?

4. **Should the API conventions preamble support multiple API styles in one project?** Some
   projects have both REST and GraphQL, or REST and WebSocket. The preamble as proposed
   assumes a single REST convention set. Multi-style projects may need multiple preambles.

5. **Should SECURITY_SPEC.md include OWASP Top 10 mapping?** Mapping each security
   specification to the relevant OWASP category would add traceability to industry standards.
   Would increase spec size but improve audit capability.

## Appendix: Research Summary

The Pipeline Gap Analysis (docs/research/PIPELINE_GAP_ANALYSIS.md) identified 37 distinct
gap categories across the Clarity Loop pipeline. This proposal addresses six of them:

- **F21 (Security)**: The pipeline has zero security awareness. No skill asks about auth,
  no spec includes authorization contracts, no checklist verifies secure patterns. OWASP
  2025 data shows AI-generated code is 1.88-2.74x more likely to introduce security
  vulnerabilities compared to human code.

- **F22 (Error Taxonomy)**: Without a system-level error format, each endpoint independently
  decides its error shape. The frontend must handle multiple inconsistent patterns. Error
  handling is the most common source of frontend-backend integration failures.

- **F26 (API Conventions)**: Without system-level API conventions, each spec independently
  decides pagination style, naming, filtering, etc. The spec consistency check doesn't
  verify convention consistency.

- **F27 (Type Safety)**: Frontend and backend specs both define TypeScript types, but nothing
  ensures they stay synchronized at implementation time. Serialization gaps (Date to string
  to Date) are a common integration bug source.

- **F34 (Supply Chain Security)**: AI coding agents import vulnerable dependencies 49% of
  the time and hallucinate non-existent packages 34% of the time (Endor Labs 2025). The
  pipeline has no mechanism to verify dependencies.

- **F35 (Cross-Cutting Backend — partial)**: Rate limiting and input validation location
  aspects are addressed through the security spec and API conventions. Full cross-cutting
  backend policies (idempotency, transactions, caching) are deferred to P4.

The research recommends Option B (Top 10 + Full-Stack Testing) implemented across five
tiers. This proposal covers Tier 1c (security + errors) and the backend portions of Tier 2
(API conventions, type safety, edge cases, accessibility requirements).
