# telemetry

Extracted from:

- **A** — `Driverse_FE_Autocredit-qa` @ `b96eda3`, `src/features/vehicle-park/vehicles/details/telemetry`
- **B** — `Driverse_FE_Business-dev` @ `b96eda3`, `src/features/vehicle-parks/vehicles/details/telemetry`

37 files, ~3.3k LOC. Every one of the 11 files that actually differ between A and B differs only by import
ordering, prettier line-wrapping, commented-out lines, and the `vehicle.subcription` /
`vehicle.subscription` graphql-path typo — except three real one-line additions, and B is the more complete
side every time. B is adopted throughout (`@status adopted-B`, or `identical` where files are byte-equal).
Every ported file's header names both origin paths and its `@status`.

## The dedup: `gps/` and `tracking-gps/` are two views, not duplicates

`gps` is the live/today view; `tracking-gps` is the historical playback view with a date range. They are
not the same component copy-pasted — `index.tsx`, `live-map/index.tsx`, `side-panel/index.tsx` and
`side-panel/metric-card.tsx` are genuinely different between the two (tracking-gps adds the date-range
filter, the trail polyline, the tabbed Overview/Driver-Behavior side panel and `track-date-filter.tsx`,
which has no gps equivalent).

But **12 of their 17 files are effectively identical** — byte-identical, or differing only in commented-out
lines — because both views render the same map chrome and the same side-panel cards around their different
cores:

| shared file | was |
|---|---|
| `shared/date-filter-bar.tsx` | `gps\|tracking-gps/date-picker/index.tsx` |
| `shared/map-status-bar.tsx` | `gps\|tracking-gps/live-map/MapStatusBar.tsx` |
| `shared/car-icon.tsx` | `gps\|tracking-gps/live-map/car-icon.tsx` |
| `shared/playback-controls.tsx` | `gps\|tracking-gps/live-map/PlaybackControls.tsx` (merged — see below) |
| `shared/device-card.tsx`, `device-row.tsx`, `location-card.tsx`, `metric-item.tsx`, `today-card.tsx` | `gps\|tracking-gps/side-panel/*.tsx` |
| `shared/cellular-signal.tsx`, `gps-status-card.tsx`, `trip-summary-card.tsx` | `gps\|tracking-gps/status/*.tsx` |

Those 12 files now live once, in `shared/`, and both `gps/` and `tracking-gps/` import them. `gps/` and
`tracking-gps/` keep exactly the files that actually differ: `index.tsx`, `live-map/index.tsx`,
`side-panel/index.tsx`, `side-panel/metric-card.tsx` in both, plus tracking-gps-only
`side-panel/track-date-filter.tsx`.

**LOC**: those 12 files are **868 lines** in `shared/`. Left un-deduped (one copy under `gps/`, a second
under `tracking-gps/`, as the source apps have it), the same content is **1,699 lines** in B alone — a
**831-line / 49% reduction**, before counting that A carries its own second full set of the same 1,699
lines on top of that.

One file in that shared list, `status/index.tsx` (the `Status` component wrapping `TripSummaryCard` +
`GpsStatusCard`), is **not** in `shared/` — it is dead code in both apps (nothing imports it from either
`gps/index.tsx` or `tracking-gps/index.tsx`; only `ViewMode` and the three presentational pieces it would
have wired together are actually used, indirectly, by other files). It was dropped rather than ported.
`shared/date-filter-bar.tsx`'s `DateFilterBar` is dead in the same sense (never imported by either view's
`index.tsx`) but *is* ported, since a consumer wiring a header date control has the original component
available — see its header for the full reasoning.

## Finding: `PlaybackControls` does NOT diverge between QA and BD

The plan's open question was whether QA and BD wrote `tracking-gps/live-map/PlaybackControls.tsx`
differently. They didn't — the 93-vs-174 line gap between them is entirely prettier formatting plus one
commented-out block BD left in. Same for `gps/live-map/PlaybackControls.tsx`.

The real divergence is **within each app**, between the gps and tracking-gps copies:

- `gps/live-map/PlaybackControls.tsx` — `onExit` prop with an Exit button, skip-to-start / skip-to-end
  buttons, a live "current time / total time" readout in the header, a plain black slider.
- `tracking-gps/live-map/PlaybackControls.tsx` — a Minimize button instead of Exit, "Start time" / "End
  time" labels under the slider instead of a header readout, a branded `#5F8BFA` slider with a styled
  handle.

Neither ever imports the other, and **`gps/live-map/PlaybackControls.tsx` is dead code in both apps** —
nothing under `gps/` imports it; only `tracking-gps/live-map/index.tsx` renders one.

This module ships **one** `shared/playback-controls.tsx`. The tracking-gps variant is the base (it's the
one actually wired up); the gps variant's extras — `onExit`, `onSkipToStart`, `onSkipToEnd`, and the header
current/total timestamp readout — are restored as **optional** props, rendered only when supplied. With
none of them passed, rendering is byte-equivalent to the tracking-gps original — see
`telemetry.stories.tsx`'s `PlaybackControlsDefault` vs `PlaybackControlsExtended` stories for both.

## The `TelemetryDataSource` seam

The apps built request URLs from `import.meta.env.VITE_TELEMATICS_API` and called `useApiResource()` for
REST, and used `@apollo/client`'s `useSubscription` against
`@/graphql/subscription/vehicle.subcription`'s `VEHICLE_TRACKING_SUBSCRIPTION` /
`VEHICLE_TRACKING_HISTORY_SUBSCRIPTION` for the live feeds. None of that is a library dependency, so it's
all now one injected object, threaded through a module-internal context (`TelemetryProvider` +
`useTelemetryDataSource()`, mirroring how `multi-tabs` threads its navigation):

```ts
type TelemetryDataSource = {
	fetchMileageReport: (imei: string) => Promise<MileageReportResponse>;
	fetchTrackHistoryMetrics: (vehicleId: string, startISO: string, endISO: string) => Promise<TrackHistoryMetrics>;
	subscribeVehicleTracking: (vehicleId: string, cb: (data: VehicleTrackingData) => void) => () => void;
	subscribeTrackHistory: (
		vehicleId: string,
		startISO: string,
		endISO: string,
		cb: (data: TrailHistoryPoint[]) => void,
	) => () => void;
	/** Optional — defaults to the library's `useLocationName` when omitted. */
	resolveLocationName?: (lat: number, lng: number) => Promise<string>;
};
```

BD's `useTrackHistoryMetrics` also sent a hard-coded `authHeader: { "X-Environment": "qa" }`. That's
dropped — a hard-coded deployment environment does not belong in a shared library. An app that needs it
sets the header inside its own `fetchTrackHistoryMetrics` implementation.

`react-router`'s `useParams()` (read in the top `index.tsx` and in `tracking-gps/side-panel/index.tsx`) is
gone too: the module root (`telemetry.tsx`) takes an explicit `vehicleId` prop and threads it down to
`TrackingGps` → its `SidePanel`.

`TelemetryProvider` also carries its own lazily-constructed `@tanstack/react-query` `QueryClient` (same
pattern as `document-inbox`'s provider) — `useMileageReport`/`useTrackHistoryMetrics` need one in context,
and requiring every consumer to know that would leak an implementation detail. Nesting under an app's own
`QueryClientProvider` is harmless; the inner one just shadows it for this subtree.

## `TelemetrySidePanel` ↔ `fleet-tracking-map`

`gps/side-panel/index.tsx`'s `SidePanel` (`{ data, address, viewMode, link }`) is exactly the shape
`@/features/fleet-tracking-map`'s `FleetTrackingMap` expects an app to pass to its `renderSidePanel`
render prop. It's exported from this module's `index.ts` as `TelemetrySidePanel` so wiring the two together
is a one-liner:

```tsx
<FleetTrackingMap
	// ...
	renderSidePanel={({ vehicle, address }) => <TelemetrySidePanel data={vehicle} address={address} viewMode="today" />}
/>
```

`telemetry-page.tsx`'s `TelemetryPage` (ported from `vehicle-park(s)/telemetry/index.tsx`, the raw-vehicle
→ `TrackingRecord[]` mapping and selection state) takes `renderSidePanel` itself and forwards it straight
through to `FleetTrackingMap` for exactly this purpose.

## Vendored hooks (lived outside the telemetry dir)

Three app hooks live in `vehicle-park(s)/vehicles/hooks/`, not under `telemetry/`, and are vendored in here
with `@extracted-from` headers naming their real origin:

- `shared/use-playback.ts` — was `usePlayback.ts`, **byte-identical in both apps** (`@status identical`).
  Pure state machine, no app deps.
- `shared/use-leaflet-map.ts` — was `useLeafletMap.ts`. QA reads zoom off a zustand `@/store/mapStore` and
  imports `MAP_STYLES` from a relative `../data`; BD holds zoom in local `useState` (`DEFAULT_ZOOM = 15`)
  with no store. BD adopted — already store-free. `MAP_STYLES` is not re-vendored; it already exists at
  `@/features/fleet-tracking-map/map-styles` (lifted there in an earlier wave).
- `hooks/use-gps-date-filter.ts` — was `useGpsDateFilter.ts`. The dayjs label logic is verbatim; the
  `console.log({dateStart, dateEnd})` both apps left in, and the never-actually-used `dateStart`/`dateEnd`
  computation feeding it, are dropped; the apollo subscription is now `subscribeVehicleTracking`; the
  `@/store/vehicleDetailsStore` fallback + `useParams()` are now the injected `vehicleId`.

`useLocationName` was **not** vendored — the library already has it at `src/hooks/use-location-name.ts`
(lifted in an earlier wave for `fleet-tracking-map`), byte-identical to the apps' copy. This module wraps
it in `shared/use-telemetry-location-name.ts`, which additionally honours
`TelemetryDataSource.resolveLocationName` when a consumer supplies one.

## Other decouplings

- `@/theme/colors`'s `colors.driverse_primary` (`#5F8BFA`) → `var(--brand-primary)`, the same substitution
  `fleet-tracking-map`'s `STATUS_COLOR` made for the identical hex (`date-filter-bar.tsx`).
- `#/entity`'s `MovementStatus` → the library's `@/utils` export (BD had already made this exact switch in
  most files; the one holdout, `trip-summary-card.tsx`, is adopted-B for the same reason).
- `react-router`'s `<Link to>` (both metric-card variants) → a plain `<a href>`, matching the
  `payment-options.tsx` precedent elsewhere in the library.
- `@iconify/react`'s `Icon` → the library's `<Iconify>` (`@/icons/iconify-icon`) throughout, matching
  `fleet-tracking-map`'s `vehicle-list/index.tsx`.
- `@/hooks/web/use-resource`'s `useApiResource` → not used; the transport is injected (`TelemetryDataSource`)
  instead, per the module's whole reason for existing.
- `@/components/{fallback,pill-tabs,loading}`, `@/components/page-header/header` → the library's.

## Deliverables

```
shared/            12 deduped files + use-playback.ts, use-leaflet-map.ts, use-telemetry-location-name.ts
gps/                index.tsx, live-map/index.tsx, side-panel/{index,metric-card}.tsx
tracking-gps/       index.tsx, live-map/index.tsx, side-panel/{index,metric-card,track-date-filter}.tsx
hooks/              use-mileage-report.ts, use-gps-date-filter.ts
providers/          telemetry-provider.tsx
types.ts            TelemetryDataSource, ViewMode, TrailPoint, TrailHistoryPoint, VehicleTrackingData, ...
telemetry.tsx        the tabbed root (`Telemetry`)
telemetry-page.tsx   the page wrapper (`TelemetryPage`)
index.ts             public barrel
```

Not ported: `status/index.tsx` (dead in both apps — see above).

## Verification

```
pnpm exec tsc --noEmit          # clean for this module (project-wide errors are pre-existing, in other src/features/* dirs)
pnpm exec vitest run src/features/telemetry   # 14/14 passing
pnpm exec biome check src/features/telemetry  # clean
```
