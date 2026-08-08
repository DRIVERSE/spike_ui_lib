/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/device-card.tsx
 *                                     and .../components/tracking-gps/side-panel/device-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/device-card.tsx
 *                                     and .../components/tracking-gps/side-panel/device-card.tsx
 * @status identical
 * @notes Byte-identical across all four copies.
 */

import dayjs from "dayjs";
import { DeviceRow } from "./device-row";

type Props = {
	data?: Record<string, string | number | null>;
	isOffline?: boolean;
};

export function DeviceCard({ data, isOffline }: Props) {
	return (
		<div className="rounded-[20px] border border-white bg-white p-5">
			<div className="flex items-center justify-between mb-5">
				<h3 className="font-medium text-slate-900 text-lg mt-1">Tracker Status</h3>

				<div
					className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
						!isOffline ? "!bg-green-100 text-green-500" : "bg-red-50 text-red-500"
					}`}
				>
					<span className={`w-2 h-2 rounded-full ${!isOffline ? "bg-green-500" : "bg-red-600"} `} />
					{!isOffline ? "Online" : "Offline"}
				</div>
			</div>

			<div className="space-y-4">
				<DeviceRow
					icon="mdi:wifi"
					label="Last online"
					value={data?.hb_time ? dayjs(data.hb_time).format("YYYY-MM-DD") : "—"}
					subtitle={data?.hb_time ? dayjs(data.hb_time).format("HH:mm:ss") : ""}
				/>

				<DeviceRow
					icon="mdi:crosshairs-gps"
					label="Last GPS fix"
					value={data?.gps_time ? dayjs(data.gps_time).format("YYYY-MM-DD") : "—"}
					subtitle={data?.gps_time ? dayjs(data.gps_time).format("HH:mm:ss") : ""}
				/>
			</div>
		</div>
	);
}
