/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/hooks/useMileageReport.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/hooks/useMileageReport.ts
 * @status adopted-B
 * @notes B is more complete and adopted: `useTrackHistoryMetrics` takes a fourth `enabled` argument that
 *        gates the query (A's version is always enabled once `vehicleId`/`start`/`end` are present), which
 *        `tracking-gps/side-panel/index.tsx` uses to pause the query while the "Driver Behavior" tab is
 *        active.
 *        The `@tanstack/react-query` shape — `queryKey`, `staleTime`, `enabled`, `refetchInterval` — is
 *        kept verbatim; only the transport moves. Both apps built the request from
 *        `useApiResource()` and `${import.meta.env.VITE_TELEMATICS_API}/tracksolid/...` URLs; those are
 *        now the injected `TelemetryDataSource.fetchMileageReport` / `fetchTrackHistoryMetrics`, read
 *        through `useTelemetryDataSource()`.
 *        B's `fetchTrackHistoryMetrics` also sent a hard-coded `authHeader: { "X-Environment": "qa" }`.
 *        That is dropped — a hard-coded deployment environment does not belong in a shared library. An app
 *        that needs the header sets it inside its own `TelemetryDataSource.fetchTrackHistoryMetrics`.
 */

import { useQuery } from "@tanstack/react-query";
import dayjs, { type Dayjs } from "dayjs";
import { useTelemetryDataSource } from "../providers/telemetry-provider";

const toISOString = (date?: Dayjs | string) => (date ? (dayjs.isDayjs(date) ? date.toISOString() : date) : undefined);

export const useMileageReport = (imei: string | undefined, refetchInterval: number | false = false) => {
	const { fetchMileageReport } = useTelemetryDataSource();

	return useQuery({
		queryKey: ["mileage-report", imei],
		queryFn: () => fetchMileageReport(imei as string),
		enabled: !!imei,
		staleTime: 5 * 60 * 1000,
		refetchInterval,
	});
};

export const useTrackHistoryMetrics = (
	vehicleId: string | undefined,
	startDate?: Dayjs | string,
	endDate?: Dayjs | string,
	enabled = true,
) => {
	const { fetchTrackHistoryMetrics } = useTelemetryDataSource();

	const start = toISOString(startDate);
	const end = toISOString(endDate);

	return useQuery({
		queryKey: ["track-history-metrics", vehicleId, start, end],
		queryFn: () => fetchTrackHistoryMetrics(vehicleId as string, start as string, end as string),
		enabled: enabled && !!vehicleId && !!start && !!end,
		staleTime: 5 * 60 * 1000,
	});
};
