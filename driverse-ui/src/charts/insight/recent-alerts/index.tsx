/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/insight/components/charts/recent-alerts/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/insight/charts/recent-alerts/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Icons render through the library's <Iconify>.
 */

import Iconify from "@/icons/iconify-icon";
import { Typography } from "antd";
import type { InsightChartCommonProps } from "../types";
import { defaultT } from "../types";

import Card from "@/components/card";

type AlertType = "warning" | "error" | "success" | "info";

interface Alert {
	id: string;
	message: string;
	time: string;
	type: AlertType;
}

const MOCK_ALERTS: Alert[] = [
	{
		id: "1",
		message: "Insurance expiring for Toyota Camry (ABC-123)",
		time: "2 hours ago",
		type: "warning",
	},
	{
		id: "2",
		message: "Compliance check overdue for Ford Transit",
		time: "5 hours ago",
		type: "error",
	},
	{
		id: "3",
		message: "Maintenance completed for Honda CR-V",
		time: "1 day ago",
		type: "success",
	},
	{
		id: "4",
		message: "License renewal due in 7 days for Tesla Model 3",
		time: "1 day ago",
		type: "warning",
	},
	{
		id: "5",
		message: "Insurance expired for Corolla (HAYD-13493)",
		time: "10 days ago",
		type: "error",
	},
];

const ALERT_CONFIG: Record<AlertType, { icon: string; color: string; bg: string }> = {
	warning: { icon: "carbon:dot-mark", color: "#eab308", bg: "#fefce8" },
	error: { icon: "carbon:dot-mark", color: "#ef4444", bg: "#fef2f2" },
	success: { icon: "carbon:dot-mark", color: "#22c55e", bg: "#f0fdf4" },
	info: { icon: "carbon:dot-mark", color: "#3b82f6", bg: "#eff6ff" },
};

type Props = InsightChartCommonProps & {
	alerts?: Alert[];
};

const RecentAlerts = ({ alerts = MOCK_ALERTS, t = defaultT }: Props) => {
	return (
		<Card className="flex-col items-start min-h-[420px]">
			<header className="self-start w-full">
				<Typography.Title level={5}>{t("Recent Alerts")}</Typography.Title>
				<p className="text-gray-600 text-sm -mt-2 mb-1">Latest system notifications</p>
			</header>

			<div className="flex flex-col gap-2 w-full mt-1 flex-1">
				{alerts.map((alert) => {
					const config = ALERT_CONFIG[alert.type];
					return (
						<div
							key={alert.id}
							className="flex items-start gap-3 rounded-lg p-3 border border-gray-300 hover:bg-gray-50 transition-colors"
						>
							<div style={{ backgroundColor: config.bg }} className="rounded-full p-1.5 shrink-0">
								<Iconify icon={config.icon} style={{ color: config.color }} className="text-base" />
							</div>
							<div className="flex flex-col gap-0.5 flex-1">
								<span className="text-gray-700 text-sm leading-snug">{alert.message}</span>
								<span className="text-gray-600 text-xs flex items-center gap-1">
									<Iconify icon="icon-park-outline:time" className="text-xs" />
									{alert.time}
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</Card>
	);
};

export default RecentAlerts;
