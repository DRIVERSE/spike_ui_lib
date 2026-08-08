/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/usePendingAction.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/usePendingAction.tsx
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). Three couplings
 *        removed:
 *          - `@apollo/client`'s `useSubscription(GET_PENDING_UPLOADS)` -> `dataSource.subscribePendingUploads`,
 *            wired up in a `useEffect`; `loading` means "no callback has fired yet" (mirrors Apollo's
 *            initial `loading: true`).
 *          - `@apollo/client`'s `useQuery(GET_CLIENT_VEHICLES)` -> `dataSource.fetchClientVehicles`, wrapped
 *            in `@tanstack/react-query`.
 *          - The `useApiResource` POST to `${FILE_BASE_API}/confirm` (`FILE_BASE_API` was
 *            `import.meta.env.VITE_DOCUMENT_INBOX_URL`) -> `dataSource.confirmDocuments`.
 *        `columns()` now takes `documentTypeOptions` off the data source too (see `pending-uploads-columns.tsx`).
 *        `useDocumentInboxStore` is `useDocumentInbox()`.
 *
 *        Two small fixes in passing: `handleMark`/`handleDelete`/`handleFlag` were unreachable TODO stubs —
 *        `pending-uploads-columns.tsx` never wired the buttons that would have called them (commented out
 *        in both apps) — dropped as dead code. `handleView` called `setViewMaanualEntry(record)`, passing
 *        a whole row where the setter's type says `boolean`; every read site only ever checked its
 *        truthiness, so this now passes `true`, which is what was actually meant.
 */

import { useTranslate } from "@/i18n/translate";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { columns } from "../components/table/pending-uploads-columns";
import { useDocumentInbox } from "../provider";
import type { DocumentInboxRecord, VehicleType } from "../types";

type Props = {
	showActions?: boolean;
};

export const usePendingAction = ({ showActions }: Props) => {
	const t = useTranslate();
	const { dataSource, clientId, setViewMaanualEntry, setResolvedDocType, setColumnValues } = useDocumentInbox();
	const [search, setSearch] = useState("");
	const [isConfirming, setIsConfirming] = useState(false);
	const [documentTypes, setDocumentTypes] = useState<Record<string, string>>({});
	const [loading, setLoading] = useState(true);
	const [inboxData, setInboxData] = useState<DocumentInboxRecord[]>([]);

	useEffect(() => {
		setLoading(true);
		const unsubscribe = dataSource.subscribePendingUploads(clientId, (records) => {
			setInboxData(records);
			setLoading(false);
		});
		return unsubscribe;
	}, [dataSource, clientId]);

	const { data: vehicleList = [] } = useQuery<VehicleType[]>({
		queryKey: ["documentInboxClientVehicles", clientId],
		queryFn: () => dataSource.fetchClientVehicles(clientId),
		enabled: !!clientId,
	});

	// ---- counts ----
	const counts = useMemo(() => {
		const byStatus = (status: string) => inboxData.filter((f) => f.status === status).length;

		const needsReview = byStatus("NEEDS_ATTENTION");
		const needsOcr = byStatus("OCR_REVIEW");
		const ready = byStatus("READY");
		// documents that have a VIN and that VIN exists in vehicleList
		const vehicleVins = new Set(vehicleList.map((v: VehicleType) => v.vin?.toLowerCase()).filter(Boolean));

		const affected = inboxData.filter((f) => {
			const vin = f?.ocr_data?.extracted_data?.vin?.toLowerCase();
			return vin && vehicleVins.has(vin);
		}).length;

		return {
			total: inboxData.length,
			ready,
			pending: needsReview + needsOcr,
			affected,
		};
	}, [inboxData, vehicleList]);

	// ---- search ----
	const filteredVehicles = useMemo(
		() =>
			inboxData.filter((file) =>
				[
					file.entity_type,
					file.file_name,
					file.document_type,
					file.status,
					file?.ocr_data?.extracted_data?.vehicle_brand,
					file?.ocr_data?.extracted_data?.vehicle_model_line,
					file?.ocr_data?.extracted_data?.vin,
				]
					.join(" ")
					.toLowerCase()
					.includes(search.toLowerCase()),
			),
		[inboxData, search],
	);

	// ---- helpers ----
	const getDocumentType = useCallback(
		(record: any): string => {
			if (documentTypes[record.id]) return documentTypes[record.id];
			return record?.ocr_data?.document_type?.category || "unknown";
		},
		[documentTypes],
	);

	const isDocumentTypeResolved = useCallback(
		(record: any): boolean => {
			const type = getDocumentType(record);
			return !!type && type !== "unknown";
		},
		[getDocumentType],
	);

	const handleDocumentTypeChange = useCallback((value: string, record: any) => {
		setDocumentTypes((prev) => ({ ...prev, [record.id]: value }));
	}, []);

	// ---- actions ----
	const handleView = useCallback(
		(record: any) => {
			if (!isDocumentTypeResolved(record)) {
				toast.error("Please select a document type before viewing.");
				return;
			}
			setColumnValues(record);
			setResolvedDocType(getDocumentType(record));
			setViewMaanualEntry(true);
		},
		[isDocumentTypeResolved, getDocumentType, setColumnValues, setResolvedDocType, setViewMaanualEntry],
	);

	const handleLogsView = useCallback(
		(record: any) => {
			setColumnValues(record);
		},
		[setColumnValues],
	);

	const confirmReadyDocs = async () => {
		const readyDocs = inboxData.filter((f) => f.status === "READY").map((item) => item?.id);

		if (readyDocs.length === 0) {
			toast.error("No documents ready to confirm.");
			return;
		}

		setIsConfirming(true);
		try {
			const res = await dataSource.confirmDocuments(readyDocs);

			if (res?.status === 202) {
				toast.success(res.message || "Documents confirmed successfully!");
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Failed to confirm documents.");
		} finally {
			setIsConfirming(false);
		}
	};

	// ---- columns ----
	const columnsData = useMemo(
		() =>
			columns({
				onView: handleView,
				onLogsView: handleLogsView,
				onDocumentTypeChange: handleDocumentTypeChange,
				documentTypes,
				documentTypeOptions: dataSource.documentTypeOptions,
				showActions,
			}),
		[documentTypes, showActions, handleView, handleLogsView, handleDocumentTypeChange, dataSource.documentTypeOptions],
	);

	const STATS = useMemo(
		() => [
			{
				icon: "mage:file-3",
				value: counts.total || 0,
				label: t("Total Documents"),
				subLabel: "All uploaded documents in your inbox",
				iconBg: "bg-orange-50",
				iconColor: "text-orange-400",
				size: 24,
				color: "rgb(59 130 246)",
			},
			{
				icon: "lets-icons:check-ring-light",
				value: counts.pending || 0,
				label: t("Pending Review"),
				subLabel: "Awaiting manual review",
				iconBg: "#fff4e5",
				iconColor: "#ff9500",
				size: 24,
				color: "#ff9500",
			},
			{
				icon: "gg:check-r",
				value: counts.ready || 0,
				label: t("Ready to Save"),
				subLabel: "Verified and ready to be saved to records",
				iconBg: "bg-green-50",
				iconColor: "text-green-500",
				size: 22,
				color: "rgb(34 197 94)",
			},
			{
				icon: "carbon:car",
				value: counts.affected || 0,
				label: t("Vehicles Affected"),
				subLabel: "Vehicles linked to processed documents",
				iconBg: "bg-purple-50",
				iconColor: "text-purple-400",
				size: 24,
				color: "rgb(59 130 246)",
			},
		],
		[counts, t],
	);
	return {
		loading,
		inboxData,
		columnsData,
		filteredVehicles,
		search,
		documentTypes,
		STATS,
		isConfirming,
		counts,
		setSearch,
		confirmReadyDocs,
		setIsConfirming,
	};
};
