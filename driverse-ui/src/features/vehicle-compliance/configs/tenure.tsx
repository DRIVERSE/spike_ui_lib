/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/ownership.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/history.tsx
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/compliance/components/tenure/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/ownership.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/history.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/compliance/components/tenure/index.tsx
 * @status merged
 * @notes The tenure kind bundles two document kinds the source apps never split apart: "tenencia"
 *        (ownership tax) and "refrendo" (renewal fee). `ownership.tsx` is why `ComplianceStatusCardConfig`
 *        grew `secondaryChips` and multiple `actions` — one overall chip plus two per-sub-kind badges,
 *        and two CTAs ("Add Renewal Fee" / "Add Tenure") each gated by its own permission. There is no
 *        tenure "current document" card in either app (`latest-payment.tsx` is commented out in both, see
 *        `compliance-table/document-card.tsx`'s header) — `document` is intentionally omitted below.
 *        `history.tsx`'s columns adopted B (adds the edit-column behind `useCan`); `useGetPaymentsStatus`
 *        -> `dataSource.getOwnershipPaymentStatus`/`getOwnershipPaymentHistory` (both were `@tanstack/
 *        react-query`-backed REST calls reading `import.meta.env.VITE_COMPLIANCE_URL` — a library cannot
 *        read app env vars, so the base URL now lives on whatever `apiResource` the app's data-source
 *        implementation is built on). `edit/ownership-fee.tsx`'s Edit button is the same render-prop hole
 *        as circulation's — see `onEditHistoryRow` — because that form is one of the unported files.
 */

import { formatAmountWithCurrency, formatTime, normalizeFiles } from "@/utils";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import type { ComplianceDocumentSectionProps } from "../compliance-table";
import { TenureYearlyStatusGrid } from "../components/tenure/yearly-status-grid";
import { useVehicleCompliance } from "../provider";
import { PreviewFileModal } from "../shared/preview-file-modal";
import type { ComplianceVehicle, OwnershipPaymentRecord, OwnershipPaymentStatus, YearStatus } from "../types";

const statusVariant = (status?: string) => (status === "NO_PAYMENT" ? "EXPIRED" : (status ?? ""));
const statusLabel = (status?: string) => status?.replaceAll("_", " ") ?? "";

export const buildTenureHistoryColumns = ({
	currency,
	canEdit,
	onViewFile,
	onEditRow,
}: {
	currency?: string;
	canEdit: boolean;
	onViewFile: (record: OwnershipPaymentRecord) => void;
	onEditRow: (record: OwnershipPaymentRecord) => void;
}): ColumnsType<OwnershipPaymentRecord> => [
	{ title: "Fiscal Year", dataIndex: "fiscal_year", key: "fiscal_year" },
	{
		title: "Type",
		dataIndex: "payment_type",
		key: "payment_type",
		render: (text) => (text === "REFRENDO" ? "Renewal Fee" : text === "TENENCIA" ? "Tenure" : text),
	},
	{
		title: "Amount",
		dataIndex: "amount",
		key: "amount",
		render: (text) => (text ? formatAmountWithCurrency(text, currency) : "N/A"),
	},
	{
		title: "Payment Date",
		dataIndex: "payment_date",
		key: "payment_date",
		render: (text) => (text ? formatTime(text) : ""),
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
	...(canEdit
		? [
				{
					title: "Actions",
					dataIndex: "id",
					key: "id",
					render: (_: unknown, record: OwnershipPaymentRecord) => (
						<button type="button" className="text-primary" onClick={() => onEditRow(record)}>
							Edit
						</button>
					),
				},
			]
		: []),
];

export type UseTenureConfigOptions = {
	vehicleId?: string;
	currency?: string;
	canEditHistory?: boolean;
	onEditHistoryRow?: (record: OwnershipPaymentRecord) => void;
};

/**
 * Fetches and shapes the tenure/ownership section. Unlike circulation/verification, which read straight
 * off the vehicle payload, both apps loaded ownership status and history from a separate compliance
 * service — `dataSource.getOwnershipPaymentStatus`/`getOwnershipPaymentHistory` (was
 * `useGetPaymentsStatus`) fill that role here.
 */
export const useTenureConfig = (
	vehicle: ComplianceVehicle | undefined,
	{ vehicleId, currency, canEditHistory = false, onEditHistoryRow }: UseTenureConfigOptions = {},
): ComplianceDocumentSectionProps & { loading: boolean } => {
	const { dataSource, navigation, basePath } = useVehicleCompliance();
	const id = vehicleId ?? vehicle?.id ?? "";
	const [paymentStatus, setPaymentStatus] = useState<OwnershipPaymentStatus | undefined>();
	const [history, setHistory] = useState<OwnershipPaymentRecord[]>([]);
	const [loading, setLoading] = useState(true);
	const [preview, setPreview] = useState({ open: false, bucketId: "", fileName: "", contentType: "" });

	const openPreview = (record: OwnershipPaymentRecord) => {
		const [file] = normalizeFiles(record.file);
		if (!file) return;
		setPreview({ open: true, ...file });
	};

	useEffect(() => {
		if (!id) {
			setLoading(false);
			return;
		}
		let cancelled = false;
		setLoading(true);
		Promise.all([dataSource.getOwnershipPaymentStatus(id), dataSource.getOwnershipPaymentHistory(id)])
			.then(([status, records]) => {
				if (cancelled) return;
				setPaymentStatus(status);
				setHistory(records ?? []);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [id, dataSource]);

	const overall = paymentStatus?.detail?.overallStatus;
	const yearlyStatus = paymentStatus?.detail?.yearlyStatus ?? [];
	const tenureYears = yearlyStatus.filter((y: YearStatus) => y.tenenciaStatus === "NOT PAID").map((y) => y.year);
	const refYears = yearlyStatus.filter((y: YearStatus) => y.refrendoStatus === "NOT PAID").map((y) => y.year);
	const allPaid = tenureYears.length === 0 && refYears.length === 0;
	const isExempt = paymentStatus?.detail?.tenenciaExemption?.isExempt;
	const resolvedCurrency = currency ?? vehicle?.currency_code ?? "MXN";

	return {
		loading,
		status: {
			title: "Ownership Fee Status",
			chip: { label: statusLabel(overall?.ownershipFeeStatus), variant: statusVariant(overall?.ownershipFeeStatus) },
			secondaryChips: [
				{
					label: "Tenure",
					chip: { label: statusLabel(overall?.tenenciaStatus), variant: statusVariant(overall?.tenenciaStatus) },
				},
				{
					label: "Renewal Fee",
					chip: { label: statusLabel(overall?.refrendoStatus), variant: statusVariant(overall?.refrendoStatus) },
				},
			],
			message: allPaid ? (
				<p>All ownership fee payments are up to date.</p>
			) : (
				<p>
					{refYears.length} renewal fee and {tenureYears.length} tenure payment(s) outstanding.
					{isExempt && ` ${paymentStatus?.detail?.tenenciaExemption?.reason ?? ""}`}
				</p>
			),
			actions: [
				{
					key: "add-referendum",
					label: "Add Renewal Fee",
					permission: "business.action.add_tenure_renewal_payment",
					onClick: () => navigation.push(`${basePath}/${id}/add-referendum?currency=${resolvedCurrency}`),
				},
				...(isExempt
					? []
					: [
							{
								key: "add-tenure",
								label: "Add Tenure",
								permission: "business.action.add_tenure_payment" as const,
								type: "default" as const,
								onClick: () => navigation.push(`${basePath}/${id}/add-tenure?currency=${resolvedCurrency}`),
							},
						]),
			],
		},
		extraContent: <TenureYearlyStatusGrid years={yearlyStatus} />,
		history: {
			title: "Ownership Fee Payment History",
			columns: buildTenureHistoryColumns({
				currency: resolvedCurrency,
				canEdit: canEditHistory,
				onViewFile: openPreview,
				onEditRow: (record) => onEditHistoryRow?.(record),
			}),
			dataSource: history,
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
