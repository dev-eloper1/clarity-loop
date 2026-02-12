# Clarity Loop

![Clarity Loop — A human-in-the-loop process for getting from vibes to working code](docs/clarity_loop.png)

**Stop generating code from vibes.** Clarity Loop is a [Claude Code](https://claude.ai/code) plugin that takes you from a vague idea to working code through structured research, reviewed documentation, visual design, and tracked implementation — with a human making every decision.

---

## The Problem

AI coding tools are great at writing code. They're terrible at knowing *what* to write. The bigger the project, the worse this gets:

- **Your documents drift apart.** The PRD says one thing, the Architecture doc says another, the code matches neither. Each file was fine when written — nobody checked them as a system.
- **Decisions evaporate.** You spent 20 minutes discussing auth strategy on day 1. By day 3, context compression ate it. By day 5, the LLM makes a contradictory decision with no memory of the first one.
- **Good ideas get lost.** "We should add rate limiting" surfaces during implementation. Nobody writes it down. Three weeks later you remember the idea but not the reasoning.
- **Library knowledge goes stale.** Tailwind v3 patterns when you're on v4. Imports from an API that was removed two versions ago. The LLM's training data doesn't match your `package.json`.
- **Nothing gets verified.** Specs reference docs that changed last week. Implementation uses patterns the architecture explicitly rejected. Nobody catches it until something breaks.

The root cause isn't code generation — it's everything that happens *before* code generation. Vague docs, drifting specs, lost decisions, stale knowledge, zero verification. The inputs are broken, so the outputs can't be correct.

**Clarity Loop fixes the inputs so the outputs are correct.**

---

## What It Does

Clarity Loop manages five stages between "I have an idea" and "I have working code":

**1. Research and document.** You describe what you want to build. The plugin researches the problem, drafts system documentation (PRD, Architecture, TDD), and iterates with you through multi-round conversations. Every document is reviewed, cross-referenced against all other documents, and verified before moving forward.

**2. Build accurate library knowledge.** Before generating any code, the plugin researches the *actual current state* of every library in your tech stack — correct imports, breaking changes, working patterns, common gotchas. This knowledge is distilled into curated context files that get loaded during implementation. No more debugging stale API calls.

**3. Design the UI.** If your project has a user interface, the plugin runs a design discovery conversation, generates a design token system and reusable component library, then creates screen mockups. With [Pencil MCP](https://www.pencil.dev/), you get live visual artifacts. Without it, you get equivalent structured specs.

**4. Generate implementation specs.** Once all documentation is stable and verified, the plugin generates structured, implementation-ready specs — concrete types, enumerated edge cases, acceptance criteria. These are the bridge between "what to build" and "how to build it."

**5. Implement with tracking.** This is the payoff. Because your docs are precise, your specs are concrete, and your library knowledge is current — the cl-implementer runs on near-autopilot. It generates a task queue from specs, processes tasks front-to-back, verifies each against acceptance criteria, handles runtime bugs, triages emergent issues on the fly, and picks up exactly where it left off across sessions. You steer and approve; it does the rest.

Stages 1-4 are the investment. Stage 5 is where it pays off — implementation that *just works* because the inputs were right.

At every stage, the pattern is the same: **AI generates, human reviews, feedback refines, human approves.** Nothing advances without your judgment. And when implementation reveals that something upstream was wrong — a spec gap, a stale library pattern, an incomplete design — the pipeline loops back to fix the source, not paper over the symptom.

Cutting across all stages, a **system-wide decision journal** (DECISIONS.md) captures every technology choice, architecture decision, conflict resolution, and "do not proceed" conclusion — with full rationale. Every skill reads it at session start, so decisions made on day 1 still constrain work on day 30.

---

## What It Looks Like

```bash
# Start a new project
/cl-researcher bootstrap
# -> Auto-scaffolds docs directory structure
# -> Discovery conversation about your project
# -> Initial system docs generated (PRD, Architecture, TDD)
# -> "Your Architecture doc references 4 libraries. Create context files? [Y/n]"

# Research a feature
/cl-researcher research "user authentication"
# -> Multi-turn conversation grounded in your existing docs
# -> Research doc generated with findings and recommendations

# Generate a proposal
/cl-researcher proposal
# -> Concrete change manifest: what changes, where, why
# -> "Proposal generated. Read it over and let me know when you'd like to review."

# Review and merge
/cl-reviewer review
# -> Six-dimension review against all system docs
# -> Fix cycle until approved, then merge to protected system docs

# Generate specs and implement
/cl-implementer spec
/cl-implementer start
/cl-implementer run
# -> Task queue with acceptance criteria, context-aware implementation,
#    fix tasks for regressions, spec gap feedback to the pipeline
```

---

## Why Not Just Prompt and Ship?

For small projects, you should. Clarity Loop is for when "describe it and ship it" starts breaking:

- **5+ interconnected documents** that drift from each other without structured review
- **Complex tech stacks** where the LLM's training data doesn't match your library versions
- **Multi-day projects** where context compression loses decisions you made yesterday
- **Systems where correctness matters** — your auth flow can't just "look right," it has to *be* right

The tradeoff is deliberate: more process upfront, significantly more consistent output at the end. The pipeline catches cross-document contradictions, stale library patterns, incomplete specs, and implementation regressions — problems that compound silently in single-pass generation.

---

## Installation

```bash
# Marketplace
/plugin marketplace add dev-eloper1/clarity-loop
/plugin install clarity-loop@clarity-loop

# Or from source
git clone https://github.com/dev-eloper1/clarity-loop.git
claude --plugin-dir ./clarity-loop
```

Then start your project — bootstrap handles everything:

```bash
/cl-researcher bootstrap
```

This auto-scaffolds the directory structure, runs a discovery conversation about your project, and generates initial system docs. If collisions are detected with existing directories, you'll be prompted to choose an alternative docs root.

### Updating

```bash
# Marketplace
/plugin update clarity-loop

# Source
cd path/to/clarity-loop && git pull origin main
```

Updates never touch your project's docs — only the plugin's skills, hooks, and scripts.

---

## The Four Skills

| Skill | Command | What It Does |
|-------|---------|-------------|
| **cl-researcher** | `/cl-researcher` | Bootstraps initial docs, triages complexity, runs multi-turn research conversations, plans document structure, generates proposals, creates per-library context files |
| **cl-reviewer** | `/cl-reviewer` | Reviews proposals against all system docs, manages fix cycles, merges to protected system docs, verifies merges, runs system-wide audits, checks code-doc alignment, reviews designs |
| **cl-designer** | `/cl-designer` | Runs design discovery conversations, generates design tokens and component libraries, creates screen mockups with visual feedback loops, produces implementation task breakdowns |
| **cl-implementer** | `/cl-implementer` | Generates specs from verified docs, runs cross-spec consistency checks, generates unified task queues from specs, tracks implementation progress, handles runtime failures and regressions, reconciles external changes, feeds spec gaps back into the pipeline |

---

## How the Pipeline Works

It's called Clarity **Loop** because problems flow backward, not just forward:

- **Every stage loops internally.** Generate → review → feedback → refine → approve. Nothing advances until you're satisfied.
- **Implementation loops back to the source.** Spec gaps route to research. Context gaps route to library knowledge. Design gaps route to the cl-designer. Fixes happen where the mistake originated, not in the code.
- **Audits catch cumulative drift.** Each proposal is fine alone — but 10 proposals can silently move the system off course. Periodic audits check the full doc set and feed findings back into research.

### What else it handles

| You worry about... | The pipeline handles it |
|---|---|
| **Ideas at the wrong time** | Every concept captured automatically in a parking lot. Scope it later, defer to V2, or discard. No FOMO. |
| **Coming back after a break** | All state lives in markdown. On resume, the cl-implementer diffs what changed, re-verifies affected tasks, picks up where it left off. |
| **Editing code outside the pipeline** | External changes detected via git, mapped to tasks, manually-completed work marked as done. |
| **Design issues found during build** | Design gaps route directly to `/cl-designer` — missing component states, layout issues, new components. No research cycle needed for visual fixes. |
| **Fixes breaking other things** | Fix tasks trigger automatic re-verification of all downstream completed tasks. |
| **Docs drifting from code** | Code-doc sync extracts claims from docs and checks them against the actual codebase. |
| **Full ceremony for trivial changes** | Triage routes typos to direct fixes. Correction mode handles audit findings without research cycles. |
| **Decisions evaporating** | Every decision is logged to a system-wide journal (DECISIONS.md) with rationale. Every skill reads it at session start. Prior decisions constrain future work — no contradicting what was already settled. |
| **Half-stale specs** | Waterfall gate blocks spec generation until all system docs are verified. |
| **Governance drift** | Post-implementation verification checks 10 governance dimensions — config completeness, observability, architecture alignment, DECISIONS.md reconciliation, and more. |
| **L1 assumption accumulation** | Periodic scans detect when the same spec gap category keeps generating assumptions — a signal that system docs need a research cycle, not more workarounds. |
| **Operational specs missing** | Spec generation produces CONFIG_SPEC, migration notes, observability requirements, backend policies, data modeling specs, and code conventions alongside implementation specs. |

---

## Design Principles

> **AI does the work. Humans make the calls. Files hold the truth.**

1. **React, don't originate.** The human never faces a blank page. The AI generates first — a draft, a mockup, a task queue — and the human reacts.

2. **Judgment is the bottleneck, not effort.** The pipeline minimizes human effort but maximizes human judgment. Every gate is an approval.

3. **The system remembers.** Decisions are recorded with rationale in persistent files. Conversations are ephemeral; artifacts are permanent.

4. **Structured iteration beats one-shot generation.** Everything loops: generate, present, feedback, refine. The antidote to AI slop.

5. **Process protects the product — proportionally.** Triage determines depth. Trivial changes skip gates; complex changes get the full pipeline.

6. **Tools enhance, never gate.** The pipeline works with zero external tools. Pencil MCP and library context add richness, but the core is always available.

---

## Prior Art

Clarity Loop was designed after studying [BMAD](https://docs.bmad-method.org/) (enterprise-grade AI SDLC with 21 agent personas) and [GSD](https://github.com/glittercowboy/get-shit-done) (anti-bureaucracy spec-driven framework). It borrows BMAD's complexity routing and GSD's human discussion phase, but adds what neither has:

- Multi-round human discussion loops with persistent state across sessions
- Cross-document consistency verification (docs reviewed as a system, not individually)
- Visual design generation from written requirements
- Per-library context files with progressive disclosure for accurate implementation
- Audit and drift detection with trend analysis
- System-wide decision journal that prevents re-discussion of settled questions
- Implementation tracking with reconciliation, fix tasks, and spec gap feedback

For the full analysis: [Design Decisions](docs/research/DOC_PIPELINE_PLUGIN.md)

---

## Documentation

| Document | Covers |
|----------|--------|
| **[System Design](docs/SYSTEM_DESIGN.md)** | **Full architecture reference — pipeline flow, state management, protection model, spec generation, implementation tracking, verification, all feedback loops** |
| [cl-researcher](docs/cl-researcher.md) | Bootstrap, triage, research, structure, proposal, context modes |
| [cl-reviewer](docs/cl-reviewer.md) | Review, re-review, fix, merge, verify, audit, correct, sync, design-review modes |
| [cl-designer](docs/cl-designer.md) | Setup, tokens, mockups, build-plan modes, Pencil MCP integration |
| [cl-implementer](docs/cl-implementer.md) | Spec generation, waterfall gate, cross-spec consistency review, start, run, autopilot, verify, status, sync modes, task queue, fix tasks, reconciliation |
| [Pipeline Concepts](docs/pipeline-concepts.md) | System doc protection, manifest, tracking files, context files, configuration |
| [Hooks](docs/hooks.md) | PreToolUse protection, PostToolUse manifest generation |

### Pencil MCP (Optional)

The cl-designer works with or without [Pencil](https://www.pencil.dev/) — a design-as-code tool with an MCP server. With Pencil, you get live visual design on an infinite canvas. Without it, you get equivalent structured markdown specs. See [Pencil setup](docs/cl-designer.md#pencil-setup) for installation.

---

## Project Structure

```
clarity-loop/
  .claude-plugin/
    plugin.json                     Plugin manifest
    marketplace.json                Marketplace catalog
  skills/
    cl-researcher/                  Research, proposals, library context
      SKILL.md
      references/
        bootstrap-guide.md          Greenfield/brownfield paths, profile system, defaults sheet
        operational-bootstrap.md    Security, config, observability, data lifecycle decisions
        research-template.md        Research doc template (R-NNN format)
        proposal-template.md        Proposal template with Change Manifest
        document-plan-template.md   Structure planning template
        context-mode.md             Three-layer context, staleness model, loading protocol
    cl-reviewer/                    Review, merge, verify, audit
      SKILL.md
      references/
        review-mode.md              6-dimension review, cross-proposal conflict detection
        re-review-mode.md           Cumulative issue ledger, regression detection
        fix-mode.md                 Walk through blocking issues, apply edits
        merge-mode.md               Authorization marker lifecycle, Change Manifest execution
        verify-mode.md              4-part post-merge verification, design nudge
        audit-mode.md               8-dimension analysis, drift analysis, web search verification
        correction-mode.md          Corrections manifest, spot-check, lightweight bypass
        sync-mode.md                Claim extraction, code verification, DECISIONS.md reconciliation
        design-review-mode.md       3-dimension design validation, Pencil MCP integration
    cl-implementer/                 Spec generation, task queue, implementation tracking
      SKILL.md
      references/
        spec-mode.md                Waterfall gate, format selection, parallel generation
        spec-consistency-check.md   6-dimension cross-spec consistency check
        cross-cutting-specs.md      SECURITY_SPEC, error taxonomy, API conventions, shared types
        operational-specs.md        CONFIG_SPEC, migrations, observability, backend policies
        governance-checks.md        10 sub-checks for verify dimension 7
        start-mode.md               Task generation rules, dependency graph, test + operational tasks
        run-mode.md                 Reconciliation, queue processing, fix tasks, spec gap triage
        autopilot-mode.md           Self-testing, checkpoint tiers, integration gates
        verify-mode.md              7 dimensions, dependency audit, governance checks
        sync-mode.md                Spec hash comparison, queue adjustment, cascade handling
    cl-designer/                    Design system, mockups
      SKILL.md
      references/
        setup-mode.md               MCP detection, visual references, design discovery
        tokens-mode.md              Token derivation, component generation, behavioral states
        mockups-mode.md             Screen inventory, ref nodes, responsive states
        behavioral-walkthrough.md   Screen states, interaction flows, navigation, content
        build-plan-mode.md          5-phase task breakdown, dependency graph
        design-checklist.md         Tokens checklist (14 items), mockups checklist (11 items)
  hooks/
    hooks.json                      Hook registration (PreToolUse + PostToolUse)
    config.js                       Shared config loader (.clarity-loop.json)
    protect-system-docs.js          PreToolUse: blocks unauthorized system doc writes
    generate-manifest.js            PostToolUse: regenerates manifest after system doc changes
  scripts/
    init.js                         Directory scaffolding, collision detection, templates
    init.sh                         Bash wrapper for cross-platform init
  templates/
    decisions.md                    DECISIONS.md template
    research-ledger.md              RESEARCH_LEDGER.md template
    proposal-tracker.md             PROPOSAL_TRACKER.md template
    status.md                       STATUS.md template
  docs/                             Detailed documentation
    SYSTEM_DESIGN.md                Full architecture reference
```

---

## Requirements

- [Claude Code](https://claude.ai/code) v1.0.33+
- Node.js v18+ (init script and hooks)
- No other dependencies

Optional: [Pencil](https://www.pencil.dev/) for visual design generation.

---

## Troubleshooting

**Skills don't show up** — Restart your Claude Code session. Skills load at session start.

**SSH auth error during install** — Claude Code clones via git. If SSH isn't configured for GitHub:
```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

**Install shows "(no content)"** — Known CLI feedback gap. Restart and check if `/cl-` autocomplete works.

---

## License

MIT
