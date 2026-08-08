/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/add-policy-form/form.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/add-policy-form/form.tsx
 * @status merged
 * @notes A and B are the same file with imports reordered and the `vehicle-park` -> `vehicle-parks`
 *        rename baked into B's paths; no functional difference. Base is A.
 *        Decoupled: `useInsuranceStore` -> `useVehicleInsurance()` (`isFormValid` is now a resolved
 *        boolean, not a getter, so `!isFormValid()` became `!isFormValid`); `useAddInsurance` -> the
 *        module's `useAddInsurancePolicy`; `CompliceDocsUpload` -> `InsuranceDocumentUpload`.
 */

import { Button } from "antd";
import type { FC } from "react";
import { useAddInsurancePolicy } from "../../../hooks/use-add-insurance-policy";
import type { InsuranceDocumentUpload } from "../../../hooks/use-insurance-document-upload";
import { useVehicleInsurance } from "../../../provider";
import InsurancePolicyHolder from "../policy-holder";
import InsurancePolicyInfo from "../policy-info";

type Props = {
	upload: InsuranceDocumentUpload;
};

export const Form: FC<Props> = ({ upload }) => {
	const { isFormValid, resetAll } = useVehicleInsurance();
	const { selectedFile, isUploading } = upload;

	const { loadingInsurance, handleCreatePolicy } = useAddInsurancePolicy(upload);
	return (
		<div className="flex flex-col gap-4  h-full">
			<InsurancePolicyInfo />
			<InsurancePolicyHolder />
			<div className="flex justify-end gap-2 mt-auto">
				<Button onClick={resetAll} disabled={loadingInsurance || isUploading}>
					Cancel
				</Button>
				<Button
					htmlType="submit"
					type="primary"
					loading={loadingInsurance || isUploading}
					disabled={!isFormValid || loadingInsurance || isUploading}
					onClick={() => handleCreatePolicy(selectedFile)}
				>
					Save Policy
				</Button>
			</div>
		</div>
	);
};
