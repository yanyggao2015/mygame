import type { NextConfig } from "next";
import { computeBuildId } from "./lib/compute-build-id";

// Computed exactly once, when the build starts, and inlined into every
// bundle (static pages and Route Handlers alike) via the `env` block
// below. This is deliberate: `lib/build-info.ts` must never read
// `VERCEL_GIT_COMMIT_SHA` directly from `process.env` at request time,
// because a statically-prerendered page reads env at *build* time while a
// dynamic Route Handler reads it at *request* time — on a platform that
// didn't guarantee identical env between those two moments, that would
// let the root page and /api/health silently disagree on which commit is
// live (Sprint 1 Req 5/6 exists specifically to make that detectable).
// Computing it once here and inlining it removes the dependency on that
// guarantee entirely: both consumers get the literal same string.
const BUILD_ID = computeBuildId(
  process.env.VERCEL_GIT_COMMIT_SHA,
  new Date().toISOString(),
);

const nextConfig: NextConfig = {
  env: {
    NEXT_BUILD_ID: BUILD_ID,
  },
};

export default nextConfig;
