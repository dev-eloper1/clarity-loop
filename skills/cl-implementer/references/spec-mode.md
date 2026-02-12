## Spec Generation Mode

Reference for the `cl-implementer spec` mode. Generates structured, implementation-ready
specs from verified system documentation. This is the bridge between documentation and
implementation — the final derivation step before tasks can be generated.

### Critical Principle: Waterfall Gate

**Specs are generated ONLY after ALL system docs are complete and verified.** This is
intentionally NOT iterative. The reasoning:

1. If you generate specs from partially-complete docs, later doc changes require spec merging
2. Spec merging across features/tasks is extremely messy — conflicts, stale references
3. The whole point of the doc pipeline is to get docs to a stable, verified state FIRST
4. Once docs are stable, spec generation is a one-shot derivation

If system docs change later (new research cycle), specs should be regenerated from scratch,
not patched.

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
   `/cl-reviewer verify` first to ensure system docs are consistent."

4. **Check context freshness** — If `{docsRoot}/context/.context-manifest.md` exists,
   check version alignment and freshness dates for all libraries. If any context is stale
   (version mismatch with `package.json` or past freshness threshold), warn: "Context for
   [library] may be stale. Specs generated with stale context may produce implementation
   issues. Run `/cl-researcher context [library]` to update, or continue anyway?"
   If no context exists but system docs reference a tech stack, note (advisory only):
   "No context files found. Context files improve implementation accuracy. Consider
   running `/cl-researcher context` before or after spec generation."

If all clear, proceed. If warnings were issued and the user confirms, proceed with a note
in the spec manifest about the caveat.

### Step 2: Read All System Docs

This is a heavy read — dispatch subagents in parallel to avoid context pressure:

1. Read `{docsRoot}/system/.manifest.md` for the overall structure
2. Dispatch subagents in parallel, one per system doc. Each subagent produces:
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

For each significant concept in the system docs, generate a spec file in `{docsRoot}/specs/`.

Every spec must include:
- **Source reference**: Which system doc section(s) it derives from
- **Concrete types**: No ambiguity — "UUID v4", not "a string"
- **Edge cases**: Enumerated, not implied
- **Dependencies**: Which other specs this one references
- **Implementability**: Each spec should be implementable in isolation (bounded context)

### Step 5: Generate Spec Manifest

Create `{docsRoot}/specs/.spec-manifest.md`:

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
1. Update `{docsRoot}/STATUS.md` — set "Specs generated" to "Yes" with date
2. Tell the user: "Specs generated in `{docsRoot}/specs/`. Run `/cl-implementer spec-review`
   for a cross-spec consistency check before starting implementation."

### Guidance

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

- **Use subagent dispatch for heavy reads.** Step 2 dispatches one subagent per system doc
  to avoid overloading the main context. This provides the same isolation as a context fork
  without requiring the entire skill to run in a forked context.
