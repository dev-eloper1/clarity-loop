## Context Mode

Creates and maintains per-library context files — curated knowledge that bridges the gap
between LLM training data and current library reality. Context files use a three-layer
progressive disclosure model and are consumed by all skills through a standard loading
protocol.

---

### Entry Points

1. **Manual**: `/doc-researcher context [library]` — create or refresh context for a
   specific library, or all libraries if no argument given.

2. **Auto-offer during bootstrap**: After generating the Architecture doc (or equivalent
   with a tech stack section), automatically offer: "Your Architecture doc references [N]
   libraries. Want me to research current docs and create context files? This helps avoid
   stale API knowledge during implementation." User can accept all, select specific
   libraries, or decline.

3. **Feedback from implementer**: When the implementer classifies a build error as
   `context-gap`, it prompts the user to invoke context mode for the affected library.

### Gate

System docs must exist — specifically an Architecture doc (or equivalent) with a tech stack
section. Cannot create context without knowing what libraries the project uses. If no system
docs exist: "No system docs found. Run `/doc-researcher bootstrap` first — context files
are derived from the tech stack in your Architecture doc."

---

### Step 1: Identify Libraries

Read the Architecture doc (or equivalent) for the tech stack section. Extract:
- Library/framework names
- Version constraints (from Architecture doc or `package.json` / equivalent)
- Usage context (e.g., "SQLite via better-sqlite3" tells you the adapter matters)

If `{docsRoot}/context/.context-manifest.md` already exists, compare against it:
- **New libraries** (in Architecture, not in manifest): flag for creation
- **Removed libraries** (in manifest, not in Architecture): flag for cleanup
- **Version mismatches** (Architecture says v4, manifest says v3): flag for update

Present to user: "Your tech stack includes [N] libraries. Context status:
- [library A] v[X]: No context exists — create?
- [library B] v[Y]: Context exists, version matches — skip or refresh?
- [library C] v[Z]: Context exists but covers v[old] — update needed?
Select which to process, or 'all' for everything."

---

### Step 2: Research Each Library

For each library the user selected:

1. **Web search official docs**: `WebSearch` for "[library] [version] documentation",
   "[library] [version] migration guide", "[library] [version] changelog"

2. **Fetch official doc pages**: `WebFetch` for the API reference, getting started guide,
   and any migration/upgrade guide. Focus on:
   - Import paths (these change between major versions)
   - Configuration format (e.g., Tailwind v4 switched from JS to CSS)
   - Breaking changes from previous major version
   - Common gotchas and error messages

3. **Optionally search context7.com**: `WebSearch` for "site:context7.com [library]" to
   find their LLM-friendly documentation. If available, `WebFetch` the page. Context7
   pre-processes library docs into a concise, LLM-friendly format — use this as a
   supplement to official docs, not a replacement.

   **Important**: Use context7 as a **website** (WebSearch/WebFetch), NOT as an MCP. The
   MCP dumps large amounts of content into the session context. The website lets you fetch
   once and distill into curated files.

4. **Check for breaking changes and errata**: `WebSearch` for "[library] [version] breaking
   changes", "[library] [version] known issues"

5. **Read existing codebase** (if code exists): Check `package.json` (or equivalent) for
   the actual installed version. Look at how the library is currently used in the code —
   this tells you which APIs matter most.

### What to Keep vs. Discard

**Keep** (the delta — what the LLM likely gets wrong):
- Version pinning: exact version range this context covers
- Breaking changes from previous versions
- Correct import paths (these change frequently)
- Working patterns: tested code snippets for common operations
- Common errors: error messages and their fixes
- Gotchas: non-obvious behavior the LLM would miss
- Configuration format: if it changed between versions

**Discard**:
- Full API reference (too large, available online)
- Tutorials (too narrative, not actionable)
- Marketing copy
- Exhaustive type definitions (just cover the commonly-used ones)
- History/changelog (just the breaking changes for the relevant version)

---

### Step 3: Present to User for Review

Before writing any files, present the distilled context to the user:

"Here's what I found for [library] [version]:

**Breaking changes**: [list]
**Key gotchas**: [list]
**Correct import paths**: [list]
**File plan**: I'll create [N] files:
  - `overview.md` — key patterns and gotchas
  - `[topic].md` — [description]
  - `[topic].md` — [description]

Does this look right? Anything to add or remove?"

Incorporate user feedback before writing.

---

### Step 4: Write Context Files

#### File Structure

```
{docsRoot}/context/
  .context-manifest.md               # Layer 1: index of all libraries
  {library-name}/
    _meta.md                         # Layer 2: overview + file inventory
    overview.md                      # Key patterns, gotchas, breaking changes
    {topic}.md                       # Specific topic files
    {topic}.md
```

Use kebab-case for library folder names. Include the major version if the library has
fundamentally different APIs across versions (e.g., `tailwind-v4/` not `tailwind/` if v3
and v4 are radically different).

#### `.context-manifest.md` (Layer 1)

This is the index file — loaded by every skill at task start to know what context exists.
Keep it minimal (~50 tokens per library).

```markdown
# Context Manifest

**Last updated**: [date]

## Libraries

| Library | Version | Path | Tags | Last Verified |
|---------|---------|------|------|---------------|
| Drizzle ORM | 0.38.x | drizzle-orm/ | database, orm, sqlite | 2026-02-09 |
| Tailwind CSS | 4.x | tailwind-v4/ | styling, css, theme | 2026-02-09 |
| Next.js | 14.x | nextjs-14/ | framework, react, ssr | 2026-02-09 |
```

#### `_meta.md` (Layer 2)

Per-library overview. Loaded when a skill determines this library is relevant to the
current task. Contains both human-readable context and machine-readable file inventory.

```markdown
# [Library Name]

**Version**: [version range, e.g., 0.38.x]
**Pinned to**: [dependency file field, e.g., "drizzle-orm": "^0.38.0" in package.json]
**Last verified**: [date]
**Sources**: [URLs used during research]
**Tags**: [freeform, comma-separated]
**Freshness threshold**: [default: 7 days — override per library if needed]

## Overview

[2-4 paragraph summary: what the LLM gets wrong about this library at this version.
Key breaking changes, critical gotchas, correct patterns. This section alone should
prevent the most common errors.]

## Tasks Implemented With This Context

[Populated by the implementer as tasks are completed. Format:]

| Task | Date | Notes |
|------|------|-------|
| T-005 | 2026-02-10 | Database schema creation |
| T-006 | 2026-02-10 | Migration setup |

## Files

| File | Tags | Load When |
|------|------|-----------|
| overview.md | core | Any task using this library |
| sqlite-patterns.md | sqlite, database | SQLite-specific implementation |
| migration-guide.md | migration | Creating or running migrations |
```

**Tags are freeform and library-dependent.** An ORM needs tags like `schema`, `migration`,
`queries`. A UI framework needs `components`, `theming`, `responsive`. Aim for consistency
across similar library types but don't enforce a rigid taxonomy. The researcher uses
judgment based on the library's domain.

#### Detail Files (Layer 3)

Each detail file follows this format:

```markdown
# [Library]: [Topic]

**Applies to**: [library] [version range]
**Verified**: [date]

## [Section]

[Content — correct patterns, code examples, gotchas]

## [Section]

[Content]

## Common Errors

### [Error message or pattern]
[Cause + fix]
```

Each section should be independently useful — loadable alone without losing meaning. This
enables the loading protocol to pull just the sections relevant to the current task.

---

### Step 5: Update Manifest and Tracking

After writing all context files:

1. **Create or update `.context-manifest.md`** — add/update entries for each library
   processed.

2. **Update `docs/STATUS.md`** — if a "Context" section exists in the pipeline state,
   update it. If not, this is a net-new artifact type that doesn't need STATUS tracking
   (context files are project artifacts, not pipeline tracking artifacts).

3. **Report to user**: "Context files created for [N] libraries in `{docsRoot}/context/`.
   These will be loaded automatically during spec generation and implementation."

---

### Updating Existing Context

When invoked for a library that already has context files:

1. **Check version**: Does `_meta.md` version match `package.json`?
   - **Same version**: This is a freshness refresh. Update content in place. Verify
     against official docs. Update `Last verified` date.
   - **New version, no tasks depend on current context**: Update content in place. Update
     version in `_meta.md` and manifest.
   - **New version, tasks depend on current context**: Version the context. Keep the
     existing folder (rename to include version if needed, e.g., `drizzle-orm-0.38/`).
     Create a new folder for the new version. Update manifest to point to the new folder.
     Log: "Context versioned: [old] preserved for existing tasks, [new] created for
     future tasks."

2. **Re-research**: Follow Step 2 with the updated version. Focus on what changed between
   the old and new versions.

3. **Present changes to user**: Show a diff summary — "Here's what changed in the context
   for [library] between [old version] and [new version]: [changes]."

---

### Standard Loading Protocol

All skills follow this protocol to consume context files. This section is the canonical
reference — skills link here rather than duplicating the logic.

```
1. Read {docsRoot}/context/.context-manifest.md (Layer 1)
   → Know what libraries have context, their versions and tags
   → If manifest doesn't exist: no context available, proceed without

2. Determine relevant libraries for current task:
   - Implementer: task → spec reference → libraries mentioned in spec + task description
   - Spec-gen: all libraries in Architecture doc tech stack
   - UI-designer: styling/component libraries from Architecture doc
   - Researcher: libraries relevant to research topic

3. For each relevant library:
   a. Read _meta.md (Layer 2) — overview + file inventory
   b. Match task context against file tags in the inventory:
      - Task mentions "database schema" → match files tagged "schema", "database"
      - Task mentions "migration" → match files tagged "migration"
      - When in doubt, load the "core" tagged files
   c. Load matching detail files (Layer 3)
   d. If no specific match, load overview.md (always safe)

4. Inject loaded context into the working prompt:
   - After spec reference content
   - Before implementation/generation begins
   - Format: "## Library Context: [name] [version]\n[content]"
```

**Token budget guidance**: Layer 1 is ~50 tokens per library. Layer 2 is ~500-2000 tokens.
Layer 3 files vary but are typically 500-3000 tokens each. For a task touching 2 libraries
with 1-2 detail files each, expect ~2000-6000 tokens of context. This is modest compared
to spec content already being loaded.

---

### Version-Pinned Staleness Model

Context staleness is version-based, not time-based. A context file for Drizzle 0.38.x is
valid as long as the project uses 0.38.x, whether the file is 1 day or 6 months old.

#### Three Staleness Signals (in order of severity)

1. **Freshness check (soft, configurable)**
   - Default: 7 days (configurable per library in `_meta.md` via `Freshness threshold`)
   - What it means: "Verify this is still accurate for the version in use"
   - Action: Quick web check for errata, security patches, minor updates within the
     version range. NOT a full re-research.
   - Who triggers: implementer start mode (pre-check), doc-spec-gen (gate check)

2. **Version mismatch (hard)**
   - The version in `package.json` (or equivalent) doesn't match `_meta.md`
   - What it means: The project upgraded but context wasn't updated
   - Action: Version the context (if tasks depend on it) or update in place (if no tasks
     depend on it). User decides.
   - Who triggers: implementer start mode, doc-spec-gen gate check, manual invocation

3. **Failure-based (strongest)**
   - Implementation fails with an error traced to a library API mismatch
   - What it means: Something in the context is definitely wrong
   - Action: Flag as `context-gap`, prompt user to invoke context mode
   - Who triggers: implementer run mode (Step 4 classification)

#### The Version Pinning Rule

**Never silently update context if tasks have been implemented using it.** The `_meta.md`
"Tasks Implemented With This Context" section tracks this. If tasks T-005 through T-012
were implemented with Drizzle 0.38 context, updating that context to 0.39 would make the
existing code inconsistent with the new context. Instead: version the context (keep old,
create new).

---

### Local-First with Global Promotion

Context files live in two locations:

| Location | Purpose | Git | Precedence |
|----------|---------|-----|-----------|
| `{docsRoot}/context/` | Project-local | Committed | Higher (wins) |
| `~/.claude/context/` | Global (personal) | Not committed | Lower (fallback) |

**Creation**: Always local. Context is created in `{docsRoot}/context/` as a project
artifact.

**Promotion**: After successful implementation using context (tasks pass acceptance
criteria, no `context-gap` errors), prompt the user once per library per project:
"You've successfully used [library] context in this project. Promote to global
(`~/.claude/context/[library]/`) for use across projects? [Y/n]"

Track whether promotion was offered/accepted/declined in `.context-manifest.md` to avoid
re-prompting.

**Precedence**: Project-local always wins. If both `{docsRoot}/context/drizzle-orm/` and
`~/.claude/context/drizzle-orm/` exist, the project-local version is used. This allows
project-specific overrides.

**Global refresh**: When a global context file is used in a new project, check its version
against the new project's tech stack. If the version differs: "Global context for [library]
covers v[X] but this project uses v[Y]. Create a project-local override? [Y/n]"

---

### Pass by Reference (Optional)

Architecture docs can optionally reference context files instead of inlining version-specific
details:

**Before** (version details inline):
```markdown
## Tech Stack
- **ORM**: Drizzle ORM@0.38.0
```

**After** (pass by reference):
```markdown
## Tech Stack
- **ORM**: Drizzle ORM (see context/drizzle-orm/ for version details and API patterns)
```

This is optional — not mandatory. Architecture docs can use either style, or both. When
both an inline version and a context file reference exist, the context file is the
authoritative source for version and API details.

**Benefit**: Version updates only touch context files, not system docs. No pipeline cycle
needed for a version bump.

**Risk**: Architecture doc becomes less self-contained. Mitigate by keeping the library
name in the Architecture doc (just not the version-specific details).
