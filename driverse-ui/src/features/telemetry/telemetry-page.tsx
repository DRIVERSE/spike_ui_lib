/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/telemetry/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/telemetry/index.tsx
 * @status decoupled
 * @notes Byte-identical in both apps apart from a trailing newline. The reusable part is the raw→
 *        `TrackingRecord[]` mapping and the selection/panel-open state; the apps' own `useTrackVehicles`
 *        data hook is not part of this module, so `TelemetryPage` takes `vehicles`/`loading` as props
 *        instead of fetching them itself. `RawVehicle` is redeclared from the apps' root-level
 *        `types/fleet.ts` (see `types.ts`), and `#/fleet`'s `TrackingRecord` is
 *        `@/features/fleet-tracking-map`'s.
 *        `FleetTrackingMap` is imported from `@/features/fleet-tracking-map` instead of
 *        `@/components/fleet-tracking-map`, matching where the library actually put it.
 *        `renderSidePanel` is new: the apps hard-coded no side panel here at all (`FleetTrackingMap` was
 *        rendered with no `renderSidePanel`, i.e. every vehicle showed the map's built-in empty state).
 *        Making it an optional prop lets a host app wire in `TelemetrySidePanel` — see the README.
 */

import { FleetTrackingMap } from "@/features/fleet-tracking-map";
import type { TrackingRecord } from "@/features/fleet-tracking-map";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { RawVehicle } from "./types";

export type TelemetryPageProps = {
	vehicles: RawVehicle[];
	loading: boolean;
	/** Detail panel for the selected vehicle — see `FleetTrackingMap`'s `renderSidePanel`. */
	renderSidePanel?: (context: { vehicle: TrackingRecord; address: string }) => ReactNode;
};

export const TelemetryPage = ({ vehicles, loading, renderSidePanel }: TelemetryPageProps) => {
	const data: TrackingRecord[] = vehicles
		.filter((v) => v.vehicle_trackings?.length > 0)
		.map((v) => {
			const t = v.vehicle_trackings[0];
			return {
				...t,
				id: v.id,
				tracking_id: t.id,
				plate_number: v.plate_number,
				alias: v.alias,
				make: v.make,
			};
		});

	const [selectedId, setSelectedId] = useState<string | null>(null);
	const [panelOpen, setPanelOpen] = useState(true);

	const selected = selectedId ? (data.find((v) => v.id === selectedId) ?? null) : null;

	useEffect(() => {
		if (data.length > 0 && !selectedId) {
			setSelectedId(data[0].id);
		}
	}, [data, selectedId]);

	return (
		<FleetTrackingMap
			data={data}
			loading={loading}
			selected={selected}
			onSelect={(v) => setSelectedId(v.id)}
			panelOpen={panelOpen}
			onPanelToggle={() => setPanelOpen((o) => !o)}
			renderSidePanel={renderSidePanel}
		/>
	);
};

export default TelemetryPage;
