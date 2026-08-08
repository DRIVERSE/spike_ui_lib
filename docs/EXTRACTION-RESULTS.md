# Extraction Results — @driverse/ui

> Final results of the extraction program (2026-08-07/08). Companion docs: [PLAN.md](PLAN.md) ·
> [INDEX.md](INDEX.md) · [REUSE-REPORT.md](REUSE-REPORT.md) · live status:
> [`driverse-ui/docs/STATUS.md`](../driverse-ui/docs/STATUS.md).

## Outcome

**All 83 planned units extracted** (STATUS: 83/83, zero files missing origin headers).

| Metric | Value |
|---|---|
| Library source | 320 ts/tsx files · **30,332 LOC** |
| Quality gate | `pnpm check` green: biome (335 files) + tsc/vite build (+ full `.d.ts` emission) + **324 tests / 24 files** + Storybook build |
| Stories | 18 story files, ~90 stories, incl. per-module mock data-source adapters |
| Subpath exports | `.` `/tokens` `/tailwind-preset` `/charts` `/data-table` `/pdf` `/editor` `/icons/offline` `/styles.css` `/features/{document-inbox,telemetry,vehicle-insurance,vehicle-compliance,multi-tabs,fleet-tracking-map}` |
| Origin decisions | 39 decoupled · 35 identical · 22 adopted-A/B · 19 merged (W8 alone; every file carries `@extracted-from`) |

## Feature modules (W8)

| Module | Result | Files / LOC | Stories | Tests |
|---|---|---|---|---|
| document-inbox | full (QA-only select-client stays app-side) | 33 / 4,109 | 3 | 7 |
| telemetry (+page) | full | 31 / 2,848 | 5 | 14 |
| vehicle-insurance | full | 26 / 2,799 | 5 | 9 |
| vehicle-compliance | **partial by design** — see below | 18 / 1,939 | 5 | 10 |
| multi-tabs | full (fixes a listener leak both apps had) | 11 / 913 | 4 | 14 |
| fleet-tracking-map | full; telemetry side-panel seam closed | 6 / 518 | 5 | 14 |

**vehicle-compliance remainder:** 34 files / 3,712 LOC of create/edit forms + BD-only mutation hooks
were deliberately not ported — each carries a distinct zod schema, mutation, and app-store-bound
upload state machine (one group reaches into employee-benefits); forcing unification risked silently
dropping per-kind validation. The consolidation goal *was* achieved: the three structurally-identical
sub-trees collapsed into one parameterized `ComplianceDocumentSection`. The injected
`VehicleComplianceDataSource` already declares the contract the remaining forms need; they are
itemized file-by-file in `driverse-ui/src/features/vehicle-compliance/README.md`.

## Discoveries made during extraction (analysis corrections)

- **PlaybackControls was a false fork**: QA vs BD differ only by formatting. The real duplication was
  *inside* each app (gps vs tracking-gps views) — now one shared component with the richer variant's
  extras as optional props; 12 shared files replace ~1,700 duplicated LOC per app.
- **react-i18next had leaked into 17 extracted files** — replaced with a lib-native
  `TranslateProvider`/`useTranslate` (app `t` → bundled en_US copy → key), so the lib ships no
  i18next runtime.
- **vite-plugin-dts was silently dropping declarations** for `use-leaflet-map` (TS2742 via leaflet
  generics), breaking the telemetry type surface — fixed with explicit return types; every emitted
  `.js` now has a matching `.d.ts`.

## Defects found in the apps (for the app teams)

1. QA imports `leaflet` without declaring it (resolves only transitively). BD declares it.
2. BD's `use-user-permissions.ts` returns `undefined` (bodies commented out) — QA's
   `use-permission.ts` is the working primitive and is what the lib ships.
3. `@faker-js/faker` ships in production (`layouts/components/notice.tsx`).
4. BD's insight table maps `title: "Status"` to `dataIndex: "email"`.
5. multi-tabs registered mouseenter/mouseleave listeners without cleanup (leak; fixed in the lib).
6. QA carries 1,265 LOC of dead telemetry code (`deprecated-tel/`) — recommend deletion.
7. Both apps: stale conflicting lockfiles; `@types/react@^18` under a React 19 runtime.

## What's next (Phase 4 — adoption, out of scope here)

Tag `v0.1.0` → GitHub Packages via the release workflow; per app: `.npmrc`, tailwind preset +
content glob, `UIThemeProvider` with the app's brand tokens (see
`driverse-ui/docs/CONSUMING.md`), then replace `src/components/<x>` with re-export shims and delete
as features are touched. Port the 34 remaining compliance forms against the declared data-source
contract.
