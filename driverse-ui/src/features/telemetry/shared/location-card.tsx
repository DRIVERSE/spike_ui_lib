/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/side-panel/location-card.tsx
 *                                     and .../components/tracking-gps/side-panel/location-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/side-panel/location-card.tsx
 *                                     and .../components/tracking-gps/side-panel/location-card.tsx
 * @status identical
 * @notes Byte-identical across all four copies. `data`/`address` were untyped `any` in the source; kept
 *        loose here rather than inventing a stricter prop shape.
 */

import Iconify from "@/icons/iconify-icon";

type Props = {
	data?: { latitude?: number; longitude?: number; [key: string]: any };
	address?: string;
};

export function LocationCard({ data, address }: Props) {
	return (
		<div className="rounded-[20px] border border-[#ECECEC] bg-[#fff] p-5">
			<p className="text-lg text-slate-400 font-medium mb-4">Location</p>

			<div className="flex gap-2">
				<Iconify icon="proicons:location" width={22} />
				<div className="flex-1">
					<div className="font-semibold text-slate-900">{address || "Unknown location"}</div>

					{data?.latitude && (
						<div className=" text-xs font-mono text-slate-400">
							{data.latitude}, {data.longitude}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
