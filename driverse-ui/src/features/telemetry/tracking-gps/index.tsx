/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/tracking-gps/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/tracking-gps/index.tsx
 * @status identical
 * @notes Byte-identical in both apps. The historical-playback view: a map with the trail/playback
 *        controls, plus the track date filter and the tabbed history side panel. Genuinely different from
 *        `gps/index.tsx`, which has no date range and a flat side panel.
 *        `vehicleId` threads down to `SidePanel` (was that component's own `useParams()` call).
 */

import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import type { TrailHistoryPoint, VehicleTrackingData, ViewMode } from "../types";
import { LiveMap } from "./live-map";
import { SidePanel } from "./side-panel";
import { TrackDateFilter } from "./side-panel/track-date-filter";

dayjs.extend(relativeTime);

export type TrackingGpsProps = {
	data?: VehicleTrackingData;
	trailHistory?: TrailHistoryPoint[];
	loading?: boolean;
	onDateChange: (date: Dayjs) => void;
	selectedDate: Dayjs;
	viewMode: ViewMode;
	formattedLabel: string;
	datePickerLabel: string;
	isToday: boolean;
	trackRangeStart: Dayjs;
	trackRangeEnd: Dayjs;
	onApplyTrackRange: (start: Dayjs, end: Dayjs) => void;
	/** Was `useParams().id`, read inside `side-panel/index.tsx`. */
	vehicleId?: string;
};

export const TrackingGps = ({
	loading,
	data,
	trailHistory,
	viewMode,
	trackRangeStart,
	trackRangeEnd,
	onApplyTrackRange,
	vehicleId,
}: TrackingGpsProps) => {
	const [address, setAddress] = useState("");
	const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-[1fr_350px] gap-5">
				<div className="flex-1 min-w-0 p-2 bg-white  overflow-hidden relative z-0 rounded-2xl border border-gray-400">
					<LiveMap
						data={data}
						trailHistory={trailHistory}
						onAddressChange={setAddress}
						onLocationChange={(lat, lng) => setCurrentLocation({ lat, lng })}
					/>
				</div>

				<div className="overflow-y-auto max-h-[700px] pb-12 flex flex-col gap-4">
					<TrackDateFilter start={trackRangeStart} end={trackRangeEnd} onApply={onApplyTrackRange} loading={loading} />
					<SidePanel
						data={data}
						address={address}
						viewMode={viewMode}
						location={currentLocation}
						isHistory={(trailHistory?.length ?? 0) > 0}
						trackRangeStart={trackRangeStart}
						trackRangeEnd={trackRangeEnd}
						vehicleId={vehicleId}
					/>
				</div>
			</div>
		</div>
	);
};

export default TrackingGps;
