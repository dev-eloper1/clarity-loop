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

The [cl-researcher triage](cl-researcher.md#triage) evaluates complexity based on doc impact, clarity, novelty, and cross-cutting concerns.

---

## System Doc Protection

Files in `{docsRoot}/system/` are protected. A `PreToolUse` [hook](hooks.md#protect-system-docs) blocks all direct `Edit` and `Write` operations to this directory.

### Why Protected?

System docs are the source of truth for your project. Unreviewed changes can introduce contradictions, terminology drift, and silent inconsistencies that compound over time. The protection ensures every change goes through a review gate.

### Three Authorized Operations

Only three pipeline operations can write to system docs, each creating a temporary `.pipeline-authorized` marker:

| Operation | When | Used By |
|-----------|------|---------|
| `bootstrap` | Initial doc creation | [cl-researcher bootstrap](cl-researcher.md#bootstrap) |
| `merge` | Applying approved proposals | [cl-reviewer merge](cl-reviewer.md#merge) |
| `correct` | Targeted fixes from audit/review | [cl-reviewer correct](cl-reviewer.md#correct) |

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

Four files in `{docsRoot}/` track pipeline state. They're the dashboard for understanding where everything stands.

### DECISIONS.md

The system-wide decision journal. Every skill reads this at session start and writes to it when decisions are made.

| Section | Content |
|---------|---------|
| **Project Context** | Living summary of the project: purpose, architecture, constraints, technology stack, design principles. Updated during bootstrap and after merges that change architecture. |
| **Decision Log** | Chronological entries (D-001, D-002, ...) for decisions that shape the system |

The logging threshold is: **would a future skill or session need to know this to avoid contradicting it?** Technology choices, architecture patterns, "do not proceed" conclusions, conflict resolutions, and implementation discoveries get logged. Routine approvals, mechanical corrections, and normal task completions don't.

Two entry formats: **full** (for complex decisions with options analysis) and **compact** (for decisions where the source document already has the full context).

**Relationship to other decision surfaces**: Research docs and proposals have lightweight local decision tables. Those capture decisions in context. DECISIONS.md is the system-wide index — decisions propagate here when they could affect other skills, future research, or implementation.

#### Category Tags

Every decision logged to DECISIONS.md includes a category tag for cross-skill lookup.
Standard categories:

| Category | Scope | Consumed By |
|----------|-------|-------------|
| `auth` | Authentication strategy | spec-gen, implementer |
| `authorization` | Authorization model | spec-gen, implementer |
| `errors` | Error handling, display, format | designer (behavioral), spec-gen, implementer |
| `testing` | Framework, boundaries, coverage | spec-gen (TEST_SPEC.md), implementer |
| `api-style` | Conventions, pagination, naming | spec-gen, implementer |
| `accessibility` | WCAG level, interaction mode | designer, implementer |
| `security` | Depth, compliance, dependency policy | spec-gen (SECURITY_SPEC.md), implementer |
| `content` | Tone, empty states | designer (behavioral walkthrough) |
| `resilience` | Offline, loading, retry | designer |
| `type-sharing` | Cross-boundary types | spec-gen, implementer |
| `dependencies` | Policy, governance | implementer (supply chain) |
| `responsive` | Viewports, breakpoints | designer |
| `design-direction` | Aesthetic, colors, typography | designer (all modes) |
| `spec-format` | Spec output format | spec-gen |
| `checkpoint-level` | Autopilot oversight | implementer |
| `deployment` | Deployment targets, environment strategy | spec-gen (CONFIG_SPEC.md), implementer |
| `config` | Configuration approach, feature flags, secrets management | spec-gen (CONFIG_SPEC.md), implementer |
| `observability` | Logging, metrics, health checks, tracing | spec-gen, implementer |
| `data-lifecycle` | Deletion strategy, retention, archival | spec-gen (data modeling), implementer |
| `data-modeling` | Temporal requirements, cascade, volume projections | spec-gen (data modeling), implementer |
| `code-conventions` | File naming, directory structure, import patterns | spec-gen, implementer |
| `performance` | Response time, bundle size, query budgets | spec-gen, implementer, verify |

Skills read DECISIONS.md at session start. Before asking any question that maps to a
category, check for an existing decision. If found, use it as the default. If the
context has genuinely changed, reference the existing decision when asking.

Categories are convention, not schema -- new categories can be added. The standard
list covers the cross-cutting concerns identified across all four skills.

**Multi-category decisions**: Many decisions span multiple categories (e.g., "JWT for
API authentication" is both `auth` and `api-style`). The Category field supports
comma-separated values. Cross-skill lookup matches on ANY category in the list, so
a decision tagged `auth, api-style` is found whether a skill searches for `auth` or
`api-style`.

**Decision entry format with category tag:**

```markdown
### D-NNN: [Decision Title]
**Category**: [category tag, category tag, ...]
**Date**: YYYY-MM-DD
**Source**: [auto-detected | research-generated | preset:Web Application | user override | auto-default | from discovery | bootstrap | research:R-NNN | implementation:T-NNN]
**Decision**: [What was decided]
**Rationale**: [Why -- one sentence is fine for compact entries]
```

The `Source` field enables audit: filter by `auto-default` to review all automated
decisions, filter by `preset:*` to see which defaults came from a preset, or
`auto-detected` to see what was derived from the codebase.

**Precedence rules for conflicting sources:**

When generating the defaults sheet during bootstrap, multiple sources may produce
conflicting values for the same category (e.g., auto-detect finds Vitest but an
existing DECISIONS.md entry says Jest). Resolution order:

1. **Existing DECISIONS.md entries** (explicit prior human decisions) -- always win
2. **Auto-detected from code** (Level 1) -- wins over research and presets
3. **Research-generated** (Level 2) -- wins over presets
4. **Preset defaults** (Level 3) -- lowest priority

When a higher-priority source overrides a lower one, the defaults sheet shows both:
`"Testing: Vitest [auto-detected] | Prior decision D-012: Jest [CONFLICT — resolve?]"`
The user resolves conflicts during defaults sheet review.

When an existing DECISIONS.md entry conflicts with auto-detect, the existing entry
wins (it represents a deliberate prior choice), but auto-detect flags the conflict
so the user can update the decision if circumstances changed.

**Decision conflict resolution (supersession):**

When a later decision overrides an earlier one in the same category:
1. The new entry is written with a supersession note: `**Supersedes**: D-NNN`
2. The original entry is marked: `**Status**: Superseded by D-MMM`
3. The user is notified at the point of override: "Overriding D-NNN ([category]:
   [old value]) with [new value]. Reason: [context]."

This ensures the decision log is auditable -- no silent overwrites. The original
rationale is preserved for future reference.

**Cold start (no DECISIONS.md):** If DECISIONS.md doesn't exist, decision flow
lookups return empty (all decisions are new). The defaults sheet becomes the first
bulk write to DECISIONS.md. This is the expected path for new projects.

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

### PARKING.md

The parking lot for findings, gaps, and ideas that surface during any pipeline phase. Items are classified by type and tracked through a simple lifecycle.

| Classification | What Goes Here |
|----------------|---------------|
| **Architectural** | Structural concerns, cross-cutting patterns, design questions |
| **Incremental** | Small improvements, refinements to existing behavior |
| **Scope-expansion** | New capabilities, features, or integrations beyond current scope |

| Status | Meaning |
|--------|---------|
| `Active` | Item is relevant and unresolved |
| `Resolved` | Addressed (merged into system docs, implemented, or intentionally discarded) |

---

## Context Files

Context files capture the delta between the LLM's training data and current library reality. They are NOT full API references, tutorials, or architectural decisions — those belong in official docs and system docs respectively. Context files contain: version pinning, breaking changes, correct imports, working patterns, common errors, and gotchas.

### Three-Layer Progressive Disclosure

| Layer | File | Loads When | Token Cost |
|-------|------|-----------|-----------|
| 1 — Index | `.context-manifest.md` | Always (task start) | ~50/library |
| 2 — Overview | `{library}/_meta.md` | Working with that library | ~500-2000 |
| 3 — Detail | `{library}/{topic}.md` | On demand during implementation | Variable |

### Storage

- **Project-local**: `{docsRoot}/context/` — committed to git, reviewed by user
- **Global**: `~/.claude/context/` — personal, cross-project, promoted from local
- **Precedence**: Project-local > Global

### Lifecycle

Created by cl-researcher (context mode) → consumed by all skills via standard loading protocol → staleness detected by version pinning → updated/versioned by researcher → optionally promoted to global after validation.

### Version Pinning

Context is stale when the library version changes, not when time passes. Each `_meta.md` tracks which implementation tasks depend on it. Context is versioned (not replaced) when a library upgrade occurs mid-implementation.

For the full context creation process, loading protocol, and staleness model, see the [context mode reference](../skills/cl-researcher/references/context-mode.md).

---

## Emerged Concepts

During any pipeline phase — research, review, implementation, or casual conversation — new ideas surface that aren't currently tracked. These get parked immediately in PARKING.md with an appropriate classification (architectural, incremental, or scope-expansion).

### Concept Lifecycle

Parked items follow a simple two-state lifecycle:

| Status | Meaning |
|--------|---------|
| `Active` | Item is relevant and unresolved — awaiting research, discussion, or implementation |
| `Resolved` | Addressed — merged into system docs, implemented, or intentionally discarded |

PARKING.md is a parking lot, not a commitment. Items can be reclassified or resolved as understanding evolves.

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
  "docsRoot": "docs",
  "implementer": {
    "checkpoint": "every",
    "l1ScanFrequency": 5
  },
  "ux": {
    "reviewStyle": "batch",
    "profileMode": "auto",
    "autoDefaults": "tier3",
    "parallelGeneration": true
  },
  "testing": {
    "integrationGate": true,
    "fullSuiteGate": true
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `version` | `1` | Config format version |
| `docsRoot` | `"docs"` | Base path for all documentation directories |
| `implementer.checkpoint` | `"every"` | Autopilot oversight level: `"none"`, `"phase"`, a number (every N tasks), or `"every"` (task-by-task) |
| `implementer.l1ScanFrequency` | `5` | How many tasks between L1 assumption accumulation scans. Set to 0 to disable. |
| `ux.reviewStyle` | `"batch"` | How artifacts are presented for review: `"batch"` (generate all, review set), `"serial"` (one at a time), `"minimal"` (auto-approve with summary) |
| `ux.profileMode` | `"auto"` | Project profile detection mode: `"auto"` (auto-detect from code, research gaps, presets as fallback), `"preset"` (skip auto-detect, go straight to presets), `"off"` (skip profile system, go freeform) |
| `ux.autoDefaults` | `"tier3"` | Which checkpoint tiers auto-proceed: `"none"` (most conservative), `"tier3"` (default), `"tier2-3"` (most aggressive) |
| `ux.parallelGeneration` | `true` | Pre-generate downstream work while user reviews current step |
| `testing.integrationGate` | `true` | Run integration tests at milestone boundaries (Tier 2 checkpoint) |
| `testing.fullSuiteGate` | `true` | Run full test suite before declaring completion (Tier 1 checkpoint) |

**Invalid or missing values**: If a `ux.*` key is set to an unrecognized value, fall back to
its default (e.g., unknown `ux.reviewStyle` → `"batch"`, unknown `ux.autoDefaults` → `"tier3"`).
Log a warning: "Unrecognized value '[value]' for [key]. Using default '[default]'."

**Tier threshold logic for `ux.autoDefaults`**: `"none"` = all tiers require explicit review.
`"tier3"` = Tier 3 items auto-proceed, Tiers 1-2 require review. `"tier2-3"` = Tiers 2 and 3
auto-proceed, only Tier 1 requires review. The comparison is: if an item's tier number ≥ the
threshold implied by the setting, it auto-proceeds.

All paths derive from `docsRoot`:
- `{docsRoot}/system/` — protected system docs
- `{docsRoot}/research/` — research docs
- `{docsRoot}/proposals/` — proposals
- `{docsRoot}/reviews/` — review artifacts
- `{docsRoot}/specs/` — generated specs
- `{docsRoot}/designs/` — design files
- `{docsRoot}/context/` — per-library knowledge files (progressive disclosure)

### When to Change docsRoot

If your project already uses `docs/system/` for other purposes. The [init script](hooks.md#init-script) detects collisions and prompts you automatically.

Commit `.clarity-loop.json` to git so all team members use the same docs root.

---

## Warmth Gradient

The pipeline's interaction style shifts gradually from warm to efficient:

| Pipeline Stage | Warmth | Interaction Style |
|---------------|--------|-------------------|
| Bootstrap, Research | Warm | Open-ended questions, exploration, summarize understanding. The user is discovering what they want. Don't rush. |
| Design Setup | Warm-Medium | Conversational discovery with generate-confirm for preferences when prior input is sufficient |
| Tokens, Mockups | Medium | Batch review, generate-confirm, focused feedback. Tables over conversation. |
| Spec Generation | Medium-Cool | Generate-confirm for format, batch gate checks. Minimal conversation. |
| Implementation | Cool | Task-by-task or autopilot, tiered checkpoints, no exploratory conversation |
| Verification, Review | Cool | Report output, pass/fail, decision-only interaction |

Early stages are exploratory -- the user is figuring out what they want. Later stages
are deterministic -- the user knows what they want and wants it built. Match the
interaction style to the decision-making mode.

**This is a guideline, not a constraint.** If a user wants to have a detailed discussion
during implementation, have one. The gradient describes the default energy, not a rule.

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
    SECURITY_SPEC.md            Per-endpoint auth, system security, dependency governance
    CONFIG_SPEC.md            Environment variables, secrets, deployment targets
    integrations/             Per-service integration specs
  designs/                      Design files (.pen, DESIGN_PROGRESS.md)
  context/                      Per-library knowledge files (progressive disclosure)
    .context-manifest.md        Layer 1: library index
    {library}/                  One folder per library
      _meta.md                  Layer 2: overview + file inventory
      {topic}.md                Layer 3: detail files
  DECISIONS.md
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
  PARKING.md
```

---

## Related

- [cl-researcher](cl-researcher.md) — Uses manifest, tracking files, protection model, and context mode
- [cl-reviewer](cl-reviewer.md) — Manages protection markers during merge and correct
- [cl-implementer](cl-implementer.md) — Checks tracking files for waterfall gate
- [cl-designer](cl-designer.md) — Uses designs/ directory, DESIGN_PROGRESS.md
- [Hooks](hooks.md) — Implements protection and manifest generation
