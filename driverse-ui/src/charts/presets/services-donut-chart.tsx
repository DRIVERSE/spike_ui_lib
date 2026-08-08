/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/charts/services-donut-chart.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no maintenance module. Already fully prop-driven — it takes
 *        plain arrays/counts and imports nothing but antd, react-apexcharts and apexcharts — so it
 *        lifts verbatim with no decoupling. Ships under the "./charts" subpath as a preset, since
 *        the styling and option sets are Driverse-specific rather than generic chart primitives.
 */

import { Card } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface ServicesDonutChartProps {
	completed?: number;
	scheduled?: number;
}

export const ServicesDonutChart = ({ completed = 0, scheduled = 0 }: ServicesDonutChartProps) => {
	const options: ApexOptions = {
		chart: {
			type: "donut",
		},
		labels: ["Completed", "Scheduled"],
		colors: ["#10b981", "#f59e0b"],
		dataLabels: {
			enabled: false,
		},
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						name: {
							show: true,
							fontSize: "14px",
							color: "#6b7280",
						},
						value: {
							show: true,
							fontSize: "24px",
							fontWeight: 600,
							color: "#111827",
						},
						total: {
							show: true,
							label: "Total services",
							color: "#6b7280",
							formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
						},
					},
				},
			},
		},
		legend: {
			position: "bottom",
			horizontalAlign: "center",
			formatter: (seriesName, opts) => {
				const val = opts.w.globals.seriesTotals[opts.seriesIndex];
				const total = opts.w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
				const percentage = total === 0 ? 0 : Math.round((val / total) * 100);
				return `<div class="flex justify-between w-full min-w-[200px] text-sm">
          <span class="text-gray-600">${seriesName}</span>
          <span class="font-semibold">${val} · ${percentage}%</span>
        </div>`;
			},
			markers: {
				shape: "square",
				size: 14,
			},
			itemMargin: {
				vertical: 8,
			},
		},
	};

	const series = [completed, scheduled];

	return (
		<Card
			className="flex-1 shadow-sm border-gray-100 rounded-xl"
			bodyStyle={{ padding: "24px", display: "flex", flexDirection: "column" }}
		>
			<h3 className="text-base font-semibold text-gray-800 mb-6">Services Completed vs Scheduled (YTD)</h3>
			<div className="flex-1 flex items-center justify-center" style={{ minHeight: "350px" }}>
				<ReactApexChart options={options} series={series} type="donut" width="380" />
			</div>
		</Card>
	);
};
