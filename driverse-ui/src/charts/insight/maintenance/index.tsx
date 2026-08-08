/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/maintenance/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/maintenance/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Icons render through the library's <Iconify>.
 */

import Card from "@/components/card";
import { Spin, Typography } from "antd";
import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { InsightChartCommonProps } from "../types";
import { defaultT } from "../types";

type Props = InsightChartCommonProps & {
	loading?: boolean;
	data?: any;
};

const Maintenance = ({ loading, data, t = defaultT }: Props) => {
	const scheduled = data?.scheduled_maintenance ?? 4;
	const completed = data?.completed_maintenance ?? 8;
	const overdue = data?.overdue_maintenance ?? 2;

	// Convert counts to percentages out of total for radial display
	const total = scheduled + completed + overdue || 1;
	const scheduledPct = Math.round((scheduled / total) * 100);
	const completedPct = Math.round((completed / total) * 100);
	const overduePct = Math.round((overdue / total) * 100);

	const options: ApexOptions = {
		chart: {
			type: "radialBar",
			background: "transparent",
			offsetY: -30,
		},
		colors: ["#5B8FF9", "#0bb980", "#f02124"],
		stroke: {
			lineCap: "round",
			width: 20,
		},
		plotOptions: {
			radialBar: {
				dataLabels: {
					name: {
						fontSize: "22px",
					},
					value: {
						fontSize: "16px",
						color: "#aaa",
					},
					total: {
						show: true,
						label: "Total",
						color: "#fff",
						fontSize: "14px",
						fontWeight: 600,
						formatter: () => `${scheduled + completed + overdue}`,
					},
				},
				hollow: {
					size: "38%",
				},
				track: {
					background: "#e8e8e8",
					strokeWidth: "97%",
				},
			},
		},
		labels: [`Scheduled (${scheduled})`, `Completed (${completed})`, `Overdue (${overdue})`],
		legend: {
			show: true,
			position: "bottom",
			horizontalAlign: "center",
			labels: { colors: "#000" },
			fontSize: "12px",
			markers: { size: 5, offsetX: -2 },
			itemMargin: { horizontal: 4, vertical: 0 },
			offsetY: -30,
		},
		tooltip: {
			theme: "dark",
			y: { formatter: (val: number) => `${val}%` },
		},
	};

	const series = [scheduledPct, completedPct, overduePct];

	return (
		<Card className="flex-col items-center min-h-[400px]">
			<header className="self-start">
				<Typography.Title level={5}>{t("Maintenance")}</Typography.Title>
				<p className="text-gray-600 text-sm -mt-2">Service status overview</p>
			</header>

			{loading ? (
				<div className="flex items-center justify-center h-[280px]">
					<Spin />
				</div>
			) : (
				<ReactApexChart options={options} series={series} type="radialBar" width={400} height={400} />
			)}
		</Card>
	);
};

export default Maintenance;
