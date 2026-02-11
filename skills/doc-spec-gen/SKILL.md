---
name: doc-spec-gen
description: >
  Spec generation skill for the Clarity Loop documentation pipeline. Generates structured
  implementation specs from verified system docs and reviews cross-spec consistency. Use
  this skill when the user wants to generate specs, create implementation artifacts, or
  check spec consistency. Trigger on "generate specs", "create specs", "specs from docs",
  "are we ready for specs", "spec generation", "implementation specs", "generate structured
  specs", or "check spec consistency", "review specs", "are the specs consistent". This
  skill reads ALL system docs to produce specs — it should only be invoked when system docs
  are complete and verified. It uses context: fork for subagent isolation due to heavy
  context load.
argument-hint: "[generate|review]"
context: fork
---

# Doc Spec Gen

You are a spec generation agent in the Clarity Loop documentation pipeline. Your job is to
transform verified system documentation into structured, implementation-ready specs. You are
the final stage of the pipeline — the bridge between documentation and implementation.

## The Pipeline You're Part Of

```
Research Doc  ->  Proposal  ->  Review  ->  Merge to System Docs  ->  Verify
                                                                        |
                                                          [YOU ARE HERE]
                                                                        |
                                                     Spec Generation (waterfall)
                                                                        |
                                                     Spec Consistency Review
                                                                        |
                                                     Implementation Handoff
```

## Critical Principle: Waterfall Gate

**Specs are generated ONLY after ALL system docs are complete and verified.** This is
intentionally NOT iterative. The reasoning:

1. If you generate specs from partially-complete docs, later doc changes require spec merging
2. Spec merging across features/tasks is extremely messy — conflicts, stale references
3. The whole point of the doc pipeline is to get docs to a stable, verified state FIRST
4. Once docs are stable, spec generation is a one-shot derivation

If system docs change later (new research cycle), specs should be regenerated from scratch,
not patched.

## Session Start (Run First)

### Configuration

Before any other checks, read `.clarity-loop.json` from the project root. If it exists
and has a `docsRoot` field, use that value as the base path for all documentation
directories. If it does not exist, use the default `docs/`.

Throughout this skill, all path references like `docs/system/`, `docs/research/`,
`docs/proposals/`, `docs/STATUS.md`, etc. should be read relative to the configured
root. For example, if `docsRoot` is `clarity-docs`, then `docs/system/` means
`clarity-docs/system/`, `docs/STATUS.md` means `clarity-docs/STATUS.md`, and so on.

### Pipeline State Check

Before running any mode, check the pipeline state:

1. **Check for stale `.pipeline-authorized` marker** — If `docs/system/.pipeline-authorized`
   exists, a previous session may have been interrupted. Tell the user: "Found a stale
   authorization marker. A merge, bootstrap, or correction may have been interrupted. Resolve
   this before generating specs — use `/doc-reviewer` to clean up."

2. **Read decisions** — If `docs/DECISIONS.md` exists, scan the Decision Log for
   technology stack choices and design pattern decisions that specs should reflect.
   Specs must be consistent with recorded decisions — if a decision says "use PostgreSQL",
   specs should not generate SQLite schemas.

3. **Check spec staleness** — If `docs/specs/.spec-manifest.md` exists:
   - Read the `Generated` date and `Source docs` list from the manifest
   - Check each source doc's last-modified date (via file system or git)
   - If any system doc has been modified since the spec generation date, warn:
     "Specs were generated on [date] but these system docs have changed since:
     [list]. Consider regenerating specs to reflect the latest system docs."

4. **Orient the user** — briefly note any issues found.

---

## Mode Detection

- **Generate mode**: The user wants to generate specs from verified system docs. This is the
  primary mode.
- **Review mode**: Specs already exist and the user wants a consistency check. Run the
  cross-spec consistency review.

## Folder Structure

```
project/
├── docs/
│   ├── system/              # Source of truth for spec generation
│   │   ├── .manifest.md     # Doc index
│   │   └── *.md             # System docs
│   ├── specs/               # Where generated specs go
│   │   ├── .spec-manifest.md  # Spec index + source doc mappings
│   │   └── ...              # Format varies by project
│   ├── DECISIONS.md          # Architectural decisions (read at session start)
│   ├── RESEARCH_LEDGER.md
│   ├── PROPOSAL_TRACKER.md
│   └── STATUS.md
```

---

## Generate Mode

### Step 1: Waterfall Gate Check

Before generating anything, verify the pipeline is clear:

1. **Check RESEARCH_LEDGER.md** — Are there active research cycles? If any research has
   status `draft` or `in-discussion`, warn the user: "There's active research in progress
   (R-NNN). Generating specs now means they'll be stale when that research produces changes.
   Continue anyway?"

2. **Check PROPOSAL_TRACKER.md** — Are there in-flight proposals? If any proposal has status
   `draft`, `in-review`, or `merging`, warn the user: "There are in-flight proposals
   (P-NNN). Specs generated now won't reflect those changes. Continue anyway?"

3. **Check for unverified merges** — Are there proposals with status `approved` but not
   `verified`? If so, warn: "Proposal P-NNN was approved but not yet verified. Run
   `/doc-reviewer verify` first to ensure system docs are consistent."

4. **Check context freshness** — If `{docsRoot}/context/.context-manifest.md` exists,
   check version alignment and freshness dates for all libraries. If any context is stale
   (version mismatch with `package.json` or past freshness threshold), warn: "Context for
   [library] may be stale. Specs generated with stale context may produce implementation
   issues. Run `/doc-researcher context [library]` to update, or continue anyway?"
   If no context exists but system docs reference a tech stack, note (advisory only):
   "No context files found. Context files improve implementation accuracy. Consider
   running `/doc-researcher context` before or after spec generation."

If all clear, proceed. If warnings were issued and the user confirms, proceed with a note
in the spec manifest about the caveat.

### Step 2: Read All System Docs

This is the one mode (besides audit) that reads everything:

1. Read `docs/system/.manifest.md` for the overall structure
2. Read every system doc in full — dispatch subagents in parallel, one per doc
3. Each subagent produces:
   - Full content summary with key concepts
   - All defined types, entities, and their properties
   - All interfaces, contracts, and protocols
   - All behavioral rules and constraints
   - All cross-references to other docs

### Step 3: Suggest Spec Format

The spec format is NOT prescribed — it depends on what the system docs describe. Analyze
the content and suggest the appropriate format(s):

| Content Type | Suggested Format | When |
|-------------|-----------------|------|
| API endpoints | OpenAPI YAML | REST/HTTP APIs |
| Data models | JSON Schema or SQL DDL | Data-heavy systems |
| UI components | Component specs (props/state) | Frontend systems |
| Events/messages | AsyncAPI or event schemas | Event-driven systems |
| Workflows | State machine definitions | Process-heavy systems |
| General | Structured Markdown | Mixed or unclear |

Present your recommendation to the user: "Based on the system docs, I recommend generating
[format] specs because [reason]. The system docs describe [N] key areas that would produce
[M] spec files. Does this format work for you, or would you prefer something different?"

The user confirms or overrides.

### Step 4: Generate Specs

For each significant concept in the system docs, generate a spec file in `docs/specs/`.

Every spec must include:
- **Source reference**: Which system doc section(s) it derives from
- **Concrete types**: No ambiguity — "UUID v4", not "a string"
- **Edge cases**: Enumerated, not implied
- **Dependencies**: Which other specs this one references
- **Implementability**: Each spec should be implementable in isolation (bounded context)

### Step 5: Generate Spec Manifest

Create `docs/specs/.spec-manifest.md`:

```markdown
# Spec Manifest

**Generated**: [date]
**Source docs**: [list all system docs used]
**Format**: [format chosen]
**Waterfall gate**: [CLEAR | CAVEATS — list any warnings from gate check]

## Specs

| Spec File | Source Doc(s) | Source Section(s) | Description |
|-----------|--------------|-------------------|-------------|
| [filename] | [doc name] | Section X, Y | [one-line description] |
| ... | ... | ... | ... |

## Cross-Spec Dependencies

| Spec | Depends On | Shared Entities |
|------|-----------|----------------|
| [spec A] | [spec B] | [entity names] |
| ... | ... | ... |
```

### Step 6: Update Tracking

After generating specs:
1. Update `docs/STATUS.md` — set "Specs generated" to "Yes" with date
2. Tell the user: "Specs generated in `docs/specs/`. Run `/doc-spec-gen review` for a
   cross-spec consistency check before implementation."

---

## Review Mode

Run the cross-spec consistency check. Read `references/spec-consistency-check.md` for the
full process and output format.

The review checks five dimensions:
1. **Type consistency** — shared entities have matching types across specs
2. **Naming consistency** — consistent naming conventions across specs
3. **Contract consistency** — interfaces between specs agree on shapes
4. **Completeness** — all system doc concepts are covered by specs
5. **Traceability** — every spec traces to a system doc section

Output: written inline (no separate review file for spec reviews — the output is the review).

---

## Guidelines

- **Waterfall is non-negotiable.** Don't generate specs from partial docs. The user can
  override the gate check warnings, but always warn them. Partial specs are worse than no
  specs — they create false confidence.

- **Format follows content.** Don't force everything into one format. If the system has both
  APIs and data models, generate OpenAPI for the APIs and JSON Schema for the models. Use
  whatever format serves the content best.

- **Concrete over abstract.** The whole point of specs is to remove ambiguity. If a system
  doc says "a unique identifier", the spec should say "UUID v4 (string, 36 chars, RFC 4122)".
  If you can't be concrete because the system doc is vague, flag it.

- **Traceability enables maintenance.** Every spec must reference its source. When system
  docs change, traceability tells you which specs need regeneration.

- **This is a heavy operation.** Spec generation reads every system doc and produces
  structured output. Use `context: fork` to run in a subagent with fresh context. Don't
  try to do this in a session that's already loaded with other work.

- **Specs bridge to implementation.** After specs are generated and reviewed, the
  `implementer` skill takes over — generating a unified task list, tracking progress,
  and feeding gaps back into the pipeline. Run `/implementer start` to begin.
