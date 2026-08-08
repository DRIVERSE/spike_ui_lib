/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/chart/useChart.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/chart/useChart.ts
 * @status decoupled
 * @notes Byte-identical in both apps. Two changes:
 *        1. `useSettings().themeColorPresets` from the zustand store becomes `useTheme().colorPreset` —
 *           the same swap toast got, and the whole of this hook's app coupling.
 *        2. ramda's `mergeDeepRight` is inlined as a local deep merge with identical semantics (right
 *           operand wins; plain objects recurse, everything else replaces), so a chart consumer does not
 *           inherit a ramda peer for one call.
 *        The entire option set — colours, states, fill, stroke, grid, legend, plotOptions, the two
 *        responsive breakpoints — is otherwise verbatim.
 */

import { useTheme } from "@/theme/use-theme";
import { breakpointsTokens } from "@/tokens/breakpoints";
import { paletteColors, presetsColors } from "@/tokens/color";
import { removePx } from "@/tokens/css-var-utils";
import { themeVars } from "@/tokens/theme.css";
import type { ApexOptions } from "apexcharts";

type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
	typeof value === "object" && value !== null && !Array.isArray(value);

/** ramda's mergeDeepRight: recurse into plain objects, right operand wins for everything else. */
function mergeDeepRight(left: PlainObject, right: PlainObject): PlainObject {
	const result: PlainObject = { ...left };
	for (const [key, rightValue] of Object.entries(right)) {
		const leftValue = result[key];
		result[key] =
			isPlainObject(leftValue) && isPlainObject(rightValue) ? mergeDeepRight(leftValue, rightValue) : rightValue;
	}
	return result;
}

export default function useChart(options: ApexOptions) {
	const { colorPreset } = useTheme();

	const LABEL_TOTAL = {
		show: true,
		label: "Total",
		color: themeVars.colors.text.secondary,
		fontSize: themeVars.typography.fontSize.sm,
		lineHeight: themeVars.typography.lineHeight.tight,
	};

	const LABEL_VALUE = {
		offsetY: 8,
		color: themeVars.colors.text.primary,
		fontSize: themeVars.typography.fontSize.sm,
		lineHeight: themeVars.typography.lineHeight.tight,
	};

	const baseOptions: ApexOptions = {
		// Colors
		colors: [
			presetsColors[colorPreset].default,

			paletteColors.info.default,
			paletteColors.warning.default,
			paletteColors.error.default,
			paletteColors.success.default,

			paletteColors.warning.light,
			paletteColors.info.light,
			paletteColors.error.light,
			paletteColors.success.light,
		],

		// Chart
		chart: {
			toolbar: { show: false },
			zoom: { enabled: false },
			foreColor: themeVars.colors.text.disabled,
			fontFamily: themeVars.typography.fontFamily.primary,
		},

		// States
		states: {
			hover: {
				filter: {
					type: "lighten",
				},
			},
			active: {
				filter: {
					type: "darken",
				},
			},
		},

		// Fill
		fill: {
			opacity: 1,
			gradient: {
				type: "vertical",
				shadeIntensity: 0,
				opacityFrom: 0.4,
				opacityTo: 0,
				stops: [0, 100],
			},
		},

		// Datalabels
		dataLabels: {
			enabled: false,
		},

		// Stroke
		stroke: {
			width: 3,
			curve: "smooth",
			lineCap: "round",
		},

		// Grid
		grid: {
			strokeDashArray: 3,
			borderColor: themeVars.colors.background.neutral,
			xaxis: {
				lines: {
					show: false,
				},
			},
		},

		// Xaxis
		xaxis: {
			axisBorder: { show: false },
			axisTicks: { show: false },
		},

		// Markers
		markers: {
			size: 0,
		},

		// Tooltip
		tooltip: {
			theme: undefined,
			x: {
				show: true,
			},
		},

		// Legend
		legend: {
			show: true,
			fontSize: themeVars.typography.fontSize.sm,
			position: "top",
			horizontalAlign: "right",
			markers: {
				strokeWidth: 0,
			},
			fontWeight: 500,
			itemMargin: {
				horizontal: 8,
			},
			labels: {
				colors: themeVars.colors.text.primary,
			},
		},

		// plotOptions
		plotOptions: {
			// Bar
			bar: {
				borderRadius: 4,
				columnWidth: "28%",
				borderRadiusApplication: "end",
				borderRadiusWhenStacked: "last",
			},

			// Pie + Donut
			pie: {
				donut: {
					labels: {
						show: true,
						value: LABEL_VALUE,
						total: LABEL_TOTAL,
					},
				},
			},

			// Radialbar
			radialBar: {
				track: {
					strokeWidth: "100%",
				},
				dataLabels: {
					value: LABEL_VALUE,
					total: LABEL_TOTAL,
				},
			},

			// Radar
			radar: {
				polygons: {
					fill: { colors: ["transparent"] },
					strokeColors: themeVars.colors.background.neutral,
					connectorColors: themeVars.colors.background.neutral,
				},
			},

			// polarArea
			polarArea: {
				rings: {
					strokeColor: themeVars.colors.background.neutral,
				},
				spokes: {
					connectorColors: themeVars.colors.background.neutral,
				},
			},
		},

		// Responsive
		responsive: [
			{
				// sm
				breakpoint: removePx(breakpointsTokens.sm),
				options: {
					plotOptions: { bar: { columnWidth: "40%" } },
				},
			},
			{
				// md
				breakpoint: removePx(breakpointsTokens.md),
				options: {
					plotOptions: { bar: { columnWidth: "32%" } },
				},
			},
		],
	};

	return mergeDeepRight(baseOptions as PlainObject, options as PlainObject) as ApexOptions;
}
