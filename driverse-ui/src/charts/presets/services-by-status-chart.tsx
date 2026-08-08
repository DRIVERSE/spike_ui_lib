/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/charts/services-by-status-chart.tsx
 * @status adopted-B
 * @notes Business-only; Autocredit has no maintenance module. Already fully prop-driven — it takes
 *        plain arrays/counts and imports nothing but antd, react-apexcharts and apexcharts — so it
 *        lifts verbatim with no decoupling. Ships under the "./charts" subpath as a preset, since
 *        the styling and option sets are Driverse-specific rather than generic chart primitives.
 */

import { Card } from "antd";
import type { ApexOptions } from "apexcharts";
import type { FC } from "react";
import ReactApexChart from "react-apexcharts";

/* -------------------------------------------------------------------------- */
/*                         Services by Status Chart                           */
/* -------------------------------------------------------------------------- */
export const ServicesByStatusChart: FC<{ counts: Record<string, number> }> = ({ counts }) => {
	const total = counts.inProgress + counts.upcoming + counts.overdue;
	const inCondition = total === 0 ? 1 : 0;
	if (total === 0) return null;

	const options: ApexOptions = {
		chart: { type: "donut" },
		labels: ["In Progress", "Upcoming", "Overdue", "In Condition"],
		colors: ["#3b82f6", "#f59e0b", "#ef4444", "#22c55e"],
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: true,
							label: "Total",
							color: "#6b7280",
							formatter: (w) => w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0),
						},
					},
				},
			},
		},
		legend: {
			position: "top",
			horizontalAlign: "left",
			markers: { size: 8 },
			fontSize: "8px",
		},
		stroke: { width: 0 },
	};

	return (
		<Card className="shadow-sm border-gray-100 rounded-xl" bodyStyle={{ padding: "24px" }} style={{ minWidth: 300 }}>
			<h3 className="text-base font-medium text-gray-800 mb-4">Services by Status</h3>
			<ReactApexChart
				options={options}
				series={[counts.inProgress, counts.upcoming, counts.overdue, inCondition]}
				type="donut"
				width={300}
			/>
		</Card>
	);
};
