/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/weekly-activity/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/weekly-activity/index.tsx
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

const WeeklyActivity = ({ loading, t = defaultT }: Props) => {
	const options: ApexOptions = {
		chart: {
			type: "bar",
			toolbar: { show: false },
			background: "transparent",
		},
		plotOptions: {
			bar: {
				borderRadius: 4,
				columnWidth: "55%",
				distributed: false,
			},
		},
		colors: ["#008FFB"],
		dataLabels: { enabled: false },
		grid: {
			borderColor: "#e8e8e8",
			xaxis: { lines: { show: false } },
			yaxis: { lines: { show: true } },
			padding: { left: 0, right: 0 },
		},
		xaxis: {
			categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
			labels: {
				style: { colors: "#aaa", fontSize: "11px" },
				rotate: -45,
			},
			axisBorder: { show: false },
			axisTicks: { show: false },
		},
		yaxis: {
			min: 0,
			max: 80,
			tickAmount: 4,
			labels: {
				style: { colors: "#aaa", fontSize: "11px" },
			},
		},
		tooltip: {
			theme: "light",
			y: { formatter: (val: number) => `${val} trips` },
		},
		legend: { show: false },
	};

	const series = [
		{
			name: "Trips",
			data: [35, 42, 60, 65, 30, 28, 22],
		},
	];

	return (
		<Card className="flex-col items-start min-h-[400px]">
			<header className="self-start w-full">
				<Typography.Title level={5}>{t("Weekly Activity")}</Typography.Title>
				<p className="text-gray-600 text-sm -mt-2">Trips and distance traveled</p>
			</header>

			{loading ? (
				<div className="flex items-center justify-center h-[280px] w-full">
					<Spin />
				</div>
			) : (
				<div className="w-full">
					<ReactApexChart options={options} series={series} type="bar" width="100%" height={320} />
				</div>
			)}
		</Card>
	);
};

export default WeeklyActivity;
