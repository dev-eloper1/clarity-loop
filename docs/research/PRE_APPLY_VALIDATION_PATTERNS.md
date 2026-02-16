# Research: Pre-Apply Validation Patterns Across Engineering Disciplines

**Created**: 2026-02-15
**Status**: Draft
**Author**: User + AI researcher

## System Context

### Research Type: External Survey

This research is a cross-domain survey of how engineering systems validate that changes CAN
be executed successfully BEFORE actually executing them. The analog for our documentation
pipeline: a proposal says "change line 50 of file X from A to B" -- how do we validate that
line 50 of file X actually says A before we try to change it?

### Why This Research

The documentation pipeline has a Change Manifest in each proposal -- a table mapping each
proposed change to its target doc, section, change type, and research finding. Currently,
the verify step runs AFTER changes are applied to system docs. There is no pre-apply
validation that confirms the Change Manifest's assumptions still hold before execution
begins. If a system doc changed between proposal approval and merge (due to another proposal,
a hotfix, or drift), the merge could silently produce incorrect results.

This is not a theoretical risk. It is the same class of problem that every deployment
pipeline, database migration tool, and safety-critical system has solved in some form.

---

## Pattern Catalog

### Pattern 1: Plan/Preview (Show What Will Change)

**Domain**: Infrastructure-as-Code (Terraform, Pulumi, CloudFormation)

**How it works**:

Before any change is applied, the tool computes and displays a complete diff between the
current state and the desired state. The human reviews this diff and explicitly approves it
before execution proceeds.

**Concrete examples**:

- **Terraform plan**: Reads current state of remote objects, compares against the
  configuration, and proposes a set of change actions. Outputs a human-readable diff showing
  resources to create, modify, or destroy. The `-detailed-exitcode` flag returns exit code 2
  when changes are detected, enabling CI/CD automation. Plans can be saved to a file with
  `-out=FILE` and later applied with `terraform apply FILE`, ensuring exactly the reviewed
  changes are executed.

- **Pulumi preview**: Shows a preview of updates by computing the new desired state and
  comparing it against existing state. Pulumi's "Update Plans" feature (`pulumi preview
  --save-plan PLAN-FILENAME`) guarantees that operations shown in preview will run on
  `pulumi up`, catching unexpected changes between preview and apply.

- **CloudFormation change sets**: Creates a change set that describes what will change before
  executing it. Pre-deployment validation operates in two modes: FAIL mode prevents change
  set execution when validation detects errors; WARN mode allows creation but surfaces
  warnings. Catches property syntax errors, type mismatches, missing mandatory fields, and
  unsupported properties.

**What it validates**: Correctness (do the instructions match reality?), safety (what will
be destroyed?), completeness (are all dependencies satisfied?).

**When it runs**: After authoring, before apply. Always-on -- every apply requires a plan
step first.

**Cost/speed tradeoff**: Adds seconds to minutes depending on provider API calls. Terraform
plan must query every provider to determine current state. The cost is universally accepted
because the alternative (blind apply) is far more expensive when it fails.

**Key insight for our pipeline**: The plan step does NOT just validate syntax. It reads the
actual current state and computes a diff. Terraform plan would fail if the real infrastructure
had drifted from what the configuration expects. This is directly analogous to checking that
a target doc section actually contains what the Change Manifest assumes it contains.

---

### Pattern 2: Dry-Run Execution (Simulate Without Side Effects)

**Domain**: Kubernetes, Ansible, Helm, general deployment tools

**How it works**:

The system executes the full operation pipeline -- parsing, validation, admission control,
defaulting -- but stops short of persisting the result. This catches errors that pure syntax
validation would miss because it exercises the real execution path.

**Concrete examples**:

- **Kubernetes server-side dry-run** (`kubectl apply --dry-run=server`): Sends the manifest
  to the API server, which runs it through the full admission chain (defaulting, validation,
  mutating admission webhooks, validating admission webhooks) but does NOT persist to etcd.
  The response is the object as it WOULD exist, with all defaults applied and all webhooks
  executed. This is strictly superior to client-side dry-run, which only checks local syntax.

- **kubectl diff**: Computes and displays the difference between the current live object and
  what would result from applying the manifest. Uses server-side dry-run internally to get
  the "would-be" state, then diffs it against the live state. This is the Kubernetes
  equivalent of `terraform plan`.

- **Ansible check mode** (`--check --diff`): Asks each module "if I ran you for real, would
  you change anything?" and reports the answer without making changes. Combined with `--diff`,
  shows before-and-after comparisons. Limitation: tasks that depend on registered variables
  from prior tasks cannot be accurately simulated -- the simulation chain breaks when earlier
  tasks' outputs are needed.

- **Helm dry-run**: Two modes. `--dry-run=client` renders templates locally (syntax only).
  `--dry-run=server` sends rendered manifests to the Kubernetes API for server-side
  validation, which catches schema violations, admission policy failures, and resource
  conflicts that client-side rendering misses.

**What it validates**: Executability (will the operation succeed?), admission (do policies
allow it?), defaults (what will the system add?), conflicts (does this collide with existing
state?).

**When it runs**: Before apply. Can be always-on (CI gates) or on-demand (developer
pre-check).

**Cost/speed tradeoff**: Nearly free for client-side dry-run. Server-side requires a running
cluster and exercises real webhooks, so it's slower but catches more. The important tradeoff:
Ansible check mode explicitly acknowledges it cannot simulate everything -- tasks with
dependencies on prior task outputs are fundamentally unsimulable. This is an honest design
that communicates its limitations rather than giving false confidence.

**Key insight for our pipeline**: Server-side dry-run is more valuable than client-side
because it exercises the REAL execution path. For our Change Manifest, this means actually
reading the target file and checking the target section, not just validating the manifest's
structure in isolation. The Ansible limitation is also important: some validations depend on
the results of prior changes (e.g., a new section being created in step 1 that step 2
references). A pre-apply check must handle ordering dependencies.

---

### Pattern 3: Precondition Guards (Assert Before Proceed)

**Domain**: Terraform lifecycle, etcd transactions, HTTP conditional requests, database
optimistic concurrency

**How it works**:

Before executing an operation, the system asserts that specific conditions are true. If any
assertion fails, the operation is rejected without side effects. The conditions are explicit,
declarative, and checkable independently.

**Concrete examples**:

- **Terraform preconditions**: Defined in resource lifecycle blocks, evaluated during the plan
  phase BEFORE Terraform attempts to create the resource. Example: a precondition can assert
  that an AMI ID is valid for the target region, or that a required data source returned a
  non-empty result. Failures produce custom error messages and halt the plan. Postconditions
  run AFTER creation and verify the result matches expectations.

- **etcd transactions (If/Then/Else)**: An atomic construct where the If clause contains
  comparison predicates on keys (value equals X, modification revision equals N, version
  equals V). The Then clause executes only if ALL comparisons succeed. This is
  compare-and-swap at the API level -- "update this key to B only if it currently equals A."

- **HTTP conditional requests (If-Match/ETag)**: The client sends an `If-Match` header with
  the ETag it received when it last read the resource. If the current ETag differs (meaning
  the resource changed), the server returns 412 Precondition Failed. This prevents
  lost-update problems where two editors both read version 1, both write version 2, and the
  first writer's changes are silently overwritten.

- **Optimistic concurrency control**: Before committing, each transaction verifies that no
  other transaction has modified the data it read. The validation phase checks timestamps or
  version numbers. If conflicts are detected, the transaction rolls back. The key property:
  the check happens at commit time, not at read time, so it catches changes that happened
  DURING the transaction's execution window.

**What it validates**: Freshness (is my view of the world still current?), integrity (has the
target been modified since I read it?), invariants (do domain-specific rules still hold?).

**When it runs**: Just before apply, after all planning is complete. Some preconditions
(Terraform) run during plan; others (etcd, HTTP) run at execution time.

**Cost/speed tradeoff**: Extremely cheap. Precondition checks are simple comparisons -- value
equality, version number match, existence check. They add negligible latency but prevent
entire classes of corruption.

**Key insight for our pipeline**: This is the most directly applicable pattern. A Change
Manifest entry says "modify Section 3.2 of ARCHITECTURE.md." The precondition guard is:
"assert that Section 3.2 of ARCHITECTURE.md currently contains [expected content hash or
signature text]." If another proposal modified that section between approval and apply, the
precondition fails and the merge is blocked. The etcd model is particularly instructive:
compare-and-swap is exactly "change X from A to B, but only if X is currently A."

---

### Pattern 4: Checksum/Integrity Verification (Detect Drift)

**Domain**: Database migrations (Flyway, Liquibase), package managers, Git

**How it works**:

The system computes a fingerprint (hash, checksum) of the source material at creation time
and re-verifies it before execution. If the fingerprint differs, it means the source has
been modified since the plan was made, and execution is halted.

**Concrete examples**:

- **Flyway validate**: Computes a CRC32 checksum of each migration file when it is first
  applied and stores it in the `flyway_schema_history` table. On every subsequent startup or
  `flyway validate` call, it recomputes checksums and compares against stored values. A
  mismatch means someone modified a previously-applied migration -- a dangerous situation
  because the database reflects the OLD version while the codebase has the NEW version. This
  is always-on: the migrate command runs validation automatically and errors out if violations
  are detected.

- **Liquibase validate**: Checks changelog syntax and structure without connecting to a
  database. The `updateSQL` command goes further: it generates the raw SQL that WOULD be
  executed, allowing human review before `update` runs. The combination of `validate` (syntax)
  + `updateSQL` (preview) + `status` (pending changes) provides a complete pre-apply
  verification chain.

- **Alembic (Python)**: The `check` command verifies if there are pending upgrade operations.
  The `--sql` offline mode generates migration SQL without connecting to a database. The
  `heads` command ensures the migration graph is linear (no divergent heads), catching a class
  of error where parallel development created conflicting migrations.

- **git apply --check**: Tests whether a patch applies cleanly WITHOUT actually applying it.
  Returns success/failure, catching cases where the target file has changed since the patch
  was created. This is the exact analog: "this patch expects line 50 to say A, but line 50
  now says C."

- **The sedfile wrapper**: Replaces `sed -i` with a version that checks the file before AND
  after substitution. If the expected pattern is not found (no change detected), it fails
  loudly instead of silently succeeding with no effect. A `grep -q` precondition guard
  (`grep -q "^APP_ENV =" .env && sed -i "s/..."`) verifies the target exists before
  attempting the substitution.

**What it validates**: Integrity (has the source been tampered with?), applicability (does the
target still match expectations?), linearity (are changes being applied in the right order?).

**When it runs**: Before every apply. Always-on for Flyway (automatic on migrate). On-demand
for Liquibase/Alembic (manual validate/check commands).

**Cost/speed tradeoff**: Hash computation is essentially free. The real cost is the process
discipline: teams must never modify applied migrations, and the tool enforces this with
checksums. The alternative (no checksums) means silent drift where the database and codebase
disagree.

**Key insight for our pipeline**: This pattern suggests we should fingerprint target sections
at proposal-creation time and re-verify at merge time. If the proposal says "Section 3.2
currently says X" (with a hash of X), then at merge time we hash the actual Section 3.2 and
compare. A mismatch means drift occurred. This is cheaper and more reliable than re-reading
and re-analyzing the full section -- a hash comparison is definitive. The `git apply --check`
analog is especially apt: our Change Manifest is essentially a structured patch, and we can
check if it applies cleanly.

---

### Pattern 5: Progressive Gating (Validate in Stages)

**Domain**: CI/CD pipelines, canary deployments, feature flag rollouts

**How it works**:

Validation is not a single gate but a series of increasingly expensive and realistic checks.
Each gate must pass before the next stage begins. Earlier gates are fast and cheap (syntax,
linting); later gates are slow and expensive (integration tests, canary analysis). The
pipeline stops at the first failure.

**Concrete examples**:

- **CI/CD pipeline stages**: A typical pipeline runs: lint (seconds) -> unit tests (minutes)
  -> integration tests (minutes) -> staging deploy (minutes) -> canary analysis (hours) ->
  full rollout. Each stage validates something the previous stage cannot. Lint catches syntax
  but not logic. Unit tests catch logic but not integration. Staging catches integration but
  not production behavior.

- **Canary deployments**: Deploy to 5-10% of traffic. Monitor error rates, latency, and
  resource utilization against the existing version. Automated analysis compares canary
  metrics to baseline using statistical tests. If metrics degrade beyond thresholds,
  automatically roll back. If stable for the configured bake time, proceed to the next
  traffic percentage (10% -> 25% -> 50% -> 100%).

- **Feature flag progressive rollout (ring-based)**: Ring 0 (internal team, 5-20 people,
  must be stable for 24-48 hours) -> Ring 1 (canary 1-5%, error rate < 0.1%) -> Ring 2
  (beta 10-25%) -> Ring 3 (GA 100%, stable for 7 days before flag removal). Each ring has
  explicit gate criteria. You do not advance to the next ring until the current ring passes
  every gate.

- **ArgoCD sync phases**: PreSync hooks execute BEFORE the application manifests are applied.
  If any PreSync hook fails, the entire sync operation stops and is marked failed. Use cases
  include database migrations, dependency checks, and pre-flight validation queries (e.g.,
  querying Prometheus for production issues before deploying). Sync waves control ordering
  within phases.

- **CloudFormation pre-deployment validation**: Validates templates during change set
  creation. FAIL mode prevents execution entirely. WARN mode allows creation but surfaces
  issues. Catches property syntax errors, type mismatches, missing mandatory fields,
  unsupported properties, and constraint violations.

**What it validates**: Different things at different stages. Early: syntax, structure,
schema. Middle: logic, integration, policy compliance. Late: real-world behavior under
production conditions.

**When it runs**: Continuously through the pipeline. Each stage is a gate.

**Cost/speed tradeoff**: The entire point is to order checks by cost. Cheap checks run first
to fail fast. Expensive checks run last because they only need to catch what cheap checks
missed. A well-designed pipeline never runs a 30-minute integration test when a 2-second
lint check would have caught the same error.

**Key insight for our pipeline**: The doc pipeline currently has one validation point: the
post-merge verify step. This is equivalent to running integration tests but having no lint
or unit test stage. A staged approach would be: (1) structural validation of the Change
Manifest at proposal creation (are targets valid, do sections exist?), (2) freshness check
at review time (have targets drifted since the proposal was written?), (3) precondition
assertion at merge time (does each target still match the proposal's assumptions?), (4)
post-merge verification (was the merge executed correctly?).

---

### Pattern 6: Challenge-and-Response Verification (Independent Confirmation)

**Domain**: Aviation, manufacturing, safety-critical systems

**How it works**:

Two independent parties verify the same facts using different methods. The executor states
what they intend to do and what they expect to find. The verifier independently confirms
those assertions. Disagreement halts the operation. The key property is INDEPENDENCE: the
verifier must not simply repeat what the executor said but must check reality independently.

**Concrete examples**:

- **Aviation challenge-and-response checklists**: The pilot flying (PF) calls out each item
  ("Fuel switches?"). The pilot monitoring (PM) independently checks the physical state of
  the switch and confirms ("Open"). Critical items must be verified by BOTH crew members. For
  computer programming tasks (e.g., flight management system), one crew member accomplishes
  the task and the other independently confirms the result. The checklist is mandated by FAA
  Federal Aviation Regulations, which require that "approved procedures must include each item
  necessary for flight crewmembers to check for safety."

- **NASA Independent Verification and Validation (IV&V)**: Software for safety-critical
  functions receives the highest Design Assurance Level (Level A). IV&V is an objective
  examination of safety and mission-critical software processes and products. Independence has
  three dimensions: technical independence (different methods), managerial independence
  (separate reporting chain), and financial independence (separate budget). The verifier
  cannot be the same team that built the software. DO-178C certification requires that the
  objectivity of verification and validation processes is ensured "by virtue of their
  independence from the software development team."

- **Manufacturing First Article Inspection (FAI)**: Before full-rate production begins, the
  first manufactured part is formally verified against ALL design, drawing, and specification
  requirements. FAI is required for: new part introduction, new supplier, parts not
  manufactured for >2 years, or any change to design/process affecting fit, form, or function.
  The inspection catches dimensional, material, and functional deviations before they are
  replicated across an entire production run.

- **FMEA (Failure Mode and Effects Analysis)**: During the design phase (before production),
  teams systematically identify every possible failure mode, assess severity and likelihood,
  and design mitigations BEFORE the product is built. Design FMEA examines the design itself;
  Process FMEA examines the manufacturing process. Both are pre-execution validation -- they
  anticipate failure rather than reacting to it.

**What it validates**: Correctness (does the plan match reality?), safety (will execution
cause harm?), completeness (is anything missing?), independence (did a different party
confirm?).

**When it runs**: Before execution, always. These are not optional or conditional -- they are
mandatory pre-execution gates.

**Cost/speed tradeoff**: High cost in time and personnel (two people checking the same
thing). Justified only for high-stakes operations where failure cost is catastrophic. Aviation
and aerospace have determined that the cost of redundant verification is always less than the
cost of a crash.

**Key insight for our pipeline**: The current pipeline already has some of this: the
doc-reviewer is independent from the doc-researcher. But the review checks the PROPOSAL's
quality, not whether the proposal's assumptions about the TARGET still hold. The aviation
model suggests a specific addition: at merge time, the merger should independently read each
target section and confirm it matches what the Change Manifest claims. This is "challenge and
response" -- the proposal says "Section 3.2 says X," the merger independently verifies
"Section 3.2 does say X."

---

### Pattern 7: Operational Transform / Conflict-Aware Merging

**Domain**: Collaborative document editing, distributed systems, version control

**How it works**:

When multiple actors can modify the same document concurrently, the system tracks the base
state each actor started from and transforms operations to account for concurrent changes.
If transformation is not possible (conflicting edits to the same content), the system raises
a conflict rather than silently merging.

**Concrete examples**:

- **Operational Transform (Google Docs)**: Each operation carries the state it was based on.
  When concurrent operations are detected, they are transformed so their combined effect is
  consistent regardless of execution order. If user A inserts at position 5 and user B deletes
  position 3, B's operation shifts A's insert position to 4. The transformation function
  guarantees convergence -- all replicas reach the same final state.

- **Git merge conflict detection**: Git uses three-way merge to detect conflicts. If two
  branches modified the same lines, Git marks the conflict and requires human resolution
  rather than choosing one version silently. `git apply --check` tests whether a patch applies
  cleanly: it verifies that the context lines in the patch match the current file. If the file
  has changed, the patch is rejected.

- **Git merge dry-run**: `git merge --no-commit --no-ff BRANCH` performs the merge but stops
  before committing, allowing inspection of the result. `git merge --abort` cancels if the
  result is unsatisfactory. This combines dry-run (don't persist) with preview (show what
  would change).

- **Compare-and-swap (etcd, databases)**: Every write operation includes the expected current
  value or version. The system atomically checks the precondition and applies the write only
  if the check passes. If the value changed since the reader last saw it, the write is
  rejected. The client must re-read, recompute, and retry.

**What it validates**: Consistency (are changes based on the current state?), conflict
detection (did concurrent changes create contradictions?), convergence (will the final state
be correct regardless of execution order?).

**When it runs**: At merge/apply time. The check is inherent to the operation -- you cannot
apply without checking.

**Cost/speed tradeoff**: Low computational cost (comparing versions/hashes). The cost is in
the conflict resolution workflow when conflicts are detected. But the alternative (silent
overwrites) is data loss, which is infinitely more expensive.

**Key insight for our pipeline**: Multiple proposals could be approved concurrently. Proposal
A modifies Section 3.2 and is approved. Proposal B also modifies Section 3.2 and is approved
(perhaps by a different reviewer or at a different time). If A is merged first, B's
assumptions about Section 3.2 are now stale. The operational transform pattern suggests
either: (a) detect this conflict and require B to rebase on the post-A state, or (b)
transform B's operations to account for A's changes. Option (a) is simpler and more
appropriate for our use case.

---

## Cross-Cutting Analysis

### Validation Taxonomy

Every pre-apply validation checks one or more of these properties:

| Property | Question | Example |
|----------|----------|---------|
| **Syntactic correctness** | Is the instruction well-formed? | Terraform validate, Liquibase validate, Helm lint |
| **Semantic correctness** | Does the instruction make sense? | Terraform preconditions, CloudFormation type checking |
| **Applicability** | Can the instruction be executed against the current target? | git apply --check, Flyway checksum, etcd compare-and-swap |
| **Freshness** | Is my view of the target still current? | HTTP If-Match/ETag, optimistic concurrency, Flyway checksum |
| **Safety** | Will execution cause harm? | Terraform plan (destroy warnings), canary analysis, FMEA |
| **Completeness** | Is anything missing? | FAI, aviation checklists, CloudFormation mandatory field checks |
| **Ordering** | Are changes being applied in the right sequence? | Alembic heads check, ArgoCD sync waves, migration version ordering |

### When Validation Runs (The Validation Timeline)

```
Authoring -----> Review -----> Approval -----> Pre-Apply -----> Apply -----> Post-Apply
    |               |              |               |              |              |
    v               v              v               v              v              v
 Syntax          Semantic      Freshness      Precondition    Execution     Verification
 Structure       Logic         Drift check    Assertion       (actual)      Post-condition
 Schema          Policy        Conflict       Compare-and-    Side effects  Canary analysis
 Lint            Compliance    detection      swap                          Post-merge verify
```

Most mature systems validate at MULTIPLE points on this timeline. The Clarity Loop pipeline
currently validates only at the final point (post-apply verification). Every pattern studied
here adds validation earlier in the timeline, catching errors when they are cheapest to fix.

### The Universal Pattern: Read-Compare-Proceed

Despite domain differences, every pre-apply validation follows the same three-step structure:

1. **Read** the current state of the target (infrastructure, database schema, file content,
   switch position)
2. **Compare** it against the expected/assumed state in the change instruction
3. **Proceed** only if they match; halt and report if they diverge

The variation is in WHAT is compared:
- Terraform compares resource attributes
- Flyway compares file checksums
- etcd compares key values or version numbers
- Aviation compares physical switch positions to checklist items
- Git compares file content against patch context lines

But the structure is always: Read -> Compare -> Proceed/Halt.

### Cost Ordering of Validation Approaches

From cheapest to most expensive:

1. **Hash/checksum comparison** (nanoseconds): Compare a pre-computed hash against current
   content. Definitive for detecting ANY change. Zero false positives.

2. **Existence/structure check** (milliseconds): Verify that expected sections, files, or
   resources exist. Catches deletions and restructuring.

3. **Content comparison** (milliseconds): Read target content and compare against expected
   content. Catches modifications.

4. **Dry-run execution** (seconds): Execute the full operation pipeline without persisting.
   Catches execution-path errors that static analysis misses.

5. **Independent review** (minutes to hours): A separate human or process independently
   verifies assertions. Catches errors that automated checks miss due to shared assumptions.

6. **Progressive rollout** (hours to days): Deploy to a subset and monitor. Catches
   production-specific issues that no pre-production check can find.

The optimal strategy is to use MULTIPLE levels, ordered cheapest-first. Fail fast at the
cheapest check; only proceed to expensive checks when cheap checks pass.

---

## Patterns Most Applicable to the Documentation Pipeline

### Direct Analogs

| Pipeline Concern | Engineering Pattern | How It Maps |
|-----------------|--------------------|-|
| "Does Section 3.2 still say X?" | `git apply --check` | Treat Change Manifest as a patch; verify context lines match |
| "Has this doc changed since proposal was written?" | Flyway checksum validation | Hash target sections at proposal time; re-verify at merge time |
| "Two proposals modify the same section" | Compare-and-swap / conflict detection | Track which proposals touch which sections; detect overlapping targets |
| "Is the Change Manifest structurally valid?" | Terraform validate / Helm lint | Verify all targets exist, section references resolve, change types are valid |
| "Pre-apply + post-apply verification" | Staged CI/CD pipeline | Add pre-merge validation stage between approval and apply |
| "Reviewer checks proposal, not target state" | Aviation independent verification | At merge time, independently read each target and confirm expectations |

### Recommended Validation Chain for the Pipeline

Based on the patterns above, a four-stage validation chain:

**Stage 1: Manifest Validation (at proposal creation)**
- Pattern: Terraform validate / Helm lint
- Check: All target files exist. All target sections resolve. Change types are valid. No
  duplicate targets.
- Cost: Milliseconds. Always-on.

**Stage 2: Freshness Check (at review or re-review)**
- Pattern: Flyway checksum + HTTP ETag
- Check: Compute content hash of each target section. Store in proposal metadata. On
  re-review, recompute and compare. Alert if any target has drifted.
- Cost: Milliseconds. Always-on.

**Stage 3: Pre-Apply Assertion (just before merge)**
- Pattern: git apply --check + etcd compare-and-swap
- Check: For each Change Manifest entry, read the actual target section. Assert it matches
  the proposal's stated "current content" or hash. If ANY assertion fails, halt the merge
  and report which targets have drifted.
- Cost: Milliseconds to seconds (file I/O). Always-on. This is the critical gate.

**Stage 4: Post-Apply Verification (after merge)**
- Pattern: Terraform postconditions + canary analysis
- Check: Verify each change was applied correctly. Run cross-document consistency checks.
  Regenerate system context cache. This already exists as the verify step.
- Cost: Seconds. Already implemented.

---

## Summary of Findings

1. **Every mature deployment system validates before applying.** Terraform plan, Kubernetes
   dry-run, Flyway validate, Ansible check mode -- the pattern is universal. The doc pipeline
   currently skips this step.

2. **The cheapest and most effective check is: "does the target still match what I expect?"**
   This is compare-and-swap, checksum verification, `git apply --check`, and HTTP If-Match
   all in one. It costs nanoseconds and prevents the most dangerous class of error: applying
   changes to a target that has drifted.

3. **Validation should be staged, cheapest first.** Syntax check at authoring. Freshness
   check at review. Precondition assertion at merge. Post-apply verification after merge.
   Fail fast at the cheapest stage.

4. **Silent success is the worst failure mode.** The `sed -i` problem: the command succeeds
   (exit code 0) even when the pattern is not found, silently doing nothing. The sedfile
   wrapper, Flyway checksums, and git apply --check all exist specifically to prevent silent
   no-ops. Any pre-apply validation must FAIL LOUDLY when preconditions are not met.

5. **Independence matters for high-stakes checks.** Aviation and NASA use independent
   verification (different person, different method) for critical checks. The doc pipeline
   already separates researcher from reviewer. Adding pre-apply validation creates another
   independent check: the Change Manifest assertions are verified against the actual files,
   not just against the proposal's description.

6. **Concurrent changes require conflict detection.** When multiple proposals can be
   in-flight simultaneously, the system needs compare-and-swap semantics: "apply this change
   only if the target still matches my expectations." This is a solved problem in every
   database, distributed system, and version control tool.

---

## Sources

### Infrastructure-as-Code
- [Terraform plan command reference](https://developer.hashicorp.com/terraform/cli/commands/plan)
- [Terraform configuration validation](https://developer.hashicorp.com/terraform/language/validate)
- [Terraform checks for infrastructure validation](https://developer.hashicorp.com/terraform/tutorials/configuration-language/checks)
- [Terraform Dry Run Explained](https://spacelift.io/blog/terraform-dry-run)
- [Terraform Preconditions and Postconditions](https://spacelift.io/blog/terraform-precondition-postcondition)
- [Terraform custom conditions](https://developer.hashicorp.com/terraform/tutorials/configuration-language/custom-conditions)
- [Pulumi preview command](https://www.pulumi.com/docs/iac/cli/commands/pulumi_preview/)
- [Pulumi Update Plans](https://www.pulumi.com/blog/announcing-public-preview-update-plans/)
- [Pulumi CrossGuard policies](https://www.pulumi.com/docs/iac/crossguard/core-concepts/)
- [CloudFormation pre-deployment validation](https://aws.amazon.com/blogs/devops/accelerate-infrastructure-development-with-cloudformation-pre-deployment-validation-and-simplified-troubleshooting/)
- [CloudFormation validate template](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-validate-template.html)

### Database Migrations
- [Flyway Dry Runs](https://flywaydb.org/documentation/concepts/dryruns)
- [Flyway Validate explained](https://www.red-gate.com/hub/product-learning/flyway/flyways-validate-command-explained-simply)
- [Liquibase validate command](https://docs.liquibase.com/commands/utility/validate.html)
- [Liquibase update-sql command](https://docs.liquibase.com/commands/update/update-sql.html)
- [Liquibase dry-run discussion](https://github.com/liquibase/liquibase/issues/2639)
- [Alembic offline mode](https://alembic.sqlalchemy.org/en/latest/offline.html)
- [Alembic autogenerate](https://alembic.sqlalchemy.org/en/latest/autogenerate.html)

### Kubernetes and GitOps
- [Kubernetes API server dry-run and kubectl diff](https://kubernetes.io/blog/2019/01/14/apiserver-dry-run-and-kubectl-diff/)
- [Kubernetes dry-run enhancement KEP](https://github.com/kubernetes/enhancements/blob/master/keps/sig-api-machinery/576-dry-run/README.md)
- [Pre-deployment validation with dry-run](https://medium.com/@pranshu.jain_77905/pre-deployment-validation-in-kubernetes-using-dry-run-for-safe-and-secure-manifests-eb9a0dcb05c4)
- [ArgoCD sync waves and phases](https://argo-cd.readthedocs.io/en/stable/user-guide/sync-waves/)
- [ArgoCD resource hooks](https://argo-cd.readthedocs.io/en/release-2.0/user-guide/resource_hooks/)
- [Helm dry-run guide](https://medium.com/@squadcast/helm-dry-run-a-complete-guide-to-testing-kubernetes-deployments-successfully-a384f44c608f)

### Configuration Management
- [Ansible check mode and diff mode](https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbooks_checkmode.html)
- [Deployment checklist](https://octopus.com/devops/software-deployments/deployment-checklist/)
- [Vercel deployment checks](https://vercel.com/docs/deployment-checks)

### Safety-Critical Systems
- [Aviation checklists for flight safety](https://bravo6flightacademy.com/aviation-checklists-for-flight-safety/)
- [FAA Advisory Circular on checklist procedures](https://www.faa.gov/documentlibrary/media/advisory_circular/ac_120-71b.pdf)
- [NASA IV&V standards](https://swehb.nasa.gov/display/SWEHBVB/SWE-141+-+Software+Independent+Verification+and+Validation)
- [DO-178C certification](https://en.wikipedia.org/wiki/DO-178C)
- [First Article Inspection guide](https://www.fictiv.com/articles/first-article-inspection-fai-manufacturing-guide)
- [FMEA methodology](https://quality-one.com/fmea/)

### Concurrency and Conflict Resolution
- [Optimistic concurrency control](https://en.wikipedia.org/wiki/Optimistic_concurrency_control)
- [Operational transformation](https://en.wikipedia.org/wiki/Operational_transformation)
- [etcd transactions API](https://etcd.io/docs/v3.3/learning/api/)
- [Git merge conflict detection](https://code-maven.com/git-check-for-conflicts-before-merge)

### Deployment Patterns
- [Canary deployment patterns](https://www.headout.studio/canary-deployment-with-automated-rollback/)
- [Feature flag progressive rollout](https://pmtoolkit.ai/learn/experimentation/feature-flags-guide)
- [Progressive delivery workflows](https://www.getunleash.io/blog/progressive-delivery-workflows-trunk-based-deployments)
