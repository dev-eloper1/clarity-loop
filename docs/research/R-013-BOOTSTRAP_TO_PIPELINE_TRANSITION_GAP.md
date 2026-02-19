# Research: Bootstrap-to-Pipeline Transition Gap

**ID**: R-013
**Created**: 2026-02-18
**Status**: Approved
**Author**: Bhushan + cl-researcher

---

## Status

- **Research Type**: Evolutionary
- **Status**: approved
- **Open Questions**: 0 remaining
- **Discussion Rounds**: 3
- **Complexity**: L1-contained (expanded — see Finding 4, Finding 5)

---

## System Context

### Research Type: Evolutionary

This research changes the behavior of an existing skill. No new skill is introduced — existing mode detection logic and bootstrap process instructions are amended.

### Related Skill Files

| File | Relevant Sections | Relationship |
|------|-------------------|-------------|
| `skills/cl-researcher/skill.md` | Mode Detection | Missing rule for mid-bootstrap mode transition |
| `skills/cl-researcher/skill.md` | Guidelines | No guideline covering bootstrap-to-pipeline transition boundary |
| `skills/cl-researcher/references/bootstrap-guide.md` | Phase 3, Step 5 (Generate Initial System Docs) | No transition gate after initial docs are written |

### Current State

The cl-researcher skill has a hard assumption embedded in its mode detection: **bootstrap mode = system docs do not yet exist**. Once the user says "bootstrap" and doc generation begins, the skill stays in bootstrap mode for the entire conversation — including after initial system docs have been written to disk.

This creates a gap: if the user provides feedback mid-conversation that would amend an already-generated doc, the skill treats it as a continuation of bootstrap (direct edit) rather than a pipeline change (research → proposal → review → merge). The mode detection rule for triage reads *"when system docs already exist"*, which is never true during bootstrap even though docs may have been partially created.

### Why This Research

Observed during a live bootstrap session for `notes-app`. After generating 7 system docs, the user clarified their vision ("second brain for every entity, agents have their own space, shared space = workspace-level access"). This was a significant architectural change touching 5 system docs (PRD, DATA_MODEL, AUTH_PERMISSIONS, AI_INTEGRATION, REALTIME_COLLABORATION). The skill edited all 5 docs directly without triaging the change, offering a research cycle, generating a proposal, or routing through cl-reviewer.

The user correctly identified this as a pipeline violation.

---

## Scope

### In Scope

- Identify the exact locations in `skill.md` and `bootstrap-guide.md` where the gap exists
- Define the transition rule: when does bootstrap mode end and pipeline mode begin
- Specify what the skill should do when it detects a mid-bootstrap amendment
- Keep the fix minimal — this is a contained behavioral rule, not an architectural overhaul

### Out of Scope

- Changes to cl-implementer, cl-designer
- Changing what bootstrap generates — only the transition detection logic

> **Scope update (Discussion Round 2)**: Finding 4, which emerged during live testing of the notes-app P-001 review cycle, extends the analysis to cl-reviewer. The original "Out of Scope: Changes to any other skill" constraint was correct when this research was first written, but the same root pattern (retroactive framing causing formal steps to be skipped) manifests in cl-reviewer as well. The fix is still contained — one rule addition to `references/review-mode.md`.

> **Scope update (Discussion Round 3)**: Finding 5, which emerged during the R-005 (Fan-Out Orchestration) research session, extends the analysis to the research template itself. The same root pattern — formal checks being skipped because the context feels different ("this is just a draft") — manifests in `research-template.md`. The template has no conditional completeness checks by research type, no cross-research coherence step, and no distinction between open questions requiring user input vs questions resolvable by existing documentation. The fix is contained: targeted additions to `references/research-template.md` Phase 2 and Phase 4 process steps, plus one new section in the Template block.

### Constraints

- The fix must not make bootstrap feel bureaucratic for genuinely new content (filling in a `[TBD]`, adding a new doc). Only amendments to already-generated content should trigger the gate.
- The skill should give the user a choice, not force a full research cycle. Some amendments are trivial (L1 or L0) and direct edit is appropriate.

---

## Research Findings

### Finding 1: The Gap Has Three Distinct Locations

The root failure is that no single rule covers the "bootstrap conversation is still ongoing but some docs already exist" state. Three locations each need a targeted fix:

**Location A — `skill.md` Mode Detection**

The triage trigger reads:
> *"This is the default entry point for new topics **when system docs already exist**."*

During bootstrap, this condition is never met — even when docs have been written to disk — because the skill remains in bootstrap mode. A clause needs to be added that fires triage detection based on the *content of the user's message* relative to the *docs already written*, not just the presence or absence of docs.

**Location B — `skill.md` Guidelines**

No guideline addresses the bootstrap-to-pipeline transition. The existing guidelines assume clean mode boundaries. A new guideline is needed that explicitly names the transition moment and what to do when reached.

**Location C — `bootstrap-guide.md` Phase 3, Step 5**

The step ends with:
> *"These are starting points, not final docs. The normal pipeline handles subsequent changes."*

This is correct as a principle but passive — it's a closing remark, not an active check. A **transition gate** is needed immediately after doc generation that makes the shift explicit to the skill.

### Finding 2: The Distinction That Matters

Not all mid-bootstrap user feedback is equal:

| User Response Type | Example | Correct Handling |
|-------------------|---------|-----------------|
| Fills a `[TBD]` gap | "The auth should use JWT" | Bootstrap continuation — direct update |
| Adds a new doc to the set | "Also add an OPERATIONS.md" | Bootstrap continuation — generate new doc |
| Amends already-generated content | "Actually the workspace model is wrong — it should be space-level not note-level" | **Pipeline change** — triage + offer research cycle |

The trigger for switching modes is: *"Does this feedback change what has already been written to a doc on disk?"* If yes, it's a pipeline change. If no (filling gaps, adding), it's bootstrap continuation.

### Finding 3: The Loop Calibration Table Already Has the Answer

The existing Loop Calibration table in the Guidelines section handles this correctly once the transition is detected:

| Risk Level | Signal | Loop Type |
|------------|--------|-----------|
| Low | Typo, formatting, minor clarification | Direct fix |
| Medium | Single-section update, new edge case | Lightweight |
| High | Cross-doc impact, architectural change | Full cycle |
| Critical | Fundamental assumption invalidated | Full + advisory |

The fix is not to invent new logic — it's to route mid-bootstrap amendments through the existing Loop Calibration table rather than bypassing it. The notes-app case (5 docs affected, access model replaced) was clearly High → full research cycle.

### Finding 4: The Same Framing Bias Affects cl-reviewer's Pre-Merge Validation

**Context**: During the notes-app P-001 review cycle, cl-reviewer produced a Merge Advisory that read: *"Not applicable — this is a retroactive proposal; the changes are already in the system docs."* The pre-merge validation step (exhaustive check of all Change Manifest items against actual files) was skipped on the grounds that the changes had already been applied.

**Analysis**: This is the same root pattern as the bootstrap gap — *"already happened informally" is being treated as "formal step no longer needed"* — but manifesting in cl-reviewer. For a retroactive proposal, the reasoning is precisely backwards:

- **Normal proposal**: The merge step is the controlled change event. Pre-apply validation checks that targets haven't drifted since the proposal was written. If files are clean, merge proceeds and verify follows.
- **Retroactive proposal**: There was no controlled merge event. The "merge" happened informally during bootstrap. Pre-apply validation is therefore the **only exhaustive completeness check** that every Change Manifest item actually landed correctly. The review's spot-check (5–7 items out of 26) is a sample; pre-merge validation is comprehensive.

The notes-app case demonstrated the cost: the initial review's 7-item spot-check caught one gap (stale `checkNoteAccess` signature in `ai.invoke`). A full pre-merge pass over all 26 items would have caught it as part of the standard exhaustive check rather than requiring it to surface through the spot-check sample. There could have been more gaps.

**Fix location**: `references/review-mode.md`, Phase 3 (Produce the Review File), Merge Advisory section. The current logic allows marking pre-apply validation as "Not applicable" for retroactive proposals. The fix adds a specific rule: for retroactive proposals, the Merge Advisory must recommend **exhaustive** pre-apply validation, with the explicit justification that the absence of a controlled merge event makes this the primary completeness gate.

**Tradeoffs**: The check is more work up front, but it's exactly the work that would surface in verify anyway if anything is wrong. Doing it before merge is cleaner than finding gaps post-ratification.

**Source**: Live testing of notes-app P-001 review cycle, 2026-02-18. The user caught the missing pre-merge suggestion during the fix mode phase and correctly identified it as a gap.

### Finding 5: The Research Template Has No Conditional Completeness Checks by Research Type

**Context**: Observed during the R-005 (Fan-Out Orchestration) research session, 2026-02-19. Seven structural gaps in R-005 were discovered post-draft — after it had been reviewed by the user — and required iterative correction across multiple conversation turns. The root pattern: the research template enforces structure (sections, tables, formatting) but not *type-specific completeness*. A research doc proposing new agent architecture has different required content than a behavioral rule change, but the template treats them identically.

**Analysis**: Seven distinct gaps surfaced during R-005 refinement:

**Gap 1 — No behavioral impact summary required by the template**

R-005 had no section explaining what the research would add to the plugin or change in existing behavior. The user asked explicitly: *"explain what will this new research add and how does it change the current plugin behavior."* A "What This Research Changes" section was added mid-session. The template has no required section for this — research docs can be drafted entirely as design explorations without ever stating the behavioral delta for existing users.

**Gap 2 — No cross-research coherence check**

R-005 proposed creating 5 new agent definitions. R-006 (Guidance Execution Separation, already approved at the time) had independently proposed the same 5 agents targeting the same modes with the same staging plan. The overlap was discovered only when R-006 was read during the R-005 session. The template has no step requiring that proposed changes be checked against existing approved research docs for duplication or conflict before leaving Draft.

**Gap 3 — API and convention validation not required for technology-specific research**

R-005 specified agent file locations as `skills/agents/` (incorrect) rather than `.claude/agents/` (the Claude Code convention). The `cl-` naming prefix was also absent. These are verifiable Claude Code platform facts that were wrong in the research draft. The template has no step requiring that proposed API usage, file conventions, or platform-specific patterns be validated against the actual target platform before Draft submission.

**Gap 4 — Experimental vs standard feature boundary not surfaced**

R-005 initially framed `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` as required for parallel agent execution. This was incorrect: the basic `Task` tool already provides parallelism when multiple calls are made in a single message. The experimental teams flag adds lifecycle management and streaming collection, not parallelism itself. This framing error had downstream impact on two Findings (both substantially rewritten) and the Constraints section. The template has no prompt for *"if this research proposes using an experimental feature, verify that the standard API cannot already satisfy the core requirement."*

**Gap 5 — Handoff mechanics not required for cross-boundary research**

R-005 proposed a fan-out orchestration pattern but initially contained no description of how the skill-to-agent handoff actually occurs: prompt construction, `subagent_type` resolution, agent context isolation, return value structure, or the reverse path. These mechanics were added as Finding 3 only after the user explicitly asked: *"how does the skill to agent handoff and visa versa happen."* Research proposing architecture that dispatches work across a boundary (skill → agent, agent → orchestrator) should be required to specify the handoff protocol for that boundary. The template has no such requirement.

**Gap 6 — Context system interaction rules not scoped for research proposing shared resource access**

R-005 proposed agents that would operate near shared pipeline state files (DECISIONS.md, PARKING.md, context files). The rules for this access — what agents may read vs write, the anti-pattern of concurrent writes, the correct channel for surfacing findings (structured result → orchestrator writes after collection) — were entirely absent from the initial research. These were added only after the user asked: *"can the agents also use the context management system... would this be an anti pattern."* Research proposing components that interact with shared pipeline state should be required to specify interaction rules for that state. The template has no such requirement.

**Gap 7 — Answerable open questions not distinguished from questions requiring user input**

R-005 was drafted with 6 open questions. Four of them (OQ1, OQ3, OQ4, OQ5) were resolvable by reading existing codebase files — R-006 and the Bowser `.claude/agents/` directory. These were left as open questions and only resolved during the user review session. The template says *"track open questions that need user input or further investigation"* but treats all open questions identically. It does not distinguish between questions that genuinely require user input (legitimately open at Draft) and questions answerable through existing documentation (should be resolved before Draft submission, not surfaced to the user as open).

**Tradeoffs**: Adding mandatory checks to the template makes research more thorough but also slower. The mitigating design is to scope checks by research type: a simple behavioral rule change (L0/L1 evolutionary) does not need a handoff protocol section; a net-new agent-dispatching architecture does. Conditional sections ("Required if research type includes agent architecture") preserve speed for simple research while enforcing completeness for complex research.

**Fix location**: `skills/cl-researcher/references/research-template.md` — Phase 2 (Research and Analysis) and Phase 4 (Discussion and Refinement) process steps, plus the Template block. Specifically:

- **Phase 2**: Add a "Research Type Completeness Checklist" sub-step. Conditional items based on research type:
  - All types: check RESEARCH_LEDGER.md for overlap with approved research targeting the same files or proposing similar components
  - Technology-specific (proposing new API/tool usage): verify actual platform conventions before writing findings
  - Experimental-feature: verify whether the standard API satisfies the core requirement before treating the experimental flag as required
  - Agent-architecture: require a handoff protocol finding covering prompt construction, context isolation, return value structure
  - Shared-state access: require an interaction rules finding covering read/write rules and concurrency
- **Phase 4**: Split open questions into "Requires User Input" and "Resolvable by Existing Documentation." Require the latter to be resolved before Draft submission, not surfaced as open questions.
- **Template block**: Add "What This Research Changes" section (for evolutionary/hybrid research) between Scope and Research Findings — states current behavior, what is added, what stays the same.

**Source**: Live research session for R-005 (Fan-Out Orchestration), 2026-02-19. All seven gaps surfaced through user feedback during iterative refinement after initial draft submission.

---

## Options Analysis

| Criterion | Option A: Hard Gate | Option B: Soft Offer | Option C: No Change |
|-----------|--------------------|--------------------|-------------------|
| Prevents future violations | ✓ | ✓ | ✗ |
| User experience | Interrupts flow | Presents choice, user decides | Seamless but wrong |
| Handles L0/L1 amendments | Forces pipeline unnecessarily | Offers direct edit for low-risk | Always direct edit |
| Implementation complexity | Low | Low | None |
| Aligns with existing Loop Calibration | Partial | Full | No |

---

## Recommendations

### Primary Recommendation

**Option B: Soft Offer** — when a mid-bootstrap amendment is detected, the skill surfaces the transition and presents a choice using the Loop Calibration table to frame the risk level. It does not force a research cycle; it makes the distinction visible.

The message pattern:
> *"This changes what I just wrote in [doc(s)]. Bootstrap is done for initial creation — this is a pipeline change now. Based on the scope ([N] docs affected, [concern type]), this looks like a [Low/Medium/High] risk change. [For High: I'd recommend a research cycle rather than editing directly. Want to proceed that way?] [For Low/Medium: I can edit directly or open a research cycle — your call.]*"

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Skill over-triggers on minor tweaks | Medium | Low — just a prompt, user can say "edit directly" | Scope the trigger to content changes only, not phrasing or clarifications |
| User frustration at interruption during fast bootstrap | Low | Low | Always present "edit directly" as an option for L0/L1 changes |
| Ambiguity about what "amends already-generated content" means | Medium | Medium | Define clearly in the guideline: if the user's response contradicts or replaces something already written, it's an amendment |

### Impact on Skill Files

| File | Expected Changes | Finding |
|------|-----------------|---------|
| `cl-researcher/skill.md` — Mode Detection | Add clause: trigger triage evaluation if user feedback during bootstrap would amend an already-generated doc | F1 |
| `cl-researcher/skill.md` — Guidelines | Add new guideline: "Bootstrap ends when docs are generated" — defines the transition and the soft-offer pattern | F1 |
| `cl-researcher/references/bootstrap-guide.md` — Phase 3, Step 5 | Add transition gate after doc generation: active check, not passive remark | F1 |
| `cl-reviewer/references/review-mode.md` — Phase 3, Merge Advisory | Add rule: for retroactive proposals, Merge Advisory must recommend exhaustive pre-apply validation (not "Not applicable") — the absence of a controlled merge event makes this the primary completeness gate | F4 |
| `cl-researcher/references/research-template.md` — Phase 2 | Add "Research Type Completeness Checklist" sub-step with conditional items: cross-research overlap check (all types), platform convention verification (technology-specific), experimental vs standard feature boundary check (experimental-feature), handoff protocol requirement (agent-architecture), interaction rules requirement (shared-state access) | F5 |
| `cl-researcher/references/research-template.md` — Phase 4 | Split open questions into "Requires User Input" vs "Resolvable by Existing Documentation" — require the latter to be resolved before Draft submission | F5 |
| `cl-researcher/references/research-template.md` — Template block | Add "What This Research Changes" section between Scope and Research Findings (required for evolutionary/hybrid research): current behavior, what is added/changed, what stays the same | F5 |

---

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Hard gate vs soft offer | Forcing research cycle always vs offering choice | Soft offer (Option B) | Loop Calibration already handles risk-based routing. Forcing pipeline for L0/L1 amendments adds friction without value. |
| 2 | Where to make the change | skill.md only vs bootstrap-guide.md only vs both | Both files + both locations in skill.md | The gap exists in three places. Fixing only one leaves the other two able to reproduce the same failure. |
| 3 | Scope of the fix | Fix the transition logic only vs also add retroactive cleanup instructions | Fix only the transition logic | Retroactive handling (what to do when docs were already edited without pipeline) is a separate operational concern; adding it here would bloat a contained fix. |

---

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Mode boundary detection generalised | Other skills (cl-designer, cl-implementer) may have similar in-mode vs post-mode transition gaps | Park as incremental — worth a cross-skill audit after this fix ships |
| Retroactive proposal for out-of-pipeline edits | When docs are edited directly (as happened in notes-app), there's no standard recovery path. The recovery path now exists (create retroactive R + P, route through cl-reviewer), but the cl-reviewer gap (Finding 4) means the review step was not enforcing exhaustive validation for the retroactive case. Both the recovery path and the validation gap are now documented. | Addressed in Finding 4; full fix in review-mode.md |

---

## Open Questions

None. Research is complete and ready for proposal generation.

---

## References

- Observed failure (F1–F3): notes-app bootstrap session, 2026-02-18 — vision clarification at turn 6 triggered direct edits to 5 system docs without pipeline routing
- Observed failure (F4): notes-app P-001 review cycle, 2026-02-18 — cl-reviewer skipped pre-merge validation for retroactive proposal; gap surfaced when user asked why pre-merge check wasn't suggested
- Observed failure (F5): R-005 research session, 2026-02-19 — seven structural gaps discovered post-draft through user feedback; gaps required iterative correction across multiple conversation turns
- `cl-researcher/skill.md` — Mode Detection section, Triage mode rule
- `cl-researcher/skill.md` — Guidelines section, Loop Calibration table
- `cl-researcher/references/bootstrap-guide.md` — Phase 3, Step 5
- `cl-reviewer/references/review-mode.md` — Phase 3, Merge Advisory
- `cl-researcher/references/research-template.md` — Phase 2 (Research and Analysis), Phase 4 (Discussion and Refinement), Template block
- `docs/research/R-005-FAN_OUT_ORCHESTRATION.md` — source session for F5 gaps
- `docs/research/R-006-GUIDANCE_EXECUTION_SEPARATION.md` — illustrates Gap 2 (cross-research overlap not detected at draft time)
