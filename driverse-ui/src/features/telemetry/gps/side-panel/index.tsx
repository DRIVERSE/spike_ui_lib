/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/index.tsx
 * @status adopted-B
 * @notes B passes a third argument to `getMovementStatus(acc_status, speed, status)` (offline detection);
 *        A omits it. B adopted. Otherwise identical (formatting only). This is the "today" side panel —
 *        `MetricsCard`, `DeviceCard`, `LocationCard`, `TodayCard` stacked — genuinely different from
 *        `tracking-gps/side-panel` (which adds the Overview/Driver Behavior tabs and the history-vs-no-trips
 *        branch). Exported from the module's public `index.ts` as `TelemetrySidePanel`: it is the component
 *        `@/features/fleet-tracking-map`'s `renderSidePanel({ vehicle, address })` render prop expects,
 *        i.e. `renderSidePanel={({ vehicle, address }) => <TelemetrySidePanel data={vehicle} address={address} viewMode="today" />}`.
 */

import { getMovementStatus } from "@/utils";
import { DeviceCard } from "../../shared/device-card";
import { LocationCard } from "../../shared/location-card";
import { TodayCard } from "../../shared/today-card";
import type { VehicleTrackingData, ViewMode } from "../../types";
import { MetricsCard } from "./metric-card";

export type SidePanelProps = {
	data?: VehicleTrackingData;
	address?: string;
	viewMode?: ViewMode;
	link?: string;
};

export const SidePanel = ({ data, address, viewMode = "today", link }: SidePanelProps) => {
	const movementStatus = data ? getMovementStatus(data.acc_status, data.speed, data?.status) : undefined;

	const isOffline = data?.status === "0";

	const isToday = viewMode === "today";

	return (
		<div className="h-full bg-[#fafafa] flex flex-col gap-4">
			<MetricsCard data={data} movementStatus={movementStatus} isToday={isToday} link={link} />

			<DeviceCard data={data} isOffline={isOffline} />

			<LocationCard data={data} address={address} />

			<TodayCard data={data} />
		</div>
	);
};
