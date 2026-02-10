## Sync Mode

Detects drift between what system docs claim and what the codebase actually does. This is
an on-demand check — not automatic — that produces an advisory report. Sync mode does NOT
modify any documentation; it identifies where docs and code have diverged so the user can
decide what to fix.

### When to Use

- **After code changes**: When significant code work has been done without updating docs
- **Before a new research cycle**: To understand what's already stale before adding more
- **Periodic hygiene**: Every few sprints, check that docs still reflect reality
- **After an extended implementation phase**: Code tends to evolve faster than docs
- **When something seems off**: A function doesn't match what the docs describe

### Scope Selection

Sync mode supports two scopes:

**Full scan** (`/doc-reviewer sync`): Verify all extractable claims in system docs against
the codebase. More thorough but slower — reads all system docs and performs targeted code
searches for each claim.

**Git-diff** (`/doc-reviewer sync --since <ref>`): Only check claims related to code areas
that changed since `<ref>`. Faster and more targeted — useful for incremental checks.

Examples:
- `/doc-reviewer sync` — full scan
- `/doc-reviewer sync --since main~10` — last 10 commits on main
- `/doc-reviewer sync --since v1.0.0` — since a tag
- `/doc-reviewer sync --since 2026-01-15` — since a date (git resolves this)

### Step 1: Extract Claims from System Docs

Read the system docs (all for full scan, or relevant ones for git-diff mode) and identify
statements that make verifiable claims about the codebase.

**Claim types to extract:**

| Claim Type | Example in Docs | How to Verify |
|---|---|---|
| File/directory structure | "src/gateway/ contains the WebSocket daemon" | Check if directory/files exist |
| Technology/dependency | "Uses pgvector for semantic memory" | Check package.json / go.mod / requirements.txt |
| Module structure | "The event bus has producer, consumer, router" | Check directory for matching files/exports |
| API shape | "The /health endpoint returns {status, uptime}" | Search for route definitions |
| Configuration | "Default port is 8080" | Search config files and defaults |
| File naming | "Research docs follow the pattern R-NNN-slug.md" | Check docs/research/ for compliance |
| Process/flow | "Webhooks arrive via POST to /api/webhooks" | Search for route handler registration |
| Data schema | "The users table has columns: id, email, name" | Check migration files or schema definitions |

**What to skip:**
- Aspirational claims ("in the future, we plan to...")
- Design rationale ("we chose X because...")
- Abstract principles ("the system follows event-driven architecture")
- Claims about external services ("Slack's API supports...")

For each claim, record:
- The claim text (quoted from the doc)
- Source doc and section
- Claim type
- What to search for in code

### Step 2: Analyze Code State

**For git-diff mode:**

1. Run `git diff <ref>...HEAD --name-only` to get changed files
2. Map changed files to system doc domains:
   - Files in `src/gateway/` → claims about the gateway
   - Files in `src/memory/` → claims about memory layer
   - Changes to `package.json` → dependency claims
   - Changes to schema files → data model claims
3. Filter claims from Step 1 to only those related to changed domains
4. This reduces the verification surface significantly

**For full scan mode:**

Work through all extracted claims. For each claim, do targeted code searches:
- Use file reads for structural claims (does this directory exist?)
- Use grep/search for behavioral claims (does this route handler exist?)
- Use package.json / lock files for dependency claims
- Use config files for configuration claims

### Step 3: Cross-Reference

For each claim, verify it against the code and categorize the finding:

| Category | Meaning | Action |
|---|---|---|
| **In sync** | Doc claim matches code reality | No action needed |
| **Potentially stale** | Code changed in an area the doc covers, but the claim may still hold | Needs manual review — flag for human judgment |
| **Confirmed drift** | Doc says X, code clearly says Y | Recommend correction or research cycle |
| **Unverifiable** | Claim is too abstract or the code structure doesn't allow verification | Note for context, no action |

**Categorization guidelines:**
- Be conservative with "confirmed drift" — only use it when you're confident the doc
  is wrong, not just when you can't find supporting code (that could be "unverifiable")
- "Potentially stale" is the safe middle ground — use it when code changed near the
  area a claim covers but you can't be sure the claim is now wrong
- Claims about things that don't exist yet (future plans in docs) are "unverifiable",
  not "confirmed drift"

### Step 4: Produce Sync Report

Create the report at:
```
{docsRoot}/reviews/audit/SYNC_[YYYY-MM-DD].md
```

Use this structure:

```markdown
# Code-Doc Sync Report

**Date**: [date]
**Scope**: [Full scan | Git-diff since <ref>]
**System docs checked**: [list]
**Claims extracted**: [total count]
**Code areas analyzed**: [list of directories/files checked]

## Executive Summary

Two to three paragraphs: overall alignment between docs and code. Are they mostly in sync,
showing signs of drift, or significantly diverged? What are the top concerns?

## Summary

| Category | Count |
|----------|-------|
| In sync | N |
| Potentially stale | N |
| Confirmed drift | N |
| Unverifiable | N |

## Confirmed Drift

Issues where docs clearly contradict the code. These should be addressed.

### [Drift Title]
- **Doc**: [source doc], Section [X]
- **Claim**: "[quoted claim from doc]"
- **Code reality**: [what the code actually shows]
- **Evidence**: [file paths, line numbers, or search results]
- **Recommended action**: Correction (if fix is obvious) or Research (if the right answer isn't clear)

## Potentially Stale

Areas where code changed and doc claims may no longer hold. Needs human review.

### [Area Title]
- **Doc**: [source doc], Section [X]
- **Claim**: "[quoted claim from doc]"
- **Code changes**: [what changed, files affected]
- **Risk**: [why this might affect the claim]
- **Suggested check**: [what the human should verify]

## In Sync (Summary)

Brief summary of verified claims — no need to list every one unless the total is small.

| Doc | Claims Checked | In Sync |
|-----|---------------|---------|
| [doc name] | N | N |

## Unverifiable Claims

Claims that couldn't be checked against code. Listed for completeness.

| Claim | Source Doc | Why Unverifiable |
|-------|-----------|-----------------|
| [claim] | [doc] Section X | [reason — too abstract, external service, etc.] |

## Recommendations

1. **Immediate corrections**: Confirmed drift items that can be fixed via `/doc-reviewer correct`
2. **Research needed**: Drift items where the right fix isn't obvious
3. **Manual review**: Potentially stale items the user should check
4. **Doc precision**: Claims that were unverifiable could be made more concrete
```

### Step 5: Integration with Other Modes

The sync report feeds into the pipeline like other audit artifacts:

- **Confirmed drift with obvious fixes** → `/doc-reviewer correct SYNC_DATE.md`
  (correction mode, using the sync report as the source finding)
- **Confirmed drift needing design decisions** → `/doc-researcher research "topic"`
  (full pipeline, the sync finding is the motivation)
- **Potentially stale items** → User reviews, then either ignores (docs are still correct),
  creates a correction, or starts research

The sync report is stored alongside audit reports because it serves a similar purpose —
system health assessment — but focused on code-doc alignment rather than doc-doc consistency.

### Guidelines

- **Sync mode is advisory.** It does NOT modify any docs. It produces a report that the
  user acts on through existing pipeline mechanisms (corrections or research).

- **Claim extraction is AI-driven, not regex.** Read the docs as a human would and identify
  statements that reference code structures. Don't try to build a parser — use judgment.

- **Focus on verifiable claims.** Skip philosophical statements, design rationale, and
  future plans. Concentrate on things where you can check code and say "yes this matches"
  or "no this doesn't."

- **Be honest about confidence.** If you're not sure whether code matches a claim, mark
  it "potentially stale" rather than "confirmed drift." False positives erode trust.

- **Git-diff mode is the pragmatic choice.** Full scans are expensive and most useful for
  initial baselines. For regular hygiene, git-diff since the last sync or last release is
  more practical.

- **Don't over-extract.** A system doc with 200 lines might have 5-10 verifiable claims.
  Quality of extraction matters more than quantity. Focus on claims that, if wrong, would
  mislead an implementer.
