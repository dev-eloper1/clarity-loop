## Cross-Cutting Specifications

Reference for generating cross-cutting specification artifacts during spec mode (Step 4+).
Loaded on-demand from `spec-mode.md` when generating specs that involve security, API
endpoints, error handling, or cross-boundary types.

### Step 4a: Generate Security Spec

If the system docs describe any authentication, authorization, user-facing features, or API
endpoints, generate `{docsRoot}/specs/SECURITY_SPEC.md` with these sections:

#### Per-Endpoint Security

Table of every API endpoint with auth required, auth method, authorization, input validation,
and rate limit. Unspecified endpoints flagged with "No auth specified -- default: auth required."

```markdown
| Endpoint | Auth Required | Auth Method | Authorization | Input Validation | Rate Limit |
|----------|--------------|-------------|---------------|------------------|------------|
| POST /api/users | Yes | JWT | Public (registration) | email: valid format, password: 8+ chars | 10/min |
| GET /api/users/:id | Yes | JWT | Owner or Admin | id: UUID v4 | 60/min |
```

#### System-Level Security

CORS policy, CSP headers, rate limiting, session management, secrets injection. Extracted
from Architecture doc and DECISIONS.md (`security`, `auth` category tags). Unspecified
concerns get `[DECISION NEEDED]` markers. The decision flow protocol (P0.5) ensures existing
bootstrap decisions are used rather than re-asked.

#### Secure UX Patterns

Password requirements, session timeout, error messages, CSRF protection. Skipped if no auth
flows.

#### Dependency Governance

- **Approved packages**: List of vetted packages by category (ORM, HTTP client, auth, etc.)
- **License allowlist**: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC. Flag GPL/LGPL/AGPL.
- **Version constraints**: Pinning strategy (exact, range, latest minor)
- **Vulnerability scanning policy**: When to audit, severity thresholds for blocking

Extracted from DECISIONS.md (`dependencies` category) or defaults.

#### Per-Spec Accessibility Requirements

ARIA attributes, keyboard interaction, focus management, screen reader requirements per UI
spec. Scaled to accessibility level from bootstrap (WCAG 2.1 AA default for commercial,
minimal for personal).

#### Standard Edge Cases Per Spec

Component-type-based edge case sections. Include relevant edge cases based on the types of
components in each spec:

- **Text input**: Empty, max length, unicode, XSS payloads, whitespace-only, RTL text
- **Numeric**: Zero, negative, overflow, NaN, precision loss
- **List/array**: Empty list, single item, max items, duplicate items
- **File upload**: Zero bytes, max size, wrong MIME type, malicious filename
- **Date/time**: Timezone boundaries, DST transitions, epoch, far future, invalid formats
- **API endpoint**: Missing auth, expired token, malformed body, concurrent requests
- **Auth-protected resource**: Unauthorized access, expired session, role escalation

### Step 4b: Generate Error Taxonomy

If the system has API endpoints, generate a system-level error specification with four parts:

#### Error Response Format

Standard JSON shape for all error responses:

```json
{
  "code": "VALIDATION_INVALID_EMAIL",
  "message": "The email address format is invalid.",
  "details": { "field": "email", "value": "not-an-email" },
  "requestId": "req_abc123"
}
```

- `code`: Machine-readable error code (string, UPPER_SNAKE_CASE)
- `message`: Human-readable description (string, safe to display)
- `details`: Optional structured context (object, varies by error type)
- `requestId`: Request correlation ID for debugging (string)

#### Error Code System

Category prefixes with HTTP status mappings:

| Category | Prefix | HTTP Status | Examples |
|----------|--------|-------------|----------|
| Validation | VALIDATION_* | 400 | VALIDATION_INVALID_EMAIL, VALIDATION_REQUIRED_FIELD |
| Authentication | AUTH_* | 401 | AUTH_TOKEN_EXPIRED, AUTH_INVALID_CREDENTIALS |
| Authorization | AUTHZ_* | 403 | AUTHZ_INSUFFICIENT_ROLE, AUTHZ_RESOURCE_DENIED |
| Not Found | NOT_FOUND_* | 404 | NOT_FOUND_USER, NOT_FOUND_RESOURCE |
| Conflict | CONFLICT_* | 409 | CONFLICT_DUPLICATE_EMAIL, CONFLICT_VERSION_MISMATCH |
| Rate Limit | RATE_LIMIT_* | 429 | RATE_LIMIT_EXCEEDED, RATE_LIMIT_QUOTA_REACHED |
| Internal | INTERNAL_* | 500 | INTERNAL_DATABASE_ERROR, INTERNAL_SERVICE_UNAVAILABLE |

Start minimal (~15-20 codes), extend during implementation. Each code maps to exactly one
HTTP status — no ambiguity.

#### Error Propagation Chain

How errors transform across boundaries:

```
DB Error → Service Layer → API Response → Frontend Display
(raw)      (classified)    (sanitized)    (user-friendly)
```

- **DB -> Service**: Catch database errors, classify into error codes. Never expose raw DB
  errors (table names, query details).
- **Service -> API**: Map service errors to HTTP responses using the error code system.
  Internal details stay in logs, not in responses.
- **API -> Frontend**: Frontend receives the standard JSON shape. `message` is safe to
  display. `code` drives programmatic handling (retry, redirect, show field error).

#### Per-Endpoint Error Catalog

Table of which error codes each endpoint can return and under what conditions. This is the
backend-frontend contract.

```markdown
| Endpoint | Error Code | Condition | Response Example |
|----------|-----------|-----------|-----------------|
| POST /api/auth/login | AUTH_INVALID_CREDENTIALS | Wrong email/password | 401 |
| POST /api/auth/login | RATE_LIMIT_EXCEEDED | >5 attempts in 15min | 429 |
| POST /api/users | VALIDATION_INVALID_EMAIL | Malformed email | 400 |
| POST /api/users | CONFLICT_DUPLICATE_EMAIL | Email already registered | 409 |
```

### Step 4c: Generate API Conventions Preamble

If the system has API endpoints, generate conventions that all endpoint specs reference.
Extracted from DECISIONS.md (`api-style` category) or sensible defaults:

- **Naming**: Plural nouns for resources, camelCase for JSON fields, kebab-case for URLs
- **Pagination**: Cursor-based or offset-based (record in DECISIONS.md)
- **Filtering**: Query parameter syntax (e.g., `?status=active&role=admin`)
- **Sorting**: Query parameter syntax (e.g., `?sort=createdAt&order=desc`)
- **Versioning**: URL prefix (`/api/v1/`) or header-based
- **Rate limiting headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- **Response envelope**: Whether to wrap in `{ data: ..., meta: ... }` or return raw
- **Content type**: `application/json` default, multipart for file uploads

Unresolved defaults flagged as `[DEFAULT -- confirm or override]`, become L1 spec gaps.

Every endpoint spec must declare "Inherits from: API_CONVENTIONS" with any overrides.

### Step 4d: Identify Shared Types

If the system has both frontend and backend specs:

#### Shared Types Inventory

Table of types crossing the frontend/backend boundary with serialization notes:

```markdown
| Type | Used In (Backend) | Used In (Frontend) | Serialization Notes |
|------|------------------|-------------------|-------------------|
| User | user-service, auth-service | user-profile, admin-panel | id: UUID string, createdAt: ISO 8601 |
| Permission | auth-service | role-manager | enum: string union |
```

#### Type Sharing Strategy

Record from DECISIONS.md (`type-sharing` category) or flag as `[DECISION NEEDED]`.

Options:
- **Shared package**: Monorepo shared types package (e.g., `@project/types`)
- **Generated from API spec**: OpenAPI/JSON Schema generates client types
- **Manual sync**: Copy types with lint rule to detect drift
- **Runtime validation**: Zod/Yup schemas shared, runtime type checking

#### Serialization Contracts

For non-trivial serialization (types that change shape across the boundary):

```markdown
| Type | Backend Representation | Wire Format | Frontend Representation |
|------|----------------------|-------------|----------------------|
| Date | Date object | ISO 8601 string | Date object (parsed) |
| Decimal | Decimal/BigNumber | string | number (with precision note) |
| Enum | string union | string | string union (same) |
| Binary | Buffer | base64 string | Blob/ArrayBuffer |
```
