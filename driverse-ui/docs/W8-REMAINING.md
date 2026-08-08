# W8 — the six feature modules, closed out

This file used to record why the last six W8 modules had stopped. They have all landed. What follows is
what shipped, what deliberately did not, and the two findings that changed the plan's own record.

Each module keeps its detailed merge log in its own directory: `src/features/<name>/README.md`. Multi-tabs
also has a call-site guide at [components/multi-tabs.md](components/multi-tabs.md).

| Module | Target | Outcome | Src files / LOC | Stories | Tests |
|---|---|---|---|---|---|
| document-inbox | `src/features/document-inbox` | full (QA-only select-client tab intentionally skipped) | 33 / 4,109 | 3 | 7 |
| telemetry (+ page) | `src/features/telemetry` | full | 31 / 2,848 | 5 | 14 |
| vehicle-insurance | `src/features/vehicle-insurance` | full | 26 / 2,799 | 5 | 9 |
| vehicle-compliance | `src/features/vehicle-compliance` | **partial by design** — see below | 18 / 1,939 | 5 | 10 |
| multi-tabs | `src/features/multi-tabs` | full | 11 / 913 | 4 | 14 |
| fleet-tracking-map | `src/features/fleet-tracking-map` | already landed; its telemetry seam is now closed | 6 / 518 | 4 | 12 |

Every file carries an `@extracted-from` header; `node scripts/gen-status.mjs` reports **83/83 units, 0
files missing headers**, and `pnpm check` (lint + build + 324 tests + Storybook build) is green.

## The pattern held

`fleet-tracking-map` predicted it and all five confirmed it: **GraphQL, store, router and env imports
become an injected interface; the visual code lifts verbatim.** Each module exposes one
`<Module>DataSource` of plain async functions plus a module-internal provider carrying it alongside the
state its app previously kept in zustand — the deep component trees keep reading from a context, so call
sites port over almost unchanged.

## Two findings that corrected the plan

**PlaybackControls was never the reconciliation the plan expected.** The plan's open decision #4 assumed
QA and BD had rewritten `tracking-gps/live-map/PlaybackControls.tsx` differently. They had not: QA's 93
lines and BD's 174 are the same component under different prettier settings, plus one commented-out block.
The genuine fork is *within* each app, between the `gps` and `tracking-gps` copies — and the richer `gps`
copy is dead code in both apps, imported by nothing. One `shared/playback-controls.tsx` ships the
tracking-gps variant with the gps variant's extras (`onExit`, skip-to-start/end, the current/total
timestamp readout) restored as optional props.

**`gps/` and `tracking-gps/` are two views, not a copy-paste fork.** They render the live/today view and
the historical playback view. But 12 of their 17 files were effectively identical, and those now live once
in `shared/` — 868 lines instead of 1,699 duplicated in Business alone, before counting Autocredit's own
second copy.

## vehicle-compliance is partial, deliberately

The consolidation the plan asked for landed: the three structurally-identical sub-trees (circulation,
tenure, verification) collapsed into one parameterized `compliance-table/` — `ComplianceStatusCard`,
`ComplianceDocumentCard`, `ComplianceHistoryTable`, `ComplianceAdditionalInfo` and the composing
`ComplianceDocumentSection` — driven by per-kind config hooks. About 2,279 LOC of status/current/history/
data became 1,939 LOC across 15 files.

**34 files / 3,712 LOC are not ported**: the create/edit forms and their Business-only mutation hooks.
Each carries its own zod schema, its own mutation, and a file-upload state machine bound to four different
app stores; one group also reaches into `employee-benefits`. That is real behavioural divergence, and
forcing it into the same generality budget risked shipping forms that look unified while silently dropping
per-kind validation. The itemized list is in
[`src/features/vehicle-compliance/README.md`](../src/features/vehicle-compliance/README.md).
`VehicleComplianceDataSource` already declares the contract those forms need, and the ported configs leave
render-prop holes (`onEditCurrentCard`, `onEditLatest`, `onEditHistoryRow`), so a follow-up pass has a
stable target rather than inventing one per form. `reminders.tsx` in all three kinds is unported for a
second reason: it is commented out in every `<kind>/index.tsx` upstream.

## The fleet-tracking-map ↔ telemetry seam is closed

Before extraction, `fleet-tracking-map` imported telemetry's `SidePanel` through a five-level relative
path — the single import that made the map un-extractable on its own. The two are now independent modules
that compose through `renderSidePanel`, which the `WithTelemetrySidePanel` story and its test exercise:

```tsx
<TelemetryProvider dataSource={dataSource}>
	<FleetTrackingMap
		…
		renderSidePanel={({ vehicle, address }) => (
			<TelemetrySidePanel data={vehicle} address={address} viewMode="today" />
		)}
	/>
</TelemetryProvider>
```

## Still deferred

`insight`'s non-chart pieces (`quick-actions`, `tasks`) remain Business-only and out of scope; they were
never part of these six. Near-identical app *pages* (calendar/kanban, management/user) stay tracked in
INDEX as deferred — they converge naturally now that the library has landed.
