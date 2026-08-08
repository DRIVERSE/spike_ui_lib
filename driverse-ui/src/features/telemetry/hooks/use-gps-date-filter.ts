/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useGpsDateFilter.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/useGpsDateFilter.ts
 * @status decoupled
 * @notes The dayjs label logic — `isToday`, `viewMode`, `formattedLabel`, `datePickerLabel` — is verbatim.
 *        Three decouplings:
 *          - `@apollo/client`'s `useSubscription(VEHICLE_TRACKING_SUBSCRIPTION)` became the injected
 *            `subscribeVehicleTracking`, wired up as a plain effect + unsubscribe-on-cleanup instead of a
 *            hook that owns an Apollo cache entry. The apps read `data?.vehicle_trackings?.[0]`; the
 *            injected callback hands back that record already unwrapped.
 *          - `react-router`'s `useParams().id` and the zustand `@/store/vehicleDetailsStore` fallback are
 *            both gone. Both apps resolved the vehicle id as `param?.id || vehicle?.id || vehicleDetails?.id`;
 *            the library takes the id as an explicit `vehicleId` prop, falling back only to `vehicle?.id`.
 *          - `dateStart` / `dateEnd` were computed and then never used — both apps left them commented out
 *            of the subscription variables and didn't return them either. Dropped along with the
 *            `console.log({ dateStart, dateEnd })` both apps left in.
 */

import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useState } from "react";
import { useTelemetryDataSource } from "../providers/telemetry-provider";
import type { VehicleTrackingData, ViewMode } from "../types";

export type { ViewMode };

type Props = {
	vehicle?: VehicleTrackingData;
	/** Was `useParams().id` (falling back to `vehicle?.id`). */
	vehicleId?: string;
};

export const useGpsDateFilter = ({ vehicle, vehicleId }: Props) => {
	const { subscribeVehicleTracking } = useTelemetryDataSource();

	const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
	const [vehicleTrackingData, setVehicleTrackingData] = useState<VehicleTrackingData>({});
	const [loading, setLoading] = useState(true);

	const isToday = selectedDate.isSame(dayjs(), "day");
	const viewMode: ViewMode = isToday ? "today" : "historical";

	const formattedLabel = isToday
		? `Today · ${selectedDate.format("dddd, MMM D, YYYY")}`
		: selectedDate.format("dddd, MMMM D, YYYY");

	const datePickerLabel = isToday ? "Today" : selectedDate.format("MMM D, YYYY");

	useEffect(() => {
		const id = vehicleId || vehicle?.id;
		if (!id) {
			setLoading(false);
			return;
		}

		setLoading(true);
		const unsubscribe = subscribeVehicleTracking(id, (data) => {
			setVehicleTrackingData(data || {});
			setLoading(false);
		});

		return unsubscribe;
	}, [vehicleId, vehicle?.id, subscribeVehicleTracking]);

	return {
		selectedDate,
		setSelectedDate,
		isToday,
		viewMode,
		formattedLabel,
		datePickerLabel,
		vehicleTrackingData,
		loading,
	};
};
