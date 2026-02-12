# Proposal: Implementation Context and Progressive Knowledge Loading

**Created**: 2026-02-09
**Status**: Draft
**Research**: docs/research/IMPLEMENTATION_CONTEXT_PROGRESSIVE_LOADING.md
**Document Plan**: None (net new — no structure plan required)
**Author**: User + AI researcher
**Depends On**: None

## Summary

This proposal adds a **context file system** to the Clarity Loop plugin — curated, per-library
markdown files that capture the delta between the LLM's training data and current library
reality. The system uses a three-layer progressive disclosure model (manifest index → library
overview → detail files) so skills load only the context they need for the current task.

The cl-researcher skill gains a new `context` mode that creates and maintains context files
through web research against official documentation and context7.com. All other skills gain a
standard loading protocol to consume context. The cl-implementer gets version-pinned staleness
checks and a failure-based feedback loop that routes knowledge gaps back to the researcher.

Context files are stored locally in `{docsRoot}/context/`, committed to git as project
artifacts, and optionally promoted to `~/.claude/context/` for cross-project reuse. This
addresses the single biggest implementation quality issue observed during testing: stale
library knowledge causing build errors, wrong imports, deprecated patterns, and cascading
debugging cycles.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/IMPLEMENTATION_CONTEXT_PROGRESSIVE_LOADING.md | F1 (three-layer model), F2 (context7 as web source), F3 (folder structure), F4 (researcher as author), F5 (loading protocol), F6 (version-pinned staleness), F7 (local-first with global promotion), F8 (pass by reference), F9 (context file contents), F10 (init integration) | Primary recommendation: add context as researcher sub-capability with standard loading protocol |

## System Context

### Research Type: Net New

This is a net new capability. The plugin currently has no mechanism for library-specific
knowledge management. The context system introduces a new artifact type alongside existing
research docs, proposals, specs, and designs.

### Current State

| Plugin Artifact | Current State Summary | Sections Referenced |
|----------------|----------------------|-------------------|
| `skills/cl-researcher/SKILL.md` | Six modes: bootstrap, bootstrap-brownfield, triage, research, structure, proposal. No context creation capability. Frontmatter description + argument-hint list modes. | Frontmatter (lines 1-22), Mode Detection (lines 127-147) |
| `skills/cl-researcher/references/` | Five reference files (bootstrap, brownfield, research-template, proposal-template, structure-plan-template). No context-mode reference. | Directory listing |
| `skills/cl-implementer/references/start-mode.md` | Four pre-checks: specs exist, spec review, git repo, spec coverage. No context staleness check. | Step 1: Pre-Checks (lines 12-43) |
| `skills/cl-implementer/references/run-mode.md` | Step 3c reads spec reference + dependency files before implementing. No context loading. Step 4 classifies issues as runtime-error/regression/integration-failure. No "context gap" classification. | Step 3c: Implement (lines 104-122), Step 4: Fix Tasks (lines 147-188) |
| `skills/cl-implementer/SKILL.md` | Waterfall gate checks research/proposal status before generating. No context validation. | Step 1: Waterfall Gate Check (lines 110-128) |
| `docs/pipeline-concepts.md` | Documents four concepts: pipeline depth, system doc protection, manifest-based context loading, tracking files, emerged concepts, configuration, directory structure. No "context files" concept. | Full document (207 lines) |
| `scripts/init.js` | Creates 8 directories: system, research, proposals, reviews/proposals, reviews/audit, reviews/design, specs, designs. No `context/` directory. | dirs array (lines 200-209) |
| `README.md` | Project structure lists all current directories. Philosophy principles (lines 5-21). No mention of context files. | Project Structure (lines 391-458), Philosophy (lines 5-21) |
| `docs/research/DOC_PIPELINE_PLUGIN.md` | 12 design decisions documented. No context system decision. | Design Decisions section (lines 204-352) |

### Proposed State

After this proposal is applied:

- **cl-researcher** has 7 modes (adds `context`)
- A new reference file `context-mode.md` defines the context creation process
- **cl-implementer** pre-checks include context staleness validation
- **cl-implementer** run mode loads context before implementing and classifies context gaps
- **cl-implementer** validates context freshness before generating specs
- **pipeline-concepts.md** documents "Context Files" as a first-class concept
- **init.js** scaffolds a `context/` directory
- **README.md** reflects the new directory and concept
- **DOC_PIPELINE_PLUGIN.md** has Design Decision #13

## Change Manifest

> This is the contract between the proposal and the system docs. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Add `context` mode to frontmatter description and argument-hint | `skills/cl-researcher/SKILL.md` | Frontmatter (lines 1-22) | Modify | F4 |
| 2 | Add context mode detection bullet | `skills/cl-researcher/SKILL.md` | Mode Detection (lines 127-147) | Add | F4 |
| 3 | Add "Context Mode" section referencing context-mode.md | `skills/cl-researcher/SKILL.md` | After Proposal Mode (~line 410) | Add Section | F4, F5 |
| 4 | Add context staleness to Pipeline State Check | `skills/cl-researcher/SKILL.md` | Session Start → Pipeline State Check (lines 101-123) | Add | F6 |
| 5 | Create context-mode.md reference file | `skills/cl-researcher/references/context-mode.md` | (new file) | Add Doc | F1-F9 |
| 6 | Add context staleness pre-check (check 5) | `skills/cl-implementer/references/start-mode.md` | Step 1: Pre-Checks (lines 12-43) | Add | F6 |
| 7 | Add context loading to implementation step | `skills/cl-implementer/references/run-mode.md` | Step 3c: Implement (lines 104-122) | Modify | F5 |
| 8 | Add `context-gap` issue classification | `skills/cl-implementer/references/run-mode.md` | Step 4: Fix Tasks → Classify (lines 152-156) | Add | F4, F6 |
| 9 | Add context validation to waterfall gate | `skills/cl-implementer/SKILL.md` | Step 1: Waterfall Gate Check (lines 110-128) | Add | F6 |
| 10 | Add "Context Files" concept section | `docs/pipeline-concepts.md` | After "Tracking Files" (~line 117) | Add Section | F1, F3, F5, F9 |
| 11 | Add `context/` to directory structure listing | `docs/pipeline-concepts.md` | Directory Structure (lines 177-196) | Modify | F3 |
| 12 | Add `context/` to dirs array | `scripts/init.js` | dirs array (lines 200-209) | Modify | F10 |
| 13 | Add context/ to project structure and mention context system | `README.md` | Project Structure (lines 391-458) | Modify | F3 |
| 14 | Add Design Decision #13 | `docs/research/DOC_PIPELINE_PLUGIN.md` | Design Decisions (after line 352) | Add | All findings |

**Change types:**
- **Modify** — Changing existing content in an existing section
- **Add** — Adding content to an existing section
- **Add Section** — Adding a new section to an existing doc
- **Add Doc** — Creating an entirely new file

**Scope boundary**: This proposal ONLY modifies the docs/sections listed above. Any changes
to other docs or sections are out of scope and unintended. Specifically:
- `skills/cl-designer/SKILL.md` is a context consumer but gains the loading protocol
  implicitly through the standard protocol documented in `context-mode.md`. No direct
  changes to its files.
- `skills/cl-reviewer/SKILL.md` is not modified — context file review is out of scope
  for this proposal (deferred to a future research cycle if needed).

## Cross-Proposal Conflicts

No conflicts with in-flight proposals. The IMPLEMENTER_SKILL proposal has already been
merged. No other proposals in `docs/proposals/` target the same sections.

## Detailed Design

### Change Area 1: Doc-Researcher Context Mode

**What**: Add a new `context` mode to the cl-researcher skill that creates and maintains
per-library context files through web research. This is the primary change — the new
reference file `context-mode.md` contains the bulk of the logic.

**Why**: Research Finding 4 identified that context creation is a natural extension of the
researcher's existing role (web research, structured output, user collaboration). Research
Decision 1 chose this over a standalone skill or auto-gen hook.

**System doc impact**: Three changes to `skills/cl-researcher/SKILL.md`:

**1a. Frontmatter (Change #1)**

**Current** (from SKILL.md lines 1-22):
> ```yaml
> name: cl-researcher
> description: >
>   Research agent for the Clarity Loop documentation pipeline. Supports six modes: bootstrap,
>   bootstrap-brownfield, triage, research, structure planning, and proposal generation. [...]
> argument-hint: "[bootstrap|research [topic]|structure|proposal [R-NNN.md]]"
> ```

**Proposed**:
> ```yaml
> name: cl-researcher
> description: >
>   Research agent for the Clarity Loop documentation pipeline. Supports seven modes: bootstrap,
>   bootstrap-brownfield, triage, research, structure planning, proposal generation, and context
>   management. [...existing trigger phrases...] Also trigger on "create context", "update
>   context", "research context for [library]", "context files", "library context", or when
>   the cl-implementer reports a context gap.
> argument-hint: "[bootstrap|research [topic]|structure|proposal [R-NNN.md]|context [library]]"
> ```

**1b. Mode Detection (Change #2)**

**Current** (from SKILL.md lines 127-147):
> Six mode bullets: bootstrap, bootstrap-brownfield, triage, research, structure, proposal.

**Proposed**: Add seventh bullet:
> - **context**: User says "create context", "update context", "context for [library]",
>   "library context", or the cl-implementer reported a context gap. Gate: system docs must
>   exist (specifically an Architecture doc or equivalent with a tech stack section).

**1c. Context Mode Section (Change #3)**

**Current**: No context mode section exists.

**Proposed**: New section after Proposal Mode:
> ```markdown
> ## Context Mode
>
> Read `references/context-mode.md` and follow its process.
>
> Context mode creates and maintains per-library context files — curated knowledge that
> bridges the gap between LLM training data and current library reality. These files use
> a three-layer progressive disclosure model and are consumed by all skills through a
> standard loading protocol.
>
> ### Auto-offer
>
> During bootstrap (after Architecture doc is generated), automatically offer context
> creation: "Your Architecture doc references [N] libraries. Want me to research current
> docs and create context files? This helps avoid stale API knowledge during
> implementation."
> ```

**1d. Pipeline State Check (Change #4)**

**Current** (from SKILL.md lines 101-123):
> Checks for stale markers, tracking files, missing manifests.

**Proposed**: Add to the existing checks:
> - **Context staleness** — If `{docsRoot}/context/.context-manifest.md` exists, check
>   `Last verified` dates. If any library's context is older than its configured freshness
>   threshold (default: 1 week), note: "Context for [library] hasn't been verified in
>   [N] days. Consider running `/cl-researcher context [library]` to verify."

**Dependencies**: None — this change area is self-contained.

---

### Change Area 2: Context Mode Reference File (New)

**What**: Create `skills/cl-researcher/references/context-mode.md` — the full reference
for context creation, update, and maintenance.

**Why**: Research Findings 1-9 collectively define the context system. This reference file
is the canonical implementation guide for the researcher's context capabilities.

**This is a new file, so there's no current/proposed diff. The file covers:**

1. **Entry points**: Manual (`/cl-researcher context [library]`) and auto-offer during
   bootstrap. Gate: system docs must exist with a tech stack section.

2. **Context creation process** (per library):
   - Read Architecture doc for library name + version
   - WebSearch for "[library] [version] documentation", changelogs, migration guides
   - WebFetch official docs pages for API reference
   - Optionally: WebSearch context7.com for LLM-friendly format (website, NOT MCP)
   - Distill into context files: keep gotchas, breaking changes, correct imports, working
     patterns, common errors
   - Discard: tutorials, marketing copy, exhaustive API listings
   - Present to user for review before writing

3. **Three-layer file structure** (Finding 1):
   - Layer 1: `.context-manifest.md` — library index (~50 tokens per library)
   - Layer 2: `_meta.md` per library — version, sources, overview, file inventory
   - Layer 3: topic files — specific API references, code examples, edge cases

4. **Context file format** (Finding 9):
   - Version pinning header
   - Breaking changes section
   - Correct imports section
   - Working patterns with code examples
   - Common errors with fixes
   - Gotchas section

5. **`_meta.md` structure** (Finding 6):
   - Version, pinned to package.json
   - Last verified date
   - Sources used
   - Tags (freeform, library-dependent)
   - Tasks implemented with this context (tracks version pinning)
   - File inventory with categories and "load when" hints

6. **Standard loading protocol** (Finding 5):
   - Read `.context-manifest.md` (Layer 1)
   - Determine relevant libraries for current task
   - For each relevant library: read `_meta.md` (Layer 2) → match categories → load
     detail files (Layer 3)

7. **Version-pinned staleness model** (Finding 6):
   - 1-week soft freshness check (configurable per library)
   - Hard version mismatch detection (package.json vs _meta.md)
   - Failure-based triggers (strongest signal)
   - Never update context if tasks already depend on it — version instead

8. **Local-first with global promotion** (Finding 7):
   - Create in `{docsRoot}/context/`
   - Prompt for promotion to `~/.claude/context/` after successful validation
   - Precedence: project-local > global
   - Track promotion offers in `.context-manifest.md`

9. **Pass by reference** (Finding 8 — optional):
   - Architecture docs CAN reference context files for version/API details
   - Not mandatory — projects choose their style
   - Context file is authoritative when both inline version and reference exist

**Dependencies**: Change #1 (mode detection) must exist for this file to be reachable.

---

### Change Area 3: Implementer Start Mode — Context Pre-Check

**What**: Add a 5th pre-check to the cl-implementer's start mode that validates context
staleness before generating tasks.

**Why**: Research Finding 6 identified that stale context during implementation causes the
exact build errors the system is designed to prevent. Catching staleness before generating
tasks is cheaper than catching it during implementation.

**System doc impact**: One addition to `skills/cl-implementer/references/start-mode.md`:

**Current** (from start-mode.md lines 12-43):
> Four pre-checks: specs exist, spec review, git repository, spec coverage.

**Proposed**: Add check 5 after spec coverage:
> ```markdown
> 5. **Context freshness** — If `{docsRoot}/context/.context-manifest.md` exists:
>    - Read manifest, get all library entries
>    - For each library: compare version in `_meta.md` against `package.json` (or
>      equivalent dependency file). Flag mismatches:
>      "Context for [library] covers version [X] but package.json has [Y]. Context may
>      be stale. Options:
>      a) Run `/cl-researcher context [library]` to update
>      b) Continue with current context (your call — may cause build issues)
>      c) Skip context for this library"
>    - Check `Last verified` dates against freshness thresholds
>    If no context manifest exists: "No context files found. Context files help avoid
>    stale library knowledge during implementation. Run `/cl-researcher context` to
>    create them, or continue without. [Continue/Create context]"
> ```

**Dependencies**: None — this is an additive check.

---

### Change Area 4: Implementer Run Mode — Context Loading + Gap Classification

**What**: Two changes to run mode: (a) load context before implementing each task, (b) add
`context-gap` as an issue classification.

**Why**: Research Finding 5 defines the loading protocol. Research Findings 4 and 6
establish the feedback loop from implementation failures to context updates.

**System doc impact**: Two changes to `skills/cl-implementer/references/run-mode.md`:

**4a. Context Loading in Step 3c (Change #7)**

**Current** (from run-mode.md lines 104-112):
> ```markdown
> #### 3c: Implement
>
> Implement the task. This is where Claude Code writes code:
>
> 1. Read the task's spec reference in full
> 2. Read any dependency tasks' files (for context on what already exists)
> 3. Implement the code to meet the acceptance criteria
> 4. Test/verify the implementation against each criterion
> 5. Record files modified
> ```

**Proposed**:
> ```markdown
> #### 3c: Implement
>
> Implement the task. This is where Claude Code writes code:
>
> 1. Read the task's spec reference in full
> 2. Read any dependency tasks' files (for context on what already exists)
> 3. **Load relevant context** — if `{docsRoot}/context/.context-manifest.md` exists:
>    a. Read manifest to identify libraries relevant to this task (match spec references,
>       file types, and task description against library names and tags)
>    b. For each relevant library: read `_meta.md`, match task category against file
>       categories, load matching detail files
>    c. Inject loaded context after spec reference, before implementation
>    d. Record which context files were loaded in IMPLEMENTATION_PROGRESS.md
> 4. Implement the code to meet the acceptance criteria
> 5. Test/verify the implementation against each criterion
> 6. Record files modified
> ```

**4b. Context Gap Classification in Step 4 (Change #8)**

**Current** (from run-mode.md lines 152-156):
> ```markdown
> 1. **Classify the issue**:
>    - `runtime-error`: Code throws an error during execution
>    - `regression`: Previously-passing acceptance criteria now fail
>    - `integration-failure`: Two modules don't work together as specs described
> ```

**Proposed**:
> ```markdown
> 1. **Classify the issue**:
>    - `runtime-error`: Code throws an error during execution
>    - `regression`: Previously-passing acceptance criteria now fail
>    - `integration-failure`: Two modules don't work together as specs described
>    - `context-gap`: Error traced to stale or missing library knowledge (wrong import
>      path, deprecated API, incorrect method signature). Distinguished from runtime-error
>      by checking whether the error matches a known library API mismatch pattern.
>
>    For `context-gap` issues:
>    - Check if context files exist for the library in question
>    - If no context: "Build error caused by stale [library] knowledge. No context file
>      exists. Run `/cl-researcher context [library]` to create one? [Y/n]"
>    - If context exists but may be wrong: "Context for [library] may be inaccurate
>      (version [X]). Update context? Note: [N] tasks were implemented with current
>      context — updating will version the context, not replace it. [Y/n]"
>    - If user approves: researcher updates/versions context, cl-implementer retries task
> ```

**Dependencies**: Change #5 (context-mode.md) must exist for the loading protocol to be
defined. However, the cl-implementer changes work independently at the file level.

---

### Change Area 5: Spec Generation — Context Validation

**What**: Add a context validation step to the spec generator's waterfall gate check.

**Why**: Research Finding 6 — specs reference libraries, so context should be current when
specs are generated. Stale context at spec time leads to stale specs that produce stale
implementation.

**System doc impact**: One addition to `skills/cl-implementer/SKILL.md`:

**Current** (from SKILL.md lines 110-128):
> Three waterfall gate checks: research ledger, proposal tracker, unverified merges.

**Proposed**: Add check 4:
> ```markdown
> 4. **Check context freshness** — If `{docsRoot}/context/.context-manifest.md` exists,
>    check version alignment and freshness dates for all libraries. If any context is
>    stale (version mismatch or past freshness threshold), warn: "Context for [library]
>    may be stale. Specs generated with stale context may produce implementation issues.
>    Run `/cl-researcher context [library]` to update, or continue anyway?"
>    If no context exists but system docs reference a tech stack, note (advisory only):
>    "No context files found. Context files improve implementation accuracy. Consider
>    running `/cl-researcher context` before or after spec generation."
> ```

**Dependencies**: None — additive check.

---

### Change Area 6: Pipeline Concepts — Context Files Section

**What**: Add a "Context Files" section to `docs/pipeline-concepts.md` documenting the
concept as a first-class pipeline artifact.

**Why**: Research Findings 1, 3, 5, and 9 collectively define context files as a distinct
artifact type. The pipeline-concepts doc is the canonical place for documenting artifact types.

**System doc impact**: Two changes to `docs/pipeline-concepts.md`:

**6a. New Section (Change #10)**

**Current**: No context files section exists. "Tracking Files" section ends at ~line 117.

**Proposed**: New section after "Tracking Files":
> ```markdown
> ## Context Files
>
> Context files capture the delta between the LLM's training data and current library
> reality. They are NOT full API references, tutorials, or architectural decisions —
> those belong in official docs and system docs respectively. Context files contain:
> version pinning, breaking changes, correct imports, working patterns, common errors,
> and gotchas.
>
> ### Three-Layer Progressive Disclosure
>
> | Layer | File | Loads When | Token Cost |
> |-------|------|-----------|-----------|
> | 1 — Index | `.context-manifest.md` | Always (task start) | ~50/library |
> | 2 — Overview | `{library}/_meta.md` | Working with that library | ~500-2000 |
> | 3 — Detail | `{library}/{topic}.md` | On demand during implementation | Variable |
>
> ### Storage
>
> - **Project-local**: `{docsRoot}/context/` — committed to git, reviewed by user
> - **Global**: `~/.claude/context/` — personal, cross-project, promoted from local
> - **Precedence**: Project-local > Global
>
> ### Lifecycle
>
> Created by cl-researcher (context mode) → consumed by all skills via standard loading
> protocol → staleness detected by version pinning → updated/versioned by researcher →
> optionally promoted to global after validation.
>
> ### Version Pinning
>
> Context is stale when the library version changes, not when time passes. Each `_meta.md`
> tracks which implementation tasks depend on it. Context is versioned (not replaced) when
> a library upgrade occurs mid-implementation.
> ```

**6b. Directory Structure Update (Change #11)**

**Current** (from pipeline-concepts.md lines 177-196):
> Directory structure listing with system/, research/, proposals/, reviews/, specs/, designs/.

**Proposed**: Add `context/` to the listing:
> ```
> context/                   # Per-library knowledge files (progressive disclosure)
>   .context-manifest.md     # Layer 1: library index
>   {library}/               # One folder per library
>     _meta.md               # Layer 2: overview + file inventory
>     {topic}.md             # Layer 3: detail files
> ```

**Dependencies**: None.

---

### Change Area 7: Init Script

**What**: Add `context` to the `dirs` array in `scripts/init.js`.

**Why**: Research Finding 10 — the directory scaffold should include context/ so it exists
before the researcher creates content.

**System doc impact**:

**Current** (from init.js lines 200-209):
> ```javascript
> const dirs = [
>     'system',
>     'research',
>     'proposals',
>     'reviews/proposals',
>     'reviews/audit',
>     'reviews/design',
>     'specs',
>     'designs',
> ];
> ```

**Proposed**:
> ```javascript
> const dirs = [
>     'system',
>     'research',
>     'proposals',
>     'reviews/proposals',
>     'reviews/audit',
>     'reviews/design',
>     'specs',
>     'designs',
>     'context',
> ];
> ```

**Dependencies**: None.

---

### Change Area 8: README

**What**: Add `context/` to the project structure listing and mention context files in the
appropriate section.

**Why**: Research Finding 3 — the README should reflect the directory structure.

**System doc impact**: Add to the `docs/` section of the project structure:
> ```
> context/                  # Per-library knowledge for accurate implementation
> ```

And add a row to the output docs table (if one exists) or mention in the "What It Does"
section that the pipeline includes library context management.

**Dependencies**: None.

---

### Change Area 9: Design Decision #13

**What**: Add Design Decision #13 to `docs/research/DOC_PIPELINE_PLUGIN.md`.

**Why**: Architectural decisions about the context system should be recorded alongside the
other 12 design decisions.

**Current**: 12 design decisions (last is #12 — Post-Spec Implementation Tracking).

**Proposed**: Add after Decision #12:
> ```markdown
> ### 13. Implementation Context as Progressive Knowledge Files
>
> **Question**: How should the plugin provide accurate, current library knowledge to skills?
>
> **Decision**: Per-library context files using three-layer progressive disclosure (manifest
> index → library overview → detail files). Created by the cl-researcher through web
> research against official docs and context7.com (website, not MCP). Consumed by all skills
> via a standard loading protocol. Staleness is version-pinned, not time-based — context
> matches the library version in use, and is versioned (not replaced) when the project
> upgrades. Stored locally in `{docsRoot}/context/`, optionally promoted to global
> `~/.claude/context/`.
>
> **Rationale**:
> - Context7 MCP was rejected because it bloats the session context with raw API dumps (~9.7k
>   tokens per query). Context files are fetched once during research, distilled into curated
>   files, and loaded selectively (~50-2000 tokens per task).
> - The researcher already does web research and produces structured output — context creation
>   is a natural extension, not a new skill.
> - Version-pinned staleness prevents mid-implementation context churn that would make existing
>   code inconsistent with updated context.
> - Three-layer disclosure is a proven pattern (Claude Code skills, Cursor rules, MCP meta-tools)
>   with minimal overhead (1-2 extra file reads) and significant context savings.
> - Local-first storage means context is a project artifact (committed, reviewed), while global
>   promotion enables cross-project reuse of validated knowledge.
> ```

**Dependencies**: None.

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Context file | A curated markdown file capturing the delta between LLM training data and current library reality. Contains version pinning, breaking changes, correct imports, working patterns, common errors, gotchas. | cl-researcher, cl-implementer, pipeline-concepts |
| Context manifest | `.context-manifest.md` — Layer 1 index file listing all libraries with versions, paths, tags, and verification dates. | cl-researcher, all consumers |
| `_meta.md` | Layer 2 overview file per library containing version, sources, tags, task tracking, and file inventory. | cl-researcher, all consumers |
| Version pinning | Staleness model where context validity is tied to the library version in use, not calendar time. | cl-researcher context-mode, cl-implementer start/run modes |
| Context gap | Issue classification for build errors traced to stale or missing library knowledge. | cl-implementer run-mode Step 4 |
| Global promotion | Copying validated project-local context to `~/.claude/context/` for cross-project reuse. | cl-researcher context-mode |

### Migration

No migration needed — this is a net new capability. All changes are additive:
- New pre-check (cl-implementer) is skipped when no context manifest exists
- New loading step (cl-implementer) is skipped when no context manifest exists
- New waterfall gate check (spec-gen) is advisory when no context exists
- New mode (researcher) is only triggered by explicit invocation or auto-offer
- Init script change only affects new project scaffolding (existing projects get the
  directory on next init run, if they run it)

### Integration Points

| Component | Integration | Contract |
|-----------|------------|----------|
| cl-researcher ↔ all skills | Researcher writes `.context-manifest.md` + library folders. All skills read via standard loading protocol. | Manifest format (library/version/path/tags/date table). `_meta.md` format (version, sources, tags, tasks, file inventory). |
| cl-implementer ↔ cl-researcher | cl-implementer classifies `context-gap` errors and prompts user to invoke researcher. Researcher updates/versions context. | Gap classification includes library name and version. Researcher reads the classification to know what to update. |
| cl-implementer ↔ context manifest | Spec-gen reads manifest to validate freshness. Advisory only — doesn't block generation. | Manifest `Last Verified` dates and version fields. |
| Local ↔ global context | Researcher prompts for promotion after successful implementation. Global follows same structure. Local takes precedence. | Same file format. Precedence: `{docsRoot}/context/` > `~/.claude/context/`. |

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Researcher creates context (not standalone skill) | Standalone `context-manager` skill, auto-gen hook | Researcher already does web research + structured output. Standalone skill is over-engineering. Auto-gen removes human judgment. (Research Decision 1) |
| Plain markdown files (not MCP) | Context7 MCP, vector store | MCP bloats context every session. Files are fetched once, loaded selectively. No infrastructure needed. (Research Decision 2) |
| Context7 website as research source (not MCP) | Context7 MCP integration | Website via WebSearch/WebFetch during research. One-time fetch, distilled into curated files. (Research Decision 3) |
| Local-first with optional global promotion | Global only, local only | Local = project artifact (git, reviewed). Global = personal reuse. Local precedence prevents project-specific overrides from being clobbered. (Research Decision 4) |
| Three-layer progressive disclosure | Load all, two-layer, tag-only | Proven pattern. Minimal overhead (~2 extra reads). Significant savings at scale (10+ libraries). (Research Decision 5) |
| Version-pinned staleness (not time-based) | 90-day expiry, weekly refresh | Context matches dev work. Never update if tasks depend on it. Version instead. 1-week soft check for errata only. (Research Decision 10) |
| Freeform category tags | Strict taxonomy, no tags | Library-dependent — ORM vs UI framework need different categories. Conventions over rigidity. (Research Decision 9) |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Context files themselves become stale | Medium | High | Version-pinned staleness model. 1-week soft check. Failure feedback loop. Tasks track which context version they used. |
| Over-loading context (too many files per task) | Low | Medium | Three-layer disclosure limits loading. Category matching reduces irrelevant loads. |
| Under-loading context (missing relevant files) | Medium | Medium | Category tagging + fallback: if build fails, check for unloaded context files for the failing library. |
| Web research produces inaccurate context | Low | High | User reviews all context files before writing. Verification date tracked. Official docs are primary source. |
| Global context conflicts with project needs | Low | Low | Project-local takes precedence. Override is always possible. |
| Version pinning + task tracking adds bookkeeping overhead | Medium | Low | Automated by the loading protocol — no manual tracking required. |

## Open Items

1. **Context file templates per library type**: Different library types (ORM, UI framework,
   build tool) may benefit from standardized templates. Deferred — start with freeform,
   extract patterns after 5-10 context files are created across real projects.

2. **Community context sharing**: If context files follow a standard structure, they could be
   shared across teams/projects. Deferred to V2.

3. **Context-aware dependency installation**: The researcher knows correct versions — could
   generate verified `package.json` snippets. Deferred — evaluate after context system is
   validated.

## Appendix: Research Summary

The research investigated how to provide accurate, current library/framework knowledge to
all skills in the Clarity Loop pipeline. The core problem: LLMs use training data that may
be months or years stale, causing wrong imports, deprecated patterns, and build failures
during implementation.

**Key findings**: (1) A three-layer progressive disclosure model (manifest → overview →
detail) balances token efficiency with knowledge availability. (2) Context7's website
provides LLM-friendly library docs that can be fetched during research and distilled into
curated files. (3) One folder per library with a `_meta.md` overview + topic-specific detail
files is the optimal organization. (4) The cl-researcher is the natural owner — context
creation extends its existing web research capability. (5) A standard loading protocol lets
all skills consume context consistently. (6) Staleness is version-pinned, not time-based —
context must match dev work. (7) Local storage with optional global promotion balances
project specificity with cross-project reuse.

Ten design decisions were made during research, all resolved through two rounds of user
discussion. Three emerged concepts were identified for future research.

Full research doc: `docs/research/IMPLEMENTATION_CONTEXT_PROGRESSIVE_LOADING.md`
