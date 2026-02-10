## Bootstrap Guide

Bootstrap mode creates the initial system documentation for a project. This is the entry
point for both greenfield projects (no docs exist) and brownfield projects (existing code
and/or existing docs need to be organized into the Clarity Loop structure).

### When to Use

Bootstrap triggers when:
- The user says "bootstrap", "set up docs", "initialize docs", "create initial docs"
- `docs/system/` is empty (no `.md` files beyond `.manifest.md` and `.pipeline-authorized`)
- The user is a new Clarity Loop adopter and asks "how do I start?"

### Detection

Check `docs/system/` for existing `.md` files (excluding `.manifest.md`):
- **No docs found** → greenfield or brownfield-with-code path
- **Docs found** → the project already has system docs, bootstrap isn't needed. Suggest
  the normal pipeline (research → proposal → review → merge) instead.

If `docs/system/` doesn't exist at all, run `node init.js` first to scaffold the directory
structure and tracking files.

---

### Greenfield Bootstrap (No Existing Docs or Code)

For a brand-new project where nothing exists yet.

#### Step 1: Scaffold

Check if tracking files exist (`docs/RESEARCH_LEDGER.md`, `docs/PROPOSAL_TRACKER.md`,
`docs/STATUS.md`). If not, tell the user to run `node init.js` first, or offer to run it.

#### Step 2: Discovery Conversation

Have a genuine conversation with the user to understand the project:

**Start with:**
- What does this project do? What problem does it solve?
- Who is it for? (users, developers, internal teams)
- What are the key components or subsystems?
- What's the tech stack?

**Then dig deeper:**
- What are the main workflows or user journeys?
- Are there external integrations or dependencies?
- What are the key architectural decisions already made?
- Are there performance, security, or compliance requirements?
- What's the scope? What's explicitly out of scope?

**Throughout:**
- Summarize your understanding periodically
- Surface any contradictions or gaps
- Don't rush — the quality of initial docs depends on getting the picture right

#### Step 3: Suggest Initial Doc Set

Based on the conversation, suggest which system docs to create. Don't default to a fixed
template — the doc set should reflect what the project actually needs.

Common starting sets (adapt based on project):

| Project Type | Typical Initial Docs |
|-------------|---------------------|
| **API/backend service** | PRD, ARCHITECTURE, API_DESIGN, DATA_MODEL |
| **Full-stack app** | PRD, ARCHITECTURE, TDD (or FRONTEND_DESIGN), DATA_MODEL |
| **Library/SDK** | PRD, API_DESIGN, USAGE_GUIDE |
| **Infrastructure/platform** | PRD, ARCHITECTURE, OPERATIONS, SECURITY |
| **Documentation-heavy** | PRD + domain-specific docs |

Present the suggestion: "Based on what you've described, I recommend starting with these
system docs: [list with one-line descriptions]. Does this cover the key aspects, or should
we add/remove any?"

The user confirms, modifies, or rejects.

#### Step 4: Create Authorization Marker

Write `docs/system/.pipeline-authorized`:

```
operation: bootstrap
source: genesis
authorized_by: user
timestamp: [ISO 8601]
```

#### Step 5: Generate Initial System Docs

For each doc in the approved set, generate it in `docs/system/`. Each doc should:
- Be substantive but not exhaustive — capture what's known, mark what isn't
- Use `[TBD]` or `[To be researched]` for areas that need more investigation
- Include cross-references to related docs in the initial set
- Follow the project's conventions (Mermaid for diagrams, etc.)

These are starting points, not final docs. The normal pipeline (research → proposal →
review → merge) handles subsequent changes.

#### Step 6: Clean Up

1. Remove `docs/system/.pipeline-authorized`
2. The PostToolUse hook will auto-generate `.manifest.md`
3. Update `docs/STATUS.md` — note that bootstrap was completed, list the initial docs

Tell the user: "Initial system docs created in `docs/system/`. You can now use the normal
pipeline for changes — `/doc-researcher research 'topic'` to research, then proposal and
review to refine."

---

### Brownfield Bootstrap — Existing Docs

For projects that already have documentation — whether organized project docs, scattered
markdown files, a wiki export, README-driven docs, or research generated in ChatGPT/Claude.

#### Step 1: Discover Existing Docs

Ask the user where their existing docs are, or detect them:
- Markdown files in the project root or a `docs/` directory (outside `system/`)
- README.md with substantial content
- Wiki pages exported as markdown
- AI-generated research or specs (from ChatGPT, Claude, other tools)
- Any other documentation artifacts

Read and analyze the existing docs:
- What topics do they cover?
- What's the quality level? (rough notes vs. polished docs)
- Are there gaps?
- Is there redundancy or contradiction?
- How fresh are they? (recent AI conversation vs. months-old wiki)

#### Step 2: Choose Import Path

Present both options and let the user decide:

"I found existing documentation. How would you like to use it?"

**Path A — Import as system docs (fast, with audit)**:
Best when the user trusts the docs — recent AI-generated research, fresh project docs,
or content they've already vetted. The existing docs become the starting system docs, and
an immediate audit verifies quality.

**Path B — Import as research context (thorough, with regeneration)**:
Best when docs might be stale, incomplete, or of uncertain quality — old wikis, inherited
documentation, or rough notes. The existing docs go into `docs/research/` as reference
material, and bootstrap runs a conversation-driven regeneration that uses the old docs as
input but produces fresh system docs.

The user chooses which path based on their confidence in the existing material. If unsure,
Path B is safer — no stale claims sneak through.

#### Step 3A: Import Path — Migrate and Audit

For docs the user trusts:

1. Map the existing content to a proposed `docs/system/` structure:

```
Existing docs → Proposed system docs

README.md (overview section) → docs/system/PRD.md
README.md (architecture section) → docs/system/ARCHITECTURE.md
docs/api.md → docs/system/API_DESIGN.md
docs/deployment.md → docs/system/OPERATIONS.md
[no existing content] → docs/system/DATA_MODEL.md (gap — to be researched)
```

2. Present the mapping: "Here's how I'd reorganize your existing docs into the system doc
   structure. [N] docs can be adapted directly, [M] have gaps that need research. Does this
   mapping look right?"

3. Create `docs/system/.pipeline-authorized` with `operation: bootstrap, source: import`
4. For each mapping:
   - **Direct adaptation**: Copy content, clean up formatting, add cross-references
   - **Merge**: Combine multiple source docs into one system doc
   - **Gap**: Create a stub with `[To be researched]` markers
5. Remove the marker
6. Update tracking

7. **Immediately suggest an audit**: "System docs imported from existing documentation. I
   recommend running `/doc-reviewer audit` to verify quality — this catches AI
   hallucinations, stale claims, internal contradictions, and gaps. Want to run it now?"

Tell the user about gaps: "These areas have no existing documentation and will need
research cycles: [list]. You can start with `/doc-researcher research 'topic'` for any
of these."

#### Step 3B: Research Context Path — Ingest and Regenerate

For docs the user doesn't fully trust:

1. Copy existing docs into `docs/research/` with a clear prefix:
   - `docs/research/IMPORTED-original-name.md`
   - Add a header to each: "Imported from [source] on [date]. Used as research context
     for bootstrap — not a pipeline research doc."

2. Read all imported docs to build understanding of the project.

3. Run the standard discovery conversation (same as greenfield Step 2), but informed by
   the imported material. Reference what the old docs say:
   "Your existing docs describe [X] as using [Y]. Is that still accurate, or has this
   changed?"

4. Generate fresh system docs following greenfield Steps 3-6. The imported docs accelerate
   the conversation (you already know the domain) but the system docs are generated from
   the live conversation, not copy-pasted from potentially stale sources.

5. After generation, the imported docs in `docs/research/` remain as historical reference.
   They are NOT tracked in RESEARCH_LEDGER (they're not pipeline research docs).

---

### Brownfield Bootstrap — Existing Code, No Docs

For projects with a codebase but no documentation.

#### Step 1: Analyze the Codebase

Read key files to understand the project:
- Package files (package.json, Cargo.toml, go.mod, etc.) for dependencies and structure
- Entry points (main files, index files, app files)
- Directory structure for architectural patterns
- Config files for tech stack and tooling
- Test files for behavior documentation (tests are informal specs)

Build a mental model:
- What does this code do?
- What patterns does it use? (MVC, event-driven, microservices, etc.)
- What are the key abstractions?
- What external services does it interact with?

#### Step 2: Discovery Conversation

The code analysis gives you a starting point, but you still need the user's perspective.
Reference what you found in the code:

"From the codebase, I can see this is a [type] application using [stack]. It has [N] main
modules: [list]. I have some questions to fill in what the code doesn't tell me: [questions
about intent, constraints, future direction]."

This is a collaborative process — don't just auto-generate docs from code structure.

#### Step 3: Generate Docs

Follow the same process as greenfield Step 3-6, but informed by code analysis. The code
provides concrete details that a pure greenfield bootstrap wouldn't have:
- Actual file paths and module names
- Real dependencies and versions
- Existing patterns and conventions
- Integration points with external services

---

### Common Pitfalls

- **Don't generate everything at once.** Bootstrap creates a starting set. Detailed docs
  for specific subsystems should go through the normal pipeline.
- **Don't copy-paste code into docs.** Docs describe intent and architecture, not
  implementation details. Code changes; docs should be stable at a higher level.
- **Don't skip the conversation.** Even for brownfield with existing docs, talk to the user.
  Existing docs might be outdated, wrong, or reflect abandoned plans.
- **Don't over-document.** 3-5 well-written system docs are better than 15 stubs. Start
  small, expand through the pipeline.
