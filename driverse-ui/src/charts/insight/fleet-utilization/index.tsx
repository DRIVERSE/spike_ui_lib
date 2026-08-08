/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/fleet-utilization/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/fleet-utilization/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Icons render through the library's <Iconify>.
 */

import { Spin, Typography } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { InsightChartCommonProps } from "../types";
import { defaultT } from "../types";

import Card from "@/components/card";

type Props = InsightChartCommonProps & {
	loading?: boolean;
};

const FleetUtilization = ({ loading, t = defaultT }: Props) => {
	const options: ApexOptions = {
		chart: {
			type: "area",
			toolbar: { show: false },
			zoom: { enabled: false },
			background: "transparent",
		},
		colors: ["#008FFB"],
		stroke: {
			curve: "smooth",
			width: 2,
		},
		fill: {
			type: "gradient",
			gradient: {
				shadeIntensity: 1,
				opacityFrom: 0.85,
				opacityTo: 0.8,
				stops: [0, 100],
			},
		},
		dataLabels: { enabled: false },
		markers: { size: 0 },
		grid: {
			borderColor: "#e8e8e8",
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
			padding: { left: 0, right: 0 },
		},
		xaxis: {
			type: "category",
			categories: ["14 Nov", "17 Nov", "20 Nov", "23 Nov", "26 Nov", "29 Nov", "02 Dec", "05 Dec"],
			labels: {
				style: { colors: "#000", fontSize: "12px" },
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			min: 60,
			max: 100,
			tickAmount: 4,
			labels: {
				style: { colors: "#000", fontSize: "12px" },
				formatter: (val: number) => `${val}%`,
			},
		},
		tooltip: {
			theme: "light",
			y: { formatter: (val: number) => `${val}%` },
		},
		legend: { show: false },
	};

	const series = [
		{
			name: "Utilization",
			data: [70, 72, 75, 74, 78, 82, 80, 90],
		},
	];

	return (
		<Card className="flex-col items-start min-h-[400px]">
			<header className="self-start w-full">
				<Typography.Title level={5}>{t("Fleet Utilization")}</Typography.Title>
				<p className="text-gray-600 text-sm -mt-2">Price Movements</p>
			</header>

			{loading ? (
				<div className="flex items-center justify-center h-[280px] w-full">
					<Spin />
				</div>
			) : (
				<div className="w-full">
					<ReactApexChart options={options} series={series} type="area" width="100%" height={350} />
				</div>
			)}
		</Card>
	);
};

export default FleetUtilization;
