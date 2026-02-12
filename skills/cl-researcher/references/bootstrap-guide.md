## Bootstrap Guide

Bootstrap mode creates the initial system documentation for a project. This is the entry
point for both greenfield projects (no docs exist) and brownfield projects (existing code
and/or existing docs need to be organized into the Clarity Loop structure).

### When to Use

Bootstrap triggers when:
- The user says "bootstrap", "set up docs", "initialize docs", "create initial docs"
- `docs/system/` is empty (no `.md` files beyond `.manifest.md` and `.pipeline-authorized`)
- The user is a new Clarity Loop adopter and asks "how do I start?"

### Detection

Check `docs/system/` for existing `.md` files (excluding `.manifest.md`):
- **No docs found** → greenfield or brownfield-with-code path
- **Docs found** → the project already has system docs, bootstrap isn't needed. Suggest
  the normal pipeline (research → proposal → review → merge) instead.

If `docs/system/` doesn't exist at all, auto-scaffold by running init.js (see Step 1 below).
Do NOT ask the user to run it manually — just run it.

---

### Greenfield Bootstrap (No Existing Docs or Code)

For a brand-new project where nothing exists yet.

#### Step 1: Scaffold

Check if the docs directory structure exists (tracking files like `docs/RESEARCH_LEDGER.md`,
`docs/PROPOSAL_TRACKER.md`, `docs/STATUS.md`, and subdirectories like `docs/system/`).

If anything is missing, run init.js automatically:

```bash
node <plugin-root>/scripts/init.js
```

Where `<plugin-root>` is the Clarity Loop plugin directory. The init script is idempotent —
safe to run even if some directories already exist. It handles collision detection, creates
all directories, copies tracking file templates, and sets up .gitignore entries.

Tell the user: "Setting up the documentation structure..." and then run it. Do NOT ask the
user to run it manually — this is a transparent setup step, not a user action.

#### Step 2: Discovery Conversation

Have a genuine conversation with the user to understand the project:

**Start with:**
- What does this project do? What problem does it solve?
- Who is it for? (users, developers, internal teams)
- What are the key components or subsystems?
- What's the tech stack?

**Then dig deeper — functional:**
- What are the main workflows or user journeys?
- Are there external integrations or dependencies?
- What are the key architectural decisions already made?
- What's the scope? What's explicitly out of scope?

**Behavioral and UX questions** (ask these as a natural continuation of the conversation,
not as a separate checklist dump — adapt to context and skip what's not applicable):
- How should the app handle errors? Toast notifications? Inline errors? Error pages?
  (Establishes error handling philosophy — category: `errors`)
- Should actions feel instant (optimistic updates) or show loading states?
  (Establishes state management approach — category: `resilience`)
- What happens when there's no data yet? Empty states with onboarding? Minimal
  placeholders? (Establishes empty state philosophy — category: `content`)
- What accessibility level are you targeting? WCAG 2.1 AA? 2.2? No specific target?
  (Category: `accessibility` — this constrains design tokens and component specs)
- Is this keyboard-first, mouse-first, or touch-optimized?
  (Affects interaction patterns, component sizing, focus management — category: `accessibility`)
- What's the app's voice — professional? Friendly? Minimal? Technical?
  (Establishes content tone for error messages, empty states, help text — category: `content`)
- How should the app handle being offline or network errors?
  (Establishes resilience philosophy — category: `resilience`. Skip for server-only apps)
- What's your testing philosophy? Specific framework? Coverage expectations?
  (Category: `testing` — feeds into spec generation)
- Target devices? Desktop only? Mobile? Both? Tablet?
  (Establishes responsive targets — category: `responsive`)

Not every project needs all of these. Server-side APIs don't need empty state philosophy.
Simple tools don't need offline handling. Ask what's relevant to the project type. But
**always ask about error handling and accessibility** — these affect every project.

These conversational answers feed into Step 2b (profile detection) and Step 2c (defaults
sheet). If the user answered a behavioral question here, the defaults sheet pre-fills that
category with source `[from discovery]` instead of `[preset]` or `[research-generated]`.
This means the user won't be re-asked the same question in the defaults sheet — their
conversational answer takes precedence per the DECISIONS.md precedence rules.

**Testing strategy (probe when project type warrants it — skip for pure documentation
or simple scripts):**

The project profile system (Step 2b) already captures basic testing decisions via
auto-detect and presets (framework, mock boundaries, test data approach, coverage
expectations). These probes go deeper into project-specific testing architecture:

- "What integration boundaries matter most? (API contracts? Database operations?
  Full user flows? Authentication chain?)"
  → Record in DECISIONS.md with category `testing`
- "Are there any testing constraints? (CI time budget, specific test environments,
  external service dependencies that can't be mocked?)"
  → Record in DECISIONS.md with category `testing`

If the profile system already resolved framework, mock boundaries, test data, and
coverage via auto-detect or presets, don't re-ask those. Only probe for gaps.

These are ARCHITECTURE-LEVEL decisions. Don't ask for implementation details — ask for
strategy and philosophy. The answers go into DECISIONS.md with category tag `testing`
and are consumed by spec generation when producing TEST_SPEC.md.

**If the user doesn't have strong opinions and the profile system provided no
testing defaults**: Use sensible defaults:
- Framework: vitest (for JS/TS projects) or pytest (for Python)
- Test data: factories for entities, fixtures for API responses
- Mocking: mock DB in unit tests, real test DB in integration tests, always mock
  external APIs
- Coverage: focus on business logic and integration boundaries
- Integration priority: API contracts and auth flows

Record the defaults in DECISIONS.md with source `[auto-default]` and category `testing`.

**Dig deeper — security and data (scale to project type):**
- Data sensitivity? (PII, financial data, health data, public only?)
- Compliance requirements? (GDPR, HIPAA, SOC2, PCI-DSS, none?)
- Are there admin vs. regular user roles? What can each do?

These questions inform the `security`, `auth`, and `authorization` category decisions
in the defaults sheet (Step 2c). For hobby/prototype projects, these can be brief —
the Prototype preset already defaults to "Skip" for security depth.

**Dig deeper — operational and quality (scale to project type):**

For projects that will be deployed (not just prototypes or scripts), read
`references/operational-bootstrap.md` for operational discovery questions covering
deployment targets, observability needs, data lifecycle decisions, code organization
preferences, and performance targets. These feed into DECISIONS.md with category tags
`deployment`, `observability`, `data-lifecycle`, `code-conventions`, `performance`,
and `data-modeling`. Skip for Prototype preset projects.

Continue the conversation naturally. These questions establish the project's identity.
Don't rush -- the quality of initial docs depends on getting the picture right.

#### Step 2b: Project Profile Detection

After you have a solid understanding of the project fundamentals (typically after 3-5
exchanges), generate a project profile using the three-level system. The
`ux.profileMode` config controls behavior (default: `"auto"`).

##### Level 1: Auto-Detect (brownfield / existing codebase)

If the project has existing code, scan it to derive a profile automatically. No
questions needed for decisions already made in code:

| Signal | Detection Method | Example |
|--------|-----------------|---------|
| Package manager | `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `pyproject.toml` | Node.js, Python, Rust, Go, Java, Ruby, PHP |
| Framework | Dependencies in manifest (Next.js, FastAPI, Gin, Actix, Spring Boot, Django, Rails, Laravel, etc.) | Next.js 14 detected from package.json |
| Testing | Test runner config (`vitest.config`, `jest.config`, `pytest.ini`, `.rspec`), test directories, test file patterns | Vitest with existing test suite |
| Auth | Auth middleware, JWT libraries, session config, OAuth setup, passport config | JWT via `jsonwebtoken` package |
| Error handling | Existing error classes, error middleware, error response shapes | Custom AppError class with structured responses |
| API style | Route patterns, REST conventions, GraphQL schema, tRPC routers | REST with `/api/v1/` prefix |
| Linting/formatting | ESLint, Prettier, Black, Rustfmt, gofmt configs | ESLint + Prettier configured |
| Database | ORM config, migration directories, schema files | Drizzle ORM with PostgreSQL |
| UI framework | React, Vue, Svelte, Angular from dependencies | React 18 with Next.js |
| Styling | Tailwind config, CSS modules, styled-components, Sass | Tailwind CSS v4 |
| CI/CD | `.github/workflows`, `Jenkinsfile`, `.gitlab-ci.yml` | GitHub Actions |
| Containerization | `Dockerfile`, `docker-compose.yml` | Docker with compose |

Prepare the detected profile as a **Project Profile** table. **Do not present it to the
user yet** — the Stack Validation step below will validate library versions and
compatibility first, then present the combined result (profile + version status) together.

The raw profile table looks like:

| Detected | Value | Confidence | Override? |
|----------|-------|------------|-----------|
| Language | TypeScript (Node.js) | High -- package.json | |
| Framework | Next.js 14 | High -- dependency | |
| Testing | Vitest | High -- vitest.config.ts exists | |
| Auth | JWT (jsonwebtoken) | Medium -- package present, no middleware found | |
| Database | PostgreSQL via Drizzle | High -- drizzle.config.ts + migrations/ | |
| API style | REST, /api/ routes | Medium -- inferred from route files | |
| Linting | ESLint + Prettier | High -- configs exist | |
| UI | React 18 | High -- dependency | |
| Styling | Tailwind CSS v4 | High -- tailwind.config exists | |

Auto-detect produces decisions with source: `[auto-detected]` in DECISIONS.md.

**Conflicting signals within a category**: When auto-detect finds multiple values for the
same category (e.g., both React and Vue in dependencies, both Jest and Vitest configs),
present all detected values with their confidence levels and let the user resolve:

| Category | Conflict | Value A | Value B | Recommendation |
|----------|----------|---------|---------|----------------|
| Framework | Two frameworks detected | React 18 (High -- package.json) | Vue 3 (Medium -- vue.config.js) | Pick primary; note secondary if used in specific routes |

Do not silently pick one. Surface the conflict in the defaults sheet so the user makes the
call. If confidence levels differ significantly (High vs Low), recommend the higher-confidence
value but still show both.

After preparing the detected profile, check for **gaps** -- categories the pipeline needs
that auto-detect couldn't determine (error handling strategy, security depth, content
tone, accessibility level, etc.). If gaps exist, fill them via Level 2 (quick research)
or ask the user directly. Resolve gaps before proceeding to Stack Validation — the
validation step needs the full tech stack.

##### Level 2: Quick Research (new or complex projects)

When auto-detect finds little (new project) or the project is complex, run a mini
research cycle:

1. Analyze the PRD, architecture doc, and tech stack constraints
2. Generate a custom profile based on what the project actually needs
3. Not limited to predefined categories -- if the project needs something unusual
   (HIPAA compliance, real-time processing, embedded constraints, ML pipeline stages,
   data governance), the profile captures it

"Based on your PRD and architecture docs, here's the project profile I'd recommend:"

| Category | Decision | Value | Source | Override? |
|----------|----------|-------|--------|-----------|
| Error handling | Display style | Toast notifications + inline for forms | PRD: "user-friendly error messages" | |
| Auth | Strategy | OAuth 2.0 + JWT | Architecture doc: "SSO required" | |
| Testing | Framework | Vitest | Tech stack: Node.js + TypeScript | |
| Security | Depth | High (HIPAA) | PRD: "healthcare data" | |
| ... | ... | ... | ... | |

Quick research produces decisions with source: `[research-generated]` in DECISIONS.md.

##### Level 3: Presets (quick start, optional)

For brand-new projects without a PRD or existing code, or when the user wants a fast
start, offer language/framework-agnostic presets:

"Want to start from a preset? Pick one and I'll pre-fill defaults you can customize:"

- **Web Application** -- full-stack, any framework (auth, responsive UI, data management)
- **API / Backend Service** -- any language (no UI, structured errors, API conventions)
- **CLI / Desktop Tool** -- any language (no auth, stderr errors, focused functionality)
- **Library / Package** -- any language (no UI, comprehensive testing, API design)
- **Prototype / Experiment** -- minimal everything (speed over rigor)

See the Project Profile Presets section at the end of this file for preset details.

Presets produce decisions with source: `[preset: Web Application]` (or whichever
preset) in DECISIONS.md.

##### Freeform (always available)

At any point, the user can:
- Skip all profile generation entirely ("I'll answer questions manually")
- Override any individual decision in the detected/generated/preset profile
- Mix auto-detected values with manual overrides or preset defaults

If `ux.profileMode` is `"off"`, skip profile detection entirely and go straight to
freeform. The user fills in decisions through conversation.

##### Stack Validation and Context (runs before presenting profile)

After any detection level produces a tech stack (auto-detect, quick research, or preset +
user's stated preferences), **do NOT present it to the user yet**. First, validate the
stack against current releases. Then present the full picture — what was detected, what's
latest, and whether libraries are compatible — so the user can make an informed decision.

**1. Version currency check:**

For each library/framework in the detected stack, run a quick web search:
- `WebSearch` for "[library] latest stable version [current year]"
- Compare detected version against latest stable release
- Note the delta: current, minor update, major update available

**2. Cross-compatibility check:**

Check that the detected libraries are compatible with each other:
- Framework + runtime: Does Next.js 15 require React 19? Does Django 5 require Python 3.10+?
- ORM + database: Does Drizzle's latest support the detected database driver?
- Styling + framework: Does Tailwind v4 work differently with the detected framework?
- Testing + framework: Is the test runner compatible with the framework version?

`WebSearch` for "[library A] [version] compatibility with [library B] [version]" or
"[library] [version] peer dependencies" for any uncertain pairings.

**3. Present the tech stack with version status:**

Always show the user what you know vs what's current. Be transparent — even if everything
is up to date, show it:

"Here's your tech stack with current version status:

| Library | Your Version | Latest Stable | Compatible | Status |
|---------|-------------|---------------|------------|--------|
| Next.js | 14.2.0 | 15.1.0 | ⚠️ Requires React 19 | Major update available |
| React | 18.3.0 | 19.0.0 | ✅ With Next.js 15 | Major update available |
| Drizzle | 0.38.0 | 0.39.0 | ✅ | Minor update available |
| Tailwind CSS | 4.0.0 | 4.0.0 | ✅ | Current |
| Vitest | 2.1.0 | 2.1.0 | ✅ | Current |

Would you like to:
1. **Update to latest compatible set** — I'll research the latest versions and download
   up-to-date context for each library (recommended)
2. **Keep your current versions** — proceed as-is
3. **Mix** — tell me which ones to update"

**Never proceed silently.** The user should always see the detected-vs-latest comparison
so they can make a conscious choice about which versions their project targets.

**4. If user chooses to update — download context and present updated list:**

When the user opts to update (all or specific libraries):

a. Run the context mode process for each library being updated — follow Steps 2-5 of
   `references/context-mode.md` (skip Step 1: Identify Libraries — you already have the
   library list from the profile detection above). This fetches official docs, correct API
   patterns, import paths, breaking changes, and gotchas. Creates `{docsRoot}/context/` files.

b. After context is downloaded, present the **updated tech list** so the user sees the
   final validated state:

   "Updated tech stack with validated context:

   | Library | Version | Context | Notes |
   |---------|---------|---------|-------|
   | Next.js | 15.1.0 | ✅ Downloaded | App Router stable, Turbopack default |
   | React | 19.0.0 | ✅ Downloaded | use() hook, Server Components stable |
   | Drizzle | 0.39.0 | ✅ Downloaded | New query builder API |
   | Tailwind CSS | 4.0.0 | ✅ Downloaded | CSS-first config, no tailwind.config.js |
   | Vitest | 2.1.0 | ✅ Current | No context needed — already up to date |

   This is the tech stack I'll use for your system docs. Proceeding to project
   configuration."

c. This validated, context-backed tech list feeds directly into the defaults sheet
   (Step 2c). The profile table shows the final versions, and the context files are
   available for Step 5 (doc generation).

**5. If user keeps current versions:**

Still offer context download: "Want me to download detailed context for your current
library versions? This ensures your system docs reference correct API patterns even if
you're not on the latest." If accepted, run context mode and present the result. If
declined, proceed — context can be created later via `/cl-researcher context`.

**Skip conditions**: If no tech stack was detected (pure documentation project) or the user
is in full freeform mode and hasn't named any libraries yet, skip validation. It will
run when the user provides library choices.

#### Step 2c: Defaults Sheet (Generate-Confirm Pattern)

Whether using auto-detect, quick research, a preset, or going freeform, generate a
**defaults sheet** -- a table of all cross-cutting decisions the pipeline needs.
Present it for batch review:

"Here's the proposed configuration for your project. Review and mark anything you want
to change:"

| Category | Decision | Value | Source | Override? |
|----------|----------|-------|--------|-----------|
| Error handling | Error display style | Toast notifications | [auto-detected] | |
| Error handling | Error format | Structured `{code, message, details}` | [research-generated] | |
| Auth | Strategy | JWT with refresh tokens | [auto-detected] | |
| Auth | Authorization model | Role-based | [research-generated] | |
| Testing | Framework | Vitest | [auto-detected] | |
| Testing | Test data approach | Factories | [preset: Web Application] | |
| Testing | Mock boundaries | Mock DB in unit, real in integration | [research-generated] | |
| Testing | Coverage expectation | Business logic + integration boundaries | [preset: Web Application] | |
| API style | Convention | REST, cursor pagination | [auto-detected] | |
| API style | Response envelope | `{data, pagination}` | [research-generated] | |
| API style | Naming | camelCase JSON, kebab-case URLs | [auto-detected] | |
| Security | Depth | Standard (generates SECURITY_SPEC.md) | [research-generated] | |
| Security | Compliance | None specified | [confirm or specify] | |
| Security | Dependency policy | Advisory (warn on CVEs, don't block) | [research-generated] | |
| Accessibility | Level | WCAG 2.1 AA | [preset: Web Application] | |
| Accessibility | Interaction mode | Mouse-first with keyboard support | [auto-detected] | |
| Content | Tone | Professional, concise | [research-generated] | |
| Content | Empty states | Onboarding CTAs | [preset: Web Application] | |
| Resilience | Offline handling | Not applicable (server-rendered) | [research-generated] | |
| Resilience | Loading states | Show loading indicators | [preset: Web Application] | |
| Type sharing | Strategy | Generated from API spec | [research-generated] | |
| Target devices | Viewports | Desktop + mobile responsive | [auto-detected] | |

**Source column shows provenance.** Each value traces back to its origin:
`[auto-detected]`, `[research-generated]`, `[preset: X]`, `[user override]`, or
`[from discovery]`. This transparency lets the user know which defaults are
evidence-based (auto-detected from code) vs inferred (research-generated) vs
generic (preset).

**Not every row applies to every project.** Omit rows that don't apply (a CLI tool
doesn't need accessibility level or empty state strategy). The profile determines
which rows appear; freeform includes all potentially relevant rows.

**The user reviews and responds.** Typical responses:
- "Looks good" -- all defaults accepted. Record all in DECISIONS.md.
- "Change pagination to offset-based, bump security to strict, rest is fine" -- update
  the specified rows, record all in DECISIONS.md.
- "Let me think about auth -- proceed with everything else" -- record decided items,
  mark auth as `[DEFERRED]` in DECISIONS.md. The pipeline proceeds; auth decisions
  will be asked again when needed (during spec generation).

**After confirmation**, record all decisions to `docs/DECISIONS.md` with source
attribution (`[auto-detected]`, `[research-generated]`, `[preset: X]`, `[user override]`,
`[from discovery]`, or `[DEFERRED]`) and the appropriate category tag. Use compact
Decision entries -- the defaults sheet IS the rationale.

**Warmth note**: This step should feel like reviewing a menu, not filling out a tax
form. Present the table with brief explanations: "I've pre-filled based on what I
detected in your codebase and PRD. The important ones to look at are auth strategy
and security depth -- the rest are sensible defaults you can always change later."

#### Step 3: Suggest Initial Doc Set

Based on the conversation, suggest which system docs to create. Don't default to a fixed
template — the doc set should reflect what the project actually needs.

Common starting sets (adapt based on project):

| Project Type | Typical Initial Docs |
|-------------|---------------------|
| **API/backend service** | PRD, ARCHITECTURE, API_DESIGN, DATA_MODEL |
| **Full-stack app** | PRD, ARCHITECTURE, TDD (or FRONTEND_DESIGN), DATA_MODEL |
| **Library/SDK** | PRD, API_DESIGN, USAGE_GUIDE |
| **Infrastructure/platform** | PRD, ARCHITECTURE, OPERATIONS, SECURITY |
| **Documentation-heavy** | PRD + domain-specific docs |

Present the suggestion: "Based on what you've described, I recommend starting with these
system docs: [list with one-line descriptions]. Does this cover the key aspects, or should
we add/remove any?"

The user confirms, modifies, or rejects.

#### Step 4: Create Authorization Marker

Write `docs/system/.pipeline-authorized`:

```
operation: bootstrap
source: genesis
authorized_by: user
timestamp: [ISO 8601]
```

#### Step 5: Generate Initial System Docs

For each doc in the approved set, generate it in `docs/system/`. Each doc should:
- Be substantive but not exhaustive — capture what's known, mark what isn't
- Use `[TBD]` or `[To be researched]` for areas that need more investigation
- Include cross-references to related docs in the initial set
- Follow the project's conventions (Mermaid for diagrams, etc.)
- **Reference library context files** (if created during Stack Validation in Step 2b) for
  version-accurate details. The Architecture doc's tech stack section should use current API
  patterns and import paths from the context files, not general LLM knowledge. If context
  files exist, use the "pass by reference" pattern where appropriate — e.g., `"Drizzle ORM
  (see context/drizzle-orm/ for version details and API patterns)"`.

These are starting points, not final docs. The normal pipeline (research → proposal →
review → merge) handles subsequent changes.

#### Step 6: Clean Up

1. Remove `docs/system/.pipeline-authorized`
2. The PostToolUse hook will auto-generate `.manifest.md`
3. Update `docs/STATUS.md` — note that bootstrap was completed, list the initial docs
4. Update `docs/DECISIONS.md` — populate the Project Context section (purpose, architecture, constraints, technology stack, design principles) based on everything learned during bootstrap. Log initial architectural decisions as Decision entries

Tell the user: "Initial system docs created in `docs/system/`. You can now use the normal
pipeline for changes — `/cl-researcher research 'topic'` to research, then proposal and
review to refine."

---

### Brownfield Bootstrap — Existing Docs

For projects that already have documentation — whether organized project docs, scattered
markdown files, a wiki export, README-driven docs, or research generated in ChatGPT/Claude.

#### Step 1: Discover Existing Docs

Ask the user where their existing docs are, or detect them:
- Markdown files in the project root or a `docs/` directory (outside `system/`)
- README.md with substantial content
- Wiki pages exported as markdown
- AI-generated research or specs (from ChatGPT, Claude, other tools)
- Any other documentation artifacts

Read and analyze the existing docs:
- What topics do they cover?
- What's the quality level? (rough notes vs. polished docs)
- Are there gaps?
- Is there redundancy or contradiction?
- How fresh are they? (recent AI conversation vs. months-old wiki)

#### Step 2: Choose Import Path

Present both options and let the user decide:

"I found existing documentation. How would you like to use it?"

**Path A — Import as system docs (fast, with audit)**:
Best when the user trusts the docs — recent AI-generated research, fresh project docs,
or content they've already vetted. The existing docs become the starting system docs, and
an immediate audit verifies quality.

**Path B — Import as research context (thorough, with regeneration)**:
Best when docs might be stale, incomplete, or of uncertain quality — old wikis, inherited
documentation, or rough notes. The existing docs go into `docs/research/` as reference
material, and bootstrap runs a conversation-driven regeneration that uses the old docs as
input but produces fresh system docs.

The user chooses which path based on their confidence in the existing material. If unsure,
Path B is safer — no stale claims sneak through.

#### Step 3A: Import Path — Migrate and Audit

For docs the user trusts:

1. Map the existing content to a proposed `docs/system/` structure:

```
Existing docs → Proposed system docs

README.md (overview section) → docs/system/PRD.md
README.md (architecture section) → docs/system/ARCHITECTURE.md
docs/api.md → docs/system/API_DESIGN.md
docs/deployment.md → docs/system/OPERATIONS.md
[no existing content] → docs/system/DATA_MODEL.md (gap — to be researched)
```

2. Present the mapping: "Here's how I'd reorganize your existing docs into the system doc
   structure. [N] docs can be adapted directly, [M] have gaps that need research. Does this
   mapping look right?"

3. Create `docs/system/.pipeline-authorized` with `operation: bootstrap, source: import`
4. For each mapping:
   - **Direct adaptation**: Copy content, clean up formatting, add cross-references
   - **Merge**: Combine multiple source docs into one system doc
   - **Gap**: Create a stub with `[To be researched]` markers
5. Remove the marker
6. Update tracking

7. **Immediately suggest an audit**: "System docs imported from existing documentation. I
   recommend running `/cl-reviewer audit` to verify quality — this catches AI
   hallucinations, stale claims, internal contradictions, and gaps. Want to run it now?"

Tell the user about gaps: "These areas have no existing documentation and will need
research cycles: [list]. You can start with `/cl-researcher research 'topic'` for any
of these."

#### Step 3B: Research Context Path — Ingest and Regenerate

For docs the user doesn't fully trust:

1. Copy existing docs into `docs/research/` with a clear prefix:
   - `docs/research/IMPORTED-original-name.md`
   - Add a header to each: "Imported from [source] on [date]. Used as research context
     for bootstrap — not a pipeline research doc."

2. Read all imported docs to build understanding of the project.

3. Run the standard discovery conversation (same as greenfield Step 2), but informed by
   the imported material. Reference what the old docs say:
   "Your existing docs describe [X] as using [Y]. Is that still accurate, or has this
   changed?"

4. Generate fresh system docs following greenfield Steps 3-6. The imported docs accelerate
   the conversation (you already know the domain) but the system docs are generated from
   the live conversation, not copy-pasted from potentially stale sources.

5. After generation, the imported docs in `docs/research/` remain as historical reference.
   They are NOT tracked in RESEARCH_LEDGER (they're not pipeline research docs).

---

### Brownfield Bootstrap — Existing Code, No Docs

For projects with a codebase but no documentation.

#### Step 1: Analyze the Codebase

Read key files to understand the project:
- Package files (package.json, Cargo.toml, go.mod, etc.) for dependencies and structure
- Entry points (main files, index files, app files)
- Directory structure for architectural patterns
- Config files for tech stack and tooling
- Test files for behavior documentation (tests are informal specs)

Build a mental model:
- What does this code do?
- What patterns does it use? (MVC, event-driven, microservices, etc.)
- What are the key abstractions?
- What external services does it interact with?

#### Step 2: Discovery Conversation

The code analysis gives you a starting point, but you still need the user's perspective.
Reference what you found in the code:

"From the codebase, I can see this is a [type] application using [stack]. It has [N] main
modules: [list]. I have some questions to fill in what the code doesn't tell me: [questions
about intent, constraints, future direction]."

This is a collaborative process — don't just auto-generate docs from code structure.

#### Step 3: Generate Docs

Follow the same process as greenfield Step 3-6, but informed by code analysis. The code
provides concrete details that a pure greenfield bootstrap wouldn't have:
- Actual file paths and module names
- Real dependencies and versions
- Existing patterns and conventions
- Integration points with external services

---

### Common Pitfalls

- **Don't generate everything at once.** Bootstrap creates a starting set. Detailed docs
  for specific subsystems should go through the normal pipeline.
- **Don't copy-paste code into docs.** Docs describe intent and architecture, not
  implementation details. Code changes; docs should be stable at a higher level.
- **Don't skip the conversation.** Even for brownfield with existing docs, talk to the user.
  Existing docs might be outdated, wrong, or reflect abandoned plans.
- **Don't over-document.** 3-5 well-written system docs are better than 15 stubs. Start
  small, expand through the pipeline.

---

### Project Profile System Reference

The project profile system has three levels that work together. Auto-detect runs first
(if there's code), quick research fills gaps, and presets offer a starting point for
greenfield projects. All three are optional -- the user can always go freeform.

#### Auto-Detect Signal Reference

When scanning an existing codebase, look for these signals. Each detection produces
a decision with source `[auto-detected]` and the specific evidence (e.g., "detected
from package.json dependency: next@14.2.0").

| Signal Category | Files to Scan | What to Extract |
|----------------|--------------|-----------------|
| **Language / Runtime** | `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `*.csproj` | Primary language, runtime version, module system |
| **Framework** | Dependency manifests, import statements, config files | Framework name and version (Next.js, FastAPI, Gin, Actix, Spring Boot, Django, Rails, Laravel, Phoenix, etc.) |
| **Testing** | `vitest.config.*`, `jest.config.*`, `pytest.ini`, `setup.cfg [tool:pytest]`, `.rspec`, `*_test.go`, `**/*.test.*`, `**/*.spec.*`, `test/`, `tests/`, `__tests__/` | Test runner, test file patterns, existing test count, coverage config |
| **Auth** | Auth middleware files, JWT/session/OAuth libraries in deps, passport config, auth route handlers | Auth strategy, token type, session management |
| **Error handling** | Custom error classes, error middleware, global error handlers, error response shapes in route handlers | Error format, display strategy, error hierarchy |
| **API style** | Route files, controller patterns, GraphQL schema, tRPC router, OpenAPI spec, REST conventions | API paradigm, URL patterns, response shapes, pagination style |
| **Linting / Formatting** | `.eslintrc*`, `.prettierrc*`, `pyproject.toml [tool.black]`, `rustfmt.toml`, `.editorconfig`, `biome.json` | Code style rules, formatting config |
| **Database** | ORM config, migration directories, schema files, connection strings in config | Database type, ORM/query builder, migration tool |
| **UI framework** | Framework-specific imports/components in source files, dependencies | React, Vue, Svelte, Angular, Solid, etc. + version |
| **Styling** | `tailwind.config.*`, CSS module files, styled-components usage, Sass/SCSS files, `postcss.config.*` | Styling approach, design token system |
| **CI/CD** | `.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, `.circleci/`, `bitbucket-pipelines.yml` | CI provider, pipeline stages, deploy targets |
| **Containerization** | `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Container setup, service topology |
| **Monorepo** | `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, `packages/`, `apps/` | Monorepo tool, workspace layout |

**Confidence levels**: High (config file exists with explicit values), Medium (inferred
from patterns or indirect evidence), Low (guessed from conventions). Show confidence
in the profile table so the user knows which detections to verify.

**What auto-detect CANNOT determine**: Business logic decisions (error display
strategy for new features, auth model for new user types), quality targets (coverage
expectations, security depth), and design preferences (content tone, accessibility
level). These gaps are filled by Level 2 (quick research) or direct user input.

#### Quick Research Profile Generation

When auto-detect produces an incomplete profile (new project, or existing project
with gaps), run a mini research cycle:

1. **Read available context**: PRD, architecture doc, tech stack decisions in
   DECISIONS.md, any existing system docs
2. **Analyze requirements**: Extract implicit decisions from requirements (e.g.,
   "healthcare data" implies HIPAA compliance, "real-time collaboration" implies
   WebSocket/SSE, "offline-first" implies service workers + sync)
3. **Generate custom profile**: Create profile entries for categories relevant to
   THIS specific project -- not limited to predefined lists
4. **Present with rationale**: Each generated value includes the source document
   and reasoning so the user can evaluate the recommendation

Quick research is particularly valuable for:
- **Domain-specific requirements**: HIPAA, PCI-DSS, GDPR, SOC2, FedRAMP
- **Unusual architectures**: Event sourcing, CQRS, microservices, serverless, edge
- **Non-web projects**: ML pipelines, data engineering, embedded systems, game dev
- **Complex integrations**: Multi-service auth, federated GraphQL, message queues

Generated decisions use source: `[research-generated]` with the specific doc and
reasoning referenced.

#### Preset Definitions

Presets are language/framework-agnostic starting points focused on PROJECT TYPE.
They provide reasonable defaults that auto-detect and quick research can refine.
Every default can be overridden.

##### Web Application

**Profile**: Full-stack web application with auth, data management, and responsive UI.
Any framework (Next.js, Django, Rails, Laravel, Spring Boot, Phoenix, etc.).

| Category | Default Value |
|----------|--------------|
| Error handling | Toast notifications for actions, inline for forms, error pages for navigation |
| Error format | Structured `{code, message, details, requestId}` |
| Auth | Session or token-based (framework convention) |
| Authorization | Role-based (admin, user) |
| Testing | Framework-conventional test runner |
| Test data | Factories for entities, fixtures for API responses |
| Mock boundaries | Mock DB in unit tests, real test DB in integration |
| Coverage | Business logic + integration boundaries |
| API style | REST or framework convention, cursor pagination |
| Security depth | Standard (generates SECURITY_SPEC.md) |
| Dependency policy | Advisory (warn on CVEs, block critical) |
| Accessibility | WCAG 2.1 AA |
| Content tone | Professional, concise |
| Empty states | Onboarding CTAs for first-use, "no results" for filtered |
| Loading states | Skeleton loading for pages, spinners for actions |
| Resilience | Retry with exponential backoff for API calls |
| Target devices | Desktop primary, mobile responsive |

##### API / Backend Service

**Profile**: Backend service consumed by other applications. No user-facing UI.
Any language (Node.js, Python, Go, Rust, Java, C#, etc.).

| Category | Default Value |
|----------|--------------|
| Error handling | Structured JSON error responses |
| Error format | Structured `{code, message, details, requestId}` |
| Auth | API keys or JWT (depends on consumer type) |
| Authorization | Scope-based or resource-based |
| Testing | Framework-conventional test runner |
| Test data | Factories for entities, fixtures for payloads |
| Mock boundaries | Mock DB in unit, real test DB in integration, mock external APIs |
| Coverage | High coverage on business logic, comprehensive integration |
| API style | REST or gRPC, strict versioning |
| Security depth | High (full SECURITY_SPEC.md, rate limiting, input validation) |
| Dependency policy | Strict (block critical + high CVEs) |
| Accessibility | N/A |
| Content tone | N/A (no user-facing content) |
| Resilience | Circuit breaker for upstream dependencies, retry with backoff |
| Target devices | N/A |

##### CLI / Desktop Tool

**Profile**: Command-line application or desktop tool. Any language.

| Category | Default Value |
|----------|--------------|
| Error handling | stderr messages with exit codes |
| Error format | Plain text with error codes |
| Auth | None (or OS-level credentials if needed) |
| Authorization | None (file system permissions) |
| Testing | Framework-conventional test runner |
| Test data | Fixtures (static test files) |
| Mock boundaries | Mock file system and network in unit tests |
| Coverage | Critical paths |
| API style | N/A |
| Security depth | Minimal (input validation only) |
| Dependency policy | Advisory |
| Content tone | Technical, terse |
| Loading states | Progress bars or spinners for long operations |
| Resilience | Retry for network operations, graceful degradation |
| Target devices | N/A |

##### Library / Package

**Profile**: Reusable library or package published for others to consume. Any language.

| Category | Default Value |
|----------|--------------|
| Error handling | Typed errors / exceptions with clear messages |
| Error format | Language-idiomatic error types |
| Auth | N/A (consumer handles auth) |
| Authorization | N/A |
| Testing | Framework-conventional test runner, emphasis on edge cases |
| Test data | Fixtures and property-based testing |
| Mock boundaries | Mock external dependencies, test public API surface |
| Coverage | High (public API 100%, internals critical paths) |
| API style | N/A (library API, not HTTP) |
| Security depth | Standard (input validation, no unsafe operations) |
| Dependency policy | Minimal dependencies (fewer = better for consumers) |
| Content tone | Technical, precise (API docs) |
| Resilience | Defensive programming, clear error messages |
| Target devices | N/A |

##### Prototype / Experiment

**Profile**: Side project, prototype, learning exercise, hackathon. Speed over rigor.

| Category | Default Value |
|----------|--------------|
| Error handling | Console output + basic try/catch |
| Error format | Simple `{error: "message"}` |
| Auth | None or basic (hardcoded credentials OK for prototyping) |
| Authorization | None |
| Testing | None or minimal |
| Coverage | None required |
| API style | Simple REST (no pagination needed for small datasets) |
| Security depth | Skip (no SECURITY_SPEC.md generated) |
| Dependency policy | None (no audit) |
| Accessibility | None specified |
| Content tone | Casual |
| Loading states | Basic spinner |
| Resilience | Skip |
| Target devices | Desktop only |

#### Mixing and Overriding

The three levels are complementary, not exclusive. Common patterns:

- **Brownfield**: Auto-detect fills most decisions, user overrides 2-3, research
  generates the rest. Most efficient path.
- **Greenfield with PRD**: Quick research generates a full profile from requirements.
  User reviews and overrides.
- **Quick start**: User picks a preset, auto-detect refines when code exists later.
- **Custom mix**: "Use the API Service preset but with Web Application's auth and
  the Library preset's testing approach" -- generate the defaults sheet with the
  specified mix and let them review.

The profile is a starting point, not a package deal. Every decision can be
individually overridden regardless of its source.
