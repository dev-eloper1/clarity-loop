## Spec Consistency Check

Reference for the `cl-implementer spec-review` mode. After specs have been generated from
verified system docs, this check ensures all specs are consistent with each other and
with the source system docs.

### When to Run

Run after `/cl-implementer spec` has produced specs in `docs/specs/`. This is the
final quality gate before the start mode generates implementation tasks.

### Six Consistency Dimensions

#### 1. Type Consistency

All specs must agree on the types of shared entities.

Check for:
- Same entity defined with different types across specs (e.g., `id: string` in one spec
  vs. `id: number` in another)
- Enum values that differ between specs for the same field
- Optional vs. required disagreements for shared fields
- Date/time format inconsistencies
- Precision mismatches (e.g., `float` vs. `decimal` for currency)

#### 2. Naming Consistency

All specs must use consistent naming conventions.

Check for:
- Same concept named differently across specs (e.g., `userId` vs. `user_id` vs. `UserID`)
- Abbreviation inconsistencies (e.g., `msg` in one spec, `message` in another)
- Plural/singular disagreements for the same entity
- Casing convention violations within a spec (mixing camelCase and snake_case)
- Entity names that don't match the terminology in system docs

#### 3. Contract Consistency

Specs that define interfaces between components must agree on the contracts.

Check for:
- Request/response shape mismatches between producer and consumer specs
- Event payload disagreements between emitter and handler specs
- Missing error types that one spec expects but another doesn't define
- Version or protocol mismatches
- Authentication/authorization assumptions that differ between specs

#### 4. Completeness

Every significant concept in the system docs should be represented in specs.

Check for:
- System doc sections that describe behavior but have no corresponding spec
- Specs that reference entities not defined in any other spec
- Missing edge cases that the system docs explicitly enumerate
- Integration points described in system docs but not covered by any spec
- Error handling described in system docs but absent from specs

#### 5. Traceability

Every spec should trace back to a specific system doc section.

Check for:
- Specs without a `source` or reference to the system doc they derive from
- Specs that claim to derive from a system doc section but don't match its content
- System doc sections that were significantly updated since spec generation (staleness)
- Orphaned specs that no longer correspond to any system doc content

#### 6. API Convention Adherence

All endpoint specs must follow the conventions defined in the API conventions preamble.

Check for:
- Pagination style inconsistencies (some specs use cursor, others use offset)
- Naming convention violations (some specs use camelCase, others snake_case in JSON)
- Error response format deviations (some specs define custom error shapes)
- Filtering syntax disagreements (some use query params, others use JSON body)
- Response envelope inconsistencies (some wrap in `{data: ...}`, others return raw)
- Rate limiting specification gaps (some endpoints specify limits, others don't)
- Missing API conventions reference (specs that don't declare "Inherits from: API_CONVENTIONS")

If no API conventions preamble exists: skip this dimension but note: "No API conventions
preamble found. Consider generating one to ensure consistency across endpoint specs."

### Output Format

```markdown
# Spec Consistency Review

**Reviewed**: [date]
**Specs checked**: [list all spec files]
**System docs referenced**: [list system docs consulted]
**Spec manifest**: docs/specs/.spec-manifest.md

## Verdict: [CONSISTENT | ISSUES FOUND]

- **CONSISTENT**: All specs agree with each other and trace to system docs.
- **ISSUES FOUND**: Inconsistencies detected that must be resolved before implementation.

## Summary

One paragraph: overall spec health and any patterns in the issues found.

## Type Consistency

| Entity / Field | Spec A | Spec B | Issue |
|---------------|--------|--------|-------|
| [field name] | [type in spec A] | [type in spec B] | [description] |

If no issues: "All shared types are consistent across specs."

## Naming Consistency

| Concept | Variations Found | Recommended Standard |
|---------|-----------------|---------------------|
| [concept] | [name1 (spec A), name2 (spec B)] | [which to standardize on] |

If no issues: "Naming is consistent across all specs."

## Contract Consistency

### [Contract Issue Title]
- **Producer spec**: [which spec defines the output]
- **Consumer spec**: [which spec expects the input]
- **Mismatch**: [what doesn't agree]
- **Impact**: [what would break at runtime]
- **Suggestion**: [how to align]

If no issues: "All inter-spec contracts are aligned."

## Completeness

| System Doc Section | Spec Coverage | Gap |
|-------------------|--------------|-----|
| [doc name] Section X | [spec file] | None / [what's missing] |
| [doc name] Section Y | Not covered | [what needs a spec] |

If no issues: "All significant system doc concepts have corresponding specs."

## Traceability

| Spec File | Source Doc | Status |
|-----------|-----------|--------|
| [spec file] | [doc name] Section X | Traced / Stale / Missing |

If no issues: "All specs trace to current system doc sections."

## API Convention Adherence

| Convention | Expected (from preamble) | Violations |
|-----------|------------------------|-----------|
| Pagination | Cursor-based | spec-users.md uses offset pagination |
| Naming | camelCase JSON | spec-reports.md uses snake_case |
| Error format | Standard taxonomy | spec-legacy.md uses custom {error: "..."} |

If no violations: "All endpoint specs follow the API conventions preamble."
If no preamble: "No API conventions preamble found. Dimension skipped."

## Recommendations

Prioritized list of fixes. Group by severity:
1. **Must fix** — would cause runtime errors or incorrect behavior
2. **Should fix** — would cause confusion or maintenance burden
3. **Nice to have** — cosmetic or convention improvements
```

### Guidance

- **Type consistency is the highest priority.** A naming inconsistency is confusing; a type
  inconsistency causes runtime bugs. Check types first.

- **Check contracts at boundaries.** The most dangerous inconsistencies are between specs
  that define two sides of an interface — an API spec and a client spec, an event emitter
  and an event handler. These are where mismatches cause real failures.

- **Traceability enables maintenance.** If a system doc changes, you need to know which
  specs are affected. Without traceability, spec regeneration becomes guesswork.

- **Don't check style.** This is a consistency check, not a style guide review. Different
  spec formats (YAML, JSON Schema, TypeScript, SQL) have different conventions — that's fine.
  Only flag actual semantic inconsistencies.
