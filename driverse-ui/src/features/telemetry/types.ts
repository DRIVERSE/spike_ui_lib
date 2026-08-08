/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/**
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/**
 * @status decoupled
 * @notes Types the module's components shared implicitly (mostly as inline `any`) are redeclared here
 *        so the module has a real contract. Notable decouplings:
 *          - `TelemetryDataSource` is new. It replaces four app-side seams at once: `@apollo/client`'s
 *            `useSubscription` over `VEHICLE_TRACKING_SUBSCRIPTION` / `VEHICLE_TRACKING_HISTORY_SUBSCRIPTION`
 *            (imported from `@/graphql/subscription/vehicle.subcription` — note the typo, which is why the
 *            two apps' import paths differed), `@/hooks/web/use-resource`'s `useApiResource` used to build
 *            `${import.meta.env.VITE_TELEMATICS_API}/...` URLs, and `react-router`'s `useParams()` used to
 *            read the vehicle id. A library module cannot import a router, read `import.meta.env`, or hold
 *            an opinion about GraphQL vs REST, so all four became data the host app injects.
 *          - `fetchTrackHistoryMetrics` drops the `authHeader: { "X-Environment": "qa" }` BD's
 *            `useTrackHistoryMetrics` hard-coded. A hard-coded deployment environment header does not
 *            belong in a shared library; an app that needs it sets it inside its own
 *            `fetchTrackHistoryMetrics` implementation instead.
 *          - `VehicleTrackingData` is deliberately a loose `Record<string, any>`. Both apps typed every
 *            `data` prop across this module as bare `any`; a stricter shape here would be invented, not
 *            extracted.
 *          - `RawVehicle` is the shape `telemetry-page.tsx` maps into `TrackingRecord`, redeclared from
 *            the apps' root-level `types/fleet.ts` (identical in both apps) since the library cannot
 *            import it.
 *          - `MileageReportResponse` keeps both `data` (as declared by `useMileageReport.ts`) and an
 *            optional `trips` (as actually read by `metric-card.tsx`'s `tripData?.trips?.[0]`) — an
 *            inherited looseness from the source apps, not a change made here.
 */

import type { TrackingRecord } from "@/features/fleet-tracking-map";

export type ViewMode = "today" | "historical";

/** A point on the historical trail, in the shape `usePlayback` / `PlaybackControls` consume. */
export type TrailPoint = {
	lat: number;
	lng: number;
	time: string;
	direction?: string;
	speed?: number;
	acc_status?: string;
};

/** A point as it arrives over `subscribeTrackHistory`, before `LiveMap` normalises it into a `TrailPoint`. */
export type TrailHistoryPoint = {
	latitude: number;
	longitude: number;
	gps_time: string;
	direction?: string;
	speed?: number;
	acc_status?: string;
	[key: string]: any;
};

/**
 * Loosely-typed per-vehicle tracking record threaded through the module — the live "today" snapshot, or
 * the currently-playing-back trail point remapped onto the same shape. Both apps typed this `any`
 * everywhere it appears; kept loose here rather than inventing a stricter contract.
 */
export type VehicleTrackingData = Record<string, any>;

export type MileageReportItem = {
	imei: string;
	mileage: number;
	date: string;
	[key: string]: any;
};

export type MileageReportResponse = {
	data: MileageReportItem[];
	trips?: Array<Record<string, any>>;
	[key: string]: any;
};

export type TrackHistoryMetrics = {
	message: string;
	status: number;
	total_distance: number;
	total_trip_time: number;
	number_of_trips: number;
	average_speed: number;
	maximum_speed: number;
	start_date: string;
	end_date: string;
	timestamp: string;
	[key: string]: any;
};

/**
 * The injected transport seam. In the apps this was split across `@apollo/client` subscriptions, the
 * `useApiResource` REST client and `import.meta.env.VITE_TELEMATICS_API`. The library takes it all as data.
 */
export type TelemetryDataSource = {
	/** REST GET `${VITE_TELEMATICS_API}/tracksolid/reports/mileage?imeis=<imei>` in the apps. */
	fetchMileageReport: (imei: string) => Promise<MileageReportResponse>;
	/** REST GET `${VITE_TELEMATICS_API}/tracksolid/vehicles/<id>/track-history/metrics` in the apps. */
	fetchTrackHistoryMetrics: (vehicleId: string, startISO: string, endISO: string) => Promise<TrackHistoryMetrics>;
	/**
	 * Live vehicle-tracking feed; was `useSubscription(VEHICLE_TRACKING_SUBSCRIPTION)`. `cb` receives the
	 * vehicle's current tracking record. Returns an unsubscribe fn.
	 */
	subscribeVehicleTracking: (vehicleId: string, cb: (data: VehicleTrackingData) => void) => () => void;
	/**
	 * Historical track feed for a date range; was `useSubscription(VEHICLE_TRACKING_HISTORY_SUBSCRIPTION)`.
	 * `cb` receives the raw trail points. Returns an unsubscribe fn.
	 */
	subscribeTrackHistory: (
		vehicleId: string,
		startISO: string,
		endISO: string,
		cb: (data: TrailHistoryPoint[]) => void,
	) => () => void;
	/** Reverse-geocodes a coordinate pair. Optional — defaults to the library's `useLocationName`. */
	resolveLocationName?: (lat: number, lng: number) => Promise<string>;
};

/**
 * The raw per-vehicle feed shape `telemetry-page.tsx` maps into `TrackingRecord[]`. Redeclared from the
 * apps' root-level `types/fleet.ts` (identical in both apps).
 */
export type RawVehicle = {
	id: string;
	plate_number: string;
	alias: string;
	make: string;
	vehicle_trackings: Array<{
		id: string;
		vehicle_id: string;
		latitude: number;
		longitude: number;
		speed: number;
		status: string;
		acc_status: string;
		tracker_oil: string;
		gps_time: string;
		hb_time: string;
		imei: string;
		direction: string;
		customer_name: string | null;
		[key: string]: any;
	}>;
};

export type { TrackingRecord };
