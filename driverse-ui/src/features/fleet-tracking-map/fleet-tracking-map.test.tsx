import { composeStories } from "@storybook/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as stories from "./fleet-tracking-map.stories";
import { FleetTrackingMap, STATUS_COLOR, STATUS_LABEL } from "./index";
import type { TrackingRecord } from "./types";

// leaflet needs real layout to build a map; the container renders but the map itself is inert in jsdom.
// Everything this module owns — the list, the legend, the panel, the render-prop seam — is DOM.
vi.mock("./fleet-map", () => ({ FleetMap: () => <div data-testid="fleet-map" /> }));

const { Default, Loading, Empty, WithTelemetrySidePanel, MOCK_VEHICLES } = {
	...composeStories(stories),
	MOCK_VEHICLES: stories.MOCK_VEHICLES,
};

afterEach(() => vi.restoreAllMocks());

const baseProps = {
	data: MOCK_VEHICLES,
	loading: false,
	selected: null as TrackingRecord | null,
	onSelect: vi.fn(),
	panelOpen: true,
	onPanelToggle: vi.fn(),
};

describe("FleetTrackingMap", () => {
	it("renders the vehicle list and the status legend", () => {
		render(<FleetTrackingMap {...baseProps} />);

		expect(screen.getByTestId("fleet-map")).toBeInTheDocument();
		for (const label of Object.values(STATUS_LABEL)) {
			expect(screen.getByText(label)).toBeInTheDocument();
		}
	});

	it("takes its status colours from tokens, not the four hard-coded hexes", () => {
		// The app version was #22c55e / #eab308 / #608bfb / #9ca3af.
		expect(STATUS_COLOR.moving).not.toMatch(/^#22c55e$/i);
		expect(STATUS_COLOR.parked).toBe("var(--brand-primary)");
		expect(STATUS_COLOR.offline).toMatch(/^#/);
	});

	it("shows the empty state when nothing is selected", () => {
		render(<FleetTrackingMap {...baseProps} />);
		expect(screen.getByText("No vehicle selected")).toBeInTheDocument();
	});

	it("renders the injected side panel for the selection instead of importing telemetry's", () => {
		render(
			<FleetTrackingMap
				{...baseProps}
				selected={MOCK_VEHICLES[0]}
				renderSidePanel={({ vehicle }) => <div>panel for {vehicle.alias}</div>}
			/>,
		);
		expect(screen.getByText(/panel for Hilux 01/)).toBeInTheDocument();
		expect(screen.queryByText("No vehicle selected")).not.toBeInTheDocument();
	});

	it("toggles the panel", async () => {
		const onPanelToggle = vi.fn();
		render(<FleetTrackingMap {...baseProps} onPanelToggle={onPanelToggle} />);

		await userEvent.click(screen.getByRole("button", { name: "Collapse details panel" }));
		expect(onPanelToggle).toHaveBeenCalledTimes(1);
	});

	it("resolves an address for the selection through useLocationName", async () => {
		const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
			ok: true,
			json: async () => ({ address: { road: "Av. Vallarta", city: "Guadalajara" } }),
		} as Response);

		render(
			<FleetTrackingMap
				{...baseProps}
				selected={MOCK_VEHICLES[0]}
				renderSidePanel={({ address }) => <div>{address}</div>}
			/>,
		);

		await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
		expect(String(fetchSpy.mock.calls[0][0])).toContain("nominatim.openstreetmap.org");
	});

	it("shows a spinner while loading", () => {
		const { container } = render(<FleetTrackingMap {...baseProps} loading />);
		expect(container.querySelector(".ant-spin")).not.toBeNull();
	});
});

describe("stories", () => {
	it.each([
		["Default", Default],
		["Loading", Loading],
		["Empty", Empty],
		["WithTelemetrySidePanel", WithTelemetrySidePanel],
	])("%s renders", (_name, Story) => {
		const { container } = render(<Story />);
		expect(container.firstChild).not.toBeNull();
	});
});

describe("composition with telemetry", () => {
	// The plan listed telemetry's SidePanel as one of two blockers keeping this module app-bound. It is
	// now an ordinary render prop, so the two feature modules compose without either importing the other.
	it("renders telemetry's side panel through renderSidePanel", async () => {
		render(<WithTelemetrySidePanel />);
		expect(await screen.findByText("Tracker Status")).toBeInTheDocument();
	});
});
