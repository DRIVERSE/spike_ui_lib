/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/live-map/MapStatusBar.tsx
 *                                     and .../components/tracking-gps/live-map/MapStatusBar.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/live-map/MapStatusBar.tsx
 *                                     and .../components/tracking-gps/live-map/MapStatusBar.tsx
 * @status identical
 * @notes Byte-identical across all four copies. Both `gps/live-map` and `tracking-gps/live-map` render it
 *        behind a hard-coded `showStatusBar = false`, so it is currently dead in both apps; ported as-is
 *        since a consumer can flip that flag on in its own fork of the map, or use it standalone.
 */

import Iconify from "@/icons/iconify-icon";
import { formatTimestamp } from "@/utils/time";

type Props = {
	locationName: string;
	gpsTime?: string;
	speed?: number;
	currentMileage?: string | number;
	trackerOil?: string;
	accStatus?: string;
	onlineStatus?: string;
	isPlaybackMode: boolean;
};

export const MapStatusBar = ({
	locationName,
	gpsTime,
	speed,
	currentMileage,
	trackerOil,
	accStatus,
	onlineStatus,
	isPlaybackMode,
}: Props) => {
	const isOffline = onlineStatus === "0";
	const isEngineOn = accStatus === "1";

	return (
		<div className="flex gap-4 items-center flex-wrap text-sm">
			{!isPlaybackMode && locationName && (
				<div className="flex items-center gap-2">
					<Iconify icon="solar:map-point-rotate-bold" width={20} height={20} className="text-red-600" />
					<span className="text-base font-medium">{locationName || "Loading location..."}</span>
				</div>
			)}
			{gpsTime && (
				<div className="flex items-center gap-2">
					<Iconify icon="mdi:clock-outline" width={18} height={18} className="text-gray-600" />
					<span className="text-base font-medium">{formatTimestamp(gpsTime)}</span>
				</div>
			)}
			{speed !== undefined && (
				<div className="flex items-center gap-2">
					<Iconify icon="mdi:speedometer" width={18} height={18} className="text-blue-600" />
					<span className="text-base font-medium">{speed} km/h</span>
				</div>
			)}
			{!isPlaybackMode && currentMileage && (
				<div className="flex items-center gap-2">
					<Iconify icon="mdi:counter" width={18} height={18} className="text-purple-600" />
					<span className="text-base font-medium">{Number.parseFloat(String(currentMileage)).toFixed(2)} km</span>
				</div>
			)}
			{!isPlaybackMode && trackerOil && (
				<div className="flex items-center gap-2">
					<Iconify icon="mdi:gas-station" width={18} height={18} className="text-orange-600" />
					<span className="text-base font-medium">{trackerOil}</span>
				</div>
			)}
			{accStatus !== undefined && (
				<div className="flex items-center gap-2">
					<Iconify
						icon={isEngineOn ? "mdi:engine" : "mdi:engine-off"}
						width={18}
						height={18}
						className={isEngineOn ? "text-green-600" : "text-gray-400"}
					/>
					<span className="text-base font-medium">{isEngineOn ? "ON" : "OFF"}</span>
				</div>
			)}
			{!isPlaybackMode && onlineStatus && (
				<div className="flex items-center gap-2">
					<Iconify
						icon={isOffline ? "mdi:alert-circle" : "mdi:check-circle"}
						width={18}
						height={18}
						className={isOffline ? "text-red-600" : "text-green-600"}
					/>
					<span className={`text-base font-medium ${isOffline ? "text-red-600" : "!text-[#28a745]"}`}>
						{isOffline ? "Offline" : "Online"}
					</span>
				</div>
			)}
		</div>
	);
};
