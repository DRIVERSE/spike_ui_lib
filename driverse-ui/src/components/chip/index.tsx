/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/chip/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/chip/index.tsx
 * @status merged
 * @notes Base is B: it hoists the variant map to a module-level exported `VARIANT_STYLES` (A rebuilt an
 *        identical map inside the render on every call) and Pill already imports it. A's three telematics
 *        keys — moving/parked/offline, all SUCCESS_STATUS — are added on top; every other key the two
 *        maps share carries the same colors, so the merge is additive with no value conflicts.
 *        Label rendering follows B: underscores become spaces, then `capitalize`. B did that inline and
 *        unconditionally; here it is a `labelTransform` prop defaulting to the same function, so A's
 *        call sites (which never had the underscore normalization) can opt out with `labelTransform={(s) => s}`.
 *        `isTextNormal` keeps B's meaning: skip the capitalize, keep the underscore normalization.
 *        The remove button gets an explicit type="button" — inside a form A's and B's version would submit.
 */

import { capitalize } from "@/utils/capitalize";
import type { CSSProperties, FC } from "react";
import type { ChipVariant } from "./types";

type Props = {
	id?: string;
	label: string;
	isTextNormal?: boolean;
	variant?: ChipVariant;
	onRemove?: (id: string) => void;
	className?: string;
	style?: CSSProperties;
	/** Applied to `label` before rendering. Defaults to replacing underscores with spaces. */
	labelTransform?: (label: string) => string;
};

const DANGER_STATUS: CSSProperties = {
	backgroundColor: "#fef2f2",
	color: "#b91c1c",
	borderColor: "#fecaca",
};

const WARNING_STATUS: CSSProperties = {
	backgroundColor: "#fffbeb",
	color: "#d97706",
	borderColor: "#fcd34d",
};

const PURPLE_STATUS: CSSProperties = {
	backgroundColor: "#f3e8ff",
	color: "#9333ea",
	borderColor: "#e9d5ff",
};

const BLUE_STATUS: CSSProperties = {
	backgroundColor: "#ebf5ff",
	color: "#0d4aa8",
	borderColor: "#54b6ff",
};

const SUCCESS_STATUS: CSSProperties = {
	backgroundColor: "#ebfff0",
	color: "#0d9d0d",
	borderColor: "#54eb7c",
};

export const VARIANT_STYLES: Record<string, CSSProperties> = {
	default: {
		backgroundColor: "#f8fafc",
		color: "#374151",
		borderColor: "#e2e8f0",
	},
	success: SUCCESS_STATUS,
	danger: DANGER_STATUS,
	INACTIVE: DANGER_STATUS,
	IMMEDIATE_ACTION: DANGER_STATUS,
	NO_PAYMENT: DANGER_STATUS,
	warning: WARNING_STATUS,
	active: SUCCESS_STATUS,
	COMPLIANT: SUCCESS_STATUS,
	compliant: SUCCESS_STATUS,
	ACTIVE: SUCCESS_STATUS,
	UPCOMING: PURPLE_STATUS,
	upcoming: PURPLE_STATUS,
	overdue: DANGER_STATUS,
	OVERDUE: DANGER_STATUS,
	completed: {
		backgroundColor: "#f0fdf4",
		color: "#15803d",
		borderColor: "#bbf7d0",
	},
	cancelled: DANGER_STATUS,
	CANCELLED: DANGER_STATUS,
	EXPIRING: WARNING_STATUS,
	EXPIRED: DANGER_STATUS,
	expired: DANGER_STATUS,
	expiring: WARNING_STATUS,
	REJECTED: DANGER_STATUS,
	rejected: DANGER_STATUS,
	APPROVED: SUCCESS_STATUS,
	approved: SUCCESS_STATUS,
	reported: WARNING_STATUS,
	REPORTED: WARNING_STATUS,
	NEEDS_ATTENTION: WARNING_STATUS,
	OCR_REVIEW: WARNING_STATUS,
	PROCESSING: WARNING_STATUS,
	CONFIRMATION_PENDING: WARNING_STATUS,
	UNDER_REVIEW: WARNING_STATUS,
	under_review: WARNING_STATUS,
	reassigned: {
		backgroundColor: "#eff6ff",
		color: "#1d4ed8",
		borderColor: "#93c5fd",
	},
	suspended: {
		backgroundColor: "#f3f4f6",
		color: "#6b7280",
		borderColor: "#d1d5db",
	},
	EXEMPT: SUCCESS_STATUS,
	exempt: SUCCESS_STATUS,
	MISSING_PAYMENT: DANGER_STATUS,
	MISSING: DANGER_STATUS,
	missing: DANGER_STATUS,
	FAILED: DANGER_STATUS,
	COMPLETED: SUCCESS_STATUS,
	PAID: SUCCESS_STATUS,
	CONFIRMED: SUCCESS_STATUS,
	READY: SUCCESS_STATUS,
	IN_PROGRESS: BLUE_STATUS,
	in_progress: BLUE_STATUS,
	// Autocredit telematics states.
	moving: SUCCESS_STATUS,
	parked: SUCCESS_STATUS,
	offline: SUCCESS_STATUS,
};

const BASE_STYLE: CSSProperties = {
	display: "inline-flex",
	alignItems: "center",
	gap: "8px",
	padding: "4px 12px",
	borderRadius: "20px",
	fontSize: "12px",
	fontWeight: 600,
	border: "1px solid",
};

const REMOVE_BUTTON_STYLE: CSSProperties = {
	background: "none",
	border: "none",
	cursor: "pointer",
	padding: 0,
	display: "flex",
	alignItems: "center",
	color: "#6b7280",
	marginLeft: "4px",
};

/** The default label normalization: `UNDER_REVIEW` -> `UNDER REVIEW`. */
export const defaultLabelTransform = (label: string) => label.split("_").join(" ");

const Chip: FC<Props> = ({
	id,
	label,
	variant = "default",
	isTextNormal,
	onRemove,
	className = "",
	style = {},
	labelTransform = defaultLabelTransform,
}) => {
	const variantStyle: CSSProperties = {
		...BASE_STYLE,
		...VARIANT_STYLES[variant],
		...style,
	};

	const text = label ? (isTextNormal ? labelTransform(label) : capitalize(labelTransform(label))) : "";

	return (
		<div className={`removable-tag ${className}`} style={variantStyle}>
			<span className={`text-xs ${isTextNormal ? "" : "uppercase"} whitespace-nowrap`}>{text}</span>
			{onRemove && id && (
				<button type="button" onClick={() => onRemove(id)} style={REMOVE_BUTTON_STYLE} aria-label={`Remove ${label}`}>
					×
				</button>
			)}
		</div>
	);
};

export default Chip;
export type { ChipVariant };
