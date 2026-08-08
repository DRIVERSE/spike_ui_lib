/**
 * @extracted-from
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/maintenance/components/shared/status-badge.tsx
 * @status adopted-B
 * @notes Business-only. Lifted verbatim except for `VehicleServiceStatus`, which the app imported from
 *        `useFleetMaintenanceServices` — a GraphQL feature hook. The union is four literals and is
 *        redeclared here so the badge carries no data-layer dependency.
 */

import { Tag } from "antd";
import type { FC } from "react";

/** Redeclared locally: the app imports this from a GraphQL feature hook the library cannot depend on. */
export type VehicleServiceStatus = "IN_PROGRESS" | "UPCOMING" | "OVERDUE" | "NO_SERVICES";

/* -------------------------------------------------------------------------- */
/*                               Status Config                                */
/* -------------------------------------------------------------------------- */
export const STATUS_CONFIG: Record<VehicleServiceStatus, { label: string; color: string; bg: string }> = {
	IN_PROGRESS: { label: "In Progress", color: "#2563eb", bg: "#dbeafe" },
	UPCOMING: { label: "Upcoming", color: "#d97706", bg: "#fef3c7" },
	OVERDUE: { label: "Overdue", color: "#dc2626", bg: "#fee2e2" },
	NO_SERVICES: { label: "No Services", color: "#059669", bg: "#d1fae5" },
};

/* -------------------------------------------------------------------------- */
/*                              Status Badge                                  */
/* -------------------------------------------------------------------------- */
export const StatusBadge: FC<{ status: VehicleServiceStatus }> = ({ status }) => {
	const cfg = STATUS_CONFIG[status];
	return (
		<Tag
			style={{
				color: cfg.color,
				background: cfg.bg,
				border: "none",
				fontWeight: 600,
				fontSize: 11,
				letterSpacing: "0.5px",
				textTransform: "uppercase",
				borderRadius: 6,
				padding: "2px 10px",
			}}
		>
			{cfg.label}
		</Tag>
	);
};
