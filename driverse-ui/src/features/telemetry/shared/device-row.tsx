/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/device-row.tsx
 *                                     and .../components/tracking-gps/side-panel/device-row.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/device-row.tsx
 *                                     and .../components/tracking-gps/side-panel/device-row.tsx
 * @status identical
 * @notes Byte-identical across all four copies.
 */

import Iconify from "@/icons/iconify-icon";

type Props = {
	icon: string;
	label: string;
	value: string | number;
	subtitle?: string;
	subtitleClass?: string;
	valueClass?: string;
	valueStyle?: string;
};

export function DeviceRow({
	icon,
	label,
	value,
	subtitle,
	subtitleClass = "text-slate-400",
	valueClass = "text-slate-900",
	valueStyle,
}: Props) {
	return (
		<div className="flex justify-between items-center">
			<div className="flex items-center gap-3">
				<div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#f5f5f5]">
					<Iconify icon={icon} width={18} className="text-slate-500" />
				</div>

				<span className="text-base text-slate-500">{label}</span>
			</div>

			<div className="text-right">
				<div className={`font-medium capitalize ${valueStyle} ${valueClass}`}>{value}</div>

				{subtitle && <div className={`text-xs ${subtitleClass}`}>{subtitle}</div>}
			</div>
		</div>
	);
}
