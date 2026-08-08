/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/documents/document-inbox/hooks/useInsuranceForm.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/features/documents/document-inbox/hooks/useInsuranceForm.ts
 * @status decoupled
 * @notes B is the base (adds `useClientId`; A read `selectedClientId` off the store). The bigger seam:
 *        both apps got their `form` (a react-hook-form instance) from
 *        `@/features/vehicle-parks/hooks/useAddInsurance`, an app hook this function otherwise never used
 *        anything else from — not `handleCreatePolicy`, not its upload/router/react-query/apolloClient/
 *        `useInsuranceStore` machinery, none of it. Rather than inject that entire unrelated surface, this
 *        hook now builds its own `useForm<VehicleInsuranceFieldType>({ resolver:
 *        zodResolver(VehicleInsuranceSchema) })` directly, with the schema vendored into `../schema`. Field
 *        validation is identical; the dependency chain is gone. `useDocumentInboxStore` is
 *        `useDocumentInbox()`.
 */

import { useTranslate } from "@/i18n/translate";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { isValidDate, safeDate, safeFormatDate } from "@/utils";
import { useDocumentInbox } from "../provider";
import { type VehicleInsuranceFieldType, VehicleInsuranceSchema } from "../schema";
import { useMarkAsReady } from "./useMarkAsReady";

export const useInsuranceForm = () => {
	const t = useTranslate();
	const { clientId, setViewMaanualEntry, formValues, setFormValue, columnValues, resolvedDocType, resetFormValues } =
		useDocumentInbox();
	const { handleUpdate, isUpdating } = useMarkAsReady();

	const form = useForm<VehicleInsuranceFieldType>({
		resolver: zodResolver(VehicleInsuranceSchema),
	});
	const {
		formState: { errors },
		control,
		reset,
		setError,
		clearErrors,
	} = form;

	const values = form.watch();
	const ocrData = columnValues?.ocr_data?.extracted_data || {};
	const formData = columnValues?.form || {};

	// ---- seed form from OCR / saved form data ----
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset only when columnValues changes, mirroring the original app hook
	useEffect(() => {
		if (Object.keys(ocrData).length === 0 && Object.keys(formData).length === 0) return;

		reset({
			unique_policy_no: ocrData.policy_number || formData?.policy_number || "",
			policy_issue_date: safeDate(ocrData.issue_date || formData?.issue_date),
			company_name: ocrData.company_name || ocrData?.insurer || formData?.insurance_company || "",
			coverage_start_date: safeDate(ocrData.start_date || formData?.coverage_start),
			coverage_end_date: safeDate(ocrData.end_date || formData?.coverage_end),
			policy_holder_name: ocrData.policyholder_name || formData?.policyholder_name || "",
			rfc: ocrData.rfc || formData?.rfc || "",
			address: ocrData.address || formData?.address || "",
			item: ocrData.clause || formData?.clause || "",
		});
	}, [columnValues]);

	// ---- handlers ----
	const handleClose = () => {
		setViewMaanualEntry(false);
		reset();
		resetFormValues();
	};

	const handleSubmit = async () => {
		// ── date validation ──────────────────────────────────────────────────
		let hasDateError = false;

		const dateFields = [
			{
				field: "policy_issue_date",
				value: values.policy_issue_date,
				required: false,
			},
			{
				field: "coverage_start_date",
				value: values.coverage_start_date,
				required: true,
			},
			{
				field: "coverage_end_date",
				value: values.coverage_end_date,
				required: true,
			},
		] as const;

		clearErrors(["policy_issue_date", "coverage_start_date", "coverage_end_date"]);

		for (const { field, value, required } of dateFields) {
			if (required && !value) {
				setError(field, { message: "This field is required" });
				hasDateError = true;
			} else if (!isValidDate(value)) {
				setError(field, { message: "Invalid date" });
				hasDateError = true;
			}
		}

		if (hasDateError) return;
		// ─────────────────────────────────────────────────────────────────────

		const req = {
			id: columnValues?.id || "",
			form: {
				client_id: clientId,
				address: values?.address,
				coverage_end: safeFormatDate(values.coverage_end_date),
				coverage_start: safeFormatDate(values.coverage_start_date),
				insurance_company: values?.company_name,
				policy_number: values?.unique_policy_no,
				policyholder_name: values?.policy_holder_name,
				rfc: values?.rfc,
				issue_date: safeFormatDate(values.policy_issue_date),
				clause: values?.item,
				vehicle_id: formValues.vehicle ?? "",
				file_id: columnValues?.file_id || "",
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
					policy_number: values?.unique_policy_no,
					clause: values?.item,
					issue_date: safeFormatDate(values.policy_issue_date),
					start_date: safeFormatDate(values.coverage_start_date),
					end_date: safeFormatDate(values.coverage_end_date),
					rfc: values?.rfc,
					policyholder_name: values?.policy_holder_name,
					vin: formValues.selectedVehicle?.vin || "",
				},
			},
		};

		await handleUpdate(req, handleClose);
	};

	const isSubmitDisabled =
		!values.unique_policy_no ||
		!values.company_name ||
		!values.coverage_start_date ||
		!values.coverage_end_date ||
		!values.policy_holder_name ||
		!values.rfc ||
		isUpdating;

	return {
		t,
		control,
		errors,
		formValues,
		columnValues,
		setFormValue,
		isUpdating,
		isSubmitDisabled,
		handleClose,
		handleSubmit,
	};
};
