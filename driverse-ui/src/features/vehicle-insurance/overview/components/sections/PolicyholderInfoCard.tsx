/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/sections/PolicyholderInfoCard.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/sections/PolicyholderInfoCard.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. `InsurancePolicy` now comes from the module's
 *        `types.ts` instead of the app's root `#/entity`.
 */

import InfoField from "@/components/info-field";
import { Header } from "@/components/page-header/header";
import { useTranslate } from "@/i18n/translate";
import { Card } from "antd";
import type { FC } from "react";
import type { InsurancePolicy } from "../../../types";
import { policyholder } from "../../data";

export type PolicyholderInfoCardProps = {
	policy?: InsurancePolicy;
};

export const PolicyholderInfoCard: FC<PolicyholderInfoCardProps> = ({ policy }) => {
	const t = useTranslate();

	if (!policy) return null;

	return (
		<Card>
			<div className="flex flex-col gap-3">
				<Header title={t("sys.forms.insurance.policyholder.title")} />

				<div className="grid grid-cols-2 gap-y-4 gap-x-32">
					{policyholder(policy, t).map((item) => (
						<InfoField key={item.label} {...item} />
					))}
				</div>
			</div>
		</Card>
	);
};
