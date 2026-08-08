/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/index.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/index.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/index.tsx
 * @status merged
 * @notes This is the "ONE parameterized component" the three `<Kind>/index.tsx` files collapse into.
 *        Each app's per-kind `index.tsx` was just `<div className="flex flex-col gap-3">` around
 *        StatusCard + CurrentCard/Latest + (commented-out Reminders/AdditionalInfo) + History — B
 *        adopted for the wrapper markup (A/B are formatting-identical). `ComplianceDocumentSection`
 *        renders that same stack off a single config object instead of three copy-pasted files; see
 *        `configs/circulation.tsx`, `configs/verification.tsx` and `configs/tenure.tsx` for the
 *        functions that build each kind's config from vehicle data, and `README.md` for the full
 *        before/after file count.
 *        `extraContent` exists solely for tenure: its `payments-history.tsx` (the yearly tenencia/
 *        refrendo status grid) has no equivalent in circulation or verification, so it is not part of
 *        the shared config — it is tenure's own component, slotted in between the status card and the
 *        history table exactly where `tenure/index.tsx` renders it.
 */

import { CircleLoading } from "@/components/loading";
import type { ReactNode } from "react";
import type {
	ComplianceAdditionalInfoConfig,
	ComplianceDocumentCardConfig,
	ComplianceStatusCardConfig,
} from "../types";
import { ComplianceAdditionalInfo } from "./additional-info";
import { ComplianceDocumentCard } from "./document-card";
import { ComplianceHistoryTable, type ComplianceHistoryTableProps } from "./history-table";
import { ComplianceStatusCard } from "./status-card";

export type ComplianceDocumentSectionProps = {
	loading?: boolean;
	status: ComplianceStatusCardConfig;
	/** Circulation's current-card / verification's latest. Omitted where a kind has no "current document" card. */
	document?: ComplianceDocumentCardConfig;
	history: ComplianceHistoryTableProps<any>;
	/** Tenure-only yearly status grid; see the file header. */
	extraContent?: ReactNode;
	/** Opt-in — see additional-info.tsx: unmounted dead code in both source apps. */
	additionalInfo?: ComplianceAdditionalInfoConfig;
};

/**
 * Renders one document kind's compliance section: status card, current-document card, any kind-specific
 * extra content, and the history table — the shape every one of `circulation/index.tsx`, `tenure/
 * index.tsx` and `verification/index.tsx` shared. Driven entirely by the config produced for that kind.
 */
export const ComplianceDocumentSection = ({
	loading,
	status,
	document,
	history,
	extraContent,
	additionalInfo,
}: ComplianceDocumentSectionProps) => {
	if (loading) {
		return <CircleLoading />;
	}

	return (
		<div className="w-full flex flex-col gap-4">
			<div className="flex flex-col gap-3">
				<ComplianceStatusCard {...status} />
				{document && <ComplianceDocumentCard {...document} />}
				{extraContent}
				{additionalInfo && <ComplianceAdditionalInfo {...additionalInfo} />}
				<ComplianceHistoryTable {...history} />
			</div>
		</div>
	);
};

export default ComplianceDocumentSection;

export { ComplianceStatusCard, type ComplianceStatusCardProps } from "./status-card";
export { ComplianceDocumentCard, type ComplianceDocumentCardProps } from "./document-card";
export { ComplianceHistoryTable, type ComplianceHistoryTableProps } from "./history-table";
export { ComplianceAdditionalInfo, type ComplianceAdditionalInfoProps } from "./additional-info";
