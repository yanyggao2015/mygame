import "server-only";

/**
 * The build identifier shown on the root page and returned by
 * `GET /api/health`. Both call this same function so the two values can
 * never drift apart (Sprint 1, Req 5/6).
 *
 * The value itself is computed exactly once, at build start, in
 * `next.config.ts`, and inlined here as `process.env.NEXT_BUILD_ID` —
 * see the comment there for why this is a build-time constant rather
 * than a runtime `process.env.VERCEL_GIT_COMMIT_SHA` read: a statically
 * prerendered page and a dynamic Route Handler read env at different
 * moments (build vs. request), and only inlining guarantees they agree.
 *
 * This module is server-only (see the `server-only` import above, which
 * fails the build if imported from a Client Component) even though the
 * build id itself isn't a secret — it establishes the pattern this
 * codebase uses for reading env-derived values before any actual secret
 * exists, per Sprint 1's Req 7 / risk notes.
 */
export function getBuildId(): string {
  return process.env.NEXT_BUILD_ID ?? "dev-local";
}
