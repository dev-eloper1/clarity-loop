## Correction Mode

A lightweight path for targeted fixes that don't warrant the full research -> proposal
pipeline. Corrections are for issues that already have a clear diagnosis and an obvious
fix — the audit report or spec review IS the justification.

### When to Use Corrections (vs. Full Pipeline)

**Use corrections for:**
- Stale cross-references (doc A references a section in doc B that was renamed/moved)
- Terminology drift (same concept called different names across docs)
- Broken internal links or references
- Spec hallucinations (spec says X but source doc clearly says Y)
- Factual errors caught by audit's technical verification
- Consistency fixes (align doc B to match doc A when A is authoritative)
- Orphaned TODOs, stale dates, placeholder content
- Typos that change meaning (not cosmetic typos — those can wait)

**Use the full pipeline for:**
- Adding new concepts or capabilities
- Changing architectural decisions
- Restructuring document organization
- Anything where the "right fix" isn't obvious from the finding
- Changes that affect the system's design direction

**Rule of thumb**: If the audit/review finding includes enough information to make the
fix without further research or design decisions, it's a correction. If you need to
explore options or make tradeoffs, it's a research topic.

### Inputs

Corrections require a **source finding** — the diagnosis that justifies the fix. Valid
sources:

| Source | File Pattern | Example |
|--------|-------------|---------|
| Audit report | `docs/reviews/audit/AUDIT_*.md` | Critical finding: stale cross-ref in ARCHITECTURE.md |
| Verify report | `docs/reviews/proposals/VERIFY_P-NNN.md` | Fidelity issue: terminology drift after merge |
| Spec review | Output from `/doc-spec-gen review` | Type inconsistency: spec says number, doc says UUID |
| Re-review | `docs/reviews/proposals/REVIEW_P-NNN_v*.md` | External consistency issue discovered during review |

If the user asks for corrections without a source finding, ask: "What audit, review, or
spec check identified these issues? I need a finding to trace the correction back to."

Ad-hoc corrections (user spots something themselves) are also valid — the user's
observation is the source. Just document it as "User-identified" in the corrections log.

### Process

#### Step 1: Build the Corrections Manifest

Read the source finding(s) and build a corrections manifest — a lightweight table of
what needs to change:

```markdown
# Corrections Manifest

**Source**: [audit report / verify report / spec review / user-identified]
**Date**: [date]
**Authorized by**: [user]

## Corrections

| # | File | Section | Current (wrong) | Corrected (right) | Source Finding |
|---|------|---------|-----------------|-------------------|---------------|
| 1 | ARCHITECTURE.md | Section 3.2 | "see TDD.md Section 4.1" | "see TDD.md Section 5.2" | AUDIT cross-ref #3 |
| 2 | TDD.md | Section 7 | "eventId: number" | "eventId: UUID v4" | Spec review type consistency |
| 3 | PRD.md | Section 2.1 | "the gateway daemon" | "the gateway process" | AUDIT terminology drift #1 |
```

Present this to the user: "Here are the corrections I'd make based on [source]. Review
the manifest — once you approve, I'll make the edits."

#### Step 2: User Approval Gate

**Wait for explicit user approval.** The corrections manifest IS the proposal — it's just
lighter weight. The user must approve before any system doc is touched.

The user can:
- **Approve all** — proceed with all corrections
- **Approve some** — remove rows they don't want, proceed with the rest
- **Reject** — "Actually, correction #2 needs more thought. Let's research that one."
  Remove it from the manifest and handle it through the full pipeline.

#### Step 3: Create Marker and Apply Corrections

Once approved:

1. **Create the authorization marker** — Write `docs/system/.pipeline-authorized` with:

   ```
   operation: correct
   source: [audit report / verify report / spec review filename]
   authorized_by: user
   timestamp: [ISO 8601]
   ```

   This tells the PreToolUse hook to allow edits to system docs.

2. **Apply each correction** — Edit the system docs. Keep changes minimal and surgical.
   Don't "improve" surrounding content. Don't restructure. Just fix what the manifest says.

3. **Remove the marker** — Delete `docs/system/.pipeline-authorized` after all
   corrections are applied.

#### Step 4: Spot-Check Verification

Run a lightweight verification on just the corrected sections:

- For each correction, re-read the changed section and verify it's correct
- Check that the correction didn't break cross-references in the immediate vicinity
- Check that surrounding content still makes sense with the change

This is NOT a full verify (which reads all docs and checks all pairs). It's a targeted
check on the specific lines that changed.

If the spot-check reveals issues, fix them in the same corrections session (the marker
is still present) or flag them for the user.

#### Step 5: Log and Update Tracking

After corrections are applied:

1. **Write a corrections log entry** — Append to `docs/reviews/proposals/CORRECTIONS_[DATE].md`:

```markdown
# Corrections: [DATE]

**Source**: [source finding file]
**Applied by**: AI + user approval

## Changes Applied

| # | File | Section | What Changed | Source Finding |
|---|------|---------|-------------|---------------|
| 1 | ARCHITECTURE.md | Section 3.2 | Fixed cross-reference to TDD.md | AUDIT #3 |
| 2 | TDD.md | Section 7 | Fixed type: number -> UUID v4 | Spec review |

## Spot-Check Result

[CLEAN — all corrections verified / ISSUES — describe]
```

2. **Update STATUS.md** — Note that corrections were applied, with date and source.

3. **Tell the user**: "Corrections applied. [N] fixes across [M] files. Spot-check: [result].
   Corrections log at `docs/reviews/proposals/CORRECTIONS_[DATE].md`."

### What Corrections Mode Does NOT Do

- **No research** — the finding is the research
- **No proposal** — the corrections manifest is the proposal (lightweight)
- **No full review** — the audit/spec review already did the analysis
- **No full verify** — spot-check only, covering just the changed sections
- **No tracking file ceremony** — corrections don't get RESEARCH_LEDGER or PROPOSAL_TRACKER
  entries (they're not research or proposals). They're logged in the corrections file and
  noted in STATUS.md.

### Safety Rails

- **The marker is temporary.** It exists only while corrections are actively being applied.
  If a session crashes mid-correction, the marker persists — the next session should check
  for it, review what was done, and either finish or clean up.

- **The manifest is the audit trail.** Every correction traces to a source finding. There's
  no "just change this because I feel like it" — that goes through the pipeline.

- **User approves every correction.** The manifest is presented before any edits happen.
  The user can reject individual corrections or all of them.

- **Scope is strict.** Corrections fix what the finding identified. If you notice something
  else while making corrections, don't fix it in the same session — capture it as a new
  finding and handle it separately (either as another correction with user approval, or as
  a research topic if it's non-trivial).

### Edge Cases

**Multiple sources**: Corrections can combine findings from different sources (audit +
spec review + user-identified). Group them in one manifest, attributed per-row.

**Correction reveals deeper issue**: If while making a correction you discover the fix
isn't straightforward (e.g., the "stale reference" actually points to a section that was
intentionally removed, and the fix requires deciding where the content went), stop. Remove
that row from the manifest, tell the user it needs research, and proceed with the
remaining corrections.

**Large correction sets**: If an audit produces 20+ corrections, batch them. Present
5-10 at a time for user approval. This prevents a single massive manifest that's hard
to review.
