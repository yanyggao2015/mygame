---
id: 2
title: "Symbolic math core: solver and answer equivalence"
epic: "Trustworthy Problem Generation"
status: todo
created: 2026-09-03T03:37:19+00:00
---

# Master Controller Sprint Definition — Sprint 2

**Epic:** Trustworthy Problem Generation — make correctness a property of the system rather than a hope about the model.
**Sprint Objective:** Build a pure, deterministic math library that can independently solve a problem and decide whether two answers are mathematically equivalent, with no network and no LLM anywhere in it.

### Context
This is the load-bearing sprint of the product. An LLM asked for a math problem will produce a problem and a confidently wrong answer key often enough to matter. If that key reaches the grader, we mark a correct child wrong and then generate a fluent step-by-step explanation of a false answer. That is worse than shipping nothing: the parent came here specifically so they would not have to check the math themselves, and one such incident is unrecoverable. The defence is a second, independent, deterministic authority on what the answer is — this library.

It is also the grader. The product accepts free-entry answers, so `3/4`, `0.75`, `6/8`, and `.75` are all correct and must all be graded correct. Both jobs — verifying the generator and grading the child — reduce to the same primitive, equivalence, which is why they are one sprint and one module rather than two implementations that will drift apart.

### Requirements
1. A `lib/math/` module with no imports from React, Next.js, the network, or any LLM SDK. Every exported function is pure and deterministic: the same inputs return the same output on every call, with no I/O.
2. **Domain types** are defined here and owned here: a `ProblemSpec` (the structured, machine-solvable description of a problem) and an `Answer` with an explicit answer *type* tag. Sprint 4 consumes these; it does not redefine them.
3. **Answer parsing.** `parse(input: string, type)` converts raw child-typed text into a normalized internal form. It must handle, at minimum: integers, decimals, fractions (`3/4`), negatives, radicals (`sqrt(8)`, `2sqrt(2)`), simple one-variable algebraic expressions, coordinate pairs (`(2, -1)`), and finite solution sets (`x = 1, 2`). Unparseable input returns an explicit parse failure — never a silent `null`, and never a coerced `0`.
4. **Equivalence.** `isEquivalent(a, b, type)` returns true when two parsed answers are mathematically equal and false otherwise. It must return true for at least: `3/4` vs `0.75` vs `6/8` vs `.75`; `sqrt(8)` vs `2sqrt(2)`; `x = 2` vs `2`; `{1, 2}` vs `{2, 1}`; `2x + 3` vs `3 + 2x`. It must return false for near-misses such as `3/4` vs `4/3` and `-2` vs `2`.
5. **Solving.** `solve(spec: ProblemSpec)` independently computes the answer for every topic family v1 supports, returning either an `Answer` or an explicit "cannot solve this spec" result. It never guesses and never returns a partially-computed answer as if it were final.
6. **The verification primitive.** `verify(spec, proposedAnswer)` returns a pass/fail plus a machine-readable reason. This is the single function Sprint 4 calls to gate generated problems. Its contract: a `false` return must be safe to treat as "discard this problem."
7. **A fixture corpus** of at least 60 cases lives in the repo as test data: solvable specs with known answers, equivalence pairs that must match, near-miss pairs that must not match, and malformed inputs that must fail cleanly. The suite runs under `npm test`.
8. **Floating-point tolerance is an explicit, documented decision**, not an accident of whichever comparison was typed first. Where a numeric tolerance is used, its value and rationale are recorded in the module. Exact types (rationals, radicals) are compared exactly, not by casting to float — `0.1 + 0.2 !== 0.3` is a bug the child will be blamed for.

### Acceptance Criteria
- QA1 confirms by reading the diff that `lib/math/` imports nothing from React, Next.js, `fetch`, or an LLM SDK, and that no exported function performs I/O or reads a clock or random source.
- QA1 runs `npm test` and confirms the fixture corpus of Req 7 passes with at least 60 cases present — counting them, not trusting a summary line.
- QA1 confirms every specific pair named in Req 4 appears in the test corpus as an actual assertion. A general "equivalence works" test does not satisfy this; the named cases are named because they are the ones that break.
- QA1 confirms `parse` returns an explicit failure value on malformed input, verified by a test asserting that value — not by absence of a crash.
- QA1 confirms `verify` returns a machine-readable reason on failure, and that the reason is asserted on in a test.
- QA1 confirms the tolerance decision of Req 8 is documented in the module and that rational and radical comparisons do not route through floating-point casts.
- **LiveQA has no gate on this sprint** and should record that explicitly rather than attempting one. This module has no UI and no deployed surface; it is reachable in a browser only via Sprint 4 and Sprint 5. This is a genuine, argued exemption for a pure library, not a precedent for skipping live tests on anything user-facing.

### Out of Scope
- Any LLM call, prompt, or API route — Sprint 4 owns generation. This library must remain independently verifiable, which it stops being the moment it can call the thing it is meant to check.
- Step-by-step explanation text — Sprint 6. Solving and explaining are different problems; conflating them here would put prose generation inside a module that must stay pure.
- Graphing, geometric proofs, and any answer that cannot be typed as text. v1's answer entry is free-text, so a problem whose answer is a drawing is unanswerable by construction.
- The topic taxonomy and difficulty definitions — Sprint 4 owns those. This sprint owns the *shape* of a `ProblemSpec`, not the catalogue of which ones we generate.

### Dependencies
- Blocks: Sprint 4 (cannot gate generation without `verify`), Sprint 5 (cannot grade without `isEquivalent`), Sprint 6.
- Blocked by: Sprint 1 (needs the build and test runner).
- External: A computer-algebra capability. **Unverified assumption, flagged deliberately:** Master Controller has not benchmarked any JS CAS against the Req 4 cases and is not asserting that `mathjs`, `nerdamer`, or any other specific library can satisfy them. Dev Team runs a short spike against the Req 7 corpus *before* committing to a library, and reports back if none clears the bar — in which case a Python/sympy serverless function is the fallback and Master Controller re-scopes. Do not build the whole module on an assumed capability.

### Team Assignments
- **Dev Team 1:** This sprint, entire.
- **Dev Team 2:** Sprint 3, running in parallel. Dev Team 2 must run `/sprint-worktree 3` and `cd` into the printed worktree path before touching any file. These two sprints are independent by design — Sprint 2 is a pure library under `lib/math/`, Sprint 3 is auth and schema — but "independent" has not been sufficient in practice, and both sprints will want to touch `package.json`. The worktree is not optional.

### Risks & Mitigations
- **No available JS CAS handles radicals or symbolic equivalence well enough.** This is the most likely way this sprint slips. — Mitigated by the Req 7 corpus existing as the spike's pass/fail bar, and by the documented sympy fallback in Dependencies. Find this out in a day, not in week two.
- **Equivalence is too permissive and grades wrong answers correct.** Silently destroys the product's value; nobody notices because everything looks like it works. — Mitigated by Req 4's explicit near-miss cases, which are as important as the matching cases.
- **The library drifts from the grader**, and generation-verification and child-grading end up with two notions of "equal." — Mitigated structurally by making both call the same `isEquivalent`; QA1 should treat any second equivalence implementation elsewhere in the codebase as a finding.
- **Floating point silently marks a correct child wrong.** — Mitigated by Req 8.
