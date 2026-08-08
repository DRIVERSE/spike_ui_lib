/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/usePollutionTestForm.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/usePollutionTestForm.ts
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). `useDocumentInboxStore`
 *        is `useDocumentInbox()`; `PollutionTestSchema`/`PollutionTestFieldType` come from `../schema`.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { isValidDate, safeDate, safeFormatDate } from "@/utils";
import { useDocumentInbox } from "../provider";
import { type PollutionTestFieldType, PollutionTestSchema } from "../schema";
import { useMarkAsReady } from "./useMarkAsReady";

export const usePollutionTestForm = () => {
	const { clientId, setViewMaanualEntry, formValues, columnValues, resolvedDocType, resetFormValues } =
		useDocumentInbox();
	const { handleUpdate, isUpdating } = useMarkAsReady();

	const form = useForm<PollutionTestFieldType>({
		resolver: zodResolver(PollutionTestSchema),
		defaultValues: {
			test_date: undefined,
			hollogram: undefined,
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
	const formData = columnValues?.form || {};

	// ---- seed from OCR / saved form data ----
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when columnValues changes, mirroring the original app hook
	useEffect(() => {
		if (Object.keys(ocrData).length === 0 && Object.keys(formData).length === 0) return;

		reset({
			test_date: safeDate(ocrData.test_date || formData?.testDate),
			hollogram: ocrData.hollogram || formData?.hologram || undefined,
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

		// ── date validation ─────────────────────────────────────────────
		clearErrors(["test_date"]);

		if (!vals.test_date) {
			setError("test_date", {
				message: "This field is required",
			});
			return;
		}

		if (!isValidDate(vals.test_date)) {
			setError("test_date", {
				message: "Invalid date",
			});
			return;
		}
		// ────────────────────────────────────────────────────────────────

		const req = {
			id: columnValues?.id || "",
			form: {
				clientId,
				hologram: vals.hollogram,
				testDate: safeFormatDate(vals.test_date),
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
					test_date: safeFormatDate(vals.test_date),
					hollogram: vals.hollogram,
					vin: formValues.selectedVehicle?.vin || "",
				},
			},
		};

		await handleUpdate(req, handleClose);
	};

	const isSubmitDisabled = !values.test_date || !values.hollogram || isUpdating;

	return {
		control,
		errors,
		values,
		isUpdating,
		isSubmitDisabled,
		handleSubmit,
		handleClose,
	};
};
