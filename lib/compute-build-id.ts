/**
 * Pure logic for turning a (possibly absent) full git commit SHA into the
 * short build identifier this app displays. No env access, no
 * server-only restriction — this is called from `next.config.ts` at
 * build time (a plain Node process, outside Next's server/client
 * bundling) and is unit-tested directly here.
 */
export function computeBuildId(
  commitSha: string | undefined,
  fallback: string,
): string {
  if (commitSha) {
    return commitSha.slice(0, 7);
  }

  return fallback;
}
