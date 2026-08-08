/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/revenue/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/revenue/index.tsx
 * @status adopted-B
 * @notes A and B diverge here; B adopted as the newer implementation.
 *        Coupling stripped: see the module note in index.ts — data arrives as props, and the
 *        `useNavigate`/`useTranslation`/`useGetCompliances` calls the app version made are gone.
 */

import { Spin, Typography } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { InsightChartCommonProps } from "../types";
import { defaultT } from "../types";

import Card from "@/components/card";

type Props = InsightChartCommonProps & {
	loading?: boolean;
	data?: any;
};

// Order here must stay in sync with `categories` / `insuranceData` below —
// index 0 = Active, 1 = Expiring, 2 = Expired, 3 = Missing.
const INSURANCE_TABS = ["active", "expiring", "expired", "missing"] as const;

const RevenueChart = ({ loading, data, t = defaultT, onNavigate }: Props) => {
	const options = {
		chart: {
			height: 350,
			type: "bar",
			zoom: {
				enabled: false,
			},
			toolbar: {
				show: false,
			},
			events: {
				dataPointSelection: (_event: unknown, _chartContext: unknown, config: { dataPointIndex: number }) => {
					const tab = INSURANCE_TABS[config.dataPointIndex];
					if (tab) {
						onNavigate?.(`/vehicle-park/insurance?tab=${tab}`);
					}
				},
			},
		},
		plotOptions: {
			bar: {
				borderRadius: 10,
				columnWidth: "50%",
				distributed: true,
			},
		},
		dataLabels: {
			enabled: false,
		},
		stroke: {
			width: 0,
		},
		grid: {
			row: {
				colors: ["#fff", "#f2f2f2"],
			},
		},
		xaxis: {
			categories: [
				t("sys.dashboard.charts.insurance.categories.active"),
				t("sys.dashboard.charts.insurance.categories.expiring"),
				t("sys.dashboard.charts.insurance.categories.expired"),
				t("sys.dashboard.charts.insurance.categories.missing"),
			],
			labels: {
				rotate: -45,
				style: {
					colors: ["#000", "#000", "#000", "#000"], // label text color
					fontSize: "12px",
				},
			},
			axisTicks: {
				show: false,
			},
			axisBorder: {
				show: false,
			},
		},
		yaxis: {
			title: {
				text: t("sys.dashboard.charts.insurance.yaxis_title"),
			},
		},
		fill: {
			type: "solid",
			colors: ["#12a138", "#1890ff", "#faad14", "#FF0000"],
		},
		legend: {
			show: false, // Removes color-coded legend under the chart
		},
		states: {
			active: {
				filter: {
					type: "none",
				},
			},
			hover: {
				filter: {
					type: "none",
				},
			},
		},
	};

	const insuranceData = [
		data?.active_insurance?.aggregate?.count || 0,
		data?.expiring_insurance?.aggregate?.count || 0,
		data?.expired_insurance?.aggregate?.count || 0,
		data?.clients?.[0]?.missing_insurance?.aggregate?.count || 0,
	];

	const series = [
		{
			name: t("sys.dashboard.charts.insurance.yaxis_title"),
			data: insuranceData,
		},
	];
	return (
		<Card className="flex-col w-full min-h-[400px]">
			<header className="self-start">
				<Typography.Title level={5}> {t("sys.dashboard.charts.insurance.title")}</Typography.Title>
			</header>
			<main className="w-full">
				{loading ? (
					<Spin />
				) : (
					<ReactApexChart options={options as ApexOptions} series={series} type="bar" height={300} />
				)}
			</main>
		</Card>
	);
};

export default RevenueChart;
