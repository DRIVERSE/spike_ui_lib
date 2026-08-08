/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/current-card.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/latest.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/current-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/latest.tsx
 * @status merged
 * @notes `current-card.tsx` (circulation) and `latest.tsx` (verification) are the same card with
 *        different field lists: `Header` + an Edit button, an `InfoField` grid built from a per-kind
 *        `LIST(data, t)` function (now `config.fields`, resolved by the caller before this component
 *        ever sees it), a Divider, an attachments header with a "View" button, and the upload widget.
 *        B adopted for both (A/B differ only in formatting). Tenure's equivalent, `latest-payment.tsx`,
 *        is commented out of `tenure/index.tsx` in both apps (dead code, never rendered) — this component
 *        would render it identically via the same config shape, but no tenure config wires it up; see the
 *        README for the full list of currently-unmounted pieces.
 *        Upload stays a render prop (`config.renderUpload`) rather than a fixed `<UploadComplianceImage>`
 *        call: the payload (`category`, `uniqueId`) and the `hideChangeImage` flag differ per kind, and
 *        baking that into this component would mean threading five more props through just to rebuild
 *        what the caller already has in scope.
 */

import InfoField from "@/components/info-field";
import { Header } from "@/components/page-header";
import { Button, Card, Divider } from "antd";
import type { ComplianceDocumentCardConfig } from "../types";

export type ComplianceDocumentCardProps = ComplianceDocumentCardConfig;

export const ComplianceDocumentCard = ({
	title,
	fields,
	canEdit,
	onEdit,
	attachmentsTitle,
	files,
	onViewFile,
	renderUpload,
}: ComplianceDocumentCardProps) => {
	return (
		<Card>
			<div className="flex flex-col gap-3">
				<div className="flex justify-between items-center">
					<Header title={title} />
					{canEdit && (
						<Button type="default" onClick={onEdit}>
							Edit
						</Button>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-x-16 gap-y-6">
					{fields.map((field) => (
						<InfoField key={field.label} label={field.label} value={field.value} />
					))}
				</div>

				<Divider />

				<div className="flex justify-between">
					<Header title={attachmentsTitle} />
					{files.length > 0 && (
						<Button type="primary" size="small" onClick={onViewFile}>
							View
						</Button>
					)}
				</div>

				{renderUpload()}
			</div>
		</Card>
	);
};

export default ComplianceDocumentCard;
