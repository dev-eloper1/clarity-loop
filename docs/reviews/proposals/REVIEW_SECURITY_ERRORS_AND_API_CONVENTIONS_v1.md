# Review: Security, Errors, and API Conventions

**Reviewed**: 2026-02-09
**Proposal**: docs/proposals/SECURITY_ERRORS_AND_API_CONVENTIONS.md
**System docs referenced**: skills/cl-implementer/SKILL.md, skills/cl-implementer/references/spec-mode.md, skills/cl-implementer/references/run-mode.md, skills/cl-implementer/references/verify-mode.md, skills/cl-implementer/references/spec-consistency-check.md, skills/cl-researcher/SKILL.md, skills/cl-researcher/references/bootstrap-guide.md, docs/cl-implementer.md, docs/cl-researcher.md, docs/pipeline-concepts.md
**Research doc**: docs/research/PIPELINE_GAP_ANALYSIS.md (Findings F21, F22, F26, F27, F34, F35)

## Summary

This proposal addresses six genuine gaps identified in the Pipeline Gap Analysis -- security specification, error taxonomy, API conventions, shared types, dependency supply chain verification, and cross-cutting backend policy coverage (partial). The changes span three pipeline stages (bootstrap, spec generation, implementation/verification) and touch nine target files across skills, reference files, and public-facing docs. The proposal is well-structured, clearly grounded in research, and appropriately scoped. It correctly identifies that P0.5 already handled most bootstrap probing through the project profile system and defaults sheet, narrowing Change Area 8 to security-specific depth probing only. The Change Manifest is complete and traceable. The progressive disclosure analysis (Context Budget section) is a welcome addition that prior proposals lacked. The primary concerns are around context budget compliance for spec-mode.md and a forward-reference in the existing decision flow guideline that needs coordination awareness.

## Verdict: APPROVE WITH CHANGES

## Cross-Proposal Conflicts

### TESTING_PIPELINE.md (P2)

P2 and P3 both modify the same file and section: `skills/cl-implementer/references/spec-mode.md`, Step 4 (Generate Specs) and Step 5 (Generate Spec Manifest). P2 adds TEST_SPEC.md generation as Step 4a, and P3 adds SECURITY_SPEC.md as Step 4a, error taxonomy as Step 4b, API conventions as Step 4c, and shared types as Step 4d.

**Resolution**: The proposals use different step numbers (P2 uses 4a for testing; P3 uses 4a-4d for security/error/API/types). When merging, these need to be renumbered into a coherent sequence. The proposal acknowledges this is parallel work that can be applied in any order, but the concrete step numbering will collide. The merge author should establish a canonical ordering (suggest: 4a test spec, 4b security spec, 4c error taxonomy, 4d API conventions, 4e shared types -- or group by concern).

P2 and P3 both modify the spec manifest (Step 5) to add new spec artifact rows. These are purely additive and non-conflicting.

P2 also modifies `bootstrap-guide.md` Step 2 for testing probes, and P3 modifies the same section for security probes. Both are additive to different question clusters. Non-conflicting.

### BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md (P1)

P1 Change 5 adds behavioral probing questions to `bootstrap-guide.md` Step 2. P3 Change 12 adds security probing questions to the same section. Both are additive -- P1 adds to the "Then dig deeper" section for behavioral questions, P3 replaces it with a split (functional + security/data). These WILL conflict textually because P3 proposes to REPLACE the "Then dig deeper (conversational)" section while P1 proposes to ADD to it. The merge author needs to combine both sets of additions into the restructured format P3 proposes.

### IMPLEMENTER_SKILL.md and CONTEXT_SYSTEM.md

The proposal correctly identifies these as non-conflicting. IMPLEMENTER_SKILL.md creates the cl-implementer skill structure that P3 modifies sections within. CONTEXT_SYSTEM.md modifies the researcher's context mode, not bootstrap. Confirmed -- no conflict.

### PIPELINE_UX_OPTIMIZATION.md (P0.5)

P0.5 is marked as complete. The proposal correctly builds on P0.5 infrastructure: decision flow protocol, tiered checkpoints, project profile system, defaults sheet, and warmth gradient. The decision flow guideline in SKILL.md (lines 292-297) already references SECURITY_SPEC.md and API conventions -- this was P0.5 forward-referencing P3's artifacts. P3 should acknowledge this explicitly as intentional coordination rather than leaving it implicit.

## Blocking Issues

### 1. Context Budget Violation Risk for spec-mode.md

- **Dimension**: Completeness & Gaps (Context Budget section)
- **Where**: Change Areas 1-5 (all adding to spec-mode.md Step 4)
- **Issue**: The proposal's own Context Budget section (Rule 3) states: "Large tables and catalogs go in separate files. If a change adds a table with >10 rows, it should be a separate reference file loaded only when needed." The proposal adds significant content to spec-mode.md: Step 4a (SECURITY_SPEC.md generation, ~90 lines with 6 tables including per-endpoint security table, system-level security table, secure UX patterns table, dependency governance table, accessibility requirements table, and standard edge cases table), Step 4b (error taxonomy, ~70 lines with 4 tables), Step 4c (API conventions, ~40 lines with 1 large table), and Step 4d (shared types, ~50 lines with 3 tables). Combined, this adds roughly 250+ lines to spec-mode.md, which is currently 168 lines. The result would be ~420 lines, likely exceeding the 3000-token budget for a reference file.
- **Why it matters**: The proposal sets its own context budget rules as a "Hard Requirement" and states "No reference file exceeds ~3000 tokens after changes" during merge validation. Violating this in the same proposal undermines the rule's credibility.
- **Suggestion**: Extract the security spec template (Step 4a), error taxonomy template (Step 4b), API conventions template (Step 4c), and shared types template (Step 4d) into a shared reference file, e.g., `skills/cl-implementer/references/cross-cutting-specs.md`. The spec-mode.md Step 4 would then say: "Read `references/cross-cutting-specs.md` and generate the cross-cutting specification artifacts." This follows the proposal's own Rule 5 ("Shared content uses references, not duplication") and Rule 3 ("Large tables go in separate files"). The edge cases table (7 rows) and accessibility table (4 rows) are small enough to potentially stay inline per Rule 6, but grouping them with the rest keeps the extraction clean.

### 2. Bootstrap Change Conflicts with P1 Textually

- **Dimension**: External Consistency
- **Where**: Change Area 8 (Change 12), bootstrap-guide.md Step 2
- **Issue**: P3 Change 12 proposes to REPLACE the "Then dig deeper (conversational)" section with a restructured version that splits into "dig deeper -- functional" and "dig deeper -- security and data." P1 Change 5 proposes to ADD behavioral probing questions to the same "Then dig deeper (conversational)" section. If P1 merges first, P3's replacement text will lose P1's behavioral questions. If P3 merges first, P1's addition target no longer exists. The cross-proposal conflicts table in P3 does not mention P1 at all.
- **Why it matters**: Without explicit merge ordering or combined text, one proposal's changes will silently overwrite the other's.
- **Suggestion**: Add P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md) to the Cross-Proposal Conflicts table. Note that both proposals modify bootstrap-guide.md Step 2 "Then dig deeper" section and specify the combined text. The combined version should have three sections: "dig deeper -- functional" (existing questions), "dig deeper -- behavioral" (P1's behavioral questions), and "dig deeper -- security and data" (P3's security questions). Alternatively, state the merge order: "If P1 lands first, P3's replacement text must incorporate P1's behavioral questions. If P3 lands first, P1's additions should target the new 'dig deeper -- functional' subsection."

## Non-Blocking Suggestions

### 1. Forward-Reference Acknowledgment in Decision Flow Guideline

- **Dimension**: External Consistency
- **Where**: Change Area 9, Change 15 (SKILL.md Guidelines)
- **Issue**: The existing decision flow guideline (P0.5, lines 292-297) already references `SECURITY_SPEC.md` and "API conventions" -- artifacts that do not yet exist in the system until P3 is merged. P3 adds two new guidelines after this one but does not note that the decision flow guideline was intentionally forward-referencing P3. This is benign but could confuse a reader who notices SECURITY_SPEC.md is referenced in a guideline that predates the proposal creating it.
- **Suggestion**: Add a brief note in the "Current" quote for Change 15: "Note: This guideline (from P0.5) already forward-references SECURITY_SPEC.md and API conventions in anticipation of this proposal." This makes the coordination explicit.

### 2. Error Taxonomy Inline vs. Separate File Tension

- **Dimension**: Internal Coherence
- **Where**: Design Decisions table, row "Error taxonomy inline in API specs"
- **Issue**: The design decision says error taxonomy is "inline in API specs" because it's "relatively compact (~1 page)" and "avoids a file lookup during implementation." However, the actual proposed content (Step 4b) is ~70 lines with 4 tables, and the proposal also adds it to the spec manifest as a cross-cutting spec. The error taxonomy is defined system-wide (one format, one code system, one propagation chain) and referenced per-endpoint (per-endpoint error catalog). This is structurally similar to SECURITY_SPEC.md, which gets its own file. The argument for inlining weakens when considering that spec-mode.md generates it as a distinct step (4b) and the spec manifest lists it separately.
- **Suggestion**: Consider whether the error taxonomy should be a standalone file (e.g., `ERROR_TAXONOMY.md` in specs/) alongside SECURITY_SPEC.md. This would be more consistent with how SECURITY_SPEC.md is handled and would avoid bloating individual API spec files. If the decision to inline stands, add a sentence explaining why the error taxonomy is different from SECURITY_SPEC.md in terms of consumption pattern (every API spec file needs the format visible vs. security spec is consulted per-endpoint).

### 3. Spec Consistency Check Heading Count Update

- **Dimension**: Internal Coherence
- **Where**: Change Area 7 (Change 11), spec-consistency-check.md
- **Issue**: The proposal adds Dimension 6 (API Convention Adherence) to spec-consistency-check.md. The file currently has a heading "Five Consistency Dimensions" (line 12). The proposal mentions this in the System Context table ("Heading says 'Five Consistency Dimensions'") but Change 11 does not explicitly include updating this heading to "Six Consistency Dimensions." Similarly, the SKILL.md Spec Review Mode section (line 156) says "Checks five dimensions" -- and the proposal does not include a change to update this to six.
- **Suggestion**: Add explicit changes to: (a) update the spec-consistency-check.md heading from "Five" to "Six Consistency Dimensions," and (b) update SKILL.md Spec Review Mode description (line 156) from "five dimensions" to "six dimensions." These are small but if missed during merge will create internal inconsistencies.

### 4. Verify Mode Heading Count Update

- **Dimension**: Internal Coherence
- **Where**: Change Area 6 (Change 9), verify-mode.md
- **Issue**: Similar to the spec consistency check, verify-mode.md has a heading "Four Verification Dimensions" (line 15). The proposal adds Dimension 5 but does not explicitly include updating this heading to "Five Verification Dimensions."
- **Suggestion**: Add an explicit change to update the verify-mode.md heading from "Four" to "Five Verification Dimensions."

### 5. Open Item 2 -- Config Key Premature

- **Dimension**: Spec-Readiness
- **Where**: Open Items, item 2
- **Issue**: Open Item 2 proposes a `.clarity-loop.json` config key `security.dependencyGovernance: "advisory" | "strict"`. This introduces a new config namespace (`security.*`) outside the existing `ux.*` and `implementer.*` namespaces established by P0.5. The pipeline-concepts.md Configuration section would need updating, but this file is not in the Change Manifest. Additionally, introducing a config key in an open item (not the detailed design) means the key's behavior, defaults, and interaction with DECISIONS.md `dependencies` category are unspecified.
- **Suggestion**: Either promote this to a concrete design decision in the Detailed Design section (adding a Change 20 to pipeline-concepts.md Configuration) or defer it entirely to a follow-up. The current "open item" status leaves it ambiguous whether the merge should include this config key or not.

### 6. Accessibility Section Scope Creep

- **Dimension**: Value Assessment
- **Where**: Change Area 1, Step 4a, "Per-Spec Accessibility Requirements"
- **Issue**: The accessibility requirements section in Step 4a (ARIA attributes, keyboard interaction, focus management, screen reader support) overlaps significantly with P1 (BEHAVIORAL_SPECS_AND_DESIGN_PHASE.md), which adds accessibility to the design phase: component behavioral states include ARIA attributes, keyboard interaction models, and focus behavior. The research grouping places accessibility (F7) in P1, not P3. This proposal's Research Lineage table references F21 and F26 for Change 5 (edge cases and accessibility), but F7 (accessibility) is not listed.
- **Suggestion**: Clarify the boundary between P1's design-phase accessibility (component-level ARIA, keyboard models during design) and P3's spec-phase accessibility (per-implementation-spec requirements). If P1 captures accessibility during design and those decisions flow into specs, P3's accessibility section may be redundant. Consider either: (a) removing the accessibility section from P3 and letting P1 handle it, (b) keeping it but clearly noting it only generates spec-level accessibility requirements from decisions already captured by P1's design phase, or (c) noting in the Research Lineage that F7 is partially used here and explaining the boundary.

## Spec-Readiness Notes

The proposal is close to spec-ready with the blocking issues resolved. Specific notes:

1. **Step numbering**: Steps 4a-4d in spec-mode.md will need coordination with P2's Step 4a (TEST_SPEC.md). The merge author should establish a canonical ordering before generating specs from this proposal.

2. **Token cost estimates**: The proposal's Context Budget section requires token cost estimates per change but does not provide them. During merge, estimate the token cost of each addition to spec-mode.md, run-mode.md, and verify-mode.md to verify compliance with the 3000-token budget.

3. **Open Items 1-5**: Items 1 (customizable error codes), 3 (existing security infrastructure), and 4 (multiple API styles) are implementation-time decisions that don't block the proposal. Item 2 (config key) should be resolved before merge (see Non-Blocking Suggestion 5). Item 5 (OWASP mapping) is a nice-to-have that can be added later.

4. **The "Note: unchanged by P0.5" annotation**: In the pipeline-concepts.md Directory Structure section (line 1031), there's a note "(Note: unchanged by P0.5 -- the directory structure section was not modified)." P3's Change 19 proposes to modify this section. The merge should remove this stale annotation.

## Consistency Map

| System Doc | Status | Notes |
|------------|--------|-------|
| `skills/cl-implementer/SKILL.md` | Consistent | Proposal correctly identifies lines 140-148 (Spec Mode), 196-203 (Verify Mode), 243-298 (Guidelines). Decision flow guideline already forward-references SECURITY_SPEC.md from P0.5. |
| `skills/cl-implementer/references/spec-mode.md` | Consistent | Proposal correctly maps to Step 4 (lines 97-107) and Step 5 (lines 108-133). Content additions are accurate against current file. Context budget concern flagged above. |
| `skills/cl-implementer/references/run-mode.md` | Consistent | Proposal correctly maps to Step 3c (lines 104-132) and Step 4 (lines 157-288). Fix task types match current list. |
| `skills/cl-implementer/references/verify-mode.md` | Consistent | Proposal correctly maps to Dimension 4 and Output sections. Heading count issue flagged above. |
| `skills/cl-implementer/references/spec-consistency-check.md` | Consistent | Proposal correctly identifies five dimensions and output format. Heading count issue flagged above. |
| `skills/cl-researcher/references/bootstrap-guide.md` | Consistent | Proposal correctly identifies Step 2 "Then dig deeper" section (lines 58-62). P0.5 profile system and defaults sheet are accurately described. P1 conflict flagged above. |
| `docs/cl-implementer.md` | Consistent | Proposal correctly quotes the Spec section (Design Artifact Integration) and Verify section (four dimensions table). |
| `docs/cl-researcher.md` | Consistent | Proposal correctly quotes the Greenfield bootstrap description (lines 28-31). |
| `docs/pipeline-concepts.md` | Consistent | Proposal correctly identifies the Directory Structure section and its current contents. Config section and DECISIONS.md categories are accurately referenced. |

## Strengths

1. **Excellent P0.5 integration**: The proposal thoroughly understands and builds on P0.5's infrastructure rather than duplicating it. Change Area 8 is correctly narrowed because the profile system already handles most bootstrap probing. Tier assignments for dependency verification findings (Tier 1/2/3) follow P0.5's checkpoint model. Decision flow references use the existing category tag system.

2. **Comprehensive Change Manifest**: 19 changes across 9 files with clear type classifications and research references. Every change is traceable to a specific research finding. The scope boundary statement explicitly excludes files that are tempting but out-of-scope (autopilot-mode.md, cl-designer, cl-reviewer).

3. **Context Budget section**: This is the first proposal in the pipeline to include explicit progressive disclosure rules and merge validation criteria. Setting a 3000-token budget per reference file and 200-line limit per SKILL.md is a valuable precedent. Other proposals should adopt this.

4. **Additive design**: All changes are additive -- existing functionality is preserved, new capabilities are layered on top. No existing behavior is removed or modified. The migration section correctly identifies zero backward compatibility concerns.

5. **Tiered severity for supply chain findings**: The graduated response (block critical/high, warn medium/low) is pragmatic and avoids false-positive fatigue. The distinction between registry existence check (pre-install) and vulnerability audit (post-install) addresses different AI-specific risks appropriately.

6. **Design decisions table**: Well-reasoned with genuine alternatives considered. The rationale for separate SECURITY_SPEC.md file vs. inline, for blocking only critical CVEs, and for registry pre-check are all defensible and clearly argued.

7. **Integration with existing DECISIONS.md categories**: The proposal leverages `security`, `auth`, `api-style`, `dependencies`, `type-sharing`, and `accessibility` category tags that P0.5 already established, rather than inventing new decision surfaces.

## Risk Assessment

1. **Merge ordering complexity**: With P1, P2, and P3 all modifying overlapping files (spec-mode.md, bootstrap-guide.md, SKILL.md, cl-implementer.md), the merge order matters. P3's own cross-proposal conflicts table only mentions P0, P0.5, IMPLEMENTER_SKILL.md, and CONTEXT_SYSTEM.md -- it omits P1 and P2 (which are the actual sources of textual conflict). Risk: moderate. Mitigation: flagged in blocking issues; the merge author must handle renumbering and section combining.

2. **Spec-mode.md becoming a bottleneck file**: After P2 and P3 merge, spec-mode.md will have grown from 168 lines to potentially 500+ lines, accumulating test spec generation, security spec generation, error taxonomy, API conventions, shared types, edge cases, and accessibility. This risks violating the progressive disclosure model where reference files are mode-scoped and lean. Risk: moderate. Mitigation: the context budget extraction suggested in Blocking Issue 1.

3. **npm-centric assumptions**: Dependency verification (Changes 7-10) assumes npm as the package manager (`npm view`, `npm audit`, `npm install`, `npm ci`). The proposal parenthetically says "or equivalent" but the specific commands, flags, and behavior are all npm. Projects using yarn, pnpm, bun, or non-JavaScript stacks would need adaptation. Risk: low (the pipeline is TypeScript-focused based on system docs). Mitigation: the "(or equivalent)" note covers the intent; specific adaptations happen at implementation time.

4. **Security spec becoming a checklist rather than a specification**: The SECURITY_SPEC.md template is heavily table-driven (6 tables in Step 4a alone). There's a risk that the spec generator produces a "fill in all tables" artifact without genuine analysis of the project's threat surface. The conditional logic ("If the system has no auth flows, skip this section") partially addresses this, but the template's density may encourage mechanical completion. Risk: low. Mitigation: the conditional generation and project profile system (security depth: Standard/High/Skip) should prevent this.
