/** @lib-native */

import { composeStories } from "@storybook/react";
import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePlayback } from "./shared/use-playback";
import * as stories from "./telemetry.stories";
import type { TrailPoint } from "./types";

// Leaflet needs real layout to build a map; both views render it as an inert child in jsdom, so the map
// itself is mocked here, matching fleet-tracking-map.test.tsx's `vi.mock("./fleet-map", ...)`. Everything
// this module owns around it — the tab strip, the side panels, the date filter, playback state — is DOM.
vi.mock("./gps/live-map", () => ({ LiveMap: () => <div data-testid="gps-live-map" /> }));
vi.mock("./tracking-gps/live-map", () => ({ LiveMap: () => <div data-testid="tracking-live-map" /> }));

const { LiveGps, TrackingPlayback, LoadingEmpty, PlaybackControlsDefault, PlaybackControlsExtended } =
	composeStories(stories);

afterEach(() => {
	vi.restoreAllMocks();
	vi.useRealTimers();
});

describe("stories", () => {
	it.each([
		["LiveGps", LiveGps],
		["TrackingPlayback", TrackingPlayback],
		["LoadingEmpty", LoadingEmpty],
		["PlaybackControlsDefault", PlaybackControlsDefault],
		["PlaybackControlsExtended", PlaybackControlsExtended],
	])("%s renders", async (_name, Story) => {
		const { container } = render(<Story />);
		expect(container.firstChild).not.toBeNull();
	});
});

describe("Telemetry", () => {
	it("shows the live view's side panel by default", async () => {
		render(<LiveGps />);
		expect(await screen.findByTestId("gps-live-map")).toBeInTheDocument();
		expect(screen.getByText("Tracker Status")).toBeInTheDocument();
	});

	it("switches from the live view to the tracking view on tab click", async () => {
		render(<LiveGps />);
		expect(screen.getByText("Tracker Status")).toBeInTheDocument();
		expect(screen.queryByText("Load Tracks")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("tab", { name: "Tracking" }));

		expect(await screen.findByTestId("tracking-live-map")).toBeInTheDocument();
		expect(screen.getByText("Load Tracks")).toBeInTheDocument();
		// The gps view's side panel is unmounted entirely, not just hidden — PillTabs only renders the
		// active tab's children.
		expect(screen.queryByText("Tracker Status")).not.toBeInTheDocument();
	});

	it("opens straight on the tracking tab via initialTab", async () => {
		render(<TrackingPlayback />);
		expect(await screen.findByTestId("tracking-live-map")).toBeInTheDocument();
		expect(screen.getByText("Load Tracks")).toBeInTheDocument();
	});

	it("calls subscribeVehicleTracking on the injected data source with the vehicle id", () => {
		const spy = vi.spyOn(stories.mockTelemetryDataSource, "subscribeVehicleTracking");
		render(<LiveGps />);
		expect(spy).toHaveBeenCalledWith("v-1", expect.any(Function));
	});

	it("calls subscribeTrackHistory on the injected data source with the vehicle id and date range", () => {
		const spy = vi.spyOn(stories.mockTelemetryDataSource, "subscribeTrackHistory");
		render(<LiveGps />);
		expect(spy).toHaveBeenCalledWith("v-1", expect.any(String), expect.any(String), expect.any(Function));
	});
});

describe("usePlayback", () => {
	const trail: TrailPoint[] = Array.from({ length: 5 }, (_, i) => ({
		lat: 20 + i * 0.01,
		lng: -103 - i * 0.01,
		time: new Date(Date.UTC(2026, 7, 7, 12, i)).toISOString(),
	}));

	it("advances the playback index over time once playing", () => {
		vi.useFakeTimers();
		const onLocationChange = vi.fn();

		const { result } = renderHook(() =>
			usePlayback({
				trail,
				onLocationChange,
				onRotationChange: vi.fn(),
				onLocationNameUpdate: vi.fn(),
			}),
		);

		act(() => result.current.enterPlayback());
		expect(result.current.playbackIndex).toBe(0);

		act(() => result.current.togglePlayback());
		expect(result.current.isPlaying).toBe(true);

		act(() => {
			vi.advanceTimersByTime(2500);
		});

		expect(result.current.playbackIndex).toBeGreaterThan(0);
		expect(onLocationChange).toHaveBeenCalled();
	});

	it("stops playing once it reaches the end of the trail", () => {
		vi.useFakeTimers();

		const { result } = renderHook(() =>
			usePlayback({
				trail,
				onLocationChange: vi.fn(),
				onRotationChange: vi.fn(),
				onLocationNameUpdate: vi.fn(),
			}),
		);

		act(() => result.current.enterPlayback());
		act(() => result.current.togglePlayback());
		act(() => {
			vi.advanceTimersByTime(10_000);
		});

		expect(result.current.playbackIndex).toBe(trail.length - 1);
		expect(result.current.isPlaying).toBe(false);
	});
});

describe("PlaybackControls", () => {
	it("renders the extended controls only when their handlers are supplied", () => {
		render(<PlaybackControlsDefault />);
		expect(screen.queryByRole("button", { name: "Exit" })).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Minimize" })).toBeInTheDocument();
	});

	it("renders Exit, skip-to-start and skip-to-end when their handlers are supplied", () => {
		render(<PlaybackControlsExtended />);
		expect(screen.getByRole("button", { name: "Exit" })).toBeInTheDocument();
	});
});
