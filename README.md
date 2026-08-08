# Driverse Shared UI Library Program

Two Driverse frontends — **Autocredit** (`spike_Driverse_FE_Autocredit-qa`, "QA") and **Business**
(`spike_Driverse_FE_Business-dev`, "BD") — are forks of the same template that drifted apart while
staying massively overlapping. This repo hosts the program that measured that overlap and extracted
it into a shared library: **[`driverse-ui/`](driverse-ui/) → `@driverse/ui`**, with a full unit-test
matrix, Storybook, complete build integration, and an origin header in every extracted file.

> The two source app repos live here only as **read-only reference copies** and are excluded from
> version control (see `.gitignore`).

## Reuse report — headline numbers

| Metric | Value |
|---|---|
| Files under `src/` | QA **710** · BD **937** |
| Byte-identical files (same path, `cmp`-verified) | **255** |
| Code LOC | QA **~55.4k** · BD **~86.1k** |
| Byte-identical code LOC | **~12.2k** across 177 files |
| Hidden overlap from directory renames | **~147 files** invisible to a naive diff |
| Formatting-only "divergence" | ~60 of 125 differing shared files |
| **Planned for extraction** | **83 units · ~29.7k LOC** (19 units reviewed & excluded as app-coupled) |

Share of each layer already byte-identical between the apps (by LOC in QA's tree):

```
Theme system      ██████████████████████████████  98.5%   (726 / 737)
Document inbox    ██████████████████████████████  98.7%   (45Δ lines / 3,535)
Layouts           ███████████████████░░░░░░░░░░░  61.9%   (1,508 / 2,437)
Telemetry         ██████████████████░░░░░░░░░░░░  59.1%   (26 / 44 files)
Components        █████████████████░░░░░░░░░░░░░  55.7%   (3,263 / 5,856)
Hooks             ███████████████░░░░░░░░░░░░░░░  51.5%   (372 / 723)
```

Most "divergence" turned out to be renames, formatting churn, and **brand values** — which are
per-app *by design*: the library ships a brand-token contract and each app injects its own colors
and logos.

## Outcome

**All 83 planned units extracted.** `driverse-ui/` holds 320 source files (~30k LOC) with the
quality gate green end-to-end: biome lint · vite library build with full type declarations ·
**324 tests** (smoke / variant snapshots / interaction / axe / hooks) · Storybook (~90 stories,
including mock data-source adapters for every feature module).

Extracted surface: theme/token contract + `UIThemeProvider` with internalized antd adapter ·
Tailwind preset · self-contained icon system (svgr replaces the sprite plugin; Iconify works
offline) · ~30 components · hooks & utils · heavy optional subpaths (`/charts`, `/data-table`,
`/pdf`, `/editor`) · six shared **feature modules** (document-inbox, telemetry, vehicle-insurance,
vehicle-compliance, multi-tabs, fleet-tracking-map) with injected data-source interfaces so
GraphQL/store coupling stays app-side.

One deliberate partial: ~3.7k LOC of vehicle-compliance create/edit forms carry real behavioral
divergence and remain app-side, itemized with a ready target contract — see
[EXTRACTION-RESULTS.md](docs/EXTRACTION-RESULTS.md).

## Documentation

| Doc | What it is |
|---|---|
| [docs/PLAN.md](docs/PLAN.md) | The approved program plan (phases, architecture decisions, risks) |
| [docs/INDEX.md](docs/INDEX.md) | **Master extraction index** — every unit with origins in both repos, status, tier, decision, target |
| [docs/REUSE-REPORT.md](docs/REUSE-REPORT.md) | Full reuse metrics report |
| [docs/EXTRACTION-RESULTS.md](docs/EXTRACTION-RESULTS.md) | Final results: per-module outcomes, analysis corrections, defects found in the apps |
| [docs/manifest/components.json](docs/manifest/components.json) | Machine-readable manifest (regenerate: `node scripts/gen-inventory.mjs`) |
| [driverse-ui/README.md](driverse-ui/README.md) | Library setup, Storybook, test suites, build |
| [driverse-ui/docs/STATUS.md](driverse-ui/docs/STATUS.md) | Generated extraction status (83/83), origin-header validation |
| [driverse-ui/docs/CONSUMING.md](driverse-ui/docs/CONSUMING.md) | How the apps adopt the package (npm, Tailwind preset, ThemeProvider, brand injection) |

## Quick start

```sh
cd driverse-ui
pnpm install
pnpm storybook     # browse every component at http://localhost:6006
pnpm test          # 324 tests
pnpm check         # full gate: lint + build + tests + storybook build
```
