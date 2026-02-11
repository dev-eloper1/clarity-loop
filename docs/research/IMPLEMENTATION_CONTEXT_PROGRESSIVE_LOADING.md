# Implementation Context and Progressive Knowledge Loading

**Type**: Net new
**Status**: Draft
**Complexity**: L2 (Complex) — new concept, touches all skills, new directory convention, new researcher mode
**Open Questions**: 0
**Discussion Rounds**: 2

---

## System Context

This research relates to the following plugin artifacts:

| Document | Relevance |
|----------|-----------|
| `skills/doc-researcher/SKILL.md` | Primary owner. The researcher creates context files during research phases, using web search against official docs and context7.com as sources. New "context" mode or sub-capability. |
| `skills/implementer/SKILL.md` | Primary consumer. Run mode loads context before implementing tasks. Failure feedback loop triggers context updates. Start mode validates context staleness. |
| `skills/implementer/references/run-mode.md` | Step 3c ("Implement") currently reads spec references but has no mechanism to load library-specific knowledge. Context loading hooks in here. |
| `skills/implementer/references/start-mode.md` | Pre-checks section (Step 1) needs a context staleness check. Step 2 reads specs but doesn't cross-reference with context. |
| `skills/doc-spec-gen/SKILL.md` | Spec generation should re-validate context files. Specs reference libraries — context files should be current when specs are generated. |
| `skills/ui-designer/SKILL.md` | Consumer. Design decisions reference frameworks (Tailwind, React) that have context files. |
| `docs/pipeline-concepts.md` | New concept: "Context files" as a pipeline artifact type alongside research docs, proposals, specs, and designs. |
| `README.md` | Philosophy principle 6 ("Tools enhance, never gate") — context files follow this. New directory in Setup section. |
| `docs/research/DOC_PIPELINE_PLUGIN.md` | Design Decision #13 needed for the context system. |
| `scripts/init.js` | New `context/` directory in the init scaffold. |

### Current State

The pipeline currently has NO mechanism for providing accurate, current library/framework knowledge to any skill. When the implementer writes code, Claude uses training data that may be months or years stale. When the researcher investigates a library choice, it has no cached knowledge about current API surfaces.

The problem manifests as:
- **Stale imports**: `import { X } from 'library'` where `X` was renamed or moved in a recent version
- **Deprecated patterns**: Using configuration approaches that were replaced (e.g., `tailwind.config.js` vs Tailwind v4's CSS-based `@theme`)
- **Wrong dependency versions**: `"better-sqlite3": "11.0.0"` when the LLM is guessing the version number
- **API mismatches**: Calling methods with wrong signatures or missing required options
- **Build failures**: Cascading errors from any of the above, consuming tokens on debugging instead of implementing

The Architecture doc specifies WHICH libraries to use but not HOW to use them correctly. Specs describe WHAT to build but assume the LLM knows the library APIs. The gap is between declared intent and accurate implementation knowledge.

### Why This Research

Observed during testing the Clarity Loop plugin on a todo app. The documentation pipeline worked well through spec generation, but code generation was "a mess" — primarily due to stale library knowledge causing build errors. The user identified this as the single biggest implementation quality issue. Context7 MCP was considered but rejected because it bloats the session context with raw API dumps. A curated, progressive-disclosure approach was proposed instead.

---

## Scope

### In Scope

1. Folder structure and file format for context files
2. How the researcher creates and maintains context (new mode or sub-capability)
3. Classification/tagging for progressive disclosure
4. How all skills consume context (loading protocol)
5. Staleness detection and refresh triggers
6. Local-first storage with user-prompted global promotion
7. "Pass by reference" pattern — Architecture docs referencing context files for version/API details
8. Failure feedback loop — implementer → researcher for context gaps
9. Web research sources (official docs, context7.com website, changelogs)
10. Integration with the init script (new directory)

### Out of Scope

- Building a documentation scraper or context7 competitor
- RAG/vector-based retrieval (files are small enough for direct loading)
- Auto-generating context without human oversight
- Replacing system docs with context files
- MCP integration (explicitly rejected — context files are plain markdown)

### Constraints

- Context files must be plain markdown (no special tooling required)
- Progressive disclosure must work without RAG infrastructure — just file reads
- Context loading must not significantly increase token consumption per task
- The system must work without any context files (graceful degradation)
- Global context must not leak project-specific information

---

## Research Findings

### Finding 1: The Three-Layer Disclosure Model

**Context**: How to load context progressively — not dump everything, not miss what's needed.

**Analysis**: The research identified a widely-adopted three-layer progressive disclosure pattern used by Claude Code skills, Cursor's agent-requested rules, and MCP meta-tool servers:

| Layer | What Loads | When | Token Cost |
|-------|-----------|------|-----------|
| **Layer 1 — Index** | Library name, version, 1-line description, category tags | Always (at task start) | ~50 tokens per library |
| **Layer 2 — Overview** | Key patterns, breaking changes, gotchas, common errors | When working with that library | ~500-2000 tokens |
| **Layer 3 — Detail** | Specific API references, code examples, edge cases | On demand during implementation | Variable |

This maps directly to the file structure:
- Layer 1 = `.context-manifest.md` (one file, all libraries indexed)
- Layer 2 = `_meta.md` per library folder (overview + file inventory)
- Layer 3 = individual topic files within the library folder

**Source**: Progressive disclosure patterns from Claude Code skill loading, Cursor's Agent-Requested rules, MCP meta-tool pattern (SynapticLabs).

**Tradeoffs**: The three-layer model adds one extra read per library (the `_meta.md`) compared to just loading everything. But it saves significantly when a project has 10+ libraries and a task only touches 2-3. The breakeven is ~3 libraries.

### Finding 2: Context7 as a Research Source (Not MCP)

**Context**: Where does accurate, current library knowledge come from?

**Analysis**: Context7 (by Upstash) stores LLM-friendly documentation for thousands of libraries. Their pipeline: parse official docs → enrich with LLM → vectorize → rerank by quality score. Their architecture rewrite reduced tokens by 65% (~9.7k to ~3.3k per query) through server-side reranking.

Critically, context7 is accessible three ways:
1. **MCP** (rejected — bloats context)
2. **REST API** (`GET /api/v2/context?libraryId=...&query=...&type=txt`) — returns LLM-ready plain text
3. **Website** (context7.com/libraries) — browsable, fetchable via WebSearch/WebFetch

The researcher can use options 2 or 3 during research to fetch current library docs, then distill the relevant information into context files. This is a "fetch once, use many times" model — the web request happens during research, not during every implementation task.

**Other research sources**:
- Official library documentation (always primary)
- GitHub changelogs and release notes
- Community knowledge bases (awesome-cursorrules has curated framework guides)
- llms.txt convention files (growing adoption — Anthropic, Cursor/Mintlify use it)

**Source**: Context7 documentation, REST API guide, Upstash blog posts.

**Tradeoffs**: Context7's REST API requires an API key for higher rate limits. The website is freely browsable. Official docs are always the primary source — context7 supplements when official docs are hard to parse or navigate.

### Finding 3: Folder Structure — One Folder Per Library

**Context**: How to organize context files on disk.

**Analysis**: Based on the user's preference for "one folder per library" with granular files within, and informed by Cursor's `.cursor/rules/` directory pattern:

```
{docsRoot}/context/                  # Project-local context
  .context-manifest.md               # Layer 1: index of all libraries
  drizzle-orm/
    _meta.md                         # Layer 2: version, sources, file inventory
    overview.md                      # Key patterns, gotchas, breaking changes
    sqlite-patterns.md               # SQLite-specific usage
    migration-guide.md               # Migration API
  tailwind-v4/
    _meta.md
    overview.md
    theme-configuration.md           # @theme directive, CSS-based config
    v3-migration-notes.md            # What changed from v3
  react-markdown-v9/
    _meta.md
    overview.md
    plugin-chain.md                  # remark/rehype plugin ordering
    esm-gotchas.md                   # ESM-only import issues

~/.claude/context/                   # Global context (promoted from local)
  [same structure]
```

**The `.context-manifest.md`** (Layer 1 — always readable):

```markdown
# Context Manifest

**Last updated**: [date]

## Libraries

| Library | Version | Path | Tags | Last Verified |
|---------|---------|------|------|---------------|
| Drizzle ORM | 0.38.x | drizzle-orm/ | database, orm, sqlite | 2026-02-09 |
| Tailwind CSS | 4.x | tailwind-v4/ | styling, css, theme | 2026-02-09 |
| react-markdown | 9.x | react-markdown-v9/ | markdown, rendering | 2026-02-09 |
```

**The `_meta.md`** (Layer 2 — loaded when working with that library):

```markdown
# Drizzle ORM

**Version**: 0.38.x
**Last verified**: 2026-02-09
**Sources**: https://orm.drizzle.team/docs, context7.com
**Tags**: database, orm, sqlite, migration

## Overview

[Key patterns, gotchas, breaking changes — the stuff the LLM gets wrong]

## Files

| File | Category | Load When |
|------|----------|-----------|
| overview.md | core | Any Drizzle task |
| sqlite-patterns.md | sqlite | SQLite-specific implementation |
| migration-guide.md | migration | Creating or running migrations |
```

**Source**: Cursor's `.mdc` file structure, llms.txt convention, user requirements.

**Tradeoffs**: One folder per library means more directories but cleaner organization. The `_meta.md` acts as both documentation (human-readable overview) and index (machine-readable file inventory). Files within a library folder are chunked by topic — small enough to load individually, large enough to preserve meaning.

### Finding 4: Researcher as Context Author

**Context**: When and how does the researcher create context files?

**Analysis**: Context creation hooks into existing researcher workflows at three points:

**1. During bootstrap/research** (primary):
When the researcher reads the Architecture doc and identifies the tech stack (e.g., "Next.js 14.2, Tailwind CSS v4, Drizzle ORM, better-sqlite3"), it:
- Checks if context files exist for each library
- For missing libraries: web search official docs + context7.com → distill into context files
- For existing libraries: check version match (Architecture says v4, context covers v3 → needs update)
- Present to user: "Your tech stack uses these libraries. I've created/verified context for: [list]. Missing context for: [list]. Want me to research those?"

**2. During spec generation** (validation):
When `doc-spec-gen` generates specs, it cross-references spec content against context files:
- Spec references Drizzle → check `context/drizzle-orm/_meta.md` exists and version matches
- If context is missing or stale: warn before generating specs
- This is validation, not creation — but it may trigger the researcher to update context

**3. On implementation failure** (feedback loop):
When the implementer hits a build error traced to stale library knowledge:
- Classify: is this a code bug (fix task) or a knowledge gap (context gap)?
- If context gap: flag for researcher update. "Build failed because `drizzle-orm` import path changed in 0.38. Context file covers 0.33. Update context? [Y/n]"
- If user approves: researcher fetches current docs, updates context, implementer retries

**The research process for context creation**:
1. Read Architecture doc for library name + version
2. WebSearch for "[library] [version] documentation" or "[library] [version] migration guide"
3. WebFetch official docs pages for API reference
4. Optionally: WebSearch context7.com for LLM-friendly format
5. Distill into context files: keep gotchas, breaking changes, correct import paths, working patterns
6. Discard: tutorials, marketing copy, exhaustive API listings
7. Present to user for review before writing

**Source**: User requirements (researcher creates, implementer validates), existing researcher workflow patterns.

**Tradeoffs**: Making the researcher responsible means context files go through a human review step (the user sees what's being captured). The downside is it adds time to research — but the time saved during implementation (fewer build errors, less debugging) should more than compensate.

### Finding 5: Progressive Loading Protocol

**Context**: How do skills actually load context at runtime?

**Analysis**: A standard loading protocol that all skills follow:

```
1. Read .context-manifest.md (Layer 1)
   → Know what libraries have context, their versions and tags

2. Determine relevant libraries for current task:
   - Implementer: task → spec reference → libraries mentioned in spec
   - Spec-gen: all libraries in Architecture doc
   - UI-designer: styling/component libraries from Architecture doc
   - Researcher: libraries relevant to research topic

3. For each relevant library:
   a. Read _meta.md (Layer 2) — overview + file inventory
   b. Match task category against file categories in the inventory
   c. Load matching files (Layer 3) — only the ones relevant to this specific task

4. Inject loaded context into the implementation/generation prompt
   (after spec reference, before implementation)
```

**Example**: Task T-005 says "Create database schema using Drizzle ORM for SQLite."
- Step 1: Manifest shows `drizzle-orm/` exists, version 0.38.x
- Step 2: Spec references Drizzle ORM → relevant
- Step 3a: Read `drizzle-orm/_meta.md` — overview says "use `drizzle-kit generate` not `drizzle-kit generate:sqlite`"
- Step 3b: Task is database/sqlite category → matches `sqlite-patterns.md`
- Step 3c: Load `sqlite-patterns.md` — shows correct schema definition syntax for 0.38.x
- Step 4: Claude implements with correct imports and API calls

**Cursor's model for comparison**: Cursor uses four activation types (Always, Auto Attached via glob, Agent Requested via description, Manual via @mention). Our model is closest to "Agent Requested" — the skill reads the manifest description and decides what to load. But instead of a single description string, we have a structured `_meta.md` with category-tagged files.

**Source**: Cursor rules activation model, Claude Code skill loading, MCP meta-tool pattern.

**Tradeoffs**: This protocol adds 1-2 file reads per task (manifest + meta). For a task touching 2 libraries with 1 detail file each, that's ~4 reads. Negligible compared to the spec reads already happening. The alternative — loading all context always — would work for small projects but breaks at scale (10+ libraries × multiple files each = significant context bloat).

### Finding 6: Version-Pinned Staleness Model

**Context**: How do we know when context files are outdated?

**Analysis**: Context staleness is NOT time-based — it's version-based. A context file for Drizzle
0.38.x is valid as long as the project uses Drizzle 0.38.x, whether the file is 1 day old or 6
months old. Staleness occurs when the version in use changes, not when a calendar threshold passes.

**The version-pinning principle**: Context must match dev work. If 15 tasks have been implemented
using Drizzle 0.38 context, updating the context to 0.39 mid-implementation would make the
existing code inconsistent with the new context. There are two correct responses to a version
change:

1. **Don't update context** — if the project stays on the current version, the context stays too.
   The 1-week check (below) catches knowledge gaps in the CURRENT version, not version bumps.
2. **Version the context** — if the project upgrades, create a new version of the context alongside
   the old one. The old version remains as reference for existing code. The new version guides new
   tasks.

**Three staleness signals** (in order of severity):

1. **Freshness check (soft, 1-week default)**: Each `_meta.md` has `Last verified: [date]`. Context
   older than 1 week gets a soft check — not "this is wrong" but "verify this is still accurate for
   the version in use." The researcher does a quick web check against official docs for the pinned
   version. This catches errata, security patches, and minor updates within a version range. The
   threshold is 1 week by default, configurable per library in `_meta.md` (some libraries move
   faster than others).

2. **Version mismatch (hard)**: The version in `package.json` (or equivalent) doesn't match the
   version in `_meta.md`. This is a hard signal — the project upgraded but context wasn't updated.
   Options: a) create versioned context for the new version, b) update existing context (only if
   no tasks have been implemented using it yet), c) note the mismatch and proceed (user's call).

3. **Failure-based (strongest)**: Implementation fails with an error traced to a library API
   mismatch. Something in the context is definitely wrong for the version in use.

**Refresh triggers**:
- `/implementer start` pre-checks: compare `package.json` versions against context `_meta.md`
  versions. Warn on mismatches.
- `/doc-spec-gen generate`: validate context before generating specs. Stale context → stale specs.
- Build failure during `/implementer run`: classify error → if context gap → trigger researcher
  update for the specific version in use.
- User-initiated: `/doc-researcher context [library]` — explicitly re-research a library.
- Weekly soft check: if context is older than 1 week and the implementer is active, offer a
  quick verification pass.

**Version-pinned `_meta.md` example**:
```markdown
**Version**: 0.38.x
**Pinned to package.json**: "drizzle-orm": "^0.38.0"
**Last verified**: 2026-02-09
**Tasks implemented with this context**: T-005, T-006, T-012
```

The "Tasks implemented" field tracks which tasks depend on this context version. This is critical
for the version mismatch decision: if tasks have been implemented, don't silently update — version
the context instead.

**Source**: User requirements (context must match dev work), Context7's version-specific model.

### Finding 7: Local-First with Global Promotion

**Context**: How does context move from project-local to global?

**Analysis**: The flow:

1. **Created locally**: During project research, context files are written to `{docsRoot}/context/`. They're project artifacts — committed to git, versioned, reviewed.

2. **Validated through use**: The implementer uses context during task execution. If tasks succeed (acceptance criteria met, no build errors from stale knowledge), the context is implicitly validated.

3. **Promotion prompt**: After successful use, or when the user starts a new project with the same library, prompt: "You have validated Drizzle ORM context from [project]. Promote to global (`~/.claude/context/drizzle-orm/`) for use across projects? [Y/n]"

4. **Global storage**: `~/.claude/context/` follows the same structure. Global context is NOT committed to any project's git — it's personal knowledge.

5. **Precedence**: Project-local > Global. If both exist for the same library, project-local wins. This allows project-specific overrides (e.g., "this project uses Drizzle with a custom SQLite extension that requires different patterns").

6. **Global refresh**: When a global context file is used in a new project, check the version against the new project's Architecture doc. If the version differs, warn and offer to create a project-local override.

**Source**: Cursor's precedence model (Team > Project > User), user requirements.

**Tradeoffs**: Global promotion adds a prompt that could be annoying if triggered too often. Mitigate by only prompting once per library per project (track in `.context-manifest.md` whether promotion was offered/accepted/declined).

### Finding 8: Pass by Reference in Architecture Docs

**Context**: The user's idea of Architecture docs pointing to context files instead of inlining version-specific details.

**Analysis**: Currently, Architecture docs say things like:

```markdown
## Tech Stack
- **Database**: SQLite via better-sqlite3@11.0.0
- **ORM**: Drizzle ORM@0.38.0
- **Styling**: Tailwind CSS v4
```

With pass-by-reference, this becomes:

```markdown
## Tech Stack
- **Database**: SQLite via better-sqlite3 (see context/better-sqlite3/)
- **ORM**: Drizzle ORM (see context/drizzle-orm/)
- **Styling**: Tailwind CSS v4 (see context/tailwind-v4/)
```

The Architecture doc declares WHAT and WHY (architectural decisions). The context file declares HOW and WHICH VERSION (API details, correct patterns, current version).

**Benefits**:
- Architecture doc stays stable — library decisions don't change often
- Version updates only touch context files, not system docs (no pipeline required for a version bump)
- Specs generated from Architecture doc naturally follow context references
- Single source of truth for version numbers (context `_meta.md`)

**Risks**:
- Architecture doc becomes less self-contained — you need to follow references
- If context files are missing, the Architecture doc has less information than before
- The pipeline-protected nature of system docs doesn't extend to context files — anyone can edit context directly

**Recommendation**: Make this optional, not mandatory. Architecture docs CAN include version numbers AND reference context files. The context file is the authoritative source when both exist. Projects that don't use context files lose nothing — their Architecture doc still works exactly as before.

**Source**: User proposal, informed by llms.txt convention (index file with references to detail files).

### Finding 9: What Goes in a Context File

**Context**: The boundary between system docs and context files, and what makes a good context file.

**Analysis**: A context file captures the delta between what the LLM likely knows and what's actually true. It is NOT:
- A full API reference (too large, available online)
- A tutorial (too narrative, not actionable)
- An architectural decision (belongs in system docs)

It IS:
- **Version pinning**: "This covers Drizzle ORM 0.38.x on better-sqlite3 11.x"
- **Breaking changes**: "In v4, Tailwind replaced `tailwind.config.js` with CSS-based `@theme` directives"
- **Correct imports**: "Use `import { sqliteTable } from 'drizzle-orm/sqlite-core'` not `drizzle-orm/sqlite`"
- **Working patterns**: Tested code snippets for common operations
- **Common errors**: "If you see `ERR_REQUIRE_ESM`, react-markdown v9 is ESM-only — use dynamic import"
- **Gotchas**: "better-sqlite3 returns `{ changes, lastInsertRowid }` from `.run()`, not the row itself"

**Format per file**: Structured markdown with sections. Each section is independently useful (can be loaded alone without losing meaning):

```markdown
# Drizzle ORM: SQLite Patterns

**Applies to**: drizzle-orm 0.38.x + better-sqlite3 11.x
**Verified**: 2026-02-09

## Schema Definition

[correct syntax with code example]

## Gotchas

### Integer primary keys
[gotcha + correct pattern]

### Boolean columns
[gotcha + correct pattern]

## Common Errors

### ERR_MODULE_NOT_FOUND for sqlite-core
[error message + fix]
```

**Source**: Analysis of common LLM failures during implementation, informed by awesome-cursorrules community patterns.

### Finding 10: Integration with Init Script

**Context**: The init script creates the directory scaffold. Context needs to be part of it.

**Analysis**: Add `context/` to the `dirs` array in `scripts/init.js`. The directory starts empty — context files are created by the researcher during research/bootstrap, not by the init script.

The `.context-manifest.md` is created by the researcher when the first context file is written, similar to how `.spec-manifest.md` is created by spec-gen.

**Source**: Existing init script pattern.

---

## Options Analysis

| Criterion | Option A: Researcher Mode | Option B: Standalone Skill | Option C: Hook-Based Auto-Gen |
|-----------|--------------------------|--------------------------|------------------------------|
| **Ownership** | Researcher creates context as part of existing research workflow | New `context-manager` skill with dedicated modes | PostToolUse hook auto-generates context from build errors |
| **Human oversight** | Yes — researcher involves user in review | Yes — separate skill, separate invocation | No — automatic, may produce low-quality context |
| **Integration effort** | Moderate — new sub-capability in existing skill | High — entirely new skill with SKILL.md, references | Low — just a hook script |
| **Quality** | High — researched, validated, curated | High — dedicated focus | Low-Medium — reactive, no deep research |
| **Progressive disclosure** | Natural — researcher classifies during creation | Natural — skill classifies | Hard — auto-gen doesn't know what matters |
| **Plugin philosophy alignment** | Strong — "AI does the work, humans make the calls" | Moderate — more ceremony than needed | Weak — removes human judgment |

**Recommendation**: Option A. Context creation is a natural extension of the researcher's existing role. The researcher already does web research, produces structured output, and collaborates with the user. Adding context as another output type fits cleanly. A standalone skill would be over-engineering — context doesn't need its own triage/structure/proposal cycle. Hook-based auto-gen violates the plugin's philosophy of human judgment at every step.

---

## Recommendations

### Primary Recommendation

Add context file management as a new capability within the doc-researcher skill, with a standard loading protocol consumed by all skills.

**Implementation approach**:

1. **New `context` mode** for doc-researcher: `/doc-researcher context [library]`
   - Gate: system docs must exist (specifically an Architecture doc with tech stack). Cannot create
     context without knowing what libraries the project uses.
   - Reads Architecture doc for tech stack
   - For each library: web search official docs + context7.com website → distill into context files
   - Classify content with freeform category tags for progressive disclosure (aim for consistency
     across libraries but don't enforce a rigid taxonomy — different library types need different
     categories)
   - Present to user for review
   - Write to `{docsRoot}/context/[library]/`
   - Manual invocation: `/doc-researcher context drizzle-orm` to create/refresh a specific library

2. **Auto-offer during bootstrap**: When bootstrapping a new project, after generating Architecture
   doc, automatically offer to create context files for the declared tech stack: "Your Architecture
   doc references [N] libraries. Want me to research current docs and create context files? This
   helps avoid stale API knowledge during implementation." User can accept, decline, or select
   specific libraries.

3. **Loading protocol in all skills**: Read `.context-manifest.md` → match relevant libraries → load `_meta.md` → load category-matched detail files.

4. **Implementer integration**:
   - Start mode: pre-check context version against `package.json` / Architecture doc versions
   - Run mode Step 3c: load relevant context before implementing each task. Record which tasks
     use which context version in `_meta.md` ("Tasks implemented with this context").
   - Run mode Step 4/5: on failure, classify as code bug vs. context gap → feedback to researcher.
     Context updates respect version pinning — don't update if tasks already depend on current
     context. Version the context instead.

5. **Spec-gen validation**: Before generating specs, verify context files exist and are current for all libraries in the tech stack.

6. **Init script**: Add `context/` to the directory scaffold.

7. **Pass by reference**: Optional — Architecture docs can reference context files. Not mandatory.

8. **Global promotion**: Prompt user after successful implementation to promote validated context to `~/.claude/context/`.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Context files themselves become stale | Medium | High — defeats the purpose | Version-pinned staleness: context matches dev work, not calendar. 1-week soft check for errata within current version. Version mismatch triggers explicit update/versioning decision. |
| Over-loading context (too many files per task) | Low | Medium — token waste | Three-layer disclosure limits loading to what's relevant |
| Under-loading context (missing relevant files) | Medium | Medium — build errors still occur | Category tagging + fallback: if a build fails, check if un-loaded context files exist for the failing library |
| Web research produces inaccurate context | Low | High — wrong context is worse than no context | User reviews all context files before they're written. Verification marker in `_meta.md` |
| Global context conflicts with project needs | Low | Low — project-local takes precedence | Precedence rule: local > global. Override is always possible |

### Impact on Plugin Artifacts

| Artifact | Expected Changes |
|----------|-----------------|
| `skills/doc-researcher/SKILL.md` | Add context mode to mode detection, description, argument-hint |
| `skills/doc-researcher/references/` | New `context-mode.md` reference file |
| `skills/implementer/references/start-mode.md` | Add context staleness pre-check |
| `skills/implementer/references/run-mode.md` | Add context loading to Step 3c, context gap classification to Step 4/5 |
| `skills/doc-spec-gen/SKILL.md` | Add context validation before spec generation |
| `docs/pipeline-concepts.md` | New "Context Files" section documenting the concept |
| `scripts/init.js` | Add `context/` to dirs array |
| `README.md` | Add context to directory structure, mention in relevant sections |
| `docs/research/DOC_PIPELINE_PLUGIN.md` | Design Decision #13 |
| (new) `docs/doc-researcher.md` | Document the context mode |

---

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Who creates context? | Researcher / Standalone skill / Auto-gen hook | Researcher | Natural extension of existing research workflow. Maintains human oversight. Avoids over-engineering. |
| 2 | MCP or files? | Context7 MCP / Plain markdown files | Plain markdown files | MCP bloats context window every session. Files are fetched once during research, loaded selectively during implementation. Aligns with "files hold the truth" philosophy. |
| 3 | Context7 usage | MCP integration / Website as research source | Website as research source | Fetch via WebSearch/WebFetch during research. Distill into curated context files. No persistent MCP connection. |
| 4 | Storage model | Global only / Local only / Local-first with promotion | Local-first with promotion | Project context is a project artifact (committed to git). Promote to global when validated. Local always takes precedence. |
| 5 | Progressive disclosure | Load all / Tag-based / Three-layer | Three-layer (manifest → meta → detail) | Proven pattern across Claude Code skills, Cursor rules, MCP meta-tools. Minimal overhead (1-2 extra reads), significant context savings. |
| 6 | Architecture doc integration | Inline versions / Pass by reference / Both optional | Both optional | Pass by reference is cleaner but not mandatory. Projects can use either style. Context file is authoritative when both exist. |
| 7 | Scope | Implementer only / Plugin-wide | Plugin-wide | All skills benefit from accurate library knowledge. Researcher creates, all consume. |
| 8 | Context creation trigger | Auto-offer only / Manual only / Both | Both | Auto-offer during bootstrap (after Architecture doc generated). Manual via `/doc-researcher context [library]`. Gate: system docs must exist — can't create context without knowing the tech stack. |
| 9 | Category tag granularity | Strict standard set / Freeform / Freeform with conventions | Freeform with conventions | Library-dependent — an ORM needs different categories than a UI framework. Aim for consistency across similar library types but don't enforce rigid taxonomy. |
| 10 | Staleness model | Time-based (90 days) / Version-pinned / Hybrid | Version-pinned with 1-week soft check | Context is stale when version mismatches, not when time passes. 1-week soft check catches errata within current version. Never update context if dev work already depends on it — version it instead. |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Context file templates per library type | Different library types (ORM, UI framework, build tool) have different knowledge structures. Template per type could standardize context quality. | Defer — start with freeform, extract patterns after creating 5-10 context files. |
| Community context sharing | If context files are plain markdown with a standard structure, they could be shared across teams/projects (like awesome-cursorrules). | Defer — build the mechanism first, sharing is a V2 concern. |
| Context-aware dependency installation | The researcher knows the correct version (from context files). Could generate a verified `package.json` snippet during spec generation. | Scope into this research if it fits, or defer to separate research. |

## Open Questions

All resolved in Round 2.

### Resolved

1. **Should the researcher auto-trigger context creation during bootstrap?**
   **Decision**: Both. Auto-offer during bootstrap after Architecture doc is generated. Also
   available as manual command `/doc-researcher context [library]`. Gate: system docs must exist
   (specifically Architecture doc with tech stack). Can't create context without knowing what
   libraries the project uses.

2. **How granular should category tags be?**
   **Decision**: Freeform, library-dependent. An ORM needs categories like "schema", "migration",
   "queries". A UI framework needs "components", "theming", "responsive". Aim for consistency
   across similar library types but don't enforce a rigid taxonomy. The researcher uses judgment
   based on the library's domain.

3. **What's the right staleness threshold?**
   **Decision**: Version-pinned, not time-based. Context is stale when the version in use changes,
   not when a calendar threshold passes. 1-week soft check for errata/patches within the current
   version range. Critical rule: never update context if dev work already depends on it — version
   the context instead. Track which tasks were implemented using which context version.

## References

- [Context7 REST API Guide](https://context7.com/docs/api-guide) — Direct API access for library docs
- [Context7 Architecture (Upstash Blog)](https://upstash.com/blog/new-context7) — Token reduction through reranking
- [Cursor Rules Reference](https://github.com/sanjeed5/awesome-cursor-rules-mdc) — `.mdc` file format, four activation types
- [llms.txt Specification](https://llmstxt.org/) — Convention for LLM-friendly documentation
- [AGENTS.md Standard](https://agents.md/) — Emerging agent context file standard
- [Progressive Disclosure for AI Agents](https://www.honra.ai/articles/progressive-disclosure-for-ai-agents) — Three-layer architecture
- [MCP Meta-Tool Pattern (SynapticLabs)](https://blog.synapticlabs.ai/bounded-context-packs-meta-tool-pattern) — 96% token reduction via progressive disclosure
- [Chunking Strategies for RAG (Weaviate)](https://weaviate.io/blog/chunking-strategies-for-rag) — Semantic chunking preserving meaning
- [awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules) — Community-curated framework context files
- [rulebook-ai](https://github.com/botingw/rulebook-ai) — Universal rule deployment across editors
