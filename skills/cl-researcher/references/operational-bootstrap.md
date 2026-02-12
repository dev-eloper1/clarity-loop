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
