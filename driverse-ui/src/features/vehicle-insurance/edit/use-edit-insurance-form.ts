/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useEditInsuranceForm.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/hooks/useEditInsuranceForm.tsx
 * @status decoupled
 * @notes Not one of the 14 listed files, but `edit/index.tsx` needs it to function. A and B differ only
 *        in import order; base is A.
 *        Transport swap: `useEditInsurancePolicy` (an Apollo mutation hook) becomes `dataSource.updatePolicy`;
 *        `useDeleteFile` (an app hook wrapping `useApiResource`) becomes `dataSource.deletePolicyFile`;
 *        `apolloClient.refetchQueries(["GetVehicleById"])` becomes `dataSource.refetchVehicle()`;
 *        `useClientId()` (reads a JWT claim) becomes the injected `clientId` from `useVehicleInsurance()`;
 *        `useCompliceDocsUpload` becomes the module's `useInsuranceDocumentUpload`.
 */

import { toast } from "@/components/toast";
import { useTranslate } from "@/i18n/translate";
import { normalizeFiles } from "@/utils";
import { Form } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useInsuranceDocumentUpload } from "../hooks/use-insurance-document-upload";
import { useVehicleInsurance } from "../provider";
import type { InsurancePolicy } from "../types";

type UseEditInsuranceFormProps = {
	open: boolean;
	data?: InsurancePolicy;
	onOpen?: (open: boolean) => void;
};

export const useEditInsuranceForm = ({ open, data, onOpen }: UseEditInsuranceFormProps) => {
	const t = useTranslate();
	const [form] = Form.useForm();
	const { dataSource, clientId } = useVehicleInsurance();

	const [editing, setEditing] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const {
		Dragger,
		props: draggerProps,
		preview,
		fileName,
		reset,
		shouldShowExisting,
		selectedFile,
		handleCancel: resetUpload,
		isUploading,
		processUpload,
	} = useInsuranceDocumentUpload(dataSource);

	const mappedFiles = normalizeFiles(data?.file);
	const hasFile = mappedFiles.length > 0;

	const onFinish = async (values: any) => {
		if (!data?.id) return;

		// If a new file was selected, upload it first and capture the returned fileId
		let uploadedFileId = (data?.file as any)?.id || "";
		if (selectedFile) {
			const uploadResp = await processUpload(
				{
					customerId: clientId,
					category: "insurance",
					uniqueId: `${data.id}`,
					documentGroup: "insurance",
					split: false,
					showToast: false,
				},
				selectedFile,
			);
			uploadedFileId = uploadResp?.detail?.files?.[0]?.id || uploadedFileId;
		}

		setEditing(true);
		try {
			const resp = await dataSource.updatePolicy(data.id, {
				address: values.address,
				client_id: clientId,
				coverage_end: values.coverageEnd ? dayjs(values.coverageEnd).format("YYYY-MM-DD") : "",
				coverage_start: values.coverageStart ? dayjs(values.coverageStart).format("YYYY-MM-DD") : "",
				insurance_company: values.insuranceCompany,
				policy_number: values.policyNumber,
				policyholder_name: values.policyholderName,
				rfc: values.rfc,
				issue_date: values.policyIssueDate ? dayjs(values.policyIssueDate).format("YYYY-MM-DD") : "",
				clause: values.item || "",
				...(uploadedFileId && { file_id: uploadedFileId }),
			});
			if (resp?.status === 200) {
				toast.success(resp?.message || "Insurance policy updated successfully");
				onOpen?.(false);
				await dataSource.refetchVehicle?.();
			}
		} finally {
			setEditing(false);
		}
	};

	const handleDeleteFile = async (callBack?: () => void) => {
		const [file] = mappedFiles;
		if (!file?.bucketId) return;

		setDeleting(true);
		try {
			const response = await dataSource.deletePolicyFile({
				bucketId: file.bucketId,
				fileId: (data?.file as any)?.id,
			});

			if (response?.status === 200) {
				if (response.detail.successCount > 0) {
					toast.success("File deleted successfully");
				}
				await dataSource.refetchVehicle?.();
				if (response.detail.failureCount > 0) {
					toast.error("Failed to delete file");
				}
			}
		} finally {
			setDeleting(false);
		}

		callBack?.();
	};

	const handleCancel = () => {
		resetUpload();
		onOpen?.(false);
	};

	useEffect(() => {
		if (open && data) {
			form.setFieldsValue({
				insuranceCompany: data.insurance_company,
				policyNumber: data.policy_number,
				item: data.clause,
				policyIssueDate: data.issue_date ? dayjs(data.issue_date) : null,
				coverageStart: data.coverage_start ? dayjs(data.coverage_start) : null,
				coverageEnd: data.coverage_end ? dayjs(data.coverage_end) : null,
				policyholderName: data.policyholder_name,
				rfc: data.rfc,
				address: data.address,
			});
		}
	}, [open, data, form]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: resetUpload is recreated every render; adding it would re-run this every render instead of only on open/form changes, same deps list the apps used.
	useEffect(() => {
		if (!open) {
			form.resetFields();
			resetUpload();
		}
	}, [open, form]);

	return {
		t,
		form,
		clientId,
		mappedFiles,
		hasFile,
		editing,
		deleting,
		isUploading,
		Dragger,
		draggerProps,
		preview,
		fileName,
		reset,
		shouldShowExisting,
		selectedFile,
		onFinish,
		handleDeleteFile,
		handleCancel,
	};
};
