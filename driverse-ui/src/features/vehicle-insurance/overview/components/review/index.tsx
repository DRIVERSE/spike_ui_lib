/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/review/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/review/index.tsx
 * @status merged
 * @notes A and B differ only in the path inside a dead commented-out import. Base is A; `InfoField` now
 *        comes from the library (`@/components/info-field`) and `useInsuranceStore` from the module's
 *        `useVehicleInsurance()`. Not wired into any of the other 13 files (both apps leave the
 *        multi-step wizard's "review" step unused — `add-policy-form` renders policy-info + policy-holder
 *        directly, one screen, no step 3), kept because it was in the file list.
 */

import InfoField from "@/components/info-field";
import { Header } from "@/components/page-header/header";
import { Card, Divider } from "antd";
import dayjs from "dayjs";
import type { FC } from "react";
import { useVehicleInsurance } from "../../../provider";

const ReviewInsurancePolicy: FC = () => {
	const { formValues } = useVehicleInsurance();

	return (
		<div className="flex flex-col gap-3">
			<Card>
				<div className="flex flex-col gap-3">
					<Header title="Review & Confirm" />
					<p className="text-base font-medium">Policy Information</p>
					<div className="grid grid-cols-2 gap-y-4 gap-x-32">
						<InfoField label="Insurance Company" value={formValues?.company_name ?? ""} />
						<InfoField label="Policy Number" value={formValues?.unique_policy_no ?? ""} />
						<InfoField label="Item" value={formValues?.item ?? ""} />
						<InfoField
							label="Coverage Period"
							value={`${
								formValues.coverage_start_date ? dayjs(formValues.coverage_start_date).format("YYYY-MM-DD") : ""
							} - ${formValues.coverage_end_date ? dayjs(formValues.coverage_end_date).format("YYYY-MM-DD") : ""}`}
						/>
					</div>
					<Divider />
					<p className="text-base font-medium">Policyholder Information</p>
					<div className="grid grid-cols-2 gap-y-4 gap-x-32">
						<InfoField label="Name" value={formValues?.policy_holder_name ?? ""} />
						<InfoField label="RFC" value={formValues?.rfc ?? ""} />
						<InfoField label="Address" value={formValues?.address ?? ""} />
					</div>
				</div>
			</Card>
		</div>
	);
};
export default ReviewInsurancePolicy;
