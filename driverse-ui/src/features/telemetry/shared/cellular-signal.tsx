/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/telemetry/components/gps/status/cellular-signal.tsx
 *                                     and .../components/tracking-gps/status/cellular-signal.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/telemetry/components/gps/status/cellular-signal.tsx
 *                                     and .../components/tracking-gps/status/cellular-signal.tsx
 * @status identical
 * @notes Byte-identical across all four copies. Unused in both apps — `status/index.tsx` (the only
 *        would-be consumer of the `status/` folder) is itself never imported by `gps/index.tsx` or
 *        `tracking-gps/index.tsx`, so `status/` is dead code end to end. Ported anyway per the established
 *        file list; `status/index.tsx` itself was not, since nothing in either app renders it. Note
 *        `gps-status-card.tsx` also defines its own inline `CellularSignal` (different bar heights) rather
 *        than importing this one — see that file's notes.
 */

type Props = { bars?: number };

export const CellularSignal = ({ bars = 3 }: Props) => {
	const heights = [6, 10, 14, 18];
	return (
		<div className="flex items-end gap-0.5 h-5">
			{heights.map((h, i) => (
				<div
					// biome-ignore lint/suspicious/noArrayIndexKey: fixed-length, order-stable bar list
					key={i}
					className="w-1.5 rounded-sm"
					style={{ height: h, backgroundColor: i < bars ? "#22c55e" : "#e5e7eb" }}
				/>
			))}
		</div>
	);
};
