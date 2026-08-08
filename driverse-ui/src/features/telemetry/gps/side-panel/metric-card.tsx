/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/metric-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/metric-card.tsx
 * @status decoupled
 * @notes A imports `MovementStatus` from the apps' root-level `#/entity`; B already imports it from
 *        `@/utils` (B also picks up an unrelated `STATUS_CONFIG` import in the same line). B's line
 *        adopted — same switch this library made for its own `MovementStatus` export.
 *        `useMileageReport` now reads through the injected `TelemetryDataSource` (see its own header) but
 *        is otherwise called exactly as before. `react-router`'s `<Link to={link}>` is a plain `<a href>`
 *        (the library takes no router dependency, per `gps/side-panel/index.tsx`'s `link` prop being a
 *        bare string already). `@iconify/react`'s `Icon` is the library's `<Iconify>`.
 */

import Iconify from "@/icons/iconify-icon";
import type { MovementStatus } from "@/utils";
import { STATUS_CONFIG } from "@/utils";
import { formatTripDuration, parseTripTime } from "@/utils/time";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect } from "react";
import { useMileageReport } from "../../hooks/use-mileage-report";
import { MetricItem } from "../../shared/metric-item";
import type { VehicleTrackingData } from "../../types";

dayjs.extend(utc);

export type Trip = {
	imei: string;
	startTime: string;
	endTime: string;
	startLat: string;
	startLng: string;
	endLat: string;
	endLng: string;
	elapsed: string | null;
	distance: string;
	avgSpeed: string;
};

type Props = {
	data?: VehicleTrackingData;
	movementStatus?: MovementStatus;
	isToday: boolean;
	link?: string;
};

export function MetricsCard({ data, movementStatus, link }: Props) {
	const statusConfig = movementStatus ? STATUS_CONFIG[movementStatus] : null;

	const isStationary = movementStatus === "idling" || movementStatus === "parked";

	const queryClient = useQueryClient();

	// biome-ignore lint/correctness/useExhaustiveDependencies: matches source apps' dependency list
	useEffect(() => {
		if (data?.imei) {
			queryClient.invalidateQueries({ queryKey: ["mileage-report", data.imei] });
		}
	}, [isStationary, data?.imei]);

	const { data: tripData } = useMileageReport(data?.imei, isStationary ? false : 30_000);

	const lastTrip: Trip | undefined = tripData?.trips?.[0] as Trip | undefined;

	const distanceKm = data?.distance ? (Number(data.distance) / 1000).toFixed(1) : "0";

	const tripDistanceKm = lastTrip?.distance ? (Number(lastTrip.distance) / 1000).toFixed(1) : "0";

	const tripDuration = formatTripDuration(lastTrip?.startTime, lastTrip?.endTime);

	return (
		<div className="rounded-[20px] border border-[#ECECEC] bg-[#fff]">
			<div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
				<span className="text-lg text-slate-400 font-medium">
					{isStationary ? "Last Trip Summary" : "Current Trip"}
				</span>

				{link && (
					<a href={link} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
						<span className="text-primary">View Details</span>
						<Iconify icon="majesticons:open-line" className="text-primary" width={16} />
					</a>
				)}
			</div>

			<div className="grid grid-cols-2">
				<MetricItem
					icon="mdi:speedometer"
					label={isStationary ? "Avg Speed" : "Live Speed"}
					value={isStationary ? (lastTrip?.avgSpeed ?? "—") : (data?.speed ?? "0")}
					unit="km/h"
				/>
				{isStationary && (
					<MetricItem
						icon="material-symbols:signpost-outline-rounded"
						label="Trip Distance"
						value={isStationary ? tripDistanceKm : distanceKm}
						unit="km"
					/>
				)}

				{isStationary && (
					<MetricItem
						icon="mdi:clock-start"
						label="Start Time"
						value={
							isStationary && lastTrip?.startTime
								? parseTripTime(lastTrip.startTime)?.format("hh:mm")
								: data?.gps_time
									? dayjs(data.gps_time).format("hh:mm")
									: "—"
						}
						unit={
							isStationary && lastTrip?.startTime
								? parseTripTime(lastTrip.startTime)?.format("A")
								: data?.gps_time
									? dayjs(data.gps_time).format("A")
									: ""
						}
					/>
				)}

				{isStationary && (
					<MetricItem
						icon="mdi:clock-end"
						label="End Time"
						value={lastTrip?.endTime ? parseTripTime(lastTrip.endTime)?.format("hh:mm") : "—"}
						unit={lastTrip?.endTime ? parseTripTime(lastTrip.endTime)?.format("A") : ""}
					/>
				)}

				{isStationary && (
					<MetricItem
						icon="mdi:timer-outline"
						label="Duration"
						value={tripDuration}
						className="p-5 border-t border-slate-100"
						valueClassName="text-base"
					/>
				)}
				<MetricItem
					icon="la:car-side"
					label="Status"
					value={statusConfig ? statusConfig.label : "—"}
					valueClassName={`text-base ${statusConfig ? statusConfig.color : "text-slate-900"}`}
					className="p-5 border-t border-slate-100 border-l"
				/>
			</div>
		</div>
	);
}
