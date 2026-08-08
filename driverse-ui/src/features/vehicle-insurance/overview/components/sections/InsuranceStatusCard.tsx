/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/features/vehicle-park/vehicles/details/insurance/overview/components/sections/InsuranceStatusCard.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/features/vehicle-parks/vehicles/details/insurance/overview/components/sections/InsuranceStatusCard.tsx
 * @status adopted-B
 * @notes B adopted for the permission check: A gated "Add Policy" on a `?archived=true` URL query param
 *        (`useSearchParams`), which only makes sense wired into one specific route. B gates it on a real
 *        permission code (`useCan("business.action.add_insurance_policy")`, its zustand `permissionStore`).
 *        Decoupled further: B's app-specific `useCan` becomes the library's own `usePermission` from
 *        `@/hooks`, fed the `permissions` array the app passes into `VehicleInsuranceProvider` — so this
 *        module has no permission-store dependency of its own, app or library.
 */

import Chip, { type ChipVariant } from "@/components/chip";
import { Header } from "@/components/page-header/header";
import { usePermission } from "@/hooks";
import { useTranslate } from "@/i18n/translate";
import { Button, Card } from "antd";
import type { FC } from "react";
import { Fragment } from "react/jsx-runtime";
import { useVehicleInsurance } from "../../../provider";
import type { InsurancePolicy } from "../../../types";

export type InsuranceStatusCardProps = {
	policy?: InsurancePolicy;
	daysRemaining: number;
	onAddPolicy: () => void;
};

export const InsuranceStatusCard: FC<InsuranceStatusCardProps> = ({ policy, daysRemaining, onAddPolicy }) => {
	const t = useTranslate();
	const { permissions } = useVehicleInsurance();
	const status = policy?.status;

	const { has } = usePermission(permissions);
	const canAddInsurance = has("business.action.add_insurance_policy");

	const getDaysText = () => {
		if (daysRemaining <= 0) {
			return t("sys.forms.insuranceStatus.expiredText");
		}
		return daysRemaining === 1
			? t("sys.forms.insuranceStatus.daysLeft", { days: daysRemaining })
			: t("sys.forms.insuranceStatus.daysLeftPlural", { days: daysRemaining });
	};

	return (
		<Card>
			<div className="flex flex-col gap-3">
				<div className="flex justify-between">
					<Header title={t("sys.forms.insuranceStatus.title")} />

					<Chip
						variant={(status as ChipVariant) || "warning"}
						label={status ? status : t("sys.forms.insuranceStatus.missing")}
					/>
				</div>

				{policy?.coverage_end &&
					(policy?.status === "expired" || policy.status === "EXPIRED" ? (
						<b>{t("sys.forms.insuranceStatus.expired")}</b>
					) : (
						<Fragment>
							<p>
								{t("sys.forms.insuranceStatus.expiresOn", {
									date: policy.coverage_end?.split("T")?.[0],
									daysText: getDaysText(),
								})}
							</p>

							<p>
								{t("sys.forms.insuranceStatus.nextRenewal", {
									date: policy.coverage_end?.split("T")?.[0],
								})}
							</p>
						</Fragment>
					))}
				{canAddInsurance && (
					<Button type="primary" size="large" style={{ width: 220 }} onClick={onAddPolicy}>
						{t("sys.forms.insuranceStatus.addPolicy")}
					</Button>
				)}
			</div>
		</Card>
	);
};
