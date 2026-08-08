/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/status-card.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/current-card.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/history.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/circulation/data/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/status-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/current-card.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/data/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/circulation/hooks/useCirculationCardHistory.ts
 * @status merged
 * @notes The circulation "kind" config: turns a vehicle payload into the props the three
 *        `compliance-table/` components need. `data/index.tsx`'s `LIST(data, t)` becomes `fields` here
 *        (B adopted — byte-identical to A bar formatting). The status message/CTA come straight from
 *        `status-card.tsx` (B adopted). History columns come from `history.tsx`'s `columns()` (B
 *        adopted); the delete flow — `useCirculationCardHistory`, BD-only, QA has no delete at all —
 *        is folded in here as `deleteRow`, calling `dataSource.deleteCirculationCard` instead of that
 *        hook's Apollo mutation. `router.push`/`useParams` -> `navigation.push` + the vehicle id already
 *        on hand. `useCan(...)` -> the permission code on each `ComplianceStatusAction`/`canEdit`,
 *        resolved once by `ComplianceStatusCard` itself.
 *        `onEditCurrentCard` is a render-prop hole: `edit/circulation-card.tsx` (the actual edit form)
 *        is one of the files left unported — see README — so wiring the Edit button's target is left to
 *        the consumer.
 */

import ActionModal from "@/components/action-modal";
import Chip from "@/components/chip";
import { usePermission } from "@/hooks";
import { formatTime, normalizeFiles } from "@/utils";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import type { ComplianceDocumentSectionProps } from "../compliance-table";
import { useVehicleCompliance } from "../provider";
import { PreviewFileModal } from "../shared/preview-file-modal";
import { UploadComplianceImage } from "../shared/upload-compliance-image";
import type { CirculationCard, ComplianceVehicle } from "../types";

export const circulationFields = (data: CirculationCard) => [
	{ label: "Card Number", value: data?.card_number || "N/A" },
	{ label: "Issue Date", value: data?.issue_date ? formatTime(data.issue_date) : "N/A" },
	{ label: "Expiration Date", value: data?.expiry_date ? formatTime(data.expiry_date) : "N/A" },
	{ label: "Status", value: data?.status || "N/A" },
];

export const buildCirculationHistoryColumns = ({
	onViewFile,
	onDelete,
}: {
	onViewFile: (record: CirculationCard) => void;
	onDelete: (record: CirculationCard) => void;
}): ColumnsType<CirculationCard> => [
	{
		title: "Card Number",
		dataIndex: "card_number",
		key: "card_number",
		render: (text) => <span className="font-medium">{text}</span>,
	},
	{
		title: "Issue Date",
		dataIndex: "issue_date",
		key: "issue_date",
		render: (text) => <span className="font-medium">{text ? formatTime(text) : "N/A"}</span>,
	},
	{
		title: "Expiration Date",
		dataIndex: "expiry_date",
		key: "expiry_date",
		render: (text) => <span className="font-medium">{text ? formatTime(text) : "N/A"}</span>,
	},
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
		render: (text) => <Chip label={text} variant={text} />,
	},
	{
		title: "Files",
		dataIndex: "file",
		key: "file",
		render: (file, record) =>
			file ? (
				<button type="button" className="text-primary" onClick={() => onViewFile(record)}>
					View
				</button>
			) : (
				"-"
			),
	},
	{
		title: "Actions",
		dataIndex: "actions",
		key: "actions",
		width: 50,
		render: (_, record) => (
			<button type="button" className="text-error" onClick={() => onDelete(record)}>
				Delete
			</button>
		),
	},
];

export type UseCirculationConfigOptions = {
	onEditCurrentCard?: () => void;
};

export const useCirculationConfig = (
	vehicle: ComplianceVehicle | undefined,
	{ onEditCurrentCard }: UseCirculationConfigOptions = {},
): ComplianceDocumentSectionProps => {
	const { dataSource, navigation, basePath, permissions } = useVehicleCompliance();
	const { has } = usePermission(permissions);
	const [preview, setPreview] = useState<{ open: boolean; bucketId: string; fileName: string; contentType: string }>({
		open: false,
		bucketId: "",
		fileName: "",
		contentType: "",
	});
	const [deleteTarget, setDeleteTarget] = useState<CirculationCard | null>(null);
	const [deleting, setDeleting] = useState(false);

	const current = vehicle?.circulation_cards?.[0] ?? {};
	const isExpired = current.status === "EXPIRED";
	const isMissing = !current.status;
	const files = normalizeFiles(current.file);

	const openPreview = (record: CirculationCard) => {
		const [file] = normalizeFiles(record.file);
		if (!file) return;
		setPreview({ open: true, ...file });
	};

	const confirmDelete = async () => {
		if (!deleteTarget?.id) return;
		setDeleting(true);
		try {
			await dataSource.deleteCirculationCard(deleteTarget.id);
			setDeleteTarget(null);
		} finally {
			setDeleting(false);
		}
	};

	return {
		status: {
			title: "Circulation Card Status",
			chip: {
				label: isMissing ? "Missing" : isExpired ? "Expired" : (current.status ?? ""),
				variant: current.status || "warning",
			},
			message: (
				<p>
					Circulation card status is {(current.status || "missing").toLowerCase()}.{" "}
					{isExpired && "Renewal is required."}
				</p>
			),
			actions: [
				{
					key: "add-circulation-card",
					label: "Add Circulation Card",
					permission: "business.action.add_circulation",
					onClick: () => navigation.push(`${basePath}/${vehicle?.id ?? ""}/add-circulation`),
				},
			],
		},
		document: {
			title: "Current Circulation Card",
			fields: circulationFields(current),
			canEdit: has("business.action.edit_circulation"),
			onEdit: () => onEditCurrentCard?.(),
			attachmentsTitle: "Attachments",
			files,
			onViewFile: () => openPreview(current),
			renderUpload: () => (
				<UploadComplianceImage
					data={files}
					payload={{
						customerId: "",
						category: "circulation",
						uniqueId: `${vehicle?.id ?? ""}`,
						documentGroup: "compliance",
						split: false,
					}}
					onUploaded={(uploaded) => {
						const fileId = uploaded?.[0]?.id;
						if (fileId && current.id) {
							dataSource.updateCirculationCardFile({ circulationCardId: current.id, fileId });
						}
					}}
					hideChangeImage
				/>
			),
		},
		history: {
			title: "Circulation Card History",
			columns: buildCirculationHistoryColumns({ onViewFile: openPreview, onDelete: setDeleteTarget }),
			dataSource: vehicle?.circulation_cards ?? [],
			modals: (
				<>
					<PreviewFileModal
						open={preview.open}
						onOpen={(open) => setPreview((prev) => ({ ...prev, open }))}
						bucketId={preview.bucketId}
						fileName={preview.fileName}
						contentType={preview.contentType}
					/>
					{deleteTarget && (
						<DeleteCirculationConfirm
							card={deleteTarget}
							loading={deleting}
							onCancel={() => setDeleteTarget(null)}
							onConfirm={confirmDelete}
						/>
					)}
				</>
			),
		},
	};
};

const DeleteCirculationConfirm = ({
	card,
	loading,
	onCancel,
	onConfirm,
}: {
	card: CirculationCard;
	loading: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) => (
	<ActionModal show loading={loading} setShow={onCancel} handleTrigger={onConfirm}>
		<p>Delete circulation card {card.card_number}?</p>
	</ActionModal>
);
