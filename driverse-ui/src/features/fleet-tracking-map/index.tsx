/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/fleet-tracking-map/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/fleet-tracking-map/index.tsx
 * @status decoupled
 * @notes A and B differ only in formatting here; B adopted. Layout, the legend, the collapsible panel
 *        and its toggle are verbatim.
 *        Both plan blockers are gone rather than worked around:
 *          - `useLocationName` turned out to have no app dependencies, so it lifted straight into
 *            src/hooks/use-location-name.ts and is called here exactly as before.
 *          - `SidePanel` came from the telemetry feature via a five-level relative import
 *            (`../../features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel`).
 *            It is now the `renderSidePanel` render prop, so this module does not depend on telemetry
 *            and an app can show whatever detail panel it likes. The apps pass their SidePanel through.
 *        `STATUS_COLOR` was four hard-coded hexes. They now read the token palette (success / warning /
 *        brand primary / gray-400) so the legend and markers follow the theme instead of drifting from it.
 *        `TrackingRecord` is redeclared locally (see types.ts) and MAP_STYLES vendored (map-styles.ts).
 */

import "leaflet/dist/leaflet.css";
import Fallback from "@/components/fallback";
import { CircleLoading } from "@/components/loading";
import { useLocationName } from "@/hooks/use-location-name";
import Iconify from "@/icons/iconify-icon";
import { paletteColors } from "@/tokens/color";
import type { MovementStatus } from "@/utils/misc";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { FleetMap } from "./fleet-map";
import type { TrackingRecord } from "./types";
import { VehicleList } from "./vehicle-list";

/** Was `{ moving: "#22c55e", idling: "#eab308", parked: "#608bfb", offline: "#9ca3af" }`. */
export const STATUS_COLOR: Record<MovementStatus, string> = {
	moving: paletteColors.success.default,
	idling: paletteColors.warning.default,
	parked: "var(--brand-primary)",
	offline: paletteColors.gray[400],
};

export const STATUS_LABEL: Record<MovementStatus, string> = {
	moving: "Moving",
	idling: "Idling",
	parked: "Parked",
	offline: "Offline",
};

export type FleetTrackingMapProps = {
	data: TrackingRecord[];
	loading: boolean;
	selected: TrackingRecord | null;
	onSelect: (v: TrackingRecord) => void;
	panelOpen: boolean;
	onPanelToggle: () => void;
	/**
	 * Detail panel for the selected vehicle. The apps pass telemetry's SidePanel:
	 * `renderSidePanel={({ vehicle, address }) => <SidePanel data={vehicle} address={address} viewMode="today" link={...} />}`
	 */
	renderSidePanel?: (context: { vehicle: TrackingRecord; address: string }) => ReactNode;
};

export const FleetTrackingMap = ({
	data,
	loading,
	selected,
	onSelect,
	panelOpen,
	onPanelToggle,
	renderSidePanel,
}: FleetTrackingMapProps) => {
	const { locationName, updateLocationName } = useLocationName();

	useEffect(() => {
		if (selected?.latitude && selected?.longitude) {
			updateLocationName(selected.latitude, selected.longitude);
		}
	}, [selected?.latitude, selected?.longitude, updateLocationName]);

	return (
		<div className="flex h-[calc(100dvh-theme(spacing.32))] overflow-hidden">
			<VehicleList data={data} loading={loading} selected={selected} onSelect={onSelect} />

			<div className="flex-1 relative overflow-hidden z-0 bg-white p-2 border-2 border-gray-200">
				<FleetMap vehicles={data} selectedId={selected?.id ?? null} onSelect={onSelect} />

				<div className="absolute bottom-5 bg-white left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 rounded-full text-xs z-[500]">
					{(Object.entries(STATUS_COLOR) as [MovementStatus, string][]).map(([key, color]) => (
						<div key={key} className="flex items-center gap-1.5">
							<div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
							<span>{STATUS_LABEL[key]}</span>
						</div>
					))}
				</div>
			</div>

			<div
				className="relative flex flex-shrink-0 transition-all duration-300 overflow-visible"
				style={{ width: panelOpen ? 350 : 16 }}
			>
				<button
					type="button"
					onClick={onPanelToggle}
					aria-label={panelOpen ? "Collapse details panel" : "Expand details panel"}
					className="absolute -left-4 top-1/2 -translate-y-1/2 z-[1] flex items-center justify-center w-8 h-8 rounded-full shadow-md transition-colors"
					style={{
						background: "var(--brand-primary)",
						boxShadow: "0 4px 12px rgba(96,139,251,0.5)",
						border: "2px solid #fff",
					}}
				>
					<Iconify
						icon={panelOpen ? "lucide:chevron-right" : "lucide:chevron-left"}
						width={14}
						className="text-white"
					/>
				</button>

				<div
					className="flex flex-col overflow-y-auto overflow-x-hidden h-full px-4 transition-all duration-300"
					style={{
						width: 350,
						opacity: panelOpen ? 1 : 0,
						pointerEvents: panelOpen ? "auto" : "none",
					}}
				>
					{!loading && selected ? (
						renderSidePanel?.({ vehicle: selected, address: locationName })
					) : loading ? (
						<div className="h-72 text-center">
							<CircleLoading size="default" />
						</div>
					) : (
						<Fallback
							icon={<Iconify icon="mdi:map-marker-question-outline" width={32} />}
							className="mt-20"
							title="No vehicle selected"
							description="Selected vehicle details will be shown here."
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export { FleetMap } from "./fleet-map";
export { MAP_STYLES, type MapStyleKey } from "./map-styles";
export type { TrackingRecord } from "./types";
export { VehicleList } from "./vehicle-list";
