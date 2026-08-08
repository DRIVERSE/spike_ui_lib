/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/index.tsx
 * @status decoupled
 * @notes A and B differ only in import ordering and prettier line-wrapping (plus the
 *        `vehicle.subcription`/`vehicle.subscription` typo in the graphql import path, which is why the
 *        two apps' import lines even looked different). B's formatting adopted.
 *        `@apollo/client`'s `useSubscription(VEHICLE_TRACKING_HISTORY_SUBSCRIPTION)` is now the injected
 *        `subscribeTrackHistory`, wired up as an effect + unsubscribe-on-cleanup; the apps read
 *        `data?.vehicle_track_history` off the subscription payload, which the injected callback hands
 *        back already unwrapped as the trail-point array.
 *        `react-router`'s `useParams().id` is now an explicit `vehicleId` prop, threaded down to both
 *        `Gps` (unused there today, kept for symmetry) and `TrackingGps` → its `SidePanel`.
 *        The `loading?: boolean` prop both apps declared but never read is dropped.
 *        `@/components/pill-tabs` is the library's `PillTabs`.
 *        `initialTab` is new: both apps hard-coded the initial tab to `"gps"`. Exposed as an optional prop
 *        (still defaulting to `"gps"`) so a consumer — or a story — can open straight on the tracking tab.
 */

import PillTabs from "@/components/pill-tabs";
import { getQuickRange } from "@/utils/time";
import type { Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { Gps } from "./gps";
import { useGpsDateFilter } from "./hooks/use-gps-date-filter";
import { useTelemetryDataSource } from "./providers/telemetry-provider";
import { TrackingGps } from "./tracking-gps";
import type { TrailHistoryPoint, VehicleTrackingData } from "./types";

export type TelemetryProps = {
	/** The vehicle's current tracking snapshot; used as a fallback id source alongside `vehicleId`. */
	data?: VehicleTrackingData;
	/** The vehicle id. Was `useParams().id` in both apps. */
	vehicleId?: string;
	/** Which pill tab opens first. Both apps hard-coded `"gps"`; kept as the default here too. */
	initialTab?: "gps" | "track";
};

export const Telemetry = ({ data: vehicle, vehicleId, initialTab = "gps" }: TelemetryProps) => {
	const [activeTab, setActiveTab] = useState(initialTab);

	const { subscribeTrackHistory } = useTelemetryDataSource();

	const {
		selectedDate,
		setSelectedDate,
		viewMode,
		formattedLabel,
		datePickerLabel,
		isToday,
		vehicleTrackingData,
		loading,
	} = useGpsDateFilter({ vehicle, vehicleId });

	const [trackRange, setTrackRange] = useState<{ start: Dayjs; end: Dayjs }>(() => getQuickRange("last3days"));

	const dateStart = trackRange.start.toISOString();
	const dateEnd = trackRange.end.toISOString();

	const handleApplyTrackRange = (start: Dayjs, end: Dayjs) => setTrackRange({ start, end });

	const [vehicleHistory, setVehicleHistory] = useState<TrailHistoryPoint[]>([]);
	const [trackingLoading, setTrackingLoading] = useState(true);

	useEffect(() => {
		if (!vehicleId) {
			setTrackingLoading(false);
			return;
		}

		setTrackingLoading(true);
		const unsubscribe = subscribeTrackHistory(vehicleId, dateStart, dateEnd, (data) => {
			setVehicleHistory(data || []);
			setTrackingLoading(false);
		});

		return unsubscribe;
	}, [vehicleId, dateStart, dateEnd, subscribeTrackHistory]);

	const tabItems = [
		{
			key: "gps",
			label: "Live Tracking",
			children: (
				<Gps
					data={vehicleTrackingData}
					loading={loading}
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
					viewMode={viewMode}
					formattedLabel={formattedLabel}
					datePickerLabel={datePickerLabel}
					isToday={isToday}
				/>
			),
		},
		{
			key: "track",
			label: "Tracking",
			children: (
				<TrackingGps
					data={vehicleTrackingData}
					loading={trackingLoading}
					trailHistory={vehicleHistory}
					selectedDate={selectedDate}
					onDateChange={setSelectedDate}
					viewMode={viewMode}
					formattedLabel={formattedLabel}
					datePickerLabel={datePickerLabel}
					isToday={isToday}
					trackRangeStart={trackRange.start}
					trackRangeEnd={trackRange.end}
					onApplyTrackRange={handleApplyTrackRange}
					vehicleId={vehicleId}
				/>
			),
		},
	];

	return (
		<div className="flex flex-col gap-6">
			<div>
				<PillTabs
					items={tabItems}
					activeTab={activeTab}
					onTabChange={(key) => setActiveTab(key as "gps" | "track")}
					fullWidth={false}
				/>
			</div>
		</div>
	);
};

export default Telemetry;
