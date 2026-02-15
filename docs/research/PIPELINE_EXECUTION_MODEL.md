# Research: Pipeline Execution Model and Readiness Signaling

**Created**: 2026-02-12
**Status**: Draft — All Design Decisions Resolved (ready for revised proposal generation)
**Author**: User + AI researcher

## System Context

### Research Type: Evolutionary

This research improves how the existing Clarity Loop pipeline guides users from bootstrap
through to implementation. The pipeline exists and works, but lacks an execution model —
there's no concept of "readiness," no guidance on what to do next, and no convergence
mechanism to prevent infinite research loops.

### Related Artifacts

| Artifact | Relevant Sections | Relationship |
|----------|-------------------|-------------|
| skills/cl-researcher/references/bootstrap-guide.md | Step 6 (Clean Up / completion message) | Where readiness is surfaced post-bootstrap |
| skills/cl-researcher/SKILL.md | Context Mode / Auto-offer | Where the pipeline suggests next actions |
| skills/cl-designer/SKILL.md | Pipeline overview, mode detection | Design loop as a pipeline stage |
| skills/cl-implementer/SKILL.md | Spec mode gates | Where readiness could be checked before implementation |
| skills/cl-reviewer/SKILL.md | Audit mode | Post-implementation readiness verification |

Note: Projects that use the Clarity Loop pipeline may have their own tracking artifacts
(e.g., `SYSTEM_READINESS_STATUS.md`, `DECISIONS.md`). The readiness map proposed here
complements per-project tracking — it doesn't replace it.

### Current State

The Clarity Loop pipeline currently has **29 distinct modes across 4 skills** but no
overarching execution model. After bootstrap:

1. The completion message says "use `/cl-researcher research 'topic'` for new features"
   — a generic one-liner that doesn't reflect the project type or available pipeline stages.
2. The design loop (`/cl-designer setup → tokens → mockups → build-plan`) is never
   mentioned, even for UI projects where it's the natural next step.
3. Research cycles for security, testing, error handling, behavioral specs, etc. are
   invisible — the user would never discover them from the bootstrap output.
4. There's no signal for when research is "done enough" to proceed to implementation.
5. The pipeline can keep suggesting more research topics indefinitely with no convergence.

**Existing readiness tracking**: Projects using the pipeline may have per-concept tracking
(e.g., a status file listing individual concepts like "Memory System: READY", "Sandbox:
OUTLINED"). This is concept-level tracking. What's missing is *area-level* readiness
(security, testing, UI design) that tells users when their *project as a whole* is ready
to move from documentation to implementation.

### Why This Research

The immediate trigger: after bootstrapping a notes app, the pipeline produced PRD,
ARCHITECTURE, DATA_MODEL, and FRONTEND_DESIGN docs, then said "start building" without
mentioning the design loop, security research, testing strategy, or any other pipeline
capability. When the completion message was improved to suggest these, a new problem
emerged: the pipeline could suggest research topics forever with no stopping condition.

The deeper problem: the pipeline has no execution model. It doesn't know what "done" means,
what's required vs optional for a given project, or when to stop suggesting and let the
user build.

## Scope

### In Scope

- What execution model should the pipeline use? (linear, convergence, continuous, hybrid)
- How to define meaningful project archetypes that drive different readiness profiles
- How to generate a readiness signal at bootstrap time with appropriate confidence levels
- How to handle emergent complexity without infinite scope growth
- How the pipeline signals convergence (when to stop researching and start building)
- How readiness integrates with existing per-project tracking (decisions log, concept status)

### Out of Scope

- Individual skill internals (how tokens mode generates components, how spec mode works)
- MCP tool usage and design tool specifics
- The specific content of research topics (security analysis methodology, testing strategy)
- CI/CD pipeline integration

### Constraints

- Must work across the full project spectrum (exploratory → POC → production)
- Must not force users through unnecessary steps
- Must handle the "preset default = low confidence" problem honestly
- The solution should feel like guidance, not a gate
- Must complement any existing per-project tracking, not replace it

## Research Findings

### Finding 1: The Pipeline Currently Has No Execution Model

**Context**: The four Clarity Loop skills (researcher, designer, implementer, reviewer)
each have well-defined internal processes, but there's no overarching model connecting them.

**Analysis**: Each skill has gates (e.g., "tokens must be complete before mockups"), but
these are *within-skill* gates. There are no *between-skill* gates or guidance. After
bootstrap completes, the user faces a blank canvas with 29 possible commands and no map.

The closest thing to an execution model is the pipeline diagram in cl-designer's SKILL.md:
```
System docs exist (PRD with UI features)
  → /cl-designer setup → tokens → mockups → build-plan
  → /cl-reviewer design-review
  → /cl-implementer spec
```

But this is designer-specific. There's no equivalent for the full pipeline, and it's
invisible to a user who hasn't read the designer skill's source code.

**Source**: Analysis of cl-researcher/SKILL.md, cl-designer/SKILL.md, cl-implementer/SKILL.md,
cl-reviewer/SKILL.md.

### Finding 2: Three Execution Models Exist in Industry

**Context**: How do other methodologies handle the "when is research done?" question?

**Analysis**:

**Model A — Linear Pipeline (Waterfall-adjacent)**
Bootstrap → Design → Spec → Build → Review → Done.
Each stage gates the next. Clear end state. But doesn't match reality — most projects
don't need every stage, and requirements change during implementation.

**Model B — Convergence Loop (Research-until-ready)**
Research iteratively until a readiness threshold is met, then build. Used in academic
research and regulated industries (HIPAA, aviation). Strong quality guarantees but high
risk of analysis paralysis. The convergence condition is the hard problem — who defines
"ready enough"?

**Model C — Continuous Refinement (Agile-adjacent)**
Build early with minimal research. Research as needed when problems arise. Fast time-to-code
but can produce docs that don't match reality and architectural decisions made under
pressure. This is what most developers default to when given no guidance.

**Model D — Guided Autonomy (Shape Up-adjacent)**
The pipeline provides a map of available paths, tracks what's been covered, and signals
readiness — but the *user* decides when to proceed. No hard gates between stages. The
pipeline informs; the user consents.

Shape Up (Basecamp) introduced the concept of **"appetite"** — a time/effort budget set
upfront that constrains how much research a topic deserves. If you can't find an approach
within the appetite, the scope is wrong, not the research. This enforces convergence
through budget rather than completeness criteria.

The Scrum **Definition of Ready (DoR)** is a similar concept applied at story level — a
checklist that work items must meet before entering a sprint. The project-level analogy
would be a checklist the project must meet before entering implementation.

**Source**: Shape Up methodology (Basecamp), Scrum Definition of Ready (Scrum.org,
Atlassian), production readiness checklists (TechTarget, GetDX).

### Finding 3: Project Intent Matters More Than Project Type

**Context**: The current preset system classifies projects by type (Web App, API, CLI,
Library, Prototype). But the same project type can have radically different research needs
depending on the user's intent.

**Analysis**: Consider two web applications:
- A weekend side project: User wants working code fast. Preset defaults are fine. No
  security research needed. Skip design. Go straight to implementation.
- A healthcare SaaS: User needs HIPAA compliance, thorough security, accessibility AA,
  tested auth flows. Multiple research cycles required before implementation is responsible.

Both are "Web Application" presets. The difference is intent:

| Intent | Description | Research Appetite | Readiness Threshold |
|--------|-------------|-------------------|---------------------|
| **Ship** | Get working software fast | Minimal — defaults are fine | Low — bootstrap is enough |
| **Quality** | Build production-grade software | Moderate — key areas need research | Medium — critical areas covered |
| **Rigor** | Build to compliance/regulatory standards | High — thorough research required | High — all areas deeply covered |
| **Explore** | Understand a problem space | Unlimited for the topic, zero for implementation | N/A — research IS the output |
| **Decide** | Choose between approaches | Focused — just enough to compare options | N/A — decision IS the output |

The current preset system captures project *type* but not *intent*. A single question
during bootstrap — "What's your goal: ship fast, build for production, meet compliance
requirements, or explore a problem?" — would provide a powerful signal for calibrating
the pipeline.

Intent can shift mid-project. A "ship" project might become "quality" after a demo gets
traction. The pipeline should accommodate this without requiring a restart.

**Tradeoffs**: Adding an intent question adds complexity to bootstrap. But it's one question
that dramatically changes the pipeline's behavior — a high-leverage intervention.

**Source**: Shape Up's appetite concept applied at the project level, analysis of the
spectrum problem raised in our conversation.

### Finding 4: Readiness May Be Emergent, Not Prescriptive

**Context**: Can we generate a useful readiness signal at bootstrap time? And is readiness
even the right framing?

**Analysis — the prescriptive approach**: The defaults sheet (Step 2c) already captures
cross-cutting decisions with source attribution: `[auto-detected]`, `[research-generated]`,
`[preset]`, `[user override]`, `[from discovery]`. These sources have different confidence
levels:

| Source | Confidence | What It Means |
|--------|-----------|---------------|
| `[auto-detected]` | High | Verified from code — this is a fact |
| `[from discovery]` | High | User explicitly stated this — it's a decision |
| `[user override]` | High | User consciously chose this |
| `[research-generated]` | Medium | Inferred from docs — reasonable but unverified |
| `[preset]` | Low-Medium | Generic default — user may not have thought about it |
| `[DEFERRED]` | None | Explicitly postponed — known gap |
| (not mentioned) | None | Never discussed — unknown gap |

A binary checklist (covered/not covered) treats `[preset]` the same as `[auto-detected]`.
This gives false assurance. A healthcare app with `Security: Standard [preset]` looks
"covered" but isn't. A confidence-aware approach would distinguish these.

**Analysis — the emergent approach**: There's a fundamental tension between a prescriptive
readiness map (pre-defined areas, fill them in as you go) and how readiness actually works
in practice. Readiness doesn't come from checking boxes — it *emerges* from the accumulation
of decisions, research, and design work. Consider:

- A project that ran bootstrap + one security research cycle might be "readier" than a
  project that ran bootstrap + design + five research cycles but never made a clear auth
  decision.
- Readiness isn't about coverage of pre-defined areas — it's about whether the decisions
  made so far form a coherent, sufficient foundation for implementation.
- A pre-defined area catalog risks becoming a checkbox exercise: "We need to research
  testing because the map says it's Open" — even when the project is a throwaway prototype
  where testing strategy doesn't matter.

**The overlap with decisions**: The pipeline already tracks decisions. Every research cycle
produces decisions. Every design choice is a decision. Every user override during bootstrap
is a decision. If readiness is emergent, it might be better understood as a *view over
decisions* rather than a separate artifact:

- "What areas have we made deliberate decisions about?" → those are covered
- "What areas have only preset defaults?" → those are defaulted
- "What areas haven't been discussed at all?" → those are open

This would mean readiness doesn't need its own file — it needs a way to *project* the
existing decision history into an area coverage view. The decision log IS the readiness
signal, just viewed through a different lens.

**Unresolved tension**: The prescriptive approach has a clear advantage at bootstrap —
you can generate a map immediately that shows the user what's covered and what isn't. The
emergent approach is more honest but less actionable early on — there aren't enough
decisions yet to form a meaningful picture. Perhaps the answer is prescriptive scaffolding
at bootstrap (to give the user orientation) that transitions to emergent tracking as the
project accumulates decisions and artifacts. But this is speculative — **more research is
needed on how readiness should be modeled**.

**What's clear regardless of approach**:
- Binary checklists are wrong — confidence levels matter
- Preset defaults should never look the same as deliberate decisions
- The user, not the pipeline, determines when readiness is sufficient (Finding 7)
- The readiness signal (however modeled) should be transparent about its sources

**Source**: Analysis of defaults sheet source attribution, Shape Up appetite calibration,
decision-tracking patterns in existing pipeline.

### Finding 5: Cross-Skill Loops Are Natural — Park and Proceed, Don't Backtrack

**Context**: When research surfaces a design need, design reveals an architecture gap, or
implementation discovers something that invalidates earlier work — what should the pipeline
do? The current research (Findings 1-4) addresses the "when to start" question but not the
"what happens when you loop back" question.

**Analysis**: Loops across skill boundaries are a natural part of software development:

```
research → design → "the data model doesn't support this layout"
  → research again → update specs → design again → ...

implementation → "this library API doesn't work as documented"
  → context refresh → spec update → implementation again → ...

design → "users need a flow we didn't anticipate"
  → PRD update → research → design again → ...
```

These loops are inevitable. The question isn't how to prevent them — it's how to handle
them without degenerating into thrashing.

**The wrong response: backtrack and restart.** Going back to square one when a loop is
detected wastes all the work already done. If design reveals an architecture gap, the fix
is to update the architecture doc — not to re-run the entire bootstrap.

**The right response: park and proceed.** When a loop is detected:

1. **Finish the current work first.** If you're in the middle of designing screen 4 of 8
   and discover an architecture gap, finish the design pass. The gap applies to screen 4
   but the other screens are unaffected. Complete what's completable.

2. **Park the finding.** Record what was discovered, its classification (architectural,
   incremental, scope expansion — see Finding 6), and what needs to happen. The parking
   mechanism must be structured and durable — the user needs confidence that parked items
   won't be lost in the ether.

3. **Proceed to the next natural step.** After completing the current work, the parked
   items become input for the next cycle. They're not forgotten — they're queued.

4. **Build on what exists.** When addressing parked items, start from the current state,
   not from scratch. A design gap doesn't invalidate the spec — it requires a spec *update*.

**Why parking works psychologically**: The reason people loop endlessly isn't that loops
are necessary — it's FOMO. If you don't address the insight NOW, it might get lost. If the
pipeline provides a structured parking mechanism where you can see every parked item, its
classification, and its status, the anxiety disappears. You can stay focused on finishing
the current work because you know the finding is captured and queued.

**What exists today**: The pipeline already has pieces of this:
- Emerged Concepts tables capture scope expansion
- Decisions logs capture point-in-time choices
- The researcher skill has a "feedback from cl-implementer" path for context gaps

But these are fragmented. There's no unified "parking lot" view that shows everything
that's been surfaced across all skills, classified by impact, with clear next-action
indicators. The user has to mentally aggregate across multiple files to know "what's
parked."

**What's needed**: A single structured view — call it a parking lot, backlog, or findings
log — where any skill can park a discovery, classify it, and any other skill can pick it
up. This is distinct from the readiness question (Finding 4) — it's about *capturing work
to be done*, not *assessing whether enough work has been done*.

**Loop depth**: Not all loops need the same rigor. The first research pass on security
might be a full multi-day cycle. A loop back to update the security model because design
revealed a new user flow might be a 30-minute targeted update. The pipeline should support
lightweight loops — quick targeted updates to existing artifacts — not force every loop
through the full research → proposal → review → merge ceremony.

**Source**: Agile backlog management, GTD (Getting Things Done) "capture everything"
principle, the user's insight about FOMO-driven unstructured development.

### Finding 6: Emergent Complexity Needs Classification, Not Blocking

**Context**: When research or design surfaces new requirements, should they block
implementation?

**Analysis**: Emergent items fall into three categories:

| Category | Example | Impact on Readiness | Action |
|----------|---------|---------------------|--------|
| **Architectural** | "We need real-time sync — requires WebSockets and different data model" | Blocks — building without this means rework | Add as 🔴 to readiness map |
| **Incremental** | "We should add dark mode support" | Doesn't block — can be added later without rearchitecting | Note in backlog, don't change readiness |
| **Scope expansion** | "What if we also added notifications?" | Doesn't block — it's a new feature | Add to Emerged Concepts table |

The key insight: **the default classification should be "incremental."** Most things that
surface during research can be added later. Only decisions that fundamentally change the
architecture (database choice, auth strategy, data model shape, real-time vs batch) should
block implementation.

Per-project tracking may capture emerged concepts (e.g., in a status or readiness file) and
decisions (in a decisions log), but neither classifies items by their blocking impact on
readiness.

**Who classifies?** The pipeline proposes a classification based on the item's nature
(data model change → likely architectural; UI enhancement → likely incremental). The user
confirms or overrides. This mirrors the generate-confirm pattern used throughout the
pipeline.

**Tradeoffs**: Misclassification is the main risk. An "incremental" item that's actually
architectural leads to rework. An "architectural" item that's actually incremental causes
unnecessary delay. The pipeline should err toward "incremental" — it's better to start
building and discover a problem than to delay indefinitely. The cost of rework is usually
lower than the cost of analysis paralysis.

**Source**: Agile principle "Responding to change over following a plan," Shape Up's
fixed-time/variable-scope model.

### Finding 7: Convergence Comes From the User, Not the Pipeline

**Context**: How does the pipeline know when to stop suggesting research?

**Analysis**: The pipeline can *never* determine completeness — there's always one more
thing to research. No automated check can say "your security model is thorough enough."
This is a judgment call that requires domain knowledge the pipeline doesn't have.

What the pipeline CAN do:
1. **Show the current state clearly** — readiness map with confidence levels
2. **Express an opinion on risk** — "These areas are high-risk if skipped"
3. **Provide a clear proceed command** — the user explicitly says "I'm ready to implement"
4. **Acknowledge the decision** — "Proceeding with 2 defaulted areas and 1 open area.
   These will use preset defaults during spec generation."

What the pipeline should NOT do:
- Block implementation based on readiness assessment (gate)
- Repeatedly suggest research after the user has decided to proceed (nagging)
- Make the user justify their decision to proceed (interrogation)

The right model is **informed consent**: the pipeline informs, the user consents. Like a
doctor explaining risks before surgery — the doctor doesn't refuse to operate because the
patient hasn't had every possible test.

**The proceed moment**: When the user runs `/cl-implementer spec` or `/cl-implementer start`,
the pipeline checks the readiness map and gives a one-time advisory:
- All covered: "Your project is well-researched. Generating specs."
- Some defaulted: "Proceeding with preset defaults for [areas]. These are reasonable
  starting points that can be refined later."
- Some open: "These areas haven't been addressed: [list]. I'll use sensible defaults
  during spec generation. You can research these later if needed."
- Blocking items: "Heads up — [area] was flagged as needing depth for your project type.
  Proceeding anyway, but this may require rework. Want to research it first, or proceed?"

Even the "blocking" advisory is not a hard gate — the user can always proceed.

**Source**: Informed consent model from medical ethics, Shape Up's "you can always ship
what you have" principle.

### Finding 8: STATUS.md Has Significant Adoption Gaps

**Context**: Before the sensemaking instrument can be built on top of STATUS.md (see Design
Decision D1), we need to understand how consistently it's used today. A comprehensive audit
of all 4 skills, all ~29 modes, and all reference files reveals significant gaps.

**Analysis**: STATUS.md is **read during session initialization by all skills** but **written
sporadically and inconsistently**.

**Current template sections**: Pipeline State (metrics), Research Queue (adaptive ordering),
Emerged Concepts (concept capture with status tracking).

**Write operations — gap analysis**:

| Lifecycle Stage | Writes STATUS.md? | Gap Severity |
|---|---|---|
| Bootstrap | Yes — notes completion, lists docs | — |
| Research completion | Partial — emerged concepts only, not metrics | Medium |
| Proposal generation | No — should increment "In-flight proposals" | Major |
| Review (initial/re-review) | No — should note review state | Major |
| Merge | No — should increment "Merged proposals" | Major |
| Verify (post-merge) | Yes — increments merged count | — |
| Audit | Yes — sets last audit date + emerged concepts | — |
| Design setup | No — should note design process starting | Major |
| Tokens / Mockups / Build Plan | Conditional — "if it tracks design state" (vague) | Major |
| Design review | Yes — notes date and verdict | — |
| Spec generation | Yes — sets "Specs generated" to Yes | — |
| Start / Run / Autopilot (impl) | No — should track implementation state | Major |
| Implementation verify | No — should note completion status | Major |
| Context mode | Conditional — "if a Context section exists" (it doesn't) | Major |

**Template gaps** — sections that skills reference but don't exist:
1. **Design State**: Tokens, Mockups, Build Plan modes say "if it tracks design state" but
   no section exists in the template
2. **Implementation State**: No section for tracking build progress
3. **Context Files**: Context mode says "if a Context section exists" but it doesn't
4. **Corrections Log**: Correction mode says to note corrections but no section exists

**Implication for the pulse log**: The pulse log (D1) would naturally fill these gaps — every
mode would append an event, creating a universal tracking mechanism. But the prerequisite is
fixing the template to have the right sections AND standardizing write operations so every
mode knows exactly what to update and when.

**Source**: Comprehensive audit of all SKILL.md files and all references/*.md files across
cl-researcher, cl-reviewer, cl-designer, and cl-implementer.

### Finding 9: Document Proliferation Creates Boundary Confusion

**Context**: A comprehensive audit of all tracking artifacts in the Clarity Loop pipeline
reveals significant overlap and unclear boundaries between documents. The first proposal
attempt added more artifacts (pulse log sections, extended tables, snapshot script) without
rationalizing what already exists — making the problem worse.

**Analysis**: The pipeline currently generates or references **23 distinct tracking artifacts**
(excluding content files like research docs, proposals, and system docs):

| Category | Artifacts | Count |
|----------|-----------|-------|
| Core tracking | STATUS.md, DECISIONS.md, RESEARCH_LEDGER.md, PROPOSAL_TRACKER.md | 4 |
| Auto-generated indexes | .manifest.md, .spec-manifest.md, .context-manifest.md | 3 |
| Session state | DESIGN_PROGRESS.md, IMPLEMENTATION_PROGRESS.md, TASKS.md | 3 |
| Design output specs | DESIGN_SYSTEM.md, UI_SCREENS.md, DESIGN_TASKS.md | 3 |
| Implementation specs | TEST_SPEC, SECURITY_SPEC, CONFIG_SPEC, API Convention, Error Taxonomy | 5 |
| Review artifacts | REVIEW_*, VERIFY_*, AUDIT_*, SYNC_*, DESIGN_REVIEW_*, CORRECTIONS_* | 7 |

**Problematic overlaps** — the same information tracked in multiple places:

| Information | Where It Lives | Problem |
|-------------|---------------|---------|
| Active research count | STATUS.md AND RESEARCH_LEDGER.md | Can drift |
| Proposal counts | STATUS.md AND PROPOSAL_TRACKER.md | Can drift |
| Emerged concepts | STATUS.md AND individual research docs | Can drift |
| Task status | TASKS.md AND IMPLEMENTATION_PROGRESS.md AND Claude Code tasks | 3-way drift |
| Design decisions | DESIGN_PROGRESS.md AND DECISIONS.md | Local vs system-wide confusion |

**Boundary confusion**: The boundaries between documents are unclear:
- What goes in STATUS.md vs RESEARCH_LEDGER.md? Both track research state.
- What goes in DECISIONS.md vs DESIGN_PROGRESS.md? Both record design choices.
- What goes in TASKS.md vs IMPLEMENTATION_PROGRESS.md? Both track implementation.
- What goes in STATUS.md Emerged Concepts vs a dedicated parking mechanism?

**The CQRS insight** (from UX research, Finding 10): The universally recommended architecture
is one authoritative data store with many derived read views. Multiple independently maintained
tracking files that can drift from each other is a structural problem, not a process problem.
Adding more tracking without consolidating what exists makes it worse.

**Implication for this proposal**: Any changes must consolidate before extending. The first
proposal attempt added a pulse log, extended Emerged Concepts, and specified a snapshot
script — three new mechanisms on top of 23 existing artifacts. The revised approach must
reduce the artifact count or at minimum clarify boundaries so each file has exactly one
purpose with no overlap.

**Source**: Comprehensive audit of all SKILL.md files, reference files, templates, and scripts
in the Clarity Loop plugin. CQRS insight from UX research (PIPELINE_UX_PATTERNS.md).

### Finding 10: UX Patterns From Real Guided Development Tools

**Context**: Research into how production tools handle guided workflows reveals concrete
patterns that apply to documentation pipelines. Full analysis in
`docs/research/PIPELINE_UX_PATTERNS.md`.

**Seven patterns that apply**:

1. **Editable intermediates** (Copilot Workspace): Every pipeline stage produces a visible,
   editable artifact. Clarity Loop already does this well — research docs, proposals, and
   reviews are all editable intermediates.

2. **Status as side effect** (Linear): The best tracking updates itself as a byproduct of
   doing work. Linear auto-advances issue status from branch creation, PR opening, and
   merge — no manual moves. Status updates must be automatic side effects of mode completion,
   not separate actions.

3. **Track uncertainty, not tasks** (Shape Up hill charts): The real signal is "do we
   understand the problem space well enough to proceed?" not "how many boxes are checked."
   The hill chart's uphill (figuring out) / downhill (executing) distinction is more valuable
   than a completion percentage.

4. **One source, many views** (CQRS): Multiple tracking files that can drift from each other
   is a structural problem. One canonical state file with derived views for different needs.
   Any view that requires manual data entry will drift.

5. **Minimum viable state** (Claude Code tasks, Linear): Two fields per tracking item (title
   + status) is the Linear baseline. Everything else is optional and adds value through
   additions, not the other way around.

6. **Autonomous work between checkpoints** (Anthropic 2026 trends): Users are orchestrators.
   The pipeline should run autonomously between checkpoints, then present a complete summary
   and proposed next action. Reduce human-AI round-trips.

7. **Staleness signals without nagging** (Shape Up / Linear): Make age visible without
   notification fatigue. A tracking item that hasn't moved should be distinguishable but
   shouldn't interrupt the user.

**Five anti-patterns to avoid**:
- **Tracking tax**: Maintaining tracking takes more effort than doing the work
- **Circular references**: Documents referencing each other in loops
- **Phantom progress**: Tracking completion when the real risk is unknown unknowns
- **Information dumpster**: Showing everything at once because "the user might need it"
- **Amnesia reset**: Starting every session from scratch because no state persists

**The concrete UX gap**: The first proposal described mechanisms (pulse logs, convergence
metrics, stigmergic decay) but not what the user actually sees and does. "Guided autonomy"
is a label, not an experience. The proposal needs concrete walkthroughs: what does the user
see after bootstrap? What does a typical session start look like? What does a transition
advisory actually say? How does the user know what to do next without reading 29 mode
descriptions?

Copilot Workspace uses a "stepper" (numbered panels). Linear uses automatic status advancement.
Shape Up uses hill charts. These are visual UIs — Clarity Loop is a CLI/conversational tool.
The UX must work in text, not panels. The design question is: what's the conversational
equivalent of a stepper or hill chart?

**Source**: Research in `docs/research/PIPELINE_UX_PATTERNS.md` covering GitHub Copilot
Workspace, Cursor Composer, Linear, Shape Up hill charts, Claude Code session memory, and
Anthropic's 2026 agentic trends.

## Scientific Foundations

Deep research reveals that the pipeline execution model problem sits at the intersection of
cognitive psychology, complexity science, decision theory, cybernetics, and mathematical
convergence theory. The findings below synthesize research across these fields, organized
around three core questions.

### Theme A: Why Do Loops Happen and How Do They Converge?

**The cognitive reason loops persist** — Zeigarnik Effect and loss aversion:

The **Zeigarnik Effect** (Zeigarnik, 1927) demonstrates that incomplete tasks actively
consume working memory. The brain allocates bandwidth to maintain task representations for
unfinished work — this is involuntary. When a researcher discovers an open question mid-task,
the incomplete investigation generates intrusive thoughts that interfere with the current
work. The natural response is to follow the tangent immediately ("close the loop"), which
creates scope creep and research sprawl.

**Critical finding (Masicampo & Baumeister, 2011)**: Making a concrete plan for an
incomplete task is *cognitively equivalent to completing it*. Participants who formulated
specific plans for unfulfilled goals showed zero interference effects on subsequent tasks —
identical to participants whose goals were actually completed. The reduction was mediated by
plan quality: earnest plans with specific when/where/how details fully neutralized the
Zeigarnik Effect.

This is the scientific foundation for "park and proceed." A pipeline that captures a finding
with clear articulation of *what was found*, *why it matters*, and *when it will be revisited*
creates an implementation intention (Gollwitzer, 1999) that satisfies the cognitive
monitoring system. The loop is closed *enough* that it stops consuming working memory.

**Prospect Theory** (Kahneman & Tversky, 1979) explains why stopping feels wrong: losses
loom ~2x as large as equivalent gains. The potential loss ("I might miss a critical insight")
is weighted roughly twice as heavily as the equivalent gain ("I could start building sooner").
Three biases compound:

1. **Loss aversion**: Stopping research frames as giving something up
2. **Status quo bias**: Continuing to research is the path of least resistance; stopping
   requires an active decision
3. **Sunk cost fallacy** (Arkes & Blumer, 1985): Past investment inflates perceived value
   of continuing ("I've already spent three days on this; surely the answer is close")

The antidote: **reframe stopping as parking** (gain frame — you're capturing value and
moving forward, not abandoning knowledge). Make "proceed" the default state that requires
no justification, and "extend research" the active choice that requires justification.

**Seven convergence mechanisms from engineering and mathematics:**

| Mechanism | Source | How It Works | Pipeline Application |
|-----------|--------|-------------|---------------------|
| Risk exhaustion | Spiral Model (Boehm) | Each cycle addresses the highest-risk item. Stop when residual risk is acceptable. | High-risk areas (architecture, security) get more cycles; low-risk areas get one pass. |
| Timeboxing | Double Diamond | External time constraint forces convergence regardless of internal state. | Research phases have budgets (Shape Up "appetite"). |
| Tempo dominance | OODA Loop (Boyd) | Partial convergence at high speed beats full convergence at low speed. | 80% right today > 100% right next week. |
| Contraction to fixed point | Banach theorem | Each iteration reduces distance to solution by a constant factor. Stop when delta < epsilon. | Track "issues per review round" — expect geometric decrease. If not decreasing, something is structurally wrong. |
| Statistical stability | Deming/PDSA | Stop adjusting when the process is in statistical control. Further improvement requires systemic change, not more iterations. | Don't add process after a single bad outcome (the funnel experiment). |
| Damped feedback | Cybernetics (Wiener, Beer) | Negative feedback corrects errors; damping prevents oscillation. | Review process should be critically damped — find issues without triggering over-correction. |
| Constraint shifting | TOC (Goldratt) | Improve the bottleneck until it moves elsewhere. Stop when ROI of next improvement drops below threshold. | Periodically ask: what's actually the bottleneck right now? |

**The Deming insight is especially important**: his **funnel experiment** proved that adjusting
a stable process in response to individual outcomes makes the process *worse* (40% more
variation). Applied to the pipeline: if a proposal fails review, fix the *proposal*, not the
review criteria — unless there's evidence of a structural flaw. Don't add more process steps
after every bad outcome.

**Boyd's OODA insight** challenges the assumption that loops should converge to a fixed point
at all. Boyd argued that mental models must be continuously destroyed and recreated as the
environment changes. A pipeline that only adds and never destructs accumulates stale models.
The goal isn't to converge to a perfect state — it's to cycle fast enough that you're always
approximately right.

### Theme B: Is Readiness Emergent or Prescriptive?

Six independent frameworks converge on the same answer: **readiness is emergent**.

**Complex Adaptive Systems** (Holland, Santa Fe Institute): Emergent properties cannot be
predicted from the properties of individual components. Readiness in a complex system is not
the sum of checked boxes; it's an emergent property of accumulated interactions, decisions,
and artifacts.

**Cynefin** (Snowden, 1999): In the *complex* domain, cause and effect can only be determined
in retrospect. Practices must be *emergent*, discovered through "probe-sense-respond" cycles.
Snowden explicitly warns against applying complicated-domain thinking (analysis, checklists,
best practices) to complex-domain problems. **A prescriptive readiness checklist is a
complicated-domain tool applied to what may be a complex-domain phenomenon.**

**Emergent Strategy** (Mintzberg & Waters, 1985): Realized strategies are rarely purely
deliberate. Instead, "many strategies result when numerous small actions taken individually
throughout the organization, over time, move in the same direction and converge into a
pattern of change." Strategy is recognized *retrospectively* as a pattern in accumulated
decisions, not prescribed in advance. The accumulated research docs, design decisions, and
proposals form a "stream of decisions" whose pattern reveals readiness.

**Sensemaking** (Weick, 1995): Coherence is constructed retrospectively, not planned
prospectively. Weick's recipe — *saying* (action), *seeing* (reflection), *thinking*
(retention) — means that teams must **act first and make sense afterward**. Sensemaking is
about "plausibility and sufficiency" rather than "accuracy and completeness." A team does
not know it is ready until it looks back at what it has produced and recognizes a coherent
pattern.

**Naturalistic Decision Making** (Klein, 1998): Experienced decision-makers don't generate
and compare options using checklists. They use **Recognition-Primed Decision making (RPD)**
— recognizing the situation as similar to a known prototype, mentally simulating a course of
action, then executing or adapting. Klein found that fireground commanders identified a
workable course of action as their *first* option over 80% of the time. "Analytical methods
are the fallback for those without experience."

**The Klein-Kahneman synthesis** (2009) identified the boundary: expert pattern recognition
is reliable when (1) the environment has sufficient regularity and (2) the practitioner has
adequate opportunity to learn those regularities. In novel domains or for new team members,
more structured assessment (the analytical fallback) is appropriate.

**Agile Definition of Ready — the anti-pattern literature**: Significant practitioner
research argues that prescriptive DoR creates stage-gates that undermine agility, violate
empiricism, destroy overlapping work, and reduce conversations to template-filling. The
consensus: as teams mature, they should move from prescriptive DoR toward emergent readiness
recognition. Gawande's (*The Checklist Manifesto*) nuance: use checklists for simple
known-knowns, but rely on emergent assessment for complex aspects.

**Stigmergy** (Grassé, 1959; Elliott, extended to digital collaboration): Indirect
coordination through environmental traces. Termites don't use a central plan — each deposits
a trace that stimulates the next action. In a documentation pipeline, artifacts function as
stigmergic traces:

| Artifact | Stigmergic Function |
|----------|---------------------|
| Research docs | Traces of investigation that guide proposal writing |
| Proposals | Traces of design decisions that guide review |
| Review artifacts | Traces of quality assessment that guide revision |
| Merged system docs | Traces of resolved architecture that guide implementation |

The accumulated pattern of these traces collectively signals readiness — no central
checklist needed. The concept of a **stigmergic threshold** is key: just as a termite mound
reaches a critical mass of pheromone that triggers a new building phase, a documentation
corpus reaches a critical mass of coherent, reviewed artifacts that signals implementation
readiness.

**Kanban/Pull systems** (Anderson, Ohno): In pull systems, downstream demand authorizes
upstream action. "Stop starting, start finishing." Readiness is a *system property* (is the
downstream stage ready to absorb this?), not an *item property* (has this item checked all
boxes?). Documentation readiness is a pull signal from implementation needs, not a push from
completed checklist items.

### Theme C: The Readiness-Decisions Relationship

The research resolves the readiness vs. decisions question:

**Readiness is not a separate artifact — it's a view over the accumulated decision stream.**
Mintzberg showed that strategy is a retrospectively recognized pattern in decisions. Weick
showed that coherence is constructed through sensemaking over actions taken. The pipeline's
decisions log, research docs, proposals, and reviews ARE the readiness signal — they just
need a lens to be viewed through.

This means:
- No separate READINESS.md file needed
- Instead, a **sensemaking instrument** — a way to project the accumulated artifact history
  into an area coverage view
- The projection can be automated: "Which areas have deliberate decisions? Which have only
  presets? Which haven't been discussed?" — derived from existing artifacts
- At bootstrap, the projection is thin (mostly presets) — this is honest. Over time, it
  fills in as decisions accumulate — this is emergent.

**The hybrid position** (supported by the Klein-Kahneman boundary condition):

1. **Lightweight structural scaffolding** for known-knowns — formatting, naming, required
   sections. Gawande's "checklist for the stupid but critical stuff."
2. **Emergent assessment for complex aspects** — coherence, completeness, architectural
   fitness. Klein's pattern recognition, Weick's retrospective sensemaking.
3. **Stigmergic trace accumulation** as the primary readiness signal — the presence and
   coherence of pipeline artifacts collectively indicate readiness.
4. **Pull-based flow** — work proceeds when downstream capacity and need exist, not when
   upstream checkboxes are satisfied.
5. **Analytical fallback for novel areas** — when practitioners lack experience with a
   domain, more structured assessment is appropriate (per Klein-Kahneman).

### Cognitive Load Design Principles

The cognitive science research (Sweller, Miller, Risko & Gilbert) yields specific design
principles for the parking mechanism:

1. **Cognitive offloading** (Risko & Gilbert, 2016): Externalizing information to the
   environment reliably improves performance by freeing working memory. The parking mechanism
   IS cognitive offloading — it converts internal memory burden into an external record.

2. **Working memory limits** (Miller, 1956; Sweller, 1988): Humans can concurrently process
   2-4 chunks. Unresolved findings consume these slots as *extraneous* cognitive load.
   Structured parking converts extraneous load into a manageable external reference.

3. **The trusted system** (Allen, GTD): The mind will keep cycling through incomplete tasks
   unless it trusts that they're captured in a reliable external system. The key word is
   *trust* — the system must be reliable and regularly reviewed, or the Zeigarnik Effect
   returns.

4. **Satisficing** (Simon, 1956): The cost of searching for the perfect solution often
   exceeds the benefit. ~80-90% of decisions have minor influence on outcomes. Reserve
   maximizing effort for the 10-20% that truly matter. The pipeline should help users
   distinguish high-stakes decisions (maximize) from low-stakes ones (satisfice).

5. **Choice overload** (Iyengar & Lepper, 2000): More options lead to worse decisions and
   lower satisfaction. The pipeline should constrain the visible option space at each phase
   rather than presenting all 29 modes simultaneously.

## Options Analysis

| Criterion | A: Linear Pipeline | B: Convergence Loop | C: Continuous Refinement | D: Guided Autonomy |
|-----------|-------------------|--------------------|--------------------------|--------------------|
| Works across spectrum | No — forces all projects through all stages | Partially — but convergence condition is hard | Yes — but provides no guidance | Yes |
| Prevents analysis paralysis | Yes (stages end) | No (main risk) | Yes (build first) | Yes (user decides) |
| Catches gaps early | Yes (sequential) | Yes (iterate) | No (gaps found during build) | Partially (readiness map warns) |
| Handles emergent complexity | Poorly (linear can't loop back) | Well (that's what it does) | Naturally (research as needed) | Well (classify and proceed) |
| Implementation complexity | Low | High (convergence criteria) | Low | Medium (readiness map) |
| User experience | Rigid, may feel slow | Uncertain, may feel stuck | Fast but risky | Clear, flexible, informative |

## Recommendations

### Primary Recommendation: Guided Autonomy (Model D)

The pipeline should adopt a **Guided Autonomy** model with three components:

**Component 1 — Intent Detection (at bootstrap)**

Add a single question to the bootstrap discovery conversation:

"What's your goal for this project?"
- **Ship fast** — get working software quickly (POC, prototype, side project)
- **Build for production** — quality, tested, maintainable code
- **Meet compliance** — regulatory or industry standards to satisfy
- **Explore** — understand a problem space, no implementation expected

This calibrates the entire pipeline: which areas appear in the readiness map, what risk
levels are assigned, and how aggressively the pipeline suggests research.

The intent can be changed at any time (via the project's decisions log). A "ship fast" project that gets
traction can upgrade to "build for production" — the readiness map recalibrates, and
newly-relevant areas appear.

**Component 2 — Readiness as Emergent Sensemaking Instrument**

The deep research (Theme B) resolves the prescriptive vs emergent question: **readiness is
emergent, not prescriptive.** Six independent frameworks (CAS, Cynefin, emergent strategy,
sensemaking, NDM, stigmergy) converge on this. A prescriptive checklist is a
complicated-domain tool applied to a complex-domain phenomenon (Snowden).

Instead of a READINESS.md file with pre-defined areas to fill in, the pipeline needs a
**sensemaking instrument** — a way to project the accumulated artifact history into an
area coverage view:

- **What areas have deliberate decisions?** (derived from decisions log, research docs) → covered
- **What areas have only preset defaults?** (derived from defaults sheet sources) → defaulted
- **What areas haven't been discussed?** (inferred from absence) → open
- **What areas have conflicting signals?** (detected from cross-referencing) → needs attention

This projection can be automated as a computed view over existing artifacts — no separate
file to maintain. At bootstrap, the projection is thin (mostly presets). Over time, it
fills in as decisions accumulate through research, design, and implementation. This is
honest: it shows what actually exists rather than what a template says should exist.

The Klein-Kahneman boundary condition applies: experienced practitioners will recognize
readiness patterns without the instrument (RPD model). For novel areas or new practitioners,
the instrument provides the analytical fallback.

**Component 2b — Structured Parking (D2 — UNDER REVISION)**

Any skill can park a discovery during work without derailing the current task. Findings are
classified (architectural / incremental / scope-expansion), recorded with enough context to
act on later, and queued.

The parking mechanism must satisfy two properties:
1. **Nothing gets lost** — every parked item is visible and retrievable
2. **Classification is clear** — the user can see at a glance what blocks progress vs
   what can wait

This addresses the FOMO problem that drives unstructured looping (Finding 5).

**UNDER REVISION**: The original D2 proposed extending Emerged Concepts. The user's intent
was to replace Emerged Concepts with a dedicated PARKING.md. Finding 9 raises a deeper
question: with 23 existing artifacts, where does parking live without adding to the
proliferation? See OQ1 (artifact rationalization) and OQ3 (growth management). The parking
*concept* is validated — the implementation vehicle is the open question.

**Component 2c — Document Rationalization (NEW — from Finding 9)**

Before adding any new tracking mechanisms, the existing 23 artifacts must be rationalized.
The CQRS principle (Finding 10, Pattern 4) demands: one authoritative data store, many
derived views. The current landscape has multiple independently-maintained files tracking
the same information — a structural source of drift.

This component must answer: which files hold unique state? Which are derived views that
should be computed, not maintained? What are the clear boundaries between files?
See OQ1 for detailed analysis.

**Component 3 — Advisory at transition points**

At key transition points (bootstrap → design, design → spec, spec → implementation),
the pipeline checks the readiness map and gives a one-time advisory. Never a hard gate.
Always the user's call.

The advisory follows the informed consent pattern:
1. Show current readiness state (the map)
2. Express an opinion on risk (which open/defaulted areas matter)
3. Suggest next actions (specific commands for the highest-value areas)
4. Let the user proceed at any time

### How This Manifests in the Skills

| Skill | Change | Purpose |
|-------|--------|---------|
| cl-researcher bootstrap | Add intent inference + confirmation (D3). Present concrete pipeline overview (OQ2). Fix STATUS.md writes (F8). | Entry point — establishes intent and orientation |
| cl-researcher (all modes) | Park findings with classification (D2). Fix STATUS.md write gaps (F8). | Structured parking + progress tracking |
| cl-designer (all modes) | Park findings with classification (D2). Fix conditional STATUS.md writes (F8). | Structured parking + design coverage |
| cl-implementer spec | Give readiness advisory before generating (OQ2). Support lightweight loops (D4). | Transition-point advisory |
| cl-implementer start | Give readiness advisory before task generation (OQ2). | Transition-point advisory |
| cl-implementer (all modes) | Fix missing STATUS.md writes for run/autopilot/verify (F8). | Implementation progress tracking |
| cl-reviewer review | Track contraction metrics (D6). | Review convergence |
| cl-reviewer audit | Include parking lot health in audit. Apply D5 hygiene rules. | System-wide health check |

**Note**: The specific tracking mechanisms (pulse log vs computed view vs filesystem scan)
depend on resolving OQ1 and OQ3. The table above describes *what* each skill needs to do,
not *how* the tracking is implemented.

### Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Document proliferation worsens** | High | High | Finding 9 is the top risk. Must consolidate before extending. OQ1 must be resolved first. |
| **UX remains abstract** | High | High | OQ2 demands concrete walkthroughs, not mechanism descriptions. Proposal must show what users see. |
| **Tracking files grow unbounded** | Medium | High | OQ3 — growth management strategy required. Computed views may be better than persistent logs. |
| Intent question feels bureaucratic | Medium | Low | Make it feel natural: infer from conversation, confirm conversationally. One reflection, not a form. |
| Readiness signal gives false confidence | Medium | Medium | Keep confidence levels visible. Never show ✅ for preset defaults — always 🔶. |
| STATUS.md adoption is the critical path | High | High | Finding 8 identifies 14 major gaps. Must be fixed regardless of tracking mechanism chosen. |
| Parking lot becomes a graveyard | Medium | Medium | D5's layered hygiene: pull-based surfacing + decay + soft WIP ceiling + architectural override. |
| Deduplication across files | Medium | Medium | OQ4 — need a clear strategy. ID-based linking is likely minimum viable approach. |
| Lightweight loops bypass necessary rigor | Low | High | Lightweight loops update existing artifacts. The review pipeline still catches inconsistencies. |

### Impact on System Docs

The proposal would change the following Clarity Loop skill artifacts:

| Artifact | Expected Changes |
|----------|-----------------|
| cl-researcher/references/bootstrap-guide.md | Add intent inference to discovery. Replace generic completion message with concrete pipeline overview (OQ2). |
| cl-researcher/SKILL.md | Add intent as a concept. Add structured parking protocol. Define lightweight loop process. |
| cl-implementer/SKILL.md | Add readiness advisory at spec and start mode entry points (OQ2). Support lightweight loops. |
| cl-designer/SKILL.md | Add structured parking for emergent findings during design. |
| cl-reviewer/SKILL.md | Add parking lot health + readiness analysis to audit mode. Add convergence tracking to review. |
| templates/status.md | Rationalize sections (OQ1). Fix gaps from Finding 8. Exact changes depend on OQ1/OQ3 resolution. |
| All skill references that touch STATUS.md | Standardize write operations. Fix the 14 "Major" gaps (Finding 8). Mechanism depends on OQ1/OQ3. |
| (possibly new) PARKING.md template | If OQ1 resolves to dedicated file. Replaces Emerged Concepts in STATUS.md. |
| (possibly new or revised) Snapshot/dashboard script | If OQ1/OQ3 resolve to computed views. Analogous to generate-system-context.js. |

**Open dependency**: The exact template changes and tracking mechanism depend on resolving
OQ1 (artifact rationalization), OQ2 (concrete UX), and OQ3 (growth management). The changes
above are directionally correct but the details will shift.

## Design Decisions

*Resolved from Design Explorations. Each decision includes the selected approach, rationale,
and prerequisites. Full options analysis is preserved in git history.*

---

### D1: Sensemaking Instrument — Direct Source File Reads (REVISED)

**Original**: Pulse log in STATUS.md + on-demand generated snapshot.

**Revised**: No pulse log. No STATUS.md as runtime artifact. Skills read their 2-3
relevant source files directly at session start. The source files (RESEARCH_LEDGER,
PROPOSAL_TRACKER, PARKING, DESIGN_PROGRESS, TASKS, DECISIONS) ARE the sensemaking
data — each is always current because it's the authoritative store.

An optional `generate-status.js` script can produce a human-readable dashboard on
demand, but no skill depends on it.

**Rationale**: The pulse log solved a problem (STATUS.md not getting updated) that
disappears when you eliminate STATUS.md and have skills read source files directly.
Source files can't drift from themselves. This also eliminates the coupling concern —
skills don't need to know a shared "pulse format," they just write to their own file.

---

### D2: Parking Lives in PARKING.md (Replaces Emerged Concepts) — REVISED

**Original**: Emerged Concepts extended to subsume parking.

**Revised**: Dedicated PARKING.md replaces Emerged Concepts entirely. Since STATUS.md is
eliminated as a runtime artifact (D1/D7), this is a clean separation — parking gets its
own file with clear ownership.

**Structure**:
- Active section (top): items with status `captured` or `picked-up`
- Resolved section (bottom): items with status `resolved`, `scoped`, `deferred`, `discarded`
- Classification column: `architectural` | `incremental` | `scope-expansion`
- Unique IDs: EC-NNN, cross-referenced by other files (D10)
- Skills check active section before inserting to prevent duplicates (D10)

**Template** (replaces Emerged Concepts from old STATUS.md):
```markdown
# Parking Lot

Findings, gaps, and ideas that surfaced during pipeline work. Classified by impact.
Skills check here before parking new items to prevent duplicates.

## Active

| # | Concept | Classification | Origin | Date | Impact | Notes |
|---|---------|---------------|--------|------|--------|-------|

## Resolved

| # | Concept | Classification | Origin | Date | Resolution | Resolved Date |
|---|---------|---------------|--------|------|------------|---------------|

**Classification**: `architectural` (blocks progress) | `incremental` (can wait) |
`scope-expansion` (new feature idea)
**Status flow**: captured → picked-up → resolved / scoped / deferred / discarded
```

---

### D3: Intent Detection — Infer From Conversation + Confirm

**Selected**: Option D — Infer intent from the bootstrap discovery conversation, then
confirm explicitly with the user.

The "intent question" isn't a cold menu selection — it's a reflection of what the AI
understood from the conversation:

"From what you've described — a notes app for personal use, shipping this weekend — this
sounds like a **ship fast** project. That means I'll use sensible defaults everywhere and
skip suggesting design or security research. Want me to adjust that?"

Intent can shift mid-project without restarting. If the user says "actually this is going
to be a product eventually," the intent shifts to Quality and the readiness picture
recalibrates.

---

### D4: Loop Calibration — Risk-Driven With Compression + Deming Anti-Tampering

**Selected**: Option D — Risk-driven loop sizing with experience-based compression over time.

| Risk Level | Signal | Loop Type | Ceremony |
|------------|--------|-----------|----------|
| Low | Typo, formatting, minor clarification | Direct fix | No ceremony |
| Medium | Single-section update, new edge case | Lightweight | Update + targeted re-review |
| High | Cross-doc impact, architectural change | Full cycle | Research → proposal → review |
| Critical | Fundamental assumption invalidated | Full cycle + advisory | Research + user decision |

**Compression**: For areas that have been through multiple full cycles without issues,
automatically downgrade the default risk assessment by one level. User can always override.

**Deming safeguard**: If a lightweight loop produces an error caught in review, don't
upgrade ALL future loops to full cycles (that's tampering with a stable process). Only
upgrade if there's a pattern — multiple lightweight loops failing for the same structural
reason.

---

### D5: Parking Lot Hygiene — Pull-Based + Decay + Soft Ceiling + Architectural Override

**Selected**: Option E — Layered approach combining four mechanisms:

1. **Primary — Pull-based surfacing**: Parked items appear when the user enters a skill
   that could address them. Items are pulled by context, not pushed by age.

2. **Secondary — Stigmergic decay**: Unreferenced items fade over time. Items referenced
   by multiple skills get reinforced (strength increases). Items below threshold move to
   an archive section — still accessible but no longer actively surfaced.

3. **Safety valve — Soft WIP limit**: At 15 items, suggest triage but don't block. At 25,
   require triage before parking anything new.

4. **Override — Age-based escalation for architectural items only**: Architectural findings
   are too important to let fade. Re-surfaced with emphasis after 3 days or 2 skill
   transitions, regardless of decay.

---

### D6: Review Convergence — Count + Severity + Deming Ceiling + Intent Calibration

**Selected**: Option D — Multi-dimensional convergence tracking:

- Track both raw issue count and severity-weighted sum per review round
- Expect contraction (decreasing per round) — if ratio > 1 between any two rounds, flag
  structural problem
- After round 3, trigger the Deming question regardless of issue count: "Is the problem
  with the proposal, or with the process that produced it?"
- Epsilon thresholds calibrated by project intent:

| Intent | Epsilon (max weighted issues to APPROVE) |
|--------|------------------------------------------|
| Ship | 4 (allow some major issues) |
| Quality | 2 (only minor issues) |
| Rigor | 0 (zero tolerance) |

- Extend the reviewer's existing cumulative issue ledger with contraction metrics

## Resolved Design Questions

*These questions emerged from user feedback on the first proposal attempt and from Findings
9-10. Resolved through discussion.*

### D7: Document Rationalization — Normalized Source Files, No STATUS.md

**Problem**: 23 tracking artifacts with significant overlap (Finding 9). The first proposal
added more without consolidating.

**Resolution**: Apply database normalization. Each file = one table with one primary concern.
No redundant data. Cross-references use IDs. STATUS.md eliminated as runtime artifact.

**Final file schema** (6 source files):

| File | Primary Key | Owns | Boundary Rule |
|------|-------------|------|---------------|
| DECISIONS.md | Decision ID | All decisions with rationale | System-wide choices only |
| RESEARCH_LEDGER.md | R-NNN | Research cycles + Research Queue | Planning and tracking research |
| PROPOSAL_TRACKER.md | P-NNN | Proposal lifecycle | Tracking proposals through review |
| PARKING.md | EC-NNN | Discovered items with classification | Replaces Emerged Concepts |
| DESIGN_PROGRESS.md | (singleton) | Design session state | Session-scoped design tracking |
| TASKS.md | T-NNN | Implementation tasks + session state | Absorbs IMPLEMENTATION_PROGRESS.md |

**Skills read source files directly** (2-3 per skill at session start):

| Skill | Reads | Writes |
|-------|-------|--------|
| cl-researcher | DECISIONS, RESEARCH_LEDGER, PARKING | RESEARCH_LEDGER, PARKING, DECISIONS |
| cl-designer | DECISIONS, DESIGN_PROGRESS, PARKING | DESIGN_PROGRESS, PARKING, DECISIONS |
| cl-implementer | DECISIONS, TASKS, PARKING | TASKS, PARKING, DECISIONS |
| cl-reviewer | DECISIONS, PROPOSAL_TRACKER, PARKING | PROPOSAL_TRACKER, PARKING, DECISIONS |

**STATUS.md becomes optional computed view**: A `generate-status.js` script can produce a
dashboard snapshot for human consumption. No skill depends on it.

**Research Queue moves to RESEARCH_LEDGER.md** — same concern (research planning + tracking)
in one file.

**Rationale**: A materialized view file can't be computed on-read like a database view. It
requires physical regeneration, which wastes tokens and creates staleness. Reading 2-3
source files directly is cheaper and always current.

---

### D8: Concrete UX — Four Moments of Guidance

**Problem**: The first proposal described mechanisms but not experience. "Guided autonomy"
was a label, not a UX.

**Resolution**: Guidance manifests at 4 specific moments. No new files or mechanisms — these
are changes to SKILL.md session-start sections and mode-completion messages.

**Moment 1 — Post-bootstrap**: Intent-aware, project-specific next steps. The AI already
knows the project type, discovered scope, and confirmed intent. The completion message
reflects all three:
- Ship → suggest going straight to specs (or design if UI)
- Quality → suggest 2-3 key research topics + design, then specs
- Rigor → suggest comprehensive research before implementation
- Explore → suggest diving into the most interesting research question

**Moment 2 — Session start**: 2-3 sentence orientation from the source files the skill
reads. Not a dashboard dump — a brief "here's where things stand."

**Moment 3 — Transition advisory**: Brief area coverage before spec/start, calibrated by
intent. Ship intent skips the advisory unless architectural parking items exist. Rigor
intent highlights gaps and suggests addressing them. Always non-blocking.

**Moment 4 — "What next?"**: One prioritized suggestion based on parking (architectural
items first) + intent + current state. The pipeline takes a position, not presents a menu.

**Intent determines the default path**:

| Intent | Default flow after bootstrap |
|--------|------------------------------|
| Ship | → spec → start (skip research/design) |
| Quality | → design (if UI) → key research → spec → start |
| Rigor | → all research → design → spec → start |
| Explore | → research (no implementation path) |

---

### D9: Growth Management — Active/Resolved Sections

**Problem**: Files that accumulate items (PARKING, TASKS, DECISIONS) could grow unbounded.

**Resolution**: Two-section layout. Active items on top, resolved/completed below a divider.
Skills read the active section at session start. The resolved section is reference material,
read only on demand.

No archiving scripts. No cleanup mechanisms. Just a file organization convention that keeps
the "hot" section small and fast to read.

**Growth assessment**: Most files are naturally bounded (RESEARCH_LEDGER ~100 lines,
PROPOSAL_TRACKER ~75 lines, DESIGN_PROGRESS ~50 lines). The three that grow (DECISIONS,
PARKING, TASKS) are manageable — even at 500-800 lines, reading the active section at
session start costs ~1000-2000 tokens. Not expensive.

---

### D10: Deduplication — IDs as Foreign Keys

**Problem**: Same concept could appear in multiple tracking files.

**Resolution**: Database normalization. Each item has a unique ID within its file (EC-NNN,
R-NNN, P-NNN, T-NNN). Cross-file references use IDs, not content copies.

- Skills check PARKING.md active section before inserting (prevent duplicates)
- Lifecycle transitions are state changes, not copies: EC-003 in parking → status becomes
  `scoped` → R-005 in ledger references EC-003 → research doc is created
- Research docs can discuss parked items in depth — that's not duplication, it's the work

---

### D11: Naming Convention — Consistent Scheme

**Problem**: Inconsistent naming across pipeline artifacts. Mix of prefix/suffix conventions,
some files have IDs and some don't.

**Resolution**: Normalized naming scheme across all directories.

**Rules**:
1. All names use SCREAMING_SNAKE_CASE
2. Content files get sequential ID prefixes matching their tracker
3. Review artifacts reference the content file's ID
4. IDs use hyphens (R-001), names use underscores (PIPELINE_EXECUTION)
5. Singleton tracking files don't need IDs

**Convention by directory**:

| Directory | Pattern | Example |
|-----------|---------|---------|
| docs/research/ | `R-NNN-TOPIC.md` | `R-001-PIPELINE_EXECUTION_MODEL.md` |
| docs/proposals/ | `P-NNN-TOPIC.md` | `P-001-GUIDED_AUTONOMY.md` |
| docs/specs/ | `TOPIC_SPEC.md` | `TEST_SPEC.md`, `SECURITY_SPEC.md` |
| docs/specs/ | `TASKS.md` | (singleton) |
| docs/reviews/proposals/ | `REVIEW_P-NNN_vN.md` | `REVIEW_P-001_v1.md` |
| docs/reviews/proposals/ | `VERIFY_P-NNN.md` | `VERIFY_P-001.md` |
| docs/reviews/audit/ | `AUDIT_YYYY-MM-DD.md` | `AUDIT_2026-02-12.md` |
| docs/reviews/design/ | `DESIGN_REVIEW_YYYY-MM-DD.md` | `DESIGN_REVIEW_2026-02-12.md` |
| docs/ (tracking) | `NAME.md` | `DECISIONS.md`, `PARKING.md` |
| docs/designs/ | `DESIGN_PROGRESS.md` | (singleton) |

**ID allocation**: Skills assign the next sequential ID when creating files. RESEARCH_LEDGER
and PROPOSAL_TRACKER are authoritative for ID sequences.

## ~~ Design Explorations (Archived) ~~

*The following options were explored during research. Design Decisions above record the
selected approaches. This section is preserved for reference and can be removed after
proposal generation.*

### Q1: How Should the Sensemaking Instrument Be Implemented?

The research establishes that readiness is a computed view over accumulated artifacts. But
how does the user actually see and interact with it?

**Option A — Generated snapshot (like the system context cache)**

A script scans `{docsRoot}/` and produces a summary file on demand. Similar to how
`generate-system-context.js` already works. The snapshot is regenerated at transition
points (end of bootstrap, before spec generation, before implementation).

```
{docsRoot}/.readiness-snapshot.md   (gitignored, generated)
```

The snapshot would contain:
- Areas with deliberate decisions (source: decisions log, research docs)
- Areas with only preset defaults (source: defaults sheet attributions)
- Areas with conflicting signals (source: cross-referencing)
- Parked items summary (source: parking lot)

*Tradeoffs*: Simple to implement. Trustworthy (it's computed from real data, not
manually maintained). But requires explicit regeneration — it can go stale between
transition points, which undermines the GTD trust property.

**Option B — Skills update a living section as a side effect**

Each skill, when it completes a mode, appends a line to a "Project Pulse" section in
STATUS.md. No separate file. The section accumulates naturally:

```markdown
## Project Pulse

| Date | Event | Area | Signal | Source |
|------|-------|------|--------|--------|
| 2026-02-12 | Bootstrap complete | Architecture | ✅ Generated | PRD + ARCHITECTURE |
| 2026-02-12 | Bootstrap complete | Security | 🔶 Preset default | Defaults sheet |
| 2026-02-13 | Research complete | Security | ✅ Researched | SECURITY_MODEL.md |
| 2026-02-14 | Design complete | UI | ✅ Designed | DESIGN_SYSTEM.md |
| 2026-02-14 | Design finding | Data model | ⚠️ Gap found | Parked: P-003 |
```

The readiness picture is the *latest signal per area* — a simple group-by. The pulse log
itself is the Mintzberg "stream of decisions" made visible. Reading the table top-to-bottom
tells you the project's story.

*Tradeoffs*: Always up-to-date (no regeneration needed). Tells a narrative (the history
is visible, not just the current state). But requires every skill to know about the pulse
format — a coupling concern. And the table grows indefinitely.

**Option C — Dynamic projection at transition points (no persistence)**

The instrument exists only in the moment. When the user runs `/cl-implementer spec` or
any transition-point command, the skill reads existing artifacts, computes the readiness
picture, and presents it inline — then it's gone. No file persisted.

*Tradeoffs*: Simplest implementation. No maintenance. But no trust property — the user
can't "check on readiness" outside of a transition. If you can't see it, you can't trust
it. Violates the GTD "trusted system" requirement.

**Option D — Hybrid: Living pulse + generated snapshot**

Combine B and A. Skills append events to the pulse log (always current, tells the story).
A script can be run anytime to generate a snapshot from the pulse log (for a clean summary
view). The pulse IS the source of truth; the snapshot is the rendered view.

The pulse log solves the trust problem (it's always there, always current). The snapshot
solves the "too much detail" problem (it aggregates the pulse into a clean summary).

*This is the combination I'd lean toward.* The pulse log is the stigmergic trace — each
skill leaves a mark. The snapshot is the sensemaking instrument — it makes the pattern
visible.

**Option E — Embedded in the decisions log itself**

Don't create a new artifact at all. Extend the decisions log format to include an "area"
tag per decision. Readiness is computed by grouping decisions by area. If a decision exists
for "Security" with source "research," that area is covered. If no decision exists for
"Testing," that area is open.

*Tradeoffs*: Maximum reuse of existing infrastructure. No new files, no new formats.
But decisions don't capture everything — a completed design pass isn't a "decision" in the
traditional sense. And not all pipeline events produce decisions (e.g., a bootstrap preset
default isn't a decision, it's the *absence* of one).

---

### Q2: Where Does the Parking Lot Live?

**Option A — Dedicated PARKING.md**

```markdown
# Parking Lot

## Architectural (blocks progress if unresolved)

### P-001: Data model doesn't support real-time sync
- **Found during**: /cl-designer mockups (screen 4)
- **Classification**: Architectural
- **Impact**: Requires schema change before real-time features can be implemented
- **Next action**: Research cycle on real-time data patterns
- **Status**: Parked | Picked up | Resolved
- **Parked**: 2026-02-14

## Incremental (can be addressed later)

### P-002: Dark mode token variants
...

## Scope Expansion (new feature ideas)

### P-003: Push notifications
...
```

*Tradeoffs*: Dedicated, visible, easy to find. Satisfies GTD trust. But it's another
file to maintain, and there's overlap with the existing Emerged Concepts table.

**Option B — Unified section in STATUS.md**

Merge the parking lot into STATUS.md as a "Parked Findings" section. STATUS.md already
tracks pipeline state — parked items are part of that state.

*Tradeoffs*: No new file. Natural fit. But STATUS.md can get large. And STATUS.md
is typically pipeline-managed — adding user-facing content (parked findings they need
to review) mixes concerns.

**Option C — Absorb into existing Emerged Concepts + Decisions**

Don't create a parking lot. Instead:
- **Scope expansion** → Emerged Concepts table (already exists)
- **Architectural findings** → Decisions log with status "PENDING" and classification tag
- **Incremental findings** → Backlog items in the task breakdown (DESIGN_TASKS or similar)

*Tradeoffs*: Maximum reuse. No new infrastructure. But the unified view is lost — the
user has to check three places. This violates the core requirement (single view for
cognitive offloading).

**Option D — PARKING.md that subsumes Emerged Concepts**

The Emerged Concepts table is really a special case of parking (scope expansion type).
Instead of adding a parking lot alongside Emerged Concepts, replace Emerged Concepts with
a richer parking lot that handles all three types. The parking lot becomes the single
place for "things discovered during work that aren't being addressed right now."

*This feels cleanest.* It reduces the number of tracking artifacts rather than adding
one. The emerged concepts pattern already works — extend it rather than creating something
parallel.

**Option E — Combination: PARKING.md + Pulse log integration**

Parked items live in PARKING.md (the trusted system). When a skill parks something, it
also appends a pulse log entry (from Q1 Option B). When a parked item is picked up, the
pulse log records that too. The parking lot is the detail view; the pulse log is the
timeline view.

---

### Q3: How Does Intent Interact With Presets?

**Option A — Intent replaces the preset question entirely**

Remove the current preset selection (Web App, API, CLI, Library, Prototype). Instead,
detect project *type* automatically from code/config and ask only about *intent*. The
preset defaults are derived from type + intent:

```
Type: Web App (auto-detected from Next.js in package.json)
Intent: Quality (user selected "build for production")
→ Preset derived: Web App × Quality = standard security, testing required,
  design recommended, accessibility AA
```

*Tradeoffs*: Cleaner UX (one question instead of two). But auto-detection of type
isn't always possible (greenfield projects have no code to detect from). And some
projects genuinely need manual type selection.

**Option B — Intent layers on top of presets**

Keep the preset question. Add intent as a separate question. Intent modifies the
preset's defaults:

```
Preset: Web App (user selected) → generates baseline defaults
Intent: Ship fast (user selected) → relaxes defaults (skip design, minimal security)
Intent: Meet compliance → tightens defaults (require security research, full testing)
```

Conflicts are resolved by intent winning: if the Prototype preset says "skip testing"
but the intent says "meet compliance," compliance wins.

*Tradeoffs*: Most flexible. Handles all cases including greenfield. But two questions
in bootstrap — potentially confusing. "Isn't Prototype already 'ship fast'?"

**Option C — Intent is inferred from discovery conversation, not asked**

Don't ask about intent explicitly. Infer it from the discovery conversation signals:

- User mentions "deadline," "demo," "weekend project" → Ship
- User mentions "production," "users," "scale" → Quality
- User mentions "HIPAA," "compliance," "audit" → Rigor
- User is exploring a problem with no clear build target → Explore

The inferred intent is shown to the user for confirmation: "Based on our conversation,
this sounds like a production-quality build. That means I'll recommend researching
security and testing before implementation. Sound right?"

*Tradeoffs*: Most natural UX — no explicit question needed. Feels conversational.
But inference can be wrong, and wrong inference silently miscalibrates the pipeline.
Requires the bootstrap discovery to be rich enough to yield signal.

**Option D — Combination: Infer from conversation + confirm explicitly**

Use Option C's inference but always confirm. The "intent question" isn't a cold question
from a menu — it's a reflection of what the AI understood from the conversation:

"From what you've described — a notes app for personal use, shipping this weekend — this
sounds like a **ship fast** project. That means I'll use sensible defaults everywhere and
skip suggesting design or security research. Want me to adjust that?"

If the user says "actually this is going to be a product eventually," the intent shifts to
Quality without restarting.

*This is the combination I'd lean toward.* It preserves the conversational feel while
getting explicit confirmation. The intent isn't a bureaucratic form field — it's a shared
understanding.

---

### Q4: What Distinguishes a Lightweight Loop From a Full Research Cycle?

**Option A — Artifact creation as the boundary**

Simple rule: if the loop requires creating a *new* artifact (new research doc, new
proposal), it's a full cycle. If it requires *updating* an existing artifact, it's a
lightweight loop.

- Full cycle: "We need a security model" → new research doc → proposal → review → merge
- Lightweight: "The security model needs to account for OAuth" → update existing security
  research → update proposal → quick re-review → merge update

*Tradeoffs*: Clean, easy to reason about. But some updates are substantial enough that
they deserve full ceremony (e.g., rewriting an entire section of ARCHITECTURE.md after
discovering a fundamental flaw).

**Option B — Risk-driven precision (Boehm)**

The rigor of the loop matches the risk of getting it wrong:

| Risk Level | Signal | Loop Type | Ceremony |
|------------|--------|-----------|----------|
| Low | Typo, formatting, minor clarification | Direct fix | No ceremony — just fix it |
| Medium | Single-section update, new edge case | Lightweight | Update artifact + targeted re-review |
| High | Cross-doc impact, architectural change | Full cycle | New research → proposal → full review |
| Critical | Fundamental assumption invalidated | Full cycle + advisory | Research + explicit user decision point |

Risk is assessed by blast radius (how many docs/sections affected) × reversibility (how
hard to undo if wrong).

*Tradeoffs*: Most nuanced. Handles the full spectrum. But requires judgment to assess
risk level — different practitioners will assess differently.

**Option C — Boyd's loop compression (experience-based)**

Experienced practitioners can compress the loop. The full ceremony exists as the
analytical fallback. As a practitioner builds familiarity with a codebase/project, they
earn implicit authority to take faster paths:

- First time touching security docs → full cycle
- Third time updating the same security section → lightweight loop
- Tenth time → direct fix with post-hoc review

The pipeline tracks how many times each area has been through the full cycle. After N full
cycles, it stops suggesting full ceremony for that area unless the change is structural.

*Tradeoffs*: Elegant theory. Matches how humans actually develop expertise (Klein's RPD).
But "experience" in an AI pipeline is tricky — does the pipeline remember how many times
it's processed security updates? The trust model is different from human expertise.

**Option D — Combination: Risk-driven with compression over time**

Start with Option B (risk-driven). Layer on Option C's compression: for areas that have
been through multiple full cycles without issues, automatically downgrade the default risk
assessment by one level. The user can always override.

Additionally, borrow the **Deming principle**: if a lightweight loop produces an error that
gets caught in review, don't upgrade ALL future loops to full cycles (that's tampering with
a stable process). Only upgrade if there's a pattern (multiple lightweight loops failing
for the same reason).

---

### Q5: How to Prevent the Parking Lot From Becoming a Graveyard?

**Option A — Pull-based surfacing at transition points**

Parked items are surfaced when the user enters a skill that could address them:

- User runs `/cl-implementer spec` → "3 parked items relate to implementation:
  P-001 (architectural: data model gap), P-004 (incremental: error messages),
  P-007 (incremental: loading states). P-001 may affect spec generation. Address
  it now, or proceed with current model?"

Items are pulled by context, not pushed by age. This is Kanban's pull principle.

*Tradeoffs*: Contextually relevant (you only see items when you can act on them).
But items parked in areas that are never revisited will never surface.

**Option B — Age-based escalation**

Parked items have a "freshness" timer based on their classification:

| Classification | Escalation threshold | Action |
|---------------|---------------------|--------|
| Architectural | 3 days or 2 skill transitions | Re-surface with emphasis |
| Incremental | 7 days or 5 skill transitions | Gentle reminder |
| Scope expansion | 14 days | "Still relevant? Keep / discard / promote to research" |

*Tradeoffs*: Ensures nothing stays parked forever. But the timers are arbitrary, and
nagging erodes trust in the system.

**Option C — WIP limits on parked items**

Borrow from Kanban: set a maximum number of parked items (e.g., 10). When the parking lot
is full, the user must triage before parking anything new:

"The parking lot has 10 items. To park this new finding, review the current items and
either: resolve one, discard one, or promote one to a research topic."

*Tradeoffs*: Forces periodic triage. Prevents unbounded growth. But the limit is
artificial — sometimes you legitimately have 15 parked items.

**Option D — Stigmergic decay (pheromone evaporation)**

In ant colonies, pheromone trails evaporate over time. Trails that are reinforced by
multiple ants persist; trails that aren't fade. Apply the same principle: parked items
start with a "strength" based on their classification. Each skill transition that
*doesn't* reference the item reduces its strength. Items that drop below a threshold get
moved to an "archive" section — still accessible but no longer actively surfaced.

Items that are referenced by multiple skills (e.g., the same architecture gap noticed by
both designer and implementer) get *reinforced* — their strength increases and they
surface more prominently.

*Tradeoffs*: Elegant, self-organizing. The most important items naturally float to the
top (reinforced by multiple contexts). Unimportant items fade without anyone explicitly
deleting them. But it's the most complex to implement and hardest to reason about.

**Option E — Combination: Pull-based + decay + hard ceiling**

- **Primary**: Pull-based surfacing (Option A) — items appear when contextually relevant
- **Secondary**: Stigmergic decay (Option D) — unreferenced items fade over time
- **Safety valve**: Soft WIP limit (Option C) — at 15 items, suggest triage but don't
  block. At 25, require triage.
- **Override**: Age-based escalation (Option B) for architectural items only — these are
  too important to let fade.

---

### Q6: How to Calibrate Review Convergence?

**Option A — Issue count as the contraction metric**

Track the number of blocking issues per review round. Expect geometric decrease:

```
Round 1: 8 blocking issues
Round 2: 3 blocking issues (contraction ratio ~0.38)
Round 3: 1 blocking issue  (contraction ratio ~0.33)
Round 4: 0 blocking issues → APPROVE
```

If the count increases between rounds (contraction ratio > 1), something is structurally
wrong — the fixes are introducing new problems. Flag this: "Review round 3 found MORE
issues than round 2. This suggests the fixes are destabilizing other parts of the proposal.
Consider: (a) re-reading the full proposal for coherence, (b) splitting the proposal into
smaller pieces, or (c) re-running the research phase."

**Option B — Severity-weighted convergence**

Not all issues are equal. Weight them:

| Severity | Weight | Example |
|----------|--------|---------|
| Critical (architectural conflict) | 4 | Contradicts ARCHITECTURE.md |
| Major (logical gap) | 2 | Missing error handling for a key flow |
| Minor (clarity, formatting) | 1 | Ambiguous wording in section 3 |

Track the weighted sum. Epsilon threshold by intent:

| Intent | Epsilon (max weighted issues to APPROVE) |
|--------|------------------------------------------|
| Ship | 4 (allow some major issues) |
| Quality | 2 (only minor issues) |
| Rigor | 0 (zero tolerance) |

*Tradeoffs*: More nuanced than raw count. But weighting is subjective.

**Option C — Deming-inspired: stop adjusting, change the system**

After 3 review rounds, regardless of issue count, step back and ask: "Is the problem
with the proposal, or with the process that produced it?"

```
Round 1-3: Fix issues in the proposal (normal operation)
Round 4+:  The review process itself may be the problem.
           Options:
           - Split the proposal (too much surface area for coherent review)
           - Re-run research (the research was insufficient)
           - Change the reviewer's focus (too many dimensions checked simultaneously)
           - Accept the current state (diminishing returns)
```

This applies Deming's funnel experiment: don't keep adjusting the proposal if the
underlying process (research quality, proposal scope) is the real issue.

**Option D — Combination: Count + severity + Deming ceiling**

- Track both raw issue count and severity-weighted sum
- Expect contraction (decreasing per round)
- If contraction ratio > 1 between any two rounds, flag structural problem
- After round 3, trigger the Deming question regardless of issue count
- Epsilon thresholds calibrated by project intent (Option B)
- The reviewer already tracks cumulative issue ledgers across re-reviews — extend
  this to include the contraction metrics

## References

### Companion Research

- `docs/research/PIPELINE_UX_PATTERNS.md` — UX patterns from GitHub Copilot Workspace, Cursor, Linear, Shape Up, and Claude Code session memory. Covers editable intermediates, status-as-side-effect, CQRS for tracking, minimum viable state, and anti-patterns.

### Methodology and Project Management

- [Shape Up: Stop Running in Circles and Ship Work that Matters](https://basecamp.com/shapeup) — Appetite concept for research convergence
- [Set Boundaries | Shape Up](https://basecamp.com/shapeup/1.2-chapter-03) — Appetite vs estimation
- [Definition of Ready as an Anti-Pattern | RGalen Consulting](https://rgalen.com/agile-training-news/2016/11/8/definition-of-ready-as-an-anti-pattern) — DoR critique
- [A Definition of Ready is an Anti-Pattern | Agileopedia](https://medium.com/agileopedia/a-definition-of-ready-is-an-anti-pattern-463e84463537) — Empiricism violation argument

### Cognitive Psychology

- Masicampo, E.J. & Baumeister, R.F. (2011). "Consider It Done! Plan Making Can Eliminate the Cognitive Effects of Unfulfilled Goals." *Journal of Personality and Social Psychology*, 101(4), 667-683. — **Key finding: plans neutralize the Zeigarnik Effect**
- Zeigarnik, B. (1927). "On Finished and Unfinished Tasks." *Psychologische Forschung*, 9, 1-85. — Incomplete tasks consume working memory
- Gollwitzer, P.M. (1999). "Implementation Intentions: Strong Effects of Simple Plans." *American Psychologist*, 54(7), 493-503. — If-then planning shields current goal striving
- Sweller, J. (1988). "Cognitive Load During Problem Solving." *Cognitive Science*, 12(2), 257-285. — Cognitive Load Theory
- Miller, G.A. (1956). "The Magical Number Seven." *Psychological Review*, 63(2), 81-97. — Working memory capacity
- Risko, E.F. & Gilbert, S.J. (2016). "Cognitive Offloading." *Trends in Cognitive Sciences*, 20(9), 676-688. — Externalizing cognition to reduce load

### Decision Theory and Behavioral Economics

- Kahneman, D. & Tversky, A. (1979). "Prospect Theory: An Analysis of Decision under Risk." *Econometrica*, 47(2), 263-292. — Loss aversion (~2x asymmetry)
- Simon, H.A. (1956). "Rational Choice and the Structure of the Environment." *Psychological Review*, 63(2), 129-138. — Satisficing under bounded rationality
- Schwartz, B. (2004). *The Paradox of Choice*. — Maximizers vs satisficers
- Iyengar, S.S. & Lepper, M.R. (2000). "When Choice is Demotivating." *JPSP*, 79(6), 995-1006. — Choice overload
- Arkes, H.R. & Blumer, C. (1985). "The Psychology of Sunk Cost." *OBHDP*, 35(1), 124-140. — Sunk cost fallacy in continuation decisions

### Complexity Science and Emergence

- Holland, J.H. (1995). *Hidden Order: How Adaptation Builds Complexity*. — Complex adaptive systems
- Snowden, D.J. (1999). Cynefin framework. — Complex vs complicated domains
- Mintzberg, H. & Waters, J.A. (1985). "Of Strategies, Deliberate and Emergent." *Strategic Management Journal*. — Strategy as pattern in decisions
- Weick, K.E. (1995). *Sensemaking in Organizations*. Sage. — Retrospective coherence construction

### Naturalistic Decision Making

- Klein, G. (1998). *Sources of Power: How People Make Decisions*. MIT Press. — RPD model
- Kahneman, D. & Klein, G. (2009). "Conditions for Intuitive Expertise: A Failure to Disagree." *American Psychologist*. — Boundary between valid intuition and bias

### Stigmergy and Coordination

- Grassé, P.P. (1959). Coined "stigmergy" — indirect coordination through environmental traces
- Elliott, M. *Stigmergic Collaboration: A Theoretical Framework for Mass Collaboration*. University of Melbourne. — Digital stigmergy
- Zheng et al. (2023). "Stigmergy in Open Collaboration." *Journal of Management Information Systems*. — Empirical validation in Wikipedia

### Engineering and Convergence Models

- Boehm, B. (1986). "A Spiral Model of Software Development and Enhancement." *IEEE Computer*. — Risk-driven convergence
- Boyd, J. (1976). *Destruction and Creation*. — OODA loop, tempo, implicit guidance
- Goldratt, E.M. (1984). *The Goal*. — Theory of Constraints, Five Focusing Steps
- Deming, W.E. (1993). *The New Economics*. — PDSA cycle, funnel experiment, tampering
- Beer, S. (1972). *Brain of the Firm*. — Viable System Model, System 2 damping
- Ashby, W.R. (1956). *An Introduction to Cybernetics*. — Law of Requisite Variety
- Wiener, N. (1948). *Cybernetics*. — Negative feedback, damping ratios

### UX and Tool Design

- GitHub Copilot Workspace (2024-2025) — Editable intermediates, stepper panel model, brainstorm agent
- Linear (linear.app) — Minimum viable tracking (title + status), automatic status advancement, time-in-status
- Shape Up, Basecamp (2019) — Hill charts (uncertainty tracking), appetite, fixed-time/variable-scope
- Cursor Composer (2025-2026) — Speed-first implicit planning, parallel agent execution
- CQRS (Command Query Responsibility Segregation) — One authoritative store, many read views
- Risko, E.F. & Gilbert, S.J. (2016). "Cognitive Offloading." *Trends in Cognitive Sciences* — Externalizing cognition
- Anthropic (2026). "Eight Trends Defining How Software Gets Built" — Orchestrator role, autonomous checkpoints

### Mathematics

- Banach, S. (1922). Banach Fixed-Point Theorem. — Contraction mapping convergence conditions
- Gawande, A. (2009). *The Checklist Manifesto*. — Checklists for simple/complicated, not complex
