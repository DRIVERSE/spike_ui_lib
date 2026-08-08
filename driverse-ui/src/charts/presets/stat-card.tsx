/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/maintenance/components/stat-card.tsx
 * @status adopted-B
 * @notes Business-only. The wave brief asked for `maintenance/components/stat-cards.tsx`, but that file is
 *        a data container: it calls the GraphQL hook `useFleetMaintenanceOverview()` and hard-codes the six
 *        fleet-maintenance metrics. Its presentational atom `StatCard` is the reusable half, so that is what
 *        ships; the container stays app-side. Lifted verbatim apart from antd's deprecated `bodyStyle`
 *        (now `styles.body`) and the raw @iconify/react Icon, swapped for the library's <Iconify>.
 */

import Iconify from "@/icons/iconify-icon";
import { Card } from "antd";

export type StatCardProps = {
	icon: string;
	value: string | number;
	label: string;
	iconBg: string;
	size?: number;
	color: string;
	loading?: boolean;
};

export const StatCard = ({ icon, value, label, iconBg, size = 20, color, loading = false }: StatCardProps) => {
	return (
		<Card styles={{ body: { padding: "20px" } }}>
			<div className="flex items-center gap-4">
				<div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg}`}>
					<Iconify icon={icon} size={size} color={color} />
				</div>
				<div className="flex flex-col">
					<span className="text-2xl font-semibold text-gray-900 leading-none">{loading ? "—" : value}</span>
					<span className="text-sm font-medium text-gray-500 mt-1">{label}</span>
				</div>
			</div>
		</Card>
	);
};

export default StatCard;
