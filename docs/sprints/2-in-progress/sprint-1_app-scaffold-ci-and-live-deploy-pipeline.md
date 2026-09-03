---
id: 1
title: "App scaffold, CI, and live deploy pipeline"
epic: "Foundation"
status: in_progress
created: 2026-09-03T03:37:19+00:00
---

# Master Controller Sprint Definition — Sprint 1

**Epic:** Foundation — stand up the application, its tests, and its deploy pipeline so every later sprint has somewhere to land and something to verify.
**Sprint Objective:** Ship a deployed, publicly reachable Next.js + TypeScript app with working CI, so that both QA gates in this project's lifecycle become functional.

### Context
There is no application in this repository yet — only the sprint workflow scaffold. Every feature sprint that follows is blocked on a build, a test runner, and a deploy target. More urgently, LiveQA's gate is currently inert: LiveQA tests a deployed product in a browser, and there is nothing deployed. Until a live URL exists, half this project's verification layer cannot run, so this sprint is a precondition for the process itself, not just for the features.

This sprint deliberately ships almost no product behaviour. Its value is that it makes everything after it verifiable. Resist the urge to start on math here — a scaffold sprint that quietly grows a feature is a scaffold sprint that fails its own acceptance criteria.

### Requirements
1. A Next.js application (App Router) with TypeScript in `strict` mode. `tsc --noEmit` passes with zero errors.
2. A test runner is installed and wired to an `npm test` script. At least one real test exists and passes; a placeholder that asserts `true === true` does not satisfy this.
3. A linter is installed and wired to `npm run lint`, passing clean on the committed tree.
4. The app deploys to Vercel on push to `main` and is reachable at a public HTTPS URL. That URL is recorded in the repository (in `README.md`) so LiveQA can find it without asking.
5. A root page renders the application name and a visible build identifier (short commit SHA or build timestamp), so LiveQA can confirm *which* commit it is looking at rather than assuming the deploy landed.
6. A `GET /api/health` route returns HTTP 200 with a JSON body containing the same build identifier shown on the root page.
7. Server-only secrets are structurally prevented from reaching the client: no secret is read outside a server context, and no secret-bearing variable is named with a `NEXT_PUBLIC_` prefix. A committed `.env.example` documents every variable the app expects, with placeholder values only. `.env*` files with real values are git-ignored.
8. The "Project standards" section of `CLAUDE.md` is filled in with the chosen stack, directory conventions, test command, lint command, and the live URL, replacing the placeholder line. Every downstream agent reads that file, so it must describe what was actually built, not what was planned.

### Acceptance Criteria
- QA1 confirms `tsc --noEmit`, `npm run lint`, and `npm test` each exit zero on a clean checkout of the audited commit, and that the test in Req 2 asserts on real application behaviour.
- QA1 confirms by reading the diff that no secret is referenced in a client component or a `NEXT_PUBLIC_` variable, and that `.env.example` lists every variable the code actually reads — not a subset.
- QA1 confirms `README.md` contains the live URL and that `CLAUDE.md`'s "Project standards" section no longer contains the placeholder text.
- LiveQA loads the live URL in a real browser and confirms the page renders the app name **and** a build identifier, and reports the identifier string it actually saw.
- LiveQA requests `/api/health` against the live URL and confirms it returns 200 with a build identifier **matching the one rendered on the page**. A mismatch is a FAIL — it means the page and the API are being served from different builds, which would make every later live test unreliable.
- LiveQA confirms the deployed build identifier corresponds to the commit Pipeman shipped. If it does not, the deploy pipeline is not actually wired to `main` and Req 4 is unmet regardless of what the dashboard reports.

### Out of Scope
- Any math, problem generation, or LLM integration — Sprint 2 and Sprint 4 own that, and pulling it forward would make this sprint's acceptance criteria untestable.
- Authentication and any database — Sprint 3 owns those. This app is public and stateless at the end of this sprint.
- Visual design beyond legibility. Styling this before the screens exist is rework.

### Dependencies
- Blocks: Sprints 2, 3, 4, and every sprint after them. Nothing can be built or live-tested until this lands.
- Blocked by: Nothing.
- External: A Vercel account connected to this repository, and a git remote. **Both are the user's to provide** — flag immediately if either is missing rather than building around it, because a "deploy" that only runs locally fails Req 4 and silently keeps LiveQA's gate inert.

### Risks & Mitigations
- **The deploy appears green but serves a stale build.** This is the failure that makes every later live test lie, and it is invisible without a check. — Mitigated by Reqs 5 and 6: the build identifier must appear in both the page and the API, and LiveQA verifies both match the shipped commit.
- **Secrets leak into the client bundle later, once an API key exists in Sprint 4.** A convention established now is far cheaper than an audit later. — Mitigated by Req 7 setting the pattern before any secret exists, and by recording it in `CLAUDE.md` per Req 8.
- **Scope creep into "just a little UI."** — Mitigated by an explicit Out of Scope list; QA1 should treat unrequested feature code in this sprint as a finding, not a bonus.
- **Unverified assumption:** Master Controller has not run the Vercel CLI or confirmed this repository's remote configuration. Req 4's mechanism (git-push-triggered deploy) is an assumption, not measured fact. Dev Team verifies it end-to-end before claiming Req 4, and flags to Master Controller if the actual mechanism differs.
