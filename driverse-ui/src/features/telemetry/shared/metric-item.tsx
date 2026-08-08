/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/metric-item.tsx
 *                                     and .../components/tracking-gps/side-panel/metric-item.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/metric-item.tsx
 *                                     and .../components/tracking-gps/side-panel/metric-item.tsx
 * @status identical
 * @notes Byte-identical across all four copies.
 */

import Iconify from "@/icons/iconify-icon";
import { cn } from "@/utils";
import type { ReactNode } from "react";

type Props = {
	icon: string;
	label: string;
	value: ReactNode;
	unit?: string;
	iconClassName?: string;
	valueClassName?: string;
	className?: string;
};

export function MetricItem({
	icon,
	label,
	value,
	unit,
	iconClassName = "text-gray-700",
	valueClassName = "text-slate-900",
	className = "p-5 border-b border-slate-100 even:border-l",
}: Props) {
	return (
		<div className={className}>
			<div className="flex items-center gap-2 mb-2">
				<Iconify icon={icon} width={20} className={iconClassName} />
				<span className="text-sm text-gray-700 font-medium">{label}</span>
			</div>

			<div className="flex items-end gap-1">
				<span className={cn(`text-lg font-semibold ${valueClassName}`)}>{value}</span>

				{unit && <span className="text-sm text-slate-400 mb-1">{unit}</span>}
			</div>
		</div>
	);
}
