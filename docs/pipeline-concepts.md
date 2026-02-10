# Pipeline Concepts

Core concepts that underpin how Clarity Loop manages documentation. Understanding these helps you work with (not against) the pipeline.

---

## Pipeline Depth

Not every change needs the full pipeline. Triage determines the right level of ceremony.

| Level | When | What Happens |
|-------|------|-------------|
| **L0 — Trivial** | Typo, config tweak, formatting fix | Direct edit, no pipeline |
| **L1 — Contained** | Single feature, clear scope, 1-2 doc impact | Lightweight research note → system doc update |
| **L2 — Complex** | Cross-cutting, multi-doc impact, unclear scope | Full pipeline: research → structure → proposal → review → merge → verify |
| **L3 — Exploratory** | Unclear idea, needs discovery, multiple approaches | Extended research with multiple discussion rounds, then full pipeline |

The [doc-researcher triage](doc-researcher.md#triage) evaluates complexity based on doc impact, clarity, novelty, and cross-cutting concerns.

---

## System Doc Protection

Files in `{docsRoot}/system/` are protected. A `PreToolUse` [hook](hooks.md#protect-system-docs) blocks all direct `Edit` and `Write` operations to this directory.

### Why Protected?

System docs are the source of truth for your project. Unreviewed changes can introduce contradictions, terminology drift, and silent inconsistencies that compound over time. The protection ensures every change goes through a review gate.

### Three Authorized Operations

Only three pipeline operations can write to system docs, each creating a temporary `.pipeline-authorized` marker:

| Operation | When | Used By |
|-----------|------|---------|
| `bootstrap` | Initial doc creation | [doc-researcher bootstrap](doc-researcher.md#bootstrap) |
| `merge` | Applying approved proposals | [doc-reviewer merge](doc-reviewer.md#merge) |
| `correct` | Targeted fixes from audit/review | [doc-reviewer correct](doc-reviewer.md#correct) |

The marker is created before edits and removed immediately after. If a skill finds a stale marker on startup (from an interrupted operation), it helps clean up.

### Exempt Files

Two files in `{docsRoot}/system/` are always writable:
- `.manifest.md` — auto-generated index (see below)
- `.pipeline-authorized` — the marker itself

---

## Manifest-Based Context Loading

Instead of reading every system doc to orient, skills read `{docsRoot}/system/.manifest.md` — a lightweight auto-generated index.

### What's in the Manifest

| Section | Content |
|---------|---------|
| **Documents table** | File path, line count, section count, last modified |
| **Section index** | Per file: every `##` heading with line ranges |
| **Cross-references** | Which docs reference which other docs |
| **Content hash** | SHA-256 hash for staleness detection |

### How It's Used

Skills read the manifest first, then do targeted reads of only the sections they need. This is significantly faster than reading every system doc in full, especially as the doc set grows.

### Auto-Regeneration

The manifest regenerates automatically via the [generate-manifest hook](hooks.md#generate-manifest) whenever any system doc is edited. The [init script](hooks.md#init-script) generates the initial manifest.

---

## Tracking Files

Three files in `{docsRoot}/` track pipeline state. They're the dashboard for understanding where everything stands.

### RESEARCH_LEDGER.md

Tracks all research cycles.

| Column | Values |
|--------|--------|
| ID | R-001, R-002, ... |
| Topic | Research subject |
| Type | `evolutionary` · `net-new` · `hybrid` |
| Status | `draft` · `in-discussion` · `approved` · `superseded` |
| Complexity | `L0-trivial` · `L1-contained` · `L2-complex` · `L3-exploratory` |
| Open Questions | Count of unresolved questions |
| Discussion Rounds | Number of conversation rounds |

Three sections: **Active** (in progress), **Completed** (led to merged proposals), **Abandoned** (dropped with reason).

### PROPOSAL_TRACKER.md

Tracks all proposals through the review lifecycle.

| Column | Values |
|--------|--------|
| ID | P-001, P-002, ... |
| Title | Proposal subject |
| Research | Reference to source research doc |
| Status | `draft` · `in-review` · `approved` · `merging` · `verified` |
| Review Round | Current review iteration (v1, v2, ...) |
| Conflicts | Other proposals touching same sections |

Three sections: **In-Flight** (active), **Merged** (applied to system docs), **Rejected** (with reason).

### STATUS.md

High-level pipeline dashboard.

| Section | Content |
|---------|---------|
| **Pipeline State** | Active research count, in-flight proposals, merged count, system doc count, last audit date, specs status |
| **Research Queue** | Recommended research order with priorities and dependencies |
| **Emerged Concepts** | Parking lot for ideas (see below) |

---

## Emerged Concepts

During any pipeline phase — research, review, implementation, or casual conversation — new ideas surface that aren't currently tracked. These get captured immediately in the STATUS.md Emerged Concepts table.

### Concept Lifecycle

| Status | Meaning |
|--------|---------|
| `captured` | Just recorded, not evaluated yet |
| `scoped` | Evaluated and slotted into the Research Queue |
| `deferred` | Acknowledged but pushed to later (e.g., V2) |
| `discarded` | Evaluated and intentionally dropped |

The table is a parking lot, not a commitment. Concepts can move between states as understanding evolves.

### Where They Come From

- Research cycles revealing adjacent needs
- Proposal reviews uncovering gaps
- Audit findings suggesting new capabilities
- Your ad-hoc ideas ("what if we added X?")
- Implementation discoveries ("this would be easier if we also had Y")

---

## Configuration

Clarity Loop stores configuration in `.clarity-loop.json` at the project root.

```json
{
  "version": 1,
  "docsRoot": "docs"
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `version` | `1` | Config format version |
| `docsRoot` | `"docs"` | Base path for all documentation directories |

All paths derive from `docsRoot`:
- `{docsRoot}/system/` — protected system docs
- `{docsRoot}/research/` — research docs
- `{docsRoot}/proposals/` — proposals
- `{docsRoot}/reviews/` — review artifacts
- `{docsRoot}/specs/` — generated specs
- `{docsRoot}/designs/` — design files

### When to Change docsRoot

If your project already uses `docs/system/` for other purposes. The [init script](hooks.md#init-script) detects collisions and prompts you automatically.

Commit `.clarity-loop.json` to git so all team members use the same docs root.

---

## Directory Structure

After initialization, your project has this structure:

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
  designs/                      Design files (.pen, DESIGN_PROGRESS.md)
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
  STATUS.md
```

---

## Related

- [doc-researcher](doc-researcher.md) — Uses manifest, tracking files, and protection model
- [doc-reviewer](doc-reviewer.md) — Manages protection markers during merge and correct
- [doc-spec-gen](doc-spec-gen.md) — Checks tracking files for waterfall gate
- [ui-designer](ui-designer.md) — Uses designs/ directory, DESIGN_PROGRESS.md
- [Hooks](hooks.md) — Implements protection and manifest generation
