/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/hooks/useAddInsurance.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/hooks/useAddInsurance.tsx
 * @status decoupled
 * @notes Not one of the 14 listed files, but `add-policy-form/form.tsx` and `policy-info`/`policy-holder`
 *        all call it. A and B are functionally identical (B additionally reads `clientId` from
 *        `useClientId()` with a hard-coded fallback UUID instead of the vehicle's own `client_id` — an
 *        app-environment default that means nothing here); the merge keeps A's form-building logic.
 *        Both apps also carry a large commented-out first version of this hook (an early Apollo
 *        `useMutation` draft); dropped as dead code.
 *        Transport swap: `useApiResource` + `@tanstack/react-query`'s `useMutation` (the POST to
 *        `VITE_COMPLIANCE_URL/api/v1/insurance-policies`) becomes `dataSource.createPolicy`;
 *        `apolloClient.refetchQueries(["GetVehicleById"])` becomes `dataSource.refetchVehicle()`;
 *        `useRouter().push(...)` becomes the injected `navigation.push`. `formValues`/`resetAll`/`clientId`
 *        come from `useVehicleInsurance()` instead of `useInsuranceStore`/`useVehicleDetailsResponseStore`.
 */

import { toast } from "@/components/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RcFile } from "antd/es/upload";
import dayjs, { type Dayjs } from "dayjs";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useVehicleInsurance } from "../provider";
import { type VehicleInsuranceFieldType, VehicleInsurancePolicyHolderSchema, VehicleInsuranceSchema } from "../schema";
import type { CreateInsurancePolicyPayload } from "../types";
import type { InsuranceDocumentUpload } from "./use-insurance-document-upload";

const formatDate = (date?: Dayjs | string | null): string | null => (date ? dayjs(date).format("YYYY-MM-DD") : null);

const buildInsurancePayload = (
	formValues: ReturnType<typeof useVehicleInsurance>["formValues"],
	clientId: string,
	vehicleId: string | undefined,
	fileId?: string | null,
): CreateInsurancePolicyPayload => ({
	address: formValues?.address,
	client_id: clientId,
	coverage_end: formatDate(formValues.coverage_end_date),
	coverage_start: formatDate(formValues.coverage_start_date),
	insurance_company: formValues?.company_name,
	policy_number: formValues?.unique_policy_no,
	policyholder_name: formValues?.policy_holder_name,
	rfc: formValues?.rfc,
	issue_date: formatDate(formValues.policy_issue_date),
	vehicle_id: vehicleId,
	clause: formValues?.item,
	...(fileId && { file_id: fileId }),
});

export const useAddInsurancePolicy = (upload?: InsuranceDocumentUpload) => {
	const { dataSource, navigation, clientId, vehicleId, formValues, resetAll } = useVehicleInsurance();
	const [loadingInsurance, setLoadingInsurance] = useState(false);

	const form = useForm<VehicleInsuranceFieldType>({ resolver: zodResolver(VehicleInsuranceSchema) });
	const policyHolderForm = useForm<VehicleInsuranceFieldType>({
		resolver: zodResolver(VehicleInsurancePolicyHolderSchema),
	});

	const handleFileUpload = async (selectedFile: RcFile): Promise<string | null> => {
		if (!upload) {
			toast.error("Upload service not available");
			return null;
		}

		try {
			const uploadResponse = await upload.processUpload(
				{
					customerId: clientId,
					category: "insurance",
					uniqueId: vehicleId ?? "",
					documentGroup: "insurance",
					split: false,
					showToast: false,
				},
				selectedFile,
			);

			const uploadedFileId = uploadResponse?.detail?.files?.[0]?.id;
			if (uploadResponse?.status !== 200 || !uploadedFileId) {
				toast.error("Failed to upload insurance document.");
				return null;
			}
			return uploadedFileId;
		} catch (error) {
			toast.error("Error uploading document.");
			console.error("Upload error:", error);
			return null;
		}
	};

	const handleCreatePolicy = async (selectedFile: RcFile | null) => {
		if (!clientId) {
			toast.error("Client ID is required");
			return;
		}

		let uploadedFileId: string | null = null;
		if (selectedFile && upload) {
			uploadedFileId = await handleFileUpload(selectedFile);
			if (!uploadedFileId) return;
		}

		setLoadingInsurance(true);
		try {
			const resp = await dataSource.createPolicy(
				buildInsurancePayload(formValues, clientId, vehicleId, uploadedFileId),
			);
			if (resp?.status === 200) {
				toast.success(resp?.message ?? "Insurance created successfully", { position: "top-center" });
				resetAll();
				await dataSource.refetchVehicle?.();
				navigation.push(`/vehicle-park/vehicles/${vehicleId}`);
			} else {
				toast.error(resp?.message ?? "Insurance created successfully", { position: "top-center" });
			}
		} catch (err: any) {
			toast.error(err?.response?.data?.detail || err?.response?.data?.errors?.[0]?.message || err?.message, {
				position: "top-center",
			});
		} finally {
			setLoadingInsurance(false);
		}
	};

	return { form, policyHolderForm, loadingInsurance, handleCreatePolicy };
};
