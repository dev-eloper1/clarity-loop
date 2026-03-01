# Shared Pipeline Context

Read this file once at the start of any skill session. It contains shared conventions,
configuration, state checks, and protocols used by all skills.

## Configuration

Read `.clarity-loop.json` from the project root. Use the `docsRoot` field as the base
path for all documentation directories (default: `docs/`). All paths in skill files
(e.g., `docs/system/`, `docs/research/`) resolve relative to this root.

## Pipeline State Check

Run these checks before any mode:

1. **Stale `.pipeline-authorized` marker** — If `.pipeline-authorized` exists at the
   project root, a previous operation (bootstrap, merge, or correction) was interrupted.
   Tell the user and suggest cleanup before proceeding.

2. **Read tracking files** for current state:
   - `{docsRoot}/DECISIONS.md` — prior decisions that constrain current work
   - `{docsRoot}/PARKING.md` — parked findings (active section)
   - `{docsRoot}/RESEARCH_LEDGER.md` — active or approved research
   - `{docsRoot}/PROPOSAL_TRACKER.md` — in-flight proposals

3. **Orient the user** — 2-3 sentences: what's actionable, what's blocked, what's next.

## Folder Structure

```
{docsRoot}/
├── system/              # Protected source of truth
│   ├── .manifest.md     # Auto-generated index (read first to orient)
│   └── *.md             # System docs
├── research/            # Research docs (R-NNN-slug.md)
├── proposals/           # Proposals (P-NNN-slug.md)
├── reviews/
│   ├── proposals/       # Reviews (REVIEW_*), verifications (VERIFY_*)
│   ├── audit/           # Audits (AUDIT_*), syncs (SYNC_*)
│   └── design/          # Design reviews (DESIGN_REVIEW_*)
├── specs/               # Implementation specs, TASKS.md
├── designs/             # Design files (.pen, DESIGN_PROGRESS.md)
├── context/             # Per-library context files
├── DECISIONS.md         # Decision journal (read at every session start)
├── RESEARCH_LEDGER.md   # Research cycle tracking
├── PROPOSAL_TRACKER.md  # Proposal tracking
└── PARKING.md           # Parked findings, gaps, ideas
```

## Reference File Convention

When loading a reference file, read its YAML frontmatter for the mode's tier, dependencies,
and state files. Follow the Workflow section (Tier 1: Structured) or Process section
(Tier 2: Guided). Consult the Variables table for inputs and outputs.

## Decision Flow Protocol

Before asking the user any question, check `{docsRoot}/DECISIONS.md` for an existing
decision in the same category. If found, use it as the default. Only re-ask if the
context is genuinely different.

Decision categories: `auth`, `authorization`, `errors`, `testing`, `api-style`,
`accessibility`, `security`, `content`, `resilience`, `type-sharing`, `dependencies`,
`responsive`, `design-direction`, `spec-format`, `checkpoint-level`.

When logging new decisions, always include the category tag.

## Parking Protocol

When a finding surfaces that is NOT the current focus:

1. Check `{docsRoot}/PARKING.md` active section — add context to existing items, don't duplicate
2. Classify: `architectural` (blocks) | `incremental` (can wait) | `scope-expansion` (new idea)
3. Record: assign next EC-NNN ID, fill all columns
4. Tell user: "Found [classification] issue: [brief]. Parked as EC-NNN."
5. Continue current work

## Naming Conventions

| Artifact | Pattern | Location |
|----------|---------|----------|
| Research docs | R-NNN-slug.md | research/ |
| Proposals | P-NNN-slug.md | proposals/ |
| Reviews | REVIEW_P-NNN_vN.md | reviews/proposals/ |
| Verifications | VERIFY_P-NNN.md | reviews/proposals/ |
| Audits | AUDIT_YYYY-MM-DD.md | reviews/audit/ |
| Syncs | SYNC_YYYY-MM-DD.md | reviews/audit/ |
| Design reviews | DESIGN_REVIEW_YYYY-MM-DD.md | reviews/design/ |
| Corrections | CORRECTIONS_YYYY-MM-DD.md | reviews/proposals/ |
| Decisions | D-NNN | DECISIONS.md |
| Parked items | EC-NNN | PARKING.md |
| Tasks | T-NNN | specs/TASKS.md |
| Fix tasks | F-NNN | specs/TASKS.md |
| Spec gaps | G-NNN | specs/TASKS.md |

## Protection Model

Protected paths (configured via `protectedPaths` in `.clarity-loop.json`, defaults to
`["{docsRoot}/system"]`) cannot be edited directly. The PreToolUse hook blocks writes
unless a `.pipeline-authorized` marker exists with a valid operation (`bootstrap`,
`merge`, or `correct`). The marker is created by the authorizing operation and deleted
after completion.
