/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/fleets/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/fleets/index.tsx
 * @status adopted-B
 * @notes A and B diverge here; B adopted as the newer implementation.
 *        Coupling stripped: see the module note in index.ts — data arrives as props, and the
 *        `useNavigate`/`useTranslation`/`useGetCompliances` calls the app version made are gone.
 */

import { Spin, Typography } from "antd";
import type { ApexOptions } from "apexcharts";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { InsightChartCommonProps } from "../types";
import { defaultT } from "../types";

import Card from "@/components/card";

type Props = InsightChartCommonProps & {
	loading?: boolean;
	/** Vehicle counts per overall compliance status. The app derived these from a GraphQL query. */
	counts?: { compliant: number; immediateAction: number; needsAttention: number };
};

const OVERVIEW_SUBTABS = ["compliant", "immediate-action", "attention"] as const;

const FleetChart = ({ loading, counts, t = defaultT, onNavigate }: Props) => {
	const { compliant = 0, immediateAction = 0, needsAttention = 0 } = counts ?? {};

	const chartData = useMemo(() => {
		return {
			series: [compliant, immediateAction, needsAttention],
			options: {
				chart: {
					width: 500,
					type: "pie",
					events: {
						dataPointSelection: (_event: unknown, _chartContext: unknown, config: { dataPointIndex: number }) => {
							const subtab = OVERVIEW_SUBTABS[config.dataPointIndex];
							if (subtab) {
								onNavigate?.(`/vehicle-park/compliance?tab=overview&subtab=${subtab}`);
							}
						},
					},
				},
				labels: [
					t("sys.dashboard.charts.compliance.labels.compliant"),
					t("sys.dashboard.charts.compliance.labels.immediate_action"),
					t("sys.dashboard.charts.compliance.labels.needs_attention"),
				],
				legend: {
					position: "bottom",
				},
				dataLabels: {
					enabled: true,
					formatter: (val: number) => `${val.toFixed(1)}%`,
					style: {
						fontSize: "14px",
						fontFamily: "Helvetica, Arial, sans-serif",
						fontWeight: "bold",
						colors: ["#FFF"],
						textShadow: "none",
					},
					dropShadow: {
						enabled: false,
					},
				},
				plotOptions: {
					pie: {
						dataLabels: {
							offset: -5,
						},
					},
				},
				colors: ["#10b981", "#ef4444", "#f59e0b"],
				stroke: {
					width: 2,
					colors: ["#FFF"],
				},
				states: {
					active: {
						filter: {
							type: "none",
						},
					},
				},
				responsive: [
					{
						breakpoint: 480,
						options: {
							chart: {
								width: 200,
							},
						},
					},
				],
			} as ApexOptions,
		};
	}, [compliant, immediateAction, needsAttention, onNavigate, t]);

	return (
		<Card className="flex-col items-center min-h-[400px]">
			<header className="self-start">
				<Typography.Title level={5}>{t("sys.dashboard.charts.compliance.title")}</Typography.Title>
			</header>
			<main className="w-full flex justify-center">
				{loading ? (
					<Spin />
				) : (
					<ReactApexChart options={chartData.options} series={chartData.series} type="pie" width={380} />
				)}
			</main>
		</Card>
	);
};

export default FleetChart;
