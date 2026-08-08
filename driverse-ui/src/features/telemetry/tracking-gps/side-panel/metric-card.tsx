/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/tracking-gps/side-panel/metric-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/tracking-gps/side-panel/metric-card.tsx
 * @status decoupled
 * @notes A imports `TrackHistoryMetrics` with a relative path (`../../../hooks/useMileageReport`); B with
 *        an absolute one. Both point at the same type, now `../../types`. `react-router`'s `<Link to>` is
 *        a plain `<a href>`, matching `gps/side-panel/metric-card.tsx`'s decoupling and the
 *        `payment-options.tsx` precedent elsewhere in the library. `@iconify/react`'s `Icon` is the
 *        library's `<Iconify>`. The commented-out `unit` prop on the "Trip Time" `MetricItem` (dead in
 *        both apps) is dropped.
 */

import Iconify from "@/icons/iconify-icon";
import { formatTimeInHr } from "@/utils/time";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { MetricItem } from "../../shared/metric-item";
import type { TrackHistoryMetrics } from "../../types";

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
	link?: string;
	metrics?: TrackHistoryMetrics;
};

export function MetricsCard({ link, metrics }: Props) {
	return (
		<div className="rounded-[20px] border border-[#ECECEC] bg-[#fff]">
			<div className="px-5 py-4 flex items-center justify-between border-b border-slate-100">
				<span className="text-lg text-slate-400 font-medium">Track Summary</span>

				{link && (
					<a
						href={link}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
					>
						<span className="text-primary">View Details</span>
						<Iconify icon="majesticons:open-line" className="text-primary" width={16} />
					</a>
				)}
			</div>

			<div className="grid grid-cols-2">
				<MetricItem
					icon="material-symbols:signpost-outline-rounded"
					label="Total Distance"
					value={metrics?.total_distance ? Number(metrics.total_distance).toFixed(2) : "0"}
					unit="km"
				/>

				<MetricItem
					icon="ri:time-line"
					label="Trip Time"
					value={metrics?.total_trip_time ? formatTimeInHr(metrics?.total_trip_time) : "--:--"}
				/>
				<MetricItem
					icon="mdi:speedometer"
					label="Avg Speed"
					value={metrics?.average_speed ? Number(metrics.average_speed).toFixed(1) : "0"}
					unit="km/h"
				/>
				<MetricItem icon="line-md:speedometer" label="Max Speed" value={metrics?.maximum_speed || 0} unit="km/h" />
				<MetricItem icon="boxicons:trip-filled" label="Number of Trips" value={metrics?.number_of_trips || 0} />
			</div>
		</div>
	);
}
