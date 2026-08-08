/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/index.tsx
 * @status identical
 * @notes Byte-identical in both apps. The "today"/live view: a map plus the today side panel, no date
 *        range controls. Genuinely different from `tracking-gps/index.tsx`, which adds the track date
 *        filter and threads a track range through to its `LiveMap`/`SidePanel`.
 */

import { CircleLoading } from "@/components/loading";
import dayjs, { type Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import type { ViewMode } from "../types";
import type { TrailHistoryPoint, VehicleTrackingData } from "../types";
import { LiveMap } from "./live-map";
import { SidePanel } from "./side-panel";

dayjs.extend(relativeTime);

export type GpsProps = {
	data?: VehicleTrackingData;
	trailHistory?: TrailHistoryPoint[];
	loading?: boolean;
	onDateChange: (date: Dayjs) => void;
	selectedDate: Dayjs;
	viewMode: ViewMode;
	formattedLabel: string;
	datePickerLabel: string;
	isToday: boolean;
};

export const Gps = ({ loading, data, viewMode }: GpsProps) => {
	const [address, setAddress] = useState("");

	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<CircleLoading />
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="grid grid-cols-[1fr_350px] gap-5">
				<div className="flex-1 min-w-0 p-2 bg-white  overflow-hidden relative z-0 rounded-2xl border border-gray-400">
					<LiveMap data={data} onAddressChange={setAddress} />
				</div>
				<div className="overflow-y-auto max-h-[700px] pb-12 bg-white">
					<SidePanel data={data} address={address} viewMode={viewMode} />
				</div>
			</div>
		</div>
	);
};

export default Gps;
