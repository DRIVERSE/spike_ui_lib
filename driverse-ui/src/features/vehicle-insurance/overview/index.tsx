/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/index.tsx
 * @status merged
 * @notes A and B differ only cosmetically (a hard-coded fallback client id specific to each app's dev
 *        tenant, `fileInfo`'s initial-state formatting, one added comment, a missing trailing newline).
 *        Base is A. All visual JSX — the status/policy-information/policyholder card stack, the two lazy
 *        modals — is verbatim.
 *        Decoupled: `useInsuranceStore` -> `useVehicleInsurance()`; `useClientId() || <hard-coded id>` ->
 *        the injected `clientId` (no fallback — the app decides what "no client" means);
 *        `useUpdateCirculationCard` (an Apollo mutation hook covering three unrelated mutations) ->
 *        just the one operation this screen uses, `dataSource.attachPolicyFile`; `useRouter`/`useParams`
 *        -> `navigation`/`vehicleId` from context. The two lazily-imported app modals —
 *        `AddInsurancePolicyModal` (QA: `@/features/vehicle-park/components/modals/add-insurance-policy`,
 *        BD: `@/features/vehicle-parks/components/modal/add-insurance-policy`) and
 *        `PreviewImageModal` (the compliance feature) — are render props (`renderAddPolicyModal`,
 *        `renderFilePreview`) supplied to `VehicleInsuranceProvider`, so this module has no lazy import
 *        pointed at either app's route tree.
 */

import { CircleLoading } from "@/components/loading";
import { normalizeFiles } from "@/utils";
import { Fragment, Suspense, useMemo, useState } from "react";
import type { FC } from "react";
import { UploadComplianceImage } from "../components/upload-compliance-image";
import { useInsuranceDocumentUpload } from "../hooks/use-insurance-document-upload";
import { usePolicyData } from "../hooks/use-policy-data";
import { useVehicleInsurance } from "../provider";
import type { Vehicle } from "../types";
import { InsuranceStatusCard } from "./components/sections/InsuranceStatusCard";
import { PolicyInformationCard } from "./components/sections/PolicyInformationCard";
import { PolicyholderInfoCard } from "./components/sections/PolicyholderInfoCard";
// import { InsuranceRemindersCard } from "./components/sections/InsuranceRemindersCard";

type Props = {
	vehicleData?: Vehicle;
	loading?: boolean;
};

export const InsuranceOverview: FC<Props> = ({ vehicleData, loading }) => {
	const {
		dataSource,
		navigation,
		clientId,
		vehicleId,
		openInsurance,
		setOpenInsurance,
		renderAddPolicyModal,
		renderFilePreview,
	} = useVehicleInsurance();

	const { policyFirstItem, daysRemaining } = usePolicyData(vehicleData);
	const upload = useInsuranceDocumentUpload(dataSource);

	const [loadingInsurancePolicy, setLoadingInsurancePolicy] = useState(false);
	const [openPreview, setOpenPreview] = useState(false);
	const [fileInfo, setFileInfo] = useState({ bucketId: "", fileName: "", contentType: "" });

	const mappedFiles = useMemo(() => normalizeFiles(policyFirstItem?.file), [policyFirstItem?.file]);

	const handleView = () => {
		const [file] = mappedFiles;
		if (!file) return;

		setFileInfo(file);
		setOpenPreview(true);
	};

	const handleUpload = async (uploadedFiles?: { id: string }[]) => {
		if (!uploadedFiles?.length || !policyFirstItem?.id) return;

		setLoadingInsurancePolicy(true);
		try {
			await dataSource.attachPolicyFile(policyFirstItem.id, uploadedFiles[0]?.id);
			await dataSource.refetchVehicle?.();
		} finally {
			setLoadingInsurancePolicy(false);
		}
	};

	if (loading) {
		return (
			<div className="flex w-full h-60 items-center justify-center">
				<CircleLoading />
			</div>
		);
	}

	return (
		<Fragment>
			<div className="flex flex-col gap-4">
				<InsuranceStatusCard
					policy={policyFirstItem}
					daysRemaining={daysRemaining}
					onAddPolicy={() => navigation.push(`/vehicle-park/vehicles/${vehicleId}/add-insurance-policy`)}
				/>

				<PolicyInformationCard
					policy={policyFirstItem}
					onView={handleView}
					uploadSection={
						<UploadComplianceImage
							data={mappedFiles}
							payload={{
								customerId: clientId,
								category: "insurance",
								uniqueId: `${vehicleData?.id ?? ""}`,
								documentGroup: "insurance",
								split: false,
							}}
							callBack={handleUpload}
							loading={loadingInsurancePolicy}
							hideChangeImage={true}
							controlled={{
								Dragger: upload.Dragger,
								props: upload.props,
								preview: upload.preview,
								fileName: upload.fileName,
								reset: upload.reset,
								shouldShowExisting: upload.shouldShowExisting,
								selectedFile: upload.selectedFile,
								handleCancel: upload.handleCancel,
								processUpload: upload.processUpload,
								isUploading: upload.isUploading,
							}}
						/>
					}
				/>

				<PolicyholderInfoCard policy={policyFirstItem} />

				{/* <InsuranceRemindersCard /> */}
			</div>

			{renderAddPolicyModal && (
				<Suspense fallback={<CircleLoading />}>
					{renderAddPolicyModal({ open: openInsurance, onOpenChange: setOpenInsurance })}
				</Suspense>
			)}

			{renderFilePreview && (
				<Suspense>
					{renderFilePreview({
						open: openPreview,
						onOpenChange: setOpenPreview,
						bucketId: fileInfo.bucketId,
						fileName: fileInfo.fileName,
						contentType: fileInfo.contentType,
					})}
				</Suspense>
			)}
		</Fragment>
	);
};
