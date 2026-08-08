/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/status/gps-status-card.tsx
 *                                     and .../components/tracking-gps/status/gps-status-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/status/gps-status-card.tsx
 *                                     and .../components/tracking-gps/status/gps-status-card.tsx
 * @status identical
 * @notes Byte-identical across all four copies. Unused in both apps, same as the rest of `status/` — see
 *        `cellular-signal.tsx`'s notes. This file also declares its own `CellularSignal` (different bar
 *        heights than `./cellular-signal.tsx`'s), which `GpsStatusCard` itself never renders either
 *        (`signalBars` is accepted but commented out of use) — kept verbatim rather than de-duplicated
 *        against `./cellular-signal.tsx`, since the two were never actually the same component.
 */

import { formatTime } from "@/utils/time";
import { Card } from "antd";
import { StatItem } from "./trip-summary-card";

type GpsStatusProps = {
	signalBars?: number;
	lastOnline?: string;
	lastGpsFix?: string;
	gpsAccuracy?: number;
	isOnline?: boolean;
};

export const CellularSignal = ({ bars = 3 }: { bars?: number }) => {
	const heights = [10, 14, 18, 22];
	return (
		<div className="flex items-end gap-0.5 h-6">
			{heights.map((h, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, order-stable bar list
					key={i}
					className="w-2 rounded-sm"
					style={{ height: h, backgroundColor: i < bars ? "#22c55e" : "#e5e7eb" }}
				/>
			))}
		</div>
	);
};

export const GpsStatusCard = ({ lastOnline, lastGpsFix, gpsAccuracy, isOnline = true }: GpsStatusProps) => (
	<Card className="h-full">
		<div className="flex items-center justify-between mb-4">
			<p className="text-base font-semibold">Device Status</p>
			<span
				className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${isOnline ? "bg-[#22c55e] text-white" : "bg-red-100 text-red-600"}`}
			>
				<span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-[#fff]" : "bg-red-500"}`} />
				<span className={`${isOnline ? "text-[#fff]" : "text-red-400"}`}>{isOnline ? "Online" : "Offline"}</span>
			</span>
		</div>
		<p className="text-xs  mb-4">Reflects the current state of the device</p>

		<div className="flex flex-col gap-4">
			<StatItem icon="mdi:wifi" label="Last Online" value={lastOnline ? formatTime(lastOnline) : "-"} />
			<StatItem icon="mdi:crosshairs-gps" label="Last GPS Fix" value={lastGpsFix ? formatTime(lastGpsFix) : "-"} />
			<StatItem icon="mdi:crosshairs" label="GPS Accuracy" value={gpsAccuracy != null ? `±${gpsAccuracy} m` : "-"} />
		</div>
	</Card>
);
