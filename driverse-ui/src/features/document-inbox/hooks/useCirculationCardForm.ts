/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useCirculationCardForm.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useCirculationCardForm.ts
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). `useDocumentInboxStore`
 *        is `useDocumentInbox()`; `CirculationCardSchema`/`CirculationCardFieldType` come from the module's
 *        vendored `../schema` instead of the app's `@/schema/vehicle.schema`. `useMarkAsReady` is the
 *        module's own (already decoupled — see that file).
 */

import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { isValidDate, safeDate, safeFormatDate } from "@/utils";
import { useDocumentInbox } from "../provider";
import { type CirculationCardFieldType, CirculationCardSchema } from "../schema";
import { useMarkAsReady } from "./useMarkAsReady";

export const useCirculationCardForm = () => {
	const { clientId, setViewMaanualEntry, formValues, columnValues, resolvedDocType, resetFormValues } =
		useDocumentInbox();
	const { handleUpdate, isUpdating } = useMarkAsReady();

	const form = useForm<CirculationCardFieldType>({
		resolver: zodResolver(CirculationCardSchema),
		defaultValues: {
			card_number: "",
			issue_date: undefined,
			expiry_date: undefined,
			permanentCard: false,
		},
	});

	const {
		control,
		formState: { errors },
		reset,
		watch,
		setValue,
		getValues,
		setError,
		clearErrors,
	} = form;

	const values = watch();
	const ocrData = columnValues?.ocr_data?.extracted_data || {};
	const formData = columnValues?.form || {};

	// ---- seed from OCR / saved form data ----
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when columnValues changes, mirroring the original app hook
	useEffect(() => {
		if (Object.keys(ocrData).length === 0 && Object.keys(formData).length === 0) return;

		reset({
			card_number: ocrData.card_number || formData?.cardNumber || "",
			issue_date: safeDate(ocrData.issue_date || formData?.issueDate),
			expiry_date: safeDate(ocrData.expiry_date || formData?.expiryDate),
			permanentCard: formData?.cardType === "PERMANENT" || false,
		});
	}, [columnValues]);

	// ---- handlers ----
	const handleClose = () => {
		reset();
		resetFormValues();
		setViewMaanualEntry(false);
	};

	const handleSubmit = async () => {
		const vals = getValues();

		// ── date validation ──────────────────────────────────────────────────
		let hasDateError = false;

		const dateFields = [
			{ field: "issue_date" as const, value: vals.issue_date, required: true },
			{
				field: "expiry_date" as const,
				value: vals.expiry_date,
				required: !vals.permanentCard,
			},
		];

		clearErrors(["issue_date", "expiry_date"]);

		for (const { field, value, required } of dateFields) {
			if (required && !value) {
				setError(field, { message: "This field is required" });
				hasDateError = true;
			} else if (value && !isValidDate(value)) {
				setError(field, { message: "Invalid date" });
				hasDateError = true;
			}
		}

		if (hasDateError) return;
		// ─────────────────────────────────────────────────────────────────────

		const req = {
			id: columnValues?.id || "",
			form: {
				clientId,
				cardNumber: vals.card_number?.trim() ?? "",
				cardType: vals.permanentCard ? "PERMANENT" : "RECURRENT",
				issueDate: safeFormatDate(vals.issue_date),
				expiryDate: safeFormatDate(vals.expiry_date) ?? undefined,
				vehicleId: formValues.vehicle ?? "",
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
					card_number: vals.card_number,
					issue_date: safeFormatDate(vals.issue_date),
					expiry_date: safeFormatDate(vals.expiry_date) ?? undefined,
					vin: formValues.selectedVehicle?.vin || "",
				},
			},
		};

		await handleUpdate(req, handleClose);
	};

	const isExpiryInvalid =
		!values.permanentCard &&
		!!values.issue_date &&
		!!values.expiry_date &&
		!dayjs(values.expiry_date).isAfter(dayjs(values.issue_date), "day");

	const isSubmitDisabled =
		!values.card_number ||
		!values.issue_date ||
		(!values.permanentCard && !values.expiry_date) ||
		isExpiryInvalid ||
		isUpdating;

	return {
		control,
		errors,
		values,
		setValue,
		isUpdating,
		isExpiryInvalid,
		isSubmitDisabled,
		handleSubmit,
		handleClose,
	};
};
