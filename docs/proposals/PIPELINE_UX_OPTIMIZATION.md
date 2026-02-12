# Proposal: Pipeline UX Optimization

**Created**: 2026-02-11
**Status**: Draft
**Research**: docs/research/INTERACTION_AUDIT.md (full pipeline interaction audit)
**Document Plan**: None
**Author**: Bhushan + AI Researcher
**Depends On**: P0 (SKILL_RENAME_AND_FOLD.md) -- completed; all skills use `cl-*` namespace

## Summary

This proposal establishes six cross-cutting interaction optimization strategies that apply to the ENTIRE Clarity Loop pipeline -- all four skills (cl-researcher, cl-designer, cl-implementer, cl-reviewer), all modes, all existing interaction points, and all new interaction points introduced by P1-P3.

A comprehensive audit of the pipeline identified **78 distinct user interaction points** across 4 skills and 19+ reference files. Of these, **24 are Tier 1 checkpoints** that must remain explicit, **3 are warmth-governed conversational interactions** (not checkpoints -- kept conversational by design), and **51 are optimizable** through six strategies: project profile system (three-level detection + defaults), generate-confirm (replacing sequential Q&A), batch review (replacing serial review), tiered checkpoints (right attention for each decision), parallel generation (pre-generating downstream work), and decision flow (DECISIONS.md as the single source of truth).

Three in-flight proposals -- P1 (Behavioral Specs), P2 (Testing Pipeline), P3 (Security/Errors/API Conventions) -- collectively add 20+ new questions and multiple review checkpoints. Without optimization, bootstrap discovery alone would grow from ~10 to ~35 sequential questions. With the six strategies established here, bootstrap compresses to 3-4 discovery questions + project profile detection + defaults sheet review. Token review becomes one batch with 2-3 flags. Mockup review becomes one batch + one behavioral batch. Tier 3 items auto-proceed. Decisions flow through DECISIONS.md without re-asking.

**Critical design constraint**: The project profile system is an OPTIONAL accelerator, not a constraint. Freeform generation is ALWAYS available. The user never loses freedom -- profiles are a "fill in sensible defaults" shortcut that can be overridden or ignored entirely.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/INTERACTION_AUDIT.md | 78 interaction points identified across all 4 skills. Breakdown: 14 sequential Q&A, 5 serial review, 39 confirmation gates, 9 format/option choices, 11 feedback loops. Initial classification: 19 Tier 1 (keep), 27 Tier 2 (batch), 16 Tier 3 (auto-proceed), 10 generate-confirm candidates, 5 batch review candidates, 3 decision flow candidates. (Refined during proposal to 24 Tier 1 + 3 warmth-governed + 51 optimizable.) Top 7 highest-impact optimization targets identified by turn savings. | Six cross-cutting UX optimization strategies applied to the entire pipeline |

## System Context

### Research Type: Evolutionary

This proposal modifies existing interaction patterns across all four skills. No new skills, modes, or files are created. All changes are to how existing modes communicate with the user, not what they produce.

### Current State

| Artifact | Current State Summary | Sections Referenced |
|----------|----------------------|-------------------|
| `skills/cl-researcher/SKILL.md` | Seven modes (bootstrap, brownfield, triage, research, structure, proposal, context). Guidelines section has behavioral rules but no decision flow protocol or warmth gradient. Session Start reads DECISIONS.md for prior decisions but no cross-skill category-based lookup protocol. | Session Start, Guidelines section |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation uses sequential Q&A: "What does this project do?" then "Who is it for?" then "What are the main workflows?" -- 9 questions total for greenfield. With P1/P2/P3, this section gains ~25 additional questions (behavioral, testing, security, error handling, API conventions, accessibility, content tone, dependency policy, type sharing). Each asked one at a time. | Greenfield Bootstrap, Step 2: Discovery Conversation |
| `skills/cl-researcher/references/context-mode.md` | Step 1 presents library list and asks user to select which to process. Step 3 presents distilled context for review before writing. Step for promotion asks once per library. | Step 1: Identify Libraries, Step 3: Present to User, Promotion |
| `skills/cl-designer/SKILL.md` | Four modes (setup, tokens, mockups, build-plan). Guidelines section covers Pencil rules and general principles. No decision flow protocol. Tokens and mockups summaries describe serial review as the core loop. | Guidelines section, Mode Detection, Tokens Mode, Mockups Mode |
| `skills/cl-designer/references/setup-mode.md` | Design discovery runs as sequential conversation: visual references then aesthetic then colors then typography then interaction patterns then theme then constraints. Step 2 says "Don't dump all at once -- have a conversation." Step 4 confirmation is already generate-confirm style. | Phase 2: Design Discovery, Steps 1-4 |
| `skills/cl-designer/references/tokens-mode.md` | Token presentation is sectional (colors, then typography, then spacing). Component review is serial per component: generate then screenshot then review. Steps 6-7 present token sections one at a time. Step 4 Visual Validation Loop is per-component or small batch. | Step 1 (Token values), Step 3 (Component plan), Step 4 (Visual Validation Loop), Steps 6-7 |
| `skills/cl-designer/references/mockups-mode.md` | Screen inventory confirmation (Step 1) is already generate-confirm. Screen review is serial per screen. Responsive states question is a choice point. Per-screen feedback loop instructs "Don't overwhelm the user." | Step 1 (Screen Inventory), Step 2 (Generate Mockups), Feedback loop, All Paths: Responsive States |
| `skills/cl-designer/references/build-plan-mode.md` | Build plan is presented as a single review unit (Step 4: User Review). Already batch-style. | Step 3, Step 4: User Review |
| `skills/cl-designer/references/design-checklist.md` | Tokens checklist: 8 items. Mockups checklist: 6 items. No tiering -- all items treated equally. Item 8 (tokens) and item 6 (mockups) require explicit user confirmation; others are self-assessed. | Tokens Checklist, Mockups Checklist |
| `skills/cl-implementer/SKILL.md` | Eight modes. Guidelines mention "User has final say on ordering" and "Parallel execution is opt-in." No systematic interaction optimization, no decision flow, no warmth gradient. | Guidelines section, Mode Detection |
| `skills/cl-implementer/references/spec-mode.md` | Step 1: waterfall gate with 4 sequential checks, each with "Continue anyway?" prompt. Step 3: suggests spec format and asks user to confirm. | Step 1 (Gate Check), Step 3 (Suggest Spec Format) |
| `skills/cl-implementer/references/start-mode.md` | Step 1: five pre-checks, each potentially requiring user decision. Step 4: parallelizable groups approval. Step 5: full task list review. | Steps 1, 4, 5 |
| `skills/cl-implementer/references/run-mode.md` | Step 1: reconciliation with per-change decisions. Step 2: spec hash mismatch. Step 3b: validity check per task. Step 5: spec gap triage (L0/L1/L2). | Steps 1, 2, 3b, 5 |
| `skills/cl-implementer/references/autopilot-mode.md` | First run: checkpoint decision. Step 3d: test failure escalation. Step 4: summary report with screenshot review. Trust evolution suggestion. | First Run, Steps 3d, 4, Trust Evolution |
| `skills/cl-implementer/references/sync-mode.md` | Step 7: full sync summary for user approval. One major interaction point. | Step 7: Present Changes |
| `skills/cl-implementer/references/verify-mode.md` | Results presented as report. No blocking interaction during verification. | Output section |
| `skills/cl-reviewer/SKILL.md` | Nine modes. Guidelines are substantive review rules. Most reviewer modes are generation (produce review files) not conversation -- inherently efficient. | Guidelines section |
| `skills/cl-reviewer/references/merge-mode.md` | Step 1: merge plan presented for user approval. One critical gate. | Step 1: Build the Merge Plan |
| `skills/cl-reviewer/references/fix-mode.md` | Step 2: all blocking issues presented with suggested fixes. User approves all or discusses. Non-blocking suggestions presented separately. | Step 2: Present Issues, Step 3: Apply Fixes |
| `skills/cl-reviewer/references/correction-mode.md` | Corrections manifest presented for approval. Large correction sets batched 5-10 at a time. | Steps 1-2: Manifest and Approval |
| `docs/pipeline-concepts.md` | Configuration section has `docsRoot` and `implementer.checkpoint`. No UX configuration. DECISIONS.md section describes decision log with full and compact formats but no category tag protocol. | Configuration section, DECISIONS.md section |
| `.clarity-loop.json` | Contains `version`, `docsRoot`, `implementer.checkpoint`. No `ux` section. | (project root) |

### Proposed State

After this proposal is applied:

1. **Bootstrap** uses generate-confirm: after 3-4 high-level discovery questions, the project profile system kicks in -- auto-detecting from existing code, running quick research for gaps, or offering presets as a starting point. It generates a **defaults sheet** covering all cross-cutting decisions (error handling, auth, testing, accessibility, API conventions, security depth, content tone, resilience, type sharing, etc.). The user reviews the sheet and overrides specific items instead of answering 20+ sequential questions.

2. **Research mode** Phase 2 uses generate-confirm for scope definition: after initial problem discussion, the researcher proposes a scope summary pre-populated from system doc analysis and triage context. The user confirms or adjusts deltas rather than answering 10+ separate questions.

3. **Context mode** uses batch selection: library list presented as a recommendation table with status and suggested action per library. The user confirms the batch or adjusts specific rows.

4. **Design setup** uses generate-confirm for design preferences when a component library or screenshots provide enough input. Falls back to conversational discovery for freeform projects.

5. **Tokens mode** uses batch review by default: all components are generated, then presented as a set (grid screenshot or summary table). The user flags specific items for revision. Serial review remains available via config.

6. **Mockups mode** uses batch review by default: all screens are generated, then presented as a set. The user flags screens for revision.

7. **Build plan** is already batch-style (no change needed beyond tiering and parallelization hint).

8. **Spec mode** gate check uses batch warnings: all 4 waterfall gate results presented as a single status table. User makes one go/no-go decision.

9. **Start mode** pre-checks use batch presentation: all 5 checks presented as a single status table. Task list review remains batch (already is).

10. **Run mode** uses batch reconciliation: presents change summary as a single table, user makes one decision for the batch. Per-task validity checks are Tier 3 when hash matches (auto-proceed), Tier 1 when mismatch.

11. **Autopilot** uses tiered checkpoints: Tier 1 decisions stop, Tier 2 present in batches at checkpoints, Tier 3 auto-proceed with audit trail.

12. **Sync mode** is already batch-style (no change needed).

13. **Reviewer modes** (review, merge, fix, correct, audit, design-review, re-review, sync, verify): Most are already generation-based with minimal interaction. Merge plan and corrections manifest are already batch-style. Fix mode already batches issues. No substantive changes needed. Decision flow protocol added to guidelines.

14. **All modes** use tiered checkpoints: Tier 1 (24 points: merge authorization, structure lock, research approval, design direction, screen inventory, task plan, spec hash mismatch, crash recovery, destructive resets, L2 spec gaps, pipeline routing, doc set suggestion, import path choice, library selection, research type lock, structure lock). Tier 2 (27 points: token tables, component plans, fix manifests, pre-flight checklists, reconciliation summaries, correction manifests, behavioral state batches). Tier 3 (16 points: session orientation, report generation, advisory nudges, handoff messages, trust tuning, L1 assumptions, context promotion). 3 warmth-governed conversational interactions (R9, R15, D4) are not checkpoints.

15. **Parallel generation** is documented with specific hints: while reviewing tokens, pre-generate mockup layouts. While reviewing mockups, pre-generate behavioral specs. While reviewing build plan, pre-generate spec structure. Each hint includes invalidation risk assessment.

16. **Decision flow** is formalized: every decision flows to DECISIONS.md with a category tag. Every mode reads DECISIONS.md before asking anything. 15 standard categories enable cross-skill lookup. Duplicate questions across modes are eliminated.

17. **Configuration**: `.clarity-loop.json` gains a `ux` section for `reviewStyle`, `profileMode`, `autoDefaults`, and `parallelGeneration`.

18. **Warmth gradient**: interaction style shifts from warm/conversational early (bootstrap, research, design setup) to efficient/mechanical later (spec gen, implementation, verification). The transition is gradual and documented.

## Interaction Audit Summary

The full audit is at `docs/research/INTERACTION_AUDIT.md`. Key findings:

### Totals

- **Total interaction points found: 78**
- **Sequential Q&A: 14** (opportunities to convert to generate-confirm)
- **Serial review: 5** (opportunities to convert to batch review)
- **Confirmation gates: 39** (candidates for tiered checkpoint classification)
- **Format/option choice: 9** (candidates for decision flow or batch)
- **Feedback loops: 11** (candidates for auto-proceed or batch)

### Breakdown by Optimization Strategy

| Strategy | Count | Description |
|----------|-------|-------------|
| **Tier 1 checkpoint (keep)** | 24 | High-stakes decisions: merge auth, structure lock, research approval, crash recovery, design direction lock, destructive resets, L2 spec gaps, pipeline routing, doc set suggestion, import path choice, library selection, research type lock |
| **Warmth-governed (not a checkpoint)** | 3 | Conversational interactions kept warm by design: bootstrap discovery fundamentals (R15), research refinement conversation (R9), design visual reference gathering (D4) |
| **Tier 2 batch** | 27 | Group related items into single review pass: pre-flight checklists, token tables, component plans, correction manifests, fix lists, reconciliation summaries |
| **Tier 3 auto-proceed** | 16 | Informational outputs that auto-display and continue: session orientation, report generation, advisory nudges, handoff messages, trust tuning, L1 assumptions |
| **Generate-confirm** | 10 | Replace Q&A with pre-generated defaults: bootstrap discovery, research requirements, design preferences, code-analysis summaries, scope sheets |
| **Batch review** | 5 | Present all items and review as a set: token sections, component groups, screen mockups, component specs, screen specs |
| **Decision flow** | 3 | Read from DECISIONS.md or .clarity-loop.json: testing framework choice, checkpoint level, prior decisions |

### Interaction Density by Skill

| Skill | Total Points | Tier 1 (keep) | Warmth-governed | Optimizable |
|-------|-------------|---------------|-----------------|-------------|
| cl-researcher | 22 | 6 | 2 | 14 |
| cl-designer | 24 | 7 | 1 | 16 |
| cl-implementer | 21 | 7 | 0 | 14 |
| cl-reviewer | 11 | 4 | 0 | 7 |

### Highest-Impact Optimization Targets

1. **cl-researcher Phase 2 requirements gathering** (SKILL.md lines 272-300): Up to 13 questions asked sequentially. Convert to pre-generated scope/requirements table. Saves 5-10 turns.

2. **cl-designer tokens visual validation** (tokens-mode.md lines 157-228): Serial review of 3 token sections + N component groups. Convert to batch review per category. Saves N-1 turns per category.

3. **cl-designer mockups per-screen review** (mockups-mode.md lines 87-97): Serial review of N screens. Convert to flow-group review. Saves significant turns for projects with 10+ screens.

4. **cl-implementer start pre-checks** (start-mode.md lines 16-57): 5 sequential checks each with their own prompt. Consolidate into single pre-flight dashboard. Saves 4 turns.

5. **cl-designer setup discovery** (setup-mode.md lines 53-117): 3 visual reference questions + up to 6 preference questions. Pre-generate design direction card from available signals. Saves 3-8 turns.

6. **cl-implementer spec waterfall gate** (spec-mode.md lines 23-47): 4 sequential gate checks. Consolidate into single gate-status table. Saves 3 turns.

7. **cl-researcher bootstrap discovery** (bootstrap-guide.md lines 52-68): 9 questions in greenfield path (growing to ~35 with P1/P2/P3). Compress to defaults sheet review. Saves 5-25 turns.

## Change Manifest

> This is the contract between the proposal and the skill/config files. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target File | Target Section | Type | Strategy |
|---|-------------------|------------|----------------|------|----------|
| 1 | Add three-level project profile system and generate-confirm pattern to bootstrap discovery | `skills/cl-researcher/references/bootstrap-guide.md` | Greenfield Bootstrap, Step 2: Discovery Conversation (after existing "Then dig deeper" questions) | Add Section | S1, S2 |
| 2 | Add project profile presets and auto-detect reference section | `skills/cl-researcher/references/bootstrap-guide.md` | (new section at end of file, after "Common Pitfalls") | Add Section | S1 |
| 3 | Add decision flow protocol to cl-researcher Guidelines | `skills/cl-researcher/SKILL.md` | Guidelines section | Add | S6 |
| 4 | Add warmth gradient guideline to cl-researcher Guidelines | `skills/cl-researcher/SKILL.md` | Guidelines section | Add | Warmth |
| 5 | Add batch selection to context mode library identification | `skills/cl-researcher/references/context-mode.md` | Step 1: Identify Libraries | Modify | S3 |
| 6 | Add generate-confirm for scope summary in research Phase 2 | `skills/cl-researcher/SKILL.md` | Research Mode, Phase 2 description | Add | S2 |
| 7 | Add generate-confirm pattern to design setup mode Step 2 | `skills/cl-designer/references/setup-mode.md` | Phase 2: Design Discovery, Step 2 | Modify | S2 |
| 8 | Add batch review as default for component validation loop | `skills/cl-designer/references/tokens-mode.md` | Step 4 (Visual Validation Loop) | Modify | S3 |
| 9 | Add batch review option for token section screenshots | `skills/cl-designer/references/tokens-mode.md` | Steps 6-7 (token section presentation) | Modify | S3 |
| 10 | Add batch review as default for screen review (Pencil) | `skills/cl-designer/references/mockups-mode.md` | Pencil Path, Feedback loop per screen | Modify | S3 |
| 11 | Add batch review as default for screen review (Markdown) | `skills/cl-designer/references/mockups-mode.md` | Markdown Fallback, Step 2 | Modify | S3 |
| 12 | Add batch review for behavioral walkthrough (coordinates with P1) | `skills/cl-designer/references/mockups-mode.md` | (new section, after P1's behavioral walkthrough step) | Add | S3 |
| 13 | Add tiered checkpoint system to design checklist | `skills/cl-designer/references/design-checklist.md` | (new section before Tokens Checklist) | Add Section | S4 |
| 14 | Add tier column to tokens checklist | `skills/cl-designer/references/design-checklist.md` | Tokens Checklist | Modify | S4 |
| 15 | Add tier column to mockups checklist | `skills/cl-designer/references/design-checklist.md` | Mockups Checklist | Modify | S4 |
| 16 | Add parallelization hints to tokens mode | `skills/cl-designer/references/tokens-mode.md` | (new section after All Paths: Generate DESIGN_SYSTEM.md) | Add Section | S5 |
| 17 | Add parallelization hints to mockups mode | `skills/cl-designer/references/mockups-mode.md` | (new section after All Paths: Generate UI_SCREENS.md) | Add Section | S5 |
| 18 | Add decision flow protocol to cl-designer Guidelines | `skills/cl-designer/SKILL.md` | Guidelines section | Add | S6 |
| 19 | Update cl-designer SKILL.md tokens summary for batch review default | `skills/cl-designer/SKILL.md` | Tokens Mode section | Modify | S3 |
| 20 | Update cl-designer SKILL.md mockups summary for batch review default | `skills/cl-designer/SKILL.md` | Mockups Mode section | Modify | S3 |
| 21 | Add batch warnings pattern to spec mode gate check | `skills/cl-implementer/references/spec-mode.md` | Step 1: Waterfall Gate Check | Modify | S2 |
| 22 | Add batch warnings pattern to start mode pre-checks | `skills/cl-implementer/references/start-mode.md` | Step 1: Pre-Checks | Modify | S2 |
| 23 | Add tiered checkpoint documentation to autopilot mode | `skills/cl-implementer/references/autopilot-mode.md` | Step 3h: Checkpoint Evaluation | Add | S4 |
| 24 | Add parallelization hints to spec mode | `skills/cl-implementer/references/spec-mode.md` | (new note after Step 6) | Add | S5 |
| 25 | Add parallelization hints to start mode | `skills/cl-implementer/references/start-mode.md` | (new note after Step 7) | Add | S5 |
| 26 | Add decision flow protocol to cl-implementer Guidelines | `skills/cl-implementer/SKILL.md` | Guidelines section | Add | S6 |
| 27 | Add decision flow protocol to cl-reviewer Guidelines | `skills/cl-reviewer/SKILL.md` | Guidelines section | Add | S6 |
| 28 | Add UX configuration section to pipeline-concepts.md | `docs/pipeline-concepts.md` | Configuration section | Add | All |
| 29 | Add DECISIONS.md category tag protocol to pipeline-concepts.md | `docs/pipeline-concepts.md` | DECISIONS.md section | Add | S6 |
| 30 | Add warmth gradient section to pipeline-concepts.md | `docs/pipeline-concepts.md` | (new section after Configuration) | Add Section | Warmth |

**Change types:**
- **Modify** -- Changing existing content in an existing section
- **Add** -- Adding content to an existing section
- **Add Section** -- Adding a new section to an existing doc
- **Remove** -- Removing content or sections (none in this proposal)

**Scope boundary**: This proposal ONLY modifies the files/sections listed above. It does NOT modify:
- The content of P1, P2, or P3 proposals themselves (they follow these patterns once this is merged)
- Spec generation output files (TEST_SPEC.md, SECURITY_SPEC.md, etc.)
- Any tracking files (STATUS.md, RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md)
- Review artifact formats
- The PostToolUse or PreToolUse hooks
- The init script
- Output artifacts (DESIGN_SYSTEM.md, UI_SCREENS.md, TASKS.md, etc.)

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|--------------|---------------------|-----------|
| P1 (Behavioral Specs) | `bootstrap-guide.md` Step 2 (both add questions), `mockups-mode.md` (P1 adds behavioral walkthrough, this changes review pattern), `design-checklist.md` (P1 adds items, this adds tiering), `tokens-mode.md` Step 4 (P1 modifies validation loop, this changes to batch) | **Merge P0.5 first.** P1's additions follow the generate-confirm and batch review patterns established here. P1's new questions become rows in the defaults sheet. P1's behavioral walkthrough uses batch review. P1's checklist items get tiered. |
| P2 (Testing Pipeline) | `bootstrap-guide.md` Step 2 (both add questions), `autopilot-mode.md` (P2 adds gates, this adds tiering), `spec-mode.md` (P2 adds TEST_SPEC.md generation, this changes gate presentation), `start-mode.md` (P2 adds test tasks, this changes pre-check presentation) | **Merge P0.5 first.** P2's bootstrap testing probes become rows in the defaults sheet. P2's milestone gates are inherently Tier 1. P2's spec and start additions follow batch presentation patterns. |
| P3 (Security/Errors/API) | `bootstrap-guide.md` Step 2 (both add questions), `spec-mode.md` (P3 adds artifacts, this changes gate presentation), `run-mode.md` (P3 adds dependency checks) | **Merge P0.5 first.** P3's bootstrap probes (security, error handling, API conventions, dependency policy, accessibility, content) become rows in the defaults sheet. No overlap in spec generation substance. |

**Recommended merge order**: P0 (done) --> **P0.5** --> P1 --> P2 --> P3.

---

## Detailed Design

### Strategy 1: Project Profile System (Changes 1-2)

**What**: Introduce a three-level project profile system that detects, researches, or offers defaults to pre-fill the bootstrap defaults sheet. The three levels are complementary: auto-detect runs first (if there's code), quick research fills gaps, and presets offer a starting point for greenfield projects.

**Why**: The audit found that bootstrap discovery (Finding #7) is the highest-friction point in the pipeline, growing from ~10 sequential questions to ~35 with P1/P2/P3. The profile system compresses this by deriving sensible defaults from the project itself -- existing code, PRD analysis, or project type -- leaving the user to review and override exceptions.

**Three problems the old archetype approach had**:
1. **Brownfield blind spot**: Hardcoded archetypes assume greenfield. For existing codebases, the project profile should be DETECTED from what exists, not chosen from presets.
2. **Too narrow**: Five web-centric presets don't cover Python ML pipelines, Go microservices, Rust systems, Java enterprise, data engineering, or countless other project shapes.
3. **Static vs dynamic**: Instead of choosing from fixed presets, the system can GENERATE a custom profile by analyzing the actual project.

**Three Levels**:

- **Level 1: Auto-Detect** (brownfield / existing codebase): Scan the project to derive a profile automatically. No questions needed for decisions already made in code. Detects package manager, framework, testing setup, auth middleware, error handling patterns, API style, linting/formatting, database, UI framework, styling approach, and more.
- **Level 2: Quick Research** (new or complex projects): When auto-detect finds little or the project is complex, run a mini research cycle analyzing the PRD + architecture doc + tech stack constraints to generate a custom profile. Not limited to predefined categories.
- **Level 3: Presets** (quick start, optional): Language/framework-agnostic starting points focused on PROJECT TYPE: Web Application, API/Backend Service, CLI/Desktop Tool, Library/Package, Prototype/Experiment. Each preset is a starting point that auto-detect and research can refine.

**How they combine**:

```
Start
  |
  +-- Existing codebase? --> Auto-detect --> Show detected profile --> User confirms/overrides
  |                                              |
  |                                         Gaps found? --> Quick research to fill gaps
  |
  +-- New project with PRD? --> Quick research --> Generate profile --> User confirms/overrides
  |
  +-- Quick start? --> Offer presets --> User picks one --> Can refine later
```

**Critical constraints**:
- The profile system NEVER constrains. It pre-fills. The user can always:
  - Skip all profile generation entirely
  - Override any individual decision
  - Answer questions manually instead of using generated defaults
  - Mix auto-detected values with manual overrides
  - Change their mind mid-pipeline (DECISIONS.md entries can be revised anytime)
- The `ux.profileMode` config controls the behavior: `"auto"` (default -- run auto-detect, fall back to research/presets), `"preset"` (skip auto-detect, go straight to presets), `"off"` (skip entirely, go freeform)

---

#### Change 1: Project Profile Detection and Defaults Sheet in Bootstrap

**Target file**: `skills/cl-researcher/references/bootstrap-guide.md`
**Target section**: Greenfield Bootstrap, Step 2: Discovery Conversation

**Current** (Step 2, after "Start with" questions):
> **Then dig deeper:**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - Are there performance, security, or compliance requirements?
> - What's the scope? What's explicitly out of scope?

**Proposed** (replace "Then dig deeper" and add new subsections after it):

> **Then dig deeper (conversational):**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - What's the scope? What's explicitly out of scope?
>
> Continue the conversation naturally. These questions establish the project's identity.
> Don't rush -- the quality of initial docs depends on getting the picture right.
>
> #### Step 2b: Project Profile Detection
>
> After you have a solid understanding of the project fundamentals (typically after 3-5
> exchanges), generate a project profile using the three-level system. The
> `ux.profileMode` config controls behavior (default: `"auto"`).
>
> ##### Level 1: Auto-Detect (brownfield / existing codebase)
>
> If the project has existing code, scan it to derive a profile automatically. No
> questions needed for decisions already made in code:
>
> | Signal | Detection Method | Example |
> |--------|-----------------|---------|
> | Package manager | `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `pyproject.toml` | Node.js, Python, Rust, Go, Java, Ruby, PHP |
> | Framework | Dependencies in manifest (Next.js, FastAPI, Gin, Actix, Spring Boot, Django, Rails, Laravel, etc.) | Next.js 14 detected from package.json |
> | Testing | Test runner config (`vitest.config`, `jest.config`, `pytest.ini`, `.rspec`), test directories, test file patterns | Vitest with existing test suite |
> | Auth | Auth middleware, JWT libraries, session config, OAuth setup, passport config | JWT via `jsonwebtoken` package |
> | Error handling | Existing error classes, error middleware, error response shapes | Custom AppError class with structured responses |
> | API style | Route patterns, REST conventions, GraphQL schema, tRPC routers | REST with `/api/v1/` prefix |
> | Linting/formatting | ESLint, Prettier, Black, Rustfmt, gofmt configs | ESLint + Prettier configured |
> | Database | ORM config, migration directories, schema files | Drizzle ORM with PostgreSQL |
> | UI framework | React, Vue, Svelte, Angular from dependencies | React 18 with Next.js |
> | Styling | Tailwind config, CSS modules, styled-components, Sass | Tailwind CSS v4 |
> | CI/CD | `.github/workflows`, `Jenkinsfile`, `.gitlab-ci.yml` | GitHub Actions |
> | Containerization | `Dockerfile`, `docker-compose.yml` | Docker with compose |
>
> Present the detected profile as a **Project Profile** table:
>
> "I scanned your codebase and detected the following. Confirm or override:"
>
> | Detected | Value | Confidence | Override? |
> |----------|-------|------------|-----------|
> | Language | TypeScript (Node.js) | High -- package.json | |
> | Framework | Next.js 14 | High -- dependency | |
> | Testing | Vitest | High -- vitest.config.ts exists | |
> | Auth | JWT (jsonwebtoken) | Medium -- package present, no middleware found | |
> | Database | PostgreSQL via Drizzle | High -- drizzle.config.ts + migrations/ | |
> | API style | REST, /api/ routes | Medium -- inferred from route files | |
> | Linting | ESLint + Prettier | High -- configs exist | |
> | UI | React 18 | High -- dependency | |
> | Styling | Tailwind CSS v4 | High -- tailwind.config exists | |
>
> Auto-detect produces decisions with source: `[auto-detected]` in DECISIONS.md.
>
> After showing the detected profile, check for **gaps** -- categories the pipeline needs
> that auto-detect couldn't determine (error handling strategy, security depth, content
> tone, accessibility level, etc.). If gaps exist, fill them via Level 2 (quick research)
> or ask the user directly.
>
> ##### Level 2: Quick Research (new or complex projects)
>
> When auto-detect finds little (new project) or the project is complex, run a mini
> research cycle:
>
> 1. Analyze the PRD, architecture doc, and tech stack constraints
> 2. Generate a custom profile based on what the project actually needs
> 3. Not limited to predefined categories -- if the project needs something unusual
>    (HIPAA compliance, real-time processing, embedded constraints, ML pipeline stages,
>    data governance), the profile captures it
>
> "Based on your PRD and architecture docs, here's the project profile I'd recommend:"
>
> | Category | Decision | Value | Source | Override? |
> |----------|----------|-------|--------|-----------|
> | Error handling | Display style | Toast notifications + inline for forms | PRD: "user-friendly error messages" | |
> | Auth | Strategy | OAuth 2.0 + JWT | Architecture doc: "SSO required" | |
> | Testing | Framework | Vitest | Tech stack: Node.js + TypeScript | |
> | Security | Depth | High (HIPAA) | PRD: "healthcare data" | |
> | ... | ... | ... | ... | |
>
> Quick research produces decisions with source: `[research-generated]` in DECISIONS.md.
>
> ##### Level 3: Presets (quick start, optional)
>
> For brand-new projects without a PRD or existing code, or when the user wants a fast
> start, offer language/framework-agnostic presets:
>
> "Want to start from a preset? Pick one and I'll pre-fill defaults you can customize:"
>
> - **Web Application** -- full-stack, any framework (auth, responsive UI, data management)
> - **API / Backend Service** -- any language (no UI, structured errors, API conventions)
> - **CLI / Desktop Tool** -- any language (no auth, stderr errors, focused functionality)
> - **Library / Package** -- any language (no UI, comprehensive testing, API design)
> - **Prototype / Experiment** -- minimal everything (speed over rigor)
>
> See the Project Profile Presets section at the end of this file for preset details.
>
> Presets produce decisions with source: `[preset: Web Application]` (or whichever
> preset) in DECISIONS.md.
>
> ##### Freeform (always available)
>
> At any point, the user can:
> - Skip all profile generation entirely ("I'll answer questions manually")
> - Override any individual decision in the detected/generated/preset profile
> - Mix auto-detected values with manual overrides or preset defaults
>
> If `ux.profileMode` is `"off"`, skip profile detection entirely and go straight to
> freeform. The user fills in decisions through conversation.
>
> #### Step 2c: Defaults Sheet (Generate-Confirm Pattern)
>
> Whether using auto-detect, quick research, a preset, or going freeform, generate a
> **defaults sheet** -- a table of all cross-cutting decisions the pipeline needs.
> Present it for batch review:
>
> "Here's the proposed configuration for your project. Review and mark anything you want
> to change:"
>
> | Category | Decision | Value | Source | Override? |
> |----------|----------|-------|--------|-----------|
> | Error handling | Error display style | Toast notifications | [auto-detected] | |
> | Error handling | Error format | Structured `{code, message, details}` | [research-generated] | |
> | Auth | Strategy | JWT with refresh tokens | [auto-detected] | |
> | Auth | Authorization model | Role-based | [research-generated] | |
> | Testing | Framework | Vitest | [auto-detected] | |
> | Testing | Test data approach | Factories | [preset: Web Application] | |
> | Testing | Mock boundaries | Mock DB in unit, real in integration | [research-generated] | |
> | Testing | Coverage expectation | Business logic + integration boundaries | [preset: Web Application] | |
> | API style | Convention | REST, cursor pagination | [auto-detected] | |
> | API style | Response envelope | `{data, pagination}` | [research-generated] | |
> | API style | Naming | camelCase JSON, kebab-case URLs | [auto-detected] | |
> | Security | Depth | Standard (generates SECURITY_SPEC.md) | [research-generated] | |
> | Security | Compliance | None specified | [confirm or specify] | |
> | Security | Dependency policy | Advisory (warn on CVEs, don't block) | [research-generated] | |
> | Accessibility | Level | WCAG 2.1 AA | [preset: Web Application] | |
> | Accessibility | Interaction mode | Mouse-first with keyboard support | [auto-detected] | |
> | Content | Tone | Professional, concise | [research-generated] | |
> | Content | Empty states | Onboarding CTAs | [preset: Web Application] | |
> | Resilience | Offline handling | Not applicable (server-rendered) | [research-generated] | |
> | Resilience | Loading states | Show loading indicators | [preset: Web Application] | |
> | Type sharing | Strategy | Generated from API spec | [research-generated] | |
> | Target devices | Viewports | Desktop + mobile responsive | [auto-detected] | |
>
> **Source column shows provenance.** Each value traces back to its origin:
> `[auto-detected]`, `[research-generated]`, `[preset: X]`, `[user override]`, or
> `[from discovery]`. This transparency lets the user know which defaults are
> evidence-based (auto-detected from code) vs inferred (research-generated) vs
> generic (preset).
>
> **Not every row applies to every project.** Omit rows that don't apply (a CLI tool
> doesn't need accessibility level or empty state strategy). The profile determines
> which rows appear; freeform includes all potentially relevant rows.
>
> **The user reviews and responds.** Typical responses:
> - "Looks good" -- all defaults accepted. Record all in DECISIONS.md.
> - "Change pagination to offset-based, bump security to strict, rest is fine" -- update
>   the specified rows, record all in DECISIONS.md.
> - "Let me think about auth -- proceed with everything else" -- record decided items,
>   mark auth as `[DEFERRED]` in DECISIONS.md. The pipeline proceeds; auth decisions
>   will be asked again when needed (during spec generation).
>
> **After confirmation**, record all decisions to `docs/DECISIONS.md` with source
> attribution (`[auto-detected]`, `[research-generated]`, `[preset: X]`, `[user override]`,
> `[from discovery]`, or `[DEFERRED]`) and the appropriate category tag. Use compact
> Decision entries -- the defaults sheet IS the rationale.
>
> **Warmth note**: This step should feel like reviewing a menu, not filling out a tax
> form. Present the table with brief explanations: "I've pre-filled based on what I
> detected in your codebase and PRD. The important ones to look at are auth strategy
> and security depth -- the rest are sensible defaults you can always change later."

**Dependencies**: Change 2 (project profile presets) provides the preset lookup tables. Change 28 (UX configuration) provides the `profileMode` toggle.

---

#### Change 2: Project Profile Presets and Auto-Detect Reference Section

**Target file**: `skills/cl-researcher/references/bootstrap-guide.md`
**Target section**: New section at end of file, after "Common Pitfalls"

**Proposed** (new section):

> ---
>
> ### Project Profile System Reference
>
> The project profile system has three levels that work together. Auto-detect runs first
> (if there's code), quick research fills gaps, and presets offer a starting point for
> greenfield projects. All three are optional -- the user can always go freeform.
>
> #### Auto-Detect Signal Reference
>
> When scanning an existing codebase, look for these signals. Each detection produces
> a decision with source `[auto-detected]` and the specific evidence (e.g., "detected
> from package.json dependency: next@14.2.0").
>
> | Signal Category | Files to Scan | What to Extract |
> |----------------|--------------|-----------------|
> | **Language / Runtime** | `package.json`, `requirements.txt`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `pom.xml`, `build.gradle`, `Gemfile`, `composer.json`, `*.csproj` | Primary language, runtime version, module system |
> | **Framework** | Dependency manifests, import statements, config files | Framework name and version (Next.js, FastAPI, Gin, Actix, Spring Boot, Django, Rails, Laravel, Phoenix, etc.) |
> | **Testing** | `vitest.config.*`, `jest.config.*`, `pytest.ini`, `setup.cfg [tool:pytest]`, `.rspec`, `*_test.go`, `**/*.test.*`, `**/*.spec.*`, `test/`, `tests/`, `__tests__/` | Test runner, test file patterns, existing test count, coverage config |
> | **Auth** | Auth middleware files, JWT/session/OAuth libraries in deps, passport config, auth route handlers | Auth strategy, token type, session management |
> | **Error handling** | Custom error classes, error middleware, global error handlers, error response shapes in route handlers | Error format, display strategy, error hierarchy |
> | **API style** | Route files, controller patterns, GraphQL schema, tRPC router, OpenAPI spec, REST conventions | API paradigm, URL patterns, response shapes, pagination style |
> | **Linting / Formatting** | `.eslintrc*`, `.prettierrc*`, `pyproject.toml [tool.black]`, `rustfmt.toml`, `.editorconfig`, `biome.json` | Code style rules, formatting config |
> | **Database** | ORM config, migration directories, schema files, connection strings in config | Database type, ORM/query builder, migration tool |
> | **UI framework** | Framework-specific imports/components in source files, dependencies | React, Vue, Svelte, Angular, Solid, etc. + version |
> | **Styling** | `tailwind.config.*`, CSS module files, styled-components usage, Sass/SCSS files, `postcss.config.*` | Styling approach, design token system |
> | **CI/CD** | `.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`, `.circleci/`, `bitbucket-pipelines.yml` | CI provider, pipeline stages, deploy targets |
> | **Containerization** | `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Container setup, service topology |
> | **Monorepo** | `pnpm-workspace.yaml`, `lerna.json`, `nx.json`, `turbo.json`, `packages/`, `apps/` | Monorepo tool, workspace layout |
>
> **Confidence levels**: High (config file exists with explicit values), Medium (inferred
> from patterns or indirect evidence), Low (guessed from conventions). Show confidence
> in the profile table so the user knows which detections to verify.
>
> **What auto-detect CANNOT determine**: Business logic decisions (error display
> strategy for new features, auth model for new user types), quality targets (coverage
> expectations, security depth), and design preferences (content tone, accessibility
> level). These gaps are filled by Level 2 (quick research) or direct user input.
>
> #### Quick Research Profile Generation
>
> When auto-detect produces an incomplete profile (new project, or existing project
> with gaps), run a mini research cycle:
>
> 1. **Read available context**: PRD, architecture doc, tech stack decisions in
>    DECISIONS.md, any existing system docs
> 2. **Analyze requirements**: Extract implicit decisions from requirements (e.g.,
>    "healthcare data" implies HIPAA compliance, "real-time collaboration" implies
>    WebSocket/SSE, "offline-first" implies service workers + sync)
> 3. **Generate custom profile**: Create profile entries for categories relevant to
>    THIS specific project -- not limited to predefined lists
> 4. **Present with rationale**: Each generated value includes the source document
>    and reasoning so the user can evaluate the recommendation
>
> Quick research is particularly valuable for:
> - **Domain-specific requirements**: HIPAA, PCI-DSS, GDPR, SOC2, FedRAMP
> - **Unusual architectures**: Event sourcing, CQRS, microservices, serverless, edge
> - **Non-web projects**: ML pipelines, data engineering, embedded systems, game dev
> - **Complex integrations**: Multi-service auth, federated GraphQL, message queues
>
> Generated decisions use source: `[research-generated]` with the specific doc and
> reasoning referenced.
>
> #### Preset Definitions
>
> Presets are language/framework-agnostic starting points focused on PROJECT TYPE.
> They provide reasonable defaults that auto-detect and quick research can refine.
> Every default can be overridden.
>
> ##### Web Application
>
> **Profile**: Full-stack web application with auth, data management, and responsive UI.
> Any framework (Next.js, Django, Rails, Laravel, Spring Boot, Phoenix, etc.).
>
> | Category | Default Value |
> |----------|--------------|
> | Error handling | Toast notifications for actions, inline for forms, error pages for navigation |
> | Error format | Structured `{code, message, details, requestId}` |
> | Auth | Session or token-based (framework convention) |
> | Authorization | Role-based (admin, user) |
> | Testing | Framework-conventional test runner |
> | Test data | Factories for entities, fixtures for API responses |
> | Mock boundaries | Mock DB in unit tests, real test DB in integration |
> | Coverage | Business logic + integration boundaries |
> | API style | REST or framework convention, cursor pagination |
> | Security depth | Standard (generates SECURITY_SPEC.md) |
> | Dependency policy | Advisory (warn on CVEs, block critical) |
> | Accessibility | WCAG 2.1 AA |
> | Content tone | Professional, concise |
> | Empty states | Onboarding CTAs for first-use, "no results" for filtered |
> | Loading states | Skeleton loading for pages, spinners for actions |
> | Resilience | Retry with exponential backoff for API calls |
> | Target devices | Desktop primary, mobile responsive |
>
> ##### API / Backend Service
>
> **Profile**: Backend service consumed by other applications. No user-facing UI.
> Any language (Node.js, Python, Go, Rust, Java, C#, etc.).
>
> | Category | Default Value |
> |----------|--------------|
> | Error handling | Structured JSON error responses |
> | Error format | Structured `{code, message, details, requestId}` |
> | Auth | API keys or JWT (depends on consumer type) |
> | Authorization | Scope-based or resource-based |
> | Testing | Framework-conventional test runner |
> | Test data | Factories for entities, fixtures for payloads |
> | Mock boundaries | Mock DB in unit, real test DB in integration, mock external APIs |
> | Coverage | High coverage on business logic, comprehensive integration |
> | API style | REST or gRPC, strict versioning |
> | Security depth | High (full SECURITY_SPEC.md, rate limiting, input validation) |
> | Dependency policy | Strict (block critical + high CVEs) |
> | Accessibility | N/A |
> | Content tone | N/A (no user-facing content) |
> | Resilience | Circuit breaker for upstream dependencies, retry with backoff |
> | Target devices | N/A |
>
> ##### CLI / Desktop Tool
>
> **Profile**: Command-line application or desktop tool. Any language.
>
> | Category | Default Value |
> |----------|--------------|
> | Error handling | stderr messages with exit codes |
> | Error format | Plain text with error codes |
> | Auth | None (or OS-level credentials if needed) |
> | Authorization | None (file system permissions) |
> | Testing | Framework-conventional test runner |
> | Test data | Fixtures (static test files) |
> | Mock boundaries | Mock file system and network in unit tests |
> | Coverage | Critical paths |
> | API style | N/A |
> | Security depth | Minimal (input validation only) |
> | Dependency policy | Advisory |
> | Content tone | Technical, terse |
> | Loading states | Progress bars or spinners for long operations |
> | Resilience | Retry for network operations, graceful degradation |
> | Target devices | N/A |
>
> ##### Library / Package
>
> **Profile**: Reusable library or package published for others to consume. Any language.
>
> | Category | Default Value |
> |----------|--------------|
> | Error handling | Typed errors / exceptions with clear messages |
> | Error format | Language-idiomatic error types |
> | Auth | N/A (consumer handles auth) |
> | Authorization | N/A |
> | Testing | Framework-conventional test runner, emphasis on edge cases |
> | Test data | Fixtures and property-based testing |
> | Mock boundaries | Mock external dependencies, test public API surface |
> | Coverage | High (public API 100%, internals critical paths) |
> | API style | N/A (library API, not HTTP) |
> | Security depth | Standard (input validation, no unsafe operations) |
> | Dependency policy | Minimal dependencies (fewer = better for consumers) |
> | Content tone | Technical, precise (API docs) |
> | Resilience | Defensive programming, clear error messages |
> | Target devices | N/A |
>
> ##### Prototype / Experiment
>
> **Profile**: Side project, prototype, learning exercise, hackathon. Speed over rigor.
>
> | Category | Default Value |
> |----------|--------------|
> | Error handling | Console output + basic try/catch |
> | Error format | Simple `{error: "message"}` |
> | Auth | None or basic (hardcoded credentials OK for prototyping) |
> | Authorization | None |
> | Testing | None or minimal |
> | Coverage | None required |
> | API style | Simple REST (no pagination needed for small datasets) |
> | Security depth | Skip (no SECURITY_SPEC.md generated) |
> | Dependency policy | None (no audit) |
> | Accessibility | None specified |
> | Content tone | Casual |
> | Loading states | Basic spinner |
> | Resilience | Skip |
> | Target devices | Desktop only |
>
> #### Mixing and Overriding
>
> The three levels are complementary, not exclusive. Common patterns:
>
> - **Brownfield**: Auto-detect fills most decisions, user overrides 2-3, research
>   generates the rest. Most efficient path.
> - **Greenfield with PRD**: Quick research generates a full profile from requirements.
>   User reviews and overrides.
> - **Quick start**: User picks a preset, auto-detect refines when code exists later.
> - **Custom mix**: "Use the API Service preset but with Web Application's auth and
>   the Library preset's testing approach" -- generate the defaults sheet with the
>   specified mix and let them review.
>
> The profile is a starting point, not a package deal. Every decision can be
> individually overridden regardless of its source.

---

### Strategy 2: Generate-Confirm (Changes 1, 6, 7, 21, 22)

**What**: Replace sequential Q&A with pre-generated proposals that the user reviews and overrides. Instead of asking 10 questions one by one, generate a defaults/proposal table and let the user mark exceptions.

**Why**: The audit found 14 sequential Q&A interaction points. The highest-impact targets are bootstrap discovery (up to 35 questions with P1/P2/P3), research Phase 2 requirements (up to 13 questions), and design setup preferences (up to 9 questions). Generate-confirm compresses each to a single review-and-override cycle.

**Applies to**:
- Bootstrap discovery (Change 1, covered in Strategy 1 above -- project profile system feeds the defaults sheet)
- Research Phase 2 scope definition (Change 6)
- Design setup preferences (Change 7)
- Spec mode gate check (Change 21)
- Start mode pre-checks (Change 22)
- All new P1-P3 question sets (follow this pattern when those proposals merge)

---

#### Change 6: Generate-Confirm for Research Phase 2 Scope

**Target file**: `skills/cl-researcher/SKILL.md`
**Target section**: Research Mode, Phase 2 description (after "This is the most important phase")

**Proposed** (add after the Phase 2 paragraph):

> **Generate-confirm for scope**: After enough conversation to understand the problem,
> generate a scope summary table (in-scope, out-of-scope, constraints, key questions to
> answer) pre-populated from system doc analysis + triage context. Present it for the user
> to confirm or adjust, rather than asking each scope boundary as a separate question. The
> conversation leading up to scope definition should remain warm and exploratory; the scope
> summary itself is a generate-confirm checkpoint.
>
> | Scope Dimension | Proposed | Source | Confirm? |
> |-----------------|----------|--------|----------|
> | In scope | [inferred from conversation] | Discussion | |
> | Out of scope | [inferred from constraints] | System docs + discussion | |
> | Constraints | [from system doc analysis] | Manifest read | |
> | Key questions | [from problem analysis] | Discussion | |
> | Success criteria | [from user goals] | Discussion | |
>
> The user reviews and adjusts: "In-scope is right, but add X to out-of-scope and remove
> constraint Y." One response instead of 5+ question-answer pairs.

---

#### Change 7: Generate-Confirm for Design Setup Preferences

**Target file**: `skills/cl-designer/references/setup-mode.md`
**Target section**: Phase 2: Design Discovery, Step 2 (Design Preferences)

**Current** (Step 2: Design Preferences):
> Fill in gaps not covered by visual references or component library research. Skip questions
> that are already answered. Don't dump all questions at once -- have a conversation.
>
> 1. **Overall aesthetic / mood** (skip if screenshots or library made this clear)
> 2. **Color preferences** (skip if library defaults are accepted)
> 3. **Typography** (skip if library defaults are accepted)
> 4. **Interaction patterns**
> 5. **Theme support**
> 6. **Constraints**

**Proposed** (replace Step 2):

> #### Step 2: Design Preferences (Generate-Confirm)
>
> **Read DECISIONS.md first.** Check for existing decisions in categories `design-direction`,
> `accessibility`, `responsive`. Use existing decisions as defaults in the table below.
>
> If Step 1 provided substantial input (component library researched, screenshots analyzed,
> or inspiration sites noted), switch to generate-confirm: present a design defaults table
> derived from the research, and let the user review and override.
>
> **Generate-confirm path** (when Step 1 gave enough input):
>
> "Based on [component library / screenshots / inspiration], here are the design defaults
> I'll use. Review and mark anything you want to change:"
>
> | Category | Value | Source | Override? |
> |----------|-------|--------|-----------|
> | Aesthetic | Minimal, clean | shadcn/ui defaults | |
> | Primary color | Blue (oklch scale) | shadcn/ui defaults | |
> | Neutral palette | Zinc gray | shadcn/ui defaults | |
> | Semantic colors | Green/amber/red/blue | shadcn/ui defaults | |
> | Typography | Geist Sans | shadcn/ui convention | |
> | Spacing | 4px base, Tailwind scale | shadcn/ui convention | |
> | Border radius | 0.5rem (md) | shadcn/ui defaults | |
> | Interaction mode | Mouse-first + keyboard | DECISIONS.md | |
> | Theme | Light + dark | User preference | |
> | Constraints | [any from conversation] | User stated | |
>
> The user reviews: "Change primary to indigo, bump border radius to lg, rest looks good."
>
> **Freeform path** (when Step 1 didn't provide enough input):
>
> Fall back to conversational discovery. Don't dump all questions at once -- have a
> conversation:
>
> 1. **Overall aesthetic / mood**: "What overall feel are you going for?"
> 2. **Color preferences**: "Any color preferences?"
> 3. **Typography**: "Typography preference?"
> 4. **Interaction patterns**: "Keyboard-first, mouse-first, or touch-first?"
> 5. **Theme support**: "Dark mode, light mode, or both?"
> 6. **Constraints**: "Any existing brand guidelines or constraints?"
>
> After the freeform conversation, still generate the summary table (Step 4: Confirm
> Design Direction) for explicit confirmation.

---

#### Change 21: Batch Warnings for Spec Mode Gate Check

**Target file**: `skills/cl-implementer/references/spec-mode.md`
**Target section**: Step 1: Waterfall Gate Check

**Proposed** (add after the four gate checks):

> **Batch presentation**: Present all gate check results as a single status table rather
> than sequential warnings:
>
> | Check | Status | Details |
> |-------|--------|---------|
> | Active research | Clear / Warning | [details if warning] |
> | In-flight proposals | Clear / Warning | [details] |
> | Unverified merges | Clear / Warning | [details] |
> | Context freshness | Clear / Advisory | [details] |
>
> "Gate check complete. [N issues found / All clear]. Proceed?"
>
> The user makes one go/no-go decision for the batch. If any check is a hard blocker
> (e.g., unverified merge), call it out prominently: "1 blocker: unverified merge for
> P-003 must be resolved before spec generation. 2 advisories: context staleness."

---

#### Change 22: Batch Warnings for Start Mode Pre-Checks

**Target file**: `skills/cl-implementer/references/start-mode.md`
**Target section**: Step 1: Pre-Checks

**Proposed** (add after the five pre-checks):

> **Batch presentation**: Present all pre-check results as a single status table:
>
> | Check | Status | Action Needed |
> |-------|--------|--------------|
> | Specs exist | Pass | -- |
> | Spec review | Advisory | Not reviewed yet (recommend `/cl-implementer spec-review`) |
> | Git repository | Pass / Action | [init or skip] |
> | Spec coverage | Pass / Gaps | [list gaps with recommended action per gap] |
> | Context freshness | Pass / Stale | [list stale libraries with recommended action] |
>
> "Pre-checks complete. [N items need attention]. Address now or proceed?"
>
> For each gap or stale item, include a recommended action inline so the user can approve
> the batch in one response: "Specs not reviewed: recommend running spec-review first but
> not blocking. Git repo: initialized. Context for drizzle-orm: stale (7 days), recommend
> refresh. Proceed with these defaults, or adjust?"

---

### Strategy 3: Batch Review (Changes 5, 8, 9, 10, 11, 12)

**What**: Present all generated artifacts as a set for review instead of serial one-at-a-time review. The user reviews the batch and flags specific items for revision, rather than giving feedback on each item individually.

**Why**: The audit found 5 serial review interaction points. Converting tokens component validation from per-component to per-category saves N-1 turns per category. Converting mockups from per-screen to per-flow saves significant turns for projects with 10+ screens.

**Default behavior**: Batch review. Serial available via `ux.reviewStyle: "serial"` config. A third option, `"minimal"`, auto-approves with summary for experienced users.

---

#### Change 5: Batch Selection for Context Mode Libraries

**Target file**: `skills/cl-researcher/references/context-mode.md`
**Target section**: Step 1: Identify Libraries

**Current** (user prompt):
> "Your tech stack includes [N] libraries. Context status:
> - [library A] v[X]: No context exists -- create?
> - [library B] v[Y]: Context exists, version matches -- skip or refresh?
> - [library C] v[Z]: Context exists but covers v[old] -- update needed?
> Select which to process, or 'all' for everything."

**Proposed** (replace the user prompt):

> "Your tech stack includes [N] libraries. Here's my recommendation:
>
> | Library | Version | Status | Recommendation | Action |
> |---------|---------|--------|---------------|--------|
> | [A] | v[X] | No context | Create | **Create** |
> | [B] | v[Y] | Current | Skip | Skip |
> | [C] | v[Z] | Stale (v[old]) | Update | **Update** |
> | [D] | v[W] | Current, fresh | Skip | Skip |
>
> I'll process the bolded items. Change any actions, or proceed?"
>
> The user can confirm ("proceed"), adjust ("skip C, add B"), or expand ("process all").
> Default: process recommended items only.

---

#### Changes 8-9: Batch Review for Tokens Mode

**Target file**: `skills/cl-designer/references/tokens-mode.md`

**Change 8 -- Component Validation (replace Step 4 Visual Validation Loop)**:

> #### Step 4: Component Validation
>
> **Check the review style** from `.clarity-loop.json` (`ux.reviewStyle`). Default is
> `"batch"`. If `"serial"`, use the serial path below.
>
> ##### Batch Review (Default)
>
> Generate ALL components first (Steps 3.1-3.5 above), then present them as a set:
>
> 1. **Generate all components** before presenting any for review. Use `snapshot_layout`
>    after each `batch_design` call to catch overlaps -- fix layout issues immediately, but
>    don't stop for user feedback yet.
>
> 2. **Present the batch.** Two presentation options depending on path:
>
>    **Pencil path**: Take a grid screenshot showing all component categories
>    (or one screenshot per category if the grid is too dense). Present with a summary table:
>
>    | Component | Variants | PRD Feature | Tokens Used | Status |
>    |-----------|----------|-------------|-------------|--------|
>    | Button | primary, secondary, ghost | Task actions, forms | primary-500, space-3 | Review |
>    | Input | text, email, password | Forms, search | neutral-200, space-2 | Review |
>    | Card | default, compact | Task list, dashboard | neutral-50, shadow-md | Review |
>    | ... | ... | ... | ... | Review |
>
>    "Here are all [N] components. Review the summary and screenshots. Flag any that need
>    changes -- I'll revise those and leave the rest as-is."
>
>    **Markdown fallback path**: Present the full component spec table. Same summary format.
>
> 3. **Gather batch feedback.** The user responds with specific items to revise:
>    - "Button loading state needs work, Card padding too tight, rest looks good"
>    - "All approved"
>    - "I want to review Input and Modal more closely" (switches to serial for those items)
>
> 4. **Revise flagged items.** For each flagged component:
>    - Apply the feedback
>    - Re-screenshot the specific component (zoomed in)
>    - Present the revision: "Updated Button loading state. Here's the before and after."
>    - If Pencil: re-run `snapshot_layout` to verify no new overlaps
>
> 5. **Record all decisions** in DESIGN_PROGRESS.md -- both batch-approved and individually
>    revised components.
>
> **Efficiency note**: Most components are approved without changes. Batch review turns
> N interruptions into 1 + K (where K is the number flagged for revision, typically 2-3).
>
> ##### Serial Review (Opt-in)
>
> When `ux.reviewStyle` is `"serial"`, or when the user requests "I want to review each
> component individually":
>
> For each component (or small batches of related components):
> 1. Call `get_screenshot` of the specific component group
> 2. Call `snapshot_layout` to check for layout issues
> 3. Present screenshot to user with component name, PRD feature, variants, tokens used
> 4. Gather feedback: Approved / Needs changes / Rejected
> 5. Record all decisions and iterations in DESIGN_PROGRESS.md
>
> ##### Minimal Review (Opt-in)
>
> When `ux.reviewStyle` is `"minimal"`:
>
> Generate all components, present a one-line summary per component, and auto-approve
> unless the user speaks up. Record with `[auto-approved]` tag in DESIGN_PROGRESS.md.

**Change 9 -- Token Section Screenshots** (add note after Steps 6-7 token section presentation):

> **Batch option for token sections**: When `ux.reviewStyle` is `"batch"`, present all
> three token sections (colors, typography, spacing) together with a summary table before
> individual screenshots. "Here's your design token overview: [summary]. Want to see each
> section in detail, or does the summary cover it?" If the user wants details, show
> section-by-section screenshots. If the summary is sufficient, proceed to components.
> Default for token sections is still sectional (colors then typography then spacing) because
> the feedback on these tends to be substantive. The batch option is for experienced users
> who know what they want.

---

#### Changes 10-12: Batch Review for Mockups Mode

**Target file**: `skills/cl-designer/references/mockups-mode.md`

**Change 10 -- Pencil Screen Review (replace feedback loop section)**:

> #### Screen Review
>
> **Check the review style** from `.clarity-loop.json` (`ux.reviewStyle`). Default is
> `"batch"`. If `"serial"`, use the serial path below.
>
> ##### Batch Review (Default)
>
> Generate ALL screens before presenting any for review:
>
> 1. **Generate all screens** (Step 2 per-screen generation above). Run `snapshot_layout`
>    after each `batch_design` call. Fix overlaps immediately but don't stop for user
>    feedback.
>
> 2. **Present the batch.** Take one screenshot per screen group (feature area), or a
>    grid if the screen count is small (<=6). Present with a summary:
>
>    | Screen | PRD Features | Components Used | Screenshots |
>    |--------|-------------|-----------------|-------------|
>    | Dashboard | Task overview, metrics | Card, Badge, Nav | [screenshot link] |
>    | Task List | CRUD, filtering, bulk | Card, Button, Select, Input | [screenshot link] |
>    | Settings | User prefs, theme | Input, Select, Toggle | [screenshot link] |
>
>    "Here are all [N] screens. Review the layouts and flag any that need changes."
>
> 3. **Gather batch feedback.** User responds: "Dashboard card layout is wrong, Settings
>    page needs more spacing, rest looks good."
>
> 4. **Revise flagged screens.** Discuss the specific issue, apply updates, re-screenshot.
>
> 5. **Record** batch-approved and revised screens in DESIGN_PROGRESS.md.
>
> ##### Serial Review (Opt-in)
>
> When `ux.reviewStyle` is `"serial"`: present one screen at a time with the existing
> feedback loop (Approved / Needs changes / Major rework).

**Change 11 -- Markdown Screen Review**: Same batch pattern applied to Markdown Fallback Step 2. Present all screen specs as a set with a summary table, user flags items needing changes.

**Change 12 -- Behavioral Walkthrough Batch (coordinates with P1)**:

> #### Behavioral Walkthrough: Batch Mode
>
> When `ux.reviewStyle` is `"batch"` (default), the behavioral walkthrough runs in
> generate-confirm mode instead of per-screen conversational mode:
>
> 1. **Generate behavioral specs for all screens at once.** Use DECISIONS.md entries
>    to inform defaults (e.g., "error handling: toast notifications" becomes the default
>    error state for all screens).
>
> 2. **Present the batch as a review table:**
>
>    | Screen | States Defined | Key Interactions | Nav Context | Content Notes |
>    |--------|---------------|------------------|-------------|---------------|
>    | Dashboard | default, empty, loading, error | View task, filter | `/dashboard`, auth | Empty: "Create your first task" |
>    | Task List | default, empty (filtered), loading | Add, edit, delete, bulk | `/tasks`, auth | Filtered empty: "No tasks match" |
>    | Settings | default, saving, error | Edit prefs, toggle theme | `/settings`, auth | -- |
>
> 3. **Gather batch feedback:** "Dashboard empty state should have an illustration.
>    Task List needs an offline state. Rest looks good."
>
> 4. **Revise flagged items.** Update the behavioral spec for specific screens.
>
> **When `ux.reviewStyle` is `"serial"`**: Run the full conversational walkthrough per
> screen. **Hybrid**: batch-approve most, serial walkthrough for 1-2 complex screens.

---

### Strategy 4: Tiered Checkpoints (Changes 13, 14, 15, 23)

**What**: Classify every interaction point into one of three tiers based on decision importance. Tier 1 stops the pipeline. Tier 2 groups items for batch review. Tier 3 auto-proceeds with audit trail.

**Why**: The audit found 39 confirmation gates and 9 format/option choices. Not all deserve the same level of attention. Merge authorization and design direction lock are fundamentally different from context promotion and checklist self-assessment. Treating them identically creates decision fatigue.

**Configurable**: The `ux.autoDefaults` setting controls the auto-proceed boundary:
- `"none"` -- everything requires review (most conservative)
- `"tier3"` (default) -- Tier 3 items auto-proceed
- `"tier2-3"` -- Tier 2 and 3 items auto-proceed (most aggressive, for experienced users)

---

#### Change 13: Tiered Checkpoint System in Design Checklist

**Target file**: `skills/cl-designer/references/design-checklist.md`
**Target section**: New section before Tokens Checklist

**Proposed**:

> ## Checkpoint Tiering
>
> Not all decisions deserve the same level of attention. The tier system controls when
> the pipeline stops for user input:
>
> | Tier | Behavior | Examples |
> |------|----------|---------|
> | **Tier 1 -- Must Confirm** | Pipeline stops. Waits for explicit user approval. | Design direction, screen inventory, build plan, architecture decisions (auth strategy, testing framework), spec format, merge plan, structure lock, research approval |
> | **Tier 2 -- Batch Review** | Generated in batch. User reviews the set and flags issues. | Token palette values, component set, behavioral states per component, screen states, navigation context, error handling per endpoint, task list details, reconciliation summaries, correction manifests |
> | **Tier 3 -- Auto-proceed** | Generated with sensible defaults. Logged to DECISIONS.md with `[auto-default]` tag. User can review later but pipeline doesn't stop. | Individual accessibility compliance details, edge case lists per spec, API convention inheritance per endpoint, contract test generation, supply chain checks (flag issues only), checklist self-assessment, spec hash match (auto-proceed), status reports, session orientation, handoff messages, advisory nudges |
> | **— (Warmth-governed)** | Not a checkpoint. Conversational interaction kept warm by design. No tier classification applies — these are multi-turn discussions, not gating decisions. | Bootstrap discovery fundamentals (R15), research refinement conversation (R9), design visual reference gathering (D4) |
>
> **Configuration**: The `ux.autoDefaults` setting in `.clarity-loop.json` controls the
> auto-proceed boundary:
> - `"none"` -- everything requires review (most conservative)
> - `"tier3"` (default) -- Tier 3 items auto-proceed
> - `"tier2-3"` -- Tier 2 and 3 items auto-proceed (most aggressive, for experienced users)
>
> **Audit trail**: Every Tier 3 auto-proceed decision is logged to DECISIONS.md with:
> - `[auto-default]` tag
> - The default value chosen
> - The source (auto-detected, research-generated, preset, derived from project type, spec analysis)
> - Timestamp
>
> The user can search DECISIONS.md for `[auto-default]` and override any decision at any
> time.

---

#### Change 14: Tokens Checklist with Tier Column

**Target file**: `skills/cl-designer/references/design-checklist.md`
**Target section**: Tokens Checklist

**Proposed** (replace existing table):

> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All colors defined as tokens | Review DESIGN_SYSTEM.md color section | 3 |
> | 2 | Typography scale defined | Font families, size scale, weights, line heights | 3 |
> | 3 | Spacing scale defined | Base unit + scale documented | 3 |
> | 4 | Core components generated | Cross-reference PRD features | 2 |
> | 5 | Components use tokens (not hardcoded) | Pencil search or markdown check | 3 |
> | 6 | Each component reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 7 | DESIGN_SYSTEM.md generated | File exists with token + component catalog | 3 |
> | 8 | User approved | Explicit user confirmation | 1 |

---

#### Change 15: Mockups Checklist with Tier Column

**Target file**: `skills/cl-designer/references/design-checklist.md`
**Target section**: Mockups Checklist

**Proposed** (replace existing table):

> | # | Check | How to Verify | Tier |
> |---|-------|---------------|------|
> | 1 | All major PRD views have mockups | Cross-reference PRD features | 2 |
> | 2 | Mockups use design system components | Pencil ref nodes or markdown refs | 3 |
> | 3 | Responsive states represented (if applicable) | Conditional check | 3 |
> | 4 | Each mockup reviewed by user | DESIGN_PROGRESS.md approval entries | 2 |
> | 5 | UI_SCREENS.md generated | File exists with screen-to-feature mapping | 3 |
> | 6 | User approved | Explicit user confirmation | 1 |

**When P1's checklist items are added**, they receive these tiers:
- Component behavioral states: Tier 2
- Interactive state triggers: Tier 2
- Contrast ratios: Tier 3
- Keyboard interactions: Tier 3
- Focus indicators: Tier 3
- Component boundary behavior: Tier 3
- Behavioral walkthroughs completed: Tier 2
- Empty/loading/error states: Tier 2
- Key interaction flows: Tier 2
- Navigation context: Tier 2
- Non-default state content: Tier 2
- User approved (behavioral): Tier 1

---

#### Change 23: Tiered Checkpoint Documentation in Autopilot

**Target file**: `skills/cl-implementer/references/autopilot-mode.md`
**Target section**: Step 3h: Checkpoint Evaluation

**Proposed** (add after the existing checkpoint evaluation content):

> **Tier awareness at checkpoints**: When presenting a checkpoint summary (Step 4),
> categorize items by tier:
> - **Tier 1 items** (must-confirm): Always present prominently. These are the items
>   that justify the checkpoint stop.
> - **Tier 2 items** (batch review): Present as a summary table. The user reviews the
>   batch and flags specific items.
> - **Tier 3 items** (auto-proceeded): Listed in a collapsed "auto-decisions" section.
>   The user can expand to review but doesn't need to.
>
> This prevents checkpoint summaries from being overwhelmed by low-importance items
> when the user really needs to focus on the 1-2 decisions that matter.

---

### Strategy 5: Parallel Generation (Changes 16, 17, 24, 25)

**What**: Document specific opportunities for pre-generating downstream work while the user reviews current work. Each hint includes an invalidation risk assessment.

**Why**: The pipeline is sequential by nature -- tokens before mockups, mockups before build plan, specs before tasks. But within each transition, the user review period is idle time for the skill. Pre-generating likely-correct downstream work during review cuts wall-clock time.

**Configurable**: The `ux.parallelGeneration` setting controls this (default: `true`).

---

#### Change 16: Parallelization Hints for Tokens Mode

**Target file**: `skills/cl-designer/references/tokens-mode.md`
**Target section**: New section after "All Paths: Generate DESIGN_SYSTEM.md"

**Proposed**:

> ### Parallelization Hints
>
> When `ux.parallelGeneration` is `true` (default):
>
> | User is reviewing... | Skill can pre-generate... | Invalidation risk |
> |---------------------|--------------------------|-------------------|
> | Color token values | Typography and spacing sections | Low -- colors rarely affect type/spacing |
> | Typography screenshot | Spacing section | Low |
> | Component plan confirmation | Start generating minimum-set components | Medium -- user may add/remove from plan |
> | Component batch review | DESIGN_SYSTEM.md output file | Low -- output is derived from approved tokens + components |
>
> **Implementation**: Subagent dispatch for pre-generation. Main context handles user
> interaction. Discard pre-generated work if user feedback invalidates it.

---

#### Change 17: Parallelization Hints for Mockups Mode

**Target file**: `skills/cl-designer/references/mockups-mode.md`
**Target section**: New section after "All Paths: Generate UI_SCREENS.md"

**Proposed**:

> ### Parallelization Hints
>
> When `ux.parallelGeneration` is `true` (default):
>
> | User is reviewing... | Skill can pre-generate... | Invalidation risk |
> |---------------------|--------------------------|-------------------|
> | Screen inventory confirmation | Start generating confirmed screens | Low -- inventory is usually approved as-is |
> | Screen batch (visual review) | Behavioral specs for all screens | Medium -- screen changes may affect behavioral specs |
> | Behavioral spec batch review | UI_SCREENS.md output file | Low |
> | Build plan review | Spec generation prep (read all system docs) | Medium -- build plan changes may affect spec approach |
>
> **Key opportunity**: While the user reviews the visual mockup batch, pre-generate ALL
> behavioral specs. This is the highest-value parallelization -- behavioral specs are
> derived from DECISIONS.md + PRD + mockups, and the mockup batch is rarely rejected wholesale.

---

#### Change 24: Parallelization Hints for Spec Mode

**Target file**: `skills/cl-implementer/references/spec-mode.md`
**Target section**: New note after Step 6

**Proposed**:

> **Parallelization hint**: While the user reviews the spec format suggestion (Step 3),
> pre-read all system docs in parallel (Step 2) using subagent dispatch. If the user
> confirms the format, spec generation begins immediately with docs already loaded.
> Invalidation risk: Low -- format change only affects output structure, not content
> gathering.

---

#### Change 25: Parallelization Hints for Start Mode

**Target file**: `skills/cl-implementer/references/start-mode.md`
**Target section**: New note after Step 7

**Proposed**:

> **Parallelization hint**: While the user reviews the task list (Step 5), pre-populate
> Claude Code tasks (Step 7) for tasks that are dependency-free. If the user reorders,
> update the task dependencies but the basic task entries are already created.
> Invalidation risk: Medium -- user may split/merge/reorder tasks.

---

### Strategy 6: Decision Flow (Changes 3, 4, 18, 26, 27, 29)

**What**: Formalize DECISIONS.md as the single source of truth for cross-cutting decisions. Every skill reads DECISIONS.md before asking questions. Every decision is written with a category tag. Duplicate questions across skills are eliminated.

**Why**: The audit found 3 explicit decision flow candidates and identified that ALL 78 interaction points benefit from checking DECISIONS.md first. The current pipeline has no protocol for avoiding duplicate questions -- bootstrap might ask about error handling, then mockups mode might re-ask through the behavioral walkthrough, then spec gen might ask about error format. The decision flow protocol eliminates this redundancy.

**15 Standard Categories**: `auth`, `authorization`, `errors`, `testing`, `api-style`, `accessibility`, `security`, `content`, `resilience`, `type-sharing`, `dependencies`, `responsive`, `design-direction`, `spec-format`, `checkpoint-level`.

---

#### Change 3: Decision Flow Protocol in cl-researcher

**Target file**: `skills/cl-researcher/SKILL.md`
**Target section**: Guidelines section (add at end)

**Proposed**:

> - **Decision flow: read before asking.** Before asking the user any question, check
>   DECISIONS.md for an existing decision in the same category. If found, use it. If the
>   existing decision doesn't fully answer your question, reference it: "DECISIONS.md says
>   error handling uses toast notifications (from bootstrap). For this specific context, should
>   I use the same pattern or something different?" Only re-ask if the context is genuinely
>   different from when the original decision was made.
>
>   Decision categories: `auth`, `authorization`, `errors`, `testing`, `api-style`,
>   `accessibility`, `security`, `content`, `resilience`, `type-sharing`, `dependencies`,
>   `responsive`, `design-direction`, `spec-format`, `checkpoint-level`.
>
>   Each decision in DECISIONS.md has a category tag. When logging new decisions, always
>   include the category so downstream modes can find them.

---

#### Change 4: Warmth Gradient in cl-researcher

**Target file**: `skills/cl-researcher/SKILL.md`
**Target section**: Guidelines section (add at end)

**Proposed**:

> - **Warmth gradient.** Early in the pipeline (bootstrap, research, design setup), the
>   interaction should be warm and conversational -- the user is figuring out what they want.
>   Ask open-ended questions, explore together, summarize understanding. Later in the
>   pipeline (spec generation, implementation, verification), the interaction should be
>   efficient and mechanical -- the user knows what they want and wants it built. Use
>   generate-confirm, present tables, minimize conversational overhead. The transition is
>   gradual: bootstrap is the warmest, implementation is the coolest. Design sits in the
>   middle -- warm during setup discovery, efficient during tokens and mockups review.

---

#### Change 18: Decision Flow Protocol in cl-designer

**Target file**: `skills/cl-designer/SKILL.md`
**Target section**: Guidelines section (add at end)

**Proposed**:

> - **Decision flow: read before asking.** Before asking the user any design question,
>   check DECISIONS.md for existing decisions in the relevant category (`design-direction`,
>   `accessibility`, `errors`, `content`, `responsive`). Use existing decisions as defaults.
>   When generating batch behavioral specs, use DECISIONS.md entries to derive defaults for
>   all screens simultaneously rather than asking per-screen questions.

---

#### Change 26: Decision Flow Protocol in cl-implementer

**Target file**: `skills/cl-implementer/SKILL.md`
**Target section**: Guidelines section (add at end)

**Proposed**:

> - **Decision flow: read before asking.** Before making implementation decisions, check
>   DECISIONS.md for existing decisions in the relevant category (`testing`, `api-style`,
>   `errors`, `security`, `dependencies`, `type-sharing`, `spec-format`). When TEST_SPEC.md,
>   SECURITY_SPEC.md, or API conventions reference DECISIONS.md entries, those decisions are
>   already baked in -- don't re-ask. When encountering an L1 spec gap that matches a
>   DECISIONS.md category, check if a decision already exists that resolves it.

---

#### Change 27: Decision Flow Protocol in cl-reviewer

**Target file**: `skills/cl-reviewer/SKILL.md`
**Target section**: Guidelines section (add at end)

**Proposed**:

> - **Decision flow: check before flagging.** When reviewing a proposal, check DECISIONS.md
>   for prior decisions in the same area. If a proposal seems to contradict a prior decision,
>   distinguish between: (a) intentional reversal (the proposal explicitly addresses the old
>   decision) and (b) accidental contradiction (the proposal author may not have known about
>   the prior decision). Flag (b) as a blocking issue; note (a) as context. When merging,
>   update DECISIONS.md if the merge supersedes a prior decision.

---

#### Change 29: DECISIONS.md Category Tag Protocol

**Target file**: `docs/pipeline-concepts.md`
**Target section**: DECISIONS.md section (add after existing content)

**Proposed** (add to DECISIONS.md section):

> #### Category Tags
>
> Every decision logged to DECISIONS.md includes a category tag for cross-skill lookup.
> Standard categories:
>
> | Category | Scope | Consumed By |
> |----------|-------|-------------|
> | `auth` | Authentication strategy | spec-gen, implementer |
> | `authorization` | Authorization model | spec-gen, implementer |
> | `errors` | Error handling, display, format | designer (behavioral), spec-gen, implementer |
> | `testing` | Framework, boundaries, coverage | spec-gen (TEST_SPEC.md), implementer |
> | `api-style` | Conventions, pagination, naming | spec-gen, implementer |
> | `accessibility` | WCAG level, interaction mode | designer, implementer |
> | `security` | Depth, compliance, dependency policy | spec-gen (SECURITY_SPEC.md), implementer |
> | `content` | Tone, empty states | designer (behavioral walkthrough) |
> | `resilience` | Offline, loading, retry | designer, spec-gen |
> | `type-sharing` | Cross-boundary types | spec-gen, implementer |
> | `dependencies` | Policy, governance | implementer (supply chain) |
> | `responsive` | Viewports, breakpoints | designer |
> | `design-direction` | Aesthetic, colors, typography | designer (all modes) |
> | `spec-format` | Spec output format | spec-gen |
> | `checkpoint-level` | Autopilot oversight | implementer |
>
> Skills read DECISIONS.md at session start. Before asking any question that maps to a
> category, check for an existing decision. If found, use it as the default. If the
> context has genuinely changed, reference the existing decision when asking.
>
> Categories are convention, not schema -- new categories can be added. The standard
> list covers the cross-cutting concerns identified across all four skills.
>
> **Multi-category decisions**: Many decisions span multiple categories (e.g., "JWT for
> API authentication" is both `auth` and `api-style`). The Category field supports
> comma-separated values. Cross-skill lookup matches on ANY category in the list, so
> a decision tagged `auth, api-style` is found whether a skill searches for `auth` or
> `api-style`.
>
> **Decision entry format with category tag:**
>
> ```markdown
> ### D-NNN: [Decision Title]
> **Category**: [category tag, category tag, ...]
> **Date**: YYYY-MM-DD
> **Source**: [auto-detected | research-generated | preset:Web Application | user override | auto-default | from discovery | bootstrap | research:R-NNN | implementation:T-NNN]
> **Decision**: [What was decided]
> **Rationale**: [Why -- one sentence is fine for compact entries]
> ```
>
> The `Source` field enables audit: filter by `auto-default` to review all automated
> decisions, filter by `preset:*` to see which defaults came from a preset, or
> `auto-detected` to see what was derived from the codebase.
>
> **Precedence rules for conflicting sources:**
>
> When generating the defaults sheet during bootstrap, multiple sources may produce
> conflicting values for the same category (e.g., auto-detect finds Vitest but an
> existing DECISIONS.md entry says Jest). Resolution order:
>
> 1. **Existing DECISIONS.md entries** (explicit prior human decisions) — always win
> 2. **Auto-detected from code** (Level 1) — wins over research and presets
> 3. **Research-generated** (Level 2) — wins over presets
> 4. **Preset defaults** (Level 3) — lowest priority
>
> When a higher-priority source overrides a lower one, the defaults sheet shows both:
> `"Testing: Vitest [auto-detected] | Prior decision D-012: Jest [CONFLICT — resolve?]"`
> The user resolves conflicts during defaults sheet review.
>
> When an existing DECISIONS.md entry conflicts with auto-detect, the existing entry
> wins (it represents a deliberate prior choice), but auto-detect flags the conflict
> so the user can update the decision if circumstances changed.
>
> **Decision conflict resolution (supersession):**
>
> When a later decision overrides an earlier one in the same category:
> 1. The new entry is written with a supersession note: `**Supersedes**: D-NNN`
> 2. The original entry is marked: `**Status**: Superseded by D-MMM`
> 3. The user is notified at the point of override: "Overriding D-NNN ([category]:
>    [old value]) with [new value]. Reason: [context]."
>
> This ensures the decision log is auditable — no silent overwrites. The original
> rationale is preserved for future reference.
>
> **Cold start (no DECISIONS.md):** If DECISIONS.md doesn't exist, decision flow
> lookups return empty (all decisions are new). The defaults sheet becomes the first
> bulk write to DECISIONS.md. This is the expected path for new projects.

---

### Supporting Changes (Changes 19, 20, 28, 30)

#### Changes 19-20: SKILL.md Summary Updates for cl-designer

**Change 19 -- Tokens Mode summary** (replace current summary):

**Target file**: `skills/cl-designer/SKILL.md`
**Target section**: Tokens Mode section

**Proposed**:

> Tokens mode generates design tokens (colors, typography, spacing) and a reusable component
> library. Two paths based on the MCP detected during setup: Pencil generates from scratch,
> markdown fallback documents everything as structured specs. Both paths produce
> DESIGN_SYSTEM.md.
>
> The default review style is **batch**: all components are generated, then presented as a set
> for the user to review and flag items for revision. Serial review (one component at a time)
> is available via the `ux.reviewStyle` config. For Pencil path, the core loop is generate all
> then batch screenshot then batch feedback then revise flagged items.

**Change 20 -- Mockups Mode summary** (add to end of current):

**Target file**: `skills/cl-designer/SKILL.md`
**Target section**: Mockups Mode section

**Proposed** (add after existing paragraph):

> The default review style is **batch**: all screens are generated, then presented as a set.
> The user flags specific screens for revision. Serial review (one screen at a time) is
> available via `ux.reviewStyle` config.

---

#### Change 28: UX Configuration Section

**Target file**: `docs/pipeline-concepts.md`
**Target section**: Configuration section

**Proposed** (update the config example and table):

> ```json
> {
>   "version": 1,
>   "docsRoot": "docs",
>   "implementer": {
>     "checkpoint": "every"
>   },
>   "ux": {
>     "reviewStyle": "batch",
>     "profileMode": "auto",
>     "autoDefaults": "tier3",
>     "parallelGeneration": true
>   }
> }
> ```
>
> | Field | Default | Description |
> |-------|---------|-------------|
> | `version` | `1` | Config format version |
> | `docsRoot` | `"docs"` | Base path for all documentation directories |
> | `implementer.checkpoint` | `"every"` | Autopilot oversight level: `"none"`, `"phase"`, a number (every N tasks), or `"every"` (task-by-task) |
> | `ux.reviewStyle` | `"batch"` | How artifacts are presented for review: `"batch"` (generate all, review set), `"serial"` (one at a time), `"minimal"` (auto-approve with summary) |
> | `ux.profileMode` | `"auto"` | Project profile detection mode: `"auto"` (auto-detect from code, research gaps, presets as fallback), `"preset"` (skip auto-detect, go straight to presets), `"off"` (skip profile system, go freeform) |
> | `ux.autoDefaults` | `"tier3"` | Which checkpoint tiers auto-proceed: `"none"` (most conservative), `"tier3"` (default), `"tier2-3"` (most aggressive) |
> | `ux.parallelGeneration` | `true` | Pre-generate downstream work while user reviews current step |

---

#### Change 30: Warmth Gradient Section

**Target file**: `docs/pipeline-concepts.md`
**Target section**: New section after Configuration

**Proposed**:

> ## Warmth Gradient
>
> The pipeline's interaction style shifts gradually from warm to efficient:
>
> | Pipeline Stage | Warmth | Interaction Style |
> |---------------|--------|-------------------|
> | Bootstrap, Research | Warm | Open-ended questions, exploration, summarize understanding. The user is discovering what they want. Don't rush. |
> | Design Setup | Warm-Medium | Conversational discovery with generate-confirm for preferences when prior input is sufficient |
> | Tokens, Mockups | Medium | Batch review, generate-confirm, focused feedback. Tables over conversation. |
> | Spec Generation | Medium-Cool | Generate-confirm for format, batch gate checks. Minimal conversation. |
> | Implementation | Cool | Task-by-task or autopilot, tiered checkpoints, no exploratory conversation |
> | Verification, Review | Cool | Report output, pass/fail, decision-only interaction |
>
> Early stages are exploratory -- the user is figuring out what they want. Later stages
> are deterministic -- the user knows what they want and wants it built. Match the
> interaction style to the decision-making mode.
>
> **This is a guideline, not a constraint.** If a user wants to have a detailed discussion
> during implementation, have one. The gradient describes the default energy, not a rule.

---

## Complete Interaction Audit with Optimization Mapping

The full audit is in `docs/research/INTERACTION_AUDIT.md`. Below is the complete mapping of all 78 interaction points to their proposed optimizations.

### cl-researcher (22 points)

| # | Mode | Interaction Point | Current Type | Optimization | Tier |
|---|------|------------------|-------------|--------------|------|
| R1 | session-start | Pipeline state orientation | Feedback loop | Tier 3: auto-display and proceed | 3 |
| R2 | session-start | Stale marker detection | Confirmation gate | Tier 1: keep -- crash recovery | 1 |
| R3 | session-start | Active research ambiguity | Feedback loop | Decision flow: auto-suggest from RESEARCH_LEDGER status; only ask if 2+ active | 3 |
| R4 | triage | Topic input | Sequential Q&A | Tier 3: skip if topic stated in invocation | 3 |
| R5 | triage | Complexity assessment | Confirmation gate | Tier 2: present assessment + pipeline depth as single card | 2 |
| R6 | research | Phase 2 initial questions | Sequential Q&A | Generate-confirm: pre-fill scope table from system doc analysis (Change 6) | 2 |
| R7 | research | Phase 2 deeper questions | Sequential Q&A | Generate-confirm: generate scope/constraints table, user corrects deltas (Change 6) | 2 |
| R8 | research | Phase 2 scope confirmation | Confirmation gate | Tier 1: keep -- gates research execution | 1 |
| R9 | research | Phase 5 refinement | Feedback loop | Keep conversational (warmth gradient) | — |
| R10 | research | Phase 5 approval | Confirmation gate | Tier 1: keep -- gates downstream pipeline | 1 |
| R11 | structure | Structure suggestion | Confirmation gate | Tier 2: present as complete table with rationale | 2 |
| R12 | structure | Structure lock | Confirmation gate | Tier 1: keep -- irreversible commitment | 1 |
| R13 | proposal | Handoff notification | Feedback loop | Tier 3: informational, no decision | 3 |
| R14 | proposal | Present and handoff | Feedback loop | Tier 3: same | 3 |
| R15 | bootstrap | Discovery fundamentals | Sequential Q&A | Keep conversational (warmth gradient: early = warm) | — |
| R16 | bootstrap | Discovery deeper questions | Sequential Q&A | Generate-confirm: defaults sheet after fundamentals (Change 1) | 2 |
| R17 | bootstrap | Project profile detection | NEW | Three-level profile: auto-detect from code, research gaps, presets as fallback (Change 1) | 2 |
| R18 | bootstrap | Doc set suggestion | Confirmation gate | Tier 1: keep -- architecture-level decision | 1 |
| R19 | bootstrap-brownfield | Import path choice | Format/option choice | Tier 1: keep -- one-time architecture choice | 1 |
| R20 | bootstrap-brownfield | Doc mapping confirmation | Confirmation gate | Tier 2: present full mapping table, single confirm | 2 |
| R21 | bootstrap-brownfield | Code analysis follow-ups | Sequential Q&A | Generate-confirm: pre-generate project summary from code (Change 1 pattern) | 2 |
| R22 | context | Library selection | Sequential choice | Batch selection: recommendation table (Change 5) | 2 |

### cl-designer (24 points)

| # | Mode | Interaction Point | Current Type | Optimization | Tier |
|---|------|------------------|-------------|--------------|------|
| D1 | session-start | Pipeline state report | Feedback loop | Tier 3: auto-display and continue | 3 |
| D2 | session-start | Corrupted progress file | Confirmation gate | Tier 1: keep -- significant fork in recovery | 1 |
| D3 | setup | Re-run warning | Confirmation gate | Tier 1: keep -- destructive reset | 1 |
| D4 | setup | Visual references | Sequential Q&A | Keep conversational (warmth: design discovery = warm) | — |
| D5 | setup | Library research confirmation | Confirmation gate | Tier 2: present defaults as editable token table | 2 |
| D6 | setup | Design preferences | Sequential Q&A | Generate-confirm: design defaults table (Change 7) | 2 |
| D7 | setup | Design direction confirmation | Confirmation gate | Tier 1: keep -- gates all downstream design | 1 |
| D8 | tokens | Token values presentation | Confirmation gate | Tier 1: keep -- already generate-confirm style | 1 |
| D9 | tokens | Token section screenshots | Serial review | Batch option: all sections together (Change 9) | 2 |
| D10 | tokens | Component plan | Confirmation gate | Tier 1: keep -- gates component generation | 1 |
| D11 | tokens | Component validation loop | Serial review | Batch review default (Change 8) | 2 |
| D12 | tokens | Tokens checklist gate | Confirmation gate | Tiered: items 1-3 Tier 3, items 4-6 Tier 2, items 7-8 Tier 1 (Change 14) | 1/2/3 |
| D13 | mockups | Screen inventory | Confirmation gate | Tier 1: keep -- gates screen generation | 1 |
| D14 | mockups | Per-screen feedback (Pencil) | Serial review | Batch review default (Change 10) | 2 |
| D15 | mockups | Per-screen feedback (Markdown) | Serial review | Batch review default (Change 11) | 2 |
| D16 | mockups | Responsive variants choice | Format/option choice | Generate-confirm: suggest based on PRD mobile mentions | 2 |
| D17 | mockups | Behavioral walkthrough (P1) | Serial review (NEW) | Batch review default (Change 12) | 2 |
| D18 | mockups | Parallel gen permission | Confirmation gate | Tier 3: auto-proceed after first approval | 3 |
| D19 | mockups | Mockups checklist gate | Confirmation gate | Tiered: items 1,4 Tier 2, items 2-3,5 Tier 3, item 6 Tier 1 (Change 15) | 1/2/3 |
| D20 | build-plan | Missing mockups warning | Confirmation gate | Tier 2: present included/excluded; confirm | 2 |
| D21 | build-plan | Task list review | Batch review | Keep as-is (already optimized). Add parallelization hint | 1 |
| D22 | context (review) | Library context review | Confirmation gate | Tier 2: present as structured summary; single confirm | 2 |
| D23 | context (update) | Version comparison | Confirmation gate | Tier 2: present comparison table; confirm direction | 2 |
| D24 | context (promote) | Global promotion | Confirmation gate | Tier 3: auto-promote with audit trail | 3 |

### cl-implementer (21 points)

| # | Mode | Interaction Point | Current Type | Optimization | Tier |
|---|------|------------------|-------------|--------------|------|
| I1 | session-start | Pipeline state | Feedback loop | Tier 3: auto-display and continue | 3 |
| I2 | spec | Waterfall gate warnings | Sequential warnings | Batch warnings: single status table (Change 21) | 2 |
| I3 | spec | Spec format suggestion | Confirmation gate | Decision flow + Tier 1: read DECISIONS.md first; if decided, use it | 1 |
| I4 | spec-review | Review report | Feedback loop | Tier 3: informational; auto-present | 3 |
| I5 | start | Pre-check warnings | Sequential warnings | Batch warnings: single status table (Change 22) | 2 |
| I6 | start | Git init questions | Sequential Q&A | Generate-confirm: single recommendation | 2 |
| I7 | start | Spec coverage gap | Format/option choice | Decision flow: check DECISIONS.md for testing decisions | 2 |
| I8 | start | Context freshness per-library | Sequential Q&A | Tier 2: present all statuses in one table | 2 |
| I9 | start | Parallelizable groups | Confirmation gate | Tier 2: include in overall plan review | 2 |
| I10 | start | Task list review | Batch review | Tier 1: keep -- task plan is high-stakes commitment | 1 |
| I11 | run | Reconciliation summary | Confirmation gate | Tier 2: batch table, one decision | 2 |
| I12 | run | Spec hash mismatch | Warning | Tier 1: keep -- gates correctness | 1 |
| I13 | run | Per-task validity | Per-task gate | Tier 3 if match (auto-proceed), Tier 1 if mismatch | 1/3 |
| I14 | run | L1 spec gap | Feedback loop | Tier 3: state assumption and continue; log to DECISIONS.md | 3 |
| I15 | run | L2 spec gap / pipeline routing | Format/option choice | Tier 1: keep -- routing to other skills is significant | 1 |
| I16 | autopilot | Checkpoint decision | Format/option choice | Decision flow: check .clarity-loop.json; Tier 1 first time only | 1 |
| I17 | autopilot | Test failure escalation | Escalation | Tier 1: keep -- repeated failures need human judgment | 1 |
| I18 | autopilot | Checkpoint summary | Batch review | Tier 2/3 separation at checkpoints (Change 23) | 2/3 |
| I19 | autopilot | Trust evolution | Confirmation gate | Tier 3: auto-adjust with audit trail | 3 |
| I20 | sync | Changes summary | Batch review + approval | Tier 1: keep -- sync affects completed work | 1 |
| I21 | verify | Results presentation | Feedback loop | Tier 3: informational; auto-present | 3 |

### cl-reviewer (11 points)

| # | Mode | Interaction Point | Current Type | Optimization | Tier |
|---|------|------------------|-------------|--------------|------|
| V1 | session-start | Stale marker recovery | Confirmation gate | Tier 1: keep -- crash recovery | 1 |
| V2 | review | Review output | Notification | Tier 3: informational | 3 |
| V3 | review | Verdict + suggestion | Feedback loop | Tier 3: auto-suggest merge (APPROVE) or fix (NEEDS REWORK) | 3 |
| V4 | fix | Fix manifest | Confirmation gate | Tier 2: present as editable table; user approves/deselects | 2 |
| V5 | fix | Non-blocking suggestions | Format/option choice | Tier 2: present blocking + non-blocking in one view | 2 |
| V6 | fix | User disagrees with finding | Confirmation gate | Tier 1: keep -- disagreement needs explicit handling | 1 |
| V7 | merge | Merge plan approval | Batch review + approval | Tier 1: keep -- highest-stakes gate | 1 |
| V8 | merge | Merge error handling | Confirmation gate | Tier 1: keep -- partial merge recovery | 1 |
| V9 | correction | Corrections manifest | Confirmation gate | Tier 2: present all corrections grouped; approve groups | 2 |
| V10 | verify | Verification output | Notification | Tier 3: informational | 3 |
| V11 | audit/design-review/re-review/sync | Report output | Notification | Tier 3: fully autonomous generation | 3 |

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| **Project profile system** | A three-level system for pre-filling sensible defaults. Level 1: Auto-detect from existing code (package manager, framework, testing, auth, etc.). Level 2: Quick research from PRD/architecture docs for gaps or new projects. Level 3: Language-agnostic presets (Web Application, API/Backend Service, CLI/Desktop Tool, Library/Package, Prototype/Experiment). Levels are complementary -- auto-detect runs first, research fills gaps, presets offer a starting point. Users can mix, override, or skip entirely. (Note: "Levels" for the profile system, "Tiers" for checkpoint importance -- distinct concepts.) | bootstrap-guide.md |
| **Defaults sheet** | A table of all cross-cutting decisions presented for batch review during bootstrap. Each row has category, decision, value, source. User reviews and overrides rather than answering sequential questions. | bootstrap-guide.md |
| **Generate-confirm** | Interaction pattern where the skill generates a proposed configuration and the user reviews and overrides, replacing sequential Q&A. | bootstrap-guide.md, setup-mode.md, context-mode.md, spec-mode.md, start-mode.md, SKILL.md (researcher Phase 2) |
| **Batch review** | Interaction pattern where multiple artifacts are generated and presented as a set. User flags specific items for revision. Default behavior; serial available via config. | tokens-mode.md, mockups-mode.md |
| **Checkpoint tier** | Classification of decisions by attention level. Tier 1: must confirm. Tier 2: batch review. Tier 3: auto-proceed with audit trail. Configurable via `ux.autoDefaults`. | design-checklist.md, pipeline-concepts.md, autopilot-mode.md |
| **Auto-default** | A Tier 3 decision made automatically with `[auto-default]` tag in DECISIONS.md. User can review and override later. | design-checklist.md, DECISIONS.md protocol |
| **Parallelization hints** | Documentation of which steps can be pre-generated while the user reviews. Each hint includes invalidation risk. | tokens-mode.md, mockups-mode.md, spec-mode.md, start-mode.md |
| **Decision flow** | Protocol where every mode reads DECISIONS.md before asking questions and writes after receiving answers. Prevents duplicate questions across skills. | All four SKILL.md files, pipeline-concepts.md |
| **Decision category** | A tag on DECISIONS.md entries enabling cross-skill lookup. 15 standard categories. | pipeline-concepts.md |
| **Warmth gradient** | Principle that interaction style shifts from warm/conversational early (bootstrap, research) to efficient/mechanical later (implementation, verification). | cl-researcher SKILL.md, pipeline-concepts.md |
| **Review style** | User-configurable preference: `"batch"` (default), `"serial"`, `"minimal"`. Controls how artifacts are presented for review. | pipeline-concepts.md, tokens-mode.md, mockups-mode.md |

### Migration

This proposal changes skill instruction files, not code. No migration path is needed.

- **Existing projects** get the optimized interaction on next invocation
- **Users who prefer serial interaction** can set `ux.reviewStyle: "serial"` and `ux.autoDefaults: "none"` to restore the previous behavior exactly
- **The defaults are the optimized experience** -- users who want the current behavior must opt into serial mode
- **DECISIONS.md entries from before this proposal** continue to work -- the decision flow protocol reads existing entries regardless of whether they have category tags. The protocol adds category tags going forward; it does not require backfilling.

### Integration Points

| Changed Component | Integrates With | Interface Preserved |
|---|---|---|
| Bootstrap defaults sheet | DECISIONS.md | Yes -- decisions logged in same format, just more at once. Category tags are additive. |
| Batch review in tokens mode | DESIGN_PROGRESS.md | Yes -- same approval tracking format, batch-approved items noted |
| Batch review in mockups mode | DESIGN_PROGRESS.md, UI_SCREENS.md | Yes -- same output artifacts |
| Decision flow protocol | All modes that read DECISIONS.md | Yes -- same Decision Log format, adds category tags |
| UX configuration | `.clarity-loop.json` | Yes -- additive `ux` section, doesn't change existing fields |
| Tiered checkpoints | Design checklists, autopilot checkpoints | Yes -- adds Tier column, doesn't change existing items |
| Batch warnings (spec/start) | Gate check output | Yes -- same warnings, different presentation |
| Parallelization hints | Subagent dispatch | Yes -- hints are advisory, not new mechanisms |
| Warmth gradient | All skill Guidelines | Yes -- guidelines addition, not behavioral override |

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| **Three-level profile system instead of hardcoded archetypes** | Five hardcoded archetypes (too web/JS-centric, ignores brownfield); mandatory archetype selection; no profile system at all (pure freeform) | Hardcoded archetypes assumed greenfield and didn't cover Python ML, Go microservices, Rust systems, Java enterprise, data engineering, etc. Auto-detect from code is strictly better for brownfield. Quick research generates custom profiles for novel projects. Presets remain as a convenience but are language-agnostic. Profile "Levels" (detection priority) are distinct from checkpoint "Tiers" (decision importance). |
| **Batch review as default, serial as opt-in** | Serial as default (current); only batch with no serial option | Batch saves the most time for the common case (most items approved without changes). Serial preserved as opt-in for complex/novel work. |
| **Three review styles (batch, serial, minimal)** | Only batch and serial | Minimal serves "I trust the pipeline, just build it" users. Three modes cover the full trust spectrum. |
| **Defaults sheet as a table, not a wizard** | Multi-step wizard; conversational only; form UI | Tables are scannable -- user sees all decisions at once. Wizards hide information. Tables can be presented and reviewed in one conversation turn. |
| **Five language-agnostic presets (Level 3)** | Five web/JS-centric archetypes (old approach); three presets (too few); ten presets (diminishing returns); zero presets (detection-only) | Five covers major project shapes (web app, API/backend, CLI/desktop, library/package, prototype) without framework bias. Auto-detect (Level 1) and quick research (Level 2) are the primary profile sources; presets are a convenience fallback for quick starts. |
| **Three checkpoint tiers** | Two (must-confirm vs auto); four (adding "must-confirm-with-rationale") | Three maps cleanly to decision importance: must-confirm, batch-review, auto-proceed. Adding a fourth tier adds complexity without clear benefit. |
| **Parallel generation default-on, configurable** | Always on; never on; only for large projects | Default-on saves wall-clock time. Configurable for users who find pre-generation confusing or want deterministic ordering. |
| **Decision flow via DECISIONS.md category tags** | Separate decision index file; in-memory cache; per-mode decision files | DECISIONS.md already exists and is already read at session start. Category tags enable lookup with minimal change. No new files or mechanisms needed. |
| **P0.5 merges before P1-P3** | Merge P1-P3 first, then optimize; merge in parallel | Merging first means P1-P3 follow established patterns from the start. If P1-P3 merged first, they would each invent ad-hoc interaction patterns that P0.5 would then need to retrofit. |
| **Full pipeline scope, not just new P1-P3 interactions** | Only optimize the 20+ new interactions from P1-P3 | All 78 existing interaction points benefit from the same patterns. Consistency across the pipeline is more valuable than a narrow optimization. The audit justifies the scope. |
| **15 standard decision categories** | Fewer categories (too broad, can't distinguish); more categories (fragmented); freeform-only | 15 covers the cross-cutting concerns identified across all four skills. Categories are convention, not schema -- new ones can be added without breaking anything. |
| **Warmth gradient documented, not enforced** | Strict warmth rules per mode; no guidance at all | Guidance helps skills calibrate tone. Strict rules would feel robotic. The gradient is a principle, not a configuration. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Batch review misses issues that serial would catch | Medium | Medium | Batch includes "review more closely" escape hatch -- user can switch to serial for specific items. Hybrid mode (batch + serial for flagged items) is the expected pattern. |
| Profile defaults lead to uncritical acceptance | Low | Medium | Defaults sheet shows source provenance (`[auto-detected]`, `[research-generated]`, `[preset: X]`) and invites overrides. Auto-detected values have evidence (file paths, dependency names). Important rows (auth, security depth) are called out explicitly. Deferred items flagged. |
| Tier 3 auto-proceed generates incorrect defaults | Low | High | All logged with `[auto-default]` tag. User can search and override. Downstream validation (spec review, design review, verify) catches cascading errors. |
| Parallel generation produces wasted work | Medium | Low | Pre-generation is speculative and cheap. Invalidation risk assessed per hint. Wasted work is discarded silently. |
| Decision flow makes pipeline feel rigid | Low | Medium | Protocol is "read before asking" not "never ask". Context changes always allow re-asking. The protocol eliminates duplicates, not exploration. |
| UX configuration adds complexity for new users | Low | Low | Defaults are the optimized experience. New users don't need to configure anything. Configuration is for tuning, not setup. |
| Auto-detect produces false positives | Medium | Low | Confidence levels shown per detection (High/Medium/Low). User confirms profile before it flows to DECISIONS.md. Low-confidence detections are flagged for user verification. |
| Category tags on DECISIONS.md add overhead | Low | Low | Tags are one word per entry. Benefits (cross-skill lookup, no re-asking) far outweigh the cost. |
| Batch warnings in spec/start mode may hide critical issues | Low | Medium | Critical items (unverified merges, active research) are visually distinguished in the status table. Blockers called out separately from advisories. |
| Proposal scope is large (30 changes across 12+ files) | Medium | Medium | Changes are additive (no deletions, no restructuring). Each change is independent and can be applied incrementally. Reviewer can verify change-by-change against the manifest. |

## Open Items

1. **Custom profile templates**: Should users be able to save custom profiles? A team that always builds Next.js SaaS apps could define "Our SaaS" with their specific defaults including auto-detect overrides. This is a future enhancement -- the current proposal uses the three-level system (auto-detect, research, presets) without user-defined templates.

2. **Batch review granularity for P1 behavioral walkthrough**: The walkthrough generates screen states, interaction flows, navigation context, and content decisions. Should these be four separate batch review tables, or one combined table per screen? Current proposal: one combined table per screen with columns for each dimension. May need adjustment after P1 merges and real usage data is available.

3. ~~**Decision flow conflict resolution**~~: **RESOLVED** — Later decision overrides earlier with explicit supersession: new entry gets `**Supersedes**: D-NNN`, original entry marked `**Status**: Superseded by D-MMM`, user notified at point of override. Precedence rules for multi-source conflicts (DECISIONS.md > auto-detect > research > preset) are specified in the decision flow protocol (Change 29). Original rationale is preserved.

4. **Minimal review safety**: The `"minimal"` review style auto-approves with a summary. Should there be a safety check for low-confidence or high-novelty artifacts that automatically upgrades to batch review? Current: no automatic upgrade. The user who selects minimal is accepting the risk.

5. **Cross-skill parallelization**: The parallelization hints are within a single skill. Cross-skill parallelization (e.g., starting spec generation while reviewing build plan) depends on pipeline orchestration not yet designed. This is a future enhancement beyond P0.5 scope.

6. **DECISIONS.md category enforcement**: Should the pipeline validate that category tags use standard categories, or allow freeform? Current: convention-based, no enforcement. New categories can be invented. If enforcement is needed later, it can be added as a PostToolUse hook.

7. **Defaults sheet row count**: A comprehensive profile defaults sheet may have ~20 rows. Is this too many for a single review pass? Early usage will tell. If overwhelming, rows could be grouped by priority (review these 5 important ones; the rest are sensible defaults). Auto-detected rows with high confidence may need less attention than research-generated ones.

8. **Auto-detect depth vs speed**: How deeply should Level 1 auto-detect scan the codebase? Scanning dependency manifests is fast; scanning source files for patterns (error handling conventions, API response shapes) is slower but more accurate. Current proposal: scan manifests and config files first (fast), scan source files only for signals not found in config. May need a `ux.profileScanDepth` config if performance becomes an issue.

## Appendix: Research Summary

This proposal is driven by the comprehensive pipeline interaction audit documented in `docs/research/INTERACTION_AUDIT.md`.

**The audit found**: 78 distinct interaction points across 4 skills (cl-researcher: 22, cl-designer: 24, cl-implementer: 21, cl-reviewer: 11). These break down as:
- 14 sequential Q&A (highest-friction: users answer questions one at a time)
- 5 serial review (users review artifacts one at a time)
- 39 confirmation gates (binary yes/no decisions of varying importance)
- 9 format/option choices (multi-option selection points)
- 11 feedback loops (informational presentation + implicit decisions)

**Optimization breakdown**: 24 are Tier 1 (keep as-is -- high-stakes decisions), 3 are warmth-governed (conversational, not checkpoints). 51 are optimizable through the six strategies. The highest-impact targets save 5-25 conversation turns each: bootstrap discovery (from ~35 sequential questions to defaults sheet review), tokens component validation (from N serial reviews to 1 batch + K revisions), mockups screen review (from N serial reviews to 1 batch + K revisions), and implementer pre-checks (from 5 sequential warnings to 1 status table).

**P1 (Behavioral Specs + Design Phase)** adds: behavioral walkthrough per screen, component behavioral states, 6 new tokens checklist items, 5 new mockups checklist items, ~9 new bootstrap questions.

**P2 (Testing Pipeline)** adds: testing architecture probes (~5 new bootstrap questions), TEST_SPEC.md with review cycle, per-milestone integration test checkpoints.

**P3 (Security, Errors, API Conventions)** adds: ~12 new bootstrap questions across 6 categories, SECURITY_SPEC.md, error taxonomy, API conventions, shared types -- each with review.

**Combined impact without optimization**: Bootstrap grows from ~10 to ~35 questions. Token review adds behavioral state validation per component. Mockup review adds full behavioral walkthrough per screen. Multiple new spec artifacts each require checkpoints.

**With optimization**: Bootstrap compresses to 3-4 discovery questions + project profile detection + defaults sheet review. Token review is one batch with 2-3 flags. Mockup review is one batch + one behavioral batch. Tier 3 items auto-proceed. Decisions flow through DECISIONS.md without re-asking. The pipeline delivers the same thoroughness with dramatically less user friction.
