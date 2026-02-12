## Audit Mode

A rigorous, comprehensive review of the entire system documentation set. Unlike other modes
which are scoped to a single proposal, audit mode examines the full `docs/system/` directory
as a unified body of work and asks: is this documentation set still sound, consistent, and
aligned with its original goals?

Run an audit when:
- Significant time has passed since the last audit
- Multiple proposals have been merged and you want to check for cumulative drift
- Before a major implementation phase
- When something feels "off" but you can't pinpoint it
- Periodically as hygiene (e.g., every N proposals merged)

### Step 1: Load Everything

This is the one mode where you read EVERYTHING fresh — no manifest, no shortcuts. The whole
point is to see the docs with clean eyes.

1. **Read every file in `docs/system/`** — Dispatch subagents in parallel, one per doc.
   Each subagent produces:
   - Full content summary
   - All defined terms and their definitions
   - All architectural decisions and stated rationale
   - All cross-references to other system docs
   - Any claims about external technologies or patterns
   - Anything that reads as aspirational vs. decided

2. **Read all previous audit reports** — Check `docs/reviews/audit/AUDIT_*.md` for
   prior audits. These form your baseline for drift analysis.

3. **Read the research and proposal history** — Skim `docs/research/` and `docs/proposals/`
   to understand the sequence of changes that brought the system docs to their current state.
   This helps distinguish intentional evolution from accidental drift.

### Step 2: Eight-Dimension Analysis

Audit is more rigorous than review. You're not checking one proposal against the system —
you're checking the system against itself, against reality, and against its own stated goals.

Use subagents for parallel analysis where dimensions are independent.

#### 1. Internal Consistency (Cross-Document)

Check every pair of system docs for contradictions. This is the most mechanically
intensive check — dispatch subagents per doc pair if needed.

Look for:
- **Contradictory statements**: Doc A says X, Doc B says not-X
- **Terminology drift**: Same concept called different names in different docs, or same
  term used with different meanings
- **Stale cross-references**: Doc A references Section X of Doc B, but that section
  was restructured or removed
- **Redundant specifications**: Same behavior specified in two places with subtle
  differences — which is authoritative?
- **Architectural inconsistencies**: One doc describes a flow that another doc can't support
- **Version skew**: One doc was updated by a recent proposal but a related doc wasn't,
  leaving them out of sync

#### 2. Internal Consistency (Within-Document)

Check each doc against itself:
- Later sections contradicting earlier ones
- Definitions that shift meaning partway through
- Sections that no longer fit the doc's stated scope
- Orphaned references to removed content
- TODOs, TBDs, or placeholder content that was never filled in

#### 3. Technical Correctness

This is where the "research" aspect comes in. Don't just check if docs are consistent
with each other — check if what they claim is actually correct.

- **Technology claims**: If a doc makes claims about a specific technology's capabilities,
  verify that's accurate. Use web search for current capabilities.
- **Architecture claims**: If a doc claims a certain pattern provides specific guarantees,
  research the actual guarantees and failure modes. Flag overstated claims.
- **Pattern claims**: If a doc references a design pattern or industry standard, verify
  it's applied correctly — not just name-dropped.
- **Feasibility**: Are there sections that describe something that sounds good on paper
  but has known implementation challenges? Flag with evidence.
- **Security claims**: Any security-related claims should be verified against current
  best practices. These age fastest.

Use web search to validate technical claims. This is the one mode where external research
is part of the review itself.

#### 4. Goal Alignment & Drift

This is the most valuable and least mechanical check. Read the PRD (or equivalent goal
document) and ask: do the system docs as a whole still serve these goals?

- **Feature creep in docs**: Have proposals added complexity that wasn't in the original
  vision? Is the system docs set describing a system that's more complex than what was
  intended?
- **Lost priorities**: Were there original goals that have been quietly deprioritized as
  newer proposals took focus?
- **Means-end inversion**: Are there parts of the docs where an implementation detail
  has become a goal in itself, overshadowing the user need it was supposed to serve?
- **Scope drift**: Has the boundary of what the system does expanded or shifted from
  the original goals?
- **Principle violations**: Do the goals state design principles that the current system
  docs no longer reflect?
- **L1 assumption trend**: If `{docsRoot}/specs/IMPLEMENTATION_PROGRESS.md` exists, read
  the Spec Gaps table. Count L1 assumptions by category. Compare against previous audits:
  - Are the same categories accumulating assumptions across audit periods?
  - Are L1 assumptions being promoted to DECISIONS.md, or are they piling up?
  - Categories with 10+ unresolved L1 assumptions indicate persistent spec gaps that
    the system docs should address through research cycles.
- **Structural drift**: Compare the architecture doc's module descriptions, communication
  patterns (sync vs async, direct vs event-driven), and layer boundaries against the
  actual codebase structure:
  - Do imports follow the specified dependency direction?
  - Are communication patterns as described? (e.g., architecture says event-driven but
    implementation uses direct calls)
  - Do module boundaries in code match the architecture's descriptions?
  - This catches the most insidious form of drift — where individual tasks are correct
    but collectively alter the architecture.

If previous audit reports exist, compare: are the drift issues getting better or worse?
Are the same concerns being flagged repeatedly without resolution?

#### 5. Completeness

Is anything obviously missing?
- Features described in requirements but not covered in architecture or technical design
- Architectural components referenced in one doc but never defined anywhere
- Integration points mentioned but not specified
- Error handling and failure modes — are they addressed or hand-waved?
- Migration and upgrade paths — are they specified for breaking changes?
- Operational specifications — are deployment, configuration, observability, and
  migration concerns addressed? (CONFIG_SPEC.md, observability sections, migration notes)
- Backend policy specifications — are cross-cutting concerns like idempotency,
  transactions, and caching specified system-wide rather than per-endpoint?
- Data modeling behavioral decisions — are deletion strategy, cascade behavior, and
  temporal requirements specified per entity rather than left to implementer judgment?

#### 6. Coherence of Abstraction Level

Do the docs maintain consistent abstraction levels?
- Is the architecture doc staying architectural, or does it dive into implementation details
  that belong in technical design?
- Is the technical design staying technical, or does it re-state requirement-level content?
- Are there docs that try to be everything — part spec, part tutorial, part rationale?
- Is the separation of concerns between docs clear and maintained?

#### 7. Design Completeness

If system docs reference UI features (search for "interface", "dashboard", "UI", "frontend",
"screen", "page", "view", "component", "layout"), check for corresponding design artifacts:

- Does `{docsRoot}/designs/` exist and contain design files?
- Does `{docsRoot}/specs/DESIGN_SYSTEM.md` exist?
- Does `{docsRoot}/specs/UI_SCREENS.md` exist?
- If design artifacts exist, do they cover the UI features described in the PRD?

Flag findings:
- **No design artifacts**: "System docs describe UI features but no design artifacts exist.
  Consider running `/cl-designer setup`."
- **Partial coverage**: "Design artifacts exist but don't cover: [missing features]."
- **Stale designs**: "Design artifacts exist but system docs have changed since they were
  generated (check DESIGN_PROGRESS.md dates vs. system doc modification dates)."

If system docs don't reference UI features, skip this dimension entirely.

#### 8. Staleness

Are there parts of the docs that appear to be outdated?
- References to approaches or tools that have been superseded
- Sections that describe "planned" or "future" features that should have been resolved
- Content that predates major architectural decisions and hasn't been updated
- Dates, version numbers, or status fields that are clearly stale

### Step 3: Produce the Audit Report

```
docs/reviews/audit/AUDIT_[DATE].md
```

Use the date format `YYYY-MM-DD`. Example: `AUDIT_2026-02-08.md`.

```markdown
# System Documentation Audit

**Date**: [date]
**System docs audited**: [list every file]
**Previous audit**: [date of last audit, or "First audit"]
**Proposals merged since last audit**: [count and list, if applicable]

## Executive Summary

Two to three paragraphs: overall health of the documentation set. Is it in good shape,
showing signs of strain, or in need of significant attention? What are the top 1-3
concerns?

## Health Score

| Dimension | Rating | Trend | Summary |
|-----------|--------|-------|---------|
| Cross-doc consistency | Good / Some issues / Significant problems | Improving / Stable / Declining | One line |
| Within-doc consistency | ... | ... | ... |
| Technical correctness | ... | ... | ... |
| Goal alignment | ... | ... | ... |
| Completeness | ... | ... | ... |
| Abstraction coherence | ... | ... | ... |
| Design completeness | ... | ... | ... |
| Staleness | ... | ... | ... |

Trend column requires a previous audit. For the first audit, use "—" (baseline).

## Critical Findings

Issues that undermine the reliability of the system docs. These should be addressed
before any new proposals are merged, because new proposals will be reviewed against
docs that contain these errors.

### [Finding Title]
- **Dimension**: Which of the eight dimensions
- **Docs involved**: Which system docs
- **Finding**: What's wrong
- **Evidence**: Specific quotes, section references, or research results
- **Impact**: What goes wrong if this isn't fixed
- **Recommended action**: How to fix — this may require a targeted proposal

## Warnings

Issues that don't undermine reliability but indicate degradation over time.

### [Warning Title]
- **Dimension**: Which of the eight dimensions
- **Docs involved**: Which system docs
- **Finding**: What's concerning
- **Trend**: Getting better or worse since last audit? (if applicable)
- **Recommended action**: Preventive fix

## Technical Verification Results

Results of external research to verify technical claims in the docs.

| Claim | Source Doc | Verified? | Notes |
|-------|-----------|-----------|-------|
| [claim from docs] | [doc name] Section X | Accurate / Partially / Incorrect | [evidence] |
| ... | ... | ... | ... |

## Goal Alignment Analysis

### Original Goals

Restate the core goals and design principles from the requirements or PRD.

### Current Alignment

For each goal, assess how well the current system docs reflect it:

| Goal / Principle | Status | Notes |
|-----------------|--------|-------|
| [goal] | Aligned / Drifting / Lost | [how] |
| ... | ... | ... |

### Drift Analysis

If previous audits exist, track how alignment has changed:

| Goal / Principle | Previous Audit | Current | Trend |
|-----------------|---------------|---------|-------|
| [goal] | Aligned | Drifting | Declining |
| ... | ... | ... | ... |

Narrative: what's driving the drift? Is it intentional evolution or accidental?

## Cross-Reference Map

A matrix showing consistency status between every pair of system docs:

|  | Doc A | Doc B | Doc C | ... |
|--|-------|-------|-------|-----|
| **Doc A** | — | Status | Status | ... |
| **Doc B** | | — | Status | ... |
| **Doc C** | | | — | ... |

Detail any tension or conflict entries in the findings sections above.

## Staleness Report

| Doc | Last Meaningful Update | Stale Sections | Action |
|-----|----------------------|----------------|--------|
| [doc name] | [estimated from proposals] | [sections, if any] | OK / Needs refresh |
| ... | ... | ... | ... |

## Recommendations

Prioritized list of actions. Distinguish between:
1. **Immediate** — fix before merging new proposals (critical findings)
2. **Next cycle** — address in the next proposal round (warnings)
3. **Hygiene** — clean up when convenient (staleness, minor inconsistencies)

For significant fixes, note whether they should go through the full research -> proposal
pipeline or can be handled as targeted corrections.

## Comparison with Previous Audit (if applicable)

| Metric | Previous | Current | Change |
|--------|----------|---------|--------|
| Critical findings | N | N | +/-N |
| Warnings | N | N | +/-N |
| Technical claims verified | N/M | N/M | ... |
| Goals aligned | N/M | N/M | ... |

Are the previous audit's recommendations being addressed, or are they accumulating?
List any unresolved recommendations from the previous audit.
```

### Step 4: Update Tracking

After writing the audit report:
1. Update `docs/STATUS.md` — set "Last audit" to today's date, note key findings
2. If the audit reveals emerged concepts, add them to STATUS.md's emerged concepts table
3. **Log audit decisions to DECISIONS.md** — For each finding that required a judgment
   call, log a Decision entry:
   - Fix-vs-research: "This drift needs a correction" vs. "This needs a full research cycle"
   - Severity assessment: "This is critical and blocks implementation" vs. "This is cosmetic"
   - Deprecation: "This section is no longer accurate and should be removed or rewritten"
   Use Pipeline Phase `audit`, Source the audit report finding number. Every "Confirmed
   drift" and "Recommend action" that involves choosing a course of action should have a
   corresponding entry

### Guidelines for Audit Mode

- **This is the most expensive operation in the pipeline.** Don't run it casually. It
  reads everything, researches external claims, and produces the most detailed report.
  Reserve it for meaningful checkpoints.

- **Research is part of the audit.** Unlike other modes where you're checking consistency,
  here you're checking correctness. Use web search. Verify technology claims. Check if
  libraries still work the way the docs say they do.

- **Drift is the most important finding.** Individual inconsistencies are fixable. But
  if the system docs have gradually drifted away from the original vision, that's a
  deeper problem that individual fixes won't solve. Call it out clearly.

- **Be honest about the health score.** Don't grade on a curve. If the docs are in rough
  shape, say so. The user needs an accurate picture.

- **Track trends.** The most valuable audits are the ones that can compare to previous
  audits. If this is the first audit, note that everything is a baseline. If it's the
  second+, always include the trend analysis.

- **Don't try to fix everything in the audit.** The audit identifies problems. Fixes go
  through the normal research -> proposal pipeline (or targeted corrections for small
  issues). The audit report is the input to deciding what to fix next.
