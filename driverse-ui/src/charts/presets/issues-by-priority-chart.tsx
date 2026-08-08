/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/charts/issues-by-priority-chart.tsx
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

export const IssuesByPriorityChart: FC<{ counts: { critical: number; high: number; medium: number; low: number } }> = ({
	counts,
}) => {
	const options: ApexOptions = {
		chart: { type: "donut" },
		labels: ["Critical", "High", "Medium", "Low"],
		colors: ["#ef4444", "#facc15", "#3b82f6", "#d1d5db"],
		dataLabels: { enabled: false },
		plotOptions: {
			pie: {
				donut: {
					size: "70%",
					labels: {
						show: true,
						total: {
							show: false, // The mockup shows an empty center
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
			itemMargin: { horizontal: 8, vertical: 0 },
		},
		stroke: { width: 0 },
	};

	return (
		<Card className="shadow-sm border-gray-100 rounded-xl" bodyStyle={{ padding: "24px" }} style={{ minWidth: 300 }}>
			<h3 className="text-base font-medium text-gray-800 mb-4">Issues by Priority</h3>
			<ReactApexChart
				options={options}
				series={[counts.critical, counts.high, counts.medium, counts.low]}
				type="donut"
				width={300}
			/>
		</Card>
	);
};
