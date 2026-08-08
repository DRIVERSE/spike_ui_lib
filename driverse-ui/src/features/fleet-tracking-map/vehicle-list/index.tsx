/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/fleet-tracking-map/vehicle-list/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/fleet-tracking-map/vehicle-list/index.tsx
 * @status identical
 * @notes Identical in both apps; lifted verbatim. Imports repointed at the library (icons, fallback,
 *        loading, movement helpers) and `TrackingRecord`/`MAP_STYLES` now come from local modules
 *        instead of the apps' `#/fleet` types and 1600-line vehicle-parks data file.
 */

import Iconify from "@/icons/iconify-icon";
import { Input } from "antd";
import { useState } from "react";

import Fallback from "@/components/fallback";
import { CircleLoading } from "@/components/loading";
import { getMovementStatus } from "@/utils/misc";
import type { TrackingRecord } from "../types";

import { STATUS_COLOR } from "..";

type Props = {
	data: TrackingRecord[];
	loading: boolean;
	selected: TrackingRecord | null;
	onSelect: (v: TrackingRecord) => void;
};

export const VehicleList = ({ data, loading, selected, onSelect }: Props) => {
	const [query, setQuery] = useState("");
	const filtered = query.trim()
		? data.filter((v) => {
				const q = query.trim().toLowerCase();
				return v.alias?.toLowerCase().includes(q) || v.imei?.toLowerCase().includes(q);
			})
		: data;

	return (
		<div className="flex flex-col gap-2 pr-4 overflow-y-auto flex-shrink-0" style={{ width: 300 }}>
			<div className="flex flex-col gap-2">
				<h3 className="text-xl font-medium pb-2">Live Tracking ({data.length})</h3>
				<div className="mb-1">
					<Input
						placeholder="Search by alias"
						value={query}
						onChange={(e) => setQuery(e.target.value?.trim())}
						allowClear
						size="middle"
						prefix={<Iconify icon="solar:magnifer-linear" />}
						className="w-full h-10"
					/>
				</div>
				{loading && (
					<div className=" h-72 text-center">
						<CircleLoading size="default" />
					</div>
				)}
				{!loading && data.length === 0 && (
					<Fallback
						icon={<Iconify icon="lucide:car" width={40} />}
						title="No vehicles found"
						description={<p className="text-center">There are no vehicles with tracking data available.</p>}
					/>
				)}
				{!loading && filtered.length === 0 && query && (
					<div className="text-xs text-center py-3" style={{ color: "#94a3b8" }}>
						No vehicles match "{query}"
					</div>
				)}
				{filtered.map((v) => {
					const vstatus = getMovementStatus(v.acc_status, v.speed, v.status);

					const isSelected = selected?.id === v.id;
					return (
						<div
							key={v.id}
							onClick={() => onSelect(v)}
							className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
							style={{
								background: "#FFF",
								border: `1.5px solid ${isSelected ? "#5F8BFA" : "#E5E7EB"}`,
								boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
							}}
						>
							<div
								className="flex items-center justify-center rounded-lg flex-shrink-0"
								style={{ width: 40, height: 40, background: "#f1f5f9" }}
							>
								<Iconify icon="lucide:car" width={20} style={{ color: "#0f172a" }} />
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-sm truncate capitalize" style={{ color: "#0f172a" }}>
									{v.alias || v.plate_number || v.imei}
								</div>
								<div className="text-xs capitalize truncate text-gray-600">
									{v?.make} · {v?.imei}
								</div>
							</div>
							<div className="flex flex-col items-end gap-1 flex-shrink-0">
								<div className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLOR[vstatus] }} />
								<span className="text-xs" style={{ color: "#64748b" }}>
									{v.speed} km/h
								</span>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
