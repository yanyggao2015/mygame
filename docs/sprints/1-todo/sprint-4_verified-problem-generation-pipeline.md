---
id: 4
title: "Verified problem generation pipeline"
epic: "Trustworthy Problem Generation"
status: todo
created: 2026-09-03T03:37:19+00:00
---

# Master Controller Sprint Definition — Sprint 4

**Epic:** Trustworthy Problem Generation — make correctness a property of the system rather than a hope about the model.
**Sprint Objective:** Generate grade-, topic-, and difficulty-appropriate problems through an LLM, and let none of them reach a child until Sprint 2's solver has independently confirmed the answer key.

### Context
Sprint 2 built the authority on what an answer is. This sprint puts it in front of the model. The pipeline is: the LLM proposes a problem and a key, the solver independently solves the same problem, and the two must agree. Disagreement means the problem is discarded and regenerated — quietly, with no user-visible failure and no "we think this might be wrong" caveat. The child never sees a problem whose answer we could not confirm ourselves.

This sprint also settles something the PRD left open. "10th/11th/12th grade" is not a topic specification — depending on the district, 10th grade is Geometry or Algebra II and 12th is Precalculus, Calculus, or Statistics. Handing the model a bare grade and the word "hard" produces a random draw from four curricula at an arbitrary difficulty. So the selection is grade **plus topic**, and difficulty is defined operationally per topic rather than passed through as an adjective.

### Requirements
1. A **topic taxonomy** is defined as committed data: for each of grades 10, 11, and 12, the list of topics offered. Topics are named as a parent would recognise them ("Quadratic equations", "Right-triangle trigonometry"), not as internal identifiers.
2. **Difficulty is operationally defined** per topic, in committed data, in terms the generator can act on — for example expected solution-step count, and whether coefficients are integer, rational, or irrational. The bare strings "easy", "medium", "hard" must not be the only thing passed to the model. The definitions are readable by a human reviewing the file.
3. A server-side route accepts a grade, topic, difficulty, and count, and returns that many problems. **The LLM API key is read only on the server** and never appears in the client bundle, per Sprint 1 Req 7.
4. **Every returned problem has passed `verify()` from Sprint 2.** A problem whose proposed key the solver contradicts, or cannot check, is discarded and regenerated. Sprint 2's `verify` is called directly — this sprint does not implement its own correctness check, and any second notion of "correct" in this diff is a defect.
5. **Regeneration is bounded.** After a documented number of failed attempts, the route returns an explicit error. It never returns fewer problems than requested while reporting success, and it never returns an unverified problem with a caveat attached.
6. Each returned problem carries its `ProblemSpec`, its verified `Answer`, and the topic and difficulty it was generated for, so the practice loop and the parent dashboard can use them without re-deriving anything.
7. **The verification rejection rate is recorded** in server logs or a counter: how many generated problems the solver rejected. This number is the product's early-warning signal — if it climbs, the model or the prompt has drifted, and without it that failure is invisible.
8. **Generation latency is measured and written into the sprint file or `README.md`** as an observed figure for a set of 5 problems. Budget: under 15 seconds. If the measurement exceeds it, that is a reported finding and an input to a follow-up sprint, not a reason to silently ship a slow path or to skip the measurement.
9. Malformed model output — invalid JSON, a missing key, a spec the solver cannot parse — is handled as a normal expected case and counted toward the Req 5 attempt budget. It never crashes the route or surfaces a raw model error to the client.

### Acceptance Criteria
- QA1 confirms by reading the diff that there is exactly one path out of this route to the client and that `verify()` gates it — that no branch, error path, fallback, or cache can emit a problem that has not passed. This is the single most important thing to audit in this sprint.
- QA1 confirms no second correctness check or equivalence implementation exists in this diff; the sprint calls Sprint 2's module.
- QA1 confirms the API key is read only in server code and appears in no client component and no `NEXT_PUBLIC_` variable.
- QA1 confirms the topic taxonomy and difficulty definitions are committed data files with all three grades populated, and that difficulty carries structural parameters rather than only the adjective.
- QA1 confirms the retry bound is a named constant and that exhausting it returns an explicit error — reading the error path itself, since a route that quietly returns a short list would pass any test that only counts a successful response.
- QA1 confirms malformed model output is handled on a normal code path, verified by a test that feeds it deliberately broken output.
- QA1 confirms the rejection-rate counter of Req 7 is actually incremented on the rejection path, not merely declared.
- LiveQA generates problems on the live URL for **each of the three grades**, at a minimum of two topics and two difficulties, and confirms problems render and are readable in a real browser.
- LiveQA independently checks the answer key of at least **five** generated problems by working them out, and reports each problem and key verbatim. This is the criterion that matters most in the whole sprint: it is the only place a human confirms the verification pipeline actually works end to end rather than merely running.
- LiveQA confirms an "easy" set and a "hard" set for the same grade and topic are observably different in difficulty, and describes the difference observed. If they are indistinguishable, Req 2 is unmet however well-formed the data file is.
- LiveQA reports the observed wall-clock latency for a set of 5, against the Req 8 budget.

### Out of Scope
- Step-by-step explanations — Sprint 6. Generation must be trustworthy before we build prose on top of it.
- The child-facing answer entry and grading UI — Sprint 5. This sprint's surface may be a minimal page sufficient to satisfy the live-test criteria above; polishing it is Sprint 5's job and doing it twice is waste.
- Caching or pre-generation of problem sets. A real optimisation, but premature until Req 8's latency measurement says whether it is needed. If it is, that is its own sprint with its own cache-invalidation questions.
- Any topic whose answer cannot be typed as text — consistent with Sprint 2's scope.

### Dependencies
- Blocks: Sprint 5 (nothing to practise against), Sprint 6, Sprint 7.
- Blocked by: **Sprint 2 must be complete, not merely underway.** This sprint's central requirement is a call into `verify()`; starting against a stub would mean building the entire pipeline against an unproven contract, which is precisely the risk Sprint 2 exists to retire. Sprint 1 also required.
- External: An LLM API key with billing enabled — **the user provides this**. Flag on day one if absent. Note that Req 8's latency and the Req 7 rejection rate are properties of the specific model chosen; record which model the figures came from, since they do not transfer to another.

### Team Assignments
- **Dev Team 1:** This sprint, entire. It is a single coherent pipeline and splitting it across two teams would put the verification gate on one side of a seam and the generation on the other, which is the one seam this product cannot afford.
- **Dev Team 2:** Not assigned here. If Sprint 3 has landed by this point, Dev Team 2 is idle by design rather than by oversight — Master Controller will scope Sprint 7's dashboard work once the practice loop's data shape is real. Do not self-assign work from the roadmap.

### Risks & Mitigations
- **The solver rejects so many generated problems that the pipeline is unusably slow or expensive.** The verification gate working correctly and the product being unusable look identical from the outside. — Mitigated by Req 7's rejection-rate counter making it a measured number on day one; if it is high, the fix is prompt or taxonomy work in a follow-up sprint, never loosening the gate.
- **Pressure to let an unverified problem through** when the retry budget is exhausted, because an error feels worse than a maybe-correct problem. — Mitigated by Req 5 and by making the single-exit-path audit QA1's first-listed criterion. This is the decision that defines the product; it is not a judgment call to be made under deadline.
- **Generated problems are technically correct but pedagogically wrong** for the grade — solvable, verified, and completely inappropriate. The solver cannot catch this; only a human can. — Mitigated by LiveQA's difficulty-differentiation and manual-checking criteria, which are deliberately human judgment rather than assertions.
- **Latency makes the tool feel broken** to a parent sitting with a child. — Mitigated by Req 8 forcing a measurement now, so the decision to cache is made against a number.
- **Unverified assumption:** Master Controller has not measured any model's rate of producing wrong answer keys, or its latency. Reqs 7 and 8 are written to *measure* these rather than to assert them. Report the actual figures back — they are the main input to whether the epic needs another sprint.
