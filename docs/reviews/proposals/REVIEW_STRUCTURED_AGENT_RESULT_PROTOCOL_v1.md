# Review: Structured Agent Result Protocol

**Reviewed**: 2026-02-18
**Proposal**: docs/proposals/STRUCTURED_AGENT_RESULT_PROTOCOL.md
**System docs referenced**: SYSTEM_DESIGN.md (S1, S12, S14, S17), pipeline-concepts.md
**Research doc**: docs/research/R-004-STRUCTURED_AGENT_RESULT_PROTOCOL.md

## Summary

This proposal standardizes subagent-to-orchestrator communication across all 12 dispatch
sites in Clarity Loop's four skills. It introduces a four-status taxonomy, five result types,
a universal three-section envelope, a standardized finding table, and mechanical aggregation
rules. The protocol is well-designed, addresses a real gap (12 ad-hoc result formats), and
extends Bowser's proven RESULT line format for multi-type documentation analysis. One blocking
issue: the prompt templates (Phase 6 of the reference file) are placeholders, but every
dispatch site instruction references them as operational content.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Phase 6 Prompt Templates Are Placeholders

- **Dimension**: Completeness & Gaps
- **Where**: Detailed Design, Change 6 (reference file), Phase 6
- **Issue**: Phase 6 of the reference file contains `[One template per result type — digest,
  consistency, verification, implementation, design-plan — each 6-8 lines]` — a placeholder,
  not actual templates. However, every dispatch site instruction (Changes 7-18) says: "Load
  the protocol prompt template from `agent-result-protocol.md` Phase 6 and include it in each
  subagent's Task prompt." The dispatch sites reference content that doesn't exist.
- **Why it matters**: The prompt templates are the operational core of the protocol — they're
  the actual text subagents receive. Without them, an orchestrating agent reads Phase 6,
  finds a placeholder, and must improvise the prompt. This defeats the protocol's purpose
  of standardizing communication. The 12 dispatch sites would reference nonexistent content.
- **Suggestion**: Write the 5 actual templates (one per result type, 6-8 lines each). Each
  template should instruct the subagent to: (1) begin with the RESULT summary line in the
  correct format, (2) include the metadata block, (3) produce the type-specific detail
  section. Total: ~35-40 lines. This is straightforward given that the envelope format
  (Phase 3) and per-type metrics are already fully specified.

### 2. S12 and S14 Don't Currently Mention Subagent Dispatch

- **Dimension**: Ground Truth
- **Where**: Detailed Design, Changes 2 and 3
- **Issue**: The proposal claims S12 "describes parallel subagent dispatch for reading
  system docs" and S14 describes dispatch patterns. Having read both sections:
  - S12 (lines 1024-1095) describes the spec generation pipeline structure: waterfall gate,
    spec categories diagram, TEST_SPEC structure, consistency check dimensions. It does not
    mention subagents or parallel dispatch.
  - S14 (lines 1155-1208) describes three verification entry points and Code-Doc Sync at a
    structural level. It does not describe subagent dispatch.
  The actual subagent dispatch instructions live in the reference files (spec-mode.md,
  verify-mode.md, audit-mode.md), not in the system doc sections.
- **Why it matters**: Adding "Subagents report using the Structured Agent Result Protocol"
  to sections that don't mention subagents creates a dangling reference — the reader
  encounters protocol instructions without the dispatch context they refer to. If the goal
  is to make S12/S14 aware of the protocol, the sections would need slightly more context
  (e.g., "Spec generation uses parallel subagents to read system docs; those subagents
  report using the Protocol...").
- **Suggestion**: Either (a) expand the S12/S14 additions to include a brief mention of
  subagent dispatch before referencing the protocol, or (b) drop Changes 2 and 3 entirely
  and rely on S1's cross-cutting subsection + the dispatch site instructions. S1 already
  provides the architectural overview and points to the reference file. S12/S14 don't need
  to repeat it unless they also describe dispatch.

## Non-Blocking Suggestions

### 1. "What Exists Today" Category Counts Don't Match Change Manifest

The System Context table says 5 Content Extraction / 2 Design Planning sites. The Change
Manifest maps to 3 digest + 1 verification = 4 extraction-ish sites, and 3 design-plan
sites. The categories were inherited from the research doc's A-D grouping, which doesn't
perfectly align with the proposal's five result types. Not merge-affecting, but fixing the
table would improve internal consistency.

### 2. Change 11 Result Type Is Debatable

The re-review-mode dispatch (line 33-35) reads previous review files and extracts issue
lists. The proposal assigns result type `verification` (checklist format). A case can be
made for `digest` (content extraction from documents). Either works depending on the prompt
template's instructions — if the template tells subagents to produce a checklist with
item/status/notes, `verification` fits; if it tells them to summarize the review's content,
`digest` fits. Worth a deliberate choice when writing the Phase 6 templates (see Blocking
Issue 1).

### 3. Open Item 1 (Versioning) Can Be Resolved Now

The user confirmed "yes" to protocol versioning. The `Protocol: v1` field can be added to
the metadata block spec in Phase 3 of the reference file as part of this proposal rather
than deferring to implementation. Small addition, removes an open item.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| SYSTEM_DESIGN.md S1 | Consistent | Natural fit alongside Reference File Convention as a cross-cutting pattern |
| SYSTEM_DESIGN.md S12 | Tension | S12 doesn't mention subagents; adding protocol reference without dispatch context is awkward (Blocking Issue 2) |
| SYSTEM_DESIGN.md S14 | Tension | Same as S12 — structural overview doesn't describe dispatch operations |
| SYSTEM_DESIGN.md S17 | Consistent | Inventory update is mechanical (9→10, 35→36) |
| pipeline-concepts.md | Consistent | New section fits naturally after Reference File Structure |

## Strengths

- **Four-status taxonomy is genuinely better than binary PASS/FAIL.** FINDINGS as a success
  state is exactly right for documentation analysis. PARTIAL preserving valuable work from
  incomplete analyses is a pragmatic choice.

- **Graceful degradation is the right default.** Treating non-conformant results as PARTIAL
  rather than rejecting them acknowledges that AI subagents won't always follow format
  instructions perfectly. This prevents the protocol from becoming a fragility point.

- **The finding table format enables real mechanical aggregation.** Concatenate, deduplicate
  by location+type, sort by severity — these are operations that work on structured tables
  but not on prose. This is where the protocol delivers its core value.

- **Additive, zero-migration design.** Adding protocol instructions to existing dispatch
  sites without changing what subagents do is the lowest-risk path. The protocol is a
  formatting convention, not a behavioral change.

- **Scope discipline.** The proposal explicitly states what it does NOT do (implement
  fan-out, change mode logic, alter subagent behavior). This clarity prevents scope creep
  during the merge.

## Risk Assessment

Low risk overall. The protocol is additive documentation — it can't break existing behavior
because it only adds formatting conventions to dispatch instructions. The graceful degradation
design means even imperfect adoption produces value.

The main practical risk is **adoption friction**: orchestrating agents must read the protocol
file, find the right template, and include it in subagent prompts. If templates are clear
and concise (the 6-8 line target), this works well. If they're too complex, agents may
paraphrase or skip them. Keeping templates short is important.
