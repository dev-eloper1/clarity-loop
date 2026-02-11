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

**5. Implement with tracking.** The plugin generates a unified task queue from specs, processes tasks front-to-back with acceptance criteria verification, handles runtime failures, reconciles external code changes on resume, and feeds spec gaps back into the documentation pipeline.

At every stage, the pattern is the same: **AI generates, human reviews, feedback refines, human approves.** Nothing advances without your judgment. And when implementation reveals that something upstream was wrong — a spec gap, a stale library pattern, an incomplete design — the pipeline loops back to fix the source, not paper over the symptom.

---

## What It Looks Like

```bash
# Start a new project
/doc-researcher bootstrap
# -> Auto-scaffolds docs directory structure
# -> Discovery conversation about your project
# -> Initial system docs generated (PRD, Architecture, TDD)
# -> "Your Architecture doc references 4 libraries. Create context files? [Y/n]"

# Research a feature
/doc-researcher research "user authentication"
# -> Multi-turn conversation grounded in your existing docs
# -> Research doc generated with findings and recommendations

# Generate a proposal
/doc-researcher proposal
# -> Concrete change manifest: what changes, where, why
# -> "Proposal generated. Read it over and let me know when you'd like to review."

# Review and merge
/doc-reviewer review
# -> Six-dimension review against all system docs
# -> Fix cycle until approved, then merge to protected system docs

# Generate specs and implement
/doc-spec-gen generate
/implementer start
/implementer run
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
/doc-researcher bootstrap
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

## The Five Skills

| Skill | Command | What It Does |
|-------|---------|-------------|
| **doc-researcher** | `/doc-researcher` | Bootstraps initial docs, triages complexity, runs multi-turn research conversations, plans document structure, generates proposals, creates per-library context files |
| **doc-reviewer** | `/doc-reviewer` | Reviews proposals against all system docs, manages fix cycles, merges to protected system docs, verifies merges, runs system-wide audits, checks code-doc alignment, reviews designs |
| **doc-spec-gen** | `/doc-spec-gen` | Generates implementation-ready specs from verified system docs, runs cross-spec consistency checks |
| **ui-designer** | `/ui-designer` | Runs design discovery conversations, generates design tokens and component libraries, creates screen mockups with visual feedback loops, produces implementation task breakdowns |
| **implementer** | `/implementer` | Generates unified task queues from specs, tracks implementation progress, handles runtime failures and regressions, reconciles external changes, feeds spec gaps back into the pipeline |

---

## How the Pipeline Works

It's called Clarity **Loop** because problems flow backward, not just forward:

- **Every stage loops internally.** Generate → review → feedback → refine → approve. Nothing advances until you're satisfied.
- **Implementation loops back to the source.** Spec gaps route to research. Context gaps route to library knowledge. Fixes happen where the mistake originated, not in the code.
- **Audits catch cumulative drift.** Each proposal is fine alone — but 10 proposals can silently move the system off course. Periodic audits check the full doc set and feed findings back into research.

### What else it handles

| You worry about... | The pipeline handles it |
|---|---|
| **Ideas at the wrong time** | Every concept captured automatically in a parking lot. Scope it later, defer to V2, or discard. No FOMO. |
| **Coming back after a break** | All state lives in markdown. On resume, the implementer diffs what changed, re-verifies affected tasks, picks up where it left off. |
| **Editing code outside the pipeline** | External changes detected via git, mapped to tasks, manually-completed work marked as done. |
| **Fixes breaking other things** | Fix tasks trigger automatic re-verification of all downstream completed tasks. |
| **Docs drifting from code** | Code-doc sync extracts claims from docs and checks them against the actual codebase. |
| **Full ceremony for trivial changes** | Triage routes typos to direct fixes. Correction mode handles audit findings without research cycles. |
| **Half-stale specs** | Waterfall gate blocks spec generation until all system docs are verified. |

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
- Implementation tracking with reconciliation, fix tasks, and spec gap feedback

For the full analysis: [Design Decisions](docs/research/DOC_PIPELINE_PLUGIN.md)

---

## Documentation

| Document | Covers |
|----------|--------|
| [doc-researcher](docs/doc-researcher.md) | Bootstrap, triage, research, structure, proposal, context modes |
| [doc-reviewer](docs/doc-reviewer.md) | Review, re-review, fix, merge, verify, audit, correct, sync, design-review modes |
| [doc-spec-gen](docs/doc-spec-gen.md) | Spec generation, waterfall gate, cross-spec consistency review |
| [ui-designer](docs/ui-designer.md) | Setup, tokens, mockups, build-plan modes, Pencil MCP integration |
| [implementer](docs/implementer.md) | Start, run, verify, status, sync modes, task queue, fix tasks, reconciliation |
| [Pipeline Concepts](docs/pipeline-concepts.md) | System doc protection, manifest, tracking files, context files, configuration |
| [Hooks](docs/hooks.md) | PreToolUse protection, PostToolUse manifest generation |

### Pencil MCP (Optional)

The ui-designer works with or without [Pencil](https://www.pencil.dev/) — a design-as-code tool with an MCP server. With Pencil, you get live visual design on an infinite canvas. Without it, you get equivalent structured markdown specs. See [Pencil setup](docs/ui-designer.md#pencil-setup) for installation.

---

## Project Structure

```
clarity-loop/
  .claude-plugin/
    plugin.json                     Plugin manifest
    marketplace.json                Marketplace catalog
  skills/
    doc-researcher/                 Research, proposals, library context
      SKILL.md
      references/
        bootstrap-guide.md
        research-template.md
        proposal-template.md
        document-plan-template.md
        context-mode.md
    doc-reviewer/                   Review, merge, verify, audit
      SKILL.md
      references/
        re-review-mode.md
        verify-mode.md
        audit-mode.md
        correction-mode.md
        merge-mode.md
        fix-mode.md
        sync-mode.md
        design-review-mode.md
    doc-spec-gen/                   Spec generation
      SKILL.md
      references/
        spec-consistency-check.md
    implementer/                    Task queue, implementation tracking
      SKILL.md
      references/
        start-mode.md
        run-mode.md
        verify-mode.md
        sync-mode.md
    ui-designer/                    Design system, mockups
      SKILL.md
      references/
        setup-mode.md
        tokens-mode.md
        mockups-mode.md
        build-plan-mode.md
        design-checklist.md
  hooks/
    hooks.json
    config.js
    protect-system-docs.js
    generate-manifest.js
  scripts/
    init.js
    init.sh
  templates/
    decisions.md
    research-ledger.md
    proposal-tracker.md
    status.md
  docs/                             Detailed documentation
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

**Install shows "(no content)"** — Known CLI feedback gap. Restart and check if `/doc-` autocomplete works.

---

## License

MIT
