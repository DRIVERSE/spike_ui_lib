# Driverse Shared UI Library — Extraction Report & Plan

> Living program document. Companion docs: [INDEX.md](INDEX.md) (master component index),
> [REUSE-REPORT.md](REUSE-REPORT.md) (reuse metrics), [manifest/components.json](manifest/components.json)
> (machine-readable source of truth). Regenerate the generated docs with `node scripts/gen-inventory.mjs`.

## Context

Two frontend apps — `spike_Driverse_FE_Autocredit-qa` (**QA**) and `spike_Driverse_FE_Business-dev`
(**BD**) — are both forks of the same template (`d3george/slash-admin`: Vite 5, React 19, antd 5,
Tailwind 3, vanilla-extract, biome). They drifted apart but remain massively overlapping. Goal:
extract the common UI into a new library repo (**`driverse-ui/` as a subdir of this repo**, split
out later) with a full unit-test matrix, Storybook, and complete build integration — with every
extracted file carrying an origin comment block, and a beautifully formatted report quantifying reuse.

**User decisions (confirmed):** lib lives at `spike_ui_lib/driverse-ui/`; consumption = private npm
package on GitHub Packages (tag-triggered CI publish; local dev via pnpm pack/link); testing = full
matrix (smoke + variant snapshots + interaction + axe + hook tests, 80–90% coverage gates);
**brand colors (e.g. `driverse_primary_light` #E1E9F5 vs #f0f7ff) are explicitly NOT common** —
the lib ships a brand-token *contract* (CSS vars + ThemeProvider props) and each app injects its
own values. Divergent brand values are a feature, not a conflict.
**User directive:** shared *feature modules* (telemetry etc.) are in scope for extraction, not just
leaf components.

## Measured reuse (verified with diff/cmp — headline numbers for the report)

- Files: QA src = 710, BD src = 937; **255 byte-identical** at the same path (cmp-verified).
- Code LOC: QA ~55.4k / BD ~86.1k; ~12.2k LOC byte-identical (177 code files) — and this *understates*
  reuse: dir renames (`vehicle-park`→`vehicle-parks`, `insight/components/charts`→`insight/charts`)
  hide 147 more shared files (46 byte-identical), and ~60 of the 125 "differing" files differ only
  by formatting (tabs/quotes/commented console.logs).
- Per layer (identical files / total in QA): components 53/81 (3,263/5,856 LOC), theme 12/13
  (726/737 LOC), layouts 13/24, hooks 6/13, utils 3/10.
- 27 shared component dirs; **20 byte-identical**. Telemetry feature: 26/44 files identical, most
  others ≤7 diff lines.
- Zero tests, zero Storybook, zero CI checks exist in either app — the lib is greenfield on quality
  infra.

## Architecture decisions (one recommendation each — full rationale goes in docs/decisions/ ADRs)

1. **Single package `@driverse/ui`** with subpath exports (`.`, `/tokens`, `/tailwind-preset`,
   `/charts`, `/data-table`, `/pdf`, `/editor`, `/icons/offline`, `/styles.css`, `/features/*`).
   Not a monorepo — two consumers, one CI, one always-green build; heavy deps isolated per subpath
   with `peerDependenciesMeta.optional`.
2. **Vite 5 lib mode**, ESM-only, `preserveModules: true`, `vite-plugin-dts`; vanilla-extract via
   its first-class vite plugin, aggregated `dist/styles.css`. Not tsup (no vanilla-extract story).
3. **Tailwind preset, not prebuilt CSS**: extract the CSS-var-driven palette into
   `src/tailwind/preset.ts`; consumers add preset + `content: ["./node_modules/@driverse/ui/dist/**/*.js"]`.
4. **SVG sprite → svgr**: union of both apps' `src/assets/icons` compiled to React components at lib
   build; `SvgIcon` reimplemented with same props over a generated name→component map (kills the
   `vite-plugin-svg-icons` host-plugin requirement — the single biggest extraction risk). Iconify
   goes offline via `@iconify/json` generated bundle loaded in Storybook/tests, exported for apps.
5. **Theme**: lib-owned `UIThemeProvider` (controlled `mode`/`onModeChange`, `brand` token object,
   `adapters={[AntdAdapter]}`) + `useTheme()`. `toast` and `useChart` switch from
   `@/store/settingStore` to `useTheme()` — that's the entire decoupling. Lib defines its own
   `ThemeMode` enums (breaks the `#/enum` dependency). antd adapter moves INTO the lib. Apps keep
   zustand and feed values at the root. Brand colors are provider-injected per app (user decision).
6. **Test stack**: Vitest 3 + jsdom + Testing Library; Storybook 8 `@storybook/react-vite`; stories
   are the fixture source, assertions in `*.test.tsx` via `composeStories`; `vitest-axe` for a11y;
   `renderHook` + fake timers/mocks for hooks; theme contract tests (root class toggling, antd token
   mapping).
7. **Origin tracking**: every extracted file gets a header block; `docs/manifest/components.json`
   is the source of truth; `scripts/gen-status.ts` renders `docs/STATUS.md` (the visible report) and
   validates headers in CI.

   ```ts
   /**
    * @extracted-from
    *   A: Driverse_FE_Autocredit @ <shortsha> src/components/chip/index.tsx
    *   B: Driverse_FE_Business   @ <shortsha> src/components/chip/index.tsx
    * @status merged   // identical | adopted-A | adopted-B | merged | decoupled | rewritten
    * @notes B's exported VARIANT_STYLES kept; A's 3 telematics keys added; i18n key stripped
    */
   ```

## Repo structure (new: `spike_ui_lib/driverse-ui/`)

```
driverse-ui/
├── package.json                # @driverse/ui, exports map, peers (react ^19, antd ^5.9.3, …)
├── vite.config.ts              # lib mode, preserveModules, vanilla-extract, svgr, dts
├── vitest.config.ts            # jsdom, setup (jest-dom, matchMedia/ResizeObserver/clipboard mocks, axe)
├── tsconfig.json               # strict (copied conventions), @/* → src/*
├── biome.json                  # copied verbatim (tabs, 120 cols, double quotes)
├── lefthook.yml                # ACTIVE (apps' version is 100% commented out): biome + vitest related
├── .storybook/{main.ts,preview.tsx}  # react-vite; mode toolbar → UIThemeProvider decorator;
│                                     # iconify offline bundle; tailwind.css
├── src/
│   ├── tokens/                 # theme contract: tokens/*, type.ts, theme.css.ts, layout.css.ts, enum.ts
│   │                           # + brand.ts (brand-token CONTRACT with neutral defaults; apps inject values)
│   ├── theme/                  # UIThemeProvider, use-theme, antd-adapter (internalized)
│   ├── tailwind/preset.ts
│   ├── icons/                  # svg/ union sources, generated map, SvgIcon shim, Iconify, offline bundle
│   ├── components/<name>/      # index.tsx + <name>.stories.tsx + <name>.test.tsx per component
│   ├── charts/ data-table/ pdf/ editor/    # heavy optional subpath entries
│   ├── features/               # shared feature modules (telemetry, fleet-tracking-map, insight charts)
│   ├── hooks/  utils/
│   └── i18n/                   # 541-key shared base bundle (en_US, es_ES) + merge helper
├── scripts/{gen-status.ts, gen-iconify-bundle.ts}
├── docs/  → see docs plan below (lib-internal docs; top-level docs/ holds the program-level report)
└── .github/workflows/{ci.yml, release.yml}   # ci: lint+build+test+storybook; release: tag → GitHub Packages
```

Key deps: react/react-dom `^19` peers (`@types/react` **^19**, fixing the apps' ^18 drift),
antd `^5.9.3` + `@ant-design/v5-patch-for-react-19`, storybook `^8.6`, vitest `^3`, jsdom,
@testing-library/react `^16` + user-event + jest-dom, vitest-axe, tailwindcss `^3.4`,
@vanilla-extract/{css,vite-plugin}, vite-plugin-svgr, vite-plugin-dts, @iconify/json, biome 1.9.4,
lefthook. Package manager: **pnpm@9, single lockfile** (apps currently have stale conflicting locks).

## Docs deliverables (highly visible, ongoing — top level `spike_ui_lib/docs/`)

- `docs/PLAN.md` — this plan, kept current.
- `docs/REUSE-REPORT.md` — the nicely formatted headline report: reuse percentages, LOC saved,
  per-layer tables, charts of identical/merged/app-only splits, before/after duplication metrics.
- `docs/INDEX.md` — the Phase-1 master index: every component/hook/util/feature-module with name,
  origin path(s) in both repos, identical/diverged/unique status, diff size, tier, coupling,
  target path in `driverse-ui`, and planned test coverage. (Generated from the manifest.)
- `docs/manifest/components.json` — machine-readable source of truth driving INDEX/STATUS/report.
- `driverse-ui/docs/STATUS.md` — generated live extraction status table (CI-validated).
- `driverse-ui/README.md` — **(user requirement)** front-door doc written at W0 and kept current:
  prerequisites (node 20, pnpm 9), setup (`pnpm install`), run/view Storybook (`pnpm storybook` →
  localhost:6006, `pnpm build-storybook` for static), run the test suites (`pnpm test`,
  `pnpm test:watch`, coverage, a11y/interaction/snapshot breakdown), build (`pnpm build`),
  full gate (`pnpm check`), plus links into docs/ (PLAN, STATUS, REUSE-REPORT, CONSUMING).
- `driverse-ui/docs/CONSUMING.md` — install, .npmrc, tailwind preset, provider wiring, pack/link loop.
- `driverse-ui/docs/decisions/ADR-0001..0007.md` — layout, build, consumption, tests, theme,
  icons, brand-token contract.
- `driverse-ui/docs/components/<name>.md` — merge notes only where nontrivial (chip, toast,
  data-table, query-params, brand tokens, telemetry).

## Phase 1 — Report + Index (most important; docs only)

1. Create top-level `docs/`; write PLAN.md (this file), ADR stubs.
2. Build `manifest/components.json` from the verified inventory below (every unit `status: "planned"`,
   with source paths + short SHAs of both app trees).
3. Generate `INDEX.md` + `REUSE-REPORT.md` (script-generated tables; include the headline numbers
   above and per-tier LOC totals; render as a polished artifact page as well).
4. Log open decisions: canonical Chip API; PlaybackControls reconciliation; brand-token contract keys.
   *(Resolved in W8. PlaybackControls needed no cross-repo reconciliation at all — QA's 93 lines and BD's
   174 are the same component under different prettier settings. The genuine fork was inside each app,
   between the `gps` and `tracking-gps` copies, and the richer `gps` copy is dead code in both; the library
   ships one component with that copy's extras as optional props. See `driverse-ui/docs/W8-REMAINING.md`.)*

**Gate:** report reviewed; index names every file in both repos' components/theme/layouts/hooks/utils
plus the shared feature modules (telemetry's 44 files, vehicle-park(s)' 141 same-named files each
classified).

## Phase 2 — Build the library (dependency-ordered waves; each PR = code + origin header + manifest
entry + story + tests; CI green every merge)

- **W0 skeleton (single commit):** full scaffold (build, Storybook, Vitest, CI, lefthook) with one
  token export, one story, one test → Phase-3 requirement "build/storybook/tests exist immediately"
  is satisfied before any real extraction.
- **W1 tokens:** theme contract (`theme/tokens/*`, `type.ts`, `theme.css.ts`, `layout.css.ts` —
  byte-identical in apps, zero app imports), brand contract `brand.ts` (neutral defaults; QA/BD
  values documented as app-side injections), tailwind preset. Story: token gallery.
- **W2 theme runtime:** UIThemeProvider + useTheme + antd adapter (decoupled from settingStore/#/enum).
  Storybook mode toolbar lands here.
- **W3 icons:** svgr pipeline over the union icon set (resolve `ic-`/`ic_` naming drift;
  `ic_logo_nav.svg` content differs per brand → brand-injected), SvgIcon shim, Iconify + offline bundle.
- **W4 pure leaves (Tier 0/1):** animate/* (1,193 LOC), card, chip (merged: BD's exported
  VARIANT_STYLES + QA's 3 telematics keys), pill, info-field, placeholder-card, progress-bar,
  scroll-progress, scrollbar, proTag, total-card, coming-soon, column-details-layout; hooks
  (use-media-query, use-copy-to-clipboard, use-debounce, use-export, use-delete-file,
  use-get-fileurl, use-clientId); utils (highlight, storage, tree, theme, docs-download,
  capitalize→BD, time union, format-number union).
- **W5 interactive (Tier 1/2):** number-input, searchable-select, pill-tabs (QA — keeps disabled),
  table-tab (BD), page-header (BD props, QA cleanliness), icon-button (BD), export-button (i18n key
  stripped), action-modal, confirm-modal, upload/* (BD utils), markdown, editor, drag-drop-inbox,
  tab/StyledTabs.
- **W6 decoupled (Tier 3):** toast + chart/useChart via useTheme; 7 BD maintenance chart wrappers →
  `/charts`; canonical Chip consolidation (Chip/Pill/StatusChip → one API + variant snapshots);
  DataTable (QA's ag-grid wrapper made query-agnostic) → `/data-table`; useQueryParams API union;
  permission primitives (QA's use-permission.ts + BD's permission-tree.ts; BD's broken
  use-user-permissions.ts excluded).
- **W7 heavy/optional (Tier 4):** pdf-renderer (774 LOC, BD) → `/pdf`; XlsxViewer; dynamic-form +
  use-dynamic-form-schema; i18n base bundle + merge helper.
- **W8 shared feature modules (user directive):** telemetry (reconcile PlaybackControls + index;
  rest lifts nearly as-is), **document-inbox** (3,535 LOC, only ~45 diff lines — biggest single win),
  **vehicle insurance** (~1,670 LOC near-identical), **vehicle compliance** (~5,000 LOC, ~22% diff;
  consolidate the structurally-identical Circulation/OwnershipFee/PollutionTest sub-tables into one
  parameterized table), fleet-tracking-map (its blockers — telemetry side-panel, useLocationName —
  ship in the same wave, dissolving the coupling; GraphQL/data/store imports become injected
  props/hook interfaces), insight charts, error pages (W5). Multi-tabs dnd-kit suite + pure layout
  pieces (header-simple, dashboard config constants) as a small shell tier. Near-identical app
  *pages* (calendar/kanban 10Δ/1,771 LOC, management/user 30Δ/1,093) tracked in INDEX as deferred —
  they converge naturally once the library lands. QA's deprecated-tel (1,265 LOC dead code) flagged
  for deletion.
- **Never extract:** assignment-card (GraphQL-forked), dashboard/index.tsx (two auth models),
  document-queue-item, novu widget wiring, use-lilly.ts, nav-logo tenant branches (replaced by brand
  config), status-chip (redundant), BD's duplicate file hooks.

## Phase 3 — Verification & hardening (starts at W0, bar-raising at the end)

- Continuous (every PR from W0 on): `pnpm check` = biome + tsc + vite build + vitest run +
  storybook build. Lefthook pre-commit actually enabled.
- Immediate smoke ritual per wave: `pnpm build` artifacts inspected, `pnpm storybook` visually
  checked (both theme modes), `pnpm test` green — per the user's "immediately have the build, see
  the storybook and the tests" requirement.
- End-of-phase hardening: coverage thresholds (80% components, 90% hooks/utils), axe on all visible
  components, snapshot review of full variant matrices, `publint` + `arethetypeswrong`, i18n key
  parity test, `pnpm pack` + install into a scratch vite app as a consumer integration test.
- Final report regeneration: REUSE-REPORT.md updated with achieved numbers (LOC extracted, files
  deduplicated, per-app deletion potential).

## Risks (tracked in docs/)

1. react-quill 2 uses `findDOMNode` (removed in React 19) — editor may be broken in both apps
   already; verify in W5, likely swap to `react-quill-new`.
2. antd v5 + React 19 needs `@ant-design/v5-patch-for-react-19` in lib tests/storybook.
3. Chip consolidation changes rendered DOM — variant snapshots + visual spot-check gate.
4. Consumers forgetting the tailwind content glob → silently unstyled; loud CONSUMING.md warning +
   dev-mode style probe in ThemeProvider.
5. SvgIcon name drift sprite↔svgr map — CI check for unresolved icon names.
6. `@types/react` 18/19 mismatch at adoption; stale app lockfiles + `npm ci --force` mask peer
   conflicts — flagged as Phase-4 prerequisites.
7. QA app bug found during analysis (worth reporting upstream): imports `leaflet` without declaring
   it; also faker used in production notice.tsx.

## Verification summary

- W0 gate: `pnpm check` green in CI on the skeleton; Storybook builds and serves.
- Every wave: build + storybook + full test matrix green; STATUS.md regenerated; origin headers
  validated against manifest by `gen-status.ts`.
- Final: coverage gates met; scratch-app consumer install works; REUSE-REPORT.md shows final
  extracted-LOC totals vs the ~18k extractable-LOC baseline measured in the manifest.
