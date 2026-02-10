# doc-spec-gen

Generates implementation-ready specs from verified system documentation. The final step in the pipeline — transforms human-approved docs into structured, concrete specifications that developers can build from.

**Command**: `/doc-spec-gen [mode]`

---

## Modes

| Mode | Trigger | Purpose |
|------|---------|---------|
| `generate` | "generate specs", "create specs from docs" | Generate implementation specs from system docs |
| `review` | "review specs", "check spec consistency" | Cross-spec consistency check |

---

## The Waterfall Gate

Spec generation enforces a strict gate: all system docs should be complete and verified before generating specs.

### Why Waterfall?

- Partial specs from incomplete docs → later doc changes require spec merging
- Spec merging is messy and error-prone
- The doc pipeline gets docs stable FIRST
- Specs are a one-shot derivation from stable docs
- If docs change later, regenerate specs from scratch (cheap compared to merge conflicts)

### Gate Checks

Before generating, the skill checks:

| Check | Source | Warning If |
|-------|--------|------------|
| Active research | [RESEARCH_LEDGER.md](pipeline-concepts.md#tracking-files) | Any `draft` or `in-discussion` entries |
| In-flight proposals | [PROPOSAL_TRACKER.md](pipeline-concepts.md#tracking-files) | Any `draft`, `in-review`, or `merging` entries |
| Unverified merges | PROPOSAL_TRACKER | Any `approved` but not `verified` entries |

You can override warnings if you understand the implications.

---

## Generate

Creates implementation specs from system docs.

### Step 1: Read All System Docs

Reads every system doc in full (using parallel subagents for efficiency). Each doc is analyzed for:
- Defined types and entities
- Interfaces and contracts
- Behavioral rules and constraints
- Cross-references to other docs

### Step 2: Choose Spec Format

The skill analyzes content and recommends the appropriate format:

| Content Type | Recommended Format |
|-------------|-------------------|
| API endpoints | OpenAPI YAML |
| Data models | JSON Schema or SQL DDL |
| UI components | Component specs (props, state, variants) |
| Events / messages | AsyncAPI or event schemas |
| Workflows | State machine definitions |
| General | Structured Markdown |

You confirm or override the recommendation.

### Step 3: Generate Specs

For each significant concept, a spec file is created in `docs/specs/`. Every spec includes:

| Requirement | Example |
|------------|---------|
| **Source reference** | "From ARCHITECTURE.md, section 'Event Processing', lines 45-78" |
| **Concrete types** | UUID v4, not "a string"; ISO 8601, not "a date" |
| **Edge cases** | Enumerated — what happens when X is null, empty, exceeds limits |
| **Dependencies** | Which other specs are referenced |
| **Implementability** | Can be implemented in isolation with bounded context |

### Step 4: Generate Spec Manifest

Creates `docs/specs/.spec-manifest.md`:
- Generated date and source docs
- Format chosen
- Waterfall gate status
- Specs inventory table (file, source docs, source sections, description)
- Cross-spec dependencies table

### Design Artifact Integration

If [DESIGN_SYSTEM.md](ui-designer.md) and [UI_SCREENS.md](ui-designer.md) exist, the spec generator references them. Tech specs can point to specific design components for implementation guidance.

---

## Review

Cross-spec consistency check. Catches issues that are invisible within a single spec but emerge when specs are compared.

### Five Consistency Dimensions

| Dimension | What It Catches |
|-----------|----------------|
| **Type Consistency** | Same entity with different types across specs. Enum value disagreements. Optional vs. required mismatches. |
| **Naming Consistency** | Same concept with different names (`userId` vs. `user_id`). Casing violations. Names not matching system doc terms. |
| **Contract Consistency** | Request/response shape mismatches between producer and consumer specs. Missing error types. Auth assumption differences. |
| **Completeness** | System doc sections with no spec coverage. Specs referencing undefined entities. Missing error handling. |
| **Traceability** | Specs without source references. Stale source references. Orphaned specs. |

### Output

An inline consistency report (no separate file) with:
- Overall spec health and issue patterns
- Verdict: **CONSISTENT** or **ISSUES FOUND**
- Per-dimension findings with specific spec references
- Recommendations grouped by severity (must fix, should fix, nice to have)

Issues found by spec review can feed into [doc-reviewer correct](doc-reviewer.md#correct) for targeted fixes to the source system docs, or you can regenerate specs after fixing the docs.

---

## Related

- [doc-researcher](doc-researcher.md) — Creates the research and proposals that become system docs
- [doc-reviewer](doc-reviewer.md) — Verifies system docs before spec generation
- [ui-designer](ui-designer.md) — Creates design specs referenced by tech specs
- [Pipeline Concepts](pipeline-concepts.md) — Tracking files and pipeline state
