import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import FleetUtilization from "./fleet-utilization";
import FleetChart from "./fleets";
import Maintenance from "./maintenance";
import RecentAlerts from "./recent-alerts";
import RevenueChart from "./revenue";
import WeeklyActivity from "./weekly-activity";

/** Stand-in for the apps' i18next `t`, so the stories read like the real dashboard. */
const t = (key: string) =>
	({
		"sys.dashboard.charts.compliance.title": "Fleet compliance",
		"sys.dashboard.charts.compliance.labels.compliant": "Compliant",
		"sys.dashboard.charts.compliance.labels.immediate_action": "Immediate action",
		"sys.dashboard.charts.compliance.labels.needs_attention": "Needs attention",
	})[key] ??
	key.split(".").pop() ??
	key;

const meta = {
	title: "Charts/Insight",
	parameters: { layout: "padded" },
} satisfies Meta;

export default meta;

export const Dashboard: StoryObj<{ onNavigate: (path: string) => void }> = {
	args: { onNavigate: fn() },
	render: (args) => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
			<FleetChart
				t={t}
				onNavigate={args.onNavigate}
				counts={{ compliant: 42, immediateAction: 7, needsAttention: 13 }}
			/>
			<FleetUtilization t={t} />
			<Maintenance t={t} />
			<WeeklyActivity t={t} />
			<RevenueChart t={t} onNavigate={args.onNavigate} />
			<RecentAlerts t={t} />
		</div>
	),
};

export const Loading: StoryObj = {
	render: () => (
		<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 16 }}>
			<FleetChart t={t} loading />
			<FleetUtilization t={t} loading />
			<Maintenance t={t} loading />
		</div>
	),
};

/** No `t` and no `onNavigate`: the charts still render, which is the point of the decoupling. */
export const Standalone: StoryObj = {
	render: () => <FleetChart counts={{ compliant: 3, immediateAction: 1, needsAttention: 2 }} />,
};
