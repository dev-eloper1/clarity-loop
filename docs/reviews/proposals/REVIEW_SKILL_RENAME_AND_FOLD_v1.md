# Review: Skill Rename to `cl-*` Namespace and Fold Spec-Gen into Implementer

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/SKILL_RENAME_AND_FOLD.md
**System docs referenced**: ARCHITECTURE.md, PRD.md, TDD.md, PRIMITIVES.md, CONTROL_PANEL.md (via proposal system context)
**Research doc**: docs/research/PIPELINE_GAP_ANALYSIS.md (Structural Recommendation section)

## Summary

This proposal renames all five Clarity Loop skills from their current mixed prefixes (`doc-*`, `ui-*`, unprefixed) to a unified `cl-*` namespace, and folds the standalone `doc-spec-gen` skill into `cl-implementer` as new `spec` and `spec-review` modes. It's a wide-but-shallow mechanical change affecting 45 files and 625+ references, with the only structural change being the spec-gen fold. The proposal is well-structured, the rationale is sound, and the change manifest is thorough. A few minor issues need fixing.

## Verdict: APPROVE WITH CHANGES

## Blocking Issues

### 1. Part F Header Count Mismatch

- **Dimension**: Internal Coherence
- **Where**: Change Manifest, Part F header (line 145)
- **Issue**: The header reads "Infrastructure Updates (4 files)" but the table lists 5 entries (F1 through F5): `protect-system-docs.js`, `protect-system-docs.sh`, `scripts/init.js`, `templates/proposal-tracker.md`, `templates/research-ledger.md`.
- **Why it matters**: The change manifest is the implementation contract. A count mismatch could cause an implementer to stop at 4 items and miss the 5th file.
- **Suggestion**: Change header to "Infrastructure Updates (5 files)".

### 2. Open Item #3 Is a Non-Issue — Should Be Resolved

- **Dimension**: Completeness & Gaps
- **Where**: Open Items, item #3 (line 418-419)
- **Issue**: The proposal states "hooks.json may reference skill names in event routing. Verify during implementation." I verified `hooks.json` — it contains only JS file path references (`${CLAUDE_PLUGIN_ROOT}/hooks/protect-system-docs.js`, etc.) and tool name matchers (`Edit`, `Write`). **Zero skill name references.** This open item is based on an incorrect assumption and should be resolved, not left for implementation.
- **Why it matters**: Open items that are already answerable create unnecessary work and uncertainty during implementation.
- **Suggestion**: Remove Open Item #3 or replace it with a note: "Verified: hooks.json contains no skill name references — only JS file paths and tool names. No changes needed."

## Non-Blocking Suggestions

### 1. `protect-system-docs.sh` Is Deprecated — Consider Dropping from Manifest

- **Where**: Part F, F2
- **Note**: The file `protect-system-docs.sh` (line 2) explicitly states `# DEPRECATED: This file is replaced by protect-system-docs.js (Node.js)`. It's kept for "one release cycle." Since this rename proposal is itself a breaking change that warrants a version bump (Open Item #2 recommends v0.2.0), this could be the opportunity to remove the deprecated .sh file entirely rather than updating its skill name references. Either way works — updating it is safe, removing it is cleaner.

### 2. `context: fork` Removal Deserves a Monitoring Note

- **Where**: Detailed Design, Section 2D (lines 306-310) and Design Decisions table
- **Note**: The proposal correctly identifies that subagent dispatch in Step 2 replaces the fork. For large projects with many system docs, this means spec mode will load heavy content into the main context window instead of an isolated fork. The proposal acknowledges this in the Risks table ("Monitor for context pressure"). Consider adding a concrete threshold to the spec-mode.md reference: e.g., "If system docs exceed 10 files or 50K tokens total, dispatch Step 2 as a subagent to avoid context pressure on the main session."

### 3. `docs/doc-spec-gen.md` Merge Strategy Could Be More Explicit

- **Where**: Change Manifest E5 and Detailed Design Section 5
- **Note**: E5 says "fold content into cl-implementer doc" and Section 5 says "merged into `docs/cl-implementer.md` as a new Spec Mode and Spec Review Mode section." The current `docs/doc-spec-gen.md` content (waterfall gate explanation, spec format options, manifest structure) is substantial. Consider specifying whether all content merges verbatim or if some is trimmed/consolidated, since some of it overlaps with what would already be in the SKILL.md itself.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| ARCHITECTURE.md | ✅ Consistent | No skill names in architecture — system docs don't reference plugin skills |
| PRD.md | ✅ Consistent | No direct skill references |
| TDD.md | ✅ Consistent | No direct skill references |
| PRIMITIVES.md | ✅ Consistent | No direct skill references |
| CONTROL_PANEL.md | ✅ Consistent | No direct skill references |
| plugin.json | ✅ Consistent | Points to `./skills/` with auto-discovery — directory renames correctly become new skill IDs |
| hooks.json | ✅ Consistent | No skill name references found — only JS file paths |
| hooks/protect-system-docs.js | ✅ Captured | Lines 96-98 reference `/doc-researcher` and `/doc-reviewer` — listed in F1 |
| hooks/protect-system-docs.sh | ✅ Captured | Line 70 references `/doc-researcher` and `/doc-reviewer` — listed in F2 |
| hooks/generate-manifest.js | ✅ Consistent | No skill name references |
| hooks/config.js | ✅ Consistent | No skill name references |
| scripts/init.js | ✅ Captured | Line 304 references `/doc-researcher` — listed in F3 |
| scripts/init.sh | ✅ Consistent | Thin wrapper, delegates to init.js — no skill references |
| templates/*.md | ✅ Captured | Both reference `doc-researcher` and/or `doc-reviewer` — listed in F4-F5 |

## Strengths

1. **Thorough inventory**: The 625-reference count across 45 files gives high confidence that the scope is understood. The appendix with per-skill and per-file breakdowns is valuable for implementation.

2. **Clean separation of concerns**: Part B (spec-gen fold) is the only structural change; everything else (Parts A, C-G) is mechanical rename. This makes the proposal easy to implement incrementally and easy to verify.

3. **Thoughtful `implementer` disambiguation**: Section 4 explicitly calls out the dual usage of "implementer" as both a skill name and a generic noun, with a clear heuristic for distinguishing them. This is the highest-risk part of the mechanical rename and the guidance is sound.

4. **Pipeline diagram in Section 2**: The updated pipeline flow showing spec generation through to working code makes the fold's rationale immediately visible.

5. **P0 sequencing**: Correctly positioned as a prerequisite for P1-P4, avoiding a double-rename scenario.

## Risk Assessment

The proposal's risk table is accurate. The highest-impact risk (plugin auto-discovery breaking) is low-likelihood and easily verified with `claude plugin validate`. The medium-likelihood risks (missed references, generic noun confusion) are both low-impact — a surviving old name is cosmetic, not functional.

One additional minor risk not mentioned: **user muscle memory**. Users who've been typing `/doc-researcher` will need to retrain to `/cl-researcher`. Since the plugin isn't widely deployed yet, this is negligible. The migration note in the README (mentioned in the Risks table) is sufficient.

No significant unaddressed risks.
