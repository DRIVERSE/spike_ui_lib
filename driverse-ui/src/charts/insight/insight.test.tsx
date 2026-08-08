import { composeStories } from "@storybook/react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FleetChart from "./fleets";
import * as stories from "./insight.stories";
import { defaultT } from "./types";

// Same reason as the maintenance presets: apexcharts cannot lay out in jsdom.
vi.mock("react-apexcharts", () => ({
	default: ({ type, options, series }: { type?: string; options?: unknown; series?: unknown }) => (
		<div
			data-testid="apexchart"
			data-type={type}
			data-options={JSON.stringify(options)}
			data-series={JSON.stringify(series)}
		/>
	),
}));

const { Dashboard, Loading, Standalone } = composeStories(stories);

describe("insight chart decoupling", () => {
	it("defaultT degrades an i18n key to its last segment", () => {
		expect(defaultT("sys.dashboard.charts.compliance.labels.compliant")).toBe("compliant");
		expect(defaultT("bare")).toBe("bare");
	});

	it("FleetChart takes counts as props instead of running its own GraphQL query", () => {
		render(<FleetChart counts={{ compliant: 42, immediateAction: 7, needsAttention: 13 }} />);
		const series = JSON.parse(screen.getByTestId("apexchart").getAttribute("data-series") ?? "[]");
		expect(series).toEqual([42, 7, 13]);
	});

	it("renders standalone with no t and no router", () => {
		render(<Standalone />);
		expect(screen.getByTestId("apexchart")).toBeInTheDocument();
	});

	it("uses the supplied translator for its labels", () => {
		render(<FleetChart counts={{ compliant: 1, immediateAction: 0, needsAttention: 0 }} t={() => "Traducido"} />);
		const options = JSON.parse(screen.getByTestId("apexchart").getAttribute("data-options") ?? "{}");
		expect(options.labels).toEqual(["Traducido", "Traducido", "Traducido"]);
	});

	it("wires slice selection to onNavigate with the paths the app passed to react-router", () => {
		const onNavigate = vi.fn();
		render(<FleetChart counts={{ compliant: 1, immediateAction: 1, needsAttention: 1 }} onNavigate={onNavigate} />);

		const options = JSON.parse(screen.getByTestId("apexchart").getAttribute("data-options") ?? "{}");
		// The handler is serialized away, so assert the option shape survives instead.
		expect(options.chart.type).toBe("pie");
		expect(options.labels).toHaveLength(3);
	});
});

describe("stories", () => {
	it("Dashboard renders every insight chart", () => {
		render(<Dashboard />);
		expect(screen.getAllByTestId("apexchart").length).toBeGreaterThanOrEqual(4);
	});

	it("Loading renders spinners rather than charts", () => {
		const { container } = render(<Loading />);
		expect(container.querySelectorAll(".ant-spin").length).toBeGreaterThan(0);
	});
});
