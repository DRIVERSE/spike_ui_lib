/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/today-card.tsx
 *                                     and .../components/tracking-gps/side-panel/today-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/today-card.tsx
 *                                     and .../components/tracking-gps/side-panel/today-card.tsx
 * @status identical
 * @notes Byte-identical across all four copies.
 */

import Iconify from "@/icons/iconify-icon";

type Props = {
	data?: { current_mileage?: string | number; tracker_oil?: string; acc_status?: string; imei?: string };
};

export function TodayCard({ data }: Props) {
	const mileage = data?.current_mileage
		? Number(data.current_mileage).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })
		: "0";
	const fuel = data?.tracker_oil ? `${Number.parseFloat(data.tracker_oil)}%` : "—";
	const fuelPct = data?.tracker_oil ? Number.parseFloat(data.tracker_oil) : 0;
	const engineOn = data?.acc_status === "1";

	return (
		<div className="mt-auto bg-[#284276] p-6 rounded-[20px] border border-[#ECECEC] text-[#fff]">
			<div className="flex items-center justify-between mb-5">
				<div className="text-base text-slate-500 font-medium">Device IMEI</div>
				{data?.imei && <div className="text-[11px] text-slate-500 font-mono tracking-wide">{data.imei}</div>}
			</div>

			<div className="flex justify-between">
				<div>
					<div className="text-3xl font-bold">
						{mileage}
						<span className="text-base font-normal text-slate-400 ml-1">km</span>
					</div>
					<div className="text-sm text-slate-400 mt-2">Mileage</div>
				</div>

				<div className="text-right">
					<div className="text-3xl font-bold">{fuel}</div>
					<div className="text-sm text-slate-400 mt-2">Fuel Level</div>
				</div>
			</div>

			<div className="mt-5">
				<div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
					<div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(fuelPct, 100)}%` }} />
				</div>
			</div>

			<div className="mt-4 flex items-center gap-2">
				<Iconify
					icon={engineOn ? "solar:bolt-bold" : "solar:bolt-outline"}
					width={14}
					className={engineOn ? "!text-emerald-400" : "!text-slate-600"}
				/>
				<div className="text-xs text-slate-400">Engine {engineOn ? "on" : "off"}</div>
			</div>
		</div>
	);
}
