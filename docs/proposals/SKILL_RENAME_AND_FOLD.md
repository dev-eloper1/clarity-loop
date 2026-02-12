# Proposal: Rename Skills to `cl-*` Namespace and Fold Spec-Gen into Implementer

**Created**: 2026-02-09
**Status**: Draft
**Research**: docs/research/PIPELINE_GAP_ANALYSIS.md (Structural Recommendation section)
**Author**: Bhushan + AI Researcher
**Depends On**: None — this proposal should land before P1-P4 (gap analysis proposals)

## Summary

Rename all five Clarity Loop skills from their current names (`doc-researcher`, `doc-reviewer`,
`doc-spec-gen`, `ui-designer`, `implementer`) to a unified `cl-*` namespace (`cl-researcher`,
`cl-reviewer`, `cl-designer`, `cl-implementer`). Simultaneously, fold `doc-spec-gen` into
`cl-implementer` as new `spec` and `spec-review` modes, reducing the skill count from five
to four.

The rename reflects the pipeline's evolution from a document management tool to a full
development pipeline covering behavioral specs, test specs, security specs, design systems,
and implementation tracking. The fold eliminates a handoff between spec generation and
implementation — the consumer of specs becomes the producer of specs.

Additionally, remove two deprecated bash hook files (`protect-system-docs.sh`,
`generate-manifest.sh`) that have been fully replaced by their Node.js equivalents and are
no longer referenced from any configuration.

This is a wide-but-shallow change: 45 files, 625+ references, but every change is a
mechanical rename or dead code removal with no behavioral modifications.

## Research Lineage

| Research Doc | Key Findings Used | Recommendation Adopted |
|---|---|---|
| docs/research/PIPELINE_GAP_ANALYSIS.md | Structural Recommendation: skills have outgrown `doc-*` naming; spec-gen is implementation preparation | Rename to `cl-*`, fold spec-gen into implementer |

## System Context

### Research Type: Evolutionary

### Current State

Five skills with inconsistent naming:

| Skill | Directory | Prefix | Modes |
|---|---|---|---|
| `doc-researcher` | `skills/doc-researcher/` | `doc-` | bootstrap, research, proposal, structure, context |
| `doc-reviewer` | `skills/doc-reviewer/` | `doc-` | review, re-review, merge, verify, audit, correct, fix, sync, design-review |
| `doc-spec-gen` | `skills/doc-spec-gen/` | `doc-` | generate, review |
| `ui-designer` | `skills/ui-designer/` | `ui-` | setup, tokens, mockups, build-plan |
| `implementer` | `skills/implementer/` | *(none)* | start, run, autopilot, verify, status, sync |

Problems:
1. `doc-*` implies document-focused, but skills handle specs, design, testing, security, implementation
2. `ui-designer` has a `ui-` prefix while others use `doc-` — inconsistent
3. `implementer` has no prefix at all
4. `doc-spec-gen` is a separate skill for a single handoff step between review and implementation

### Proposed State

Four skills with unified `cl-*` namespace:

| Skill | Directory | Modes |
|---|---|---|
| `cl-researcher` | `skills/cl-researcher/` | bootstrap, research, proposal, structure, context |
| `cl-reviewer` | `skills/cl-reviewer/` | review, re-review, merge, verify, audit, correct, fix, sync, design-review |
| `cl-designer` | `skills/cl-designer/` | setup, tokens, mockups, build-plan |
| `cl-implementer` | `skills/cl-implementer/` | **spec**, **spec-review**, start, run, autopilot, verify, status, sync |

The `cl-implementer` now owns the full build pipeline:
```
cl-implementer spec         →  generate specs from verified system docs (waterfall gate)
cl-implementer spec-review  →  cross-spec consistency check
cl-implementer start        →  generate tasks from specs
cl-implementer run          →  implement task queue
cl-implementer autopilot    →  autonomous implementation
cl-implementer verify       →  holistic verification
cl-implementer status       →  progress report
cl-implementer sync         →  handle spec/task drift
```

## Change Manifest

### Part A: Directory Renames (4 renames + 1 delete)

| # | Change | Source | Target | Type |
|---|---|---|---|---|
| A1 | Rename researcher directory | `skills/doc-researcher/` | `skills/cl-researcher/` | Rename |
| A2 | Rename reviewer directory | `skills/doc-reviewer/` | `skills/cl-reviewer/` | Rename |
| A3 | Rename designer directory | `skills/ui-designer/` | `skills/cl-designer/` | Rename |
| A4 | Rename implementer directory | `skills/implementer/` | `skills/cl-implementer/` | Rename |
| A5 | Delete spec-gen directory | `skills/doc-spec-gen/` | *(removed — content moved to A4)* | Delete |

### Part B: Spec-Gen Fold into Implementer (move + merge)

| # | Change | Source | Target | Type |
|---|---|---|---|---|
| B1 | Move spec consistency check | `skills/doc-spec-gen/references/spec-consistency-check.md` | `skills/cl-implementer/references/spec-consistency-check.md` | Move |
| B2 | Create spec mode reference | *(new)* | `skills/cl-implementer/references/spec-mode.md` | Add |
| B3 | Update implementer SKILL.md | `skills/cl-implementer/SKILL.md` | Add spec + spec-review modes, absorb spec-gen content | Modify |

### Part C: SKILL.md Frontmatter Updates (4 files)

| # | Change | Target | Type |
|---|---|---|---|
| C1 | Rename `doc-researcher` → `cl-researcher` in frontmatter + body | `skills/cl-researcher/SKILL.md` | Modify |
| C2 | Rename `doc-reviewer` → `cl-reviewer` in frontmatter + body | `skills/cl-reviewer/SKILL.md` | Modify |
| C3 | Rename `ui-designer` → `cl-designer` in frontmatter + body | `skills/cl-designer/SKILL.md` | Modify |
| C4 | Rename `implementer` → `cl-implementer`, add spec modes | `skills/cl-implementer/SKILL.md` | Modify |

### Part D: Cross-Reference Updates in Skill References (~20 files)

All files in `skills/*/references/` that reference other skills by old name.

| # | File | References to Update |
|---|---|---|
| D1 | `skills/cl-researcher/references/bootstrap-guide.md` | doc-researcher, doc-reviewer |
| D2 | `skills/cl-researcher/references/context-mode.md` | doc-researcher, doc-spec-gen, implementer |
| D3 | `skills/cl-researcher/references/proposal-template.md` | doc-researcher, doc-reviewer, implementer |
| D4 | `skills/cl-researcher/references/research-template.md` | doc-reviewer |
| D5 | `skills/cl-reviewer/references/audit-mode.md` | ui-designer |
| D6 | `skills/cl-reviewer/references/correction-mode.md` | doc-spec-gen |
| D7 | `skills/cl-reviewer/references/design-review-mode.md` | ui-designer |
| D8 | `skills/cl-reviewer/references/merge-mode.md` | doc-reviewer |
| D9 | `skills/cl-reviewer/references/sync-mode.md` | doc-researcher, doc-reviewer, implementer |
| D10 | `skills/cl-reviewer/references/verify-mode.md` | ui-designer |
| D11 | `skills/cl-designer/references/build-plan-mode.md` | doc-reviewer, implementer, ui-designer |
| D12 | `skills/cl-designer/references/mockups-mode.md` | ui-designer |
| D13 | `skills/cl-designer/references/setup-mode.md` | doc-researcher, ui-designer |
| D14 | `skills/cl-designer/references/tokens-mode.md` | ui-designer |
| D15 | `skills/cl-implementer/references/autopilot-mode.md` | implementer |
| D16 | `skills/cl-implementer/references/run-mode.md` | doc-researcher, implementer, ui-designer |
| D17 | `skills/cl-implementer/references/start-mode.md` | doc-researcher, doc-spec-gen, implementer, ui-designer |
| D18 | `skills/cl-implementer/references/sync-mode.md` | implementer |
| D19 | `skills/cl-implementer/references/verify-mode.md` | doc-reviewer, implementer |
| D20 | `skills/cl-implementer/references/spec-consistency-check.md` | doc-spec-gen |

### Part E: Documentation Updates (8 files)

| # | File | References to Update |
|---|---|---|
| E1 | `README.md` | All 5 skill names (28 refs), skills table, command examples |
| E2 | `docs/implementer.md` | All skill names (20 refs), rename file to `docs/cl-implementer.md` |
| E3 | `docs/doc-researcher.md` | All skill names (10 refs), rename file to `docs/cl-researcher.md` |
| E4 | `docs/doc-reviewer.md` | All skill names (12 refs), rename file to `docs/cl-reviewer.md` |
| E5 | `docs/doc-spec-gen.md` | Entire file — redirect or fold content into cl-implementer doc |
| E6 | `docs/ui-designer.md` | All skill names (5 refs), rename file to `docs/cl-designer.md` |
| E7 | `docs/pipeline-concepts.md` | All skill names (12 refs) |
| E8 | `docs/hooks.md` | All skill names (3 refs) |

### Part F: Infrastructure Updates (5 files)

| # | File | Change |
|---|---|---|
| F1 | `hooks/protect-system-docs.js` | Update skill name references |
| F2 | `hooks/protect-system-docs.sh` | Update skill name references |
| F3 | `scripts/init.js` | Update skill name references |
| F4 | `templates/proposal-tracker.md` | Update skill name references |
| F5 | `templates/research-ledger.md` | Update skill name references |

### Part G: Research/Proposal Docs (update references, not content)

| # | File | Change |
|---|---|---|
| G1 | `docs/research/PIPELINE_GAP_ANALYSIS.md` | Update skill name references throughout |
| G2 | `docs/research/DOC_PIPELINE_PLUGIN.md` | Update skill name references |
| G3 | `docs/research/POST_SPEC_IMPLEMENTATION_TRACKING.md` | Update skill name references |
| G4 | `docs/research/IMPLEMENTATION_CONTEXT_PROGRESSIVE_LOADING.md` | Update skill name references |
| G5 | `docs/proposals/IMPLEMENTER_SKILL.md` | Update skill name references |
| G6 | `docs/proposals/CONTEXT_SYSTEM.md` | Update skill name references |

### Part H: Dead Code Cleanup (2 deletes)

Deprecated files that have been fully replaced and are no longer referenced from any
configuration or code path.

| # | File | Reason |
|---|---|---|
| H1 | `hooks/protect-system-docs.sh` | Deprecated — line 2: "DEPRECATED: This file is replaced by protect-system-docs.js (Node.js)." `hooks.json` points to the `.js` version. Kept for one release cycle; this rename is the breaking-change release (v0.2.0) where it should be removed. |
| H2 | `hooks/generate-manifest.sh` | Deprecated — line 2: "DEPRECATED: This file is replaced by generate-manifest.js (Node.js)." `hooks.json` points to the `.js` version. Same rationale as H1. |

**Scope boundary**: This proposal renames skill identifiers, moves spec-gen content into
the implementer, updates references, and removes deprecated dead code. No behavioral
changes, no new features, no modified logic. Every file should work identically after the
rename — just with new names and without unused files.

## Cross-Proposal Conflicts

No conflicts with in-flight proposals. This proposal should merge FIRST so that P1-P4
(gap analysis proposals) can use the new `cl-*` names from the start.

## Detailed Design

### 1. Directory Structure (After)

```
skills/
  cl-researcher/
    SKILL.md
    references/
      bootstrap-guide.md
      research-template.md
      proposal-template.md
      document-plan-template.md
      context-mode.md
  cl-reviewer/
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
  cl-designer/
    SKILL.md
    references/
      setup-mode.md
      tokens-mode.md
      mockups-mode.md
      build-plan-mode.md
      design-checklist.md
  cl-implementer/
    SKILL.md
    references/
      spec-mode.md              ← NEW (extracted from doc-spec-gen SKILL.md)
      spec-consistency-check.md ← MOVED from doc-spec-gen
      start-mode.md
      run-mode.md
      autopilot-mode.md
      verify-mode.md
      sync-mode.md
```

### 2. Spec-Gen Fold: New `spec` Mode in cl-implementer

The current `doc-spec-gen` SKILL.md content is restructured into:

**A. `spec-mode.md` reference file** — Contains the full spec generation process:
- Waterfall gate check (Steps 1)
- Read all system docs (Step 2)
- Suggest spec format (Step 3)
- Generate specs (Step 4)
- Generate spec manifest (Step 5)
- Update tracking (Step 6)

This is a direct extraction of the current doc-spec-gen generate mode, with these changes:
- References to `/doc-spec-gen` become `spec` mode within cl-implementer
- References to `/doc-spec-gen review` become `/cl-implementer spec-review`
- The `context: fork` behavior is replaced by subagent dispatch within spec mode
  (Step 2 already dispatches subagents per doc — the fork was convenience, not necessity)
- References to other skills updated to `cl-*` names

**B. `spec-review` mode** — The existing spec-consistency-check.md, unchanged except
for skill name references.

**C. cl-implementer SKILL.md additions**:

New frontmatter triggers added:
```yaml
description: >
  ...Trigger on "generate specs", "create specs", "specs from docs",
  "check spec consistency", "review specs", "are the specs consistent",
  ...
argument-hint: "[spec|spec-review|start|run|autopilot|verify|status|sync]"
```

New mode detection entries:
```
- **spec**: Generate specs from verified system docs. Trigger: "generate specs",
  "create specs", "specs from docs", "are we ready for specs". Gate: system docs
  must exist and be verified.

- **spec-review**: Cross-spec consistency check. Trigger: "check spec consistency",
  "review specs", "are the specs consistent". Gate: specs must exist
  (.spec-manifest.md).
```

New sections:
```
## Spec Mode

Read `references/spec-mode.md` and follow its process.

Generates implementation-ready specs from verified system docs. Enforces the waterfall
gate — specs are generated only after all system docs are complete and verified. The
spec format adapts to the content (OpenAPI for APIs, JSON Schema for data, structured
markdown for general).

---

## Spec Review Mode

Read `references/spec-consistency-check.md` and follow its process.

Checks five dimensions of cross-spec consistency: type consistency, naming consistency,
contract consistency, completeness, and traceability.
```

Pipeline diagram updated:
```
Research Doc  ->  Proposal  ->  Review  ->  Merge to System Docs  ->  Verify
                                                                        |
                                                          [YOU ARE HERE — all below]
                                                                        |
                                                     Spec Generation (waterfall)
                                                                        |
                                                     Spec Consistency Review
                                                                        |
                                                     Start (generate TASKS.md)
                                                                        |
                                                     Run (implement queue)
                                                          |         |
                                                    Fix tasks   Spec gaps
                                                          |         |
                                                     Verify       Feed back
                                                          |      to pipeline
                                                     Working Code
```

**D. Removing `context: fork`**: The current doc-spec-gen uses `context: fork` in its
frontmatter. The cl-implementer does NOT use fork (it needs interactive context for
run/autopilot modes). The heavy reading in spec mode is handled by the existing subagent
dispatch pattern (Step 2: "dispatch subagents in parallel, one per doc"). This provides
the same isolation without requiring the entire skill to fork.

### 3. Slash Command Migration

Users currently type:
```
/doc-researcher research "topic"
/doc-reviewer review
/doc-spec-gen generate
/ui-designer setup
/implementer start
```

After rename:
```
/cl-researcher research "topic"
/cl-reviewer review
/cl-implementer spec           ← was /doc-spec-gen generate
/cl-implementer spec-review    ← was /doc-spec-gen review
/cl-designer setup
/cl-implementer start
```

### 4. Cross-Reference Update Rules

Every reference to an old skill name is updated mechanically:

| Old | New | Context |
|---|---|---|
| `doc-researcher` | `cl-researcher` | Everywhere |
| `/doc-researcher` | `/cl-researcher` | Slash command references |
| `doc-reviewer` | `cl-reviewer` | Everywhere |
| `/doc-reviewer` | `/cl-reviewer` | Slash command references |
| `doc-spec-gen` | `cl-implementer` | Skill name references |
| `/doc-spec-gen generate` | `/cl-implementer spec` | Command references |
| `/doc-spec-gen review` | `/cl-implementer spec-review` | Command references |
| `/doc-spec-gen` | `/cl-implementer spec` | Generic references |
| `ui-designer` | `cl-designer` | Everywhere |
| `/ui-designer` | `/cl-designer` | Slash command references |
| `implementer` | `cl-implementer` | Skill name references (careful: don't rename "implementer" when it means "the code that implements", only when it means the skill) |
| `/implementer` | `/cl-implementer` | Slash command references |

**Special care for `implementer`**: The word "implementer" appears in two contexts:
1. As a skill name → rename to `cl-implementer`
2. As a generic noun ("the implementer writes code") → leave unchanged

The heuristic: if preceded by `/` or in a context that clearly refers to the skill
(e.g., "the implementer skill", "run implementer", "implementer start mode"), rename.
If used as a generic noun ("the AI implementer decides"), leave as-is.

### 5. Documentation File Renames

| Old | New |
|---|---|
| `docs/implementer.md` | `docs/cl-implementer.md` |
| `docs/doc-researcher.md` | `docs/cl-researcher.md` |
| `docs/doc-reviewer.md` | `docs/cl-reviewer.md` |
| `docs/doc-spec-gen.md` | `docs/cl-implementer.md` (fold content into spec section) |
| `docs/ui-designer.md` | `docs/cl-designer.md` |

The `docs/doc-spec-gen.md` content is merged into `docs/cl-implementer.md` as a new
"Spec Mode" and "Spec Review Mode" section, placed before the existing "Start" section
to reflect the pipeline order.

### 6. README.md Updates

**Skills table** becomes:

```markdown
| Skill | Command | What It Does |
|-------|---------|-------------|
| **cl-researcher** | `/cl-researcher` | Bootstraps initial docs, triages complexity, runs multi-turn research conversations, plans document structure, generates proposals, creates per-library context files |
| **cl-reviewer** | `/cl-reviewer` | Reviews proposals against all system docs, manages fix cycles, merges to protected system docs, verifies merges, runs system-wide audits, checks code-doc alignment, reviews designs |
| **cl-designer** | `/cl-designer` | Runs design discovery conversations, generates design tokens and component libraries, creates screen mockups with visual feedback loops, produces implementation task breakdowns |
| **cl-implementer** | `/cl-implementer` | Generates specs from verified docs, runs cross-spec consistency checks, generates unified task queues, tracks implementation progress, handles runtime failures and regressions, reconciles external changes, feeds spec gaps back into the pipeline |
```

**Command examples** updated throughout.

**Project structure** updated to show `cl-*` directories.

## Design Decisions

| Decision | Alternatives Considered | Rationale |
|---|---|---|
| `cl-*` prefix (not `clarity-*`) | `clarity-researcher`, `loop-researcher`, no prefix | `cl-` is short enough for frequent typing, clearly namespaced, avoids collision with other tools |
| Fold spec-gen into implementer (not researcher) | Into cl-researcher (owns preparation), standalone (keep as-is) | Implementer is the consumer of specs. Eliminates handoff. Waterfall gate is an implementation prerequisite, not a research activity. |
| Remove `context: fork` from spec mode | Keep fork via skill-level setting, add per-mode fork | Implementer needs interactive context for run/autopilot. Subagent dispatch in Step 2 provides equivalent isolation for the heavy read without forking the entire skill. |
| Rename doc files alongside skills | Keep old doc filenames with redirects | Clean break. Old names would confuse new users. No backward compatibility concern (plugin not yet widely deployed). |
| Update research/proposal docs (Part G) | Leave historical docs unchanged | Consistency matters. Old names in existing docs would confuse anyone reading them after the rename. |

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Missed reference (old name survives) | Medium | Low | Post-merge grep for all old names. Any survivor is a cosmetic bug, not a functional one. |
| "implementer" as generic noun incorrectly renamed | Medium | Low | Manual review of each "implementer" reference. Context makes intent clear in most cases. |
| Users with existing projects reference old skill names | Low | Medium | Plugin not yet widely deployed. Add migration note to README: "Skills renamed in v0.2.0." |
| Spec mode loses fork isolation benefits | Low | Low | Subagent dispatch in Step 2 provides equivalent isolation. Monitor for context pressure in large projects. |
| Plugin auto-discovery breaks with renamed directories | Low | High | `plugin.json` points to `./skills/` which auto-discovers by directory name. New directory names become the new skill identifiers. Test with `claude plugin validate`. |

## Open Items

1. **Should the `cl-` prefix be configurable?** Probably not — consistency across all
   installations matters more than customization.

2. **Version bump**: Should this be v0.2.0 given the breaking rename? Recommend yes.

3. **Hooks**: Verified — `hooks.json` contains no skill name references. It only
   references JS file paths (`${CLAUDE_PLUGIN_ROOT}/hooks/...`) and tool name matchers
   (`Edit`, `Write`). No changes needed to `hooks.json`.

## Appendix: Reference Count Summary

Full inventory of references by file (from exploration agent):

- **625 total references** across **45 files**
- `doc-researcher`: 107 refs
- `doc-reviewer`: 99 refs
- `doc-spec-gen`: 77 refs
- `ui-designer`: 98 refs
- `implementer`: 244 refs (includes generic noun usage — actual skill refs ~180)

Top files by reference count:
1. PIPELINE_GAP_ANALYSIS.md (87 refs)
2. IMPLEMENTER_SKILL.md proposal (84 refs)
3. POST_SPEC_IMPLEMENTATION_TRACKING.md (59 refs)
4. CONTEXT_SYSTEM.md proposal (57 refs)
5. README.md (28 refs)

The majority of changes are mechanical find-and-replace. The only non-trivial change is
the spec-gen fold (Part B), which requires content restructuring.
