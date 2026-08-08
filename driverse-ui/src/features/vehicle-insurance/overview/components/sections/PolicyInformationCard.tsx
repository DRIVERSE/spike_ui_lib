/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/sections/PolicyInformationCard.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/sections/PolicyInformationCard.tsx
 * @status adopted-B
 * @notes Same call as `InsuranceStatusCard`: B's permission-code gate on the "Edit" button
 *        (`business.action.edit_insurance_policy`) replaces A's `?archived=true` query-param check.
 *        Decoupled the same way, through `usePermission` fed the injected `permissions` array.
 *        `@iconify/react`'s `Icon` is rendered through the library's `Iconify` wrapper instead.
 */

import InfoField from "@/components/info-field";
import { Header } from "@/components/page-header/header";
import { usePermission } from "@/hooks";
import { useTranslate } from "@/i18n/translate";
import Iconify from "@/icons/iconify-icon";
import { Button, Card, Divider } from "antd";
import { Fragment, Suspense, lazy, useState } from "react";
import type { FC, ReactNode } from "react";
import { useVehicleInsurance } from "../../../provider";
import type { InsurancePolicy } from "../../../types";
import { policyInfoData } from "../../data";

const EditInsuranceForm = lazy(() => import("../../../edit"));

export type PolicyInformationCardProps = {
	policy?: InsurancePolicy;
	onView: () => void;
	/** Upload UI passed from the parent (`InsuranceOverview`). */
	uploadSection: ReactNode;
};

export const PolicyInformationCard: FC<PolicyInformationCardProps> = ({ policy, onView, uploadSection }) => {
	const t = useTranslate();
	const { permissions } = useVehicleInsurance();
	const { has } = usePermission(permissions);
	const canEdit = has("business.action.edit_insurance_policy");
	const [isEdit, setIsEdit] = useState(false);

	if (!policy) return null;

	return (
		<Fragment>
			<Card>
				<div className="flex flex-col gap-3">
					<div className="flex justify-between items-center mb-6">
						<Header title={t("sys.forms.policyInformation.title")} />
						{!isEdit && canEdit && (
							<Button
								type="default"
								icon={<Iconify icon="lucide:edit" className="mt-1" />}
								onClick={() => setIsEdit(true)}
							>
								{t("Edit")}
							</Button>
						)}
					</div>

					<div className="grid grid-cols-3 gap-y-4 gap-x-32">
						{policyInfoData(policy, t).map((item) => (
							<InfoField key={item.label} {...item} />
						))}
					</div>

					<Divider />

					<div className="flex justify-between">
						<Header title={t("sys.forms.policyInformation.attachments")} />
						{Boolean(policy?.file) && (
							<Button type="primary" size="small" onClick={onView}>
								{t("sys.forms.policyInformation.view")}
							</Button>
						)}
					</div>

					{uploadSection}
				</div>
			</Card>
			<Suspense>
				<EditInsuranceForm open={isEdit} onOpen={setIsEdit} data={policy} />
			</Suspense>
		</Fragment>
	);
};
