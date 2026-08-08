import { TelemetryProvider, TelemetrySidePanel } from "@/features/telemetry";
import { mockTelemetryDataSource } from "@/features/telemetry/telemetry.stories";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FleetTrackingMap } from "./index";
import type { TrackingRecord } from "./types";

/** Mock tracker feed — the shape the apps' GraphQL subscription pushes, minus the backend. */
export const MOCK_VEHICLES: TrackingRecord[] = [
	{
		id: "1",
		tracking_id: "t1",
		vehicle_id: "v1",
		plate_number: "ABC-123",
		alias: "Hilux 01",
		make: "Toyota",
		latitude: 20.6597,
		longitude: -103.3496,
		speed: 48,
		status: "1",
		acc_status: "1",
		tracker_oil: "ok",
		gps_time: "2026-08-07T12:00:00Z",
		hb_time: "2026-08-07T12:00:05Z",
		imei: "111",
		direction: "90",
		customer_name: "Ada Lovelace",
	},
	{
		id: "2",
		tracking_id: "t2",
		vehicle_id: "v2",
		plate_number: "XYZ-987",
		alias: "Ranger 02",
		make: "Ford",
		latitude: 20.68,
		longitude: -103.37,
		speed: 0,
		status: "1",
		acc_status: "0",
		tracker_oil: "ok",
		gps_time: "2026-08-07T11:58:00Z",
		hb_time: "2026-08-07T11:58:03Z",
		imei: "222",
		direction: "180",
		customer_name: "Alan Turing",
	},
	{
		id: "3",
		tracking_id: "t3",
		vehicle_id: "v3",
		plate_number: "OFF-000",
		alias: "Van 03",
		make: "Nissan",
		latitude: 20.63,
		longitude: -103.31,
		speed: 0,
		status: "0",
		acc_status: "0",
		tracker_oil: "ok",
		gps_time: "2026-08-07T09:00:00Z",
		hb_time: "2026-08-07T09:00:02Z",
		imei: "333",
		direction: "0",
		customer_name: null,
	},
];

function FleetTrackingMapDemo({ loading = false, empty = false }: { loading?: boolean; empty?: boolean }) {
	const [selected, setSelected] = useState<TrackingRecord | null>(null);
	const [panelOpen, setPanelOpen] = useState(true);

	return (
		<FleetTrackingMap
			data={empty ? [] : MOCK_VEHICLES}
			loading={loading}
			selected={selected}
			onSelect={setSelected}
			panelOpen={panelOpen}
			onPanelToggle={() => setPanelOpen((open) => !open)}
			// The apps inject telemetry's SidePanel here; the story shows the seam with a stand-in.
			renderSidePanel={({ vehicle, address }) => (
				<div style={{ paddingTop: 16 }}>
					<h3 style={{ fontSize: 16, fontWeight: 600 }}>{vehicle.alias}</h3>
					<p style={{ fontSize: 13, opacity: 0.7 }}>{vehicle.plate_number}</p>
					<p style={{ fontSize: 13 }}>{address || "Resolving address…"}</p>
					<p style={{ fontSize: 13 }}>{vehicle.speed} km/h</p>
				</div>
			)}
		/>
	);
}

/**
 * The seam closed for real. Before extraction, `fleet-tracking-map` reached five directories up into the
 * telemetry feature to import its `SidePanel`; that import is what made the map un-extractable on its own.
 * Now the two are independent modules that compose through `renderSidePanel`, and this story is the proof:
 * it is exactly the one-liner an app writes.
 */
function FleetTrackingMapWithTelemetryPanel() {
	const [selected, setSelected] = useState<TrackingRecord | null>(MOCK_VEHICLES[0]);
	const [panelOpen, setPanelOpen] = useState(true);

	return (
		<TelemetryProvider dataSource={mockTelemetryDataSource}>
			<FleetTrackingMap
				data={MOCK_VEHICLES}
				loading={false}
				selected={selected}
				onSelect={setSelected}
				panelOpen={panelOpen}
				onPanelToggle={() => setPanelOpen((open) => !open)}
				renderSidePanel={({ vehicle, address }) => (
					<TelemetrySidePanel data={vehicle} address={address} viewMode="today" />
				)}
			/>
		</TelemetryProvider>
	);
}

const meta = {
	title: "Features/FleetTrackingMap",
	component: FleetTrackingMapDemo,
	parameters: { layout: "fullscreen" },
} satisfies Meta<typeof FleetTrackingMapDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { loading: true } };
export const Empty: Story = { args: { empty: true } };

export const WithTelemetrySidePanel: StoryObj<typeof FleetTrackingMapWithTelemetryPanel> = {
	render: () => <FleetTrackingMapWithTelemetryPanel />,
};
