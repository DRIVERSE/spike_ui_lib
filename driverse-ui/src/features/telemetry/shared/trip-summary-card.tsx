/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/status/trip-summary-card.tsx
 *                                     and .../components/tracking-gps/status/trip-summary-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/status/trip-summary-card.tsx
 *                                     and .../components/tracking-gps/status/trip-summary-card.tsx
 * @status adopted-B
 * @notes A and B differ only in where `MovementStatus` comes from: A imports it from the apps'
 *        root-level `#/entity`, B already imports it from `@/utils` — the exact switch this library made
 *        for its own `MovementStatus` export, so B's line is adopted verbatim (now `../../utils`).
 *        `ViewMode` is the type both `gps/index.tsx` and `tracking-gps/index.tsx` (in both apps) actually
 *        need from this file; `TripSummaryCard`/`StatItem`/`StatusBadge` themselves are unused in both
 *        apps — only `status/index.tsx` renders `TripSummaryCard`, and `status/index.tsx` is itself never
 *        imported by either view. Ported per the established file list; `status/index.tsx` was not.
 */

import { Header } from "@/components/page-header/header";
import Iconify from "@/icons/iconify-icon";
import type { MovementStatus } from "@/utils";
import { Card } from "antd";
import type { ViewMode } from "../types";

export type { ViewMode };

type TripSummaryProps = {
	speed?: number;
	distance?: number;
	startTime?: string;
	address?: string;
	coordinates?: string;
	todayMileage?: number;
	movementStatus?: MovementStatus;
	viewMode?: ViewMode;
	lastUpdated?: string;
};

export const StatItem = ({ label, value, icon }: { label: string; value?: string | number; icon?: string }) => (
	<div className="flex flex-col gap-1 capitalize">
		<div className="flex items-center gap-1 ">
			{icon && <Iconify icon={icon} width={14} height={14} className="text-blue-400" />}
			<span className="text-xs font-medium  uppercase tracking-wide">{label}</span>
		</div>
		<span className="text-base font-semibold ">{value ?? "-"}</span>
	</div>
);

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
	moving: { label: "Moving", color: "text-green-500", icon: "mdi:circle" },
	idling: { label: "Idling", color: "text-yellow-400", icon: "mdi:circle" },
	parked: { label: "Parked", color: "text-red-500", icon: "mdi:circle" },
};

const StatusBadge = ({ status }: { status?: MovementStatus }) => {
	const config = status ? STATUS_CONFIG[status] : null;
	return (
		<div className="flex flex-col gap-1">
			<div className="flex items-center gap-1">
				<Iconify icon="mdi:car-outline" width={14} className="text-blue-400" />
				<span className="text-xs font-medium uppercase tracking-wide">Vehicle Status</span>
			</div>
			{config ? (
				<div className="flex items-center gap-1.5">
					<Iconify icon={config.icon} width={10} className={config.color} />
					<span className="text-base font-semibold capitalize">{config.label}</span>
				</div>
			) : (
				<span className="text-base font-semibold">-</span>
			)}
		</div>
	);
};

export const TripSummaryCard = ({
	speed,
	distance,
	startTime,
	address,
	coordinates,
	todayMileage,
	movementStatus,
	viewMode = "today",
	lastUpdated,
}: TripSummaryProps) => {
	const isToday = viewMode === "today";
	const title = isToday ? "Trip Activity" : "Trip Summary";
	const subtitle = isToday
		? (lastUpdated ?? "Updated just now")
		: startTime
			? `Apr ${new Date().getDate()}, ${new Date().getFullYear()}`
			: undefined;

	return (
		<Card className="h-full">
			<div className="flex items-center justify-between mb-5">
				<Header title={title} />
				{subtitle && <span className="text-sm ">{subtitle}</span>}
			</div>

			<div className="grid grid-cols-3 gap-x-6 gap-y-5">
				{isToday ? (
					<>
						<StatItem icon="mdi:speedometer" label="Live Speed" value={speed != null ? `${speed} km/h` : "-"} />
						<StatItem
							icon="mdi:map-marker-distance"
							label="Today's Mileage"
							value={todayMileage != null ? `${todayMileage} km` : "-"}
						/>
						<StatItem icon="mdi:clock-outline" label="Start Time" value={startTime} />
						<StatusBadge status={movementStatus} />
						<StatItem icon="mdi:map-marker-outline" label="Current Location" value={address} />
						<StatItem icon="mdi:crosshairs-gps" label="Coordinates" value={coordinates} />
					</>
				) : (
					<>
						<StatItem icon="mdi:speedometer" label="Speed" value={speed != null ? `${speed} km/h` : "-"} />
						<StatItem
							icon="mdi:map-marker-distance"
							label="Total Distance"
							value={distance != null ? `${distance} km` : "-"}
						/>
						<StatItem icon="mdi:clock-outline" label="Start Time" value={startTime} />
						<StatItem icon="mdi:map-marker-outline" label="Location" value={address} />
						<StatItem icon="mdi:crosshairs-gps" label="Coordinates" value={coordinates} />
						<StatusBadge status={movementStatus} />
					</>
				)}
			</div>
		</Card>
	);
};
