import { UIThemeProvider } from "@/theme/theme-provider";
import { presetsColors } from "@/tokens/color";
import { ThemeColorPresets } from "@/tokens/enum";
import { composeStories } from "@storybook/react";
import { render, renderHook, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import * as stories from "./charts.stories";
import { CountBadge } from "./presets/count-badge";
import { StatCard } from "./presets/stat-card";
import { STATUS_CONFIG, StatusBadge } from "./presets/status-badge";
import useChart from "./use-chart";

// apexcharts measures real layout (getBBox, offsetWidth, legend geometry) and throws asynchronously in
// jsdom. The wrapper's job is composing options and series, so the renderer is stubbed and the composed
// props are asserted directly — the real renderer is exercised in the Storybook build.
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

const { Themed, MaintenancePresets, Badges } = composeStories(stories);

const wrapper =
	(colorPreset: ThemeColorPresets) =>
	({ children }: { children: ReactNode }) => <UIThemeProvider colorPreset={colorPreset}>{children}</UIThemeProvider>;

describe("useChart", () => {
	it("leads its colour ramp with the active theme preset, replacing the settings store", () => {
		const { result } = renderHook(() => useChart({}), { wrapper: wrapper(ThemeColorPresets.Purple) });
		expect(result.current.colors?.[0]).toBe(presetsColors[ThemeColorPresets.Purple].default);
	});

	it("ships the shared defaults both apps relied on", () => {
		const { result } = renderHook(() => useChart({}), { wrapper: wrapper(ThemeColorPresets.Default) });

		expect(result.current.chart?.toolbar?.show).toBe(false);
		expect(result.current.dataLabels?.enabled).toBe(false);
		expect(result.current.stroke?.curve).toBe("smooth");
		expect(result.current.plotOptions?.bar?.columnWidth).toBe("28%");
		// The two responsive breakpoints come from the token layer, not magic numbers.
		expect(result.current.responsive?.map((r) => r.breakpoint)).toEqual([576, 768]);
	});

	it("deep-merges caller options over the defaults, replacing ramda's mergeDeepRight", () => {
		const { result } = renderHook(
			() =>
				useChart({
					chart: { zoom: { enabled: true } },
					plotOptions: { bar: { columnWidth: "50%" } },
					xaxis: { categories: ["a", "b"] },
				}),
			{ wrapper: wrapper(ThemeColorPresets.Default) },
		);

		// Overridden leaf.
		expect(result.current.chart?.zoom?.enabled).toBe(true);
		// Sibling defaults survive the merge rather than being replaced wholesale.
		expect(result.current.chart?.toolbar?.show).toBe(false);
		expect(result.current.plotOptions?.bar?.columnWidth).toBe("50%");
		expect(result.current.plotOptions?.bar?.borderRadius).toBe(4);
		// Arrays replace, they do not concatenate.
		expect(result.current.xaxis && "categories" in result.current.xaxis && result.current.xaxis.categories).toEqual([
			"a",
			"b",
		]);
	});
});

describe("maintenance presets", () => {
	it("StatusBadge renders every documented status", () => {
		for (const status of Object.keys(STATUS_CONFIG) as (keyof typeof STATUS_CONFIG)[]) {
			const { unmount } = render(<StatusBadge status={status} />);
			expect(screen.getByText(STATUS_CONFIG[status].label)).toBeInTheDocument();
			unmount();
		}
	});

	it("CountBadge maps antd colour names onto the shared chip variants", () => {
		render(<CountBadge count={3} color="red" label="Overdue" textLabel="SERVICE" />);
		expect(screen.getByText("3")).toBeInTheDocument();
		// Pluralised because count !== 1.
		expect(screen.getByText("SERVICES")).toBeInTheDocument();
	});

	it("CountBadge keeps the singular label for a count of one", () => {
		render(<CountBadge count={1} color="green" label="Done" textLabel="ISSUE" />);
		expect(screen.getByText("ISSUE")).toBeInTheDocument();
	});

	it("StatCard shows a dash while loading", () => {
		const { rerender } = render(
			<StatCard label="Overdue" value={7} icon="lucide:clock" color="#f00" iconBg="bg-red-50" />,
		);
		expect(screen.getByText("7")).toBeInTheDocument();

		rerender(<StatCard label="Overdue" value={7} icon="lucide:clock" color="#f00" iconBg="bg-red-50" loading />);
		expect(screen.getByText("—")).toBeInTheDocument();
	});
});

describe("stories", () => {
	it.each([
		["Themed", Themed],
		["MaintenancePresets", MaintenancePresets],
		["Badges", Badges],
	])("%s renders", (_name, Story) => {
		const { container } = render(<Story />);
		expect(container.firstChild).not.toBeNull();
	});

	it("the Themed story feeds useChart's merged options into the renderer", () => {
		render(<Themed />);
		const chart = screen.getByTestId("apexchart");
		expect(chart).toHaveAttribute("data-type", "area");
		const options = JSON.parse(chart.getAttribute("data-options") ?? "{}");
		expect(options.xaxis.categories).toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun"]);
		expect(options.chart.toolbar.show).toBe(false);
	});

	it("renders one chart per maintenance preset", () => {
		render(<MaintenancePresets />);
		expect(screen.getAllByTestId("apexchart")).toHaveLength(7);
	});
});
