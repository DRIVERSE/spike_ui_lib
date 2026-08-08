import type { Meta, StoryObj } from "@storybook/react";
import Chart from "./chart";
import { CostOverTimeChart } from "./presets/cost-over-time-chart";
import { CountBadge } from "./presets/count-badge";
import { IssuesByPriorityChart } from "./presets/issues-by-priority-chart";
import { MonthlyCostChart } from "./presets/monthly-cost-chart";
import { ServicesByStatusChart } from "./presets/services-by-status-chart";
import { ServicesByTypeChart } from "./presets/services-by-type-chart";
import { ServicesDonutChart } from "./presets/services-donut-chart";
import { StatCard } from "./presets/stat-card";
import { StatusBadge } from "./presets/status-badge";
import { TopVehiclesChart } from "./presets/top-vehicles-chart";
import useChart from "./use-chart";

const meta = {
	title: "Charts/Gallery",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

/** The base <Chart> + useChart pairing, with the themed defaults both apps share. */
function ThemedAreaChart() {
	const options = useChart({
		xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"] },
	});

	return (
		<Chart
			type="area"
			height={280}
			options={options}
			series={[
				{ name: "Services", data: [31, 40, 28, 51, 42, 109] },
				{ name: "Issues", data: [11, 32, 45, 32, 34, 52] },
			]}
		/>
	);
}

export const Themed: StoryObj = {
	render: () => <ThemedAreaChart />,
};

const row = (month_number: number, month_label: string, actual_cost: number) => ({
	month_start: `2026-0${month_number}-01`,
	month_label,
	year: 2026,
	month_number,
	completed_count: actual_cost / 100,
	actual_cost,
});

const COST_DATA = [row(1, "Jan", 1200), row(2, "Feb", 800), row(3, "Mar", 1500)];

export const MaintenancePresets: StoryObj = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
			<ServicesDonutChart completed={42} scheduled={13} />
			<ServicesByStatusChart counts={{ IN_PROGRESS: 5, UPCOMING: 9, OVERDUE: 2, NO_SERVICES: 11 }} />
			<IssuesByPriorityChart counts={{ critical: 2, high: 5, medium: 8, low: 3 }} />
			<ServicesByTypeChart
				data={[
					{ service_type: "Oil change", service_count: 12 },
					{ service_type: "Brakes", service_count: 7 },
				]}
			/>
			<CostOverTimeChart data={COST_DATA} />
			<MonthlyCostChart data={COST_DATA.map((entry) => ({ ...entry, estimated_cost: entry.actual_cost + 100 }))} />
			<TopVehiclesChart
				data={[
					{ alias: "ABC-123", actual_cost: 4200 },
					{ alias: "XYZ-987", actual_cost: 3100 },
				]}
			/>
		</div>
	),
};

export const Badges: StoryObj = {
	render: () => (
		<div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
			<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
				<CountBadge count={3} color="red" label="Overdue services" textLabel="SERVICE" />
				<CountBadge count={1} color="gold" label="Upcoming" textLabel="ISSUE" />
				<CountBadge count={12} color="green" label="Completed" />
			</div>
			<div style={{ display: "flex", gap: 8 }}>
				<StatusBadge status="IN_PROGRESS" />
				<StatusBadge status="UPCOMING" />
				<StatusBadge status="OVERDUE" />
				<StatusBadge status="NO_SERVICES" />
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
				<StatCard label="Overdue" value={4} icon="lucide:triangle-alert" color="#ef4444" iconBg="bg-red-50" />
				<StatCard label="In Progress" value={9} icon="lucide:wrench" color="#3b82f6" iconBg="bg-blue-50" />
				<StatCard label="Loading" value={0} icon="lucide:clock" color="#f59e0b" iconBg="bg-yellow-50" loading />
			</div>
		</div>
	),
};
