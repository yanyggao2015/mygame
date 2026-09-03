---
id: 3
title: "Household account and authentication"
epic: "Parent Account and Visibility"
status: todo
created: 2026-09-03T03:37:19+00:00
---

# Master Controller Sprint Definition — Sprint 3

**Epic:** Parent Account and Visibility — give the parent a durable place to see how their child is actually doing.
**Sprint Objective:** Stand up a single household account with secure login, session persistence, and protected routes, so later sprints have an identity to attach practice history to.

### Context
The PRD's success criterion is that the parent can see exactly where the child went wrong. That is a claim about history, not about a single screen — it requires an identity and a database. This sprint builds only the identity half. It ships deliberately little user-visible value on its own, and that is the correct trade: it is the one substantial piece of work that is genuinely independent of the math pipeline, so it is the only sensible thing to run in parallel while Dev Team 1 builds the solver.

Scope is held to accounts and sessions on purpose. The schema for attempts and practice history is **not** in this sprint, because designing a history schema before the practice loop exists produces a schema that does not fit the thing it is supposed to record. That table gets designed in Sprint 7, against a practice loop that actually runs.

### Requirements
1. A hosted Postgres database is provisioned and reachable from the deployed app. Connection credentials are server-only and follow the secret conventions established in Sprint 1 Req 7.
2. The schema is defined in **committed migration files**, not applied by hand against the live database. A fresh database can be brought to the current schema by running the migrations and nothing else.
3. A parent can register a household account with an email and a password, and log in with those credentials afterwards.
4. Passwords are stored only as a salted hash from a purpose-built password hashing function. A plaintext or bare-SHA password anywhere in the codebase or database is an automatic FAIL, not a finding to weigh.
5. Sessions persist across a page reload and across a browser restart, and expire after a documented period. The session cookie is `HttpOnly` and `Secure`.
6. Routes that will hold child or practice data are protected: an unauthenticated request to a protected route redirects to login rather than rendering. At least one protected placeholder route exists so this is testable now.
7. Logging out ends the session: after logout, a protected route redirects to login and the back button does not restore an authenticated view from cache.
8. Authentication failures return a **generic** message that does not reveal whether the email exists. Rate limiting or equivalent brute-force resistance is applied to the login endpoint, and the approach is documented.

### Acceptance Criteria
- QA1 confirms by reading the diff that passwords pass through a real password-hashing function with a per-user salt, and that no code path logs, returns, or stores a plaintext password.
- QA1 confirms migrations are committed files and that no schema change is applied imperatively at runtime or documented as a manual step.
- QA1 confirms the session cookie is set `HttpOnly` and `Secure`, and that the expiry period is a named constant, not a scattered literal.
- QA1 confirms the login failure path returns an identical message and an identical status for "unknown email" and "wrong password" — reading both branches, since this is exactly the difference a summary of the code would hide.
- LiveQA registers an account on the live URL, logs out, logs back in, and confirms each step succeeds in a real browser.
- LiveQA reloads the page and restarts the browser while logged in, and confirms the session survives both.
- LiveQA visits the protected route while logged out and confirms it is **redirected to login and the protected content never renders** — checking the rendered page, not only the final URL, since a flash of protected content before a client-side redirect is a real leak that a URL assertion misses.
- LiveQA logs out, presses the browser back button, and confirms the authenticated view does not return from cache.
- LiveQA submits a login with a deliberately wrong password and with a non-existent email, and confirms the two produce the **same visible message**, quoting the message text observed in both cases.

### Out of Scope
- A separate child login and multi-child support. v1 is one household account, per the product decision. Child accounts change every downstream data model and are a v2 epic, not a stretch goal here.
- Password reset by email. It needs an email provider and is a self-contained follow-up sprint; shipping a half-wired reset flow is worse than not having one.
- The attempts/practice-history schema — Sprint 7, deliberately, for the reason in Context.
- OAuth or social login. Email and password is sufficient for one household and avoids a provider dependency in a foundational sprint.

### Dependencies
- Blocks: Sprint 7 (parent review dashboard has nothing to attach to without an account).
- Blocked by: Sprint 1 (needs the deployed app and the secret conventions).
- External: A hosted Postgres instance. **The user must provide or approve provisioning this** — flag on day one if it is not available, since Reqs 1-3 cannot be completed or honestly live-tested without it. Do not substitute a local SQLite file and report the sprint as done; the acceptance criteria are written against the deployed app.

### Team Assignments
- **Dev Team 2:** This sprint, entire. Run `/sprint-worktree 3` and `cd` into the printed path **before touching any file**, and stay there for the whole sprint. Dev Team 1 is in the main checkout on Sprint 2.
- **Dev Team 1:** Sprint 2. Not this.
- The two sprints share no feature surface, but both will want to edit `package.json` and both may touch root layout. That overlap is precisely what the worktree exists to absorb.

### Risks & Mitigations
- **Rolling bespoke session handling introduces a subtle auth bug.** Auth is the classic place where clever costs more than it saves. — Mitigated by preferring a well-established library over hand-rolled token logic; QA1 should challenge any hand-written crypto or session signing.
- **Migrations drift from the live database** because someone fixed something in a console at 11pm. — Mitigated by Req 2's "fresh database from migrations alone" bar, which QA1 verifies as a property of the repo.
- **This sprint delivers no visible value and gets deprioritised mid-flight into "just add the dashboard too."** — Mitigated by the Out of Scope list; the dashboard is Sprint 7 and needs data that will not exist yet.
- **Both dev teams land conflicting `package.json` changes.** — Mitigated by the mandatory worktree and by Pipeman sequencing the two merges rather than pushing them simultaneously.
