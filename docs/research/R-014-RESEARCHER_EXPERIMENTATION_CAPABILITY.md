# Research: Researcher Experimentation Capability

**ID**: R-014
**Created**: 2026-03-10
**Status**: Draft
**Author**: User + AI researcher

## Status

- **Research Type**: Hybrid
- **Status**: draft
- **Open Questions**: 3 remaining
- **Discussion Rounds**: 1
- **Complexity**: L2-complex

## System Context

### Research Type: Hybrid

New capability (experimentation/sandboxed code execution) added to an existing skill (cl-researcher), requiring changes to the research workflow, potential new agent infrastructure, and filesystem scaffolding.

### Related System Docs

Since this is a self-hosted plugin repo, "system docs" are the skill/hook/agent files themselves.

| System Doc | Relevant Sections | Relationship |
|------------|-------------------|-------------|
| `skills/cl-researcher/SKILL.md` | Mode detection, Phase 3 (Conduct Research) | Adding experimentation as a research sub-phase |
| `skills/cl-researcher/references/research-template.md` | Phase 2 (Research and Analysis) | Template needs experimentation findings section |
| `agents/` | Agent definitions | May need a new experiment-runner agent |
| `scripts/init.js` | Directory scaffolding | Needs experiment workspace directory |
| `hooks/protect-system-docs.js` | Protection model | Experiment directories need correct protection policy |

### Current State

The cl-researcher skill is currently a **pure analysis and discovery tool**. It:
1. Reads system docs and manifests
2. Gathers requirements through conversation
3. Conducts research via code reading, doc analysis, and web search
4. Synthesizes findings and recommends approaches
5. Refines through user discussion

It **cannot**:
- Write experimental code to validate findings
- Run scripts to test API behavior, library compatibility, or performance
- Build proof-of-concept implementations to verify feasibility
- Iteratively build on experimental infrastructure across research cycles

The word "experiment" appears zero times in the researcher skill. Validation happens downstream in cl-implementer, creating a gap: recommendations are based on analysis alone, not empirical evidence.

### Why This Research

The researcher makes recommendations based on reading and reasoning, but some questions can only be answered by trying things:
- "Does this API actually behave as documented?"
- "Can these two libraries coexist?"
- "Is this approach feasible within our constraints?"
- "What does the actual output/performance look like?"

Without experimentation, the researcher must hedge recommendations with uncertainty. Adding empirical validation would increase recommendation confidence and reduce surprises during implementation.

## Scope

### In Scope
- How should experimental code be isolated from the project workspace?
- What triggers experimentation (confidence-based sniffing vs. explicit)?
- How should experimental infrastructure be retained and iterated upon?
- What gets archived vs. pruned after experiments?
- How does this integrate with the existing 5-phase research workflow?

### Out of Scope
- Full implementation specification (that's for the proposal/spec phases)
- Changes to cl-implementer or cl-reviewer skills
- Container-level or VM-level sandboxing (too heavy for a Claude Code plugin)
- CI/CD integration for experiments

### Constraints
- Must work within Claude Code's native capabilities (Agent tool, Bash, worktrees)
- Must not pollute the project's source tree or git history
- Must preserve learnings even when pruning experimental code
- Plugin has no build step, no dependencies -- experiments may need their own deps
- Self-hosted repo: changes go through the pipeline

## Research Findings

### Finding 1: Claude Code Native Isolation Mechanisms

**Context**: What does Claude Code already provide for isolated code execution?

**Analysis**: Three native isolation strategies exist:

1. **Agent tool with `isolation: "worktree"`**: Creates a temporary git worktree at `.claude/worktrees/<name>/` on a branch named `worktree-<name>`. The agent gets its own context window and an isolated copy of the repo. If no changes are made, the worktree auto-cleans. If changes exist, the worktree path and branch are returned in the result. The parent can inspect and selectively merge.

2. **Subagent context isolation**: Every Agent tool invocation gets a fresh context window. The subagent can read, write, edit files, and run bash commands. Results return to the parent as a summary message. Subagents cannot spawn other subagents (no nesting).

3. **SubagentStop hook**: Fires when a subagent finishes. Receives `agent_id`, `agent_type`, `agent_transcript_path`, and `last_assistant_message`. This is the extraction point -- a hook could capture experiment results before the worktree is cleaned up.

**Tradeoffs**:
- Worktrees provide true filesystem isolation but are git-coupled (the project must be a git repo, and the worktree branches share the remote)
- Subagent context isolation means the experiment runs blind to the main conversation's full context (only gets the prompt)
- No native "selective merge" -- you get the whole branch or nothing

**Source**: Claude Code documentation (sub-agents, hooks, common-workflows)

### Finding 2: Worktree-Based Experimentation Model

**Context**: How would worktrees serve as experiment sandboxes?

**Analysis**: A worktree-based model would work as follows:

```
Researcher identifies low-confidence claim
  → Spawns experiment agent with isolation: "worktree"
  → Agent writes experiment code in the worktree
  → Agent runs the code via Bash
  → Agent captures results (stdout, behavior observations, metrics)
  → Agent returns structured findings to researcher
  → Worktree is either:
     a) Cleaned up (code pruned, only results retained in research doc)
     b) Kept on branch for future iteration
```

The worktree model maps well to the user's requirements:
- **Retain infrastructure**: Keep the worktree branch when experiments build iteratively
- **Prune branches**: Clean up worktrees for one-off validations
- **Isolation**: Experiments never touch the main working tree

**Key insight**: The worktree branch persists in git even after the worktree directory is removed. This means `git branch -D worktree-experiment-name` is the explicit prune, while the branch existing is the retention mechanism.

**Tradeoffs**:
- Pro: True filesystem isolation, git-native, branch-based history
- Pro: Can install dependencies without polluting the main project
- Pro: Claude Code already supports this natively
- Con: Worktree creation has overhead (copies working tree)
- Con: Large repos may slow down worktree operations
- Con: No native selective merge -- need a process for extracting learnings

**Source**: Claude Code documentation, git worktree semantics

### Finding 3: Confidence-Driven Experiment Triggering

**Context**: When should the researcher experiment vs. just analyze?

**Analysis**: The user specified that experimentation should emerge organically based on confidence levels. This maps to a **confidence annotation model**:

During Phase 3 (Conduct Research), each finding or recommendation gets an implicit confidence level:
- **High confidence**: Well-documented behavior, consistent with system docs, multiple corroborating sources → no experiment needed
- **Medium confidence**: Docs say X but there are version caveats, edge cases unclear, or conflicting information → experiment recommended
- **Low confidence**: Undocumented behavior, novel integration, performance claim without benchmarks → experiment strongly recommended

The researcher would "sniff" for low-confidence claims and either:
1. **Auto-experiment** for small validations (< 1 file, quick script, no deps)
2. **Propose experiment** for larger spikes (multi-file, needs dependencies, significant setup)

This aligns with the existing pattern: the researcher already takes a position on recommendations. Now it also takes a position on *how confident it is* and what would increase that confidence.

**Tradeoffs**:
- Pro: Organic -- doesn't force experimentation on every research cycle
- Pro: User sees the confidence reasoning and can override ("just analyze, don't experiment")
- Pro: Small validations are autonomous (fast feedback loop)
- Con: Confidence assessment is subjective -- the LLM may over- or under-estimate
- Con: Needs clear criteria for what counts as "small" vs. "large" experiment

**Source**: User requirements, analogy to scientific research methodology

### Finding 4: Experiment Result Archival Strategy

**Context**: What should be retained from experiments?

**Analysis**: The user's key insight: **retain experimental infrastructure, prune code branches selectively**. This suggests a two-layer archival model:

**Layer 1 -- Results (always retained)**:
- Experiment hypothesis (what was being validated)
- Execution output (stdout/stderr, key observations)
- Conclusion (confirmed/refuted/inconclusive, with evidence)
- These live in the research document itself, in a new "Experimental Validation" section

**Layer 2 -- Code (selectively retained)**:
- Worktree branch kept when the experiment builds reusable infrastructure
- Worktree branch pruned when it was a one-off validation
- Decision to keep/prune is part of the experiment conclusion

This maps to a research doc enhancement:

```markdown
## Experimental Validation

### EXP-1: [Hypothesis]

**Confidence trigger**: [What finding had low/medium confidence]
**Setup**: [What was built -- brief description]
**Execution**: [What was run, how]
**Result**: [Confirmed | Refuted | Inconclusive]
**Evidence**: [Key output, observations]
**Infrastructure**: [Retained on branch `worktree-R-014-exp-1` | Pruned]
**Impact on recommendation**: [How this changed or confirmed the recommendation]
```

**Tradeoffs**:
- Pro: Results always survive, even when code is pruned
- Pro: Retained branches are discoverable via naming convention
- Pro: The research doc becomes a complete record of both analysis AND empirical evidence
- Con: Branch proliferation if many experiments are retained
- Con: Retained branches may go stale as the main branch evolves

**Source**: User requirements, scientific lab notebook conventions

### Finding 5: Conversation Forking as Alternative Strategy

**Context**: Could conversation forking serve experimentation needs?

**Analysis**: Claude Code supports session forking (`--fork-session`), which creates a new session from a checkpoint. This could model experimentation as "fork the conversation, try something, report back."

However, this has significant limitations for the researcher use case:
- Forked sessions are **completely independent** -- results don't automatically flow back
- No programmatic way to extract findings from a forked session
- The researcher would need to manually summarize and re-enter findings
- Session forking is a CLI feature, not available programmatically from within a skill

**Conclusion**: Conversation forking is not suitable for automated experimentation. Worktree-based subagents are the better fit because results flow back programmatically via the Agent tool's return value.

**Source**: Claude Code documentation on session forking

### Finding 6: Integration with Research Workflow

**Context**: Where does experimentation fit in the existing 5-phase research workflow?

**Analysis**: Experimentation fits as a **sub-phase within Phase 3 (Conduct Research)** and can recur during **Phase 4 (Discussion and Refinement)**:

```
Phase 1: Learn the System
Phase 2: Gather Requirements
Phase 3: Conduct Research
  ├── 3a: Analysis (existing -- read, reason, web search)
  ├── 3b: Confidence Assessment (NEW -- annotate findings)
  └── 3c: Experimental Validation (NEW -- run experiments for low-confidence findings)
Phase 4: Discussion and Refinement
  └── 4x: User-triggered experiments (NEW -- user says "prove it")
Phase 5: Approve and Track
```

This is minimally invasive -- it extends Phase 3 rather than adding a new top-level phase. The existing template gains one new section (Experimental Validation) and findings gain confidence annotations.

**Tradeoffs**:
- Pro: Minimal disruption to existing workflow
- Pro: Experiments are optional -- triggered by confidence, not required
- Pro: Phase 4 user-triggered experiments allow the user to request validation
- Con: Phase 3 becomes more complex -- needs clear sub-phase gating
- Con: Experiment duration could significantly extend research cycles

**Source**: Analysis of existing research-template.md workflow

## Options Analysis

| Criterion | Option A: Worktree Subagent | Option B: In-Project Sandbox Dir | Option C: Temp Directory |
|-----------|---------------------------|----------------------------------|------------------------|
| Isolation | Full (separate working tree) | Partial (gitignored dir in project) | Full (outside project) |
| Retention | Git branches persist | Files persist in project | Lost on cleanup |
| Iterability | Excellent (branch-based) | Good (directory-based) | Poor (no persistence) |
| Claude Code support | Native (`isolation: "worktree"`) | Manual (mkdir + gitignore) | Manual (Bash only) |
| Dependency isolation | Yes (separate node_modules etc.) | No (shares project deps) | Yes (fully separate) |
| Git history impact | Branches exist but are separate | Gitignored, no history | None |
| Selective pruning | `git branch -D` | `rm -rf` | Automatic |
| Complexity | Low (built-in) | Low (simple directory) | Medium (path management) |
| Result extraction | Agent return value | Read files directly | Must capture before cleanup |

## Recommendations

### Primary Recommendation

**Use worktree-based subagents (Option A) as the primary experimentation mechanism**, with confidence-driven triggering and a two-layer archival model.

The rationale:
1. **Native support**: Claude Code's Agent tool already has `isolation: "worktree"` -- no custom infrastructure needed for the sandbox itself
2. **Branch-based retention**: Git branches are the natural unit for "keep this experiment" vs. "prune this experiment" -- matching the user's mental model exactly
3. **Iterability**: Retained experiment branches can be checked out and extended in future research cycles
4. **Clean separation**: Experiments never appear in the main working tree, avoiding the pollution concern
5. **Result flow**: The Agent tool returns results to the parent conversation, enabling structured result capture without manual extraction

The implementation would require:
- A new **experiment-runner agent** (or extend the existing researcher to spawn worktree subagents)
- A new **Experimental Validation section** in the research template
- **Confidence annotations** on research findings
- **Naming convention** for experiment branches: `worktree-R-NNN-exp-N`
- Updates to **init.js** to handle experiment-related scaffolding (if any project-level directories are needed)

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Branch proliferation from retained experiments | Medium | Low | Naming convention + periodic cleanup guidance in skill |
| LLM over-experiments (triggers experiments unnecessarily) | Medium | Medium | Size threshold: auto-experiment only for small validations; propose larger ones to user |
| Experiment results are too verbose for research doc | Low | Medium | Structured EXP-N format with concise evidence summaries |
| Worktree operations slow on large repos | Low | Low | Experiments are typically small scripts; worktree overhead is one-time |
| Stale experiment branches diverge from main | Medium | Low | Document branch staleness; experiments are evidence, not production code |
| Confidence assessment is unreliable | Medium | Medium | User can override; "prove it" trigger in Phase 4 as fallback |

### Impact on System Docs

| System Doc | Expected Changes |
|------------|-----------------|
| `skills/cl-researcher/SKILL.md` | Add experimentation mode detection, confidence annotation guidelines |
| `skills/cl-researcher/references/research-template.md` | Add Experimental Validation section, confidence annotations on findings |
| (new) `skills/cl-researcher/references/experimentation-guide.md` | Detailed guide for running experiments: when to trigger, how to use worktree agent, result capture format, retain vs. prune decision |
| (new or existing) `agents/experiment-runner.md` | Agent definition for worktree-isolated experiment execution |
| `scripts/init.js` | Potentially add experiment tracking file or directory to scaffolding |

## Decision Log

| # | Topic | Considered | Decision | Rationale |
|---|-------|-----------|----------|-----------|
| 1 | Isolation mechanism | Worktree subagent, in-project sandbox dir, temp directory, conversation forking | Recommend worktree subagent | Native Claude Code support, branch-based retention matches user's keep/prune model, best isolation |
| 2 | Experiment triggering | Always experiment, never experiment, confidence-based | Recommend confidence-based with size threshold | User specified organic emergence; small = auto, large = propose |
| 3 | Archival model | Throw away everything, keep everything, two-layer | Recommend two-layer (results always, code selectively) | User wants to retain infrastructure iteratively but prune some branches |
| 4 | Workflow integration | New top-level phase, sub-phase of Phase 3, separate skill | Recommend sub-phase of Phase 3 + Phase 4 extension | Minimal disruption, experiments are optional and triggered by context |

## Emerged Concepts

| Concept | Why It Matters | Suggested Action |
|---------|---------------|-----------------|
| Experiment branches as "evidence trail" | Retained experiment branches could be referenced in proposals as empirical evidence, strengthening the reviewer's confidence | Consider in proposal template enhancement |
| Cross-research experiment reuse | If R-014 builds experiment infrastructure that R-015 could reuse, the branch naming convention enables discovery | Document in experimentation guide |
| Confidence annotations beyond experimentation | Finding confidence levels could be useful for the reviewer too -- low-confidence findings without experiments should be flagged | Park for future research |

## Open Questions

1. **Should the experiment-runner be a new agent or a mode within the researcher skill?** A new agent gets its own context window (good for isolation) but adds a new file to maintain. A mode within the researcher keeps things consolidated but doesn't get worktree isolation natively (skills don't have isolation; agents do).

2. **What's the size threshold for auto-experiment vs. propose-to-user?** Candidates: line count (< 50 lines = auto), file count (single file = auto), dependency requirement (no new deps = auto). Need user input on comfort level with autonomous experimentation.

3. **Should experiment branches follow a project-wide naming convention or be research-doc-scoped?** E.g., `worktree-R-014-exp-1` (scoped) vs. `experiment/api-validation-2026-03-10` (descriptive). Scoped is more traceable; descriptive is more readable.

## References

- Claude Code documentation: Sub-agents and isolation (https://code.claude.com/docs/en/sub-agents.md)
- Claude Code documentation: Git worktrees (https://code.claude.com/docs/en/common-workflows.md)
- Claude Code documentation: Hooks (https://code.claude.com/docs/en/hooks.md)
- Git worktree documentation (https://git-scm.com/docs/git-worktree)
