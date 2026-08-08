/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useOwnershipForm.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useOwnershipForm.ts
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). `useGetPaymentsStatus`
 *        (`@/features/vehicle-parks/vehicles/hooks/useGetPaymentsStatus`) wrapped a `useApiResource` GET to
 *        `${VITE_COMPLIANCE_URL}/api/v1/ownership-fee-payments/status` in `@tanstack/react-query`. Only the
 *        transport moves: `dataSource.fetchPaymentsStatus(vehicleId)` replaces the GET, and this hook keeps
 *        the `useQuery` wrapper (react-query is a declared peer both apps already used) — same surrounding
 *        logic, just an injected fetch. `YearStatus`/`OwnershipSchema`/`OwnershipFieldType` come from
 *        `../types` / `../schema`. `useDocumentInboxStore` is `useDocumentInbox()`.
 */

import { useTranslate } from "@/i18n/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";

import { isValidDate, safeDate, safeFormatDate } from "@/utils";
import { useDocumentInbox } from "../provider";
import { type OwnershipFieldType, OwnershipSchema } from "../schema";
import type { YearStatus } from "../types";
import { useMarkAsReady } from "./useMarkAsReady";

export const useOwnershipForm = () => {
	const t = useTranslate();
	const seededRef = useRef(false);

	const { dataSource, clientId, setViewMaanualEntry, formValues, columnValues, resolvedDocType, resetFormValues } =
		useDocumentInbox();

	const { handleUpdate, isUpdating } = useMarkAsReady();

	const vehicleId = useMemo(() => formValues.selectedVehicle?.id, [formValues.selectedVehicle?.id]);

	const {
		data: paymentStatus,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["documentInboxPaymentsStatus", vehicleId],
		queryFn: () => dataSource.fetchPaymentsStatus(vehicleId as string),
		enabled: !!vehicleId,
	});

	const years = paymentStatus?.detail?.yearlyStatus
		?.filter((item: YearStatus) =>
			resolvedDocType === "refrendo" ? item.refrendoStatus !== "PAID" : item.tenenciaStatus !== "PAID",
		)
		?.map((item: YearStatus) => String(item.year));

	const form = useForm<OwnershipFieldType>({
		resolver: zodResolver(OwnershipSchema),
		defaultValues: {
			FiscalYear: undefined,
			amount: undefined,
			paymentDate: undefined,
		},
	});

	const {
		control,
		formState: { errors },
		reset,
		watch,
		getValues,
		setError,
		clearErrors,
	} = form;

	const values = watch();

	const ocrData = columnValues?.ocr_data?.extracted_data || {};

	// ---- handlers ----
	const handleClose = () => {
		seededRef.current = false;
		reset();
		resetFormValues();
		setViewMaanualEntry(false);
	};

	const handleSubmit = async () => {
		const vals = getValues();

		// ── date validation ─────────────────────────────────────
		clearErrors(["paymentDate"]);

		if (!vals.paymentDate) {
			setError("paymentDate", {
				message: "This field is required",
			});
			return;
		}

		if (!isValidDate(vals.paymentDate)) {
			setError("paymentDate", {
				message: "Invalid date",
			});
			return;
		}
		// ────────────────────────────────────────────────────────

		const paymentDate = safeFormatDate(vals.paymentDate)
			? dayjs(safeFormatDate(vals.paymentDate)).toISOString()
			: undefined;

		const req = {
			id: columnValues?.id || "",
			form: {
				amount: Number(vals.amount),
				clientId,
				currency: formValues.selectedVehicle?.currency_code ?? "MXN",
				fiscalYear: vals.FiscalYear,
				paymentDate,
				paymentType: resolvedDocType.toLocaleUpperCase(),
				vehicleId: formValues.selectedVehicle?.id ?? "",
				fileId: columnValues?.file_id || "",
			},
			document_type: resolvedDocType,
			ocr_data: {
				...columnValues?.ocr_data,
				document_type: {
					...columnValues?.ocr_data?.document_type,
					entity: "vehicle",
					category: resolvedDocType,
				},
				extracted_data: {
					...columnValues?.ocr_data?.extracted_data,
					year: vals.FiscalYear,
					amount: Number(vals.amount),
					payment_date: paymentDate,
					vin: formValues.selectedVehicle?.vin || "",
				},
			},
		};

		await handleUpdate(req, handleClose);
	};

	const isSubmitDisabled = !values.FiscalYear || !values.amount || !values.paymentDate || isUpdating;

	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when columnValues/years change, mirroring the original app hook
	useEffect(() => {
		if (Object.keys(ocrData).length === 0) return;
		if (!years?.length) return;
		if (seededRef.current) return;

		const matchedYear = years.find((y: string) => String(y) === String(ocrData.year));

		seededRef.current = true;

		reset({
			FiscalYear: matchedYear || undefined,
			amount: ocrData.amount ? String(ocrData.amount) : undefined,
			paymentDate: safeDate(ocrData.payment_date),
		});
	}, [columnValues, years]);

	return {
		t,
		control,
		errors,
		values,
		columnValues,
		isUpdating,
		isSubmitDisabled,
		isLoading,
		years,
		error,
		handleClose,
		handleSubmit,
	};
};
