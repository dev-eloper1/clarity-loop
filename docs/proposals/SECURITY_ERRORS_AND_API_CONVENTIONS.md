# Proposal: Security, Errors, and API Conventions

**Created**: 2026-02-11
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F21-F22, F26-F27, F34-F35; Changes 12-17)
**Author**: Bhushan + AI Researcher
**Depends On**: P0 (SKILL_RENAME_AND_FOLD.md) — completed; all skills now use `cl-*` namespace
**Builds On**: P0.5 (UX_PATTERNS_AND_DECISION_FLOW.md) — completed; assumes decision flow protocol (15 standard categories with `errors`, `security`, `api-style` tags), project profile system (3-level auto-detect/research/presets), tiered checkpoints (Tier 1/2/3), batch/serial/minimal review styles, warmth gradient, and generate-confirm pattern are all in place

## Summary

This proposal adds security specification, error taxonomy, supply chain security, API
convention enforcement, and type safety awareness to the Clarity Loop pipeline. Currently,
the pipeline has zero security awareness — no skill asks about authentication, no spec
includes authorization contracts, no checklist verifies secure patterns, and no validation
tests for security. Errors are handled ad-hoc per endpoint with no system-level format.
API conventions (pagination, naming, filtering) are decided independently per spec, causing
frontend integration headaches. Type safety across the stack boundary is unspecified.

These gaps are especially dangerous because AI-generated code is systematically weaker on
security than human-written code (2.74x more likely to introduce XSS, 1.91x more likely
for IDOR, 1.88x for improper password handling per OWASP 2025) and AI coding agents import
dependencies with known vulnerabilities 49% of the time while hallucinating non-existent
packages 34% of the time (Endor Labs 2025).

The changes span three pipeline stages: bootstrap (security/error/API probing questions),
spec generation (SECURITY_SPEC.md, error taxonomy, API conventions preamble, shared types
section, edge cases section, accessibility requirements), and implementation (dependency
supply chain verification in run mode and verify mode). All changes use the `cl-*` skill
namespace established by P0 and build on the UX infrastructure from P0.5 — the decision
flow protocol (using existing `errors`, `security`, `api-style` category tags), project
profile system, tiered checkpoints, and review style configuration.

## Research Lineage

This proposal is based on the following research:

| Research Doc | Key Findings Used | Recommendation Adopted |
|---|---|---|
| docs/research/PIPELINE_GAP_ANALYSIS.md | F21 (Security Is Not Optional), F22 (Error Taxonomy), F26 (API Design Conventions), F27 (Type Safety Across Stack), F34 (Dependency Supply Chain Security), F35 (Cross-Cutting Backend Policies — rate limiting and input validation aspects only) | Changes 12-17 from the Tier 1c + Tier 2 recommendation |

## System Context

### Research Type: Evolutionary

All changes modify existing skill files to add security, error, and API convention
awareness to pipeline stages that already exist. No new skills or modes are created.

### Current State

| Skill File | Current State Summary | Sections Referenced |
|---|---|---|
| `skills/cl-implementer/SKILL.md` | Describes spec mode, run mode, verify mode, and guidelines. No mention of security specification, error taxonomy, dependency verification, API conventions, or shared types. Spec mode description says "Generates implementation-ready specs from verified system docs" with no security/error dimension. Guidelines section includes decision flow guideline (P0.5) referencing `errors`, `security`, `api-style`, `dependencies`, `type-sharing` categories. | Spec Mode (line 140-148), Run Mode (line 172-178), Verify Mode (line 196-203), Guidelines (line 243-298) |
| `skills/cl-implementer/references/spec-mode.md` | Six-step spec generation process. Step 4 (Generate Specs) requires source reference, concrete types, edge cases, dependencies, and implementability per spec. No security spec, error taxonomy, API conventions preamble, or shared types. | Step 4: Generate Specs (lines 81-91), Step 5: Generate Spec Manifest (lines 92-117) |
| `skills/cl-implementer/references/run-mode.md` | Core implementation loop with fix task classification, spec gap triage, and context loading. No dependency verification before or after `npm install`. Fix task types include `runtime-error`, `regression`, `integration-failure`, `context-gap`, `design-gap` — no `supply-chain` type. | Step 3c: Implement (lines 106-132), Step 4: Fix Tasks (lines 158-288) |
| `skills/cl-implementer/references/verify-mode.md` | Four verification dimensions: per-task acceptance criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment. No dependency audit dimension. No security verification. | Four Verification Dimensions (lines 15-83) |
| `skills/cl-implementer/references/spec-consistency-check.md` | Five consistency dimensions: type, naming, contract, completeness, traceability. Heading says "Five Consistency Dimensions". No API convention consistency dimension. No security policy adherence check. | Five Consistency Dimensions (lines 12-68), Output Format (lines 69-138) |
| `skills/cl-researcher/SKILL.md` | Bootstrap mode section points to bootstrap-guide.md. Mode description covers greenfield, brownfield-with-docs, and brownfield-with-code paths. Does not mention specific security/error/API probing in the SKILL.md summary (detail lives in bootstrap-guide.md per progressive disclosure). | Bootstrap Mode (lines 168-188) |
| `skills/cl-researcher/references/bootstrap-guide.md` | Discovery conversation now has Step 2 (basic discovery), Step 2b (project profile detection with 3-level system: auto-detect, quick research, presets), and Step 2c (defaults sheet with generate-confirm pattern). The defaults sheet already includes categories for error handling, auth, testing, API style, security depth, dependency policy, accessibility, content tone, resilience, type sharing, and target devices. Presets include security/error/API defaults per project type. P0.5 already addresses most of the bootstrap probing this proposal planned. | Step 2: Discovery (lines 48-65), Step 2b: Profile Detection (lines 67-177), Step 2c: Defaults Sheet (lines 179-239), Presets (lines 514-630) |
| `docs/cl-implementer.md` | Public-facing doc mirrors skill file. Spec section mentions waterfall gate, format selection, and design artifact integration. Verify section lists four dimensions. Modes table shows verify as "Post-implementation holistic check across four dimensions". No security, error, API convention, or dependency audit content. | Spec (lines 24-99), Verify (lines 269-282) |
| `docs/cl-researcher.md` | Public-facing doc for researcher. Bootstrap section describes three starting points (greenfield, brownfield with docs, brownfield with code). The Greenfield description lists "goals, users, tech stack, constraints" but does not mention security/error/API probing. P0.5 did not update this public-facing doc's bootstrap description. | Bootstrap (lines 22-60) |
| `docs/pipeline-concepts.md` | Configuration section lists `docsRoot`, `implementer.checkpoint`, and `ux.*` keys (`reviewStyle`, `profileMode`, `autoDefaults`, `parallelGeneration`) from P0.5. DECISIONS.md section documents 15 standard category tags including `errors`, `security`, `api-style`, `dependencies`, `type-sharing`. Warmth gradient defined. Directory structure shows no SECURITY_SPEC.md or error taxonomy artifact. | Configuration (lines 275-328), DECISIONS.md (lines 77-175), Directory Structure (lines 353-378) |

### Proposed State

After this proposal is applied:

1. **Spec generation** produces `SECURITY_SPEC.md` alongside implementation specs — with
   per-endpoint auth requirements, input validation rules, system-level security policy
   (CORS, CSP, rate limiting, session management, secrets injection), secure UX patterns,
   and dependency governance policy.

2. **Spec generation** includes an **error taxonomy section** in API specs — a standard
   error response format, error code system with category prefixes, error propagation chain
   specification, and per-endpoint error catalog.

3. **Spec generation** produces an **API conventions preamble** that all endpoint specs
   inherit — pagination style, naming convention, error format, filtering syntax, rate
   limiting headers, response envelope.

4. **Spec generation** includes a **shared types section** — which types cross the
   frontend/backend boundary, serialization format, and type sharing strategy.

5. **Spec generation** includes standard **edge cases** and **accessibility requirements**
   sections per spec based on component types.

6. **Run mode** verifies dependencies before `npm install` (registry existence check for
   hallucinated packages) and after installation (vulnerability audit, license check).

7. **Verify mode** gains a sixth dimension: **dependency audit** — full `npm audit`,
   license compliance, hallucinated package detection.

8. **Bootstrap** Step 2 discovery conversation gains security-specific depth probing
   (data sensitivity, compliance requirements, role separation). Most other probing
   categories (error handling, API style, dependencies, accessibility, etc.) are already
   handled by the P0.5 project profile system and defaults sheet.

9. **Spec consistency check** gains a sixth dimension: **API convention adherence** —
   verifying all endpoint specs follow the same pagination, naming, error format, and
   filtering conventions.

## Change Manifest

> This is the contract between the proposal and the plugin files. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target File | Target Section | Type | Research Ref |
|---|---|---|---|---|---|
| 1 | Add cross-cutting spec generation pointer to spec mode | `skills/cl-implementer/references/spec-mode.md` | Step 4: Generate Specs | Add | F21, F22, F26, F27 |
| 1b | Create cross-cutting specs reference with SECURITY_SPEC.md, error taxonomy, API conventions, shared types, edge cases, and accessibility templates | `skills/cl-implementer/references/cross-cutting-specs.md` | (new file) | Add Doc | F21, F22, F26, F27 |
| 6 | Update spec manifest to include new spec artifacts | `skills/cl-implementer/references/spec-mode.md` | Step 5: Generate Spec Manifest | Modify | F21, F22, F26 |
| 7 | Add dependency verification to run mode implementation step | `skills/cl-implementer/references/run-mode.md` | Step 3c: Implement | Add | F34 |
| 8 | Add `supply-chain` fix task type to run mode | `skills/cl-implementer/references/run-mode.md` | Step 4: Fix Tasks | Add | F34 |
| 9 | Add Dimension 6: Dependency Audit to verify mode | `skills/cl-implementer/references/verify-mode.md` | (new section after Dimension 5) | Add Section | F34 |
| 10 | Update verify mode output to include dependency audit | `skills/cl-implementer/references/verify-mode.md` | Output | Modify | F34 |
| 11 | Add Dimension 6: API Convention Adherence to spec consistency check | `skills/cl-implementer/references/spec-consistency-check.md` | (new section after dimension 5) | Add Section | F26 |
| 12 | Add security-specific depth probing to bootstrap discovery (P0.5 profile system handles most other categories) | `skills/cl-researcher/references/bootstrap-guide.md` | Step 2: Discovery Conversation | Add | F21, F35 |
| 13 | Update SKILL.md spec mode description for new artifacts | `skills/cl-implementer/SKILL.md` | Spec Mode | Modify | F21, F22, F26, F27 |
| 14 | Update SKILL.md verify mode description for dependency audit | `skills/cl-implementer/SKILL.md` | Verify Mode | Modify | F34 |
| 15 | Add security guideline to SKILL.md guidelines (after P0.5 decision flow guideline) | `skills/cl-implementer/SKILL.md` | Guidelines | Add | F21, F34 |
| 16 | Update public-facing cl-implementer.md spec section | `docs/cl-implementer.md` | Spec | Modify | F21, F22, F26, F27 |
| 17 | Update public-facing cl-implementer.md verify section | `docs/cl-implementer.md` | Verify | Modify | F34 |
| 18 | Update public-facing cl-researcher.md bootstrap section (mention security probing and profile system) | `docs/cl-researcher.md` | Bootstrap | Modify | F21 |
| 19 | Update pipeline-concepts.md directory structure | `docs/pipeline-concepts.md` | Directory Structure | Modify | F21, F22 |

**Scope boundary**: This proposal ONLY modifies the files/sections listed above. Changes
to `cl-designer` skills, `autopilot-mode.md`, `start-mode.md`, `sync-mode.md`, and
`cl-reviewer` skills are out of scope. Security smoke tests in autopilot mode are deferred
to a future proposal.

## Cross-Proposal Conflicts

| Conflict With | Overlapping Sections | Resolution |
|---|---|---|
| SKILL_RENAME_AND_FOLD.md (P0) | All files — P0 renames skills to `cl-*` | P0 is already complete. This proposal uses the new `cl-*` names throughout. No conflict. |
| UX_PATTERNS_AND_DECISION_FLOW.md (P0.5) | `bootstrap-guide.md` (profile system, defaults sheet), `pipeline-concepts.md` (config keys, DECISIONS.md categories, warmth gradient), `cl-implementer/SKILL.md` (decision flow guideline), `autopilot-mode.md` (tiered checkpoints) | P0.5 is already complete. This proposal builds on P0.5 infrastructure — uses existing `errors`, `security`, `api-style`, `dependencies`, `type-sharing` category tags; integrates with profile system defaults rather than creating parallel bootstrap probing; respects tiered checkpoints for new validation gates. Bootstrap Change Area 8 was significantly narrowed because P0.5 already addressed most bootstrap probing through the profile system. |
| BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md (P1) | `skills/cl-researcher/references/bootstrap-guide.md` Step 2 "Then dig deeper", `skills/cl-implementer/SKILL.md`, `docs/cl-implementer.md` | P3 restructures bootstrap-guide.md Step 2 "Then dig deeper" into split subsections ("dig deeper -- functional" and "dig deeper -- security and data"). P1 adds behavioral probing questions to the same "Then dig deeper (conversational)" section. Both additions are complementary -- merge by including P1's behavioral questions alongside P3's security questions in the restructured format. P3's restructuring provides the frame; P1's behavioral questions are an additive category within that frame. If P1 merges first, P3's replacement text must incorporate P1's behavioral questions into the restructured subsections. If P3 merges first, P1's additions should target the new "dig deeper -- functional" subsection or add a "dig deeper -- behavioral" subsection. SKILL.md and cl-implementer.md changes are to different sections and are non-conflicting. |
| IMPLEMENTER_SKILL.md | `skills/cl-implementer/SKILL.md`, `docs/cl-implementer.md` | IMPLEMENTER_SKILL.md adds the cl-implementer skill as a new artifact. This proposal modifies sections within it. Apply IMPLEMENTER_SKILL.md first if not yet merged, then this proposal adds to the existing structure. |
| CONTEXT_SYSTEM.md | `skills/cl-researcher/SKILL.md`, `docs/cl-researcher.md`, `docs/pipeline-concepts.md` | CONTEXT_SYSTEM.md adds context mode to the researcher. This proposal modifies the bootstrap section only, which CONTEXT_SYSTEM.md doesn't touch. No conflict. |

## Detailed Design

### Change Area 1: Cross-Cutting Specifications in Spec Generation (Changes 1, 1b, 6)

**What**: Extend spec generation (spec-mode.md Step 4) to produce cross-cutting specification
artifacts: `SECURITY_SPEC.md`, error taxonomy, API conventions preamble, shared types,
per-spec edge cases, and per-spec accessibility requirements. The full templates and process
for generating these artifacts live in a NEW reference file
`skills/cl-implementer/references/cross-cutting-specs.md`, loaded on-demand from spec-mode.md.

**Why**: Research Findings F21, F22, F26, F27 identified that the pipeline has zero security
awareness, no standard error format, no system-level API conventions, and no type safety
across the stack boundary. AI-generated code is systematically weaker on security (2.74x
more likely for XSS, 1.91x for IDOR per OWASP 2025). Without these cross-cutting
specifications, each endpoint independently decides its auth requirements, error format,
pagination style, and type serialization -- leading to inconsistent behavior across the
application.

**System doc impact**: Two files.

**File 1: `skills/cl-implementer/references/spec-mode.md`** -- Add a brief pointer at the
Step 4 location.

**Current** (from spec-mode.md Step 4):
> Every spec must include:
> - **Source reference**: Which system doc section(s) it derives from
> - **Concrete types**: No ambiguity -- "UUID v4", not "a string"
> - **Edge cases**: Enumerated, not implied
> - **Dependencies**: Which other specs this one references
> - **Implementability**: Each spec should be implementable in isolation (bounded context)

**Proposed** (add after Step 4's spec requirements, before Step 5):

```markdown
### Step 4+: Generate Cross-Cutting Specs

For cross-cutting spec generation (security, error handling, API conventions, shared types),
read `references/cross-cutting-specs.md` and follow its process. This generates:
- SECURITY_SPEC.md (per-endpoint auth, system security, secure UX, dependency governance)
- Error taxonomy (standard format, code system, propagation chain, per-endpoint catalog)
- API conventions preamble (pagination, naming, filtering, envelope -- inherited by all endpoint specs)
- Shared types inventory (cross-boundary types, serialization contracts, sharing strategy)
- Per-spec edge cases and accessibility requirements sections
```

**File 2: `skills/cl-implementer/references/cross-cutting-specs.md`** -- NEW file containing
the full templates and process for generating cross-cutting specification artifacts. This
file is loaded only during spec generation mode and keeps spec-mode.md within its ~3000
token budget.

The new file contains four generation steps (Steps 4a-4d) with full templates:

**Step 4a: Generate Security Spec** -- If the system docs describe any authentication,
authorization, user-facing features, or API endpoints, generate `{docsRoot}/specs/SECURITY_SPEC.md`
with four sections:

- **Per-Endpoint Security**: Table of every API endpoint with auth required, auth method,
  authorization, input validation, and rate limit. Unspecified endpoints flagged with
  "No auth specified -- default: auth required."
- **System-Level Security**: CORS policy, CSP headers, rate limiting, session management,
  secrets injection. Extracted from Architecture doc and DECISIONS.md (`security`, `auth`
  category tags). Unspecified concerns get `[DECISION NEEDED]` markers. The decision flow
  protocol (P0.5) ensures existing bootstrap decisions are used rather than re-asked.
- **Secure UX Patterns**: Password requirements, session timeout, error messages, CSRF
  protection. Skipped if no auth flows.
- **Dependency Governance**: Approved packages, license allowlist (MIT, Apache-2.0, BSD-2-Clause,
  BSD-3-Clause, ISC; flag GPL/LGPL/AGPL), version constraints, vulnerability scanning policy.
  Extracted from DECISIONS.md (`dependencies` category) or defaults.
- **Per-Spec Accessibility Requirements**: ARIA attributes, keyboard interaction, focus
  management, screen reader requirements per UI spec. Scaled to accessibility level from
  bootstrap (WCAG 2.1 AA default for commercial, minimal for personal).
- **Standard Edge Cases Per Spec**: Component-type-based edge case sections (text input,
  numeric, list/array, file upload, date/time, API endpoint, auth-protected resource).

**Step 4b: Generate Error Taxonomy** -- If the system has API endpoints, generate a
system-level error specification with four parts:

- **Error Response Format**: Standard JSON shape (`code`, `message`, `details`, `requestId`)
- **Error Code System**: Category prefixes with HTTP status mappings (VALIDATION_* 400,
  AUTH_* 401, AUTHZ_* 403, NOT_FOUND_* 404, CONFLICT_* 409, RATE_LIMIT_* 429, INTERNAL_* 500).
  Start minimal (~15-20 codes), extend during implementation.
- **Error Propagation Chain**: How errors transform across DB -> Service -> API -> Frontend
  boundaries. Internal details never exposed in API responses.
- **Per-Endpoint Error Catalog**: Table of which error codes each endpoint can return and
  under what conditions. This is the backend-frontend contract.

**Step 4c: Generate API Conventions Preamble** -- If the system has API endpoints, generate
conventions that all endpoint specs reference. Extracted from DECISIONS.md (`api-style`
category) or sensible defaults:

- Naming (plural nouns, camelCase JSON, kebab-case URLs)
- Pagination (cursor-based or offset-based)
- Filtering, sorting, versioning, rate limiting headers, response envelope, content type
- Unresolved defaults flagged as `[DEFAULT -- confirm or override]`, become L1 spec gaps.
- Every endpoint spec must declare "Inherits from: API_CONVENTIONS" with any overrides.

**Step 4d: Identify Shared Types** -- If the system has both frontend and backend specs:

- **Shared Types Inventory**: Table of types crossing the boundary with serialization notes.
- **Type Sharing Strategy**: Record from DECISIONS.md (`type-sharing` category) or flag as
  `[DECISION NEEDED]`. Options: shared package, generated from API spec, manual sync, runtime validation.
- **Serialization Contracts**: For non-trivial serialization (Date -> ISO 8601 string, Decimal -> string, etc.)

**Also update Step 5 (Generate Spec Manifest)** to include the new artifacts:

**Current** (from spec-mode.md Step 5, the Specs table):
> | Spec File | Source Doc(s) | Source Section(s) | Description |
> |-----------|--------------|-------------------|-------------|
> | [filename] | [doc name] | Section X, Y | [one-line description] |

**Proposed** (add to the manifest template after the existing Specs table):

```markdown
## Security & Cross-Cutting Specs

| Spec File | Scope | Source |
|-----------|-------|--------|
| SECURITY_SPEC.md | Per-endpoint auth, system security, secure UX, dependency governance | Architecture, DECISIONS.md, PRD |
| (error taxonomy) | Inline in API specs | Architecture, DECISIONS.md |
| (API conventions preamble) | Inherited by all endpoint specs | Architecture, DECISIONS.md |
| (shared types) | Cross-boundary type definitions | Architecture, all endpoint specs |
```

**Dependencies**: None -- this is a parallel output from the same system doc read.

---

### Change Area 5: Dependency Supply Chain Security in Run Mode (Changes 7, 8)

**What**: Add dependency verification steps to run mode's implementation step (Step 3c)
and a new `supply-chain` fix task type to Step 4.

**Why**: Research Finding F34 identified that AI coding agents import dependencies with
known vulnerabilities 49% of the time, hallucinate non-existent packages 34% of the time,
and recommend safe dependencies only 20% of the time (Endor Labs 2025). The pipeline
currently lets the implementer `npm install` any package without verification.

**System doc impact**: `skills/cl-implementer/references/run-mode.md`, Step 3c and Step 4.

**Current** (from run-mode.md Step 3c):
> 1. Read the task's spec reference in full
> 2. Read any dependency tasks' files (for context on what already exists)
> 3. **Load relevant context** — if `{docsRoot}/context/.context-manifest.md` exists: [...]
> 4. Implement the code to meet the acceptance criteria
> 5. Test/verify the implementation against each criterion
> 6. Record files modified [...]

**Proposed** (add step 3c.3.5, between context loading and implementation):

```markdown
3.5. **Dependency verification** — When the implementation requires adding a new dependency
     (detected by `npm install`, `yarn add`, or similar in the implementation code):

     a) **Pre-install: Registry existence check** — Before installing, verify the package
        exists in the npm registry (or relevant package manager registry). This catches
        hallucinated packages — AI-generated code frequently imports packages that don't
        exist, creating typosquatting risk. Check: `npm view <package-name> version`.
        If the package doesn't exist — **Tier 1** (must-confirm): "Package `<name>` not
        found in npm registry. This may be a hallucinated dependency. Searching for
        alternatives..." — then search for the intended functionality and suggest a real
        package.

     b) **Post-install: Vulnerability audit** — After installation, run `npm audit --json`
        (or equivalent). Parse results with checkpoint tier assignments:
        - **Critical/High CVEs** — **Tier 1** (must-confirm): Block. "Dependency `<name>`
          has critical vulnerability [CVE-ID]: [description]. Options: a) Find an alternative
          package, b) Pin to a patched version if available, c) Accept risk (requires user
          approval)."
        - **Medium/Low** — **Tier 3** (auto-proceed): Warn. "Note: `<name>` has [N]
          medium/low advisories. Logged for reference." Continue without blocking.

     c) **License check** — Verify the package's license against the approved list from
        SECURITY_SPEC.md (or defaults from `dependencies` category decision in DECISIONS.md,
        or fallback: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC).
        - **Flagged license** (GPL, LGPL, AGPL, unknown) — **Tier 1** (must-confirm): Warn.
          "Package `<name>` uses [license]. This may have copyleft implications. Continue?
          [Y/flag for review]"
        - **Approved license**: Continue silently — **Tier 3** (auto-proceed).

     Record all dependency additions in IMPLEMENTATION_PROGRESS.md with package name,
     version, license, and audit status.
```

**For Step 4 (Fix Tasks)**, add a new issue classification:

**Current** (from run-mode.md Step 4, classification list):
> - `runtime-error`: Code throws an error during execution
> - `regression`: Previously-passing acceptance criteria now fail
> - `integration-failure`: Two modules don't work together as specs described
> - `context-gap`: Error traced to stale or missing library knowledge
> - `design-gap`: A visual/UI design element is missing or inadequate

**Proposed** (add after `design-gap`):

```markdown
   - `supply-chain`: Dependency issue — vulnerable package, hallucinated import, license
     violation, or version conflict. Detection: `npm audit` failure, registry lookup failure,
     or license check failure. Distinguished from `context-gap` by asking: "Is this about
     how to USE a library correctly (context gap) or about WHETHER this library is safe to
     use (supply chain)?"

   For `supply-chain` issues:
   - Identify the problematic dependency and the specific issue (CVE, hallucination, license)
   - Propose resolution:
     - **Hallucinated**: Search for a real package that provides the needed functionality
     - **Vulnerable**: Find a patched version or alternative package
     - **License**: Flag for user decision
   - Replace the dependency in all affected files
   - Re-run tests for all tasks that depend on the replaced package
```

**Dependencies**: None — this is a runtime check during implementation.

---

### Change Area 6: Dependency Audit in Verify Mode (Changes 9, 10)

**What**: Add a sixth verification dimension to verify-mode.md: Dependency Audit. This
runs a comprehensive dependency health check as part of post-implementation verification.

**Why**: Research Finding F34 recommends `npm audit` as part of verification. Per-task
dependency checks (Change Area 5) catch issues at install time, but a full audit at verify
time catches accumulated drift — new CVEs published since installation, transitive
dependency vulnerabilities, and packages added outside the implementer's tracking.

**System doc impact**: `skills/cl-implementer/references/verify-mode.md`, new section after
Dimension 4, and Output section update.

**Current** (verify-mode.md has Dimensions 1-4 currently; P2 adds Dimension 5: Test Coverage
Against Test Spec. This proposal adds Dimension 6 after P2's Dimension 5):
> #### Dimension 5: Test Coverage Against Test Spec (added by P2)
> [...]
>
> ---
>
> ### Output

**Proposed** (add between Dimension 5 and Output):

```markdown
#### Dimension 6: Dependency Audit

Check the project's dependency health as a whole.

This catches:
- Vulnerabilities published after dependencies were installed
- Transitive dependency issues not caught per-task
- License compliance across the full dependency tree
- Hallucinated packages that slipped through (package exists but provides wrong functionality)
- Unnecessary dependencies (installed but never imported)

Steps:
1. Run `npm audit --json` (or equivalent for the project's package manager)
2. Parse results: group by severity (critical, high, medium, low)
3. Check all direct dependencies against SECURITY_SPEC.md approved license list
4. Cross-reference `package.json` dependencies against actual imports in source code —
   flag unused dependencies
5. Verify lockfile integrity (`npm ci --dry-run` or equivalent)

Report (with checkpoint tier assignments for autopilot compatibility):
- Critical/High: must fix before implementation is considered complete — **Tier 1** (must-confirm, always stops autopilot)
- Medium: should fix, log for tracking — **Tier 2** (batch review)
- Low: informational only — **Tier 3** (auto-proceed, logged with [auto-default] tag)
- License violations: flag for user decision — **Tier 1** (copyleft implications require explicit approval)
- Unused dependencies: suggest removal — **Tier 3** (advisory)

If no package manager or no SECURITY_SPEC.md: skip this dimension with a note.
```

**Update Output section** to include the new dimension:

**Current** (from verify-mode.md Output):
> ```markdown
> ### Spec-to-Doc Alignment
> - [cl-reviewer sync results or manual check findings]
> ```

**Proposed** (add after Spec-to-Doc Alignment in the output template):

```markdown
### Dependency Audit
- npm audit: 0 critical, 0 high, 2 medium (advisory only)
- Licenses: all MIT/Apache-2.0 — compliant
- Unused dependencies: `lodash` (installed but never imported) — suggest removal
- Lockfile: verified
```

**Dependencies**: SECURITY_SPEC.md should exist for license policy reference, but this
dimension degrades gracefully without it (uses default license list).

---

### Change Area 7: API Convention Adherence in Spec Consistency Check (Change 11)

**What**: Add a sixth consistency dimension to spec-consistency-check.md: API Convention
Adherence. This checks that all endpoint specs follow the same API conventions.

**Why**: Research Finding F26 identified that the spec consistency check checks type and
naming consistency but not API convention consistency — it doesn't know what pagination
style was chosen. Without this dimension, specs can individually be correct but
collectively inconsistent (endpoint A uses cursor pagination, endpoint B uses offset).

**System doc impact**: `skills/cl-implementer/references/spec-consistency-check.md`, new
section after dimension 5.

**Current** (spec-consistency-check.md ends after dimension 5 — Traceability):
> #### 5. Traceability
> [...]

**Proposed** (add after Traceability):

```markdown
#### 6. API Convention Adherence

All endpoint specs must follow the conventions defined in the API conventions preamble.

Check for:
- Pagination style inconsistencies (some specs use cursor, others use offset)
- Naming convention violations (some specs use camelCase, others snake_case in JSON)
- Error response format deviations (some specs define custom error shapes)
- Filtering syntax disagreements (some use query params, others use JSON body)
- Response envelope inconsistencies (some wrap in `{data: ...}`, others return raw)
- Rate limiting specification gaps (some endpoints specify limits, others don't)
- Missing API conventions reference (specs that don't declare "Inherits from: API_CONVENTIONS")

If no API conventions preamble exists: skip this dimension but note: "No API conventions
preamble found. Consider generating one to ensure consistency across endpoint specs."
```

**Update the Output Format** in spec-consistency-check.md to include the new dimension:

**Current** (output template ends with Traceability section):
> ## Traceability
>
> | Spec File | Source Doc | Status |
> |-----------|-----------|--------|
> | [spec file] | [doc name] Section X | Traced / Stale / Missing |

**Proposed** (add after Traceability):

```markdown
## API Convention Adherence

| Convention | Expected (from preamble) | Violations |
|-----------|------------------------|-----------|
| Pagination | Cursor-based | spec-users.md uses offset pagination |
| Naming | camelCase JSON | spec-reports.md uses snake_case |
| Error format | Standard taxonomy | spec-legacy.md uses custom {error: "..."} |

If no violations: "All endpoint specs follow the API conventions preamble."
If no preamble: "No API conventions preamble found. Dimension skipped."
```

**Dependencies**: API conventions preamble should exist for this check to be meaningful,
but the dimension degrades gracefully without it.

---

### Change Area 8: Bootstrap Security and API Probing (Change 12)

**What**: Enhance the bootstrap discovery conversation's Step 2 with deeper security-
specific probing questions, and add security-aware defaults to the project profile presets.

**Why**: Research Findings F21, F22, F26, F27, F34, and F35 all identify that these
decisions need to be captured EARLY — at bootstrap time — so they flow through Architecture
and DECISIONS.md into spec generation.

**P0.5 already addressed most of this.** The bootstrap-guide.md now has:
- Step 2b (Project Profile Detection) with auto-detect for auth, error handling, and API
  style from existing codebases
- Step 2c (Defaults Sheet) with categories for error handling, auth, security depth,
  dependency policy, accessibility, API style, type sharing, content tone, resilience, and
  target devices
- Presets with security/error/API defaults per project type (Web Application defaults to
  "Standard" security with SECURITY_SPEC.md generation; API/Backend defaults to "High"
  security)

**What P0.5 did NOT address**: The Step 2 discovery conversation itself (lines 48-65)
still uses generic questions ("What are the key architectural decisions already made?")
without security-specific depth. The profile system captures these as categories, but the
conversational discovery that feeds into the profile could probe more specifically for
security-sensitive projects.

**System doc impact**: `skills/cl-researcher/references/bootstrap-guide.md`, Step 2:
Discovery Conversation.

**Current** (from bootstrap-guide.md Step 2, the "Then dig deeper" section, post-P0.5):
> **Then dig deeper (conversational):**
> - What are the main workflows or user journeys?
> - Are there external integrations or dependencies?
> - What are the key architectural decisions already made?
> - What's the scope? What's explicitly out of scope?

**Proposed** (replace the "Then dig deeper (conversational)" section):

```markdown
**Then dig deeper — functional:**
- What are the main workflows or user journeys?
- Are there external integrations or dependencies?
- What are the key architectural decisions already made?
- What's the scope? What's explicitly out of scope?

**Dig deeper — security and data (scale to project type):**
- Data sensitivity? (PII, financial data, health data, public only?)
- Compliance requirements? (GDPR, HIPAA, SOC2, PCI-DSS, none?)
- Are there admin vs. regular user roles? What can each do?

These questions inform the `security`, `auth`, and `authorization` category decisions
in the defaults sheet (Step 2c). For hobby/prototype projects, these can be brief —
the Prototype preset already defaults to "Skip" for security depth.
```

The remaining probing categories (error handling, API style, dependencies, accessibility,
content tone, resilience, type sharing, target devices) are already captured by the P0.5
defaults sheet and presets. No additional discovery questions are needed for those — the
profile system handles them through the generate-confirm pattern.

**Dependencies**: None — bootstrap runs before all other pipeline stages.

---

### Change Area 9: SKILL.md Updates (Changes 13, 14, 15)

**What**: Update cl-implementer SKILL.md to reflect the new spec artifacts, verify mode
dimension, and security guidelines.

**Why**: SKILL.md is the entry point that the agent reads. It must accurately describe what
each mode produces and what guidelines govern implementation.

**System doc impact**: `skills/cl-implementer/SKILL.md`.

**Change 13 — Spec Mode description update**:

**Current** (from SKILL.md, Spec Mode section, lines 140-148):
> ## Spec Mode
>
> Read `references/spec-mode.md` and follow its process.
>
> Generates implementation-ready specs from verified system docs. Enforces the waterfall
> gate — specs are generated only after all system docs are complete and verified. The
> spec format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured
> markdown for general). Uses subagent dispatch to read all system docs in parallel without
> overloading the main context.

**Proposed**:

```markdown
## Spec Mode

Read `references/spec-mode.md` and follow its process.

Generates implementation-ready specs from verified system docs. Enforces the waterfall
gate — specs are generated only after all system docs are complete and verified. The
spec format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured
markdown for general). Uses subagent dispatch to read all system docs in parallel without
overloading the main context.

In addition to implementation specs, generates cross-cutting specifications:
- **SECURITY_SPEC.md**: Per-endpoint auth, system security policy, secure UX, dependency governance
- **Error taxonomy**: Standard error format, code system, propagation chain, per-endpoint catalog
- **API conventions preamble**: Pagination, naming, filtering, sorting, envelope — inherited by all endpoint specs
- **Shared types**: Cross-boundary type inventory, serialization contracts, sharing strategy
- **Edge cases**: Standard edge case section per spec based on component types
- **Accessibility**: ARIA, keyboard, focus management requirements per UI spec
```

**Change 14 — Verify Mode description update**:

**Current** (from SKILL.md, Verify Mode section, lines 196-203):
> ## Verify Mode
>
> Read `references/verify-mode.md` and follow its process.
>
> Post-implementation holistic verification across four dimensions: per-task acceptance
> criteria, per-spec contract compliance, cross-spec integration, and spec-to-doc alignment
> (via cl-reviewer sync).

**Proposed**:

```markdown
## Verify Mode

Read `references/verify-mode.md` and follow its process.

Post-implementation holistic verification across six dimensions: per-task acceptance
criteria, per-spec contract compliance, cross-spec integration, spec-to-doc alignment
(via cl-reviewer sync), test coverage against test spec (P2), and dependency audit
(vulnerability scan, license compliance, unused dependency detection).
```

**Change 15 — New security guideline**:

**Current** (from SKILL.md Guidelines, ends with the decision flow guideline added by P0.5,
at line 298):
> - **Decision flow: read before asking.** Before making implementation decisions, check
>   DECISIONS.md for existing decisions in the relevant category (`testing`, `api-style`,
>   `errors`, `security`, `dependencies`, `type-sharing`, `spec-format`). When TEST_SPEC.md,
>   SECURITY_SPEC.md, or API conventions reference DECISIONS.md entries, those decisions are
>   already baked in -- don't re-ask. When encountering an L1 spec gap that matches a
>   DECISIONS.md category, check if a decision already exists that resolves it.

**Proposed** (add after the decision flow guideline):

```markdown
- **Security is a specification concern, not an afterthought.** If SECURITY_SPEC.md exists,
  reference it during implementation — check per-endpoint auth requirements before writing
  route handlers, check input validation rules before accepting user input, check the error
  taxonomy before writing error responses. If no security spec exists but the system has
  user-facing features, nudge the user: "No security spec found. Consider running
  `/cl-implementer spec` to generate one."

- **Verify dependencies before trusting them.** When adding new packages, check the registry
  first (catch hallucinated packages), audit after install (catch vulnerabilities), and check
  the license (catch copyleft surprises). Block on critical CVEs. Warn on medium/low. Log
  all dependency additions.
```

**Dependencies**: None.

---

### Change Area 10: Public-Facing Documentation Updates (Changes 16, 17, 18, 19)

**What**: Update `docs/cl-implementer.md`, `docs/cl-researcher.md`, and
`docs/pipeline-concepts.md` to reflect the new capabilities.

**Why**: Public-facing docs must mirror the skill files for users who read the docs before
invoking skills.

**Change 16 — cl-implementer.md Spec section**:

**Current** (from cl-implementer.md, Spec section, ends with "Design Artifact Integration"):
> ### Design Artifact Integration
>
> If [DESIGN_SYSTEM.md](cl-designer.md) and [UI_SCREENS.md](cl-designer.md) exist, the spec
> generator references them. Tech specs can point to specific design components for
> implementation guidance.

**Proposed** (add after Design Artifact Integration, before the `---` divider):

```markdown
### Cross-Cutting Specifications

Alongside implementation specs, the spec generator produces:

| Artifact | Content | Source |
|----------|---------|--------|
| **SECURITY_SPEC.md** | Per-endpoint auth/authz, input validation, system security policy (CORS, CSP, rate limiting, session management, secrets), secure UX patterns, dependency governance | Architecture, DECISIONS.md, PRD |
| **Error taxonomy** | Standard error response format, error code system with category prefixes, error propagation chain, per-endpoint error catalog | Architecture, DECISIONS.md |
| **API conventions** | Pagination style, naming convention, error format, filtering syntax, rate limiting headers, response envelope — inherited by all endpoint specs | Architecture, DECISIONS.md |
| **Shared types** | Cross-boundary type inventory, serialization contracts, type sharing strategy | All endpoint specs, Architecture |
| **Edge cases** | Standard edge case section per spec based on component types (text input, numeric, list, file, date, API endpoint, auth) | Spec content analysis |
| **Accessibility** | ARIA attributes, keyboard interaction, focus management, screen reader requirements per UI spec | Design system, bootstrap accessibility level |

These are generated from the same system doc read as implementation specs — marginal additional cost.
```

**Change 17 — cl-implementer.md Verify section**:

**Current** (from cl-implementer.md, Verify section):
> ## Verify
>
> Post-implementation holistic check. Four dimensions:
>
> | Dimension | What It Checks | Catches |
> |-----------|---------------|---------|
> | **Per-task** | Re-check all acceptance criteria | Regressions, drift from criteria |
> | **Per-spec** | Full spec contract compliance | Type mismatches, missing constraints |
> | **Cross-spec** | Integration between modules | Shape mismatches, protocol disagreements |
> | **Spec-to-doc** | Code alignment with system docs (via cl-reviewer sync) | Architectural drift |

**Proposed**:

```markdown
## Verify

Post-implementation holistic check. Six dimensions:

| Dimension | What It Checks | Catches |
|-----------|---------------|---------|
| **Per-task** | Re-check all acceptance criteria | Regressions, drift from criteria |
| **Per-spec** | Full spec contract compliance | Type mismatches, missing constraints |
| **Cross-spec** | Integration between modules | Shape mismatches, protocol disagreements |
| **Spec-to-doc** | Code alignment with system docs (via cl-reviewer sync) | Architectural drift |
| **Test coverage** | Test spec compliance (P2) | Untested behavior, missing test cases |
| **Dependency audit** | Vulnerability scan, license compliance, unused deps, lockfile integrity | CVEs, copyleft surprises, bloat |
```

**Change 18 — cl-researcher.md Bootstrap section**:

**Current** (from cl-researcher.md, Bootstrap section, under "Greenfield"):
> **Greenfield** (no code, no docs):
> 1. Discovery conversation about your project — goals, users, tech stack, constraints
> 2. Suggests initial doc set based on project type
> 3. Generates starting system docs with `[TBD]` markers for areas needing more detail

**Proposed**:

```markdown
**Greenfield** (no code, no docs):
1. Discovery conversation about your project — goals, users, tech stack, constraints,
   security strategy, data sensitivity, compliance requirements
2. Project profile detection (auto-detect, quick research, or presets) captures error
   handling, API conventions, dependency policy, and other cross-cutting decisions
3. Suggests initial doc set based on project type
4. Generates starting system docs with `[TBD]` markers for areas needing more detail

The discovery conversation includes security-specific depth probing. Most other cross-
cutting decisions (error handling, API style, accessibility, etc.) are captured by the
project profile system and defaults sheet.
```

**Change 19 — pipeline-concepts.md Directory Structure**:

**Current** (from pipeline-concepts.md, Directory Structure, post-P0.5):
> ```
> {docsRoot}/
>   system/                       Protected system docs (pipeline-managed only)
>     .manifest.md                Auto-generated index (gitignored)
>   research/                     Research docs (R-NNN-slug.md)
>   proposals/                    Proposals (P-NNN-slug.md)
>   reviews/
>     proposals/                  Proposal reviews + verify + corrections
>     audit/                      Audit reports + sync reports
>     design/                     Design review artifacts
>   specs/                        Generated specs + design specs
>   designs/                      Design files (.pen, DESIGN_PROGRESS.md)
>   context/                      Per-library knowledge files (progressive disclosure)
>     .context-manifest.md        Layer 1: library index
>     {library}/                  One folder per library
>       _meta.md                  Layer 2: overview + file inventory
>       {topic}.md                Layer 3: detail files
>   DECISIONS.md
>   RESEARCH_LEDGER.md
>   PROPOSAL_TRACKER.md
>   STATUS.md
> ```
> (Note: unchanged by P0.5 — the directory structure section was not modified)

**Proposed**:

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
  designs/                      Design files (.pen, DESIGN_PROGRESS.md)
  context/                      Per-library knowledge files (progressive disclosure)
    .context-manifest.md        Layer 1: library index
    {library}/                  One folder per library
      _meta.md                  Layer 2: overview + file inventory
      {topic}.md                Layer 3: detail files
  DECISIONS.md
  RESEARCH_LEDGER.md
  PROPOSAL_TRACKER.md
  STATUS.md
```

**Dependencies**: None.

---

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| SECURITY_SPEC.md | A specification artifact listing per-endpoint security requirements, system-level security policy, secure UX patterns, and dependency governance. Generated alongside implementation specs during spec mode. | spec-mode.md, SKILL.md, cl-implementer.md, pipeline-concepts.md |
| Error taxonomy | A system-level specification of error response format, error code system with category prefixes, error propagation chain, and per-endpoint error catalog. Part of API specs, not a separate file. | spec-mode.md, SKILL.md, cl-implementer.md |
| API conventions preamble | A set of system-level API conventions (pagination, naming, filtering, sorting, versioning, envelope) that all endpoint specs inherit. | spec-mode.md, spec-consistency-check.md, cl-implementer.md |
| Shared types | Types that cross the frontend/backend boundary. Inventoried during spec generation with serialization contracts. | spec-mode.md, cl-implementer.md |
| Supply-chain (fix task type) | A new fix task classification for dependency issues: vulnerable packages, hallucinated imports, license violations. Distinguished from `context-gap` (how to USE a library) by asking whether the library is SAFE to use. | run-mode.md |
| Dependency audit (verify dimension) | The sixth verification dimension (Dimension 6, after P2's Dimension 5: Test Coverage Against Test Spec). Runs `npm audit`, checks licenses, detects unused deps, verifies lockfile integrity. Findings are classified by checkpoint tier (P0.5): critical/high = Tier 1, medium = Tier 2, low/unused = Tier 3. | verify-mode.md, SKILL.md, cl-implementer.md |

### Migration

This proposal adds new capabilities without changing existing behavior:
- Existing spec generation still works identically — new artifacts are ADDITIONAL outputs
- Existing run mode still works — dependency verification is an ADDITIONAL step
- Existing verify mode still works — Dimension 6 is ADDITIONAL, doesn't change Dimensions 1-5
- Existing spec consistency check still works — Dimension 6 is ADDITIONAL
- Bootstrap questions are ADDITIONS to the existing question flow

No backward compatibility concerns. Projects that already have specs can regenerate to get
the new artifacts. Projects mid-implementation can add the dependency verification by
re-running with updated skills.

### Integration Points

| Changed Component | Integrates With | Interface Preserved |
|---|---|---|
| Spec mode (new artifacts) | Start mode (reads specs to generate tasks) | Yes — start mode reads `.spec-manifest.md` which will list new artifacts. Tasks generated from SECURITY_SPEC.md follow the same task format. |
| Spec mode (new artifacts) | Spec consistency check | Yes — new dimension 6 reads the same spec files. API conventions preamble is just another spec artifact. |
| Run mode (dependency verification) | Context loading protocol | Yes — dependency verification runs after context loading, before implementation. No change to context protocol. |
| Verify mode (Dimension 6) | Existing Dimensions 1-5 (Dimension 5 added by P2: Test Coverage Against Test Spec) | Yes — Dimension 6 runs after Dimension 5. Same output format (pass/fail per finding). |
| Bootstrap probing | Architecture doc generation, P0.5 defaults sheet | Yes — new security-specific questions feed into the `security`, `auth`, `authorization` category decisions in the defaults sheet. Most other categories already handled by P0.5 profile system. Same doc generation process. |

## Context Budget & Progressive Disclosure (Hard Requirement)

Every change in this proposal MUST respect the plugin's progressive disclosure model. Skills load reference files on-demand per mode — this is the primary mechanism for keeping context lean. Violating it bloats every invocation.

### Rules

1. **SKILL.md stays thin.** Mode detection + "Read `references/[mode].md`" pointers only. No inline process descriptions, no large tables, no protocol details. A SKILL.md should be under ~200 lines.

2. **Reference files are mode-scoped.** Content added to a reference file must be relevant to that mode's execution. Cross-cutting protocols (e.g., error taxonomy, security audit dimensions, API convention preamble) belong in a shared reference or in `pipeline-concepts.md` — NOT duplicated across multiple mode files.

3. **Large tables and catalogs go in separate files.** If a change adds a table with >10 rows (e.g., CVE severity matrix, error code catalog, API convention rules), it should be a separate reference file loaded only when needed — not inlined in the mode reference.

4. **Measure additions by token cost.** Each change should note its approximate token cost. A mode reference file should stay under ~3000 tokens. If a change pushes a file over budget, extract the addition into a sub-reference.

5. **Shared content uses references, not duplication.** If the same protocol or format is used by multiple modes or skills, define it once (in a shared reference or `pipeline-concepts.md`) and link to it. The decision flow protocol from P0.5 is the model: defined once, referenced everywhere.

6. **Exceptions.** Inlining is acceptable when the content is small (<20 lines), mode-specific, and would create unnecessary indirection if extracted. Use judgment — the goal is minimal context per invocation, not maximum file count.

### Merge Validation

During merge, the reviewer should verify:
- No SKILL.md file exceeds ~200 lines after changes
- No reference file exceeds ~3000 tokens after changes
- No content is duplicated across multiple files
- Cross-cutting additions use shared references

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| SECURITY_SPEC.md as a separate file (not sections in each spec) | Per-spec security sections only | Separate file enables holistic security audit. Per-endpoint rules still appear in the per-endpoint table within SECURITY_SPEC.md. The reviewer can check security coverage in one place. Research F21 recommends "a SECURITY_SPEC.md alongside implementation and test specs." |
| Error taxonomy inline in API specs (not a separate file) | Separate ERROR_TAXONOMY.md | Error taxonomy is consumed by every API spec and is relatively compact (~1 page). Inline avoids a file lookup during implementation. The format and code system are defined once and referenced by all endpoints. |
| API conventions as a preamble reference (not duplicated per spec) | Duplicate conventions in each spec | DRY principle. One preamble, many references. Specs declare "Inherits from: API_CONVENTIONS" and list only overrides. Reduces drift risk. |
| Block on critical CVEs, warn on medium/low | Block on all vulnerabilities; warn on all | Blocking on everything would halt implementation too frequently — medium/low advisories are often irrelevant to the project's attack surface. Critical/high represent real exploitable risks. This matches npm's own severity classification. |
| Registry existence check before install (not just audit after) | Audit only (catches most issues) | Hallucinated packages are a unique AI risk — 34% of AI-recommended packages don't exist. Installing a nonexistent package either fails (wasting time) or installs a typosquatting attack. Pre-install verification is cheap (one HTTP request) and eliminates the risk entirely. |
| Triage bootstrap depth by project type | Same depth for all projects | Personal/hobby projects don't need HIPAA compliance probing. Commercial projects need thorough security questioning. P0.5's project profile presets already encode this — the Prototype preset defaults to "Skip" for security, while Web Application defaults to "Standard" and API/Backend to "High". This proposal adds security-specific depth to the discovery conversation but relies on the profile system for most category probing. |
| Shared types inventory (not shared types implementation) | Generate shared type package structure | Spec generation specifies WHAT types cross boundaries and HOW they serialize. It does NOT generate the shared type package — that's an implementation concern handled during task generation. The spec-level inventory enables the consistency check to verify types match. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Security spec adds burden for hobby projects | Medium | Medium | Triage by project type at bootstrap. Personal projects can skip SECURITY_SPEC.md. Commercial projects should not. |
| Error taxonomy feels over-engineered for simple APIs | Low | Low | Scale to project: simple apps get format + ~15 codes. Complex apps get full taxonomy. Minimal base is small. |
| Dependency verification slows down implementation | Low | Low | `npm audit` is fast (<2s). Registry lookup is a single HTTP request. Amortized cost minimal. |
| Supply chain security creates false positives | Medium | Medium | Only block on critical/high. Medium/low are advisory. User can accept risk for specific packages. |
| Too many bootstrap questions | Low | Low | Largely mitigated by P0.5's profile system — most cross-cutting decisions are captured via the defaults sheet (generate-confirm pattern) rather than individual questions. This proposal only adds security-specific depth probing to the discovery conversation; other categories are handled by presets and auto-detect. |
| API conventions preamble becomes outdated mid-implementation | Low | Medium | Spec sync mechanism already handles this — if conventions change, affected specs are flagged for regeneration. |
| Spec consistency check becomes slower with dimension 6 | Low | Low | API convention check is lightweight — pattern matching against the preamble. No deep analysis. |

## Open Items

1. **Should the error taxonomy codes be customizable per project, or is the standard set
   sufficient?** The proposed taxonomy uses generic categories (VALIDATION_*, AUTH_*, etc.).
   Domain-specific codes (PAYMENT_DECLINED, SUBSCRIPTION_EXPIRED) would be extensions.
   Recommendation: standard base + domain extensions added during implementation as L1 spec
   gap resolutions.

2. **Should the dependency governance policy in SECURITY_SPEC.md be enforceable or
   advisory?** Currently proposed as advisory by default, with strict mode configurable in
   `.clarity-loop.json` for security-conscious projects. The config key would follow the
   P0.5 convention (flat namespace under functional area): e.g.,
   `security.dependencyGovernance: "advisory" | "strict"`. This is independent of the
   `ux.*` keys added by P0.5 — it's a functional config, not a UX preference. The
   `dependencies` category decision in DECISIONS.md captures the per-project choice; this
   config key would be the enforcement level.

3. **How should the pipeline handle projects with existing security infrastructure?** If
   the project already has CORS configuration, rate limiting middleware, or an error handling
   system, the security spec should acknowledge existing infrastructure and fill gaps rather
   than prescribe a full replacement. The P0.5 auto-detect level (Level 1 of the profile
   system) already scans for auth middleware, error classes, and API style patterns — the
   security spec generator should leverage these auto-detect signals rather than starting
   from scratch. Detection at spec-gen time via the decisions already captured in
   DECISIONS.md from bootstrap.

4. **Should the API conventions preamble support multiple API styles in one project?** Some
   projects have both REST and GraphQL, or REST and WebSocket. The preamble as proposed
   assumes a single REST convention set. Multi-style projects may need multiple preambles.

5. **Should SECURITY_SPEC.md include OWASP Top 10 mapping?** Mapping each security
   specification to the relevant OWASP category would add traceability to industry standards.
   Would increase spec size but improve audit capability.

## Appendix: Research Summary

The Pipeline Gap Analysis (docs/research/PIPELINE_GAP_ANALYSIS.md) identified 37 distinct
gap categories across the Clarity Loop pipeline. This proposal addresses six of them:

- **F21 (Security)**: The pipeline has zero security awareness. No skill asks about auth,
  no spec includes authorization contracts, no checklist verifies secure patterns. OWASP
  2025 data shows AI-generated code is 1.88-2.74x more likely to introduce security
  vulnerabilities compared to human code.

- **F22 (Error Taxonomy)**: Without a system-level error format, each endpoint independently
  decides its error shape. The frontend must handle multiple inconsistent patterns. Error
  handling is the most common source of frontend-backend integration failures.

- **F26 (API Conventions)**: Without system-level API conventions, each spec independently
  decides pagination style, naming, filtering, etc. The spec consistency check doesn't
  verify convention consistency.

- **F27 (Type Safety)**: Frontend and backend specs both define TypeScript types, but nothing
  ensures they stay synchronized at implementation time. Serialization gaps (Date to string
  to Date) are a common integration bug source.

- **F34 (Supply Chain Security)**: AI coding agents import vulnerable dependencies 49% of
  the time and hallucinate non-existent packages 34% of the time (Endor Labs 2025). The
  pipeline has no mechanism to verify dependencies.

- **F35 (Cross-Cutting Backend — partial)**: Rate limiting and input validation location
  aspects are addressed through the security spec and API conventions. Full cross-cutting
  backend policies (idempotency, transactions, caching) are deferred to P4.

The research recommends Option B (Top 10 + Full-Stack Testing) implemented across five
tiers. This proposal covers Tier 1c (security + errors) and the backend portions of Tier 2
(API conventions, type safety, edge cases, accessibility requirements).
