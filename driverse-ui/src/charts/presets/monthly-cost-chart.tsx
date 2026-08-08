/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/charts/monthly-cost-chart.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no maintenance module. Already fully prop-driven — it takes
 *        plain arrays/counts and imports nothing but antd, react-apexcharts and apexcharts — so it
 *        lifts verbatim with no decoupling. Ships under the "./charts" subpath as a preset, since
 *        the styling and option sets are Driverse-specific rather than generic chart primitives.
 */

import { Card } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface MonthlyCostChartProps {
	data?: Array<{
		month_start: string;
		month_label: string;
		year: number;
		month_number: number;
		completed_count: number;
		actual_cost: number | null;
		estimated_cost: number | null;
	}>;
}

export const MonthlyCostChart = ({ data = [] }: MonthlyCostChartProps) => {
	const currentMonth = new Date().getMonth();
	const categories: string[] = [];
	const actualCosts = new Array(currentMonth + 1).fill(0);
	const estimatedCosts = new Array(currentMonth + 1).fill(0);
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

	for (let i = 0; i <= currentMonth; i++) {
		categories.push(monthNames[i]);
	}

	for (const item of data) {
		const monthIndex = categories.indexOf(item.month_label);
		if (monthIndex >= 0 && monthIndex <= currentMonth) {
			if (item.actual_cost) actualCosts[monthIndex] += item.actual_cost;
			if (item.estimated_cost) estimatedCosts[monthIndex] += item.estimated_cost;
		}
	}

	const options: ApexOptions = {
		chart: {
			type: "bar",
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				horizontal: false,
				columnWidth: "40%",
				borderRadius: 4,
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			show: true,
			width: 2,
			colors: ["transparent"],
		},
		xaxis: {
			categories,
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			labels: {
				formatter: (val) => {
					return `$${val.toLocaleString()}`;
				},
			},
		},
		fill: {
			opacity: 1,
		},
		colors: ["#3b82f6", "#e5e7eb"],
		legend: {
			position: "top",
			horizontalAlign: "left",
			markers: {
				shape: "square",
				size: 14,
			},
		},
	};

	const series = [
		{
			name: "Actual",
			data: actualCosts,
		},
		{
			name: "Estimated",
			data: estimatedCosts,
		},
	];

	return (
		<Card className="flex-1 shadow-sm border-gray-100 rounded-xl" bodyStyle={{ padding: "24px" }}>
			<h3 className="text-base font-semibold text-gray-800 mb-6">Monthly Maintenance Cost</h3>
			<div style={{ height: "350px" }}>
				<ReactApexChart options={options} series={series} type="bar" height="100%" />
			</div>
		</Card>
	);
};
