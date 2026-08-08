/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/charts/top-vehicles-chart.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no maintenance module. Already fully prop-driven — it takes
 *        plain arrays/counts and imports nothing but antd, react-apexcharts and apexcharts — so it
 *        lifts verbatim with no decoupling. Ships under the "./charts" subpath as a preset, since
 *        the styling and option sets are Driverse-specific rather than generic chart primitives.
 */

import { Card } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";

interface TopVehiclesChartProps {
	data?: Array<{
		alias: string;
		actual_cost: number;
	}>;
}

export const TopVehiclesChart = ({ data = [] }: TopVehiclesChartProps) => {
	const categories = data.length > 0 ? data.map((item) => item.alias || "Unknown") : [""];
	const seriesData = data.length > 0 ? data.map((item) => item.actual_cost || 0) : [0];

	const options: ApexOptions = {
		chart: {
			type: "bar",
			toolbar: { show: false },
		},
		plotOptions: {
			bar: {
				horizontal: true,
				barHeight: "40%",
				borderRadius: 4,
			},
		},
		dataLabels: {
			enabled: false,
		},
		xaxis: {
			categories,
			axisBorder: { show: false },
			axisTicks: { show: false },
			labels: {
				formatter: (val) => `$${Number(val).toLocaleString()}`,
			},
		},
		grid: {
			xaxis: { lines: { show: true } },
			yaxis: { lines: { show: false } },
		},
		colors: ["#ef4444"],
	};

	const series = [
		{
			name: "Cost",
			data: seriesData,
		},
	];

	return (
		<Card className="flex-1 shadow-sm border-gray-100 rounded-xl" bodyStyle={{ padding: "24px" }}>
			<h3 className="text-base font-semibold text-gray-800 mb-6">Top Vehicles by Cost (YTD)</h3>
			<div style={{ height: "250px" }}>
				<ReactApexChart options={options} series={series} type="bar" height="100%" />
			</div>
		</Card>
	);
};
