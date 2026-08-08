# @driverse/ui

Shared UI library extracted from the two Driverse frontends
(`spike_Driverse_FE_Autocredit-qa` and `spike_Driverse_FE_Business-dev`). Every extracted file
carries an `@extracted-from` header naming its origin path(s), commit, and merge status.

Program docs (plan, master index, reuse report) live at the repo root in
[`../docs/`](../docs/PLAN.md). Library status: [`docs/STATUS.md`](docs/STATUS.md) (generated).

## Prerequisites

- Node 20+ (repo tested on Node 24)
- pnpm 10 (`corepack enable` or `npm i -g pnpm`)

## Setup

```sh
cd driverse-ui
pnpm install
```

## Storybook — run and view components

```sh
pnpm storybook          # dev server at http://localhost:6006
pnpm build-storybook    # static build in storybook-static/
```

Every component ships a `<name>.stories.tsx` next to its source. The light/dark mode toolbar
(from W2 on) switches the theme contract live.

## Test suites

```sh
pnpm test               # full unit-test run (vitest, jsdom)
pnpm test:watch         # watch mode
pnpm test:coverage      # with v8 coverage report
```

The test matrix per component:

- **Render smoke** — every story renders via `composeStories` without throwing.
- **Variant snapshots** — one DOM snapshot per exported variant (regression tripwire for merges).
- **Interaction** — `@testing-library/user-event` tests for interactive components.
- **Accessibility** — `vitest-axe` assertions on visible components.
- **Hooks** — `renderHook` with fake timers / API mocks.

## Build

```sh
pnpm build              # typecheck + vite lib build → dist/ (ESM, per-module, .d.ts)
pnpm lint               # biome check (tabs, 120 cols, double quotes)
pnpm check              # lint + build + test + storybook build — the full CI gate
```

## Consuming

See [`docs/CONSUMING.md`](docs/CONSUMING.md) — GitHub Packages install, Tailwind preset wiring,
`UIThemeProvider` setup, and the local `pnpm pack`/link workflow.
