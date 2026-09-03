// Test-only stub for the "server-only" package.
//
// The real package unconditionally throws on import — Next.js relies on
// its own bundler aliasing it to a no-op only in genuine server bundles,
// and to this throwing version in client bundles. Vitest isn't Next's
// bundler, so without this alias (see vitest.config.ts) every test that
// imports a server-only module (e.g. lib/build-info.ts) would fail
// immediately, for a reason that has nothing to do with the behavior
// under test. This stub reproduces the "server bundle" side: a no-op.
export {};
