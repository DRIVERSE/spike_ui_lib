/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/tracking-gps/side-panel/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/tracking-gps/side-panel/index.tsx
 * @status adopted-B
 * @notes B passes a fourth argument to `useTrackHistoryMetrics` — `activeTab === "overview"` — so the
 *        metrics query pauses while the "Driver Behavior" tab is active; A always leaves it enabled. B
 *        adopted (this is also why `useTrackHistoryMetrics` grew the `enabled` parameter — see
 *        `hooks/use-mileage-report.ts`).
 *        This is the historical side panel — Overview/Driver Behavior tabs, the has-trips-vs-no-trips
 *        branch — genuinely different from `gps/side-panel` (a flat metric stack, no tabs).
 *        `react-router`'s `useParams()` is gone: this component now takes an injected `vehicleId` prop
 *        instead of reading it off the route itself, matching how the module root threads it down (see
 *        `telemetry.tsx`). `@/components/pill-tabs` and `@/components/fallback` are the library's.
 */

import Fallback from "@/components/fallback";
import PillTabs from "@/components/pill-tabs";
import Iconify from "@/icons/iconify-icon";
import type { Dayjs } from "dayjs";
import { useState } from "react";
import { useTrackHistoryMetrics } from "../../hooks/use-mileage-report";
import { LocationCard } from "../../shared/location-card";
import type { VehicleTrackingData, ViewMode } from "../../types";
import { MetricsCard } from "./metric-card";

export type TrackingSidePanelProps = {
	data?: VehicleTrackingData;
	address?: string;
	isHistory?: boolean;
	viewMode?: ViewMode;
	link?: string;
	location?: { lat: number; lng: number } | null;
	trackRangeStart?: Dayjs;
	trackRangeEnd?: Dayjs;
	/** Was `useParams().id`. */
	vehicleId?: string;
};

export const SidePanel = ({
	data,
	address,
	location,
	isHistory,
	trackRangeStart,
	trackRangeEnd,
	vehicleId,
}: TrackingSidePanelProps) => {
	const [activeTab, setActiveTab] = useState("overview");

	const { data: trackHistoryMetrics } = useTrackHistoryMetrics(
		vehicleId,
		trackRangeStart,
		trackRangeEnd,
		activeTab === "overview",
	);

	const locationData = location ? { ...data, latitude: location.lat, longitude: location.lng } : data;

	const noTripsDescription =
		trackRangeStart && trackRangeEnd
			? `This vehicle has no recorded track data between ${trackRangeStart.format("MMMM Do")} and ${trackRangeEnd.format("MMMM Do, YYYY")}.`
			: "This vehicle has no recorded track data for the selected range.";

	return (
		<div>
			<PillTabs
				activeTab={activeTab}
				onTabChange={setActiveTab}
				fullWidth={false}
				items={[
					{
						key: "overview",
						label: "Overview",
						children: (
							<div>
								{isHistory ? (
									<div className="h-full bg-[#fafafa] flex flex-col gap-4">
										<MetricsCard metrics={trackHistoryMetrics} />

										<LocationCard data={locationData} address={address} />
									</div>
								) : (
									<Fallback
										icon={<Iconify icon="lucide:car" width={40} height={40} />}
										title="No trips found"
										description={<p className="max-w-56 text-center">{noTripsDescription}</p>}
										className="rounded-[20px] border border-[#ECECEC] bg-white"
									/>
								)}
							</div>
						),
					},
					{
						key: "driver-behavior",
						label: "Driver Behavior",
						children: (
							<div className="h-full bg-[#ffffff] flex flex-col gap-4">
								<Fallback
									icon={<Iconify icon="lucide:car" width={40} height={40} />}
									title="No driver behavior data"
									description={
										<p className="max-w-56 text-center">Driver behavior data is not available for this vehicle yet.</p>
									}
								/>
							</div>
						),
					},
				]}
			/>
		</div>
	);
};
