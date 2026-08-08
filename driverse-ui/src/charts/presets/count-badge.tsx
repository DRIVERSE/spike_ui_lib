/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/shared/count-badge.tsx
 * @status adopted-B
 * @notes Business-only. Lifted verbatim; it already delegates its colours to the merged Pill/chip variant map,
 *        so the antd colour-name -> chip-variant table comes along unchanged.
 */

import Pill from "@/components/pill";
import { Tooltip } from "antd";
import type { FC } from "react";

interface CountBadgeProps {
	count: number;
	color: string; // "blue" | "green" | "red" | "gold" | "processing"
	label: string; // Used for tooltip
	textLabel?: string; // e.g. "SERVICE", "ISSUE"
}

// Map Ant Design color names to Pill variant names
const colorToVariant: Record<string, string> = {
	blue: "IN_PROGRESS",
	processing: "IN_PROGRESS",
	green: "COMPLETED",
	red: "danger",
	gold: "warning",
	yellow: "warning",
};

export const CountBadge: FC<CountBadgeProps> = ({ count, color, label, textLabel }) => {
	const variant = colorToVariant[color] ?? "default";

	return (
		<Tooltip title={label}>
			<Pill variant={variant}>
				{count}
				{textLabel && (
					<span style={{ marginLeft: "4px", fontSize: 11, letterSpacing: "0.5px" }}>
						{textLabel}
						{count !== 1 ? "S" : ""}
					</span>
				)}
			</Pill>
		</Tooltip>
	);
};
