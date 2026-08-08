/** @lib-native */

import type { Meta, StoryObj } from "@storybook/react";
import { TelemetryProvider } from "./providers/telemetry-provider";
import { PlaybackControls } from "./shared/playback-controls";
import { Telemetry } from "./telemetry";
import type {
	MileageReportResponse,
	TelemetryDataSource,
	TrackHistoryMetrics,
	TrailHistoryPoint,
	TrailPoint,
	VehicleTrackingData,
} from "./types";

/** The "today" snapshot — what `subscribeVehicleTracking` hands back in the apps. */
export const MOCK_VEHICLE_DATA: VehicleTrackingData = {
	id: "v-1",
	imei: "865012345678901",
	latitude: 20.6597,
	longitude: -103.3496,
	speed: 42,
	status: "1",
	acc_status: "1",
	direction: "128",
	distance: "18400",
	current_mileage: "18420",
	tracker_oil: "63",
	gps_time: "2026-08-07T15:32:00Z",
	hb_time: "2026-08-07T15:32:05Z",
};

/** A short historical trail — the raw shape `subscribeTrackHistory` hands back. */
export const MOCK_TRAIL_HISTORY: TrailHistoryPoint[] = Array.from({ length: 12 }, (_, i) => ({
	latitude: 20.6597 + i * 0.001,
	longitude: -103.3496 - i * 0.0008,
	gps_time: new Date(Date.UTC(2026, 7, 7, 14, i * 5)).toISOString(),
	direction: String((i * 30) % 360),
	speed: 20 + ((i * 7) % 40),
	acc_status: "1",
}));

/** The same trail, already normalised into `TrailPoint`s — for `PlaybackControls`' own stories. */
export const MOCK_TRAIL: TrailPoint[] = MOCK_TRAIL_HISTORY.map((p) => ({
	lat: p.latitude,
	lng: p.longitude,
	time: p.gps_time,
	direction: p.direction,
	speed: p.speed,
	acc_status: p.acc_status,
}));

const MOCK_MILEAGE_REPORT: MileageReportResponse = {
	data: [],
	trips: [
		{
			imei: "865012345678901",
			startTime: "2026-08-07T13:10:00Z",
			endTime: "2026-08-07T13:42:00Z",
			startLat: "20.66",
			startLng: "-103.35",
			endLat: "20.7",
			endLng: "-103.4",
			elapsed: "1920",
			distance: "8400",
			avgSpeed: "26",
		},
	],
};

const MOCK_TRACK_HISTORY_METRICS: TrackHistoryMetrics = {
	message: "ok",
	status: 200,
	total_distance: 84.2,
	total_trip_time: 9600,
	number_of_trips: 4,
	average_speed: 31.5,
	maximum_speed: 76,
	start_date: "2026-08-05T00:00:00Z",
	end_date: "2026-08-07T23:59:59Z",
	timestamp: "2026-08-07T15:32:00Z",
};

/**
 * Exported so stories and tests share one fake transport. `resolveLocationName` resolves synchronously
 * instead of hitting Nominatim, which both keeps the stories deterministic and keeps the test suite from
 * making a real network call.
 */
export const mockTelemetryDataSource: TelemetryDataSource = {
	fetchMileageReport: async () => MOCK_MILEAGE_REPORT,
	fetchTrackHistoryMetrics: async () => MOCK_TRACK_HISTORY_METRICS,
	subscribeVehicleTracking: (_vehicleId, cb) => {
		cb(MOCK_VEHICLE_DATA);
		return () => {};
	},
	subscribeTrackHistory: (_vehicleId, _startISO, _endISO, cb) => {
		cb(MOCK_TRAIL_HISTORY);
		return () => {};
	},
	resolveLocationName: async () => "Av. Vallarta, Guadalajara",
};

function TelemetryDemo({ initialTab = "gps" as "gps" | "track" }: { initialTab?: "gps" | "track" }) {
	return (
		<TelemetryProvider dataSource={mockTelemetryDataSource}>
			<Telemetry data={MOCK_VEHICLE_DATA} vehicleId="v-1" initialTab={initialTab} />
		</TelemetryProvider>
	);
}

function TelemetryLoadingDemo() {
	const emptyDataSource: TelemetryDataSource = {
		...mockTelemetryDataSource,
		subscribeVehicleTracking: () => () => {},
		subscribeTrackHistory: () => () => {},
	};
	return (
		<TelemetryProvider dataSource={emptyDataSource}>
			{/* No vehicleId — useGpsDateFilter never resolves a subscription, so the module stays in its loading state. */}
			<Telemetry />
		</TelemetryProvider>
	);
}

const meta = {
	title: "Features/Telemetry",
	component: TelemetryDemo,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TelemetryDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The live/today view: map plus the flat metrics/device/location/today side panel. */
export const LiveGps: Story = {};

/** The historical playback view: date range filter, trail polyline and the tabbed history side panel. */
export const TrackingPlayback: Story = { args: { initialTab: "track" } };

/** Loading/empty state: no vehicle id resolves, so both views render their spinner/empty fallbacks. */
export const LoadingEmpty: StoryObj<typeof TelemetryLoadingDemo> = {
	render: () => <TelemetryLoadingDemo />,
};

/** `PlaybackControls` standalone, default (tracking-gps) rendering — Minimize button, Start/End labels. */
export const PlaybackControlsDefault: StoryObj<typeof PlaybackControls> = {
	render: () => (
		<div style={{ maxWidth: 720 }}>
			<PlaybackControls
				trail={MOCK_TRAIL}
				playbackIndex={4}
				isPlaying={false}
				playbackSpeed={4}
				isMinimized={false}
				onTogglePlay={() => {}}
				onSeek={() => {}}
				onCycleSpeed={() => {}}
				onToggleMinimize={() => {}}
			/>
		</div>
	),
};

/**
 * `PlaybackControls` standalone with the gps variant's extras restored — Exit button, skip-to-start /
 * skip-to-end, and the header current/total timestamp readout. See finding 2 in the module README.
 */
export const PlaybackControlsExtended: StoryObj<typeof PlaybackControls> = {
	render: () => (
		<div style={{ maxWidth: 720 }}>
			<PlaybackControls
				trail={MOCK_TRAIL}
				playbackIndex={4}
				isPlaying
				playbackSpeed={1}
				isMinimized={false}
				onTogglePlay={() => {}}
				onSeek={() => {}}
				onCycleSpeed={() => {}}
				onToggleMinimize={() => {}}
				onExit={() => {}}
				onSkipToStart={() => {}}
				onSkipToEnd={() => {}}
			/>
		</div>
	),
};
