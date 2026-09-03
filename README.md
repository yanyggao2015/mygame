# MyGame

**Live:** https://mygame-black-mu.vercel.app

A Next.js (App Router) + TypeScript application. This repository is built
and shipped through the Fully Completely sprint lifecycle — see
[`CLAUDE.md`](./CLAUDE.md) for the workflow, roles, and project standards
(tech stack, directory conventions, test/lint commands).

## Development

```bash
npm install
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm test           # vitest
npm run build      # production build
```

## Verifying a deploy

- `GET /` renders the app name and a build identifier (short commit SHA,
  or a build timestamp for non-Vercel builds).
- `GET /api/health` returns `{ status: "ok", buildId: "<same identifier>" }`
  with HTTP 200. The `buildId` in both places always matches — they read
  it from the same function (`lib/build-info.ts`).
