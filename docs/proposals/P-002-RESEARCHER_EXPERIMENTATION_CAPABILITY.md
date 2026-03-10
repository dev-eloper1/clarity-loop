# Proposal: Researcher Experimentation Capability

**ID**: P-002
**Created**: 2026-03-10
**Status**: Draft
**Research**: docs/research/R-014-RESEARCHER_EXPERIMENTATION_CAPABILITY.md
**Document Plan**: None (structure derived directly from research)
**Author**: User + AI researcher
**Depends On**: None

## Summary

This proposal adds empirical validation capability to the cl-researcher skill. Today, the researcher is a pure analysis tool — it reads, reasons, and recommends, but cannot write or run code to test its claims. When a finding has low confidence (e.g., "does this API actually work this way?"), the researcher must hedge. Validation gets deferred to the implementer, where surprises are more expensive.

The solution uses Claude Code's native `isolation: "worktree"` capability. A new `experiment-runner` agent executes experiments in isolated git worktrees, returning structured results to the researcher. The researcher identifies when experimentation would be valuable via confidence annotations, proposes experiments to the user for approval, and captures results in a standardized EXP-N format within the research document.

This is a minimally invasive extension: experimentation is a sub-phase of Phase 3 (Conduct Research), not a new top-level phase. It's optional — triggered by confidence assessment, not required on every research cycle. All experiments require user approval before execution, consistent with the core principle: "AI does the work, humans make the calls."

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|-------------|-------------------|----------------------|
| docs/research/R-014-RESEARCHER_EXPERIMENTATION_CAPABILITY.md | Finding 1 (native isolation mechanisms), Finding 2 (worktree model), Finding 3 (confidence-driven triggering), Finding 4 (two-layer archival), Finding 6 (workflow integration) | Primary: worktree-based subagents with confidence-driven triggering, two-layer archival, and always-propose-first approval model |

## System Context

### Research Type: Hybrid

New capability (experimentation) added to an existing skill (cl-researcher), requiring changes to the research workflow, a new agent definition, and template updates.

### Current State

| System Doc | Current State Summary | Sections Referenced |
|------------|----------------------|-------------------|
| `skills/cl-researcher/SKILL.md` | Seven modes (bootstrap, brownfield, triage, research, structure, proposal, context). Research mode has 5 phases. No mention of experimentation or confidence assessment. | Mode Detection, Research Mode (Phases 1-5), Guidelines |
| `skills/cl-researcher/references/research-template.md` | Template has Phase 2 (Research and Analysis) with findings format (Context/Analysis/Tradeoffs/Source). No experimental validation section. Phase 4 (Discussion and Refinement) has no user-triggered experiment pathway. | Phase 2, Phase 4, Template section |
| `agents/` | Five agents: cl-consistency-checker, cl-design-planner, cl-dimension-analyzer, cl-doc-reader, cl-task-implementer. No experiment-related agent. | Agent roster |
| `scripts/init.js` | Scaffolds directories: system, research, proposals, reviews/proposals, reviews/audit, reviews/design, specs, designs, context. No experiment-related directory. | dirs array (line ~200) |

### Proposed State

After this proposal is applied:
- The researcher skill recognizes experimentation as a sub-phase of research, with confidence annotations guiding when to propose experiments
- A new `experiment-runner` agent handles isolated experiment execution in worktrees
- The research template includes an Experimental Validation section with structured EXP-N entries
- Research findings carry confidence annotations that signal when empirical validation would increase recommendation quality
- All experiments require explicit user approval before execution
- Experiment branches follow the `experiment/<slug>-YYYY-MM-DD` naming convention
- Results are always retained in the research doc; code branches are selectively retained or pruned

## Change Manifest

> This is the contract between the proposal and the target files. The cl-reviewer will
> use this table to verify every change was applied correctly during the verify step.

| # | Change Description | Target Doc | Target Section | Type | Research Ref |
|---|-------------------|-----------|----------------|------|-------------|
| 1 | Add confidence annotation guidelines to research mode | `skills/cl-researcher/SKILL.md` | Research Mode → Phase 3: Conduct Research | Modify | Finding 3 |
| 2 | Add experiment proposal flow to research mode | `skills/cl-researcher/SKILL.md` | Research Mode → Phase 3: Conduct Research | Add | Findings 2, 3 |
| 3 | Add user-triggered experiment pathway to Phase 5 | `skills/cl-researcher/SKILL.md` | Research Mode → Phase 5: Refine | Add | Finding 6 |
| 4 | Add Experimental Validation section to research template | `skills/cl-researcher/references/research-template.md` | Template section (after Research Findings) | Add Section | Finding 4 |
| 5 | Add confidence annotations to findings format in template | `skills/cl-researcher/references/research-template.md` | Phase 2: Research and Analysis | Modify | Finding 3 |
| 6 | Add experiment proposal to Phase 4 Discussion | `skills/cl-researcher/references/research-template.md` | Phase 4: Discussion and Refinement | Modify | Finding 6 |
| 7 | Create experimentation guide reference | `skills/cl-researcher/references/experimentation-guide.md` | (new file) | Add Doc | Findings 1-6 |
| 8 | Create experiment-runner agent | `agents/experiment-runner.md` | (new file) | Add Doc | Findings 1, 2 |

**Scope boundary**: This proposal ONLY modifies the files/sections listed above. It does NOT change: cl-reviewer, cl-designer, cl-implementer, hooks, or scripts/init.js.

Note: The research identified `scripts/init.js` as a potential target for experiment directory scaffolding. This proposal deliberately excludes init.js changes because experiment branches are managed by git, not by a scaffolded directory. No project-level experiment directory is needed — results live in the research doc, and code lives on branches.

## Cross-Proposal Conflicts

No conflicts with in-flight proposals. The proposal tracker shows no active proposals targeting the researcher skill or agent definitions.

## Detailed Design

### Change 1: Confidence Annotations in Phase 3

**What**: Add a step to Phase 3 (Conduct Research) that instructs the researcher to assess confidence levels on findings.

**Why**: Research Finding 3 identified that experimentation should emerge organically from confidence assessment, not be forced. Annotating findings with confidence levels is the trigger mechanism.

**System doc impact**: `skills/cl-researcher/SKILL.md`, Phase 3 section.

**Current** (from `skills/cl-researcher/SKILL.md` Phase 3):
> Phase 3 lists four activities: deep-read relevant system docs, analyze the problem space, research external approaches, and synthesize.

**Proposed**:
> Add a fifth activity after "Synthesize":
>
> 5. **Assess confidence** — For each finding or recommendation, assess your confidence level:
>    - **High**: Well-documented behavior, multiple corroborating sources, consistent with system docs. No experiment needed.
>    - **Medium**: Documentation exists but has version caveats, edge cases are unclear, or sources conflict. Experiment recommended — propose to the user.
>    - **Low**: Undocumented behavior, novel integration, performance claim without benchmarks, or feasibility question. Experiment strongly recommended — propose to the user.
>
>    Confidence assessment is subjective — err toward proposing experiments rather than hedging in the research doc. The user can always decline.

**Dependencies**: None — this is a standalone addition.

### Change 2: Experiment Proposal Flow in Phase 3

**What**: Add instructions for proposing experiments to the user when low/medium-confidence findings are identified.

**Why**: Research Findings 2 and 3 established the worktree-based experiment model and the confidence-driven trigger. This change connects them — when confidence is low, the researcher proposes an experiment.

**System doc impact**: `skills/cl-researcher/SKILL.md`, Phase 3 section (immediately after Change 1).

**Current**: No experiment proposal mechanism exists.

**Proposed**:
> Add after the confidence assessment step:
>
> 6. **Propose experiments for low-confidence findings** — When findings have medium or low confidence and empirical validation would resolve the uncertainty, propose an experiment to the user:
>
>    "I have [medium/low] confidence in [finding]. To validate this, I'd like to run an experiment:
>    - **Hypothesis**: [What we're testing]
>    - **Plan**: [What the experiment will do — code to write, commands to run]
>    - **Expected output**: [What success/failure looks like]
>    - **Estimated scope**: [Small script / multi-file setup / infrastructure build]
>
>    Should I run this experiment?"
>
>    If the user approves, read `references/experimentation-guide.md` and follow its process. Capture results in the research doc's Experimental Validation section.
>
>    If the user declines, note the finding's confidence level in the research doc and move on. The uncertainty becomes a documented risk in the recommendations.

**Dependencies**: Requires Change 1 (confidence assessment), Change 7 (experimentation guide), Change 4 (template section for results).

### Change 3: User-Triggered Experiments in Phase 5

**What**: Add a pathway in Phase 5 (Refine) for the user to request experiments during the discussion loop.

**Why**: Research Finding 6 identified that experimentation can recur during discussion — the user may say "prove it" or "test that assumption" during refinement.

**System doc impact**: `skills/cl-researcher/SKILL.md`, Phase 5 section.

**Current** (from `skills/cl-researcher/SKILL.md` Phase 5):
> Phase 5 covers: tell user where the doc is, add to RESEARCH_LEDGER, stay in conversation, update Status section, update to approved when satisfied.

**Proposed**:
> Add after "Stay in conversation to refine":
>
> 4. **User-triggered experiments** — If the user asks to validate a specific finding or recommendation ("prove it", "test that", "can you verify this works?"), treat it as an experiment request. Propose the experiment (hypothesis, plan, expected output) and follow `references/experimentation-guide.md` on approval. Update the research doc's Experimental Validation section with results.

**Dependencies**: Requires Change 7 (experimentation guide), Change 4 (template section).

### Change 4: Experimental Validation Section in Template

**What**: Add a new top-level section to the research doc template for capturing experiment results.

**Why**: Research Finding 4 established the two-layer archival model — results always retained in the research doc, code selectively retained on branches. The EXP-N format standardizes how experiments are recorded.

**System doc impact**: `skills/cl-researcher/references/research-template.md`, Template section.

**Current**: The template has sections: Status, System Context, Scope, Research Findings, Options Analysis, Recommendations, Decision Log, Emerged Concepts, Open Questions, References. No experimentation section.

**Proposed**:
> Add a new section after "Research Findings" in the template:
>
> ```markdown
> ## Experimental Validation
>
> Experiments run during this research to empirically validate findings. Each experiment
> is triggered by a low or medium confidence finding and approved by the user before
> execution. If no experiments were run, omit this section.
>
> ### EXP-1: [Hypothesis being tested]
>
> **Confidence trigger**: [Which finding had low/medium confidence and why]
> **Setup**: [What was built — brief description of the experiment code]
> **Execution**: [Commands run, environment details]
> **Result**: Confirmed | Refuted | Inconclusive
> **Evidence**:
> > [Key output, observations, metrics — concise but sufficient to evaluate]
>
> **Branch**: `experiment/<slug>-YYYY-MM-DD` — [Retained for future iteration | Pruned — one-off validation]
> **Impact on recommendation**: [How this result changed, confirmed, or refined the recommendation]
> ```

**Dependencies**: None — template addition is standalone.

### Change 5: Confidence Annotations in Findings Format

**What**: Add a `Confidence` field to the per-finding format in the research template's Phase 2.

**Why**: Research Finding 3 established confidence annotations as the trigger mechanism. The findings format needs a field to capture this.

**System doc impact**: `skills/cl-researcher/references/research-template.md`, Phase 2 section.

**Current** (Phase 2 findings format):
> Each finding has: Context, Analysis, Tradeoffs, Source.

**Proposed**:
> Add a fifth field to each finding:
>
> **Confidence**: High | Medium | Low — [Brief rationale. If medium/low, note what experiment would resolve the uncertainty.]

**Dependencies**: None.

### Change 6: Experiment Pathway in Template Phase 4

**What**: Add user-triggered experiment support to the Discussion and Refinement phase in the template.

**Why**: Research Finding 6 showed that experiments can be triggered during discussion, not just during initial research.

**System doc impact**: `skills/cl-researcher/references/research-template.md`, Phase 4 section.

**Current** (Phase 4):
> Covers decision log tracking, emerged concepts, and open question resolution.

**Proposed**:
> Add after the emerged concepts paragraph:
>
> If the user requests empirical validation of a finding during discussion ("prove it",
> "test that"), propose an experiment and follow `references/experimentation-guide.md`
> on approval. Add results to the Experimental Validation section. Update the finding's
> confidence level based on results.

**Dependencies**: Requires Change 4 (template section), Change 7 (experimentation guide).

### Change 7: Experimentation Guide Reference

**What**: Create a new reference file with detailed instructions for running experiments.

**Why**: The skill's progressive disclosure model means detailed instructions live in references, not in SKILL.md. The experimentation guide covers the full experiment lifecycle: proposal, execution via worktree agent, result capture, and branch retention decisions.

**System doc impact**: New file at `skills/cl-researcher/references/experimentation-guide.md`.

**Proposed content structure**:

```markdown
---
mode: experimentation
tier: guided
depends-on: [research-template]
state-files: []
---

# Experimentation Guide

## Purpose

This reference covers how to run experiments during research to empirically validate
findings. Experiments use isolated git worktrees via the experiment-runner agent,
ensuring no impact on the main working tree.

## Variables

| Variable | Source | Required | Description |
|----------|--------|----------|-------------|
| Hypothesis | Researcher's confidence assessment | Yes | What is being validated |
| Experiment plan | Researcher's proposal (approved by user) | Yes | What code to write, what to run |
| Research doc | docs/research/R-NNN-TOPIC.md | Yes | Where results are captured |

## Process

### Step 1: Confirm User Approval

Never run an experiment without explicit user approval. The researcher proposes;
the user decides. If the user declines, document the uncertainty as a risk and
move on.

### Step 2: Spawn the Experiment Agent

Use the Agent tool with the experiment-runner agent in worktree isolation:

    Agent(subagent_type="experiment-runner",
          isolation="worktree",
          description="Run experiment: [hypothesis]",
          prompt="HYPOTHESIS: [what we're testing]
                  PLAN: [what to build and run]
                  EXPECTED_OUTPUT: [what success/failure looks like]
                  CONSTRAINTS: [any constraints — e.g., no network, specific runtime]")

The agent will:
1. Set up the experiment environment in the worktree
2. Write the experiment code
3. Run the experiment via Bash
4. Capture output and observations
5. Return structured results

### Step 3: Capture Results

Add an EXP-N entry to the research doc's Experimental Validation section using the
format from the research template. Include:
- The hypothesis and confidence trigger
- A concise description of what was built
- The key evidence (output, metrics, observations)
- Whether the result confirmed, refuted, or was inconclusive
- Impact on the recommendation

### Step 4: Branch Retention Decision

After capturing results, decide whether to retain or prune the experiment branch:

**Retain** when:
- The experiment builds reusable infrastructure (test harness, benchmark suite)
- Future research cycles may need to extend or re-run the experiment
- The code itself is part of the evidence (complex setup worth preserving)

**Prune** when:
- The experiment was a one-off validation (quick script, API test)
- The results are fully captured in the research doc
- The code has no reuse value

To retain: The worktree branch persists automatically in git. Note the branch name
in the EXP-N entry.

To prune: Run `git branch -D <branch-name>` after capturing results. Note "Pruned"
in the EXP-N entry.

### Step 5: Update Finding Confidence

Update the original finding's confidence level based on the experiment result:
- Confirmed → confidence becomes High
- Refuted → update the finding, recommendation may change
- Inconclusive → confidence stays at current level, note what further validation
  would be needed

## Branch Naming Convention

Use descriptive branch names:

    experiment/<descriptive-slug>-YYYY-MM-DD

Examples:
- `experiment/api-rate-limit-validation-2026-03-10`
- `experiment/drizzle-pg-compat-2026-03-10`
- `experiment/ssr-hydration-benchmark-2026-03-10`

The naming convention makes branches self-documenting in `git branch` output.
Include enough context that someone seeing the branch name can guess what was tested.

## Guidelines

- **Keep experiments small and focused.** One hypothesis per experiment. If you need
  to test multiple things, propose multiple experiments.
- **Capture evidence, not just conclusions.** Include enough output in the EXP-N entry
  that the reviewer can evaluate the evidence independently.
- **Don't over-experiment.** High-confidence findings don't need validation. Reserve
  experiments for genuine uncertainty.
- **The user controls execution.** Always propose before running. If the user says
  "just analyze, don't experiment," respect that for the rest of the research cycle.
```

**Dependencies**: Requires Change 8 (experiment-runner agent) for the agent reference to resolve.

### Change 8: Experiment Runner Agent

**What**: Create a new agent definition for executing experiments in worktree isolation.

**Why**: Research Decision #5 chose a dedicated agent over a researcher mode. The agent gets its own context window and worktree isolation natively via the Agent tool.

**System doc impact**: New file at `agents/experiment-runner.md`.

**Proposed content**:

```markdown
---
name: experiment-runner
description: Executes research experiments in isolated git worktrees. Receives a
  hypothesis, plan, and constraints. Writes experiment code, runs it, and returns
  structured results. Keywords - experiment, validation, worktree, research, test.
model: sonnet
---

# Experiment Runner Agent

## Purpose

You execute experiments to empirically validate research findings. You run in an
isolated git worktree — your changes never affect the main working tree. Your job
is to set up, run, and report on an experiment as defined by the researcher.

## Variables

- **HYPOTHESIS**: What is being tested
- **PLAN**: What code to write and what commands to run
- **EXPECTED_OUTPUT**: What success/failure looks like
- **CONSTRAINTS**: Any constraints (no network access, specific runtime, etc.)

## Workflow

1. **Understand the experiment** — Read HYPOTHESIS, PLAN, and CONSTRAINTS carefully.
   If the plan is ambiguous, make reasonable assumptions and document them.

2. **Set up the environment** — Install dependencies if needed (`npm install`,
   `pip install`, etc.). The worktree is a full copy of the repo, so project
   dependencies are available.

3. **Write the experiment code** — Create files as specified in PLAN. Keep the
   code minimal and focused on testing the hypothesis. Place experiment files in
   an `experiment/` directory at the worktree root.

4. **Run the experiment** — Execute the code via Bash. Capture stdout, stderr, and
   any relevant metrics. If the experiment fails to run (syntax error, missing dep),
   fix and retry once. If it still fails, report the failure as the result.

5. **Analyze results** — Compare actual output against EXPECTED_OUTPUT. Determine
   whether the hypothesis is confirmed, refuted, or inconclusive.

6. **Report** — Return structured results to the researcher.

## Report

Follow the Structured Agent Result Protocol:

RESULT: {CONFIRMED|REFUTED|INCONCLUSIVE|FAILED} | Type: experiment | Hypothesis: {HYPOTHESIS} | Evidence: {key observation}

---
**Protocol**: v1
**Agent**: experiment-runner
**Assigned**: Validate {HYPOTHESIS}
**Scope**: Worktree-isolated experiment
**Confidence**: high / medium / low (in the result, not the hypothesis)
---

## Evidence

### Setup
[What was built — files created, dependencies installed]

### Execution
[Commands run, environment details]

### Output
[Actual output — stdout/stderr, key observations, metrics]

### Analysis
[How the output compares to EXPECTED_OUTPUT]

### Conclusion
[CONFIRMED | REFUTED | INCONCLUSIVE — with reasoning]

## Guidelines

- **Stay focused.** Test only the stated hypothesis. Don't expand scope.
- **Be thorough in evidence.** Include enough output that the researcher can
  independently verify the conclusion.
- **Clean up after yourself.** Don't leave processes running. If you installed
  a server, stop it before reporting.
- **Document assumptions.** If the plan was ambiguous, note what you assumed
  and why.
- **Fail gracefully.** If the experiment can't run (missing tool, permission
  error), report FAILED with the specific blocker rather than guessing.
```

**Dependencies**: None — standalone agent definition.

## Cross-Cutting Concerns

### Terminology

| Term | Definition | Where Used |
|------|-----------|-----------|
| Confidence annotation | An assessment (High/Medium/Low) of how certain a research finding is, based on source quality and verifiability | Researcher SKILL.md Phase 3, research template findings format |
| Experiment proposal | A structured pitch (hypothesis, plan, expected output) presented to the user for approval before running an experiment | Researcher SKILL.md Phases 3 and 5 |
| EXP-N | Sequential experiment identifier within a research doc (EXP-1, EXP-2, etc.) | Research template Experimental Validation section |
| Experiment branch | A git branch created by the worktree agent, named `experiment/<slug>-YYYY-MM-DD` | Experimentation guide, experiment-runner agent |

### Migration

No migration needed. This proposal adds new capability without changing existing behavior. Research docs created before this change will simply not have an Experimental Validation section — that's fine.

### Integration Points

- **Researcher ↔ experiment-runner agent**: The researcher spawns the agent via the Agent tool with `isolation: "worktree"`. The agent returns results via the Structured Agent Result Protocol.
- **Researcher ↔ research template**: The template defines the EXP-N format. The researcher fills it in after the agent returns.
- **Experimentation guide ↔ SKILL.md**: SKILL.md references the guide via "read `references/experimentation-guide.md` and follow its process." The guide is loaded on-demand (progressive disclosure pattern).

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|----------|------------------------|-----------|
| Dedicated agent (not a researcher mode) | Mode within researcher, inline execution | Agent gets own context window + worktree isolation natively; clean separation of concerns (R-014 Decision #5) |
| Always propose experiments to user | Auto for small / propose for large, fully autonomous | Aligns with core principle "AI does the work, humans make the calls" (R-014 Decision #6) |
| Descriptive branch naming (`experiment/<slug>-date`) | Research-scoped (`worktree-R-NNN-exp-N`) | More readable in `git branch` output, self-documenting (R-014 Decision #7) |
| Sub-phase of Phase 3 (not new top-level phase) | New Phase 3.5, separate skill | Minimal disruption; experiments are optional and contextual (R-014 Finding 6) |
| Two-layer archival (results always, code selectively) | Keep everything, prune everything | Balances retention with branch hygiene (R-014 Finding 4) |
| No init.js changes | Add experiment directory scaffolding | Experiments live on branches and in research docs — no project-level directory needed |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Branch proliferation from retained experiments | Medium | Low | Naming convention enables discovery; pruning guidance in experimentation guide |
| LLM over-proposes experiments | Low | Medium | All experiments require user approval; user can say "just analyze, don't experiment" |
| Experiment results too verbose for research doc | Low | Medium | EXP-N format enforces concise evidence summaries |
| Worktree operations slow on large repos | Low | Low | Worktree overhead is one-time; experiments are typically small scripts |
| Confidence assessment unreliable | Medium | Low | User approval gate means bad assessments just produce unnecessary proposals, not wasted execution |
| Stale experiment branches diverge from main | Medium | Low | Experiments are evidence, not production code; staleness is acceptable |

## Open Items

None — all open questions were resolved during R-014 discussion rounds.

## Appendix: Research Summary

R-014 investigated adding empirical validation capability to the cl-researcher skill. The core finding was that Claude Code's native `isolation: "worktree"` feature on the Agent tool provides a ready-made sandbox — no custom infrastructure needed. Git branches become the natural unit for experiment retention and pruning.

The research evaluated four isolation mechanisms (worktree subagent, in-project sandbox directory, temp directory, conversation forking) and recommended worktree subagents. Confidence-driven triggering was chosen over mandatory or ad-hoc experimentation, with all experiments requiring user approval. A two-layer archival model retains results in the research doc (always) and code on branches (selectively).

Key decisions: dedicated agent over researcher mode, always-propose-first over auto-execution, descriptive branch names over research-scoped names. The primary risk is branch proliferation, mitigated by the naming convention and cleanup guidance.

For full details, see `docs/research/R-014-RESEARCHER_EXPERIMENTATION_CAPABILITY.md`.
