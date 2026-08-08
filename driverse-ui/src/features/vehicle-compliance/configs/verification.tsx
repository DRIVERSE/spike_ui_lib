/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/pollution-test.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/latest.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/history.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/verification/data/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/pollution-test.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/latest.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/verification/data/index.tsx
 * @status merged
 * @notes The verification (pollution test) kind config. `pollution-test.tsx` branches on
 *        `isStateExcluded(plate_number_state)`: some Mexican states don't require the test at all, in
 *        which case the card shows an informational message plus a "voluntary test" CTA instead of the
 *        usual expiry countdown. `isStateExcluded` reads an app-side `@/constants` table
 *        (`excludedStatesForPollutionTest`, a Mexican-state list) with no library home — not generic
 *        enough for `@/utils`, one caller — so it is vendored right here as `isPollutionTestExcludedState`.
 *        `data/index.tsx`'s
 *        `LIST` -> `verificationFields`; both apps' `latestVerification.fields.*` i18n keys mapped 1:1
 *        onto plain labels. B adopted throughout (A/B differ only in formatting/i18n keys).
 *        `dayjs` stays a peer (declared in the module like the fleet-tracking-map reference already
 *        depends on `leaflet`).
 */

import Chip from "@/components/chip";
import { usePermission } from "@/hooks";
import { formatTime, normalize, normalizeFiles } from "@/utils";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useState } from "react";
import type { ComplianceDocumentSectionProps } from "../compliance-table";
import { useVehicleCompliance } from "../provider";
import { PreviewFileModal } from "../shared/preview-file-modal";
import { UploadComplianceImage } from "../shared/upload-compliance-image";
import type { ComplianceVehicle, PollutionTest } from "../types";

/** States where a pollution/emissions test is not required. Vendored from the apps' `@/constants`. */
export const POLLUTION_TEST_EXCLUDED_STATES = [
	"Ciudad de México",
	"Estado de México",
	"Morelos",
	"Hidalgo",
	"Puebla",
	"Querétaro",
	"Guanajuato",
	"Tlaxcala",
	"Jalisco",
	"Aguascalientes",
];

export const isPollutionTestExcludedState = (state: string | undefined) =>
	POLLUTION_TEST_EXCLUDED_STATES.map(normalize).includes(normalize(state ?? ""));

export const verificationFields = (test: PollutionTest & { plate_number?: string }) => [
	{ label: "Hologram", value: test.hologram ? `Hologram ${test.hologram}` : "N/A" },
	{ label: "License Plate", value: test.plate_number || "N/A" },
	{ label: "Verification Date", value: test.test_date ? test.test_date.split("T")[0] : "N/A" },
	{ label: "Valid Until", value: test.expiry_date ? test.expiry_date.split("T")[0] : "N/A" },
];

export const buildVerificationHistoryColumns = ({
	onViewFile,
}: { onViewFile: (record: PollutionTest) => void }): ColumnsType<PollutionTest> => [
	{
		title: "Date",
		dataIndex: "test_date",
		key: "test_date",
		render: (text) => <span className="font-medium">{text ? formatTime(text) : ""}</span>,
	},
	{ title: "Hologram", dataIndex: "hologram", key: "hologram" },
	{
		title: "Valid Until",
		dataIndex: "expiry_date",
		key: "expiry_date",
		render: (text) => <span className="font-medium">{text ? formatTime(text) : ""}</span>,
	},
	{
		title: "Status",
		dataIndex: "status",
		key: "status",
		render: (text) => (text ? <Chip label={text.toUpperCase()} variant={text.toUpperCase()} /> : ""),
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
];

export type UseVerificationConfigOptions = {
	onEditLatest?: () => void;
};

export const useVerificationConfig = (
	vehicle: ComplianceVehicle | undefined,
	{ onEditLatest }: UseVerificationConfigOptions = {},
): ComplianceDocumentSectionProps => {
	const { navigation, basePath, dataSource, permissions } = useVehicleCompliance();
	const { has } = usePermission(permissions);
	const [preview, setPreview] = useState({ open: false, bucketId: "", fileName: "", contentType: "" });

	const latest = vehicle?.pollution_tests?.[0] ?? null;
	const excluded = isPollutionTestExcludedState(vehicle?.plate_number_state);
	const files = normalizeFiles(latest?.file);

	const expiryDate = latest?.expiry_date ? dayjs(latest.expiry_date, "YYYY-MM-DD") : null;
	const diffDays = expiryDate?.isValid() ? expiryDate.diff(dayjs().startOf("day"), "day") : null;
	const isExpired = diffDays !== null && diffDays < 0;

	const status = latest?.status
		? latest.status.toUpperCase()
		: vehicle?.pollution_test_required === false
			? "EXEMPT"
			: "MISSING";

	const openPreview = (record: PollutionTest) => {
		const [file] = normalizeFiles(record.file);
		if (!file) return;
		setPreview({ open: true, ...file });
	};

	return {
		status: {
			title: "Pollution Test Status",
			chip: { label: status, variant: status },
			message: (
				<>
					{!excluded && (
						<p>
							Pollution test is <strong>not required</strong> for vehicles registered in{" "}
							<strong>{vehicle?.plate_number_state}</strong>.
						</p>
					)}
					{diffDays !== null && <p>{isExpired ? "Expired." : `Expires in ${diffDays} day(s).`}</p>}
					{excluded && !latest && <p>No verifications registered for this vehicle.</p>}
				</>
			),
			actions: [
				{
					key: "add-voluntary-test",
					label: "Add Voluntary Test",
					permission: "business.action.add_pollution_test",
					onClick: () => navigation.push(`${basePath}/${vehicle?.id ?? ""}/add-voluntary-test`),
				},
			],
		},
		document: excluded
			? {
					title: "Latest Verification",
					fields: verificationFields({ ...latest, plate_number: vehicle?.plate_number }),
					canEdit: has("business.action.edit_pollution_test"),
					onEdit: () => onEditLatest?.(),
					attachmentsTitle: "Attachments",
					files,
					onViewFile: () => latest && openPreview(latest),
					renderUpload: () => (
						<UploadComplianceImage
							data={files}
							payload={{
								customerId: "",
								category: "pollution-test",
								uniqueId: `${vehicle?.id ?? ""}`,
								documentGroup: "compliance",
								split: false,
							}}
							onUploaded={(uploaded) => {
								const fileId = uploaded?.[0]?.id;
								if (fileId && latest?.id) {
									dataSource.updatePollutionTestFile({ pollutionTestId: latest.id, fileId });
								}
							}}
						/>
					),
				}
			: undefined,
		history: {
			title: "Verification History",
			columns: buildVerificationHistoryColumns({ onViewFile: openPreview }),
			dataSource: vehicle?.pollution_tests ?? [],
			modals: (
				<PreviewFileModal
					open={preview.open}
					onOpen={(open) => setPreview((prev) => ({ ...prev, open }))}
					bucketId={preview.bucketId}
					fileName={preview.fileName}
					contentType={preview.contentType}
				/>
			),
		},
	};
};
