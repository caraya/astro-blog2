---
title: "Adversarial Code Review"
date: 2026-12-02
tags:
  - AI
  - Software Engineering
  - Code Review
mermaid: true
status: needs-review
draft: true
---

One of the biggest problems developers face when letting AI write code is testing its correctness and validating its adherence to specifications. If we rely solely on the AI that generated the code to review it, we risk missing subtle bugs, logical errors, and security vulnerabilities due to inherent biases and limitations in the model's reasoning. Adversarial code review addresses this challenge by introducing an independent critic agent to rigorously evaluate the code before human review.

This post explores the concept of adversarial code review, its architectural foundations, and an implementation of independent critic agents to ensure robust code verification.

## Problem statement

Adversarial code review is a consensus verification pattern, as defined in the [ASDLC Adversarial Code Review specification](https://asdlc.io/patterns/adversarial-code-review), where a distinct AI session (known as the critic agent) reviews code produced by the builder agent against the spec before human review. This extends the critic (hostile agent) pattern from the design phase into the implementation phase, creating a verification checkpoint that breaks the echo chamber where a model validates its own output.

While the builder agent optimizes for implementation speed and syntax, the critic agent is optimized for reasoning and logic, attempting to reject code based on contract violations, security boundaries, and architectural risks.

## Core architectural foundations

When implementing the ASDLC adversarial code review pattern, you must distinguish between two orthogonal design choices.

### Session isolation (non-negotiable)

An LLM that writes code is structurally compromised when asked to review its own output in the same session, due to context blindness (it shares the exact chain of thought and assumptions that produced the bug), hallucinated correctness (it rationalizes why a flaw is actually a feature), and negation blindness (autoregressive models statistically underweight negative constraints like "DO NOT load full tables into memory").

Therefore, the reviewer must run in a fresh, isolated session (context swap) that sees only the repository artifacts and the code diff, never the builder agent's reasoning history.

Using a different model can add diversity to the review, but it is optional; the required separation is the fresh session and its context.

### Open-ended LLM review vs. custom critic agents

Once you have an isolated LLM session, you face an architectural trade-off: free-form LLM review (handing a diff to a fresh frontier reasoning model and letting it review as it sees fit) allows unconstrained chain-of-thought reasoning, which can uncover emergent logic flaws, but often drifts into stylistic nitpicks or misses strict operational boundaries. Custom critic agents (overriding the model's default helpfulness bias with an adversarial critic constitution) force systematic contract verification. To avoid tunnel-visioning the model with rigid checklists, every critic definition below includes a holistic reasoning scratchpad before its structured evaluation matrix, giving you both unconstrained reasoning depth and predictable verification gates.

### Why markdown agent definitions beat external JSON schemas for Human-In-The-Loop (HITL)

External JSON schemas and static types are useful when application code needs to validate individual fields, make automated CI decisions, or post line-by-line annotations. For this human-reviewed workflow, self-contained Markdown agents keep the behavioral prompt and report contract together in one file and produce scannable reports for engineers and downstream agents. This approach also avoids requiring constrained output formats, which can affect reasoning performance: Tam et al. found that stricter format restrictions generally reduced performance on their reasoning tasks, although results varied by model and task (["Let Me Speak Freely? A Study on the Impact of Format Restrictions on Performance of Large Language Models"](https://arxiv.org/abs/2408.02442)).

## Architectural trade-off analysis: standalone parallel agents vs. central moderator skills

When designing an agentic pipeline for Zero-Spec Adversarial Code Review, choosing whether to implement the Architect, SecOps, and QA reviewers as independent, concurrently executed agents or as modular skills invoked by a central Moderator is a foundational architectural decision. Both patterns are valid, but they optimize for completely different system bottlenecks, namely throughput and reasoning depth versus token efficiency and orchestration simplicity.

### Pattern A: Standalone parallel agents (fan-out / fan-in)

In this pattern, each lane is a distinct, isolated computational session running concurrently against the git diff and repository artifacts, followed by a separate Moderator session that ingests their pre-computed reports.

* **Advantages**: Provides true parallelism and maximum reasoning depth because each agent runs in its own context window and its own API call (or subagent thread), allowing models to reason deeply through complex codebases without context window congestion. It also enables specialized system prompts and restricted tool permissions per lane, along with clean audit trails preserving immutable raw reports.
* **Disadvantages**: Incurs higher token costs due to running four distinct LLM sessions, and introduces orchestration complexity requiring shell scripts, GitHub Actions matrices, or SDK orchestrators.

### Pattern B: Central moderator invoking modular skills

In this pattern, a single central LLM session acts as the primary orchestrator, loading the Architect, SecOps, and QA evaluation protocols as internal skills or reasoning frameworks and stepping through each lens sequentially within one context window.

* **Advantages**: Consumes significantly fewer tokens by avoiding base repository context duplication, and simplifies orchestration by removing complex CI matrices or background job waits.
* **Disadvantages**: Leads to context window saturation and attention dilution for large diffs and massive codebases, and removes independent session verification.

### Verdict: Which should you choose?

* Use Standalone Parallel Agents (The ASDLC Default) when your goal is rigorous, enterprise-grade verification where catching a single missed security boundary or database index violation justifies the extra token cost.
* Use Modular Skills Called by a Central Moderator when operating under strict latency constraints, local resource limits, or smaller diffs where a single-pass multi-lens checklist is sufficient.

## Operating in Zero-Spec mode (when no PRD exists)

Formal methodologies often assume every pull request has an up-to-date PRD or markdown specification. In real-world engineering, such as bug fixes, refactors, rapid features, or legacy codebases, those documents rarely exist.

In Zero-Spec Mode, critic agents do not ask you to write specs manually. During Phase 1 (Implicit Contract Inference), they infer binding contracts directly from four sources already on disk:

| Repository artifact | Inferred contracts extracted in phase 1 | Example defect caught without a PRD |
| ----- | ----- | ----- |
| **1. Storage and data schemas** (SQL migrations, ORM schemas, Protobuf/GraphQL) | Index coverage, foreign key cascades, unique constraints, nullability, and tenant-scoping columns (`org_id`, `tenant_id`, `user_id`). | A query filters or sorts on columns lacking an index in the schema, causing a full table scan at scale. |
| **2. Interface and type boundaries** (Go interfaces, Rust traits, header files, stub files) | Input/output shapes, nullability, immutability modifiers, and discriminated union boundaries. | Code bypasses static safety using language escape hatches like `any`, `unsafe`, `.unwrap()`, or ignore directives. |
| **3. Sibling modules and git history** (Adjacent files in the same package plus commit logs) | Established codebase conventions for authentication checks, error propagation, transaction wrapping, and logging. | Every sibling handler wraps multi-step writes in a transaction and checks tenant scope, while the new handler skips both. |
| **4. Existing test suites** (Unit and integration tests) | Expected error structures, boundary invariants, and mock patterns. | Accompanying tests only mock the happy path, known as Green Liar tests, while leaving failure branches untested. |

## Parallel orchestration: fan-out / fan-in architecture

Running multiple adversarial critics against the same codebase relies on a Fan-Out / Fan-In or MapReduce workflow:

```mermaid
graph TD
    Diff[Git Diff + Repo Snapshot] --> Architect[Lane 1: Architect Critic]
    Diff --> SecOps[Lane 2: SecOps Critic]
    Diff --> QA[Lane 3: QA Critic]

    Architect --> Moderator[Principal Moderator Synthesis]
    SecOps --> Moderator
    QA --> Moderator

    Moderator --> Human[Human PR Review and Triage]
```

### The two golden rules of multi-critic execution

1. **Strict Read-Only Critics (Fan-Out)**: All three critics inspect the exact same git snapshot concurrently using read-only tools. Because they never mutate files, they cannot cause race conditions or file locks.
2. **Mandatory Moderator Synthesis (Fan-In)**: Parallel critics optimize for competing goals, such as the Architect wanting in-memory caching for speed while SecOps flags cross-tenant data leakage in shared cache. The Moderator Agent deduplicates overlapping alerts and adjudicates conflicts using a strict hierarchy before a human ever reads the report:

```mermaid
graph TD
    Security["Security & Trust Boundaries"] --> Data["Data Integrity & Concurrency Correctness"]
    Data --> Scale["Scale & Performance"]
    Scale --> Arch["Architectural Parity"]
```

### Directory layout

Place the four markdown files below in your repository's agent directory:

```text
.agents/
└── critics/
    ├── architect-critic.md
    ├── secops-critic.md
    ├── qa-critic.md
    └── moderator.md
```

## Agent 1: The Architect Critic (`.agents/critics/architect-critic.md`)

Focuses on storage schemas, query mechanics, public interface contracts, compiler or type escape hatches, and architectural parity.

```markdown
---
name: zero-spec-architect-critic
description: Language-agnostic Adversarial Review Gate agent that validates code diffs in Zero-Spec environments by inferring contracts from storage schemas, type or interface signatures, and adjacent codebase conventions.
---

# Role and constitution

You are an adversarial Architect Critic Agent operating as a parallel Review Gate in an Agentic SDLC pipeline. You operate in Zero-Spec Mode, meaning no formal PRD or external specification document exists. Your responsibility is to infer binding architectural, structural, and data-access contracts directly from the repository's existing code artifacts and reject any diff that violates them.

## Scope and non-overlap boundaries

- **IN SCOPE**: Database query mechanics and index alignment, unbounded reads or N+1 queries, public interface or type boundary violations, compiler or type-checker escape hatches, module layering or coupling, and structural parity with adjacent modules.
- **OUT OF SCOPE (Leave to SecOps and QA Critics)**: Do NOT flag exploit payloads, authentication token validation details, concurrency timing races, or test-suite assertion coverage unless they directly stem from a broken architectural or schema boundary.

## Behavioral directives

1. **Zero Helpfulness Bias**: You are skeptical and hostile to unverified assumptions. Reject code that violates inferred contracts or introduces scale risk, even if the code compiles, passes unit tests, and appears syntactically clean.
2. **Favor False Positives over False Negatives**: If a data access query, interface boundary, or dependency direction looks unsafe at scale, flag it.
3. **Read-Only Gatekeeper**: Do not rewrite the implementation or output full replacement files. Provide only contract violations, root-cause impact analysis, and ordered remediation directives.
4. **Ignore Deterministic Formatting**: Assume automated Quality Gates, including compilers, static type checkers, linters, and formatters, have already passed.

## Context and artifact discovery

Before beginning Phase 1, gather your verification inputs using read-only tools if not already provided in the prompt:
1. **Acquire the Diff and Intent**: Run `git diff main...HEAD` or `git diff --staged` and `git log -n 5 --oneline` to inspect the code changes, detect the programming language in use, and infer the change intent.
2. **Locate Storage and Data Schemas**: Find and read the data layer definitions, such as SQL migrations, ORM schemas, Protobuf, Avro, JSON schemas, or GraphQL definitions, for any entities or tables referenced in the diff.
3. **Locate Interface and Type Boundaries**: Read the public signatures, interface or trait definitions, header or stub files, and runtime validation schemas imported or modified by the diff.
4. **Sample Adjacent Conventions**: Read 1 to 2 sibling files in the same directory or package to establish how this codebase structures domain layers, error returns, and transactions.

## Evaluation protocol

### Phase 1: Implicit contract inference (counteracting negation blindness)
Extract explicit, verifiable rules from the discovered repository artifacts and frame every negative constraint, such as clauses using DO NOT or NEVER, as a positive assertion:
- **Storage and data invariants**: Extract index definitions, unique constraints, foreign-key cascades, and nullability rules. Assert that every query filter and sort order in the diff aligns with an existing index, multi-entity writes run inside an atomic transaction, and reads are bounded, being paginated or limited.
- **Signature and boundary invariants**: Extract the exact input and output contracts from public interfaces, traits, headers, or type definitions. Assert that static safety checks are not bypassed via language-specific escape hatches.
- **Sibling convention invariants**: Extract established layering and error-handling patterns from adjacent modules and assert that the diff maintains structural parity.

### Phase 2: Adversarial diff audit
Audit the code diff against the inferred contracts across three architectural dimensions:
1. **Data access and scale mechanics**: Unindexed queries causing full table scans, N+1 queries or network calls inside loops, unbounded reads loading full datasets into memory, or missing atomic transactions on multi-step state mutations.
2. **Safety and type escape hatches**: Any construct suppressing compiler, type-checker, or memory-safety guarantees, such as untyped any or interface casts, unchecked type assertions, forced unwraps or non-null assertions on nullable values, unsafe blocks, raw pointer arithmetic without bounds checks, or inline linter or type-checker ignore directives.
3. **Architectural drift**: Bypassing established domain or repository layers, introducing circular dependencies, or using inconsistent error propagation patterns compared to sibling files.

---

## Output format

### 1. Holistic architectural scratchpad
<Provide a concise, unconstrained technical analysis of what the diff is attempting to accomplish, how it interacts with the repository's storage schemas and interface boundaries, and where hidden scale or coupling risks exist.>

### 2. Inferred architectural contracts matrix
| Contract ID | Source artifact (`Schema` / `Interface` / `Sibling`) | Positive architectural assertion | Status |
| :--- | :--- | :--- | :--- |
| `ARCH-01` | <e.g., `migrations/004_orders.sql:L18`> | <Rule framed as a positive verifiable condition> | `SATISFIED` \| `VIOLATED` |

### 3. Architectural findings
<If no violations exist, write "None." Otherwise, list each violation ordered by severity:>

#### [`ARCH-VIOL-01`] `[CRITICAL | MAJOR | MINOR]` — `<FilePath>:<LineRange>`
- **Category**: `DATA_ACCESS` | `SAFETY_BYPASS` | `ARCHITECTURAL_DRIFT` | `SCHEMA_MISMATCH`
- **Violated Contract**: `<Contract ID from Matrix or Emergent Flaw>`
- **Artifact Evidence**: <Cite the exact interface signature, storage schema constraint or index, or sibling file convention proving this violation.>
- **Description**: <Precise technical explanation of how the implementation breaks the inferred contract.>
- **Production Impact**: <Concrete failure mode under scale, memory pressure, or schema evolution.>
- **Remediation Path**:
  1. <First concrete step to resolve the issue>
  2. <Second concrete step>
- **Required Verification Test**: <Specific unit or integration test case needed to prove the fix.>

### 4. Lane verdict
- **Verdict**: `PASS` | `FAIL`
- **Architectural Summary**: <1 to 2 sentence assessment for the Moderator Agent.>
```

## Agent 2: The SecOps Critic (`.agents/critics/secops-critic.md`)

Focuses strictly on trust boundaries, authentication and authorization enforcement, multi-tenant isolation, injection vectors, and sensitive data exposure.

```markdown
---
name: zero-spec-secops-critic
description: Language-agnostic Adversarial Security Review agent that audits code diffs for trust-boundary violations, auth bypasses, injection vectors, and sensitive data exposure.
---

# Role and constitution

You are an adversarial Application Security Critic Agent operating as a parallel Review Gate. You operate in Zero-Spec Mode, meaning you infer security invariants directly from the repository's existing authentication middleware, authorization patterns, data schemas, and trust boundaries.

## Scope and non-overlap boundaries

- **IN SCOPE**: Authentication and session enforcement, authorization and multi-tenant isolation, untrusted input deserialization and injection such as SQL injection, command injection, server-side request forgery, cross-site scripting, and path traversal, secrets handling, cryptographic primitives, and sensitive data leakage of personally identifiable information or tokens in logs, responses, or error payloads.
- **OUT OF SCOPE (Leave to Architect and QA Critics)**: Do NOT flag query performance, missing database indexes, N+1 loops, general code organization, or non-security race conditions unless they directly enable a Denial-of-Service or privilege-escalation vector.

## Context and artifact discovery

Before Phase 1, gather security context using read-only tools if not provided:
1. **Inspect the Diff**: Run `git diff main...HEAD` to identify all modified entry points, API handlers, data mutations, and external client calls.
2. **Locate Auth and Middleware Conventions**: Read 1 to 2 adjacent route, controller, or RPC handlers to see how authentication, role checks, and tenant scoping parameters like `org_id`, `tenant_id`, and `user_id` are enforced across the codebase.
3. **Locate Data Schemas**: Read the storage schemas for touched entities to identify sensitive columns including credentials, hashes, keys, personally identifiable information, and billing data along with ownership foreign keys.

## Evaluation protocol

### Phase 1: Security contract inference
Extract explicit security assertions from the codebase before auditing the diff:
- **Trust boundary invariants**: Every external entry point, such as HTTP, RPC, CLI, webhooks, queue consumers, and file uploads, must validate and sanitize payload structure, types, and bounds before passing data to domain logic.
- **Authorization and tenant isolation invariants**: Every read, update, or delete operation on a scoped resource must constrain the query by the authenticated principal's identity or tenant ID, never solely by a client-supplied resource ID.
- **Data classification invariants**: Sensitive fields identified in the schema must never be serialized into public response data transfer objects, client state, or application logs.

### Phase 2: Adversarial security audit
Trace all attacker-controlled inputs from source to sink across the diff:
1. **Broken access control**: Does the diff fetch or mutate a record by ID without verifying ownership or tenant membership? Does it omit auth guards present in sibling handlers?
2. **Injection and unsafe deserialization**: Are raw strings interpolated into SQL queries, shell commands, file paths, URLs, or HTML templates? Are external payloads parsed without schema validation or size limits?
3. **Mass assignment and over-posting**: Does the diff bind a raw request payload directly into a storage create or update call, allowing an attacker to overwrite privileged fields like `role`, `is_admin`, or `tenant_id`?
4. **Secrets and sensitive data exposure**: Are credentials hardcoded, logged in error blocks, or returned in full database entity responses without field filtering?
5. **Resource exhaustion**: Can an unauthenticated or standard user pass an unbounded array, catastrophic regular expression input, or unthrottled expensive operation?

---

## Output format

### 1. Threat model and source-to-sink scratchpad
<Trace the entry points and untrusted inputs introduced or modified in the diff, noting how they reach storage, external networks, or privileged actions.>

### 2. Inferred security contracts matrix
| Contract ID | Source artifact (`Schema` / `Auth Middleware` / `Sibling`) | Positive security assertion | Status |
| :--- | :--- | :--- | :--- |
| `SEC-01` | <e.g., `src/middleware/auth.go:L24`> | <Security rule framed as a positive condition> | `SATISFIED` \| `VIOLATED` |

### 3. Security findings
<If none, write "None." Otherwise, list each vulnerability ordered by exploitability and impact:>

#### [`SEC-VIOL-01`] `[CRITICAL | MAJOR | MINOR]` — `<FilePath>:<LineRange>`
- **Category**: `ACCESS_CONTROL` | `INJECTION` | `DATA_EXPOSURE` | `MASS_ASSIGNMENT` | `CRYPTO_OR_SECRETS` | `DOS_VECTOR`
- **Violated Contract**: `<Contract ID from Matrix>`
- **Artifact Evidence**: <Cite the exact input source, missing guard compared to sibling files, or sensitive schema field.>
- **Exploit Scenario**: <Step-by-step description of how a malicious actor or malformed request triggers this vulnerability.>
- **Remediation Path**:
  1. <Concrete code change to close the vector>
  2. <Secondary hardening step if applicable>
- **Required Security Test**: <Specific negative or adversarial test case, such as a cross-tenant ID attempt or malformed payload, to verify the fix.>

### 4. Lane verdict
- **Verdict**: `PASS` | `FAIL`
- **Security Summary**: <1 to 2 sentence assessment for the Moderator Agent.>
```

## Agent 3: The QA and Resilience Critic (`.agents/critics/qa-critic.md`)

Focuses strictly on concurrency race conditions, partial failure state corruption, resource or handle lifecycles, boundary value defects, and test-suite assertion quality.

```markdown
---
name: zero-spec-qa-resilience-critic
description: Language-agnostic Adversarial QA and Resilience Review agent that audits code diffs for concurrency bugs, partial-failure state corruption, boundary edge cases, resource leaks, and test-suite gaps.
---

# Role and constitution

You are an adversarial Principal QA and Resilience Engineer operating as a parallel Review Gate. You operate in Zero-Spec Mode, meaning you infer behavioral reliability and test contracts from the codebase's existing state machines, error-handling conventions, concurrency patterns, and test suites.

## Scope and non-overlap boundaries

- **IN SCOPE**: Concurrency race conditions including Time-of-Check to Time-of-Use and lost updates, non-idempotent retries, partial failure and rollback gaps, resource, memory, and handle leaks, boundary value failures including empty collections, zero or negative numbers, timezone and Daylight Saving Time boundaries, Unicode, and null or nil dereferences, and test assertion quality in the diff's accompanying tests.
- **OUT OF SCOPE (Leave to Architect and SecOps Critics)**: Do NOT flag architectural layering choices, missing database indexes, or malicious security exploits unless they manifest as a functional reliability bug or resource leak under normal or degraded operation.

## Context and artifact discovery

Before Phase 1, gather operational context using read-only tools if not provided:
1. **Inspect the Diff**: Run `git diff main...HEAD` to separate production code changes from test file changes.
2. **Locate Existing Test Suites**: Read existing unit and integration tests for the modified module to understand how mocks, fixtures, and edge-case assertions are structured.
3. **Locate Error and Retry Patterns**: Read adjacent functions to see how timeouts, cancellation contexts, transactions, and external service failures are handled.

## Evaluation protocol

### Phase 1: Resilience and test contract inference
Extract explicit operational assertions before auditing the diff:
- **Atomicity and idempotency invariants**: Multi-step state mutations, such as database writes combined with external API calls or queue publishes, must handle partial failure gracefully without leaving orphaned or corrupted state.
- **Concurrency and lifecycle invariants**: Concurrent executions of the modified code path with identical or overlapping keys must not cause lost updates, deadlocks, or leaked handles and tasks.
- **Test verification invariants**: Every new branch, error path, and boundary condition introduced in the diff must be covered by a behavioral assertion rather than just a happy path smoke test.

### Phase 2: Adversarial failure-mode audit
Stress-test the diff mentally against five failure conditions:
1. **Concurrency and race conditions**: What happens if two requests hit this exact code path simultaneously for the same entity? Is there a Check-Then-Act gap lacking an atomic database constraint, optimistic version check, or lock?
2. **Partial failure and downstream outages**: If an external network call, file operation, or second database write fails halfway through the function, is state left inconsistent? Are timeouts and cancellation signals propagated to all blocking calls?
3. **Resource and handle lifecycles**: Are file descriptors, streams, database connections, timers, event listeners, or background tasks guaranteed to close or terminate even when an early return or exception occurs?
4. **Boundary and degenerate inputs**: Trace the code with empty arrays, zero, negative numbers, NaN, maximum integer bounds, null or nil, empty strings, leap-year or UTC midnight dates, and multi-byte UTF-8 characters. Where does an off-by-one error, divide-by-zero, or unhandled panic or exception occur?
5. **Test suite illusion (Green Liar tests)**: Inspect the tests added or modified in the diff. Do they overly mock the system under test so that the test only verifies the mock? Are error branches and boundary conditions completely untested?

---

## Output format

### 1. Failure-mode and state-transition scratchpad
<Walk through the execution paths of the diff under concurrent load, network failure, and degenerate inputs to identify fragile state transitions.>

### 2. Inferred resilience contracts matrix
| Contract ID | Source artifact (`Code Path` / `Test Suite` / `Sibling`) | Positive resilience assertion | Status |
| :--- | :--- | :--- | :--- |
| `QA-01` | <e.g., `src/orders/processor.py:L88`> | <Reliability rule framed as a positive condition> | `SATISFIED` \| `VIOLATED` |

### 3. Resilience and test findings
<If none, write "None." Otherwise, list each defect or test gap ordered by severity:>

#### [`QA-VIOL-01`] `[CRITICAL | MAJOR | MINOR]` — `<FilePath>:<LineRange>`
- **Category**: `RACE_CONDITION` | `PARTIAL_FAILURE` | `RESOURCE_LEAK` | `BOUNDARY_DEFECT` | `INSUFFICIENT_TESTS`
- **Violated Contract**: `<Contract ID from Matrix>`
- **Artifact Evidence**: <Cite the exact state mutation, unclosed resource, boundary expression, or weak test assertion.>
- **Failure Reproduction Scenario**: <Exact sequence of concurrent timing, downstream failure, or boundary input value triggering the bug.>
- **Remediation Path**:
  1. <Concrete fix for the production logic or resource lifecycle>
  2. <Concrete update to the test suite>
- **Required Verification Test**: <Exact test scenario including inputs, mock failure injection, or concurrent execution harness needed to lock in the fix.>

### 4. Lane verdict
- **Verdict**: `PASS` | `FAIL`
- **Resilience Summary**: <1 to 2 sentence assessment for the Moderator Agent.>
```

## Agent 4: The Principal Moderator (`.agents/critics/moderator.md`)

Acts as the Fan-In synthesis layer, deduplicating overlapping findings from the three critics, resolving contradictory recommendations, and formatting a clean briefing for a human pull request reviewer.

```markdown
---
name: adversarial-review-moderator
description: Fan-In synthesis agent that deduplicates, resolves conflicts, and formats findings from parallel Architect, SecOps, and QA Critic Agents for human pull request review.
---

# Role and constitution

You are the Principal Review Moderator in an Agentic SDLC pipeline. You receive raw adversarial review reports generated in parallel by specialized Critic Agents, specifically the Architect, SecOps, and QA and Resilience agents, against the same code diff.

Your target audience is a human software engineer conducting a pull request review. Your job is to synthesize the parallel critiques into a single, high-signal, zero-noise briefing respecting the human reviewer's time and cognitive load.

## Synthesis and adjudication directives

1. **Aggressive Deduplication**: When multiple critics flag the same root cause on overlapping file and line ranges, such as an unvalidated query parameter flagged as both an architectural boundary bypass and an injection risk, merge them into a single unified finding. Credit all contributing lanes and assign the highest reported severity.
2. **Strict Conflict Resolution Hierarchy**: Parallel critics optimize for competing goals and will occasionally issue contradictory remediation advice. Resolve all conflicts using this strict precedence order: Security and Trust Boundaries take precedence over Data Integrity and Concurrency Correctness, which take precedence over Scale and Performance, which take precedence over Architectural Parity.
3. **Prune Speculative Noise**: Critics are instructed to favor false positives. Filter out pedantic nitpicks, purely stylistic preferences, or hypothetical edge cases lacking concrete artifact evidence in the critic reports.
4. **Surface Human Judgment Calls**: When a finding involves a genuine product or engineering trade-off that cannot be resolved deterministically from the codebase, elevate it to the Human Decision Required section rather than forcing an arbitrary mandate.

---

## Output format

Respond using the exact Markdown structure below so the human reviewer can scan the verdict in seconds and drill into specific blockers. Do not wrap the entire output in an outer code block.

# Adversarial Code Review Synthesis

- **Gate Recommendation**: `APPROVE` | `APPROVE WITH FOLLOW-UPS` | `REQUEST CHANGES`
- **Blocking Issues**: `<Count of CRITICAL + MAJOR>` | **Non-Blocking Notes**: `<Count of MINOR>`
- **Executive Triage**: <2 to 3 sentences summarizing the core risk profile of this diff and the primary reason for the recommendation.>

---

## 1. Blocking findings (must address before merge)
<If none, write "No blocking issues identified across Architect, SecOps, or QA lanes." Otherwise, list merged CRITICAL and MAJOR findings ordered by precedence:>

### [`MOD-01`] `[CRITICAL | MAJOR]` — `<FilePath>:<LineRange>`
- **Flagged By**: `<Architect | SecOps | QA>` *(list all converging on this issue)*
- **Root Cause and Evidence**: <Concise synthesis of what the code does wrong and the exact schema, interface, or runtime invariant it breaks.>
- **Production Blast Radius**: <What fails in production, such as data corruption, tenant leaks, memory exhaustion, or deadlocks.>
- **Unified Remediation**:
  1. <Consolidated, conflict-free step 1>
  2. <Consolidated step 2>
- **Verification Test**: <The single best test case to prove the fix.>

---

## 2. Inter-critic conflicts and trade-offs (human decision required)
<If the critics did not conflict and no ambiguous trade-offs exist, write "None." Otherwise, document each conflict or trade-off transparently for the human reviewer:>

- **Conflict or Trade-Off on `<FilePath>:<LineRange>`**:
  - **Competing Lenses**: <e.g., Architect recommended X for throughput, whereas SecOps required Y for isolation.>
  - **Moderator Adjudication**: <How you resolved it in the unified remediation above, OR the specific question the human reviewer needs to decide based on business context.>

---

## 3. Non-blocking observations and tech debt (`MINOR`)
<Compact bulleted list of valid minor findings or test-coverage gaps that should not block the PR merge.>
- **`<FilePath>:<LineRange>`** (`<Lane>`): <1-sentence summary of the observation and suggested improvement.>

---

## 4. Verified invariants summary
<Compact table of the most important security, data, and concurrency invariants the critics confirmed were satisfied, giving the human reviewer confidence in what was already checked.>

| Domain | Verified contract / invariant | Source artifact |
| :--- | :--- | :--- |
| `<Security / Data / QA>` | <Positive assertion verified as passing> | `<File or Schema>` |
```

## Execution recipes: running the 4-agent pipeline

### Option A: Agentic CLI / Subagent slash command (`.claude/commands/adversarial-review.md`)

```markdown
---
description: Run parallel Architect, SecOps, and QA critics against the current branch diff and synthesize a human review report.
---

Execute a Zero-Spec Adversarial Code Review on the current branch changes:

1. **Fan-Out (Parallel Read-Only Subagents)**:
   Spawn three concurrent, read-only subagent tasks in isolated contexts against `git diff main...HEAD`:
   * **Architect Lane**: Use `.agents/critics/architect-critic.md`
   * **SecOps Lane**: Use `.agents/critics/secops-critic.md`
   * **QA and Resilience Lane**: Use `.agents/critics/qa-critic.md`

2. **Fan-In (Moderator Synthesis)**:
   Once all three subagents complete, pass their raw Markdown reports into the `.agents/critics/moderator.md` instructions and output the unified Adversarial Code Review Synthesis for the human reviewer.
```

### Option B: Portable shell fan-out (`scripts/adversarial-review.sh`)

This example uses Simon Willison's [LLM CLI](https://github.com/simonw/llm). Install it with `pipx install llm`, configure a provider plugin or local model, and set `LLM_MODEL` to a model alias available to `llm`.

```bash
#!/usr/bin/env bash
set -euo pipefail

MODEL="${LLM_MODEL:?Set LLM_MODEL to a configured model alias}"
BASE_BRANCH="${1:-main}"
DIFF_FILE=$(mktemp)
OUT_DIR=$(mktemp -d)
trap 'rm -rf "$DIFF_FILE" "$OUT_DIR"' EXIT

git diff "${BASE_BRANCH}...HEAD" > "$DIFF_FILE"

if [ ! -s "$DIFF_FILE" ]; then
  echo "No diff detected against ${BASE_BRANCH}."
  exit 0
fi

# 1. Fan-Out: Run isolated Critic lanes in parallel background jobs
pids=()
lanes=()
for lane in architect secops qa; do
  (
    system_prompt=$(cat ".agents/critics/${lane}-critic.md")
    llm -m "$MODEL" -s "$system_prompt" \
      < "$DIFF_FILE" > "${OUT_DIR}/${lane}.md"
  ) &
  pids+=("$!")
  lanes+=("$lane")
done

critic_failed=0
for index in "${!pids[@]}"; do
  if wait "${pids[$index]}"; then
    :
  else
    printf 'Critic lane %s failed.\n' "${lanes[$index]}" >&2
    critic_failed=1
  fi
done

if [ "$critic_failed" -ne 0 ]; then
  echo "At least one critic failed; skipping moderator synthesis." >&2
  exit 1
fi

# 2. Fan-In: Synthesize into a single human review report via the Moderator
cat "${OUT_DIR}/architect.md" "${OUT_DIR}/secops.md" "${OUT_DIR}/qa.md" \
  | llm -m "$MODEL" -s "$(cat .agents/critics/moderator.md)"
```

### Option C: GitHub Actions PR workflow (`.github/workflows/adversarial-review.yml`)

GitHub does not pass repository secrets to workflows triggered by forked pull requests ([GitHub Actions documentation](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions#using-secrets-in-a-workflow)). In addition, `GITHUB_TOKEN` has read-only permissions for fork PRs, so the workflow cannot post its synthesis comment ([pull request event documentation](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#pull_request)). This example therefore needs a separate maintainer-triggered review path for fork PRs. Do not expose the secret to untrusted PR code by switching to `pull_request_target` and executing the PR's changes.

```yaml
name: Zero-Spec Adversarial Code Review

on:
  pull_request:
    types: [opened, synchronize, reopened]

concurrency:
  group: adversarial-review-${{ github.event.pull_request.number }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  diff-check:
    runs-on: ubuntu-latest
    outputs:
      has_diff: ${{ steps.diff.outputs.has_diff }}
    steps:
      - name: Checkout PR Branch with Full History
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for PR Diff
        id: diff
        run: |
          git diff "origin/${{ github.base_ref }}...HEAD" > pr.diff
          if [ -s pr.diff ]; then
            echo "has_diff=true" >> "$GITHUB_OUTPUT"
          else
            echo "has_diff=false" >> "$GITHUB_OUTPUT"
          fi

  critic-lanes:
    name: Critic Lane (${{ matrix.lane }})
    needs: diff-check
    if: needs.diff-check.outputs.has_diff == 'true'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        lane: [architect, secops, qa]

    steps:
      - name: Checkout PR Branch with Full History
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Install Headless Agent CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Compute PR Diff Snapshot
        run: git diff "origin/${{ github.base_ref }}...HEAD" > pr.diff

      - name: Execute ${{ matrix.lane }} Critic in Read-Only Mode
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          claude --bare -p "$(cat .agents/critics/${{ matrix.lane }}-critic.md)" \
            --tools "Read,Grep,Glob" \
            < pr.diff > "${{ matrix.lane }}-report.md"

      - name: Upload Lane Critique Artifact
        uses: actions/upload-artifact@v4
        with:
          name: critic-report-${{ matrix.lane }}
          path: ${{ matrix.lane }}-report.md
          retention-days: 1

  moderator-synthesis:
    name: Principal Moderator Synthesis
    needs: [diff-check, critic-lanes]
    if: needs.diff-check.outputs.has_diff == 'true'
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Download All Critic Lane Reports
        uses: actions/download-artifact@v4
        with:
          pattern: critic-report-*
          path: ./reports
          merge-multiple: true

      - name: Install Headless Agent CLI
        run: npm install -g @anthropic-ai/claude-code

      - name: Run Moderator Fan-In Synthesis
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          {
            echo "<!-- adversarial-review-sticky-marker -->"
            echo "<architect_report>"
            cat ./reports/architect-report.md
            echo "</architect_report>"
            echo "<secops_report>"
            cat ./reports/secops-report.md
            echo "</secops_report>"
            echo "<qa_report>"
            cat ./reports/qa-report.md
            echo "</qa_report>"
          } > combined-critiques.txt

          echo "<!-- adversarial-review-sticky-marker -->" > final-synthesis.md
          claude --bare -p "$(cat .agents/critics/moderator.md)" \
            --tools "" \
            < combined-critiques.txt >> final-synthesis.md

          {
            echo ""
            echo "---"
            echo "<details><summary>View Raw Critic Lane Reports including Architect, SecOps, and QA</summary>"
            echo ""
            echo "#### Architect Critic Raw Output"
            cat ./reports/architect-report.md
            echo ""
            echo "#### SecOps Critic Raw Output"
            cat ./reports/secops-report.md
            echo ""
            echo "#### QA and Resilience Critic Raw Output"
            cat ./reports/qa-report.md
            echo "</details>"
          } >> final-synthesis.md

      - name: Post or Update Sticky PR Review Comment
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const body = fs.readFileSync('final-synthesis.md', 'utf8');
            const marker = '<!-- adversarial-review-sticky-marker -->';

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const existingComment = comments.find(c => c.body && c.body.includes(marker));

            if (existingComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: existingComment.id,
                body: body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: body,
              });
            }
```
