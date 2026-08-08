/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/add-policy-form/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/add-policy-form/index.tsx
 * @status merged
 * @notes A and B differ only in import paths (the `vehicle-park` -> `vehicle-parks` rename, and B pointing
 *        `UploadInsurancePolicy` at its own DocxViewer-based component — see
 *        `../../../components/upload-insurance-document.tsx` for why A's simpler uploader was kept).
 *        Decoupled: `useParams()` -> a `vehicleId` prop; `useVehicleDetailsResponseStore` (for the title's
 *        vehicle alias/make) -> `vehicleAlias`/`vehicleMake` props; `PageHeader`'s internal `<Link
 *        to={routerLink}>` -> the injected `navigation.push` via `onBack`; `@/components/upload-option` /
 *        `useCompliceDocsUpload` -> the module's own `UploadInsuranceDocument` /
 *        `useInsuranceDocumentUpload`.
 *        This is the full "Add Policy" page reached by navigating to
 *        `/vehicle-park/vehicles/:id/add-insurance-policy` (see `InsuranceStatusCard`'s `onAddPolicy`) —
 *        not the same UI as the app's separate "add insurance" modal, which this module exposes as the
 *        `renderAddPolicyModal` render prop instead (see `overview/index.tsx`).
 */

import PageHeader from "@/components/page-header";
import type { FC } from "react";
import { UploadInsuranceDocument } from "../../../components/upload-insurance-document";
import { useInsuranceDocumentUpload } from "../../../hooks/use-insurance-document-upload";
import { useVehicleInsurance } from "../../../provider";
import { Form } from "./form";

export type AddVehicleInsurancePolicyProps = {
	vehicleId: string;
	vehicleAlias?: string;
	vehicleMake?: string;
};

const AddVehicleInsurancePolicy: FC<AddVehicleInsurancePolicyProps> = ({ vehicleId, vehicleAlias, vehicleMake }) => {
	const { dataSource, navigation } = useVehicleInsurance();
	const upload = useInsuranceDocumentUpload(dataSource);
	const name = `${vehicleAlias || ""}-${vehicleMake || ""}`;

	return (
		<>
			<PageHeader
				routerLink={`/vehicle-park/vehicles/${vehicleId}`}
				onBack={() => navigation.push(`/vehicle-park/vehicles/${vehicleId}`)}
				title={`Add Insurance Policy for ${name}`}
				description="Upload a document to auto-fill or enter details manually"
			/>

			<div className="flex justify-between gap-6 mb-5">
				<div className="basis-3/5">
					<Form upload={upload} />
				</div>
				<div className="basis-2/5">
					<UploadInsuranceDocument upload={upload} />
				</div>
			</div>
		</>
	);
};

export default AddVehicleInsurancePolicy;
