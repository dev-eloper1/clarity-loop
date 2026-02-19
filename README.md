# Clarity Loop

![Clarity Loop](docs/wiki/clarity_loop.png)

**A [Claude Code](https://claude.ai/code) plugin that takes you from a vague idea to working code** — through research, reviewed docs, visual design, and tracked implementation. AI does the work. Humans make the calls. Files hold the truth.

```bash
/plugin marketplace add dev-eloper1/clarity-loop
/plugin install clarity-loop@clarity-loop
```

---

## The problem with AI coding

You ask Claude to build something. It writes code. The code looks right. Three days later:

- The PRD says one thing, the Architecture doc says another, the code matches neither
- The auth strategy you decided on day 1 got re-decided on day 4 — differently
- You're debugging stale API calls because the LLM's training data is six months behind your `package.json`
- Nobody verified the specs against the docs before implementation started

This isn't a code generation problem. It's an input problem. **Vague docs, drifting specs, lost decisions, stale library knowledge** — the inputs are broken, so the outputs can't be correct.

Clarity Loop fixes the inputs.

---

## How it works

Five stages, chained together with human gates:

**Research → Document** — Describe what you want to build. The plugin researches the problem, drafts system docs (PRD, Architecture, TDD), and iterates with you until they're solid. Every doc is cross-referenced against every other doc before you move forward.

**Build library knowledge** — Before any code touches your project, the plugin researches the actual current state of every library in your stack. Correct imports. Breaking changes. Known gotchas. Distilled into context files that load during implementation. No more stale API calls.

**Design the UI** — Design discovery conversation → token system and component library → screen mockups with visual feedback loops. Works with [Pencil MCP](https://www.pencil.dev/) for live visual artifacts, or produces structured specs if you don't have it.

**Generate specs** — Once docs are verified, the plugin generates concrete implementation specs: precise types, enumerated edge cases, explicit acceptance criteria. The bridge between "what to build" and "how to build it."

**Implement with tracking** — Because the docs are precise and the library knowledge is current, implementation runs near-autonomously. It generates a task queue, processes tasks front-to-back, verifies each against acceptance criteria, handles runtime bugs, and picks up exactly where it left off across sessions.

Stages 1–4 are the investment. Stage 5 is where it pays off.

Under the hood, parallel subagents handle the heavy lifting — reading documents simultaneously, checking consistency across doc pairs, running implementation tasks concurrently. The main context orchestrates; the agents execute.

---

## What it looks like

```bash
# Start a new project
/cl-researcher bootstrap
# → Scaffolds docs structure
# → Discovery conversation: what are you building?
# → Initial system docs generated (PRD, Architecture, TDD)
# → "Architecture references 4 libraries. Create context files? [Y/n]"

# Research a feature
/cl-researcher research "user authentication"
# → Multi-turn conversation grounded in your existing docs
# → Research doc with findings and recommendations

# Review and ship
/cl-researcher proposal    # Concrete change manifest: what changes, where, why
/cl-reviewer review        # Six-dimension review across all docs
/cl-reviewer merge         # Protected write to system docs

# Implement
/cl-implementer spec       # Waterfall-gated spec generation
/cl-implementer run        # Task queue → parallel execution → per-task verification
```

When implementation reveals something upstream was wrong — a spec gap, a stale library pattern, an incomplete design — the pipeline loops back to fix the source. Not paper over the symptom.

---

## When should you use this?

Clarity Loop is overhead for small projects. It's built for when "describe and ship" starts breaking:

- **5+ interconnected documents** that drift from each other without structured review
- **Complex tech stacks** where the LLM's training data doesn't match your library versions
- **Multi-day projects** where context compression loses decisions you made yesterday
- **Systems where correctness matters** — your auth flow can't just look right, it has to *be* right

If you're prototyping something over a weekend, this is probably too much process. If you're building something you'll maintain, it pays for itself.

---

## The four skills

| Skill | What it does |
|-------|-------------|
| `cl-researcher` | Bootstrap, triage, multi-turn research, proposals, per-library context files |
| `cl-reviewer` | 6-dimension review, fix cycles, protected merges, post-merge verification, audits, code-doc sync |
| `cl-designer` | Design discovery, token systems, screen mockups, visual feedback loops, build plans |
| `cl-implementer` | Spec generation, task queues, parallel implementation, fix tasks, reconciliation, spec gap feedback |

---

## What else the pipeline handles

| You worry about... | The pipeline handles it |
|---|---|
| **Ideas at the wrong time** | Captured in a parking lot. Scope later, defer to V2, or discard. |
| **Coming back after a break** | All state lives in markdown. Diffs what changed, re-verifies affected tasks, picks up exactly where it left off. |
| **Editing code outside the pipeline** | External changes detected via git, mapped to tasks, manually-completed work marked done. |
| **Design gaps found mid-build** | Routes directly to `/cl-designer` — no research cycle needed for visual fixes. |
| **Fixes breaking other things** | Fix tasks trigger automatic re-verification of all downstream completed tasks. |
| **Docs drifting from code** | Code-doc sync extracts claims from docs and checks them against the actual codebase. |
| **Full ceremony for trivial changes** | Triage routes typos to direct fixes. Correction mode for audit findings, no research cycle. |
| **Decisions evaporating** | Every decision logged to `DECISIONS.md` with rationale. Every skill reads it at session start. |
| **Half-stale specs** | Waterfall gate blocks spec generation until all system docs are verified. |
| **Governance drift** | Post-implementation verification across 10 dimensions — config, observability, architecture alignment, decision reconciliation. |

---

## Design principles

> **AI does the work. Humans make the calls. Files hold the truth.**

1. **React, don't originate.** The human never faces a blank page. The AI generates first — a draft, a mockup, a task queue — and the human reacts.
2. **Judgment is the bottleneck, not effort.** The pipeline minimizes human effort but maximizes human judgment. Every gate is an approval.
3. **The system remembers.** Conversations are ephemeral. Artifacts are permanent. Decisions made on day 1 still constrain work on day 30.
4. **Structured iteration beats one-shot generation.** Generate → review → feedback → refine. The antidote to AI slop.
5. **Process protects the product — proportionally.** Triage determines depth. Trivial changes skip gates; complex changes get the full pipeline.
6. **Tools enhance, never gate.** Zero external dependencies required. Pencil MCP and library context add richness, but the core always works.

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

Then start your project:

```bash
/cl-researcher bootstrap
```

### Updating

```bash
/plugin update clarity-loop
```

Updates never touch your project's docs — only the plugin's skills, hooks, and scripts.

---

## Requirements

- [Claude Code](https://claude.ai/code) v1.0.33+
- Node.js v18+
- No other dependencies

Optional: [Pencil](https://www.pencil.dev/) for live visual design generation.

---

## Documentation

| | |
|--|--|
| **[System Design](docs/wiki/SYSTEM_DESIGN.md)** | Full architecture — pipeline flow, agent layer, protection model, spec generation, all feedback loops |
| [cl-researcher](docs/wiki/cl-researcher.md) | Bootstrap, triage, research, structure, proposal, context modes |
| [cl-reviewer](docs/wiki/cl-reviewer.md) | Review, re-review, fix, merge, verify, audit, correct, sync, design-review modes |
| [cl-designer](docs/wiki/cl-designer.md) | Setup, tokens, mockups, build-plan modes, Pencil MCP integration |
| [cl-implementer](docs/wiki/cl-implementer.md) | Spec, waterfall gate, cross-spec check, start, run, autopilot, verify, status, sync modes |
| [Pipeline Concepts](docs/wiki/pipeline-concepts.md) | Fan-out orchestration, doc protection, manifest, tracking files, config |
| [Hooks](docs/wiki/hooks.md) | PreToolUse protection, PostToolUse manifest generation |

---

## Troubleshooting

**Skills don't show up** — Restart your Claude Code session. Skills load at session start.

**SSH auth error during install** — Claude Code clones via git. If SSH isn't configured for GitHub:
```bash
git config --global url."https://github.com/".insteadOf "git@github.com:"
```

**Install shows "(no content)"** — Known CLI feedback gap. Restart and check `/cl-` autocomplete.

---

## Prior art

Clarity Loop was designed after studying [BMAD](https://docs.bmad-method.org/) (enterprise AI SDLC with 21 agent personas) and [GSD](https://github.com/glittercowboy/get-shit-done) (anti-bureaucracy spec-driven framework). It borrows BMAD's complexity routing and GSD's human discussion phase, and adds persistent decision journals, cross-document verification, visual design generation, per-library context files, audit and drift detection, and implementation tracking with reconciliation and spec gap feedback.

---

## License

MIT
