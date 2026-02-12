# Pipeline Interaction Audit

**Date**: 2026-02-11
**Scope**: All 4 Clarity Loop plugin skills, all SKILL.md files and reference files
**Purpose**: Identify every user interaction point and classify optimization opportunities

---

## cl-researcher

| Mode | File | Line(s) | Interaction Type | Current Behavior | Optimization |
|------|------|---------|-----------------|-----------------|-------------|
| session-start | SKILL.md | 108-138 | Feedback loop | Reads pipeline state, surfaces stale markers, active research, approved-no-proposal situations, then orients user with 2-3 sentences and asks what they want to do | Tier 3 auto-proceed: Orientation is informational; auto-display and proceed unless stale marker found (which is Tier 1) |
| session-start | SKILL.md | 110-113 | Confirmation gate | Detects stale `.pipeline-authorized` marker and tells user to resolve before starting new work | Tier 1 checkpoint: Keep -- stale marker is a high-stakes state corruption issue |
| session-start | SKILL.md | 130-133 | Feedback loop | If active research exists, asks "continue or start new?" | Decision flow: Check RESEARCH_LEDGER.md status and auto-suggest; only ask if genuinely ambiguous (2+ active items) |
| triage | SKILL.md | 217 | Sequential Q&A | "Ask the user what they want to research (if not already stated)" | Tier 3 auto-proceed: Skip if the topic was already stated in the invocation command |
| triage | SKILL.md | 219-221 | Confirmation gate | Presents complexity assessment: "This looks like Level [N]... Does that match your sense?" User confirms or overrides | Tier 2 batch: Present assessment + recommended pipeline depth as a single card; user approves or overrides in one response |
| research | SKILL.md | 272-276 | Sequential Q&A | Phase 2 starts with 3 questions: "What problem?", "What prompted this?", "Does this relate to existing system?" | Generate-confirm: After reading system docs, generate a draft scope/requirements sheet pre-filled with inferred answers, present as table for user to confirm/edit |
| research | SKILL.md | 279-300 | Sequential Q&A | "Then dig deeper" -- asks evolutionary questions (3), net new questions (3), and general questions (4) -- up to 10 follow-up questions asked conversationally | Generate-confirm: Generate a Scope & Constraints table pre-populated from system doc analysis + triage context; user corrects deltas rather than answering 10 questions |
| research | SKILL.md | 303-310 | Confirmation gate | "Don't move to Phase 3 until the user confirms" scope, questions, and constraints. Asks: "Should I go ahead and research this, or do you want to adjust?" | Tier 1 checkpoint: Keep -- research scope confirmation is a high-stakes gating decision |
| research | SKILL.md | 355-362 | Feedback loop | Phase 5: Generates doc, tells user, stays in conversation to refine iteratively. When satisfied, user confirms approval | Tier 1 checkpoint: Keep -- research approval gates the entire downstream pipeline |
| structure | SKILL.md | 391-395 | Confirmation gate | Presents structure suggestion: "Does this match your vision?" User confirms/modifies/rejects | Tier 2 batch: Present structure plan as a complete table with rationale; user approves, edits inline, or rejects in one pass |
| structure | document-plan-template.md | 82-86 | Confirmation gate | Step 4: Suggest and Confirm -- user can Approve/Modify/Reject, then structure is locked | Tier 1 checkpoint: Keep -- lock semantics mean this is an irreversible commitment |
| proposal | SKILL.md | 427-431 | Feedback loop | After generating, tells user where it is and says "Read it over and let me know when you'd like to run it through the review gate" | Tier 3 auto-proceed: This is informational handoff, not a blocking question. Auto-proceed to next available action |
| proposal | proposal-template.md | 72-80 | Feedback loop | Step 6: Present and Handoff -- summarizes and waits for user to decide when to submit for review | Tier 3 auto-proceed: Same as above -- informational, no decision needed |
| bootstrap-greenfield | bootstrap-guide.md | 52-68 | Sequential Q&A | Step 2 Discovery: Asks 4 initial questions ("What does this do?", "Who is it for?", "Key components?", "Tech stack?") then 5 deeper questions ("workflows?", "integrations?", "key decisions?", "requirements?", "scope?") -- 9 questions total | Generate-confirm: For brownfield-with-code, pre-analyze codebase and generate a project summary table. For greenfield, generate a discovery template with prompts the user fills in as a single form |
| bootstrap-greenfield | bootstrap-guide.md | 75-89 | Confirmation gate | Step 3: Suggests initial doc set. "Does this cover the key aspects, or should we add/remove any?" | Tier 2 batch: Present recommended doc set as a checklist with one-line descriptions; user checks/unchecks and confirms once |
| bootstrap-brownfield-docs | bootstrap-guide.md | 132-138 | Sequential Q&A | Step 1: "Ask the user where their existing docs are" | Generate-confirm: Auto-discover docs in project root, docs/, README.md, etc. Present findings rather than asking |
| bootstrap-brownfield-docs | bootstrap-guide.md | 148-165 | Format/option choice | Step 2: Presents Path A (import as system docs) vs Path B (import as research context) and asks user to choose | Tier 1 checkpoint: Keep -- import path choice fundamentally changes downstream behavior |
| bootstrap-brownfield-docs | bootstrap-guide.md | 171-185 | Confirmation gate | Step 3A: Presents doc mapping table. "Does this mapping look right?" | Tier 2 batch: Present the full mapping table; user approves or edits inline in one pass |
| bootstrap-brownfield-code | bootstrap-guide.md | 247-254 | Sequential Q&A | Step 2 Discovery: References code findings and asks follow-up questions about intent, constraints, future direction | Generate-confirm: Pre-generate a project summary from code analysis; present as a table with "Inferred" and "Confirm/Edit" columns |
| context | context-mode.md | 16-19 | Confirmation gate | Auto-offer during bootstrap: "Want me to research current docs and create context files?" User can accept all, select specific libraries, or decline | Tier 2 batch: Present library list with checkboxes; user selects and confirms in one response |
| context | context-mode.md | 45-49 | Format/option choice | Step 1: Presents library status list with create/skip/update options per library. "Select which to process, or 'all' for everything" | Tier 2 batch: Already batch-style; keep but present as a single table with action column the user edits |
| context | context-mode.md | 103-119 | Confirmation gate | Step 3: Present distilled context to user for review before writing. "Does this look right? Anything to add or remove?" | Tier 2 batch: Present findings as a structured summary; user approves or annotates in one pass |
| context | context-mode.md | 253-268 | Confirmation gate | Updating existing context: Presents diff summary between old and new versions | Tier 2 batch: Present version comparison table; user confirms update direction |
| context | context-mode.md | 360-365 | Confirmation gate | Promotion: "Promote to global? [Y/n]" -- asked once per library per project after successful implementation | Tier 3 auto-proceed: Low-stakes convenience feature; auto-promote with audit trail, user can revert |
| context | context-mode.md | 371-373 | Confirmation gate | Global refresh: "Create a project-local override? [Y/n]" when global context version differs from project | Tier 2 batch: Present version mismatch + recommended action; user confirms or dismisses |

## cl-designer

| Mode | File | Line(s) | Interaction Type | Current Behavior | Optimization |
|------|------|---------|-----------------|-----------------|-------------|
| session-start | SKILL.md | 86-113 | Feedback loop | Pipeline state check, design state check. Reports existing progress and suggests next step | Tier 3 auto-proceed: Informational orientation; auto-display and continue to requested mode |
| session-start | SKILL.md | 101-105 | Confirmation gate | If DESIGN_PROGRESS.md is corrupted: "Want me to re-run setup or reconstruct from artifacts?" | Tier 1 checkpoint: Keep -- choosing between re-run and reconstruct is a significant fork |
| setup | setup-mode.md | 8-14 | Confirmation gate | Re-running setup: "Design progress exists... Re-running setup will reset design direction... Continue?" | Tier 1 checkpoint: Keep -- destructive reset of design state |
| setup | setup-mode.md | 53-65 | Sequential Q&A | Step 1 Visual References: Asks for screenshots/mockups, then component library, then inspiration apps/sites -- 3 sequential questions | Generate-confirm: Ask all three as a single prompt ("Share any of: screenshots, component library choice, inspiration sites") and process whatever the user provides |
| setup | setup-mode.md | 69-86 | Feedback loop | If user names a component library, runs mini research cycle and presents defaults: "Here's what [library] uses... Want to change any defaults?" | Tier 2 batch: Present extracted defaults as an editable token table; user modifies values inline rather than back-and-forth |
| setup | setup-mode.md | 96-117 | Sequential Q&A | Step 2 Design Preferences: 6 questions asked conversationally (aesthetic, colors, typography, interaction, theme, constraints) -- instruction says "don't dump all at once" | Generate-confirm: Generate a Design Direction card pre-filled from visual references + library defaults; only ask questions for gaps not covered by prior input |
| setup | setup-mode.md | 129-137 | Confirmation gate | Step 4: Summarizes design direction and asks "Does this capture what you're looking for?" | Tier 1 checkpoint: Keep -- design direction locks affect all downstream modes |
| tokens-pencil | tokens-mode.md | 52-55 | Confirmation gate | Step 1: Presents derived token table. "Review and adjust before I generate them" and waits for user confirmation or adjustments | Tier 2 batch: Present as an editable table; user modifies inline and confirms in one pass |
| tokens-pencil | tokens-mode.md | 157-167 | Serial review | Step 6-7: Shows tokens one section at a time -- Color screenshot -> feedback, Typography screenshot -> feedback, Spacing screenshot -> feedback. 3 serial review cycles | Batch review: Generate all token sections, then present a combined screenshot gallery. User reviews the set and provides batch feedback. Only iterate on sections that need changes |
| tokens-pencil | tokens-mode.md | 178-179 | Confirmation gate | Step 3: Presents component plan. "Add or remove any?" before generating | Tier 2 batch: Present full component list as a checklist derived from PRD; user checks/unchecks and confirms once |
| tokens-pencil | tokens-mode.md | 209-228 | Serial review | Step 4 Visual Validation Loop: For each component (or small batch), screenshots -> present -> gather feedback -> approved/needs changes/rejected. N serial review cycles (one per component group) | Batch review: Generate all components within a category, present category screenshot. Review per category (4-5 categories) not per individual component. Individual iteration only for rejected items |
| tokens-markdown | tokens-mode.md | 233-236 | Confirmation gate | Same as pencil Step 1: present token values, get confirmation | Tier 2 batch: Same optimization -- editable table, single confirm |
| tokens-markdown | tokens-mode.md | 254 | Serial review | "Present each component spec to the user for feedback" -- one-by-one component review | Batch review: Present all component specs as a catalog document; user reviews and marks items needing changes |
| tokens-all | tokens-mode.md | 328-329 | Confirmation gate | Checklist gate: "Read design-checklist.md and run Tokens Checklist. Present results to user" | Tier 2 batch: Present checklist results as a pass/fail table; user decides on gaps in one response |
| tokens-all | design-checklist.md | 21-24 | Confirmation gate | Item 8: "Explicit user confirmation that the design system is ready for mockups" + "These gaps remain... Proceed anyway or address first?" | Tier 1 checkpoint: Keep -- gates entry to mockups mode |
| mockups | mockups-mode.md | 27-36 | Confirmation gate | Step 1: Presents screen inventory table. "Add, remove, or reorder?" and waits for confirmation | Tier 2 batch: Present as an editable checklist; user modifies and confirms in one pass |
| mockups-pencil | mockups-mode.md | 50-51 | Confirmation gate | For large projects (10+ screens): "Ask user if they want per-screen overflow files" | Tier 2 batch: Present recommendation with rationale; user approves or overrides |
| mockups-pencil | mockups-mode.md | 87-97 | Serial review | Feedback loop per screen: screenshot -> present with context -> Approved/Needs changes/Major rework. N serial review cycles (one per screen) | Batch review: Generate all screens in a flow group, present as a gallery. Review per flow (3-4 flows) not per screen. Individual iteration only for screens needing rework |
| mockups-pencil | mockups-mode.md | 112-115 | Confirmation gate | Parallel generation: "I can generate faster using separate .pen files. Proceed?" | Tier 3 auto-proceed: If user already approved parallel in a prior step, auto-proceed. Only ask first time |
| mockups-markdown | mockups-mode.md | 172 | Serial review | "Present each screen spec to the user for feedback" -- one-by-one screen review | Batch review: Present all screen specs as a catalog; user reviews the set and flags items needing changes |
| mockups-all | mockups-mode.md | 187 | Sequential Q&A | "Which screens need responsive variants? All of them, or specific ones?" | Generate-confirm: Suggest responsive screens based on PRD mobile/responsive mentions; user confirms or edits the list |
| mockups-all | mockups-mode.md | 253-255 | Confirmation gate | Checklist gate: Run Mockups Checklist, present results to user | Tier 2 batch: Present as pass/fail table; user decides on gaps in one response |
| mockups-all | design-checklist.md | 39-41 | Confirmation gate | Item 6: "Explicit user confirmation that mockups are complete" | Tier 1 checkpoint: Keep -- gates entry to build-plan mode |
| build-plan | build-plan-mode.md | 13-16 | Confirmation gate | If mockups missing: "No screen mockups found. Proceed with tokens-only build plan?" | Tier 2 batch: Present what will be included/excluded; user confirms |
| build-plan | build-plan-mode.md | 171-179 | Confirmation gate | Step 4 User Review: Presents task list summary + dependency graph + parallelizable groups. "Any changes?" | Tier 2 batch: Present complete plan as an editable document; user modifies inline and confirms once |

## cl-implementer

| Mode | File | Line(s) | Interaction Type | Current Behavior | Optimization |
|------|------|---------|-----------------|-----------------|-------------|
| session-start | SKILL.md | 76-103 | Feedback loop | Pipeline state check: stale marker, spec staleness, implementation state. Orients user with summary | Tier 3 auto-proceed: Informational; auto-display and continue. Exception: stale marker is Tier 1 |
| spec | spec-mode.md | 23-47 | Sequential Q&A | Step 1 Waterfall Gate: 4 sequential checks (active research, in-flight proposals, unverified merges, context freshness), each with its own "Continue anyway?" prompt | Tier 2 batch: Run all 4 checks, present a single gate-status table with all warnings. User approves once to proceed past all warnings |
| spec | spec-mode.md | 65-79 | Confirmation gate | Step 3: "Based on the system docs, I recommend generating [format] specs... Does this format work?" | Tier 2 batch: Present format recommendation with rationale table; user confirms or overrides in one response |
| spec-review | spec-consistency-check.md | 1-155 | Feedback loop | Produces a review report and presents it to user. No explicit question but implicit "what do you want to do about this?" | Tier 3 auto-proceed: Report is informational; auto-generate and present. User initiates action if needed |
| start | start-mode.md | 6-8 | Confirmation gate | If TASKS.md already exists: "Re-running start will regenerate from current specs and reset incomplete tasks. Continue?" | Tier 1 checkpoint: Keep -- destructive regeneration of task queue |
| start | start-mode.md | 16-57 | Sequential Q&A | Step 1 Pre-Checks: 5 sequential checks (specs exist, spec review, git repo, spec coverage, context freshness) each with options. Spec coverage offers 3 paths for testing; context freshness offers 3 paths per library | Tier 2 batch: Run all 5 checks, present a single pre-flight checklist table with status per check. Group all warnings with recommended actions. User resolves all in one pass |
| start | start-mode.md | 25-31 | Sequential Q&A | Git repository check: "Initialize now? [Y/n]" then "Create initial commit? [Y/n]" -- 2 sequential questions | Generate-confirm: Present as a single recommendation: "No git repo found. I recommend initializing with an initial commit. [Approve/Skip]" |
| start | start-mode.md | 36-42 | Format/option choice | Spec coverage gap for testing: offers 3 paths (add tasks manually, research testing strategy, skip testing) | Decision flow: Check DECISIONS.md for prior testing decisions; if none, present the 3 options as a single choice card |
| start | start-mode.md | 44-57 | Sequential Q&A | Context freshness: per-library warnings each with 3 options (update/continue/skip). If N libraries, N sequential prompts | Tier 2 batch: Present all library context statuses in one table with action column; user fills in actions and confirms once |
| start | start-mode.md | 167-183 | Confirmation gate | Step 4: Presents parallelizable groups. "Approve? [Y/n/disable]" | Tier 2 batch: Include in the overall plan review (Step 5) rather than as a separate question |
| start | start-mode.md | 188-209 | Confirmation gate | Step 5: Presents full plan (dependency graph, order, parallel groups, task count, gaps). "Any changes?" with reorder/split/merge/skip/add options | Tier 1 checkpoint: Keep -- task plan approval is a high-stakes commitment that shapes the entire implementation |
| run | run-mode.md | 44-58 | Confirmation gate | Step 1 Reconciliation: Presents changes summary. "Re-verify affected tasks before continuing? [Y/n/mark externally-managed]" | Tier 2 batch: Present reconciliation summary with recommended action per changed file; user confirms the batch |
| run | run-mode.md | 66-72 | Confirmation gate | Step 2 Spec Hash Check: "Specs have changed... Run sync or continue with current tasks?" | Tier 1 checkpoint: Keep -- proceeding with stale specs risks wasted implementation work |
| run | run-mode.md | 97-102 | Format/option choice | Step 3b Validity Check: If spec hash mismatch for a task, 3 options (sync/continue/skip) | Tier 2 batch: Group all stale tasks and present once, rather than asking per-task |
| run | run-mode.md | 196-225 | Format/option choice | Step 4 Fix Tasks -- context-gap classification: "Run /cl-researcher context? [Y/n]" or for design-gap: "Run /cl-designer tokens/mockups? [Y/n]" with multiple routing options | Tier 1 checkpoint: Keep -- routing to other skills is a significant pipeline decision |
| run | run-mode.md | 297-305 | Format/option choice | Step 5 Spec Gap Triage L2: "Options: a) Make a call now, b) Run /cl-researcher research to resolve properly" | Tier 1 checkpoint: Keep -- L2 gaps are design-level decisions the user must make |
| run | run-mode.md | 300 | Feedback loop | Step 5 Spec Gap Triage L1: "I'll continue with assumption [Y] unless you disagree" | Tier 3 auto-proceed: State assumption and continue; log to DECISIONS.md. User can interrupt if they disagree |
| autopilot | autopilot-mode.md | 14-26 | Format/option choice | First Run Checkpoint Decision: "How much oversight do you want?" with 4 options (none/phase/N/every) | Decision flow: Check .clarity-loop.json for existing setting. If none, present options as a single card. This is asked only once |
| autopilot | autopilot-mode.md | 34-35 | Confirmation gate | User can change checkpoint at any time by saying "change checkpoint to [level]" | Tier 3 auto-proceed: Log change and continue; no confirmation needed for a user-initiated change |
| autopilot | autopilot-mode.md | 86-88 | Format/option choice | Step 3c: "No test framework detected. Options: a) Set one up, b) Skip, c) Assertion checks only" | Decision flow: Check DECISIONS.md for prior testing framework decisions; if none, present options |
| autopilot | autopilot-mode.md | 100-103 | Confirmation gate | Step 3d: After 3 failed test attempts: "Options: a) Keep debugging, b) Skip, c) Spec/design issue" | Tier 1 checkpoint: Keep -- repeated failures require human judgment |
| autopilot | autopilot-mode.md | 159-185 | Feedback loop | Step 4 Summary Report: Presents checkpoint summary with screenshots needing visual review and failing tasks | Tier 2 batch: Present all review items (screenshots + failures) as a single dashboard; user addresses all at once |
| autopilot | autopilot-mode.md | 228-233 | Feedback loop | Trust Evolution: "The last batch ran clean. Want to reduce checkpoint frequency?" or suggest increasing | Tier 3 auto-proceed: Suggest and auto-adjust with audit trail; user can override. Low-stakes tuning |
| sync | sync-mode.md (impl) | 107-133 | Confirmation gate | Step 7: Presents full sync summary (modified/re-verify/superseded/new/unaffected). "Apply these changes? [Y/n]" | Tier 1 checkpoint: Keep -- sync changes can invalidate completed work |
| verify | verify-mode.md (impl) | 117-128 | Feedback loop | After verification: presents results and creates fix tasks for issues found | Tier 3 auto-proceed: Report is informational; auto-create fix tasks and present summary. User acts on fix tasks through normal queue |

## cl-reviewer

| Mode | File | Line(s) | Interaction Type | Current Behavior | Optimization |
|------|------|---------|-----------------|-----------------|-------------|
| session-start | SKILL.md | 125-155 | Feedback loop | Pipeline state check: stale marker (with 3 sub-cases), proposal statuses. Orients user in 2-3 sentences | Tier 3 auto-proceed: Informational; auto-display and continue. Exception: stale marker resolution is Tier 1 |
| session-start | SKILL.md | 131-136 | Confirmation gate | Stale marker detected: "Should I check what was completed and finish, or clean up and start fresh?" | Tier 1 checkpoint: Keep -- crash recovery requires human judgment on which path to take |
| review | SKILL.md | 369-375 | Feedback loop | Step 5: After writing review, tells user location and gives verbal summary of verdict and blocking issues | Tier 3 auto-proceed: Informational handoff. If verdict is APPROVE, auto-suggest merge. If NEEDS REWORK, auto-suggest fix mode |
| fix | fix-mode.md | 48-50 | Confirmation gate | Step 2: After presenting all blocking issues with suggested fixes: "Want me to proceed with all of them, or do you want to discuss any first?" | Tier 2 batch: Present all fixes as a manifest table; user approves all, deselects specific ones, or flags items for discussion in one response |
| fix | fix-mode.md | 75-79 | Format/option choice | Non-blocking suggestions: "Ask the user if they want to address any while we're editing" | Tier 2 batch: Present blocking fixes + non-blocking suggestions in one view with separate sections; user decides on both at once |
| fix | fix-mode.md | 89-92 | Confirmation gate | User disagrees with blocking issue: becomes a discussion point for re-review | Tier 1 checkpoint: Keep -- disagreement with reviewer findings requires explicit handling |
| merge | merge-mode.md | 37-51 | Confirmation gate | Step 1: Presents merge plan table. "This will modify [N] files and add [M] new sections. Approve?" | Tier 1 checkpoint: Keep -- merge authorization is the highest-stakes gate in the pipeline. Changes canonical system docs |
| merge | merge-mode.md | 110-119 | Confirmation gate | Error handling: "Change #N couldn't be applied... Options: fix and continue, or revert" | Tier 1 checkpoint: Keep -- partial merge recovery requires human judgment |
| merge | merge-mode.md | 123-129 | Confirmation gate | Stale marker: "Previous merge may have been interrupted. Check and finish, or start fresh?" | Tier 1 checkpoint: Keep -- crash recovery |
| correction | correction-mode.md | 71-83 | Confirmation gate | Step 2: Presents corrections manifest. "Review the manifest -- once you approve, I'll make the edits." User can approve all, approve some, or reject | Tier 2 batch: Already batch-style. Present as an editable manifest; user approves/deselects in one pass |
| correction | correction-mode.md | 186-195 | Confirmation gate | Large correction sets: "If audit produces 20+ corrections, batch them. Present 5-10 at a time" | Tier 2 batch: Present all corrections grouped by source/type; user approves groups rather than individual batches of 5-10 |
| audit | audit-mode.md | 1-330 | Feedback loop | Produces comprehensive audit report. No explicit user questions during the process, but report is presented for action | Tier 3 auto-proceed: Audit is fully autonomous -- generates report without user interaction. Keep as-is |
| verify | verify-mode.md (reviewer) | 155-168 | Feedback loop | Step 4: Writes verification file, tells user location, summarizes verdict | Tier 3 auto-proceed: Informational; auto-trigger design nudge and next steps |
| verify | verify-mode.md (reviewer) | 170-183 | Feedback loop | Step 5 Design Nudge: "Your docs describe UI but no design artifacts exist. Run /cl-designer setup when ready" | Tier 3 auto-proceed: Advisory; present once and continue |
| sync | sync-mode.md (reviewer) | 1-223 | Feedback loop | Produces sync report with confirmed drift, potentially stale, and in-sync findings. Advisory output | Tier 3 auto-proceed: Report generation is fully autonomous; present results and let user decide on actions |
| design-review | design-review-mode.md | 1-246 | Feedback loop | Produces design review report. No blocking user interaction during the process | Tier 3 auto-proceed: Review is fully autonomous; generates report without interaction. Keep as-is |
| re-review | re-review-mode.md | 1-149 | Feedback loop | Produces re-review report. No blocking user interaction during the process | Tier 3 auto-proceed: Re-review is fully autonomous; generates report and presents verdict |

---

## Summary

- **Total interaction points found: 78**
- **Sequential Q&A: 14** (opportunities to convert to generate-confirm)
- **Serial review: 5** (opportunities to convert to batch review)
- **Confirmation gates: 39** (candidates for tiered checkpoint classification)
- **Format/option choice: 9** (candidates for decision flow or batch)
- **Feedback loops: 11** (candidates for auto-proceed or batch)

### Breakdown by Optimization Strategy

| Strategy | Count | Description |
|----------|-------|-------------|
| **Tier 1 checkpoint (keep)** | 19 | High-stakes decisions that must remain explicit: merge authorization, structure lock, research approval, crash recovery, design direction lock, destructive resets, L2 spec gaps, pipeline routing |
| **Tier 2 batch** | 27 | Group related items into a single review pass: pre-flight checklists, token tables, component plans, correction manifests, fix lists, reconciliation summaries |
| **Tier 3 auto-proceed** | 16 | Informational outputs that should auto-display and continue: session orientation, report generation, advisory nudges, handoff messages, trust tuning, L1 assumptions |
| **Generate-confirm** | 10 | Replace Q&A with pre-generated defaults: bootstrap discovery, research requirements, design preferences, code-analysis summaries, scope sheets |
| **Batch review** | 5 | Present all items and review as a set: token sections, component groups, screen mockups, component specs, screen specs |
| **Decision flow** | 3 | Read from DECISIONS.md or .clarity-loop.json: testing framework choice, checkpoint level, prior decisions |
| **Parallel generation** | 0 | No current candidates identified for pure parallel pre-generation (some already exist in mockups parallelization) |

### Interaction Density by Skill

| Skill | Total Points | Tier 1 (keep) | Optimizable |
|-------|-------------|---------------|-------------|
| cl-researcher | 22 | 5 | 17 |
| cl-designer | 24 | 5 | 19 |
| cl-implementer | 21 | 6 | 15 |
| cl-reviewer | 11 | 4 | 7 |

### Highest-Impact Optimization Targets

1. **cl-researcher Phase 2 requirements gathering** (SKILL.md lines 272-300): Up to 13 questions asked sequentially. Convert to a pre-generated scope/requirements table that the user edits. Saves 5-10 conversation turns.

2. **cl-designer tokens visual validation** (tokens-mode.md lines 157-228): Serial review of 3 token sections + N component groups, each requiring screenshot-feedback-refine. Convert to batch review per category (present category gallery, iterate only on flagged items). Saves N-1 turns per category.

3. **cl-designer mockups per-screen review** (mockups-mode.md lines 87-97): Serial review of N screens. Convert to flow-group review (present 3-5 screens per flow). Saves significant turns for projects with 10+ screens.

4. **cl-implementer start pre-checks** (start-mode.md lines 16-57): 5 sequential checks each with their own prompt. Consolidate into a single pre-flight dashboard. Saves 4 turns.

5. **cl-designer setup discovery** (setup-mode.md lines 53-117): 3 visual reference questions + up to 6 preference questions asked conversationally. Pre-generate a design direction card from available signals. Saves 3-8 turns.

6. **cl-implementer spec waterfall gate** (spec-mode.md lines 23-47): 4 sequential gate checks each with "Continue anyway?". Consolidate into a single gate-status table. Saves 3 turns.

7. **cl-researcher bootstrap discovery** (bootstrap-guide.md lines 52-68): 9 questions in the greenfield path. For brownfield-with-code, pre-fill answers from code analysis. Saves 5-7 turns.
